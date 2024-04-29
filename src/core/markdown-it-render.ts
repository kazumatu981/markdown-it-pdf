import MarkdownIt from 'markdown-it';
import fsPromises from 'fs/promises';

export interface Styles {
    internalUrls: string[];
    externalUrls: string[];
}

export class MarkdownItRender {
    private _md: MarkdownIt = new MarkdownIt();
    private _styles: Styles = {
        internalUrls: [],
        externalUrls: [],
    };

    public addStyles(urls: string[]): this {
        this._styles.internalUrls = urls;
        return this;
    }

    public addExternalStyles(urls: string[]): this {
        this._styles.externalUrls = urls;
        return this;
    }

    public use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this {
        this._md.use(plugin, ...params);
        return this;
    }

    public render(markdown: string): string {
        const htmlBody = this._md.render(markdown);
        const styleTags = MarkdownItRender.generateStyleTags(
            this._styles.internalUrls,
            this._styles.externalUrls
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
        internalUrls?: string[],
        externalUrls?: string[]
    ): string {
        return (
            (internalUrls
                ?.map(MarkdownItRender.generateStyleTag)
                .join('\n') ?? '') +
            (externalUrls
                ?.map(MarkdownItRender.generateStyleTag)
                .join('\n') ?? '')
        );
    }
    //#endregion
    //#endregion
}
