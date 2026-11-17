import type { Lab } from '../../lab/types';

export const LAB_M0_4A: Lab = {
  id: 'lab-m0-4a-harta-sistemului-de-fisiere',
  lessonId: 'M0.4',
  title: 'Harta sistemului de fișiere: explorare și răspunsuri din sistem',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 1,
  estimatedMinutes: 40,
  scenario: [
    'Ai primit un server RHEL 10 nou și șeful îți cere o „hartă” scurtă: ce este montat unde, pe ce sistem de fișiere, cât spațiu este liber, ce este real pe disc și ce este generat de nucleu, și unde sunt cele mai importante configurări.',
    'Sarcină: folosind doar comenzi de citire, răspunde (pe hârtie sau într-un fișier al tău) la: (1) ce sunt `/bin`, `/sbin`, `/lib`, `/lib64`; (2) ce sistem de fișiere și ce dispozitiv conține `/`; (3) este `/boot` separat; (4) care sunt directoarele care nu sunt pe disc; (5) ce sunt `/dev/null`, `/dev/zero` și un disc din `/dev`; (6) unde se află fișierul de configurare al serviciului SSH și ce pachet îl deține; (7) cât ocupă `/etc` și `/var/log`; (8) ce este `/tmp` pe acest sistem.',
    'Toate comenzile doar citesc. Nu se modifică nimic.',
  ],
  initialConditions: [
    'Ești utilizator obișnuit pe un sistem RHEL 10 sau compatibil. Nu ai nevoie de root (unele directoare vor da „Permission denied”: este normal).',
    'Pachetul openssh-server este de regulă instalat; dacă nu este, folosește pentru pasul 6 alt fișier din /etc (de exemplu /etc/hosts).',
  ],
  finalState: [
    'Ai un set de răspunsuri notate de tine, fiecare susținut de o comandă pe care ai rulat-o.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți spune ce sunt `/bin`, `/sbin`, `/lib` și `/lib64` pe sistemul tău (legături sau directoare) și către ce duc.', manualCheck: 'ls -ld /bin /sbin /lib /lib64; readlink -f /bin' },
    { id: 'ac2', text: 'Poți spune dispozitivul și tipul sistemului de fișiere pentru `/` și dacă `/boot` este montat separat.', manualCheck: 'findmnt / ; findmnt /boot; df -hT / /boot' },
    { id: 'ac3', text: 'Poți enumera cel puțin trei directoare care nu sunt pe disc și poți demonstra asta cu o comandă.', manualCheck: 'findmnt -t proc,sysfs,devtmpfs,tmpfs' },
    { id: 'ac4', text: 'Ai identificat tipul fișierelor `/dev/null` și al unui disc din `/dev` (caracter vs bloc).', manualCheck: 'ls -l /dev/null; lsblk; ls -l /dev/vda /dev/sda /dev/nvme0n1 2>/dev/null' },
    { id: 'ac5', text: 'Ai găsit fișierul de configurare SSH și pachetul care îl deține.', manualCheck: 'rpm -qf /etc/ssh/sshd_config' },
    { id: 'ac6', text: 'Ai aflat dimensiunile `/etc` și `/var/log` și ce este `/tmp` (tmpfs sau director pe disc).', manualCheck: 'du -sh /etc; du -sh /var/log; findmnt /tmp' },
  ],
  steps: [
    {
      title: 'Rădăcina și legăturile ei',
      purpose: 'Vezi ce din rădăcină sunt directoare reale și ce sunt legături către /usr.',
      hint: '`ls -ld` pe legături arată legătura, nu conținutul directorului țintă. `l` la început = legătură.',
      commands: 'ls -l /\nls -ld /bin /sbin /lib /lib64 /usr/sbin\nreadlink -f /bin\nreadlink -f /sbin',
      explain: [
        ['ls -l /', 'formatul lung al directoarelor de top; legăturile arată „nume -> țintă”.'],
        ['ls -ld …', '-d: listează directoarele (sau legăturile) ca atare.'],
        ['readlink -f', 'urmărește toate legăturile și afișează calea reală finală.'],
      ],
      output: {
        label: 'illustrative',
        code: 'lrwxrwxrwx. 1 root root 7 Jan 10 09:00 /bin -> usr/bin\nlrwxrwxrwx. 1 root root 8 Jan 10 09:00 /sbin -> usr/sbin\nlrwxrwxrwx. 1 root root 7 Jan 10 09:00 /lib -> usr/lib\nlrwxrwxrwx. 1 root root 9 Jan 10 09:00 /lib64 -> usr/lib64\ndr-xr-xr-x. 2 root root 4096 Jan 10 09:00 /usr/sbin\n/usr/bin\n/usr/sbin',
        explain: 'Dacă la tine /usr/sbin este tot o legătură sau directorul diferă, notează ce vezi: este chiar răspunsul la întrebarea (1). Valorile sunt exemplificative.',
      },
      reflect: 'De ce ar păstra distribuțiile căile /bin și /sbin ca legături, în loc să le șteargă?',
    },
    {
      title: 'Ce este montat și pe ce',
      purpose: 'Află sistemul de fișiere al rădăcinii și dacă /boot este separat.',
      hint: '`findmnt` fără argumente arată tot arborele de montări; `df -hT` adaugă și spațiul.',
      commands: 'findmnt /\nfindmnt /boot\ndf -hT / /boot\nlsblk -f',
      explain: [
        ['findmnt /', 'arată montarea care conține calea (sursa, tipul, opțiunile).'],
        ['df -hT', 'spațiu și tip; -T adaugă tipul sistemului de fișiere.'],
        ['lsblk -f', 'discuri, partiții, volume logice, cu tipul sistemului de fișiere, eticheta și UUID.'],
      ],
      output: {
        label: 'illustrative',
        code: 'TARGET SOURCE                FSTYPE OPTIONS\n/      /dev/mapper/rhel-root xfs    rw,relatime,seclabel,...\nTARGET SOURCE    FSTYPE OPTIONS\n/boot  /dev/vda1 xfs    rw,relatime,seclabel,...\nFilesystem            Type Size Used Avail Use% Mounted on\n/dev/mapper/rhel-root xfs   17G 4.2G  13G  25% /\n/dev/vda1             xfs  960M 295M 666M  31% /boot',
        explain: 'Pe sistemul tău, dispozitivele, tipurile și dimensiunile pot diferi. Dacă findmnt /boot nu afișează nimic, /boot nu este montat separat și face parte din /. XFS este implicit pe RHEL; ext4 și altele sunt posibile.',
      },
      reflect: 'De ce ar fi util ca /var să fie pe un volum separat?',
    },
    {
      title: 'Ce nu este pe disc',
      purpose: 'Identifici pseudo-sistemele de fișiere și vezi că „fișierele” din ele sunt generate.',
      hint: '`cat` pe un fișier din /proc arată informații live; dimensiunea afișată de `ls -l` este 0.',
      commands: 'findmnt -t proc,sysfs,devtmpfs,tmpfs\ncat /proc/uptime\nhead -3 /proc/meminfo\nls /sys/class/net\nls -l /proc/uptime',
      explain: [
        ['findmnt -t …', '-t filtrează după tipul sistemului de fișiere.'],
        ['cat /proc/uptime', 'două numere: secunde de la boot și secunde de inactivitate; se schimbă la fiecare citire.'],
        ['head -3 /proc/meminfo', 'primele trei linii: MemTotal, MemFree, MemAvailable.'],
        ['ls /sys/class/net', 'interfețele de rețea cunoscute de nucleu.'],
      ],
      output: {
        label: 'illustrative',
        code: 'TARGET     SOURCE   FSTYPE   OPTIONS\n/proc      proc     proc     rw,nosuid,nodev,noexec,relatime\n/sys       sysfs    sysfs    rw,nosuid,nodev,noexec,relatime,seclabel\n/dev       devtmpfs devtmpfs rw,nosuid,seclabel,size=4096k,...\n/run       tmpfs    tmpfs    rw,nosuid,nodev,seclabel,size=...\n12345.67 23456.78\nMemTotal:        4012345 kB\nMemFree:         2987654 kB\nMemAvailable:    3456789 kB\nens3  lo\n-r--r--r--. 1 root root 0 Nov 17 10:30 /proc/uptime',
        explain: 'Dimensiunea 0 și faptul că valorile se schimbă dovedesc că fișierul este generat de nucleu la citire. Numerele din /proc/uptime și /proc/meminfo, ca și numele interfeței (ens3, eth0…), sunt exemplificative.',
      },
    },
    {
      title: 'Fișiere de dispozitiv și discuri',
      purpose: 'Deosebești fișierele de dispozitiv „caracter” de cele „bloc”.',
      hint: 'Primul caracter din `ls -l`: c = caracter, b = bloc. Discul poate avea alt nume (sda, vda, nvme0n1).',
      commands: 'ls -l /dev/null /dev/zero /dev/tty\nlsblk\nls -l /dev/vda /dev/sda /dev/nvme0n1 2>/dev/null\nfile /dev/null',
      explain: [
        ['ls -l /dev/null …', 'c = dispozitiv caracter; în locul dimensiunii vezi „major, minor”.'],
        ['lsblk', 'arborele discurilor, partițiilor și volumelor.'],
        ['2>/dev/null', 'ascunde erorile pentru discurile inexistente.'],
        ['file /dev/null', 'recunoaște tipul fișierului: „character special”.'],
      ],
      output: {
        label: 'illustrative',
        code: 'crw-rw-rw-. 1 root root 1, 3 Nov 17 08:01 /dev/null\ncrw-rw-rw-. 1 root root 1, 5 Nov 17 08:01 /dev/zero\ncrw-rw-rw-. 1 root tty  5, 0 Nov 17 08:20 /dev/tty\nbrw-rw----. 1 root disk 252, 0 Nov 17 08:01 /dev/vda\n/dev/null: character special (1/3)',
        explain: 'c = caracter (flux de octeți); b = bloc (disc). Numerele „1, 3” sunt major/minor și diferă între sisteme. Numele discului depinde de tipul de virtualizare sau de controler.',
      },
      reflect: 'Ce se întâmplă cu textul trimis în /dev/null? Unde ai mai văzut-o folosită (2>/dev/null)?',
    },
    {
      title: 'Unde este configurarea și cine a pus-o acolo',
      purpose: 'Folosești baza de date RPM ca să legi un fișier de pachetul lui.',
      hint: '`rpm -qf` nu caută pe disc, ci în baza de date RPM; funcționează doar pentru fișiere livrate de pachete.',
      commands: 'ls /etc/ssh\nrpm -qf /etc/ssh/sshd_config\nrpm -ql openssh-server | head -10\ndu -sh /etc\ndu -sh /var/log\nfindmnt /tmp\ncat /usr/lib/tmpfiles.d/tmp.conf',
      explain: [
        ['rpm -qf FIȘIER', 'query file: ce pachet instalat deține acest fișier.'],
        ['rpm -ql PACHET', 'query list: toate fișierele pachetului; head -10 păstrează primele 10.'],
        ['du -sh', 'dimensiunea totală (-s) în unități citibile (-h). Pe /var/log pot apărea „Permission denied” la unele subdirectoare, ca utilizator obișnuit.'],
        ['findmnt /tmp', 'dacă afișează o linie cu tmpfs, /tmp este în RAM; dacă nu afișează nimic, este doar un director pe sistemul rădăcină.'],
        ['cat /usr/lib/tmpfiles.d/tmp.conf', 'regula systemd-tmpfiles de curățare a /tmp (fișierul exact poate diferi).'],
      ],
      output: {
        label: 'illustrative',
        code: 'openssh-server-9.9p1-1.el10.x86_64\n/etc/ssh/sshd_config\n/etc/ssh/sshd_config.d\n/usr/lib/systemd/system/sshd.service\n/usr/sbin/sshd\n32M\t/etc\n85M\t/var/log',
        explain: 'Numele și versiunea pachetului, ca și mărimile, sunt exemplificative. Observă că pachetul pune fișiere în mai multe locuri: configurare în /etc, unit systemd în /usr/lib/systemd/system, program în /usr/sbin.',
      },
      reflect: 'Dacă ștergi din greșeală /etc/ssh/sshd_config, cum afli ce pachet îți poate readuce un fișier implicit?',
    },
  ],
  verification: [
    { cmd: 'ls -ld /bin /lib64', expected: 'ambele încep cu `l` și afișează „-> usr/…” (dacă sistemul tău are usr merge).' },
    { cmd: 'findmnt /', expected: 'o linie cu dispozitivul și tipul sistemului de fișiere al rădăcinii.' },
    { cmd: 'rpm -qf /etc/ssh/sshd_config', expected: 'numele pachetului (de regulă openssh-server…); „is not owned by any package” dacă fișierul nu vine dintr-un pachet.' },
  ],
  persistence: [
    'Laboratorul nu creează și nu modifică nimic; nu există nimic de păstrat după reboot.',
    'Observație de reținut: ce vezi în /proc, /sys, /run și (posibil) /tmp nu persistă după reboot, spre deosebire de /etc și /var, care sunt pe disc.',
  ],
  mistakes: [
    'Interpretarea `ls /bin` ca listă a unui director distinct de `/usr/bin` (este aceeași listă, prin legătură).',
    'Căutarea fișierelor din /proc cu `ls -l` și concluzia că „au 0 octeți deci sunt goale”.',
    'Rularea `du` pe `/` fără `-x` și așteptarea mult: parcurge și pseudo-sistemele.',
    'Neobservarea diferenței dintre `/dev/sda` (disc) și `/dev/sda1` (partiție).',
  ],
  troubleshooting: [
    { symptom: '`rpm -qf` răspunde „is not owned by any package”', cause: 'fișierul a fost creat de utilizator/serviciu sau pachetul nu este instalat', fix: 'verifică calea; încearcă `rpm -qf $(readlink -f CALE)` dacă este o legătură' },
    { symptom: '`findmnt /boot` nu afișează nimic', cause: '/boot nu este montat separat', fix: 'normal: /boot este un director în sistemul rădăcină' },
    { symptom: '`du` afișează „Permission denied”', cause: 'nu ai dreptul de citire în unele directoare', fix: 'normal ca utilizator obișnuit; cu sudo (dacă ai) vezi totalul real' },
    { symptom: 'nu există `/dev/vda`', cause: 'discul are alt nume (sda, nvme0n1, xvda)', fix: 'folosește `lsblk` ca să vezi numele real' },
  ],
  alternatives: [
    '`mount | column -t` (mai lung) arată aceleași montări ca `findmnt`.',
    '`man hier` afișează descrierea oficială a ierarhiei și poate fi comparată cu ce vezi.',
    '`tree -L 1 /` (dacă pachetul tree este instalat) desenează arborele; nu este instalat implicit.',
  ],
};

