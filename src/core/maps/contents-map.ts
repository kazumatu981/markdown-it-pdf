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

//#endregion

//#region main class
/**
 * The contents map. It's a map of URLs to the contents.
 */
export class ContentsMap extends Map<string, ContentsMapEntity> {
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
}
//#endregion
