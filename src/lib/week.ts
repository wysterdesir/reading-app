import type { Progress } from '../types';

/** Start-of-week (Monday 00:00 local time) as a unix timestamp in ms. */
export function getWeekStartTs(d: Date = new Date()): number {
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

export function getMinutesThisWeek(progress: Progress): number {
  const start = getWeekStartTs();
  return progress.sessions
    .filter((s) => s.timestamp >= start)
    .reduce((sum, s) => sum + s.durationSec / 60, 0);
}
