import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Flag, LayoutGrid, Pause, Play, RotateCcw, Undo2, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import LayoutDiagram from "./LayoutDiagram";
import ShapeIcon from "./ShapeIcon";
import { useLocalStorageState } from "./useLocalStorageState";
import { levels, TOTAL_GOAL_SHAPES, type Level } from "../data/levels";
import { tasks } from "../data/tasks";
import { checklistEntries, type ChecklistEntry, tickedUpgrades, unlockedBuildings } from "../engine/tasks";
import { fillCounts, type LevelPlan, tiersFromTicks } from "../engine/plan";
import { computeCounts } from "../data/counts";
import { type ChecklistGroup, type GroupItem, lineGroup, type LineState, pinnedCounts, toggleItem } from "../engine/groups";
import { machineRate, type UpgradeCategory, type UpgradeTiers } from "../engine/throughput";
import { formatClock, formatDelta, parseClock } from "../engine/time";
import { RESQUEEZE_STEP_SECONDS, type Schedule, SQUEEZE_DEADLINE_SECONDS, squeezedSchedule } from "../engine/schedule";

const GOAL_MS = 30 * 60 * 1000;

interface RunState {
  runningSince: number | null;
  accumulatedMs: number;
  /** Level number → in-game time (ms) it was finished at. */
  splits: Record<number, number>;
  /** Level number → upgrade tiers when it was finished, so a done level's numbers stay put. */
  tiersAt: Record<number, UpgradeTiers>;
  /** Level number → its (possibly squeezed) target in seconds when it was finished. */
  targetAt: Record<number, number>;
}

const INITIAL_RUN: RunState = { runningSince: null, accumulatedMs: 0, splits: {}, tiersAt: {}, targetAt: {} };
const ORIGINAL_TARGETS = levels.map((l) => l.targetSeconds);

interface TickState extends LineState {
  /** Stage id → the text a single step showed when ticked (and "id#caption" → its layout caption). */
  frozen: Record<string, string>;
}

const INITIAL_TICKS: TickState = { ids: {}, frozen: {}, built: {}, complete: {} };

/** One row of the checklist: a single step or a production line's group. */
type ChecklistRow = { kind: "entry"; entry: ChecklistEntry; rank: number } | { kind: "group"; group: ChecklistGroup; rank: number };

/** Each stage with the task it belongs to. */
const STAGES = new Map(tasks.flatMap((task) => task.stages.map((stage) => [stage.id, { stage, task }] as const)));

const TIER_LABELS: Record<UpgradeCategory, string> = {
  belt: "Belt",
  miner: "Miner",
  processors: "Processors",
  painting: "Painting",
};

function tierLabel(tier: number): string {
  return tier === 0 ? "base" : "I".repeat(tier);
}

// Matches shape keys like "----CuCu" or "CbCbCbRb:CwCwCwCw" inside prose.
const SHAPE_KEY_PATTERN = /((?:(?:[CRSW][urgbypcw]|--){4})(?::(?:(?:[CRSW][urgbypcw]|--){4}))*)/g;

