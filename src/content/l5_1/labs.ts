import type { Lab } from '../../lab/types';

export const LAB_L5_1: Lab = {
  id: 'lab-l5-1-partitii-gpt',
  lessonId: 'L5.1',
  title: 'Listează, creează și șterge partiții pe un disc GPT',
  modes: ['guided', 'independent'],
  objectives: ['C5-1'],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Ai primit un disc suplimentar, gol, pe un server de test. Trebuie să îl inițializezi cu o tabelă GPT, să creezi două partiții (1 GiB și 2 GiB), să le verifici, apoi să ștergi a doua partiție.',
    'Discul nou NU este cel de sistem. Înainte de orice scriere, identifică-l cu `lsblk` (în exemple: `/dev/vdb`; la tine poate fi `/dev/sdb`).',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, acces root sau `sudo`.',
    'Un disc secundar GOL (de exemplu `/dev/vdb`), de cel puțin 4 GiB; orice date de pe el se vor pierde.',
    'Pachetul `parted` (și `util-linux` pentru `lsblk`, `fdisk`) instalat.',
  ],
  finalState: [
    'Discul de test are tabelă GPT și o singură partiție de 1 GiB (vdb1); a doua a fost ștearsă.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai identificat discul gol și ai notat numele lui (nu discul de sistem).', manualCheck: 'lsblk' },
    { id: 'ac2', text: 'Discul are o tabelă de partiții de tip GPT.', manualCheck: 'parted /dev/vdb print | grep "Partition Table"' },
    { id: 'ac3', text: 'Au existat două partiții de 1 GiB și 2 GiB (aproximativ).', manualCheck: 'lsblk /dev/vdb' },
    { id: 'ac4', text: 'Partiția 2 a fost ștearsă; a rămas doar vdb1.', manualCheck: 'lsblk /dev/vdb' },
  ],
  steps: [
    {
      title: 'Identifică discul țintă',
      purpose: 'Greșeala de disc este cea mai gravă greșeală la partiționare; verifici înainte să scrii.',
      hint: 'Discul de sistem are partiții montate pe / și /boot. Discul nou nu are partiții și nu are MOUNTPOINTS.',
      commands: 'lsblk\nlsblk -f\nsudo fdisk -l /dev/vdb',
      explain: [
        ['lsblk', 'listează discurile și partițiile în arbore; TYPE „disk” = disc, „part” = partiție.'],
        ['lsblk -f', '-f = afișează și sistemul de fișiere, LABEL, UUID și punctul de montare.'],
        ['fdisk -l /dev/vdb', '-l = listează tabela de partiții a discului indicat, fără să modifice nimic.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ lsblk\nNAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS\nvda    252:0    0   20G  0 disk\n├─vda1 252:1    0    1G  0 part /boot\n└─vda2 252:2    0   19G  0 part /\nvdb    252:16   0    4G  0 disk', explain: 'vda este discul de sistem (are / și /boot). vdb are 4 GiB și nicio partiție: este discul de test. Numele și dimensiunile sunt exemple.' },
    },
    {
      title: 'Creează tabela GPT',
      purpose: 'Un disc nou are nevoie de o etichetă (tabelă) înainte de partiții.',
      hint: '`mklabel gpt` șterge orice tabelă veche de pe disc. Rulezi comanda doar pe vdb.',
      commands: 'sudo parted /dev/vdb mklabel gpt\nsudo parted /dev/vdb print',
      explain: [
        ['sudo parted /dev/vdb', 'pornește parted pe discul vdb; modificările se aplică imediat.'],
        ['mklabel gpt', 'scrie o tabelă GPT goală (eticheta discului).'],
        ['print', 'afișează tabela curentă: model, dimensiune, „Partition Table: gpt”.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo parted /dev/vdb print\nModel: Virtio Block Device (virtblk)\nDisk /dev/vdb: 4295MB\nSector size (logical/physical): 512B/512B\nPartition Table: gpt\nDisk Flags:\n\nNumber  Start  End  Size  File system  Name  Flags', explain: '„Partition Table: gpt” = succes. Lista de partiții este goală.' },
    },
    {
      title: 'Creează două partiții',
      purpose: 'Împarți discul în două zone, aliniate la 1 MiB.',
      hint: 'Prima partiție începe la 1MiB (aliniere). A doua începe unde se termină prima.',
      commands: 'sudo parted /dev/vdb mkpart data1 1MiB 1GiB\nsudo parted /dev/vdb mkpart data2 1GiB 3GiB\nsudo partprobe /dev/vdb\nlsblk /dev/vdb',
      explain: [
        ['mkpart data1 1MiB 1GiB', 'creează o partiție numită data1, de la 1 MiB la 1 GiB (≈1 GiB). La GPT, primul argument este NUMELE partiției, nu un tip.'],
        ['mkpart data2 1GiB 3GiB', 'a doua partiție, 2 GiB, imediat după prima.'],
        ['partprobe /dev/vdb', 'cere kernelului să recitească tabela, ca să apară /dev/vdb1 și /dev/vdb2.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ lsblk /dev/vdb\nNAME   MAJ:MIN RM SIZE RO TYPE MOUNTPOINTS\nvdb    252:16   0   4G  0 disk\n├─vdb1 252:17   0   1G  0 part\n└─vdb2 252:18   0   2G  0 part', explain: 'Două partiții noi, fără punct de montare (nu au sistem de fișiere încă).' },
      reflect: 'De ce începem la 1MiB și nu la 0? Ce rol are alinierea?',
    },
    {
      title: 'Șterge a doua partiție',
      purpose: 'Exersezi ștergerea; verifici numărul partiției înainte.',
      hint: 'Numărul din `parted print` este argumentul lui `rm`.',
      commands: 'sudo parted /dev/vdb print\nsudo parted /dev/vdb rm 2\nsudo partprobe /dev/vdb\nlsblk /dev/vdb',
      explain: [
        ['parted /dev/vdb rm 2', 'șterge intrarea numărul 2 din tabela de partiții; datele din ea devin inaccesibile.'],
        ['print', 'rulat înainte, arată ce număr are fiecare partiție.'],
      ],
    },
  ],
  verification: [
    { cmd: 'parted /dev/vdb print', expected: 'Partition Table: gpt; o singură partiție (1) de ≈1074MB' },
    { cmd: 'lsblk /dev/vdb', expected: 'vdb cu vdb1 de 1G; vdb2 lipsește' },
  ],
  persistence: [
    'Tabela de partiții este scrisă pe disc și rămâne după reboot; nu este nevoie de nicio configurare suplimentară.',
    'Nu există nimic în /etc/fstab: partițiile nu sunt formatate sau montate (C5-5, C6).',
  ],
  mistakes: [
    'Rularea comenzilor pe discul de sistem (vda) în loc de discul nou.',
    'Uitarea faptului că parted scrie imediat: nu există „undo”.',
    'Pornirea primei partiții la 0 sau la un sector nealiniat.',
    'Folosirea numelui partiției (vdb1) în loc de nume de disc (vdb) la mklabel.',
  ],
  troubleshooting: [
    { symptom: 'vdb1 nu apare în lsblk după mkpart', cause: 'kernelul nu a recitit tabela', fix: 'sudo partprobe /dev/vdb sau sudo udevadm settle.' },
    { symptom: 'Warning: the kernel failed to re-read the partition table', cause: 'o partiție a discului este în uz (montată)', fix: 'demontează partițiile discului sau repornește sistemul.' },
    { symptom: 'The resulting partition is not properly aligned', cause: 'început dat de mână, nealiniat', fix: 'folosește 1MiB sau lasă valorile implicite.' },
  ],
  alternatives: [
    'Cu fdisk: `sudo fdisk /dev/vdb`, apoi g (GPT nouă), n (partiție nouă; acceptă valorile implicite, +1G la Last sector), p (listează), d (șterge), w (scrie).',
    'Cu gdisk (pachetul gdisk, dacă e instalat): comenzile o, n, d, w, similare cu fdisk.',
  ],
};
