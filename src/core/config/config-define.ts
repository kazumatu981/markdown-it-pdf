export type PropertyValue =
    | undefined
    | string
    | number
    | boolean
    | Record<string, PropertyDefine>
    | Array<string>
    | Array<number>;
export type PropertyValueType =
    | 'undefined'
    | 'string'
    | 'number'
    | 'boolean'
    | 'string-array'
    | 'number-array'
    | 'object';
export interface PropertyDefine {
    description: Array<string>;
    type: PropertyValueType;
    isCommented?: boolean;
    value: PropertyValue;
}

export type ConfigCategory = 'render' | 'server' | 'printer';

export interface CategorizedConfigDefine {
    description: Array<string>;
    configDefine: Record<string, PropertyDefine>;
}

export type CategorizedConfigDefines = Record<
    ConfigCategory,
    CategorizedConfigDefine
>;

export type PropertyValueFormatter = (value: PropertyValue) => Array<string>;

const defaultValueFormatter: PropertyValueFormatter = (value) => {
    return [`${value}`];
};
const stringValueFormatter: PropertyValueFormatter = (value) => {
    return [`"${value}"`];
};

const defaultArrayFormatter: PropertyValueFormatter = (value) => {
    return [
        '[',
        ...(value as Array<string | number>).map((item) => `    ${item},`),
        ']',
    ];
};

const objectFormatter: PropertyValueFormatter = (value) => {
    return [
        '{',
        ...formatConfigDefine(value as Record<string, PropertyDefine>, false),
        '}',
    ];
};
const valueFormatterMap: Record<PropertyValueType, PropertyValueFormatter> = {
    undefined: defaultValueFormatter,
    string: stringValueFormatter,
    number: defaultValueFormatter,
    boolean: defaultValueFormatter,
    'string-array': defaultArrayFormatter,
    'number-array': defaultArrayFormatter,
    object: objectFormatter,
};

const commentOut = (line: string) => `// ${line}`;

function formatPropertyDefine(
    key: string,
    configDefine: PropertyDefine
): Array<string> {
    const formatter = valueFormatterMap[configDefine.type];
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
    return [
        `// ### ${key}`,
        ...configDefine.description.map((line) => commentOut(line)),
        ...lines,
    ];
}

function formatConfigDefine(
    configDefine: Record<string, PropertyDefine>,
    addLastComma: boolean = true
): Array<string> {
    const properties = Object.keys(configDefine)
        .map((key, index, thisArray) => {
            const lines = formatPropertyDefine(key, configDefine[key]);
            if (index !== thisArray.length - 1 || addLastComma) {
                lines[lines.length - 1] += ',';
            }
            return lines;
        })
        .flat();
    return [...properties.map((item) => `    ${item}`)];
}

export function formatCategorizedConfigDefines(
    categorizedConfigDefines: CategorizedConfigDefines
): Array<string> {
    return [
        '{',
        ...Object.keys(categorizedConfigDefines)
            .map((key, index, thisArray) => {
                const configDefine =
                    categorizedConfigDefines[key as ConfigCategory];
                return [
                    `// ## ${key}`,
                    ...configDefine.description.map((line) => commentOut(line)),
                    ...formatConfigDefine(
                        configDefine.configDefine,
                        index !== thisArray.length - 1
                    ),
                    '',
                ];
            })
            .flat(),
        '}',
    ];
}
