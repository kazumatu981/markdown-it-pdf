import { PuppeteerPDFPrinterBase } from './puppeteer-pdf-pinter-base';
import { VirtualBrowser } from './virtual-browser';

/**
 * Printer that prints a single page into memory.
 */
export class MemoryPrinter extends PuppeteerPDFPrinterBase<string, Buffer> {
    /**
     * Prints a single page into memory.
     * @param {string} targetUrl The URL of the page to print.
     * @returns {Promise<Buffer>} The PDF as a Buffer.
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
