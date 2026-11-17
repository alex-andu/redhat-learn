import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'setroubleshoot', abbr: 'sealert / audit2why', ro: 'unelte de explicare a refuzărilor SELinux (suport; pachete suplimentare)',
    what: 'sealert (setroubleshoot-server) transformă un AVC într-o explicație cu sugestii de comenzi; audit2why spune dacă refuzarea se rezolvă cu un boolean sau cu o regulă lipsă. audit2allow generează un modul de politică propriu (ultimă soluție).',
    how: 'sealert -a /var/log/audit/audit.log; ausearch -m avc -ts recent | audit2why. Disponibilitatea pe RHEL 10 de confirmat; la examen citirea manuală a AVC trebuie stăpânită.',
    where: 'Diagnostic SELinux (L10.8); nu fac parte din obiectivele oficiale.',
    topics: ['L10.8'], aliases: ['sealert', 'audit2why', 'audit2allow', 'setroubleshoot-server'],
  },
];
