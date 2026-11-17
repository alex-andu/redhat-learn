import type { Lab } from '../../lab/types';

export const LAB_L1_9: Lab = {
  id: 'lab-l1-9-arhivare',
  lessonId: 'L1.9',
  title: 'Arhivare și compresie: creează, listează, extrage, compară',
  modes: ['guided', 'independent'],
  objectives: ['C1-6'],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Ți se cere să faci o copie de siguranță a unui director de proiect, în două formate comprimate, să verifici conținutul fără a extrage și să restaurezi într-un alt loc.',
    'Sarcini: în `~/lab19`, (1) creează `proiect/docs` cu trei fișiere `f1.txt`, `f2.txt`, `f3.txt`; (2) creează `proiect.tar.gz` (gzip) și `proiect.tar.bz2` (bzip2); (3) listează conținutul fiecărei arhive fără extragere; (4) extrage `proiect.tar.gz` în `restaurat-gz/` și `proiect.tar.bz2` în `restaurat-bz2/`; (5) arată că cele două copii sunt identice cu originalul; (6) comprimă individual un fișier cu `gzip` păstrând originalul și citește-l cu `zcat`; (7) extrage dintr-o arhivă un singur fișier.',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal în home. `tar`, `gzip` și `bzip2` sunt instalate (verifică `command -v bzip2`).',
    'Directorul `~/lab19` nu există încă.',
  ],
  finalState: [
    '`~/lab19` conține `proiect/`, `proiect.tar.gz`, `proiect.tar.bz2`, `restaurat-gz/`, `restaurat-bz2/`, `f1.txt.gz`.',
    '`diff -r` între original și cele două restaurări nu afișează nimic.',
  ],
  criteria: [
    { id: 'ac1', text: '`proiect.tar.gz` și `proiect.tar.bz2` există și `file` le identifică corect.', manualCheck: 'file ~/lab19/proiect.tar.gz ~/lab19/proiect.tar.bz2' },
    { id: 'ac2', text: 'Conținutul ambelor arhive include `proiect/docs/f1.txt`, `f2.txt`, `f3.txt`.', manualCheck: 'tar -tzf ~/lab19/proiect.tar.gz; tar -tjf ~/lab19/proiect.tar.bz2' },
    { id: 'ac3', text: 'Restaurările sunt identice cu originalul.', manualCheck: 'diff -r ~/lab19/proiect ~/lab19/restaurat-gz/proiect; diff -r ~/lab19/proiect ~/lab19/restaurat-bz2/proiect; echo $?' },
    { id: 'ac4', text: '`f1.txt.gz` există alături de `f1.txt` (original păstrat) și `zcat` îl poate citi.', manualCheck: 'ls -l ~/lab19/f1.txt ~/lab19/f1.txt.gz; zcat ~/lab19/f1.txt.gz | head -n 2' },
    { id: 'ac5', text: 'Fișierul extras individual există în locația cerută.', manualCheck: 'ls -l ~/lab19/unul/proiect/docs/f2.txt' },
  ],
  steps: [
    {
      title: 'Date de test',
      purpose: 'Creezi un mic proiect cu un director și trei fișiere.',
      hint: 'Bucla creează `f1.txt`, `f2.txt` și `f3.txt`; `seq 1 2000` generează date comprimabile.',
      commands: 'mkdir -p ~/lab19/proiect/docs && cd ~/lab19\nfor i in 1 2 3; do seq 1 2000 > proiect/docs/f$i.txt; done\nls -lR proiect',
      explain: [
        ['mkdir -p', 'creează și directoarele intermediare.'],
        ['for i in 1 2 3; do …; done', 'repetă comanda pentru 1, 2, 3 (variabila `$i`).'],
        ['seq 1 2000 > fișier', 'scrie numerele de la 1 la 2000, câte unul pe linie, în fișier.'],
        ['ls -lR', '-R: listare recursivă.'],
      ],
      output: {
        label: 'illustrative',
        code: 'proiect:\ntotal 0\ndrwxr-xr-x. 2 student student 54 Jan  1 10:00 docs\n\nproiect/docs:\ntotal 24\n-rw-r--r--. 1 student student 8893 Jan  1 10:00 f1.txt\n-rw-r--r--. 1 student student 8893 Jan  1 10:00 f2.txt\n-rw-r--r--. 1 student student 8893 Jan  1 10:00 f3.txt',
        explain: 'Trei fișiere de câte aproximativ 8,9 KB. Dimensiunile pot diferi ușor; exemplul este ilustrativ.',
      },
    },
    {
      title: 'Creează arhivele gzip și bzip2',
      purpose: 'Folosești `-z` și `-j` și compari dimensiunile.',
      hint: '`f` trebuie să fie ultima opțiune din grup, urmată de numele arhivei.',
      commands: 'tar -czvf proiect.tar.gz proiect\ntar -cjvf proiect.tar.bz2 proiect\nls -lh proiect.tar.gz proiect.tar.bz2\nfile proiect.tar.gz proiect.tar.bz2',
      explain: [
        ['-c', 'creează arhiva.'],
        ['-z / -j', 'comprimă cu gzip / bzip2.'],
        ['-v', 'afișează fișierele adăugate.'],
        ['-f proiect.tar.gz', 'numele arhivei, imediat după f.'],
        ['file', 'identifică formatul real al fiecărui fișier.'],
      ],
      output: {
        label: 'illustrative',
        code: 'proiect/\nproiect/docs/\nproiect/docs/f1.txt\nproiect/docs/f2.txt\nproiect/docs/f3.txt\nproiect/\nproiect/docs/\nproiect/docs/f1.txt\nproiect/docs/f2.txt\nproiect/docs/f3.txt\n-rw-r--r--. 1 student student 9.5K Jan  1 10:01 proiect.tar.gz\n-rw-r--r--. 1 student student 9.0K Jan  1 10:01 proiect.tar.bz2\nproiect.tar.gz:  gzip compressed data, ...\nproiect.tar.bz2: bzip2 compressed data, block size = 900k',
        explain: 'Dimensiunile sunt ilustrative; nu presupune care format este mai mic pe datele tale. `file` confirmă formatul real.',
      },
      reflect: 'Ce s-ar întâmpla dacă ai scrie `tar -cfz proiect.tar.gz proiect`?',
    },
    {
      title: 'Listare fără extragere',
      purpose: 'Verifici conținutul arhivei înainte să extragi.',
      hint: '`-t` listează; adaugă `-v` pentru detalii.',
      commands: 'tar -tzf proiect.tar.gz\ntar -tjvf proiect.tar.bz2',
      explain: [
        ['-t', 'listează membrii arhivei.'],
        ['-tjvf', 'listare detaliată (permisiuni, proprietar, mărime, dată) pentru o arhivă bzip2.'],
      ],
      output: {
        label: 'illustrative',
        code: 'proiect/\nproiect/docs/\nproiect/docs/f1.txt\nproiect/docs/f2.txt\nproiect/docs/f3.txt\ndrwxr-xr-x student/student 0 2025-01-01 10:00 proiect/\n...',
        explain: 'Căile încep cu `proiect/`: arhiva se va extrage într-un subdirector `proiect` al locului ales.',
      },
    },
    {
      title: 'Extrage în directoare diferite și compară',
      purpose: 'Folosești `-C` pentru destinație și `diff -r` pentru comparație.',
      hint: 'Directorul pentru `-C` trebuie să existe.',
      commands: 'mkdir restaurat-gz restaurat-bz2\ntar -xzf proiect.tar.gz -C restaurat-gz\ntar -xjf proiect.tar.bz2 -C restaurat-bz2\ndiff -r proiect restaurat-gz/proiect && echo identic-gz\ndiff -r proiect restaurat-bz2/proiect && echo identic-bz2',
      explain: [
        ['-x', 'extrage.'],
        ['-C restaurat-gz', 'schimbă în director înainte de extragere (destinația).'],
        ['diff -r', 'compară recursiv două directoare; nu afișează nimic dacă sunt identice și returnează 0.'],
        ['&& echo …', 'afișează mesajul doar dacă `diff` reușește (cod 0).'],
      ],
      output: {
        label: 'illustrative',
        code: 'identic-gz\nidentic-bz2',
        explain: 'Dacă apar linii de diferență, verifică dacă ai extras corect și dacă nu ai modificat originalul în pașii intermediari.',
      },
    },
    {
      title: 'Compresie pe un singur fișier și extragere parțială',
      purpose: 'Folosești `gzip -k`, `zcat` și extragerea unui singur membru.',
      hint: 'Fără `-k`, `gzip` înlocuiește originalul.',
      commands: 'cp proiect/docs/f1.txt .\ngzip -k f1.txt\nls -l f1.txt f1.txt.gz\nzcat f1.txt.gz | head -n 2\nmkdir unul\ntar -xzf proiect.tar.gz -C unul proiect/docs/f2.txt\nls -l unul/proiect/docs',
      explain: [
        ['gzip -k f1.txt', '-k păstrează originalul; apare f1.txt.gz.'],
        ['zcat f1.txt.gz | head -n 2', 'citește conținutul decomprimat fără a modifica fișierul.'],
        ['tar -xzf … proiect/docs/f2.txt', 'extrage doar membrul numit, cu calea exactă din arhivă.'],
      ],
      output: {
        label: 'illustrative',
        code: '-rw-r--r--. 1 student student 8893 Jan  1 10:03 f1.txt\n-rw-r--r--. 1 student student 3300 Jan  1 10:03 f1.txt.gz\n1\n2\ntotal 12\n-rw-r--r--. 1 student student 8893 Jan  1 10:03 f2.txt',
        explain: 'Ambele fișiere există datorită `-k`. Dimensiunea comprimată este ilustrativă. Fișierul extras păstrează calea din arhivă sub `unul/`.',
      },
    },
  ],
  verification: [
    { cmd: 'file ~/lab19/proiect.tar.gz ~/lab19/proiect.tar.bz2', expected: '`gzip compressed data` și `bzip2 compressed data`.' },
    { cmd: 'tar -tzf ~/lab19/proiect.tar.gz', expected: 'cele trei fișiere sub `proiect/docs/`.' },
    { cmd: 'diff -r ~/lab19/proiect ~/lab19/restaurat-gz/proiect; echo $?', expected: 'doar `0`, fără linii de diferență.' },
    { cmd: 'ls ~/lab19/f1.txt ~/lab19/f1.txt.gz', expected: 'ambele fișiere există.' },
  ],
  persistence: [
    'Arhivele și fișierele sunt pe disc, în home: persistă după reboot.',
    'Nu există configurație de sistem modificată.',
    'Confirmare manuală: după repornire, `tar -tzf ~/lab19/proiect.tar.gz` listează aceleași fișiere.',
  ],
  mistakes: [
    'Scrii `-cfz` în loc de `-czf` (numele arhivei devine `z`).',
    'Folosești `-z` pe o arhivă bzip2 sau invers.',
    'Rulezi `gzip` fără `-k` și pierzi originalul.',
    'Extragi fără `-C` și umpli directorul curent.',
  ],
  troubleshooting: [
    { symptom: '`tar: This does not look like a tar archive`', cause: 'opțiunea de compresie nu corespunde fișierului', fix: 'verifică cu `file` și folosește `-z` sau `-j` corect' },
    { symptom: '`tar: restaurat-gz: Cannot open: No such file or directory`', cause: 'destinația `-C` nu există', fix: '`mkdir` înainte' },
    { symptom: '`diff` afișează diferențe', cause: 'ai modificat fișierele între arhivare și comparare', fix: 'recreează arhiva și compară din nou' },
    { symptom: '`bzip2: command not found`', cause: 'pachetul nu este instalat', fix: 'verifică `command -v bzip2`; instalarea pachetelor este în C2' },
  ],
  alternatives: [
    'Arhivare cu compresie după extensie: `tar -caf proiect.tar.gz proiect`.',
    'Extragere fără a indica compresia: `tar -xf proiect.tar.gz` (tar GNU o detectează de obicei).',
    'Arhivare doar a fișierelor: `tar -czf docs.tar.gz -C proiect docs` (căi fără prefixul `proiect/`).',
  ],
};
