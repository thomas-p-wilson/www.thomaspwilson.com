const SI_PREFIXES: { exp: number; symbol: string }[] = [
  { exp: 24, symbol: "Y" },
  { exp: 21, symbol: "Z" },
  { exp: 18, symbol: "E" },
  { exp: 15, symbol: "P" },
  { exp: 12, symbol: "T" },
  { exp: 9, symbol: "G" },
  { exp: 6, symbol: "M" },
  { exp: 3, symbol: "k" },
  { exp: 0, symbol: "" },
  { exp: -3, symbol: "m" },
  { exp: -6, symbol: "µ" },
  { exp: -9, symbol: "n" },
  { exp: -12, symbol: "p" },
  { exp: -15, symbol: "f" },
  { exp: -18, symbol: "a" },
  { exp: -21, symbol: "z" },
  { exp: -24, symbol: "y" },
];

function significantFigures(value: number, figures = 3): string {
  if (value === 0) return "0";
  return value.toLocaleString(undefined, { maximumSignificantDigits: figures, minimumSignificantDigits: 1 });
}

/** Formats a length given in kilometers using the best-fit SI prefix on meters. */
export function formatLengthKm(km: number): string {
  const meters = km * 1000;
  if (meters === 0) return "0 m";

  const rawExp = Math.floor(Math.log10(Math.abs(meters)) / 3) * 3;
  const clampedExp = Math.max(-24, Math.min(24, rawExp));
  const prefix = SI_PREFIXES.find((p) => p.exp === clampedExp) ?? SI_PREFIXES[SI_PREFIXES.length - 1];
  const scaled = meters / 10 ** prefix.exp;
  return `${significantFigures(scaled)} ${prefix.symbol}m`;
}

interface ScaleReference {
  maxMeters: number;
  label: string;
}

// Ascending thresholds; the first one a length is <= to is used. Meant as
// evocative, order-of-magnitude comparisons, not precise equivalences.
const SCALE_REFERENCES: ScaleReference[] = [
  { maxMeters: 1e-15, label: "smaller than a proton" },
  { maxMeters: 1e-10, label: "about the size of an atom" },
  { maxMeters: 2e-9, label: "about the width of a strand of DNA" },
  { maxMeters: 1e-6, label: "about the size of a bacterium" },
  { maxMeters: 7e-5, label: "about the width of a human hair" },
  { maxMeters: 5e-4, label: "about the thickness of a credit card" },
  { maxMeters: 5e-3, label: "about the width of a grain of rice" },
  { maxMeters: 3e-2, label: "about the width of a golf ball" },
  { maxMeters: 0.3, label: "about the length of a football" },
  { maxMeters: 2, label: "about the height of a doorway" },
  { maxMeters: 100, label: "about the length of a football field" },
  { maxMeters: 10_000, label: "about the length of Manhattan Island" },
  { maxMeters: 1_000_000, label: "about the width of a small country" },
  { maxMeters: 1e7, label: "about the diameter of Earth" },
  { maxMeters: 1e9, label: "about the distance to the Moon" },
  { maxMeters: 1.5e11, label: "about the distance to the Sun" },
  { maxMeters: 6e12, label: "about the diameter of the solar system" },
  { maxMeters: 9.461e16, label: "about the width of a light-year" },
  { maxMeters: 9.461e20, label: "about the width of the Milky Way" },
];

/** A short, evocative real-world comparison for a length given in kilometers. */
export function scaleComparison(km: number): string {
  const meters = Math.abs(km) * 1000;
  const match = SCALE_REFERENCES.find((ref) => meters <= ref.maxMeters);
  return match ? match.label : "larger than the Milky Way";
}
