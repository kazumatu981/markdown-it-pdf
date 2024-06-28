import {
    PuppeteerPDFPrinterBase,
    defaultOutputDir,
} from './puppeteer-pdf-pinter-base';
import { VirtualBrowser } from './virtual-browser';
import { buildTreeOfFiles } from '../utils';

import path from 'path';

/**
 * Printer that prints multiple pages into files.
 */
export class FilePrinter extends PuppeteerPDFPrinterBase<string[], void> {
    /**
     * Prints multiple pages into files.
     * @param {string[]} targetUrls - The URLs of the pages to print.
     * @returns {Promise<void>} A promise that resolves when all pages are printed.
     */
    public async print(targetUrls: string[]): Promise<void> {
        // Build folder tree for the PDF files.
        await buildTreeOfFiles(targetUrls.map(this.safeOutputPath.bind(this)));

        // Resolve URLs of the pages to print.
        const urls = targetUrls.map((page) => ({
            pathToPdf: `${this.safeOutputPath(page)}.pdf`,
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

    private safeOutputPath(filePath: string): string {
        return path.join(this._outputDir ?? defaultOutputDir, filePath);
    }
}
