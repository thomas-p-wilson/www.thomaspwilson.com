import type { Layout } from "./layout";
import type { Upgrade } from "./plan";

// The checklist. Each task is a production line (or an upgrade) broken into
// stages, one per unlock that lets you build more of it. A stage becomes
// available once the level that unlocks its buildings is done.
//
// Rules for what the list shows:
// - Stages are ticked one by one. Ticking a stage doesn't tick earlier ones,
//   because things often get done out of order.
// - A "prep" stage that's still unticked when a later stage of the same task
//   becomes available is folded into that later stage, which then shows its
//   `fullText`: everything up to that point, as one step. Ticking that
//   combined entry ticks every stage it covers.
// - A task disappears once the level it's for is done (`obsoleteAfter`).
// - Most urgent first: things you can finish right now come before prep, and
//   within each group, the lower the level a task is for, the higher it sits.

export interface Stage {
  id: string;
  /** Number of levels that must be done before this stage can be built (0 = from the start). */
  needs: number;
  text: string;
  /** Shown instead of `text` when unticked earlier stages are folded into this one. */
  fullText?: string;
  /** Prep work that a later stage of the task supersedes once it's available. */
  prep?: boolean;
  /** Takes a few seconds: an upgrade purchase, or dropping buildings into gaps left for them. */
  quick?: boolean;
  /** Leave the task's layout off this stage (e.g. a purchase step). */
  noLayout?: boolean;
  /** Ticking this stage means you bought this upgrade tier. */
  upgrade?: Upgrade;
}

export interface Task {
  id: string;
  /** The level this task gets you towards; lower sorts higher. Upgrades use the level they matter for. */
  forLevel: number;
  stages: Stage[];
  /** Hide the whole task once this many levels are done. */
  obsoleteAfter?: number;
  /** Diagram of the finished line; tiles are tagged with the stage that builds them. */
  layout?: Layout;
  /** For a line that isn't a level: deliver this many shapes by the target of `byLevel`, sized like a level. */
  pace?: { required: number; byLevel: number };
  /** A production line: shown as a group with an item per kind of building, from its plan. */
  line?: { hint: string; title?: string };
}

export interface ChecklistEntry {
  /** Stable key for React: the stage this entry is anchored to. */
  key: string;
  /** The level the entry's task is for; its counts come from that level's plan. */
  forLevel: number;
  text: string;
  done: boolean;
  /** Building still missing for the next stage of a prep entry, e.g. "rotator". */
  missing?: string;
  quick: boolean;
  /** Stages ticked or unticked together when this entry is toggled. */
  stageIds: string[];
  /** The task's layout, drawn as of `layoutStage`: tiles from later stages show as gaps to leave. */
  layout?: Layout;
  layoutStage: number;
}

/** The building each level's reward unlocks, as named in "Missing …" notes. */
export const UNLOCKED_BY_LEVEL: Record<number, string> = {
  1: "cutter",
  3: "balancer",
  4: "rotator",
  5: "tunnel",
  6: "painter",
  7: "counter-clockwise rotator",
  8: "mixer",
  9: "merger",
  10: "stacker",
  11: "chainable extractor",
  12: "blueprints",
};

/** Buildings available after `levelsDone` levels, in unlock order. */
export function unlockedBuildings(levelsDone: number): string[] {
  return Object.entries(UNLOCKED_BY_LEVEL)
    .filter(([level]) => Number(level) <= levelsDone)
    .map(([, name]) => name);
}

export interface EntryText {
  /** Fills in live counts, e.g. "{circle miners}" → "7 circle miners". */
  fill?: (text: string, task: Task) => string;
  /** Text a stage showed when it was ticked, so done items keep their numbers. */
  frozen?: Record<string, string>;
}

export function checklistEntries(
  tasks: Task[],
  levelsDone: number,
  ticked: Record<string, boolean>,
  includeDone: boolean,
  { fill = (text) => text, frozen = {} }: EntryText = {}
): ChecklistEntry[] {
  const sortable: { entry: ChecklistEntry; forLevel: number; order: number }[] = [];

  tasks.forEach((task, taskIndex) => {
    if (task.obsoleteAfter !== undefined && levelsDone >= task.obsoleteAfter) return;

    const available = task.stages.filter((s) => s.needs <= levelsDone);
    if (available.length === 0) return;

    const latest = available[available.length - 1];
    const latestOpen = !ticked[latest.id];
    const folded: string[] = [];

    available.forEach((stage, stageIndex) => {
      const add = (entry: ChecklistEntry) => sortable.push({ entry, forLevel: task.forLevel, order: taskIndex * 100 + stageIndex });
      const isLatest = stage === latest;
      const drawing = { layout: stage.noLayout ? undefined : task.layout, layoutStage: task.stages.indexOf(stage), forLevel: task.forLevel };

      if (ticked[stage.id]) {
        if (includeDone) add({ key: stage.id, text: frozen[stage.id] ?? fill(stage.text, task), done: true, quick: false, stageIds: [stage.id], ...drawing });
        return;
      }

      if (stage.prep && !isLatest && latestOpen) {
        folded.push(stage.id);
        return;
      }

      const next = task.stages[task.stages.indexOf(stage) + 1];
      const missing = stage.prep && next && next.needs > levelsDone ? UNLOCKED_BY_LEVEL[next.needs] : undefined;
      const isFull = isLatest && folded.length > 0;

      add({
        key: stage.id,
        text: fill(isFull ? (stage.fullText ?? stage.text) : stage.text, task),
        done: false,
        missing,
        quick: !isFull && !!stage.quick,
        stageIds: isFull ? [...folded, stage.id] : [stage.id],
        ...drawing,
      });
    });
  });

  // Open before done; then finishable-now before prep; then by level; then list order.
  const rank = (e: ChecklistEntry) => (e.done ? 2 : e.missing ? 1 : 0);
  sortable.sort((a, b) => rank(a.entry) - rank(b.entry) || a.forLevel - b.forLevel || a.order - b.order);
  return sortable.map((s) => s.entry);
}

/** Upgrades bought, going by the ticked purchase steps. */
export function tickedUpgrades(tasks: Task[], ticked: Record<string, boolean>): Upgrade[] {
  return tasks.flatMap((t) => t.stages).flatMap((s) => (s.upgrade && ticked[s.id] ? [s.upgrade] : []));
}
