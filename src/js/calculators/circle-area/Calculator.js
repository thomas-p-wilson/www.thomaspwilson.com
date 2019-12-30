import React from 'react';
import get from 'lodash/get';
import { numberField } from '../helpers';
import calculator from './definition';

console.log('Calculator: ', calculator)

export default () => {
	return (
		<ul className="calculator-box">
			{
				Object.keys(calculator.fields).map((key) => (
					<li>
						{ numberField(calculator.fields[key], calculator) }
					</li>
				))
			}
		</ul>
	);
};
