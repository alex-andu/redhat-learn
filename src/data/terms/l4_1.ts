import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'boot-process', abbr: 'proces de boot', ro: 'drumul de la apăsarea butonului de pornire până la sistemul utilizabil',
    what: 'Succesiunea de etape prin care un calculator ajunge din „oprit” în „gata de lucru”: firmware, bootloader, kernel, systemd.',
    how: 'Firmware-ul (UEFI sau BIOS) testează hardware-ul și pornește bootloader-ul; GRUB2 încarcă kernelul și initramfs; kernelul pornește primul proces, systemd (PID 1); systemd pornește unitățile cerute de target-ul implicit.',
    where: 'Când sistemul nu pornește, afli la ce etapă se oprește: asta îți spune ce să repari (L4.2, L4.3).',
    topics: ['L4.1'], aliases: ['boot'],
  },
  {
    id: 'bootloader', abbr: 'GRUB2', full: 'GRand Unified Bootloader 2', ro: 'programul care încarcă kernelul în memorie',
    what: 'Primul program „al sistemului de operare” care rulează; afișează meniul de boot și încarcă kernelul ales, împreună cu initramfs și parametrii din linia de comandă a kernelului.',
    how: 'Configurația generată stă sub /boot (pe RHEL: /boot/grub2/grub.cfg sau, pe UEFI, în /boot/efi/EFI/redhat/); în meniu poți apăsa e ca să editezi temporar parametrii (L4.3).',
    where: 'Alegerea altui kernel la boot, boot într-un target diferit, recuperarea parolei de root.',
    topics: ['L4.1', 'L4.3'], aliases: ['grub', 'grub2'],
  },
  {
    id: 'initramfs', abbr: 'initramfs', ro: 'mic sistem de fișiere temporar încărcat în RAM la boot',
    what: 'O arhivă cu drivere și scripturi de care kernelul are nevoie ca să găsească și să monteze sistemul de fișiere rădăcină real.',
    how: 'GRUB2 îl încarcă lângă kernel; kernelul îl despachetează în RAM, rulează din el pregătirile (discuri, LVM, criptare), apoi trece la rădăcina reală (/sysroot, apoi /).',
    where: 'Apare în procedura de recuperare (rd.break se oprește în initramfs, L4.3).',
    topics: ['L4.1', 'L4.3'],
  },
  {
    id: 'systemd', abbr: 'systemd', ro: 'managerul de sistem și de servicii; primul proces (PID 1)',
    what: 'Pornește și supraveghează serviciile și celelalte „unități” ale sistemului, montează sisteme de fișiere, gestionează jurnalele (journald) și închiderea sistemului.',
    how: 'Citește fișierele de unitate (.service, .target, .mount…) din /usr/lib/systemd/system și /etc/systemd/system și le pornește în paralel, respectând dependențele. Se controlează cu systemctl.',
    where: 'Practic orice în administrarea RHEL: servicii, boot, log-uri, timere.',
    topics: ['L4.1', 'L4.2', 'L4.9'],
  },
  {
    id: 'systemctl', abbr: 'systemctl', ro: 'comanda cu care controlezi systemd',
    what: 'Pornește, oprește, repornește, activează servicii, schimbă target-ul și comandă reboot sau poweroff.',
    how: 'Vorbește cu systemd (PID 1) prin D-Bus; forma generală: systemctl ACȚIUNE [UNITATE]. Fără permisiuni de root, acțiunile care modifică sistemul cer autentificare.',
    where: 'Aproape la fiecare sesiune de administrare.',
    topics: ['L4.1', 'L4.2', 'L4.9'],
  },
  {
    id: 'shutdown-cmd', abbr: 'shutdown', ro: 'comanda care oprește sistemul imediat sau la o oră programată, cu avertizarea utilizatorilor',
    what: 'shutdown [opțiuni] [ora] [mesaj]: oprește (-P), repornește (-r) sau doar oprește procesorul (-H) la momentul indicat; trimite mesaj tuturor utilizatorilor conectați.',
    how: 'Programarea este ținută în memoria systemd-logind; cu cel mult 5 minute înainte creează /run/nologin și refuză conectări noi. shutdown -c anulează.',
    where: 'Opriri planificate pe servere cu mai mulți utilizatori.',
    topics: ['L4.1'],
  },
];
