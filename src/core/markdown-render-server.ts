import http from 'http';
import fsPromise from 'fs/promises';

import {
    ContentsMap,
    RenderedEntity,
    type ContentsMapOptions,
} from './contents-map';
import { ResolverMap } from './resolver-map';
import { MarkdownItRender } from './markdown-it-render';
import { tryToListen } from './port-util';

export interface MarkdownRenderServerOptions extends ContentsMapOptions {
    port?: number;
    rootDir?: string;
    externalUrls?: string[];
}
const defaultOptions: MarkdownRenderServerOptions = {
    rootDir: '.',
    externalUrls: [],
};
export class MarkdownRenderServer extends MarkdownItRender {
    private _options?: MarkdownRenderServerOptions;
    // private _server: http.Server = http.createServer();
    private _server?: http.Server;
    private _contentsMap?: ContentsMap;
    private _listeningPort?: number;

    public static async createInstance(
        options?: MarkdownRenderServerOptions
    ): Promise<MarkdownRenderServer> {
        // create this instance
        const theInstance = new MarkdownRenderServer();
        theInstance._options = options;

        // create resolver map
        const resolverMap = new ResolverMap();
        resolverMap.set(
            'markdown',
            theInstance.renderFromFileAsync.bind(theInstance)
        );
        resolverMap.set('style', async (filePath) => {
            return await fsPromise.readFile(filePath, 'utf-8');
        });
        resolverMap.set('plainText', async (filePath) => {
            return await fsPromise.readFile(filePath, 'utf-8');
        });

        // create contents map
        const contentsMap = await ContentsMap.createInstance(
            resolverMap,
            options?.rootDir ?? '.',
            options
        );
        // set contents map
        theInstance.contentsMap = contentsMap;

        // set style urls
        theInstance.addStyles(theInstance.contentsMap.styleEntryUrls);
        theInstance.addExternalStyles(options?.externalUrls ?? []);

        // return the instance
        return theInstance;
    }

    private set contentsMap(contentsMap: ContentsMap) {
        this._contentsMap = contentsMap;
    }
    public get contentsMap(): ContentsMap {
        if (!this._contentsMap) throw new Error('Not Initialized');
        return this._contentsMap;
    }

    public get listeningPort(): number | undefined {
        return this._listeningPort;
    }
    public async listen(port?: number): Promise<number> {
        const portCandidate = port ?? this._options?.port;
        const serverPort = await tryToListen(portCandidate, { retry: 10 });
        if (serverPort === undefined) {
            throw new Error('Can not listen');
        }
        this._listeningPort = serverPort.port;
        this._server = serverPort.httpServer;

        // bind the server event listener
        this._server.on('request', this.serverListener.bind(this));
        return this._listeningPort;
    }
    public close(): void {
        this._listeningPort = undefined;
        this._server?.close();
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
