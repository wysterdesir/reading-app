import type { Progress, Settings, Language } from '../types';

const PROGRESS_KEY = 'reading-app:progress:v1';
const SETTINGS_KEY = 'reading-app:settings:v1';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Progress;
      return ensureProgressShape(p);
    }
  } catch {
    /* fall through */
  }
  return ensureProgressShape({} as Progress);
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore quota errors */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Settings;
      return ensureSettingsShape(s);
    }
  } catch {
    /* fall through */
  }
  return ensureSettingsShape({} as Settings);
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function ensureProgressShape(p: Partial<Progress>): Progress {
  const langs: Language[] = ['en', 'fr', 'es'];
  const totalWordsRead: Record<Language, number> = { en: 0, fr: 0, es: 0 };
  const totalMinutesRead: Record<Language, number> = { en: 0, fr: 0, es: 0 };
  const storiesCompleted: Record<Language, number> = { en: 0, fr: 0, es: 0 };
  langs.forEach((l) => {
    totalWordsRead[l] = p.totalWordsRead?.[l] ?? 0;
    totalMinutesRead[l] = p.totalMinutesRead?.[l] ?? 0;
    storiesCompleted[l] = p.storiesCompleted?.[l] ?? 0;
  });
  return {
    version: 1,
    sessions: p.sessions ?? [],
    personalBests: p.personalBests ?? {},
    streak: p.streak ?? { lastDateISO: '', days: 0, graceTokens: 2 },
    totalWordsRead,
    totalMinutesRead,
    storiesCompleted,
  };
}

function ensureSettingsShape(s: Partial<Settings>): Settings {
  return {
    version: 1,
    language: s.language ?? 'en',
    theme: s.theme ?? 'cream',
    defaultSpeedWpm: s.defaultSpeedWpm ?? 100,
    maxSessionMinutes: s.maxSessionMinutes ?? 20,
    parentPinHash: s.parentPinHash,
    anthropicApiKey: s.anthropicApiKey,
    difficultyOverride: s.difficultyOverride ?? null,
    ttsPreviewByDefault: s.ttsPreviewByDefault ?? true,
  };
}

export function exportProgressJson(p: Progress, s: Settings): string {
  return JSON.stringify(
    {
      kind: 'reading-app-export',
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: p,
      settings: { ...s, parentPinHash: undefined, anthropicApiKey: undefined },
    },
    null,
    2
  );
}

export function importProgressJson(text: string): { progress: Progress; settings?: Partial<Settings> } | null {
  try {
    const parsed = JSON.parse(text);
    if (parsed.kind !== 'reading-app-export') return null;
    return {
      progress: ensureProgressShape(parsed.progress ?? {}),
      settings: parsed.settings,
    };
  } catch {
    return null;
  }
}
