import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../src/core/markdown-render-server';

import { mockingTestDir, unmockingTestDir } from '../utils/test-dir';
import http from 'http';

jest.mock('http');

describe('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    const listenFn = jest.fn();
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
            expect(http.createServer).toBeCalledTimes(1);
            expect(onFn).toBeCalledTimes(1);
            expect(onFn).toBeCalledWith('request', expect.any(Function));
        });
    });
    describe('listen', () => {
        describe('on omit options of `createInstance`', () => {
            it('on omit `listen` port.', async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance();
                server.listen();
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3000);
            });
            it('on set `listen` port.', async () => {
                mockingTestDir();
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance();
                server.listen(3030);
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3030);
            });
        });
        describe("on omit option's port property of `createInstance`", () => {
            it('on omit `listen` port.', async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({});
                server.listen();
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3000);
            });
            it('on set `listen` port.', async () => {
                mockingTestDir();
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({});
                server.listen(3030);
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3030);
            });
        });
        describe("on set option's port property of `createInstance`", () => {
            it('on omit `listen` port.', async () => {
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({
                    port: 3100,
                });
                server.listen();
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3100);
            });
            it('on set `listen` port.', async () => {
                mockingTestDir();
                mockingTestDir();
                const server = await MarkdownRenderServer.createInstance({
                    port: 3100,
                });
                server.listen(3030);
                unmockingTestDir();
                expect(listenFn).toBeCalledTimes(1);
                expect(listenFn).toBeCalledWith(3030);
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
            server.close();
            unmockingTestDir();
            expect(closeFn).toBeCalledTimes(1);
        });
    });
});
