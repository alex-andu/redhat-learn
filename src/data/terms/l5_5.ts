import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'uuid', abbr: 'UUID', full: 'Universally Unique Identifier', ro: 'identificator unic scris în sistemul de fișiere la formatare',
    what: 'Un șir lung (de exemplu 3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b) generat de mkfs, unic la nivel practic mondial. Identifică sistemul de fișiere, indiferent de numele dispozitivului.',
    how: 'mkfs.xfs, mkfs.ext4 și mkswap îl scriu în superblock; udev creează legături în /dev/disk/by-uuid/. blkid îl afișează.',
    where: 'În /etc/fstab, UUID=… indică același sistem de fișiere chiar dacă discul își schimbă numele din vdb în vdc.',
    topics: ['L5.5'], aliases: ['blkid', 'by-uuid'],
  },
  {
    id: 'fs-label', abbr: 'label', ro: 'nume scurt dat de om unui sistem de fișiere',
    what: 'Un text (XFS: maximum 12 caractere) pe care îl alegi tu, de exemplu „data”; poate fi folosit în loc de UUID în fstab, ca LABEL=data.',
    how: 'Se setează la formatare (mkfs.xfs -L) sau ulterior (xfs_admin -L, e2label); udev creează /dev/disk/by-label/.',
    where: 'Mai ușor de citit decât UUID, dar numele trebuie să fie unic pe sistem.',
    topics: ['L5.5'], aliases: ['LABEL', 'by-label', 'e2label', 'xfs_admin'],
  },
  {
    id: 'fstab', abbr: '/etc/fstab', ro: 'fișierul cu montările care se fac automat la pornire',
    what: 'Fiecare linie are 6 câmpuri: sursă, punct de montare, tip de sistem de fișiere, opțiuni, dump, ordine fsck. La boot, systemd montează ce este listat aici.',
    how: 'systemd generează unități .mount din fstab (systemd-fstab-generator). O linie greșită poate bloca boot-ul în emergency mode, cu excepția opțiunii nofail.',
    where: 'Montări persistente de discuri, LV-uri, swap, partajări NFS.',
    topics: ['L5.5', 'L5.6'], aliases: ['fstab', 'mount -a', 'findmnt --verify'],
  },
  {
    id: 'mount-point', abbr: 'punct de montare', ro: 'directorul prin care se vede conținutul unui sistem de fișiere',
    what: 'Un director existent (de exemplu /mnt/data) în care apare conținutul sistemului de fișiere montat. Directorul trebuie să existe înainte de montare.',
    how: 'mount leagă sistemul de fișiere de director; ce conținea directorul înainte de montare este ascuns cât timp montarea este activă.',
    where: 'Fiecare sistem de fișiere persistent are un director dedicat în /mnt, /srv sau /data.',
    topics: ['L5.5'], aliases: ['mountpoint', 'mount', 'umount'],
  },
];
