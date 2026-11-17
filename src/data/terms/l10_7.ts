import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'selinux-boolean', abbr: 'boolean SELinux', ro: 'comutator on/off al unei părți opționale din politica SELinux',
    what: 'Permite sau interzice un comportament al unui serviciu confinat (Apache poate citi home-uri, poate trimite mail, se poate conecta la rețea) fără reguli noi. Exemple: httpd_enable_homedirs, httpd_can_network_connect, samba_enable_home_dirs.',
    how: 'getsebool -a listează; setsebool NUME on schimbă doar valoarea curentă (dispare la reboot); setsebool -P NUME on sau semanage boolean -m --on NUME o fac persistentă. semanage boolean -l -C arată modificările locale.',
    where: 'A treia verificare la o refuzare, după eticheta fișierului și eticheta portului; principiul privilegiului minim.',
    std: 'setsebool(8)', topics: ['L10.7', 'L10.8'], aliases: ['setsebool', 'getsebool', 'setsebool -P', 'boolean'],
  },
];
