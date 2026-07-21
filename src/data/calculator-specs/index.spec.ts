import { describe, expect, it } from "vitest";
import { genericCalculatorSpecs } from "./index";
import { unitsForMeasure } from "@/lib/units";

describe("generic calculator specs", () => {
  it("has a unique slug per calculator", () => {
    const slugs = genericCalculatorSpecs.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every measure-tagged field's storage unit is a valid symbol within that measure", () => {
    for (const spec of genericCalculatorSpecs) {
      for (const field of spec.sections.flatMap((s) => s.fields)) {
        if (!field.measure) continue;
        const symbols = unitsForMeasure(field.measure).map((u) => u.symbol);
        expect(symbols, `${spec.slug}.${field.id}: "${field.unit}" is not a valid ${field.measure} symbol`).toContain(field.unit);
      }
    }
  });

  for (const spec of genericCalculatorSpecs) {
    it(`${spec.slug}: calculates without throwing and populates every read-only field from its defaults`, () => {
      const result = spec.calculate({ ...spec.defaults });
      const readOnlyFields = spec.sections.flatMap((s) => s.fields).filter((f) => {
        const ro = typeof f.readOnly === "function" ? f.readOnly(result) : f.readOnly;
        return ro && !f.hidden?.(result);
      });
      for (const field of readOnlyFields) {
        expect(result[field.id], `${spec.slug}.${field.id} should be populated from defaults`).toBeTruthy();
        expect(result[field.id], `${spec.slug}.${field.id} should not be NaN`).not.toMatch(/^NaN$/);
      }
    });
  }
});
