import { useEffect, useMemo, useRef, useState } from "react";
import { preferredTemperature } from "../engine/organism";
import { energyCapFor, maxAgeFor } from "../engine/simulation";
import type { Organism, TraitId } from "../engine/types";
import { biomeCellColor } from "./biomeColor";
import { cellStyle, type OrganismColorMode } from "./organismColor";

interface WorldCanvasProps {
  organisms: Organism[];
  /** Organism id -> that organism's resolved regulatory trait values; see
   * engine/simulation.ts's getCellTraits(). */
  cellTraits: Map<string, Partial<Record<TraitId, number>>>;
  /** What organism fill color encodes — see organismColor.ts's
   * OrganismColorMode. */
  colorMode: OrganismColorMode;
  /** This tick's bonded (compatible-and-adjacent) organism id pairs — see
   * engine/simulation.ts's getColonyBonds(). Drawn as connecting lines so
   * colony membership reads visually. */
  bonds: Array<[string, string]>;
  /** Grid cell -> fixed offset from `baseTemperature` (see
   * engine/biome.ts's `SimulationState.biomeOffset`), or null before a
   * simulation exists. Combined with `baseTemperature` to tint the
   * background per cell so spatial biome variation reads visually. */
  biomeOffset: Float32Array | null;
  /** The world's live baseline temperature (see engine's EnvironmentConfig) —
   * combined with `biomeOffset` per cell, rather than baked into it, so the
   * live temperature control still shifts every cell uniformly. */
  baseTemperature: number;
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** This organism's 0..1 value for `colorMode`, normalized against that
 * organism's own niche/cap/lifespan (see engine/organism.ts's
 * preferredTemperature, engine/simulation.ts's energyCapFor/maxAgeFor) so a
 * mode's meaning doesn't drift as the population changes. Unused (and not
 * called) when colorMode is "phenotype". */
function metricValueFor(organism: Organism, colorMode: OrganismColorMode): number {
  switch (colorMode) {
    case "temperature":
      return preferredTemperature(organism);
    case "energy":
      return clamp01(organism.energy / energyCapFor(organism));
    case "age":
      return clamp01(organism.age / maxAgeFor(organism));
    case "phenotype":
      return 0;
  }
}

const GRID_LINE_COLOR = "rgba(148, 163, 184, 0.12)";
const BACKGROUND_COLOR = "#0b1120";
const BOND_LINE_COLOR = "rgba(250, 204, 21, 0.4)";
// The cell's pixel size is derived from the container's available space so
// the grid always fills its card, clamped so a small world doesn't render
// as giant blobs and a huge one doesn't shrink to specks.
const MIN_CELL_SIZE = 6;
const MAX_CELL_SIZE = 28;

export default function WorldCanvas({
  organisms, cellTraits, colorMode, bonds, biomeOffset, baseTemperature, width, height, selectedId, onSelect,
}: WorldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // O(1) lookups, rebuilt whenever the population snapshot changes (cheap:
  // population is bounded by grid size).
  const byCell = useMemo(() => new Map(organisms.map((o) => [`${o.x},${o.y}`, o] as const)), [organisms]);
  const byId = useMemo(() => new Map(organisms.map((o) => [o.id, o] as const)), [organisms]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setContainerSize({ width: w, height: h });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const cellSize = useMemo(() => {
    if (!containerSize.width || !containerSize.height) return MIN_CELL_SIZE;
    const fit = Math.min(containerSize.width / width, containerSize.height / height);
    return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, Math.floor(fit)));
  }, [containerSize, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = width * cellSize;
    const cssHeight = height * cellSize;
    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (biomeOffset) {
      for (let gy = 0; gy < height; gy++) {
        for (let gx = 0; gx < width; gx++) {
          const temperature = clamp01(baseTemperature + biomeOffset[gy * width + gx]);
          ctx.fillStyle = biomeCellColor(temperature);
          ctx.fillRect(gx * cellSize, gy * cellSize, cellSize, cellSize);
        }
      }
    } else {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, cssWidth, cssHeight);
    }

    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = 0; gx <= width; gx++) {
      ctx.moveTo(gx * cellSize + 0.5, 0);
      ctx.lineTo(gx * cellSize + 0.5, cssHeight);
    }
    for (let gy = 0; gy <= height; gy++) {
      ctx.moveTo(0, gy * cellSize + 0.5);
      ctx.lineTo(cssWidth, gy * cellSize + 0.5);
    }
    ctx.stroke();

    // Bond lines drawn first so organism circles sit on top of them. Only
    // straight (non-wrapped) adjacency is drawn — a bond across the world's
    // toroidal seam is real (colonies can and do form across the wrap) but
    // would draw a line clear across the canvas, which reads as noise rather
    // than structure; skipping it is a rendering simplification only, the
    // bond itself still counts for colony size/regulatory context/movement.
    ctx.strokeStyle = BOND_LINE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const [aId, bId] of bonds) {
      const a = byId.get(aId);
      const b = byId.get(bId);
      if (!a || !b) continue;
      if (Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1) continue;
      ctx.moveTo(a.x * cellSize + cellSize / 2, a.y * cellSize + cellSize / 2);
      ctx.lineTo(b.x * cellSize + cellSize / 2, b.y * cellSize + cellSize / 2);
    }
    ctx.stroke();

    for (const organism of organisms) {
      const cx = organism.x * cellSize + cellSize / 2;
      const cy = organism.y * cellSize + cellSize / 2;
      const style = cellStyle(organism.phenotype, cellTraits.get(organism.id), colorMode, metricValueFor(organism, colorMode));
      const radius = (cellSize / 2 - 1) * style.radiusFactor;

      ctx.beginPath();
      ctx.fillStyle = style.fill;
      ctx.arc(cx, cy, Math.max(1.5, radius), 0, Math.PI * 2);
      ctx.fill();

      if (style.ring) {
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = style.ring;
        ctx.stroke();
      }

      if (organism.id === selectedId) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#facc15";
        ctx.arc(cx, cy, Math.max(1.5, radius) + 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [organisms, cellTraits, colorMode, bonds, biomeOffset, baseTemperature, byId, width, height, cellSize, selectedId]);

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const gx = Math.floor(((event.clientX - rect.left) / rect.width) * width);
    const gy = Math.floor(((event.clientY - rect.top) / rect.height) * height);
    const organism = byCell.get(`${gx},${gy}`);
    onSelect(organism ? organism.id : null);
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="rounded-lg cursor-pointer max-w-full"
        role="img"
        aria-label="2D world grid of evolving organisms"
      />
    </div>
  );
}
