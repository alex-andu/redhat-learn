import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'hostname', abbr: 'hostname', ro: 'numele unui sistem în rețea',
    what: 'Identifică sistemul pentru oameni și pentru aplicații (prompt, loguri, certificate, Kerberos). Există trei tipuri: static, transient, pretty.',
    how: 'Hostname-ul static este scris în /etc/hostname și folosit la boot; cel transient e cel curent din kernel (poate veni de la DHCP). Se schimbă cu hostnamectl.',
    where: 'hostnamectl, hostname, /etc/hostname, promptul shell-ului.',
    topics: ['L8.3'], aliases: ['/etc/hostname', 'static hostname', 'transient hostname', 'nume de host'],
  },
  {
    id: 'fqdn', abbr: 'FQDN', full: 'Fully Qualified Domain Name', ro: 'numele complet al unui host, inclusiv domeniul (server1.example.com)',
    what: 'Prima etichetă (server1) este hostname-ul scurt; restul (example.com) este domeniul. FQDN-ul este unic în DNS.',
    how: 'Se scrie cu puncte; fiecare etichetă are cel mult 63 de caractere, iar numele întreg cel mult 253 (RFC 1035; în hostnamectl maximum 64 pentru nume). Se poate seta ca hostname static.',
    where: 'hostnamectl hostname server1.example.com; /etc/hosts; certificate TLS.',
    std: 'RFC 1035', topics: ['L8.3'], aliases: ['nume complet', 'domain name'],
  },
  {
    id: 'hostnamectl', abbr: 'hostnamectl', ro: 'utilitarul systemd pentru afișarea și schimbarea hostname-ului',
    what: 'hostnamectl arată hostname-urile (static, transient, pretty), ID-ul mașinii, kernelul; poate schimba numele permanent și imediat.',
    how: 'Comunică cu systemd-hostnamed și scrie /etc/hostname. Opțiunile --static, --transient, --pretty aleg tipul de nume.',
    where: 'Examen: „set the hostname to …”.',
    topics: ['L8.3'], aliases: ['set-hostname', 'hostnamectl hostname', 'hostnamectl status'],
  },
  {
    id: 'dns', abbr: 'DNS', full: 'Domain Name System', ro: 'sistemul care transformă nume (server1.example.com) în adrese IP și invers',
    what: 'Este o bază de date distribuită și ierarhică; un resolver întreabă un server DNS (nameserver), care răspunde direct sau întreabă mai departe.',
    how: 'Tipuri de înregistrări uzuale: A (IPv4), AAAA (IPv6), PTR (invers), CNAME (alias), MX (poștă). Clientul trimite cereri UDP/TCP pe portul 53.',
    where: 'Orice aplicație care folosește nume; configurat prin NetworkManager (ipv4.dns) care scrie /etc/resolv.conf.',
    std: 'RFC 1034, RFC 1035', topics: ['L8.3'], aliases: ['nameserver', 'name server', 'rezoluția numelor', 'name resolution'],
  },
  {
    id: 'resolv-conf', abbr: '/etc/resolv.conf', ro: 'fișierul în care resolverul citește serverele DNS (nameserver) și domeniile de căutare (search)',
    what: 'Conține până la 3 linii nameserver (interogate în ordine) și o linie search care completează nume scurte. Pe RHEL este generat de NetworkManager.',
    how: 'O editare manuală este suprascrisă la următoarea modificare de rețea; setarea durabilă se face în profil: nmcli connection modify ID ipv4.dns … ipv4.dns-search …',
    where: 'Depanare DNS; cat /etc/resolv.conf.',
    topics: ['L8.3'], aliases: ['resolv.conf', 'nameserver', 'search domain', 'dns-search'],
  },
  {
    id: 'etc-hosts', abbr: '/etc/hosts', ro: 'tabelul local de nume → adrese, consultat înaintea DNS-ului',
    what: 'Fiecare linie: adresa IP, numele canonic și alias-uri opționale. Permite rezolvarea fără server DNS (la boot, rețele mici, teste).',
    how: 'Se editează direct, ca root; efectul e imediat (fără restart). Se citește prin NSS dacă linia hosts din nsswitch.conf conține files.',
    where: 'getent hosts nume; ping nume; examen: „make host X resolve to IP Y”.',
    topics: ['L8.3'], aliases: ['hosts file', 'fișierul hosts'],
  },
  {
    id: 'nsswitch', abbr: 'nsswitch.conf', full: 'Name Service Switch', ro: 'configurația care stabilește ce surse și în ce ordine consultă sistemul pentru nume, utilizatori, grupuri',
    what: 'Linia hosts: files dns (exemplu) înseamnă: întâi /etc/hosts, apoi DNS. Prima sursă care răspunde decide rezultatul.',
    how: 'Biblioteca C (glibc) citește /etc/nsswitch.conf; unelte ca getent, ping, ssh, curl respectă ordinea, dar dig/host/nslookup interoghează doar DNS.',
    where: 'Diagnoza „ping merge, dig nu” (sau invers).',
    topics: ['L8.3'], aliases: ['NSS', '/etc/nsswitch.conf'],
  },
  {
    id: 'getent', abbr: 'getent', ro: 'comanda care interoghează bazele NSS (hosts, passwd, group) exact ca aplicațiile',
    what: 'getent hosts nume arată adresa pe care o vor folosi programele, după regulile din nsswitch.conf (files, dns).',
    how: 'Nu ocolește /etc/hosts, spre deosebire de dig. Cod de ieșire 2 = nu a găsit.',
    where: 'Testul corect pentru „se rezolvă numele?”.',
    topics: ['L8.3'], aliases: ['getent hosts'],
  },
];
