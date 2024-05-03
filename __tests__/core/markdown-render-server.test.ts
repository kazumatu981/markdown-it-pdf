import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../src/core/markdown-render-server';
import { type ContentsMapEntity } from '../../src/core/contents-map';
import { MarkdownItRender } from '../../src/core/markdown-it-render';
import http from 'http';
import { mockingTestDir, unmockingTestDir } from '../utils/test-dir';
import { before } from 'node:test';

function readFromServer(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
    });
}

describe.skip('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    it('Render Test', async () => {
        mockingTestDir();

        const server = await MarkdownRenderServer.createInstance({
            rootDir: 'test',
            externalUrls: ['https://hoo.bar/styles/test.css'],
        });

        server.listen();

        const htmlData = await readFromServer(
            'http://localhost:3000/sub/test.md'
        );
        const pdfData = await readFromServer(
            'http://localhost:3000/sub/test.md.pdf'
        );

        server.close();
        unmockingTestDir();
        expect(htmlData).toMatchSnapshot();
        expect(pdfData).toMatchSnapshot();
    });
});
