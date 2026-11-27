// Build layouts as small text grids, one token per tile, separated by spaces.
// The direction in a token (^ > v <) is always where items come out.
//
//   ..     empty tile
//   B^     belt
//   M^C    miner on a resource patch: C R S W shapes, r g b y colours
//   C^     cutter, 2×1: input behind the anchor tile, which puts out the west half
//   R^ Q^  rotator, clockwise (R) or counter-clockwise (Q)
//   L^     balancer, 2×1: an input and an output on each tile. With one output
//          left empty it merges both inputs onto the other one.
//   P>     painter, 2×1: shape in behind the anchor, painted shape out of the
//          far tile; colour into the far tile from the left (looking along the flow)
//   N>     painter, mirrored: colour from the right instead
//   X^     mixer, 2×1: a colour behind each tile, mixed colour out of the anchor
//   S^     stacker, 2×1: lower shape behind the anchor, upper shape behind the
//          other tile, result out of the anchor
//   E^ O^  tunnel entrance and exit: items go under up to 4 tiles in between
//   T.     trash, takes items from any side
//   HH     a hub tile, takes items from any side
//   Z.     end of a belt line: items back up here (e.g. a bus past its last branch)
//   ##     another tile of the 2-tile building next to it
//
// Two-tile buildings are written at their anchor, the tile the game calls
// (0, 0). Looking along the way items come out, the second tile is to the
// right of the anchor, except for painters, where it's straight ahead.
//
// A layout can also be tileable: `tiled.head` and `tiled.tail` are fixed
// columns at either end, and `tiled.tile` is repeated between them. Diagrams
// draw `show` copies of the tile; `rows` stays a single self-contained module
// that the planner uses to work out what each machine handles.
//
// Belts don't merge: a belt tile fed from two directions is reported as a
// problem, as is a belt that runs off into nothing.
//
// Footprints, ports and operations follow the game's source
// (src/js/game/buildings/*.js, systems/item_processor.js, shape_definition.js).

export type Direction = "^" | ">" | "v" | "<";
export type BuildingKind =
  | "belt"
  | "miner"
  | "cutter"
  | "rotator"
  | "rotatorCCW"
  | "balancer"
  | "painter"
  | "painterMirrored"
  | "mixer"
  | "stacker"
  | "tunnelIn"
  | "tunnelOut"
  | "trash"
  | "hub"
  | "stop";

export interface Building {
  kind: BuildingKind;
  /** The way the building is turned, as the game stores it: where its local "up" points. */
  rotation: Direction;
  /** Anchor tile. */
  row: number;
  col: number;
  /** Tiles the building covers, in slot order (slot 0 is the anchor). */
  tiles: { row: number; col: number }[];
  /** Miners only: the item they mine, a shape key or a colour letter. */
  resource?: string;
}

export interface TiledLayout {
  head: string[];
  tile: string[];
  tail: string[];
  /** Copies of the tile a diagram shows. */
  show: number;
}

export interface Layout {
  /** One string per row of tiles; see the format above. A single module, for the numbers. */
  rows: string[];
  /** A tileable version to draw: fixed start, repeated tile, fixed end. */
  tiled?: TiledLayout;
  /** Caption under the diagram, e.g. how many copies to build side by side. */
  caption?: string;
}

export interface ParsedLayout {
  width: number;
  height: number;
  buildings: Building[];
  /** Index into `buildings` for each tile, or -1 for empty. */
  grid: number[][];
}

const KINDS: Record<string, BuildingKind> = {
  B: "belt",
  M: "miner",
  C: "cutter",
  R: "rotator",
  Q: "rotatorCCW",
  L: "balancer",
  P: "painter",
  N: "painterMirrored",
  X: "mixer",
  S: "stacker",
  E: "tunnelIn",
  O: "tunnelOut",
  T: "trash",
  H: "hub",
  Z: "stop",
};

const RESOURCES: Record<string, string> = {
  C: "CuCuCuCu",
  R: "RuRuRuRu",
  S: "SuSuSuSu",
  W: "WuWuWuWu",
  r: "r",
  g: "g",
  b: "b",
  y: "y",
};

const DIRECTIONS: Direction[] = ["^", ">", "v", "<"];

