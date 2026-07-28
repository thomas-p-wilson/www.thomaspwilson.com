import type { CalculatorField, CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";
import { idealGasLaw, IDEAL_GAS_CONSTANT } from "./physics";
import { energyConversionChain } from "./energy-conversion-chain";

// Generalized from origin/2021-rework/2022's woodgas-conversions calculator, which only ever
// handled gasoline -> syngas/biomass (and did so via gallons multiplied directly by a BTU/lb
// figure, silently skipping the gal->lb step its own footnote described). Every fuel reduces to
// the same "quantity x heating value = total energy" relationship, so burning and converting-to
// are the same select+quantity shape on both sides of the calculator — only which stat comes out
// the other end changes with the selected fuel's category (liquid/gas/mass/energy/custom).

type FuelCategory = "liquid" | "gas" | "mass" | "energy" | "custom";

interface FuelPreset {
  label: string;
  category: FuelCategory;
  /**
   * kWh of energy per one storage-unit of this fuel (gal for liquid, m3 for gas, kg for mass, kWh
   * for energy itself). Omitted for fuels whose heating value swings too widely to hardcode —
   * syngas (gasifier/feedstock-dependent) and the custom slot — which instead get a dedicated
   * editable field (see `heatingValueFieldId`).
   */
  kWhPerUnit?: number;
}

const fuels: Record<string, FuelPreset> = {
  gasoline: { label: "Gasoline", category: "liquid", kWhPerUnit: 33.7 },
  diesel: { label: "Diesel", category: "liquid", kWhPerUnit: 38 },
  propane: { label: "Propane (LPG)", category: "liquid", kWhPerUnit: 26.8 },
  naturalGas: { label: "Natural Gas", category: "gas", kWhPerUnit: 10.72 },
  syngas: { label: "Syngas / Woodgas", category: "gas" },
  biomass: { label: "Wood / Biomass (~15% moisture)", category: "mass", kWhPerUnit: 4.52 },
  coal: { label: "Coal (Bituminous)", category: "mass", kWhPerUnit: 6.67 },
  electricity: { label: "Electricity", category: "energy", kWhPerUnit: 1 },
  custom: { label: "Other (Custom Heating Value)", category: "custom" },
};

const fuelOptions = Object.entries(fuels).map(([value, f]) => ({ value, label: f.label }));

// Gas heating-value tables (natural gas, syngas) are quoted at a reference pressure/temperature —
// "standard conditions" — not whatever a storage cylinder actually holds it at. 1 atm / 15°C is a
// common enough reference point (close to what EIA natural-gas heat-content tables assume) to use
// as this calculator's own standard-volume basis.
const STANDARD_PRESSURE_PA = 101325;
const STANDARD_TEMPERATURE_K = 288.15;
const molesAtStandardConditions = (standardVolumeM3: number): number =>
  (STANDARD_PRESSURE_PA * standardVolumeM3) / (IDEAL_GAS_CONSTANT * STANDARD_TEMPERATURE_K);

const qtyFieldSuffix: Record<FuelCategory, string> = {
  liquid: "LiquidQty", gas: "GasQty", mass: "MassQty", energy: "EnergyQty", custom: "CustomQty",
};

const quantityFieldId = (prefix: "in" | "out", fuelKey: string): string | undefined => {
  const preset = fuels[fuelKey];
  return preset && `${prefix}${qtyFieldSuffix[preset.category]}`;
};

const heatingValueFieldId = (prefix: "in" | "out", fuelKey: string): string | undefined => {
  if (fuelKey === "syngas") return `${prefix}SyngasHeatingValue`;
  if (fuelKey === "custom") return `${prefix}CustomHeatingValue`;
  return undefined;
};

const heatingValue = (prefix: "in" | "out", fuelKey: string, values: Record<string, string>): number => {
  const preset = fuels[fuelKey];
  if (!preset) return NaN;
  if (preset.kWhPerUnit !== undefined) return preset.kWhPerUnit;
  const fieldId = heatingValueFieldId(prefix, fuelKey);
  return fieldId ? num(values, fieldId) : NaN;
};

const quantityFields = (prefix: "in" | "out", readOnly: boolean): CalculatorField[] => {
  const label = readOnly ? "Equivalent Amount" : "Amount";
  const isCategory = (category: FuelCategory) => (v: Record<string, string>) => fuels[v[`${prefix}Fuel`]]?.category !== category;
  return [
    { id: `${prefix}LiquidQty`, label, unit: "gal", measure: "volume", readOnly, hidden: isCategory("liquid") },
    {
      id: `${prefix}GasQty`, label: `${label} (Standard Volume)`, unit: "m3", measure: "volume", readOnly,
      hidden: isCategory("gas"),
      help: readOnly
        ? "Standard volume — at 1 atm / 15°C, the reference condition the heating value assumes. A compressed tank holds this same energy in far less physical space; expand this tile to solve for actual volume at a real storage pressure via the Ideal Gas Law."
        : "Standard volume — at 1 atm / 15°C, the reference condition the heating value assumes, not the physical size of a compressed tank.",
      ...(readOnly ? {
        subCalculator: () => ({
          spec: idealGasLaw,
          prefill: (v: Record<string, string>) => {
            const standardVolume = num(v, `${prefix}GasQty`);
            return {
              solveFor: "volume",
              moles: isNaN(standardVolume) ? "1" : molesAtStandardConditions(standardVolume).toPrecision(6),
              pressure: String(STANDARD_PRESSURE_PA),
              temperature: String(STANDARD_TEMPERATURE_K),
            };
          },
        }),
      } : {}),
    },
    { id: `${prefix}MassQty`, label, unit: "kg", measure: "mass", readOnly, hidden: isCategory("mass") },
    { id: `${prefix}EnergyQty`, label, unit: "kWh", measure: "energy", readOnly, hidden: isCategory("energy") },
    { id: `${prefix}CustomQty`, label, unit: "unit", readOnly, hidden: isCategory("custom") },
  ];
};

const heatingValueFields = (prefix: "in" | "out"): CalculatorField[] => [
  {
    id: `${prefix}SyngasHeatingValue`, label: "Syngas Heating Value", unit: "kWh/m³",
    hidden: (v) => v[`${prefix}Fuel`] !== "syngas",
  },
  {
    id: `${prefix}CustomHeatingValue`, label: "Heating Value", unit: "kWh/unit",
    hidden: (v) => v[`${prefix}Fuel`] !== "custom",
  },
];

export const fuelEquivalence: CalculatorSpec = {
  slug: "fuel-equivalence",
  title: "Fuel Equivalence Converter",
  description: "Energy-equivalent amount of one fuel needed to replace another, by heating value.",
  helpIntro: "Every fuel's energy content reduces to quantity × heating value. Pick what you're burning and how much of it you have below, then pick a second fuel to see how much of it would supply that same total energy.",
  sections: [
    {
      title: "Feedstock",
      oneColumn: true,
      help: "Most fuels use a typical published heating value automatically. Syngas and \"Other\" expose that value directly instead, since it varies too much (by gasifier, feedstock, or fuel grade) to assume one number.",
      fields: [
        { id: "inFuel", label: "Fuel", type: "select", options: fuelOptions },
        ...quantityFields("in", false),
        ...heatingValueFields("in"),
        {
          id: "totalEnergy", label: "Total Energy Content", unit: "kWh", measure: "energy", readOnly: true,
          funFact: (values) => values.inFuel,
          help: "The energy available at the source. Actually using it — burning it in an engine to run a generator, say — loses some to each conversion step; expand this tile to chain those losses together.",
          subCalculator: () => ({
            spec: energyConversionChain,
            prefill: (values) => ({ energyIn: values.totalEnergy }),
          }),
        },
      ],
    },
    {
      title: "Equivalent In",
      oneColumn: true,
      help: "The quantity of this second fuel that carries the same total energy as what you're burning above.",
      fields: [
        { id: "outFuel", label: "Convert To", type: "select", options: fuelOptions },
        ...heatingValueFields("out"),
        ...quantityFields("out", true),
      ],
    },
  ],
  defaults: {
    inFuel: "gasoline", inLiquidQty: "1", inGasQty: "10", inMassQty: "10", inEnergyQty: "10", inCustomQty: "1",
    inSyngasHeatingValue: "2.07", inCustomHeatingValue: "1",
    outFuel: "syngas", outSyngasHeatingValue: "2.07", outCustomHeatingValue: "1",
  },
  calculate: (values) => {
    const cleared = {
      ...values,
      totalEnergy: "", outLiquidQty: "", outGasQty: "", outMassQty: "", outEnergyQty: "", outCustomQty: "",
    };
    const inPreset = fuels[values.inFuel];
    const outPreset = fuels[values.outFuel];
    if (!inPreset || !outPreset) return cleared;

    const inQtyField = quantityFieldId("in", values.inFuel)!;
    const inQty = num(values, inQtyField);
    const inHV = heatingValue("in", values.inFuel, values);
    const outHV = heatingValue("out", values.outFuel, values);
    if ([inQty, inHV, outHV].some((n) => isNaN(n)) || inQty < 0 || inHV <= 0 || outHV <= 0) return cleared;

    const totalEnergy = inQty * inHV;
    const outQty = totalEnergy / outHV;
    const outField = quantityFieldId("out", values.outFuel)!;

    return { ...cleared, totalEnergy: totalEnergy.toFixed(2), [outField]: outQty.toFixed(3) };
  },
  notes: [
    "Heating values are approximate, illustrative averages, not certified fuel-grade figures. Gasoline (33.7 kWh/gal) and diesel (38 kWh/gal) use the EPA's gasoline/diesel-gallon-equivalent figures; propane, natural gas, coal, and biomass use typical published heat contents.",
    "Wood/biomass assumes ~15% moisture (4.52 kWh/kg), consistent with roughly 2.185 m³ of syngas per kg of biomass at a syngas heating value around 7,063 BTU/m³ (~2.07 kWh/m³).",
    "Syngas heating value varies widely by gasifier and feedstock — typically 3,500–10,600 BTU/m³ (~1.0–3.1 kWh/m³). Select Syngas / Woodgas on either side to edit it directly.",
    "Gas quantities (natural gas, syngas) are standard volumes at 1 atm / 15°C, matching the reference condition their heating values assume — not the physical volume of a compressed cylinder. Expand a gas quantity tile to solve for actual volume at a real storage pressure.",
  ],
};
