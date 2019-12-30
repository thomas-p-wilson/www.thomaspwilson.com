import React from 'react';
import { numberField } from '../../calculators/helpers';

export default ({ calculator }) => (
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
