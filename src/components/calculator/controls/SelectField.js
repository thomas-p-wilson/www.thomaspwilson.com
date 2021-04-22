import React from 'react';
import { useCalculatorContext } from '../Calculator';

/**
 *
 */
export default ({
    field,
    options = {},
    value,
    ...props
}) => {
    const calculator = useCalculatorContext();
    return (
        <div className="input-group">
            <select className="form-control"
                    { ...props }
                    data-field={ field }
                    value={ value || calculator.getRawValue(field) }
                    onBlur={ calculator.onChange }>
                {
                    Object.keys(options)
                        .map((key) => (
                            <option value={ key } key={ key }>{ options[key] }</option>
                        ))
                }
            </select>
        </div>
    );
};
