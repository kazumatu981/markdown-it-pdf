import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../../src/core/markdown-render-server';

import { mockingTestDir, unmockingTestDir } from '../../utils/test-dir';
import http from 'http';

jest.mock('http');

describe('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    const listenFn = jest.fn((port, cb: () => {}) => {
        cb();
    });
    const onFn = jest.fn();
    const closeFn = jest.fn();
    beforeEach(() => {
        (http.createServer as jest.Mock).mockReturnValue({
            listen: listenFn,
            on: onFn,
            close: closeFn,
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createInstance', () => {
        it('createInstance', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
                externalUrls: ['https://hoo.bar/styles/test.css'],
            });
            unmockingTestDir();
            expect(http.createServer).not.toHaveBeenCalled();
            expect(onFn).not.toHaveBeenCalled();
        });
    });
    describe('listen', () => {
        describe('on omit options of `createInstance`', () => {
            it('on omit `listen` port.', async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance();
                await server.listen();
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(
                    expect.any(Number),
                    expect.any(Function)
                );
            });
            it('on set `listen` port.', async () => {
                mockingTestDir();
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance();
                await server.listen(3030);
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3030, expect.any(Function));
            });
        });
        describe("on omit option's port property of `createInstance`", () => {
            it('on omit `listen` port.', async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({});
                await server.listen();
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(
                    expect.any(Number),
                    expect.any(Function)
                );
            });
            it('on set `listen` port.', async () => {
                mockingTestDir();
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({});
                await server.listen(3030);
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3030, expect.any(Function));
            });
        });
        describe("on set option's port property of `createInstance`", () => {
            it('on omit `listen` port.', async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({
                    port: 3100,
                });
                await server.listen();
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3100, expect.any(Function));
            });
            it('on set `listen` port.', async () => {
                mockingTestDir();
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({
                    port: 3100,
                });
                await server.listen(3030);
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3030, expect.any(Function));
            });
        });

        describe("should return server's port", () => {
            it("should return server's port", async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({
                    port: 3100,
                });
                const port = await server.listen();
                unmockingTestDir();
                expect(server.listeningPort).toEqual(3100);
                expect(port).toEqual(3100);
            });
        });
    });
    describe('close', () => {
        it('close call the server close', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
                externalUrls: ['https://hoo.bar/styles/test.css'],
            });
            await server.listen();
            server.close();
            unmockingTestDir();
            expect(closeFn).toBeCalledTimes(1);
        });
        it('to do nothing on close, if the server is not listening', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
                externalUrls: ['https://hoo.bar/styles/test.css'],
            });
            server.close();
            unmockingTestDir();
            expect(closeFn).toBeCalledTimes(0);
        });
    });
});
