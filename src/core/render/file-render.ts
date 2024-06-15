import fsPromises from 'fs/promises';

/**
 * The render function for a file.
 */
export interface FileRender {
    /**
     * Asynchronously renders a file to HTML.
     * @param filePath - The path of the file to render.
     */
    renderFromFile(filePath: string): Promise<string | Buffer>;
}

/**
 * The implementation of the render function for plain text files.
 */
export class PlainTextRender implements FileRender {
    /**
     * The charset of the file.
     */
    private _charset: string;

    /**
     * Constructs a new instance of the PlainTextRender class.
     * @param charset - The charset of the file.
     */
    constructor(charset: string) {
        /**
         * The charset of the file.
         */
        this._charset = charset;
    }

    /**
     * Asynchronously reads the contents of a file and returns it as a string.
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<string>} A promise that resolves to the contents of the file as a string.
     */
    renderFromFile(filePath: string): Promise<string> {
        // Read the contents of the file and return it as a string.
        // The `encoding` option is set to the charset of the file.
        return fsPromises.readFile(filePath, {
            encoding: this._charset as BufferEncoding,
        });
    }
}

/**
 * The implementation of the render function for binary files.
 */
export class BinaryRender implements FileRender {
    /**
     * Asynchronously reads the contents of a binary file and returns it as a Buffer.
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<Buffer>} A promise that resolves to the contents of the file as a Buffer.
     */
    public renderFromFile(filePath: string): Promise<Buffer> {
        // Read the contents of the file and return it as a Buffer.
        // The `encoding` option is set to `null`, indicating that the file is binary.
        return fsPromises.readFile(filePath, null);
    }
}

export const utf8PlainTextRender = new PlainTextRender('utf8');
export const binaryRender = new BinaryRender();
export const defaultRender = binaryRender;
