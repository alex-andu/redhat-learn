import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'permissions', abbr: 'permisiuni', ro: 'drepturile de acces (r, w, x) pe fișiere și directoare',
    what: 'Fiecare fișier are un set de drepturi pentru trei clase: proprietar (u), grup (g) și ceilalți (o). Ele decid cine poate citi, modifica sau executa/traversa.',
    how: 'Nucleul compară utilizatorul care face accesul cu proprietarul și grupul fișierului și aplică prima clasă care se potrivește (u, apoi g, apoi o).',
    where: 'ls -l afișează permisiunile; chmod le schimbă; chown/chgrp schimbă proprietarul/grupul.',
    topics: ['L1.8'], aliases: ['ugo', 'rwx'],
  },
  {
    id: 'ugo', abbr: 'u/g/o', ro: 'user (proprietar), group, others',
    what: 'Cele trei clase de utilizatori cărora li se atribuie drepturi. În chmod, litera a înseamnă all (u+g+o).',
    how: 'Se aplică prima clasă potrivită: dacă ești proprietar contează doar u, chiar dacă o ar fi mai permisiv.',
    where: 'chmod g+w fișier; chmod u=rwx,go=rx dir.',
    topics: ['L1.8'],
  },
  {
    id: 'rwx', abbr: 'rwx', full: 'read, write, execute', ro: 'drepturile de citire, scriere, execuție',
    what: 'Pe fișier: r citește conținutul, w îl modifică, x îl execută. Pe director: r listează numele, w creează/șterge/redenumește intrări (cu x), x permite traversarea (cd și accesul după nume).',
    how: 'Valori octale: r=4, w=2, x=1; un rwx complet = 7; rw- = 6; r-x = 5; r-- = 4.',
    where: 'Un director cu r fără x permite ls (nume) dar nu accesul la conținutul fișierelor.',
    topics: ['L1.8'],
  },
  {
    id: 'octal-mode', abbr: 'mod octal', ro: 'permisiuni scrise ca număr (ex. 755)',
    what: 'Trei cifre (u, g, o), fiecare suma drepturilor 4+2+1. 755 = rwxr-xr-x, 644 = rw-r--r--, 600 = rw-------.',
    how: 'Se folosește cu chmod: chmod 640 fișier. O cifră în plus în față (4 cifre) codifică biți speciali.',
    where: 'Setări rapide, exact specificate la examen.',
    topics: ['L1.8'],
  },
  {
    id: 'chmod', abbr: 'chmod', full: 'change mode', ro: 'schimbă permisiunile unui fișier',
    what: 'Setează drepturile fișierului/directorului, în mod octal (chmod 640 f) sau simbolic (chmod g+w f).',
    how: 'Mod simbolic: [ugoa][+-=][rwxX]; -R aplică recursiv. Doar proprietarul (sau root) poate schimba permisiunile.',
    where: 'Corectarea permisiunilor la configurări, scripturi, directoare partajate.',
    topics: ['L1.8'],
  },
  {
    id: 'chown', abbr: 'chown', full: 'change owner', ro: 'schimbă proprietarul și/sau grupul',
    what: 'chown utilizator:grup fișier schimbă proprietarul și grupul; chgrp schimbă doar grupul.',
    how: 'Schimbarea proprietarului cere privilegii (root/sudo). -R este recursiv.',
    where: 'După copierea fișierelor ca root, pentru ca un serviciu sau utilizator să le poată accesa.',
    topics: ['L1.8'], aliases: ['chgrp'],
  },
  {
    id: 'umask', abbr: 'umask', ro: 'masca drepturilor implicite ale fișierelor noi',
    what: 'Valoare ale cărei drepturi sunt scoase din 666 (fișiere) și 777 (directoare) la crearea unor obiecte noi. umask 022 ⇒ fișiere 644, directoare 755.',
    how: 'umask afișează valoarea; umask 027 o setează în sesiunea curentă. Pentru persistență se pune într-un fișier de inițializare al shell-ului.',
    where: 'Explică de ce fișierele noi nu sunt executabile și cine poate citi ce creezi.',
    topics: ['L1.8'],
  },
];
