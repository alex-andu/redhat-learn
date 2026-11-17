import type { Lab } from '../../lab/types';

export const LAB_L4_8: Lab = {
  id: 'lab-l4-8-journal-persistent',
  lessonId: 'L4.8',
  title: 'Fă jurnalul persistent și dovedește asta după reboot',
  modes: ['guided', 'independent'],
  objectives: ['C4-8'],
  difficulty: 2,
  estimatedMinutes: 30,
  scenario: [
    'Un server a repornit neașteptat, iar echipa nu poate citi mesajele de dinainte de reboot, pentru că jurnalul este păstrat doar în memorie. Verifică unde ține journald jurnalul, configurează păstrarea persistentă pe disc, limitează spațiul ocupat, repornește sistemul și confirmă că boot-ul anterior poate fi citit.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, acces root/sudo.',
    'Nu presupune starea inițială: verifică dacă `/var/log/journal` există deja.',
    'Spațiu liber în `/var` pentru jurnal.',
  ],
  finalState: [
    '`/var/log/journal` există, journald scrie acolo, limita `SystemMaxUse=` este setată, iar după reboot `journalctl --list-boots` arată cel puțin două boot-uri.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai verificat starea inițială (există /var/log/journal? ce valoare are Storage?).', manualCheck: 'ls -ld /var/log/journal; grep -i storage /etc/systemd/journald.conf' },
    { id: 'ac2', text: 'Directorul `/var/log/journal` există și aparține grupului `systemd-journal`.', manualCheck: 'ls -ld /var/log/journal' },
    { id: 'ac3', text: 'În `journald.conf` (sau într-un fișier drop-in) este setat `Storage=persistent` și o limită `SystemMaxUse=`.', manualCheck: 'grep -rE "^(Storage|SystemMaxUse)" /etc/systemd/journald.conf /etc/systemd/journald.conf.d/' },
    { id: 'ac4', text: 'journald a fost repornit și scrie în `/var/log/journal`.', manualCheck: 'journalctl --disk-usage; ls /var/log/journal' },
    { id: 'ac5', text: 'După reboot, `journalctl --list-boots` arată boot-ul anterior (indexul -1).', manualCheck: 'journalctl --list-boots' },
    { id: 'ac6', text: 'Poți citi un mesaj de test scris înainte de reboot.', manualCheck: 'journalctl -b -1 -t labl48 --no-pager' },
  ],
  steps: [
    {
      title: 'Verifică starea inițială',
      purpose: 'Nu presupui: afli ce se întâmplă acum.',
      hint: 'Dacă `/var/log/journal` există deja, jurnalul poate fi deja persistent (cu Storage=auto).',
      commands: 'ls -ld /var/log/journal\nls -ld /run/log/journal\ngrep -iE "^#?Storage" /etc/systemd/journald.conf\njournalctl --list-boots\njournalctl --disk-usage',
      explain: [
        ['ls -ld /var/log/journal', '-l format lung, -d afișează directorul însuși; „No such file” = nu există (jurnal volatil dacă Storage=auto).'],
        ['ls -ld /run/log/journal', 'locația volatilă; există de obicei mereu.'],
        ['grep -iE "^#?Storage"', 'afișează linia Storage (comentată sau nu); -i ignoră majusculele, -E expresie regulată extinsă.'],
        ['journalctl --list-boots', 'câte boot-uri sunt păstrate acum.'],
        ['journalctl --disk-usage', 'spațiul ocupat de jurnal.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# ls -ld /var/log/journal\nls: cannot access \'/var/log/journal\': No such file or directory\n[root@server1 ~]# journalctl --list-boots | wc -l\n1\n[root@server1 ~]# journalctl --disk-usage\nArchived and active journals take up 24.0M in the file system.', explain: 'Fără `/var/log/journal` și un singur boot în listă, jurnalul este volatil. Valorile sunt exemple.' },
    },
    {
      title: 'Scrie un mesaj de test',
      purpose: 'Ai nevoie de ceva recognoscibil de căutat după reboot.',
      hint: 'Eticheta este `labl48`.',
      commands: 'logger -t labl48 "mesaj de dinainte de reboot"\njournalctl -t labl48 --no-pager',
      explain: [
        ['logger -t labl48 "…"', 'scrie un mesaj în jurnal cu eticheta labl48 (L4.7).'],
        ['journalctl -t labl48', 'confirmă că mesajul există.'],
      ],
    },
    {
      title: 'Activează persistența',
      purpose: 'Setezi explicit și limitezi spațiul.',
      hint: 'Un drop-in în `/etc/systemd/journald.conf.d/` evită să editezi fișierul principal; ambele metode sunt corecte.',
      commands: 'mkdir -p /var/log/journal\nmkdir -p /etc/systemd/journald.conf.d\ncat > /etc/systemd/journald.conf.d/persistent.conf <<\'EOF\'\n[Journal]\nStorage=persistent\nSystemMaxUse=200M\nEOF\nsystemd-tmpfiles --create --prefix /var/log/journal\nsystemctl restart systemd-journald\nls -ld /var/log/journal\nls /var/log/journal',
      explain: [
        ['mkdir -p /var/log/journal', 'creează directorul stocării persistente (-p: fără eroare dacă există).'],
        ['/etc/systemd/journald.conf.d/persistent.conf', 'fișier drop-in; setările lui se adaugă peste journald.conf.'],
        ['<<\'EOF\' … EOF', 'here-document (L1.5): textul dintre marcaje merge în fișier; ghilimelele din jurul lui EOF opresc expansiunea variabilelor.'],
        ['Storage=persistent', 'forțează stocarea pe disc.'],
        ['SystemMaxUse=200M', 'limita de spațiu a jurnalului pe disc.'],
        ['systemd-tmpfiles --create --prefix /var/log/journal', 'aplică proprietarul și permisiunile corecte directorului (dacă regulile sistemului le definesc).'],
        ['systemctl restart systemd-journald', 'aplică configurația; journald începe să scrie pe disc.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# ls -ld /var/log/journal\ndrwxr-sr-x+ 3 root systemd-journal 46 Nov 16 14:40 /var/log/journal\n[root@server1 ~]# ls /var/log/journal\n3f1c2a8e9d7b4c0aa1b2c3d4e5f60718', explain: 'Directorul aparține grupului `systemd-journal`; subdirectorul are ca nume machine-id-ul sistemului. Permisiunile exacte și numele sunt exemple.' },
      reflect: 'De ce este nevoie de o limită `SystemMaxUse=`? Ce s-ar întâmpla pe o partiție `/var` mică fără ea?',
    },
    {
      title: 'Mută jurnalul curent pe disc (opțional)',
      purpose: 'Salvezi mesajele boot-ului curent, deja ținute în memorie.',
      hint: '`--flush` copiază din /run în /var/log/journal.',
      commands: 'journalctl --flush\njournalctl --disk-usage',
      explain: [
        ['journalctl --flush', 'cere lui journald să mute jurnalul din /run/log/journal în /var/log/journal.'],
      ],
    },
    {
      title: 'Repornește și dovedește persistența',
      purpose: 'Un al doilea boot trebuie să păstreze primul.',
      hint: 'Boot-ul anterior apare cu indexul -1.',
      commands: 'systemctl reboot\n# după reconectare:\njournalctl --list-boots\njournalctl -b -1 -t labl48 --no-pager\njournalctl -b -1 -n 5 --no-pager',
      explain: [
        ['journalctl --list-boots', 'acum două (sau mai multe) linii: -1 și 0.'],
        ['journalctl -b -1 -t labl48', 'mesajul de test de dinainte de reboot este vizibil: dovada.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# journalctl --list-boots\nIDX BOOT ID                          FIRST ENTRY                 LAST ENTRY\n -1 b17d…44c2 Mon 2026-11-16 08:12:10 UTC   Mon 2026-11-16 14:45:22 UTC\n  0 9a0e…77f1 Mon 2026-11-16 14:46:01 UTC   Mon 2026-11-16 14:52:40 UTC\n[root@server1 ~]# journalctl -b -1 -t labl48 --no-pager\nNov 16 14:41:03 server1 labl48[6201]: mesaj de dinainte de reboot', explain: 'Cele două boot-uri sunt păstrate; mesajul de test din boot-ul `-1` poate fi citit. Identificatorii sunt prescurtați și fictivi.' },
    },
  ],
  verification: [
    { cmd: 'ls -ld /var/log/journal', expected: 'director, grup `systemd-journal`' },
    { cmd: 'journalctl --list-boots', expected: 'cel puțin două boot-uri (-1 și 0)' },
    { cmd: 'journalctl -b -1 -t labl48 --no-pager', expected: 'mesajul de test de dinainte de reboot' },
    { cmd: 'journalctl --disk-usage', expected: 'spațiu ocupat sub limita SystemMaxUse' },
  ],
  persistence: [
    'Configurarea (`Storage=persistent`, drop-in-ul) este în `/etc` și persistă; `/var/log/journal` este pe disc.',
    'Dovada persistenței este chiar reboot-ul și citirea boot-ului `-1`.',
    'Fără reboot, un jurnal volatil pare în regulă: de aceea testul real este după repornire.',
  ],
  mistakes: [
    'Uitarea repornirii lui `systemd-journald` după modificare.',
    'Scrierea greșită a valorii (`persist`, `disk`).',
    'Crearea unui fișier (nu director) `/var/log/journal`.',
    'Neverificarea după reboot.',
    'Lipsa unei limite: jurnalul umple `/var`.',
  ],
  troubleshooting: [
    { symptom: 'după reboot, tot un singur boot', cause: 'directorul lipsește sau journald nu a fost repornit', fix: 'verifică `ls -ld /var/log/journal`, `systemctl status systemd-journald`; vezi conținutul drop-in-ului.' },
    { symptom: 'Permission denied la citire', cause: 'cont fără drept de citire a jurnalului', fix: 'folosește `sudo` sau grupul `systemd-journal`.' },
    { symptom: '`/var` se umple', cause: 'fără limită', fix: '`SystemMaxUse=` în configurație; `journalctl --vacuum-size=200M`.' },
    { symptom: 'configurația nu are efect', cause: 'eroare de sintaxă sau fără `[Journal]`', fix: 'recitește fișierul; secțiunea trebuie să fie `[Journal]`; verifică `journalctl -u systemd-journald`.' },
  ],
  alternatives: [
    'Poți edita direct `/etc/systemd/journald.conf` în loc de drop-in (liniile `Storage=` sunt comentate implicit).',
    'Cu `Storage=auto`, crearea directorului `/var/log/journal` este suficientă.',
    'Doar mesajele recente: `journalctl --vacuum-time=2weeks` pentru curățare.',
  ],
};
