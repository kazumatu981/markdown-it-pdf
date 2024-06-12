import { jest, expect, describe, it } from '@jest/globals';

import { buildTreeOfFiles } from '../../src/core/utils';
import { readFromServer } from '../utils/http-util';
import { MarkdownItPdf } from '../../src/markdown-it-pdf';
import { ConsoleLogger } from '../../src/common';

describe('render test', () => {
    const logger = new ConsoleLogger('info');
    beforeAll(async () => {
        await buildTreeOfFiles([`${__dirname}/out/test.pdf`]);
    });
    it('render to html on local server', async () => {
        const renderServer = await MarkdownItPdf.createServer(
            `${__dirname}/src`,
            {
                port: 3000,
            },
            logger
        );

        await renderServer.listen();

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

        await renderServer.close();
    });
    it('render and print to pdf', async () => {
        const printer = await MarkdownItPdf.createPrinter(
            `${__dirname}/src`,
            `${__dirname}/out`,
            {
                port: 3001,
            }
        );

        await printer.printAll();
    });
});
