import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L8_2A, LAB_L8_2B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pe RHEL, rețeaua este gestionată de <G id="networkmanager">NetworkManager</G>. Configurația nu se face direct pe interfață, ci într-un <G id="nm-connection">profil de conexiune</G> (nume, interfață, adrese, gateway, DNS, autoconnect), pe care îl editezi cu <G id="nmcli"><code>nmcli</code></G>. Rețeta pentru o adresă statică: <code>nmcli connection modify ID ipv4.method manual ipv4.addresses A/P ipv4.gateway G ipv4.dns D</code>, apoi <code>nmcli connection up ID</code>. La fel pentru IPv6 cu <code>ipv6.*</code>.
          </p>
          <p>Obiectivul oficial: <i>„Configure IPv4 and IPv6 addresses”</i>. Modificările din profil sunt <b>persistente</b>; trebuie doar aplicate (<code>connection up</code>) și verificate.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>De ce nu configurăm direct interfața?</h4>
          <p>
            Cu comenzi ca <code>ip addr add</code> poți pune imediat o adresă pe o interfață, dar efectul este doar în memoria kernelului: la reboot dispare. Un sistem real are nevoie ca rețeaua să fie (1) <b>configurată o singură dată</b>, (2) <b>repornită automat</b> la boot, (3) <b>adaptată la schimbări</b> (cablu scos, Wi-Fi, VPN, reînnoirea DHCP). Acest lucru îl face <G id="networkmanager">NetworkManager</G>, un serviciu (daemon) care rulează permanent.
          </p>

          <h4>Dispozitiv și profil: două obiecte distincte</h4>
          <Table head={['Obiect', 'Ce este', 'Exemplu', 'Comandă']} rows={[
            [<G id="nm-device">device</G>, 'interfața văzută de NetworkManager (hardware sau virtuală); are stare', <code>enp1s0</code>, <code>nmcli device status</code>],
            [<G id="nm-connection">connection</G>, 'profilul: setări salvate (nume/ID, UUID, tip, interfață, IP, DNS, autoconnect)', <>„Wired connection 1”, „lab-static”</>, <code>nmcli connection show</code>],
          ]} />
          <Analogy>
            Dispozitivul este o <b>priză</b> pe perete; profilul este <b>aparatul cu setările lui</b> (încărcător, lampă). Pe aceeași priză poți avea mai multe aparate pregătite, dar într-un moment dat este conectat unul singur. La fel, un dispozitiv poate avea mai multe profiluri (acasă, la birou), dar are <b>unul activ</b>.
          </Analogy>
          <p>
            Un profil se leagă de un dispozitiv prin <code>connection.interface-name</code> (alias <code>ifname</code>). Dacă nu este setat, profilul poate fi folosit pe orice dispozitiv de tipul potrivit.
          </p>

          <h4>Unde sunt profilurile?</h4>
          <p>
            Fiecare profil este un fișier text în <code>/etc/NetworkManager/system-connections/</code> (<G id="nm-keyfile">format keyfile</G>, extensia <code>.nmconnection</code>), cu proprietar <code>root</code> și permisiuni <code>0600</code>. În versiunile mai vechi de RHEL existau fișiere <code>ifcfg-*</code> în <code>/etc/sysconfig/network-scripts/</code>; pe RHEL 10 formatul keyfile este cel folosit (de confirmat la review). Nu editezi aceste fișiere de mână în mod normal: <code>nmcli</code> le scrie corect.
          </p>
          <Callout kind="info" title="Ce cere examenul">
            Pe EX200 ți se cere de obicei: „configurează interfața cu adresa X/P, gateway-ul G și DNS-ul D, astfel încât să persiste după reboot”. Instrumentul natural este <code>nmcli</code>; <code>nmtui</code> (interfața text) este o alternativă acceptabilă, dar mai lentă. Rezultatul contează: configurația trebuie să fie în profil și activă.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Sintaxa proprietăților: setare.proprietate</h4>
          <p>
            Setările unui profil sunt grupate pe categorii („setting”), iar fiecare are proprietăți. Le scrii <code>setare.proprietate valoare</code>. Cele pe care trebuie să le știi:
          </p>
          <Table head={['Proprietate', 'Alias', 'Ce face']} rows={[
            [<code>connection.id</code>, <code>con-name</code>, 'numele profilului (ID)'],
            [<code>connection.type</code>, <code>type</code>, <>tipul (<code>ethernet</code>, <code>wifi</code>, <code>bridge</code>…)</>],
            [<code>connection.interface-name</code>, <code>ifname</code>, 'interfața pe care se aplică profilul'],
            [<code>connection.autoconnect</code>, <code>autoconnect</code>, 'dacă se activează automat (implicit yes)'],
            [<G id="ipv4-method"><code>ipv4.method</code></G>, '—', <><code>auto</code> (DHCP), <code>manual</code> (static), <code>disabled</code>, <code>link-local</code>, <code>shared</code></>],
            [<code>ipv4.addresses</code>, <code>ip4</code>, <>adresele cu prefix: <code>192.0.2.10/24</code>; mai multe separate prin virgulă</>],
            [<code>ipv4.gateway</code>, <code>gw4</code>, 'gateway-ul implicit (ruta default)'],
            [<code>ipv4.dns</code>, '—', 'serverele DNS (listă)'],
            [<code>ipv4.dns-search</code>, '—', 'domeniile de căutare'],
            [<code>ipv4.ignore-auto-dns</code>, '—', <>cu <code>method auto</code>: ignoră DNS-ul primit prin DHCP</>],
            [<code>ipv4.never-default</code>, '—', 'profilul nu primește niciodată ruta default'],
            [<code>ipv6.method</code>, '—', <><code>auto</code> (SLAAC/DHCPv6), <code>dhcp</code>, <code>manual</code>, <code>link-local</code>, <code>ignore</code>, <code>disabled</code>, <code>shared</code></>],
            [<code>ipv6.addresses</code>, <code>ip6</code>, <>ex. <code>2001:db8:100::10/64</code></>],
            [<code>ipv6.gateway</code>, <code>gw6</code>, 'gateway-ul IPv6'],
            [<code>ipv6.dns</code>, '—', 'servere DNS IPv6'],
          ]} />
          <p className="small">
            Sursa: documentația NetworkManager (<code>nm-settings-nmcli</code>). <code>method manual</code> cere <b>cel puțin o adresă</b> în <code>addresses</code>; <code>gateway</code> are sens doar dacă există adrese; <code>gateway</code> este ignorat dacă <code>never-default</code> este adevărat. Numele pot fi abreviate dacă sunt unice (de exemplu <code>ipv4.addr</code>), dar la examen e mai sigur să scrii numele complet.
          </p>

          <h4>2. modify vs up: modificarea nu aplică singură</h4>
          <p>
            <code>nmcli connection modify</code> schimbă <b>profilul salvat</b> pe disc, dar nu reconfigurează automat interfața activă. Pentru a aplica, <b>reactivezi</b> profilul cu <code>nmcli connection up ID</code> (sau, pentru unele schimbări pe o conexiune activă, <code>nmcli device reapply IFNAME</code>; documentația notează că unele proprietăți nu pot fi schimbate pe un dispozitiv conectat). Succesiunea tipică este deci: <b>modify → up → verificare</b>.
          </p>
          <Table head={['Comandă', 'Efect pe profil (disc)', 'Efect pe interfață (acum)']} rows={[
            [<code>nmcli con modify …</code>, 'da, persistent', 'nu, până la up/reapply'],
            [<code>nmcli con up ID</code>, '—', 'aplică profilul curent'],
            [<code>nmcli device reapply IF</code>, '—', 'reaplică schimbările pe conexiunea activă (fără reactivare completă)'],
            [<code>nmcli con modify --temporary …</code>, 'nu (doar în memorie)', 'pentru testare'],
            [<code>ip addr add …</code>, 'nu', 'da, dar NetworkManager poate reveni la profil; se pierde la reboot'],
          ]} />

          <h4>3. Operatorii + și − pentru proprietăți cu mai multe valori</h4>
          <p>
            Proprietăți ca <code>ipv4.addresses</code> și <code>ipv4.dns</code> sunt liste. Dacă scrii <code>ipv4.dns 192.0.2.53</code>, <b>înlocuiești</b> toată lista. Pentru a <b>adăuga</b> un element la listă, pui <code>+</code> în fața proprietății (<code>+ipv4.dns 198.51.100.53</code>); pentru a <b>elimina</b>, <code>-</code> (<code>-ipv4.dns 198.51.100.53</code>). O valoare goală (<code>""</code>) resetează proprietatea la implicit.
          </p>
          <Callout kind="warn" title="Capcana clasică: înlocuire în loc de adăugare">
            Dacă adresa mai are o adresă secundară și rulezi <code>ipv4.addresses 192.0.2.20/24</code> fără <code>+</code>, <b>pierzi</b> adresa primară anterioară. Verifică întotdeauna cu <code>nmcli -g ipv4.addresses connection show ID</code> sau <code>ip -br addr</code>.
          </Callout>

          <h4>4. De unde vine DNS-ul</h4>
          <p>
            NetworkManager generează <code>/etc/resolv.conf</code> din setările profilurilor active (L8.3). De aceea serverul DNS se pune în profil (<code>ipv4.dns</code>), nu direct în <code>/etc/resolv.conf</code>. Cu <code>method auto</code>, DNS-ul vine implicit prin DHCP; dacă vrei să-l impui manual, folosești <code>ipv4.dns … ipv4.ignore-auto-dns yes</code>.
          </p>

          <h4>5. IPv6: SLAAC, DHCPv6 sau manual</h4>
          <Table head={['ipv6.method', 'Ce înseamnă', 'Când']} rows={[
            [<code>auto</code>, 'SLAAC din Router Advertisement; plus DHCPv6 dacă routerul o cere', 'implicit; rețele cu router IPv6'],
            [<code>dhcp</code>, 'adresă și prefix doar de la un server DHCPv6; fără rută/gateway (limitat la subrețea)', 'rețele fără RA'],
            [<code>manual</code>, 'adresă statică; cere cel puțin o adresă în ipv6.addresses', 'cerință de examen'],
            [<code>link-local</code>, 'doar fe80::', 'segment izolat'],
            [<code>ignore</code>, 'NetworkManager nu face nimic pe IPv6 la acest profil', 'IPv6 gestionat altfel'],
            [<code>disabled</code>, 'IPv6 oprit pentru profil', 'se cere explicit dezactivarea'],
          ]} />
          <p>
            Configurarea statică IPv6 este simetrică cu IPv4: <code>ipv6.method manual</code>, <code>ipv6.addresses 2001:db8:100::10/64</code>, <code>ipv6.gateway 2001:db8:100::1</code>, <code>ipv6.dns 2001:db8:100::53</code>. Un profil poate avea simultan IPv4 și IPv6 (<G id="dual-stack">dual-stack</G>).
          </p>

          <h4>6. Ce se întâmplă la boot</h4>
          <p>
            La pornire, NetworkManager caută, pentru fiecare dispozitiv, un profil cu <code>autoconnect yes</code> potrivit și îl activează. Dacă un dispozitiv nu are niciun profil, NetworkManager poate crea unul implicit („Wired connection 1”) cu <code>method auto</code> (comportament uzual; de confirmat pe RHEL 10). Profilul tău static, dacă are <code>autoconnect yes</code> și <code>ifname</code> corect, este reactivat la fiecare boot.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd (L4.9):</b> <code>NetworkManager.service</code> trebuie să fie activ și activat la boot: <code>systemctl is-active/is-enabled NetworkManager</code>. Este obiectivul C8-3 („servicii de rețea la boot”), acoperit în L4.9.</li>
            <li><b>DNS și hostname (L8.3):</b> <code>/etc/resolv.conf</code> este generat din <code>ipv4.dns</code> / <code>ipv6.dns</code> / <code>dns-search</code>; hostname-ul poate veni și el de la DHCP (hostname transient).</li>
            <li><b>firewalld (L8.4):</b> NetworkManager poate lega profilul de o zonă de firewall (<code>connection.zone</code>); zona activă a interfeței decide ce trafic intră.</li>
            <li><b>SSH (L1.11):</b> dacă reconfigurezi interfața prin care ești conectat, conexiunea poate cădea; folosește consola sau o a doua interfață.</li>
            <li><b>Journal (L4.7):</b> <code>journalctl -u NetworkManager</code> arată activările, erorile DHCP și mesajele de configurare.</li>
            <li><b>SELinux (C10):</b> fișierele profilurilor au contexte corecte când sunt create de NetworkManager; dacă le copiezi manual, verifică contextul (<code>restorecon</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La instalarea unui server: trecerea de la DHCP la adresă statică (servere, NFS, DNS).</li>
            <li>La adăugarea unei adrese secundare (un serviciu pe o a doua IP) sau a unui al doilea server DNS.</li>
            <li>La activarea IPv6 static pe un server care trebuie accesibil pe ambele protocoale.</li>
            <li>La depanare: compari profilul (<code>nmcli connection show ID</code>) cu starea reală (<code>ip addr</code>).</li>
            <li>Examen: „configure eth1 with 192.0.2.50/24, gateway 192.0.2.1, DNS 192.0.2.53; the configuration must persist across reboots”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu comenzile, pe o mașină de test. Output-urile sunt <b>Ilustrative</b> (nerulate pe RHEL 10); nume de interfețe, profiluri și adrese sunt fictive (intervale de documentație). <b>Atenție:</b> dacă ești conectat prin SSH pe interfața pe care o modifici, poți pierde accesul; lucrează de la consola mașinii sau modifică o a doua interfață.
        </Callout>

        <h4>1. Starea serviciului, dispozitivelor și profilurilor</h4>
        <CodeBlock title="comenzi" code={`systemctl is-active NetworkManager\nsystemctl is-enabled NetworkManager\nnmcli general status\nnmcli device status\nnmcli connection show\nnmcli connection show --active\nnmcli device show enp1s0`} explain={[
          ['systemctl is-active NetworkManager', 'afișează active dacă serviciul rulează acum.'],
          ['systemctl is-enabled NetworkManager', 'afișează enabled dacă pornește la boot.'],
          ['nmcli general status', 'starea generală: conectivitate, starea NetworkManager, WiFi etc.'],
          ['nmcli device status', 'tabel cu dispozitivele: DEVICE, TYPE, STATE (connected/disconnected/unmanaged), CONNECTION (profilul activ).'],
          ['nmcli connection show', 'toate profilurile salvate (NAME, UUID, TYPE, DEVICE).'],
          ['--active', 'doar profilurile active acum.'],
          ['nmcli device show enp1s0', 'detalii de rulare pentru dispozitiv: adresa MAC, adresele curente, gateway, DNS (câmpurile IP4.*, IP6.*).'],
        ]} />

        <h4>2. Inspectează un profil</h4>
        <CodeBlock title="comenzi" code={`nmcli connection show "Wired connection 1"\nnmcli -f ipv4 connection show "Wired connection 1"\nnmcli -g ipv4.method,ipv4.addresses,ipv4.gateway,ipv4.dns connection show "Wired connection 1"\nnmcli -f connection.autoconnect,connection.interface-name connection show "Wired connection 1"`} explain={[
          ['nmcli connection show "NUME"', 'toate proprietățile profilului (foarte lung; ghilimele pentru nume cu spații).'],
          ['-f ipv4', '-f = fields: afișează doar câmpurile din setarea ipv4.'],
          ['-g a,b,c', '-g = get-values: afișează doar valorile cerute, fără etichete — ideal pentru verificare/scripting.'],
          ['connection.autoconnect, interface-name', 'confirmă că profilul pornește la boot și pe ce interfață este legat.'],
        ]} />

        <h4>3. Creează un profil static nou (IPv4)</h4>
        <CodeBlock title="comenzi" code={`sudo nmcli connection add type ethernet con-name lab-static ifname enp1s0 \\\n  ipv4.method manual ipv4.addresses 192.0.2.10/24 ipv4.gateway 192.0.2.1 ipv4.dns 192.0.2.53 \\\n  connection.autoconnect yes\nnmcli connection show\nsudo nmcli connection up lab-static`} explain={[
          ['nmcli connection add', 'creează un profil nou (salvat pe disc).'],
          ['type ethernet', 'tipul conexiunii (alias pentru connection.type).'],
          ['con-name lab-static', 'numele (ID) profilului: alegi tu un nume clar.'],
          ['ifname enp1s0', 'interfața pe care se aplică (înlocuiește cu a ta, vezi nmcli device status).'],
          ['ipv4.method manual', 'adrese statice (obligatoriu când setezi adrese manual).'],
          ['ipv4.addresses 192.0.2.10/24', 'adresa cu prefix.'],
          ['ipv4.gateway 192.0.2.1', 'ruta default; în aceeași subrețea cu adresa.'],
          ['ipv4.dns 192.0.2.53', 'serverul DNS.'],
          ['connection.autoconnect yes', 'activare automată la boot (este valoarea implicită).'],
          ['\\ (backslash la sfârșit de linie)', 'continuarea comenzii pe linia următoare (pentru lizibilitate).'],
          ['nmcli connection up lab-static', 'activează profilul pe interfață.'],
        ]} />

        <h4>4. Convertește un profil DHCP existent în static (cazul tipic de examen)</h4>
        <CodeBlock title="comenzi" code={`nmcli -g ipv4.method connection show "Wired connection 1"\nsudo nmcli connection modify "Wired connection 1" \\\n  ipv4.method manual \\\n  ipv4.addresses 192.0.2.10/24 \\\n  ipv4.gateway 192.0.2.1 \\\n  ipv4.dns 192.0.2.53\nsudo nmcli connection up "Wired connection 1"\nip -br addr show enp1s0\nip route`} explain={[
          ['nmcli -g ipv4.method connection show …', 'pasul 0: vezi metoda curentă (probabil auto).'],
          ['connection modify "NUME" …', 'modifică profilul existent (nu creează altul).'],
          ['ipv4.method manual', 'schimbă din DHCP în static; trebuie dat împreună cu adresa, altfel modify poate refuza sau profilul rămâne incomplet.'],
          ['ipv4.addresses / gateway / dns', 'valorile cerute; înlocuiesc ce exista.'],
          ['connection up "NUME"', 'aplică; fără acest pas, interfața rămâne cu vechea configurație.'],
          ['ip -br addr show enp1s0 / ip route', 'verifici rezultatul real: adresa și ruta default.'],
        ]} />

        <h4>5. Adaugă / elimină elemente dintr-o listă (+ și −)</h4>
        <CodeBlock title="comenzi" code={`sudo nmcli connection modify lab-static +ipv4.addresses 192.0.2.20/24\nsudo nmcli connection modify lab-static +ipv4.dns 198.51.100.53\nsudo nmcli connection modify lab-static ipv4.dns-search example.com\nnmcli -g ipv4.addresses,ipv4.dns connection show lab-static\nsudo nmcli connection up lab-static\nsudo nmcli connection modify lab-static -ipv4.addresses 192.0.2.20/24\nsudo nmcli connection modify lab-static -ipv4.dns 198.51.100.53\nsudo nmcli connection up lab-static`} explain={[
          ['+ipv4.addresses 192.0.2.20/24', 'adaugă o adresă secundară (cealaltă rămâne).'],
          ['+ipv4.dns 198.51.100.53', 'adaugă un al doilea server DNS.'],
          ['ipv4.dns-search example.com', 'setează domeniul de căutare (înlocuiește lista).'],
          ['-ipv4.addresses …', 'elimină exact adresa dată din listă (se poate folosi și indexul, în unele cazuri).'],
          ['connection up', 'reaplică profilul după fiecare schimbare, ca să vezi efectul.'],
        ]} />

        <h4>6. Adresă IPv6 statică și dual-stack</h4>
        <CodeBlock title="comenzi" code={`sudo nmcli connection modify lab-static \\\n  ipv6.method manual \\\n  ipv6.addresses 2001:db8:100::10/64 \\\n  ipv6.gateway 2001:db8:100::1 \\\n  ipv6.dns 2001:db8:100::53\nsudo nmcli connection up lab-static\nip -6 -br addr show enp1s0\nip -6 route\nping -6 -c 2 2001:db8:100::1`} explain={[
          ['ipv6.method manual', 'IPv6 static pe profil (cere cel puțin o adresă în ipv6.addresses).'],
          ['ipv6.addresses 2001:db8:100::10/64', 'adresa cu prefix /64 (convenția pentru subrețele).'],
          ['ipv6.gateway 2001:db8:100::1', 'gateway-ul IPv6 (ruta ::/0).'],
          ['ipv6.dns …', 'DNS accesibil pe IPv6.'],
          ['ip -6 -br addr / ip -6 route', 'verifică adresa și ruta IPv6.'],
          ['ping -6 -c 2', 'testează conectivitatea IPv6 (separat de IPv4).'],
        ]} />

        <h4>7. DHCP în loc de static, dezactivare IPv6</h4>
        <CodeBlock title="comenzi" code={`sudo nmcli connection modify lab-static ipv4.method auto ipv4.addresses "" ipv4.gateway ""\nsudo nmcli connection modify lab-static ipv6.method disabled\nsudo nmcli connection up lab-static`} explain={[
          ['ipv4.method auto', 'revine la DHCP.'],
          ['ipv4.addresses "" / ipv4.gateway ""', 'valoarea goală resetează proprietatea (adresele statice rămase cu method auto pot dăuna).'],
          ['ipv6.method disabled', 'oprește IPv6 pe profil.'],
        ]} />

        <h4>8. Aplicare, oprire, ștergere</h4>
        <CodeBlock title="comenzi" code={`sudo nmcli device reapply enp1s0\nsudo nmcli connection down lab-static\nsudo nmcli connection up lab-static\nsudo nmcli connection reload\nsudo nmcli connection delete lab-static\nsudo nmcli device disconnect enp1s0`} explain={[
          ['device reapply enp1s0', 'aplică schimbările făcute profilului activ, fără a-l reactiva complet (unele proprietăți nu se pot schimba așa).'],
          ['connection down / up', 'dezactivează / activează profilul (down: interfața poate primi alt profil; profilul oprit nu se reactivează singur până la reboot sau modificare).'],
          ['connection reload', 'reîncarcă toate fișierele de profil de pe disc (necesar după editare manuală).'],
          ['connection delete NUME', 'șterge profilul și fișierul lui.'],
          ['device disconnect IF', 'deconectează dispozitivul și previne autoconectarea până la acțiune explicită.'],
        ]} />

        <h4>9. Fișierul profilului (doar de citit)</h4>
        <CodeBlock title="/etc/NetworkManager/system-connections/lab-static.nmconnection" kind="config" label="illustrative" code={`[connection]
id=lab-static
uuid=2f0b1a9e-3c4d-4e5f-8a6b-7c8d9e0f1a2b
type=ethernet
interface-name=enp1s0
autoconnect=true

[ipv4]
method=manual
address1=192.0.2.10/24,192.0.2.1
dns=192.0.2.53;
dns-search=example.com;

[ipv6]
method=manual
address1=2001:db8:100::10/64,2001:db8:100::1
dns=2001:db8:100::53;`} explain={[
          ['[connection] id / uuid / type', 'numele, identificatorul unic și tipul profilului.'],
          ['interface-name', 'interfața legată (connection.interface-name).'],
          ['autoconnect=true', 'se activează la boot.'],
          ['[ipv4] method=manual', 'ipv4.method manual.'],
          ['address1=192.0.2.10/24,192.0.2.1', 'adresă/prefix urmat, după virgulă, de gateway (formatul keyfile).'],
          ['dns=192.0.2.53;', 'lista DNS: elementele se termină cu punct și virgulă.'],
          ['[ipv6]', 'aceleași câmpuri pentru IPv6.'],
        ]} />
        <p className="small">
          Fișierul este ilustrativ (format keyfile, din cunoștințe despre NetworkManager; conținutul exact pe RHEL 10 trebuie confirmat). Îl citești doar pentru înțelegere: modificările se fac cu <code>nmcli</code>.
        </p>

        <h4>10. Interfața text (alternativă)</h4>
        <CodeBlock title="comenzi" code={`sudo nmtui`} explain={[
          ['nmtui', 'interfață cu meniuri în terminal pentru „Edit a connection”, „Activate a connection”, „Set system hostname”. Scrie în aceleași profiluri NetworkManager; necesită pachetul NetworkManager-tui.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="nmcli device status" kind="session" label="illustrative" code={`[student@server1 ~]$ nmcli device status
DEVICE   TYPE      STATE                   CONNECTION
enp1s0   ethernet  connected               lab-static
enp7s0   ethernet  disconnected            --
lo       loopback  connected (externally)  lo`} />
        <p className="small">
          <b>DEVICE</b>: interfața. <b>TYPE</b>: tipul. <b>STATE</b>: <code>connected</code> = are un profil activ; <code>disconnected</code> = nu are profil activ; <code>connected (externally)</code> = configurată în afara NetworkManager (loopback); <code>unmanaged</code> = ignorată de NetworkManager. <b>CONNECTION</b>: profilul activ (<code>--</code> = niciunul). Aici <code>enp1s0</code> folosește profilul <code>lab-static</code>, iar <code>enp7s0</code> nu are profil activ.
        </p>
        <CodeBlock title="nmcli -g … connection show" kind="session" label="illustrative" code={`[student@server1 ~]$ nmcli -g ipv4.method,ipv4.addresses,ipv4.gateway,ipv4.dns connection show lab-static
manual
192.0.2.10/24
192.0.2.1
192.0.2.53`} />
        <p className="small">
          Cu <code>-g</code>, fiecare valoare apare pe o linie, în ordinea cerută: metoda, adresa, gateway-ul, DNS-ul. Dacă <code>ipv4.method</code> afișează <code>auto</code>, profilul este încă pe DHCP, indiferent ce adresă vezi cu <code>ip addr</code>.
        </p>
        <CodeBlock title="nmcli connection show (listă)" kind="session" label="illustrative" code={`[student@server1 ~]$ nmcli connection show
NAME                UUID                                  TYPE      DEVICE
lab-static          2f0b1a9e-3c4d-4e5f-8a6b-7c8d9e0f1a2b  ethernet  enp1s0
Wired connection 1  7a1e5c4b-0d2f-4a3b-9c8d-1e2f3a4b5c6d  ethernet  --
lo                  1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b  loopback  lo`} />
        <p className="small">
          Profilurile apar chiar dacă nu sunt active. <code>DEVICE</code> gol (<code>--</code>) = profil neactiv. Observă că <code>Wired connection 1</code> (profil automat vechi) există în continuare, dar nu este activ; dacă ar avea <code>autoconnect yes</code> și prioritate mai mare, ar putea concura cu profilul tău. De aceea, la examen, <b>modifici profilul existent</b> sau îl dezactivezi/ștergi pe cel vechi.
        </p>
        <CodeBlock title="ip -br addr după configurare" kind="session" label="illustrative" code={`[student@server1 ~]$ ip -br addr show enp1s0
enp1s0   UP   192.0.2.10/24 2001:db8:100::10/64 fe80::5054:ff:fe12:3456/64
[student@server1 ~]$ ip route
default via 192.0.2.1 dev enp1s0 proto static metric 100
192.0.2.0/24 dev enp1s0 proto kernel scope link src 192.0.2.10 metric 100
[student@server1 ~]$ ip -6 route
2001:db8:100::/64 dev enp1s0 proto kernel metric 100 pref medium
fe80::/64 dev enp1s0 proto kernel metric 1024 pref medium
default via 2001:db8:100::1 dev enp1s0 proto static metric 100 pref medium`} />
        <p className="small">
          Toate cele trei elemente apar: adresa IPv4, adresa IPv6 globală și link-local. Rutele <b>default</b> pe ambele familii confirmă gateway-urile din profil. <code>proto static</code> indică o rută configurată manual (nu învățată prin DHCP/RA). Textul exact al câmpurilor poate varia.
        </p>
        <CodeBlock title="eroare tipică: metoda manual fără adrese" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo nmcli connection up lab-static
Error: Connection activation failed: IP configuration could not be reserved (no available address, timeout, etc.)`} />
        <p className="small">
          Mesaj de formă ilustrativă (textul exact poate diferi). Cauze tipice: <code>ipv4.method manual</code> fără <code>ipv4.addresses</code>, interfață inexistentă în <code>ifname</code>, sau conflict. Diagnostic: <code>nmcli connection show lab-static</code> și <code>journalctl -u NetworkManager --no-pager | tail -20</code>.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Profilul:</b> <code>nmcli -g ipv4.method,ipv4.addresses,ipv4.gateway,ipv4.dns connection show ID</code> = valorile cerute.</li>
            <li><b>Aplicarea:</b> <code>nmcli device status</code>: dispozitivul <code>connected</code> la profilul tău.</li>
            <li><b>Starea reală:</b> <code>ip -br addr</code> (adresa/prefix), <code>ip route</code> și <code>ip -6 route</code> (gateway).</li>
            <li><b>Conectivitate:</b> <code>ping -c 2 GATEWAY</code>, <code>ping -6 -c 2 GATEWAY6</code>.</li>
            <li><b>DNS:</b> <code>cat /etc/resolv.conf</code> conține <code>nameserver</code>-ul tău (L8.3).</li>
            <li><b>Persistență:</b> <code>nmcli -g connection.autoconnect connection show ID</code> = <code>yes</code>; ideal, un reboot de test.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <b>Ce persistă:</b> tot ce scrii cu <code>nmcli connection add/modify</code> (profilul este un fișier pe disc) și <code>autoconnect yes</code>. <b>Ce nu persistă:</b> <code>ip addr add</code>, <code>ip route add</code>, <code>nmcli device modify</code> (modificare temporară a configurației active) și <code>modify --temporary</code>.
          </p>
          <p>
            Confirmare manuală: <code>sudo reboot</code>; apoi <code>nmcli device status</code>, <code>ip -br addr</code>, <code>ip route</code> și <code>cat /etc/resolv.conf</code>. Pe un sistem fără reboot posibil, verifici cel puțin că schimbările sunt în profil (<code>nmcli -g … connection show</code>) și că <code>connection.autoconnect</code> este <code>yes</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Modificarea nu se vede în ip addr', 'ai uitat nmcli connection up', <><code>nmcli -g ipv4.addresses connection show ID</code> vs <code>ip -br addr</code></>, <code>sudo nmcli connection up ID</code>],
          ['Activarea eșuează', 'method manual fără adrese; ifname greșit; interfață absentă', <><code>nmcli connection show ID</code>, <code>nmcli device status</code>, <code>journalctl -u NetworkManager</code></>, 'completează adresa; corectează ifname'],
          ['Adresa veche rămâne alături de cea nouă', 'ai folosit + în loc de înlocuire (sau invers)', <code>nmcli -g ipv4.addresses connection show ID</code>, <><code>-ipv4.addresses</code> pentru a elimina sau setezi lista completă</>],
          ['Nu merge Internetul, merge rețeaua locală', 'gateway lipsă sau greșit', <code>ip route</code>, 'setează ipv4.gateway în aceeași subrețea'],
          ['Merge după up, nu după reboot', 'ai folosit ip addr sau --temporary; autoconnect no', <code>nmcli -g connection.autoconnect connection show ID</code>, 'configurează în profil, autoconnect yes'],
          ['Două profiluri se bat pe aceeași interfață', 'profilul vechi are autoconnect și prioritate', <code>nmcli connection show</code>, <>dezactivează/șterge profilul vechi (<code>connection delete</code> sau <code>modify … autoconnect no</code>)</>],
          ['DNS-ul din profil nu apare în /etc/resolv.conf', 'profil neaplicat sau DHCP îl suprascrie', <><code>cat /etc/resolv.conf</code>, <code>nmcli -g ipv4.ignore-auto-dns connection show ID</code></>, <>aplică profilul; <code>ipv4.ignore-auto-dns yes</code> dacă metoda este auto</>],
          ['Ai pierdut SSH după modificare', 'ai schimbat adresa interfeței prin care erai conectat', 'consola mașinii', 'corectează de la consolă; folosește a doua interfață pentru teste'],
          [<>IPv6 nu are adresă cu <code>method auto</code></>, 'nu există Router Advertisement în rețea', <><code>ip -6 addr</code> (doar fe80::)</>, 'configurează manual sau repară RA/DHCPv6'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Rulezi <code>modify</code> și crezi că s-a aplicat: fără <code>nmcli connection up</code> (sau reapply) interfața nu se schimbă.</>,
          <>Setezi <code>ipv4.addresses</code> dar uiți <code>ipv4.method manual</code> (metoda rămâne <code>auto</code>): DHCP continuă să atribuie.</>,
          <>Setezi <code>ipv4.method manual</code> fără nicio adresă: activarea eșuează.</>,
          <>Scrii adresa fără prefix (<code>192.0.2.10</code> în loc de <code>192.0.2.10/24</code>).</>,
          <>Gateway în altă subrețea decât adresa.</>,
          <>Folosești <code>ip addr add</code> și crezi că persistă; „merge” până la reboot.</>,
          <>Înlocuiești lista de adrese sau DNS când voiai să adaugi (lipsește <code>+</code>).</>,
          <>Editezi direct <code>/etc/resolv.conf</code>: se suprascrie; DNS se pune în profil.</>,
          <>Scrii numele profilului greșit sau uiți ghilimelele pentru nume cu spații („Wired connection 1”). Folosește <code>nmcli connection show</code> pentru nume exact.</>,
          <>Uiți partea IPv6 când cerința cere ambele protocoale, sau uiți să verifici cu <code>ping -6</code>.</>,
          <>Ștergi/dezactivezi profilul interfeței prin care ești conectat la distanță.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: prioritate de autoconnect, reapply, keyfile și dispatcher">
        <p>
          <b>Prioritate de autoconnect:</b> dacă mai multe profile pot fi activate pe același dispozitiv, NetworkManager alege după <code>connection.autoconnect-priority</code> (mai mare = preferat; implicit 0) și, la egalitate, după ultima utilizare. Din acest motiv un profil vechi „Wired connection 1” poate reapărea după reboot dacă profilul tău nu are autoconnect sau are prioritate mai mică.
        </p>
        <p>
          <b>reapply vs up:</b> <code>up</code> dezactivează și reactivează profilul (poate întrerupe scurt conexiunea); <code>device reapply</code> încearcă să aplice schimbările pe conexiunea activă fără reactivare. Unele proprietăți nu pot fi aplicate astfel (documentația nmcli), caz în care folosești <code>up</code>.
        </p>
        <p>
          <b>Editarea manuală a fișierelor keyfile:</b> NetworkManager nu monitorizează modificările; după editare rulezi <code>nmcli connection reload</code> (documentația nmcli). Fișierul trebuie să aibă proprietar root și permisiuni 0600, altfel este ignorat.
        </p>
        <p>
          <b>connection.zone:</b> <code>nmcli connection modify ID connection.zone internal</code> leagă interfața de zona firewalld <code>internal</code> când profilul este activat (din cunoștințe; de confirmat pe RHEL 10). Vezi L8.4.
        </p>
        <p>
          <b>Adrese IPv6 temporare:</b> <code>ipv6.ip6-privacy</code> (RFC 4941): 0 = dezactivat; 1 = activat, preferă adresa publică; 2 = activat, preferă temporară. Nu face parte din obiectivul de examen, dar explică adresele „extra” care pot apărea pe un sistem cu SLAAC.
        </p>
        <p>
          <b>Metoda shared:</b> <code>ipv4.method shared</code> face din sistem un mini-router: NetworkManager pornește DHCP și un forwarder DNS și configurează NAT; fără adresă setată, atribuie 10.42.x.1/24 (nm-settings). Folosită în desktop pentru partajarea conexiunii.
        </p>
      </DeepDive>
    </>
  );
}

export const L8_2: TopicModule = {
  id: 'L8.2',
  subtitle: 'NetworkManager, nmcli connection add/modify/up, ipv4.* și ipv6.*, gateway, DNS, +/- pentru liste, persistență',
  studyTime: '≈110 min studiu + laborator',
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
  labs: [LAB_L8_2A, LAB_L8_2B],
  sources: [
    { kind: 'upstream', ref: 'nmcli (referința NetworkManager „latest”) și nm-settings-nmcli, networkmanager.dev, citite 2026-11-16' },
    { kind: 'doc', ref: 'RHEL 10 — „Configure network connections and interface types” (docs.redhat.com): necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
    { kind: 'man', ref: 'ip(8), nmtui(1) — din cunoștințe, necitite în sesiune' },
  ],
};
