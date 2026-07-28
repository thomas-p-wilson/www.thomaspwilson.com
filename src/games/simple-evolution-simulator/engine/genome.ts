// Genome construction and the four mutation operators: point substitution,
// insertion, deletion, and duplication. Duplication is the operator that
// lets higher-order robustness (spare/backup gene copies) emerge from play
// rather than being hardcoded — a duplicated segment keeps functioning as
// the original while drifting independently once further point mutations
// land inside it.
//
// Genomes are modeled as single-stranded RNA (bases A/C/G/U) to match the
// "early RNA world" framing — no double-stranded DNA in this first pass.
import { BASES, symbolToCodon } from "./codonTable";
import { GENE_TABLE } from "./genes";
import type { Rng } from "./rng";
import { randomInt } from "./rng";
import type { Base, Genome, MutationConfig } from "./types";

/** Keeps genomes from mutating down to nothing or ballooning without bound. */
export const MIN_GENOME_LENGTH = 30;
export const MAX_GENOME_LENGTH = 1500;

export const DEFAULT_MUTATION_CONFIG: MutationConfig = {
  pointRate: 0.01,
  insertionRate: 0.04,
  deletionRate: 0.04,
  duplicationRate: 0.015,
};

export function scaleMutationConfig(config: MutationConfig, factor: number): MutationConfig {
  const f = Math.max(0, factor);
  return {
    pointRate: config.pointRate * f,
    insertionRate: config.insertionRate * f,
    deletionRate: config.deletionRate * f,
    duplicationRate: config.duplicationRate * f,
  };
}

export function randomBase(rng: Rng): Base {
  return BASES[randomInt(rng, BASES.length)];
}

export function randomGenome(length: number, rng: Rng): Genome {
  let out = "";
  for (let i = 0; i < length; i++) out += randomBase(rng);
  return out;
}

/** Each base independently has probability `rate` of substitution. */
export function pointMutate(genome: Genome, rate: number, rng: Rng): Genome {
  if (rate <= 0) return genome;
  let changed = false;
  const chars = genome.split("");
  for (let i = 0; i < chars.length; i++) {
    if (rng() < rate) {
      chars[i] = randomBase(rng);
      changed = true;
    }
  }
  return changed ? chars.join("") : genome;
}

/** With probability `rate`, inserts a short (1-3 base) random run at a random position. */
export function insertMutate(genome: Genome, rate: number, rng: Rng): Genome {
  if (rate <= 0 || rng() >= rate) return genome;
  if (genome.length >= MAX_GENOME_LENGTH) return genome;
  const position = randomInt(rng, genome.length + 1);
  const length = 1 + randomInt(rng, 3);
  const insertion = randomGenome(length, rng);
  return genome.slice(0, position) + insertion + genome.slice(position);
}

/** With probability `rate`, deletes a short (1-3 base) run at a random position. */
export function deleteMutate(genome: Genome, rate: number, rng: Rng): Genome {
  if (rate <= 0 || rng() >= rate) return genome;
  const room = genome.length - MIN_GENOME_LENGTH;
  if (room <= 0) return genome;
  const length = Math.min(1 + randomInt(rng, 3), room);
  const position = randomInt(rng, genome.length - length + 1);
  return genome.slice(0, position) + genome.slice(position + length);
}

/**
 * With probability `rate`, copies a contiguous segment (6-36 bases) and
 * splices the copy in elsewhere. The duplicate is functionally identical to
 * the source at the moment of duplication, but is a separate stretch of
 * sequence from then on — later point mutations can drift it into a new
 * gene, a dead pseudogene, or a redundant backup of the original, entirely
 * as a side effect of ordinary play rather than anything scripted.
 */
export function duplicateSegment(genome: Genome, rate: number, rng: Rng): Genome {
  if (rate <= 0 || rng() >= rate) return genome;
  if (genome.length < 6 || genome.length >= MAX_GENOME_LENGTH) return genome;
  const maxSegmentLength = Math.min(36, genome.length, MAX_GENOME_LENGTH - genome.length);
  if (maxSegmentLength < 6) return genome;
  const segmentLength = 6 + randomInt(rng, maxSegmentLength - 6 + 1);
  const start = randomInt(rng, genome.length - segmentLength + 1);
  const segment = genome.slice(start, start + segmentLength);
  const insertPosition = randomInt(rng, genome.length + 1);
  return genome.slice(0, insertPosition) + segment + genome.slice(insertPosition);
}

/** Applies all four mutation operators in sequence, then clamps to length bounds. */
export function mutate(genome: Genome, config: MutationConfig, rng: Rng): Genome {
  let result = genome;
  result = pointMutate(result, config.pointRate, rng);
  result = insertMutate(result, config.insertionRate, rng);
  result = deleteMutate(result, config.deletionRate, rng);
  result = duplicateSegment(result, config.duplicationRate, rng);
  if (result.length > MAX_GENOME_LENGTH) result = result.slice(0, MAX_GENOME_LENGTH);
  if (result.length < MIN_GENOME_LENGTH) result += randomGenome(MIN_GENOME_LENGTH - result.length, rng);
  return result;
}

/** Gene ids the primordial seed organism starts with fully activated. */
const SEED_ACTIVE_GENES = ["replication-rate", "membrane-stability", "metabolism-efficiency"];

/**
 * Builds the genome for the very first organism: exact copies of a small
 * handful of "minimal viable replicator" motifs (replication, membrane,
 * metabolism), joined by short random linkers, plus a random tail. Every
 * other seed gene (motility, mutation resistance, size, thermal tolerance,
 * pigment) starts silent and has to emerge from mutation/duplication over
 * subsequent generations — that's deliberate: it's the "simple replicator
 * evolving into a cell" arc the game is telling.
 */
export function createSeedGenome(rng: Rng): Genome {
  // Reading frame matters: translate() always reads codons starting at
  // position 0, so every random "linker" segment here is deliberately a
  // multiple of 3 bases — otherwise it would shift the frame and the motifs
  // spliced in afterward would land out of alignment and fail to match.
  const linkerLength = () => 3 * (1 + randomInt(rng, 3));

  let genome = randomGenome(3 * (2 + randomInt(rng, 3)), rng);
  for (const def of GENE_TABLE) {
    if (!SEED_ACTIVE_GENES.includes(def.id)) continue;
    for (const symbol of def.motif) genome += symbolToCodon(symbol);
    genome += randomGenome(linkerLength(), rng);
  }
  genome += randomGenome(3 * (8 + randomInt(rng, 10)), rng);
  return genome;
}
