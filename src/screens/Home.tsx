import { useSettings } from '../state/SettingsContext';
import { useProgress } from '../state/ProgressContext';
import { Logo } from '../components/Logo';
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

  const milestones = [
    { id: 'first', label: 'First story', unlocked: storiesRead >= 1 },
    { id: 'three', label: '3 stories', unlocked: storiesRead >= 3 },
    { id: 'ten', label: '10 stories', unlocked: storiesRead >= 10 },
    {
      id: 'multi',
      label: 'All 3 languages',
      unlocked:
        (Object.values(progress.storiesCompleted) as number[]).filter((n) => n > 0).length >= 3,
    },
    { id: 's3', label: '3-day streak', unlocked: streak >= 3 },
    { id: 's7', label: '7-day streak', unlocked: streak >= 7 },
    { id: 'hour', label: '60 minutes read', unlocked: minutesAllLangs >= 60 },
  ];
  const earned = milestones.filter((m) => m.unlocked).length;

  const greeting =
    storiesRead === 0
      ? 'Welcome. Pick a book and read it out loud — the words light up as you go.'
      : 'Pick up where you left off, or open a new book.';

  return (
    <div className="screen stack">
      <div className="row between">
        <div className="row" style={{ gap: '0.7rem' }}>
          <Logo size={48} />
          <h1 style={{ margin: 0 }}>Starator Reader</h1>
        </div>
        <button className="icon ghost" onClick={onOpenParent} aria-label="Parent settings">
          ⚙
        </button>
      </div>

      <p className="muted" style={{ margin: 0, fontSize: '1.05rem' }}>{greeting}</p>

      <div className="card stack-sm">
        <div className="muted" style={{ fontSize: '0.85rem' }}>Today's language</div>
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
        <div className="card stat-card">
          <div className="muted stat-label">Streak</div>
          <div className="stat-value">{streak}</div>
          <div className="muted stat-unit">{streak === 1 ? 'day' : 'days'} in a row</div>
        </div>
        <div className="card stat-card">
          <div className="muted stat-label">Stories read</div>
          <div className="stat-value">{storiesRead}</div>
          <div className="muted stat-unit">all languages</div>
        </div>
        <div className="card stat-card">
          <div className="muted stat-label">Minutes</div>
          <div className="stat-value">{Math.round(minutesAllLangs)}</div>
          <div className="muted stat-unit">time reading</div>
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
        <div className="muted" style={{ fontSize: '0.85rem' }}>
          Badges — {earned} of {milestones.length} earned
        </div>
        <div className="badge-row">
          {milestones.map((m) => (
            <div key={m.id} className={`badge ${m.unlocked ? 'earned' : 'locked'}`}>
              {m.label}
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
        Go to the bookshelf →
      </button>
    </div>
  );
}
