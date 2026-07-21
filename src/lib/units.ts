import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: 4 });

// A small typed conversion engine, in the spirit of the unit-conversion
// library rebuilt in nearly every prior era of this site (2019-2022) —
// right-sized here rather than porting the full historical-unit-system
// library, which was itself left half-wired-up upstream.

export type Measure = "length" | "mass" | "temperature";

interface LinearUnit {
  kind: "linear";
  symbol: string;
  label: string;
  measure: Measure;
  /** Multiplier to convert a value in this unit to the measure's base unit. */
  toBase: Decimal.Value;
}

interface AffineUnit {
  kind: "affine";
  symbol: string;
  label: string;
  measure: Measure;
  toBase: (value: Decimal) => Decimal;
  fromBase: (value: Decimal) => Decimal;
}

export type Unit = LinearUnit | AffineUnit;

const linear = (symbol: string, label: string, measure: Measure, toBase: Decimal.Value): LinearUnit => ({
  kind: "linear",
  symbol,
  label,
  measure,
  toBase,
});

const units: Unit[] = [
  // Length — base unit: meter
  linear("m", "Meter", "length", 1),
  linear("km", "Kilometer", "length", 1000),
  linear("cm", "Centimeter", "length", "0.01"),
  linear("mm", "Millimeter", "length", "0.001"),
  linear("mi", "Mile", "length", "1609.344"),
  linear("yd", "Yard", "length", "0.9144"),
  linear("ft", "Foot", "length", "0.3048"),
  linear("in", "Inch", "length", "0.0254"),

  // Mass — base unit: gram
  linear("g", "Gram", "mass", 1),
  linear("kg", "Kilogram", "mass", 1000),
  linear("mg", "Milligram", "mass", "0.001"),
  linear("t", "Metric ton", "mass", 1_000_000),
  linear("lb", "Pound", "mass", "453.59237"),
  linear("oz", "Ounce", "mass", "28.349523125"),

  // Temperature — base unit: Celsius (affine, needs shift not just scale)
  {
    kind: "affine",
    symbol: "C",
    label: "Celsius",
    measure: "temperature",
    toBase: (v) => v,
    fromBase: (v) => v,
  },
  {
    kind: "affine",
    symbol: "F",
    label: "Fahrenheit",
    measure: "temperature",
    toBase: (v) => v.minus(32).times(5).dividedBy(9),
    fromBase: (v) => v.times(9).dividedBy(5).plus(32),
  },
  {
    kind: "affine",
    symbol: "K",
    label: "Kelvin",
    measure: "temperature",
    toBase: (v) => v.minus("273.15"),
    fromBase: (v) => v.plus("273.15"),
  },
];

const unitsBySymbol = new Map(units.map((u) => [u.symbol, u]));

export function unitsForMeasure(measure: Measure): Unit[] {
  return units.filter((u) => u.measure === measure);
}

export const measures: Measure[] = ["length", "mass", "temperature"];

export function convert(value: Decimal.Value, fromSymbol: string, toSymbol: string): Decimal {
  const from = unitsBySymbol.get(fromSymbol);
  const to = unitsBySymbol.get(toSymbol);
  if (!from) throw new Error(`Unrecognized unit "${fromSymbol}"`);
  if (!to) throw new Error(`Unrecognized unit "${toSymbol}"`);
  if (from.measure !== to.measure) {
    throw new Error(`Cannot convert between "${from.measure}" and "${to.measure}"`);
  }
  if (from === to) return new Decimal(value);

  const input = new Decimal(value);
  const base = from.kind === "linear" ? input.times(from.toBase) : from.toBase(input);
  return to.kind === "linear" ? base.dividedBy(to.toBase) : to.fromBase(base);
}
