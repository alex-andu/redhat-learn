import type { Question } from '../../lib/types';

const T = 'L7.1';
const O = ['C7-1'];

export const Q_L7_1: Question[] = [
  {
    id: 'L7.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce instrument alegi pentru o sarcină care trebuie să ruleze O SINGURĂ DATĂ, mâine la 16:00?',
    explanation: '`at` programează execuții unice; cron este pentru sarcini repetitive.',
    options: [
      { id: 'a', text: '`at 16:00 tomorrow`', correct: true, why: 'at este făcut pentru job-uri unice; după rulare, job-ul dispare din coadă.' },
      { id: 'b', text: 'O linie în `crontab -e` care rămâne permanent.', correct: false, why: 'Ar rula în fiecare an/lună/zi după expresie; nu e o execuție unică și ar trebui ștearsă manual.' },
      { id: 'c', text: '`batch`', correct: false, why: 'batch rulează când încărcarea permite, fără oră fixă.' },
      { id: 'd', text: 'Un script cu `sleep 86400`.', correct: false, why: 'Un proces care dormește ocupă resurse și nu supraviețuiește unui reboot; at salvează job-ul pe disc.' },
    ],
  },
  {
    id: 'L7.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce înseamnă linia `30 2 * * *` într-un crontab?',
    explanation: 'Câmpurile sunt: minut, oră, zi din lună, lună, zi din săptămână.',
    options: [
      { id: 'a', text: 'În fiecare zi la 02:30.', correct: true, why: 'Minutul 30, ora 2, orice zi/lună/zi din săptămână.' },
      { id: 'b', text: 'În fiecare zi la 30:02.', correct: false, why: 'Ora 30 nu există; ordinea câmpurilor este minut, apoi oră.' },
      { id: 'c', text: 'La fiecare 30 de minute, în ora 2.', correct: false, why: 'Pentru „din 30 în 30 de minute” se folosește */30 în câmpul minut.' },
      { id: 'd', text: 'Pe 30 februarie.', correct: false, why: 'Ziua și luna sunt câmpurile 3 și 4, ambele `*` aici.' },
    ],
  },
  {
    id: 'L7.1-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Listează tabela cron a utilizatorului curent.',
    prompt: '[student@server1 ~]$',
    answers: ['crontab -l'],
    canonical: 'crontab -l',
    explanation: '`-l` (list) afișează conținutul crontab-ului.',
    wrong: [
      { text: 'crontab -e', why: '-e deschide tabela în editor pentru modificare, nu o doar listează.' },
      { text: 'crontab -r', why: '-r ȘTERGE tabela, fără confirmare.' },
      { text: 'cat /etc/crontab', why: 'Aceasta este tabela de sistem, nu cea personală (care stă în /var/spool/cron și se citește cu crontab -l).' },
    ],
  },
  {
    id: 'L7.1-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un job `*/35 * * * *` rulează:',
    explanation: 'Pasul se aplică în interiorul câmpului (crontab(5)).',
    options: [
      { id: 'a', text: 'La minutele 0 și 35 ale fiecărei ore.', correct: true, why: 'Valorile din câmpul minut sunt 0 și 35; apoi se reia de la 0 în ora următoare, deci intervalul nu este uniform.' },
      { id: 'b', text: 'La fiecare 35 de minute exact, fără întrerupere.', correct: false, why: 'Cron nu numără minute de la ultima rulare; pasul se aplică doar în interiorul unui câmp.' },
      { id: 'c', text: 'O dată pe oră, la minutul 35, doar.', correct: false, why: 'Rulează și la minutul 0.' },
      { id: 'd', text: 'Nu este o expresie validă.', correct: false, why: 'Este validă: `*/n` este permis pentru orice n din interval.' },
    ],
  },
  {
    id: 'L7.1-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce nu funcționează linia de mai jos, deși comanda merge în terminal?',
    explanation: 'În crontab, `%` este caracter special: devine newline (crontab(5)). Trebuie escapat cu `\\`.',
    snippet: { kind: 'find-error', title: 'crontab -l', code: '0 1 * * * /usr/bin/cp /etc/hosts /tmp/hosts-$(/usr/bin/date +%F)' },
    options: [
      { id: 'a', text: 'Caracterul `%` trebuie escapat ca `\\%`.', correct: true, why: 'Fiecare % neescapat este tratat ca newline, iar textul de după este dat comenzii ca stdin; comanda este trunchiată.' },
      { id: 'b', text: 'Comanda `cp` nu poate fi folosită în cron.', correct: false, why: 'Orice comandă poate fi rulată din cron; contează calea și mediul.' },
      { id: 'c', text: 'Substituția `$( )` nu este permisă niciodată în cron.', correct: false, why: 'Shell-ul (/bin/sh) o interpretează; problema este %, nu $( ).' },
      { id: 'd', text: 'Lipsește utilizatorul înaintea comenzii.', correct: false, why: 'Utilizatorul se scrie doar în /etc/crontab și /etc/cron.d, nu în tabela personală.' },
    ],
  },
  {
    id: 'L7.1-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmații despre mediul unui job cron sunt adevărate?',
    explanation: 'Un job cron nu are terminal și nu citește profilul utilizatorului.',
    options: [
      { id: 'a', text: 'Are un `PATH` redus, așa că se preferă căi absolute.', correct: true, why: 'Comenzile fără cale pot să nu fie găsite.' },
      { id: 'b', text: 'Output-ul lui este, în mod implicit, trimis prin mail proprietarului (dacă există mail local).', correct: true, why: 'MAILTO controlează destinatarul; gol = fără mail (crontab(5)).' },
      { id: 'c', text: 'Nu are terminal atașat și nu citește ~/.bashrc.', correct: true, why: 'Este un proces non-interactiv pornit de daemon.' },
      { id: 'd', text: 'Moștenește toate variabilele exportate în terminalul tău.', correct: false, why: 'Aceasta este comportarea lui at, nu a lui cron.' },
    ],
  },
  {
    id: 'L7.1-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce rol are câmpul `root` din linia de mai jos, aflată într-un fișier din `/etc/cron.d/`?',
    explanation: 'Fișierele de sistem au un câmp suplimentar: utilizatorul.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/etc/cron.d/curatenie', code: '15 3 * * * root /usr/local/bin/curata-tmp.sh' },
    options: [
      { id: 'a', text: 'Utilizatorul cu care se rulează comanda.', correct: true, why: 'În /etc/crontab și /etc/cron.d/* există un câmp utilizator între câmpurile de timp și comandă.' },
      { id: 'b', text: 'Prima parte a comenzii.', correct: false, why: 'Comanda este scriptul; root este câmpul de utilizator.' },
      { id: 'c', text: 'Directorul în care se execută.', correct: false, why: 'Directorul de lucru este, în general, home-ul utilizatorului; câmpul nu îl alege.' },
      { id: 'd', text: 'Un comentariu ignorat.', correct: false, why: 'Comentariile încep cu # și stau pe linie separată.' },
    ],
  },
  {
    id: 'L7.1-008', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Pornește imediat serviciul `atd` și activează-l la fiecare boot, cu o singură comandă.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl enable --now atd', 'systemctl enable atd --now', 'sudo systemctl enable --now atd', 'systemctl --now enable atd'],
    canonical: 'systemctl enable --now atd',
    explanation: '`enable` îl activează la boot; `--now` îl pornește și acum.',
    wrong: [
      { text: 'systemctl start atd', why: 'Pornește acum, dar nu persistă după reboot.' },
      { text: 'systemctl enable atd', why: 'Persistă la boot, dar nu pornește acum.' },
      { text: 'at start', why: 'Nu există o astfel de comandă; atd este un serviciu systemd.' },
    ],
  },
  {
    id: 'L7.1-009', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a programa cu cron un script `/usr/local/bin/raport.sh` în fiecare zi la 02:30.',
    explanation: 'Mai întâi scriptul funcțional, apoi programarea și verificarea.',
    items: [
      { text: 'creezi scriptul cu shebang și căi absolute', why: 'Fără un script corect nu are ce să ruleze cron.' },
      { text: '`chmod +x /usr/local/bin/raport.sh` și îl rulezi o dată manual', why: 'Testezi separat înainte să-l programezi.' },
      { text: '`crontab -e` și adaugi `30 2 * * * /usr/local/bin/raport.sh`', why: 'Linia cu cele 5 câmpuri și calea absolută.' },
      { text: '`crontab -l` pentru a confirma că tabela a fost salvată', why: 'Verifici că linia a fost instalată.' },
      { text: '`systemctl is-enabled crond` (și `enable --now` dacă e nevoie)', why: 'Fără daemon activat, linia nu se execută după reboot.' },
    ],
  },
  {
    id: 'L7.1-010', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Linia `30 4 1,15 * 5` într-un crontab rulează:',
    explanation: 'Când ambele câmpuri de zi sunt restricționate, se aplică SAU (crontab(5)).',
    options: [
      { id: 'a', text: 'La 04:30 pe 1 și 15 ale lunii ȘI în fiecare vineri.', correct: true, why: 'Zi-din-lună și zi-din-săptămână restricționate: job-ul rulează când oricare se potrivește.' },
      { id: 'b', text: 'Doar vinerile care cad pe 1 sau 15.', correct: false, why: 'Aceasta ar fi o condiție ȘI; cron aplică SAU.' },
      { id: 'c', text: 'Niciodată: câmpurile se contrazic.', correct: false, why: 'Linia este validă și are efect.' },
      { id: 'd', text: 'Doar pe 1 și 15, câmpul 5 fiind ignorat.', correct: false, why: 'Câmpul 5 (zi din săptămână) nu este ignorat.' },
    ],
  },
  {
    id: 'L7.1-011', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda cu rolul ei.',
    explanation: 'Gestiunea job-urilor at și a tabelelor cron folosește comenzi diferite.',
    leftLabel: 'Comandă', rightLabel: 'Rol',
    pairs: [
      { left: '`atq`', right: 'listează job-urile at în așteptare', why: 'Echivalent cu at -l.' },
      { left: '`atrm 3`', right: 'șterge job-ul at numărul 3', why: 'Echivalent cu at -r 3 / at -d 3.' },
      { left: '`at -c 3`', right: 'afișează conținutul job-ului 3', why: 'Afișează scriptul salvat, cu mediul.' },
      { left: '`crontab -r`', right: 'șterge întreaga tabelă cron a utilizatorului, fără confirmare', why: 'Cu -i cere confirmare.' },
    ],
    distractors: [{ text: 'repornește serviciul crond', why: 'crontab nu repornește serviciul; cron detectează singur modificările.' }],
  },
  {
    id: 'L7.1-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pe sistem există `/etc/at.allow` (cu linia `ana`) și `/etc/at.deny` (cu linia `student`). Utilizatorul `student` rulează `at now + 1 minute`. Ce se întâmplă?',
    explanation: 'Dacă at.allow există, at.deny nu mai contează (at.allow(5)).',
    options: [
      { id: 'a', text: 'Este refuzat: student nu este în at.allow.', correct: true, why: 'Cu at.allow prezent, pot folosi at doar cei listați în el.' },
      { id: 'b', text: 'Este permis: at.deny este ignorat, iar student nu e blocat explicit.', correct: false, why: 'at.deny este ignorat, dar at.allow limitează la cei listați; student nu este acolo.' },
      { id: 'c', text: 'Este permis, pentru că at.deny listează studentul doar ca avertisment.', correct: false, why: 'at.deny este o listă de blocare; dar nici nu mai este consultat aici.' },
      { id: 'd', text: 'Depinde de ordinea alfabetică a fișierelor.', correct: false, why: 'Regula este fixă: at.allow are prioritate.' },
    ],
  },
];
