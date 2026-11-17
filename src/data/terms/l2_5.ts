import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'flatpak-app-id', abbr: 'Application ID', ro: 'identificatorul unic al unei aplicații Flatpak',
    what: 'Nume în format reverse-DNS (de exemplu org.exemplu.Calculator, fictiv) care identifică o aplicație.',
    how: 'Îl folosești la install, uninstall, info și run; numele prietenos nu este suficient.',
    where: 'flatpak search și flatpak remote-ls îl afișează.',
    topics: ['L2.5'],
  },
  {
    id: 'flatpak-unused', abbr: '--unused', ro: 'opțiune de curățare a runtime-urilor nefolosite',
    what: 'flatpak uninstall --unused șterge runtime-urile și extensiile care nu mai sunt cerute de nicio aplicație.',
    how: 'Se rulează după ștergerea aplicațiilor; runtime-urile partajate rămân cât timp o aplicație le folosește.',
    where: 'Eliberarea spațiului după dezinstalare.',
    topics: ['L2.5'],
  },
];
