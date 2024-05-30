import { jest, describe, expect, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../../src/core/markdown-render-server';
import { mockLogger } from '../../utils/mock-logger';

describe('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    describe('exception cases on close', () => {
        it('close on not listening server', async () => {
            const server = new MarkdownRenderServer();
            await expect(server.close()).resolves.toBeUndefined();
        });

        it('rejects on twice call close', async () => {
            const server = await MarkdownRenderServer.createInstance();
            await server.listen();
            await server.close();
            await expect(server.close()).rejects.toThrow();
        }, 10000);
        it('rejects on twice call close - with logger', async () => {
            const server =
                await MarkdownRenderServer.createInstance(mockLogger);
            await server.listen();
            await server.close();
            await expect(server.close()).rejects.toThrow();
            expect(mockLogger.error).toMatchSnapshot();
        }, 10000);
    });
});
