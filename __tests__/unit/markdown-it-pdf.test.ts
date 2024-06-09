import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownItPdf } from '../../src/markdown-it-pdf';
import { mockingTestDir, unmockingTestDir } from '../utils/test-dir';
import { readFromServer } from '../utils/http-util';
import path from 'path';
import puppeteer from 'puppeteer';

const markdownItSup = require('markdown-it-sup');

jest.mock('puppeteer');

describe('Unit Tests - MarkdownItPdf', () => {
    describe('MarkdownItPdf (common functions)', () => {
        it('use', async () => {
            mockingTestDir();
            const server = await MarkdownItPdf.createServer('test', {
                recursive: true,
            });
            // expect to no error!!
            expect(() => {
                server.use(markdownItSup);
            }).not.toThrow();

            unmockingTestDir();
        });
        it('availableMarkdownUrls', async () => {
            mockingTestDir();
            const server = await MarkdownItPdf.createServer('test', {
                recursive: true,
            });
            const availableMarkdownUrls = server.availableMarkdownUrls;
            unmockingTestDir();
            expect(availableMarkdownUrls).toContain('/test.md');
            expect(availableMarkdownUrls).toContain('/sub/test.md');
            expect(availableMarkdownUrls).toContain('/sub2/sub/test.md');
        });
    });
    describe('MarkdownItPdfPrinter', () => {
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
        describe('printAll', () => {
            it('on omit output', async () => {
                mockingTestDir();
                const printer = await MarkdownItPdf.createPrinter(
                    'test',
                    undefined,
                    {
                        recursive: true,
                    }
                );
                await printer.printAll();
                const resultCount = printer.availableMarkdownUrls.length;
                expect(pdfFn).toBeCalledTimes(resultCount);

                // under default outputDir
                expect(pdfFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: path.join('pdf', 'test.md.pdf'),
                    })
                );
                unmockingTestDir();
            });
            it('with output', async () => {
                mockingTestDir();
                const printer = await MarkdownItPdf.createPrinter(
                    'test',
                    'pdf2',
                    {
                        recursive: true,
                    }
                );
                await printer.printAll();
                // check arguments of pdf
                expect(pdfFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: path.join('pdf2', 'test.md.pdf'),
                    })
                );
                expect(pdfFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: path.join('pdf2', 'sub', 'test.md.pdf'),
                    })
                );
                unmockingTestDir();
            });
        });
        describe('print', () => {
            it('on omit output', async () => {
                mockingTestDir();
                const printer = await MarkdownItPdf.createPrinter(
                    'test',
                    undefined,
                    {
                        recursive: true,
                    }
                );
                await printer.print('test.md');
                expect(pdfFn).toBeCalledTimes(1);

                // under default outputDir
                expect(pdfFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: path.join('pdf', 'test.md.pdf'),
                    })
                );
                unmockingTestDir();
            });
        });
        describe('printIntoBuffer', () => {
            it('call pdf with no output', async () => {
                mockingTestDir();
                const printer = await MarkdownItPdf.createPrinter(
                    'test',
                    undefined,
                    {
                        recursive: true,
                    }
                );
                const buffer = await printer.printIntoBuffer('test.md');
                expect(pdfFn).toBeCalledTimes(1);
                expect(pdfFn).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: expect.any(String),
                    })
                );
                unmockingTestDir();
            });
            it('with options on createInstance', async () => {
                mockingTestDir();
                const printer = await MarkdownItPdf.createPrinter(
                    'test',
                    undefined,
                    {
                        recursive: true,
                        format: 'a4',
                    }
                );
                const buffer = await printer.printIntoBuffer('test.md');
                expect(pdfFn).toBeCalledTimes(1);
                unmockingTestDir();
            });
            it('with options on argument', async () => {
                mockingTestDir();
                const printer = await MarkdownItPdf.createPrinter(
                    'test',
                    undefined,
                    {
                        recursive: true,
                    }
                );
                const buffer = await printer.printIntoBuffer('test.md', {
                    format: 'a4',
                });
                expect(pdfFn).toBeCalledTimes(1);
                unmockingTestDir();
            });
        });
    });
    describe('MarkdownItRenderServer', () => {
        it('listen', async () => {
            mockingTestDir();
            const server = await MarkdownItPdf.createServer('test', {
                recursive: true,
            });
            const port = await server.listen();
            const htmlData = await readFromServer(
                `http://localhost:${port}/test.md`
            );
            unmockingTestDir();
            expect(htmlData.statusCode).toEqual(200);
            expect(htmlData.contentType).toEqual('text/html');
            server.close();
        });
    });
});
