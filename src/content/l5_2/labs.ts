import type { Lab } from '../../lab/types';

export const LAB_L5_2: Lab = {
  id: 'lab-l5-2-volume-fizice',
  lessonId: 'L5.2',
  title: 'Creează, inspectează și șterge volume fizice LVM',
  modes: ['guided', 'independent'],
  objectives: ['C5-2'],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Pe discul de test `/dev/vdb` (GPT, gol) pregătește două partiții de 1 GiB, transformă-le în volume fizice LVM, inspectează-le, apoi elimină unul dintre ele.',
    'Discul trebuie să fie cel de test; lucrează numai pe un sistem pe care îți permiți să pierzi datele de pe acest disc.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, acces `sudo`.',
    'Disc secundar gol `/dev/vdb` de cel puțin 3 GiB, cu tabelă GPT (L5.1) sau fără tabelă.',
    'Pachetul `lvm2` instalat (în RHEL este prezent implicit).',
  ],
  finalState: [
    '/dev/vdb1 este PV LVM; /dev/vdb2 a fost PV, apoi a fost eliminat din LVM.',
  ],
  criteria: [
    { id: 'ac1', text: 'Există două partiții vdb1 și vdb2 de ≈1 GiB.', manualCheck: 'lsblk /dev/vdb' },
    { id: 'ac2', text: '/dev/vdb1 și /dev/vdb2 au fost inițializate ca PV (apar în pvs).', manualCheck: 'sudo pvs' },
    { id: 'ac3', text: 'Ai citit „PE Size” și „Total PE” din pvdisplay pentru vdb1.', manualCheck: 'sudo pvdisplay /dev/vdb1' },
    { id: 'ac4', text: '/dev/vdb2 nu mai apare ca PV.', manualCheck: 'sudo pvs' },
  ],
  steps: [
    {
      title: 'Pregătește două partiții',
      purpose: 'PV-urile se creează de obicei pe partiții dedicate.',
      hint: 'Dacă discul are deja GPT, sari peste mklabel.',
      commands: 'lsblk /dev/vdb\nsudo parted /dev/vdb mklabel gpt\nsudo parted /dev/vdb mkpart lvm1 1MiB 1GiB\nsudo parted /dev/vdb mkpart lvm2 1GiB 2GiB\nsudo parted /dev/vdb set 1 lvm on\nsudo parted /dev/vdb set 2 lvm on\nsudo partprobe /dev/vdb\nlsblk /dev/vdb',
      explain: [
        ['mkpart lvm1 1MiB 1GiB', 'creează o partiție numită lvm1 de la 1 MiB la 1 GiB.'],
        ['set 1 lvm on', 'marchează tipul partiției ca „Linux LVM” (opțional, clarifică intenția).'],
        ['partprobe /dev/vdb', 'face kernelul să vadă noile partiții.'],
      ],
    },
    {
      title: 'Creează volumele fizice',
      purpose: 'Scrii antetul LVM pe fiecare partiție.',
      hint: 'Dacă pvcreate întreabă dacă să șteargă o semnătură, înseamnă că partiția a fost folosită; verifică cu blkid înainte să răspunzi y.',
      commands: 'sudo pvcreate /dev/vdb1 /dev/vdb2\nsudo pvs',
      explain: [
        ['pvcreate /dev/vdb1 /dev/vdb2', 'inițializează ambele dispozitive ca PV; acceptă mai multe argumente.'],
        ['pvs', 'listează PV-urile pe scurt: PV, VG, Fmt, Attr, PSize, PFree.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo pvs\n  PV         VG Fmt  Attr PSize    PFree\n  /dev/vda2  rhel lvm2 a--  <19.00g    0\n  /dev/vdb1     lvm2 ---   1023.00m 1023.00m\n  /dev/vdb2     lvm2 ---   1024.00m 1024.00m', explain: 'VG gol la vdb1 și vdb2: PV-uri libere. Dimensiunile reale diferă ușor de 1 GiB din cauza alinierii și a metadatelor.' },
    },
    {
      title: 'Inspectează un PV',
      purpose: 'Înțelegi extents și UUID-ul PV.',
      hint: 'Caută „PE Size”, „Total PE”, „Free PE”, „PV UUID”.',
      commands: 'sudo pvdisplay /dev/vdb1\nsudo pvs -o +pv_uuid',
      explain: [
        ['pvdisplay', 'format lung, cu toate câmpurile PV.'],
        ['pvs -o +pv_uuid', '-o selectează coloanele; + adaugă la cele implicite coloana pv_uuid.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo pvdisplay /dev/vdb1\n  "/dev/vdb1" is a new physical volume of "1023.00 MiB"\n  --- NEW Physical volume ---\n  PV Name               /dev/vdb1\n  VG Name\n  PV Size               1023.00 MiB\n  Allocatable           NO\n  PE Size               0\n  Total PE              0\n  Free PE               0\n  Allocated PE          0\n  PV UUID               Xk3Lq1-2aBc-DeFg-HiJk-LmNo-PqRs-TuVwXy', explain: 'PE Size este 0 până când PV-ul intră într-un VG (extentul îl stabilește VG-ul). PV UUID este fictiv.' },
      reflect: 'De ce „PE Size” este 0 la un PV care nu aparține unui VG?',
    },
    {
      title: 'Elimină un PV',
      purpose: 'Un PV liber poate fi readus la starea de partiție obișnuită.',
      hint: 'Dacă PV-ul ar fi într-un VG, ai folosi întâi vgreduce (L5.3).',
      commands: 'sudo pvremove /dev/vdb2\nsudo pvs',
      explain: [
        ['pvremove /dev/vdb2', 'șterge antetul LVM; partiția rămâne, dar nu mai este PV.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo pvremove /dev/vdb2\n  Labels on physical volume "/dev/vdb2" successfully wiped.', explain: 'Mesajul confirmă ștergerea etichetei, iar `pvs` nu mai trebuie să listeze vdb2.' },
    },
  ],
  verification: [
    { cmd: 'sudo pvs', expected: '/dev/vdb1 listat; /dev/vdb2 absent' },
    { cmd: 'lsblk -f /dev/vdb', expected: 'vdb1 cu FSTYPE LVM2_member' },
  ],
  persistence: [
    'Antetul LVM este scris pe disc; supraviețuiește reboot-ului, fără configurare în /etc.',
    'Metadatele LVM se găsesc și în /etc/lvm/ (copii de rezervă și arhive), dar nu editezi manual.',
  ],
  mistakes: [
    'Rularea pvcreate pe discul cu sistemul (vda2 este deja PV).',
    'Răspunsul y la „Wipe it?” fără a verifica ce conține dispozitivul.',
    'Confuzia pvs/vgs/lvs.',
    'Încercarea pvremove pe un PV care aparține unui VG.',
  ],
  troubleshooting: [
    { symptom: '`Device /dev/vdb1 excluded by a filter`', cause: 'LVM filtrează dispozitivul (semnătură, multipath, devices file)', fix: 'verifică cu `lsblk -f`/`wipefs`; pe RHEL 10 consultă și /etc/lvm/devices/system.devices (de confirmat).' },
    { symptom: '`Can\'t open /dev/vdb1 exclusively. Mounted filesystem?`', cause: 'partiția este montată sau în uz', fix: 'demontează sau alege alt dispozitiv.' },
    { symptom: '`pvcreate: command not found`', cause: 'lvm2 lipsește', fix: '`sudo dnf install lvm2`.' },
  ],
  alternatives: [
    'Poți crea PV direct pe discul întreg: `pvcreate /dev/vdc` (fără partiții).',
    '`wipefs -a /dev/vdb1` șterge semnăturile înainte de pvcreate (distruge date).',
  ],
};
