import type { Question } from '../../lib/types';

const T = 'L1.4';
const O = ['C1-7'];

export const Q_L1_4: Question[] = [
  {
    id: 'L1.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai deschis un fișier cu `vi` și vrei să adaugi text. Ce trebuie să faci mai întâi?',
    explanation: '`vi` pornește în modul Normal, unde tastele sunt comenzi, nu text. Pentru a scrie, intri în modul Insert.',
    options: [
      { id: 'a', text: 'Apeși `i` (sau `a`/`o`) pentru a intra în modul Insert.', correct: true, why: 'Din Normal, `i`, `a`, `o` etc. trec în Insert, unde tastele scriu text.' },
      { id: 'b', text: 'Apeși `:wq`.', correct: false, why: '`:wq` salvează și iese; nu intră în modul de scriere.' },
      { id: 'c', text: 'Începi să tastezi direct.', correct: false, why: 'În Normal, tastele execută comenzi (de ex. `d`, `x`) și pot șterge text.' },
      { id: 'd', text: 'Apeși `Ctrl+O`.', correct: false, why: '`Ctrl+O` este scurtătura de salvare din nano, nu din vim.' },
    ],
  },
  {
    id: 'L1.4-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai modificat un fișier în `vi` și vrei să-l închizi aruncând modificările. Ce comandă folosești?',
    explanation: '`:q!` iese fără salvare; `:q` simplu refuză dacă există modificări nesalvate.',
    options: [
      { id: 'a', text: '`:q!`', correct: true, why: 'Semnul `!` forțează ieșirea și aruncă modificările din buffer.' },
      { id: 'b', text: '`:wq`', correct: false, why: 'Salvează modificările, deci nu le aruncă.' },
      { id: 'c', text: '`:q`', correct: false, why: 'Refuză să iasă cât timp există modificări nesalvate (E37).' },
      { id: 'd', text: '`:w`', correct: false, why: 'Doar salvează; rămâi în editor.' },
    ],
  },
  {
    id: 'L1.4-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre comenzile `vi` salvează fișierul și închid editorul? (alege toate cele corecte)',
    explanation: '`:wq`, `:x` și `ZZ` au același efect final: salvează și ies. `:q!` aruncă modificările.',
    options: [
      { id: 'a', text: '`:wq`', correct: true, why: 'write + quit.' },
      { id: 'b', text: '`ZZ` (în modul Normal)', correct: true, why: 'Scurtătură: salvează dacă există modificări și iese.' },
      { id: 'c', text: '`:x`', correct: true, why: 'Echivalent cu `:wq` (scrie doar dacă există modificări).' },
      { id: 'd', text: '`:q!`', correct: false, why: 'Iese fără a salva.' },
    ],
  },
  {
    id: 'L1.4-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Adaugă linia `port=8080` la sfârșitul fișierului `app.conf`, fără a-i șterge conținutul existent și fără editor.',
    prompt: '[student@server1 ~]$',
    answers: ['echo port=8080 >> app.conf', 'echo "port=8080" >> app.conf', "echo 'port=8080' >> app.conf"],
    canonical: 'echo "port=8080" >> app.conf',
    explanation: '`>>` adaugă la sfârșitul fișierului; `>` l-ar goli mai întâi.',
    wrong: [
      { text: 'echo "port=8080" > app.conf', why: '`>` trunchiază fișierul: pierzi tot ce era în `app.conf`.' },
      { text: 'echo "port=8080" | app.conf', why: 'Un pipe cere o comandă în dreapta; `app.conf` nu este o comandă.' },
      { text: 'touch app.conf "port=8080"', why: '`touch` creează fișiere (numite `app.conf` și `port=8080`), nu scrie conținut.' },
    ],
    hint: 'Operatorul de adăugare este format din două caractere.',
  },
  {
    id: 'L1.4-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a adăuga o linie nouă la sfârșitul unui fișier în `vi` și a salva.',
    explanation: 'Ciclul Normal → Insert → Normal → linia de comandă este baza lucrului în vi.',
    items: [
      { text: '`vi fișier`', why: 'Deschizi fișierul; editorul pornește în modul Normal.' },
      { text: '`G` apoi `o`', why: '`G` sare la ultima linie; `o` deschide o linie nouă dedesubt și intră în Insert.' },
      { text: 'Scrii textul liniei', why: 'În modul Insert, tastele scriu text.' },
      { text: '`Esc`', why: 'Revii în modul Normal, ca să poți da comenzi.' },
      { text: '`:wq` + Enter', why: 'Salvezi și ieși.' },
    ],
  },
  {
    id: 'L1.4-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește comanda `vi` (modul Normal) cu efectul.',
    explanation: 'Taste de bază pentru editare în modul Normal.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`dd`', right: 'șterge linia curentă', why: 'd + d: șterge linia întreagă.' },
      { left: '`yy`', right: 'copiază linia curentă', why: 'yank = copiere.' },
      { left: '`p`', right: 'lipește după cursor/linie', why: 'put: inserează conținutul copiat sau șters.' },
      { left: '`u`', right: 'anulează ultima modificare', why: 'undo; `Ctrl+r` este redo.' },
      { left: '`/text`', right: 'caută „text” în fișier', why: '`n` merge la următoarea potrivire.' },
    ],
    distractors: [{ text: 'salvează fișierul', why: 'Salvarea se face din linia de comandă: `:w`.' }],
  },
  {
    id: 'L1.4-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pe un fișier de configurare ai tastat o modificare în `vi`, dar după `:wq` ai constatat că fișierul conține și textul `:wq`. Ce s-a întâmplat?',
    explanation: 'Dacă nu ai apăsat `Esc`, ai rămas în modul Insert, iar `:wq` a fost scris ca text.',
    snippet: { kind: 'find-error', title: 'ce ai tastat', code: 'i\nport=8080\n:wq\n<Enter>' },
    options: [
      { id: 'a', text: 'Lipsea `Esc` înainte de `:wq`; editorul era în Insert și a tratat `:wq` ca text.', correct: true, why: 'Comenzile cu `:` funcționează doar în modul Normal. Remediere: `Esc`, șterge linia nedorită, apoi `:wq`.' },
      { id: 'b', text: '`vi` nu acceptă `:wq`; trebuia `ZZ` în Insert.', correct: false, why: '`:wq` este corect, dar în modul Normal.' },
      { id: 'c', text: 'Fișierul era readonly.', correct: false, why: 'Ar fi apărut un avertisment, nu textul `:wq` în fișier.' },
      { id: 'd', text: 'Trebuia `i` după `:wq`.', correct: false, why: '`i` intră în Insert; nu are legătură cu salvarea.' },
    ],
  },
  {
    id: 'L1.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți indică mesajul de mai jos la deschiderea unui fișier cu `vi`?',
    explanation: 'Vim creează un fișier `.nume.swp` cât timp editezi; el rămâne dacă sesiunea s-a terminat anormal sau dacă fișierul este deschis în altă parte.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'vi', code: 'E325: ATTENTION\nFound a swap file by the name ".nota.txt.swp"\n(1) Another program may be editing the same file.\n(2) An edit session for this file crashed.' },
    options: [
      { id: 'a', text: 'Fișierul este deschis în alt loc sau o sesiune anterioară a fost întreruptă; verifică înainte să ștergi `.swp`.', correct: true, why: 'Cele două cauze sunt exact (1) și (2) din mesaj; ștergerea fără verificare poate pierde modificări recuperabile.' },
      { id: 'b', text: 'Fișierul nota.txt este corupt și trebuie șters.', correct: false, why: 'Mesajul vorbește despre fișierul swap, nu despre corupția fișierului.' },
      { id: 'c', text: 'Nu ai drept de scriere pe fișier.', correct: false, why: 'Pentru drepturi, vim afișează „readonly”, nu E325.' },
      { id: 'd', text: 'Editorul nu este instalat corect.', correct: false, why: 'Editorul rulează; mesajul este despre un fișier auxiliar.' },
    ],
  },
  {
    id: 'L1.4-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'În `nano`, cum salvezi modificările și închizi editorul?',
    explanation: 'În nano, scurtăturile sunt afișate jos: `^O` (Write Out) salvează, `^X` iese; la ieșire cu modificări nesalvate te întreabă.',
    options: [
      { id: 'a', text: '`Ctrl+O` (confirmi numele cu Enter), apoi `Ctrl+X`.', correct: true, why: 'Prima salvează, a doua iese.' },
      { id: 'b', text: '`Esc`, apoi `:wq`.', correct: false, why: 'Aceasta este secvența din vim; nano nu are linie de comandă cu `:`.' },
      { id: 'c', text: '`Ctrl+S`, apoi `Ctrl+Q`.', correct: false, why: 'În terminal, `Ctrl+S` / `Ctrl+Q` sunt controlul fluxului (pot îngheța/dezgheța afișarea), nu salvare.' },
      { id: 'd', text: '`ZZ`.', correct: false, why: '`ZZ` este o comandă vim în modul Normal.' },
    ],
  },
];
