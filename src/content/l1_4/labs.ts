import type { Lab } from '../../lab/types';

export const LAB_L1_4: Lab = {
  id: 'lab-l1-4-fisiere-text',
  lessonId: 'L1.4',
  title: 'Fișiere text: creare din shell și editare cu vi',
  modes: ['guided', 'independent'],
  objectives: ['C1-7'],
  difficulty: 1,
  estimatedMinutes: 35,
  scenario: [
    'Pregătești un mic fișier de configurare fictiv și o listă de verificare, folosind atât comenzi de shell, cât și un editor în terminal.',
    'Sarcini: în `~/lab14`, (1) creează `gol.txt` fără conținut; (2) creează `lista.txt` cu trei linii (`unu`, `doi`, `trei`) folosind redirecționare; (3) deschide `lista.txt` în `vi` și adaugă la final linia `patru`, apoi salvează; (4) în `vi`, înlocuiește în tot fișierul `doi` cu `DOI`; (5) deschide fișierul, șterge linia `unu` și apoi anulează ștergerea (undo); (6) deschide `lista.txt`, fă o modificare și închide FĂRĂ salvare; (7) creează `config.conf` cu un here-document cu două linii de tip `cheie=valoare`.',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal în home. `vi` este disponibil (implicit pe RHEL).',
    'Directorul `~/lab14` nu există încă.',
  ],
  finalState: [
    '`~/lab14` conține `gol.txt` (0 octeți), `lista.txt` și `config.conf`.',
    '`lista.txt` are conținutul `unu`, `DOI`, `trei`, `patru`.',
  ],
  criteria: [
    { id: 'ac1', text: '`gol.txt` există și are dimensiunea 0.', manualCheck: 'ls -l ~/lab14/gol.txt' },
    { id: 'ac2', text: '`lista.txt` are exact patru linii: `unu`, `DOI`, `trei`, `patru`.', manualCheck: 'cat ~/lab14/lista.txt; wc -l ~/lab14/lista.txt' },
    { id: 'ac3', text: 'Modificarea făcută și abandonată cu `:q!` nu apare în `lista.txt`.', manualCheck: 'cat ~/lab14/lista.txt' },
    { id: 'ac4', text: '`config.conf` conține două linii de forma `cheie=valoare`.', manualCheck: 'cat ~/lab14/config.conf' },
  ],
  steps: [
    {
      title: 'Fișiere create din shell',
      purpose: 'Creezi fișiere fără editor, folosind `touch` și redirecționarea.',
      hint: '`touch` creează un fișier gol; `>` scrie prima linie, `>>` adaugă restul.',
      commands: 'mkdir -p ~/lab14 && cd ~/lab14\ntouch gol.txt\necho unu > lista.txt\necho doi >> lista.txt\necho trei >> lista.txt\nls -l gol.txt\ncat lista.txt',
      explain: [
        ['mkdir -p ~/lab14 && cd ~/lab14', 'creează directorul (fără eroare dacă există) și intră în el.'],
        ['touch gol.txt', 'creează un fișier de 0 octeți.'],
        ['echo unu > lista.txt', '> creează/golește fișierul și scrie prima linie.'],
        ['>>', 'adaugă liniile următoare fără a șterge ce există.'],
      ],
      output: {
        label: 'illustrative',
        code: '-rw-r--r--. 1 student student 0 Jan  1 10:00 gol.txt\nunu\ndoi\ntrei',
        explain: 'Dimensiunea 0 arată un fișier gol. Data, proprietarul și caracterul `.` de după permisiuni (context SELinux) pot diferi pe sistemul tău.',
      },
      reflect: 'Ce s-ar fi întâmplat cu `lista.txt` dacă a doua comandă ar fi folosit `>` în loc de `>>`?',
    },
    {
      title: 'Adaugă o linie și înlocuiește text în vi',
      purpose: 'Parcurgi ciclul Normal → Insert → Normal → comandă `:`.',
      hint: 'În Normal, `G` sare la ultima linie, `o` deschide o linie nouă dedesubt și intră în Insert. Nu uita `Esc` înainte de `:`.',
      commands: 'vi lista.txt\n# G   o   (scrii: patru)   Esc\n# :%s/doi/DOI/g   Enter\n# :wq   Enter\ncat lista.txt',
      explain: [
        ['vi lista.txt', 'deschide fișierul în modul Normal.'],
        ['G', 'mută cursorul pe ultima linie.'],
        ['o', 'deschide linie nouă dedesubt și intră în Insert; scrii `patru`.'],
        ['Esc', 'revine în Normal.'],
        [':%s/doi/DOI/g', '% = toate liniile; s = substituire; g = toate aparițiile de pe linie.'],
        [':wq', 'salvează și iese.'],
      ],
      output: {
        label: 'illustrative',
        code: 'unu\nDOI\ntrei\npatru',
        explain: 'Cele patru linii după editare. Dacă vezi `doi` cu litere mici, substituția nu s-a aplicat (de ex. ai uitat `:` sau `Esc`).',
      },
    },
    {
      title: 'Undo și ieșire fără salvare',
      purpose: 'Înveți să repari o greșeală și să abandonezi modificări.',
      hint: '`dd` șterge linia curentă; `u` anulează ultima modificare; `:q!` iese fără salvare.',
      commands: 'vi lista.txt\n# gg   dd   u      (ștergi prima linie, apoi anulezi)\n# G   dd         (ștergi ultima linie)\n# :q!   Enter    (renunți la tot)\ncat lista.txt',
      explain: [
        ['gg', 'mută cursorul pe prima linie.'],
        ['dd', 'șterge linia curentă (o poți lipi cu `p`).'],
        ['u', 'undo: anulează ultima modificare.'],
        [':q!', 'iese fără să salveze: fișierul de pe disc rămâne cel de dinainte.'],
      ],
      output: {
        label: 'illustrative',
        code: 'unu\nDOI\ntrei\npatru',
        explain: 'Conținutul este identic cu cel de la pasul anterior: modificările abandonate nu au ajuns pe disc.',
      },
      reflect: 'Ce mesaj ar fi dat `:q` (fără `!`) după ce ai șters linia?',
    },
    {
      title: 'Fișier de configurare cu here-document',
      purpose: 'Creezi un fișier cu mai multe linii fără editor.',
      hint: 'Marcajul final `EOF` trebuie să fie singur pe linie.',
      commands: "cat > config.conf <<'EOF'\nport=8080\nmod=test\nEOF\ncat -A config.conf",
      explain: [
        ["cat > config.conf <<'EOF'", 'liniile următoare, până la EOF, sunt scrise în config.conf.'],
        ['cat -A', 'arată caracterele ascunse: `$` marchează sfârșitul fiecărei linii.'],
      ],
      output: {
        label: 'illustrative',
        code: 'port=8080$\nmod=test$',
        explain: 'Fiecare linie se termină cu `$`; dacă vezi spații înaintea lui `$`, ai spații în plus la sfârșitul valorii.',
      },
    },
  ],
  verification: [
    { cmd: 'ls -l ~/lab14/gol.txt', expected: 'dimensiunea `0`.' },
    { cmd: 'cat ~/lab14/lista.txt', expected: 'patru linii: `unu`, `DOI`, `trei`, `patru`.' },
    { cmd: 'wc -l ~/lab14/lista.txt', expected: '`4` și numele fișierului.' },
    { cmd: 'cat -A ~/lab14/config.conf', expected: 'două linii `cheie=valoare`, fiecare terminată cu `$`.' },
  ],
  persistence: [
    'Fișierele sunt pe disc, în home: persistă după reboot.',
    'Setările de sesiune din vim (`:set number`) și variabila `EDITOR` setată în terminal nu persistă; nu sunt necesare în acest laborator.',
    'Confirmare manuală: după repornire, `cat ~/lab14/lista.txt` afișează același conținut.',
  ],
  mistakes: [
    'Scrii text fără să fi apăsat `i`/`o` (ești în modul Normal) și ștergi linii din greșeală.',
    'Uiți `Esc` înainte de `:wq`: comanda ajunge ca text în fișier.',
    '`:q` cu modificări nesalvate: vim refuză; folosește `:wq` sau `:q!` conștient.',
    '`>` în loc de `>>`: pierzi liniile anterioare.',
  ],
  troubleshooting: [
    { symptom: '`:wq` apare în fișier ca text', cause: 'erai în modul Insert', fix: 'ieși cu `Esc`, șterge linia cu `dd`, apoi `:wq`' },
    { symptom: 'Substituția nu schimbă nimic', cause: 'tiparul nu se potrivește (litere mari/mici, greșeală de scriere)', fix: 'verifică textul exact; vim este case-sensitive implicit' },
    { symptom: 'Mesaj despre fișier swap', cause: 'fișierul este deschis în alt terminal sau o sesiune a fost întreruptă', fix: 'verifică alte terminale; recuperează sau șterge `.lista.txt.swp` după ce ai confirmat că nu e în uz' },
    { symptom: '`cat -A` arată `^I`', cause: 'ai caractere Tab în fișier', fix: 'înlocuiește-le cu spații dacă formatul o cere' },
  ],
  alternatives: [
    'Pentru linia `patru`: `echo patru >> lista.txt` în loc de editor.',
    'Pentru substituție: `sed -i \'s/doi/DOI/\' lista.txt` (sed este tratat în alte capitole; aici nu este necesar).',
    'Poți folosi `nano` (dacă este instalat) în locul lui `vi`; scurtăturile sunt afișate pe ecran.',
  ],
};
