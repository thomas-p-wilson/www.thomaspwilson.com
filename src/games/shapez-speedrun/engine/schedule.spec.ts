import { describe, expect, it } from "vitest";
import { SQUEEZE_DEADLINE_SECONDS, squeezedSchedule } from "./schedule";
import { levels } from "../data/levels";

const original = levels.map((l) => l.targetSeconds);
const orig = (level: number) => original[level - 1];
const ms = (s: number) => s * 1000;

describe("squeezedSchedule", () => {
  it("keeps the plan when on time or ahead", () => {
    const s = squeezedSchedule(original, { 1: ms(orig(1) - 10), 2: ms(orig(2) - 5) }, ms(orig(2)));
    expect(s.factor).toBe(1);
    expect(s.slip).toBe(0);
    for (let level = 3; level <= 12; level++) expect(s.targets[level]).toBe(orig(level));
  });

  it("first spends the buffer: a small slip shifts the rest without shortening them", () => {
    const s = squeezedSchedule(original, { 1: ms(orig(1) + 30) }, ms(orig(1) + 30));
    expect(s.factor).toBe(1);
    expect(s.slip).toBe(30);
    expect(s.targets[2]).toBe(orig(2) + 30);
    expect(s.targets[12]).toBe(orig(12) + 30);
  });

  it("squeezes proportionally to end at 29:00 once the buffer is gone", () => {
    const split = orig(6) + 180;
    const s = squeezedSchedule(original, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: ms(split) }, ms(split));
    expect(s.factor).toBeCloseTo((SQUEEZE_DEADLINE_SECONDS - split) / (orig(12) - orig(6)));
    expect(s.factor).toBeLessThan(1);
    expect(s.targets[12]).toBeCloseTo(SQUEEZE_DEADLINE_SECONDS);
    // Each remaining gap shrinks by the same factor.
    expect(s.targets[8] - s.targets[7]).toBeCloseTo((orig(8) - orig(7)) * s.factor);
  });

  it("while the current level is overdue, squeezes the ones after it from the clock in 15-second steps", () => {
    const splits = { 1: ms(orig(1)), 2: ms(orig(2)), 3: ms(orig(3)), 4: ms(orig(4)) };
    const onPlan = squeezedSchedule(original, splits, ms(orig(5) - 1));
    expect(onPlan.targets[6]).toBe(orig(6));

    // Level 5's target is 4:15 (255 s); 207 s past it, the clock rounds down to 7:30 (450 s).
    const late = squeezedSchedule(original, splits, ms(orig(5) + 207));
    expect(late.targets[5]).toBe(orig(5));
    expect(late.slip).toBe(195);
    expect(late.targets[6]).toBeGreaterThan(orig(6));
  });

  it("keeps a finished level's target as it was when finished", () => {
    const s = squeezedSchedule(original, { 1: ms(orig(1) + 200) }, ms(orig(1) + 200), { 1: 123 });
    expect(s.targets[1]).toBe(123);
  });

  it("flags a plan that can't end by 29:00", () => {
    const s = squeezedSchedule(original, { 1: ms(SQUEEZE_DEADLINE_SECONDS + 10) }, ms(SQUEEZE_DEADLINE_SECONDS + 10));
    expect(s.outOfReach).toBe(true);
  });
});
