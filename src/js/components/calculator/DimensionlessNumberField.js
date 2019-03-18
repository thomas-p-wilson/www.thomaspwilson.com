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
    display,
    time,
    displayTime,
    defaultValue,
    exponent,
    ...props
}) => {
    let currentUnit = display || (state.displayUnits && state.displayUnits[field]) || unit;
    let result = getRawValue(state, field, value, defaultValue);
    if (currentUnit !== unit) {
        result = convert(result, exponent).from(unit).to(currentUnit);
    }

    let currentTimeUnit = displayTime || (state.displayUnits && state.displayUnits[field + 'Time']) || time;
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
                data-field={ field }
                data-base-unit={ unit }
                data-current-unit={ currentUnit }
                data-exponent={ exponent }
                value={ result }
                className="form-control" />
    );
}
