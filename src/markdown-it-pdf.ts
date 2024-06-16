import {
    type RenderServerOptions,
    MarkdownRenderServer,
} from './core/markdown-render-server';
import {
    PuppeteerPDFPrinter,
    type PuppeteerPrinterOptions,
} from './core/puppeteer-pdf-printer';

import { Logger } from './common/logger';
import type MarkdownIt from 'markdown-it';

export { Logger };

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

//#region main functions
/**
 * Create a new instance for the server which is used to render Markdown to HTML.
 *
 * Example:
 *
 * ```typescript
 * const markdownIt
 * const server = await MarkdownItPdf.createServer('src', {
 *     port: 3000,
 *     templatePath: 'template.html',
 *     hljs: {
 *         js: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
 *         css: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css',
 *     });
 * await server.listen();
 * ```
 * @param rootDir {string | undefined} The root directory to start the search Markdown files from.
 * @param options {ServerOptions | undefined} The options to configure the server.
 * @param logger {Logger | undefined} The logger to use.
 * @returns {Promise<MarkdownItPdf.Server>} A new instance of MarkdownItPdf.Server.
 */
export async function createServer(
    rootDir?: string,
    options?: ServerOptions,
    logger?: Logger
): Promise<Server> {
    return MarkdownItRenderServer.createInstance(
        rootDir,
        undefined,
        options,
        logger
    );
}

/**
 * Create a new instance for the printer which is used to render Markdown to PDF.
 *
 * Example:
 *
 * ```typescript
 * const printer = await MarkdownItPdf.createPrinter('src', 'pdf', {
 *     port: 3000,
 *     templatePath: 'template.html',
 *     hljs: {
 *         js: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
 *         css: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css',
 *     });
 * await printer.printAll();
 * ```
 * @param rootDir {string | undefined} The root directory to start the search Markdown files from.
 * @param outputDir {string | undefined} The directory where the PDFs will be saved.
 * @param options {PrinterOptions | undefined} The options to configure the printer.
 * @param logger {Logger | undefined} The logger to use.
 * @returns {Promise<MarkdownItPdf.Printer>} A new instance of MarkdownItPdf.Printer.
 */
export async function createPrinter(
    rootDir?: string,
    outputDir?: string,
    options?: PrinterOptions,
    logger?: Logger
): Promise<Printer> {
    return MarkdownItPdfPrinter.createInstance(
        rootDir,
        outputDir,
        options,
        logger
    );
}
//#endregion

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
    use(plugin: MarkdownIt.PluginWithParams, ...params: unknown[]): this;
    get availableMarkdownUrls(): string[];
    get availableMarkdownPaths(): string[];
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

type Options = ServerOptions | PrinterOptions;

abstract class MarkdownItPdfBase<U = Options> implements MarkdownItPdf {
    protected _server: MarkdownRenderServer;
    protected _logger?: Logger;
    protected _options?: U;

    public static async createInstance<T extends MarkdownItPdfBase>(
        this: new (
            server: MarkdownRenderServer,
            outputDir?: string,
            options?: Options,
            logger?: Logger
        ) => T,
        rootDir?: string,
        outputDir?: string,
        options?: Options,
        logger?: Logger
    ) {
        logger?.debug(
            `createInstance called with options: ${JSON.stringify(options)}`
        );

        const server = await MarkdownRenderServer.createInstance(
            rootDir,
            options,
            logger
        );
        return new this(server, outputDir, options, logger);
    }
    protected constructor(
        server: MarkdownRenderServer,
        options?: ServerOptions,
        logger?: Logger
    ) {
        this._server = server;
        this._logger = logger;
        this._options = options as U;
    }

    public use(plugin: MarkdownIt.PluginSimple): this;
    public use<T>(plugin: MarkdownIt.PluginWithOptions<T>, options?: T): this;
    public use(
        plugin: MarkdownIt.PluginWithParams,
        ...params: unknown[]
    ): this {
        this._server.use(plugin, ...params);
        return this;
    }

    public get availableMarkdownUrls(): string[] {
        return this._server.availableMarkdownPaths.map(
            (x) => `${this.myUrl}${x}`
        );
    }

    public get availableMarkdownPaths(): string[] {
        return this._server.availableMarkdownPaths;
    }

    public get myUrl(): string {
        return this._server.myUrl;
    }
}

class MarkdownItRenderServer
    extends MarkdownItPdfBase<ServerOptions>
    implements Server
{
    public constructor(
        server: MarkdownRenderServer,
        _?: string,
        options?: ServerOptions,
        logger?: Logger
    ) {
        super(server, options, logger);
    }
    public listen(port?: number): Promise<number> {
        return this._server.listen(port);
    }
    public close(): Promise<void> {
        return this._server.close();
    }
}

class MarkdownItPdfPrinter
    extends MarkdownItPdfBase<PrinterOptions>
    implements Printer
{
    private _outputDir?: string;
    public constructor(
        server: MarkdownRenderServer,
        outputDir?: string,
        options?: PrinterOptions,
        logger?: Logger
    ) {
        super(server, options, logger);
        this._outputDir = outputDir;
    }

    public async printAll(): Promise<this> {
        await this._server.listen();

        const urls = this.availableMarkdownPaths;

        await PuppeteerPDFPrinter.intoFiles(
            this.myUrl,
            this._outputDir,
            this._options,
            this._logger
        ).print(urls);

        await this._server.close();
        return this;
    }
    public async print(url: string | string[]): Promise<this> {
        await this._server.listen();

        if (!Array.isArray(url)) {
            url = [url];
        }

        await PuppeteerPDFPrinter.intoFiles(
            this.myUrl,
            this._outputDir,
            this._options,
            this._logger
        ).print(url);

        await this._server.close();
        return this;
    }
    public async printIntoBuffer(url: string): Promise<Buffer> {
        await this._server.listen();

        const buffer = await PuppeteerPDFPrinter.intoMemory(
            this.myUrl,
            this._options,
            this._logger
        ).print(url);

        await this._server.close();

        return buffer;
    }
}
