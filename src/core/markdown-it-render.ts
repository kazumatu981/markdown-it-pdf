import MarkdownIt from 'markdown-it';
import fsPromises from 'fs/promises';

export interface MarkdownItRenderOptions {
    styleFilePaths?: string[];
    externalStylesUrls?: string[];
}

export class MarkdownItRender {
    private _md: MarkdownIt = new MarkdownIt();
    private _options: MarkdownItRenderOptions;

    public constructor(options?: MarkdownItRenderOptions) {
        this._options = options ?? {};
    }

    public use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this {
        this._md.use(plugin, ...params);
        return this;
    }

    public render(markdown: string): string {
        const htmlBody = this._md.render(markdown);
        const styleTags = MarkdownItRender.generateStyleTags(
            this._options.styleFilePaths,
            this._options.externalStylesUrls
        );
        return MarkdownItRender.htmlTemplate
            .replace(MarkdownItRender.styles, styleTags)
            .replace(MarkdownItRender.contents, htmlBody);
    }
    public async renderFromFileAsync(
        markdownFilePath: string
    ): Promise<string> {
        const markdown = await fsPromises.readFile(markdownFilePath, 'utf8');
        return this.render(markdown);
    }

    //#region private members
    //#region Static Variables
    private static styles = '<!-- [[[STYLES]]] -->';
    private static contents = '<!-- [[[CONTENTS]]] -->';

    private static htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    ${MarkdownItRender.styles}
</head>
<body>
    ${MarkdownItRender.contents}
</body>`;
    //#endregion

    //#region Static Methods
    private static generateStyleTag(stylePath: string): string {
        return `<link rel="stylesheet" href="${stylePath}">`;
    }
    private static generateStyleTags(
        styleFilePaths?: string[],
        externalStylesUrls?: string[]
    ): string {
        return (
            (styleFilePaths
                ?.map(MarkdownItRender.generateStyleTag)
                .join('\n') ?? '') +
            (externalStylesUrls
                ?.map(MarkdownItRender.generateStyleTag)
                .join('\n') ?? '')
        );
    }
    //#endregion
    //#endregion
}
