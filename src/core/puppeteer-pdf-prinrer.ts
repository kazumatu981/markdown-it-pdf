import { PDFOptions, type PaperFormat } from 'puppeteer';
import puppeteer from 'puppeteer';
import { buildTreeOfFiles } from './path-resolver';
import path from 'path';

export type PuppeteerPDFPrinterPaperFormat = Omit<PaperFormat, 'path'>;

export async function printManyPages(
    siteUrl: string,
    pagePaths: string[],
    outputDir: string,
    paperFormat?: PuppeteerPDFPrinterPaperFormat
) {
    // build folder tree.
    await buildTreeOfFiles(pagePaths.map((page) => path.join(outputDir, page)));

    const urls = pagePaths.map((page) => {
        return {
            pathToPdf: `${path.join(outputDir, page)}.pdf`,
            fullUrl: `${siteUrl}/${page}`,
        };
    });

    // launch puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    for (const url of urls) {
        // go to page
        await page.goto(url.fullUrl);
        // wait for the page to be loaded.
        await page.waitForSelector('body');
        // print into pdf file
        await page.pdf({
            path: url.pathToPdf,
            ...paperFormat,
        });
    }
    // close page and browser
    await page.close();
    await browser.close();
    return;
}

export async function printOnePage(
    siteUrl: string,
    pagePath: string,
    outputDir: string,
    paperFormat?: PuppeteerPDFPrinterPaperFormat
) {
    await printManyPages(siteUrl, [pagePath], outputDir, paperFormat);
    return;
}

export async function printIntoMemory(
    siteUrl: string,
    pagePath: string,
    paperFormat?: PuppeteerPDFPrinterPaperFormat
): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // go to page
    await page.goto(`${siteUrl}/${pagePath}`);
    // wait for the page to be loaded.
    await page.waitForSelector('body');
    // print into pdf file
    const pdf = await page.pdf(paperFormat as PDFOptions);
    await page.close();
    await browser.close();
    return pdf;
}
