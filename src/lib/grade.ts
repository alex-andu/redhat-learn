import type { Answer, Question } from './types';

export const normCli = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export function isAnswered(q: Question, a: Answer | null): boolean {
  if (!a) return false;
  switch (a.type) {
    case 'single': case 'multi': return a.selected.length > 0;
    case 'match': return Object.values(a.placement).some((v) => v != null);
    case 'order': return true;
    case 'cli': return a.text.trim().length > 0;
  }
  return q.type === 'order';
}

export function grade(q: Question, a: Answer | null): boolean {
  if (!a) return false;
  if ((q.type === 'single' || q.type === 'multi') && (a.type === 'single' || a.type === 'multi')) {
    const right = q.options.filter((o) => o.correct).map((o) => o.id).sort();
    const sel = [...a.selected].sort();
    return right.length === sel.length && right.every((r, i) => r === sel[i]);
  }
  if (q.type === 'match' && a.type === 'match') return q.pairs.every((p, i) => a.placement[i] === p.right);
  if (q.type === 'order' && a.type === 'order') return a.order.every((v, i) => v === i);
  if (q.type === 'cli' && a.type === 'cli') return q.answers.some((x) => normCli(x) === normCli(a.text));
  return false;
}

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const hashSeed = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
