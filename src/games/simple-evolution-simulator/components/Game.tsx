import { LayoutGrid, LineChart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DEFAULT_ORBITAL_CONFIG, DEFAULT_STELLAR_CONFIG } from "../engine/astrophysics";
import { DEFAULT_MUTATION_CONFIG, scaleMutationConfig } from "../engine/genome";
import {
  createSimulation, getCellTraits, getColonyBonds, getColonySize, getLineageRecords, getOrbitalDistanceAu,
  getOrganisms, getStatsHistory, getTicksUntilAbiogenesis, step, type SimulationState,
} from "../engine/simulation";
import type { OrbitalConfig, StellarConfig } from "../engine/types";
import { DEFAULT_WORLD_SIZE_INDEX, WORLD_SIZE_PRESETS, type WorldSizePreset } from "../engine/worldSize";
import ControlsPanel from "./ControlsPanel";
import GenomeViewer from "./GenomeViewer";
import IntroSequence from "./IntroSequence";
import LineageTree from "./LineageTree";
import type { OrganismColorMode } from "./organismColor";
import OrganismInspector from "./OrganismInspector";
import StatsView from "./StatsView";
import WorldCanvas from "./WorldCanvas";

const BASE_TICKS_PER_SECOND = 8;
const MAX_STEPS_PER_FRAME = 20;

type Phase = "intro" | "playing";
type ViewMode = "world" | "stats";

