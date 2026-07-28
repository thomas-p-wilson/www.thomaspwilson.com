// Shared types for the evolution-simulator engine. Kept in one place so the
// codon table, genome/mutation operators, gene table, phenotype decoder,
// organism model, simulation loop, and lineage builder can all reference the
// same vocabulary without circular imports.

/** Single-stranded RNA-like alphabet — see design note in genome.ts. */
export type Base = "A" | "C" | "G" | "U";

/** A genome is just a string of `Base` characters; this alias documents intent. */
export type Genome = string;

/** One character of the translated (post-codon-table) symbol alphabet. */
export type Symbol = string;

export type TraitId =
  | "replicationRate"
  | "membraneStability"
  | "metabolismEfficiency"
  | "motility"
  | "mutationResistance"
  | "size"
  | "thermalTolerance"
  | "pigment"
  | "foraging"
  | "energyStorage";

/**
 * A seed gene family: a consensus motif in the *translated symbol* alphabet
 * (not raw bases — that indirection is what gives the codon table's
 * degeneracy somewhere to matter) plus how a fuzzy match against that motif
 * resolves into a trait value. See engine/genes.ts for the actual table and
 * engine/phenotype.ts for the matching/decode logic.
 */
export interface GeneDefinition {
  id: string;
  label: string;
  description: string;
  trait: TraitId;
  /** Consensus motif, written in the translated symbol alphabet. */
  motif: string;
  /** Minimum Hamming-similarity match strength (0..1) required to activate. */
  activationThreshold: number;
  /** Trait value while the gene is not active (below threshold). */
  baseline: number;
  /** Maps normalized post-threshold match strength (0..1) to a trait value. */
  mapValue: (normalizedStrength: number) => number;
}

/** Result of matching one gene's motif against a genome's best window. */
export interface GeneExpression {
  geneId: string;
  /** Raw best-window match strength in [0, 1], independent of threshold. */
  matchStrength: number;
  active: boolean;
  /** Resolved trait contribution — `baseline` when inactive. */
  value: number;
  /** Base-pair coordinates (not symbol coordinates) of the best-matching window. */
  windowStart: number;
  windowLength: number;
}

/**
 * The decoded, cached trait struct for a genome. Treated as a cache: computed
 * once via `decode()` whenever a genome is created or mutated, then read
 * directly by simulation logic every tick without re-decoding.
 */
export interface Phenotype {
  traits: Record<TraitId, number>;
  genes: GeneExpression[];
  activeGeneCount: number;
}

export interface MutationConfig {
  /** Probability, per base, of a point substitution. */
  pointRate: number;
  /** Probability, per reproduction event, of an insertion. */
  insertionRate: number;
  /** Probability, per reproduction event, of a deletion. */
  deletionRate: number;
  /** Probability, per reproduction event, of a segment duplication. */
  duplicationRate: number;
}

export interface Organism {
  id: string;
  genome: Genome;
  /** Cached decode(genome) — recomputed only when the genome changes. */
  phenotype: Phenotype;
  x: number;
  y: number;
  energy: number;
  age: number;
  generation: number;
  /** Asexual reproduction in this first pass, so at most one entry. */
  parentIds: string[];
  birthTick: number;
}

/** Permanent record kept even after an organism dies, for lineage/ancestry views. */
export interface LineageRecord {
  id: string;
  parentIds: string[];
  generation: number;
  birthTick: number;
  deathTick: number | null;
  genome: Genome;
}

export interface EnvironmentConfig {
  /** Normalized 0..1 "world temperature" — organisms have a preferred niche. */
  temperature: number;
  /** How much food regenerates per cell per tick. */
  foodRegenRate: number;
}

export interface WorldConfig {
  width: number;
  height: number;
}
