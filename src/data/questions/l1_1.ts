import type { Question } from '../../lib/types';

const T = 'L1.1';
const O = ['C1-1'];

export const Q_L1_1: Question[] = [
  {
    id: 'L1.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Promptul este `[root@srv1 etc]#`. Ce poți deduce din el?',
    explanation: 'Promptul implicit RHEL are forma `[utilizator@gazdă director]` urmată de `$` (utilizator obișnuit) sau `#` (root, UID 0). Directorul afișat este doar ultimul element al căii (variabila `PS1` folosește `\\W`).',
    options: [
      { id: 'a', text: 'Ești utilizatorul `root`, pe gazda `srv1`, iar numele ultimului director din calea curentă este `etc`.', correct: true, why: 'Cele trei elemente se citesc direct din prompt; `#` confirmă privilegiile de root. Dacă promptul a fost personalizat (PS1), confirmă cu `whoami` sau `id`.' },
      { id: 'b', text: 'Directorul curent este `/etc`, cu certitudine.', correct: false, why: 'Promptul implicit afișează doar ultimul element al căii. Un director numit `etc` poate fi `/etc` sau, de exemplu, `/home/ana/etc`. Calea completă o dă `pwd`.' },
      { id: 'c', text: 'Ești un utilizator obișnuit; `#` marchează un comentariu.', correct: false, why: 'În prompt, `#` ca ultim caracter este convenția pentru root; `$` este pentru utilizatori obișnuiți. Semnificația de comentariu există doar în scripturi și în linii de configurare.' },
      { id: 'd', text: 'Comanda precedentă s-a încheiat cu eroare.', correct: false, why: 'Promptul implicit nu codifică exit status-ul; acesta se citește cu `echo $?`.' },
    ],
  },
  {
    id: 'L1.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'În linia `ls -l /etc`, ce sunt `-l` și `/etc`?',
    explanation: 'După numele comenzii, cuvintele care încep cu `-` sunt opțiuni; restul sunt argumente.',
    options: [
      { id: 'a', text: '`-l` este o opțiune; `/etc` este un argument.', correct: true, why: '`-l` modifică formatul listării (format lung); `/etc` este directorul asupra căruia lucrează `ls`.' },
      { id: 'b', text: '`-l` este un argument; `/etc` este o opțiune.', correct: false, why: 'Invers: opțiunile încep cu cratimă; o cale precum `/etc` este un argument.' },
      { id: 'c', text: 'Ambele sunt opțiuni, fiindcă vin după comandă.', correct: false, why: 'Poziția după comandă nu face din cuvânt o opțiune; semnul distinctiv este cratima la început.' },
      { id: 'd', text: 'Ambele sunt argumente, iar opțiunile nu există în `ls`.', correct: false, why: '`ls` are zeci de opțiuni (`-l`, `-a`, `-h`, `-d`…), documentate în `man ls`.' },
    ],
  },
  {
    id: 'L1.1-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmațiile despre citare (quoting) în bash sunt adevărate? (alege toate cele corecte)',
    explanation: 'Apostroafele simple sunt literale; ghilimelele duble permit expandarea `$`; backslash protejează un singur caracter.',
    options: [
      { id: 'a', text: 'Între apostroafe simple (`\'...\'`), `$HOME` rămâne text literal.', correct: true, why: 'Apostroafele simple dezactivează orice expandare.' },
      { id: 'b', text: 'Între ghilimele duble, `$HOME` este înlocuit cu valoarea variabilei.', correct: true, why: 'Ghilimelele duble păstrează spațiile ca parte a unui argument, dar permit expandarea parametrilor (`$VAR`) și a substituțiilor `$(...)`.' },
      { id: 'c', text: '`touch fisier cu spatii` creează un singur fișier numit „fisier cu spatii”.', correct: false, why: 'Fără citare, shell-ul împarte linia în patru cuvinte; `touch` primește trei argumente și creează trei fișiere: `fisier`, `cu`, `spatii`.' },
      { id: 'd', text: '`touch fisier\\ cu\\ spatii` creează un singur fișier.', correct: true, why: 'Backslash înaintea spațiului îl face parte din argument; rezultatul este un singur argument.' },
    ],
  },
  {
    id: 'L1.1-004', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează exit status-ul ultimei comenzi rulate.',
    prompt: '[student@server1 ~]$', answers: ['echo $?'], canonical: 'echo $?',
    explanation: '`$?` conține exit status-ul comenzii precedente; `echo` îl afișează.',
    wrong: [
      { text: 'echo $!', why: '`$!` este PID-ul ultimului proces pornit în fundal, nu exit status-ul.' },
      { text: 'echo $$', why: '`$$` este PID-ul shell-ului curent.' },
      { text: 'echo ?', why: 'Fără `$`, `echo` afișează caracterul `?` literal.' },
      { text: 'echo $status', why: '`status` nu este o variabilă standard bash; `$status` este gol (în shell-uri ca csh/fish există altă convenție).' },
    ],
    hint: 'Variabila specială are numele format dintr-un singur semn de întrebare.',
  },
  {
    id: 'L1.1-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii prin care bash tratează o linie introdusă (de la primul la ultimul).',
    explanation: 'Descriere simplificată din manualul bash: citire și alias, expandări, căutarea comenzii, execuție, exit status.',
    items: [
      { text: 'Afișează promptul și citește linia.', why: 'Orice ciclu începe cu promptul și citirea intrării.' },
      { text: 'Împarte linia în cuvinte (respectând citarea) și înlocuiește alias-urile.', why: 'Fără împărțirea în cuvinte nu se știe care este comanda și care sunt argumentele; alias-urile se înlocuiesc la citire.' },
      { text: 'Face expandările (`$VAR`, `*`, `~`).', why: 'Comanda primește textul deja expandat, nu `*` sau `$VAR`.' },
      { text: 'Caută comanda: funcție, builtin, apoi PATH.', why: 'Ordinea de căutare este documentată în manual; un nume cu `/` nu mai este căutat în PATH.' },
      { text: 'Execută comanda și așteaptă terminarea (pentru comenzi în prim-plan).', why: 'Programele externe rulează în proces copil; shell-ul așteaptă.' },
      { text: 'Salvează exit status-ul în `$?` și revine la prompt.', why: 'Valoarea rămâne disponibilă până la comanda următoare.' },
    ],
  },
  {
    id: 'L1.1-006', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește fiecare element cu descrierea lui.',
    explanation: 'Elemente de bază ale shell-ului.',
    leftLabel: 'Element', rightLabel: 'Descriere',
    pairs: [
      { left: '`$?`', right: 'exit status-ul ultimei comenzi', why: 'Se citește imediat după comandă; 0 = succes.' },
      { left: '`PATH`', right: 'lista directoarelor în care se caută comenzi externe', why: 'Directoare separate prin `:`, parcurse în ordine.' },
      { left: '`cd`', right: 'comandă internă (builtin) a shell-ului', why: 'Trebuie să fie internă, ca să schimbe directorul shell-ului însuși.' },
      { left: '`&&`', right: 'rulează comanda următoare doar dacă precedenta a reușit', why: 'Condiționare pe exit status 0.' },
    ],
    distractors: [
      { text: 'redirecționează eroarea standard într-un fișier', why: 'Aceasta este `2>` (L1.5), nu un element din lista de mai sus.' },
    ],
  },
  {
    id: 'L1.1-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai adăugat în `~/.bashrc` această linie, dar `ll` nu funcționează într-un shell nou. Care este greșeala?',
    explanation: 'La atribuiri și alias-uri nu se pun spații în jurul lui `=`.',
    snippet: { kind: 'find-error', title: '~/.bashrc', code: "# alias personal\nalias ll = 'ls -l'" },
    options: [
      { id: 'a', text: 'Spațiile din jurul lui `=`.', correct: true, why: 'Bash interpretează `alias ll = \'ls -l\'` ca trei argumente (`ll`, `=`, `ls -l`) și raportează că `=` nu este un alias; sintaxa corectă este `alias ll=\'ls -l\'`.' },
      { id: 'b', text: 'Apostroafele simple: trebuie ghilimele duble.', correct: false, why: 'Ambele forme sunt valide la alias; apostroafele simple sunt chiar preferate, pentru că nu expandează nimic la definire.' },
      { id: 'c', text: 'Comentariul `# alias personal` anulează linia următoare.', correct: false, why: 'Comentariul se oprește la sfârșitul propriei linii.' },
      { id: 'd', text: 'Aliasurile nu pot fi puse în `~/.bashrc`.', correct: false, why: '`~/.bashrc` este locul uzual pentru alias-uri personale.' },
    ],
  },
  {
    id: 'L1.1-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Pe baza output-ului, ce înseamnă ultima linie, `127`?',
    explanation: 'Convenția bash: 127 = comanda nu a fost găsită; 126 = fișier găsit dar neexecutabil.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'sesiune (exemplu)',
      code: '[student@server1 ~]$ ls /etc/hostname\n/etc/hostname\n[student@server1 ~]$ echo $?\n0\n[student@server1 ~]$ comandainexistenta\nbash: comandainexistenta: command not found\n[student@server1 ~]$ echo $?\n127',
    },
    options: [
      { id: 'a', text: 'Comanda `comandainexistenta` nu a fost găsită (nici alias, nici builtin, nici în PATH).', correct: true, why: 'Mesajul `command not found` și codul 127 merg împreună în bash.' },
      { id: 'b', text: 'Comanda a rulat, dar a produs 127 de erori.', correct: false, why: 'Exit status nu numără erori; este un cod de stare între 0 și 255.' },
      { id: 'c', text: 'Comanda există, dar nu are drept de execuție.', correct: false, why: 'Acest caz are exit status 126 și mesajul `Permission denied`.' },
      { id: 'd', text: 'Comanda `ls` anterioară a eșuat.', correct: false, why: 'Pentru `ls` s-a afișat 0 (succes); `127` aparține comenzii imediat anterioare lui `echo $?`, adică `comandainexistenta`.' },
    ],
  },
];
