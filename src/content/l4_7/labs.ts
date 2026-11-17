import type { Lab } from '../../lab/types';

export const LAB_L4_7: Lab = {
  id: 'lab-l4-7-loguri-journal',
  lessonId: 'L4.7',
  title: 'Localizează și interpretează mesaje în jurnal și în /var/log',
  modes: ['guided', 'independent'],
  objectives: ['C4-7'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Generează tu însuți câteva mesaje de test (cu `logger`) la prioritățile `info` și `err`, apoi regăsește-le în jurnal folosind etichetă, prioritate și interval de timp. Interpretează o linie de log: oră, gazdă, proces, PID, mesaj.',
    'Găsește în jurnal ultimele mesaje ale serviciului `sshd` și, dacă există, în `/var/log/secure` și `/var/log/messages` (doar dacă rsyslog este activ pe sistem).',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), shell bash. Contul tău trebuie să poată citi jurnalul (root, sudo sau membru în grupurile care permit asta).',
    'Serviciul `sshd` poate exista sau nu; dacă lipsește, sari peste pașii pentru el.',
  ],
  finalState: [
    'Ai regăsit mesajele de test după etichetă și prioritate, ai folosit un interval de timp și ai explicat o linie de log.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai scris două mesaje cu eticheta `labl47` (unul `info`, unul `err`) și le-ai găsit cu `journalctl -t labl47`.', manualCheck: 'journalctl -t labl47 --no-pager' },
    { id: 'ac2', text: 'Ai filtrat doar mesajul de eroare cu `-p err`.', manualCheck: 'journalctl -t labl47 -p err --no-pager' },
    { id: 'ac3', text: 'Ai folosit un interval de timp relativ (`--since "10 minutes ago"`).', manualCheck: 'journalctl --since "10 minutes ago" -t labl47 --no-pager' },
    { id: 'ac4', text: 'Ai afișat ultimele linii ale unui serviciu (de ex. sshd) și ai notat oră, gazdă, proces și PID din una.', manualCheck: 'journalctl -u sshd -n 5 --no-pager' },
    { id: 'ac5', text: 'Ai verificat existența fișierelor din /var/log și ai citit fragmente din ele (dacă există).', manualCheck: 'ls -l /var/log; sudo tail -n 5 /var/log/secure' },
  ],
  steps: [
    {
      title: 'Scrie mesaje de test în jurnal',
      purpose: 'Generezi singur evenimente, ca să știi ce să cauți.',
      hint: '`logger -t` setează eticheta (tag); `-p facility.nivel` setează prioritatea.',
      commands: 'logger -t labl47 -p user.info "mesaj de test info"\nlogger -t labl47 -p user.err "mesaj de test EROARE"',
      explain: [
        ['logger', 'trimite un mesaj către jurnal/syslog.'],
        ['-t labl47', 'eticheta (tag) mesajului; apare ca „numele procesului” în linie.'],
        ['-p user.err', 'facility `user`, prioritate `err` (3).'],
        ['"…"', 'textul mesajului, între ghilimele.'],
      ],
    },
    {
      title: 'Regăsește-le în jurnal',
      purpose: 'Filtrezi după etichetă, prioritate și timp.',
      hint: '`--no-pager` afișează direct în terminal, fără `less`.',
      commands: 'journalctl -t labl47 --no-pager\njournalctl -t labl47 -p err --no-pager\njournalctl --since "10 minutes ago" -t labl47 --no-pager\njournalctl -t labl47 -o verbose -n 1 --no-pager',
      explain: [
        ['-t labl47', 'filtrează după identificatorul (tag) syslog.'],
        ['-p err', 'doar nivelul err și mai grave: mesajul info dispare.'],
        ['--since "10 minutes ago"', 'interval relativ; poți folosi și "yesterday", "2026-11-16 10:00".'],
        ['-o verbose', 'format cu toate câmpurile structurate (PRIORITY, _PID, _UID, SYSLOG_IDENTIFIER).'],
        ['-n 1', 'ultima intrare.'],
        ['--no-pager', 'fără pager.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# journalctl -t labl47 --no-pager\nNov 16 14:02:11 server1 labl47[6001]: mesaj de test info\nNov 16 14:02:11 server1 labl47[6002]: mesaj de test EROARE\n[root@server1 ~]# journalctl -t labl47 -p err --no-pager\nNov 16 14:02:11 server1 labl47[6002]: mesaj de test EROARE', explain: 'Coloanele: dată și oră, gazda, `etichetă[PID]`, mesajul. Cu `-p err` rămâne doar mesajul err. Ora și PID-urile sunt exemple.' },
      reflect: 'De ce mesajul `info` nu apare cu `-p err`? Ce nivel ar trebui să ceri ca să-l vezi pe ambele?',
    },
    {
      title: 'Citește mesajele unui serviciu',
      purpose: 'Folosești jurnalul ca instrument de depanare.',
      hint: 'Dacă `sshd` nu există, folosește `systemd-journald` sau alt serviciu din `systemctl list-units --type=service`.',
      commands: 'journalctl -u sshd -n 5 --no-pager\njournalctl -u sshd -b --no-pager | tail -3\njournalctl -k -n 5 --no-pager\njournalctl --list-boots',
      explain: [
        ['-u sshd', 'doar unitatea sshd.'],
        ['-n 5', 'ultimele 5 intrări.'],
        ['-b', 'boot-ul curent.'],
        ['-k', 'mesajele kernelului.'],
        ['--list-boots', 'boot-urile păstrate (vezi L4.8 pentru persistență).'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# journalctl -u sshd -n 2 --no-pager\nNov 16 08:12:30 server1 systemd[1]: Started OpenSSH server daemon.\nNov 16 08:12:30 server1 sshd[812]: Server listening on 0.0.0.0 port 22.', explain: 'Prima linie vine de la systemd (PID 1), a doua de la sshd (PID 812). Textul exact depinde de versiune.' },
    },
    {
      title: 'Explorează /var/log',
      purpose: 'Știi unde sunt fișierele text și ce conțin.',
      hint: 'Dacă fișierele lipsesc, rsyslog poate fi neinstalat sau oprit; jurnalul rămâne sursa principală.',
      commands: 'ls -l /var/log\nsudo tail -n 5 /var/log/secure\nsudo grep labl47 /var/log/messages\nsystemctl is-active rsyslog',
      explain: [
        ['ls -l /var/log', 'listează fișierele de log cu dimensiuni și date.'],
        ['tail -n 5 /var/log/secure', 'ultimele 5 linii din fișierul de autentificare.'],
        ['grep labl47 /var/log/messages', 'caută mesajul tău de test în fișierul text (dacă rsyslog îl scrie).'],
        ['systemctl is-active rsyslog', '`active` dacă serviciul rsyslog rulează.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# sudo grep labl47 /var/log/messages\nNov 16 14:02:11 server1 labl47[6001]: mesaj de test info\nNov 16 14:02:11 server1 labl47[6002]: mesaj de test EROARE', explain: 'Dacă rsyslog este activ, aceleași mesaje apar și ca text simplu. Dacă `grep` nu găsește nimic sau fișierul nu există, verifică `systemctl is-active rsyslog`.' },
    },
  ],
  verification: [
    { cmd: 'journalctl -t labl47 --no-pager', expected: 'două linii: info și EROARE' },
    { cmd: 'journalctl -t labl47 -p err --no-pager', expected: 'doar linia cu EROARE' },
    { cmd: 'journalctl -u sshd -n 5 --no-pager', expected: 'ultimele mesaje sshd, dacă serviciul există' },
  ],
  persistence: [
    'Mesajele din jurnal persistă după reboot doar dacă jurnalul este configurat persistent (L4.8); altfel dispar.',
    'Fișierele din `/var/log` (rsyslog) persistă pe disc și sunt rotite de `logrotate`.',
    'Nu există configurare de păstrat în acest laborator.',
  ],
  mistakes: [
    'Uitarea ghilimelelor la `--since "…"`.',
    'Confuzia `-u` (unitate) cu `-p` (prioritate).',
    'Citirea unui fișier din `/var/log` fără `sudo`.',
    'Presupunerea că `/var/log/messages` există întotdeauna.',
  ],
  troubleshooting: [
    { symptom: '`No journal files were found` / nu vezi mesaje', cause: 'drepturi insuficiente', fix: 'folosește `sudo` sau adaugă contul în grupul potrivit.' },
    { symptom: '`/var/log/messages: No such file`', cause: 'rsyslog nu este instalat/activ', fix: '`systemctl status rsyslog`; folosește jurnalul.' },
    { symptom: 'nu apar mesajele de test', cause: 'filtrare greșită (`-t` diferit)', fix: 'verifică eticheta; încearcă `journalctl -n 20`.' },
    { symptom: '`Failed to parse timestamp`', cause: 'dată fără ghilimele', fix: '`--since "2026-11-16 10:00"`.' },
  ],
  alternatives: [
    'Pentru urmărire live: `journalctl -f` și, în alt terminal, `logger "test"`.',
    'Poți folosi `-p 3` în loc de `-p err`.',
    'Pentru mesajele kernelului: `dmesg` (pot cere root, în funcție de configurare).',
  ],
};
