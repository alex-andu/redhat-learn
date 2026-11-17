import type { Question } from '../../lib/types';

const T = 'L10.3';
const O = ['C10-4'];

export const Q_L10_3: Question[] = [
  {
    id: 'L10.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre modul `enforcing` și `permissive`?',
    explanation: 'Ambele încarcă politica și înregistrează refuzările; doar enforcing le și blochează.',
    options: [
      { id: 'a', text: 'În enforcing acțiunile refuzate sunt blocate și înregistrate; în permissive sunt doar înregistrate și lăsate să continue.', correct: true, why: 'Definițiile din selinux(8).' },
      { id: 'b', text: 'Permissive oprește complet SELinux.', correct: false, why: 'Politica rămâne încărcată; oprirea este „disabled”.' },
      { id: 'c', text: 'Enforcing se aplică doar utilizatorului root.', correct: false, why: 'Se aplică proceselor, după domeniu, nu utilizatorilor root.' },
      { id: 'd', text: 'Permissive blochează, enforcing doar înregistrează.', correct: false, why: 'Exact invers.' },
    ],
  },
  {
    id: 'L10.3-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează modul SELinux curent (Enforcing, Permissive sau Disabled).',
    prompt: '[student@server1 ~]$',
    answers: ['getenforce'],
    canonical: 'getenforce',
    explanation: 'getenforce afișează modul curent.',
    wrong: [
      { text: 'setenforce', why: 'setenforce schimbă modul și cere un argument.' },
      { text: 'selinux status', why: 'Nu există o astfel de comandă.' },
      { text: 'cat /etc/selinux/config', why: 'Arată modul din config (la boot), nu modul curent.' },
    ],
  },
  {
    id: 'L10.3-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Treci SELinux în `permissive` doar pentru sesiunea curentă (până la reboot), folosind forma numerică.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo setenforce 0', 'setenforce 0'],
    canonical: 'sudo setenforce 0',
    explanation: '0 = permissive, 1 = enforcing; modificarea nu persistă.',
    wrong: [
      { text: 'sudo setenforce 1', why: '1 = enforcing, nu permissive.' },
      { text: 'sudo setenforce disabled', why: 'setenforce nu acceptă „disabled”.' },
      { text: 'sudo sed -i s/enforcing/permissive/ /etc/selinux/config', why: 'Modifică modul de la boot, nu pe cel curent.' },
    ],
  },
  {
    id: 'L10.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei ca SELinux să fie `permissive` după FIECARE reboot. Ce faci?',
    explanation: 'Modul de la boot vine din /etc/selinux/config.',
    options: [
      { id: 'a', text: 'Pui `SELINUX=permissive` în `/etc/selinux/config`.', correct: true, why: 'Directiva este citită la boot (selinux_config(5)).' },
      { id: 'b', text: 'Rulezi `setenforce 0` o dată.', correct: false, why: 'Modul curent se pierde la reboot.' },
      { id: 'c', text: 'Pui `SELINUXTYPE=permissive`.', correct: false, why: 'SELINUXTYPE alege politica (targeted/mls), nu modul.' },
      { id: 'd', text: 'Rulezi `sestatus -v`.', correct: false, why: 'Este o comandă de citire; nu schimbă nimic.' },
    ],
  },
  {
    id: 'L10.3-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce indică acest output?',
    explanation: 'Modul curent diferă de cel din config: s-a folosit setenforce (sau parametru kernel).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sestatus (extras)', code: 'Current mode:                   permissive\nMode from config file:          enforcing' },
    options: [
      { id: 'a', text: 'Sistemul rulează acum în permissive, dar la reboot va reveni la enforcing.', correct: true, why: 'Modul din config se aplică la boot; cel curent a fost schimbat la rulare.' },
      { id: 'b', text: 'Sistemul va fi permissive și după reboot.', correct: false, why: 'Config-ul spune enforcing.' },
      { id: 'c', text: 'SELinux este dezactivat.', correct: false, why: 'Dezactivat ar apărea ca disabled.' },
      { id: 'd', text: 'Fișierul /etc/selinux/config este corupt.', correct: false, why: 'Config-ul este valid; diferența este normală după setenforce.' },
    ],
  },
  {
    id: 'L10.3-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre SELinux sunt corecte?',
    explanation: 'SELinux este MAC suplimentar; accesul trebuie permis de DAC și MAC.',
    options: [
      { id: 'a', text: 'Funcționează în plus față de permisiunile clasice: un acces trebuie permis de ambele.', correct: true, why: 'DAC este verificat întâi, apoi SELinux.' },
      { id: 'b', text: 'Politica targeted confinează în principal serviciile (demoanele).', correct: true, why: 'selinux(8): targeted confinează doar anumite servicii.' },
      { id: 'c', text: 'Refuzările sunt înregistrate în jurnalul de audit (AVC).', correct: true, why: 'Mesaje type=AVC în /var/log/audit/audit.log.' },
      { id: 'd', text: 'chmod 777 rezolvă orice refuzare SELinux.', correct: false, why: 'DAC și MAC sunt straturi diferite.' },
    ],
  },
  {
    id: 'L10.3-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un serviciu nu mai funcționează. Treci în permissive și problema dispare. Ce înseamnă și ce faci în continuare?',
    explanation: 'SELinux era cauza; revii în enforcing și repari cauza.',
    options: [
      { id: 'a', text: 'SELinux bloca o acțiune; revii în enforcing și repari cauza (etichetă, port sau boolean).', correct: true, why: 'Permissive e doar instrument de diagnostic.' },
      { id: 'b', text: 'Lași sistemul în permissive.', correct: false, why: 'Pierzi protecția și eșuezi la task-uri care cer enforcing.' },
      { id: 'c', text: 'Pui `SELINUX=disabled`.', correct: false, why: 'Depreciat și cere relabel la reactivare.' },
      { id: 'd', text: 'Reinstalezi serviciul.', correct: false, why: 'Cauza este politica/etichetele, nu pachetul.' },
    ],
  },
  {
    id: 'L10.3-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Fișierul de configurare conține următoarele linii. De ce nu pornește SELinux în enforcing?',
    explanation: 'Valori valide: enforcing, permissive, disabled; textul „enforce” este greșit.',
    snippet: { kind: 'find-error', title: '/etc/selinux/config', code: 'SELINUX=enforce\nSELINUXTYPE=targeted' },
    options: [
      { id: 'a', text: 'Valoarea `enforce` nu este validă; trebuie `enforcing`.', correct: true, why: 'selinux_config(5): enforcing | permissive | disabled.' },
      { id: 'b', text: '`targeted` nu poate fi folosit cu enforcing.', correct: false, why: 'targeted este politica standard RHEL.' },
      { id: 'c', text: 'Lipsește directiva SELINUXLOG.', correct: false, why: 'Nu există această directivă.' },
      { id: 'd', text: 'Config-ul trebuie scris cu majuscule.', correct: false, why: 'Valorile sunt litere mici.' },
    ],
  },
  {
    id: 'L10.3-009', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'SELinux a fost `disabled` luni de zile. Îl activezi în config (`SELINUX=enforcing`). Ce trebuie să faci în plus înainte de reboot?',
    explanation: 'Fișierele create în acest timp nu au etichete; este necesară reetichetarea.',
    options: [
      { id: 'a', text: '`touch /.autorelabel`, apoi reboot (sistemul reeticheteză la pornire).', correct: true, why: 'Fișierele create cât SELinux era oprit nu au etichete.' },
      { id: 'b', text: 'Nimic: enforcing se aplică imediat.', correct: false, why: 'Fără etichete, serviciile pot fi blocate.' },
      { id: 'c', text: '`setenforce 1` fără reboot.', correct: false, why: 'Nu funcționează cât politica nu este încărcată.' },
      { id: 'd', text: '`dnf remove selinux-policy`.', correct: false, why: 'Ai elimina politica.' },
    ],
  },
  {
    id: 'L10.3-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru: „SELinux trebuie să fie enforcing acum ȘI după reboot”.',
    explanation: 'Config pentru boot, setenforce pentru acum, verificare.',
    items: [
      { text: '`getenforce` și `sestatus` — notezi starea', why: 'Știi de unde pleci.' },
      { text: 'Pui `SELINUX=enforcing` în `/etc/selinux/config`', why: 'Valoarea de la boot.' },
      { text: '`sudo setenforce 1`', why: 'Aplică imediat.' },
      { text: '`sestatus | grep mode` — cele două moduri coincid', why: 'Confirmi cele două straturi.' },
      { text: 'Reboot și `getenforce`', why: 'Testul final al persistenței.' },
    ],
  },
  {
    id: 'L10.3-011', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda sau fișierul cu rolul lui.',
    explanation: 'Fiecare instrument are un scop distinct.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`getenforce`', right: 'afișează modul curent', why: 'Enforcing / Permissive / Disabled.' },
      { left: '`setenforce`', right: 'schimbă modul curent (temporar)', why: 'Nu modifică /etc/selinux/config.' },
      { left: '`/etc/selinux/config`', right: 'modul și politica de la boot', why: 'Directivele SELINUX= și SELINUXTYPE=.' },
      { left: '`sestatus`', right: 'starea completă, inclusiv mod curent și mod din config', why: 'Ieșire cu mai multe câmpuri.' },
    ],
    distractors: [{ text: 'restaurează etichetele fișierelor', why: 'Aceasta este treaba lui restorecon (L10.5).' }],
  },
  {
    id: 'L10.3-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'În `/etc/selinux/config` scrie `SELINUX=enforcing`, dar `getenforce` arată `Permissive` după reboot. Care este explicația cea mai probabilă?',
    explanation: 'Un parametru kernel (enforcing=0) suprascrie config-ul.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/proc/cmdline', code: 'BOOT_IMAGE=(hd0,msdos1)/vmlinuz-6.12.0 root=/dev/mapper/rhel-root ro rhgb quiet enforcing=0' },
    options: [
      { id: 'a', text: 'Parametrul `enforcing=0` din linia kernelului; îl elimini cu `grubby --update-kernel=ALL --remove-args=enforcing=0`.', correct: true, why: 'Parametrul de boot are prioritate la pornire.' },
      { id: 'b', text: 'Fișierul config nu este citit niciodată.', correct: false, why: 'Este citit la boot, dar poate fi suprascris.' },
      { id: 'c', text: 'Politica targeted nu poate fi enforcing.', correct: false, why: 'Targeted este politica implicită enforcing.' },
      { id: 'd', text: 'Trebuie `SELINUXTYPE=enforcing`.', correct: false, why: 'SELINUXTYPE alege politica, nu modul.' },
    ],
  },
];
