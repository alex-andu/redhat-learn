import type { Question } from '../../lib/types';

const T = 'L2.5';
const O = ['C2-4'];

export const Q_L2_5: Question[] = [
  {
    id: 'L2.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care comandă instalează aplicația `org.exemplu.Calculator` din remote-ul `exemplu` doar pentru utilizatorul curent?',
    explanation: '`--user` alege instalarea de utilizator; apoi REMOTE și Application ID.',
    options: [
      { id: 'a', text: '`flatpak install --user exemplu org.exemplu.Calculator`', correct: true, why: 'Instalare de utilizator, fără privilegii.' },
      { id: 'b', text: '`sudo flatpak install exemplu org.exemplu.Calculator`', correct: false, why: 'Instalează la nivel de sistem (pentru toți utilizatorii).' },
      { id: 'c', text: '`dnf install org.exemplu.Calculator`', correct: false, why: '`dnf` gestionează pachete RPM, nu aplicații Flatpak.' },
      { id: 'd', text: '`flatpak remote-add --user exemplu org.exemplu.Calculator`', correct: false, why: '`remote-add` definește un remote; nu instalează aplicații.' },
    ],
  },
  {
    id: 'L2.5-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce arată `flatpak list --app`?',
    explanation: '`flatpak list` afișează elementele instalate; `--app` exclude runtime-urile.',
    options: [
      { id: 'a', text: 'Doar aplicațiile instalate, fără runtime-uri.', correct: true, why: '`--app` filtrează la aplicații.' },
      { id: 'b', text: 'Aplicațiile disponibile în remote.', correct: false, why: 'Acelea se văd cu `remote-ls` sau `search`.' },
      { id: 'c', text: 'Remote-urile configurate.', correct: false, why: 'Acelea se văd cu `flatpak remotes`.' },
      { id: 'd', text: 'Pachetele RPM instalate.', correct: false, why: 'Acelea se văd cu `rpm -qa`.' },
    ],
  },
  {
    id: 'L2.5-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre ștergerea aplicațiilor Flatpak sunt corecte? (alege toate cele corecte)',
    explanation: 'Aplicația, runtime-urile și datele utilizatorului sunt gestionate separat.',
    options: [
      { id: 'a', text: '`flatpak uninstall ID` șterge aplicația, dar păstrează datele utilizatorului.', correct: true, why: 'Pentru date se folosește `--delete-data`.' },
      { id: 'b', text: '`flatpak uninstall --unused` elimină runtime-urile care nu mai sunt folosite.', correct: true, why: 'Curăță ce a rămas după ștergerea aplicațiilor.' },
      { id: 'c', text: 'Aplicațiile Flatpak sunt gestionate separat de `dnf`.', correct: true, why: 'Nu apar în `rpm -qa` și nu sunt actualizate de `dnf`.' },
      { id: 'd', text: '`dnf remove ID` șterge o aplicație Flatpak.', correct: false, why: '`dnf` nu cunoaște aplicațiile Flatpak.' },
    ],
  },
  {
    id: 'L2.5-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Șterge din instalarea de utilizator toate runtime-urile Flatpak care nu mai sunt folosite de nicio aplicație.',
    prompt: '[student@server1 ~]$',
    answers: ['flatpak uninstall --user --unused', 'flatpak uninstall --unused --user'],
    canonical: 'flatpak uninstall --user --unused',
    explanation: '`--unused` curăță runtime-urile neutilizate; `--user` alege instalarea.',
    wrong: [
      { text: 'flatpak uninstall --user', why: 'Fără țintă și fără `--unused` nu precizează ce se șterge.' },
      { text: 'flatpak remote-delete --user --unused', why: '`remote-delete` șterge remote-uri, nu runtime-uri.' },
      { text: 'flatpak list --unused', why: '`list` doar afișează; nu șterge nimic.' },
    ],
    hint: 'Opțiunea cheie are numele „unused”.',
  },
  {
    id: 'L2.5-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a instala și apoi elimina curat o aplicație Flatpak.',
    explanation: 'Cauți ID-ul, instalezi, confirmi, ștergi, curăți runtime-urile.',
    items: [
      { text: '`flatpak search NUME`', why: 'Afli Application ID-ul exact.' },
      { text: '`flatpak install --user REMOTE ID`', why: 'Instalezi aplicația (și runtime-ul necesar).' },
      { text: '`flatpak list --app`', why: 'Confirmi instalarea.' },
      { text: '`flatpak uninstall --user ID`', why: 'Elimini aplicația.' },
      { text: '`flatpak uninstall --user --unused`', why: 'Elimini runtime-urile rămase fără utilizare.' },
    ],
  },
  {
    id: 'L2.5-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește comanda cu efectul.',
    explanation: 'Comenzi Flatpak de instalare și gestiune.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`flatpak install`', right: 'instalează o aplicație dintr-un remote', why: 'Aduce și runtime-urile necesare.' },
      { left: '`flatpak list --runtime`', right: 'arată runtime-urile instalate', why: '`--runtime` filtrează la runtime-uri.' },
      { left: '`flatpak info --show-origin ID`', right: 'arată remote-ul sursă al aplicației', why: 'Opțiune a lui `flatpak info`.' },
      { left: '`flatpak run ID`', right: 'pornește aplicația', why: 'De regulă cere sesiune grafică.' },
      { left: '`flatpak update`', right: 'actualizează aplicațiile și runtime-urile', why: 'Separat de `dnf upgrade`.' },
    ],
    distractors: [{ text: 'listează repository-urile RPM', why: 'Aceasta este `dnf repolist`.' }],
  },
  {
    id: 'L2.5-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Remote-ul `lab` a fost adăugat cu `--user`. De ce eșuează instalarea de mai jos și cum o repari?',
    explanation: '`sudo flatpak install` vizează instalarea de sistem, unde remote-ul `lab` nu există.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ flatpak remotes\nName  Options\nlab   user\n[student@server1 ~]$ sudo flatpak install lab org.exemplu.Calculator\nerror: Remote "lab" not found' },
    options: [
      { id: 'a', text: 'Remote-ul este doar în instalarea de utilizator; instalezi cu `flatpak install --user lab org.exemplu.Calculator`.', correct: true, why: 'Coloana `Options: user` arată instalarea în care există remote-ul.' },
      { id: 'b', text: 'Trebuie `dnf clean all`.', correct: false, why: 'Cache-ul `dnf` nu influențează Flatpak.' },
      { id: 'c', text: 'ID-ul aplicației trebuie scris cu litere mari.', correct: false, why: 'Eroarea spune că remote-ul nu este găsit, nu aplicația.' },
      { id: 'd', text: 'Trebuie adăugat `--no-gpg-verify`.', correct: false, why: 'Problema este instalarea vizată, nu verificarea semnăturii.' },
    ],
  },
  {
    id: 'L2.5-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce informație îți oferă coloana `Installation` din output?',
    explanation: 'Coloana arată dacă elementul este în instalarea de sistem sau în cea de utilizator.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'flatpak list', code: '[student@server1 ~]$ flatpak list\nName        Application ID            Version  Branch  Installation\nCalculator  org.exemplu.Calculator    1.2      stable  user\nPlatform    org.exemplu.Platform      1.0      1.0     user' },
    options: [
      { id: 'a', text: 'Ambele elemente sunt instalate doar pentru utilizatorul curent (`user`).', correct: true, why: 'Pentru instalarea de sistem ar apărea `system`.' },
      { id: 'b', text: 'Ambele sunt instalate pentru toți utilizatorii.', correct: false, why: 'Acest lucru ar fi indicat prin `system`.' },
      { id: 'c', text: 'Aplicația este în remote, dar neinstalată.', correct: false, why: '`flatpak list` arată doar ce este instalat.' },
      { id: 'd', text: 'Platform este un pachet RPM.', correct: false, why: '`Platform` este un runtime Flatpak, nu un RPM.' },
    ],
  },
];
