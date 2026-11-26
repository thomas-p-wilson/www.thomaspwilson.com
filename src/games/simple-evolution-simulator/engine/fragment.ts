// Pre-genetic chemistry: the pure sequence mechanics for a Fragment (see
// engine/types.ts), independent of any SimulationState — mirrors
// engine/colony.ts's split (pure, testable graph algorithm here; per-tick
// orchestration, food/temperature bookkeeping, and graduation into a real
// Organism live in engine/simulation.ts's stepFragments).
//
// A fragment is deliberately not the same thing as an Organism-in-progress:
// it has no phenotype cache, no energy, no membrane. It's just a short base
// string that randomly grows, occasionally gets split by thermal shock, and
// either dissolves or — once it's long enough and happens to express the
// same "replication-rate" motif a real organism's genome does — graduates
// into one.
import { randomBase } from "./genome";
import type { Rng } from "./rng";
import { randomInt } from "./rng";
import type { Genome } from "./types";

/** A freshly nucleated fragment's length is drawn uniformly from this range —
 * long enough to be a real (if tiny) chain, short of anything that could
 * itself already express a gene (the shortest motif is 6 symbols = 18 bases). */
export const FRAGMENT_MIN_INITIAL_LENGTH = 6;
export const FRAGMENT_MAX_INITIAL_LENGTH = 12;

/** Below this length, thermal shock destroys a fragment outright rather than
 * splitting it — there's nothing left to call a second viable daughter. */
export const FRAGMENT_MIN_SPLIT_LENGTH = 6;

/** The gene id whose activation *is* graduation — see stepFragments in
 * simulation.ts. Deliberately the same "replication-rate" gene a real
 * organism's genome already uses (see todos/rna-world-replicator-stage.md):
 * self-replication capability is the one threshold that turns "chemistry"
 * into "life," not an arbitrary new motif invented just for this purpose. */
export const GRADUATION_GENE_ID = "replication-rate";

/** A brand-new fragment: a short run of random bases, no ancestry. */
export function randomFragmentSequence(rng: Rng): Genome {
  const length = FRAGMENT_MIN_INITIAL_LENGTH + randomInt(rng, FRAGMENT_MAX_INITIAL_LENGTH - FRAGMENT_MIN_INITIAL_LENGTH + 1);
  let out = "";
  for (let i = 0; i < length; i++) out += randomBase(rng);
  return out;
}

/** Appends one random base at a random end — template-free ligation, the
 * slow, real, catalyst-free chemistry that gets a chain started at all
 * (see stepFragments for the much faster catalyzed variant once a fragment
 * happens to already express something). */
export function growFragment(sequence: Genome, rng: Rng): Genome {
  const base = randomBase(rng);
  return rng() < 0.5 ? base + sequence : sequence + base;
}

/**
 * Thermal-shock splitting, standing in for real templated replication at this
 * primitive a stage (see the design discussion in todos/ — thermal/wet-dry
 * cycling separating an assembled duplex into independent strands is a real
 * hypothesized abiogenesis mechanism, not just flavor text): breaks `sequence`
 * near its midpoint (with a little jitter, so the two daughters aren't always
 * exactly equal) into two pieces, each still at least FRAGMENT_MIN_SPLIT_LENGTH
 * long. Returns null if `sequence` is too short to produce two viable
 * daughters at all — the caller treats that as the fragment being destroyed
 * outright rather than split.
 */
export function splitFragment(sequence: Genome, rng: Rng): [Genome, Genome] | null {
  if (sequence.length < FRAGMENT_MIN_SPLIT_LENGTH * 2) return null;
  const mid = Math.floor(sequence.length / 2);
  const jitter = randomInt(rng, 5) - 2; // -2..+2
  const breakPoint = Math.max(
    FRAGMENT_MIN_SPLIT_LENGTH,
    Math.min(sequence.length - FRAGMENT_MIN_SPLIT_LENGTH, mid + jitter),
  );
  return [sequence.slice(0, breakPoint), sequence.slice(breakPoint)];
}
