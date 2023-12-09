import { Decimal } from '@/types/Decimal';
import { Measure } from '@/units/Measure';
import { decimal } from './decimal';

export const convert = <M extends Measure>(measure: M, value: Decimal, exponent: Decimal, from: keyof M, to: keyof M) => {
  if (from === to) {
    return value;
  }

  const fromObj = measure[from];
  if (!fromObj) {
    throw new Error(`Unrecognized unit: ${String(from)}`);
  }
  const toObj = measure[to];
  if (!toObj) {
    throw new Error(`Unrecognized unit: ${String(to)}`);
  }

  let result = value;
  if (exponent.toNumber() !== 1) {
    result = result.pow(decimal('1').div(exponent));
  }
  result = result.times(fromObj.multiplier || 1);
  if (fromObj.toReference) {
    result = fromObj.toReference(result);
  } else if (fromObj.shift) {
    result = result.sub(fromObj.shift);
  }

  if (toObj.fromReference) {
    result = toObj.fromReference(result);
  } else if (toObj.shift) {
    result = result.add(toObj.shift);
  }
  result = result.div(toObj.multiplier || 1);
  if (exponent.toNumber() !== 1) {
    return result.pow(exponent);
  }
  return result;
}
