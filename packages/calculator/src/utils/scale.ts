import { Decimal } from '../decimal-config';
import { Measure } from '../conversion/System';

export type Scale = { [k: string]: readonly [string, string] };

const scaleData: Scale = {
  G: ['9', 'Giga'],
  M: ['6', 'Mega'],
  k: ['3', 'Kilo'],
  '': ['0', ''],
  c: ['-2', 'Centi'],
  m: ['-3', 'Milli'],
  u: ['-6', 'Micro'],
  n: ['-9', 'Nano'],
  p: ['-12', 'Pico'],
  f: ['-15', 'Femto']
} as const;

const prefixes = ['G', 'M', 'k', '', 'c', 'm', 'u', 'n', 'p', 'f'];

/**
 * Generate a measurement scale, typically for SI units or similar, where the
 * units are prefixed with letter prefixes and the values of each unit are a
 * multiple of some base unit.
 * @param symbol The unit symbol
 * @param singular The singular name of the unit
 * @param plural The plural name of the unit
 * @param prefixes The set of prefixes to apply when building the scale
 * @returns A `Measure`
 */
export const generateScale = (symbol: string, singular: string, plural: string, use: string[] = prefixes): Measure => {
  const _use = [ ...use, '' ];
  return Object.keys(scaleData)
    .filter((prefix) => (_use.indexOf(prefix) !== -1))
    .reduce((map, prefix: string) => (
      map.set((scaleData[prefix][1] + singular).toLowerCase(), {
        symbol: prefix + symbol,
        base: prefix === '',
        singular: scaleData[prefix][1] + singular.toLowerCase(),
        plural: scaleData[prefix][1] + plural.toLowerCase(),
        multiplier: new Decimal('10').toPower(scaleData[prefix][0])
      })
    ), new Map())
}
