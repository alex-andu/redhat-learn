import type { Lab } from '../../lab/types';

export const LAB_L1_5: Lab = {
  id: 'lab-l1-5-redirectionare-pipe',
  lessonId: 'L1.5',
  title: 'Redirecționare și pipe: capturează, separă, filtrează',
  modes: ['guided', 'independent'],
  objectives: ['C1-2'],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Ți se cere un mic raport despre conturile locale ale unui sistem, fără să editezi fișiere manual: toate rezultatele trebuie produse din comenzi, redirecționări și pipe-uri.',
    'Sarcini: în `~/lab15`, (1) rulează o comandă cu un argument valid și unul invalid și păstrează stdout și stderr în fișiere separate; (2) arată diferența dintre `>` și `>>`; (3) obține ambele canale într-un singur fișier, în ordinea corectă a operatorilor; (4) numără fișierele `*.conf` din `/etc` fără mesaje de eroare; (5) produce `primii5.txt` cu primele cinci nume de utilizator din `/etc/passwd`, în ordine alfabetică, și afișează în același timp câte nume sunt în total; (6) creează `note.txt` cu un here-document.',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal în home. `/etc/passwd` este lizibil (implicit, da).',
    'Directorul `~/lab15` nu există încă.',
  ],
  finalState: [
    '`~/lab15` conține `out.txt`, `err.txt`, `f.txt`, `all.txt`, `primii5.txt`, `note.txt`.',
    '`primii5.txt` are exact 5 linii, sortate.',
  ],
  criteria: [
    { id: 'ac1', text: '`out.txt` conține rezultatul reușit, iar `err.txt` conține mesajul de eroare, în fișiere separate.', manualCheck: 'cat ~/lab15/out.txt; cat ~/lab15/err.txt' },
    { id: 'ac2', text: '`f.txt` conține o singură linie („a treia”) după secvența `>`, `>>`, `>`.', manualCheck: 'cat ~/lab15/f.txt' },
    { id: 'ac3', text: '`all.txt` conține ambele canale (rezultat + eroare).', manualCheck: 'wc -l ~/lab15/all.txt; cat ~/lab15/all.txt' },
    { id: 'ac4', text: '`primii5.txt` are exact 5 linii, sortate alfabetic.', manualCheck: 'wc -l ~/lab15/primii5.txt; sort -c ~/lab15/primii5.txt; echo $?' },
    { id: 'ac5', text: '`note.txt` conține cele două linii din here-document, cu `$HOME` literal.', manualCheck: 'cat ~/lab15/note.txt' },
  ],
  steps: [
    {
      title: 'Stdout și stderr în fișiere separate',
      purpose: 'Arăți că cele două canale sunt independente.',
      hint: '`2>` are nevoie de un fișier separat de cel de la `>`.',
      commands: 'mkdir -p ~/lab15 && cd ~/lab15\nls /etc/hostname /nu-exista > out.txt 2> err.txt\ncat out.txt\ncat err.txt',
      explain: [
        ['mkdir -p ... && cd ...', 'creează directorul și intră în el doar dacă prima comandă a reușit.'],
        ['> out.txt', 'stdout în out.txt.'],
        ['2> err.txt', 'stderr în err.txt.'],
      ],
      output: {
        label: 'illustrative',
        code: '/etc/hostname\nls: cannot access \'/nu-exista\': No such file or directory',
        explain: 'Primul rând vine din `out.txt`, al doilea din `err.txt`. Pe ecran, la prima comandă, nu s-a afișat nimic.',
      },
      reflect: 'Ce ai fi văzut pe ecran dacă ai fi scris doar `> out.txt`?',
    },
    {
      title: 'Suprascriere vs adăugare',
      purpose: 'Vezi diferența dintre `>` (golește) și `>>` (adaugă).',
      hint: 'Verifică după fiecare comandă cu `cat f.txt`.',
      commands: 'echo prima > f.txt\necho a doua >> f.txt\ncat f.txt\necho a treia > f.txt\ncat f.txt',
      explain: [
        ['>', 'trunchiază fișierul și scrie.'],
        ['>>', 'adaugă la sfârșit.'],
        ['cat f.txt', 'afișează conținutul curent.'],
      ],
      output: {
        label: 'illustrative',
        code: 'prima\na doua\na treia',
        explain: 'Primele două linii apar după primul `cat`; după ultimul `echo a treia > f.txt` rămâne doar „a treia”, iar liniile precedente au fost pierdute.',
      },
    },
    {
      title: 'Ambele canale într-un singur fișier',
      purpose: 'Folosești `> fișier 2>&1` (și scurtătura bash `&>`), apoi observi ce se întâmplă cu ordinea inversă.',
      hint: 'La `2>&1`, ce contează este ce indică descriptorul 1 în momentul copierii.',
      commands: 'ls /etc/hostname /nu-exista > all.txt 2>&1\ncat all.txt\nls /etc/hostname /nu-exista 2>&1 > rau.txt\ncat rau.txt\nrm rau.txt',
      explain: [
        ['> all.txt 2>&1', 'întâi stdout în fișier, apoi stderr copiază destinația stdout (fișierul).'],
        ['2>&1 > rau.txt', 'ordine inversă: stderr copiază terminalul, apoi stdout merge în fișier; eroarea apare pe ecran.'],
        ['rm rau.txt', 'ștergi exemplul greșit (fișier de test, în `~/lab15`).'],
      ],
      output: {
        label: 'illustrative',
        code: "ls: cannot access '/nu-exista': No such file or directory\n/etc/hostname",
        explain: 'Primul `cat all.txt` arată ambele linii. La a doua variantă, mesajul de eroare apare direct pe terminal, iar `rau.txt` conține doar `/etc/hostname`. Ordinea liniilor poate diferi.',
      },
    },
    {
      title: 'Aruncă erorile așteptate',
      purpose: 'Numeri fișierele `.conf` din `/etc` fără mesaje „Permission denied”.',
      hint: '`find` se plânge pentru directoarele pe care nu le poți citi: acele mesaje sunt pe stderr.',
      commands: 'find /etc -name "*.conf" 2> /dev/null | wc -l',
      explain: [
        ['find /etc -name "*.conf"', 'caută fișiere cu numele potrivit; ghilimelele opresc expandarea tiparului de către shell.'],
        ['2> /dev/null', 'aruncă stderr.'],
        ['| wc -l', 'numără liniile primite pe stdin.'],
      ],
      output: {
        label: 'illustrative',
        code: '86',
        explain: 'Numărul depinde de pachetele instalate; contează că apare un singur număr, fără mesaje de eroare.',
      },
    },
    {
      title: 'Pipeline cu tee',
      purpose: 'Combini filtre și salvezi un rezultat intermediar în timp ce îl vezi.',
      hint: '`cut -d: -f1` extrage numele; `sort` le ordonează; `head -n 5` păstrează cinci; `tee` salvează.',
      commands: 'cut -d: -f1 /etc/passwd | sort | head -n 5 | tee primii5.txt\nwc -l primii5.txt\ncut -d: -f1 /etc/passwd | wc -l',
      explain: [
        ['cut -d: -f1 /etc/passwd', '-d: delimitator „:”, -f1 primul câmp (numele de utilizator).'],
        ['sort', 'ordonează alfabetic.'],
        ['head -n 5', 'primele 5 linii.'],
        ['tee primii5.txt', 'afișează ce primește ȘI îl salvează în primii5.txt.'],
        ['wc -l primii5.txt', 'trebuie să afișeze `5 primii5.txt`.'],
      ],
      output: {
        label: 'illustrative',
        code: 'adm\nbin\ndaemon\ndbus\nftp\n5 primii5.txt\n45',
        explain: 'Numele depind de conturile din sistemul tău. Ultimul număr (45) este totalul de conturi din /etc/passwd.',
      },
    },
    {
      title: 'Here-document',
      purpose: 'Creezi un fișier din mai multe linii, direct din terminal.',
      hint: 'Marcajul final (EOF) trebuie să fie singur pe linie. Apostrofurile din jurul primului EOF opresc expandarea.',
      commands: "cat > note.txt <<'EOF'\nPrima linie\nDirectorul tau este $HOME\nEOF\ncat note.txt",
      explain: [
        ['cat > note.txt <<\'EOF\'', 'cat primește pe stdin liniile dintre marcaje; ieșirea merge în note.txt.'],
        ['\'EOF\' cu apostrofuri', 'textul rămâne literal: `$HOME` nu este înlocuit. Fără apostrofuri, ar fi expandat.'],
      ],
      output: {
        label: 'illustrative',
        code: 'Prima linie\nDirectorul tau este $HOME',
        explain: 'Dacă vezi calea home-ului în loc de `$HOME`, ai uitat apostrofurile la `EOF`.',
      },
    },
  ],
  verification: [
    { cmd: 'cat ~/lab15/f.txt', expected: 'o singură linie: `a treia`.' },
    { cmd: 'wc -l ~/lab15/primii5.txt', expected: '`5` și numele fișierului.' },
    { cmd: 'sort -c ~/lab15/primii5.txt; echo $?', expected: '`0` (fișierul este deja sortat; `sort -c` doar verifică).' },
    { cmd: 'ls ~/lab15', expected: '`all.txt err.txt f.txt note.txt out.txt primii5.txt`.' },
  ],
  persistence: [
    'Toate fișierele sunt pe disc, în home: persistă după reboot.',
    'Nu există configurație de sistem modificată în acest laborator; `set -o noclobber` (dacă l-ai încercat) a fost doar pentru sesiune.',
    'Confirmare manuală: după repornire, `ls ~/lab15` listează aceleași fișiere.',
  ],
  mistakes: [
    '`>` în loc de `>>` și pierderea conținutului.',
    '`2>&1` înaintea lui `> fișier`.',
    '`uniq` fără `sort`, `sort f > f`.',
    'Tipar fără ghilimele la `find -name *.conf` când există fișiere `.conf` în directorul curent: shell-ul îl expandează înainte de `find`.',
  ],
  troubleshooting: [
    { symptom: '`err.txt` gol', cause: 'toate argumentele au fost valide', fix: 'verifică numele inexistent din comandă' },
    { symptom: '`primii5.txt` are altă dimensiune', cause: 'ai uitat `head -n 5` sau ai folosit `>>` la rulări repetate', fix: 'șterge fișierul și rulează din nou cu `tee` (fără -a)' },
    { symptom: '`find` afișează încă erori', cause: '`2>` pus după pipe sau fără spațiu corect', fix: 'redirecționarea aparține comenzii `find`, înaintea lui `|`' },
    { symptom: '`$HOME` expandat în note.txt', cause: 'EOF fără apostrofuri', fix: 'refă cu `<<\'EOF\'`' },
  ],
  alternatives: [
    'Ambele canale: `&> all.txt` (bash) în loc de `> all.txt 2>&1`.',
    'Numărul de linii: `wc -l < /etc/passwd` afișează doar numărul.',
    'Pentru `primii5.txt`: `sort` poate fi înlocuit cu `sort -u` dacă vrei eliminarea duplicatelor.',
    'Pentru note.txt: `printf` sau un editor de text (L1.4) sunt alternative.',
  ],
};
