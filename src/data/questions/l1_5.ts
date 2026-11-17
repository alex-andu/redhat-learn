import type { Question } from '../../lib/types';

const T = 'L1.5';
const O = ['C1-2'];

export const Q_L1_5: Question[] = [
  {
    id: 'L1.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Rulezi, în ordine: `echo a > f`, `echo b >> f`, `echo c > f`. Ce conține `f` la final?',
    explanation: '`>` trunchiază fișierul înainte de scriere; `>>` adaugă. Ultima comandă golește fișierul și scrie `c`.',
    options: [
      { id: 'a', text: 'O singură linie: `c`.', correct: true, why: 'Al treilea `>` golește fișierul (care avea `a` și `b`) și scrie `c`.' },
      { id: 'b', text: 'Trei linii: `a`, `b`, `c`.', correct: false, why: 'Ar fi adevărat dacă toate trei ar fi folosit `>>`.' },
      { id: 'c', text: 'Două linii: `b`, `c`.', correct: false, why: '`>` nu păstrează nimic din conținutul vechi.' },
      { id: 'd', text: 'Fișierul este gol.', correct: false, why: 'Ultima comandă a scris `c` după trunchiere.' },
    ],
  },
  {
    id: 'L1.5-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Rulezi `ls /nu-exista > out.txt`. Ce se întâmplă?',
    explanation: '`>` redirecționează doar stdout (descriptor 1). Mesajul de eroare este pe stderr (2), care rămâne pe terminal.',
    options: [
      { id: 'a', text: 'Eroarea apare pe ecran, iar `out.txt` este creat gol.', correct: true, why: '`out.txt` este deschis (și golit) de shell, dar `ls` nu scrie nimic pe stdout; eroarea merge pe stderr, către terminal.' },
      { id: 'b', text: 'Eroarea este scrisă în `out.txt`.', correct: false, why: 'Ar fi nevoie de `2>` sau `2>&1`.' },
      { id: 'c', text: '`out.txt` nu este creat, fiindcă comanda a eșuat.', correct: false, why: 'Redirecționarea se face înainte de comandă; fișierul este creat chiar dacă `ls` eșuează.' },
      { id: 'd', text: 'Nu apare nimic nicăieri.', correct: false, why: 'Eroarea este afișată pe terminal (stderr).' },
    ],
  },
  {
    id: 'L1.5-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre forme trimit atât stdout, cât și stderr ale comenzii `cmd` în fișierul `all.txt`? (alege toate cele corecte)',
    explanation: 'Ordinea contează: `2>&1` copiază destinația curentă a lui stdout. `&>` este scurtătura bash.',
    options: [
      { id: 'a', text: '`cmd > all.txt 2>&1`', correct: true, why: 'Întâi stdout în fișier, apoi stderr copiază stdout (fișierul).' },
      { id: 'b', text: '`cmd &> all.txt`', correct: true, why: 'Scurtătură bash pentru forma de mai sus.' },
      { id: 'c', text: '`cmd 2>&1 > all.txt`', correct: false, why: 'Întâi stderr copiază stdout (terminalul), apoi doar stdout merge în fișier; erorile rămân pe ecran.' },
      { id: 'd', text: '`cmd > all.txt`', correct: false, why: 'Redirecționează doar stdout.' },
    ],
  },
  {
    id: 'L1.5-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Rulează `find / -name core` fără să afișezi erorile (de tip „Permission denied”).',
    prompt: '[student@server1 ~]$',
    answers: ['find / -name core 2>/dev/null', 'find / -name core 2> /dev/null'],
    canonical: 'find / -name core 2>/dev/null',
    explanation: 'Erorile sunt pe stderr (descriptor 2); `2>/dev/null` le aruncă, iar rezultatele (stdout) rămân vizibile.',
    wrong: [
      { text: 'find / -name core > /dev/null', why: 'Aruncă stdout, adică exact rezultatele; erorile ar rămâne pe ecran.' },
      { text: 'find / -name core | /dev/null', why: '`/dev/null` nu este o comandă; un pipe cere o comandă în dreapta.' },
      { text: 'find / -name core 1>/dev/null', why: '`1>` este sinonim cu `>`: redirecționează stdout, nu stderr.' },
    ],
    hint: 'Descriptorul stderr este 2.',
  },
  {
    id: 'L1.5-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează componentele unui pipeline care afișează și salvează în `top3.txt` primele 3 nume de utilizator din `/etc/passwd`, în ordine alfabetică.',
    explanation: 'Extragi câmpul, sortezi, limitezi, apoi salvezi cu tee, care lasă datele să curgă și mai departe.',
    items: [
      { text: '`cut -d: -f1 /etc/passwd`', why: 'Extrage primul câmp (numele) din fiecare linie.' },
      { text: '`| sort`', why: 'Ordonează alfabetic numele.' },
      { text: '`| head -n 3`', why: 'Păstrează primele trei linii.' },
      { text: '`| tee top3.txt`', why: 'Salvează în fișier și afișează în același timp.' },
    ],
  },
  {
    id: 'L1.5-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește operatorul cu efectul.',
    explanation: 'Operatorii de redirecționare și pipe în bash.',
    leftLabel: 'Operator', rightLabel: 'Efect',
    pairs: [
      { left: '`>`', right: 'stdout într-un fișier, golindu-l mai întâi', why: 'Trunchiază destinația înainte de execuție.' },
      { left: '`>>`', right: 'stdout adăugat la sfârșitul fișierului', why: 'Păstrează conținutul existent.' },
      { left: '`2>`', right: 'doar stderr într-un fișier', why: '2 este descriptorul stderr.' },
      { left: '`<`', right: 'conținutul unui fișier ca stdin', why: 'Intrarea comenzii vine din fișier.' },
      { left: '`|`', right: 'stdout-ul unei comenzi devine stdin-ul alteia', why: 'Conectează comenzi, fără fișier intermediar.' },
    ],
    distractors: [{ text: 'rulează comanda în fundal', why: 'Aceasta este `&` la sfârșitul liniei, nu o redirecționare.' }],
  },
  {
    id: 'L1.5-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Vrei să sortezi `lista.txt` „pe loc”. După rularea comenzii de mai jos, fișierul este gol. De ce?',
    explanation: 'Shell-ul deschide și golește `lista.txt` înainte ca `sort` să pornească; `sort` citește un fișier deja gol.',
    snippet: { kind: 'find-error', title: 'comandă tastată', code: 'sort lista.txt > lista.txt' },
    options: [
      { id: 'a', text: 'Redirecționarea `>` trunchiază `lista.txt` înainte ca `sort` să-l citească.', correct: true, why: 'Redirecționările se aplică înaintea executării comenzii. Soluții: `sort -o lista.txt lista.txt` sau un fișier intermediar urmat de `mv`.' },
      { id: 'b', text: '`sort` nu poate citi fișiere text.', correct: false, why: '`sort` citește fișiere text fără probleme.' },
      { id: 'c', text: 'Trebuia `>>` pentru că fișierul există deja.', correct: false, why: '`>>` ar adăuga rezultatul la fișier, dar fișierul de intrare tot ar fi citit în același timp cu scrierea: nu rezolvă problema.' },
      { id: 'd', text: 'Fișierul trebuia citit cu `<`, nu dat ca argument.', correct: false, why: 'Forma cu `<` ar avea aceeași problemă: `>` golește fișierul înainte de citire.' },
    ],
  },
  {
    id: 'L1.5-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce afișează cele două comenzi rezultate diferite, deși numără aceleași linii?',
    explanation: 'Cu un fișier ca argument, `wc` îi cunoaște numele și îl afișează. Cu `<`, primește doar un flux pe stdin, fără nume.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'wc -l', code: '[student@server1 ~]$ wc -l /etc/passwd\n45 /etc/passwd\n[student@server1 ~]$ wc -l < /etc/passwd\n45' },
    options: [
      { id: 'a', text: 'În al doilea caz, `wc` citește de la stdin și nu are un nume de fișier de afișat.', correct: true, why: 'Shell-ul a conectat fișierul la stdin; programul nu știe de unde provin datele.' },
      { id: 'b', text: 'În al doilea caz, `wc` numără doar liniile goale.', correct: false, why: 'Numără aceleași linii (45).' },
      { id: 'c', text: 'Primul caz numără și numele fișierului.', correct: false, why: 'Numele fișierului nu este numărat; este doar afișat lângă rezultat.' },
      { id: 'd', text: '`<` face `wc` să ignore opțiunea `-l`.', correct: false, why: 'Opțiunea `-l` se aplică în ambele cazuri; altfel ar afișa linii, cuvinte și octeți.' },
    ],
  },
  {
    id: 'L1.5-009', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pe baza erorii, care este cauza și remedierea corectă?',
    explanation: 'Redirecționarea o face shell-ul tău, ca utilizator obișnuit, înainte ca `sudo` să ruleze. `sudo` se aplică doar lui `echo`.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ sudo echo "test" > /etc/exemplu.conf\nbash: /etc/exemplu.conf: Permission denied' },
    options: [
      { id: 'a', text: 'Fișierul este deschis de shell-ul tău, fără privilegii; remediere: `echo "test" | sudo tee /etc/exemplu.conf`.', correct: true, why: '`tee` rulează cu `sudo` și deschide el fișierul; folosește `tee -a` pentru adăugare.' },
      { id: 'b', text: '`sudo` nu funcționează cu `echo`; remediere: folosești `printf`.', correct: false, why: '`sudo echo` rulează; problema este redirecționarea, nu comanda.' },
      { id: 'c', text: 'Lipsește opțiunea `-f` la `sudo`.', correct: false, why: '`-f` nu rezolvă problema; privilegiile trebuie să se aplice deschiderii fișierului.' },
      { id: 'd', text: 'Trebuie `>>` în loc de `>`.', correct: false, why: 'Și `>>` ar fi executat tot de shell-ul fără privilegii.' },
    ],
  },
];
