import { type MarkdownItRender } from './markdown-it-render';
import fsPromises from 'fs/promises';
export type ContentType = 'markdown' | 'style' | 'unknown';
export type ContentsResolverFunction = (filePath: string) => Promise<string>;

export interface ContentsResolver {
    mediaType: string;
    resolve: ContentsResolverFunction;
}

export interface ContentsMapEntity {
    type: ContentType;
    contentPath: string;
}

export interface RenderedEntity extends ContentsMapEntity {
    mediaType: string;
    contents: string;
}

export class ContentsMap extends Map<string, ContentsMapEntity> {
    private _resolver: Map<ContentType, ContentsResolver>;
    private _render: MarkdownItRender;
    public constructor(render: MarkdownItRender) {
        super();
        this._render = render;
        this._resolver = new Map<ContentType, ContentsResolver>()
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

    private async _markdownResolver(filePath: string): Promise<string> {
        return this._render.renderFromFileAsync(filePath);
    }
    private async _simpleResolver(filePath: string): Promise<string> {
        return fsPromises.readFile(filePath, 'utf8');
    }
}
