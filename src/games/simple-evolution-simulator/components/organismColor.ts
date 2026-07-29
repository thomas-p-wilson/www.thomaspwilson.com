// Purely presentational: maps a decoded Phenotype to a color/size so the
// world view can render organisms as colored cells rather than skeuomorphic
// sprites. Nothing here feeds back into the engine.
import type { Phenotype, TraitId } from "../engine/types";

export interface OrganismStyle {
  fill: string;
  ring: string | null;
  radiusFactor: number;
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
 */
export function cellStyle(phenotype: Phenotype, cellTraits: Partial<Record<TraitId, number>> | undefined): OrganismStyle {
  const base = organismStyle(phenotype);
  const structuralIntegrity = effective(phenotype, cellTraits, "structuralIntegrity");
  const growthSuppression = effective(phenotype, cellTraits, "growthSuppression");

  // Interior, well-reinforced cells read darker/denser; a body's surface (or
  // a trait-less lone cell) stays visually indistinguishable from before.
  const fill = shiftLightness(base.fill, -structuralIntegrity * 18);
  const ring = growthSuppression > 0.4 ? "rgba(15,23,42,0.55)" : base.ring;
  const radiusFactor = base.radiusFactor * (1 + structuralIntegrity * 0.15);

  return { fill, ring, radiusFactor };
}
