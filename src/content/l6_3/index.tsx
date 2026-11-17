import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L6_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="nfs">NFS</G> (Network File System) permite unui calculator (<b>clientul</b>) să monteze un director aflat pe alt calculator (<b>serverul</b>), ca și cum ar fi un disc local. Pe client folosești aceeași comandă ca la discuri: <code>mount -t nfs server:/export /mnt/nfs</code>; o demontezi cu <code>umount /mnt/nfs</code>; pentru persistență pui o linie în <code>/etc/fstab</code>, cu opțiunea <code>_netdev</code>. Serverul decide ce partajează și cui (<code>/etc/exports</code>).
          </p>
          <p>Obiectivul oficial: <i>„Mount and unmount network file systems using NFS”</i> — adică rolul de <b>client</b>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un <G id="filesystem">sistem de fișiere</G> local trăiește pe un disc atașat unui singur calculator. Dar în practică mai multe servere au nevoie de aceleași date: directoarele home ale utilizatorilor, o arhivă de pachete, un director cu fișiere de configurare comune, backup-uri. Copierea manuală pe fiecare server duce la versiuni diferite și risipă de spațiu. Soluția: datele stau <b>într-un singur loc</b> (serverul NFS) și toți ceilalți le <b>montează prin rețea</b>.
          </p>
          <Analogy>
            Serverul NFS este o <b>bibliotecă publică</b>: cărțile (fișierele) stau într-un singur loc. Clienții sunt cititorii: fiecare vine cu „permisul” lui, iar bibliotecarul (serverul) decide cine are voie și ce poate face (doar citit sau și scris). Faptul că ai „montat” directorul înseamnă că ai deschis o fereastră către bibliotecă: arată ca un raft din casa ta, dar cărțile sunt în alt oraș.
          </Analogy>
          <h4>Termeni de bază</h4>
          <Table head={['Termen', 'Înțeles']} rows={[
            ['server NFS', 'calculatorul care are datele și le „exportă”'],
            [<G id="nfs-export">export</G>, 'un director de pe server declarat ca partajat, cu reguli de acces (în /etc/exports)'],
            ['client NFS', 'calculatorul care montează exportul; aici lucrezi tu la examen'],
            ['montare NFS', 'atașarea exportului la un director local (punct de montare), cu mount -t nfs'],
            ['server:/cale', 'forma în care se scrie sursa: nume sau IP al serverului, două puncte, calea exportată'],
          ]} />
          <h4>NFS față de alte metode de acces la fișiere pe rețea</h4>
          <Table head={['Metodă', 'Caracteristici', 'În acest curs']} rows={[
            ['NFS', 'montare transparentă, nativă Unix/Linux; permisiunile Unix se păstrează', 'da — obiectivul C6-2'],
            ['scp / sftp / rsync', 'copiere explicită între sisteme prin SSH', 'L4.10'],
            ['SMB/CIFS (Samba)', 'protocolul Windows', 'în afara v1'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Modelul client–server</h4>
          <p>
            Programul tău nu știe că fișierul este pe altă mașină. Când citește <code>/mnt/nfs/raport.txt</code>, kernelul recunoaște că acea cale aparține unui sistem de fișiere NFS și, în loc să citească un disc, <b>trimite o cerere prin rețea</b> serverului („dă-mi primii 64 KiB din fișierul X”). Serverul citește de pe discul lui și trimite răspunsul. La nivelul programului, rezultatul este identic cu o citire locală, doar mai lentă.
          </p>
          <ol>
            <li>Clientul rulează <code>mount -t nfs server:/export /mnt/nfs</code>.</li>
            <li>Programul <code>mount.nfs</code> (din <code>nfs-utils</code>) contactează serverul și negociază versiunea de protocol (implicit clientul încearcă <b>4.2</b> și coboară la o versiune suportată de server — <code>nfs(5)</code>).</li>
            <li>Serverul verifică <code>/etc/exports</code>: adresa clientului are voie? Cu ce opțiuni (<code>ro</code>/<code>rw</code>, <code>root_squash</code>, <code>sec=</code>)?</li>
            <li>Serverul răspunde cu un <i>identificator</i> al exportului; clientul îl atașează la punctul de montare.</li>
            <li>Operațiile ulterioare (citire, scriere, listare) sunt cereri RPC prin rețea, de obicei pe <b>TCP</b>, portul 2049 pentru NFSv4.</li>
          </ol>

          <h4>2. Versiuni NFS</h4>
          <Table head={['Versiune', 'Idei-cheie']} rows={[
            ['NFSv3', 'fără stare (stateless); mai multe servicii și porturi (rpcbind, mountd, lockd); comanda showmount funcționează'],
            ['NFSv4 / 4.1 / 4.2', 'cu stare (stateful); un singur port TCP 2049; securitate integrată (sec=krb5…); 4.2 este încercată prima de client'],
          ]} />
          <p className="small">Despre ce versiuni sunt activate implicit pe RHEL 10 nu am putut citi documentația (HTTP 403): verifică pe sistemul tău cu <code>findmnt</code> / <code>nfsstat -m</code> (coloana <code>vers=</code>).</p>

          <h4>3. „hard” și „soft”: ce se întâmplă când serverul nu răspunde</h4>
          <p>
            Rețelele cad, serverele se repornesc. Clientul trebuie să decidă ce face cu o operație care nu primește răspuns:
          </p>
          <Table head={['Opțiune', 'Comportament (nfs(5))', 'Risc']} rows={[
            [<><code>hard</code> (implicit)</>, 'cererile se reîncearcă la nesfârșit; programul „îngheață” până revine serverul', 'procese blocate (în starea D), dar fără date pierdute'],
            [<code>soft</code>, 'după retrans retransmisii, cererea eșuează cu eroare de I/O', 'pagina de manual avertizează că poate cauza coruperea silențioasă a datelor în anumite cazuri'],
          ]} />
          <p>
            Regula: pentru date importante rămâi la <code>hard</code> (implicit). <code>soft</code> este pentru accesul de citire neimportant, unde eroarea este preferabilă blocajului.
          </p>

          <h4>4. De ce NFS are nevoie de rețea ÎNAINTE de montare la boot</h4>
          <p>
            Un disc local este disponibil imediat. Un export NFS cere interfața de rețea configurată și serverul pornit. Dacă fstab încearcă să-l monteze prea devreme, montarea eșuează sau întârzie boot-ul. Opțiunea <code>_netdev</code> spune: „acest sistem de fișiere are nevoie de rețea; așteaptă să fie disponibilă” (<code>mount(8)</code>). În sistemele moderne, systemd tratează oricum NFS ca sistem de fișiere de rețea, dar <code>_netdev</code> rămâne practica recomandată și este ușor de verificat în enunț.
          </p>

          <h4>5. Utilizatori și permisiuni: UID, nu nume</h4>
          <p>
            Cu autentificarea implicită (<code>sec=sys</code>), clientul spune serverului „cererea vine de la UID 1000”. Serverul aplică permisiunile Unix pe baza <b>numărului</b> 1000, nu a numelui. Dacă pe client utilizatorul <code>ana</code> are UID 1000 și pe server UID 1000 aparține altcuiva, <code>ana</code> va avea drepturile acelei persoane. Concluzii: (1) UID-urile trebuie să coincidă între client și server pentru ca permisiunile să aibă sens; (2) ce vezi în <code>ls -l</code> pe client poate arăta un număr în loc de nume, dacă UID-ul nu există local.
          </p>
          <p>
            <b>root_squash:</b> pe server, implicit, <code>root</code> de pe client este mapat la un utilizator anonim (<code>nobody</code>), ca un administrator de pe un client să nu aibă drepturi de root pe date. Efect: un <code>sudo touch /mnt/nfs/f</code> dă <code>Permission denied</code>, deși ești root. Se poate dezactiva pe server cu <code>no_root_squash</code> (<code>exports(5)</code>), dar este o decizie de securitate.
          </p>

          <h4>6. Cum este afișat și gestionat un sistem NFS montat</h4>
          <p>
            Apare în <code>findmnt</code> și <code>df</code> cu tipul <code>nfs4</code> (sau <code>nfs</code>) și sursa <code>server:/export</code>. În <code>/proc/self/mountinfo</code> este înregistrat ca orice altă montare. La <code>umount</code> se aplică aceleași reguli (<code>busy</code>), plus situația specială a serverului inaccesibil (secțiunea de troubleshooting).
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Pachete (C2):</b> clientul are nevoie de <code>nfs-utils</code> (<code>mount.nfs</code>, <code>showmount</code>, <code>nfsstat</code>). Dacă lipsește, <code>dnf install nfs-utils</code> (L2.2).</li>
            <li><b>Rețea și nume (C8):</b> montezi după nume (<code>server1.example.com</code>) sau IP; numele trebuie rezolvat (/etc/hosts, DNS). Fără rețea, montarea nu merge.</li>
            <li><b>Firewall (C8, C10):</b> pe <b>server</b> trebuie permis serviciul NFS (<code>firewall-cmd --add-service=nfs</code>). Pe client nu se deschide nimic pentru montare simplă (conexiunea pleacă de la client).</li>
            <li><b>SELinux (C10):</b> pe server există booleene pentru exportul directoarelor (<code>nfs_export_all_rw</code> / <code>nfs_export_all_ro</code>); pe client, folosirea NFS pentru directoare home cere <code>use_nfs_home_dirs</code>. Doar menționate: detalii la C10. Dacă totul pare corect dar accesul e refuzat, verifică SELinux (<code>getenforce</code>).</li>
            <li><b>fstab și systemd (L5.5, L4.9):</b> linia fstab este transformată de systemd într-o unitate <code>.mount</code>; <code>_netdev</code> ordonează montarea după rețea.</li>
            <li><b>autofs (L6.4):</b> alternativă la montarea permanentă: se montează doar când accesezi directorul și se demontează după inactivitate.</li>
            <li><b>Permisiuni (L1.8, L6.5):</b> aceleași reguli rwx, dar evaluate de server pe baza UID/GID; vezi și <code>root_squash</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Directoare home centralizate: un utilizator are aceleași fișiere pe orice server (cu autofs, L6.4).</li>
            <li>Un director comun de configurări, scripturi sau pachete pentru mai multe servere.</li>
            <li>Mutarea backup-urilor pe un server de stocare dedicat.</li>
            <li>Examen: „montează exportul <code>/exports/data</code> de pe <code>server1</code> pe <code>/mnt/data</code>, persistent, doar citire”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile și nu oferă un server NFS">
          Pentru a exersa ai nevoie de <b>două sisteme proprii</b> (sau de un export pe același sistem, prin <code>localhost</code>). Platforma nu se conectează la niciun sistem. Output-urile sunt <b>Ilustrative</b>; <code>server1.example.com</code> și <code>192.0.2.10</code> sunt valori fictive (domeniu și adresă rezervate pentru documentație).
        </Callout>

        <h4>0. Pregătire pe client: pachetul și accesul la server</h4>
        <CodeBlock title="comenzi" code={`rpm -q nfs-utils\nsudo dnf install -y nfs-utils\nping -c 2 server1.example.com\ngetent hosts server1.example.com\nshowmount -e server1.example.com`} explain={[
          ['rpm -q nfs-utils', 'verifică dacă pachetul client este instalat; „is not installed” = trebuie instalat.'],
          ['dnf install -y nfs-utils', 'instalează clientul (-y = răspunde yes). Vezi C2.'],
          ['ping -c 2', 'testează rețeaua (-c 2 = două pachete).'],
          ['getent hosts', 'verifică rezolvarea numelui prin /etc/hosts sau DNS, exact ca aplicațiile.'],
          ['showmount -e HOST', '-e = --exports: cere serverului lista exporturilor și a clienților permiși (interoghează serviciul mount al serverului). Pe servere care oferă doar NFSv4 poate să nu răspundă; nu e semn de eroare (showmount(8)).'],
        ]} />

        <h4>1. Montare temporară: <code>mount -t nfs</code></h4>
        <CodeBlock title="comenzi" code={`sudo mkdir -p /mnt/nfs\nsudo mount -t nfs server1.example.com:/exports/data /mnt/nfs\nsudo mount -t nfs -o ro server1.example.com:/exports/data /mnt/nfs\nsudo mount -t nfs -o vers=4.2,ro,noexec,nosuid server1.example.com:/exports/data /mnt/nfs\nsudo mount -t nfs -o hard,timeo=600,retrans=2 192.0.2.10:/exports/data /mnt/nfs`} explain={[
          ['mkdir -p /mnt/nfs', 'punctul de montare trebuie să existe.'],
          ['-t nfs', 'tipul sistemului de fișiere; pe RHEL, mount alege automat negocierea de versiune (4.2 prima).'],
          ['server1.example.com:/exports/data', 'SURSA: nume (sau IP) + : + calea exportată de server (exact cum apare în showmount -e / /etc/exports).'],
          ['/mnt/nfs', 'directorul local unde apare conținutul.'],
          ['-o ro', 'read-only; rw (citire/scriere) este implicit dacă serverul permite.'],
          ['vers=4.2', 'forțează versiunea de protocol; dacă serverul nu o suportă, montarea EȘUEAZĂ (nfs(5)). nfsvers= este sinonim.'],
          ['noexec,nosuid', 'opțiuni generice (mount(8)): nu permit execuția de programe, respectiv ignoră biții setuid/setgid de pe acest sistem. Reduc riscul.'],
          ['hard', 'implicit; cererile se reîncearcă la nesfârșit.'],
          ['timeo=600', 'cât așteaptă clientul răspuns înainte de reîncercare, în zecimi de secundă (600 = 60 s).'],
          ['retrans=2', 'numărul de retransmisii înainte de acțiuni suplimentare (implicit 2 pe TCP).'],
          ['192.0.2.10', 'serverul poate fi dat și prin IP.'],
        ]} />

        <h4>2. Folosește și verifică</h4>
        <CodeBlock title="comenzi" code={`df -hT /mnt/nfs\nfindmnt /mnt/nfs\nfindmnt -t nfs,nfs4\nmount | grep nfs\nnfsstat -m\nls -l /mnt/nfs\ntouch /mnt/nfs/test.txt`} explain={[
          ['df -hT', 'tip (nfs4) și spațiul raportat de server.'],
          ['findmnt /mnt/nfs', 'sursa (server:/export), tipul și opțiunile efective (vers=, proto=, sec=, hard, rsize, wsize …).'],
          ['findmnt -t nfs,nfs4', 'toate montările NFS.'],
          ['nfsstat -m', 'afișează montările NFS cu opțiunile efective; util pentru a vedea ce versiune a fost negociată.'],
          ['touch', 'încercare de scriere; eșuează cu „Read-only file system” dacă montarea este ro sau dacă serverul exportă ro; cu „Permission denied” din cauza UID/root_squash.'],
        ]} />

        <h4>3. Demontare: <code>umount</code></h4>
        <CodeBlock title="comenzi" code={`cd /\nsudo umount /mnt/nfs\nsudo umount server1.example.com:/exports/data\nsudo umount -f /mnt/nfs\nsudo umount -l /mnt/nfs\nsudo umount -a -t nfs,nfs4`} explain={[
          ['umount /mnt/nfs', 'demontare normală; „target is busy” dacă ceva îl folosește (cd /, închide procesele).'],
          ['umount server:/export', 'se poate da și sursa.'],
          ['-f', '--force: pentru un server inaccesibil. Nu garantează că umount nu se blochează (umount(8)).'],
          ['-l', '--lazy: detașează acum, curăță când nu mai e folosit; pe sisteme de rețea poate cere reboot curând și remontarea poate să nu mai fie posibilă. Ultimă soluție.'],
          ['-a -t nfs,nfs4', 'toate montările de tip nfs/nfs4. Atenție: tipul din umount poate diferi de cel din fstab (nfs vs nfs4).'],
        ]} />

        <h4>4. Montare persistentă: <code>/etc/fstab</code></h4>
        <CodeBlock title="/etc/fstab (extras, Ilustrativ)" kind="config" code={`server1.example.com:/exports/data  /mnt/nfs  nfs  defaults,_netdev  0 0\nserver1.example.com:/exports/ro    /mnt/ro   nfs  ro,_netdev,noexec,nosuid  0 0\n192.0.2.10:/exports/backup         /backup   nfs  vers=4.2,_netdev,x-systemd.mount-timeout=30  0 0`} explain={[
          ['server1.example.com:/exports/data', 'sursa NFS (câmpul 1).'],
          ['/mnt/nfs', 'punctul de montare (câmpul 2); directorul trebuie să existe.'],
          ['nfs', 'tipul (câmpul 3). nfs(5) spune că tipul nfs4 în fstab este deprecat; foloseți nfs și, dacă e nevoie, vers=4.2.'],
          ['defaults,_netdev', 'opțiuni (câmpul 4): defaults = rw, suid, dev, exec, auto, nouser, async; _netdev = așteaptă rețeaua.'],
          ['ro,noexec,nosuid', 'opțiuni suplimentare de restricție.'],
          ['x-systemd.mount-timeout=30', 'opțiune systemd (prefixul x-): timpul maxim de așteptare la montare. Menționată pentru completitudine; nu a fost citită în sursa oficială în această sesiune.'],
          ['0 0', 'câmpurile dump și pass; pentru NFS sunt nefolosite (nfs(5): „unused by NFS”).'],
        ]} />
        <CodeBlock title="testează fstab" kind="session" code={`sudo systemctl daemon-reload\nsudo mount -a\nfindmnt /mnt/nfs`} explain={[
          ['systemctl daemon-reload', 'systemd regenerează unitățile .mount din fstab.'],
          ['mount -a', 'montează tot ce este în fstab și nu e deja montat; erorile apar acum, nu la boot.'],
          ['findmnt', 'confirmă.'],
        ]} />

        <h4>5. Pe scurt, pe server (doar pentru laborator; nu este obiectivul)</h4>
        <CodeBlock title="/etc/exports (server)" kind="config" code={`/exports/data   192.0.2.0/24(rw,sync)\n/exports/ro     *(ro)`} explain={[
          ['/exports/data', 'directorul exportat.'],
          ['192.0.2.0/24', 'clienții permiși (rețea); poți pune nume, IP sau *.'],
          ['(rw,sync)', 'opțiuni lipite de client, fără spațiu: rw = scriere permisă (altfel citire); sync = răspunde după scrierea pe disc (implicit). root_squash este implicit.'],
        ]} />
        <CodeBlock title="pe server" code={`sudo dnf install -y nfs-utils\nsudo systemctl enable --now nfs-server\nsudo exportfs -ra\nsudo exportfs -v\nsudo firewall-cmd --permanent --add-service=nfs\nsudo firewall-cmd --reload`} explain={[
          ['systemctl enable --now nfs-server', 'pornește serverul acum și la fiecare boot.'],
          ['exportfs -ra', 'reciteste /etc/exports și aplică (exports(5): „run exportfs -ra”).'],
          ['exportfs -v', 'afișează exporturile active cu opțiunile.'],
          ['firewall-cmd --add-service=nfs', 'permite NFS prin firewall (C8/C10).'],
        ]} />
        <p className="small">Pasul 5 nu face parte din obiectivul oficial C6-2 (care vorbește doar despre montare/demontare); îl găsești aici ca să poți construi propriul mediu de test.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="showmount -e" kind="session" label="illustrative" code={`[student@client1 ~]$ showmount -e server1.example.com\nExport list for server1.example.com:\n/exports/data 192.0.2.0/24\n/exports/ro   *`} />
        <p className="small">
          Prima coloană: calea exportată (aceasta este cea care urmează după <code>:</code> în comanda <code>mount</code>). A doua: clienții permiși: o rețea, un nume, sau <code>*</code> = oricine. Nu afișează opțiunile <code>rw</code>/<code>ro</code>.
        </p>
        <CodeBlock title="findmnt" kind="session" label="illustrative" code={`[student@client1 ~]$ findmnt /mnt/nfs\nTARGET   SOURCE                            FSTYPE OPTIONS\n/mnt/nfs server1.example.com:/exports/data nfs4   rw,relatime,vers=4.2,rsize=1048576,wsize=1048576,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.0.2.20,local_lock=none,addr=192.0.2.10`} />
        <p className="small">
          <code>SOURCE</code> = server:export. <code>FSTYPE nfs4</code> = montarea folosește protocol NFSv4. <code>vers=4.2</code> = versiunea negociată. <code>rsize/wsize=1048576</code> = 1 MiB per cerere (maximul clientului Linux; <code>nfs(5)</code>). <code>hard</code> = comportamentul implicit la eșec. <code>proto=tcp</code>; <code>sec=sys</code> = autentificare după UID/GID; <code>timeo</code> și <code>retrans</code> = temporizarea reîncercărilor; <code>addr=</code> = adresa serverului; <code>clientaddr=</code> = adresa clientului. Listele exacte diferă între versiuni.
        </p>
        <CodeBlock title="eroare de montare: acces refuzat" kind="session" label="illustrative" code={`[student@client1 ~]$ sudo mount -t nfs server1.example.com:/exports/data /mnt/nfs\nmount.nfs: access denied by server while mounting server1.example.com:/exports/data`} />
        <p className="small">
          Serverul a respins clientul: adresa lui nu este în <code>/etc/exports</code> sau calea nu este exportată. Diagnostic: <code>showmount -e server</code> (de pe client) și <code>exportfs -v</code> (pe server). Textul exact poate varia.
        </p>
        <CodeBlock title="scriere refuzată (root_squash)" kind="session" label="illustrative" code={`[student@client1 ~]$ sudo touch /mnt/nfs/test.txt\ntouch: cannot touch '/mnt/nfs/test.txt': Permission denied\n[student@client1 ~]$ ls -ld /mnt/nfs\ndrwxr-xr-x. 2 nobody nobody 4096 Nov 16 10:00 /mnt/nfs`} />
        <p className="small">
          Chiar ca root, ești mapat la utilizatorul anonim (<code>root_squash</code>), iar directorul exportat nu permite scrierea „altora”. <code>nobody</code> este proprietarul afișat dacă UID-ul de pe server nu corespunde unui utilizator local. Soluția este pe <b>server</b> (permisiuni/UID corecte), nu pe client.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Montat:</b> <code>findmnt /mnt/nfs</code> arată o linie cu FSTYPE <code>nfs4</code> (sau <code>nfs</code>) și SOURCE <code>server:/export</code>.</li>
            <li><b>Spațiu:</b> <code>df -hT /mnt/nfs</code> arată dimensiunea discului <i>serverului</i>, nu a clientului.</li>
            <li><b>Opțiuni:</b> <code>findmnt -o TARGET,OPTIONS /mnt/nfs</code> pentru <code>ro</code>, <code>vers=</code>, <code>hard</code>.</li>
            <li><b>Acces:</b> <code>ls /mnt/nfs</code> listează fișierele serverului; <code>touch</code> reușește doar dacă ai voie să scrii.</li>
            <li><b>Persistență:</b> <code>sudo mount -a</code> fără erori; după <code>umount</code> + <code>mount -a</code> montarea revine.</li>
            <li><b>Demontat:</b> <code>findmnt /mnt/nfs</code> nu mai afișează nimic.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <code>mount</code> nu persistă. Linia din <code>/etc/fstab</code> cu <code>_netdev</code> o face persistentă. Confirmare manuală: <code>sudo reboot</code>, apoi <code>findmnt /mnt/nfs</code>. Dacă serverul NFS lipsește la boot și nu ai pus <code>nofail</code> sau <code>x-systemd.mount-timeout</code>, boot-ul poate fi întârziat sau poate intra în emergency mode (comportamentul exact depinde de configurare). Pe examen, testează cu <code>mount -a</code> înainte de a termina.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>mount: … bad option; for several filesystems (e.g. nfs, cifs) you might need a /sbin/mount.&lt;type&gt; helper program</code>, 'pachetul nfs-utils lipsește', <code>rpm -q nfs-utils</code>, <code>dnf install nfs-utils</code>],
          [<code>mount.nfs: access denied by server</code>, 'client neautorizat în /etc/exports sau cale neexportată', <><code>showmount -e server</code> (client), <code>exportfs -v</code> (server)</>, 'corectează exports + exportfs -ra'],
          [<><code>mount.nfs: No route to host</code> / <code>Connection timed out</code></>, 'rețea, firewall pe server sau server oprit', <><code>ping</code>, <code>systemctl status nfs-server</code> (server), <code>firewall-cmd --list-services</code> (server)</>, <>deschide serviciul <code>nfs</code> în firewall, pornește serverul</>],
          [<code>mount.nfs: Failed to resolve server …</code>, 'nume nerezolvabil', <code>getent hosts server</code>, 'corectează DNS//etc/hosts sau folosește IP'],
          [<code>mount.nfs: mounting … failed, reason given by server: No such file or directory</code>, 'calea exportată nu există/nu e exportată exact', <code>showmount -e</code>, 'folosește calea exactă din exports'],
          [<><code>mount.nfs: Protocol not supported</code> / eșec cu <code>vers=</code></>, 'versiunea cerută nu este oferită de server', <code>nfsstat -m</code>, 'scoate vers= sau alege una suportată'],
          [<><code>Permission denied</code> la scriere</>, 'root_squash, UID diferit sau permisiuni pe server', <><code>ls -ldn</code>, <code>id</code></>, 'corectează permisiunile/UID pe server (L6.5)'],
          [<code>Read-only file system</code>, 'export ro sau montare cu ro', <code>findmnt -o OPTIONS</code>, 'remontează rw dacă serverul permite'],
          [<code>umount: target is busy</code>, 'proces în montare', <><code>cd /</code>, <code>lsof +D</code></>, 'închide procesele; -f/-l în ultimă instanță'],
          [<code>Stale file handle</code>, 'exportul s-a schimbat/mutat pe server', <code>ls /mnt/nfs</code>, <><code>umount -f</code> / <code>-l</code>, apoi remontează</>],
          ['Boot lent sau emergency mode după editarea fstab', 'server NFS indisponibil la boot, linie greșită', <code>journalctl -b</code>, <>adaugă <code>_netdev</code> / <code>nofail</code>; corectează linia</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți să instalezi <code>nfs-utils</code>.</>,
          <>Greșești sintaxa sursei: <code>server /exports/data</code> (cu spațiu) în loc de <code>server:/exports/data</code> (cu două puncte, fără spațiu).</>,
          <>Montezi o cale care nu este exportată exact; verifică cu <code>showmount -e</code>.</>,
          <>Uiți <code>mkdir</code> pentru punctul de montare.</>,
          <>Uiți <code>_netdev</code> în fstab și boot-ul se blochează când rețeaua nu e gata.</>,
          <>Pui <code>soft</code> „ca să nu se blocheze” pe date importante.</>,
          <>Crezi că <code>chmod</code>/<code>chown</code> ca root pe client schimbă ceva pe un export cu <code>root_squash</code>.</>,
          <>Depinzi de <code>showmount -e</code> pe un server doar NFSv4 (poate să nu răspundă).</>,
          <>Încerci să demontezi cu shell-ul în directorul montat.</>,
          <>Uiți <code>mount -a</code> după editarea fstab.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: protocoale, porturi, securitate și comportament de cache">
        <p>
          <b>Porturi:</b> NFSv4 folosește TCP 2049. NFSv3 mai folosește <code>rpcbind</code> (111) și serviciile <code>mountd</code>/<code>statd</code>/<code>lockd</code> pe porturi suplimentare; de aceea firewall-ul pentru v3 este mai complex. Detaliile pe RHEL 10 sunt de confirmat în documentație (necitită).
        </p>
        <p>
          <b>Securitate (<code>sec=</code>):</b> <code>nfs(5)</code> listează <code>none</code>, <code>sys</code>, <code>krb5</code>, <code>krb5i</code>, <code>krb5p</code>. <code>sys</code> = autentificare prin UID/GID declarat de client (fără verificare criptografică): oricine controlează un client poate pretinde orice UID. <code>krb5</code> adaugă autentificare Kerberos, <code>krb5i</code> integritate, <code>krb5p</code> confidențialitate. Kerberos nu face parte din obiectiv.
        </p>
        <p>
          <b>Cache și consistență:</b> clientul păstrează în cache atributele fișierelor; modificările făcute de alt client pot apărea cu întârziere. Opțiunile <code>noac</code>, <code>actimeo=</code> controlează asta (nfs(5)); sunt informative.
        </p>
        <p>
          <b>Blocări (locking):</b> NFSv4 integrează blocările în protocol; la v3 există <code>lockd</code>. Opțiunea <code>nolock</code> dezactivează blocările și apare în exemple din <code>nfs(5)</code> pentru exporturi read-only.
        </p>
        <p>
          <b>Montări „bind” și niveluri:</b> un export poate conține subdirectoare; clientul poate monta doar ce este exportat explicit. Pe NFSv4, <code>fsid=0</code>/<code>root</code> marchează rădăcina pseudo-sistemului de fișiere (<code>exports(5)</code>).
        </p>
      </DeepDive>
    </>
  );
}

export const L6_3: TopicModule = {
  id: 'L6.3',
  subtitle: 'mount -t nfs, umount, /etc/fstab (_netdev), showmount -e, opțiuni NFS (vers, hard/soft, ro)',
  studyTime: '≈100 min studiu + laborator',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când o folosim', code: '5' },
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
  labs: [LAB_L6_3],
  sources: [
    { kind: 'man', ref: 'nfs(5), exports(5), showmount(8), mount(8), umount(8) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'nfsstat(8), exportfs(8), mount.nfs(8) — din cunoștințe, nerecitite' },
    { kind: 'doc', ref: 'RHEL 10 — „Mounting NFS shares” (storage-mounting_nfs_shares, în „Share and access network storage”), docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
