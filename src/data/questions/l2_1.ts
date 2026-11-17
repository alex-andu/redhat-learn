import type { Question } from '../../lib/types';

const T = 'L2.1';
const O = ['C2-1'];

export const Q_L2_1: Question[] = [
  {
    id: 'L2.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Unde sunt, în mod obișnuit, definite repository-urile folosite de `dnf`?',
    explanation: 'Fiecare repository este o secțiune într-un fișier cu extensia `.repo` din `/etc/yum.repos.d/`.',
    options: [
      { id: 'a', text: 'În fișiere `*.repo` din `/etc/yum.repos.d/`.', correct: true, why: 'Aici citește `dnf` listele de repository-uri; setările globale sunt în `/etc/dnf/dnf.conf`.' },
      { id: 'b', text: 'În `/var/lib/rpm/`.', correct: false, why: 'Acolo este baza de date a pachetelor instalate, nu lista surselor.' },
      { id: 'c', text: 'În `/etc/fstab`.', correct: false, why: '`/etc/fstab` descrie montările de sisteme de fișiere, nu sursele de pachete.' },
      { id: 'd', text: 'În `~/.bashrc`.', correct: false, why: 'Este configurarea shell-ului unui utilizator; `dnf` nu o citește pentru repository-uri.' },
    ],
  },
  {
    id: 'L2.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ai un director `/srv/repo` plin de fișiere `.rpm`, iar `dnf` nu găsește pachetele lor. Ce lipsește?',
    explanation: 'Un repository are nevoie de metadata (`repodata/`), creată cu `createrepo_c`.',
    options: [
      { id: 'a', text: 'Directorul `repodata/`, creat cu `createrepo_c /srv/repo`.', correct: true, why: '`dnf` citește indexul din `repodata/repomd.xml`; fără el, directorul nu este un repository.' },
      { id: 'b', text: 'Extensia `.repo` pe fiecare fișier RPM.', correct: false, why: '`.repo` este extensia fișierului de configurare, nu a pachetelor.' },
      { id: 'c', text: 'Rularea `rpm --rebuilddb`.', correct: false, why: 'Reconstruiește baza de date locală; nu creează un index de repository.' },
      { id: 'd', text: 'Permisiunea de execuție pe toate fișierele `.rpm`.', correct: false, why: 'Pachetele sunt citite, nu executate.' },
    ],
  },
  {
    id: 'L2.1-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre următoarele chei pot apărea într-o secțiune dintr-un fișier `.repo`? (alege toate cele corecte)',
    explanation: 'Cheile uzuale: `name`, `baseurl` (sau `metalink`/`mirrorlist`), `enabled`, `gpgcheck`, `gpgkey`.',
    options: [
      { id: 'a', text: '`baseurl`', correct: true, why: 'Adresa repository-ului.' },
      { id: 'b', text: '`gpgcheck`', correct: true, why: '1 sau 0: verifică sau nu semnăturile pachetelor.' },
      { id: 'c', text: '`enabled`', correct: true, why: '1 = activ, 0 = ignorat.' },
      { id: 'd', text: '`enable`', correct: false, why: 'Cheia corectă este `enabled`; `enable` nu există și ar fi ignorată.' },
    ],
  },
  {
    id: 'L2.1-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Listează toate repository-urile, atât cele active, cât și cele dezactivate, cu starea lor.',
    prompt: '[student@server1 ~]$',
    answers: ['dnf repolist --all', 'sudo dnf repolist --all', 'dnf repolist all', 'sudo dnf repolist all'],
    canonical: 'sudo dnf repolist --all',
    explanation: '`dnf repolist` arată implicit doar repository-urile active; `--all` le include și pe cele dezactivate.',
    wrong: [
      { text: 'dnf repolist', why: 'Afișează doar repository-urile active.' },
      { text: 'dnf list repos', why: '`dnf list` listează pachete, nu repository-uri.' },
      { text: 'dnf repolist --disabled', why: 'Arată doar cele dezactivate, nu și cele active.' },
    ],
    hint: 'Subcomanda este repolist.',
  },
  {
    id: 'L2.1-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a face pachetele dintr-un ISO montat disponibile lui `dnf`.',
    explanation: 'Montezi sursa, o descrii într-un `.repo`, reîmprospătezi cache-ul, verifici.',
    items: [
      { text: '`sudo mount -o loop /root/rhel.iso /mnt`', why: 'Fără montare, conținutul ISO-ului nu este vizibil ca directoare.' },
      { text: 'Creezi `/etc/yum.repos.d/local.repo` cu `baseurl=file:///mnt/BaseOS` și `/mnt/AppStream`', why: 'Descrii surse pe care dnf să le citească.' },
      { text: '`sudo dnf clean all`', why: 'Elimină metadata veche din cache.' },
      { text: '`sudo dnf repolist`', why: 'Confirmi că repository-urile noi apar.' },
    ],
  },
  {
    id: 'L2.1-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește elementul cu rolul lui.',
    explanation: 'Rolurile elementelor unui repository configurat.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`baseurl=`', right: 'adresa unde se află repository-ul', why: 'Poate fi https://, http://, ftp:// sau file:///.' },
      { left: '`enabled=0`', right: 'repository-ul este definit, dar ignorat', why: 'Este dezactivat fără a fi șters.' },
      { left: '`gpgcheck=1`', right: 'se verifică semnătura pachetelor descărcate', why: 'Protejează împotriva pachetelor modificate.' },
      { left: '`createrepo_c`', right: 'creează directorul `repodata/`', why: 'Transformă un director cu RPM-uri într-un repository.' },
      { left: '`rpm --import`', right: 'adaugă o cheie publică GPG în baza RPM', why: 'Permite verificarea pachetelor semnate cu acea cheie.' },
    ],
    distractors: [{ text: 'montează un ISO', why: 'Aceasta este `mount`, nu un element al fișierului `.repo`.' }],
  },
  {
    id: 'L2.1-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'ISO-ul este montat în `/mnt`, dar `dnf repolist` raportează o eroare pentru `local-baseos`. Care este cauza?',
    explanation: '`file://` urmat de o cale absolută cere trei slash-uri: două ale schemei, unul al rădăcinii căii.',
    snippet: { kind: 'find-error', title: '/etc/yum.repos.d/local.repo', code: '[local-baseos]\nname=Local BaseOS\nbaseurl=file://mnt/BaseOS\nenabled=1\ngpgcheck=1' },
    options: [
      { id: 'a', text: '`baseurl` are doar două slash-uri; trebuie `file:///mnt/BaseOS`.', correct: true, why: 'Cu `file://mnt/BaseOS`, „mnt” este interpretat ca nume de gazdă, nu ca director.' },
      { id: 'b', text: '`gpgcheck=1` nu este permis pentru repository-uri locale.', correct: false, why: 'Este permis; lipsa `gpgkey` ar produce o eroare diferită, de verificare a semnăturii.' },
      { id: 'c', text: 'ID-ul `local-baseos` conține o cratimă.', correct: false, why: 'Cratima este permisă într-un ID de repository.' },
      { id: 'd', text: 'Trebuia `enabled=yes`.', correct: false, why: 'Valoarea uzuală este `1`; `enabled=1` este corect.' },
    ],
  },
  {
    id: 'L2.1-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți spune acest output despre repository-ul `local-appstream`?',
    explanation: 'Coloana `status` apare cu `--all`: `enabled` = folosit de dnf, `disabled` = definit, dar ignorat.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'dnf repolist --all', code: '[student@server1 ~]$ sudo dnf repolist --all\nrepo id           repo name                       status\nlocal-appstream   Local AppStream (ISO montat)    disabled\nlocal-baseos      Local BaseOS (ISO montat)       enabled' },
    options: [
      { id: 'a', text: 'Este definit în `.repo`, dar dezactivat; pachetele lui nu sunt vizibile.', correct: true, why: 'Pentru a-l folosi: `dnf config-manager --set-enabled local-appstream` sau `enabled=1` în fișier.' },
      { id: 'b', text: 'Fișierul `.repo` a fost șters.', correct: false, why: 'Dacă fișierul ar lipsi, repository-ul nu ar apărea deloc în listă.' },
      { id: 'c', text: 'ISO-ul nu este montat.', correct: false, why: 'Starea `disabled` ține de configurare, nu de accesibilitatea sursei.' },
      { id: 'd', text: 'Semnătura GPG este invalidă.', correct: false, why: 'Semnăturile se verifică la descărcarea pachetelor; nu apar în această coloană.' },
    ],
  },
];
