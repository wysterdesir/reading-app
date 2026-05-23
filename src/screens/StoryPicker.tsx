import { useMemo, useState } from 'react';
import { storiesFor } from '../stories';
import { useSettings } from '../state/SettingsContext';
import { useProgress } from '../state/ProgressContext';
import { speak, cancelSpeak } from '../lib/tts';
import { generateStory } from '../lib/ai';
import { BookCover } from '../components/BookCover';
import { TIERS, type Story, type Tier } from '../types';

interface Props {
  onBack: () => void;
  onPick: (story: Story) => void;
}

function estimatedMinutes(wordCount: number, wpm = 80): string {
  const m = wordCount / wpm;
  if (m < 1.2) return '1 min';
  return `${Math.round(m)} min`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function StoryPicker({ onBack, onPick }: Props) {
  const { settings } = useSettings();
  const { progress } = useProgress();
  const [filterTier, setFilterTier] = useState<Tier | null>(settings.difficultyOverride);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiStories, setAiStories] = useState<Story[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const allStories = useMemo<Story[]>(
    () => [...aiStories, ...storiesFor(settings.language)],
    [aiStories, settings.language]
  );

  const filtered = useMemo(() => {
    const list = filterTier == null ? allStories : allStories.filter((s) => s.tier === filterTier);
    // Easiest tier on top, hardest at the bottom. Stable sort keeps current
    // intra-tier order (and AI-generated stories first within their tier).
    return [...list].sort((a, b) => a.tier - b.tier);
  }, [allStories, filterTier]);

  const shelves = useMemo(() => chunk(filtered, 3), [filtered]);

  const handlePreview = async (s: Story) => {
    if (previewing === s.id) {
      cancelSpeak();
      setPreviewing(null);
      return;
    }
    setPreviewing(s.id);
    await speak(s.paragraphs[0], s.language, 0.9);
    setPreviewing(null);
  };

  const handleGenerate = async () => {
    if (!settings.anthropicApiKey) {
      setAiError('Add an Anthropic API key in Parent settings first.');
      return;
    }
    setAiError(null);
    setGenerating(true);
    try {
      const s = await generateStory({
        apiKey: settings.anthropicApiKey,
        language: settings.language,
        tier: filterTier ?? 1,
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
        <h1 style={{ margin: 0 }}>The Bookshelf</h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="row" style={{ rowGap: '0.4rem' }}>
        <div className="lang-pills">
          <button className={filterTier == null ? 'active' : ''} onClick={() => setFilterTier(null)}>
            All books
          </button>
          {TIERS.map((t) => (
            <button
              key={t.tier}
              className={filterTier === t.tier ? 'active' : ''}
              onClick={() => setFilterTier(t.tier)}
            >
              <span className={`tier-dot t${t.tier}`} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bookshelf">
        {shelves.map((row, ri) => (
          <div className="shelf" key={ri}>
            <div className="shelf__books">
              {row.map((s) => {
                const best = progress.personalBests[s.id];
                const reads = progress.sessions.filter((x) => x.storyId === s.id).length;
                const accent = s.accent ?? 'var(--accent)';
                return (
                  <div
                    key={s.id}
                    className="book"
                    role="button"
                    tabIndex={0}
                    onClick={() => onPick(s)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(s)}
                  >
                    <div className="book__block" style={{ ['--accent' as any]: accent }}>
                      <div className="book__spine" />
                      <div className="book__cover">
                        <BookCover cover={s.cover} />
                        <div className="book__scrim" />
                        <div className="book__title">{s.title}</div>
                        {reads > 0 && <div className="book__ribbon" title="You have read this" />}
                      </div>
                      <div className="book__pages" />
                    </div>
                    <div className="book__stats">
                      <span className={`tier-dot t${s.tier}`} />
                      <span>{estimatedMinutes(s.wordCount)}</span>
                      <span className="dotsep">·</span>
                      <span>{s.wordCount} words</span>
                      {s.source === 'ai' && <span className="ai-tag">new</span>}
                    </div>
                    <div className="book__sub">
                      <button
                        className="ghost listen-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(s);
                        }}
                      >
                        {previewing === s.id ? '■ Stop' : '▸ Listen'}
                      </button>
                      {reads > 0 && (
                        <span className="muted">
                          Read {reads}×{best ? ` · best ${Math.round(best.wpm)} wpm` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="shelf__plank" />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="muted" style={{ textAlign: 'center' }}>No books in this section yet.</p>
        )}
      </div>

      {settings.anthropicApiKey && (
        <div className="card stack-sm">
          <div className="row between">
            <div>
              <div style={{ fontWeight: 600 }}>Want a brand-new story?</div>
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
