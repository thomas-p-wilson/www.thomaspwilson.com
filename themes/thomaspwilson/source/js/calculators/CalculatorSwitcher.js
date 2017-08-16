import React from 'react';
import PropTypes from 'prop-types';
import CalculatorView from './CalculatorView';
import { queryStringToMap, updateQueryString } from './utils';

export default class CalculatorSwitcher extends React.Component {
    static displayName = 'CalculatorSwitcher';

    static propTypes = {
        'calculators': PropTypes.arrayOf(PropTypes.shape({
            'title': React.PropTypes.string.isRequired
        }))
    };

    constructor() {
        super();
        this.state = {
            'active': 0
        };
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        const map = queryStringToMap();
        if (map.view) {
            this.state.active = parseInt(map.view);
        } else {
            map.view = 0;
            updateQueryString(map);
        }
    }

    onChange(i) {
        return () => {
            updateQueryString({ 'view': i });
            this.setState({ 'active': i });
        };
    }

    render() {
        return (
            <div>
                <ul className="nav nav-tabs">
                    {
                        this.props.calculators.map((calculator, i) => (
                            <li className={ this.state.active === i ? 'active' : '' }><a onClick={ this.onChange(i) }>{ calculator.title }</a></li>
                        ))
                    }
                </ul>
                <CalculatorView key={ this.state.active } calculator={ this.props.calculators[this.state.active] } />
            </div>
        );
    }
}