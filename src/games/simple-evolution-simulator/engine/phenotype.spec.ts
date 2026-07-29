import { describe, expect, it } from "vitest";
import { symbolToCodon } from "./codonTable";
import { GENE_TABLE } from "./genes";
import { createSeedGenome, randomGenome } from "./genome";
import { decode, describeRegion, effectiveTraitValue, resolveCellTraits } from "./phenotype";
import { createRng } from "./rng";

/** Builds a genome carrying exact motifs for the given gene ids, joined by
 * reading-frame-safe (multiple-of-3) random linkers — the same technique
 * genome.ts's createSeedGenome uses to guarantee a gene activates. */
function genomeWithActiveGenes(geneIds: string[], rng: ReturnType<typeof createRng>): string {
  let genome = randomGenome(9, rng);
  for (const def of GENE_TABLE) {
    if (!geneIds.includes(def.id)) continue;
    genome += [...def.motif].map(symbolToCodon).join("");
    genome += randomGenome(6, rng);
  }
  genome += randomGenome(12, rng);
  return genome;
}

describe("decode", () => {
  it("is a pure, deterministic function of the genome", () => {
    const genome = randomGenome(120, createRng(1));
    const a = decode(genome);
    const b = decode(genome);
    expect(a).toEqual(b);
  });

  it("produces one GeneExpression per gene in GENE_TABLE, in order", () => {
    const genome = randomGenome(120, createRng(1));
    const phenotype = decode(genome);
    expect(phenotype.genes.map((g) => g.geneId)).toEqual(GENE_TABLE.map((g) => g.id));
  });

  it("activates a gene when its exact consensus motif is present in the genome", () => {
    const gene = GENE_TABLE[0];
    const exactSegment = [...gene.motif].map(symbolToCodon).join("");
    // Prefix length must be a multiple of 3 to keep the reading frame
    // aligned — translate() always reads codons starting at position 0.
    const genome = randomGenome(18, createRng(2)) + exactSegment + randomGenome(20, createRng(3));
    const phenotype = decode(genome);
    const expression = phenotype.genes.find((g) => g.geneId === gene.id)!;
    expect(expression.matchStrength).toBe(1);
    expect(expression.active).toBe(true);
    expect(expression.value).toBeCloseTo(gene.mapValue(1), 5);
  });

  it("falls back to baseline for genes with no genome long enough to match", () => {
    const gene = GENE_TABLE[0];
    // Genome shorter than one full codon per motif symbol.
    const genome = "AC";
    const phenotype = decode(genome);
    const expression = phenotype.genes.find((g) => g.geneId === gene.id)!;
    expect(expression.active).toBe(false);
    expect(expression.value).toBe(gene.baseline);
  });

  it("the seed genome activates the intended minimal-viable-replicator genes", () => {
    const genome = createSeedGenome(createRng(7));
    const phenotype = decode(genome);
    const activeIds = phenotype.genes.filter((g) => g.active).map((g) => g.geneId);
    expect(activeIds).toEqual(
      expect.arrayContaining(["replication-rate", "membrane-stability", "metabolism-efficiency"]),
    );
  });

  it("caching contract: re-decoding an unchanged genome yields an identical result", () => {
    // decode() itself has no internal cache, but organisms are expected to
    // call it once and reuse the result — this documents that calling it
    // twice on the same genome is safe/idempotent, which is what makes that
    // caching strategy valid in the first place.
    const genome = randomGenome(90, createRng(4));
    expect(decode(genome)).toEqual(decode(genome));
  });
});

describe("describeRegion", () => {
  it("scores every gene at the clicked position, sorted strongest-first", () => {
    const genome = randomGenome(120, createRng(1));
    const matches = describeRegion(genome, 30);
    expect(matches).toHaveLength(GENE_TABLE.length);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i - 1].strength).toBeGreaterThanOrEqual(matches[i].strength);
    }
  });

  it("reports a perfect match when the clicked position is the start of an exact motif", () => {
    const gene = GENE_TABLE[1];
    const exactSegment = [...gene.motif].map(symbolToCodon).join("");
    const prefix = randomGenome(15, createRng(2));
    const genome = prefix + exactSegment;
    const matches = describeRegion(genome, prefix.length);
    const match = matches.find((m) => m.geneId === gene.id)!;
    expect(match.strength).toBe(1);
    expect(match.active).toBe(true);
  });

  it("returns zero strength for a position too close to the end of the genome", () => {
    const genome = randomGenome(30, createRng(1));
    const matches = describeRegion(genome, 29);
    expect(matches.every((m) => m.strength === 0)).toBe(true);
  });
});

