import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'user-space', abbr: 'user space / kernel space', ro: 'programele obișnuite rulează cu drepturi limitate; nucleul rulează cu drepturi complete',
    what: 'Procesorul are moduri de privilegiu. Nucleul rulează în modul privilegiat și poate accesa orice. Programele (bash, ls, httpd) rulează în user space și nu pot atinge hardware-ul sau memoria altora direct.',
    how: 'Când un program are nevoie de ceva (să citească un fișier), apelează nucleul printr-un apel de sistem; nucleul verifică permisiunile și execută operația.',
    where: 'Explică de ce un program defect nu „strică” tot sistemul și de ce permisiunile și SELinux au rost.',
    topics: ['M0.5'], aliases: ['kernel space', 'user mode'],
  },
  {
    id: 'system-call', abbr: 'system call', full: 'apel de sistem', ro: 'cererea unui program către nucleu (open, read, write, fork, execve…)',
    what: 'Singura cale prin care un program obișnuit obține servicii de la nucleu. ls folosește, de exemplu, openat și getdents64 ca să citească un director.',
    how: 'Biblioteca C (glibc) ascunde apelurile în funcții obișnuite. Instrumente ca strace le afișează (nu face parte din examen).',
    where: 'man 2 intro; man 2 open. Util pentru a înțelege mesajele „Permission denied”: nucleul a refuzat apelul.',
    std: 'syscalls(2)', topics: ['M0.5'], aliases: ['syscall', 'apel de sistem'],
  },
  {
    id: 'pid', abbr: 'PID / PPID', full: 'process ID / parent process ID', ro: 'numărul unic al unui proces și al părintelui lui',
    what: 'Fiecare proces are un PID. Orice proces, în afară de primul, are un părinte (PPID). Shell-ul tău este părintele comenzilor pe care le rulezi.',
    how: 'fork() creează un copil cu PID nou; execve() înlocuiește programul din copil. $$ este PID-ul shell-ului curent.',
    where: 'ps -ef (coloanele PID și PPID), echo $$, kill PID (L4.4).',
    std: 'ps(1), fork(2)', topics: ['M0.5'], aliases: ['PPID', 'process id'],
  },
  {
    id: 'init-pid1', abbr: 'PID 1 / init', ro: 'primul proces de user space; pe RHEL este systemd',
    what: 'După pornirea nucleului, primul program pornit este PID 1. El pornește restul serviciilor și adoptă procesele rămase fără părinte.',
    how: 'ps -p 1 -o comm= afișează systemd pe RHEL. Dacă PID 1 se oprește, nucleul se oprește (panică).',
    where: 'L4.1, L4.2, L4.9.',
    std: 'systemd(1)', topics: ['M0.5'], aliases: ['init', 'process 1'],
  },
  {
    id: 'daemon', abbr: 'daemon', ro: 'proces de fundal, fără terminal, care oferă un serviciu',
    what: 'sshd, chronyd, firewalld, NetworkManager, crond: toate sunt daemoni. Numele lor se termină adesea în „d”. Un serviciu systemd (unit .service) este modul în care PID 1 pornește, oprește și supraveghează un daemon.',
    how: 'Daemonii pornesc la boot (dacă sunt „enabled”), rulează sub un utilizator de serviciu și își scriu mesajele în jurnal.',
    where: 'systemctl status sshd; ps -ef | grep sshd.',
    topics: ['M0.5'], aliases: ['serviciu', 'demon'],
  },
  {
    id: 'rpm-database', abbr: 'baza de date RPM', ro: 'evidența locală a pachetelor instalate (în /var/lib/rpm)',
    what: 'rpm și dnf notează acolo fiecare pachet instalat, versiunea lui și fiecare fișier pe care l-a pus pe disc. De aceea poți afla ce pachet „deține” un fișier (rpm -qf).',
    how: 'Interogările (rpm -q, rpm -ql, rpm -qf) citesc această bază; nu scanează discul. Repository-urile (de unde se instalează) sunt altceva: sunt la distanță, în /etc/yum.repos.d/.',
    where: 'rpm -qa | wc -l; rpm -qf /usr/bin/ls; L2.1–L2.3.',
    std: 'rpm(8)', topics: ['M0.5'], aliases: ['/var/lib/rpm', 'rpmdb'],
  },
  {
    id: 'login-session', abbr: 'sesiune', full: 'login session', ro: 'perioada dintre autentificarea unui utilizator și ieșirea lui',
    what: 'O sesiune grupează procesele pornite după login (shell-ul și tot ce pornești din el). who și w arată sesiunile active; loginctl le gestionează.',
    how: 'systemd-logind ține evidența sesiunilor; la ieșire, procesele sesiunii se opresc (cu excepția celor lăsate explicit în fundal).',
    where: 'who, w, last -n 5, loginctl list-sessions.',
    std: 'loginctl(1)', topics: ['M0.5'], aliases: ['session', 'login'],
  },
];
