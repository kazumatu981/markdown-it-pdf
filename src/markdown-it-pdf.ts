import type {
    Server,
    Printer,
    ServerOptions,
    PrinterOptions,
} from './markdown-it-pdf-interfaces';

import {
    MarkdownItRenderServer,
    MarkdownItPdfPrinter,
} from './markdown-it-pdf-implements';
import { Logger } from './common/logger';

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
