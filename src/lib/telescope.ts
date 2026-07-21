// Ported from origin/2021-rework/2022's telescopy calculator (functionally
// identical to 2019/2021; this is the most complete single implementation —
// origin/2024 split the same math across two half-finished pages,
// parabolic-mirror and spin-cast-parabola, one of which referenced nested
// sub-calculator pages that didn't exist in that branch).

const GLASS_DENSITY_G_PER_CM3 = 2.579;
const STANDARD_GRAVITY_M_S2 = 9.80665;

export type PrimaryType = "spherical" | "paraboloidal";
export type PrimaryConstruction = "ground" | "meniscus";

export interface TelescopeInput {
  apertureDiameter: number; // cm
  systemFocalLength: number; // cm
  primaryType: PrimaryType;
  primaryConstruction: PrimaryConstruction;
  primaryFocalLength: number; // cm
  primaryEdgeThickness: number; // cm
}

export interface TelescopeResult {
  apertureRadius: number;
  apertureArea: number;
  systemFocalRatio: number;
  primaryFocalRatio: number;
  primarySagitta: number;
  primaryDishArea: number;
  primaryDishVolume: number;
  primaryBlankVolume: number;
  primaryBlankMass: number;
  primaryMaterialVolume: number | null;
  primaryMass: number | null;
  primaryRotationRadPerSec: number | null;
}

export function calculateTelescope(input: TelescopeInput): TelescopeResult {
  const { apertureDiameter, systemFocalLength, primaryType, primaryConstruction, primaryFocalLength, primaryEdgeThickness } = input;
  const apertureRadius = apertureDiameter / 2;
  const apertureArea = Math.PI * apertureRadius * apertureRadius;
  const systemFocalRatio = systemFocalLength / apertureDiameter;
  const primaryFocalRatio = primaryFocalLength / apertureDiameter;

  const sagitta = primaryType === "spherical"
    ? primaryFocalLength - Math.sqrt(primaryFocalLength * primaryFocalLength - apertureRadius * apertureRadius)
    : (apertureRadius * apertureRadius) / (4 * primaryFocalLength);

  const dishArea = primaryType === "spherical"
    ? 2 * Math.PI * primaryFocalLength * sagitta
    : Math.PI * apertureRadius * apertureRadius
      + ((Math.PI * apertureRadius) / (6 * sagitta * sagitta))
        * (Math.pow(apertureRadius * apertureRadius + 4 * sagitta * sagitta, 1.5) - Math.pow(apertureRadius, 3));

  const dishVolume = primaryType === "spherical"
    ? ((Math.PI * sagitta) / 6) * (3 * apertureRadius * apertureRadius + sagitta * sagitta)
    : (Math.PI * apertureRadius * apertureRadius * sagitta) / 2;

  const blankVolume = Math.PI * apertureRadius * apertureRadius * primaryEdgeThickness;
  const blankMass = GLASS_DENSITY_G_PER_CM3 * blankVolume;

  const materialVolume = primaryConstruction === "ground" ? blankVolume - dishVolume : null;
  const mass = materialVolume != null ? GLASS_DENSITY_G_PER_CM3 * materialVolume : null;

  const rotation = primaryType === "paraboloidal"
    ? Math.sqrt((STANDARD_GRAVITY_M_S2 * 100) / (2 * primaryFocalLength))
    : null;

  return {
    apertureRadius,
    apertureArea,
    systemFocalRatio,
    primaryFocalRatio,
    primarySagitta: sagitta,
    primaryDishArea: dishArea,
    primaryDishVolume: dishVolume,
    primaryBlankVolume: blankVolume,
    primaryBlankMass: blankMass,
    primaryMaterialVolume: materialVolume,
    primaryMass: mass,
    primaryRotationRadPerSec: rotation,
  };
}
