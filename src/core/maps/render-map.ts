import { type FileRender, defaultRender } from '../render/file-render';

export class RenderMap extends Map<string, FileRender> {
    public getRender(renderType: string): FileRender {
        return this.get(renderType) ?? defaultRender;
    }
}
