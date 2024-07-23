import { jest, describe, it, expect, afterEach } from '@jest/globals';

import { ConfigGenerator } from '../../../src/core/config/config-generator';
import { DefaultConfigDefines } from '../../../src/core/config/default-config-defines';

describe('Unit Tests - ConfigGenerator', () => {
    it('generate config json data', async () => {
        const configGenerator = new ConfigGenerator(DefaultConfigDefines);
        const configString = await configGenerator.formatJson();
        expect(configString).toMatchSnapshot();
    });
    it('generate config script', async () => {
        const configGenerator = new ConfigGenerator(DefaultConfigDefines);
        const configString = await configGenerator.formatJs();
        expect(configString).toMatchSnapshot();
    });
});
