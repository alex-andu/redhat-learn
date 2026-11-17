import type { Lab } from '../../lab/types';

export const LAB_L3_4: Lab = {
  id: 'lab-l3-4-bucle-for',
  lessonId: 'L3.4',
  title: 'Bucle for: fișiere, argumente și citire rând cu rând',
  modes: ['guided', 'independent'],
  objectives: ['C3-2'],
  difficulty: 2,
  estimatedMinutes: 45,
  scenario: [
    'Într-un director de test `~/exercitiu` ai fișiere `.txt` (unul cu spațiu în nume). Redenumește-le pe toate adăugând sufixul `.bak`, fără să atingi alte fișiere.',
    'Scrie `~/afiseaza.sh`, care primește oricâte argumente și, pentru fiecare, afișează `NUME: fișier, N linii` sau `NUME: nu este fișier obișnuit`. Fără argumente, iese cu 1.',
    'Scrie `~/lista.sh`, care citește un fișier rând cu rând (primit ca argument) și afișează `NR: linie`, apoi `Total: N linii`.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), shell bash.',
    'Directorul `~/exercitiu` nu există sau este gol; scripturile nu există.',
  ],
  finalState: [
    'În `~/exercitiu` fișierele `.txt` au sufixul `.bak`; `nota.log` este neatins.',
    '`~/afiseaza.sh` și `~/lista.sh` sunt executabile și funcționează conform scenariului.',
  ],
  criteria: [
    { id: 'ac1', text: 'Toate fișierele `.txt` din `~/exercitiu` au devenit `.txt.bak`, inclusiv cel cu spațiu.', manualCheck: 'ls ~/exercitiu' },
    { id: 'ac2', text: '`nota.log` nu a fost modificat.', manualCheck: 'ls ~/exercitiu/nota.log' },
    { id: 'ac3', text: '`afiseaza.sh` tratează corect un argument cu spațiu.', manualCheck: '~/afiseaza.sh "~/exercitiu/c d.txt.bak" /etc/passwd /etc' },
    { id: 'ac4', text: '`afiseaza.sh` fără argumente iese cu 1.', manualCheck: '~/afiseaza.sh 2>/dev/null; echo $?' },
    { id: 'ac5', text: '`lista.sh` păstrează rândul cu spațiu întreg și numără corect.', manualCheck: '~/lista.sh ~/exercitiu/nume.lst' },
  ],
  steps: [
    {
      title: 'Pregătește directorul de test',
      purpose: 'Creezi fișierele pe care le vei prelucra.',
      hint: 'Folosește ghilimele pentru numele cu spațiu.',
      commands: 'mkdir -p ~/exercitiu\ncd ~/exercitiu\ntouch a.txt b.txt "c d.txt" nota.log\nprintf \'ana\\nbogdan\\nana maria\\n\' > nume.lst\nls',
      explain: [
        ['mkdir -p ~/exercitiu; cd ~/exercitiu', 'creează și intră în directorul de test.'],
        ['touch a.txt b.txt "c d.txt" nota.log', 'fișiere goale; ghilimelele păstrează „c d.txt” ca un singur nume.'],
        ["printf 'ana\\nbogdan\\nana maria\\n' > nume.lst", 'scrie trei linii în fișierul nume.lst (\\n = linie nouă).'],
      ],
      output: { label: 'illustrative', code: 'a.txt  b.txt  c d.txt  nota.log  nume.lst', explain: 'Cele cinci fișiere create (ordinea poate diferi după locale).' },
    },
    {
      title: 'Previzualizează cu echo, apoi redenumește',
      purpose: 'Vezi ce ar face bucla înainte să schimbi ceva.',
      hint: 'Pune `echo` înaintea lui `mv` la prima rulare.',
      commands: 'for f in *.txt; do echo mv "$f" "$f.bak"; done\nfor f in *.txt; do mv "$f" "$f.bak"; done\nls',
      explain: [
        ['for f in *.txt', 'lista = fișierele .txt (3 elemente); nota.log și nume.lst nu se potrivesc.'],
        ['echo mv "$f" "$f.bak"', 'afișează comanda în loc să o execute: verificare sigură.'],
        ['mv "$f" "$f.bak"', 'redenumirea reală; ghilimelele protejează numele cu spațiu.'],
      ],
      output: { label: 'illustrative', code: 'a.txt.bak  b.txt.bak  c d.txt.bak  nota.log  nume.lst', explain: 'Rezultatul după redenumire; `nota.log` și `nume.lst` neatinse.' },
      reflect: 'Ce s-ar fi întâmplat cu „c d.txt” dacă scriai `mv $f $f.bak` fără ghilimele?',
    },
    {
      title: 'Scrie afiseaza.sh',
      purpose: 'Folosești for pe "$@", if și $( ).',
      hint: 'Testează mai întâi $#; apoi parcurge "$@".',
      commands: 'nano ~/afiseaza.sh\nchmod +x ~/afiseaza.sh\n~/afiseaza.sh ~/exercitiu/"c d.txt.bak" /etc/passwd /etc\n~/afiseaza.sh; echo $?',
      explain: [
        ['"c d.txt.bak"', 'ghilimelele (dacă scrii calea completă între ghilimele) mențin un singur argument; în script, "$@" păstrează granița.'],
        ['~/afiseaza.sh; echo $?', 'fără argumente: mesajul de folosire și codul 1.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nif [ $# -eq 0 ]; then\n  echo "Folosire: $0 FIȘIER..." >&2\n  exit 1\nfi\nfor f in "$@"; do\n  if [ -f "$f" ]; then\n    echo "$f: fișier, $(wc -l < "$f") linii"\n  else\n    echo "$f: nu este fișier obișnuit"\n  fi\ndone', explain: 'Conținutul scriptului (nu un output de comandă).' },
    },
    {
      title: 'Scrie lista.sh',
      purpose: 'Citești un fișier rând cu rând cu while read.',
      hint: 'Redirecționează fișierul la `done`, nu printr-un pipe.',
      commands: 'nano ~/lista.sh\nchmod +x ~/lista.sh\n~/lista.sh ~/exercitiu/nume.lst',
      explain: [
        ['~/lista.sh ~/exercitiu/nume.lst', 'trebuie să afișeze trei linii numerotate, apoi totalul.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nfisier="$1"\nnr=0\nwhile IFS= read -r linie; do\n  nr=$((nr + 1))\n  echo "$nr: $linie"\ndone < "$fisier"\necho "Total: $nr linii"', explain: 'Conținutul scriptului. `done < "$fisier"` dă fișierul ca intrare; `nr` rămâne vizibil după buclă (fără subshell).' },
    },
  ],
  verification: [
    { cmd: 'ls ~/exercitiu', expected: 'a.txt.bak, b.txt.bak, c d.txt.bak, nota.log, nume.lst' },
    { cmd: '~/afiseaza.sh /etc/passwd /etc', expected: 'o linie „fișier, N linii” și o linie „nu este fișier obișnuit”' },
    { cmd: '~/lista.sh ~/exercitiu/nume.lst', expected: '1: ana / 2: bogdan / 3: ana maria / Total: 3 linii' },
  ],
  persistence: [
    'Redenumirile și scripturile persistă după reboot; variabilele buclei nu.',
    'Confirmare manuală după reboot: `ls ~/exercitiu` și rularea scripturilor.',
  ],
  mistakes: [
    'Variabila buclei fără ghilimele (`mv $f …`).',
    'Uiți `do` sau `done`.',
    'Folosești `for f in $(ls)`.',
    'Citești fișierul prin `cat | while` și pierzi valoarea contorului.',
  ],
  troubleshooting: [
    { symptom: 'Fișierul cu spațiu a fost „împărțit”', cause: 'lipsesc ghilimelele din jurul `$f`', fix: 'folosește `"$f"`.' },
    { symptom: '`syntax error: unexpected end of file`', cause: 'lipsește `done`', fix: '`bash -n script.sh`.' },
    { symptom: 'Bucla rulează cu valoarea `*.txt`', cause: 'nicio potrivire (glob rămas literal)', fix: 'verifică directorul curent și numele.' },
  ],
  alternatives: [
    'Pentru redenumire poți folosi `for f in *.txt; do mv -- "$f" "${f}.bak"; done` (`--` = sfârșitul opțiunilor).',
    'Pentru lista de fișiere poți folosi `find` cu `-exec` (nu face parte din C3).',
    'Bucla poate fi `for ((i=1; i<=$#; i++))` dacă ai nevoie de index.',
  ],
};