export default function Game() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [viewMode, setViewMode] = useState<ViewMode>("world");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [mutationMultiplier, setMutationMultiplier] = useState(1);
  const [stellarConfig, setStellarConfig] = useState<StellarConfig>(DEFAULT_STELLAR_CONFIG);
  const [orbitalConfig, setOrbitalConfig] = useState<OrbitalConfig>(DEFAULT_ORBITAL_CONFIG);
  const [worldSizeIndex, setWorldSizeIndex] = useState(DEFAULT_WORLD_SIZE_INDEX);
  const [colorMode, setColorMode] = useState<OrganismColorMode>("phenotype");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [genomeOpen, setGenomeOpen] = useState(false);
  const [genomeFocusIndex, setGenomeFocusIndex] = useState<number | undefined>(undefined);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [, setVersion] = useState(0);
  // Shown once per simulation run on the first extinction; re-armed by
  // startNewSimulation. Doesn't reset on a later extinction within the same
  // run — once the player has seen and dismissed it, repeat die-offs (real
  // and expected — see engine/simulation.ts's spawnAbiogenesis) just proceed
  // silently instead of interrupting again.
  const [extinctionNoticeDismissed, setExtinctionNoticeDismissed] = useState(false);

  const simRef = useRef<SimulationState | null>(null);

  function openGenomeViewer(focusBaseIndex?: number) {
    setGenomeFocusIndex(focusBaseIndex);
    setGenomeOpen(true);
  }

  function startNewSimulation(size: WorldSizePreset = WORLD_SIZE_PRESETS[worldSizeIndex]) {
    simRef.current = createSimulation({
      width: size.width,
      height: size.height,
      seed: Math.floor(Math.random() * 2 ** 31),
      // temperature here is a placeholder immediately overwritten by astro
      // (see createSimulation) — the real baseline comes from stellar/orbital.
      environment: { temperature: 0.5, foodRegenRate: 0.18 },
      astro: { stellar: stellarConfig, orbital: orbitalConfig },
      mutation: scaleMutationConfig(DEFAULT_MUTATION_CONFIG, mutationMultiplier),
    });
    setSelectedId(null);
    setExtinctionNoticeDismissed(false);
    setVersion((v) => v + 1);
  }

  function handleIntroComplete() {
    startNewSimulation();
    setPhase("playing");
  }

  function handleReset() {
    startNewSimulation();
  }

  // World dimensions are baked into the simulation's grid array at creation
  // (see engine/worldSize.ts) — changing them can't happen live, so this
  // always starts a fresh simulation at the new size, same as Reset.
  function handleWorldSizeChange(index: number) {
    setWorldSizeIndex(index);
    startNewSimulation(WORLD_SIZE_PRESETS[index]);
  }

  // Not hooks — plain reads of the mutable sim ref — so these are safe to
  // compute ahead of the intro-phase early return below and reuse both in
  // the tick loop's pause condition and in the render body further down.
  const sim = simRef.current;
  const ticksUntilAbiogenesis = sim ? getTicksUntilAbiogenesis(sim) : null;
  const showExtinctionNotice = ticksUntilAbiogenesis !== null && !extinctionNoticeDismissed;

  // Main tick loop. Speed changes intentionally restart the accumulator
  // (harmless); mutation rate and stellar/orbital config are applied via the
  // effects below so they take effect immediately without resetting timing. Paused
  // while the extinction notice is up (showExtinctionNotice) — dismissing it
  // is what lets ticks (and the abiogenesis countdown) resume.
  useEffect(() => {
    if (phase !== "playing" || !running || showExtinctionNotice) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const stepMs = 1000 / (BASE_TICKS_PER_SECOND * speed);

    function loop(now: number) {
      const dt = now - last;
      last = now;
      acc += dt;
      let steps = 0;
      while (acc >= stepMs && steps < MAX_STEPS_PER_FRAME) {
        if (simRef.current) step(simRef.current);
        acc -= stepMs;
        steps++;
      }
      if (steps > 0) setVersion((v) => v + 1);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, running, speed, showExtinctionNotice]);

  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.mutation = scaleMutationConfig(DEFAULT_MUTATION_CONFIG, mutationMultiplier);
  }, [mutationMultiplier]);

  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.astro = { stellar: stellarConfig, orbital: orbitalConfig };
  }, [stellarConfig, orbitalConfig]);

  if (phase === "intro") {
    return <IntroSequence onComplete={handleIntroComplete} />;
  }

  const organisms = sim ? getOrganisms(sim) : [];
  const lineageRecords = sim ? getLineageRecords(sim) : [];
  const cellTraits = sim ? getCellTraits(sim) : new Map();
  const bonds = sim ? getColonyBonds(sim) : [];
  const statsHistory = sim ? getStatsHistory(sim) : [];
  const selectedOrganism = organisms.find((o) => o.id === selectedId) ?? null;
  const selectedRecord = selectedId ? sim?.lineage.get(selectedId) : undefined;
  const selectedColonySize = sim && selectedOrganism ? getColonySize(sim, selectedOrganism.id) : 1;
  const zeroStatSummary = { avg: 0, min: 0, max: 0 };
  const stats = sim?.stats ?? {
    population: 0, maxGeneration: 0, births: 0, deaths: 0, organismsInColonies: 0, largestColony: 0,
    genomeLength: zeroStatSummary, age: zeroStatSummary, colonySize: zeroStatSummary,
    avgTemperature: 0, incidentFluxWm2: 0,
  };

  return (
    <div className="h-screen w-screen bg-slate-950 p-4 pt-16 md:p-6 md:pt-16 overflow-auto">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
          <div className="flex gap-1 self-start sm:self-center">
            <Button
              size="sm"
              variant={viewMode === "world" ? "secondary" : "ghost"}
              onClick={() => setViewMode("world")}
              className={`gap-1.5 ${viewMode === "world" ? "" : "text-slate-400 hover:text-slate-100"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> World
            </Button>
            <Button
              size="sm"
              variant={viewMode === "stats" ? "secondary" : "ghost"}
              onClick={() => setViewMode("stats")}
              className={`gap-1.5 ${viewMode === "stats" ? "" : "text-slate-400 hover:text-slate-100"}`}
            >
              <LineChart className="w-3.5 h-3.5" /> Stats
            </Button>
          </div>
          <div className="relative w-full h-full rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            {showExtinctionNotice && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-950/90 p-6 text-center">
                <div className="max-w-sm space-y-4">
                  <p className="text-sm text-amber-200">
                    This lineage went extinct — a total die-off isn&apos;t the end of the story. Life on early
                    planets often failed and re-emerged more than once; a fresh spark may spontaneously appear in
                    about {ticksUntilAbiogenesis} ticks.
                  </p>
                  <Button size="sm" onClick={() => setExtinctionNoticeDismissed(true)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
            {viewMode === "world" ? (
              <WorldCanvas
                organisms={organisms}
                cellTraits={cellTraits}
                colorMode={colorMode}
                bonds={bonds}
                biomeOffset={sim?.biomeOffset ?? null}
                baseTemperature={sim?.environment.temperature ?? 0.5}
                width={WORLD_SIZE_PRESETS[worldSizeIndex].width}
                height={WORLD_SIZE_PRESETS[worldSizeIndex].height}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ) : (
              <StatsView stats={stats} history={statsHistory} tick={sim?.tick ?? 0} />
            )}
          </div>
          {viewMode === "world" ? (
            <p className="text-xs text-slate-500 text-center max-w-md">
              Click any organism to inspect it. Brighter rings mark organisms with several active genes — simple
              replicators well on their way to being cells. Thin lines connect bonded colony-mates — independent
              organisms whose surface proteins recognize each other; darker, denser organisms have differentiated
              under Structural Reinforcement from sitting deep inside a colony. Background shading shows each
              region's local temperature — cooler blue, warmer red — fixed for this planet, shifting uniformly
              with its star and orbit.
            </p>
          ) : (
            <p className="text-xs text-slate-500 text-center max-w-md">
              Aggregate population trends over the run — genome length, age, and colony size distributions, each
              with current/average/min/max and a trendline.
            </p>
          )}
        </div>

        <div className="w-full lg:w-80 shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <ControlsPanel
              running={running}
              onToggleRunning={() => setRunning((r) => !r)}
              speed={speed}
              onSpeedChange={setSpeed}
              mutationMultiplier={mutationMultiplier}
              onMutationMultiplierChange={setMutationMultiplier}
              stellarConfig={stellarConfig}
              onStellarConfigChange={setStellarConfig}
              orbitalConfig={orbitalConfig}
              onOrbitalConfigChange={setOrbitalConfig}
              baselineTemperature={sim?.environment.temperature ?? 0.5}
              orbitalDistanceAu={sim ? getOrbitalDistanceAu(sim) : null}
              worldSizeIndex={worldSizeIndex}
              worldSizePresets={WORLD_SIZE_PRESETS}
              onWorldSizeChange={handleWorldSizeChange}
              colorMode={colorMode}
              onColorModeChange={setColorMode}
              stats={stats}
              tick={sim?.tick ?? 0}
              onOpenGenomeViewer={() => openGenomeViewer()}
              onOpenLineageTree={() => setLineageOpen(true)}
              onReset={handleReset}
            />
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <OrganismInspector
              organism={selectedOrganism}
              record={selectedRecord}
              cellTraits={cellTraits}
              colonySize={selectedColonySize}
              onOpenGenome={openGenomeViewer}
              onOpenLineage={() => setLineageOpen(true)}
              onSelectParent={setSelectedId}
            />
          </div>
        </div>
      </div>

      <Sheet open={genomeOpen} onOpenChange={setGenomeOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl bg-slate-950 border-slate-800 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-100">
              Genome{selectedOrganism ? ` — ${selectedOrganism.id}` : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {selectedOrganism ? (
              <GenomeViewer
                key={`${selectedOrganism.id}:${genomeFocusIndex ?? "full"}`}
                genome={selectedOrganism.genome}
                focusBaseIndex={genomeFocusIndex}
              />
            ) : selectedRecord ? (
              <GenomeViewer
                key={`${selectedRecord.id}:${genomeFocusIndex ?? "full"}`}
                genome={selectedRecord.genome}
                focusBaseIndex={genomeFocusIndex}
              />
            ) : (
              <p className="text-sm text-slate-400">Select an organism in the world first.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={lineageOpen} onOpenChange={setLineageOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl bg-slate-950 border-slate-800 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-100">Lineage</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <LineageTree records={lineageRecords} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
