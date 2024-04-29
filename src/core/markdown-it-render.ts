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

    /**
     * Adds the given URLs to the list of internal styles for this instance.
     *
     * @param {string[]} urls - The URLs of the styles to add.
     * @return {this} - Returns the current instance for method chaining.
     */
    public addStyles(urls: string[]): this {
        this._styles.internalUrls = urls;
        return this;
    }

    /**
     * Sets the external style URLs of this instance.
     *
     * @param {string[]} urls - The URLs to set as external styles.
     * @return {this} - Returns the current instance for method chaining.
     */
    public addExternalStyles(urls: string[]): this {
        this._styles.externalUrls = urls;
        return this;
    }

    /**
     * Uses the provided plugin with optional parameters.
     *
     * @param {MarkdownIt.PluginWithParams} plugin - The plugin to use.
     * @param {any[]} params - Optional parameters for the plugin.
     * @return {this} The MarkdownItRender instance for chaining.
     */
    public use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this {
        this._md.use(plugin, ...params);
        return this;
    }

    /**
     * Renders the given markdown string into HTML.
     *
     * @param {string} markdown - The markdown string to render.
     * @return {string} The rendered HTML string.
     */
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
    /**
     * Asynchronously renders a markdown file to HTML.
     *
     * @param {string} markdownFilePath - The path to the markdown file.
     * @return {Promise<string>} A promise that resolves to the rendered HTML.
     */
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
    /**
     * Generates style tag based on the given URL.
     * @param {string} stylePath css file path
     * @returns {string} generated style tag
     */
    private static generateStyleTag(stylePath: string): string {
        return `<link rel="stylesheet" type="text/css" href="${stylePath}">`;
    }
    /**
     * Generates style tags based on the given internal and external URLs.
     *
     * @param {string[]} internalUrls - An optional array of internal URLs.
     * @param {string[]} externalUrls - An optional array of external URLs.
     * @return {string} The generated style tags as a string.
     */
    private static generateStyleTags(
        internalUrls?: string[],
        externalUrls?: string[]
    ): string {
        return (
            (internalUrls?.map(MarkdownItRender.generateStyleTag).join('\n') ??
                '') +
            (externalUrls?.map(MarkdownItRender.generateStyleTag).join('\n') ??
                '')
        );
    }
    //#endregion
    //#endregion
}