export const LAB_M0_4B: Lab = {
  id: 'lab-m0-4b-cai-absolute-relative-mini-arbore',
  lessonId: 'M0.4',
  title: 'Căi absolute și relative: un mini-arbore în home și greșelile tipice',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 1,
  estimatedMinutes: 35,
  scenario: [
    'Primești un mic proiect de organizat în directorul tău personal, folosind atât căi absolute, cât și relative, fără să ieși din home. Vrei să arăți că înțelegi diferența și că poți evita greșelile clasice (director curent greșit, nume cu spațiu, fișiere ascunse).',
    'Sarcină: (1) creează arborele `~/m04/firma/{contabilitate,it,hr}` și fișierele `it/inventar.txt`, `hr/angajati.txt`, `.ascuns` în `firma`; (2) din `~/m04/firma/it` copiază `inventar.txt` în `hr` folosind NUMAI cale relativă, apoi în `contabilitate` folosind NUMAI cale absolută; (3) redenumește `hr` în `resurse-umane`; (4) arată că `ls` nu afișează `.ascuns` fără opțiune; (5) arată că aceeași comandă relativă are rezultate diferite în directoare diferite; (6) curăță tot, cu atenție, fără să atingi nimic în afara `~/m04`.',
  ],
  initialConditions: [
    'Ești utilizator obișnuit cu drept de scriere în home. Directorul `~/m04` nu există încă (dacă există, folosește alt nume).',
  ],
  finalState: [
    'După pasul 5 există `~/m04/firma/{contabilitate,it,resurse-umane}`, cu `inventar.txt` copiat în `contabilitate` și `resurse-umane`.',
    'După pasul 6 directorul `~/m04` nu mai există.',
  ],
  criteria: [
    { id: 'bc1', text: 'Arborele `~/m04/firma` există cu trei subdirectoare și fișierul ascuns `.ascuns`.', manualCheck: 'ls -a ~/m04/firma; ls ~/m04/firma' },
    { id: 'bc2', text: '`inventar.txt` este prezent în `contabilitate` și în `resurse-umane`, iar `hr` nu mai există.', manualCheck: 'ls ~/m04/firma/contabilitate ~/m04/firma/resurse-umane; ls -d ~/m04/firma/hr' },
    { id: 'bc3', text: '`ls` fără opțiuni nu afișează `.ascuns`; `ls -a` îl afișează.', manualCheck: 'ls ~/m04/firma; ls -a ~/m04/firma' },
    { id: 'bc4', text: 'Poți explica rezultatul lui `cd ..; pwd` și al lui `ls ../..` din două directoare diferite.', manualCheck: 'cd ~/m04/firma/it; pwd; ls ..; cd ~/m04; ls ..' },
    { id: 'bc5', text: 'După curățare, `~/m04` nu mai există și celelalte fișiere din home sunt intacte.', manualCheck: 'ls -d ~/m04; ls ~' },
  ],
  steps: [
    {
      title: 'Crearea arborelui',
      purpose: 'Creezi directoare dintr-o singură comandă și fișiere cu căi relative.',
      hint: 'Acoladele generează trei căi; `-p` creează părinții.',
      commands: 'mkdir -p ~/m04/firma/{contabilitate,it,hr}\ncd ~/m04/firma\ntouch it/inventar.txt hr/angajati.txt .ascuns\nls\nls -a\nls -R',
      explain: [
        ['mkdir -p ~/m04/firma/{contabilitate,it,hr}', 'acoladele se expandează în trei căi; -p creează și ~/m04 și ~/m04/firma.'],
        ['cd ~/m04/firma', 'cale absolută (prin ~).'],
        ['touch it/inventar.txt hr/angajati.txt .ascuns', 'căi relative la directorul curent; touch creează fișiere goale.'],
        ['ls / ls -a / ls -R', 'fără opțiuni nu apare .ascuns; -a îl arată (împreună cu . și ..); -R coboară în subdirectoare.'],
      ],
      output: {
        label: 'illustrative',
        code: 'contabilitate  hr  it\n.  ..  contabilitate  .ascuns  hr  it\n.:\ncontabilitate  hr  it\n\n./contabilitate:\n\n./hr:\nangajati.txt\n\n./it:\ninventar.txt',
        explain: 'Primele linii sunt de la `ls`, apoi `ls -a`, apoi `ls -R`. Directorul contabilitate este gol.',
      },
      reflect: 'Ce ar crea `mkdir ~/m04/firma/{contabilitate, it, hr}` (cu spații după virgule)?',
    },
    {
      title: 'Copiere cu cale relativă și cu cale absolută',
      purpose: 'Același rezultat, cu două feluri de a scrie calea; vezi când fiecare este mai potrivit.',
      hint: 'Din `it`, `..` este `firma`. Calea absolută începe cu `/` (sau `~`).',
      commands: 'cd ~/m04/firma/it\npwd\ncp inventar.txt ../hr/\ncp inventar.txt ~/m04/firma/contabilitate/\nls ../hr ../contabilitate',
      explain: [
        ['cd ~/m04/firma/it', 'mută directorul curent.'],
        ['cp inventar.txt ../hr/', 'sursa este relativă (fișierul din directorul curent); destinația ../hr/ este relativă: urcă la părinte, apoi intră în hr. Slash-ul final arată că hr este un director.'],
        ['cp … ~/m04/firma/contabilitate/', 'destinația ca cale absolută: funcționează din orice director.'],
        ['ls ../hr ../contabilitate', 'listează două directoare deodată; fiecare apare cu numele lui.'],
      ],
      output: {
        label: 'illustrative',
        code: '/home/student/m04/firma/it\n../contabilitate:\ninventar.txt\n\n../hr:\nangajati.txt  inventar.txt',
        explain: 'Cele două directoare sunt listate în ordine alfabetică. Calea din pwd depinde de utilizatorul tău.',
      },
    },
    {
      title: 'Redenumire și fișiere ascunse',
      purpose: 'Redenumești un director cu `mv` și verifici ce arată `ls`.',
      hint: '`mv` redenumește când sursa și destinația sunt în același director.',
      commands: 'cd ~/m04/firma\nmv hr resurse-umane\nls\nls -a\nls -d .[!.]*',
      explain: [
        ['mv hr resurse-umane', 'redenumește directorul; fără -r, fiindcă mv nu copiază.'],
        ['ls -a', 'afișează și fișierele ascunse.'],
        ['ls -d .[!.]*', 'tipar pentru nume care încep cu punct, dar nu sunt . sau ..; -d împiedică ls să listeze conținutul directoarelor găsite. Arată că un tipar de tip * nu cuprinde fișierele ascunse.'],
      ],
      output: {
        label: 'illustrative',
        code: 'contabilitate  it  resurse-umane\n.  ..  contabilitate  .ascuns  it  resurse-umane\n.ascuns',
        explain: 'hr a dispărut, resurse-umane a apărut. Fișierul .ascuns apare doar cu -a sau cu un tipar care începe cu punct.',
      },
      reflect: 'De ce `rm *` nu șterge fișierul `.ascuns`?',
    },
    {
      title: 'Aceeași comandă, alt director',
      purpose: 'Demonstrezi că o cale relativă depinde de directorul curent.',
      hint: 'Compară `ls ..` rulat din `it` cu `ls ..` rulat din `~/m04`.',
      commands: 'cd ~/m04/firma/it\npwd\nls ..\ncd ~/m04\npwd\nls ..\ncd -\npwd',
      explain: [
        ['ls ..', 'listează părintele directorului curent: din it → firma; din ~/m04 → home-ul tău.'],
        ['cd -', 'revine la directorul anterior; bash păstrează OLDPWD.'],
      ],
      output: {
        label: 'illustrative',
        code: '/home/student/m04/firma/it\ncontabilitate  it  resurse-umane\n/home/student/m04\nDesktop  Documents  m04\n/home/student/m04/firma/it',
        explain: 'Lista din al doilea ls va conține fișierele din home-ul tău, deci diferă de a mea.',
      },
      reflect: 'Ce rezultat ar fi dat `cp inventar.txt etc/` din directorul `it`? Unde ar fi ajuns copia?',
    },
    {
      title: 'Curățare sigură',
      purpose: 'Ștergi doar ce ai creat, verificând înainte de comanda distructivă.',
      hint: 'Rulează întâi `echo`/`ls` pe aceeași cale. Ieși din directorul pe care îl ștergi.',
      commands: 'cd ~\npwd\nls -R ~/m04\nrm -r ~/m04\nls -d ~/m04\nls ~',
      explain: [
        ['cd ~', 'părăsești directorul pe care urmează să-l ștergi.'],
        ['ls -R ~/m04', 'vezi exact ce se va șterge.'],
        ['rm -r ~/m04', '-r (--recursive) șterge directorul și tot ce conține; nu există coș. Calea cu ~ nu poate ieși din home dacă nu ai greșit-o.'],
        ['ls -d ~/m04', 'confirmă că nu mai există: „No such file or directory”.'],
      ],
      output: {
        label: 'illustrative',
        code: '/home/student\nls: cannot access \'/home/student/m04\': No such file or directory',
        explain: 'Mesajul de eroare este confirmarea succesului. Nu rula niciodată rm -r pe o cale compusă cu variabile neverificate (ex. rm -r $DIR/ când $DIR este gol).',
      },
    },
  ],
  verification: [
    { cmd: 'ls -a ~/m04/firma', expected: 'afișează `.ascuns` alături de cele trei directoare (înainte de curățare).' },
    { cmd: 'ls ~/m04/firma/resurse-umane', expected: '`angajati.txt` și `inventar.txt`.' },
    { cmd: 'ls -d ~/m04', expected: 'după curățare: `No such file or directory`.' },
  ],
  persistence: [
    'Directoarele și fișierele create sunt pe disc, în home: persistă după reboot până le ștergi (pasul 5).',
    'Directorul curent și `OLDPWD` sunt valabile doar în sesiunea de shell; dispar la închiderea terminalului.',
  ],
  mistakes: [
    'Spații în acolade: `{a, b}` nu se expandează ca grup.',
    'Cale relativă dintr-un director greșit (`cp x etc/` fără să fii în `/`).',
    'Ștergerea fără verificare cu `ls`/`echo` și fără să fii în directorul corect.',
    'Uitarea fișierelor ascunse la curățare sau la copiere cu `*`.',
  ],
  troubleshooting: [
    { symptom: '`cp: cannot create regular file ... No such file or directory`', cause: 'directorul destinație nu există sau calea relativă este greșită', fix: '`pwd`, `ls ..` și verifică spelarea; folosește Tab' },
    { symptom: '`mv` a creat un director în interiorul altuia în loc să redenumească', cause: 'destinația exista deja ca director', fix: '`mv` mută în interiorul directorului existent; folosește un nume nou' },
    { symptom: '`rm: cannot remove ... Is a directory`', cause: 'ai uitat -r', fix: '`rm -r` sau, pentru directoare goale, `rmdir`' },
  ],
  alternatives: [
    '`mkdir -p` poate fi înlocuit cu mai multe `mkdir` succesive.',
    'În loc de `rm -r`, `rmdir` șterge doar directoare goale (mai sigur): trebuie întâi `rm` pe fișiere.',
    '`cp -r` copiază directoare întregi; pentru fișierele ascunse folosește `cp -a` (L1.3).',
  ],
};
