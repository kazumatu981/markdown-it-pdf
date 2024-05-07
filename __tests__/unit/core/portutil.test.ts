import { jest, expect, describe, it } from '@jest/globals';

import { tryToListen } from '../../../src/core/port-util';
describe('CoreLibrary Unit Tests - port util', () => {
    it('should return a valid port', async () => {
        const serverPort = await tryToListen();
        expect(serverPort).not.toBeUndefined();
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
    it('should throw on error, if th range is invalid', async () => {
        expect(async () => {
            await tryToListen(undefined, { range: { min: 3001, max: 3000 } });
        }).rejects.toThrow();
    });
});
