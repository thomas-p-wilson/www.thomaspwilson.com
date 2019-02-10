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
    ...props
}) => {
    let result = getRawValue(state, field, value);

    return (
        <input type="checkbox"
                { ...props }
                data-field={ field }
                checked={ result } />
    );
}
