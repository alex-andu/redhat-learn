import { TOPICS } from './registry';
import type { Lab } from '../lab/types';

/** Toate laboratoarele din lecțiile cu conținut. */
export const LABS: Lab[] = TOPICS.flatMap((t) => t.labs);
