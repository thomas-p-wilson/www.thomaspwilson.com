// The Organism model itself. Deliberately just data plus a tiny helper —
// nothing here runs every tick. `decode()` (the potentially nontrivial part)
// only runs when an organism is first created or born, never on every
// simulation step; see simulation.ts for the tick loop that reads
// `organism.phenotype` directly.
import { decode } from "./phenotype";
import type { Genome, Organism } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** How much of `preferredTemperature` comes from developmental imprinting
 * (this organism's own birth site) vs. genetics (the heritable
 * `thermalTolerance` trait) — see `preferredTemperature` below. Kept low:
 * genetics stays the dominant, selectable signal; birth-site imprinting is a
 * secondary within-generation nudge, not a replacement for evolving actual
 * thermal tolerance. */
const THERMAL_IMPRINT_WEIGHT = 0.3;

export interface CreateOrganismParams {
  id: string;
  genome: Genome;
  x: number;
  y: number;
  energy: number;
  generation: number;
  parentIds: string[];
  birthTick: number;
  /** Local temperature of the cell this organism is being created on — see
   * `Organism.birthTemperature`. Defaults to the genome's own decoded
   * `thermalTolerance` (i.e. no imprinting effect) when the caller doesn't
   * know/care about a real spatial site, e.g. tests constructing an organism
   * off-grid. */
  birthTemperature?: number;
}

export function createOrganism(params: CreateOrganismParams): Organism {
  const phenotype = decode(params.genome);
  return {
    id: params.id,
    genome: params.genome,
    phenotype,
    x: params.x,
    y: params.y,
    energy: params.energy,
    age: 0,
    generation: params.generation,
    parentIds: params.parentIds,
    birthTick: params.birthTick,
    birthTemperature: params.birthTemperature ?? phenotype.traits.thermalTolerance,
  };
}

export function reproduce(params: {
  parent: Organism;
  childId: string;
  childGenome: Genome;
  x: number;
  y: number;
  childEnergy: number;
  birthTick: number;
  birthTemperature?: number;
}): Organism {
  return createOrganism({
    id: params.childId,
    genome: params.childGenome,
    x: params.x,
    y: params.y,
    energy: params.childEnergy,
    generation: params.parent.generation + 1,
    parentIds: [params.parent.id],
    birthTick: params.birthTick,
    birthTemperature: params.birthTemperature,
  });
}

/**
 * An organism's actual thermal niche — what its environment interactions
 * (thermal-mismatch cost, thermotaxis) are judged against — as opposed to
 * `phenotype.traits.thermalTolerance`, which is purely the heritable/mutable
 * genetic component. Blends that genetic tolerance with `birthTemperature`
 * (developmental imprinting from where this individual actually hatched), so
 * two organisms with identical genomes but different birth sites end up with
 * slightly different real preferences — see THERMAL_IMPRINT_WEIGHT.
 */
export function preferredTemperature(organism: Organism): number {
  return clamp01(
    THERMAL_IMPRINT_WEIGHT * organism.birthTemperature +
      (1 - THERMAL_IMPRINT_WEIGHT) * organism.phenotype.traits.thermalTolerance,
  );
}
