import type { Lab } from '../../lab/types';

export const LAB_L3_1: Lab = {
  id: 'lab-l3-1-primul-script',
  lessonId: 'L3.1',
  title: 'Primul script: shebang, execuție și cod de ieșire',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Ți se cere un script `~/info.sh` care afișează numele utilizatorului și numele gazdei și care raportează prin codul de ieșire dacă fișierul `/etc/hostname` există (0 = există, 1 = lipsește).',
    'Sarcini: (1) creează scriptul cu shebang corect; (2) rulează-l mai întâi cu `bash`, apoi direct, observând ce se întâmplă fără bitul `x`; (3) fă-l executabil; (4) citește codul de ieșire; (5) copiază-l în `~/bin` și rulează-l fără `./` dacă directorul este în `PATH`.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), utilizator obișnuit cu un editor (`nano` sau `vim`).',
    'Fișierul `~/info.sh` nu există încă.',
  ],
  finalState: [
    '`~/info.sh` există, începe cu shebang, are permisiune de execuție și se termină cu codul 0 când `/etc/hostname` există.',
  ],
  criteria: [
    { id: 'ac1', text: 'Prima linie a fișierului este `#!/bin/bash`.', manualCheck: 'head -1 ~/info.sh' },
    { id: 'ac2', text: 'Fișierul are bit de execuție pentru proprietar.', manualCheck: 'ls -l ~/info.sh' },
    { id: 'ac3', text: 'Rularea directă afișează utilizatorul și gazda.', manualCheck: '~/info.sh' },
    { id: 'ac4', text: 'Codul de ieșire este 0 când `/etc/hostname` există.', manualCheck: '~/info.sh; echo $?' },
    { id: 'ac5', text: 'Ai observat codul 126 la rularea fără bit `x`.', manualCheck: 'chmod -x ~/info.sh; ~/info.sh; echo $?' },
  ],
  steps: [
    {
      title: 'Scrie scriptul',
      purpose: 'Creezi fișierul cu shebang, comentariu și comenzi.',
      hint: 'Shebang-ul trebuie să fie pe prima linie, fără spații înainte.',
      commands: 'nano ~/info.sh',
      explain: [
        ['nano ~/info.sh', 'deschide editorul; scrie conținutul de mai jos, apoi Ctrl+O, Enter (salvează), Ctrl+X (ieși).'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\n# Afișează utilizatorul și gazda; cod 0 dacă /etc/hostname există\nwhoami\nhostname\nif [ -e /etc/hostname ]; then\n  exit 0\nelse\n  exit 1\nfi', explain: 'Conținutul scriptului (nu e un output de comandă). `if` este explicat în L3.3; aici contează shebang-ul și `exit`.' },
    },
    {
      title: 'Rulează prin bash, apoi direct',
      purpose: 'Vezi diferența dintre „citit de bash” și „executat direct”.',
      hint: 'Fără `x`, rularea directă dă „Permission denied”.',
      commands: 'ls -l ~/info.sh\nbash ~/info.sh\n~/info.sh\necho $?',
      explain: [
        ['ls -l ~/info.sh', 'arată permisiunile (de obicei fără x pentru un fișier nou).'],
        ['bash ~/info.sh', 'merge, pentru că bash doar citește fișierul.'],
        ['~/info.sh', 'încearcă rularea directă; fără x eșuează.'],
        ['echo $?', 'imediat după eșec: codul 126 (comandă găsită, dar neexecutabilă).'],
      ],
      output: { label: 'illustrative', code: 'student\nserver1.example.com\nbash: /home/student/info.sh: Permission denied\n126', explain: 'Primele două linii vin de la `bash ~/info.sh`; apoi eroarea rulării directe și codul ei. Numele sunt exemple.' },
      reflect: 'De ce a mers `bash ~/info.sh` fără bit de execuție?',
    },
    {
      title: 'Fă-l executabil și rulează',
      purpose: 'Adaugi bitul x și confirmi codul de ieșire.',
      hint: '`chmod +x` apoi `echo $?` imediat după rulare.',
      commands: 'chmod +x ~/info.sh\nls -l ~/info.sh\n~/info.sh\necho $?',
      explain: [
        ['chmod +x ~/info.sh', 'adaugă permisiunea de execuție.'],
        ['ls -l ~/info.sh', 'acum apare x în permisiuni (de ex. -rwxr-xr-x).'],
        ['~/info.sh', 'rulează direct, folosind shebang-ul.'],
        ['echo $?', 'așteptat: 0.'],
      ],
    },
    {
      title: 'Verifică ramura de eroare',
      purpose: 'Demonstrezi că scriptul raportează 1 când fișierul lipsește (fără a șterge ceva real).',
      hint: 'Copiază scriptul și schimbă calea testată într-una inexistentă.',
      commands: "sed 's#/etc/hostname#/nu-exista#' ~/info.sh > ~/info-test.sh\nchmod +x ~/info-test.sh\n~/info-test.sh\necho $?\nrm ~/info-test.sh",
      explain: [
        ["sed 's#/etc/hostname#/nu-exista#' ~/info.sh > ~/info-test.sh", 'sed înlocuiește textul (# este separator, ca să nu se încurce cu /); rezultatul merge în alt fișier (L1.5, redirecționare).'],
        ['chmod +x ~/info-test.sh', 'îl face executabil.'],
        ['~/info-test.sh; echo $?', 'așteptat: se afișează utilizatorul și gazda, apoi $? = 1.'],
        ['rm ~/info-test.sh', 'curăță fișierul de test.'],
      ],
    },
    {
      title: 'Pune scriptul în PATH',
      purpose: 'Îl rulezi fără ./.',
      hint: 'Verifică mai întâi dacă ~/bin este în PATH.',
      commands: 'echo $PATH\nmkdir -p ~/bin\ncp ~/info.sh ~/bin/\ncommand -v info.sh',
      explain: [
        ['echo $PATH', 'caută ~/bin sau /home/utilizator/bin în listă.'],
        ['mkdir -p ~/bin; cp ~/info.sh ~/bin/', 'creează directorul și copiază scriptul.'],
        ['command -v info.sh', 'dacă afișează o cale, shell-ul îl găsește; dacă nu, ~/bin nu e în PATH în sesiunea curentă (deschide o sesiune nouă sau rulează cu cale completă).'],
      ],
    },
  ],
  verification: [
    { cmd: 'head -1 ~/info.sh', expected: '#!/bin/bash' },
    { cmd: 'ls -l ~/info.sh', expected: 'permisiuni cu x (de ex. -rwxr-xr-x)' },
    { cmd: '~/info.sh; echo $?', expected: 'două linii (utilizator, gazdă), apoi 0' },
  ],
  persistence: [
    'Fișierul și permisiunile persistă după reboot.',
    'Confirmare manuală după reboot: `ls -l ~/info.sh` și `~/info.sh; echo $?`.',
  ],
  mistakes: [
    'Shebang pe altă linie decât prima.',
    'Uiți `chmod +x` și rulezi `./info.sh`.',
    'Citești `$?` după alte comenzi.',
    'Salvezi fișierul cu terminatori de linie Windows.',
  ],
  troubleshooting: [
    { symptom: '`Permission denied`', cause: 'lipsește bitul x', fix: '`chmod +x ~/info.sh` sau rulează cu `bash ~/info.sh`.' },
    { symptom: '`bad interpreter: No such file or directory`', cause: 'shebang cu cale greșită sau CRLF', fix: '`head -1 ~/info.sh | cat -A`; corectează linia.' },
    { symptom: '`command not found` la `info.sh`', cause: 'directorul nu este în PATH', fix: 'rulează `~/info.sh` sau mută scriptul într-un director din PATH.' },
  ],
  alternatives: [
    'Poți rula `bash ~/info.sh` fără bit x.',
    'Poți folosi `chmod 755 ~/info.sh` în loc de `chmod +x`.',
    'Poți folosi `vim` în loc de `nano`.',
  ],
};
