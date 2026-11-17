import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'autofs', abbr: 'autofs', ro: 'serviciul care montează sisteme de fișiere la cerere și le demontează după inactivitate',
    what: 'Daemon (automount) care ține „capcane” în kernel la directoare configurate; la primul acces montează sursa indicată în hartă, iar după timeout o demontează.',
    how: 'Master map (/etc/auto.master, /etc/auto.master.d/*.autofs) leagă directoare de hărți; hărțile (indirecte, directe, wildcard) leagă chei de surse NFS/locale. Serviciul se activează cu systemctl enable --now autofs.',
    where: 'Directoare home pe NFS, exporturi rar folosite, servere care pot lipsi fără să blocheze boot-ul.',
    topics: ['L6.4'], aliases: ['automount', 'auto.master', 'autofs.service'],
  },
  {
    id: 'auto-master', abbr: 'master map', ro: 'harta principală autofs: ce directoare gestionează și cu ce hărți',
    what: 'Fișier (/etc/auto.master sau /etc/auto.master.d/*.autofs) cu linii punct-de-montare, hartă, opțiuni; /- marchează o hartă directă.',
    how: 'Format: mount-point [map-type:]map [options] (auto.master(5)). Fișierele din auto.master.d trebuie să se termine în .autofs, altfel sunt ignorate.',
    where: '/shares /etc/auto.shares --timeout=60',
    topics: ['L6.4'], aliases: ['auto.master', 'auto.master.d', 'harta principală'],
  },
  {
    id: 'indirect-map', abbr: 'hartă indirectă', ro: 'hartă autofs ale cărei chei sunt subdirectoare ale unui director din master',
    what: 'Fiecare cheie devine un subdirector sub punctul de montare din master; locația spune de unde se montează.',
    how: 'Format linie: cheie [-opțiuni] locație; modificările se citesc la accesul următor. Wildcard: cheia * cu & înlocuit de cheia cerută.',
    where: '/shares + auto.shares: data -rw,sync server:/exports/data → /shares/data.',
    topics: ['L6.4'], aliases: ['wildcard', 'hartă indirectă'],
  },
  {
    id: 'direct-map', abbr: 'hartă directă', ro: 'hartă autofs ale cărei chei sunt căi absolute',
    what: 'Master map-ul o referă cu punctul special /-; fiecare cheie este calea completă unde se montează.',
    how: 'Linie în hartă: /mnt/backup -rw,sync server:/exports/backup; modificările cer reîncărcarea daemonului (HUP, restart).',
    where: 'Montări la căi „oficiale” (/mnt/backup) la cerere.',
    topics: ['L6.4'], aliases: ['/-', 'hartă directă'],
  },
  {
    id: 'autofs-timeout', abbr: 'timeout autofs', ro: 'cât timp de inactivitate așteaptă autofs înainte să demonteze',
    what: 'Perioada după care o montare neutilizată este demontată automat; 0 dezactivează demontarea.',
    how: 'Opțiunea --timeout/-t (secunde) în master map sau global; valoarea internă implicită este 10 minute, iar configurația instalată o suprascrie la 5 (automount(8)).',
    where: '/shares /etc/auto.shares --timeout=60.',
    topics: ['L6.4'], aliases: ['--timeout', 'browse'],
  },
];
