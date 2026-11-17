import type { Question } from '../../lib/types';

const T = 'M0.4';
const O: string[] = [];

export const Q_M0_4: Question[] = [
  {
    id: 'M0.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce înseamnă că Linux are „un singur arbore de directoare”?',
    explanation: 'Tot ce este accesibil se află sub `/`; discurile se montează în directoare, nu primesc litere de unitate.',
    options: [
      { id: 'a', text: 'Toate fișierele din toate discurile apar sub rădăcina `/`; un disc nou se montează într-un director existent.', correct: true, why: 'Punctul de montare leagă un alt sistem de fișiere de arbore; calea nu mai arată pe ce disc este fișierul.' },
      { id: 'b', text: 'Fiecare disc are propriul arbore, identificat printr-o literă (C:, D:).', correct: false, why: 'Aceasta este convenția Windows. Pe Linux nu există litere de unitate.' },
      { id: 'c', text: 'Există un singur disc pe orice sistem Linux.', correct: false, why: 'Pot exista multe discuri și partiții; ele sunt unite în același arbore prin montare.' },
      { id: 'd', text: 'Nu se pot crea directoare noi în rădăcină.', correct: false, why: 'Administratorul poate crea directoare în `/` (de exemplu pentru puncte de montare), dar de regulă folosește locurile standard.' },
    ],
  },
  {
    id: 'M0.4-002', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește fiecare director cu rolul lui.',
    explanation: 'Directoarele de top au roluri standardizate de [[fhs]].',
    leftLabel: 'Director', rightLabel: 'Rol',
    pairs: [
      { left: '`/etc`', right: 'configurări locale ale sistemului și serviciilor', why: 'Fișiere text specifice mașinii: fstab, hosts, passwd, ssh/.' },
      { left: '`/var`', right: 'date variabile: log-uri, cozi, cache, stare', why: 'Conținutul crește sau se schimbă în timpul funcționării (/var/log, /var/lib).' },
      { left: '`/home`', right: 'directoarele personale ale utilizatorilor', why: 'Fiecare utilizator obișnuit are /home/utilizator.' },
      { left: '`/boot`', right: 'nucleul, initramfs și fișierele bootloader-ului', why: 'Aici își caută GRUB nucleul și initramfs.' },
      { left: '`/proc`', right: 'informații despre procese și nucleu, generate în memorie', why: 'Sistem de fișiere virtual; nu este pe disc.' },
    ],
    distractors: [
      { text: 'programele instalate de utilizator în afara pachetelor', why: 'Aceasta descrie /usr/local sau /opt, nu un director de mai sus.' },
    ],
  },
  {
    id: 'M0.4-003', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ești în `/etc/ssh`. Ce rezultat are `cd ../..`?',
    explanation: 'Fiecare `..` urcă un nivel: din /etc/ssh în /etc, apoi în /.',
    options: [
      { id: 'a', text: 'Directorul curent devine `/` (rădăcina).', correct: true, why: '/etc/ssh → /etc → /.' },
      { id: 'b', text: 'Directorul curent devine `/etc`.', correct: false, why: 'Un singur `..` ar duce în /etc; două urcă încă un nivel.' },
      { id: 'c', text: 'Directorul curent devine `/home`.', correct: false, why: '`..` urcă în părintele curent, nu în /home.' },
      { id: 'd', text: 'Comanda eșuează, fiindcă nu se poate urca peste /etc.', correct: false, why: 'Se poate urca până la `/`; doar peste `/` nu mai există nivel superior (`/..` este tot `/`).' },
    ],
  },
  {
    id: 'M0.4-004', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre următoarele directoare sunt generate de nucleu în memorie, deci NU sunt stocate pe disc? (alege toate cele corecte)',
    explanation: '/proc, /sys, /dev și /run sunt pseudo-sisteme de fișiere / sisteme în memorie.',
    options: [
      { id: 'a', text: '`/proc`', correct: true, why: 'Tip proc: expune procese și parametri ai nucleului.' },
      { id: 'b', text: '`/sys`', correct: true, why: 'Tip sysfs: expune dispozitive și driver-e.' },
      { id: 'c', text: '`/run`', correct: true, why: 'Este un tmpfs (în RAM): stare de la pornirea curentă.' },
      { id: 'd', text: '`/home`', correct: false, why: '/home este pe disc (de regulă un sistem de fișiere dedicat sau parte din /); persistă după reboot.' },
    ],
  },
  {
    id: 'M0.4-005', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează spațiul liber pe toate sistemele de fișiere montate, în unități ușor de citit (K, M, G).',
    prompt: '[student@server1 ~]$', answers: ['df -h', 'df --human-readable'], canonical: 'df -h',
    explanation: '`df` (disk free) raportează spațiul pe sisteme de fișiere; `-h` (`--human-readable`) afișează K/M/G.',
    wrong: [
      { text: 'du -h', why: '`du` măsoară cât ocupă fișierele dintr-un director, nu spațiul liber al sistemelor montate.' },
      { text: 'df', why: 'Fără `-h` valorile apar în blocuri de 1 KiB, mai greu de citit.' },
      { text: 'ls -h', why: '`ls -h` afișează dimensiunile fișierelor, doar împreună cu `-l`; nu raportează spațiul liber al unui sistem de fișiere.' },
      { text: 'free -h', why: '`free` raportează memoria RAM și swap, nu discul.' },
    ],
    hint: 'Comanda este prescurtarea de la „disk free”.',
  },
  {
    id: 'M0.4-006', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează calea reală (după urmărirea tuturor legăturilor simbolice) a lui `/bin`.',
    prompt: '[student@server1 ~]$', answers: ['readlink -f /bin', 'readlink --canonicalize /bin'], canonical: 'readlink -f /bin',
    explanation: '`readlink -f` urmărește recursiv legăturile și afișează calea canonică; pe RHEL rezultatul este `/usr/bin`.',
    wrong: [
      { text: 'readlink /bin/', why: 'Cu slash final, readlink nu tratează /bin ca legătură; folosește calea fără slash și opțiunea de canonizare.' },
      { text: 'cd /bin', why: '`cd` doar schimbă directorul; nu afișează unde duce legătura.' },
      { text: 'ls /bin', why: '`ls /bin` listează conținutul (al țintei, prin legătură), nu spune care este ținta.' },
      { text: 'file /bin/ls', why: 'Analizează tipul fișierului `ls`, nu calea lui `/bin`.' },
    ],
    hint: 'Comanda are în nume cuvintele „read” și „link”.',
  },
  {
    id: 'M0.4-007', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează căutarea unui fișier de configurare pentru un serviciu care nu pornește (de la primul pas la ultimul).',
    explanation: 'Un flux rațional: identifici serviciul, găsești configurarea, verifici sintaxa/permisiunile, apoi citești log-urile.',
    items: [
      { text: 'Aflu numele pachetului/serviciului (de exemplu `sshd`).', why: 'Fără numele exact nu poți găsi fișierele corecte.' },
      { text: 'Listez fișierele pachetului cu `rpm -ql` și identific configurarea din `/etc`.', why: 'rpm -ql arată unde pune pachetul fișierele; configurările sunt în /etc.' },
      { text: 'Citesc fișierul de configurare și verific sintaxa și permisiunile (`ls -l`, `file`).', why: 'Greșelile de sintaxă și drepturile greșite sunt cauze frecvente.' },
      { text: 'Citesc log-urile serviciului (`journalctl -u`, `/var/log`).', why: 'Mesajul exact al erorii indică linia sau opțiunea problematică.' },
      { text: 'Repornesc serviciul și confirm starea (`systemctl status`).', why: 'Verificarea finală arată dacă modificarea a rezolvat problema.' },
    ],
  },
  {
    id: 'M0.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Pe baza output-ului, de ce `/proc` apare cu dimensiune 0 și cu data de la pornire?',
    explanation: 'Conținutul /proc este generat de nucleu la citire, nu stocat pe disc.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'ls -ld (exemplu)',
      code: '[student@server1 ~]$ ls -ld /proc /sys /etc\ndr-xr-xr-x. 220 root root    0 Nov 17 08:01 /proc\ndr-xr-xr-x.  13 root root    0 Nov 17 08:01 /sys\ndrwxr-xr-x. 130 root root 8192 Nov 17 08:01 /etc',
    },
    options: [
      { id: 'a', text: 'Sunt sisteme de fișiere virtuale generate de nucleu în memorie; nu ocupă spațiu pe disc.', correct: true, why: 'Dimensiunea 0 și data de la pornire sunt tipice pseudo-sistemelor de fișiere. /etc este un director obișnuit, pe disc.' },
      { id: 'b', text: 'Sunt directoare goale, create pentru viitor.', correct: false, why: 'Au conținut bogat, produs la cerere (de exemplu /proc/meminfo); dimensiunea 0 nu înseamnă „gol”.' },
      { id: 'c', text: 'Sunt corupte și trebuie reparate cu fsck.', correct: false, why: 'Aspectul este normal; fsck nu se aplică pseudo-sistemelor.' },
      { id: 'd', text: 'Sunt legături simbolice către /dev.', correct: false, why: 'Linia ar începe cu `l`; aici începe cu `d` (director).' },
    ],
  },
  {
    id: 'M0.4-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată output-ul de mai jos despre `/bin`?',
    explanation: 'Litera `l` la început și „-> usr/bin” arată o legătură simbolică; pe RHEL, directoarele istorice sunt unite cu /usr.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'ls -ld /bin /usr/bin (exemplu)',
      code: '[student@server1 ~]$ ls -ld /bin /usr/bin\nlrwxrwxrwx. 1 root root    7 Jan 10 09:00 /bin -> usr/bin\ndr-xr-xr-x. 2 root root 69632 Nov 17 08:12 /usr/bin',
    },
    options: [
      { id: 'a', text: '`/bin` este o legătură simbolică către `usr/bin`; comenzile din /bin sunt de fapt în /usr/bin.', correct: true, why: 'Este rezultatul „usr merge”: căile vechi sunt păstrate ca legături.' },
      { id: 'b', text: '`/bin` este un director obișnuit care conține copii ale comenzilor din /usr/bin.', correct: false, why: 'Linia începe cu `l`, nu cu `d`; nu sunt copii, ci aceeași listă prin legătură.' },
      { id: 'c', text: '`/bin` este un disc montat peste `/usr/bin`.', correct: false, why: 'O montare nu apare ca „->” în ls -l; săgeata indică o legătură simbolică.' },
      { id: 'd', text: '`/bin` este o legătură hard, de aceea are 1 legătură.', correct: false, why: 'O legătură hard nu are săgeată în ls -l; „->” este specific legăturilor simbolice.' },
    ],
  },
  {
    id: 'M0.4-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai montat un disc nou peste `/data`, un director care conținea fișiere. Ce se întâmplă cu fișierele vechi?',
    explanation: 'O montare peste un director ocupat ascunde conținutul anterior până la demontare.',
    options: [
      { id: 'a', text: 'Rămân pe disc, dar nu sunt vizibile cât timp discul este montat; reapar după demontare.', correct: true, why: 'Montarea înlocuiește vizibil conținutul directorului; nu îl șterge.' },
      { id: 'b', text: 'Sunt copiate automat pe discul nou.', correct: false, why: 'Montarea nu copiază nimic.' },
      { id: 'c', text: 'Sunt șterse definitiv.', correct: false, why: 'Nu se șterge nimic; fișierele rămân pe sistemul de fișiere original.' },
      { id: 'd', text: 'Montarea eșuează dacă directorul nu este gol.', correct: false, why: 'Linux permite montarea peste un director nevid, dar este o practică de evitat.' },
    ],
  },
  {
    id: 'M0.4-011', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai creat în `/tmp` un fișier cu date importante și ai repornit serverul. Ce este corect?',
    explanation: '/tmp este pentru fișiere temporare; poate fi curățat de systemd-tmpfiles și, pe unele sisteme, este tmpfs.',
    options: [
      { id: 'a', text: 'Nu te poți baza pe existența fișierului: /tmp este pentru date temporare și poate fi curățat.', correct: true, why: 'Pentru date care trebuie păstrate folosești un loc persistent: /home, /var/lib, /srv.' },
      { id: 'b', text: 'Fișierul rămâne mereu, ca orice fișier de pe disc.', correct: false, why: 'Dacă /tmp este tmpfs se pierde la reboot; chiar pe disc poate fi curățat după regulile tmpfiles.d.' },
      { id: 'c', text: 'Fișierul se mută automat în /var/tmp.', correct: false, why: 'Nu există o astfel de mutare automată.' },
      { id: 'd', text: 'Fișierul devine al lui root după reboot.', correct: false, why: 'Proprietarul nu se schimbă prin reboot.' },
    ],
  },
  {
    id: 'M0.4-012', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Fișierul de mai jos are o greșeală de scriere a căii. Care?',
    explanation: 'Calea relativă `etc/hosts` este căutată din directorul curent; pentru fișierul de sistem trebuie cale absolută.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ cat etc/hosts\ncat: etc/hosts: No such file or directory' },
    options: [
      { id: 'a', text: 'Calea este relativă (fără `/` la început): se caută `etc/hosts` în directorul curent; trebuie `/etc/hosts`.', correct: true, why: 'Căile fără slash inițial pornesc din directorul curent (aici /home/student).' },
      { id: 'b', text: 'Fișierul /etc/hosts nu există pe niciun sistem Linux.', correct: false, why: '/etc/hosts există pe aproape toate sistemele; eroarea vine din calea relativă.' },
      { id: 'c', text: '`cat` nu poate afișa fișiere text.', correct: false, why: '`cat` afișează fișiere text; problema este calea.' },
      { id: 'd', text: 'Fișierele din /etc sunt accesibile doar root-ului.', correct: false, why: '/etc/hosts este lizibil de toți; la lipsa dreptului mesajul ar fi „Permission denied”.' },
    ],
  },
];
