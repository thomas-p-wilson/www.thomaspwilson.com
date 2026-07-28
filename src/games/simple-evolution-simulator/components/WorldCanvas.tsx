import { useEffect, useMemo, useRef } from "react";
import type { Organism } from "../engine/types";
import { organismStyle } from "./organismColor";

interface WorldCanvasProps {
  organisms: Organism[];
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  cellSize?: number;
}

const GRID_LINE_COLOR = "rgba(148, 163, 184, 0.12)";
const BACKGROUND_COLOR = "#0b1120";

export default function WorldCanvas({ organisms, width, height, selectedId, onSelect, cellSize = 14 }: WorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // O(1) lookup from grid cell to organism, rebuilt whenever the population
  // snapshot changes (cheap: population is bounded by grid size).
  const byCell = useMemo(() => {
    const map = new Map<string, Organism>();
    for (const organism of organisms) map.set(`${organism.x},${organism.y}`, organism);
    return map;
  }, [organisms]);

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

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

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

    for (const organism of organisms) {
      const style = organismStyle(organism.phenotype);
      const cx = organism.x * cellSize + cellSize / 2;
      const cy = organism.y * cellSize + cellSize / 2;
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
  }, [organisms, width, height, cellSize, selectedId]);

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
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="rounded-lg cursor-pointer max-w-full"
      role="img"
      aria-label="2D world grid of evolving organisms"
    />
  );
}
