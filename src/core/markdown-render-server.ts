import http from 'http';

import { type ContentsMap, RenderedEntity } from './contents-map';

export class MarkdownRenderServer {
    private _server: http.Server;
    private _map?: ContentsMap;
    constructor() {
        this._server = http.createServer(this.serverListener.bind(this));
    }

    public map(map: ContentsMap): this {
        this._map = map;
        return this;
    }

    public serverListener(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): void {
        if (!this._map) {
            this.writeNotFound(res);
            return;
        }
        const filePath = req.url ?? '';
        this._map
            .render(filePath)
            .then((entity) => {
                if (!entity) {
                    this.writeNotFound(res);
                    return;
                }
                this.writeEntity(res, entity);
            })
            .catch((err) => {
                console.error(err);
                this.writeNotFound(res);
            });
    }
    public listen(port: number): void {
        this._server.listen(port);
    }
    public close(): void {
        this._server.close();
    }

    public writeNotFound(res: http.ServerResponse): void {
        res.statusCode = 404;
        res.appendHeader('Content-Type', 'text/plain');
        res.write('Not Found');
        res.end();
    }
    public writeEntity(res: http.ServerResponse, entity: RenderedEntity): void {
        res.statusCode = 200;
        res.appendHeader('Content-Type', entity.mediaType);
        res.write(entity.contents);
        res.end();
    }
}
