import { findFiles, filePathToUrl } from '../utils/path-resolver';
import { type RenderMap } from './render-map';
import { DefaultExtensionMap } from './extension-map';
import path from 'path';

//#region constants
const defaultRootDir = './';
/**
 * default contents map options
 */
const defaultContentsMapOptions = {
    recursive: true,
};
//#endregion

//#region types and interfaces

/**
 * An entity in the contents map
 */
export interface ContentsMapEntity {
    /**
     * The URL of the entity
     */
    url: string;
    /**
     * The resolver type of the entity
     */
    renderType: string;
    /**
     * The content type of the entity
     */
    contentType: string;
    /**
     * The path to the content of the entity
     */
    contentPath: string;
}

/**
 * An entity in the contents map that has been rendered
 */
export interface RenderedEntity extends ContentsMapEntity {
    /**
     * The contents of the entity
     */
    contents: string | Buffer;
}

/**
 * Options for the contents map
 */
export interface ContentsMapOptions {
    /**
     * Whether to recursively search for files.
     */
    recursive?: boolean;
}

//#endregion

//#region main class
/**
 * The contents map. It's a map of URLs to the contents.
 */
export class ContentsMap extends Map<string, ContentsMapEntity> {
    //#region private fields
    private _rootDir: string;
    private _renderMap: RenderMap;
    private _options?: ContentsMapOptions;
    //#endregion

    //#region public static methods

    /**
     * Creates an instance of the ContentsMap class with the provided resolver map and options.
     * Then refreshes the contents of the map and returns the instance.
     * @param {RenderMap} resolverMap - The resolver map used to resolve the URLs to the contents.
     * @param {string} rootDir - The root directory to start the search files from.
     * @param {ContentsMapOptions} options - The options for the contents map.
     * @returns {Promise<ContentsMap>} A promise that resolves to the created instance of the ContentsMap class.
     */
    public static async createInstance(
        resolverMap: RenderMap,
        rootDir?: string,
        options?: ContentsMapOptions
    ): Promise<ContentsMap> {
        // create the instance
        const theInstance = new ContentsMap(resolverMap, rootDir, options);

        // refresh the contents of the map
        await theInstance.refresh();

        // return the created instance
        return theInstance;
    }
    //#endregion

    //#region constructor

    /**
     * Creates a new instance of the ContentsMap class.
     * @param {RenderMap} resolverMap - The resolver map used to resolve the URLs to the resolver for the contents.
     * @param {string} rootDir - The root directory to start the search files from.
     * @param {ContentsMapOptions} options - The options for the contents map.
     */
    private constructor(
        resolverMap: RenderMap,
        rootDir?: string,
        options?: ContentsMapOptions
    ) {
        // Call the constructor of the parent class (Map)
        super();

        // Initialize the resolver map
        this._renderMap = resolverMap;

        // Initialize the root directory
        this._rootDir = rootDir ?? defaultRootDir;

        // Initialize the options for the contents map
        this._options = options;
    }

    //#endregion

    //#region public properties
    public get renderMap(): RenderMap {
        return this._renderMap;
    }
    public set renderMap(renderMap: RenderMap) {
        this._renderMap = renderMap;
    }
    //#endregion

    //#region public methods
    /**
     * Refreshes the contents of the map by clearing the current contents and
     * re-populating it with the contents found in the root directory using the
     * provided options.
     * @returns {Promise<void>} A promise that resolves when the contents are
     * refreshed.
     */
    public async refresh(): Promise<void> {
        // Clear the current contents of the map
        this.clear();

        // Find the contents of the root directory using the provided options
        const contents = await findFiles<ContentsMapEntity>(
            this._rootDir,
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
     * Returns an array of entity URLs based on the provided renderType.
     * If renderType is not provided, all entity URLs are returned.
     * @param {string} renderType - The render type of the entities to retrieve.
     * @returns {string[]} An array of entity URLs that match the provided renderType,
     * or all entity URLs if renderType is not provided.
     */
    public getEntityPaths(renderType?: string): string[] {
        // If renderType is provided, filter the entity URLs based on the render type
        return renderType
            ? [...this.keys()].filter((url) => {
                  // Get the entity associated with the URL
                  const entity = this.get(url) as ContentsMapEntity;
                  // Return true if the entity's render type matches the provided renderType
                  return entity.renderType === renderType;
              })
            : [...this.keys()];
    }

    /**
     * Renders the entity associated with the provided filePath.
     * If the entity is not found, it returns undefined.
     * @param {string} filePath - The path of the file to render.
     * @returns {Promise<RenderedEntity | undefined>} - A promise that resolves to the rendered entity,
     * or undefined if the entity is not found.
     */
    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        // Get the entity associated with the provided filePath.
        const entity = this.get(filePath);

        // If the entity is not found, return undefined.
        if (!entity) {
            return;
        }

        // Get the render for the renderType of the entity.
        const contentRender = this._renderMap.getRender(entity.renderType);

        // Render the contents of the entity using the render.
        const contents = await contentRender.renderFromFile(entity.contentPath);

        // Return the rendered entity with the contents.
        return { ...entity, contents };
    }

    //#endregion

    //#region private methods
    /**
     * Generates a content map entity for the provided file path.
     * @param {string} filePath - The path of the file.
     * @returns {ContentsMapEntity} The generated content map entity.
     */
    private generateContentMapEntity(filePath: string): ContentsMapEntity {
        // Get the resolver information for the file extension.
        const resolver = DefaultExtensionMap.getTypeInfo(
            path.extname(filePath)
        );

        // Generate the content map entity with the provided information.
        return {
            // Generate the URL for the file path.
            url: filePathToUrl(this._rootDir, filePath),
            // Get the resolver type from the resolver information.
            renderType: resolver.renderType,
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
