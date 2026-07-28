import { describe, expect, it } from "vitest";
import { symbolToCodon } from "./codonTable";
import { GENE_TABLE } from "./genes";
import { createSeedGenome, randomGenome } from "./genome";
import { decode, describeRegion } from "./phenotype";
import { createRng } from "./rng";

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
