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

export interface CategorizedConfig {
    description: Array<string>;
    properties: Record<string, PropertyDefine>;
}

export type ConfigDefines = Record<ConfigCategory, CategorizedConfig>;
