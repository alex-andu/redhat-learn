import type { Question } from '../../lib/types';

const T = 'L3.2';
const O = ['C3-3'];

export const Q_L3_2: Question[] = [
  {
    id: 'L3.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Rulezi `./s.sh ana bogdan`. Ce conține `$2` în script?',
    explanation: '`$1` este primul argument, `$2` al doilea; `$0` este numele scriptului.',
    options: [
      { id: 'a', text: '`bogdan`', correct: true, why: 'Al doilea argument.' },
      { id: 'b', text: '`ana`', correct: false, why: '`ana` este `$1`.' },
      { id: 'c', text: '`./s.sh`', correct: false, why: 'Acesta este `$0`.' },
      { id: 'd', text: '`2`', correct: false, why: '`2` ar fi valoarea lui `$#` (numărul argumentelor).' },
    ],
  },
  {
    id: 'L3.2-002', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește parametrul cu ce conține.',
    explanation: 'Parametrii speciali ai unui script bash.',
    leftLabel: 'Parametru', rightLabel: 'Conținut',
    pairs: [
      { left: '`$0`', right: 'numele cu care a fost pornit scriptul', why: 'Nu este un argument propriu-zis.' },
      { left: '`$#`', right: 'numărul de argumente', why: 'Fără `$0`.' },
      { left: '`"$@"`', right: 'toate argumentele, fiecare ca element separat', why: 'Cu ghilimele păstrează spațiile din interiorul unui argument.' },
      { left: '`$?`', right: 'codul de ieșire al ultimei comenzi', why: 'Se schimbă după fiecare comandă.' },
    ],
    distractors: [{ text: 'directorul curent', why: 'Directorul curent este în `$PWD`.' }],
  },
  {
    id: 'L3.2-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Rulezi `./params.sh "ana maria" bogdan`. Ce valoare are `$#`?',
    explanation: 'Ghilimelele din linia de comandă fac din „ana maria” un singur argument.',
    options: [
      { id: 'a', text: '`2`', correct: true, why: 'Două argumente: „ana maria” și `bogdan`.' },
      { id: 'b', text: '`3`', correct: false, why: 'Ar fi 3 doar fără ghilimele.' },
      { id: 'c', text: '`1`', correct: false, why: '`bogdan` este un al doilea argument.' },
      { id: 'd', text: '`0`', correct: false, why: 'Au fost date argumente.' },
    ],
  },
  {
    id: 'L3.2-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Scrie linia care verifică (cu `if` și `[ ]`) dacă numărul de argumente este mai mic decât 1; nu scrie corpul.',
    prompt: 'script.sh>',
    answers: ['if [ $# -lt 1 ]; then', 'if [ "$#" -lt 1 ]; then', 'if [ $# -eq 0 ]; then', 'if [ "$#" -eq 0 ]; then'],
    canonical: 'if [ $# -lt 1 ]; then',
    explanation: '`$#` este numărul argumentelor; `-lt` compară numeric; `; then` încheie condiția.',
    wrong: [
      { text: 'if [ $# < 1 ]; then', why: '`<` este redirecționare în shell, nu comparație.' },
      { text: 'if [ $@ -lt 1 ]; then', why: '`$@` este lista argumentelor, nu numărul.' },
      { text: 'if [$# -lt 1]; then', why: 'Lipsesc spațiile din jurul parantezelor.' },
    ],
    hint: 'Folosește $# și operatorul numeric -lt.',
  },
  {
    id: 'L3.2-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce afișează scriptul când este rulat fără argumente?',
    explanation: 'Un argument lipsă este un șir vid; bash nu dă eroare.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'script și rulare', code: '#!/bin/bash\necho "Salut, $1!"\n\n[student@server1 ~]$ ./salut.sh\nSalut, !' },
    options: [
      { id: 'a', text: 'Afișează „Salut, !” — `$1` este șir vid.', correct: true, why: 'Lipsa argumentului nu produce eroare; trebuie să verifici tu `$#`.' },
      { id: 'b', text: 'Eroare: „missing argument”.', correct: false, why: 'Bash nu cere ca argumentele să existe.' },
      { id: 'c', text: 'Se oprește cu cod 127.', correct: false, why: '127 înseamnă comandă negăsită.' },
      { id: 'd', text: 'Cere automat argumentul de la tastatură.', correct: false, why: 'Pentru citire de la tastatură este nevoie de `read`.' },
    ],
  },
  {
    id: 'L3.2-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este diferența între `"$@"` și `"$*"` într-o buclă `for`?',
    explanation: '`"$@"` păstrează granițele argumentelor; `"$*"` le lipește într-un singur cuvânt.',
    options: [
      { id: 'a', text: '`"$@"` produce un element pentru fiecare argument; `"$*"` produce un singur element cu toate.', correct: true, why: 'De aceea `"$@"` este alegerea uzuală.' },
      { id: 'b', text: 'Sunt identice.', correct: false, why: 'Diferă tocmai între ghilimele.' },
      { id: 'c', text: '`"$*"` păstrează spațiile din argumente, `"$@"` nu.', correct: false, why: 'Este invers.' },
      { id: 'd', text: '`"$@"` conține și `$0`.', correct: false, why: '`$0` nu face parte din `$@`.' },
    ],
  },
  {
    id: 'L3.2-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Care linie atribuie corect valoarea implicită `student` dacă `$1` lipsește?',
    explanation: 'Expansiunea `${1:-student}` folosește valoarea implicită când `$1` este vid sau nedefinit.',
    options: [
      { id: 'a', text: '`nume="${1:-student}"`', correct: true, why: 'Dacă `$1` este gol, `nume` devine `student`.' },
      { id: 'b', text: '`nume = "${1:-student}"`', correct: false, why: 'Spațiile din jurul lui `=` fac din `nume` o comandă.' },
      { id: 'c', text: '`nume="$1:-student"`', correct: false, why: 'Fără acolade, `:-student` rămâne text literal după `$1`.' },
      { id: 'd', text: '`nume="${1:?student}"`', correct: false, why: '`:?` oprește scriptul cu mesaj de eroare; nu dă valoare implicită.' },
    ],
  },
  {
    id: 'L3.2-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre `shift` sunt adevărate? (alege toate cele corecte)',
    explanation: '`shift` elimină primul parametru și mută restul la stânga.',
    options: [
      { id: 'a', text: 'Vechiul `$2` devine `$1`.', correct: true, why: 'Parametrii se mută cu o poziție la stânga.' },
      { id: 'b', text: '`$#` scade cu 1.', correct: true, why: 'Numărul argumentelor rămase scade.' },
      { id: 'c', text: '`$0` se schimbă.', correct: false, why: '`$0` nu face parte din deplasare.' },
      { id: 'd', text: 'Șterge fișierul primit ca argument.', correct: false, why: 'Operează doar asupra parametrilor, nu a fișierelor.' },
    ],
  },
  {
    id: 'L3.2-009', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează liniile unui script care cere un nume ca argument.',
    explanation: 'Verifici argumentele, ieși la nevoie, apoi folosești valoarea.',
    items: [
      { text: '`#!/bin/bash`', why: 'Shebang pe prima linie.' },
      { text: '`if [ $# -lt 1 ]; then echo "Folosire: $0 NUME" >&2; exit 1; fi`', why: 'Validezi că ai primit argumentul și ieși cu cod nenul dacă lipsește.' },
      { text: '`nume="$1"`', why: 'Salvezi valoarea într-o variabilă.' },
      { text: '`echo "Salut, $nume!"`', why: 'Folosești valoarea, între ghilimele.' },
    ],
  },
  {
    id: 'L3.2-010', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Scriptul nu se comportă ca în intenție. Care este greșeala?',
    explanation: 'Atribuirea nu are spații în jurul lui `=`.',
    snippet: { kind: 'find-error', title: 'script și rulare', code: '#!/bin/bash\nnume = "$1"\necho "Salut, $nume"\n\n[student@server1 ~]$ ./salut.sh ana\n./salut.sh: line 2: nume: command not found\nSalut, ' },
    options: [
      { id: 'a', text: 'Spațiile din jurul lui `=`; corect: `nume="$1"`.', correct: true, why: 'Cu spații, bash rulează o comandă numită `nume`, cu argumentele `=` și valoarea.' },
      { id: 'b', text: 'Lipsește `chmod +x`.', correct: false, why: 'Scriptul a pornit; eroarea apare la linia 2.' },
      { id: 'c', text: '`$1` trebuie scris `${1}0`.', correct: false, why: 'Nu are legătură cu eroarea.' },
      { id: 'd', text: 'Variabilele trebuie scrise cu majuscule.', correct: false, why: 'Majusculele sunt doar o convenție, nu o regulă.' },
    ],
  },
];
