import type { Lab } from '../../lab/types';

export const LAB_L10_4A: Lab = {
  id: 'lab-l10-4-citire-contexte',
  lessonId: 'L10.4',
  title: 'Citirea contextelor SELinux ale fișierelor și proceselor',
  modes: ['guided', 'independent'],
  objectives: ['C10-5'],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Pe o mașină RHEL de test cu SELinux în `enforcing` (verifică cu `getenforce`), ca `student`. Laboratorul este de CITIRE: nu modifici nimic în afara unui director de test. Platforma nu rulează nimic.',
    'Sarcina 1: afișează contextul complet al fișierelor `/etc/hostname`, `/etc/passwd`, `/etc/shadow` și al directoarelor `/tmp`, `/var/log`, `/home`. Pentru fiecare, extrage separat TIPUL.',
    'Sarcina 2: afișează contextul proceselor `systemd`, `sshd` și al propriului tău shell; identifică domeniile.',
    'Sarcina 3: afișează contextul tău cu `id -Z` și cu `stat`.',
    'Sarcina 4: pentru `/var/www/html/index.html` și `/etc/shadow`, află eticheta IMPLICITĂ cu `matchpathcon`, chiar dacă fișierul nu există.',
    'Sarcina 5: pune într-un tabel (pe hârtie) cele cinci tipuri găsite și rolul lor.',
  ],
  initialConditions: [
    'SELinux în enforcing sau permissive (nu disabled).',
    'sshd rulează (sau alt serviciu de rețea la alegere).',
    'Pachetul policycoreutils este instalat (matchpathcon).',
  ],
  finalState: [
    'Ai notat tipul fiecărui fișier și domeniul fiecărui proces cerut.',
    'Ai comparat contextul curent cu cel implicit pentru două căi.',
    'Nu ai modificat nicio etichetă.',
  ],
  criteria: [
    { id: 'ac1', text: 'Am afișat contextele fișierelor cerute și am extras tipul fiecăruia.', manualCheck: "ls -ldZ /etc/hostname /etc/passwd /etc/shadow /tmp /var/log /home; stat -c '%C %n' /etc/passwd" },
    { id: 'ac2', text: 'Am identificat domeniile systemd (init_t), sshd (sshd_t) și al shell-ului meu.', manualCheck: "ps -eZ | grep -E 'systemd|sshd'; ps -Z" },
    { id: 'ac3', text: 'Am afișat propriul context cu id -Z.', manualCheck: 'id -Z' },
    { id: 'ac4', text: 'Am aflat contextul implicit al /var/www/html/index.html și /etc/shadow.', manualCheck: 'matchpathcon /var/www/html/index.html /etc/shadow' },
    { id: 'ac5', text: 'Pot explica cele patru câmpuri ale unui context și de ce tipul este cel important.', manualCheck: 'ls -Z /etc/hostname' },
  ],
  steps: [
    {
      title: 'Contexte de fișiere și directoare',
      purpose: 'Te obișnuiești cu coloana de context și cu -d pentru directoare.',
      hint: '-Z adaugă contextul; -d arată directorul însuși.',
      commands: "ls -lZ /etc/hostname /etc/passwd /etc/shadow\nls -dZ /tmp /var/log /home /root 2>/dev/null\nstat -c '%C  %n' /etc/passwd /etc/shadow",
      explain: [
        ['ls -lZ', '-l format lung, -Z context.'],
        ['ls -dZ', '-d = directorul, nu conținutul. 2>/dev/null ascunde „Permission denied” pentru /root.'],
        ["stat -c '%C  %n'", '%C = contextul, %n = numele.'],
      ],
      output: { label: 'illustrative', code: '-rw-r--r--. 1 root root system_u:object_r:hostname_etc_t:s0 10 Nov 10 09:12 /etc/hostname\n-rw-r--r--. 1 root root system_u:object_r:passwd_file_t:s0 2201 Nov 12 11:30 /etc/passwd\n----------. 1 root root system_u:object_r:shadow_t:s0 1043 Nov 12 11:30 /etc/shadow\ndrwxrwxrwt. 12 root root system_u:object_r:tmp_t:s0 4096 Nov 17 17:30 /tmp\ndrwxr-xr-x. 8 root root system_u:object_r:var_log_t:s0 4096 Nov 17 03:14 /var/log\ndrwxr-xr-x. 3 root root system_u:object_r:home_root_t:s0 22 Oct 3 12:00 /home', explain: 'Tipurile: hostname_etc_t, passwd_file_t, shadow_t, tmp_t, var_log_t, home_root_t. Fiecare fișier important are tipul lui; numele exacte pot diferi pe RHEL 10.' },
      reflect: 'De ce are /etc/shadow un tip propriu (shadow_t), diferit de restul fișierelor din /etc?',
    },
    {
      title: 'Contexte de procese',
      purpose: 'Vezi domeniile în care rulează serviciile, față de shell-ul tău.',
      hint: 'ps -eZ afișează contextul tuturor proceselor.',
      commands: "ps -eZ | grep -E ' systemd$| sshd$| chronyd$'\nps -ZC sshd\nps -Z\nid -Z",
      explain: [
        ['ps -eZ | grep …', 'filtrează liniile utile (spațiul și $ ancorează numele comenzii).'],
        ['ps -ZC sshd', '-C = după numele comenzii.'],
        ['ps -Z', 'doar procesele din terminalul tău.'],
        ['id -Z', 'contextul sesiunii tale.'],
      ],
      output: { label: 'illustrative', code: 'system_u:system_r:init_t:s0                   1 ?  00:00:03 systemd\nsystem_u:system_r:sshd_t:s0-s0:c0.c1023     912 ?  00:00:00 sshd\nsystem_u:system_r:chronyd_t:s0              701 ?  00:00:00 chronyd\nLABEL                                       PID TTY  CMD\nunconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023 1844 pts/0 bash\nunconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023', explain: 'Serviciile au domenii proprii (init_t, sshd_t, chronyd_t); shell-ul tău rulează în unconfined_t, deci SELinux îl restricționează puțin.' },
    },
    {
      title: 'Contextul implicit vs cel actual',
      purpose: 'Înveți să compari eticheta curentă cu cea pe care ar trebui s-o aibă.',
      hint: 'matchpathcon citește politica, nu fișierul.',
      commands: "matchpathcon /var/www/html/index.html /etc/shadow /home/student\nmatchpathcon -V /etc/hostname /etc/shadow\nsudo semanage fcontext -l | grep -E '^/var/www' | head -n 3\nsudo semanage fcontext -l -C",
      explain: [
        ['matchpathcon CALE…', 'contextul implicit din politică pentru fiecare cale.'],
        ['matchpathcon -V', 'verifică dacă eticheta de pe disc este cea implicită (verified).'],
        ['semanage fcontext -l | grep', 'regulile din politică pentru /var/www (filtrate).'],
        ['semanage fcontext -l -C', 'personalizările locale (de obicei nimic).'],
      ],
      output: { label: 'illustrative', code: '/var/www/html/index.html\tsystem_u:object_r:httpd_sys_content_t:s0\n/etc/shadow\tsystem_u:object_r:shadow_t:s0\n/home/student\tunconfined_u:object_r:user_home_dir_t:s0\n/etc/hostname verified.\n/etc/shadow verified.\n/var/www(/.*)?    all files    system_u:object_r:httpd_sys_content_t:s0', explain: 'Calea /var/www/html/index.html nu trebuie să existe: matchpathcon răspunde după reguli. „verified” înseamnă că eticheta de pe disc coincide cu cea implicită.' },
    },
    {
      title: 'Sinteza',
      purpose: 'Formulezi, pe baza datelor, ce învață un administrator din context.',
      hint: 'Tabel: cale/proces → tip/domeniu → ce înseamnă.',
      commands: "ls -dZ /var/log /tmp\nps -ZC sshd\n# notează pe hârtie 5 tipuri/domenii cu rolul lor",
      explain: [
        ['(notițe)', 'completează un tabel cu: obiect, context complet, tip/domeniu, observație.'],
      ],
    },
  ],
  verification: [
    { cmd: 'ls -dZ /var/log', expected: 'var_log_t în câmpul de tip' },
    { cmd: 'ps -ZC sshd', expected: 'sshd_t în câmpul de tip' },
    { cmd: 'matchpathcon /etc/shadow', expected: 'shadow_t' },
  ],
  persistence: [
    'Laboratorul doar citește; nu schimbă nicio etichetă, deci nu există nimic de persistat.',
  ],
  mistakes: [
    'Uitarea lui -d la directoare.',
    'Confundarea domeniului cu tipul fișierului.',
    'Pornirea de la ls -l și ignorarea lui -Z.',
  ],
  troubleshooting: [
    { symptom: 'ls -Z nu afișează un context (apare ?)', cause: 'SELinux dezactivat sau sistem de fișiere fără suport', fix: 'getenforce; df -T pentru tipul sistemului de fișiere.' },
    { symptom: 'matchpathcon: command not found', cause: 'pachetul libselinux-utils/policycoreutils lipsește', fix: 'sudo dnf install libselinux-utils policycoreutils' },
    { symptom: 'semanage: command not found', cause: 'lipsește policycoreutils-python-utils', fix: 'sudo dnf install policycoreutils-python-utils' },
  ],
  alternatives: [
    'ps auxZ în loc de ps -eZ.',
    'cat /proc/PID/attr/current pentru contextul unui proces anume.',
    'ls -Z fără -l pentru un rezultat mai scurt.',
  ],
};

