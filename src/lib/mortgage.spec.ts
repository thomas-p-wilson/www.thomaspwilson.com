import { describe, expect, it } from "vitest";
import { calculateMortgageSchedule } from "./mortgage";

describe("calculateMortgageSchedule", () => {
  it("fully amortizes a single-term monthly mortgage to a zero balance", () => {
    const result = calculateMortgageSchedule([{ interest: 0.05 }], 300000, 25, 25, "monthly");
    expect(result.schedule[result.schedule.length - 1].balance).toBeCloseTo(0, 2);
    expect(result.paymentCount).toBe(300); // 25 years * 12
    expect(result.years).toBe(25);
  });

  it("produces a level payment amount for every non-final payment", () => {
    const result = calculateMortgageSchedule([{ interest: 0.05 }], 300000, 25, 25, "monthly");
    const level = result.schedule[1].amount;
    for (let i = 2; i < result.schedule.length - 1; i++) {
      expect(result.schedule[i].amount).toBeCloseTo(level, 6);
    }
  });

  it("switches to the new term's rate/payment after a rate-term change", () => {
    const result = calculateMortgageSchedule(
      [{ interest: 0.05 }, { interest: 0.08 }],
      300000, 25, 5, "monthly",
    );
    // Payment 60 is the last of term 1 (5 years * 12), payment 61 starts term 2.
    expect(result.schedule[60].rate).toBeCloseTo(0.05, 6);
    expect(result.schedule[61].rate).toBeCloseTo(0.08, 6);
  });

  it("pays off faster (fewer total payments) on an accelerated biweekly schedule than monthly", () => {
    const monthly = calculateMortgageSchedule([{ interest: 0.05 }], 300000, 25, 25, "monthly");
    const accelerated = calculateMortgageSchedule([{ interest: 0.05 }], 300000, 25, 25, "acceleratedBiWeekly");
    const monthlyYears = monthly.paymentCount / 12;
    const acceleratedYears = accelerated.paymentCount / 26;
    expect(acceleratedYears).toBeLessThan(monthlyYears);
  });
});
