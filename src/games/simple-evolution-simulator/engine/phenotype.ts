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
import { GENE_EVALUATION_ORDER } from "./regulation";
import type { GeneDefinition, GeneExpression, Genome, Phenotype, RegulatoryContext, TraitId } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const GENE_BY_ID = new Map(GENE_TABLE.map((def) => [def.id, def] as const));

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

/** The active/value pair every gene resolves to once its [0,1] "strength" is
 * known — the threshold + mapValue step every gene (static or regulatory)
 * shares. */
function activateFromStrength(def: GeneDefinition, strength: number): { active: boolean; value: number } {
  const active = strength >= def.activationThreshold;
  const normalized = active ? clamp01((strength - def.activationThreshold) / (1 - def.activationThreshold)) : 0;
  return { active, value: active ? def.mapValue(normalized) : def.baseline };
}

/**
 * Composes a gene's evaluation strength: for static genes this is just the
 * raw motif-match strength (unchanged from before regulatory genes existed).
 * For regulatory genes it's `def.resolveStrength`, fed the raw self match,
 * the context signal, and any already-resolved `dependsOn` values.
 */
function evaluationStrength(
  def: GeneDefinition,
  selfMatchStrength: number,
  neighborDensity: number,
  resolvedValues: Map<string, number>,
): number {
  if (def.kind !== "regulatory" || !def.resolveStrength) return selfMatchStrength;
  const dependencyValues = (def.dependsOn ?? []).map((id) => resolvedValues.get(id) ?? 0);
  const ctx: RegulatoryContext = { selfMatchStrength, neighborDensity, dependencyValues };
  return def.resolveStrength(ctx);
}

/**
 * Decodes a genome into its cached Phenotype. Every gene — static or
 * regulatory — gets a genome-only motif match here (`matchStrength` below is
 * always the raw, threshold-independent match, per its doc comment).
 * Regulatory genes are additionally evaluated with `neighborDensity: 0`: the
 * correct context for a genome considered on its own (no colony), which is
 * exactly a solo organism's real context — so for a solo organism this cached
 * result already *is* its true expression; no further per-tick work is
 * needed. An organism embedded in a colony needs `resolveCellTraits` below to
 * re-derive regulatory values at its real, current colony-neighbor density.
 */
export function decode(genome: Genome): Phenotype {
  const symbols = translate(genome);
  const selfMatches = new Map<string, { strength: number; symbolIndex: number }>();
  for (const def of GENE_TABLE) selfMatches.set(def.id, bestMatch(symbols, def.motif));

  const resolvedValues = new Map<string, number>();
  const activeById = new Map<string, boolean>();
  for (const id of GENE_EVALUATION_ORDER) {
    const def = GENE_BY_ID.get(id)!;
    const self = selfMatches.get(id)!;
    const strength = evaluationStrength(def, self.strength, 0, resolvedValues);
    const { active, value } = activateFromStrength(def, strength);
    resolvedValues.set(id, value);
    activeById.set(id, active);
  }

  const genes: GeneExpression[] = GENE_TABLE.map((def) => {
    const self = selfMatches.get(def.id)!;
    return {
      geneId: def.id,
      matchStrength: self.strength,
      active: activeById.get(def.id)!,
      value: resolvedValues.get(def.id)!,
      windowStart: self.symbolIndex * 3,
      windowLength: def.motif.length * 3,
      // Reuses the same best-window search bestMatch() already did above —
      // no re-implementation, just also keeping the realized symbols instead
      // of only a derived similarity number. See GeneExpression.matchedSequence.
      matchedSequence: symbols.slice(self.symbolIndex, self.symbolIndex + def.motif.length),
    };
  });

  const traits = {} as Record<TraitId, number>;
  for (const def of GENE_TABLE) traits[def.trait] = resolvedValues.get(def.id)!;

  return { traits, genes, activeGeneCount: genes.filter((g) => g.active).length };
}

/**
 * Recomputes only the *regulatory* subset of trait values for one specific
 * organism's context (its current colony-neighbor density). Static traits are
 * constants already cached on `phenotype.traits` and are untouched here —
 * only genes with `kind: "regulatory"` produce an entry in the result. Reuses
 * each gene's cached genome motif-match strength
 * (`phenotype.genes[i].matchStrength`) rather than re-sliding motifs across
 * the genome every tick — only the context-dependent composition (and any
 * dependency chain) is redone, per organism, since two organisms sharing a
 * genome-identical motif can still resolve differently depending on where
 * each currently sits in (or outside) a colony.
 */
export function resolveCellTraits(
  phenotype: Phenotype,
  context: { neighborDensity: number },
): Partial<Record<TraitId, number>> {
  const selfStrengthById = new Map(phenotype.genes.map((g) => [g.geneId, g.matchStrength] as const));
  const resolvedValues = new Map<string, number>();
  const result: Partial<Record<TraitId, number>> = {};

  for (const id of GENE_EVALUATION_ORDER) {
    const def = GENE_BY_ID.get(id)!;
    if (def.kind === "static") {
      // Static traits never vary by cell — reuse the cached body-wide value
      // so any regulatory gene further down the chain that depends on a
      // static gene still sees a consistent number.
      resolvedValues.set(id, phenotype.traits[def.trait]);
      continue;
    }
    const selfStrength = selfStrengthById.get(id) ?? 0;
    const strength = evaluationStrength(def, selfStrength, context.neighborDensity, resolvedValues);
    const { value } = activateFromStrength(def, strength);
    resolvedValues.set(id, value);
    result[def.trait] = value;
  }

  return result;
}

/**
 * The effective value of `trait` at a specific cell: the regulatory result
 * for that cell if any regulatory gene produces this trait, falling back to
 * the static, body-wide `phenotype.traits` value otherwise (which is also
 * exactly right for a lone single cell, or any organism with no per-cell
 * context computed at all).
 */
export function effectiveTraitValue(
  phenotype: Phenotype,
  trait: TraitId,
  cellTraits: Partial<Record<TraitId, number>> | undefined,
): number {
  return cellTraits?.[trait] ?? phenotype.traits[trait];
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
