import fsPromises from 'fs/promises';

export type ResolverType =
    | 'markdown'
    | 'style'
    | 'plainText'
    | 'pdf'
    | 'binary';

/**
 *
 * The default contents resolver function.
 * Just Returns the contents of the file.
 *
 * @param {string} contentPath - The path to the file to resolve.
 * @returns {Promise<string | Buffer>} A promise that resolves to the content of the file.
 * The returned value is either a string or a Buffer depending on the file type.
 */
export function defaultContentsResolver(contentPath: string): Promise<Buffer> {
    return fsPromises.readFile(contentPath);
}

/**
 * Represents a function that resolves the content of a file.
 *
 * @param {string} contentPath - The path to the file to resolve.
 * @returns {Promise<string | Buffer>} A promise that resolves to the content of the file.
 * The returned value is either a string or a Buffer depending on the file type.
 */
export type ContentsResolverFunction = (
    contentPath: string
) => Promise<string | Buffer>;

export class ResolverMap extends Map<ResolverType, ContentsResolverFunction> {
    /**
     * Returns the resolver function for the given resolver type.
     * If the resolver type does not exist in the map, it returns the defaultContentsResolver function.
     *
     * @param {ResolverType} resolverType - The resolver type to get the resolver function for.
     * @returns {ContentsResolverFunction} The resolver function for the given resolver type.
     */
    public getResolver(resolverType: ResolverType): ContentsResolverFunction {
        // Get the resolver function for the given resolver type from the map.
        // If the resolver type does not exist in the map, return the defaultContentsResolver function.
        return this.get(resolverType) ?? defaultContentsResolver;
    }
}
