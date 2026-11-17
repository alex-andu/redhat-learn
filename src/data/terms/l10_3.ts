import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'selinux', abbr: 'SELinux', full: 'Security-Enhanced Linux', ro: 'sistemul de control obligatoriu al accesului (MAC) din kernelul Linux',
    what: 'Adaugă, peste permisiunile clasice, o politică centrală care spune ce domenii (tipuri de procese) pot accesa ce tipuri de obiecte. Moduri: enforcing, permissive, disabled.',
    how: 'Etichetează procese și obiecte cu un context utilizator:rol:tip:nivel; la fiecare acces kernelul verifică întâi DAC, apoi politica. Refuzările se înregistrează ca mesaje AVC în audit.log.',
    where: 'Pe RHEL este activ implicit (enforcing, politica targeted). Cauza multor „Permission denied” misterioase; rezolvare prin etichete, porturi, boolean-uri.',
    std: 'selinux(8)', topics: ['L10.3', 'L10.4', 'L10.5', 'L10.6', 'L10.7', 'L10.8'], aliases: ['Security-Enhanced Linux'],
  },
  {
    id: 'mac', abbr: 'MAC', full: 'Mandatory Access Control', ro: 'control obligatoriu al accesului: politica centrală decide, nu proprietarul resursei',
    what: 'Un set de reguli scris de administrator/distribuție, aplicat tuturor, inclusiv lui root (dacă procesul este confinat). SELinux este implementarea MAC din Linux.',
    how: 'Se aplică după DAC: accesul reușește doar dacă ambele straturi îl permit.',
    where: 'Limitează efectul unui serviciu compromis.',
    topics: ['L10.3'], aliases: ['control obligatoriu'],
  },
  {
    id: 'enforcing', abbr: 'enforcing', ro: 'modul SELinux în care acțiunile refuzate sunt blocate și înregistrate',
    what: 'Modul normal de producție: politica este încărcată și aplicată.',
    how: 'setenforce 1 (temporar) sau SELINUX=enforcing în /etc/selinux/config (la boot). getenforce afișează „Enforcing”.',
    where: 'Implicit pe RHEL; cerut de obicei la examen.',
    std: 'selinux(8)', topics: ['L10.3'], aliases: ['Enforcing'],
  },
  {
    id: 'permissive', abbr: 'permissive', ro: 'modul SELinux în care acțiunile refuzate sunt doar înregistrate, nu blocate',
    what: 'Politica este încărcată, dar nu blochează: mesajele AVC apar cu permissive=1.',
    how: 'setenforce 0 sau SELINUX=permissive. Util pentru diagnostic; nu se lasă ca stare finală.',
    where: 'A afla dacă SELinux este cauza unei probleme.',
    std: 'selinux(8)', topics: ['L10.3', 'L10.8'], aliases: ['Permissive'],
  },
  {
    id: 'targeted', abbr: 'targeted', ro: 'politica SELinux standard pe RHEL: confinează serviciile, nu și utilizatorii obișnuiți',
    what: 'Majoritatea demonilor rulează în domenii confinate (httpd_t, sshd_t…), iar procesele utilizatorilor în unconfined_t. SELINUXTYPE=targeted.',
    how: 'Politica este în pachetul selinux-policy-targeted și în /etc/selinux/targeted. Alternativa MLS confinează toate procesele.',
    where: 'Explică de ce serviciile sunt blocate, iar comenzile tale nu.',
    std: 'selinux(8)', topics: ['L10.3', 'L10.4'], aliases: ['SELINUXTYPE', 'selinux-policy-targeted'],
  },
  {
    id: 'avc', abbr: 'AVC', full: 'Access Vector Cache (denial)', ro: 'mesajul de audit generat la un acces refuzat (sau permis în permissive) de SELinux',
    what: 'Conține acțiunea ({ read }), procesul (comm), contextul sursă (scontext), contextul țintă (tcontext), clasa (tclass) și permissive=0|1.',
    how: 'Se scrie în /var/log/audit/audit.log de auditd; se caută cu ausearch -m avc -ts recent.',
    where: 'Punctul de plecare al oricărui diagnostic SELinux (L10.8).',
    std: 'ausearch(8)', topics: ['L10.3', 'L10.8'], aliases: ['AVC denied', 'avc: denied'],
  },
  {
    id: 'auditd', abbr: 'auditd', ro: 'serviciul de audit care scrie /var/log/audit/audit.log',
    what: 'Primește evenimente de la kernel (inclusiv refuzările SELinux) și le înregistrează.',
    how: 'systemctl status auditd; ausearch caută în jurnal, aureport sumarizează.',
    where: 'Dacă auditd este oprit, mesajele AVC pot lipsi din audit.log.',
    topics: ['L10.3', 'L10.8'], aliases: ['audit.log', 'ausearch'],
  },
];
