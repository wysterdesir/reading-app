import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Settings } from '../types';
import { loadSettings, saveSettings } from '../lib/storage';

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  theme: Settings['theme'];
}

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      theme: settings.theme,
    }),
    [settings]
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsCtx);
  if (!c) throw new Error('useSettings outside provider');
  return c;
}
