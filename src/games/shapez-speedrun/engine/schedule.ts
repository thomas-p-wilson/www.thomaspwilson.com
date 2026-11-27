// Catching up when behind: the remaining levels' targets are squeezed
// proportionally into the time left before a 29:00 deadline.
//
// - Only ever squeeze. Ahead of plan, the original targets stand, and the lead
//   is safety margin.
// - A small slip first spends the plan's buffer (it finishes at 27:30): the
//   remaining targets just shift later, keeping their lengths, until shifting
//   further would pass 29:00. From then on they get shorter.
// - The anchor is the last split. While the current level is overdue, the
//   levels after it are squeezed from the clock instead (in 15-second steps,
//   so counts don't change every second), as if it finished now.

/** Where a squeezed plan has to end, leaving a minute before the 30:00 achievement cut-off. */
export const SQUEEZE_DEADLINE_SECONDS = 29 * 60;
/** How often an overdue level re-squeezes the levels after it. */
export const RESQUEEZE_STEP_SECONDS = 15;
/** Never squeeze below this share of the planned time: past it, sub-30 is out of reach anyway. */
const MIN_FACTOR = 0.05;

export interface Schedule {
  /** Level → target in seconds. */
  targets: Record<number, number>;
  /** Share of the planned time the remaining levels get: 1 = on plan (or shifted into the buffer). */
  factor: number;
  /** Seconds the remaining levels have been pushed back by, before any squeeze. */
  slip: number;
  /** True when even the squeezed plan can't end by the deadline. */
  outOfReach: boolean;
}

/**
 * @param original targets in seconds, level 1 first
 * @param splitsMs level → finish time
 * @param nowMs the run clock
 * @param doneTargets level → the target it had when it was finished
 */
export function squeezedSchedule(
  original: number[],
  splitsMs: Record<number, number>,
  nowMs: number,
  doneTargets: Record<number, number> = {}
): Schedule {
  const last = original.length;
  const planEnd = original[last - 1];
  const orig = (level: number) => (level === 0 ? 0 : original[level - 1]);

  let done = 0;
  while (splitsMs[done + 1] !== undefined) done++;

  const targets: Record<number, number> = {};
  for (let level = 1; level <= done; level++) targets[level] = doneTargets[level] ?? orig(level);

  let factor = 1;
  let slip = 0;
  let outOfReach = false;

  /** Lays out levels from..last after an anchor: real time `at` standing in for planned time `planned`. */
  const layOut = (from: number, at: number, planned: number) => {
    const behind = at - planned;
    if (behind <= 0) {
      for (let level = from; level <= last; level++) targets[level] = orig(level);
      factor = 1;
      slip = 0;
      return;
    }
    const plannedLeft = planEnd - planned;
    const raw = plannedLeft > 0 ? (SQUEEZE_DEADLINE_SECONDS - at) / plannedLeft : 1;
    factor = Math.max(MIN_FACTOR, Math.min(1, raw));
    outOfReach = raw <= MIN_FACTOR || at >= SQUEEZE_DEADLINE_SECONDS;
    slip = behind;
    for (let level = from; level <= last; level++) targets[level] = at + (orig(level) - planned) * factor;
  };

  if (done >= last) return { targets, factor: 1, slip: 0, outOfReach: false };

  layOut(done + 1, done > 0 ? splitsMs[done] / 1000 : 0, orig(done));

  // Overdue: the current level keeps its target, the ones after it squeeze from the clock.
  const current = done + 1;
  const now = Math.floor(nowMs / 1000 / RESQUEEZE_STEP_SECONDS) * RESQUEEZE_STEP_SECONDS;
  if (now > targets[current] && current < last) {
    const currentTarget = targets[current];
    layOut(current + 1, now, orig(current));
    targets[current] = currentTarget;
  }

  return { targets, factor, slip, outOfReach };
}
