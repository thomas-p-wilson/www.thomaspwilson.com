// The Organism model itself. Deliberately just data plus a tiny helper —
// nothing here runs every tick. `decode()` (the potentially nontrivial part)
// only runs when an organism is first created or born, never on every
// simulation step; see simulation.ts for the tick loop that reads
// `organism.phenotype` directly.
import { decode } from "./phenotype";
import type { Genome, Organism } from "./types";

export interface CreateOrganismParams {
  id: string;
  genome: Genome;
  x: number;
  y: number;
  energy: number;
  generation: number;
  parentIds: string[];
  birthTick: number;
}

export function createOrganism(params: CreateOrganismParams): Organism {
  return {
    id: params.id,
    genome: params.genome,
    phenotype: decode(params.genome),
    x: params.x,
    y: params.y,
    energy: params.energy,
    age: 0,
    generation: params.generation,
    parentIds: params.parentIds,
    birthTick: params.birthTick,
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
  });
}
