import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_M0_4A, LAB_M0_4B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pe Linux există <b>un singur arbore de directoare</b>, care pornește din rădăcina <code>/</code>. Nu există litere de unitate (C:, D:): discurile și partițiile se <i>montează</i> în directoare ale arborelui. Fiecare director de top are un rol standardizat de <G id="fhs">FHS</G>: configurările stau în <code>/etc</code>, programele în <code>/usr</code>, datele care se schimbă (log-uri, stare) în <code>/var</code>, fișierele utilizatorilor în <code>/home</code>, nucleul în <code>/boot</code>, iar <code>/proc</code>, <code>/sys</code> și <code>/dev</code> nu sunt pe disc deloc.
          </p>
          <p>
            Dacă știi <b>unde să cauți</b>, administrarea devine previzibilă: „serviciul nu pornește” → configurarea e în <code>/etc</code>, log-urile în <code>/var/log</code> sau în jurnal, datele în <code>/var/lib</code>. Lecția te învață harta, apoi navigarea (cale absolută/relativă, <code>cd</code>, <code>ls</code>, <code>findmnt</code>, <code>df</code>) și greșelile tipice. Material de suport (neoficial): bază pentru C1, C5 și C6.
          </p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un sistem de operare are mii de fișiere: programe, biblioteci, configurări, documentație, date ale aplicațiilor, fișierele fiecărui utilizator. Fără o regulă de organizare, nimeni nu ar ști unde să caute sau unde să pună ce. În primele decenii Unix a ajuns la o convenție, iar <b>Filesystem Hierarchy Standard (FHS)</b> a scris-o în documentul (versiunea 3.0) pe care îl urmează, cu mici diferențe, aproape toate distribuțiile Linux, inclusiv RHEL.
          </p>
          <Analogy>un depozit bine organizat. La intrare ai un plan: raionul „configurări” (/etc), raionul „programe” (/usr), raionul „stocuri care se consumă” (/var), raionul „obiectele clienților” (/home). Un angajat nou care cunoaște planul găsește orice într-un minut, chiar într-un depozit în care n-a mai fost.</Analogy>

          <h4>Două criterii din spatele organizării</h4>
          <p>FHS clasifică conținutul după două întrebări:</p>
          <Table head={['Criteriu', 'Întrebare', 'Exemple']} rows={[
            [<b>static / variabil</b>, 'Se schimbă conținutul în timpul funcționării normale, fără intervenția administratorului?', <><code>/usr</code> = static (se modifică prin pachete); <code>/var</code> = variabil (log-uri, cozi, cache)</>],
            [<b>partajabil / local</b>, 'Poate fi folosit identic de alte mașini (de exemplu printr-un NFS)?', <><code>/usr</code> = partajabil; <code>/etc</code> = local, specific mașinii</>],
          ]} />
          <p>
            De aici reguli practice: poți monta <code>/usr</code> doar pentru citire; <code>/var</code> poate fi pe un volum separat ca să nu umple log-urile discul principal; <code>/etc</code> merită salvat și versionat, fiindcă este „identitatea” mașinii.
          </p>

          <h4>De ce nu există C: și D:</h4>
          <p>
            Pe Windows, fiecare partiție primește o literă și are propriul arbore. Pe Linux, tot ce poate fi citit trăiește sub <code>/</code>. Un disc nou nu primește o literă: îl <b>montezi</b> într-un director existent (de exemplu <code>/data</code>). Din acel moment, calea <code>/data/raport.txt</code> nu mai spune pe ce disc este fișierul, iar programele nu trebuie să știe. Un avantaj: poți muta datele pe un disc mai mare fără să schimbi nicio cale (C5, C6).
          </p>
          <p>
            <b>Ce s-ar întâmpla fără o convenție?</b> Fiecare administrator ar inventa locuri proprii; scripturile nu ar putea presupune unde sunt fișierele; pachetele de la furnizori diferiți s-ar suprapune.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Arborele și punctele de montare</h4>
          <p>
            La pornire, nucleul montează un sistem de fișiere ca rădăcină (<code>/</code>). Apoi sistemul montează, conform <code>/etc/fstab</code> și altor reguli, alte sisteme de fișiere peste directoare goale din arbore: <code>/boot</code>, <code>/home</code>, <code>/var</code>… Un asemenea director se numește <b>punct de montare</b>. Când o cale trece printr-un punct de montare, nucleul comută pe alt sistem de fișiere, fără ca tu să observi. Un <G id="directory-tree">arbore unic</G> se obține deci din mai multe sisteme de fișiere „lipite”.
          </p>
          <CodeBlock title="hartă (simplificată, ilustrativă)" kind="session" label="illustrative" code={`/                     ← sistemul de fișiere rădăcină (de ex. un LV pe XFS)\n├── bin  → usr/bin      (legătură)\n├── sbin → usr/sbin     (legătură)\n├── lib  → usr/lib      (legătură)\n├── lib64 → usr/lib64   (legătură)\n├── boot                ← partiție separată: nucleu, initramfs, GRUB\n│   └── efi             ← ESP (doar UEFI)\n├── dev                 ← fișiere de dispozitiv (devtmpfs)\n├── etc                 ← configurări locale\n├── home                ← directoare personale\n│   └── student\n├── media               ← medii amovibile (montare automată)\n├── mnt                 ← montări temporare manuale\n├── opt                 ← software adițional, în pachete proprii\n├── proc                ← procese și nucleu (pseudo)\n├── root                ← home-ul utilizatorului root\n├── run                 ← stare de la pornire (tmpfs)\n├── srv                 ← date servite de acest sistem\n├── sys                 ← dispozitive și nucleu (pseudo)\n├── tmp                 ← fișiere temporare\n├── usr                 ← programe, biblioteci, documentație\n│   ├── bin  sbin  lib  lib64  libexec  share  include  src  local\n└── var                 ← date variabile\n    ├── cache  lib  log  spool  tmp`} />
          <p>
            Hartă ilustrativă: nu toate sistemele au toate directoarele; pe sistemul tău ia-o ca punct de plecare și verifică cu <code>ls -l /</code>.
          </p>

          <h4>Cale absolută și relativă</h4>
          <ul>
            <li><b>Cale absolută</b>: începe cu <code>/</code> și pornește mereu din rădăcină: <code>/etc/ssh/sshd_config</code>. Spune același lucru oriunde te-ai afla.</li>
            <li><b>Cale relativă</b>: nu începe cu <code>/</code> și pornește de la directorul curent: <code>ssh/sshd_config</code> înseamnă ceva doar dacă ești în <code>/etc</code>.</li>
            <li><code>.</code> = directorul curent; <code>..</code> = părintele (<G id="dot-dotdot">detalii</G>); <code>~</code> = directorul home (<G id="tilde-expansion">tilde</G>); <code>-</code> după <code>cd</code> = directorul anterior.</li>
            <li>Peste rădăcină nu se poate urca: <code>/..</code> este tot <code>/</code> (<code>path_resolution(7)</code>).</li>
            <li>Un nume este sensibil la majuscule: <code>/etc/Hosts</code> ≠ <code>/etc/hosts</code>. Un nume care începe cu punct (<code>.bashrc</code>) este „ascuns” doar în sensul că <code>ls</code> nu îl arată fără <code>-a</code>.</li>
            <li>Separatorul este <code>/</code>; <code>//</code> sau <code>/etc/</code> sunt acceptate. Un nume de fișier poate conține aproape orice, în afară de <code>/</code> și octetul nul; evită spațiile, ca să nu ai nevoie de citare.</li>
          </ul>

          <h4>Cum rezolvă nucleul o cale</h4>
          <p>
            Pentru <code>/etc/ssh/sshd_config</code> nucleul pornește din rădăcină, caută <code>etc</code> în ea, apoi <code>ssh</code> în <code>etc</code>, apoi <code>sshd_config</code>. În fiecare pas verifică dacă ai dreptul de „căutare” (<code>x</code>) pe director (L1.8). Dacă o componentă este o legătură simbolică, o urmează (cel mult 40 de legături în total). Un nume inexistent → „No such file or directory”; lipsa dreptului → „Permission denied”.
          </p>

          <h4>Sisteme de fișiere reale și virtuale</h4>
          <Table head={['Tip', 'Unde trăiește', 'Exemple']} rows={[
            [<b>pe disc</b>, 'dispozitive de stocare; persistă după reboot', <><code>/</code>, <code>/boot</code>, <code>/home</code>, <code>/var</code> (XFS, ext4…)</>],
            [<b><G id="pseudo-filesystem">pseudo / virtual</G></b>, 'în memoria nucleului; dispar la oprire', <><code>/proc</code>, <code>/sys</code>, <code>/dev</code> (devtmpfs), <code>/run</code> (<G id="tmpfs">tmpfs</G>)</>],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Stocare</b> (C5, C6): partițiile, volumele LVM și sistemele de fișiere sunt „montate” în arbore; <code>/etc/fstab</code> face montările persistente.</li>
            <li><b>Permisiuni</b> (L1.8): fiecare director și fișier are proprietar, grup și drepturi rwx; pentru a ajunge la un fișier ai nevoie de <code>x</code> pe toate directoarele din cale.</li>
            <li><b>SELinux</b> (C10): contextul unui fișier depinde de <i>locul</i> în care se află și este moștenit la creare; de aceea fișierele mutate cu <code>mv</code> între directoare pot păstra un context nepotrivit (L10.5).</li>
            <li><b>Pachete</b> (C2): RPM pune fișierele în locuri previzibile: binarele în <code>/usr/bin</code>, configurările în <code>/etc</code>, datele în <code>/var/lib</code>, documentația în <code>/usr/share/doc</code>.</li>
            <li><b>systemd</b> (C4): unit-urile livrate de pachete stau în <code>/usr/lib/systemd/system</code>; cele ale administratorului în <code>/etc/systemd/system</code> (au prioritate).</li>
            <li><b>Utilizatori</b> (C9): <code>/home/&lt;utilizator&gt;</code> este directorul personal; <code>/etc/passwd</code> îl indică; <code>/etc/skel</code> este șablonul copiat la creare.</li>
            <li><b>Documentație</b> (L1.2): <code>man hier</code> descrie ierarhia pe sistemul tău.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li><b>Când un serviciu nu funcționează</b>: configurarea este în <code>/etc/&lt;serviciu&gt;/</code>, mesajele în <code>journalctl</code> sau <code>/var/log</code>, datele în <code>/var/lib/&lt;serviciu&gt;</code>.</li>
            <li><b>Când discul se umple</b>: <code>df -h</code> arată ce sistem de fișiere e plin; de regulă vinovatul este <code>/var</code> (log-uri) sau <code>/home</code>.</li>
            <li><b>Când instalezi software</b>: nu pune nimic de mână în <code>/usr/bin</code>; software-ul propriu merge în <code>/usr/local</code> sau <code>/opt</code>, ca să nu se amestece cu pachetele.</li>
            <li><b>Când pregătești stocare nouă</b>: alegi punctul de montare (de exemplu <code>/data</code>, <code>/srv/www</code>) și îl creezi înainte de a monta (C5, C6).</li>
            <li><b>La examen</b>: fiecare sarcină îți cere un fișier sau un director anume; dacă știi locurile standard, scrii căile fără să le cauți.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Cum se citesc blocurile de mai jos">
          Platforma <b>nu rulează</b> nimic. Comenzile din această secțiune <b>doar citesc</b> (explorare), cu excepția celor din <code>~/m04</code>, unde creezi fișiere în directorul tău personal. Output-urile sunt etichetate <b>Ilustrativ</b>: pe sistemul tău vor diferi.
        </Callout>

        <h4>6.1 Unde sunt și cum mă mut: pwd, cd, ls</h4>
        <CodeBlock title="comenzi" code={`pwd\ncd /etc\npwd\ncd ssh\npwd\ncd ..\ncd -\ncd\ncd ~\ncd /usr/share/doc\ncd ../../lib\npwd`} explain={[
          ['pwd', 'print working directory: directorul curent, mereu ca cale absolută.'],
          ['cd /etc', 'cale absolută: funcționează de oriunde.'],
          ['cd ssh', 'cale relativă: intră în /etc/ssh (ești deja în /etc).'],
          ['cd ..', 'urcă un nivel: din /etc/ssh în /etc.'],
          ['cd -', 'revine la directorul în care erai înainte (bash păstrează variabila OLDPWD).'],
          ['cd  sau  cd ~', 'fără argument, sau cu ~, te duce în directorul home.'],
          ['cd ../../lib', 'din /usr/share/doc urcă la /usr, apoi intră în lib: /usr/lib. Atenție la puterea căilor relative: același text duce în alt loc în funcție de unde ești.'],
        ]} />

        <h4>6.2 Rădăcina și directoarele de top</h4>
        <CodeBlock title="comenzi" code={`ls /\nls -l /\nls -ld /bin /sbin /lib /lib64 /usr/sbin\nreadlink -f /bin\nls -ld /var/run /var/lock\nman hier`} explain={[
          ['ls /', 'conținutul rădăcinii: directoarele de top.'],
          ['ls -l /', 'formatul lung: tipul și, la legături, ținta (lib -> usr/lib).'],
          ['ls -ld /bin /sbin …', '-d arată legăturile ca atare, nu conținutul directoarelor țintă. Un „l” la începutul permisiunilor = legătură simbolică.'],
          ['readlink -f /bin', 'urmărește legăturile și afișează calea reală (de ex. /usr/bin).'],
          ['man hier', 'descrierea oficială a ierarhiei pe sistemul tău (secțiunea 7 a manualului).'],
        ]} />

        <h4>6.3 Ce fel de fișier este și de unde vine comanda</h4>
        <CodeBlock title="comenzi" code={`file /etc/hostname /bin/ls /usr/bin/ls /dev/null /dev/sda /etc\nstat /etc/hostname\ntype -a ls\nwhich bash\nreadlink -f $(which sh)\necho $PATH | tr ':' '\\n'\nls /usr/bin | wc -l`} explain={[
          ['file NUME…', 'recunoaște tipul după conținut și metadate: text, director, legătură, fișier special de bloc/caracter, executabil ELF.'],
          ['stat FIȘIER', 'metadate: dimensiune, inode, permisiuni, proprietar, momentele de acces/modificare/schimbare, context SELinux.'],
          ['type -a ls  /  which bash', 'unde se află programul (în PATH).'],
          ['readlink -f $(which sh)', '$(…) înlocuiește construcția cu ieșirea comenzii; arată ținta reală a lui sh (pe RHEL: bash).'],
          ['tr \':\' \'\\n\'', 'transformă separatorul „:” în linie nouă: citești directoarele din PATH pe rând.'],
          ['ls /usr/bin | wc -l', 'wc -l numără liniile: aproximativ câte comenzi sunt în /usr/bin.'],
        ]} />

        <h4>6.4 Sisteme de fișiere montate, spațiu și discuri</h4>
        <CodeBlock title="comenzi" code={`df -h\ndf -hT /\ndf -h /home /var /boot\nfindmnt\nfindmnt /\nfindmnt -t xfs,ext4,vfat\nlsblk\nlsblk -f\ncat /etc/fstab`} explain={[
          ['df -h', 'disk free: spațiul pe fiecare sistem de fișiere montat; -h = unități citibile (K, M, G).'],
          ['df -hT /', '-T adaugă tipul sistemului de fișiere (xfs, ext4, tmpfs…); „/” cere informații pentru sistemul care conține acel director.'],
          ['df -h /home /var /boot', 'dacă un director nu este montat separat, df îl raportează la sistemul care îl conține.'],
          ['findmnt', 'afișează arborele tuturor montărilor: sursă, țintă (punct de montare), tip, opțiuni. Folosește -t ca să filtrezi după tip.'],
          ['findmnt /', 'doar montarea care conține / (rădăcina).'],
          ['lsblk', 'list block devices: discuri, partiții, volume LVM și punctele lor de montare (C5).'],
          ['lsblk -f', '-f adaugă tipul sistemului de fișiere, eticheta și UUID-ul.'],
          ['cat /etc/fstab', 'montările persistente: câte o linie per sistem de fișiere (L5.5).'],
        ]} />

        <h4>6.5 Cât ocupă un director: du</h4>
        <CodeBlock title="comenzi" code={`du -sh /etc\ndu -sh /var/log\ndu -h --max-depth=1 /var | sort -h | tail -5\nsudo du -sh /root`} explain={[
          ['du -sh DIR', 'disk usage: -s (--summarize) un singur total pentru director; -h unități citibile.'],
          ['--max-depth=1', 'afișează totalul fiecărui subdirector de nivel 1 în loc de toată ierarhia.'],
          ['| sort -h | tail -5', 'sort -h ordonează numeric după mărimi citibile (K<M<G); tail -5 păstrează ultimele 5 (cele mai mari).'],
          ['sudo du -sh /root', '/root este accesibil doar root-ului; sudo (L9.4) rulează comanda ca root. Fără drept, vezi „Permission denied”.'],
        ]} />

        <h4>6.6 Pseudo-sisteme de fișiere: /proc, /sys, /dev, /run</h4>
        <CodeBlock title="comenzi" code={`ls /proc | head\ncat /proc/uptime\ncat /proc/cpuinfo | grep -m1 "model name"\nhead -3 /proc/meminfo\ncat /proc/$$/comm\nls /sys/class/net\nls -l /dev/null /dev/zero /dev/tty\nls -l /dev/sda /dev/vda /dev/nvme0n1 2>/dev/null\nfindmnt -t proc,sysfs,devtmpfs,tmpfs`} explain={[
          ['ls /proc | head', 'directoarele numerice sunt PID-uri de procese; restul sunt fișiere cu informații despre nucleu.'],
          ['cat /proc/uptime', 'secunde de la pornire și de inactivitate; „fișierul” nu există pe disc, este generat la citire.'],
          ['grep -m1 "model name"', '-m1 oprește după prima potrivire.'],
          ['head -3 /proc/meminfo', 'primele 3 linii: memoria totală, liberă, disponibilă.'],
          ['cat /proc/$$/comm', '$$ este PID-ul shell-ului tău; /proc/PID/comm conține numele programului: bash.'],
          ['ls /sys/class/net', 'placa(ile) de rețea, văzute de nucleu.'],
          ['ls -l /dev/null /dev/zero /dev/tty', 'litera c la început: fișiere de dispozitiv „caracter”; /dev/null aruncă tot ce scrii, /dev/zero produce octeți nuli.'],
          ['2>/dev/null', 'aruncă mesajele de eroare (stderr) ale comenzilor care nu găsesc discul respectiv (redirecționare: L1.5).'],
          ['findmnt -t proc,sysfs,…', 'arată montările pseudo-sistemelor.'],
        ]} />

        <h4>6.7 Fișierele de configurare esențiale din /etc</h4>
        <Table head={['Fișier / director', 'Rol', 'Lecție']} rows={[
          [<code>/etc/passwd</code>, 'conturile locale (nume, UID, GID, home, shell)', 'L9.1'],
          [<code>/etc/shadow</code>, 'hash-uri de parole și date de expirare (doar root)', 'L9.2'],
          [<code>/etc/group</code>, 'grupurile și membrii lor', 'L9.3'],
          [<code>/etc/sudoers</code>, <>politica sudo; se editează cu <code>visudo</code></>, 'L9.4'],
          [<code>/etc/fstab</code>, 'montări persistente', 'L5.5'],
          [<code>/etc/hosts</code>, 'nume → adrese locale', 'L8.3'],
          [<code>/etc/hostname</code>, 'numele mașinii', 'L8.3'],
          [<code>/etc/resolv.conf</code>, 'servere DNS (gestionat de NetworkManager)', 'L8.3'],
          [<code>/etc/os-release</code>, 'identitatea distribuției', 'M0.1'],
          [<code>/etc/yum.repos.d/</code>, 'repository-uri DNF', 'L2.1'],
          [<code>/etc/ssh/</code>, 'sshd_config, ssh_config', 'L1.11, L10.2'],
          [<code>/etc/systemd/system/</code>, 'unit-uri și suprascrieri ale administratorului', 'L4.9'],
          [<code>/etc/NetworkManager/</code>, 'configurări de rețea', 'L8.2'],
          [<code>/etc/selinux/config</code>, 'modul SELinux la boot', 'L10.3'],
          [<code>/etc/chrony.conf</code>, 'sincronizarea timpului', 'L7.3'],
          [<code>/etc/profile, /etc/bashrc, /etc/profile.d/</code>, 'mediul shell-ului pentru toți', 'M0.3'],
          [<code>/etc/skel/</code>, 'șablonul pentru home-uri noi', 'L9.1'],
          [<code>/etc/default/grub</code>, 'opțiuni GRUB', 'L7.4'],
        ]} />

        <h4>6.8 Fișiere temporare: /tmp, /var/tmp, /run</h4>
        <Table head={['Director', 'Conținut', 'Supraviețuiește reboot-ului?']} rows={[
          [<code>/tmp</code>, 'fișiere temporare ale programelor; curățat periodic de systemd-tmpfiles', 'nu garantat; pe unele sisteme este tmpfs'],
          [<code>/var/tmp</code>, 'temporare care trebuie să mai trăiască puțin (de exemplu între reboot-uri)', 'da, dar curățat periodic (prag mai lung)'],
          [<code>/run</code>, 'stare de execuție (PID-uri, socket-uri, lock-uri); tmpfs', 'nu: se recreează la fiecare pornire'],
        ]} />
        <p>Verifică ce este <code>/tmp</code> pe sistemul tău: <code>findmnt /tmp</code> (dacă nu afișează nimic, este doar un director pe sistemul rădăcină) și regulile de curățare: <code>cat /usr/lib/tmpfiles.d/tmp.conf</code>.</p>

        <h4>6.9 Exerciții de creare în home: un mini-arbore</h4>
        <CodeBlock title="comenzi" code={`mkdir -p ~/m04/proiect/{src,docs,build}\ncd ~/m04/proiect\ntouch src/main.c docs/README.txt\nls -R ~/m04\ncp -r docs ../docs-backup\nmv build ../build-vechi\nls ~/m04\ncd ../..\nrm -r ~/m04/docs-backup\nrmdir ~/m04/build-vechi\nls -a ~/m04`} explain={[
          ['mkdir -p ~/m04/proiect/{src,docs,build}', '-p creează toată calea; acoladele generează trei directoare dintr-o comandă.'],
          ['touch src/main.c docs/README.txt', 'cale relativă: din ~/m04/proiect.'],
          ['ls -R', '-R (--recursive) listează și subdirectoarele.'],
          ['cp -r docs ../docs-backup', '-r copiază directoare recursiv; ../ este părintele (~/m04).'],
          ['mv build ../build-vechi', 'mută (sau redenumește) un director; mv nu are nevoie de -r.'],
          ['rm -r …', 'șterge recursiv; nu există coș. Verifică calea înainte (echo, ls).'],
          ['rmdir …', 'șterge doar directoare goale; este mai sigur decât rm -r.'],
        ]} />
        <p>Detaliile despre <code>cp</code>, <code>mv</code>, <code>rm</code> sunt în L1.3. Aici contează că folosești căi relative și absolute corect.</p>

        <h4>6.10 Căutare: unde este...?</h4>
        <CodeBlock title="comenzi" code={`ls /etc/ssh/sshd_config\nfind /etc -maxdepth 1 -name "ssh*"\nfind /etc -name "*.repo" 2>/dev/null\nrpm -qf /etc/ssh/sshd_config\nrpm -ql openssh-server | head\nsudo updatedb\nlocate sshd_config`} explain={[
          ['find /etc -maxdepth 1 -name "ssh*"', 'find parcurge arborele începând de la /etc; -maxdepth 1 se oprește la primul nivel; -name filtrează după nume (ghilimele: ca să nu le expandeze shell-ul).'],
          ['2>/dev/null', 'ascunde mesajele „Permission denied” din directoare inaccesibile.'],
          ['rpm -qf FIȘIER', 'ce pachet RPM a instalat fișierul (M0.5, C2).'],
          ['rpm -ql PACHET', 'toate fișierele unui pachet.'],
          ['updatedb / locate', 'locate caută într-o bază de date a numelor de fișiere (pachetul mlocate/plocate, dacă este instalat); updatedb o reconstruiește; rezultatul poate fi depășit dacă baza nu este actualizată.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ls -l / (selecție)" kind="session" label="illustrative" code={`[student@server1 ~]$ ls -l /\nlrwxrwxrwx.   1 root root    7 Jan 10 09:00 bin -> usr/bin\ndr-xr-xr-x.   5 root root 4096 Jan 10 09:20 boot\ndrwxr-xr-x.  20 root root 3380 Nov 17 08:01 dev\ndrwxr-xr-x. 130 root root 8192 Nov 17 08:01 etc\ndrwxr-xr-x.   3 root root   21 Jan 10 09:05 home\nlrwxrwxrwx.   1 root root    7 Jan 10 09:00 lib -> usr/lib\nlrwxrwxrwx.   1 root root    9 Jan 10 09:00 lib64 -> usr/lib64\ndr-xr-xr-x. 220 root root    0 Nov 17 08:01 proc\ndr-xr-x---.   4 root root  161 Nov 17 08:10 root\ndrwxr-xr-x.  42 root root 1160 Nov 17 08:12 run\nlrwxrwxrwx.   1 root root    8 Jan 10 09:00 sbin -> usr/sbin\ndr-xr-xr-x.  13 root root    0 Nov 17 08:01 sys\ndrwxrwxrwt.  12 root root  240 Nov 17 08:20 tmp\ndrwxr-xr-x.  12 root root  144 Jan 10 09:00 usr\ndrwxr-xr-x.  19 root root  267 Jan 10 09:05 var`} />
        <ul>
          <li><code>bin -&gt; usr/bin</code>: <code>l</code> la început = legătură simbolică; după săgeată este ținta (cale relativă, începând din <code>/</code>). Același model pentru <code>lib</code> și <code>lib64</code>, și — dacă nu s-au unit — <code>sbin -&gt; usr/sbin</code> (vezi <G id="usr-merge">usr merge</G>).</li>
          <li><code>proc</code> și <code>sys</code>: dimensiune <code>0</code>, data este ora pornirii: sunt generate de nucleu, nu sunt pe disc.</li>
          <li><code>root</code>: <code>dr-xr-x---</code>: ceilalți utilizatori nu au niciun drept; de aceea <code>ls /root</code> eșuează pentru un utilizator obișnuit.</li>
          <li><code>tmp</code>: <code>drwxrwxrwt</code>: <code>t</code> la sfârșit = sticky bit; oricine poate crea fișiere, dar fiecare poate șterge doar ale lui (L6.5, L1.8).</li>
          <li>Numărul și numele directoarelor diferă pe sistemul tău; datele și numerele din coloana 2 sunt exemplificative.</li>
        </ul>

        <CodeBlock title="df -hT" kind="session" label="illustrative" code={`[student@server1 ~]$ df -hT\nFilesystem             Type      Size  Used Avail Use% Mounted on\ndevtmpfs               devtmpfs  4.0M     0  4.0M   0% /dev\ntmpfs                  tmpfs     1.9G     0  1.9G   0% /dev/shm\ntmpfs                  tmpfs     777M  9.0M  768M   2% /run\n/dev/mapper/rhel-root  xfs        17G  4.2G   13G  25% /\n/dev/vda1              xfs       960M  295M  666M  31% /boot\ntmpfs                  tmpfs     389M     0  389M   0% /run/user/1000`} />
        <ul>
          <li><b>Filesystem</b>: sursa. <code>/dev/mapper/rhel-root</code> este un volum logic LVM (C5); <code>devtmpfs</code> și <code>tmpfs</code> sunt sisteme în RAM.</li>
          <li><b>Type</b> (din <code>-T</code>): <code>xfs</code> este sistemul de fișiere implicit pe RHEL.</li>
          <li><b>Size / Used / Avail / Use%</b>: capacitate, ocupat, liber, procent. Rotunjirile sunt făcute de <code>-h</code>.</li>
          <li><b>Mounted on</b>: punctul de montare; vezi cum <code>/boot</code> este separat de <code>/</code>.</li>
          <li><code>/run/user/1000</code>: directorul de execuție al utilizatorului cu UID 1000 (tmpfs).</li>
          <li>Numele (<code>rhel-root</code>, <code>/dev/vda1</code>), mărimile și procentele sunt exemplificative.</li>
        </ul>

        <CodeBlock title="findmnt (extras)" kind="session" label="illustrative" code={`[student@server1 ~]$ findmnt /\nTARGET SOURCE                FSTYPE OPTIONS\n/      /dev/mapper/rhel-root xfs    rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota\n[student@server1 ~]$ findmnt -t xfs\nTARGET SOURCE                FSTYPE OPTIONS\n/      /dev/mapper/rhel-root xfs    rw,relatime,seclabel,...\n/boot  /dev/vda1             xfs    rw,relatime,seclabel,...`} />
        <ul>
          <li><b>TARGET</b> = punctul de montare; <b>SOURCE</b> = dispozitivul sau pseudo-sursa; <b>FSTYPE</b> = tipul; <b>OPTIONS</b> = opțiunile de montare (rw = scriere/citire; seclabel = SELinux activ pentru acest sistem de fișiere). Opțiunile exacte depind de nucleu și de configurare.</li>
        </ul>

        <CodeBlock title="file și readlink" kind="session" label="illustrative" code={`[student@server1 ~]$ file /etc/hostname /bin/ls /usr/bin/ls /dev/null /dev/vda /etc\n/etc/hostname: ASCII text\n/bin/ls:       symbolic link to usr/bin/ls\n/usr/bin/ls:   ELF 64-bit LSB pie executable, x86-64, ... dynamically linked, ...\n/dev/null:     character special (1/3)\n/dev/vda:      block special (252/0)\n/etc:          directory\n[student@server1 ~]$ readlink -f /bin\n/usr/bin`} />
        <ul>
          <li><code>ASCII text</code>: fișier text; <code>symbolic link to …</code>: legătură; <code>ELF … executable</code>: program compilat; <code>character special (1/3)</code> și <code>block special (252/0)</code>: fișiere de dispozitiv (major/minor).</li>
          <li>Textul exact (versiunea ELF, numerele major/minor) diferă pe sistemul tău.</li>
        </ul>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Unde sunt?</b> <code>pwd</code>. <b>Ce este calea aceasta?</b> <code>file CALE</code>, <code>ls -ld CALE</code>.</li>
            <li><b>Pe ce sistem de fișiere este?</b> <code>findmnt -T CALE</code> sau <code>df -h CALE</code> (-T: caută montarea care conține calea).</li>
            <li><b>Unde duce o legătură?</b> <code>readlink -f CALE</code>.</li>
            <li><b>A cui este comanda?</b> <code>type -a comandă</code>, <code>rpm -qf $(which comandă)</code>.</li>
            <li><b>Cât ocupă?</b> <code>du -sh DIR</code>; <b>cât e liber?</b> <code>df -h</code>.</li>
            <li><b>Ce spune documentația locală?</b> <code>man hier</code>, <code>man 5 fstab</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Persistența depinde de <i>unde</i> scrii. Fișierele pe sistemele de fișiere reale (<code>/etc</code>, <code>/home</code>, <code>/var</code>, <code>/usr</code>) supraviețuiesc reboot-ului. Ce este în <code>/run</code>, <code>/proc</code>, <code>/sys</code> și (posibil) în <code>/tmp</code> nu supraviețuiește. O modificare făcută în <code>/proc</code> sau <code>/sys</code> (de exemplu un parametru al nucleului) trebuie făcută persistentă separat, prin fișiere de configurare (<code>/etc/sysctl.d/</code>, parametri de boot) sau prin servicii.
          </p>
          <ul>
            <li>O montare făcută cu <code>mount</code> dispare la reboot; cea din <code>/etc/fstab</code> rămâne (L5.5).</li>
            <li>Un director creat în <code>/run</code> dispare; dacă un serviciu are nevoie de el, se declară în <code>tmpfiles.d</code> sau în unit-ul systemd.</li>
            <li>Verificare manuală: reboot într-o VM de test, apoi <code>findmnt</code>, <code>ls</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>No such file or directory</code>, 'cale greșită, majuscule, cale relativă din alt director, componentă lipsă', <><code>pwd</code>, <code>ls -ld</code> pe fiecare componentă</>, 'folosește Tab; cale absolută; verifică fiecare nivel'],
          [<code>Permission denied</code>, 'lipsește x pe un director din cale sau r/w pe fișier', <><code>namei -l CALE</code></>, 'schimbă drepturile (L1.8) sau folosește sudo, dacă se cere'],
          [<code>Not a directory</code>, 'ai folosit un fișier ca director în cale', <code>file CALE</code>, 'corectează calea'],
          [<>discul „este plin”, dar <code>du</code> nu găsește unde</>, 'fișiere șterse dar încă deschise de un proces, sau alt sistem de fișiere', <><code>df -h</code>, <code>df -i</code>, <code>sudo du -xh --max-depth=1 /</code></>, 'repornește serviciul care ține fișierul deschis; verifică inode-urile'],
          [<>fișierele din directorul de montare par dispărute</>, 'un sistem de fișiere a fost montat peste un director care avea conținut (acesta rămâne ascuns dedesubt)', <><code>findmnt</code>, <code>mount | grep dir</code></>, 'demontează (umount) pentru a vedea conținutul de dedesubt; folosește puncte de montare goale'],
          [<><code>cd</code> nu funcționează într-un script</>, 'efectul se pierde la sfârșitul procesului copil', '—', 'folosește source sau schimbă directorul în comanda din script'],
          [<>legătură „ruptă” (roșu în ls)</>, 'ținta nu mai există', <code>ls -l; readlink -f</code>, 'recreează ținta sau legătura (L1.7)'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confuzia dintre <b>cale absolută</b> și <b>relativă</b>: <code>cp fisier etc/</code> copiază într-un director <code>etc</code> relativ la directorul curent, nu în <code>/etc</code>. Verifică cu <code>pwd</code>.</>,
          <>Salvarea datelor în <code>/tmp</code> sau <code>/run</code> și așteptarea ca ele să existe după reboot.</>,
          <>Instalarea manuală de programe în <code>/usr/bin</code>; pentru software propriu folosește <code>/usr/local</code> sau <code>/opt</code>.</>,
          <>Montarea unui disc peste un director cu fișiere: acestea devin invizibile până la demontare.</>,
          <>Presupunerea că un fișier din <code>/proc</code> sau <code>/sys</code> este editabil ca un fișier obișnuit (unele sunt doar pentru citire; schimbările nu sunt persistente).</>,
          <>Crearea directoarelor în <code>/home</code> fără utilizator: nu sunt conturi; <code>useradd -m</code> este calea corectă (L9.1).</>,
          <>Uitarea că <code>/root</code> nu este în <code>/home</code>.</>,
          <>Folosirea lui <code>~</code> între ghilimele (<code>"~/x"</code>): tilde nu se expandează între ghilimele; scrie <code>~/"x y"</code> sau <code>"$HOME/x y"</code>.</>,
          <>Neglijarea sensibilității la majuscule: <code>/Home</code> nu există.</>,
          <>Ștergerea cu <code>rm -r</code> într-un director greșit, fiindcă ai crezut că ești în altul; <code>pwd</code> înainte de ștergere.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: usr merge, inode-uri, /proc/PID, sbin și bin, ierarhia pe RHEL">
        <p>
          <b>Usr merge.</b> Istoric, <code>/bin</code> și <code>/lib</code> conțineau utilitarele necesare pornirii (înainte de montarea lui <code>/usr</code>), iar <code>/usr/bin</code> restul. Cu initramfs și cu discuri mari, separarea nu mai are rost; distribuțiile au unit directoarele, păstrând căile vechi ca legături simbolice. Pe RHEL, <code>/bin → usr/bin</code>, <code>/sbin → usr/sbin</code>, <code>/lib → usr/lib</code>, <code>/lib64 → usr/lib64</code> (de verificat pe RHEL 10 cu <code>ls -ld</code>). O unire suplimentară a <code>/usr/sbin</code> în <code>/usr/bin</code> există în versiuni recente ale unor distribuții; dacă și cum se aplică pe RHEL 10 se confirmă pe sistemul tău.
        </p>
        <p>
          <b>Inode-uri.</b> Un fișier este de fapt un <i>inode</i> (metadate + indicatori către date); numele din director sunt doar intrări care trimit la inode. Un sistem de fișiere poate rămâne fără inode-uri (<code>df -i</code>) deși mai are spațiu. Legăturile hard și soft se explică pe această bază (L1.7).
        </p>
        <p>
          <b>/proc/PID.</b> Fiecare proces are un director <code>/proc/&lt;PID&gt;</code> cu fișiere precum <code>cmdline</code>, <code>status</code>, <code>environ</code>, <code>cwd</code> (legătură spre directorul curent al procesului) și <code>fd/</code> (fișierele deschise). Comenzi ca <code>ps</code> și <code>top</code> citesc aceste fișiere (M0.5).
        </p>
        <p>
          <b>/dev.</b> Directorul este populat automat (devtmpfs, cu udev). Numele pot fi instabile (<code>/dev/sda</code> poate deveni <code>/dev/sdb</code> la un alt boot); de aceea <code>fstab</code> folosește UUID sau etichete, iar <code>/dev/disk/by-uuid/</code> și <code>/dev/disk/by-id/</code> oferă nume stabile (L5.5).
        </p>
        <p>
          <b>Montarea peste un director ocupat.</b> Montarea ascunde conținutul anterior, dar nu îl șterge: poți vedea de dedesubt cu o montare „bind” a rădăcinii (mount --bind / /mnt/rad) — tehnică de diagnostic avansată.
        </p>
      </DeepDive>
    </>
  );
}

export const M0_4: TopicModule = {
  id: 'M0.4',
  subtitle: 'Arborele unic, FHS, cale absolută/relativă, punct de montare, pseudo-sisteme de fișiere, unde cauți configurări, log-uri și date',
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
  labs: [LAB_M0_4A, LAB_M0_4B],
  sources: [
    { kind: 'upstream', ref: 'hier(7) — Linux man-pages (man7.org/linux/man-pages/man7/hier.7.html), citit 2026-11-17' },
    { kind: 'upstream', ref: 'path_resolution(7) — Linux man-pages (man7.org), citit 2026-11-17' },
    { kind: 'upstream', ref: 'Filesystem Hierarchy Standard 3.0 (refspecs.linuxfoundation.org/FHS_3.0): acces refuzat (Anubis) la 2026-11-17; conținut din hier(7) și cunoștințe' },
    { kind: 'man', ref: 'df(1), du(1), findmnt(8), lsblk(8), file(1), stat(1), readlink(1), find(1), proc(5), tmpfiles.d(5), fstab(5)' },
    { kind: 'doc', ref: 'Red Hat Enterprise Linux 10 — documentația (docs.redhat.com): HTTP 403, necitită; de verificat la review' },
  ],
};
