import type { Question } from '../../lib/types';

const T = 'L7.3';
const O = ['C7-4'];

export const Q_L7_3: Question[] = [
  {
    id: 'L7.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este clientul de timp (NTP) implicit pe RHEL?',
    explanation: 'RHEL folosește chrony (daemonul `chronyd`).',
    options: [
      { id: 'a', text: '`chrony` (serviciul `chronyd`)', correct: true, why: 'chrony este implementarea de client/server NTP folosită pe RHEL din versiunea 8 (de confirmat pe RHEL 10).' },
      { id: 'b', text: '`cronie` (serviciul `crond`)', correct: false, why: 'cronie este planificatorul de sarcini, nu un client de timp.' },
      { id: 'c', text: '`rsyslog`', correct: false, why: 'Serviciu de logare, nu de timp.' },
      { id: 'd', text: '`atd`', correct: false, why: 'Daemonul pentru job-uri at (L7.1).' },
    ],
  },
  {
    id: 'L7.3-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Pornește `chronyd` acum și activează-l la fiecare boot, cu o singură comandă.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl enable --now chronyd', 'systemctl enable chronyd --now', 'sudo systemctl enable --now chronyd', 'systemctl --now enable chronyd'],
    canonical: 'systemctl enable --now chronyd',
    explanation: '`enable --now` face ambele: persistență la boot și pornire imediată.',
    wrong: [
      { text: 'systemctl start chronyd', why: 'Pornește acum, dar nu persistă după reboot.' },
      { text: 'systemctl enable chronyd', why: 'Persistă la boot, dar nu pornește acum.' },
      { text: 'chronyc start', why: 'chronyc nu pornește daemonul; serviciul se gestionează cu systemctl.' },
    ],
  },
  {
    id: 'L7.3-003', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce fișier configurezi pentru a schimba serverele de timp folosite de chrony?',
    explanation: 'Fișierul principal este `/etc/chrony.conf`.',
    options: [
      { id: 'a', text: '`/etc/chrony.conf`', correct: true, why: 'Conține directivele server, pool, makestep, driftfile etc. (documentația chrony).' },
      { id: 'b', text: '`/etc/ntp.conf`', correct: false, why: 'Aparține vechiului ntpd, care nu mai este implicit.' },
      { id: 'c', text: '`/etc/crontab`', correct: false, why: 'Tabela cron de sistem.' },
      { id: 'd', text: '`/etc/localtime`', correct: false, why: 'Legătură către fusul orar curent; nu conține servere de timp.' },
    ],
  },
  {
    id: 'L7.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai editat `/etc/chrony.conf` și ai adăugat `server ntp.example.com iburst`. Ce faci în continuare pentru ca modificarea să aibă efect?',
    explanation: 'chronyd citește configurația la pornire.',
    options: [
      { id: 'a', text: '`systemctl restart chronyd`', correct: true, why: 'Daemonul recitește fișierul la pornire.' },
      { id: 'b', text: 'Nimic: se aplică automat la salvare.', correct: false, why: 'chronyd nu urmărește fișierul în timp real.' },
      { id: 'c', text: '`systemctl daemon-reload`', correct: false, why: 'Aceasta recitește fișierele de unitate systemd, nu configurația aplicației.' },
      { id: 'd', text: '`chronyc makestep`', correct: false, why: 'Forțează un salt de ceas; nu reîncarcă configurația.' },
    ],
  },
  {
    id: 'L7.3-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce înseamnă linia selectată în output-ul de mai jos?',
    explanation: '`^*` = server, sursă curent selectată; Reach 377 = ultimele 8 răspunsuri valide.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'chronyc sources', code: 'MS Name/IP address         Stratum Poll Reach LastRx Last sample\n===============================================================================\n^* ntp.example.com               2   6   377    21   +128us[ +151us] +/-   18ms\n^? ntp3.example.com              0   6     0     -     +0ns[   +0ns] +/-    0ns' },
    options: [
      { id: 'a', text: '`ntp.example.com` este sursa selectată pentru sincronizare; `ntp3` nu răspunde.', correct: true, why: '* = sursa curentă; ? și Reach 0 = sursă nefolosibilă.' },
      { id: 'b', text: '`ntp.example.com` este un falseticker.', correct: false, why: 'Falseticker este marcat cu x, nu cu *.' },
      { id: 'c', text: 'Ambele servere sunt selectate.', correct: false, why: 'Doar una are * (cea mai bună); ntp3 are ?.' },
      { id: 'd', text: 'Output-ul indică eroare de configurare.', correct: false, why: '* este starea ideală pentru sursa folosită.' },
    ],
  },
  {
    id: 'L7.3-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cerința: „folosește DOAR serverul `ntp.example.com`”. Configurația de mai jos nu o respectă. Ce modificare o corectează?',
    explanation: 'Adaugi `server … iburst` și dezactivezi linia `pool` existentă.',
    snippet: { kind: 'find-error', title: '/etc/chrony.conf (configurația unui coleg)', code: 'pool 2.rhel.pool.ntp.org iburst\nserver ntp.example.com iburst\ndriftfile /var/lib/chrony/drift\nmakestep 1.0 3' },
    options: [
      { id: 'a', text: 'Comentezi linia `pool` și adaugi `server ntp.example.com iburst`.', correct: true, why: 'Astfel serverul tău este singura sursă; iburst accelerează prima sincronizare.' },
      { id: 'b', text: 'Adaugi `server ntp.example.com iburst` și lași `pool` activ.', correct: false, why: 'Sistemul ar folosi și sursele din pool, deci nu doar serverul cerut.' },
      { id: 'c', text: 'Adaugi `allow ntp.example.com`.', correct: false, why: 'allow permite clienți să se conecteze la tine; nu alege o sursă.' },
      { id: 'd', text: 'Scrii `server ntp.example.com` în `/etc/localtime`.', correct: false, why: '/etc/localtime indică fusul orar, nu surse NTP.' },
    ],
  },
  {
    id: 'L7.3-007', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează sursele de timp ale lui chrony, cu legenda coloanelor.',
    prompt: '[student@server1 ~]$',
    answers: ['chronyc sources -v', 'sudo chronyc sources -v'],
    canonical: 'chronyc sources -v',
    explanation: '`chronyc sources -v` adaugă linii explicative despre coloane.',
    wrong: [
      { text: 'chronyc sources', why: 'Afișează sursele, dar fără legenda din -v.' },
      { text: 'chronyc tracking', why: 'Arată starea sincronizării, nu lista surselor.' },
      { text: 'timedatectl -v', why: 'timedatectl nu listează sursele NTP.' },
    ],
  },
  {
    id: 'L7.3-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'În `chronyc tracking`, `Leap status : Not synchronised` indică:',
    explanation: 'Nu există sursă selectată: sistemul nu este sincronizat.',
    options: [
      { id: 'a', text: 'Chrony nu are încă o sursă selectată (nesincronizat).', correct: true, why: 'Valorile posibile sunt Normal, Insert second, Delete second și Not synchronised (chronyc).' },
      { id: 'b', text: 'Urmează o secundă intercalară.', correct: false, why: 'Aceasta ar fi „Insert second” sau „Delete second”.' },
      { id: 'c', text: 'Ceasul este perfect sincronizat.', correct: false, why: 'Starea bună este „Normal”.' },
      { id: 'd', text: 'chronyd rulează în mod server.', correct: false, why: 'Starea nu descrie rolul de server.' },
    ],
  },
  {
    id: 'L7.3-009', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre acestea pot explica o sursă cu `^?` și Reach `0` imediat după configurare?',
    explanation: 'Reach 0 înseamnă că niciun răspuns valid nu a fost primit încă.',
    options: [
      { id: 'a', text: 'Numele serverului nu se rezolvă prin DNS.', correct: true, why: 'Fără adresă, chrony nu poate trimite cereri.' },
      { id: 'b', text: 'Un firewall blochează UDP 123 spre server.', correct: true, why: 'Cererile NTP sunt trimise pe UDP 123.' },
      { id: 'c', text: 'chronyd abia a pornit și așteaptă primele răspunsuri.', correct: true, why: 'Reach crește treptat; fără iburst primul răspuns poate întârzia.' },
      { id: 'd', text: 'Fusul orar este greșit.', correct: false, why: 'Fusul orar nu influențează accesibilitatea sursei.' },
    ],
  },
  {
    id: 'L7.3-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a configura chrony să folosească serverul `ntp.example.com` și a confirma rezultatul.',
    explanation: 'Copie, editare, restart, verificare, persistență.',
    items: [
      { text: '`cp -a /etc/chrony.conf /etc/chrony.conf.orig`', why: 'Copie de siguranță înainte de editare.' },
      { text: 'editezi `/etc/chrony.conf`: comentezi `pool`, adaugi `server ntp.example.com iburst`', why: 'Definești sursa dorită.' },
      { text: '`systemctl restart chronyd`', why: 'Daemonul citește configurația la pornire.' },
      { text: '`chronyc sources -v` și `chronyc tracking`', why: 'Confirmi sursa selectată și starea Normal.' },
      { text: '`systemctl enable --now chronyd` (sau `is-enabled`)', why: 'Te asiguri că pornește la fiecare boot.' },
    ],
  },
  {
    id: 'L7.3-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce face directiva `makestep 1.0 3`?',
    explanation: '`makestep prag limită`: permite step dacă decalajul depășește pragul, doar în primele „limită” actualizări.',
    options: [
      { id: 'a', text: 'Permite un salt al ceasului dacă decalajul depășește 1,0 s, doar în primele 3 actualizări.', correct: true, why: 'Definiția din documentația chrony.conf: threshold = 1,0 s, limit = 3 actualizări.' },
      { id: 'b', text: 'Sare ceasul la fiecare 3 secunde cu 1 secundă.', correct: false, why: 'Nu este o corecție periodică.' },
      { id: 'c', text: 'Interzice orice corectare pe parcursul primelor 3 secunde.', correct: false, why: 'Nu interzice corectarea; permite step în anumite condiții.' },
      { id: 'd', text: 'Setează fusul orar la +1.', correct: false, why: 'Fusul orar se setează cu timedatectl.' },
    ],
  },
  {
    id: 'L7.3-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda cu rolul ei.',
    explanation: 'Fiecare comandă acoperă un aspect diferit al timpului.',
    leftLabel: 'Comandă', rightLabel: 'Rol',
    pairs: [
      { left: '`chronyc tracking`', right: 'starea sincronizării: server, stratum, decalaj, Leap status', why: 'Arată câmpurile Reference ID, Stratum, System time etc.' },
      { left: '`chronyc sources -v`', right: 'lista surselor cu starea lor și legenda', why: 'Coloana MS (^*, ^+, ^?, x).' },
      { left: '`timedatectl set-timezone Europe/Bucharest`', right: 'schimbă fusul orar', why: 'Modifică legătura /etc/localtime.' },
      { left: '`chronyc makestep`', right: 'forțează un salt imediat al ceasului', why: 'Folosit doar la decalaje mari.' },
    ],
    distractors: [{ text: 'listează job-urile cron', why: 'Aceasta este treaba lui crontab -l.' }],
  },
];
