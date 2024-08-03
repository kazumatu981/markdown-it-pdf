import { jest, describe, it, expect, afterEach } from '@jest/globals';
const mockFs = require('mock-fs');
import crypto from 'crypto';
import * as fsPromises from 'fs/promises';

import { ConfigGenerator } from '../../../src/core/config/config-generator';
import { DefaultConfigDefines } from '../../../src/core/config/default-config-defines';
import { readOptions } from '../../../src/core/config/configure';
import { type PrinterOptions } from '../../../src/markdown-it-pdf-interfaces';
import { ConsoleLogger } from '../../../src/core/log/logger';

describe('Unit Tests - ConfigGenerator', () => {
    const logger = new ConsoleLogger();
    describe('generate()', () => {
        afterEach(() => {
            mockFs.restore();
        });
        it('config js file', async () => {
            const extName = '.js';
            const testFile = `${__dirname}/__data__/${crypto.randomUUID()}_config${extName}`;

            const configGenerator = new ConfigGenerator(DefaultConfigDefines);
            await configGenerator.generate(testFile);

            const options = await readOptions<PrinterOptions>(testFile, logger);
            expect(options).not.toBeUndefined();
            expect(options?.port).toEqual(3000);

            await fsPromises.rm(testFile);
        });
        it('config json file', async () => {
            const extName = '.json';
            const testFile = `${__dirname}/__data__/${crypto.randomUUID()}_config${extName}`;

            const configGenerator = new ConfigGenerator(DefaultConfigDefines);
            await configGenerator.generate(testFile);

            const options = await readOptions<PrinterOptions>(testFile, logger);
            expect(options).not.toBeUndefined();
            expect(options?.port).toEqual(3000);

            await fsPromises.rm(testFile);
        });
    });

    describe('format*()', () => {
        it('config script', async () => {
            const configGenerator = new ConfigGenerator(DefaultConfigDefines);
            const configString = await configGenerator.formatJs();
            expect(configString).toMatchSnapshot();
        });

        it('json data', async () => {
            const configGenerator = new ConfigGenerator(DefaultConfigDefines);
            const configString = await configGenerator.formatJson();
            expect(configString).toMatchSnapshot();
        });
    });
});
