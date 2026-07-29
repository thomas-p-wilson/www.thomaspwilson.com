// Generates a fixed, per-cell spatial temperature field so a planet's local
// climate varies by region rather than being one flat scalar everywhere (see
// todos/planetary-biomes.md). Built once at world creation from a handful of
// random "hot/cold" anchor points blended by inverse-distance weighting — a
// continuous field with no hard biome boundaries, closer to this project's
// "nothing hardcoded, everything emergent" ethos than a discrete enum of
// biome types, and cheap enough to build once and never touch again (no
// diffusion/decay to simulate every tick — see
// todos/morphogen-field-diffusion.md for the dynamic version of that idea).
import { randomInt, type Rng } from "./rng";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const MIN_ANCHORS = 3;
const MAX_ANCHORS = 6;
/** Max magnitude an anchor's own offset from the world's baseline temperature
 * can carry — keeps spatial swings meaningful without letting a single
 * anchor push a whole region all the way to the opposite thermal extreme. */
const ANCHOR_OFFSET_RANGE = 0.4;

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
export function generateBiomeOffsetField(width: number, height: number, rng: Rng): Float32Array {
  const anchorCount = MIN_ANCHORS + randomInt(rng, MAX_ANCHORS - MIN_ANCHORS + 1);
  const anchors: Anchor[] = [];
  for (let i = 0; i < anchorCount; i++) {
    anchors.push({ x: randomInt(rng, width), y: randomInt(rng, height), offset: (rng() * 2 - 1) * ANCHOR_OFFSET_RANGE });
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
