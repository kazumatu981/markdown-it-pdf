import type { RenderServerOptions } from './core/markdown-render-server';
import type { PuppeteerPrinterOptions } from './core/puppeteer-pdf-printer';
import type MarkdownIt from 'markdown-it';

/**
 * The options to configure the server.
 */
export interface ServerOptions extends RenderServerOptions {}

/**
 * The options to configure the printer.
 */
export interface PrinterOptions
    extends RenderServerOptions,
        PuppeteerPrinterOptions {}

//#region exported interfaces
/**
 * An interface for the MarkdownItPdf.
 * The basic interface of this library.
 */
export interface MarkdownItPdf {
    /**
     * use() interface to inherit from markdown-it. (https://github.com/markdown-it/markdown-it#use)
     * @param plugin {MarkdownIt.PluginSimple}
     */
    use(plugin: MarkdownIt.PluginSimple): this;
    /**
     * use() interface to inherit from markdown-it. (https://github.com/markdown-it/markdown-it#use)
     * @param plugin {MarkdownIt.PluginWithOptions<T>}
     * @param options {T}
     */
    use<T>(plugin: MarkdownIt.PluginWithOptions<T>, options?: T): this;
    /**
     * use() interface to inherit from markdown-it. (https://github.com/markdown-it/markdown-it#use)
     * @param plugin {MarkdownIt.PluginWithParams}
     * @param params {unknown[]}
     */
    use(plugin: MarkdownIt.PluginWithParams, ...params: unknown[]): this;
    /**
     * The URLs of the available Markdown files.
     */
    get availableMarkdownUrls(): string[];
    /**
     * The paths of the available Markdown files.
     */
    get availableMarkdownPaths(): string[];
    /**
     * The URL of the server.
     */
    get myUrl(): string;
}

/**
 * An interface for the server.
 */
export interface Server extends MarkdownItPdf {
    /**
     * Starts the server.
     * @returns {Promise<number>} A promise that resolves when the server is listening. The port number is returned.
     */
    listen(): Promise<number>;
    /**
     * Closes the server.
     * @returns {Promise<void>} A promise that resolves when the server is closed.
     */
    close(): Promise<void>;
}

/**
 * An interface for the PDF printer.
 */
export interface Printer extends MarkdownItPdf {
    /**
     * Prints multiple pages into files.
     */
    printAll(): Promise<this>;
    /**
     * Prints multiple pages into files.
     * @param {string|string[]} url - The URLs of the pages to print.
     */
    print(url: string | string[]): Promise<this>;
    /**
     * Prints a single page into memory.
     * @param url - The URL of the page to print.
     */
    printIntoBuffer(url: string): Promise<Buffer>;
}
//#endregion
