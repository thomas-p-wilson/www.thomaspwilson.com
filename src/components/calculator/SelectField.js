import React from 'react';

/**
 *
 */
export default ({
    field,
    state = {},
    options = {},
    value,
    onChange,
    ...props
}) => (
    <div className="input-group">
        <select className="form-control"
                { ...props }
                data-field={ field }
                value={ value || state[field] }
                onChange={ onChange }>
            {
                Object.keys(options)
                    .map((key) => (
                        <option value={ key }>{ options[key] }</option>
                    ))
            }
        </select>
    </div>
);