describe("regulatory genes (structural-reinforcement / growth-suppression cascade)", () => {
  it("decode() (context-free / neighborDensity 0) leaves regulatory traits at baseline even when the motif is present", () => {
    // A genome carrying the exact motif still shouldn't express the trait in
    // isolation — it's genome-gated *and* context-gated, and decode() always
    // uses neighborDensity: 0 (correct for a lone single cell).
    const genome = genomeWithActiveGenes(["structural-reinforcement", "growth-suppression"], createRng(11));
    const phenotype = decode(genome);
    expect(phenotype.traits.structuralIntegrity).toBeCloseTo(0.1, 5); // baseline
    expect(phenotype.traits.growthSuppression).toBe(0); // baseline
    // But the raw genome-only motif match is still reported (independent of
    // context), so the genomic "potential" is visible even though it's unexpressed.
    const structural = phenotype.genes.find((g) => g.geneId === "structural-reinforcement")!;
    expect(structural.matchStrength).toBe(1);
    expect(structural.active).toBe(false);
  });

  it("resolveCellTraits expresses structural-reinforcement only at high neighbor density", () => {
    const genome = genomeWithActiveGenes(["structural-reinforcement"], createRng(12));
    const phenotype = decode(genome);

    // Every regulatory gene always produces *some* value (its baseline when
    // inactive) — "undefined" is reserved for traits no regulatory gene
    // drives at all, not for "currently inactive at this cell".
    const surface = resolveCellTraits(phenotype, { neighborDensity: 0 });
    expect(surface.structuralIntegrity).toBeCloseTo(0.1, 5); // baseline — surface/lone cell

    const interior = resolveCellTraits(phenotype, { neighborDensity: 1 });
    expect(interior.structuralIntegrity).toBeGreaterThan(0.5); // deep interior — reinforced
  });

  it("growth-suppression only activates once its upstream dependency (structural-reinforcement) is itself expressed — a real two-step cascade", () => {
    const genome = genomeWithActiveGenes(["structural-reinforcement", "growth-suppression"], createRng(13));
    const phenotype = decode(genome);

    // Negligible density: upstream gene isn't expressed, so the downstream
    // gene (which depends on it) can't be either, even though its own motif
    // matches. Structural Reinforcement's density scaling is deliberately
    // *very* generous at low-but-nonzero density (a 4th-root curve — see its
    // resolveStrength doc comment in genes.ts for why a bonded pair needs a
    // real, non-token benefit), so "low" here has to be a tiny fraction, not
    // just "a small colony" (e.g. 0.2, a pair's density, is no longer low
    // enough to stay inactive under this curve).
    const low = resolveCellTraits(phenotype, { neighborDensity: 0.00001 });
    expect(low.growthSuppression ?? 0).toBe(0);

    // High density: both genes' own motifs match and the upstream value is
    // now high enough to unlock the downstream one.
    const high = resolveCellTraits(phenotype, { neighborDensity: 1 });
    expect(high.structuralIntegrity).toBeGreaterThan(0.5);
    expect(high.growthSuppression ?? 0).toBeGreaterThan(0);
  });

  it("a gene missing its own motif stays at (or near) baseline regardless of context (still genome-gated)", () => {
    // No exact motifs spliced in at all — even at maximum neighbor density,
    // a genome that doesn't carry the motif can't express the trait, because
    // resolveStrength multiplies in the raw self-match strength.
    const genome = randomGenome(90, createRng(14));
    const phenotype = decode(genome);
    const result = resolveCellTraits(phenotype, { neighborDensity: 1 });
    expect(result.structuralIntegrity).toBeGreaterThanOrEqual(0.1);
    expect(result.structuralIntegrity).toBeLessThanOrEqual(1);
  });

  it("effectiveTraitValue falls back to the static phenotype value when no regulatory gene produces that trait", () => {
    const genome = randomGenome(90, createRng(15));
    const phenotype = decode(genome);
    expect(effectiveTraitValue(phenotype, "size", undefined)).toBe(phenotype.traits.size);
    expect(effectiveTraitValue(phenotype, "size", {})).toBe(phenotype.traits.size);
  });

  it("effectiveTraitValue prefers the per-cell regulatory value when one is present", () => {
    const genome = genomeWithActiveGenes(["structural-reinforcement"], createRng(16));
    const phenotype = decode(genome);
    const cellTraits = resolveCellTraits(phenotype, { neighborDensity: 1 });
    expect(effectiveTraitValue(phenotype, "structuralIntegrity", cellTraits)).toBe(cellTraits.structuralIntegrity);
    expect(effectiveTraitValue(phenotype, "structuralIntegrity", cellTraits)).not.toBe(
      phenotype.traits.structuralIntegrity,
    );
  });
});
