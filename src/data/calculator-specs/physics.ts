import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";
import { inertiaConfigurationOptions, inertiaConfigurations } from "./inertia-configurations";

const IDEAL_GAS_CONSTANT = 8.31446261815324; // J/(K*mol)

// Ported from origin/2020's ideal-gas-law calculator. The original let
// whichever field you filled in last drive the rest; simplified to an
// explicit "solve for" selector, which is easier to reason about with a
// single-direction calculate() function.
export const idealGasLaw: CalculatorSpec = {
  slug: "ideal-gas-law",
  title: "Ideal Gas Law",
  description: "Solve PV = nRT for pressure, volume, temperature, or moles.",
  sections: [{
    title: "Gas State",
    fields: [
      {
        id: "solveFor", label: "Solve For", type: "select",
        options: [
          { value: "pressure", label: "Pressure" },
          { value: "volume", label: "Volume" },
          { value: "temperature", label: "Temperature" },
          { value: "moles", label: "Moles" },
        ],
      },
      { id: "pressure", label: "Pressure", unit: "Pa", measure: "pressure", readOnly: (v) => v.solveFor === "pressure" },
      { id: "volume", label: "Volume", unit: "m3", measure: "volume", readOnly: (v) => v.solveFor === "volume" },
      { id: "temperature", label: "Temperature", unit: "K", measure: "temperature", readOnly: (v) => v.solveFor === "temperature" },
      { id: "moles", label: "Amount of Substance", unit: "mol", readOnly: (v) => v.solveFor === "moles" },
    ],
  }],
  defaults: { solveFor: "pressure", pressure: "101325", volume: "0.0224", temperature: "273.15", moles: "1" },
  calculate: (values) => {
    const p = num(values, "pressure"), v = num(values, "volume"), t = num(values, "temperature"), n = num(values, "moles");
    const R = IDEAL_GAS_CONSTANT;
    const result = { ...values };
    if (values.solveFor === "pressure" && !isNaN(v) && v !== 0) result.pressure = ((n * R * t) / v).toPrecision(6);
    if (values.solveFor === "volume" && !isNaN(p) && p !== 0) result.volume = ((n * R * t) / p).toPrecision(6);
    if (values.solveFor === "temperature" && !isNaN(n) && n !== 0) result.temperature = ((p * v) / (n * R)).toPrecision(6);
    if (values.solveFor === "moles" && !isNaN(t) && t !== 0) result.moles = ((p * v) / (R * t)).toPrecision(6);
    return result;
  },
  notes: [`Ideal gas constant R = ${IDEAL_GAS_CONSTANT} J/(K·mol).`],
};

// Ported from origin/2020's centrifugal-force calculator, converted to SI
// units throughout (the original mixed grams/centimetres with SI angular
// velocity). v = ω×r is correct as shipped — despite a code comment implying
// a spurious 2π factor, ω already encodes "per radian", so no 2π belongs here.
export const centrifugalForce: CalculatorSpec = {
  slug: "centrifugal-force",
  title: "Centrifugal Force",
  description: "Surface speed, centrifugal force, and centripetal acceleration for an object spinning about an axis.",
  sections: [{
    title: "Rotating Body",
    fields: [
      { id: "mass", label: "Mass", unit: "kg", measure: "mass" },
      { id: "radius", label: "Radius", unit: "m", measure: "length" },
      { id: "angularVelocity", label: "Angular Velocity (ω)", unit: "rad/s", measure: "frequency" },
      { id: "surfaceSpeed", label: "Surface Speed", unit: "m/s", readOnly: true },
      { id: "force", label: "Centrifugal Force", unit: "N", readOnly: true },
      { id: "acceleration", label: "Centripetal Acceleration", unit: "m/s²", readOnly: true },
    ],
  }],
  defaults: { mass: "1", radius: "0.5", angularVelocity: "10" },
  calculate: (values) => {
    const m = num(values, "mass"), r = num(values, "radius"), w = num(values, "angularVelocity");
    if (isNaN(m) || isNaN(r) || isNaN(w) || r === 0) return values;
    const v = w * r;
    return {
      ...values,
      surfaceSpeed: v.toFixed(4),
      force: ((m * v * v) / r).toFixed(4),
      acceleration: ((v * v) / r).toFixed(4),
    };
  },
};

// kg/m^3. Real flywheel materials — the original source (origin/2020) oddly
// offered "water" as an option, which doesn't work as a rigid rotating body.
const materialDensities: Record<string, number> = {
  steel: 7850,
  cast_iron: 7200,
  aluminum: 2700,
  titanium: 4500,
  lead: 11340,
};
const materialOptions = [
  { value: "steel", label: "Steel" },
  { value: "cast_iron", label: "Cast Iron" },
  { value: "aluminum", label: "Aluminum" },
  { value: "titanium", label: "Titanium" },
  { value: "lead", label: "Lead" },
];

