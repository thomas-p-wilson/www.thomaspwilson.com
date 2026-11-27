import { describe, expect, it } from "vitest";
import { checklistEntries, type Task, unlockedBuildings } from "./tasks";
import { tasks } from "../data/tasks";

const staged: Task[] = [
  {
    id: "l5",
    forLevel: 5,
    obsoleteAfter: 5,
    stages: [
      { id: "prep", needs: 1, prep: true, text: "Prep" },
      { id: "finish", needs: 4, quick: true, text: "Finish", fullText: "Whole thing" },
    ],
  },
];

const texts = (levelsDone: number, ticked: Record<string, boolean> = {}, includeDone = false) =>
  checklistEntries(staged, levelsDone, ticked, includeDone).map((e) => e.text);

describe("checklistEntries", () => {
  it("hides tasks until their first stage is unlocked", () => {
    expect(texts(0)).toEqual([]);
  });

  it("shows prep with the missing building", () => {
    const [entry] = checklistEntries(staged, 1, {}, false);
    expect(entry.text).toBe("Prep");
    expect(entry.missing).toBe("rotator");
  });

  it("folds unticked prep into the full build once the next stage unlocks", () => {
    const [entry] = checklistEntries(staged, 4, {}, false);
    expect(entry.text).toBe("Whole thing");
    expect(entry.stageIds).toEqual(["prep", "finish"]);
    expect(entry.missing).toBeUndefined();
  });

  it("shows only the finish stage when prep was ticked", () => {
    expect(texts(4, { prep: true })).toEqual(["Finish"]);
  });

  it("hides a ticked prep stage until the next stage unlocks", () => {
    expect(texts(2, { prep: true })).toEqual([]);
  });

  it("lets stages be done out of order without ticking earlier ones", () => {
    expect(texts(4, { finish: true })).toEqual(["Prep"]);
  });

  it("lists done stages separately, after the open ones, when asked", () => {
    expect(checklistEntries(staged, 4, { prep: true }, true).map((e) => [e.text, e.done])).toEqual([
      ["Finish", false],
      ["Prep", true],
    ]);
  });

  it("drops the task once its level is done", () => {
    expect(texts(5)).toEqual([]);
  });

  it("marks quick wins, but not when earlier stages are folded in", () => {
    expect(checklistEntries(staged, 4, { prep: true }, false)[0].quick).toBe(true);
    expect(checklistEntries(staged, 4, {}, false)[0].quick).toBe(false);
  });
});

describe("ladders", () => {
  const ladder: Task[] = [
    {
      id: "l7",
      forLevel: 7,
      stages: [
        { id: "miners", needs: 0, prep: true, text: "Miners" },
        { id: "balancers", needs: 3, prep: true, text: "Balancers", fullText: "Miners + balancers" },
        { id: "painters", needs: 6, text: "Painters", fullText: "Whole line" },
      ],
    },
  ];
  const entries = (levelsDone: number, ticked: Record<string, boolean> = {}) => checklistEntries(ladder, levelsDone, ticked, false);

  it("climbs one rung per unlock, naming the next missing building", () => {
    expect(entries(0).map((e) => [e.text, e.missing])).toEqual([["Miners", "balancer"]]);
    expect(entries(3, { miners: true }).map((e) => [e.text, e.missing])).toEqual([["Balancers", "painter"]]);
  });

  it("folds skipped rungs into the latest one", () => {
    expect(entries(3).map((e) => [e.text, e.missing, e.stageIds])).toEqual([["Miners + balancers", "painter", ["miners", "balancers"]]]);
    expect(entries(6, { miners: true }).map((e) => [e.text, e.stageIds])).toEqual([["Whole line", ["balancers", "painters"]]]);
  });
});

describe("sorting", () => {
  const mixed: Task[] = [
    { id: "far-prep", forLevel: 9, stages: [{ id: "far-prep", needs: 0, prep: true, text: "far prep" }, { id: "far-x", needs: 8, text: "x" }] },
    { id: "near-prep", forLevel: 2, stages: [{ id: "near-prep", needs: 0, prep: true, text: "near prep" }, { id: "near-x", needs: 1, text: "x" }] },
    { id: "late-now", forLevel: 6, stages: [{ id: "late-now", needs: 0, text: "late now" }] },
    { id: "early-now", forLevel: 1, stages: [{ id: "early-now", needs: 0, text: "early now" }] },
  ];

  it("puts finishable-now before prep, each by level, done last", () => {
    expect(checklistEntries(mixed, 0, {}, false).map((e) => e.text)).toEqual(["early now", "late now", "near prep", "far prep"]);
    expect(checklistEntries(mixed, 0, { "early-now": true }, true).map((e) => e.text)).toEqual(["late now", "near prep", "far prep", "early now"]);
  });
});

describe("tasks data", () => {
  it("has unique stage ids", () => {
    const ids = tasks.flatMap((t) => t.stages.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a production line for every level, plus the star line", () => {
    const lines = tasks.filter((t) => t.line);
    expect(lines.filter((t) => !t.pace).map((t) => t.forLevel).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(lines.find((t) => t.pace)?.id).toBe("stars");
    for (const line of lines) expect(line.layout, line.id).toBeDefined();
  });

  it("opens the first purchases once the Upgrades button shows, after level 2", () => {
    expect(checklistEntries(tasks, 1, {}, false).map((e) => e.key)).toEqual([]);
    expect(checklistEntries(tasks, 2, {}, false).map((e) => e.key)).toEqual(["belt1", "proc1"]);
  });

  it("gives every multi-stage line a full text for each later stage", () => {
    for (const task of tasks) {
      task.stages.slice(1).forEach((stage, i) => {
        if (task.stages[i].prep) expect(stage.fullText, stage.id).toBeTruthy();
      });
    }
  });

  it("offers upgrade purchases only once every shape they cost can be made, and the shop is open", () => {
    // Level whose shape (or, for --CuCu--, whose rotator) each cost needs; the Upgrades button shows from level 3.
    const madeAfter: Record<string, number[]> = {
      belt1: [1],
      miner1: [3],
      proc1: [],
      "belt2-buy": [1, 4],
      "miner2-buy": [3, 6],
      "proc2-buy": [4],
      paint1: [8],
    };
    const stages = tasks.flatMap((t) => t.stages).filter((s) => s.upgrade);
    expect(stages.map((s) => s.id).sort()).toEqual(Object.keys(madeAfter).sort());
    for (const stage of stages) expect(stage.needs, stage.id).toBe(Math.max(2, ...madeAfter[stage.id]));
  });

  it("lists unlocked buildings", () => {
    expect(unlockedBuildings(0)).toEqual([]);
    expect(unlockedBuildings(4)).toEqual(["cutter", "balancer", "rotator"]);
  });
});
