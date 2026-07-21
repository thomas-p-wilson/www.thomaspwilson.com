import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";
import { circleGeometry, circularSegment, cylinderVolume, paraboloidalCap, parabolicSegment, sphericalCap } from "./geometry";
import { materialMass } from "./materials";
import { MirrorProfileDiagram } from "@/components/calculators/diagrams/TelescopeDiagrams";

// Ported from origin/2021-rework/2022's telescopy calculator (functionally identical to
// 2019/2021; this is the most complete single implementation — origin/2024 split the same math
// across two half-finished pages). Migrated onto the generic spec system so its sagitta/dish/mass
// results delegate to the matching geometry/materials calculators instead of duplicating their
// formulas — each result's stat tile can expand into the calculator that actually produced it.

const GLASS_DENSITY_G_PER_CM3 = "2.579";
const STANDARD_GRAVITY_M_S2 = 9.80665;

const primaryTypeOptions = [
  { value: "spherical", label: "Spherical" },
  { value: "paraboloidal", label: "Paraboloidal" },
];
const primaryConstructionOptions = [
  { value: "ground", label: "Ground Blank" },
  { value: "meniscus", label: "Meniscus" },
];

// The spherical and paraboloidal branches delegate to different pairs of geometry calculators
// (circularSegment+sphericalCap vs. parabolicSegment+paraboloidalCap); centralized here so the
// sagitta/area/volume fields' subCalculators and calculate() pick the same pair consistently.
function dishSpecs(values: Record<string, string>) {
  return values.primaryType === "paraboloidal"
    ? { segment: parabolicSegment, cap: paraboloidalCap }
    : { segment: circularSegment, cap: sphericalCap };
}

// sphericalCap's "radius" is the sphere's radius (primary focal length); paraboloidalCap's
// "radius" is the base/aperture radius — same field id, different physical quantity, so the
// cap's prefill can't be shared as-is between the two profiles the way the field ids might suggest.
function capRadius(cap: CalculatorSpec, values: Record<string, string>): string {
  return cap === paraboloidalCap ? String(num(values, "apertureDiameter") / 2) : values.primaryFocalLength;
}

