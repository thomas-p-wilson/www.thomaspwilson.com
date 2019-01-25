import React from 'react';
import PropTypes from 'prop-types';
import { queryStringToMap, updateQueryString } from '../utils';
import { categories } from '../measurements';
import stateful from '../decorators/stateful';
import CalculatorField from './CalculatorField';

@stateful({ open: true })
class CalculatorSettings extends React.Component {
	static propTypes = {
		calculator: PropTypes.array,
		onChange: PropTypes.func,
		open: PropTypes.boolean,
		updateopen: PropTypes.func
	};

	constructor() {
		super();
		this.toggle = this.toggle.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	toggle() {
		this.props.updateopen(!this.props.open);
	}

    onChange(slug) {
        return () => {
        	this.props.onChange(slug);
        	this.props.updateopen(false);
        };
    }

    renderSettings() {
    	if (!this.props.calculator) {
    		return (<p>Loading calculator...</p>);
    	}
    	if (!this.props.calculator.units) {
    		return (<p>Calculator does not have any settings.</p>);
    	}

    	return (
			<div class="list-group">
				{
					Object.keys(this.props.calculator.units).map((unit, i) => {
						const cat = categories[unit];
						if (!cat) {
							throw new Error('Measurement category ' + unit + ' does not exist');
						}
						console.log('Category: ', cat);
						return (
							<CalculatorField id={ i }
									title={ cat.title }
									calculator={ this.props.calculator }
									options={
										Object.keys(cat.units)
												.map((symbol) => (cat.units[symbol]))
												.reduce((o, unit) => {
													// console.log('Unit: ', u);
													o[unit.symbol] = unit.title;
													return o;
												}, {})
									} />
						);
					})
				}
            </div>
        );
    }

	renderModal() {
		if (!this.props.open) {
			return;
		}

		return (
			<div>
				<div class="modal-backdrop in"></div>
				<div className="modal inmodal in" id="myModal" tabindex="-1" style="display: block; padding-right: 15px;">
				    <div className="modal-dialog">
				    <div className="modal-content animated bounceInRight">
				            <div className="modal-body">
            					<form className="form-horizontal">
				            		{ this.renderSettings() }
			            		</form>
				            </div>
				            <div className="modal-footer">
				                <button type="button" className="btn btn-white" data-dismiss="modal" onClick={ this.toggle }>Close</button>
				            </div>
				        </div>
				    </div>
				</div>
			</div>
		);
	}

	render() {
		return (
			<li className={ this.props.open ? ' open' : ''  }>
				<a className="btn btn-primary btn-circle" onClick={ this.toggle }>
					<i className="fa fa-cog" title="Calculator Settings" />
				</a>

	            { this.renderModal() }
			</li>
		);
	}
}

export default CalculatorSettings;