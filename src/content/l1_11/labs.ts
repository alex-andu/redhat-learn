import type { Lab } from '../../lab/types';

export const LAB_L1_11: Lab = {
  id: 'lab-l1-11-ssh',
  lessonId: 'L1.11',
  title: 'SSH: conectare, chei și transfer de fișiere',
  modes: ['guided', 'independent'],
  objectives: ['C1-4'],
  difficulty: 2,
  estimatedMinutes: 45,
  scenario: [
    'Administrezi două sisteme Linux ale tale (sau un singur sistem, folosind `localhost` ca „server”). Trebuie să te conectezi prin SSH, să rulezi o comandă remote, să configurezi autentificarea cu cheie și să transferi un fișier.',
    'Sarcini: (1) conectează-te la sistemul remote și arată numele lui de gazdă; (2) ieși și rulează aceeași verificare ca o singură comandă, fără sesiune interactivă; (3) generează o pereche de chei `ed25519` și arată-i amprenta; (4) instalează cheia publică pe sistemul remote și arată că te poți conecta fără parolă; (5) copiază un fișier de test pe sistemul remote cu `scp` și citește-l acolo; (6) descarcă-l înapoi sub alt nume; (7) arată ce conține `known_hosts` după prima conectare.',
    'Notă: platforma nu se conectează la nimic. Toate comenzile le rulezi tu, pe sistemele tale. Dacă ai un singur sistem, înlocuiește `server2` cu `localhost` și asigură-te că `sshd` rulează (verifică, nu modifica).',
  ],
  initialConditions: [
    'Două sisteme Linux ale tale (client și server) sau un singur sistem cu `sshd` pornit; un cont de test pe server (`student`) cu parolă cunoscută de tine.',
    'Serviciul `sshd` rulează pe server, iar firewall-ul permite SSH (starea lor este presupusă; configurarea lor nu face parte din acest laborator).',
    'Nu ai o pereche de chei `~/.ssh/id_ed25519` pe care să nu vrei să o suprascrii; dacă există, alege alt nume de fișier la generare.',
  ],
  finalState: [
    'Perechea de chei există pe client; cheia publică este în `~/.ssh/authorized_keys` pe server.',
    '`~/lab111/raport.txt` există pe client; `/tmp/raport.txt` există pe server; `~/lab111/raport-inapoi.txt` este copia descărcată.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți afișa numele de gazdă al sistemului remote printr-o conexiune SSH.', manualCheck: "ssh student@server2 'hostname'" },
    { id: 'ac2', text: 'Perechea de chei `ed25519` există, iar cheia privată are permisiuni `600`.', manualCheck: "ls -l ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub; stat -c '%a' ~/.ssh/id_ed25519" },
    { id: 'ac3', text: 'Conectarea cu cheia funcționează fără a cere parola contului.', manualCheck: "ssh -o PasswordAuthentication=no student@server2 'whoami'" },
    { id: 'ac4', text: 'Fișierul transferat există pe server și are același conținut.', manualCheck: "ssh student@server2 'cat /tmp/raport.txt'; cat ~/lab111/raport.txt" },
    { id: 'ac5', text: '`known_hosts` conține o intrare pentru gazda remote.', manualCheck: 'ssh-keygen -F server2' },
  ],
  steps: [
    {
      title: 'Prima conectare și comandă remote',
      purpose: 'Te conectezi interactiv, apoi rulezi o comandă fără sesiune.',
      hint: 'La prima conectare apare întrebarea despre amprentă; verific-o, apoi răspunde `yes`. Nu introduce parola în fișiere sau în comandă.',
      commands: "mkdir -p ~/lab111 && cd ~/lab111\nssh student@server2\nhostname; whoami\nexit\nssh student@server2 'hostname'",
      explain: [
        ['ssh student@server2', 'deschide o sesiune interactivă pe server2 ca student.'],
        ['hostname; whoami', 'confirmi sistemul și contul pe care te afli.'],
        ['exit', 'închide sesiunea remote și revii la shell-ul local.'],
        ["ssh … 'hostname'", 'rulează o singură comandă remote și revine; apostrofurile opresc interpretarea locală.'],
      ],
      output: {
        label: 'illustrative',
        code: "The authenticity of host 'server2 (192.168.122.12)' can't be established.\nED25519 key fingerprint is SHA256:abcdEXEMPLUabcdEXEMPLUabcdEXEMPLUabcd.\nAre you sure you want to continue connecting (yes/no/[fingerprint])? yes\nstudent@server2's password:\nserver2\nstudent\nserver2",
        explain: 'Amprenta și adresa sunt inventate. Prima conectare cere confirmarea cheii gazdei și parola; după `exit`, a doua comandă (fără întrebarea despre amprentă) afișează numele remote.',
      },
      reflect: 'Cum ai recunoaște din prompt că ești pe sistemul remote?',
    },
    {
      title: 'Generează perechea de chei',
      purpose: 'Creezi cheia pe client și îi vezi amprenta.',
      hint: 'Frază-parolă (passphrase) este opțională; dacă o setezi, ține-o minte. Nu partaja fișierul fără `.pub`.',
      commands: 'ssh-keygen -t ed25519\nls -l ~/.ssh\nssh-keygen -lf ~/.ssh/id_ed25519.pub',
      explain: [
        ['ssh-keygen -t ed25519', 'generează o pereche de chei ed25519; confirmă locația implicită cu Enter (sau alege alt nume dacă există deja o cheie).'],
        ['ls -l ~/.ssh', 'vezi cheia privată (600) și cea publică (.pub).'],
        ['ssh-keygen -lf', '-l afișează amprenta; -f indică fișierul.'],
      ],
      output: {
        label: 'illustrative',
        code: '-rw-------. 1 student student  411 Jan  1 10:20 id_ed25519\n-rw-r--r--. 1 student student  100 Jan  1 10:20 id_ed25519.pub\n256 SHA256:abcdEXEMPLUabcdEXEMPLUabcdEXEMPLUabcd student@server1 (ED25519)',
        explain: 'Cheia privată are `rw-------`; cea publică se poate citi de alții. Dimensiunile și amprenta diferă pe sistemul tău.',
      },
    },
    {
      title: 'Instalează cheia publică și conectează-te fără parolă',
      purpose: 'Copiezi cheia publică pe server și verifici autentificarea cu cheie.',
      hint: '`ssh-copy-id` cere o singură dată parola contului. Dacă tot cere parola după aceea, verifică permisiunile din `~/.ssh` pe server.',
      commands: "ssh-copy-id student@server2\nssh -o PasswordAuthentication=no student@server2 'whoami'",
      explain: [
        ['ssh-copy-id student@server2', 'adaugă cheia publică în `~/.ssh/authorized_keys` pe server.'],
        ['-o PasswordAuthentication=no', 'dezactivează autentificarea cu parolă pentru această încercare; dacă reușește, cheia funcționează.'],
      ],
      output: {
        label: 'illustrative',
        code: "Number of key(s) added: 1\nstudent",
        explain: 'Prima parte confirmă că o cheie a fost adăugată; a doua arată că te-ai conectat fără parolă.',
      },
    },
    {
      title: 'Transfer de fișiere',
      purpose: 'Copiezi un fișier pe server și îl aduci înapoi.',
      hint: 'La `scp`, calea remote are forma `utilizator@gazdă:cale`; nu uita `:`.',
      commands: "echo 'continut de test' > raport.txt\nscp raport.txt student@server2:/tmp/\nssh student@server2 'cat /tmp/raport.txt'\nscp student@server2:/tmp/raport.txt ./raport-inapoi.txt\ndiff raport.txt raport-inapoi.txt && echo identic",
      explain: [
        ['scp raport.txt student@server2:/tmp/', 'copiază fișierul local în /tmp pe server.'],
        ["ssh … 'cat …'", 'citești fișierul copiat, direct pe server.'],
        ['scp student@server2:/tmp/raport.txt ./raport-inapoi.txt', 'descarcă fișierul sub alt nume.'],
        ['diff … && echo identic', 'compară cele două fișiere; mesajul apare doar dacă sunt identice.'],
      ],
      output: {
        label: 'illustrative',
        code: 'raport.txt                                  100%   16     0.1KB/s   00:00\ncontinut de test\nraport-inapoi.txt                           100%   16     0.1KB/s   00:00\nidentic',
        explain: 'Formatul liniilor `scp` (nume, procent, dimensiune, durată) poate diferi. Cuvântul final confirmă că fișierul descărcat este identic cu originalul.',
      },
    },
    {
      title: 'known_hosts',
      purpose: 'Vezi unde sunt memorate cheile gazdelor.',
      hint: '`ssh-keygen -F` caută o gazdă în `known_hosts`. Nu modifica fișierul manual.',
      commands: 'ssh-keygen -F server2\nwc -l ~/.ssh/known_hosts',
      explain: [
        ['ssh-keygen -F server2', '-F caută gazda în known_hosts și afișează intrarea.'],
        ['wc -l', 'numără intrările (liniile) din fișier.'],
      ],
      output: {
        label: 'illustrative',
        code: '# Host server2 found: line 1\nserver2 ssh-ed25519 AAAA...exemplu...\n1 /home/student/.ssh/known_hosts',
        explain: 'Intrarea conține numele gazdei, tipul cheii și cheia publică a serverului (aici trunchiată). Pe unele sisteme numele gazdei poate apărea hash-uit (necitibil).',
      },
    },
  ],
  verification: [
    { cmd: "ssh student@server2 'hostname'", expected: 'numele gazdei remote.' },
    { cmd: "ssh -o PasswordAuthentication=no student@server2 'whoami'", expected: '`student`, fără cerere de parolă.' },
    { cmd: 'stat -c "%a %n" ~/.ssh ~/.ssh/id_ed25519', expected: '`700` pentru director și `600` pentru cheia privată.' },
    { cmd: 'diff ~/lab111/raport.txt ~/lab111/raport-inapoi.txt; echo $?', expected: '`0`, fără diferențe.' },
  ],
  persistence: [
    'Cheile, `known_hosts` și `authorized_keys` sunt fișiere în home: persistă după reboot.',
    'Serviciul `sshd` și regula de firewall nu sunt modificate aici; dacă lipsesc, conectarea nu este posibilă (C4, C8).',
    'Confirmare manuală: după repornire, `ssh -o PasswordAuthentication=no student@server2 whoami`.',
  ],
  mistakes: [
    'Copierea cheii private în loc de cea publică.',
    '`scp -p` în loc de `scp -P` pentru port (și invers la `ssh`).',
    'Permisiuni prea largi pe `~/.ssh`, `authorized_keys` sau cheia privată.',
    'Răspuns automat `yes` la o schimbare de cheie a gazdei, fără verificare.',
  ],
  troubleshooting: [
    { symptom: '`Connection refused`', cause: '`sshd` nu rulează sau port greșit', fix: 'verifică pe server `systemctl status sshd`; folosește portul corect' },
    { symptom: '`Connection timed out`', cause: 'rețea sau firewall', fix: '`ping`, verifică adresa; firewall-ul este tratat în C8/C10' },
    { symptom: 'Cheia instalată, dar se cere parola', cause: 'permisiuni greșite pe server', fix: '`chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys` (pe server, ca utilizatorul respectiv)' },
    { symptom: '`REMOTE HOST IDENTIFICATION HAS CHANGED`', cause: 'cheia gazdei s-a schimbat', fix: 'verifică legitimitatea, apoi `ssh-keygen -R server2`' },
  ],
  alternatives: [
    'Fără `ssh-copy-id`: `cat ~/.ssh/id_ed25519.pub | ssh student@server2 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"` (apoi setează permisiunile).',
    'Transfer interactiv cu `sftp student@server2` (`put`, `get`).',
    'Alias în `~/.ssh/config` (`Host`, `HostName`, `User`) pentru a scrie doar `ssh srv2`.',
  ],
};
