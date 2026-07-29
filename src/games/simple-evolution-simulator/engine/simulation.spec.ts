import { describe, expect, it } from "vitest";
import { DEFAULT_MUTATION_CONFIG, MAX_GENOME_LENGTH, MIN_GENOME_LENGTH, randomGenome } from "./genome";
import { createOrganism } from "./organism";
import { decode } from "./phenotype";
import {
  createSimulation, getCellTraits, getColonyBonds, getColonySize, getLineageRecords, getLocalTemperature,
  getOrganisms, step,
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

  it("generates a per-cell biome temperature field sized to the grid", () => {
    const state = createSimulation(baseOptions());
    expect(state.biomeOffset.length).toBe(state.width * state.height);
  });

  it("seeds each primordial organism adapted to its own cell's local temperature, not the flat global baseline", () => {
    // Seed 6 is picked because this world's biome field happens to run
    // meaningfully colder than the flat baseline right where organisms seed
    // — a seed where local and global temperature land nearly identical
    // near the cluster wouldn't distinguish the two, though the underlying
    // mechanism (see createSimulation's seed loop) is identical either way.
    const state = createSimulation({ ...baseOptions(), seed: 6 });
    expect(state.organisms.size).toBeGreaterThan(0);
    for (const organism of state.organisms.values()) {
      const localTemp = getLocalTemperature(state, organism.x, organism.y);
      const thermalTolerance = decode(organism.genome).traits.thermalTolerance;
      // buildAdaptedMotif (and decode's own best-window search over the rest
      // of the genome) can only land within this motif's discrete
      // resolution, not exactly on target — see genome.spec.ts's hot/cold
      // adaptation tests for the same tolerance in isolation.
      expect(Math.abs(thermalTolerance - localTemp)).toBeLessThan(0.15);
      expect(Math.abs(thermalTolerance - localTemp)).toBeLessThan(Math.abs(thermalTolerance - state.environment.temperature));
    }
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

describe("planetary biomes (per-cell local temperature)", () => {
  it("thermal-mismatch cost is driven by a cell's local temperature, not the world's flat baseline", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const genome = randomGenome(60, createRng(9));

    function buildOrganism(id: string, x: number, y: number): Organism {
      const o = createOrganism({ id, genome, x, y, energy: 500, generation: 0, parentIds: [], birthTick: 0 });
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, energyStorage: 50, motility: 0, thermalTolerance: 0.5 } };
      return o;
    }
    const matched = buildOrganism("matched", 5, 5);
    const mismatched = buildOrganism("mismatched", 15, 12);
    state.organisms.set(matched.id, matched);
    state.organisms.set(mismatched.id, mismatched);
    state.grid[5 * state.width + 5] = matched.id;
    state.grid[12 * state.width + 15] = mismatched.id;

    // Directly control the biome field (same technique forceSurfaceProtein
    // uses for colony compatibility): matched's cell reads exactly at its
    // thermalTolerance (zero mismatch), mismatched's cell reads far from it,
    // regardless of what the real random field would have put there.
    state.biomeOffset.fill(0);
    state.biomeOffset[12 * state.width + 15] = 0.45;

    const matchedEnergyBefore = matched.energy;
    const mismatchedEnergyBefore = mismatched.energy;
    step(state);
    const matchedLoss = matchedEnergyBefore - state.organisms.get("matched")!.energy;
    const mismatchedLoss = mismatchedEnergyBefore - state.organisms.get("mismatched")!.energy;

    expect(mismatchedLoss).toBeGreaterThan(matchedLoss);
  });

  it("getLocalTemperature reflects the baseline plus that cell's fixed offset, clamped to [0, 1]", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0, environment: { temperature: 0.9, foodRegenRate: 0 } });
    state.biomeOffset.fill(0);
    state.biomeOffset[0] = 0.3; // cell (0, 0)
    expect(getLocalTemperature(state, 0, 0)).toBe(1); // 0.9 + 0.3 clamps to 1
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

  it("a bonded (colony size >= 2) pair moves together as a rigid group, even though sessility used to be a hard cutoff", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({ id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    const b = createOrganism({ id: "b", genome: randomGenome(60, createRng(2)), x: 6, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    // energyStorage is overridden too — its baseline (0.8) caps energy at just
    // 16 (ENERGY_STORAGE_BASE_CAP * 0.8), which would otherwise immediately
    // clamp our starting energy down and starve the organisms well before 50
    // ticks are up; replicationRate is forced to 0 so a third, unplanned-for
    // colony member can't spawn mid-test. This test is about movement, not
    // energy budgeting or reproduction.
    for (const o of [a, b]) {
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 0, energyStorage: 5, replicationRate: 0 } };
      forceSurfaceProtein(o, "012345");
    }
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;

    // Let the bond form undisturbed first (motility 0) — colonies are only
    // computed at the *end* of a tick, so forcing motility high from the very
    // first step (before these two organisms' first-ever colony refresh)
    // could let them wander apart before adjacency is ever recognized, which
    // would defeat the point of this test.
    step(state);
    expect(getColonySize(state, "a")).toBe(2);

    // Now flip motility high and confirm the bonded pair actually moves
    // (the old model made any colony of 2+ permanently sessile), while
    // staying bonded and preserving their relative adjacency every tick —
    // proof they're moving together as one rigid unit, not independently.
    for (const id of ["a", "b"]) {
      const o = state.organisms.get(id)!;
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 1 } };
    }
    const wrap = (v: number, max: number) => ((v % max) + max) % max;
    let everMoved = false;
    for (let i = 0; i < 50; i++) {
      step(state);
      expect(getColonySize(state, "a")).toBe(2);
      const curA = state.organisms.get("a")!;
      const curB = state.organisms.get("b")!;
      expect(wrap(curB.x - curA.x, state.width)).toBe(1);
      expect(wrap(curB.y - curA.y, state.height)).toBe(0);
      if (curA.x !== 5 || curA.y !== 5) everMoved = true;
    }
    expect(everMoved).toBe(true);
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

  it("a bonded pair surrounded on every side by incompatible outsiders stays put — group movement never overlaps another organism", () => {
    const state = createSimulation({ ...baseOptions(), initialPopulation: 0 });
    const a = createOrganism({ id: "a", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    const b = createOrganism({ id: "b", genome: randomGenome(60, createRng(2)), x: 6, y: 5, energy: 60, generation: 0, parentIds: [], birthTick: 0 });
    for (const o of [a, b]) {
      o.phenotype = { ...o.phenotype, traits: { ...o.phenotype.traits, motility: 1, energyStorage: 5, replicationRate: 0 } };
      forceSurfaceProtein(o, "012345");
    }
    state.organisms.set(a.id, a);
    state.organisms.set(b.id, b);
    state.grid[5 * state.width + 5] = a.id;
    state.grid[5 * state.width + 6] = b.id;

    // Fill every cell either organism could possibly translate onto (their
    // Moore neighborhoods' union) with mutually-incompatible, non-motile
    // outsiders — blocking the bonded pair's group move in all 8 directions.
    let outsiderId = 0;
    for (let x = 4; x <= 7; x++) {
      for (let y = 4; y <= 6; y++) {
        if ((x === 5 && y === 5) || (x === 6 && y === 5)) continue;
        const outsider = createOrganism({
          id: `outsider-${outsiderId++}`, genome: randomGenome(60, createRng(100 + outsiderId)),
          x, y, energy: 60, generation: 0, parentIds: [], birthTick: 0,
        });
        outsider.phenotype = { ...outsider.phenotype, traits: { ...outsider.phenotype.traits, motility: 0, replicationRate: 0 } };
        state.organisms.set(outsider.id, outsider);
        state.grid[y * state.width + x] = outsider.id;
      }
    }

    step(state); // let the a-b bond register
    expect(getColonySize(state, "a")).toBe(2);

    for (let i = 0; i < 20; i++) {
      step(state);
      const curA = state.organisms.get("a")!;
      const curB = state.organisms.get("b")!;
      expect(curA).toMatchObject({ x: 5, y: 5 });
      expect(curB).toMatchObject({ x: 6, y: 5 });
    }
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
