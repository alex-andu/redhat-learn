import type { Question } from '../../lib/types';

const T = 'L5.2';
const O = ['C5-2'];

export const Q_L5_2: Question[] = [
  {
    id: 'L5.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este ordinea straturilor [[lvm]], de jos în sus?',
    explanation: 'PV-urile se grupează în VG, din VG se taie LV-uri, iar pe LV pui sistemul de fișiere.',
    options: [
      { id: 'a', text: 'PV → VG → LV → sistem de fișiere', correct: true, why: 'Dispozitivul fizic devine PV, mai multe PV-uri formează VG, iar din VG se creează LV.' },
      { id: 'b', text: 'LV → VG → PV → sistem de fișiere', correct: false, why: 'Ordinea este inversată: LV se creează din VG, nu invers.' },
      { id: 'c', text: 'VG → PV → LV', correct: false, why: 'Un VG nu poate exista fără PV-uri care să îl alcătuiască.' },
      { id: 'd', text: 'PV → LV → VG', correct: false, why: 'LV se taie din VG, nu direct din PV.' },
    ],
  },
  {
    id: 'L5.2-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Inițializează partiția `/dev/vdb1` ca volum fizic LVM.',
    prompt: '[root@server1 ~]#',
    answers: ['pvcreate /dev/vdb1'],
    canonical: 'pvcreate /dev/vdb1',
    explanation: '`pvcreate` scrie antetul LVM pe dispozitiv; abia apoi poate fi adăugat într-un VG.',
    wrong: [
      { text: 'vgcreate /dev/vdb1', why: 'vgcreate creează un grup de volume și cere numele grupului, nu doar dispozitivul.' },
      { text: 'mkfs.xfs /dev/vdb1', why: 'Aceasta creează un sistem de fișiere și ar împiedica folosirea ca PV.' },
      { text: 'lvcreate /dev/vdb1', why: 'lvcreate creează volume logice dintr-un VG existent.' },
    ],
  },
  {
    id: 'L5.2-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează o listă scurtă (un rând per PV) a volumelor fizice.',
    prompt: '[root@server1 ~]#',
    answers: ['pvs', 'sudo pvs'],
    canonical: 'pvs',
    explanation: '`pvs` = sumar compact; `pvdisplay` = detalii pe mai multe rânduri.',
    wrong: [
      { text: 'pvdisplay -s', why: '-s afișează o formă scurtă, dar `pvs` este comanda tabelară standard.' },
      { text: 'lsblk -f', why: 'Arată FSTYPE LVM2_member, dar nu detalii PV (VG, spațiu liber).' },
      { text: 'vgs', why: 'vgs listează grupuri de volume, nu volume fizice.' },
    ],
  },
  {
    id: 'L5.2-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată coloana `VG` goală în output-ul de mai jos?',
    explanation: 'Un PV fără VG este inițializat, dar nealocat.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'pvs', code: '[root@server1 ~]# pvs\n  PV         VG     Fmt  Attr PSize  PFree\n  /dev/vda2  rhel   lvm2 a--  19.00g    0\n  /dev/vdb1         lvm2 ---   1.00g 1.00g' },
    options: [
      { id: 'a', text: '/dev/vdb1 este PV, dar nu aparține niciunui VG: spațiul este liber pentru un VG nou sau vgextend.', correct: true, why: 'PFree = PSize și VG gol indică un PV neatribuit.' },
      { id: 'b', text: '/dev/vdb1 este defect.', correct: false, why: 'Un PV defect ar avea alt atribut/mesaj; aici pur și simplu nu a fost atribuit.' },
      { id: 'c', text: '/dev/vdb1 nu este PV.', correct: false, why: 'Apare în lista pvs, deci este PV.' },
      { id: 'd', text: '/dev/vda2 este neformatat.', correct: false, why: 'vda2 aparține VG-ului rhel și are 0 spațiu liber.' },
    ],
  },
  {
    id: 'L5.2-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce face `pvremove /dev/vdb1` și ce condiție trebuie îndeplinită?',
    explanation: 'pvremove șterge antetul LVM; PV-ul trebuie să nu fie într-un VG.',
    options: [
      { id: 'a', text: 'Șterge eticheta LVM; PV-ul trebuie mai întâi scos din VG (vgreduce) dacă face parte din unul.', correct: true, why: 'pvremove refuză PV-urile aflate în uz într-un VG.' },
      { id: 'b', text: 'Șterge partiția din tabela GPT.', correct: false, why: 'Partiția rămâne; doar eticheta LVM dispare. Partiția se șterge cu parted/fdisk.' },
      { id: 'c', text: 'Șterge VG-ul la care aparține.', correct: false, why: 'VG-ul se șterge cu vgremove.' },
      { id: 'd', text: 'Reformatează discul cu XFS.', correct: false, why: 'pvremove nu creează sisteme de fișiere.' },
    ],
  },
  {
    id: 'L5.2-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Comanda de mai jos eșuează. Care este cauza?',
    explanation: 'pvcreate refuză un dispozitiv care are deja o semnătură de sistem de fișiere, cât timp nu este forțat.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'pvcreate', code: '[root@server1 ~]# pvcreate /dev/vdb1\n  WARNING: xfs signature detected on /dev/vdb1 at offset 0. Wipe it? [y/n]: n\n  Aborting pvcreate on /dev/vdb1.' },
    options: [
      { id: 'a', text: 'Partiția conține deja un sistem de fișiere XFS; LVM cere confirmare înainte să îl șteargă.', correct: true, why: 'Dacă răspunzi y, semnătura se șterge, iar datele vechi se pierd. Verifică înainte cu blkid.' },
      { id: 'b', text: 'pvcreate nu merge pe partiții.', correct: false, why: 'Merge pe partiții și pe discuri întregi.' },
      { id: 'c', text: 'Lipsește opțiunea -f obligatorie.', correct: false, why: '-f nu este obligatoriu; dar nu forța fără să verifici ce conține dispozitivul.' },
      { id: 'd', text: 'Discul este în uz de un VG.', correct: false, why: 'Mesajul indică o semnătură xfs, nu un VG.' },
    ],
  },
  {
    id: 'L5.2-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Pe ce dispozitive se poate crea un [[pv]]?',
    explanation: 'Orice block device: partiție, disc întreg, dispozitiv multipath.',
    options: [
      { id: 'a', text: 'O partiție (de ex. /dev/vdb1).', correct: true, why: 'Cazul cel mai frecvent și cel recomandat pentru claritate.' },
      { id: 'b', text: 'Un disc întreg (de ex. /dev/vdc).', correct: true, why: 'LVM acceptă discuri întregi, fără tabelă de partiții.' },
      { id: 'c', text: 'Un fișier obișnuit din /etc.', correct: false, why: 'PV cere un block device (fișierele pot fi folosite doar prin loop device).' },
      { id: 'd', text: 'Un LV existent.', correct: true, why: 'Tehnic posibil (LVM peste LVM), dar nu este recomandat.' },
    ],
  },
  {
    id: 'L5.2-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu efectul ei.',
    explanation: 'pv* lucrează cu volume fizice, vg* cu grupuri, lv* cu volume logice.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`pvcreate`', right: 'inițializează un PV', why: 'Scrie antetul LVM.' },
      { left: '`pvs`', right: 'listează PV-urile pe scurt', why: 'Un rând per PV.' },
      { left: '`pvdisplay`', right: 'arată detalii despre PV (extents, UUID)', why: 'Format lung.' },
      { left: '`pvremove`', right: 'șterge antetul LVM', why: 'PV nu trebuie să fie în VG.' },
    ],
    distractors: [{ text: 'creează un volum logic', why: 'Aceasta este lvcreate (L5.4).' }],
  },
  {
    id: 'L5.2-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un coleg a scris acești pași pentru a pregăti partiția pentru LVM. Ce este greșit?',
    explanation: 'Un PV nu trebuie să aibă sistem de fișiere; formatarea îl face nepotrivit.',
    snippet: { kind: 'find-error', title: 'pași', code: 'mkfs.xfs /dev/vdb1\npvcreate /dev/vdb1\nvgcreate datavg /dev/vdb1' },
    options: [
      { id: 'a', text: 'mkfs.xfs nu trebuie rulat pe un PV; sistemul de fișiere se creează mai târziu, pe LV.', correct: true, why: 'Pe PV pvcreate scrie antetul LVM; XFS se pune pe volumul logic (L5.4/C6).' },
      { id: 'b', text: 'vgcreate trebuie rulat înainte de pvcreate.', correct: false, why: 'Ordinea corectă este pvcreate, apoi vgcreate (vgcreate poate chiar inițializa singur PV-urile, dar nu e cazul de aici).' },
      { id: 'c', text: 'Lipsește comanda lvcreate înainte de vgcreate.', correct: false, why: 'lvcreate vine după vgcreate.' },
      { id: 'd', text: 'Numele datavg este interzis.', correct: false, why: 'Numele VG este liber ales.' },
    ],
  },
  {
    id: 'L5.2-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a transforma o partiție nouă într-un PV.',
    explanation: 'Identifici, creezi partiția, o inițializezi, o verifici.',
    items: [
      { text: '`lsblk` — identifici discul', why: 'Alegi discul corect.' },
      { text: '`parted /dev/vdb mkpart lvm1 1MiB 100%` (și `set 1 lvm on`)', why: 'Creezi partiția.' },
      { text: '`pvcreate /dev/vdb1`', why: 'Scrie antetul LVM.' },
      { text: '`pvs`', why: 'Confirmi că PV-ul apare.' },
    ],
  },
];
