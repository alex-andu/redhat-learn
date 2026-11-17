import type { Question } from '../../lib/types';

const T = 'L1.7';
const O = ['C1-9'];

export const Q_L1_7: Question[] = [
  {
    id: 'L1.7-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce comandă creează un symlink numit `scurt` care indică `/var/log/messages`?',
    explanation: 'Sintaxa este `ln -s ȚINTĂ NUME_LINK`: întâi ținta, apoi numele noului link.',
    options: [
      { id: 'a', text: '`ln -s /var/log/messages scurt`', correct: true, why: 'Ținta este primul argument, numele link-ului al doilea.' },
      { id: 'b', text: '`ln -s scurt /var/log/messages`', correct: false, why: 'Ordine inversată: ar încerca să creeze un link numit `/var/log/messages`.' },
      { id: 'c', text: '`ln /var/log/messages scurt`', correct: false, why: 'Fără `-s` creează un hard link, nu symlink.' },
      { id: 'd', text: '`ln -h /var/log/messages scurt`', correct: false, why: '`-h` nu creează un link simbolic în acest context.' },
    ],
  },
  {
    id: 'L1.7-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai un fișier `a` și un hard link `b` către el. Rulezi `rm a`. Ce se întâmplă cu datele?',
    explanation: '`rm` elimină un nume și scade contorul de legături. Datele se elimină când contorul ajunge la 0.',
    options: [
      { id: 'a', text: 'Rămân accesibile prin `b`.', correct: true, why: 'Inode-ul mai are un nume (contor 1).' },
      { id: 'b', text: 'Se pierd, iar `b` devine un link rupt.', correct: false, why: 'Aceasta este comportarea unui symlink, nu a unui hard link.' },
      { id: 'c', text: '`rm` refuză: trebuie întâi șters `b`.', correct: false, why: 'rm poate șterge oricare nume; nu există „original”.' },
      { id: 'd', text: 'Se șterg ambele nume.', correct: false, why: '`rm a` afectează doar numele `a`.' },
    ],
  },
  {
    id: 'L1.7-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmații despre hard link-uri sunt adevărate? (alege toate cele corecte)',
    explanation: 'Hard link = nume suplimentar pentru același inode, limitat la un sistem de fișiere.',
    options: [
      { id: 'a', text: 'Au același număr inode ca ținta.', correct: true, why: 'Sunt intrări de director către același inode.' },
      { id: 'b', text: 'Nu pot trece peste granița unui sistem de fișiere.', correct: true, why: 'Numărul de inode are sens doar în interiorul unui sistem de fișiere.' },
      { id: 'c', text: 'Contorul de legături din `ls -l` crește la fiecare hard link nou.', correct: true, why: 'A doua coloană din `ls -l` este contorul.' },
      { id: 'd', text: 'Pot indica fără restricții directoare.', correct: false, why: 'De regulă nu se permit hard link-uri către directoare; se folosește symlink.' },
    ],
  },
  {
    id: 'L1.7-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează un hard link numit `copie.txt` pentru fișierul existent `date.txt`.',
    prompt: '[student@server1 ~]$',
    answers: ['ln date.txt copie.txt'],
    canonical: 'ln date.txt copie.txt',
    explanation: 'Fără `-s`, `ln` creează un hard link; ținta este primul argument.',
    wrong: [
      { text: 'ln -s date.txt copie.txt', why: '`-s` creează un symlink, nu un hard link.' },
      { text: 'ln copie.txt date.txt', why: 'Ordine inversată: ținta trebuie să fie primul argument și `copie.txt` nu există.' },
      { text: 'cp date.txt copie.txt', why: '`cp` creează o copie independentă, cu inode propriu.' },
    ],
    hint: 'Aceeași comandă ca la symlink, dar fără o anumită opțiune.',
  },
  {
    id: 'L1.7-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a demonstra că două nume sunt hard link-uri ale aceluiași fișier.',
    explanation: 'Creezi fișierul, adaugi numele și compari inode-ul și contorul.',
    items: [
      { text: '`echo test > f1`', why: 'Creează fișierul de bază.' },
      { text: '`ln f1 f2`', why: 'Adaugă un al doilea nume (hard link).' },
      { text: '`ls -li f1 f2`', why: 'Afișează inode-ul și contorul pentru ambele nume.' },
      { text: 'Compari numerele inode și contorul (2)', why: 'Același inode și contor 2 confirmă hard link-ul.' },
    ],
  },
  {
    id: 'L1.7-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește caracteristica cu tipul de link.',
    explanation: 'Diferențele dintre hard și soft link.',
    leftLabel: 'Caracteristică', rightLabel: 'Tip de link',
    pairs: [
      { left: 'Același inode ca ținta', right: 'hard link', why: 'Este un alt nume pentru același inode.' },
      { left: 'Poate indica un director', right: 'soft link', why: 'Symlink-urile pot indica directoare.' },
      { left: 'Se rupe dacă ținta este ștearsă', right: 'soft link', why: 'Păstrează doar o cale.' },
      { left: 'Merge doar în același sistem de fișiere', right: 'hard link', why: 'Inode-urile sunt locale unui sistem de fișiere.' },
      { left: 'Apare cu tipul `l` în `ls -l`', right: 'soft link', why: 'Prima literă din permisiuni este `l`.' },
    ],
    distractors: [{ text: 'copie independentă a datelor', why: 'Niciun tip de link nu duplică datele; aceea este `cp`.' }],
  },
  {
    id: 'L1.7-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ai creat link-ul astfel, dar `cat b/legatura` dă „No such file or directory” după ce l-ai mutat. De ce?',
    explanation: 'Calea relativă dintr-un symlink se rezolvă față de directorul în care se află link-ul. După mutare, „fisier” se caută în `b/`.',
    snippet: { kind: 'find-error', title: 'secvența de comenzi', code: 'mkdir a b\necho x > a/fisier\nln -s fisier a/legatura\nmv a/legatura b/\ncat b/legatura' },
    options: [
      { id: 'a', text: 'Link-ul memorează calea relativă „fisier”, care acum se caută în `b/`; trebuia cale absolută sau calea corectă.', correct: true, why: 'Soluție: `ln -s "$PWD/a/fisier" ...` sau recreează link-ul cu calea relativă corectă (`../a/fisier`).' },
      { id: 'b', text: '`mv` nu poate muta symlink-uri.', correct: false, why: '`mv` mută symlink-uri fără probleme; problema este calea din ele.' },
      { id: 'c', text: '`cat` nu urmează symlink-uri.', correct: false, why: '`cat` urmează symlink-urile; primul `cat a/legatura` ar fi funcționat.' },
      { id: 'd', text: 'Fișierul `a/fisier` a fost șters de `mv`.', correct: false, why: '`mv` a mutat doar link-ul; ținta a rămas în `a/`.' },
    ],
  },
  {
    id: 'L1.7-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce poți deduce din această listare?',
    explanation: 'Aceeași valoare a inode-ului și contorul 2 indică două nume pentru același fișier; `l` indică un symlink cu inode propriu.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ls -li', code: '524301 -rw-r--r--. 2 student student 16 Jan  1 10:00 hard.txt\n524301 -rw-r--r--. 2 student student 16 Jan  1 10:00 original.txt\n524305 lrwxrwxrwx. 1 student student 12 Jan  1 10:00 soft.txt -> original.txt' },
    options: [
      { id: 'a', text: '`hard.txt` și `original.txt` sunt același fișier (două nume); `soft.txt` este un symlink către `original.txt`.', correct: true, why: 'Inode identic + contor 2 = hard link; tipul `l` și `->` = symlink.' },
      { id: 'b', text: '`soft.txt` este o copie a lui `original.txt`.', correct: false, why: 'Un symlink nu copiază datele; dimensiunea 12 este lungimea căii.' },
      { id: 'c', text: '`hard.txt` este un symlink către `original.txt`.', correct: false, why: 'Nu are tipul `l` și nici săgeata.' },
      { id: 'd', text: 'Toate trei sunt hard link-uri.', correct: false, why: '`soft.txt` are alt inode și tip `l`.' },
    ],
  },
  {
    id: 'L1.7-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei o scurtătură către directorul `/var/lib/aplicatie/date/2024`. Ce alegi și de ce?',
    explanation: 'Pentru directoare se folosesc symlink-uri; hard link-urile către directoare nu sunt permise de regulă.',
    options: [
      { id: 'a', text: '`ln -s /var/lib/aplicatie/date/2024 ~/date`', correct: true, why: 'Symlink către director; cale absolută, deci independent de locul link-ului.' },
      { id: 'b', text: '`ln /var/lib/aplicatie/date/2024 ~/date`', correct: false, why: 'Hard link către director: nu este permis de regulă.' },
      { id: 'c', text: '`cp /var/lib/aplicatie/date/2024 ~/date`', correct: false, why: '`cp` fără `-r` refuză directoarele, iar o copie nu este o scurtătură.' },
      { id: 'd', text: '`mv /var/lib/aplicatie/date/2024 ~/date`', correct: false, why: 'Mută directorul, ceea ce poate strica aplicația.' },
    ],
  },
];
