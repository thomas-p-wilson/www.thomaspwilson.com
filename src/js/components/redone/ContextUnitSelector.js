import React, { useContext } from 'react';
import { Decimal } from 'decimal.js';
import get from 'lodash/get';
import set from 'lodash/set';
import convert, { getMeasureName } from '../../converter';
import { getRawValue } from '../../utils';
import { DataContext, getDisplayUnit } from '../../calculators/helpers';
import UnitSelector from './UnitSelector';

/**
 * Retrieves data from the calculator context and uses that data to produce a
 * number field.
 */
export default ({ definition, calculator }) => {
	const { slug, data = {}, update } = useContext(DataContext);

	let displayUnit = getDisplayUnit(data, definition, calculator);

	return (
		<UnitSelector field={ definition.id }
				unit={ definition.unit }
				value={ displayUnit }
				exponent={ definition.exponent }
				onChange={
					(ev) => {
						const oldUnit = get(data, `${ slug }.${ definition.id }_unit`, definition.unit);
						const newUnit = ev.target.getAttribute('data-unit');
						const result = JSON.parse(JSON.stringify(data)) || {};
						set(result, `${ slug }.${ definition.id }_unit`, newUnit);
						const value = get(data, `${ slug }.${ definition.id }`);
						if (typeof value !== 'undefined' && value !== '') {
							set(result, `${ slug }.${ definition.id }`, convert(value, definition.exponent || 1, oldUnit, newUnit));
						}
						calculator.resetCache();
						update(result);
					}
				} />
	);
}
