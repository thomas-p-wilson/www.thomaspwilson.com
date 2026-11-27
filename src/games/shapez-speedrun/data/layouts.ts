import type { Layout } from "../engine/layout";

// One module of each line: build copies of it side by side. The grid format
// is described in engine/layout.ts.
// The tests trace every layout to check the hub receives the level's shape.

const direct = (resource: "C" | "R" | "S", caption: string): Layout => ({
  rows: [
    "HH", //
    "B^",
    "B^",
    `M^${resource}`,
  ],
  caption,
});

/** Empty head/tail rows, padded to `width` tiles. */
const blank = (width: number) => Array.from({ length: width }, () => "..").join(" ");

/** Head or tail columns: given rows by index, the rest blank. */
function edge(height: number, width: number, rows: Record<number, string>): string[] {
  return Array.from({ length: height }, (_, i) => rows[i] ?? blank(width));
}

const PAINT_CAPTION =
  "Build {blocks} block(s) of {tiles per block} tiles. Each block is its own row, with one belt of each ingredient and its own belt to the hub. " +
  "Each miner on the left stands for all the miners on that belt.";

/**
 * Levels 9 and 10: a mixer and a painter per tile. Three belts run along the
 * bottom (two colours, one shape); a balancer at each tile splits off a lane,
 * and lanes that cross a belt go through a tunnel. Painted shapes merge onto a
 * belt along the top that runs to the hub.
 */
function mixedPaint(shape: "C" | "S", colourA: string, colourB: string): Layout {
  return {
    rows: [
      "..  ..  HH", //
      "..  ..  B^",
      "B>  B>  ##",
      "B^  ..  P^",
      "X^  ##  B^",
      `M^${colourA} M^${colourB} B^`,
      `..  ..  M^${shape}`,
    ],
    tiled: {
      head: edge(15, 2, { 7: ".. L>", 8: `M>${colourA} ##`, 11: `M>${colourB} B>`, 14: `M>${shape} B>` }),
      tile: [
        "B> B> B> L>", //
        "..   ..   B> ##",
        "..   ..   B^ ..",
        "B> B> ##   ..",
        "B^ ..   P^ ..",
        "X^ ##   B^ ..",
        "B^ O^ B^ ..",
        "B^ ..   O^ L>",
        "B> B> B> ##",
        "..   E^ ..   ..",
        "L> B^ ..   ..",
        "##   B> B> B>",
        "..   ..   E^ ..",
        "..   L> B^ ..",
        "B> ##   B> B>",
      ],
      tail: edge(15, 2, { 0: "B> HH", 11: "Z. ..", 14: "Z. .." }),
      show: 3,
    },
    caption: PAINT_CAPTION,
  };
}

