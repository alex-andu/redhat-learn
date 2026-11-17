import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'systemd-service', abbr: 'serviciu (.service)', ro: 'o unitate systemd care descrie un program care rulează în fundal (daemon)',
    what: 'Un fișier sshd.service, chronyd.service etc. spune cum se pornește, se oprește și se supraveghează un program de lungă durată: ce comandă rulează (ExecStart=), sub ce utilizator, când se repornește.',
    how: 'systemd pornește procesul, îl urmărește (în propriul cgroup) și îi păstrează starea și mesajele în jurnal. Fișierele sunt în /usr/lib/systemd/system (pachete) și /etc/systemd/system (administrator).',
    where: 'Fiecare serviciu de rețea sau de sistem: sshd, chronyd, firewalld, NetworkManager, httpd.',
    topics: ['L4.9'], aliases: ['serviciu', 'daemon'],
  },
  {
    id: 'unit-active-enabled', abbr: 'active vs enabled', ro: 'două stări independente: „rulează acum” și „pornește la boot”',
    what: 'active = procesul rulează în acest moment. enabled = unitatea este legată de un target și va porni automat la boot. Un serviciu poate fi active dar disabled (pornit manual) sau enabled dar inactive (nu a pornit încă).',
    how: 'systemctl start/stop schimbă starea de acum; systemctl enable/disable schimbă comportamentul la următorul boot (creează sau șterge o legătură simbolică). enable --now face ambele.',
    where: 'Cerința de examen „pornește serviciul și fă-l să pornească la boot” înseamnă ambele: start și enable.',
    topics: ['L4.9'],
  },
  {
    id: 'masked-unit', abbr: 'mask', ro: 'blocarea completă a unei unități: nu poate fi pornită nici manual',
    what: 'systemctl mask leagă unitatea de /dev/null; orice încercare de start eșuează. unmask anulează blocarea.',
    how: 'Spre deosebire de disable (doar elimină pornirea la boot), mask împiedică și pornirea ca dependență a altei unități.',
    where: 'Serviciile care trebuie să nu pornească sub nicio formă (de exemplu conflict între două servicii).',
    topics: ['L4.9'],
  },
];
