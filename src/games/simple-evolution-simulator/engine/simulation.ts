// The world/tick loop: a bounded, toroidal 2D grid with a food resource per
// cell, an organism population that moves, eats, ages, reproduces (with
// mutation), and dies. Everything here reads/writes plain data structures;
// rendering lives entirely in components/ and never touches this module's
// internals beyond reading its output.
//
// Every organism occupies exactly one grid cell — one genome, one energy
// pool, one position (see engine/types.ts's Organism). "Colonies" (see
// engine/colony.ts) are a purely relational structure layered on top: bonds
// between still-fully-independent organisms, recomputed fresh every tick
// from actual Moore-adjacent pairs, never a shared body/genome/energy pool.
import { areCompatible, computeColonies, type ColonyGraph } from "./colony";
import { createSeedGenome, mutate, scaleMutationConfig } from "./genome";
import { createOrganism, reproduce } from "./organism";
import { effectiveTraitValue, resolveCellTraits } from "./phenotype";
import { createRng, randomInt, type Rng } from "./rng";
import type { EnvironmentConfig, LineageRecord, MutationConfig, Organism, TraitId } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const BASE_METABOLIC_COST = 0.55;
const THERMAL_PENALTY_FACTOR = 0.5;
const REPRODUCE_ENERGY_THRESHOLD = 14;
const REPRODUCE_ENERGY_COST = 9;
const CHILD_START_ENERGY = 6;
const INITIAL_ENERGY = 10;
const BASE_MAX_AGE = 220;
const FOOD_MAX_PER_CELL = 4;
const MUTATION_RESISTANCE_MAX_DAMPING = 0.85;
// Real replication/repair overhead scales with how much sequence there is to
// copy or maintain — without this, genome length is free to drift (up or
// down) with no selection pressure either way, and settles at whatever the
// active gene set's motifs happen to need rather than evolving toward it.
const GENOME_MAINTENANCE_COST_PER_BASE = 0.0002;
const REPLICATION_COST_PER_BASE = 0.02;
const ENERGY_STORAGE_BASE_CAP = 20;
// First-pass tuning choice, retuned twice from an initial guess after
// empirically tracing individual organisms' energy tick-by-tick (see this
// session's report for the full walkthrough). Fully-expressed Structural
// Reinforcement (structuralIntegrity == 1) cuts an organism's *entire*
// per-tick upkeep (size + thermal-mismatch + genome-maintenance cost — see
// feedAndAge) by up to this fraction.
//
// Two things had to change from the first, more conservative attempt
// (thermal+maintenance only, reduction capped at 0.6), which produced zero
// surviving colonies over an 8000-tick run across several seeds — every
// bonded pair starved within ~10-20 ticks:
//   1. The reduction has to cover size cost too, not just thermal/maintenance
//      — those two are a small fraction of total upkeep next to the base
//      metabolic (size) cost, so no reduction to just them could ever
//      outweigh the cost of being bonded.
//   2. Structural Reinforcement's own density-scaling (see its
//      resolveStrength in genes.ts) had to become far more generous at low
//      density, because being bonded is a *large* cost: a bonded organism is
//      sessile (see moveOrganism below) and loses foraging entirely, capped
//      at whatever its own single cell regenerates — and a small, common
//      colony (e.g. a bonded pair, colony-neighbor density 1/8) could never
//      reach a high enough structuralIntegrity to compensate under a linear
//      density scaling; a 4th-root curve was needed to give even a pair a
//      real, non-token benefit.
// With both changes and this reduction ceiling, bonded pairs in an 8000-tick
// empirical run survive roughly 2-3x longer (~25-40 ticks vs ~10-20) and
// measurably drain energy slower than an identical solo organism (see the
// "Structural Reinforcement gives a densely-embedded colony member a real
// energy-cost payoff" test in simulation.spec.ts). Pairs specifically are
// still usually not indefinitely sustainable in this environment's default
// food scarcity — colony density has to climb well above a pair's 1/8 before
// upkeep can drop below the sessile regen-capped income floor, so a
// still-forming colony is genuinely fragile until it either grows past its
// first couple of members or its density-scaling motif has drifted close to
// its own consensus (both real, first-pass-honest simplifications, not bugs
// papered over — see todos/adhesion-compatibility-tuning.md for the adjacent,
// still-open tuning question).
const STRUCTURAL_REINFORCEMENT_COST_REDUCTION = 0.95;
// First-pass tuning choice: fully-expressed Growth Suppression
// (growthSuppression == 1) cuts an organism's effective replication rate by
// up to this fraction — the division-of-labor trade-off paired with
// Structural Reinforcement's cost reduction (deeply embedded members
// reproduce less; exposed/surface members reproduce at their full rate). See
// maybeReproduce below.
const GROWTH_SUPPRESSION_REPLICATION_PENALTY = 0.6;

