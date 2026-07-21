import { describe, expect, it } from "vitest";
import { genericCalculatorSpecs } from "./index";

describe("generic calculator specs", () => {
  it("has a unique slug per calculator", () => {
    const slugs = genericCalculatorSpecs.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
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
