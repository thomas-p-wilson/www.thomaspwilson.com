import { describe, expect, it } from "vitest";
import { SYMBOL_ALPHABET } from "./codonTable";
import { GENE_TABLE } from "./genes";

describe("GENE_TABLE", () => {
  it("has a unique id per gene", () => {
    expect(new Set(GENE_TABLE.map((g) => g.id)).size).toBe(GENE_TABLE.length);
  });

  it("has a unique trait per gene (no two genes drive the same trait)", () => {
    expect(new Set(GENE_TABLE.map((g) => g.trait)).size).toBe(GENE_TABLE.length);
  });

  it("every motif is written only in the translated symbol alphabet", () => {
    for (const gene of GENE_TABLE) {
      expect([...gene.motif].every((c) => SYMBOL_ALPHABET.includes(c))).toBe(true);
    }
  });

  it("every activation threshold is a valid, non-trivial probability", () => {
    for (const gene of GENE_TABLE) {
      expect(gene.activationThreshold).toBeGreaterThan(0);
      expect(gene.activationThreshold).toBeLessThan(1);
    }
  });

  it("mapValue(1) never drops below mapValue(0) (monotonic-ish sanity check)", () => {
    for (const gene of GENE_TABLE) {
      expect(gene.mapValue(1)).toBeGreaterThanOrEqual(gene.mapValue(0));
    }
  });
});
