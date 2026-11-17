import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'shell-test', abbr: 'test / [ ]', ro: 'comandă care evaluează o condiție și întoarce 0 sau 1',
    what: 'test și [ ] (sinonime) verifică fișiere (-f, -d, -e), șiruri (=, -z) și numere (-eq, -lt, -gt). [[ ]] este varianta bash.',
    how: '[ este o comandă: spațiile din jur sunt obligatorii, iar ultimul argument este ]. Rezultatul este codul de ieșire: 0 = adevărat, 1 = fals.',
    where: 'În if/while; if [ -f fișier ]; then …; fi.',
    topics: ['L3.3'],
  },
];
