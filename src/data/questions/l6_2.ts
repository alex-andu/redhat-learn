import type { Question } from '../../lib/types';

const T = 'L6.2';
const O = ['C6-4'];

export const Q_L6_2: Question[] = [
  {
    id: 'L6.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai extins cu `lvextend -L +300M /dev/datavg/data` un LV cu XFS montat pe `/data`. `lvs` arată dimensiunea nouă, dar `df -h /data` arată tot cea veche. De ce?',
    explanation: 'LV-ul și [[filesystem]]-ul sunt straturi diferite: extinderea primului nu extinde automat al doilea (fără `-r`).',
    options: [
      { id: 'a', text: 'Sistemul de fișiere nu a fost extins; lipsește `xfs_growfs /data` (sau `lvextend -r`).', correct: true, why: 'lvextend modifică doar containerul; superblock-ul XFS încă declară vechea dimensiune.' },
      { id: 'b', text: 'Trebuie demontat și remontat sistemul de fișiere.', correct: false, why: 'Remontarea nu schimbă dimensiunea declarată în superblock.' },
      { id: 'c', text: 'Trebuie repornit sistemul.', correct: false, why: 'Un reboot nu extinde sistemul de fișiere; extinderea se face cu xfs_growfs.' },
      { id: 'd', text: 'df afișează în MB, lvs în MiB, deci diferența e doar de unități.', correct: false, why: 'Diferența ar fi de câteva procente, nu de sute de MiB.' },
    ],
  },
  {
    id: 'L6.2-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Extinde cu 500 MiB volumul logic `/dev/datavg/data` și redimensionează automat și sistemul de fișiere.',
    prompt: '[root@server1 ~]#',
    answers: ['lvextend -L +500M -r /dev/datavg/data', 'lvextend -r -L +500M /dev/datavg/data', 'lvextend -L +500M --resizefs /dev/datavg/data', 'sudo lvextend -L +500M -r /dev/datavg/data', 'lvextend -L +500M -r datavg/data', 'lvextend --size +500M -r /dev/datavg/data'],
    canonical: 'lvextend -L +500M -r /dev/datavg/data',
    explanation: '`-L +500M` adaugă 500 MiB; `-r` (`--resizefs`) extinde și sistemul de fișiere.',
    wrong: [
      { text: 'lvextend -L 500M -r /dev/datavg/data', why: 'Fără +, 500M este dimensiunea FINALĂ, nu un adaos.' },
      { text: 'lvextend -L +500M /dev/datavg/data', why: 'Fără -r, sistemul de fișiere nu este extins.' },
      { text: 'lvcreate -L +500M -r /dev/datavg/data', why: 'lvcreate creează volume noi; extinderea se face cu lvextend.' },
    ],
  },
  {
    id: 'L6.2-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Adaugă tot spațiul liber din VG la `/dev/datavg/data` și extinde și sistemul de fișiere.',
    prompt: '[root@server1 ~]#',
    answers: ['lvextend -l +100%FREE -r /dev/datavg/data', 'lvextend -r -l +100%FREE /dev/datavg/data', 'lvextend -l +100%FREE --resizefs /dev/datavg/data', 'sudo lvextend -l +100%FREE -r /dev/datavg/data', 'lvextend -l +100%FREE -r datavg/data'],
    canonical: 'lvextend -l +100%FREE -r /dev/datavg/data',
    explanation: '`-l +100%FREE` adaugă toate extents-urile libere ale grupului; `-r` extinde sistemul de fișiere.',
    wrong: [
      { text: 'lvextend -l +100%VG -r /dev/datavg/data', why: '+100%VG ar adăuga o cantitate egală cu dimensiunea întregului grup, mai mult decât spațiul liber: comanda eșuează. Pentru „tot ce e liber” se folosește %FREE.' },
      { text: 'lvcreate -l +100%FREE -r /dev/datavg/data', why: 'lvcreate creează volume noi; pentru un LV existent se folosește lvextend.' },
      { text: 'lvextend -l +100%FREE /dev/datavg/data', why: 'Fără -r, sistemul de fișiere rămâne la dimensiunea veche.' },
    ],
  },
  {
    id: 'L6.2-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Un LV cu **XFS** montat pe `/data` a fost extins fără `-r`. Extinde acum sistemul de fișiere.',
    prompt: '[root@server1 ~]#',
    answers: ['xfs_growfs /data', 'sudo xfs_growfs /data'],
    canonical: 'xfs_growfs /data',
    explanation: '`xfs_growfs` primește punctul de montare al unui XFS montat și îl extinde până la dimensiunea dispozitivului ([[xfs-growfs]]).',
    wrong: [
      { text: 'resize2fs /dev/datavg/data', why: 'resize2fs este pentru ext2/3/4; pe XFS dă eroare.' },
      { text: 'xfs_growfs /dev/datavg/ext', why: 'Argumentul trebuie să fie punctul de montare (sau dispozitivul unui XFS montat); aici este un alt volum.' },
      { text: 'xfs_repair /data', why: 'xfs_repair repară un XFS demontat; nu îl extinde.' },
    ],
  },
  {
    id: 'L6.2-005', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Un LV cu **ext4** (`/dev/datavg/ext`) a fost extins fără `-r`. Extinde acum sistemul de fișiere.',
    prompt: '[root@server1 ~]#',
    answers: ['resize2fs /dev/datavg/ext', 'sudo resize2fs /dev/datavg/ext', 'resize2fs /dev/mapper/datavg-ext'],
    canonical: 'resize2fs /dev/datavg/ext',
    explanation: '[[resize2fs]] primește dispozitivul și, fără argument de dimensiune, umple tot dispozitivul.',
    wrong: [
      { text: 'xfs_growfs /ext', why: 'xfs_growfs este pentru XFS.' },
      { text: 'resize2fs /ext', why: 'Argumentul trebuie să fie dispozitivul, nu punctul de montare.' },
      { text: 'lvextend -r /dev/datavg/ext', why: 'Fără dimensiune, lvextend nu are ce extinde; folosește resize2fs pentru a extinde sistemul de fișiere.' },
    ],
  },
  {
    id: 'L6.2-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce s-a întâmplat?',
    explanation: 'Mesajul indică spațiu insuficient în VG.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# vgs datavg\n  VG     #PV #LV #SN Attr   VSize  VFree\n  datavg   1   2   0 wz--n- <2.00g 400.00m\n[root@server1 ~]# lvextend -L +1G -r /dev/datavg/data\n  Insufficient free space: 256 extents needed, but only 100 available' },
    options: [
      { id: 'a', text: 'VG-ul mai are doar 400 MiB liberi; trebuie un PV nou (`pvcreate` + `vgextend`) sau o cerere mai mică.', correct: true, why: '1 GiB = 256 extents de 4 MiB; sunt disponibili 100 (400 MiB).' },
      { id: 'b', text: 'LV-ul este montat și trebuie demontat înainte.', correct: false, why: 'Extinderea se face online; mesajul nu vorbește despre montare.' },
      { id: 'c', text: 'Opțiunea -r nu este suportată pe RHEL.', correct: false, why: '-r este suportată; problema este lipsa de spațiu.' },
      { id: 'd', text: 'Comanda corectă este `lvcreate`.', correct: false, why: 'lvcreate creează un volum nou; aici se extinde unul existent.' },
    ],
  },
  {
    id: 'L6.2-007', topicId: T, objectives: O, difficulty: 3, type: 'multi',
    stem: 'Un LV are 700 MiB. Care dintre comenzi îl aduc la **exact** 1000 MiB (ignorând rotunjirea la extent)?',
    explanation: 'Cu `+` adaugi; fără `+` stabilești dimensiunea finală.',
    options: [
      { id: 'a', text: '`lvextend -L +300M LV`', correct: true, why: '700 + 300 = 1000 MiB.' },
      { id: 'b', text: '`lvextend -L 1000M LV`', correct: true, why: 'Dimensiunea finală este 1000 MiB.' },
      { id: 'c', text: '`lvextend -L +1000M LV`', correct: false, why: 'Rezultă 1700 MiB.' },
      { id: 'd', text: '`lvextend -L 300M LV`', correct: false, why: '300 MiB este mai mic decât dimensiunea curentă; lvextend refuză (nu micșorează).' },
    ],
  },
  {
    id: 'L6.2-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Colegul tău propune să rezolvi lipsa de spațiu de pe un XFS prin `lvreduce`/micșorare pentru a „recupera” spațiu. Care este problema?',
    explanation: 'Un XFS nu se poate micșora cu instrumentele standard (xfs_growfs doar mărește).',
    snippet: { kind: 'find-error', title: 'propunere', code: 'sudo umount /data\nsudo lvreduce -L -200M /dev/datavg/data\nsudo mount /dev/datavg/data /data' },
    options: [
      { id: 'a', text: 'Micșorând LV-ul sub dimensiunea sistemului de fișiere XFS (care nu poate fi micșorat), tai datele și îl corupi.', correct: true, why: 'Sistemul de fișiere ar rămâne cu superblock-ul vechi, mai mare decât LV-ul: structuri tăiate, montare eșuată sau date pierdute.' },
      { id: 'b', text: 'Comanda corectă ar fi `lvextend -L -200M`.', correct: false, why: 'lvextend nu micșorează (cere o dimensiune mai mare).' },
      { id: 'c', text: 'Nu este nicio problemă, XFS se micșorează la fel ca ext4.', correct: false, why: 'XFS nu poate fi micșorat; doar ext4 (demontat, cu resize2fs).' },
      { id: 'd', text: 'Lipsește `-r` la lvreduce.', correct: false, why: '-r nu ajută: sistemul XFS nu se poate micșora; tăierea LV-ului îl distruge.' },
    ],
  },
  {
    id: 'L6.2-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a extinde un LV cu XFS pe `/data` cu 1 GiB atunci când VG-ul NU are spațiu liber și ai o partiție goală `/dev/vdc1`, fără a folosi `-r`.',
    explanation: 'Mai întâi spațiul în grup, apoi LV-ul, la final sistemul de fișiere.',
    items: [
      { text: '`vgs` — constați că VFree este insuficient', why: 'Diagnostic: nu poți extinde un LV peste VFree.' },
      { text: '`pvcreate /dev/vdc1`', why: 'Pregătești partiția ca PV.' },
      { text: '`vgextend datavg /dev/vdc1`', why: 'Adaugi PV-ul în grup; VFree crește.' },
      { text: '`lvextend -L +1G /dev/datavg/data`', why: 'Extinzi containerul (LV-ul).' },
      { text: '`xfs_growfs /data`', why: 'Extinzi sistemul de fișiere până la dimensiunea LV-ului.' },
    ],
  },
  {
    id: 'L6.2-010', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește fiecare situație cu comanda potrivită.',
    explanation: 'Alegi instrumentul după strat (VG, LV, sistem de fișiere) și după tipul sistemului de fișiere.',
    leftLabel: 'Situație', rightLabel: 'Comandă',
    pairs: [
      { left: 'VG-ul nu are spațiu liber și ai un PV nou', right: '`vgextend datavg /dev/vdc1`', why: 'Adaugă PV-ul în grup, crescând VFree.' },
      { left: 'Extinzi sistemul de fișiere XFS de pe /data', right: '`xfs_growfs /data`', why: 'Argumentul este punctul de montare.' },
      { left: 'Extinzi un sistem ext4 de pe /dev/datavg/ext', right: '`resize2fs /dev/datavg/ext`', why: 'Argumentul este dispozitivul.' },
      { left: 'Extinzi LV-ul ȘI sistemul de fișiere dintr-o comandă', right: '`lvextend -r`', why: '-r (--resizefs) apelează fsadm pentru sistemul de fișiere.' },
    ],
    distractors: [{ text: '`lvcreate -n data -L 1G datavg`', why: 'Creează un LV nou; nu extinde unul existent.' }],
  },
  {
    id: 'L6.2-011', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce comandă simulează extinderea unui XFS fără să modifice nimic?',
    explanation: 'xfs_growfs are un mod „dry run”.',
    options: [
      { id: 'a', text: '`xfs_growfs -n /data`', correct: true, why: '-n afișează geometria și verifică argumentele, fără să crească sistemul de fișiere (xfs_growfs(8)).' },
      { id: 'b', text: '`xfs_growfs -d /data`', correct: false, why: '-d crește secțiunea de date la dimensiunea maximă: modifică.' },
      { id: 'c', text: '`xfs_growfs -l /data`', correct: false, why: '-l se referă la jurnal și este marcat „not implemented” în man.' },
      { id: 'd', text: '`xfs_repair -n /data`', correct: false, why: 'xfs_repair -n este verificare fără reparare, dar pe un sistem DEMONTAT, și nu simulează extinderea.' },
    ],
  },
];
