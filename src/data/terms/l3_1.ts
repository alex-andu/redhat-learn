import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'shell-script', abbr: 'script shell', ro: 'fișier text cu comenzi rulate de shell',
    what: 'Un fișier cu comenzi în ordine, rulate de un interpretor (de obicei bash), ca și cum le-ai tasta.',
    how: 'Se rulează cu bash script.sh sau, cu bit x, cu ./script.sh. La final întoarce un cod de ieșire.',
    where: 'Automatizarea sarcinilor repetitive; sarcini de examen de tipul „scrie un script care…”.',
    topics: ['L3.1'],
  },
  {
    id: 'shebang', abbr: '#!', ro: 'prima linie a scriptului, care indică interpretorul',
    what: 'Secvența #! urmată de calea interpretorului (de exemplu #!/bin/bash), pe PRIMA linie.',
    how: 'La execuția directă (./script.sh), kernelul citește linia și pornește interpretorul indicat, dându-i fișierul ca argument. Cu bash script.sh este tratată ca simplu comentariu.',
    where: 'Prima linie din orice script; head -1 script.sh o arată.',
    topics: ['L3.1'],
  },
];
