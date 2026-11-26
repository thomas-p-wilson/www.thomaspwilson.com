// Purely presentational: maps a decoded Phenotype to a color/size so the
// world view can render organisms as colored cells rather than skeuomorphic
// sprites. Nothing here feeds back into the engine.
import type { Phenotype, TraitId } from "../engine/types";
import { COLD_HUE, HOT_HUE } from "./biomeColor";

export interface OrganismStyle {
  fill: string;
  ring: string | null;
  radiusFactor: number;
}

/** "phenotype" is the original hue-from-traits encoding; the rest color by a
 * live per-tick metric instead, each normalized to 0..1 against that
 * organism's *own* niche/cap/lifespan (see callers of `metricColor`) rather
 * than a world-wide min/max, so a mode's meaning doesn't drift as the
 * population changes. Full replacement of the phenotype hue while active,
 * not a blend — matches how biome tint and organism fill are already two
 * independent, non-blended color sources drawn in separate passes. */
export type OrganismColorMode = "phenotype" | "temperature" | "energy" | "age";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Color ramp for a single 0..1 metric value under a given non-phenotype
 * mode. `temperature` reuses biomeColor.ts's exact cold/hot hues so an
 * organism's color is directly comparable to the biome tint it's standing
 * on. `energy`/`age` both run green→red, but in opposite directions: full
 * energy and a newborn age both read as "healthy" (green), so energy ramps
 * green-at-1/red-at-0 while age ramps green-at-0/red-at-1. */
export function metricColor(mode: Exclude<OrganismColorMode, "phenotype">, value: number): string {
  const t = clamp01(value);
  if (mode === "temperature") {
    const hue = COLD_HUE + (HOT_HUE - COLD_HUE) * t;
    return `hsl(${Math.round(hue)} 75% 55%)`;
  }
  const GREEN_HUE = 130;
  const hue = mode === "energy" ? GREEN_HUE * t : GREEN_HUE * (1 - t);
  return `hsl(${Math.round(hue)} 75% 50%)`;
}

export function organismStyle(phenotype: Phenotype): OrganismStyle {
  const { traits, activeGeneCount } = phenotype;
  const hue = Math.round(traits.pigment * 300);
  const saturation = Math.round(55 + traits.metabolismEfficiency * 20);
  const lightness = Math.round(42 + traits.membraneStability * 16);
  const radiusFactor = 0.55 + Math.min(1.2, traits.size) * 0.35;

  // A visible "leveling up" cue once an organism has accumulated several
  // active genes — the simple-replicator-to-cell arc made visible.
  const ring = activeGeneCount >= 6 ? "rgba(255,255,255,0.85)" : activeGeneCount >= 4 ? "rgba(255,255,255,0.4)" : null;

  return { fill: `hsl(${hue} ${saturation}% ${lightness}%)`, ring, radiusFactor };
}

function effective(phenotype: Phenotype, cellTraits: Partial<Record<TraitId, number>> | undefined, trait: TraitId): number {
  return cellTraits?.[trait] ?? phenotype.traits[trait];
}

function shiftLightness(hsl: string, deltaPercent: number): string {
  const match = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(hsl);
  if (!match) return hsl;
  const [, h, s, l] = match;
  const newL = Math.max(8, Math.min(92, Number(l) + deltaPercent));
  return `hsl(${h} ${s}% ${newL}%)`;
}

/**
 * Per-organism variant of `organismStyle`: takes the organism's cached static
 * phenotype plus its current resolved regulatory traits (see
 * engine/simulation.ts's cellTraits map / engine/phenotype.ts's
 * resolveCellTraits), so differentiation — the same genome expressing
 * differently depending on how deep inside a colony this organism currently
 * sits — actually reads visually rather than staying an inspector-only
 * number. An organism with no regulatory expression (solo, or a colony's
 * exposed/surface member) renders identically to `organismStyle`.
 *
 * `colorMode`/`metricValue` optionally swap the fill for a live-metric color
 * instead of the phenotype hue — `ring`/`radiusFactor` (and the
 * structural-integrity/growth-suppression cues they carry) stay unchanged
 * either way, so those cues remain legible regardless of color mode.
 * `metricValue` must already be normalized 0..1 by the caller (see
 * WorldCanvas.tsx, which derives it against each organism's own niche/cap/
 * lifespan rather than a world-wide min/max) and is ignored when
 * `colorMode` is "phenotype".
 */
export function cellStyle(
  phenotype: Phenotype,
  cellTraits: Partial<Record<TraitId, number>> | undefined,
  colorMode: OrganismColorMode = "phenotype",
  metricValue = 0,
): OrganismStyle {
  const base = organismStyle(phenotype);
  const structuralIntegrity = effective(phenotype, cellTraits, "structuralIntegrity");
  const growthSuppression = effective(phenotype, cellTraits, "growthSuppression");

  // Interior, well-reinforced cells read darker/denser; a body's surface (or
  // a trait-less lone cell) stays visually indistinguishable from before.
  // Only applied to the phenotype hue — a metric-mode fill is already a
  // direct, undiluted read of that metric.
  const fill = colorMode === "phenotype" ? shiftLightness(base.fill, -structuralIntegrity * 18) : metricColor(colorMode, metricValue);
  const ring = growthSuppression > 0.4 ? "rgba(15,23,42,0.55)" : base.ring;
  const radiusFactor = base.radiusFactor * (1 + structuralIntegrity * 0.15);

  return { fill, ring, radiusFactor };
}
