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
import { baselineTemperature, incidentFluxWm2, orbitalDistanceAu } from "./astrophysics";
import {
  FOOD_ANCHOR_OFFSET_RANGE, generateBiomeOffsetField, localFoodRegenRate, localTemperature,
  TEMPERATURE_ANCHOR_OFFSET_RANGE,
} from "./biome";
import { areCompatible, computeColonies, type ColonyGraph } from "./colony";
import { createSeedGenome, mutate, scaleMutationConfig } from "./genome";
import { createOrganism, preferredTemperature, reproduce } from "./organism";
import { effectiveTraitValue, resolveCellTraits } from "./phenotype";
import { createRng, randomInt, type Rng } from "./rng";
import type { AstroConfig, EnvironmentConfig, LineageRecord, MutationConfig, Organism, TraitId } from "./types";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const BASE_METABOLIC_COST = 0.55;
const THERMAL_PENALTY_FACTOR = 0.5;
// Mismatch-to-own-niche throttles fecundity directly, on top of (not instead
// of) the metabolic thermalCost above — separating "does this organism
// survive" from "does it establish a lineage here" avoids the dead end of
// just raising THERMAL_PENALTY_FACTOR: a bigger flat metabolic tax turned out
// to be bimodal (either too weak to matter, or high enough to wipe out the
// whole population — nearly everyone carries *some* mismatch most of the
// time, so it can't discriminate "settled well" from "settled badly"). These
// two hit reproduction specifically: a badly-mismatched organism can still
// live and wander, it just won't successfully found a colony there.
//
// Empirically tuned down hard from an initial guess (1.5 / 2): across 11
// seeds x 3000 ticks, that guess pushed extinction from a baseline ~3/11 to
// 7/11 with barely better actual-vs-random-placement mismatch discrimination
// than these gentler values give. The population here is small (starts at 4)
// and the temperature field is now wide (TEMPERATURE_ANCHOR_OFFSET_RANGE,
// engine/biome.ts) — early-generation stochastic extinction is a real risk
// this mechanic can tip over, not just a "make it stronger for a stronger
// effect" dial.
const REPRO_MISMATCH_RATE_SENSITIVITY = 0.3;
const REPRO_MISMATCH_COST_SENSITIVITY = 0.5;
// Absolute-temperature "pace of life" — independent of an organism's own
// thermalTolerance/preferredTemperature, mirrors real ectotherm biology
// (metabolic and developmental rates broadly track ambient temperature up to
// an optimum, then fall off from heat stress — the Q10 effect). Every
// organism at a given cell experiences the same pace, however well-adapted it
// is to that cell: this is what makes some absolute regions of the map
// generally richer for everyone, layered on top of (not replacing) the
// relative, evolvable mismatch pressure above.
const PACE_OPTIMUM = 0.6; // slightly warm of the 0.5 midpoint, not the hot extreme
const PACE_CURVE_STEEPNESS = 3;
const PACE_FLOOR = 0.3; // pace never bottoms out at exactly 0 even at the thermal extremes
// Kept deliberately gentle (see REPRO_MISMATCH_*'s tuning note above): unlike
// mismatch, pace applies to *every* organism regardless of adaptation, so
// even a modest sensitivity (0.15) measurably worsened extinction risk in the
// same sweep (3/11 -> 7/11) since a wide swath of the map now sits far from
// PACE_OPTIMUM. 0.05 still gives a real, measured effect without that cliff.
const PACE_COST_SENSITIVITY = 0.05;
const PACE_REPRODUCTION_SENSITIVITY = 0.05;
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
//      density, because being bonded was, at the time, a *large* cost: every
//      colony of 2+ was unconditionally sessile and lost foraging entirely
//      (a since-reverted blanket simplification — see moveColony below and
//      todos/multicellular-motility.md), capped at whatever its own single
//      cell regenerated — and a small, common colony (e.g. a bonded pair,
//      colony-neighbor density 1/8) could never reach a high enough
//      structuralIntegrity to compensate under a linear density scaling; a
//      4th-root curve was needed to give even a pair a real, non-token
//      benefit.
// With both changes and this reduction ceiling, bonded pairs in an 8000-tick
// empirical run (back when colonies were still unconditionally sessile)
// survived roughly 2-3x longer (~25-40 ticks vs ~10-20) and measurably
// drained energy slower than an identical solo organism (see the
// "Structural Reinforcement gives a densely-embedded colony member a real
// energy-cost payoff" test in simulation.spec.ts). That specific "still
// usually not indefinitely sustainable" framing predates moveColony: now
// that colonies can move and forage collectively instead of being foraging-
// locked, the actual survival dynamics of a small colony are worth
// re-measuring rather than assumed unchanged — this reduction ceiling itself
// hasn't been re-tuned against the new movement model yet.
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

