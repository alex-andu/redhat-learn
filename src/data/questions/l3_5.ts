import type { Question } from '../../lib/types';

const T = 'L3.5';
const O = ['C3-4'];

export const Q_L3_5: Question[] = [
  {
    id: 'L3.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce face `azi=$(date +%F)`?',
    explanation: '`$( )` înlocuiește expresia cu ce afișează comanda.',
    options: [
      { id: 'a', text: 'Rulează `date +%F` și pune textul rezultat în variabila `azi`.', correct: true, why: 'Substituție de comandă.' },
      { id: 'b', text: 'Pune textul literal `date +%F` în `azi`.', correct: false, why: 'Aceasta ar fi atribuirea fără `$( )`.' },
      { id: 'c', text: 'Afișează data pe ecran.', correct: false, why: 'Atribuirea captează output-ul; nu îl afișează.' },
      { id: 'd', text: 'Setează data sistemului.', correct: false, why: '`date` fără `-s` doar afișează.' },
    ],
  },
  {
    id: 'L3.5-002', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Variabila `nr` conține `42 /etc/passwd` și `[ "$nr" -gt 10 ]` dă `integer expression expected`. Cum obții doar numărul?',
    explanation: '`wc -l fișier` afișează și numele; cu redirecționare de intrare afișează doar numărul.',
    options: [
      { id: 'a', text: '`nr=$(wc -l < /etc/passwd)`', correct: true, why: 'Fișierul intră pe stdin, deci `wc` nu mai are un nume de afișat.' },
      { id: 'b', text: '`nr=$(wc -l /etc/passwd)`', correct: false, why: 'Aceasta produce exact problema.' },
      { id: 'c', text: '`nr="wc -l /etc/passwd"`', correct: false, why: 'Fără `$( )`, comanda nu este rulată.' },
      { id: 'd', text: '`nr=wc -l /etc/passwd`', correct: false, why: 'Bash vede `nr=wc` ca atribuire temporară și încearcă să execute `-l`; rezultatul lui `wc` nu ajunge în variabilă.' },
    ],
  },
  {
    id: 'L3.5-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează doar primul câmp (numele utilizatorului) din `/etc/passwd`, folosind `cut`.',
    prompt: '[student@server1 ~]$',
    answers: ['cut -d: -f1 /etc/passwd', 'cut -f1 -d: /etc/passwd', "cut -d ':' -f 1 /etc/passwd", "cut -d ':' -f1 /etc/passwd"],
    canonical: 'cut -d: -f1 /etc/passwd',
    explanation: '`-d:` = delimitator `:`; `-f1` = primul câmp.',
    wrong: [
      { text: 'cut -f1 /etc/passwd', why: 'Delimitatorul implicit este TAB, nu `:`.' },
      { text: 'cut -d: -f7 /etc/passwd', why: 'Câmpul 7 este shell-ul, nu utilizatorul.' },
      { text: 'cut -c1 /etc/passwd', why: '`-c1` extrage primul CARACTER al fiecărei linii.' },
    ],
    hint: 'Delimitatorul din /etc/passwd este “:”.',
  },
  {
    id: 'L3.5-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce afișează aceste comenzi?',
    explanation: '`grep -c` numără liniile potrivite; `$` ancorează la sfârșit de linie.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: "[student@server1 ~]$ grep -c '/bin/bash$' /etc/passwd\n3" },
    options: [
      { id: 'a', text: 'Există 3 linii în `/etc/passwd` care se termină cu `/bin/bash` (3 utilizatori cu acel shell).', correct: true, why: '`-c` afișează doar numărul liniilor care se potrivesc.' },
      { id: 'b', text: 'Fișierul are 3 linii în total.', correct: false, why: 'Numărarea este doar a celor potrivite.' },
      { id: 'c', text: 'Utilizatorul 3 are shell bash.', correct: false, why: 'Numărul nu este un UID.' },
      { id: 'd', text: 'Comanda a eșuat cu codul 3.', correct: false, why: 'Numărul este output (stdout), nu cod de ieșire.' },
    ],
  },
  {
    id: 'L3.5-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei doar să știi dacă există linia `root:` în `/etc/passwd`, fără a afișa nimic. Ce folosești în `if`?',
    explanation: '`grep -q` nu afișează nimic și întoarce 0 dacă găsește.',
    options: [
      { id: 'a', text: '`if grep -q "^root:" /etc/passwd; then …`', correct: true, why: 'Testul se bazează pe codul de ieșire.' },
      { id: 'b', text: '`if [ grep "^root:" /etc/passwd ]; then …`', correct: false, why: '`[ ]` primește `grep` ca text, nu rulează comanda.' },
      { id: 'c', text: '`if $(grep "^root:" /etc/passwd); then …`', correct: false, why: 'Ar rula output-ul ca pe o comandă.' },
      { id: 'd', text: '`if grep "^root:" /etc/passwd == 0; then …`', correct: false, why: '`== 0` ar fi argumente extra pentru grep.' },
    ],
  },
  {
    id: 'L3.5-006', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează lanțul care afișează cele mai frecvente shell-uri din `/etc/passwd`.',
    explanation: '`uniq -c` numără doar duplicate consecutive; de aceea sortezi înainte.',
    items: [
      { text: '`cut -d: -f7 /etc/passwd`', why: 'Extrage câmpul shell.' },
      { text: '`sort`', why: 'Aduce valorile identice una lângă alta.' },
      { text: '`uniq -c`', why: 'Numără aparițiile fiecărei valori.' },
      { text: '`sort -rn`', why: 'Ordonează numeric descrescător.' },
    ],
  },
  {
    id: 'L3.5-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Scriptul afișează `Total: 0`, deși există utilizatori cu bash. Cauza?',
    explanation: 'Într-un pipeline, `while` rulează într-un subshell; `count` se pierde.',
    snippet: { kind: 'find-error', title: 'script', code: '#!/bin/bash\ncount=0\ngrep bash /etc/passwd | while IFS=: read -r u x; do\n  count=$((count + 1))\ndone\necho "Total: $count"' },
    options: [
      { id: 'a', text: 'Bucla rulează într-un subshell (din cauza pipe-ului); folosește `done < <(…)` sau `grep -c`.', correct: true, why: 'Variabila modificată în subshell nu revine în scriptul principal.' },
      { id: 'b', text: '`IFS=:` este invalid.', correct: false, why: 'Este o sintaxă validă pentru `read`.' },
      { id: 'c', text: 'Lipsește `exit 0`.', correct: false, why: 'Nu are legătură cu variabila.' },
      { id: 'd', text: '`grep` nu poate fi folosit într-un pipe.', correct: false, why: 'Pipe-ul cu `grep` este uzual.' },
    ],
  },
  {
    id: 'L3.5-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre `$( )` sunt adevărate? (alege toate cele corecte)',
    explanation: 'Substituția captează stdout; fără ghilimele, rezultatul este spart la spații.',
    options: [
      { id: 'a', text: 'Captează ce comanda scrie pe stdout.', correct: true, why: 'Newline-urile finale sunt eliminate.' },
      { id: 'b', text: 'Fără ghilimele, rezultatul trece prin word splitting și globbing.', correct: true, why: 'De aceea `"$(comandă)"` este mai sigur.' },
      { id: 'c', text: 'Captează și mesajele de eroare (stderr).', correct: false, why: 'stderr apare pe ecran, nu în variabilă.' },
      { id: 'd', text: 'Este singura formă posibilă; backticks nu funcționează.', correct: false, why: 'Backticks fac același lucru, dar sunt învechite și greu de imbricat.' },
    ],
  },
  {
    id: 'L3.5-009', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește utilitarul cu rolul lui în procesarea output-ului.',
    explanation: 'Unelte de filtrare folosite în scripturi.',
    leftLabel: 'Utilitar', rightLabel: 'Rol',
    pairs: [
      { left: '`cut -d: -f1`', right: 'extrage o coloană după un delimitator', why: '`-d` = delimitator, `-f` = câmp.' },
      { left: '`wc -l`', right: 'numără liniile', why: 'Cu `<` afișează doar numărul.' },
      { left: '`grep -q`', right: 'testează existența unei potriviri prin cod de ieșire, fără output', why: 'Util direct în `if`.' },
      { left: '`sort | uniq -c`', right: 'numără aparițiile valorilor identice', why: '`uniq` numără doar duplicate consecutive, de aceea `sort`.' },
    ],
    distractors: [{ text: 'șterge fișierele care se potrivesc', why: 'Niciunul dintre utilitare nu șterge fișiere.' }],
  },
];
