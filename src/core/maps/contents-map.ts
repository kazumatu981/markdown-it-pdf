import { findFiles, filePathToUrl } from '../utils/path-resolver';
import { type ResolverType, type ResolverMap } from './resolver-map';
import { DefaultExtensionMap } from './extension-map';
import { type ContentsMapOptions } from '../../common/configure';
import path from 'path';

//#region constants
/**
 * default contents map options
 */
const defaultContentsMapOptions = {
    rootDir: './',
    recursive: true,
};
//#endregion

//#region types and interfaces
export interface ContentsMapEntity {
    url: string;
    resolverType: ResolverType;
    contentType: string;
    contentPath: string;
}

export interface RenderedEntity extends ContentsMapEntity {
    contents: string | Buffer;
}

//#endregion

//#region main class
export class ContentsMap extends Map<string, ContentsMapEntity> {
    //#region private fields
    private _resolver: ResolverMap;
    private _options?: ContentsMapOptions;
    //#endregion

    //#region public static methods
    public static async createInstance(
        resolverMap: ResolverMap,
        options?: ContentsMapOptions
    ): Promise<ContentsMap> {
        // create the instance
        const theInstance = new ContentsMap(resolverMap, options);
        await theInstance.refresh();
        return theInstance;
    }
    //#endregion

    //#region constructor
    private constructor(
        resolverMap: ResolverMap,
        options?: ContentsMapOptions
    ) {
        super();
        this._resolver = resolverMap;
        this._options = options;
    }
    //#endregion

    //#region public methods
    public async refresh(): Promise<void> {
        this.clear();

        const contents = await findFiles<ContentsMapEntity>(
            this._options?.rootDir ?? defaultContentsMapOptions.rootDir,
            this._options?.recursive ?? defaultContentsMapOptions.recursive,
            DefaultExtensionMap.isSupported.bind(DefaultExtensionMap),
            this.generateContentMapEntity.bind(this)
        );
        contents.forEach((entry) => {
            this.set(entry.url, entry);
        });
    }

    public getEntityUrls(resolverType?: ResolverType): string[] {
        return resolverType
            ? // if resolverType is provided, filter by resolverType.
              [...this.keys()].filter(
                  (url) =>
                      (this.get(url) as ContentsMapEntity).resolverType ===
                      resolverType
              )
            : // if resolverType is not provided, return all
              [...this.keys()];
    }

    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        const entity = this.get(filePath);
        if (!entity) {
            return;
        }
        const contentResolver = this._resolver.getResolver(entity.resolverType);
        const contents = await contentResolver(entity.contentPath);
        return { ...entity, contents };
    }
    //#endregion

    //#region private methods
    private generateContentMapEntity(filePath: string): ContentsMapEntity {
        const resolver = DefaultExtensionMap.getTypeInfo(
            path.extname(filePath)
        );
        return {
            url: filePathToUrl(
                this._options?.rootDir ?? defaultContentsMapOptions.rootDir,
                filePath
            ),
            resolverType: resolver.resolverType,
            contentType: resolver.resolvedContentType ?? resolver.contentType,
            contentPath: filePath,
        };
    }
    //#endregion
}
//#endregion
