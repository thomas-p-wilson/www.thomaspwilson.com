import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";
import { circleGeometry, circularSegment, cylinderVolume, paraboloidalCap, parabolicSegment, sphericalCap } from "./geometry";
import { materialMass } from "./materials";
import { spinCastRotation } from "./physics";
import { MirrorProfileDiagram, type MirrorElement } from "@/components/calculators/diagrams/TelescopeDiagrams";

// Ported from origin/2021-rework/2022's telescopy calculator (functionally identical to
// 2019/2021; this is the most complete single implementation — origin/2024 split the same math
// across two half-finished pages). Migrated onto the generic spec system so its sagitta/dish/mass
// results delegate to the matching geometry/materials calculators instead of duplicating their
// formulas — each result's stat tile can expand into the calculator that actually produced it.

const GLASS_DENSITY_G_PER_CM3 = "2.579";
const DEFAULT_APERTURE_DIAMETER_CM = 60.96;
const DEG_PER_RAD = 180 / Math.PI;
const ARCSEC_PER_RAD = 206265;

const primaryTypeOptions = [
  { value: "spherical", label: "Spherical" },
  { value: "paraboloidal", label: "Paraboloidal" },
];
const primaryConstructionOptions = [
  { value: "ground", label: "Ground Blank" },
  { value: "meniscus", label: "Meniscus" },
];
const secondaryTypeOptions = [
  { value: "newtonian", label: "Newtonian (Flat Diagonal)" },
  { value: "cassegrain", label: "Cassegrain (Convex Secondary)" },
];
const secondarySolveForOptions = [
  { value: "magnification", label: "Magnification Factor" },
  { value: "focalLength", label: "Secondary Focal Length" },
];
const fovModeOptions = [
  { value: "visual", label: "Visual (Eyepiece)" },
  { value: "imaging", label: "Imaging (Camera)" },
];
const fovMethodOptions = [
  { value: "afov", label: "AFOV + Magnification" },
  { value: "fieldstop", label: "Field Stop" },
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

// A Cassegrain secondary's own (convex-mirror) focal length f2 relates to the primary focal length
// f1, back focus distance b, and magnification M via the mirror equation applied to the virtual
// object the secondary intercepts: |f2| = M(f1+b) / (M²-1). Solving that for M given f2 is the same
// relation rearranged into a quadratic; both directions require M > 1, since a convex secondary
// only makes sense as a magnifying (Cassegrain) configuration.
function cassegrainFocalLengthFromMagnification(f1: number, b: number, M: number): number | null {
  if (M <= 1) return null;
  return (M * (f1 + b)) / (M * M - 1);
}
function cassegrainMagnificationFromFocalLength(f1: number, b: number, f2: number): number | null {
  if (f2 <= 0) return null;
  const sumFb = f1 + b;
  const M = (sumFb + Math.sqrt(sumFb * sumFb + 4 * f2 * f2)) / (2 * f2);
  return M > 1 ? M : null;
}

export const telescopeMirror: CalculatorSpec = {
  slug: "telescope-mirror",
  title: "Telescope Mirror Design",
  description: "Sagitta, dish geometry, and blank mass for a spherical or paraboloidal primary mirror, plus spin-casting speed.",
  helpIntro: "This calculator works out the optical and physical properties of a reflecting telescope's mirror system, starting from your aperture and focal length. Each card has a matching description here — interact with either one to connect them.",
  sections: [
    {
      title: "System",
      help: "The aperture and any Barlow lens or focal reducer set the whole system's scale. System f-ratio compares the final focal length to the aperture — a lower number (e.g. f/4) gathers light faster but has a shallower depth of focus than a higher one (e.g. f/10).",
      fields: [
        { id: "apertureDiameter", label: "Aperture Diameter", unit: "cm", measure: "length" },
        { id: "barlowReducerFactor", label: "Barlow / Reducer Factor", unit: "×" },
        { id: "systemFocalLength", label: "System Focal Length", unit: "cm", measure: "length", readOnly: true },
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
      help: [
        "A spherical mirror is far easier to grind and test but only forms a perfect image at its exact center of curvature — fine for a slow (high f-ratio) mirror, but a fast one needs a true paraboloidal figure to avoid spherical aberration.",
        "A ground blank starts as a solid disc, with material removed down to the dish shape; a meniscus blank is already close to its final curve, so there's little left to grind away. A paraboloidal mirror can also be spin-cast instead of ground: spinning molten glass at just the right speed lets gravity and centrifugal force settle it into a paraboloid on their own.",
      ],
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
          subCalculator: () => ({
            spec: spinCastRotation,
            prefill: (values) => ({ focalLength: values.primaryFocalLength }),
          }),
        },
        {
          id: "primaryHoleDiameter", label: "Secondary Hole Diameter", unit: "cm", measure: "length", readOnly: true,
          hidden: (v) => !(v.secondaryEnabled === "true" && v.secondaryType === "cassegrain"),
          help: "The Cassegrain secondary reflects the beam back through a hole cut in the primary. This is the minimum diameter that hole needs at the primary's plane for the converging cone to pass through unvignetted — smaller than the secondary itself, since the beam has already narrowed by the time it gets there.",
        },
        {
          id: "primaryEffectiveArea", label: "Lighted Area (Obstruction Removed)", unit: "cm²", readOnly: true,
          hidden: (v) => v.secondaryEnabled !== "true",
          help: "How much of the primary's dish actually gathers light once the secondary's own silhouette is subtracted — the secondary sits in the incoming beam and shadows a same-sized patch of the primary regardless of type, so this uses its full physical diameter rather than the (Cassegrain-only) hole diameter.",
        },
      ],
    },
    {
      title: "Secondary Mirror",
      toggle: { id: "secondaryEnabled" },
      help: [
        "A Newtonian's flat diagonal simply redirects the converging cone 90° out to a side-mounted focuser, sized by how far in front of the primary's focus it needs to sit.",
        "A Cassegrain's convex secondary instead reflects the beam back through a hole in the primary, magnifying the effective focal length in the process — solve for either its magnification or its own physical focal length, whichever you actually know about the mirror.",
        "Either type obstructs part of the incoming light; the obstruction fields below show how much, and (for a Cassegrain) the Primary Mirror card shows how much dish area survives once its hole is cut.",
      ],
      fields: [
        { id: "secondaryType", label: "Type", type: "select", options: secondaryTypeOptions },
        {
          id: "secondaryToFocusDistance", label: "Secondary-to-Focus Distance", unit: "cm", measure: "length",
          hidden: (v) => v.secondaryType !== "newtonian",
        },
        {
          id: "secondaryMinorAxis", label: "Minor Axis (Diagonal Size)", unit: "cm", measure: "length", readOnly: true,
          hidden: (v) => v.secondaryType !== "newtonian",
        },
        {
          id: "secondarySolveFor", label: "Solve For", type: "select", options: secondarySolveForOptions,
          hidden: (v) => v.secondaryType !== "cassegrain",
          help: "Toggles which of the two fields below is the free input and which one gets solved for. If you already know the secondary's rated magnification (common for a commercial secondary), solve for its focal length; if you're grinding your own and know its curvature instead, solve for magnification.",
        },
        {
          id: "secondaryDiameter", label: "Secondary Diameter", unit: "cm", measure: "length",
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        {
          id: "secondaryMagnification", label: "Magnification Factor", unit: "×",
          readOnly: (v) => v.secondarySolveFor === "focalLength",
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        {
          id: "secondaryFocalLength", label: "Secondary Mirror Focal Length", unit: "cm", measure: "length",
          readOnly: (v) => v.secondarySolveFor !== "focalLength",
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        {
          id: "secondaryBackFocusDistance", label: "Back Focus Distance", unit: "cm", measure: "length",
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        {
          id: "secondaryDistanceFromPrimary", label: "Secondary-to-Primary Distance", unit: "cm", measure: "length", readOnly: true,
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        {
          id: "secondaryEffectiveFocalLength", label: "Effective Focal Length", unit: "cm", measure: "length", readOnly: true,
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        {
          id: "secondaryEffectiveFocalRatio", label: "Effective f-ratio", readOnly: true,
          hidden: (v) => v.secondaryType !== "cassegrain",
        },
        { id: "secondaryObstructionLinear", label: "Central Obstruction (Linear)", unit: "%", readOnly: true },
        { id: "secondaryObstructionArea", label: "Central Obstruction (Light Loss)", unit: "%", readOnly: true },
      ],
    },
    {
      title: "Field of View",
      toggle: { id: "fovEnabled" },
      help: "Visual mode estimates magnification and true field of view from an eyepiece's specs — either its apparent field of view (AFOV) or its physical field stop diameter, whichever the eyepiece's datasheet gives you. Imaging mode instead uses a camera sensor's dimensions and pixel size to estimate the framed field of view and the resulting arcseconds-per-pixel scale.",
      fields: [
        { id: "fovMode", label: "Mode", type: "select", options: fovModeOptions },
        {
          id: "fovMethod", label: "Method", type: "select", options: fovMethodOptions,
          hidden: (v) => v.fovMode !== "visual",
        },
        {
          id: "eyepieceFocalLength", label: "Eyepiece Focal Length", unit: "mm", measure: "length",
          hidden: (v) => v.fovMode !== "visual",
        },
        {
          id: "eyepieceAFOV", label: "Eyepiece AFOV", unit: "deg", measure: "angle",
          hidden: (v) => v.fovMode !== "visual" || v.fovMethod !== "afov",
        },
        {
          id: "eyepieceFieldStop", label: "Field Stop Diameter", unit: "mm", measure: "length",
          hidden: (v) => v.fovMode !== "visual" || v.fovMethod !== "fieldstop",
        },
        {
          id: "magnification", label: "Magnification", unit: "×", readOnly: true,
          hidden: (v) => v.fovMode !== "visual",
        },
        {
          id: "trueFOV", label: "True Field of View", unit: "deg", measure: "angle", readOnly: true,
          hidden: (v) => v.fovMode !== "visual",
        },
        {
          id: "sensorWidth", label: "Sensor Width", unit: "mm", measure: "length",
          hidden: (v) => v.fovMode !== "imaging",
        },
        {
          id: "sensorHeight", label: "Sensor Height", unit: "mm", measure: "length",
          hidden: (v) => v.fovMode !== "imaging",
        },
        {
          id: "pixelSize", label: "Pixel Size", unit: "um", measure: "length",
          hidden: (v) => v.fovMode !== "imaging",
        },
        {
          id: "fovWidth", label: "FOV Width", unit: "arcmin", measure: "angle", readOnly: true,
          hidden: (v) => v.fovMode !== "imaging",
        },
        {
          id: "fovHeight", label: "FOV Height", unit: "arcmin", measure: "angle", readOnly: true,
          hidden: (v) => v.fovMode !== "imaging",
        },
        {
          id: "pixelScale", label: "Pixel Scale", unit: "arcsec/px", readOnly: true,
          hidden: (v) => v.fovMode !== "imaging",
        },
      ],
    },
  ],
  defaults: {
    apertureDiameter: String(DEFAULT_APERTURE_DIAMETER_CM),
    barlowReducerFactor: "1",
    primaryType: "paraboloidal",
    primaryConstruction: "ground",
    primaryFocalLength: "121.92",
    primaryEdgeThickness: "5",
    secondaryEnabled: "false",
    secondaryType: "newtonian",
    // Sized so the diagonal clears the focuser by a reasonable margin out of the box: half the
    // aperture plus 5cm of clearance, in the absence of a user-supplied focuser drawtube spec.
    secondaryToFocusDistance: String(DEFAULT_APERTURE_DIAMETER_CM / 2 + 5),
    secondarySolveFor: "magnification",
    secondaryDiameter: "10",
    secondaryMagnification: "5",
    secondaryFocalLength: "29.57",
    secondaryBackFocusDistance: "20",
    fovEnabled: "false",
    fovMode: "visual",
    fovMethod: "afov",
    eyepieceFocalLength: "25",
    eyepieceAFOV: "52",
    eyepieceFieldStop: "23",
    sensorWidth: "23.5",
    sensorHeight: "15.6",
    pixelSize: "3.8",
  },
  calculate: (values) => {
    const apertureDiameter = num(values, "apertureDiameter");
    const primaryFocalLength = num(values, "primaryFocalLength");
    const primaryEdgeThickness = num(values, "primaryEdgeThickness");
    if ([apertureDiameter, primaryFocalLength, primaryEdgeThickness].some((n) => Number.isNaN(n) || n <= 0)) {
      return values;
    }
    const barlowReducerFactorInput = num(values, "barlowReducerFactor");
    const barlowReducerFactor = !Number.isNaN(barlowReducerFactorInput) && barlowReducerFactorInput > 0 ? barlowReducerFactorInput : 1;

    const apertureRadius = apertureDiameter / 2;
    const apertureArea = circleGeometry.calculate({ ...circleGeometry.defaults, radius: String(apertureRadius) }).area;
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
      ? parseFloat(spinCastRotation.calculate({ ...spinCastRotation.defaults, focalLength: String(primaryFocalLength) }).rotation)
      : null;

    // Newtonian minor axis sized for minimum on-axis illumination only (ignores the additional
    // allowance a fully-illuminated field of view would add) — a deliberate simplification, same
    // spirit as this file's other single-purpose formulas.
    let secondaryMinorAxis: number | null = null;
    let secondaryObstructionLinear: number | null = null;
    let secondaryObstructionArea: number | null = null;
    let secondaryMagnification: number | null = null;
    let secondaryFocalLength: number | null = null;
    let secondaryEffectiveFocalLength: number | null = null;
    let secondaryEffectiveFocalRatio: number | null = null;
    let secondaryDistanceFromPrimary: number | null = null;
    let primaryHoleDiameter: number | null = null;
    let primaryEffectiveArea: number | null = null;

    // Whichever secondary type is active, its physical diameter obstructs the same fraction of
    // the aperture — computed once here so both branches below feed the same obstruction formula.
    let obstructingDiameter: number | null = null;

    if (values.secondaryEnabled === "true") {
      if (values.secondaryType === "cassegrain") {
        const backFocusDistance = num(values, "secondaryBackFocusDistance");
        if (!Number.isNaN(backFocusDistance) && backFocusDistance > 0) {
          if (values.secondarySolveFor === "focalLength") {
            const f2 = num(values, "secondaryFocalLength");
            if (!Number.isNaN(f2) && f2 > 0) {
              secondaryMagnification = cassegrainMagnificationFromFocalLength(primaryFocalLength, backFocusDistance, f2);
              if (secondaryMagnification != null) secondaryFocalLength = f2;
            }
          } else {
            const M = num(values, "secondaryMagnification");
            if (!Number.isNaN(M) && M > 1) {
              secondaryMagnification = M;
              secondaryFocalLength = cassegrainFocalLengthFromMagnification(primaryFocalLength, backFocusDistance, M);
            }
          }

          if (secondaryMagnification != null) {
            secondaryEffectiveFocalLength = primaryFocalLength * secondaryMagnification;
            secondaryEffectiveFocalRatio = secondaryEffectiveFocalLength / apertureDiameter;
            // Secondary-to-primary spacing from the conjugate relation across the secondary:
            // magnification = (distance from secondary back to the final focus) / (distance from
            // secondary to the prime focus it's intercepting) — i.e. M = (d + b) / (f1 - d), solved for d.
            const d = (secondaryMagnification * primaryFocalLength - backFocusDistance) / (secondaryMagnification + 1);
            if (d > 0 && d < primaryFocalLength) secondaryDistanceFromPrimary = d;
          }
        }

        const secondaryDiameter = num(values, "secondaryDiameter");
        if (!Number.isNaN(secondaryDiameter) && secondaryDiameter > 0) {
          obstructingDiameter = secondaryDiameter;

          // The beam the secondary reflects narrows linearly from the secondary itself down to the
          // final focus; the hole through the primary sits partway along that cone, so its diameter
          // scales by similar triangles: holeDiameter = secondaryDiameter * b / (distanceFromPrimary + b).
          if (secondaryDistanceFromPrimary != null) {
            primaryHoleDiameter = (secondaryDiameter * backFocusDistance) / (secondaryDistanceFromPrimary + backFocusDistance);
          }
        }
      } else {
        const toFocus = num(values, "secondaryToFocusDistance");
        if (!Number.isNaN(toFocus) && toFocus > 0) {
          secondaryMinorAxis = (apertureDiameter * toFocus) / primaryFocalLength;
          obstructingDiameter = secondaryMinorAxis;
        }
      }

      if (obstructingDiameter != null) {
        secondaryObstructionLinear = (obstructingDiameter / apertureDiameter) * 100;
        secondaryObstructionArea = (secondaryObstructionLinear * secondaryObstructionLinear) / 100;
        // Whichever type, the secondary sits in the incoming beam and shadows a same-sized patch of
        // the primary — distinct from (and always ≥) the Cassegrain-only hole, which only has to
        // pass the already-narrowed outgoing beam.
        primaryEffectiveArea = dishArea - Math.PI * (obstructingDiameter / 2) ** 2;
      }
    }

    // System Focal Length is derived rather than a free input: primary focal length, amplified by
    // a Cassegrain secondary's magnification (if configured), then by a Barlow/reducer (if not 1×).
    const baseEffectiveFocalLength = secondaryEffectiveFocalLength ?? primaryFocalLength;
    const systemFocalLength = baseEffectiveFocalLength * barlowReducerFactor;
    const systemFocalRatio = systemFocalLength / apertureDiameter;

    let magnification: number | null = null;
    let trueFOV: number | null = null;
    let fovWidth: number | null = null;
    let fovHeight: number | null = null;
    let pixelScale: number | null = null;

    if (values.fovEnabled === "true") {
      const focalLengthMm = systemFocalLength * 10; // cm -> mm, to match eyepiece/sensor spec sheets
      if (values.fovMode === "imaging") {
        const sensorWidth = num(values, "sensorWidth");
        const sensorHeight = num(values, "sensorHeight");
        const pixelSize = num(values, "pixelSize");
        if (!Number.isNaN(sensorWidth) && sensorWidth > 0) fovWidth = 2 * Math.atan(sensorWidth / (2 * focalLengthMm)) * DEG_PER_RAD * 60;
        if (!Number.isNaN(sensorHeight) && sensorHeight > 0) fovHeight = 2 * Math.atan(sensorHeight / (2 * focalLengthMm)) * DEG_PER_RAD * 60;
        if (!Number.isNaN(pixelSize) && pixelSize > 0) pixelScale = (pixelSize / 1000 / focalLengthMm) * ARCSEC_PER_RAD;
      } else {
        const eyepieceFocalLength = num(values, "eyepieceFocalLength");
        if (!Number.isNaN(eyepieceFocalLength) && eyepieceFocalLength > 0) {
          magnification = focalLengthMm / eyepieceFocalLength;
          if (values.fovMethod === "fieldstop") {
            const fieldStop = num(values, "eyepieceFieldStop");
            if (!Number.isNaN(fieldStop) && fieldStop > 0) trueFOV = (fieldStop / focalLengthMm) * DEG_PER_RAD;
          } else {
            const afov = num(values, "eyepieceAFOV");
            if (!Number.isNaN(afov) && afov > 0 && magnification > 0) trueFOV = afov / magnification;
          }
        }
      }
    }

    return {
      ...values,
      barlowReducerFactor: barlowReducerFactor.toString(),
      systemFocalLength: systemFocalLength.toFixed(2),
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
      primaryHoleDiameter: primaryHoleDiameter != null ? primaryHoleDiameter.toFixed(2) : "",
      primaryEffectiveArea: primaryEffectiveArea != null ? primaryEffectiveArea.toFixed(2) : "",
      secondaryMinorAxis: secondaryMinorAxis != null ? secondaryMinorAxis.toFixed(2) : "",
      secondaryObstructionLinear: secondaryObstructionLinear != null ? secondaryObstructionLinear.toFixed(1) : "",
      secondaryObstructionArea: secondaryObstructionArea != null ? secondaryObstructionArea.toFixed(1) : "",
      // Whichever field this solveFor mode treats as the free input passes its raw string through
      // unchanged (already in `...values` above); only the derived side gets overwritten here.
      secondaryMagnification: values.secondarySolveFor === "focalLength"
        ? (secondaryMagnification != null ? secondaryMagnification.toFixed(2) : "")
        : values.secondaryMagnification,
      secondaryFocalLength: values.secondarySolveFor === "focalLength"
        ? values.secondaryFocalLength
        : (secondaryFocalLength != null ? secondaryFocalLength.toFixed(2) : ""),
      secondaryEffectiveFocalLength: secondaryEffectiveFocalLength != null ? secondaryEffectiveFocalLength.toFixed(2) : "",
      secondaryEffectiveFocalRatio: secondaryEffectiveFocalRatio != null ? `f/${secondaryEffectiveFocalRatio.toFixed(2)}` : "",
      secondaryDistanceFromPrimary: secondaryDistanceFromPrimary != null ? secondaryDistanceFromPrimary.toFixed(2) : "",
      magnification: magnification != null ? magnification.toFixed(1) : "",
      trueFOV: trueFOV != null ? trueFOV.toFixed(2) : "",
      fovWidth: fovWidth != null ? fovWidth.toFixed(1) : "",
      fovHeight: fovHeight != null ? fovHeight.toFixed(1) : "",
      pixelScale: pixelScale != null ? pixelScale.toFixed(2) : "",
    };
  },
  notes: [
    "Sagitta: h = R − √(R² − a²) for spherical, h = a²/4f for paraboloidal.",
    "Blank density assumed to be soda-lime glass, 2.579 g/cm³. Spin-cast rotation: ω = √(g / 2f).",
    "Newtonian minor axis sized for minimum on-axis illumination: d = D × (secondary-to-focus distance) / (primary focal length).",
    "Cassegrain effective focal length = primary focal length × magnification factor; secondary-to-primary spacing solved from the conjugate relation across the secondary given the desired back focus distance.",
    "Cassegrain secondary focal length: |f2| = M(f1+b) / (M²-1), from the mirror equation applied to the virtual object the secondary intercepts — solvable in either direction (magnification from focal length, or vice versa).",
    "Central obstruction (linear/area) uses the Newtonian minor axis or the Cassegrain secondary's diameter, whichever applies.",
    "Cassegrain primary hole diameter: the reflected cone narrows linearly from the secondary to the final focus, so the hole through the primary scales by similar triangles along that cone.",
    "System Focal Length = primary focal length × (Cassegrain magnification, if enabled) × Barlow/reducer factor.",
    "Field of view: true FOV = eyepiece AFOV / magnification, or field stop diameter / focal length (× 57.3°) for the field-stop method. Imaging FOV and pixel scale use the sensor/pixel dimensions and the system's effective focal length.",
  ],
  visual: (values) => {
    const elements: MirrorElement[] = [{
      role: "primary",
      apertureDiameter: num(values, "apertureDiameter"),
      focalLength: num(values, "primaryFocalLength"),
      sagitta: parseFloat(values.primarySagitta),
    }];
    if (values.secondaryEnabled === "true") {
      if (values.secondaryType === "cassegrain") {
        elements.push({
          role: "secondary",
          kind: "cassegrain",
          diameter: num(values, "secondaryDiameter"),
          effectiveFocalLength: parseFloat(values.secondaryEffectiveFocalLength),
          distanceFromPrimary: parseFloat(values.secondaryDistanceFromPrimary),
          backFocusDistance: num(values, "secondaryBackFocusDistance"),
        });
      } else {
        elements.push({
          role: "secondary",
          kind: "newtonian",
          toFocusDistance: num(values, "secondaryToFocusDistance"),
          minorAxis: parseFloat(values.secondaryMinorAxis),
        });
      }
    }
    return <MirrorProfileDiagram elements={elements} />;
  },
};
