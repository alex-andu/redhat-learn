import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'networkmanager', abbr: 'NetworkManager', ro: 'serviciul care gestionează conexiunile de rețea pe RHEL',
    what: 'Detectează interfețele, aplică profilurile de conexiune (adrese, gateway, DNS), le pornește la boot și reacționează la schimbări (cablu conectat, DHCP reînnoit).',
    how: 'Rulează ca serviciul NetworkManager.service; configurația persistentă sunt profilurile (fișiere keyfile .nmconnection în /etc/NetworkManager/system-connections/). Se controlează cu nmcli, nmtui sau Cockpit.',
    where: 'Orice sistem RHEL; obiectivul C8-1 se rezolvă cu nmcli.',
    topics: ['L8.2', 'L8.3'], aliases: ['NM', 'NetworkManager.service'],
  },
  {
    id: 'nmcli', abbr: 'nmcli', ro: 'clientul în linie de comandă pentru NetworkManager',
    what: 'Creează, modifică, activează și șterge conexiuni; arată starea dispozitivelor; setează hostname-ul (nmcli general hostname).',
    how: 'Are obiecte (connection, device, general, networking) și acțiuni (show, add, modify, up, down, delete). Proprietățile au forma setare.proprietate, ex. ipv4.addresses.',
    where: 'Configurarea rețelei la examen; scripturi de provizionare.',
    topics: ['L8.2', 'L8.3'], aliases: ['nmcli connection', 'nmcli device', 'nmcli con'],
  },
  {
    id: 'nm-connection', abbr: 'profil de conexiune', full: 'NetworkManager connection profile', ro: 'un set salvat de setări de rețea (nume, interfață, adrese, DNS, autoconnect)',
    what: 'Separă „ce vreau” (profilul) de „pe ce” (dispozitivul). Același dispozitiv poate avea mai multe profiluri, dar doar unul activ.',
    how: 'Se identifică prin nume (ID) sau UUID. connection.interface-name leagă profilul de o interfață; connection.autoconnect decide dacă se activează automat la boot.',
    where: 'nmcli connection show; /etc/NetworkManager/system-connections/.',
    topics: ['L8.2'], aliases: ['connection', 'conexiune', 'profil NM', 'connection profile'],
  },
  {
    id: 'nm-device', abbr: 'dispozitiv NM', full: 'NetworkManager device', ro: 'interfața de rețea văzută de NetworkManager, cu stare (connected, disconnected, unmanaged)',
    what: 'Reprezintă hardware-ul sau interfața virtuală. Un dispozitiv „connected” are un profil activ.',
    how: 'nmcli device status listează dispozitivele, tipul, starea și profilul activ; un dispozitiv „unmanaged” este ignorat de NetworkManager.',
    where: 'nmcli device status / show.',
    topics: ['L8.2'], aliases: ['device', 'dispozitiv'],
  },
  {
    id: 'ipv4-method', abbr: 'ipv4.method', ro: 'proprietatea care alege cum primește profilul adrese IPv4: auto, manual, disabled, link-local, shared',
    what: 'auto = DHCP; manual = adrese statice puse de tine (cere cel puțin o adresă); disabled = fără IPv4; link-local = 169.254.x.y; shared = NM face DHCP+NAT pentru alții.',
    how: 'Există ipv6.method cu valori similare plus ignore și dhcp (auto = SLAAC). Dacă treci pe manual, trebuie să setezi și adresele (și de regulă gateway și DNS).',
    where: 'nmcli connection modify ID ipv4.method manual; verificare cu nmcli -f ipv4.method connection show ID.',
    topics: ['L8.2'], aliases: ['ipv6.method', 'method'],
  },
  {
    id: 'dhcp', abbr: 'DHCP', full: 'Dynamic Host Configuration Protocol', ro: 'protocolul prin care un server atribuie automat adresă, gateway și DNS unui client',
    what: 'Clientul cere configurația și primește pentru un timp limitat (lease) adresa, masca, gateway-ul și serverele DNS.',
    how: 'NetworkManager are un client DHCP integrat. DHCPv6 completează SLAAC în IPv6 (adrese și opțiuni, dacă routerul o cere).',
    where: 'Profiluri cu ipv4.method auto; la examen, des se cere trecerea de pe DHCP pe static.',
    std: 'RFC 2131, RFC 8415', topics: ['L8.2'], aliases: ['lease'],
  },
  {
    id: 'nm-keyfile', abbr: 'keyfile', ro: 'formatul text .ini în care NetworkManager păstrează profilurile (fișiere .nmconnection)',
    what: 'Un fișier per profil, în /etc/NetworkManager/system-connections/, cu secțiuni [connection], [ipv4], [ipv6]; permisiuni 0600, proprietar root.',
    how: 'Nu se editează de obicei de mână: nmcli le scrie. După o editare manuală, trebuie nmcli connection reload. (Pe RHEL 10 este formatul implicit; fișierele ifcfg nu mai sunt folosite — de confirmat.)',
    where: 'Depanare, backup, inspecție a unui profil.',
    topics: ['L8.2'], aliases: ['.nmconnection', 'system-connections', 'ifcfg'],
  },
];
