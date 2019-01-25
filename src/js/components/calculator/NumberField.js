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
    time,
    exponent,
    value,
    onChange,
    ...props
}) => {
    let currentUnit = (state.displayUnits && state.displayUnits[field]) || unit;
    let currentTimeUnit = (state.displayUnits && state.displayUnits[field + 'Time']) || time;

    return (
        <div className="input-group">
            <DimensionlessNumberField { ...props }
                    field={ field }
                    state={ state }
                    unit={ unit }
                    time={ time }
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
                        onChange={ onChange } />
                {
                    time ? (
                        <UnitSelector field={ field + 'Time' }
                                currentUnit={ currentTimeUnit }
                                unit={ time }
                                value={ currentTimeUnit }
                                number={ getRawValue(state, field, value) }
                                onChange={ onChange } />
                    ) : null
                }
            </div>
        </div>
    );
}
