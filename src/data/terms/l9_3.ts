import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'gid', abbr: 'GID', full: 'Group ID', ro: 'numărul care identifică un grup',
    what: 'Fiecare grup are un GID; fișierele stochează GID-ul grupului proprietar. Grupurile de sistem au GID sub 1000; cele obișnuite de la 1000.',
    how: 'Se alocă la groupadd (primul liber ≥ GID_MIN) sau se cere cu -g. groupmod -g îl schimbă, fără a reproprietăți fișierele.',
    where: 'id, getent group, ls -ln, find -gid.',
    topics: ['L9.3'], aliases: ['group id'],
  },
  {
    id: 'etc-group', abbr: '/etc/group', ro: 'fișierul public cu grupurile locale (patru câmpuri)',
    what: 'Linie: nume:x:GID:membri. Câmpul membri conține doar apartenența suplimentară, nu și utilizatorii care au grupul ca primar.',
    how: 'Modificat de groupadd/groupmod/groupdel/usermod/gpasswd; parolele de grup sunt în /etc/gshadow.',
    where: 'getent group NUME; id NUME pentru lista completă.',
    topics: ['L9.3'], aliases: ['group file', '/etc/gshadow', 'gshadow'],
  },
  {
    id: 'supplementary-group', abbr: 'grup suplimentar', full: 'supplementary group', ro: 'un grup în plus față de cel primar, care acordă drepturi suplimentare',
    what: 'Un utilizator poate fi membru în oricâte grupuri suplimentare (de exemplu wheel pentru sudo).',
    how: 'Apartenența e listată în câmpul 4 din /etc/group. usermod -aG adaugă fără a pierde existente; usermod -G înlocuiește lista.',
    where: 'useradd -G, usermod -aG, gpasswd -a/-d; id arată lista.',
    topics: ['L9.3'], aliases: ['secondary group', 'usermod -aG', 'append'],
  },
  {
    id: 'gpasswd', abbr: 'gpasswd', ro: 'comanda care administrează membrii unui grup',
    what: 'gpasswd -a USER GRUP adaugă; -d scoate; -M setează lista completă; -A numește administratori de grup.',
    how: 'Editează /etc/group și /etc/gshadow. Nu modifică celelalte grupuri ale utilizatorului.',
    where: 'Alternativă la usermod -aG, orientată spre grup.',
    std: 'gpasswd(1)', topics: ['L9.3'], aliases: ['group administrator', 'newgrp'],
  },
];
