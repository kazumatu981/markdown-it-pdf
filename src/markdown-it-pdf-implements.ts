import { Logger } from './common/logger';
import { MarkdownRenderServer } from './core/markdown-render-server';

import type MarkdownIt from 'markdown-it';
import type {
    MarkdownItPdf,
    Server,
    Printer,
    ServerOptions,
    PrinterOptions,
} from './markdown-it-pdf-interfaces';
import { PuppeteerPDFPrinter } from './core/puppeteer-pdf-printer';

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

/**
 * The markdown render server
 */
export class MarkdownItRenderServer
    extends MarkdownItPdfBase<ServerOptions>
    implements Server
{
    /**
     * construct a new markdown render server
     * @param server {MarkdownRenderServer} render server
     * @param _ {string} this parameter is ignored
     * @param options {ServerOptions} the options on this server launch.
     * @param logger {Logger} the logger
     */
    public constructor(
        server: MarkdownRenderServer,
        _?: string,
        options?: ServerOptions,
        logger?: Logger
    ) {
        super(server, options, logger);
    }

    /**
     * start to listen from clients request
     * @param port {number | undefined} port number
     * @returns {Promise<number>} a promise that resolves when the server is listening
     */
    public listen(port?: number): Promise<number> {
        return this._server.listen(port);
    }

    /**
     * stop the server
     * @returns {Promise<void>} A promise that resolves when the server is closed.
     */
    public close(): Promise<void> {
        return this._server.close();
    }
}

/**
 * The markdown render printer
 */
export class MarkdownItPdfPrinter
    extends MarkdownItPdfBase<PrinterOptions>
    implements Printer
{
    private _outputDir?: string;

    /**
     * print all pages into pdf file
     * @param server {MarkdownRenderServer} render server
     * @param outputDir {string} output directory
     * @param options {PrinterOptions} the options for printing into pdf
     * @param logger {Logger} the logger
     */
    public constructor(
        server: MarkdownRenderServer,
        outputDir?: string,
        options?: PrinterOptions,
        logger?: Logger
    ) {
        super(server, options, logger);
        this._outputDir = outputDir;
    }

    /**
     * Print All Markdown under the root directory.
     * @returns {Promise<this>} A promise that resolves when the server is closed.
     */
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

    /**
     * Print All Markdown under the root directory.
     * @param url {string|string[]} The URLs of the pages to print.
     * @returns {Promise<this>} A promise that resolves when the server is closed.
     */
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

    /**
     * print page as PDF into memory
     * @param url {string} The URL of the page to print.
     * @returns {Promise<Buffer>} The PDF as a buffer.
     */
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
