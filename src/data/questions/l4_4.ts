import type { Question } from '../../lib/types';

const T = 'L4.4';
const O = ['C4-4'];

export const Q_L4_4: Question[] = [
  {
    id: 'L4.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce semnal trimite implicit `kill 1234`?',
    explanation: 'Fără opțiune, `kill` trimite SIGTERM (15), o cerere politicoasă de oprire.',
    options: [
      { id: 'a', text: 'SIGTERM (15): procesul poate curăța și se poate opri singur.', correct: true, why: 'Este semnalul implicit; procesul îl poate intercepta și închide ordonat.' },
      { id: 'b', text: 'SIGKILL (9): procesul este distrus imediat.', correct: false, why: 'SIGKILL trebuie cerut explicit, cu `kill -9`.' },
      { id: 'c', text: 'SIGHUP (1): reîncarcă configurația.', correct: false, why: 'SIGHUP trebuie cerut explicit cu `kill -1` sau `-HUP`.' },
      { id: 'd', text: 'SIGSTOP: pune procesul în pauză.', correct: false, why: 'Pauza se cere cu `kill -STOP`.' },
    ],
  },
  {
    id: 'L4.4-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează toate procesele sistemului, cu proprietar, %CPU și %MEM, în formatul BSD.',
    prompt: '[root@server1 ~]#',
    answers: ['ps aux', 'ps -aux'],
    canonical: 'ps aux',
    explanation: '`ps aux`: a = procesele tuturor utilizatorilor, u = format orientat pe utilizator (USER, %CPU, %MEM), x = și cele fără terminal.',
    wrong: [
      { text: 'ps', why: 'Fără opțiuni, `ps` arată doar procesele din terminalul curent.' },
      { text: 'ps -l', why: '`-l` dă formatul lung, doar pentru sesiunea curentă; nu listează tot sistemul.' },
      { text: 'top', why: '`top` este interactiv și se actualizează; nu este o listare unică în stilul cerut.' },
    ],
  },
  {
    id: 'L4.4-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează PID-ul, utilizatorul, %CPU și comanda, ordonat descrescător după %CPU, apoi păstrează primele 6 linii.',
    prompt: '[root@server1 ~]#',
    answers: ['ps -eo pid,user,%cpu,cmd --sort=-%cpu | head -6', 'ps -eo pid,user,%cpu,cmd --sort=-%cpu | head -n 6', 'ps -eo pid,user,%cpu,comm --sort=-%cpu | head -6', 'ps -eo pid,user,%cpu,args --sort=-%cpu | head -6'],
    canonical: 'ps -eo pid,user,%cpu,cmd --sort=-%cpu | head -6',
    explanation: '`-e` = toate procesele, `-o` = coloanele dorite, `--sort=-%cpu` = descrescător (minusul inversează), `head -6` = antet + 5 procese.',
    wrong: [
      { text: 'ps -eo pid,user,%cpu,cmd --sort=%cpu | head -6', why: 'Fără minus ordinea este crescătoare: primele linii ar fi procesele cel mai puțin active.' },
      { text: 'ps -eo pid,user,%cpu,cmd | sort | head -6', why: '`sort` ordonează lexicografic după prima coloană (PID), nu după %CPU.' },
      { text: 'ps aux | head -6', why: 'Ia primele 6 linii din lista implicită (ordonată după PID), nu cele mai consumatoare.' },
    ],
  },
  {
    id: 'L4.4-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care proces consumă cel mai mult CPU și ce îi trimiți ca să se oprească ordonat?',
    explanation: 'Procesul din vârf este PID 4321 (98% CPU). Prima încercare este SIGTERM; SIGKILL doar dacă nu răspunde.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# ps -eo pid,user,%cpu,%mem,cmd --sort=-%cpu | head -4\n  PID USER     %CPU %MEM CMD\n 4321 student  98.0  0.1 yes\n  812 root      0.3  0.8 /usr/sbin/NetworkManager --no-daemon\n    1 root      0.1  0.4 /usr/lib/systemd/systemd rhgb' },
    options: [
      { id: 'a', text: 'PID 4321 (`yes`); `kill 4321` (SIGTERM).', correct: true, why: 'Este primul în listă, la 98% CPU; SIGTERM îi permite să se oprească curat.' },
      { id: 'b', text: 'PID 1 (systemd); `kill 1`.', correct: false, why: 'PID 1 este systemd; nu este consumatorul și nu trebuie ucis.' },
      { id: 'c', text: 'PID 812; `kill -9 812`.', correct: false, why: 'NetworkManager consumă 0,3% CPU; nu este vinovatul.' },
      { id: 'd', text: 'Utilizatorul `student`; `kill student`.', correct: false, why: '`kill` primește PID-uri, nu nume de utilizator.' },
    ],
  },
  {
    id: 'L4.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: '`kill 4321` nu a oprit procesul (rulează în continuare). Ce faci?',
    explanation: 'Dacă SIGTERM este ignorat sau interceptat, folosești SIGKILL (`kill -9`), care nu poate fi interceptat. Mai întâi verifici că PID-ul este cel corect.',
    options: [
      { id: 'a', text: '`kill -9 4321`', correct: true, why: 'SIGKILL este aplicat direct de kernel; procesul nu poate refuza.' },
      { id: 'b', text: '`kill -15 4321` încă o dată, de mai multe ori.', correct: false, why: '`-15` este tot SIGTERM, deci la fel de ușor de ignorat.' },
      { id: 'c', text: '`systemctl reboot`', correct: false, why: 'Un reboot este exagerat; SIGKILL rezolvă de obicei.' },
      { id: 'd', text: '`kill -l 4321`', correct: false, why: '`-l` listează semnalele; nu trimite nimic.' },
    ],
  },
  {
    id: 'L4.4-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi pot opri toate procesele numite `firefox`? (alege toate cele corecte)',
    explanation: '`killall` și `pkill` aleg procesele după nume; `kill` cere PID-uri.',
    options: [
      { id: 'a', text: '`killall firefox`', correct: true, why: 'Trimite SIGTERM tuturor proceselor cu numele exact `firefox`.' },
      { id: 'b', text: '`pkill firefox`', correct: true, why: 'Potrivește după (parte din) nume.' },
      { id: 'c', text: '`kill $(pgrep firefox)`', correct: true, why: '`pgrep` afișează PID-urile, iar `kill` le primește.' },
      { id: 'd', text: '`kill firefox`', correct: false, why: '`kill` nu primește nume, doar PID-uri.' },
    ],
  },
  {
    id: 'L4.4-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un proces apare cu STAT `Z` și `<defunct>`. Ce este adevărat?',
    explanation: 'Zombie = proces terminat, încă în tabelă pentru că părintele nu i-a citit starea. `kill -9` nu are ce ucide; părintele trebuie reparat sau oprit.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# ps aux | grep defunct\nstudent   5120  0.0  0.0      0     0 pts/0    Z    10:11   0:00 [worker] <defunct>' },
    options: [
      { id: 'a', text: 'Este un zombie: nu consumă CPU/memorie; se curăță prin părinte (PPID), nu cu `kill -9`.', correct: true, why: 'Procesul este deja terminat; părintele trebuie să îi citească starea (wait).' },
      { id: 'b', text: 'Procesul consumă 100% CPU și trebuie ucis cu `kill -9 5120`.', correct: false, why: 'CPU este 0.0 și `kill -9` nu are efect asupra unui zombie.' },
      { id: 'c', text: 'Procesul este în pauză (Ctrl+Z) și se reia cu `fg`.', correct: false, why: 'Procesele oprite au STAT `T`, nu `Z`.' },
      { id: 'd', text: 'Sistemul de fișiere este corupt.', correct: false, why: 'Un zombie nu are legătură cu discul.' },
    ],
  },
  {
    id: 'L4.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce greșeală are comanda de mai jos, dată de un utilizator obișnuit?',
    explanation: 'Un utilizator obișnuit poate trimite semnale doar proceselor proprii; pentru procese ale altor utilizatori, mesajul este `Operation not permitted`.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ kill -9 812\nbash: kill: (812) - Operation not permitted' },
    options: [
      { id: 'a', text: 'PID 812 aparține altui utilizator (root); are nevoie de `sudo`, dacă trebuie cu adevărat ucis.', correct: true, why: 'Doar proprietarul procesului sau root poate trimite semnale.' },
      { id: 'b', text: 'Semnalul 9 nu există.', correct: false, why: '9 este SIGKILL, valid.' },
      { id: 'c', text: 'Lipsește un spațiu între `-9` și PID.', correct: false, why: 'Sintaxa este corectă; mesajul este despre permisiuni.' },
      { id: 'd', text: '`kill` nu poate fi folosit într-un script.', correct: false, why: 'Se poate folosi oriunde.' },
    ],
  },
  {
    id: 'L4.4-009', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește tasta din `top` cu efectul ei.',
    explanation: '`top` este interactiv; tastele schimbă ordonarea și permit oprirea proceselor.',
    leftLabel: 'Tastă', rightLabel: 'Efect',
    pairs: [
      { left: '`P`', right: 'ordonează după %CPU', why: 'Implicit în top; util după ce ai schimbat ordonarea.' },
      { left: '`M`', right: 'ordonează după memorie (%MEM)', why: 'Găsești procesele care consumă RAM.' },
      { left: '`k`', right: 'cere un PID și un semnal pentru a-l trimite', why: 'Oprire direct din top.' },
      { left: '`q`', right: 'iese din top', why: 'Revii la shell.' },
    ],
    distractors: [{ text: 'repornește sistemul', why: 'Nicio tastă din top nu repornește sistemul.' }],
  },
  {
    id: 'L4.4-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru oprirea unui proces care consumă mult CPU.',
    explanation: 'Identifici, confirmi, ceri politicos, forțezi doar dacă e nevoie, verifici.',
    items: [
      { text: '`top` sau `ps -eo pid,user,%cpu,cmd --sort=-%cpu | head`', why: 'Găsești procesul consumator și PID-ul lui.' },
      { text: '`ps -p PID -o pid,user,cmd`', why: 'Confirmi că PID-ul este procesul dorit, nu altul.' },
      { text: '`kill PID`', why: 'Trimiți SIGTERM: oprire ordonată.' },
      { text: '`kill -9 PID` (doar dacă tot rulează)', why: 'SIGKILL, ultima soluție.' },
      { text: '`ps -p PID`', why: 'Verifici că a dispărut.' },
    ],
  },
];
