import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../src/core/markdown-render-server';
import { ContentsMap } from '../../src/core/contents-map';
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
        const render = new MarkdownItRender();

        const contentsMap = new ContentsMap(render);
        contentsMap.set('/test/test.md', {
            type: 'markdown',
            contentPath: 'test/test.md',
        });

        const server = new MarkdownRenderServer();
        server.map(contentsMap).listen(3000);

        const data = await readFromServer('http://localhost:3000/test/test.md');

        server.close();
        unmockingTestDir();
        expect(data).toMatchSnapshot();
    });
});
