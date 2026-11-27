// Sizing a level's build from its layout: what one module contains, how fast
// it runs at the current upgrade tiers, and how many modules the level needs
// to finish on time.
//
// Every layout is balanced so that each miner puts one item into a "cycle":
// two-input machines (painter, mixer, stacker) get one of each per cycle. The
// slowest machine, relative to how much it handles per cycle, sets the pace.
//
// Miners aren't part of a module: they feed shared belts, so they're sized to
// what the level needs in total. The machines in a module come from the
// tileable layout when there is one, so its splitters, mergers and tunnels count.

import { type Building, type BuildingKind, displayRows, type Layout, parseLayout, tileColumns, traceLayout } from "./layout";
import { UNLOCK_LEVEL } from "./groups";
import { type Machine, machineRate, NO_UPGRADES, type UpgradeCategory, type UpgradeTiers } from "./throughput";

export interface Role {
  /** Placeholder name in checklist text, e.g. "circle miners" or "red/blue mixers". */
  key: string;
  /** The building it is, for when it unlocks. */
  kind: BuildingKind;
  one: string;
  many: string;
  perModule: number;
}

export interface ModuleSpec {
  /** Machines in one module (or one tile), not counting miners. */
  roles: Role[];
  /** Tiled layouts: machines at either end of a row, once per block (its `perModule` is per block). */
  edgeRoles: Role[];
  /** Raw items one module uses per cycle, by the miners that make them. */
  demand: (Omit<Role, "perModule"> & { perCycle: number })[];
  /** Goal shapes the module delivers per cycle. */
  goalsPerCycle: number;
  /** Each machine in the module (miners aside) and how many items it handles per cycle. */
  work: { role: string; machine: Machine; perCycle: number }[];
}

const MACHINE: Partial<Record<BuildingKind, Machine>> = {
  belt: "belt",
  tunnelIn: "belt",
  tunnelOut: "belt",
  miner: "miner",
  cutter: "cutter",
  rotator: "rotator",
  rotatorCCW: "rotator",
  balancer: "balancer",
  painter: "painter",
  painterMirrored: "painter",
  mixer: "mixer",
  stacker: "stacker",
};

const ITEM_NAME: Record<string, string> = {
  CuCuCuCu: "circle",
  RuRuRuRu: "square",
  SuSuSuSu: "star",
  WuWuWuWu: "windmill",
  u: "uncoloured",
  r: "red",
  g: "green",
  b: "blue",
  y: "yellow",
  p: "purple",
  c: "cyan",
  w: "white",
};

const COLOUR_ORDER = "rgbypcwu";

/** Within a kind: shapes before colours, colours in the game's order. */
const NAME_ORDER = ["circle", "square", "star", "windmill", "red", "green", "blue", "yellow", "purple", "cyan", "white", "uncoloured"];

/** Order roles are listed in: what you place first comes first. */
const ROLE_ORDER: BuildingKind[] = [
  "miner",
  "mixer",
  "painter",
  "cutter",
  "rotator",
  "rotatorCCW",
  "stacker",
  "balancer",
  "tunnelIn",
  "trash",
];

/** The role name a building has in the checklist, e.g. "red/blue mixers"; null for belts, hub and line ends. */
export function roleKeyOf(b: Building, received: Set<string>[]): string | null {
  return roleOf(b, received)?.key ?? null;
}

function roleOf(b: Building, received: Set<string>[]): { key: string; kind: BuildingKind; one: string; many: string } | null {
  const named = roleName(b, received);
  return named && { ...named, kind: b.kind === "painterMirrored" ? "painter" : b.kind };
}

function roleName(b: Building, received: Set<string>[]): { key: string; one: string; many: string } | null {
  const names = (set: Set<string> | undefined) => [...(set ?? [])].map((i) => ITEM_NAME[i] ?? i).join("/");
  switch (b.kind) {
    case "miner": {
      const name = ITEM_NAME[b.resource ?? ""] ?? "";
      return { key: `${name} miners`, one: `${name} miner`, many: `${name} miners` };
    }
    case "mixer": {
      // Named in a fixed colour order, so "red/blue" whichever side each colour comes in on.
      const colours = [...(received[0] ?? []), ...(received[1] ?? [])].sort((x, y) => COLOUR_ORDER.indexOf(x) - COLOUR_ORDER.indexOf(y));
      const name = colours.map((c) => ITEM_NAME[c] ?? c).join("/");
      return { key: `${name} mixers`, one: `${name} mixer`, many: `${name} mixers` };
    }
    case "painter":
    case "painterMirrored": {
      const name = names(received[1]);
      return { key: `${name} painters`, one: `${name} painter`, many: `${name} painters` };
    }
    case "cutter":
      return { key: "cutters", one: "cutter", many: "cutters" };
    case "rotator":
      return { key: "rotators", one: "rotator", many: "rotators" };
    case "rotatorCCW":
      return { key: "counter-clockwise rotators", one: "counter-clockwise rotator", many: "counter-clockwise rotators" };
    case "stacker":
      return { key: "stackers", one: "stacker", many: "stackers" };
    case "balancer":
      return { key: "balancers", one: "balancer", many: "balancers" };
    case "tunnelIn":
      return { key: "tunnels", one: "tunnel", many: "tunnels" };
    case "trash":
      return { key: "trash", one: "trash", many: "trash" };
    default:
      return null;
  }
}

