import { describe, expect, it } from "vitest";
import { energyEquivalents, randomEquivalent } from "./energy-equivalents";

describe("energyEquivalents", () => {
  it("every entry has a positive kWhPerUnit, at least one phrasing, and produces non-empty text for each", () => {
    for (const equivalent of energyEquivalents) {
      expect(equivalent.kWhPerUnit).toBeGreaterThan(0);
      expect(equivalent.phrasings.length).toBeGreaterThan(0);
      for (const phrasing of equivalent.phrasings) {
        expect(phrasing(1)).toMatch(/\S/);
      }
    }
  });

  it("scales the Prius comparison off the 1 gallon / 70 km anchor", () => {
    const prius = energyEquivalents.find((e) => e.id === "prius-km")!;
    expect(33.7 / prius.kWhPerUnit).toBeCloseTo(70, 5);
  });

  it("returns undefined for zero, negative, or non-finite energy", () => {
    expect(randomEquivalent(0)).toBeUndefined();
    expect(randomEquivalent(-5)).toBeUndefined();
    expect(randomEquivalent(NaN)).toBeUndefined();
    expect(randomEquivalent(Infinity)).toBeUndefined();
  });

  it("returns a valid comparison scaled to the given energy", () => {
    const result = randomEquivalent(33.7);
    expect(result).toBeDefined();
    expect(energyEquivalents.some((e) => e.id === result!.id)).toBe(true);
  });

  it("avoids repeating the excluded id when more than one equivalent exists", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const result = randomEquivalent(33.7, undefined, "prius-km");
      seen.add(result!.id);
    }
    expect(seen.has("prius-km")).toBe(false);
  });

  it("only surfaces comparisons tagged for the given fuel, plus fuel-agnostic ones", () => {
    for (let i = 0; i < 50; i++) {
      const result = randomEquivalent(1000, "diesel");
      const entry = energyEquivalents.find((e) => e.id === result!.id)!;
      expect(entry.fuels.some((f) => f === "diesel" || f === "any")).toBe(true);
    }
  });

  it("never surfaces a gasoline-specific comparison for a diesel total, or vice versa", () => {
    for (let i = 0; i < 50; i++) {
      expect(randomEquivalent(1000, "diesel")!.id).not.toBe("prius-km");
      expect(randomEquivalent(1000, "gasoline")!.id).not.toBe("kenworth-miles");
    }
  });

  it("restricts \"custom\" fuel, which has no assumed real-world use, to the fuel-agnostic pool", () => {
    for (let i = 0; i < 50; i++) {
      const result = randomEquivalent(1000, "custom")!;
      const entry = energyEquivalents.find((e) => e.id === result.id)!;
      expect(entry.fuels).toEqual(["any"]);
    }
  });

  it("surfaces a nuclear detonation comparison for any fuel, since it's tagged fuel-agnostic", () => {
    const nukeIds = ["davy-crockett-blasts", "trinity-blasts", "castle-bravo-blasts", "tsar-bomba-blasts"];
    for (const id of nukeIds) {
      const entry = energyEquivalents.find((e) => e.id === id)!;
      expect(entry.fuels).toEqual(["any"]);
      expect(entry.kWhPerUnit).toBeGreaterThan(0);
    }
    // Tsar Bomba (50 Mt) should dwarf Davy Crockett (10 tons) by roughly 5 million times.
    const davyCrockett = energyEquivalents.find((e) => e.id === "davy-crockett-blasts")!;
    const tsarBomba = energyEquivalents.find((e) => e.id === "tsar-bomba-blasts")!;
    expect(tsarBomba.kWhPerUnit / davyCrockett.kWhPerUnit).toBeCloseTo(5_000_000, -4);
  });

  it("surfaces the 10kW generator comparison only for gasoline, diesel, or syngas", () => {
    const generator = energyEquivalents.find((e) => e.id === "generator-10kw-days")!;
    expect(generator.fuels.sort()).toEqual(["diesel", "gasoline", "syngas"]);
  });

  it("varies which phrasing it renders across repeated draws of the same comparison", () => {
    const prius = energyEquivalents.find((e) => e.id === "prius-km")!;
    const seenTexts = new Set<string>();
    for (let i = 0; i < 50; i++) {
      seenTexts.add(prius.phrasings[i % prius.phrasings.length](70));
    }
    expect(seenTexts.size).toBe(prius.phrasings.length);
    expect(seenTexts.size).toBeGreaterThan(1);
  });

  it("draws from the full unfiltered list when no fuel key is given", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      seen.add(randomEquivalent(1000)!.id);
    }
    expect(seen.size).toBe(energyEquivalents.length);
  });
});
