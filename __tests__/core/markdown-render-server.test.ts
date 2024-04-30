import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../src/core/markdown-render-server';
import { type ContentsMapEntity } from '../../src/core/contents-map';
import { MarkdownItRender } from '../../src/core/markdown-it-render';
import http from 'http';
import { mockingTestDir, unmockingTestDir } from '../utils/test-dir';

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

describe('CoreLibrary Unit Tests - MarkdownRenderServer', () => {
    it('Basic Test', async () => {
        mockingTestDir();

        const server = await MarkdownRenderServer.createInstance({
            rootDir: 'test',
            externalUrls: ['https://hoo.bar/styles/test.css'],
        });

        server.listen(3000);

        const data = await readFromServer('http://localhost:3000/sub/test.md');

        server.close();
        unmockingTestDir();
        expect(data).toMatchSnapshot();
    });
});
