import { z } from 'zod';
import { lessonId } from './common';

/** Intrare de glossary (LESSON_SPEC §4). Un termen e definit o singură dată; restul lecțiilor îl referă. */
export const glossaryEntry = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // slug unic global
  term: z.string().min(1), // ca în text, în engleză (ex. "inode")
  full: z.string().optional(), // denumire completă, dacă e acronim
  ro: z.string().min(1), // explicație scurtă în română
  what: z.string().min(1), // ce face
  how: z.string().min(1), // cum funcționează
  where: z.string().min(1), // unde apare în administrare
  relatedCommands: z.array(z.string()).default([]),
  relatedFiles: z.array(z.string()).default([]),
  lessons: z.array(lessonId).default([]),
  aliases: z.array(z.string()).default([]),
});
export const glossaryFile = z.array(glossaryEntry);
