import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../../src/core/markdown-render-server';
import { mockingTestDir, unmockingTestDir } from '../../utils/test-dir';
import { readFromServer } from '../../utils/http-util';

describe('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    describe('serverListener', () => {
        it('can render md file', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
            });

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
        it('can render style file', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
            });

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
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
            });

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
        it('root dir is not found', async () => {
            mockingTestDir();
            const server = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
            });

            const port = await server.listen();

            const notFound = await readFromServer(`http://localhost:${port}`);

            unmockingTestDir();
            expect(notFound.statusCode).toEqual(404);
            expect(notFound.contentType).toEqual('text/plain');
            expect(notFound).toMatchSnapshot('Root is Not Found');
            server.close();
        });
    });

    describe('fail to listen on retrying', () => {
        it('if port is already in use', async () => {
            mockingTestDir();
            const server0 = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
            });
            const server1 = await MarkdownRenderServer.createInstance({
                rootDir: 'test',
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
    });
});
