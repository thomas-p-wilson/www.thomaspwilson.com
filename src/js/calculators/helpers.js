import React from 'react';
import get from 'lodash/get';
import ContextNumberField from '../components/redone/ContextNumberField';
import ContextUnitSelector from '../components/redone/ContextUnitSelector';
import UnitSelector from '../components/redone/UnitSelector';
import { getRawValue } from '../utils';
import convert from '../converter';

/**
 * Produce a number field input with label and unit selector.
 *
 * @param {String} field - The identifier of the field.
 * @param {Object} definition - The field definition.
 * @returns {ReactElement[]} - An array of react elements: the label, the input,
 *     and the unit selector.
 */
export const numberField = ({ title, ...definition }, calculator) => ([
	(
        <label forHtml="">{ title }</label>
    ),
    (
        <ContextNumberField definition={ definition } calculator={ calculator } />
    ),
    (
        <ContextUnitSelector definition={ definition } calculator={ calculator } />
    )
    /*(
        <ContextNumberField field={ identifier }
                state={ state }
                unit={ unit }
                display={ display }
                time={ time }
                displayTime={ displayTime }
                exponent={ exponent }
                value={ value }
                onChange={ onChange } />
    ),*/
	/*(
        <UnitSelector field={ identifier }
                currentUnit={ currentUnit }
                unit={ unit }
                value={ currentUnit }
                exponent={ exponent }
                number={ getRawValue(state, field, value) }
                onChange={ onChange }
                disabled={ unconvertible } />
    )*/
])

export const DataContext = React.createContext({});

export const SettingsContext = React.createContext({});

// /**
//  * Determine the value of a field.
//  *
//  * @param {Object} data - The data container
//  * @param {String} slug - The calculator slug
//  * @param {String} field - The field to retrieve
//  * @param {Function} calculate - The function to invoke to calculate the value
//  *     of the field if not explicitly set.
//  * @param {String} unit - The default unit for the field
//  * @param {Number} exponent - The exponent of the field
//  */
// export function getValue(data, slug, field, calculate, unit, exponent = 1) {
//     let value = get(data, `${ slug }.${ field }`);
//     if (!value && calculate) {
//         value = calculate(data);
//     }
//     if (isNaN(value)) {
//         return '';
//     }

//     // Get current unit
//     const displayUnit = get(data, `${ slug }.${ field }_unit`, unit);
//     const storageUnit = unit;
//     if (displayUnit !== storageUnit) {
//         value = convert(value, exponent).from(storageUnit).to(displayUnit);
//     }

//     if (isNaN(value)) {
//         return '';
//     }

//     value = new Decimal(value || 0).toString();
//     if (`${ value }`.substr(-1) === '.') {
//         value += '.';
//     }
//     return value;
// }

// export function toStorageUnit(value, exponent, storageUnit, displayUnit) {

// }

// export function toDisplayUnit(value, exponent, storageUnit, displayUnit) {

// }

// export function toUnit(data, slug, field, value, exponent, fromUnit, toUnit) {
//     if (fromUnit === toUnit) {
//         console.log('Same unit: %s. NO conversion', fromUnit);
//         return value;
//     }
//     value = convert(value, exponent).from(fromUnit).to(toUnit);

//     return isNaN(value) ? '' : value;

// }


/**
 * Retrieve the value of the given field and return it in the storage unit of
 * measure.
 */
export function getStoredValue(data, field, calculator) {
    const displayUnit = get(data, `${ calculator.meta.slug }.${ field.id }_unit`, field.unit);
    const result = get(data, `${ calculator.meta.slug }.${ field.id }`);
    if (displayUnit !== field.unit) {
        return convert(result, 1).from(displayUnit).to(field.unit);
    }
    return result;
}

export function getDisplayValue(data, field, calculator) {
    return get(data, `${ calculator.meta.slug }.${ field.id }`);
}