import type { Lab } from '../../lab/types';

export const LAB_L1_7: Lab = {
  id: 'lab-l1-7-linkuri',
  lessonId: 'L1.7',
  title: 'Hard și soft link-uri: creează, compară, rupe și repară',
  modes: ['guided', 'independent'],
  objectives: ['C1-9'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Ai un fișier de date și un director de lucru. Trebuie să oferi acces la ele sub alte nume și să înțelegi ce se întâmplă când originalul se șterge.',
    'Sarcini: în `~/lab17`, (1) creează `original.txt` cu un rând de text; (2) creează un hard link `hard.txt` și un symlink `soft.txt` către el; (3) arată prin comenzi că `original.txt` și `hard.txt` au același inode și contor 2; (4) adaugă o linie prin `hard.txt` și citește-o prin `soft.txt`; (5) șterge `original.txt` și constată ce funcționează și ce nu; (6) repară symlink-ul pentru a indica `hard.txt`; (7) creează `scurt` ca symlink către directorul `date` și un symlink cu cale absolută către `/etc/hostname`; (8) arată că un symlink relativ mutat în alt director se rupe.',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal în home, cu drept de scriere în `~`.',
    'Directorul `~/lab17` nu există încă.',
  ],
  finalState: [
    '`~/lab17` conține `hard.txt` (contor 1 după ștergerea originalului), `soft.txt` -> `hard.txt`, directorul `date`, symlink-ul `scurt` -> `date` și `nume-gazda` -> `/etc/hostname`.',
    '`original.txt` nu mai există.',
  ],
  criteria: [
    { id: 'ac1', text: 'Înainte de ștergere, `original.txt` și `hard.txt` aveau același inode și contorul 2.', manualCheck: 'ls -li ~/lab17' },
    { id: 'ac2', text: 'După ștergerea lui `original.txt`, `hard.txt` este citibil, iar `soft.txt` (încă spre original) era rupt.', manualCheck: 'cat ~/lab17/hard.txt; cat ~/lab17/soft.txt' },
    { id: 'ac3', text: '`soft.txt` indică acum `hard.txt` și poate fi citit.', manualCheck: 'readlink ~/lab17/soft.txt; cat ~/lab17/soft.txt' },
    { id: 'ac4', text: '`scurt` este symlink către directorul `date`, iar `nume-gazda` indică `/etc/hostname`.', manualCheck: 'ls -l ~/lab17' },
    { id: 'ac5', text: 'Poți explica de ce symlink-ul relativ mutat în alt director este rupt.', manualCheck: 'readlink ~/lab17/b/legatura; ls -l ~/lab17/b' },
  ],
  steps: [
    {
      title: 'Fișierul de bază și cele două tipuri de link',
      purpose: 'Creezi un hard link și un symlink către același fișier.',
      hint: 'Ordinea este mereu `ln [-s] ȚINTĂ NUME_LINK`.',
      commands: 'mkdir -p ~/lab17 && cd ~/lab17\necho "date importante" > original.txt\nln original.txt hard.txt\nln -s original.txt soft.txt\nls -li',
      explain: [
        ['ln original.txt hard.txt', 'hard link: încă un nume pentru același inode.'],
        ['ln -s original.txt soft.txt', 'symlink: fișier nou cu calea „original.txt” înăuntru.'],
        ['ls -li', '-l format lung; -i prima coloană = număr inode.'],
      ],
      output: {
        label: 'illustrative',
        code: '524301 -rw-r--r--. 2 student student 16 Jan  1 10:00 hard.txt\n524301 -rw-r--r--. 2 student student 16 Jan  1 10:00 original.txt\n524305 lrwxrwxrwx. 1 student student 12 Jan  1 10:00 soft.txt -> original.txt',
        explain: 'Primele două au același inode și contor 2; `soft.txt` are inode propriu, tip `l` și săgeata spre țintă. Numerele diferă pe sistemul tău.',
      },
      reflect: 'De ce are `soft.txt` dimensiunea 12 și nu 16?',
    },
    {
      title: 'Modificare și acces prin celelalte nume',
      purpose: 'Vezi că hard și soft link-urile arată același conținut.',
      hint: '`>>` adaugă o linie; verifică prin fiecare nume.',
      commands: 'echo "linie noua" >> hard.txt\ncat original.txt\ncat soft.txt\nstat original.txt',
      explain: [
        ['>> hard.txt', 'modifică inode-ul comun.'],
        ['cat soft.txt', 'urmează calea memorată și citește `original.txt`.'],
        ['stat', 'afișează inode, `Links:` (contor), permisiuni și timpi.'],
      ],
      output: {
        label: 'illustrative',
        code: 'date importante\nlinie noua\ndate importante\nlinie noua\n  File: original.txt\n  Size: 28   Blocks: 8   IO Block: 4096   regular file\nInode: 524301   Links: 2',
        explain: 'Ambele nume arată cele două linii. `Links: 2` confirmă două nume pentru inode. Valorile exacte diferă.',
      },
    },
    {
      title: 'Șterge originalul',
      purpose: 'Observi diferența: hard link-ul supraviețuiește, symlink-ul se rupe.',
      hint: 'Verifică după `rm` cu `cat` pe fiecare nume și cu `ls -l`.',
      commands: 'rm original.txt\ncat hard.txt\ncat soft.txt\nls -l\nfind . -xtype l\nls -li hard.txt',
      explain: [
        ['rm original.txt', 'șterge numele; contorul scade la 1.'],
        ['cat soft.txt', 'eșuează: calea „original.txt” nu mai există.'],
        ['find . -xtype l', 'listează symlink-urile rupte din directorul curent.'],
      ],
      output: {
        label: 'illustrative',
        code: 'date importante\nlinie noua\ncat: soft.txt: No such file or directory\n./soft.txt\n524301 -rw-r--r--. 1 student student 28 Jan  1 10:02 hard.txt',
        explain: 'Hard link-ul conține în continuare datele, iar contorul este 1. `soft.txt` este rupt și apare în lista `find -xtype l`.',
      },
    },
    {
      title: 'Repară symlink-ul',
      purpose: 'Înlocuiești link-ul rupt cu unul valid.',
      hint: '`-f` înlocuiește un link existent cu același nume.',
      commands: 'ln -sf hard.txt soft.txt\nreadlink soft.txt\ncat soft.txt',
      explain: [
        ['ln -sf hard.txt soft.txt', '-s symlink; -f șterge `soft.txt` existent înainte de a-l recrea.'],
        ['readlink soft.txt', 'afișează calea memorată: `hard.txt`.'],
      ],
      output: {
        label: 'illustrative',
        code: 'hard.txt\ndate importante\nlinie noua',
        explain: 'Link-ul indică acum un fișier care există.',
      },
    },
    {
      title: 'Symlink către director și cu cale absolută',
      purpose: 'Folosești symlink-uri acolo unde hard link-urile nu merg.',
      hint: 'Un hard link către director nu este permis; pentru director folosește întotdeauna `-s`.',
      commands: 'mkdir date\nln -s date scurt\nln -s /etc/hostname nume-gazda\nls -l scurt nume-gazda\nreadlink -f nume-gazda',
      explain: [
        ['ln -s date scurt', 'symlink către director.'],
        ['ln -s /etc/hostname nume-gazda', 'cale absolută: funcționează indiferent de directorul curent.'],
        ['readlink -f', 'calea canonică finală, cu toate link-urile rezolvate.'],
      ],
      output: {
        label: 'illustrative',
        code: 'lrwxrwxrwx. 1 student student 13 Jan  1 10:03 nume-gazda -> /etc/hostname\nlrwxrwxrwx. 1 student student  4 Jan  1 10:03 scurt -> date\n/etc/hostname',
        explain: '`readlink -f` returnează calea reală (aici, dacă `/etc/hostname` nu este el însuși un link). Dacă `/etc/hostname` nu există pe sistemul tău, link-ul ar fi rupt.',
      },
    },
    {
      title: 'Capcana căii relative',
      purpose: 'Arăți de ce un symlink relativ se rupe când este mutat.',
      hint: 'Calea relativă dintr-un symlink se rezolvă față de directorul link-ului.',
      commands: 'mkdir a b\necho x > a/fisier\nln -s fisier a/legatura\ncat a/legatura\nmv a/legatura b/\ncat b/legatura\nreadlink b/legatura',
      explain: [
        ['ln -s fisier a/legatura', 'link-ul stă în `a/`, iar „fisier” este relativ la `a/`.'],
        ['mv a/legatura b/', 'mută link-ul; calea memorată este tot „fisier”.'],
        ['cat b/legatura', 'caută `b/fisier`, care nu există.'],
      ],
      output: {
        label: 'illustrative',
        code: 'x\ncat: b/legatura: No such file or directory\nfisier',
        explain: 'Primul `cat` merge; după mutare apare eroarea, iar `readlink` arată că link-ul memorează în continuare „fisier”.',
      },
      reflect: 'Cum ai crea link-ul ca să rămână valid după mutare?',
    },
  ],
  verification: [
    { cmd: 'ls -li ~/lab17/hard.txt', expected: 'contorul `1` (după ștergerea originalului).' },
    { cmd: 'readlink ~/lab17/soft.txt', expected: '`hard.txt`.' },
    { cmd: 'cat ~/lab17/soft.txt', expected: 'cele două linii de text.' },
    { cmd: 'ls -l ~/lab17/scurt', expected: 'tip `l`, `scurt -> date`.' },
    { cmd: 'find ~/lab17 -xtype l', expected: 'doar `~/lab17/b/legatura` (rupt intenționat).' },
  ],
  persistence: [
    'Link-urile sunt intrări în sistemul de fișiere din home: persistă după reboot.',
    'Symlink-urile către `/etc/hostname` depind de existența țintei; aceasta există și după reboot.',
    'Confirmare manuală: după repornire, `ls -l ~/lab17` și `readlink -f ~/lab17/nume-gazda`.',
  ],
  mistakes: [
    'Inversarea argumentelor `ln -s` (creezi un link cu numele țintei).',
    'Cale relativă greșită față de directorul link-ului.',
    'A crede că hard link-ul este o copie independentă.',
    'Hard link către director sau între sisteme de fișiere.',
  ],
  troubleshooting: [
    { symptom: '`ln: failed to create symbolic link ...: File exists`', cause: 'numele există deja', fix: 'alege alt nume sau folosește `-f` conștient' },
    { symptom: '`soft.txt` rupt imediat după creare', cause: 'calea relativă nu corespunde directorului link-ului', fix: 'recreează cu calea corectă sau cu cale absolută' },
    { symptom: '`Invalid cross-device link`', cause: 'hard link între sisteme de fișiere', fix: 'folosește `ln -s`' },
    { symptom: 'contorul nu este 2', cause: 'ai folosit `ln -s` în loc de `ln`', fix: 'recreează hard link-ul fără `-s`' },
  ],
  alternatives: [
    'Symlink cu cale absolută: `ln -s "$PWD/hard.txt" soft.txt`.',
    'Hard link prin `cp -l original.txt hard.txt`.',
    'Pentru a înlocui un symlink către director fără a-l urmări: `ln -sfn`.',
  ],
};
