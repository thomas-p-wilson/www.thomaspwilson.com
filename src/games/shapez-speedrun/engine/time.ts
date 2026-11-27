/** "m:ss" for durations under an hour, "h:mm:ss" beyond. Negative values get a leading "-". */
export function formatClock(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${sign}${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${sign}${m}:${ss}`;
}

/** "+0:12" / "-0:30": how far a split is behind (+) or ahead of (-) its target. */
export function formatDelta(ms: number): string {
  if (Math.abs(ms) < 1000) return "±0:00";
  return ms > 0 ? `+${formatClock(ms)}` : formatClock(ms);
}

/** Parses "m:ss" or "h:mm:ss" into milliseconds; returns null when the text isn't a valid time. */
export function parseClock(text: string): number | null {
  const parts = text.trim().split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  const [h, m, s] = nums.length === 3 ? nums : [0, nums[0], nums[1]];
  if (s >= 60 || (nums.length === 3 && m >= 60)) return null;
  return ((h * 60 + m) * 60 + s) * 1000;
}
