import { MarkdownItRender } from './markdown-it-render';
import fsPromises from 'fs/promises';
export type ContentType = 'markdown' | 'style';
export type ContentsResolverFunction = (filePath: string) => Promise<string>;

export class ContentsResolver extends Map<
    ContentType,
    ContentsResolverFunction
> {
    private _render: MarkdownItRender;
    public constructor(render: MarkdownItRender) {
        super();
        this._render = render;
        this.set('markdown', async (filePath) => {
            return this._render.renderFromFileAsync(filePath);
        });
        this.set('style', async (filePath) => {
            return fsPromises.readFile(filePath, 'utf8');
        });
    }

    public static resolveMediaType(contentType: ContentType): string{
        switch (contentType) {
            case 'markdown':
                return 'text/html';
            case 'style':
                return 'text/css';
            default:
                return 'text/plain';
        }
    }
    public async resolve(type: ContentType, filePath: string): Promise<string> {
        const resolver = this.get(type);
        if (!resolver) {
            throw new Error(`Unsupported contents type: ${type}`);
        }
        return resolver(filePath);
    }
}
