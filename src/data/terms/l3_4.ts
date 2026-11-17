import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'for-loop', abbr: 'for', ro: 'buclă care repetă comenzi pentru fiecare element al unei liste',
    what: 'for x in lista; do …; done: x ia pe rând fiecare element.',
    how: 'Bash expandează mai întâi lista (glob, acolade, $( ), "$@"), apoi rulează corpul pentru fiecare cuvânt. Lista goală: corpul nu rulează.',
    where: 'Redenumirea mai multor fișiere, crearea mai multor utilizatori, prelucrarea argumentelor.',
    topics: ['L3.4'],
  },
  {
    id: 'while-loop', abbr: 'while', ro: 'buclă care repetă cât timp o comandă are cod 0',
    what: 'while COMANDĂ; do …; done. Cu read, citește un fișier rând cu rând: while read -r linie; do …; done < fișier.',
    how: 'Testul este o comandă; corpul trebuie să schimbe starea, altfel bucla e infinită. until face opusul. break iese, continue trece la iterația următoare.',
    where: 'Citirea fișierelor linie cu linie (/etc/passwd), contoare.',
    topics: ['L3.4'],
  },
];
