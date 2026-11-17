import type { Question } from '../../lib/types';

const T = 'L1.3';
const O = ['C1-8'];

export const Q_L1_3: Question[] = [
  {
    id: 'L1.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ești în `/home/student`. Care dintre căi este absolută?',
    explanation: 'O cale absolută începe cu `/` și nu depinde de directorul curent.',
    options: [
      { id: 'a', text: '`docs/plan.txt`', correct: false, why: 'Nu începe cu `/`: este relativă, interpretată față de directorul curent.' },
      { id: 'b', text: '`../student/docs`', correct: false, why: 'Folosește `..` (părintele directorului curent): relativă.' },
      { id: 'c', text: '`/home/student/docs/plan.txt`', correct: true, why: 'Pornește de la rădăcina `/`, deci indică același loc din orice director.' },
      { id: 'd', text: '`./docs/plan.txt`', correct: false, why: 'Începe cu `.` (directorul curent): este relativă, chiar dacă arată ca o cale completă.' },
    ],
  },
  {
    id: 'L1.3-002', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Directorul `backup` EXISTĂ deja. Ce face `cp -r proiect backup`?',
    explanation: 'Dacă destinația este un director existent, `cp` creează copia în interiorul lui, cu numele sursei.',
    options: [
      { id: 'a', text: 'Creează `backup/proiect`, cu copia directorului.', correct: true, why: 'Destinația existentă este tratată ca director-gazdă; copia intră în ea.' },
      { id: 'b', text: 'Înlocuiește `backup` cu o copie a lui `proiect`.', correct: false, why: 'Acesta ar fi comportamentul dacă `backup` NU ar exista; cp nu înlocuiește directoare existente.' },
      { id: 'c', text: 'Eșuează, pentru că destinația există.', correct: false, why: 'cp nu se plânge de un director existent; îl folosește ca destinație.' },
      { id: 'd', text: 'Copiază doar fișierele din `proiect`, fără subdirectoare.', correct: false, why: '`-r` copiază și subdirectoarele, recursiv.' },
    ],
  },
  {
    id: 'L1.3-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi șterg cu succes un director NE-GOL numit `data`? (alege toate cele corecte)',
    explanation: '`rmdir` șterge doar directoare goale; `rm` fără `-r` refuză directoarele; `rm -r` șterge recursiv.',
    options: [
      { id: 'a', text: '`rm -r data`', correct: true, why: '`-r` coboară în director și șterge conținutul, apoi directorul.' },
      { id: 'b', text: '`rm -rf data`', correct: true, why: '`-f` doar suprimă întrebările; efectul asupra directorului ne-gol este același ca la `-r`.' },
      { id: 'c', text: '`rmdir data`', correct: false, why: '`rmdir` eșuează cu „Directory not empty”.' },
      { id: 'd', text: '`rm data`', correct: false, why: 'Fără `-r`, `rm` refuză directoarele („Is a directory”).' },
    ],
  },
  {
    id: 'L1.3-004', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Creează dintr-o singură comandă directorul `/tmp/a/b/c`, inclusiv părinții `a` și `b` dacă lipsesc.',
    prompt: '[student@server1 ~]$', answers: ['mkdir -p /tmp/a/b/c', 'mkdir --parents /tmp/a/b/c'], canonical: 'mkdir -p /tmp/a/b/c',
    explanation: '`-p` (`--parents`) creează și părinții lipsă și nu dă eroare dacă directorul există.',
    wrong: [
      { text: 'mkdir /tmp/a/b/c', why: 'Fără `-p`, eșuează dacă `/tmp/a/b` nu există („No such file or directory”).' },
      { text: 'mkdir -r /tmp/a/b/c', why: '`-r` nu este o opțiune a lui `mkdir`; „recursiv” se obține cu `-p`.' },
      { text: 'touch /tmp/a/b/c', why: '`touch` creează fișiere, nu directoare, și nu creează părinți.' },
    ],
  },
  {
    id: 'L1.3-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii prudenți pentru a șterge toate fișierele `*.tmp` din directorul curent.',
    explanation: 'Wildcard-ul se expandează înainte de comandă: verifici mai întâi ce potrivește.',
    items: [
      { text: 'Verifici directorul curent cu `pwd`.', why: 'Wildcard-ul acționează în directorul curent; confirmi locul.' },
      { text: 'Rulezi `ls *.tmp` pentru a vedea ce potrivește.', why: 'Shell-ul expandează tiparul; vezi exact lista pe care o va primi `rm`.' },
      { text: 'Verifici că lista este cea așteptată.', why: 'Un tipar mai larg decât ai intenționat șterge date greșite.' },
      { text: 'Rulezi `rm *.tmp` (sau `rm -i *.tmp`).', why: 'Abia acum ștergi; `-i` adaugă confirmare dacă vrei plasă de siguranță.' },
      { text: 'Verifici cu `ls *.tmp` că nu mai există.', why: 'Răspunsul așteptat: „cannot access” pentru tiparul `*.tmp`.' },
    ],
  },
  {
    id: 'L1.3-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește comanda cu efectul ei principal.',
    explanation: 'Operații de bază cu fișiere și directoare.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`touch f`', right: 'creează un fișier gol sau actualizează timpul unuia existent', why: '`touch` face ambele, după caz.' },
      { left: '`mkdir -p a/b`', right: 'creează directoarele, inclusiv părinții lipsă', why: '`-p` = parents.' },
      { left: '`cp -a d1 d2`', right: 'copiază recursiv păstrând atributele', why: '`-a` = archive.' },
      { left: '`mv a b`', right: 'redenumește sau mută, fără a copia date în același sistem de fișiere', why: 'Modifică doar intrările din directoare.' },
    ],
    distractors: [{ text: 'șterge definitiv un director gol', why: 'Aceasta este `rmdir`.' }],
  },
  {
    id: 'L1.3-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Vrei să ștergi directorul `~/tmp/old`. Ce este grav greșit în comanda de mai jos?',
    explanation: 'Spațiul în plus împarte calea în două argumente; `~` singur înseamnă tot directorul home.',
    snippet: { kind: 'find-error', title: 'comandă tastată', code: 'rm -rf ~ /tmp/old' },
    options: [
      { id: 'a', text: 'Spațiul dintre `~` și `/tmp/old`: comanda primește două argumente, iar primul este tot directorul home.', correct: true, why: 'Shell-ul expandează `~` la `/home/utilizator` și îl trece ca argument separat; `rm -rf` șterge tot ce poate din home, plus `/tmp/old`.' },
      { id: 'b', text: 'Opțiunea `-f`: nu se poate combina cu `-r`.', correct: false, why: '`-r` și `-f` se combină frecvent (`-rf`). Problema nu este combinația, ci cele două argumente.' },
      { id: 'c', text: 'Directorul `/tmp/old` nu poate fi șters de un utilizator.', correct: false, why: 'Un utilizator poate șterge propriile fișiere din `/tmp`; oricum, nu asta e problema principală.' },
      { id: 'd', text: 'Nimic: `~` este ignorat de `rm`.', correct: false, why: '`~` este expandat de shell înainte ca `rm` să ruleze; `rm` primește calea home.' },
    ],
  },
  {
    id: 'L1.3-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Pe baza output-ului, ce este `link`, ce este `docs` și ce înseamnă `.` de la sfârșitul primului câmp?',
    explanation: 'Primul caracter indică tipul (d, -, l); punctul de după permisiuni indică, pe sistemele cu SELinux, un context de securitate.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'ls -l',
      code: '[student@server1 lab13]$ ls -l\ntotal 8\ndrwxr-xr-x. 2 student student 4096 Nov 15 10:02 docs\n-rw-r--r--. 1 student student   12 Nov 15 10:05 plan.txt\nlrwxrwxrwx. 1 student student    8 Nov 15 10:07 link -> plan.txt',
    },
    options: [
      { id: 'a', text: '`link` este un link simbolic către `plan.txt`; `docs` este director; `.` indică un context SELinux asociat.', correct: true, why: '`l` = link simbolic (și „-> plan.txt” arată ținta); `d` = director; punctul este marcajul pentru un context de securitate SELinux.' },
      { id: 'b', text: '`link` este director; `docs` este fișier; `.` arată fișier ascuns.', correct: false, why: 'Tipul se citește din primul caracter: `l` și `d`. Fișierele ascunse se recunosc după punctul din NUME, nu din câmpul de permisiuni.' },
      { id: 'c', text: '`link` este copia lui `plan.txt`; `.` arată că fișierul are un backup.', correct: false, why: 'Un link simbolic nu este o copie; este o referință la o cale. Punctul nu are legătură cu backup-ul.' },
      { id: 'd', text: '`total 8` înseamnă că directorul conține 8 fișiere.', correct: false, why: '`total` este suma blocurilor alocate (în unități de 1 KiB, implicit), nu numărul de fișiere.' },
    ],
  },
  {
    id: 'L1.3-009', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Despre `cp` și `mv`, care afirmații sunt adevărate? (alege toate cele corecte)',
    explanation: 'Comportamentele implicite contează la examen: suprascriere, atribute, recursivitate.',
    options: [
      { id: 'a', text: 'Un `mv` în același sistem de fișiere nu copiază datele, doar actualizează intrările din directoare.', correct: true, why: 'Este un apel `rename`: rapid, indiferent de dimensiune.' },
      { id: 'b', text: 'Implicit, `cp` suprascrie un fișier destinație existent fără să întrebe (dacă nu e un alias `-i`).', correct: true, why: 'Fără `-i` sau `-n`, destinația este înlocuită. Contul root are, de obicei, aliasul `cp -i`.' },
      { id: 'c', text: '`cp -r` păstrează întotdeauna proprietarul și timpurile originalelor.', correct: false, why: 'Pentru aceasta folosești `-p` sau `-a`; `-r` doar copiază recursiv.' },
      { id: 'd', text: '`mv` are nevoie de `-r` pentru a muta directoare.', correct: false, why: '`mv` nu are opțiune `-r`; mută directoare direct.' },
    ],
  },
];
