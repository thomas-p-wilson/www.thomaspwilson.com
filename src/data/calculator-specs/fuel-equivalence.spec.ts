import { describe, expect, it } from "vitest";
import { fuelEquivalence } from "./fuel-equivalence";

describe("fuelEquivalence", () => {
  it("converts a gallon of gasoline into its equivalent syngas volume via total energy", () => {
    const result = fuelEquivalence.calculate({ ...fuelEquivalence.defaults, inFuel: "gasoline", inLiquidQty: "1", outFuel: "syngas", outSyngasHeatingValue: "2.07" });
    expect(parseFloat(result.totalEnergy)).toBeCloseTo(33.7, 2);
    expect(parseFloat(result.outGasQty)).toBeCloseTo(33.7 / 2.07, 2);
  });

  it("round-trips: converting a fuel to itself returns the same quantity", () => {
    const result = fuelEquivalence.calculate({ ...fuelEquivalence.defaults, inFuel: "diesel", inLiquidQty: "5", outFuel: "diesel" });
    expect(parseFloat(result.outLiquidQty)).toBeCloseTo(5, 3);
  });

  it("uses the electricity quantity directly as energy (1 kWh/unit)", () => {
    const result = fuelEquivalence.calculate({ ...fuelEquivalence.defaults, inFuel: "electricity", inEnergyQty: "12", outFuel: "electricity" });
    expect(parseFloat(result.totalEnergy)).toBeCloseTo(12, 3);
    expect(parseFloat(result.outEnergyQty)).toBeCloseTo(12, 3);
  });

  it("respects an edited custom heating value on both sides", () => {
    const result = fuelEquivalence.calculate({
      ...fuelEquivalence.defaults,
      inFuel: "custom", inCustomQty: "10", inCustomHeatingValue: "5",
      outFuel: "custom", outCustomHeatingValue: "2",
    });
    expect(parseFloat(result.totalEnergy)).toBeCloseTo(50, 3);
    expect(parseFloat(result.outCustomQty)).toBeCloseTo(25, 3);
  });

  it("clears the result and total energy when the active heating value is zero or invalid", () => {
    const result = fuelEquivalence.calculate({ ...fuelEquivalence.defaults, inFuel: "syngas", inGasQty: "10", inSyngasHeatingValue: "0" });
    expect(result.totalEnergy).toBe("");
    expect(result.outGasQty).toBe("");
  });

  it("only populates the output quantity field matching the target fuel's category", () => {
    const result = fuelEquivalence.calculate({ ...fuelEquivalence.defaults, inFuel: "gasoline", inLiquidQty: "1", outFuel: "biomass" });
    expect(result.outMassQty).not.toBe("");
    expect(result.outLiquidQty).toBe("");
    expect(result.outGasQty).toBe("");
    expect(result.outEnergyQty).toBe("");
    expect(result.outCustomQty).toBe("");
  });
});
