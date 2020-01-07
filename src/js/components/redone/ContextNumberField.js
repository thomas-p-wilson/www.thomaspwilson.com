import React, { useContext } from 'react';
import set from 'lodash/set';
import { DataContext } from '../../calculators/helpers';
import NumberField from './NumberField';

/**
 * Retrieves data from the calculator context and uses that data to produce a
 * number field.
 */
export default ({ definition, calculator }) => {
	const { slug, data = {}, update } = useContext(DataContext);
	const value = definition.display(data);

	return (
		<NumberField field={ definition.id }
				readonly={ definition.readonly }
				value={ value }
				onChange={
					(ev) => {
						const result = JSON.parse(JSON.stringify(data)) || {};
						definition.set(ev.target.value, result);
						calculator.resetCache();
						update(result);
					}
				} />
	);
}
