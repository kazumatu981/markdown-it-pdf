import fs from 'fs';

export function readOptions<T>(filePath?: string): T | undefined {
    let options: T | undefined = undefined;
    if (filePath && fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            options = JSON.parse(content) as T;
        } catch (_) {
            // nothing to do
        }
    }
    return options;
}
