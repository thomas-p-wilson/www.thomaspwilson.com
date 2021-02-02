import React from 'react';
import DimensionlessNumberField from './DimensionlessNumberField';
import UnitSelector from './UnitSelector';
import { getRawValue } from '../../utils/calculator';

/**
 *
 */
export default ({
    field,
    state = {},
    unit,
    display,
    unconvertible,
    time,
    displayTime,
    exponent,
    value,
    onChange,
    ...props
}) => {
    let currentUnit = display || (state.displayUnits && state.displayUnits[field]) || unit;
    let currentTimeUnit = displayTime || (state.displayUnits && state.displayUnits[field + 'Time']) || time;

    return (
        <div className="input-group">
            <DimensionlessNumberField { ...props }
                    field={ field }
                    state={ state }
                    unit={ unit }
                    display={ display }
                    time={ time }
                    displayTime={ displayTime }
                    exponent={ exponent }
                    value={ value }
                    onChange={ onChange } />
            <div className="input-group-append">
                <UnitSelector field={ field }
                        currentUnit={ currentUnit }
                        unit={ unit }
                        value={ currentUnit }
                        exponent={ exponent }
                        number={ getRawValue(state, field, value) }
                        onChange={ onChange }
                        disabled={ unconvertible } />
                {
                    time ? (
                        <UnitSelector field={ field + 'Time' }
                                currentUnit={ currentTimeUnit }
                                unit={ time }
                                value={ currentTimeUnit }
                                number={ getRawValue(state, field, value) }
                                onChange={ onChange }
                                disabled={ unconvertible } />
                    ) : null
                }
            </div>
        </div>
    );
}
