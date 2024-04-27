import fs from 'fs';
import path from 'path';

export async function findMarkdownFiles(
    rootDir: string,
    recursive: boolean = true
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(rootDir, { withFileTypes: true }, (err, elements) => {
            if (err) {
                reject(err);
                return;
            }
            const markdownFiles = elements
                .filter((e) => e.isFile() && path.extname(e.name) === '.md')
                .map((e) => path.join(rootDir, e.name));
            if (recursive) {
                const subDirs = elements
                    .filter((e) => e.isDirectory())
                    .map((e) => path.join(rootDir, e.name));
                Promise.all(
                    subDirs.map((d) => findMarkdownFiles(d, recursive))
                ).then((subMarkdownFiles) => {
                    resolve(markdownFiles.concat(...subMarkdownFiles));
                });
            } else {
                resolve(markdownFiles);
            }
        });
    });
}
