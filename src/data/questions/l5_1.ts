import type { Question } from '../../lib/types';

const T = 'L5.1';
const O = ['C5-1'];

export const Q_L5_1: Question[] = [
  {
    id: 'L5.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce este un [[gpt]] în raport cu un disc?',
    explanation: 'GPT este formatul modern al tabelei de partiții; EX200 lucrează cu discuri GPT.',
    options: [
      { id: 'a', text: 'Formatul de tabelă de partiții care permite discuri mari și are copie de rezervă la capătul discului.', correct: true, why: 'GPT păstrează tabela la început și la sfârșit și depășește limitele MBR (2 TiB, 4 partiții primare).' },
      { id: 'b', text: 'Un sistem de fișiere precum XFS.', correct: false, why: 'Sistemul de fișiere se creează DUPĂ partiționare, cu mkfs; GPT descrie doar împărțirea discului.' },
      { id: 'c', text: 'Un tip de volum logic LVM.', correct: false, why: 'LVM este un strat separat (L5.2–L5.4); GPT este tabela de partiții.' },
      { id: 'd', text: 'Un program pentru montarea discurilor.', correct: false, why: 'Montarea se face cu mount sau /etc/fstab, nu cu GPT.' },
    ],
  },
  {
    id: 'L5.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Pe un server virtual, discul adăugat apare ca `/dev/vdb`. Cum se numește prima partiție creată pe el?',
    explanation: 'La discurile vdX și sdX se adaugă un număr; la nvme se folosește „p” înaintea numărului.',
    options: [
      { id: 'a', text: '/dev/vdb1', correct: true, why: 'Numele partiției = numele discului + numărul ei.' },
      { id: 'b', text: '/dev/vdb0', correct: false, why: 'Numerotarea partițiilor începe de la 1, nu de la 0.' },
      { id: 'c', text: '/dev/vdb-1', correct: false, why: 'Nu se folosește cratimă în numele dispozitivelor de partiție.' },
      { id: 'd', text: '/dev/vdbp1', correct: false, why: 'Litera „p” apare doar când numele discului se termină cu cifră, ca la /dev/nvme0n1p1.' },
    ],
  },
  {
    id: 'L5.1-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează, în format arbore, toate discurile și partițiile cu dimensiunile lor.',
    prompt: '[root@server1 ~]#',
    answers: ['lsblk', 'lsblk -f', 'lsblk /dev/vdb', 'lsblk -p'],
    canonical: 'lsblk',
    explanation: '`lsblk` listează block device-urile, ierarhic (disc → partiții → volume). Nu modifică nimic.',
    wrong: [
      { text: 'ls /dev', why: 'Arată doar numele fișierelor din /dev, fără dimensiuni și fără relația disc–partiție.' },
      { text: 'df -h', why: 'df arată doar sistemele de fișiere MONTATE; un disc neformatat nu apare.' },
      { text: 'mount', why: 'mount listează montările active, nu discurile existente.' },
    ],
  },
  {
    id: 'L5.1-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează o tabelă de partiții GPT nouă pe `/dev/vdb`, folosind `parted` cu o singură comandă.',
    prompt: '[root@server1 ~]#',
    answers: ['parted /dev/vdb mklabel gpt', 'parted /dev/vdb -s mklabel gpt', 'parted -s /dev/vdb mklabel gpt'],
    canonical: 'parted /dev/vdb mklabel gpt',
    explanation: '`mklabel gpt` scrie o tabelă GPT goală; se pierde accesul la partițiile existente.',
    wrong: [
      { text: 'parted /dev/vdb mkfs gpt', why: '`mkfs` nu este subcomandă parted în RHEL și GPT nu este sistem de fișiere.' },
      { text: 'parted /dev/vdb1 mklabel gpt', why: 'Eticheta se aplică discului întreg (vdb), nu unei partiții.' },
      { text: 'mklabel gpt /dev/vdb', why: 'mklabel este subcomandă a lui parted; nu există ca program separat.' },
    ],
  },
  {
    id: 'L5.1-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce informații confirmă outputul de mai jos?',
    explanation: '„Partition Table: gpt” arată formatul; coloana Number identifică partițiile.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'parted print', code: '[root@server1 ~]# parted /dev/vdb print\nModel: Virtio Block Device (virtblk)\nDisk /dev/vdb: 10.7GB\nSector size (logical/physical): 512B/512B\nPartition Table: gpt\n\nNumber  Start   End     Size    File system  Name  Flags\n 1      1049kB  1074MB  1073MB               data\n 2      1074MB  3221MB  2147MB               data2' },
    options: [
      { id: 'a', text: 'Discul are tabelă GPT și două partiții, fără sistem de fișiere creat încă.', correct: true, why: 'Coloana „File system” este goală, deci nu s-a rulat mkfs; „gpt” apare la Partition Table.' },
      { id: 'b', text: 'Discul are tabelă MBR (dos) cu o partiție extinsă.', correct: false, why: 'MBR ar fi afișat „msdos”; aici scrie „gpt”.' },
      { id: 'c', text: 'Ambele partiții sunt formatate XFS.', correct: false, why: 'Dacă ar fi XFS, coloana File system ar conține „xfs”.' },
      { id: 'd', text: 'Discul este /dev/vdb1.', correct: false, why: 'vdb este discul; vdb1 și vdb2 sunt partițiile lui.' },
    ],
  },
  {
    id: 'L5.1-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un administrator vrea să șteargă partiția 2 de pe `/dev/vdb`, dar comanda de mai jos poate distruge date. Care este problema?',
    explanation: 'Verificarea discului țintă înainte de rm este esențială: parted aplică imediat.',
    snippet: { kind: 'find-error', title: 'comandă', code: 'parted /dev/sda rm 2' },
    options: [
      { id: 'a', text: 'Discul țintă este /dev/sda (de obicei discul de sistem), nu /dev/vdb; parted șterge imediat, fără confirmare.', correct: true, why: 'Se verifică mai întâi cu lsblk. parted nu are pas „write” separat, deci greșeala este ireversibilă.' },
      { id: 'b', text: 'Comanda rm nu există în parted.', correct: false, why: 'rm este subcomandă validă: `parted DISC rm NUMĂR`.' },
      { id: 'c', text: 'Numărul 2 trebuie scris 2p.', correct: false, why: 'La discurile sdX/vdX numărul se folosește simplu; „p” apare doar la nvme.' },
      { id: 'd', text: 'Trebuie făcut mai întâi umount pe disc întreg.', correct: false, why: 'Se demontează sistemele de fișiere ale partițiilor afectate, nu „discul”; oricum, nu aceasta este eroarea de aici.' },
    ],
  },
  {
    id: 'L5.1-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmațiile despre `fdisk` și `parted` sunt adevărate?',
    explanation: 'fdisk scrie la comanda w; parted scrie imediat; ambele pot lucra cu GPT.',
    options: [
      { id: 'a', text: 'fdisk păstrează modificările în memorie până la comanda w.', correct: true, why: 'Poți ieși cu q fără să modifici discul.' },
      { id: 'b', text: 'parted aplică fiecare comandă imediat pe disc.', correct: true, why: 'De aceea parted cere atenție sporită.' },
      { id: 'c', text: 'Ambele pot crea partiții pe un disc GPT.', correct: true, why: 'Versiunile moderne de fdisk suportă GPT (comanda g).' },
      { id: 'd', text: 'fdisk poate crea doar tabele MBR.', correct: false, why: 'fdisk din util-linux modern creează și tabele GPT cu comanda g.' },
    ],
  },
  {
    id: 'L5.1-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda sau tasta cu efectul ei.',
    explanation: 'Comenzile de listare nu schimbă nimic; cele de scriere trebuie folosite cu grijă.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`lsblk`', right: 'afișează discurile și partițiile în arbore', why: 'Doar citește informații din kernel.' },
      { left: '`fdisk -l /dev/vdb`', right: 'listează tabela de partiții a discului', why: '-l = list, fără modificări.' },
      { left: '`n` în fdisk', right: 'creează o partiție nouă', why: 'n = new partition.' },
      { left: '`w` în fdisk', right: 'scrie modificările pe disc și iese', why: 'Până atunci nimic nu e scris.' },
      { left: '`partprobe`', right: 'cere kernelului să recitească tabela de partiții', why: 'Util când lsblk nu arată noua partiție.' },
    ],
    distractors: [{ text: 'formatează partiția cu XFS', why: 'Formatarea se face cu mkfs.xfs (C6).' }],
  },
  {
    id: 'L5.1-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a crea o partiție de 1 GiB pe un disc nou `/dev/vdb`, cu GPT.',
    explanation: 'Identifici discul, creezi eticheta, creezi partiția, verifici.',
    items: [
      { text: '`lsblk` — identifici discul gol', why: 'Verifici că /dev/vdb este discul nou, nu cel de sistem.' },
      { text: '`parted /dev/vdb mklabel gpt`', why: 'Scrie tabela GPT goală.' },
      { text: '`parted /dev/vdb mkpart data 1MiB 1GiB`', why: 'Creează partiția de la 1 MiB (aliniat) până la 1 GiB.' },
      { text: '`lsblk /dev/vdb`', why: 'Confirmi că vdb1 există cu dimensiunea așteptată.' },
    ],
  },
];
