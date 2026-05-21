import { useMemo, useState } from 'react';
import { storiesFor } from '../stories';
import { useSettings } from '../state/SettingsContext';
import { useProgress } from '../state/ProgressContext';
import { speak, cancelSpeak } from '../lib/tts';
import { generateStory } from '../lib/ai';
import type { Story, Tier } from '../types';

interface Props {
  onBack: () => void;
  onPick: (story: Story) => void;
}

function estimatedMinutes(wordCount: number, wpm = 95): string {
  const m = wordCount / wpm;
  if (m < 1) return '<1 min';
  return `${Math.round(m)} min`;
}

export function StoryPicker({ onBack, onPick }: Props) {
  const { settings } = useSettings();
  const { progress } = useProgress();
  const [filterTier, setFilterTier] = useState<Tier | null>(settings.difficultyOverride);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiStories, setAiStories] = useState<Story[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const allStories = useMemo<Story[]>(() => {
    return [...aiStories, ...storiesFor(settings.language)];
  }, [aiStories, settings.language]);

  const filtered = useMemo(
    () => (filterTier ? allStories.filter((s) => s.tier === filterTier) : allStories),
    [allStories, filterTier]
  );

  const handlePreview = async (s: Story) => {
    if (previewing === s.id) {
      cancelSpeak();
      setPreviewing(null);
      return;
    }
    setPreviewing(s.id);
    const sample = s.paragraphs[0];
    await speak(sample, s.language, 0.9);
    setPreviewing(null);
  };

  const handleGenerate = async () => {
    if (!settings.anthropicApiKey) {
      setAiError('Add an Anthropic API key in Parent settings first.');
      return;
    }
    const tier = filterTier ?? 2;
    setAiError(null);
    setGenerating(true);
    try {
      const s = await generateStory({
        apiKey: settings.anthropicApiKey,
        language: settings.language,
        tier,
      });
      setAiStories((prev) => [s, ...prev]);
    } catch (e: any) {
      setAiError(e?.message ?? 'AI request failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="screen stack">
      <div className="row between">
        <button className="ghost" onClick={onBack}>← Back</button>
        <h1 style={{ margin: 0 }}>Pick a story</h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="row">
        <span className="muted">Difficulty:</span>
        <div className="lang-pills">
          <button className={filterTier == null ? 'active' : ''} onClick={() => setFilterTier(null)}>
            All
          </button>
          <button className={filterTier === 1 ? 'active' : ''} onClick={() => setFilterTier(1)}>
            <span className="tier-dot t1" /> Just starting
          </button>
          <button className={filterTier === 2 ? 'active' : ''} onClick={() => setFilterTier(2)}>
            <span className="tier-dot t2" /> Stretching
          </button>
          <button className={filterTier === 3 ? 'active' : ''} onClick={() => setFilterTier(3)}>
            <span className="tier-dot t3" /> Challenge
          </button>
        </div>
      </div>

      <div className="story-grid">
        {filtered.map((s) => {
          const best = progress.personalBests[s.id];
          const reads = progress.sessions.filter((sess) => sess.storyId === s.id).length;
          const accent = s.accent ?? 'var(--accent)';
          return (
            <div
              key={s.id}
              className="story-card"
              role="button"
              tabIndex={0}
              onClick={() => onPick(s)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(s)}
              style={{ borderLeftColor: accent }}
            >
              <div className="story-card__top">
                <span className="story-card__emoji" aria-hidden="true">{s.emoji ?? '📖'}</span>
                <div>
                  <div className="story-card__title">{s.title}</div>
                  <div className="story-card__meta">
                    <span className={`tier-dot t${s.tier}`} />
                    <span>{estimatedMinutes(s.wordCount)}</span>
                    <span>·</span>
                    <span>{s.wordCount} words</span>
                    {s.source === 'ai' && <span style={{ color: 'var(--accent)' }}>· ✨ AI</span>}
                  </div>
                </div>
              </div>
              <div className="row" style={{ marginTop: '0.5rem' }}>
                <button
                  className="ghost"
                  style={{ fontSize: '0.8rem', padding: '0.3em 0.7em' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(s);
                  }}
                >
                  {previewing === s.id ? '⏸ Stop' : '🔊 Hear a sample'}
                </button>
                {reads > 0 && (
                  <span className="story-card__best">
                    Read {reads} {reads === 1 ? 'time' : 'times'}
                  </span>
                )}
              </div>
              {best && (
                <div className="story-card__best">
                  ⭐ Fastest: {Math.round(best.wpm)} wpm
                </div>
              )}
            </div>
          );
        })}
      </div>

      {settings.anthropicApiKey && (
        <div className="card stack-sm">
          <div className="row between">
            <div>
              <div style={{ fontWeight: 600 }}>✨ Want a brand-new story?</div>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                I'll write one just for today, at your chosen difficulty.
              </div>
            </div>
            <button className="primary" disabled={generating} onClick={handleGenerate}>
              {generating ? 'Writing…' : 'Make a new story'}
            </button>
          </div>
          {aiError && <div className="chip bad">{aiError}</div>}
        </div>
      )}
    </div>
  );
}
