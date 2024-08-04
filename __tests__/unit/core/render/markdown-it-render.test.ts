import { jest, describe, it, expect } from '@jest/globals';
import { MarkdownItRender } from '../../../../src/core/render/markdown-it-render';

import { mockLogger } from '../../../utils/mock-logger';

import fsAsync from 'fs/promises';
import { PathLike } from 'fs';

const MarkdownItSup = require('markdown-it-sup');

jest.mock('fs/promises');
const testTemplateMark = '<!-- markdown-it-render-test-template -->';
const templateContents = `
<html>
    ${testTemplateMark}
    <head>
        {{#hljs}}
        <script src="{{js}}"></script>
        <link rel="stylesheet" type="text/css" href="{{css}}" />
        {{/hljs}}
        {{#styles}}
        <link rel="stylesheet" type="text/css" href="{{.}}" />
        {{/styles}}
    </head>
    <body>
        {{#hljs}}
        <script>hljs.highlightAll();</script>
        {{/hljs}}
        {{{body}}}
    </body>
</html>
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

    // add tests for template and hljs;
    describe('Template', () => {
        function mockReadFile(): jest.MockedFunction<typeof fsAsync.readFile> {
            return (
                fsAsync.readFile as jest.MockedFunction<typeof fsAsync.readFile>
            ).mockImplementation(((filePath: any, options: any) => {
                if (filePath === './template.html') {
                    return Promise.resolve(templateContents);
                } else if (filePath === './test.md') {
                    return Promise.resolve('# test\n\nhello world');
                }
            }) as any);
        }
        it('configureTemplate() returns this', async () => {
            const readFileMock = mockReadFile();
            const markdownItRender = new MarkdownItRender();

            const result = await markdownItRender.configureTemplate({
                templatePath: './template.html',
            });

            expect(result).toEqual(markdownItRender);

            readFileMock.mockRestore();
        });
        it('if templatePath is provided, configureTemplate() loads template from file', async () => {
            const readFileMock = mockReadFile();
            const markdownItRender = new MarkdownItRender();
            await markdownItRender.configureTemplate({
                templatePath: './template.html',
            });

            expect(readFileMock).toHaveBeenCalledWith(
                './template.html',
                expect.any(Object)
            );

            readFileMock.mockRestore();
        });
        it('if templatePath is not provided, configureTemplate() loads template from file', async () => {
            const readFileMock = mockReadFile();
            const markdownItRender = new MarkdownItRender();
            await markdownItRender.configureTemplate({});

            expect(readFileMock).not.toHaveBeenCalled();
            readFileMock.mockRestore();
        });
        it('if templatePath is provided, it must be used to render', async () => {
            const readFileMock = mockReadFile();
            const markdownItRender = new MarkdownItRender();
            await markdownItRender.configureTemplate({
                templatePath: './template.html',
            });

            const rendered = markdownItRender.render('# test\n\nhello world');
            expect(rendered.includes(testTemplateMark)).toBeTruthy();
            readFileMock.mockRestore();
        });
        it('if hljs is false, it must not include hljs', async () => {
            const readFileMock = mockReadFile();
            const markdownItRender = new MarkdownItRender();
            await markdownItRender.configureTemplate({
                templatePath: './template.html',
                hljs: false,
            });
            const rendered = markdownItRender.render('# test\n\nhello world');
            expect(
                rendered.includes('<script>hljs.highlightAll();</script>')
            ).toBeFalsy();
            readFileMock.mockRestore();
        });
        it('if hljs is provided, it must include hljs', async () => {
            const testJsUrl = 'https://hoo.bar/test.js';
            const testCssUrl = 'https://hoo.bar/test.css';
            const readFileMock = mockReadFile();
            const markdownItRender = new MarkdownItRender();
            await markdownItRender.configureTemplate({
                templatePath: './template.html',
                hljs: {
                    js: testJsUrl,
                    css: testCssUrl,
                },
            });
            const rendered = markdownItRender.render('# test\n\nhello world');
            expect(rendered.includes(testJsUrl)).toBeTruthy();
            expect(rendered.includes(testCssUrl)).toBeTruthy();
            readFileMock.mockRestore();
        });
    });
});
