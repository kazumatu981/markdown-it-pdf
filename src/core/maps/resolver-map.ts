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