// Ported from origin/2020's flywheel calculator, converted to SI throughout.
export const flywheel: CalculatorSpec = {
  slug: "flywheel",
  title: "Flywheel Energy Storage",
  description: "Mass, moment of inertia, and stored kinetic energy of a spinning flywheel.",
  sections: [{
    title: "Flywheel",
    fields: [
      { id: "material", label: "Material", type: "select", options: materialOptions },
      { id: "configuration", label: "Configuration", type: "select", options: inertiaConfigurationOptions },
      { id: "radius", label: "Radius", unit: "m", measure: "length" },
      {
        id: "innerRadius", label: "Inner Radius", unit: "m", measure: "length",
        hidden: (v) => inertiaConfigurations[v.configuration]?.needsInnerOuterRadius !== true,
      },
      { id: "height", label: "Height", unit: "m", measure: "length" },
      { id: "angularVelocity", label: "Angular Velocity (ω)", unit: "rad/s", measure: "frequency" },
      { id: "mass", label: "Mass", unit: "kg", measure: "mass", readOnly: true },
      { id: "inertia", label: "Moment of Inertia", unit: "kg·m²", readOnly: true },
      { id: "energy", label: "Stored Kinetic Energy", unit: "J", measure: "energy", readOnly: true },
    ],
  }],
  defaults: {
    material: "steel", configuration: "solid_cylinder",
    radius: "0.2", innerRadius: "0.1", height: "0.05", angularVelocity: "100",
  },
  calculate: (values) => {
    const r = num(values, "radius"), h = num(values, "height"), w = num(values, "angularVelocity");
    const config = inertiaConfigurations[values.configuration];
    const density = materialDensities[values.material];
    if (isNaN(r) || isNaN(h) || isNaN(w) || !config || !density) return values;

    const volume = Math.PI * r * r * h; // m^3
    const mass = density * volume; // kg
    const inertia = config.needsInnerOuterRadius
      ? config.inertiaZ(mass, r, num(values, "innerRadius"))
      : config.inertiaZ(mass, r);
    const energy = config.k * inertia * w * w;

    return {
      ...values,
      mass: mass.toFixed(4),
      inertia: inertia.toFixed(6),
      energy: energy.toFixed(4),
    };
  },
};

const STANDARD_GRAVITY_M_S2 = 9.80665;

// New — extracted so Telescope Mirror Design can delegate its spin-cast rotation the same way it
// delegates sagitta/dish results to other geometry calculators, rather than duplicating the formula.
export const spinCastRotation: CalculatorSpec = {
  slug: "spin-cast-rotation",
  title: "Spin-Cast Mirror Rotation",
  description: "Rotation speed at which a spinning liquid surface settles into a paraboloid of a given focal length.",
  sections: [{
    title: "Spin-Casting",
    fields: [
      { id: "focalLength", label: "Focal Length", unit: "cm", measure: "length" },
      { id: "rotation", label: "Rotation Speed", unit: "rad/s", measure: "frequency", readOnly: true },
    ],
  }],
  defaults: { focalLength: "121.92" },
  calculate: (values) => {
    const f = num(values, "focalLength");
    if (isNaN(f) || f <= 0) return { ...values, rotation: "" };
    const rotation = Math.sqrt((STANDARD_GRAVITY_M_S2 * 100) / (2 * f)); // g in cm/s^2, to match f in cm
    return { ...values, rotation: rotation.toFixed(3) };
  },
  notes: ["ω = √(g / 2f) — the equilibrium rotation speed of a liquid surface forming a paraboloidal mirror of focal length f."],
};

// Ported from origin/2020's mass-moment-of-inertia calculator.
export const massMomentOfInertia: CalculatorSpec = {
  slug: "mass-moment-of-inertia",
  title: "Mass Moment of Inertia",
  description: "Moment of inertia about the axis of symmetry (Z-axis) for common solid/hollow shapes.",
  sections: [{
    title: "Body",
    fields: [
      { id: "configuration", label: "Configuration", type: "select", options: inertiaConfigurationOptions },
      { id: "mass", label: "Mass", unit: "kg", measure: "mass" },
      {
        id: "radius", label: "Radius", unit: "m", measure: "length",
      },
      {
        id: "innerRadius", label: "Inner Radius", unit: "m", measure: "length",
        hidden: (v) => inertiaConfigurations[v.configuration]?.needsInnerOuterRadius !== true,
      },
      { id: "inertia", label: "Moment of Inertia (Z-axis)", unit: "kg·m²", readOnly: true },
    ],
  }],
  defaults: { configuration: "solid_cylinder", mass: "5", radius: "0.2", innerRadius: "0.1" },
  calculate: (values) => {
    const mass = num(values, "mass"), radius = num(values, "radius");
    const config = inertiaConfigurations[values.configuration];
    if (isNaN(mass) || isNaN(radius) || !config) return values;
    const inertia = config.needsInnerOuterRadius
      ? config.inertiaZ(mass, radius, num(values, "innerRadius"))
      : config.inertiaZ(mass, radius);
    return { ...values, inertia: inertia.toFixed(6) };
  },
};
