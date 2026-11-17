import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'uid', abbr: 'UID', full: 'User ID', ro: 'numărul care identifică un utilizator pentru kernel',
    what: 'Fiecare utilizator are un UID; fișierele și procesele stochează acest număr, nu numele. UID 0 = root; 1–999 = conturi de sistem; ≥1000 = conturi obișnuite (convenție RHEL).',
    how: 'Se alocă la creare (cel mai mic UID liber ≥ UID_MIN) sau se cere cu useradd -u. ls -l traduce numărul în nume prin /etc/passwd.',
    where: 'id, getent passwd, ls -ln, chown; NFS (se compară numerele, nu numele).',
    topics: ['L9.1'], aliases: ['user id', 'id utilizator', 'GID'],
  },
  {
    id: 'etc-passwd', abbr: '/etc/passwd', ro: 'fișierul public cu conturile locale (șapte câmpuri pe linie)',
    what: 'O linie per cont: nume:x:UID:GID:comentariu:home:shell. Litera x arată că parola este în /etc/shadow.',
    how: 'Citit de toți (traducerea UID → nume); modificat de useradd/usermod/userdel sau cu vipw (cu blocare).',
    where: 'getent passwd NUME; grep NUME /etc/passwd; depanarea login-ului (shell, home).',
    topics: ['L9.1'], aliases: ['passwd file', 'GECOS'],
  },
  {
    id: 'etc-shadow', abbr: '/etc/shadow', ro: 'fișierul secret cu hash-urile parolelor și datele de expirare',
    what: 'Nouă câmpuri pe linie: nume, hash, ultima schimbare, minim, maxim, avertizare, inactivitate, expirare cont, rezervat.',
    how: 'Lizibil doar de root; hash-ul începe cu un prefix (ex. $6$) care indică algoritmul; ! la început = parolă blocată. Datele sunt în zile de la 1970-01-01.',
    where: 'passwd, chage, usermod -L/-e; sudo grep NUME /etc/shadow.',
    std: 'shadow(5)', topics: ['L9.1', 'L9.2'], aliases: ['shadow file', 'hash parolă'],
  },
  {
    id: 'primary-group', abbr: 'grup primar', ro: 'grupul principal al unui utilizator, scris în /etc/passwd (câmpul GID)',
    what: 'Este grupul atribuit fișierelor noi create de utilizator. Fiecare utilizator are exact unul.',
    how: 'Se stabilește cu useradd -g sau usermod -g; trebuie să existe în /etc/group. Nu apare în lista de membri a grupului din /etc/group.',
    where: 'id (gid=), ls -l, useradd -g, usermod -g.',
    topics: ['L9.1', 'L9.3'], aliases: ['primary group', 'grup principal'],
  },
  {
    id: 'user-private-group', abbr: 'grup privat', full: 'User Private Group (UPG)', ro: 'grup cu același nume ca utilizatorul, creat automat, cu un singur membru',
    what: 'Permite ca fișierele noi să aparțină unui grup al utilizatorului, nu unui grup comun; ușurează colaborarea cu directoare setgid.',
    how: 'Creat de useradd dacă USERGROUPS_ENAB=yes (sau cu -U) și neapelat cu -g/-N; șters de userdel când rămâne gol.',
    where: 'id alice (gid=alice), useradd -N pentru a-l evita.',
    topics: ['L9.1', 'L9.3'], aliases: ['UPG', 'private group'],
  },
  {
    id: 'useradd', abbr: 'useradd', ro: 'comanda care creează un cont local de utilizator',
    what: 'Adaugă linii în passwd/shadow/group/gshadow și, cu -m sau CREATE_HOME, creează home-ul din /etc/skel. Contul nou are parola blocată.',
    how: 'Opțiuni: -m, -u, -g, -G, -c, -s, -d, -e, -f, -r, -N, -U, -D. Valorile implicite vin din /etc/login.defs și /etc/default/useradd.',
    where: 'Examen: „create user … with UID …, shell …, group …”.',
    std: 'useradd(8)', topics: ['L9.1'], aliases: ['adduser', 'creare utilizator'],
  },
  {
    id: 'usermod', abbr: 'usermod', ro: 'comanda care modifică un cont existent',
    what: 'Schimbă câmpuri: comentariu (-c), shell (-s), UID (-u), grup primar (-g), grupuri suplimentare (-G/-aG), home (-d/-m), nume (-l), blocare (-L/-U), expirare (-e/-f).',
    how: 'Editează aceleași fișiere ca useradd; nu mută automat home-ul la -l; refuză schimbări de nume/UID/home dacă utilizatorul are procese.',
    where: 'Examen: schimbare shell, adăugare în wheel, mutare home.',
    std: 'usermod(8)', topics: ['L9.1', 'L9.2', 'L9.3'], aliases: ['modificare utilizator'],
  },
  {
    id: 'userdel', abbr: 'userdel', ro: 'comanda care șterge un cont local',
    what: 'Șterge liniile contului; cu -r șterge și home-ul și mail spool-ul. Fișierele din alte locuri rămân.',
    how: 'Refuză dacă utilizatorul este conectat (cod 8); -f forțează (periculos). Șterge grupul privat dacă USERGROUPS_ENAB=yes și grupul e gol.',
    where: 'Examen: „delete user … including home”; find / -xdev -nouser pentru orfane.',
    std: 'userdel(8)', topics: ['L9.1'], aliases: ['ștergere utilizator'],
  },
  {
    id: 'skel', abbr: '/etc/skel', ro: 'directorul-șablon copiat în home-ul fiecărui cont nou',
    what: 'Conține fișiere de pornire (de exemplu .bashrc, .bash_profile, .bash_logout).',
    how: 'Copiat de useradd -m (alt șablon cu -k). Modificările ulterioare nu afectează conturile existente.',
    where: 'Standardizarea mediului pentru utilizatori noi.',
    topics: ['L9.1'], aliases: ['skeleton', 'schelet'],
  },
  {
    id: 'system-account', abbr: 'cont de sistem', ro: 'cont creat pentru un serviciu, cu UID mic, fără login interactiv',
    what: 'Rulează procese (sshd, chrony…) cu privilegii reduse. De obicei fără home și cu shell nologin.',
    how: 'Creat cu useradd -r; UID din intervalul SYS_UID_MIN–SYS_UID_MAX din /etc/login.defs; fără aging în shadow.',
    where: 'getent passwd (UID < 1000), servicii instalate din pachete.',
    topics: ['L9.1'], aliases: ['system account', 'service account', 'nologin'],
  },
];
