import { describe, expect, it } from "vitest";
import { cutHalves, displayRows, mixColors, paint, parseLayout, rotateClockwise, rotateCounterClockwise, stack, tileColumns, traceLayout } from "./layout";
import { layouts } from "../data/layouts";
import { levels } from "../data/levels";

const trace = (rows: string[]) => traceLayout(parseLayout({ rows }));
const unique = (shapes: string[]) => [...new Set(shapes)].sort();

describe("shape operations", () => {
  it("cuts into west and east halves, like the game's cutter slots", () => {
    expect(cutHalves("CuCuCuCu")).toEqual(["----CuCu", "CuCu----"]);
    expect(cutHalves("Cu----Cu")).toEqual(["------Cu", "Cu------"]);
  });

  it("rotates clockwise", () => {
    expect(rotateClockwise("----CuCu")).toBe("Cu----Cu");
    expect(rotateClockwise("CuCu----")).toBe("--CuCu--");
    expect(rotateClockwise("------Cu")).toBe("Cu------");
  });

  it("rotates counter-clockwise", () => {
    expect(rotateCounterClockwise("CgCg----")).toBe("Cg----Cg");
    expect(rotateCounterClockwise("----ScSc")).toBe("--ScSc--");
  });

  it("paints every layer", () => {
    expect(paint("CuCuCuRu", "b")).toBe("CbCbCbRb");
    expect(paint("Cu------:Ru------", "r")).toBe("Cr------:Rr------");
  });

  it("mixes colours like the game", () => {
    expect(mixColors("r", "b")).toBe("p");
    expect(mixColors("g", "b")).toBe("c");
    expect(mixColors("c", "r")).toBe("w");
  });

  it("stacks into the same layer when quadrants don't overlap, else on top", () => {
    expect(stack("Cg----Cg", "--ScSc--")).toBe("CgScScCg");
    expect(stack("CuCu----", "----Cu--")).toBe("CuCuCu--");
    expect(stack("CbCbCbRb", "CwCwCwCw")).toBe("CbCbCbRb:CwCwCwCw");
  });

  it("drops halves that come out empty", () => {
    expect(cutHalves("Cu------")).toEqual(["", "Cu------"]);
  });
});

describe("parseLayout", () => {
  it("places a cutter's second tile according to its facing", () => {
    const up = parseLayout({ rows: ["C^ ##"] }).buildings[0];
    expect(up.tiles).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ]);
    const right = parseLayout({ rows: ["C>", "##"] }).buildings[0];
    expect(right.tiles[1]).toEqual({ row: 1, col: 0 });
  });

  it("puts a painter's second tile ahead, in the direction it puts out", () => {
    const painter = parseLayout({ rows: ["##", "P^"] }).buildings[0];
    expect(painter.tiles).toEqual([
      { row: 1, col: 0 },
      { row: 0, col: 0 },
    ]);
  });

  it("rejects malformed layouts", () => {
    expect(() => parseLayout({ rows: ["C^ .."] })).toThrow(/needs ##/);
    expect(() => parseLayout({ rows: ["## .."] })).toThrow(/Stray/);
    expect(() => parseLayout({ rows: ["Xx"] })).toThrow(/Unknown/);
    expect(() => parseLayout({ rows: ["B^ ..", "B^"] })).toThrow(/tiles/);
    expect(() => parseLayout({ rows: ["M^"] })).toThrow(/resource/);
  });
});

describe("traceLayout", () => {
  it("follows a miner into the hub", () => {
    expect(trace(["HH", "B^", "M^C"]).delivered).toEqual(["CuCuCuCu"]);
  });

  it("only feeds a cutter from behind its anchor tile", () => {
    expect(trace(["HH HH", "C^ ##", ".. B^", ".. M^C"]).problems[0]).toMatch(/no input/);
  });

  it("paints with colour from the left, or the right when mirrored", () => {
    expect(trace(["HH ..", "B^ ..", "## B<", "P^ M^r", "B^ ..", "M^C .."]).problems[0]).toMatch(/no input/);
    expect(trace(["HH ..", "B^ ..", "## B<", "N^ M^r", "B^ ..", "M^C .."]).delivered).toEqual(["CrCrCrCr"]);
  });

  it("sends items under a tunnel to the next exit in range", () => {
    expect(trace(["HH", "O^", "B>", "E^", "M^C"]).delivered).toEqual(["CuCuCuCu"]);
    expect(trace(["HH", "O^", "..", "..", "..", "..", "..", "E^", "M^C"]).problems[0]).toMatch(/No tunnel exit/);
  });

  it("lets a balancer's spare output stay empty", () => {
    expect(trace(["HH ..", "L^ ##", "B^ B^", "M^C M^C"]).problems).toEqual([]);
  });

  it("reports items with nowhere to go", () => {
    expect(trace(["..", "B^", "M^C"]).problems[0]).toMatch(/nothing/);
  });
});

describe("layouts data", () => {
  it("every tiled layout, drawn with several tiles, delivers only its level's shape with nothing stuck", () => {
    for (const level of levels) {
      if (!level.layout?.tiled) continue;
      const flow = traceLayout(parseLayout({ rows: displayRows(level.layout) }));
      expect(flow.problems, `level ${level.level}`).toEqual([]);
      expect(unique(flow.delivered), `level ${level.level}`).toEqual([level.shape]);
    }
    expect(levels.filter((l) => l.layout?.tiled).map((l) => l.level)).toEqual([7, 8, 9, 10]);
  });

  it("a tile holds the same processing machines as the module the numbers come from", () => {
    const processing = new Set(["cutter", "rotator", "rotatorCCW", "painter", "painterMirrored", "mixer", "stacker"]);
    for (const level of levels) {
      const layout = level.layout;
      if (!layout?.tiled) continue;
      const count = (buildings: { kind: string }[]) =>
        buildings.filter((b) => processing.has(b.kind)).map((b) => b.kind.replace("Mirrored", "")).sort();
      const composite = parseLayout({ rows: displayRows(layout, 1) });
      const [first, end] = tileColumns(layout, 0);
      const inTile = composite.buildings.filter((b) => b.col >= first && b.col < end);
      expect(count(inTile), `level ${level.level}`).toEqual(count(parseLayout(layout).buildings));
    }
  });

  it("catches belts fed from two directions", () => {
    expect(trace(["HH ..", "B^ B<", "M^C M^C"]).problems.some((p) => /two directions/.test(p))).toBe(true);
  });

  it("every layout parses and runs without anything getting stuck", () => {
    for (const [id, layout] of Object.entries(layouts)) {
      expect(traceLayout(parseLayout(layout)).problems, id).toEqual([]);
    }
  });

  it("delivers exactly each level's goal shape to the hub", () => {
    for (const level of levels) {
      if (!level.layout) continue;
      expect(unique(traceLayout(parseLayout(level.layout)).delivered), `level ${level.level}`).toEqual([level.shape]);
    }
    expect(levels.filter((l) => l.layout).map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("delivers the Belt II shape from the belt2 layout", () => {
    expect(unique(traceLayout(parseLayout(layouts.belt2)).delivered)).toEqual(["--CuCu--", "Cu----Cu"]);
  });

});
