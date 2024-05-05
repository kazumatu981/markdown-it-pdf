import { jest, expect, describe, it } from '@jest/globals';
import { MarkdownRenderServer } from '../../src/core/markdown-render-server';
import { printOnePage } from '../../src/core/puppeteer-pdf-printer';
import { buildTreeOfFiles } from '../../src/core/path-resolver';
import fsPromises from 'fs/promises';
import http from 'http';

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
describe('render test', () => {
    beforeAll(async () => {
        await buildTreeOfFiles([`${__dirname}/out/test.pdf`]);
    });
    it('render to html on local server', async () => {
        const server = await MarkdownRenderServer.createInstance({
            rootDir: `${__dirname}/src`,
            externalUrls: ['https://hoo.bar/styles/test.css'],
        });

        server.listen();

        const htmlData = await readFromServer('http://localhost:3000/test.md');
        expect(htmlData).toMatchSnapshot('html file');

        const cssData = await readFromServer('http://localhost:3000/test.css');
        expect(cssData).toMatchSnapshot('css file');

        const txtData = await readFromServer('http://localhost:3000/test.txt');
        expect(txtData).toMatchSnapshot('txt file');

        const subMdData = await readFromServer(
            'http://localhost:3000/sub/hello.md'
        );
        expect(subMdData).toMatchSnapshot('MD file on sub directory');

        const notFoundData = await readFromServer(
            'http://localhost:3000/xxx/hello.md'
        );
        expect(notFoundData).toMatchSnapshot('Not Found');

        server.close();
    });
    it('render and print to pdf', async () => {
        const server = await MarkdownRenderServer.createInstance({
            rootDir: `${__dirname}/src`,
            externalUrls: ['https://hoo.bar/styles/test.css'],
        });

        server.listen();

        await printOnePage(
            'http://localhost:3000',
            'test.md',
            `${__dirname}/out`
        );

        server.close();
    });
});

describe('test as http server', () => {});
