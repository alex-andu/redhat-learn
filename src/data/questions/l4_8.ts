import type { Question } from '../../lib/types';

const T = 'L4.8';
const O = ['C4-8'];

export const Q_L4_8: Question[] = [
  {
    id: 'L4.8-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Unde ține journald jurnalul când este volatil (nepersistent)?',
    explanation: 'Jurnalul volatil este în `/run/log/journal`, un sistem de fișiere în memorie; se pierde la reboot.',
    options: [
      { id: 'a', text: '`/run/log/journal` (în memorie)', correct: true, why: '`/run` este un sistem de fișiere temporar, golit la reboot.' },
      { id: 'b', text: '`/var/log/journal`', correct: false, why: 'Acesta este locul jurnalului persistent, pe disc.' },
      { id: 'c', text: '`/etc/journal`', correct: false, why: 'Directorul nu există; `/etc` conține configurații.' },
      { id: 'd', text: '`/boot/journal`', correct: false, why: '`/boot` conține kernelul și bootloader-ul.' },
    ],
  },
  {
    id: 'L4.8-002', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este cea mai simplă modalitate de a face jurnalul persistent, cu `Storage=auto` (implicit)?',
    explanation: 'Cu `Storage=auto`, journald folosește discul dacă directorul `/var/log/journal` există. Îl creezi și repornești serviciul.',
    options: [
      { id: 'a', text: '`mkdir -p /var/log/journal` și `systemctl restart systemd-journald`', correct: true, why: 'Directorul există, deci journald scrie pe disc.' },
      { id: 'b', text: '`touch /var/log/journal`', correct: false, why: 'Aceasta creează un fișier, nu un director.' },
      { id: 'c', text: '`systemctl enable systemd-journald`', correct: false, why: 'Serviciul este deja activ; nu decide locația.' },
      { id: 'd', text: '`journalctl --persistent`', correct: false, why: 'Nu există o asemenea opțiune.' },
    ],
  },
  {
    id: 'L4.8-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce linie din `/etc/systemd/journald.conf` forțează jurnalul persistent?',
    explanation: '`Storage=persistent` în secțiunea `[Journal]`. După modificare repornești `systemd-journald`.',
    snippet: { kind: 'find-error', title: '/etc/systemd/journald.conf', code: '[Journal]\nstorage = persist' },
    options: [
      { id: 'a', text: '`Storage=persistent` (valoarea exactă, după `[Journal]`).', correct: true, why: 'Valoarea trebuie să fie `persistent`; `persist` nu este recunoscută.' },
      { id: 'b', text: '`Persistent=yes`', correct: false, why: 'Nu este un parametru al journald.' },
      { id: 'c', text: '`Storage=disk`', correct: false, why: 'Valorile valide sunt volatile, persistent, auto, none.' },
      { id: 'd', text: '`Storage=auto`', correct: false, why: '`auto` este persistent doar dacă directorul `/var/log/journal` există.' },
    ],
  },
  {
    id: 'L4.8-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Repornește serviciul journald după modificarea configurației.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl restart systemd-journald', 'systemctl restart systemd-journald.service'],
    canonical: 'systemctl restart systemd-journald',
    explanation: 'Modificările din `journald.conf` se aplică după repornirea serviciului `systemd-journald`.',
    wrong: [
      { text: 'systemctl reload journald', why: 'Numele unității este `systemd-journald`, nu `journald`.' },
      { text: 'systemctl restart rsyslog', why: 'rsyslog este alt serviciu; nu citește `journald.conf`.' },
      { text: 'journalctl --restart', why: '`journalctl` citește jurnalul; nu repornește serviciul.' },
    ],
  },
  {
    id: 'L4.8-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată această ieșire după reboot și ce înseamnă?',
    explanation: 'Un singur boot în listă arată că jurnalul nu a păstrat boot-ul anterior: este volatil.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# journalctl --list-boots\nIDX BOOT ID                          FIRST ENTRY                 LAST ENTRY\n  0 b17d…44c2 Mon 2026-11-16 08:12:10 UTC   Mon 2026-11-16 14:20:03 UTC' },
    options: [
      { id: 'a', text: 'Doar boot-ul curent este păstrat: jurnalul nu este persistent.', correct: true, why: 'Boot-urile anterioare ar apărea cu indexuri negative (-1, -2…).' },
      { id: 'b', text: 'Jurnalul este persistent și are un singur boot, pentru că sistemul e nou.', correct: false, why: 'După cel puțin un reboot cu jurnal persistent ai vedea și boot-ul anterior.' },
      { id: 'c', text: 'Serviciul journald este oprit.', correct: false, why: 'Dacă ar fi oprit, nu ai primi nicio linie curentă.' },
      { id: 'd', text: 'Disk-ul este plin.', correct: false, why: 'Nu există un semn de acest fel în ieșire.' },
    ],
  },
  {
    id: 'L4.8-006', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a face jurnalul persistent și a confirma.',
    explanation: 'Creezi directorul, repornești serviciul, rulezi reboot și verifici boot-urile.',
    items: [
      { text: '`ls -ld /var/log/journal` (verifici dacă există deja)', why: 'Poate este deja persistent.' },
      { text: '`mkdir -p /var/log/journal`', why: 'Creezi directorul pe care journald îl folosește.' },
      { text: '`systemctl restart systemd-journald`', why: 'Journald schimbă locația stocării.' },
      { text: '`systemctl reboot`', why: 'Creezi un al doilea boot, ca să ai ce păstra.' },
      { text: '`journalctl --list-boots`', why: 'Confirmi că boot-ul anterior este păstrat.' },
    ],
  },
  {
    id: 'L4.8-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre jurnalul persistent sunt adevărate? (alege toate cele corecte)',
    explanation: 'Persistența mută jurnalul pe disc; limitele și curățarea sunt controlate.',
    options: [
      { id: 'a', text: 'Jurnalul persistent se află în `/var/log/journal`.', correct: true, why: 'Este pe disc, deci supraviețuiește reboot-ului.' },
      { id: 'b', text: '`SystemMaxUse=` din `journald.conf` limitează spațiul ocupat pe disc.', correct: true, why: 'Evită ca jurnalul să umple partiția.' },
      { id: 'c', text: '`journalctl --vacuum-size=200M` șterge jurnalele arhivate peste limită.', correct: true, why: 'Curățare manuală.' },
      { id: 'd', text: 'Jurnalul persistent este citit cu `less /var/log/journal/…`.', correct: false, why: 'Formatul este binar; se citește doar cu `journalctl`.' },
    ],
  },
  {
    id: 'L4.8-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește valoarea `Storage=` cu comportamentul ei.',
    explanation: 'Valoarea controlează unde se scrie jurnalul.',
    leftLabel: 'Valoare', rightLabel: 'Comportament',
    pairs: [
      { left: '`volatile`', right: 'doar în memorie, `/run/log/journal`', why: 'Se pierde la reboot.' },
      { left: '`persistent`', right: 'pe disc, `/var/log/journal`', why: 'Creează directorul dacă lipsește.' },
      { left: '`auto`', right: 'pe disc doar dacă `/var/log/journal` există', why: 'Altfel, volatil.' },
      { left: '`none`', right: 'nu păstrează nimic', why: 'Mesajele sunt aruncate.' },
    ],
    distractors: [{ text: 'trimite jurnalul pe e-mail', why: 'Nu există o asemenea valoare.' }],
  },
];
