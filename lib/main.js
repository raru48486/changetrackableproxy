export class ChangeTrackableProxy extends Function {
    /** @type {any} */
    source;

    /** @type {Map<string, any>} */
    changes;

    /**
     * @param {any} source
     */
    constructor(source) {
        super();
        this.source = source;
        this.changes = new Map();
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
                return Reflect.has(target.source, property);
            },
            get(target, property) {
                if (target.changes.has(property)) {
                    return target.changes.get(property);
                } else {
                    return Reflect.get(target.source, property);
                }
            },
            set(target, property, value) {
                target.changes.set(property, value);
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
     * @param {string} property 
     * @returns {boolean}
     */
    isChanged(property) {
        if (this.changes.has(property)) {
            const oldvalue = Reflect.get(this.source, property);
            const newvalue = this.changes.get(property);
            return oldvalue !== newvalue;
        }
        return false;
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
}
