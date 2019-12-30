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

// Get a measure by the given symbol
export const getMeasure = (symbol) => {
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

    return measures[unit.measure.toLowerCase()];
}

export class Converter {
    constructor(value, exponent = 1) {
        this.value = value;
        this.exponent = exponent;

        this.from = this.from.bind(this);
        this.to = this.to.bind(this);
    }

    from(symbol) {
        if (this.target) {
            throw new Error('.from must be called before .to');
        }

        this.origin = units[symbol];
        if (!this.origin) {
            throw new Error('Unrecognized measure ' + symbol);
        }

        return this;
    }

    to(symbol) {
        if (!this.origin) {
            throw new Error('.to must be called after .from');
        }

        this.target = units[symbol];
        if (!this.target) {
            throw new Error(`Unrecognized symbol: ${ symbol }`);
        }

        // If the origin and target are the same, so is the value
        if (this.origin.symbol === this.target.symbol) {
            return this.value;
        }

        if (this.origin.measure != this.target.measure) {
            console.log('Origin: ', this.origin);
            console.log('Target: ', this.target);
            throw new Error(`Cannot convert between measures of ${ this.origin.measure } and ${ this.target.measure }`);
        }

        let result = new Decimal(this.value || 0);
        if (this.exponent !== 1) {
            result = result.toPower(new Decimal(1).dividedBy(this.exponent));
        }
        result = result.times(new Decimal(this.origin.multiplier || 1));
        if (this.origin.transform) {
            result = this.origin.transform(result);

        } else if (this.origin.shift) {
            result = result.subtract(this.origin.shift);
        }

        if (this.target.transform) {
            result = this.target.transform(null, result);
        } else if (this.target.shift) {
            result = result.add(this.target.shift);
        }
        result = result.dividedBy(this.target.multiplier || 1);
        if (this.exponent !== 1) {
            return result.toPower(this.exponent);
        }
        return result;
    }
}

export default function convert(value, exponent) {
    return new Converter(value, exponent);
}
