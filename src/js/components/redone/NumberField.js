import React from 'react';

/**
 * Basic number field.
 *
 * @param {String} name - The name of the field
 */
export default ({ name, ...props }) => (
    <input type="text"
            { ...props }
            name={ name }
            id={ name }
            data-field={ name }
            className="form-control" />
);
