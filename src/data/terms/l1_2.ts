import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'man-page', abbr: 'man page', full: 'manual page', ro: 'pagina de manual a unei comenzi, fișier sau concept',
    what: 'Documentația oficială, scurtă și standardizată, pe care o deschizi cu man NUME. Are secțiuni fixe: NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES, SEE ALSO etc.',
    how: 'man găsește fișierul de manual (de obicei comprimat în /usr/share/man/manN/), îl formatează și îl afișează printr-un pager (less). Navigarea este cea din less.',
    where: 'Sursa principală de răspuns la examen: nu ai acces la internet, dar ai paginile de manual instalate pe sistem.',
    topics: ['L1.2'], aliases: ['man', 'manual'],
  },
  {
    id: 'man-section', abbr: 'secțiune man', ro: 'categoria numerotată a paginilor de manual',
    what: 'Paginile sunt grupate pe numere: 1 = comenzi utilizator, 5 = formate de fișiere și configurații, 8 = administrare. Același nume poate exista în mai multe secțiuni (passwd(1) și passwd(5)).',
    how: 'man NUME caută prima secțiune în ordinea implicită (de obicei 1 înaintea lui 5). Cu man 5 NUME alegi explicit secțiunea. În listări, secțiunea apare între paranteze: passwd(5).',
    where: 'La fișiere de configurare (fstab, passwd, sshd_config) vrei aproape mereu secțiunea 5; la comenzi de administrare, secțiunea 8.',
    topics: ['L1.2'],
  },
  {
    id: 'apropos', abbr: 'apropos / man -k', ro: 'căutare după cuvânt-cheie în descrierile paginilor man',
    what: 'Găsește paginile de manual a căror descriere (linia NAME) conține cuvântul căutat. man -k este echivalent cu apropos.',
    how: 'Citește o bază de date de descrieri scurte construită de mandb. Dacă baza nu a fost generată, răspunsul poate fi „nothing appropriate”. whatis (= man -f) caută doar nume exacte de pagini.',
    where: 'Când știi ce vrei să faci, dar nu știi cum se numește comanda.',
    topics: ['L1.2'], aliases: ['whatis', 'man -k', 'man -f'],
  },
  {
    id: 'mandb', abbr: 'mandb', ro: 'comanda care (re)construiește baza de date a paginilor de manual',
    what: 'Actualizează indexul folosit de man -k, apropos și whatis.',
    how: 'Parcurge directoarele cu pagini de manual și scrie un index. De obicei se rulează ca root, după instalarea unor pachete noi.',
    where: 'Dacă man -k nu găsește nimic după instalarea unui pachet, rulează mandb.',
    topics: ['L1.2'],
  },
  {
    id: 'pager', abbr: 'pager (less)', ro: 'programul care afișează text pe pagini',
    what: 'Program care arată un text lung ecran cu ecran. man folosește de obicei less.',
    how: 'Taste utile în less: Space (pagina următoare), b (înapoi), /text (caută), n / N (următorul/precedentul rezultat), g / G (început/sfârșit), q (ieșire), h (ajutor).',
    where: 'man, git log, systemctl status și multe alte comenzi afișează prin pager.',
    topics: ['L1.2'], aliases: ['less'],
  },
  {
    id: 'info-pages', abbr: 'info', full: 'GNU info', ro: 'sistemul de documentație GNU, cu noduri legate',
    what: 'Format de documentație mai amplu decât man, organizat ca un manual cu capitole și hyperlink-uri (noduri). info coreutils conține documentația comenzilor de bază.',
    how: 'Navigare: n (nodul următor), p (precedent), u (nivelul superior), Enter pe un link, Space/Backspace pentru derulare, s pentru căutare, q pentru ieșire.',
    where: 'Pentru unelte GNU (coreutils, grep, sed, bash) oferă explicații și exemple mai detaliate decât man. Dacă nu există o pagină info, info afișează pagina man.',
    topics: ['L1.2'],
  },
  {
    id: 'usr-share-doc', abbr: '/usr/share/doc', ro: 'directorul cu documentația livrată de pachete',
    what: 'Fiecare pachet instalat poate pune aici fișiere precum README, exemple de configurare, licență, changelog.',
    how: 'Directoarele au nume de forma pachet sau pachet-versiune. rpm -qd PACHET listează fișierele marcate ca documentație ale unui pachet instalat.',
    where: 'Exemple de fișiere de configurare și note de utilizare care nu încap într-o pagină man.',
    topics: ['L1.2'], aliases: ['doc'],
  },
];
