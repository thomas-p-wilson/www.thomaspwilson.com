import { Decimal } from '../decimal-config';
import { generateScale } from './scale';

describe('Utilities', () => {
  describe('generateScale', () => {
    it('works', () => {
      expect(generateScale('m', 'Metre', 'Metres')).toEqual(new Map(Object.entries({
        "gigametre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(9),
          "plural": "Gigametres",
          "singular": "Gigametre",
          "symbol": "Gm"
        },
        "megametre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(6),
          "plural": "Megametres",
          "singular": "Megametre",
          "symbol": "Mm"
        },
        "kilometre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(3),
          "plural": "Kilometres",
          "singular": "Kilometre",
          "symbol": "km",
        },
        "metre": {
          "base": true,
          "multiplier": new Decimal('10').toPower(0),
          "plural": "metres",
          "singular": "metre",
          "symbol": "m",
        },
        "centimetre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(-2),
          "plural": "Centimetres",
          "singular": "Centimetre",
          "symbol": "cm",
        },
        "millimetre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(-3),
          "plural": "Millimetres",
          "singular": "Millimetre",
          "symbol": "mm",
        },
        "micrometre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(-6),
          "plural": "Micrometres",
          "singular": "Micrometre",
          "symbol": "um",
        },
        "nanometre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(-9),
          "plural": "Nanometres",
          "singular": "Nanometre",
          "symbol": "nm",
        },
        "picometre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(-12),
          "plural": "Picometres",
          "singular": "Picometre",
          "symbol": "pm",
        },
        "femtometre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(-15),
          "plural": "Femtometres",
          "singular": "Femtometre",
          "symbol": "fm",
        }
      })));
    });
    it('can filter', () => {
      expect(generateScale('m', 'Metre', 'Metres', ['G'])).toEqual(new Map(Object.entries({
        "gigametre": {
          "base": false,
          "multiplier": new Decimal('10').toPower(9),
          "plural": "Gigametres",
          "singular": "Gigametre",
          "symbol": "Gm"
        },
        "metre": { // Always includes the base unit
          "base": true,
          "multiplier": new Decimal('10').toPower(0),
          "plural": "metres",
          "singular": "metre",
          "symbol": "m",
        },
      })));
    })
  });
});
