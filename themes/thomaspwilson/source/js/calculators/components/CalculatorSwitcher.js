import React from 'react';
import PropTypes from 'prop-types';
import { queryStringToMap, updateQueryString } from '../utils';
import Dropdown from './form/Dropdown';

export default class CalculatorSwitcher extends React.Component {
	static propTypes = {
		calculators: PropTypes.array,
		calculator: PropTypes.object,
		onChange: PropTypes.func
	};

	constructor() {
		super();
		this.state = {
			open: false
		};
		this.toggle = this.toggle.bind(this);
		this.onChange = this.onChange.bind(this);
	}

    componentWillMount() {
        const map = queryStringToMap();
        if (map.view) {
            this.state.active = map.view;
        } else {
            map.view = this.props.calculators[0].slug;
            updateQueryString(map);
        }
    }

	toggle() {
		this.setState({ open: !this.state.open });
	}

    onChange(id, slug) {
    	this.props.onChange(slug);
    	this.setState({ open: false });
    }

	getCalculators() {
		if (!this.props.calculators) {
			return [];
		}
        return this.props.calculators.map((calculator) => ({ value: calculator.slug, title: calculator.title }));
	}

	render() {
		return (
			<li>
				<Dropdown title={ (this.props.calculator || {}).title || 'Select Calculator' } options={ this.getCalculators() } onChange={ this.onChange } />
			</li>
		);
	}
}