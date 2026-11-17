import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'dac', abbr: 'DAC', full: 'Discretionary Access Control', ro: 'controlul accesului decis de proprietarul resursei',
    what: 'Modelul clasic Unix de permisiuni: fiecare fișier are proprietar, grup și permisiuni rwx pentru proprietar, grup, alții; proprietarul (sau root) le poate schimba.',
    how: 'Kernelul alege prima clasă care se potrivește (proprietar, apoi grup, apoi alții) și aplică doar permisiunile acelei clase; root ocolește DAC, dar nu SELinux.',
    where: 'ls -l, chmod, chown, namei -l; primul strat de verificat la Permission denied (apoi montarea și SELinux).',
    topics: ['L6.5'], aliases: ['dac', 'MAC', 'discretionary'],
  },
  {
    id: 'setuid', abbr: 'setuid', ro: 'bit special: executabilul rulează cu UID-ul proprietarului fișierului',
    what: 'Bitul 4000 (s în clasa proprietar) pe un executabil; procesul primește identitatea proprietarului, nu pe a utilizatorului care îl pornește.',
    how: 'chmod u+s sau chmod 4755; apare ca s în ls -l. Exemplu: /usr/bin/passwd, care trebuie să scrie în fișiere ale lui root.',
    where: 'Mențiune în diagnostic: nu schimba biții speciali ai executabilelor de sistem fără motiv.',
    topics: ['L6.5'], aliases: ['suid'],
  },
  {
    id: 'setgid-dir', abbr: 'setgid', ro: 'bit special: pe un director, fișierele noi moștenesc grupul directorului',
    what: 'Bitul 2000 (s în clasa grup). Pe un director, elementele create acolo primesc grupul directorului, nu grupul principal al creatorului; pe un executabil, procesul rulează cu grupul fișierului.',
    how: 'chmod g+s DIR sau chmod 2775 DIR; apare ca s (sau S fără x) în clasa grup.',
    where: 'Directoare de colaborare: chgrp dev /srv/dev; chmod 2775 /srv/dev.',
    topics: ['L6.5'], aliases: ['setgid', 'sgid', 'g+s'],
  },
  {
    id: 'sticky-bit', abbr: 'sticky bit', ro: 'bit special pe director: doar proprietarul poate șterge propriile fișiere',
    what: 'Bitul 1000 (t la finalul modului). Pe un director permite oricui să creeze fișiere (dacă are w), dar doar proprietarul fișierului, al directorului sau root le poate șterge/redenumi.',
    how: 'chmod +t DIR sau chmod 1777 DIR; vizibil ca t în ls -ld; ex. /tmp.',
    where: 'Directoare comune: chmod 1777 /srv/depozit.',
    topics: ['L6.5'], aliases: ['sticky', '+t', 'restricted deletion'],
  },
  {
    id: 'namei', abbr: 'namei', ro: 'comanda care arată permisiunile fiecărei componente dintr-o cale',
    what: 'Descompune o cale și afișează tipul, modul, proprietarul și grupul fiecărei componente (-l = -m -o -v); -x marchează punctele de montare.',
    how: 'namei -l /srv/proiect/raport.txt: găsește imediat directorul din cale fără x pentru clasa ta.',
    where: 'Primul instrument de diagnostic pentru Permission denied pe un fișier aparent deschis.',
    topics: ['L6.5'], aliases: ['namei -l', 'ls -ld'],
  },
];
