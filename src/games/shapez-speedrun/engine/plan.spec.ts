import { describe, expect, it } from "vitest";
import { fillCounts, mergeBalancers, moduleSpec, planLevel, SECONDS_PER_BUILDING, tiersFromTicks, windowStartSeconds } from "./plan";
import { computeCounts } from "../data/counts";
import { lineGroup, pinnedCounts, toggleItem } from "./groups";
import { checklistEntries, tickedUpgrades } from "./tasks";
import { NO_UPGRADES } from "./throughput";
import { layouts } from "../data/layouts";
import { levels } from "../data/levels";
import { tasks } from "../data/tasks";

const level = (n: number) => levels[n - 1];
const target = (n: number) => level(n).targetSeconds;

describe("moduleSpec", () => {
  it("breaks a module's machines out by what they do", () => {
    const spec = moduleSpec(layouts.l9);
    // One tile: its mixer and painter, the three splitters and the hub merger, two tunnels.
    expect(spec.roles.map((r) => [r.key, r.perModule])).toEqual([
      ["red/blue mixers", 1],
      ["purple painters", 1],
      ["balancers", 4],
      ["tunnels", 2],
    ]);
    // Miners feed shared belts, so they're listed by what one module uses per cycle.
    expect(spec.demand.map((d) => [d.key, d.perCycle])).toEqual([
      ["circle miners", 1],
      ["red miners", 1],
      ["blue miners", 1],
    ]);
  });

  it("names mixers by both colours and painters by their colour", () => {
    const keys = moduleSpec(layouts.l12).roles.map((r) => r.key);
    expect(keys).toContain("green/blue mixers");
    expect(keys).toContain("red/cyan mixers");
    expect(keys).toContain("blue painters");
    expect(keys).toContain("white painters");
  });

  it("counts goal shapes per cycle, one item per miner", () => {
    expect(moduleSpec(layouts.l2).goalsPerCycle).toBe(1);
    expect(moduleSpec(layouts.l6).goalsPerCycle).toBe(2);
    expect(moduleSpec(layouts.l8).goalsPerCycle).toBe(2);
    expect(moduleSpec(layouts.l11).goalsPerCycle).toBe(2);
    expect(moduleSpec(layouts.l12).goalsPerCycle).toBe(1);
  });
});

describe("planLevel", () => {
  const l7 = level(7);
  const layout = l7.layout ?? layouts.l7;

  it("sizes by the slowest machine and rounds modules up", () => {
    const plan = planLevel(l7, layout, NO_UPGRADES, target(6));
    expect(plan.bottleneck).toBe("red painters");
    expect(plan.moduleRate).toBeCloseTo(1 / 3);
    // Enough tiles for the rate, rounded up to fill equal blocks.
    expect(plan.modules).toBeGreaterThanOrEqual(Math.ceil(300 / (target(7) - target(6)) / (1 / 3)));
    expect(plan.modules).toBe(plan.blocks * plan.tilesPerBlock);
    expect(plan.machines.find((m) => m.key === "red painters")?.count).toBe(plan.modules);
  });

  it("sizes miners to the level's rate, not one per module", () => {
    const plan = planLevel(l7, layout, NO_UPGRADES, target(6));
    const needed = Math.ceil(plan.rate / 0.4 - 1e-9);
    // Rounded up so every block gets the same number.
    expect(plan.machines.find((m) => m.key === "circle miners")?.count).toBe(Math.ceil(needed / plan.blocks) * plan.blocks);
    expect(plan.machines.find((m) => m.key === "red miners")?.count).toBe(Math.ceil(needed / plan.blocks) * plan.blocks);
  });

  it("splits a tiled level into blocks so no belt overfills", () => {
    for (const n of [7, 8, 9, 10]) {
      const lvl = level(n);
      if (!lvl.layout) continue;
      const plan = planLevel(lvl, lvl.layout, NO_UPGRADES, target(lvl.startableAfter));
      expect(plan.tilesPerBlock, `level ${n}`).toBeLessThanOrEqual(plan.perRow);
      for (const [key, perBlock] of Object.entries(plan.minersPerBlock)) {
        expect(perBlock, `level ${n} ${key}`).toBeLessThanOrEqual(plan.minersPerBelt);
        expect(plan.machines.find((m) => m.key === key)?.count).toBe(perBlock * plan.blocks);
      }
    }
    // Level 9 at base tiers needs more than one belt of each colour, so it splits.
    const l9 = level(9);
    expect(planLevel(l9, l9.layout ?? layouts.l9, NO_UPGRADES, target(8)).blocks).toBeGreaterThan(1);
  });

  it("says how many tiles fit in a row before a belt fills", () => {
    // A painter uses 1/3 of a circle and of a red per second; a base belt carries 2.
    expect(planLevel(l7, layout, NO_UPGRADES, target(6)).perRow).toBe(6);
  });

  it("needs fewer modules after an upgrade", () => {
    const base = planLevel(l7, layout, NO_UPGRADES, target(6)).modules;
    const upgraded = planLevel(l7, layout, { ...NO_UPGRADES, painting: 1 }, target(6)).modules;
    expect(upgraded).toBeLessThan(base);
  });

  it("needs more modules when its unlock comes late", () => {
    const onTime = planLevel(l7, layout, NO_UPGRADES, target(6)).modules;
    const late = planLevel(l7, layout, NO_UPGRADES, target(6) + 45).modules;
    expect(late).toBeGreaterThan(onTime);
  });

  it("sizes an overdue level to finish a minute after it can start", () => {
    const plan = planLevel(l7, layout, NO_UPGRADES, target(7) + 30);
    expect(plan.behind).toBe(true);
    expect(plan.windowSeconds).toBe(60);
  });

  it("sets aside time to place the buildings before the line delivers", () => {
    const plan = planLevel(l7, layout, NO_UPGRADES, target(6));
    // Painters need level 6's reward, so they go down inside the window; miners and balancers can be prepped.
    expect(plan.buildings).toBe(plan.machines.find((m) => m.key === "red painters")?.count);
    // Settled: the time for what it places is the time it set aside.
    expect(plan.buildSeconds).toBeCloseTo(plan.buildings * SECONDS_PER_BUILDING);
    expect(plan.rate).toBeCloseTo(l7.required / (plan.windowSeconds - plan.buildSeconds));
  });

  it("never sets aside more than half the window for building", () => {
    const plan = planLevel(level(12), layouts.l12, NO_UPGRADES, target(12) - 30);
    expect(plan.buildSeconds).toBeLessThanOrEqual(plan.windowSeconds / 2);
  });

  it("singular labels for one machine", () => {
    const plan = planLevel({ required: 1, targetSeconds: 1000 }, layouts.l7, NO_UPGRADES, 0);
    expect(plan.machines.find((m) => m.key === "red painters")?.label).toBe("1 red painter");
  });
});

