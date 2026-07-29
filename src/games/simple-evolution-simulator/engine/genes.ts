// The seed gene vocabulary. Each entry is *data*, not code — deliberately,
// so this table is the one place to extend when new trait ideas come up
// later. Genuinely novel trait combinations don't come from adding more rows
// here though: they emerge from mutation + duplication drifting a genome's
// motifs closer to (or away from) these consensus sequences (see
// phenotype.ts for the fuzzy matching and genome.ts for duplication).
//
// Motifs are written in the *translated symbol* alphabet ("0".."7"), not raw
// bases — see codonTable.ts. Keeping all motifs the same length keeps the
// matching code simple (fixed window size per gene) without losing anything;
// nothing about the design requires varying lengths.
//
// Every gene also declares a `kind`: "static" genes are decoded once from the
// genome and cached (engine/phenotype.ts's decode()); "regulatory" genes are
// re-evaluated every tick, per organism, from context (currently just
// colony-neighbor density — see engine/colony.ts and engine/regulation.ts)
// and, optionally, other genes' already-resolved values via `dependsOn`. Both
// kinds are still genome-gated through the same motif-matching mechanism;
// only what's *expressed* differs.
import type { GeneDefinition } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const GENE_TABLE: GeneDefinition[] = [
  {
    id: "replication-rate",
    label: "Replication Rate",
    description: "How eagerly this organism attempts to reproduce once it has enough energy.",
    trait: "replicationRate",
    motif: "012210",
    activationThreshold: 0.55,
    baseline: 0.08,
    mapValue: (s) => 0.12 + clamp01(s) * 0.55,
    kind: "static",
  },
  {
    id: "membrane-stability",
    label: "Membrane Stability",
    description: "Structural integrity — extends maximum lifespan.",
    trait: "membraneStability",
    motif: "345543",
    activationThreshold: 0.55,
    baseline: 0.35,
    mapValue: (s) => 0.4 + clamp01(s) * 0.6,
    kind: "static",
  },
  {
    id: "metabolism-efficiency",
    label: "Metabolism Efficiency",
    description: "How much energy is extracted from food consumed.",
    trait: "metabolismEfficiency",
    motif: "670076",
    activationThreshold: 0.55,
    baseline: 0.5,
    mapValue: (s) => 0.6 + clamp01(s) * 0.9,
    kind: "static",
  },
  {
    id: "motility",
    label: "Motility",
    description: "Probability of moving to an adjacent cell each tick.",
    trait: "motility",
    motif: "246642",
    activationThreshold: 0.6,
    baseline: 0.15,
    mapValue: (s) => 0.25 + clamp01(s) * 0.7,
    kind: "static",
  },
  {
    id: "mutation-resistance",
    label: "Mutation Resistance",
    description: "Dampens the mutation rate applied to this organism's offspring.",
    trait: "mutationResistance",
    motif: "531135",
    activationThreshold: 0.6,
    baseline: 0,
    mapValue: (s) => clamp01(s) * 0.85,
    kind: "static",
  },
  {
    id: "size",
    label: "Size",
    description: "Larger organisms cost more energy to maintain but live longer.",
    trait: "size",
    motif: "702207",
    activationThreshold: 0.6,
    baseline: 0.55,
    mapValue: (s) => 0.6 + clamp01(s) * 1.2,
    kind: "static",
  },
  {
    id: "thermal-tolerance",
    label: "Thermal Tolerance",
    description: "Preferred environment temperature niche (0 = cold, 1 = hot).",
    trait: "thermalTolerance",
    motif: "463364",
    activationThreshold: 0.6,
    baseline: 0.5,
    mapValue: (s) => clamp01(s),
    kind: "static",
  },
  {
    id: "pigment",
    label: "Pigment",
    description: "Purely cosmetic hue seed — no survival effect, just visual drift.",
    trait: "pigment",
    motif: "150051",
    activationThreshold: 0.5,
    baseline: 0.5,
    mapValue: (s) => clamp01(s),
    kind: "static",
  },
  {
    id: "foraging",
    label: "Foraging",
    description: "Bias movement toward the most food-rich free neighbor instead of a random one.",
    trait: "foraging",
    motif: "204402",
    activationThreshold: 0.6,
    baseline: 0.1,
    mapValue: (s) => 0.2 + clamp01(s) * 0.75,
    kind: "static",
  },
  {
    id: "energy-storage",
    label: "Energy Storage",
    description: "Raises the energy cap an organism can bank, buffering it against famine.",
    trait: "energyStorage",
    motif: "715517",
    activationThreshold: 0.55,
    baseline: 0.8,
    mapValue: (s) => 1 + clamp01(s) * 1.5,
    kind: "static",
  },
  {
    id: "surface-protein",
    label: "Surface Protein",
    description:
      "A recognition motif expressed on this organism's surface — the basis of aggregative multicellularity " +
      "(\"come-together\" colonies, like Dictyostelium slime molds, as opposed to \"stay-together\" clonal bodies). " +
      "Silent by default (baseline 0): an organism that hasn't evolved this motif can't bond with anyone, full stop, " +
      "the same genome-gated activation every other gene uses. What matters for bonding isn't this trait's scalar " +
      "value, though — it's the *actual realized sequence* at this gene's best-matching window (see " +
      "GeneExpression.matchedSequence), compared directly against another organism's realized sequence at the same " +
      "gene. Two organisms bond only if both express this gene *and* their realized sequences are similar enough " +
      "(homophilic matching — see engine/colony.ts and todos/heterophilic-adhesion-matching.md for the deferred " +
      "opposite-pattern mechanism). This is what lets closely related organisms recognize each other, diverged " +
      "lineages stop recognizing each other as mutations drift their sequences apart, and unrelated lineages " +
      "occasionally converge into compatibility by chance — real emergent kin-recognition structure that comparing " +
      "each organism only against a shared reference motif could never produce.",
    trait: "surfaceProtein",
    motif: "261162",
    activationThreshold: 0.6,
    baseline: 0,
    mapValue: (s) => clamp01(s),
    kind: "static",
  },
  // --- Regulatory genes -----------------------------------------------
  // Re-evaluated every tick, per cell, instead of decoded once at birth.
  // Both are still genome-gated (their own motif has to be present at all,
  // same Hamming-similarity mechanism as static genes) — only *whether* and
  // *how strongly* that genomic potential gets expressed varies by context.
  {
    id: "structural-reinforcement",
    label: "Structural Reinforcement",
    description:
      "A defensive/structural trait expressed where an organism is buffered inside its own colony — driven by " +
      "colony-neighbor density (the fraction of an organism's Moore neighbors that are fellow members of its own " +
      "colony, the connected component of compatible, bonded organisms — see engine/colony.ts), not just genome " +
      "content. A solo organism sits at density 0 and stays unreinforced regardless of genome; even a bonded pair " +
      "(density 1/8 for each member) can meaningfully express it if its own motif match is strong, with expression " +
      "rising — at steep diminishing returns, a 4th-root curve, see resolveStrength below — toward a colony's " +
      "deeply-embedded interior. Mechanically, this directly reduces upkeep (see engine/simulation.ts's " +
      "feedAndAge) — the real fitness payoff that gives clustering a reason to persist instead of being cosmetic. " +
      "When this gene was tuned, colonies were still unconditionally sessile and foraging-locked (a since-reverted " +
      "blanket simplification — see engine/simulation.ts's moveColony and todos/multicellular-motility.md), which " +
      "made bonding a real, substantial cost. A first attempt at a linear density scaling (matching the previous, " +
      "now-reverted clonal-body pass, where a grown body's interior cell could easily reach density 1.0) left a " +
      "bonded *pair* (the smallest, most common, and most fragile colony) with only a token 0.125-strength " +
      "contribution, too weak to ever outweigh lost foraging in an empirical long run — every bonded pair starved " +
      "within ~10-20 ticks regardless of how the cost-reduction magnitude was tuned. The 4th-root curve and low " +
      "activation threshold below are the retuned fix: a pair now gets a real, non-token share of the benefit " +
      "immediately (roughly 2-3x longer survival empirically, under the sessile model that tuning ran against), " +
      "with more members still adding further benefit at a diminishing rate rather than linearly — see " +
      "STRUCTURAL_REINFORCEMENT_COST_REDUCTION's doc comment in simulation.ts for the full empirical story, and " +
      "todos/adhesion-compatibility-tuning.md for the adjacent, still-open question of the bonding threshold " +
      "itself.",
    trait: "structuralIntegrity",
    motif: "417414",
    activationThreshold: 0.08,
    baseline: 0.1,
    mapValue: (s) => 0.2 + clamp01(s) * 0.8,
    kind: "regulatory",
    resolveStrength: ({ selfMatchStrength, neighborDensity }) => selfMatchStrength * Math.pow(neighborDensity, 0.25),
  },
  {
    id: "growth-suppression",
    label: "Growth Suppression",
    description:
      "Downstream of Structural Reinforcement: once an organism's local structural expression is high enough — " +
      "deep inside a colony, well-reinforced — this reduces its own effective replication rate (see " +
      "engine/simulation.ts's maybeReproduce), the same way real differentiated interior tissue specializes away " +
      "from proliferation. A division-of-labor trade-off now that there's no body-internal cell division to " +
      "suppress: deeply embedded colony members (cheaper to maintain, thanks to Structural Reinforcement) " +
      "reproduce less; exposed/surface members and solo organisms reproduce at their full genomic rate. A genuine " +
      "two-step developmental cascade either way: this gene's own motif has to be present *and* the upstream gene " +
      "has to already be strongly expressed for this organism.",
    trait: "growthSuppression",
    motif: "531753",
    activationThreshold: 0.45,
    baseline: 0,
    mapValue: (s) => clamp01(s),
    kind: "regulatory",
    dependsOn: ["structural-reinforcement"],
    resolveStrength: ({ selfMatchStrength, dependencyValues }) => selfMatchStrength * clamp01(dependencyValues[0] ?? 0),
  },
];
