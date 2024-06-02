import {
    type MarkdownRenderServerOptions,
    MarkdownRenderServer,
} from './core/markdown-render-server';
import {
    PuppeteerPDFPrinter,
    type PrinterOptions,
} from './core/puppeteer-pdf-printer';

import { Logger } from './common/logger';
import type MarkdownIt from 'markdown-it';

export interface MarkdownItPdfRenderServerOptions
    extends MarkdownRenderServerOptions {}

export interface MarkdownItPdfPrinterOptions
    extends MarkdownRenderServerOptions,
        PrinterOptions {
    outputDir?: string;
}

const defaultOutputDir = 'pdf';
const defaultPrinterOption = {
    margin: {
        top: '12.7mm',
        bottom: '12.7mm',
        left: '12.7mm',
        right: '12.7mm',
    },
};

export abstract class MarkdownItPdf {
    protected _server: MarkdownRenderServer;
    protected _logger?: Logger;
    protected _options?: MarkdownItPdfRenderServerOptions;
    public static async createRenderServer(
        logger?: Logger,
        options?: MarkdownItPdfRenderServerOptions
    ): Promise<MarkdownItfRenderServer> {
        logger?.debug(
            `createRenderServer() called with options: ${JSON.stringify(options)}`
        );
        const server = await MarkdownRenderServer.createInstance(
            logger,
            options
        );
        return new MarkdownItfRenderServer(server, logger, options);
    }
    public static async createPdfPrinter(
        logger?: Logger,
        options?: MarkdownItPdfPrinterOptions
    ): Promise<MarkdownItPdfPrinter> {
        logger?.debug(
            `createPdfPrinter() called with options: ${JSON.stringify(options)}`
        );
        const server = await MarkdownRenderServer.createInstance(
            logger,
            options
        );
        return new MarkdownItPdfPrinter(server, logger, options);
    }
    protected constructor(
        server: MarkdownRenderServer,
        logger?: Logger,
        options?: MarkdownItPdfRenderServerOptions
    ) {
        this._server = server;
        this._logger = logger;
        this._options = options;
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

class MarkdownItPdfPrinter extends MarkdownItPdf {
    public safeOutputDir(outputDir?: string): string {
        let candidate = outputDir;
        if (!candidate) {
            candidate = (this._options as MarkdownItPdfPrinterOptions)
                .outputDir;
            if (!candidate) {
                candidate = defaultOutputDir;
            }
        }
        return candidate;
    }
    public safeOptions(options?: PrinterOptions): PrinterOptions {
        let candidate = options;
        if (!candidate) {
            candidate = this._options as MarkdownItPdfPrinterOptions;
            if (!candidate) {
                candidate = defaultPrinterOption;
            }
        }
        return candidate;
    }
    public async printAll(
        outputDir?: string,
        options?: PrinterOptions
    ): Promise<this> {
        await this._server.listen();

        const urls = this.availableMarkdownUrls;

        await PuppeteerPDFPrinter.intoFiles(
            `http://localhost:${this._server.listeningPort}`,
            this.safeOutputDir(outputDir),
            this.safeOptions(options),
            this._logger
        ).print(urls);

        await this._server.close();
        return this;
    }
    public async print(
        url: string | string[],
        outputDir?: string,
        options?: PrinterOptions
    ): Promise<this> {
        await this._server.listen();

        if (!Array.isArray(url)) {
            url = [url];
        }

        await PuppeteerPDFPrinter.intoFiles(
            `http://localhost:${this._server.listeningPort}`,
            this.safeOutputDir(outputDir),
            this.safeOptions(options),
            this._logger
        ).print(url);

        await this._server.close();
        return this;
    }
    public async printIntoBuffer(
        url: string,
        options?: PrinterOptions
    ): Promise<Buffer> {
        await this._server.listen();

        const buffer = await PuppeteerPDFPrinter.intoMemory(
            `http://localhost:${this._server.listeningPort}`,
            this.safeOptions(options),
            this._logger
        ).print(url);

        await this._server.close();

        return buffer;
    }
}

export class MarkdownItfRenderServer extends MarkdownItPdf {
    public listen(port?: number): Promise<number> {
        return this._server.listen(port);
    }
    public close(): Promise<void> {
        return this._server.close();
    }
}
