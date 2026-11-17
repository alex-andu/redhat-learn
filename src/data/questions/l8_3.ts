import type { Question } from '../../lib/types';

const T = 'L8.3';
const O = ['C8-2'];

export const Q_L8_3: Question[] = [
  {
    id: 'L8.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce fișier conține hostname-ul static al sistemului?',
    explanation: 'Hostname-ul static este scris în `/etc/hostname` și citit la boot.',
    options: [
      { id: 'a', text: '`/etc/hostname`', correct: true, why: 'O singură linie cu numele static; scris de hostnamectl.' },
      { id: 'b', text: '`/etc/hosts`', correct: false, why: 'Tabel de nume → adrese, nu numele propriu.' },
      { id: 'c', text: '`/etc/resolv.conf`', correct: false, why: 'Conține serverele DNS și domeniile de căutare.' },
      { id: 'd', text: '`/etc/nsswitch.conf`', correct: false, why: 'Stabilește ordinea surselor de rezolvare.' },
    ],
  },
  {
    id: 'L8.3-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre `/etc/hosts` și [[dns]]?',
    explanation: '/etc/hosts este un tabel local scris de mână; DNS este un serviciu interogat prin rețea.',
    options: [
      { id: 'a', text: '/etc/hosts este un fișier local de nume → adrese; DNS este un serviciu de rețea consultat de resolver.', correct: true, why: 'Ordinea consultării este stabilită în nsswitch.conf (de obicei files înaintea lui dns).' },
      { id: 'b', text: 'Sunt același lucru.', correct: false, why: 'Sunt surse diferite, cu locații și administrare diferite.' },
      { id: 'c', text: 'DNS este un fișier, /etc/hosts un server.', correct: false, why: 'Este exact invers: /etc/hosts este fișierul, DNS este serviciul.' },
      { id: 'd', text: '/etc/hosts se folosește doar pentru IPv6.', correct: false, why: 'Funcționează pentru IPv4 și IPv6.' },
    ],
  },
  {
    id: 'L8.3-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează adresa pe care o vor folosi aplicațiile pentru numele `nfs1` (după /etc/hosts și DNS).',
    prompt: '[student@server1 ~]$',
    answers: ['getent hosts nfs1'],
    canonical: 'getent hosts nfs1',
    explanation: '`getent hosts` interoghează baza „hosts” prin NSS, ca aplicațiile.',
    wrong: [
      { text: 'dig nfs1', why: 'dig interoghează doar DNS și ocolește /etc/hosts.' },
      { text: 'hostname nfs1', why: 'Aceasta ar încerca să SCHIMBE hostname-ul, nu să rezolve un nume.' },
      { text: 'cat /etc/resolv.conf', why: 'Afișează serverele DNS, nu rezolvă un nume.' },
    ],
  },
  {
    id: 'L8.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cerința: „setează hostname-ul la `server1.example.com`, persistent”. Care variantă este corectă?',
    explanation: '`hostnamectl` scrie /etc/hostname; `hostname NUME` schimbă doar numele curent din kernel.',
    options: [
      { id: 'a', text: '`hostnamectl hostname server1.example.com` (sau `set-hostname`)', correct: true, why: 'Setează numele imediat și îl scrie în /etc/hostname.' },
      { id: 'b', text: '`hostname server1.example.com`', correct: false, why: 'Schimbă doar numele din kernel; se pierde la reboot.' },
      { id: 'c', text: '`echo server1.example.com > /etc/resolv.conf`', correct: false, why: 'Ar distruge configurația DNS și nu setează hostname-ul.' },
      { id: 'd', text: '`nmcli connection modify … hostname server1`', correct: false, why: 'Nu există o proprietate „hostname” în sintaxa aceasta; nmcli general hostname este forma corectă.' },
    ],
  },
  {
    id: 'L8.3-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Colegul tău a scris linia de mai jos în `/etc/hosts`, dar `getent hosts nfs1` nu returnează nimic. Care este formatul corect al unei linii?',
    explanation: 'Formatul: adresă IP, nume canonic, alias-uri opționale.',
    snippet: { kind: 'find-error', title: '/etc/hosts (linia colegului)', code: 'nfs1.example.com  192.0.2.20  nfs1' },
    options: [
      { id: 'a', text: '`192.0.2.20  nfs1.example.com nfs1`', correct: true, why: 'Adresa, apoi numele canonic, apoi alias-urile, separate prin spații sau taburi.' },
      { id: 'b', text: '`nfs1.example.com  192.0.2.20`', correct: false, why: 'Ordinea este inversată: adresa trebuie să fie prima.' },
      { id: 'c', text: '`192.0.2.20 = nfs1.example.com`', correct: false, why: 'Nu se folosește semnul egal.' },
      { id: 'd', text: '`nfs1.example.com: 192.0.2.20`', correct: false, why: 'Nu este formatul din hosts(5).' },
    ],
  },
  {
    id: 'L8.3-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: '`dig +short www.example.com` returnează `198.51.100.80`, dar `ping www.example.com` merge la `192.0.2.99`. Care este cea mai probabilă cauză?',
    explanation: 'Intrare în /etc/hosts care are prioritate față de DNS (files înaintea dns).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'comparație', code: '$ dig +short www.example.com\n198.51.100.80\n$ getent hosts www.example.com\n192.0.2.99      www.example.com\n$ grep "^hosts:" /etc/nsswitch.conf\nhosts:      files dns myhostname' },
    options: [
      { id: 'a', text: '/etc/hosts conține o intrare pentru www.example.com, iar files este consultat înaintea lui dns.', correct: true, why: 'dig ocolește NSS; getent/ping respectă ordinea files → dns.' },
      { id: 'b', text: 'Serverul DNS este defect.', correct: false, why: 'DNS-ul răspunde corect (dig); problema este în sursa locală.' },
      { id: 'c', text: 'ping folosește un alt protocol decât getent.', correct: false, why: 'Amândouă folosesc NSS.' },
      { id: 'd', text: 'Fusul orar este greșit.', correct: false, why: 'Nu are legătură cu rezolvarea numelor.' },
    ],
  },
  {
    id: 'L8.3-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai adăugat `nameserver 192.0.2.53` direct în `/etc/resolv.conf`; după `nmcli connection up` linia a dispărut. De ce?',
    explanation: 'NetworkManager generează fișierul din setările profilului.',
    options: [
      { id: 'a', text: 'Fișierul este generat de NetworkManager din profil; DNS-ul trebuie setat în profil (ipv4.dns).', correct: true, why: 'Editarea manuală este suprascrisă la regenerare.' },
      { id: 'b', text: 'Sintaxa liniei era greșită.', correct: false, why: 'Sintaxa era corectă; fișierul oricum se regenerează.' },
      { id: 'c', text: 'Nu aveai drepturi root.', correct: false, why: 'Linia fusese adăugată; a fost ștearsă ulterior de regenerare.' },
      { id: 'd', text: 'resolv.conf poate avea doar un nameserver.', correct: false, why: 'Pot fi până la trei.' },
    ],
  },
  {
    id: 'L8.3-008', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Setează în profilul `lab-static` serverul DNS `192.0.2.53` (înlocuind lista existentă).',
    prompt: '[root@server1 ~]#',
    answers: ['nmcli connection modify lab-static ipv4.dns 192.0.2.53', 'nmcli con mod lab-static ipv4.dns 192.0.2.53', 'sudo nmcli connection modify lab-static ipv4.dns 192.0.2.53', 'nmcli c mod lab-static ipv4.dns 192.0.2.53'],
    canonical: 'nmcli connection modify lab-static ipv4.dns 192.0.2.53',
    explanation: 'DNS se setează în profil cu `ipv4.dns`; apoi profilul se aplică cu `connection up`.',
    wrong: [
      { text: 'nmcli connection modify lab-static +ipv4.dns 192.0.2.53', why: 'Plusul adaugă la listă; cerința era de înlocuire.' },
      { text: 'echo nameserver 192.0.2.53 > /etc/resolv.conf', why: 'Editarea directă se pierde (fișier generat).' },
      { text: 'hostnamectl dns 192.0.2.53', why: 'hostnamectl nu gestionează DNS.' },
    ],
  },
  {
    id: 'L8.3-009', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre aceste comenzi respectă ordinea din `/etc/nsswitch.conf` (deci iau în calcul `/etc/hosts`)?',
    explanation: 'getent, ping, ssh folosesc NSS; dig, host, nslookup interoghează direct DNS.',
    options: [
      { id: 'a', text: '`getent hosts nume`', correct: true, why: 'Interoghează baza hosts prin NSS.' },
      { id: 'b', text: '`ping -c 1 nume`', correct: true, why: 'Rezolvarea numelui trece prin biblioteca C și NSS.' },
      { id: 'c', text: '`ssh nume`', correct: true, why: 'Aplicațiile obișnuite folosesc NSS.' },
      { id: 'd', text: '`dig nume`', correct: false, why: 'dig trimite cereri direct către DNS, ocolind /etc/hosts.' },
    ],
  },
  {
    id: 'L8.3-010', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Linia `hosts: dns [!UNAVAIL=return] files` din nsswitch.conf înseamnă:',
    explanation: 'DNS întâi; dacă DNS răspunde orice altceva decât „indisponibil”, se returnează; altfel se citește /etc/hosts.',
    options: [
      { id: 'a', text: 'Se întreabă DNS; dacă DNS nu este indisponibil (success, notfound, tryagain), se returnează imediat; doar dacă este indisponibil se trece la /etc/hosts.', correct: true, why: '[!UNAVAIL=return]: pentru orice status în afară de unavail, acțiunea este return.' },
      { id: 'b', text: 'Se citește mereu întâi /etc/hosts.', correct: false, why: 'Ordinea este dns, apoi files.' },
      { id: 'c', text: 'Ambele surse sunt interogate simultan.', correct: false, why: 'Sursele sunt interogate pe rând, de la stânga la dreapta.' },
      { id: 'd', text: 'DNS-ul este ignorat.', correct: false, why: 'DNS este prima sursă.' },
    ],
  },
  {
    id: 'L8.3-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii de diagnostic pentru „numele `nfs1` nu se rezolvă”.',
    explanation: 'De la rezultatul vizibil de aplicații spre surse.',
    items: [
      { text: '`getent hosts nfs1; echo $?` — confirmi problema (cod 2 = nu găsește)', why: 'Testezi ca aplicațiile.' },
      { text: '`grep ^hosts: /etc/nsswitch.conf` — vezi ordinea surselor', why: 'Știi unde se caută și în ce ordine.' },
      { text: '`grep nfs1 /etc/hosts` — există o intrare locală?', why: 'Prima sursă (files) poate rezolva sau suprascrie.' },
      { text: '`cat /etc/resolv.conf` — serverele DNS și domeniul corecte?', why: 'A doua sursă este DNS.' },
      { text: '`dig @SERVER nfs1.example.com +short` — serverul DNS știe numele?', why: 'Separi problema serverului de cea a clientului.' },
    ],
  },
  {
    id: 'L8.3-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește fișierul/comanda cu rolul.',
    explanation: 'Fiecare piesă are un rol distinct în identitatea și rezoluția numelor.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`/etc/hostname`', right: 'hostname-ul static al sistemului', why: 'O singură linie, citită la boot.' },
      { left: '`/etc/hosts`', right: 'tabel local de nume → adrese', why: 'Linii: adresă, nume canonic, alias-uri.' },
      { left: '`/etc/nsswitch.conf`', right: 'ordinea surselor de rezolvare (files, dns)', why: 'Linia hosts: stabilește ordinea.' },
      { left: '`/etc/resolv.conf`', right: 'serverele DNS și domeniile de căutare (generat de NetworkManager)', why: 'Linii nameserver și search.' },
    ],
    distractors: [{ text: 'regulile de firewall ale zonei', why: 'Aparțin firewalld (L8.4).' }],
  },
];
