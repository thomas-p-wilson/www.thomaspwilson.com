// Decodes a genome into a Phenotype: for each seed gene, slides a
// motif-length window across the *translated* genome and scores every
// position by Hamming similarity, keeping the best. That's the "fuzzy
// motif matching" — a close-but-imperfect match expresses the trait at
// partial strength, and crossing `activationThreshold` is the discrete
// "gene activates" event.
//
// `decode` is a pure function of the genome and is meant to be called only
// when a genome is created or mutated (see organism.ts) — the result is
// cached on the Organism and read by the simulation every tick without
// re-decoding.
import { translate } from "./codonTable";
import { GENE_TABLE } from "./genes";
import type { GeneExpression, Genome, Phenotype, TraitId } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface RegionMatch {
  geneId: string;
  label: string;
  trait: TraitId;
  strength: number;
  active: boolean;
  threshold: number;
}

/** Hamming-similarity match strength of `motif` against `symbols` at `symbolIndex`. */
function matchAtSymbolIndex(symbols: string, symbolIndex: number, motif: string): number {
  if (symbolIndex < 0 || symbolIndex + motif.length > symbols.length) return 0;
  let mismatches = 0;
  for (let j = 0; j < motif.length; j++) {
    if (symbols[symbolIndex + j] !== motif[j]) mismatches++;
  }
  return 1 - mismatches / motif.length;
}

/** Slides `motif` across the whole symbol string and returns the best window. */
function bestMatch(symbols: string, motif: string): { strength: number; symbolIndex: number } {
  if (symbols.length < motif.length) return { strength: 0, symbolIndex: 0 };
  let best = -Infinity;
  let bestIndex = 0;
  for (let i = 0; i + motif.length <= symbols.length; i++) {
    const strength = matchAtSymbolIndex(symbols, i, motif);
    if (strength > best) {
      best = strength;
      bestIndex = i;
    }
  }
  return { strength: best, symbolIndex: bestIndex };
}

export function decode(genome: Genome): Phenotype {
  const symbols = translate(genome);
  const genes: GeneExpression[] = GENE_TABLE.map((def) => {
    const { strength, symbolIndex } = bestMatch(symbols, def.motif);
    const active = strength >= def.activationThreshold;
    const normalized = active ? clamp01((strength - def.activationThreshold) / (1 - def.activationThreshold)) : 0;
    const value = active ? def.mapValue(normalized) : def.baseline;
    return {
      geneId: def.id,
      matchStrength: strength,
      active,
      value,
      windowStart: symbolIndex * 3,
      windowLength: def.motif.length * 3,
    };
  });

  const traits = {} as Record<TraitId, number>;
  GENE_TABLE.forEach((def, i) => {
    traits[def.trait] = genes[i].value;
  });

  return { traits, genes, activeGeneCount: genes.filter((g) => g.active).length };
}

/**
 * For a single base position, scores every gene's motif as if a window
 * started at that base's codon — regardless of whether it's that gene's
 * global best match. This is what powers the genome viewer's "click a
 * region to see what it matches" interaction: it's a per-click, per-gene
 * probe, not just a report of the pre-computed best windows.
 */
export function describeRegion(genome: Genome, baseIndex: number): RegionMatch[] {
  const symbols = translate(genome);
  const symbolIndex = Math.floor(baseIndex / 3);
  return GENE_TABLE.map((def) => {
    const strength = matchAtSymbolIndex(symbols, symbolIndex, def.motif);
    return {
      geneId: def.id,
      label: def.label,
      trait: def.trait,
      strength,
      active: strength >= def.activationThreshold,
      threshold: def.activationThreshold,
    };
  }).sort((a, b) => b.strength - a.strength);
}
