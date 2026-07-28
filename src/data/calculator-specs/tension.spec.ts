import { describe, expect, it } from "vitest";
import { tensionCalculator } from "./tension";

describe("tensionCalculator", () => {
  const base = { mass: "10", gravity: "9.80665" };
  const weight = 10 * 9.80665;

  it("derives weight from mass and gravity via the weight-from-mass sub-calculator", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "vertical" });
    expect(parseFloat(result.weight)).toBeCloseTo(weight, 2);

    const field = tensionCalculator.sections[0].fields.find((f) => f.id === "weight")!;
    const subCalc = field.subCalculator!(result)!;
    expect(subCalc.spec.slug).toBe("weight-from-mass");
    expect(subCalc.prefill(result)).toEqual({ mass: result.mass, gravity: result.gravity });
  });

  it("a single vertical line carries the full weight and has no second tension", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "vertical" });
    expect(parseFloat(result.tension1)).toBeCloseTo(weight, 2);
    expect(result.tension2).toBe("");
    expect(result.angle1).toBe("");
  });

  it("splits tension evenly between two lines at equal angles", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "horizontal-double", angle1: "45", angle2: "45" });
    // T = W / (2 sin(theta)) for a symmetric V.
    const expected = weight / (2 * Math.sin((45 * Math.PI) / 180));
    expect(parseFloat(result.tension1)).toBeCloseTo(expected, 1);
    expect(parseFloat(result.tension2)).toBeCloseTo(expected, 1);
  });

  it("gives the steeper of two unequal angled lines more tension than the shallower one", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "horizontal-double", angle1: "80", angle2: "10" });
    expect(parseFloat(result.tension1)).toBeGreaterThan(parseFloat(result.tension2));
  });

  it("computes symmetric angles and equal tensions for a sagging line with a centered weight", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "horizontal-single", span: "4", sagDepth: "0.5", position: "2" });
    expect(parseFloat(result.angle1)).toBeCloseTo(parseFloat(result.angle2), 6);
    expect(parseFloat(result.tension1)).toBeCloseTo(parseFloat(result.tension2), 1);
    expect(parseFloat(result.totalLineLength)).toBeCloseTo(parseFloat(result.lineLength1) + parseFloat(result.lineLength2), 2);
  });

  it("gives the near (steeper) segment of an off-center sagging line more tension than the far one", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "horizontal-single", span: "4", sagDepth: "0.5", position: "1" });
    expect(parseFloat(result.angle1)).toBeGreaterThan(parseFloat(result.angle2));
    expect(parseFloat(result.lineLength1)).toBeLessThan(parseFloat(result.lineLength2));
    expect(parseFloat(result.tension1)).toBeGreaterThan(parseFloat(result.tension2));
  });

  it("leaves sagging-line results blank once the weight position is out of range", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "horizontal-single", span: "4", sagDepth: "0.5", position: "5" });
    expect(result.tension1).toBe("");
    expect(result.angle1).toBe("");
    expect(result.totalLineLength).toBe("");
  });

  it("leaves sagging-line-only fields blank for the two-line scenario", () => {
    const result = tensionCalculator.calculate({ ...base, scenario: "horizontal-double", angle1: "30", angle2: "60" });
    expect(result.lineLength1).toBe("");
    expect(result.lineLength2).toBe("");
    expect(result.totalLineLength).toBe("");
  });
});
