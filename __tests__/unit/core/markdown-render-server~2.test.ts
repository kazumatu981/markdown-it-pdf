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
            expect(cssData.contentType).toEqual('text/css');
            expect(cssData).toMatchSnapshot('rendered css file');
            server.close();
        });
    });
});
