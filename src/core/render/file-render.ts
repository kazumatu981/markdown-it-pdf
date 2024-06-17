/**
 * The render function for a file.
 */
export interface FileRender {
    /**
     * Asynchronously renders a file to HTML.
     * @param filePath - The path of the file to render.
     */
    renderFromFile(filePath: string): Promise<string | Buffer>;
}
