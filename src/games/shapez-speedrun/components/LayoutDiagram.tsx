import { useMemo } from "react";
import { type Building, displayRows, isColor, type Layout, PORTS, parseLayout, ROTATION_DEGREES, tileColumns, traceLayout } from "../engine/layout";
import { roleKeyOf } from "../engine/plan";
import ShapeIcon from "./ShapeIcon";

const S = 32; // tile size in px
const PAD = 3;

const STYLE: Record<Building["kind"], { fill: string; stroke: string; label: string; small?: boolean }> = {
  belt: { fill: "#e2e8f0", stroke: "#94a3b8", label: "" },
  miner: { fill: "#475569", stroke: "#1e293b", label: "" },
  cutter: { fill: "#fde68a", stroke: "#b45309", label: "Cut", small: true },
  rotator: { fill: "#bae6fd", stroke: "#0369a1", label: "↻" },
  rotatorCCW: { fill: "#c7d2fe", stroke: "#4338ca", label: "↺" },
  balancer: { fill: "#e9d5ff", stroke: "#7e22ce", label: "Bal", small: true },
  painter: { fill: "#fbcfe8", stroke: "#be185d", label: "Paint", small: true },
  painterMirrored: { fill: "#fbcfe8", stroke: "#be185d", label: "Paint", small: true },
  mixer: { fill: "#d9f99d", stroke: "#4d7c0f", label: "Mix", small: true },
  stacker: { fill: "#a7f3d0", stroke: "#047857", label: "Stack", small: true },
  tunnelIn: { fill: "#d6d3d1", stroke: "#57534e", label: "Tun", small: true },
  tunnelOut: { fill: "#d6d3d1", stroke: "#57534e", label: "Tun", small: true },
  trash: { fill: "#fecdd3", stroke: "#be123c", label: "✕" },
  hub: { fill: "#cbd5e1", stroke: "#64748b", label: "Hub", small: true },
  stop: { fill: "#334155", stroke: "#334155", label: "" },
};

export const COLOR_FILL: Record<string, string> = {
  u: "#aaaaaa",
  r: "#ff666a",
  g: "#78ff66",
  b: "#66a7ff",
  y: "#fcf52a",
  p: "#dd66ff",
  c: "#00fcff",
  w: "#ffffff",
};

const COLOR_NAME: Record<string, string> = {
  u: "uncoloured",
  r: "red",
  g: "green",
  b: "blue",
  y: "yellow",
  p: "purple",
  c: "cyan",
  w: "white",
};

/** A shape icon, or a paint blob for a colour. */
function ItemIcon({ item, size, x, y }: { item: string; size: number; x: number; y: number }) {
  if (!isColor(item)) return <ShapeIcon shapeKey={item} size={size} x={x} y={y} />;
  const r = size * 0.36;
  return (
    <circle cx={x + size / 2} cy={y + size / 2} r={r} fill={COLOR_FILL[item]} stroke="#555" strokeWidth={1.5}>
      <title>{COLOR_NAME[item]}</title>
    </circle>
  );
}

interface LayoutDiagramProps {
  layout: Layout;
  /**
   * Whether a kind of building is built yet, by its checklist key ("circle miners", "red painters"; "lanes" for
   * belts). Buildings not yet built are drawn dashed, as gaps to leave. Omit to draw everything built.
   */
  isBuilt?: (key: string) => boolean;
  /** Caption with live counts filled in; defaults to the layout's own. */
  caption?: string;
}

