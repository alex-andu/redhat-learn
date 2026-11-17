import type { Lab } from '../../lab/types';

export const LAB_L1_3: Lab = {
  id: 'lab-l1-3-structura-proiect',
  lessonId: 'L1.3',
  title: 'Structură de proiect: creare, copiere, mutare și ștergere sigură',
  modes: ['guided', 'independent'],
  objectives: ['C1-8'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Pregătești un spațiu de lucru în home pentru un mic proiect și trebuie să-l organizezi, să faci o copie de siguranță, să redenumești și să muți fișiere și să cureți ce nu mai este necesar — totul din linia de comandă.',
    'Cerințe: în `~/lab13` creează `proiect/docs` și `proiect/src` și directorul `arhiva`; creează fișierele `docs/notite.txt`, `docs/plan.txt` și `src/main.sh`; copiază `plan.txt` în `arhiva`, apoi redenumește copia în `plan-v1.txt`; fă o copie a întregului director `proiect` ca `proiect-copie` în `arhiva`; apoi șterge `proiect-copie`, lăsând doar structura finală descrisă mai jos.',
  ],
  initialConditions: [
    'Utilizator obișnuit, terminal deschis în home, cu drept de scriere în `~`.',
    'Directorul `~/lab13` nu există (dacă există din încercări anterioare, șterge-l cu grijă: `ls -A ~/lab13` mai întâi).',
  ],
  finalState: [
    '`~/lab13/proiect/docs/notite.txt` și `plan.txt`, `~/lab13/proiect/src/main.sh` există.',
    '`~/lab13/arhiva/plan-v1.txt` există; `~/lab13/arhiva/proiect-copie` NU există.',
  ],
  criteria: [
    { id: 'ac1', text: 'Structura `proiect/{docs,src}` și `arhiva` există sub `~/lab13`.', manualCheck: 'ls -R ~/lab13' },
    { id: 'ac2', text: 'Cele trei fișiere (`notite.txt`, `plan.txt`, `main.sh`) există în locurile corecte.', manualCheck: 'ls -l ~/lab13/proiect/docs ~/lab13/proiect/src' },
    { id: 'ac3', text: 'În `arhiva` există `plan-v1.txt` (copie redenumită) și originalul `plan.txt` este încă în `proiect/docs`.', manualCheck: 'ls ~/lab13/arhiva ~/lab13/proiect/docs' },
    { id: 'ac4', text: '`proiect-copie` a fost creat în `arhiva` (cu `cp -a`/`-r`) și apoi șters; nu mai există.', manualCheck: 'ls -A ~/lab13/arhiva' },
    { id: 'ac5', text: 'Ai verificat cu `ls` ce potrivește un wildcard înainte de a-l folosi cu `rm`.', manualCheck: 'ls ~/lab13/proiect/docs/*.txt' },
  ],
  steps: [
    {
      title: 'Creează structura de directoare',
      purpose: 'Un singur `mkdir -p` cu brace expansion creează tot arborele.',
      hint: 'Brace expansion poate fi imbricat: `proiect/{docs,src}`.',
      commands: 'mkdir -pv ~/lab13/{proiect/{docs,src},arhiva}\nls -R ~/lab13',
      explain: [
        ['mkdir -p', 'creează și părinții lipsă (`~/lab13`), fără eroare dacă există.'],
        ['-v', 'afișează fiecare director creat.'],
        ['{proiect/{docs,src},arhiva}', 'brace expansion imbricat: generează ~/lab13/proiect/docs, ~/lab13/proiect/src și ~/lab13/arhiva.'],
        ['ls -R', 'listează recursiv, pentru a vedea arborele.'],
      ],
      output: {
        label: 'illustrative',
        code: '/home/student/lab13:\narhiva  proiect\n\n/home/student/lab13/arhiva:\n\n/home/student/lab13/proiect:\ndocs  src\n\n/home/student/lab13/proiect/docs:\n\n/home/student/lab13/proiect/src:',
        explain: 'Directoarele sunt goale; `ls -R` afișează fiecare director urmat de conținutul lui.',
      },
    },
    {
      title: 'Creează fișierele',
      purpose: '`touch` creează fișiere goale; brace expansion generează mai multe nume odată.',
      hint: 'Poți crea cele două fișiere din `docs` cu o singură comandă `touch`.',
      commands: 'touch ~/lab13/proiect/docs/{notite,plan}.txt ~/lab13/proiect/src/main.sh\nls -l ~/lab13/proiect/docs ~/lab13/proiect/src',
      explain: [
        ['touch FIȘIER...', 'creează fișierele inexistente (goale); pentru unele existente doar actualizează timpul.'],
        ['{notite,plan}.txt', 'se expandează în notite.txt plan.txt.'],
        ['ls -l', 'format lung: verifică prezența, dimensiunea 0 și proprietarul.'],
      ],
      output: {
        label: 'illustrative',
        code: '/home/student/lab13/proiect/docs:\ntotal 0\n-rw-r--r--. 1 student student 0 Nov 15 10:20 notite.txt\n-rw-r--r--. 1 student student 0 Nov 15 10:20 plan.txt\n\n/home/student/lab13/proiect/src:\ntotal 0\n-rw-r--r--. 1 student student 0 Nov 15 10:20 main.sh',
        explain: 'Dimensiune 0: fișiere goale. Permisiunile implicite (`rw-r--r--`) vin din umask (L10.1). Valorile pot diferi pe sistemul tău.',
      },
    },
    {
      title: 'Copiază și redenumește',
      purpose: 'Copia lui `plan.txt` merge în `arhiva`; apoi o redenumești cu `mv`.',
      hint: '`cp` păstrează numele dacă destinația este un director; redenumirea este un `mv` în același director.',
      commands: 'cp -v ~/lab13/proiect/docs/plan.txt ~/lab13/arhiva/\nmv ~/lab13/arhiva/plan.txt ~/lab13/arhiva/plan-v1.txt\nls ~/lab13/arhiva ~/lab13/proiect/docs',
      explain: [
        ['cp -v SURSĂ DIR/', 'copiază fișierul în director, cu același nume; -v afișează operația.'],
        ['mv VECHI NOU', 'în același director = redenumire.'],
        ['ls A B', 'listează mai multe directoare, cu antet pentru fiecare.'],
      ],
      reflect: 'De ce există încă `plan.txt` în `proiect/docs` după pași?',
    },
    {
      title: 'Copiază un director întreg',
      purpose: 'Un director se copiază cu `-r` (sau `-a` pentru a păstra atributele).',
      hint: 'Destinația `arhiva/proiect-copie` nu există încă: cp va crea copia cu acest nume.',
      commands: 'cp -a ~/lab13/proiect ~/lab13/arhiva/proiect-copie\nls -R ~/lab13/arhiva',
      explain: [
        ['cp -a', 'archive: recursiv + păstrează permisiuni, timpuri, link-uri etc.'],
        ['arhiva/proiect-copie', 'nu există: devine duplicatul lui `proiect`. Dacă ar exista deja, copia ar fi intrat în el (`proiect-copie/proiect`).'],
      ],
      output: {
        label: 'illustrative',
        code: '/home/student/lab13/arhiva:\nplan-v1.txt  proiect-copie\n\n/home/student/lab13/arhiva/proiect-copie:\ndocs  src\n...',
        explain: 'Arborele `proiect` a fost duplicat sub un alt nume.',
      },
    },
    {
      title: 'Verifică, apoi șterge copia',
      purpose: 'Ștergerea este definitivă; confirmi ținta, apoi folosești `rm -r` pe calea exactă.',
      hint: 'Rulează `ls -ld` pe țintă înainte de `rm -r`. Nu folosi wildcard-uri când calea exactă e simplă.',
      commands: 'ls -ld ~/lab13/arhiva/proiect-copie\nrmdir ~/lab13/arhiva/proiect-copie\nrm -rv ~/lab13/arhiva/proiect-copie\nls -A ~/lab13/arhiva',
      explain: [
        ['ls -ld', 'confirmă că ținta este directorul așteptat.'],
        ['rmdir', 'EȘUEAZĂ intenționat: directorul nu este gol (vezi mesajul „Directory not empty”).'],
        ['rm -rv', 'șterge recursiv și afișează ce a șters; fără -f, ești întrebat doar dacă există alias `rm -i`.'],
        ['ls -A', 'listează tot, inclusiv fișierele ascunse, fără . și ..'],
      ],
      output: {
        label: 'illustrative',
        code: "rmdir: failed to remove '/home/student/lab13/arhiva/proiect-copie': Directory not empty\nremoved '/home/student/lab13/arhiva/proiect-copie/docs/notite.txt'\n...\nremoved directory '/home/student/lab13/arhiva/proiect-copie'\nplan-v1.txt",
        explain: 'După ștergere, în `arhiva` rămâne doar `plan-v1.txt`. Mesajele exacte pot diferi între versiuni.',
      },
      reflect: 'Ce s-ar fi întâmplat cu `rm -rf ~/lab13/arhiva /proiect-copie` (spațiu în plus)?',
    },
    {
      title: 'Wildcards: verifică înainte de a șterge',
      purpose: 'Vezi ce potrivește un tipar, apoi acționează.',
      hint: 'Aceeași expresie wildcard, mai întâi cu `ls`.',
      commands: 'ls ~/lab13/proiect/docs/*.txt\nls ~/lab13/proiect/docs/n*\nls ~/lab13/proiect/docs/[np]*.txt',
      explain: [
        ['*.txt', 'toate numele care se termină în .txt.'],
        ['n*', 'toate numele care încep cu n.'],
        ['[np]*.txt', 'un prim caracter din setul {n, p}, urmat de orice, terminat în .txt.'],
      ],
    },
  ],
  verification: [
    { cmd: 'ls -R ~/lab13', expected: 'arborele conține `arhiva/plan-v1.txt`, `proiect/docs/{notite.txt,plan.txt}`, `proiect/src/main.sh`; fără `proiect-copie`.' },
    { cmd: 'ls -A ~/lab13/arhiva', expected: 'doar `plan-v1.txt`.' },
    { cmd: 'echo $?', expected: '0 după fiecare comandă reușită.' },
  ],
  persistence: [
    'Fișierele și directoarele din home persistă după reboot.',
    'Confirmare manuală: repornește sau reautentifică-te și rulează `ls -R ~/lab13`.',
  ],
  mistakes: [
    '`cp` de director fără `-r`/`-a`.',
    'Spațiu în plus în `rm -rf` (două argumente în loc de unul).',
    'Folosirea unui wildcard în `rm` fără verificare prealabilă cu `ls`.',
    'Confuzia dintre o destinație care există și una care nu există la `cp -r`.',
  ],
  troubleshooting: [
    { symptom: '`cp: -r not specified; omitting directory`', cause: 'ai copiat un director fără -r', fix: 'repetă cu `cp -a` sau `cp -r`' },
    { symptom: 'în `arhiva` apare `proiect-copie/proiect`', cause: '`proiect-copie` exista deja la `cp -r`', fix: 'șterge ce a rezultat și repetă, sau folosește o destinație nouă' },
    { symptom: '`rmdir: Directory not empty`', cause: 'directorul conține fișiere', fix: 'verifică cu `ls -A` și folosește `rm -r`' },
    { symptom: '`Permission denied`', cause: 'ai încercat în afara home-ului', fix: 'lucrează în `~/lab13` sau verifică permisiunile cu `ls -ld`' },
  ],
  alternatives: [
    'Structura se poate crea și cu `mkdir -p` apelat de mai multe ori, fără brace expansion.',
    'Copia directorului: `cp -r` face treaba, dar nu păstrează tot ce păstrează `-a`; `rsync -a` este o alternativă (L4.10).',
    'Ștergerea: `rm -r DIR` este echivalentul lui `rm -rv`; `find DIR -delete` este o alternativă mai avansată.',
  ],
};
