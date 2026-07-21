import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";

// Ported from origin/2024's wire-gauge-thickness calculator (standard AWG formula).
export const wireGauge: CalculatorSpec = {
  slug: "wire-gauge",
  title: "Wire Gauge (AWG)",
  description: "Diameter, cross-sectional area, and circular mils for a given American Wire Gauge size.",
  sections: [{
    title: "Wire",
    fields: [
      { id: "gauge", label: "AWG Gauge", unit: "AWG" },
      { id: "diameter", label: "Diameter", unit: "m", measure: "length", readOnly: true },
      { id: "area", label: "Cross-sectional Area", unit: "m²", readOnly: true },
      { id: "cmil", label: "Area", unit: "cmil", readOnly: true },
    ],
  }],
  defaults: { gauge: "16" },
  calculate: (values) => {
    const gauge = num(values, "gauge");
    if (isNaN(gauge)) return values;
    const diameter = (0.127 * Math.pow(92, (36 - gauge) / 39)) / 1000;
    const area = Math.PI * (diameter / 2) * (diameter / 2);
    const cmil = area / 5.067074790975e-10;
    return { ...values, diameter: diameter.toExponential(4), area: area.toExponential(4), cmil: cmil.toFixed(1) };
  },
  notes: ["Standard AWG formula: d(mm) = 0.127 × 92^((36−AWG)/39)."],
};

// Ported from origin/2024's helix-sizing calculator. The original's
// length/coil_diameter/turn_space calc functions depended on fields
// (resistance, resistivity, diameter) that were never rendered, so they
// never actually fired — the state's literal defaults were what really
// drove the calculator. Ported here as plain editable inputs instead.
export const helixSizing: CalculatorSpec = {
  slug: "helix-sizing",
  title: "Helix (Coil) Sizing",
  description: "Number of turns and coil length for a wire of a given length, wound into a helix.",
  sections: [{
    title: "Coil",
    fields: [
      { id: "length", label: "Wire Length", unit: "m", measure: "length" },
      { id: "coilDiameter", label: "Coil Diameter", unit: "mm", measure: "length" },
      { id: "turnSpacing", label: "Turn Spacing", unit: "mm", measure: "length" },
      { id: "turnCircumference", label: "Turn Circumference", unit: "mm", measure: "length", readOnly: true },
      { id: "turns", label: "Turns", readOnly: true },
      { id: "coilLength", label: "Coil Length", unit: "mm", measure: "length", readOnly: true },
    ],
  }],
  defaults: { length: "1", coilDiameter: "12", turnSpacing: "3" },
  calculate: (values) => {
    const length = num(values, "length") * 1000; // m -> mm, to match the mm-scale coil inputs
    const coilDiameter = num(values, "coilDiameter");
    const turnSpacing = num(values, "turnSpacing");
    if (isNaN(length) || isNaN(coilDiameter) || isNaN(turnSpacing)) return values;
    const turnCircumference = Math.PI * coilDiameter;
    const turnLength = Math.sqrt(turnSpacing * turnSpacing + turnCircumference * turnCircumference);
    const turns = length / turnLength;
    const coilLength = turnSpacing * turns;
    return {
      ...values,
      turnCircumference: turnCircumference.toFixed(3),
      turns: turns.toFixed(1),
      coilLength: coilLength.toFixed(2),
    };
  },
};

// Ported from origin/2024's kiln-wattage calculator (also the source of the
// duplicated dead code found pasted into that branch's mortgage page).
export const kilnWattage: CalculatorSpec = {
  slug: "kiln-wattage",
  title: "Kiln Wattage Sizing",
  description: "Total heating-element wattage for a cylindrical kiln chamber, from its surface area and a target power density.",
  sections: [{
    title: "Chamber",
    fields: [
      { id: "chamberHeight", label: "Chamber Height", unit: "m", measure: "length" },
      { id: "chamberDiameter", label: "Chamber Diameter", unit: "m", measure: "length" },
      { id: "wattsPerUnitArea", label: "Target Power Density", unit: "W/m²" },
      { id: "chamberSurfaceArea", label: "Chamber Surface Area", unit: "m²", readOnly: true },
      { id: "totalWattage", label: "Total Wattage", unit: "W", measure: "power", readOnly: true },
    ],
  }],
  defaults: { chamberHeight: "0.21", chamberDiameter: "0.71", wattsPerUnitArea: "8500" },
  calculate: (values) => {
    const height = num(values, "chamberHeight");
    const diameter = num(values, "chamberDiameter");
    const density = num(values, "wattsPerUnitArea");
    if (isNaN(height) || isNaN(diameter) || isNaN(density)) return values;
    const radius = diameter / 2;
    const surfaceArea = 2 * Math.PI * radius * height + 2 * Math.PI * radius * radius;
    return {
      ...values,
      chamberSurfaceArea: surfaceArea.toFixed(4),
      totalWattage: (surfaceArea * density).toFixed(0),
    };
  },
  notes: ["Reference: https://knifedogs.com/threads/heat-treat-oven-how-to-design-and-calculate-the-heating-elements.21072/"],
};

