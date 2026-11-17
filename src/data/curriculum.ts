// Curriculum RHCSA EX200 (RHEL 10) — citit direct din sursele verificate ale proiectului:
//   content/curriculum/objectives.json   (10 categorii, 62 de obiective oficiale, verbatim, cu amprentă SHA-256)
//   content/curriculum/lessons-map.json  (68 de lecții: oficiale + suport; lecția „casă” a fiecărui obiectiv)
// Nu se copiază și nu se modifică manual: aici doar se indexează. Validarea: scripts/check-matrix.mjs + tests/.
import objectivesJson from '../../content/curriculum/objectives.json';
import mapJson from '../../content/curriculum/lessons-map.json';

export type Objective = { id: string; text: string; category: string };
export type Category = { id: string; order: number; title: string; objectives: Objective[] };
export type Lesson = {
  id: string;
  chapter: string;
  title: string;
  kind: 'official' | 'support';
  /** obiectivele oficiale pentru care lecția este „casa” (lecția unică) */
  objectives: string[];
  /** obiective la care lecția doar trimite */
  refs: string[];
};
export type Chapter = { id: string; title: string; kind: 'official' | 'support'; lessons: Lesson[]; category?: Category };

export const EXAM = objectivesJson.exam;
export const SOURCE = objectivesJson.source;
export const EXAM_VERSION = 'EX200 · RHEL 10';

export const CATEGORIES: Category[] = objectivesJson.categories.map((c) => ({
  id: c.id, order: c.order, title: c.title,
  objectives: c.objectives.map((o) => ({ id: o.id, text: o.text, category: c.id })),
}));
export const OBJECTIVES: Objective[] = CATEGORIES.flatMap((c) => c.objectives);

export const LESSONS: Lesson[] = (mapJson.lessons as Partial<Lesson>[]).map((l) => ({
  id: l.id!, chapter: l.chapter!, title: l.title!, kind: l.kind!, objectives: l.objectives ?? [], refs: l.refs ?? [],
}));

/** Capitolele, în ordinea de predare din lessons-map.json (`studyOrder`, D-014). */
export const CHAPTERS: Chapter[] = (mapJson.studyOrder as string[]).map((id) => {
  const ch = mapJson.chapters.find((c) => c.id === id)!;
  return {
    id, title: ch.title, kind: ch.kind as Chapter['kind'],
    lessons: LESSONS.filter((l) => l.chapter === id),
    category: CATEGORIES.find((c) => c.id === id),
  };
});

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const objectiveById = (id: string) => OBJECTIVES.find((o) => o.id === id);
export const chapterOf = (lessonId: string) => CHAPTERS.find((c) => c.lessons.some((l) => l.id === lessonId));
/** Lecția „casă” + lecțiile care doar trimit la un obiectiv. */
export const lessonsForObjective = (objId: string) => ({
  home: LESSONS.filter((l) => l.objectives.includes(objId)),
  refs: LESSONS.filter((l) => l.refs.includes(objId)),
});

/** Culoare per capitol (reutilizează paleta --d1..--d6 din design system). */
export const chapterColor = (chapterId: string) => {
  const n = chapterId === 'M0' ? 6 : ((Number(chapterId.slice(1)) - 1) % 6) + 1;
  return `var(--d${n})`;
};