/** Moore (8-neighbor) offsets, toroidal-wrapped by the caller. */
const NEIGHBOR_OFFSETS: Array<[number, number]> = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

export interface SimulationStats {
  population: number;
  maxGeneration: number;
  births: number;
  deaths: number;
  /** Organisms currently bonded into a colony of 2+ members (excludes solo
   * organisms with no compatible, adjacent colony-mate right now). */
  organismsInColonies: number;
  /** Largest current colony's member count (1 if the population has no
   * colony of size >= 2 at all, including an empty population). */
  largestColony: number;
}

export interface SimulationState {
  tick: number;
  width: number;
  height: number;
  organisms: Map<string, Organism>;
  /** Grid cell -> organism id, or null. Index = y * width + x. */
  grid: (string | null)[];
  /** Grid cell -> available food energy. */
  food: Float32Array;
  environment: EnvironmentConfig;
  mutation: MutationConfig;
  /** All-time archive, including dead organisms, for lineage/ancestry views. */
  lineage: Map<string, LineageRecord>;
  rng: Rng;
  nextId: number;
  stats: SimulationStats;
  /**
   * Organism id -> that organism's resolved regulatory trait values,
   * recomputed every tick after all mechanics run (see
   * refreshRegulatoryTraits). Only entries for traits actually produced by a
   * regulatory gene are present here; static traits are constants and live on
   * `organism.phenotype.traits` instead — see engine/phenotype.ts's
   * `effectiveTraitValue` for merging the two.
   */
  cellTraits: Map<string, Partial<Record<TraitId, number>>>;
  /** This tick's colony structure — connected components over currently
   * compatible-and-adjacent organism pairs. Recomputed from scratch every
   * tick (see refreshColonies); never a persistent structure that needs
   * explicit teardown. */
  colonies: ColonyGraph;
  /** This tick's actual compatible-and-adjacent organism id pairs — the
   * edges `colonies` connected components were built from. Exposed
   * separately (rather than just `colonies.colonyOf`) because rendering a
   * bond line should reflect a real direct edge, not just "same colony",
   * which can also include organisms connected only transitively through a
   * third party. */
  bonds: Array<[string, string]>;
}

export interface CreateSimulationOptions {
  width: number;
  height: number;
  seed: number;
  environment: EnvironmentConfig;
  mutation: MutationConfig;
  /** How many primordial organisms to seed near the center. */
  initialPopulation?: number;
}

function cellIndex(state: SimulationState, x: number, y: number): number {
  return y * state.width + x;
}

function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

function nextOrganismId(state: SimulationState): string {
  state.nextId += 1;
  return `org-${state.nextId}`;
}

