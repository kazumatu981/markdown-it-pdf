import { SafeMap } from './safe-map';
import { type FileRender, defaultRender } from '../render';

/**
 * The render map. It's a map of render types to the render functions.
 */
export class RenderMap extends SafeMap<string, FileRender> {
    /**
     * constructs a new instance of RenderMap.
     */
    constructor() {
        super(defaultRender);
    }
}
