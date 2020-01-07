import React from 'react';
import get from 'lodash/get';
import Decimal from 'decimal.js';
import ContextNumberField from '../components/redone/ContextNumberField';
import ContextSelectField from '../components/redone/ContextSelectField';
import ContextUnitSelector from '../components/redone/ContextUnitSelector';
import UnitSelector from '../components/redone/UnitSelector';
import { getRawValue } from '../utils';
import convert, { getMeasureName } from '../converter';

/**
 * Produce a number field input with label and unit selector.
 *
 * @param {String} field - The identifier of the field.
 * @param {Object} definition - The field definition.
 * @returns {ReactElement[]} - An array of react elements: the label, the input,
 *     and the unit selector.
 */
export const numberField = ({ title, ...definition }, calculator) => ([
	(
        <label forHtml={ definition.id }>{ title }</label>
    ),
    (
        <ContextNumberField definition={ definition } calculator={ calculator } />
    ),
    (
        <ContextUnitSelector definition={ definition } calculator={ calculator } />
    )
])

/**
 *
 */
export const selectField = ({ title, ...definition }, calculator) => ([
    (
        <label forHtml="">{ title }</label>
    ),
    (
        <ContextSelectField definition={ definition } calculator={ calculator } />
    )
])

export const DataContext = React.createContext({});

export const SettingsContext = React.createContext({});

/**
 * Determine the unit used to store the value of a field. This is different from
 * the display unit when all of the following are true:
 *   - The global unit of measure is different than the default unit of the
 *     field
 *   - A display unit has not been explicitly set for the field
 */
export function getStorageUnit(data, field, calculator) {
    return get(data, `${ calculator.meta.slug }.${ field.id }_unit`, field.unit);
}

/**
 * Determine the unit used to display the value of a field.
 */
export function getDisplayUnit(data, field, calculator) {
    return get(data, `${ calculator.meta.slug }.${ field.id }_unit`, field.unit && data._settings[getMeasureName(field.unit)] || field.unit);
}

/**
 * Retrieve the stored value of the field.
 */
export function getStoredValue(data, field, calculator) {
    return get(data, `${ calculator.meta.slug }.${ field.id }`);
}

/**
 * Retrieve the value of the field and return it in the field's default unit of
 * measure.
 */
export function getBaseValue(data, field, calculator) {
    const storageUnit = getStorageUnit(data, field, calculator);
    const result = getStoredValue(data, field, calculator);

    if (typeof result === 'undefined' && field.calculate) {
        return field.calculate(data);
    }
    if (storageUnit !== field.unit) {
        return convert(result, field.exponent || 1, storageUnit, field.unit);
    }
    return result;
}

/**
 * Retrieve the value of the field and return it in the display unit of measure.
 */
export function getDisplayValue(data, field, calculator) {
    const result = getStoredValue(data, field, calculator);
    const storageUnit = getStorageUnit(data, field, calculator);
    const displayUnit = getDisplayUnit(data, field, calculator);
    if (typeof result === 'undefined' && field.calculate) {
        const res = field.calculate(data);
        if (displayUnit !== field.unit && field.unit) {
            return convert(res, field.exponent || 1, field.unit, displayUnit);
        }
        return res;
    }
    if (storageUnit !== displayUnit) {
        return convert(result, field.exponent || 1, storageUnit, displayUnit);
    }
    return result;
}


/**
 * Trim to the given number of significant digits _after_ the decimal place.
 * Rounds using the nearest-even method.
 * Given (value, digits):
 * 887.41533, 4 -> 887.4153
 * 887.41533, 3 -> 887.415
 * 887.41533, 2 -> 887.42
 * 811345.0045015807, 4 -> 811345.004502
 * 811345.0045015807, 3 -> 811345.00450
 * 811345.0045015807, 2 -> 811345.0045
 */
export function trim(value, settings) {
    if (!isNaN(value)) {
        return new Decimal(value).toFixed(settings.scale || 2);
    }
    return value;
}



export function any(fields, fn) {
    return function (data) {
        const results = [].concat(fields).map((field) => (this[field].get(data)));
        if (results.some((r) => (typeof r !== 'undefined' && r !== ''))) {
            return fn(...results);
        }
        return '';
    }
}

export function all(fields, fn) {
    return function(data) {
        const results = [].concat(fields).map((field) => (this[field].get(data)));
        if (results.every((r) => (typeof r !== 'undefined' && r !== ''))) {
            return fn(...results);
        }
        return '';
    }
}

export function first(...fns) {
    return function(...args) {
        const idx = args.findIndex((a) => (typeof a !== 'undefined' && a !== ''));
        return fns[idx](args[idx]);
    }
}


export function once(cb) {
    return function once(data) {
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
    };
}

export function name(name, fn) {
    Object.defineProperty(fn, 'name', { value: name });
    return fn;
}

export function memoize(fn, size=5) {
    const cache = {};
    const keys = [];

    const getFromCache = (key) => {
        if (!cache[key]) {
            return;
        }

        const i = keys.indexOf(key);
        if (i > 0) {
            keys.splice(i, 1);
            keys.unshift(key);
        }
        return cache[key];
    }

    const addToCache = (key, result) => {
        cache[key] = result;
        keys.shift();
        keys.unshift(key);
        return cache[key];
    }

    return function(...args) {
        const key = JSON.stringify(...args);
        const cached = getFromCache(key);
        if (cached) {
            return cached;
        }
        return addToCache(key, fn(...args));
    }
}

export function sq(n) {
    return n * n;
}