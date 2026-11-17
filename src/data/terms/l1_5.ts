import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'stdin', abbr: 'stdin', full: 'standard input (descriptor 0)', ro: 'intrarea standard',
    what: 'Canalul din care un program își citește datele implicit. Dacă nu redirecționezi nimic, vine de la tastatură.',
    how: 'Fiecare proces pornește cu trei canale deschise: 0 (stdin), 1 (stdout), 2 (stderr). Operatorul < conectează stdin la un fișier; | îl conectează la ieșirea altei comenzi.',
    where: 'wc -l < fișier, sort < fișier, cat citind de la tastatură până la Ctrl+D.',
    topics: ['L1.5'],
  },
  {
    id: 'stdout', abbr: 'stdout', full: 'standard output (descriptor 1)', ro: 'ieșirea standard',
    what: 'Canalul pe care un program își scrie rezultatul normal. Implicit, ajunge în terminal.',
    how: '> fișier îl trimite într-un fișier (îl golește mai întâi); >> adaugă la sfârșit; | îl trimite ca intrare altei comenzi.',
    where: 'Salvarea rezultatelor, lanțuri de comenzi.',
    topics: ['L1.5'],
  },
  {
    id: 'stderr', abbr: 'stderr', full: 'standard error (descriptor 2)', ro: 'ieșirea de eroare standard',
    what: 'Canal separat pentru mesajele de eroare și diagnostic. Implicit, ajunge tot în terminal, dar este un canal diferit de stdout.',
    how: '2> fișier redirecționează doar erorile; 2>&1 face ca erorile să meargă acolo unde merge acum stdout; > fișier nu atinge stderr.',
    where: 'find / -name x 2>/dev/null ascunde erorile „Permission denied”. Un pipe transportă doar stdout.',
    topics: ['L1.5'],
  },
  {
    id: 'file-descriptor', abbr: 'file descriptor', ro: 'număr care identifică un canal deschis de un proces',
    what: 'Un întreg mic (0, 1, 2, 3...) pe care procesul îl folosește pentru a citi/scrie într-un fișier sau canal. 0, 1, 2 sunt rezervate pentru stdin, stdout, stderr.',
    how: 'Shell-ul pregătește descriptorii procesului copil înainte de execuție; redirecționările sunt, de fapt, înlocuiri ale acestor descriptori.',
    where: 'În sintaxa 2>&1: „descriptorul 2 devine o copie a descriptorului 1”.',
    topics: ['L1.5'], aliases: ['fd'],
  },
  {
    id: 'redirection', abbr: 'redirecționare', ro: 'schimbarea sursei sau destinației unui canal standard',
    what: 'Operatorii > , >> , < , 2> , &> modifică spre ce fișier merg sau de unde vin datele unei comenzi.',
    how: 'Shell-ul deschide fișierul (> îl trunchiază chiar atunci), îl atașează descriptorului și abia apoi pornește comanda. Comanda nu știe că a fost redirecționată.',
    where: 'Jurnale proprii, scripturi, salvarea output-ului pentru analiză.',
    topics: ['L1.5'],
  },
  {
    id: 'pipe', abbr: 'pipe ( | )', ro: 'conexiune între ieșirea unei comenzi și intrarea alteia',
    what: 'cmd1 | cmd2 trimite stdout-ul lui cmd1 direct în stdin-ul lui cmd2, fără fișier intermediar.',
    how: 'Shell-ul creează un canal în memorie și pornește ambele comenzi în paralel. Codul de ieșire al pipeline-ului este, implicit, cel al ultimei comenzi.',
    where: 'Filtrare și transformare pas cu pas: cut | sort | uniq | head.',
    topics: ['L1.5'], aliases: ['pipeline', 'conductă'],
  },
  {
    id: 'tee', abbr: 'tee', ro: 'comandă care scrie intrarea atât în stdout, cât și în fișiere',
    what: 'Ca o „teavă în T”: datele trec mai departe și se salvează simultan. tee -a adaugă la fișier în loc să-l suprascrie.',
    how: 'Citește stdin și scrie în stdout și în fiecare fișier primit ca argument.',
    where: 'Salvezi un rezultat intermediar dintr-un pipeline; sau scrii într-un fișier protejat: echo text | sudo tee /etc/fișier.',
    topics: ['L1.5'],
  },
  {
    id: 'dev-null', abbr: '/dev/null', ro: 'dispozitivul care aruncă tot ce primește',
    what: 'Un fișier special: orice scrii în el dispare; citirea lui dă imediat sfârșit de fișier.',
    how: 'Se folosește ca destinație pentru ceea ce nu vrei să vezi: comandă 2>/dev/null.',
    where: 'Suprimarea erorilor așteptate sau a întregului output.',
    topics: ['L1.5'],
  },
  {
    id: 'here-document', abbr: 'here document (<<)', ro: 'text multiplu inclus direct în linia de comandă',
    what: 'cmd <<EOF ... EOF trimite liniile de text dintre marcaje ca stdin al comenzii.',
    how: 'Marcajul de sfârșit (EOF, sau orice cuvânt ales) trebuie să fie singur pe linie. Cu <<\'EOF\' textul este literal; fără apostrofuri, shell-ul expandează variabilele.',
    where: 'Crearea rapidă a unor fișiere de câteva linii direct din terminal sau script.',
    topics: ['L1.5'], aliases: ['heredoc'],
  },
];
