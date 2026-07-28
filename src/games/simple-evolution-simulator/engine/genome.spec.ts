import { describe, expect, it } from "vitest";
import { BASES } from "./codonTable";
import {
  MAX_GENOME_LENGTH, MIN_GENOME_LENGTH, createSeedGenome, deleteMutate, duplicateSegment, insertMutate,
  mutate, pointMutate, randomGenome, scaleMutationConfig,
} from "./genome";
import { decode } from "./phenotype";
import { createRng } from "./rng";

const isValidGenome = (genome: string) => [...genome].every((b) => (BASES as string[]).includes(b));

describe("randomGenome", () => {
  it("produces the requested length using only valid bases", () => {
    const genome = randomGenome(50, createRng(1));
    expect(genome).toHaveLength(50);
    expect(isValidGenome(genome)).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    expect(randomGenome(30, createRng(42))).toBe(randomGenome(30, createRng(42)));
  });
});

describe("pointMutate", () => {
  it("never changes length", () => {
    const genome = randomGenome(40, createRng(1));
    expect(pointMutate(genome, 0.5, createRng(2))).toHaveLength(40);
  });

  it("changes nothing at rate 0", () => {
    const genome = randomGenome(40, createRng(1));
    expect(pointMutate(genome, 0, createRng(2))).toBe(genome);
  });

  it("mutates most bases at rate 1", () => {
    const genome = "A".repeat(60);
    const mutated = pointMutate(genome, 1, createRng(3));
    const changedCount = [...mutated].filter((b, i) => b !== genome[i]).length;
    // Each base independently redraws from all 4 bases, so ~75% actually change.
    expect(changedCount).toBeGreaterThan(30);
  });
});

describe("insertMutate / deleteMutate", () => {
  it("insertMutate grows the genome by 1-3 bases when it fires", () => {
    const genome = randomGenome(40, createRng(1));
    const grown = insertMutate(genome, 1, createRng(2));
    expect(grown.length).toBeGreaterThan(genome.length);
    expect(grown.length).toBeLessThanOrEqual(genome.length + 3);
  });

  it("deleteMutate shrinks the genome by 1-3 bases when it fires", () => {
    const genome = randomGenome(40, createRng(1));
    const shrunk = deleteMutate(genome, 1, createRng(2));
    expect(shrunk.length).toBeLessThan(genome.length);
  });

  it("deleteMutate never shrinks below MIN_GENOME_LENGTH", () => {
    const genome = randomGenome(MIN_GENOME_LENGTH + 1, createRng(1));
    const rng = createRng(7);
    let result = genome;
    for (let i = 0; i < 50; i++) result = deleteMutate(result, 1, rng);
    expect(result.length).toBeGreaterThanOrEqual(MIN_GENOME_LENGTH);
  });
});

describe("duplicateSegment", () => {
  it("grows the genome and the duplicated content is a substring of the original", () => {
    const genome = randomGenome(60, createRng(5));
    const duplicated = duplicateSegment(genome, 1, createRng(9));
    expect(duplicated.length).toBeGreaterThan(genome.length);
    // The inserted segment must have come from somewhere in the original.
    const insertedLength = duplicated.length - genome.length;
    let foundSourceSubstring = false;
    for (let start = 0; start + insertedLength <= duplicated.length; start++) {
      const candidate = duplicated.slice(start, start + insertedLength);
      if (genome.includes(candidate)) {
        foundSourceSubstring = true;
        break;
      }
    }
    expect(foundSourceSubstring).toBe(true);
  });

  it("respects MAX_GENOME_LENGTH", () => {
    const genome = randomGenome(MAX_GENOME_LENGTH - 2, createRng(1));
    const rng = createRng(3);
    let result = genome;
    for (let i = 0; i < 20; i++) result = duplicateSegment(result, 1, rng);
    expect(result.length).toBeLessThanOrEqual(MAX_GENOME_LENGTH);
  });
});

describe("mutate", () => {
  it("is deterministic for a given seed", () => {
    const genome = randomGenome(80, createRng(1));
    const config = { pointRate: 0.05, insertionRate: 0.2, deletionRate: 0.2, duplicationRate: 0.1 };
    expect(mutate(genome, config, createRng(11))).toBe(mutate(genome, config, createRng(11)));
  });

  it("stays within genome length bounds after many generations", () => {
    const rng = createRng(21);
    const config = { pointRate: 0.02, insertionRate: 0.3, deletionRate: 0.3, duplicationRate: 0.2 };
    let genome = createSeedGenome(rng);
    for (let i = 0; i < 200; i++) genome = mutate(genome, config, rng);
    expect(genome.length).toBeGreaterThanOrEqual(MIN_GENOME_LENGTH);
    expect(genome.length).toBeLessThanOrEqual(MAX_GENOME_LENGTH);
    expect(isValidGenome(genome)).toBe(true);
  });
});

describe("scaleMutationConfig", () => {
  it("scales every rate by the given factor", () => {
    const config = { pointRate: 0.1, insertionRate: 0.2, deletionRate: 0.3, duplicationRate: 0.4 };
    expect(scaleMutationConfig(config, 0.5)).toEqual({
      pointRate: 0.05, insertionRate: 0.1, deletionRate: 0.15, duplicationRate: 0.2,
    });
  });

  it("clamps negative factors to zero", () => {
    const config = { pointRate: 0.1, insertionRate: 0.2, deletionRate: 0.3, duplicationRate: 0.4 };
    const scaled = scaleMutationConfig(config, -1);
    expect(Object.values(scaled).every((v) => v === 0)).toBe(true);
  });
});

describe("createSeedGenome", () => {
  it("produces a valid genome of at least MIN_GENOME_LENGTH", () => {
    const genome = createSeedGenome(createRng(1));
    expect(isValidGenome(genome)).toBe(true);
    expect(genome.length).toBeGreaterThanOrEqual(MIN_GENOME_LENGTH);
  });

  it("without an environment, thermal tolerance is left at its neutral baseline", () => {
    const genome = createSeedGenome(createRng(1));
    expect(decode(genome).traits.thermalTolerance).toBe(0.5);
  });

  it("adapts thermal tolerance toward a hot starting environment", () => {
    const genome = createSeedGenome(createRng(1), { temperature: 1, foodRegenRate: 0.15 });
    expect(decode(genome).traits.thermalTolerance).toBeGreaterThan(0.9);
  });

  it("adapts thermal tolerance toward a cold starting environment", () => {
    const genome = createSeedGenome(createRng(1), { temperature: 0, foodRegenRate: 0.15 });
    expect(decode(genome).traits.thermalTolerance).toBeLessThan(0.3);
  });
});
