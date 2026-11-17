import type { Question } from '../../lib/types';

const T = 'L4.9';
const O = ['C4-9', 'C7-2', 'C8-3'];

export const Q_L4_9: Question[] = [
  {
    id: 'L4.9-001', topicId: T, objectives: ['C7-2'], difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre un serviciu „active” și unul „enabled”?',
    explanation: '`active` = rulează acum; `enabled` = pornește la boot. Sunt stări independente.',
    options: [
      { id: 'a', text: '`active` înseamnă că rulează acum; `enabled` înseamnă că va porni automat la boot.', correct: true, why: 'Le schimbi separat: `start`/`stop` pentru acum, `enable`/`disable` pentru boot.' },
      { id: 'b', text: 'Sunt sinonime.', correct: false, why: 'Un serviciu poate fi pornit manual fără a fi enabled, și invers.' },
      { id: 'c', text: '`enabled` înseamnă că rulează acum; `active` că pornește la boot.', correct: false, why: 'Este exact invers.' },
      { id: 'd', text: '`active` este pentru servicii de rețea, `enabled` pentru cele locale.', correct: false, why: 'Nu există o asemenea distincție.' },
    ],
  },
  {
    id: 'L4.9-002', topicId: T, objectives: ['C7-2', 'C8-3'], difficulty: 2, type: 'cli',
    stem: 'Pornește acum serviciul `chronyd` ȘI configurează-l să pornească la boot, într-o singură comandă.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl enable --now chronyd', 'systemctl enable --now chronyd.service', 'systemctl --now enable chronyd', 'systemctl enable chronyd --now'],
    canonical: 'systemctl enable --now chronyd',
    explanation: '`enable --now` combină `enable` (la boot) cu `start` (acum).',
    wrong: [
      { text: 'systemctl start chronyd', why: 'Pornește doar acum; după reboot nu mai pornește.' },
      { text: 'systemctl enable chronyd', why: 'Configurează pornirea la boot, dar nu îl pornește acum.' },
      { text: 'systemctl restart chronyd', why: 'Repornește serviciul acum; nu configurează boot-ul.' },
    ],
  },
  {
    id: 'L4.9-003', topicId: T, objectives: ['C4-9'], difficulty: 2, type: 'cli',
    stem: 'Afișează starea detaliată a serviciului `sshd`.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl status sshd', 'systemctl status sshd.service'],
    canonical: 'systemctl status sshd',
    explanation: '`status` arată dacă rulează, dacă este enabled, PID-ul și ultimele linii de jurnal.',
    wrong: [
      { text: 'systemctl is-active sshd', why: 'Răspunde doar cu `active`/`inactive`, fără detalii.' },
      { text: 'systemctl list-units sshd', why: '`list-units` listează unități; nu afișează starea detaliată.' },
      { text: 'service sshd', why: 'Lipsește acțiunea, iar `systemctl` este instrumentul din lecție.' },
    ],
  },
  {
    id: 'L4.9-004', topicId: T, objectives: ['C4-9'], difficulty: 2, type: 'single',
    stem: 'Ce îți spune această ieșire despre serviciul `sshd`?',
    explanation: '`active (running)` = rulează acum; `enabled` în linia „Loaded” = pornește la boot.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# systemctl status sshd\n● sshd.service - OpenSSH server daemon\n     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled; preset: enabled)\n     Active: active (running) since Mon 2026-11-16 08:12:30 UTC; 6h ago\n   Main PID: 812 (sshd)' },
    options: [
      { id: 'a', text: 'Rulează acum (PID 812) și va porni automat la boot.', correct: true, why: '`Active: active (running)` și `enabled` în linia Loaded.' },
      { id: 'b', text: 'Rulează acum, dar NU va porni la boot.', correct: false, why: 'Linia Loaded spune `enabled`.' },
      { id: 'c', text: 'Este oprit și blocat (masked).', correct: false, why: 'Un serviciu blocat ar afișa `masked`.' },
      { id: 'd', text: 'A eșuat la pornire.', correct: false, why: 'Starea eșuată ar fi `failed`.' },
    ],
  },
  {
    id: 'L4.9-005', topicId: T, objectives: ['C7-2'], difficulty: 2, type: 'single',
    stem: 'Ai editat un fișier de unitate în `/etc/systemd/system/`. Ce faci înainte de a reporni serviciul?',
    explanation: 'După modificarea fișierelor de unitate, `systemctl daemon-reload` face ca systemd să le recitească.',
    options: [
      { id: 'a', text: '`systemctl daemon-reload`', correct: true, why: 'Altfel systemd folosește vechea definiție.' },
      { id: 'b', text: '`systemctl isolate multi-user.target`', correct: false, why: 'Nu are legătură cu recitirea unităților.' },
      { id: 'c', text: '`systemctl mask NUME`', correct: false, why: 'Ar bloca serviciul.' },
      { id: 'd', text: 'Nimic: systemd detectează singur modificările.', correct: false, why: 'Trebuie `daemon-reload` (systemd poate avertiza că unitatea s-a schimbat pe disc).' },
    ],
  },
  {
    id: 'L4.9-006', topicId: T, objectives: ['C7-2'], difficulty: 3, type: 'single',
    stem: 'Un serviciu pornește singur ca dependență a altuia, deși ai rulat `disable`. Ce comandă îl împiedică complet să pornească?',
    explanation: '`disable` doar elimină pornirea la boot; `mask` blochează și pornirea manuală sau ca dependență.',
    options: [
      { id: 'a', text: '`systemctl mask NUME`', correct: true, why: 'Leagă unitatea de `/dev/null`; nu mai poate fi pornită.' },
      { id: 'b', text: '`systemctl disable NUME` încă o dată.', correct: false, why: 'Rezultatul nu se schimbă; unitatea poate porni oricum ca dependență.' },
      { id: 'c', text: '`systemctl stop NUME`', correct: false, why: 'Oprește doar acum.' },
      { id: 'd', text: '`systemctl reload NUME`', correct: false, why: 'Reîncarcă configurația unui serviciu care rulează.' },
    ],
  },
  {
    id: 'L4.9-007', topicId: T, objectives: ['C4-9'], difficulty: 3, type: 'single',
    stem: 'Serviciul nu pornește. Care este prima ta mișcare?',
    explanation: 'După `failed`, primul pas este să citești de ce: `systemctl status` și `journalctl -u`.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[root@server1 ~]# systemctl start httpd\nJob for httpd.service failed because the control process exited with error code.\nSee "systemctl status httpd.service" and "journalctl -xeu httpd.service" for details.' },
    options: [
      { id: 'a', text: 'Rulezi `systemctl status httpd` și `journalctl -u httpd -b` ca să citești eroarea.', correct: true, why: 'Mesajul chiar îți recomandă aceste comenzi; cauza este în jurnal.' },
      { id: 'b', text: 'Repornești sistemul.', correct: false, why: 'Un reboot nu rezolvă cauza (de obicei o eroare de configurare).' },
      { id: 'c', text: 'Rulezi `systemctl mask httpd`.', correct: false, why: 'Ar bloca serviciul în loc să-l repare.' },
      { id: 'd', text: 'Repeți `systemctl start httpd` până reușește.', correct: false, why: 'Cauza nu dispare singură.' },
    ],
  },
  {
    id: 'L4.9-008', topicId: T, objectives: ['C7-2', 'C8-3'], difficulty: 2, type: 'multi',
    stem: 'Care comenzi te ajută să verifici dacă un serviciu este configurat să pornească la boot? (alege toate cele corecte)',
    explanation: '`is-enabled` și `status` (linia Loaded) arată starea; `list-unit-files` o listează pentru toate.',
    options: [
      { id: 'a', text: '`systemctl is-enabled NUME`', correct: true, why: 'Răspunde `enabled`, `disabled`, `masked`, `static`.' },
      { id: 'b', text: '`systemctl status NUME`', correct: true, why: 'Linia `Loaded:` conține `enabled` sau `disabled`.' },
      { id: 'c', text: '`systemctl list-unit-files --type=service`', correct: true, why: 'Listează STATE pentru toate serviciile.' },
      { id: 'd', text: '`systemctl is-active NUME`', correct: false, why: 'Arată doar dacă rulează acum, nu dacă va porni la boot.' },
    ],
  },
  {
    id: 'L4.9-009', topicId: T, objectives: ['C4-9'], difficulty: 2, type: 'match',
    stem: 'Potrivește acțiunea `systemctl` cu efectul ei.',
    explanation: 'Fiecare acțiune acționează fie pe starea curentă, fie pe boot, fie pe configurație.',
    leftLabel: 'Acțiune', rightLabel: 'Efect',
    pairs: [
      { left: '`restart`', right: 'oprește și pornește serviciul', why: 'Procesul primește PID nou.' },
      { left: '`reload`', right: 'reîncarcă configurația fără oprire (dacă serviciul suportă)', why: 'Conexiunile nu se întrerup.' },
      { left: '`disable`', right: 'elimină pornirea la boot', why: 'Nu oprește serviciul care rulează.' },
      { left: '`mask`', right: 'blochează complet pornirea', why: 'Nici manual, nici ca dependență.' },
    ],
    distractors: [{ text: 'șterge pachetul serviciului', why: 'Eliminarea pachetelor se face cu dnf (C2).' }],
  },
  {
    id: 'L4.9-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii: serviciul `sshd` trebuie să ruleze acum și după fiecare reboot, apoi confirmi.',
    explanation: 'Verifici starea, activezi, pornești, confirmi, apoi testezi după reboot.',
    items: [
      { text: '`systemctl status sshd`', why: 'Vezi starea inițială.' },
      { text: '`systemctl enable --now sshd`', why: 'Pornește acum și la boot.' },
      { text: '`systemctl is-active sshd; systemctl is-enabled sshd`', why: 'Confirmi cele două stări.' },
      { text: '`systemctl reboot`', why: 'Testul real al persistenței.' },
      { text: '`systemctl is-active sshd`', why: 'După boot trebuie să fie tot active.' },
    ],
  },
  {
    id: 'L4.9-011', topicId: T, objectives: ['C8-3'], difficulty: 2, type: 'single',
    stem: 'Serviciul `sshd` rulează, dar un coleg nu se poate conecta de la altă mașină (timeout). Ce explică cel mai bine situația din această lecție?',
    explanation: 'Un serviciu de rețea trebuie să ruleze ȘI să fie permis de firewall. Starea `active` nu garantează accesibilitatea de la distanță.',
    options: [
      { id: 'a', text: 'Serviciul rulează, dar firewall-ul poate bloca portul; se verifică separat (C8).', correct: true, why: '`active` înseamnă doar că procesul rulează local.' },
      { id: 'b', text: 'Serviciul nu rulează de fapt.', correct: false, why: 'Premisa spune că rulează.' },
      { id: 'c', text: 'Trebuie `systemctl mask sshd`.', correct: false, why: 'Mask îl blochează.' },
      { id: 'd', text: 'Trebuie `daemon-reload`.', correct: false, why: 'Nu are legătură cu accesibilitatea de rețea.' },
    ],
  },
];
