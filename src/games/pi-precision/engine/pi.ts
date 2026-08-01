import Decimal from "decimal.js";

// 50 decimal digits of pi — far more than enough to illustrate truncation
// error at any distance in the observable universe, since ~40 digits already
// gives sub-atomic precision at that scale.
const PI_STRING = "3.14159265358979323846264338327950288419716939937510";

Decimal.set({ precision: 60 });
const PI_EXACT = new Decimal(PI_STRING);

/** Total significant digits available in PI_STRING, including the leading "3". */
export const MAX_PI_DIGITS = PI_STRING.replace(".", "").length;

/**
 * Pi truncated (not rounded) to `digits` significant digits, counting the
 * leading "3" as the first digit — so piDigitsString(1) is "3" and
 * piDigitsString(4) is "3.142"... no: truncation, so piDigitsString(4) is "3.141".
 */
export function piDigitsString(digits: number): string {
  const clamped = Math.max(1, Math.min(Math.floor(digits), MAX_PI_DIGITS));
  return clamped === 1 ? "3" : PI_STRING.slice(0, clamped + 1);
}

export function piDecimal(digits: number): Decimal {
  return new Decimal(piDigitsString(digits));
}

export function piValue(digits: number): number {
  return piDecimal(digits).toNumber();
}

/** Absolute error between true pi and pi truncated to `digits` significant digits. */
export function piTruncationError(digits: number): number {
  return PI_EXACT.minus(piDecimal(digits)).abs().toNumber();
}
