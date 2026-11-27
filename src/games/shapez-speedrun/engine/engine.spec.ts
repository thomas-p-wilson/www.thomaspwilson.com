import { describe, expect, it } from "vitest";
import { describeShapeKey, parseShapeKey } from "./shapeKey";
import { machineRate, machinesNeeded, NO_UPGRADES, upgradeMultiplier } from "./throughput";
import { formatClock, formatDelta, parseClock } from "./time";
import { levels, TOTAL_GOAL_SHAPES } from "../data/levels";

describe("parseShapeKey", () => {
  it("parses multi-layer keys in TR, BR, BL, TL order", () => {
    const [bottom, top] = parseShapeKey("CbCbCbRb:CwCwCwCw");
    expect(bottom[0]).toEqual({ shape: "circle", color: "blue" });
    expect(bottom[3]).toEqual({ shape: "rect", color: "blue" });
    expect(top.every((q) => q?.color === "white")).toBe(true);
  });

  it("keeps empty quadrants as null", () => {
    expect(parseShapeKey("----CuCu")[0]).toEqual([null, null, { shape: "circle", color: "uncolored" }, { shape: "circle", color: "uncolored" }]);
  });

  it("rejects malformed keys", () => {
    expect(() => parseShapeKey("CuCu")).toThrow();
    expect(() => parseShapeKey("XuCuCuCu")).toThrow();
    expect(() => parseShapeKey("--------")).toThrow();
  });

  it("describes shapes in plain English", () => {
    expect(describeShapeKey("CuCuCuCu")).toBe("full circle");
    expect(describeShapeKey("Cu----Cu")).toBe("circle (top-right, top-left)");
  });

  it("parses every level goal", () => {
    for (const level of levels) expect(() => parseShapeKey(level.shape)).not.toThrow();
  });
});

describe("throughput", () => {
  it("matches the game's base speeds", () => {
    expect(machineRate("belt", NO_UPGRADES)).toBe(2);
    expect(machineRate("miner", NO_UPGRADES)).toBeCloseTo(0.4);
    expect(machineRate("cutter", NO_UPGRADES)).toBeCloseTo(0.5);
    expect(machineRate("stacker", NO_UPGRADES)).toBeCloseTo(0.25);
    expect(machineRate("painter", NO_UPGRADES)).toBeCloseTo(1 / 3);
  });

  it("applies additive tier improvements", () => {
    expect(upgradeMultiplier(0)).toBe(1);
    expect(upgradeMultiplier(1)).toBe(1.5);
    expect(upgradeMultiplier(2)).toBe(2);
    expect(upgradeMultiplier(3)).toBe(3);
    expect(machineRate("stacker", { ...NO_UPGRADES, processors: 2 })).toBeCloseTo(0.5);
  });

  it("rounds machine counts up", () => {
    expect(machinesNeeded("miner", 2, NO_UPGRADES)).toBe(5);
    expect(machinesNeeded("stacker", 1, NO_UPGRADES)).toBe(4);
    expect(machinesNeeded("stacker", 1.01, NO_UPGRADES)).toBe(5);
  });
});

describe("time", () => {
  it("formats and parses clock values", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(1_805_000)).toBe("30:05");
    expect(formatClock(3_725_000)).toBe("1:02:05");
    expect(parseClock("27:30")).toBe(1_650_000);
    expect(parseClock("1:02:05")).toBe(3_725_000);
    expect(parseClock("5:75")).toBeNull();
    expect(parseClock("abc")).toBeNull();
  });

  it("formats deltas with a sign", () => {
    expect(formatDelta(12_000)).toBe("+0:12");
    expect(formatDelta(-30_000)).toBe("-0:30");
    expect(formatDelta(400)).toBe("±0:00");
  });
});

describe("levels", () => {
  it("covers levels 1–12 with targets that increase and finish under 30 minutes", () => {
    expect(levels.map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (let i = 1; i < levels.length; i++) expect(levels[i].targetSeconds).toBeGreaterThan(levels[i - 1].targetSeconds);
    expect(levels[levels.length - 1].targetSeconds).toBeLessThan(30 * 60);
    expect(TOTAL_GOAL_SHAPES).toBe(4830);
  });
});
