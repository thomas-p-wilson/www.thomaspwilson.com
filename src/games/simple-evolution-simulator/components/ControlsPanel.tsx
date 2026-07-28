import { Dna, GitBranch, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { SimulationStats } from "../engine/simulation";

interface ControlsPanelProps {
  running: boolean;
  onToggleRunning: () => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  mutationMultiplier: number;
  onMutationMultiplierChange: (value: number) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
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

export default function ControlsPanel({
  running, onToggleRunning, speed, onSpeedChange, mutationMultiplier, onMutationMultiplierChange,
  temperature, onTemperatureChange, stats, tick, onOpenGenomeViewer, onOpenLineageTree, onReset,
}: ControlsPanelProps) {
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
      </div>

      <div className="space-y-4">
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

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Temperature</span>
            <span className="text-slate-400">{Math.round(temperature * 100)}&deg;</span>
          </div>
          <Slider value={[temperature]} min={0} max={1} step={0.01} onValueChange={(values: number[]) => onTemperatureChange(values[0])} />
          <p className="text-[11px] text-slate-500 mt-1">
            Organisms whose thermal-tolerance gene doesn't match this niche burn energy faster.
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
