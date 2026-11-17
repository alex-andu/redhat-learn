import type { Lab } from '../../lab/types';

export const LAB_L2_4: Lab = {
  id: 'lab-l2-4-remote-flatpak',
  lessonId: 'L2.4',
  title: 'Configurează accesul la un remote Flatpak (sistem și utilizator)',
  modes: ['guided', 'independent'],
  objectives: ['C2-3'],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Ți se dă adresa unui fișier `.flatpakrepo` (în laborator, o adresă la alegerea ta: un remote intern sau unul public pe care ai dreptul să-l folosești; în exemple: `https://repo.exemplu.local/exemplu.flatpakrepo`, fictiv). Trebuie să configurezi accesul astfel încât (a) toți utilizatorii să poată folosi remote-ul și (b) separat, utilizatorul tău să aibă un remote propriu, apoi să dovedești configurarea și să o curățați.',
    'Sarcini: (1) asigură-te că `flatpak` este instalat; (2) adaugă remote-ul `lab-sys` la nivel de sistem; (3) adaugă remote-ul `lab-user` la nivel de utilizator; (4) listează-le și distinge instalările; (5) dezactivează `lab-user`, reactivează-l; (6) șterge `lab-user` și păstrează `lab-sys`.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) cu acces la rețea către adresa remote-ului și `sudo`.',
    'Nu există remote-uri numite `lab-sys` sau `lab-user`.',
  ],
  finalState: [
    '`lab-sys` este definit la nivel de sistem și activ.',
    '`lab-user` a fost creat, dezactivat, reactivat și șters.',
  ],
  criteria: [
    { id: 'ac1', text: '`flatpak` este instalat.', manualCheck: 'rpm -q flatpak; flatpak --version' },
    { id: 'ac2', text: '`lab-sys` apare ca remote de sistem.', manualCheck: 'flatpak remotes --system -d' },
    { id: 'ac3', text: '`lab-user` a apărut ca remote de utilizator, pe parcurs.', manualCheck: 'flatpak remotes --user -d' },
    { id: 'ac4', text: 'Poți lista conținutul remote-ului `lab-sys`.', manualCheck: 'flatpak remote-ls lab-sys --app | head' },
    { id: 'ac5', text: 'La final, `lab-user` nu mai există, iar `lab-sys` este activ.', manualCheck: 'flatpak remotes -d' },
  ],
  steps: [
    {
      title: 'Verifică sau instalează flatpak',
      purpose: 'Fără unealtă nu poți configura remote-uri.',
      hint: 'Verifică întâi cu rpm -q.',
      commands: 'rpm -q flatpak || sudo dnf install flatpak\nflatpak --version',
      explain: [
        ['rpm -q flatpak', 'verifică dacă pachetul este instalat; la „not installed” returnează cod diferit de 0.'],
        ['||', 'operator shell: rulează comanda din dreapta DOAR dacă cea din stânga a eșuat.'],
        ['flatpak --version', 'confirmă funcționarea.'],
      ],
    },
    {
      title: 'Adaugă remote-ul de sistem',
      purpose: 'Configurare valabilă pentru toți utilizatorii.',
      hint: 'Fără `--user`, remote-ul este de sistem; cere sudo.',
      commands: 'sudo flatpak remote-add --if-not-exists lab-sys https://repo.exemplu.local/exemplu.flatpakrepo\nflatpak remotes --system -d',
      explain: [
        ['--if-not-exists', 'comandă repetabilă fără eroare.'],
        ['lab-sys', 'numele local.'],
        ['URL', 'adresa fișierului .flatpakrepo; înlocuiește exemplul fictiv cu adresa reală primită.'],
        ['remotes --system -d', 'afișează doar remote-urile de sistem, cu detalii.'],
      ],
      output: { label: 'illustrative', code: 'Name     Title            URL                          Options\nlab-sys  Depozit exemplu  https://repo.exemplu.local   system', explain: '`Options: system` indică instalarea de sistem. Titlul și URL-ul sunt cele din fișierul .flatpakrepo.' },
    },
    {
      title: 'Adaugă remote-ul de utilizator',
      purpose: 'Remote valabil doar pentru contul tău, fără privilegii.',
      hint: '`--user`, fără `sudo`.',
      commands: 'flatpak remote-add --user --if-not-exists lab-user https://repo.exemplu.local/exemplu.flatpakrepo\nflatpak remotes -d',
      explain: [
        ['--user', 'instalarea de utilizator.'],
        ['remotes -d', 'fără --user/--system afișează ambele instalări, cu coloana Options.'],
      ],
      output: { label: 'illustrative', code: 'Name      Title            URL                          Options\nlab-sys   Depozit exemplu  https://repo.exemplu.local   system\nlab-user  Depozit exemplu  https://repo.exemplu.local   user', explain: 'Cele două remote-uri sunt în instalări diferite: `system` și `user`.' },
      reflect: 'Va vedea un alt utilizator remote-ul `lab-user`?',
    },
    {
      title: 'Inspectează conținutul',
      purpose: 'Confirmi că remote-ul este accesibil.',
      hint: '`--app` ascunde runtime-urile.',
      commands: 'flatpak remote-ls lab-sys --app | head',
      explain: [
        ['remote-ls lab-sys', 'listează conținutul remote-ului.'],
        ['--app', 'doar aplicații.'],
        ['| head', 'doar primele 10 linii (L1.5).'],
      ],
    },
    {
      title: 'Dezactivează, reactivează, șterge',
      purpose: 'Controlezi ciclul de viață al unui remote.',
      hint: 'Pentru instalarea de utilizator nu folosești sudo.',
      commands: 'flatpak remote-modify --user --disable lab-user\nflatpak remotes -d\nflatpak remote-modify --user --enable lab-user\nflatpak remote-delete --user lab-user\nflatpak remotes -d',
      explain: [
        ['remote-modify --disable', 'remote-ul rămâne definit, dar este ignorat; apare „disabled” în Options.'],
        ['--enable', 'îl reactivează.'],
        ['remote-delete --user lab-user', 'șterge definiția din instalarea de utilizator.'],
      ],
    },
  ],
  verification: [
    { cmd: 'flatpak remotes -d', expected: 'lab-sys apare (system), lab-user nu mai apare' },
    { cmd: 'flatpak remote-ls lab-sys --app | head', expected: 'o listă de aplicații, fără erori' },
  ],
  persistence: [
    'Remote-urile persistă după reboot în instalarea în care au fost definite.',
    'Confirmare manuală după reboot: `flatpak remotes -d`.',
  ],
  mistakes: [
    'Adaugi remote-ul în instalarea greșită (user vs system).',
    'Folosești `--no-gpg-verify` ca să ocolești o eroare.',
    'Uiți numele exact al remote-ului la `remote-ls`.',
  ],
  troubleshooting: [
    { symptom: '`remote-ls` dă eroare de rețea', cause: 'URL greșit sau fără acces', fix: '`curl -I URL`; verifică DNS/rețea (C8).' },
    { symptom: 'nu găsești remote-ul', cause: 'e în cealaltă instalare', fix: '`flatpak remotes --user` și `--system`.' },
    { symptom: '`flatpak: command not found`', cause: 'pachet lipsă', fix: '`sudo dnf install flatpak`.' },
  ],
  alternatives: [
    'Pentru un singur utilizator, doar `--user`; pentru toți, doar de sistem.',
    'Dacă ți se dă un fișier `.flatpakrepo` local: `sudo flatpak remote-add --if-not-exists NUME ./fișier.flatpakrepo` (verifică în `man flatpak-remote-add` acceptarea căii locale pe versiunea ta).',
  ],
};
