import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'lvm', abbr: 'LVM', full: 'Logical Volume Manager', ro: 'strat de abstractizare între discuri și sistemele de fișiere',
    what: 'Îți permite să grupezi mai multe discuri/partiții într-un „rezervor” și să tai din el volume logice care pot fi redimensionate, fără a fi legate de un disc anume.',
    how: 'Trei straturi: volume fizice (PV) → grupuri de volume (VG) → volume logice (LV). Kernelul folosește device-mapper pentru a lega LV-urile de spațiul de pe PV-uri.',
    where: 'Instalarea implicită RHEL pune / pe un LV; administratorii extind volumele fără oprirea serviciilor.',
    topics: ['L5.2', 'L5.3', 'L5.4'], aliases: ['logical volume manager', 'lvm2'],
  },
  {
    id: 'pv', abbr: 'PV', full: 'Physical Volume', ro: 'volum fizic: disc sau partiție inițializat(ă) pentru LVM',
    what: 'Un disc sau o partiție pe care s-a scris un antet LVM. Doar un PV poate fi dat unui grup de volume.',
    how: 'pvcreate scrie antetul (eticheta LVM2 și metadatele) la începutul dispozitivului și îl împarte în extents (PE).',
    where: 'Primul pas când pregătești spațiu nou pentru LVM; pvs și pvdisplay le listează.',
    topics: ['L5.2'], aliases: ['physical volume', 'pvcreate', 'pvs'],
  },
  {
    id: 'vg', abbr: 'VG', full: 'Volume Group', ro: 'grup de volume: rezervor format din unul sau mai multe PV-uri',
    what: 'Adună spațiul mai multor PV-uri într-un singur bazin din care se taie volume logice.',
    how: 'Un VG împarte spațiul în extents de dimensiune fixă (implicit 4 MiB); LV-urile sunt alcătuite din extents.',
    where: 'Extinderea spațiului: adaugi un PV nou la VG cu vgextend.',
    topics: ['L5.3'], aliases: ['volume group', 'vgcreate'],
  },
  {
    id: 'lv', abbr: 'LV', full: 'Logical Volume', ro: 'volum logic: „partiția flexibilă” pe care pui sistemul de fișiere',
    what: 'Un block device creat din spațiul unui VG, vizibil ca /dev/NUME_VG/NUME_LV; se poate formata, monta, extinde.',
    how: 'Kernelul (device-mapper) transformă fiecare cerere către LV în cereri către extents de pe PV-uri.',
    where: 'Aici ajung datele: /, /home, /var sunt de regulă LV-uri.',
    topics: ['L5.4'], aliases: ['logical volume', 'lvcreate'],
  },
  {
    id: 'extent', abbr: 'PE / LE (extent)', full: 'Physical / Logical Extent', ro: 'unitatea minimă de alocare LVM (implicit 4 MiB)',
    what: 'PE = bucata fixă în care se împarte un PV; LE = bucata corespunzătoare dintr-un LV. Un LV are dimensiunea unui număr întreg de extents.',
    how: 'Dimensiunea se alege la crearea VG (vgcreate -s). Dimensiunile LV se rotunjesc la multiplu de extent.',
    where: 'lvcreate -l folosește extents; vgdisplay arată „PE Size”, „Total PE”, „Free PE”.',
    topics: ['L5.2', 'L5.3', 'L5.4'], aliases: ['physical extent', 'PE'],
  },
  {
    id: 'device-mapper', abbr: 'device-mapper', ro: 'componenta kernelului care leagă un dispozitiv virtual de dispozitive reale',
    what: 'Creează dispozitive „mapate” (/dev/mapper/vg-lv) care se comportă ca un disc normal, dar sunt asamblate din bucăți de alte dispozitive.',
    how: 'LVM, criptarea și multipath folosesc device-mapper; legătura simbolică /dev/VG/LV și /dev/mapper/VG-LV arată același dispozitiv.',
    where: 'Numele din /dev/mapper și lsblk.',
    topics: ['L5.2', 'L5.4'], aliases: ['dm', '/dev/mapper'],
  },
];
