import fsPromises from 'fs/promises';
import path from 'path';
import js_beautify from 'js-beautify';
import { type ConfigDefines } from './config-define-types';
import { formatConfigDefines } from './config-define';

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
        console.log(formatted);
        await fsPromises.writeFile(fileName, formatted);
    }

    public formatJson(): string {
        return ConfigGenerator.prettierString(this.formatCore());
    }
    public formatJs(): string {
        return ConfigGenerator.prettierString(
            `module.exports = ${this.formatCore()}`
        );
    }

    private static prettierString(str: string): string {
        return js_beautify.js(str, formatOptions);
    }

    private formatCore(): string {
        return formatConfigDefines(this._categorizedConfigDefine).join('\n');
    }
}
