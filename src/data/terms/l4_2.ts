import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'systemd-unit', abbr: 'unit (unitate systemd)', ro: 'orice resursă gestionată de systemd: serviciu, target, montare, timer…',
    what: 'Un fișier descriptiv (de exemplu sshd.service, multi-user.target, home.mount) care îi spune lui systemd ce să pornească, de ce depinde și cum.',
    how: 'Tipul se vede din extensie: .service, .target, .mount, .socket, .timer. Fișierele furnizate de pachete sunt în /usr/lib/systemd/system; modificările tale în /etc/systemd/system, care are prioritate.',
    where: 'systemctl lucrează întotdeauna cu unități: pornești o unitate, o activezi, îi vezi starea.',
    topics: ['L4.2', 'L4.9'], aliases: ['unit'],
  },
  {
    id: 'systemd-target', abbr: 'target', ro: 'o unitate care grupează alte unități și definește o stare a sistemului',
    what: 'Un target este un „punct de sosire” al boot-ului: multi-user.target = sistem text cu rețea și servicii; graphical.target = același, plus interfață grafică; rescue.target și emergency.target = moduri de recuperare.',
    how: 'Un target nu face nimic singur; are dependențe (Wants/Requires) către alte unități pe care systemd le pornește când target-ul este atins. Înlocuiește vechile „runlevel-uri”.',
    where: 'Alegi în ce stare pornește serverul (set-default), treci temporar într-o altă stare (isolate) sau pornești într-un mod de recuperare.',
    topics: ['L4.2', 'L4.3'], aliases: ['targets'],
  },
  {
    id: 'default-target', abbr: 'default.target', ro: 'target-ul în care pornește sistemul în mod normal',
    what: 'Legătură simbolică către target-ul implicit: de obicei multi-user.target pe servere și graphical.target pe stații de lucru.',
    how: 'Se află la /etc/systemd/system/default.target. systemctl get-default o citește; systemctl set-default o modifică. Persistă la reboot.',
    where: 'Setarea standard pentru „sistemul trebuie să pornească în mod text / grafic”.',
    topics: ['L4.2'],
  },
  {
    id: 'rescue-target', abbr: 'rescue.target / emergency.target', ro: 'target-uri de recuperare cu shell de root',
    what: 'rescue.target pornește sistemul de bază (sisteme de fișiere montate, puține servicii) și îți dă un shell de root. emergency.target este și mai minimal: aproape nimic nu e pornit, iar rădăcina poate fi doar pentru citire.',
    how: 'Se pot atinge cu systemctl rescue, systemctl emergency sau, la boot, cu systemd.unit=rescue.target pe linia kernelului. Cer parola de root.',
    where: 'Repararea /etc/fstab greșit, a unui serviciu care blochează boot-ul, a sistemelor de fișiere.',
    topics: ['L4.2', 'L4.3'], aliases: ['rescue mode', 'emergency mode'],
  },
];