export function createSimulation(options: CreateSimulationOptions): SimulationState {
  const rng = createRng(options.seed);
  const state: SimulationState = {
    tick: 0,
    width: options.width,
    height: options.height,
    organisms: new Map(),
    grid: new Array(options.width * options.height).fill(null),
    food: new Float32Array(options.width * options.height),
    environment: { ...options.environment },
    mutation: { ...options.mutation },
    lineage: new Map(),
    rng,
    nextId: 0,
    stats: { population: 0, maxGeneration: 0, births: 0, deaths: 0, organismsInColonies: 0, largestColony: 0 },
    cellTraits: new Map(),
    colonies: { colonyOf: new Map(), colonySize: new Map() },
    bonds: [],
  };

  for (let i = 0; i < state.food.length; i++) {
    state.food[i] = rng() * FOOD_MAX_PER_CELL;
  }

  const seedCount = options.initialPopulation ?? 4;
  const centerX = Math.floor(state.width / 2);
  const centerY = Math.floor(state.height / 2);
  for (let i = 0; i < seedCount; i++) {
    const x = wrap(centerX + randomInt(rng, 5) - 2, state.width);
    const y = wrap(centerY + randomInt(rng, 5) - 2, state.height);
    if (state.grid[cellIndex(state, x, y)]) continue;
    const genome = createSeedGenome(rng, state.environment);
    const id = nextOrganismId(state);
    const organism = createOrganism({
      id, genome, x, y, energy: INITIAL_ENERGY, generation: 0, parentIds: [], birthTick: 0,
    });
    placeOrganism(state, organism);
    recordBirth(state, organism);
  }

  refreshColonies(state);
  refreshCellRegulatoryTraits(state);
  refreshStats(state);
  return state;
}

function placeOrganism(state: SimulationState, organism: Organism): void {
  state.organisms.set(organism.id, organism);
  state.grid[cellIndex(state, organism.x, organism.y)] = organism.id;
}

function recordBirth(state: SimulationState, organism: Organism): void {
  state.lineage.set(organism.id, {
    id: organism.id,
    parentIds: organism.parentIds,
    generation: organism.generation,
    birthTick: organism.birthTick,
    deathTick: null,
    genome: organism.genome,
  });
  state.stats.births += 1;
  state.stats.maxGeneration = Math.max(state.stats.maxGeneration, organism.generation);
}

function killOrganism(state: SimulationState, organism: Organism): void {
  state.organisms.delete(organism.id);
  const idx = cellIndex(state, organism.x, organism.y);
  if (state.grid[idx] === organism.id) state.grid[idx] = null;
  const record = state.lineage.get(organism.id);
  if (record) record.deathTick = state.tick;
  state.stats.deaths += 1;
}

function maxAgeFor(organism: Organism): number {
  return BASE_MAX_AGE * (0.5 + organism.phenotype.traits.membraneStability * 0.5);
}

function freeNeighbor(state: SimulationState, x: number, y: number): { x: number; y: number } | null {
  const start = randomInt(state.rng, NEIGHBOR_OFFSETS.length);
  for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
    const [dx, dy] = NEIGHBOR_OFFSETS[(start + i) % NEIGHBOR_OFFSETS.length];
    const nx = wrap(x + dx, state.width);
    const ny = wrap(y + dy, state.height);
    if (!state.grid[cellIndex(state, nx, ny)]) return { x: nx, y: ny };
  }
  return null;
}

/**
 * Colony size (>= 1, a solo organism's own singleton colony counts as 1) for
 * the *previous* tick's colony refresh — colonies are recomputed at the end
 * of `step` from that tick's final positions, so anything read mid-tick
 * (movement gating, regulatory context, cost/reproduction payoffs below) is
 * necessarily a one-tick-old snapshot. That lag is consistent across every
 * consumer and avoids a circular dependency (colonies depend on final
 * positions, which depend on movement, which — for sessile colony
 * members — depends on colonies).
 */
function colonySizeOf(state: SimulationState, organismId: string): number {
  const root = state.colonies.colonyOf.get(organismId);
  return root ? state.colonies.colonySize.get(root) ?? 1 : 1;
}

