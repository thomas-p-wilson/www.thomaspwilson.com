import React from 'react';

/**
 *
 */
export default ({ name, options, ...props }) => (
    <select className="form-control"
            { ...props }
            name={ name }
            id={ name }
            data-field={ name }>
        {
            Object.keys(options)
                .map((key) => (
                    <option value={ key }>{ options[key] }</option>
                ))
        }
    </select>
);
