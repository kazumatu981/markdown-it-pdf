import fsPromises from 'fs/promises';
import path from 'path';

export type ResolverType =
    | 'markdown'
    | 'style'
    | 'plainText'
    | 'pdf'
    | 'binary';

export type ContentsResolverFunction = (
    contentPath: string
) => Promise<string | Buffer>;

export function defaultContentsResolver(contentPath: string): Promise<Buffer> {
    return fsPromises.readFile(contentPath);
}

export class ResolverMap extends Map<ResolverType, ContentsResolverFunction> {
    public getResolver(resolverType: ResolverType): ContentsResolverFunction {
        return this.get(resolverType) ?? defaultContentsResolver;
    }
}

interface ExtensionTypeInfo {
    resolverType: ResolverType;
    contentType: string;
    resolvedContentType?: string;
}

export class ExtensionMap extends Map<string, ExtensionTypeInfo> {
    public getTypeInfo(extName: string): ExtensionTypeInfo {
        return this.get(extName) ?? defaultTypeInfo;
    }
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
