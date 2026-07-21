import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: 4 });

// A typed conversion engine, in the spirit of the unit-conversion library
// rebuilt in nearly every prior era of this site (2019-2024). Values below
// are drawn from the historically-validated 2019/2020/2021/2021-rework
// literals rather than 2022's or 2024's numbers, several of which were
// found to be regressions (2024's angle.ts inverted every multiplier;
// 2024's energy.ts mixed power units into the energy measure with a wrong
// gigawatt value; 2022 dropped mass/energy/time/etc. entirely). Historical
// unit systems are curated rather than exhaustive — the most obscure ones
// (Mint Weights, Dutch, Scottish, Hanseatic League, full English Pre-1826
// catalog) are left out; "area" is skipped since no prior branch ever had it.

export type Measure =
  | "length"
  | "mass"
  | "temperature"
  | "volume"
  | "energy"
  | "power"
  | "time"
  | "frequency"
  | "pressure"
  | "angle";

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

const FOOT_M = "0.3048";
const INCH_M = "0.0254";

const units: Unit[] = [
  // ---- Length — base unit: meter ----
  linear("nm", "Nanometer", "length", "1e-9"),
  linear("um", "Micrometer", "length", "1e-6"),
  linear("mm", "Millimeter", "length", "0.001"),
  linear("cm", "Centimeter", "length", "0.01"),
  linear("m", "Meter", "length", 1),
  linear("km", "Kilometer", "length", 1000),
  linear("in", "Inch", "length", INCH_M),
  linear("ft", "Foot", "length", FOOT_M),
  linear("yd", "Yard", "length", "0.9144"),
  linear("mi", "Mile", "length", "1609.344"),
  linear("nmi", "Nautical Mile", "length", 1852),
  linear("fathom", "Fathom", "length", new Decimal(6).times(FOOT_M)),
  linear("chain", "Chain (Gunter's)", "length", "20.1168"),
  linear("link", "Link (Gunter's)", "length", "0.201168"),
  linear("rod", "Rod / Pole / Perch", "length", new Decimal("16.5").times(FOOT_M)),
  linear("furlong", "Furlong", "length", new Decimal(660).times(FOOT_M)),
  linear("league", "League", "length", new Decimal(9000).times(FOOT_M)),
  linear("barleycorn", "Barleycorn", "length", new Decimal(1).div(3).times(INCH_M)),
  linear("hand", "Hand", "length", new Decimal(1).div(3).times(FOOT_M)),
  linear("cubit", "Cubit", "length", new Decimal("1.5").times(FOOT_M)),

  // ---- Mass — base unit: gram ----
  linear("mg", "Milligram", "mass", "0.001"),
  linear("g", "Gram", "mass", 1),
  linear("kg", "Kilogram", "mass", 1000),
  linear("t", "Metric Tonne", "mass", 1_000_000),
  linear("oz", "Ounce (Avoirdupois)", "mass", "28.349523125"),
  linear("lb", "Pound (Avoirdupois)", "mass", "453.59237"),
  linear("st", "Stone", "mass", "6350.29318"),
  linear("cwt-long", "Hundredweight (Long)", "mass", "50802.34544"),
  linear("ton-long", "Ton (Long)", "mass", "1016046.9088"),
  linear("ton-short", "Ton (Short, US)", "mass", "907184.74"),
  linear("grain", "Grain (Troy)", "mass", "0.06479891"),
  linear("dwt", "Pennyweight (Troy)", "mass", "1.55517384"),
  linear("oz-troy", "Ounce (Troy)", "mass", "31.1034768"),
  linear("lb-troy", "Pound (Troy)", "mass", "373.2417216"),
  linear("dr-apoth", "Dram (Apothecary)", "mass", "3.8879346"),

  // ---- Temperature — base unit: Celsius (affine) ----
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
  {
    kind: "affine",
    symbol: "R",
    label: "Rankine",
    measure: "temperature",
    // Rankine shares absolute zero with Kelvin but the degree size of Fahrenheit.
    toBase: (v) => v.times(5).dividedBy(9).minus("273.15"),
    fromBase: (v) => v.plus("273.15").times(9).dividedBy(5),
  },

  // ---- Volume — base unit: liter ----
  linear("mL", "Milliliter", "volume", "0.001"),
  linear("cL", "Centiliter", "volume", "0.01"),
  linear("dL", "Deciliter", "volume", "0.1"),
  linear("L", "Liter", "volume", 1),
  linear("kL", "Kiloliter", "volume", 1000),
  linear("m3", "Cubic Meter", "volume", 1000),
  linear("cm3", "Cubic Centimeter", "volume", "0.001"),
  linear("tsp", "Teaspoon", "volume", "0.005"),
  linear("tbsp", "Tablespoon", "volume", "0.0148"),
  linear("fl-oz", "Fluid Ounce", "volume", "0.02841312491923635"),
  linear("cup", "Cup", "volume", "0.25"),
  linear("pint", "Pint", "volume", "0.56826125"),
  linear("quart", "Quart", "volume", "1.1365225"),
  linear("gal", "Gallon", "volume", "4.54609"),
  linear("ft3", "Cubic Foot", "volume", "28.3168864564566"),

  // ---- Energy — base unit: watt-hour ----
  linear("mWh", "Milliwatt-hour", "energy", "0.001"),
  linear("Wh", "Watt-hour", "energy", 1),
  linear("kWh", "Kilowatt-hour", "energy", 1000),
  linear("MWh", "Megawatt-hour", "energy", 1_000_000),
  linear("GWh", "Gigawatt-hour", "energy", 1_000_000_000),
  linear("J", "Joule", "energy", new Decimal(1).dividedBy(3600)),
  linear("kJ", "Kilojoule", "energy", new Decimal(1).dividedBy("3.6")),
  linear("MJ", "Megajoule", "energy", new Decimal(1).dividedBy("0.0036")),
  linear("GJ", "Gigajoule", "energy", new Decimal(1).dividedBy("0.0000036")),

  // ---- Power — base unit: watt ----
  linear("mW", "Milliwatt", "power", "0.001"),
  linear("W", "Watt", "power", 1),
  linear("kW", "Kilowatt", "power", 1000),
  linear("MW", "Megawatt", "power", 1_000_000),
  linear("GW", "Gigawatt", "power", 1_000_000_000),

  // ---- Time — base unit: second ----
  linear("ns", "Nanosecond", "time", "1e-9"),
  linear("us", "Microsecond", "time", "1e-6"),
  linear("ms", "Millisecond", "time", "0.001"),
  linear("s", "Second", "time", 1),
  linear("min", "Minute", "time", 60),
  linear("h", "Hour", "time", 3600),
  linear("d", "Day", "time", 86400),
  linear("y", "Year", "time", new Decimal(86400).times("365.25")),

  // ---- Frequency — base unit: hertz ----
  linear("mHz", "Millihertz", "frequency", "0.001"),
  linear("Hz", "Hertz", "frequency", 1),
  linear("kHz", "Kilohertz", "frequency", 1000),
  linear("MHz", "Megahertz", "frequency", 1_000_000),
  linear("GHz", "Gigahertz", "frequency", 1_000_000_000),
  linear("rpm", "Rotations per Minute", "frequency", new Decimal(1).dividedBy(60)),
  linear("deg/s", "Degrees per Second", "frequency", new Decimal(1).dividedBy(360)),
  linear("rad/s", "Radians per Second", "frequency", new Decimal(1).dividedBy(new Decimal(Math.PI).times(2))),

  // ---- Pressure — base unit: pascal ----
  linear("mPa", "Millipascal", "pressure", "0.001"),
  linear("Pa", "Pascal", "pressure", 1),
  linear("hPa", "Hectopascal", "pressure", 100),
  linear("kPa", "Kilopascal", "pressure", 1000),
  linear("MPa", "Megapascal", "pressure", 1_000_000),
  linear("bar", "Bar", "pressure", 100_000),
  linear("torr", "Torr", "pressure", new Decimal(101325).dividedBy(760)),
  linear("psi", "PSI", "pressure", new Decimal("4.4482216152605").dividedBy("0.00064516")),

  // ---- Angle — base unit: degree ----
  linear("rad", "Radian", "angle", new Decimal(180).dividedBy(Math.PI)),
  linear("deg", "Degree", "angle", 1),
  linear("grad", "Gradian", "angle", "0.9"),
  linear("arcmin", "Arcminute", "angle", new Decimal(1).dividedBy(60)),
  linear("arcsec", "Arcsecond", "angle", new Decimal(1).dividedBy(3600)),
  linear("rot", "Rotation", "angle", 360),
];

const unitsBySymbol = new Map(units.map((u) => [u.symbol, u]));

export function unitsForMeasure(measure: Measure): Unit[] {
  return units.filter((u) => u.measure === measure);
}

export const measures: Measure[] = [
  "length", "mass", "temperature", "volume", "energy", "power", "time", "frequency", "pressure", "angle",
];

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
