import type { Task } from "../engine/tasks";
import { layouts } from "./layouts";

// Two kinds of task:
//
// - Production lines (`line`): each level's build, plus the star line. The
//   checklist shows each as a group with an item per kind of building, its
//   counts and unlocks taken from the level's plan (engine/groups.ts).
// - Single steps: upgrade purchases and one-off jobs, as stages that unlock
//   after `needs` levels are done.
//
// - Until level 3 there are no balancers, so every miner needs its own belt.
// - Upgrade purchases appear once every shape they cost can be made, and not
//   before level 2 is done: the game only shows the Upgrades button from level 3
//   (with hints on, the default).
// - Counts in braces are filled in live from the level's plan, e.g.
//   "{circle miners}" → "7 circle miners".

export const tasks: Task[] = [
  // ── Production lines ─────────────────────────────────────────────────
  {
    id: "l1-circles",
    forLevel: 1,
    obsoleteAfter: 1,
    layout: layouts["l1-circles"],
    line: { hint: "Circles straight into the hub, one belt per miner." },
    stages: [],
  },
  {
    id: "l2",
    forLevel: 2,
    obsoleteAfter: 2,
    layout: layouts.l2,
    line: { hint: "Cut circles: the west half (----CuCu) goes to the hub, the east half to trash." },
    stages: [],
  },
  {
    id: "l3-squares",
    forLevel: 3,
    obsoleteAfter: 3,
    layout: layouts["l3-squares"],
    line: { hint: "Squares straight into the hub, one belt per miner." },
    stages: [],
  },
  {
    id: "stars",
    forLevel: 3,
    layout: layouts.stars,
    // Sized to bank Processors I's 500 stars by Level 5's target.
    pace: { required: 500, byLevel: 5 },
    line: { title: "Star line (for upgrades)", hint: "500 stars for Processors I by Level 5; keep it running for Processors II." },
    stages: [],
  },
  {
    id: "l4",
    forLevel: 4,
    obsoleteAfter: 4,
    layout: layouts.l4,
    line: { hint: "Cut squares: the east half (RuRu----) goes to the hub, the west half to trash." },
    stages: [],
  },
  {
    id: "l5",
    forLevel: 5,
    obsoleteAfter: 5,
    layout: layouts.l5,
    line: { hint: "Cut circles and rotate the west half clockwise (Cu----Cu); the east half goes to trash for now." },
    stages: [],
  },
  {
    id: "l6",
    forLevel: 6,
    obsoleteAfter: 6,
    layout: layouts.l6,
    line: { hint: "Cut, rotate the west half to Cu----Cu, cut again: both outputs become Cu------." },
    stages: [],
  },
  {
    id: "l7",
    forLevel: 7,
    obsoleteAfter: 7,
    layout: layouts.l7,
    line: { hint: "Paint circles red, one painter per tile; each circle lane goes under the red belt in a tunnel." },
    stages: [],
  },
  {
    id: "l8",
    forLevel: 8,
    obsoleteAfter: 8,
    layout: layouts.l8,
    line: { hint: "Paint whole squares blue, cut, turn the west half twice; a balancer merges the halves." },
    stages: [],
  },
  {
    id: "l9",
    forLevel: 9,
    obsoleteAfter: 9,
    layout: layouts.l9,
    line: { hint: "Mix red + blue into purple and paint circles: one mixer and painter per tile." },
    stages: [],
  },
  {
    id: "l10",
    forLevel: 10,
    obsoleteAfter: 10,
    layout: layouts.l10,
    line: { hint: "Mix green + blue into cyan and paint stars: one mixer and painter per tile." },
    stages: [],
  },
  {
    id: "l11",
    forLevel: 11,
    obsoleteAfter: 11,
    layout: layouts.l11,
    line: { hint: "Green circle halves + cyan star halves, stacked into CgScScCg (see the level reference)." },
    stages: [],
  },
  {
    id: "l12",
    forLevel: 12,
    obsoleteAfter: 12,
    layout: layouts.l12,
    line: { hint: "Three parts stacked into CuCuCuRu, painted blue, white circle on top (see the level reference)." },
    stages: [],
  },

  // ── Single steps ─────────────────────────────────────────────────────
  {
    id: "belt1",
    forLevel: 4,
    stages: [{ id: "belt1", needs: 2, quick: true, upgrade: { category: "belt", tier: 1 }, text: "Buy Belt I (30 CuCuCuCu)" }],
  },
  {
    id: "free-inputs",
    forLevel: 5,
    stages: [
      {
        id: "free-inputs",
        needs: 3,
        text: "Free up hub inputs: {merge balancers} to merge the direct circle, square and star belts ({miners per belt} miners per belt)",
      },
    ],
  },
  {
    id: "miner1",
    forLevel: 5,
    stages: [{ id: "miner1", needs: 3, quick: true, upgrade: { category: "miner", tier: 1 }, text: "Buy Miner I (300 RuRuRuRu)" }],
  },
  {
    id: "proc1",
    forLevel: 6,
    stages: [
      {
        id: "proc1",
        needs: 2,
        quick: true,
        upgrade: { category: "processors", tier: 1 },
        text: "Buy Processors I (500 SuSuSuSu) once the stars have banked it",
      },
    ],
  },
  {
    id: "belt2",
    forLevel: 7,
    layout: layouts.belt2,
    stages: [
      {
        id: "belt2-line",
        needs: 4,
        text: "Swap each Level 5 trash for one of {belt2 rotators} and a belt to hub: CuCu---- → clockwise → --CuCu-- (Belt II needs 500)",
      },
      {
        id: "belt2-buy",
        needs: 4,
        quick: true,
        noLayout: true,
        upgrade: { category: "belt", tier: 2 },
        text: "Buy Belt II (≈75 CuCuCuCu + 500 --CuCu--)",
      },
    ],
  },
  {
    id: "proc2",
    forLevel: 10,
    stages: [
      {
        id: "proc2-line",
        needs: 4,
        text: "Keep the Level 4 square cutters running to 600 RuRu---- past the level (for Processors II)",
      },
      {
        id: "proc2-buy",
        needs: 4,
        quick: true,
        upgrade: { category: "processors", tier: 2 },
        text: "Buy Processors II (≈1,250 SuSuSuSu + 600 RuRu----) before the stackers go in",
      },
    ],
  },
  {
    id: "miner2",
    forLevel: 7,
    stages: [
      {
        id: "miner2-line",
        needs: 6,
        text: "Keep the Level 6 line running past the level, to 800 Cu------ in total (for Miner II)",
      },
      {
        id: "miner2-buy",
        needs: 6,
        quick: true,
        upgrade: { category: "miner", tier: 2 },
        text: "Buy Miner II (≈750 RuRuRuRu + 800 Cu------)",
      },
    ],
  },
  {
    id: "paint1",
    forLevel: 9,
    stages: [
      {
        id: "paint1",
        needs: 8,
        quick: true,
        upgrade: { category: "painting", tier: 1 },
        text: "Buy Painting I (600 RbRb----). Keep the Level 8 line running until you have it",
      },
    ],
  },
];
