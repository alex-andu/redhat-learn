import type { Lab } from '../../lab/types';

export const LAB_L4_4: Lab = {
  id: 'lab-l4-4-procese-kill',
  lessonId: 'L4.4',
  title: 'Găsește procesul care consumă CPU și oprește-l',
  modes: ['guided', 'independent'],
  objectives: ['C4-4'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Sistemul „e lent”. Vei simula problema pornind două procese de test în fundal (unul consumator de CPU, unul care ignoră SIGTERM). Identifică-le cu `ps` și `top`, oprește-l pe primul cu semnalul potrivit, apoi oprește-l și pe al doilea care nu răspunde la cererea politicoasă.',
    'Apoi oprește, după nume, toate procesele `sleep` pornite pentru test.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), shell bash, cont obișnuit (nu e nevoie de root pentru procesele proprii).',
    'Nu rulează nimic important sub contul tău; procesele de test sunt create de tine și sigure de oprit.',
  ],
  finalState: [
    'Procesele `yes` și cel cu `trap` nu mai rulează; procesele `sleep` de test au fost oprite după nume.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai identificat procesul `yes` ca cel mai consumator de CPU și ai notat PID-ul.', manualCheck: 'ps -eo pid,user,%cpu,cmd --sort=-%cpu | head -5' },
    { id: 'ac2', text: 'Ai oprit procesul `yes` cu SIGTERM (`kill PID`).', manualCheck: 'pgrep -a yes' },
    { id: 'ac3', text: 'Procesul care ignoră SIGTERM a rămas activ după `kill PID` și ai folosit `kill -9`.', manualCheck: 'pgrep -af "trap"' },
    { id: 'ac4', text: 'Ai oprit toate procesele `sleep` de test cu `pkill` sau `killall`.', manualCheck: 'pgrep -a sleep' },
    { id: 'ac5', text: 'Nu a rămas niciun proces de test în fundal.', manualCheck: 'jobs; ps -u $USER -o pid,stat,cmd' },
  ],
  steps: [
    {
      title: 'Pornește procesele de test',
      purpose: 'Creezi o situație controlată, ca să ai ce diagnostica.',
      hint: '`&` la final pune comanda în fundal. `yes > /dev/null` produce output la infinit și consumă un nucleu CPU.',
      commands: 'yes > /dev/null &\nbash -c \'trap "" TERM; while true; do sleep 1; done\' &\nsleep 600 &\nsleep 601 &\njobs',
      explain: [
        ['yes > /dev/null &', '`yes` scrie „y” continuu; `> /dev/null` aruncă output-ul; `&` îl trimite în fundal. Consumă aproape 100% dintr-un nucleu.'],
        ['bash -c \'trap "" TERM; …\' &', 'un shell care ignoră SIGTERM (`trap "" TERM`) și bucle la nesfârșit; simulează un program care nu se oprește la cerere.'],
        ['sleep 600 &', 'așteaptă 10 minute, în fundal; proces inofensiv, pentru exercițiul cu `pkill`.'],
        ['jobs', 'listează joburile din fundal ale acestui shell, cu numerele [1], [2]…'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ yes > /dev/null &\n[1] 4321\n[student@server1 ~]$ bash -c \'trap "" TERM; while true; do sleep 1; done\' &\n[2] 4322\n[student@server1 ~]$ sleep 600 &\n[3] 4323\n[student@server1 ~]$ sleep 601 &\n[4] 4324', explain: '`[1]` este numărul jobului; `4321` este PID-ul procesului. PID-urile tale vor fi altele.' },
    },
    {
      title: 'Identifică procesul consumator',
      purpose: 'Găsești vinovatul după CPU și memorie, nu după presupuneri.',
      hint: 'În `top`: `P` = ordonare după CPU, `M` = după memorie, `q` = ieșire.',
      commands: 'ps -eo pid,user,%cpu,%mem,cmd --sort=-%cpu | head -6\ntop -b -n 1 | head -15\nuptime',
      explain: [
        ['ps -eo pid,user,%cpu,%mem,cmd', '-e = toate procesele; -o = coloane alese.'],
        ['--sort=-%cpu', 'ordonează descrescător după CPU.'],
        ['| head -6', 'antetul plus primele cinci procese.'],
        ['top -b -n 1', '-b = mod batch (fără interfață interactivă), -n 1 = o singură actualizare; potrivit pentru pipe. Pentru modul interactiv, rulează doar `top`.'],
        ['uptime', 'load average-ul pe 1, 5 și 15 minute.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ ps -eo pid,user,%cpu,%mem,cmd --sort=-%cpu | head -4\n  PID USER     %CPU %MEM CMD\n 4321 student  97.8  0.0 yes\n  812 root       0.3  0.6 /usr/sbin/NetworkManager --no-daemon', explain: '`yes` este în vârf, la ~98% CPU. Valorile sunt exemple.' },
      reflect: 'De ce trebuie să te uiți și la %MEM, nu doar la %CPU? Ce proces ar apărea în vârf dacă ai ordona după memorie?',
    },
    {
      title: 'Oprește procesul cu SIGTERM',
      purpose: 'Încerci mai întâi oprirea ordonată.',
      hint: 'Folosește PID-ul tău din pasul anterior. Verifică înainte să trimiți semnalul.',
      commands: 'ps -p 4321 -o pid,user,cmd\nkill 4321\nsleep 1\npgrep -a yes',
      explain: [
        ['ps -p 4321 -o pid,user,cmd', '-p = doar acest PID; confirmi că este procesul dorit.'],
        ['kill 4321', 'trimite SIGTERM (15), semnalul implicit.'],
        ['pgrep -a yes', '-a afișează și linia de comandă; nu trebuie să mai găsești nimic (sau doar un job „Terminated” în shell).'],
      ],
    },
    {
      title: 'Forțează procesul care ignoră SIGTERM',
      purpose: 'Observi că SIGTERM poate fi ignorat și folosești SIGKILL.',
      hint: 'Încearcă mai întâi `kill PID` (nu va merge), apoi `kill -9 PID`.',
      commands: 'pgrep -af "trap"\nkill 4322\nsleep 1\nps -p 4322\nkill -9 4322\nsleep 1\nps -p 4322',
      explain: [
        ['pgrep -af "trap"', '-a = afișează comanda, -f = caută în linia completă (nu doar în numele procesului); găsește shell-ul cu trap.'],
        ['kill 4322', 'SIGTERM: este ignorat de procesul cu `trap ""`.'],
        ['kill -9 4322', 'SIGKILL: nu poate fi ignorat; kernelul oprește procesul.'],
        ['ps -p 4322', 'cu doar antetul în output, procesul a dispărut.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ kill 4322\n[student@server1 ~]$ ps -p 4322\n  PID TTY          TIME CMD\n 4322 pts/0    00:00:00 bash\n[student@server1 ~]$ kill -9 4322\n[1]+  Killed                  bash -c \'trap "" TERM; while true; do sleep 1; done\'\n[student@server1 ~]$ ps -p 4322\n  PID TTY          TIME CMD', explain: 'După `kill` procesul încă apare; după `kill -9` shell-ul raportează „Killed” și `ps -p` arată doar antetul.' },
    },
    {
      title: 'Oprește procesele după nume',
      purpose: 'Folosești pkill/killall când nu vrei să cauți PID-uri.',
      hint: '`pgrep -a sleep` arată ce ar fi potrivit; abia apoi `pkill`.',
      commands: 'pgrep -a sleep\npkill sleep\npgrep -a sleep\njobs\nps -u $USER -o pid,stat,cmd',
      explain: [
        ['pgrep -a sleep', 'listează procesele al căror nume conține „sleep”; verifici ce urmează să fie oprit.'],
        ['pkill sleep', 'trimite SIGTERM tuturor proceselor potrivite (aici, ambele sleep). Folosește `-u utilizator` ca să limitezi.'],
        ['ps -u $USER -o pid,stat,cmd', '-u = procesele unui utilizator; verifici că nu a rămas nimic neașteptat.'],
      ],
    },
  ],
  verification: [
    { cmd: 'pgrep -a yes', expected: 'niciun rezultat' },
    { cmd: 'pgrep -af trap', expected: 'niciun rezultat' },
    { cmd: 'pgrep -a sleep', expected: 'niciun rezultat' },
    { cmd: 'jobs', expected: 'niciun job activ (poate apărea „Terminated” pentru cele oprite)' },
  ],
  persistence: [
    'Procesele nu persistă: dispar la oprire sau reboot; nu există configurare de păstrat.',
    'Un proces oprit cu `kill` nu reapare singur, decât dacă este gestionat de un serviciu systemd (L4.9), caz în care se oprește serviciul, nu procesul.',
  ],
  mistakes: [
    '`kill -9` ca prim reflex: procesul nu curăță nimic (fișiere temporare, blocări).',
    'Ucis PID-ul greșit: verifică înainte cu `ps -p PID`.',
    '`pkill` cu un nume prea general (de ex. `pkill bash`).',
    'Uitarea ordonării descrescătoare (`--sort=%cpu` vs `--sort=-%cpu`).',
    'Încercarea de a ucide procesele altor utilizatori fără `sudo`.',
  ],
  troubleshooting: [
    { symptom: '`Operation not permitted`', cause: 'procesul aparține altui utilizator', fix: 'rulează cu `sudo` (dacă ai dreptul) după ce confirmi PID-ul.' },
    { symptom: '`No such process`', cause: 'PID greșit sau procesul s-a oprit deja', fix: 'reia `ps`/`pgrep` și verifică PID-ul.' },
    { symptom: 'procesul rămâne în `ps` cu STAT=Z', cause: 'zombie: părintele nu i-a citit starea', fix: 'oprește sau repară părintele (PPID din `ps -o ppid`).' },
    { symptom: 'procesul reapare imediat după kill', cause: 'este repornit de un serviciu systemd', fix: '`systemctl stop SERVICIU` (L4.9).' },
  ],
  alternatives: [
    'Poți folosi `killall yes` în loc de `kill PID`.',
    'În `top`, tasta `k` cere PID-ul și semnalul; `q` iese.',
    'Pentru ordonarea după memorie: `ps -eo pid,user,%mem,cmd --sort=-%mem | head`.',
    'Pentru un proces din fundal al shell-ului curent: `kill %1` (după numărul jobului).',
  ],
};
