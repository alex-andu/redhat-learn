import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'systemd-timer', abbr: 'timer systemd', ro: 'unitate .timer care pornește la momente programate o altă unitate (de obicei un .service)',
    what: 'Fișier cu extensia .timer (secțiuni [Unit], [Timer], [Install]) care declanșează unitatea cu același nume sau pe cea din Unit=.',
    how: 'Se creează perechea nume.service + nume.timer în /etc/systemd/system, apoi daemon-reload și enable --now nume.timer. Se urmărește cu systemctl list-timers și journalctl -u nume.service (systemd.timer(5)).',
    where: 'Alternativa systemd la cron: copii de siguranță, curățări, verificări periodice.',
    topics: ['L7.2'], aliases: ['.timer', 'timer unit', 'timers.target', 'list-timers'],
  },
  {
    id: 'on-calendar', abbr: 'OnCalendar', ro: 'directiva de timer care definește momente pe ceasul de perete (data și ora)',
    what: 'Expresie [zi-săptămână] [an-lună-zi] [oră:minut:secundă]; acceptă *, liste (,), intervale (..), pași (/N) și prescurtări (daily, weekly …).',
    how: 'Se validează cu systemd-analyze calendar, care afișează forma normalizată și următorul moment (systemd.time(7)). Părțile omise: dată *-*-*, oră 00:00:00.',
    where: 'OnCalendar=*-*-* 02:30:00 (zilnic la 02:30); OnCalendar=Mon..Fri 08:30; OnCalendar=*:0/15.',
    topics: ['L7.2'], aliases: ['systemd-analyze calendar', 'calendar event'],
  },
  {
    id: 'monotonic-timer', abbr: 'timer monoton', ro: 'timer măsurat față de un reper (boot, activare), nu față de data calendaristică',
    what: 'Directive: OnBootSec, OnStartupSec, OnActiveSec, OnUnitActiveSec, OnUnitInactiveSec; pot fi combinate.',
    how: 'OnBootSec=10min + OnUnitActiveSec=1h = prima rulare la 10 min după boot, apoi la fiecare oră de la ultima activare a serviciului (systemd.timer(5)).',
    where: 'Verificări periodice care nu trebuie să cadă la o oră fixă.',
    topics: ['L7.2'], aliases: ['OnBootSec', 'OnUnitActiveSec', 'OnActiveSec'],
  },
  {
    id: 'persistent-timer', abbr: 'Persistent=true', ro: 'opțiune care recuperează o rulare ratată cât mașina era oprită',
    what: 'Se aplică doar la OnCalendar; momentul ultimei declanșări se salvează pe disc, iar la activare se rulează o singură dată dacă s-a ratat un moment.',
    how: 'Implicit false. RandomizedDelaySec= se aplică și recuperării. systemctl clean --what=state șterge marcajul salvat (systemd.timer(5)).',
    where: 'Laptopuri/mașini oprite noaptea, copii de siguranță care nu trebuie sărite.',
    topics: ['L7.2'], aliases: ['Persistent', 'RandomizedDelaySec', 'AccuracySec'],
  },
];