export const LAB_L10_4B: Lab = {
  id: 'lab-l10-4-mostenire-etichete',
  lessonId: 'L10.4',
  title: 'Moștenirea etichetelor: touch, cp, mv, cp -a și efectul asupra unui serviciu',
  modes: ['guided', 'independent'],
  objectives: ['C10-5'],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Pe o mașină RHEL de test (VM cu instantaneu), SELinux în enforcing, ca `student` cu `sudo`. Pachetul `httpd` poate fi instalat opțional (pentru Sarcina 4); dacă nu, rămâi la citirea etichetelor. Platforma nu rulează nimic.',
    'Sarcina 1: creează `~/ctx-lab/a.txt`; notează tipul. Creează directorul `/srv/web`; notează tipul lui.',
    'Sarcina 2: copiază `a.txt` în `/srv/web/cp.txt`, mută o altă copie în `/srv/web/mv.txt` și compară etichetele (cp vs mv).',
    'Sarcina 3: copiază cu `cp -a` și cu `cp --preserve=context` și explică ce au păstrat.',
    'Sarcina 4 (opțional, dacă ai httpd): arată tipul directorului `/var/www/html` și al unui fișier creat acolo; compară cu `matchpathcon`.',
    'Sarcina 5: formulează, într-un paragraf, regula „creare/cp = tipul destinației; mv = păstrează sursa”, cu dovezi din output-urile tale.',
  ],
  initialConditions: [
    'Directoarele ~/ctx-lab și /srv/web nu există.',
    'student are sudo.',
    'SELinux nu este disabled.',
  ],
  finalState: [
    'Ai demonstrat diferența cp vs mv și rolul lui cp -a.',
    'Directoarele de test sunt șterse la final.',
  ],
  criteria: [
    { id: 'ac1', text: 'Am notat tipul lui a.txt (user_home_t sau similar) și al directorului /srv/web.', manualCheck: 'ls -Z ~/ctx-lab/a.txt; ls -dZ /srv/web' },
    { id: 'ac2', text: 'cp.txt are tipul directorului destinație, iar mv.txt a păstrat tipul sursei.', manualCheck: 'ls -lZ /srv/web' },
    { id: 'ac3', text: 'Am arătat că cp -a/--preserve=context păstrează contextul sursei.', manualCheck: 'ls -lZ /srv/web/cpa.txt' },
    { id: 'ac4', text: 'Știu comanda care arată eticheta implicită pentru calea mv.txt.', manualCheck: 'matchpathcon /srv/web/mv.txt' },
    { id: 'ac5', text: 'Am curățat directoarele de test.', manualCheck: 'ls -d ~/ctx-lab /srv/web 2>&1' },
  ],
  steps: [
    {
      title: 'Pregătire și etichetele de pornire',
      purpose: 'Creezi materialul și vezi ce etichete moștenește.',
      hint: 'touch în home → user_home_t; /srv/web ia tipul părintelui /srv.',
      commands: "mkdir ~/ctx-lab && cd ~/ctx-lab\nprintf 'test\\n' > a.txt\nprintf 'test\\n' > b.txt\nls -Z a.txt b.txt\nsudo mkdir /srv/web\nls -dZ /srv/web /srv",
      explain: [
        ['printf \'test\\n\' > a.txt', 'creează un fișier cu un rând.'],
        ['sudo mkdir /srv/web', 'creează directorul de test cu drepturi de root.'],
        ['ls -dZ /srv/web /srv', 'compară tipul directorului cu al părintelui: moștenire.'],
      ],
      output: { label: 'illustrative', code: 'unconfined_u:object_r:user_home_t:s0 a.txt\nunconfined_u:object_r:user_home_t:s0 b.txt\nunconfined_u:object_r:var_t:s0 /srv/web\nsystem_u:object_r:var_t:s0 /srv', explain: 'Fișierele din home au user_home_t. /srv/web are același tip ca /srv (aici var_t; poate fi altul pe RHEL 10): moștenire de la părinte.' },
    },
    {
      title: 'cp vs mv',
      purpose: 'Vezi diferența dintre creare (cp) și redenumire (mv).',
      hint: 'Compară coloana de context.',
      commands: "sudo cp ~/ctx-lab/a.txt /srv/web/cp.txt\nsudo mv ~/ctx-lab/b.txt /srv/web/mv.txt\nsudo ls -lZ /srv/web\nmatchpathcon /srv/web/cp.txt /srv/web/mv.txt\nsudo matchpathcon -V /srv/web/cp.txt /srv/web/mv.txt",
      explain: [
        ['cp', 'creează un fișier nou: ia tipul destinației.'],
        ['mv', 'doar redenumește (același sistem de fișiere): păstrează tipul vechi.'],
        ['matchpathcon -V', 'verifică dacă eticheta de pe disc este cea implicită pentru acea cale; mv.txt va diferi.'],
      ],
      output: { label: 'illustrative', code: '-rw-r--r--. 1 root    root    unconfined_u:object_r:var_t:s0       5 Nov 17 17:40 cp.txt\n-rw-r--r--. 1 student student unconfined_u:object_r:user_home_t:s0 5 Nov 17 17:40 mv.txt\n/srv/web/cp.txt\tsystem_u:object_r:var_t:s0\n/srv/web/mv.txt\tsystem_u:object_r:var_t:s0\n/srv/web/cp.txt verified.\n/srv/web/mv.txt has context unconfined_u:object_r:user_home_t:s0, should be system_u:object_r:var_t:s0', explain: 'Aceeași destinație, etichete diferite: doar mv.txt are o etichetă „greșită” față de cea implicită a căii. Aceasta este cauza clasică a erorilor cu fișiere mutate.' },
      reflect: 'Ce comandă ai folosi (L10.5) ca să corectezi mv.txt?',
    },
    {
      title: 'cp -a și --preserve=context',
      purpose: 'Vezi când contextul sursei este păstrat intenționat.',
      hint: 'Folosește tot un fișier din home.',
      commands: "printf 'test\\n' > ~/ctx-lab/c.txt\nsudo cp -a ~/ctx-lab/c.txt /srv/web/cpa.txt\nsudo cp --preserve=context ~/ctx-lab/c.txt /srv/web/cpc.txt\nsudo cp ~/ctx-lab/c.txt /srv/web/cp2.txt\nsudo ls -lZ /srv/web",
      explain: [
        ['cp -a', 'arhivare: păstrează proprietar, drepturi, date și, de asemenea, contextul SELinux.'],
        ['cp --preserve=context', 'păstrează doar contextul.'],
        ['cp simplu', 'ia contextul destinației.'],
      ],
      output: { label: 'illustrative', code: '-rw-r--r--. 1 student student unconfined_u:object_r:user_home_t:s0 5 Nov 17 17:41 cpa.txt\n-rw-r--r--. 1 root    root    unconfined_u:object_r:user_home_t:s0 5 Nov 17 17:41 cpc.txt\n-rw-r--r--. 1 root    root    unconfined_u:object_r:var_t:s0       5 Nov 17 17:41 cp2.txt', explain: 'cpa.txt și cpc.txt păstrează user_home_t; cp2.txt ia tipul destinației. cp -a păstrează și proprietarul; --preserve=context doar eticheta.' },
    },
    {
      title: 'Opțional: un serviciu web',
      purpose: 'Vezi eticheta „corectă” pentru conținut web, fără a o modifica.',
      hint: 'Doar dacă httpd este instalat; altfel sari peste.',
      commands: "ls -dZ /var/www /var/www/html\nsudo touch /var/www/html/test.html\nls -Z /var/www/html/test.html\nmatchpathcon /var/www/html/test.html\nsudo rm /var/www/html/test.html",
      explain: [
        ['ls -dZ /var/www/html', 'tipul directorului web: httpd_sys_content_t.'],
        ['touch …/test.html; ls -Z', 'fișierul nou moștenește tipul directorului.'],
        ['matchpathcon', 'confirmă că acesta este tipul implicit.'],
      ],
      output: { label: 'illustrative', code: 'system_u:object_r:httpd_sys_content_t:s0 /var/www/html\nunconfined_u:object_r:httpd_sys_content_t:s0 /var/www/html/test.html\n/var/www/html/test.html\tsystem_u:object_r:httpd_sys_content_t:s0', explain: 'Un fișier creat în directorul web are tipul web, deci httpd îl poate citi. Un fișier MUTAT acolo din home ar avea user_home_t.' },
    },
    {
      title: 'Curățare',
      purpose: 'Lași sistemul curat.',
      hint: 'Verifică calea înainte de rm -r.',
      commands: "cd ~\nrm -r ~/ctx-lab\nsudo rm -r /srv/web\nls -d ~/ctx-lab /srv/web 2>&1",
      explain: [
        ['rm -r', 'șterge directoarele de test.'],
        ['ls -d … 2>&1', '„No such file or directory” confirmă ștergerea.'],
      ],
    },
  ],
  verification: [
    { cmd: 'ls -lZ /srv/web', expected: 'cp.txt cu tip var_t, mv.txt cu user_home_t (înainte de curățare)' },
    { cmd: 'matchpathcon -V /srv/web/mv.txt', expected: 'raportează diferența (has context … should be …)' },
    { cmd: 'ls -d ~/ctx-lab /srv/web', expected: 'No such file or directory (după curățare)' },
  ],
  persistence: [
    'Etichetele sunt atribute extinse stocate în sistemul de fișiere; persistă la reboot, dar un mv greșit nu se repară singur: este nevoie de restorecon (L10.5).',
  ],
  mistakes: [
    'Presupunerea că mv schimbă eticheta după destinație.',
    'Folosirea lui cp -a când vrei eticheta destinației.',
    'Verificarea doar a drepturilor, nu și a contextului.',
  ],
  troubleshooting: [
    { symptom: 'cp.txt și mv.txt au aceeași etichetă', cause: 'directorul destinație are același tip ca home (rar) sau SELinux e disabled', fix: 'getenforce; ls -dZ /srv/web.' },
    { symptom: 'mv între sisteme de fișiere diferite', cause: 'mv între două sisteme de fișiere face copiere + ștergere, deci poate primi eticheta destinației', fix: 'verifică cu df și ls -Z; compară cu un mv în același sistem.' },
    { symptom: 'ls -Z arată ?', cause: 'sistem de fișiere fără xattr SELinux', fix: 'df -T; montare cu context=.' },
  ],
  alternatives: [
    'stat -c %C în loc de ls -Z.',
    'cp -Z pentru a forța contextul implicit la copiere.',
  ],
};
