import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'positional-parameter', abbr: '$1, $2', ro: 'argumentele cu care a fost pornit scriptul',
    what: 'Variabile speciale: $1 este primul argument, $2 al doilea…; $0 numele scriptului, $# numărul, "$@" toate.',
    how: 'Shell-ul împarte linia de comandă în cuvinte; ghilimelele păstrează un cuvânt întreg. Argumentele lipsă sunt șiruri vide. De la al 10-lea se scrie ${10}. shift le mută la stânga.',
    where: 'Scripturi care primesc nume de fișiere sau de utilizatori; verificarea $# la început.',
    topics: ['L3.2'],
  },
  {
    id: 'shell-variable', abbr: 'variabilă', ro: 'nume care păstrează o valoare în shell',
    what: 'Se atribuie fără spații (nume=valoare) și se citește cu $nume.',
    how: 'Ghilimelele duble expandează variabilele, cele simple nu. Variabila există în shell-ul curent; scriptul rulat cu ./ are propriul proces și propriile variabile.',
    where: 'În scripturi, pentru valori reutilizate; $PATH și $HOME sunt variabile de mediu.',
    topics: ['L3.2'],
  },
];
