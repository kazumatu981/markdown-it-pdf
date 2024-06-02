import { type Logger } from '../../common';
import { type FileRender } from './file-render';
import { defaultTemplate } from './defaultTemplate';

import MarkdownIt from 'markdown-it';
import fsPromises from 'fs/promises';
import Handlebars from 'handlebars';
// TODO support Highlight.js
// TODO support Template engine.
// TODO support user custom plugins on options.

interface RenderedPageModel {
    styles: string[];
    body: string;
}

/**
 * The implementation of the render function for markdown files.
 */
export class MarkdownItRender extends MarkdownIt implements FileRender {
    public _logger?: Logger;
    private internalUrls: Array<string> = [];
    private externalUrls: Array<string> = [];
    private template: string = defaultTemplate;
    private templateEngine: Handlebars.TemplateDelegate<RenderedPageModel> =
        Handlebars.compile(defaultTemplate);

    /**
     * Adds the given URLs to the list of internal styles for this instance.
     *
     * @param {string[]} urls - The URLs of the styles to add.
     * @return {this} - Returns the current instance for method chaining.
     */
    public addStyles(urls: string[]): this {
        this.internalUrls.push(...urls);
        return this;
    }

    /**
     * Sets the external style URLs of this instance.
     *
     * @param {string[]} urls - The URLs to set as external styles.
     * @return {this} - Returns the current instance for method chaining.
     */
    public addExternalStyles(urls: string[]): this {
        this.externalUrls.push(...urls);
        return this;
    }

    /**
     * Loads the template from the given file path.
     *
     * @param {string} templatePath - The path to the template file.
     * @return {Promise<this>} - A promise that resolves to the current instance.
     */
    public async loadTemplateFrom(templatePath?: string): Promise<this> {
        // Read the template file as a string.
        if (templatePath) {
            this.template = await fsPromises.readFile(templatePath, 'utf8');
        } else {
            this.template = defaultTemplate;
        }
        this.templateEngine = Handlebars.compile<RenderedPageModel>(
            this.template
        );

        // Log the loaded template.
        this._logger?.debug(`template: %o`, this.template);

        // Return the current instance.
        return this;
    }

    private getModel(markdown: string): RenderedPageModel {
        this._logger?.debug(`getModel() called.`);
        this._logger?.debug(`styles: %o`, this.internalUrls);
        this._logger?.debug(`styles: %o`, this.externalUrls);

        const styles = [...this.internalUrls, ...this.externalUrls];
        const body = super.render(markdown);
        return { styles, body };
    }

    /**
     * Renders the given markdown string into HTML.
     *
     * @param {string} markdown - The markdown string to render.
     * @return {string} The rendered HTML string.
     */
    public render(markdown: string): string {
        const model = this.getModel(markdown);
        return (
            this
                .templateEngine as Handlebars.TemplateDelegate<RenderedPageModel>
        )(model);
        // this._logger?.debug(`render() called.`);
        // this._logger?.debug(`styles: %o`, this.internalUrls);
        // const htmlBody = super.render(markdown);
        // const styleTags = MarkdownItRender.generateStyleTags(
        //     this.internalUrls,
        //     this.externalUrls
        // );
        // return MarkdownItRender.htmlTemplate
        //     .replace(MarkdownItRender.styles, styleTags)
        //     .replace(MarkdownItRender.contents, htmlBody);
    }
    /**
     * Asynchronously renders a markdown file to HTML.
     *
     * @param {string} markdownFilePath - The path to the markdown file.
     * @return {Promise<string>} A promise that resolves to the rendered HTML.
     */
    public async renderFromFile(markdownFilePath: string): Promise<string> {
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
        internalUrls: string[],
        externalUrls: string[]
    ): string {
        return (
            internalUrls.map(MarkdownItRender.generateStyleTag).join('\n') +
            '\n' +
            externalUrls.map(MarkdownItRender.generateStyleTag).join('\n')
        );
    }
    //#endregion
    //#endregion
}
