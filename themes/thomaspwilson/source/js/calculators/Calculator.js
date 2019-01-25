import { convert } from './measurements';

export default class Calculator {
    /**
     * @param {Object} options - 
     * @param {Object} options.defaults -
     * @param {Object} options.computed - 
     * @param {Object} options.watch - 
     */
    constructor(options) {
        // Avoid non-resolving recursive calls by tracking the call stack
        this.options = options;
        this.stack = [];
        this.data = {};
        this.cache = {};
        this.field_units = {};
        this.watchers = { ...options.watch };

        this.isExplicit = this.isExplicit.bind(this);
        this.updated = this.updated.bind(this);

        const self = this;

        // Build getters and setters for all known keys
        Object.keys(options.fields || {})
            .concat(Object.keys(options.watch || {}))
            .filter((value, i, self) => (self.indexOf(value) === i))
            .forEach((fieldName) => {
                const getter = () => (this.get(fieldName));
                Object.defineProperty(getter, 'name', { 'value': 'get_' + fieldName });
                const setter = (value) => { this.set(fieldName, value); }
                Object.defineProperty(setter, 'name', { 'value': 'set_' + fieldName });
                Object.defineProperty(this, fieldName, {
                    get: getter,
                    set: setter,
                    configurable: false
                });
            });

        // Add roots to calculator object
        ['title', 'slug', 'description', 'units', 'sections', 'fields']
                .forEach((key) => {
                    if (options[key]) {
                        this[key] = options[key];
                    }
                })
    }

    updated(fieldName, oldValue, newValue) {
        this.cache = {};
        // if (this.watchers['*']) {
        //     this.watchers['*'].bind(this)(fieldName, oldValue, newValue);
        // }
        // if (!this.watchers[fieldName]) {
        //     return;
        // }
        // if (Array.isArray(this.watchers[fieldName])) {
        //     this.watchers[fieldName].forEach((watcher) => (watcher.bind(this)(oldValue, newValue)));
        // }
        // if (typeof this.watchers[fieldName] === 'function') {
        //     this.watchers[fieldName].bind(this)(oldValue, newValue);
        // }
    }

    isExplicit(fieldName) {
        var field = Object.getOwnPropertyDescriptor(this.data, fieldName);
        return Object.prototype.hasOwnProperty.call(this.data, fieldName) || (field && !field.get);
    }

    /**
     * Retrieve or calculate the value of a field
     */
    get(name) {
        if (this.stack.indexOf(name) !== -1) {
            throw new Error('Circular reference');
        }

        if (name.indexOf('$unit') === 0) {
            name = name.substr(6);
        }

        if (this.cache[name]) {
            return this.cache[name];
        }
        if (this.data[name]) {
            return this.data[name];
        }

        if (!this.fields[name]) {
            return;
        }

        const field = this.fields[name];
        let result;
        try {
            this.stack.push(name);
            if (field.calculate) {
                result = field.calculate.apply(this, [this]);
            }
        } catch (err) {
            if (err.message !== 'Circular reference') {
                console.log('Error: ', err);
                throw err;
            }
        } finally {
            this.stack.pop();
        }

        // Get default value as a last resort
        if (field.default) {
            result = convert(field.default, this.getUnit(name), this.units[field.unit.type], field.unit.exponent || 1);
        }
        this.cache[name] = result;
        return result;
    }

    /**
     * Explicitly set the value of a field
     */
    set(name, value) {
        if (name.indexOf('$unit') === 0) {
            this.setUnit(name.substr(6), value);
            return;
        }
        const old = this.data[name];
        if (value === null || value === '') {
            delete this.data[name];
        } else {
            this.data[name] = value;
        }
        this.updated(name, old, value);
    }

    getUnit(name) {
        let result;
        if (this.field_units[name]) {
            result = this.field_units[name];
        }
        if (!result
                && this.fields[name]
                && this.fields[name].unit) {
            result = this.fields[name].unit.default;
        }
        if (result.indexOf('$unit') === 0) {
            return this.getUnit(result.substr(6));
        }
        return result;
    }
    setUnit(name, unit) {
        const old = this.getUnit(name);
        this.field_units[name] = unit;
        this.cache = {};
    }
}