import type { Question } from '../../lib/types';

const T = 'L10.2';
const O = ['C10-3'];

export const Q_L10_2: Question[] = [
  {
    id: 'L10.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care cheie din perechea SSH se copiază pe server, în `authorized_keys`?',
    explanation: 'Cheia publică se distribuie; cea privată rămâne pe client.',
    options: [
      { id: 'a', text: 'Cheia publică (`id_ed25519.pub`).', correct: true, why: 'Poate fi văzută de oricine; serverul o folosește doar pentru a verifica semnături.' },
      { id: 'b', text: 'Cheia privată (`id_ed25519`).', correct: false, why: 'Cine o are se poate da drept tine; nu părăsește clientul.' },
      { id: 'c', text: 'Ambele.', correct: false, why: 'Cea privată nu trebuie copiată nicăieri.' },
      { id: 'd', text: 'Fișierul `known_hosts`.', correct: false, why: 'known_hosts conține cheile serverelor, nu ale utilizatorului.' },
    ],
  },
  {
    id: 'L10.2-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Generează o pereche de chei Ed25519 cu fișierele implicite.',
    prompt: '[student@server1 ~]$',
    answers: ['ssh-keygen -t ed25519', 'ssh-keygen'],
    canonical: 'ssh-keygen -t ed25519',
    explanation: 'ssh-keygen(1): ed25519 este tipul implicit; -t îl indică explicit.',
    wrong: [
      { text: 'ssh-copy-id -t ed25519', why: 'ssh-copy-id instalează o cheie existentă, nu generează una.' },
      { text: 'ssh-keygen -l', why: '-l afișează amprenta unui fișier; nu creează chei.' },
      { text: 'ssh -keygen ed25519', why: 'Nu este o sintaxă validă.' },
    ],
  },
  {
    id: 'L10.2-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Instalează cheia publică implicită a utilizatorului curent pe `student@server2`.',
    prompt: '[student@server1 ~]$',
    answers: ['ssh-copy-id student@server2'],
    canonical: 'ssh-copy-id student@server2',
    explanation: 'ssh-copy-id adaugă cheia în ~/.ssh/authorized_keys de pe server, cerând parola o dată.',
    wrong: [
      { text: 'scp ~/.ssh/id_ed25519 student@server2:', why: 'Ai copia cheia PRIVATĂ într-un loc greșit; nu o instalezi.' },
      { text: 'ssh student@server2 -i', why: 'Fără fișierul de după -i comanda este invalidă și oricum nu instalează nimic.' },
      { text: 'ssh-add student@server2', why: 'ssh-add încarcă chei în agent local; nu instalează pe server.' },
    ],
  },
  {
    id: 'L10.2-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Conectează-te la `server2` ca `student`, forțând cheia `~/.ssh/id_lab`.',
    prompt: '[student@server1 ~]$',
    answers: ['ssh -i ~/.ssh/id_lab student@server2'],
    canonical: 'ssh -i ~/.ssh/id_lab student@server2',
    explanation: '-i indică fișierul cheii private (identity file).',
    wrong: [
      { text: 'ssh -i ~/.ssh/id_lab.pub student@server2', why: 'Cu .pub, ssh caută cheia privată potrivită în agent; fără agent încărcat nu merge.' },
      { text: 'ssh student@server2 -k ~/.ssh/id_lab', why: '-k nu este opțiunea pentru cheia de identitate.' },
      { text: 'ssh-copy-id -i ~/.ssh/id_lab student@server2', why: 'Aceasta instalează cheia, nu deschide o sesiune.' },
    ],
  },
  {
    id: 'L10.2-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai instalat cheia, dar `ssh` tot cere parola. Jurnalul sshd conține mesajul din fragment. Ce faci?',
    explanation: 'StrictModes (implicit yes) respinge directoare/fișiere scriptibile de alții.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'journalctl -u sshd', code: 'sshd[2301]: Authentication refused: bad ownership or modes for directory /home/student/.ssh' },
    options: [
      { id: 'a', text: 'Repari permisiunile: `chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys` și te asiguri că home-ul nu e scriptibil de alții.', correct: true, why: 'Mesajul indică proprietar sau moduri greșite; StrictModes cere acces restrâns.' },
      { id: 'b', text: 'Dezactivezi SELinux.', correct: false, why: 'Mesajul nu este un AVC; problema este de permisiuni.' },
      { id: 'c', text: 'Regenerezi cheile.', correct: false, why: 'Cheile sunt valide; fișierele au drepturi nepotrivite.' },
      { id: 'd', text: 'Repornești calculatorul.', correct: false, why: 'Permisiunile nu se corectează singure.' },
    ],
  },
  {
    id: 'L10.2-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care sunt permisiunile corecte (recomandate) pe serverul care primește cheia?',
    explanation: 'Doar proprietarul poate scrie în ~/.ssh și în authorized_keys; cheia privată: 600.',
    options: [
      { id: 'a', text: '`~/.ssh` — `700`.', correct: true, why: 'Doar proprietarul are acces, cum cere sshd(8).' },
      { id: 'b', text: '`~/.ssh/authorized_keys` — `600` (sau cel puțin nescriptibil de alții).', correct: true, why: 'Un fișier scriptibil de alții este ignorat cu StrictModes.' },
      { id: 'c', text: '`~/.ssh/id_ed25519` (cheia privată, pe client) — `600`.', correct: true, why: 'ssh refuză cheile private prea permisive.' },
      { id: 'd', text: '`~/.ssh` — `777`.', correct: false, why: 'Oricine ar putea adăuga chei: sshd respinge.' },
    ],
  },
  {
    id: 'L10.2-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cum testezi concludent că autentificarea folosește cheia, nu parola?',
    explanation: 'Dezactivând parola în client, dacă cheia nu merge conectarea eșuează.',
    options: [
      { id: 'a', text: '`ssh -o PasswordAuthentication=no -i ~/.ssh/id_lab student@server2 hostname`', correct: true, why: 'Fără parolă permisă, un succes înseamnă cheie validă.' },
      { id: 'b', text: '`ssh student@server2` și te uiți dacă se conectează.', correct: false, why: 'Dacă cheia e respinsă, ssh cere parola și poți crede greșit că cheia merge.' },
      { id: 'c', text: '`ssh -V student@server2`', correct: false, why: '-V afișează versiunea clientului.' },
      { id: 'd', text: '`ssh-keygen -R server2`', correct: false, why: '-R șterge o gazdă din known_hosts.' },
    ],
  },
  {
    id: 'L10.2-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Linia de mai jos a fost pusă în `~/.ssh/authorized_keys`. Care este problema?',
    explanation: 'O cheie trebuie să fie pe o singură linie.',
    snippet: { kind: 'find-error', title: '~/.ssh/authorized_keys', code: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExempluFic\n tivIlustrativ0123456789ab alice@pc' },
    options: [
      { id: 'a', text: 'Cheia este ruptă pe două linii; trebuie să fie pe o singură linie.', correct: true, why: 'sshd citește o cheie pe linie; o cheie ruptă nu se potrivește.' },
      { id: 'b', text: 'Comentariul `alice@pc` este interzis.', correct: false, why: 'Comentariul este permis și ignorat de sshd.' },
      { id: 'c', text: 'Tipul `ssh-ed25519` nu este acceptat.', correct: false, why: 'Este un tip acceptat.' },
      { id: 'd', text: 'Cheia trebuie scrisă în MAJUSCULE.', correct: false, why: 'base64 este sensibil la majuscule; nu se modifică.' },
    ],
  },
  {
    id: 'L10.2-009', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pe server, permisiunile sunt corecte, dar cheia este respinsă iar `ausearch -m avc` arată `denied { read } … name="authorized_keys" … tcontext=…tmp_t`. Cauza și remedierea?',
    explanation: 'Fișierul mutat din /tmp păstrează tipul de acolo; sshd_t nu îl poate citi.',
    options: [
      { id: 'a', text: 'Context SELinux greșit după `mv`; `restorecon -R -v ~/.ssh`.', correct: true, why: 'restorecon readuce tipul implicit (ssh_home_t), fără a schimba permisiunile.' },
      { id: 'b', text: 'Firewall; `firewall-cmd --add-service=ssh`.', correct: false, why: 'Conexiunea se realizează; problema apare la citirea fișierului.' },
      { id: 'c', text: 'Lipsă parolă; `passwd student`.', correct: false, why: 'Parola nu influențează citirea cheii.' },
      { id: 'd', text: '`chmod 777 authorized_keys`.', correct: false, why: 'Încalcă StrictModes și nu schimbă contextul SELinux.' },
    ],
  },
  {
    id: 'L10.2-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru „autentificare cu chei de pe server1 pe server2 pentru student, fără parolă”.',
    explanation: 'Generezi, instalezi, testezi cu parola dezactivată, verifici permisiunile.',
    items: [
      { text: '`ssh-keygen -t ed25519 -f ~/.ssh/id_lab -N ""` pe client', why: 'Creezi perechea de chei.' },
      { text: '`ssh-copy-id -i ~/.ssh/id_lab.pub student@server2`', why: 'Instalezi cheia publică (cere parola o dată).' },
      { text: '`ssh -o PasswordAuthentication=no -i ~/.ssh/id_lab student@server2 hostname`', why: 'Testul concludent al cheii.' },
      { text: 'Dacă eșuează: `ls -ld ~ ~/.ssh` și `ls -l ~/.ssh/authorized_keys` pe server', why: 'Verifici proprietarul și permisiunile.' },
      { text: 'Apoi `restorecon -R -v ~/.ssh` și `journalctl -u sshd`', why: 'Contextul SELinux și motivul din jurnal.' },
    ],
  },
  {
    id: 'L10.2-011', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește directiva `sshd_config` cu rolul ei și valoarea implicită din documentația citită.',
    explanation: 'Valorile implicite sunt din sshd_config(5).',
    leftLabel: 'Directivă', rightLabel: 'Rol / implicit',
    pairs: [
      { left: '`PubkeyAuthentication`', right: 'permite autentificarea cu chei; implicit yes', why: 'Fără ea, cheile nu sunt folosite.' },
      { left: '`StrictModes`', right: 'verifică proprietarul și modurile fișierelor utilizatorului; implicit yes', why: 'Explică mesajul „bad ownership or modes”.' },
      { left: '`AuthorizedKeysFile`', right: 'unde caută sshd cheile; implicit .ssh/authorized_keys', why: 'Relativ la home-ul utilizatorului.' },
      { left: '`PermitRootLogin`', right: 'dacă root se poate conecta; implicit prohibit-password', why: 'Root doar cu cheie, nu cu parolă.' },
    ],
    distractors: [{ text: 'alege portul pe care ascultă sshd', why: 'Aceasta este directiva Port, nu una dintre cele patru.' }],
  },
  {
    id: 'L10.2-012', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai o frază-parolă pe cheie și nu vrei s-o tastezi la fiecare conectare. Ce folosești?',
    explanation: 'ssh-agent ține cheia decriptată în memorie; ssh-add o încarcă.',
    options: [
      { id: 'a', text: '`ssh-agent` și `ssh-add ~/.ssh/id_lab`.', correct: true, why: 'Agentul semnează provocările în numele tău; fraza se cere o singură dată.' },
      { id: 'b', text: '`ssh-copy-id` la fiecare conectare.', correct: false, why: 'ssh-copy-id instalează o cheie; nu ține fraza-parolă.' },
      { id: 'c', text: 'Copiezi cheia privată pe server.', correct: false, why: 'Compromite securitatea cheii.' },
      { id: 'd', text: 'Dezactivezi StrictModes.', correct: false, why: 'Nu are legătură cu fraza-parolă.' },
    ],
  },
];
