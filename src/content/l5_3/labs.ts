import type { Lab } from '../../lab/types';

export const LAB_L5_3: Lab = {
  id: 'lab-l5-3-grup-volume',
  lessonId: 'L5.3',
  title: 'Creează, extinde și reduce un grup de volume',
  modes: ['guided', 'independent'],
  objectives: ['C5-3'],
  difficulty: 2,
  estimatedMinutes: 30,
  scenario: [
    'Pe discul de test `/dev/vdb` ai două PV-uri (vdb1 și vdb2, câte ≈1 GiB; vezi L5.2). Creează grupul `datavg` din vdb1, extinde-l cu vdb2, citește spațiul liber, apoi redu grupul înapoi la vdb1.',
    'Grupul de sistem (`rhel` sau similar) nu se atinge.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, `sudo`.',
    'Două partiții de ≈1 GiB (`/dev/vdb1`, `/dev/vdb2`) pe un disc gol, fără sisteme de fișiere.',
    'Dacă nu sunt PV-uri, le creezi în pasul 1.',
  ],
  finalState: [
    'VG `datavg` există cu un singur PV (`/dev/vdb1`); `/dev/vdb2` este PV liber.',
  ],
  criteria: [
    { id: 'ac1', text: 'Grupul datavg există și conține vdb1.', manualCheck: 'sudo vgs datavg' },
    { id: 'ac2', text: 'Ai extins datavg cu vdb2 și VSize a crescut la ≈2 GiB.', manualCheck: 'sudo vgs datavg' },
    { id: 'ac3', text: 'Ai citit „PE Size” și „Free PE” din vgdisplay.', manualCheck: 'sudo vgdisplay datavg' },
    { id: 'ac4', text: 'Ai scos vdb2 din datavg; apare liber în pvs.', manualCheck: 'sudo pvs' },
  ],
  steps: [
    {
      title: 'Pregătește PV-urile',
      purpose: 'VG-urile se construiesc din PV-uri existente.',
      hint: 'Dacă PV-urile există deja, `pvs` le arată.',
      commands: 'sudo pvs\nsudo pvcreate /dev/vdb1 /dev/vdb2',
      explain: [
        ['pvs', 'verifică ce PV-uri există deja.'],
        ['pvcreate …', 'inițializează cele două partiții ca PV (L5.2).'],
      ],
    },
    {
      title: 'Creează grupul',
      purpose: 'Grupul adună spațiul PV-urilor.',
      hint: 'Numele grupului este primul argument.',
      commands: 'sudo vgcreate datavg /dev/vdb1\nsudo vgs datavg',
      explain: [
        ['vgcreate datavg /dev/vdb1', 'creează grupul „datavg” cu PV-ul /dev/vdb1; extentul este 4 MiB (implicit).'],
        ['vgs datavg', 'afișează doar grupul datavg.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo vgs datavg\n  VG     #PV #LV #SN Attr   VSize    VFree\n  datavg   1   0   0 wz--n- 1020.00m 1020.00m', explain: '#PV 1 = un PV; #LV 0 = niciun volum logic; VFree = tot spațiul. Valorile sunt exemple.' },
    },
    {
      title: 'Extinde grupul',
      purpose: 'Adaugi spațiu fără să afectezi nimic existent.',
      hint: 'vgextend primește numele grupului, apoi PV-ul.',
      commands: 'sudo vgextend datavg /dev/vdb2\nsudo vgs datavg\nsudo vgdisplay datavg',
      explain: [
        ['vgextend datavg /dev/vdb2', 'adaugă PV-ul /dev/vdb2 în datavg (dacă nu este PV, vgextend îl inițializează).'],
        ['vgdisplay datavg', 'format lung: PE Size, Total PE, Alloc PE, Free PE, VG UUID.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo vgdisplay datavg\n  --- Volume group ---\n  VG Name               datavg\n  Format                lvm2\n  VG Size               1.99 GiB\n  PE Size               4.00 MiB\n  Total PE              510\n  Alloc PE / Size       0 / 0\n  Free  PE / Size       510 / 1.99 GiB', explain: '510 extents × 4 MiB ≈ 1.99 GiB. Alloc PE = 0, deoarece nu există LV-uri.' },
      reflect: 'De ce VSize este puțin sub 2 GiB?',
    },
    {
      title: 'Redu grupul',
      purpose: 'Scoți un PV gol din grup.',
      hint: 'Merge doar dacă PV-ul nu este folosit de niciun LV.',
      commands: 'sudo vgreduce datavg /dev/vdb2\nsudo vgs datavg\nsudo pvs',
      explain: [
        ['vgreduce datavg /dev/vdb2', 'scoate PV-ul din grup; datele nu se șterg, iar PV-ul rămâne inițializat.'],
        ['pvs', 'după vgreduce, /dev/vdb2 apare cu VG gol.'],
      ],
    },
  ],
  verification: [
    { cmd: 'sudo vgs datavg', expected: '#PV 1, VSize ≈ 1 GiB' },
    { cmd: 'sudo pvs', expected: 'vdb1 în datavg, vdb2 fără VG' },
  ],
  persistence: [
    'Metadatele VG sunt scrise pe PV-uri și supraviețuiesc reboot-ului.',
    'Copii ale metadatelor se păstrează în /etc/lvm/backup și /etc/lvm/archive (automat).',
  ],
  mistakes: [
    'Inversarea argumentelor: PV-ul înaintea numelui VG.',
    'Folosirea lui vgcreate cu un nume deja existent (folosește vgextend).',
    'Încercarea vgreduce pe un PV care conține extents alocate (mută-le cu pvmove).',
    'Confuzia vgremove cu vgreduce (vgremove șterge tot grupul).',
  ],
  troubleshooting: [
    { symptom: '`Volume group "datavg" already exists`', cause: 'ai folosit vgcreate pentru un nume existent', fix: 'folosește `vgextend` pentru adăugare.' },
    { symptom: '`Physical volume … is still in use`', cause: 'PV conține extents alocate', fix: '`pvmove` la alt PV, apoi `vgreduce`.' },
    { symptom: '`Physical volume … not found`', cause: 'dispozitiv greșit sau neinițializat', fix: '`pvcreate` și verifică cu `pvs`.' },
  ],
  alternatives: [
    '`vgcreate datavg /dev/vdb1 /dev/vdb2` creează grupul direct cu două PV-uri.',
    '`vgcreate -s 8M datavg …` alege dimensiunea extentului (8 MiB).',
  ],
};
