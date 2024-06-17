import path from 'path';
import { SafeMap } from './safe-map';

interface ExtensionTypeInfo {
    renderType: string;
    contentType: string;
    resolvedContentType?: string;
}

/**
 * A class that maps file extensions to their associated resolver types and content types.
 */
export class ExtensionMap extends SafeMap<string, ExtensionTypeInfo> {
    /**
     * Test the file name against the list of supported extensions.
     * @param {string} fileName - The file name to check.
     * @returns {boolean} True if the file name is supported, false otherwise.
     */
    public isSupported(fileName: string): boolean {
        return this.has(path.extname(fileName));
    }
}

const defaultTypeInfo: ExtensionTypeInfo = {
    renderType: 'binary',
    contentType: 'application/octet-stream',
};

/**
 * The default extension map.
 */
export const DefaultExtensionMap: ExtensionMap = new ExtensionMap(
    defaultTypeInfo,
    [
        [
            '.md',
            {
                renderType: 'markdown',
                contentType: 'text/markdown',
                resolvedContentType: 'text/html',
            },
        ],
        [
            '.css',
            {
                renderType: 'style',
                contentType: 'text/css',
            },
        ],
        [
            '.txt',
            {
                renderType: 'plainText',
                contentType: 'text/plain',
            },
        ],
        [
            '.png',
            {
                renderType: 'binary',
                contentType: 'image/png',
            },
        ],
        [
            '.jpg',
            {
                renderType: 'binary',
                contentType: 'image/jpeg',
            },
        ],
        [
            '.jpeg',
            {
                renderType: 'binary',
                contentType: 'image/jpeg',
            },
        ],
        [
            '.gif',
            {
                renderType: 'binary',
                contentType: 'image/gif',
            },
        ],
        [
            '.svg',
            {
                renderType: 'binary',
                contentType: 'image/svg+xml',
            },
        ],
        [
            '.pdf',
            {
                renderType: 'pdf',
                contentType: 'application/pdf',
            },
        ],
    ]
);
