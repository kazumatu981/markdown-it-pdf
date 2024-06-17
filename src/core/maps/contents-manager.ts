import { ExtensionMap } from './extension-map';
import { RenderMap } from './render-map';
import { ContentsMap, ContentsMapEntity } from './contents-map';
import { findFiles, filePathToUrl } from '../utils';
import { type Logger } from '../../common';

import path from 'path';
export interface ContentsManagerOptions {
    recursive?: boolean;
}

export interface RenderedEntity extends ContentsMapEntity {
    contents: string | Buffer;
}

//#region Default options
/**
 * default root directory
 */
const defaultRootDir = './';
/**
 * default contents manager options
 */
const defaultContentsManagerOptions = {
    recursive: true,
};
//#endregion

export class ContentsManager {
    private _rootDir?: string;
    private _options?: ContentsManagerOptions;
    private _logger?: Logger;
    private _renderMap?: RenderMap;
    private _contentsMap?: ContentsMap;
    private _extensionMap?: ExtensionMap;

    constructor(
        rootDir: string,
        options?: ContentsManagerOptions,
        logger?: Logger
    ) {
        this._rootDir = rootDir;
        this._options = options;
        this._logger = logger;
    }

    public set renderMap(renderMap: RenderMap) {
        this._renderMap = renderMap;
    }

    public set extensionMap(extensionMap: ExtensionMap) {
        this._extensionMap = extensionMap;
    }

    public set contentsMap(contentsMap: ContentsMap) {
        this._contentsMap = contentsMap;
    }

    public async refresh(): Promise<void> {
        // clear the contents map
        this._contentsMap?.clear();

        // find contents
        const contents = (
            await findFiles<ContentsMapEntity | undefined>(
                this._rootDir ?? defaultRootDir,
                this._options?.recursive ??
                    defaultContentsManagerOptions.recursive,
                this._extensionMap?.isSupported.bind(this._extensionMap) ??
                    (() => true),
                this.generateContentMapEntity.bind(this)
            )
        ).filter((content) => content !== undefined) as ContentsMapEntity[];

        // add contents to the contents map
        contents.forEach((content) => {
            this._contentsMap?.set(content.url, content);
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
        if (!this._contentsMap) {
            return [];
        }
        // If renderType is provided, filter the entity URLs based on the render type
        return renderType
            ? [...this._contentsMap.keys()].filter((url) => {
                  // Get the entity associated with the URL
                  const entity = this._contentsMap?.get(
                      url
                  ) as ContentsMapEntity;
                  // Return true if the entity's render type matches the provided renderType
                  return entity.renderType === renderType;
              })
            : [...this._contentsMap.keys()];
    }

    /**
     * Renders the entity associated with the provided filePath.
     * If the entity is not found, it returns undefined.
     * @param {string} filePath - The path of the file to render.
     * @returns {Promise<RenderedEntity | undefined>} - A promise that resolves to the rendered entity,
     * or undefined if the entity is not found.
     */
    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        if (!(this._renderMap && this._contentsMap)) {
            return;
        }

        // Get the entity associated with the provided filePath.
        const entity = this._contentsMap.get(filePath);

        // If the entity is not found, return undefined.
        if (!entity) {
            return;
        }

        // Get the render for the renderType of the entity.
        const contentRender = this._renderMap.safeGet(entity.renderType);

        // Render the contents of the entity using the render.
        const contents = await contentRender.renderFromFile(entity.contentPath);

        // Return the rendered entity with the contents.
        return { ...entity, contents };
    }

    //#region private methods
    /**
     * Generates a content map entity for the provided file path.
     * @param {string} filePath - The path of the file.
     * @returns {ContentsMapEntity} The generated content map entity.
     */
    private generateContentMapEntity(
        filePath: string
    ): ContentsMapEntity | undefined {
        // Get the extension map for the file path.
        const resolver = this._extensionMap?.safeGet(path.extname(filePath));
        if (!resolver) {
            return undefined;
        }

        // Generate the content map entity with the provided information.
        return {
            // Generate the URL for the file path.
            url: filePathToUrl(this._rootDir ?? defaultRootDir, filePath),
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
