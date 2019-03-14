import * as angle from './definitions/angle';
import * as energy from './definitions/energy';
import * as frequency from './definitions/frequency';
import * as length from './definitions/length';
import * as mass from './definitions/mass';
import * as power from './definitions/power';
import * as pressure from './definitions/pressure';
import * as temperature from './definitions/temperature';
import * as time from './definitions/time';
import * as volume from './definitions/volume';

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

        let result = this.value;
        if (this.exponent !== 1) {
            result = Math.pow(result, 1 / this.exponent);
        }
        result = result * (this.origin.multiplier || 1);
        if (this.origin.transform) {
            result = this.origin.transform(result);
        } else if (this.origin.shift) {
            result -= this.origin.shift;
        }

        if (this.target.transform) {
            result = this.target.transform(null, result);
        } else if (this.target.shift) {
            result += this.target.shift;
        }
        result = result / (this.target.multiplier || 1);
        if (this.exponent !== 1) {
            return Math.pow(result, this.exponent);
        }
        return result;

        // /**
        // * Convert from the source value to its anchor inside the system
        // */
        // result = this.val * this.origin.unit.to_anchor;

        // /**
        // * For some changes it's a simple shift (C to K)
        // * So we'll add it when convering into the unit (later)
        // * and subtract it when converting from the unit
        // */
        // if (this.origin.unit.anchor_shift) {
        // result -= this.origin.unit.anchor_shift
        // }

        // *
        // * Convert from one system to another through the anchor ratio. Some conversions
        // * aren't ratio based or require more than a simple shift. We can provide a custom
        // * transform here to provide the direct result
        
        // if(this.origin.system != this.target.system) {
        // transform = measures[this.origin.measure]._anchors[this.origin.system].transform;
        // if (typeof transform === 'function') {
        // result = transform(result)
        // }
        // else {
        // result *= measures[this.origin.measure]._anchors[this.origin.system].ratio;
        // }
        // }

        // /**
        // * This shift has to be done after the system conversion business
        // */
        // if (this.target.unit.anchor_shift) {
        // result += this.target.unit.anchor_shift;
        // }

        // /**
        // * Convert to another unit inside the target system
        // */
        // return result / this.target.unit.to_anchor;
    }
}

export default function convert(value, exponent) {
    return new Converter(value, exponent);
}
