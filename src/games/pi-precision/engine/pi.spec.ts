import { describe, expect, it } from "vitest";
import { MAX_PI_DIGITS, piDigitsString, piTruncationError, piValue } from "./pi";

describe("piDigitsString", () => {
  it("returns just the leading digit for 1 digit", () => {
    expect(piDigitsString(1)).toBe("3");
  });

  it("truncates (does not round) at the requested digit count", () => {
    expect(piDigitsString(4)).toBe("3.141");
    expect(piDigitsString(6)).toBe("3.14159");
  });

  it("clamps below 1 and above MAX_PI_DIGITS", () => {
    expect(piDigitsString(0)).toBe(piDigitsString(1));
    expect(piDigitsString(-5)).toBe(piDigitsString(1));
    expect(piDigitsString(MAX_PI_DIGITS + 10)).toBe(piDigitsString(MAX_PI_DIGITS));
  });
});

describe("piValue", () => {
  it("matches Math.PI to within its own truncation error for digit counts within double precision", () => {
    expect(piValue(15)).toBeCloseTo(Math.PI, 13);
  });
});

describe("piTruncationError", () => {
  it("shrinks monotonically as digits increase", () => {
    let previous = piTruncationError(1);
    for (let digits = 2; digits <= 20; digits++) {
      const error = piTruncationError(digits);
      expect(error).toBeLessThan(previous);
      previous = error;
    }
  });

  it("is exactly zero at MAX_PI_DIGITS", () => {
    expect(piTruncationError(MAX_PI_DIGITS)).toBe(0);
  });

  it("is on the order of 10^-2 for 3 digits (3.14 vs pi)", () => {
    const error = piTruncationError(3);
    expect(error).toBeGreaterThan(0.001);
    expect(error).toBeLessThan(0.01);
  });
});
