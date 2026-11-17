import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'grub2', abbr: 'GRUB 2', full: 'GRand Unified Bootloader 2', ro: 'bootloader-ul RHEL: încarcă kernelul și initramfs-ul și le pasează parametrii',
    what: 'Program încărcat de firmware (BIOS/UEFI) care afișează meniul de boot, alege kernelul și pornește Linux cu linia de comandă potrivită.',
    how: 'Setările generale sunt în /etc/default/grub; grub2-mkconfig generează grub.cfg; intrările de kernel sunt fișiere BLS în /boot/loader/entries, modificate cu grubby.',
    where: 'Meniul de la pornire; tasta e editează temporar o intrare (L4.3).',
    topics: ['L7.4'], aliases: ['grub', 'GRUB2', 'grub2-mkconfig'],
  },
  {
    id: 'etc-default-grub', abbr: '/etc/default/grub', ro: 'fișierul cu setările generale GRUB (variabile shell)',
    what: 'Conține GRUB_TIMEOUT, GRUB_DEFAULT, GRUB_CMDLINE_LINUX, GRUB_TERMINAL, GRUB_DISABLE_* etc. (manualul GNU GRUB).',
    how: 'Se editează ca fișier shell (fără spații în jurul =), apoi se rulează grub2-mkconfig -o <grub.cfg> ca să aibă efect.',
    where: 'GRUB_TIMEOUT=10 pentru un meniu care așteaptă 10 secunde.',
    topics: ['L7.4'], aliases: ['GRUB_TIMEOUT', 'GRUB_DEFAULT', 'GRUB_CMDLINE_LINUX'],
  },
  {
    id: 'grub-cfg', abbr: 'grub.cfg', ro: 'configurația GENERATĂ pe care o citește GRUB la boot',
    what: 'Fișier produs de grub2-mkconfig din /etc/default/grub și scripturile /etc/grub.d/*; nu se editează manual.',
    how: 'Calea diferă între versiuni și între BIOS/UEFI (/boot/grub2/grub.cfg sau /boot/efi/EFI/redhat/grub.cfg); se confirmă cu ls. Regenerarea pe calea greșită nu schimbă nimic.',
    where: 'După modificarea setărilor meniului din /etc/default/grub.',
    topics: ['L7.4'], aliases: ['grub2-mkconfig', 'grub.cfg'],
  },
  {
    id: 'bls-entry', abbr: 'intrare BLS', full: 'Boot Loader Specification entry', ro: 'fișier .conf în /boot/loader/entries, câte unul pentru fiecare kernel',
    what: 'Descrie o intrare de meniu: title, version, linux, initrd, options (linia de comandă a kernelului).',
    how: 'grubby modifică linia options; un kernel nou instalat adaugă o intrare nouă. Argumentele din options apar apoi în /proc/cmdline.',
    where: '/boot/loader/entries/*.conf; grep options /boot/loader/entries/*.conf.',
    topics: ['L7.4'], aliases: ['BLS', '/boot/loader/entries', 'Boot Loader Specification'],
  },
  {
    id: 'grubby', abbr: 'grubby', ro: 'utilitar care citește și modifică intrările de boot și kernelul implicit',
    what: '--info=ALL|DEFAULT, --default-kernel, --default-index, --set-default=<kernel>, --update-kernel=<ALL|DEFAULT|cale> cu --args="…" și --remove-args="…" (grubby(8)).',
    how: 'Modifică direct intrările BLS; nu cere grub2-mkconfig pentru argumente. Efectul se vede la următorul boot, în /proc/cmdline.',
    where: 'grubby --update-kernel=ALL --remove-args="rhgb quiet"; grubby --set-default=/boot/vmlinuz-….',
    topics: ['L7.4'], aliases: ['grubby --update-kernel', 'grubby --info'],
  },
];
