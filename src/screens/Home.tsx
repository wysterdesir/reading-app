import { useSettings } from '../state/SettingsContext';
import { useProgress } from '../state/ProgressContext';
import { LANGUAGES, THEMES, type Language } from '../types';

interface Props {
  onStart: () => void;
  onOpenParent: () => void;
}

export function Home({ onStart, onOpenParent }: Props) {
  const { settings, update } = useSettings();
  const { progress } = useProgress();

  const streak = progress.streak.days;
  const minutesAllLangs = (Object.values(progress.totalMinutesRead) as number[]).reduce(
    (a, b) => a + b,
    0
  );
  const storiesRead = (Object.values(progress.storiesCompleted) as number[]).reduce(
    (a, b) => a + b,
    0
  );
  const wordsRead = (Object.values(progress.totalWordsRead) as number[]).reduce(
    (a, b) => a + b,
    0
  );

  const milestones = [
    { id: 'first', label: 'First story', emoji: '📖', unlocked: storiesRead >= 1 },
    { id: 'three', label: '3 stories', emoji: '🌱', unlocked: storiesRead >= 3 },
    { id: 'ten', label: '10 stories', emoji: '🌳', unlocked: storiesRead >= 10 },
    { id: 'multi', label: 'All 3 languages', emoji: '🌍', unlocked:
        (Object.values(progress.storiesCompleted) as number[]).filter((n) => n > 0).length >= 3 },
    { id: 's3', label: '3-day streak', emoji: '🔥', unlocked: streak >= 3 },
    { id: 's7', label: '7-day streak', emoji: '✨', unlocked: streak >= 7 },
    { id: 'hour', label: '60 minutes read', emoji: '🎉', unlocked: minutesAllLangs >= 60 },
  ];

  const greeting = storiesRead === 0
    ? 'Welcome! Pick a story and read it out loud — I’ll follow along with you.'
    : 'Pick up where you left off, or try a new story.';

  return (
    <div className="screen stack">
      <div className="row between">
        <h1>📚 Story Reader</h1>
        <button className="icon ghost" onClick={onOpenParent} aria-label="Parent settings">
          ⚙
        </button>
      </div>

      <p className="muted" style={{ margin: 0, fontSize: '1.05rem' }}>
        {greeting}
      </p>

      <div className="card stack-sm">
        <div className="muted" style={{ fontSize: '0.85rem' }}>Today’s language</div>
        <div className="lang-pills">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={settings.language === l.code ? 'active' : ''}
              onClick={() => update({ language: l.code as Language })}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: '0.8rem' }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>Streak</div>
          <div className="streak" style={{ fontSize: '1.7rem' }}>
            <span>🔥</span> {streak} {streak === 1 ? 'day' : 'days'}
          </div>
          {progress.streak.graceTokens > 0 && streak > 0 && (
            <div className="muted" style={{ fontSize: '0.78rem' }}>
              {progress.streak.graceTokens} grace day{progress.streak.graceTokens === 1 ? '' : 's'} saved
            </div>
          )}
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>Stories read</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 600 }}>{storiesRead}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>Minutes</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 600 }}>{Math.round(minutesAllLangs)}</div>
        </div>
      </div>

      <div className="card stack-sm">
        <div className="muted" style={{ fontSize: '0.85rem' }}>Reading theme</div>
        <div className="lang-pills">
          {THEMES.map((t) => (
            <button
              key={t.name}
              className={settings.theme === t.name ? 'active' : ''}
              onClick={() => update({ theme: t.name })}
              title={t.hint}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack-sm">
        <div className="muted" style={{ fontSize: '0.85rem' }}>Badges earned</div>
        <div className="badge-row">
          {milestones.map((m) => (
            <div key={m.id} className={`badge ${m.unlocked ? '' : 'locked'}`}>
              <span style={{ fontSize: '1.2em' }}>{m.emoji}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="spacer" />

      <button
        className="primary"
        style={{ fontSize: '1.25rem', padding: '1em 1.4em' }}
        onClick={onStart}
      >
        Open a book →
      </button>
    </div>
  );
}
