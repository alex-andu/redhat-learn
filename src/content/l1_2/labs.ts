import type { Lab } from '../../lab/types';

export const LAB_L1_2: Lab = {
  id: 'lab-l1-2-documentatie',
  lessonId: 'L1.2',
  title: 'Răspunsuri din documentația locală: man, info și /usr/share/doc',
  modes: ['guided', 'independent'],
  objectives: ['C1-11'],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Lucrezi pe un server RHEL 10 fără acces la internet. Ți se cere să afli patru informații folosind exclusiv documentația locală, și să notezi comanda prin care ai găsit fiecare răspuns.',
    '(1) Ce pagină man descrie formatul fișierului `/etc/fstab` și în ce secțiune este? (2) Ce opțiune a lui `ls` sortează după timpul modificării? (3) Cum găsești o comandă care „raportează utilizarea spațiului pe disc”, fără să-i cunoști numele? (4) Ce fișiere de documentație livrează pachetul `bash` și unde sunt?',
  ],
  initialConditions: [
    'Utilizator obișnuit, cu terminal deschis, pe un sistem RHEL 10 sau compatibil, cu paginile man instalate.',
    'Nu este nevoie de acces la internet; nu se folosește un browser.',
  ],
  finalState: [
    'Ai notat într-un fișier `~/lab12-raspunsuri.txt` cele patru răspunsuri (comanda folosită + rezultatul).',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai deschis pagina fstab(5) și ai identificat secțiunea (5).', manualCheck: 'man -w fstab; man -f fstab' },
    { id: 'ac2', text: 'Ai găsit în `man ls` opțiunea de sortare după timp și ai explicat și `-r` (inversare).', manualCheck: 'man ls   # /sort by time' },
    { id: 'ac3', text: 'Ai folosit `man -k` pentru a găsi `df` și `du` pornind de la descriere.', manualCheck: 'man -k "disk space"' },
    { id: 'ac4', text: 'Ai listat fișierele de documentație ale pachetului `bash`.', manualCheck: 'rpm -qd bash' },
    { id: 'ac5', text: 'Fișierul `~/lab12-raspunsuri.txt` există și conține patru răspunsuri.', manualCheck: 'wc -l ~/lab12-raspunsuri.txt' },
  ],
  steps: [
    {
      title: 'Format de fișier: secțiunea 5',
      purpose: 'Un fișier de configurare se documentează în secțiunea 5, nu în 1.',
      hint: 'Folosește `man -f` ca să vezi în ce secțiuni există numele `fstab`.',
      commands: 'man -f fstab\nman -w 5 fstab\nman 5 fstab',
      explain: [
        ['man -f fstab', 'listează descrierea paginilor numite exact fstab, cu secțiunea lor.'],
        ['man -w 5 fstab', '-w afișează calea fișierului paginii din secțiunea 5.'],
        ['man 5 fstab', 'deschide pagina; ieși cu q.'],
      ],
      output: {
        label: 'illustrative',
        code: 'fstab (5)            - static information about the filesystems',
        explain: 'Formularea descrierii poate diferi pe sistemul tău; importantă este secțiunea (5).',
      },
      reflect: 'De ce `man fstab` fără secțiune ar putea fi suficient aici, dar nu este o strategie sigură pentru `passwd`?',
    },
    {
      title: 'Caută în interiorul paginii',
      purpose: 'Găsește rapid o opțiune într-o pagină lungă, fără să citești tot.',
      hint: 'În `less`, `/` începe căutarea; `n` sare la următorul rezultat.',
      commands: 'man ls\n# în pager: tastează  /sort  Enter, apoi n până găsești „-t”\n# ieși cu q',
      explain: [
        ['/sort', 'caută textul „sort” înainte, în pager.'],
        ['n / N', 'următorul / precedentul rezultat.'],
        ['-t', 'în paginile GNU ls, `-t` = sort by time, newest first (verifică formularea din pagina ta).'],
        ['-r', 'reverse order while sorting; combinat: `ls -ltr` = cele mai vechi primele.'],
      ],
      reflect: 'Ce afișează `ls -lt` față de `ls -ltr` — care fișier apare ultimul în fiecare caz?',
    },
    {
      title: 'Nu știi numele comenzii: apropos',
      purpose: 'Pornești de la funcție și afli comanda.',
      hint: 'Citează fraza cu ghilimele. Dacă primești „nothing appropriate”, vezi troubleshooting-ul.',
      commands: 'man -k "disk space"\nman -k "disk usage"\napropos -s 1 "file space"',
      explain: [
        ['man -k "disk space"', 'caută cuvintele în descrierile paginilor; arată linii de forma `nume (secțiune) - descriere`.'],
        ['apropos -s 1 "file space"', 'același lucru, limitat la secțiunea 1.'],
      ],
      output: {
        label: 'illustrative',
        code: 'df (1)               - report file system disk space usage\ndu (1)               - estimate file space usage',
        explain: 'Dacă lista ta este mai lungă, caută liniile în care descrierea se potrivește cu ce voiai. Apoi deschide pagina: `man df`.',
      },
    },
    {
      title: 'Documentația pachetului: rpm și /usr/share/doc',
      purpose: 'Vezi ce fișiere de documentație a livrat pachetul și unde sunt.',
      hint: '`rpm -qd` = query + docfiles.',
      commands: 'rpm -q bash\nrpm -qd bash\nls /usr/share/doc | head',
      explain: [
        ['rpm -q bash', 'confirmă că pachetul bash este instalat și arată versiunea.'],
        ['rpm -qd bash', 'listează fișierele de documentație (pagini man, info, README etc.) ale pachetului.'],
        ['ls /usr/share/doc | head', 'primele intrări din directorul de documentație; `|` trimite lista către `head` (L1.5).'],
      ],
      output: {
        label: 'illustrative',
        code: 'bash-5.x.y-z.el10.x86_64\n/usr/share/doc/bash/...\n/usr/share/info/bash.info.gz\n/usr/share/man/man1/bash.1.gz',
        explain: 'Numărul versiunii și lista exactă diferă pe sistemul tău. Observă că, pentru bash, documentația include și pagini man și info.',
      },
    },
    {
      title: 'Notează răspunsurile',
      purpose: 'Consemnezi, într-un fișier, comanda și rezultatul fiecărei căutări.',
      hint: 'Folosește `>` pentru primul rând și `>>` pentru restul (vei învăța detaliat în L1.5).',
      commands: 'echo "1) man 5 fstab - format fstab (sectiunea 5)" > ~/lab12-raspunsuri.txt\necho "2) ls -t sorteaza dupa timp; -r inverseaza" >> ~/lab12-raspunsuri.txt\necho "3) man -k \\"disk space\\" -> df, du" >> ~/lab12-raspunsuri.txt\necho "4) rpm -qd bash" >> ~/lab12-raspunsuri.txt\nwc -l ~/lab12-raspunsuri.txt',
      explain: [
        ['>', 'creează/suprascrie fișierul cu ieșirea comenzii.'],
        ['>>', 'adaugă la sfârșitul fișierului.'],
        ['wc -l', '-l (--lines): numără liniile; trebuie să arate 4.'],
      ],
      output: {
        label: 'illustrative',
        code: '4 /home/student/lab12-raspunsuri.txt',
        explain: 'Calea conține numele tău de utilizator.',
      },
    },
  ],
  verification: [
    { cmd: 'man -w 5 fstab', expected: 'afișează calea unui fișier de pagină (de obicei sub /usr/share/man/man5/).' },
    { cmd: 'wc -l ~/lab12-raspunsuri.txt', expected: 'afișează 4.' },
    { cmd: 'rpm -qd bash | head -3', expected: 'listează fișiere de documentație ale pachetului bash.' },
  ],
  persistence: [
    'Fișierul `~/lab12-raspunsuri.txt` persistă după reboot (este pe disc, în home).',
    'Documentația nu are configurare persistentă; dacă ai rulat `sudo mandb`, indexul actualizat persistă.',
  ],
  mistakes: [
    'Citirea secțiunii greșite (`man passwd` în loc de `man 5 passwd`).',
    'Ghilimele lipsă la `man -k` cu mai multe cuvinte.',
    'Căutarea unei pagini man pentru un builtin (`man cd`): folosește `help cd` sau `man bash`.',
  ],
  troubleshooting: [
    { symptom: '`nothing appropriate` la `man -k`', cause: 'indexul man nu e construit sau termenul nu apare în descrieri', fix: '`sudo mandb`; încearcă un sinonim (`space` vs `usage`)' },
    { symptom: '`No manual entry for fstab`', cause: 'pachetul cu pagini man lipsește', fix: 'verifică `rpm -q man-pages man-db`; instalează dacă ai drept (C2)' },
    { symptom: 'pagina se încarcă dar nu poți ieși', cause: 'ești în pager', fix: 'apasă `q`' },
  ],
  alternatives: [
    'În locul lui `man -k` poți folosi `apropos` (echivalent).',
    'Informația despre `-t` poate fi obținută și cu `ls --help | grep -i time` (grep: L1.6) sau din `info coreutils \'ls invocation\'`.',
    'Răspunsul 4 se poate afla și cu `rpm -ql bash | grep doc`; `rpm -qd` este mai direct.',
  ],
};
