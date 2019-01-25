import React from 'react';
import PropTypes from 'prop-types';
import CalculatorField from './components/CalculatorField';
import { queryStringToMap, updateQueryString } from './utils';

export default class CalculatorView extends React.Component {
    static displayName = 'CalculatorView';

    static propTypes = {
        'calculator': PropTypes.shape({
            'title': PropTypes.string,
            'default': PropTypes.object,
            'compute': PropTypes.object,
            'watch': PropTypes.object,
            'sections': PropTypes.arrayOf(PropTypes.shape({
                'title': PropTypes.string.isRequired,
                'fields': PropTypes.arrayOf(PropTypes.string)
            })),
            'fields': PropTypes.any
        })
    };

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        if (!this.props.calculator) {
            return;
        }
        const map = queryStringToMap();
        console.log('Map: ', map);
        if (Object.keys(map).length === 1 && map.view) {
            updateQueryString(Object.assign({}, map, this.props.calculator.data));
        } else {
            console.log('Map: ', map);
            this.props.calculator.data = map;
        }
    }

    onChange(name, value) {
        this.props.calculator.set(name, value);
        console.log('Here');
        this.setState({ calculator: this.props.calculator });
        const map = queryStringToMap();
        updateQueryString(Object.assign({}, { 'view': map.view }, this.props.calculator.data));
    }

    render() {
        if (!this.props.calculator) {
            return (<p>Loading calculator...</p>);
        }
        return (
            <form className="form-horizontal">
                {
                    this.props
                        .calculator
                        .sections
                        .filter((section) => (section.fields && section.fields.length > 0))
                        .map((section, i) => (
                            <div className="col-md-6 col-sm-12" key={ i }>
                                <h3>{ section.title }</h3>
                                {
                                    section.fields
                                        .map((fieldName, i) => (
                                            <CalculatorField id={ fieldName }
                                                    key={ i }
                                                    calculator={ this.props.calculator }
                                                    onChange={ this.onChange }
                                                    { ...this.props.calculator.fields[fieldName] } />
                                        ))
                                }
                            </div>
                        ))
                }
                <pre style={{ 'textAlign': 'left' }}>
                { JSON.stringify(this.props.calculator, null, 4) }
                </pre>
            </form>
        );
    }
}