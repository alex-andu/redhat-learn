import type { ComponentType } from 'react';
import type { Lab } from '../lab/types';

export type TocItem = { id: string; label: string; code?: string; sub?: boolean };

/** Tot ce are nevoie LessonPage ca să afișeze o lecție. Un director `content/<l1_1>/` per lecție. */
export type TopicModule = {
  /** ID-ul din lessons-map.json, ex. "L1.1" */
  id: string;
  /** subtitlu în română sub titlul lecției */
  subtitle: string;
  /** ex. „≈45 min studiu + laborator” */
  studyTime: string;
  /** TOC + calcul progres; trebuie să includă 'questions' și 'labs' */
  sections: TocItem[];
  /** teoria lecției (structura din LESSON_SPEC §1, până la mini-quiz) */
  Body: ComponentType;
  /** laboratoarele lecției (date, nu cod; randate de LabView) */
  labs: Lab[];
  /** surse documentare ale lecției (LESSON_SPEC §2) */
  sources: { kind: 'doc' | 'man' | 'upstream' | 'rfc'; ref: string }[];
};
