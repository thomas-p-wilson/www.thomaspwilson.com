import get from 'lodash/get';
import set from 'lodash/set';
import convert from '../converter'

function once(cb) {
	return (data) => {
		// If this function has already been called, then return
	    if (cb.in) {
	    	cb.in = false;
	        return;
	    }

	    try {
	    	cb.in = true;
	    	return cb(data);
    	} finally {
    		cb.in = false;
    	}
	}
}

export default class Calculator {
	constructor(meta, definitions) {
		this.meta = meta;
		this.fields = {};
		this._starter = undefined;

		definitions.forEach((def) => {
			this.fields[def.id] = Object.assign({}, def, {
				parent: this
			});
			/**
			 * 
			 */
			this.fields[def.id].get = once((data) => {
				console.log('get()')
			    const storedValue = get(data, `${ this.meta.slug }.${ def.id }`);
				if (typeof storedValue === 'undefined' && this.fields[def.id].calculate) {
					console.log('Calculate value for %s', def.id);
					const res = this.fields[def.id].calculate(data);
					console.log('  Result: %s', res);
					return res;
				}
			    const displayUnit = get(data, `${ this.meta.slug }.${ def.id }_unit`, def.unit);
			    if (displayUnit !== def.unit) {
			        return convert(storedValue, 1).from(displayUnit).to(def.unit);
			    }
			    return storedValue;
			})
			/**
			 * Get display value. If the store has an explicit value for the
			 * field, that value is already in the display unit of measure, and
			 * does not need conversion. If the value is calculated, then the
			 * calculated value we receive is in the base unit of the field and
			 * _may_ need to be converted.
			 */
			this.fields[def.id].display = once((data) => {
				console.log('display()');

				const storedValue = get(data, `${ this.meta.slug }.${ def.id }`);
				if (typeof storedValue !== 'undefined') {
					return storedValue;
				}

				if (!this.fields[def.id].calculate) {
					return;
				}

				console.log('Calculate value for %s', def.id);
				const res = this.fields[def.id].calculate(data);
				console.log('  Result: %s', res);
			    const displayUnit = get(data, `${ this.meta.slug }.${ def.id }_unit`, def.unit);
			    if (displayUnit !== def.unit) {
			        return convert(res, 1).from(def.unit).to(displayUnit);
			    }
				return res;
			})
			/**
			 *
			 */
			this.fields[def.id].set = (value, data) => {
				let exclusive = [];
				if (this.meta.exclusive) {
					exclusive = Object.keys(this.fields).map((k) => (this.fields[k]));
				} else if (def.exclusive) {
					exclusive = def.exclusive;
				}
				exclusive.forEach((e) => {
					set(data, `${ this.meta.slug }.${ e.id }`, undefined);
				});

				// Set the new value
				set(data, `${ this.meta.slug }.${ def.id }`, value);
				// set(data, `${ slug }.${ field }`, toUnit(data, slug, field, ev.target.value, 1, getDisplayUnit(data, slug, field, unit), unit));
			}

			if (def.calculate) {
				this.fields[def.id].calculate = once(def.calculate.bind(this.fields));
			}
		});
	}
}