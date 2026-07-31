import { Dna, GitBranch, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { STAR_TABLE } from "../engine/astrophysics";
import type { SimulationStats } from "../engine/simulation";
import type { OrbitalConfig, SpectralClass, StellarConfig } from "../engine/types";
import type { WorldSizePreset } from "../engine/worldSize";
import { metricColor, type OrganismColorMode } from "./organismColor";

interface ControlsPanelProps {
  running: boolean;
  onToggleRunning: () => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  mutationMultiplier: number;
  onMutationMultiplierChange: (value: number) => void;
  stellarConfig: StellarConfig;
  onStellarConfigChange: (config: StellarConfig) => void;
  orbitalConfig: OrbitalConfig;
  onOrbitalConfigChange: (config: OrbitalConfig) => void;
  /** The planet's live, astro-derived baseline (see engine/astrophysics.ts) —
   * read-only here, purely a readout of the effect the controls above have. */
  baselineTemperature: number;
  /** Current distance from the star, in AU, or null before a sim exists. */
  orbitalDistanceAu: number | null;
  worldSizeIndex: number;
  worldSizePresets: WorldSizePreset[];
  onWorldSizeChange: (index: number) => void;
  colorMode: OrganismColorMode;
  onColorModeChange: (mode: OrganismColorMode) => void;
  stats: SimulationStats;
  tick: number;
  onOpenGenomeViewer: () => void;
  onOpenLineageTree: () => void;
  onReset: () => void;
}

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    <div className="text-lg font-semibold text-slate-100 tabular-nums">{value}</div>
  </div>
);

const COLOR_MODES: Array<{ id: OrganismColorMode; label: string }> = [
  { id: "phenotype", label: "Trait" },
  { id: "temperature", label: "Temp" },
  { id: "energy", label: "Energy" },
  { id: "age", label: "Age" },
];

// Low/high captions per non-phenotype mode, paired with a gradient strip
// built from the same ramp WorldCanvas actually paints with (metricColor),
// so the legend can't drift out of sync with what's on screen.
const COLOR_MODE_CAPTIONS: Record<Exclude<OrganismColorMode, "phenotype">, { low: string; high: string }> = {
  temperature: { low: "Cold-adapted", high: "Hot-adapted" },
  energy: { low: "Near-empty", high: "Full energy" },
  age: { low: "Newborn", high: "End of life" },
};

