import { describe, expect, it } from "vitest";
import { calculateTelescope } from "./telescope";

describe("calculateTelescope", () => {
  const base = {
    apertureDiameter: 60.96,
    systemFocalLength: 182.88,
    primaryFocalLength: 121.92,
    primaryEdgeThickness: 5,
  };

  it("computes a smaller sagitta for a paraboloidal primary given the same aperture/focal length as spherical", () => {
    const spherical = calculateTelescope({ ...base, primaryType: "spherical", primaryConstruction: "ground" });
    const paraboloidal = calculateTelescope({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    expect(spherical.primarySagitta).toBeGreaterThan(0);
    expect(paraboloidal.primarySagitta).toBeGreaterThan(0);
    // Both should be a small fraction of the aperture radius for an f/2 mirror.
    expect(spherical.primarySagitta).toBeLessThan(base.apertureDiameter / 2);
  });

  it("only computes spin-cast rotation for a paraboloidal primary", () => {
    const spherical = calculateTelescope({ ...base, primaryType: "spherical", primaryConstruction: "ground" });
    const paraboloidal = calculateTelescope({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    expect(spherical.primaryRotationRadPerSec).toBeNull();
    expect(paraboloidal.primaryRotationRadPerSec).not.toBeNull();
  });

  it("only computes remaining material volume/mass for ground-blank construction", () => {
    const ground = calculateTelescope({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    const meniscus = calculateTelescope({ ...base, primaryType: "paraboloidal", primaryConstruction: "meniscus" });
    expect(ground.primaryMaterialVolume).not.toBeNull();
    expect(meniscus.primaryMaterialVolume).toBeNull();
  });

  it("keeps material volume less than the starting blank volume", () => {
    const result = calculateTelescope({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    expect(result.primaryMaterialVolume).toBeLessThan(result.primaryBlankVolume);
  });
});
