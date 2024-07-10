import type {
    PropertyValue,
    PropertyValueType,
    PropertyDefine,
    ConfigDefines,
    ConfigCategory,
} from './config-define-types';

export type PropertyValueFormatter = (value: PropertyValue) => Array<string>;

const commentOut = (line: string) => `// ${line}`;

class PropertiesFormatter {
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

    valueFormatterMap: Record<PropertyValueType, PropertyValueFormatter> = {
        undefined: this.defaultValueFormatter.bind(this),
        string: this.stringValueFormatter.bind(this),
        number: this.defaultValueFormatter.bind(this),
        boolean: this.defaultValueFormatter.bind(this),
        'string-array': this.defaultArrayFormatter.bind(this),
        'number-array': this.defaultArrayFormatter.bind(this),
        object: this.objectFormatter.bind(this),
    };

    formatDescription(description?: Array<string>): Array<string> {
        return description === undefined || description.length === 0
            ? [] // no description
            : ['/**', ...description.map((line) => ` * ${line}`), ' */'];
    }
    formatPropertyDefine(
        key: string,
        configDefine: PropertyDefine
    ): Array<string> {
        const formatter = this.valueFormatterMap[configDefine.type];
        if (!formatter) {
            throw new Error('Not implemented');
        }
        const lines = formatter(configDefine.value).map((line, index) => {
            // add key on the first line
            if (index === 0) {
                line = `${key}: ${line}`;
            }
            // add comment if needed
            line = configDefine.isCommented ? commentOut(line) : line;

            return line;
        });
        return [...this.formatDescription(configDefine.description), ...lines];
    }

    formatPropertyDefines(
        configDefine: Record<string, PropertyDefine>,
        addLastComma: boolean = true
    ): Array<string> {
        const properties = Object.keys(configDefine)
            .map((key, index, thisArray) => {
                const lines = this.formatPropertyDefine(key, configDefine[key]);
                if (index !== thisArray.length - 1 || addLastComma) {
                    lines[lines.length - 1] += ',';
                }
                return lines;
            })
            .flat();
        return [...properties.map((item) => `    ${item}`)];
    }
}

export function formatConfigDefines(
    categorizedConfigDefines: ConfigDefines
): Array<string> {
    const propertiesFormatter = new PropertiesFormatter();
    return [
        '{',
        ...Object.keys(categorizedConfigDefines)
            .map((key, index, thisArray) => {
                const configDefine =
                    categorizedConfigDefines[key as ConfigCategory];
                return [
                    `// ## ${key}`,
                    ...configDefine.description.map((line) => commentOut(line)),
                    ...propertiesFormatter.formatPropertyDefines(
                        configDefine.properties,
                        index !== thisArray.length - 1
                    ),
                    '',
                ];
            })
            .flat(),
        '}',
    ];
}