describe("windowStartSeconds", () => {
  it("uses the real split of the unlocking level, else its target", () => {
    expect(windowStartSeconds(level(7), {}, target)).toBe(target(6));
    expect(windowStartSeconds(level(7), { 6: 400_000 }, target)).toBe(400);
    expect(windowStartSeconds(level(3), { 1: 50_000 }, target)).toBe(0);
  });
});

describe("tiers from ticks", () => {
  it("takes the highest tier ticked in each category", () => {
    const tiers = tiersFromTicks(tickedUpgrades(tasks, { belt1: true, "belt2-buy": true, miner1: true }));
    expect(tiers).toEqual({ belt: 2, miner: 1, processors: 0, painting: 0 });
  });
});

describe("filled-in text", () => {
  const counts = computeCounts({ targets: Object.fromEntries(levels.map((l) => [l.level, l.targetSeconds])), splitsMs: {}, tiersAt: {}, tiers: NO_UPGRADES });

  it("resolves every placeholder in the checklist and captions", () => {
    for (const task of tasks) {
      const texts = [...task.stages.flatMap((s) => [s.text, s.fullText ?? ""]), task.layout?.caption ?? ""];
      for (const text of texts) expect(counts.fill(text, task), task.id).not.toMatch(/\{[^}]*\}/);
    }
  });

  it("gives a count in every step that builds something, and no fixed counts", () => {
    // Steps that only buy an upgrade or keep an existing line running build nothing new.
    const buildsNothing = (id: string) => /-buy$|-line$/.test(id) && id !== "belt2-line";
    const fixedCount = /\b\d+(?:[–-]\d+)?\s+(?:\w+\s)?(?:miners?|cutters?|rotators?|painters?|mixers?|stackers?|balancers?|tunnels?)\b(?! gaps?)/;
    for (const task of tasks) {
      for (const stage of task.stages) {
        if (stage.upgrade || buildsNothing(stage.id)) continue;
        for (const text of [stage.text, stage.fullText].filter((t): t is string => !!t)) {
          expect(text, stage.id).toMatch(/\{[^}]+\}/);
          expect(text, stage.id).not.toMatch(fixedCount);
        }
      }
    }
  });

  it("sizes the star line to bank Processors I by Level 5", () => {
    const plan = counts.taskPlans.stars;
    expect(plan.rate).toBeCloseTo(500 / (target(5) - plan.buildSeconds));
    const stars = plan.machines.find((m) => m.key === "star miners")?.count;
    expect(stars).toBe(Math.ceil(plan.rate / 0.4 - 1e-9));
    expect(counts.fill("{star miners}", tasks.find((t) => t.id === "stars") ?? tasks[0])).toBe(`${stars} star miners`);
  });

  it("fills halves and extras", () => {
    const plan = planLevel(level(6), layouts.l6, NO_UPGRADES, target(4));
    const cutters = plan.machines.find((m) => m.key === "cutters")?.count ?? 0;
    expect(fillCounts("{cutters/2}", plan)).toBe(`${cutters / 2} cutter${cutters / 2 === 1 ? "" : "s"}`);
    expect(fillCounts("{x} and {y}", undefined, { x: "3 balancers" })).toBe("3 balancers and {y}");
  });

  it("merges one-miner belts onto as few belts as carry them", () => {
    expect(mergeBalancers(1, 5)).toBe(0);
    expect(mergeBalancers(5, 5)).toBe(4);
    expect(mergeBalancers(7, 5)).toBe(5);
  });

  it("keeps the text a step had when it was ticked", () => {
    const fill = (text: string) => text.replace("{merge balancers}", "9 balancers");
    const entries = checklistEntries(tasks, 3, { "free-inputs": true }, true, { fill, frozen: { "free-inputs": "Free up hub inputs: 4 balancers" } });
    expect(entries.find((e) => e.key === "free-inputs")?.text).toBe("Free up hub inputs: 4 balancers");
  });
});

