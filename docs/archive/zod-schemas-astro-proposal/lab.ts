import { z } from 'zod';
import { difficulty, objectiveId, outputRef, source } from './common';

/** Criteriu de acceptare: sursă pentru bifa de AUTOEVALUARE (LAB_SPEC §3). Nu e o verificare a platformei. */
export const acceptanceCriterion = z.object({
  id: z.string().regex(/^ac\d+$/),
  text: z.string().min(1),
  manualCheck: z.string().min(1), // comandă(e) pe care cel care învață le poate rula singur
});

/** Frontmatter-ul unui laborator .mdx (LAB_SPEC §5). Nu există câmpuri executabile (setup/verify/reset). */
export const labFrontmatter = z.object({
  id: z.string().regex(/^lab-[a-z0-9-]+$/),
  title: z.string().min(1),
  chapter: z.string(),
  modes: z.array(z.enum(['guided', 'independent'])).min(1),
  objectives: z.array(objectiveId).min(1),
  difficulty,
  estimatedMinutes: z.number().int().positive(),
  initialConditions: z.array(z.string()).min(1), // descrise, nu create de platformă
  finalState: z.array(z.string()).min(1),
  acceptanceCriteria: z.array(acceptanceCriterion).min(1),
  persistence: z.array(z.string()), // gol doar dacă task-ul nu are cerințe de persistență (se justifică în corp)
  sources: z.array(source).min(1),
  outputs: z.array(outputRef).default([]),
});
export type LabFrontmatter = z.infer<typeof labFrontmatter>;
// Verificări la build (Etapa 1): corpul conține secțiunile Scenariu și Soluție; soluția are pași cu Explicație,
// Verificare manuală, Persistență, Greșeli frecvente; ID-uri de criterii unice; fiecare obiectiv are cel puțin un lab.
