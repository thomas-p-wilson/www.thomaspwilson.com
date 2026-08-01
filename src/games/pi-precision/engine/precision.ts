import { MAX_PI_DIGITS, piTruncationError } from "./pi";

/**
 * Worst-case positional error introduced by using pi truncated to `digits`
 * significant digits when computing where a body sits along its orbit.
 *
 * A body's position along its orbit is found from an angle like
 * theta = 2*pi*f (f = fraction of the orbit completed since some reference
 * point). Treating the orbit as circular, that angle's sensitivity to pi is
 * d(theta)/d(pi) = 2f, maximized at f -> 1 (a full trip around). So the
 * worst-case arc-length error at radius r is r * 2 * (error in pi) — the same
 * relationship JPL uses for circumference (C = pi*d): the error in a full
 * loop around a circle of radius r scales with its diameter, not its radius.
 */
export function positionErrorKm(digits: number, distanceKm: number): number {
  return 2 * distanceKm * piTruncationError(digits);
}

/**
 * Smallest digit count (of significant digits of pi, 1..MAX_PI_DIGITS) whose
 * resulting position error at `distanceKm` is at or under `targetErrorKm`.
 * Returns null if even the maximum supported precision isn't enough.
 */
export function minDigitsForTargetError(distanceKm: number, targetErrorKm: number): number | null {
  for (let digits = 1; digits <= MAX_PI_DIGITS; digits++) {
    if (positionErrorKm(digits, distanceKm) <= targetErrorKm) {
      return digits;
    }
  }
  return null;
}
