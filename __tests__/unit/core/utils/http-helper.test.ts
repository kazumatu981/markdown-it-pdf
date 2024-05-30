import { jest, expect, describe, it, afterEach } from '@jest/globals';
import { mockLogger } from '../../../utils/mock-logger';

import { tryToListen } from '../../../../src/core/utils/http-helper';

describe('CoreLibrary Unit Tests - http-helper', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a valid port', async () => {
        const serverPort = await tryToListen();
        expect(serverPort).not.toBeUndefined();
        serverPort?.httpServer?.close();
    });

    it('should return a valid port - with logger', async () => {
        const serverPort = await tryToListen(undefined, undefined, mockLogger);
        expect(serverPort).not.toBeUndefined();
        expect(mockLogger.debug).toBeCalled();
        serverPort?.httpServer?.close();
    });

    it('should return a valid port even if the port is already in use', async () => {
        const serverPort1 = await tryToListen(3000);
        const serverPort = await tryToListen();
        expect(serverPort).not.toBeUndefined();
        serverPort?.httpServer?.close();
        serverPort1?.httpServer?.close();
    });
    it('should return undefined if the port is already in use', async () => {
        const serverPort1 = await tryToListen(3000);
        const serverPort = await tryToListen(3000);
        expect(serverPort).toBeUndefined();
        serverPort?.httpServer?.close();
        serverPort1?.httpServer?.close();
    });
    it('should return undefined if the port is already in use - with logger', async () => {
        const serverPort1 = await tryToListen(3000, undefined, mockLogger);
        const serverPort = await tryToListen(3000, undefined, mockLogger);

        expect(mockLogger.error).toMatchSnapshot(
            'on to have been duplicated port, logger error'
        );
        expect(mockLogger.warn).toMatchSnapshot(
            'on to have been duplicated port, logger warn'
        );
        expect(mockLogger.info).toMatchSnapshot(
            'on to have been duplicated port, logger info'
        );
        expect(mockLogger.debug).toMatchSnapshot(
            'on to have been duplicated port, logger debug'
        );
        expect(mockLogger.trace).toBeCalled();

        serverPort?.httpServer?.close();
        serverPort1?.httpServer?.close();
    });
    it('should throw on error, if th range is invalid', async () => {
        expect(async () => {
            await tryToListen(undefined, { range: { min: 3001, max: 3000 } });
        }).rejects.toThrow();
    });
});
