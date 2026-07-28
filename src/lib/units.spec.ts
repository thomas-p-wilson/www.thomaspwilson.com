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

  it("converts length linearly, including historical/surveying units", () => {
    expect(convert(1, "km", "m").toString()).toBe("1000");
    expect(convert(100, "cm", "m").toString()).toBe("1");
    expect(convert(1, "mi", "ft").toNumber()).toBeCloseTo(5280, 0);
    expect(convert(1, "chain", "link").toNumber()).toBeCloseTo(100, 6);
    expect(convert(1, "mi", "furlong").toNumber()).toBeCloseTo(8, 6);
    expect(convert(1000, "th", "in").toNumber()).toBeCloseTo(1, 6);
    expect(convert(1, "cable", "m").toString()).toBe("185.2");
  });

  it("converts mass linearly, including troy/avoirdupois", () => {
    expect(convert(1, "kg", "g").toString()).toBe("1000");
    expect(convert(16, "oz", "lb").toNumber()).toBeCloseTo(1, 5);
    expect(convert(12, "oz-troy", "lb-troy").toNumber()).toBeCloseTo(1, 5);
    expect(convert(16, "dr", "oz").toNumber()).toBeCloseTo(1, 5);
    expect(convert(4, "qr", "cwt-long").toNumber()).toBeCloseTo(1, 5);
    expect(convert(20, "cwt-short", "ton-short").toNumber()).toBeCloseTo(1, 5);
  });

  it("converts temperature with the correct affine shift", () => {
    expect(convert(0, "C", "F").toString()).toBe("32");
    expect(convert(100, "C", "F").toString()).toBe("212");
    expect(convert(0, "C", "K").toString()).toBe("273.15");
    expect(convert(32, "F", "C").toString()).toBe("0");
    expect(convert(100, "F", "R").toNumber()).toBeCloseTo(559.67, 2);
  });

  it("converts volume", () => {
    expect(convert(1, "gal", "quart").toNumber()).toBeCloseTo(4, 5);
    expect(convert(1, "m3", "L").toString()).toBe("1000");
    expect(convert(1, "yd3", "ft3").toNumber()).toBeCloseTo(27, 3);
    expect(convert(1000, "mm3", "cm3").toNumber()).toBeCloseTo(1, 6);
  });

  it("converts energy, including Wh<->J", () => {
    expect(convert(1, "kWh", "Wh").toString()).toBe("1000");
    expect(convert(1, "Wh", "J").toNumber()).toBeCloseTo(3600, 5);
  });

  it("converts energy to/from BTU", () => {
    expect(convert(1, "kWh", "BTU").toNumber()).toBeCloseTo(3412.14, 1);
    expect(convert(3412.14, "BTU", "kWh").toNumber()).toBeCloseTo(1, 4);
  });

  it("converts power", () => {
    expect(convert(1, "kW", "W").toString()).toBe("1000");
  });

  it("converts time", () => {
    expect(convert(1, "h", "min").toString()).toBe("60");
    expect(convert(1, "d", "h").toString()).toBe("24");
  });

  it("converts frequency, including rpm/rad-per-s", () => {
    expect(convert(1, "kHz", "Hz").toString()).toBe("1000");
    expect(convert(60, "rpm", "Hz").toNumber()).toBeCloseTo(1, 5);
  });

  it("converts pressure", () => {
    expect(convert(1, "bar", "kPa").toNumber()).toBeCloseTo(100, 5);
    expect(convert(1, "psi", "Pa").toNumber()).toBeCloseTo(6894.757, 2);
  });

  it("converts angle using the correct (non-inverted) multipliers", () => {
    expect(convert(180, "deg", "rad").toNumber()).toBeCloseTo(Math.PI, 5);
    expect(convert(1, "rot", "deg").toString()).toBe("360");
  });

  it("converts force, including kilogram-force/pound-force", () => {
    expect(convert(1, "kN", "N").toString()).toBe("1000");
    expect(convert(1, "kgf", "N").toNumber()).toBeCloseTo(9.80665, 5);
    expect(convert(1, "lbf", "N").toNumber()).toBeCloseTo(4.4482216152605, 6);
    expect(convert(16, "ozf", "lbf").toNumber()).toBeCloseTo(1, 5);
  });
});
