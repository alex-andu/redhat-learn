import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'inode', abbr: 'inode', full: 'index node', ro: 'structura care descrie un fișier pe disc (fără nume)',
    what: 'Pentru fiecare fișier, sistemul de fișiere păstrează un inode: proprietar, permisiuni, dimensiune, timpi, contorul de legături și locul datelor. Numele fișierului nu este în inode.',
    how: 'Un director este o listă de perechi (nume → număr de inode). Mai multe nume pot indica același inode.',
    where: 'ls -i afișează numărul inode; stat afișează toate câmpurile; df -i arată câte inode-uri sunt libere.',
    topics: ['L1.7'],
  },
  {
    id: 'hard-link', abbr: 'hard link', ro: 'nume suplimentar pentru același inode',
    what: 'Un al doilea (al treilea…) nume pentru același fișier. Nu există „original” și „copie”: toate numele sunt egale.',
    how: 'ln țintă nume creează o nouă intrare de director care indică același inode și crește contorul de legături. Datele se șterg abia când contorul ajunge la 0.',
    where: 'Funcționează doar în același sistem de fișiere și, de regulă, nu pentru directoare. Contorul se vede în a doua coloană din ls -l.',
    topics: ['L1.7'], aliases: ['link hard', 'legătură hard'],
  },
  {
    id: 'soft-link', abbr: 'soft link', ro: 'symlink: fișier mic care conține calea către o țintă',
    what: 'Un fișier special (tip l) cu inode propriu, al cărui conținut este o cale. Sistemul „urmează” calea când accesezi link-ul.',
    how: 'ln -s ȚINTĂ NUME. Dacă ținta este mutată sau ștearsă, link-ul rămâne dar este „rupt” (dangling). Poate indica directoare și alte sisteme de fișiere.',
    where: 'Scurtături către directoare, versiuni de fișiere (ex. /etc/alternatives), căi stabile pentru aplicații.',
    topics: ['L1.7'], aliases: ['symlink', 'symbolic link', 'legătură simbolică'],
  },
  {
    id: 'link-count', abbr: 'contor de legături', ro: 'numărul de nume (hard link-uri) ale unui inode',
    what: 'Numărul din a doua coloană a ieșirii ls -l. Pentru un fișier obișnuit este 1 dacă are un singur nume.',
    how: 'Crește cu fiecare hard link nou și scade la ștergerea unui nume. La 0 (și fără procese care îl au deschis) spațiul este eliberat.',
    where: 'Arată dacă un fișier are alte nume; pentru directoare reflectă numărul de subdirectoare plus doi.',
    topics: ['L1.7'],
  },
  {
    id: 'broken-link', abbr: 'link rupt', ro: 'symlink a cărui țintă nu mai există',
    what: 'Un symlink care indică o cale inexistentă. ls îl arată, dar accesarea dă „No such file or directory”.',
    how: 'Se întâmplă când ținta este ștearsă/mutată sau calea relativă este interpretată din alt director.',
    where: 'find -xtype l îl caută; ls --color îl evidențiază de obicei.',
    topics: ['L1.7'], aliases: ['dangling symlink'],
  },
];