export const layouts = {
  "l1-circles": direct("C", "One per miner, side by side. Each miner needs its own belt until balancers unlock at level 3."),
  "l3-squares": direct("R", "One per miner, side by side. Each miner needs its own belt until balancers unlock at level 3."),
  stars: direct("S", "One per miner, side by side. Each miner needs its own belt until balancers unlock at level 3."),

  // Cutter: the west half (----CuCu) is the goal; the east half goes in the trash.
  l2: {
    rows: [
      "HH   ..", //
      "B^ ..",
      "B^ T.",
      "C^ ##",
      "B^   ..",
      "M^C  ..",
    ],
    caption: "One of {modules}, side by side. One cutter per miner: a miner makes 0.4/s, a cutter handles 0.5/s.",
  },

  // Cutter: the east half (RuRu----) is the goal; the west half goes in the trash.
  l4: {
    rows: [
      "..   HH", //
      "..   B^",
      "T. B^",
      "C^ ##",
      "B^   ..",
      "M^R  ..",
    ],
    caption: "One of {modules}, side by side. The cutter's input is under its left tile, so the miner goes there.",
  },

  // Cut, then rotate the west half clockwise: ----CuCu → Cu----Cu.
  l5: {
    rows: [
      "HH   ..", //
      "B^ ..",
      "R^ ..",
      "B^ T.",
      "C^ ##",
      "B^   ..",
      "M^C  ..",
    ],
    caption: "One of {modules}, side by side. The east half goes in the trash for now; Belt II turns it into --CuCu-- later.",
  },

  // Level 5's line with the east half rotated too: CuCu---- → --CuCu-- for Belt II.
  belt2: {
    rows: [
      "HH HH", //
      "B^ B^",
      "R^ R^",
      "B^ B^",
      "C^ ##",
      "B^ ..",
      "M^C ..",
    ],
    caption: "Each level 5 module, with a rotator and a belt to the hub in place of the trash.",
  },

  // Cut, rotate the west half to Cu----Cu, cut again: both outputs become Cu------.
  l6: {
    rows: [
      "HH   HH", //
      "B^ B^",
      "R^ B^",
      "C^ ##",
      "B^ ..",
      "R^ T.",
      "C^ ##",
      "B^   ..",
      "M^C  ..",
    ],
    caption: "One of {modules}, side by side. The second cutter's west output (------Cu) rotated clockwise is Cu------ too.",
  },

  // One painter per tile: shapes and red come along belts at the bottom, a
  // balancer at each tile splits off a lane for each, and painted circles
  // merge onto a belt along the top to the hub. The shape lane crosses the red
  // belt in a tunnel.
  l7: {
    rows: [
      "..  HH", //
      "..  B^",
      "B>  ##",
      "M^r P^",
      "..  B^",
      "..  M^C",
    ],
    tiled: {
      head: edge(11, 2, { 6: ".. L>", 7: "M>r ##", 10: "M>C B>" }),
      tile: [
        "B> B> L>", //
        "..   B> ##",
        "..   B^ ..",
        "B> ##   ..",
        "B^ P^ ..",
        "B^ O^ ..",
        "B^ ..   L>",
        "B> B> ##",
        "..   E^ ..",
        "L> B^ ..",
        "##   B> B>",
      ],
      tail: edge(11, 2, { 0: "B> HH", 10: "Z. .." }),
      show: 3,
    },
    caption: PAINT_CAPTION,
  },

  // Paint whole squares blue, cut, rotate the west half twice; a balancer merges both halves.
  l8: {
    rows: [
      "..  HH   ..", //
      "..  B^ ..",
      "..  L^ ##",
      "..  B^ B^",
      "..  R^ B^",
      "..  R^ B^",
      "..  B^ B^",
      "..  C^ ##",
      "..  B^ ..",
      "B>  ##   ..",
      "M^b P^ ..",
      "..  B^   ..",
      "..  M^R  ..",
    ],
    tiled: {
      head: edge(18, 2, { 13: ".. L>", 14: "M>b ##", 17: "M>R B>" }),
      tile: [
        "B> B> L>", //
        "..   B> ##",
        "..   B^ ..",
        "..   L^ ##",
        "..   B^ B^",
        "..   R^ B^",
        "..   R^ B^",
        "..   B^ B^",
        "..   C^ ##",
        "..   B^ ..",
        "B> ##   ..",
        "B^ P^ ..",
        "B^ O^ ..",
        "B^ ..   L>",
        "B> B> ##",
        "..   E^ ..",
        "L> B^ ..",
        "##   B> B>",
      ],
      tail: edge(18, 2, { 0: "B> HH", 17: "Z. .." }),
      show: 3,
    },
    caption:
      "Build {blocks} block(s) of {tiles per block} tiles, each its own row with one belt of each ingredient and its own belt to the hub. " +
      "Each paint job makes two goal shapes; a balancer merges the halves. " +
      "Each miner on the left stands for all the miners on that belt.",
  },

  l9: mixedPaint("C", "r", "b"),
  l10: mixedPaint("S", "g", "b"),

  // Green circle halves and cyan star halves, rotated into place and stacked.
  // A tunnel takes the first stacker's output under the belt to the second one.
  l11: {
    rows: [
      "..  ..   HH   ..   ..   ..", //
      "..  ..   B^ ..   ..   ..",
      "..  ..   L^ ##   ..   ..",
      "..  ..   B^ B^ B< ..",
      "..  ..   B^ ..   B^ ..",
      "..  ..   O^ ..   S^ ##",
      "..  B> B> B> B^ B^",
      "..  B^ E^ ..   ..   B^",
      "..  B^ S^ ##   B> B^",
      "..  B^ B^ B^ B^ ..",
      "..  R^ Q^ Q^ R^ ..",
      "..  B^ B^ B^ B^ ..",
      "..  C^ ##   C^ ##   ..",
      "..  B^ ..   B^ ##   M<b",
      "M>g ##   ..   ##   X< M<g",
      "..  P^ ..   N^ ..   ..",
      "..  B^   ..   B^   ..   ..",
      "..  M^C  ..   M^S  ..   ..",
    ],
    caption: "One of {modules}, side by side. Each painter feeds both halves of its cut, so one module makes 2 shapes per cycle.",
  },

  // Three parts stacked into one layer, painted blue, then a white circle on top.
  l12: {
    rows: [
      "..  HH   ..   ..   ..   ..   ..", //
      "..  B^ ..   ..   ..   ..   ..",
      "..  S^ ##   ..   ..   ..   ..",
      "..  B^ B^ ##   M<r  ##   M<b",
      "M>b ##   ##   X< B< X< M<g",
      "..  P^ N^ ..   ..   ..   ..",
      "..  B^ B^ B< M<C  ..   ..",
      "..  S^ ##   ..   ..   ..   ..",
      "..  B^ B^ B< B< ..   ..",
      "..  S^ ##   ..   B^ ..   ..",
      "..  B^ B^ T. B^ T. ..",
      "..  B^ C^ ##   C^ ##   ..",
      "..  R^ B^ ..   B^ ..   ..",
      "..  R^ R^ ..   R^ ..   ..",
      "..  B^ B^ ..   B^ T. ..",
      "..  C^ ##   ..   C^ ##   ..",
      "..  B^   ..   ..   B^   ..   ..",
      "..  M^C  ..   ..   M^R  ..   ..",
    ],
    caption:
      "One of {modules}, side by side. Parts: CuCu---- (west half turned twice), ----Cu-- (east half turned, cut again), ------Ru (square west half turned, cut again).",
  },
} satisfies Record<string, Layout>;

