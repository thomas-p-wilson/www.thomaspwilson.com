import { describe, expect, it } from "vitest";
import {
  FRAGMENT_MAX_INITIAL_LENGTH, FRAGMENT_MIN_INITIAL_LENGTH, FRAGMENT_MIN_SPLIT_LENGTH, growFragment,
  randomFragmentSequence, splitFragment,
} from "./fragment";
import { createRng } from "./rng";

describe("randomFragmentSequence", () => {
  it("produces a sequence within the configured initial-length range", () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      const seq = randomFragmentSequence(rng);
      expect(seq.length).toBeGreaterThanOrEqual(FRAGMENT_MIN_INITIAL_LENGTH);
      expect(seq.length).toBeLessThanOrEqual(FRAGMENT_MAX_INITIAL_LENGTH);
      expect(seq).toMatch(/^[ACGU]+$/);
    }
  });

  it("is deterministic for a given rng stream", () => {
    expect(randomFragmentSequence(createRng(42))).toBe(randomFragmentSequence(createRng(42)));
  });
});

describe("growFragment", () => {
  it("appends exactly one base, at either the front or the back", () => {
    const rng = createRng(7);
    const original = "ACGUAC";
    const grown = growFragment(original, rng);
    expect(grown.length).toBe(original.length + 1);
    const grownFromFront = grown.slice(1) === original;
    const grownFromBack = grown.slice(0, -1) === original;
    expect(grownFromFront || grownFromBack).toBe(true);
  });
});

describe("splitFragment", () => {
  it("returns null when the sequence is too short to produce two viable daughters", () => {
    const rng = createRng(3);
    const tooShort = "A".repeat(FRAGMENT_MIN_SPLIT_LENGTH * 2 - 1);
    expect(splitFragment(tooShort, rng)).toBeNull();
  });

  it("splits a long-enough sequence into two pieces that together reconstitute the original, each at least the minimum split length", () => {
    const rng = createRng(11);
    const original = "ACGU".repeat(10); // 40 bases, well above the 2x minimum
    const result = splitFragment(original, rng);
    expect(result).not.toBeNull();
    const [a, b] = result!;
    expect(a.length).toBeGreaterThanOrEqual(FRAGMENT_MIN_SPLIT_LENGTH);
    expect(b.length).toBeGreaterThanOrEqual(FRAGMENT_MIN_SPLIT_LENGTH);
    expect(a + b).toBe(original);
  });

  it("never breaks at the very ends, even with maximum jitter", () => {
    const rng = createRng(99);
    const original = "ACGU".repeat(4); // exactly 2x the minimum split length (16 bases)
    for (let i = 0; i < 30; i++) {
      const result = splitFragment(original, rng);
      if (!result) continue;
      const [a, b] = result;
      expect(a.length).toBeGreaterThanOrEqual(FRAGMENT_MIN_SPLIT_LENGTH);
      expect(b.length).toBeGreaterThanOrEqual(FRAGMENT_MIN_SPLIT_LENGTH);
    }
  });
});
