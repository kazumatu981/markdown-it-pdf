import { describe, it, expect } from '@jest/globals';
import {
    findFiles,
    filePathToUrl,
    normalizePath,
    buildTreeOfFiles,
} from '../../../../src/core/utils/path-resolver';
import { mockingTestDir, unmockingTestDir } from '../../../utils/test-dir';
import fsPromise from 'fs/promises';
import path from 'path';

describe('CoreLibrary Unit Tests - PathResolver', () => {
    it('Basic Test: Can find markdown files: recursive mode', async () => {
        mockingTestDir();
        const markdownFiles = await findFiles(
            'test',
            true,
            (filePath) => filePath.endsWith('.md'),
            (s) => s
        );
        unmockingTestDir();

        expect(markdownFiles).toContain(path.join('test', 'test.md'));
        expect(markdownFiles).toContain(path.join('test', 'sub', 'test.md'));
        expect(markdownFiles).toContain(path.join('test', 'sub2', 'test.md'));
        expect(markdownFiles).toContain(
            path.join('test', 'sub2', 'sub', 'test.md')
        );
        expect(markdownFiles).not.toContain(path.join('test', 'sample.txt'));
        expect(markdownFiles).toMatchSnapshot();
    });

    it('Basic Test: Can find markdown files: not recursive mode', async () => {
        mockingTestDir();
        const markdownFiles = await findFiles(
            'test',
            false,
            (filePath) => filePath.endsWith('.md'),
            (s) => s
        );
        unmockingTestDir();

        expect(markdownFiles).toContain(path.join('test', 'test.md'));
        expect(markdownFiles).not.toContain(
            path.join('test', 'sub', 'test.md')
        );
        expect(markdownFiles).not.toContain(
            path.join('test', 'sub2', 'test.md')
        );
        expect(markdownFiles).not.toContain(
            path.join('test', 'sub2', 'sub', 'test.md')
        );
        expect(markdownFiles).not.toContain(path.join('test', 'sample.txt'));
        expect(markdownFiles).toMatchSnapshot();
    });

    it('Error cases: Throws on root dir not found', async () => {
        mockingTestDir();
        expect(() =>
            findFiles(
                'test/does/not/exist',
                true,
                (filePath) => filePath.endsWith('.md'),
                (s) => s
            )
        ).rejects.toThrow();
        unmockingTestDir();
    });
    it('Error cases: Throws on file', async () => {
        mockingTestDir();
        expect(() =>
            findFiles(
                'test.md',
                true,
                (filePath) => filePath.endsWith('.md'),
                (s) => s
            )
        ).rejects.toThrow();
        unmockingTestDir();
    });
});

describe('CoreLibrary Unit Tests - filePathToUrl', () => {
    const rootDir = 'path';

    it('should convert a relative file path to a URL relative to the root directory', () => {
        const filePath = 'path/to/file.txt';
        const expectedUrl = '/to/file.txt';
        expect(filePathToUrl(rootDir, filePath)).toEqual(expectedUrl);
    });

    it('should throw an error if the file path is absolute', () => {
        const filePath = '/path2/to/file.txt';
        expect(() => filePathToUrl(rootDir, filePath)).toThrow(
            'Path is not in rootDir'
        );
    });

    it('should throw an error if the file path is not in the root directory', () => {
        const filePath = '../path2/to/file.txt';
        expect(() => filePathToUrl(rootDir, filePath)).toThrow(
            'Path is not in rootDir'
        );
    });
});

describe('CoreLibrary Unit Tests - normalizePath', () => {
    it('should normalize a relative file path', () => {
        const filePath = 'path/to/file.txt';
        const expectedNormalizedPath = 'path/to/file.txt';
        expect(normalizePath(filePath)).toEqual(expectedNormalizedPath);
    });

    it('should replace Windows-style path separators with POSIX-style separators', () => {
        const filePath = 'path\\to\\file.txt';
        const expectedNormalizedPath = 'path/to/file.txt';
        expect(normalizePath(filePath)).toEqual(expectedNormalizedPath);
    });

    it('should throw an error if the file path is absolute', () => {
        const filePath = '/path/to/file.txt';
        expect(() => normalizePath(filePath)).toThrow('Path must be relative');
    });
});

describe('CoreLibrary Unit Tests - buildTreeOfFiles', () => {
    it('should build a tree of directories', async () => {
        mockingTestDir();
        const files = ['path/to/file.txt', 'path/to/sub/file.txt'];
        await buildTreeOfFiles(files);
        // test that the directories were created
        const children = await fsPromise.readdir('path/to');
        expect(children).toContain('sub');

        unmockingTestDir();
    });
});
