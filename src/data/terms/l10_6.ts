import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'port-label', abbr: 'port label SELinux', ro: 'tipul SELinux atribuit unui port de rețea (de exemplu http_port_t pentru 80)',
    what: 'Politica decide la ce porturi se pot atașa (name_bind) serviciile confinate: httpd_t doar pe porturi http_port_t etc. Un port neetichetat corespunzător (unreserved_port_t) este refuzat.',
    how: 'Se listează cu semanage port -l (-C pentru regulile locale) și se adaugă cu semanage port -a -t TIP -p tcp|udp PORT; -m modifică, -d șterge. Regula persistă și are efect imediat, fără restorecon.',
    where: 'Servicii pe port nestandard (Apache pe 8085, sshd pe 2222); apare ca AVC name_bind cu tclass=tcp_socket. Firewall-ul rămâne separat (firewalld).',
    std: 'semanage-port(8)', topics: ['L10.6', 'L10.8'], aliases: ['http_port_t', 'ssh_port_t', 'name_bind', 'semanage port', 'unreserved_port_t'],
  },
];