export const STEP: Record<Direction, { dr: number; dc: number }> = {
  "^": { dr: -1, dc: 0 },
  ">": { dr: 0, dc: 1 },
  v: { dr: 1, dc: 0 },
  "<": { dr: 0, dc: -1 },
};

export const ROTATION_DEGREES: Record<Direction, number> = { "^": 0, ">": 90, v: 180, "<": 270 };

/** Turns a direction clockwise by `by` (another direction, read as 0°, 90°, 180°, 270°). */
export function turn(d: Direction, by: Direction): Direction {
  return DIRECTIONS[(DIRECTIONS.indexOf(d) + DIRECTIONS.indexOf(by)) % 4];
}

function unturn(d: Direction, by: Direction): Direction {
  return DIRECTIONS[(DIRECTIONS.indexOf(d) - DIRECTIONS.indexOf(by) + 4) % 4];
}

function opposite(d: Direction): Direction {
  return turn(d, "v");
}

type Accepts = "shape" | "color" | "any";

export interface Ports {
  /** In the building's own frame (rotation ^): the tile and the side items come in through. */
  inputs: { slot: number; side: Direction; accepts: Accepts }[];
  /** The tile and the way items leave it, in the building's own frame. */
  outputs: { slot: number; dir: Direction }[];
}

const FROM_BEHIND = (slot: number, accepts: Accepts) => ({ slot, side: "v" as Direction, accepts });

export const PORTS: Record<BuildingKind, Ports> = {
  belt: { inputs: [], outputs: [] }, // handled separately: any side but the front
  miner: { inputs: [], outputs: [{ slot: 0, dir: "^" }] },
  cutter: {
    inputs: [FROM_BEHIND(0, "shape")],
    outputs: [
      { slot: 0, dir: "^" },
      { slot: 1, dir: "^" },
    ],
  },
  rotator: { inputs: [FROM_BEHIND(0, "shape")], outputs: [{ slot: 0, dir: "^" }] },
  rotatorCCW: { inputs: [FROM_BEHIND(0, "shape")], outputs: [{ slot: 0, dir: "^" }] },
  balancer: {
    inputs: [FROM_BEHIND(0, "any"), FROM_BEHIND(1, "any")],
    outputs: [
      { slot: 0, dir: "^" },
      { slot: 1, dir: "^" },
    ],
  },
  painter: {
    inputs: [
      { slot: 0, side: "<", accepts: "shape" },
      { slot: 1, side: "^", accepts: "color" },
    ],
    outputs: [{ slot: 1, dir: ">" }],
  },
  painterMirrored: {
    inputs: [
      { slot: 0, side: "<", accepts: "shape" },
      { slot: 1, side: "v", accepts: "color" },
    ],
    outputs: [{ slot: 1, dir: ">" }],
  },
  mixer: { inputs: [FROM_BEHIND(0, "color"), FROM_BEHIND(1, "color")], outputs: [{ slot: 0, dir: "^" }] },
  stacker: { inputs: [FROM_BEHIND(0, "shape"), FROM_BEHIND(1, "shape")], outputs: [{ slot: 0, dir: "^" }] },
  tunnelIn: { inputs: [FROM_BEHIND(0, "any")], outputs: [] },
  tunnelOut: { inputs: [], outputs: [{ slot: 0, dir: "^" }] },
  trash: { inputs: [], outputs: [] }, // any side
  hub: { inputs: [], outputs: [] }, // any side
  stop: { inputs: [], outputs: [] }, // any side
};

const isPainter = (kind: BuildingKind) => kind === "painter" || kind === "painterMirrored";
const TWO_TILES = new Set<BuildingKind>(["cutter", "balancer", "painter", "painterMirrored", "mixer", "stacker"]);

/** How far past a tunnel entrance its exit may be (the game's tier-1 range). */
export const TUNNEL_RANGE = 5;

const TOKEN = /^([A-Z])([\^>v<.H])([CRSWrgby])?$/;

