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

export class MarkdownItRenderServer
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

export class MarkdownItPdfPrinter
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
