import http from 'http';

import {
    ContentsMap,
    RenderedEntity,
    type ContentsMapEntity,
    type ContentsMapOptions,
} from './contents-map';
import { MarkdownItRender } from './markdown-it-render';

export interface MarkdownRenderServerOptions extends ContentsMapOptions {
    rootDir?: string;
}
export class MarkdownRenderServer extends MarkdownItRender {
    private _server: http.Server;
    private _contentsMap?: ContentsMap;

    public static async createInstance(
        options?: MarkdownRenderServerOptions
    ): Promise<MarkdownRenderServer> {
        // create this instance
        const theInstance = new MarkdownRenderServer();

        // create contents map
        const contentsMap = await ContentsMap.createInstance(
            theInstance,
            options?.rootDir ?? '.',
            options
        );

        // set contents map
        theInstance.contentsMap = contentsMap;
        return theInstance;
    }
    private constructor() {
        super();
        this._server = http.createServer(this.serverListener.bind(this));
    }

    private set contentsMap(contentsMap: ContentsMap) {
        this._contentsMap = contentsMap;
    }
    public get contentsMap(): ContentsMap {
        if (!this._contentsMap) throw new Error('Not Initialized');
        return this._contentsMap;
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
        res.appendHeader('Content-Type', entity.contentType);
        res.write(entity.contents);
        res.end();
    }
}
