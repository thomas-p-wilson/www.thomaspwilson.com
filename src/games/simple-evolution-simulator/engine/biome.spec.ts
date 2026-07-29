import { describe, expect, it } from "vitest";
import { generateBiomeOffsetField, localTemperature } from "./biome";
import { createRng } from "./rng";

describe("generateBiomeOffsetField", () => {
  it("is deterministic for a given seed", () => {
    const a = generateBiomeOffsetField(20, 15, createRng(7));
    const b = generateBiomeOffsetField(20, 15, createRng(7));
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("produces a different field for a different seed", () => {
    const a = generateBiomeOffsetField(20, 15, createRng(7));
    const b = generateBiomeOffsetField(20, 15, createRng(8));
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it("returns exactly width * height cells", () => {
    const field = generateBiomeOffsetField(12, 9, createRng(1));
    expect(field.length).toBe(12 * 9);
  });

  it("varies across the grid rather than settling to one flat value", () => {
    const field = generateBiomeOffsetField(40, 30, createRng(3));
    const min = Math.min(...field);
    const max = Math.max(...field);
    expect(max - min).toBeGreaterThan(0.05);
  });

  it("is continuous: adjacent cells never differ by a huge jump", () => {
    // No hard biome boundaries — every anchor's influence is a smooth,
    // inverse-distance falloff, so neighboring cells should read similarly
    // even where the field is changing fastest.
    const width = 30;
    const height = 20;
    const field = generateBiomeOffsetField(width, height, createRng(5));
    let maxNeighborDiff = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const here = field[y * width + x];
        const right = field[y * width + ((x + 1) % width)];
        const down = field[((y + 1) % height) * width + x];
        maxNeighborDiff = Math.max(maxNeighborDiff, Math.abs(here - right), Math.abs(here - down));
      }
    }
    expect(maxNeighborDiff).toBeLessThan(0.15);
  });

  it("wraps toroidally: the field is continuous across the grid's seam, not just its interior", () => {
    const width = 24;
    const height = 16;
    const field = generateBiomeOffsetField(width, height, createRng(11));
    let maxSeamDiff = 0;
    for (let y = 0; y < height; y++) {
      const left = field[y * width];
      const right = field[y * width + (width - 1)];
      maxSeamDiff = Math.max(maxSeamDiff, Math.abs(left - right));
    }
    expect(maxSeamDiff).toBeLessThan(0.15);
  });
});

describe("localTemperature", () => {
  it("adds the cell's offset to the baseline", () => {
    const field = new Float32Array([0.2, -0.3, 0]);
    expect(localTemperature(0.5, field, 0)).toBeCloseTo(0.7, 5);
    expect(localTemperature(0.5, field, 1)).toBeCloseTo(0.2, 5);
    expect(localTemperature(0.5, field, 2)).toBeCloseTo(0.5, 5);
  });

  it("clamps to [0, 1]", () => {
    const field = new Float32Array([0.9, -0.9]);
    expect(localTemperature(0.8, field, 0)).toBe(1);
    expect(localTemperature(0.1, field, 1)).toBe(0);
  });
});
