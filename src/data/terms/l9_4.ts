import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'sudoers', abbr: '/etc/sudoers', ro: 'fișierul de politică care stabilește cine poate rula ce comenzi cu sudo',
    what: 'Reguli de forma UTILIZATOR GAZDĂ = (RUNAS) [TAG:] COMENZI; plus alias-uri și Defaults. Ultima regulă potrivită câștigă.',
    how: 'Citit de sudo la fiecare rulare; include directorul /etc/sudoers.d. Se editează doar cu visudo, care verifică sintaxa.',
    where: 'Examen: acordarea accesului administrativ; sudo -l -U NUME.',
    std: 'sudoers(5)', topics: ['L9.4'], aliases: ['sudoers file', 'Cmnd_Alias', 'Defaults', 'runas'],
  },
  {
    id: 'visudo', abbr: 'visudo', ro: 'editorul sigur pentru fișierele sudoers',
    what: 'Blochează fișierul, îl deschide în editor, verifică sintaxa la salvare și refuză o configurație greșită (opțiuni la „What now?”: e, x, Q).',
    how: 'visudo -f FIȘIER editează un fișier din sudoers.d; visudo -c verifică fără a edita (cod 0 = ok); -s = strict.',
    where: 'Orice modificare a politicii sudo; o greșeală directă poate bloca sudo.',
    std: 'visudo(8)', topics: ['L9.4'], aliases: ['visudo -c', 'visudo -f'],
  },
  {
    id: 'sudoers-d', abbr: '/etc/sudoers.d', ro: 'directorul cu fișiere de politică sudo adăugate separat de fișierul principal',
    what: 'Fiecare fișier conține reguli; sunt citite în ordine lexicală. Fișierele cu punct în nume sau terminate în ~ sunt ignorate.',
    how: 'Inclus prin @includedir (sau #includedir) din /etc/sudoers. Fișierele au de obicei mod 0440, root:root.',
    where: 'Reguli proprii, fără a edita fișierul distribuției; ștergere ușoară.',
    topics: ['L9.4'], aliases: ['includedir', 'sudoers.d'],
  },
  {
    id: 'nopasswd', abbr: 'NOPASSWD', ro: 'eticheta sudoers care elimină cererea parolei pentru comenzile de după ea',
    what: 'Exemplu: %ops ALL=(ALL) NOPASSWD: /usr/bin/systemctl status *. Eticheta opusă este PASSWD.',
    how: 'Se aplică comenzilor care o urmează pe aceeași linie; ultima regulă potrivită poate o anula.',
    where: 'Automatizări; risc de securitate la ALL.',
    topics: ['L9.4'], aliases: ['PASSWD tag', 'tag sudoers', 'sudo fără parolă'],
  },
];
