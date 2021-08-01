import React from 'react';
import NumberField from './NumberField';
import UnitSelector from './UnitSelector';
import { useCalculatorContext } from '../Calculator';

/**
 *
 */
export default ({
    field,
    unit,
    display,
    unconvertible,
    time,
    displayTime,
    exponent,
    value,
    ...props
}) => {
    const calculator = useCalculatorContext();
    let currentUnit = display || calculator.getUnit(field, unit);
    let currentTimeUnit = displayTime || calculator.getUnit(`${field}Time`, time);

    return (
        <div className="input-group">
            <NumberField { ...props }
                    field={ field }
                    unit={ unit }
                    display={ display }
                    time={ time }
                    displayTime={ displayTime }
                    exponent={ exponent }
                    value={ value } />
            <div className="input-group-append">
                <UnitSelector field={ field }
                        currentUnit={ currentUnit }
                        unit={ unit }
                        value={ currentUnit }
                        exponent={ exponent }
                        number={ calculator.getValue(field, value) }
                        disabled={ unconvertible } />
                {
                    time ? (
                        <UnitSelector field={ field + 'Time' }
                                currentUnit={ currentTimeUnit }
                                unit={ time }
                                value={ currentTimeUnit }
                                number={ calculator.getValue(field, value) }
                                disabled={ unconvertible } />
                    ) : null
                }
            </div>
        </div>
    );
}