const specCache = new WeakMap<Layout, ModuleSpec>();

export function moduleSpec(layout: Layout): ModuleSpec {
  const cached = specCache.get(layout);
  if (cached) return cached;

  const parsed = parseLayout(layout);
  const flow = traceLayout(parsed);
  const { buildings } = parsed;

  // Items per cycle through each building, worked out backwards from what feeds it.
  const linksInto = buildings.map(() => [] as { from: number; slot: number; input: number }[]);
  const outputsUsed = buildings.map(() => new Set<number>());
  for (const l of flow.links) {
    linksInto[l.to].push(l);
    outputsUsed[l.from].add(l.slot);
  }
  const memo = new Map<number, number>();
  const visiting = new Set<number>();
  const handled = (i: number): number => {
    const known = memo.get(i);
    if (known !== undefined) return known;
    if (visiting.has(i)) throw new Error(`Loop in layout at building ${i}`);
    visiting.add(i);
    const b = buildings[i];
    const inputs = [0, 0];
    for (const l of linksInto[i]) inputs[l.input] += sentOut(l.from);
    const value =
      b.kind === "miner"
        ? 1
        : b.kind === "painter" || b.kind === "painterMirrored" || b.kind === "mixer" || b.kind === "stacker"
          ? Math.min(inputs[0], inputs[1])
          : inputs[0] + inputs[1];
    visiting.delete(i);
    memo.set(i, value);
    return value;
  };
  /** Items per cycle leaving one used output of building i. */
  const sentOut = (i: number) => (buildings[i].kind === "balancer" ? handled(i) / Math.max(1, outputsUsed[i].size) : handled(i));

  const ordered = new Map<string, Role & { order: number }>();
  const edges = new Map<string, Role & { order: number }>();
  const addRole = (map: Map<string, Role & { order: number }>, b: Building, received: Set<string>[], amount: number) => {
    const role = roleOf(b, received);
    if (!role) return;
    const existing = map.get(role.key);
    if (existing) existing.perModule += amount;
    else {
      const kindOrder = ROLE_ORDER.indexOf(b.kind === "painterMirrored" ? "painter" : b.kind);
      const nameOrder = NAME_ORDER.findIndex((n) => role.key.startsWith(n));
      map.set(role.key, { ...role, perModule: amount, order: kindOrder * 100 + (nameOrder === -1 ? 99 : nameOrder) });
    }
  };
  const sorted = (map: Map<string, Role & { order: number }>) =>
    [...map.values()].sort((a, b) => a.order - b.order).map(({ order: _, ...r }) => r);

  const work: ModuleSpec["work"] = [];
  const demand = new Map<string, Role & { order: number }>();
  let goalsPerCycle = 0;
  buildings.forEach((b, i) => {
    if (b.kind === "hub") goalsPerCycle += handled(i);
    if (b.kind === "miner") {
      addRole(demand, b, flow.received[i], handled(i));
      return;
    }
    const machine = MACHINE[b.kind];
    if (machine) work.push({ role: roleOf(b, flow.received[i])?.key ?? "belts", machine, perCycle: handled(i) });
    if (!layout.tiled) addRole(ordered, b, flow.received[i], 1);
  });

  // A tileable layout: count what's in one tile, named by what flows through it.
  if (layout.tiled) {
    const composite = parseLayout({ rows: displayRows(layout, 1) });
    const compositeFlow = traceLayout(composite);
    const [first, end] = tileColumns(layout, 0);
    composite.buildings.forEach((b, i) => {
      if (b.kind === "miner") return;
      addRole(b.col >= first && b.col < end ? ordered : edges, b, compositeFlow.received[i], 1);
    });
  }

  const spec: ModuleSpec = {
    roles: sorted(ordered),
    edgeRoles: sorted(edges),
    demand: sorted(demand).map(({ perModule, ...r }) => ({ ...r, perCycle: perModule })),
    goalsPerCycle,
    work,
  };
  specCache.set(layout, spec);
  return spec;
}

export interface MachineCount {
  key: string;
  kind: BuildingKind;
  count: number;
  one: string;
  many: string;
  /** e.g. "7 circle miners" */
  label: string;
}

