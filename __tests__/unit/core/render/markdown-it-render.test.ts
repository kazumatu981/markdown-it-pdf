import { jest, describe, it, expect } from '@jest/globals';
import { MarkdownItRender } from '../../../../src/core/render/markdown-it-render';

import { mockLogger } from '../../../utils/mock-logger';

import fsAsync from 'fs/promises';

const MarkdownItSup = require('markdown-it-sup');

jest.mock('fs/promises');

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
        const result = markdownItRender.render('# test\n\nhello world');
        expect(result).toMatchSnapshot();
    });
    it('Render Test: Can use plugins', async () => {
        const markdownItRender = new MarkdownItRender();
        markdownItRender.use(MarkdownItSup);
        const result = markdownItRender.render('# test\n\nhello ^world^');
        expect(result).toMatchSnapshot();
    });
    it('Render Test: Styles are rendered (styleFilePaths)', async () => {
        const markdownItRender = new MarkdownItRender();
        markdownItRender.addStyles(['./test.css']);
        const result = markdownItRender.render('# test\n\nhello world');
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
});
