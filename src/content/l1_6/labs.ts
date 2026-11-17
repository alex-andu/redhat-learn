import type { Lab } from '../../lab/types';

export const LAB_L1_6: Lab = {
  id: 'lab-l1-6-grep-regex',
  lessonId: 'L1.6',
  title: 'grep și expresii regulate: filtrează, numără, exclude',
  modes: ['guided', 'independent'],
  objectives: ['C1-3'],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Analizezi un fișier-jurnal fictiv și fișierele de conturi ale sistemului doar cu `grep` și pipe-uri, fără să editezi nimic.',
    'Sarcini: în `~/lab16`, creează `jurnal.txt` cu liniile date mai jos, apoi (1) afișează liniile cu `ERROR` indiferent de litere mari/mici, cu numărul liniei; (2) numără liniile `INFO`; (3) afișează liniile care NU conțin `INFO`; (4) afișează liniile care încep cu un an din patru cifre și se termină cu `ok`; (5) salvează în `adrese.txt` doar adresele IP din `jurnal.txt` (`-o`); (6) din `/etc/passwd`, afișează conturile cu shell `/bin/bash` și numără-le; (7) afișează un fișier de configurare fără comentarii și fără linii goale.',
    'Conținutul `jurnal.txt`: `2024-01-10 INFO start ok` / `2024-01-10 ERROR disk full` / `2024-01-11 info reload ok` / `2024-01-11 error timeout 10.0.0.5` / `# comentariu` / (linie goală) / `2024-01-12 WARN client 192.168.1.20 ok`.',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal în home; `/etc/passwd` lizibil.',
    'Directorul `~/lab16` nu există încă.',
  ],
  finalState: [
    '`~/lab16` conține `jurnal.txt` și `adrese.txt`.',
    '`adrese.txt` conține doar adresele IP din jurnal (una pe linie).',
  ],
  criteria: [
    { id: 'ac1', text: 'Comanda din pasul 1 afișează exact cele două linii cu eroare (inclusiv cea cu `error` scris cu litere mici), cu numerele de linie.', manualCheck: "grep -in 'error' ~/lab16/jurnal.txt" },
    { id: 'ac2', text: 'Numărul liniilor `INFO` (fără a ține cont de litere) este afișat ca un singur număr.', manualCheck: "grep -ic 'info' ~/lab16/jurnal.txt" },
    { id: 'ac3', text: '`adrese.txt` conține exact `10.0.0.5` și `192.168.1.20`.', manualCheck: 'cat ~/lab16/adrese.txt' },
    { id: 'ac4', text: 'Comanda pentru configurare fără comentarii și linii goale nu afișează `# comentariu` și nici linia goală.', manualCheck: "grep -v -e '^#' -e '^$' ~/lab16/jurnal.txt" },
    { id: 'ac5', text: 'Poți obține numărul de conturi cu shell `/bin/bash` din `/etc/passwd`.', manualCheck: "grep -c '/bin/bash$' /etc/passwd" },
  ],
  steps: [
    {
      title: 'Pregătește fișierul de lucru',
      purpose: 'Creezi un jurnal fictiv cu un here-document (L1.5), ca să ai date cunoscute.',
      hint: 'Marcajul `EOF` trebuie să fie singur pe linie; linia goală se obține apăsând Enter.',
      commands: "mkdir -p ~/lab16 && cd ~/lab16\ncat > jurnal.txt <<'EOF'\n2024-01-10 INFO start ok\n2024-01-10 ERROR disk full\n2024-01-11 info reload ok\n2024-01-11 error timeout 10.0.0.5\n# comentariu\n\n2024-01-12 WARN client 192.168.1.20 ok\nEOF\ncat -n jurnal.txt",
      explain: [
        ['mkdir -p ~/lab16 && cd ~/lab16', 'creează directorul și intră în el.'],
        ["cat > jurnal.txt <<'EOF'", 'scrie liniile până la EOF în fișier.'],
        ['cat -n', '-n numerotează toate liniile afișate.'],
      ],
      output: {
        label: 'illustrative',
        code: '     1\t2024-01-10 INFO start ok\n     2\t2024-01-10 ERROR disk full\n     3\t2024-01-11 info reload ok\n     4\t2024-01-11 error timeout 10.0.0.5\n     5\t# comentariu\n     6\t\n     7\t2024-01-12 WARN client 192.168.1.20 ok',
        explain: 'Șapte linii; linia 6 este goală. Formatul exact al numerotării poate diferi ușor.',
      },
    },
    {
      title: 'Căutare simplă, cu număr de linie și fără diferență mari/mici',
      purpose: 'Folosești `-i`, `-n`, `-c` și `-v`.',
      hint: 'Fără `-i`, „error” cu litere mici nu se potrivește cu „ERROR”.',
      commands: "grep -in 'error' jurnal.txt\ngrep -ic 'info' jurnal.txt\ngrep -v 'INFO' jurnal.txt",
      explain: [
        ['-i', 'ignoră diferența dintre litere mari și mici.'],
        ['-n', 'prefixează fiecare linie cu numărul ei.'],
        ['-c', 'afișează doar numărul de linii potrivite.'],
        ['-v', 'afișează liniile care NU conțin tiparul (rețineți: fără -i, „info” cu litere mici rămâne în rezultat).'],
      ],
      output: {
        label: 'illustrative',
        code: '2:2024-01-10 ERROR disk full\n4:2024-01-11 error timeout 10.0.0.5\n2\n2024-01-10 ERROR disk full\n2024-01-11 info reload ok\n2024-01-11 error timeout 10.0.0.5\n# comentariu\n\n2024-01-12 WARN client 192.168.1.20 ok',
        explain: 'Prima comandă: liniile 2 și 4. A doua: `2` (INFO și info). A treia: toate liniile care nu conțin exact `INFO` cu majuscule; linia cu `info` mic rămâne.',
      },
      reflect: 'Cum ai obține și al treilea rezultat fără linia cu `info`?',
    },
    {
      title: 'Ancore și clase de caractere',
      purpose: 'Selectezi linii după poziție și formă.',
      hint: '`[0-9]` sau `[[:digit:]]` sunt echivalente pentru cifre; `-E` face `{4}` utilizabil fără backslash.',
      commands: "grep -E '^[0-9]{4}-' jurnal.txt\ngrep 'ok$' jurnal.txt\ngrep -E '^[0-9]{4}-.*ok$' jurnal.txt",
      explain: [
        ['-E', 'expresii regulate extinse: `{4}` = exact 4 repetări.'],
        ['^[0-9]{4}-', 'linii care încep cu patru cifre urmate de `-`.'],
        ['ok$', 'linii care se termină cu „ok”.'],
        ['.*', 'orice caracter, de orice număr de ori: leagă începutul de sfârșit.'],
      ],
      output: {
        label: 'illustrative',
        code: '2024-01-10 INFO start ok\n2024-01-10 ERROR disk full\n2024-01-11 info reload ok\n2024-01-11 error timeout 10.0.0.5\n2024-01-12 WARN client 192.168.1.20 ok\n2024-01-10 INFO start ok\n2024-01-11 info reload ok\n2024-01-12 WARN client 192.168.1.20 ok\n2024-01-10 INFO start ok\n2024-01-11 info reload ok\n2024-01-12 WARN client 192.168.1.20 ok',
        explain: 'Primele cinci linii: toate cele care încep cu un an. Următoarele trei: cele care se termină cu `ok`. Ultimele trei: cele care îndeplinesc ambele condiții.',
      },
    },
    {
      title: 'Extrage doar adresele IP',
      purpose: 'Folosești `-o` pentru a păstra doar partea potrivită și salvezi rezultatul.',
      hint: 'Un octet are 1–3 cifre; punctul literal se scapă. Pentru acest exercițiu este suficient un tipar simplu.',
      commands: "grep -oE '[0-9]{1,3}(\\.[0-9]{1,3}){3}' jurnal.txt > adrese.txt\ncat adrese.txt",
      explain: [
        ['-o', 'afișează doar textul potrivit, câte unul pe linie.'],
        ['[0-9]{1,3}', 'între 1 și 3 cifre.'],
        ['(\\.[0-9]{1,3}){3}', 'un punct literal și 1–3 cifre, repetat de 3 ori; formează 4 grupe separate prin puncte.'],
        ['> adrese.txt', 'salvează rezultatul (L1.5).'],
      ],
      output: {
        label: 'illustrative',
        code: '10.0.0.5\n192.168.1.20',
        explain: 'Tiparul acceptă și valori fără sens ca adresă (de ex. 999.1.1.1); aici este folosit doar pentru extragere.',
      },
    },
    {
      title: 'Conturi cu bash, comentarii excluse',
      purpose: 'Aplici `grep` pe fișiere reale și combini cu pipe-uri.',
      hint: 'Shell-ul unui cont este ultimul câmp din `/etc/passwd`; `$` ancorează sfârșitul.',
      commands: "grep '/bin/bash$' /etc/passwd\ngrep -c '/bin/bash$' /etc/passwd\ngrep '/bin/bash$' /etc/passwd | cut -d: -f1\ngrep -v -e '^#' -e '^$' jurnal.txt",
      explain: [
        ["'/bin/bash$'", 'linii care se termină cu /bin/bash (shell-ul contului).'],
        ['-c', 'numără liniile potrivite.'],
        ['cut -d: -f1', 'din liniile filtrate păstrează doar numele contului (L1.5).'],
        ["-v -e '^#' -e '^$'", 'exclude liniile-comentariu și liniile goale.'],
      ],
      output: {
        label: 'illustrative',
        code: 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:student:/home/student:/bin/bash\n2\nroot\nstudent',
        explain: 'Conturile și numărul depind de sistemul tău. Ultimele linii ale celei de-a patra comenzi sunt jurnalul fără comentariu și fără linia goală.',
      },
    },
  ],
  verification: [
    { cmd: "grep -in 'error' ~/lab16/jurnal.txt", expected: 'două linii, cu numerele 2 și 4.' },
    { cmd: "grep -ic 'info' ~/lab16/jurnal.txt", expected: '`2`.' },
    { cmd: 'cat ~/lab16/adrese.txt', expected: '`10.0.0.5` și `192.168.1.20`, câte una pe linie.' },
    { cmd: "grep '^root' /etc/passwd; echo $?", expected: 'linia root și `0`.' },
  ],
  persistence: [
    'Fișierele create sunt pe disc, în home: persistă după reboot.',
    '`grep` nu modifică fișiere și nu are stare; nu există configurație de sistem schimbată.',
    'Confirmare manuală: după repornire, `cat ~/lab16/adrese.txt` arată aceleași două adrese.',
  ],
  mistakes: [
    'Tipar fără apostrofuri la expresii cu `*`, `$` sau `|`.',
    'Folosirea `+` sau `|` fără `-E`.',
    'Punct nescăpat (`10.0.0.5` se potrivește cu mai mult decât crezi).',
    'Interpretarea exit status-ului 1 ca eroare.',
  ],
  troubleshooting: [
    { symptom: 'Pasul 2 nu găsește linia cu `error` mic', cause: 'ai uitat `-i`', fix: 'adaugă `-i`' },
    { symptom: '`adrese.txt` este gol', cause: 'ai uitat `-E` sau ai citat greșit tiparul', fix: "folosește `grep -oE '...'` cu tiparul între apostrofuri" },
    { symptom: 'Tiparul cu `{4}` nu funcționează', cause: 'BRE: acoladele sunt literale', fix: 'adaugă `-E` sau scrie `\\{4\\}`' },
    { symptom: '`Permission denied` pe fișiere din /etc', cause: 'fișiere ilizibile pentru utilizatorul obișnuit', fix: 'folosește `2>/dev/null` sau `sudo` unde este cazul' },
  ],
  alternatives: [
    'Pentru adrese: `grep -oE \'[0-9.]+\' jurnal.txt` este mai simplu, dar potrivește și șiruri ca `2024-01-10` fără puncte (nu: conține cratime) — verifică rezultatul.',
    'Pentru `error` și `info`: `grep -Ei \'error|info\'`.',
    'Pentru excluderea comentariilor: `grep -v \'^[[:space:]]*#\'` ignoră și comentariile precedate de spații.',
  ],
};
