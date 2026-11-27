import type { Layout } from "../engine/layout";
import { layouts } from "./layouts";

// Level goals are the full game's (standalone/Steam) list from the shapez.io
// source, src/js/game/modes/levels.js. The browser demo uses a different list.
//
// Things in the source that shape the strategy here:
// - The hub never forgets: delivered shapes are added to a running count that
//   completing a level doesn't reset. A goal shape delivered before its level
//   comes up counts the moment it does (on the next delivery of anything).
// - Buying an upgrade subtracts its shapes from that count.
// - The Speedrun Master achievement checks in-game time. It stops while the
//   Escape menu is open, but you can't see or build then.

export interface Level {
  level: number;
  shape: string;
  required: number;
  reward: string;
  /** Suggested in-game time to have finished this level by. */
  targetSeconds: number;
  /** The level whose reward unlocks the last building this shape needs (0 = from the start). */
  startableAfter: number;
  /** How to build the shape, step by step. */
  recipe: string[];
  /** One module of the finished build, where there's a diagram for it. */
  layout?: Layout;
}

const m = (min: number, sec = 0) => min * 60 + sec;

export const levels: Level[] = [
  {
    level: 1,
    layout: layouts["l1-circles"],
    shape: "CuCuCuCu",
    required: 30,
    reward: "Cutter & trash",
    targetSeconds: m(1),
    startableAfter: 0,
    recipe: ["Circle miners, each on its own belt straight into the hub. No balancers until level 3."],
  },
  {
    level: 2,
    layout: layouts.l2,
    shape: "----CuCu",
    required: 40,
    reward: "None",
    targetSeconds: m(2),
    startableAfter: 1,
    recipe: [
      "Cut circles. The west half (----CuCu) is the goal.",
      "The cutter's left output (above its input) is the west half. Send the east half to a trash so the cutter never backs up.",
    ],
  },
  {
    level: 3,
    layout: layouts["l3-squares"],
    shape: "RuRuRuRu",
    required: 70,
    reward: "Balancer",
    targetSeconds: m(2, 30),
    startableAfter: 0,
    recipe: ["Square miners, each on its own belt straight into the hub. You set this up before level 1 was done."],
  },
  {
    level: 4,
    layout: layouts.l4,
    shape: "RuRu----",
    required: 70,
    reward: "Rotator",
    targetSeconds: m(3),
    startableAfter: 1,
    recipe: [
      "Cut squares. The east half (RuRu----) comes out of the cutter's right output; trash the west half.",
      "Built alongside level 2, so it should already be banked.",
    ],
  },
  {
    level: 5,
    layout: layouts.l5,
    shape: "Cu----Cu",
    required: 170,
    reward: "Tunnel",
    targetSeconds: m(4, 15),
    startableAfter: 4,
    recipe: [
      "Cut circles. Rotate the west half (----CuCu) clockwise to get Cu----Cu.",
      "Trash the east half (CuCu----) for now. Rotated clockwise it becomes --CuCu--, which pays for Belt II: swap the trash for a rotator once you want it.",
    ],
  },
  {
    level: 6,
    layout: layouts.l6,
    shape: "Cu------",
    required: 270,
    reward: "Painter",
    targetSeconds: m(5, 45),
    startableAfter: 4,
    recipe: [
      "Cut Cu----Cu (the level 5 shape). The east output is Cu------, which is the goal.",
      "The west output (------Cu) rotated clockwise is also Cu------. Use both outputs.",
    ],
  },
  {
    level: 7,
    layout: layouts.l7,
    shape: "CrCrCrCr",
    required: 300,
    reward: "Counter-clockwise rotator",
    targetSeconds: m(7, 30),
    startableAfter: 6,
    recipe: [
      "Paint full circles red: circle into the painter's shape input, red into its colour input.",
      "Build it as a row of one-painter tiles: circle and red belts run along the bottom, a balancer at each tile splits off a lane for each, and the circle lane goes under the red belt in a tunnel.",
      "Painted circles merge onto a belt along the top that runs to the hub. Each merging balancer's second output stays empty, which makes it a merger.",
    ],
  },
  {
    level: 8,
    layout: layouts.l8,
    shape: "RbRb----",
    required: 480,
    reward: "Mixer",
    targetSeconds: m(9, 15),
    startableAfter: 6,
    recipe: [
      "Paint full squares blue first, then cut. One paint job makes two halves.",
      "The east half is the goal. Rotate the west half clockwise twice and it becomes RbRb---- too.",
      "Tiled like level 7: a balancer merges each tile's two halves, then another merges them onto the belt to the hub.",
    ],
  },
  {
    level: 9,
    layout: layouts.l9,
    shape: "CpCpCpCp",
    required: 600,
    reward: "Merger",
    targetSeconds: m(11, 15),
    startableAfter: 8,
    recipe: [
      "Mix red and blue into purple, then paint full circles purple.",
      "Tiled like level 7, with a mixer in each tile. Red, blue and circle belts run along the bottom; the blue and circle lanes cross the belts above them in tunnels.",
    ],
  },
  {
    level: 10,
    layout: layouts.l10,
    shape: "ScScScSc",
    required: 800,
    reward: "Stacker",
    targetSeconds: m(14),
    startableAfter: 8,
    recipe: [
      "Mix green and blue into cyan, then paint full stars cyan.",
      "The same tile as level 9, with green, blue and star belts.",
    ],
  },
  {
    level: 11,
    layout: layouts.l11,
    shape: "CgScScCg",
    required: 1000,
    reward: "Chainable extractor",
    targetSeconds: m(20, 30),
    startableAfter: 10,
    recipe: [
      "Top half: paint full circles green, cut them, then rotate the west half clockwise and the east half counter-clockwise. Both become Cg----Cg.",
      "Bottom half: cut cyan stars, then rotate the east half clockwise and the west half counter-clockwise. Both become --ScSc--.",
      "Stack the two halves, circle half into the left (lower) input. They don't overlap, so they merge into one layer.",
      "Both stackers sit between the two cutters' outputs, so one output crosses the other line in a tunnel.",
    ],
  },
  {
    level: 12,
    layout: layouts.l12,
    shape: "CbCbCbRb:CwCwCwCw",
    required: 1000,
    reward: "Blueprints",
    targetSeconds: m(27, 30),
    startableAfter: 10,
    recipe: [
      "CuCu----: cut circles and rotate the west half (----CuCu) clockwise twice.",
      "----Cu--: rotate the east half (CuCu----) clockwise to --CuCu--, cut it again and keep the west output. Trash the other quarter.",
      "------Ru: cut squares, rotate the west half clockwise to Ru----Ru, cut again and keep the west output. Trash the rest.",
      "Stack CuCu---- with ----Cu--, then with ------Ru. Both merge into one layer: CuCuCuRu.",
      "Paint that layer blue to get CbCbCbRb. The painter colours every layer, so paint before the white goes on.",
      "Stack a white circle on top, in the right (upper) input. White is cyan + red; cyan is green + blue.",
    ],
  },
];

export const TOTAL_GOAL_SHAPES = levels.reduce((sum, l) => sum + l.required, 0);
