import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'absolute-path', abbr: 'cale absolută', ro: 'cale care pornește de la rădăcina /',
    what: 'O cale care începe cu /, de exemplu /etc/hostname. Indică același loc indiferent de directorul curent.',
    how: 'Linux are un singur arbore de directoare, cu rădăcina /. Calea absolută se parcurge de la rădăcină, nivel cu nivel.',
    where: 'În scripturi, în configurări și oricând vrei să fii sigur de locație.',
    topics: ['L1.3'], aliases: ['path'],
  },
  {
    id: 'relative-path', abbr: 'cale relativă', ro: 'cale interpretată față de directorul curent',
    what: 'O cale care nu începe cu /, de exemplu docs/plan.txt sau ../alt-director. . este directorul curent, .. este părintele lui.',
    how: 'Shell-ul și programul pornesc de la directorul curent (pwd) și aplică calea. Același text poate indica locuri diferite în directoare diferite.',
    where: 'Lucru interactiv rapid. Greșelile apar când ești, fără să-ți dai seama, în alt director.',
    topics: ['L1.3'],
  },
  {
    id: 'home-dir', abbr: 'home (~)', ro: 'directorul personal al utilizatorului',
    what: 'Directorul în care utilizatorul își ține fișierele, de regulă /home/utilizator. Root folosește /root.',
    how: 'Shell-ul înlocuiește ~ cu valoarea lui $HOME. cd fără argumente duce în home.',
    where: 'Aici ai drept de scriere implicit; este locul sigur pentru exerciții.',
    topics: ['L1.3'], aliases: ['~', 'HOME'],
  },
  {
    id: 'glob', abbr: 'wildcard / globbing', ro: 'modele care se expandează în nume de fișiere',
    what: '* (orice șir), ? (un caracter), [abc] și [a-c] (un caracter din set), [!abc] (un caracter care NU e în set).',
    how: 'Expandarea o face shell-ul înainte de a porni comanda. Dacă nu se potrivește nimic, bash lasă modelul neschimbat. * nu se potrivește cu fișierele ascunse (cu nume care începe cu punct).',
    where: 'ls *.txt, rm backup-2024-*. Verifică mereu cu ls, apoi rulează comanda distructivă.',
    topics: ['L1.3'], aliases: ['wildcard', 'glob'],
  },
  {
    id: 'brace-expansion', abbr: 'brace expansion', ro: 'generare de șiruri cu {a,b} sau {1..5}',
    what: 'mkdir proiect/{docs,src} devine mkdir proiect/docs proiect/src. {1..3} generează 1 2 3.',
    how: 'Se face înainte de globbing și nu verifică existența fișierelor; produce pur și simplu text.',
    where: 'Crearea rapidă a mai multor directoare/fișiere cu nume asemănătoare.',
    topics: ['L1.3'],
  },
  {
    id: 'hidden-file', abbr: 'fișier ascuns', ro: 'fișier al cărui nume începe cu punct',
    what: 'De exemplu .bashrc. Nu este vizibil în ls obișnuit; apare cu ls -a. Nu este o formă de securitate, doar o convenție de afișare.',
    how: 'Globul * nu le include; .* le include (și . / ..). ls -A le arată fără . și ..',
    where: 'Fișierele de configurare ale utilizatorului din home.',
    topics: ['L1.3'], aliases: ['dotfile'],
  },
  {
    id: 'recursive', abbr: 'recursiv (-r)', ro: 'operație aplicată unui director și întregului conținut',
    what: 'Opțiunea -r (sau -R) face comanda să coboare în subdirectoare: cp -r, rm -r, ls -R.',
    how: 'Comanda parcurge arborele și tratează fiecare fișier și director.',
    where: 'Copierea sau ștergerea directoarelor. rm -r este definitiv: nu există coș de gunoi în shell.',
    topics: ['L1.3'], aliases: ['recursive'],
  },
];
