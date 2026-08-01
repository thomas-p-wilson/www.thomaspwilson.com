import { describe, expect, it } from "vitest";
import { SYMBOL_ALPHABET } from "./codonTable";
import { GENE_TABLE } from "./genes";
import { GENE_EVALUATION_ORDER, topologicalGeneOrder } from "./regulation";
import type { GeneDefinition } from "./types";

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

  it("every gene declares a kind of either static or regulatory", () => {
    for (const gene of GENE_TABLE) {
      expect(["static", "regulatory"]).toContain(gene.kind);
    }
  });

  it("static genes declare no dependsOn — only regulatory genes may depend on other genes", () => {
    for (const gene of GENE_TABLE) {
      if (gene.kind === "static") expect(gene.dependsOn ?? []).toHaveLength(0);
    }
  });

  it("every regulatory gene defines resolveStrength", () => {
    for (const gene of GENE_TABLE) {
      if (gene.kind === "regulatory") expect(typeof gene.resolveStrength).toBe("function");
    }
  });

  it("includes at least two regulatory genes, one of which depends on another", () => {
    const regulatory = GENE_TABLE.filter((g) => g.kind === "regulatory");
    expect(regulatory.length).toBeGreaterThanOrEqual(2);
    expect(regulatory.some((g) => (g.dependsOn?.length ?? 0) > 0)).toBe(true);
  });
});

describe("gene dependency ordering (regulation.ts)", () => {
  it("GENE_EVALUATION_ORDER contains every gene id exactly once", () => {
    expect(new Set(GENE_EVALUATION_ORDER).size).toBe(GENE_TABLE.length);
    expect(GENE_EVALUATION_ORDER).toHaveLength(GENE_TABLE.length);
  });

  it("orders every gene after all of its dependsOn targets", () => {
    const indexOf = new Map(GENE_EVALUATION_ORDER.map((id, i) => [id, i] as const));
    for (const def of GENE_TABLE) {
      for (const depId of def.dependsOn ?? []) {
        expect(indexOf.get(depId)).toBeLessThan(indexOf.get(def.id)!);
      }
    }
  });

  it("throws when the dependency graph contains a cycle", () => {
    const cyclic: GeneDefinition[] = [
      { ...GENE_TABLE[0], id: "a", dependsOn: ["b"] },
      { ...GENE_TABLE[0], id: "b", dependsOn: ["a"] },
    ];
    expect(() => topologicalGeneOrder(cyclic)).toThrow(/cyclic/i);
  });

  it("throws when a gene depends on an id that doesn't exist in the table", () => {
    const broken: GeneDefinition[] = [{ ...GENE_TABLE[0], id: "a", dependsOn: ["missing"] }];
    expect(() => topologicalGeneOrder(broken)).toThrow(/unknown/i);
  });

  it("accepts a valid multi-step chain (a <- b <- c) without throwing", () => {
    const chain: GeneDefinition[] = [
      { ...GENE_TABLE[0], id: "a", dependsOn: [] },
      { ...GENE_TABLE[0], id: "b", dependsOn: ["a"] },
      { ...GENE_TABLE[0], id: "c", dependsOn: ["b"] },
    ];
    const order = topologicalGeneOrder(chain);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
  });
});
