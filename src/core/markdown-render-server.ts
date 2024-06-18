import http from 'http';
import {
    type ContentsManagerOptions,
    type RenderedEntity,
    ContentsManager,
} from './maps';
import {
    MarkdownItRender,
    utf8PlainTextRender,
    type HljsConfig,
} from './render';
import { type ListeningOptions, tryToListen } from './utils';
import { type Logger } from '../common';

/**
 * The options for the render server
 */
export interface RenderServerOptions
    extends ContentsManagerOptions,
        ListeningOptions {
    /**
     * The port to listen on
     */
    port?: number;

    /**
     * The external urls for styles
     */
    externalUrls?: string[];
    /**
     * The template html file path
     */
    templatePath?: string;
    /**
     * The highlight.js config
     */
    hljs?: HljsConfig | false;
}

// TODO support user custom plugins on options.

/**
 * The markdown render server
 */
export class MarkdownRenderServer extends MarkdownItRender {
    private _options?: RenderServerOptions;
    private _server?: http.Server;
    private _contentsManager?: ContentsManager;
    private _listeningPort?: number;

    /**
     * Create a new markdown render server
     * @param rootDir {string} path to root directory of markdown files
     * @param options {RenderServerOptions} the options on this server launch.
     * @param logger {Logger} the logger
     * @returns {Promise<MarkdownRenderServer>} the markdown render server
     */
    public static async createInstance(
        rootDir?: string,
        options?: RenderServerOptions,
        logger?: Logger
    ): Promise<MarkdownRenderServer> {
        logger?.debug(
            `MarkdownRenderServer.createRenderServer() called with options: ${JSON.stringify(options)}`
        );

        // create this instance
        const theInstance = await new MarkdownRenderServer()
            // set the options
            .setOptions(options)
            // set the logger
            .setLogger(logger)
            // configure the template
            .configureTemplate({ ...options })
            // configure the contents map
            .then((instance) => {
                return instance.configureContentsManager(rootDir, options);
            })
            .then((instance) => instance.refresh());
        logger?.debug(
            'contentsUrls: %o',
            theInstance.contentsManager.getEntityPaths()
        );

        return theInstance;
    }

    /**
     * Markdown paths which is available.
     * @returns {string[]} Markdown paths
     */
    public get availableMarkdownPaths(): string[] {
        return this._contentsManager!.contentsMap.getEntityPaths('markdown');
    }

    /**
     * Style paths which is available.
     * @returns {string[]} Style paths
     */
    public get availableStylePaths(): string[] {
        return this._contentsManager!.contentsMap.getEntityPaths('style');
    }

    /**
     * The url of the server. `http://localhost:{port}`
     * @returns {string} the url
     */
    public get myUrl(): string {
        return `http://localhost:${this._listeningPort}`;
    }

    private set contentsManager(contentsManager: ContentsManager) {
        this._contentsManager = contentsManager;
    }

    /**
     * The contents map
     * @returns {ContentsMap} the contents map
     */
    public get contentsManager(): ContentsManager {
        return this._contentsManager as ContentsManager;
    }

    /**
     * The listening port
     * @returns {number} the listening port
     */
    public get listeningPort(): number | undefined {
        return this._listeningPort;
    }

    /**
     * Start to listen from clients request.
     * @param port {number | undefined} The port to listen on
     * @returns {Promise<number>} A promise that resolves when the server is listening
     */
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
        this._server.on('request', this.onRequest.bind(this));
        return this._listeningPort;
    }

    /**
     * Close the server
     * @returns {Promise<void>} A promise that resolves when the server is closed
     */
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
     * Refresh the contents of the server
     * @param refreshContentsMap {boolean} whether to refresh the contents map
     * @returns {this} this instance, for method chaining
     */
    public async refresh(refreshContentsMap: boolean = true): Promise<this> {
        if (refreshContentsMap) {
            await this._contentsManager?.refresh();
        }
        this.clearStyles();
        this.addStyles(this.availableStylePaths);
        this.clearExternalStyles();
        this.addExternalStyles(this._options?.externalUrls ?? []);
        return this;
    }

    //#region private methods

    //#region HTTP responses
    /**
     * Listener for incoming requests
     * @param req Incoming message
     * @param res Server response
     */
    private onRequest(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): void {
        this._logger?.debug('Request: %s', req.url);
        // Get requested file path
        const filePath = req.url as string;
        // Render the file contents with given path
        this.contentsManager.render(filePath).then((entity) => {
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
    //#endregion

    //#region configuration functions
    private setOptions(options?: RenderServerOptions): this {
        this._options = options;
        return this;
    }
    private setLogger(logger?: Logger): this {
        this._logger = logger;
        return this;
    }
    private async configureContentsManager(
        rootDir?: string,
        options?: RenderServerOptions
    ): Promise<this> {
        this._contentsManager = new ContentsManager(
            rootDir,
            options,
            this._logger
        );

        this._contentsManager
            .setRender('markdown', this)
            .setRender('style', utf8PlainTextRender)
            .setRender('plainText', utf8PlainTextRender);

        await this._contentsManager.refresh();

        return this;
    }

    //#endregion

    //#endregion
}
