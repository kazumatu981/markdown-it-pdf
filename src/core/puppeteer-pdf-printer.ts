import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';
import { buildTreeOfFiles } from './utils/path-resolver';
import path from 'path';
import { type PDFOptions } from 'puppeteer';
import { Logger } from '../common/logger';

//#region constants
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
export type PrinterOptions = Omit<PDFOptions, 'path'>;

interface BrowserAndPage {
    browser: Browser;
    page: Page;
}
//#endregion

//#region main classes

/**
 * Base class fot the PDF printer
 */
export abstract class PuppeteerPDFPrinter<
    T = string | string[],
    U = void | Buffer,
> {
    /**
     * The base URL of the site to print.
     * @type {string}
     */
    protected _siteUrl: string;
    /**
     * The directory where the PDFs will be saved.
     * @type {string | undefined}
     */
    protected _outputDir?: string;
    /**
     * The options to configure the printer.
     * @type {PrinterOptions | undefined}
     */
    protected _options?: PrinterOptions;
    /**
     * The logger to use.
     * @type {Logger | undefined}
     */
    protected _logger?: Logger;

    /**
     * Constructor for the PuppeteerPDFPrinter.
     *
     * @param {string} siteUrl - The base URL of the site to print.
     * @param {string} [outputDir] - The directory where the PDFs will be saved.
     * @param {PrinterOptions} [options] - The options to configure the printer.
     * @param {Logger} [logger] - The logger to use.
     */
    protected constructor(
        siteUrl: string,
        outputDir?: string,
        options?: PrinterOptions,
        logger?: Logger
    ) {
        this._siteUrl = siteUrl;
        this._outputDir = outputDir;
        this._options = options;
        this._logger = logger;
    }

    /**
     * Creates a new Printer that prints the PDFs into files.
     *
     * @param {string} siteUrl - The base URL of the site to print.
     * @param {string} outputDir - The directory where the PDFs will be saved.
     * @param {PrinterOptions} [options] - The options to configure the printer.
     * @param {Logger} [logger] - The logger to use.
     * @return {FilePrinter} The newly created Printer.
     */
    public static intoFiles(
        siteUrl: string,
        outputDir: string,
        options?: PrinterOptions,
        logger?: Logger
    ): FilePrinter {
        // Create a new FilePrinter with the provided arguments
        return new FilePrinter(siteUrl, outputDir, options, logger);
    }

    /**
     * Creates a new Printer that prints the PDFs into memory.
     *
     * @param {string} siteUrl - The base URL of the site to print.
     * @param {PrinterOptions} [options] - The options to configure the printer.
     * @param {Logger} [logger] - The logger to use.
     * @return {MemoryPrinter} The newly created Printer.
     */
    public static intoMemory(
        siteUrl: string,
        options?: PrinterOptions,
        logger?: Logger
    ): MemoryPrinter {
        // Create a new Printer that prints the PDFs into memory.
        // The siteUrl parameter is the base URL of the site to print.
        // The options parameter is an object that allows you to configure the printer.
        // The logger parameter is an optional logger.
        return new MemoryPrinter(siteUrl, undefined, options, logger);
    }

    /**
     * Printer must be implemented.
     * @param targetUrls - The URLs of the pages to print.
     */
    public abstract print(targetUrls: T): Promise<U>;
}

class VirtualBrowser {
    /**
     * The Puppeteer browser instance.
     * @type {Browser}
     * @private
     */
    private _browser: Browser;

    /**
     * The Puppeteer page instance.
     * @type {Page}
     * @private
     */
    private _page: Page;

    /**
     * Creates a new instance of VirtualBrowser.
     * @param {Browser} browser - The Puppeteer browser instance.
     * @param {Page} page - The Puppeteer page instance.
     */
    protected constructor(browser: Browser, page: Page) {
        this._browser = browser;
        this._page = page;
    }

    /**
     * Launches a new instance of Puppeteer and creates a new page.
     *
     * @returns {Promise<VirtualBrowser>} A new instance of VirtualBrowser.
     */
    public static async launch(): Promise<VirtualBrowser> {
        // Launch a new instance of Puppeteer.
        const browser = await puppeteer.launch();

        // Create a new page in the browser.
        const page = await browser.newPage();

        // Return a new instance of VirtualBrowser with the launched browser and page.
        return new VirtualBrowser(browser, page);
    }

