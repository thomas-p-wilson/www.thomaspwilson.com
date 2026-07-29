// Purely presentational: maps a cell's local temperature (0..1, see
// engine/biome.ts) to a background tint so spatial biome variation reads
// visually — distinct from, and drawn beneath, the organisms rendered on
// top of it. Nothing here feeds back into the engine.
const COLD_HUE = 205; // blue
const HOT_HUE = 20; // warm red-orange

export function biomeCellColor(temperature: number): string {
  const t = Math.min(1, Math.max(0, temperature));
  const hue = COLD_HUE + (HOT_HUE - COLD_HUE) * t;
  // Kept dark and low-saturation throughout the range so the tint reads as
  // background, not competing with organisms drawn on top of it.
  return `hsl(${Math.round(hue)} 35% ${Math.round(9 + t * 5)}%)`;
}
