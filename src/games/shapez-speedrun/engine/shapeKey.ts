// Parses shapez.io "short keys" such as "CbCbCbRb:CwCwCwCw".
//
// A key is up to four layers separated by ":" (bottom layer first). Each layer
// is four quadrants in the game's clockwise order — top-right, bottom-right,
// bottom-left, top-left — and each quadrant is a two-character pair of
// sub-shape + colour, or "--" when empty.

export type SubShape = "circle" | "rect" | "star" | "windmill";
export type ShapeColor = "uncolored" | "red" | "green" | "blue" | "yellow" | "purple" | "cyan" | "white";

export interface Quadrant {
  shape: SubShape;
  color: ShapeColor;
}

/** Four quadrants in TR, BR, BL, TL order; `null` marks an empty quadrant. */
export type Layer = [Quadrant | null, Quadrant | null, Quadrant | null, Quadrant | null];

export const QUADRANT_NAMES = ["top-right", "bottom-right", "bottom-left", "top-left"] as const;

const SUB_SHAPES: Record<string, SubShape> = { C: "circle", R: "rect", S: "star", W: "windmill" };
const COLORS: Record<string, ShapeColor> = {
  u: "uncolored",
  r: "red",
  g: "green",
  b: "blue",
  y: "yellow",
  p: "purple",
  c: "cyan",
  w: "white",
};

export function parseShapeKey(key: string): Layer[] {
  const layerKeys = key.split(":");
  if (layerKeys.length < 1 || layerKeys.length > 4) {
    throw new Error(`Shape key must have 1–4 layers: "${key}"`);
  }
  return layerKeys.map((layerKey) => {
    if (layerKey.length !== 8) {
      throw new Error(`Each layer must be 8 characters: "${layerKey}"`);
    }
    const quadrants: (Quadrant | null)[] = [];
    for (let i = 0; i < 4; i++) {
      const pair = layerKey.slice(i * 2, i * 2 + 2);
      if (pair === "--") {
        quadrants.push(null);
        continue;
      }
      const shape = SUB_SHAPES[pair[0]];
      const color = COLORS[pair[1]];
      if (!shape || !color) {
        throw new Error(`Unknown quadrant "${pair}" in "${key}"`);
      }
      quadrants.push({ shape, color });
    }
    if (quadrants.every((q) => q === null)) {
      throw new Error(`Layer has no quadrants: "${layerKey}"`);
    }
    return quadrants as Layer;
  });
}

/** Plain-English description, e.g. "blue circle (top-right, bottom-right, bottom-left), blue square (top-left)". */
export function describeShapeKey(key: string): string {
  const layers = parseShapeKey(key);
  const describeLayer = (layer: Layer) => {
    const groups = new Map<string, string[]>();
    layer.forEach((q, i) => {
      if (!q) return;
      const noun = q.shape === "rect" ? "square" : q.shape;
      const label = q.color === "uncolored" ? noun : `${q.color} ${noun}`;
      groups.set(label, [...(groups.get(label) ?? []), QUADRANT_NAMES[i]]);
    });
    return [...groups.entries()]
      .map(([label, quads]) => (quads.length === 4 ? `full ${label}` : `${label} (${quads.join(", ")})`))
      .join(", ");
  };
  if (layers.length === 1) return describeLayer(layers[0]);
  return layers.map((layer, i) => `layer ${i + 1}: ${describeLayer(layer)}`).join("; ");
}