export function parseLayout(layout: Layout): ParsedLayout {
  const cells = layout.rows.map((row) => row.trim().split(/\s+/));
  const height = cells.length;
  const width = Math.max(...cells.map((r) => r.length));
  cells.forEach((r, i) => {
    if (r.length !== width) throw new Error(`Row ${i} has ${r.length} tiles, expected ${width}`);
  });

  const grid = cells.map((r) => r.map(() => -1));
  const buildings: Building[] = [];

  cells.forEach((r, row) => {
    r.forEach((token, col) => {
      if (token === ".." || token === "##") return;
      const m = TOKEN.exec(token);
      const kind = m ? KINDS[m[1]] : undefined;
      if (!m || !kind) throw new Error(`Unknown tile "${token}" at row ${row}, col ${col}`);
      const anySide = kind === "trash" || kind === "hub" || kind === "stop";
      if (anySide !== (m[2] === "." || m[2] === "H")) throw new Error(`Bad direction in "${token}"`);
      if ((kind === "miner") !== !!m[3]) throw new Error(`Only miners take a resource: "${token}"`);

      const out: Direction = anySide ? "^" : (m[2] as Direction);
      // Painters put out to their local right, everything else to its local up.
      const rotation = isPainter(kind) ? unturn(out, ">") : out;
      const along = STEP[turn(">", rotation)];
      const size = TWO_TILES.has(kind) ? 2 : 1;
      const tiles = Array.from({ length: size }, (_, i) => ({ row: row + along.dr * i, col: col + along.dc * i }));
      const index = buildings.length;
      tiles.forEach((t, i) => {
        if (i > 0 && cells[t.row]?.[t.col] !== "##") throw new Error(`"${token}" at row ${row}, col ${col} needs ## at row ${t.row}, col ${t.col}`);
        if (grid[t.row][t.col] !== -1) throw new Error(`Overlapping buildings at row ${t.row}, col ${t.col}`);
        grid[t.row][t.col] = index;
      });
      buildings.push({ kind, rotation, row, col, tiles, resource: m[3] ? RESOURCES[m[3]] : undefined });
    });
  });

  cells.forEach((r, row) => {
    r.forEach((token, col) => {
      if (token === "##" && grid[row][col] === -1) throw new Error(`Stray ## at row ${row}, col ${col}`);
    });
  });

  return { width, height, buildings, grid };
}

/** Splits a row into tokens. */
const tokens = (row: string) => row.trim().split(/\s+/).filter(Boolean);

/** The rows to draw: the tiled version with `copies` tiles if there is one, else the module. */
export function displayRows(layout: Layout, copies = layout.tiled?.show ?? 1): string[] {
  const t = layout.tiled;
  if (!t) return layout.rows;
  if (t.head.length !== t.tile.length || t.tail.length !== t.tile.length) throw new Error("Tiled layout parts need the same number of rows");
  return t.tile.map((row, i) => [...tokens(t.head[i]), ...Array.from({ length: copies }, () => tokens(row)).flat(), ...tokens(t.tail[i])].join(" "));
}

/** Columns the tile occupies in `displayRows(layout, copies)`: [first, end) of copy `n`. */
export function tileColumns(layout: Layout, n: number): [number, number] {
  const t = layout.tiled;
  if (!t) return [0, 0];
  const head = tokens(t.head[0]).length;
  const width = tokens(t.tile[0]).length;
  return [head + n * width, head + (n + 1) * width];
}

// ── Items: shape keys (2 characters per quadrant, order TR BR BL TL, layers
// split by ":") and colours as one letter ──

export const isColor = (item: string) => item.length === 1;

// The game mixes colours by OR-ing red, green and blue bits (colors.js).
const COLOR_BITS = "urgybpcw";

export function mixColors(a: string, b: string): string {
  return COLOR_BITS[COLOR_BITS.indexOf(a) | COLOR_BITS.indexOf(b)];
}

const layersOf = (key: string) => key.split(":").map((layer) => layer.match(/.{2}/g) ?? []);
const keyOf = (layers: string[][]) =>
  layers
    .filter((q) => q.some((x) => x !== "--"))
    .map((q) => q.join(""))
    .join(":");

const mapLayers = (key: string, fn: (quadrants: string[]) => string[]) => keyOf(layersOf(key).map(fn));

