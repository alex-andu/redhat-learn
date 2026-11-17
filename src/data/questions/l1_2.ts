import type { Question } from '../../lib/types';

const T = 'L1.2';
const O = ['C1-11'];

export const Q_L1_2: Question[] = [
  {
    id: 'L1.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'În ce secțiune a manualului găsești, de regulă, formatul unui fișier de configurare precum `/etc/fstab`?',
    explanation: 'Secțiunea 5 documentează formatele de fișiere și fișierele de configurare; secțiunea 1 documentează comenzile pentru utilizatori; 8 administrarea.',
    options: [
      { id: 'a', text: 'Secțiunea 1', correct: false, why: 'Secțiunea 1 conține comenzi și programe pentru utilizatori (`ls`, `cp`).' },
      { id: 'b', text: 'Secțiunea 5', correct: true, why: 'Formatele de fișiere și fișierele de configurare: `fstab(5)`, `passwd(5)`, `sshd_config(5)`.' },
      { id: 'c', text: 'Secțiunea 8', correct: false, why: 'Secțiunea 8 documentează comenzile de administrare (`mount(8)`), nu formatul fișierelor.' },
      { id: 'd', text: 'Secțiunea 3', correct: false, why: 'Secțiunea 3 descrie funcții de bibliotecă pentru programatori.' },
    ],
  },
  {
    id: 'L1.2-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Deschide pagina de manual care descrie formatul fișierului `/etc/passwd` (nu comanda `passwd`).',
    prompt: '[student@server1 ~]$', answers: ['man 5 passwd'], canonical: 'man 5 passwd',
    explanation: 'Numărul secțiunii se pune între `man` și numele paginii. Secțiunea 5 este cea cu formatul fișierului.',
    wrong: [
      { text: 'man passwd', why: 'Deschide prima secțiune găsită, de regulă pagina comenzii `passwd(1)`, nu formatul fișierului.' },
      { text: 'man passwd 5', why: 'Ordinea este greșită: secțiunea vine înaintea numelui; aici `5` ar fi tratat ca altă pagină căutată.' },
      { text: 'man -k passwd', why: '`-k` caută cuvântul în descrieri și listează pagini potrivite, dar nu deschide pagina fișierului.' },
      { text: 'man 1 passwd', why: 'Secțiunea 1 este comanda `passwd`, nu fișierul.' },
    ],
  },
  {
    id: 'L1.2-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Nu știi numele comenzii care raportează utilizarea discului. Care dintre acestea te ajută să o găsești pornind de la descriere? (alege toate cele corecte)',
    explanation: '`man -k` și `apropos` caută cuvântul în descrierile paginilor. `man -f` și `whatis` caută doar nume exacte.',
    options: [
      { id: 'a', text: '`man -k "disk usage"`', correct: true, why: '`-k` caută în descrieri; listează pagini precum `du` sau `df` dacă indexul există.' },
      { id: 'b', text: '`apropos "disk usage"`', correct: true, why: '`apropos` este echivalent cu `man -k`.' },
      { id: 'c', text: '`whatis "disk usage"`', correct: false, why: '`whatis` (= `man -f`) caută nume exacte de pagini, nu cuvinte din descriere.' },
      { id: 'd', text: '`man disk-usage`', correct: false, why: 'Presupune un nume de pagină inventat; dacă nu există, răspunsul este „No manual entry”.' },
    ],
  },
  {
    id: 'L1.2-004', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii eficienți pentru a afla cum se face o sarcină pe un sistem fără internet.',
    explanation: 'Flux tipic: cauți după funcție, alegi pagina și secțiunea, citești sinopsisul, cauți opțiunea în pagină, apoi verifici prin încercare.',
    items: [
      { text: 'Rulezi `man -k cuvânt-cheie` și parcurgi descrierile.', why: 'Pornești de la funcție când nu știi numele comenzii.' },
      { text: 'Alegi pagina și secțiunea potrivite din listă (de exemplu `fstab (5)`).', why: 'Secțiunea corectă determină ce documentație primești.' },
      { text: 'Deschizi pagina cu `man SECȚIUNE NUME` și citești SYNOPSIS.', why: 'Sinopsisul arată forma corectă a comenzii/fișierului.' },
      { text: 'Cauți opțiunea sau termenul cu `/text` și `n` în pager.', why: 'Evită citirea întregii pagini.' },
      { text: 'Aplici comanda și verifici rezultatul (`echo $?`, ls, etc.).', why: 'Documentația nu înlocuiește verificarea rezultatului.' },
    ],
  },
  {
    id: 'L1.2-005', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește secțiunea manualului cu conținutul ei.',
    explanation: 'Numerele secțiunilor sunt convenții standard ale manualului Unix/Linux.',
    leftLabel: 'Secțiune', rightLabel: 'Conținut',
    pairs: [
      { left: '1', right: 'comenzi pentru utilizatori', why: 'Exemple: `ls(1)`, `cp(1)`, `grep(1)`.' },
      { left: '5', right: 'formate de fișiere și fișiere de configurare', why: 'Exemple: `fstab(5)`, `passwd(5)`.' },
      { left: '8', right: 'comenzi de administrare', why: 'Exemple: `mount(8)`, `mandb(8)`.' },
      { left: '7', right: 'concepte, convenții, diverse', why: 'Exemple: `man(7)`, `signal(7)`.' },
    ],
    distractors: [{ text: 'funcții de bibliotecă pentru programatori', why: 'Aceasta este secțiunea 3, care nu apare în lista cerută.' }],
  },
  {
    id: 'L1.2-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care linie din această listă de comenzi va eșua cu „No manual entry”?',
    explanation: '`fstab` este documentat în secțiunea 5, nu în 8. Cerând-o explicit din altă secțiune, man nu găsește pagina.',
    snippet: { kind: 'find-error', title: 'comenzi încercate', code: 'man -k "password"\nman 8 fstab\nman info' },
    options: [
      { id: 'a', text: '`man -k "password"`', correct: false, why: 'Sintaxă validă: caută cuvântul în descrieri (poate cere `mandb` dacă indexul lipsește, dar nu este eroarea „No manual entry”).' },
      { id: 'b', text: '`man 8 fstab`', correct: true, why: 'Pagina fstab este în secțiunea 5; secțiunea 8 nu o conține.' },
      { id: 'c', text: '`man info`', correct: false, why: '`info(1)` are o pagină man proprie; comanda este validă.' },
      { id: 'd', text: 'Toate cele trei sunt greșite.', correct: false, why: 'Două dintre ele sunt valide.' },
    ],
  },
  {
    id: 'L1.2-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Pe baza output-ului de mai jos, ce înseamnă `(1)` și `(5)` și ce pagină ar deschide `man passwd`?',
    explanation: 'Numărul din paranteze este secțiunea. `man passwd` fără secțiune alege prima secțiune în ordinea implicită, de regulă 1.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'man -f passwd', code: '[student@server1 ~]$ man -f passwd\npasswd (1)           - update user\'s authentication tokens\npasswd (5)           - password file' },
    options: [
      { id: 'a', text: 'Secțiuni diferite; `man passwd` deschide, de regulă, pagina comenzii din secțiunea 1.', correct: true, why: 'Ordinea implicită a secțiunilor pune 1 înaintea lui 5. Pentru formatul fișierului ceri explicit `man 5 passwd`.' },
      { id: 'b', text: 'Versiuni ale aceleiași pagini; `man passwd` le afișează pe ambele.', correct: false, why: 'Nu sunt versiuni, ci pagini diferite din secțiuni diferite; `man passwd` afișează una singură (cu `-a` le parcurgi pe rând).' },
      { id: 'c', text: 'Numărul de linii din pagină.', correct: false, why: 'Numărul din paranteze nu are legătură cu lungimea paginii.' },
      { id: 'd', text: 'Pagina (5) este o copie de rezervă a paginii (1).', correct: false, why: 'Paginile sunt documente distincte: una despre comandă, cealaltă despre fișierul `/etc/passwd`.' },
    ],
  },
  {
    id: 'L1.2-008', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce afișează `rpm -qd bash`?',
    explanation: '`-q` = query (interogare), `-d` (`--docfiles`) = fișierele marcate ca documentație ale pachetului indicat.',
    options: [
      { id: 'a', text: 'Fișierele de documentație ale pachetului `bash` instalat.', correct: true, why: '`rpm -qd` listează documentația (pagini man, info, README) pentru un pachet instalat.' },
      { id: 'b', text: 'Toate fișierele de configurare ale pachetului.', correct: false, why: 'Fișierele de configurare se listează cu `-c` (`--configfiles`).' },
      { id: 'c', text: 'Dependențele pachetului.', correct: false, why: 'Dependențele se văd cu `rpm -qR`.' },
      { id: 'd', text: 'Dacă pachetul are actualizări disponibile.', correct: false, why: '`rpm` nu consultă repository-urile; actualizările se verifică cu `dnf` (C2).' },
    ],
  },
  {
    id: 'L1.2-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'După instalarea unui pachet nou, `man -k numeprogram` răspunde „nothing appropriate”, deși `man numeprogram` funcționează. Care este cauza cea mai probabilă și remedierea?',
    explanation: '`man NUME` citește direct fișierul paginii; `man -k` folosește un index separat, construit de `mandb`.',
    options: [
      { id: 'a', text: 'Indexul `man -k` nu a fost actualizat; rulezi `sudo mandb`.', correct: true, why: 'Indexul este independent de pagini; `mandb` îl reconstruiește.' },
      { id: 'b', text: 'Pagina man este coruptă; reinstalezi sistemul.', correct: false, why: 'Dacă `man numeprogram` funcționează, pagina este bună.' },
      { id: 'c', text: 'Trebuie folosit `man -f`, care înlocuiește `-k`.', correct: false, why: '`-f` caută nume exacte; nu înlocuiește `-k`, iar ambele depind de același index.' },
      { id: 'd', text: 'Trebuie repornit sistemul.', correct: false, why: 'Un reboot nu reconstruiește indexul; `mandb` o face.' },
    ],
  },
];
