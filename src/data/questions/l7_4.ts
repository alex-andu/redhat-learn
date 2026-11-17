import type { Question } from '../../lib/types';

const T = 'L7.4';
const O = ['C7-6'];

export const Q_L7_4: Question[] = [
  {
    id: 'L7.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este rolul bootloader-ului ([[grub2]]) în pornirea sistemului?',
    explanation: 'GRUB încarcă kernelul și initramfs-ul și îi pasează linia de comandă.',
    options: [
      { id: 'a', text: 'Încarcă kernelul și initramfs-ul în memorie și îi dă kernelului argumentele de pornire.', correct: true, why: 'Este pasul dintre firmware și kernel.' },
      { id: 'b', text: 'Montează sistemele de fișiere din `/etc/fstab`.', correct: false, why: 'Aceasta o face systemd, după ce kernelul a pornit.' },
      { id: 'c', text: 'Pornește serviciile systemd.', correct: false, why: 'systemd (PID 1) pornește serviciile, după kernel.' },
      { id: 'd', text: 'Setează ceasul prin NTP.', correct: false, why: 'chrony (L7.3) se ocupă de timp.' },
    ],
  },
  {
    id: 'L7.4-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Unde vezi argumentele cu care a pornit kernelul CURENT?',
    explanation: '`/proc/cmdline` conține linia de comandă a boot-ului actual.',
    options: [
      { id: 'a', text: '`cat /proc/cmdline`', correct: true, why: 'Este dovada finală a ce a pasat bootloader-ul kernelului.' },
      { id: 'b', text: '`cat /etc/default/grub`', correct: false, why: 'Arată setările configurate, nu ce s-a aplicat la boot-ul curent.' },
      { id: 'c', text: '`cat /boot/grub2/grub.cfg`', correct: false, why: 'Este fișierul generat; nu garantează ce a pornit efectiv.' },
      { id: 'd', text: '`uname -r`', correct: false, why: 'Arată doar versiunea kernelului.' },
    ],
  },
  {
    id: 'L7.4-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce face următoarea comandă?',
    explanation: '`--update-kernel=ALL` acționează pe toate intrările; `--remove-args` scoate argumentele indicate.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'comandă', code: 'sudo grubby --update-kernel=ALL --remove-args="rhgb quiet"' },
    options: [
      { id: 'a', text: 'Scoate argumentele `rhgb` și `quiet` din toate intrările de kernel, permanent.', correct: true, why: 'grubby modifică intrările BLS; efectul apare la următorul boot.' },
      { id: 'b', text: 'Scoate argumentele doar pentru boot-ul curent.', correct: false, why: 'Modificarea este permanentă, nu temporară; temporar este doar editarea din meniu.' },
      { id: 'c', text: 'Șterge kernelul implicit.', correct: false, why: 'grubby nu șterge kernelul aici; modifică argumentele.' },
      { id: 'd', text: 'Regenerează `grub.cfg`.', correct: false, why: 'Regenerarea se face cu grub2-mkconfig.' },
    ],
  },
  {
    id: 'L7.4-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează calea kernelului care va porni implicit.',
    prompt: '[root@server1 ~]#',
    answers: ['grubby --default-kernel', 'sudo grubby --default-kernel'],
    canonical: 'grubby --default-kernel',
    explanation: '`--default-kernel` tipărește calea completă a kernelului implicit.',
    wrong: [
      { text: 'uname -r', why: 'Arată kernelul care rulează acum, nu cel implicit la următorul boot.' },
      { text: 'grubby --info=ALL', why: 'Listează toate intrările, nu doar calea implicitului.' },
      { text: 'cat /proc/cmdline', why: 'Arată argumentele boot-ului curent, nu kernelul implicit.' },
    ],
  },
  {
    id: 'L7.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai schimbat `GRUB_TIMEOUT=10` în `/etc/default/grub`, dar meniul tot așteaptă 5 secunde. Ce lipsește?',
    explanation: 'GRUB citește `grub.cfg`, care trebuie regenerat din `/etc/default/grub`.',
    options: [
      { id: 'a', text: '`grub2-mkconfig -o <calea lui grub.cfg>`', correct: true, why: 'Regenerează grub.cfg pe baza setărilor din /etc/default/grub.' },
      { id: 'b', text: '`grubby --update-kernel=ALL`', correct: false, why: 'grubby modifică intrările de kernel, nu timeout-ul din meniu.' },
      { id: 'c', text: '`systemctl restart grub`', correct: false, why: 'GRUB nu este un serviciu systemd.' },
      { id: 'd', text: '`daemon-reload`', correct: false, why: 'Se referă la unități systemd, nu la GRUB.' },
    ],
  },
  {
    id: 'L7.4-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce NU se editează `/boot/grub2/grub.cfg` de mână?',
    explanation: 'Este un fișier generat; se rescrie la regenerare.',
    options: [
      { id: 'a', text: 'Este generat de `grub2-mkconfig`; modificările manuale se pierd la următoarea regenerare.', correct: true, why: 'Setările se pun în /etc/default/grub și în intrările BLS, apoi se regenerează.' },
      { id: 'b', text: 'Este protejat și nu poate fi citit nici de root.', correct: false, why: 'Root îl poate citi și scrie; problema este că se regenerează.' },
      { id: 'c', text: 'Nu există pe RHEL.', correct: false, why: 'Există (calea exactă diferă între versiuni și BIOS/UEFI).' },
      { id: 'd', text: 'Este un script executabil.', correct: false, why: 'Este un fișier de configurare citit de GRUB.' },
    ],
  },
  {
    id: 'L7.4-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre acestea modifică PERMANENT argumentele de kernel ale intrărilor existente?',
    explanation: 'grubby modifică intrările BLS; editarea din meniul GRUB este temporară.',
    options: [
      { id: 'a', text: '`grubby --update-kernel=ALL --args="console=tty0"`', correct: true, why: 'Scrie argumentul în intrările BLS.' },
      { id: 'b', text: '`grubby --update-kernel=DEFAULT --remove-args="quiet"`', correct: true, why: 'Scoate argumentul din intrarea implicită, permanent.' },
      { id: 'c', text: 'Tasta `e` în meniul GRUB, apoi modifici linia `linux`.', correct: false, why: 'Editarea din meniu este valabilă doar pentru acel boot.' },
      { id: 'd', text: '`echo quiet >> /proc/cmdline`', correct: false, why: '/proc/cmdline este read-only și nu configurează bootloader-ul.' },
    ],
  },
  {
    id: 'L7.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce este greșit în fișierul de mai jos?',
    explanation: 'Fișierul este un script shell: în jurul lui `=` nu pot exista spații.',
    snippet: { kind: 'find-error', title: '/etc/default/grub', code: 'GRUB_TIMEOUT = 10\nGRUB_DEFAULT=saved\nGRUB_CMDLINE_LINUX="rd.lvm.lv=rhel/root rhgb quiet"' },
    options: [
      { id: 'a', text: 'Spații în jurul lui `=` la `GRUB_TIMEOUT`; sintaxa shell cere `GRUB_TIMEOUT=10`.', correct: true, why: 'Un spațiu înainte de = face ca shell-ul să interpreteze GRUB_TIMEOUT ca o comandă.' },
      { id: 'b', text: 'Valoarea `saved` este invalidă la GRUB_DEFAULT.', correct: false, why: 'saved este o valoare permisă (manualul GRUB).' },
      { id: 'c', text: 'Argumentele din GRUB_CMDLINE_LINUX nu pot fi între ghilimele.', correct: false, why: 'Ghilimelele sunt necesare când sunt mai multe argumente.' },
      { id: 'd', text: 'Lipsește punct și virgulă la sfârșitul liniilor.', correct: false, why: 'Nu este nevoie de ; într-un fișier shell cu câte o atribuire pe linie.' },
    ],
  },
  {
    id: 'L7.4-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a scoate `rhgb quiet` din kernel și a confirma rezultatul.',
    explanation: 'Mai întâi copia/inspecția, apoi modificarea, verificarea înainte de reboot și dovada finală după reboot.',
    items: [
      { text: '`grubby --info=DEFAULT` (notezi argumentele curente) și o copie a `/boot/loader/entries`', why: 'Ai o stare de referință și o cale de întoarcere.' },
      { text: '`grubby --update-kernel=ALL --remove-args="rhgb quiet"`', why: 'Modifici intrările BLS.' },
      { text: '`grubby --info=DEFAULT | grep args`', why: 'Verifici înainte de reboot că argumentele au dispărut.' },
      { text: '`reboot`', why: 'Modificarea se aplică la următorul boot.' },
      { text: '`cat /proc/cmdline`', why: 'Dovada finală: argumentele efective ale boot-ului nou.' },
    ],
  },
  {
    id: 'L7.4-010', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rulezi `grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg` pe un sistem unde GRUB citește de fapt `/boot/grub2/grub.cfg`. Ce se întâmplă?',
    explanation: 'Fișierul regenerat nu este cel citit de GRUB; comportamentul meniului nu se schimbă.',
    options: [
      { id: 'a', text: 'Meniul rămâne neschimbat, fiindcă GRUB citește alt fișier.', correct: true, why: 'Regenerarea pe calea greșită nu produce de obicei o eroare, dar nici efect; verifică cu ls care grub.cfg există.' },
      { id: 'b', text: 'Sistemul nu mai pornește imediat.', correct: false, why: 'Fișierul nefolosit nu influențează pornirea.' },
      { id: 'c', text: 'Comanda eșuează întotdeauna cu eroare.', correct: false, why: 'Poate scrie normal în orice cale accesibilă.' },
      { id: 'd', text: 'GRUB se reinstalează automat.', correct: false, why: 'grub2-mkconfig doar generează configurația.' },
    ],
  },
  {
    id: 'L7.4-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce reprezintă linia `options …` dintr-un fișier `/boot/loader/entries/*.conf`?',
    explanation: 'Este linia de comandă a kernelului pentru acea intrare (format BLS).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/boot/loader/entries/…conf', code: 'title Red Hat Enterprise Linux (6.12.0-xx.el10.x86_64)\nversion 6.12.0-xx.el10.x86_64\nlinux /vmlinuz-6.12.0-xx.el10.x86_64\ninitrd /initramfs-6.12.0-xx.el10.x86_64.img\noptions root=/dev/mapper/rhel-root ro rd.lvm.lv=rhel/root rhgb quiet' },
    options: [
      { id: 'a', text: 'Argumentele de kernel pentru acea intrare; grubby --args/--remove-args o modifică.', correct: true, why: 'După boot, aceste argumente apar în /proc/cmdline.' },
      { id: 'b', text: 'Opțiunile de montare din fstab.', correct: false, why: 'fstab este un alt fișier.' },
      { id: 'c', text: 'Opțiunile meniului GRUB (timeout).', correct: false, why: 'Timeout-ul este în /etc/default/grub și grub.cfg.' },
      { id: 'd', text: 'Opțiuni ale lui systemd.', correct: false, why: 'Sunt argumente de kernel; systemd poate citi unele din ele, dar sunt pasate de bootloader.' },
    ],
  },
  {
    id: 'L7.4-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește fișierul sau comanda cu rolul lui.',
    explanation: 'Fiecare piesă are un rol distinct în lanțul de configurare GRUB.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`/etc/default/grub`', right: 'setări generale (timeout, GRUB_DEFAULT, GRUB_CMDLINE_LINUX)', why: 'Fișier shell editat de administrator.' },
      { left: '`grub2-mkconfig -o …`', right: 'regenerează grub.cfg', why: 'Citește /etc/default/grub și /etc/grub.d/*.' },
      { left: '`/boot/loader/entries/*.conf`', right: 'câte o intrare BLS per kernel, cu linia options', why: 'Modificat prin grubby.' },
      { left: '`grubby --set-default=…`', right: 'schimbă kernelul implicit', why: 'Face implicită prima intrare cu acel kernel.' },
    ],
    distractors: [{ text: 'sincronizează ora cu un server NTP', why: 'Aceasta este treaba lui chrony (L7.3).' }],
  },
];
