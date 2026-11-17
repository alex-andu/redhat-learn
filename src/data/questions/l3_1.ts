import type { Question } from '../../lib/types';

const T = 'L3.1';
const O: string[] = [];

export const Q_L3_1: Question[] = [
  {
    id: 'L3.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este prima linie corectă a unui script bash?',
    explanation: 'Shebang-ul `#!` urmat de calea interpretorului trebuie să fie pe prima linie.',
    options: [
      { id: 'a', text: '`#!/bin/bash`', correct: true, why: 'Kernelul citește `#!` și pornește `/bin/bash` cu scriptul ca argument.' },
      { id: 'b', text: '`!#/bin/bash`', correct: false, why: 'Ordinea caracterelor este greșită; nu este recunoscut ca shebang.' },
      { id: 'c', text: '`#/bin/bash`', correct: false, why: 'Fără `!` este doar un comentariu.' },
      { id: 'd', text: '`bash script.sh`', correct: false, why: 'Aceasta este o comandă de rulare, nu o linie din fișier.' },
    ],
  },
  {
    id: 'L3.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Fișierul `salut.sh` are permisiunile `-rw-r--r--`. Ce se întâmplă la `./salut.sh`?',
    explanation: 'Rularea directă cere bitul `x`.',
    options: [
      { id: 'a', text: '`Permission denied`, pentru că lipsește bitul de execuție.', correct: true, why: 'Fără `x`, kernelul nu execută fișierul; codul de ieșire este 126.' },
      { id: 'b', text: 'Se rulează normal, pentru că ai drept de citire.', correct: false, why: 'Citirea permite doar ca `bash salut.sh` să citească fișierul, nu execuția directă.' },
      { id: 'c', text: '`command not found`.', correct: false, why: 'Calea `./` este dată; comanda a fost găsită, dar nu poate fi executată.' },
      { id: 'd', text: 'Shell-ul adaugă automat bitul `x`.', correct: false, why: 'Permisiunile se schimbă doar cu `chmod`.' },
    ],
  },
  {
    id: 'L3.1-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Adaugă permisiunea de execuție la fișierul `salut.sh` din directorul curent.',
    prompt: '[student@server1 ~]$',
    answers: ['chmod +x salut.sh', 'chmod u+x salut.sh', 'chmod a+x salut.sh', 'chmod 755 salut.sh'],
    canonical: 'chmod +x salut.sh',
    explanation: '`chmod +x` adaugă bitul de execuție (L1.8).',
    wrong: [
      { text: 'chmod -x salut.sh', why: '`-x` ÎNLĂTURĂ permisiunea de execuție.' },
      { text: 'chmod r salut.sh', why: 'Sintaxă invalidă; modul simbolic cere + sau -.' },
      { text: 'exec salut.sh', why: '`exec` înlocuiește shell-ul cu un proces; nu schimbă permisiunile.' },
    ],
    hint: 'chmod, apoi +x, apoi fișierul.',
  },
  {
    id: 'L3.1-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Rulezi `ls /nu-exista`, apoi `echo "gata"`, apoi `echo $?`. Ce afișează ultima comandă?',
    explanation: '`$?` este codul ultimei comenzi rulate, adică al lui `echo "gata"`.',
    options: [
      { id: 'a', text: '`0`', correct: true, why: '`echo "gata"` a reușit; `$?` nu mai reflectă `ls`.' },
      { id: 'b', text: 'Un cod nenul, de la `ls`.', correct: false, why: 'Codul lui `ls` a fost înlocuit de cel al comenzii următoare.' },
      { id: 'c', text: '`127`', correct: false, why: '127 înseamnă „comandă negăsită”; `echo` există.' },
      { id: 'd', text: 'Nimic: `$?` este gol.', correct: false, why: '`$?` conține mereu codul ultimei comenzi.' },
    ],
  },
  {
    id: 'L3.1-005', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește codul de ieșire cu semnificația uzuală.',
    explanation: 'Convenții bash/POSIX pentru coduri de ieșire.',
    leftLabel: 'Cod', rightLabel: 'Semnificație',
    pairs: [
      { left: '`0`', right: 'succes', why: 'Orice altă valoare indică o eroare sau o stare specială.' },
      { left: '`126`', right: 'comanda a fost găsită, dar nu este executabilă', why: 'Apare de exemplu la un script fără bit `x`.' },
      { left: '`127`', right: 'comanda nu a fost găsită', why: 'Însoțit de mesajul `command not found`.' },
      { left: '`130`', right: 'oprit cu Ctrl+C', why: '128 + 2 (semnalul SIGINT).' },
    ],
    distractors: [{ text: 'sintaxă greșită în `if`', why: 'Nu există un cod dedicat; eroarea de sintaxă are un mesaj propriu.' }],
  },
  {
    id: 'L3.1-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Scriptul rulat direct produce eroarea de mai jos. Care este cauza cea mai probabilă?',
    explanation: 'CRLF (terminatori de linie Windows) în shebang face ca interpretorul să fie `bash\\r`.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ ./salut.sh\nbash: ./salut.sh: /bin/bash^M: bad interpreter: No such file or directory' },
    options: [
      { id: 'a', text: 'Fișierul are terminatori de linie Windows (CRLF); `^M` este `\\r` din prima linie.', correct: true, why: '`^M` indică returnarea caretului la finalul shebang-ului; kernelul caută un interpretor cu acest nume.' },
      { id: 'b', text: 'Lipsește bitul `x`.', correct: false, why: 'Lipsa lui `x` dă `Permission denied`, nu `bad interpreter`.' },
      { id: 'c', text: 'Scriptul nu este în `PATH`.', correct: false, why: 'S-a folosit `./`; calea este dată.' },
      { id: 'd', text: '`bash` nu este instalat.', correct: false, why: 'Mesajul arată `^M` după `/bin/bash`, deci problema este în fișier.' },
    ],
  },
  {
    id: 'L3.1-007', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a crea și rula un script.',
    explanation: 'Scrii, faci executabil, rulezi, citești codul.',
    items: [
      { text: '`nano script.sh` (cu shebang pe prima linie)', why: 'Creezi fișierul cu conținutul.' },
      { text: '`chmod +x script.sh`', why: 'Fără `x` nu merge rularea directă.' },
      { text: '`./script.sh`', why: 'Rulezi scriptul din directorul curent.' },
      { text: '`echo $?`', why: 'Citești codul de ieșire imediat după rulare.' },
    ],
  },
  {
    id: 'L3.1-008', topicId: T, objectives: O, difficulty: 3, type: 'multi',
    stem: 'Care dintre metodele de mai jos pornesc scriptul `salut.sh` când fișierul NU are bit `x`? (alege toate cele corecte)',
    explanation: '`bash fișier` citește fișierul, deci nu cere `x`; `source` îl citește în shell-ul curent.',
    options: [
      { id: 'a', text: '`bash salut.sh`', correct: true, why: 'Bash deschide fișierul pentru citire; nu cere execuție.' },
      { id: 'b', text: '`source salut.sh`', correct: true, why: 'Comenzile sunt citite și rulate în shell-ul curent; cere doar `r`.' },
      { id: 'c', text: '`./salut.sh`', correct: false, why: 'Rularea directă cere `x`.' },
      { id: 'd', text: '`salut.sh` (fără cale, directorul curent nu e în PATH)', correct: false, why: 'Shell-ul caută doar în `PATH`; nu va găsi fișierul.' },
    ],
  },
  {
    id: 'L3.1-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți spune această sesiune?',
    explanation: '126 înseamnă că fișierul a fost găsit, dar nu poate fi executat (aici, lipsește `x`).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ ls -l salut.sh\n-rw-r--r--. 1 student student 112 Nov 16 10:00 salut.sh\n[student@server1 ~]$ ./salut.sh\nbash: ./salut.sh: Permission denied\n[student@server1 ~]$ echo $?\n126' },
    options: [
      { id: 'a', text: 'Fișierul există, dar nu are bit `x`; rularea directă eșuează cu codul 126.', correct: true, why: 'Permisiunile `rw-r--r--` nu includ execuția; 126 = găsit, dar neexecutabil.' },
      { id: 'b', text: 'Fișierul nu există.', correct: false, why: '`ls -l` îl listează; pentru un fișier inexistent codul ar fi 127.' },
      { id: 'c', text: 'Scriptul a rulat și a terminat cu eroare internă.', correct: false, why: 'Mesajul `Permission denied` apare înainte de execuție.' },
      { id: 'd', text: 'Shebang-ul este greșit.', correct: false, why: 'Un shebang greșit dă `bad interpreter`, nu `Permission denied`.' },
    ],
  },
];
