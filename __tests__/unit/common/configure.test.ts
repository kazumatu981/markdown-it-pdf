import { jest, describe, it, expect, afterEach } from '@jest/globals';

import { readOptions } from '../../../src/common/configure';

import { MarkdownItPdf } from '../../../src/markdown-it-pdf';

import { mockLogger } from '../../utils/mock-logger';

function testConfigure(config?: MarkdownItPdf.PrinterOptions) {
    expect(config).toBeDefined();
    expect(config?.margin?.top).toBeDefined();
    expect(config?.margin?.top).toEqual('12.7mm');
}

describe('Unit Tests - readOptions', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('configure is described in json file', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config.json'
        );
        testConfigure(config);
    });
    it('configure is described in node js standard file', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config.js'
        );

        testConfigure(config);
    });
    it('configure is described in common js file', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config.cjs'
        );

        testConfigure(config);
    });
    it('configure is described in es file (unsupported).', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config.mjs'
        );
        expect(config).toBeUndefined();
    });
    it('configure is described in typescript file (unsupported).', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config.ts'
        );
        expect(config).toBeUndefined();
    });
    it('configure is described in typescript file (unsupported). - with logger', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config.ts',
            mockLogger
        );
        expect(mockLogger.warn).toBeCalled();
    });
    it('collapse configure file (on error)', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/collapse_config.js'
        );
        expect(config).toBeUndefined();
    });
    it('collapse configure file (on error) - with logger', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/collapse_config.js',
            mockLogger
        );
        expect(mockLogger.warn).toBeCalled();
    });
    it('filePath not exists', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            __dirname + '/__data__/config1.json'
        );
        expect(config).toBeUndefined();
    });
    it('filePath as undefined', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>();
        expect(config).toBeUndefined();
    });
    it('filePath as undefined - with logger', async () => {
        const config = await readOptions<MarkdownItPdf.PrinterOptions>(
            undefined,
            mockLogger
        );
        expect(mockLogger.info).toBeCalled();
    });
});
