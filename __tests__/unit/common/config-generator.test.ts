import { jest, describe, it, expect, afterEach } from '@jest/globals';

import { ConfigGenerator } from '../../../src/common/config-generator';
import { DefaultConfigDefine } from '../../../src/common/config-define';

describe('Unit Tests - ConfigGenerator', () => {
    it('generate config json data', async () => {
        const configGenerator = new ConfigGenerator(DefaultConfigDefine);
        const configString = await configGenerator.formatJson();
        expect(configString).toMatchSnapshot();
    });
    it('generate config script', async () => {
        const configGenerator = new ConfigGenerator(DefaultConfigDefine);
        const configString = await configGenerator.formatJs();
        expect(configString).toMatchSnapshot();
    });
});
