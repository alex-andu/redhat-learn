import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'ssh', abbr: 'SSH', full: 'Secure Shell', ro: 'protocol și client pentru acces securizat la un sistem remote',
    what: 'Îți oferă un shell pe alt calculator, cu traficul criptat. Comanda ssh utilizator@gazdă deschide sesiunea; ssh gazdă comandă rulează o singură comandă.',
    how: 'Clientul se conectează, în mod implicit, la portul 22/tcp al serverului sshd, verifică identitatea serverului (cheia gazdei) și apoi te autentifică (parolă sau cheie).',
    where: 'Administrarea serverelor fără consolă fizică, transferul de fișiere (scp, sftp).',
    topics: ['L1.11'], aliases: ['OpenSSH'],
  },
  {
    id: 'sshd', abbr: 'sshd', ro: 'serviciul (daemon-ul) SSH de pe server',
    what: 'Programul care ascultă conexiunile SSH pe sistemul la care te conectezi. Configurația lui este în /etc/ssh/sshd_config; serviciul se gestionează cu systemctl.',
    how: 'systemctl status sshd arată dacă rulează. Firewall-ul trebuie să permită serviciul ssh (port 22/tcp), altfel conexiunea expiră.',
    where: 'Configurarea și depanarea serverului este în capitolele despre servicii, rețea și firewall; aici doar îl recunoști.',
    topics: ['L1.11'],
  },
  {
    id: 'host-key', abbr: 'cheia gazdei', ro: 'cheia care identifică serverul, verificată de client',
    what: 'La prima conectare vezi amprenta cheii serverului și confirmi că vrei să continui. Clientul o salvează în ~/.ssh/known_hosts.',
    how: 'Dacă cheia unui server cunoscut se schimbă, apare avertismentul „REMOTE HOST IDENTIFICATION HAS CHANGED”: poate fi o reinstalare legitimă sau un atac; verifică înainte să continui.',
    where: 'ssh-keygen -R gazdă șterge intrarea veche din known_hosts după o schimbare legitimă.',
    topics: ['L1.11'], aliases: ['known_hosts'],
  },
  {
    id: 'ssh-key', abbr: 'cheie SSH', ro: 'pereche de chei (privată + publică) pentru autentificare fără parolă',
    what: 'Cheia privată rămâne secretă pe clientul tău; cheia publică se copiază pe server în ~/.ssh/authorized_keys.',
    how: 'ssh-keygen -t ed25519 creează perechea; ssh-copy-id utilizator@gazdă instalează cheia publică. Permisiuni stricte: ~/.ssh 700, cheia privată 600.',
    where: 'Autentificare comodă și mai sigură decât parola; scripturi și automatizări.',
    topics: ['L1.11'], aliases: ['authorized_keys', 'ssh-keygen'],
  },
  {
    id: 'scp', abbr: 'scp / sftp', ro: 'copierea fișierelor peste SSH',
    what: 'scp sursă destinație copiază fișiere între sisteme; sftp deschide o sesiune interactivă de transfer. Ambele folosesc SSH pentru autentificare și criptare.',
    how: 'Calea remote are forma utilizator@gazdă:cale. scp -r copiază directoare; scp -P (majusculă) alege portul, spre deosebire de ssh -p.',
    where: 'Mutarea arhivelor (L1.9), a configurărilor și a rezultatelor între servere.',
    topics: ['L1.11'], aliases: ['sftp'],
  },
];
