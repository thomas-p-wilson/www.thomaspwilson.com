// Derives a planet's baseline temperature from real orbital mechanics
// (star type, distance, eccentricity, albedo) instead of it being a flat,
// directly-set scalar — see todos/planetary-astrophysical-mechanics.md. This
// module is pure math with no simulation state of its own: engine/simulation.ts
// calls into it once per tick (when a SimulationState carries an AstroConfig)
// to recompute `environment.temperature`.
import type { OrbitalConfig, SpectralClass, StellarConfig } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface StarProfile {
  label: string;
  temperatureK: number;
  radiusSolar: number;
  massSolar: number;
  /** Approximate visible color, for a star swatch/light tint in the UI. */
  color: string;
}

/** One representative point per spectral class (typical main-sequence
 * dwarf), not a continuous model — plenty of range for a toy planetary sim,
 * from a cool, dim red dwarf up to a hot, luminous blue-white star. */
export const STAR_TABLE: Record<SpectralClass, StarProfile> = {
  M: { label: "M dwarf — red", temperatureK: 3500, radiusSolar: 0.4, massSolar: 0.3, color: "#ff9d5c" },
  K: { label: "K dwarf — orange", temperatureK: 4800, radiusSolar: 0.7, massSolar: 0.7, color: "#ffc78a" },
  G: { label: "G star — yellow (Sun-like)", temperatureK: 5778, radiusSolar: 1.0, massSolar: 1.0, color: "#fff2dc" },
  F: { label: "F star — white", temperatureK: 6500, radiusSolar: 1.3, massSolar: 1.3, color: "#f4f3ff" },
  A: { label: "A star — blue-white", temperatureK: 8500, radiusSolar: 1.7, massSolar: 1.8, color: "#cadaff" },
};

export const DEFAULT_STELLAR_CONFIG: StellarConfig = { spectralClass: "G" };
export const DEFAULT_ORBITAL_CONFIG: OrbitalConfig = { semiMajorAxisAu: 1, eccentricity: 0, albedo: 0.3 };

const AU_PER_SOLAR_RADIUS = 1 / 215.032;
const WIEN_DISPLACEMENT_NM_K = 2_897_771;
const STEFAN_BOLTZMANN_W_M2_K4 = 5.670374e-8;

/**
 * Calibration pinning the normalized [0,1] scale `environment.temperature`
 * uses everywhere else in the sim to real equilibrium temperatures in
 * Kelvin: 150K (permanently frozen) maps to 0, 360K (Venus-hot) maps to 1.
 * Not an arbitrary pair — a Sun-like G star at 1 AU with Earth's real Bond
 * albedo (0.3) computes to ~255K via equilibriumTemperatureK below (Earth's
 * actual airless equilibrium temperature), which lands at exactly 0.5 under
 * this calibration: (255 - 150) / (360 - 150) = 0.5, the sim's historical
 * default baseline.
 */
const TEMPERATURE_K_FLOOR = 150;
const TEMPERATURE_K_CEIL = 360;

/** Ticks per Earth year at 1 AU around a 1-solar-mass star — the scale
 * factor real orbital periods (via Kepler's third law, see
 * orbitalPeriodTicks) are converted into game ticks through. Chosen so an
 * eccentric orbit's hot/cold swing completes a few times over a normal play
 * session rather than taking all of it, or finishing in seconds. */
const TICKS_PER_EARTH_YEAR = 3000;

/**
 * Orbital period in ticks, via Kepler's third law (P^2 = a^3 / M in
 * solar-mass/AU/year units) — a closer or lighter-starred orbit completes
 * faster, exactly like a real solar system, rather than every planet sharing
 * one fixed year length regardless of its own orbit.
 */
export function orbitalPeriodTicks(stellar: StellarConfig, orbital: OrbitalConfig): number {
  const massSolar = STAR_TABLE[stellar.spectralClass].massSolar;
  const periodYears = Math.sqrt(orbital.semiMajorAxisAu ** 3 / massSolar);
  return Math.max(1, periodYears * TICKS_PER_EARTH_YEAR);
}

/**
 * Eccentric anomaly solved from Kepler's equation (M = E - e*sin(E)) via
 * Newton-Raphson — converges to float precision in a handful of iterations
 * even at the higher end of eccentricities this sim allows.
 */
