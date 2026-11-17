import type { TocItem, TopicModule } from './types';
import { M0_1 } from './m0_1';
import { M0_3 } from './m0_3';
import { M0_4 } from './m0_4';
import { M0_5 } from './m0_5';
import { L1_1 } from './l1_1';
import { L1_2 } from './l1_2';
import { L1_3 } from './l1_3';
import { L1_5 } from './l1_5';
import { L1_4 } from './l1_4';
import { L1_6 } from './l1_6';
import { L1_7 } from './l1_7';
import { L1_8 } from './l1_8';
import { L1_9 } from './l1_9';
import { L1_10 } from './l1_10';
import { L1_11 } from './l1_11';
import { L2_1 } from './l2_1';
import { L2_2 } from './l2_2';
import { L2_3 } from './l2_3';
import { L2_4 } from './l2_4';
import { L2_5 } from './l2_5';
import { L3_1 } from './l3_1';
import { L3_2 } from './l3_2';
import { L3_3 } from './l3_3';
import { L3_4 } from './l3_4';
import { L3_5 } from './l3_5';
import { L4_1 } from './l4_1';
import { L4_2 } from './l4_2';
import { L4_3 } from './l4_3';
import { L4_4 } from './l4_4';
import { L4_5 } from './l4_5';
import { L4_6 } from './l4_6';
import { L4_7 } from './l4_7';
import { L4_8 } from './l4_8';
import { L4_9 } from './l4_9';
import { L4_10 } from './l4_10';
import { L5_1 } from './l5_1';
import { L5_2 } from './l5_2';
import { L5_3 } from './l5_3';
import { L5_4 } from './l5_4';
import { L5_5 } from './l5_5';
import { L5_6 } from './l5_6';
import { L6_1 } from './l6_1';
import { L6_2 } from './l6_2';
import { L6_3 } from './l6_3';
import { L6_4 } from './l6_4';
import { L6_5 } from './l6_5';
import { L7_1 } from './l7_1';
import { L7_2 } from './l7_2';
import { L7_3 } from './l7_3';
import { L7_4 } from './l7_4';
import { L8_1 } from './l8_1';
import { L8_2 } from './l8_2';
import { L8_3 } from './l8_3';
import { L8_4 } from './l8_4';
import { L9_1 } from './l9_1';
import { L9_2 } from './l9_2';
import { L9_3 } from './l9_3';
import { L9_4 } from './l9_4';
import { L10_1 } from './l10_1';
import { L10_2 } from './l10_2';
import { L10_3 } from './l10_3';
import { L10_4 } from './l10_4';
import { L10_5 } from './l10_5';
import { L10_6 } from './l10_6';
import { L10_7 } from './l10_7';
import { L10_8 } from './l10_8';

export type { TocItem, TopicModule };

/** Lecțiile cu conținut (capitolul M0, suport: M0.1, M0.3, M0.4, M0.5; pilot D-012: L1.1, L1.2, L1.3, L1.5; restul capitolului C1: L1.4, L1.6–L1.11; capitolul C2: L2.1–L2.5; capitolul C3: L3.1–L3.5; capitolul C5: L5.1–L5.6; capitolul C6: L6.1–L6.5; capitolul C7: L7.1–L7.4; capitolul C8: L8.1–L8.4; capitolul C9: L9.1–L9.4; capitolul C10: L10.1–L10.8). Ca să adaugi una: creează content/<l1_x>/index.tsx și pune-o aici (aprobare explicită — CLAUDE.md regula 8). */
export const TOPICS: TopicModule[] = [M0_1, M0_3, M0_4, M0_5, L1_1, L1_2, L1_3, L1_4, L1_5, L1_6, L1_7, L1_8, L1_9, L1_10, L1_11, L2_1, L2_2, L2_3, L2_4, L2_5, L3_1, L3_2, L3_3, L3_4, L3_5, L4_1, L4_2, L4_3, L4_4, L4_5, L4_6, L4_7, L4_8, L4_9, L4_10, L5_1, L5_2, L5_3, L5_4, L5_5, L5_6, L6_1, L6_2, L6_3, L6_4, L6_5, L7_1, L7_2, L7_3, L7_4, L8_1, L8_2, L8_3, L8_4, L9_1, L9_2, L9_3, L9_4, L10_1, L10_2, L10_3, L10_4, L10_5, L10_6, L10_7, L10_8];

export const TOPIC_MODULES: Record<string, TopicModule> = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
export const AVAILABLE = new Set(TOPICS.map((t) => t.id));

/** Secțiunile fiecărei lecții disponibile — folosite pentru TOC și pentru calculul progresului. */
export const TOPIC_SECTIONS: Record<string, TocItem[]> = Object.fromEntries(TOPICS.map((t) => [t.id, t.sections]));

export const topicProgress = (topicId: string, done: Set<string> | undefined) => {
  const s = TOPIC_SECTIONS[topicId];
  if (!s) return 0;
  return s.filter((x) => done?.has(x.id)).length / s.length;
};