export interface LevelPlan {
  /** Seconds from when the level can start being built to its target time. */
  windowSeconds: number;
  /** Seconds of the window set aside for placing the buildings, before the line delivers. */
  buildSeconds: number;
  /**
   * Buildings that can only go down once the window opens: those the unlocking level's
   * reward (or a later one) makes available. Everything else can be prepped before.
   * Belts are dragged, so they aren't counted.
   */
  buildings: number;
  /** True when the level unlocked so late that the window had to be stretched to a minute. */
  behind: boolean;
  rate: number;
  modules: number;
  /** Goal shapes per second from one module. */
  moduleRate: number;
  /** What limits a module, e.g. "red painters". */
  bottleneck: string;
  /** Modules one row of tiles can hold before a shared belt is full. */
  perRow: number;
  /** Miners one belt carries at these tiers. */
  minersPerBelt: number;
  /**
   * Tiled levels are split into equal blocks: each its own row of tiles with one
   * belt of each ingredient and its own belt to the hub, so no belt overfills.
   */
  blocks: number;
  tilesPerBlock: number;
  /** Miner key → miners per block (all on one belt). */
  minersPerBlock: Record<string, number>;
  machines: MachineCount[];
  /** Machine keys whose count was frozen by ticking the step that builds them. */
  fixed: string[];
}

/** Shortest window a level is sized for, when it's unlocked late or already overdue. */
export const MIN_WINDOW_SECONDS = 60;
/** Rough time to place one building by hand, belts to it included. */
export const SECONDS_PER_BUILDING = 1.5;
/** Placing never takes more than this share of the window: past it, counts would balloon chasing a shrinking window. */
const MAX_BUILD_SHARE = 0.5;

export function machineLabel(role: Pick<Role, "one" | "many">, count: number): string {
  return `${count} ${count === 1 ? role.one : role.many}`;
}

export function planLevel(
  level: { required: number; targetSeconds: number; startableAfter?: number },
  layout: Layout,
  tiers: UpgradeTiers,
  startSeconds: number
): LevelPlan {
  const rawWindow = level.targetSeconds - startSeconds;
  const windowSeconds = Math.max(rawWindow, MIN_WINDOW_SECONDS);

  // The line only delivers once it's built, and how long that takes depends on how big
  // it is. Size for the whole window, then take out the time to place what that needs,
  // and repeat: each pass can only add buildings, so it settles in a few.
  let buildSeconds = 0;
  const unlockedBy = level.startableAfter ?? 0;
  const inWindow = (m: MachineCount) => (UNLOCK_LEVEL[m.kind] ?? 0) >= unlockedBy;
  let plan = sizeLine(level.required, windowSeconds, layout, tiers);
  const toPlace = () => plan.machines.filter(inWindow).reduce((sum, m) => sum + m.count, 0);
  for (let pass = 0; pass < 20; pass++) {
    const next = Math.min(toPlace() * SECONDS_PER_BUILDING, windowSeconds * MAX_BUILD_SHARE);
    if (next <= buildSeconds) break;
    buildSeconds = next;
    plan = sizeLine(level.required, windowSeconds - buildSeconds, layout, tiers);
  }
  return { ...plan, buildings: toPlace(), windowSeconds, buildSeconds, behind: rawWindow < MIN_WINDOW_SECONDS };
}

