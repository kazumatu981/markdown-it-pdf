import { jest, describe, it, expect } from '@jest/globals';

import {
    readOptions,
    type MarkdownItPdfPrinterOptions,
} from '../../../src/common/configure';

import { mockLogger } from '../../utils/mock-logger';
import { afterEach } from 'node:test';

function testConfigure(config?: MarkdownItPdfPrinterOptions) {
    expect(config).toBeDefined();
    expect(config?.rootDir).toBeDefined();
    expect(config?.rootDir).toEqual('./test');
    expect(config?.printerOption?.margin?.top).toBeDefined();
    expect(config?.printerOption?.margin?.top).toEqual('12.7mm');
}

describe('Unit Tests - readOptions', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('configure is described in json file', () => {
        testConfigure(
            readOptions<MarkdownItPdfPrinterOptions>(
                __dirname + '/__data__/config.json'
            )
        );
    });
    it('configure is described in node js standard file', () => {
        testConfigure(
            readOptions<MarkdownItPdfPrinterOptions>(
                __dirname + '/__data__/config.js'
            )
        );
    });
    it('configure is described in common js file', () => {
        testConfigure(
            readOptions<MarkdownItPdfPrinterOptions>(
                __dirname + '/__data__/config.cjs'
            )
        );
    });
    it('configure is described in es file (unsupported).', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            __dirname + '/__data__/config.mjs'
        );
        expect(config).toBeUndefined();
    });
    it('configure is described in typescript file (unsupported).', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            __dirname + '/__data__/config.ts'
        );
        expect(config).toBeUndefined();
    });
    it('configure is described in typescript file (unsupported). - with logger', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            __dirname + '/__data__/config.ts',
            mockLogger
        );
        expect(mockLogger.warn).toBeCalled();
    });
    it('collapse configure file (on error)', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            __dirname + '/__data__/collapse_config.js'
        );
        expect(config).toBeUndefined();
    });
    it('collapse configure file (on error) - with logger', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            __dirname + '/__data__/collapse_config.js',
            mockLogger
        );
        expect(mockLogger.warn).toBeCalled();
    });
    it('filePath not exists', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            __dirname + '/__data__/config1.json'
        );
        expect(config).toBeUndefined();
    });
    it('filePath as undefined', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>();
        expect(config).toBeUndefined();
    });
    it('filePath as undefined - with logger', () => {
        const config = readOptions<MarkdownItPdfPrinterOptions>(
            undefined,
            mockLogger
        );
        expect(mockLogger.info).toBeCalled();
    });
});
