import type { Lab } from '../../lab/types';

export const LAB_L1_10: Lab = {
  id: 'lab-l1-10-schimba-utilizator',
  lessonId: 'L1.10',
  title: 'Identitate și schimbarea utilizatorului: su, su - și sudo',
  modes: ['guided', 'independent'],
  objectives: ['C1-5'],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Ești administratorul unui server de test. Trebuie să afli cu ce cont lucrezi, ce grupuri ai, cine mai este conectat, apoi să treci temporar la root în două feluri și să rulezi o comandă cu `sudo`, revenind la contul tău după fiecare pas.',
    'Sarcini: (1) afișează numele de utilizator, uid-ul și grupurile tale; (2) listează sesiunile active; (3) treci la root cu `su` (fără `-`), arată directorul curent și revino; (4) treci la root cu `su -`, arată directorul curent și `PATH`, apoi revino; (5) rulează `whoami` prin `sudo`; (6) dacă ai un al doilea cont de test, rulează o comandă ca acel utilizator; (7) arată care este target-ul implicit al sistemului.',
  ],
  initialConditions: [
    'Conectat ca utilizator obișnuit (de test), într-un terminal. Ai parola contului root sau ești autorizat pentru `sudo` (de exemplu membru al `wheel`).',
    'Opțional: un al doilea cont de test cu parola cunoscută de tine. Nu folosi conturi reale ale altor persoane.',
  ],
  finalState: [
    'Ești din nou în sesiunea inițială, ca utilizatorul obișnuit (`whoami` o confirmă).',
    'Nu a fost modificat niciun cont, grup sau fișier de configurare.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți afișa utilizatorul curent și grupurile lui.', manualCheck: 'whoami; id' },
    { id: 'ac2', text: 'După `su`, `whoami` arată `root` și directorul curent este cel de dinainte; după `su -`, directorul este `/root`.', manualCheck: 'su ; whoami; pwd; exit  (apoi)  su - ; whoami; pwd; exit' },
    { id: 'ac3', text: '`sudo whoami` afișează `root`.', manualCheck: 'sudo whoami' },
    { id: 'ac4', text: 'La final, `whoami` arată utilizatorul inițial și `echo $SHLVL` este valoarea de la început.', manualCheck: 'whoami; echo $SHLVL' },
    { id: 'ac5', text: 'Poți indica target-ul implicit al sistemului.', manualCheck: 'systemctl get-default' },
  ],
  steps: [
    {
      title: 'Identitatea ta',
      purpose: 'Afli cine ești și din ce grupuri faci parte, înainte de orice schimbare.',
      hint: '`id` conține și apartenența la `wheel`, relevantă pentru `sudo`.',
      commands: 'whoami\nid\nid -Gn\nwho\necho $SHLVL\ntty',
      explain: [
        ['whoami', 'utilizatorul efectiv.'],
        ['id', 'uid, gid, grupuri.'],
        ['id -Gn', '-G toate grupurile, -n nume în loc de numere.'],
        ['who', 'sesiunile active.'],
        ['echo $SHLVL', 'adâncimea shell-urilor imbricate (notează valoarea inițială).'],
        ['tty', 'terminalul curent.'],
      ],
      output: {
        label: 'illustrative',
        code: 'student\nuid=1000(student) gid=1000(student) groups=1000(student),10(wheel) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023\nstudent wheel\nstudent  pts/0       2025-01-01 09:05 (192.168.122.1)\n1\n/dev/pts/0',
        explain: 'Numele, grupurile și terminalul diferă pe sistemul tău. `wheel` în grupuri sugerează drept de `sudo` (confirmă cu `sudo -l`).',
      },
      reflect: 'Ce înseamnă `pts/0` față de `tty1`?',
    },
    {
      title: 'su fără cratimă',
      purpose: 'Observi că `su` păstrează directorul și o parte din mediu.',
      hint: 'Parola cerută este a lui `root`. Nu o scrie nicăieri. Revino cu `exit`.',
      commands: 'cd ~\nsu\nwhoami\npwd\necho $SHLVL\nexit\nwhoami',
      explain: [
        ['su', 'deschide un shell ca root; cere parola lui root.'],
        ['pwd', 'directorul curent rămâne cel dinainte (home-ul tău).'],
        ['echo $SHLVL', 'crește cu 1: este un shell imbricat.'],
        ['exit', 'închide shell-ul root și revii la utilizatorul tău.'],
      ],
      output: {
        label: 'illustrative',
        code: 'root\n/home/student\n2\nstudent',
        explain: 'În sesiunea root, directorul este `/home/student`, iar `SHLVL` crește. După `exit` revii la `student`.',
      },
    },
    {
      title: 'su - (login shell)',
      purpose: 'Compari cu pasul anterior.',
      hint: 'Atenție la `pwd` și la `PATH` (apar directoarele `sbin`).',
      commands: 'su -\nwhoami\npwd\necho $PATH\nexit\nwhoami',
      explain: [
        ['su -', 'login shell ca root: mediul și home-ul lui root.'],
        ['pwd', 'acum este `/root`.'],
        ['echo $PATH', 'conține directoare de administrare (`/sbin`, `/usr/sbin`) în mediul lui root.'],
      ],
      output: {
        label: 'illustrative',
        code: 'root\n/root\n/root/.local/bin:/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin\nstudent',
        explain: 'Valoarea exactă a `PATH` diferă pe sistemul tău; important este că ești în `/root` și mediul este cel al lui root.',
      },
      reflect: 'De ce ar putea `useradd` să nu fie găsit după `su` fără cratimă?',
    },
    {
      title: 'sudo',
      purpose: 'Rulezi o comandă privilegiată cu parola ta.',
      hint: 'Dacă `sudo` răspunde că nu ești în sudoers, nu ai autorizare; folosește `su -` pentru restul.',
      commands: 'sudo -l\nsudo whoami\nsudo -k',
      explain: [
        ['sudo -l', 'listează drepturile tale; cere parola ta.'],
        ['sudo whoami', 'rulează `whoami` ca root.'],
        ['sudo -k', 'uită parola reținută (următorul `sudo` o va cere din nou).'],
      ],
      output: {
        label: 'illustrative',
        code: 'User student may run the following commands on server1:\n    (ALL) ALL\nroot',
        explain: 'Dacă politica diferă, lista va fi alta. A doua linie arată că `whoami` a rulat ca root.',
      },
    },
    {
      title: 'Alt utilizator și target-ul implicit',
      purpose: 'Rulezi o comandă ca alt cont de test și citești target-ul implicit.',
      hint: 'Dacă nu ai al doilea cont, sari peste prima comandă.',
      commands: "sudo -u student2 id\nsu -c 'whoami' student2\nsystemctl get-default",
      explain: [
        ['sudo -u student2 id', '-u: rulează ca alt utilizator (necesită drept sudo).'],
        ["su -c 'whoami' student2", 'rulează o singură comandă ca student2 (cere parola lui student2).'],
        ['systemctl get-default', 'target-ul implicit.'],
      ],
      output: {
        label: 'illustrative',
        code: 'uid=1001(student2) gid=1001(student2) groups=1001(student2)\nstudent2\nmulti-user.target',
        explain: 'Pe un server în mod text vei vedea de regulă `multi-user.target`; pe un sistem cu mediu grafic, `graphical.target`.',
      },
    },
  ],
  verification: [
    { cmd: 'whoami', expected: 'utilizatorul inițial (nu `root`).' },
    { cmd: 'echo $SHLVL', expected: 'valoarea notată la început (toate `su`/`sudo -i` au fost închise cu `exit`).' },
    { cmd: 'sudo whoami', expected: '`root`.' },
    { cmd: 'systemctl get-default', expected: 'de ex. `multi-user.target` sau `graphical.target`.' },
  ],
  persistence: [
    'Nicio modificare persistentă: nu se schimbă conturi, grupuri, parole sau configurații.',
    'Schimbările de utilizator sunt valabile doar cât durează shell-ul/comanda.',
    'Confirmare manuală: într-un terminal nou, `whoami` arată utilizatorul tău obișnuit.',
  ],
  mistakes: [
    'Rămâi într-un shell root după ce ai terminat (uiți `exit`).',
    'Confunzi parola cerută de `su` cu cea cerută de `sudo`.',
    'Scrii parola într-un fișier sau în linia de comandă.',
    'Testezi accesul altui cont ca root (care ocolește verificările).',
  ],
  troubleshooting: [
    { symptom: '`su: Authentication failure`', cause: 'parola root greșită (sau root fără parolă setată)', fix: 'verifică parola; dacă ești în sudoers folosește `sudo -i`' },
    { symptom: '`is not in the sudoers file`', cause: 'contul nu este autorizat', fix: 'folosește `su -` sau cere autorizarea (C9)' },
    { symptom: '`$SHLVL` nu revine la valoarea inițială', cause: 'shell-uri imbricate rămase deschise', fix: 'rulează `exit` până când `whoami` și `$SHLVL` revin' },
    { symptom: '`systemctl get-default` nu afișează nimic', cause: 'sistem fără systemd în mediul de test (ex. container)', fix: 'folosește un sistem RHEL cu systemd (sau omite pasul)' },
  ],
  alternatives: [
    '`sudo -i` în loc de `su -` (parola ta, nu a lui root).',
    '`sudo -s` deschide un shell root fără login complet.',
    '`su - student2 -c "id"` echivalent cu varianta cu `-c`.',
  ],
};