/** A line that delivers `required` goal shapes in `productionSeconds` of running. */
function sizeLine(
  required: number,
  productionSeconds: number,
  layout: Layout,
  tiers: UpgradeTiers
): Omit<LevelPlan, "windowSeconds" | "buildSeconds" | "buildings" | "behind"> {
  const spec = moduleSpec(layout);
  const rate = required / productionSeconds;

  let cycleSeconds = 0;
  let bottleneck = "";
  for (const w of spec.work) {
    const seconds = w.perCycle / machineRate(w.machine, tiers);
    if (seconds > cycleSeconds) {
      cycleSeconds = seconds;
      bottleneck = w.role;
    }
  }
  const moduleRate = spec.goalsPerCycle / cycleSeconds;
  const modules = Math.max(1, Math.ceil(rate / moduleRate - 1e-9));

  // Miners feed shared belts, so they're sized to the level's rate, not per module.
  const cyclesPerSecond = rate / spec.goalsPerCycle;
  const minerNeed = spec.demand.map((d) => ({
    d,
    count: Math.max(1, Math.ceil((cyclesPerSecond * d.perCycle) / machineRate("miner", tiers) - 1e-9)),
  }));
  const minersPerBelt = Math.max(1, Math.floor(machineRate("belt", tiers) / machineRate("miner", tiers)));
  const busiest = Math.max(spec.goalsPerCycle, ...spec.demand.map((d) => d.perCycle)) / cycleSeconds;
  const perRow = Math.max(1, Math.floor(machineRate("belt", tiers) / busiest + 1e-9));

  // Split a tiled level into the fewest equal blocks that keep every belt within capacity:
  // each block's tiles fit one row, and each ingredient's miners fit one belt.
  const blocks = layout.tiled
    ? Math.max(1, Math.ceil(modules / perRow), ...minerNeed.map((m) => Math.ceil(m.count / minersPerBelt)))
    : 1;
  const tilesPerBlock = Math.ceil(modules / blocks);
  const minersPerBlock: Record<string, number> = {};
  const miners = minerNeed.map(({ d, count }) => {
    const perBlock = Math.ceil(count / blocks);
    minersPerBlock[d.key] = perBlock;
    const total = perBlock * blocks;
    return { key: d.key, kind: d.kind, count: total, one: d.one, many: d.many, label: machineLabel(d, total) };
  });
  const tiles = layout.tiled ? tilesPerBlock * blocks : modules;
  // In each block, every ingredient's miners are merged onto its one belt with balancers.
  const mergers = layout.tiled ? blocks * Object.values(minersPerBlock).reduce((sum, n) => sum + mergeBalancers(n, minersPerBelt), 0) : 0;
  const edgeCounts = new Map(spec.edgeRoles.map((r) => [r.key, r.perModule * blocks]));

  const machines = [
    ...miners,
    ...spec.roles.map((r) => {
      const count = r.perModule * tiles + (edgeCounts.get(r.key) ?? 0) + (r.kind === "balancer" ? mergers : 0);
      return { key: r.key, kind: r.kind, count, one: r.one, many: r.many, label: machineLabel(r, count) };
    }),
  ];

  return {
    rate,
    modules: tiles,
    moduleRate,
    bottleneck,
    perRow,
    minersPerBelt,
    blocks,
    tilesPerBlock,
    minersPerBlock,
    machines,
    fixed: [],
  };
}

/**
 * When a level's build can start: the real split of the level that unlocks
 * its last building if there is one, otherwise that level's target time.
 */
export function windowStartSeconds(
  level: { startableAfter: number },
  splitsMs: Record<number, number>,
  targetSecondsOf: (level: number) => number
): number {
  if (level.startableAfter === 0) return 0;
  const split = splitsMs[level.startableAfter];
  return split !== undefined ? split / 1000 : targetSecondsOf(level.startableAfter);
}

/**
 * Fills "{circle miners}" with "7 circle miners", "{cutters/2}" with half the
 * cutters, "{modules}" with the module count, and any name in `extras` with
 * its value. Unknown names stay as they are.
 */
export function fillCounts(text: string, plan: LevelPlan | undefined, extras: Record<string, string> = {}): string {
  return text.replace(/\{([^}]+)\}/g, (whole, placeholder: string) => {
    if (placeholder in extras) return extras[placeholder];
    if (!plan) return whole;
    if (placeholder === "modules") return String(plan.modules);
    if (placeholder === "per row") return String(plan.perRow);
    if (placeholder === "blocks") return String(plan.blocks);
    if (placeholder === "tiles per block") return String(plan.tilesPerBlock);
    // A trailing "/n" divides the count ("cutters/2"); other slashes are part of the name ("red/blue mixers").
    const divided = /^(.*)\/(\d+)$/.exec(placeholder);
    const key = divided ? divided[1] : placeholder;
    const machine = plan.machines.find((m) => m.key === key);
    if (!machine) return whole;
    return divided ? machineLabel(machine, Math.ceil(machine.count / Number(divided[2]))) : machine.label;
  });
}

/**
 * Balancers to merge belts of `miners` each (one miner per belt) onto as few
 * belts as will carry them: every balancer turns two belts into one.
 */
export function mergeBalancers(miners: number, minersPerBelt: number): number {
  if (miners <= 1) return 0;
  return miners - Math.ceil(miners / Math.max(1, minersPerBelt));
}

export interface Upgrade {
  category: UpgradeCategory;
  tier: number;
}

/** Upgrade tiers bought, going by which purchase steps are ticked. */
export function tiersFromTicks(upgrades: Upgrade[]): UpgradeTiers {
  const tiers = { ...NO_UPGRADES };
  for (const u of upgrades) tiers[u.category] = Math.max(tiers[u.category], u.tier);
  return tiers;
}

/** The plan with some machine counts pinned, e.g. to what a ticked step said. */
export function withFixedCounts(plan: LevelPlan, fixed: Record<string, number> = {}): LevelPlan {
  const keys = Object.keys(fixed).filter((k) => plan.machines.some((m) => m.key === k));
  if (keys.length === 0) return plan;
  return {
    ...plan,
    machines: plan.machines.map((m) => (m.key in fixed ? { ...m, count: fixed[m.key], label: machineLabel(m, fixed[m.key]) } : m)),
    fixed: keys,
  };
}
