import type { Question } from '../../lib/types';

const T = 'L9.2';
const O = ['C9-2'];

export const Q_L9_2: Question[] = [
  {
    id: 'L9.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Unde este stocat hash-ul parolei unui utilizator local?',
    explanation: 'Hash-urile sunt în `/etc/shadow`, lizibil doar de root; `/etc/passwd` are doar marcajul `x`.',
    options: [
      { id: 'a', text: '`/etc/shadow`', correct: true, why: 'Câmpul 2 conține hash-ul sau marcaje precum `!`.' },
      { id: 'b', text: '`/etc/passwd`', correct: false, why: 'Fișierul este public; are doar `x` în câmpul parolei.' },
      { id: 'c', text: '`/etc/group`', correct: false, why: 'Conține grupurile, nu parolele utilizatorilor.' },
      { id: 'd', text: '`/etc/login.defs`', correct: false, why: 'Conține valori implicite pentru conturi noi, nu hash-uri.' },
    ],
  },
  {
    id: 'L9.2-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Ca administrator, setează parola utilizatorului `alice` (interactiv).',
    prompt: '[student@server1 ~]$',
    answers: ['sudo passwd alice'],
    canonical: 'sudo passwd alice',
    explanation: 'root poate seta parola oricui, fără parola veche.',
    wrong: [
      { text: 'passwd alice', why: 'Un utilizator obișnuit nu poate schimba parola altuia.' },
      { text: 'sudo usermod -p alice', why: '-p cere un hash deja calculat și un argument; nu este metoda interactivă.' },
      { text: 'sudo chage alice', why: 'chage gestionează aging-ul, nu schimbă parola.' },
    ],
  },
  {
    id: 'L9.2-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Forțează utilizatorul `alice` să își schimbe parola la următorul login, folosind `chage`.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo chage -d 0 alice'],
    canonical: 'sudo chage -d 0 alice',
    explanation: '`-d 0` setează „ultima schimbare” la ziua 0, ceea ce obligă schimbarea (shadow(5)).',
    wrong: [
      { text: 'sudo chage -d 1 alice', why: 'Doar valoarea 0 forțează schimbarea; 1 este o dată în 1970.' },
      { text: 'sudo chage -M 0 alice', why: '-M 0 setează maximul la 0 zile și poate cauza efecte neașteptate; nu e metoda indicată.' },
      { text: 'sudo chage -E 0 alice', why: '-E se referă la expirarea contului, nu a parolei.' },
    ],
  },
  {
    id: 'L9.2-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Setează ca parola utilizatorului `bob` să expire după 60 de zile (folosește `chage`).',
    prompt: '[student@server1 ~]$',
    answers: ['sudo chage -M 60 bob', 'sudo chage --maxdays 60 bob'],
    canonical: 'sudo chage -M 60 bob',
    explanation: '-M (majusculă) = vârsta maximă a parolei.',
    wrong: [
      { text: 'sudo chage --mindays 60 bob', why: '--mindays (-m) este vârsta MINIMĂ, nu maximă.' },
      { text: 'sudo chage -E 60 bob', why: '-E setează expirarea contului (dată), nu a parolei.' },
      { text: 'sudo chage -I 60 bob', why: '-I este perioada de inactivitate după expirare.' },
    ],
  },
  {
    id: 'L9.2-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este diferența dintre `passwd -l alice` și `usermod -e 1 alice`?',
    explanation: 'Blocarea parolei oprește doar autentificarea cu parolă; expirarea contului îl dezactivează (inclusiv pentru chei SSH).',
    options: [
      { id: 'a', text: '`passwd -l` blochează doar parola; `usermod -e 1` expiră contul, deci îl dezactivează complet.', correct: true, why: 'passwd(1): -l nu dezactivează contul; sugerează usermod --expiredate 1.' },
      { id: 'b', text: 'Sunt identice.', correct: false, why: 'Au efecte diferite asupra autentificărilor prin cheie.' },
      { id: 'c', text: '`passwd -l` șterge contul.', correct: false, why: 'Nu șterge nimic; adaugă `!` la hash.' },
      { id: 'd', text: '`usermod -e 1` blochează doar parola.', correct: false, why: '-e setează data de expirare a contului, nu atinge hash-ul.' },
    ],
  },
  {
    id: 'L9.2-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai schimbat `PASS_MAX_DAYS` la 60 în `/etc/login.defs`. Ce se întâmplă cu conturile existente?',
    explanation: 'Valorile PASS_* se aplică doar la crearea conturilor (login.defs(5)).',
    options: [
      { id: 'a', text: 'Nimic: se aplică doar conturilor create după modificare; pentru cele existente folosești `chage`.', correct: true, why: 'login.defs(5): „Any changes to these settings won\'t affect existing accounts”.' },
      { id: 'b', text: 'Toate conturile primesc imediat maximul de 60 de zile.', correct: false, why: 'Aging-ul existent este în /etc/shadow, nu se rescrie.' },
      { id: 'c', text: 'Doar conturile root.', correct: false, why: 'Nu există o astfel de regulă.' },
      { id: 'd', text: 'Se aplică după reboot.', correct: false, why: 'Rebootul nu schimbă valorile deja scrise în shadow.' },
    ],
  },
  {
    id: 'L9.2-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Linia de mai jos este din `/etc/shadow`. Ce înseamnă `!` la începutul câmpului parolei?',
    explanation: 'Prefixul `!` = parola blocată; restul șirului este hash-ul de dinainte de blocare.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/etc/shadow', code: 'alice:!$6$Zx9abc$Qw...:20409:0:99999:7:::' },
    options: [
      { id: 'a', text: 'Parola contului este blocată; deblocarea (`passwd -u`) readuce parola veche.', correct: true, why: 'shadow(5): începe cu `!` = locked; restul = parola anterioară.' },
      { id: 'b', text: 'Contul a expirat.', correct: false, why: 'Expirarea contului este câmpul 8 (aici gol).' },
      { id: 'c', text: 'Parola este în clar.', correct: false, why: 'Valoarea este un hash ($6$).' },
      { id: 'd', text: 'Utilizatorul trebuie să schimbe parola la login.', correct: false, why: 'Aceasta ar fi o valoare 0 în câmpul 3.' },
    ],
  },
  {
    id: 'L9.2-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi arată sau schimbă regulile de aging ale lui `alice`?',
    explanation: 'chage și passwd gestionează aging; id nu are legătură.',
    options: [
      { id: 'a', text: '`sudo chage -l alice`', correct: true, why: 'Afișează toate datele de aging.' },
      { id: 'b', text: '`sudo passwd -S alice`', correct: true, why: 'Afișează starea și numerele min/max/warn/inactive.' },
      { id: 'c', text: '`sudo passwd -x 90 alice`', correct: true, why: '-x setează vârsta maximă a parolei.' },
      { id: 'd', text: '`id alice`', correct: false, why: 'Afișează UID/GID/grupuri, nu aging.' },
    ],
  },
  {
    id: 'L9.2-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Contul `alice` are `-M 90 -W 14 -I 30`. Parola a fost schimbată în ziua Z. Când începe avertizarea la login?',
    explanation: 'Avertizarea începe cu W zile înainte de expirare: Z + 90 − 14.',
    options: [
      { id: 'a', text: 'La Z + 76 de zile.', correct: true, why: '90 − 14 = 76.' },
      { id: 'b', text: 'La Z + 14 zile.', correct: false, why: '14 este durata avertizării, nu momentul ei de început.' },
      { id: 'c', text: 'La Z + 120 de zile.', correct: false, why: '120 = 90 + 30 este momentul blocării contului după inactivitate.' },
      { id: 'd', text: 'La Z + 30 de zile.', correct: false, why: '30 este perioada de inactivitate.' },
    ],
  },
  {
    id: 'L9.2-010', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Cerința: „contul `contractor` să expire pe 31 decembrie 2027”. Ce comandă este corectă?',
    explanation: '`chage -E` (sau `usermod -e`) cu data în format YYYY-MM-DD.',
    options: [
      { id: 'a', text: '`sudo chage -E 2027-12-31 contractor`', correct: true, why: 'Setează expirarea contului.' },
      { id: 'b', text: '`sudo chage -M 2027-12-31 contractor`', correct: false, why: '-M este vârsta maximă a parolei, în zile, nu o dată.' },
      { id: 'c', text: '`sudo chage -E 31-12-2027 contractor`', correct: false, why: 'Formatul datei este YYYY-MM-DD.' },
      { id: 'd', text: '`sudo passwd -E 2027-12-31 contractor`', correct: false, why: 'passwd nu are opțiunea -E cu acest sens.' },
    ],
  },
  {
    id: 'L9.2-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a pregăti un cont nou `eva`: parolă inițială, schimbare forțată, politică de 90 de zile.',
    explanation: 'Contul trebuie să existe; apoi parola, apoi regulile.',
    items: [
      { text: '`sudo useradd -m eva` — creezi contul', why: 'Fără cont nu poți seta parola.' },
      { text: '`sudo passwd eva` — setezi parola inițială', why: 'Contul nou are parola blocată.' },
      { text: '`sudo chage -M 90 -W 14 eva` — politica de parole', why: 'Setezi maximul și avertizarea.' },
      { text: '`sudo chage -d 0 eva` — forțezi schimbarea la primul login', why: 'Utilizatorul își alege propria parolă.' },
      { text: '`sudo chage -l eva` — verifici', why: 'Confirmi valorile din fișierul shadow.' },
    ],
  },
  {
    id: 'L9.2-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește opțiunea `chage` cu sensul ei.',
    explanation: 'Literele mici și mari au sensuri diferite.',
    leftLabel: 'Opțiune', rightLabel: 'Sens',
    pairs: [
      { left: '`-m`', right: 'vârsta minimă a parolei (zile între schimbări)', why: 'Literă mică.' },
      { left: '`-M`', right: 'vârsta maximă a parolei', why: 'Literă mare.' },
      { left: '`-I`', right: 'zile de inactivitate după expirarea parolei', why: 'Apoi contul se blochează.' },
      { left: '`-E`', right: 'data expirării contului', why: 'Format YYYY-MM-DD; -1 elimină.' },
    ],
    distractors: [{ text: 'grupul primar al utilizatorului', why: 'Se setează cu usermod -g (L9.1).' }],
  },
  {
    id: 'L9.2-013', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cerința: „contul `contractor` expiră pe 31 decembrie 2027”. Comanda de mai jos eșuează. De ce?',
    explanation: 'chage cere data în format YYYY-MM-DD (sau zile de la 1970).',
    snippet: { kind: 'find-error', title: 'comanda', code: 'sudo chage -E 31-12-2027 contractor' },
    options: [
      { id: 'a', text: 'Formatul datei este greșit: trebuie `2027-12-31`.', correct: true, why: 'chage(1): YYYY-MM-DD sau număr de zile de la 1970-01-01.' },
      { id: 'b', text: '-E nu există la chage.', correct: false, why: '-E (--expiredate) există și setează expirarea contului.' },
      { id: 'c', text: 'Numele contului trebuie scris înaintea opțiunilor.', correct: false, why: 'Numele contului este ultimul argument.' },
      { id: 'd', text: 'Data trebuie să fie în viitor cu cel puțin 365 de zile.', correct: false, why: 'Nu există o astfel de regulă.' },
    ],
  },
];
