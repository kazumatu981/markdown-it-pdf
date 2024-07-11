import type {
    PropertyValue,
    PropertyValueType,
    PropertyDefine,
    ConfigDefines,
    ConfigCategory,
} from './config-define-types';

type FormatMode = 'json' | 'js';
type Eol = '\n' | '\r\n';

interface FormatOptions {
    mode: FormatMode;
    eol: Eol;
}

type PropertyValueFormatter = (value: PropertyValue) => Array<string>;

export class ConfigFormatter {
    private _mode: FormatMode;
    private _eol: Eol;

    public constructor(options: FormatOptions) {
        this._mode = options.mode;
        this._eol = options.eol;
    }
    static readonly commentOut = (line: string) => `// ${line}`;

    readonly defaultValueFormatter: PropertyValueFormatter = (value) => {
        return [`${value}`];
    };
    readonly stringValueFormatter: PropertyValueFormatter = (value) => {
        return [`"${value}"`];
    };

    readonly defaultArrayFormatter: PropertyValueFormatter = (value) => {
        return [
            '[',
            ...(value as Array<string | number>).map((item) => `    ${item},`),
            ']',
        ];
    };
    readonly objectFormatter: PropertyValueFormatter = (value) => {
        return [
            '{',
            ...this.formatPropertyDefines(
                value as Record<string, PropertyDefine>,
                false
            ),
            '}',
        ];
    };

    readonly propertyName = (key: string) =>
        this._mode === 'json' ? `"${key}"` : key;

    readonly valueFormatterDictionary: Record<
        PropertyValueType,
        PropertyValueFormatter
    > = {
        undefined: this.defaultValueFormatter.bind(this),
        string: this.stringValueFormatter.bind(this),
        number: this.defaultValueFormatter.bind(this),
        boolean: this.defaultValueFormatter.bind(this),
        'string-array': this.defaultArrayFormatter.bind(this),
        'number-array': this.defaultArrayFormatter.bind(this),
        object: this.objectFormatter.bind(this),
    };

    private formatPropertyDescription(
        description?: Array<string>
    ): Array<string> {
        if (this._mode === 'json') {
            return [];
        } else if (description === undefined || description.length === 0) {
            return [];
        }
        return [
            '/**',
            ...(description?.map((line) => ` * ${line}`) ?? []),
            ' */',
        ];
    }

    private formatCategoryDescription(
        categoryName: string,
        description?: Array<string>
    ): Array<string> {
        if (this._mode === 'json') {
            return [];
        } else if (description === undefined || description.length === 0) {
            return [];
        }
        return [
            '// --------------------------------------------',
            `// Category: ${categoryName}`,
            ...(description?.map((line) => `// ${line}`) ?? []),
            '// --------------------------------------------',
        ];
    }

    private formatPropertyDefines(
        configDefine: Record<string, PropertyDefine>,
        addLastComma: boolean = true
    ): Array<string> {
        const properties = Object.keys(configDefine)
            .map((key, index, thisArray) => {
                const lines = this.formatPropertyDefine(key, configDefine[key]);
                // add comma if needed
                if (index !== thisArray.length - 1 || addLastComma) {
                    lines[lines.length - 1] += ',';
                }
                return lines;
            })
            .flat();
        return [...properties.map((item) => `    ${item}`)];
    }

    public formatPropertyDefine(
        key: string,
        configDefine: PropertyDefine
    ): Array<string> {
        // read formatter from dictionary
        const formatter = this.valueFormatterDictionary[configDefine.type];

        // format value
        const lines = formatter(configDefine.value)
            .map((line, index) => {
                // add key on the first line
                if (index === 0) {
                    line = `${this.propertyName(key)}: ${line}`;
                }
                // add comment if needed
                if (configDefine.isCommented) {
                    if (this._mode === 'js') {
                        line = ConfigFormatter.commentOut(line);
                    } else {
                        line = '';
                    }
                }
                return line;
            })
            .filter((item) => item !== '');
        return [
            // add property description.
            ...this.formatPropertyDescription(configDefine.description),
            // add property define body.
            ...lines,
        ];
    }

    public format(categorizedConfigDefines: ConfigDefines): string {
        return [
            '{',
            ...Object.keys(categorizedConfigDefines)
                .map((key, index, thisArray) => {
                    const configDefine =
                        categorizedConfigDefines[key as ConfigCategory];
                    return [
                        // add category name and description
                        ...this.formatCategoryDescription(
                            key,
                            configDefine.description
                        ),
                        // add properties
                        ...this.formatPropertyDefines(
                            configDefine.properties,
                            index !== thisArray.length - 1
                        ),
                        // blank line
                        '',
                    ];
                })
                .flat(),
            '}',
        ].join(this._eol);
    }
}
