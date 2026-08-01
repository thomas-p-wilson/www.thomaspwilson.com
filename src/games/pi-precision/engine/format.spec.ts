import { describe, expect, it } from "vitest";
import { formatLengthKm, scaleComparison } from "./format";

describe("formatLengthKm", () => {
  it("formats zero", () => {
    expect(formatLengthKm(0)).toBe("0 m");
  });

  it("picks a sensible SI prefix across a wide dynamic range", () => {
    expect(formatLengthKm(1)).toBe("1 km");
    expect(formatLengthKm(1000)).toBe("1 Mm");
    expect(formatLengthKm(1e-6)).toBe("1 mm");
    expect(formatLengthKm(1e-12)).toBe("1 nm");
  });

  it("rounds to a small number of significant figures", () => {
    expect(formatLengthKm(1.23456)).toMatch(/^1\.23 km$/);
  });
});

describe("scaleComparison", () => {
  it("returns an atom-scale comparison for picometer-scale lengths", () => {
    expect(scaleComparison(1e-13)).toMatch(/atom/);
  });

  it("returns a solar-system-scale comparison for AU-scale lengths", () => {
    expect(scaleComparison(1.5e8)).toMatch(/Sun|solar system/);
  });

  it("falls back gracefully beyond the largest reference", () => {
    expect(scaleComparison(1e30)).toBe("larger than the Milky Way");
  });
});
