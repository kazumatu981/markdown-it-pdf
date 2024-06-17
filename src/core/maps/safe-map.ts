/**
 * A map that returns a default value if the key is not found.
 */
export abstract class SafeMap<K, V> extends Map<K, V> {
    private _defaultValue: V;

    /**
     * constructs a new instance of SafeMap.
     * @param defaultValue {V} - The default value to return if the key is not found.
     * @param initialValues {K, V}[] - The key-value pairs to add to the map.
     */
    constructor(defaultValue: V, initialValues?: [K, V][]) {
        super(initialValues);
        this._defaultValue = defaultValue;
    }

    /**
     * gets the value associated with the given key.
     * if the key is not found, the default value is returned.
     * @param key {K} - The key to check for.
     * @returns {V} - The value associated with the key.
     */
    public safeGet(key: K): V {
        return this.has(key) ? (this.get(key) as V) : this._defaultValue;
    }
}
