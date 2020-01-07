import { Decimal } from 'decimal.js';
import * as angle from './measures/angle';
import * as energy from './measures/energy';
import * as frequency from './measures/frequency';
import * as length from './measures/length';
import * as mass from './measures/mass';
import * as power from './measures/power';
import * as pressure from './measures/pressure';
import * as temperature from './measures/temperature';
import * as time from './measures/time';
import * as volume from './measures/volume';

/**
 * measures
 *   - system
 *       - name
 *       - description
 *       - units
 *           - singular
 *           - plural
 *           - multiplier
 */
export const measures = {
    angle,
    energy,
    frequency,
    length,
    mass,
    power,
    pressure,
    temperature,
    time,
    volume
}

// Merge all units for easy searching
export const units = Object.keys(measures)
    .reduce((acc, type) => {
        const measure = measures[type];
        Object.keys(measure).forEach((system) => {
            Object.keys(measure[system].units).forEach((name) => {
                const id = `${ type}-${ system }-${ name }`;
                if (acc[id]) {
                    throw new Error(`Unit with id ${ id } already exists. Existing definition: ${ acc[id] }. New definition: ${ measure[system].units[name] }`);
                }
                acc[id] = measure[system].units[name];
                measure[system].units[name].id = id;
                measure[system].units[name].measure = type;
                measure[system].units[name].system = system;
            })
        })
        return acc;
    }, {});

// Get measure name from symbol
export const getMeasureName = (symbol) => {
    if (!units[symbol]) {
        throw new Error('Unrecognized symbol ' + symbol);
    }

    const unit = units[symbol];
    if (!unit.measure) {
        throw new Error('Misconfigured unit ' + symbol);
    }
    if (!measures[unit.measure.toLowerCase()]) {
        throw new Error('Unrecognized measure ' + unit.measure.toLowerCase());
    }
    return unit.measure.toLowerCase();
}

// Get a measure by the given symbol
export const getMeasure = (symbol) => {
    return measures[getMeasureName(symbol)];
}

export default function convert(value, exponent, origin, target) {
    // If the origin and target are the same, so is the value
    if (origin === target) {
        return value;
    }

    // Validate measures
    const originUnit = units[origin];
    if (!originUnit) {
        throw new Error(`Cannot convert from '${ origin }' to '${ target }'. Unrecognized origin.`);
    }

    const targetUnit = units[target];
    if (!targetUnit) {
        throw new Error(`Cannot convert from '${ origin }' to '${ target }'. Unrecognized target.`);
    }

    if (originUnit.measure != targetUnit.measure) {
        throw new Error(`Cannot convert from '${ origin }' to '${ target }'. Different measures.`);
    }

    // Convert
    let result = new Decimal(value || 0);
    if (exponent !== 1) {
        result = result.toPower(new Decimal(1).dividedBy(exponent));
    }
    result = result.times(new Decimal(originUnit.multiplier || 1));
    if (originUnit.transform) {
        result = originUnit.transform(result);
    } else if (originUnit.shift) {
        result = result.sub(originUnit.shift);
    }

    if (targetUnit.transform) {
        result = targetUnit.transform(null, result);
    } else if (targetUnit.shift) {
        result = result.add(targetUnit.shift);
    }
    result = result.dividedBy(targetUnit.multiplier || 1);
    if (exponent !== 1) {
        return result.toPower(exponent);
    }
    return result;
}
