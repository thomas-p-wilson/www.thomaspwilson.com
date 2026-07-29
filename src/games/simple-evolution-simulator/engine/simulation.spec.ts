import { describe, expect, it } from "vitest";
import { DEFAULT_MUTATION_CONFIG, MAX_GENOME_LENGTH, MIN_GENOME_LENGTH, randomGenome } from "./genome";
import { createOrganism } from "./organism";
import {
  createSimulation, getCellTraits, getColonyBonds, getColonySize, getLineageRecords, getOrganisms, step,
} from "./simulation";
import { createRng } from "./rng";
import { GENE_TABLE } from "./genes";
import type { Organism } from "./types";

const SURFACE_PROTEIN_INDEX = GENE_TABLE.findIndex((g) => g.id === "surface-protein");

/** Forces an organism's surface-protein gene to appear active with a given
 * realized sequence, bypassing genome decoding — used to make colony bonding
 * deterministic in tests rather than waiting on a genome to mutate into an
 * exact motif match, the same technique the old adhesion tests used for
 * `phenotype.traits`. */
function forceSurfaceProtein(organism: Organism, matchedSequence: string): void {
  const genes = organism.phenotype.genes.slice();
  genes[SURFACE_PROTEIN_INDEX] = { ...genes[SURFACE_PROTEIN_INDEX], active: true, matchedSequence };
  organism.phenotype = { ...organism.phenotype, genes };
}

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

  it("does not go extinct over a long run (genome-length costs must stay affordable)", () => {
    const state = createSimulation(baseOptions());
    for (let i = 0; i < 3000; i++) step(state);
    expect(state.stats.population).toBeGreaterThan(0);
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

  it("largest colony never exceeds current population", () => {
    const state = createSimulation(baseOptions());
    for (let i = 0; i < 300; i++) {
      step(state);
      expect(state.stats.largestColony).toBeLessThanOrEqual(state.stats.population);
    }
  });

  it("populates resolved regulatory trait data for every living organism", () => {
    const state = createSimulation(baseOptions());
    for (let i = 0; i < 5; i++) step(state);
    const cellTraits = getCellTraits(state);
    for (const organism of state.organisms.values()) {
      expect(cellTraits.has(organism.id)).toBe(true);
    }
  });
});

