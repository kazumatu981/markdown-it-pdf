import { jest, describe, it, expect, afterEach } from '@jest/globals';
const mockFs = require('mock-fs');

import { ConfigGenerator } from '../../../src/core/config/config-generator';
import { DefaultConfigDefines } from '../../../src/core/config/default-config-defines';
import { readOptions } from '../../../src/core/config/configure';
import { type PrinterOptions } from '../../../src/markdown-it-pdf-interfaces';

describe('Unit Tests - ConfigGenerator', () => {
    describe('generate()', () => {
        afterEach(() => {
            mockFs.restore();
        });
        it('config js file', async () => {
            mockFs({});
            const configGenerator = new ConfigGenerator(DefaultConfigDefines);
            await configGenerator.generate('/config.js');

            const options = await readOptions<PrinterOptions>('/config.js');
            expect(options).not.toBeUndefined();
            expect(options?.port).toEqual(3000);
        });
        it('config json file', async () => {
            mockFs({});
            const configGenerator = new ConfigGenerator(DefaultConfigDefines);
            await configGenerator.generate('/config.json');

            const options = await readOptions<PrinterOptions>('/config.json');
            expect(options).not.toBeUndefined();
            expect(options?.port).toEqual(3000);
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
