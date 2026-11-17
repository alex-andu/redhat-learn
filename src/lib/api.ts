// Persistență locală (localStorage). Platforma nu are backend: toate datele rămân în browserul celui care învață.
// Interfața async păstrează forma din CCNA Learn, ca paginile și componentele reutilizate să rămână neschimbate.
import { localDay } from './day';

export type Stats = {
  totals: { total: number; correct: number };
  perTopic: { topicId: string; total: number; correct: number }[];
  perQuestion: { questionId: string; total: number; correct: number; lastCorrect: number }[];
  days: { day: string; questions: number; correct: number; minutes: number }[];
  exams: { id: number; config: any; total: number; correct: number; durationS: number; ts: string }[];
  streak: number;
  bestStreak: number;
  today: { day: string; questions: number; correct: number; minutes: number } | null;
};

export type SrsRow = { id: string; kind: string; ref: string; card: any; due: string; updated: string };

/** Bife de autoevaluare ale criteriilor de laborator: DECLARATE de cel care învață, nu verificate de platformă. */
export type LabChecks = Record<string, Record<string, boolean>>; // labId → criteriu → bifat

export type SimulationResult = {
  id: number; ts: string; simId: string;
  autoCorrect: number; autoTotal: number;   // scor automat (doar întrebări cu răspuns în platformă)
  selfChecked: number; selfTotal: number;   // autoevaluare declarată (task-uri practice)
  durationS: number;
};

type Attempt = { questionId: string; topicId: string; mode: string; correct: boolean; day: string };
type Db = {
  v: 1;
  progress: Record<string, string[]>;
  attempts: Attempt[];
  days: Record<string, { questions: number; correct: number; minutes: number }>;
  exams: Stats['exams'];
  srs: Record<string, SrsRow>;
  notes: Record<string, { body: string; updated: string }>;
  bookmarks: string[];
  settings: Record<string, any>;
  labChecks: LabChecks;
  labSteps: Record<string, boolean>;
  simulations: SimulationResult[];
};

export const STORAGE_KEY = 'rhcsa-learn:v1';
const empty = (): Db => ({ v: 1, progress: {}, attempts: [], days: {}, exams: [], srs: {}, notes: {}, bookmarks: [], settings: {}, labChecks: {}, labSteps: {}, simulations: [] });

let mem: Db | null = null;
function load(): Db {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.v === 1) { mem = { ...empty(), ...p }; return mem!; }
    }
  } catch { /* stocare indisponibilă: lucrăm în memorie */ }
  mem = empty();
  return mem;
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mem)); } catch { /* ignoră */ }
}
const ok = <T,>(v: T): Promise<T> => Promise.resolve(v);
const day0 = () => ({ questions: 0, correct: 0, minutes: 0 });

function streaks(days: Db['days']) {
  const active = new Set(Object.entries(days).filter(([, v]) => v.questions > 0 || v.minutes > 0).map(([d]) => d));
  let cur = 0;
  const d = new Date();
  if (!active.has(localDay(d))) d.setDate(d.getDate() - 1);
  while (active.has(localDay(d))) { cur++; d.setDate(d.getDate() - 1); }
  let best = 0, run = 0, prev: string | null = null;
  for (const k of [...active].sort()) {
    run = prev && localDay(new Date(new Date(prev).getTime() + 86400000)) === k ? run + 1 : 1;
    best = Math.max(best, run); prev = k;
  }
  return { streak: cur, bestStreak: Math.max(best, cur) };
}

