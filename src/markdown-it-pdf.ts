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
    public safeOptions(options?: PuppeteerPDFOptions): PuppeteerPDFOptions {
        let candidate = options;
        if (!candidate) {
            candidate = (this._options as MarkdownItPdfPrinterOptions)
                .defaultPrinterOption;
            if (!candidate) {
                candidate = {};
            }
        }
        return candidate;
    }
    public async printAll(
        outputDir?: string,
        options?: PuppeteerPDFOptions
    ): Promise<void> {
        await this._server.listen();

        const urls = this.availableMarkdownUrls;

        await printManyPages(
            `http://localhost:${this._server.listeningPort}`,
            urls,
            this.safeOutputDir(outputDir),
            this.safeOptions(options)
        );

        this._server.close();
    }
    public async print(
        url: string | string[],
        outputDir?: string,
        options?: PuppeteerPDFOptions
    ): Promise<void> {
        await this._server.listen();

        if (!Array.isArray(url)) {
            url = [url];
        }
        await printManyPages(
            `http://localhost:${this._server.listeningPort}`,
            url,
            this.safeOutputDir(outputDir),
            this.safeOptions(options)
        );

        this._server.close();
    }
    public async printIntoBuffer(
        url: string,
        options?: PuppeteerPDFOptions
    ): Promise<Buffer> {
        await this._server.listen();

        const buffer = await printIntoMemory(
            `http://localhost:${this._server.listeningPort}`,
            url,
            this.safeOptions(options)
        );

        this._server.close();

        return buffer;
    }
}

class MarkdownItfRenderServer extends MarkdownItPdf {
    public listen(port?: number): Promise<number> {
        return this._server.listen(port);
    }
    public close(): void {
        this._server.close();
    }
}
