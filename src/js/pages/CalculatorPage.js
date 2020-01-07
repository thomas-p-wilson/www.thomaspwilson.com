import React, { useReducer } from 'react';
import connect from '../decorators/connect';
import { withRouter } from 'react-router';
import { getCalculators } from '../services/calculator';
import { actions } from '../ducks';
import { DataContext, SettingsContext } from '../calculators/helpers';

@withRouter
@connect({
	calculator: true,
	data: {
		action: false
	},
	settings: {
		action: false
	}
})
class CalculatorPage extends React.Component {
	constructor() {
		super();

		this.update = this.update.bind(this);
	}
	
	update(data) {
		return this.props.dispatch(actions.getRegistered().setData(data));
	}

	render({ calculator, data, settings, match, dispatch, ...rest }) {
		const slug =  `${ (calculator || {}).slug }`;
		const module = getCalculators()[slug];
		if (!module || calculator.loading) {
			return (
				<div>Loading!!!</div>
			)
		}

		const Module = module.default;
		return (
			<SettingsContext.Provider value={ settings }>
				<DataContext.Provider value={ {
					slug,
					data,
					update: this.update
				} }>
					<Module />
				</DataContext.Provider>
			</SettingsContext.Provider>
		)
	}
}

export default CalculatorPage;
