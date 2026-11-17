import type { Lab } from '../../lab/types';

export const LAB_M0_5A: Lab = {
  id: 'lab-m0-5a-un-serviciu-de-la-capat-la-capat',
  lessonId: 'M0.5',
  title: 'Urmărește un serviciu prin toate straturile: proces, unit, pachet, fișiere, jurnal',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 1,
  estimatedMinutes: 40,
  scenario: [
    'Colegul tău spune „sshd (sau chronyd) pare ciudat”. Înainte de orice modificare vrei să descrii serviciul complet, doar prin comenzi de citire: ce proces este, cine îl pornește, din ce pachet vine, ce fișiere de configurare citește, ce utilizator îl rulează, ce port ascultă și ce scrie în jurnal.',
    'Sarcină: alege serviciul `sshd` (sau `chronyd`/`NetworkManager`, dacă sshd nu este instalat) și completează o „fișă de serviciu” cu: starea (active/enabled), PID principal și părinte, utilizator, pachet, unit-ul și locul lui, fișierele de configurare, portul de ascultare și ultimele 5 mesaje din jurnal.',
    'Toate comenzile doar citesc. Unele pot cere `sudo` pentru informații complete; nu modifica nimic.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) cu systemd. Ești utilizator obișnuit; ai `sudo` doar dacă sistemul tău de test îl permite.',
    'Serviciul ales este instalat și pornit (în caz contrar alege altul din `systemctl list-units --type=service --state=running`).',
  ],
  finalState: [
    'Ai o fișă completă a serviciului, cu fiecare câmp susținut de comanda care l-a produs.',
  ],
  criteria: [
    { id: 'ac1', text: 'Poți spune dacă serviciul este `active` și `enabled` și de ce sunt două lucruri diferite.', manualCheck: 'systemctl is-active sshd; systemctl is-enabled sshd' },
    { id: 'ac2', text: 'Ai identificat PID-ul principal, părintele lui și utilizatorul care rulează procesul.', manualCheck: 'systemctl show -p MainPID sshd; ps -o pid,ppid,user,comm -p $(systemctl show -p MainPID --value sshd)' },
    { id: 'ac3', text: 'Ai aflat pachetul care a livrat programul și fișierul unit.', manualCheck: 'rpm -qf /usr/sbin/sshd; rpm -qf /usr/lib/systemd/system/sshd.service' },
    { id: 'ac4', text: 'Ai identificat fișierele de configurare ale pachetului.', manualCheck: 'rpm -qc openssh-server' },
    { id: 'ac5', text: 'Ai aflat portul pe care ascultă serviciul și ultimele 5 mesaje din jurnal.', manualCheck: 'ss -tlnp | grep sshd; journalctl -u sshd -n 5 --no-pager' },
  ],
  steps: [
    {
      title: 'Starea serviciului: active vs enabled',
      purpose: 'Distingi „rulează acum” de „pornește la boot”.',
      hint: 'Sunt două răspunsuri independente; un serviciu poate fi active și disabled.',
      commands: 'systemctl status sshd --no-pager\nsystemctl is-active sshd\nsystemctl is-enabled sshd',
      explain: [
        ['systemctl status sshd --no-pager', 'rezumat: Loaded (unde este unit-ul, enabled/disabled), Active, Main PID, ultimele linii de jurnal. --no-pager evită pager-ul interactiv.'],
        ['is-active', 'un singur cuvânt: active, inactive, failed… și cod de ieșire 0 doar dacă este activ.'],
        ['is-enabled', 'enabled, disabled, static, masked…; spune dacă pornește la boot.'],
      ],
      output: {
        label: 'illustrative',
        code: '● sshd.service - OpenSSH server daemon\n     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled; preset: enabled)\n     Active: active (running) since Tue 2026-11-17 08:01:22 EET; 1h 12min ago\n   Main PID: 812 (sshd)\nactive\nenabled',
        explain: 'Valorile exacte (data, PID-ul) diferă. „enabled” se referă la pornirea la boot; „active (running)” la starea de acum.',
      },
      reflect: 'Ce combinații active/enabled sunt posibile? Dă un exemplu real pentru fiecare.',
    },
    {
      title: 'Procesul: PID, părinte, utilizator',
      purpose: 'Legi serviciul de procesul lui și de arborele de procese.',
      hint: '`systemctl show -p MainPID --value` dă PID-ul curat, util în alte comenzi.',
      commands: 'systemctl show -p MainPID --value sshd\nps -o pid,ppid,user,stat,etime,cmd -p $(systemctl show -p MainPID --value sshd)\nps -ef | grep [s]shd\nls -l /proc/$(systemctl show -p MainPID --value sshd)/exe',
      explain: [
        ['systemctl show -p MainPID --value sshd', 'show afișează proprietăți ale unit-ului; -p alege proprietatea; --value tipărește doar valoarea.'],
        ['$( … )', 'substituție de comandă: ieșirea comenzii devine argument.'],
        ['ps -o …', 'alege coloanele: PID, PPID, utilizator, stare, timp scurs (etime), comandă.'],
        ['grep [s]shd', 'tiparul [s]shd potrivește „sshd”, dar nu linia lui grep (care conține „[s]shd”).'],
        ['/proc/PID/exe', 'legătură simbolică spre programul executat de proces (necesită drept; dacă dă Permission denied, rulează cu sudo).'],
      ],
      output: {
        label: 'illustrative',
        code: '812\n    PID    PPID USER     STAT     ELAPSED CMD\n    812       1 root     Ss       01:12:35 sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups\nroot   812     1  0 08:01 ?   00:00:00 sshd: /usr/sbin/sshd -D [listener] ...\nlrwxrwxrwx. 1 root root 0 Nov 17 09:14 /proc/812/exe -> /usr/sbin/sshd',
        explain: 'PPID = 1: părintele este systemd. STAT „Ss”: S = doarme (așteaptă conexiuni), s = lider de sesiune. Utilizatorul root este normal pentru sshd, care coboară privilegiile pentru sesiunile utilizatorilor.',
      },
    },
    {
      title: 'Pachetul și fișierele lui',
      purpose: 'Identifici pachetul RPM și locurile în care își pune fișierele.',
      hint: '`rpm -qc` listează doar fișierele de configurare ale pachetului.',
      commands: 'rpm -qf /usr/sbin/sshd\nrpm -qi openssh-server | head -8\nrpm -qc openssh-server\nrpm -ql openssh-server | grep -E "service|man"',
      explain: [
        ['rpm -qf', 'ce pachet deține fișierul.'],
        ['rpm -qi', 'informații despre pachet; head -8 păstrează primele 8 linii.'],
        ['rpm -qc', 'configuration files: fișierele marcate ca configurare în pachet.'],
        ['grep -E "service|man"', '-E = expresii regulate extinse; | înseamnă „sau”: afișează liniile care conțin service sau man.'],
      ],
      output: {
        label: 'illustrative',
        code: 'openssh-server-9.9p1-1.el10.x86_64\nName        : openssh-server\nVersion     : 9.9p1\nRelease     : 1.el10\nArchitecture: x86_64\n/etc/pam.d/sshd\n/etc/ssh/sshd_config\n/etc/sysconfig/sshd\n/usr/lib/systemd/system/sshd.service\n/usr/share/man/man8/sshd.8.gz',
        explain: 'Numele, versiunea și lista exactă depind de sistemul tău. Observă cum același pachet pune fișiere în /usr (program, unit, manuale) și în /etc (configurare).',
      },
      reflect: 'De ce ar fi o greșeală să editezi direct /usr/lib/systemd/system/sshd.service?',
    },
    {
      title: 'Rețeaua și jurnalul',
      purpose: 'Vezi ce port ascultă serviciul și ce spune jurnalul despre el.',
      hint: 'Pentru numele procesului în `ss -p` ai nevoie de sudo; fără sudo vezi portul, dar nu și procesul.',
      commands: 'ss -tln | grep :22\nsudo ss -tlnp | grep sshd\njournalctl -u sshd -n 5 --no-pager',
      explain: [
        ['ss -tln', 't = TCP, l = ascultare, n = numeric.'],
        ['grep :22', 'filtrează portul 22 (portul implicit SSH).'],
        ['ss -p', 'afișează procesul care ține socketul (cere root pentru procesele altora).'],
        ['journalctl -u sshd -n 5', 'ultimele 5 intrări ale unit-ului sshd.'],
      ],
      output: {
        label: 'illustrative',
        code: 'LISTEN 0 128 0.0.0.0:22 0.0.0.0:*\nLISTEN 0 128    [::]:22    [::]:*\nLISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=812,fd=7))\nNov 17 08:01:22 server1 sshd[812]: Server listening on 0.0.0.0 port 22.\nNov 17 08:01:22 server1 sshd[812]: Server listening on :: port 22.',
        explain: '0.0.0.0:22 = toate adresele IPv4; [::]:22 = toate adresele IPv6. Mesajele din jurnal confirmă pornirea. Numerele din coloanele Recv-Q/Send-Q și PID-ul diferă.',
      },
    },
    {
      title: 'Fișa de serviciu',
      purpose: 'Formulezi, cu cuvintele tale, drumul serviciului prin straturi.',
      hint: 'Completează pe hârtie sau într-un fișier al tău: un rând pentru fiecare întrebare.',
      commands: 'cat > ~/fisa-serviciu.txt <<EOF\nServiciu: sshd\nActive/enabled: ...\nPID / PPID / utilizator: ...\nPachet: ...\nUnit: ...\nConfigurare: ...\nPort: ...\nUltimele mesaje: ...\nEOF\ncat ~/fisa-serviciu.txt',
      explain: [
        ['cat > FIȘIER <<EOF', 'here-document (L1.5): textul de până la linia EOF devine intrarea lui cat, iar > îl scrie în fișier.'],
        ['cat FIȘIER', 'afișezi fișierul ca să verifici.'],
      ],
      output: {
        label: 'illustrative',
        code: 'Serviciu: sshd\nActive/enabled: ...\nPID / PPID / utilizator: ...\nPachet: ...\nUnit: ...\nConfigurare: ...\nPort: ...\nUltimele mesaje: ...',
        explain: 'Înlocuiește punctele cu valorile găsite; fișa nu trebuie păstrată după laborator (poți șterge cu rm ~/fisa-serviciu.txt).',
      },
      reflect: 'Dacă acest serviciu ar cădea, în ce ordine ai verifica straturile?',
    },
  ],
  verification: [
    { cmd: 'systemctl is-active sshd; systemctl is-enabled sshd', expected: 'două cuvinte, de exemplu `active` și `enabled`.' },
    { cmd: 'rpm -qf /usr/sbin/sshd', expected: 'numele pachetului (de regulă `openssh-server-…`).' },
    { cmd: 'ss -tln | grep :22', expected: 'cel puțin o linie `LISTEN` pentru portul 22, dacă sshd ascultă.' },
  ],
  persistence: [
    'Singurul fișier creat este `~/fisa-serviciu.txt` (opțional), pe disc, care persistă după reboot până îl ștergi.',
    'Nu s-a modificat nicio configurare de serviciu: nu există nimic de verificat după reboot.',
  ],
  mistakes: [
    'Confuzia între `active` și `enabled`.',
    'Folosirea `kill` pe procesul serviciului în loc de `systemctl stop`.',
    'Editarea fișierului unit din /usr/lib/systemd/system (se suprascrie la actualizare); suprascrierile se fac în /etc/systemd/system (L4.9).',
    'Concluzia „nu ascultă” din `ss` fără sudo, când procesul aparține altui utilizator.',
  ],
  troubleshooting: [
    { symptom: '`Unit sshd.service could not be found`', cause: 'pachetul openssh-server nu este instalat', fix: 'alege alt serviciu (`systemctl list-units --type=service --state=running`)' },
    { symptom: '`journalctl` spune că nu are acces la jurnal', cause: 'ca utilizator obișnuit nu ai drept pe tot jurnalul', fix: 'folosește `sudo journalctl …` (dacă ai sudo)' },
    { symptom: '`/proc/PID/exe`: Permission denied', cause: 'procesul aparține lui root', fix: 'rulează cu sudo sau sari peste pas' },
    { symptom: '`rpm -qf`: not owned by any package', cause: 'ai dat calea unei legături sau a unui fișier creat manual', fix: 'repetă cu `readlink -f`' },
  ],
  alternatives: [
    '`systemctl cat sshd` afișează conținutul unit-ului, inclusiv suprascrierile.',
    '`pgrep -a sshd` este o variantă mai scurtă pentru PID-uri și comenzi.',
    '`systemctl status` poate fi înlocuit pentru scripturi de `systemctl is-active`/`is-enabled`, mai ușor de procesat.',
  ],
};

