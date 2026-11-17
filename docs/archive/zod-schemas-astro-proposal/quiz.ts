import { z } from 'zod';
import { difficulty, lessonId, objectiveId } from './common';

const why = z.string().min(10); // explicație obligatorie pentru FIECARE variantă

const base = {
  id: z.string().regex(/^[A-Za-z0-9.\-]+-\d{3}$/), // ex. L1.1-001
  objectives: z.array(objectiveId).min(1),
  difficulty,
  stem: z.string().min(1),
  explanation: z.string().min(1),
  tags: z.array(z.string()).optional(),
};

const option = z.object({ id: z.string(), text: z.string().min(1), correct: z.boolean(), why });

export const question = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('single'), options: z.array(option).min(3) }),
  z.object({ ...base, type: z.literal('multi'), options: z.array(option).min(4) }),
  z.object({
    ...base,
    type: z.literal('command'), // completare de comandă
    prompt: z.string(),
    answers: z.array(z.string()).min(1), // variante acceptate
    canonical: z.string(),
    wrong: z.array(z.object({ text: z.string(), why })).min(1),
  }),
  z.object({ ...base, type: z.literal('order'), items: z.array(z.object({ text: z.string(), why })).min(3) }),
  z.object({
    ...base,
    type: z.literal('match'),
    pairs: z.array(z.object({ left: z.string(), right: z.string(), why })).min(3),
    distractors: z.array(z.object({ text: z.string(), why })).optional(),
  }),
  z.object({
    ...base,
    type: z.literal('find-error'), // găsește greșeala într-o configurație / comandă
    snippet: z.string(),
    options: z.array(option).min(3),
  }),
  z.object({
    ...base,
    type: z.literal('interpret-output'), // output etichetat obligatoriu
    outputLabel: z.enum(['reconstructed', 'illustrative', 'captured']),
    output: z.string(),
    options: z.array(option).min(3),
  }),
]);

export const quizFile = z.object({
  lesson: lessonId,
  questions: z.array(question).min(1),
});
// Verificări suplimentare la build (Etapa 1): single => exact o opțiune corectă; multi => cel puțin două;
// ID-uri unice în tot proiectul; obiectivele întrebării ⊆ obiectivele lecției.
