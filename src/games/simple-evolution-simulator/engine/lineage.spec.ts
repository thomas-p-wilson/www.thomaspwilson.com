import { describe, expect, it } from "vitest";
import { ancestorPath, buildLineageForest, layoutLineage } from "./lineage";
import type { LineageRecord } from "./types";

const record = (
  id: string, parentIds: string[], generation: number, overrides: Partial<LineageRecord> = {},
): LineageRecord => ({
  id, parentIds, generation, birthTick: generation, deathTick: null, genome: "AAA", ...overrides,
});

describe("buildLineageForest", () => {
  it("builds a single-root tree for a simple chain", () => {
    const records = [record("a", [], 0), record("b", ["a"], 1), record("c", ["b"], 2)];
    const forest = buildLineageForest(records);
    expect(forest).toHaveLength(1);
    expect(forest[0].id).toBe("a");
    expect(forest[0].children[0].id).toBe("b");
    expect(forest[0].children[0].children[0].id).toBe("c");
  });

  it("branches correctly when one organism has multiple offspring", () => {
    const records = [record("a", [], 0), record("b", ["a"], 1), record("c", ["a"], 1)];
    const forest = buildLineageForest(records);
    expect(forest).toHaveLength(1);
    expect(forest[0].children.map((c) => c.id).sort()).toEqual(["b", "c"]);
  });

  it("treats organisms with an unknown/missing parent as separate roots", () => {
    const records = [record("a", [], 0), record("b", ["nonexistent"], 1)];
    const forest = buildLineageForest(records);
    expect(forest.map((r) => r.id).sort()).toEqual(["a", "b"]);
  });

  it("supports multiple independent seed organisms (a forest, not just one tree)", () => {
    const records = [record("seed-1", [], 0), record("seed-2", [], 0), record("child", ["seed-1"], 1)];
    const forest = buildLineageForest(records);
    expect(forest).toHaveLength(2);
  });
});

describe("ancestorPath", () => {
  it("walks from the root to the given organism, oldest first", () => {
    const records = [record("a", [], 0), record("b", ["a"], 1), record("c", ["b"], 2)];
    expect(ancestorPath(records, "c").map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("returns just the organism itself when it's a root", () => {
    const records = [record("a", [], 0)];
    expect(ancestorPath(records, "a").map((r) => r.id)).toEqual(["a"]);
  });

  it("returns an empty array for an unknown id", () => {
    expect(ancestorPath([record("a", [], 0)], "missing")).toEqual([]);
  });
});

describe("layoutLineage", () => {
  it("gives every record a node with y equal to its generation", () => {
    const records = [record("a", [], 0), record("b", ["a"], 1), record("c", ["b"], 2)];
    const layout = layoutLineage(records);
    expect(layout.nodes).toHaveLength(3);
    for (const node of layout.nodes) {
      const source = records.find((r) => r.id === node.id)!;
      expect(node.y).toBe(source.generation);
    }
  });

  it("creates one edge per non-root record", () => {
    const records = [record("a", [], 0), record("b", ["a"], 1), record("c", ["a"], 1)];
    const layout = layoutLineage(records);
    expect(layout.edges).toHaveLength(2);
    expect(layout.edges).toEqual(
      expect.arrayContaining([{ from: "a", to: "b" }, { from: "a", to: "c" }]),
    );
  });

  it("gives sibling leaves distinct x slots and centers the parent over them", () => {
    const records = [record("a", [], 0), record("b", ["a"], 1), record("c", ["a"], 1)];
    const layout = layoutLineage(records);
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    expect(byId.get("b")!.x).not.toBe(byId.get("c")!.x);
    const parentX = byId.get("a")!.x;
    const childXs = [byId.get("b")!.x, byId.get("c")!.x];
    expect(parentX).toBeCloseTo((Math.min(...childXs) + Math.max(...childXs)) / 2, 6);
  });
});
