import { describe, expect, it } from "vitest";
import {
  baselineTemperature, DEFAULT_ORBITAL_CONFIG, DEFAULT_STELLAR_CONFIG, orbitalDistanceAu, orbitalPeriodTicks,
  peakWavelengthNm,
} from "./astrophysics";
import type { OrbitalConfig } from "./types";

describe("baselineTemperature", () => {
  it("lands at the sim's historical default (0.5) for a Sun-like star at 1 AU with Earth's real albedo", () => {
    // Calibration check, not a coincidence — see astrophysics.ts's
    // TEMPERATURE_K_FLOOR/CEIL doc comment: this exact combination computes
    // to Earth's real ~255K airless equilibrium temperature.
    const value = baselineTemperature(DEFAULT_STELLAR_CONFIG, DEFAULT_ORBITAL_CONFIG, 0);
    expect(value).toBeCloseTo(0.5, 1);
  });

  it("stays constant tick to tick on a circular orbit (eccentricity 0)", () => {
    const a = baselineTemperature(DEFAULT_STELLAR_CONFIG, DEFAULT_ORBITAL_CONFIG, 0);
    const b = baselineTemperature(DEFAULT_STELLAR_CONFIG, DEFAULT_ORBITAL_CONFIG, 500);
    expect(a).toBeCloseTo(b, 6);
  });

  it("swings hotter and colder over the year on an eccentric orbit", () => {
    const orbital: OrbitalConfig = { ...DEFAULT_ORBITAL_CONFIG, eccentricity: 0.4 };
    const period = orbitalPeriodTicks(DEFAULT_STELLAR_CONFIG, orbital);
    const periapsis = baselineTemperature(DEFAULT_STELLAR_CONFIG, orbital, 0); // mean anomaly 0 == periapsis
    const apoapsis = baselineTemperature(DEFAULT_STELLAR_CONFIG, orbital, Math.round(period / 2));
    expect(periapsis).toBeGreaterThan(apoapsis);
    expect(periapsis - apoapsis).toBeGreaterThan(0.1);
  });

  it("is hotter closer to the star, all else equal", () => {
    const near = baselineTemperature(DEFAULT_STELLAR_CONFIG, { ...DEFAULT_ORBITAL_CONFIG, semiMajorAxisAu: 0.5 }, 0);
    const far = baselineTemperature(DEFAULT_STELLAR_CONFIG, { ...DEFAULT_ORBITAL_CONFIG, semiMajorAxisAu: 2 }, 0);
    expect(near).toBeGreaterThan(far);
  });

  it("is colder at higher albedo, all else equal", () => {
    const lowAlbedo = baselineTemperature(DEFAULT_STELLAR_CONFIG, { ...DEFAULT_ORBITAL_CONFIG, albedo: 0.1 }, 0);
    const highAlbedo = baselineTemperature(DEFAULT_STELLAR_CONFIG, { ...DEFAULT_ORBITAL_CONFIG, albedo: 0.8 }, 0);
    expect(lowAlbedo).toBeGreaterThan(highAlbedo);
  });

  it("orders spectral classes cool-to-hot at a fixed distance (M < K < G < F < A)", () => {
    const temps = (["M", "K", "G", "F", "A"] as const).map((spectralClass) =>
      baselineTemperature({ spectralClass }, DEFAULT_ORBITAL_CONFIG, 0),
    );
    for (let i = 1; i < temps.length; i++) expect(temps[i]).toBeGreaterThan(temps[i - 1]);
  });

  it("clamps to [0, 1] even for extreme combinations", () => {
    const scorching = baselineTemperature({ spectralClass: "A" }, { ...DEFAULT_ORBITAL_CONFIG, semiMajorAxisAu: 0.3 }, 0);
    const frozen = baselineTemperature({ spectralClass: "M" }, { ...DEFAULT_ORBITAL_CONFIG, semiMajorAxisAu: 3 }, 0);
    expect(scorching).toBe(1);
    expect(frozen).toBe(0);
  });
});

describe("orbitalDistanceAu", () => {
  it("stays at the semi-major axis for a circular orbit", () => {
    expect(orbitalDistanceAu(DEFAULT_STELLAR_CONFIG, DEFAULT_ORBITAL_CONFIG, 777)).toBeCloseTo(1, 6);
  });

  it("swings between periapsis and apoapsis for an eccentric orbit", () => {
    const orbital: OrbitalConfig = { semiMajorAxisAu: 1, eccentricity: 0.3, albedo: 0.3 };
    const period = orbitalPeriodTicks(DEFAULT_STELLAR_CONFIG, orbital);
    expect(orbitalDistanceAu(DEFAULT_STELLAR_CONFIG, orbital, 0)).toBeCloseTo(0.7, 5); // a(1-e)
    expect(orbitalDistanceAu(DEFAULT_STELLAR_CONFIG, orbital, Math.round(period / 2))).toBeCloseTo(1.3, 5); // a(1+e)
  });
});

describe("orbitalPeriodTicks", () => {
  it("is shorter for a closer orbit (Kepler's third law)", () => {
    const near = orbitalPeriodTicks(DEFAULT_STELLAR_CONFIG, { ...DEFAULT_ORBITAL_CONFIG, semiMajorAxisAu: 0.5 });
    const far = orbitalPeriodTicks(DEFAULT_STELLAR_CONFIG, { ...DEFAULT_ORBITAL_CONFIG, semiMajorAxisAu: 2 });
    expect(near).toBeLessThan(far);
  });

  it("is longer around a less massive star, same distance", () => {
    const aroundG = orbitalPeriodTicks({ spectralClass: "G" }, DEFAULT_ORBITAL_CONFIG);
    const aroundM = orbitalPeriodTicks({ spectralClass: "M" }, DEFAULT_ORBITAL_CONFIG);
    expect(aroundM).toBeGreaterThan(aroundG);
  });
});

describe("peakWavelengthNm", () => {
  it("is shorter (bluer) for hotter spectral classes", () => {
    expect(peakWavelengthNm("A")).toBeLessThan(peakWavelengthNm("G"));
    expect(peakWavelengthNm("G")).toBeLessThan(peakWavelengthNm("M"));
  });
});
