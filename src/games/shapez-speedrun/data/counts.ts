import { fillCounts, type LevelPlan, machineLabel, mergeBalancers, planLevel, windowStartSeconds, withFixedCounts } from "../engine/plan";
import type { Task } from "../engine/tasks";
import { machineRate, type UpgradeTiers } from "../engine/throughput";
import { levels } from "./levels";
import { tasks } from "./tasks";

export interface CountInputs {
  /** Level → target in seconds (squeezed when behind). */
  targets: Record<number, number>;
  splitsMs: Record<number, number>;
  /** Level → tiers it was finished with. */
  tiersAt: Record<number, UpgradeTiers>;
  tiers: UpgradeTiers;
  /** Counts that stay as built, by line task id and machine key (lines that are complete). */
  pinned?: Record<string, Record<string, number>>;
}

export interface Counts {
  levelPlans: Record<number, LevelPlan>;
  /** Plans for lines that aren't a level, by task id. */
  taskPlans: Record<string, LevelPlan>;
  /** Counts that don't belong to one plan, by placeholder name. */
  extras: Record<string, string>;
  fill: (text: string, task: Task) => string;
  /** The plan a task's counts come from. */
  planFor: (task: Task) => LevelPlan | undefined;
}

/** Which plan a task's counts belong to: its own for a paced line, else its level's. */
export function scopeOf(task: Task): string {
  return task.pace ? `task:${task.id}` : `level:${task.forLevel}`;
}

/** Every number the checklist and level reference show, from the current targets, splits and tiers. */
export function computeCounts({ targets, splitsMs, tiersAt, tiers, pinned = {} }: CountInputs): Counts {
  // Pins are kept by line; a level's plan takes the pins of its line.
  const fixed: Record<string, Record<string, number>> = {};
  for (const task of tasks) if (pinned[task.id]) fixed[scopeOf(task)] = pinned[task.id];

  const levelPlans: Record<number, LevelPlan> = {};
  for (const level of levels) {
    if (!level.layout) continue;
    const start = windowStartSeconds(level, splitsMs, (n) => targets[n]);
    const plan = planLevel({ required: level.required, targetSeconds: targets[level.level], startableAfter: level.startableAfter }, level.layout, tiersAt[level.level] ?? tiers, start);
    levelPlans[level.level] = withFixedCounts(plan, fixed[`level:${level.level}`]);
  }

  const taskPlans: Record<string, LevelPlan> = {};
  for (const task of tasks) {
    if (!task.pace || !task.layout) continue;
    const plan = planLevel({ required: task.pace.required, targetSeconds: targets[task.pace.byLevel] }, task.layout, tiers, 0);
    taskPlans[task.id] = withFixedCounts(plan, fixed[scopeOf(task)]);
  }

  const planFor = (task: Task) => taskPlans[task.id] ?? levelPlans[task.forLevel];
  const minersOf = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return (task && planFor(task)?.machines.find((m) => m.key.endsWith("miners"))?.count) ?? 0;
  };

  // The direct-to-hub lines each have one miner per belt until balancers merge them.
  const minersPerBelt = Math.max(1, Math.floor(machineRate("belt", tiers) / machineRate("miner", tiers)));
  const merge = ["l1-circles", "l3-squares", "stars"].reduce((sum, id) => sum + mergeBalancers(minersOf(id), minersPerBelt), 0);
  const belt2Rotators = levelPlans[5]?.modules ?? 0;

  const extras: Record<string, string> = {
    "merge balancers": machineLabel({ one: "balancer", many: "balancers" }, merge),
    "miners per belt": String(minersPerBelt),
    "belt2 rotators": machineLabel({ one: "rotator", many: "rotators" }, belt2Rotators),
  };

  return {
    levelPlans,
    taskPlans,
    extras,
    fill: (text, task) => fillCounts(text, planFor(task), extras),
    planFor,
  };
}
