export const constants = {
	G: {
		symbol: 'G',
		title: 'Gravity',
		value: 9.80665 // m/s^2
	}
};
export const unit_table = {
	// Every unit definition looks like this:
	// oz: { <- The unit identifier (must be unique)
	// 	base: 'g', <- The unit identifier of the base to which this unit may be
	//                converted. If absent, the unit is the base
	// 	symbol: 'oz', <- The unit identifier (same as the map key)
	// 	title: 'Ounce', <- The human-readable title of the unit
	// 	multiplier: 28.3495231 <- The multiplier for determining the base unit
	//                            value
	// }
};
export const categories = {
	// SI Units
	length: {
		title: 'Length',
		units: {}
	},
	mass: {
		title: 'Mass',
		units: {}
	},
	time: {
		title: 'Time',
		units: {}
	},
	current: {
		title: 'Electric Current',
		units: {}
	},
	temperature: {
		title: 'Temperature',
		units: {}
	},
	quantity: {
		title: 'Quantity',
		units: {}
	},
	brightness: {
		title: 'Luminous Intensity',
		units: {}
	},

	// SI-based units
	angle: {
		title: 'Angle',
		units: {}
	},

	// Other units
	frequency: {
		title: 'Frequency',
		units: {}
	}
}

export const scale = {
	prefixes: ['Y', 'Z', 'E', 'P', 'T', 'G', 'M', 'k', 'h', 'da', '', 'd', 'c', 'm', 'u', 'n', 'p', 'f', 'a', 'z', 'y'],
    factors: [ 24,  21,  18,  15,  12,  9,   6,   3,   2,   1,    0, -1,  -2,  -3,  -6,  -9,  -12, -15, -18, -21, -24],
    titles: ['Yotta', 'Zetta', 'Exa', 'Peta', 'Tera', 'Giga', 'Mega', 'Kilo', 'Hecta', 'Deca', '', 'Deci', 'Centi', 'Milli', 'Micro', 'Nano', 'Pico', 'Femto', 'Atto', 'Zepto', 'Yocto']
}

export function addUnit(symbol, base, multiplier, title, category, siscale = false) {
	if (!categories[category]) {
		throw new Error('No such category ' + category);
	}
	if (!siscale) {
		categories[category].units[symbol] = unit_table[symbol] = { base, symbol, multiplier, title };
		return;
	}

    let i = scale.prefixes.length;
    while (i--) {
        addUnit(scale.prefixes[i] + symbol, base, Math.pow(10, scale.factors[i]), scale.titles[i] + title, category);
    }
}

/**
 * Convert from one unit of measure to another.
 * @param Number value - The numeric value to convert to another measure
 * @param String frm - The symbol of the current unit of measure
 * @param String to - The symbol of the target unit of measure
 * @param String [exp] - The exponent of the given value. For example, when
 *     converting from 5cm^3 to metres^3, the value of `exp` is 3
 * @returns Number The equivalent value in the target unit of measure
 */
export function convert(value, frm, to, exp) {
    let target = unit_table[to];
    if (!target) {
    	throw new Error('No such unit ' + to);
    }

    let current = unit_table[frm];
    if (!current) {
    	throw new Error('No such unit ' + frm)
    }

    if (target.base != current.base) {
        throw new Error('Incompatible units; cannot convert from "' + frm + '" to "' + to + '"');
    }

    if (target.symbol == current.symbol) {
    	return value;
    }
    return value * Math.pow((current.multiplier / target.multiplier), exp || 1);
}

//
// SI-base units
//

// Measurements of length. The base unit of measure is the metre.
addUnit('m', 'm', 1, 'Metre', 'length', true);
addUnit('in', 'm', 0.0254, 'Inch', 'length');
addUnit('ft', 'm', 0.3048, 'Foot', 'length');

// Measurements of mass. The base unit of measure is the gram.
addUnit('g', 'g', 1, 'Gram', 'mass', true);
addUnit('oz', 'g', 28.3495231, 'Ounce', 'mass');
addUnit('lb', 'g', 453.59237, 'Pound', 'mass');

// Measurements of time. The base unit of measure is the second.
addUnit('s', 's', 1, 'Second', 'time', true);

// Measurements of electric current. The base unit is the ampere.
addUnit('A', 'A', 1, 'Ampere', 'current', true);

// Measurements of temperature. The base unit is the Kelvin.
addUnit('K', 'K', 1, 'Kelvin', 'temperature', true);

// Measurements of the amount of substance. The base unit is the mole.
addUnit('mol', 'mol', 1, 'Mole', 'quantity', true);

// Measurements of luminous intensity. The base unit is the candela.
addUnit('cd', 'cd', 1, 'Candela', 'brightness', true);

//
// Non-SI base units
//

// Measurement of plane angle. The base unit is the radian.
addUnit('rad', 'rad', 1, 'Radian', 'angle');
addUnit('deg', 'rad', 57.2958, 'Degree', 'angle');

//
// Derived units
//
addUnit('Hz', 'Hz', 1, 'Hertz', 'frequency', true);

console.log('Measurements: ', unit_table);