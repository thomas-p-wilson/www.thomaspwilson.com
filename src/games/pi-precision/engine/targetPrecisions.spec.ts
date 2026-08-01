import { describe, expect, it } from "vitest";
import { targetPrecisions } from "./targetPrecisions";

describe("targetPrecisions", () => {
  it("has unique ids and strictly decreasing km values (coarsest first)", () => {
    const ids = new Set(targetPrecisions.map((t) => t.id));
    expect(ids.size).toBe(targetPrecisions.length);

    for (let i = 1; i < targetPrecisions.length; i++) {
      expect(targetPrecisions[i].km).toBeLessThan(targetPrecisions[i - 1].km);
    }
  });
});
