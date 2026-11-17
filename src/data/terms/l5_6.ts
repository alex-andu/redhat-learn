import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'swap', abbr: 'swap', ro: 'spațiu de pe disc folosit ca extensie a memoriei RAM',
    what: 'Când RAM-ul este aproape plin, kernelul mută pe disc paginile de memorie rar folosite, ca să elibereze RAM pentru ce este activ. Swap poate fi o partiție, un LV sau un fișier.',
    how: 'Spațiul trebuie pregătit cu mkswap (scrie semnătura și UUID) și activat cu swapon. Este folosit în pagini de memorie (de obicei 4 KiB).',
    where: 'Sisteme cu memorie limitată, hibernare și protecție la vârfuri de consum. Se confirmă cu swapon --show și free -h.',
    topics: ['L5.6'], aliases: ['swapon', 'swapoff', 'mkswap', 'swap space'],
  },
  {
    id: 'non-destructive', abbr: 'non-destructiv', ro: 'operație care nu șterge și nu mută date existente',
    what: 'Adăugarea de partiții, LV-uri sau swap în spațiu liber sau pe discuri noi, fără a modifica datele existente. Opusul: mklabel, mkfs, pvcreate -f pe ce conține date.',
    how: 'Folosești spațiu nealocat (parted print free, vgs VFree) sau un disc nou, și extinzi, nu recreezi (lvextend, vgextend).',
    where: 'La examen: „fără a pierde datele existente” cere extindere, nu reformatare.',
    topics: ['L5.6'], aliases: ['non-destructively'],
  },
  {
    id: 'lvextend', abbr: 'lvextend', ro: 'mărește un volum logic existent',
    what: 'Adaugă spațiu unui LV existent din spațiul liber al VG. Cu -r (--resizefs) extinde și sistemul de fișiere dintr-un pas.',
    how: 'Alocă extents suplimentare; sistemul de fișiere trebuie mărit separat (xfs_growfs, resize2fs) dacă nu folosești -r.',
    where: 'Volume care se umplu: lvextend -L +1G -r /dev/datavg/data, fără demontare pentru XFS și ext4.',
    topics: ['L5.6'], aliases: ['lvextend -r', 'xfs_growfs', 'resize2fs'],
  },
];
