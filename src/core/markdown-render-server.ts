import http from 'http';
import path from 'path';
import {
    type ContentsMapOptions,
    type RenderedEntity,
    RenderMap,
    ContentsMap,
} from './maps';
import {
    MarkdownItRender,
    utf8PlainTextRender,
    type HljsConfig,
} from './render';
import { type ServerPortOptions, tryToListen } from './utils';
import { type Logger } from '../common';
export interface RenderServerOptions
    extends ContentsMapOptions,
        ServerPortOptions {
    port?: number;
    externalUrls?: string[];
    templatePath?: string;
    hljs?: HljsConfig | false;
}

const defaultOptions = {
    rootDir: '.',
    hljs: {
        js: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
        css: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css',
    },
};

export class MarkdownRenderServer extends MarkdownItRender {
    private _options?: RenderServerOptions;
    private _server?: http.Server;
    private _contentsMap?: ContentsMap;
    private _listeningPort?: number;

    public static async createInstance(
        rootDir?: string,
        options?: RenderServerOptions,
        logger?: Logger
    ): Promise<MarkdownRenderServer> {
        logger?.debug(
            `MarkdownRenderServer.createRenderServer() called with options: ${JSON.stringify(options)}`
        );

        // create this instance
        const theInstance = new MarkdownRenderServer();

        // FIXME configure options
        theInstance._options = options;
        theInstance._logger = logger;
        await theInstance.loadTemplateFrom(options?.templatePath);
        theInstance.configureHljs(
            options?.hljs === undefined ? defaultOptions.hljs : options?.hljs
        );

        // create resolver map
        const renderMap = new RenderMap();
        renderMap.set('markdown', theInstance);
        renderMap.set('style', utf8PlainTextRender);
        renderMap.set('plainText', utf8PlainTextRender);

        // create contents map
        const contentsMap = await ContentsMap.createInstance(
            renderMap,
            rootDir,
            options
        );
        logger?.debug('contentsUrls: %o', contentsMap.getEntityPaths());

        // set contents map
        theInstance.contentsMap = contentsMap;

        // set style urls
        theInstance.addStyles(theInstance.availableStylePaths);
        theInstance.addExternalStyles(options?.externalUrls ?? []);

        // return the instance
        return theInstance;
    }

    public get availableMarkdownPaths(): string[] {
        return this.contentsMap.getEntityPaths('markdown');
    }

    public get availableStylePaths(): string[] {
        return this.contentsMap.getEntityPaths('style');
    }

    public get myUrl(): string {
        return `http://localhost:${this._listeningPort}`;
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
        if (this._server === undefined) {
            return Promise.resolve();
        }
        this._listeningPort = undefined;
        return new Promise((resolve, rejects) => {
            (this._server as http.Server).close((err) => {
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

    
    //#region private methods
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
    //#endregion
}
