import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';

type Progress = Record<string, Set<string>>; // topicId → secțiuni parcurse
type Ctx = {
  online: boolean;
  progress: Progress;
  isDone: (topicId: string, section: string) => boolean;
  setDone: (topicId: string, section: string, done: boolean) => void;
  bookmarks: Set<string>;
  toggleBookmark: (topicId: string) => void;
  settings: Record<string, any>;
  saveSettings: (s: Record<string, unknown>) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  statsVersion: number;
  bumpStats: () => void;
};
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const online = true; // fără backend: datele sunt locale
  const [progress, setProgress] = useState<Progress>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<Record<string, any>>({ dailyGoal: 20 });
  const [statsVersion, setStatsVersion] = useState(0);
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => (document.documentElement.dataset.theme as any) || 'dark');

  useEffect(() => {
    api.progress().then((rows) => {
      const p: Progress = {};
      for (const r of rows) (p[r.topicId] ??= new Set()).add(r.section);
      setProgress(p);
    }).catch(() => {});
    api.bookmarks().then((b) => setBookmarks(new Set(b.map((x) => x.topicId)))).catch(() => {});
    api.settings().then((s) => setSettings((d) => ({ ...d, ...s }))).catch(() => {});
  }, []);

  // timp de studiu: ping la fiecare minut cât pagina e vizibilă și utilizatorul a interacționat recent
  useEffect(() => {
    let last = Date.now();
    const mark = () => { last = Date.now(); };
    ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const t = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - last < 90_000) api.ping().catch(() => {});
    }, 60_000);
    return () => { clearInterval(t); ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.removeEventListener(e, mark)); };
  }, []);

  const setDone = useCallback((topicId: string, section: string, done: boolean) => {
    setProgress((p) => {
      const s = new Set(p[topicId] ?? []);
      if (done) s.add(section); else s.delete(section);
      return { ...p, [topicId]: s };
    });
    api.setProgress(topicId, section, done).catch(() => {});
  }, []);

  const toggleBookmark = useCallback((topicId: string) => {
    setBookmarks((b) => {
      const n = new Set(b); const on = !n.has(topicId);
      if (on) n.add(topicId); else n.delete(topicId);
      api.bookmark(topicId, on).catch(() => {});
      return n;
    });
  }, []);

  const saveSettings = useCallback((s: Record<string, unknown>) => {
    setSettings((d) => ({ ...d, ...s }));
    api.saveSettings(s).catch(() => {});
  }, []);

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* ignoră */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0e0e0f' : '#fff5f4');
  }, []);

  const value = useMemo<Ctx>(() => ({
    online, progress, isDone: (t, s) => !!progress[t]?.has(s), setDone, bookmarks, toggleBookmark, settings, saveSettings,
    theme, setTheme, statsVersion, bumpStats: () => setStatsVersion((v) => v + 1),
  }), [online, progress, setDone, bookmarks, toggleBookmark, settings, saveSettings, theme, setTheme, statsVersion]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useStore = () => {
  const c = useContext(C);
  if (!c) throw new Error('StoreProvider lipsă');
  return c;
};