/** Current-tick distribution summary for a per-organism metric. Zeroed
 * (rather than e.g. +/-Infinity) when the population is empty, so callers
 * never need to special-case "no organisms" before rendering it. */
export interface StatSummary {
  avg: number;
  min: number;
  max: number;
}

const ZERO_STAT_SUMMARY: StatSummary = { avg: 0, min: 0, max: 0 };

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
  /** Genome length (base pairs) across the current population. */
  genomeLength: StatSummary;
  /** Age (ticks since birth) across the current population. */
  age: StatSummary;
  /** Colony size (1 for a solo organism) across the current population —
   * same per-organism values `organismsInColonies`/`largestColony` are
   * derived from. */
  colonySize: StatSummary;
  /** The grid's actual mean local temperature (baseline plus every cell's
   * biome offset, clamped per-cell — see engine/biome.ts), normalized [0,1]
   * like `environment.temperature`. A whole-planet figure, not a per-organism
   * StatSummary; distinct from the astro-derived baseline itself since
   * clamping and the biome-offset field's own random anchors can pull the
   * true spatial average slightly away from it. */
  avgTemperature: number;
  /** Instantaneous incident stellar flux at the current orbital distance, in
   * W/m^2 (see engine/astrophysics.ts's incidentFluxWm2) — 0 for a world with
   * no AstroConfig, which has no star/orbit to derive it from. */
  incidentFluxWm2: number;
}

/** One sampled point in a run's population-statistics history — see
 * `SimulationState.history`. */
export interface StatHistorySample {
  tick: number;
  population: number;
  genomeLength: StatSummary;
  age: StatSummary;
  colonySize: StatSummary;
  avgTemperature: number;
  incidentFluxWm2: number;
}

// Recording every tick would grow unbounded over a long-running sim; sampling
// every Nth tick keeps trendlines smooth enough to read while bounding both
// memory and per-sample render cost. Once the ring buffer fills, the oldest
// sample is dropped for each new one — a run's history view scrolls forward
// rather than growing forever.
const STATS_HISTORY_SAMPLE_INTERVAL_TICKS = 10;
const STATS_HISTORY_MAX_SAMPLES = 600;
/** How many ticks a total die-off stays empty before a fresh spark of life
 * spontaneously appears (see spawnAbiogenesis) — long enough to read as a
 * real event, not instant, short enough not to feel stuck/broken. At the
 * default 8 ticks/second x 1x speed, ~19 seconds. */
const ABIOGENESIS_WAIT_TICKS = 150;

export interface SimulationState {
  tick: number;
  width: number;
  height: number;
  organisms: Map<string, Organism>;
  /** Grid cell -> organism id, or null. Index = y * width + x. */
  grid: (string | null)[];
  /** Grid cell -> available food energy. */
  food: Float32Array;
  /** Grid cell -> fixed offset from environment.temperature (see
   * engine/biome.ts). Generated once at creation and never touched again;
   * combine with the live environment.temperature via getLocalTemperature to
   * get a cell's actual local temperature (see todos/planetary-biomes.md). */
  biomeOffset: Float32Array;
  /** Grid cell -> fixed relative richness offset from environment.foodRegenRate
   * (see engine/biome.ts's localFoodRegenRate). Generated once at creation,
   * independently of biomeOffset, so hot/dry, hot/wet, cold/dry, and cold/wet
   * regions can all emerge on the same planet rather than food richness being
   * hardcoded to track temperature. */
  foodOffset: Float32Array;
  environment: EnvironmentConfig;
  /** Optional star/orbit parameters (see engine/astrophysics.ts). When
   * present, `environment.temperature` is recomputed from these every tick
   * instead of staying flat — see AstroConfig's doc comment in types.ts. */
  astro?: AstroConfig;
  mutation: MutationConfig;
  /** All-time archive, including dead organisms, for lineage/ancestry views. */
  lineage: Map<string, LineageRecord>;
  rng: Rng;
  nextId: number;
  stats: SimulationStats;
  /** Sampled history of population statistics over the run, oldest first —
   * see `recordStatsHistorySample`. Bounded ring buffer, not a full per-tick
   * archive. */
  history: StatHistorySample[];
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
  /** Tick population first hit 0, or null if currently non-extinct. Drives
   * ABIOGENESIS_WAIT_TICKS below — a total die-off isn't a dead end, it's a
   * real, expected outcome for a small early population (see maybeReproduce's
   * REPRO_MISMATCH_* tuning note), so life gets another spontaneous chance to
   * take hold rather than leaving the world empty forever. */
  extinctSinceTick: number | null;
}

