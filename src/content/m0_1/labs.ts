import type { Lab } from '../../lab/types';

export const LAB_M0_1A: Lab = {
  id: 'lab-m0-1a-identifica-sistemul',
  lessonId: 'M0.1',
  title: 'Identifică sistemul: versiune, nucleu, virtualizare și starea abonamentului',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Primești acces la o mașină Linux și trebuie să completezi o „fișă de identitate”: ce distribuție și versiune rulează, ce nucleu, ce arhitectură, dacă este virtuală, câtă memorie și câte procesoare are, dacă este înregistrată la Red Hat și ce repository-uri vede DNF.',
    'Sarcină: folosind doar comenzi de citire, completează fișa și precizează dacă sistemul este RHEL, o recompilare compatibilă sau altceva.',
  ],
  initialConditions: [
    'Ai un terminal pe un sistem Linux (de preferință RHEL 10 sau compatibil), ca utilizator obișnuit; `sudo` este util pentru comenzile `subscription-manager`, dar nu obligatoriu.',
  ],
  finalState: [
    'Ai o fișă cu opt câmpuri, fiecare susținut de comanda care l-a produs.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți spune numele și versiunea distribuției, din două fișiere diferite.', manualCheck: 'cat /etc/redhat-release; cat /etc/os-release' },
    { id: 'ac2', text: 'Poți spune versiunea nucleului și arhitectura.', manualCheck: 'uname -r; uname -m' },
    { id: 'ac3', text: 'Poți spune dacă sistemul este virtual și, dacă da, pe ce hypervisor.', manualCheck: 'systemd-detect-virt; hostnamectl' },
    { id: 'ac4', text: 'Poți spune numărul de procesoare și memoria totală.', manualCheck: 'nproc; free -h' },
    { id: 'ac5', text: 'Poți spune dacă sistemul este înregistrat și ce repository-uri vede DNF.', manualCheck: 'sudo subscription-manager identity; dnf repolist' },
    { id: 'ac6', text: 'Poți spune dacă este RHEL sau altceva, pe baza pachetului `redhat-release` și a câmpului ID.', manualCheck: 'rpm -q redhat-release; grep ^ID= /etc/os-release' },
  ],
  steps: [
    {
      title: 'Versiunea distribuției',
      purpose: 'Citești identitatea din cele două locuri standard.',
      hint: '`/etc/redhat-release` este o singură linie; `/etc/os-release` este un fișier cu câmpuri.',
      commands: 'cat /etc/redhat-release\ncat /etc/os-release\ngrep ^ID= /etc/os-release\nrpm -q redhat-release',
      explain: [
        ['cat /etc/redhat-release', 'o singură linie cu produsul și versiunea; există pe sistemele familiei Red Hat.'],
        ['cat /etc/os-release', 'câmpurile NAME, ID, VERSION_ID, PRETTY_NAME etc.'],
        ['grep ^ID= /etc/os-release', 'afișează doar linia care începe cu „ID=”; ^ înseamnă „la începutul liniei”.'],
        ['rpm -q redhat-release', 'dacă pachetul există, sistemul este RHEL; recompilările folosesc alte nume (de exemplu rocky-release, almalinux-release).'],
      ],
      output: {
        label: 'illustrative',
        code: 'Red Hat Enterprise Linux release 10.0 (Coughlan)\nNAME="Red Hat Enterprise Linux"\nVERSION="10.0 (Coughlan)"\nID="rhel"\nVERSION_ID="10.0"\nPRETTY_NAME="Red Hat Enterprise Linux 10.0 (Coughlan)"\nID="rhel"\nredhat-release-10.0-1.el10.x86_64',
        explain: 'Exemplu pentru RHEL. Pe Rocky sau Alma, ID va fi "rocky" sau "almalinux" și pachetul va avea alt nume. Numerele de versiune sunt exemplificative.',
      },
      reflect: 'De ce un script ar folosi mai degrabă /etc/os-release decât /etc/redhat-release?',
    },
    {
      title: 'Nucleu, arhitectură, virtualizare',
      purpose: 'Afli ce nucleu rulează și dacă lucrezi într-o VM.',
      hint: '`systemd-detect-virt` răspunde „none” pe hardware real.',
      commands: 'uname -r\nuname -m\nsystemd-detect-virt\nhostnamectl',
      explain: [
        ['uname -r', 'versiunea nucleului în execuție.'],
        ['uname -m', 'arhitectura: x86_64, aarch64 etc.'],
        ['systemd-detect-virt', 'tipul de virtualizare detectat sau „none”.'],
        ['hostnamectl', 'rezumat: nume, sistem de operare, nucleu, arhitectură, virtualizare.'],
      ],
      output: {
        label: 'illustrative',
        code: '6.12.0-55.el10.x86_64\nx86_64\nkvm\n Static hostname: server1.example.com\n Operating System: Red Hat Enterprise Linux 10.0 (Coughlan)\n          Kernel: Linux 6.12.0-55.el10.x86_64\n    Architecture: x86-64\n Virtualization: kvm',
        explain: 'Valorile depind de mașina ta. În VirtualBox, systemd-detect-virt dă de obicei „oracle”; în Hyper-V, „microsoft”.',
      },
    },
    {
      title: 'Resurse',
      purpose: 'Notezi procesoarele și memoria, ca să știi ce poți face în mediul de exercițiu.',
      hint: 'Pentru examen și laboratoare contează să ai suficientă memorie pentru VM.',
      commands: 'nproc\nfree -h\nlscpu | head -10',
      explain: [
        ['nproc', 'numărul de procesoare disponibile procesului.'],
        ['free -h', 'memorie și swap (M0.5).'],
        ['lscpu | head -10', 'primele 10 linii cu arhitectura și modelul procesorului.'],
      ],
      output: {
        label: 'illustrative',
        code: '2\n               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       612Mi       2.6Gi       9.0Mi       820Mi       3.2Gi\nSwap:          2.0Gi          0B       2.0Gi',
        explain: 'Exemplu: 2 procesoare, 3,8 GiB memorie. Valorile tale vor fi altele.',
      },
    },
    {
      title: 'Abonament și repository-uri',
      purpose: 'Stabilești dacă sistemul poate instala pachete din repository-urile Red Hat.',
      hint: 'Pe o recompilare (Rocky/Alma), `subscription-manager` nu este folosit; DNF are propriile repository-uri.',
      commands: 'sudo subscription-manager identity\nsudo subscription-manager status\ndnf repolist\nls /etc/yum.repos.d/',
      explain: [
        ['subscription-manager identity', 'arată identitatea dacă sistemul este înregistrat; altfel spune că nu este.'],
        ['subscription-manager status', 'starea abonamentului.'],
        ['dnf repolist', 'repository-urile vizibile pentru DNF.'],
        ['ls /etc/yum.repos.d/', 'fișierele .repo configurate pe sistem.'],
      ],
      output: {
        label: 'illustrative',
        code: 'This system is not yet registered. Try \'subscription-manager register --help\' for more information.\nOverall Status: Not registered\nThis system has no repositories available through subscriptions.\nredhat.repo',
        explain: 'Exemplu pentru un RHEL neînregistrat. Pe un sistem înregistrat vei vedea „Overall Status: Current” și repository-urile BaseOS și AppStream. Pe o recompilare comunitară, mesajele diferă. Mesajele exacte trebuie confirmate pe sistemul tău.',
      },
      reflect: 'Ce ai face dacă ai avea nevoie să instalezi un pachet, dar sistemul este neînregistrat și fără acces la contul Red Hat?',
    },
    {
      title: 'Fișa de identitate',
      purpose: 'Formulezi concluzia.',
      hint: 'Pe o singură pagină: distribuție, versiune, nucleu, arhitectură, VM sau fizic, resurse, abonament, repository-uri.',
      commands: 'cat > ~/fisa-sistem.txt <<EOF\nDistribuție: ...\nVersiune: ...\nNucleu: ...\nArhitectură: ...\nVirtualizare: ...\nCPU / RAM: ...\nAbonament: ...\nRepository-uri: ...\nEOF\ncat ~/fisa-sistem.txt',
      explain: [
        ['cat > FIȘIER <<EOF', 'here-document: textul până la linia EOF este scris în fișier (redirecționarea: L1.5).'],
        ['cat FIȘIER', 'afișezi fișierul ca să verifici.'],
      ],
      output: {
        label: 'illustrative',
        code: 'Distribuție: ...\nVersiune: ...\nNucleu: ...\nArhitectură: ...\nVirtualizare: ...\nCPU / RAM: ...\nAbonament: ...\nRepository-uri: ...',
        explain: 'Înlocuiește punctele cu valorile găsite. Fișa nu conține parole sau date de cont; poți șterge fișierul la final cu rm ~/fisa-sistem.txt.',
      },
    },
  ],
  verification: [
    { cmd: 'cat /etc/redhat-release', expected: 'o linie cu numele și versiunea sistemului (pe familia Red Hat).' },
    { cmd: 'uname -r', expected: 'versiunea nucleului, de forma `6.12.0-…el10.x86_64` pe RHEL 10.' },
    { cmd: 'dnf repolist', expected: 'lista repository-urilor sau un mesaj care explică de ce lipsesc.' },
  ],
  persistence: [
    'Nu s-a modificat nimic în afară de fișierul opțional `~/fisa-sistem.txt`, care persistă după reboot până îl ștergi.',
    'Starea abonamentului este persistentă (supraviețuiește reboot-ului), dar aici doar o citești.',
  ],
  mistakes: [
    'Scrierea parolelor sau a datelor contului Red Hat în fișa de identitate.',
    'Concluzia „este RHEL” doar pentru că `ID_LIKE` conține `fedora` sau `centos`.',
    'Confuzia dintre versiunea nucleului și versiunea RHEL.',
    'Rularea `subscription-manager register` ca „test” fără să vrei să înregistrezi sistemul.',
  ],
  troubleshooting: [
    { symptom: '`subscription-manager: command not found`', cause: 'pachetul nu este instalat (de exemplu pe o recompilare comunitară)', fix: 'normal pe distribuții fără abonament Red Hat; folosește doar `dnf repolist`' },
    { symptom: '`cat /etc/redhat-release` nu găsește fișierul', cause: 'distribuția nu este din familia Red Hat', fix: 'folosește `/etc/os-release`' },
    { symptom: '`sudo` cere o parolă pe care nu o ai', cause: 'utilizatorul nu are drepturi sudo', fix: 'sari peste comenzile cu sudo și menționează în fișă „nu pot verifica”' },
  ],
  alternatives: [
    '`hostnamectl` oferă majoritatea informațiilor într-o singură comandă.',
    '`cat /proc/version` afișează versiunea nucleului și compilatorul.',
    '`lsb_release -a` poate lipsi pe RHEL; nu te baza pe el.',
  ],
};

