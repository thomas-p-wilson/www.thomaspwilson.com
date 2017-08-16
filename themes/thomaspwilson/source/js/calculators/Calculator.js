export default class Calculator {
    /**
     * @param {Object} options - 
     * @param {Object} options.defaults -
     * @param {Object} options.computed - 
     * @param {Object} options.watch - 
     */
    constructor(options) {
        // Avoid non-resolving recursive calls by tracking the call stack
        this.stack = [];
        this.data = Object.assign({}, options.default);
        this.watchers = Object.assign({}, options.watch);

        const self = this;

        // Build getters and setters for all known keys
        Object.keys(options.default || {})
            .concat(Object.keys(options.compute || {}))
            .concat(Object.keys(options.watch || {}))
            .filter((value, i, self) => (self.indexOf(value) === i))
            .forEach((fieldName) => {
                const getter = function() {
                    if (self.stack.indexOf(getter.name) !== -1) {
                        throw new Error();
                    }
                    self.stack.push(getter.name);
                    let result;
                    try {
                        if (self.data[fieldName]) {
                            result = self.data[fieldName];
                        }
                        if (!result && options.compute[fieldName]) {
                            result = options.compute[fieldName].apply(self);
                        }
                    } finally {
                        self.stack.pop();
                    }
                    return result;
                };
                Object.defineProperty(getter, 'name', { 'value': 'get_' + fieldName });
                const setter = function(value) {
                    const old = self.data[fieldName];
                    self.data[fieldName] = value;
                    self.updated(fieldName, old, value);
                };
                Object.defineProperty(setter, 'name', { 'value': 'set_' + fieldName });
                Object.defineProperty(this, fieldName, {
                    get: getter,
                    set: setter,
                    configurable: false
                });
            });

        Object.keys(options)
            .filter((key) => (['default', 'compute', 'watch'].indexOf(key) === -1))
            .forEach((key) => {
                this[key] = options[key];
            });
    }

    updated(fieldName, oldValue, newValue) {
        if (!this.watchers[fieldName]) {
            return;
        }
        if (Array.isArray(this.watchers[fieldName])) {
            this.watchers[fieldName].forEach((watcher) => (watcher.bind(this)(oldValue, newValue)));
        }
        if (typeof this.watchers[fieldName] === 'function') {
            this.watchers[fieldName].bind(this)(oldValue, newValue);
        }
    }
}