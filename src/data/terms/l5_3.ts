import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'vgextend', abbr: 'vgextend', ro: 'adaugă un PV nou într-un grup de volume existent',
    what: 'Mărește spațiul liber al unui VG fără să atingă LV-urile existente; este primul pas când un VG se umple.',
    how: 'Scrie în metadatele VG noul PV și extents-urile lui devin disponibile pentru alocare.',
    where: 'Extinderea online a spațiului: vgextend datavg /dev/vdc1, apoi lvextend (L5.4).',
    topics: ['L5.3'], aliases: ['vgreduce'],
  },
  {
    id: 'vg-free', abbr: 'VFree / Free PE', ro: 'spațiul din VG care nu este alocat niciunui LV',
    what: 'Cantitatea de extents pe care o poți încă aloca pentru LV-uri noi sau extinderea celor existente.',
    how: 'VFree = Total PE − PE alocate; vgs și vgdisplay îl afișează.',
    where: 'Înainte de lvcreate/lvextend verifici cât spațiu liber are VG-ul.',
    topics: ['L5.3', 'L5.4'], aliases: ['VFree', 'Free PE'],
  },
];
