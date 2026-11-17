import type { Lab } from '../../lab/types';

export const LAB_L1_8: Lab = {
  id: 'lab-l1-8-permisiuni',
  lessonId: 'L1.8',
  title: 'Permisiuni ugo/rwx: citește, setează, testează',
  modes: ['guided', 'independent'],
  objectives: ['C1-10'],
  difficulty: 2,
  estimatedMinutes: 45,
  scenario: [
    'Pregătești un spațiu de lucru pentru o echipă fictivă: un director cu un script, un fișier de date private și un fișier de citire pentru grup. Trebuie să setezi permisiunile exact, în ambele moduri (simbolic și octal), și să verifici efectul.',
    'Sarcini: în `~/lab18`, (1) creează `script.sh`, `privat.txt`, `grup.txt`, `public.txt` și directorul `echipa`; (2) setează `script.sh` la `rwxr-x---` cu mod simbolic; (3) setează `privat.txt` la `600`; (4) setează `grup.txt` la `664` și `public.txt` la `644`; (5) setează `echipa` la `770`; (6) arată că un director fără `x` blochează accesul; (7) schimbă `umask` la `027` în sesiune și arată permisiunile fișierelor noi; (8) dacă ai `sudo` și un al doilea grup existent, schimbă grupul lui `grup.txt` (opțional).',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal în home. Pentru pasul opțional ai nevoie de `sudo` și de un grup existent (de exemplu `wheel`).',
    'Directorul `~/lab18` nu există încă.',
  ],
  finalState: [
    '`script.sh` = 750, `privat.txt` = 600, `grup.txt` = 664, `public.txt` = 644, `echipa` = 770.',
    '`umask` revenit la valoarea inițială la sfârșit (sau terminalul închis).',
  ],
  criteria: [
    { id: 'ac1', text: '`script.sh` are exact `-rwxr-x---` (750).', manualCheck: "stat -c '%a %A' ~/lab18/script.sh" },
    { id: 'ac2', text: '`privat.txt` are 600.', manualCheck: "stat -c '%a' ~/lab18/privat.txt" },
    { id: 'ac3', text: '`grup.txt` are 664 și `public.txt` are 644.', manualCheck: "stat -c '%a %n' ~/lab18/grup.txt ~/lab18/public.txt" },
    { id: 'ac4', text: '`echipa` are 770 (drwxrwx---).', manualCheck: 'ls -ld ~/lab18/echipa' },
    { id: 'ac5', text: 'Cu `umask 027`, un fișier nou are 640 și un director nou are 750.', manualCheck: "stat -c '%a %n' ~/lab18/nou.txt ~/lab18/nou-dir" },
  ],
  steps: [
    {
      title: 'Pregătirea fișierelor',
      purpose: 'Creezi obiectele de lucru și vezi permisiunile implicite (influențate de umask).',
      hint: 'Notează `umask` înainte, ca să poți reveni la el.',
      commands: 'umask\nmkdir -p ~/lab18 && cd ~/lab18\ntouch script.sh privat.txt grup.txt public.txt\nmkdir echipa\nls -l',
      explain: [
        ['umask', 'afișează masca curentă (de ex. 0022 sau 0002).'],
        ['touch', 'creează fișiere goale (666 minus umask).'],
        ['mkdir echipa', 'creează directorul (777 minus umask).'],
      ],
      output: {
        label: 'illustrative',
        code: '0002\n-rw-rw-r--. 1 student student 0 Jan  1 10:00 grup.txt\n-rw-rw-r--. 1 student student 0 Jan  1 10:00 privat.txt\n-rw-rw-r--. 1 student student 0 Jan  1 10:00 public.txt\n-rw-rw-r--. 1 student student 0 Jan  1 10:00 script.sh\ndrwxrwxr-x. 2 student student 6 Jan  1 10:00 echipa',
        explain: 'Cu umask 0002 fișierele noi sunt 664 și directoarele 775. Cu 0022 ar fi 644 / 755. Valorile depind de sistemul tău.',
      },
      reflect: 'Ce permisiuni ar avea fișierele noi dacă umask ar fi 077?',
    },
    {
      title: 'Mod simbolic și mod octal',
      purpose: 'Setezi aceeași stare în două feluri și compari.',
      hint: 'În mod simbolic cu `=` stabilești exact; `u=rwx,g=rx,o=` golește others.',
      commands: "chmod u=rwx,g=rx,o= script.sh\nchmod 600 privat.txt\nchmod 664 grup.txt\nchmod 644 public.txt\nchmod 770 echipa\nstat -c '%a %A %n' script.sh privat.txt grup.txt public.txt echipa",
      explain: [
        ['u=rwx,g=rx,o=', 'proprietar rwx, grup r-x, ceilalți nimic = 750.'],
        ['chmod 600 / 664 / 644 / 770', 'valori octale (r=4, w=2, x=1 pe fiecare clasă).'],
        ['stat -c', 'afișează octal (%a), simbolic (%A) și nume (%n).'],
      ],
      output: {
        label: 'illustrative',
        code: '750 -rwxr-x--- script.sh\n600 -rw------- privat.txt\n664 -rw-rw-r-- grup.txt\n644 -rw-r--r-- public.txt\n770 drwxrwx--- echipa',
        explain: 'Fiecare linie afișează valoarea octală, forma simbolică și numele. Ordinea poate urma ordinea argumentelor.',
      },
    },
    {
      title: 'Test: execuție și director fără x',
      purpose: 'Vezi diferența dintre drept și efect.',
      hint: 'Un director fără `x` nu poate fi traversat, chiar dacă ai `r`. Redă `x` la final.',
      commands: "echo 'echo salut' > script.sh\n./script.sh\nchmod u-x script.sh\n./script.sh\nchmod u+x script.sh\nchmod u-x echipa\nls echipa\ncd echipa\nchmod u+x echipa",
      explain: [
        ['./script.sh', 'execută fișierul din directorul curent; are nevoie de x.'],
        ['chmod u-x script.sh', 'scoate execuția: execuția dă „Permission denied”.'],
        ['chmod u-x echipa', 'scoate x de pe director: nu mai poți face `cd` în el sau accesa fișiere după nume.'],
        ['chmod u+x echipa', 'restabilește dreptul (important: nu lăsa directorul blocat).'],
      ],
      output: {
        label: 'illustrative',
        code: 'salut\nbash: ./script.sh: Permission denied\nls: cannot open directory \'echipa\': Permission denied\nbash: cd: echipa: Permission denied',
        explain: 'Mesajele exacte pot diferi ușor; esențial este refuzul cauzat de lipsa lui `x`. Pe un director fără `x`, `ls` poate afișa uneori doar numele (cu `r`) dar fără detalii; aici proprietarul nu are nici `x`, deci accesul este refuzat.',
      },
    },
    {
      title: 'umask 027 în sesiune',
      purpose: 'Vezi cum umask hotărăște drepturile obiectelor noi.',
      hint: 'umask scade biții din 666 / 777. După test, revino la valoarea inițială.',
      commands: "umask 027\ntouch nou.txt && mkdir nou-dir\nstat -c '%a %n' nou.txt nou-dir\numask 0002",
      explain: [
        ['umask 027', 'elimină w pentru grup și toate drepturile pentru others.'],
        ['touch nou.txt && mkdir nou-dir', 'creează un fișier și un director sub noua mască.'],
        ['umask 0002', 'înlocuiește cu valoarea notată la pasul 1 (sau cea implicită a sistemului tău).'],
      ],
      output: {
        label: 'illustrative',
        code: '640 nou.txt\n750 nou-dir',
        explain: '666 − 027 = 640; 777 − 027 = 750. Setarea nu persistă după închiderea terminalului.',
      },
    },
    {
      title: '(Opțional) Grupul unui fișier',
      purpose: 'Schimbi grupul și observi efectul asupra clasei g.',
      hint: 'Folosește un grup existent (`getent group wheel`). Dacă nu ai sudo, sari peste pas.',
      commands: 'getent group wheel\nsudo chown :wheel grup.txt\nls -l grup.txt\nsudo chown student: grup.txt\nls -l grup.txt',
      explain: [
        ['getent group wheel', 'verifică existența grupului (în RHEL, wheel este grupul administratorilor).'],
        ['sudo chown :wheel grup.txt', 'schimbă doar grupul fișierului.'],
        ['sudo chown student: grup.txt', 'readuce grupul la grupul principal al lui `student` (înlocuiește cu numele tău de utilizator).'],
      ],
      output: {
        label: 'illustrative',
        code: 'wheel:x:10:student\n-rw-rw-r--. 1 student wheel 0 Jan  1 10:10 grup.txt\n-rw-rw-r--. 1 student student 0 Jan  1 10:10 grup.txt',
        explain: 'După primul `chown`, coloana grupului arată `wheel`; după al doilea, revine la grupul tău. Numărul GID și membrii depind de sistem.',
      },
    },
  ],
  verification: [
    { cmd: "stat -c '%a %n' ~/lab18/script.sh ~/lab18/privat.txt ~/lab18/grup.txt ~/lab18/public.txt ~/lab18/echipa", expected: '`750`, `600`, `664`, `644`, `770`.' },
    { cmd: 'ls -ld ~/lab18/echipa', expected: '`drwxrwx---` (x restabilit pentru proprietar).' },
    { cmd: 'umask', expected: 'valoarea inițială (după revenire).' },
  ],
  persistence: [
    'Permisiunile și grupul sunt în inode și persistă după reboot.',
    '`umask 027` a fost doar în sesiune; nu persistă. Pentru permanență s-ar pune într-un fișier de inițializare (nu este necesar aici).',
    'Confirmare manuală: după repornire, `stat -c "%a %n" ~/lab18/*`.',
  ],
  mistakes: [
    'Lași `echipa` fără `x` după test.',
    '`chmod 777` ca scurtătură.',
    'Spații în lista simbolică (`u+x, g+w`).',
    'Uiți să revii la umask-ul inițial în același terminal.',
  ],
  troubleshooting: [
    { symptom: '`./script.sh` dă Permission denied', cause: 'lipsește `x` pentru proprietar', fix: '`chmod u+x script.sh`' },
    { symptom: '`chmod: invalid mode`', cause: 'sintaxă simbolică greșită (spații, litere)', fix: 'folosește `u+x,g+w` fără spații' },
    { symptom: '`chown: Operation not permitted`', cause: 'lipsa privilegiilor', fix: 'folosește `sudo`' },
    { symptom: 'fișiere noi cu alte drepturi decât cele așteptate', cause: 'umask diferit', fix: 'verifică `umask` și setează valoarea potrivită' },
  ],
  alternatives: [
    'Mod simbolic pentru 640: `chmod u=rw,g=r,o= fișier`.',
    '`chmod -R u+rwX,g+rX,o-rwx proiect` pentru a trata diferit fișierele și directoarele.',
    'Grupul poate fi setat și cu `chgrp wheel grup.txt` (cu `sudo` dacă nu ești membru).',
  ],
};
