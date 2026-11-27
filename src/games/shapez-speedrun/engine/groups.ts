// A level's production line as one group in the checklist, with an item per
// kind of building, generated from the level's plan:
//
//   Prep for Level 7
//     [ ] 9 circle miners feeding one belt
//     [ ] 9 red miners feeding one belt
//     [ ] Belts for 9 processing lanes
//     [ ] Add 35 balancers
//     [ ] Add 9 tunnels          (greyed out until tunnels unlock)
//     [ ] Add 9 red painters     (greyed out until painters unlock)
//     [ ] Connect to the hub
//
// - An item can be ticked once its building is unlocked.
// - Ticking records how many you built. If the plan later needs more before
//   the whole line is done, the item unticks itself and says how many to add.
// - Once every item is ticked, the line is in production and its counts stay
//   as built.

import type { BuildingKind, Layout } from "./layout";
import type { LevelPlan } from "./plan";
import { UNLOCKED_BY_LEVEL } from "./tasks";

/** Levels that must be done before each building can be placed. */
export const UNLOCK_LEVEL: Partial<Record<BuildingKind, number>> = {
  miner: 0,
  belt: 0,
  cutter: 1,
  trash: 1,
  balancer: 3,
  rotator: 4,
  tunnelIn: 5,
  tunnelOut: 5,
  painter: 6,
  painterMirrored: 6,
  rotatorCCW: 7,
  mixer: 8,
  stacker: 10,
};

export interface LineState {
  /** Item id → ticked. */
  ids: Record<string, boolean>;
  /** Item id → how many were built when it was ticked. */
  built: Record<string, number>;
  /** Task id → every item was ticked: the line is in production and its counts stay put. */
  complete: Record<string, boolean>;
}

export interface GroupItem {
  /** `${taskId}:${key}` */
  id: string;
  /** Machine key ("circle miners"), "lanes" or "connect". */
  key: string;
  text: string;
  needs: number;
  locked: boolean;
  /** The building still to unlock, for a locked item. */
  missing?: string;
  done: boolean;
  /** Ticked, but the plan now needs more than were built. */
  short?: { built: number; needed: number };
  /** Count the item asks for, recorded as built when ticked. */
  count?: number;
}

export interface ChecklistGroup {
  taskId: string;
  forLevel: number;
  title: string;
  hint?: string;
  /** How a tiled line splits into blocks, when it takes more than one. */
  blocksNote?: string;
  layout?: Layout;
  items: GroupItem[];
  complete: boolean;
  /** 0 can be finished now, 1 prep with locked items left, 2 nothing to do until something unlocks, 3 done. */
  rank: number;
}

export interface LineSpec {
  taskId: string;
  forLevel: number;
  /** Shown instead of "Level N", e.g. for the star line. */
  title?: string;
  hint?: string;
  layout?: Layout;
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function lineGroup(line: LineSpec, plan: LevelPlan, levelsDone: number, state: LineState): ChecklistGroup {
  const complete = !!state.complete[line.taskId];
  const tiled = !!line.layout?.tiled;
  const balancersUnlocked = levelsDone >= (UNLOCK_LEVEL.balancer ?? 3);
  const processing = plan.machines.filter((m) => m.kind !== "miner");

  const item = (key: string, needs: number, text: (count?: number) => string, count?: number): GroupItem => {
    const id = `${line.taskId}:${key}`;
    const ticked = !!state.ids[id];
    const built = state.built[id];
    const short = !complete && ticked && count !== undefined && built !== undefined && built < count ? { built, needed: count } : undefined;
    const locked = needs > levelsDone;
    return {
      id,
      key,
      needs,
      locked,
      missing: locked ? UNLOCKED_BY_LEVEL[needs] : undefined,
      done: ticked && !short,
      short,
      count: complete && built !== undefined ? built : count,
      text: text(complete && built !== undefined ? built : count),
    };
  };

  const items: GroupItem[] = [];
  for (const m of plan.machines.filter((x) => x.kind === "miner")) {
    const name = (n?: number) => plural(n ?? 0, m.one, m.many);
    // Per block, each ingredient's miners fill exactly one belt.
    const perBlock = (n?: number) => {
      const total = n ?? 0;
      if (plan.blocks <= 1) return name(total);
      return `${plural(Math.ceil(total / plan.blocks), m.one, m.many)} per block, ${total} in all`;
    };
    const merge = plan.blocks > 1 ? "merged onto one belt per block" : "merged onto one belt";
    items.push(
      item(
        m.key,
        0,
        (n) =>
          !tiled
            ? `${name(n)}, each on its own belt`
            : balancersUnlocked
              ? `${perBlock(n)}, ${merge}`
              : `${perBlock(n)} (${merge} once balancers unlock)`,
        m.count
      )
    );
  }
  if (processing.length > 0) {
    items.push(
      item(
        "lanes",
        0,
        (n) =>
          tiled && plan.blocks > 1
            ? `Belts for ${plan.blocks} blocks of ${plural(Math.ceil((n ?? 0) / plan.blocks), "processing lane", "processing lanes")} (see layout)`
            : `Belts for ${plural(n ?? 0, "processing lane", "processing lanes")} (see layout)`,
        plan.modules
      )
    );
  }
  const byUnlock = [...processing].sort((a, b) => (UNLOCK_LEVEL[a.kind] ?? 0) - (UNLOCK_LEVEL[b.kind] ?? 0));
  for (const m of byUnlock) {
    items.push(item(m.key, UNLOCK_LEVEL[m.kind] ?? 0, (n) => `Add ${plural(n ?? 0, m.one, m.many)}`, m.count));
  }
  const lastUnlock = Math.max(0, ...items.map((i) => i.needs));
  items.push(item("connect", lastUnlock, () => "Connect to the hub"));

  const open = items.filter((i) => !i.done && !i.locked);
  const anyLocked = items.some((i) => i.locked);
  const rank = complete ? 3 : open.length === 0 ? 2 : anyLocked ? 1 : 0;
  const title = line.title ?? `${anyLocked ? "Prep for " : ""}Level ${line.forLevel}`;

  const blocksNote =
    tiled && plan.blocks > 1
      ? `${plan.blocks} blocks side by side, so no belt overfills: each is its own row of ${plan.tilesPerBlock} tiles with one belt of each ingredient and its own belt to the hub.`
      : undefined;
  return { taskId: line.taskId, forLevel: line.forLevel, title, hint: line.hint, blocksNote, layout: line.layout, items, complete, rank };
}

/** Ticks or unticks an item, recording what was built and whether the line is now complete. */
export function toggleItem(state: LineState, group: ChecklistGroup, item: GroupItem, value: boolean): LineState {
  const ids = { ...state.ids };
  const built = { ...state.built };
  const complete = { ...state.complete };
  if (value) {
    ids[item.id] = true;
    if (item.count !== undefined) built[item.id] = item.count;
    const allDone = group.items.every((i) => i.id === item.id || i.done);
    if (allDone) complete[group.taskId] = true;
  } else {
    delete ids[item.id];
    delete built[item.id];
    delete complete[group.taskId];
  }
  return { ids, built, complete };
}

/** Counts that stay as built: every item of a complete line, by its task. */
export function pinnedCounts(state: LineState): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const [id, count] of Object.entries(state.built)) {
    const split = id.indexOf(":");
    const taskId = id.slice(0, split);
    const key = id.slice(split + 1);
    if (!state.complete[taskId] || key === "lanes") continue;
    out[taskId] ??= {};
    out[taskId][key] = count;
  }
  return out;
}
