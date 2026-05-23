/**
 * Soft chime played at story-end. Three ascending sine notes (C-major
 * triad) with quick attack and slow decay — calming, glockenspiel-like.
 * Generated via Web Audio API so no asset to load.
 *
 * Browsers require a user gesture before AudioContext can produce sound.
 * Call `unlockAudio()` from a click handler (e.g. Start button) before the
 * first call to `playChime()`.
 */

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function unlockAudio() {
  ensureCtx();
}

export function playChime() {
  const c = ensureCtx();
  if (!c) return;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const now = c.currentTime;
  notes.forEach((freq, i) => {
    const t = now + i * 0.15;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + 1.4);
    osc.start(t);
    osc.stop(t + 1.5);
  });
}