export const LAB_M0_1B: Lab = {
  id: 'lab-m0-1b-mediu-de-exercitiu-sigur',
  lessonId: 'M0.1',
  title: 'Evaluează mediul tău de exercițiu: instantaneu, consolă, disc suplimentar, rețea',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Înainte de laboratoarele din capitolele următoare (discuri, rețea, SELinux, bootloader) vrei să te asiguri că mediul tău de exercițiu este sigur: poți reveni după o greșeală, ai acces la consolă dacă pierzi SSH-ul, ai un disc gol pe care poți exersa și ai rețea.',
    'Platforma nu creează, nu verifică și nu se conectează la mediul tău. Sarcina ta este să-l pregătești tu, în instrumentul de virtualizare ales, și să confirmi cu comenzi de citire în VM.',
    'Dacă nu ai încă o VM, parcurge doar criteriile care se pot confirma pe orice sistem Linux (rețea, discuri) și notează restul ca „de făcut”.',
  ],
  initialConditions: [
    'Ai un hypervisor sau un serviciu de virtualizare ales de tine (instalat și configurat de tine) și o VM cu RHEL 10 sau compatibil.',
    'Nu este nevoie de abonament Red Hat pentru acest laborator.',
  ],
  finalState: [
    'Ai bifat, pentru VM-ul tău: instantaneu creat, consolă accesibilă, un disc suplimentar gol vizibil în VM, rețea cu acces la internet.',
  ],
  criteria: [
    { id: 'bc1', text: 'Ai creat, în instrumentul tău de virtualizare, un instantaneu al VM-ului curat și știi cum îl restaurezi.', manualCheck: 'declarat de tine; în VM: uptime (confirmă că rulezi în VM-ul pe care l-ai captat)' },
    { id: 'bc2', text: 'Poți deschide consola VM-ului din instrumentul de virtualizare și te poți autentifica acolo, fără SSH.', manualCheck: 'declarat de tine; în consolă: whoami; hostname' },
    { id: 'bc3', text: 'VM-ul are cel puțin un disc suplimentar gol, vizibil în sistem.', manualCheck: 'lsblk; lsblk -f' },
    { id: 'bc4', text: 'VM-ul are o adresă IP și acces la internet.', manualCheck: 'ip -br address; ip route; ping -c 2 192.0.2.1 (înlocuiește cu o adresă accesibilă din rețeaua ta)' },
    { id: 'bc5', text: 'Ai notat resursele VM-ului și ai hotărât ce variantă de sistem folosești (RHEL, recompilare, Stream).', manualCheck: 'nproc; free -h; cat /etc/os-release' },
  ],
  steps: [
    {
      title: 'Instantaneu și consolă (în instrumentul tău de virtualizare)',
      purpose: 'Asigurarea unei căi de revenire și a accesului când rețeaua se defectează.',
      hint: 'Numele pașilor din instrumentul tău diferă (Snapshot/Checkpoint). Fă instantaneul când VM-ul este curat și oprit sau pe un sistem în stare cunoscută.',
      commands: '# în instrumentul de virtualizare ales de tine:\n# 1) creează un instantaneu al VM-ului curat\n# 2) deschide consola VM-ului și autentifică-te\n# în VM:\nwhoami\nhostname\nuptime',
      explain: [
        ['instantaneu (snapshot/checkpoint)', 'salvează starea discului (și, opțional, a memoriei) ca să poți reveni după o greșeală.'],
        ['consola VM-ului', 'ecran și tastatură virtuale, independente de rețea: salvează situația când SSH-ul nu mai merge.'],
        ['whoami; hostname; uptime', 'confirmă că ești în VM-ul corect și de când rulează.'],
      ],
      output: {
        label: 'illustrative',
        code: 'student\nserver1.example.com\n 09:14:07 up  1:13,  1 user,  load average: 0.08, 0.04, 0.01',
        explain: 'Valorile sunt exemplificative. Pașii din instrumentul de virtualizare nu pot fi ilustrați aici, fiindcă diferă între produse.',
      },
      reflect: 'Ce s-ar întâmpla dacă ai schimba adresa IP greșit într-o sesiune SSH, fără acces la consolă?',
    },
    {
      title: 'Disc suplimentar',
      purpose: 'Pentru C5 și C6 ai nevoie de un disc gol pe care poți greși fără urmări.',
      hint: 'Un disc „gol” nu are partiții și nu are sistem de fișiere montat. NU folosi discul pe care este instalat sistemul.',
      commands: 'lsblk\nlsblk -f\ndf -h',
      explain: [
        ['lsblk', 'arbore de dispozitive de bloc: discuri, partiții, volume; TYPE „disk” fără copii și fără MOUNTPOINTS = disc neutilizat.'],
        ['lsblk -f', 'adaugă tipul sistemului de fișiere și UUID; un disc gol are câmpurile FSTYPE și MOUNTPOINTS goale.'],
        ['df -h', 'sistemele de fișiere montate; discul nou nu trebuie să apară aici.'],
      ],
      output: {
        label: 'illustrative',
        code: 'NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS\nvda           252:0    0   20G  0 disk\n├─vda1        252:1    0    1G  0 part /boot\n└─vda2        252:2    0   19G  0 part\n  ├─rhel-root 253:0    0   17G  0 lvm  /\n  └─rhel-swap 253:1    0    2G  0 lvm  [SWAP]\nvdb           252:16   0   10G  0 disk',
        explain: 'Exemplu: vda este discul sistemului; vdb (10 GiB) este discul suplimentar gol. Numele (vda/sda/nvme0n1) depind de virtualizare. Nu scrie nimic pe disc în acest laborator.',
      },
    },
    {
      title: 'Rețea și acces la internet',
      purpose: 'Confirmi că VM-ul are adresă, rută și poate ajunge la servere externe.',
      hint: 'Dacă ping este blocat în rețeaua ta, încearcă `curl -I https://www.redhat.com` (dacă curl este instalat) sau `getent hosts www.redhat.com` pentru DNS.',
      commands: 'ip -br address\nip route\ngetent hosts www.redhat.com\nping -c 2 www.redhat.com',
      explain: [
        ['ip -br address', 'interfețele și adresele lor, o linie pe interfață.'],
        ['ip route', 'ruta implicită („default via …”) este gateway-ul.'],
        ['getent hosts NUME', 'rezolvă numele folosind aceleași surse ca aplicațiile (/etc/hosts, DNS).'],
        ['ping -c 2', 'trimite două cereri ICMP și se oprește (-c = count).'],
      ],
      output: {
        label: 'illustrative',
        code: 'lo               UNKNOWN        127.0.0.1/8 ::1/128\nens3             UP             192.0.2.10/24\ndefault via 192.0.2.1 dev ens3 proto dhcp src 192.0.2.10 metric 100\n2001:db8::443 www.redhat.com\n2 packets transmitted, 2 received, 0% packet loss',
        explain: 'Adresele din exemplu sunt din intervalul de documentație 192.0.2.0/24; ale tale vor fi altele. Dacă ping eșuează dar `getent hosts` merge, rețeaua poate bloca ICMP; dacă getent eșuează, verifică DNS (L8.3).',
      },
    },
    {
      title: 'Decizia: ce sistem folosești',
      purpose: 'Alegi conștient mediul și notezi limitările.',
      hint: 'Notează: sistemul ales, resursele, dacă are abonament, locul unde ții instantaneele.',
      commands: 'cat /etc/os-release\nnproc\nfree -h\nsystemd-detect-virt',
      explain: [
        ['cat /etc/os-release', 'ce sistem este de fapt.'],
        ['nproc / free -h', 'resursele alocate VM-ului.'],
        ['systemd-detect-virt', 'confirmă că ești în VM.'],
      ],
      output: {
        label: 'illustrative',
        code: 'PRETTY_NAME="Red Hat Enterprise Linux 10.0 (Coughlan)"\n2\nMem:           3.8Gi\nkvm',
        explain: 'Un exemplu de concluzie: „RHEL 10 într-o VM KVM cu 2 CPU, 3,8 GiB RAM, un disc de 20 GiB și unul de 10 GiB”.',
      },
      reflect: 'Ce limite are mediul tău față de cel de examen (resurse, rețea, abonament)?',
    },
  ],
  verification: [
    { cmd: 'lsblk', expected: 'cel puțin un disc fără partiții și fără punct de montare.' },
    { cmd: 'ip -br address; ip route', expected: 'o adresă pe o interfață activă și o rută „default via …”.' },
    { cmd: 'systemd-detect-virt', expected: 'numele hypervisor-ului (ex. `kvm`), nu `none`, dacă lucrezi într-o VM.' },
  ],
  persistence: [
    'Nu se modifică nimic în VM în acest laborator. Instantaneul și discul suplimentar sunt gestionate în instrumentul tău de virtualizare, nu de această platformă.',
    'Instantaneul tău este starea de revenire: păstrează-l până termini capitolul în curs și refă-l după fiecare modificare majoră pe care vrei să o păstrezi.',
  ],
  mistakes: [
    'Folosirea discului sistemului în loc de discul suplimentar în laboratoarele de stocare.',
    'Lipsa instantaneului înainte de modificări la rețea, SELinux sau GRUB.',
    'Alocarea prea puținei memorii (sub 2 GiB poate face instalarea sau laboratoarele lente).',
    'Păstrarea VM-ului înregistrat după ștergere (vezi lecția: `subscription-manager unregister`).',
  ],
  troubleshooting: [
    { symptom: 'discul suplimentar nu apare în `lsblk`', cause: 'nu a fost atașat VM-ului sau VM-ul nu a fost repornit', fix: 'verifică setările VM-ului în instrumentul de virtualizare; repornește VM-ul' },
    { symptom: 'ip nu arată nicio adresă pe interfața activă', cause: 'rețeaua VM-ului nu este conectată sau DHCP nu răspunde', fix: 'verifică tipul de rețea din setările VM-ului; vezi capitolul C8' },
    { symptom: '`ping` eșuează, dar browserul din gazdă merge', cause: 'ICMP blocat sau DNS nefuncțional în VM', fix: 'încearcă `getent hosts nume` și `ip route`' },
  ],
  alternatives: [
    'Un al doilea disc se poate înlocui cu un fișier (loop device) pentru exerciții simple, dar nu pentru toate laboratoarele de stocare.',
    'Dacă folosești un serviciu cloud, instantaneul și consola se numesc altfel; principiul rămâne același.',
  ],
};
