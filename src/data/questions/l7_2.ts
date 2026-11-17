import type { Question } from '../../lib/types';

const T = 'L7.2';
const O = ['C7-1'];

export const Q_L7_2: Question[] = [
  {
    id: 'L7.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce rol are un fișier `backup.timer` față de `backup.service`?',
    explanation: 'Timer-ul decide CÂND; serviciul decide CE se execută.',
    options: [
      { id: 'a', text: 'Timer-ul pornește la momentul programat serviciul cu același nume; serviciul conține comanda.', correct: true, why: 'Un timer nu execută comenzi, doar activează o altă unitate (systemd.timer(5)).' },
      { id: 'b', text: 'Timer-ul conține comanda și serviciul conține ora.', correct: false, why: 'Invers: comanda (ExecStart=) este în .service.' },
      { id: 'c', text: 'Sunt două fișiere identice, necesare doar la boot.', correct: false, why: 'Au roluri diferite: unul declanșează, celălalt execută.' },
      { id: 'd', text: 'Timer-ul înlocuiește complet nevoia de serviciu.', correct: false, why: 'Fără serviciu, timer-ul nu are ce să activeze.' },
    ],
  },
  {
    id: 'L7.2-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Activează timer-ul `backup.timer` să pornească la boot și pornește-l imediat, cu o singură comandă.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl enable --now backup.timer', 'systemctl enable backup.timer --now', 'sudo systemctl enable --now backup.timer', 'systemctl --now enable backup.timer'],
    canonical: 'systemctl enable --now backup.timer',
    explanation: '`enable` armează la boot; `--now` îl armează și acum. Se activează timer-ul, nu serviciul.',
    wrong: [
      { text: 'systemctl enable --now backup.service', why: 'Activează serviciul, nu timer-ul: nu programezi nimic.' },
      { text: 'systemctl start backup.timer', why: 'Pornește acum, dar nu persistă după reboot.' },
      { text: 'systemctl enable backup.timer', why: 'Persistă la boot, dar nu îl armează acum.' },
    ],
  },
  {
    id: 'L7.2-003', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce comandă listează timerele active și momentul următoarei lor declanșări?',
    explanation: '`systemctl list-timers` afișează NEXT, LEFT, LAST, PASSED, UNIT, ACTIVATES.',
    options: [
      { id: 'a', text: '`systemctl list-timers`', correct: true, why: 'Arată timerele și următoarea declanșare.' },
      { id: 'b', text: '`crontab -l`', correct: false, why: 'Listează tabela cron, nu timerele systemd.' },
      { id: 'c', text: '`atq`', correct: false, why: 'Listează job-urile at în așteptare.' },
      { id: 'd', text: '`systemctl list-units --type=service`', correct: false, why: 'Listează serviciile, nu timerele.' },
    ],
  },
  {
    id: 'L7.2-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce înseamnă `OnCalendar=Mon..Fri 08:30`?',
    explanation: 'Zilele se scriu în engleză; intervalul se notează cu `..` (systemd.time(7)).',
    options: [
      { id: 'a', text: 'De luni până vineri, la 08:30.', correct: true, why: 'Mon..Fri este un interval de zile; ora se completează cu :00 secunde.' },
      { id: 'b', text: 'Doar luni și vineri, la 08:30.', correct: false, why: 'Pentru doar luni și vineri s-ar scrie Mon,Fri; .. înseamnă interval.' },
      { id: 'c', text: 'La fiecare 8 ore și 30 de minute.', correct: false, why: 'Aceasta ar fi un timer monoton (OnUnitActiveSec).' },
      { id: 'd', text: 'Expresia este invalidă fiindcă lipsesc secundele.', correct: false, why: 'Secundele omise devin :00.' },
    ],
  },
  {
    id: 'L7.2-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai creat `backup.service` și `backup.timer` în `/etc/systemd/system/`, dar `systemctl enable --now backup.timer` spune că unitatea nu există. Care este primul pas?',
    explanation: 'systemd trebuie să recitească fișierele de unitate.',
    options: [
      { id: 'a', text: '`systemctl daemon-reload`', correct: true, why: 'Fără el, systemd nu vede unitățile noi sau modificate.' },
      { id: 'b', text: '`reboot`', correct: false, why: 'Ar funcționa, dar este inutil: daemon-reload este suficient.' },
      { id: 'c', text: '`systemctl enable backup.service`', correct: false, why: 'Se activează timer-ul; și problema este că unitatea nu e încă citită.' },
      { id: 'd', text: 'Ștergi timer-ul și îl recreezi cu alt nume.', correct: false, why: 'Numele nu este problema.' },
    ],
  },
  {
    id: 'L7.2-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce este greșit în unitatea de mai jos?',
    explanation: 'Fără `[Install]` și `WantedBy=timers.target`, `enable` nu are unde să lege timer-ul.',
    snippet: { kind: 'find-error', title: '/etc/systemd/system/backup.timer', code: '[Unit]\nDescription=Backup\n\n[Timer]\nOnCalendar=*-*-* 02:30:00\nPersistent=true' },
    options: [
      { id: 'a', text: 'Lipsește secțiunea `[Install]` cu `WantedBy=timers.target`; `enable` nu ar putea activa timer-ul la boot.', correct: true, why: 'enable citește [Install]; fără el apare un mesaj că unitatea nu are configurație de instalare.' },
      { id: 'b', text: 'Persistent=true nu este permis cu OnCalendar.', correct: false, why: 'Tocmai OnCalendar este cazul în care Persistent are efect.' },
      { id: 'c', text: 'Timer-ul trebuie să conțină ExecStart=.', correct: false, why: 'ExecStart este în .service, nu în .timer.' },
      { id: 'd', text: 'Ora trebuie scrisă cu AM/PM.', correct: false, why: 'Formatul este 24 h.' },
    ],
  },
  {
    id: 'L7.2-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'După o rulare reușită, `systemctl status backup.service` arată `Active: inactive (dead)` și `status=0/SUCCESS`. Ce înseamnă?',
    explanation: 'Serviciile `Type=oneshot` rulează și se termină; starea „dead” între rulări este normală.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'systemctl status backup.service', code: '○ backup.service - Copie de siguranta pentru /etc\n     Loaded: loaded (/etc/systemd/system/backup.service; static)\n     Active: inactive (dead) since Mon 2026-11-16 14:25:10 EET; 8s ago\n   Main PID: 4107 (code=exited, status=0/SUCCESS)' },
    options: [
      { id: 'a', text: 'Comanda a rulat și s-a încheiat cu succes; este starea normală pentru oneshot.', correct: true, why: 'status=0/SUCCESS = cod de ieșire 0; „dead” înseamnă doar că nu mai rulează.' },
      { id: 'b', text: 'Serviciul a eșuat.', correct: false, why: 'Un eșec ar arăta „failed” și un cod diferit de 0.' },
      { id: 'c', text: 'Serviciul nu a pornit niciodată.', correct: false, why: 'Există un PID și un moment („since”).' },
      { id: 'd', text: 'Timer-ul nu este activ.', correct: false, why: 'Starea timer-ului se verifică cu systemctl status backup.timer.' },
    ],
  },
  {
    id: 'L7.2-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre următoarele sunt timere MONOTONE (nu calendaristice)?',
    explanation: 'Timerele monotone se măsoară față de un reper: boot, activarea timer-ului, activarea/dezactivarea unității.',
    options: [
      { id: 'a', text: '`OnBootSec=`', correct: true, why: 'Se măsoară de la boot.' },
      { id: 'b', text: '`OnUnitActiveSec=`', correct: true, why: 'Se măsoară de la ultima activare a serviciului.' },
      { id: 'c', text: '`OnActiveSec=`', correct: true, why: 'Se măsoară de la activarea timer-ului.' },
      { id: 'd', text: '`OnCalendar=`', correct: false, why: 'Folosește data și ora reale, deci este un timer realtime/calendaristic.' },
    ],
  },
  {
    id: 'L7.2-009', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează următoarele 3 momente de rulare pentru expresia `Mon..Fri 08:30`, cu un utilitar systemd.',
    prompt: '[student@server1 ~]$',
    answers: ['systemd-analyze calendar --iterations=3 "Mon..Fri 08:30"', 'systemd-analyze calendar --iterations=3 \'Mon..Fri 08:30\'', 'systemd-analyze calendar --iterations 3 "Mon..Fri 08:30"'],
    canonical: 'systemd-analyze calendar --iterations=3 "Mon..Fri 08:30"',
    explanation: '`systemd-analyze calendar` normalizează expresia; `--iterations=N` arată N momente.',
    wrong: [
      { text: 'systemctl list-timers "Mon..Fri 08:30"', why: 'list-timers arată timerele existente, nu analizează o expresie.' },
      { text: 'crontab -l "Mon..Fri 08:30"', why: 'crontab nu primește expresii și nu folosește sintaxa systemd.' },
      { text: 'systemd-analyze calendar Mon..Fri 08:30', why: 'Fără ghilimele, shell-ul desparte expresia în două argumente și lipsește --iterations=3.' },
    ],
  },
  {
    id: 'L7.2-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a programa un serviciu `report.service` zilnic la 03:00 cu systemd.',
    explanation: 'Serviciul și timer-ul se creează, systemd le citește, apoi se activează timer-ul și se verifică.',
    items: [
      { text: 'creezi `/etc/systemd/system/report.service` (Type=oneshot, ExecStart=cale absolută)', why: 'Definește CE rulează.' },
      { text: 'creezi `/etc/systemd/system/report.timer` cu OnCalendar și [Install]', why: 'Definește CÂND și cum se activează.' },
      { text: '`systemctl daemon-reload`', why: 'systemd citește fișierele noi.' },
      { text: '`systemctl enable --now report.timer`', why: 'Armează timer-ul acum și la boot.' },
      { text: '`systemctl list-timers` și `systemctl start report.service` pentru test', why: 'Verifici NEXT și testezi serviciul fără să aștepți ora.' },
    ],
  },
  {
    id: 'L7.2-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un laptop este oprit zilnic la 02:00. Ce setare face ca un job `OnCalendar=*-*-* 02:30:00` să ruleze la următoarea pornire?',
    explanation: '`Persistent=true` recuperează o singură dată rularea ratată (systemd.timer(5)); doar pentru OnCalendar.',
    options: [
      { id: 'a', text: '`Persistent=true` în secțiunea `[Timer]`.', correct: true, why: 'systemd salvează ultimul moment de declanșare și recuperează o rulare ratată la activare.' },
      { id: 'b', text: '`AccuracySec=1us`', correct: false, why: 'Controlează precizia, nu recuperarea.' },
      { id: 'c', text: '`RandomizedDelaySec=1h`', correct: false, why: 'Împrăștie declanșările; nu recuperează rularea ratată.' },
      { id: 'd', text: '`Type=oneshot` în `.timer`.', correct: false, why: 'Type= este directivă de .service, nu a unui timer.' },
    ],
  },
  {
    id: 'L7.2-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește directiva cu efectul ei.',
    explanation: 'Fiecare directivă răspunde la o întrebare diferită despre momentul de rulare.',
    leftLabel: 'Directivă', rightLabel: 'Efect',
    pairs: [
      { left: '`OnBootSec=10min`', right: 'rulează la 10 minute după boot', why: 'Reper: boot-ul.' },
      { left: '`OnUnitActiveSec=1h`', right: 'rulează la 1 oră de la ultima activare a serviciului', why: 'Reper: ultima activare a unității.' },
      { left: '`Persistent=true`', right: 'recuperează o rulare OnCalendar ratată', why: 'Doar pentru OnCalendar; o singură dată.' },
      { left: '`Unit=altceva.service`', right: 'schimbă serviciul pornit de timer', why: 'Altfel se pornește serviciul cu același nume.' },
    ],
    distractors: [{ text: 'dezactivează timer-ul la boot', why: 'Dezactivarea se face cu systemctl disable.' }],
  },
];
