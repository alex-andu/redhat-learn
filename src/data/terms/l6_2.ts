import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'xfs-growfs', abbr: 'xfs_growfs', ro: 'comanda care mărește un sistem de fișiere XFS montat',
    what: 'Extinde un XFS până la dimensiunea dispozitivului pe care se află, adăugând allocation groups noi; datele nu se mută.',
    how: 'Cere sistemul de fișiere MONTAT; argumentul este punctul de montare. -n = dry run (afișează geometria fără să modifice). Nu micșorează în practică.',
    where: 'După lvextend fără -r: xfs_growfs /data.',
    topics: ['L6.2'], aliases: ['xfs_growfs'],
  },
  {
    id: 'resize2fs', abbr: 'resize2fs', ro: 'comanda care redimensionează un sistem de fișiere ext2/3/4',
    what: 'Mărește (online sau offline) sau micșorează (doar demontat) un ext4; fără argument de dimensiune umple tot dispozitivul.',
    how: 'Argumentul este dispozitivul, nu punctul de montare. Nu schimbă partiția sau LV-ul: acestea se măresc înainte.',
    where: 'După lvextend la un LV ext4: resize2fs /dev/datavg/ext.',
    topics: ['L6.2'], aliases: ['resize2fs'],
  },
  {
    id: 'online-resize', abbr: 'extindere online', ro: 'mărirea unui volum și a sistemului de fișiere fără demontare',
    what: 'Operație prin care LV-ul și sistemul de fișiere cresc în timp ce sunt montate și folosite de aplicații.',
    how: 'lvextend reîncarcă tabela device-mapper fără oprirea dispozitivului; xfs_growfs și resize2fs (ext4) extind structurile sistemului de fișiere din mers.',
    where: 'Alerte de spațiu în producție; scenarii de examen „extend … without unmounting”.',
    topics: ['L6.2'], aliases: ['online', 'resizefs', '-r'],
  },
];
