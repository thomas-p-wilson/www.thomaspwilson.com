import { describe, expect, it } from "vitest";
import { MAX_PI_DIGITS } from "./pi";
import { minDigitsForTargetError, positionErrorKm } from "./precision";

describe("positionErrorKm", () => {
  it("is zero once pi is exact", () => {
    expect(positionErrorKm(MAX_PI_DIGITS, 1e9)).toBe(0);
  });

  it("scales linearly with distance for a fixed digit count", () => {
    const a = positionErrorKm(5, 1_000_000);
    const b = positionErrorKm(5, 2_000_000);
    expect(b).toBeCloseTo(a * 2, 6);
  });

  it("shrinks as digit count increases for a fixed distance", () => {
    let previous = positionErrorKm(1, 1e9);
    for (let digits = 2; digits <= 15; digits++) {
      const error = positionErrorKm(digits, 1e9);
      expect(error).toBeLessThan(previous);
      previous = error;
    }
  });

  it("matches the known JPL reference point: pi to 15 decimal places over a 25-billion-mile-diameter circle is off by under 1.5 inches", () => {
    // JPL's own worked example (see the NASA/JPL Edu "How many decimals of pi
    // do we really need?" piece): a circle as wide as Voyager 1's orbit
    // (~25 billion miles in diameter) computed with pi truncated to 15
    // decimal places is off by less than 1.5 inches. "15 decimal places" is
    // 16 significant digits in this module's counting (which includes the
    // leading "3"), and positionErrorKm takes a radius, so pass half the
    // 25-billion-mile diameter, converted to km.
    const radiusKm = ((25_000_000_000 * 1.609344) / 2);
    const errorMeters = positionErrorKm(16, radiusKm) * 1000;
    expect(errorMeters).toBeLessThan(1.5 * 0.0254);
  });
});

describe("minDigitsForTargetError", () => {
  it("finds the minimum digits needed to hit a coarse target quickly", () => {
    // At Earth's distance (~1 AU), 3 digits of pi (3.14) already gets well
    // within a million km.
    const digits = minDigitsForTargetError(149_597_870, 1_000_000);
    expect(digits).not.toBeNull();
    expect(digits!).toBeLessThanOrEqual(4);
  });

  it("returns a digit count whose error is under the target, and one fewer digit's error is not", () => {
    const distanceKm = 5_906_380_000; // Pluto
    const targetKm = 1;
    const digits = minDigitsForTargetError(distanceKm, targetKm);
    expect(digits).not.toBeNull();
    expect(positionErrorKm(digits!, distanceKm)).toBeLessThanOrEqual(targetKm);
    if (digits! > 1) {
      expect(positionErrorKm(digits! - 1, distanceKm)).toBeGreaterThan(targetKm);
    }
  });

  it("returns null for a target error that's negative and therefore unreachable", () => {
    expect(minDigitsForTargetError(1e9, -1)).toBeNull();
  });

  it("needs close to the full ~40 digits JPL cites to resolve the observable universe to sub-atomic scale", () => {
    const observableUniverseKm = 46_500_000_000 * 9_460_730_472_580.8;
    const digits = minDigitsForTargetError(observableUniverseKm, 1e-15); // 1 picometer, in km
    expect(digits).not.toBeNull();
    expect(digits!).toBeGreaterThan(35);
    expect(digits!).toBeLessThanOrEqual(45);
  });
});