export interface CreateSimulationOptions {
  width: number;
  height: number;
  seed: number;
  environment: EnvironmentConfig;
  /** See SimulationState.astro — omit to keep a flat, directly-set baseline
   * (e.g. every existing test constructs a state this way). */
  astro?: AstroConfig;
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

/** A cell's actual local temperature — the live baseline plus this cell's
 * fixed spatial offset (see engine/biome.ts). */
function cellTemperature(state: SimulationState, x: number, y: number): number {
  return localTemperature(state.environment.temperature, state.biomeOffset, cellIndex(state, x, y));
}

/** A cell's actual local food-regeneration rate — the live baseline scaled by
 * this cell's fixed spatial richness offset (see engine/biome.ts). */
function cellFoodRegenRate(state: SimulationState, x: number, y: number): number {
  return localFoodRegenRate(state.environment.foodRegenRate, state.foodOffset, cellIndex(state, x, y));
}

/**
 * Absolute-temperature "pace of life" at a given local temperature, in [PACE_FLOOR, 1]
 * — a symmetric hump peaking at PACE_OPTIMUM and falling off toward both thermal
 * extremes (real ectotherm biology: metabolic/developmental rate tracks ambient
 * temperature up to an optimum, then heat stress drags it back down — not an
 * unbounded "hotter is always better" ramp). Independent of any organism's own
 * thermalTolerance/preferredTemperature: every organism at this cell experiences
 * the same pace, however well it's personally adapted here — see
 * PACE_COST_SENSITIVITY/PACE_REPRODUCTION_SENSITIVITY for how it's applied.
 */
function thermalPace(localTemp: number): number {
  const pace = 1 - PACE_CURVE_STEEPNESS * (localTemp - PACE_OPTIMUM) ** 2;
  return Math.min(1, Math.max(PACE_FLOOR, pace));
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
    biomeOffset: new Float32Array(options.width * options.height),
    foodOffset: new Float32Array(options.width * options.height),
    environment: { ...options.environment },
    astro: options.astro ? { stellar: { ...options.astro.stellar }, orbital: { ...options.astro.orbital } } : undefined,
    mutation: { ...options.mutation },
    lineage: new Map(),
    rng,
    nextId: 0,
    stats: {
      population: 0, maxGeneration: 0, births: 0, deaths: 0, organismsInColonies: 0, largestColony: 0,
      genomeLength: ZERO_STAT_SUMMARY, age: ZERO_STAT_SUMMARY, colonySize: ZERO_STAT_SUMMARY,
      avgTemperature: 0, incidentFluxWm2: 0,
    },
    history: [],
    cellTraits: new Map(),
    colonies: { colonyOf: new Map(), colonySize: new Map() },
    bonds: [],
    extinctSinceTick: null,
  };

  for (let i = 0; i < state.food.length; i++) {
    state.food[i] = rng() * FOOD_MAX_PER_CELL;
  }
  state.biomeOffset = generateBiomeOffsetField(state.width, state.height, rng, TEMPERATURE_ANCHOR_OFFSET_RANGE);
  // Independent anchor set/field from biomeOffset (see engine/biome.ts) — food
  // richness varies on its own axis rather than being tied to temperature.
  state.foodOffset = generateBiomeOffsetField(state.width, state.height, rng, FOOD_ANCHOR_OFFSET_RANGE);

  // If astro-driven, the baseline has to be derived before the seed loop
  // below spawns any organism adapted to it (spawnPrimordialOrganism reads
  // state.environment.temperature via cellTemperature).
  if (state.astro) {
    state.environment.temperature = baselineTemperature(state.astro.stellar, state.astro.orbital, state.tick);
  }

  const seedCount = options.initialPopulation ?? 4;
  const centerX = Math.floor(state.width / 2);
  const centerY = Math.floor(state.height / 2);
  for (let i = 0; i < seedCount; i++) {
    const x = wrap(centerX + randomInt(rng, 5) - 2, state.width);
    const y = wrap(centerY + randomInt(rng, 5) - 2, state.height);
    if (state.grid[cellIndex(state, x, y)]) continue;
    spawnPrimordialOrganism(state, x, y);
  }

