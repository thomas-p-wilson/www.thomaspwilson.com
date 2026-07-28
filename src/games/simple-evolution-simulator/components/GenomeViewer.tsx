import { useMemo, useState } from "react";
import { describeRegion } from "../engine/phenotype";
import type { Genome } from "../engine/types";
import { cn } from "@/lib/utils";

interface GenomeViewerProps {
  genome: Genome;
  /** Optional base-pair index to highlight/scroll to on mount (e.g. a gene's best-match window). */
  focusBaseIndex?: number;
}

const ZOOM_LEVELS = [30, 90, 240, 600];

const BASE_COLORS: Record<string, string> = {
  A: "bg-emerald-500/80 text-emerald-50",
  C: "bg-sky-500/80 text-sky-50",
  G: "bg-amber-500/80 text-amber-50",
  U: "bg-rose-500/80 text-rose-50",
};

export default function GenomeViewer({ genome, focusBaseIndex }: GenomeViewerProps) {
  const [zoomIndex, setZoomIndex] = useState(1);
  const visibleCount = Math.min(ZOOM_LEVELS[zoomIndex], genome.length || 1);
  const maxStart = Math.max(0, genome.length - visibleCount);
  const [viewStart, setViewStart] = useState(() => clampFocus(focusBaseIndex, genome.length, visibleCount));
  const [selectedBase, setSelectedBase] = useState<number | null>(focusBaseIndex ?? null);

  const clampedStart = Math.min(viewStart, maxStart);
  const visibleBases = genome.slice(clampedStart, clampedStart + visibleCount);

  const matches = useMemo(() => {
    if (selectedBase === null || genome.length === 0) return [];
    return describeRegion(genome, selectedBase);
  }, [genome, selectedBase]);

  function zoomOut() {
    setZoomIndex((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1));
  }
  function zoomIn() {
    setZoomIndex((z) => Math.max(0, z - 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          {genome.length.toLocaleString()} bases &middot; showing {clampedStart.toLocaleString()}–
          {(clampedStart + visibleBases.length).toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomIndex === 0}
            className="px-2 py-1 rounded border border-slate-600 text-slate-200 disabled:opacity-30 hover:bg-slate-700"
          >
            Zoom in
          </button>
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="px-2 py-1 rounded border border-slate-600 text-slate-200 disabled:opacity-30 hover:bg-slate-700"
          >
            Zoom out
          </button>
        </div>
      </div>

      {/* Minimap: whole-genome overview with the current viewport highlighted. */}
      <div className="relative h-3 rounded bg-slate-800 overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-indigo-500/60"
          style={{
            left: `${genome.length ? (clampedStart / genome.length) * 100 : 0}%`,
            width: `${genome.length ? (visibleBases.length / genome.length) * 100 : 100}%`,
          }}
        />
      </div>

      {/* Pan control. This is the "scroll" affordance; only the visible slice is ever rendered as DOM. */}
      <input
        type="range"
        min={0}
        max={maxStart}
        value={clampedStart}
        onChange={(e) => setViewStart(Number(e.target.value))}
        className="w-full accent-indigo-500"
        aria-label="Scroll through genome"
      />

      {/* The virtualized strip itself: only `visibleCount` bases ever exist as DOM nodes. */}
      <div className="flex flex-wrap gap-[2px] font-mono text-[11px] leading-none select-none max-h-40 overflow-y-auto p-2 rounded-lg bg-slate-900 border border-slate-700">
        {[...visibleBases].map((base, i) => {
          const globalIndex = clampedStart + i;
          const codonIndex = Math.floor(globalIndex / 3);
          const isSelected = selectedBase === globalIndex;
          return (
            <button
              key={globalIndex}
              type="button"
              onClick={() => setSelectedBase(globalIndex)}
              title={`base ${globalIndex}`}
              className={cn(
                "w-4 h-5 flex items-center justify-center rounded-sm transition-transform",
                BASE_COLORS[base] ?? "bg-slate-600 text-slate-100",
                codonIndex % 2 === 0 ? "opacity-100" : "opacity-70",
                isSelected && "ring-2 ring-yellow-300 scale-110 opacity-100",
              )}
            >
              {base}
            </button>
          );
        })}
      </div>

      {selectedBase !== null && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 space-y-2">
          <p className="text-xs text-slate-400">
            Gene motif match strength for a window starting at base {selectedBase}:
          </p>
          <ul className="space-y-1.5">
            {matches.map((match) => (
              <li key={match.geneId} className="flex items-center gap-2 text-xs">
                <span className={cn("w-32 shrink-0", match.active ? "text-emerald-300 font-medium" : "text-slate-400")}>
                  {match.label}
                </span>
                <span className="flex-1 h-1.5 rounded bg-slate-700 overflow-hidden">
                  <span
                    className={cn("block h-full", match.active ? "bg-emerald-400" : "bg-slate-500")}
                    style={{ width: `${Math.round(match.strength * 100)}%` }}
                  />
                </span>
                <span className="w-10 text-right tabular-nums text-slate-400">{Math.round(match.strength * 100)}%</span>
                {match.active && (
                  <span className="text-[10px] uppercase tracking-wide text-emerald-400 font-semibold">active</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function clampFocus(focusBaseIndex: number | undefined, genomeLength: number, visibleCount: number): number {
  if (focusBaseIndex === undefined) return 0;
  const maxStart = Math.max(0, genomeLength - visibleCount);
  return Math.min(maxStart, Math.max(0, focusBaseIndex - Math.floor(visibleCount / 2)));
}
