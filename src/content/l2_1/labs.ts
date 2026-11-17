import type { Lab } from '../../lab/types';

export const LAB_L2_1: Lab = {
  id: 'lab-l2-1-repo-local-iso',
  lessonId: 'L2.1',
  title: 'Configurează BaseOS și AppStream dintr-un ISO montat, persistent',
  modes: ['guided', 'independent'],
  objectives: ['C2-1'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Un server nou nu are acces la CDN-ul Red Hat. Pe disc ai fișierul ISO de instalare RHEL 10 (în exemple: `/root/rhel-10-dvd.iso`; numele real îl stabilești tu). Trebuie să faci pachetele din ISO disponibile pentru `dnf`, iar configurarea să supraviețuiască unui reboot.',
    'Sarcini: (1) montează ISO-ul în `/mnt/iso`; (2) creează `/etc/yum.repos.d/local.repo` cu două repository-uri, `local-baseos` și `local-appstream`; (3) fă montarea persistentă; (4) arată că repository-urile sunt active și că `dnf` poate lista pachete din ele; (5) arată cum dezactivezi un repository fără să-l ștergi.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), utilizator cu `sudo`.',
    'Un ISO de instalare RHEL 10 există ca fișier local; directorul `/mnt/iso` nu există încă.',
    'Se presupune că ISO-ul are directoarele `BaseOS` și `AppStream` (structura mediului de instalare RHEL; verifică în pasul 1).',
  ],
  finalState: [
    '`/mnt/iso` conține ISO-ul montat, iar montarea este definită în `/etc/fstab`.',
    '`/etc/yum.repos.d/local.repo` definește `local-baseos` și `local-appstream`, ambele cu `enabled=1`.',
    '`dnf repolist` listează cele două repository-uri.',
  ],
  criteria: [
    { id: 'ac1', text: 'ISO-ul este montat în `/mnt/iso` și vezi `BaseOS` și `AppStream`.', manualCheck: 'findmnt /mnt/iso; ls /mnt/iso' },
    { id: 'ac2', text: '`local.repo` există și definește ambele repository-uri, active.', manualCheck: 'grep -E "^\\[|baseurl|enabled" /etc/yum.repos.d/local.repo' },
    { id: 'ac3', text: '`dnf repolist` arată `local-baseos` și `local-appstream`.', manualCheck: 'sudo dnf repolist' },
    { id: 'ac4', text: 'Linia din `/etc/fstab` pentru ISO există și este validă (montare reușită cu `mount -a`).', manualCheck: 'grep iso /etc/fstab; sudo mount -a; echo $?' },
    { id: 'ac5', text: 'Poți lista pachete disponibile doar din `local-baseos`.', manualCheck: 'sudo dnf --repo=local-baseos list available | head' },
  ],
  steps: [
    {
      title: 'Montează ISO-ul',
      purpose: 'Un ISO este un fișier; până nu îl montezi, conținutul lui nu este vizibil ca director.',
      hint: '`mount -o loop FIȘIER DIRECTOR`; directorul trebuie să existe.',
      commands: 'sudo mkdir -p /mnt/iso\nsudo mount -o loop,ro /root/rhel-10-dvd.iso /mnt/iso\nls /mnt/iso\nls /mnt/iso/BaseOS | head -n 3',
      explain: [
        ['mkdir -p /mnt/iso', 'creează punctul de montare (-p: fără eroare dacă există).'],
        ['mount -o loop,ro', '-o dă opțiuni de montare: loop = fișierul este tratat ca dispozitiv bloc; ro = doar citire (un ISO este oricum read-only).'],
        ['ls /mnt/iso', 'confirmi că vezi directoarele BaseOS și AppStream.'],
        ['| head -n 3', 'afișezi doar primele 3 linii (L1.5), ca să nu inunde ecranul.'],
      ],
      output: { label: 'illustrative', code: 'AppStream  BaseOS  EFI  images  isolinux  media.repo', explain: 'Conținutul exact depinde de ISO. Important: BaseOS și AppStream trebuie să existe; fiecare conține repodata/.' },
      reflect: 'De ce montarea făcută așa nu supraviețuiește unui reboot?',
    },
    {
      title: 'Scrie fișierul local.repo',
      purpose: 'Spui lui dnf unde sunt cele două repository-uri.',
      hint: 'Fiecare repository are propria secțiune cu [id]; `baseurl` începe cu `file:///`.',
      commands: 'sudo vi /etc/yum.repos.d/local.repo\n# conținut:\n[local-baseos]\nname=Local BaseOS\nbaseurl=file:///mnt/iso/BaseOS\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\n\n[local-appstream]\nname=Local AppStream\nbaseurl=file:///mnt/iso/AppStream\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release',
      explain: [
        ['sudo vi', 'editezi un fișier din /etc ca root (L1.4). Dacă vi nu îți este familiar, folosește editorul cu care ești comod.'],
        ['[local-baseos]', 'ID-ul repository-ului (fără spații).'],
        ['baseurl=file:///mnt/iso/BaseOS', 'trei slash-uri; calea ajunge la directorul care conține repodata/.'],
        ['gpgcheck=1 + gpgkey', 'păstrezi verificarea semnăturii; confirmă cu `ls /etc/pki/rpm-gpg/` că fișierul cheii există sub acest nume pe sistemul tău și ajustează calea dacă diferă.'],
      ],
    },
    {
      title: 'Fă montarea persistentă',
      purpose: 'După reboot, repository-urile `file:///` ar fi inaccesibile dacă ISO-ul nu se montează automat.',
      hint: '/etc/fstab are 6 câmpuri: sursă, punct de montare, tip, opțiuni, dump, fsck.',
      commands: 'echo "/root/rhel-10-dvd.iso /mnt/iso iso9660 loop,ro 0 0" | sudo tee -a /etc/fstab\nsudo umount /mnt/iso\nsudo mount -a\nfindmnt /mnt/iso',
      explain: [
        ['| sudo tee -a', 'adaugă (-a) linia la sfârșitul /etc/fstab cu drepturi de root; `sudo echo > fișier` ar eșua (L1.5).'],
        ['iso9660', 'tipul sistemului de fișiere al unui ISO.'],
        ['loop,ro', 'aceleași opțiuni ca la montarea manuală.'],
        ['0 0', 'fără dump, fără fsck.'],
        ['umount + mount -a', 'testezi linia nouă imediat: mount -a montează tot ce e în fstab și nu este încă montat. O greșeală apare acum, nu la reboot.'],
        ['findmnt /mnt/iso', 'confirmi că punctul de montare este activ.'],
      ],
      output: { label: 'illustrative', code: 'TARGET   SOURCE                      FSTYPE  OPTIONS\n/mnt/iso /dev/loop0                  iso9660 ro,relatime', explain: 'Valorile (loop0, opțiuni) diferă de la un sistem la altul. Contează că TARGET este /mnt/iso și FSTYPE este iso9660.' },
    },
    {
      title: 'Verifică repository-urile',
      purpose: 'Confirmi că dnf le citește.',
      hint: 'După modificarea .repo, curăță cache-ul.',
      commands: 'sudo dnf clean all\nsudo dnf repolist\nsudo dnf repolist --all\nsudo dnf --repo=local-baseos list available | head',
      explain: [
        ['dnf clean all', 'șterge metadata veche din cache.'],
        ['repolist', 'arată repository-urile active.'],
        ['--all', 'include și cele dezactivate, cu stare.'],
        ['--repo=local-baseos', 'dezactivează temporar toate celelalte; vezi doar pachetele din BaseOS.'],
      ],
      output: { label: 'illustrative', code: 'repo id           repo name\nlocal-appstream   Local AppStream\nlocal-baseos      Local BaseOS', explain: 'Ambele ID-uri trebuie să apară. Dacă apare doar unul, reciți secțiunea lipsă din local.repo.' },
    },
    {
      title: 'Dezactivează și reactivează un repository',
      purpose: 'Exersezi controlul persistent al unui repository.',
      hint: 'Fie `config-manager`, fie editezi `enabled=`.',
      commands: 'sudo dnf config-manager --set-disabled local-appstream\nsudo dnf repolist --all\nsudo dnf config-manager --set-enabled local-appstream\nsudo dnf repolist',
      explain: [
        ['config-manager --set-disabled ID', 'modifică enabled=0 în fișierul .repo (persistent). Dacă subcomanda nu e disponibilă pe versiunea ta, schimbă manual enabled= cu un editor.'],
        ['--set-enabled ID', 'revine la enabled=1.'],
      ],
    },
  ],
  verification: [
    { cmd: 'findmnt /mnt/iso', expected: 'o linie cu TARGET /mnt/iso și FSTYPE iso9660' },
    { cmd: 'sudo dnf repolist', expected: 'local-baseos și local-appstream apar în listă' },
    { cmd: 'sudo mount -a; echo $?', expected: '0 (fstab este valid)' },
  ],
  persistence: [
    'Fișierul `local.repo` și `enabled=` persistă după reboot.',
    'Montarea ISO-ului persistă doar dacă linia din `/etc/fstab` este corectă. Confirmare manuală (într-un mediu unde îți permiți un reboot): `findmnt /mnt/iso` și `sudo dnf repolist` după repornire.',
  ],
  mistakes: [
    'Două slash-uri în `file://mnt/...` în loc de `file:///mnt/...`.',
    '`baseurl` la rădăcina ISO-ului, nu la `BaseOS`/`AppStream`.',
    'Uiți `dnf clean all` și vezi metadata veche.',
    'Scrii `/etc/fstab` greșit și sistemul poate întâmpina probleme la boot: testează mereu cu `mount -a` înainte de reboot.',
  ],
  troubleshooting: [
    { symptom: '`Cannot download repomd.xml`', cause: 'ISO nemontat sau calea din `baseurl` greșită', fix: '`findmnt /mnt/iso`; `ls /mnt/iso/BaseOS/repodata`; corectează `baseurl`.' },
    { symptom: 'repository-ul nu apare în `repolist`', cause: '`enabled=0` sau nume de fișier fără `.repo`', fix: '`repolist --all`; verifică extensia și conținutul.' },
    { symptom: '`mount: ... failed` la `mount -a`', cause: 'cale greșită a ISO-ului în fstab sau tip greșit', fix: 'verifică `ls -l` pe fișier și tipul `iso9660`.' },
  ],
  alternatives: [
    'Dacă ISO-ul este pe un disc optic/virtual: `mount /dev/sr0 /mnt/iso` (în fstab: `/dev/sr0 /mnt/iso iso9660 ro 0 0`).',
    'Un repository HTTP intern: `baseurl=https://...` în loc de `file:///`; nu are nevoie de montare.',
    '`dnf config-manager --add-repo URL`, dacă URL-ul indică un fișier `.repo`.',
  ],
};
