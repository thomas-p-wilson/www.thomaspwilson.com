import React from 'react';

export default class UrlPropsWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        let data = {};
        let stack = [];
        Object.defineProperty(data, 'data', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: {}
        });
        let self = this;
        Object.keys(this.props.fields)
            .forEach((fieldName) => {
                const getter = function() {
                    if (stack.indexOf(getter.name) !== -1) {
                        throw new Error();
                    }
                    stack.push(getter.name);
                    try {
                        if (this['_' + fieldName]) {
                            return this['_' + fieldName];
                        }
                        if (typeof self.props.fields[fieldName].value === 'function') {
                            return self.props.fields[fieldName].value(this);
                        }
                        if (typeof self.props.fields[fieldName].value === 'string'
                                && self.props.fields[fieldName].value.length > 1
                                && self.props.fields[fieldName].value[0] === '$') {
                            return this['_' + self.props.fields[fieldName].value.substr(1)];
                        }
                    } finally {
                        stack.pop();
                    }
                };
                Object.defineProperty(getter, 'name', { 'value': 'get_' + fieldName });
                const setter = function(value) {
                    this['_' + fieldName] = value;
                };
                Object.defineProperty(setter, 'name', { 'value': 'set_' + fieldName });
                Object.defineProperty(data, fieldName, {
                    get: getter,
                    set: setter,
                    configurable: false,
                    enumerable: false
                });
            });
        Object.keys(this.props.fields).forEach((fieldName) => {
            if (this.props.fields[fieldName].default) {
                data[fieldName] = evaluate(this.props.fields[fieldName].default, data);
            }
        });
        let query = queryStringToMap();
        Object.keys(query).forEach((fieldName) => {
            if (query[fieldName]) {
                data[fieldName] = query[fieldName]
            } 
        });
        window.data = data;
        this.setState({ data });
    }

    onChange(ev) {
        let data = this.state.data;

        const { name, value } = ev.target;
        updateQueryStringParam(name, value);
        if (value === undefined || value === null || value === '') {
            data[name] = undefined;
        } else {
            data[name] = value;
        }
    
        if (this.props.fields[name] && this.props.fields[name].clear) {
            this.props.fields[name].clear.forEach((field) => {
                data[field] = undefined;
                updateQueryStringParam(field, undefined);
            });
        }

        this.setState({ data });
    }

    render() {
        return (<Calculator onChange={ this.onChange } data={ this.state.data } { ...this.props } />);
    }
}
