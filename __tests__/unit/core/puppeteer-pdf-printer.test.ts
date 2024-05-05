import { jest, describe, it, expect } from '@jest/globals';
import puppeteer, { Browser } from 'puppeteer';
import {
    printManyPages,
    printOnePage,
    printIntoMemory,
} from '../../../src/core/puppeteer-pdf-printer';

jest.mock('puppeteer');

describe('CoreLibrary Unit Tests - PuppeteerPDFPrinter', () => {
    const gotoFn = jest.fn();
    const waitForSelectorFn = jest.fn();
    const pdfFn = jest.fn();
    const pageCloseFn = jest.fn();
    const browserCloseFn = jest.fn();
    beforeEach(() => {
        (puppeteer.launch as jest.Mock).mockResolvedValue({
            newPage: jest.fn().mockResolvedValue({
                goto: gotoFn,
                waitForSelector: waitForSelectorFn,
                pdf: pdfFn,
                close: pageCloseFn,
            } as never),
            close: browserCloseFn,
        } as never);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('printManyPages', async () => {
        await printManyPages(
            'http://localhost:3000',
            ['test1.md', 'test2.md'],
            'test',
            {
                format: 'a4',
            }
        );
        expect(puppeteer.launch).toBeCalledTimes(1);
        expect(gotoFn).toBeCalledTimes(2);
        expect(gotoFn).toMatchSnapshot();
        expect(pdfFn).toBeCalledTimes(2);
        expect(pdfFn).toMatchSnapshot();
    });
    it('printOnePages', async () => {
        await printOnePage('http://localhost:3000', 'test1.md', 'test', {
            format: 'a4',
        });
        expect(gotoFn).toBeCalledTimes(1);
        expect(gotoFn).toMatchSnapshot();
        expect(pdfFn).toBeCalledTimes(1);
        expect(pdfFn).toMatchSnapshot();
    });
    it('printIntoMemory', async () => {
        await printIntoMemory('http://localhost:3000', 'test1.md', {
            format: 'a4',
        });
        expect(gotoFn).toBeCalledTimes(1);
        expect(gotoFn).toMatchSnapshot();
        expect(pdfFn).toBeCalledTimes(1);
        expect(pdfFn).toMatchSnapshot();
    });
});
