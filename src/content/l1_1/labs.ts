import type { Lab } from '../../lab/types';

export const LAB_L1_1: Lab = {
  id: 'lab-l1-1-prima-sesiune',
  lessonId: 'L1.1',
  title: 'Prima sesiune de shell: orientare, sintaxă și exit status',
  modes: ['guided', 'independent'],
  objectives: ['C1-1'],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Ai primit acces la un server RHEL 10 și trebuie să te orientezi înainte de orice modificare. Fără interfață grafică, folosești doar shell-ul.',
    'Sarcină: stabilește cine ești, pe ce mașină lucrezi și unde te afli; stabilește ce fel de comandă este `cd` și ce este `ls`; arată prin exit status diferența dintre o comandă reușită, una eșuată și una inexistentă; creează un director cu un nume cu spațiu folosind citarea corectă; definește un alias care să supraviețuiască unei sesiuni noi.',
  ],
  initialConditions: [
    'Ești autentificat ca utilizator obișnuit (nu root) într-un terminal pe un sistem RHEL 10 sau compatibil, pe care ai drept să creezi fișiere în directorul home.',
    'Fișierul `~/.bashrc` există (este creat implicit la crearea utilizatorului).',
  ],
  finalState: [
    'Directorul `~/lab11/raport lunar` există.',
    'Un alias `ll` (definit în `~/.bashrc`) este disponibil într-un shell nou.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți afirma, pe baza comenzilor rulate, utilizatorul, hostname-ul și directorul curent.', manualCheck: 'whoami; hostname; pwd' },
    { id: 'ac2', text: 'Ai identificat `cd` ca builtin și ai arătat cum este interpretat `ls` pe sistemul tău.', manualCheck: 'type cd; type -a ls' },
    { id: 'ac3', text: 'Ai obținut exit status 0, 2 (sau altă valoare non-zero de la `ls`) și 127 și le-ai explicat.', manualCheck: 'ls /etc/hostname; echo $?; ls /nu-exista; echo $?; comandainexistenta; echo $?' },
    { id: 'ac4', text: 'Există directorul `~/lab11/raport lunar` (un singur director, cu spațiu în nume).', manualCheck: 'ls -d ~/lab11/*' },
    { id: 'ac5', text: 'Aliasul `ll` este definit permanent: apare într-un shell nou.', manualCheck: 'bash -ic "alias ll"' },
  ],
  steps: [
    {
      title: 'Orientează-te',
      purpose: 'Înainte de a modifica ceva, afli cine ești, pe ce mașină te afli și în ce director lucrezi.',
      hint: 'Trei comenzi simple, fără opțiuni. Promptul îți dă deja o parte din răspuns.',
      commands: 'whoami\nhostname\npwd',
      explain: [
        ['whoami', 'numele utilizatorului efectiv.'],
        ['hostname', 'numele mașinii.'],
        ['pwd', 'directorul curent, ca cale absolută (print working directory).'],
      ],
      output: {
        label: 'illustrative',
        code: '[student@server1 ~]$ whoami\nstudent\n[student@server1 ~]$ hostname\nserver1.example.com\n[student@server1 ~]$ pwd\n/home/student',
        explain: 'Valorile (`student`, `server1.example.com`) sunt exemplificative; la tine vor fi altele. Compară-le cu ce arată promptul.',
      },
      reflect: 'Ce ți-ar spune promptul dacă ai fi root? Ce caracter s-ar schimba?',
    },
    {
      title: 'Ce fel de comandă este?',
      purpose: 'Vezi cum interpretează bash numele `cd` și `ls`: builtin, alias sau fișier.',
      hint: 'Folosește `type`, nu `man`. `-a` arată toate variantele.',
      commands: 'type cd\ntype -a ls',
      explain: [
        ['type cd', 'răspunde „cd is a shell builtin” dacă este comandă internă.'],
        ['type -a ls', '-a (all): toate interpretările, în ordinea căutării (alias, apoi fișier).'],
      ],
      output: {
        label: 'illustrative',
        code: 'cd is a shell builtin\nls is aliased to `ls --color=auto\'\nls is /usr/bin/ls',
        explain: 'Dacă la tine `ls` nu are alias, vei vedea doar linia cu calea fișierului. Calea exactă depinde de sistem.',
      },
      reflect: 'De ce nu poate fi `cd` un program extern?',
    },
    {
      title: 'Exit status: succes, eșec, comandă inexistentă',
      purpose: 'Citești codul de ieșire imediat după fiecare comandă.',
      hint: '`echo $?` trebuie rulat IMEDIAT după comanda de interes.',
      commands: 'ls /etc/hostname\necho $?\nls /nu-exista\necho $?\ncomandainexistenta\necho $?',
      explain: [
        ['echo $?', '$? conține exit status-ul comenzii precedente.'],
        ['ls /nu-exista', 'cale inexistentă: ls afișează eroarea și iese cu cod non-zero (2, conform man ls).'],
        ['comandainexistenta', 'bash nu găsește comanda și returnează 127.'],
      ],
      output: {
        label: 'illustrative',
        code: '/etc/hostname\n0\nls: cannot access \'/nu-exista\': No such file or directory\n2\nbash: comandainexistenta: command not found\n127',
        explain: '0 = succes, 2 = ls nu a putut accesa argumentul, 127 = comanda nu a fost găsită. Mesajul exact poate varia ușor între versiuni.',
      },
    },
    {
      title: 'Citare corectă: director cu spațiu în nume',
      purpose: 'Un argument cu spațiu trebuie citat, altfel shell-ul îl împarte în două.',
      hint: 'Ghilimele duble sau backslash înaintea spațiului. Verifică apoi cu `ls`.',
      commands: 'mkdir -p ~/lab11\ncd ~/lab11\nmkdir "raport lunar"\nls -d *',
      explain: [
        ['mkdir -p ~/lab11', '-p (--parents): creează și părinții dacă lipsesc și nu dă eroare dacă directorul există deja.'],
        ['cd ~/lab11', '~ se expandează în directorul home al utilizatorului.'],
        ['mkdir "raport lunar"', 'ghilimelele păstrează „raport lunar” ca UN SINGUR argument.'],
        ['ls -d *', '-d (--directory): listează directoarele ca atare, nu conținutul lor. * = toate numele din directorul curent.'],
      ],
      output: {
        label: 'illustrative',
        code: 'raport lunar',
        explain: 'Un singur director. Fără ghilimele ai fi creat două: `raport` și `lunar`. Alternativ: `mkdir raport\\ lunar`.',
      },
      reflect: 'Ce ar fi creat `mkdir raport lunar`? Cum ai verifica?',
    },
    {
      title: 'Alias persistent',
      purpose: 'Un alias tastat în terminal dispare la închiderea sesiunii; ca să persiste, îl scrii în `~/.bashrc`.',
      hint: 'Fără spații în jurul lui `=`. Apoi verifică într-un shell NOU, nu în cel curent.',
      commands: "echo \"alias ll='ls -l'\" >> ~/.bashrc\nbash -ic 'alias ll'",
      explain: [
        ['echo "alias ll=\'ls -l\'" >> ~/.bashrc', 'adaugă linia la sfârșitul fișierului. >> înseamnă „adaugă” (redirecționarea e în L1.5). Ghilimelele duble exterioare protejează apostrofurile.'],
        ['bash -ic \'alias ll\'', 'pornește un bash interactiv nou (-i) care rulează comanda (-c) și afișează aliasul; dovedește că persistă dincolo de sesiunea curentă.'],
      ],
      output: {
        label: 'illustrative',
        code: "alias ll='ls -l'",
        explain: 'Dacă nu apare, verifică dacă linia s-a adăugat în fișier (`tail -n 2 ~/.bashrc`) și dacă `~/.bash_profile` apelează `~/.bashrc`.',
      },
    },
  ],
  verification: [
    { cmd: 'ls -d ~/lab11/*', expected: 'afișează un singur element: `/home/<utilizator>/lab11/raport lunar`.' },
    { cmd: "bash -ic 'alias ll'", expected: "afișează `alias ll='ls -l'`." },
    { cmd: 'echo $?', expected: 'imediat după o comandă reușită, afișează `0`.' },
  ],
  persistence: [
    'Directorul `~/lab11/raport lunar` este un fișier pe disc: persistă după reboot.',
    'Aliasul persistă doar pentru că a fost scris în `~/.bashrc`. Un alias definit doar cu `alias ll=...` în terminal dispare la închiderea sesiunii.',
    'Confirmare manuală: deschide un terminal nou (sau reautentifică-te) și rulează `alias ll`.',
  ],
  mistakes: [
    'Spații în jurul lui `=`: `alias ll = \'ls -l\'` dă eroare.',
    'Uitarea ghilimelelor pentru nume cu spațiu: se creează directoare separate.',
    'Citirea lui `$?` după o comandă intermediară.',
    'Testarea aliasului în shell-ul curent, unde ar funcționa chiar dacă nu s-a scris în `~/.bashrc`.',
  ],
  troubleshooting: [
    { symptom: '`alias ll` nu găsește aliasul în shell nou', cause: 'linia nu a ajuns în ~/.bashrc, sau ~/.bash_profile nu apelează ~/.bashrc într-un login shell', fix: 'verifică fișierul cu `tail ~/.bashrc`; testează cu `bash -ic` (shell interactiv non-login) și, pentru login shell, verifică că ~/.bash_profile citește ~/.bashrc' },
    { symptom: 'prompt blocat pe `>`', cause: 'ghilimele nepereche', fix: 'Ctrl+C și retastează comanda' },
    { symptom: '`mkdir: cannot create directory`', cause: 'drepturi insuficiente sau cale greșită', fix: 'verifică `pwd` și `ls -ld` pe părinte' },
  ],
  alternatives: [
    'Spațiul în nume poate fi protejat și cu apostrofuri (`mkdir \'raport lunar\'`) sau backslash (`mkdir raport\\ lunar`).',
    'Aliasul poate fi pus și într-un fișier din `~/.bashrc.d/` dacă sistemul îl încarcă; metoda cu `~/.bashrc` este cea sigură.',
    'Un editor de text (L1.4) poate înlocui `echo ... >>` pentru adăugarea liniei.',
  ],
};
