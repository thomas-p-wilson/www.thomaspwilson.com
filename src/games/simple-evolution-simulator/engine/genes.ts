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
  },
];
