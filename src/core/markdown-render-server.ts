import http from 'http';
import { ContentsResolver } from './contents-resolver';
import { MarkdownItRender } from './markdown-it-render';

export interface ContentEntry {}
export type ContentsMap = Map<string, ContentEntry>;

export class MarkdownRenderServer extends ContentsResolver {
    private _server: http.Server;
    constructor(render: MarkdownItRender) {
        super(render);
        this._server = http.createServer(this.serverListener.bind(this));
    }

    public serverListener(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): void {}
    public listen(port: number): void {
        this._server.listen(port);
    }
    public close(): void {
        this._server.close();
    }
}
