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

export namespace MarkdownItPdf {
    export interface ServerOptions extends RenderServerOptions {}

    export interface PrinterOptions
        extends RenderServerOptions,
            PuppeteerPrinterOptions {}

    export type Options = ServerOptions | PrinterOptions;

    export async function createServer(
        rootDir?: string,
        options?: ServerOptions,
        logger?: Logger
    ): Promise<MarkdownItPdf.Server> {
        return MarkdownItRenderServer.createInstance(
            rootDir,
            undefined,
            options,
            logger
        );
    }
    export async function createPrinter(
        rootDir?: string,
        outputDir?: string,
        options?: PrinterOptions,
        logger?: Logger
    ): Promise<MarkdownItPdf.Printer> {
        return MarkdownItPdfPrinter.createInstance(
            rootDir,
            outputDir,
            options,
            logger
        );
    }
    export interface MarkdownItPdf {
        use(plugin: MarkdownIt.PluginSimple): this;
        use<T = any>(
            plugin: MarkdownIt.PluginWithOptions<T>,
            options?: T
        ): this;
        use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this;
        get availableMarkdownUrls(): string[];
    }
    export interface Server extends MarkdownItPdf {
        listen(): Promise<number>;
        close(): Promise<void>;
    }
    export interface Printer extends MarkdownItPdf {
        printAll(
            outputDir?: string,
            options?: PuppeteerPrinterOptions
        ): Promise<this>;
        print(
            url: string | string[],
            outputDir?: string,
            options?: PuppeteerPrinterOptions
        ): Promise<this>;
        printIntoBuffer(
            url: string,
            options?: PuppeteerPrinterOptions
        ): Promise<Buffer>;
    }
}

abstract class MarkdownItPdfBase<U = MarkdownItPdf.Options>
    implements MarkdownItPdf.MarkdownItPdf
{
    protected _server: MarkdownRenderServer;
    protected _logger?: Logger;
    protected _options?: U;

    public static async createInstance<T extends MarkdownItPdfBase>(
        this: new (
            server: MarkdownRenderServer,
            outputDir?: string,
            options?: MarkdownItPdf.Options,
            logger?: Logger
        ) => T,
        rootDir?: string,
        outputDir?: string,
        options?: MarkdownItPdf.Options,
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
        options?: MarkdownItPdf.ServerOptions,
        logger?: Logger
    ) {
        this._server = server;
        this._logger = logger;
        this._options = options as U;
    }

    public use(plugin: MarkdownIt.PluginSimple): this;
    public use<T = any>(
        plugin: MarkdownIt.PluginWithOptions<T>,
        options?: T
    ): this;
    public use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this {
        this._server.use(plugin, ...params);
        return this;
    }

    public get availableMarkdownUrls(): string[] {
        return this._server.availableMarkdownUrls;
    }
}

class MarkdownItPdfPrinter
    extends MarkdownItPdfBase<MarkdownItPdf.PrinterOptions>
    implements MarkdownItPdf.Printer
{
    private _outputDir?: string;
    public constructor(
        server: MarkdownRenderServer,
        outputDir?: string,
        options?: MarkdownItPdf.PrinterOptions,
        logger?: Logger
    ) {
        super(server, options, logger);
        this._outputDir = outputDir;
    }

    public async printAll(): Promise<this> {
        await this._server.listen();

        const urls = this.availableMarkdownUrls;

        await PuppeteerPDFPrinter.intoFiles(
            `http://localhost:${this._server.listeningPort}`,
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
            `http://localhost:${this._server.listeningPort}`,
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
            `http://localhost:${this._server.listeningPort}`,
            this._options,
            this._logger
        ).print(url);

        await this._server.close();

        return buffer;
    }
}

class MarkdownItRenderServer
    extends MarkdownItPdfBase<MarkdownItPdf.ServerOptions>
    implements MarkdownItPdf.Server
{
    public constructor(
        server: MarkdownRenderServer,
        _?: string,
        options?: MarkdownItPdf.ServerOptions,
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
