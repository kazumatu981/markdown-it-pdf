import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../../src/core/markdown-render-server';
import { mockingTestDir, unmockingTestDir } from '../../utils/test-dir';
import { readFromServer } from '../../utils/http-util';

import { mockLogger } from '../../utils/mock-logger';

describe('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    describe('serverListener', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('can render md file', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance('test');

            const port = await server.listen();

            const htmlData = await readFromServer(
                `http://localhost:${port}/test.md`
            );

            unmockingTestDir();
            expect(htmlData.statusCode).toEqual(200);
            expect(htmlData.contentType).toEqual('text/html');
            expect(htmlData).toMatchSnapshot('rendered md file');
            server.close();
        });
        it('can render md file - with logger', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance(
                'test',
                {},
                mockLogger
            );

            const port = await server.listen(3001);

            const htmlData = await readFromServer(
                `http://localhost:${port}/test.md`
            );

            unmockingTestDir();
            expect(htmlData.statusCode).toEqual(200);
            expect(htmlData.contentType).toEqual('text/html');
            expect(htmlData).toMatchSnapshot('rendered md file');
            expect(mockLogger.debug).toMatchSnapshot();
            server.close();
        });
        it('can render style file', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance('test');

            const port = await server.listen();

            const cssData = await readFromServer(
                `http://localhost:${port}/test.css`
            );

            unmockingTestDir();
            expect(cssData.statusCode).toEqual(200);
            expect(cssData.contentType).toEqual('text/css');
            expect(cssData).toMatchSnapshot('rendered css file');
            server.close();
        });
        it('can render txt file', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance('test');

            const port = await server.listen();

            const txtData = await readFromServer(
                `http://localhost:${port}/sample.txt`
            );

            unmockingTestDir();
            expect(txtData.statusCode).toEqual(200);
            expect(txtData.contentType).toEqual('text/plain');
            expect(txtData).toMatchSnapshot('rendered txt file');
            server.close();
        });
        it('can render jpg file', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance('test');

            const port = await server.listen();

            const txtData = await readFromServer(
                `http://localhost:${port}/sample.jpg`
            );

            unmockingTestDir();
            expect(txtData.statusCode).toEqual(200);
            expect(txtData.contentType).toEqual('image/jpeg');
            expect(txtData).toMatchSnapshot('rendered jpeg file');
            server.close();
        });
        it('root dir is not found', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance('test');

            const port = await server.listen();

            const notFound = await readFromServer(`http://localhost:${port}`);

            unmockingTestDir();
            expect(notFound.statusCode).toEqual(404);
            expect(notFound.contentType).toEqual('text/plain');
            expect(notFound).toMatchSnapshot('Root is Not Found');
            server.close();
        });
        it('root dir is not found - with logger', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance(
                'test',
                {},
                mockLogger
            );

            const port = await server.listen(3002);

            const notFound = await readFromServer(`http://localhost:${port}`);

            unmockingTestDir();
            expect(notFound.statusCode).toEqual(404);
            expect(notFound.contentType).toEqual('text/plain');
            expect(notFound).toMatchSnapshot('Root is Not Found');
            server.close();
            expect(mockLogger.warn).toMatchSnapshot();
        });
    });

    describe('fail to listen on retrying', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('if port is already in use', async () => {
            mockingTestDir();
            const server0 = await MarkdownRenderServer.createInstance('test');
            const server1 = await MarkdownRenderServer.createInstance('test', {
                retry: 1,
                range: { min: 3500, max: 3500 },
            });

            const port0 = await server0.listen(3500);
            await expect(async () => {
                await server1.listen();
            }).rejects.toThrowError();
            await server0.close();
            unmockingTestDir();
        });
        it('if port is already in use - with logger', async () => {
            mockingTestDir();
            const server0 = await MarkdownRenderServer.createInstance('test');
            const server1 = await MarkdownRenderServer.createInstance(
                'test',
                {
                    retry: 1,
                    range: { min: 3500, max: 3500 },
                },
                mockLogger
            );

            const port0 = await server0.listen(3500);
            await expect(async () => {
                await server1.listen();
            }).rejects.toThrowError();
            await server0.close();
            unmockingTestDir();
            expect(mockLogger.error).toMatchSnapshot();
        });
    });
});
