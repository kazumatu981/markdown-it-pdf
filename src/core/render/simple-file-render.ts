import fsPromises from 'fs/promises';
import type { FileRender } from './file-render';

/**
 * The implementation of the render function for plain text or binary files.
 */
export class SimpleFileRender implements FileRender {
    _charset?: string;

    /**
     * constructs a new instance of the SimpleFileRender class.
     * @param charset - The charset of the file.
     */
    public constructor(charset?: string) {
        this._charset = charset;
    }

    /**
     * Reads the contents of a file and returns it as a string or Buffer.
     * @param filePath {string} - The path of the file to read.
     * @returns {Promise<string | Buffer>} A promise that resolves to the contents of the file as a string or Buffer.
     */
    public renderFromFile(filePath: string): Promise<string | Buffer> {
        return fsPromises.readFile(filePath, {
            encoding: this._charset as BufferEncoding,
        });
    }
}

/**
 * The plain text file render function.
 */
export const utf8PlainTextRender = new SimpleFileRender('utf8');
/**
 * The binary file render function.
 */
export const binaryRender = new SimpleFileRender();
/**
 * The default render function. render as binary file.
 */
export const defaultRender = binaryRender;
