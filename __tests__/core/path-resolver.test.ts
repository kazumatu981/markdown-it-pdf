import { describe, it, expect } from '@jest/globals';
import { findMarkdownFiles } from '../../src/core/path-resolver';
import path from 'path';

const mockFs = require('mock-fs');

function mockingTestDir() {
    mockFs({
        'test.md': '# test\n\nhello world',
        'sample.txt': 'hello world',
        test: {
            'test.md': '# test\n\nhello world',
            'sample.txt': 'hello world',
            sub: {
                'test.md': '# test\n\nhello world',
                'sample.txt': 'hello world',
            },
            sub2: {
                'test.md': '# test\n\nhello world',
                'sample.txt': 'hello world',
                sub: {
                    'test.md': '# test\n\nhello world',
                    'sample.txt': 'hello world',
                },
            },
        },
    });
}
function unmockingTestDir() {
    mockFs.restore();
}

describe('CoreLibrary Unit Tests - PathResolver', () => {
    it('Basic Test: Can find markdown files: recursive mode', async () => {
        mockingTestDir();
        const markdownFiles = await findMarkdownFiles('test');
        unmockingTestDir();

        expect(markdownFiles).toContain(path.join('test', 'test.md'));
        expect(markdownFiles).toContain(path.join('test', 'sub', 'test.md'));
        expect(markdownFiles).toContain(path.join('test', 'sub2', 'test.md'));
        expect(markdownFiles).toContain(path.join('test', 'sub2', 'sub', 'test.md'));
        expect(markdownFiles).not.toContain(path.join('test', 'sample.txt'));
        expect(markdownFiles).toMatchSnapshot();
    });

    it('Basic Test: Can find markdown files: not recursive mode', async () => {
        mockingTestDir();
        const markdownFiles = await findMarkdownFiles('test', false);
        unmockingTestDir();

        expect(markdownFiles).toContain(path.join('test', 'test.md'));
        expect(markdownFiles).not.toContain(path.join('test', 'sub', 'test.md'));
        expect(markdownFiles).not.toContain(path.join('test', 'sub2', 'test.md'));
        expect(markdownFiles).not.toContain(path.join('test', 'sub2', 'sub', 'test.md'));
        expect(markdownFiles).not.toContain(path.join('test', 'sample.txt'));
        expect(markdownFiles).toMatchSnapshot();
    });

    it('Error cases: Throws on root dir not found', async () => {
        mockingTestDir();
        expect(() => findMarkdownFiles('test/does/not/exist')).rejects.toThrow();
        unmockingTestDir();
    });
    it('Error cases: Throws on file', async () => {
        mockingTestDir();
        expect(() => findMarkdownFiles('test.md')).rejects.toThrow();
        unmockingTestDir();
    });
});
