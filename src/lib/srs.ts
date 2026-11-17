// Spaced repetition cu FSRS (ts-fsrs, MIT). Algoritmul rulează în browser; backend-ul stochează cardurile.
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import { api, type SrsRow } from './api';

export const scheduler = fsrs(generatorParameters({ request_retention: 0.9, maximum_interval: 365, enable_fuzz: true }));
export { Rating };

const revive = (c: any): Card => ({ ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined });

export async function gradeCard(id: string, kind: string, ref: string, existing: any | null, grade: Grade) {
  const card = existing ? revive(existing) : createEmptyCard(new Date());
  const { card: next } = scheduler.next(card, new Date(), grade);
  await api.putSrs(id, { kind, ref, card: next, rating: grade });
  return next;
}

/** După o întrebare: greșit → Again (revine curând); corect → Good doar dacă există deja card (întrebările știute nu încarcă coada). */
export async function recordQuestionResult(questionId: string, correct: boolean, cache?: Map<string, SrsRow>) {
  const id = `q:${questionId}`;
  let existing = cache?.get(id)?.card ?? null;
  if (!cache) {
    const rows = await api.srsCards('question');
    existing = rows.find((r) => r.id === id)?.card ?? null;
  }
  if (!existing && correct) return;
  await gradeCard(id, 'question', questionId, existing, correct ? Rating.Good : Rating.Again);
}

export const isDue = (row: SrsRow, now = new Date()) => new Date(row.card.due) <= now;

export function previewIntervals(existing: any | null) {
  const card = existing ? revive(existing) : createEmptyCard(new Date());
  const now = new Date();
  const p = scheduler.repeat(card, now);
  const fmt = (d: Date) => {
    const mins = Math.round((d.getTime() - now.getTime()) / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min`;
    const h = Math.round(mins / 60); if (h < 24) return `${h} h`;
    const days = Math.round(h / 24); if (days < 31) return `${days} z`;
    return `${Math.round(days / 30)} luni`;
  };
  return {
    [Rating.Again]: fmt(p[Rating.Again].card.due),
    [Rating.Hard]: fmt(p[Rating.Hard].card.due),
    [Rating.Good]: fmt(p[Rating.Good].card.due),
    [Rating.Easy]: fmt(p[Rating.Easy].card.due),
  } as Record<number, string>;
}
