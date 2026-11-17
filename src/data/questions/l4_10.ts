import type { Question } from '../../lib/types';

const T = 'L4.10';
const O = ['C4-10'];

export const Q_L4_10: Question[] = [
  {
    id: 'L4.10-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'De ce sunt `scp`, `sftp` și [[rsync]] (peste SSH) considerate transfer „sigur”?',
    explanation: 'Folosesc SSH: autentificare și criptare, ca la o sesiune `ssh`.',
    options: [
      { id: 'a', text: 'Traficul trece prin SSH, deci este autentificat și criptat.', correct: true, why: 'Parolele și datele nu circulă în clar.' },
      { id: 'b', text: 'Fișierele sunt arhivate cu parolă automat.', correct: false, why: 'Nu există arhivare cu parolă implicită; protecția este a canalului.' },
      { id: 'c', text: 'Folosesc FTP, care este criptat.', correct: false, why: 'FTP clasic nu este criptat; SFTP nu este FTP.' },
      { id: 'd', text: 'Transferă numai fișiere mici.', correct: false, why: 'Mărimea nu are legătură cu securitatea.' },
    ],
  },
  {
    id: 'L4.10-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Copiază fișierul local `raport.txt` în `/tmp` pe serverul `server2`, ca utilizatorul `student`.',
    prompt: '[student@server1 ~]$',
    answers: ['scp raport.txt student@server2:/tmp/', 'scp raport.txt student@server2:/tmp', 'scp ./raport.txt student@server2:/tmp/', 'scp ./raport.txt student@server2:/tmp'],
    canonical: 'scp raport.txt student@server2:/tmp/',
    explanation: 'Forma: `scp SURSĂ utilizator@gazdă:DESTINAȚIE`. Fără `:` după gazdă, ar fi o copie locală.',
    wrong: [
      { text: 'scp raport.txt student@server2', why: 'Lipsește `:` și calea; scp ar crea un fișier local numit `student@server2`.' },
      { text: 'scp student@server2:/tmp/ raport.txt', why: 'Ordinea este inversată: ar încerca să descarce din server2 în fișierul local.' },
      { text: 'ssh raport.txt student@server2:/tmp/', why: '`ssh` nu copiază fișiere; folosește `scp`, `sftp` sau `rsync`.' },
    ],
  },
  {
    id: 'L4.10-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Copiază recursiv directorul `proiect` de pe `server2` (utilizator `student`, calea `/home/student/proiect`) în directorul curent.',
    prompt: '[student@server1 ~]$',
    answers: ['scp -r student@server2:/home/student/proiect .', 'scp -r student@server2:/home/student/proiect ./', 'scp -r student@server2:~/proiect .'],
    canonical: 'scp -r student@server2:/home/student/proiect .',
    explanation: '`-r` copiază directoare recursiv; destinația `.` este directorul curent.',
    wrong: [
      { text: 'scp student@server2:/home/student/proiect .', why: 'Fără `-r`, scp refuză un director (not a regular file).' },
      { text: 'scp -r student@server2:/home/student/proiect', why: 'Lipsește destinația locală (de exemplu `.`); scp nu are unde să copieze.' },
      { text: 'scp -r . student@server2:/home/student/proiect', why: 'Ordinea este inversată: ar încărca directorul curent în loc să descarce.' },
    ],
  },
  {
    id: 'L4.10-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Serverul SSH ascultă pe portul 2222. Cum copiezi un fișier cu `scp`?',
    explanation: '`scp` folosește `-P` (majusculă) pentru port, spre deosebire de `ssh -p`.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ scp -p 2222 raport.txt student@server2:/tmp/' },
    options: [
      { id: 'a', text: '`scp -P 2222 raport.txt student@server2:/tmp/` (P majusculă).', correct: true, why: 'În scp, `-p` păstrează timpii și modurile; portul se dă cu `-P`.' },
      { id: 'b', text: '`scp -p 2222 …` este corect, doar serverul e oprit.', correct: false, why: 'Aici `-p` este altă opțiune, iar `2222` devine un nume de fișier de copiat, deci comanda nu face ce vrei.' },
      { id: 'c', text: '`scp raport.txt student@server2:2222/tmp/`', correct: false, why: 'Portul nu se pune în cale în acest fel.' },
      { id: 'd', text: '`scp --port=22 …`', correct: false, why: 'Nu există o opțiune `--port`.' },
    ],
  },
  {
    id: 'L4.10-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii unei sesiuni [[sftp-session]]: descarci `jurnal.log` din `/var/tmp` de pe server și încarci `config.txt`.',
    explanation: 'Te conectezi, navighezi pe server, descarci, încarci și ieși.',
    items: [
      { text: '`sftp student@server2`', why: 'Deschizi sesiunea (autentificare SSH).' },
      { text: '`cd /var/tmp`', why: 'Navighezi în directorul remote.' },
      { text: '`get jurnal.log`', why: 'Descarci în directorul local curent.' },
      { text: '`put config.txt`', why: 'Încarci din directorul local curent.' },
      { text: '`bye`', why: 'Închizi sesiunea.' },
    ],
  },
  {
    id: 'L4.10-006', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Sincronizează conținutul directorului local `~/date/` în `/backup/date/` pe `server2` (utilizator `student`), păstrând permisiunile și timpii, cu output detaliat.',
    prompt: '[student@server1 ~]$',
    answers: ['rsync -av ~/date/ student@server2:/backup/date/', 'rsync -av ~/date/ student@server2:/backup/date', 'rsync -va ~/date/ student@server2:/backup/date/', 'rsync -a -v ~/date/ student@server2:/backup/date/'],
    canonical: 'rsync -av ~/date/ student@server2:/backup/date/',
    explanation: '`-a` = mod arhivă (recursiv, permisiuni, timpi, legături), `-v` = detaliat. Slash-ul final al sursei copiază conținutul.',
    wrong: [
      { text: 'rsync ~/date/ student@server2:/backup/date/', why: 'Fără `-a` (sau `-r`), rsync sare peste directoare („skipping directory”).' },
      { text: 'rsync -av student@server2:/backup/date/ ~/date/', why: 'Sensul este inversat: ar aduce datele de pe server pe mașina locală.' },
      { text: 'rsync -av ~/date student@server2:/backup/date/', why: 'Fără slash final, ar crea `/backup/date/date/` (directorul în sine), nu conținutul.' },
    ],
  },
  {
    id: 'L4.10-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rulezi prima dată un `rsync --delete` între două directoare importante. Care este cea mai prudentă primă comandă?',
    explanation: '`--dry-run` (`-n`) arată ce ar face rsync fără să modifice nimic; esențial cu `--delete`.',
    options: [
      { id: 'a', text: '`rsync -avn --delete sursa/ destinatia/`', correct: true, why: '`-n` simulează; vezi ce ar fi șters înainte de a rula pe bune.' },
      { id: 'b', text: '`rsync -av --delete sursa/ destinatia/`', correct: false, why: 'Rulează direct; fișierele din destinație care lipsesc la sursă sunt șterse.' },
      { id: 'c', text: '`rsync -av --delete sursa destinatia/`', correct: false, why: 'Lipsa slash-ului final poate imbrica directorul și produce o stare neașteptată.' },
      { id: 'd', text: '`cp -r sursa destinatia`', correct: false, why: '`cp` nu transferă prin SSH și nu cere nimic de siguranță.' },
    ],
  },
  {
    id: 'L4.10-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce arată această ieșire?',
    explanation: 'Linia cu `*deleting` arată ce ar fi șters rsync; cu `-n` nu s-a șters nimic.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ rsync -avn --delete ~/date/ student@server2:/backup/date/\nsending incremental file list\n*deleting   vechi.log\nnota.txt\n\nsent 120 bytes  received 25 bytes  290.00 bytes/sec\ntotal size is 4,096  speedup is 28.25 (DRY RUN)' },
    options: [
      { id: 'a', text: 'Simulare: `vechi.log` ar fi șters din destinație, `nota.txt` ar fi transferat; nu s-a modificat nimic (DRY RUN).', correct: true, why: '`-n` + `(DRY RUN)` la final; `*deleting` marchează ștergerea care ar urma.' },
      { id: 'b', text: '`vechi.log` a fost șters deja.', correct: false, why: 'Este o simulare; nimic nu s-a modificat.' },
      { id: 'c', text: 'Transferul a eșuat.', correct: false, why: 'Nu apare niciun mesaj de eroare.' },
      { id: 'd', text: '`nota.txt` a fost șters.', correct: false, why: 'Un fișier ce apare fără `*deleting` este unul care ar fi transferat.' },
    ],
  },
  {
    id: 'L4.10-009', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre alegerea între `scp`, `sftp` și `rsync` sunt adevărate? (alege toate cele corecte)',
    explanation: '`scp` pentru copii simple, `sftp` pentru răsfoire interactivă, `rsync` pentru sincronizare și reluare.',
    options: [
      { id: 'a', text: '`rsync` transferă doar diferențele, deci este eficient la repetiții.', correct: true, why: 'Compară sursa cu destinația și trimite ce lipsește sau s-a schimbat.' },
      { id: 'b', text: '`sftp` permite să navighezi și să alegi interactiv ce transferi.', correct: true, why: 'Are `ls`, `cd`, `get`, `put`.' },
      { id: 'c', text: '`scp` este potrivit pentru o copie simplă, de la un capăt la altul.', correct: true, why: 'Sintaxă scurtă, fără stare.' },
      { id: 'd', text: '`rsync` funcționează peste SSH fără ca `rsync` să fie instalat pe server.', correct: false, why: 'Programul `rsync` trebuie să existe și pe serverul remote.' },
    ],
  },
  {
    id: 'L4.10-010', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu efectul ei.',
    explanation: 'Fiecare comandă are un rol precis în transferul de fișiere.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`scp -r dir user@host:/tmp/`', right: 'copiază recursiv un director pe server', why: '`-r` = recursiv.' },
      { left: '`sftp> get fisier`', right: 'descarcă din server în directorul local curent', why: 'Opusul este `put`.' },
      { left: '`sftp> lcd /tmp`', right: 'schimbă directorul LOCAL', why: '`l` = local; `cd` schimbă directorul remote.' },
      { left: '`rsync -avz src/ user@host:dst/`', right: 'sincronizează cu compresie în timpul transferului', why: '`-z` = compresie.' },
    ],
    distractors: [{ text: 'schimbă parola serverului', why: 'Nicio comandă de aici nu modifică parole.' }],
  },
];
