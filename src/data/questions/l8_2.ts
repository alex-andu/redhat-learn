import type { Question } from '../../lib/types';

const T = 'L8.2';
const O = ['C8-1'];

export const Q_L8_2: Question[] = [
  {
    id: 'L8.2-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este instrumentul în linie de comandă pentru configurarea rețelei prin [[networkmanager]] pe RHEL?',
    explanation: '`nmcli` este clientul CLI pentru NetworkManager.',
    options: [
      { id: 'a', text: '`nmcli`', correct: true, why: 'Gestionează conexiunile, dispozitivele și profilurile NetworkManager.' },
      { id: 'b', text: '`ifconfig`', correct: false, why: 'Unealtă veche; modificările ei nu sunt persistente și nu mai e metoda recomandată.' },
      { id: 'c', text: '`firewall-cmd`', correct: false, why: 'Configurează firewall-ul (L8.4), nu adresele.' },
      { id: 'd', text: '`hostnamectl`', correct: false, why: 'Gestionează hostname-ul (L8.3).' },
    ],
  },
  {
    id: 'L8.2-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre un dispozitiv (device) și un profil (connection) în NetworkManager?',
    explanation: 'Dispozitivul este interfața; profilul este setul de setări salvate care se aplică pe ea.',
    options: [
      { id: 'a', text: 'Dispozitivul este interfața; profilul este setul salvat de setări (adrese, DNS, autoconnect) aplicat pe ea.', correct: true, why: 'Un dispozitiv poate avea mai multe profiluri, dar doar unul activ.' },
      { id: 'b', text: 'Sunt sinonime.', correct: false, why: 'nmcli device și nmcli connection sunt obiecte distincte.' },
      { id: 'c', text: 'Profilul este hardware-ul; dispozitivul este fișierul de configurare.', correct: false, why: 'Invers: dispozitivul este hardware-ul/interfața, profilul este configurația.' },
      { id: 'd', text: 'Dispozitivul există doar pentru Wi-Fi.', correct: false, why: 'Orice interfață (Ethernet, loopback, bridge) este un dispozitiv.' },
    ],
  },
  {
    id: 'L8.2-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează profilurile de conexiune salvate (nu doar cele active).',
    prompt: '[student@server1 ~]$',
    answers: ['nmcli connection show', 'nmcli con show', 'nmcli c show', 'nmcli connection', 'nmcli c'],
    canonical: 'nmcli connection show',
    explanation: '`nmcli connection show` listează toate profilurile; `--active` le filtrează pe cele active.',
    wrong: [
      { text: 'nmcli device status', why: 'Listează dispozitivele și profilul activ, nu toate profilurile salvate.' },
      { text: 'nmcli connection up', why: 'Activează un profil; nu listează.' },
      { text: 'ip addr show', why: 'Arată adresele interfețelor, nu profilurile NetworkManager.' },
    ],
  },
  {
    id: 'L8.2-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai rulat `nmcli connection modify lab-static ipv4.addresses 192.0.2.60/24`. `ip -br addr` arată încă adresa veche. Ce lipsește?',
    explanation: '`modify` schimbă profilul, nu și interfața activă; trebuie `connection up` (sau reapply).',
    options: [
      { id: 'a', text: '`nmcli connection up lab-static`', correct: true, why: 'Aplică profilul modificat pe interfață.' },
      { id: 'b', text: '`systemctl restart firewalld`', correct: false, why: 'Firewall-ul nu aplică adresele.' },
      { id: 'c', text: 'Nimic: ip -br addr nu actualizează niciodată.', correct: false, why: 'ip afișează starea reală; ea se schimbă după aplicare.' },
      { id: 'd', text: '`nmcli connection delete lab-static`', correct: false, why: 'Ar șterge profilul.' },
    ],
  },
  {
    id: 'L8.2-005', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care proprietăți trebuie setate pentru un profil IPv4 static complet (adresă, ieșire spre alte rețele, nume)?',
    explanation: 'Metoda manual, adresa cu prefix, gateway-ul și DNS-ul.',
    options: [
      { id: 'a', text: '`ipv4.method manual`', correct: true, why: 'Fără ea profilul rămâne pe DHCP (auto).' },
      { id: 'b', text: '`ipv4.addresses 192.0.2.10/24`', correct: true, why: 'Adresa cu prefix; method manual cere cel puțin o adresă.' },
      { id: 'c', text: '`ipv4.gateway 192.0.2.1`', correct: true, why: 'Ruta default; în aceeași subrețea cu adresa.' },
      { id: 'd', text: '`ipv4.dns 192.0.2.53`', correct: true, why: 'Serverul DNS pentru rezolvarea numelor.' },
      { id: 'e', text: '`ipv4.never-default yes`', correct: false, why: 'Ar interzice profilului să obțină ruta default, deci ar bloca gateway-ul.' },
    ],
  },
  {
    id: 'L8.2-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Profilul are DNS `192.0.2.53`. Vrei să adaugi `198.51.100.53` fără să pierzi primul. Ce comandă?',
    explanation: '`+` înaintea proprietății adaugă la listă; fără el înlocuiești.',
    options: [
      { id: 'a', text: '`nmcli connection modify lab-static +ipv4.dns 198.51.100.53`', correct: true, why: 'Prefixul + adaugă la lista existentă.' },
      { id: 'b', text: '`nmcli connection modify lab-static ipv4.dns 198.51.100.53`', correct: false, why: 'Înlocuiește toată lista; ai pierde 192.0.2.53.' },
      { id: 'c', text: '`nmcli connection modify lab-static -ipv4.dns 198.51.100.53`', correct: false, why: '− elimină un element, nu adaugă.' },
      { id: 'd', text: '`echo nameserver 198.51.100.53 >> /etc/resolv.conf`', correct: false, why: 'Fișierul este generat de NetworkManager și se suprascrie; setarea durabilă se face în profil.' },
    ],
  },
  {
    id: 'L8.2-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată output-ul de mai jos despre profilul `lab-static`?',
    explanation: '`ipv4.method auto` = DHCP, chiar dacă există o adresă setată.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'nmcli -g …', code: '[student@server1 ~]$ nmcli -g ipv4.method,ipv4.addresses,ipv4.gateway connection show lab-static\nauto\n192.0.2.10/24\n192.0.2.1' },
    options: [
      { id: 'a', text: 'Metoda este auto (DHCP): adresa statică din profil nu este cea folosită ca static; trebuie ipv4.method manual.', correct: true, why: 'Pentru adrese statice metoda trebuie să fie manual.' },
      { id: 'b', text: 'Profilul este complet static și corect.', correct: false, why: 'Prima linie este metoda: auto, nu manual.' },
      { id: 'c', text: 'Profilul este dezactivat.', correct: false, why: 'Output-ul nu arată starea de activare.' },
      { id: 'd', text: 'Gateway-ul este greșit.', correct: false, why: '192.0.2.1 este în subrețeaua 192.0.2.0/24; problema este metoda.' },
    ],
  },
  {
    id: 'L8.2-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Colegul tău a scris comanda de mai jos pentru o adresă statică. Care este greșeala principală?',
    explanation: 'Gateway-ul trebuie să fie în aceeași subrețea cu adresa; aici nu este.',
    snippet: { kind: 'find-error', title: 'comanda colegului', code: 'sudo nmcli connection modify lab-static ipv4.method manual \\\n  ipv4.addresses 192.0.2.10/24 ipv4.gateway 192.0.3.1' },
    options: [
      { id: 'a', text: 'Gateway-ul 192.0.3.1 nu este în 192.0.2.0/24.', correct: true, why: 'Un host poate folosi ca gateway doar o adresă din propria subrețea.' },
      { id: 'b', text: 'Lipsește prefixul din adresă.', correct: false, why: 'Prefixul /24 este prezent.' },
      { id: 'c', text: 'ipv4.method manual nu există.', correct: false, why: 'manual este o valoare validă.' },
      { id: 'd', text: 'Comanda nu are nevoie de sudo.', correct: false, why: 'Pentru profiluri de sistem este nevoie de privilegii (sudo) sau polkit.' },
    ],
  },
  {
    id: 'L8.2-009', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Aplică profilul `lab-static` pe interfață, după ce l-ai modificat.',
    prompt: '[root@server1 ~]#',
    answers: ['nmcli connection up lab-static', 'nmcli con up lab-static', 'nmcli c up lab-static', 'sudo nmcli connection up lab-static', 'nmcli connection up id lab-static'],
    canonical: 'nmcli connection up lab-static',
    explanation: '`nmcli connection up NUME` activează (reaplică) profilul.',
    wrong: [
      { text: 'nmcli connection reload', why: 'Reîncarcă fișierele de pe disc; nu activează profilul.' },
      { text: 'nmcli connection modify lab-static up', why: 'Sintaxă invalidă: „up” nu este o proprietate.' },
      { text: 'systemctl restart network', why: 'Pe RHEL modern serviciul se numește NetworkManager și nu se repornește pentru a aplica un profil.' },
    ],
  },
  {
    id: 'L8.2-010', topicId: T, objectives: O, difficulty: 3, type: 'multi',
    stem: 'Care dintre aceste modificări NU persistă după reboot?',
    explanation: 'Doar profilul salvat persistă; modificările directe sau temporare nu.',
    options: [
      { id: 'a', text: '`ip addr add 192.0.2.77/24 dev enp7s0`', correct: true, why: 'Modifică doar starea kernelului.' },
      { id: 'b', text: '`nmcli connection modify --temporary lab-static ipv4.dns 192.0.2.99`', correct: true, why: '--temporary nu scrie în profilul de pe disc.' },
      { id: 'c', text: '`nmcli connection modify lab-static ipv4.dns 192.0.2.99`', correct: false, why: 'Se scrie în profilul de pe disc; persistă (după aplicare).' },
      { id: 'd', text: '`nmcli connection add type ethernet con-name x ifname enp7s0 ipv4.method manual ipv4.addresses 192.0.2.78/24`', correct: false, why: 'Se creează un profil salvat (save yes este implicit).' },
    ],
  },
  {
    id: 'L8.2-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a trece un profil existent de la DHCP la IPv4 static, persistent.',
    explanation: 'Inventar, modify (cu method manual și valorile), up, verificare, persistență.',
    items: [
      { text: '`nmcli device status` și `nmcli connection show` — identifici interfața și profilul', why: 'Afli numele exact al profilului și al interfeței.' },
      { text: '`nmcli connection modify "NUME" ipv4.method manual ipv4.addresses A/P ipv4.gateway G ipv4.dns D`', why: 'Scrii configurația în profil, persistent.' },
      { text: '`nmcli connection up "NUME"`', why: 'Aplici profilul modificat pe interfață.' },
      { text: '`ip -br addr`, `ip route`, `cat /etc/resolv.conf` — verifici starea reală', why: 'Confirmi adresa, gateway-ul și DNS-ul.' },
      { text: '`nmcli -g connection.autoconnect connection show "NUME"` (yes) — confirmi persistența', why: 'Profilul se reactivează la boot.' },
    ],
  },
  {
    id: 'L8.2-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește proprietatea nmcli cu rolul ei.',
    explanation: 'Fiecare proprietate controlează un aspect distinct al configurației IP.',
    leftLabel: 'Proprietate', rightLabel: 'Rol',
    pairs: [
      { left: '`ipv4.method`', right: 'cum primește profilul adresele (auto, manual, disabled …)', why: 'manual = static; auto = DHCP.' },
      { left: '`ipv6.addresses`', right: 'adresele IPv6 cu prefix, ex. 2001:db8:100::50/64', why: 'Listă de adrese IPv6.' },
      { left: '`connection.autoconnect`', right: 'dacă profilul se activează automat la boot', why: 'Implicit yes.' },
      { left: '`ipv4.ignore-auto-dns`', right: 'ignoră DNS-ul primit prin DHCP când metoda este auto', why: 'Păstrează doar ipv4.dns setat manual.' },
    ],
    distractors: [{ text: 'deschide un port în firewall', why: 'Aceasta este treaba lui firewall-cmd (L8.4).' }],
  },
];