/** The cutter's two outputs: slot 0 (anchor) gets the west half, slot 1 the east half. */
export function cutHalves(key: string): [west: string, east: string] {
  return [
    mapLayers(key, (q) => q.map((x, i) => (i === 2 || i === 3 ? x : "--"))),
    mapLayers(key, (q) => q.map((x, i) => (i === 0 || i === 1 ? x : "--"))),
  ];
}

export function rotateClockwise(key: string): string {
  return mapLayers(key, (q) => [q[3], q[0], q[1], q[2]]);
}

export function rotateCounterClockwise(key: string): string {
  return mapLayers(key, (q) => [q[1], q[2], q[3], q[0]]);
}

/** Paints every quadrant of every layer, like the game's painter. */
export function paint(key: string, color: string): string {
  return mapLayers(key, (q) => q.map((x) => (x === "--" ? x : x[0] + color)));
}

/** Drops the upper shape onto the lower one as far as it goes without overlapping (cloneAndStackWith). */
export function stack(lower: string, upper: string): string {
  const bottom = layersOf(lower);
  const top = layersOf(upper);
  const filled = (layers: string[][], layer: number, quad: number) => !!layers[layer]?.[quad] && layers[layer][quad] !== "--";
  const gaps = [0, 1, 2, 3].map((quad) => {
    let highest = -1;
    bottom.forEach((_, l) => {
      if (filled(bottom, l, quad)) highest = l;
    });
    let lowest = 4;
    for (let l = top.length - 1; l >= 0; l--) if (filled(top, l, quad)) lowest = l;
    return lowest - highest;
  });
  const mergeAt = Math.max(1 - Math.min(...gaps), 0);
  const merged = bottom.map((q) => [...q]);
  while (merged.length < mergeAt + top.length) merged.push(["--", "--", "--", "--"]);
  top.forEach((q, l) => {
    q.forEach((x, quad) => {
      if (x !== "--") merged[mergeAt + l][quad] = x;
    });
  });
  return keyOf(merged.slice(0, 4));
}

// ── Following items through a layout ──

export interface Flow {
  /** Items delivered into the hub. */
  delivered: string[];
  /** Items thrown away. */
  trashed: string[];
  /** Item on each tile that carries one, keyed "row,col". */
  carried: Map<string, string>;
  /** Tiles that receive a machine's output: where an item is worth labelling. */
  changed: Set<string>;
  /** Places where items get stuck: off the grid, into an empty tile or a building's wrong side. */
  problems: string[];
  /** Every connection items use: building `from`'s output slot into building `to`'s input (0 for belts, hub, trash). */
  links: { from: number; slot: number; to: number; input: number }[];
  /** Items each building received, per input (by index into `buildings`). */
  received: Set<string>[][];
}

