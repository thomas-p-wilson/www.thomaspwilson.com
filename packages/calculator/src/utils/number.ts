import { Decimal } from '../decimal-config';

const validNumber = /^\.\d+$|^\d+\.$/

/**
 * Determines if a given string represents an acceptable numeric value for an
 * input field.
 * @param value The value to check for validity
 * @returns True if valid, false otherwise
 */
export const isValidNumber = (value: string): boolean => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false
  }
  const num = Number(value);
  if (!Number.isNaN(num)) {
    return true;
  }
  return validNumber.test(value);
}

/**
 * Given a string, returns a numeric value to use under-the-hood. The strings
 * represented in the inputs may not be fully-formed numbers, so we need a way
 * to get fully-formed numbers from them.
 * @param value The value to normalize
 * @returns A number
 */


export const normalizeValue = (value: string): Decimal => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return new Decimal(0);
  }
  const num = Number(value);
  if (!Number.isNaN(num)) {
    return new Decimal(num);
  }
  return new Decimal(0);
}
