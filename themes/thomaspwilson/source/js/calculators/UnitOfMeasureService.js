export default class UnitOfMeasureService {
    constructor() {
        this.unit_table = {};

        var prefixes = ['Y', 'Z', 'E', 'P', 'T', 'G', 'M', 'k', 'h', 'da', '', 'd', 'c', 'm', 'u', 'n', 'p', 'f', 'a', 'z', 'y'];
        var factors =  [ 24,  21,  18,  15,  12,  9,   6,   3,   2,   1,    0, -1,  -2,  -3,  -6,  -9,  -12, -15, -18, -21, -24];
        // SI units only, that follow the mg/kg/dg/cg type of format
        var units = ['g', 'b', 'l', 'm'];

        var i = units.length;
        while (i--) {
            var base = units[i];
            var j = prefixes.length;
            while (j--) {
                this.addUnit(base, prefixes[j] + base, Math.pow(10, factors[j]));
            }
        }

        // Add defaults
        this.addUnit('g', 'oz', 28.3495231);
        this.addUnit('g', 'lb', 453.59237);

        this.addUnit('m', 'in', 0.0254);
        this.addUnit('m', 'ft', 0.3048);

        this.addUnit('deg', 'rad', 57.296);
        this.addUnit('deg', 'rps', 360);
    }

    addUnit(base, actual, multiplier) {
        this.unit_table[actual] = { base, actual, multiplier };
    }

    convert(value, frm, to, exp) {
        var target = this.unit_table[to];
        var current = this.unit_table[frm];
        if (target.base != current.base) {
            console && console.error('Incompatible units; cannot convert from "' + frm + '" to "' + to + '"');
            throw new Error('Incompatible units; cannot convert from "' + frm + '" to "' + to + '"');
        }

        return value * Math.pow((current.multiplier / target.multiplier), exp || 1);
    }
}