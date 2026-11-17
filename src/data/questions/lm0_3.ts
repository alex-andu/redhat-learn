import type { Question } from '../../lib/types';

const T = 'M0.3';
const O: string[] = [];

export const Q_M0_3: Question[] = [
  {
    id: 'M0.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre un terminal și un [[shell]]?',
    explanation: 'Terminalul transportă textul tastat și afișat; shell-ul este programul care interpretează comenzile și pornește alte programe.',
    options: [
      { id: 'a', text: 'Terminalul este fereastra/dispozitivul prin care tastezi și citești; shell-ul este programul care interpretează linia și rulează comenzile.', correct: true, why: 'Terminalul doar transportă caractere; „înțelegerea” comenzii o face shell-ul (pe RHEL, bash).' },
      { id: 'b', text: 'Sunt două nume pentru același lucru.', correct: false, why: 'Se pot schimba independent: poți deschide același shell într-un terminal grafic, pe consolă sau prin SSH.' },
      { id: 'c', text: 'Shell-ul este fereastra grafică, iar terminalul este programul care rulează comenzile.', correct: false, why: 'Este invers: fereastra (terminalul) nu interpretează nimic.' },
      { id: 'd', text: 'Terminalul este un tip de fișier din /etc, iar shell-ul un serviciu systemd.', correct: false, why: 'Shell-ul nu este un serviciu; este un program interactiv obișnuit (bash). Terminalul are, cel mult, un fișier special sub /dev (de exemplu /dev/pts/0).' },
    ],
  },
  {
    id: 'M0.3-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Promptul este `[root@srv2 var]#`. Ce poți deduce?',
    explanation: 'Promptul implicit RHEL: [utilizator@gazdă ultimul-director] urmat de $ pentru utilizator obișnuit sau # pentru root.',
    options: [
      { id: 'a', text: 'Ești utilizatorul `root`, pe gazda `srv2`, iar ultimul director din calea curentă se numește `var`.', correct: true, why: 'Cele trei elemente se citesc direct din prompt; `#` confirmă privilegiile de root. Dacă promptul a fost personalizat (variabila PS1), confirmă cu `whoami` sau `id`.' },
      { id: 'b', text: 'Directorul curent este /var, cu certitudine.', correct: false, why: 'Promptul arată doar ultimul element al căii; poate fi /var sau, de exemplu, /home/ana/var. Calea completă o dă `pwd`.' },
      { id: 'c', text: 'Comanda precedentă a eșuat.', correct: false, why: 'Promptul implicit nu conține exit status-ul; îl citești cu `echo $?`.' },
      { id: 'd', text: '`#` înseamnă că linia curentă este un comentariu.', correct: false, why: 'Semnificația de comentariu există în scripturi și fișiere de configurare, nu ca ultim caracter al promptului.' },
    ],
  },
  {
    id: 'M0.3-003', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'În linia `ls -l /etc`, ce sunt `-l` și `/etc`?',
    explanation: 'Cuvintele care încep cu cratimă sunt opțiuni; restul sunt argumente.',
    options: [
      { id: 'a', text: '`-l` este o opțiune; `/etc` este un argument.', correct: true, why: '`-l` schimbă formatul listării; `/etc` este directorul pe care lucrează `ls`.' },
      { id: 'b', text: '`-l` este un argument; `/etc` este o opțiune.', correct: false, why: 'Invers: opțiunile încep cu cratimă; o cale este un argument.' },
      { id: 'c', text: 'Amândouă sunt opțiuni.', correct: false, why: 'Poziția după comandă nu face din cuvânt o opțiune; semnul distinctiv este cratima.' },
      { id: 'd', text: 'Amândouă sunt comenzi diferite, separate prin spațiu.', correct: false, why: 'Doar primul cuvânt este comanda; restul sunt parametrii ei.' },
    ],
  },
  {
    id: 'M0.3-004', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmațiile despre expandările făcute de shell sunt adevărate? (alege toate cele corecte)',
    explanation: 'Shell-ul expandează variabilele, tilde și wildcard-urile ÎNAINTE să pornească comanda; comanda primește rezultatul.',
    options: [
      { id: 'a', text: 'În `echo *.txt`, asteriscul este înlocuit de shell cu lista fișierelor potrivite înainte ca `echo` să ruleze.', correct: true, why: 'Comanda nu vede `*`; vede numele de fișiere. De aceea `echo *.txt` este o verificare sigură înainte de `rm *.txt`.' },
      { id: 'b', text: 'Între apostrofuri simple, `$HOME` rămâne text literal.', correct: true, why: 'Apostrofurile simple dezactivează orice expandare.' },
      { id: 'c', text: 'Între ghilimele duble, `$HOME` este înlocuit cu valoarea variabilei.', correct: true, why: 'Ghilimelele duble păstrează spațiile ca parte a unui argument, dar permit expandarea $VAR și $(…).' },
      { id: 'd', text: '`touch fisier cu spatii` creează un singur fișier numit „fisier cu spatii”.', correct: false, why: 'Fără citare, shell-ul împarte linia la spații: `touch` primește trei argumente și creează trei fișiere.' },
    ],
  },
  {
    id: 'M0.3-005', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează directorul curent, ca cale absolută.',
    prompt: '[student@server1 ~]$', answers: ['pwd'], canonical: 'pwd',
    explanation: '`pwd` (print working directory) este o comandă fără argumente care afișează calea completă a directorului curent.',
    wrong: [
      { text: 'cd', why: '`cd` fără argument te mută în directorul home; nu afișează nimic.' },
      { text: 'ls', why: '`ls` listează conținutul directorului curent, nu calea lui.' },
      { text: 'where', why: '`where` nu este o comandă standard în bash.' },
      { text: 'whoami', why: '`whoami` afișează numele utilizatorului, nu directorul.' },
    ],
    hint: 'Numele este o prescurtare de la „print working directory”.',
  },
  {
    id: 'M0.3-006', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează exit status-ul ultimei comenzi rulate.',
    prompt: '[student@server1 ~]$', answers: ['echo $?'], canonical: 'echo $?',
    explanation: '`$?` este un parametru special care conține codul de ieșire al comenzii precedente; `echo` îl afișează.',
    wrong: [
      { text: 'echo $!', why: '`$!` este PID-ul ultimului proces pornit în fundal.' },
      { text: 'echo $$', why: '`$$` este PID-ul shell-ului curent.' },
      { text: 'echo ?', why: 'Fără `$`, `echo` afișează caracterul `?`.' },
      { text: 'echo $status', why: '`status` nu este o variabilă standard bash; rezultatul este o linie goală.' },
    ],
    hint: 'Parametrul special are numele format dintr-un singur semn de întrebare.',
  },
  {
    id: 'M0.3-007', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii prin care bash tratează o linie (de la primul la ultimul).',
    explanation: 'Descriere simplificată din manualul bash: împărțire în cuvinte și alias-uri, expandări, căutarea comenzii, execuția, exit status.',
    items: [
      { text: 'Afișează promptul și citește linia.', why: 'Orice ciclu începe cu promptul.' },
      { text: 'Împarte linia în cuvinte (respectând citarea) și înlocuiește alias-urile.', why: 'Fără împărțire nu se știe care e comanda și care sunt argumentele.' },
      { text: 'Face expandările (`$VAR`, `~`, `*`, `$(…)`).', why: 'Comanda primește textul deja expandat.' },
      { text: 'Caută comanda: funcție, builtin, apoi directoarele din PATH.', why: 'Un nume cu `/` nu mai este căutat în PATH.' },
      { text: 'Execută comanda (fork + exec pentru un program extern) și așteaptă.', why: 'Programele externe rulează într-un proces copil.' },
      { text: 'Salvează exit status-ul în `$?` și afișează din nou promptul.', why: 'Statusul rămâne disponibil până la următoarea comandă.' },
    ],
  },
  {
    id: 'M0.3-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește fiecare tip de „comandă” cu exemplul lui.',
    explanation: '`type` spune cum interpretează bash un nume.',
    leftLabel: 'Tip', rightLabel: 'Exemplu',
    pairs: [
      { left: 'builtin', right: '`cd`', why: 'Trebuie să fie internă, ca să schimbe directorul shell-ului însuși.' },
      { left: 'cuvânt rezervat', right: '`if`', why: '`type if` răspunde „shell keyword”; face parte din limbajul shell-ului.' },
      { left: 'alias', right: '`ll` definit cu `alias ll=\'ls -l\'`', why: 'Un alias înlocuiește un cuvânt cu o altă comandă.' },
      { left: 'fișier extern', right: '`/usr/bin/ls`', why: 'Un program pe disc, găsit prin PATH.' },
    ],
    distractors: [
      { text: '`$?`', why: 'Este un parametru special al shell-ului (exit status), nu o comandă.' },
    ],
  },
  {
    id: 'M0.3-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai adăugat în `~/.bashrc` linia de mai jos, dar `ll` nu funcționează într-un shell nou. Care este greșeala?',
    explanation: 'La atribuiri și alias-uri nu se pun spații în jurul lui `=`.',
    snippet: { kind: 'find-error', title: '~/.bashrc', code: "# alias personal\nalias ll = 'ls -l'" },
    options: [
      { id: 'a', text: 'Spațiile din jurul lui `=`.', correct: true, why: 'Bash vede trei argumente (`ll`, `=`, `ls -l`) și raportează că `=` nu este un alias; sintaxa corectă este `alias ll=\'ls -l\'`.' },
      { id: 'b', text: 'Apostrofurile simple: trebuie ghilimele duble.', correct: false, why: 'Ambele sunt valide; apostrofurile simple sunt chiar preferate, fiindcă nu expandează nimic la definire.' },
      { id: 'c', text: 'Comentariul de pe prima linie anulează linia următoare.', correct: false, why: 'Un comentariu se oprește la sfârșitul propriei linii.' },
      { id: 'd', text: 'Alias-urile nu pot fi puse în `~/.bashrc`.', correct: false, why: '`~/.bashrc` este locul uzual pentru alias-uri personale.' },
    ],
  },
  {
    id: 'M0.3-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Pe baza output-ului, de ce nu a rulat scriptul la a doua încercare, dar a rulat la a treia?',
    explanation: 'Directorul curent nu este în PATH; `./script` indică calea explicit.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'sesiune (exemplu)',
      code: '[student@server1 bin-test]$ ls\nsalut\n[student@server1 bin-test]$ salut\nbash: salut: command not found\n[student@server1 bin-test]$ ./salut\nSalut din script',
    },
    options: [
      { id: 'a', text: 'Directorul curent nu este în PATH; `./salut` indică explicit calea fișierului.', correct: true, why: 'Fără `/` în nume, bash caută doar în PATH. Cu `./`, folosește fișierul din directorul curent.' },
      { id: 'b', text: 'Fișierul `salut` nu există până la a treia încercare.', correct: false, why: '`ls` a arătat fișierul de la început.' },
      { id: 'c', text: 'Scriptul a fost recompilat între timp.', correct: false, why: 'Scripturile nu se compilează; mesajul „command not found” vine din căutarea în PATH.' },
      { id: 'd', text: 'Fișierul nu are drept de execuție la a doua încercare.', correct: false, why: 'Lipsa dreptului de execuție produce „Permission denied”, nu „command not found”.' },
    ],
  },
  {
    id: 'M0.3-011', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce afișează a doua comandă `bash -c` și de ce?',
    explanation: 'O variabilă de shell neexportată nu este moștenită de procesele copil; după `export` devine variabilă de mediu.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'sesiune (exemplu)',
      code: "[student@server1 ~]$ NUME=Ana\n[student@server1 ~]$ bash -c 'echo \"[$NUME]\"'\n[]\n[student@server1 ~]$ export NUME\n[student@server1 ~]$ bash -c 'echo \"[$NUME]\"'\n[Ana]",
    },
    options: [
      { id: 'a', text: '`[Ana]`, pentru că `export` a făcut variabila variabilă de mediu, moștenită de shell-ul copil.', correct: true, why: 'Mediul este copiat în procesul copil; fără export, copilul nu o vede.' },
      { id: 'b', text: '`[]`, pentru că bash -c ignoră întotdeauna variabilele.', correct: false, why: 'Un shell copil citește variabilele din mediul primit; fără export nu are ce citi.' },
      { id: 'c', text: 'O eroare, fiindcă `export` șterge variabila.', correct: false, why: '`export` o marchează pentru mediu; ștergerea se face cu `unset`.' },
      { id: 'd', text: '`[$NUME]`, pentru că apostrofurile împiedică orice expandare, inclusiv în copil.', correct: false, why: 'Apostrofurile exterioare opresc doar shell-ul părinte; copilul primește textul `echo "[$NUME]"` și îl expandează el.' },
    ],
  },
  {
    id: 'M0.3-012', topicId: T, objectives: O, difficulty: 1, type: 'multi',
    stem: 'Vrei să afli ce face opțiunea `-S` a comenzii `ls`, fără internet. Ce poți folosi? (alege toate cele corecte)',
    explanation: 'Documentația locală: `--help`, `man`, `info`, `/usr/share/doc`.',
    options: [
      { id: 'a', text: '`ls --help`', correct: true, why: 'Afișează rezumatul opțiunilor direct în terminal; poți filtra cu `| grep -- -S`.' },
      { id: 'b', text: '`man ls`', correct: true, why: 'Manualul complet; caută cu `/-S`, ieși cu `q`.' },
      { id: 'c', text: '`help ls`', correct: false, why: '`help` documentează doar builtin-urile bash; `ls` este un program extern.' },
      { id: 'd', text: '`which ls`', correct: false, why: '`which` afișează doar calea fișierului executabil; nu explică opțiunile.' },
    ],
  },
];
