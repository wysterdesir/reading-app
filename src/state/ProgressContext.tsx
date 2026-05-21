import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Progress, SessionResult } from '../types';
import { loadProgress, saveProgress } from '../lib/storage';

interface Ctx {
  progress: Progress;
  recordSession: (r: SessionResult) => void;
  replaceProgress: (p: Progress) => void;
  resetProgress: () => void;
}

const ProgressCtx = createContext<Ctx | null>(null);

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(aISO: string, bISO: string): number {
  if (!aISO || !bISO) return Infinity;
  const a = new Date(aISO + 'T00:00:00');
  const b = new Date(bISO + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const recordSession = useCallback((r: SessionResult) => {
    setProgress((prev) => {
      const next: Progress = {
        ...prev,
        sessions: [...prev.sessions, r],
      };

      const prevBest = next.personalBests[r.storyId];
      if (!prevBest || r.wpm > prevBest.wpm) {
        next.personalBests = {
          ...next.personalBests,
          [r.storyId]: {
            wpm: r.wpm,
            durationSec: r.durationSec,
            ts: r.timestamp,
          },
        };
      }

      next.totalWordsRead = {
        ...next.totalWordsRead,
        [r.language]: next.totalWordsRead[r.language] + r.totalWords,
      };
      next.totalMinutesRead = {
        ...next.totalMinutesRead,
        [r.language]: next.totalMinutesRead[r.language] + r.durationSec / 60,
      };
      next.storiesCompleted = {
        ...next.storiesCompleted,
        [r.language]: next.storiesCompleted[r.language] + 1,
      };

      const today = todayISO();
      const last = next.streak.lastDateISO;
      if (last !== today) {
        const gap = daysBetween(last, today);
        if (last === '' || gap === 1) {
          next.streak = { ...next.streak, lastDateISO: today, days: next.streak.days + 1 };
        } else if (gap > 1) {
          if (next.streak.graceTokens > 0 && gap === 2) {
            next.streak = {
              lastDateISO: today,
              days: next.streak.days + 1,
              graceTokens: next.streak.graceTokens - 1,
            };
          } else {
            next.streak = {
              lastDateISO: today,
              days: 1,
              graceTokens: Math.min(2, next.streak.graceTokens + 1),
            };
          }
        }
      }

      return next;
    });
  }, []);

  const replaceProgress = useCallback((p: Progress) => setProgress(p), []);

  const resetProgress = useCallback(() => {
    setProgress({
      version: 1,
      sessions: [],
      personalBests: {},
      streak: { lastDateISO: '', days: 0, graceTokens: 2 },
      totalWordsRead: { en: 0, fr: 0, es: 0 },
      totalMinutesRead: { en: 0, fr: 0, es: 0 },
      storiesCompleted: { en: 0, fr: 0, es: 0 },
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ progress, recordSession, replaceProgress, resetProgress }),
    [progress, recordSession, replaceProgress, resetProgress]
  );

  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error('useProgress outside provider');
  return c;
}
