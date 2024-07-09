export type PropertyValue =
    | string
    | number
    | boolean
    | Record<string, PropertyDefine>
    | Array<string>
    | Array<number>;
export type PropertyValueType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'string-array'
    | 'number-array'
    | 'object';
export interface PropertyDefine {
    description: string;
    type: PropertyValueType;
    defaultValue?: PropertyValue;
    sampleValue?: PropertyValue;
}

export type ConfigCategory = 'render' | 'server' | 'printer';

export interface CategorizedConfigDefine {
    description: string;
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

const defaultArrayFormatter: PropertyValueFormatter = (value) => {
    return [
        '[',
        ...(value as Array<string | number>).map((item) => `    ${item}`),
        ']',
    ];
};

const objectFormatter: PropertyValueFormatter = (value) => {
    throw new Error('Not implemented');
};
const valueFormatterMap: Record<PropertyValueType, PropertyValueFormatter> = {
    string: defaultValueFormatter,
    number: defaultValueFormatter,
    boolean: defaultValueFormatter,
    'string-array': defaultArrayFormatter,
    'number-array': defaultArrayFormatter,
    object: objectFormatter,
};

function formatPropertyDefine(
    key: string,
    configDefine: PropertyDefine
): Array<string> {
    const formatter = valueFormatterMap[configDefine.type];
    throw new Error('Not implemented');
}

function formatConfigDefine(
    configDefine: Record<string, PropertyDefine>
): Array<string> {
    const properties = Object.keys(configDefine)
        .map((key) => formatPropertyDefine(key, configDefine[key]))
        .flat();
    return ['{', ...properties, '}'];
}
