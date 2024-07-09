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
