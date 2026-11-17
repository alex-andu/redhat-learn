import type { Lab } from '../../lab/types';

export const LAB_L4_1: Lab = {
  id: 'lab-l4-1-reboot-shutdown',
  lessonId: 'L4.1',
  title: 'Reboot și shutdown controlate, cu programare și anulare',
  modes: ['guided', 'independent'],
  objectives: ['C4-1'],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Pe o mașină de test (VM proprie, nu un server de producție) trebuie să: (1) afli de când rulează sistemul; (2) programezi o repornire peste 10 minute cu un mesaj pentru utilizatori și o anulezi; (3) repornești sistemul imediat, ordonat; (4) după repornire confirmi că reboot-ul a avut loc.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) cu systemd, la care ai acces ca root sau prin `sudo`.',
    'Mașină de test: poate fi repornită fără consecințe. Nu rula pașii de reboot pe un sistem important.',
  ],
  finalState: [
    'Programarea a fost anulată, sistemul a fost repornit o dată cu `systemctl reboot`, iar momentul noii porniri este vizibil în `who -b` și `last -x reboot`.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai notat ora ultimei porniri înainte de reboot.', manualCheck: 'who -b; uptime -p' },
    { id: 'ac2', text: 'O repornire programată peste 10 minute a fost creată și apoi anulată (nu mai există programare).', manualCheck: 'shutdown -c; ls /run/nologin' },
    { id: 'ac3', text: 'Sistemul a fost repornit cu `systemctl reboot`.', manualCheck: 'last -x reboot | head -3' },
    { id: 'ac4', text: 'Ora de boot de după reboot este mai recentă decât cea notată la început.', manualCheck: 'who -b' },
    { id: 'ac5', text: 'systemd raportează starea sistemului după pornire.', manualCheck: 'systemctl is-system-running' },
  ],
  steps: [
    {
      title: 'Notează starea înainte',
      purpose: 'Ai nevoie de un punct de comparație: ca să dovedești că un reboot a avut loc, trebuie să știi de când rula sistemul înainte.',
      hint: '`who -b` afișează momentul pornirii; `uptime -p` afișează durata de funcționare, pe înțelesul omului.',
      commands: 'who -b\nuptime -p\nuptime',
      explain: [
        ['who -b', '`who` afișează utilizatorii conectați; `-b` (boot) afișează doar data și ora ultimei porniri a sistemului.'],
        ['uptime -p', '`-p` (pretty) scrie durata în cuvinte: „up 2 hours, 5 minutes”.'],
        ['uptime', 'o singură linie: ora curentă, durata de funcționare, utilizatori, încărcare medie (load average).'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ who -b\n         system boot  2026-11-16 08:12\n[student@server1 ~]$ uptime -p\nup 3 hours, 41 minutes', explain: 'Prima linie este momentul ultimei porniri; a doua, cât timp a trecut. Valorile sunt exemple.' },
    },
    {
      title: 'Programează o repornire și anuleaz-o',
      purpose: 'Exersezi `shutdown` cu timp și mesaj, apoi `-c`, fără să întrerupi sistemul.',
      hint: 'Formele de timp: `now`, `+minute`, `hh:mm`. Mesajul se pune între ghilimele.',
      commands: 'sudo shutdown -r +10 "Test: reboot peste 10 minute"\nsudo shutdown -c\nls /run/nologin',
      explain: [
        ['shutdown -r +10 "…"', '`-r` = reboot; `+10` = peste 10 minute; textul din ghilimele este trimis utilizatorilor conectați (wall).'],
        ['shutdown -c', '`-c` (cancel) anulează programarea în curs.'],
        ['ls /run/nologin', 'fișierul apare doar când oprirea e iminentă (≤5 minute). După anulare sau la +10 nu trebuie să existe: `No such file or directory` este rezultatul dorit.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo shutdown -r +10 "Test: reboot peste 10 minute"\nShutdown scheduled for Mon 2026-11-16 15:40:00 UTC, use \'shutdown -c\' to cancel.\n[student@server1 ~]$ sudo shutdown -c\n[student@server1 ~]$ ls /run/nologin\nls: cannot access \'/run/nologin\': No such file or directory', explain: 'Prima linie confirmă programarea și arată ora la care se va întâmpla. După `-c`, nu mai există programare și nici fișierul `/run/nologin`. Formularea exactă a mesajului poate diferi.' },
      reflect: 'Ce s-ar fi întâmplat cu conectările noi dacă ai fi programat peste 3 minute în loc de 10?',
    },
    {
      title: 'Repornește ordonat',
      purpose: 'Folosești comanda standard pentru reboot imediat.',
      hint: 'Sesiunea SSH (dacă ești conectat remote) se va întrerupe: este normal.',
      commands: 'sudo systemctl reboot',
      explain: [
        ['systemctl reboot', 'cere lui systemd o repornire ordonată: oprește serviciile, demontează sistemele de fișiere, apoi repornește kernelul. Echivalent cu `reboot`.'],
      ],
    },
    {
      title: 'Confirmă reboot-ul',
      purpose: 'Un reboot se dovedește prin comparație cu starea anterioară, nu prin presupunere.',
      hint: 'Reconectează-te după ce sistemul a pornit. `uptime -p` trebuie să arate un timp scurt.',
      commands: 'who -b\nuptime -p\nlast -x reboot shutdown | head -5\nsystemctl is-system-running',
      explain: [
        ['who -b', 'ora de boot trebuie să fie mai recentă decât cea notată la Pasul 1.'],
        ['last -x reboot shutdown', '`-x` include evenimentele de sistem; filtrăm pe `reboot` și `shutdown`. Fiecare reboot are o linie.'],
        ['systemctl is-system-running', 'afișează `running` când toate unitățile au pornit; `degraded` dacă unele au eșuat (L4.9).'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ who -b\n         system boot  2026-11-16 15:46\n[student@server1 ~]$ uptime -p\nup 2 minutes\n[student@server1 ~]$ last -x reboot shutdown | head -3\nshutdown system down  5.14.0-xyz.el10 Mon Nov 16 15:45 - 15:46  (00:00)\nreboot   system boot  5.14.0-xyz.el10 Mon Nov 16 15:46   still running\n[student@server1 ~]$ systemctl is-system-running\nrunning', explain: 'Linia `shutdown` marchează oprirea, `reboot` noua pornire. Versiunea kernelului și orele sunt exemple construite.' },
    },
  ],
  verification: [
    { cmd: 'who -b', expected: 'ora este mai recentă decât cea notată înainte de reboot' },
    { cmd: 'last -x reboot | head -2', expected: 'o linie `reboot` nouă, cu „still running”' },
    { cmd: 'ls /run/nologin', expected: '`No such file or directory`' },
    { cmd: 'systemctl is-system-running', expected: '`running` (sau `degraded` dacă există unități eșuate, de investigat în L4.9)' },
  ],
  persistence: [
    'O programare `shutdown` trăiește în memoria systemd-logind: dispare la reboot sau la anulare; nu este o setare persistentă.',
    'Nu există configurare de păstrat în acest laborator; „persistența” este chiar dovada reboot-ului (`last -x reboot`).',
  ],
  mistakes: [
    'Confuzia `-h` (oprire) cu `-r` (repornire).',
    'Uitarea ghilimelelor la mesaj: cuvintele devin argumente separate.',
    'Rularea comenzilor de reboot pe un sistem important sau pe sesiunea greșită (SSH către altă gazdă).',
    'Folosirea lui `systemctl restart` (unitate) în loc de `systemctl reboot` (sistem).',
  ],
  troubleshooting: [
    { symptom: '`Failed to … Interactive authentication required`', cause: 'rulezi ca utilizator obișnuit fără drepturi', fix: 'folosește `sudo` sau lucrează ca root (L1.10).' },
    { symptom: 'după `shutdown -r +2` nu te mai poți conecta ca utilizator obișnuit', cause: '`/run/nologin` creat pentru ≤5 minute', fix: '`shutdown -c` sau conectează-te ca root.' },
    { symptom: '`who -b` nu arată nimic', cause: 'unele medii minimale nu mențin evidența utmp', fix: 'folosește `uptime -s` sau `journalctl --list-boots`.' },
  ],
  alternatives: [
    'Poți folosi `reboot` în loc de `systemctl reboot`, sau `shutdown -r now`.',
    'Pentru a găsi ora pornirii: `uptime -s` (formă ISO) sau `journalctl --list-boots`.',
    'Pentru oprire completă: `systemctl poweroff`, `poweroff` sau `shutdown -P now`.',
  ],
};
