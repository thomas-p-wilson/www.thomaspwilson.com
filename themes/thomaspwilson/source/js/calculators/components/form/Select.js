import React from 'react';

const wrapper = (wrapped) => (ev) => {
	if (wrapped) {
		wrapped(ev.target.name, ev.target.value);
	}
}

export default ({ className, options, onChange, value, name, ...rest }) => {
	let processed = [];
	if (Array.isArray(options)) {
		processed = options;
	} else {
		Object.keys(options)
				.forEach((v) => {
					processed.push({
						value: v,
						title: options[v],
						selected: v === value
					})
				})
	}

	return (
		<select className={ className } onChange={ wrapper(onChange) } { ...rest }>
			{
				processed.map((o) => (
					<option value={ o.value } key={ o.value } selected={ o.selected }>{ o.title }</option>
				))
			}
		</select>
	);
}