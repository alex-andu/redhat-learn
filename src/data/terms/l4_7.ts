import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'journal', abbr: 'journal (systemd-journald)', ro: 'jurnalul binar al sistemului, ținut de systemd-journald',
    what: 'Colectează mesajele kernelului, ale serviciilor și ale boot-ului într-un format indexat, care se interoghează cu journalctl (după serviciu, prioritate, timp, boot).',
    how: 'Serviciul systemd-journald primește mesajele și le stochează fie doar în memorie (/run/log/journal, se pierd la reboot), fie pe disc (/var/log/journal, persistent, L4.8).',
    where: 'Prima sursă când un serviciu nu pornește sau o configurare nu are efectul dorit.',
    topics: ['L4.7', 'L4.8'], aliases: ['jurnal', 'journald'],
  },
  {
    id: 'journalctl', abbr: 'journalctl', ro: 'comanda care citește jurnalul systemd',
    what: 'Afișează intrările din jurnal; opțiunile filtrează după boot (-b), serviciu (-u), prioritate (-p), interval de timp (--since, --until) și urmăresc live (-f).',
    how: 'Interoghează baza de date binară a lui systemd-journald; fără opțiuni listează tot, cu cele mai vechi primele, într-un pager (less).',
    where: 'Depanarea serviciilor, a boot-ului și a autentificărilor.',
    topics: ['L4.7', 'L4.8'],
  },
  {
    id: 'rsyslog', abbr: 'rsyslog', ro: 'serviciul de logare care scrie mesaje text în /var/log',
    what: 'Primește mesaje (syslog) și le scrie în fișiere text după reguli (de exemplu /var/log/messages, /var/log/secure), local sau către un server de log.',
    how: 'Configurația este în /etc/rsyslog.conf și /etc/rsyslog.d/; regulile asociază facility.priority cu o destinație. Fișierele sunt rotite de logrotate.',
    where: 'Fișiere text ușor de citit cu less, grep și tail; arhivare centralizată.',
    topics: ['L4.7'],
  },
  {
    id: 'log-priority', abbr: 'prioritate syslog', ro: 'nivelul de gravitate al unui mesaj (0–7)',
    what: 'Opt niveluri: 0 emerg, 1 alert, 2 crit, 3 err, 4 warning, 5 notice, 6 info, 7 debug. Un număr mai mic înseamnă mai grav.',
    how: 'journalctl -p err arată mesajele de nivel err și mai grave (err, crit, alert, emerg).',
    where: 'Filtrarea zgomotului: ceri doar erorile.',
    topics: ['L4.7'], aliases: ['prioritate'],
  },
];
