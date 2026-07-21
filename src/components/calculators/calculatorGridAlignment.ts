import type { CSSProperties } from "react";

/**
 * Lets GenericCalculator's cards and CalculatorHelp's blocks line up horizontally as a shared CSS
 * grid, keyed by the same row per section index — so a tall card's row doesn't push everything
 * below it out of sync with the (possibly much shorter) help text for later sections.
 *
 * Implemented via CSS custom properties rather than plain Tailwind row/col utilities because the
 * row number is dynamic (depends on `spec.sections.length`), which static utility classes can't
 * express — but an arbitrary-value class referencing `var(--gr)`/`var(--gc)` can, with the actual
 * number supplied per-element via inline style. The `lg:` prefix keeps this inert below that
 * breakpoint, where CalculatorPage's grid collapses to one column and everything should instead
 * just stack in DOM order (whole calculator, then whole help panel) — grid-row/column properties
 * only affect an element that is a direct child of a grid container, so applying them here is
 * always safe even in the non-grid contexts (standalone page, nested subCalculator) that reuse
 * these same components.
 */
export const GRID_PLACEMENT_CLASS = "lg:[grid-row:var(--gr)] lg:[grid-column:var(--gc)]";

export type GridVars = CSSProperties & Record<`--${string}`, string | number>;

export const gridPos = (row: number | string, col: number | string = 1): GridVars =>
  ({ "--gr": row, "--gc": col }) as GridVars;

/** Row shared by a section's card and its help block(s); row 1 is reserved for the visual/intro pairing. */
export const sectionGridRow = (sectionIndex: number): number => sectionIndex + 2;
