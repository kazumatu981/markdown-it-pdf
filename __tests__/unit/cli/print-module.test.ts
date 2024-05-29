import { jest, expect, describe, it } from '@jest/globals';
import { ConsoleLogger } from '../../../src/common/logger';
import { mockLogger } from '../../utils/mock-logger';
import printModule from '../../../src/cli/print-module';
import { mockingTestDir, unmockingTestDir } from '../../utils/test-dir';
jest.mock('../../../src/common/logger', () => ({
    ConsoleLogger: jest.fn(() => {
        return mockLogger;
    }),
}));

describe('yargs module unit tests - print-module', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    afterAll(() => {
        jest.restoreAllMocks();
    });
    it('handler', async () => {
        mockingTestDir();
        await printModule.handler({
            dir: 'test',
            outputDir: 'pdf',
        });
        unmockingTestDir();
        expect(mockLogger.info).toMatchSnapshot();
    });
});
