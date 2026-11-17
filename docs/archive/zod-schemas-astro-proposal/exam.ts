import { z } from 'zod';
import { acceptanceCriterion } from './lab';
import { difficulty, objectiveId, outputRef, source } from './common';

/** Simulare de examen (LAB_SPEC §4): task-uri independente, fără indicii; scoruri automat și autoevaluat SEPARATE. */
export const examIndex = z.object({
  id: z.string().regex(/^sim-[a-z0-9-]+$/),
  title: z.string().min(1),
  // Durata oficială nu e publicată pe pagina sursă: valoarea e „estimat”, configurabilă de utilizator.
  suggestedMinutes: z.number().int().positive(),
  durationIsEstimate: z.literal(true),
  tasks: z.array(z.string()).min(2), // căi către tasks/*.mdx
  chapters: z.array(z.string()).min(1),
});

/** Frontmatter-ul unui task din simulare. Nu are indicii; soluția se dezvăluie doar după finalizare. */
export const examTaskFrontmatter = z.object({
  id: z.string().regex(/^task-[a-z0-9-]+$/),
  title: z.string().min(1),
  objectives: z.array(objectiveId).min(1),
  difficulty,
  assessment: z.enum(['self', 'auto']), // 'self' = autoevaluat prin bife; 'auto' = răspuns în platformă (notat automat)
  initialConditions: z.array(z.string()).min(1),
  finalState: z.array(z.string()).min(1),
  acceptanceCriteria: z.array(acceptanceCriterion).min(1),
  persistence: z.array(z.string()),
  sources: z.array(source).min(1),
  outputs: z.array(outputRef).default([]),
  hints: z.never().optional(), // simularea nu are indicii
});

/** Raportul unei simulări: două scoruri separate, fără scor combinat (D-010). */
export const examResult = z.object({
  simId: z.string(),
  completedAt: z.string(),
  autoScore: z.object({ correct: z.number().int(), total: z.number().int() }), // doar întrebări din platformă
  selfScore: z.object({ checked: z.number().int(), total: z.number().int(), declaredByLearner: z.literal(true) }),
  // Intenționat NU există câmp „overall”/„total”.
});
