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
export function findFiles<T>(
    rootDir: string,
    recursive: boolean,
    isMatch: IsMatchFunction,
    transform: TransformFunction<T>
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        fsPromises
            .readdir(rootDir, { withFileTypes: true })
            .then((elements) => {
                const markdownFiles = elements
                    .filter((e) => e.isFile() && isMatch(path.extname(e.name)))
                    .map((e) => path.join(rootDir, e.name))
                    .map(transform);
                if (recursive) {
                    Promise.all(
                        elements
                            .filter((e) => e.isDirectory())
                            .map((e) => path.join(rootDir, e.name))
                            .map((d) =>
                                findFiles(d, recursive, isMatch, transform)
                            )
                    )
                        .then((subMarkdownFiles) => {
                            resolve(markdownFiles.concat(...subMarkdownFiles));
                        })
                        .catch(reject);
                } else {
                    resolve(markdownFiles);
                }
            })
            .catch(reject);
    });
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
