import { type MarkdownItRender } from './markdown-it-render';
import { findFiles, filePathToUrl } from './path-resolver';
import fsPromises from 'fs/promises';
export type ContentType = 'markdown' | 'style' | 'unknown';
export type ContentsResolverFunction = (filePath: string) => Promise<string>;

export interface ContentsResolver {
    mediaType: string;
    resolve: ContentsResolverFunction;
}

export interface ContentsMapEntity {
    url: string;
    type: ContentType;
    contentPath: string;
}

export interface RenderedEntity extends ContentsMapEntity {
    mediaType: string;
    contents: string;
}

export interface ContentsMapOptions {
    recursive?: boolean;
    externalUrls?: string[];
}
export class ContentsMap extends Map<string, ContentsMapEntity> {
    private _resolver: Map<ContentType, ContentsResolver>;
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
            (name) => name.endsWith('.md') || name.endsWith('.css'),
            (filePath) => {
                if (filePath.endsWith('.md')) {
                    return {
                        url: filePathToUrl(contentsRoot, filePath),
                        type: 'markdown',
                        contentPath: filePath,
                    };
                } else if (filePath.endsWith('.css')) {
                    return {
                        url: filePathToUrl(contentsRoot, filePath),
                        type: 'style',
                        contentPath: filePath,
                    };
                } else {
                    return {
                        url: filePathToUrl(contentsRoot, filePath),
                        type: 'unknown',
                        contentPath: filePath,
                    };
                }
            }
        );

        // set into entity
        contents.forEach((entry) => {
            theInstance.set(entry.url, entry);
        });

        // add into internalUrls
        const internalUrls = contents
            .filter((entry) => entry.type === 'style')
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
            (url) => this.get(url)?.type === 'markdown'
        );
    }

    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        const entity = this.get(filePath);
        if (!entity) {
            return;
        }
        const contentResolver = this._resolver.get(entity.type);
        if (!contentResolver) {
            return;
        }
        const mediaType = contentResolver.mediaType;
        const contents = await contentResolver.resolve(entity.contentPath);
        return { ...entity, contents, mediaType };
    }

    //#region private methods
    private generateDefaultResolvers(): Map<ContentType, ContentsResolver> {
        // add default resolvers
        return new Map<ContentType, ContentsResolver>()
            .set('markdown', {
                mediaType: 'text/html',
                resolve: this._markdownResolver.bind(this),
            })
            .set('style', {
                mediaType: 'text/css',
                resolve: this._simpleResolver.bind(this),
            })
            .set('unknown', {
                mediaType: 'text/plain',
                resolve: this._simpleResolver.bind(this),
            });
    }
    private async _markdownResolver(filePath: string): Promise<string> {
        return this._render.renderFromFileAsync(filePath);
    }
    private async _simpleResolver(filePath: string): Promise<string> {
        return fsPromises.readFile(filePath, 'utf8');
    }
    //#endregion
}
