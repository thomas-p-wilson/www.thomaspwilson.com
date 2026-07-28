import { describe, expect, it } from "vitest";
import { DEFAULT_MUTATION_CONFIG, MAX_GENOME_LENGTH, MIN_GENOME_LENGTH } from "./genome";
import { createSimulation, getLineageRecords, getOrganisms, step } from "./simulation";

const baseOptions = () => ({
  width: 24,
  height: 18,
  seed: 1234,
  environment: { temperature: 0.5, foodRegenRate: 0.15 },
  mutation: DEFAULT_MUTATION_CONFIG,
});

describe("createSimulation", () => {
  it("seeds an initial population placed on the grid", () => {
    const state = createSimulation(baseOptions());
    expect(state.organisms.size).toBeGreaterThan(0);
    expect(state.stats.population).toBe(state.organisms.size);
    for (const organism of state.organisms.values()) {
      expect(state.grid[organism.y * state.width + organism.x]).toBe(organism.id);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = createSimulation(baseOptions());
    const b = createSimulation(baseOptions());
    expect(getOrganisms(a).map((o) => o.genome)).toEqual(getOrganisms(b).map((o) => o.genome));
  });
});

describe("step", () => {
  it("runs many ticks without throwing and keeps the grid/organism map consistent", () => {
    const state = createSimulation(baseOptions());
    for (let i = 0; i < 300; i++) step(state);

    expect(state.tick).toBe(300);
    for (const organism of state.organisms.values()) {
      expect(state.grid[organism.y * state.width + organism.x]).toBe(organism.id);
      expect(organism.genome.length).toBeGreaterThanOrEqual(MIN_GENOME_LENGTH);
      expect(organism.genome.length).toBeLessThanOrEqual(MAX_GENOME_LENGTH);
    }
    // Every currently-alive organism must also be in the permanent archive.
    const lineageIds = new Set(getLineageRecords(state).map((r) => r.id));
    for (const organism of state.organisms.values()) {
      expect(lineageIds.has(organism.id)).toBe(true);
    }
  });

  it("produces population growth and generational advancement over time (typical seed)", () => {
    const state = createSimulation(baseOptions());
    const initialGeneration = state.stats.maxGeneration;
    for (let i = 0; i < 400; i++) step(state);
    expect(state.stats.births).toBeGreaterThan(0);
    expect(state.stats.maxGeneration).toBeGreaterThanOrEqual(initialGeneration);
  });

  it("never exceeds the grid's cell count", () => {
    const state = createSimulation(baseOptions());
    for (let i = 0; i < 500; i++) {
      step(state);
      expect(state.organisms.size).toBeLessThanOrEqual(state.width * state.height);
    }
  });

  it("the lineage archive keeps dead organisms with a recorded death tick", () => {
    const state = createSimulation({ ...baseOptions(), environment: { temperature: 0.9, foodRegenRate: 0 } });
    for (let i = 0; i < 200; i++) step(state);
    const dead = getLineageRecords(state).filter((r) => r.deathTick !== null);
    expect(dead.length).toBeGreaterThan(0);
    for (const record of dead) {
      expect(record.deathTick).toBeGreaterThan(0);
      expect(state.organisms.has(record.id)).toBe(false);
    }
  });
});
