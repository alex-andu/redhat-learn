import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'selinux-context', abbr: 'context SELinux', ro: 'eticheta de securitate a unui proces sau obiect: utilizator:rol:tip:nivel',
    what: 'Exemplu: system_u:object_r:httpd_sys_content_t:s0. Pe politica targeted, câmpul care decide este tipul (sufixul _t). Se vede cu -Z (ls -Z, ps -eZ, id -Z).',
    how: 'Pentru fișiere este un atribut extins (security.selinux); pentru procese, atribut al procesului. Fișierele noi moștenesc tipul directorului; cp creează fișier nou, mv păstrează eticheta.',
    where: 'Diagnostic: compari domeniul procesului cu tipul fișierului și cu eticheta implicită (matchpathcon).',
    std: 'selinux(8)', topics: ['L10.4', 'L10.5', 'L10.8'], aliases: ['security context', 'label', 'etichetă SELinux', 'ls -Z'],
  },
  {
    id: 'se-type', abbr: 'tip SELinux (type / domain)', ro: 'câmpul din context pe care se bazează regulile politicii targeted',
    what: 'Pentru fișiere se numește tip (httpd_sys_content_t); pentru procese, domeniu (httpd_t). Politica spune ce domenii pot accesa ce tipuri.',
    how: 'Se schimbă prin restorecon/semanage fcontext (fișiere), semanage port (porturi); domeniul procesului vine din tipul executabilului prin tranziție.',
    where: 'Primul lucru comparat la o refuzare SELinux.',
    std: 'selinux(8)', topics: ['L10.4', 'L10.5', 'L10.6'], aliases: ['type enforcement', 'domain', 'domeniu', '_t'],
  },
];
