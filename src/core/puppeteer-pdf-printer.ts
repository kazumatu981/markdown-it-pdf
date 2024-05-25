import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';
import { buildTreeOfFiles } from './utils/path-resolver';
import path from 'path';
import { type PrinterOptions } from '../common/configure';
import { type PDFOptions } from 'puppeteer';
import { Logger } from '../common/logger';

interface BrowserAndPage {
    browser: Browser;
    page: Page;
}

export class PuppeteerPDFPrinter {
    protected _siteUrl: string;
    protected _outputDir?: string;
    protected _options?: PrinterOptions;
    protected _logger?: Logger;

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

    public static intoFiles(
        siteUrl: string,
        outputDir: string,
        options?: PrinterOptions,
        logger?: Logger
    ): FilePrinter {
        return new FilePrinter(siteUrl, outputDir, options, logger);
    }

    public static intoMemory(
        siteUrl: string,
        options?: PrinterOptions,
        logger?: Logger
    ) {
        return new MemoryPrinter(siteUrl, undefined, options, logger);
    }

    protected static async launchSinglePageBrowser(): Promise<BrowserAndPage> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        return {
            browser,
            page,
        };
    }

    protected static async closeBrowser(
        browserAndPage: BrowserAndPage
    ): Promise<void> {
        await browserAndPage.page.close();
        await browserAndPage.browser.close();
    }

    protected static async goAndWait(
        browserAndPage: BrowserAndPage,
        url: string
    ) {
        await browserAndPage.page.goto(url);
        await browserAndPage.page.waitForSelector('body');
    }
}
class FilePrinter extends PuppeteerPDFPrinter {
    public async print(targetUrls: string[]): Promise<void> {
        // build folder tree.
        await buildTreeOfFiles(
            targetUrls.map((page) => path.join(this._outputDir as string, page))
        );
        // resolve urls
        const urls = targetUrls.map((page) => {
            return {
                pathToPdf: `${path.join(this._outputDir as string, page)}.pdf`,
                fullUrl: `${this._siteUrl}${page}`,
            };
        });

        // launch puppeteer
        const browserAndPage =
            await PuppeteerPDFPrinter.launchSinglePageBrowser();

        for (const url of urls) {
            // print page
            await PuppeteerPDFPrinter.goAndWait(browserAndPage, url.fullUrl);
            await browserAndPage.page.pdf({
                path: url.pathToPdf,
                ...this._options,
            });
        }

        // close page and browser
        await PuppeteerPDFPrinter.closeBrowser(browserAndPage);
    }
}

class MemoryPrinter extends PuppeteerPDFPrinter {
    public async print(targetUrl: string): Promise<Buffer> {
        // resolve url
        const fullUrl = `${this._siteUrl}${targetUrl}`;
        // launch puppeteer
        const browserAndPage =
            await PuppeteerPDFPrinter.launchSinglePageBrowser();
        // print page
        await PuppeteerPDFPrinter.goAndWait(browserAndPage, fullUrl);
        const pdf = await browserAndPage.page.pdf(this._options as PDFOptions);
        // close page and browser
        await PuppeteerPDFPrinter.closeBrowser(browserAndPage);
        return pdf;
    }
}
