import fsPromises from 'fs/promises';

export interface FileRender {
    renderFromFile(filePath: string): Promise<string | Buffer>;
}

export class PlainTextRender implements FileRender {
    private _charset: string;
    constructor(charset: string) {
        this._charset = charset;
    }
    renderFromFile(filePath: string): Promise<string> {
        return fsPromises.readFile(filePath, {
            encoding: this._charset as BufferEncoding,
        });
    }
}

export class BinaryRender implements FileRender {
    renderFromFile(filePath: string): Promise<Buffer> {
        return fsPromises.readFile(filePath);
    }
}

export const utf8PlainTextRender = new PlainTextRender('utf8');
export const binaryRender = new BinaryRender();
export const defaultRender = binaryRender;
