import React from 'react';
import convert from '../../../utils/conversion';
import { useCalculatorContext } from '../Calculator';

/**
 *
 */
export default ({
    field,
    unit,
    display,
    time,
    displayTime,
    defaultValue,
    exponent,
    ...props
}) => {
    const calculator = useCalculatorContext();

    let currentUnit = display || calculator.getDisplayUnit(field, unit);
    let result = calculator.calculate(field) || calculator.getRawValue(field, null, defaultValue);
    if (currentUnit !== unit) {
        result = convert(result, exponent).from(unit).to(currentUnit);
    }

    let currentTimeUnit = displayTime || calculator.getDisplayUnit(`${field}Time`, time);
    if (currentTimeUnit !== time) {
        result = convert(result, exponent).from(time).to(currentTimeUnit);
    }

    if (isNaN(result)) {
        result = '';
    }

    result = Number(result).toLocaleString({}, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 16
    });
    if (`${ result }`.substr(-1) === '.') {
        result += '.';
    }

    return (
        <input type="text"
                { ...props }
                onChange={ calculator.onChange }
                data-field={ field }
                data-base-unit={ unit }
                data-current-unit={ currentUnit }
                data-exponent={ exponent }
                value={ result }
                className="form-control" />
    );
}
