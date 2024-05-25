import path from 'path';
import { type ResolverType } from './resolver-map';

interface ExtensionTypeInfo {
    resolverType: ResolverType;
    contentType: string;
    resolvedContentType?: string;
}

/**
 * A class that maps file extensions to their associated resolver types and content types.
 */
export class ExtensionMap extends Map<string, ExtensionTypeInfo> {
    /**
     * Resolve the type info for an extension.
     * @param extName - The extension name.
     * @returns {ExtensionTypeInfo} Information about the extension (resolver type, content type).
     */
    public getTypeInfo(extName: string): ExtensionTypeInfo {
        return this.get(extName) ?? defaultTypeInfo;
    }

    /**
     * Test the file name against the list of supported extensions.
     * @param {string} fileName - The file name to check.
     * @returns {boolean} True if the file name is supported, false otherwise.
     */
    public isSupported(fileName: string): boolean {
        return this.has(path.extname(fileName));
    }
}

export const DefaultExtensionMap: ExtensionMap = new ExtensionMap([
    [
        '.md',
        {
            resolverType: 'markdown',
            contentType: 'text/markdown',
            resolvedContentType: 'text/html',
        },
    ],
    [
        '.css',
        {
            resolverType: 'style',
            contentType: 'text/css',
        },
    ],
    [
        '.txt',
        {
            resolverType: 'plainText',
            contentType: 'text/plain',
        },
    ],
    [
        '.png',
        {
            resolverType: 'binary',
            contentType: 'image/png',
        },
    ],
    [
        '.jpg',
        {
            resolverType: 'binary',
            contentType: 'image/jpeg',
        },
    ],
    [
        '.jpeg',
        {
            resolverType: 'binary',
            contentType: 'image/jpeg',
        },
    ],
    [
        '.gif',
        {
            resolverType: 'binary',
            contentType: 'image/gif',
        },
    ],
    [
        '.svg',
        {
            resolverType: 'binary',
            contentType: 'image/svg+xml',
        },
    ],
    [
        '.pdf',
        {
            resolverType: 'pdf',
            contentType: 'application/pdf',
        },
    ],
]);

const defaultTypeInfo: ExtensionTypeInfo = {
    resolverType: 'binary',
    contentType: 'application/octet-stream',
};
