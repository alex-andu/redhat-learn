import type { Question } from '../../lib/types';

const T = 'L5.4';
const O = ['C5-4'];

export const Q_L5_4: Question[] = [
  {
    id: 'L5.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Un [[lv]] numit `data` din grupul `datavg` are, activ fiind, ce cale „prietenoasă”?',
    explanation: 'Căile sunt /dev/VG/LV și /dev/mapper/VG-LV.',
    options: [
      { id: 'a', text: '/dev/datavg/data (și /dev/mapper/datavg-data)', correct: true, why: 'Ambele nume indică același dispozitiv device-mapper.' },
      { id: 'b', text: '/dev/data/datavg', correct: false, why: 'Ordinea este VG apoi LV.' },
      { id: 'c', text: '/mnt/datavg/data', correct: false, why: '/mnt este un punct de montare, nu calea dispozitivului.' },
      { id: 'd', text: '/dev/vdb/data', correct: false, why: 'LV nu poartă numele discului fizic.' },
    ],
  },
  {
    id: 'L5.4-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează un volum logic `data` de 500 MiB în grupul `datavg`.',
    prompt: '[root@server1 ~]#',
    answers: ['lvcreate -n data -L 500M datavg', 'lvcreate -L 500M -n data datavg', 'lvcreate -n data -L 500m datavg', 'lvcreate --name data --size 500M datavg', 'sudo lvcreate -n data -L 500M datavg'],
    canonical: 'lvcreate -n data -L 500M datavg',
    explanation: '`-n` dă numele, `-L` dă dimensiunea în unități de dimensiune, grupul este ultimul argument.',
    wrong: [
      { text: 'lvcreate -L 500M datavg data', why: 'Fără -n, numele LV-ului nu este stabilit; „data” după grup nu este interpretat ca nume.' },
      { text: 'lvcreate data 500M datavg', why: 'Fără opțiunile -n și -L, LVM nu înțelege rolul argumentelor.' },
      { text: 'vgcreate -n data -L 500M datavg', why: 'vgcreate creează grupuri; pentru volume logice se folosește lvcreate.' },
    ],
  },
  {
    id: 'L5.4-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează un LV `logs` care folosește tot spațiul liber rămas în `datavg`.',
    prompt: '[root@server1 ~]#',
    answers: ['lvcreate -n logs -l 100%FREE datavg', 'lvcreate -l 100%FREE -n logs datavg', 'lvcreate --name logs -l 100%FREE datavg'],
    canonical: 'lvcreate -n logs -l 100%FREE datavg',
    explanation: '`-l 100%FREE` alocă toate extents-urile libere ale grupului.',
    wrong: [
      { text: 'lvcreate -n logs -l 100%VG datavg', why: '100%VG înseamnă dimensiunea întregului grup; eșuează dacă există deja LV-uri care ocupă spațiu.' },
      { text: 'lvcreate -n logs -l 100% datavg', why: '100% (fără FREE) înseamnă 100% din dimensiunea VG; eșuează dacă există deja LV-uri.' },
      { text: 'lvcreate -n logs datavg', why: 'Lipsește dimensiunea; lvcreate cere -L sau -l.' },
    ],
  },
  {
    id: 'L5.4-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată outputul despre volumul `data`?',
    explanation: 'Coloana LSize este dimensiunea; Attr „-wi-a-----” descrie starea.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'lvs', code: '[root@server1 ~]# lvs\n  LV   VG     Attr       LSize   Pool Origin Data%  Meta%\n  data datavg -wi-a----- 512.00m\n  root rhel   -wi-ao---- <17.00g\n  swap rhel   -wi-ao----   2.00g' },
    options: [
      { id: 'a', text: 'data este activ (a), nu este deschis/montat (lipsește o), de 512 MiB, în datavg.', correct: true, why: 'În Attr, „a” = activ, „o” = open (în uz); root și swap au și „o”.' },
      { id: 'b', text: 'data este montat în /.', correct: false, why: 'Rădăcina este LV-ul root din grupul rhel.' },
      { id: 'c', text: 'data este în grupul rhel.', correct: false, why: 'Coloana VG arată datavg.' },
      { id: 'd', text: 'data este dezactivat.', correct: false, why: 'Un LV dezactivat nu ar avea „a” în Attr.' },
    ],
  },
  {
    id: 'L5.4-005', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un coleg vrea să șteargă LV-ul `data`, dar comanda eșuează. Ce lipsește?',
    explanation: 'Un LV montat este „în uz”; trebuie demontat întâi.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[root@server1 ~]# lvremove /dev/datavg/data\n  Logical volume datavg/data contains a filesystem in use.' },
    options: [
      { id: 'a', text: 'Trebuie demontat înainte (umount), iar intrarea din /etc/fstab trebuie eliminată.', correct: true, why: 'lvremove refuză un LV montat; fstab trebuie curățat ca boot-ul să nu se blocheze.' },
      { id: 'b', text: 'Trebuie dat `lvremove -f` fără demontare.', correct: false, why: '-f sare peste confirmare, dar nu ocolește faptul că volumul este în uz.' },
      { id: 'c', text: 'Trebuie ștearsă mai întâi partiția de pe disc.', correct: false, why: 'Ștergerea partiției ar corupe VG-ul.' },
      { id: 'd', text: 'Trebuie rulat pvremove.', correct: false, why: 'pvremove șterge PV-uri și nu ajută.' },
    ],
  },
  {
    id: 'L5.4-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre acestea sunt formele corecte de a specifica dimensiunea la `lvcreate`?',
    explanation: '-L = dimensiune, -l = extents sau procent.',
    options: [
      { id: 'a', text: '`-L 2G`', correct: true, why: 'Adaugă o dimensiune de 2 GiB.' },
      { id: 'b', text: '`-l 100`', correct: true, why: '100 de extents (400 MiB cu extent de 4 MiB).' },
      { id: 'c', text: '`-l 50%VG`', correct: true, why: '50% din dimensiunea totală a VG.' },
      { id: 'd', text: '`-L 50%FREE`', correct: false, why: 'Procentele se dau cu -l.' },
    ],
  },
  {
    id: 'L5.4-007', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a crea un LV nou și a-l face utilizabil.',
    explanation: 'După lvcreate urmează sistemul de fișiere și montarea.',
    items: [
      { text: '`vgs datavg` — verifici spațiul liber', why: 'Nu poți aloca mai mult decât VFree.' },
      { text: '`lvcreate -n data -L 500M datavg`', why: 'Creează volumul.' },
      { text: '`mkfs.xfs /dev/datavg/data`', why: 'Creează sistemul de fișiere.' },
      { text: '`mount /dev/datavg/data /mnt/data`', why: 'Îl faci accesibil.' },
    ],
  },
  {
    id: 'L5.4-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu efectul.',
    explanation: 'Comenzile lv* lucrează cu volume logice.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`lvcreate -n x -L 1G vg`', right: 'creează LV-ul x de 1 GiB', why: '-n nume, -L dimensiune.' },
      { left: '`lvs`', right: 'listează LV-urile pe scurt', why: 'Un rând per LV.' },
      { left: '`lvdisplay`', right: 'arată detalii (path, UUID, LE)', why: 'Format lung.' },
      { left: '`lvremove vg/x`', right: 'șterge LV-ul', why: 'Distruge datele; cere demontare.' },
    ],
    distractors: [{ text: 'adaugă un PV într-un VG', why: 'Aceasta este vgextend (L5.3).' }],
  },
];