export const telescopeMirror: CalculatorSpec = {
  slug: "telescope-mirror",
  title: "Telescope Mirror Design",
  description: "Sagitta, dish geometry, and blank mass for a spherical or paraboloidal primary mirror, plus spin-casting speed.",
  sections: [
    {
      title: "System",
      fields: [
        { id: "apertureDiameter", label: "Aperture Diameter", unit: "cm", measure: "length" },
        { id: "systemFocalLength", label: "System Focal Length", unit: "cm", measure: "length" },
        { id: "apertureArea", label: "Aperture Area", unit: "cm²", readOnly: true, subCalculator: () => ({
          spec: circleGeometry,
          prefill: (values) => ({ radius: String(num(values, "apertureDiameter") / 2) }),
        }) },
        { id: "systemFocalRatio", label: "System f-ratio", readOnly: true },
        { id: "primaryFocalRatio", label: "Primary f-ratio", readOnly: true },
      ],
    },
    {
      title: "Primary Mirror",
      fields: [
        { id: "primaryType", label: "Profile", type: "select", options: primaryTypeOptions },
        { id: "primaryConstruction", label: "Construction", type: "select", options: primaryConstructionOptions },
        { id: "primaryFocalLength", label: "Primary Focal Length", unit: "cm", measure: "length" },
        { id: "primaryEdgeThickness", label: "Edge Thickness", unit: "cm", measure: "length" },
        {
          id: "primarySagitta", label: "Sagitta (Dish Depth)", unit: "cm", measure: "length", readOnly: true,
          subCalculator: (v) => {
            const { segment } = dishSpecs(v);
            return segment === parabolicSegment
              ? { spec: segment, prefill: (values) => ({ focalLength: values.primaryFocalLength, chord: values.apertureDiameter }) }
              : { spec: segment, prefill: (values) => ({ radius: values.primaryFocalLength, chord: values.apertureDiameter }) };
          },
        },
        {
          id: "primaryDishArea", label: "Dish Surface Area", unit: "cm²", readOnly: true,
          subCalculator: (v) => {
            const { cap } = dishSpecs(v);
            return { spec: cap, prefill: (values) => ({ radius: capRadius(cap, values), sagitta: values.primarySagitta }) };
          },
        },
        {
          id: "primaryDishVolume", label: "Dish Volume", unit: "cm3", measure: "volume", readOnly: true,
          subCalculator: (v) => {
            const { cap } = dishSpecs(v);
            return { spec: cap, prefill: (values) => ({ radius: capRadius(cap, values), sagitta: values.primarySagitta }) };
          },
        },
        {
          id: "primaryBlankVolume", label: "Starting Blank Volume", unit: "cm3", measure: "volume", readOnly: true,
          subCalculator: () => ({
            spec: cylinderVolume,
            prefill: (values) => ({ radius: String(num(values, "apertureDiameter") / 2), height: values.primaryEdgeThickness }),
          }),
        },
        {
          id: "primaryBlankMass", label: "Starting Blank Mass", unit: "g", measure: "mass", readOnly: true,
          subCalculator: () => ({
            spec: materialMass,
            prefill: (values) => ({ volume: values.primaryBlankVolume, density: GLASS_DENSITY_G_PER_CM3 }),
          }),
        },
        {
          id: "primaryMaterialVolume", label: "Remaining Material Volume", unit: "cm3", measure: "volume", readOnly: true,
          hidden: (v) => v.primaryConstruction !== "ground",
        },
        {
          id: "primaryMass", label: "Remaining Mass", unit: "g", measure: "mass", readOnly: true,
          hidden: (v) => v.primaryConstruction !== "ground",
          subCalculator: () => ({
            spec: materialMass,
            prefill: (values) => ({ volume: values.primaryMaterialVolume, density: GLASS_DENSITY_G_PER_CM3 }),
          }),
        },
        {
          id: "primaryRotationRadPerSec", label: "Spin-Cast Rotation", unit: "rad/s", measure: "frequency", readOnly: true,
          hidden: (v) => v.primaryType !== "paraboloidal",
        },
      ],
    },
  ],
  defaults: {
    apertureDiameter: "60.96",
    systemFocalLength: "182.88",
    primaryType: "paraboloidal",
    primaryConstruction: "ground",
    primaryFocalLength: "121.92",
    primaryEdgeThickness: "5",
  },
  calculate: (values) => {
    const apertureDiameter = num(values, "apertureDiameter");
    const systemFocalLength = num(values, "systemFocalLength");
    const primaryFocalLength = num(values, "primaryFocalLength");
    const primaryEdgeThickness = num(values, "primaryEdgeThickness");
    if ([apertureDiameter, systemFocalLength, primaryFocalLength, primaryEdgeThickness].some((n) => isNaN(n) || n <= 0)) {
      return values;
    }

    const apertureRadius = apertureDiameter / 2;
    const apertureArea = circleGeometry.calculate({ ...circleGeometry.defaults, radius: String(apertureRadius) }).area;
    const systemFocalRatio = systemFocalLength / apertureDiameter;
    const primaryFocalRatio = primaryFocalLength / apertureDiameter;

    // Delegated to circularSegment/parabolicSegment + sphericalCap/paraboloidalCap below, so their
    // own toFixed() rounding is what feeds the cap calculation — negligible (sub-micron) versus
    // computing everything in one unrounded pass, and it's what keeps the math in one place.
    const { segment, cap } = dishSpecs(values);
    const segmentResult = segment === parabolicSegment
      ? segment.calculate({ ...segment.defaults, focalLength: String(primaryFocalLength), chord: String(apertureDiameter) })
      : segment.calculate({ ...segment.defaults, radius: String(primaryFocalLength), chord: String(apertureDiameter) });
    const sagitta = segmentResult.sagitta;
    const capResult = cap.calculate({ ...cap.defaults, radius: capRadius(cap, values), sagitta });
    const dishArea = parseFloat(capResult.area);
    const dishVolume = parseFloat(capResult.volume);

    const blankVolumeResult = cylinderVolume.calculate({
      ...cylinderVolume.defaults, radius: String(apertureRadius), height: String(primaryEdgeThickness),
    });
    const blankVolume = parseFloat(blankVolumeResult.volume);
    const blankMass = parseFloat(
      materialMass.calculate({ ...materialMass.defaults, volume: blankVolumeResult.volume, density: GLASS_DENSITY_G_PER_CM3 }).mass,
    );

    const isGround = values.primaryConstruction === "ground";
    const materialVolume = isGround ? blankVolume - dishVolume : null;
    const mass = materialVolume != null
      ? parseFloat(materialMass.calculate({ ...materialMass.defaults, volume: String(materialVolume), density: GLASS_DENSITY_G_PER_CM3 }).mass)
      : null;

    const rotation = values.primaryType === "paraboloidal"
      ? Math.sqrt((STANDARD_GRAVITY_M_S2 * 100) / (2 * primaryFocalLength))
      : null;

    return {
      ...values,
      apertureArea,
      systemFocalRatio: `f/${systemFocalRatio.toFixed(2)}`,
      primaryFocalRatio: `f/${primaryFocalRatio.toFixed(2)}`,
      primarySagitta: sagitta,
      primaryDishArea: dishArea.toFixed(2),
      primaryDishVolume: dishVolume.toFixed(2),
      primaryBlankVolume: blankVolume.toFixed(2),
      primaryBlankMass: blankMass.toFixed(1),
      primaryMaterialVolume: materialVolume != null ? materialVolume.toFixed(2) : "",
      primaryMass: mass != null ? mass.toFixed(1) : "",
      primaryRotationRadPerSec: rotation != null ? rotation.toFixed(3) : "",
    };
  },
  notes: [
    "Sagitta: h = R − √(R² − a²) for spherical, h = a²/4f for paraboloidal.",
    "Blank density assumed to be soda-lime glass, 2.579 g/cm³. Spin-cast rotation: ω = √(g / 2f).",
  ],
  visual: (values) => (
    <MirrorProfileDiagram
      elements={[{
        role: "primary",
        apertureDiameter: num(values, "apertureDiameter"),
        focalLength: num(values, "primaryFocalLength"),
        sagitta: parseFloat(values.primarySagitta),
      }]}
    />
  ),
};
