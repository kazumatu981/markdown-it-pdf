import fsPromises from 'fs/promises';
import path from 'path';
import js_beautify from 'js-beautify';
import { type ConfigDefines } from './config-define-types';
import { ConfigFormatter } from './config-formatter';

const formatOptions: js_beautify.JSBeautifyOptions = {
    preserve_newlines: true,
};

export class ConfigGenerator {
    _categorizedConfigDefine: ConfigDefines;
    public constructor(categorizedConfigDefine: ConfigDefines) {
        this._categorizedConfigDefine = categorizedConfigDefine;
    }

    public async generate(fileName: string): Promise<void> {
        const formatter =
            path.extname(fileName) === '.js'
                ? this.formatJs.bind(this)
                : this.formatJson.bind(this);
        const formatted = formatter();
        await fsPromises.writeFile(fileName, formatted);
    }

    public formatJson(): string {
        const jsonString = new ConfigFormatter({
            mode: 'json',
            eol: '\n',
        }).format(this._categorizedConfigDefine);

        return ConfigGenerator.prettierString(jsonString);
    }
    public formatJs(): string {
        const jsonString = new ConfigFormatter({
            mode: 'js',
            eol: '\n',
        }).format(this._categorizedConfigDefine);
        return ConfigGenerator.prettierString(`module.exports = ${jsonString}`);
    }

    private static prettierString(str: string): string {
        return js_beautify.js(str, formatOptions);
    }
}
