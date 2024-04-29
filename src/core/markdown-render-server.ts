import http from 'http';

import {
    ContentsMap,
    RenderedEntity,
    type ContentsMapEntity,
} from './contents-map';
import { MarkdownItRender } from './markdown-it-render';

export interface MarkdownRenderServerOptions {
    rootDir?: string;
    recursive?: boolean;
    styleFilePaths?: string[];
    externalStylesUrls?: string[];
}
export class MarkdownRenderServer {
    private _server: http.Server;
    private _contentsMap: ContentsMap;
    constructor(MarkdownItRender: MarkdownItRender) {
        this._server = http.createServer(this.serverListener.bind(this));
        this._contentsMap = new ContentsMap(MarkdownItRender);
    }

    public addContent(url: string, entity: ContentsMapEntity): this {
        this._contentsMap.set(url, entity);
        return this;
    }

    public addContents(contents: Map<string, ContentsMapEntity>): this {
        contents.forEach((entity, url) => {
            this._contentsMap.set(url, entity);
        });
        return this;
    }

    public listen(port: number): void {
        this._server.listen(port);
    }
    public close(): void {
        this._server.close();
    }

    /**
     * Listener for incoming requests
     * @param req Incoming message
     * @param res Server response
     */
    private serverListener(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): void {
        // If contents map is not initialized
        // Return "Not Found" to the client
        if (!this._contentsMap) {
            this.writeNotFound(res);
            return;
        }
        // Get requested file path
        const filePath = req.url ?? '';
        // Render the file contents with given path
        this._contentsMap
            .render(filePath)
            .then((entity) => {
                // If file not found or rendering failed
                // Return "Not Found" to the client
                if (!entity) {
                    this.writeNotFound(res);
                    return;
                }
                // Write the rendered entity to the response
                this.writeEntity(res, entity);
            })
            .catch((err) => {
                // Log error to the console
                console.error(err);
                // Return "Not Found" to the client
                this.writeNotFound(res);
            });
    }

    private writeNotFound(res: http.ServerResponse): void {
        res.statusCode = 404;
        res.appendHeader('Content-Type', 'text/plain');
        res.write('Not Found');
        res.end();
    }
    private writeEntity(
        res: http.ServerResponse,
        entity: RenderedEntity
    ): void {
        res.statusCode = 200;
        res.appendHeader('Content-Type', entity.mediaType);
        res.write(entity.contents);
        res.end();
    }
}
