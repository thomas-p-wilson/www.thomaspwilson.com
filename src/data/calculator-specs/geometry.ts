import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";

// Ported from origin/2020's circle-area calculator. The original let any of
// radius/diameter/circumference/area drive the other three; simplified here
// to radius-driven only (still solves all four, one direction).
export const circleGeometry: CalculatorSpec = {
  slug: "circle-geometry",
  title: "Circle Geometry",
  description: "Diameter, circumference, and area from a circle's radius.",
  sections: [{
    title: "Circle",
    fields: [
      { id: "radius", label: "Radius", unit: "cm" },
      { id: "diameter", label: "Diameter", unit: "cm", readOnly: true },
      { id: "circumference", label: "Circumference", unit: "cm", readOnly: true },
      { id: "area", label: "Area", unit: "cm²", readOnly: true },
    ],
  }],
  defaults: { radius: "10" },
  calculate: (values) => {
    const r = num(values, "radius");
    if (isNaN(r)) return values;
    return {
      ...values,
      diameter: (r * 2).toFixed(4),
      circumference: (2 * Math.PI * r).toFixed(4),
      area: (Math.PI * r * r).toFixed(4),
    };
  },
};

// Ported from origin/2020's circular-segment calculator (radius+chord driven).
export const circularSegment: CalculatorSpec = {
  slug: "circular-segment",
  title: "Circular Segment",
  description: "Sagitta, arc length, and area of a circular segment from its radius and chord length.",
  sections: [{
    title: "Segment",
    fields: [
      { id: "radius", label: "Radius", unit: "cm" },
      { id: "chord", label: "Chord Length", unit: "cm" },
      { id: "sagitta", label: "Sagitta (Height)", unit: "cm", readOnly: true },
      { id: "angle", label: "Central Angle", unit: "rad", readOnly: true },
      { id: "arc", label: "Arc Length", unit: "cm", readOnly: true },
      { id: "area", label: "Area", unit: "cm²", readOnly: true },
    ],
  }],
  defaults: { radius: "10", chord: "12" },
  calculate: (values) => {
    const r = num(values, "radius");
    const c = num(values, "chord");
    if (isNaN(r) || isNaN(c) || r <= 0 || c > 2 * r) return { ...values, sagitta: "", angle: "", arc: "", area: "" };
    const angle = 2 * Math.asin(c / (2 * r));
    const sagitta = r - Math.sqrt(r * r - (c / 2) * (c / 2));
    const arc = r * angle;
    const area = 0.5 * r * r * (angle - Math.sin(angle));
    return { ...values, sagitta: sagitta.toFixed(4), angle: angle.toFixed(4), arc: arc.toFixed(4), area: area.toFixed(4) };
  },
};

// Ported from origin/2020's sphere-volume calculator (radius-driven).
export const sphereGeometry: CalculatorSpec = {
  slug: "sphere-geometry",
  title: "Sphere Geometry",
  description: "Diameter, surface area, volume, and surface-to-volume ratio from a sphere's radius.",
  sections: [{
    title: "Sphere",
    fields: [
      { id: "radius", label: "Radius", unit: "cm" },
      { id: "diameter", label: "Diameter", unit: "cm", readOnly: true },
      { id: "surfaceArea", label: "Surface Area", unit: "cm²", readOnly: true },
      { id: "volume", label: "Volume", unit: "cm³", readOnly: true },
      { id: "svRatio", label: "Surface : Volume Ratio", readOnly: true },
    ],
  }],
  defaults: { radius: "10" },
  calculate: (values) => {
    const r = num(values, "radius");
    if (isNaN(r) || r <= 0) return values;
    const surfaceArea = 4 * Math.PI * r * r;
    const volume = (4 / 3) * Math.PI * r * r * r;
    return {
      ...values,
      diameter: (r * 2).toFixed(4),
      surfaceArea: surfaceArea.toFixed(4),
      volume: volume.toFixed(4),
      svRatio: (surfaceArea / volume).toFixed(4),
    };
  },
};

// Ported from origin/2020's spherical-cap calculator (radius+sagitta driven).
export const sphericalCap: CalculatorSpec = {
  slug: "spherical-cap",
  title: "Spherical Cap",
  description: "Chord, area, and volume of a spherical cap from the sphere's radius and the cap's height (sagitta).",
  sections: [{
    title: "Cap",
    fields: [
      { id: "radius", label: "Sphere Radius", unit: "cm" },
      { id: "sagitta", label: "Cap Height (Sagitta)", unit: "cm" },
      { id: "chord", label: "Base Chord", unit: "cm", readOnly: true },
      { id: "area", label: "Curved Surface Area", unit: "cm²", readOnly: true },
      { id: "volume", label: "Volume", unit: "cm³", readOnly: true },
    ],
  }],
  defaults: { radius: "20", sagitta: "3" },
  calculate: (values) => {
    const r = num(values, "radius");
    const h = num(values, "sagitta");
    if (isNaN(r) || isNaN(h) || r <= 0 || h <= 0 || h > 2 * r) {
      return { ...values, chord: "", area: "", volume: "" };
    }
    const chord = 2 * Math.sqrt(2 * r * h - h * h);
    const area = 2 * Math.PI * r * h;
    const volume = ((Math.PI * h * h) / 3) * (3 * r - h);
    return { ...values, chord: chord.toFixed(4), area: area.toFixed(4), volume: volume.toFixed(4) };
  },
};

// Ported from origin/2024's box-volume calculator.
export const boxVolume: CalculatorSpec = {
  slug: "box-volume",
  title: "Box Volume",
  description: "Volume of a rectangular box from its length, width, and depth.",
  sections: [{
    title: "Dimensions",
    fields: [
      { id: "length", label: "Length", unit: "m" },
      { id: "width", label: "Width", unit: "m" },
      { id: "depth", label: "Depth", unit: "m" },
      { id: "volume", label: "Volume", unit: "m³", readOnly: true },
    ],
  }],
  defaults: { length: "0.5", width: "0.75", depth: "0.25" },
  calculate: (values) => {
    const l = num(values, "length"), w = num(values, "width"), d = num(values, "depth");
    if (isNaN(l) || isNaN(w) || isNaN(d)) return values;
    return { ...values, volume: (l * w * d).toFixed(6) };
  },
};

// Ported from origin/2024's cylinder-surface-area calculator.
export const cylinderSurfaceArea: CalculatorSpec = {
  slug: "cylinder-surface-area",
  title: "Cylinder Surface Area",
  description: "Total surface area of a cylinder (lateral surface plus both end caps).",
  sections: [{
    title: "Cylinder",
    fields: [
      { id: "radius", label: "Radius", unit: "m" },
      { id: "height", label: "Height", unit: "m" },
      { id: "circumference", label: "Circumference", unit: "m", readOnly: true },
      { id: "surfaceArea", label: "Surface Area", unit: "m²", readOnly: true },
    ],
  }],
  defaults: { radius: "0.3", height: "1" },
  calculate: (values) => {
    const r = num(values, "radius"), h = num(values, "height");
    if (isNaN(r) || isNaN(h)) return values;
    const circumference = 2 * Math.PI * r;
    const surfaceArea = circumference * h + 2 * Math.PI * r * r;
    return { ...values, circumference: circumference.toFixed(4), surfaceArea: surfaceArea.toFixed(4) };
  },
  notes: ["Reference: https://knifedogs.com/threads/heat-treat-oven-how-to-design-and-calculate-the-heating-elements.21072/"],
};
