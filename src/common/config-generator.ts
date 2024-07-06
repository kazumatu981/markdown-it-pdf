import fsPromises from 'fs/promises';
import path from 'path';
import js_beautify from 'js-beautify';

import {
    type PropertyDefine,
    type PropertyValue,
    type PropertyValueType,
    type ConfigDefine,
    type ConfigCategory,
    type CategorizedConfigDefine,
    type CategorizedConfigDefines,
} from './config-define';

const formatOptions: js_beautify.JSBeautifyOptions = {
    preserve_newlines: true,
};

export class ConfigGenerator {
    _categorizedConfigDefine: CategorizedConfigDefines;
    static readonly formatterMap = new Map<
        PropertyValueType,
        (value: PropertyValue) => string
    >([
        ['string', ConfigGenerator.formatString],
        ['number', ConfigGenerator.formatNumber],
        ['boolean', ConfigGenerator.formatBoolean],
        ['string-array', ConfigGenerator.formatStringArray],
        ['number-array', ConfigGenerator.formatNumberArray],
        ['object', ConfigGenerator.formatObject],
    ]);
    public constructor(categorizedConfigDefine: CategorizedConfigDefines) {
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
        return `{
                ${Object.keys(this._categorizedConfigDefine)
                    .map((category) =>
                        ConfigGenerator.formatCategory(
                            category,
                            this._categorizedConfigDefine[
                                category as ConfigCategory
                            ]
                        )
                    )
                    .join(',\n\n')}
            }
        `;
    }

    private static formatCategory(
        categoryName: string,
        theDefine: CategorizedConfigDefine
    ): string {
        return `// ## Category: ${categoryName}
                // ${theDefine.description}
                ${Object.keys(theDefine.configDefine)
                    .map((name) =>
                        ConfigGenerator.formatProperty(
                            theDefine.configDefine,
                            name
                        )
                    )
                    .join(',\n\n')}
        `;
    }
    private static formatProperty(
        theDefine: ConfigDefine,
        name: string
    ): string {
        const propertyDefine = theDefine[name] as PropertyDefine;
        return `// ### ${name}
                // ${propertyDefine.description}
                ${propertyDefine.defaultValue ? '' : '// '} ${name}: ${ConfigGenerator.formatValue(propertyDefine)}`;
    }
    private static formatValue(propertyDefine: PropertyDefine): string {
        const formatter = ConfigGenerator.formatterMap.get(
            propertyDefine.type
        ) as (value: PropertyValue) => string;
        const candidate =
            propertyDefine.defaultValue ?? propertyDefine.sampleValue;

        return candidate ? formatter(candidate) : 'undefined';
    }

    private static formatString(value: PropertyValue): string {
        return `'${value}'`;
    }

    private static formatNumber(value: PropertyValue): string {
        return String(value);
    }

    private static formatBoolean(value: PropertyValue): string {
        return String(value);
    }

    private static formatStringArray(values: PropertyValue): string {
        return `[${(values as Array<string>).map((value) => "'" + value + "'").join(',')}]`;
    }
    private static formatNumberArray(values: PropertyValue): string {
        return `[${(values as Array<number>).map(String).join(',')}]`;
    }

    private static formatObject(value: PropertyValue): string {
        const entries = value as ConfigDefine;
        return `{
            ${Object.keys(entries)
                .map((key) => ConfigGenerator.formatProperty(entries, key))
                .join(',\n')}
        }`;
    }
}
