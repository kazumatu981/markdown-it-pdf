import { type Logger } from '../../common';
import { type FileRender } from './file-render';
import { defaultTemplateSource } from './defaultTemplate';

import MarkdownIt from 'markdown-it';
import fsPromises from 'fs/promises';
import Handlebars from 'handlebars';

export interface TemplateOptions {
    templatePath?: string;
    hljs?: HljsConfig | false;
}
const defaultTemplateOPtions = {
    hljs: {
        js: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
        css: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css',
    },
};

export interface HljsConfig {
    js: string;
    css: string;
}

interface RenderedPageModel {
    styles: string[];
    body: string;
    hljs?: HljsConfig | false;
}

/**
 * The implementation of the render function for markdown files.
 */
export class MarkdownItRender extends MarkdownIt implements FileRender {
    public _logger?: Logger;
    private internalUrls: Array<string> = [];
    private externalUrls: Array<string> = [];
    private templateSource: string = defaultTemplateSource;
    private templateEngine: Handlebars.TemplateDelegate<RenderedPageModel> =
        Handlebars.compile(defaultTemplateSource);
    private hljs: HljsConfig | undefined;

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

    public clearStyles(): this {
        this.internalUrls = [];
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

    public clearExternalStyles(): this {
        this.externalUrls = [];
        return this;
    }

    public async configureTemplate(options?: TemplateOptions): Promise<this> {
        this.configureHljs(options?.hljs);
        return this.loadTemplateFrom(options?.templatePath);
    }

    /**
     * Renders the given markdown string into HTML.
     *
     * @param {string} markdown - The markdown string to render.
     * @return {string} The rendered HTML string.
     */
    public render(markdown: string): string {
        const model = this.getModel(markdown);
        return this.templateEngine!(model);
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

    private configureHljs(hljs: HljsConfig | false | undefined): this {
        if (hljs === false) {
            this.hljs = undefined;
        } else if (hljs === undefined) {
            this.hljs = defaultTemplateOPtions.hljs;
        } else {
            this.hljs = hljs;
        }
        return this;
    }

    /**
     * Loads the template from the given file path.
     *
     * @param {string} templatePath - The path to the template file.
     * @return {Promise<this>} - A promise that resolves to the current instance.
     */
    private async loadTemplateFrom(templatePath?: string): Promise<this> {
        // Read the template file as a string.
        if (templatePath) {
            this.templateSource = await fsPromises.readFile(
                templatePath,
                'utf8'
            );
        } else {
            this.templateSource = defaultTemplateSource;
        }
        this.templateEngine = Handlebars.compile<RenderedPageModel>(
            this.templateSource
        );

        // Log the loaded template.
        this._logger?.debug(`template: %o`, this.templateSource);

        // Return the current instance.
        return this;
    }

    private getModel(markdown: string): RenderedPageModel {
        this._logger?.debug(`getModel() called.`);
        this._logger?.debug(`styles: %o`, this.internalUrls);
        this._logger?.debug(`styles: %o`, this.externalUrls);

        const styles = [...this.internalUrls, ...this.externalUrls];
        const body = super.render(markdown);
        return { styles, body, hljs: this.hljs };
    }
    //#endregion
}
