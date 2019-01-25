import React from 'react';
import PropTypes from 'prop-types';
import CalculatorView from './CalculatorView';
import CalculatorSwitcher from './components/CalculatorSwitcher';
import CalculatorSettings from './components/CalculatorSettings';
import { queryStringToMap, updateQueryString } from './utils';
import stateful from './decorators/stateful';

@stateful({ active: true, calculator: true })
class CalculatorPage extends React.Component {
    static propTypes = {
        'calculators': PropTypes.object,
        'active': PropTypes.string,
        'updateactive': PropTypes.func,
        'calculator': PropTypes.object,
        'updatecalculator': PropTypes.func
    };

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        const map = queryStringToMap();
        if (map.view) {
            this.onChange(map.view);
        } else {
            this.onChange(this.props.calculators[0].slug);
        }
    }

    onChange(slug) {
        const calculator = this.props.calculators.find((c) => (c.slug === slug));
        updateQueryString({ ...queryStringToMap(), 'view': slug });
        this.props.updateactive(slug);
        this.props.updatecalculator(calculator);

    }

    render() {
        return (
            <div className="container">
                <ul className="calculator-menu">
                    <CalculatorSwitcher calculators={ this.props.calculators } calculator={ this.props.calculator } active={ this.props.active } onChange={ this.onChange } />
                    <CalculatorSettings calculator={ this.props.calculator } onChange={ this.onChange } />
                    <li><i className="fa fa-info-circle" title="Information" /></li>
                </ul>
                <div className="clearfix" />
                <CalculatorView key={ this.props.active } calculator={ this.props.calculator } />
            </div>
        );
    }
}

export default CalculatorPage;