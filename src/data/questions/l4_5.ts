import type { Question } from '../../lib/types';

const T = 'L4.5';
const O = ['C4-5'];

export const Q_L4_5: Question[] = [
  {
    id: 'L4.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce prioritate relativă are un proces cu valoarea [[nice-value]] 19 față de unul cu 0?',
    explanation: 'Nice mare = „amabil” = prioritate mică. Intervalul este -20 (cea mai mare prioritate) … 19 (cea mai mică).',
    options: [
      { id: 'a', text: 'Mai mică: cedează CPU proceselor cu nice mai mic.', correct: true, why: 'Un nice mai mare înseamnă mai puțin timp de procesor când există concurență.' },
      { id: 'b', text: 'Mai mare: 19 este cea mai mare prioritate.', correct: false, why: 'Este exact invers: -20 este prioritatea maximă.' },
      { id: 'c', text: 'Aceeași: nice nu influențează planificarea.', correct: false, why: 'Nice este ponderea folosită de planificator.' },
      { id: 'd', text: 'Procesul nu mai poate rula.', correct: false, why: 'Un nice mare doar reduce partea de CPU; procesul tot rulează.' },
    ],
  },
  {
    id: 'L4.5-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Pornește `tar -czf /tmp/backup.tar.gz /etc` cu nice 10.',
    prompt: '[student@server1 ~]$',
    answers: ['nice -n 10 tar -czf /tmp/backup.tar.gz /etc', 'nice -n10 tar -czf /tmp/backup.tar.gz /etc', 'nice --adjustment=10 tar -czf /tmp/backup.tar.gz /etc'],
    canonical: 'nice -n 10 tar -czf /tmp/backup.tar.gz /etc',
    explanation: '`nice -n 10 comandă` pornește comanda cu nice 0+10.',
    wrong: [
      { text: 'renice -n 10 tar -czf /tmp/backup.tar.gz /etc', why: '`renice` schimbă nice-ul unui proces EXISTENT (după PID); nu pornește comenzi.' },
      { text: 'tar -czf /tmp/backup.tar.gz /etc nice -n 10', why: '`nice` trebuie să fie înaintea comenzii; altfel devine argument pentru `tar`.' },
      { text: 'nice 10 tar -czf /tmp/backup.tar.gz /etc', why: 'Fără `-n`, `10` ar fi interpretat ca nume de comandă.' },
    ],
  },
  {
    id: 'L4.5-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Procesul cu PID 4321 rulează deja. Setează-i nice 15 cu `renice`.',
    prompt: '[student@server1 ~]$',
    answers: ['renice -n 15 -p 4321', 'renice -n 15 4321', 'renice 15 4321', 'renice 15 -p 4321'],
    canonical: 'renice -n 15 -p 4321',
    explanation: '`renice -n VALOARE -p PID` setează noul nice al unui proces existent. Un utilizator obișnuit poate doar să îl crească.',
    wrong: [
      { text: 'nice -n 15 -p 4321', why: '`nice` pornește comenzi noi; nu modifică procese existente.' },
      { text: 'renice -p 4321', why: 'Lipsește noua valoare; renice nu știe ce nice să seteze.' },
      { text: 'kill -15 4321', why: '`-15` este SIGTERM, nu nice 15: ar opri procesul.' },
    ],
  },
  {
    id: 'L4.5-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Utilizatorul `student` (fără drepturi de root) rulează `renice -n -5 -p 4321` pe propriul proces. Ce se întâmplă?',
    explanation: 'Doar root poate scădea nice-ul (crește prioritatea) sau seta valori negative.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ renice -n -5 -p 4321\nrenice: failed to set priority for 4321 (process ID): Permission denied' },
    options: [
      { id: 'a', text: 'Eșuează: un utilizator obișnuit nu poate scădea nice-ul; are nevoie de root (`sudo`).', correct: true, why: 'Creșterea priorității este privilegiată, ca utilizatorii să nu își favorizeze propriile procese în detrimentul altora.' },
      { id: 'b', text: 'Reușește, pentru că procesul îi aparține.', correct: false, why: 'Proprietatea procesului nu e suficientă pentru a scădea nice-ul.' },
      { id: 'c', text: 'Procesul este oprit.', correct: false, why: 'renice nu trimite semnale; doar încearcă să schimbe nice-ul.' },
      { id: 'd', text: 'Nice -5 nu există.', correct: false, why: 'Valorile negative există (până la -20), dar sunt rezervate lui root.' },
    ],
  },
  {
    id: 'L4.5-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care proces primește cel mai mult CPU (la concurență pe același nucleu)?',
    explanation: 'Cel cu nice-ul cel mai mic (cea mai mare prioritate): -10, deoarece este rulat de root.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# ps -eo pid,user,ni,pri,%cpu,cmd --sort=-%cpu | head -4\n  PID USER      NI PRI %CPU CMD\n 3001 root     -10  29 70.2 backup\n 3002 student   0  19 20.1 yes\n 3003 student  19   0  4.9 yes' },
    options: [
      { id: 'a', text: 'PID 3001 (NI = -10).', correct: true, why: 'Nice-ul cel mai mic înseamnă cea mai mare pondere; este și primul în %CPU.' },
      { id: 'b', text: 'PID 3003 (NI = 19).', correct: false, why: '19 este cea mai mică prioritate.' },
      { id: 'c', text: 'PID 3002 (NI = 0).', correct: false, why: 'Valoarea 0 este implicită, dar mai puțin favorizată decât -10.' },
      { id: 'd', text: 'Toate trei la fel.', correct: false, why: 'Nice-ul diferit produce părți diferite de CPU, exact ce arată %CPU.' },
    ],
  },
  {
    id: 'L4.5-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un script de backup ar trebui să nu încetinească serverul în orele de lucru. Cum îl pornești?',
    explanation: 'Folosești un nice pozitiv, mare: scriptul cedează CPU celorlalte procese, dar rulează.',
    snippet: { kind: 'find-error', title: 'cron (idee)', code: '0 10 * * * nice -n -10 /usr/local/bin/backup.sh' },
    options: [
      { id: 'a', text: 'Cu nice pozitiv, de exemplu `nice -n 15 /usr/local/bin/backup.sh`.', correct: true, why: 'Nice pozitiv reduce prioritatea; backup-ul nu mai concurează agresiv cu serviciile.' },
      { id: 'b', text: 'Cu nice negativ (`nice -n -10`), ca să se termine repede.', correct: false, why: 'Un nice negativ ar favoriza backup-ul, adică exact invers; în plus cere root.' },
      { id: 'c', text: 'Cu `kill -STOP` în orele de vârf.', correct: false, why: 'Ar opri complet scriptul, nu doar i-ar reduce prioritatea.' },
      { id: 'd', text: 'Nu există nicio soluție.', correct: false, why: 'Soluția este exact `nice`/`renice`.' },
    ],
  },
  {
    id: 'L4.5-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre nice sunt adevărate? (alege toate cele corecte)',
    explanation: 'Nice este o pondere relativă, moștenită de copii, modificabilă după pornire.',
    options: [
      { id: 'a', text: 'Intervalul este de la -20 la 19; implicit 0.', correct: true, why: 'Valorile sunt cele din nice(1).' },
      { id: 'b', text: 'Un proces nou moștenește nice-ul părintelui.', correct: true, why: 'De aceea o comandă pornită dintr-un shell cu nice 10 va avea și ea 10.' },
      { id: 'c', text: 'Are efect vizibil mai ales când procesele concurează pentru același CPU.', correct: true, why: 'Pe un procesor liber, un nice mare nu încetinește nimic.' },
      { id: 'd', text: 'Nice limitează procentul maxim de CPU pe care îl poate folosi un proces.', correct: false, why: 'Nice este o pondere, nu o limită; un proces cu nice 19 poate folosi 100% dacă nimeni altcineva nu cere CPU.' },
    ],
  },
  {
    id: 'L4.5-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda sau tasta cu efectul ei.',
    explanation: 'Unele instrumente pornesc procese cu un anumit nice, altele modifică procese existente.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`nice -n 10 comandă`', right: 'pornește un proces nou cu nice 10', why: 'Nice se aplică la pornire.' },
      { left: '`renice -n 5 -p PID`', right: 'schimbă nice-ul unui proces care rulează', why: '`-p` desemnează PID-ul.' },
      { left: '`ps -o pid,ni,cmd`', right: 'afișează nice-ul proceselor', why: 'Coloana `ni` este valoarea nice.' },
      { left: '`r` în top', right: 'cere PID-ul și o valoare nice nouă', why: 'Echivalentul interactiv al lui renice.' },
    ],
    distractors: [{ text: 'oprește procesul', why: 'Oprirea se face cu semnale (L4.4).' }],
  },
  {
    id: 'L4.5-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a reduce impactul unui proces consumator de CPU, fără să îl oprești.',
    explanation: 'Identifici, verifici nice-ul curent, modifici, confirmi.',
    items: [
      { text: '`ps -eo pid,user,ni,%cpu,cmd --sort=-%cpu | head`', why: 'Găsești PID-ul și vezi nice-ul actual.' },
      { text: '`renice -n 15 -p PID`', why: 'Reduci prioritatea fără oprire.' },
      { text: '`ps -o pid,ni,%cpu,cmd -p PID`', why: 'Confirmi noul nice.' },
      { text: '`uptime`', why: 'Observi dacă load average-ul scade în timp.' },
    ],
  },
];
