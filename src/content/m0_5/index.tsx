import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_M0_5A, LAB_M0_5B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un sistem RHEL pare un morman de comenzi, dar are doar câteva <b>componente</b> care se leagă între ele: <b>nucleul</b> (kernel) gestionează hardware-ul; <b>procesele</b> sunt programe în execuție; <b>serviciile</b> (<G id="daemon">daemoni</G> controlați de <G id="systemd">systemd</G>, <G id="init-pid1">PID 1</G>) sunt procese care rulează permanent; <b>pachetele</b> (<G id="rpm">RPM</G>, gestionate cu <G id="dnf">DNF</G>) aduc programele pe disc; <b>utilizatorii și grupurile</b> decid cine are voie ce; <b>fișierele</b> (M0.4) leagă totul; iar <b>jurnalul</b> și <b>SELinux</b> notează și limitează ce se întâmplă.
          </p>
          <p>
            Această lecție este o <b>hartă</b>: pentru fiecare componentă înveți ce este, ce comenzi de citire o arată, unde se potrivește în cursul tău și ce simptom îți spune că problema este acolo. Nu configurezi nimic; construiești modelul mental care îți spune <i>unde să te uiți</i> când ceva nu merge. Material de suport (neoficial); fiecare componentă este un capitol oficial mai târziu.
          </p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un începător învață comenzi izolate: <code>ls</code>, <code>systemctl</code>, <code>useradd</code>. Un administrator gândește altfel: „am o problemă; în ce <i>strat</i> a apărut?”. O hartă a stratelor transformă o listă de 62 de obiective într-un sistem cu logică. Dacă știi că un serviciu este un <i>proces</i> pornit de <i>systemd</i> dintr-un <i>program</i> instalat de un <i>pachet</i>, rulând sub un <i>utilizator</i>, citind <i>fișiere</i> cu anumite <i>permisiuni</i> și un <i>context SELinux</i>, atunci „serviciul nu pornește” are o listă scurtă de suspecți.
          </p>
          <Analogy>un oraș. Nucleul este primăria cu serviciile de utilități: apă, curent, trafic, reguli. Procesele sunt oamenii care lucrează. Serviciile sunt magazinele deschise non-stop. Pachetele sunt aprovizionarea (cutii de la furnizori, cu bon și listă de conținut). Utilizatorii sunt locuitorii cu cărți de identitate; permisiunile sunt cheile; SELinux este paznicul care verifică nu doar cheia, ci și dacă ai voie să intri în camera aceea. Jurnalul este registrul de evenimente.</Analogy>

          <h4>Cele șase straturi, de jos în sus</h4>
          <Table head={['Strat', 'Ce este', 'Ce îl arată', 'Unde îl înveți']} rows={[
            [<b>1. Hardware și boot</b>, 'CPU, RAM, discuri; firmware (BIOS/UEFI) → bootloader (GRUB) → nucleu → systemd', <><code>lscpu</code>, <code>free -h</code>, <code>lsblk</code></>, 'C4 (boot), C7 (GRUB)'],
            [<b>2. Nucleul</b>, 'planificare, memorie, drivere, rețea, sisteme de fișiere, securitate', <><code>uname -r</code>, <code>/proc</code>, <code>dmesg</code></>, 'M0.1, C4'],
            [<b>3. Fișiere și stocare</b>, 'arborele unic, partiții, LVM, sisteme de fișiere, montări', <><code>df</code>, <code>findmnt</code>, <code>lsblk</code></>, 'M0.4, C5, C6'],
            [<b>4. Procese și servicii</b>, 'programe în execuție; systemd pornește și supraveghează serviciile', <><code>ps</code>, <code>top</code>, <code>systemctl</code></>, 'C4, C7'],
            [<b>5. Software</b>, 'pachete RPM, repository-uri, DNF, Flatpak', <><code>rpm -qa</code>, <code>dnf repolist</code></>, 'C2'],
            [<b>6. Identitate și securitate</b>, 'utilizatori, grupuri, permisiuni, sudo, SELinux, firewall, SSH', <><code>id</code>, <code>getenforce</code>, <code>firewall-cmd</code></>, 'C9, C10, C8'],
          ]} />
          <p>Peste toate stă <b>shell-ul</b> (M0.3), prin care vorbești cu fiecare strat, și <b>rețeaua</b> (C8), prin care sistemul vorbește cu altele.</p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Nucleul și user space</h4>
          <p>
            Nucleul rulează în modul privilegiat al procesorului; programele obișnuite rulează în <G id="user-space">user space</G>, cu drepturi limitate. Când un program vrea să citească un fișier, să deschidă o conexiune sau să pornească alt program, face un <G id="system-call">apel de sistem</G>; nucleul verifică permisiunile (și politica SELinux) și execută cererea. Un program defect nu poate corupe memoria altuia sau accesa direct discul: nucleul îl oprește. De aceea un program care „crapă” nu doboară sistemul.
          </p>

          <h4>Procesul: ce este, de unde vine</h4>
          <p>
            Un <G id="process">proces</G> este un program aflat în execuție: cod încărcat în memorie, un identificator numeric (<G id="pid">PID</G>), un proprietar (utilizatorul sub care rulează), un director curent, fișiere deschise, variabile de mediu. Orice proces (mai puțin primul) are un <b>părinte</b>: este creat prin <code>fork()</code> (o copie) și apoi <code>execve()</code> înlocuiește conținutul copiei cu programul dorit. Când tastezi <code>ls</code>, bash face fork, copilul face exec pe <code>/usr/bin/ls</code>, bash așteaptă (M0.3).
          </p>
          <CodeBlock title="arbore de procese (simplificat, ilustrativ)" kind="session" label="illustrative" code={`systemd (PID 1)\n├── sshd (daemon; ascultă pe portul 22)\n│    └── sshd (sesiunea ta)\n│         └── bash (shell-ul tău)\n│              └── ps (comanda rulată acum)\n├── chronyd (sincronizare ceas)\n├── NetworkManager (rețea)\n├── firewalld (firewall)\n└── crond (programare sarcini)`} />
          <p>
            Fiecare proces are o <b>stare</b>: <code>R</code> rulează, <code>S</code> doarme (așteaptă ceva), <code>D</code> așteaptă I/O neîntreruptibil, <code>T</code> oprit, <code>Z</code> „zombie” (terminat, dar părintele nu a citit încă codul de ieșire). Informațiile sunt în <code>/proc/&lt;PID&gt;/</code> (M0.4). Semnalele (<code>SIGTERM</code>, <code>SIGKILL</code>, <code>SIGINT</code>) sunt mesajele prin care îi spui unui proces să se oprească; detalii în L4.4.
          </p>

          <h4>Serviciile și systemd</h4>
          <p>
            După ce nucleul pornește, primul proces din user space este <b>systemd</b> (<G id="init-pid1">PID 1</G>). El citește <i>unit-uri</i> (fișiere <code>.service</code>, <code>.timer</code>, <code>.target</code>, <code>.mount</code>…) și pornește în ordinea dependențelor tot ce trebuie. Un <b>serviciu</b> este un <G id="daemon">daemon</G> (proces de fundal, fără terminal) descris de un fișier <code>.service</code>: ce program rulează, sub ce utilizator, când pornește, ce face dacă cade. Starea unui serviciu are două dimensiuni independente: <i>activ acum?</i> (<code>active/inactive/failed</code>) și <i>pornește la boot?</i> (<code>enabled/disabled</code>) (L4.9). Un <b>target</b> este un grup de unit-uri care definește o stare a sistemului (<code>multi-user.target</code> = mod text multi-utilizator; <code>graphical.target</code> = cu desktop; L4.2).
          </p>

          <h4>Pachetele și software-ul</h4>
          <p>
            Programele nu se instalează prin „copiere”. Un pachet <G id="rpm">RPM</G> conține fișierele, <i>metadate</i> (nume, versiune, licență, dependențe) și scripturi de instalare. <G id="dnf">DNF</G> citește <i>repository-uri</i> (liste de pachete aflate la distanță sau local; configurate în <code>/etc/yum.repos.d/</code>), rezolvă <G id="package-dependency">dependențele</G> și cere instalarea. Ce s-a instalat se scrie în <G id="rpm-database">baza de date RPM</G> (<code>/var/lib/rpm</code>). Din această bază afli ce pachet a pus un fișier (<code>rpm -qf</code>), ce fișiere are un pachet (<code>rpm -ql</code>) și dacă ele au fost modificate (<code>rpm -V</code>). Pe RHEL, repository-urile Red Hat cer un sistem <i>înregistrat</i> (M0.1).
          </p>

          <h4>Utilizatori, grupuri și permisiuni</h4>
          <p>
            Pentru nucleu, un utilizator este un număr, <G id="uid">UID</G>; numele din <G id="etc-passwd">/etc/passwd</G> este o etichetă pentru oameni. UID 0 = root, fără restricții; UID-urile mici sunt conturi de sistem (pentru servicii), cele mari conturi de oameni. Fiecare fișier și proces are un proprietar (UID) și un grup (GID). La fiecare acces, nucleul compară identitatea procesului cu permisiunile fișierului (rwx pentru proprietar, grup, ceilalți; L1.8). <code>sudo</code> permite unui utilizator autorizat să ruleze o comandă ca root (L9.4). Peste permisiunile clasice, <G id="selinux">SELinux</G> adaugă o politică obligatorie bazată pe <i>contexte</i>: un proces <code>httpd</code> are voie să citească fișiere cu context <code>httpd_sys_content_t</code>, chiar dacă permisiunile rwx i-ar permite mai mult (C10).
          </p>

          <h4>Logare și diagnostic</h4>
          <p>
            Serviciile scriu mesaje; <b>systemd-journald</b> le adună în <i>jurnal</i> (<code>journalctl</code>), iar pe unele sisteme și în fișiere text din <code>/var/log</code> prin rsyslog (L4.7). Nucleul își ține propriul buffer de mesaje (<code>dmesg</code>). Regula de diagnostic este aceeași aproape mereu: <b>mesajul de eroare exact</b> și <b>ora lui</b> arată stratul vinovat.
          </p>

          <h4>Un exemplu complet: ce se întâmplă când tastezi <code>cat /etc/shadow</code> ca utilizator obișnuit</h4>
          <ol>
            <li>bash (proces, PID X, proprietar <code>student</code>) citește linia și o împarte în cuvinte; <code>cat</code> nu este alias, builtin sau funcție.</li>
            <li>Caută <code>cat</code> în PATH: <code>/usr/bin/cat</code>, un fișier din pachetul <code>coreutils</code> (RPM).</li>
            <li>bash face fork: apare un proces copil (PID Y, același proprietar), care face exec pe <code>cat</code>.</li>
            <li><code>cat</code> cere nucleului, printr-un apel de sistem, să deschidă <code>/etc/shadow</code>. Nucleul rezolvă calea prin arbore (M0.4).</li>
            <li>Nucleul verifică permisiunile: fișierul aparține lui <code>root</code> și are modul <code>---------</code> (fără drepturi); procesul este <code>student</code> → refuz. (SELinux ar fi verificat și el, dar permisiunea clasică refuză deja.)</li>
            <li><code>cat</code> primește eroarea, scrie pe stderr „Permission denied” și iese cu cod 1. bash afișează promptul; <code>$?</code> este 1.</li>
          </ol>
          <p>Fiecare strat a contribuit: shell, PATH, pachet, proces, nucleu, arbore de fișiere, permisiuni. Aceasta este harta pe care o completezi în restul cursului.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <p>Această lecție este tocmai despre interacțiuni. Iată legăturile care conduc diagnosticul, ca perechi „când vezi X, ia în calcul Y”:</p>
          <Table head={['Dacă vezi…', 'Ia în calcul…', 'Verifică']} rows={[
            [<>serviciul <code>failed</code></>, 'configurare greșită (/etc), port ocupat, permisiuni sau SELinux, pachet lipsă', <><code>systemctl status</code>, <code>journalctl -u</code></>],
            [<><code>Permission denied</code></>, 'permisiuni clasice, apartenența la grup, SELinux, firewall (pentru rețea)', <><code>ls -l</code>, <code>id</code>, <code>ls -Z</code>, <code>ausearch</code></>],
            [<><code>command not found</code></>, 'pachet neinstalat, PATH, greșeală de scriere', <><code>type</code>, <code>dnf provides</code></>],
            [<><code>No space left on device</code></>, 'sistem de fișiere plin sau fără inode-uri; LVM', <><code>df -h</code>, <code>df -i</code></>],
            [<>serverul nu răspunde în rețea</>, 'IP/gateway, firewall, serviciu oprit, SELinux (port label)', <><code>ip -br a</code>, <code>ss -tln</code>, <code>firewall-cmd --list-all</code></>],
            [<>nu pornește la boot</>, 'fstab greșit, GRUB, initramfs, target implicit', <>consolă, <code>rd.break</code>, <code>journalctl -b</code></>],
            [<>comportament diferit după reboot</>, 'modificare nepersistentă (runtime vs permanent)', 'fișiere de configurare, enable, fstab'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li><b>La începutul oricărui incident</b>: scrii mental lista straturilor și le verifici de jos în sus (rețea? disc? serviciu? permisiuni? SELinux?). Metodă mai bună decât încercările la întâmplare.</li>
            <li><b>Când intri pe un server necunoscut</b>: în 2–3 minute obții o imagine de ansamblu: <code>uptime</code>, <code>free -h</code>, <code>df -h</code>, <code>ps</code>/<code>top</code>, <code>systemctl --failed</code>, <code>ip -br a</code>.</li>
            <li><b>Când citești un obiectiv de examen</b>: „configure a service to start at boot”, „add a user to a group”, „restore SELinux context” se leagă de strat și de comenzile lui.</li>
            <li><b>Când ordonezi sarcinile la examen</b>: sarcinile independente se pot face în orice ordine, dar rețeaua și stocarea sunt de obicei precondiții pentru servicii (nu poți monta un NFS fără rețea; un serviciu cu date pe volum nou cere volumul montat).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Doar comenzi de citire">
          Toate comenzile din această secțiune <b>doar citesc</b> starea sistemului (unele cer <code>sudo</code> pentru detalii complete). Platforma nu rulează nimic. Output-urile sunt etichetate <b>Ilustrativ</b>: pe sistemul tău vor diferi (nume, PID-uri, versiuni, valori).
        </Callout>

        <h4>6.1 Identitate, uptime, resurse</h4>
        <CodeBlock title="comenzi" code={`whoami\nid\nuptime\nfree -h\nlscpu | head -8\nuname -r\ncat /etc/os-release\nhostnamectl`} explain={[
          ['id', 'UID, GID și grupurile utilizatorului curent; id NUME pentru altul.'],
          ['uptime', 'cât timp rulează sistemul, câți utilizatori sunt conectați și load average (încărcarea medie pe 1, 5, 15 minute).'],
          ['free -h', 'memorie: total, folosită, liberă, „available” (ce se poate aloca fără swap) și swap; -h = unități citibile.'],
          ['lscpu | head -8', 'arhitectura, numărul de procesoare, modelul; head limitează ieșirea.'],
          ['cat /etc/os-release', 'identitatea distribuției (M0.1).'],
          ['hostnamectl', 'numele mașinii, sistemul de operare, nucleul, arhitectura și, adesea, tipul de virtualizare.'],
        ]} />

        <h4>6.2 Procese: ps, top, pstree</h4>
        <CodeBlock title="comenzi" code={`ps\nps -f\nps -ef | head -10\nps aux --sort=-%mem | head -5\nps -p 1 -o pid,ppid,user,comm\nps -o pid,ppid,stat,cmd -p $$\ntop -b -n 1 | head -15\npstree -p | head\necho $$`} explain={[
          ['ps', 'procesele din terminalul curent (de regulă bash și ps).'],
          ['ps -f', '-f (full): adaugă UID (utilizator), PPID, ora de start, comanda completă.'],
          ['ps -ef', '-e = toate procesele din sistem; -f = format full. head -10 păstrează primele 10 linii.'],
          ['ps aux', 'stil BSD (fără cratimă): a = procesele tuturor utilizatorilor, u = format orientat pe utilizator, x = și cele fără terminal. --sort=-%mem sortează descrescător după memorie.'],
          ['ps -p 1 -o pid,ppid,user,comm', '-p selectează un PID; -o alege coloanele. Pentru PID 1 vezi systemd și PPID 0.'],
          ['$$', 'PID-ul shell-ului curent; ps -o pid,ppid,stat,cmd -p $$ arată starea și părintele lui.'],
          ['top -b -n 1', 'top în mod batch (-b), o singură iterație (-n 1): afișează instantaneu, fără interfață interactivă; | head -15 păstrează începutul.'],
          ['pstree -p', 'arborele de procese cu PID-uri (-p). Necesită pachetul psmisc; dacă lipsește, ps -ef --forest dă un rezultat asemănător.'],
        ]} />

        <h4>6.3 Servicii: systemctl (doar citire)</h4>
        <CodeBlock title="comenzi" code={`systemctl status sshd\nsystemctl is-active sshd\nsystemctl is-enabled sshd\nsystemctl list-units --type=service --state=running\nsystemctl --failed\nsystemctl get-default\nsystemctl list-unit-files --type=service | head -10`} explain={[
          ['systemctl status sshd', 'starea serviciului: Loaded (fișierul unit, enabled/disabled), Active (running/dead/failed), Main PID, CGroup și ultimele linii din jurnal.'],
          ['is-active / is-enabled', 'răspund cu o singură valoare (active / enabled) și cu un cod de ieșire utilizabil în scripturi.'],
          ['list-units --type=service --state=running', 'serviciile care rulează acum.'],
          ['--failed', 'unit-urile în stare failed: prima verificare la un sistem „bolnav”.'],
          ['get-default', 'target-ul implicit (multi-user.target sau graphical.target).'],
          ['list-unit-files', 'fișierele unit instalate și starea lor de pornire la boot.'],
        ]} />
        <p>Pe un sistem fără OpenSSH server, <code>sshd</code> poate lipsi; înlocuiește cu alt serviciu din lista rulată (de exemplu <code>chronyd</code>, <code>NetworkManager</code>). Pornirea, oprirea și activarea serviciilor sunt în L4.9.</p>

        <h4>6.4 Pachete: rpm și dnf (doar interogări)</h4>
        <CodeBlock title="comenzi" code={`rpm -q bash\nrpm -qi bash\nrpm -ql coreutils | head\nrpm -qf /usr/bin/ls\nrpm -qa | wc -l\nrpm -qa --last | head -5\ndnf repolist\ndnf provides /usr/bin/ls\ndnf info bash`} explain={[
          ['rpm -q bash', 'query: este instalat pachetul și ce versiune.'],
          ['rpm -qi bash', 'info: nume, versiune, release, dată de build, licență, rezumat și descriere.'],
          ['rpm -ql coreutils', 'list: fișierele pachetului.'],
          ['rpm -qf /usr/bin/ls', 'file: ce pachet deține fișierul.'],
          ['rpm -qa | wc -l', 'all: toate pachetele instalate; wc -l le numără.'],
          ['rpm -qa --last', 'ordonate după data instalării, cele mai recente primele.'],
          ['dnf repolist', 'repository-urile active (pe RHEL: necesită sistem înregistrat, sau repository-uri locale configurate; L2.1).'],
          ['dnf provides FIȘIER', 'ce pachet din repository ar oferi fișierul (necesită repository-uri accesibile).'],
          ['dnf info bash', 'detalii despre pachet, din repository.'],
        ]} />

        <h4>6.5 Utilizatori, grupuri, sesiuni</h4>
        <CodeBlock title="comenzi" code={`id\nid root\ngetent passwd root\ngetent group wheel\ngroups\nwho\nw\nlast -n 5\nsudo -l`} explain={[
          ['getent passwd root', 'afișează înregistrarea utilizatorului din sursele configurate (fișier local, LDAP etc.); câmpuri: nume:x:UID:GID:comentariu:home:shell.'],
          ['getent group wheel', 'grupul wheel și membrii lui (cei care, în mod uzual pe RHEL, pot folosi sudo).'],
          ['groups', 'grupurile utilizatorului curent.'],
          ['who / w', 'cine este conectat; w adaugă și ce rulează fiecare și load average.'],
          ['last -n 5', 'ultimele 5 autentificări, din fișierul /var/log/wtmp.'],
          ['sudo -l', 'listează ce ai voie să rulezi cu sudo (cere parola ta; dacă nu ai drept, afișează un mesaj).'],
        ]} />

        <h4>6.6 Disc și rețea, doar privire de ansamblu</h4>
        <CodeBlock title="comenzi" code={`df -hT\nlsblk\nip -br address\nip route\nss -tln\ngetenforce\nsudo firewall-cmd --state`} explain={[
          ['ip -br address', 'ip = suita de rețea modernă; address arată adresele; -br (--brief) o linie per interfață: nume, stare, adrese (L8.2).'],
          ['ip route', 'tabela de rutare: în special „default via” = gateway-ul implicit.'],
          ['ss -tln', 'socket statistics: -t TCP, -l doar sockets în ascultare (listening), -n valori numerice (fără rezolvare de nume). Arată ce porturi ascultă serviciile.'],
          ['getenforce', 'modul SELinux: Enforcing, Permissive sau Disabled (L10.3).'],
          ['sudo firewall-cmd --state', 'răspunde „running” dacă firewalld este activ; cere root (L8.4).'],
        ]} />

        <h4>6.7 Jurnal și mesaje de nucleu</h4>
        <CodeBlock title="comenzi" code={`journalctl -n 20 --no-pager\njournalctl -u sshd -n 10 --no-pager\njournalctl -p err -b --no-pager | tail\ndmesg | tail -5\nls /var/log | head`} explain={[
          ['journalctl -n 20', '-n 20: ultimele 20 de intrări; --no-pager afișează direct, fără pager interactiv.'],
          ['-u sshd', 'doar mesajele unit-ului sshd.'],
          ['-p err -b', '-p err = priorități de la err în sus (erori); -b = doar de la ultimul boot.'],
          ['dmesg | tail -5', 'ultimele mesaje de nucleu (poate cere drepturi suplimentare pe sisteme configurate restrictiv).'],
          ['ls /var/log', 'fișiere de log text, dacă sunt prezente (depinde de rsyslog; vezi L4.7). Ca utilizator obișnuit, unele necesită sudo, iar jurnalul complet poate cere apartenența la grupurile adm/systemd-journal sau wheel.'],
        ]} />

        <h4>6.8 Sinteza: un „scurt control medical” în opt comenzi</h4>
        <CodeBlock title="checklist" code={`uptime\nfree -h\ndf -h\nsystemctl --failed\nss -tln\nip -br a\ngetenforce\njournalctl -p err -b -n 20 --no-pager`} explain={[
          ['uptime', 'a repornit recent? load average mare?'],
          ['free -h', 'memorie epuizată? swap folosit mult?'],
          ['df -h', 'vreun sistem de fișiere aproape plin?'],
          ['systemctl --failed', 'servicii căzute.'],
          ['ss -tln', 'ce ascultă pe rețea.'],
          ['ip -br a', 'interfețele și adresele.'],
          ['getenforce', 'SELinux activ?'],
          ['journalctl -p err …', 'erorile recente.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ps -ef (extras)" kind="session" label="illustrative" code={`[student@server1 ~]$ ps -ef | head -6\nUID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 08:01 ?        00:00:03 /usr/lib/systemd/systemd --switched-root --system --deserialize=...\nroot           2       0  0 08:01 ?        00:00:00 [kthreadd]\nroot         812       1  0 08:01 ?        00:00:00 /usr/sbin/sshd -D\nstudent     2301     812  0 08:15 ?        00:00:00 sshd: student@pts/0\nstudent     2305    2301  0 08:15 pts/0    00:00:00 -bash`} />
        <Table head={['Coloană', 'Sens']} rows={[
          [<b>UID</b>, 'proprietarul procesului (aici ca nume)'],
          [<b>PID</b>, 'identificatorul procesului'],
          [<b>PPID</b>, 'PID-ul părintelui: sshd (812) este copilul lui systemd (1); bash (2305) este copilul sesiunii sshd (2301)'],
          [<b>C</b>, 'utilizarea CPU recentă (procent, rotunjit)'],
          [<b>STIME</b>, 'ora de pornire'],
          [<b>TTY</b>, 'terminalul de control; „?” = fără terminal (daemon); pts/0 = pseudo-terminal (sesiunea ta)'],
          [<b>TIME</b>, 'timp CPU consumat (nu timp scurs)'],
          [<b>CMD</b>, 'comanda; în paranteze pătrate, un thread al nucleului (kthreadd)'],
        ]} />
        <p>Observă lanțul: <code>systemd → sshd → sshd: student@pts/0 → -bash</code>. Cratima din <code>-bash</code> arată un login shell. PID-urile sunt exemplificative și diferă la fiecare pornire.</p>

        <CodeBlock title="systemctl status sshd" kind="session" label="illustrative" code={`[student@server1 ~]$ systemctl status sshd\n● sshd.service - OpenSSH server daemon\n     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled; preset: enabled)\n     Active: active (running) since Tue 2026-11-17 08:01:22 EET; 1h 12min ago\n       Docs: man:sshd(8)\n             man:sshd_config(5)\n   Main PID: 812 (sshd)\n      Tasks: 1 (limit: 22934)\n     Memory: 6.2M\n     CGroup: /system.slice/sshd.service\n             └─812 "sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups"\n\nNov 17 08:01:22 server1 systemd[1]: Started OpenSSH server daemon.\nNov 17 08:01:22 server1 sshd[812]: Server listening on 0.0.0.0 port 22.`} />
        <ul>
          <li><b>Loaded</b>: unit-ul vine din <code>/usr/lib/systemd/system/sshd.service</code> (livrat de pachet); <code>enabled</code> = pornește la boot. „preset” este valoarea implicită propusă de distribuție.</li>
          <li><b>Active</b>: <code>active (running)</code> = rulează acum. Alte valori: <code>inactive (dead)</code>, <code>failed</code>.</li>
          <li><b>Main PID</b>: procesul principal; <b>CGroup</b>: grupul de resurse al serviciului.</li>
          <li>Ultimele linii sunt din jurnal. Datele, PID-urile și mărimile sunt exemplificative; formatul exact depinde de versiunea systemd.</li>
        </ul>

        <CodeBlock title="rpm" kind="session" label="illustrative" code={`[student@server1 ~]$ rpm -q bash\nbash-5.2.26-4.el10.x86_64\n[student@server1 ~]$ rpm -qf /usr/bin/ls\ncoreutils-9.5-3.el10.x86_64\n[student@server1 ~]$ rpm -qa | wc -l\n412`} />
        <ul>
          <li>Numele pachetului are forma <code>nume-versiune-release.disttag.arhitectură</code>: <code>bash</code>, versiunea <code>5.2.26</code>, release <code>4</code>, <code>el10</code> = Enterprise Linux 10, <code>x86_64</code> = arhitectura.</li>
          <li>Versiunile și numărul de pachete (412) sunt exemplificative și diferă între instalări.</li>
        </ul>

        <CodeBlock title="uptime și free" kind="session" label="illustrative" code={`[student@server1 ~]$ uptime\n 09:14:07 up  1:13,  2 users,  load average: 0.08, 0.04, 0.01\n[student@server1 ~]$ free -h\n               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       612Mi       2.6Gi       9.0Mi       820Mi       3.2Gi\nSwap:          2.0Gi          0B       2.0Gi`} />
        <ul>
          <li><b>load average</b>: numărul mediu de procese care rulează sau așteaptă CPU, pe 1, 5 și 15 minute. Peste numărul de CPU-uri înseamnă supraîncărcare (L4.4).</li>
          <li><b>available</b> este coloana care contează: memoria care poate fi folosită fără swap; <b>buff/cache</b> este folosită de nucleu ca cache și se eliberează la nevoie.</li>
        </ul>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <p>Cum confirmi, manual, că ai înțeles harta:</p>
          <ul>
            <li>Alege un serviciu (de exemplu <code>chronyd</code> sau <code>NetworkManager</code>) și răspunde, cu comenzi, la: ce proces este (<code>ps -ef | grep</code>), ce fișier unit îl definește (<code>systemctl status</code>), ce pachet l-a instalat (<code>rpm -qf</code> pe programul din Main PID: <code>readlink /proc/PID/exe</code>), ce configurare citește (<code>rpm -qc pachet</code> sau <code>/etc</code>), unde sunt log-urile lui (<code>journalctl -u</code>).</li>
            <li>Alege un fișier (de exemplu <code>/etc/hosts</code>) și răspunde: ce pachet îl deține, cine este proprietarul, ce permisiuni are, pe ce sistem de fișiere este.</li>
            <li>Alege un utilizator și răspunde: UID, grupuri, home, shell, ce procese rulează sub el.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>Ca hartă, această lecție nu schimbă nimic. Reține însă principiul pentru toate capitolele următoare: pentru fiecare componentă există o stare <b>runtime</b> (în memorie, se pierde la reboot) și una <b>persistentă</b> (pe disc, se citește la boot).</p>
          <Table head={['Componentă', 'Runtime', 'Persistent']} rows={[
            ['serviciu', <><code>systemctl start/stop</code></>, <><code>systemctl enable/disable</code></>],
            ['montare', <><code>mount</code></>, <><code>/etc/fstab</code></>],
            ['firewall', 'regulă fără --permanent', <><code>--permanent</code> sau <code>--runtime-to-permanent</code></>],
            ['rețea', <><code>ip addr add</code></>, <>profil NetworkManager (<code>nmcli connection modify</code>)</>],
            ['SELinux', <><code>setenforce 0</code>, <code>chcon</code></>, <><code>/etc/selinux/config</code>, <code>semanage fcontext</code></>],
            ['hostname', <><code>hostname NUME</code></>, <><code>hostnamectl hostname NUME</code></>],
            ['utilizatori și parole', '—', 'fișierele /etc/passwd, shadow, group (modificate prin comenzi)'],
            ['parametri nucleu', <><code>sysctl -w</code></>, <><code>/etc/sysctl.d/*.conf</code></>],
          ]} />
          <p>Verificare manuală a persistenței: reboot pe VM-ul de test și reciți starea. Aceasta este una dintre cele mai frecvente capcane de examen.</p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<><code>ps</code> nu arată procesul pe care îl cauți</>, 'rulează sub alt terminal sau utilizator; ps fără -e arată doar sesiunea curentă', <code>ps -ef | grep NUME</code>, 'folosește -e sau aux'],
          [<><code>ps -ef | grep ceva</code> arată și linia lui grep</>, 'grep apare ca proces în lista filtrată', 'adaugă | grep -v grep, sau scrie [c]eva', 'folosește pgrep NUME'],
          [<><code>systemctl status</code> spune „Unit … could not be found”</>, 'serviciul nu este instalat sau numele este altul', <><code>systemctl list-unit-files | grep NUME</code>, <code>rpm -q pachet</code></>, 'instalează pachetul (C2) sau corectează numele'],
          [<><code>rpm -qf</code>: „is not owned by any package”</>, 'fișier creat de utilizator sau un link ruptă / calea este un link', <><code>readlink -f</code></>, 'repetă cu calea reală'],
          [<><code>dnf</code>: „This system is not registered”</>, 'sistem RHEL neînregistrat și fără repository local', <><code>subscription-manager status</code></>, 'înregistrează (M0.1) sau configurează un repository local (L2.1)'],
          [<><code>journalctl</code> nu afișează tot / „No journal files were opened due to insufficient permissions”</>, 'ca utilizator obișnuit nu ai acces la tot jurnalul', <code>id</code>, <>folosește <code>sudo journalctl</code> sau adaugă-te în grupul care are acces (dacă politica o permite)</>],
          [<>comenzile sunt lente, load average mare</>, 'proces care consumă CPU/RAM sau disc plin', <><code>top</code>, <code>free -h</code>, <code>df -h</code></>, 'identifică procesul (L4.4)'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confuzia <b>procesului</b> cu <b>serviciul</b>: un serviciu este gestionat de systemd și poate avea mai multe procese; <code>kill</code> pe un proces de serviciu nu îl scoate din „enabled”, iar systemd îl poate reporni.</>,
          <>Confuzia dintre <code>active</code> (rulează acum) și <code>enabled</code> (pornește la boot): sunt independente. La examen cerința „started and enabled” cere ambele.</>,
          <>Presupunerea că SELinux sau firewall-ul nu contează: majoritatea cauzelor „Permission denied” după ce permisiunile clasice sunt corecte sunt SELinux (C10) sau firewall (C8).</>,
          <>Testarea în runtime și neverificarea după reboot (vezi tabelul de persistență).</>,
          <>Folosirea numelui în loc de UID/GID în raționament: pe NFS (L6.3) contează numerele, nu numele.</>,
          <>Instalarea de programe prin copiere de fișiere: nu apar în baza RPM, nu se actualizează și sunt greu de depanat.</>,
          <>Citirea <code>TIME</code> din <code>ps</code> ca „de când rulează”: este timpul CPU, nu timpul scurs (acesta este coloana <code>ELAPSED</code>/<code>etime</code>).</>,
          <>Ignorarea mesajelor din jurnal: ele indică aproape întotdeauna cauza exactă și ora.</>,
          <>Presupunerea că root „poate orice”: SELinux restricționează și procesele rulate ca root.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: cgroups, namespaces, initramfs, fork/exec, orfani și zombie">
        <p>
          <b>cgroups.</b> systemd plasează fiecare serviciu într-un <i>control group</i> (arborele din <code>/sys/fs/cgroup</code>), care permite să limiteze și să măsori CPU, memorie și I/O per serviciu. De aceea <code>systemctl status</code> arată <code>CGroup</code> și de aceea oprirea unui serviciu oprește și procesele lui copil.
        </p>
        <p>
          <b>initramfs.</b> Înainte ca rădăcina reală să fie montată, nucleul încarcă în memorie un mic sistem de fișiere temporar (<code>initramfs</code>, în <code>/boot</code>) care conține driverele și uneltele necesare să găsească discul (inclusiv LVM sau criptare). După montarea rădăcinii, systemd din initramfs predă controlul (<code>--switched-root</code>) lui systemd din sistemul real. Procedura de recuperare cu <code>rd.break</code> (L4.3) oprește exact în acest punct.
        </p>
        <p>
          <b>Orfani și zombie.</b> Dacă părintele unui proces moare, copilul este „adoptat” de PID 1. Un zombie este un proces terminat al cărui părinte nu a citit încă codul de ieșire; ocupă doar o intrare în tabela de procese și dispare când părintele citește statusul sau moare.
        </p>
        <p>
          <b>Namespaces.</b> Containerele (Podman, în afara v1) folosesc namespaces pentru a izola ce vede un proces (PID-uri, rețea, montări). Concepte din această lecție (procese, cgroups, sisteme de fișiere) sunt baza lor, dar containerele nu fac parte din obiectivele acestui curs.
        </p>
        <p>
          <b>Căutarea sigură a proceselor.</b> <code>pgrep -a NUME</code> afișează PID-ul și comanda procesului fără linia lui grep; <code>pkill</code> trimite semnale după nume. Folosește-le cu atenție: un tipar prea larg poate opri alt proces.
        </p>
      </DeepDive>
    </>
  );
}

export const M0_5: TopicModule = {
  id: 'M0.5',
  subtitle: 'Harta sistemului: nucleu, procese, servicii systemd, pachete RPM, utilizatori și permisiuni, jurnal, SELinux, rețea — și unde să cauți fiecare',
  studyTime: '≈90 min studiu + 2 laboratoare',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când îl folosim', code: '5' },
    { id: 'commands', label: 'Comenzi și configurare', code: '6' },
    { id: 'outputs', label: 'Output-uri explicate', code: '7' },
    { id: 'verify', label: 'Verificare', code: '8' },
    { id: 'persist', label: 'Persistență', code: '9' },
    { id: 'troubleshoot', label: 'Troubleshooting', code: '10' },
    { id: 'traps', label: 'Capcane de examen', code: '11' },
    { id: 'questions', label: 'Întrebări' },
    { id: 'labs', label: 'Laborator' },
  ],
  Body,
  labs: [LAB_M0_5A, LAB_M0_5B],
  sources: [
    { kind: 'man', ref: 'ps(1), top(1), pstree(1), proc(5), fork(2), execve(2), signal(7), systemd(1), systemctl(1), rpm(8), dnf(8), id(1), getent(1), who(1), w(1), last(1), free(1), uptime(1), ss(8), ip(8), journalctl(1)' },
    { kind: 'upstream', ref: 'systemd documentation (systemd.io; freedesktop.org systemd man pages)' },
    { kind: 'upstream', ref: 'hier(7) și path_resolution(7) — man7.org, citite 2026-11-17 (pentru referințele la /proc, /sys, /run)' },
    { kind: 'doc', ref: 'Red Hat Enterprise Linux 10 — documentația (docs.redhat.com): HTTP 403, necitită; de verificat la review' },
  ],
};
