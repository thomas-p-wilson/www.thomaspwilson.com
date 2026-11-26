import { useMemo, useRef, useState } from "react";
import { layoutLineage } from "../engine/lineage";
import { decode } from "../engine/phenotype";
import type { LineageRecord } from "../engine/types";
import { organismStyle } from "./organismColor";

interface LineageTreeProps {
  records: LineageRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SPACING_X = 26;
const SPACING_Y = 44;
const NODE_RADIUS = 6;

export default function LineageTree({ records, selectedId, onSelect }: LineageTreeProps) {
  const [view, setView] = useState({ scale: 1, panX: 24, panY: 24 });
  const dragState = useRef<{ x: number; y: number } | null>(null);

  const layout = useMemo(() => layoutLineage(records), [records]);
  const colorById = useMemo(() => {
    const map = new Map<string, string>();
    for (const record of records) {
      map.set(record.id, organismStyle(decode(record.genome)).fill);
    }
    return map;
  }, [records]);

  const svgWidth = Math.max(200, (layout.width + 2) * SPACING_X);
  const svgHeight = Math.max(120, (layout.height + 2) * SPACING_Y);
  const nodesById = new Map(layout.nodes.map((n) => [n.id, n]));

  function onWheel(event: React.WheelEvent) {
    event.preventDefault();
    setView((v) => ({ ...v, scale: Math.min(3, Math.max(0.25, v.scale - event.deltaY * 0.001)) }));
  }
  function onMouseDown(event: React.MouseEvent) {
    dragState.current = { x: event.clientX, y: event.clientY };
  }
  function onMouseMove(event: React.MouseEvent) {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.x;
    const dy = event.clientY - dragState.current.y;
    dragState.current = { x: event.clientX, y: event.clientY };
    setView((v) => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }));
  }
  function endDrag() {
    dragState.current = null;
  }
  function resetView() {
    setView({ scale: 1, panX: 24, panY: 24 });
  }

  if (records.length === 0) {
    return <p className="text-sm text-slate-400">No ancestry recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Drag to pan, scroll to zoom. Click a node to inspect that organism.</span>
        <button type="button" onClick={resetView} className="px-2 py-1 rounded border border-slate-600 hover:bg-slate-700">
          Reset view
        </button>
      </div>
      <div
        className="relative h-[420px] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})`, transformOrigin: "0 0" }}
        >
          {layout.edges.map((edge) => {
            const from = nodesById.get(edge.from);
            const to = nodesById.get(edge.to);
            if (!from || !to) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={(from.x + 1) * SPACING_X}
                y1={(from.y + 1) * SPACING_Y}
                x2={(to.x + 1) * SPACING_X}
                y2={(to.y + 1) * SPACING_Y}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth={1.5}
              />
            );
          })}
          {layout.nodes.map((node) => {
            const isSelected = node.id === selectedId;
            const isDead = node.deathTick !== null;
            return (
              <g key={node.id} transform={`translate(${(node.x + 1) * SPACING_X}, ${(node.y + 1) * SPACING_Y})`}>
                <circle
                  r={isSelected ? NODE_RADIUS + 2 : NODE_RADIUS}
                  fill={colorById.get(node.id) ?? "#64748b"}
                  opacity={isDead ? 0.45 : 1}
                  stroke={isSelected ? "#facc15" : "rgba(15,23,42,0.6)"}
                  strokeWidth={isSelected ? 2 : 1}
                  className="cursor-pointer"
                  onClick={() => onSelect(node.id)}
                >
                  <title>
                    {node.id} — gen {node.generation}
                    {isDead ? " (deceased)" : ""}
                  </title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
