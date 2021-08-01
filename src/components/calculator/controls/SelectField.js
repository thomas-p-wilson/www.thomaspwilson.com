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
                    name={ field }
                    value={ value || calculator.getValue(field) }
                    onBlur={ calculator.onChange }
                    onChange={ calculator.onChange }>
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
