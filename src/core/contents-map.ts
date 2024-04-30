import { type MarkdownItRender } from './markdown-it-render';
import { findFiles, filePathToUrl } from './path-resolver';
import { type ResolverType, isSupported, getResolver } from './resolver-map';
import fsPromises from 'fs/promises';
import path from 'path';
export type ContentsResolverFunction = (
    filePath: string
) => Promise<string | Buffer>;

export interface ContentsResolver {
    mediaType: string;
    resolve: ContentsResolverFunction;
}

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
    externalUrls?: string[];
}
export class ContentsMap extends Map<string, ContentsMapEntity> {
    private _resolver: Map<ResolverType, ContentsResolverFunction>;
    private _render: MarkdownItRender;

    public static async createInstance(
        render: MarkdownItRender,
        contentsRoot: string,
        options?: ContentsMapOptions
    ): Promise<ContentsMap> {
        // create the instance
        const theInstance = new ContentsMap(render);

        // resolve to entity
        const contents = await findFiles<ContentsMapEntity>(
            contentsRoot,
            options?.recursive ?? true,
            isSupported,
            (filePath) => {
                const resolver = getResolver(path.extname(filePath));
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

        // add into internalUrls
        const internalUrls = contents
            .filter((entry) => entry.contentType === 'text/css')
            .map((kv) => kv.url);
        render.addStyles(internalUrls);
        // add into externalUrls
        render.addExternalStyles(options?.externalUrls ?? []);

        return theInstance;
    }

    private constructor(render: MarkdownItRender) {
        super();
        this._render = render;
        this._resolver = this.generateDefaultResolvers();
    }

    public get markdownEntryUrls(): string[] {
        return [...this.keys()].filter(
            (url) => this.get(url)?.resolverType === 'markdown'
        );
    }

    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        const entity = this.get(filePath);
        if (!entity) {
            return;
        }
        const contentResolver = this._resolver.get(entity.resolverType);
        if (!contentResolver) {
            return;
        }
        const contents = await contentResolver(entity.contentPath);
        return { ...entity, contents };
    }

    //#region private methods
    private generateDefaultResolvers(): Map<
        ResolverType,
        ContentsResolverFunction
    > {
        // add default resolvers
        return new Map<ResolverType, ContentsResolverFunction>()
            .set('markdown', this._markdownResolver.bind(this))
            .set('style', this._plainTextResolver.bind(this))
            .set('plainText', this._plainTextResolver.bind(this))
            .set('binary', this._binaryResolver.bind(this));
    }
    private async _markdownResolver(filePath: string): Promise<string> {
        return this._render.renderFromFileAsync(filePath);
    }
    private async _plainTextResolver(filePath: string): Promise<string> {
        return fsPromises.readFile(filePath, 'utf8');
    }
    private async _binaryResolver(filePath: string): Promise<Buffer> {
        return fsPromises.readFile(filePath);
    }
    //#endregion
}