describe("colony bonding (aggregative multicellularity)", () => {
  it("two adjacent organisms with active, matching surface-protein sequences bond into a colony", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({
      id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0,
    });
    const b = createOrganism({
      id: "b", genome: randomGenome(60, createRng(2)), x: 6, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0,
    });
    // Motility forced to 0 on both: colonies are only computed at the *end*
    // of a tick, so on this very first step the pre-existing (empty, since
    // these two were injected directly rather than born in-sim) colonies
    // snapshot doesn't yet know about them — without pinning motility, a
    // nonzero baseline motility roll could move one of them apart before
    // that end-of-tick refresh ever gets to see them adjacent. This test is
    // about compatibility gating bonding, not movement.
    for (const o of [a, b]) o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 0 } };
    forceSurfaceProtein(a, "012345");
    forceSurfaceProtein(b, "012345"); // identical realized sequence — trivially compatible
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;

    step(state);

    expect(getColonySize(state, "a")).toBe(2);
    expect(getColonySize(state, "b")).toBe(2);
    const bonds = getColonyBonds(state);
    expect(bonds.some(([x, y]) => (x === "a" && y === "b") || (x === "b" && y === "a"))).toBe(true);
  });

  it("does not bond organisms whose surface-protein sequences are too dissimilar", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({
      id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0,
    });
    const b = createOrganism({
      id: "b", genome: randomGenome(60, createRng(2)), x: 6, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0,
    });
    forceSurfaceProtein(a, "012345");
    forceSurfaceProtein(b, "765432"); // every symbol differs — far below the compatibility threshold
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;

    step(state);

    expect(getColonySize(state, "a")).toBe(1);
    expect(getColonySize(state, "b")).toBe(1);
  });

  it("does not bond organisms that haven't evolved an active surface-protein gene, even with identical genomes", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const genome = randomGenome(60, createRng(3));
    const a = createOrganism({ id: "a", genome, x: 5, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    const b = createOrganism({ id: "b", genome, x: 6, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    // No forceSurfaceProtein call: whatever decode() naturally produced stays,
    // which for a random genome is essentially never active.
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;

    step(state);

    expect(getColonySize(state, "a")).toBe(1);
    expect(getColonySize(state, "b")).toBe(1);
  });

  it("a chain of pairwise-compatible organisms forms one connected colony, even where the endpoints aren't directly compatible", () => {
    // A-B and B-C are compatible; A-C are not (and aren't even adjacent) —
    // connected components should still merge all three into one colony,
    // with no special-casing beyond ordinary pairwise union.
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({ id: "a", genome: randomGenome(60, createRng(1)), x: 4, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    const b = createOrganism({ id: "b", genome: randomGenome(60, createRng(2)), x: 5, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    const c = createOrganism({ id: "c", genome: randomGenome(60, createRng(3)), x: 6, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    forceSurfaceProtein(a, "012345");
    forceSurfaceProtein(b, "012345");
    forceSurfaceProtein(c, "012345");
    for (const o of [a, b, c]) {
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 0 } }; // see the bond-formation test above for why
      state.organisms.set(o.id, o);
    }
    state.grid[5 * state.width + 4] = a.id;
    state.grid[5 * state.width + 5] = b.id;
    state.grid[5 * state.width + 6] = c.id;

    step(state);

    expect(getColonySize(state, "a")).toBe(3);
    expect(getColonySize(state, "b")).toBe(3);
    expect(getColonySize(state, "c")).toBe(3);
  });

  it("a bond breaks the moment sequences no longer match — no persistent structure needs teardown", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({ id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    const b = createOrganism({ id: "b", genome: randomGenome(60, createRng(2)), x: 6, y: 5, energy: 20, generation: 0, parentIds: [], birthTick: 0 });
    for (const o of [a, b]) o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 0 } }; // see the bond-formation test above for why
    forceSurfaceProtein(a, "012345");
    forceSurfaceProtein(b, "012345");
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;
    step(state);
    expect(getColonySize(state, "a")).toBe(2);

    // Simulate drift: b's realized sequence has since mutated away.
    forceSurfaceProtein(b, "765432");
    step(state);

    expect(getColonySize(state, "a")).toBe(1);
    expect(getColonySize(state, "b")).toBe(1);
  });

  it("a bonded (colony size >= 2) organism is sessile, even with motility forced high", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({ id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    const b = createOrganism({ id: "b", genome: randomGenome(60, createRng(2)), x: 6, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    // energyStorage is overridden too — its baseline (0.8) caps energy at just
    // 16 (ENERGY_STORAGE_BASE_CAP * 0.8), which would otherwise immediately
    // clamp our starting energy down and starve the organisms well before 50
    // ticks are up; this test is about movement, not energy budgeting.
    for (const o of [a, b]) {
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 0, energyStorage: 5 } };
      forceSurfaceProtein(o, "012345");
    }
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;

    // Let the bond form undisturbed first (motility 0) — colonies are only
    // computed at the *end* of a tick, so forcing motility high from the very
    // first step (before these two organisms' first-ever colony refresh) It
    // could let them wander apart before adjacency is ever recognized, which
    // would defeat the point of this test (sessility *preventing* movement,
    // not "they happened to never get the chance to move").
    step(state);
    expect(getColonySize(state, "a")).toBe(2);

    // Now flip motility high and confirm the already-bonded pair stays put.
    for (const id of ["a", "b"]) {
      const o = state.organisms.get(id)!;
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 1 } };
    }
    for (let i = 0; i < 50; i++) step(state);

    const afterA = state.organisms.get("a");
    const afterB = state.organisms.get("b");
    expect(afterA).toBeDefined();
    expect(afterB).toBeDefined();
    expect(afterA).toMatchObject({ x: 5, y: 5 });
    expect(afterB).toMatchObject({ x: 6, y: 5 });
  });

  it("a solo organism (no compatible neighbor) still moves normally with motility forced high", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({ id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    a.phenotype = { ...a.phenotype, traits: { ...a.phenotype.traits, motility: 1, energyStorage: 5, foraging: 0 } };
    state.organisms.set(a.id, a);
    state.grid[5 * state.width + 5] = a.id;

    let moved = false;
    for (let i = 0; i < 50; i++) {
      step(state);
      const current = state.organisms.get("a");
      if (current && (current.x !== 5 || current.y !== 5)) {
        moved = true;
        break;
      }
    }
    expect(moved).toBe(true);
  });

  it("Structural Reinforcement gives a densely-embedded colony member a real energy-cost payoff over an identical solo organism", () => {
    // Build a 3x3 block of mutually-compatible organisms in a thermally
    // mismatched environment (so thermalCost is nonzero and worth reducing)
    // and force every regulatory gene's own motif to read as a perfect match,
    // isolating the colony-density effect from whether a real genome happens
    // to carry these motifs. The center organism has all 8 Moore neighbors in
    // its colony (density 1); a lone organism elsewhere on the grid, given an
    // identical phenotype/genome, has density 0.
    const state = createSimulation({
      ...baseOptions(),
      initialPopulation: 0,
      environment: { temperature: 0.05, foodRegenRate: 0 }, // thermalTolerance baseline 0.5 -> big, deliberate mismatch
    });
    const genome = randomGenome(60, createRng(9));

    function buildOrganism(id: string, x: number, y: number): Organism {
      const o = createOrganism({ id, genome, x, y, energy: 500, generation: 0, parentIds: [], birthTick: 0 });
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, energyStorage: 50, motility: 0 } };
      forceSurfaceProtein(o, "012345");
      // Force structural-reinforcement's own motif-match strength to a
      // perfect 1 so only neighborDensity gates its expression.
      const genes = o.phenotype.genes.slice();
      const idx = GENE_TABLE.findIndex((g) => g.id === "structural-reinforcement");
      genes[idx] = { ...genes[idx], matchStrength: 1 };
      o.phenotype = { ...o.phenotype, genes };
      return o;
    }

    let center: Organism | undefined;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = 10 + dx;
        const y = 10 + dy;
        const id = `block-${x}-${y}`;
        const o = buildOrganism(id, x, y);
        state.organisms.set(o.id, o);
        state.grid[y * state.width + x] = o.id;
        if (dx === 0 && dy === 0) center = o;
      }
    }
    const solo = buildOrganism("solo", 20, 15);
    state.organisms.set(solo.id, solo);
    state.grid[15 * state.width + 20] = solo.id;

    step(state); // refreshes colonies/regulatory traits from this placement
    const centerEnergyBefore = center!.energy;
    const soloEnergyBefore = solo.energy;
    step(state); // this tick's feedAndAge now reads the previous tick's colony-density snapshot
    const centerLoss = centerEnergyBefore - state.organisms.get(center!.id)!.energy;
    const soloLoss = soloEnergyBefore - state.organisms.get("solo")!.energy;

    expect(getColonySize(state, center!.id)).toBe(9);
    expect(centerLoss).toBeLessThan(soloLoss);
  });
});