/** A top-down sketch of one module of a build, north up. */
export default function LayoutDiagram({ layout, isBuilt, caption = layout.caption }: LayoutDiagramProps) {
  const { parsed, flow } = useMemo(() => {
    const parsed = parseLayout({ rows: displayRows(layout) });
    return { parsed, flow: traceLayout(parsed) };
  }, [layout]);
  const tiles = layout.tiled ? Array.from({ length: layout.tiled.show }, (_, n) => tileColumns(layout, n)) : [];

  const width = parsed.width * S + PAD * 2;
  const height = parsed.height * S + PAD * 2;
  const planned = parsed.buildings.map((b, i) => {
    if (!isBuilt || b.kind === "hub") return false;
    const kind = b.kind === "tunnelOut" ? "tunnelIn" : b.kind;
    const key =
      b.kind === "belt" || b.kind === "stop"
        ? "lanes"
        : roleKeyOf(kind === b.kind ? b : { ...b, kind }, flow.received[i] ?? []);
    return key ? !isBuilt(key) : false;
  });
  const anyPlanned = planned.some(Boolean);
  const labelled = (b: Building) => flow.changed.has(`${b.row},${b.col}`) && flow.carried.has(`${b.row},${b.col}`);

  return (
    <figure className="inline-block max-w-full">
      <div className="overflow-x-auto">
        <svg viewBox={`${-PAD} ${-PAD} ${width} ${height}`} width={width} height={height} role="img" aria-label="Build layout, north up" className="block">
          {Array.from({ length: parsed.height }, (_, row) =>
            Array.from({ length: parsed.width }, (_, col) => (
              <rect key={`${row},${col}`} x={col * S} y={row * S} width={S} height={S} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
            ))
          )}
          {tiles.map(([first, end], n) => (
            // Outline each repeated tile so the unit to copy is clear.
            <rect
              key={`tile${n}`}
              x={first * S + 1}
              y={1}
              width={(end - first) * S - 2}
              height={parsed.height * S - 2}
              fill={n === 0 ? "#eff6ff" : "none"}
              stroke="#93c5fd"
              strokeWidth={1.5}
              strokeDasharray={n === 0 ? undefined : "6 4"}
              rx={3}
            />
          ))}
          {parsed.buildings.map((b, i) => (
            <BuildingShape key={i} building={b} planned={planned[i]} labelled={labelled(b)} />
          ))}
          {[...flow.changed].map((at) => {
            const item = flow.carried.get(at);
            if (!item) return null;
            const [row, col] = at.split(",").map(Number);
            const b = parsed.buildings[parsed.grid[row][col]];
            const size = b.kind === "trash" ? S * 0.4 : S * 0.72;
            const offset = b.kind === "trash" ? S - size - 3 : (S - size) / 2;
            return (
              <g key={at} opacity={planned[parsed.grid[row][col]] ? 0.45 : 1}>
                <ItemIcon item={item} size={size} x={col * S + offset} y={row * S + offset} />
              </g>
            );
          })}
        </svg>
      </div>
      {(caption || anyPlanned) && (
        <figcaption className="mt-1.5 max-w-sm text-xs text-slate-500 space-y-0.5">
          {tiles.length > 0 && <span className="block">Blue box: one tile. Copy it side by side; the belts carry on into the next copy.</span>}
          {anyPlanned && <span className="block">Dashed: leave room, build later.</span>}
          {caption && <span className="block">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** Where on a tile's edge a port sits, in the building's own frame (tile at the origin). */
function edgePoint(slot: number, side: string): [number, number] {
  const x = slot * S;
  switch (side) {
    case "^":
      return [x + S / 2, 0];
    case "v":
      return [x + S / 2, S];
    case "<":
      return [x, S / 2];
    default:
      return [x + S, S / 2];
  }
}

const ANGLE: Record<string, number> = { "^": 0, ">": 90, v: 180, "<": 270 };

/** `labelled`: an item icon goes on top of this tile, so a belt skips its arrow. */
function BuildingShape({ building: b, planned, labelled }: { building: Building; planned: boolean; labelled: boolean }) {
  const style = STYLE[b.kind];
  const length = b.tiles.length;
  // Drawn in the building's own frame (rotation ^, anchor at the origin, second tile to the right),
  // then turned about the anchor's centre.
  const transform = `translate(${b.col * S} ${b.row * S}) rotate(${ROTATION_DEGREES[b.rotation]} ${S / 2} ${S / 2})`;
  const rows = b.tiles.map((t) => t.row);
  const cols = b.tiles.map((t) => t.col);
  const cx = ((Math.min(...cols) + Math.max(...cols) + 1) / 2) * S;
  const cy = ((Math.min(...rows) + Math.max(...rows) + 1) / 2) * S;
  const inset = 2.5;
  const dash = planned ? "4 3" : undefined;
  const fill = planned ? "#ffffff" : style.fill;
  const ports = PORTS[b.kind];

  return (
    <g opacity={planned ? 0.75 : 1}>
      <g transform={transform}>
        {b.kind === "stop" ? (
          <rect x={S * 0.15} y={S * 0.4} width={S * 0.7} height={S * 0.2} rx={2} fill={style.fill}>
            <title>End of the line: items back up here</title>
          </rect>
        ) : b.kind === "belt" ? (
          <>
            <rect x={inset} y={0} width={S - inset * 2} height={S} fill={fill} stroke={planned ? style.stroke : "none"} strokeDasharray={dash} />
            {!labelled && <path d={`M${S * 0.3} ${S * 0.62} L${S / 2} ${S * 0.38} L${S * 0.7} ${S * 0.62}`} fill="none" stroke="#64748b" strokeWidth={2} />}
          </>
        ) : (
          <>
            <rect
              x={inset}
              y={inset}
              width={S * length - inset * 2}
              height={S - inset * 2}
              rx={b.kind === "hub" ? 1 : 4}
              fill={fill}
              stroke={style.stroke}
              strokeWidth={1.5}
              strokeDasharray={dash}
            />
            {length === 2 && <line x1={S} y1={inset + 3} x2={S} y2={S - inset - 3} stroke={style.stroke} strokeWidth={0.75} opacity={0.5} />}
            {ports.inputs.map((p, i) => {
              // A short bar on each input side; colour inputs get a paint-coloured bar.
              const [x, y] = edgePoint(p.slot, p.side);
              const horizontal = p.side === "^" || p.side === "v";
              const half = S * 0.2;
              return (
                <line
                  key={`in${i}`}
                  x1={horizontal ? x - half : x}
                  y1={horizontal ? y : y - half}
                  x2={horizontal ? x + half : x}
                  y2={horizontal ? y : y + half}
                  stroke={p.accepts === "color" ? "#db2777" : style.stroke}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            })}
            {ports.outputs.map((p, i) => {
              // A notch pointing out of each output side.
              const [x, y] = edgePoint(p.slot, p.dir);
              return (
                <path key={`out${i}`} d={`M${-S * 0.13} 0 L0 ${-S * 0.13} L${S * 0.13} 0 Z`} transform={`translate(${x} ${y}) rotate(${ANGLE[p.dir]})`} fill={style.stroke} />
              );
            })}
          </>
        )}
      </g>
      {b.kind === "miner" && b.resource && <ItemIcon item={b.resource} size={S * 0.6} x={b.col * S + S * 0.2} y={b.row * S + S * 0.2} />}
      {style.label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={style.small ? 9.5 : 15}
          fontWeight={600}
          fill={style.stroke}
          style={{ pointerEvents: "none" }}
        >
          {style.label}
        </text>
      )}
    </g>
  );
}
