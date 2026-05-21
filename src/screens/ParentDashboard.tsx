import { useMemo, useState } from 'react';
import { useSettings } from '../state/SettingsContext';
import { useProgress } from '../state/ProgressContext';
import { exportProgressJson, importProgressJson } from '../lib/storage';
import { sha256 } from '../lib/hash';
import { generateQR } from '../lib/qr';
import { LANGUAGES, type Language, type Tier } from '../types';

interface Props {
  onBack: () => void;
}

export function ParentDashboard({ onBack }: Props) {
  const { settings } = useSettings();
  const [unlocked, setUnlocked] = useState(!settings.parentPinHash);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const tryUnlock = async () => {
    if (!settings.parentPinHash) {
      setUnlocked(true);
      return;
    }
    const h = await sha256(pinInput);
    if (h === settings.parentPinHash) {
      setUnlocked(true);
      setPinError(null);
    } else {
      setPinError('That PIN doesn’t match.');
    }
  };

  if (!unlocked) {
    return (
      <div className="screen stack">
        <div className="row between">
          <button className="ghost" onClick={onBack}>← Back</button>
          <h1 style={{ margin: 0 }}>Parent area</h1>
          <div style={{ width: 60 }} />
        </div>
        <div className="card stack-sm" style={{ maxWidth: 360, alignSelf: 'center', width: '100%' }}>
          <div style={{ fontWeight: 600 }}>Enter parent PIN</div>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            placeholder="••••"
          />
          {pinError && <div className="chip bad">{pinError}</div>}
          <button className="primary" onClick={tryUnlock}>Unlock</button>
        </div>
      </div>
    );
  }

  return <UnlockedDashboard onBack={onBack} />;
}

