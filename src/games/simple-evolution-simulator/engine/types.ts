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
  | "thermotaxis"
  | "energyStorage"
  | "surfaceProtein"
  | "structuralIntegrity"
  | "growthSuppression";

/**
 * Inputs a *regulatory* gene's `resolveStrength` can draw on to compose its
 * [0,1] "strength" (the same kind of number static genes get for free from
 * raw motif matching) — see `GeneDefinition.resolveStrength`.
 */
export interface RegulatoryContext {
  /** This gene's own motif-match strength against the genome — the same
   * genome-encoded Hamming-similarity mechanism static genes use. Regulatory
   * genes are still genome-encoded; only what gets *expressed* varies. */
  selfMatchStrength: number;
  /** Fraction (0..1) of an organism's Moore neighbors that currently belong to
   * its own *colony* — the connected component of compatible, adjacent
   * organisms recomputed fresh every tick (see engine/colony.ts and
   * engine/simulation.ts's per-tick colony refresh). 0 for an organism with no
   * bonded neighbors (including one with no colony at all); higher the more
   * of its neighbors are colony-mates rather than unrelated/incompatible
   * organisms or empty cells. This replaces the previous pass's "same body"
   * signal now that bodies no longer exist — same conceptual role (a
   * surface-vs-interior signal), new source (aggregation, not shared growth).
   * The only context signal this pass supports (see
   * todos/morphogen-field-diffusion.md, todos/planetary-biomes.md for signals
   * deliberately deferred). */
  neighborDensity: number;
  /** Already-resolved trait values of this gene's `dependsOn` list, in the
   * same order — the mechanism behind real developmental gene cascades (a
   * master regulator switching on downstream genes). */
  dependencyValues: number[];
}

/**
 * A seed gene family: a consensus motif in the *translated symbol* alphabet
 * (not raw bases — that indirection is what gives the codon table's
 * degeneracy somewhere to matter) plus how a fuzzy match against that motif
 * resolves into a trait value. See engine/genes.ts for the actual table and
 * engine/phenotype.ts for the matching/decode logic.
 *
 * `kind` splits genes into two evaluation strategies:
 *  - "static": decoded once from the genome at birth/mutation and cached on
 *    the organism's Phenotype — today's entire behavior, unchanged.
 *  - "regulatory": re-evaluated every tick, per cell, from `resolveStrength`
 *    (self motif-match + context + any `dependsOn` values) instead of the raw
 *    motif match alone. Still genome-gated (a genome that doesn't carry the
 *    motif at all never activates, regardless of context).
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
  kind: "static" | "regulatory";
  /** Regulatory only: other gene ids (static or regulatory) whose resolved
   * trait value feeds into this gene's `resolveStrength`. Static genes have
   * no dependencies in this pass. */
  dependsOn?: string[];
  /** Regulatory only: composes this gene's evaluation strength from its own
   * motif match, context, and any `dependsOn` values. Required whenever
   * `kind === "regulatory"`. */
  resolveStrength?: (ctx: RegulatoryContext) => number;
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
  /** The actual realized *translated-symbol* content at this gene's
   * best-matching window (length === this gene's motif length, alphabet
   * "0".."7" — see codonTable.ts) — as opposed to `matchStrength`/`value`,
   * which are both just derived scalars. Populated for every gene (cheap:
   * decode() already knows the window's location), but it only matters for
   * the surface-protein gene, which colony-bonding compares directly against
   * another organism's realized sequence at the same gene (see
   * engine/colony.ts) — direct sequence-vs-sequence comparison is what gives
   * bonding real discriminating power; comparing each organism's match
   * strength against the shared consensus motif instead would make any two
   * organisms that both express the gene trivially "compatible with
   * everyone," since converging on the same reference says nothing about
   * whether they converged on each other. */
  matchedSequence: string;
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

/**
 * An organism is exactly one genome, one cached *static* phenotype, one
 * energy pool, and one grid position — no shared bodies. Aggregative
 * multicellularity (see engine/colony.ts) bonds fully independent organisms
 * like this one together by proximity + surface-protein compatibility; it
 * never merges their genomes, energy, or identity. This is a deliberate
 * revert of an earlier "clonal body" pass (one genome/energy pool spread
 * across several connected grid cells) that modeled the wrong biological
 * pathway — see todos/chimeric-multi-genome-bodies.md for the (out of scope)
 * idea of actually fusing bodies, which this is not.
 */
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
  /** Local temperature (see engine/biome.ts) of the cell this organism was
   * born/seeded on, frozen at birth — this individual's own environment, not
   * a genome-encoded trait. Combined with the genetic `thermalTolerance` trait
   * to derive `preferredTemperature` (engine/organism.ts): a developmental
   * imprinting effect alongside the heritable one, so two siblings with
   * identical genomes but different birth sites can end up with slightly
   * different actual thermal niches. */
  birthTemperature: number;
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
  /** Normalized 0..1 planetary *baseline* temperature — organisms have a
   * preferred niche. A cell's actual local temperature also varies
   * spatially around this baseline (see engine/biome.ts's per-cell
   * `SimulationState.biomeOffset` and todos/planetary-biomes.md). */
  temperature: number;
  /** Global *baseline* food regeneration per cell per tick. A cell's actual
   * local regen rate also varies spatially around this baseline (see
   * engine/biome.ts's per-cell `SimulationState.foodOffset`), independently
   * of the temperature field, so a planet can have e.g. a hot-dry region and
   * a cold-wet one simultaneously (see todos/planetary-biomes.md). */
  foodRegenRate: number;
}

export interface WorldConfig {
  width: number;
  height: number;
}
