import React, { useContext } from 'react';
import { Decimal } from 'decimal.js';
import get from 'lodash/get';
import set from 'lodash/set';
import convert from '../../converter';
import { getRawValue } from '../../utils';
import { DataContext, toUnit, getDisplayValue } from '../../calculators/helpers';
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
				value={ value }
				onChange={
					(ev) => {
						const result = JSON.parse(JSON.stringify(data)) || {};
						definition.set(ev.target.value, result);
						update(result);
					}
				} />
	);
}
