import { type PDFOptions } from 'puppeteer';
import { type Logger } from '../../common';

//#region constants

/**
 * The default directory where the PDFs will be saved.
 */
export const defaultOutputDir = 'pdf';

/**
 * The default options to configure the printer.
 */
export const defaultPrinterOption: PDFOptions = {
    format: 'A4',
    margin: {
        top: '12.7mm',
        bottom: '12.7mm',
        left: '12.7mm',
        right: '12.7mm',
    },
};
//#endregion
//#region types and interfaces

/**
 * The options to configure the printer.
 */
export type PuppeteerPrinterOptions = Omit<PDFOptions, 'path'>;

//#endregion

/**
 * Base class fot the PDF printer
 */
export abstract class PuppeteerPDFPrinterBase<
    T = string | string[],
    U = void | Buffer,
> {
    /**
     * The base URL of the site to print.
     */
    protected _siteUrl: string;
    /**
     * The directory where the PDFs will be saved.
     */
    protected _outputDir?: string;
    /**
     * The options to configure the printer.
     */
    protected _options?: PuppeteerPrinterOptions;
    /**
     * The logger to use.
     */
    protected _logger?: Logger;

    /**
     * Constructor for the PuppeteerPDFPrinter.
     * @param {string} siteUrl - The base URL of the site to print.
     * @param {string} [outputDir] - The directory where the PDFs will be saved.
     * @param {PuppeteerPrinterOptions} [options] - The options to configure the printer.
     * @param {Logger} [logger] - The logger to use.
     */
    public constructor(
        siteUrl: string,
        outputDir?: string,
        options?: PuppeteerPrinterOptions,
        logger?: Logger
    ) {
        this._siteUrl = siteUrl;
        this._outputDir = outputDir;
        this._options = options;
        this._logger = logger;
    }

    /**
     * Printer must be implemented.
     * @param targetUrls - The URLs of the pages to print.
     */
    public abstract print(targetUrls: T): Promise<U>;
}
