import type { Lab } from '../../lab/types';

export const LAB_L2_2: Lab = {
  id: 'lab-l2-2-instaleaza-sterge-rpm',
  lessonId: 'L2.2',
  title: 'Caută, instalează, interoghează și șterge pachete RPM',
  modes: ['guided', 'independent'],
  objectives: ['C2-2'],
  difficulty: 1,
  estimatedMinutes: 35,
  scenario: [
    'Administratorul anterior a lăsat sistemul fără unelte uzuale. Ți se cere să instalezi pachetele `tree` și `nano`, să afli ce pachet oferă comanda `semanage` (fără să o instalezi), să documentezi ce conține și unde se află fișierele `tree`, apoi să elimini `tree` și să dovedești că a dispărut.',
    'Sarcini: (1) caută și inspectează `tree`; (2) instalează `tree` și `nano` într-o singură comandă; (3) interoghează baza RPM (versiune, fișiere, proprietar al executabilului); (4) află ce pachet oferă `semanage`; (5) citește istoricul tranzacțiilor; (6) șterge `tree` și verifică.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) cu cel puțin un repository activ (CDN, ISO local sau altul — vezi L2.1) și utilizator cu `sudo`.',
    '`tree` nu este instalat (dacă e deja instalat, începe cu pasul 6 și reinstalează-l).',
  ],
  finalState: [
    '`nano` este instalat; `tree` a fost instalat și apoi șters.',
    'Ai notat pachetul care oferă `semanage` (nu este necesar să fie instalat).',
  ],
  criteria: [
    { id: 'ac1', text: 'După pasul 2, `tree` și `nano` sunt instalate.', manualCheck: 'rpm -q tree nano' },
    { id: 'ac2', text: 'Ai identificat ce pachet deține `/usr/bin/tree`.', manualCheck: 'rpm -qf /usr/bin/tree' },
    { id: 'ac3', text: 'Ai identificat pachetul care oferă `semanage`, fără să-l instalezi.', manualCheck: "dnf provides '*/semanage'" },
    { id: 'ac4', text: 'Tranzacțiile tale apar în istoric.', manualCheck: 'sudo dnf history list | head' },
    { id: 'ac5', text: 'La final `tree` nu mai este instalat, iar `nano` rămâne.', manualCheck: 'rpm -q tree; rpm -q nano' },
  ],
  steps: [
    {
      title: 'Caută și inspectează',
      purpose: 'Verifici înainte de instalare că pachetul există și de unde vine.',
      hint: '`dnf info` arată dacă pachetul este instalat sau disponibil și din ce repository.',
      commands: 'dnf search tree\ndnf info tree',
      explain: [
        ['dnf search tree', 'caută „tree” în numele și rezumatele pachetelor.'],
        ['dnf info tree', 'detalii: versiune, repository, mărime, descriere.'],
      ],
      output: { label: 'illustrative', code: 'Available Packages\nName         : tree\nVersion      : 2.1.0\nRelease      : 1.el10\nArchitecture : x86_64\nSize         : 58 k\nRepository   : local-appstream\nSummary      : File system tree viewer', explain: '`Available Packages` = încă neinstalat. `Repository` arată sursa. Valorile sunt exemple; pe sistemul tău diferă.' },
    },
    {
      title: 'Instalează două pachete',
      purpose: 'Instalare într-o tranzacție unică.',
      hint: 'Citește lista de pachete înainte să confirmi.',
      commands: 'sudo dnf install tree nano\nrpm -q tree nano',
      explain: [
        ['sudo dnf install tree nano', 'instalează ambele pachete (și dependențe, dacă lipsesc). Confirmi cu y. Dacă nano e deja instalat, dnf spune „already installed”.'],
        ['rpm -q tree nano', 'confirmă din baza RPM locală; afișează câte o linie nume-versiune-release.arhitectură.'],
      ],
      reflect: 'Ce ar fi trebuit să urmărești în lista din ecranul de confirmare?',
    },
    {
      title: 'Interoghează baza RPM',
      purpose: 'Afli ce a pus pachetul și cui aparține un fișier.',
      hint: '-ql listează fișierele, -qf află proprietarul unui fișier.',
      commands: 'rpm -qi tree\nrpm -ql tree\nrpm -qf /usr/bin/tree\nwhich tree',
      explain: [
        ['rpm -qi tree', 'informații despre pachetul instalat.'],
        ['rpm -ql tree', 'lista fișierelor instalate de pachet (executabil, pagină de manual etc.).'],
        ['rpm -qf /usr/bin/tree', 'inversul: din fișier ajungi la pachet.'],
        ['which tree', 'confirmă că shell-ul găsește comanda în PATH.'],
      ],
      output: { label: 'illustrative', code: '/usr/bin/tree\n/usr/share/doc/tree/LICENSE\n/usr/share/man/man1/tree.1.gz', explain: 'Rezultat posibil pentru `rpm -ql tree`; lista reală diferă după versiune.' },
    },
    {
      title: 'Află ce pachet oferă o comandă lipsă',
      purpose: 'Rezolvi „command not found” fără să ghicești.',
      hint: 'Folosește un joker pentru director: `*/semanage`.',
      commands: "dnf provides '*/semanage'\nrpm -q policycoreutils-python-utils",
      explain: [
        ["dnf provides '*/semanage'", 'caută în repository-urile active pachetele care conțin un fișier cu numele semanage, în orice director; ghilimelele opresc expandarea * de către shell.'],
        ['rpm -q policycoreutils-python-utils', 'verifici dacă acel pachet este deja instalat. Numele este un exemplu al pachetului care oferă de obicei semanage; confirmă-l din rezultatul dnf provides pe sistemul tău.'],
      ],
      output: { label: 'illustrative', code: 'policycoreutils-python-utils-3.x-y.el10.noarch : SELinux policy core python utilities\nRepo        : appstream\nMatched from:\nFilename    : /usr/sbin/semanage', explain: 'Prima linie: pachetul care conține fișierul. `Matched from` arată ce fișier s-a potrivit. Numele și versiunea exacte depind de sistem.' },
    },
    {
      title: 'Citește istoricul',
      purpose: 'Vezi că fiecare instalare este o tranzacție înregistrată.',
      hint: 'ID-ul tranzacției îl iei din prima coloană.',
      commands: 'sudo dnf history list | head\nsudo dnf history info last',
      explain: [
        ['history list', 'tranzacțiile în ordine inversă (cea mai recentă prima); | head limitează afișarea (L1.5).'],
        ['history info last', 'detalii despre ultima tranzacție (ce s-a instalat, cine a rulat comanda).'],
      ],
    },
    {
      title: 'Șterge și verifică',
      purpose: 'Elimini `tree`, păstrând `nano`.',
      hint: 'Răspunde N dacă lista de ștergere conține pachete neașteptate.',
      commands: 'sudo dnf remove tree\nrpm -q tree\nrpm -q nano\nsudo dnf autoremove',
      explain: [
        ['sudo dnf remove tree', 'șterge pachetul (și ce depinde de el). Citește lista înainte de y.'],
        ['rpm -q tree', 'așteptat: „package tree is not installed”.'],
        ['rpm -q nano', 'așteptat: pachetul rămâne instalat.'],
        ['dnf autoremove', 'propune ștergerea dependențelor orfane. Citește lista; nu confirma dacă nu înțelegi de ce apare un pachet.'],
      ],
      output: { label: 'illustrative', code: 'package tree is not installed\nnano-8.x-y.el10.x86_64', explain: 'Prima linie confirmă ștergerea. A doua arată că nano este încă instalat (versiunea e un exemplu).' },
    },
  ],
  verification: [
    { cmd: 'rpm -q nano', expected: 'o linie nume-versiune-release.arhitectură' },
    { cmd: 'rpm -q tree', expected: 'package tree is not installed' },
    { cmd: 'sudo dnf history list | head', expected: 'tranzacții recente (instalare și ștergere) în listă' },
  ],
  persistence: [
    'Pachetele instalate/șterse și baza RPM persistă după reboot; nu e nimic de configurat.',
    'Confirmare manuală după reboot: `rpm -q nano` și `rpm -q tree`.',
  ],
  mistakes: [
    'Uiți `sudo`.',
    'Confirmi `y` la o ștergere fără să citești lista de pachete afectate.',
    'Folosești `dnf search` ca să verifici dacă ceva e instalat; pentru asta există `rpm -q`.',
    'Uiți ghilimelele la `dnf provides */nume`.',
  ],
  troubleshooting: [
    { symptom: '`No match for argument: tree`', cause: 'niciun repository activ nu conține pachetul', fix: '`dnf repolist --all`; vezi L2.1.' },
    { symptom: '`This command has to be run with superuser privileges`', cause: 'ai rulat dnf fără root', fix: 'folosește `sudo`.' },
    { symptom: '`dnf provides` nu returnează nimic', cause: 'repository-urile nu conțin fișierul sau tiparul e greșit', fix: 'încearcă `dnf provides /usr/sbin/semanage` sau `*/semanage`; verifică repository-urile.' },
  ],
  alternatives: [
    'Instalare din fișier local: `sudo dnf install ./pachet.rpm` (dacă ai descărcat un RPM).',
    'Confirmare a ștergerii prin `dnf list --installed tree`.',
    'Pentru instalare automată, `-y`: `sudo dnf install -y tree nano`.',
  ],
};
