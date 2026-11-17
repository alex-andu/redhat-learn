import { z } from 'zod';
import { commandRef, lessonId, objectiveId, outputRef, source } from './common';

/** Frontmatter-ul unei lecții .mdx (LESSON_SPEC §2). Starea Review/Publicată e setată doar de proprietar. */
export const lessonFrontmatter = z.object({
  id: lessonId,
  title: z.string().min(1),
  chapter: z.string(),
  kind: z.enum(['official', 'support']),
  objectives: z.array(objectiveId), // trebuie să coincidă exact cu lessons-map.json (verificat la build)
  rhel: z.literal(10),
  prerequisites: z.array(lessonId).default([]),
  estimatedMinutes: z.number().int().positive(),
  status: z.object({
    researched: z.boolean(),
    written: z.boolean(),
    validated: z.boolean(),
    // Doar proprietarul setează aceste câmpuri:
    ownerReviewed: z.boolean().default(false),
    published: z.boolean().default(false),
    ownerTestedOnRhel10: z.boolean().default(false),
  }),
  sources: z.array(source).min(1),
  commands: z.array(commandRef).default([]),
  outputs: z.array(outputRef).default([]),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatter>;
