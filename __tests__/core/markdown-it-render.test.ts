import { MarkdownItRender } from '../../src/core/markdown-it-render';
import { jest } from '@jest/globals';
import fsAsync from 'fs/promises';

jest.mock('fs/promises');

describe('markdown-it', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should render', async () => {
        (fsAsync.readFile as jest.MockedFunction<typeof fsAsync.readFile>).mockResolvedValueOnce(
            '# test\n\nhello world'
        );
        const markdownItRender = new MarkdownItRender({
            styleFilePaths: ['./test.css'],
        });
        const result = await markdownItRender.renderFromFileAsync('./test.md');
        expect(result).toMatchSnapshot();
    });
});
