import type { Question } from '../../lib/types';

const T = 'L6.1';
const O = ['C6-1'];

export const Q_L6_1: Question[] = [
  {
    id: 'L6.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai creat o partiție nouă `/dev/vdb1`. Ce trebuie să faci ÎNAINTE de a putea monta partiția și a scrie fișiere pe ea?',
    explanation: 'O partiție nouă este doar spațiu gol; un [[filesystem]] se creează cu mkfs.',
    options: [
      { id: 'a', text: 'Creezi un sistem de fișiere cu `mkfs` (de exemplu `mkfs.xfs /dev/vdb1`).', correct: true, why: 'mkfs scrie superblock-ul, inode-urile și jurnalul; fără ele, mount nu știe ce să atașeze.' },
      { id: 'b', text: 'Rulezi `mount /dev/vdb1 /mnt` direct; mount formatează automat.', correct: false, why: 'mount nu formatează; pe un dispozitiv fără sistem de fișiere eșuează cu „wrong fs type”.' },
      { id: 'c', text: 'Rulezi `umount /dev/vdb1`.', correct: false, why: 'umount detașează ceva deja montat; partiția nu este montată.' },
      { id: 'd', text: 'Editezi `/etc/fstab` și repornești.', correct: false, why: 'fstab spune ce să monteze, dar nu creează sistemul de fișiere; fără mkfs montarea eșuează și poți bloca boot-ul.' },
    ],
  },
  {
    id: 'L6.1-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Creează un sistem de fișiere XFS pe `/dev/vdb1`, cu eticheta `datexfs`.',
    prompt: '[root@server1 ~]#',
    answers: ['mkfs.xfs -L datexfs /dev/vdb1', 'mkfs -t xfs -L datexfs /dev/vdb1', 'mkfs.xfs /dev/vdb1 -L datexfs', 'sudo mkfs.xfs -L datexfs /dev/vdb1', 'mkfs.xfs --label datexfs /dev/vdb1'],
    canonical: 'mkfs.xfs -L datexfs /dev/vdb1',
    explanation: '`mkfs.xfs` creează XFS; `-L` setează eticheta (maximum 12 caractere).',
    wrong: [
      { text: 'mkfs.xfs -n datexfs /dev/vdb1', why: '-n la mkfs.xfs este pentru opțiunile de denumire (naming), nu pentru etichetă; eticheta este -L.' },
      { text: 'mkfs.ext4 -L datexfs /dev/vdb1', why: 'mkfs.ext4 creează ext4, nu XFS.' },
      { text: 'xfs_growfs -L datexfs /dev/vdb1', why: 'xfs_growfs extinde un XFS existent și montat; nu creează sisteme de fișiere.' },
    ],
  },
  {
    id: 'L6.1-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Creează un sistem de fișiere ext4 pe `/dev/vdb2`, cu eticheta `datae4`.',
    prompt: '[root@server1 ~]#',
    answers: ['mkfs.ext4 -L datae4 /dev/vdb2', 'mkfs -t ext4 -L datae4 /dev/vdb2', 'sudo mkfs.ext4 -L datae4 /dev/vdb2', 'mkfs.ext4 /dev/vdb2 -L datae4'],
    canonical: 'mkfs.ext4 -L datae4 /dev/vdb2',
    explanation: '`mkfs.ext4` (echivalent cu `mke2fs -t ext4`) cu `-L` pentru etichetă (maximum 16 octeți).',
    wrong: [
      { text: 'mkfs.ext4 -n datae4 /dev/vdb2', why: '-n la mke2fs înseamnă „arată ce s-ar face, fără să creezi”; nu este eticheta.' },
      { text: 'mkfs.xfs -L datae4 /dev/vdb2', why: 'mkfs.xfs creează XFS, nu ext4.' },
      { text: 'mkfs.ext4 datae4 /dev/vdb2', why: 'Fără -L, „datae4” este interpretat ca dispozitiv, nu ca etichetă.' },
    ],
  },
  {
    id: 'L6.1-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Montează sistemul de fișiere de pe `/dev/vdb1` pe directorul existent `/mnt/date`, specificând explicit tipul `xfs`.',
    prompt: '[root@server1 ~]#',
    answers: ['mount -t xfs /dev/vdb1 /mnt/date', 'mount /dev/vdb1 /mnt/date -t xfs', 'sudo mount -t xfs /dev/vdb1 /mnt/date', 'mount --types xfs /dev/vdb1 /mnt/date'],
    canonical: 'mount -t xfs /dev/vdb1 /mnt/date',
    explanation: 'Sintaxa este `mount -t TIP DISPOZITIV DIRECTOR`; dispozitivul vine înaintea directorului.',
    wrong: [
      { text: 'mount /mnt/date /dev/vdb1', why: 'Ordinea este inversată: întâi dispozitivul, apoi directorul.' },
      { text: 'mount -t ext4 /dev/vdb1 /mnt/date', why: 'Tipul cerut este xfs; cu ext4 mount eșuează cu „wrong fs type”.' },
      { text: 'mount -o xfs /dev/vdb1 /mnt/date', why: '-o este pentru opțiuni (ro, rw …), nu pentru tip; tipul se dă cu -t.' },
    ],
  },
  {
    id: 'L6.1-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Încerci să montezi o partiție nouă și primești eroarea de mai jos. Care este cauza probabilă și remedierea?',
    explanation: 'Mesajul „wrong fs type, bad option, bad superblock” înseamnă că mount nu găsește un sistem de fișiere valid.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[root@server1 ~]# mount /dev/vdb1 /mnt/date\nmount: /mnt/date: wrong fs type, bad option, bad superblock on /dev/vdb1,\n       missing codepage or helper program, or other error.' },
    options: [
      { id: 'a', text: 'Dispozitivul nu are (încă) un sistem de fișiere: verifică cu `lsblk -f`/`blkid` și creează-l cu `mkfs`.', correct: true, why: 'Pe o partiție neformatată, mount nu găsește superblock și raportează exact acest mesaj.' },
      { id: 'b', text: 'Directorul `/mnt/date` nu există; trebuie `mkdir`.', correct: false, why: 'Pentru un director lipsă mesajul este „mount point does not exist”.' },
      { id: 'c', text: 'Trebuie mărit sistemul de fișiere cu `xfs_growfs`.', correct: false, why: 'xfs_growfs mărește un XFS existent și montat; nu rezolvă lipsa sistemului de fișiere.' },
      { id: 'd', text: 'Partiția este plină și trebuie ștearsă.', correct: false, why: 'O partiție plină se montează fără probleme; aici nici nu există sistem de fișiere.' },
    ],
  },
  {
    id: 'L6.1-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce poți deduce din acest output?',
    explanation: 'FSTYPE gol înseamnă „fără sistem de fișiere”; MOUNTPOINTS gol înseamnă „nemontat”.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'lsblk -f', code: '[root@server1 ~]# lsblk -f /dev/vdb\nNAME   FSTYPE FSVER LABEL    UUID                                 FSAVAIL FSUSE% MOUNTPOINTS\nvdb\n├─vdb1 xfs          datexfs  3f5b8c1e-0d2a-4b7e-9a31-6c2e4f8d1a90  917.2M     4% /mnt/date\n├─vdb2 ext4   1.0   datae4   8a1c9e7d-55b2-4e90-8d3f-0b7a3c6e2f14\n└─vdb3' },
    options: [
      { id: 'a', text: '`vdb1` este XFS montat pe `/mnt/date`; `vdb2` este ext4 nemontat; `vdb3` nu are sistem de fișiere.', correct: true, why: 'FSTYPE completat + MOUNTPOINTS completat = montat; FSTYPE completat și MOUNTPOINTS gol = nemontat; FSTYPE gol = fără sistem de fișiere.' },
      { id: 'b', text: 'Toate cele trei partiții sunt montate.', correct: false, why: 'Doar vdb1 are un punct de montare în ultima coloană.' },
      { id: 'c', text: '`vdb2` este XFS și `vdb1` este ext4.', correct: false, why: 'Coloana FSTYPE arată xfs pentru vdb1 și ext4 pentru vdb2.' },
      { id: 'd', text: '`vdb3` este VFAT cu eticheta gol.', correct: false, why: 'FSTYPE al lui vdb3 este gol: partiția nu are sistem de fișiere, nici etichetă.' },
    ],
  },
  {
    id: 'L6.1-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmațiile despre [[vfat]] sunt adevărate?',
    explanation: 'VFAT nu are permisiuni Unix; proprietarul și modul aparente se dau la montare.',
    options: [
      { id: 'a', text: 'Nu stochează permisiuni Unix (proprietar, grup, rwx).', correct: true, why: 'FAT nu are astfel de câmpuri.' },
      { id: 'b', text: 'Proprietarul și permisiunile aparente se controlează la montare cu `uid=`, `gid=`, `umask=` / `fmask=` / `dmask=`.', correct: true, why: 'Driverul vfat „inventează” valorile din aceste opțiuni (mount(8), „Mount options for fat”).' },
      { id: 'c', text: 'Este folosit pentru partiția EFI (`/boot/efi`).', correct: true, why: 'Firmware-ul UEFI citește FAT, așa că partiția EFI este VFAT.' },
      { id: 'd', text: '`chmod` și `chown` schimbă permisiunile fișierelor de pe VFAT, la fel ca pe XFS.', correct: false, why: 'Pe FAT nu au unde să fie stocate; comenzile eșuează sau nu au efect. Se remontează cu alte opțiuni.' },
    ],
  },
  {
    id: 'L6.1-008', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Formatează `/dev/vdb3` ca FAT32, cu eticheta `USBDATE`.',
    prompt: '[root@server1 ~]#',
    answers: ['mkfs.vfat -F 32 -n USBDATE /dev/vdb3', 'mkfs.fat -F 32 -n USBDATE /dev/vdb3', 'mkfs.vfat -n USBDATE -F 32 /dev/vdb3', 'sudo mkfs.vfat -F 32 -n USBDATE /dev/vdb3', 'mkfs -t vfat -F 32 -n USBDATE /dev/vdb3'],
    canonical: 'mkfs.vfat -F 32 -n USBDATE /dev/vdb3',
    explanation: '`-F` alege dimensiunea FAT (12, 16 sau 32), iar `-n` setează eticheta (maximum 11 caractere).',
    wrong: [
      { text: 'mkfs.vfat -L USBDATE /dev/vdb3', why: 'La mkfs.fat eticheta se setează cu -n; -L nu este eticheta.' },
      { text: 'mkfs.vfat -F 64 -n USBDATE /dev/vdb3', why: 'FAT acceptă doar dimensiunile 12, 16 sau 32 (mkfs.fat(8)); 64 nu este o valoare validă.' },
      { text: 'mkfs.xfs -F 32 -n USBDATE /dev/vdb3', why: 'mkfs.xfs creează XFS și nu are aceste opțiuni.' },
    ],
  },
  {
    id: 'L6.1-009', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care sunt motive posibile pentru `umount: /mnt/date: target is busy`?',
    explanation: 'umount refuză un sistem de fișiere folosit (umount(8)).',
    options: [
      { id: 'a', text: 'Shell-ul tău are directorul curent în `/mnt/date`.', correct: true, why: 'Directorul curent al unui proces este o folosire a sistemului de fișiere.' },
      { id: 'b', text: 'Un proces are un fișier deschis pe sistemul de fișiere.', correct: true, why: 'Fișierele deschise țin sistemul de fișiere „ocupat”.' },
      { id: 'c', text: 'Un fișier swap de pe sistemul de fișiere este activ.', correct: true, why: 'umount(8) include explicit un swap folosit printre cauzele „busy”.' },
      { id: 'd', text: 'Sistemul de fișiere este ext4 și umount funcționează doar pe XFS.', correct: false, why: 'umount funcționează pe orice tip de sistem de fișiere.' },
    ],
  },
  {
    id: 'L6.1-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a adăuga un sistem de fișiere ext4 nou, montat persistent pe `/backup`, pe o partiție existentă `/dev/vdb2`.',
    explanation: 'Mai întâi sistemul de fișiere, apoi directorul și fstab, la final testul fără reboot.',
    items: [
      { text: '`mkfs.ext4 -L backup /dev/vdb2`', why: 'Creezi sistemul de fișiere; fără el nu ai ce monta.' },
      { text: '`mkdir /backup`', why: 'Creezi punctul de montare; mount nu îl creează.' },
      { text: '`blkid /dev/vdb2` — copiezi UUID-ul', why: 'UUID-ul apare doar după mkfs și este identificatorul stabil pentru fstab.' },
      { text: 'adaugi linia `UUID=… /backup ext4 defaults 0 0` în `/etc/fstab`', why: 'Face montarea persistentă.' },
      { text: '`mount -a`, apoi `findmnt /backup`', why: 'Testezi fstab imediat; o eroare apare acum, nu la boot.' },
    ],
  },
  {
    id: 'L6.1-011', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu efectul ei.',
    explanation: 'Fiecare comandă are un rol precis în ciclul mkfs → mount → umount.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`mkfs.xfs -f /dev/vdb1`', right: 'creează XFS, suprascriind un sistem de fișiere detectat', why: '-f forțează; fără el mkfs.xfs refuză un dispozitiv deja folosit.' },
      { left: '`findmnt /mnt/date`', right: 'arată sursa, tipul și opțiunile unei montări', why: 'findmnt citește tabela de montări a kernelului.' },
      { left: '`df -hT`', right: 'listează spațiul în format uman și tipul fiecărui sistem de fișiere', why: '-h = human readable, -T = tip.' },
      { left: '`wipefs -a /dev/vdb1`', right: 'șterge semnăturile de sistem de fișiere de pe dispozitiv', why: 'Distructiv; pregătește dispozitivul pentru un mkfs fără avertismente.' },
    ],
    distractors: [{ text: 'mărește un XFS montat', why: 'Aceasta este xfs_growfs (L6.2).' }],
  },
  {
    id: 'L6.1-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pe un stick USB montat ca VFAT, fișierele au modul `rwxr-xr-x` și proprietarul `root`. Ce montare ar face fișierele proprietatea utilizatorului cu UID 1000, cu mod 644 pentru fișiere?',
    explanation: 'Pe VFAT proprietarul se dă cu `uid=`/`gid=`; modul fișierelor cu `fmask=` (biții șterși din 777).',
    options: [
      { id: 'a', text: '`mount -t vfat -o uid=1000,gid=1000,fmask=133,dmask=022 /dev/vdb3 /mnt/usb`', correct: true, why: 'uid/gid dau proprietarul; fmask=133 face fișierele 644 (777 fără 133); dmask=022 face directoarele 755.' },
      { id: 'b', text: '`mount -t vfat /dev/vdb3 /mnt/usb && chown 1000 /mnt/usb/*`', correct: false, why: 'chown nu funcționează pe FAT: nu există câmp de proprietar în sistemul de fișiere.' },
      { id: 'c', text: '`mount -t vfat -o fmask=644 /dev/vdb3 /mnt/usb`', correct: false, why: 'fmask este masca biților ȘTERȘI, nu modul dorit: 644 ar interzice tocmai citirea/scrierea proprietarului.' },
      { id: 'd', text: '`mount -t vfat -o ro,uid=1000 /dev/vdb3 /mnt/usb`', correct: false, why: 'ro face sistemul read-only; nu stabilește modul fișierelor și lasă grupul neschimbat.' },
    ],
  },
];
