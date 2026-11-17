import { z } from 'zod';
import { isoDate, objectiveId, lessonId } from './common';

export const objectivesFile = z.object({
  schemaVersion: z.literal(1),
  exam: z.object({
    code: z.literal('EX200'),
    title: z.string(),
    basedOn: z.literal('Red Hat Enterprise Linux 10'),
    format: z.string(),
    internetAccess: z.boolean(),
    personalDocumentationAllowed: z.boolean(),
    productDocumentationAvailable: z.string(),
    mustPersistAfterReboot: z.boolean(),
    // Nepublicate pe pagina sursă: rămân null până la o sursă Red Hat explicită.
    durationOfficial: z.null(),
    passingScoreOfficial: z.null(),
    weightsOfficial: z.null(),
  }),
  source: z.object({
    url: z.string().url(),
    section: z.string(),
    retrievedOn: isoDate,
    htmlSha256: z.string().length(64),
    listSha256: z.string().length(64),
    listSha256Definition: z.string(),
    note: z.string(),
  }),
  categories: z
    .array(
      z.object({
        id: z.string().regex(/^C(10|[1-9])$/),
        order: z.number().int().min(1).max(10),
        title: z.string().min(1),
        objectives: z.array(z.object({ id: objectiveId, text: z.string().min(1) })).min(1),
      }),
    )
    .length(10),
});

export const lessonsMapFile = z.object({
  schemaVersion: z.literal(1),
  note: z.string(),
  studyOrder: z.array(z.string()),
  chapters: z.array(z.object({ id: z.string(), title: z.string(), kind: z.enum(['official', 'support']) })),
  lessons: z.array(
    z.object({
      id: lessonId,
      chapter: z.string(),
      title: z.string().min(1),
      kind: z.enum(['official', 'support']),
      objectives: z.array(objectiveId), // lecția „casă”; gol pentru lecții de suport
      pilot: z.boolean().optional(),
    }),
  ),
});
