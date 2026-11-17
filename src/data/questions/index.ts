import type { Question } from '../../lib/types';

// Fiecare lecție are fișierul ei (l1_1.ts, l1_2.ts…) care exportă un array de întrebări.
const mods = import.meta.glob('./l*.ts', { eager: true }) as Record<string, Record<string, unknown>>;
const files = Object.keys(mods).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const QUESTIONS: Question[] = files.flatMap((k) =>
  Object.values(mods[k]).filter(Array.isArray).flat() as Question[],
);
export const questionById = new Map(QUESTIONS.map((q) => [q.id, q]));
export const questionsForTopic = (topicId: string) => QUESTIONS.filter((q) => q.topicId === topicId);
