import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { SimulationStats, StatHistorySample, StatSummary } from "../engine/simulation";

interface StatsViewProps {
  stats: SimulationStats;
  history: StatHistorySample[];
  tick: number;
}

const AXIS_COLOR = "#64748b"; // slate-500
const GRID_COLOR = "#1e293b"; // slate-800
const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a", // slate-900
  border: "1px solid #334155", // slate-700
  borderRadius: 8,
  fontSize: 12,
  color: "#e2e8f0", // slate-200
};

const StatReadout = ({ label, summary, unit }: { label: string; summary: StatSummary; unit: string }) => (
  <div className="rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    <div className="text-lg font-semibold text-slate-100 tabular-nums">
      {summary.avg.toFixed(1)}
      <span className="text-xs font-normal text-slate-400"> {unit} avg</span>
    </div>
    <div className="text-[11px] text-slate-500 tabular-nums">
      min {summary.min.toFixed(1)} &middot; max {summary.max.toFixed(1)}
    </div>
  </div>
);

function Trendline({
  title, data, dataKeyPrefix, color, unit,
}: {
  title: string;
  data: StatHistorySample[];
  dataKeyPrefix: "population" | "genomeLength" | "age" | "colonySize";
  color: string;
  unit: string;
}) {
  const chartData = data.map((sample) => ({
    tick: sample.tick,
    avg: dataKeyPrefix === "population" ? sample.population : sample[dataKeyPrefix].avg,
    min: dataKeyPrefix === "population" ? sample.population : sample[dataKeyPrefix].min,
    max: dataKeyPrefix === "population" ? sample.population : sample[dataKeyPrefix].max,
  }));

  return (
    <div className="rounded-lg bg-slate-800/40 border border-slate-700 p-3">
      <div className="text-xs font-medium text-slate-300 mb-2">{title}</div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
            <XAxis dataKey="tick" stroke={AXIS_COLOR} tick={{ fontSize: 10 }} />
            <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 10 }} width={36} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelFormatter={(tick: number) => `Tick ${tick}`}
              formatter={(value: number, name: string) => [value.toFixed(1) + ` ${unit}`, name]}
            />
            {dataKeyPrefix !== "population" && (
              <>
                <Line type="monotone" dataKey="max" name="max" stroke={color} strokeOpacity={0.35} strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="min" name="min" stroke={color} strokeOpacity={0.35} strokeWidth={1} dot={false} />
              </>
            )}
            <Line type="monotone" dataKey="avg" name={dataKeyPrefix === "population" ? "population" : "avg"} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function StatsView({ stats, history, tick }: StatsViewProps) {
  if (stats.population === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
        No living population — nothing to chart.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-1">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <StatReadout label="Genome length" summary={stats.genomeLength} unit="bp" />
        <StatReadout label="Age" summary={stats.age} unit="ticks" />
        <StatReadout label="Colony size" summary={stats.colonySize} unit="members" />
        <div className="rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Population</div>
          <div className="text-lg font-semibold text-slate-100 tabular-nums">{stats.population}</div>
          <div className="text-[11px] text-slate-500 tabular-nums">tick {tick}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Trendline title="Population" data={history} dataKeyPrefix="population" color="#38bdf8" unit="" />
        <Trendline title="Genome length (bp)" data={history} dataKeyPrefix="genomeLength" color="#a78bfa" unit="bp" />
        <Trendline title="Age (ticks)" data={history} dataKeyPrefix="age" color="#fb923c" unit="ticks" />
        <Trendline title="Colony size (members)" data={history} dataKeyPrefix="colonySize" color="#34d399" unit="members" />
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        Sampled every 10 ticks; the most recent 600 samples are kept, so long runs scroll forward rather than growing
        unbounded. Faint lines show each sample's min/max across the population; the solid line is the average.
      </p>
    </div>
  );
}
