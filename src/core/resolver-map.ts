import fsPromises from 'fs/promises';
import path from 'path';

export type ResolverType = 'markdown' | 'style' | 'plainText' | 'binary';

export type ContentsResolverFunction = (
    filePath: string
) => Promise<string | Buffer>;

function defaultContentsResolver(filePath: string): Promise<Buffer> {
    return fsPromises.readFile(filePath);
}

interface ExtensionTypeInfo {
    resolverType: ResolverType;
    contentType: string;
    resolvedContentType?: string;
}

const defaultExtensionMap: Map<string, ExtensionTypeInfo> = new Map([
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

export const defaultTypeInfo: ExtensionTypeInfo = {
    resolverType: 'binary',
    contentType: 'application/octet-stream',
};

export class ResolverMap extends Map<ResolverType, ContentsResolverFunction> {
    private _extensionMap: Map<string, ExtensionTypeInfo>;
    public constructor() {
        super();
        this._extensionMap = defaultExtensionMap;
    }
    public getTypeInfo(extName: string): ExtensionTypeInfo {
        return this._extensionMap.get(extName) ?? defaultTypeInfo;
    }

    public isSupported(fileName: string): boolean {
        return this._extensionMap.has(path.extname(fileName));
    }

    public getResolver(resolverType: ResolverType): ContentsResolverFunction {
        return this.get(resolverType) ?? defaultContentsResolver;
    }
    public getResolverByExtension(extName: string): ContentsResolverFunction {
        return this.getResolver(this.getTypeInfo(extName).resolverType);
    }
}
