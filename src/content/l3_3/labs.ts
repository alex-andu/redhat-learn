import type { Lab } from '../../lab/types';

export const LAB_L3_3: Lab = {
  id: 'lab-l3-3-conditii',
  lessonId: 'L3.3',
  title: 'Decizii în script: if, test, [ ], && și case',
  modes: ['guided', 'independent'],
  objectives: ['C3-1'],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Scrie `~/verifica.sh`, care primește o cale ca prim argument și afișează: `FIȘIER` dacă este fișier obișnuit, `DIRECTOR` dacă este director, `INEXISTENT` altfel. Fără argument, afișează `Folosire: …` pe stderr și iese cu 1. Pentru fișiere, adaugă linia `GOL` dacă fișierul are dimensiune zero.',
    'Scrie apoi `~/radacina.sh`, care iese cu mesaj de eroare și cod 1 dacă nu este rulat ca root și, ca root, afișează `Ești root`.',
    'Scrie în final `~/comanda.sh`, care primește `start`, `stop` sau altceva și răspunde cu `case`.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), utilizator cu `sudo`.',
    'Scripturile `~/verifica.sh`, `~/radacina.sh`, `~/comanda.sh` nu există.',
  ],
  finalState: [
    'Cele trei scripturi sunt executabile și se comportă conform scenariului.',
  ],
  criteria: [
    { id: 'ac1', text: '`verifica.sh /etc/passwd` afișează FIȘIER.', manualCheck: '~/verifica.sh /etc/passwd' },
    { id: 'ac2', text: '`verifica.sh /etc` afișează DIRECTOR.', manualCheck: '~/verifica.sh /etc' },
    { id: 'ac3', text: '`verifica.sh /nu-exista` afișează INEXISTENT.', manualCheck: '~/verifica.sh /nu-exista' },
    { id: 'ac4', text: 'Fără argument: cod 1 și mesaj pe stderr.', manualCheck: '~/verifica.sh 2>/dev/null; echo $?' },
    { id: 'ac5', text: '`radacina.sh` ca utilizator obișnuit iese cu 1; cu sudo afișează „Ești root”.', manualCheck: '~/radacina.sh; echo $?; sudo ~/radacina.sh' },
    { id: 'ac6', text: '`comanda.sh start` și `stop` răspund diferit, iar alt cuvânt dă cod 1.', manualCheck: '~/comanda.sh start; ~/comanda.sh x; echo $?' },
  ],
  steps: [
    {
      title: 'Scrie verifica.sh',
      purpose: 'Folosești if/elif/else cu -f, -d, -s și verificarea argumentului.',
      hint: 'Ordine: mai întâi argumentul (-z), apoi -f, -d, altfel.',
      commands: 'nano ~/verifica.sh\nchmod +x ~/verifica.sh',
      explain: [
        ['nano ~/verifica.sh', 'scrie conținutul de mai jos.'],
        ['chmod +x ~/verifica.sh', 'îl face executabil.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nif [ -z "$1" ]; then\n  echo "Folosire: $0 CALE" >&2\n  exit 1\nfi\nif [ -f "$1" ]; then\n  echo "FIȘIER"\n  if [ ! -s "$1" ]; then\n    echo "GOL"\n  fi\nelif [ -d "$1" ]; then\n  echo "DIRECTOR"\nelse\n  echo "INEXISTENT"\nfi', explain: 'Conținutul scriptului. `-z "$1"` prinde lipsa argumentului; `-f`/`-d` deosebesc fișierul de director; `! -s` înseamnă „gol sau inexistent”, dar aici fișierul există deja, deci înseamnă „gol”.' },
    },
    {
      title: 'Testează cazurile',
      purpose: 'Parcurgi fiecare ramură.',
      hint: 'Creează un fișier gol cu `touch`.',
      commands: '~/verifica.sh /etc/passwd\n~/verifica.sh /etc\n~/verifica.sh /nu-exista\ntouch /tmp/gol.txt\n~/verifica.sh /tmp/gol.txt\n~/verifica.sh; echo $?',
      explain: [
        ['~/verifica.sh /etc/passwd', 'fișier obișnuit.'],
        ['touch /tmp/gol.txt', 'creează un fișier gol (dimensiune zero).'],
        ['~/verifica.sh /tmp/gol.txt', 'FIȘIER, apoi GOL.'],
        ['~/verifica.sh; echo $?', 'fără argument: mesaj, apoi 1.'],
      ],
      output: { label: 'illustrative', code: 'FIȘIER\nDIRECTOR\nINEXISTENT\nFIȘIER\nGOL\nFolosire: /home/student/verifica.sh CALE\n1', explain: 'Fiecare linie corespunde unei ramuri; ultimele două: mesajul de folosire (stderr) și codul 1.' },
    },
    {
      title: 'Scrie radacina.sh',
      purpose: 'Verifici că scriptul rulează ca root.',
      hint: '`id -u` întoarce 0 pentru root; folosește-l cu $( ).',
      commands: 'nano ~/radacina.sh\nchmod +x ~/radacina.sh\n~/radacina.sh; echo $?\nsudo ~/radacina.sh; echo $?',
      explain: [
        ['id -u', 'afișează UID-ul efectiv; 0 = root.'],
        ['sudo ~/radacina.sh', 'rulează scriptul cu drepturi de root: UID 0.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nif [ "$(id -u)" -ne 0 ]; then\n  echo "Rulează ca root (sudo)." >&2\n  exit 1\nfi\necho "Ești root"', explain: 'Conținutul scriptului: `$(id -u)` este înlocuit cu numărul; `-ne` este comparație numerică.' },
    },
    {
      title: 'Scrie comanda.sh cu case',
      purpose: 'Alegi între mai multe valori.',
      hint: 'Nu uita `;;` și `esac`.',
      commands: 'nano ~/comanda.sh\nchmod +x ~/comanda.sh\n~/comanda.sh start\n~/comanda.sh stop\n~/comanda.sh altceva; echo $?',
      explain: [
        ['~/comanda.sh start / stop', 'ramurile potrivite.'],
        ['~/comanda.sh altceva; echo $?', 'ramura `*)`: mesaj de folosire și cod 1.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\ncase "$1" in\n  start) echo "pornesc" ;;\n  stop)  echo "opresc" ;;\n  *)     echo "Folosire: $0 start|stop" >&2; exit 1 ;;\nesac', explain: 'Conținutul scriptului. `*)` este ramura implicită, `;;` încheie fiecare ramură.' },
      reflect: 'Ce s-ar întâmpla dacă ai uita `;;` după `start)`?',
    },
  ],
  verification: [
    { cmd: '~/verifica.sh /etc', expected: 'DIRECTOR' },
    { cmd: '~/radacina.sh; echo $?', expected: 'mesajul de eroare, apoi 1 (ca utilizator obișnuit)' },
    { cmd: '~/comanda.sh x 2>/dev/null; echo $?', expected: '1' },
    { cmd: 'bash -n ~/verifica.sh ~/radacina.sh ~/comanda.sh', expected: 'fără output (sintaxă corectă)' },
  ],
  persistence: [
    'Scripturile și permisiunile persistă după reboot.',
    'Confirmare manuală după reboot: `ls -l ~/*.sh` și rularea fiecărui caz.',
  ],
  mistakes: [
    'Lipsesc spațiile în jurul `[` și `]`.',
    'Variabile fără ghilimele în teste.',
    'Compari numere cu `=` sau text cu `-eq`.',
    'Uiți `fi`, `then`, `;;` sau `esac`.',
  ],
  troubleshooting: [
    { symptom: '`syntax error: unexpected end of file`', cause: 'lipsește `fi` sau `esac`', fix: '`bash -n script.sh`; închide blocul.' },
    { symptom: '`[: too many arguments`', cause: 'variabilă fără ghilimele care conține spații', fix: 'folosește `"$1"`.' },
    { symptom: '`./verifica.sh: Permission denied`', cause: 'lipsește bitul x', fix: '`chmod +x`.' },
  ],
  alternatives: [
    'Poți folosi `[[ ]]` în loc de `[ ]` în bash.',
    'Poți scrie `test -f "$1"` în locul `[ -f "$1" ]`.',
    'Poți testa rădăcina cu `[ "$EUID" -eq 0 ]` (variabilă bash).',
  ],
};
