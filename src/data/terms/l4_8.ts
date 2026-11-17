import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'journal-storage', abbr: 'Storage= (journald)', ro: 'setarea care decide unde ține journald jurnalul: memorie sau disc',
    what: 'În /etc/systemd/journald.conf: volatile (doar în /run/log/journal, se pierde la reboot), persistent (în /var/log/journal, rămâne), auto (persistent doar dacă directorul /var/log/journal există) sau none.',
    how: 'systemd-journald citește fișierul la pornire; după modificare trebuie repornit (systemctl restart systemd-journald). În modul auto, crearea directorului /var/log/journal este suficientă ca să devină persistent.',
    where: 'Investigarea unui boot anterior (journalctl -b -1), a unui crash sau a unui reboot neașteptat.',
    topics: ['L4.8'], aliases: ['persistent journal'],
  },
  {
    id: 'journal-vacuum', abbr: 'vacuum', ro: 'curățarea manuală a jurnalelor vechi',
    what: 'journalctl --vacuum-size=200M sau --vacuum-time=2weeks șterge jurnalele arhivate până când se respectă limita dată.',
    how: 'Acționează pe fișierele de jurnal arhivate (nu pe cel activ). Limitele automate se setează în journald.conf (SystemMaxUse=, SystemKeepFree=, MaxRetentionSec=).',
    where: 'Controlul spațiului ocupat în /var/log/journal.',
    topics: ['L4.8'],
  },
];
