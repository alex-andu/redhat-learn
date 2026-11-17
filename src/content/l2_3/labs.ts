import type { Lab } from '../../lab/types';

export const LAB_L2_3: Lab = {
  id: 'lab-l2-3-surse-si-actualizari',
  lessonId: 'L2.3',
  title: 'Instalează din surse diferite și actualizează selectiv',
  modes: ['guided', 'independent'],
  objectives: ['C7-5'],
  difficulty: 2,
  estimatedMinutes: 45,
  scenario: [
    'Ai un server care primește software din mai multe surse: repository-urile Red Hat sau unul intern (configurate conform L2.1) și, ocazional, un fișier RPM livrat manual. Trebuie să demonstrezi că poți instala din fiecare sursă, să vezi ce actualizări sunt disponibile și să aplici o actualizare selectivă, fără să schimbi restul sistemului.',
    'Sarcini: (1) verifică starea înregistrării sau a surselor active; (2) instalează `tree` dintr-un repository la alegere, folosind `--repo`; (3) descarcă un RPM la alegere (de exemplu cu `dnf download`, dacă pachetul `dnf-plugins-core` este instalat) și instalează-l din fișier local; (4) listează actualizările disponibile fără să le aplici; (5) actualizează doar un singur pachet; (6) compară kernelul în execuție cu cele instalate.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) cu `sudo` și cel puțin un repository activ (CDN, ISO local sau URL). Dacă folosești CDN, sistemul trebuie să fie deja înregistrat; platforma nu înregistrează nimic.',
    'Pachetul `tree` nu este instalat (altfel șterge-l întâi cu `sudo dnf remove tree`).',
  ],
  finalState: [
    '`tree` este instalat; un al doilea pachet a fost instalat din fișier local.',
    'Ai afișat lista de actualizări și ai actualizat selectiv un singur pachet (dacă există actualizări).',
    'Cunoști kernelul în execuție și cel instalat.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți numi repository-urile active pe sistem.', manualCheck: 'sudo dnf repolist' },
    { id: 'ac2', text: '`tree` este instalat și știi din ce repository a venit.', manualCheck: 'rpm -q tree; sudo dnf history info last' },
    { id: 'ac3', text: 'Un pachet a fost instalat dintr-un fișier `.rpm` local.', manualCheck: 'rpm -q NUME-PACHET; rpm -qi NUME-PACHET | grep -i "install"' },
    { id: 'ac4', text: 'Ai listat actualizările disponibile fără să le aplici și ai interpretat codul de ieșire.', manualCheck: 'sudo dnf check-update; echo $?' },
    { id: 'ac5', text: 'Ai actualizat un singur pachet; celelalte rămân în lista de actualizări.', manualCheck: 'sudo dnf check-update | head' },
    { id: 'ac6', text: 'Poți spune dacă kernelul în execuție este cel mai nou instalat.', manualCheck: 'uname -r; rpm -q kernel' },
  ],
  steps: [
    {
      title: 'Stabilește sursele disponibile',
      purpose: 'Înainte de instalare, știi de unde poți primi pachete.',
      hint: 'Dacă folosești CDN, `subscription-manager status` indică înregistrarea.',
      commands: 'sudo subscription-manager status\nsudo dnf repolist -v | head -n 30',
      explain: [
        ['subscription-manager status', 'dacă sistemul este înregistrat; pe un sistem care folosește doar repository-uri locale, rezultatul poate fi „Not registered” și este normal.'],
        ['dnf repolist -v', 'repository-urile active cu detalii (ID, URL).'],
        ['| head -n 30', 'limitează afișarea la 30 de linii (L1.5).'],
      ],
    },
    {
      title: 'Instalează dintr-un repository anume',
      purpose: 'Controlezi sursa unei instalări.',
      hint: 'ID-ul repository-ului îl iei din pasul 1.',
      commands: 'sudo dnf install --repo=ID-REPO tree\nrpm -q tree\nsudo dnf history info last',
      explain: [
        ['--repo=ID-REPO', 'folosește doar repository-ul cu acest ID (înlocuiește ID-REPO cu un ID real din repolist).'],
        ['history info last', 'confirmă ce a făcut ultima tranzacție.'],
      ],
    },
    {
      title: 'Instalează dintr-un fișier local',
      purpose: 'Instalare fără ca pachetul să fie ales dintr-un catalog.',
      hint: 'Descarcă un RPM mic într-un director de lucru; pe un sistem izolat, copiază-l din altă parte.',
      commands: 'mkdir -p ~/lab23 && cd ~/lab23\nsudo dnf install dnf-plugins-core\ndnf download nano\nls -l *.rpm\nsudo dnf install ./nano-*.rpm\nrpm -q nano',
      explain: [
        ['mkdir -p ... && cd ...', 'directorul de lucru.'],
        ['dnf install dnf-plugins-core', 'pachetul care oferă subcomanda download (și config-manager).'],
        ['dnf download nano', 'descarcă fișierul .rpm în directorul curent, fără să instaleze.'],
        ['dnf install ./nano-*.rpm', 'instalează fișierul local; ./ obligatoriu. Dacă nano e deja instalat, dnf poate raporta „already installed”; alege atunci alt pachet mic pentru exercițiu.'],
      ],
      output: { label: 'illustrative', code: 'nano-8.x-y.el10.x86_64.rpm', explain: 'Numele fișierului descărcat diferă; contează că există un `.rpm` local.' },
      reflect: 'De ce ai folosit `./` în fața numelui fișierului?',
    },
    {
      title: 'Vezi actualizările fără să le aplici',
      purpose: 'Planifici mentenanța.',
      hint: 'Codul de ieșire al lui check-update are semnificație.',
      commands: 'sudo dnf check-update\necho $?\nsudo dnf upgrade --assumeno',
      explain: [
        ['dnf check-update', 'listează ce se poate actualiza.'],
        ['echo $?', '100 = există actualizări; 0 = niciuna; 1 = eroare.'],
        ['upgrade --assumeno', 'afișează tranzacția propusă și răspunde „no”: nimic nu se modifică.'],
      ],
    },
    {
      title: 'Actualizează selectiv și compară kernelul',
      purpose: 'Aplici o singură actualizare; verifici starea kernelului.',
      hint: 'Alege din lista pasului 4 un pachet necritic (nu kernel).',
      commands: 'sudo dnf upgrade NUME-PACHET\nrpm -q NUME-PACHET\nuname -r\nrpm -q kernel',
      explain: [
        ['dnf upgrade NUME-PACHET', 'actualizează doar pachetul indicat (și dependențele necesare). Dacă nu există nicio actualizare, comanda spune „Nothing to do”.'],
        ['uname -r', 'kernelul în execuție.'],
        ['rpm -q kernel', 'toate kernelurile instalate; dacă cel mai nou diferă de cel în execuție, este nevoie de reboot.'],
      ],
      output: { label: 'illustrative', code: '6.12.0-55.el10.x86_64\nkernel-6.12.0-55.el10.x86_64\nkernel-6.12.0-61.el10.x86_64', explain: 'Versiunile sunt exemple. Aici kernelul în execuție este mai vechi decât cel mai nou instalat: reboot necesar pentru a-l folosi.' },
    },
  ],
  verification: [
    { cmd: 'rpm -q tree nano', expected: 'câte o linie nume-versiune pentru fiecare, ambele instalate' },
    { cmd: 'sudo dnf check-update; echo $?', expected: '100 dacă mai sunt actualizări rămase, 0 dacă nu' },
    { cmd: 'uname -r; rpm -q kernel', expected: 'compară cele două: diferențele indică nevoia unui reboot' },
  ],
  persistence: [
    'Pachetele instalate/actualizate persistă după reboot.',
    'Kernelul nou intră în vigoare doar după reboot; confirmare manuală: `uname -r` după repornire.',
  ],
  mistakes: [
    'Scrii calea fără `./` pentru un RPM local.',
    'Aplici `dnf upgrade` complet când sarcina cere doar un pachet.',
    'Introduci parole în linia de comandă la `subscription-manager`.',
    'Presupui că kernelul nou rulează imediat.',
  ],
  troubleshooting: [
    { symptom: '`No match for argument`', cause: 'sursă lipsă sau ID greșit la `--repo`', fix: '`dnf repolist --all`; corectează ID-ul.' },
    { symptom: '`dnf download` nu este recunoscut', cause: 'lipsește `dnf-plugins-core`', fix: '`sudo dnf install dnf-plugins-core`.' },
    { symptom: 'eroare de certificat la CDN', cause: 'ceas greșit sau sistem neînregistrat', fix: '`timedatectl`; `subscription-manager status`.' },
  ],
  alternatives: [
    'Un RPM poate fi instalat și direct din URL: `sudo dnf install https://.../fișier.rpm`.',
    'În loc de `--repo`, `--enablerepo=ID` activează un repository în plus (nu dezactivează pe celelalte).',
  ],
};
