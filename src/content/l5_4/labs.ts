import type { Lab } from '../../lab/types';

export const LAB_L5_4: Lab = {
  id: 'lab-l5-4-volume-logice',
  lessonId: 'L5.4',
  title: 'Creează, folosește și șterge volume logice',
  modes: ['guided', 'independent'],
  objectives: ['C5-4'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Grupul `datavg` (cel puțin 2 GiB liber) există. Creează volumul logic `data` de 512 MiB, formatează-l XFS, montează-l temporar pe `/mnt/data`, apoi demontează și șterge-l. Creează apoi `logs` cu tot spațiul liber rămas și șterge-l și pe acesta.',
    'Lucrezi numai în `datavg`; nu atinge grupul de sistem.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, `sudo`.',
    'VG `datavg` cu cel puțin 2 GiB liberi (L5.3).',
    'Directorul `/mnt/data` poate fi creat.',
  ],
  finalState: [
    'Niciun LV în `datavg`; spațiul este din nou liber. Nimic montat în `/mnt/data`.',
  ],
  criteria: [
    { id: 'ac1', text: 'LV-ul data de ≈512 MiB există în datavg.', manualCheck: 'sudo lvs datavg' },
    { id: 'ac2', text: 'Ai formatat data cu XFS și l-ai montat pe /mnt/data.', manualCheck: 'findmnt /mnt/data' },
    { id: 'ac3', text: 'LV-ul logs a folosit tot spațiul liber (VFree ≈ 0).', manualCheck: 'sudo vgs datavg' },
    { id: 'ac4', text: 'Ai demontat și șters ambele LV-uri.', manualCheck: 'sudo lvs datavg' },
  ],
  steps: [
    {
      title: 'Verifică spațiul liber',
      purpose: 'Nu poți aloca mai mult decât VFree.',
      hint: 'Citește VFree din vgs.',
      commands: 'sudo vgs datavg',
      explain: [['vgs datavg', 'arată VSize și VFree ale grupului.']],
    },
    {
      title: 'Creează LV-ul data',
      purpose: 'Taie 512 MiB din grup.',
      hint: '-n = nume, -L = dimensiune.',
      commands: 'sudo lvcreate -n data -L 512M datavg\nsudo lvs datavg\nls -l /dev/datavg/data /dev/mapper/datavg-data',
      explain: [
        ['lvcreate', 'creează un volum logic.'],
        ['-n data', 'numele LV-ului (rezultă /dev/datavg/data).'],
        ['-L 512M', 'dimensiunea: 512 MiB (-L cu literă mare = dimensiune; -l = extents/procent).'],
        ['datavg', 'grupul din care se alocă; ultimul argument.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo lvcreate -n data -L 512M datavg\n  Logical volume "data" created.\n[student@server1 ~]$ ls -l /dev/datavg/data\nlrwxrwxrwx. 1 root root 7 Nov 16 10:00 /dev/datavg/data -> ../dm-2', explain: '/dev/datavg/data este o legătură simbolică spre dispozitivul device-mapper (dm-2). Numărul dm-N variază.' },
    },
    {
      title: 'Formatează și montează temporar',
      purpose: 'Un LV nou este un dispozitiv gol; are nevoie de sistem de fișiere.',
      hint: 'Montarea persistentă vine în L5.5; aici este temporară.',
      commands: 'sudo mkfs.xfs /dev/datavg/data\nsudo mkdir -p /mnt/data\nsudo mount /dev/datavg/data /mnt/data\ndf -h /mnt/data',
      explain: [
        ['mkfs.xfs', 'creează un sistem de fișiere XFS pe dispozitivul dat (C6).'],
        ['mkdir -p', 'creează directorul de montare, fără eroare dacă există.'],
        ['mount DISPOZITIV PUNCT', 'montează sistemul de fișiere pe director (temporar, până la reboot sau umount).'],
        ['df -h', 'arată dimensiunea și spațiul liber în format uman (-h).'],
      ],
    },
    {
      title: 'Demontează și șterge',
      purpose: 'Un LV montat nu poate fi șters.',
      hint: 'umount primul, apoi lvremove.',
      commands: 'sudo umount /mnt/data\nsudo lvremove datavg/data',
      explain: [
        ['umount /mnt/data', 'demontează sistemul de fișiere.'],
        ['lvremove datavg/data', 'șterge LV-ul; cere confirmare (y). -f sare peste întrebare.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo lvremove datavg/data\nDo you really want to remove active logical volume datavg/data? [y/n]: y\n  Logical volume "data" successfully removed.', explain: 'Mesajul este orientativ; formularea poate diferi între versiuni.' },
    },
    {
      title: 'Creează logs cu tot spațiul liber, apoi șterge-l',
      purpose: 'Vezi -l 100%FREE.',
      hint: '-l (mic) acceptă procente.',
      commands: 'sudo lvcreate -n logs -l 100%FREE datavg\nsudo vgs datavg\nsudo lvremove -y datavg/logs\nsudo vgs datavg',
      explain: [
        ['-l 100%FREE', 'alocă toate extents-urile libere din grup.'],
        ['lvremove -y', '-y răspunde „yes” automat la întrebare.'],
      ],
    },
  ],
  verification: [
    { cmd: 'sudo lvs datavg', expected: 'niciun LV' },
    { cmd: 'findmnt /mnt/data', expected: 'niciun rezultat' },
  ],
  persistence: [
    'LV-urile și metadatele lor persistă pe disc.',
    'Montarea făcută cu `mount` NU persistă; pentru /etc/fstab vezi L5.5.',
  ],
  mistakes: [
    'Folosirea lui -l cu valoare în MiB (e număr de extents).',
    'Ștergerea unui LV montat.',
    'Uitarea mkfs: mount eșuează cu „wrong fs type”.',
    'Alocarea mai mare decât VFree.',
  ],
  troubleshooting: [
    { symptom: '`Volume group "datavg" has insufficient free space`', cause: 'cerere mai mare decât VFree', fix: 'cere mai puțin sau `vgextend`.' },
    { symptom: '`wrong fs type, bad option, bad superblock`', cause: 'LV neformatat', fix: '`mkfs.xfs`.' },
    { symptom: '`contains a filesystem in use`', cause: 'LV montat', fix: '`umount` apoi `lvremove`.' },
  ],
  alternatives: [
    '`lvcreate -l 128 -n data datavg` (128 extents × 4 MiB = 512 MiB).',
    '`mkfs.ext4` în loc de XFS, dacă enunțul o cere.',
    '`lvremove -f` fără confirmare.',
  ],
};