// New — generic mass-from-volume-and-density calculator, needed so Telescope Mirror Design can
// delegate its blank/remaining mass calculations instead of computing volume × density inline.
// Density has no dedicated Measure in lib/units.ts (only its component units do), so it's a plain
// fixed-unit field rather than a convertible one — same treatment as kilnWattage's power density.
export const materialMass: CalculatorSpec = {
  slug: "material-mass",
  title: "Mass from Volume & Density",
  description: "Mass of a material from its volume and density.",
  sections: [{
    title: "Material",
    fields: [
      { id: "volume", label: "Volume", unit: "cm3", measure: "volume" },
      { id: "density", label: "Density", unit: "g/cm³" },
      { id: "mass", label: "Mass", unit: "g", measure: "mass", readOnly: true },
    ],
  }],
  defaults: { volume: "100", density: "2.579" },
  calculate: (values) => {
    const volume = num(values, "volume");
    const density = num(values, "density");
    if (isNaN(volume) || isNaN(density)) return values;
    return { ...values, mass: (volume * density).toFixed(2) };
  },
};

// Ported from origin/2019/2021/2021-rework/2022's thermal-mass-storage
// calculator (identical across all four branches).
export const thermalMassStorage: CalculatorSpec = {
  slug: "thermal-mass-storage",
  title: "Thermal Mass Storage (Water)",
  description: "Mass and volume of water needed to store a target amount of thermal energy, plus the pressure vessel's boiling point and burst pressure.",
  sections: [{
    title: "Storage",
    fields: [
      { id: "capacity", label: "Energy Capacity", unit: "J", measure: "energy" },
      { id: "absolutePressure", label: "Absolute Pressure", unit: "psi", measure: "pressure" },
      { id: "depletedTemperature", label: "Depleted Temperature", unit: "K", measure: "temperature" },
      { id: "boilingPoint", label: "Boiling Point at Pressure", unit: "K", measure: "temperature", readOnly: true },
      { id: "massRequired", label: "Water Mass Required", unit: "g", measure: "mass", readOnly: true },
      { id: "volume", label: "Volume", unit: "L", measure: "volume", readOnly: true },
      { id: "burstPressure", label: "Vessel Pressure at Boiling Point", unit: "Pa", measure: "pressure", readOnly: true },
    ],
  }],
  defaults: { capacity: "720000000", absolutePressure: "14.696", depletedTemperature: "308.15" },
  calculate: (values) => {
    const capacity = num(values, "capacity");
    const pressure = num(values, "absolutePressure");
    const depleted = num(values, "depletedTemperature");
    if (isNaN(capacity) || isNaN(pressure) || pressure <= 0 || isNaN(depleted)) return values;

    const t1 = 373.15, p1 = 14.696, L = 40660, R = 8.314;
    const boilingPoint = 1 / (-((Math.log(p1 / pressure) / (-L / R)) - 1 / t1));
    const storedEnergy = 4.18 * (boilingPoint - depleted); // J/g
    if (storedEnergy <= 0) return { ...values, boilingPoint: boilingPoint.toFixed(2), massRequired: "", volume: "", burstPressure: "" };
    const massRequired = capacity / storedEnergy; // g
    const volume = massRequired / 1000; // L
    const burstPressure = ((massRequired / 18) * R * boilingPoint) / (volume * 0.001); // Pa

    return {
      ...values,
      boilingPoint: boilingPoint.toFixed(2),
      massRequired: massRequired.toFixed(1),
      volume: volume.toFixed(2),
      burstPressure: burstPressure.toFixed(0),
    };
  },
  notes: [
    "Water only. Boiling point derived from the Clausius–Clapeyron relation; burst pressure from the ideal gas law.",
  ],
};
