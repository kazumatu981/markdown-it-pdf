import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import { type Logger, ConsoleLogger } from '../../../src/common/logger';

const methodIndexes = ['trace', 'debug', 'info', 'warn', 'error'];
function createSpyOfLogger(): Logger {
    return {
        trace: jest
            .spyOn(console, 'trace')
            .mockImplementation(() => {}) as unknown as (
            message: any,
            ...args: any[]
        ) => void,
        debug: jest
            .spyOn(console, 'debug')
            .mockImplementation(() => {}) as unknown as (
            message: any,
            ...args: any[]
        ) => void,
        info: jest
            .spyOn(console, 'info')
            .mockImplementation(() => {}) as unknown as (
            message: any,
            ...args: any[]
        ) => void,
        warn: jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {}) as unknown as (
            message: any,
            ...args: any[]
        ) => void,
        error: jest
            .spyOn(console, 'error')
            .mockImplementation(() => {}) as unknown as (
            message: any,
            ...args: any[]
        ) => void,
    };
}

describe('CommonLibrary Unit Tests - ConsoleLogger', () => {
    const spies = createSpyOfLogger();
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should log trace', () => {
        const logger = new ConsoleLogger('trace');
        logger.trace('Test Message %s', 'hello');
        expect(spies.trace).toHaveBeenCalledTimes(1);
        expect(spies.trace).toHaveBeenCalledWith(
            expect.stringContaining('Test Message %s'),
            'hello'
        );
    });
    it('should log debug', () => {
        const logger = new ConsoleLogger('trace');
        logger.debug('Test Message %s', 'hello');
        expect(spies.debug).toHaveBeenCalledTimes(1);
        expect(spies.debug).toHaveBeenCalledWith(
            expect.stringContaining('Test Message %s'),
            'hello'
        );
    });
    it('should log info', () => {
        const logger = new ConsoleLogger('trace');
        logger.info('Test Message %s', 'hello');
        expect(spies.info).toHaveBeenCalledTimes(1);
        expect(spies.info).toHaveBeenCalledWith(
            expect.stringContaining('Test Message %s'),
            'hello'
        );
    });
    it('should log warn', () => {
        const logger = new ConsoleLogger('trace');
        logger.warn('Test Message %s', 'hello');
        expect(spies.warn).toHaveBeenCalledTimes(1);
        expect(spies.warn).toHaveBeenCalledWith(
            expect.stringContaining('Test Message %s'),
            'hello'
        );
    });
    it('should log error', () => {
        const logger = new ConsoleLogger('trace');
        logger.error('Test Message %s', 'hello');
        expect(spies.error).toHaveBeenCalledTimes(1);
        expect(spies.error).toHaveBeenCalledWith(
            expect.stringContaining('Test Message %s'),
            'hello'
        );
    });

    it('if silent, should not log', () => {
        const logger = new ConsoleLogger('silent');
        logger.trace('Test Message %s', 'hello');
        logger.debug('Test Message %s', 'hello');
        logger.info('Test Message %s', 'hello');
        logger.warn('Test Message %s', 'hello');
        logger.error('Test Message %s', 'hello');
        expect(spies.trace).toHaveBeenCalledTimes(0);
        expect(spies.debug).toHaveBeenCalledTimes(0);
        expect(spies.info).toHaveBeenCalledTimes(0);
        expect(spies.warn).toHaveBeenCalledTimes(0);
        expect(spies.error).toHaveBeenCalledTimes(0);
    });
    
    it('if debug set, should debug level', () => {
        const logger = new ConsoleLogger('debug');
        logger.trace('Test Message %s', 'hello');
        logger.debug('Test Message %s', 'hello');
        logger.info('Test Message %s', 'hello');
        logger.warn('Test Message %s', 'hello');
        logger.error('Test Message %s', 'hello');
        expect(spies.trace).toHaveBeenCalledTimes(0);
        expect(spies.debug).toHaveBeenCalledTimes(1);
        expect(spies.info).toHaveBeenCalledTimes(1);
        expect(spies.warn).toHaveBeenCalledTimes(1);
        expect(spies.error).toHaveBeenCalledTimes(1);
    });

    it('if no level set, should info level', () => {
        const logger = new ConsoleLogger();
        logger.trace('Test Message %s', 'hello');
        logger.debug('Test Message %s', 'hello');
        logger.info('Test Message %s', 'hello');
        logger.warn('Test Message %s', 'hello');
        logger.error('Test Message %s', 'hello');
        expect(spies.trace).toHaveBeenCalledTimes(0);
        expect(spies.debug).toHaveBeenCalledTimes(0);
        expect(spies.info).toHaveBeenCalledTimes(1);
        expect(spies.warn).toHaveBeenCalledTimes(1);
        expect(spies.error).toHaveBeenCalledTimes(1);
    });
});
