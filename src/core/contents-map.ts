import { findFiles, filePathToUrl } from './path-resolver';
import {
    type ResolverType,
    type ResolverMap,
    DefaultExtensionMap,
} from './resolver-map';
import path from 'path';

export interface ContentsMapEntity {
    url: string;
    resolverType: ResolverType;
    contentType: string;
    contentPath: string;
}

export interface RenderedEntity extends ContentsMapEntity {
    contents: string | Buffer;
}

export interface ContentsMapOptions {
    recursive?: boolean;
}
export class ContentsMap extends Map<string, ContentsMapEntity> {
    private _resolver: ResolverMap;
    private _contentsRoot: string;
    private _options?: ContentsMapOptions;

    public static async createInstance(
        resolverMap: ResolverMap,
        contentsRoot: string,
        options?: ContentsMapOptions
    ): Promise<ContentsMap> {
        // create the instance
        const theInstance = new ContentsMap(resolverMap, contentsRoot, options);
        await theInstance.refresh();
        return theInstance;
    }

    private constructor(
        resolverMap: ResolverMap,
        contentsRoot: string,
        options?: ContentsMapOptions
    ) {
        super();
        this._resolver = resolverMap;
        this._contentsRoot = contentsRoot;
        this._options = options;
    }

    public async refresh(): Promise<void> {
        this.clear();

        const contents = await findFiles<ContentsMapEntity>(
            this._contentsRoot,
            this._options?.recursive ?? true,
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

    private generateContentMapEntity(filePath: string): ContentsMapEntity {
        const resolver = DefaultExtensionMap.getTypeInfo(
            path.extname(filePath)
        );
        return {
            url: filePathToUrl(this._contentsRoot, filePath),
            resolverType: resolver.resolverType,
            contentType: resolver.resolvedContentType ?? resolver.contentType,
            contentPath: filePath,
        };
    }
}
