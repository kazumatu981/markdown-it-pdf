import { jest, describe, it, expect } from '@jest/globals';
import puppeteer, { Browser } from 'puppeteer';
import { PuppeteerPDFPrinter } from '../../../src/core/puppeteer-pdf-printer';

jest.mock('puppeteer');

// TODO add test intoMemory with/without logger.

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

    it('print into files', async () => {
        await PuppeteerPDFPrinter.intoFiles('http://localhost:3000', 'test', {
            format: 'a4',
        }).print(['/test1.md', '/test2.md']);
        expect(puppeteer.launch).toBeCalledTimes(1);
        expect(gotoFn).toBeCalledTimes(2);
        expect(gotoFn).toMatchSnapshot();
        expect(pdfFn).toBeCalledTimes(2);
        expect(pdfFn).toMatchSnapshot();
    });
    it('print into memory', async () => {
        const pdf = await PuppeteerPDFPrinter.intoMemory(
            'http://localhost:3000',
            { format: 'a4' }
        ).print('/test1.md');
        expect(gotoFn).toBeCalledTimes(1);
        expect(gotoFn).toMatchSnapshot();
        expect(pdfFn).toBeCalledTimes(1);
        expect(pdfFn).toMatchSnapshot();
    });
});
