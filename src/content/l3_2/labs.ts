import type { Lab } from '../../lab/types';

export const LAB_L3_2: Lab = {
  id: 'lab-l3-2-parametri',
  lessonId: 'L3.2',
  title: 'Script care primește argumente: $1, $2, $#, "$@"',
  modes: ['guided', 'independent'],
  objectives: ['C3-3'],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Scrie scriptul `~/salut.sh` care primește un nume ca prim argument și, opțional, un salut ca al doilea. Dacă nu primește niciun argument, afișează `Folosire: ./salut.sh NUME [SALUT]` pe stderr și iese cu codul 1. Dacă salutul lipsește, folosește valoarea implicită `Salut`.',
    'Scrie apoi `~/numara.sh`, care afișează câte argumente a primit și le afișează pe fiecare între paranteze drepte, pe linii separate, astfel încât un argument cu spații („ana maria”) să rămână o singură linie.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), editor `nano` sau `vim`.',
    'Fișierele `~/salut.sh` și `~/numara.sh` nu există.',
  ],
  finalState: [
    '`~/salut.sh` și `~/numara.sh` sunt executabile și se comportă conform scenariului.',
  ],
  criteria: [
    { id: 'ac1', text: '`./salut.sh ana` afișează `Salut, ana!`.', manualCheck: '~/salut.sh ana' },
    { id: 'ac2', text: '`./salut.sh ana Bună` afișează `Bună, ana!`.', manualCheck: '~/salut.sh ana Bună' },
    { id: 'ac3', text: 'Fără argumente, scriptul iese cu cod 1 și mesajul merge pe stderr.', manualCheck: '~/salut.sh 2>/dev/null; echo $?' },
    { id: 'ac4', text: '`numara.sh` afișează numărul corect pentru `a "b c" d` (3).', manualCheck: '~/numara.sh a "b c" d' },
    { id: 'ac5', text: 'Argumentul cu spațiu apare pe o singură linie.', manualCheck: '~/numara.sh "ana maria" | wc -l' },
  ],
  steps: [
    {
      title: 'Scrie salut.sh',
      purpose: 'Folosești $#, $1, $2 și valoare implicită.',
      hint: 'Testează mai întâi $#, apoi folosește ${2:-Salut}.',
      commands: 'nano ~/salut.sh\nchmod +x ~/salut.sh',
      explain: [
        ['nano ~/salut.sh', 'scrie conținutul de mai jos.'],
        ['chmod +x ~/salut.sh', 'îl face executabil (L3.1).'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nif [ $# -lt 1 ]; then\n  echo "Folosire: $0 NUME [SALUT]" >&2\n  exit 1\nfi\nsalut="${2:-Salut}"\necho "$salut, $1!"', explain: 'Conținutul scriptului. `[ $# -lt 1 ]` verifică lipsa argumentelor; `${2:-Salut}` dă valoarea implicită; mesajul de eroare merge pe stderr cu `>&2`.' },
    },
    {
      title: 'Testează toate cazurile',
      purpose: 'Rulezi cu două argumente, unul și zero, și citești codul de ieșire.',
      hint: 'Citește $? imediat după comanda testată.',
      commands: "~/salut.sh ana\n~/salut.sh ana Bună\n~/salut.sh \"ana maria\"\n~/salut.sh; echo $?\n~/salut.sh 2>/dev/null; echo $?",
      explain: [
        ['~/salut.sh ana', 'un argument: salut implicit.'],
        ['~/salut.sh ana Bună', 'două argumente.'],
        ['~/salut.sh "ana maria"', 'ghilimelele fac un singur argument cu spațiu.'],
        ['~/salut.sh; echo $?', 'fără argumente: mesaj de folosire și cod 1.'],
        ['2>/dev/null', 'aruncă stderr (L1.5): mesajul dispare, dar codul rămâne 1 — dovedește că mesajul era pe stderr.'],
      ],
      output: { label: 'illustrative', code: 'Salut, ana!\nBună, ana!\nSalut, ana maria!\nFolosire: /home/student/salut.sh NUME [SALUT]\n1\n1', explain: 'Primele trei: cazurile cu argumente. Apoi mesajul de folosire și codul 1; ultima linie 1 vine din rularea cu stderr aruncat (mesajul nu se mai vede).' },
    },
    {
      title: 'Scrie numara.sh',
      purpose: 'Folosești $# și "$@" într-o buclă.',
      hint: 'Păstrează ghilimelele: "$@".',
      commands: 'nano ~/numara.sh\nchmod +x ~/numara.sh\n~/numara.sh a "b c" d',
      explain: [
        ['nano ~/numara.sh', 'conținutul de mai jos.'],
        ['~/numara.sh a "b c" d', 'trei argumente, dintre care unul cu spațiu.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\necho "Număr argumente: $#"\nfor a in "$@"; do\n  echo "[$a]"\ndone', explain: 'Bucla `for` este explicată în L3.4; aici contează `"$@"`, care păstrează „b c” ca un singur element.' },
      reflect: 'Ce s-ar afișa dacă ai scrie `for a in $@` (fără ghilimele)?',
    },
    {
      title: 'Compară "$@" cu $@',
      purpose: 'Vezi singur de ce ghilimelele contează.',
      hint: 'Fă o copie a scriptului și scoate ghilimelele din for.',
      commands: "sed 's/\"\\$@\"/$@/' ~/numara.sh > ~/numara2.sh\nchmod +x ~/numara2.sh\n~/numara2.sh a \"b c\" d\nrm ~/numara2.sh",
      explain: [
        ['sed …', 'înlocuiește "$@" cu $@ în copie; rezultatul merge în numara2.sh.'],
        ['~/numara2.sh a "b c" d', 'acum „b c” este despărțit în două elemente (word splitting).'],
        ['rm ~/numara2.sh', 'curăță fișierul de test.'],
      ],
    },
  ],
  verification: [
    { cmd: '~/salut.sh ana', expected: 'Salut, ana!' },
    { cmd: '~/salut.sh 2>/dev/null; echo $?', expected: '1' },
    { cmd: '~/numara.sh a "b c" d', expected: 'Număr argumente: 3, apoi [a], [b c], [d]' },
  ],
  persistence: [
    'Scripturile și permisiunile persistă după reboot; argumentele nu se salvează.',
    'Confirmare manuală după reboot: `ls -l ~/salut.sh ~/numara.sh` și o rulare de test.',
  ],
  mistakes: [
    'Uiți ghilimelele în jurul lui `$1` sau `"$@"`.',
    'Pui spații în jurul `=` la atribuiri.',
    'Citești `$?` după alt echo.',
    'Crezi că lipsa unui argument produce eroare automată.',
  ],
  troubleshooting: [
    { symptom: '`[: =: unary operator expected`', cause: '`$1` gol și fără ghilimele într-un test', fix: 'scrie `[ "$1" = "..." ]`.' },
    { symptom: 'Argumentul cu spațiu e împărțit', cause: 'lipsesc ghilimele în linia de comandă sau `"$@"`', fix: 'pune ghilimele la apel și folosește `"$@"` în script.' },
    { symptom: '`Permission denied`', cause: 'lipsește bitul x', fix: '`chmod +x` (L3.1).' },
  ],
  alternatives: [
    'În loc de `${2:-Salut}` poți folosi un `if [ -z "$2" ]` (L3.3).',
    'Poți scrie `if [ "$#" -lt 1 ]` cu ghilimele; ambele variante merg.',
    'Mesajul de folosire poate folosi `$0` (calea de apelare) sau un nume fix.',
  ],
};
