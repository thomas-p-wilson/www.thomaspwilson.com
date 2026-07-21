import { describe, expect, it } from "vitest";
import { convert } from "./units";

describe("convert", () => {
  it("throws on an unrecognized source unit", () => {
    expect(() => convert(1, "bogus", "m")).toThrow('Unrecognized unit "bogus"');
  });

  it("throws on an unrecognized target unit", () => {
    expect(() => convert(1, "m", "bogus")).toThrow('Unrecognized unit "bogus"');
  });

  it("throws when converting across measures", () => {
    expect(() => convert(1, "m", "kg")).toThrow('Cannot convert between "length" and "mass"');
  });

  it("short-circuits on identical units", () => {
    expect(convert(5, "m", "m").toString()).toBe("5");
  });

  it("converts length linearly", () => {
    expect(convert(1, "km", "m").toString()).toBe("1000");
    expect(convert(100, "cm", "m").toString()).toBe("1");
    expect(convert(1, "mi", "ft").toNumber()).toBeCloseTo(5280, 0);
  });

  it("converts mass linearly", () => {
    expect(convert(1, "kg", "g").toString()).toBe("1000");
    expect(convert(16, "oz", "lb").toNumber()).toBeCloseTo(1, 5);
  });

  it("converts temperature with the correct affine shift", () => {
    expect(convert(0, "C", "F").toString()).toBe("32");
    expect(convert(100, "C", "F").toString()).toBe("212");
    expect(convert(0, "C", "K").toString()).toBe("273.15");
    expect(convert(32, "F", "C").toString()).toBe("0");
  });
});
