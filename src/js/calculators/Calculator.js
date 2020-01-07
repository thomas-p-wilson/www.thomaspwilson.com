import get from 'lodash/get';
import set from 'lodash/set';
import convert, { getMeasureName } from '../converter';
import { getBaseValue, getStoredValue, getDisplayUnit, getDisplayValue, trim, once, name, memoize } from './helpers';

function coalesce(...cbs) {

}

export default class Calculator {
	constructor(meta, definitions) {
		this.meta = meta;
		this.fields = {};
		this._starter = undefined;
		this._cache = {};

		this.getCachedValue = this.getCachedValue.bind(this);
		this.resetCache = this.resetCache.bind(this);

		const _this = this;

		definitions.forEach((def) => {
			_this.fields[def.id] = Object.assign({}, def, {
				parent: _this
			});
			/**
			 * 
			 */
			_this.fields[def.id].get = _this.getCachedValue(def.id, once(name(`get_${ def.id }`, (data) => (
				getBaseValue(data, _this.fields[def.id], _this)
			))));
			/**
			 * Get display value. If the store has an explicit value for the
			 * field, that value is already in the display unit of measure, and
			 * does not need conversion. If the value is calculated, then the
			 * calculated value we receive is in the base unit of the field and
			 * _may_ need to be converted.
			 */
			_this.fields[def.id].display = once(name(`display_${ def.id }`, (data) => {
			 	const result = getDisplayValue(data, _this.fields[def.id], _this);
			 	if (typeof getStoredValue(data, _this.fields[def.id], _this) !== 'undefined') {
			 		return result;
			 	}
			    if (isNaN(result) || typeof result === 'undefined' || result === '') {
			    	return;
			    }
				return trim(result, data._settings);
			}));
			/**
			 *
			 */
			_this.fields[def.id].set = name(`set_${ def.id }`, (value, data) => {
				let exclusive = [];
				if (_this.meta.exclusive) {
					exclusive = Object.keys(_this.fields).map((k) => (_this.fields[k].id));
				} else if (def.exclusive) {
					exclusive = def.exclusive;
				}
				exclusive.forEach((e) => {
					set(data, `${ _this.meta.slug }.${ e }`, undefined);
				});

				// Set the new value
				set(data, `${ _this.meta.slug }.${ def.id }`, value);
				set(data, `${ _this.meta.slug }.${ def.id }_unit`, getDisplayUnit(data, _this.fields[def.id], _this));
			})

			if (def.calculate) {
				_this.fields[def.id].calculate = once(name(`calculate_${ def.id }`, def.calculate.bind(_this.fields)));
			}
		});
	}

	getCachedValue(id, fallback) {
		const _this = this;
		return function(...args) {
			if (typeof _this._cache[id] !== 'undefined') {
				return _this._cache[id];
			}

			return _this._cache[id] = fallback.call(_this.fields, ...args);
		};
	}

	resetCache() {
		this._cache = {};
	}
}