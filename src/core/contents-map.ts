import { type MarkdownItRender } from './markdown-it-render';
import { type ContentType, ContentsResolver } from './contents-resolver-map';
export interface ContentsMapEntity {
    type: ContentType;
    contentPath: string;
}
export interface RenderedEntity extends ContentsMapEntity {
    mediaType: string;
    contents: string;
}

export class ContentsMap extends Map<string, ContentsMapEntity> {
    private _resolver: ContentsResolver;
    public constructor(render: MarkdownItRender) {
        super();
        this._resolver = new ContentsResolver(render);
    }

    public async render(filePath: string): Promise<RenderedEntity | undefined> {
        const entity = this.get(filePath);
        if (!entity) {
            return;
        }
        const contents = await this._resolver.resolve(
            entity.type,
            entity.contentPath
        );
        const mediaType = ContentsResolver.resolveMediaType(entity.type);
        return { ...entity, contents, mediaType };
    }
}
