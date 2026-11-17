import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'firewalld', abbr: 'firewalld', ro: 'serviciul de firewall dinamic de pe RHEL, bazat pe zone și servicii',
    what: 'Decide ce trafic de rețea este permis spre sistem. Se configurează fără a întrerupe conexiunile active și fără a scrie reguli de nivel scăzut.',
    how: 'Daemonul firewalld păstrează două configurații — runtime (activă acum) și permanent (pe disc, /etc/firewalld/) — și traduce zonele și serviciile în reguli nftables.',
    where: 'Orice server RHEL; obiectivele C8-4 și C10-1.',
    topics: ['L8.4'], aliases: ['firewalld.service', '/etc/firewalld'],
  },
  {
    id: 'firewall-cmd', abbr: 'firewall-cmd', ro: 'clientul în linie de comandă pentru firewalld',
    what: 'Afișează zonele și serviciile, adaugă/elimină servicii, porturi, surse, interfețe, reguli bogate; reîncarcă și salvează configurația.',
    how: 'Fără --permanent modifică doar runtime; cu --permanent doar fișierele de pe disc (efect după --reload).',
    where: 'Examen: deschiderea unui serviciu sau port, persistent.',
    topics: ['L8.4'], aliases: ['firewall-cmd --permanent', '--reload'],
  },
  {
    id: 'firewall-zone', abbr: 'zonă firewalld', full: 'firewalld zone', ro: 'un nivel de încredere cu propriul set de reguli, la care sunt legate interfețe sau surse',
    what: 'Zonele predefinite, de la cea mai restrictivă la cea mai permisivă: drop, block, public, external, dmz, work, home, internal, trusted. Pe RHEL, zona implicită este de obicei public.',
    how: 'O interfață sau o sursă aparține unei singure zone; dacă nu este legată explicit, folosește zona implicită. Un pachet este tratat după zona sursei (dacă e legată o sursă), altfel după zona interfeței.',
    where: 'firewall-cmd --get-active-zones, --list-all, --set-default-zone.',
    topics: ['L8.4'], aliases: ['zone', 'default zone', 'zona implicită'],
  },
  {
    id: 'firewall-service', abbr: 'serviciu firewalld', full: 'firewalld service', ro: 'o definiție predefinită (nume → porturi/protocoale) pe care o activezi într-o zonă',
    what: 'În loc de „tcp/22”, deschizi serviciul ssh; firewalld știe porturile. Ex.: ssh, http, https, nfs, dns, ntp, dhcpv6-client.',
    how: 'Definițiile sunt în /usr/lib/firewalld/services/*.xml; --get-services le listează, --info-service=NUME arată porturile.',
    where: 'firewall-cmd --add-service=http --permanent.',
    topics: ['L8.4'], aliases: ['service', 'add-service'],
  },
  {
    id: 'firewall-port', abbr: 'port', full: 'TCP/UDP port', ro: 'numărul (0–65535) care identifică un serviciu pe un host, pe lângă adresa IP',
    what: 'O conexiune este identificată de (adresă sursă, port sursă, adresă destinație, port destinație, protocol). Serviciile standard ascultă pe porturi cunoscute (22 SSH, 80 HTTP, 443 HTTPS).',
    how: 'În firewalld: --add-port=8080/tcp (sau interval 5000-5010/udp); portul trebuie și să aibă un proces care ascultă (ss -tulpn).',
    where: 'Servicii pe porturi neobișnuite; examen.',
    topics: ['L8.4'], aliases: ['tcp port', 'udp port', 'număr de port'],
  },
  {
    id: 'runtime-permanent', abbr: 'runtime vs permanent', ro: 'cele două configurații ale firewalld: cea activă acum și cea salvată pe disc',
    what: 'Runtime: efect imediat, dispare la --reload sau reboot. Permanent: salvat pe disc, devine activ doar după --reload sau reboot.',
    how: 'Variante: rulezi comanda de două ori (fără și cu --permanent), sau o rulezi fără --permanent și apoi --runtime-to-permanent, sau o rulezi cu --permanent și apoi --reload.',
    where: 'Capcana nr. 1 la examen: „merge acum, dispare după reboot”.',
    topics: ['L8.4'], aliases: ['--permanent', '--reload', '--runtime-to-permanent'],
  },
  {
    id: 'rich-rule', abbr: 'rich rule', ro: 'regulă firewalld cu sintaxă extinsă (sursă, destinație, acțiune, log, limită)',
    what: 'Permite condiții pe care zonele simple nu le exprimă, ex. „permite ssh doar de la 192.0.2.0/24” sau „respinge portul 8080 de la o adresă”.',
    how: 'Se adaugă cu --add-rich-rule=\'rule family="ipv4" source address="192.0.2.0/24" service name="ssh" accept\'.',
    where: 'Restricții fine; --list-rich-rules.',
    topics: ['L8.4'], aliases: ['rich language', '--add-rich-rule'],
  },
  {
    id: 'nftables', abbr: 'nftables', ro: 'framework-ul de filtrare a pachetelor din kernel Linux, folosit de firewalld ca backend',
    what: 'Înlocuiește iptables; firewalld generează automat regulile nftables din zone și servicii.',
    how: 'Nu se editează de mână când folosești firewalld; nft list ruleset arată regulile generate.',
    where: 'Diagnoză avansată.',
    topics: ['L8.4'], aliases: ['nft', 'netfilter', 'iptables'],
  },
];
