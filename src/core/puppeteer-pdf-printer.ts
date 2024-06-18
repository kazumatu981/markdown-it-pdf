import { Logger } from '../common/logger';
import {
    FilePrinter,
    MemoryPrinter,
    type PuppeteerPrinterOptions,
} from './printer';

export { type PuppeteerPrinterOptions } from './printer';

/**
 * Base class fot the PDF printer
 */
export abstract class PuppeteerPDFPrinter {
    /**
     * Creates a new Printer that prints the PDFs into files.
     * @param {string} siteUrl - The base URL of the site to print.
     * @param {string} outputDir - The directory where the PDFs will be saved.
     * @param {PuppeteerPrinterOptions} [options] - The options to configure the printer.
     * @param {Logger} [logger] - The logger to use.
     * @returns {FilePrinter} The newly created Printer.
     */
    public static intoFiles(
        siteUrl: string,
        outputDir?: string,
        options?: PuppeteerPrinterOptions,
        logger?: Logger
    ): FilePrinter {
        // Create a new FilePrinter with the provided arguments
        return new FilePrinter(siteUrl, outputDir, options, logger);
    }

    /**
     * Creates a new Printer that prints the PDFs into memory.
     * @param {string} siteUrl - The base URL of the site to print.
     * @param {PuppeteerPrinterOptions} [options] - The options to configure the printer.
     * @param {Logger} [logger] - The logger to use.
     * @returns {MemoryPrinter} The newly created Printer.
     */
    public static intoMemory(
        siteUrl: string,
        options?: PuppeteerPrinterOptions,
        logger?: Logger
    ): MemoryPrinter {
        // Create a new Printer that prints the PDFs into memory.
        // The siteUrl parameter is the base URL of the site to print.
        // The options parameter is an object that allows you to configure the printer.
        // The logger parameter is an optional logger.
        return new MemoryPrinter(siteUrl, undefined, options, logger);
    }
}

//#endregion