export const api = {
  progress: () => ok(Object.entries(load().progress).flatMap(([topicId, secs]) => secs.map((section) => ({ topicId, section, doneAt: '' })))),
  setProgress: (topicId: string, section: string, done: boolean) => {
    const db = load(); const s = new Set(db.progress[topicId] ?? []);
    if (done) s.add(section); else s.delete(section);
    db.progress[topicId] = [...s]; save(); return ok(undefined);
  },
  attempt: (a: { questionId: string; topicId: string; mode: string; correct: boolean; answer?: unknown }) => {
    const db = load(); const day = localDay();
    db.attempts.push({ questionId: a.questionId, topicId: a.topicId, mode: a.mode, correct: a.correct, day });
    if (db.attempts.length > 5000) db.attempts.splice(0, db.attempts.length - 5000);
    const d = (db.days[day] ??= day0()); d.questions++; if (a.correct) d.correct++;
    save(); return ok(undefined);
  },
  ping: () => { const db = load(); (db.days[localDay()] ??= day0()).minutes++; save(); return ok(undefined); },
  stats: (): Promise<Stats> => {
    const db = load();
    const topic = new Map<string, { total: number; correct: number }>();
    const quest = new Map<string, { total: number; correct: number; lastCorrect: number }>();
    for (const a of db.attempts) {
      const t = topic.get(a.topicId) ?? { total: 0, correct: 0 }; t.total++; if (a.correct) t.correct++; topic.set(a.topicId, t);
      const q = quest.get(a.questionId) ?? { total: 0, correct: 0, lastCorrect: 0 }; q.total++; if (a.correct) q.correct++; q.lastCorrect = a.correct ? 1 : 0; quest.set(a.questionId, q);
    }
    const days = Object.entries(db.days).map(([day, v]) => ({ day, ...v })).sort((a, b) => a.day.localeCompare(b.day));
    const total = db.attempts.length; const correct = db.attempts.filter((a) => a.correct).length;
    const today = db.days[localDay()];
    return ok({
      totals: { total, correct },
      perTopic: [...topic].map(([topicId, v]) => ({ topicId, ...v })),
      perQuestion: [...quest].map(([questionId, v]) => ({ questionId, ...v })),
      days, exams: [...db.exams].reverse(), ...streaks(db.days),
      today: today ? { day: localDay(), ...today } : null,
    });
  },
  saveExam: (e: { config: unknown; total: number; correct: number; durationS: number; details?: unknown }) => {
    const db = load();
    db.exams.push({ id: Date.now(), config: e.config, total: e.total, correct: e.correct, durationS: e.durationS, ts: new Date().toISOString() });
    save(); return ok(undefined);
  },
  srsCards: (kind?: string) => ok(Object.values(load().srs).filter((r) => !kind || r.kind === kind)),
  putSrs: (id: string, row: { kind: string; ref: string; card: any; rating?: number }) => {
    load().srs[id] = { id, kind: row.kind, ref: row.ref, card: row.card, due: new Date(row.card.due).toISOString(), updated: new Date().toISOString() };
    save(); return ok(undefined);
  },
  note: (topicId: string) => { const n = load().notes[topicId]; return ok({ topicId, body: n?.body ?? '', updated: n?.updated ?? null }); },
  notes: () => ok(Object.entries(load().notes).filter(([, n]) => n.body.trim()).map(([topicId, n]) => ({ topicId, ...n }))),
  saveNote: (topicId: string, body: string) => { load().notes[topicId] = { body, updated: new Date().toISOString() }; save(); return ok(undefined); },
  bookmarks: () => ok(load().bookmarks.map((topicId) => ({ topicId, created: '' }))),
  bookmark: (topicId: string, on: boolean) => {
    const db = load(); const s = new Set(db.bookmarks); if (on) s.add(topicId); else s.delete(topicId);
    db.bookmarks = [...s]; save(); return ok(undefined);
  },
  settings: () => ok({ ...load().settings }),
  saveSettings: (s: Record<string, unknown>) => { const db = load(); db.settings = { ...db.settings, ...s }; save(); return ok(undefined); },

  // --- laboratoare: autoevaluare declarată (separată de scorurile quiz-urilor) ---
  labChecks: () => ok(load().labChecks),
  setLabCheck: (labId: string, criterion: string, checked: boolean) => {
    const db = load(); const m = (db.labChecks[labId] ??= {});
    if (checked) m[criterion] = true; else delete m[criterion];
    save(); return ok(undefined);
  },
  labStep: (key: string) => !!load().labSteps[key],
  setLabStep: (key: string, v: boolean) => { const db = load(); if (v) db.labSteps[key] = true; else delete db.labSteps[key]; save(); },
  saveSimulation: (s: Omit<SimulationResult, 'id' | 'ts'>) => {
    const db = load(); db.simulations.push({ id: Date.now(), ts: new Date().toISOString(), ...s }); save(); return ok(undefined);
  },
  simulations: () => ok([...load().simulations].reverse()),

  // --- backup ---
  exportAll: () => JSON.stringify(load(), null, 2),
  importBackup: (data: unknown) => {
    if (!data || typeof data !== 'object' || (data as Db).v !== 1) return Promise.reject(new Error('format necunoscut'));
    mem = { ...empty(), ...(data as Db) }; save(); return ok(undefined);
  },
};
