import type { Lab } from '../../lab/types';

export const LAB_L4_3: Lab = {
  id: 'lab-l4-3-resetare-parola-root',
  lessonId: 'L4.3',
  title: 'Resetarea parolei root prin întreruperea boot-ului',
  modes: ['guided', 'independent'],
  objectives: ['C4-3'],
  difficulty: 3,
  estimatedMinutes: 40,
  scenario: [
    'Pe propria ta mașină virtuală de test, parola de root „s-a pierdut”. Ai acces la consola mașinii (nu la parolă). Intră în sistem întrerupând boot-ul, setează o parolă nouă pentru root, asigură-te că SELinux nu blochează autentificarea și confirmă că te poți autentifica cu parola nouă.',
  ],
  initialConditions: [
    'O mașină virtuală RHEL 10 de test, a ta. NU aplica această procedură pe sisteme care nu îți aparțin.',
    'Acces la consola grafică/serială a mașinii (hypervisor) pentru meniul GRUB2; SSH nu ajută.',
    'SELinux în modul Enforcing (implicit); notează cu `getenforce` înainte, dacă încă ai acces.',
    'Ai decis o parolă de laborator pe care o vei folosi (nu una reală).',
  ],
  finalState: [
    'Parola de root este cea nouă, `/.autorelabel` a fost consumat la boot, iar sistemul a pornit normal în target-ul implicit.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai intrat într-un shell de root fără parola veche, prin `rd.break` în GRUB2.', manualCheck: 'prompt-ul din consolă: switch_root:/#' },
    { id: 'ac2', text: 'Ai remontat `/sysroot` scriibil și ai folosit `chroot /sysroot`.', manualCheck: 'mount | grep sysroot; ls /etc/shadow (în chroot)' },
    { id: 'ac3', text: 'Ai setat parola nouă pentru root și ai creat `/.autorelabel`.', manualCheck: 'ls -a / | grep autorelabel' },
    { id: 'ac4', text: 'Sistemul a pornit normal după reetichetare.', manualCheck: 'systemctl get-default; systemctl is-system-running' },
    { id: 'ac5', text: 'Te poți autentifica ca root cu parola nouă.', manualCheck: 'su - (sau login ca root la consolă); id' },
    { id: 'ac6', text: '`/.autorelabel` nu mai există după boot.', manualCheck: 'ls -a / | grep autorelabel' },
  ],
  steps: [
    {
      title: 'Pornește meniul GRUB2 și editează linia kernelului',
      purpose: 'Întrerupi boot-ul înainte ca sistemul să ceară vreo autentificare.',
      hint: 'Repornește mașina; la meniu apasă repede o tastă ca să oprești numărătoarea. Selectează prima intrare și apasă `e`. Pe linia care începe cu `linux`, mergi la capăt și adaugă ` rd.break`.',
      commands: '# În consola mașinii virtuale, la meniul GRUB2:\n#   e\n#   (la sfârșitul liniei "linux")  adaugă:   rd.break\n#   Ctrl+x',
      explain: [
        ['e', 'editează temporar intrarea selectată (nu se salvează).'],
        ['rd.break', 'parametru dracut: oprește boot-ul în initramfs, înainte de switch_root.'],
        ['Ctrl+x', 'pornește cu linia modificată.'],
      ],
      output: { label: 'illustrative', code: 'Generating "/run/initramfs/rdsosreport.txt"\n\nEntering emergency mode. Exit the shell to continue.\nType "journalctl" to view system logs.\nYou might want to save "/run/initramfs/rdsosreport.txt" to a USB stick or /boot\nafter mounting them and attach it to a bug report.\n\nswitch_root:/#', explain: 'Mesajele exacte variază; important este promptul `switch_root:/#`: ești în initramfs, ca root, fără parolă.' },
    },
    {
      title: 'Remontează /sysroot și intră cu chroot',
      purpose: 'Rădăcina reală este montată read-only la /sysroot; trebuie scriibilă și devine „/” prin chroot.',
      hint: 'Dacă `passwd` va da „Authentication token manipulation error”, ai uitat unul dintre acești doi pași.',
      commands: 'mount | grep sysroot\nmount -o remount,rw /sysroot\nchroot /sysroot',
      explain: [
        ['mount | grep sysroot', 'afișează cum este montat /sysroot; în opțiuni apare `ro`.'],
        ['mount -o remount,rw /sysroot', '-o = opțiuni; remount = reia montarea existentă; rw = citire și scriere.'],
        ['chroot /sysroot', 'face din /sysroot noua rădăcină „/”; promptul se schimbă (de ex. `sh-5.2#`).'],
      ],
      output: { label: 'illustrative', code: 'switch_root:/# mount | grep sysroot\n/dev/mapper/rhel-root on /sysroot type xfs (ro,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)\nswitch_root:/# mount -o remount,rw /sysroot\nswitch_root:/# chroot /sysroot\nsh-5.2#', explain: 'Înainte de remount: `ro`. După chroot, promptul indică un shell din sistemul tău. Opțiunile și versiunea shell-ului sunt exemple.' },
    },
    {
      title: 'Setează parola și cere reetichetarea',
      purpose: 'Schimbi parola în fișierele reale și previi blocajul SELinux.',
      hint: 'Parola nu se afișează la tastare. Nu uita `touch /.autorelabel`.',
      commands: 'passwd root\ntouch /.autorelabel\nexit\nexit',
      explain: [
        ['passwd root', 'cere parola nouă de două ori și o scrie în /etc/shadow (acum al sistemului tău, datorită chroot).'],
        ['touch /.autorelabel', 'creează fișierul-semnal: la boot, SELinux reeticheteză sistemul de fișiere.'],
        ['exit (1)', 'părăsește chroot, revii în shell-ul initramfs.'],
        ['exit (2)', 'părăsește initramfs și continuă boot-ul normal.'],
      ],
      output: { label: 'illustrative', code: 'sh-5.2# passwd root\nChanging password for user root.\nNew password:\nRetype new password:\npasswd: all authentication tokens updated successfully.\nsh-5.2# touch /.autorelabel\nsh-5.2# exit\nexit\nswitch_root:/# exit', explain: 'Mesajul final al lui `passwd` confirmă scrierea parolei. Textul și echo-ul exact pot diferi. După al doilea `exit`, sistemul reeticheteză fișierele (poate dura minute) și repornește singur.' },
      reflect: 'De ce parola nu ar fi funcționat fără `chroot`? Ce fișier a modificat de fapt `passwd`?',
    },
    {
      title: 'Confirmă accesul cu parola nouă',
      purpose: 'Închizi bucla: dovedești că ai recăpătat accesul.',
      hint: 'Așteaptă ca reetichetarea să se termine; sistemul poate reporni de una sau două ori.',
      commands: 'su -\nid\nls -a / | grep autorelabel\ncat /proc/cmdline\nsystemctl is-system-running',
      explain: [
        ['su -', 'autentificare ca root; cere parola nouă (dacă ești conectat ca alt utilizator).'],
        ['ls -a / | grep autorelabel', 'nu trebuie să mai găsești nimic: fișierul a fost consumat.'],
        ['cat /proc/cmdline', 'nu mai conține `rd.break`: modificarea a fost temporară.'],
        ['systemctl is-system-running', '`running` dacă totul a pornit normal.'],
      ],
    },
  ],
  verification: [
    { cmd: 'su -; id', expected: 'uid=0(root) după introducerea parolei noi' },
    { cmd: 'ls -a / | grep autorelabel', expected: 'niciun rezultat' },
    { cmd: 'cat /proc/cmdline', expected: 'fără `rd.break`' },
    { cmd: 'systemctl get-default', expected: 'target-ul implicit dinainte' },
  ],
  persistence: [
    'Parola nouă este scrisă în `/etc/shadow` pe disc: persistă la reboot.',
    'Editarea liniei kernelului în GRUB2 este temporară și dispare după boot.',
    '`/.autorelabel` este consumat o singură dată, la boot.',
    'Confirmare manuală: reboot suplimentar și autentificare cu parola nouă.',
  ],
  mistakes: [
    'Uitarea lui `mount -o remount,rw /sysroot`.',
    'Uitarea lui `chroot /sysroot`.',
    'Uitarea lui `touch /.autorelabel` (parola nouă pare să nu funcționeze).',
    'Un singur `exit`: rămâi în chroot sau în initramfs.',
    'Scrierea parametrului la altă linie decât cea a kernelului sau cu majuscule.',
  ],
  troubleshooting: [
    { symptom: '`passwd: Authentication token manipulation error`', cause: '/sysroot este read-only sau nu ai făcut chroot', fix: '`mount -o remount,rw /sysroot`, apoi `chroot /sysroot`.' },
    { symptom: 'după reboot, parola nouă este respinsă', cause: 'lipsă reetichetare SELinux', fix: 'repetă procedura și rulează `touch /.autorelabel` înainte de ieșire.' },
    { symptom: 'sistemul „îngheață” după `exit`', cause: 'reetichetarea rulează', fix: 'așteaptă; poate dura câteva minute, apoi repornește singur.' },
    { symptom: 'meniul GRUB2 cere parolă', cause: 'GRUB protejat cu parolă', fix: 'folosește parola GRUB; fără ea nu poți edita (măsură de securitate).' },
  ],
  alternatives: [
    'Poți șterge `rhgb quiet` din linie ca să vezi mesajele de boot.',
    'Un alt mod este să adaugi `systemd.unit=emergency.target`, dar cere parola root; rd.break nu cere.',
    'Parola se poate seta și non-interactiv, cu `echo \'PAROLA\' | passwd --stdin root` (doar în laborator; parola rămâne în istoricul comenzii).',
  ],
};