function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  let e = meanAnomaly;
  for (let i = 0; i < 8; i++) {
    e -= (e - eccentricity * Math.sin(e) - meanAnomaly) / (1 - eccentricity * Math.cos(e));
  }
  return e;
}

/**
 * This planet's actual distance from its star right now, in AU — constant
 * (== semiMajorAxisAu) for a circular orbit; otherwise swinging between
 * periapsis and apoapsis once per orbitalPeriodTicks, including moving
 * fastest near periapsis (Kepler's second law) rather than a naive sinusoid.
 */
export function orbitalDistanceAu(stellar: StellarConfig, orbital: OrbitalConfig, tick: number): number {
  const period = orbitalPeriodTicks(stellar, orbital);
  const meanAnomaly = (2 * Math.PI * (tick % period)) / period;
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, orbital.eccentricity);
  return orbital.semiMajorAxisAu * (1 - orbital.eccentricity * Math.cos(eccentricAnomaly));
}

/**
 * Planetary equilibrium temperature in Kelvin from incident stellar flux and
 * albedo — the standard astrophysical formula, T_star * sqrt(R_star / 2d) *
 * (1-albedo)^0.25, evaluated at this instant's actual orbital distance
 * rather than the fixed semi-major axis, so an eccentric orbit's distance
 * swing becomes a real temperature swing over the year.
 */
export function equilibriumTemperatureK(stellar: StellarConfig, orbital: OrbitalConfig, tick: number): number {
  const profile = STAR_TABLE[stellar.spectralClass];
  const distanceAu = orbitalDistanceAu(stellar, orbital, tick);
  const radiusAu = profile.radiusSolar * AU_PER_SOLAR_RADIUS;
  return profile.temperatureK * Math.sqrt(radiusAu / (2 * distanceAu)) * (1 - orbital.albedo) ** 0.25;
}

/** The world's baseline temperature, normalized to the [0,1] scale the rest
 * of the sim's `EnvironmentConfig.temperature` expects — see
 * TEMPERATURE_K_FLOOR/CEIL's calibration note above. */
export function baselineTemperature(stellar: StellarConfig, orbital: OrbitalConfig, tick: number): number {
  const kelvin = equilibriumTemperatureK(stellar, orbital, tick);
  return clamp01((kelvin - TEMPERATURE_K_FLOOR) / (TEMPERATURE_K_CEIL - TEMPERATURE_K_FLOOR));
}

/**
 * Instantaneous incident stellar flux (irradiance) at the top of the
 * planet's atmosphere, in W/m^2 — the real physical "solar constant" this
 * star and current orbital distance produce (Stefan-Boltzmann surface flux,
 * sigma * T^4, diluted by the inverse-square geometric factor (R/d)^2). At
 * the sim's default (G star, 1 AU, circular) this computes to ~1367 W/m^2 —
 * Earth's real solar constant (1361 W/m^2) — the same sanity check
 * equilibriumTemperatureK's calibration note relies on, since both derive
 * from the same star/distance geometry. Independent of albedo (that only
 * affects how much of this incident energy is absorbed vs equilibrium
 * temperature, not how much arrives) — exposed as the raw energy-per-m^2
 * budget, alongside peakWavelengthNm, for future chlorophyll-style
 * photosynthesis work.
 */
export function incidentFluxWm2(stellar: StellarConfig, orbital: OrbitalConfig, tick: number): number {
  const profile = STAR_TABLE[stellar.spectralClass];
  const distanceAu = orbitalDistanceAu(stellar, orbital, tick);
  const radiusAu = profile.radiusSolar * AU_PER_SOLAR_RADIUS;
  const surfaceFluxWm2 = STEFAN_BOLTZMANN_W_M2_K4 * profile.temperatureK ** 4;
  return surfaceFluxWm2 * (radiusAu / distanceAu) ** 2;
}

/**
 * Wien's-law peak emission wavelength for this star, in nanometers. Not read
 * by any mechanic yet — "light spectrum" is reserved for future
 * chlorophyll-style photosynthesis work, where a pigment gene could
 * eventually need to match it — but exposed now so the UI can show players
 * *why* a spectral class matters beyond total brightness.
 */
export function peakWavelengthNm(spectralClass: SpectralClass): number {
  return WIEN_DISPLACEMENT_NM_K / STAR_TABLE[spectralClass].temperatureK;
}
