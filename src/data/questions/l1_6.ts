import type { Question } from '../../lib/types';

const T = 'L1.6';
const O = ['C1-3'];

export const Q_L1_6: Question[] = [
  {
    id: 'L1.6-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce afișează `grep -v bash /etc/passwd`?',
    explanation: '`-v` inversează selecția: sunt afișate liniile care nu se potrivesc.',
    options: [
      { id: 'a', text: 'Toate liniile din `/etc/passwd` care NU conțin „bash”.', correct: true, why: '`-v` (--invert-match) selectează liniile fără potrivire.' },
      { id: 'b', text: 'Doar liniile care conțin „bash”.', correct: false, why: 'Aceasta este comportarea fără `-v`.' },
      { id: 'c', text: 'Numărul liniilor cu „bash”.', correct: false, why: 'Numărul îl dă `-c`.' },
      { id: 'd', text: 'Versiunea comenzii grep.', correct: false, why: '`-v` la grep nu înseamnă „version” (aceea este `-V`).' },
    ],
  },
  {
    id: 'L1.6-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce linii selectează tiparul `^root` în `/etc/passwd`?',
    explanation: '`^` ancorează la începutul liniei.',
    options: [
      { id: 'a', text: 'Doar liniile care încep cu „root”.', correct: true, why: '`^` = început de linie.' },
      { id: 'b', text: 'Liniile care se termină cu „root”.', correct: false, why: 'Pentru sfârșit de linie se folosește `$`.' },
      { id: 'c', text: 'Toate liniile care conțin „root” oriunde.', correct: false, why: 'Aceasta ar fi `grep root`, fără ancoră.' },
      { id: 'd', text: 'Liniile care NU conțin „root”.', correct: false, why: 'Pentru excludere se folosește `-v`.' },
    ],
  },
  {
    id: 'L1.6-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre comenzi afișează fișierul `sshd_config` fără liniile-comentariu și fără linii goale? (alege toate cele corecte)',
    explanation: 'Trebuie excluse două tipare: liniile care încep cu `#` și cele goale (`^$`).',
    options: [
      { id: 'a', text: "`grep -v -e '^#' -e '^$' sshd_config`", correct: true, why: '`-e` permite două tipare; `-v` le exclude pe amândouă.' },
      { id: 'b', text: "`grep -v '^#' sshd_config | grep -v '^$'`", correct: true, why: 'Două filtre în lanț: primul scoate comentariile, al doilea liniile goale.' },
      { id: 'c', text: "`grep -Ev '^#|^$' sshd_config`", correct: true, why: 'Cu ERE, `|` înseamnă „sau”; `-v` exclude ce se potrivește cu oricare.' },
      { id: 'd', text: "`grep '^#' sshd_config`", correct: false, why: 'Afișează tocmai comentariile, nu le exclude.' },
    ],
  },
  {
    id: 'L1.6-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Numără câte linii din `/etc/passwd` se termină cu `/sbin/nologin`.',
    prompt: '[student@server1 ~]$',
    answers: ["grep -c 'nologin$' /etc/passwd", "grep -c '/sbin/nologin$' /etc/passwd", 'grep -c "nologin$" /etc/passwd', 'grep -c "/sbin/nologin$" /etc/passwd'],
    canonical: "grep -c '/sbin/nologin$' /etc/passwd",
    explanation: '`-c` numără liniile potrivite; `$` ancorează sfârșitul liniei; tiparul se citează pentru ca shell-ul să nu interpreteze `$`.',
    wrong: [
      { text: 'grep -v nologin /etc/passwd', why: '`-v` afișează liniile fără „nologin”, nu le numără.' },
      { text: "grep '/sbin/nologin' /etc/passwd | wc -c", why: '`wc -c` numără octeții, nu liniile.' },
      { text: "grep -n 'nologin$' /etc/passwd", why: '`-n` afișează liniile cu numărul lor; nu le numără.' },
    ],
    hint: 'Există o opțiune a lui grep care afișează doar numărul.',
  },
  {
    id: 'L1.6-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează un pipeline care afișează primele 3 shell-uri, în ordinea frecvenței descrescătoare, din `/etc/passwd`.',
    explanation: 'Extragi câmpul, grupezi valorile identice (după sortare), numeri, sortezi numeric invers, limitezi.',
    items: [
      { text: '`cut -d: -f7 /etc/passwd`', why: 'Extrage al șaptelea câmp (shell-ul).' },
      { text: '`| sort`', why: 'Aduce valorile identice una lângă alta, necesar pentru uniq.' },
      { text: '`| uniq -c`', why: 'Colapsează valorile identice adiacente și le numără.' },
      { text: '`| sort -rn`', why: 'Ordonează numeric, descrescător, după numărul de apariții.' },
      { text: '`| head -n 3`', why: 'Păstrează primele trei rezultate.' },
    ],
  },
  {
    id: 'L1.6-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește elementul de expresie regulată cu semnificația lui.',
    explanation: 'Metacaracterele de bază ale expresiilor regulate POSIX.',
    leftLabel: 'Element', rightLabel: 'Semnificație',
    pairs: [
      { left: '`.`', right: 'orice caracter (exact unul)', why: 'Punctul nu este literal într-o expresie regulată.' },
      { left: '`*`', right: 'zero sau mai multe repetări ale elementului precedent', why: 'Se aplică elementului din fața lui, nu „orice”.' },
      { left: '`^`', right: 'începutul liniei', why: 'Ancoră: impune poziția, nu consumă caractere.' },
      { left: '`$`', right: 'sfârșitul liniei', why: 'Ancoră de sfârșit.' },
      { left: '`[^0-9]`', right: 'un caracter care nu este cifră', why: '`^` la începutul parantezelor nega mulțimea.' },
    ],
    distractors: [{ text: 'orice grup de caractere, ca în shell (`*.txt`)', why: 'Aceasta este semnificația `*` ca glob în shell, nu în regex.' }],
  },
  {
    id: 'L1.6-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Comanda de mai jos ar trebui să găsească liniile cu „ssh” sau „http”, dar nu găsește nimic, deși fișierul le conține. Care este cauza?',
    explanation: 'Fără `-E`, grep folosește BRE: `|` este un caracter obișnuit. Se folosește `grep -E` sau `\\|` (extensie GNU).',
    snippet: { kind: 'find-error', title: 'comandă tastată', code: "grep 'ssh|http' /etc/services" },
    options: [
      { id: 'a', text: 'În BRE (implicit), `|` este literal; trebuie `grep -E \'ssh|http\'` sau `\\|`.', correct: true, why: 'Tiparul caută literal șirul „ssh|http”. Cu `-E`, `|` devine „sau”.' },
      { id: 'b', text: '`/etc/services` nu poate fi citit de grep.', correct: false, why: 'grep citește orice fișier text pe care îl poți citi.' },
      { id: 'c', text: 'Apostrofurile nu sunt permise în tipar.', correct: false, why: 'Apostrofurile sunt recomandate; împiedică interpretarea tiparului de către shell.' },
      { id: 'd', text: 'Trebuia opțiunea `-v`.', correct: false, why: '`-v` ar inversa selecția; nu rezolvă problema.' },
    ],
  },
  {
    id: 'L1.6-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți spune ieșirea de mai jos despre a doua comandă?',
    explanation: 'Exit status 1 = nicio linie potrivită; nu este o eroare de execuție (aceea ar fi 2).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ grep root /etc/passwd > /dev/null; echo $?\n0\n[student@server1 ~]$ grep nuexista /etc/passwd; echo $?\n1' },
    options: [
      { id: 'a', text: 'Comanda a rulat corect, dar nicio linie nu conține „nuexista”.', correct: true, why: '1 este statusul „fără potriviri”; fișierul a fost citit fără probleme.' },
      { id: 'b', text: 'Fișierul `/etc/passwd` nu există.', correct: false, why: 'Pentru fișier inexistent, grep returnează 2 și afișează o eroare.' },
      { id: 'c', text: 'grep a fost oprit de un semnal.', correct: false, why: 'Un semnal ar da un cod de ieșire mare (peste 128).' },
      { id: 'd', text: 'Tiparul are o sintaxă invalidă.', correct: false, why: 'O sintaxă invalidă ar produce statusul 2 și un mesaj de eroare.' },
    ],
  },
  {
    id: 'L1.6-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei toate fișierele `.conf` din `/etc/ssh` care conțin „PermitRootLogin”, dar vrei doar numele fișierelor. Ce comandă alegi?',
    explanation: '`-r` caută recursiv, `-l` afișează doar numele, `--include` restrânge tipul, `2>/dev/null` ascunde erorile de permisiuni.',
    options: [
      { id: 'a', text: "`grep -rl --include='*.conf' PermitRootLogin /etc/ssh 2>/dev/null`", correct: true, why: 'Combină căutarea recursivă, doar numele fișierelor și restrângerea la `*.conf`.' },
      { id: 'b', text: "`grep -c PermitRootLogin /etc/ssh`", correct: false, why: '`-c` numără liniile și, fără `-r`, grep refuză directoarele.' },
      { id: 'c', text: "`grep -L PermitRootLogin /etc/ssh/*.conf`", correct: false, why: '`-L` listează fișierele care NU conțin tiparul.' },
      { id: 'd', text: "`grep -v PermitRootLogin /etc/ssh`", correct: false, why: 'Inversează selecția și nu este recursiv.' },
    ],
  },
];