/**
 * Fraction (0..1) of `organism`'s Moore neighbors that share its current
 * colony (per last tick's `state.colonies` snapshot) — the context signal
 * regulatory genes read. A solo organism (including one whose colony just
 * dissolved) provably has no neighbor sharing its own singleton colony, so
 * this is exactly 0 without needing to special-case it.
 */
function colonyNeighborDensity(state: SimulationState, organism: Organism): number {
  const ownColony = state.colonies.colonyOf.get(organism.id);
  if (!ownColony) return 0;
  let count = 0;
  for (const [dx, dy] of NEIGHBOR_OFFSETS) {
    const nx = wrap(organism.x + dx, state.width);
    const ny = wrap(organism.y + dy, state.height);
    const neighborId = state.grid[cellIndex(state, nx, ny)];
    if (neighborId && state.colonies.colonyOf.get(neighborId) === ownColony) count++;
  }
  return count / NEIGHBOR_OFFSETS.length;
}

/**
 * Recomputes the colony graph from scratch: scans every organism's actual
 * Moore-adjacent grid neighbors, keeps the ones that pass `areCompatible`
 * (both express the surface-protein gene and their realized sequences are
 * similar enough) as this tick's edges, then derives connected components.
 * Cheap and correct-by-construction: an edge that no longer holds (sequence
 * drift, a neighbor moved/died) simply isn't found again, so bonds "break"
 * for free without any teardown bookkeeping.
 */
