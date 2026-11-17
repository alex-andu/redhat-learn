import type { Question } from '../../lib/types';

const T = 'L2.4';
const O = ['C2-3'];

export const Q_L2_4: Question[] = [
  {
    id: 'L2.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care comandă adaugă un remote Flatpak numit `exemplu` pentru tot sistemul, fără eroare dacă există deja?',
    explanation: '`remote-add` cu `--if-not-exists`; fără `--user`, instalarea este cea de sistem și cere privilegii.',
    options: [
      { id: 'a', text: '`sudo flatpak remote-add --if-not-exists exemplu https://repo.exemplu.local/exemplu.flatpakrepo`', correct: true, why: 'Instalare de sistem (implicit), repetabilă fără eroare.' },
      { id: 'b', text: '`flatpak remote-add --user exemplu https://repo.exemplu.local/exemplu.flatpakrepo`', correct: false, why: '`--user` definește remote-ul doar pentru contul tău.' },
      { id: 'c', text: '`dnf config-manager --add-repo https://repo.exemplu.local/exemplu.flatpakrepo`', correct: false, why: 'Aceasta adaugă un repository RPM, nu unul Flatpak.' },
      { id: 'd', text: '`flatpak install exemplu`', correct: false, why: '`install` instalează aplicații; nu configurează remote-uri.' },
    ],
  },
  {
    id: 'L2.4-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce afișează `flatpak remotes -d`?',
    explanation: '`remotes` listează remote-urile; `-d` (`--show-details`) adaugă titlul și URL-ul.',
    options: [
      { id: 'a', text: 'Remote-urile configurate, cu titlu, URL și instalarea (system/user).', correct: true, why: 'Este comanda principală de verificare după `remote-add`.' },
      { id: 'b', text: 'Aplicațiile Flatpak instalate.', correct: false, why: 'Acelea se văd cu `flatpak list`.' },
      { id: 'c', text: 'Repository-urile RPM active.', correct: false, why: 'Acelea se văd cu `dnf repolist`.' },
      { id: 'd', text: 'Versiunea Flatpak.', correct: false, why: 'Aceea se vede cu `flatpak --version`.' },
    ],
  },
  {
    id: 'L2.4-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre instalările Flatpak `--system` și `--user` sunt corecte? (alege toate cele corecte)',
    explanation: 'Cele două instalări au configurații și remote-uri separate.',
    options: [
      { id: 'a', text: 'Un remote adăugat cu `--user` nu este vizibil în instalarea de sistem.', correct: true, why: 'Fiecare instalare își are propriile remote-uri.' },
      { id: 'b', text: 'Instalarea de sistem este cea implicită.', correct: true, why: 'Fără `--user`, comenzile vizează instalarea de sistem.' },
      { id: 'c', text: 'Instalarea `--user` nu cere privilegii de administrator.', correct: true, why: 'Datele sunt în directorul home al utilizatorului.' },
      { id: 'd', text: 'Un remote adăugat cu `--user` este vizibil automat tuturor utilizatorilor.', correct: false, why: 'Este valabil doar pentru contul care l-a adăugat.' },
    ],
  },
  {
    id: 'L2.4-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Listează remote-urile Flatpak cu detalii (titlu și URL).',
    prompt: '[student@server1 ~]$',
    answers: ['flatpak remotes -d', 'flatpak remotes --show-details', 'flatpak remotes --details'],
    canonical: 'flatpak remotes -d',
    explanation: '`flatpak remotes` listează; `-d` adaugă detaliile.',
    wrong: [
      { text: 'flatpak remote-ls', why: '`remote-ls` listează aplicațiile dintr-un remote, nu remote-urile.' },
      { text: 'flatpak list', why: 'Listează aplicațiile instalate.' },
      { text: 'dnf repolist', why: 'Se referă la repository-urile RPM.' },
    ],
    hint: 'Subcomanda este la plural.',
  },
  {
    id: 'L2.4-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a configura un remote Flatpak și a-l verifica.',
    explanation: 'Asiguri unealta, adaugi remote-ul, verifici definiția, verifici accesibilitatea.',
    items: [
      { text: '`sudo dnf install flatpak`', why: 'Fără unealtă nu poți configura remote-uri.' },
      { text: '`sudo flatpak remote-add --if-not-exists NUME URL`', why: 'Definește remote-ul.' },
      { text: '`flatpak remotes -d`', why: 'Confirmi definiția și instalarea.' },
      { text: '`flatpak remote-ls NUME --app`', why: 'Confirmi că remote-ul este accesibil și are aplicații.' },
    ],
  },
  {
    id: 'L2.4-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește opțiunea sau comanda cu rolul ei.',
    explanation: 'Comenzi și opțiuni pentru remote-uri Flatpak.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`--user`', right: 'instalare doar pentru utilizatorul curent', why: 'Nu cere privilegii de administrator.' },
      { left: '`--if-not-exists`', right: 'nu dă eroare dacă remote-ul există', why: 'Face comanda repetabilă.' },
      { left: '`remote-ls`', right: 'listează aplicațiile dintr-un remote', why: 'Se rulează cu numele remote-ului.' },
      { left: '`remote-modify --disable`', right: 'dezactivează un remote fără să-l șteargă', why: 'Poate fi reactivat cu `--enable`.' },
      { left: '`remote-delete`', right: 'șterge definiția unui remote', why: 'Elimină remote-ul din configurare.' },
    ],
    distractors: [{ text: 'instalează o aplicație', why: 'Aceasta este `flatpak install` (L2.5).' }],
  },
  {
    id: 'L2.4-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ai rulat `flatpak remote-add --user lab https://repo.exemplu.local/exemplu.flatpakrepo`. Apoi `sudo flatpak remotes` nu arată remote-ul. De ce?',
    explanation: '`sudo flatpak remotes` listează implicit instalarea de sistem; remote-ul a fost definit în instalarea de utilizator.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ flatpak remote-add --user lab https://repo.exemplu.local/exemplu.flatpakrepo\n[student@server1 ~]$ sudo flatpak remotes\nName     Options' },
    options: [
      { id: 'a', text: 'Remote-ul este în instalarea de utilizator; ai nevoie de `flatpak remotes --user` sau de un remote de sistem.', correct: true, why: 'Cele două instalări sunt separate.' },
      { id: 'b', text: 'URL-ul este invalid, deci nu s-a salvat.', correct: false, why: 'Comanda de adăugare nu a dat eroare; problema este instalarea vizată.' },
      { id: 'c', text: '`remotes` nu afișează nimic niciodată fără `-d`.', correct: false, why: '`-d` doar adaugă detalii; lista de nume ar apărea.' },
      { id: 'd', text: 'Remote-urile dispar după fiecare comandă `sudo`.', correct: false, why: 'Remote-urile persistă; doar instalarea consultată diferă.' },
    ],
  },
  {
    id: 'L2.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce înseamnă `disabled` în coloana `Options`?',
    explanation: 'Un remote dezactivat rămâne definit, dar nu este folosit până la reactivare.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'flatpak remotes', code: '[student@server1 ~]$ flatpak remotes\nName     Options\nexemplu  system,disabled' },
    options: [
      { id: 'a', text: 'Remote-ul este definit în instalarea de sistem, dar dezactivat; se reactivează cu `remote-modify --enable`.', correct: true, why: '`system` arată instalarea, `disabled` starea.' },
      { id: 'b', text: 'Remote-ul a fost șters.', correct: false, why: 'Un remote șters nu mai apare în listă.' },
      { id: 'c', text: 'Remote-ul este definit doar pentru utilizatorul curent.', correct: false, why: 'Acest lucru ar fi indicat prin `user`.' },
      { id: 'd', text: 'Verificarea GPG este dezactivată pentru el.', correct: false, why: 'Starea de verificare nu este afișată prin `disabled`.' },
    ],
  },
];
