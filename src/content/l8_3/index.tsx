import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L8_3A, LAB_L8_3B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Oamenii folosesc <b>nume</b> (<code>server1.example.com</code>), calculatoarele folosesc <b>adrese IP</b>. „Rezoluția numelor” este procesul prin care un nume devine o adresă. Pe Linux, aplicațiile întreabă mai întâi sistemul: ordinea surselor este în <G id="nsswitch"><code>/etc/nsswitch.conf</code></G> (de obicei <code>files</code> = <G id="etc-hosts"><code>/etc/hosts</code></G>, apoi <code>dns</code>). Serverele <G id="dns">DNS</G> sunt în <G id="resolv-conf"><code>/etc/resolv.conf</code></G>, fișier generat de NetworkManager pe baza profilului. Numele propriului sistem (<G id="hostname">hostname</G>) se schimbă cu <G id="hostnamectl"><code>hostnamectl</code></G>.
          </p>
          <p>Obiectivul oficial: <i>„Configure hostname resolution”</i>. Test universal: <code>getent hosts NUME</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: nume memorabile pentru adrese greu de ținut minte</h4>
          <p>
            Ai învățat în L8.1 că fiecare interfață are o adresă IP. Dar nimeni nu vrea să scrie <code>ssh 192.0.2.10</code> sau <code>mount 192.0.2.20:/export</code>; adresele se schimbă, numele rămân. Rezoluția numelor face legătura: tu scrii <code>server1</code>, sistemul află adresa.
          </p>
          <Analogy>
            Este ca agenda telefonică. Ai două moduri de a afla un număr: (1) <b>agenda ta personală</b> (<code>/etc/hosts</code> — rapidă, locală, dar o completezi tu pentru fiecare contact) și (2) <b>informații</b> (serviciul <code>DNS</code> — o bază uriașă, ținută de alții, la care ceri numărul). Fișierul <code>nsswitch.conf</code> spune în ce ordine le consulți: întâi agenda ta, apoi informații.
          </Analogy>

          <h4>Trei lucruri diferite, des confundate</h4>
          <Table head={['Concept', 'Întrebarea la care răspunde', 'Unde se configurează']} rows={[
            [<G id="hostname">Hostname</G>, 'Cum se numește ACEST sistem?', <><code>/etc/hostname</code>, <code>hostnamectl</code></>],
            [<G id="etc-hosts">/etc/hosts</G>, 'Ce adresă are numele X (răspuns scris local, de mână)?', <code>/etc/hosts</code>],
            [<G id="dns">DNS</G>, 'Ce adresă are numele X (răspuns de la un server)?', <><code>/etc/resolv.conf</code> (generat), profilul NetworkManager</>],
          ]} />
          <p>
            Și o a patra piesă care decide ordinea: <b><code>/etc/nsswitch.conf</code></b>.
          </p>

          <h4>Hostname scurt, domeniu, FQDN</h4>
          <p>
            Un nume complet, <G id="fqdn">FQDN</G>, are forma <code>server1.example.com</code>: <code>server1</code> este hostname-ul scurt, iar <code>example.com</code> este domeniul. Pe un sistem poți seta hostname-ul static ca nume scurt sau ca FQDN; la examen cerința spune de obicei exact ce nume să pui (de exemplu <code>server1.example.com</code>).
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Ce se întâmplă când o aplicație cere „server1”</h4>
          <ol>
            <li>Aplicația apelează o funcție din biblioteca C (de exemplu <code>getaddrinfo()</code> / <code>gethostbyname()</code>).</li>
            <li>Biblioteca (glibc) citește <code>/etc/nsswitch.conf</code>, linia <code>hosts:</code>, care listează <b>sursele în ordine</b>: de exemplu <code>files dns</code>.</li>
            <li>Prima sursă, <code>files</code>: caută numele în <code>/etc/hosts</code>. Dacă îl găsește, <b>se oprește</b> și returnează adresa.</li>
            <li>Dacă nu l-a găsit, trece la <code>dns</code>: citește <code>/etc/resolv.conf</code>, trimite o cerere către primul <code>nameserver</code> (portul 53); dacă nu răspunde, încearcă următorul; adaugă domeniile din <code>search</code> la nume scurte.</li>
            <li>Dacă nicio sursă nu răspunde, rezolvarea eșuează (în aplicație: „Name or service not known”).</li>
          </ol>
          <Callout kind="info" title="De ce contează ordinea">
            Cu <code>hosts: files dns</code>, o intrare din <code>/etc/hosts</code> <b>bate</b> DNS-ul: dacă pui <code>192.0.2.99 www.example.com</code>, sistemul tău va folosi acea adresă, indiferent ce spune DNS-ul. Acesta este și mecanismul din spatele multor „de ce merge la mine, dar nu la altul”.
          </Callout>

          <h4>2. /etc/hosts</h4>
          <p>
            Format (<code>hosts(5)</code>): o linie per adresă IP: <code>ADRESĂ  NUME-CANONIC  [ALIAS…]</code>. Separatorii sunt spații sau taburi; <code>#</code> începe un comentariu. Un host poate avea intrări distincte pentru IPv4 și IPv6. Modificările au efect imediat (programele care fac cache pot avea nevoie de repornire).
          </p>
          <CodeBlock title="/etc/hosts" kind="config" label="illustrative" code={`127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6

192.0.2.10    server1.example.com server1
192.0.2.20    nfs1.example.com nfs1
2001:db8:100::10  server1.example.com server1`} explain={[
            ['127.0.0.1 localhost …', 'loopback IPv4; „localhost” și alte alias-uri (conținut tipic RHEL, de confirmat pe RHEL 10).'],
            ['::1 localhost …', 'loopback IPv6.'],
            ['192.0.2.10 server1.example.com server1', 'adresă, nume canonic (FQDN) și alias scurt: ambele nume duc la 192.0.2.10.'],
            ['2001:db8:100::10 …', 'aceeași mașină, pe IPv6 (a doua intrare, pentru familia IPv6).'],
          ]} />

          <h4>3. /etc/nsswitch.conf</h4>
          <CodeBlock title="/etc/nsswitch.conf (extras)" kind="config" label="illustrative" code={`passwd:     files sss systemd
group:      files sss systemd
hosts:      files dns myhostname`} explain={[
            ['passwd / group', 'sursele pentru utilizatori și grupuri (nu fac parte din acest obiectiv).'],
            ['hosts: files dns myhostname', 'ordinea de rezolvare a numelor: întâi /etc/hosts, apoi DNS, apoi „myhostname” (modul NSS care răspunde pentru hostname-ul propriu). Linia exactă pe RHEL 10 trebuie confirmată.'],
          ]} />
          <p>
            Sursele se interoghează <b>de la stânga la dreapta</b> până când una dă un rezultat (<code>nsswitch.conf(5)</code>). Implicit: <code>success</code> → <code>return</code> (oprește), iar <code>notfound</code>, <code>unavail</code>, <code>tryagain</code> → <code>continue</code> (următoarea sursă). Se pot specifica acțiuni explicite, de exemplu <code>hosts: dns [!UNAVAIL=return] files</code>: DNS întâi; dacă DNS răspunde orice altceva decât „indisponibil”, se returnează imediat; doar dacă DNS e indisponibil se trece la fișier.
          </p>

          <h4>4. /etc/resolv.conf</h4>
          <CodeBlock title="/etc/resolv.conf" kind="config" label="illustrative" code={`# Generated by NetworkManager
search example.com
nameserver 192.0.2.53
nameserver 198.51.100.53`} explain={[
            ['# Generated by NetworkManager', 'antet: fișierul este generat; editarea manuală se pierde la următoarea schimbare de rețea.'],
            ['search example.com', 'domeniu adăugat la nume scurte: „server1” se încearcă și ca „server1.example.com”. Se folosește doar ultima linie search.'],
            ['nameserver …', 'serverele DNS, interogate în ordine; maximum 3 sunt folosite (resolv.conf(5)).'],
          ]} />
          <p className="small">
            Opțiuni din <code>resolv.conf(5)</code>: <code>options timeout:n</code> (secunde de așteptare per server, implicit 5), <code>attempts:n</code> (câte încercări, implicit 2), <code>ndots:n</code> (de la câte puncte un nume e tratat ca absolut, implicit 1). Pe un sistem gestionat de NetworkManager nu le configurezi de mână.
          </p>
          <Callout kind="warn" title="Pe RHEL, resolv.conf nu se editează">
            NetworkManager rescrie fișierul din setările profilurilor active. Calea corectă: <code>nmcli connection modify ID ipv4.dns 192.0.2.53 ipv4.dns-search example.com</code> și <code>nmcli connection up ID</code> (L8.2). Pe un sistem unde NetworkManager nu gestionează DNS-ul, regula poate diferi; la EX200 profilul este metoda sigură.
          </Callout>

          <h4>5. Cele trei tipuri de hostname</h4>
          <Table head={['Tip', 'Ce este (hostnamectl(1))', 'Unde']} rows={[
            ['static', 'numele configurat de administrator; caractere de nume de domeniu Internet', <><code>/etc/hostname</code></>],
            ['transient', 'nume de rezervă obținut din rețea (de exemplu DHCP) sau setat în kernel; nefolosit dacă există un nume static valid', 'kernel (memorie)'],
            ['pretty', 'nume liber, cu majuscule/spații („Serverul de test”)', <><code>/etc/machine-info</code></>],
          ]} />
          <p>
            Regulile de nume pentru static/transient: etichete DNS (litere mici ASCII, cifre, cratimă) sau FQDN cu puncte, <b>maximum 64 de caractere</b> (<code>hostnamectl(1)</code>). Fără opțiunile <code>--static/--transient/--pretty</code>, o schimbare setează toate cele trei.
          </p>
          <p>
            La boot, kernelul primește numele din <code>/etc/hostname</code> (prin systemd). Fișierul conține o singură linie: hostname-ul static. Dacă lipsește sau e gol, sistemul poate folosi un nume transient (de exemplu de la DHCP) sau implicit <code>localhost</code>.
          </p>

          <h4>6. Instrumente de interogare: cine respectă ce</h4>
          <Table head={['Comandă', 'Folosește nsswitch.conf (/etc/hosts)?', 'Folosește DNS?', 'Când o folosești']} rows={[
            [<code>getent hosts nume</code>, 'da', 'da (dacă files nu răspunde)', 'ce vor vedea aplicațiile'],
            [<code>ping nume</code>, 'da', 'da', 'conectivitate + rezolvare'],
            [<code>ssh nume</code>, 'da', 'da', 'aplicație reală'],
            [<code>dig nume</code>, 'NU', 'da (direct)', 'testezi DNS-ul, ocolind /etc/hosts'],
            [<code>host nume</code>, 'NU', 'da', 'interogare DNS simplă'],
            [<code>nslookup nume</code>, 'NU', 'da', 'interogare DNS interactivă'],
          ]} />
          <p className="small">
            <code>dig</code>, <code>host</code> și <code>nslookup</code> fac parte (pe RHEL) din pachetul <code>bind-utils</code> (de confirmat pe RHEL 10). Diferența dintre <code>getent</code> și <code>dig</code> explică situația clasică: „<code>dig</code> arată adresa corectă, dar <code>ping</code> merge la alta” — o intrare veche în <code>/etc/hosts</code> care are prioritate.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>NetworkManager (L8.2):</b> generează <code>/etc/resolv.conf</code> din <code>ipv4.dns</code>, <code>ipv6.dns</code> și <code>dns-search</code>; poate primi hostname-ul de la DHCP.</li>
            <li><b>IP și adrese (L8.1):</b> rezoluția numelor produce adrese; un nume care se rezolvă la o adresă greșită sau inaccesibilă pare „o problemă de rețea”.</li>
            <li><b>SSH, NFS, autofs, chrony (L1.11, L6.3, L6.4, L7.3):</b> toate pot folosi nume; dacă numele nu se rezolvă, serviciul eșuează înainte să existe conexiune.</li>
            <li><b>firewalld (L8.4):</b> DNS folosește portul 53 (UDP/TCP) spre exterior; un firewall care blochează acel trafic face ca rezolvarea să „expire”.</li>
            <li><b>systemd (C4):</b> <code>hostnamectl</code> comunică cu <code>systemd-hostnamed</code>; hostname-ul apare în prompt și în jurnal (L4.7).</li>
            <li><b>Autentificare și certificate:</b> certificatele TLS și Kerberos se bazează pe nume (FQDN) corecte.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La instalarea unui server: setezi un hostname/FQDN corect, necesar pentru certificate, loguri și monitorizare.</li>
            <li>Într-un laborator fără server DNS: pui nume → IP în <code>/etc/hosts</code> ca să poți folosi <code>server1</code> în loc de IP.</li>
            <li>Când vrei să forțezi temporar un nume către o altă adresă (testare înainte de migrare).</li>
            <li>Când un serviciu nu se conectează „după nume”: compari <code>getent</code> cu <code>dig</code>, verifici <code>nsswitch.conf</code> și <code>resolv.conf</code>.</li>
            <li>Examen: „set the hostname to <code>server1.example.com</code>”, „make <code>nfs1.example.com</code> resolve to <code>192.0.2.20</code>”, „configure DNS server <code>192.0.2.53</code>”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu pe o mașină de test, ca <code>student</code> cu <code>sudo</code>. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Numele și adresele sunt fictive (<code>example.com</code> este rezervat pentru documentație, RFC 2606).
        </Callout>

        <h4>1. Vezi hostname-ul</h4>
        <CodeBlock title="comenzi" code={`hostname\nhostname -s\nhostname -f\nhostnamectl\nhostnamectl --static\nhostnamectl --transient\ncat /etc/hostname`} explain={[
          ['hostname', 'afișează numele curent al sistemului (din kernel: cel transient/efectiv).'],
          ['hostname -s', '-s = short: doar prima etichetă (server1).'],
          ['hostname -f', '-f = FQDN: nume complet; folosește rezolvarea numelui, deci depinde de /etc/hosts sau DNS (de confirmat comportamentul pe RHEL 10).'],
          ['hostnamectl', 'status: hostname static, pretty, transient, ID mașină, boot ID, kernel, sistem de operare.'],
          ['--static / --transient', 'afișează doar tipul cerut.'],
          ['cat /etc/hostname', 'hostname-ul static, exact cum este scris (o linie).'],
        ]} />

        <h4>2. Setează hostname-ul</h4>
        <CodeBlock title="comenzi" code={`sudo hostnamectl hostname server1.example.com\nsudo hostnamectl set-hostname server1.example.com\nhostnamectl --static\ncat /etc/hostname\nhostname`} explain={[
          ['hostnamectl hostname NUME', 'forma din man page-ul hostnamectl(1) citit: fără scop setează static, transient și pretty (dacă este cazul).'],
          ['hostnamectl set-hostname NUME', 'forma tradițională folosită în documentația RHEL; în versiunile mai vechi de systemd era singura. Pe RHEL 10 una sau ambele funcționează (de confirmat); dacă una este respinsă, folosește cealaltă.'],
          ['hostnamectl --static', 'confirmă numele static scris.'],
          ['cat /etc/hostname', 'trebuie să conțină exact noul nume, pe o linie.'],
          ['hostname', 'confirmă numele curent din kernel (se schimbă imediat).'],
        ]} />
        <p>
          Efectul este <b>imediat</b> și <b>persistent</b> (scrie <code>/etc/hostname</code>). Promptul shell-ului deja deschis poate arăta numele vechi până la o nouă sesiune (<code>exec bash</code> sau login nou). Alternativa NetworkManager: <code>nmcli general hostname server1.example.com</code> (documentația nmcli: se stochează în <code>/etc/hostname</code> pe majoritatea distribuțiilor).
        </p>
        <CodeBlock title="doar tipuri anume" code={`sudo hostnamectl hostname --pretty "Serverul de test 1"\nsudo hostnamectl hostname --static server1.example.com\nhostnamectl`} explain={[
          ['--pretty "…"', 'setează doar numele „frumos” (liber, cu spații și majuscule), nu cel static.'],
          ['--static', 'setează doar numele static.'],
        ]} />
        <Callout kind="tip" title="Dacă hostnamectl respinge sintaxa">
          Versiunile de systemd diferă. Dacă <code>hostnamectl hostname NUME</code> nu este recunoscută, încearcă <code>set-hostname</code> și invers. La examen testezi o dată și te ții de forma care merge; verifici apoi cu <code>cat /etc/hostname</code> și <code>hostnamectl</code>.
        </Callout>

        <h4>3. /etc/hosts</h4>
        <CodeBlock title="comenzi" code={`sudo cp -a /etc/hosts /etc/hosts.orig\necho '192.0.2.20  nfs1.example.com nfs1' | sudo tee -a /etc/hosts\ngrep -v '^#' /etc/hosts\ngetent hosts nfs1\ngetent hosts nfs1.example.com\nping -c 2 nfs1`} explain={[
          ['cp -a /etc/hosts /etc/hosts.orig', 'copie de siguranță cu permisiunile păstrate.'],
          ["echo '…' | sudo tee -a /etc/hosts", 'adaugă linia la sfârșit: tee -a = append, iar sudo se aplică lui tee (o redirecționare simplă >> nu ar avea drepturi root).'],
          ['grep -v "^#"', 'afișează fișierul fără liniile de comentariu.'],
          ['getent hosts nfs1', 'arată ce adresă vor folosi aplicațiile pentru numele scurt (alias).'],
          ['ping -c 2 nfs1', 'testează numele ca aplicațiile (rezolvare prin NSS); poate eșua dacă adresa nu există în rețeaua ta, dar rezolvarea se vede în linia „PING nfs1 (192.0.2.20)”.'],
        ]} />
        <p>
          Poți edita și cu <code>sudo vi /etc/hosts</code>. Nu e nevoie de repornire: fișierul se citește la fiecare rezolvare (cu excepția programelor care fac cache).
        </p>

        <h4>4. DNS prin NetworkManager</h4>
        <CodeBlock title="comenzi" code={`nmcli connection show --active\nsudo nmcli connection modify lab-static ipv4.dns 192.0.2.53 ipv4.dns-search example.com\nsudo nmcli connection modify lab-static +ipv4.dns 198.51.100.53\nsudo nmcli connection up lab-static\ncat /etc/resolv.conf\nnmcli -g ipv4.dns,ipv4.dns-search connection show lab-static`} explain={[
          ['connection show --active', 'afli numele profilului activ pe care îl modifici.'],
          ['ipv4.dns / ipv4.dns-search', 'serverele DNS și domeniile de căutare în profil.'],
          ['+ipv4.dns', 'adaugă un al doilea server fără să-l pierzi pe primul.'],
          ['connection up', 'aplică; NetworkManager regenerează /etc/resolv.conf.'],
          ['cat /etc/resolv.conf', 'verifică rezultatul: linii nameserver și search.'],
        ]} />
        <p>
          Pentru DNS pe IPv6: <code>ipv6.dns 2001:db8:100::53</code>. Dacă profilul este pe DHCP (<code>ipv4.method auto</code>) și vrei să folosești doar serverul tău: <code>ipv4.ignore-auto-dns yes</code> (altfel DNS-urile DHCP se adaugă).
        </p>

        <h4>5. Testează rezolvarea</h4>
        <CodeBlock title="comenzi" code={`getent hosts server1\ngetent ahosts server1.example.com\ngetent ahostsv4 server1\nhost server1.example.com\ndig +short server1.example.com\ndig server1.example.com AAAA +short\ngrep '^hosts:' /etc/nsswitch.conf`} explain={[
          ['getent hosts NUME', 'rezolvare ca aplicațiile (files + dns); afișează o adresă și numele.'],
          ['getent ahosts / ahostsv4', 'ahosts afișează toate adresele (IPv4 și IPv6); ahostsv4 doar IPv4.'],
          ['host NUME', 'interogare DNS simplă (ocolește /etc/hosts).'],
          ['dig +short NUME', 'doar adresa din DNS, fără detalii; ocolește /etc/hosts.'],
          ['dig NUME AAAA +short', 'cere explicit înregistrarea AAAA (IPv6); A = IPv4.'],
          ["grep '^hosts:' /etc/nsswitch.conf", 'afișează ordinea surselor de rezolvare.'],
        ]} />

        <h4>6. Diagnostic complet al unei probleme de nume</h4>
        <CodeBlock title="comenzi" code={`getent hosts nfs1.example.com\necho "exit=$?"\ncat /etc/resolv.conf\ngrep '^hosts:' /etc/nsswitch.conf\ngrep nfs1 /etc/hosts\nping -c 1 192.0.2.53\ndig @192.0.2.53 nfs1.example.com +short`} explain={[
          ['echo "exit=$?"', 'codul de ieșire al lui getent: 0 = găsit; 2 = nu a găsit.'],
          ['cat /etc/resolv.conf', 'sunt serverele DNS corecte? Sunt în ordinea dorită?'],
          ['grep nfs1 /etc/hosts', 'există o intrare locală care suprascrie DNS-ul?'],
          ['ping -c 1 192.0.2.53', 'serverul DNS este accesibil?'],
          ['dig @SERVER NUME', '@SERVER întreabă direct un server DNS anume, ocolind resolv.conf: separă „serverul DNS nu știe” de „resolv.conf e greșit”.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="hostnamectl" kind="session" label="illustrative" code={`[student@server1 ~]$ hostnamectl
 Static hostname: server1.example.com
       Icon name: computer-vm
         Chassis: vm
      Machine ID: 4f9a0c1d2e3b4a5c8d7e6f5a4b3c2d1e
         Boot ID: 9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a
  Virtualization: kvm
Operating System: Red Hat Enterprise Linux 10.0 (Coughlan)
     CPE OS Name: cpe:/o:redhat:enterprise_linux:10::baseos
          Kernel: Linux 6.12.0-0.el10.x86_64
    Architecture: x86-64`} />
        <p className="small">
          <b>Static hostname</b>: numele din <code>/etc/hostname</code>. Dacă există și un nume transient diferit, apare o linie <b>Transient hostname</b>; dacă ai setat un nume pretty, apare <b>Pretty hostname</b>. Câmpurile <b>Machine ID</b> și <b>Boot ID</b> identifică mașina și boot-ul curent. Valorile (inclusiv versiunea de OS, kernelul și numele de cod) sunt fictive și pot diferi.
        </p>
        <CodeBlock title="getent hosts" kind="session" label="illustrative" code={`[student@server1 ~]$ getent hosts nfs1
192.0.2.20      nfs1.example.com nfs1
[student@server1 ~]$ getent hosts inexistent.example.com
[student@server1 ~]$ echo $?
2`} />
        <p className="small">
          Prima comandă: adresa și numele canonic urmat de alias; arată că regula din <code>/etc/hosts</code> a fost aplicată. A doua: nicio linie, iar codul de ieșire <code>2</code> înseamnă „nu s-a găsit” (<code>getent(1)</code>: 2 = cheia nu există în bază). Aplicațiile ar raporta „Name or service not known”.
        </p>
        <CodeBlock title="dig vs getent" kind="session" label="illustrative" code={`[student@server1 ~]$ dig +short www.example.com
198.51.100.80
[student@server1 ~]$ getent hosts www.example.com
192.0.2.99      www.example.com`} />
        <p className="small">
          Situație clasică: DNS-ul spune <code>198.51.100.80</code>, dar sistemul folosește <code>192.0.2.99</code>, pentru că <code>/etc/hosts</code> are o intrare pentru acel nume și <code>nsswitch.conf</code> consultă <code>files</code> înaintea lui <code>dns</code>. Soluție: șterge sau corectează linia din <code>/etc/hosts</code>.
        </p>
        <CodeBlock title="/etc/resolv.conf generat" kind="session" label="illustrative" code={`[student@server1 ~]$ cat /etc/resolv.conf
# Generated by NetworkManager
search example.com
nameserver 192.0.2.53
nameserver 198.51.100.53`} />
        <p className="small">
          Observă antetul „Generated by NetworkManager”: dacă adaugi aici o linie manual, o pierzi la următoarea activare a profilului. Cele două <code>nameserver</code> provin din <code>ipv4.dns</code> (L8.2); sunt interogate în ordine.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Hostname:</b> <code>hostnamectl --static</code> și <code>cat /etc/hostname</code> arată numele cerut; <code>hostname</code> la fel.</li>
            <li><b>/etc/hosts:</b> <code>grep nume /etc/hosts</code> găsește linia; <code>getent hosts nume</code> returnează adresa dorită.</li>
            <li><b>DNS:</b> <code>cat /etc/resolv.conf</code> conține serverele cerute; <code>nmcli -g ipv4.dns connection show ID</code> la fel.</li>
            <li><b>Ordinea:</b> <code>grep '^hosts:' /etc/nsswitch.conf</code> (files înaintea lui dns).</li>
            <li><b>Funcțional:</b> <code>ping -c 2 nume</code> arată adresa corectă în prima linie, chiar dacă ținta nu răspunde.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <b>Hostname:</b> <code>hostnamectl</code> scrie <code>/etc/hostname</code> → persistă. <code>hostname NUME</code> (fără hostnamectl) setează doar numele curent din kernel → <b>nu persistă</b>. <b>/etc/hosts:</b> fișier pe disc → persistă. <b>DNS:</b> persistă doar dacă este în <b>profilul</b> NetworkManager (<code>ipv4.dns</code>); o editare directă a <code>/etc/resolv.conf</code> se pierde.
          </p>
          <p>
            Confirmare manuală: după <code>sudo reboot</code>: <code>hostnamectl --static</code>, <code>getent hosts nume</code>, <code>cat /etc/resolv.conf</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<>„Name or service not known”</>, 'nicio sursă nu știe numele: nu e în /etc/hosts; DNS lipsă/inaccesibil', <><code>getent hosts nume; echo $?</code>, <code>cat /etc/resolv.conf</code></>, 'adaugă intrare în /etc/hosts sau corectează DNS-ul din profil'],
          ['dig găsește, ping nu (sau invers)', 'dig ocolește /etc/hosts și nsswitch', <><code>getent hosts</code> vs <code>dig +short</code>; <code>grep nume /etc/hosts</code></>, 'aliniază /etc/hosts cu DNS-ul sau șterge intrarea veche'],
          ['Numele se rezolvă la IP-ul vechi', 'intrare veche în /etc/hosts', <code>grep nume /etc/hosts</code>, 'corectează sau șterge linia'],
          ['/etc/resolv.conf revine la valoarea veche', 'este generat de NetworkManager', <code>head -3 /etc/resolv.conf</code>, <>setează DNS în profil: <code>nmcli con mod ID ipv4.dns …</code> + <code>up</code></>],
          ['Promptul arată hostname-ul vechi', 'sesiune deschisă înainte de schimbare', <code>hostname</code>, 'ieși și intră din nou sau exec bash'],
          ['Hostname revine la „localhost” după reboot', 'ai folosit hostname NUME (temporar) sau /etc/hostname gol', <code>cat /etc/hostname</code>, <><code>hostnamectl hostname NUME</code> (sau set-hostname)</>],
          ['DNS lent (secunde la fiecare cerere)', 'primul nameserver nu răspunde, expiră înainte de al doilea', <><code>cat /etc/resolv.conf</code>, <code>dig @primul nume</code></>, 'corectează sau reordonează serverele în profil'],
          ['Numele scurt nu se rezolvă, FQDN da', 'lipsește domeniul de căutare', <code>grep ^search /etc/resolv.conf</code>, <code>ipv4.dns-search example.com</code>],
          [<>hostnamectl respinge sintaxa</>, 'diferențe între versiunile systemd', <code>hostnamectl --help</code>, <>încearcă <code>set-hostname</code> sau <code>hostname</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Setezi hostname-ul cu <code>hostname NUME</code> și te bazezi pe el: nu persistă după reboot. Folosește <code>hostnamectl</code>.</>,
          <>Editezi <code>/etc/resolv.conf</code> în loc de profilul NetworkManager: se suprascrie.</>,
          <>Testezi doar cu <code>dig</code> și concluzionezi că „numele se rezolvă”: aplicațiile pot folosi altceva din <code>/etc/hosts</code>. Testează cu <code>getent</code>.</>,
          <>Scrii intrarea în <code>/etc/hosts</code> invers (nume apoi IP): formatul este IP apoi nume.</>,
          <>Uiți alias-ul scurt: cerința folosește <code>nfs1</code>, iar tu ai pus doar FQDN-ul.</>,
          <>Folosești <code>sudo echo … &gt;&gt; /etc/hosts</code>: redirecționarea se face de shell-ul tău, fără drepturi; folosește <code>sudo tee -a</code> sau un editor.</>,
          <>Pui nume cu majuscule sau caractere nepermise: hostname-ul static trebuie să fie litere mici, cifre, cratimă, puncte.</>,
          <>Uiți să aplici profilul după modificarea DNS (<code>nmcli connection up</code>).</>,
          <>Crezi că <code>nsswitch.conf</code> se editează des: e rar necesar; important este să știi să-l citești.</>,
          <>Presupui că <code>ping</code> eșuat = rezolvare eșuată: poate fi rezolvarea reușită, dar ținta nu răspunde. Verifică linia „PING nume (adresă)”.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: myhostname, systemd-resolved, înregistrări DNS și /etc/machine-info">
        <p>
          <b>myhostname:</b> modul NSS <code>nss-myhostname</code> răspunde pentru numele local al mașinii (și pentru <code>localhost</code>), chiar dacă nu există intrare în <code>/etc/hosts</code> sau DNS. Este motivul pentru care <code>ping $(hostname)</code> merge de obicei fără configurare suplimentară (de confirmat pe RHEL 10).
        </p>
        <p>
          <b>systemd-resolved:</b> pe unele distribuții, <code>/etc/resolv.conf</code> este o legătură către un stub (127.0.0.53) gestionat de <code>systemd-resolved</code>; <code>resolvectl</code> arată starea. Pe RHEL, implicit, NetworkManager scrie direct fișierul (de confirmat pe RHEL 10); lecția nu presupune systemd-resolved.
        </p>
        <p>
          <b>Tipuri de înregistrări DNS:</b> <code>A</code> (nume → IPv4), <code>AAAA</code> (nume → IPv6), <code>PTR</code> (adresă → nume, „reverse”), <code>CNAME</code> (alias către alt nume), <code>MX</code> (servere de poștă), <code>NS</code> (servere autoritare). <code>dig NUME TIP</code> alege tipul.
        </p>
        <p>
          <b>/etc/machine-info:</b> conține câmpuri precum <code>PRETTY_HOSTNAME=</code> și <code>TAGS=</code> (hostnamectl(1)); nu este necesar la examen.
        </p>
        <p>
          <b>Limite de nume:</b> hostnamectl: static/transient, maxim 64 de caractere (man page citit); în DNS, o etichetă are cel mult 63 de caractere și un nume complet cel mult 253 (RFC 1035; din cunoștințe).
        </p>
        <p>
          <b>Cache de nume:</b> glibc nu face cache de DNS; un serviciu separat (<code>nscd</code>, <code>sssd</code>, <code>systemd-resolved</code>) poate face. Dacă modifici DNS-ul și aplicația „vede” tot adresa veche, poate fi cache-ul aplicației.
        </p>
      </DeepDive>
    </>
  );
}

export const L8_3: TopicModule = {
  id: 'L8.3',
  subtitle: 'hostnamectl, /etc/hostname, /etc/hosts, nsswitch.conf, /etc/resolv.conf și DNS prin NetworkManager, getent/dig',
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
  labs: [LAB_L8_3A, LAB_L8_3B],
  sources: [
    { kind: 'man', ref: 'hostnamectl(1), hosts(5), nsswitch.conf(5), resolv.conf(5) — man7.org, citite 2026-11-16' },
    { kind: 'upstream', ref: 'nmcli (comanda general hostname) și nm-settings-nmcli (ipv4.dns, dns-search, ignore-auto-dns) — networkmanager.dev, citite 2026-11-16' },
    { kind: 'doc', ref: 'RHEL 10 — „Configure host identification and DNS resolution”, „Change a hostname by using hostnamectl” (docs.redhat.com): necitite (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