function refreshColonies(state: SimulationState): void {
  const ids = Array.from(state.organisms.keys());
  const edges: Array<[string, string]> = [];
  const seenPairs = new Set<string>();

  for (const organism of state.organisms.values()) {
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const nx = wrap(organism.x + dx, state.width);
      const ny = wrap(organism.y + dy, state.height);
      const neighborId = state.grid[cellIndex(state, nx, ny)];
      if (!neighborId || neighborId === organism.id) continue;
      const pairKey = organism.id < neighborId ? `${organism.id}|${neighborId}` : `${neighborId}|${organism.id}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      const neighbor = state.organisms.get(neighborId);
      if (neighbor && areCompatible(organism, neighbor)) edges.push([organism.id, neighborId]);
    }
  }

  state.bonds = edges;
  state.colonies = computeColonies(ids, edges);
}

function regenerateFood(state: SimulationState): void {
  const regen = state.environment.foodRegenRate;
  if (regen <= 0) return;
  for (let i = 0; i < state.food.length; i++) {
    if (state.food[i] < FOOD_MAX_PER_CELL) {
      state.food[i] = Math.min(FOOD_MAX_PER_CELL, state.food[i] + regen);
    }
  }
}

function feedAndAge(state: SimulationState, organism: Organism): void {
  organism.age += 1;

  const idx = cellIndex(state, organism.x, organism.y);
  const bite = Math.min(state.food[idx], organism.phenotype.traits.metabolismEfficiency);
  state.food[idx] -= bite;
  organism.energy += bite;

  const sizeCost = BASE_METABOLIC_COST * (0.6 + organism.phenotype.traits.size * 0.5);
  const thermalMismatch = Math.abs(state.environment.temperature - organism.phenotype.traits.thermalTolerance);
  const thermalCost = thermalMismatch * THERMAL_PENALTY_FACTOR;
  const maintenanceCost = GENOME_MAINTENANCE_COST_PER_BASE * organism.genome.length;

  // Structural Reinforcement's real fitness payoff: a colony member's
  // expressed structuralIntegrity directly discounts its *entire* per-tick
  // upkeep — see STRUCTURAL_REINFORCEMENT_COST_REDUCTION's doc comment above
  // for why this has to cover size cost too, not just thermal/maintenance.
  const structuralIntegrity = effectiveTraitValue(organism.phenotype, "structuralIntegrity", state.cellTraits.get(organism.id));
  const costReduction = clamp01(structuralIntegrity) * STRUCTURAL_REINFORCEMENT_COST_REDUCTION;
  organism.energy -= (sizeCost + thermalCost + maintenanceCost) * (1 - costReduction);

  // Energy Storage caps how much surplus an organism can bank; anything
  // above the cap is wasted rather than hoarded, so the gene only pays off
  // when food is patchy enough for banked energy to matter.
  const storageCap = ENERGY_STORAGE_BASE_CAP * organism.phenotype.traits.energyStorage;
  if (organism.energy > storageCap) organism.energy = storageCap;
}

/** Best free neighbor by food available, or null if every neighbor is occupied. */
function bestFoodNeighbor(state: SimulationState, x: number, y: number): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bestFood = -Infinity;
  for (const [dx, dy] of NEIGHBOR_OFFSETS) {
    const nx = wrap(x + dx, state.width);
    const ny = wrap(y + dy, state.height);
    if (state.grid[cellIndex(state, nx, ny)]) continue;
    const food = state.food[cellIndex(state, nx, ny)];
    if (food > bestFood) {
      bestFood = food;
      best = { x: nx, y: ny };
    }
  }
  return best;
}

function moveOrganism(state: SimulationState, organism: Organism): void {
  // An organism currently bonded into a colony of 2+ (per last tick's
  // snapshot — see colonySizeOf) is sessile. Design choice, documented here
  // rather than derived from anything deeper: letting colony members keep
  // moving independently would make colonies flicker apart and reform almost
  // every tick as members wander off (bonds are recomputed fresh from
  // adjacency each tick, so a member that walks away simply un-bonds), which
  // defeats the point of colonies being a real, legible, persistent
  // structure — and correctly animating a *moving, connected* cluster as a
  // rigid unit on a grid is a much harder problem this pass doesn't need to
  // solve. Sessility is a consequence of currently being bonded, not a fixed
  // per-lineage trait: a solo organism (including one whose colony just
  // dissolved) moves normally again next tick.
  if (colonySizeOf(state, organism.id) > 1) return;
  if (state.rng() >= organism.phenotype.traits.motility) return;
  const useForaging = state.rng() < organism.phenotype.traits.foraging;
  const target = useForaging
    ? bestFoodNeighbor(state, organism.x, organism.y)
    : freeNeighbor(state, organism.x, organism.y);
  if (!target) return;
  state.grid[cellIndex(state, organism.x, organism.y)] = null;
  organism.x = target.x;
  organism.y = target.y;
  state.grid[cellIndex(state, organism.x, organism.y)] = organism.id;
}

/**
 * Spawns a genuinely new, independent, mutation-subject Organism next to
 * `organism` — unconditional for every organism now (see maybeReproduce):
 * this is the *only* reproduction mechanism, exactly like the
 * pre-multicellularity engine.
 */
function reproduceIndependent(state: SimulationState, organism: Organism, cost: number): void {
  const site = freeNeighbor(state, organism.x, organism.y);
  if (!site) return;

  const damping = 1 - organism.phenotype.traits.mutationResistance * MUTATION_RESISTANCE_MAX_DAMPING;
  const effectiveMutation = scaleMutationConfig(state.mutation, damping);
  const childGenome = mutate(organism.genome, effectiveMutation, state.rng);

  organism.energy -= cost;
  const child = reproduce({
    parent: organism,
    childId: nextOrganismId(state),
    childGenome,
    x: site.x,
    y: site.y,
    childEnergy: CHILD_START_ENERGY,
    birthTick: state.tick,
  });
  placeOrganism(state, child);
  recordBirth(state, child);
}

function maybeReproduce(state: SimulationState, organism: Organism): void {
  // Replication cost scales with genome length, so a bloated genome must
  // first bank proportionally more energy — the direct selection pressure
  // that keeps genome growth tied to whether the extra length earns its keep.
  const replicationCost = REPRODUCE_ENERGY_COST + organism.genome.length * REPLICATION_COST_PER_BASE;
  if (organism.energy < Math.max(REPRODUCE_ENERGY_THRESHOLD, replicationCost)) return;

  // Growth Suppression's division-of-labor trade-off: a deeply-embedded
  // colony member's expressed growthSuppression discounts its own effective
  // replication rate (see genes.ts's growth-suppression entry). Exposed
  // members and solo organisms (growthSuppression at or near baseline 0)
  // reproduce at essentially their full genomic rate.
  const growthSuppression = effectiveTraitValue(organism.phenotype, "growthSuppression", state.cellTraits.get(organism.id));
  const effectiveReplicationRate =
    organism.phenotype.traits.replicationRate * (1 - clamp01(growthSuppression) * GROWTH_SUPPRESSION_REPLICATION_PENALTY);
  if (state.rng() >= effectiveReplicationRate) return;

  reproduceIndependent(state, organism, replicationCost);
}

/** Recomputes `state.cellTraits` for every living organism, from this tick's
 * freshly-refreshed colony structure (see refreshColonies). Cheap enough to
 * redo in full every tick (bounded by population size): a solo organism
 * always resolves at density 0 without needing a colony-membership check
 * beyond the map lookups colonyNeighborDensity already does. */
function refreshCellRegulatoryTraits(state: SimulationState): void {
  state.cellTraits.clear();
  for (const organism of state.organisms.values()) {
    const neighborDensity = colonyNeighborDensity(state, organism);
    state.cellTraits.set(organism.id, resolveCellTraits(organism.phenotype, { neighborDensity }));
  }
}

function refreshStats(state: SimulationState): void {
  state.stats.population = state.organisms.size;
  let maxGen = state.stats.maxGeneration;
  let organismsInColonies = 0;
  let largestColony = state.organisms.size > 0 ? 1 : 0;
  for (const organism of state.organisms.values()) {
    maxGen = Math.max(maxGen, organism.generation);
    const size = colonySizeOf(state, organism.id);
    if (size > 1) organismsInColonies++;
    largestColony = Math.max(largestColony, size);
  }
  state.stats.maxGeneration = maxGen;
  state.stats.organismsInColonies = organismsInColonies;
  state.stats.largestColony = largestColony;
}

/** Advances the simulation by exactly one tick. */
export function step(state: SimulationState): void {
  state.tick += 1;
  regenerateFood(state);

  // Snapshot ids up front: organisms born this tick shouldn't act this tick,
  // and organisms that died mid-iteration are simply skipped.
  const ids = Array.from(state.organisms.keys());
  for (const id of ids) {
    const organism = state.organisms.get(id);
    if (!organism) continue;

    feedAndAge(state, organism);
    if (organism.energy <= 0 || organism.age > maxAgeFor(organism)) {
      killOrganism(state, organism);
      continue;
    }

    moveOrganism(state, organism);
    maybeReproduce(state, organism);
  }

  refreshColonies(state);
  refreshCellRegulatoryTraits(state);
  refreshStats(state);
}

export function getOrganisms(state: SimulationState): Organism[] {
  return Array.from(state.organisms.values());
}

export function getLineageRecords(state: SimulationState): LineageRecord[] {
  return Array.from(state.lineage.values());
}

/** Per-organism resolved regulatory trait values — see `SimulationState.cellTraits`. */
export function getCellTraits(state: SimulationState): Map<string, Partial<Record<TraitId, number>>> {
  return state.cellTraits;
}

/** This organism's current colony size (1 for a solo organism). */
export function getColonySize(state: SimulationState, organismId: string): number {
  return colonySizeOf(state, organismId);
}

/** This tick's actual bonded (compatible-and-adjacent) organism id pairs —
 * see `SimulationState.bonds`. */
export function getColonyBonds(state: SimulationState): Array<[string, string]> {
  return state.bonds;
}
