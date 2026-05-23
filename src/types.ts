export type Language = 'en' | 'fr' | 'es';
export type Tier = 0 | 1 | 2 | 3;
export type ThemeName = 'cream' | 'light' | 'night' | 'contrast';

export interface CompQuestion {
  q: string;
  options: string[];
  correctIndex: number;
}

export interface Story {
  id: string;
  language: Language;
  tier: Tier;
  title: string;
  paragraphs: string[];
  wordCount: number;
  comprehension: CompQuestion[];
  cover: string;
  accent?: string;
  source?: 'bundled' | 'ai';
}

export interface SessionResult {
  storyId: string;
  language: Language;
  tier: Tier;
  durationSec: number;
  totalWords: number;
  wpm: number;
  compCorrect: number;
  compTotal: number;
  timestamp: number;
}

export interface PersonalBest {
  wpm: number;
  durationSec: number;
  ts: number;
}

export interface StreakState {
  lastDateISO: string;
  days: number;
  graceTokens: number;
}

export interface Progress {
  version: 1;
  sessions: SessionResult[];
  personalBests: Record<string, PersonalBest>;
  streak: StreakState;
  totalWordsRead: Record<Language, number>;
  totalMinutesRead: Record<Language, number>;
  storiesCompleted: Record<Language, number>;
  favorites: string[];
}

export interface Settings {
  version: 1;
  language: Language;
  theme: ThemeName;
  defaultSpeedWpm: number;
  maxSessionMinutes: number;
  parentPinHash?: string;
  anthropicApiKey?: string;
  difficultyOverride: Tier | null;
  ttsPreviewByDefault: boolean;
  weeklyGoalMinutes: number;
  soundEnabled: boolean;
  childName?: string;
}

export const LANGUAGES: { code: Language; label: string; native: string; bcp47: string }[] = [
  { code: 'en', label: 'English', native: 'English', bcp47: 'en-US' },
  { code: 'fr', label: 'French', native: 'Français', bcp47: 'fr-FR' },
  { code: 'es', label: 'Spanish', native: 'Español', bcp47: 'es-ES' },
];

export const THEMES: { name: ThemeName; label: string; hint: string }[] = [
  { name: 'cream', label: 'Cream Page', hint: 'Warm paper — best for long sessions' },
  { name: 'light', label: 'Soft Light', hint: 'Bright but easy on the eyes' },
  { name: 'night', label: 'Night Reader', hint: 'For evening reading' },
  { name: 'contrast', label: 'High Contrast', hint: 'Maximum legibility' },
];

export const TIERS: { tier: Tier; label: string }[] = [
  { tier: 0, label: 'First words' },
  { tier: 1, label: 'Just starting' },
  { tier: 2, label: 'Stretching' },
  { tier: 3, label: 'Challenge' },
];
