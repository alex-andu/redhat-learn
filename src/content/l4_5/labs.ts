import type { Lab } from '../../lab/types';

export const LAB_L4_5: Lab = {
  id: 'lab-l4-5-nice-renice',
  lessonId: 'L4.5',
  title: 'Pornește și ajustează procese cu nice și renice',
  modes: ['guided', 'independent'],
  objectives: ['C4-5'],
  difficulty: 2,
  estimatedMinutes: 30,
  scenario: [
    'Un proces de backup consumator de CPU încetinește serverul. Simulează situația cu două procese `yes`, fixate pe același nucleu CPU: unul cu prioritate normală și unul pornit cu `nice -n 15`. Observă împărțirea CPU.',
    'Apoi redu prioritatea procesului normal cu `renice`, încearcă să o crești înapoi ca utilizator obișnuit (va eșua), apoi folosește `sudo` și, la final, oprește procesele.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), cont obișnuit cu drept `sudo` pentru un pas.',
    '`taskset` (din util-linux) disponibil — fixează procesele pe același nucleu, ca să concureze realist.',
    'Pe sistem nu rulează sarcini importante; procesele de test consumă un nucleu CPU.',
  ],
  finalState: [
    'Procesele de test au fost observate cu valori nice diferite, nice-ul unuia a fost modificat cu `renice`, iar la final toate sunt oprite.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai pornit un proces cu `nice -n 15` și ai verificat NI = 15.', manualCheck: 'ps -eo pid,ni,%cpu,cmd | grep "[y]es"' },
    { id: 'ac2', text: 'Ai observat că procesul cu nice 0 primește mai mult %CPU decât cel cu nice 15 (pe același nucleu).', manualCheck: 'ps -eo pid,ni,%cpu,cmd --sort=-%cpu | head -4' },
    { id: 'ac3', text: 'Ai schimbat nice-ul unui proces existent cu `renice -n 10 -p PID` și ai confirmat.', manualCheck: 'ps -o pid,ni -p PID' },
    { id: 'ac4', text: 'Ai constatat că un utilizator obișnuit nu poate scădea nice-ul, dar `sudo renice` poate.', manualCheck: 'renice -n 0 -p PID; sudo renice -n 0 -p PID' },
    { id: 'ac5', text: 'Ai oprit toate procesele de test.', manualCheck: 'pgrep -a yes' },
  ],
  steps: [
    {
      title: 'Pornește două procese concurente pe același nucleu',
      purpose: 'Nice contează când procesele concurează; fixarea pe CPU 0 garantează concurența.',
      hint: '`taskset -c 0` limitează procesul la nucleul 0. Procesul cu nice normal pornește primul.',
      commands: 'taskset -c 0 yes > /dev/null &\ntaskset -c 0 nice -n 15 yes > /dev/null &\njobs -l',
      explain: [
        ['taskset -c 0 …', 'rulează comanda doar pe nucleul CPU numărul 0 (afinitate CPU).'],
        ['nice -n 15 yes', '`nice` pornește `yes` cu nice 15: prioritate mică.'],
        ['> /dev/null', 'aruncă output-ul infinit al lui `yes`.'],
        ['&', 'în fundal.'],
        ['jobs -l', 'listează joburile cu PID-urile lor (-l = long).'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ jobs -l\n[1]- 5001 Running                 taskset -c 0 yes > /dev/null &\n[2]+ 5002 Running                 taskset -c 0 nice -n 15 yes > /dev/null &', explain: 'PID-urile (5001, 5002) sunt exemple. Atenție: PID-ul afișat poate fi al lui `taskset`, care își înlocuiește imaginea; verifică cu `ps`.' },
    },
    {
      title: 'Observă nice-ul și împărțirea CPU',
      purpose: 'Vezi efectul concret al nice.',
      hint: 'După câteva secunde, procesul cu nice 0 trebuie să aibă un %CPU mult mai mare.',
      commands: 'sleep 5\nps -eo pid,ni,pri,%cpu,cmd --sort=-%cpu | head -4\ntop -b -n 1 | head -12',
      explain: [
        ['ps -eo pid,ni,pri,%cpu,cmd', 'coloane: PID, NI (nice), PRI (prioritatea calculată), %CPU, comandă.'],
        ['top -b -n 1', 'o singură afișare în mod batch; coloanele PR/NI sunt prioritatea și nice-ul.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ ps -eo pid,ni,pri,%cpu,cmd --sort=-%cpu | head -3\n  PID  NI PRI %CPU CMD\n 5001   0  19 93.4 yes\n 5002  15   4  5.1 yes', explain: 'Ambele rulează pe același nucleu: cel cu nice 0 primește aproape tot timpul. Procentele sunt orientative.' },
      reflect: 'Ce s-ar fi întâmplat dacă procesele ar fi rulat pe nuclee diferite? De ce?',
    },
    {
      title: 'Schimbă nice-ul unui proces existent',
      purpose: 'Folosești renice pe un proces care deja rulează.',
      hint: 'Folosește PID-ul procesului cu nice 0 (cel „nenorocos”).',
      commands: 'renice -n 10 -p 5001\nps -o pid,ni,%cpu,cmd -p 5001\nrenice -n 0 -p 5001',
      explain: [
        ['renice -n 10 -p 5001', '-n = noul nice, -p = PID-ul. Crește nice-ul: este permis oricui pentru procesele proprii.'],
        ['renice -n 0 -p 5001', 'încearcă să îl readuci la 0: ca utilizator obișnuit va eșua.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ renice -n 10 -p 5001\n5001 (process ID) old priority 0, new priority 10\n[student@server1 ~]$ renice -n 0 -p 5001\nrenice: failed to set priority for 5001 (process ID): Permission denied', explain: 'Creșterea nice-ului merge; scăderea cere privilegii. Textul exact al mesajelor poate diferi.' },
    },
    {
      title: 'Scade nice-ul cu sudo',
      purpose: 'Vezi că doar root poate crește prioritatea.',
      hint: 'După sudo, valoarea revine la 0.',
      commands: 'sudo renice -n 0 -p 5001\nps -o pid,ni,cmd -p 5001',
      explain: [
        ['sudo renice -n 0 -p 5001', 'rulează renice ca root; poate scădea nice-ul (și seta valori negative).'],
      ],
    },
    {
      title: 'Oprește procesele',
      purpose: 'Lași sistemul curat.',
      hint: '`pkill yes` oprește toate procesele cu numele „yes”.',
      commands: 'pkill yes\nsleep 1\npgrep -a yes\njobs',
      explain: [
        ['pkill yes', 'trimite SIGTERM proceselor al căror nume este `yes` (L4.4).'],
        ['pgrep -a yes', 'confirmă că nu a rămas niciunul.'],
      ],
    },
  ],
  verification: [
    { cmd: 'ps -eo pid,ni,%cpu,cmd --sort=-%cpu | head -4', expected: 'procesul cu nice mai mic are %CPU mai mare (cât timp rulează ambele)' },
    { cmd: 'ps -o pid,ni -p PID', expected: 'valoarea NI cerută' },
    { cmd: 'pgrep -a yes', expected: 'niciun rezultat' },
  ],
  persistence: [
    'Nice-ul unui proces NU persistă: dispare cu procesul, iar la repornire serviciul/comanda pornește cu valorile implicite.',
    'Pentru ca un serviciu systemd să pornească mereu cu un anumit nice, se folosește `Nice=` în unitate (menționat; nu face parte din acest laborator).',
  ],
  mistakes: [
    'Folosirea lui `nice` pentru un proces existent (se folosește `renice`).',
    'Folosirea `renice` fără `-p` / PID.',
    'Confuzia semnului: nice mare = prioritate mică.',
    'Rularea testului pe procese pe nuclee diferite și concluzia că nice „nu funcționează”.',
  ],
  troubleshooting: [
    { symptom: '`Permission denied` la renice', cause: 'încerci să scazi nice-ul fără drepturi', fix: 'folosește `sudo`.' },
    { symptom: 'ambele procese au ~100% CPU', cause: 'rulează pe nuclee diferite', fix: 'fixează-le pe același nucleu cu `taskset -c 0`.' },
    { symptom: '`taskset: command not found`', cause: 'util-linux lipsește (rar)', fix: 'continuă fără el; observația va depinde de numărul de nuclee.' },
  ],
  alternatives: [
    'Poți porni un `yes` cu `nice -n 15` și altul normal fără `taskset` pe o VM cu un singur vCPU.',
    'În `top`, tasta `r` cere PID-ul și noul nice.',
    'Pentru toate procesele unui utilizator: `renice -n 5 -u student`.',
  ],
};
