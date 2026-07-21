import type { ReactNode } from "react";
import type { Measure } from "@/lib/units";

export interface CalculatorFieldOption {
  value: string;
  label: string;
}

export interface CalculatorSubCalculator {
  /** The calculator to show when this field's stat tile is expanded. */
  spec: CalculatorSpec;
  /** Given the parent's current values, return the initial values to seed the sub-calculator with. */
  prefill: (values: Record<string, string>) => Record<string, string>;
}

export interface CalculatorField {
  id: string;
  label: string;
  /** The unit this field's value is stored/calculated in. Also the unit shown when `measure` is unset. */
  unit?: string;
  /**
   * Tags `unit` as belonging to a convertible family (see lib/units.ts). When set, the unit
   * badge becomes a dropdown letting the user view/edit this field in any unit of that family;
   * `unit` itself must be a valid symbol within that measure, since it's the storage/calculation unit.
   */
  measure?: Measure;
  type?: "number" | "select";
  options?: CalculatorFieldOption[];
  readOnly?: boolean | ((values: Record<string, string>) => boolean);
  hidden?: (values: Record<string, string>) => boolean;
  /**
   * Lets a readOnly field's stat tile expand into a live, independent instance of another
   * calculator, seeded from this field's derivation. Only meaningful on readOnly fields — this
   * is a one-way snapshot: the sub-calculator recomputes its own edits but never writes back.
   * A function (rather than a static spec) since which calculator applies can depend on other
   * field values (e.g. a profile select choosing between two underlying geometries).
   */
  subCalculator?: (values: Record<string, string>) => CalculatorSubCalculator | undefined;
  /**
   * One or more paragraphs of prose explaining this specific field, shown in the side help panel
   * keyed to the field's `id`. Takes precedence over the section's own `help` when both are
   * present: interacting with this field highlights just its own block instead of the whole card.
   * Reserve this for fields that need more than the card-level blurb already covers.
   */
  help?: string | string[];
}

export interface CalculatorSectionToggle {
  /** Values key this toggle reads/writes, as the usual "true"/"false" string. */
  id: string;
  /** Label shown beside the checkbox. Defaults to "Enable". */
  label?: string;
}

export interface CalculatorSectionSpec {
  title: string;
  fields: CalculatorField[];
  /**
   * When set, the section header gets a right-aligned checkbox and the section's fields render
   * only while it's checked — for optional sub-assemblies (e.g. a secondary mirror) rather than
   * always-present ones.
   */
  toggle?: CalculatorSectionToggle;
  /**
   * One or more paragraphs of prose explaining this card as a whole, shown in a side help panel
   * keyed to the card's title. Interacting with the card (outside any field that declares its own
   * `help`) highlights this block, and vice versa — the pairing is by `title`, since a section's
   * title is already its unique key. A spec where no section or field provides `help` (and no
   * `helpIntro`) renders without the side panel at all.
   */
  help?: string | string[];
}

export interface CalculatorSpec {
  slug: string;
  title: string;
  description: string;
  sections: CalculatorSectionSpec[];
  defaults: Record<string, string>;
  /** Given the full current values, return the fields that should be updated (inputs pass through untouched). */
  calculate: (values: Record<string, string>) => Record<string, string>;
  /** Constants/sources/simplifications worth surfacing under the calculator. */
  notes?: string[];
  /** Optional diagram rendered above the input fields, given the current values. */
  visual?: (values: Record<string, string>) => ReactNode;
  /**
   * Overview paragraph shown above the per-card help blocks in the side panel. Presence of this or
   * any section's `help` switches CalculatorPage from its default single-column layout to a
   * two-column one with the help panel alongside the calculator.
   */
  helpIntro?: string;
}

export const num = (values: Record<string, string>, id: string): number => parseFloat(values[id]);
