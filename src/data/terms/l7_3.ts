import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'ntp', abbr: 'NTP', full: 'Network Time Protocol', ro: 'protocolul prin care un client își sincronizează ceasul cu servere de timp',
    what: 'Clientul întreabă un server de timp și, din timpul dus-întors al mesajelor, estimează decalajul ceasului propriu față de al serverului.',
    how: 'Rulează peste UDP, portul 123; serverele sunt organizate pe niveluri (stratum). Clientul compară mai multe surse și ignoră pe cele inconsistente (falseticker).',
    where: 'Corelarea logurilor, certificate TLS, Kerberos, cron/timere, sisteme distribuite.',
    topics: ['L7.3'], aliases: ['sincronizare de timp', 'time service'],
  },
  {
    id: 'chrony', abbr: 'chrony', ro: 'implementarea NTP din RHEL: daemonul chronyd și utilitarul chronyc',
    what: 'chronyd menține ceasul sistemului sincronizat cu surse NTP; chronyc interoghează și controlează daemonul (sources, tracking, makestep).',
    how: 'Configurația este în /etc/chrony.conf (server, pool, makestep, driftfile, rtcsync). Se activează cu systemctl enable --now chronyd; după editarea fișierului: systemctl restart chronyd.',
    where: 'Orice server sau stație RHEL; la examen: configurarea unui client către un server dat.',
    topics: ['L7.3'], aliases: ['chronyd', 'chronyc', '/etc/chrony.conf', 'chrony.conf'],
  },
  {
    id: 'stratum', abbr: 'stratum', ro: 'nivelul unui server de timp față de sursa de referință',
    what: 'Stratum 0 = sursă fizică (ceas atomic, GPS); stratum 1 = server conectat direct la ea; fiecare nivel următor are numărul cu 1 mai mare.',
    how: 'Clientul sincronizat cu un server stratum 2 devine stratum 3 (chronyc tracking afișează Stratum).',
    where: 'chronyc sources (coloana Stratum), chronyc tracking.',
    topics: ['L7.3'], aliases: ['NTP stratum'],
  },
  {
    id: 'clock-slew-step', abbr: 'slew / step', ro: 'cele două moduri de corectare a ceasului: ajustare lină sau salt',
    what: 'Slew = accelerezi/încetinești ușor ceasul până recuperează decalajul (timp continuu); step = setezi direct ora nouă (poate deranja programele sensibile la timp).',
    how: 'chrony face slew în mod normal; directiva makestep prag limită permite step doar în primele „limită” actualizări. chronyc makestep sare imediat.',
    where: 'Decalaje mari după pornire (VM-uri); makestep 1.0 3 în configurația uzuală.',
    topics: ['L7.3'], aliases: ['makestep', 'slewing', 'stepping'],
  },
  {
    id: 'rtc', abbr: 'RTC', full: 'real-time clock', ro: 'ceasul hardware care ține ora când calculatorul este oprit',
    what: 'Cip cu baterie pe placa de bază; la boot kernelul îl citește pentru a porni ceasul sistemului.',
    how: 'Se recomandă să țină UTC (timedatectl status: „RTC in local TZ: no”). Cu rtcsync, kernelul îl actualizează periodic din ceasul sistemului.',
    where: 'timedatectl status (RTC time), hwclock.',
    topics: ['L7.3'], aliases: ['ceas hardware', 'hwclock'],
  },
  {
    id: 'utc', abbr: 'UTC', full: 'Coordinated Universal Time', ro: 'ora universală, fără fus orar și fără ora de vară',
    what: 'Referința comună de timp; fusurile orare sunt decalaje față de UTC (ex. Europe/Bucharest = +0200/+0300).',
    how: 'Sistemul ține ceasul intern în UTC și aplică fusul orar doar la afișare (timedatectl set-timezone). date -u afișează UTC.',
    where: 'Loguri pe servere din fusuri diferite, ceasul RTC.',
    topics: ['L7.3'], aliases: ['ora universală', 'time zone', 'fus orar'],
  },
  {
    id: 'timedatectl', abbr: 'timedatectl', ro: 'comanda systemd pentru ora, fusul orar și activarea sincronizării NTP',
    what: 'status (implicit), set-timezone, list-timezones, set-ntp true|false, set-time, set-local-rtc (timedatectl(1)).',
    how: 'status arată Local time, Universal time, RTC time, Time zone, System clock synchronized, NTP service. set-ntp activează/oprește serviciul NTP; set-time este refuzat de obicei cât NTP e activ.',
    where: 'Prima comandă pentru a vedea dacă ora și fusul sunt corecte.',
    topics: ['L7.3'], aliases: ['timedatectl status', 'set-timezone', 'set-ntp'],
  },
];
