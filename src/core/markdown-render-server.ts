import http from 'http';
import fsPromise from 'fs/promises';

import { ContentsMap, RenderedEntity } from './maps/contents-map';
import { RenderMap } from './maps/render-map';
import { MarkdownItRender } from './render/markdown-it-render';
import { tryToListen } from './utils/http-helper';
import { Logger } from '../common/logger';
import { type MarkdownRenderServerOptions } from '../common/configure';
import { utf8PlainTextRender } from './render/file-render';

const defaultOptions: MarkdownRenderServerOptions = {
    rootDir: '.',
    externalUrls: [],
};
export class MarkdownRenderServer extends MarkdownItRender {
    private _options?: MarkdownRenderServerOptions;
    private _server?: http.Server;
    private _contentsMap?: ContentsMap;
    private _listeningPort?: number;

    public static async createInstance(
        logger?: Logger,
        options?: MarkdownRenderServerOptions
    ): Promise<MarkdownRenderServer> {
        logger?.debug(
            `MarkdownRenderServer.createRenderServer() called with options: ${JSON.stringify(options)}`
        );

        // create this instance
        const theInstance = new MarkdownRenderServer();
        theInstance._options = options;
        theInstance._logger = logger;

        // create resolver map
        const renderMap = new RenderMap();
        renderMap.set('markdown', theInstance);
        renderMap.set('style', utf8PlainTextRender);
        renderMap.set('plainText', utf8PlainTextRender);

        // create contents map
        const contentsMap = await ContentsMap.createInstance(
            renderMap,
            options
        );
        logger?.debug('contentsUrls: %o', contentsMap.getEntityUrls());

        // set contents map
        theInstance.contentsMap = contentsMap;

        // set style urls
        theInstance.addStyles(theInstance.availableStyleUrls);
        theInstance.addExternalStyles(options?.externalUrls ?? []);

        // return the instance
        return theInstance;
    }

    public get availableMarkdownUrls(): string[] {
        return this.contentsMap.getEntityUrls('markdown');
    }

    public get availableStyleUrls(): string[] {
        return this.contentsMap.getEntityUrls('style');
    }

    private set contentsMap(contentsMap: ContentsMap) {
        this._contentsMap = contentsMap;
    }
    public get contentsMap(): ContentsMap {
        return this._contentsMap as ContentsMap;
    }

    public get listeningPort(): number | undefined {
        return this._listeningPort;
    }
    public async listen(port?: number): Promise<number> {
        const portCandidate = port ?? this._options?.port;
        const serverPort = await tryToListen(
            portCandidate,
            this._options,
            this._logger
        );
        if (serverPort === undefined) {
            this._logger?.error('Can not listen on port %d', portCandidate);
            this._logger?.trace('Port not available');
            throw new Error('Can not listen');
        }
        this._listeningPort = serverPort.port;
        this._server = serverPort.httpServer;

        this._logger?.debug('Listening on port %d', this._listeningPort);

        // bind the server event listener
        this._server.on('request', this.serverListener.bind(this));
        return this._listeningPort;
    }
    public async close(): Promise<void> {
        this._listeningPort = undefined;
        return new Promise((resolve, rejects) => {
            this._server?.close((err) => {
                if (err) {
                    this._logger?.error('Can not close server');
                    this._logger?.trace(err);
                    rejects(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Listener for incoming requests
     * @param req Incoming message
     * @param res Server response
     */
    public serverListener(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): void {
        this._logger?.debug('Request: %s', req.url);
        // Get requested file path
        const filePath = req.url as string;
        // Render the file contents with given path
        (this._contentsMap as ContentsMap).render(filePath).then((entity) => {
            // If file not found or rendering failed
            // Return "Not Found" to the client
            if (!entity) {
                this.writeNotFound(res);
                return;
            }
            // Write the rendered entity to the response
            this.writeEntity(res, entity);
        });
    }

    private writeNotFound(res: http.ServerResponse): void {
        this._logger?.warn(
            'Response for url: %s, status code: %d',
            res.req.url,
            404
        );
        res.statusCode = 404;
        res.appendHeader('Content-Type', 'text/plain');
        res.write('Not Found');
        res.end();
    }
    private writeEntity(
        res: http.ServerResponse,
        entity: RenderedEntity
    ): void {
        this._logger?.debug(
            'Response for url: %s, status code: %d',
            res.req.url,
            200
        );
        this._logger?.debug('content type: %s', entity.contentType);

        res.statusCode = 200;
        res.appendHeader('Content-Type', entity.contentType);
        res.write(entity.contents);
        res.end();
    }
}
