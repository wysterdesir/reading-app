import type { Language, Story } from '../types';
import { enStories } from './en';
import { frStories } from './fr';
import { esStories } from './es';

export const BUNDLED: Record<Language, Story[]> = {
  en: enStories,
  fr: frStories,
  es: esStories,
};

export function storiesFor(language: Language): Story[] {
  return BUNDLED[language];
}

export function findStory(id: string): Story | undefined {
  for (const lang of Object.keys(BUNDLED) as Language[]) {
    const hit = BUNDLED[lang].find((s) => s.id === id);
    if (hit) return hit;
  }
  return undefined;
}
