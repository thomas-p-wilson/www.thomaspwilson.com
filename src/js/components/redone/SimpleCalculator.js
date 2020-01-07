import React, { useContext } from 'react';
import clsx from 'clsx';
import set from 'lodash/set';
import { DataContext, numberField, selectField } from '../../calculators/helpers';
import BackButton from './BackButton';
import { SettingsButton } from './Settings';

function render(field, calculator) {
	if (field.options) {
		return selectField(field, calculator);
	}
	return numberField(field, calculator);
}

export default class SimpleCalculator extends React.Component {
	constructor(props) {
		super(props);

		const { slug, data = {}, update } = useContext(DataContext);
		const result = JSON.parse(JSON.stringify(data)) || {};
		Object.keys(props.calculator.fields)
			.filter((field) => (typeof props.calculator.fields[field].default !== 'undefined'))
			.map((field) => (props.calculator.fields[field]))
			.forEach((field) => {
				if (typeof field.default !== 'undefined') {
					set(result, `${ props.calculator.meta.slug }.${ field.id }`, field.default);
				}
			});
		update(result);
		global.calculator = props.calculator;
	}
	render({ calculator }) {
		return (
			<div>
				<div className="calc-header">
					<BackButton to="/" />
					<h2>{ calculator.meta.title }</h2>
					<SettingsButton />
				</div>
				<ul className="calc-box">
					{
						Object.keys(calculator.fields).map((key) => (
							<li className={ clsx({ readonly: calculator.fields[key].readonly }) }>
								{
									render(calculator.fields[key], calculator)
								}
							</li>
						))
					}
				</ul>
			</div>
		);
	}
}
