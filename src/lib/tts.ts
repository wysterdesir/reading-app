import type { Language } from '../types';

const BCP47: Record<Language, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
};

export function speak(text: string, language: Language, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP47[language];
    u.rate = rate;
    u.pitch = 1.0;
    const voice = pickVoice(synth, u.lang);
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

export function cancelSpeak() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function pickVoice(synth: SpeechSynthesis, lang: string): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices.length) return null;
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;
  const prefix = lang.split('-')[0];
  return voices.find((v) => v.lang.startsWith(prefix)) ?? null;
}
