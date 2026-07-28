// Purely presentational: maps a decoded Phenotype to a color/size so the
// world view can render organisms as colored Game-of-Life-style cells rather
// than skeuomorphic sprites. Nothing here feeds back into the engine.
import type { Phenotype } from "../engine/types";

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
