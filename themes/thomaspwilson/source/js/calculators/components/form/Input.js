import React from 'react';

const wrapper = (wrapped) => (ev) => {
	if (wrapped) {
		wrapped(ev.target.name, ev.target.value);
	}
}

export default ({ type, onChange, ...rest }) => {
	return (
		<input type={ type || 'text' }
				{ ...rest }
				onChange={ wrapper(onChange) } />
	);
}
