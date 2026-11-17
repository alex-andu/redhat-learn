import type { Lab } from '../../lab/types';

export const LAB_L4_9: Lab = {
  id: 'lab-l4-9-servicii',
  lessonId: 'L4.9',
  title: 'Pornește, oprește și activează la boot un serviciu de rețea',
  modes: ['guided', 'independent'],
  objectives: ['C4-9', 'C7-2', 'C8-3'],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Serviciul de sincronizare a timpului `chronyd` (sau `sshd`, dacă preferi) trebuie să ruleze acum și să pornească automat la fiecare boot. Verifică-i starea, oprește-l și dezactivează-l ca să observi diferența între „active” și „enabled”, apoi repornește-l și activează-l cu o singură comandă, repornește sistemul și confirmă.',
    'La final, blochează un serviciu secundar de test cu `mask`, observă că nu mai poate fi pornit și deblochează-l.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, cu acces root/sudo, pe care poți opri temporar serviciul ales.',
    'Alege un serviciu inofensiv și prezent; exemplele folosesc `chronyd`. NU opri `sshd` dacă ești conectat prin SSH.',
    'Pentru partea cu `mask`, folosește un serviciu fără impact (de exemplu `cups` sau `bluetooth`, dacă există) sau un serviciu creat de tine în pasul opțional.',
  ],
  finalState: [
    'Serviciul ales este `active (running)` și `enabled` după reboot.',
    'Serviciul de test blocat cu `mask` a fost deblocat la final.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai citit starea serviciului cu `systemctl status` și `is-active`/`is-enabled`.', manualCheck: 'systemctl status chronyd; systemctl is-active chronyd; systemctl is-enabled chronyd' },
    { id: 'ac2', text: 'Ai oprit serviciul și ai observat `inactive`, dar `enabled`.', manualCheck: 'systemctl is-active chronyd; systemctl is-enabled chronyd' },
    { id: 'ac3', text: 'Ai dezactivat serviciul și ai observat `disabled`.', manualCheck: 'systemctl is-enabled chronyd' },
    { id: 'ac4', text: 'Serviciul este pornit și activat cu `enable --now`.', manualCheck: 'systemctl is-active chronyd; systemctl is-enabled chronyd' },
    { id: 'ac5', text: 'După reboot, serviciul este `active` și `enabled`.', manualCheck: 'systemctl is-active chronyd; systemctl is-enabled chronyd' },
    { id: 'ac6', text: 'Un serviciu blocat cu `mask` nu poate fi pornit, apoi a fost deblocat.', manualCheck: 'systemctl start NUME; systemctl is-enabled NUME; systemctl unmask NUME' },
  ],
  steps: [
    {
      title: 'Citește starea serviciului',
      purpose: 'Începi de la ce există, nu de la presupuneri.',
      hint: 'Dacă pachetul lipsește, `systemctl status` răspunde „Unit … could not be found”.',
      commands: 'systemctl status chronyd\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd\nsystemctl list-unit-files --type=service | grep chronyd',
      explain: [
        ['systemctl status chronyd', 'starea completă: Loaded (cale, enabled/disabled), Active (running/dead/failed), PID principal, ultimele linii de jurnal.'],
        ['is-active', 'răspunde `active`/`inactive`/`failed` și întoarce 0 dacă este activ (util în scripturi).'],
        ['is-enabled', 'răspunde `enabled`/`disabled`/`masked`/`static`.'],
        ['list-unit-files --type=service | grep', 'listează fișierele de serviciu și starea lor, filtrate cu grep (L1.6).'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl status chronyd\n● chronyd.service - NTP client/server\n     Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; preset: enabled)\n     Active: active (running) since Mon 2026-11-16 08:12:31 UTC; 6h ago\n   Main PID: 745 (chronyd)\n[root@server1 ~]# systemctl is-active chronyd; systemctl is-enabled chronyd\nactive\nenabled', explain: 'Punctul verde arată un serviciu activ. `Loaded` conține calea fișierului de unitate și starea de boot (`enabled`). `Active` arată starea curentă. Descrierea și textul exact depind de versiune.' },
    },
    {
      title: 'Oprește serviciul: active ≠ enabled',
      purpose: 'Vezi că oprirea nu schimbă pornirea la boot.',
      hint: 'După `stop`, serviciul este inactive, dar încă enabled.',
      commands: 'systemctl stop chronyd\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd',
      explain: [
        ['systemctl stop chronyd', 'trimite semnalul de oprire; procesul se închide (SIGTERM, L4.4).'],
        ['is-active', 'acum `inactive`.'],
        ['is-enabled', 'tot `enabled`: la următorul boot va porni din nou.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl stop chronyd\n[root@server1 ~]# systemctl is-active chronyd\ninactive\n[root@server1 ~]# systemctl is-enabled chronyd\nenabled', explain: 'Cele două stări sunt independente: `stop` a schimbat „acum”, nu „la boot”.' },
      reflect: 'Dacă acum ai reporni sistemul, ar rula serviciul? De ce?',
    },
    {
      title: 'Dezactivează la boot, apoi pornește fără enable',
      purpose: 'Vezi cealaltă jumătate: pornit manual, dar neactivat.',
      hint: '`disable` elimină legătura de boot; `start` pornește doar acum.',
      commands: 'systemctl disable chronyd\nsystemctl start chronyd\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd',
      explain: [
        ['systemctl disable chronyd', 'elimină legătura simbolică din directorul `.wants` al target-ului; nu oprește serviciul care rulează.'],
        ['systemctl start chronyd', 'pornește acum.'],
        ['rezultat', '`active` și `disabled`: ar dispărea la reboot.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl disable chronyd\nRemoved "/etc/systemd/system/multi-user.target.wants/chronyd.service".\n[root@server1 ~]# systemctl start chronyd\n[root@server1 ~]# systemctl is-active chronyd; systemctl is-enabled chronyd\nactive\ndisabled', explain: 'Mesajul `Removed` arată legătura ștearsă din `multi-user.target.wants/`. Calea exactă poate diferi între servicii.' },
    },
    {
      title: 'Activează și pornește într-o singură comandă',
      purpose: 'Aceasta este cerința tipică de examen.',
      hint: '`--now` combină `enable` cu `start`.',
      commands: 'systemctl enable --now chronyd\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd\nls -l /etc/systemd/system/multi-user.target.wants/ | grep chronyd',
      explain: [
        ['enable --now', 'creează legătura de boot și pornește imediat.'],
        ['ls -l …/multi-user.target.wants/', 'arată legătura simbolică creată; asta înseamnă „enabled”.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl enable --now chronyd\nCreated symlink /etc/systemd/system/multi-user.target.wants/chronyd.service → /usr/lib/systemd/system/chronyd.service.\n[root@server1 ~]# systemctl is-active chronyd; systemctl is-enabled chronyd\nactive\nenabled', explain: 'Mesajul `Created symlink` confirmă activarea. Dacă serviciul era deja enabled, mesajul poate lipsi.' },
    },
    {
      title: 'Repornește sistemul și confirmă',
      purpose: 'Persistența se dovedește doar după reboot.',
      hint: 'După boot, serviciul trebuie să fie `active` și `enabled` fără să fi rulat nimic manual.',
      commands: 'systemctl reboot\n# după reconectare:\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd\nsystemctl status chronyd | head -5',
      explain: [
        ['systemctl reboot', 'repornește (L4.1).'],
        ['is-active / is-enabled', 'ambele trebuie să fie pozitive.'],
      ],
    },
    {
      title: 'Blochează și deblochează cu mask',
      purpose: 'Înțelegi diferența dintre disable și mask.',
      hint: 'Folosește un serviciu cu impact zero în laborator (de ex. `cups`), sau sari peste pas dacă nu ai unul.',
      commands: 'systemctl mask cups\nsystemctl start cups\nsystemctl is-enabled cups\nsystemctl unmask cups\nsystemctl is-enabled cups',
      explain: [
        ['systemctl mask cups', 'leagă unitatea de /dev/null: nu mai poate fi pornită.'],
        ['systemctl start cups', 'eșuează cu un mesaj despre unitatea blocată (masked).'],
        ['systemctl unmask cups', 'anulează blocarea.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl mask cups\nCreated symlink /etc/systemd/system/cups.service → /dev/null.\n[root@server1 ~]# systemctl start cups\nFailed to start cups.service: Unit cups.service is masked.\n[root@server1 ~]# systemctl unmask cups\nRemoved "/etc/systemd/system/cups.service".', explain: 'Legătura către /dev/null este exact mecanismul `mask`. Dacă serviciul nu există pe sistem, mesajele vor fi diferite.' },
    },
  ],
  verification: [
    { cmd: 'systemctl is-active chronyd', expected: '`active`' },
    { cmd: 'systemctl is-enabled chronyd', expected: '`enabled`' },
    { cmd: 'ls -l /etc/systemd/system/multi-user.target.wants/ | grep chronyd', expected: 'legătură simbolică către unitatea chronyd.service' },
    { cmd: 'systemctl --failed', expected: 'fără unități eșuate care să țină de acest laborator' },
  ],
  persistence: [
    '`enable` creează o legătură simbolică în `/etc/systemd/system/<target>.wants/`: persistă pe disc și face serviciul să pornească la boot.',
    '`start`/`stop` sunt temporare: afectează doar sesiunea curentă a sistemului.',
    'Confirmare manuală: reboot, apoi `is-active` și `is-enabled`.',
  ],
  mistakes: [
    'Rularea doar a lui `start` (serviciul dispare la reboot) sau doar a lui `enable` (nu rulează acum).',
    'Confuzia `reload` cu `restart`.',
    'Oprirea lui `sshd` în timp ce ești conectat prin SSH.',
    'Neverificarea după reboot.',
    'Folosirea `disable` când ai nevoie de `mask`.',
  ],
  troubleshooting: [
    { symptom: '`Unit … could not be found`', cause: 'pachetul nu este instalat sau numele este greșit', fix: '`dnf install …` (L2.2); `systemctl list-unit-files --type=service`.' },
    { symptom: '`Job for … failed`', cause: 'eroare de configurare sau de dependență', fix: '`systemctl status NUME`, `journalctl -u NUME -b` (L4.7).' },
    { symptom: 'serviciul rulează, dar nu este accesibil din rețea', cause: 'firewall sau configurare de ascultare', fix: 'verifică firewall-ul și portul (C8); aici doar menționat.' },
    { symptom: 'serviciul nu pornește după reboot', cause: 'nu este enabled sau este disabled', fix: '`systemctl enable NUME`.' },
  ],
  alternatives: [
    'Poți rula `systemctl enable chronyd` și `systemctl start chronyd` separat în loc de `enable --now`.',
    'Pentru dezactivare și oprire: `systemctl disable --now NUME`.',
    '`systemctl reload` în loc de `restart`, dacă serviciul suportă reîncărcarea configurației.',
  ],
};
