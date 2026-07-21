import { describe, expect, it } from "vitest";
import { projectRetirement, savingsRateNumeric, savingsRatePercent, yearsUntilDeath } from "./retirement";

describe("yearsUntilDeath", () => {
  it("floors 82.3 minus age", () => {
    expect(yearsUntilDeath(20)).toBe(62);
    expect(yearsUntilDeath(82)).toBe(0);
  });
});

describe("savingsRate", () => {
  it("computes numeric and percent savings rate", () => {
    expect(savingsRateNumeric(36000, 25000)).toBe(11000);
    expect(savingsRatePercent(36000, 25000)).toBeCloseTo(11000 / 36000, 10);
  });
});

describe("projectRetirement", () => {
  it("grows a high-savings-rate portfolio and eventually flags retirement", () => {
    const result = projectRetirement({
      age: 20, net: 100000, expenses: 20000, netMatchInflation: false, expensesMatchInflation: false,
      savings: 50000, interest: 0.08, inflation: 0.02, safety: 0,
    });
    expect(result.retirementYear).not.toBeNull();
    expect(result.retirement[result.retirement.length - 1]).toBeGreaterThan(0);
  });

  it("never retires when expenses exceed income and there's no cushion", () => {
    const result = projectRetirement({
      age: 20, net: 20000, expenses: 25000, netMatchInflation: false, expensesMatchInflation: false,
      savings: 0, interest: 0.05, inflation: 0.02, safety: 0,
    });
    expect(result.retirementYear).toBeNull();
  });

  it("produces one entry per year of the horizon plus the seed year", () => {
    const result = projectRetirement({
      age: 50, net: 80000, expenses: 40000, netMatchInflation: false, expensesMatchInflation: false,
      savings: 100000, interest: 0.06, inflation: 0.02, safety: 0,
    });
    expect(result.unspent.length).toBe(yearsUntilDeathHorizon(50) + 1);
  });
});

function yearsUntilDeathHorizon(age: number) {
  return Math.floor(82.3 - age);
}
