import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'nfs', abbr: 'NFS', full: 'Network File System', ro: 'sistem de fișiere montat prin rețea de pe un alt calculator',
    what: 'Protocol prin care un client montează un director exportat de un server și îl folosește ca pe unul local; permisiunile Unix se păstrează.',
    how: 'Clientul trimite cereri prin rețea (RPC, de obicei TCP; NFSv4 pe portul 2049); mount -t nfs server:/export /mnt; clientul încearcă implicit versiunea 4.2 și coboară la ce suportă serverul.',
    where: 'Directoare home centralizate, directoare comune între servere; la examen: montare client, persistentă, cu _netdev.',
    std: 'RFC 7530 (NFSv4), RFC 7862 (NFSv4.2)', topics: ['L6.3', 'L6.4'], aliases: ['nfs4', 'nfs-utils', 'showmount', 'nfs-client'],
  },
  {
    id: 'nfs-export', abbr: 'export NFS', ro: 'director partajat de un server NFS, cu reguli de acces',
    what: 'O cale de pe server declarată în /etc/exports împreună cu clienții permiși și opțiunile (rw/ro, root_squash, sec=).',
    how: 'Linii de forma cale client(opțiuni); modificările se aplică cu exportfs -ra; clientul vede exporturile cu showmount -e (NFSv3).',
    where: '/exports/data 192.0.2.0/24(rw,sync); clientul montează cu exact calea exportată.',
    topics: ['L6.3'], aliases: ['/etc/exports', 'exportfs', 'export'],
  },
  {
    id: 'root-squash', abbr: 'root_squash', ro: 'maparea lui root de pe client la un utilizator fără privilegii',
    what: 'Opțiune implicită de export prin care UID 0 al clientului este tratat de server ca utilizatorul anonim (nobody).',
    how: 'Serverul înlocuiește UID/GID 0 din cerere cu cel anonim; no_root_squash o dezactivează; all_squash mapează toți utilizatorii.',
    where: 'De aceea sudo touch pe un montaj NFS poate da Permission denied; remedierea este pe server (permisiuni/UID).',
    topics: ['L6.3', 'L6.5'], aliases: ['no_root_squash', 'all_squash', 'squash'],
  },
  {
    id: 'hard-mount', abbr: 'hard / soft', ro: 'ce face clientul NFS când serverul nu răspunde',
    what: 'hard (implicit): cererile se reîncearcă la nesfârșit, procesul așteaptă; soft: după retrans retransmisii eșuează cu eroare de I/O.',
    how: 'timeo și retrans controlează temporizarea; soft poate cauza coruperea silențioasă a datelor în anumite cazuri (nfs(5)).',
    where: 'Pentru date importante se păstrează hard; soft doar pentru citire neimportantă.',
    topics: ['L6.3'], aliases: ['hard', 'soft', 'timeo', 'retrans'],
  },
  {
    id: 'netdev', abbr: '_netdev', ro: 'opțiune fstab: sistemul de fișiere are nevoie de rețea',
    what: 'Marchează o montare ca dependentă de rețea, ca sistemul să aștepte rețeaua înainte să o încerce.',
    how: 'Opțiune generică din mount(8); systemd ordonează unitatea .mount după network-online. Util la NFS și la discuri iSCSI.',
    where: 'server:/export /mnt/nfs nfs defaults,_netdev 0 0.',
    topics: ['L6.3', 'L6.4'], aliases: ['_netdev', 'network-online'],
  },
];
