import { describe, expect, it } from "vitest";
import {
  FOOD_ANCHOR_OFFSET_RANGE, generateBiomeOffsetField, localFoodRegenRate, localTemperature,
  TEMPERATURE_ANCHOR_OFFSET_RANGE,
} from "./biome";
import { createRng } from "./rng";

describe("generateBiomeOffsetField", () => {
  it("is deterministic for a given seed", () => {
    const a = generateBiomeOffsetField(20, 15, createRng(7), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    const b = generateBiomeOffsetField(20, 15, createRng(7), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("produces a different field for a different seed", () => {
    const a = generateBiomeOffsetField(20, 15, createRng(7), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    const b = generateBiomeOffsetField(20, 15, createRng(8), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it("returns exactly width * height cells", () => {
    const field = generateBiomeOffsetField(12, 9, createRng(1), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    expect(field.length).toBe(12 * 9);
  });

  it("varies across the grid rather than settling to one flat value", () => {
    const field = generateBiomeOffsetField(40, 30, createRng(3), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    const min = Math.min(...field);
    const max = Math.max(...field);
    expect(max - min).toBeGreaterThan(0.05);
  });

  it("varies enough to give a map genuinely distinct hot and cold regions, not just a subtle tint", () => {
    // Regression coverage for the "not enough temperature difference between
    // biomes" tuning pass: at the original ANCHOR_OFFSET_RANGE (0.4), a
    // typical map's full min-to-max spread averaged only ~0.2 — a mismatch
    // too small to meaningfully discourage wandering into a worse-suited
    // region. TEMPERATURE_ANCHOR_OFFSET_RANGE (1.2) averages ~0.55-0.65
    // across world-size presets and many seeds; this asserts a real map
    // clears a much higher floor than the old value ever could.
    const field = generateBiomeOffsetField(34, 22, createRng(3), TEMPERATURE_ANCHOR_OFFSET_RANGE); // Medium preset
    expect(Math.max(...field) - Math.min(...field)).toBeGreaterThan(0.35);
  });

  it("is continuous: adjacent cells never differ by a huge jump", () => {
    // No hard biome boundaries — every anchor's influence is a smooth,
    // inverse-distance falloff, so neighboring cells should read similarly
    // even where the field is changing fastest. Threshold empirically set
    // above the observed worst case across world-size presets and 100 seeds
    // each at TEMPERATURE_ANCHOR_OFFSET_RANGE (~0.21) — still a small
    // fraction of the full offset range, i.e. a gradient, not a cliff.
    const width = 30;
    const height = 20;
    const field = generateBiomeOffsetField(width, height, createRng(5), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    let maxNeighborDiff = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const here = field[y * width + x];
        const right = field[y * width + ((x + 1) % width)];
        const down = field[((y + 1) % height) * width + x];
        maxNeighborDiff = Math.max(maxNeighborDiff, Math.abs(here - right), Math.abs(here - down));
      }
    }
    expect(maxNeighborDiff).toBeLessThan(0.28);
  });

  it("wraps toroidally: the field is continuous across the grid's seam, not just its interior", () => {
    const width = 24;
    const height = 16;
    const field = generateBiomeOffsetField(width, height, createRng(11), TEMPERATURE_ANCHOR_OFFSET_RANGE);
    let maxSeamDiff = 0;
    for (let y = 0; y < height; y++) {
      const left = field[y * width];
      const right = field[y * width + (width - 1)];
      maxSeamDiff = Math.max(maxSeamDiff, Math.abs(left - right));
    }
    expect(maxSeamDiff).toBeLessThan(0.28); // see rationale on the continuity test above
  });

  it("kept FOOD_ANCHOR_OFFSET_RANGE meaningfully smaller than TEMPERATURE_ANCHOR_OFFSET_RANGE", () => {
    // Deliberate: widening food richness the same way temperature was widened
    // would let cells clamp to exactly 0 regen far more often (see
    // localFoodRegenRate) — a bigger balance change than intended when food
    // richness was made spatial.
    expect(FOOD_ANCHOR_OFFSET_RANGE).toBeLessThan(TEMPERATURE_ANCHOR_OFFSET_RANGE);
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

describe("localFoodRegenRate", () => {
  it("scales the baseline by (1 + offset) rather than adding a flat amount", () => {
    const field = new Float32Array([0.5, -0.5, 0]);
    expect(localFoodRegenRate(0.2, field, 0)).toBeCloseTo(0.3, 5); // 0.2 * 1.5
    expect(localFoodRegenRate(0.2, field, 1)).toBeCloseTo(0.1, 5); // 0.2 * 0.5
    expect(localFoodRegenRate(0.2, field, 2)).toBeCloseTo(0.2, 5);
  });

  it("never goes negative even at a large negative offset", () => {
    const field = new Float32Array([-1.5]);
    expect(localFoodRegenRate(0.2, field, 0)).toBe(0);
  });
});
