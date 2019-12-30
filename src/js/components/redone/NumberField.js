import React, { useState } from 'react';
import { Decimal } from 'decimal.js';
import convert from '../../converter';
import { getRawValue } from '../../utils';

/**
 * Basic number field. Fires `onChange` with a value of `undefined` if the
 * typed value is not a valid number.
 *
 * @param {String} name - The name of the field
 */
export default ({ name, value, onChange, ...props }) => {
    const [number, setNumber] = useState('');

    return (
        <input type="text"
                { ...props }
                name={ name }
                id={ name }
                value={ value/* || number*/ }
                data-field={ name }
                className="form-control"
                onChange={ (ev) => {
                    // setNumber(ev.target.value);
                    // if (isNaN(ev.target.value)) {
                    //     ev.target.value = undefined;
                    // }
                    onChange(ev);
                } } />
    );
};