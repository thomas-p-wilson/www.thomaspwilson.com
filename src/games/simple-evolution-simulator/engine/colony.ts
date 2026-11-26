// Aggregative multicellularity ("come-together" colonies, e.g. Dictyostelium
// slime molds) as opposed to clonal ("stay-together") multicellularity, e.g.
// Volvox — see engine/genes.ts's surface-protein entry for the full framing.
// A colony here is nothing but the connected-components structure over
// currently-compatible-and-adjacent organism pairs: genuinely independent
// organisms (own genome, own energy, own reproduction — see engine/types.ts's
// Organism) that happen to recognize each other via a genome-encoded surface
// protein and stay bonded. No genetic or energy fusion happens anywhere in
// this module (see todos/chimeric-multi-genome-bodies.md for that, deferred).
//
// Compatibility is checked by direct sequence-vs-sequence comparison (see
// `areCompatible`), not by comparing each organism's independent match
// strength against the shared consensus motif — the latter would make any
// two organisms that both express the gene trivially "compatible with
// everyone" (converging on the same reference says nothing about whether they
// converged on *each other*). Direct comparison is what gives bonding real
// discriminating power: kin stay compatible, diverged lineages stop
// recognizing each other, unrelated lineages can converge by chance.
//
// Bonds are never stored as a persistent structure that needs explicit
// teardown — `computeColonies` recomputes connected components from scratch
// every call, from whatever edge list the caller currently has. An edge that
// no longer holds (sequence drift, organisms no longer adjacent, one died)
// simply isn't in `edges` next time, so bond-breaking "just happens" for
// free — see engine/simulation.ts's per-tick refresh for where `edges` comes
// from (actual Moore-adjacent organism pairs, recomputed every tick).
import type { GeneExpression, Organism } from "./types";

export const SURFACE_PROTEIN_GENE_ID = "surface-protein";

/**
 * Minimum Hamming similarity between two organisms' realized surface-protein
 * sequences for them to bond. At a 6-symbol motif, 0.75 permits at most one
 * symbol mismatch (5/6 ≈ 0.83 passes, 4/6 ≈ 0.67 doesn't) — a fairly strict,
 * kin-recognition-like bar.
 *
 * Empirically tuned (see todos/adhesion-compatibility-tuning.md for the full
 * writeup): swept every distinct discrete tier this threshold can land on for
 * a 6-symbol motif — exact-match-only (1.0), ≤1 mismatch (0.75, here), ≤2
 * (0.6), and ≤4 (0.3) — across 3 seeds, 12000 ticks each, default
 * environment/mutation config. Surface-protein expression itself evolves
 * readily (5-13 concurrent expressers out of a ~250-population world isn't
 * unusual), and bonding *does* happen at every tier tested — but colony size
 * never exceeded 3 members and colonies never persisted for long, regardless
 * of how loose or strict this threshold was. In other words: threshold
 * strictness, across its whole meaningful range, isn't what's actually
 * capping colony size or stability here — something else is (see
 * todos/multicellular-motility.md: a forming colony immediately losing all
 * foraging to sessility is the leading suspect, tackled next). Kept at 0.75
 * — the biologically-motivated middle tier — rather than loosened, since
 * loosening bought nothing empirically; revisit only if colony growth is
 * later unblocked and *then* shows real sensitivity to this number. Whether
 * it should eventually be evolvable per lineage instead of a fixed global
 * constant is still an open, deliberately deferred question.
 */
export const COLONY_COMPATIBILITY_THRESHOLD = 0.75;

function surfaceProteinExpression(organism: Organism): GeneExpression | undefined {
  return organism.phenotype.genes.find((g) => g.geneId === SURFACE_PROTEIN_GENE_ID);
}

/** Hamming similarity between two equal-length realized symbol sequences;
 * mismatched lengths (shouldn't happen — both come from the same fixed-length
 * motif) are treated as fully incompatible rather than throwing. */
export function sequenceSimilarity(a: string, b: string): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let mismatches = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) mismatches++;
  }
  return 1 - mismatches / a.length;
}

/**
 * Whether two organisms are compatible enough to bond, independent of
 * whether they're actually adjacent right now (see engine/simulation.ts for
 * the adjacency check, which is what actually gates whether an edge is added
 * this tick). Both organisms must have independently evolved the
 * surface-protein motif at all (genome-gated, same activation mechanism as
 * every other gene — silent by default) *and* their realized sequences at
 * that gene's best-matching window must clear `COLONY_COMPATIBILITY_THRESHOLD`.
 * Homophilic (similar binds similar) only, this pass — see
 * todos/heterophilic-adhesion-matching.md for the deferred opposite pattern.
 */
export function areCompatible(a: Organism, b: Organism): boolean {
  const ea = surfaceProteinExpression(a);
  const eb = surfaceProteinExpression(b);
  if (!ea?.active || !eb?.active) return false;
  return sequenceSimilarity(ea.matchedSequence, eb.matchedSequence) >= COLONY_COMPATIBILITY_THRESHOLD;
}

export interface ColonyGraph {
  /** organism id -> its colony's representative id (a union-find root; not
   * itself meaningful beyond equality — two organisms are colony-mates iff
   * this value is the same for both). */
  colonyOf: Map<string, string>;
  /** colony representative id -> member count, including solo organisms
   * (their own singleton "colony" of size 1). */
  colonySize: Map<string, number>;
}

/**
 * Connected components over an explicit compatible-and-adjacent edge list.
 * Deliberately takes plain ids + edges rather than reaching into
 * SimulationState/the grid itself, so it stays a pure, independently testable
 * graph algorithm — engine/simulation.ts owns figuring out which pairs of
 * organisms are actually Moore-adjacent this tick and compatible per
 * `areCompatible`, and hands the result in as `edges`.
 *
 * A single round of pairwise union() calls naturally produces 3+-member
 * colonies without any special-casing: if A-B and B-C are both edges, A and C
 * end up in the same component even though no edge connects them directly —
 * exactly the "connected-components" behavior real aggregation produces.
 */
export function computeColonies(organismIds: string[], edges: Array<[string, string]>): ColonyGraph {
  const parent = new Map<string, string>();
  for (const id of organismIds) parent.set(id, id);

  function find(id: string): string {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let cur = id;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  function union(a: string, b: string): void {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const [a, b] of edges) {
    if (!parent.has(a) || !parent.has(b)) continue; // defensive: ignore edges referencing unknown ids
    union(a, b);
  }

  const colonyOf = new Map<string, string>();
  const colonySize = new Map<string, number>();
  for (const id of organismIds) {
    const root = find(id);
    colonyOf.set(id, root);
    colonySize.set(root, (colonySize.get(root) ?? 0) + 1);
  }
  return { colonyOf, colonySize };
}
