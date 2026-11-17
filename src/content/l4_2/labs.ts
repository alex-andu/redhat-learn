import type { Lab } from '../../lab/types';

export const LAB_L4_2: Lab = {
  id: 'lab-l4-2-targets',
  lessonId: 'L4.2',
  title: 'Target implicit și boot manual într-un target',
  modes: ['guided', 'independent'],
  objectives: ['C4-2', 'C7-3'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Un server trebuie să pornească automat în mod text (`multi-user.target`), nu în mod grafic. Setează target-ul implicit, confirmă-l și repornește ca să dovedești că persistă.',
    'Apoi pornește o singură dată în `rescue.target`, din meniul GRUB2, fără să modifici nimic permanent, și revino la pornirea normală.',
  ],
  initialConditions: [
    'Sistem RHEL 10 pe o mașină virtuală de test proprie, cu acces la consolă (pentru meniul GRUB2) și la root.',
    'Cunoști parola de root (rescue.target o cere).',
    'Target-ul implicit actual poate fi `graphical.target` sau `multi-user.target`; notează-l la început.',
  ],
  finalState: [
    '`systemctl get-default` afișează `multi-user.target` și valoarea supraviețuiește unui reboot.',
    'Ai intrat o dată în `rescue.target` prin editarea temporară a liniei kernelului; după reboot sistemul este din nou în `multi-user.target`.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai notat target-ul implicit inițial.', manualCheck: 'systemctl get-default' },
    { id: 'ac2', text: 'Target-ul implicit este `multi-user.target`.', manualCheck: 'systemctl get-default; ls -l /etc/systemd/system/default.target' },
    { id: 'ac3', text: 'După reboot, sistemul a pornit în `multi-user.target`.', manualCheck: 'systemctl get-default; systemctl is-active multi-user.target' },
    { id: 'ac4', text: 'Ai intrat în `rescue.target` cu `systemd.unit=rescue.target` adăugat temporar în GRUB2.', manualCheck: 'systemctl list-units --type=target --state=active' },
    { id: 'ac5', text: 'Modificarea din GRUB2 nu a rămas: după un reboot normal, `/proc/cmdline` nu conține `systemd.unit=`.', manualCheck: 'cat /proc/cmdline' },
  ],
  steps: [
    {
      title: 'Notează starea inițială',
      purpose: 'Știi de unde pornești și ce să refaci dacă vrei.',
      hint: '`get-default` arată ce se va folosi la următorul boot; `list-units --type=target` arată ce este activ acum.',
      commands: 'systemctl get-default\nsystemctl list-units --type=target --state=active',
      explain: [
        ['systemctl get-default', 'afișează numele target-ului implicit (legătura default.target).'],
        ['list-units --type=target', 'listează unitățile de tip target; `--state=active` păstrează doar pe cele active acum.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl get-default\ngraphical.target', explain: 'Valoarea inițială. Pe un server fără mediu grafic va fi, de obicei, `multi-user.target`; valoarea ta poate fi alta.' },
    },
    {
      title: 'Setează multi-user.target ca implicit',
      purpose: 'Persistă la reboot: aceasta este cerința C7-3.',
      hint: '`set-default` modifică legătura simbolică; nu schimbă starea curentă.',
      commands: 'systemctl set-default multi-user.target\nsystemctl get-default\nls -l /etc/systemd/system/default.target',
      explain: [
        ['set-default multi-user.target', 'face ca /etc/systemd/system/default.target să indice spre multi-user.target.'],
        ['get-default', 'confirmă noua valoare.'],
        ['ls -l …/default.target', '-l (long) arată că este o legătură simbolică și spre ce indică.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl set-default multi-user.target\nRemoved "/etc/systemd/system/default.target".\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/multi-user.target.\n[root@server1 ~]# systemctl get-default\nmulti-user.target', explain: 'systemctl a șters legătura veche și a creat una nouă. Formularea mesajelor poate diferi între versiuni.' },
      reflect: 'De ce `set-default` nu te scoate din interfața grafică imediat? Ce comandă ar face-o?',
    },
    {
      title: 'Repornește și confirmă persistența',
      purpose: 'Un reboot este testul real al setării.',
      hint: 'După boot, dacă ești la consolă, vei vedea login în mod text, nu ecran grafic.',
      commands: 'systemctl reboot\n# după reconectare:\nsystemctl get-default\nsystemctl is-active multi-user.target\nsystemctl is-active graphical.target',
      explain: [
        ['systemctl reboot', 'repornește ordonat (L4.1).'],
        ['is-active multi-user.target', 'afișează `active` dacă target-ul a fost atins.'],
        ['is-active graphical.target', 'ar trebui să fie `inactive` pe un sistem care pornește în mod text.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl get-default\nmulti-user.target\n[root@server1 ~]# systemctl is-active graphical.target\ninactive', explain: '`inactive` arată că interfața grafică nu a fost pornită. Dacă sistemul nu are pachete grafice, graphical.target poate să nu existe sau să fie oricum inactiv.' },
    },
    {
      title: 'Boot o singură dată în rescue.target',
      purpose: 'Exersezi editarea temporară din GRUB2.',
      hint: 'La meniu, apasă repede o tastă (nu Enter) ca să oprești numărătoarea. Selectează prima intrare, apasă `e`. Pe linia care începe cu `linux`, mergi la final (End) și adaugă ` systemd.unit=rescue.target`. `Ctrl+x` pornește.',
      commands: '# În meniul GRUB2:\n#   e  →  (la sfârșitul liniei "linux") adaugă:  systemd.unit=rescue.target  →  Ctrl+x\n# În shell-ul de rescue (cere parola root):\nsystemctl list-units --type=target --state=active\ncat /proc/cmdline\nsystemctl default',
      explain: [
        ['e', 'editează temporar intrarea de boot selectată; nimic nu se salvează pe disc.'],
        ['systemd.unit=rescue.target', 'parametru al kernelului: spune lui systemd ce target să atingă în loc de default.target.'],
        ['Ctrl+x', 'pornește cu linia modificată.'],
        ['cat /proc/cmdline', 'arată linia de comandă cu care a pornit kernelul; trebuie să conțină parametrul adăugat.'],
        ['systemctl default', 'din rescue, trece în target-ul implicit (alternativă la reboot).'],
      ],
      output: { label: 'illustrative', code: 'Give root password for maintenance\n(or press Control-D to continue):\n[root@server1 ~]# cat /proc/cmdline\nBOOT_IMAGE=(hd0,msdos1)/vmlinuz-5.14.0 root=/dev/mapper/rhel-root ro rhgb quiet systemd.unit=rescue.target', explain: 'Mesajul cere parola de root (sulogin). Linia de comandă include `systemd.unit=rescue.target`. Textul exact și versiunea kernelului sunt exemple construite.' },
      reflect: 'Ce s-ar întâmpla dacă ai uitat parola de root? Ce procedură folosești atunci (L4.3)?',
    },
    {
      title: 'Revino la pornirea normală',
      purpose: 'Dovedești că modificarea din GRUB2 era temporară.',
      hint: 'Un reboot obișnuit folosește linia de comandă salvată, fără parametrul adăugat.',
      commands: 'systemctl reboot\n# după reconectare:\ncat /proc/cmdline\nsystemctl get-default',
      explain: [
        ['cat /proc/cmdline', 'nu mai trebuie să conțină `systemd.unit=`.'],
        ['systemctl get-default', 'încă `multi-user.target`.'],
      ],
    },
  ],
  verification: [
    { cmd: 'systemctl get-default', expected: '`multi-user.target`' },
    { cmd: 'ls -l /etc/systemd/system/default.target', expected: 'legătură simbolică spre `…/multi-user.target`' },
    { cmd: 'cat /proc/cmdline', expected: 'fără `systemd.unit=` după un boot normal' },
    { cmd: 'systemctl is-active multi-user.target', expected: '`active`' },
  ],
  persistence: [
    '`set-default` modifică `/etc/systemd/system/default.target` pe disc: persistă la reboot.',
    '`systemctl isolate` și editarea din GRUB2 sunt temporare: nu persistă.',
    'Confirmare manuală: reboot și `systemctl get-default`.',
  ],
  mistakes: [
    'Folosirea lui `isolate` crezând că este persistent.',
    'Scrierea `systemd.target=` în loc de `systemd.unit=`.',
    'Editarea liniei greșite din GRUB2 sau apăsarea lui `Enter` în loc de `Ctrl+x`.',
    'Uitarea parolei de root înainte de a intra în rescue.',
  ],
  troubleshooting: [
    { symptom: 'meniul GRUB2 nu apare', cause: 'timeout scurt sau meniu ascuns', fix: 'apasă tasta Esc/Shift repede la pornire; pe VM, o apăsare în consolă imediat după BIOS/UEFI.' },
    { symptom: '`Failed to set default target`', cause: 'numele target-ului este greșit sau lipsesc drepturi', fix: '`systemctl list-unit-files --type=target` și rulează ca root.' },
    { symptom: 'rescue.target cere o parolă pe care nu o știi', cause: 'sulogin cere parola root', fix: 'procedura de recuperare a parolei (L4.3).' },
  ],
  alternatives: [
    'Poți crea legătura manual: `ln -sf /usr/lib/systemd/system/multi-user.target /etc/systemd/system/default.target`; `set-default` este metoda recomandată.',
    'Pentru intrarea imediată în rescue, fără reboot: `systemctl rescue` (cere root).',
    'La boot, ca scurtătură, `systemd.unit=multi-user.target` sau alias-ul `1` pentru rescue.',
  ],
};
