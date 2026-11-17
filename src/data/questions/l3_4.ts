import type { Question } from '../../lib/types';

const T = 'L3.4';
const O = ['C3-2'];

export const Q_L3_4: Question[] = [
  {
    id: 'L3.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce afișează `for x in a b c; do echo "$x"; done`?',
    explanation: 'Corpul rulează o dată pentru fiecare element.',
    options: [
      { id: 'a', text: '`a`, `b`, `c`, fiecare pe o linie.', correct: true, why: 'Trei iterații.' },
      { id: 'b', text: '`a b c` pe o singură linie.', correct: false, why: 'Echo rulează de trei ori, nu o dată.' },
      { id: 'c', text: 'Nimic.', correct: false, why: 'Lista nu este goală.' },
      { id: 'd', text: '`x` de trei ori.', correct: false, why: 'Fără `$`, ar fi text; aici `$x` ia valorile.' },
    ],
  },
  {
    id: 'L3.4-002', topicId: T, objectives: O, difficulty: 1, type: 'order',
    stem: 'Ordonează elementele unei bucle `for`.',
    explanation: 'Sintaxa buclei for.',
    items: [
      { text: '`for f in *.txt`', why: 'Declară variabila și lista.' },
      { text: '`do`', why: 'Începe corpul.' },
      { text: '`echo "$f"`', why: 'Corpul: comenzi pentru fiecare element.' },
      { text: '`done`', why: 'Încheie bucla.' },
    ],
  },
  {
    id: 'L3.4-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Directorul conține fișierul `c d.txt`. Care buclă îl redenumește corect în `c d.txt.bak`?',
    explanation: 'Variabila buclei trebuie pusă între ghilimele ca numele cu spațiu să rămână întreg.',
    options: [
      { id: 'a', text: '`for f in *.txt; do mv "$f" "$f.bak"; done`', correct: true, why: 'Globul păstrează numele întreg, iar ghilimelele îl protejează la `mv`.' },
      { id: 'b', text: '`for f in *.txt; do mv $f $f.bak; done`', correct: false, why: 'Fără ghilimele, „c d.txt” devine două argumente.' },
      { id: 'c', text: '`for f in $(ls *.txt); do mv "$f" "$f.bak"; done`', correct: false, why: '`$(ls)` este spart la spații înainte de buclă.' },
      { id: 'd', text: '`for f in *.txt do mv "$f" "$f.bak" done`', correct: false, why: 'Lipsesc `;` (sau linii noi) înainte de `do` și `done`.' },
    ],
  },
  {
    id: 'L3.4-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Scrie comanda (pe o singură linie) care afișează pe rând numerele 1, 2 și 3 cu `echo "$i"`.',
    prompt: '[student@server1 ~]$',
    answers: ['for i in 1 2 3; do echo "$i"; done', 'for i in {1..3}; do echo "$i"; done', 'for i in {1..3}; do echo $i; done', 'for i in 1 2 3; do echo $i; done'],
    canonical: 'for i in {1..3}; do echo "$i"; done',
    explanation: 'Lista poate fi scrisă explicit sau cu expansiune cu acolade.',
    wrong: [
      { text: 'for i in {1 .. 3}; do echo "$i"; done', why: 'Spațiile din acolade împiedică expansiunea.' },
      { text: 'for i in 1..3; do echo "$i"; done', why: 'Fără acolade, `1..3` este un singur cuvânt.' },
      { text: 'for i in {1..3} do echo "$i"; done', why: 'Lipsește `;` înainte de `do`.' },
    ],
    hint: 'Acolade fără spații: {1..3}.',
  },
  {
    id: 'L3.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este metoda recomandată pentru a citi un fișier rând cu rând, păstrând liniile cu spații întregi?',
    explanation: '`while read` citește linii; `for x in $(cat …)` citește cuvinte.',
    options: [
      { id: 'a', text: '`while IFS= read -r linie; do …; done < fisier`', correct: true, why: '`read` citește câte o linie; `-r` și `IFS=` păstrează conținutul.' },
      { id: 'b', text: '`for linie in $(cat fisier); do …; done`', correct: false, why: 'Se sparge pe spații: „ana maria” devine două elemente.' },
      { id: 'c', text: '`for linie in fisier; do …; done`', correct: false, why: 'Iterează peste cuvântul „fisier”, nu peste conținut.' },
      { id: 'd', text: '`until read linie; do …; done`', correct: false, why: '`until` repetă cât timp comanda eșuează; logica este inversată.' },
    ],
  },
  {
    id: 'L3.4-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Scriptul afișează `Total: 0` deși fișierul are 3 linii. Care este cauza?',
    explanation: 'Un pipe pornește bucla într-un subshell; modificările variabilelor se pierd.',
    snippet: { kind: 'find-error', title: 'script', code: '#!/bin/bash\nnr=0\ncat nume.txt | while read -r l; do\n  nr=$((nr + 1))\ndone\necho "Total: $nr"' },
    options: [
      { id: 'a', text: 'Bucla rulează într-un subshell din cauza pipe-ului; trebuie `done < nume.txt`.', correct: true, why: 'Variabila `nr` modificată în subshell nu se vede în părinte.' },
      { id: 'b', text: '`$((nr + 1))` nu este aritmetică validă.', correct: false, why: 'Sintaxa este validă.' },
      { id: 'c', text: 'Fișierul trebuie citit cu `for`.', correct: false, why: '`for` nu rezolvă problema; sparge liniile.' },
      { id: 'd', text: 'Lipsește `exit 0`.', correct: false, why: 'Nu influențează variabila.' },
    ],
  },
  {
    id: 'L3.4-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre `*.txt` într-un `for` sunt adevărate? (alege toate cele corecte)',
    explanation: 'Expansiunea glob este făcută de bash, înaintea buclei.',
    options: [
      { id: 'a', text: 'Bash înlocuiește `*.txt` cu lista fișierelor care se potrivesc.', correct: true, why: 'Globbing (L1.3).' },
      { id: 'b', text: 'Dacă nu există fișiere `.txt`, tiparul rămâne literal (comportament implicit).', correct: true, why: 'Corpul rulează o dată cu valoarea `*.txt`.' },
      { id: 'c', text: 'Numele cu spații sunt împărțite automat în două elemente.', correct: false, why: 'Globul păstrează numele întregi; riscul apare la `$(ls)` sau la variabile fără ghilimele.' },
      { id: 'd', text: 'Lista este goală dacă nu există potriviri.', correct: false, why: 'Implicit nu: rămâne tiparul.' },
    ],
  },
  {
    id: 'L3.4-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește construcția cu efectul.',
    explanation: 'Control al buclelor.',
    leftLabel: 'Construcție', rightLabel: 'Efect',
    pairs: [
      { left: '`break`', right: 'iese din buclă', why: 'Execuția continuă după `done`.' },
      { left: '`continue`', right: 'sare la următoarea iterație', why: 'Restul corpului este omis.' },
      { left: '`while [ $n -gt 0 ]`', right: 'repetă cât timp testul are cod 0', why: 'Corpul trebuie să schimbe `n`.' },
      { left: '`for a in "$@"`', right: 'parcurge argumentele scriptului', why: 'Păstrează granițele argumentelor.' },
    ],
    distractors: [{ text: 'repetă o comandă la infinit, mereu', why: 'Doar o condiție mereu adevărată face o buclă infinită.' }],
  },
  {
    id: 'L3.4-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce apare `[c]` și `[d.txt]` separat?',
    explanation: 'Fără ghilimele, rezultatul lui `$(ls)` este spart la spații.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ ls\na.txt  c d.txt\n[student@server1 ~]$ for f in $(ls); do echo "[$f]"; done\n[a.txt]\n[c]\n[d.txt]' },
    options: [
      { id: 'a', text: '`$(ls)` neprotejat este despărțit la spații (word splitting), deci „c d.txt” devine două elemente.', correct: true, why: 'Soluția: glob (`for f in *`) sau `while read`.' },
      { id: 'b', text: 'Fișierul „c d.txt” este de fapt două fișiere.', correct: false, why: '`ls` îl arată ca un singur nume.' },
      { id: 'c', text: 'Bucla `for` iterează pe litere.', correct: false, why: 'Iterează pe cuvinte rezultate din expansiune.' },
      { id: 'd', text: 'Comanda `echo` taie textul la spațiu.', correct: false, why: 'Spargerea are loc înainte, la expansiunea listei.' },
    ],
  },
];
