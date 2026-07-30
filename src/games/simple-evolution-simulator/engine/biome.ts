// Generates fixed, per-cell spatial fields (temperature, food-regen
// "richness") so a planet's local climate and productivity vary by region
// rather than being flat scalars everywhere (see todos/planetary-biomes.md).
// Each field is built once at world creation from its own independent handful
// of random "high/low" anchor points blended by inverse-distance weighting —
// a continuous field with no hard biome boundaries, closer to this project's
// "nothing hardcoded, everything emergent" ethos than a discrete enum of
// biome types, and cheap enough to build once and never touch again (no
// diffusion/decay to simulate every tick — see
// todos/morphogen-field-diffusion.md for the dynamic version of that idea).
// Temperature and food-richness are generated from separate anchor sets, so
// hot/dry, hot/wet, cold/dry, and cold/wet regions can all emerge on the same
// planet rather than one axis being hardcoded to track the other.
import { randomInt, type Rng } from "./rng";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const MIN_ANCHORS = 3;
const MAX_ANCHORS = 6;

/**
 * Max magnitude an anchor's own offset can carry, passed to
 * `generateBiomeOffsetField` per field (temperature vs. food-richness need not
 * agree). Inverse-distance-squared weighting averages every anchor's pull at
 * every cell, so the realized field is always much flatter than this number
 * alone suggests — empirically, at 1.2, a typical map's full min-to-max
 * spread only averages ~0.55-0.65 (measured across world-size presets and
 * many seeds), not anywhere near 2x this value.
 */
export const TEMPERATURE_ANCHOR_OFFSET_RANGE = 1.5;
/** Food-richness kept at the original, smaller magnitude — widening it the
 * same way temperature was would let some cells' regen clamp to exactly 0
 * (see `localFoodRegenRate`) far more often, a real permanent-desert effect
 * that's a bigger balance change than this pass intended to make. */
export const FOOD_ANCHOR_OFFSET_RANGE = 0.4;

interface Anchor {
  x: number;
  y: number;
  offset: number;
}

function toroidalDistanceSq(ax: number, ay: number, bx: number, by: number, width: number, height: number): number {
  const dx = Math.min(Math.abs(ax - bx), width - Math.abs(ax - bx));
  const dy = Math.min(Math.abs(ay - by), height - Math.abs(ay - by));
  return dx * dx + dy * dy;
}

/**
 * Builds a `width * height` field of *offsets* from the world's baseline
 * temperature (not absolute temperatures) — see `localTemperature` for how a
 * cell's actual temperature combines this with the live baseline. Kept as an
 * offset (rather than baking the baseline in at generation time) so the
 * existing live "temperature" control can keep shifting the whole planet
 * uniformly without ever needing to regenerate this field.
 *
 * Each anchor's influence falls off with (toroidal-wrapped) distance
 * squared, softened by an epsilon scaled to the anchors' average spacing —
 * without that scaling, a small/huge world or a sparse/dense anchor count
 * would produce very differently "bumpy" fields for no in-game reason.
 */
export function generateBiomeOffsetField(width: number, height: number, rng: Rng, anchorOffsetRange: number): Float32Array {
  const anchorCount = MIN_ANCHORS + randomInt(rng, MAX_ANCHORS - MIN_ANCHORS + 1);
  const anchors: Anchor[] = [];
  for (let i = 0; i < anchorCount; i++) {
    anchors.push({ x: randomInt(rng, width), y: randomInt(rng, height), offset: (rng() * 2 - 1) * anchorOffsetRange });
  }

  const avgSpacing = Math.sqrt((width * height) / anchorCount);
  const epsilon = (avgSpacing * avgSpacing) / 4;

  const field = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let weightedSum = 0;
      let weightTotal = 0;
      for (const anchor of anchors) {
        const distSq = toroidalDistanceSq(x, y, anchor.x, anchor.y, width, height);
        const weight = 1 / (distSq + epsilon);
        weightedSum += weight * anchor.offset;
        weightTotal += weight;
      }
      field[y * width + x] = weightedSum / weightTotal;
    }
  }
  return field;
}

/** A cell's actual local temperature: the world's live baseline plus this
 * cell's fixed spatial offset, clamped back into the valid [0,1] range. */
export function localTemperature(baseTemperature: number, biomeOffset: Float32Array, index: number): number {
  return clamp01(baseTemperature + biomeOffset[index]);
}

/** A cell's actual local food-regeneration rate: the world's live baseline
 * scaled by this cell's fixed spatial richness offset. Combined
 * multiplicatively rather than additively (unlike temperature) — foodRegenRate
 * has no fixed 0..1 range to clamp into, so a relative modifier keeps a
 * "generous" cell some fraction richer/poorer regardless of the baseline's
 * own magnitude. Clamped at 0: a regen rate can't go negative. */
export function localFoodRegenRate(baseRegenRate: number, foodOffset: Float32Array, index: number): number {
  return Math.max(0, baseRegenRate * (1 + foodOffset[index]));
}
