import { Dna, GitBranch, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GENE_TABLE } from "../engine/genes";
import { effectiveTraitValue } from "../engine/phenotype";
import type { LineageRecord, Organism, TraitId } from "../engine/types";
import { organismStyle } from "./organismColor";

interface OrganismInspectorProps {
  organism: Organism | null;
  record: LineageRecord | undefined;
  /** Organism id -> resolved regulatory trait values; used to show how this
   * organism's regulatory genes are currently expressing given its colony
   * context. */
  cellTraits: Map<string, Partial<Record<TraitId, number>>>;
  /** This organism's current colony size (1 = solo, no compatible bonded
   * neighbor right now) — see engine/simulation.ts's getColonySize(). */
  colonySize: number;
  onOpenGenome: (focusBaseIndex?: number) => void;
  onOpenLineage: () => void;
  onSelectParent: (id: string) => void;
}

const GENE_LABELS = new Map(GENE_TABLE.map((g) => [g.id, g.label] as const));
const GENE_KIND = new Map(GENE_TABLE.map((g) => [g.id, g.kind] as const));
const REGULATORY_TRAITS = GENE_TABLE.filter((g) => g.kind === "regulatory").map((g) => ({ trait: g.trait, label: g.label }));

export default function OrganismInspector({
  organism, record, cellTraits, colonySize, onOpenGenome, onOpenLineage, onSelectParent,
}: OrganismInspectorProps) {
  if (!organism && !record) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center text-slate-400 py-10">
        <MousePointerClick className="w-6 h-6" />
        <p className="text-sm">Click an organism in the world, or a node in the lineage tree, to inspect it.</p>
      </div>
    );
  }

  const phenotype = organism?.phenotype;
  const style = phenotype ? organismStyle(phenotype) : null;
  const parentId = organism?.parentIds[0] ?? record?.parentIds[0];

  // This organism's currently-resolved regulatory trait values (falling back
  // to the static, context-free baseline for any trait the simulation hasn't
  // cached yet — e.g. right after this component mounts) — a direct read of
  // how deeply embedded in a colony (if any) this organism currently is.
  const regulatoryExpression = organism
    ? REGULATORY_TRAITS.map(({ trait, label }) => ({
        trait,
        label,
        value: effectiveTraitValue(organism.phenotype, trait, cellTraits.get(organism.id)),
      }))
    : [];

  return (
    <div className="space-y-4 text-slate-200">
      <div className="flex items-center gap-3">
        {style && <span className="w-4 h-4 rounded-full shrink-0" style={{ background: style.fill }} />}
        <div>
          <div className="font-mono text-sm">{(organism ?? record)!.id}</div>
          <div className="text-xs text-slate-400">
            Generation {(organism ?? record)!.generation}
            {!organism && " · deceased"}
          </div>
        </div>
      </div>

      {organism ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5">
            <div className="text-slate-400">Energy</div>
            <div className="tabular-nums">{organism.energy.toFixed(1)}</div>
          </div>
          <div className="rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5">
            <div className="text-slate-400">Age</div>
            <div className="tabular-nums">{organism.age}</div>
          </div>
          <div className="rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5">
            <div className="text-slate-400">Position</div>
            <div className="tabular-nums">
              ({organism.x}, {organism.y})
            </div>
          </div>
          <div className="rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5">
            <div className="text-slate-400">Genome length</div>
            <div className="tabular-nums">{organism.genome.length} bp</div>
          </div>
          <div className="rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5 col-span-2">
            <div className="text-slate-400">Colony</div>
            <div className="tabular-nums">
              {colonySize} {colonySize === 1 ? "(solo)" : "(bonded colony)"}
            </div>
          </div>
        </div>
      ) : (
        record && (
          <p className="text-xs text-slate-400">
            Died at tick {record.deathTick} &middot; genome was {record.genome.length} bp long.
          </p>
        )
      )}

      {parentId && (
        <button
          type="button"
          onClick={() => onSelectParent(parentId)}
          className="text-xs text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
        >
          View parent ({parentId})
        </button>
      )}

      {phenotype && (
        <div>
          <div className="text-xs text-slate-400 mb-1.5">
            Active genes ({phenotype.activeGeneCount}/{GENE_TABLE.length}) &middot; click one to jump to it in the genome
          </div>
          <ul className="space-y-1.5">
            {phenotype.genes.map((gene) => (
              <li key={gene.geneId}>
                <button
                  type="button"
                  onClick={() => onOpenGenome(gene.windowStart)}
                  className="w-full flex items-center gap-2 text-xs hover:bg-slate-800/60 rounded px-1 py-0.5 -mx-1"
                >
                  <span
                    className={cn(
                      "w-36 shrink-0 text-left flex items-center gap-1",
                      gene.active ? "text-emerald-300 font-medium" : "text-slate-500",
                    )}
                  >
                    {GENE_LABELS.get(gene.geneId)}
                    {GENE_KIND.get(gene.geneId) === "regulatory" && (
                      <span
                        className="text-[9px] uppercase tracking-wide text-indigo-300/80"
                        title="Regulatory: re-evaluated per cell from context (e.g. neighbor-in-body density), not decoded once from the genome"
                      >
                        ctx
                      </span>
                    )}
                  </span>
                  <span className="flex-1 h-1.5 rounded bg-slate-700 overflow-hidden">
                    <span
                      className={cn("block h-full", gene.active ? "bg-emerald-400" : "bg-slate-500")}
                      style={{ width: `${Math.round(gene.matchStrength * 100)}%` }}
                    />
                  </span>
                  <span className="w-10 text-right tabular-nums text-slate-400">{Math.round(gene.matchStrength * 100)}%</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Match % is always the raw genome motif match; "active" for a regulatory ("ctx") gene reflects a solo
            organism outside any colony — see "Regulatory expression" below for this organism's actual current value.
          </p>
        </div>
      )}

      {regulatoryExpression.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 mb-1.5">
            Regulatory expression (driven by colony-neighbor density, not just genome)
          </div>
          <ul className="space-y-1.5">
            {regulatoryExpression.map(({ trait, label, value }) => (
              <li key={trait} className="text-xs flex items-center justify-between rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5">
                <span className="text-slate-300">{label}</span>
                <span className="tabular-nums text-slate-400">{value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <Button onClick={() => onOpenGenome()} variant="outline" size="sm" className="justify-start gap-2">
          <Dna className="w-4 h-4" /> View full genome
        </Button>
        <Button onClick={onOpenLineage} variant="outline" size="sm" className="justify-start gap-2">
          <GitBranch className="w-4 h-4" /> View lineage
        </Button>
      </div>
    </div>
  );
}