describe("line groups", () => {
  const targets = Object.fromEntries(levels.map((l) => [l.level, l.targetSeconds]));
  const base = { targets, splitsMs: {}, tiersAt: {}, tiers: NO_UPGRADES };
  const l7 = tasks.find((t) => t.id === "l7") ?? tasks[0];
  const spec = { taskId: "l7", forLevel: 7, layout: l7.layout };
  const empty = { ids: {}, built: {}, complete: {} };
  const group = (levelsDone: number, state = empty, inputs = base) => {
    const plan = computeCounts({ ...inputs, pinned: pinnedCounts(state) }).planFor(l7);
    if (!plan) throw new Error("no plan");
    return lineGroup(spec, plan, levelsDone, state);
  };

  it("lists miners, lanes, each building in unlock order, then the hub", () => {
    const keys = group(0).items.map((i) => [i.key, i.needs]);
    expect(keys).toEqual([
      ["circle miners", 0],
      ["red miners", 0],
      ["lanes", 0],
      ["balancers", 3],
      ["tunnels", 5],
      ["red painters", 6],
      ["connect", 6],
    ]);
    expect(group(0).title).toBe("Prep for Level 7");
    expect(group(6).title).toBe("Level 7");
  });

  it("greys out what isn't unlocked, and says what it needs", () => {
    const g = group(3);
    expect(g.items.filter((i) => i.locked).map((i) => [i.key, i.missing])).toEqual([
      ["tunnels", "tunnel"],
      ["red painters", "painter"],
      ["connect", "painter"],
    ]);
  });

  it("merges miners onto one belt only once balancers are unlocked", () => {
    expect(group(0).items[0].text).toMatch(/\(merged onto one belt( per block)? once balancers unlock\)$/);
    expect(group(3).items[0].text).toMatch(/, merged onto one belt( per block)?$/);
  });

  it("says miners per block when a line splits into blocks", () => {
    const plan = computeCounts(base).planFor(l7);
    if (!plan) throw new Error("no plan");
    const one = lineGroup(spec, { ...plan, blocks: 1 }, 3, empty).items[0].text;
    expect(one).toBe(`${plan.machines[0].count} circle miners, merged onto one belt`);
    const two = lineGroup(spec, { ...plan, blocks: 2, machines: plan.machines.map((m) => (m.key === "circle miners" ? { ...m, count: 10 } : m)) }, 3, empty);
    expect(two.items[0].text).toBe("5 circle miners per block, 10 in all, merged onto one belt per block");
    expect(two.blocksNote).toMatch(/^2 blocks side by side/);
  });

  it("drops down once everything that can be done is ticked", () => {
    let state = empty;
    for (const item of group(3).items.filter((i) => !i.locked)) state = toggleItem(state, group(3, state), item, true);
    expect(group(3, state).rank).toBe(2);
    expect(group(0).rank).toBe(1);
    expect(group(6).rank).toBe(0);
  });

  it("unticks an item when the plan needs more than were built, until the line is complete", () => {
    const miners = group(0).items[0];
    const state = toggleItem(empty, group(0), miners, true);
    expect(group(0, state).items[0].done).toBe(true);

    // Level 6 finishes late: the window shrinks and Level 7 needs more circle miners.
    const late = { ...base, splitsMs: { 6: (target(7) - 70) * 1000 } };
    const after = group(6, state, late).items[0];
    expect(after.done).toBe(false);
    expect(after.short).toEqual({ built: miners.count, needed: after.count });
  });

  it("keeps a complete line's counts as built, everywhere", () => {
    let state = empty;
    for (const item of group(6).items) state = toggleItem(state, group(6, state), item, true);
    expect(group(6, state).complete).toBe(true);

    const late = { ...base, splitsMs: { 6: (target(7) - 70) * 1000 } };
    const g = group(6, state, late);
    expect(g.items.every((i) => i.done)).toBe(true);
    const built = group(6).items[0].count;
    const counts = computeCounts({ ...late, pinned: pinnedCounts(state) });
    expect(counts.levelPlans[7].machines.find((m) => m.key === "circle miners")?.count).toBe(built);
  });
});