/** Renders prose with any shape keys in monospace, so their dashes line up and stay readable. */
function WithShapeKeys({ text }: { text: string }) {
  return (
    <>
      {text.split(SHAPE_KEY_PATTERN).map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="text-[0.85em] bg-slate-100 rounded px-1 py-0.5 whitespace-nowrap">
            {part}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}


function elapsedMs(run: RunState, now: number): number {
  return run.accumulatedMs + (run.runningSince === null ? 0 : now - run.runningSince);
}

/** Levels done in a row from level 1; a later split with a gap before it doesn't count yet. */
function levelsDoneFrom(splits: Record<number, number>): number {
  let done = 0;
  while (splits[done + 1] !== undefined) done++;
  return done;
}

export default function ShapezSpeedrunChecklist() {
  const [run, setRun] = useLocalStorageState<RunState>("shapez-speedrun:run", INITIAL_RUN);
  const [tickedState, setTickedState] = useLocalStorageState<TickState>("shapez-speedrun:tasks", INITIAL_TICKS);
  const [showDone, setShowDone] = useState(false);
  const [openLayouts, setOpenLayouts] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(() => Date.now());

  const running = run.runningSince !== null;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed = elapsedMs(run, now);
  const levelsDone = levelsDoneFrom(run.splits);
  const currentLevel = levels[levelsDone] ?? null;
  const ticked = tickedState.ids;
  const frozen = tickedState.frozen;

  // Behind plan, the remaining targets squeeze towards 29:00. While overdue this follows the clock in 15 s steps.
  const clockStep = Math.floor(elapsed / (RESQUEEZE_STEP_SECONDS * 1000)) * RESQUEEZE_STEP_SECONDS * 1000;
  const schedule = useMemo(
    () => squeezedSchedule(ORIGINAL_TARGETS, run.splits, clockStep, run.targetAt),
    [run.splits, run.targetAt, clockStep]
  );

  // Upgrade tiers come from the ticked purchase steps.
  const tiers = useMemo(() => tiersFromTicks(tickedUpgrades(tasks, ticked)), [ticked]);

  // Each level sized for when it can start (real split of its unlocking level, else that level's target)
  // and the current tiers; a finished level keeps the tiers it was finished with.
  // A finished production line keeps the counts it was built with, in the checklist and the level reference alike.
  const lineState: LineState = useMemo(
    () => ({ ids: tickedState.ids, built: tickedState.built, complete: tickedState.complete }),
    [tickedState.ids, tickedState.built, tickedState.complete]
  );
  const pinned = useMemo(() => pinnedCounts(lineState), [lineState]);
  const counts = useMemo(
    () => computeCounts({ targets: schedule.targets, splitsMs: run.splits, tiersAt: run.tiersAt, tiers, pinned }),
    [schedule.targets, run.splits, run.tiersAt, tiers, pinned]
  );
  const plans = counts.levelPlans;
  const fill = counts.fill;
  const entryText = useMemo(() => ({ fill, frozen }), [fill, frozen]);

  const entries = useMemo(() => checklistEntries(tasks, levelsDone, ticked, showDone, entryText), [levelsDone, ticked, showDone, entryText]);

  // Each production line as a group, from its plan.
  const groups = useMemo(() => {
    const out: ChecklistGroup[] = [];
    for (const task of tasks) {
      if (!task.line || (task.obsoleteAfter !== undefined && levelsDone >= task.obsoleteAfter)) continue;
      const plan = counts.planFor(task);
      if (!plan) continue;
      out.push(lineGroup({ taskId: task.id, forLevel: task.forLevel, title: task.line.title, hint: task.line.hint, layout: task.layout }, plan, levelsDone, lineState));
    }
    return out;
  }, [counts, levelsDone, lineState]);

  // Most urgent first: by rank (can finish now, prep, waiting on an unlock, done), then level, then list order.
  const rows = useMemo(() => {
    const all: (ChecklistRow & { level: number; order: number })[] = [
      ...entries.map((entry, i) => ({ kind: "entry" as const, entry, rank: entry.done ? 3 : entry.missing ? 1 : 0, level: entry.forLevel, order: 1000 + i })),
      ...groups.filter((g) => showDone || !g.complete).map((group, i) => ({ kind: "group" as const, group, rank: group.rank, level: group.forLevel, order: i })),
    ];
    return all.sort((a, b) => a.rank - b.rank || a.level - b.level || a.order - b.order);
  }, [entries, groups, showDone]);
  const doneCount = useMemo(
    () => checklistEntries(tasks, levelsDone, ticked, true).filter((e) => e.done).length + groups.filter((g) => g.complete).length,
    [levelsDone, ticked, groups]
  );

  /** Level → machine keys ticked off in its line (and enough of them). */
  const doneKeys = useMemo(() => {
    const out: Record<number, string[]> = {};
    for (const g of groups) if (!tasks.find((t) => t.id === g.taskId)?.pace) out[g.forLevel] = g.items.filter((i) => i.done).map((i) => i.key);
    return out;
  }, [groups]);

  const toggleGroupItem = (group: ChecklistGroup, item: GroupItem, value: boolean) =>
    setTickedState((s) => ({ ...s, ...toggleItem(s, group, item, value) }));
  const captionFor = (entry: ChecklistEntry) => {
    const task = STAGES.get(entry.key)?.task;
    return frozen[`${entry.key}#caption`] ?? (entry.layout?.caption && task ? fill(entry.layout.caption, task) : entry.layout?.caption);
  };
  const openCount = entries.filter((e) => !e.done).length + groups.filter((g) => !g.complete).length;

  // Ticking freezes the numbers a stage shows; unticking lets them update again.
  const toggle = (entry: ChecklistEntry, value: boolean) => {
    const caption = captionFor(entry);
    setTickedState((s) => {
      const ids = { ...s.ids };
      const frozenNext = { ...s.frozen };
      for (const id of entry.stageIds) {
        const found = STAGES.get(id);
        if (value) {
          ids[id] = true;
          if (found) frozenNext[id] = fill(found.stage.text, found.task);
          if (caption) frozenNext[`${id}#caption`] = caption;
        } else {
          delete ids[id];
          delete frozenNext[id];
          delete frozenNext[`${id}#caption`];
        }
      }
      return { ...s, ids, frozen: frozenNext };
    });
  };

  const startPause = () => {
    const t = Date.now();
    setNow(t);
    setRun((r) => (r.runningSince === null ? { ...r, runningSince: t } : { ...r, runningSince: null, accumulatedMs: elapsedMs(r, t) }));
  };

  const recordSplit = () => {
    if (!currentLevel) return;
    const t = Date.now();
    setNow(t);
    setRun((r) => {
      const splits = { ...r.splits, [currentLevel.level]: elapsedMs(r, t) };
      const tiersAt = { ...r.tiersAt, [currentLevel.level]: tiers };
      const targetAt = { ...r.targetAt, [currentLevel.level]: schedule.targets[currentLevel.level] };
      const finished = currentLevel.level === levels.length;
      const next = { ...r, splits, tiersAt, targetAt };
      return finished ? { ...next, runningSince: null, accumulatedMs: elapsedMs(r, t) } : next;
    });
  };

  const undoSplit = () => {
    if (levelsDone === 0) return;
    setRun((r) => {
      const splits = { ...r.splits };
      const tiersAt = { ...r.tiersAt };
      const targetAt = { ...r.targetAt };
      delete splits[levelsDone];
      delete tiersAt[levelsDone];
      delete targetAt[levelsDone];
      return { ...r, splits, tiersAt, targetAt };
    });
  };

  const setSplit = (level: number, ms: number) => setRun((r) => ({ ...r, splits: { ...r.splits, [level]: ms } }));

  const setElapsed = (ms: number) => {
    const t = Date.now();
    setNow(t);
    setRun((r) => ({ ...r, accumulatedMs: ms, runningSince: r.runningSince === null ? null : t }));
  };

  const resetRun = () => {
    if (!window.confirm("Start over? This resets the timer, all level splits and every checklist tick.")) return;
    setRun(INITIAL_RUN);
    setTickedState(INITIAL_TICKS);
  };

  const resetChecklist = () => {
    if (window.confirm("Untick every checklist item?")) setTickedState(INITIAL_TICKS);
  };

  const currentTargetMs = currentLevel ? schedule.targets[currentLevel.level] * 1000 : null;
  const finalMs = run.splits[levels.length];
  const unlocked = unlockedBuildings(levelsDone);

  return (
    <div className="space-y-6">
      {/* Run timer */}
      <Card className="border-slate-300">
        <CardHeader className="pb-3">
          <CardTitle>Run timer</CardTitle>
          <CardDescription>
            Start this when you start a new game, and press "Level done" as each level completes; the checklist below follows
            along. The achievement uses in-game time, which stops while the Escape menu is open, so pause here too if you
            open it. Click the clock or any split to type in the game's own time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div>
              <EditableClock
                valueMs={elapsed}
                onCommit={setElapsed}
                className={cn("text-5xl font-mono tabular-nums tracking-tight", elapsed > GOAL_MS ? "text-red-600" : "text-slate-900")}
                label="Elapsed in-game time"
              />
              <p className="text-sm text-slate-500 mt-1">
                {!currentLevel
                  ? finalMs < GOAL_MS
                    ? `Level 12 done at ${formatClock(finalMs)}. That's under 30 minutes. 🎉`
                    : `Level 12 done at ${formatClock(finalMs)}. ${formatClock(finalMs - GOAL_MS)} over 30 minutes.`
                  : `${formatClock(Math.max(0, GOAL_MS - elapsed))} left of 30:00`}
              </p>
            </div>
            {currentLevel && currentTargetMs !== null && (
              <div className="sm:ml-auto text-left sm:text-right">
                <p className="text-sm text-slate-500">Now on</p>
                <p className="text-xl font-medium text-slate-900">
                  Level {currentLevel.level} · {currentLevel.required.toLocaleString()} × <code className="text-base">{currentLevel.shape}</code>
                </p>
                <p className={cn("text-sm", elapsed > currentTargetMs ? "text-red-600" : "text-slate-500")}>
                  Target {formatClock(currentTargetMs)}
                  {Math.round(currentTargetMs / 1000) !== currentLevel.targetSeconds && (
                    <span className="text-slate-400 line-through ml-1.5">{formatClock(currentLevel.targetSeconds * 1000)}</span>
                  )}
                  {elapsed > currentTargetMs && ` (${formatDelta(elapsed - currentTargetMs)} behind)`}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={startPause} disabled={!currentLevel} variant={running ? "outline" : "default"}>
              {running ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start run"}
            </Button>
            <Button onClick={recordSplit} disabled={!currentLevel} variant="secondary">
              <Flag className="w-4 h-4 mr-2" />
              {currentLevel ? `Level ${currentLevel.level} done` : "All done"}
            </Button>
            <Button onClick={undoSplit} disabled={levelsDone === 0} variant="ghost">
              <Undo2 className="w-4 h-4 mr-2" />
              Undo level
            </Button>
            <Button onClick={resetRun} variant="ghost" className="sm:ml-auto text-slate-500">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset run
            </Button>
          </div>

          {currentLevel && <CatchUpNote schedule={schedule} />}
          <SplitBar run={run} elapsed={elapsed} targets={schedule.targets} onSetSplit={setSplit} />
        </CardContent>
      </Card>

      {/* Ordered checklist */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle>Checklist</CardTitle>
            <span className="text-sm text-slate-500">
              {levelsDone === 0 ? "Level 1 not done yet" : levelsDone === 1 ? "Level 1 done" : `Levels 1–${levelsDone} done`} · {openCount} to do
            </span>
          </div>
          <CardDescription>
            Most urgent first: things you can finish now, then prep, then lines waiting on an unlock, each sorted by the
            level it's for. Each level's line is one group with an item per kind of building; greyed-out items aren't
            unlocked yet. If a line needs more of something you've ticked before it's finished, that item unticks and says
            how many to add. Once every item is ticked, the line's counts stay as built.
            {unlocked.length > 0 && <span className="block mt-1">Unlocked so far: {unlocked.join(", ")}.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing left for now. Press "Level done" when the next level completes.</p>
          ) : (
            <ol className="space-y-2.5">
              {rows.map((row) =>
                row.kind === "group" ? (
                  <li key={row.group.taskId}>
                    <LineGroupView
                      group={row.group}
                      onToggle={(item, value) => toggleGroupItem(row.group, item, value)}
                      layoutOpen={!!openLayouts[row.group.taskId]}
                      onToggleLayout={() => setOpenLayouts((o) => ({ ...o, [row.group.taskId]: !o[row.group.taskId] }))}
                      caption={(() => {
                        const task = tasks.find((t) => t.id === row.group.taskId);
                        return row.group.layout?.caption && task ? fill(row.group.layout.caption, task) : undefined;
                      })()}
                    />
                  </li>
                ) : (
                  <li key={row.entry.key}>
                    <EntryView entry={row.entry} onToggle={(v) => toggle(row.entry, v)} />
                  </li>
                )
              )}
            </ol>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setShowDone((v) => !v)} className="text-slate-500">
              {showDone ? "Hide done" : `Show done (${doneCount})`}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetChecklist} className="text-slate-500">
              Untick everything
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Level reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Level reference</CardTitle>
          <CardDescription>
            All {TOTAL_GOAL_SHAPES.toLocaleString()} goal shapes from level 1 to 12, how to build each one, and how many
            modules it takes to hit the target time. Sizes follow your real splits and the upgrades you've ticked off; a
            finished level keeps the numbers it had.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="Upgrade tiers">
            <span className="text-slate-500 mr-1">Upgrades:</span>
            {(Object.keys(TIER_LABELS) as UpgradeCategory[]).map((category) => (
              <Badge key={category} variant={tiers[category] > 0 ? "default" : "outline"} className="font-normal">
                {TIER_LABELS[category]} {tierLabel(tiers[category])}
              </Badge>
            ))}
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {levels.map((level) => (
              <LevelDetails
                key={level.level}
                level={level}
                plan={plans[level.level]}
                doneKeys={doneKeys[level.level] ?? []}
                targetSeconds={schedule.targets[level.level]}
                tiers={run.tiersAt[level.level] ?? tiers}
                isCurrent={currentLevel?.level === level.level}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** A single checklist step. */
function EntryView({ entry, onToggle }: { entry: ChecklistEntry; onToggle: (value: boolean) => void }) {
  return (
    <label htmlFor={`task-${entry.key}`} className="flex items-start gap-3 cursor-pointer">
      <Checkbox id={`task-${entry.key}`} checked={entry.done} onCheckedChange={(v) => onToggle(v === true)} className="mt-0.5" />
      <span className={cn("text-sm text-slate-800", entry.done && "line-through text-slate-400")}>
        {entry.quick && (
          <span className="mr-1.5 inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-200 px-1.5 text-xs font-medium text-emerald-800 whitespace-nowrap align-[1px]">
            <Zap className="w-3 h-3" />
            Quick win
          </span>
        )}
        <WithShapeKeys text={entry.text} />
        {entry.missing && (
          <span className="ml-1.5 inline-block rounded bg-amber-50 border border-amber-200 px-1.5 text-xs text-amber-800 whitespace-nowrap">
            Missing {entry.missing}
          </span>
        )}
      </span>
    </label>
  );
}

/** A production line: a heading, then an item per kind of building. */
function LineGroupView({
  group,
  onToggle,
  layoutOpen,
  onToggleLayout,
  caption,
}: {
  group: ChecklistGroup;
  onToggle: (item: GroupItem, value: boolean) => void;
  layoutOpen: boolean;
  onToggleLayout: () => void;
  caption?: string;
}) {
  const doneKeys = new Set(group.items.filter((i) => i.done).map((i) => i.key));
  const hasLanes = group.items.some((i) => i.key === "lanes");
  const isBuilt = (key: string) => (key === "lanes" && !hasLanes ? true : doneKeys.has(key));
  const done = group.items.filter((i) => i.done).length;

  return (
    <div className={cn("rounded-lg border px-3 py-2.5", group.complete ? "border-slate-200 bg-slate-50" : "border-slate-200")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className={cn("text-sm font-medium", group.complete ? "text-slate-400 line-through" : "text-slate-900")}>{group.title}</p>
        <span className="text-xs text-slate-500">
          {group.complete ? "In production" : `${done} of ${group.items.length} done`}
          {group.rank === 2 && " · waiting on an unlock"}
        </span>
      </div>
      {group.hint && (
        <p className="text-xs text-slate-500 mt-0.5">
          <WithShapeKeys text={group.hint} />
        </p>
      )}
      {group.blocksNote && <p className="text-xs text-blue-800 mt-0.5">{group.blocksNote}</p>}
      <ul className="mt-2 space-y-1.5">
        {group.items.map((item) => (
          <li key={item.id}>
            <label htmlFor={`item-${item.id}`} className={cn("flex items-start gap-3", item.locked ? "cursor-not-allowed" : "cursor-pointer")}>
              <Checkbox
                id={`item-${item.id}`}
                checked={item.done}
                disabled={item.locked || group.complete}
                onCheckedChange={(v) => onToggle(item, v === true)}
                className="mt-0.5"
              />
              <span className={cn("text-sm", item.locked ? "text-slate-400" : item.done ? "text-slate-400 line-through" : "text-slate-800")}>
                {item.short
                  ? `Add ${item.short.needed - item.short.built} more: ${item.text.replace(/^Add /, "")} (${item.short.built} built)`
                  : item.text}
                {item.locked && item.missing && (
                  <span className="ml-1.5 inline-block rounded bg-slate-100 border border-slate-200 px-1.5 text-xs text-slate-500 whitespace-nowrap">
                    Needs {item.missing}
                  </span>
                )}
                {item.short && (
                  <span className="ml-1.5 inline-block rounded bg-amber-50 border border-amber-200 px-1.5 text-xs text-amber-800 whitespace-nowrap">
                    Plan went up
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {group.layout && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onToggleLayout}
            aria-expanded={layoutOpen}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
          >
            <LayoutGrid className="w-3 h-3" />
            {layoutOpen ? "Hide layout" : "Layout"}
          </button>
          {layoutOpen && (
            <div className="mt-2">
              <LayoutDiagram layout={group.layout} isBuilt={isBuilt} caption={caption} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** How far behind plan the run is, and what catching up costs. */
function CatchUpNote({ schedule }: { schedule: Schedule }) {
  if (schedule.slip <= 0) return null;
  const slip = formatClock(schedule.slip * 1000);
  if (schedule.factor >= 1) {
    const bufferLeft = Math.max(0, SQUEEZE_DEADLINE_SECONDS - schedule.targets[levels.length]);
    return (
      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {slip} behind plan. The remaining targets move back by that much, into the plan's spare time ({formatClock(bufferLeft * 1000)} of it
        left before 29:00), so the machine counts stay the same.
      </p>
    );
  }
  const machines = 1 / schedule.factor;
  const hard = schedule.outOfReach || machines > 2;
  return (
    <p className={cn("rounded-md border px-3 py-2 text-sm", hard ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700")}>
      {slip} behind plan. Catching up: the remaining levels get {Math.round(schedule.factor * 100)}% of their planned time to finish by 29:00, so
      about {machines.toFixed(1)}× the machines. The counts below already include it.
      {hard && " That's a lot to build: sub-30 is probably out of reach, but the numbers are still here if you want to try."}
    </p>
  );
}

function SplitBar({
  run,
  elapsed,
  targets,
  onSetSplit,
}: {
  run: RunState;
  elapsed: number;
  targets: Record<number, number>;
  onSetSplit: (level: number, ms: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5" aria-label="Level splits">
      {levels.map((level) => {
        const split = run.splits[level.level];
        const target = Math.round(targets[level.level]) * 1000;
        const moved = Math.round(targets[level.level]) !== level.targetSeconds;
        const done = split !== undefined;
        const ahead = done && split <= target;
        const late = !done && elapsed > target;
        return (
          <div
            key={level.level}
            className={cn(
              "rounded-md border px-1.5 py-1 text-center",
              done ? (ahead ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50") : late ? "border-red-200 bg-red-50" : "border-slate-200"
            )}
          >
            <p className="text-[10px] uppercase tracking-wide text-slate-500">L{level.level}</p>
            {done ? (
              <EditableClock
                valueMs={split}
                onCommit={(ms) => onSetSplit(level.level, ms)}
                className="font-mono text-xs tabular-nums text-slate-900"
                label={`Level ${level.level} split`}
              />
            ) : (
              <p className="font-mono text-xs tabular-nums text-slate-400" title={moved ? `Target, moved from ${formatClock(level.targetSeconds * 1000)}` : "Target"}>
                {formatClock(target)}
                {moved && <span className="block text-[10px] line-through text-slate-300">{formatClock(level.targetSeconds * 1000)}</span>}
              </p>
            )}
            {done && (
              <p className={cn("font-mono text-[10px] tabular-nums", ahead ? "text-emerald-700" : "text-amber-700")}>{formatDelta(split - target)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LevelDetails({
  level,
  plan,
  doneKeys,
  targetSeconds,
  tiers,
  isCurrent,
}: {
  level: Level;
  plan?: LevelPlan;
  /** Machine keys ticked off in this level's checklist line. */
  doneKeys: string[];
  targetSeconds: number;
  tiers: UpgradeTiers;
  isCurrent: boolean;
}) {
  const target = Math.round(targetSeconds) * 1000;
  const moved = Math.round(targetSeconds) !== level.targetSeconds;
  const startedBy =
    level.startableAfter === 0 ? "the start of the run" : `when level ${level.startableAfter} unlocks the last building it needs`;

  return (
    <details className="group" open={isCurrent || undefined}>
      <summary className="flex items-center gap-3 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90 shrink-0" />
        <ShapeIcon shapeKey={level.shape} size={36} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-slate-900">Level {level.level}</span>
          <span className="text-slate-600">
            {" "}
            · {level.required.toLocaleString()} × <code className="text-xs bg-slate-100 rounded px-1 py-0.5">{level.shape}</code>
          </span>
          {isCurrent && <Badge className="ml-2">Now</Badge>}
        </div>
        <span className="hidden sm:inline text-xs text-slate-500">Unlocks {level.reward}</span>
        <span className="font-mono text-xs tabular-nums text-slate-500 w-12 text-right" title={moved ? `Moved from ${formatClock(level.targetSeconds * 1000)}` : undefined}>
          {formatClock(target)}
          {moved && <span className="block text-[10px] line-through text-slate-300">{formatClock(level.targetSeconds * 1000)}</span>}
        </span>
      </summary>
      <div className="pb-4 pl-7 grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-700">
            {level.recipe.map((step) => (
              <li key={step}>
                <WithShapeKeys text={step} />
              </li>
            ))}
          </ol>
        </div>
        {plan && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm self-start space-y-2">
            <p className="text-slate-700">
              Unlocks <strong>{level.reward}</strong>. To finish by {formatClock(target)}, counting from {startedBy}{" "}
              ({formatClock(plan.windowSeconds * 1000)}), you need <strong>{plan.rate.toFixed(2)}/s</strong>
              {plan.buildSeconds > 0 && (
                <>
                  {" "}
                  once it's running. That leaves {formatClock(plan.buildSeconds * 1000)} to place the {plan.buildings} building
                  {plan.buildings === 1 ? "" : "s"} that can't go down before it unlocks
                </>
              )}
              .
            </p>
            {plan.behind && (
              <p className="text-amber-700">It unlocked too late for the target, so this is sized to finish a minute after it can start.</p>
            )}
            <p className="text-slate-700">
              One {level.layout?.tiled ? "tile" : "module"} makes {plan.moduleRate.toFixed(2)}/s, limited by its {plan.bottleneck}. Build{" "}
              <strong>
                {level.layout?.tiled && plan.blocks > 1
                  ? `${plan.blocks} blocks of ${plan.tilesPerBlock} tiles`
                  : `${plan.modules} ${level.layout?.tiled ? "tile" : "module"}${plan.modules === 1 ? "" : "s"}`}
              </strong>
              {level.layout?.tiled && plan.blocks > 1 && " (each block its own row, with one belt per ingredient)"}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {plan.machines.map((m) =>
                plan.fixed.includes(m.key) || doneKeys.includes(m.key) ? (
                  <Badge key={m.key} variant="outline" className="font-normal border-emerald-300 bg-emerald-50 text-emerald-800" title="Ticked off in the checklist">
                    <Check className="w-3 h-3 mr-1" />
                    {m.label}
                  </Badge>
                ) : (
                  <Badge key={m.key} variant="secondary" className="font-normal">
                    {m.label}
                  </Badge>
                )
              )}
            </div>
            {(plan.fixed.length > 0 || doneKeys.length > 0) && (
              <p className="text-xs text-emerald-800">
                <Check className="w-3 h-3 inline mr-0.5 align-[-1px]" />
                {plan.fixed.length > 0 ? "Built and in production: these counts stay as built." : "Ticked off in the checklist."}
              </p>
            )}
            <p className="text-xs text-slate-500">
              At{" "}
              {(Object.keys(TIER_LABELS) as UpgradeCategory[]).map((c) => `${TIER_LABELS[c]} ${tierLabel(tiers[c])}`).join(", ")}: a miner
              makes {machineRate("miner", tiers).toFixed(2)}/s, a painter {machineRate("painter", tiers).toFixed(2)}/s.
            </p>
          </div>
        )}
        {level.layout && (
          <div className="md:col-span-2">
            <LayoutDiagram layout={level.layout} caption={level.layout.caption ? fillCounts(level.layout.caption, plan) : undefined} />
          </div>
        )}
      </div>
    </details>
  );
}

/** A clock readout you can click to type over (m:ss or h:mm:ss). */
function EditableClock({ valueMs, onCommit, className, label }: { valueMs: number; onCommit: (ms: number) => void; className?: string; label: string }) {
  const [draft, setDraft] = useState<string | null>(null);

  if (draft === null) {
    return (
      <button
        type="button"
        className={cn("hover:underline decoration-dotted underline-offset-4", className)}
        onClick={() => setDraft(formatClock(valueMs))}
        title="Click to correct the time"
        aria-label={`${label}: ${formatClock(valueMs)}. Click to edit.`}
      >
        {formatClock(valueMs)}
      </button>
    );
  }

  const commit = () => {
    const ms = parseClock(draft);
    if (ms !== null) onCommit(ms);
    setDraft(null);
  };

  return (
    <input
      autoFocus
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setDraft(null);
      }}
      className={cn("bg-white border border-slate-300 rounded px-1 min-w-0 max-w-[10ch]", className)}
    />
  );
}
