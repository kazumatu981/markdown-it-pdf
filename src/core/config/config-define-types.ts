/**
 * The value type of a config property
 */
export type PropertyValue =
    | undefined
    | string
    | number
    | boolean
    | Record<string, PropertyDefine>
    | Array<string>
    | Array<number>;

/**
 * The value type name of a config property
 */
export type PropertyValueType =
    | 'undefined'
    | 'string'
    | 'number'
    | 'boolean'
    | 'string-array'
    | 'number-array'
    | 'object';

/**
 * The definition of a config property
 */
export interface PropertyDefine {
    /**
     * The description of the property
     */
    description?: Array<string>;
    /**
     * The value type of the property
     */
    type: PropertyValueType;
    /**
     * Whether the property is commented
     */
    isCommented?: boolean;
    /**
     * The value of the property
     */
    value: PropertyValue;
}

/**
 * The category of a config property
 */
export type ConfigCategory = 'render' | 'server' | 'printer';

/**
 * a categorized config object
 */
export interface CategorizedConfig {
    /**
     * The description of the configurations
     */
    description: Array<string>;
    /**
     * config properties
     */
    properties: Record<string, PropertyDefine>;
}

/**
 * The config object
 */
export type ConfigDefines = Record<ConfigCategory, CategorizedConfig>;
