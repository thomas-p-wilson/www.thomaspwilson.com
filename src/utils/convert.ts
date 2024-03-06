import { Decimal } from '@/types/Decimal';
import { Measure } from '@/units/Measure';
import { decimal } from './decimal';

export const convert = <M extends Measure>(measure: M, value: Decimal, exponent: Decimal, from: keyof M, to: keyof M, dimension?: boolean) => {
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

  let multiplier = fromObj.multiplier?.div(toObj.multiplier!);
  if (dimension) {
    multiplier = decimal(1).div(multiplier)
  }
  result = result.times(multiplier!);
  if (exponent.toNumber() !== 1) {
    result = result.pow(exponent);
  }
  return result;
}
