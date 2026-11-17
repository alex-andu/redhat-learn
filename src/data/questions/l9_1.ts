import type { Question } from '../../lib/types';

const T = 'L9.1';
const O = ['C9-1'];

export const Q_L9_1: Question[] = [
  {
    id: 'L9.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce număr folosește kernelul pentru a identifica proprietarul unui fișier?',
    explanation: 'Pe disc se stochează UID-ul numeric; numele este doar o etichetă tradusă din /etc/passwd.',
    options: [
      { id: 'a', text: '[[uid]] (numărul utilizatorului)', correct: true, why: 'Fișierele și procesele au un UID; ls -l îl traduce în nume.' },
      { id: 'b', text: 'Numele de login', correct: false, why: 'Numele nu este stocat în inode; este doar o etichetă.' },
      { id: 'c', text: 'Numele shell-ului', correct: false, why: 'Shell-ul nu are legătură cu proprietatea fișierelor.' },
      { id: 'd', text: 'Hash-ul parolei', correct: false, why: 'Hash-ul este în /etc/shadow și nu identifică proprietarul.' },
    ],
  },
  {
    id: 'L9.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce conține câmpul 2 (litera `x`) dintr-o linie din `/etc/passwd`?',
    explanation: '`x` înseamnă „parola este în /etc/shadow”; nu este parola.',
    options: [
      { id: 'a', text: 'Un marcaj: parola se află în `/etc/shadow`.', correct: true, why: 'Din motive de securitate hash-urile sunt într-un fișier lizibil doar de root.' },
      { id: 'b', text: 'Parola contului, în clar.', correct: false, why: 'Parolele nu sunt stocate în clar.' },
      { id: 'c', text: 'UID-ul contului.', correct: false, why: 'UID-ul este câmpul 3.' },
      { id: 'd', text: 'Shell-ul de login.', correct: false, why: 'Shell-ul este câmpul 7.' },
    ],
  },
  {
    id: 'L9.1-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Creează utilizatorul `alice` cu valorile implicite, ca administrator (folosește `sudo`).',
    prompt: '[student@server1 ~]$',
    answers: ['sudo useradd alice'],
    canonical: 'sudo useradd alice',
    explanation: '`useradd` creează contul; fără sudo ai primi „Permission denied”.',
    wrong: [
      { text: 'useradd alice', why: 'Fără sudo nu ai drepturi de scriere în /etc/passwd.' },
      { text: 'sudo adduser alice', why: 'Pe RHEL adduser nu este comanda standard (pe unele sisteme este alias); examenul folosește useradd.' },
      { text: 'sudo usermod alice', why: 'usermod modifică un cont existent; nu creează unul.' },
    ],
  },
  {
    id: 'L9.1-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează utilizatorul `bob` cu UID 2001, cu director home creat, comentariu `Bob Ionescu` și shell `/bin/bash`.',
    prompt: '[student@server1 ~]$',
    answers: [
      'sudo useradd -m -u 2001 -c "Bob Ionescu" -s /bin/bash bob',
      'sudo useradd -u 2001 -m -c "Bob Ionescu" -s /bin/bash bob',
      'sudo useradd -m -c "Bob Ionescu" -u 2001 -s /bin/bash bob',
      'sudo useradd -m -s /bin/bash -u 2001 -c "Bob Ionescu" bob',
    ],
    canonical: 'sudo useradd -m -u 2001 -c "Bob Ionescu" -s /bin/bash bob',
    explanation: '-m creează home, -u setează UID-ul, -c comentariul, -s shell-ul; numele contului este ultimul argument.',
    wrong: [
      { text: 'sudo useradd bob -m -u 2001 -s /bin/bash', why: 'Lipsește comentariul cerut; numele contului trebuie să fie ultimul argument.' },
      { text: 'sudo useradd --no-create-home -u 2001 -c "Bob Ionescu" -s /bin/bash bob', why: '--no-create-home (-M) interzice crearea home-ului; cerința este exact opusul.' },
      { text: 'sudo useradd -m --user-group -c "Bob Ionescu" -s /bin/bash bob', why: 'Fără -u, UID-ul nu este setat la 2001; --user-group (-U) doar creează un grup privat.' },
    ],
  },
  {
    id: 'L9.1-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai rulat `sudo useradd -g devs bob`, dar comanda a eșuat. Ce cod de ieșire și ce cauză sunt cele mai probabile?',
    explanation: 'useradd -g cere un grup EXISTENT; altfel returnează cod 6.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'terminal', code: '[student@server1 ~]$ sudo useradd -g devs bob\nuseradd: group \'devs\' does not exist\n[student@server1 ~]$ echo $?\n6' },
    options: [
      { id: 'a', text: 'Cod 6: grupul `devs` nu există; creează-l cu `groupadd devs`.', correct: true, why: 'useradd(8): cod 6 = „specified group doesn\'t exist”.' },
      { id: 'b', text: 'Cod 9: numele `bob` este deja folosit.', correct: false, why: 'Codul 9 înseamnă nume deja folosit; mesajul spune altceva.' },
      { id: 'c', text: 'Cod 4: UID-ul este ocupat.', correct: false, why: 'Nu ai cerut un UID; mesajul vorbește despre grup.' },
      { id: 'd', text: 'Cod 1: nu poate actualiza fișierul passwd.', correct: false, why: 'Eroarea ar menționa fișierul, nu un grup inexistent.' },
    ],
  },
  {
    id: 'L9.1-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce face `sudo userdel bob` (fără opțiuni), când `bob` are home în `/home/bob`?',
    explanation: 'Fără -r, directorul home rămâne pe disc; fișierele devin „orfane” (afișate cu UID numeric).',
    options: [
      { id: 'a', text: 'Șterge contul, dar lasă `/home/bob` pe disc.', correct: true, why: 'Doar -r (--remove) șterge home-ul și mail spool-ul.' },
      { id: 'b', text: 'Șterge contul și `/home/bob`.', correct: false, why: 'Pentru asta este nevoie de userdel -r.' },
      { id: 'c', text: 'Refuză, pentru că home-ul nu este gol.', correct: false, why: 'userdel nu verifică conținutul home-ului.' },
      { id: 'd', text: 'Blochează contul fără să îl șteargă.', correct: false, why: 'Blocarea se face cu usermod -L sau passwd -l.' },
    ],
  },
  {
    id: 'L9.1-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai rulat `sudo usermod -l robert bob`. Ce NU s-a schimbat?',
    explanation: '-l schimbă doar numele de login (câmpul 1); home-ul, grupul privat și mail spool-ul rămân cu numele vechi.',
    options: [
      { id: 'a', text: 'Directorul home (rămâne `/home/bob`) și grupul privat `bob`.', correct: true, why: 'usermod(8): redenumește contul, nimic altceva; le faci manual (-d … -m, groupmod -n).' },
      { id: 'b', text: 'Numele de login.', correct: false, why: 'Acesta este exact ce schimbă -l.' },
      { id: 'c', text: 'UID-ul, care devine automat 0.', correct: false, why: 'UID-ul rămâne neschimbat; nu devine 0 (acela este root).' },
      { id: 'd', text: 'Toate fișierele din home sunt șterse.', correct: false, why: 'Nu se șterge nimic.' },
    ],
  },
  {
    id: 'L9.1-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmații despre `useradd` sunt corecte?',
    explanation: 'useradd creează contul cu parola blocată; opțiunile au rol precis.',
    options: [
      { id: 'a', text: 'Fără `-p`, contul nou are parola blocată (`!` în shadow).', correct: true, why: 'Utilizatorul nu se poate autentifica până nu setezi parola cu passwd.' },
      { id: 'b', text: '`-g` cere un grup care există deja.', correct: true, why: 'Altfel eroare cu cod 6.' },
      { id: 'c', text: 'Lista din `-G` se scrie fără spații: `wheel,devs`.', correct: true, why: 'Este o listă separată prin virgulă; spațiile ar fi interpretate ca argumente separate.' },
      { id: 'd', text: '`-m` șterge home-ul existent al utilizatorului.', correct: false, why: '-m creează home-ul și copiază /etc/skel; nu șterge nimic.' },
    ],
  },
  {
    id: 'L9.1-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este diferența dintre `-g` și `-G` la `useradd`?',
    explanation: '-g = un singur grup primar; -G = grupuri suplimentare.',
    options: [
      { id: 'a', text: '`-g` setează grupul primar (unul), `-G` lista grupurilor suplimentare.', correct: true, why: 'Primar = câmpul 4 din passwd; suplimentare = intrări în /etc/group.' },
      { id: 'b', text: '`-g` setează grupul suplimentar, `-G` pe cel primar.', correct: false, why: 'Este invers.' },
      { id: 'c', text: 'Sunt sinonime.', correct: false, why: 'Au roluri distincte.' },
      { id: 'd', text: '`-G` creează grupul dacă nu există.', correct: false, why: 'Grupul trebuie să existe deja.' },
    ],
  },
  {
    id: 'L9.1-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Linia de mai jos este din `/etc/passwd`. Care este shell-ul de login al contului?',
    explanation: 'Ultimul câmp (al 7-lea) este shell-ul; `nologin` refuză login-ul interactiv.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/etc/passwd', code: 'svc-app:x:988:987:Aplicatia mea:/:/sbin/nologin' },
    options: [
      { id: 'a', text: '`/sbin/nologin`: contul nu poate face login interactiv.', correct: true, why: 'Este câmpul 7; tipic pentru conturi de serviciu.' },
      { id: 'b', text: '`/`: este directorul home, nu shell-ul.', correct: false, why: 'Câmpul 6 este home-ul; shell-ul este ultimul.' },
      { id: 'c', text: '`/bin/bash`, valoarea implicită.', correct: false, why: 'Valoarea scrisă în câmp este nologin, nu implicitul.' },
      { id: 'd', text: '`988`.', correct: false, why: '988 este UID-ul (câmpul 3).' },
    ],
  },
  {
    id: 'L9.1-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii sigur pentru ștergerea contului unui angajat plecat (`ana`), cu arhivarea datelor.',
    explanation: 'Mai întâi oprești accesul și procesele, apoi arhivezi, apoi ștergi, apoi cauți resturi.',
    items: [
      { text: '`sudo usermod -L -e 1 ana` — blochezi accesul imediat', why: 'Oprește autentificările înainte de orice altceva.' },
      { text: '`sudo pkill -u ana` — închizi procesele', why: 'userdel refuză dacă utilizatorul are procese (cod 8).' },
      { text: '`sudo tar -czf /backup/ana.tar.gz /home/ana` — arhivezi datele', why: 'După userdel -r, home-ul nu mai există.' },
      { text: '`sudo userdel -r ana` — ștergi contul și home-ul', why: 'Abia acum, când ai arhiva.' },
      { text: '`sudo find / -xdev -nouser` — cauți fișiere rămase', why: 'Fișierele din afara home-ului nu sunt șterse de userdel.' },
    ],
  },
  {
    id: 'L9.1-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda sau fișierul cu rolul lui.',
    explanation: 'Fiecare piesă are un rol precis în gestiunea conturilor.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`/etc/passwd`', right: 'identitatea contului: UID, GID, home, shell', why: 'Șapte câmpuri; public.' },
      { left: '`/etc/shadow`', right: 'hash-ul parolei și datele de expirare', why: 'Lizibil doar de root.' },
      { left: '`/etc/skel`', right: 'șablonul copiat în home-ul noilor conturi', why: 'Folosit de useradd -m.' },
      { left: '`useradd -r`', right: 'creează un cont de sistem (UID mic, fără home)', why: 'Pentru servicii.' },
    ],
    distractors: [{ text: 'regulile de firewall ale unui utilizator', why: 'Aparțin firewalld (L8.4).' }],
  },
  {
    id: 'L9.1-013', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Colegul tău a rulat comanda de mai jos, iar `useradd` a eșuat. Care este greșeala?',
    explanation: 'Lista din `-G` este un singur argument: grupurile se separă prin virgulă, FĂRĂ spații.',
    snippet: { kind: 'find-error', title: 'comanda colegului', code: 'sudo useradd -m -u 2001 -G wheel, devs bob' },
    options: [
      { id: 'a', text: 'Spațiul după virgulă: `-G wheel,devs` (fără spații).', correct: true, why: 'Shell-ul desparte comanda la spațiu; `devs` ar deveni un argument separat, iar numele contului ar fi greșit.' },
      { id: 'b', text: 'Lipsește `sudo`.', correct: false, why: 'sudo este prezent în comandă.' },
      { id: 'c', text: 'UID-ul nu poate fi 2001.', correct: false, why: '2001 este un UID valid (dacă este liber).' },
      { id: 'd', text: '`-m` nu se poate combina cu `-u`.', correct: false, why: 'Opțiunile se pot combina.' },
    ],
  },
];
