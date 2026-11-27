// Machine speeds from the shapez.io source (core/config.js + game/hub_goals.js).
//
// Base belt speed is 2 items/s; every other machine is a fixed fraction of it.
// Each upgrade category multiplies its machines by an additive improvement:
// 1.0 at start, +0.5 for tier I, +0.5 for tier II, +1.0 for tier III.

export type UpgradeCategory = "belt" | "miner" | "processors" | "painting";
export type Machine = "belt" | "miner" | "balancer" | "cutter" | "rotator" | "stacker" | "painter" | "mixer";

const BELT_BASE = 2;

const MACHINE_SPEC: Record<Machine, { category: UpgradeCategory; fraction: number }> = {
  belt: { category: "belt", fraction: 1 },
  balancer: { category: "belt", fraction: 2 },
  miner: { category: "miner", fraction: 1 / 5 },
  cutter: { category: "processors", fraction: 1 / 4 },
  rotator: { category: "processors", fraction: 1 },
  stacker: { category: "processors", fraction: 1 / 8 },
  painter: { category: "painting", fraction: 1 / 6 },
  mixer: { category: "painting", fraction: 1 / 5 },
};

const TIER_IMPROVEMENTS = [0.5, 0.5, 1, 1, 2, 1, 1];

export function upgradeMultiplier(tier: number): number {
  let multiplier = 1;
  for (let i = 0; i < tier; i++) multiplier += TIER_IMPROVEMENTS[i] ?? 1;
  return multiplier;
}

export type UpgradeTiers = Record<UpgradeCategory, number>;

export const NO_UPGRADES: UpgradeTiers = { belt: 0, miner: 0, processors: 0, painting: 0 };

/** Items per second one machine handles at the given upgrade tiers. */
export function machineRate(machine: Machine, tiers: UpgradeTiers): number {
  const spec = MACHINE_SPEC[machine];
  return BELT_BASE * spec.fraction * upgradeMultiplier(tiers[spec.category]);
}

/** How many of a machine are needed to sustain `itemsPerSecond`. */
export function machinesNeeded(machine: Machine, itemsPerSecond: number, tiers: UpgradeTiers): number {
  if (itemsPerSecond <= 0) return 0;
  return Math.ceil(itemsPerSecond / machineRate(machine, tiers) - 1e-9);
}

/** Delivery rate needed to make `count` shapes in `seconds`. */
export function rateNeeded(count: number, seconds: number): number {
  if (seconds <= 0) return Number.POSITIVE_INFINITY;
  return count / seconds;
}
