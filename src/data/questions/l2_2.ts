import type { Question } from '../../lib/types';

const T = 'L2.2';
const O = ['C2-2'];

export const Q_L2_2: Question[] = [
  {
    id: 'L2.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Primești `bash: tree: command not found`. Care este modul cel mai direct de a afla ce pachet oferă comanda?',
    explanation: '`dnf provides` caută în metadata repository-urilor după fișierul sau comanda dată.',
    options: [
      { id: 'a', text: "`dnf provides '*/bin/tree'`", correct: true, why: 'Caută pachetele care conțin un fișier numit `tree` într-un director `bin`.' },
      { id: 'b', text: '`rpm -q tree`', correct: false, why: 'Interoghează doar pachetele INSTALATE; ar răspunde „not installed”.' },
      { id: 'c', text: '`dnf remove tree`', correct: false, why: 'Șterge un pachet; nu ajută la găsirea lui.' },
      { id: 'd', text: '`rpm -ql tree`', correct: false, why: 'Listează fișierele unui pachet instalat; aici pachetul lipsește.' },
    ],
  },
  {
    id: 'L2.2-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai un fișier `/root/utilitar-1.0-1.noarch.rpm`, iar pachetul depinde de alte pachete din repository. Cum îl instalezi corect?',
    explanation: '`dnf install` cu cale locală instalează fișierul și rezolvă dependențele din repository-uri.',
    options: [
      { id: 'a', text: '`sudo dnf install /root/utilitar-1.0-1.noarch.rpm`', correct: true, why: 'dnf aduce dependențele lipsă din repository-urile active.' },
      { id: 'b', text: '`sudo rpm -ivh /root/utilitar-1.0-1.noarch.rpm`', correct: false, why: 'Funcționează doar dacă dependențele sunt deja instalate; altfel eșuează cu „Failed dependencies”.' },
      { id: 'c', text: '`sudo dnf install utilitar-1.0-1.noarch.rpm` din alt director', correct: false, why: 'Fără cale, dnf caută un NUME de pachet în repository, nu fișierul tău.' },
      { id: 'd', text: '`sudo rpm -q /root/utilitar-1.0-1.noarch.rpm`', correct: false, why: '`-q` interoghează, nu instalează.' },
    ],
  },
  {
    id: 'L2.2-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi răspund la „ce pachet a instalat fișierul `/etc/ssh/sshd_config`?” sau „ce a instalat pachetul `tree`?” (alege toate cele corecte)',
    explanation: '`rpm -qf` merge de la fișier la pachet; `rpm -ql` merge de la pachet la fișiere.',
    options: [
      { id: 'a', text: '`rpm -qf /etc/ssh/sshd_config`', correct: true, why: 'Afișează pachetul care deține fișierul.' },
      { id: 'b', text: '`rpm -ql tree`', correct: true, why: 'Listează toate fișierele instalate de pachetul `tree`.' },
      { id: 'c', text: '`rpm -qa /etc/ssh/sshd_config`', correct: false, why: '`-qa` listează toate pachetele; nu se folosește cu un fișier.' },
      { id: 'd', text: '`dnf info /etc/ssh/sshd_config`', correct: false, why: '`dnf info` primește un nume de pachet, nu un fișier.' },
    ],
  },
  {
    id: 'L2.2-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează detaliile pachetului INSTALAT `openssh-server` (versiune, mărime, licență) din baza RPM locală.',
    prompt: '[student@server1 ~]$',
    answers: ['rpm -qi openssh-server', 'rpm -q -i openssh-server', 'rpm --query --info openssh-server'],
    canonical: 'rpm -qi openssh-server',
    explanation: '`-q` = query, `-i` = info; împreună: `-qi`.',
    wrong: [
      { text: 'rpm -ql openssh-server', why: '`-l` listează fișierele pachetului, nu informațiile lui.' },
      { text: 'rpm -qa openssh-server', why: '`-a` înseamnă „toate pachetele”; nu se combină cu un nume în acest fel.' },
      { text: 'rpm -i openssh-server', why: '`-i` fără `-q` înseamnă INSTALARE a unui fișier RPM.' },
    ],
    hint: 'q de la query, i de la info.',
  },
  {
    id: 'L2.2-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a instala în siguranță un pachet și a-l confirma.',
    explanation: 'Cauți, inspectezi, instalezi, confirmi din baza RPM.',
    items: [
      { text: '`dnf search tree`', why: 'Găsești numele exact al pachetului.' },
      { text: '`dnf info tree`', why: 'Vezi versiunea, repository-ul și dacă este deja instalat.' },
      { text: '`sudo dnf install tree`', why: 'Citești lista și confirmi instalarea.' },
      { text: '`rpm -q tree`', why: 'Confirmi că pachetul este înregistrat în baza RPM.' },
    ],
  },
  {
    id: 'L2.2-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește comanda cu efectul.',
    explanation: 'Comenzi de instalare, ștergere și interogare.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`dnf install X`', right: 'instalează X și dependențele lipsă', why: 'Rezolvă dependențele din repository-uri.' },
      { left: '`dnf remove X`', right: 'șterge X și pachetele care depind de el', why: 'Poate elimina mai mult decât ai cerut; citește lista.' },
      { left: '`dnf autoremove`', right: 'șterge dependențele rămase fără utilizare', why: 'Curăță pachetele aduse doar ca dependențe și acum orfane.' },
      { left: '`rpm -qf FIȘIER`', right: 'arată pachetul care deține fișierul', why: '`-f` = file.' },
      { left: '`rpm -V X`', right: 'compară fișierele instalate cu pachetul', why: '`-V` = verify; fără output înseamnă că totul coincide.' },
    ],
    distractors: [{ text: 'adaugă un repository nou', why: 'Aceasta ține de fișierele `.repo` (L2.1), nu de aceste comenzi.' }],
  },
  {
    id: 'L2.2-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rulezi comanda de mai jos și primești eroarea. Care este remedierea corectă?',
    explanation: 'Fără `./` sau cale, dnf interpretează argumentul ca nume de pachet.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ ls\nutilitar-1.0-1.noarch.rpm\n[student@server1 ~]$ sudo dnf install utilitar-1.0-1.noarch.rpm\nNo match for argument: utilitar-1.0-1.noarch.rpm\nError: Unable to find a match: utilitar-1.0-1.noarch.rpm' },
    options: [
      { id: 'a', text: 'Folosești calea: `sudo dnf install ./utilitar-1.0-1.noarch.rpm`.', correct: true, why: '`./` arată că este un fișier local, nu un nume de pachet din repository.' },
      { id: 'b', text: 'Rulezi `dnf clean all` și repeți aceeași comandă.', correct: false, why: 'Cache-ul nu este problema; argumentul este tratat ca nume de pachet.' },
      { id: 'c', text: 'Adaugi `--nogpgcheck`.', correct: false, why: 'Nu rezolvă problema căii și slăbește verificarea de securitate.' },
      { id: 'd', text: 'Schimbi extensia în `.repo`.', correct: false, why: '`.repo` este un fișier de configurare, nu un pachet.' },
    ],
  },
  {
    id: 'L2.2-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți spune acest output?',
    explanation: '`rpm -V` afișează, pe fiecare linie, ce atribute ale fișierului diferă de pachet; `c` = fișier de configurare.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'rpm -V', code: '[student@server1 ~]$ rpm -V openssh-server\nS.5....T.  c /etc/ssh/sshd_config' },
    options: [
      { id: 'a', text: 'Fișierul de configurare `sshd_config` diferă de cel din pachet (mărime, sumă de control, dată).', correct: true, why: 'S, 5 și T indică diferențe de mărime, sumă de control și timp; este așteptat dacă l-ai editat.' },
      { id: 'b', text: 'Pachetul `openssh-server` nu este instalat.', correct: false, why: 'Pentru un pachet neinstalat, rpm răspunde „package ... is not installed”.' },
      { id: 'c', text: 'Pachetul este corupt și trebuie șters imediat.', correct: false, why: 'Un fișier de configurare modificat este normal; nu indică un pachet corupt.' },
      { id: 'd', text: 'Verificarea semnăturii GPG a eșuat.', correct: false, why: 'Semnătura se verifică cu `rpm -K`, nu cu `rpm -V`.' },
    ],
  },
];
