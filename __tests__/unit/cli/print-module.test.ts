import { jest, expect, describe, it } from '@jest/globals';
import { ConsoleLogger } from '../../../src/common/logger';
import { mockLogger, resetMockLogger } from '../../utils/mock-logger';
import { getFirstArgsOf } from '../../utils/mock-utils';
import printModule from '../../../src/cli/print-module';
import { mockingTestDir, unmockingTestDir } from '../../utils/test-dir';
import { type Argv } from 'yargs';

jest.mock('../../../src/common/logger', () => ({
    ConsoleLogger: jest.fn(() => {
        return mockLogger;
    }),
}));

describe('yargs module unit tests - print-module', () => {
    it('builder', () => {
        const yargsMock = {
            positional: jest.fn(() => {
                return yargsMock;
            }),
        } as unknown as Argv<{}>;

        printModule.builder(yargsMock);
        const positionalArgs = getFirstArgsOf(yargsMock.positional);
        expect(positionalArgs).toMatchSnapshot();
    });

    it('handler', async () => {
        mockingTestDir();
        await printModule.handler({
            dir: 'test',
            outputDir: 'pdf',
        });
        unmockingTestDir();

        const loggerInfoArgs = getFirstArgsOf(mockLogger.info);
        expect(loggerInfoArgs).toMatchSnapshot();

        const loggerDebugArgs = getFirstArgsOf(mockLogger.debug);
        expect(loggerDebugArgs).toMatchSnapshot();
        resetMockLogger();
    });
});
