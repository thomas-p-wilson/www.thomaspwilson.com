import { describe, expect, it } from "vitest";
import { telescopeMirror } from "./telescope";

describe("telescopeMirror", () => {
  const base = {
    apertureDiameter: "60.96",
    systemFocalLength: "182.88",
    primaryFocalLength: "121.92",
    primaryEdgeThickness: "5",
  };

  it("computes a smaller sagitta for a paraboloidal primary given the same aperture/focal length as spherical", () => {
    const spherical = telescopeMirror.calculate({ ...base, primaryType: "spherical", primaryConstruction: "ground" });
    const paraboloidal = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    expect(parseFloat(spherical.primarySagitta)).toBeGreaterThan(0);
    expect(parseFloat(paraboloidal.primarySagitta)).toBeGreaterThan(0);
    // Both should be a small fraction of the aperture radius for an f/2 mirror.
    expect(parseFloat(spherical.primarySagitta)).toBeLessThan(parseFloat(base.apertureDiameter) / 2);
  });

  it("only computes spin-cast rotation for a paraboloidal primary", () => {
    const spherical = telescopeMirror.calculate({ ...base, primaryType: "spherical", primaryConstruction: "ground" });
    const paraboloidal = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    expect(spherical.primaryRotationRadPerSec).toBe("");
    expect(paraboloidal.primaryRotationRadPerSec).not.toBe("");
  });

  it("only computes remaining material volume/mass for ground-blank construction", () => {
    const ground = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    const meniscus = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "meniscus" });
    expect(ground.primaryMaterialVolume).not.toBe("");
    expect(meniscus.primaryMaterialVolume).toBe("");
  });

  it("keeps material volume less than the starting blank volume", () => {
    const result = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    expect(parseFloat(result.primaryMaterialVolume)).toBeLessThan(parseFloat(result.primaryBlankVolume));
  });

  it("delegates sagitta/dish results to the matching sub-calculator for each profile", () => {
    const spherical = telescopeMirror.calculate({ ...base, primaryType: "spherical", primaryConstruction: "ground" });
    const sagittaSubCalc = telescopeMirror.sections[1].fields.find((f) => f.id === "primarySagitta")!.subCalculator!(spherical)!;
    expect(sagittaSubCalc.spec.slug).toBe("circular-segment");
    expect(sagittaSubCalc.prefill(spherical)).toEqual({ radius: spherical.primaryFocalLength, chord: spherical.apertureDiameter });

    const paraboloidal = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    const paraboloidalSagittaSubCalc = telescopeMirror.sections[1].fields.find((f) => f.id === "primarySagitta")!.subCalculator!(paraboloidal)!;
    expect(paraboloidalSagittaSubCalc.spec.slug).toBe("parabolic-segment");
  });
});