/** Sends each miner's resource through the layout, building by building. */
export function traceLayout(parsed: ParsedLayout): Flow {
  const received = parsed.buildings.map((b) => PORTS[b.kind].inputs.map(() => new Set<string>()));
  const flow: Flow = { delivered: [], trashed: [], carried: new Map(), changed: new Set(), problems: [], links: [], received };
  type Item = { row: number; col: number; moving: Direction; item: string; optional: boolean; from: number; slot: number };
  const queue: Item[] = [];
  const seen = new Set<string>();
  const linked = new Set<string>();
  /** Directions each belt has been fed from. */
  const beltFeeds = new Map<number, Set<Direction>>();
  const link = (from: number, slot: number, to: number, input: number) => {
    const key = `${from}:${slot}>${to}:${input}`;
    if (linked.has(key)) return;
    linked.add(key);
    flow.links.push({ from, slot, to, input });
  };

  const send = (b: Building, slot: number, dir: Direction, item: string, label: boolean) => {
    const tile = b.tiles[slot];
    const moving = turn(dir, b.rotation);
    const next = { row: tile.row + STEP[moving].dr, col: tile.col + STEP[moving].dc };
    if (label) flow.changed.add(`${next.row},${next.col}`);
    queue.push({ ...next, moving, item, optional: b.kind === "balancer", from: parsed.buildings.indexOf(b), slot });
  };

  for (const b of parsed.buildings) {
    if (b.kind === "miner" && b.resource) send(b, 0, "^", b.resource, false);
  }

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const { row, col, moving, item, optional, from, slot: fromSlot } = next;
    const where = `row ${row}, col ${col}`;
    const visit = `${row},${col},${moving},${item},${from}:${fromSlot}`;
    if (seen.has(visit)) continue;
    seen.add(visit);

    const index = parsed.grid[row]?.[col];
    if (index === undefined || index === -1) {
      // A balancer's spare output may be left empty: it holds one item and sends the rest out the other side.
      if (!optional) flow.problems.push(`${item} runs into nothing at ${where}`);
      continue;
    }
    const b = parsed.buildings[index];
    const key = `${row},${col}`;

    if (b.kind === "hub") {
      link(from, fromSlot, index, 0);
      flow.delivered.push(item);
      continue;
    }
    if (b.kind === "stop") continue;
    if (b.kind === "trash") {
      link(from, fromSlot, index, 0);
      flow.trashed.push(item);
      flow.carried.set(key, item);
      continue;
    }
    if (b.kind === "belt") {
      if (moving === opposite(b.rotation)) {
        flow.problems.push(`${item} hits a belt head-on at ${where}`);
        continue;
      }
      link(from, fromSlot, index, 0);
      const sides = beltFeeds.get(index) ?? new Set<Direction>();
      sides.add(moving);
      beltFeeds.set(index, sides);
      if (sides.size === 2) flow.problems.push(`Belt at ${where} is fed from two directions; belts don't merge`);
      flow.carried.set(key, item);
      queue.push({ row: row + STEP[b.rotation].dr, col: col + STEP[b.rotation].dc, moving: b.rotation, item, optional: false, from: index, slot: 0 });
      continue;
    }

    const slot = b.tiles.findIndex((t) => t.row === row && t.col === col);
    const side = unturn(opposite(moving), b.rotation);
    const input = PORTS[b.kind].inputs.findIndex((p) => p.slot === slot && p.side === side);
    if (input === -1) {
      flow.problems.push(`${item} enters the ${b.kind} at ${where} from a side with no input`);
      continue;
    }
    const accepts = PORTS[b.kind].inputs[input].accepts;
    if (accepts !== "any" && (accepts === "color") !== isColor(item)) {
      flow.problems.push(`${item} goes into the ${b.kind}'s ${accepts} input at ${where}`);
      continue;
    }
    link(from, fromSlot, index, input);
    const inbox = received[index];
    if (inbox[input].has(item)) continue;
    inbox[input].add(item);
    const other = inbox[1 - input] ?? new Set<string>();

    switch (b.kind) {
      case "cutter": {
        const [west, east] = cutHalves(item);
        if (west) send(b, 0, "^", west, true);
        if (east) send(b, 1, "^", east, true);
        break;
      }
      case "rotator":
        send(b, 0, "^", rotateClockwise(item), true);
        break;
      case "rotatorCCW":
        send(b, 0, "^", rotateCounterClockwise(item), true);
        break;
      case "balancer":
        send(b, 0, "^", item, false);
        send(b, 1, "^", item, false);
        break;
      case "painter":
      case "painterMirrored":
        for (const o of other) send(b, 1, ">", input === 0 ? paint(item, o) : paint(o, item), true);
        break;
      case "mixer":
        for (const o of other) send(b, 0, "^", mixColors(item, o), true);
        break;
      case "stacker":
        for (const o of other) send(b, 0, "^", input === 0 ? stack(item, o) : stack(o, item), true);
        break;
      case "tunnelIn": {
        const exit = Array.from({ length: TUNNEL_RANGE }, (_, i) => i + 1)
          .map((d) => parsed.grid[row + STEP[b.rotation].dr * d]?.[col + STEP[b.rotation].dc * d])
          .map((i) => (i === undefined || i === -1 ? undefined : parsed.buildings[i]))
          .find((t) => t?.kind === "tunnelOut" && t.rotation === b.rotation);
        if (exit) {
          link(index, 0, parsed.buildings.indexOf(exit), 0);
          send(exit, 0, "^", item, false);
        }
        else flow.problems.push(`No tunnel exit within ${TUNNEL_RANGE} tiles of ${where}`);
        break;
      }
      default:
        flow.problems.push(`${item} runs into a ${b.kind} at ${where}`);
    }
  }

  return flow;
}
