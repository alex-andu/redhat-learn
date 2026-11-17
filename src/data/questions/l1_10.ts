import type { Question } from '../../lib/types';

const T = 'L1.10';
const O = ['C1-5'];

export const Q_L1_10: Question[] = [
  {
    id: 'L1.10-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce parolă ți se cere când, ca utilizator obișnuit, rulezi `su - student2`?',
    explanation: '`su` cere parola utilizatorului ȚINTĂ (cu excepția lui root, care nu are nevoie de parolă).',
    options: [
      { id: 'a', text: 'Parola contului `student2`.', correct: true, why: '`su` autentifică contul în care vrei să intri.' },
      { id: 'b', text: 'Parola ta.', correct: false, why: 'Parola ta este cea cerută de `sudo`, nu de `su`.' },
      { id: 'c', text: 'Nicio parolă.', correct: false, why: 'Doar root poate folosi `su` fără parolă.' },
      { id: 'd', text: 'Parola lui root.', correct: false, why: 'Ar fi cerută doar la `su -` către root.' },
    ],
  },
  {
    id: 'L1.10-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența esențială dintre `su` și `su -`?',
    explanation: '`su -` pornește un login shell: mediul și home-ul utilizatorului țintă. `su` păstrează în mare parte mediul curent.',
    options: [
      { id: 'a', text: '`su -` pornește un login shell cu mediul și directorul home ale țintei; `su` păstrează mediul curent.', correct: true, why: 'De aceea, după `su -` ajungi în `/root` și ai `PATH`-ul lui root.' },
      { id: 'b', text: '`su -` nu cere parolă.', correct: false, why: 'Cere aceeași parolă ca `su`.' },
      { id: 'c', text: '`su -` se conectează de la distanță.', correct: false, why: 'Ambele sunt locale; conectarea remote este SSH.' },
      { id: 'd', text: '`su -` ignoră grupurile utilizatorului.', correct: false, why: 'Grupurile țintei se aplică în ambele cazuri.' },
    ],
  },
  {
    id: 'L1.10-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre comenzi arată informații despre identitatea ta sau despre sesiuni? (alege toate cele corecte)',
    explanation: 'Fiecare comandă răspunde unei întrebări diferite: cine ești, ce grupuri ai, cine este conectat.',
    options: [
      { id: 'a', text: '`whoami`', correct: true, why: 'Afișează utilizatorul efectiv.' },
      { id: 'b', text: '`id`', correct: true, why: 'Afișează uid, gid și grupurile.' },
      { id: 'c', text: '`who`', correct: true, why: 'Listează utilizatorii conectați, terminalul și ora.' },
      { id: 'd', text: '`umask`', correct: false, why: 'Afișează masca permisiunilor pentru fișierele noi (L1.8), nu identitatea sau sesiunile.' },
    ],
  },
  {
    id: 'L1.10-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Deschide un login shell ca root, folosind parola ta de utilizator autorizat pentru sudo.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo -i'],
    canonical: 'sudo -i',
    explanation: '`sudo -i` pornește un login shell root, autentificându-te cu parola ta.',
    wrong: [
      { text: 'su -', why: 'Funcționează, dar cere parola lui root, nu a ta.' },
      { text: 'sudo whoami', why: 'Rulează o singură comandă, nu deschide un shell.' },
      { text: 'su', why: 'Cere parola lui root și nu pornește un login shell.' },
    ],
    hint: 'Opțiunea `-i` înseamnă „interactive login shell”.',
  },
  {
    id: 'L1.10-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a verifica accesul unui utilizator de test la un fișier, pornind dintr-un cont administrativ.',
    explanation: 'Treci în contul testat, încerci accesul, revii. Testarea ca root ar fi înșelătoare.',
    items: [
      { text: '`whoami`', why: 'Confirmi contul de pornire.' },
      { text: '`su - student2`', why: 'Treci în contul testat (cu parola lui).' },
      { text: '`cat /srv/date/raport.txt`', why: 'Încerci efectiv accesul cu acel cont.' },
      { text: '`exit`', why: 'Închizi shell-ul imbricat și revii.' },
      { text: '`whoami`', why: 'Confirmi că ai revenit la contul inițial.' },
    ],
  },
  {
    id: 'L1.10-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește comanda cu ce afișează.',
    explanation: 'Comenzi pentru identitate și sesiuni.',
    leftLabel: 'Comandă', rightLabel: 'Rezultat',
    pairs: [
      { left: '`whoami`', right: 'utilizatorul efectiv', why: 'Un singur cuvânt: numele contului.' },
      { left: '`id`', right: 'uid, gid și grupurile', why: 'Include apartenența la `wheel`.' },
      { left: '`who`', right: 'utilizatorii conectați acum', why: 'Cu terminal și oră.' },
      { left: '`last`', right: 'istoricul conectărilor', why: 'Citit din fișierul de istoric al sistemului.' },
      { left: '`systemctl get-default`', right: 'target-ul implicit (ex. multi-user.target)', why: 'Arată starea în care pornește sistemul.' },
    ],
    distractors: [{ text: 'lista utilizatorilor din sistem', why: 'Aceasta se citește din `/etc/passwd`, nu din aceste comenzi.' }],
  },
  {
    id: 'L1.10-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'După `su` către root, comanda `useradd` nu este găsită, deși există pe sistem. Care este cauza cea mai probabilă?',
    explanation: 'Fără `-`, mediul curent (inclusiv `PATH` al utilizatorului obișnuit) se păstrează; `useradd` este în `/usr/sbin`, care poate lipsi din `PATH`.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ su\nPassword:\n[root@server1 student]# useradd test1\nbash: useradd: command not found' },
    options: [
      { id: 'a', text: '`su` fără `-` păstrează `PATH`-ul utilizatorului obișnuit; trebuia `su -` sau calea completă `/usr/sbin/useradd`.', correct: true, why: '`su -` încarcă mediul lui root, în care directoarele `sbin` fac parte din `PATH`.' },
      { id: 'b', text: 'Root nu are voie să creeze utilizatori.', correct: false, why: 'Root poate crea utilizatori; problema este găsirea comenzii.' },
      { id: 'c', text: '`useradd` trebuie instalat din rețea.', correct: false, why: 'Mesajul este „command not found” din cauza `PATH`; pachetul este de bază.' },
      { id: 'd', text: 'Parola root era greșită.', correct: false, why: 'Autentificarea a reușit (promptul `#`).' },
    ],
  },
  {
    id: 'L1.10-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce poți deduce din acest output?',
    explanation: 'Utilizatorul este în grupul `wheel`, ceea ce în configurarea implicită RHEL îi permite să folosească `sudo` (de confirmat cu `sudo -l`).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'id', code: '[student@server1 ~]$ id\nuid=1000(student) gid=1000(student) groups=1000(student),10(wheel)' },
    options: [
      { id: 'a', text: 'Contul `student` este obișnuit (uid 1000) și face parte din `wheel`, deci probabil poate folosi `sudo`.', correct: true, why: 'uid 1000 nu este root (uid 0); `wheel` este grupul administrativ pe RHEL.' },
      { id: 'b', text: 'Contul este root.', correct: false, why: 'Root are uid=0.' },
      { id: 'c', text: 'Contul nu poate folosi `sudo`, fiindcă nu are grupul `sudo`.', correct: false, why: 'Pe RHEL grupul administrativ este `wheel`, nu `sudo`.' },
      { id: 'd', text: 'Contul este blocat.', correct: false, why: '`id` nu arată starea parolei sau a contului.' },
    ],
  },
  {
    id: 'L1.10-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai fost adăugat într-un grup nou, dar `id` nu îl arată. Ce este cel mai probabil necesar?',
    explanation: 'Grupurile unui proces sunt stabilite la autentificare; sesiunea veche nu le actualizează.',
    options: [
      { id: 'a', text: 'Să închizi sesiunea (`exit`/logout) și să te autentifici din nou.', correct: true, why: 'Apartenența nouă se aplică la o nouă autentificare.' },
      { id: 'b', text: 'Să rulezi `chmod 777` pe fișier.', correct: false, why: 'Deschide inutil accesul și nu rezolvă problema.' },
      { id: 'c', text: 'Să repornești serverul neapărat.', correct: false, why: 'O nouă autentificare este suficientă.' },
      { id: 'd', text: 'Să rulezi `su` fără parametri.', correct: false, why: 'Ar deschide un shell root, nu ar actualiza grupurile sesiunii.' },
    ],
  },
];
