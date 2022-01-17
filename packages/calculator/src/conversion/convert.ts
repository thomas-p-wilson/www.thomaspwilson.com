import { Decimal } from '../decimal-config';
import { normalizeValue } from '../utils/number';
import { units } from '../systems/index';


/**
 * Convert the given string or number value from the given unit to the target
 * unit, optionally using an exponent.
 * @param value The value to convert
 * @param from The unit we're converting from
 * @param to The unit we're converting to
 * @param exp The exponent of the number
 * @returns The value of the quantity in the new unit
 */
export const convert = (value: string | number, from: string, to: string, exp: number = 1): Decimal => {
  const origin = units.get(from);
  if (!origin) {
    throw new Error('Unrecognized unit ' + from);
  }

  const target = units.get(to);
  if (!target) {
    throw new Error('Unrecognized unit ' + to);
  }

  // If the origin and target are the same, so is the value
  if (origin === target) {
    return new Decimal(value);
  }

  // if (origin.measure !== target.measure) {
  //   console.log('Origin: ', origin);
  //   console.log('Target: ', target);
  //   throw new Error(`Cannot convert between measures of ${ origin.measure } and ${ target.measure }`);
  // }

  let result = normalizeValue(`${value}`);
  if (exp !== 1) {
    result = result.toPower(new Decimal('1').dividedBy(`${exp}`));
  }
  result = result.times(origin.multiplier);
  // if (origin.transform) {
  //   result = origin.transform(result);
  // } else if (origin.shift) {
  //   result -= origin.shift;
  // }

  // if (target.transform) {
  //   result = target.transform(null, result);
  // } else if (target.shift) {
  //   result += target.shift;
  // }
  result = result.dividedBy(target.multiplier);
  if (exp !== 1) {
    return result.toPower(`${exp}`);
  }
  return result;
}
