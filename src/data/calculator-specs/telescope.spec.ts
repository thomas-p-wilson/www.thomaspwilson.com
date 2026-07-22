import { describe, expect, it } from "vitest";
import { telescopeMirror } from "./telescope";

describe("telescopeMirror", () => {
  const base = {
    apertureDiameter: "60.96",
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

  it("delegates spin-cast rotation to the spin-cast-rotation sub-calculator", () => {
    const paraboloidal = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground" });
    const field = telescopeMirror.sections[1].fields.find((f) => f.id === "primaryRotationRadPerSec")!;
    const subCalc = field.subCalculator!(paraboloidal)!;
    expect(subCalc.spec.slug).toBe("spin-cast-rotation");
    expect(subCalc.prefill(paraboloidal)).toEqual({ focalLength: paraboloidal.primaryFocalLength });
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

  it("leaves every secondary-mirror result blank while the section is disabled", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false", secondaryType: "newtonian",
    });
    expect(result.secondaryMinorAxis).toBe("");
    expect(result.secondaryObstructionLinear).toBe("");
    expect(result.secondaryObstructionArea).toBe("");
    expect(result.secondaryEffectiveFocalLength).toBe("");
    expect(result.secondaryEffectiveFocalRatio).toBe("");
  });

  it("sizes a Newtonian secondary from the secondary-to-focus distance", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "newtonian", secondaryToFocusDistance: "15",
    });
    // d = D * distance / f = 60.96 * 15 / 121.92 = 7.5
    expect(parseFloat(result.secondaryMinorAxis)).toBeCloseTo(7.5, 2);
    expect(parseFloat(result.secondaryObstructionLinear)).toBeCloseTo((7.5 / 60.96) * 100, 1);
    expect(result.secondaryEffectiveFocalLength).toBe("");
  });

  it("computes a Cassegrain's effective focal length from the primary and the magnification factor", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain", secondaryMagnification: "5", secondaryBackFocusDistance: "20",
    });
    expect(parseFloat(result.secondaryEffectiveFocalLength)).toBeCloseTo(121.92 * 5, 2);
    expect(result.secondaryEffectiveFocalRatio).toBe(`f/${((121.92 * 5) / 60.96).toFixed(2)}`);
    expect(result.secondaryMinorAxis).toBe("");
  });

  it("computes central obstruction for a Cassegrain secondary from its diameter, same as a Newtonian's minor axis", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain",
      secondaryMagnification: "5", secondaryBackFocusDistance: "20", secondaryDiameter: "10",
    });
    const expectedLinear = (10 / 60.96) * 100;
    expect(parseFloat(result.secondaryObstructionLinear)).toBeCloseTo(expectedLinear, 1);
    expect(parseFloat(result.secondaryObstructionArea)).toBeCloseTo((expectedLinear * expectedLinear) / 100, 1);
  });

  it("solves Cassegrain magnification from a given secondary focal length, consistent with the reverse direction", () => {
    const b = 20, M = 5;
    const forward = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain", secondarySolveFor: "magnification",
      secondaryMagnification: String(M), secondaryBackFocusDistance: String(b), secondaryDiameter: "10",
    });
    const f2 = parseFloat(forward.secondaryFocalLength);
    expect(f2).toBeGreaterThan(0);

    const reverse = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain", secondarySolveFor: "focalLength",
      secondaryFocalLength: String(f2), secondaryBackFocusDistance: String(b), secondaryDiameter: "10",
    });
    expect(parseFloat(reverse.secondaryMagnification)).toBeCloseTo(M, 2);
    // Loose tolerance: f2 was itself rounded via toFixed(2) on the way out of `forward`, so the
    // round trip through the quadratic solver picks up a bit of additional floating-point drift.
    expect(parseFloat(reverse.secondaryEffectiveFocalLength)).toBeCloseTo(parseFloat(forward.secondaryEffectiveFocalLength), 0);
    // The free-input side of whichever mode is active should pass through untouched.
    expect(reverse.secondaryFocalLength).toBe(String(f2));
    expect(forward.secondaryMagnification).toBe(String(M));
  });

  it("sizes a Cassegrain's primary hole from the narrowed outgoing beam, smaller than the secondary itself", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain",
      secondaryMagnification: "5", secondaryBackFocusDistance: "20", secondaryDiameter: "10",
    });
    expect(parseFloat(result.primaryHoleDiameter)).toBeGreaterThan(0);
    // The cone has narrowed by the time it reaches the primary, so the hole is smaller than the secondary itself.
    expect(parseFloat(result.primaryHoleDiameter)).toBeLessThan(10);
  });

  it("computes the primary's lighted area from the secondary's full silhouette, for either type", () => {
    const cassegrain = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain",
      secondaryMagnification: "5", secondaryBackFocusDistance: "20", secondaryDiameter: "10",
    });
    // Unlike the hole (which only has to pass the narrowed outgoing beam), the lighted area is
    // reduced by the secondary's actual physical diameter, since that's what shadows the primary
    // in the incoming beam.
    const expectedCassegrain = parseFloat(cassegrain.primaryDishArea) - Math.PI * (10 / 2) ** 2;
    expect(parseFloat(cassegrain.primaryEffectiveArea)).toBeCloseTo(expectedCassegrain, 1);

    const newtonian = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "newtonian", secondaryToFocusDistance: "15",
    });
    // d = D * distance / f = 60.96 * 15 / 121.92 = 7.5 (same minor-axis derivation as the obstruction test above).
    const expectedNewtonian = parseFloat(newtonian.primaryDishArea) - Math.PI * (7.5 / 2) ** 2;
    expect(parseFloat(newtonian.primaryEffectiveArea)).toBeCloseTo(expectedNewtonian, 1);
  });

  it("leaves the primary's hole field blank for a Newtonian secondary, which has none", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "newtonian", secondaryToFocusDistance: "15",
    });
    expect(result.primaryHoleDiameter).toBe("");
  });

  it("derives the Cassegrain secondary-to-primary spacing from the back focus distance", () => {
    const f1 = 121.92, M = 5, b = 20;
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain", secondaryMagnification: String(M), secondaryBackFocusDistance: String(b),
    });
    // d = (M*f1 - b) / (M+1)
    const expectedD = (M * f1 - b) / (M + 1);
    expect(parseFloat(result.secondaryDistanceFromPrimary)).toBeCloseTo(expectedD, 2);
    expect(expectedD).toBeGreaterThan(0);
    expect(expectedD).toBeLessThan(f1);
  });

  it("derives System Focal Length from the primary alone when no secondary or Barlow/reducer is active", () => {
    const result = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false" });
    expect(parseFloat(result.systemFocalLength)).toBeCloseTo(121.92, 2);
  });

  it("chains Barlow/reducer factor onto System Focal Length", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false", barlowReducerFactor: "2",
    });
    expect(parseFloat(result.systemFocalLength)).toBeCloseTo(121.92 * 2, 2);
  });

  it("chains Cassegrain magnification and then Barlow/reducer onto System Focal Length", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground",
      secondaryEnabled: "true", secondaryType: "cassegrain", secondaryMagnification: "5", secondaryBackFocusDistance: "20",
      barlowReducerFactor: "1.5",
    });
    expect(parseFloat(result.systemFocalLength)).toBeCloseTo(121.92 * 5 * 1.5, 2);
  });

  it("computes true field of view from AFOV and magnification", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false",
      fovEnabled: "true", fovMode: "visual", fovMethod: "afov", eyepieceFocalLength: "25", eyepieceAFOV: "52",
    });
    const magnification = (121.92 * 10) / 25; // cm -> mm
    expect(parseFloat(result.magnification)).toBeCloseTo(magnification, 1);
    expect(parseFloat(result.trueFOV)).toBeCloseTo(52 / magnification, 2);
  });

  it("computes true field of view from field stop diameter", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false",
      fovEnabled: "true", fovMode: "visual", fovMethod: "fieldstop", eyepieceFocalLength: "25", eyepieceFieldStop: "23",
    });
    const focalLengthMm = 121.92 * 10;
    expect(parseFloat(result.trueFOV)).toBeCloseTo((23 / focalLengthMm) * (180 / Math.PI), 2);
  });

  it("computes imaging FOV and pixel scale from sensor dimensions", () => {
    const result = telescopeMirror.calculate({
      ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false",
      fovEnabled: "true", fovMode: "imaging", sensorWidth: "23.5", sensorHeight: "15.6", pixelSize: "3.8",
    });
    const focalLengthMm = 121.92 * 10;
    const expectedWidth = 2 * Math.atan(23.5 / (2 * focalLengthMm)) * (180 / Math.PI) * 60;
    const expectedPixelScale = (3.8 / 1000 / focalLengthMm) * 206265;
    expect(parseFloat(result.fovWidth)).toBeCloseTo(expectedWidth, 1);
    expect(parseFloat(result.pixelScale)).toBeCloseTo(expectedPixelScale, 2);
  });

  it("leaves every FOV result blank while the section is disabled", () => {
    const result = telescopeMirror.calculate({ ...base, primaryType: "paraboloidal", primaryConstruction: "ground", secondaryEnabled: "false", fovEnabled: "false" });
    expect(result.magnification).toBe("");
    expect(result.trueFOV).toBe("");
    expect(result.fovWidth).toBe("");
    expect(result.fovHeight).toBe("");
    expect(result.pixelScale).toBe("");
  });
});
