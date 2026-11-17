import type { Question } from '../../lib/types';

const T = 'M0.5';
const O: string[] = [];

export const Q_M0_5: Question[] = [
  {
    id: 'M0.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre un [[process]] și un serviciu?',
    explanation: 'Un proces este un program în execuție; un serviciu este un daemon descris de un unit systemd și supravegheat de systemd.',
    options: [
      { id: 'a', text: 'Procesul este un program aflat în execuție; serviciul este un proces (sau grup) de fundal pornit și supravegheat de systemd conform unui fișier unit.', correct: true, why: 'Serviciul adaugă politica de pornire, oprire, repornire și dependențe, peste procesele propriu-zise.' },
      { id: 'b', text: 'Sunt același lucru; orice proces este un serviciu.', correct: false, why: 'Comanda `ls` este un proces, dar nu un serviciu systemd.' },
      { id: 'c', text: 'Serviciul este un fișier de pe disc; procesul este un director.', correct: false, why: 'Un unit este un fișier, dar serviciul în execuție este format din procese.' },
      { id: 'd', text: 'Procesele rulează doar ca root; serviciile doar ca utilizatori obișnuiți.', correct: false, why: 'Ambele pot rula sub orice utilizator; multe servicii rulează sub conturi de sistem dedicate.' },
    ],
  },
  {
    id: 'M0.5-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce este PID 1 pe un sistem RHEL 10?',
    explanation: 'Primul proces din user space este systemd; el pornește și supraveghează serviciile.',
    options: [
      { id: 'a', text: '`systemd`, primul proces din user space, părintele (direct sau indirect) al celorlalte.', correct: true, why: 'Verifici cu `ps -p 1 -o comm=`. Dacă PID 1 se oprește, nucleul se oprește.' },
      { id: 'b', text: '`bash`, shell-ul tău.', correct: false, why: 'bash este un proces obișnuit cu PID mare, copil al unei sesiuni de login.' },
      { id: 'c', text: 'nucleul Linux.', correct: false, why: 'Nucleul nu este un proces în user space; el pornește PID 1.' },
      { id: 'd', text: '`sshd`.', correct: false, why: 'sshd este un serviciu pornit de systemd, deci nu poate fi primul proces.' },
    ],
  },
  {
    id: 'M0.5-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Un serviciu apare ca `active (running)` și `disabled`. Care afirmații sunt adevărate? (alege toate cele corecte)',
    explanation: '`active` și `enabled` sunt dimensiuni independente: starea de acum și pornirea la boot.',
    options: [
      { id: 'a', text: 'Serviciul rulează acum.', correct: true, why: '`active (running)` descrie starea curentă.' },
      { id: 'b', text: 'La următorul reboot serviciul NU va porni automat.', correct: true, why: '`disabled` înseamnă că nu este legat de target-urile de pornire.' },
      { id: 'c', text: 'Serviciul nu poate fi oprit cu `systemctl stop`.', correct: false, why: 'Starea `disabled` nu împiedică oprirea sau pornirea manuală.' },
      { id: 'd', text: 'Combinația este imposibilă; un serviciu activ este automat enabled.', correct: false, why: 'Un serviciu poate fi pornit manual (`systemctl start`) fără să fie `enable`d; este o capcană de examen frecventă.' },
    ],
  },
  {
    id: 'M0.5-004', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Află ce pachet RPM a livrat fișierul `/usr/bin/ls`.',
    prompt: '[student@server1 ~]$', answers: ['rpm -qf /usr/bin/ls'], canonical: 'rpm -qf /usr/bin/ls',
    explanation: '`rpm -qf FIȘIER` (query file) interoghează baza RPM și afișează pachetul care deține fișierul.',
    wrong: [
      { text: 'rpm -ql /usr/bin/ls', why: '`-ql` listează fișierele unui PACHET; aici ai un fișier, nu un pachet.' },
      { text: 'rpm -qa /usr/bin/ls', why: '`-qa` listează toate pachetele; nu acceptă un fișier ca filtru.' },
      { text: 'rpm -e /usr/bin/ls', why: '`-e` șterge un pachet; este periculos și nu primește un fișier.' },
      { text: 'dnf remove /usr/bin/ls', why: 'Ar încerca să elimine pachetul, nu să-l identifice.' },
    ],
    hint: '„q” de la query și „f” de la file.',
  },
  {
    id: 'M0.5-005', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează doar serviciile în stare `failed`.',
    prompt: '[root@server1 ~]#', answers: ['systemctl --failed', 'systemctl list-units --failed', 'systemctl --failed --type=service'], canonical: 'systemctl --failed',
    explanation: '`systemctl --failed` listează unit-urile în stare failed (cu `--type=service` doar serviciile).',
    wrong: [
      { text: 'systemctl status --failed', why: '`status` primește nume de unit-uri; `--failed` se folosește cu `list-units` sau direct, nu cu `status`.' },
      { text: 'systemctl is-active', why: '`is-active` cere un nume de unit și răspunde pentru acel unit, nu listează.' },
      { text: 'systemctl list-unit-files', why: 'Listează fișierele unit și starea de pornire la boot, nu serviciile căzute.' },
      { text: 'journalctl --failed', why: '`journalctl` nu are opțiunea `--failed`; este vorba de systemctl.' },
    ],
    hint: 'Opțiunea poartă numele stării căutate.',
  },
  {
    id: 'M0.5-006', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează straturile prin care trece comanda `cat /etc/shadow`, rulată de un utilizator obișnuit (de la primul la ultimul).',
    explanation: 'Flux simplificat: shell → PATH → fork/exec → apel de sistem → verificarea permisiunilor → eroare și exit status.',
    items: [
      { text: 'bash citește linia și o împarte în cuvinte.', why: 'Primul pas este întotdeauna interpretarea liniei de către shell.' },
      { text: 'bash caută `cat` în PATH și găsește `/usr/bin/cat` (fișier livrat de un pachet).', why: 'Comanda este un program extern găsit prin PATH.' },
      { text: 'bash creează un proces copil (fork) care rulează `cat` (exec).', why: 'Programele externe rulează în procese copil.' },
      { text: '`cat` cere nucleului să deschidă `/etc/shadow` printr-un apel de sistem.', why: 'Accesul la fișiere trece prin nucleu.' },
      { text: 'Nucleul verifică permisiunile și refuză accesul.', why: 'Fișierul este al lui root, fără drepturi pentru ceilalți.' },
      { text: '`cat` afișează „Permission denied” și iese cu cod non-zero; bash afișează promptul.', why: 'Eroarea ajunge la utilizator prin stderr; exit status-ul rămâne în `$?`.' },
    ],
  },
  {
    id: 'M0.5-007', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește fiecare simptom cu stratul probabil și cu comanda de la care începi diagnosticul.',
    explanation: 'Diagnosticul pe straturi evită încercările la întâmplare.',
    leftLabel: 'Simptom', rightLabel: 'Prima verificare',
    pairs: [
      { left: 'serviciu `failed`', right: '`systemctl status` și `journalctl -u`', why: 'Arată starea și mesajele de eroare ale unit-ului.' },
      { left: '`No space left on device`', right: '`df -h` și `df -i`', why: 'Spațiu sau inode-uri epuizate pe sistemul de fișiere respectiv.' },
      { left: '`command not found` pentru o comandă instalată', right: '`type` și `echo $PATH`', why: 'Cauza obișnuită este PATH sau o greșeală de scriere.' },
      { left: 'serverul nu răspunde în rețea', right: '`ip -br a`, `ip route`, `ss -tln`', why: 'Verifici de jos în sus: adresă, rută, serviciu care ascultă (apoi firewall).' },
    ],
    distractors: [
      { text: '`rpm -qa --last`', why: 'Arată pachetele instalate recent; nu este prima verificare pentru niciunul dintre simptomele de mai sus.' },
    ],
  },
  {
    id: 'M0.5-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce poți spune despre coloanele PID și PPID pe baza output-ului?',
    explanation: 'PPID este PID-ul părintelui; pentru PID 1 părintele este 0 (nucleul).',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'ps -ef (extras)',
      code: 'UID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 08:01 ?        00:00:03 /usr/lib/systemd/systemd ...\nroot         812       1  0 08:01 ?        00:00:00 /usr/sbin/sshd -D\nstudent     2301     812  0 08:15 ?        00:00:00 sshd: student@pts/0\nstudent     2305    2301  0 08:15 pts/0    00:00:00 -bash',
    },
    options: [
      { id: 'a', text: 'Shell-ul `-bash` (2305) este copilul sesiunii sshd (2301), care la rândul ei este copilul lui sshd (812), pornit de systemd (1).', correct: true, why: 'Lanțul PPID → PID reconstituie arborele: systemd → sshd → sesiune sshd → bash.' },
      { id: 'b', text: 'Procesul 812 este copilul lui 2301.', correct: false, why: 'Invers: PPID-ul lui 2301 este 812, deci 2301 este copilul lui 812.' },
      { id: 'c', text: 'Toate procesele au PPID 1.', correct: false, why: 'Doar procesele pornite direct de systemd (sau adoptate de el) au PPID 1.' },
      { id: 'd', text: '„?” din coloana TTY înseamnă că procesul a eșuat.', correct: false, why: '„?” arată că procesul nu are terminal de control, cum este cazul daemonilor.' },
    ],
  },
  {
    id: 'M0.5-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cum interpretezi `rpm -qf /home/student/script.sh` care răspunde „file /home/student/script.sh is not owned by any package”?',
    explanation: '`rpm -qf` consultă baza RPM; un fișier creat de utilizator nu apare acolo.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'sesiune (exemplu)',
      code: '[student@server1 ~]$ rpm -qf /home/student/script.sh\nfile /home/student/script.sh is not owned by any package\n[student@server1 ~]$ rpm -qf /usr/bin/ls\ncoreutils-9.5-3.el10.x86_64',
    },
    options: [
      { id: 'a', text: 'Fișierul nu a fost instalat de un pachet RPM; l-a creat un utilizator sau un proces.', correct: true, why: 'Baza RPM cunoaște doar fișierele livrate de pachete.' },
      { id: 'b', text: 'Fișierul este corupt și trebuie reparat.', correct: false, why: 'Mesajul nu spune nimic despre integritate (pentru asta există `rpm -V`).' },
      { id: 'c', text: 'Baza RPM este coruptă.', correct: false, why: 'A doua comandă a funcționat; baza răspunde corect.' },
      { id: 'd', text: 'Fișierul este protejat de SELinux.', correct: false, why: 'SELinux nu influențează răspunsul interogării RPM.' },
    ],
  },
  {
    id: 'M0.5-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un coleg scrie în documentația internă pasul de mai jos pentru „serviciul chronyd pornește la boot”. Care este problema?',
    explanation: 'Pornirea unui serviciu este runtime; pornirea la boot cere `enable` (aici, `enable --now` face ambele).',
    snippet: { kind: 'find-error', title: 'procedură', code: '# Asigură-te că chronyd pornește la fiecare boot\nsudo systemctl start chronyd' },
    options: [
      { id: 'a', text: '`start` pornește serviciul doar acum; pentru pornire la boot este nevoie de `enable` (sau `enable --now`).', correct: true, why: 'Starea runtime (active) și cea persistentă (enabled) sunt independente.' },
      { id: 'b', text: '`chronyd` nu poate fi pornit cu systemctl.', correct: false, why: 'chronyd este un serviciu systemd obișnuit.' },
      { id: 'c', text: 'Lipsește `sudo`.', correct: false, why: '`sudo` este prezent; problema este altă comandă.' },
      { id: 'd', text: 'Comanda trebuie rulată în `/etc/systemd`.', correct: false, why: 'Directorul curent nu contează pentru `systemctl`.' },
    ],
  },
  {
    id: 'M0.5-011', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Un utilizator primește `Permission denied` la citirea unui fișier, deși permisiunile rwx par corecte. Ce verifici în continuare? (alege toate cele corecte)',
    explanation: 'După permisiunile clasice urmează controalele suplimentare: SELinux, apartenența la grup și permisiunile directoarelor din cale.',
    options: [
      { id: 'a', text: 'Contextul SELinux al fișierului și modul SELinux (`ls -Z`, `getenforce`).', correct: true, why: 'SELinux poate refuza un acces permis de rwx.' },
      { id: 'b', text: 'Permisiunea `x` pe toate directoarele din cale (`namei -l`).', correct: true, why: 'Fără `x` pe un director intermediar, nu poți ajunge la fișier.' },
      { id: 'c', text: 'Dacă utilizatorul face parte din grupul corect (`id`).', correct: true, why: 'Permisiunile de grup se aplică doar dacă ești membru al acelui grup, iar membrii noi cer o sesiune nouă.' },
      { id: 'd', text: 'Dezactivarea definitivă a SELinux, ca soluție.', correct: false, why: 'Dezactivarea ascunde problema și reduce securitatea; se diagnostichează contextul și se corectează (C10).' },
    ],
  },
  {
    id: 'M0.5-012', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată coloana `available` din `free -h`?',
    explanation: '`available` estimează memoria care poate fi dată aplicațiilor fără a folosi swap; cache-ul se eliberează la nevoie.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'free -h (exemplu)',
      code: '               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       612Mi       2.6Gi       9.0Mi       820Mi       3.2Gi\nSwap:          2.0Gi          0B       2.0Gi',
    },
    options: [
      { id: 'a', text: 'Memoria care poate fi alocată aplicațiilor fără swap, inclusiv cea ocupată temporar de cache care se poate elibera.', correct: true, why: 'Aici ~3,2 GiB din 3,8 GiB; sistemul nu este sub presiune de memorie.' },
      { id: 'b', text: 'Doar memoria din coloana `free`.', correct: false, why: '`available` include și parte din buff/cache, care se eliberează la cerere.' },
      { id: 'c', text: 'Memoria swap neîncepută.', correct: false, why: 'Swap-ul este pe linia separată `Swap:`.' },
      { id: 'd', text: 'Memoria virtuală maximă a sistemului.', correct: false, why: 'Nu este o limită de memorie virtuală; este o estimare a memoriei utilizabile imediat.' },
    ],
  },
];
