import { findFiles, filePathToUrl } from './path-resolver';
import { type ResolverType, type ResolverMap } from './resolver-map';
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

    public static async createInstance(
        resolverMap: ResolverMap,
        contentsRoot: string,
        options?: ContentsMapOptions
    ): Promise<ContentsMap> {
        // create the instance
        const theInstance = new ContentsMap(resolverMap);

        // resolve to local resources entities in contentRoot.
        // like markdown, style, images, etc.
        const contents = await findFiles<ContentsMapEntity>(
            contentsRoot,
            options?.recursive ?? true,
            resolverMap.isSupported.bind(resolverMap),
            (filePath) => {
                const resolver = resolverMap.getTypeInfo(
                    path.extname(filePath)
                );
                return {
                    url: filePathToUrl(contentsRoot, filePath),
                    resolverType: resolver.resolverType,
                    contentType:
                        resolver.resolvedContentType ?? resolver.contentType,
                    contentPath: filePath,
                };
            }
        );

        // set into entity
        contents.forEach((entry) => {
            theInstance.set(entry.url, entry);
        });

        return theInstance;
    }

    private constructor(resolverMap: ResolverMap) {
        super();
        this._resolver = resolverMap;
    }

    public get markdownEntryUrls(): string[] {
        return [...this.keys()].filter(
            (url) =>
                (this.get(url) as ContentsMapEntity).resolverType === 'markdown'
        );
    }
    public get styleEntryUrls(): string[] {
        return [...this.keys()].filter(
            (url) =>
                (this.get(url) as ContentsMapEntity).resolverType === 'style'
        );
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
}
