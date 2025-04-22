function __isEqual(a, b) {
    if (a === b) {
        return true;
    } else {
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        } else {
            return false;
        }
    }
}

/**
 * @typedef {Object} getResult
 * @property {boolean}
 * @property {any} value
 */

export class ChangeTrackableProxy extends Function {

    /** @type {any} */
    source;

    /** @type {Map<string, any>} */
    changes;

    /** @type {Map<string, any>} */
    attributes;

    /** @type {Map<string, Map<string, any>>} */
    propAttributes;

    /**
     * @param {any} source
     */
    constructor(source) {
        super();
        this.source = source;
        this.changes = new Map();
        this.attributes = new Map();
        this.propAttributes = new Map();
        return new Proxy(this, {
            getPrototypeOf(target) {
                return Reflect.getPrototypeOf(target.source);
            },
            setPrototypeOf(target, v) {
                return Reflect.setPrototypeOf(target.source, v);
            },
            isExtensible(target) {
                return Reflect.isExtensible(target.source);
            },
            preventExtensions(target) {
                return Reflect.preventExtensions(target.source);
            },
            getOwnPropertyDescriptor(target, property) {
                return Reflect.getOwnPropertyDescriptor(target.source, property);
            },
            defineProperty(target, property, attributes) {
                return Reflect.defineProperty(target.source, property, attributes);
            },
            has(target, property) {
                return Reflect.has(target.source, property) || target.changes.has(property);
            },
            get(target, property) {
                if (target.changes.has(property)) {
                    return target.changes.get(property);
                } else {
                    return Reflect.get(target.source, property);
                }
            },
            set(target, property, value) {
                const oldvalue = Reflect.get(target.source, property);
                if (__isEqual(oldvalue, value)) {
                    target.changes.delete(property);
                } else {
                    target.changes.set(property, value);
                }
                return true;
            },
            deleteProperty(target, property) {
                target.changes.delete(property);
                return Reflect.deleteProperty(target.source, property);
            },
            ownKeys(target) {
                return Reflect.ownKeys(target.source);
            },
            apply(target) {
                return target;
            },
        });
    }

    /**
     * 
     * @param {string|symbol} keyOrProperty 
     * @param {any} keyOrValue 
     * @param {any} value 
     */
    setAttribute(keyOrProperty, keyOrValue, value) {
        if (value === undefined) {
            this.attributes.set(keyOrProperty, keyOrValue);
        } else {
            const m = this.propAttributes.get(keyOrProperty) ?? new Map();
            m.set(keyOrValue, value);
            this.propAttributes.set(keyOrProperty, m);
        }
    }

    /**
     * 
     * @param {string|symbol} keyOrProperty 
     * @param {string|symbol} key 
     * @returns {getResult}
     */
    getAttribute(keyOrProperty, key) {
        if (key === undefined) {
            if (this.attributes.has(keyOrProperty)) {
                return { ok: true, value: this.attributes.get(keyOrProperty) };
            }
        } else if (this.propAttributes.has(keyOrProperty)) {
            const a = this.propAttributes.get(keyOrProperty);
            if (a.has(key)) {
                return { ok: true, value: a.get(key) };
            }
        }
        return { ok: false };
    }

    /**
     * @param {string?} property 
     * @returns {boolean}
     */
    isChanged(property) {
        if (property) {
            return this.changes.has(property);
        } else {
            return this.changes.size > 0;
        }
    }

    /**
     * @returns {object}
     */
    getChanges() {
        const changes = new Map();
        this.changes.forEach((v, k) => {
            if (this.isChanged(k)) {
                changes.set(k, v);
            }
        });
        return Object.fromEntries(changes);
    }

    /** 
     * @param {string|symbol} property 
     * @returns {any}
     */
    getOldValue(property) {
        return Reflect.get(this.source, property);
    }

    /**
     * @returns {any}
     */
    getSource() {
        return this.source;
    }

    commitChanges() {
        const s = this.source;
        this.changes.forEach((v, k) => {
            Reflect.set(s, k, v);
        });
    }

    rollbackChanges() {
        this.changes.clear();
    }

    /**
     * @param {any} proxy 
     * @param {string|symbol} property 
     * @returns {boolean}
     */
    static isChanged(proxy, property) {
        return proxy().isChanged(property);
    }

    /**
     * @param {any} proxy 
     * @returns {object}
     */
    static getChanges(proxy) {
        return proxy().getChanges();
    }

    /**
     * 
     * @param {any} proxy 
     * @param {string|symbol} property 
     * @returns {any}
     */
    static getOldValue(proxy, property) {
        return proxy().getOldValue(property);
    }

    /**
     * 
     * @param {any} proxy 
     * @returns {any}
     */
    static getSource(proxy) {
        return proxy().getSource();
    }

    /**
     * @param {any} proxy 
     */
    static commitChanges(proxy) {
        proxy().commitChanges();
    }

    /**
     * @param {any} proxy 
     */
    static rollbackChanges(proxy) {
        proxy().rollbackChanges();
    }

    /**
     * 
     * @param {string|symbol} keyOrProperty 
     * @param {any} keyOrValue 
     * @param {any} value 
     */
    static setAttribute(proxy, keyOrProperty, keyOrValue, value) {
        proxy().setAttribute(keyOrProperty, keyOrValue, value);
    }


    /**
     * 
     * @param {any} proxy 
     * @param {string|symbol} keyOrProperty 
     * @param {string|symbol} key 
     * @returns {getResult}
     */
    static getAttribute(proxy, keyOrProperty, key) {
        return proxy().getAttribute(keyOrProperty, key);
    }
}
