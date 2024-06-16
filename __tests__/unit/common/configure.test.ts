import { jest, describe, it, expect, afterEach } from '@jest/globals';

import { readOptions } from '../../../src/common/configure';

import { type PrinterOptions } from '../../../src/markdown-it-pdf-interfaces';

import { mockLogger } from '../../utils/mock-logger';

// TODO Add test about collapsed json configure.

function testConfigure(config?: PrinterOptions) {
    expect(config).toBeDefined();
    expect(config?.margin?.top).toBeDefined();
    expect(config?.margin?.top).toEqual('12.7mm');
}

describe('Unit Tests - readOptions', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('configure is described in json file', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config.json'
        );
        testConfigure(config);
    });
    it('configure is described in node js standard file', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config.js'
        );

        testConfigure(config);
    });
    it('configure is described in common js file', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config.cjs'
        );

        testConfigure(config);
    });
    it('configure is described in es file (unsupported).', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config.mjs'
        );
        expect(config).toBeUndefined();
    });
    it('configure is described in typescript file (unsupported).', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config.ts'
        );
        expect(config).toBeUndefined();
    });
    it('configure is described in typescript file (unsupported). - with logger', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config.ts',
            mockLogger
        );
        expect(mockLogger.warn).toBeCalled();
    });
    it('collapse configure file (on error)', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/collapse_config.js'
        );
        expect(config).toBeUndefined();
    });
    it('collapse configure file (on error) - with logger', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/collapse_config.js',
            mockLogger
        );
        expect(mockLogger.warn).toBeCalled();
    });
    it('filePath not exists', async () => {
        const config = await readOptions<PrinterOptions>(
            __dirname + '/__data__/config1.json'
        );
        expect(config).toBeUndefined();
    });
    it('filePath as undefined', async () => {
        const config = await readOptions<PrinterOptions>();
        expect(config).toBeUndefined();
    });
    it('filePath as undefined - with logger', async () => {
        const config = await readOptions<PrinterOptions>(undefined, mockLogger);
        expect(mockLogger.info).toBeCalled();
    });
});
