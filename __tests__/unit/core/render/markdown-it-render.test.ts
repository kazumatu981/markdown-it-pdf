import { jest, describe, it, expect } from '@jest/globals';
import { MarkdownItRender } from '../../../../src/core/render/markdown-it-render';

import { mockLogger } from '../../../utils/mock-logger';

import fsAsync from 'fs/promises';
import { PathLike } from 'fs';

const MarkdownItSup = require('markdown-it-sup');

jest.mock('fs/promises');
const templateContents = `
<html>
    <head>
        {{#{styles}}}
        <link rel="stylesheet" type="text/css" href="{{.}}" />
        {{/styles}}
    </head>
    <body>
        {{{body}}}
    </body>
`;

// TODO Add test about Hljs configure.

describe('CoreLibrary Unit Tests - MarkdownItRender', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('Basic Render Test: Can render from file', async () => {
        (
            fsAsync.readFile as jest.MockedFunction<typeof fsAsync.readFile>
        ).mockResolvedValueOnce('# test\n\nhello world');
        const markdownItRender = new MarkdownItRender();
        const result = await markdownItRender.renderFromFile('./test.md');
        expect(result).toMatchSnapshot();
    });
    it('Basic Render Test: Can render from string', async () => {
        const markdownItRender = new MarkdownItRender();
        await markdownItRender.configureTemplate();
        const result = markdownItRender.render('# test\n\nhello world');
        expect(result).toMatchSnapshot();
    });
    it('Render Test: Can use plugins', async () => {
        const markdownItRender = new MarkdownItRender();
        markdownItRender.use(MarkdownItSup);
        await markdownItRender.configureTemplate();
        const result = markdownItRender.render('# test\n\nhello ^world^');
        expect(result).toMatchSnapshot();
    });
    it('Render Test: Styles are rendered (styleFilePaths)', async () => {
        const markdownItRender = new MarkdownItRender();
        markdownItRender.addStyles(['./test.css']);
        const result = markdownItRender.render('# test\n\nhello world');
        await markdownItRender.configureTemplate();
        expect(result).toMatchSnapshot();
    });
    it('Render Test: Styles are rendered (externalStylesUrls)', async () => {
        const markdownItRender = new MarkdownItRender();
        markdownItRender.addExternalStyles(['https://hoo.bar/styles/test.css']);
        const result = markdownItRender.render('# test\n\nhello world');
        expect(result).toMatchSnapshot();
    });
    it('Render Test: with logger', async () => {
        const markdownItRender = new MarkdownItRender();
        markdownItRender._logger = mockLogger;
        markdownItRender.addStyles(['./test.css']);
        markdownItRender.addExternalStyles(['https://hoo.bar/styles/test.css']);
        const result = markdownItRender.render('# test\n\nhello world');
        expect(mockLogger.debug).toMatchSnapshot();
    });

    it('readTemplateFromFile', async () => {
        const markdownItRender = new MarkdownItRender();
        (
            fsAsync.readFile as jest.MockedFunction<typeof fsAsync.readFile>
        ).mockImplementation(((filePath: any, options: any) => {
            if (filePath === './template.html') {
                return Promise.resolve(templateContents);
            } else if (filePath === './test.md') {
                return Promise.resolve('# test\n\nhello world');
            }
        }) as any);

        const result = await markdownItRender.configureTemplate({
            templatePath: './template.html',
        });

        expect(result['templateSource']).toMatchSnapshot();
    });
});