const ColorModeLegend = ({ colorMode }: { colorMode: OrganismColorMode }) => {
  if (colorMode === "phenotype") {
    return (
      <p className="text-[11px] text-slate-500 mt-1">
        Color reflects each organism's pigment, metabolism, and membrane-stability traits.
      </p>
    );
  }
  const { low, high } = COLOR_MODE_CAPTIONS[colorMode];
  return (
    <div className="mt-1.5">
      <div
        className="h-2 rounded-full"
        style={{ background: `linear-gradient(to right, ${metricColor(colorMode, 0)}, ${metricColor(colorMode, 1)})` }}
      />
      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
};

const SPECTRAL_CLASSES: SpectralClass[] = ["M", "K", "G", "F", "A"];

export default function ControlsPanel({
  running, onToggleRunning, speed, onSpeedChange, mutationMultiplier, onMutationMultiplierChange,
  stellarConfig, onStellarConfigChange, orbitalConfig, onOrbitalConfigChange, baselineTemperature, orbitalDistanceAu,
  worldSizeIndex, worldSizePresets, onWorldSizeChange,
  colorMode, onColorModeChange, stats, tick, onOpenGenomeViewer, onOpenLineageTree, onReset,
}: ControlsPanelProps) {
  const worldSize = worldSizePresets[worldSizeIndex];
  return (
    <div className="space-y-5 text-slate-200">
      <div className="flex items-center gap-2">
        <Button onClick={onToggleRunning} variant={running ? "secondary" : "default"} className="flex-1">
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? "Pause" : "Play"}
        </Button>
        <Button onClick={onReset} variant="outline" size="icon" title="Restart from a fresh primordial seed">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Population" value={stats.population} />
        <StatTile label="Generation" value={stats.maxGeneration} />
        <StatTile label="Tick" value={tick} />
        <StatTile label="Births / Deaths" value={`${stats.births} / ${stats.deaths}`} />
        <StatTile label="In Colonies" value={stats.organismsInColonies} />
        <StatTile label="Largest Colony" value={stats.largestColony} />
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs mb-1">Organism color</div>
          <div className="grid grid-cols-4 gap-1">
            {COLOR_MODES.map((mode) => (
              <Button
                key={mode.id}
                size="sm"
                variant={colorMode === mode.id ? "secondary" : "ghost"}
                onClick={() => onColorModeChange(mode.id)}
                className={colorMode === mode.id ? "" : "text-slate-400 hover:text-slate-100"}
              >
                {mode.label}
              </Button>
            ))}
          </div>
          <ColorModeLegend colorMode={colorMode} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Speed</span>
            <span className="text-slate-400">{speed.toFixed(1)}x</span>
          </div>
          <Slider value={[speed]} min={0.25} max={4} step={0.25} onValueChange={(values: number[]) => onSpeedChange(values[0])} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Mutation rate</span>
            <span className="text-slate-400">{mutationMultiplier.toFixed(1)}x</span>
          </div>
          <Slider
            value={[mutationMultiplier]}
            min={0}
            max={3}
            step={0.1}
            onValueChange={(values: number[]) => onMutationMultiplierChange(values[0])}
          />
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs">Star &amp; orbit</span>
            <span className="text-slate-400 text-xs tabular-nums">
              Baseline {Math.round(baselineTemperature * 100)}&deg;
              {orbitalDistanceAu !== null ? ` · ${orbitalDistanceAu.toFixed(2)} AU` : ""}
            </span>
          </div>

          <div>
            <div className="text-xs mb-1 text-slate-400">Star type</div>
            <div className="grid grid-cols-5 gap-1">
              {SPECTRAL_CLASSES.map((spectralClass) => (
                <Button
                  key={spectralClass}
                  size="sm"
                  variant={stellarConfig.spectralClass === spectralClass ? "secondary" : "ghost"}
                  onClick={() => onStellarConfigChange({ spectralClass })}
                  className={stellarConfig.spectralClass === spectralClass ? "" : "text-slate-400 hover:text-slate-100"}
                  title={STAR_TABLE[spectralClass].label}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-1"
                    style={{ backgroundColor: STAR_TABLE[spectralClass].color }}
                  />
                  {spectralClass}
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{STAR_TABLE[stellarConfig.spectralClass].label} — hotter,
              bluer stars pour out far more radiation for the same distance.</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Distance from star</span>
              <span className="text-slate-400">{orbitalConfig.semiMajorAxisAu.toFixed(2)} AU</span>
            </div>
            <Slider
              value={[orbitalConfig.semiMajorAxisAu]}
              min={0.3}
              max={3}
              step={0.05}
              onValueChange={(values: number[]) => onOrbitalConfigChange({ ...orbitalConfig, semiMajorAxisAu: values[0] })}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Eccentricity</span>
              <span className="text-slate-400">{orbitalConfig.eccentricity.toFixed(2)}</span>
            </div>
            <Slider
              value={[orbitalConfig.eccentricity]}
              min={0}
              max={0.7}
              step={0.01}
              onValueChange={(values: number[]) => onOrbitalConfigChange({ ...orbitalConfig, eccentricity: values[0] })}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Above 0, the orbit is elliptical: distance from the star — and baseline temperature — swings between
              a hot periapsis and a cold apoapsis once per year instead of staying fixed.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Albedo</span>
              <span className="text-slate-400">{Math.round(orbitalConfig.albedo * 100)}%</span>
            </div>
            <Slider
              value={[orbitalConfig.albedo]}
              min={0}
              max={0.9}
              step={0.01}
              onValueChange={(values: number[]) => onOrbitalConfigChange({ ...orbitalConfig, albedo: values[0] })}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Fraction of incident starlight reflected rather than absorbed — more ice/cloud cover means a colder
              planet for the same star and distance. Local regions still vary warmer/cooler around this baseline
              (see the world's background tint); organisms whose thermal-tolerance gene doesn't match their local
              niche burn energy faster.
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>World size</span>
            <span className="text-slate-400">
              {worldSize.label} ({worldSize.width}&times;{worldSize.height})
            </span>
          </div>
          <Slider
            value={[worldSizeIndex]}
            min={0}
            max={worldSizePresets.length - 1}
            step={1}
            onValueChange={(values: number[]) => onWorldSizeChange(values[0])}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Sets the grid's population cap ({worldSize.width * worldSize.height} cells). Changing this starts a
            fresh simulation.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <Button onClick={onOpenGenomeViewer} variant="outline" className="justify-start gap-2">
          <Dna className="w-4 h-4" /> Genome Viewer
        </Button>
        <Button onClick={onOpenLineageTree} variant="outline" className="justify-start gap-2">
          <GitBranch className="w-4 h-4" /> Lineage Tree
        </Button>
      </div>
    </div>
  );
}
