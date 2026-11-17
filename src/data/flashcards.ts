import { GLOSSARY } from './glossary';
import { AVAILABLE } from '../content/registry';

export type Flashcard = { id: string; topicId: string; front: string; back: string; detail?: string; kind: 'term' | 'fact' };

// Un termen de glosar devine un singur card, atașat primei lecții disponibile din lista lui.
export const FLASHCARDS: Flashcard[] = GLOSSARY.flatMap((g) => {
  const t = g.topics?.find((x) => AVAILABLE.has(x));
  return t ? [{ id: `g-${g.id}`, topicId: t, kind: 'term' as const, front: g.abbr, back: [g.full, g.ro].filter(Boolean).join(' — '), detail: g.what }] : [];
});
