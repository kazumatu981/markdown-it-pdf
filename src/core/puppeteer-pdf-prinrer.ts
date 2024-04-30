import puppeteer from 'puppeteer';
import { buildTreeOfFiles } from './path-resolver';
export async function printManyPages(
    site: string,
    pages: string[],
    outputPath: string
) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await buildTreeOfFiles(pages.map((page) => `${outputPath}/${page}`));

    const urls = pages.map((page) => {
        return {
            url: page,
            fullUrl: `${site}/${page}`,
        };
    });
    for (const url of urls) {
        await page.goto(url.fullUrl);
        await page.pdf({
            path: `${outputPath}/${url.url}.pdf`,
            format: 'a4',
            landscape: true,
        });
    }
    browser.close();
}
