import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DEFAULT_MUTATION_CONFIG, scaleMutationConfig } from "../engine/genome";
import {
  createSimulation, getCellTraits, getColonyBonds, getColonySize, getLineageRecords, getOrganisms, step,
  type SimulationState,
} from "../engine/simulation";
import ControlsPanel from "./ControlsPanel";
import GenomeViewer from "./GenomeViewer";
import IntroSequence from "./IntroSequence";
import LineageTree from "./LineageTree";
import OrganismInspector from "./OrganismInspector";
import WorldCanvas from "./WorldCanvas";

const WORLD_WIDTH = 34;
const WORLD_HEIGHT = 22;
const CELL_SIZE = 14;
const BASE_TICKS_PER_SECOND = 8;
const MAX_STEPS_PER_FRAME = 20;

type Phase = "intro" | "playing";

export default function Game() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [mutationMultiplier, setMutationMultiplier] = useState(1);
  const [temperature, setTemperature] = useState(0.5);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [genomeOpen, setGenomeOpen] = useState(false);
  const [genomeFocusIndex, setGenomeFocusIndex] = useState<number | undefined>(undefined);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [, setVersion] = useState(0);

  const simRef = useRef<SimulationState | null>(null);

  function openGenomeViewer(focusBaseIndex?: number) {
    setGenomeFocusIndex(focusBaseIndex);
    setGenomeOpen(true);
  }

  function startNewSimulation() {
    simRef.current = createSimulation({
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      seed: Math.floor(Math.random() * 2 ** 31),
      environment: { temperature, foodRegenRate: 0.18 },
      mutation: scaleMutationConfig(DEFAULT_MUTATION_CONFIG, mutationMultiplier),
    });
    setSelectedId(null);
    setVersion((v) => v + 1);
  }

  function handleIntroComplete() {
    startNewSimulation();
    setPhase("playing");
  }

  function handleReset() {
    startNewSimulation();
  }

  // Main tick loop. Speed changes intentionally restart the accumulator
  // (harmless); mutation rate and temperature are applied via the effects
  // below so they take effect immediately without resetting timing.
  useEffect(() => {
    if (phase !== "playing" || !running) return;
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
  }, [phase, running, speed]);

  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.mutation = scaleMutationConfig(DEFAULT_MUTATION_CONFIG, mutationMultiplier);
  }, [mutationMultiplier]);

  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.environment = { ...simRef.current.environment, temperature };
  }, [temperature]);

  if (phase === "intro") {
    return <IntroSequence onComplete={handleIntroComplete} />;
  }

  const sim = simRef.current;
  const organisms = sim ? getOrganisms(sim) : [];
  const lineageRecords = sim ? getLineageRecords(sim) : [];
  const cellTraits = sim ? getCellTraits(sim) : new Map();
  const bonds = sim ? getColonyBonds(sim) : [];
  const selectedOrganism = organisms.find((o) => o.id === selectedId) ?? null;
  const selectedRecord = selectedId ? sim?.lineage.get(selectedId) : undefined;
  const selectedColonySize = sim && selectedOrganism ? getColonySize(sim, selectedOrganism.id) : 1;

  return (
    <div className="h-screen w-screen bg-slate-950 p-4 pt-16 md:p-6 md:pt-16 overflow-auto">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
          <div className="w-full h-full overflow-auto rounded-lg border border-slate-800 bg-slate-900/40 p-2 flex items-center justify-center">
            <WorldCanvas
              organisms={organisms}
              cellTraits={cellTraits}
              bonds={bonds}
              width={WORLD_WIDTH}
              height={WORLD_HEIGHT}
              cellSize={CELL_SIZE}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <p className="text-xs text-slate-500 text-center max-w-md">
            Click any organism to inspect it. Brighter rings mark organisms with several active genes — simple
            replicators well on their way to being cells. Thin lines connect bonded colony-mates — independent
            organisms whose surface proteins recognize each other; darker, denser organisms have differentiated
            under Structural Reinforcement from sitting deep inside a colony.
          </p>
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
              temperature={temperature}
              onTemperatureChange={setTemperature}
              stats={sim?.stats ?? {
                population: 0, maxGeneration: 0, births: 0, deaths: 0, organismsInColonies: 0, largestColony: 0,
              }}
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
