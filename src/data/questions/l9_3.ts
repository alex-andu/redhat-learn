import type { Question } from '../../lib/types';

const T = 'L9.3';
const O = ['C9-3'];

export const Q_L9_3: Question[] = [
  {
    id: 'L9.3-001', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Creează grupul `devs` cu GID-ul 30000.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo groupadd -g 30000 devs', 'sudo groupadd --gid 30000 devs'],
    canonical: 'sudo groupadd -g 30000 devs',
    explanation: '`-g` setează GID-ul; numele grupului este ultimul argument.',
    wrong: [
      { text: 'sudo groupadd --system devs 30000', why: '--system creează un grup de sistem și nu setează GID-ul cerut.' },
      { text: 'sudo groupadd devs 30000', why: 'GID-ul se dă cu -g, nu ca argument pozițional.' },
      { text: 'sudo groupadd -r devs', why: '-r creează un grup de sistem, nu setează GID-ul cerut.' },
    ],
  },
  {
    id: 'L9.3-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre grupul primar și grupurile suplimentare ale unui utilizator?',
    explanation: 'Primar: exact unul (în passwd); suplimentare: oricâte (în /etc/group).',
    options: [
      { id: 'a', text: 'Grupul primar este unul singur, scris în `/etc/passwd`; cele suplimentare sunt listate ca membri în `/etc/group`.', correct: true, why: 'Primarul primește și fișierele noi create de utilizator.' },
      { id: 'b', text: 'Grupul primar este mereu `wheel`.', correct: false, why: 'wheel este un grup suplimentar, folosit pentru sudo.' },
      { id: 'c', text: 'Nu există nicio diferență.', correct: false, why: 'Diferă prin loc de stocare și rol.' },
      { id: 'd', text: 'Grupurile suplimentare nu au GID.', correct: false, why: 'Orice grup are un GID.' },
    ],
  },
  {
    id: 'L9.3-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Adaugă utilizatorul `alice` în grupul suplimentar `devs`, fără să îi elimini celelalte grupuri.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo usermod -aG devs alice', 'sudo usermod -a -G devs alice', 'sudo gpasswd -a alice devs'],
    canonical: 'sudo usermod -aG devs alice',
    explanation: '`-aG` adaugă; fără `-a`, lista suplimentară ar fi înlocuită.',
    wrong: [
      { text: 'sudo usermod -G devs alice', why: 'Fără -a, înlocuiește toate grupurile suplimentare (alice ar pierde, de exemplu, wheel).' },
      { text: 'sudo usermod -g devs alice', why: '-g (mic) schimbă grupul PRIMAR.' },
      { text: 'sudo groupmod -a devs alice', why: 'groupmod -a funcționează doar cu -U; sintaxa este diferită.' },
    ],
  },
  {
    id: 'L9.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Utilizatorul `alice` este în `wheel` și `devs`. Ce rezultat are `sudo usermod -G ops alice`?',
    explanation: '-G fără -a înlocuiește lista suplimentară: alice rămâne doar în ops (plus grupul primar).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'înainte', code: 'uid=2002(alice) gid=2002(alice) groups=2002(alice),10(wheel),1010(devs)' },
    options: [
      { id: 'a', text: 'Alice rămâne doar în grupul primar și în `ops`: pierde `wheel` și `devs`.', correct: true, why: 'usermod(8): grupurile nelistate sunt eliminate dacă nu e folosit -a.' },
      { id: 'b', text: 'Alice este adăugată în `ops` și păstrează celelalte grupuri.', correct: false, why: 'Aceasta este comportamentul cu -aG.' },
      { id: 'c', text: 'Grupul primar devine `ops`.', correct: false, why: 'Grupul primar se schimbă cu -g (mic).' },
      { id: 'd', text: 'Comanda eșuează, pentru că `ops` ar trebui adăugat cu -a.', correct: false, why: 'Comanda reușește (dacă ops există); doar efectul este distructiv.' },
    ],
  },
  {
    id: 'L9.3-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: '`getent group devs` arată `devs:x:1010:bob`, dar `id carol` arată `devs` în lista grupurilor. Cum se explică?',
    explanation: 'carol are devs ca grup PRIMAR; grupul primar nu apare în lista de membri din /etc/group.',
    options: [
      { id: 'a', text: '`devs` este grupul primar al lui carol (GID 1010 în `/etc/passwd`), deci nu apare în câmpul de membri.', correct: true, why: 'Câmpul 4 din /etc/group conține doar apartenența suplimentară.' },
      { id: 'b', text: '/etc/group este corupt.', correct: false, why: 'Comportamentul este normal.' },
      { id: 'c', text: 'carol este membră temporar.', correct: false, why: 'Nu există apartenență temporară în acest model.' },
      { id: 'd', text: '`id` afișează grupuri inexistente.', correct: false, why: 'id citește starea reală (passwd + group).' },
    ],
  },
  {
    id: 'L9.3-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce se întâmplă la `sudo groupdel ops`, dacă `ops` este grupul primar al utilizatorului `carol`?',
    explanation: 'Un grup primar al unui utilizator existent nu poate fi șters (cod 8).',
    options: [
      { id: 'a', text: 'Eșuează (cod 8): întâi schimbi grupul primar al lui carol sau o ștergi.', correct: true, why: 'groupdel(8): nu poate șterge grupul primar al unui utilizator existent.' },
      { id: 'b', text: 'Șterge grupul și șterge și utilizatorul.', correct: false, why: 'groupdel nu șterge utilizatori.' },
      { id: 'c', text: 'Șterge grupul și mută carol în wheel.', correct: false, why: 'Nu se face nicio mutare automată.' },
      { id: 'd', text: 'Șterge doar liniile din /etc/gshadow.', correct: false, why: 'Șterge din /etc/group și /etc/gshadow, dar nu în acest caz.' },
    ],
  },
  {
    id: 'L9.3-007', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Redenumește grupul `devs` în `engineers`.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo groupmod -n engineers devs', 'sudo groupmod --new-name engineers devs'],
    canonical: 'sudo groupmod -n engineers devs',
    explanation: '`groupmod -n NOU VECHI`: GID-ul și membrii rămân.',
    wrong: [
      { text: 'sudo groupmod -n devs engineers', why: 'Ordinea este inversată: numele nou vine primul.' },
      { text: 'sudo groupmod -g engineers devs', why: '-g schimbă GID-ul (număr), nu numele.' },
      { text: 'sudo usermod -l engineers devs', why: 'usermod -l redenumește utilizatori, nu grupuri.' },
    ],
  },
  {
    id: 'L9.3-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi arată TOATE grupurile utilizatorului `alice` (primar + suplimentare)?',
    explanation: 'id și groups includ grupul primar; getent group arată doar membri suplimentari.',
    options: [
      { id: 'a', text: '`id alice`', correct: true, why: 'Afișează gid= și groups=.' },
      { id: 'b', text: '`groups alice`', correct: true, why: 'Listează numele tuturor grupurilor.' },
      { id: 'c', text: '`id -Gn alice`', correct: true, why: '-G toate ID-urile, -n nume.' },
      { id: 'd', text: '`grep alice /etc/group`', correct: false, why: 'Nu include grupul primar și poate potrivi alte linii.' },
    ],
  },
  {
    id: 'L9.3-009', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Directorul `/srv/proiect` are permisiunile de mai jos. Un membru al lui `devs` creează un fișier acolo. Ce grup va avea fișierul?',
    explanation: 'Cu setgid pe director (`s` la grup), fișierele noi moștenesc grupul directorului.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ls -ld', code: 'drwxrws---. 2 root devs 6 Nov 17 11:02 /srv/proiect' },
    options: [
      { id: 'a', text: '`devs`, datorită bitului setgid.', correct: true, why: 'Litera s la grup indică setgid.' },
      { id: 'b', text: 'Grupul primar al creatorului.', correct: false, why: 'Aceasta ar fi cazul fără setgid.' },
      { id: 'c', text: '`root`.', correct: false, why: 'root este doar proprietarul directorului.' },
      { id: 'd', text: 'Fișierul nu poate fi creat.', correct: false, why: 'Membrii devs au rwx.' },
    ],
  },
  {
    id: 'L9.3-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai adăugat utilizatorul `student` în `devs`, dar în terminalul lui deschis `id` nu arată grupul. Ce faci?',
    explanation: 'Lista de grupuri se fixează la login; sesiunea nouă o primește.',
    options: [
      { id: 'a', text: 'Te deconectezi și te reconectezi (sau folosești `newgrp devs`).', correct: true, why: 'Procesele moștenesc lista de la login; una nouă apare doar într-o sesiune nouă.' },
      { id: 'b', text: 'Repornești doar `sshd`.', correct: false, why: 'Nu schimbă sesiunile existente.' },
      { id: 'c', text: 'Rulezi `groupmod -a devs`.', correct: false, why: 'Nu are legătură cu sesiunea.' },
      { id: 'd', text: 'Ștergi grupul și îl creezi din nou.', correct: false, why: 'Nu rezolvă problema și pierde configurația.' },
    ],
  },
  {
    id: 'L9.3-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru un director de echipă `/srv/proj` accesibil doar grupului `team`, cu moștenirea grupului.',
    explanation: 'Grup → membri → director → grup și permisiuni → test.',
    items: [
      { text: '`sudo groupadd team` — creezi grupul', why: 'Grupul trebuie să existe înainte de chgrp.' },
      { text: '`sudo usermod -aG team alice` — adaugi membrii', why: '-aG, ca să nu pierzi alte grupuri.' },
      { text: '`sudo mkdir -p /srv/proj` — creezi directorul', why: 'Înainte de a-i seta grupul.' },
      { text: '`sudo chgrp team /srv/proj && sudo chmod 2770 /srv/proj` — grup și setgid', why: '2770: setgid + rwx pentru proprietar și grup.' },
      { text: '`sudo -u alice touch /srv/proj/t; ls -l /srv/proj/t` — testezi', why: 'Fișierul trebuie să aibă grupul team.' },
    ],
  },
  {
    id: 'L9.3-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda cu efectul asupra apartenenței.',
    explanation: 'Fiecare comandă are un efect precis; atenție la cele care înlocuiesc.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`usermod -aG devs alice`', right: 'adaugă devs la grupurile suplimentare ale lui alice', why: '-a = append.' },
      { left: '`usermod -G devs alice`', right: 'înlocuiește lista suplimentară cu doar devs', why: 'Fără -a.' },
      { left: '`usermod -g devs alice`', right: 'schimbă grupul primar al lui alice', why: '-g mic.' },
      { left: '`gpasswd -d alice devs`', right: 'scoate alice din grupul devs', why: '-d = delete.' },
    ],
    distractors: [{ text: 'creează un grup de sistem', why: 'Aceasta este groupadd -r.' }],
  },
  {
    id: 'L9.3-013', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un coleg a editat manual `/etc/group` și acum membrii grupului `devs` nu sunt recunoscuți corect. Care este greșeala?',
    explanation: 'Membrii se separă prin virgulă, fără spații.',
    snippet: { kind: 'find-error', title: '/etc/group', code: 'devs:x:1010:alice, bob' },
    options: [
      { id: 'a', text: 'Spațiul după virgulă: trebuie `alice,bob`.', correct: true, why: 'Câmpul membri este o listă separată prin virgule, fără spații.' },
      { id: 'b', text: 'GID-ul nu poate fi 1010.', correct: false, why: '1010 este un GID obișnuit valid.' },
      { id: 'c', text: 'Câmpul 2 trebuie să conțină parola în clar.', correct: false, why: 'x înseamnă parola în /etc/gshadow.' },
      { id: 'd', text: 'Numele grupului trebuie să fie cu majuscule.', correct: false, why: 'Nu există o asemenea cerință.' },
    ],
  },
];
