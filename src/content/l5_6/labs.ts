import type { Lab } from '../../lab/types';

export const LAB_L5_6: Lab = {
  id: 'lab-l5-6-swap-extindere',
  lessonId: 'L5.6',
  title: 'Adaugă swap și extinde spațiu fără a pierde date',
  modes: ['guided', 'independent'],
  objectives: ['C5-6', 'C5-4'],
  difficulty: 3,
  estimatedMinutes: 45,
  scenario: [
    'Pe discul de test `/dev/vdb` ai deja o partiție `vdb1` (PV în VG `datavg`) și spațiu liber. (1) Adaugă o partiție nouă de 1 GiB și folosește-o ca swap persistent, după UUID. (2) Creează LV-ul `data` de 512 MiB (XFS, montat pe `/data`), scrie un fișier în el, apoi extinde-l cu 256 MiB, ONLINE, fără să pierzi fișierul.',
    'Nu rula `mklabel` sau `mkfs` pe partiții care conțin deja date.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, `sudo`.',
    'Disc `/dev/vdb` GPT cu `vdb1` ca PV în `datavg` (≥1 GiB liber în VG) și ≥1 GiB spațiu nealocat pe disc.',
    'Punctul de montare `/data` poate fi creat.',
  ],
  finalState: [
    'Un swap nou activ și în /etc/fstab (UUID); LV-ul data are ≈768 MiB, montat pe /data, cu fișierul de test intact.',
  ],
  criteria: [
    { id: 'ac1', text: 'Partiția nouă (≈1 GiB) a fost creată fără a modifica vdb1.', manualCheck: 'lsblk /dev/vdb; parted /dev/vdb print' },
    { id: 'ac2', text: 'Partiția este swap activ.', manualCheck: 'swapon --show' },
    { id: 'ac3', text: 'Swap-ul este în /etc/fstab cu UUID, punct none, tip swap.', manualCheck: 'grep swap /etc/fstab' },
    { id: 'ac4', text: 'LV-ul data are ≈768 MiB după extindere și fișierul de test există.', manualCheck: 'sudo lvs datavg; df -h /data; cat /data/test.txt' },
  ],
  steps: [
    {
      title: 'Vezi spațiul liber de pe disc',
      purpose: 'Creezi doar în spațiu nealocat; nu atingi partițiile existente.',
      hint: '`print free` arată și zonele libere.',
      commands: 'sudo parted /dev/vdb print free\nlsblk /dev/vdb',
      explain: [
        ['print free', 'afișează partițiile și intervalele „Free Space”.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo parted /dev/vdb print free\nNumber  Start   End     Size    File system  Name  Flags\n        17.4kB  1049kB  1031kB  Free Space\n 1      1049kB  2147MB  2146MB               lvm1  lvm\n        2147MB  4295MB  2147MB  Free Space', explain: 'Zona de la 2147MB încolo este liberă; vdb1 rămâne neatinsă.' },
    },
    {
      title: 'Creează partiția pentru swap',
      purpose: 'Partiție nouă în spațiul liber.',
      hint: 'Începi unde se termină vdb1; nu folosi mklabel.',
      commands: 'sudo parted /dev/vdb mkpart swap1 2147MB 3221MB\nsudo parted /dev/vdb set 2 swap on\nsudo partprobe /dev/vdb\nlsblk /dev/vdb',
      explain: [
        ['mkpart swap1 2147MB 3221MB', 'partiție numită swap1, ≈1 GiB, începând imediat după vdb1.'],
        ['set 2 swap on', 'marchează tipul „Linux swap” (opțional).'],
        ['partprobe', 'face kernelul să vadă partiția nouă.'],
      ],
    },
    {
      title: 'Pregătește și activează swap-ul',
      purpose: 'mkswap + swapon.',
      hint: 'Notează UUID-ul afișat de mkswap.',
      commands: 'sudo mkswap /dev/vdb2\nsudo swapon /dev/vdb2\nswapon --show\nfree -h',
      explain: [
        ['mkswap /dev/vdb2', 'scrie semnătura de swap și generează UUID.'],
        ['swapon /dev/vdb2', 'activează swap-ul acum (nu persistă).'],
        ['swapon --show', 'listează spațiile swap active.'],
        ['free -h', 'RAM și swap în format uman (-h).'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo mkswap /dev/vdb2\nSetting up swapspace version 1, size = 1 GiB (1073737728 bytes)\nno label, UUID=5f6e7d8c-9b0a-4c1d-8e2f-3a4b5c6d7e8f\n[student@server1 ~]$ swapon --show\nNAME      TYPE      SIZE USED PRIO\n/dev/dm-1 partition   2G   0B   -2\n/dev/vdb2 partition   1G   0B   -3', explain: 'UUID-ul este cel de pus în fstab. Noul swap are prioritate mai mică (-3) decât primul (-2). Valorile sunt exemple.' },
    },
    {
      title: 'Fă swap-ul persistent',
      purpose: 'Linie în fstab.',
      hint: 'Folosește UUID-ul tău. Pentru swap: punct none, tip swap.',
      commands: 'sudo cp /etc/fstab /etc/fstab.bak\necho "UUID=5f6e7d8c-9b0a-4c1d-8e2f-3a4b5c6d7e8f none swap defaults 0 0" | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload\nsudo swapoff /dev/vdb2\nsudo swapon -a\nswapon --show',
      explain: [
        ['tee -a', 'adaugă la sfârșitul fișierului (append); fără -a l-ai suprascrie.'],
        ['swapoff /dev/vdb2', 'dezactivează temporar, ca să testezi activarea din fstab.'],
        ['swapon -a', 'activează toate swap-urile din fstab.'],
      ],
    },
    {
      title: 'Creează LV-ul data cu un fișier de test',
      purpose: 'Pregătești datele pe care nu trebuie să le pierzi.',
      hint: 'Dacă data există din laboratorul anterior, sari la pasul de extindere.',
      commands: 'sudo lvcreate -n data -L 512M datavg\nsudo mkfs.xfs /dev/datavg/data\nsudo mkdir -p /data\nsudo mount /dev/datavg/data /data\necho "date importante" | sudo tee /data/test.txt\ndf -h /data',
      explain: [
        ['lvcreate -n data -L 512M datavg', 'LV de 512 MiB (L5.4).'],
        ['echo … | sudo tee /data/test.txt', 'scrie text într-un fișier din /data (tee rulat ca root).'],
      ],
    },
    {
      title: 'Extinde LV-ul și sistemul de fișiere, online',
      purpose: 'Mărești fără demontare și fără pierdere de date.',
      hint: '`+256M` adaugă la dimensiunea curentă; `-r` extinde și XFS-ul.',
      commands: 'sudo vgs datavg\nsudo lvextend -L +256M -r /dev/datavg/data\ndf -h /data\ncat /data/test.txt',
      explain: [
        ['lvextend', 'mărește un LV existent.'],
        ['-L +256M', 'adaugă 256 MiB la dimensiunea curentă (fără +, ar fi dimensiunea finală).'],
        ['-r', '--resizefs: extinde și sistemul de fișiere (xfs_growfs pentru XFS) după LV.'],
        ['df -h /data', 'dimensiunea sistemului de fișiere crește la ≈768 MiB.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo lvextend -L +256M -r /dev/datavg/data\n  Size of logical volume datavg/data changed from 512.00 MiB (128 extents) to 768.00 MiB (192 extents).\n  Logical volume datavg/data successfully resized.\nmeta-data=/dev/mapper/datavg-data isize=512 agcount=4 ...\ndata blocks changed from 131072 to 196608', explain: 'LVM extinde LV-ul, apoi xfs_growfs mărește XFS-ul (linia „data blocks changed”). Formularea exactă poate diferi.' },
      reflect: 'De ce XFS poate fi mărit montat, dar nu micșorat?',
    },
  ],
  verification: [
    { cmd: 'swapon --show; grep swap /etc/fstab', expected: 'swap activ și linie cu UUID, none, swap' },
    { cmd: 'sudo lvs datavg; df -h /data', expected: 'data ≈768 MiB; sistem de fișiere ≈768 MiB' },
    { cmd: 'cat /data/test.txt', expected: 'text neschimbat' },
  ],
  persistence: [
    'Swap-ul persistă numai prin linia din /etc/fstab.',
    'LV-ul și dimensiunea lui persistă pe disc; montarea lui /data cere linie în fstab (L5.5), neadăugată în acest lab.',
  ],
  mistakes: [
    'Rularea mklabel pe disc cu date, în loc de mkpart în spațiu liber.',
    'swapon fără mkswap („read swap header failed”).',
    'Linie swap cu punct de montare /swap și tip xfs.',
    '-L 768M în loc de -L +256M (merge, dar sensul este altul; dacă dimensiunea e mai mică, încerci micșorare).',
    'Uitarea -r: LV-ul crește, dar df arată tot dimensiunea veche.',
  ],
  troubleshooting: [
    { symptom: '`swapon: /dev/vdb2: read swap header failed`', cause: 'lipsește mkswap', fix: '`mkswap /dev/vdb2`.' },
    { symptom: '`swapon: insecure permissions` (la fișier swap)', cause: 'fișier cu permisiuni largi', fix: '`chmod 600`.' },
    { symptom: '`Insufficient free space` la lvextend', cause: 'VG fără spațiu liber', fix: '`vgextend` cu un PV nou.' },
    { symptom: 'df arată dimensiunea veche după lvextend', cause: 'sistemul de fișiere nu a fost extins', fix: '`sudo xfs_growfs /data` (XFS) sau `resize2fs` (ext4).' },
  ],
  alternatives: [
    'Swap pe LV: `lvcreate -n swap2 -L 1G datavg; mkswap /dev/datavg/swap2; swapon …`.',
    'Fișier swap: `sudo dd if=/dev/zero of=/swapfile bs=1M count=512; sudo chmod 600 /swapfile; sudo mkswap /swapfile; sudo swapon /swapfile`; în fstab: `/swapfile none swap defaults 0 0`.',
    '`lvextend -l +100%FREE -r /dev/datavg/data` folosește tot spațiul liber.',
    '`lvextend` fără -r, apoi `xfs_growfs /data`.',
  ],
};
