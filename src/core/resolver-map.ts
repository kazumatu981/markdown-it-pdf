import path from 'path';

export type ResolverType = 'markdown' | 'style' | 'plainText' | 'binary';

export interface ResolverMapEntity {
    resolverType: ResolverType;
    contentType: string;
    resolvedContentType?: string;
}

export const resolverMap: Map<string, ResolverMapEntity> = new Map([
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
]);

export const defaultResolver: ResolverMapEntity = {
    resolverType: 'binary',
    contentType: 'application/octet-stream',
};

export function getResolver(extName: string): ResolverMapEntity {
    return resolverMap.get(extName) ?? defaultResolver;
}

export function isSupported(fileName: string): boolean {
    return resolverMap.has(path.extname(fileName));
}
