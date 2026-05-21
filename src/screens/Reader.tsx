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
  const words = useMemo(() => tokenizeStory(story.paragraphs), [story]);

  const [speedWpm, setSpeedWpm] = useState(100);
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

  // Measure the rendered content height once after layout so we can calibrate
  // scroll rate to "words per second × pixels per word." This keeps the
  // highlighted word at a consistent on-screen position throughout the read,
  // even though the scroll is purely time-based and continuous.
  useLayoutEffect(() => {
    if (!scrollRef.current || totalWords === 0) return;
    const h = scrollRef.current.scrollHeight;
    setPxPerWord(h / totalWords);
  }, [story, totalWords]);

  const begin = useCallback(() => {
    setStarted(true);
    setPaused(false);
    startedAtRef.current = performance.now() - elapsedMs;
  }, [elapsedMs]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const willPause = !p;
      if (!willPause) {
        startedAtRef.current = performance.now() - elapsedMs;
      }
      return willPause;
    });
  }, [elapsedMs]);

  const elapsedRef = useRef(elapsedMs);
  useEffect(() => { elapsedRef.current = elapsedMs; }, [elapsedMs]);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const durationSec = Math.max(elapsedRef.current / 1000, 1);
    const wpm = (totalWords / durationSec) * 60;
    const result: SessionResult = {
      storyId: story.id,
      language: story.language,
      tier: story.tier,
      durationSec,
      totalWords,
      wpm,
      compCorrect: 0,
      compTotal: story.comprehension.length,
      timestamp: Date.now(),
    };
    onFinish(result);
  }, [totalWords, story, onFinish]);

  const handleFinishRef = useRef(handleFinish);
  useEffect(() => { handleFinishRef.current = handleFinish; }, [handleFinish]);

  // Smooth, constant-rate teleprompter loop. Scroll position is a linear
  // function of elapsed time; rate is calibrated so the highlight stays in the
  // same on-screen reading band throughout. The highlight word index advances
  // discretely per word interval.
  useEffect(() => {
    if (!started || paused || finishedRef.current) return;
    if (pxPerWord === 0) return; // wait for layout measurement
    let raf = 0;
    let canceled = false;
    // Base rate matches word advancement (highlight would stay at containerTop).
    // Add a modest over-scroll so text drifts upward through the viewport over
    // the read — gives the teleprompter eye-tracking feel.
    const OVERSCROLL = 1.22;
    const pxPerSec = (speedWpm / 60) * pxPerWord * OVERSCROLL;
    const tick = () => {
      if (canceled) return;
      const now = performance.now();
      const elapsed = now - (startedAtRef.current ?? now);
      const elapsedSec = elapsed / 1000;
      setElapsedMs(elapsed);

      const wordPosFloat = elapsedSec * (speedWpm / 60);
      const idx = Math.min(totalWords, Math.floor(wordPosFloat));
      setCurrentIdx(idx);

      if (idx >= totalWords) {
        handleFinishRef.current();
        return;
      }

      // Direct DOM write — bypassing React state for the per-frame transform
      // gives us frame-accurate smoothness without batching delays.
      const scrollPx = pxPerSec * elapsedSec;
      if (scrollRef.current) {
        scrollRef.current.style.transform = `translate(-50%, ${-scrollPx}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      canceled = true;
      cancelAnimationFrame(raf);
    };
  }, [started, paused, speedWpm, totalWords, pxPerWord]);

  const handleStop = () => {
    onExit();
  };

  const progressPct = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;

  return (
    <div className="reader" style={{ ['--story-accent' as any]: accent }}>
      <div className="reader__topbar">
        <button className="ghost" onClick={handleStop} aria-label="Exit reading">
          ← Stop
        </button>
        <div className="reader__center">
          <div className="reader__title">{story.emoji} {story.title}</div>
          <div className="reader__timer" aria-label="Timer">
            {formatClock(elapsedMs / 1000)}
          </div>
        </div>
        <div className="reader__controls">
          {started ? (
            <>
              <button onClick={handleFinish} title="Finish reading">
                ✓ Done
              </button>
              <button className="primary" onClick={togglePause}>
                {paused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </>
          ) : (
            <button className="primary" onClick={begin}>
              ▶ Start reading
            </button>
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

      <div className="reader__bottombar">
        <div className="reader__progress" aria-label="Progress">
          <div className="reader__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="reader__speed">
          <span aria-hidden="true">🐢</span>
          <input
            type="range"
            min={60}
            max={180}
            step={5}
            value={speedWpm}
            onChange={(e) => setSpeedWpm(Number(e.target.value))}
            aria-label="Reading speed"
          />
          <span aria-hidden="true">🐇</span>
        </div>
      </div>
    </div>
  );
}
