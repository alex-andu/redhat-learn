import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'multi-user-target', abbr: 'multi-user.target', ro: 'starea de funcționare în care sistemul acceptă mai mulți utilizatori, în mod text',
    what: 'Un „target” systemd: serviciile de rețea și de autentificare sunt pornite, mai mulți utilizatori se pot conecta, dar nu pornește implicit interfața grafică. graphical.target îl include și adaugă GUI.',
    how: 'systemctl get-default arată target-ul implicit; schimbarea lui se tratează în capitolul 4.',
    where: 'Pe servere, conectarea se face la consolă sau prin SSH, în shell.',
    topics: ['L1.10'], aliases: ['target'],
  },
  {
    id: 'login-shell', abbr: 'login shell', ro: 'shell pornit la autentificare, cu mediul complet al utilizatorului',
    what: 'Shell-ul pornit după autentificare (consolă, SSH, su -). Citește fișierele de profil (/etc/profile, ~/.bash_profile) și stabilește mediul (PATH, variabile).',
    how: 'echo $0 afișează de obicei -bash într-un login shell. su fără - nu pornește un login shell: mediul rămâne al utilizatorului inițial.',
    where: 'Diferența dintre su și su - explică „de ce comanda nu este găsită” după schimbarea utilizatorului.',
    topics: ['L1.10'],
  },
  {
    id: 'su', abbr: 'su', full: 'substitute user', ro: 'comanda care schimbă utilizatorul în shell-ul curent',
    what: 'su utilizator deschide un shell ca acel utilizator; fără nume = root. su - pornește un login shell (mediu complet, home-ul țintei).',
    how: 'Cere parola utilizatorului ȚINTĂ (nu pe a ta), cu excepția lui root, care nu are nevoie de parolă. exit revine la shell-ul anterior.',
    where: 'Administrare ca root sau testarea contului altui utilizator.',
    topics: ['L1.10'],
  },
  {
    id: 'sudo', abbr: 'sudo', full: 'superuser do', ro: 'rulează o comandă cu privilegiile altui utilizator (de obicei root)',
    what: 'sudo comandă rulează o singură comandă ca root, dacă politica o permite. Cere, de regulă, parola ta, nu a lui root.',
    how: 'Politica este în /etc/sudoers și /etc/sudoers.d. Pe RHEL, membrii grupului wheel pot folosi sudo în configurația implicită (de confirmat). sudo -i pornește un login shell root; sudo -l listează drepturile.',
    where: 'Administrare zilnică fără a rămâne conectat ca root; evenimentele sunt consemnate în jurnal.',
    topics: ['L1.10'],
  },
  {
    id: 'wheel', abbr: 'wheel', ro: 'grupul ai cărui membri pot folosi sudo (pe RHEL)',
    what: 'Grup administrativ. Pe RHEL, membrii lui au drepturi sudo prin configurația implicită.',
    how: 'id arată grupurile tale; membrii se văd în /etc/group. Adăugarea într-un grup se aplică la următoarea autentificare.',
    where: 'La instalare, contul administrativ creat este adesea adăugat în wheel.',
    topics: ['L1.10'],
  },
  {
    id: 'tty', abbr: 'tty', full: 'teletype / terminal', ro: 'terminal (consolă virtuală sau pseudo-terminal)',
    what: 'Dispozitivul prin care interacționezi cu shell-ul: tty1…tty6 (console virtuale), pts/N (terminale deschise prin SSH sau emulator).',
    how: 'Comanda tty afișează terminalul curent; who și w îl arată pentru fiecare sesiune.',
    where: 'Ctrl+Alt+F2…F6 comută între console virtuale pe mașina fizică sau în consola VM.',
    topics: ['L1.10'], aliases: ['pts'],
  },
];