function UnlockedDashboard({ onBack }: Props) {
  const { settings, update } = useSettings();
  const { progress, replaceProgress, resetProgress } = useProgress();
  const [pinDraft, setPinDraft] = useState('');
  const [pinSet, setPinSet] = useState<string | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState(settings.anthropicApiKey ?? '');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const stats = useMemo(() => {
    const byLang: Record<Language, { sessions: number; minutes: number; words: number; avgWpm: number }> = {
      en: { sessions: 0, minutes: 0, words: 0, avgWpm: 0 },
      fr: { sessions: 0, minutes: 0, words: 0, avgWpm: 0 },
      es: { sessions: 0, minutes: 0, words: 0, avgWpm: 0 },
    };
    (['en', 'fr', 'es'] as Language[]).forEach((l) => {
      const sessions = progress.sessions.filter((s) => s.language === l);
      byLang[l].sessions = sessions.length;
      byLang[l].minutes = progress.totalMinutesRead[l];
      byLang[l].words = progress.totalWordsRead[l];
      if (sessions.length) {
        byLang[l].avgWpm = sessions.reduce((a, b) => a + b.wpm, 0) / sessions.length;
      }
    });
    return byLang;
  }, [progress]);

  const recent = useMemo(
    () => progress.sessions.slice(-10).reverse(),
    [progress.sessions]
  );

  const handleSetPin = async () => {
    if (pinDraft.length < 4) return;
    const h = await sha256(pinDraft);
    update({ parentPinHash: h });
    setPinSet('PIN saved.');
    setPinDraft('');
  };

  const handleClearPin = () => {
    update({ parentPinHash: undefined });
    setPinSet('PIN removed.');
  };

  const handleSaveApiKey = () => {
    update({ anthropicApiKey: apiKeyDraft.trim() || undefined });
    setImportMsg('API key saved.');
  };

  const handleExport = async () => {
    const txt = exportProgressJson(progress, settings);
    setExportText(txt);
    const dataUrl = await generateQR(txt);
    setQrDataUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!exportText) return;
    const blob = new Blob([exportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-app-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const result = importProgressJson(text);
    if (!result) {
      setImportMsg('That file doesn’t look right.');
      return;
    }
    replaceProgress(result.progress);
    if (result.settings) {
      update({
        language: result.settings.language ?? settings.language,
        theme: result.settings.theme ?? settings.theme,
        defaultSpeedWpm: result.settings.defaultSpeedWpm ?? settings.defaultSpeedWpm,
        maxSessionMinutes: result.settings.maxSessionMinutes ?? settings.maxSessionMinutes,
        ttsPreviewByDefault: result.settings.ttsPreviewByDefault ?? settings.ttsPreviewByDefault,
      });
    }
    setImportMsg('Imported ✓');
  };

  return (
    <div className="screen stack">
      <div className="row between">
        <button className="ghost" onClick={onBack}>← Back</button>
        <h1 style={{ margin: 0 }}>Parent area</h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="card stack-sm">
        <h2>Progress at a glance</h2>
        <dl className="kvs">
          {(Object.keys(stats) as Language[]).map((l) => (
            <div key={l} style={{ display: 'contents' }}>
              <dt>{LANGUAGES.find((x) => x.code === l)?.label}</dt>
              <dd>
                {stats[l].sessions} stories · {Math.round(stats[l].minutes)} min ·{' '}
                {stats[l].words} words · avg {Math.round(stats[l].avgWpm)} wpm
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card stack-sm">
        <h2>Recent sessions</h2>
        {recent.length === 0 && <div className="muted">No sessions yet.</div>}
        {recent.length > 0 && (
          <div className="stack-sm">
            {recent.map((s, i) => (
              <div key={i} className="row between" style={{ fontSize: '0.9rem' }}>
                <span>
                  {new Date(s.timestamp).toLocaleString()} ·{' '}
                  {LANGUAGES.find((l) => l.code === s.language)?.label} · tier {s.tier}
                </span>
                <span className="muted">
                  {Math.round(s.durationSec)}s · {Math.round(s.wpm)} wpm · comp {s.compCorrect}/{s.compTotal}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card stack-sm">
        <h2>Reading settings</h2>
        <div className="row" style={{ gap: '1.2rem', flexWrap: 'wrap' }}>
          <label className="stack-sm">
            <span className="muted" style={{ fontSize: '0.85rem' }}>Default speed (wpm)</span>
            <input
              type="number"
              min={60}
              max={180}
              value={settings.defaultSpeedWpm}
              onChange={(e) => update({ defaultSpeedWpm: Number(e.target.value) })}
            />
          </label>
          <label className="stack-sm">
            <span className="muted" style={{ fontSize: '0.85rem' }}>Max session (minutes)</span>
            <input
              type="number"
              min={5}
              max={60}
              value={settings.maxSessionMinutes}
              onChange={(e) => update({ maxSessionMinutes: Number(e.target.value) })}
            />
          </label>
          <label className="stack-sm">
            <span className="muted" style={{ fontSize: '0.85rem' }}>Difficulty override</span>
            <select
              value={settings.difficultyOverride ?? ''}
              onChange={(e) =>
                update({
                  difficultyOverride: e.target.value
                    ? (Number(e.target.value) as Tier)
                    : null,
                })
              }
            >
              <option value="">No override</option>
              <option value="1">Just starting</option>
              <option value="2">Stretching</option>
              <option value="3">Challenge</option>
            </select>
          </label>
        </div>
        <label className="row" style={{ gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={settings.ttsPreviewByDefault}
            onChange={(e) => update({ ttsPreviewByDefault: e.target.checked })}
          />
          <span>Show "hear a sample" preview on every story</span>
        </label>
      </div>

      <div className="card stack-sm">
        <h2>AI stories (optional)</h2>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Paste an Anthropic API key to enable "Make a new story" in the picker. The key is stored
          only in this browser's localStorage and sent only to api.anthropic.com.
        </p>
        <div className="row">
          <input
            type="password"
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            placeholder="sk-ant-…"
            style={{ flex: 1, minWidth: 200 }}
          />
          <button onClick={handleSaveApiKey}>Save key</button>
        </div>
      </div>

      <div className="card stack-sm">
        <h2>Parent PIN</h2>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Optional. Setting a PIN keeps these settings out of reach of curious fingers.
        </p>
        <div className="row">
          <input
            type="password"
            inputMode="numeric"
            value={pinDraft}
            onChange={(e) => setPinDraft(e.target.value)}
            placeholder="4+ digits"
          />
          <button onClick={handleSetPin}>Set PIN</button>
          {settings.parentPinHash && <button onClick={handleClearPin}>Remove PIN</button>}
        </div>
        {pinSet && <div className="chip good">{pinSet}</div>}
      </div>

      <div className="card stack-sm">
        <h2>Move progress to another device</h2>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Export progress as a JSON file or a QR code. On the other device, open Parent area and
          import the file.
        </p>
        <div className="row">
          <button onClick={handleExport}>Generate export</button>
          {exportText && <button onClick={handleDownload}>Download JSON</button>}
          <label>
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
              }}
            />
            <button
              onClick={(e) => {
                (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
              }}
            >
              Import JSON
            </button>
          </label>
        </div>
        {qrDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img src={qrDataUrl} alt="Progress QR" style={{ maxWidth: 280 }} />
          </div>
        )}
        {importMsg && <div className="chip">{importMsg}</div>}
      </div>

      <div className="card stack-sm">
        <h2>Danger zone</h2>
        <button
          onClick={() => {
            if (confirm('Erase all progress and personal bests? This cannot be undone.')) {
              resetProgress();
            }
          }}
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
