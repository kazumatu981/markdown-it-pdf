import { jest, expect, describe, it } from '@jest/globals';
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
            config: 'test/config.json',
        });
        unmockingTestDir();

        const loggerInfoArgs = getFirstArgsOf(mockLogger.info);
        expect(loggerInfoArgs).toMatchSnapshot();

        const loggerDebugArgs = getFirstArgsOf(mockLogger.debug);
        expect(loggerDebugArgs).toMatchSnapshot();
        resetMockLogger();
    });

    it('handler - on error', async () => {
        mockingTestDir();
        await expect(async () => {
            await printModule.handler({
                dir: 'test2',
                outputDir: 'pdf',
            });
        }).rejects.toThrowError();
        unmockingTestDir();
        const loggerErrorArgs = getFirstArgsOf(mockLogger.error);
        expect(loggerErrorArgs).toMatchSnapshot();
        expect(mockLogger.debug).toBeCalled();
        resetMockLogger();
    });
});
