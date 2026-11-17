import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'kernel-cmdline', abbr: 'linia de comandă a kernelului', ro: 'parametrii pasați kernelului de bootloader',
    what: 'Un șir de opțiuni (root=…, ro, rhgb, quiet, systemd.unit=…, rd.break) pe care GRUB2 îl dă kernelului la pornire.',
    how: 'Se editează temporar în meniul GRUB2 (tasta e), iar valoarea cu care a pornit sistemul se vede în /proc/cmdline. Modificările permanente se fac cu grubby (în afara acestei lecții).',
    where: 'Boot într-un target (systemd.unit=), recuperarea parolei (rd.break), depanare.',
    topics: ['L4.2', 'L4.3'], aliases: ['/proc/cmdline'],
  },
  {
    id: 'rd-break', abbr: 'rd.break', ro: 'parametru de boot care oprește pornirea în initramfs',
    what: 'Pune sistemul într-un shell de root înainte ca rădăcina reală să devină „/”. Nu cere parola root.',
    how: 'La rd.break, kernelul a montat deja sistemul de fișiere real, dar la /sysroot și doar pentru citire. Poți să îl remontezi cu drept de scriere, să faci chroot în el și să modifici fișiere, de exemplu parola de root.',
    where: 'Recuperarea unei parole de root pierdute pe un sistem al tău.',
    topics: ['L4.3'], aliases: ['rd.break'],
  },
  {
    id: 'sysroot', abbr: '/sysroot', ro: 'locul unde initramfs montează rădăcina reală',
    what: 'Directorul prin care, în shell-ul initramfs, ajungi la sistemul tău de fișiere (fișierele din /etc, /home etc. apar sub /sysroot/etc, /sysroot/home).',
    how: 'Este montat inițial read-only. Comanda chroot /sysroot face din el „/” pentru shell-ul curent, ca să rulezi passwd și alte comenzi ca și cum sistemul ar fi pornit.',
    where: 'Procedura de resetare a parolei root.',
    topics: ['L4.3'],
  },
  {
    id: 'chroot', abbr: 'chroot', ro: 'schimbă directorul rădăcină pentru o comandă sau un shell',
    what: 'chroot DIRECTOR [comandă] execută comanda cu DIRECTOR drept „/”. Fără comandă, pornește un shell.',
    how: 'După chroot /sysroot, /etc/shadow înseamnă de fapt /sysroot/etc/shadow; passwd modifică astfel fișierul real al sistemului tău.',
    where: 'Recuperare de parole și reparații de pe medii de rescue.',
    topics: ['L4.3'],
  },
  {
    id: 'autorelabel', abbr: '/.autorelabel', ro: 'fișier-semnal: reetichetează SELinux la următorul boot',
    what: 'Dacă există un fișier /.autorelabel la boot, sistemul reeticheteză toate fișierele cu contextul SELinux corect și apoi șterge fișierul.',
    how: 'passwd rulat din initramfs creează un /etc/shadow cu etichetă greșită; fără reetichetare, SELinux (în Enforcing) poate bloca autentificarea. Reetichetarea poate dura câteva minute, apoi sistemul repornește singur.',
    where: 'Ultimul pas al resetării parolei de root. SELinux este tratat în capitolul 10.',
    topics: ['L4.3'],
  },
];
