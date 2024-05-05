import {
    type MarkdownRenderServerOptions,
    MarkdownRenderServer,
} from './core/markdown-render-server';
import {
    type PuppeteerPDFOptions,
    printManyPages,
    printIntoMemory,
} from './core/puppeteer-pdf-printer';

import type MarkdownIt from 'markdown-it';

export interface MarkdownItfRenderServerOptions
    extends MarkdownRenderServerOptions {}
export interface MarkdownItPdfPrinterOptions
    extends MarkdownItfRenderServerOptions {
    defaultPrinterOption?: PuppeteerPDFOptions;
    outputDir?: string;
}

const defaultOutputDir = 'pdf';

export abstract class MarkdownItPdf {
    protected _server: MarkdownRenderServer;
    protected _options?: MarkdownItfRenderServerOptions;
    public static async createRenderServer(
        options?: MarkdownItfRenderServerOptions
    ): Promise<MarkdownItfRenderServer> {
        const server = await MarkdownRenderServer.createInstance(options);
        return new MarkdownItfRenderServer(server, options);
    }
    public static async createPdfPrinter(
        options?: MarkdownItPdfPrinterOptions
    ): Promise<MarkdownItPdfPrinter> {
        const server = await MarkdownRenderServer.createInstance(options);
        return new MarkdownItPdfPrinter(server, options);
    }
    protected constructor(
        server: MarkdownRenderServer,
        options?: MarkdownItfRenderServerOptions
    ) {
        this._server = server;
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
        return this._server.contentsMap.markdownEntryUrls;
    }
}

class MarkdownItPdfPrinter extends MarkdownItPdf {
    public async printAll(
        outputDir?: string,
        options?: PuppeteerPDFOptions
    ): Promise<void> {
        this._server.listen();

        const urls = this.availableMarkdownUrls;

        await printManyPages(
            `http://localhost:${this._server.listeningPort}`,
            urls,
            outputDir ??
                (this._options as MarkdownItPdfPrinterOptions)?.outputDir ??
                defaultOutputDir,
            options ??
                (this._options as MarkdownItPdfPrinterOptions)
                    ?.defaultPrinterOption
        );

        this._server.close();
    }
    public async print(
        url: string | string[],
        outputDir?: string,
        options?: PuppeteerPDFOptions
    ): Promise<void> {
        this._server.listen();

        if (!Array.isArray(url)) {
            url = [url];
        }
        await printManyPages(
            `http://localhost:${this._server.listeningPort}`,
            url,
            outputDir ??
                (this._options as MarkdownItPdfPrinterOptions)?.outputDir ??
                defaultOutputDir,
            options ??
                (this._options as MarkdownItPdfPrinterOptions)
                    ?.defaultPrinterOption
        );

        this._server.close();
    }
    public async printIntoBuffer(
        url: string,
        options?: PuppeteerPDFOptions
    ): Promise<Buffer> {
        this._server.listen();

        const buffer = await printIntoMemory(
            `http://localhost:${this._server.listeningPort}`,
            url,
            options ??
                (this._options as MarkdownItPdfPrinterOptions)
                    ?.defaultPrinterOption
        );

        this._server.close();

        return buffer;
    }
}

class MarkdownItfRenderServer extends MarkdownItPdf {
    public listen(port?: number): void {
        this._server.listen(port ?? this._options?.port);
    }
    public close(): void {
        this._server.close();
    }
}
