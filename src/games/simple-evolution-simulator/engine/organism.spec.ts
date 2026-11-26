import { describe, expect, it } from "vitest";
import { randomGenome } from "./genome";
import { createOrganism, preferredTemperature, reproduce } from "./organism";
import { decode } from "./phenotype";
import { createRng } from "./rng";

describe("createOrganism", () => {
  it("caches decode(genome) as .phenotype at creation time", () => {
    const genome = randomGenome(90, createRng(1));
    const organism = createOrganism({
      id: "a", genome, x: 0, y: 0, energy: 10, generation: 0, parentIds: [], birthTick: 0,
    });
    expect(organism.phenotype).toEqual(decode(genome));
  });

  it("starts at exactly the given position — one organism, one grid cell", () => {
    const genome = randomGenome(60, createRng(1));
    const organism = createOrganism({
      id: "a", genome, x: 3, y: 7, energy: 10, generation: 0, parentIds: [], birthTick: 0,
    });
    expect(organism.x).toBe(3);
    expect(organism.y).toBe(7);
  });

  it("starts at age 0 regardless of birthTick", () => {
    const organism = createOrganism({
      id: "a", genome: randomGenome(60, createRng(1)), x: 0, y: 0, energy: 10, generation: 3,
      parentIds: ["p"], birthTick: 42,
    });
    expect(organism.age).toBe(0);
    expect(organism.generation).toBe(3);
    expect(organism.parentIds).toEqual(["p"]);
  });
});

describe("reproduce", () => {
  it("increments generation and records the parent id", () => {
    const parent = createOrganism({
      id: "parent-1", genome: randomGenome(60, createRng(1)), x: 5, y: 5, energy: 20, generation: 2,
      parentIds: ["grandparent"], birthTick: 10,
    });
    const child = reproduce({
      parent, childId: "child-1", childGenome: randomGenome(60, createRng(2)), x: 6, y: 5,
      childEnergy: 6, birthTick: 20,
    });
    expect(child.generation).toBe(3);
    expect(child.parentIds).toEqual(["parent-1"]);
    expect(child.birthTick).toBe(20);
    expect(child.energy).toBe(6);
  });

  it("decodes the child's own genome rather than inheriting the parent's phenotype", () => {
    const parent = createOrganism({
      id: "parent-1", genome: randomGenome(60, createRng(1)), x: 0, y: 0, energy: 20, generation: 0,
      parentIds: [], birthTick: 0,
    });
    const childGenome = randomGenome(60, createRng(99));
    const child = reproduce({
      parent, childId: "child-1", childGenome, x: 1, y: 0, childEnergy: 6, birthTick: 1,
    });
    expect(child.phenotype).toEqual(decode(childGenome));
  });

  it("defaults a child's birthTemperature to its own genetic thermalTolerance when the caller doesn't supply a birth site", () => {
    const parent = createOrganism({
      id: "parent-1", genome: randomGenome(60, createRng(1)), x: 0, y: 0, energy: 20, generation: 0,
      parentIds: [], birthTick: 0,
    });
    const childGenome = randomGenome(60, createRng(99));
    const child = reproduce({
      parent, childId: "child-1", childGenome, x: 1, y: 0, childEnergy: 6, birthTick: 1,
    });
    expect(child.birthTemperature).toBe(child.phenotype.traits.thermalTolerance);
  });
});

describe("preferredTemperature", () => {
  it("equals thermalTolerance when birthTemperature matches it exactly (no imprinting effect either way)", () => {
    const organism = createOrganism({
      id: "a", genome: randomGenome(60, createRng(1)), x: 0, y: 0, energy: 10, generation: 0,
      parentIds: [], birthTick: 0, birthTemperature: 0.5,
    });
    organism.phenotype = { ...organism.phenotype, traits: { ...organism.phenotype.traits, thermalTolerance: 0.5 } };
    expect(preferredTemperature(organism)).toBeCloseTo(0.5, 5);
  });

  it("blends birthTemperature and thermalTolerance, weighted toward genetics", () => {
    const organism = createOrganism({
      id: "a", genome: randomGenome(60, createRng(1)), x: 0, y: 0, energy: 10, generation: 0,
      parentIds: [], birthTick: 0, birthTemperature: 1,
    });
    organism.phenotype = { ...organism.phenotype, traits: { ...organism.phenotype.traits, thermalTolerance: 0 } };
    const value = preferredTemperature(organism);
    expect(value).toBeGreaterThan(0); // birth site pulls it up from pure-genetic 0...
    expect(value).toBeLessThan(0.5); // ...but genetics still dominates the blend
  });

  it("clamps to [0, 1]", () => {
    const organism = createOrganism({
      id: "a", genome: randomGenome(60, createRng(1)), x: 0, y: 0, energy: 10, generation: 0,
      parentIds: [], birthTick: 0, birthTemperature: 1,
    });
    organism.phenotype = { ...organism.phenotype, traits: { ...organism.phenotype.traits, thermalTolerance: 1 } };
    expect(preferredTemperature(organism)).toBe(1);
  });
});
