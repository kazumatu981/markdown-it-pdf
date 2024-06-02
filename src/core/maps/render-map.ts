import { type FileRender, defaultRender } from '../render';

/**
 * The render map. It's a map of render types to the render functions.
 */
export class RenderMap extends Map<string, FileRender> {
    /**
     * Returns the render function for the given renderType.
     * If the renderType is not found, it returns the defaultRender function.
     *
     * @param {string} renderType - The type of the render function to retrieve.
     * @return {FileRender} The render function for the given renderType,
     * or the defaultRender function if the renderType is not found.
     */
    public getRender(renderType: string): FileRender {
        // Get the render function for the given renderType.
        // If the renderType is not found, return the defaultRender function.
        return this.get(renderType) ?? defaultRender;
    }
}
