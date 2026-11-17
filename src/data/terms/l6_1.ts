import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'filesystem', abbr: 'sistem de fișiere', full: 'file system', ro: 'structura scrisă pe un dispozitiv care permite fișiere și directoare',
    what: 'Un set de structuri de date (superblock, inode-uri, evidența blocurilor libere, jurnal) plus codul din kernel care le înțelege; transformă blocurile brute ale unui disc în fișiere cu nume, directoare, permisiuni și date.',
    how: 'Este creat de mkfs pe un dispozitiv de tip bloc (partiție sau LV) și devine accesibil când este atașat unui director cu mount. Tipuri: XFS, ext4, VFAT, NFS (prin rețea).',
    where: 'Fiecare partiție sau LV în care vrei să scrii fișiere are nevoie de unul; vezi tipul cu lsblk -f sau df -T.',
    topics: ['L6.1'], aliases: ['file system', 'filesystem', 'fs', 'sisteme de fișiere'],
  },
  {
    id: 'xfs', abbr: 'XFS', ro: 'sistemul de fișiere implicit în RHEL',
    what: 'Sistem de fișiere cu jurnal, proiectat pentru volume și fișiere mari și acces paralel; împarte spațiul în allocation groups.',
    how: 'Se creează cu mkfs.xfs, se mărește online cu xfs_growfs (argument: punctul de montare), nu se micșorează în practică, se repară cu xfs_repair (demontat).',
    where: 'Alegerea implicită când enunțul nu cere alt tip: mkfs.xfs -L eticheta /dev/vdb1.',
    topics: ['L6.1', 'L6.2'], aliases: ['mkfs.xfs', 'xfs_growfs', 'xfs_repair', 'xfs_info'],
  },
  {
    id: 'ext4', abbr: 'ext4', full: 'fourth extended file system', ro: 'sistemul de fișiere clasic Linux, cu jurnal',
    what: 'Succesorul ext2/ext3: sistem de fișiere cu jurnal, stabil și răspândit; are inode-uri alocate la creare și blocuri rezervate pentru root (5% implicit).',
    how: 'Se creează cu mkfs.ext4 (mke2fs -t ext4), se mărește cu resize2fs (online sau offline), se micșorează doar demontat, se verifică cu fsck.ext4/e2fsck.',
    where: 'Când enunțul îl cere explicit sau ai nevoie să poți micșora volumul: mkfs.ext4 -L eticheta /dev/vdb2.',
    topics: ['L6.1', 'L6.2'], aliases: ['mkfs.ext4', 'resize2fs', 'tune2fs', 'e2label', 'mke2fs'],
  },
  {
    id: 'vfat', abbr: 'VFAT', full: 'Virtual FAT (FAT12/16/32)', ro: 'sistem de fișiere compatibil cu Windows',
    what: 'Familia FAT cu nume lungi: fără permisiuni Unix, fără jurnal, fișiere sub 4 GiB (FAT32); folosit pe stick-uri USB și pe partiția EFI.',
    how: 'Se creează cu mkfs.vfat (mkfs.fat, pachetul dosfstools). Proprietarul și permisiunile aparente se dau la montare cu uid=, gid=, umask=, fmask=, dmask=; chmod/chown nu funcționează.',
    where: 'mount -t vfat -o uid=1000,gid=1000,fmask=133,dmask=022 /dev/vdb3 /mnt/usb; partiția /boot/efi.',
    topics: ['L6.1', 'L6.5'], aliases: ['fat', 'fat32', 'mkfs.vfat', 'mkfs.fat', 'fatlabel'],
  },
  {
    id: 'journaling', abbr: 'journaling', ro: 'notarea modificărilor într-un jurnal înainte de a le aplica',
    what: 'Mecanism care protejează structura sistemului de fișiere la oprire bruscă: se scrie întâi intenția în jurnal, apoi modificarea.',
    how: 'La montare după o oprire necurată, kernelul reia din jurnal operațiile neterminate, în câteva secunde, fără scanarea întregului disc. XFS și ext4 jurnalizează metadatele.',
    where: 'De aceea XFS nu are nevoie de fsck la pornire; FAT, care nu are jurnal, poate cere fsck.fat.',
    topics: ['L6.1'], aliases: ['jurnal', 'journal'],
  },
  {
    id: 'mkfs', abbr: 'mkfs', ro: 'comanda care creează un sistem de fișiere pe un dispozitiv',
    what: 'Scrie structurile de bază (superblock, inode-uri, jurnal, directorul rădăcină) pe un dispozitiv; distruge accesul la datele anterioare.',
    how: 'mkfs -t TIP DISPOZITIV apelează mkfs.TIP (mkfs.xfs, mkfs.ext4, mkfs.vfat). Opțiuni uzuale: -L/-n etichetă, -f/-F forțare.',
    where: 'După crearea unei partiții sau a unui LV și înainte de mount.',
    topics: ['L6.1'], aliases: ['mkfs.xfs', 'mkfs.ext4', 'mkfs.vfat', 'formatare'],
  },
  {
    id: 'mount-cmd', abbr: 'mount / umount', ro: 'atașează / detașează un sistem de fișiere de arborele de directoare',
    what: 'mount face rădăcina unui sistem de fișiere accesibilă la un director existent; umount îl detașează (după ce nu mai este folosit).',
    how: 'mount [-t tip] [-o opțiuni] SURSĂ DIRECTOR; fără argumente listează montările; mount -a montează tot din /etc/fstab. umount: „target is busy” dacă ceva îl folosește.',
    where: 'mount /dev/vdb1 /mnt/date; findmnt /mnt/date; umount /mnt/date.',
    topics: ['L6.1', 'L6.3'], aliases: ['mount', 'umount', 'findmnt', 'target is busy'],
  },
];