export const LAB_M0_5B: Lab = {
  id: 'lab-m0-5b-control-medical-si-diagnostic-pe-straturi',
  lessonId: 'M0.5',
  title: 'Controlul medical al sistemului și diagnostic pe straturi',
  modes: ['guided', 'independent'],
  objectives: [],
  difficulty: 2,
  estimatedMinutes: 40,
  scenario: [
    'Ai intrat pe un server pe care nu l-ai mai văzut. Ai 5 minute să faci o evaluare: cât timp rulează, cât are de memorie, discul, ce servicii sunt căzute, ce ascultă pe rețea, dacă SELinux este activ și ce erori recente există. Apoi primești cinci simptome și trebuie să le asociezi cu stratul și cu comenzile potrivite.',
    'Sarcină: (1) rulează cele opt comenzi ale „controlului medical” și rezumă în câte o propoziție ce ai aflat; (2) pentru fiecare dintre simptomele de mai jos scrie stratul probabil și prima comandă pe care o rulezi: (a) „Permission denied” la citirea unui fișier cu permisiuni corecte, (b) un serviciu `failed`, (c) „No space left on device”, (d) „command not found” pentru o comandă instalată, (e) serverul nu răspunde la ping/SSH după ce a pornit.',
    'Comenzile doar citesc. Nu modifica nimic.',
  ],
  initialConditions: [
    'Sistem RHEL 10 sau compatibil, utilizator obișnuit, `sudo` dacă este permis în mediul tău de test.',
  ],
  finalState: [
    'Ai un rezumat de opt rânduri (unul per verificare) și un tabel de cinci rânduri simptom → strat → comandă.',
  ],
  criteria: [
    { id: 'bc1', text: 'Ai rulat cele opt verificări și poți spune uptime-ul, memoria disponibilă, sistemul de fișiere cel mai ocupat, numărul de unit-uri `failed`, porturile care ascultă, modul SELinux și cea mai recentă eroare din jurnal.', manualCheck: 'uptime; free -h; df -h; systemctl --failed; ss -tln; getenforce; journalctl -p err -b -n 20 --no-pager' },
    { id: 'bc2', text: 'Pentru „Permission denied” cu permisiuni corecte ai ales SELinux (sau firewall, dacă este vorba de rețea) și ai comenzile de verificare.', manualCheck: 'ls -lZ FIȘIER; getenforce; sudo ausearch -m avc -ts recent' },
    { id: 'bc3', text: 'Pentru serviciu `failed` ai ales `systemctl status` și `journalctl -u`.', manualCheck: 'systemctl status SERVICIU; journalctl -u SERVICIU -n 20 --no-pager' },
    { id: 'bc4', text: 'Pentru „No space left on device” ai ales `df -h` și `df -i`.', manualCheck: 'df -h; df -i' },
    { id: 'bc5', text: 'Pentru „command not found” ai ales `type`, `echo $PATH`, `rpm -q`/`dnf provides`.', manualCheck: 'type NUME; echo $PATH; dnf provides "*/NUME"' },
    { id: 'bc6', text: 'Pentru serverul care nu răspunde ai ales verificarea pe straturi: interfață/adresă, gateway, serviciu care ascultă, firewall, SELinux.', manualCheck: 'ip -br a; ip route; ss -tln; sudo firewall-cmd --list-all' },
  ],
  steps: [
    {
      title: 'Controlul medical în opt comenzi',
      purpose: 'Obții în câteva minute o imagine de ansamblu a unui server necunoscut.',
      hint: 'Rulează-le pe rând și notează câte o propoziție pentru fiecare.',
      commands: 'uptime\nfree -h\ndf -h\nsystemctl --failed --no-pager\nss -tln\nip -br a\ngetenforce\njournalctl -p err -b -n 20 --no-pager',
      explain: [
        ['uptime', 'timpul de funcționare și load average pe 1/5/15 minute.'],
        ['free -h', 'memorie și swap; coloana „available” este cea relevantă.'],
        ['df -h', 'spațiul pe fiecare sistem de fișiere; urmărește Use% mare.'],
        ['systemctl --failed', 'unit-urile în stare failed; „0 loaded units listed” = niciuna.'],
        ['ss -tln', 'porturile TCP în ascultare.'],
        ['ip -br a', 'interfețe, stare și adrese.'],
        ['getenforce', 'Enforcing / Permissive / Disabled.'],
        ['journalctl -p err -b -n 20', 'ultimele 20 de erori de la ultimul boot.'],
      ],
      output: {
        label: 'illustrative',
        code: ' 09:14:07 up  1:13,  2 users,  load average: 0.08, 0.04, 0.01\n               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       612Mi       2.6Gi       9.0Mi       820Mi       3.2Gi\n0 loaded units listed.\nLISTEN 0 128 0.0.0.0:22 0.0.0.0:*\nlo   UNKNOWN 127.0.0.1/8 ::1/128\nens3 UP      192.0.2.10/24 2001:db8::10/64\nEnforcing',
        explain: 'Pentru brevitate nu sunt afișate toate liniile (df, jurnal). Valorile, interfețele și adresele (din intervale de documentație 192.0.2.0/24 și 2001:db8::/32) sunt exemplificative.',
      },
      reflect: 'Care dintre cele opt verificări ar fi prima pe care o faci dacă un utilizator se plânge că „totul e lent”? De ce?',
    },
    {
      title: 'Simptom → strat → prima comandă',
      purpose: 'Exersezi raționamentul pe straturi, fără să ghicești.',
      hint: 'Pentru fiecare simptom răspunde la: care strat? ce comandă de citire? ce m-ar face să schimb ipoteza?',
      commands: '# (a) Permission denied, dar rwx este corect\nls -l FIȘIER; ls -lZ FIȘIER; getenforce\n# (b) serviciu failed\nsystemctl status SERVICIU; journalctl -u SERVICIU -n 20 --no-pager\n# (c) No space left on device\ndf -h; df -i\n# (d) command not found\ntype NUME; echo $PATH; rpm -q PACHET\n# (e) serverul nu răspunde în rețea\nip -br a; ip route; ss -tln; sudo firewall-cmd --list-all',
      explain: [
        ['(a)', 'după permisiunile clasice urmează SELinux (contextul fișierului, -Z) și, pentru acces de rețea, firewall-ul.'],
        ['(b)', 'systemctl status dă starea și ultimele mesaje; journalctl -u dă istoricul serviciului.'],
        ['(c)', 'df -h = spațiu; df -i = inode-uri: un sistem de fișiere poate fi „plin” din ambele motive.'],
        ['(d)', 'type spune cum interpretează bash numele; echo $PATH arată unde se caută; rpm -q verifică dacă pachetul este instalat.'],
        ['(e)', 'de jos în sus: interfață și adresă → rută/gateway → serviciul ascultă? → firewall → SELinux (port label).'],
      ],
      output: {
        label: 'illustrative',
        code: 'strat probabil:\n(a) securitate (SELinux)\n(b) serviciu/configurare\n(c) stocare (spațiu sau inode-uri)\n(d) shell/PATH sau software (pachet)\n(e) rețea/firewall/serviciu',
        explain: 'Ordinea verificărilor contează mai mult decât comenzile individuale: fiecare pas elimină o categorie de cauze.',
      },
      reflect: 'Pentru simptomul (a): cum ai arăta că SELinux este cauza, fără să-l dezactivezi?',
    },
  ],
  verification: [
    { cmd: 'systemctl --failed --no-pager', expected: 'fie „0 loaded units listed”, fie lista unit-urilor căzute, pe care le poți numi.' },
    { cmd: 'getenforce', expected: 'unul dintre `Enforcing`, `Permissive`, `Disabled`.' },
    { cmd: 'df -h', expected: 'o listă; poți numi sistemul de fișiere cu cel mai mare Use%.' },
  ],
  persistence: [
    'Laboratorul nu modifică nimic; nu există stare de păstrat după reboot.',
    'Rezumatul tău scris (pe hârtie sau într-un fișier) este singurul produs.',
  ],
  mistakes: [
    'Dezactivarea SELinux ca „soluție” la un Permission denied, în loc să diagnostichezi contextul.',
    'Concluzia că discul este plin doar din `df -h`, fără să verifici `df -i`.',
    'Interpretarea load average fără să știi câte CPU-uri are sistemul (`nproc`).',
    'Citirea jurnalului fără filtrare pe unit sau prioritate: prea mult zgomot.',
  ],
  troubleshooting: [
    { symptom: '`journalctl -p err -b` nu afișează nimic', cause: 'nu există erori recente sau nu ai acces la jurnal', fix: 'încearcă `sudo journalctl …`; coboară pragul (`-p warning`)' },
    { symptom: '`getenforce: command not found`', cause: 'pachetele SELinux (libselinux-utils) nu sunt instalate', fix: 'citește `/etc/selinux/config` și `cat /sys/fs/selinux/enforce`; instalarea este tema C2' },
    { symptom: '`sudo firewall-cmd`: command not found', cause: 'firewalld nu este instalat', fix: 'aceasta este informație în sine: notează „fără firewalld” în rezumat' },
  ],
  alternatives: [
    '`vmstat 1 5` și `iostat` (dacă sysstat este instalat) arată, în timp, CPU, memorie și disc.',
    '`top` interactiv (q pentru ieșire) arată încărcarea și procesele cele mai active.',
    'Un script (C3) poate rula cele opt verificări și salva un raport; la examen se face adesea manual.',
  ],
};
