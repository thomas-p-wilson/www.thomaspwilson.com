import React from 'react';
import convert from '../../utils/conversion';
import { getRawValue } from '../../utils/calculator';

/**
 *
 */
export default ({
    field,
    state = {},
    value,
    unit,
    time,
    exponent,
    ...props
}) => {
    let currentUnit = (state.displayUnits && state.displayUnits[field]) || unit;
    let convertedValue = getRawValue(state, field, value);
    if (currentUnit !== unit) {
        convertedValue = convert(convertedValue, exponent).from(unit).to(currentUnit);
    }

    let currentTimeUnit = (state.displayUnits && state.displayUnits[field + 'Time']) || time;
    if (currentTimeUnit !== time) {
        convertedValue = convert(convertedValue, exponent).from(time).to(currentTimeUnit);
    }

    let fixedValue = Number(convertedValue).toLocaleString({}, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 16
    });
    if (`${ convertedValue }`.substr(-1) === '.') {
        fixedValue += '.';
    }

    return (
        <input type="text"
                { ...props }
                data-field={ field }
                data-base-unit={ unit }
                data-current-unit={ currentUnit }
                data-exponent={ exponent }
                value={ fixedValue }
                className="form-control" />
    );
}
