import type { Question } from '../../lib/types';

const T = 'M0.1';
const O: string[] = [];

export const Q_M0_1: Question[] = [
  {
    id: 'M0.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce este, tehnic vorbind, „Linux”?',
    explanation: 'Linux este nucleul; un sistem utilizabil este o distribuție care adaugă programe, manager de pachete și configurări.',
    options: [
      { id: 'a', text: 'Nucleul (kernel) sistemului de operare; o distribuție îl combină cu programe GNU și alte componente.', correct: true, why: 'Nucleul gestionează hardware-ul; fără shell, comenzi și manager de pachete nu este utilizabil singur.' },
      { id: 'b', text: 'O distribuție comercială a firmei Red Hat.', correct: false, why: 'Red Hat Enterprise Linux este o distribuție; „Linux” desemnează nucleul.' },
      { id: 'c', text: 'Un shell, ca bash.', correct: false, why: 'Shell-ul este un program obișnuit din user space.' },
      { id: 'd', text: 'Un format de pachete, ca RPM.', correct: false, why: 'RPM este formatul de pachete al familiei Red Hat, nu nucleul.' },
    ],
  },
  {
    id: 'M0.1-002', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește fiecare proiect cu rolul lui în ecosistemul Red Hat.',
    explanation: 'Fluxul simplificat: Fedora → CentOS Stream → RHEL; recompilările comunitare urmăresc RHEL.',
    leftLabel: 'Proiect', rightLabel: 'Rol',
    pairs: [
      { left: 'Fedora', right: 'distribuție comunitară cu funcții noi, sursa inovației', why: 'Lansări frecvente; funcțiile ajung la RHEL doar după selecție și stabilizare.' },
      { left: 'CentOS Stream', right: 'distribuție aflată imediat în amonte de RHEL', why: 'Urmărește codul care va intra în următoarea versiune minoră RHEL.' },
      { left: 'RHEL', right: 'produs comercial testat, cu suport și ciclu de viață lung', why: 'Se instalează pe baza unui abonament Red Hat.' },
      { left: 'Rocky Linux / AlmaLinux', right: 'recompilări comunitare compatibile cu RHEL', why: 'Proiecte independente, fără abonament Red Hat.' },
    ],
    distractors: [
      { text: 'distribuție din familia Debian', why: 'Debian și Ubuntu folosesc DEB și APT; nu fac parte din familia Red Hat.' },
    ],
  },
  {
    id: 'M0.1-003', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Pe RHEL 10, `dnf install httpd` răspunde „This system has no repositories available through subscriptions”. Care este cauza cea mai probabilă?',
    explanation: 'Repository-urile Red Hat sunt accesibile doar sistemelor înregistrate; un sistem neînregistrat nu vede conținut Red Hat.',
    options: [
      { id: 'a', text: 'Sistemul nu este înregistrat la Red Hat (sau nu are abonament atașat) și nu are repository-uri locale configurate.', correct: true, why: 'Se verifică cu `subscription-manager identity`; remedierea este înregistrarea sau configurarea unui repository local.' },
      { id: 'b', text: 'Pachetul `httpd` nu există pe RHEL.', correct: false, why: '`httpd` există în repository-urile RHEL; mesajul vorbește despre lipsa repository-urilor.' },
      { id: 'c', text: 'DNF trebuie înlocuit cu `rpm -i`.', correct: false, why: '`rpm -i` nu rezolvă dependențe și nu înlocuiește repository-urile.' },
      { id: 'd', text: 'Utilizatorul nu a rulat `systemctl daemon-reload`.', correct: false, why: '`daemon-reload` privește unit-urile systemd, nu repository-urile DNF.' },
    ],
  },
  {
    id: 'M0.1-004', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre versiunile RHEL sunt corecte? (alege toate cele corecte)',
    explanation: 'Versiunea majoră definește baza; minorele (10.0, 10.1…) aduc actualizări în aceeași majoră.',
    options: [
      { id: 'a', text: 'RHEL 10 este o versiune majoră; 10.0, 10.1 etc. sunt versiuni minore în interiorul ei.', correct: true, why: 'Minorele păstrează compatibilitatea cu aplicațiile.' },
      { id: 'b', text: 'Un sistem 10.0 devine ultima minoră disponibilă după `dnf update`.', correct: true, why: 'Actualizarea în interiorul majorei aduce sistemul la ultima minoră a repository-urilor.' },
      { id: 'c', text: 'Trecerea de la RHEL 9 la RHEL 10 este o simplă `dnf update`.', correct: false, why: 'Trecerea între majore este o migrare planificată; `dnf update` rămâne în aceeași majoră.' },
      { id: 'd', text: 'Versiunile pachetelor RHEL se schimbă la fiecare minoră cu salturi mari de versiune.', correct: false, why: 'În interiorul unei majore, versiunile sunt în mare parte înghețate; corecțiile se portează (backport).' },
    ],
  },
  {
    id: 'M0.1-005', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează fișierul cu versiunea RHEL (o singură linie, specific familiei Red Hat).',
    prompt: '[student@server1 ~]$', answers: ['cat /etc/redhat-release'], canonical: 'cat /etc/redhat-release',
    explanation: '`/etc/redhat-release` conține pe o linie numele și versiunea sistemului; `cat` îl afișează.',
    wrong: [
      { text: 'cat /etc/os-version', why: 'Fișierul nu există; numele standard este `os-release`.' },
      { text: 'cat /etc/release', why: 'Nu este un fișier standard de pe RHEL.' },
      { text: 'uname -r', why: '`uname -r` afișează versiunea nucleului, nu pe cea a distribuției.' },
      { text: 'cat /etc/hostname', why: 'Afișează numele mașinii, nu versiunea sistemului.' },
    ],
    hint: 'Numele fișierului conține „redhat” și „release”.',
  },
  {
    id: 'M0.1-006', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează starea abonamentului sistemului (necesită root; folosește sudo).',
    prompt: '[student@server1 ~]$', answers: ['sudo subscription-manager status'], canonical: 'sudo subscription-manager status',
    explanation: '`subscription-manager status` afișează starea generală a abonamentului („Overall Status”).',
    wrong: [
      { text: 'sudo subscription-manager register', why: '`register` înregistrează sistemul (modifică starea); nu doar afișează.' },
      { text: 'sudo dnf repolist', why: 'Arată repository-urile, nu starea abonamentului.' },
      { text: 'sudo rpm -qa subscription', why: '`rpm -qa` listează pachetele instalate; nu arată starea abonamentului.' },
      { text: 'subscription-manager unregister', why: 'Scoate sistemul din evidență; nu afișează starea.' },
    ],
    hint: 'Subcomanda cerută are exact numele informației dorite.',
  },
  {
    id: 'M0.1-007', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru ca un sistem RHEL înregistrat să instaleze un pachet din repository-urile Red Hat.',
    explanation: 'Flux simplificat: cont și abonament → înregistrare → repository-uri vizibile → instalare cu verificarea semnăturii.',
    items: [
      { text: 'Ai un cont Red Hat și un abonament valabil.', why: 'Fără abonament nu există acces la conținut.' },
      { text: 'Rulezi `subscription-manager register` (sau `rhc connect`) pe sistem.', why: 'Sistemul își primește identitatea și certificatele.' },
      { text: 'Abonamentul este asociat sistemului și repository-urile apar în configurația DNF.', why: 'Fișierul `redhat.repo` este generat pe baza abonamentului.' },
      { text: '`dnf` descarcă metadate și pachete de la CDN folosind certificatele.', why: 'Certificatele dovedesc dreptul de acces.' },
      { text: 'DNF verifică semnătura GPG și instalează pachetul; RPM notează în baza de date.', why: 'Semnătura garantează originea pachetului; baza RPM înregistrează instalarea.' },
    ],
  },
  {
    id: 'M0.1-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată output-ul despre sistem?',
    explanation: '`ID` și `PLATFORM_ID` identifică distribuția și platforma de pachete.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: '/etc/os-release (exemplu)',
      code: 'NAME="Rocky Linux"\nVERSION="10.0 (Red Quartz)"\nID="rocky"\nID_LIKE="rhel centos fedora"\nVERSION_ID="10.0"\nPLATFORM_ID="platform:el10"',
    },
    options: [
      { id: 'a', text: 'Este Rocky Linux, o recompilare compatibilă cu RHEL 10 (platforma el10), nu RHEL însuși.', correct: true, why: '`ID="rocky"` și `NAME` o arată; `ID_LIKE` și `PLATFORM_ID` indică familia și compatibilitatea.' },
      { id: 'b', text: 'Este Red Hat Enterprise Linux 10.', correct: false, why: 'Pe RHEL, `ID` ar fi `"rhel"`.' },
      { id: 'c', text: 'Este CentOS Stream.', correct: false, why: '`ID` ar fi `"centos"`, iar `VERSION` ar spune „Stream”.' },
      { id: 'd', text: 'Este o distribuție din familia Debian.', correct: false, why: '`ID_LIKE` ar conține `debian`; aici apar `rhel` și `fedora`.' },
    ],
  },
  {
    id: 'M0.1-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce concluzie corectă tragi din acest output?',
    explanation: 'Un sistem neînregistrat nu are acces la repository-urile Red Hat.',
    snippet: {
      kind: 'interpret-output', label: 'illustrative', title: 'sesiune (exemplu)',
      code: '[student@server1 ~]$ sudo subscription-manager identity\nThis system is not yet registered. Try \'subscription-manager register --help\' for more information.\n[student@server1 ~]$ dnf repolist\nThis system has no repositories available through subscriptions.',
    },
    options: [
      { id: 'a', text: 'Sistemul nu este înregistrat, deci nu vede repository-urile Red Hat; pentru pachete trebuie înregistrat sau configurat un repository local.', correct: true, why: 'Ambele mesaje arată aceeași cauză: lipsa înregistrării.' },
      { id: 'b', text: 'DNF este defect și trebuie reinstalat.', correct: false, why: 'DNF funcționează; el raportează corect lipsa repository-urilor.' },
      { id: 'c', text: 'Rețeaua este oprită.', correct: false, why: 'Mesajele cer înregistrarea, nu raportează probleme de conectivitate.' },
      { id: 'd', text: 'Sistemul rulează o recompilare, nu RHEL.', correct: false, why: 'Mesajul despre subscripții apare tocmai pe RHEL neînregistrat.' },
    ],
  },
  {
    id: 'M0.1-010', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cineva a scris următoarea „procedură de curățenie” după un laborator. Ce lipsește?',
    explanation: 'Un sistem înregistrat consumă un abonament; înainte de ștergerea VM-ului se rulează `unregister`.',
    snippet: { kind: 'find-error', title: 'procedură', code: '# După laborator\n1. Oprește VM-ul\n2. Șterge VM-ul din hypervisor' },
    options: [
      { id: 'a', text: 'Dezînregistrarea sistemului (`subscription-manager unregister`) înainte de ștergere, ca să elibereze abonamentul.', correct: true, why: 'Altfel VM-ul șters rămâne în cont până îl elimini manual din portal.' },
      { id: 'b', text: 'Repornirea de trei ori a VM-ului.', correct: false, why: 'Nu are legătură cu abonamentul.' },
      { id: 'c', text: 'Instalarea tuturor actualizărilor.', correct: false, why: 'Nu este necesară înainte de ștergere.' },
      { id: 'd', text: 'Dezactivarea SELinux.', correct: false, why: 'Nu este recomandată și nu are legătură cu ștergerea.' },
    ],
  },
  {
    id: 'M0.1-011', topicId: T, objectives: O, difficulty: 1, type: 'multi',
    stem: 'Care sunt practici bune pentru un mediu de exercițiu? (alege toate cele corecte)',
    explanation: 'Mediul trebuie să permită revenirea după greșeli și accesul când rețeaua se defectează.',
    options: [
      { id: 'a', text: 'Folosești o mașină virtuală cu instantaneu (snapshot) înainte de laboratoarele riscante.', correct: true, why: 'Poți reveni după o greșeală la disc, rețea, SELinux sau GRUB.' },
      { id: 'b', text: 'Ai acces la consola VM-ului, nu doar prin SSH.', correct: true, why: 'Dacă strici rețeaua sau firewall-ul, consola rămâne singura cale.' },
      { id: 'c', text: 'Ai un disc suplimentar gol pentru laboratoarele de stocare.', correct: true, why: 'Nu riști discul sistemului în C5/C6.' },
      { id: 'd', text: 'Exersezi direct pe laptopul tău de lucru ca să economisești timp.', correct: false, why: 'Laboratoarele modifică discuri, rețea și securitate; riști datele și configurarea.' },
    ],
  },
  {
    id: 'M0.1-012', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce nu poți presupune că o procedură scrisă pentru RHEL 8 funcționează identic pe RHEL 10?',
    explanation: 'Valorile implicite, pachetele și comenzile se pot schimba între versiuni majore; verifici în documentația versiunii tale.',
    options: [
      { id: 'a', text: 'Pot apărea diferențe de valori implicite, pachete, comenzi sau configurări; se verifică în documentația RHEL 10 și pe sistem.', correct: true, why: 'Examenul vizează RHEL 10; procedurile din versiuni vechi pot fi depășite.' },
      { id: 'b', text: 'Pentru că versiunile majore nu au nimic în comun.', correct: false, why: 'Majoritatea conceptelor se păstrează; diferențele sunt punctuale.' },
      { id: 'c', text: 'Pentru că RHEL 10 nu mai folosește shell-ul bash.', correct: false, why: 'bash rămâne shell-ul implicit.' },
      { id: 'd', text: 'Pentru că RHEL 10 nu mai folosește RPM.', correct: false, why: 'RPM și DNF sunt în continuare formatul și managerul de pachete.' },
    ],
  },
];
