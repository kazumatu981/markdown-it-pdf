import {
    type PuppeteerPrinterOptions,
    defaultPrinterOption,
} from './puppeteer-pdf-pinter-base';

import { type Browser, type Page } from 'puppeteer';
import puppeteer from 'puppeteer';

/**
 * Represents a virtual browser.
 */
export class VirtualBrowser {
    /**
     * The Puppeteer browser instance.
     */
    private _browser: Browser;

    /**
     * The Puppeteer page instance.
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
     * @returns {Promise<VirtualBrowser>} A new instance of VirtualBrowser.
     */
    public static async launch(): Promise<VirtualBrowser> {
        // Launch a new instance of Puppeteer.
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ignoreHTTPSErrors: true,
        });

        // Create a new page in the browser.
        const page = await browser.newPage();

        // Return a new instance of VirtualBrowser with the launched browser and page.
        return new VirtualBrowser(browser, page);
    }

    /**
     * Navigates to the specified URL and waits for the body to load.
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
     * @param {string} filePath - The path to save the PDF to. If not specified, the PDF is returned as a buffer.
     * @param {PuppeteerPrinterOptions} options - Additional options for the PDF.
     * @returns {Promise<Buffer | void>} The PDF as a buffer, or void if filePath is specified.
     */
    public async print<T = Buffer | void>(
        filePath?: string,
        options?: PuppeteerPrinterOptions
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
     * @returns {Promise<void>} A promise that resolves when the page and browser are closed.
     */
    public async close(): Promise<void> {
        // Close the page.
        await this._page.close();

        // Close the browser.
        await this._browser.close();
    }
}