    /**
     * Navigates to the specified URL and waits for the body to load.
     *
     * @param {string} url - The URL to navigate to.
     * @returns {Promise<void>} A promise that resolves when the page is fully loaded.
     */
    public async gotoAndWait(url: string): Promise<void> {
        // Navigate to the specified URL.
        await this._page.goto(url);

        // Wait for the body to load.
        // The waitForSelector method returns a promise that resolves when the selector is found in the page.
        // In this case, we are waiting for the body selector to be found, indicating that the page is fully loaded.
        await this._page.waitForSelector('body');
    }

    /**
     * Prints the page as a PDF and returns the result.
     *
     * @param {string} filePath - The path to save the PDF to. If not specified, the PDF is returned as a buffer.
     * @param {PrinterOptions} options - Additional options for the PDF.
     * @returns {Promise<Buffer | void>} The PDF as a buffer, or void if filePath is specified.
     */
    public async print<T = Buffer | void>(
        filePath?: string,
        options?: PrinterOptions
    ): Promise<T> {
        // Use Puppeteer's page.pdf method to print the page as a PDF.
        // If filePath is specified, the PDF is saved to that file. Otherwise, the PDF is returned as a buffer.
        // The options parameter is an object that allows you to configure the PDF.
        return this._page.pdf({
            path: filePath,
            ...defaultPrinterOption,
            ...options,
        }) as Promise<T>;
    }

    /**
     * Closes the page and browser associated with the virtual browser.
     *
     * @returns {Promise<void>} A promise that resolves when the page and browser are closed.
     */
    public async close(): Promise<void> {
        // Close the page.
        await this._page.close();

        // Close the browser.
        await this._browser.close();
    }
}

/**
 * Printer that prints multiple pages into files.
 */
class FilePrinter extends PuppeteerPDFPrinter<string[], void> {
    /**
     * Prints multiple pages into files.
     *
     * @param {string[]} targetUrls - The URLs of the pages to print.
     * @return {Promise<void>} A promise that resolves when all pages are printed.
     */
    public async print(targetUrls: string[]): Promise<void> {
        // Build folder tree for the PDF files.
        await buildTreeOfFiles(
            targetUrls.map((page) => path.join(this._outputDir as string, page))
        );

        // Resolve URLs of the pages to print.
        const urls = targetUrls.map((page) => ({
            pathToPdf: `${path.join(this._outputDir as string, page)}.pdf`,
            fullUrl: `${this._siteUrl}${page}`,
        }));

        // Launch Puppeteer and create a new page.
        const browser = await VirtualBrowser.launch();
        this._logger?.debug(`Launched Puppeteer.`);

        // For each page, print it and save it as a PDF.
        for (const url of urls) {
            await browser.gotoAndWait(url.fullUrl);
            await browser.print<void>(url.pathToPdf, this._options);
            this._logger?.debug(`Printed ${url.fullUrl} to ${url.pathToPdf}.`);
        }

        // Close the page and browser.
        await browser.close();
        this._logger?.debug(`Closed Puppeteer.`);
    }
}

/**
 * Printer that prints a single page into memory.
 */
class MemoryPrinter extends PuppeteerPDFPrinter<string, Buffer> {
    /**
     * Prints a single page into memory.
     *
     * @param {string} targetUrl - The URL of the page to print.
     * @return {Promise<Buffer>} The PDF as a Buffer.
     */
    public async print(targetUrl: string): Promise<Buffer> {
        // Resolve the URL
        const fullUrl = `${this._siteUrl}${targetUrl}`;

        // Launch Puppeteer
        const browser = await VirtualBrowser.launch();
        this._logger?.debug(`Launched Puppeteer.`);

        // Print the page
        await browser.gotoAndWait(fullUrl);
        const pdf = await browser.print<Buffer>(undefined, this._options);
        this._logger?.debug(`Printed ${fullUrl} to memory.`);

        // Close the page and browser
        await browser.close();
        this._logger?.debug(`Closed Puppeteer.`);

        // Return the PDF
        return pdf;
    }
}

//#endregion
