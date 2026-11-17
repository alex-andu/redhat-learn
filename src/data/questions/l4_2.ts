import type { Question } from '../../lib/types';

const T = 'L4.2';
const O = ['C4-2', 'C7-3'];

export const Q_L4_2: Question[] = [
  {
    id: 'L4.2-001', topicId: T, objectives: ['C4-2'], difficulty: 1, type: 'single',
    stem: 'Ce este un [[systemd-target]]?',
    explanation: 'Un target grupează unități și reprezintă o stare a sistemului.',
    options: [
      { id: 'a', text: 'O unitate systemd care grupează alte unități și definește o stare a sistemului (de ex. mod text multi-user sau grafic).', correct: true, why: 'Este înlocuitorul runlevel-urilor din SysV.' },
      { id: 'b', text: 'O adresă de rețea către care se transferă fișiere.', correct: false, why: '„Target” aici nu are legătură cu rețeaua sau transferul.' },
      { id: 'c', text: 'O partiție de pe disc de unde pornește kernelul.', correct: false, why: 'Kernelul este încărcat de GRUB2; target-ul este o noțiune systemd, de după kernel.' },
      { id: 'd', text: 'Un tip de fișier de configurare pentru firewall.', correct: false, why: 'Firewalld folosește zone, nu target-uri systemd.' },
    ],
  },
  {
    id: 'L4.2-002', topicId: T, objectives: ['C7-3'], difficulty: 1, type: 'cli',
    stem: 'Afișează target-ul în care pornește implicit sistemul.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl get-default'],
    canonical: 'systemctl get-default',
    explanation: '`get-default` citește legătura `default.target`.',
    wrong: [
      { text: 'systemctl default', why: 'Nu există acțiunea `default`; este `get-default` sau `set-default`.' },
      { text: 'systemctl list-default', why: 'Nu există; `list-units` și `list-unit-files` listează unități, nu target-ul implicit.' },
      { text: 'systemctl status default', why: '`status` descrie o unitate; nu răspunde la „care este target-ul implicit?”.' },
    ],
  },
  {
    id: 'L4.2-003', topicId: T, objectives: ['C7-3'], difficulty: 2, type: 'cli',
    stem: 'Configurează sistemul să pornească automat în mod text, multi-user.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl set-default multi-user.target', 'systemctl set-default multi-user'],
    canonical: 'systemctl set-default multi-user.target',
    explanation: '`set-default` actualizează legătura `default.target`; efectul se vede la următorul boot.',
    wrong: [
      { text: 'systemctl isolate multi-user.target', why: '`isolate` schimbă starea ACUM, dar nu modifică target-ul implicit; la reboot revine vechea valoare.' },
      { text: 'systemctl enable multi-user.target', why: '`enable` activează o unitate la boot, nu stabilește target-ul implicit.' },
      { text: 'systemctl set-default text', why: '„text” nu este un target; numele corect este `multi-user.target`.' },
    ],
  },
  {
    id: 'L4.2-004', topicId: T, objectives: ['C7-3'], difficulty: 2, type: 'single',
    stem: 'Ai rulat `systemctl isolate multi-user.target` pe un sistem cu `graphical.target` implicit, apoi ai repornit. În ce target pornește?',
    explanation: '`isolate` este temporar. Doar `set-default` schimbă target-ul de la boot.',
    options: [
      { id: 'a', text: 'În `graphical.target`, pentru că target-ul implicit nu a fost modificat.', correct: true, why: '`isolate` schimbă starea curentă a sistemului, nu `default.target`.' },
      { id: 'b', text: 'În `multi-user.target`, pentru că `isolate` salvează alegerea.', correct: false, why: '`isolate` nu persistă.' },
      { id: 'c', text: 'În `rescue.target`, ca măsură de siguranță.', correct: false, why: 'Rescue nu pornește fără să fie cerut.' },
      { id: 'd', text: 'Nu pornește, pentru că `default.target` s-a șters.', correct: false, why: '`isolate` nu atinge legătura `default.target`.' },
    ],
  },
  {
    id: 'L4.2-005', topicId: T, objectives: ['C4-2'], difficulty: 2, type: 'single',
    stem: 'Vrei să pornești o singură dată în `rescue.target`, fără să schimbi nimic permanent. Ce faci?',
    explanation: 'În meniul GRUB2 editezi (tasta `e`) linia kernelului și adaugi `systemd.unit=rescue.target`; pornești cu `Ctrl+x`. Modificarea nu se salvează.',
    options: [
      { id: 'a', text: 'În GRUB2: `e`, adaugi `systemd.unit=rescue.target` la linia kernelului, apoi `Ctrl+x`.', correct: true, why: 'Parametrul se aplică doar acestui boot.' },
      { id: 'b', text: '`systemctl set-default rescue.target`, apoi reboot.', correct: false, why: 'Ar face rescue permanent, nu „o singură dată”; sistemul ar porni mereu în rescue.' },
      { id: 'c', text: 'Editezi `/etc/fstab` și pui `rescue` în a șasea coloană.', correct: false, why: '`/etc/fstab` descrie montările, nu target-ul de boot.' },
      { id: 'd', text: 'Ștergi `/etc/systemd/system/default.target`.', correct: false, why: 'Fără el, sistemul folosește implicit `graphical.target`, nu rescue.' },
    ],
  },
  {
    id: 'L4.2-006', topicId: T, objectives: ['C4-2'], difficulty: 3, type: 'single',
    stem: 'Ce arată această ieșire?',
    explanation: '`default.target` este o legătură simbolică; ținta ei este target-ul implicit.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# ls -l /etc/systemd/system/default.target\nlrwxrwxrwx. 1 root root 41 Nov 16 10:02 /etc/systemd/system/default.target -> /usr/lib/systemd/system/multi-user.target' },
    options: [
      { id: 'a', text: 'Sistemul pornește implicit în `multi-user.target`.', correct: true, why: 'Săgeata `->` arată ținta legăturii simbolice.' },
      { id: 'b', text: 'Sistemul pornește în `graphical.target`.', correct: false, why: 'Ținta este `multi-user.target`, nu `graphical.target`.' },
      { id: 'c', text: '`default.target` este un fișier obișnuit de 41 de octeți.', correct: false, why: 'Prima literă `l` indică o legătură simbolică.' },
      { id: 'd', text: 'Legătura este ruptă și sistemul nu va porni.', correct: false, why: 'Ținta există în `/usr/lib/systemd/system`; nu apare niciun semn de legătură ruptă.' },
    ],
  },
  {
    id: 'L4.2-007', topicId: T, objectives: ['C4-2'], difficulty: 2, type: 'match',
    stem: 'Potrivește target-ul cu rolul lui.',
    explanation: 'Fiecare target descrie o stare: de la recuperare minimă până la sistem grafic.',
    leftLabel: 'Target', rightLabel: 'Rol',
    pairs: [
      { left: '`emergency.target`', right: 'shell minimal; aproape nimic pornit, rădăcina poate fi doar-citire', why: 'Cel mai redus mod de recuperare.' },
      { left: '`rescue.target`', right: 'sistem de bază cu sisteme de fișiere montate și shell de root', why: 'Mai complet decât emergency.' },
      { left: '`multi-user.target`', right: 'sistem multi-utilizator în mod text, cu rețea', why: 'Implicit pe servere.' },
      { left: '`graphical.target`', right: 'multi-user plus interfață grafică de login', why: 'Include multi-user.target.' },
    ],
    distractors: [{ text: 'repornește sistemul', why: 'Repornirea este `reboot.target` (L4.1), nu unul dintre acestea.' }],
  },
  {
    id: 'L4.2-008', topicId: T, objectives: ['C4-2'], difficulty: 3, type: 'single',
    stem: 'Colegul vrea să pornească în mod text o singură dată și a scris în GRUB linia de mai jos. Ce nu merge?',
    explanation: 'Parametrul trebuie să fie `systemd.unit=NUME.target`; scrierea greșită este ignorată și sistemul pornește în target-ul implicit.',
    snippet: { kind: 'find-error', title: 'linia kernelului (fragment)', code: 'linux ($root)/vmlinuz-5.14.0 root=/dev/mapper/rhel-root ro rhgb quiet systemd.target=multi-user.target' },
    options: [
      { id: 'a', text: 'Parametrul corect este `systemd.unit=multi-user.target`, nu `systemd.target=…`.', correct: true, why: 'Kernelul/systemd recunosc `systemd.unit=`; `systemd.target=` este necunoscut și ignorat.' },
      { id: 'b', text: 'Lipsește `rd.break`.', correct: false, why: '`rd.break` oprește boot-ul în initramfs; nu este necesar aici (L4.3).' },
      { id: 'c', text: 'Nu se poate adăuga nimic la linia kernelului.', correct: false, why: 'Se poate, temporar, din meniul GRUB.' },
      { id: 'd', text: '`multi-user.target` nu poate fi atins la boot.', correct: false, why: 'Este un target normal.' },
    ],
  },
  {
    id: 'L4.2-009', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a face permanent mod text pe un server, fără reboot imediat.',
    explanation: 'Verifici starea curentă, setezi implicitul, confirmi, apoi (opțional) treci acum în target.',
    items: [
      { text: '`systemctl get-default`', why: 'Vezi valoarea curentă.' },
      { text: '`systemctl set-default multi-user.target`', why: 'Modifici legătura default.target.' },
      { text: '`systemctl get-default`', why: 'Confirmi că noua valoare este citită.' },
      { text: '`systemctl isolate multi-user.target`', why: 'Treci imediat în target, fără reboot (opțional).' },
    ],
  },
  {
    id: 'L4.2-010', topicId: T, objectives: ['C4-2'], difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre `rescue.target` și `emergency.target` sunt adevărate? (alege toate cele corecte)',
    explanation: 'Ambele sunt moduri de recuperare cu shell de root; emergency este mai minimal.',
    options: [
      { id: 'a', text: '`rescue.target` montează sistemele de fișiere și pornește doar serviciile de bază.', correct: true, why: 'Este un sistem „de bază” funcțional.' },
      { id: 'b', text: '`emergency.target` nu pornește alte servicii sau montări; rădăcina poate fi doar-citire.', correct: true, why: 'Cel mai redus mod; poate fi nevoie de `mount -o remount,rw /`.' },
      { id: 'c', text: 'Ambele cer, de regulă, parola de root.', correct: true, why: 'Shell-ul de rescue este deschis prin `sulogin`, care cere parola root.' },
      { id: 'd', text: 'Ambele pornesc interfața grafică.', correct: false, why: 'Sunt moduri text, de recuperare.' },
    ],
  },
];
