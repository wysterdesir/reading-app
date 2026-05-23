import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { SessionResult, Story } from '../types';
import { tokenizeStory } from '../lib/words';
import { useSettings } from '../state/SettingsContext';
import { playChime, unlockAudio } from '../lib/sound';

interface Props {
  story: Story;
  onFinish: (r: SessionResult) => void;
  onExit: () => void;
}

function formatClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function Reader({ story, onFinish, onExit }: Props) {
  const { settings } = useSettings();
  const words = useMemo(() => tokenizeStory(story.paragraphs), [story]);

  const [speedWpm, setSpeedWpm] = useState(settings.defaultSpeedWpm);
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pxPerWord, setPxPerWord] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const totalWords = words.length;
  const accent = story.accent ?? 'var(--accent)';

  useLayoutEffect(() => {
    if (!scrollRef.current || totalWords === 0) return;
    setPxPerWord(scrollRef.current.scrollHeight / totalWords);
  }, [story, totalWords]);

  const begin = useCallback(() => {
    // Unlock the AudioContext now — browsers require a user gesture before
    // any sound can play. The chime at story end will then be allowed.
    if (settings.soundEnabled) unlockAudio();
    setStarted(true);
    setPaused(false);
    startedAtRef.current = performance.now() - elapsedMs;
  }, [elapsedMs, settings.soundEnabled]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const willPause = !p;
      if (!willPause) startedAtRef.current = performance.now() - elapsedMs;
      return willPause;
    });
  }, [elapsedMs]);

  const elapsedRef = useRef(elapsedMs);
  useEffect(() => { elapsedRef.current = elapsedMs; }, [elapsedMs]);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (settings.soundEnabled) playChime();
    const durationSec = Math.max(elapsedRef.current / 1000, 1);
    const wpm = (totalWords / durationSec) * 60;
    onFinish({
      storyId: story.id,
      language: story.language,
      tier: story.tier,
      durationSec,
      totalWords,
      wpm,
      compCorrect: 0,
      compTotal: story.comprehension.length,
      timestamp: Date.now(),
    });
  }, [totalWords, story, onFinish, settings.soundEnabled]);

  const handleFinishRef = useRef(handleFinish);
  useEffect(() => { handleFinishRef.current = handleFinish; }, [handleFinish]);

  // Smooth, constant-rate teleprompter loop.
  useEffect(() => {
    if (!started || paused || finishedRef.current) return;
    if (pxPerWord === 0) return;
    let raf = 0;
    let canceled = false;
    const OVERSCROLL = 1.22;
    const pxPerSec = (speedWpm / 60) * pxPerWord * OVERSCROLL;
    const tick = () => {
      if (canceled) return;
      const now = performance.now();
      const elapsed = now - (startedAtRef.current ?? now);
      const elapsedSec = elapsed / 1000;
      setElapsedMs(elapsed);

      const idx = Math.min(totalWords, Math.floor(elapsedSec * (speedWpm / 60)));
      setCurrentIdx(idx);
      if (idx >= totalWords) {
        handleFinishRef.current();
        return;
      }
      if (scrollRef.current) {
        scrollRef.current.style.transform = `translate(-50%, ${-(pxPerSec * elapsedSec)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { canceled = true; cancelAnimationFrame(raf); };
  }, [started, paused, speedWpm, totalWords, pxPerWord]);

  const progressPct = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;

  return (
    <div className="reader" style={{ ['--story-accent' as any]: accent }}>
      <div className="reader__topbar">
        <button className="ghost" onClick={onExit} aria-label="Exit reading">
          ← Stop
        </button>
        <div className="reader__center">
          <div className="reader__title">{story.title}</div>
          <div className="reader__timer" aria-label="Timer">
            {formatClock(elapsedMs / 1000)}
          </div>
        </div>
        <div className="reader__controls">
          {started && (
            <button onClick={handleFinish} title="Finish reading">Done</button>
          )}
        </div>
      </div>

      <div className="reader__viewport" ref={viewportRef}>
        <div className="reader__scroll" ref={scrollRef}>
          {story.paragraphs.map((_, pi) => {
            const tokensInPara = words.filter((w) => w.paragraphIndex === pi);
            return (
              <p key={pi}>
                {tokensInPara.map((tw) => {
                  const idx = words.findIndex(
                    (w) =>
                      w.paragraphIndex === tw.paragraphIndex &&
                      w.indexInParagraph === tw.indexInParagraph
                  );
                  const state =
                    idx === currentIdx ? 'is-current'
                      : idx < currentIdx ? 'is-read'
                      : '';
                  return (
                    <span
                      key={`${pi}-${tw.indexInParagraph}`}
                      ref={(el) => { wordRefs.current[idx] = el; }}
                      className={`word ${state}`}
                    >
                      {tw.raw}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
          <p className="reader__end">✦ The End ✦</p>
        </div>
      </div>

      {/* Vertical progress bar — right edge */}
      <div className="reader__vprogress" aria-label="Progress through the story">
        <div className="reader__vprogress-fill" style={{ height: `${progressPct}%` }} />
      </div>

      {/* Right-edge action FAB — Start / Pause / Resume all share the same spot */}
      {!started && (
        <button className="reader__fab is-start" onClick={begin} aria-label="Start reading">
          <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true">
            <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
          </svg>
        </button>
      )}
      {started && !paused && (
        <button className="reader__fab is-pause" onClick={togglePause} aria-label="Pause">
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
            <rect x="5" y="4" width="5" height="16" rx="2" fill="currentColor" />
            <rect x="14" y="4" width="5" height="16" rx="2" fill="currentColor" />
          </svg>
        </button>
      )}
      {started && paused && (
        <div className="reader__paused" onClick={togglePause}>
          <button className="reader__fab is-resume" aria-label="Resume reading">
            <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true">
              <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
            </svg>
          </button>
          <div className="reader__paused-label">Paused — tap to keep reading</div>
        </div>
      )}

      <div className="reader__bottombar">
        <div className="reader__speed">
          <span>Slower</span>
          <input
            type="range"
            min={30}
            max={160}
            step={5}
            value={speedWpm}
            onChange={(e) => setSpeedWpm(Number(e.target.value))}
            aria-label="Reading speed"
          />
          <span>Faster</span>
        </div>
      </div>
    </div>
  );
}
