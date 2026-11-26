// Builds an ancestry tree (a forest, technically — one root per initial
// seed organism) from the flat archive of LineageRecords the simulation
// keeps, and computes a simple, deterministic 2D layout for it so the
// LineageTree component can just draw pre-computed coordinates rather than
// re-deriving tree structure inside React.
import type { LineageRecord } from "./types";

export interface LineageNode {
  id: string;
  generation: number;
  birthTick: number;
  deathTick: number | null;
  children: LineageNode[];
}

/** Builds the ancestry forest from parent pointers. Pure and side-effect-free. */
export function buildLineageForest(records: LineageRecord[]): LineageNode[] {
  const byId = new Map<string, LineageNode>();
  for (const record of records) {
    byId.set(record.id, {
      id: record.id,
      generation: record.generation,
      birthTick: record.birthTick,
      deathTick: record.deathTick,
      children: [],
    });
  }

  const roots: LineageNode[] = [];
  for (const record of records) {
    const node = byId.get(record.id);
    if (!node) continue;
    const parentId = record.parentIds[0];
    const parentNode = parentId ? byId.get(parentId) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Walks parent pointers from `id` back to its root, oldest ancestor first. */
export function ancestorPath(records: LineageRecord[], id: string): LineageRecord[] {
  const byId = new Map(records.map((r) => [r.id, r] as const));
  const path: LineageRecord[] = [];
  let current = byId.get(id);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    const parentId = current.parentIds[0];
    current = parentId ? byId.get(parentId) : undefined;
  }
  return path;
}

export interface LineageLayoutNode {
  id: string;
  x: number;
  y: number;
  generation: number;
  deathTick: number | null;
}

export interface LineageLayoutEdge {
  from: string;
  to: string;
}

export interface LineageLayout {
  nodes: LineageLayoutNode[];
  edges: LineageLayoutEdge[];
  /** Layout extent in "slot" units — x in [0, width], y in [0, height]. */
  width: number;
  height: number;
}

/**
 * A minimal Reingold–Tilford-style layout: leaves get sequential x slots in
 * traversal order, and each internal node is centered over its children.
 * y is simply generation number. Kept as plain data (no React, no SVG) so it
 * can be unit tested directly.
 */
export function layoutLineage(records: LineageRecord[]): LineageLayout {
  const roots = buildLineageForest(records);
  const nodes: LineageLayoutNode[] = [];
  const edges: LineageLayoutEdge[] = [];
  let nextSlot = 0;

  function visit(node: LineageNode, parentId?: string): number {
    let x: number;
    if (node.children.length === 0) {
      x = nextSlot++;
    } else {
      const childXs = node.children.map((child) => visit(child, node.id));
      x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    }
    nodes.push({ id: node.id, x, y: node.generation, generation: node.generation, deathTick: node.deathTick });
    if (parentId) edges.push({ from: parentId, to: node.id });
    return x;
  }

  for (const root of roots) visit(root);

  const width = nodes.reduce((max, n) => Math.max(max, n.x), 0);
  const height = nodes.reduce((max, n) => Math.max(max, n.y), 0);
  return { nodes, edges, width, height };
}
