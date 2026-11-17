import type { Question } from '../../lib/types';

const T = 'L4.3';
const O = ['C4-3'];

export const Q_L4_3: Question[] = [
  {
    id: 'L4.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai pierdut parola de root a propriei mașini virtuale. Ce parametru adaugi la linia kernelului în GRUB2 ca să obții un shell fără parolă, în initramfs?',
    explanation: '`rd.break` oprește boot-ul în initramfs, înainte ca rădăcina reală să devină „/”. `rescue.target` ar cere parola de root.',
    options: [
      { id: 'a', text: '`rd.break`', correct: true, why: 'Boot-ul se oprește în initramfs, cu shell de root fără parolă.' },
      { id: 'b', text: '`systemd.unit=rescue.target`', correct: false, why: 'Rescue cere parola de root prin sulogin, deci nu ajută când parola e pierdută.' },
      { id: 'c', text: '`quiet`', correct: false, why: '`quiet` doar reduce mesajele de boot.' },
      { id: 'd', text: '`ro`', correct: false, why: '`ro` montează rădăcina read-only; nu oprește boot-ul.' },
    ],
  },
  {
    id: 'L4.3-002', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru resetarea parolei root cu `rd.break`.',
    explanation: 'Rădăcina este montată la `/sysroot`, read-only: o remontezi scriibilă, intri cu chroot, schimbi parola, ceri reetichetare, ieși.',
    items: [
      { text: 'În GRUB2: `e`, adaugi `rd.break` la linia kernelului, `Ctrl+x`', why: 'Ajungi în shell-ul initramfs.' },
      { text: '`mount -o remount,rw /sysroot`', why: '/sysroot este read-only; fără asta, passwd nu poate scrie.' },
      { text: '`chroot /sysroot`', why: 'Faci din sistemul tău „/”, ca passwd să modifice fișierele reale.' },
      { text: '`passwd root`', why: 'Setezi noua parolă.' },
      { text: '`touch /.autorelabel`', why: 'Cere reetichetare SELinux la boot.' },
      { text: '`exit` de două ori', why: 'Prima ieșire părăsește chroot, a doua continuă boot-ul.' },
    ],
  },
  {
    id: 'L4.3-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'În shell-ul initramfs (după `rd.break`), remontează `/sysroot` cu drept de scriere.',
    prompt: 'switch_root:/#',
    answers: ['mount -o remount,rw /sysroot', 'mount -o rw,remount /sysroot'],
    canonical: 'mount -o remount,rw /sysroot',
    explanation: '`-o remount,rw` schimbă opțiunile unei montări existente: o face read-write.',
    wrong: [
      { text: 'mount /sysroot', why: 'Montarea există deja; fără `-o remount` nu se schimbă nimic și mount poate eșua.' },
      { text: 'mount -o remount,ro /sysroot', why: '`ro` ar menține sau readuce read-only.' },
      { text: 'chroot /sysroot', why: 'Este pasul următor, nu cel care remontează.' },
    ],
  },
  {
    id: 'L4.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce face `chroot /sysroot` în procedura de recuperare?',
    explanation: '`chroot` schimbă rădăcina: după el, `/` înseamnă `/sysroot`.',
    options: [
      { id: 'a', text: 'Face din `/sysroot` directorul „/” al shell-ului, ca `passwd` să modifice fișierele reale ale sistemului.', correct: true, why: 'Fără chroot, `passwd` ar acționa pe fișierele din initramfs, nu pe cele de pe disc.' },
      { id: 'b', text: 'Montează discul în `/sysroot`.', correct: false, why: 'Montarea a fost făcută deja de kernel; `chroot` nu montează.' },
      { id: 'c', text: 'Schimbă proprietarul directorului `/sysroot` în root.', correct: false, why: 'Proprietarul se schimbă cu `chown`.' },
      { id: 'd', text: 'Pornește sistemul în rescue.target.', correct: false, why: '`chroot` nu are legătură cu target-urile systemd.' },
    ],
  },
  {
    id: 'L4.3-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce se rulează `touch /.autorelabel` după `passwd`?',
    explanation: '`passwd` rulat din initramfs creează un `/etc/shadow` cu context SELinux greșit. Fișierul `/.autorelabel` cere reetichetarea la următorul boot.',
    options: [
      { id: 'a', text: 'Ca SELinux să reeticheteze sistemul de fișiere la boot; altfel, `/etc/shadow` poate avea o etichetă greșită și autentificarea poate eșua.', correct: true, why: 'Este pasul care previne blocajul cauzat de contextul SELinux.' },
      { id: 'b', text: 'Ca parola să nu expire niciodată.', correct: false, why: 'Expirarea parolelor se gestionează cu `chage` (C9).' },
      { id: 'c', text: 'Ca sistemul să pornească mai repede.', correct: false, why: 'Reetichetarea îl pornește mai încet, o singură dată.' },
      { id: 'd', text: 'Ca să se șteargă jurnalele vechi.', correct: false, why: 'Nu are legătură cu jurnalele.' },
    ],
  },
  {
    id: 'L4.3-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce indică acest prompt și ce trebuie făcut întâi?',
    explanation: 'În shell-ul initramfs, rădăcina reală este în `/sysroot`, montată read-only: `passwd` ar eșua pe un sistem read-only.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'consolă', code: 'switch_root:/# passwd root\npasswd: Authentication token manipulation error\nswitch_root:/# mount | grep sysroot\n/dev/mapper/rhel-root on /sysroot type xfs (ro,relatime,seclabel,attr2,inode64)' },
    options: [
      { id: 'a', text: 'Ești în initramfs, iar `/sysroot` este `ro`: trebuie `mount -o remount,rw /sysroot` și `chroot /sysroot`.', correct: true, why: 'Eroarea apare pentru că `passwd` rulează pe initramfs, nu pe sistemul tău, și pentru că discul este read-only.' },
      { id: 'b', text: 'Sistemul de fișiere este corupt și trebuie formatat.', correct: false, why: '`ro` este starea normală în această etapă, nu un semn de corupție.' },
      { id: 'c', text: 'Comanda `passwd` nu este instalată.', correct: false, why: 'Mesajul este despre manipularea tokenului, nu despre o comandă lipsă.' },
      { id: 'd', text: 'Trebuie rulat `systemctl reboot` pentru a trece de eroare.', correct: false, why: 'Un reboot nu rezolvă și ar anula editarea temporară din GRUB2.' },
    ],
  },
  {
    id: 'L4.3-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Colegul a făcut procedura, dar după reboot parola nouă nu este acceptată. Ce a omis cel mai probabil?',
    explanation: 'Fără `/.autorelabel`, `/etc/shadow` păstrează o etichetă SELinux greșită și autentificarea poate fi blocată.',
    snippet: { kind: 'find-error', title: 'pașii făcuți', code: 'mount -o remount,rw /sysroot\nchroot /sysroot\npasswd root\nexit\nexit' },
    options: [
      { id: 'a', text: '`touch /.autorelabel` (reetichetarea SELinux) înainte de ieșire.', correct: true, why: 'Este pasul care corectează contextul fișierelor create în initramfs.' },
      { id: 'b', text: '`systemctl enable sshd`', correct: false, why: 'Serviciul SSH nu influențează autentificarea la consolă.' },
      { id: 'c', text: '`mount -o remount,ro /sysroot`', correct: false, why: 'Remontarea read-only nu este necesară și nu repară nimic.' },
      { id: 'd', text: '`systemctl set-default rescue.target`', correct: false, why: 'Ar schimba target-ul implicit, nu ar rezolva parola.' },
    ],
  },
  {
    id: 'L4.3-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre editarea liniei kernelului din meniul GRUB2 sunt adevărate? (alege toate cele corecte)',
    explanation: 'Editarea cu `e` este temporară; parametrii se adaugă la linia kernelului; `Ctrl+x` pornește.',
    options: [
      { id: 'a', text: 'Modificarea este valabilă doar pentru acel boot.', correct: true, why: 'Nu se salvează pe disc.' },
      { id: 'b', text: 'Pornești cu `Ctrl+x`.', correct: true, why: 'Este combinația de pornire; `Esc` anulează editarea.' },
      { id: 'c', text: 'Parametrii noi se adaugă la sfârșitul liniei kernelului.', correct: true, why: 'Se separă cu spațiu de ceilalți parametri.' },
      { id: 'd', text: 'Modificarea rămâne permanent după reboot.', correct: false, why: 'Pentru schimbări permanente se folosește un instrument precum `grubby` (în afara acestei lecții).' },
    ],
  },
  {
    id: 'L4.3-009', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește elementul cu rolul lui în procedură.',
    explanation: 'Fiecare piesă a procedurii are un rol precis.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`rd.break`', right: 'oprește boot-ul în initramfs, fără parolă', why: 'Ne dă shell de root înainte de montarea finală a rădăcinii.' },
      { left: '`/sysroot`', right: 'locul unde este montată rădăcina reală, read-only', why: 'Trebuie remontat rw.' },
      { left: '`chroot /sysroot`', right: 'face sistemul tău „/” pentru shell', why: 'Comenzile acționează pe fișierele tale.' },
      { left: '`/.autorelabel`', right: 'cere reetichetare SELinux la boot', why: 'Corectează etichetele fișierelor modificate în initramfs.' },
    ],
    distractors: [{ text: 'activează firewall-ul', why: 'Niciunul nu atinge firewall-ul.' }],
  },
];
