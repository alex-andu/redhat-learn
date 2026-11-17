import type { GlossaryEntry } from '../lib/types';

// Fiecare termen are 3 straturi: ce face, cum lucrează, unde se folosește.
// Termenii tehnici rămân în engleză; explicațiile sunt în română. Un termen are o singură intrare (LESSON_SPEC §4);
// intrările stau în data/terms/<lecție>.ts (export `TERMS`).
const files = import.meta.glob('./terms/*.ts', { eager: true, import: 'TERMS' }) as Record<string, GlossaryEntry[]>;
const BY_ID = new Map<string, GlossaryEntry>();
for (const k of Object.keys(files).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
  for (const g of files[k]) if (!BY_ID.has(g.id)) BY_ID.set(g.id, g);
}
export const GLOSSARY: GlossaryEntry[] = [...BY_ID.values()];
export const glossaryById = (id: string) => BY_ID.get(id);
