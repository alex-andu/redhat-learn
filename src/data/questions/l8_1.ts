import type { Question } from '../../lib/types';

const T = 'L8.1';
const O: string[] = [];

export const Q_L8_1: Question[] = [
  {
    id: 'L8.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Câți biți are o adresă [[ipv4]] și câți una [[ipv6]]?',
    explanation: 'IPv4 = 32 de biți (4 octeți); IPv6 = 128 de biți (8 grupuri de 16 biți).',
    options: [
      { id: 'a', text: 'IPv4: 32 de biți; IPv6: 128 de biți.', correct: true, why: 'IPv4 are patru octeți (4 × 8); IPv6 are opt grupuri de 16 biți (8 × 16).' },
      { id: 'b', text: 'IPv4: 64 de biți; IPv6: 256 de biți.', correct: false, why: 'Valorile sunt dublul celor reale.' },
      { id: 'c', text: 'IPv4: 32 de biți; IPv6: 64 de biți.', correct: false, why: '64 de biți este lungimea tipică a prefixului unei subrețele IPv6, nu a adresei întregi.' },
      { id: 'd', text: 'IPv4: 48 de biți; IPv6: 128 de biți.', correct: false, why: '48 de biți este lungimea unei adrese MAC.' },
    ],
  },
  {
    id: 'L8.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce înseamnă `/24` în `192.0.2.10/24`?',
    explanation: 'Prefixul /24 = primii 24 de biți identifică rețeaua = masca 255.255.255.0.',
    options: [
      { id: 'a', text: 'Primii 24 de biți sunt partea de rețea (masca 255.255.255.0).', correct: true, why: 'Restul de 8 biți identifică host-ul: 256 de adrese, 254 utilizabile.' },
      { id: 'b', text: 'Adresa este valabilă 24 de ore.', correct: false, why: 'Valabilitatea unei adrese este un „lease” DHCP, nu prefixul.' },
      { id: 'c', text: 'Rețeaua are exact 24 de host-uri.', correct: false, why: 'Rețeaua /24 are 256 de adrese, nu 24.' },
      { id: 'd', text: 'Masca este 255.255.255.24.', correct: false, why: 'Masca este scrisă cu octeți formați din biți de 1 urmați de 0; 24 nu este un octet de mască valid.' },
    ],
  },
  {
    id: 'L8.1-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează, pe scurt (o linie per interfață), interfețele și adresele lor.',
    prompt: '[student@server1 ~]$',
    answers: ['ip -br addr', 'ip -brief addr', 'ip -br a', 'ip -br address', 'ip -brief address'],
    canonical: 'ip -br addr',
    explanation: '`ip -br addr` (brief) afișează starea și adresele fiecărei interfețe pe o singură linie.',
    wrong: [
      { text: 'ip addr show', why: 'Afișează adresele, dar în forma completă, nu „brief”.' },
      { text: 'ip route', why: 'Arată tabela de rutare, nu adresele interfețelor.' },
      { text: 'ifconfig', why: 'Unealtă veche, nu mai este metoda recomandată pe RHEL modern.' },
    ],
  },
  {
    id: 'L8.1-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Pentru `192.0.2.10/24`, care este adresa de broadcast a subrețelei?',
    explanation: 'La /24, ultimul octet este partea de host; broadcast = toți biții de host 1 = 255.',
    options: [
      { id: 'a', text: '`192.0.2.255`', correct: true, why: 'Ultima adresă din 192.0.2.0/24 este broadcast-ul.' },
      { id: 'b', text: '`192.0.2.0`', correct: false, why: 'Aceasta este adresa rețelei (toți biții de host 0).' },
      { id: 'c', text: '`192.0.2.254`', correct: false, why: 'Este ultima adresă utilizabilă pentru un host, nu broadcast-ul.' },
      { id: 'd', text: '`255.255.255.255`', correct: false, why: 'Este broadcast-ul limitat (toată rețeaua locală), nu cel al subrețelei.' },
    ],
  },
  {
    id: 'L8.1-005', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre acestea sunt adrese IPv4 private (RFC 1918)?',
    explanation: 'Intervalele private: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
    options: [
      { id: 'a', text: '`10.20.30.40`', correct: true, why: 'Se află în 10.0.0.0/8.' },
      { id: 'b', text: '`172.20.1.5`', correct: true, why: '172.16.0.0/12 acoperă 172.16.0.0–172.31.255.255.' },
      { id: 'c', text: '`192.168.1.10`', correct: true, why: 'Se află în 192.168.0.0/16.' },
      { id: 'd', text: '`172.32.0.1`', correct: false, why: 'În afara 172.16.0.0/12 (se termină la 172.31.255.255); este adresă publică.' },
    ],
  },
  {
    id: 'L8.1-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este forma scurtă corectă a adresei `2001:0db8:0000:0000:0000:0000:0000:0010`?',
    explanation: 'Scoți zerourile din față și înlocuiești o singură succesiune de grupuri nule cu `::`.',
    options: [
      { id: 'a', text: '`2001:db8::10`', correct: true, why: 'Cele cinci grupuri nule consecutive devin `::`; `0db8` → `db8`; `0010` → `10`.' },
      { id: 'b', text: '`2001:db8::0010::`', correct: false, why: '`::` poate apărea o singură dată și nu la final în acest fel.' },
      { id: 'c', text: '`2001:db8:10`', correct: false, why: 'Ar avea doar trei grupuri; nu se poate deduce ce lipsește.' },
      { id: 'd', text: '`2001::db8::10`', correct: false, why: 'Folosește `::` de două ori: adresa devine ambiguă.' },
    ],
  },
  {
    id: 'L8.1-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată linia `default` din output-ul de mai jos?',
    explanation: 'Ruta implicită: tot ce nu e local merge la gateway.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ip route', code: 'default via 192.0.2.1 dev enp1s0 proto static metric 100\n192.0.2.0/24 dev enp1s0 proto kernel scope link src 192.0.2.10 metric 100' },
    options: [
      { id: 'a', text: 'Destinațiile care nu sunt în 192.0.2.0/24 sunt trimise la gateway-ul 192.0.2.1 prin enp1s0.', correct: true, why: 'Ruta default este folosită când nu există o rută mai specifică.' },
      { id: 'b', text: 'Interfața enp1s0 este dezactivată.', correct: false, why: 'Nu apare nicio informație despre starea interfeței în acest output.' },
      { id: 'c', text: '192.0.2.1 este adresa acestui sistem.', correct: false, why: 'Adresa sistemului este `src 192.0.2.10`; 192.0.2.1 este routerul (via).' },
      { id: 'd', text: 'DNS-ul este 192.0.2.1.', correct: false, why: 'tabela de rutare nu conține servere DNS.' },
    ],
  },
  {
    id: 'L8.1-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un coleg a configurat: adresă `192.0.2.10/24`, gateway `192.0.3.1`. Ce este greșit?',
    explanation: 'Gateway-ul trebuie să fie în aceeași subrețea cu interfața.',
    snippet: { kind: 'find-error', title: 'configurația unui coleg', code: 'ipv4.addresses  192.0.2.10/24\nipv4.gateway    192.0.3.1' },
    options: [
      { id: 'a', text: 'Gateway-ul 192.0.3.1 nu este în 192.0.2.0/24: nu poate fi atins direct.', correct: true, why: 'Un host trimite direct doar în subrețeaua lui; gateway-ul trebuie să fie acolo.' },
      { id: 'b', text: 'Prefixul /24 nu este permis.', correct: false, why: '/24 este foarte uzual.' },
      { id: 'c', text: 'Adresa 192.0.2.10 este de broadcast.', correct: false, why: 'Broadcast-ul subrețelei este 192.0.2.255.' },
      { id: 'd', text: 'Nu poți avea gateway și adresă în același profil.', correct: false, why: 'Un profil static are tocmai adresa, prefixul și gateway-ul.' },
    ],
  },
  {
    id: 'L8.1-009', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre IPv6 sunt adevărate?',
    explanation: 'IPv6 nu are broadcast; link-local există automat; prefixul tipic este /64.',
    options: [
      { id: 'a', text: 'Nu are broadcast; folosește multicast.', correct: true, why: 'Rolul broadcast-ului este preluat de multicast (ff00::/8).' },
      { id: 'b', text: 'Fiecare interfață activă are automat o adresă link-local fe80::.', correct: true, why: 'Este necesară pentru Neighbor Discovery.' },
      { id: 'c', text: 'Subrețeaua standard are prefixul /64.', correct: true, why: '64 de biți de rețea și 64 de biți pentru identificatorul interfeței.' },
      { id: 'd', text: 'Adresa fe80:: este rutată pe Internet.', correct: false, why: 'Link-local nu este rutată în afara segmentului.' },
    ],
  },
  {
    id: 'L8.1-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii prin care un host decide cum trimite un pachet către o destinație.',
    explanation: 'Se caută ruta cea mai specifică; local → direct, altfel gateway.',
    items: [
      { text: 'Aplicația cere trimiterea unui pachet către o adresă IP destinație.', why: 'Punctul de plecare.' },
      { text: 'Kernelul caută în tabela de rutare cea mai specifică rută (prefix cel mai lung) care conține destinația.', why: 'Cea mai specifică rută câștigă.' },
      { text: 'Dacă destinația e în subrețeaua locală, află MAC-ul prin ARP/NDP și livrează direct; altfel folosește ruta default.', why: 'Direct sau prin gateway.' },
      { text: 'Pachetul este încapsulat într-un cadru către MAC-ul vecinului (sau al gateway-ului) și trimis.', why: 'Pe cablu, livrarea se face după MAC.' },
    ],
  },
  {
    id: 'L8.1-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pentru `198.51.100.77/25`, care este adresa rețelei și broadcast-ul?',
    explanation: '/25 → blocuri de 128; 77 cade în blocul 0–127.',
    options: [
      { id: 'a', text: 'Rețea `198.51.100.0`, broadcast `198.51.100.127`.', correct: true, why: 'Masca …128: blocuri 0–127 și 128–255; 77 aparține primului bloc.' },
      { id: 'b', text: 'Rețea `198.51.100.64`, broadcast `198.51.100.127`.', correct: false, why: 'Blocul de 64 ar corespunde lui /26, nu /25.' },
      { id: 'c', text: 'Rețea `198.51.100.0`, broadcast `198.51.100.255`.', correct: false, why: 'Aceasta ar fi pentru /24.' },
      { id: 'd', text: 'Rețea `198.51.100.128`, broadcast `198.51.100.255`.', correct: false, why: 'Este al doilea bloc /25 (128–255); 77 nu este în el.' },
    ],
  },
  {
    id: 'L8.1-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește adresa cu tipul ei.',
    explanation: 'Recunoașterea tipului de adresă ghidează diagnosticul.',
    leftLabel: 'Adresă', rightLabel: 'Tip',
    pairs: [
      { left: '`127.0.0.1`', right: 'loopback IPv4', why: 'Pachetele rămân în același sistem.' },
      { left: '`fe80::5054:ff:fe12:3456`', right: 'link-local IPv6', why: 'Prefix fe80::/10, valabilă doar pe segment.' },
      { left: '`169.254.12.7`', right: 'link-local IPv4 (APIPA)', why: '169.254.0.0/16, apare când DHCP nu răspunde.' },
      { left: '`2001:db8::10`', right: 'adresă IPv6 din intervalul de documentație', why: '2001:db8::/32 este rezervat pentru exemple (RFC 3849).' },
    ],
    distractors: [{ text: 'adresă privată IPv4 RFC 1918', why: 'Niciuna dintre adrese nu este în 10/8, 172.16/12 sau 192.168/16.' }],
  },
];
