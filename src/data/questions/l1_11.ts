import type { Question } from '../../lib/types';

const T = 'L1.11';
const O = ['C1-4'];

export const Q_L1_11: Question[] = [
  {
    id: 'L1.11-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce comandă te conectează ca utilizatorul `ana` la serverul `srv1`?',
    explanation: 'Sintaxa este `ssh utilizator@gazdă`.',
    options: [
      { id: 'a', text: '`ssh ana@srv1`', correct: true, why: 'Forma standard utilizator@gazdă.' },
      { id: 'b', text: '`ssh srv1@ana`', correct: false, why: 'Ordinea este inversată: utilizatorul vine înaintea lui `@`.' },
      { id: 'c', text: '`ssh -p ana srv1`', correct: false, why: '`-p` indică un port, nu utilizatorul.' },
      { id: 'd', text: '`scp ana@srv1`', correct: false, why: '`scp` copiază fișiere; nu deschide o sesiune.' },
    ],
  },
  {
    id: 'L1.11-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'La prima conectare la un server nou, ssh afișează o amprentă și întreabă dacă vrei să continui. Ce este amprenta?',
    explanation: 'Este amprenta cheii gazdei: dovada identității serverului. După confirmare, cheia se salvează în `~/.ssh/known_hosts`.',
    options: [
      { id: 'a', text: 'Amprenta cheii gazdei (serverului), pe care ar trebui să o verifici și care se salvează în `known_hosts`.', correct: true, why: 'Clientul o compară la conectările viitoare; schimbarea ei declanșează un avertisment.' },
      { id: 'b', text: 'Amprenta cheii tale private, trimisă serverului.', correct: false, why: 'Cheia privată nu părăsește niciodată clientul.' },
      { id: 'c', text: 'Parola ta, criptată.', correct: false, why: 'Parola nu se afișează și nu este amprenta.' },
      { id: 'd', text: 'Un cod de unică folosință trimis pe e-mail.', correct: false, why: 'Nu face parte din protocolul SSH de bază.' },
    ],
  },
  {
    id: 'L1.11-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Pentru ca autentificarea cu cheie publică să funcționeze, ce trebuie să fie adevărat? (alege toate cele corecte)',
    explanation: 'Cheia publică trebuie să fie pe server, iar permisiunile fișierelor trebuie să fie stricte.',
    options: [
      { id: 'a', text: 'Cheia publică este în `~/.ssh/authorized_keys` al contului țintă, pe server.', correct: true, why: 'Serverul caută acolo cheile acceptate.' },
      { id: 'b', text: 'Cheia privată rămâne pe client și are permisiuni `600`.', correct: true, why: 'Un client refuză o cheie privată citibilă de alții.' },
      { id: 'c', text: '`~/.ssh` pe server are permisiuni stricte (de ex. `700`) și `authorized_keys` nu este scriibil de alții.', correct: true, why: 'Altfel serverul poate ignora cheia.' },
      { id: 'd', text: 'Cheia privată trebuie copiată și pe server.', correct: false, why: 'Cheia privată nu se copiază niciodată; doar cea publică.' },
    ],
  },
  {
    id: 'L1.11-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Copiază fișierul local `raport.txt` în `/tmp` pe `srv1`, ca utilizatorul `ana`.',
    prompt: '[student@server1 ~]$',
    answers: ['scp raport.txt ana@srv1:/tmp/', 'scp raport.txt ana@srv1:/tmp'],
    canonical: 'scp raport.txt ana@srv1:/tmp/',
    explanation: '`scp sursă destinație`; calea remote este `utilizator@gazdă:cale`, cu `:` între gazdă și cale.',
    wrong: [
      { text: 'scp raport.txt ana@srv1/tmp/', why: 'Lipsește `:` între gazdă și cale: ar fi interpretat ca o cale locală.' },
      { text: 'scp ana@srv1:/tmp/ raport.txt', why: 'Ordinea este inversată: ai descărca din remote în local.' },
      { text: 'ssh raport.txt ana@srv1:/tmp/', why: '`ssh` nu copiază fișiere în acest fel.' },
    ],
    hint: 'Calea remote are forma utilizator@gazdă:cale.',
  },
  {
    id: 'L1.11-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a configura autentificarea cu cheie către `srv1`.',
    explanation: 'Creezi cheia, instalezi cheia publică, apoi testezi fără parolă.',
    items: [
      { text: '`ssh-keygen -t ed25519`', why: 'Generezi perechea de chei pe client.' },
      { text: '`ssh-copy-id ana@srv1`', why: 'Instalezi cheia publică pe server (cere parola o dată).' },
      { text: '`ssh -o PasswordAuthentication=no ana@srv1 whoami`', why: 'Testezi că cheia funcționează fără parolă.' },
      { text: 'Verifici permisiunile din `~/.ssh` dacă testul eșuează', why: 'Cauza obișnuită când se cere totuși parola.' },
    ],
  },
  {
    id: 'L1.11-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește fișierul/comanda cu rolul.',
    explanation: 'Elementele de bază ale SSH.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`~/.ssh/known_hosts`', right: 'cheile gazdelor cunoscute (pe client)', why: 'Cu ea, clientul recunoaște serverele.' },
      { left: '`~/.ssh/authorized_keys`', right: 'cheile publice acceptate pentru cont (pe server)', why: 'Serverul caută aici cheia ta publică.' },
      { left: '`id_ed25519`', right: 'cheia privată (secretă)', why: 'Nu se partajează; permisiuni 600.' },
      { left: '`id_ed25519.pub`', right: 'cheia publică (poate fi copiată)', why: 'Aceasta o instalezi pe server.' },
      { left: '`ssh-copy-id`', right: 'instalează cheia publică pe server', why: 'Adaugă în authorized_keys și setează permisiunile.' },
    ],
    distractors: [{ text: 'fișierul de configurare al serviciului sshd', why: 'Acela este `/etc/ssh/sshd_config`, pe server.' }],
  },
  {
    id: 'L1.11-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rulezi comanda de mai jos și constați că fișierul `rez.txt` apare pe calculatorul tău local, nu pe server. De ce?',
    explanation: 'Redirecționarea din afara apostrofurilor este interpretată de shell-ul local; fișierul se creează local. Pentru a scrie pe server, redirecționarea trebuie să fie în interiorul apostrofurilor.',
    snippet: { kind: 'find-error', title: 'comandă tastată', code: "ssh ana@srv1 'ls /etc' > rez.txt" },
    options: [
      { id: 'a', text: 'Operatorul `>` este în afara apostrofurilor, deci îl execută shell-ul local; ieșirea remote ajunge într-un fișier local.', correct: true, why: 'Pentru fișier remote: `ssh ana@srv1 \'ls /etc > rez.txt\'`.' },
      { id: 'b', text: '`ssh` nu poate rula `ls`.', correct: false, why: '`ssh` poate rula orice comandă disponibilă pe server.' },
      { id: 'c', text: 'Apostrofurile fac ca ieșirea să fie trimisă înapoi.', correct: false, why: 'Apostrofurile doar protejează textul comenzii de interpretarea locală.' },
      { id: 'd', text: 'Trebuia opțiunea `-r`.', correct: false, why: '`-r` este pentru scp (recursiv), nu pentru acest caz.' },
    ],
  },
  {
    id: 'L1.11-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce înseamnă mesajul de mai jos și ce faci?',
    explanation: 'Cheia gazdei din `known_hosts` nu se mai potrivește cu cea prezentată de server. Poate fi legitim (reinstalare) sau un atac; verifici înainte să ștergi intrarea.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ssh', code: '@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @\nOffending ED25519 key in /home/student/.ssh/known_hosts:3\nHost key verification failed.' },
    options: [
      { id: 'a', text: 'Cheia serverului s-a schimbat; verifici dacă schimbarea este legitimă și, dacă da, rulezi `ssh-keygen -R gazdă`.', correct: true, why: '`-R` elimină intrarea veche; la următoarea conectare vei confirma noua amprentă.' },
      { id: 'b', text: 'Parola ta a expirat; o resetezi cu `passwd`.', correct: false, why: 'Mesajul este despre cheia gazdei, nu despre parolă.' },
      { id: 'c', text: 'Serviciul sshd nu rulează; îl pornești.', correct: false, why: 'Dacă nu rula, ai fi primit „Connection refused”.' },
      { id: 'd', text: 'Răspunzi `yes` și continui, fără alte verificări.', correct: false, why: 'Mesajul indică posibilă interceptare; verifică înainte.' },
    ],
  },
  {
    id: 'L1.11-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Serverul rulează sshd pe portul 2222. Ce comenzi sunt corecte pentru conectare și pentru copiere?',
    explanation: 'La `ssh` portul se dă cu `-p` (minuscul), la `scp` cu `-P` (majuscul).',
    options: [
      { id: 'a', text: '`ssh -p 2222 ana@srv1` și `scp -P 2222 f ana@srv1:/tmp/`', correct: true, why: 'Opțiunile pentru port diferă ca literă: p la ssh, P la scp.' },
      { id: 'b', text: '`ssh -P 2222 ana@srv1` și `scp -p 2222 f ana@srv1:/tmp/`', correct: false, why: 'Literele sunt inversate; `scp -p` păstrează timpii și permisiunile, nu portul.' },
      { id: 'c', text: '`ssh -p 2222 ana@srv1` și `scp -p 2222 f …`', correct: false, why: 'La `scp` portul se dă cu `-P` (majuscul).' },
      { id: 'd', text: '`ssh ana@srv1:2222`', correct: false, why: 'Portul nu se scrie după `:` în ssh; `:` separă gazda de cale la scp.' },
    ],
  },
];
