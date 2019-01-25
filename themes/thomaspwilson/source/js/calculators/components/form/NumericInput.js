import React from 'react';
import { roundToScale } from '../../utils';

export default ({ scale, ...rest }) => {
	// Handle rounding
    if (rest.value) {
        rest.value = roundToScale(rest.value, scale);
    }
    if (rest.defaultValue) {
    	rest.defaultValue = roundToScale(rest.defaultvalue, scale);
    }
    if (!rest.step) {
        rest.step = 0.01;
    }
	return (
		<input type={ 'number' } { ...rest } />
	);
}
