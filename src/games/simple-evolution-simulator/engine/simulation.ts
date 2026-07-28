// The world/tick loop: a bounded, toroidal 2D grid (Conway's-Game-of-Life
// styled — one organism per cell) with a food resource per cell, an
// organism population that moves, eats, ages, reproduces (with mutation),
// and dies. Everything here reads/writes plain data structures; rendering
// lives entirely in components/ and never touches this module's internals
// beyond reading its output.
import { createSeedGenome, mutate, scaleMutationConfig } from "./genome";
import { createOrganism, reproduce } from "./organism";
import { createRng, randomInt, type Rng } from "./rng";
import type { EnvironmentConfig, LineageRecord, MutationConfig, Organism } from "./types";

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
const GENOME_MAINTENANCE_COST_PER_BASE = 0.001;
const REPLICATION_COST_PER_BASE = 0.02;
const ENERGY_STORAGE_BASE_CAP = 20;

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
    stats: { population: 0, maxGeneration: 0, births: 0, deaths: 0 },
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
    const genome = createSeedGenome(rng);
    const id = nextOrganismId(state);
    const organism = createOrganism({
      id, genome, x, y, energy: INITIAL_ENERGY, generation: 0, parentIds: [], birthTick: 0,
    });
    placeOrganism(state, organism);
    recordBirth(state, organism);
  }

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
  if (state.grid[cellIndex(state, organism.x, organism.y)] === organism.id) {
    state.grid[cellIndex(state, organism.x, organism.y)] = null;
  }
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
  const eaten = Math.min(state.food[idx], organism.phenotype.traits.metabolismEfficiency);
  state.food[idx] -= eaten;
  organism.energy += eaten;

  const sizeCost = BASE_METABOLIC_COST * (0.6 + organism.phenotype.traits.size * 0.5);
  const thermalMismatch = Math.abs(state.environment.temperature - organism.phenotype.traits.thermalTolerance);
  const thermalCost = thermalMismatch * THERMAL_PENALTY_FACTOR;
  const maintenanceCost = GENOME_MAINTENANCE_COST_PER_BASE * organism.genome.length;
  organism.energy -= sizeCost + thermalCost + maintenanceCost;

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

function maybeReproduce(state: SimulationState, organism: Organism): void {
  // Replication cost scales with genome length, so a bloated genome must
  // first bank proportionally more energy — the direct selection pressure
  // that keeps genome growth tied to whether the extra length earns its keep.
  const replicationCost = REPRODUCE_ENERGY_COST + organism.genome.length * REPLICATION_COST_PER_BASE;
  if (organism.energy < Math.max(REPRODUCE_ENERGY_THRESHOLD, replicationCost)) return;
  if (state.rng() >= organism.phenotype.traits.replicationRate) return;
  const site = freeNeighbor(state, organism.x, organism.y);
  if (!site) return;

  const damping = 1 - organism.phenotype.traits.mutationResistance * MUTATION_RESISTANCE_MAX_DAMPING;
  const effectiveMutation = scaleMutationConfig(state.mutation, damping);
  const childGenome = mutate(organism.genome, effectiveMutation, state.rng);

  organism.energy -= replicationCost;
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

function refreshStats(state: SimulationState): void {
  state.stats.population = state.organisms.size;
  let maxGen = state.stats.maxGeneration;
  for (const organism of state.organisms.values()) maxGen = Math.max(maxGen, organism.generation);
  state.stats.maxGeneration = maxGen;
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

  refreshStats(state);
}

export function getOrganisms(state: SimulationState): Organism[] {
  return Array.from(state.organisms.values());
}

export function getLineageRecords(state: SimulationState): LineageRecord[] {
  return Array.from(state.lineage.values());
}
