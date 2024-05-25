import { findFiles, filePathToUrl } from '../utils/path-resolver';
import { type ResolverType, type ResolverMap } from './resolver-map';
import { DefaultExtensionMap } from './extension-map';
import { type ContentsMapOptions } from '../../common/configure';
import path from 'path';

//#region constants
/**
 * default contents map options
 */
const defaultContentsMapOptions = {
    rootDir: './',
    recursive: true,
};
//#endregion

//#region types and interfaces
/**
 * An entity in the contents map
 */
export interface ContentsMapEntity {
    url: string;
    resolverType: ResolverType;
    contentType: string;
    contentPath: string;
}

/**
 * An entity in the contents map that has been rendered
 */
export interface RenderedEntity extends ContentsMapEntity {
    contents: string | Buffer;
}

//#endregion

//#region main class
/**
 * The contents map. It's a map of URLs to the contents.
 */
export class ContentsMap extends Map<string, ContentsMapEntity> {
    //#region private fields
    private _resolver: ResolverMap;
    private _options?: ContentsMapOptions;
    //#endregion

    //#region public static methods

    /**
     * Creates an instance of the ContentsMap class with the provided resolver map and options.
     * Then refreshes the contents of the map and returns the instance.
     *
     * @param {ResolverMap} resolverMap - The resolver map used to resolve the URLs to the contents.
     * @param {ContentsMapOptions} [options] - The options for the contents map.
     * @return {Promise<ContentsMap>} A promise that resolves to the created instance of the ContentsMap class.
     */
    public static async createInstance(
        resolverMap: ResolverMap,
        options?: ContentsMapOptions
    ): Promise<ContentsMap> {
        // create the instance
        const theInstance = new ContentsMap(resolverMap, options);

        // refresh the contents of the map
        await theInstance.refresh();

        // return the created instance
        return theInstance;
    }
    //#endregion

    //#region constructor

    /**
     * Creates a new instance of the ContentsMap class.
     *
     * @private
     * @param {ResolverMap} resolverMap - The resolver map used to resolve the URLs to the resolver for the contents.
     * @param {ContentsMapOptions} [options] - The options for the contents map.
     */
    private constructor(
        resolverMap: ResolverMap,
        options?: ContentsMapOptions
    ) {
        // Call the constructor of the parent class (Map)
        super();

        // Initialize the resolver map
        this._resolver = resolverMap;

        // Initialize the options for the contents map
        this._options = options;
    }

    //#endregion

    //#region public methods
    /**
     * Refreshes the contents of the map by clearing the current contents and
     * re-populating it with the contents found in the root directory using the
     * provided options.
     *
     * @return {Promise<void>} A promise that resolves when the contents are
     * refreshed.
     */
    public async refresh(): Promise<void> {
        // Clear the current contents of the map
        this.clear();

        // Find the contents of the root directory using the provided options
        const contents = await findFiles<ContentsMapEntity>(
            this._options?.rootDir ?? defaultContentsMapOptions.rootDir,
            this._options?.recursive ?? defaultContentsMapOptions.recursive,
            DefaultExtensionMap.isSupported.bind(DefaultExtensionMap),
            this.generateContentMapEntity.bind(this)
        );

        // Populate the map with the found contents
        contents.forEach((entry) => {
            this.set(entry.url, entry);
        });
    }

    /**
     * Retrieves the URLs of all entities in the ContentsMap.
     * If a resolverType is provided, it will filter the URLs by the specified resolverType.
     * Otherwise, it will return all URLs.
     *
     * @param {ResolverType} [resolverType] - The resolverType to filter the URLs by.
     * @return {string[]} An array of URLs.
     */
    public getEntityUrls(resolverType?: ResolverType): string[] {
        // If a resolverType is provided, filter the URLs by the specified resolverType.
        // Otherwise, return all URLs.
        return resolverType
            ? [...this.keys()].filter((url) => {
                  const entity = this.get(url) as ContentsMapEntity;
                  return entity.resolverType === resolverType;
              })
            : [...this.keys()];
    }

    /**
     * Renders the entity associated with the provided filePath.
     * If the entity is not found, it returns undefined.
     *
     * @param {string} filePath - The path of the file to render.
     * @return {Promise<RenderedEntity | undefined>} - A promise that resolves to the rendered entity,
     * or undefined if the entity is not found.
     */
    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        // Get the entity associated with the provided filePath.
        const entity = this.get(filePath);

        // If the entity is not found, return undefined.
        if (!entity) {
            return;
        }

        // Get the resolver for the resolverType of the entity.
        const contentResolver = this._resolver.getResolver(entity.resolverType);

        // Render the contents of the entity using the resolver.
        const contents = await contentResolver(entity.contentPath);

        // Return the rendered entity with the contents.
        return { ...entity, contents };
    }

    //#endregion

    //#region private methods
    /**
     * Generates a content map entity for the provided file path.
     *
     * @param {string} filePath - The path of the file.
     * @return {ContentsMapEntity} The generated content map entity.
     */
    private generateContentMapEntity(filePath: string): ContentsMapEntity {
        // Get the resolver information for the file extension.
        const resolver = DefaultExtensionMap.getTypeInfo(
            path.extname(filePath)
        );

        // Generate the content map entity with the provided information.
        return {
            // Generate the URL for the file path.
            url: filePathToUrl(
                this._options?.rootDir ?? defaultContentsMapOptions.rootDir,
                filePath
            ),
            // Get the resolver type from the resolver information.
            resolverType: resolver.resolverType,
            // Get the content type from the resolver information.
            // If the resolved content type is available, use it instead.
            contentType: resolver.resolvedContentType ?? resolver.contentType,
            // Set the content path to the provided file path.
            contentPath: filePath,
        };
    }

    //#endregion
}
//#endregion
