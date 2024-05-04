import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';

type IsMatchFunction = (filePath: string) => boolean;
type TransformFunction<T> = (filePath: string) => T;

/**
 * Finds files in a given directory and returns an array of transformed results.
 *
 * @param {string} rootDir - The root directory to start the search from.
 * @param {boolean} recursive - Whether to search recursively in subdirectories.
 * @param {IsMatchFunction} isMatch - A function to check if a file matches a certain criteria.
 * @param {TransformFunction<T>} transform - A function to transform each found file.
 * @return {Promise<T[]>} A promise that resolves to an array of transformed file results.
 */
export async function findFiles<T>(
    rootDir: string,
    recursive: boolean,
    isMatch: IsMatchFunction,
    transform: TransformFunction<T>
): Promise<T[]> {
    const elements = await fsPromises.readdir(rootDir, { withFileTypes: true });
    const fileElements = elements
        .filter((e) => e.isFile() && isMatch(e.name))
        .map((e) => path.join(rootDir, e.name))
        .map(transform);
    if (recursive) {
        const subFileElements = await Promise.all(
            elements
                .filter((e) => e.isDirectory())
                .map((e) => path.join(rootDir, e.name))
                .map((d) => findFiles(d, recursive, isMatch, transform))
        );

        fileElements.push(...subFileElements.flat());
    }
    return fileElements;
}
/**
 * Converts a file path to a URL relative to the root directory.
 *
 * @param {string} rootDir - The root directory path.
 * @param {string} filePath - The file path to convert.
 * @return {string} The URL representing the file path relative to the root directory.
 * @throws {Error} If the file path is not in the root directory.
 */
export function filePathToUrl(rootDir: string, filePath: string): string {
    rootDir = path.resolve(process.cwd(), rootDir);
    filePath = path.resolve(process.cwd(), filePath);
    const relativePath = normalizePath(path.relative(rootDir, filePath));
    if (relativePath.startsWith('.')) {
        throw new Error('Path is not in rootDir');
    }
    return `/${relativePath}`;
}

/**
 * Normalizes a file path by converting it to a relative path and replacing any
 * Windows-style path separators with POSIX-style separators. Throws an error if
 * the file path is absolute.
 *
 * @param {string} filePath - The file path to normalize.
 * @return {string} The normalized file path.
 * @throws {Error} If the file path is absolute.
 */
export function normalizePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
        throw new Error('Path must be relative');
    }
    return path.normalize(filePath).split(path.win32.sep).join(path.posix.sep);
}

/**
 * Asynchronously builds a tree of directories based on the provided array of file paths.
 *
 * @param {string[]} files - An array of file paths.
 * @return {Promise<void>} A promise that resolves when the tree of directories is built successfully, or rejects with an error if there was a problem.
 */
export async function buildTreeOfFiles(files: string[]): Promise<void> {
    const dirs = Array.from(new Set(files.map((file) => path.dirname(file))));
    return new Promise((resolve, reject) => {
        Promise.all<void>(
            dirs.map(async (dir) => {
                await fsPromises.mkdir(dir, { recursive: true });
            })
        )
            .then((_) => resolve())
            .catch((err) => reject(err));
    });
}