  refreshColonies(state);
  refreshCellRegulatoryTraits(state);
  refreshStats(state);
  recordStatsHistorySample(state);
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

/** Creates and places one fresh, non-mutated organism adapted to its own
 * spawn site's local temperature — shared by createSimulation's initial seed
 * loop and spawnAbiogenesis below (a total die-off's spontaneous restart).
 * birthTick is always the current tick, which for the initial seed loop is 0
 * anyway. */
function spawnPrimordialOrganism(state: SimulationState, x: number, y: number): void {
  // Seeded adapted to *this* site's local temperature, not the world's flat
  // baseline — a planet's earliest life should start out suited to the
  // actual patch of ground it arose on (see todos/planetary-biomes.md).
  const siteTemperature = cellTemperature(state, x, y);
  const localEnvironment = { ...state.environment, temperature: siteTemperature };
  const genome = createSeedGenome(state.rng, localEnvironment);
  const id = nextOrganismId(state);
  const organism = createOrganism({
    id, genome, x, y, energy: INITIAL_ENERGY, generation: 0, parentIds: [], birthTick: state.tick,
    birthTemperature: siteTemperature,
  });
  placeOrganism(state, organism);
  recordBirth(state, organism);
}

/**
 * A total die-off isn't a permanent dead end: after ABIOGENESIS_WAIT_TICKS
 * spent empty, a fresh spark of life spontaneously appears at a uniformly
 * random cell (real early-Earth abiogenesis plausibly happened, failed, and
 * re-occurred more than once before life took hold for good) — no occupancy
 * check needed since population 0 means the whole grid is empty.
 */
function spawnAbiogenesis(state: SimulationState): void {
  const x = randomInt(state.rng, state.width);
  const y = randomInt(state.rng, state.height);
  spawnPrimordialOrganism(state, x, y);
}

function killOrganism(state: SimulationState, organism: Organism): void {
  state.organisms.delete(organism.id);
  const idx = cellIndex(state, organism.x, organism.y);
  if (state.grid[idx] === organism.id) state.grid[idx] = null;
  const record = state.lineage.get(organism.id);
  if (record) record.deathTick = state.tick;
  state.stats.deaths += 1;
}

/** This organism's own death-age threshold — used both by the tick loop's
 * death check and by the UI's age color mode to normalize age as a fraction
 * of *this organism's* lifespan rather than a world-wide average. */
export function maxAgeFor(organism: Organism): number {
  return BASE_MAX_AGE * (0.5 + organism.phenotype.traits.membraneStability * 0.5);
}

/** This organism's own energy-storage cap — see the Energy Storage gene's
 * doc comment near ENERGY_STORAGE_BASE_CAP's use in `feedAndAge`. Exported
 * so the UI's energy color mode can normalize against the same per-organism
 * cap the engine actually enforces, rather than a fixed or world-wide max. */
export function energyCapFor(organism: Organism): number {
  return ENERGY_STORAGE_BASE_CAP * organism.phenotype.traits.energyStorage;
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
 * positions, which depend on movement, which — for colony members moving as
 * a group, see moveColony — depends on knowing colony membership).
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
  const baseRegen = state.environment.foodRegenRate;
  if (baseRegen <= 0) return;
  for (let i = 0; i < state.food.length; i++) {
    if (state.food[i] < FOOD_MAX_PER_CELL) {
      const regen = localFoodRegenRate(baseRegen, state.foodOffset, i);
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

  const localTemp = cellTemperature(state, organism.x, organism.y);
  const sizeCost = BASE_METABOLIC_COST * (0.6 + organism.phenotype.traits.size * 0.5);
  const thermalMismatch = Math.abs(localTemp - preferredTemperature(organism));
  const thermalCost = thermalMismatch * THERMAL_PENALTY_FACTOR;
  const maintenanceCost = GENOME_MAINTENANCE_COST_PER_BASE * organism.genome.length;

  // Absolute-temperature pace of life (see thermalPace) — independent of this
  // organism's own thermalMismatch: baseline upkeep costs more away from
  // PACE_OPTIMUM regardless of adaptation, on top of (not instead of) the
  // mismatch-driven thermalCost above.
  const paceCostMultiplier = 1 + (1 - thermalPace(localTemp)) * PACE_COST_SENSITIVITY;

  // Structural Reinforcement's real fitness payoff: a colony member's
  // expressed structuralIntegrity directly discounts its *entire* per-tick
  // upkeep — see STRUCTURAL_REINFORCEMENT_COST_REDUCTION's doc comment above
  // for why this has to cover size cost too, not just thermal/maintenance.
  const structuralIntegrity = effectiveTraitValue(organism.phenotype, "structuralIntegrity", state.cellTraits.get(organism.id));
  const costReduction = clamp01(structuralIntegrity) * STRUCTURAL_REINFORCEMENT_COST_REDUCTION;
  organism.energy -= ((sizeCost + maintenanceCost) * paceCostMultiplier + thermalCost) * (1 - costReduction);

  // Energy Storage caps how much surplus an organism can bank; anything
  // above the cap is wasted rather than hoarded, so the gene only pays off
  // when food is patchy enough for banked energy to matter.
  const storageCap = energyCapFor(organism);
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

/**
 * Best free neighbor by thermal fit against `tolerance` — but only if it's a
 * real improvement over staying put. Unlike bestFoodNeighbor, this never
 * hands back a cell that's a worse thermal fit than the organism's current
 * one: thermal-seeking exists specifically so an organism doesn't wander
 * into (or stay in) a worse-suited spot, so "no free neighbor beats staying"
 * has to mean "don't move" rather than "move to the least-bad option" (see
 * todos/thermal-preference-movement.md).
 */
function bestThermalNeighbor(
  state: SimulationState,
  x: number,
  y: number,
  tolerance: number,
): { x: number; y: number } | null {
  let bestMismatch = Math.abs(cellTemperature(state, x, y) - tolerance);
  let best: { x: number; y: number } | null = null;
  for (const [dx, dy] of NEIGHBOR_OFFSETS) {
    const nx = wrap(x + dx, state.width);
    const ny = wrap(y + dy, state.height);
    if (state.grid[cellIndex(state, nx, ny)]) continue;
    const mismatch = Math.abs(cellTemperature(state, nx, ny) - tolerance);
    if (mismatch < bestMismatch) {
      bestMismatch = mismatch;
      best = { x: nx, y: ny };
    }
  }
  return best;
}

/** Movement for a solo organism (colony size 1 per last tick's snapshot —
 * see colonySizeOf). Colony members of size 2+ move together instead, via
 * moveColony below.
 *
 * Thermotaxis and foraging compete for the same single per-tick direction
 * choice via one shared roll (partitioning [0, 1) by trait value) rather than
 * two independent rolls — two independent decisions would let whichever ran
 * last silently override the other, making the loser's trait meaningless.
 * Whatever's left over after both traits' shares is plain random movement,
 * exactly like before thermotaxis existed. */
function moveOrganism(state: SimulationState, organism: Organism): void {
  if (state.rng() >= organism.phenotype.traits.motility) return;
  const { thermotaxis, foraging } = organism.phenotype.traits;
  const roll = state.rng();
  let target: { x: number; y: number } | null;
  if (roll < thermotaxis) {
    target = bestThermalNeighbor(state, organism.x, organism.y, preferredTemperature(organism));
  } else if (roll < thermotaxis + foraging) {
    target = bestFoodNeighbor(state, organism.x, organism.y);
  } else {
    target = freeNeighbor(state, organism.x, organism.y);
  }
  if (!target) return;
  state.grid[cellIndex(state, organism.x, organism.y)] = null;
  organism.x = target.x;
  organism.y = target.y;
  state.grid[cellIndex(state, organism.x, organism.y)] = organism.id;
}

/**
 * Whether translating every member of a colony by the same (dx, dy) offset
 * is collision-free: every member's target cell must be either empty or
 * occupied by a fellow member of *this same colony* (who is also moving this
 * tick, so will have vacated it) — occupied by any other organism blocks the
 * whole colony's move in that direction. Translating a set of distinct grid
 * cells by one shared offset can never make two members collide with each
 * other (a uniform shift is injective), so member-vs-member collisions
 * within the colony being moved never need to be checked — only outsiders.
 */
function colonyMoveIsValid(state: SimulationState, members: Organism[], root: string, dx: number, dy: number): boolean {
  for (const member of members) {
    const tx = wrap(member.x + dx, state.width);
    const ty = wrap(member.y + dy, state.height);
    const occupant = state.grid[cellIndex(state, tx, ty)];
    if (occupant && state.colonies.colonyOf.get(occupant) !== root) return false;
  }
  return true;
}

/** Translates every member of a colony by (dx, dy) at once: clears every
 * member's current cell first, then places all of them at their targets —
 * a two-phase apply so member-to-member "chain slides" (one member's target
 * is another member's current cell) resolve correctly regardless of
 * iteration order. Only called after `colonyMoveIsValid` confirms the whole
 * translated footprint is collision-free against outsiders. */
function applyColonyMove(state: SimulationState, members: Organism[], dx: number, dy: number): void {
  const targets = members.map((member) => ({
    member,
    tx: wrap(member.x + dx, state.width),
    ty: wrap(member.y + dy, state.height),
  }));
  for (const { member } of targets) state.grid[cellIndex(state, member.x, member.y)] = null;
  for (const { member, tx, ty } of targets) {
    member.x = tx;
    member.y = ty;
    state.grid[cellIndex(state, tx, ty)] = member.id;
  }
}

/**
 * Moves an entire colony (2+ members) as one rigid, connected unit — the
 * real fix for the previous pass's blanket "colony size >= 2 -> sessile"
 * simplification (see todos/multicellular-motility.md: that was scientifically
 * wrong as a permanent choice, since most real multicellular life is motile,
 * not sessile). Motility stays exactly the evolvable trait it always was;
 * what's new is combining every member's contribution into one collective
 * decision instead of a hard structural cutoff.
 *
 * First-pass combination rule, deliberately the simplest option that still
 * ties movement to real evolved traits (see the todo for the richer,
 * deferred alternative — per-member "mover cell" division of labor, analogous
 * to Growth Suppression's interior/surface split): average motility across
 * members gates *whether* the colony moves at all this tick; average
 * thermotaxis and average foraging then compete (via the same shared-roll
 * partition solo moveOrganism uses) for *how* it picks a direction among the
 * colony's valid offsets — bias toward whichever offset's translated
 * footprint sits on the most total food, or whichever most reduces the
 * footprint's total thermal mismatch (each member scored against its own
 * thermalTolerance), vs. a uniform random valid offset the rest of the time —
 * the same trait-driven decision solo movement already makes, just aggregated
 * across the group instead of read from one organism.
 *
 * Thermal-seeking, colony or solo, never relocates into a worse-fit spot (see
 * bestThermalNeighbor): if no valid offset improves on the footprint's
 * current total mismatch, the colony simply doesn't move this tick, exactly
 * like a solo organism whose only free neighbors are all worse than staying.
 */
function moveColony(state: SimulationState, root: string): void {
  const members = Array.from(state.organisms.values()).filter((o) => state.colonies.colonyOf.get(o.id) === root);
  if (members.length <= 1) return; // colony dissolved this tick (deaths) - nothing left to move as a group

  const avgMotility = members.reduce((sum, m) => sum + m.phenotype.traits.motility, 0) / members.length;
  if (state.rng() >= avgMotility) return;

  const validOffsets = NEIGHBOR_OFFSETS.filter(([dx, dy]) => colonyMoveIsValid(state, members, root, dx, dy));
  if (validOffsets.length === 0) return;

  const totalMismatch = (ox: number, oy: number): number =>
    members.reduce((sum, m) => {
      const temp = cellTemperature(state, wrap(m.x + ox, state.width), wrap(m.y + oy, state.height));
      return sum + Math.abs(temp - preferredTemperature(m));
    }, 0);

  const avgThermotaxis = members.reduce((sum, m) => sum + m.phenotype.traits.thermotaxis, 0) / members.length;
  const avgForaging = members.reduce((sum, m) => sum + m.phenotype.traits.foraging, 0) / members.length;
  const roll = state.rng();

  let [dx, dy] = validOffsets[randomInt(state.rng, validOffsets.length)];
  if (roll < avgThermotaxis) {
    let bestMismatch = totalMismatch(0, 0);
    let best: [number, number] | null = null;
    for (const [odx, ody] of validOffsets) {
      const mismatch = totalMismatch(odx, ody);
      if (mismatch < bestMismatch) {
        bestMismatch = mismatch;
        best = [odx, ody];
      }
    }
    if (!best) return;
    [dx, dy] = best;
  } else if (roll < avgThermotaxis + avgForaging) {
    let bestFood = -Infinity;
    for (const [odx, ody] of validOffsets) {
      const food = members.reduce(
        (sum, m) => sum + state.food[cellIndex(state, wrap(m.x + odx, state.width), wrap(m.y + ody, state.height))],
        0,
      );
      if (food > bestFood) {
        bestFood = food;
        [dx, dy] = [odx, ody];
      }
    }
  }

  applyColonyMove(state, members, dx, dy);
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
    birthTemperature: cellTemperature(state, site.x, site.y),
  });
  placeOrganism(state, child);
  recordBirth(state, child);
}

function maybeReproduce(state: SimulationState, organism: Organism): void {
  const localTemp = cellTemperature(state, organism.x, organism.y);
  const thermalMismatch = Math.abs(localTemp - preferredTemperature(organism));

  // Replication cost scales with genome length, so a bloated genome must
  // first bank proportionally more energy — the direct selection pressure
  // that keeps genome growth tied to whether the extra length earns its keep.
  // It also scales with thermal mismatch (REPRO_MISMATCH_COST_SENSITIVITY,
  // alongside THERMAL_PENALTY_FACTOR above): a badly-mismatched organism needs
  // to bank more energy per reproduction attempt, on top of attempting less
  // often (see effectiveReplicationRate below). This throttles fecundity, not
  // baseline survival — the organism itself still lives and can wander, it
  // just can't cheaply establish a lineage somewhere poorly suited.
  const baseReplicationCost = REPRODUCE_ENERGY_COST + organism.genome.length * REPLICATION_COST_PER_BASE;
  const replicationCost = baseReplicationCost * (1 + thermalMismatch * REPRO_MISMATCH_COST_SENSITIVITY);
  if (organism.energy < Math.max(REPRODUCE_ENERGY_THRESHOLD, replicationCost)) return;

  // Growth Suppression's division-of-labor trade-off: a deeply-embedded
  // colony member's expressed growthSuppression discounts its own effective
  // replication rate (see genes.ts's growth-suppression entry). Exposed
  // members and solo organisms (growthSuppression at or near baseline 0)
  // reproduce at essentially their full genomic rate.
  const growthSuppression = effectiveTraitValue(organism.phenotype, "growthSuppression", state.cellTraits.get(organism.id));
  // Thermal mismatch (relative to this organism's own niche) and absolute-
  // temperature pace of life (thermalPace — same for everyone regardless of
  // adaptation) each independently discount how often reproduction actually
  // succeeds this tick, alongside growthSuppression's existing discount.
  const mismatchRatePenalty = clamp01(thermalMismatch * REPRO_MISMATCH_RATE_SENSITIVITY);
  const pacePenalty = (1 - thermalPace(localTemp)) * PACE_REPRODUCTION_SENSITIVITY;
  const effectiveReplicationRate =
    organism.phenotype.traits.replicationRate *
    (1 - clamp01(growthSuppression) * GROWTH_SUPPRESSION_REPLICATION_PENALTY) *
    (1 - mismatchRatePenalty) *
    (1 - clamp01(pacePenalty));
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

/** The grid's actual mean local temperature — baseline plus every cell's
 * fixed biome offset, clamped per-cell (see engine/biome.ts) — rather than
 * just re-reporting the baseline: clamping near the extremes, and the biome
 * offset field's own small, random anchor set, mean this can genuinely
 * differ from environment.temperature by a bit, not just echo it. */
function averageLocalTemperature(state: SimulationState): number {
  let sum = 0;
  for (let i = 0; i < state.biomeOffset.length; i++) {
    sum += localTemperature(state.environment.temperature, state.biomeOffset, i);
  }
  return sum / state.biomeOffset.length;
}

function refreshStats(state: SimulationState): void {
  state.stats.population = state.organisms.size;
  let maxGen = state.stats.maxGeneration;
  let organismsInColonies = 0;
  let largestColony = state.organisms.size > 0 ? 1 : 0;

  let genomeLengthSum = 0;
  let genomeLengthMin = Infinity;
  let genomeLengthMax = -Infinity;
  let ageSum = 0;
  let ageMin = Infinity;
  let ageMax = -Infinity;
  let colonySizeSum = 0;
  let colonySizeMin = Infinity;
  let colonySizeMax = -Infinity;

  // Reuses the same per-organism colony-size lookup organismsInColonies/
  // largestColony already need, rather than a second independent pass.
  for (const organism of state.organisms.values()) {
    maxGen = Math.max(maxGen, organism.generation);
    const size = colonySizeOf(state, organism.id);
    if (size > 1) organismsInColonies++;
    largestColony = Math.max(largestColony, size);

    const genomeLength = organism.genome.length;
    genomeLengthSum += genomeLength;
    genomeLengthMin = Math.min(genomeLengthMin, genomeLength);
    genomeLengthMax = Math.max(genomeLengthMax, genomeLength);

    ageSum += organism.age;
    ageMin = Math.min(ageMin, organism.age);
    ageMax = Math.max(ageMax, organism.age);

    colonySizeSum += size;
    colonySizeMin = Math.min(colonySizeMin, size);
    colonySizeMax = Math.max(colonySizeMax, size);
  }
  state.stats.maxGeneration = maxGen;
  state.stats.organismsInColonies = organismsInColonies;
  state.stats.largestColony = largestColony;

  const count = state.organisms.size;
  state.stats.genomeLength = count > 0
    ? { avg: genomeLengthSum / count, min: genomeLengthMin, max: genomeLengthMax }
    : ZERO_STAT_SUMMARY;
  state.stats.age = count > 0
    ? { avg: ageSum / count, min: ageMin, max: ageMax }
    : ZERO_STAT_SUMMARY;
  state.stats.colonySize = count > 0
    ? { avg: colonySizeSum / count, min: colonySizeMin, max: colonySizeMax }
    : ZERO_STAT_SUMMARY;

  // Whole-planet figures, independent of population (still meaningful even
  // through an extinction/abiogenesis gap).
  state.stats.avgTemperature = averageLocalTemperature(state);
  state.stats.incidentFluxWm2 = state.astro
    ? incidentFluxWm2(state.astro.stellar, state.astro.orbital, state.tick)
    : 0;
}

/** Appends the current tick's stats to `state.history` at the configured
 * sample interval, dropping the oldest sample once the ring buffer is full.
 * Objects assigned onto `state.stats` in `refreshStats` are always fresh
 * literals (never mutated in place), so sharing those references directly
 * into the history sample is safe. */
function recordStatsHistorySample(state: SimulationState): void {
  if (state.tick % STATS_HISTORY_SAMPLE_INTERVAL_TICKS !== 0) return;
  state.history.push({
    tick: state.tick,
    population: state.stats.population,
    genomeLength: state.stats.genomeLength,
    age: state.stats.age,
    colonySize: state.stats.colonySize,
    avgTemperature: state.stats.avgTemperature,
    incidentFluxWm2: state.stats.incidentFluxWm2,
  });
  if (state.history.length > STATS_HISTORY_MAX_SAMPLES) state.history.shift();
}

/** Advances the simulation by exactly one tick. */
export function step(state: SimulationState): void {
  state.tick += 1;

  // Astro-driven worlds recompute their baseline from orbital mechanics
  // every tick (see engine/astrophysics.ts) instead of it staying at
  // whatever was passed in at creation — this is what turns eccentricity
  // into an actual over-time hot/cold swing rather than a one-shot value.
  if (state.astro) {
    state.environment.temperature = baselineTemperature(state.astro.stellar, state.astro.orbital, state.tick);
  }

  regenerateFood(state);

  // Snapshot ids up front: organisms born this tick shouldn't act this tick,
  // and organisms that died mid-iteration are simply skipped.
  const ids = Array.from(state.organisms.keys());
  // A colony's move is decided once for the whole group, the first time any
  // of its members comes up in this loop — not once per member — so later
  // colony-mates encountered this same tick just skip movement (already
  // moved as part of the group).
  const movedColonies = new Set<string>();
  for (const id of ids) {
    const organism = state.organisms.get(id);
    if (!organism) continue;

    feedAndAge(state, organism);
    if (organism.energy <= 0 || organism.age > maxAgeFor(organism)) {
      killOrganism(state, organism);
      continue;
    }

    const root = state.colonies.colonyOf.get(organism.id);
    if (root && colonySizeOf(state, organism.id) > 1) {
      if (!movedColonies.has(root)) {
        movedColonies.add(root);
        moveColony(state, root);
      }
    } else {
      moveOrganism(state, organism);
    }
    maybeReproduce(state, organism);
  }

  refreshColonies(state);
  refreshCellRegulatoryTraits(state);
  refreshStats(state);

  if (state.stats.population === 0) {
    if (state.extinctSinceTick === null) {
      state.extinctSinceTick = state.tick;
    } else if (state.tick - state.extinctSinceTick >= ABIOGENESIS_WAIT_TICKS) {
      spawnAbiogenesis(state);
      state.extinctSinceTick = null;
      refreshColonies(state);
      refreshCellRegulatoryTraits(state);
      refreshStats(state);
    }
  } else {
    state.extinctSinceTick = null;
  }

  recordStatsHistorySample(state);
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

/** Sampled population-statistics history for the run so far — see
 * `SimulationState.history`. */
export function getStatsHistory(state: SimulationState): StatHistorySample[] {
  return state.history;
}

/** A given grid cell's actual local temperature — the world's live baseline
 * plus that cell's fixed spatial biome offset (see engine/biome.ts). */
export function getLocalTemperature(state: SimulationState, x: number, y: number): number {
  return cellTemperature(state, x, y);
}

/** A given grid cell's absolute-temperature "pace of life" — see thermalPace. */
export function getThermalPace(state: SimulationState, x: number, y: number): number {
  return thermalPace(cellTemperature(state, x, y));
}

/** A given grid cell's actual local food-regeneration rate — the world's live
 * baseline scaled by that cell's fixed spatial richness offset (see
 * engine/biome.ts). */
export function getLocalFoodRegenRate(state: SimulationState, x: number, y: number): number {
  return cellFoodRegenRate(state, x, y);
}

/** This planet's actual current distance from its star, in AU — null for a
 * world with no AstroConfig (a flat, directly-set baseline has no orbit to
 * report). See engine/astrophysics.ts's orbitalDistanceAu. */
export function getOrbitalDistanceAu(state: SimulationState): number | null {
  if (!state.astro) return null;
  return orbitalDistanceAu(state.astro.stellar, state.astro.orbital, state.tick);
}

/** Ticks remaining before a fresh organism spontaneously appears after a
 * total die-off, or null if the population isn't currently extinct — see
 * ABIOGENESIS_WAIT_TICKS/spawnAbiogenesis. */
export function getTicksUntilAbiogenesis(state: SimulationState): number | null {
  if (state.extinctSinceTick === null) return null;
  return Math.max(0, ABIOGENESIS_WAIT_TICKS - (state.tick - state.extinctSinceTick));
}
