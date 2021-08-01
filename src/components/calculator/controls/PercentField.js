import React from 'react';
import convert from '../../../utils/conversion';
import { useCalculatorContext } from '../Calculator';

/**
 *
 */
export default ({
    field,
    unit,
    display, // remove
    time,    // remove
    displayTime, // remove
    exponent,
    setting,
    ...props
}) => {
    const calculator = useCalculatorContext();

    let currentUnit = display || calculator.getUnit(field, unit);
    let result = calculator.calculate(field);
    if (setting) {
        result = calculator.getSetting(field);
    }
    if (currentUnit !== unit) {
        result = convert(result, exponent).from(unit).to(currentUnit);
    }

    let currentTimeUnit = displayTime || calculator.getUnit(`${field}Time`, time);
    if (currentTimeUnit !== time) {
        result = convert(result, exponent).from(time).to(currentTimeUnit);
    }

    if (isNaN(result)) {
        result = '';
    }

    if (`${ result }`.substr(-1) !== '.' && !calculator.getValue(field)) {
        result = Number(result).toLocaleString({}, {
            minimumFractionDigits: 0,
            maximumFractionDigits: Math.min(calculator.getSetting('scale', 16), 16)
        });
    }

    return (
        <input type="text"
                { ...props }
                name={ field }
                onChange={ setting ? calculator.onChangeSetting : calculator.onChange }
                value={ result }
                className="form-control" />
    );
}
