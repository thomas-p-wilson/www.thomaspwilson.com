import { describe, expect, it } from "vitest";
import { areCompatible, computeColonies, COLONY_COMPATIBILITY_THRESHOLD, sequenceSimilarity, SURFACE_PROTEIN_GENE_ID } from "./colony";
import { GENE_TABLE } from "./genes";
import { randomGenome } from "./genome";
import { decode } from "./phenotype";
import { createRng } from "./rng";
import type { Organism } from "./types";

function organismWithSurfaceProtein(id: string, active: boolean, matchedSequence: string): Organism {
  const genome = randomGenome(60, createRng(id.length + matchedSequence.length));
  const phenotype = decode(genome);
  const genes = phenotype.genes.slice();
  const idx = GENE_TABLE.findIndex((g) => g.id === SURFACE_PROTEIN_GENE_ID);
  genes[idx] = { ...genes[idx], active, matchedSequence };
  return {
    id,
    genome,
    phenotype: { ...phenotype, genes },
    x: 0,
    y: 0,
    energy: 10,
    age: 0,
    generation: 0,
    parentIds: [],
    birthTick: 0,
  };
}

describe("sequenceSimilarity", () => {
  it("is 1 for identical sequences", () => {
    expect(sequenceSimilarity("012345", "012345")).toBe(1);
  });

  it("is 0 for sequences that differ everywhere", () => {
    expect(sequenceSimilarity("000000", "111111")).toBe(0);
  });

  it("scales linearly with mismatch count", () => {
    expect(sequenceSimilarity("012345", "012340")).toBeCloseTo(5 / 6, 5);
  });

  it("treats mismatched lengths as fully incompatible rather than throwing", () => {
    expect(sequenceSimilarity("0123", "012345")).toBe(0);
  });

  it("treats empty sequences as fully incompatible", () => {
    expect(sequenceSimilarity("", "")).toBe(0);
  });
});

describe("areCompatible", () => {
  it("bonds two organisms with active, identical realized sequences", () => {
    const a = organismWithSurfaceProtein("a", true, "012345");
    const b = organismWithSurfaceProtein("b", true, "012345");
    expect(areCompatible(a, b)).toBe(true);
  });

  it("does not bond if either organism's surface-protein gene isn't active", () => {
    const a = organismWithSurfaceProtein("a", true, "012345");
    const b = organismWithSurfaceProtein("b", false, "012345");
    expect(areCompatible(a, b)).toBe(false);
    expect(areCompatible(b, a)).toBe(false);
  });

  it("does not bond active organisms whose sequences fall below the compatibility threshold", () => {
    const a = organismWithSurfaceProtein("a", true, "012345");
    const b = organismWithSurfaceProtein("b", true, "543210");
    expect(sequenceSimilarity("012345", "543210")).toBeLessThan(COLONY_COMPATIBILITY_THRESHOLD);
    expect(areCompatible(a, b)).toBe(false);
  });

  it("bonds active organisms whose sequences differ by only one symbol (just above threshold)", () => {
    const a = organismWithSurfaceProtein("a", true, "012345");
    const b = organismWithSurfaceProtein("b", true, "012340"); // 5/6 similarity
    expect(sequenceSimilarity("012345", "012340")).toBeGreaterThanOrEqual(COLONY_COMPATIBILITY_THRESHOLD);
    expect(areCompatible(a, b)).toBe(true);
  });
});

describe("computeColonies", () => {
  it("gives every organism a singleton colony (size 1) when there are no edges", () => {
    const { colonyOf, colonySize } = computeColonies(["a", "b", "c"], []);
    expect(colonyOf.get("a")).not.toBe(colonyOf.get("b"));
    for (const id of ["a", "b", "c"]) {
      expect(colonySize.get(colonyOf.get(id)!)).toBe(1);
    }
  });

  it("merges a direct pair into one colony of size 2", () => {
    const { colonyOf, colonySize } = computeColonies(["a", "b", "c"], [["a", "b"]]);
    expect(colonyOf.get("a")).toBe(colonyOf.get("b"));
    expect(colonyOf.get("c")).not.toBe(colonyOf.get("a"));
    expect(colonySize.get(colonyOf.get("a")!)).toBe(2);
    expect(colonySize.get(colonyOf.get("c")!)).toBe(1);
  });

  it("transitively merges a chain (a-b, b-c) into one colony of size 3, with no direct a-c edge", () => {
    const { colonyOf, colonySize } = computeColonies(["a", "b", "c"], [["a", "b"], ["b", "c"]]);
    expect(colonyOf.get("a")).toBe(colonyOf.get("b"));
    expect(colonyOf.get("b")).toBe(colonyOf.get("c"));
    expect(colonySize.get(colonyOf.get("a")!)).toBe(3);
  });

  it("recomputes independently from scratch — dropping an edge next call shrinks the colony back down", () => {
    const withEdge = computeColonies(["a", "b"], [["a", "b"]]);
    expect(withEdge.colonySize.get(withEdge.colonyOf.get("a")!)).toBe(2);

    const withoutEdge = computeColonies(["a", "b"], []);
    expect(withoutEdge.colonyOf.get("a")).not.toBe(withoutEdge.colonyOf.get("b"));
    expect(withoutEdge.colonySize.get(withoutEdge.colonyOf.get("a")!)).toBe(1);
  });

  it("ignores edges referencing ids not in the organism list, rather than throwing", () => {
    expect(() => computeColonies(["a"], [["a", "ghost"]])).not.toThrow();
  });
});
