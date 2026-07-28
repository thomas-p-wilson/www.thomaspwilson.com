import { describe, expect, it } from "vitest";
import { energyConversionChain } from "./energy-conversion-chain";

describe("energyConversionChain", () => {
  it("chains step efficiencies multiplicatively", () => {
    const result = energyConversionChain.calculate({
      ...energyConversionChain.defaults,
      energyIn: "100", step1Efficiency: "50", step2Enabled: "true", step2Efficiency: "50", step3Enabled: "false",
    });
    expect(parseFloat(result.step1EnergyOut)).toBeCloseTo(50, 3);
    expect(parseFloat(result.step2EnergyOut)).toBeCloseTo(25, 3);
    expect(result.step3EnergyOut).toBe("");
    expect(parseFloat(result.energyOut)).toBeCloseTo(25, 3);
    expect(parseFloat(result.overallEfficiency)).toBeCloseTo(25, 2);
  });

  it("skips a disabled step entirely, leaving the chain unaffected", () => {
    const result = energyConversionChain.calculate({
      ...energyConversionChain.defaults,
      energyIn: "100", step1Efficiency: "80", step2Enabled: "false", step3Enabled: "false",
    });
    expect(parseFloat(result.energyOut)).toBeCloseTo(80, 3);
    expect(parseFloat(result.overallEfficiency)).toBeCloseTo(80, 2);
    expect(result.step2EnergyOut).toBe("");
  });

  it("runs all three steps when enabled", () => {
    const result = energyConversionChain.calculate({
      ...energyConversionChain.defaults,
      energyIn: "100", step1Efficiency: "50", step2Enabled: "true", step2Efficiency: "80",
      step3Enabled: "true", step3Efficiency: "90",
    });
    const expected = 100 * 0.5 * 0.8 * 0.9;
    expect(parseFloat(result.energyOut)).toBeCloseTo(expected, 3);
    expect(parseFloat(result.overallEfficiency)).toBeCloseTo(expected, 2);
  });

  it("clears every downstream result once a step's efficiency is out of range", () => {
    const result = energyConversionChain.calculate({
      ...energyConversionChain.defaults,
      energyIn: "100", step1Efficiency: "150", step2Enabled: "true", step2Efficiency: "80", step3Enabled: "false",
    });
    expect(result.step1EnergyOut).toBe("");
    expect(result.step2EnergyOut).toBe("");
    expect(result.energyOut).toBe("");
    expect(result.overallEfficiency).toBe("");
  });

  it("clears results for a negative or non-numeric input energy", () => {
    const result = energyConversionChain.calculate({ ...energyConversionChain.defaults, energyIn: "-5" });
    expect(result.energyOut).toBe("");
    expect(result.overallEfficiency).toBe("");
  });
});
