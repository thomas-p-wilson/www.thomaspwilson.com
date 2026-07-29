// Builds the gene-evaluation order and resolves regulatory genes' actual
// strength from context. Static genes never depend on anything but the
// genome itself, so they can be evaluated in any order; regulatory genes can
// depend on other genes' *already-resolved* values via `dependsOn` (a real
// developmental cascade: a master regulator switching on a downstream gene),
// so evaluating them in the wrong order would read stale/undefined values.
//
// This module topologically sorts GENE_TABLE by its `dependsOn` edges once at
// module-load time and throws immediately on an unknown id or a cycle — both
// indicate a broken GENE_TABLE (a design-time bug), not a runtime condition
// anything should try to recover from.
import { GENE_TABLE } from "./genes";
import type { GeneDefinition } from "./types";

/**
 * Topologically sorts `table` by `dependsOn` edges (DFS post-order: a node is
 * only pushed once every id it depends on has already been pushed). Throws if
 * a `dependsOn` id doesn't exist in `table`, or if following edges revisits a
 * node still being visited (a cycle).
 */
export function topologicalGeneOrder(table: GeneDefinition[]): string[] {
  const byId = new Map(table.map((def) => [def.id, def] as const));
  const order: string[] = [];
  const visiting = new Set<string>();
  const done = new Set<string>();

  function visit(id: string, path: string[]): void {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Cyclic gene dependency detected: ${[...path, id].join(" -> ")}`);
    }
    const def = byId.get(id);
    if (!def) {
      throw new Error(`Gene "${path[path.length - 1] ?? "?"}" depends on unknown gene id "${id}"`);
    }
    visiting.add(id);
    for (const dep of def.dependsOn ?? []) visit(dep, [...path, id]);
    visiting.delete(id);
    done.add(id);
    order.push(id);
  }

  for (const def of table) visit(def.id, []);
  return order;
}

/**
 * Computed once at module load: every gene id from GENE_TABLE, ordered so a
 * gene's `dependsOn` targets are always resolved before the gene itself.
 * Static genes (no dependencies) can appear anywhere consistent with that
 * constraint; only the relative order among regulatory genes (and whatever
 * static genes they depend on) actually matters.
 */
export const GENE_EVALUATION_ORDER: string[] = topologicalGeneOrder(GENE_TABLE);
