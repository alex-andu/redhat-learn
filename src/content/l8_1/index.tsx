import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L8_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pentru ca două calculatoare să comunice într-o rețea, fiecare interfață are nevoie de o <G id="ip-address">adresă IP</G>. Există două versiuni care coexistă: <G id="ipv4">IPv4</G> (32 de biți, scrisă <code>192.0.2.10</code>) și <G id="ipv6">IPv6</G> (128 de biți, scrisă <code>2001:db8::10</code>). Fiecare adresă vine cu un <G id="cidr-prefix">prefix</G> (<code>/24</code>, <code>/64</code>) care spune ce parte este rețeaua. Pentru a ieși din rețeaua locală, traficul merge la <G id="default-gateway">gateway</G>.
          </p>
          <p>
            Aceasta este o lecție de <b>suport</b> (neoficială, fără obiectiv EX200 propriu): îți dă vocabularul și înțelegerea de care ai nevoie ca să configurezi corect adresele în L8.2 (obiectivul C8-1) și regulile de firewall din L8.4.
          </p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: cum găsește un pachet drumul?</h4>
          <p>
            Imaginează-ți milioane de calculatoare conectate între ele. Dacă vrei să trimiți un mesaj unuia dintre ele, ai nevoie de (1) o <b>adresă unică</b> a destinatarului și (2) un mecanism prin care rețeaua să știe <b>pe unde</b> să ducă mesajul. Protocolul IP (Internet Protocol) rezolvă ambele: fiecare pachet are în antet adresa sursă și adresa destinație, iar routerele (echipamentele care leagă rețelele între ele) decid, pe baza adresei destinație, următorul pas.
          </p>
          <Analogy>
            Adresa IP este ca o adresă poștală. O adresă poștală are o parte care identifică <b>orașul și strada</b> (rețeaua) și o parte care identifică <b>numărul casei</b> (host-ul). Oficiul poștal local nu trebuie să știe unde e fiecare casă din țară: duce scrisoarea la orașul potrivit, iar acolo oficiul local o duce la casă. Prefixul <code>/24</code> este regula care spune unde se termină „strada” și unde începe „numărul casei”.
          </Analogy>

          <h4>Adresa aparține unei interfețe, nu calculatorului</h4>
          <p>
            Un calculator poate avea mai multe plăci de rețea (sau interfețe virtuale), iar <b>fiecare</b> primește propria adresă. Interfața este un obiect numit (<code>enp1s0</code>, <code>lo</code>); o <G id="network-interface">interfață</G> poate avea mai multe adrese în același timp, chiar IPv4 și IPv6 împreună.
          </p>

          <h4>De ce există două versiuni</h4>
          <p>
            IPv4 (RFC 791, 1981) are 2<sup>32</sup> ≈ 4,3 miliarde de adrese. Pe măsură ce Internetul a crescut, aceste adrese publice s-au epuizat. Soluțiile temporare au fost <b>adresele private</b> și <b>NAT</b> (mai multe calculatoare dintr-o rețea internă partajează o adresă publică). Soluția definitivă este IPv6 (128 de biți = 2<sup>128</sup> adrese), care redă fiecărui dispozitiv o adresă proprie. Cele două protocoale <b>nu sunt compatibile direct</b>: sunt „două rețele paralele” care rulează pe aceleași cabluri. Un sistem care folosește ambele este <G id="dual-stack">dual-stack</G>.
          </p>

          <h4>Cum se leagă de examenul EX200</h4>
          <p>
            Obiectivul C8-1 cere să configurezi adrese IPv4 și IPv6 (static). La examen primești, de obicei: o adresă cu prefix, un gateway și un server DNS, și trebuie să le aplici <b>persistent</b>. Dacă nu știi să citești <code>192.0.2.10/24</code> sau <code>2001:db8:100::10/64</code>, riști să pui greșit gateway-ul sau prefixul. De aceea lecția explică de la zero ce înseamnă fiecare element.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. IPv4: 32 de biți în patru octeți</h4>
          <p>
            O adresă IPv4 este un număr de 32 de biți, scris ca <b>patru octeți</b> (grupuri de 8 biți) în zecimal, separați prin puncte. Fiecare octet ia valori de la 0 la 255.
          </p>
          <CodeBlock title="192.0.2.10 în binar" kind="config" label="illustrative" code={`octet:     192        0          2         10
binar:  11000000 . 00000000 . 00000010 . 00001010`} explain={[
            ['192 = 11000000', '128 + 64 = 192: primii doi biți sunt 1, restul 0.'],
            ['0 = 00000000', 'toți biții 0.'],
            ['2 = 00000010', 'doar bitul de valoare 2 este 1.'],
            ['10 = 00001010', '8 + 2 = 10.'],
          ]} />

          <h4>2. Prefixul: unde se termină „rețeaua”</h4>
          <p>
            Adresa se împarte în <b>partea de rețea</b> (primii N biți) și <b>partea de host</b> (restul). N se numește <b>lungimea prefixului</b>; se scrie după slash: <code>192.0.2.10/24</code> înseamnă că primii 24 de biți (primii trei octeți) identifică rețeaua, iar ultimii 8 biți identifică host-ul. Același lucru se poate scrie ca <b>mască de subrețea</b>: un număr cu N biți de 1 urmați de biți de 0.
          </p>
          <Table head={['Prefix', 'Mască', 'Adrese în rețea', 'Host-uri utilizabile (IPv4)', 'Exemplu de utilizare']} rows={[
            [<code>/8</code>, <code>255.0.0.0</code>, '16 777 216', '16 777 214', 'rețele foarte mari (10.0.0.0/8)'],
            [<code>/16</code>, <code>255.255.0.0</code>, '65 536', '65 534', 'rețea mare de campus (172.16.0.0/16)'],
            [<code>/24</code>, <code>255.255.255.0</code>, '256', '254', 'rețeaua clasică de birou (192.0.2.0/24)'],
            [<code>/25</code>, <code>255.255.255.128</code>, '128', '126', 'jumătate de /24'],
            [<code>/30</code>, <code>255.255.255.252</code>, '4', '2', 'legătură punct-la-punct între două routere'],
            [<code>/32</code>, <code>255.255.255.255</code>, '1', '1 (o singură adresă)', 'o adresă anume (reguli, loopback)'],
          ]} />
          <p>
            Formula: o rețea cu prefix <code>/N</code> are 2<sup>(32−N)</sup> adrese. În IPv4, <b>prima adresă</b> (toți biții de host = 0) este <b>adresa rețelei</b> și <b>ultima</b> (toți biții = 1) este adresa de <b>broadcast</b>; nu se atribuie host-urilor, de aceea 256 − 2 = 254 utilizabile la <code>/24</code>.
          </p>
          <Callout kind="tip" title="Calcul rapid pentru /24">
            În <code>192.0.2.10/24</code>: rețeaua este <code>192.0.2.0</code>, broadcast-ul este <code>192.0.2.255</code>, iar host-urile utilizabile merg de la <code>192.0.2.1</code> la <code>192.0.2.254</code>. Un gateway tipic este <code>192.0.2.1</code> sau <code>192.0.2.254</code>. <b>Gateway-ul trebuie să fie în aceeași subrețea</b> cu interfața.
          </Callout>

          <h4>3. Decizia: local sau prin gateway?</h4>
          <p>
            Când host-ul vrea să trimită un pachet, compară adresa destinație cu <b>tabela de rutare</b>. Regula este: <b>ruta cea mai specifică câștigă</b> (prefixul cel mai lung). Dacă destinația se află în aceeași <G id="subnet">subrețea</G>, pachetul este livrat direct pe cablu; altfel merge la <G id="default-gateway">gateway</G> (ruta <code>default</code>, adică <code>0.0.0.0/0</code> în IPv4 și <code>::/0</code> în IPv6), care îl duce mai departe.
          </p>
          <CodeBlock title="tabela de rutare (Ilustrativ)" kind="session" label="illustrative" code={`[student@server1 ~]$ ip route
default via 192.0.2.1 dev enp1s0 proto static metric 100
192.0.2.0/24 dev enp1s0 proto kernel scope link src 192.0.2.10 metric 100`} explain={[
            ['default via 192.0.2.1 dev enp1s0', 'orice destinație care nu are o rută mai specifică merge la 192.0.2.1, prin interfața enp1s0 (acesta este gateway-ul).'],
            ['192.0.2.0/24 dev enp1s0 … scope link', 'destinațiile din subrețeaua locală sunt livrate direct, fără router.'],
            ['src 192.0.2.10', 'adresa sursă folosită pentru pachetele trimise pe această rută.'],
            ['metric 100', 'prioritatea rutei (mai mic = preferat) dacă există mai multe rute către aceeași destinație.'],
          ]} />

          <h4>4. Cum află host-ul MAC-ul vecinului: ARP și NDP</h4>
          <p>
            Pe cablul Ethernet, pachetele sunt livrate după <G id="mac-address">adresa MAC</G> (adresa hardware, 48 de biți). Pentru a afla MAC-ul unui vecin cunoscut doar după IP, IPv4 folosește <b>ARP</b> („cine are 192.0.2.20?”, trimis către toți), iar IPv6 folosește <b>NDP</b> (Neighbor Discovery Protocol, bazat pe mesaje ICMPv6 și multicast). Rezultatele se păstrează un timp în <b>tabela de vecini</b> (<code>ip neigh</code>).
          </p>

          <h4>5. IPv6: 128 de biți în opt grupuri hexazecimale</h4>
          <p>
            O adresă IPv6 are <b>opt grupuri</b> de câte 16 biți, scrise cu până la patru cifre hexazecimale (0–9, a–f) și separate prin două puncte. Exemplu complet: <code>2001:0db8:0000:0000:0000:0000:0000:0010</code>. Pentru lizibilitate există două reguli de scurtare:
          </p>
          <ol>
            <li><b>Zerourile din fața unui grup</b> se pot omite: <code>0db8</code> → <code>db8</code>, <code>0000</code> → <code>0</code>.</li>
            <li><b>O singură succesiune</b> de grupuri formate numai din zerouri se poate înlocui cu <code>::</code>. Se poate face <b>o singură dată</b> într-o adresă (altfel ar fi ambiguu câte grupuri lipsesc).</li>
          </ol>
          <CodeBlock title="scurtarea unei adrese IPv6" kind="config" label="illustrative" code={`2001:0db8:0000:0000:0000:0000:0000:0010   (forma completă)
2001:db8:0:0:0:0:0:10                      (fără zerourile din față)
2001:db8::10                               (cu :: în locul grupurilor nule)

::1            =  0000:0000:0000:0000:0000:0000:0000:0001   (loopback)
::             =  toate zerourile (adresa nespecificată)`} explain={[
            ['2001:0db8:…:0010', 'forma completă, cu toate cele opt grupuri și zerouri.'],
            ['2001:db8:0:0:0:0:0:10', 'după scoaterea zerourilor din fața fiecărui grup.'],
            ['2001:db8::10', ':: ocupă cele cinci grupuri nule consecutive din mijloc; apare o singură dată.'],
            ['::1', 'loopback-ul IPv6, echivalentul lui 127.0.0.1.'],
          ]} />
          <p>
            Prefixul funcționează la fel ca la IPv4, dar se măsoară în biți din 128. Convenția este <b>/64</b> pentru o subrețea: primii 64 de biți (prefixul de rețea) vin de la ISP/administrator, ultimii 64 (identificatorul interfeței) identifică interfața. Pentru <code>2001:db8:100::10/64</code>, rețeaua este <code>2001:db8:100::/64</code>.
          </p>

          <h4>6. Tipuri de adrese</h4>
          <Table head={['Tip', 'IPv4', 'IPv6', 'Rol']} rows={[
            [<G id="loopback">loopback</G>, <code>127.0.0.0/8</code>, <code>::1/128</code>, 'host-ul vorbește cu el însuși'],
            [<G id="link-local">link-local</G>, <code>169.254.0.0/16</code>, <code>fe80::/10</code>, 'doar pe segmentul local; nu e rutat'],
            [<G id="private-address">privat / ULA</G>, <><code>10/8</code>, <code>172.16/12</code>, <code>192.168/16</code></>, <><code>fc00::/7</code> (practic <code>fd00::/8</code>)</>, 'rețele interne, nerutate pe Internet'],
            ['global / public', 'restul spațiului rutat', <><code>2000::/3</code> (global unicast)</>, 'rutat pe Internet'],
            ['multicast', <code>224.0.0.0/4</code>, <code>ff00::/8</code>, 'un pachet către un grup de host-uri'],
            ['broadcast', <>ultima adresă din subrețea (ex. <code>192.0.2.255</code>)</>, 'nu există', 'IPv6 folosește multicast în loc'],
            ['documentație', <><code>192.0.2.0/24</code>, <code>198.51.100.0/24</code>, <code>203.0.113.0/24</code></>, <code>2001:db8::/32</code>, 'rezervate pentru exemple; nu apar niciodată în Internetul real'],
          ]} />
          <Callout kind="info" title="De ce folosim 192.0.2.0/24 și 2001:db8::/32 în exemple">
            RFC 5737 și RFC 3849 rezervă aceste intervale special pentru documentație. Toate exemplele din platformă folosesc doar aceste intervale ca să nu fie confundate cu adrese reale. <b>La un examen sau în producție vei primi adresele reale ale rețelei tale</b>; metoda este aceeași.
          </Callout>

          <h4>7. Cum își obține o interfață adresa</h4>
          <Table head={['Metodă', 'IPv4', 'IPv6', 'Cine decide adresa']} rows={[
            ['Statică (manual)', <><code>ipv4.method manual</code></>, <><code>ipv6.method manual</code></>, 'administratorul, în profil'],
            ['DHCP', <><code>ipv4.method auto</code></>, <><code>ipv6.method dhcp</code> (DHCPv6)</>, 'un server DHCP atribuie adresa (cu lease temporar)'],
            [<G id="slaac">SLAAC</G>, 'nu există', <><code>ipv6.method auto</code></>, 'routerul anunță prefixul; host-ul își formează singur adresa'],
            ['Link-local', <><code>ipv4.method link-local</code></>, <><code>ipv6.method link-local</code></>, 'host-ul, automat, doar pentru segmentul local'],
          ]} />
          <p>
            În IPv6, <code>method auto</code> înseamnă SLAAC (adresa se formează pe baza prefixului din Router Advertisement) și, dacă routerul cere, și DHCPv6. Cum se formează partea de host? Fie din adresa MAC (<code>eui64</code>), fie dintr-o valoare stabilă generată (<code>stable-privacy</code>, RFC 7217); opțional se adaugă adrese temporare pentru confidențialitate (RFC 4941). Setarea <code>ipv6.addr-gen-mode</code> din NetworkManager alege între primele două.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>NetworkManager și <code>nmcli</code> (L8.2):</b> aici înveți ce înseamnă adresele; acolo le aplici persistent în profiluri.</li>
            <li><b>DNS, hostname, <code>/etc/hosts</code> (L8.3):</b> numele sunt tradus în adrese IP. Fără o adresă, numele nu ajută.</li>
            <li><b>firewalld (L8.4):</b> regulile pot depinde de adrese sursă (<code>192.0.2.0/24</code>), de familie (IPv4/IPv6) și de zonă.</li>
            <li><b>SSH, <code>scp</code>, <code>rsync</code> (L1.11, L4.10):</b> se conectează la o adresă sau la un nume care se rezolvă într-o adresă; aceeași metodă funcționează pe IPv6 (<code>ssh -6</code>, adrese între paranteze drepte la <code>scp</code>).</li>
            <li><b>NFS (L6.3):</b> serverul se montează după nume sau IP; exporturile pot restricționa pe adrese.</li>
            <li><b>chrony (L7.3):</b> clientul NTP trebuie să poată rezolva și ajunge la server (UDP 123).</li>
            <li><b>systemd și boot (C4):</b> rețeaua pornește prin <code>NetworkManager.service</code>; serviciile care așteaptă rețeaua folosesc <code>network-online.target</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce folosim aceste concepte">
        <Detailed>
          <ul>
            <li>Când primești o sarcină de tipul „configurează adresa 192.0.2.10/24 cu gateway 192.0.2.1”: trebuie să verifici că gateway-ul este în subrețea.</li>
            <li>Când două servere „nu se văd”: compari prefixele (sunt în aceeași subrețea sau nu?) și rutele.</li>
            <li>Când o aplicație ascultă doar pe <code>127.0.0.1</code> și nu e accesibilă din altă mașină: pricepi diferența dintre loopback și interfața reală.</li>
            <li>Când un serviciu merge pe IPv4, dar nu pe IPv6 (sau invers): ai sistem dual-stack și două seturi de configurații.</li>
            <li>Când scrii reguli de firewall pe surse (<code>192.0.2.0/24</code>): prefixul definește exact ce adrese sunt incluse.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Comenzile de aici doar citesc starea">
          Lecția este conceptuală: comenzile de mai jos <b>nu modifică</b> nimic și se pot rula în siguranță pe un sistem de test. Platforma nu le rulează; output-urile sunt <b>Ilustrative</b>. Adresele sunt din intervale de documentație.
        </Callout>

        <h4>1. Vezi interfețele și adresele</h4>
        <CodeBlock title="comenzi" code={`ip link show\nip addr show\nip -br addr\nip -4 addr show\nip -6 addr show\nip -4 -br addr`} explain={[
          ['ip', 'utilitarul principal de rețea din pachetul iproute (înlocuiește vechiul ifconfig).'],
          ['ip link show', 'listează interfețele (nivel 2): nume, stare (UP/DOWN), adresa MAC, MTU.'],
          ['ip addr show', 'listează interfețele și toate adresele lor IPv4 și IPv6, cu prefix.'],
          ['-br', 'brief = o linie per interfață: nume, stare, adrese; ușor de citit.'],
          ['-4 / -6', 'afișează doar familia IPv4, respectiv IPv6.'],
        ]} />

        <h4>2. Vezi rutele și gateway-ul</h4>
        <CodeBlock title="comenzi" code={`ip route\nip -4 route show default\nip -6 route\nip route get 192.0.2.50\nip route get 198.51.100.7`} explain={[
          ['ip route', 'tabela de rutare IPv4 (implicit).'],
          ['ip -4 route show default', 'doar ruta implicită; „via …” este gateway-ul.'],
          ['ip -6 route', 'tabela de rutare IPv6.'],
          ['ip route get ADRESĂ', 'întreabă kernelul ce rută ar folosi pentru acea destinație (și ce sursă): util pentru a vedea dacă o destinație este locală sau prin gateway.'],
        ]} />

        <h4>3. Vecinii (ARP / NDP)</h4>
        <CodeBlock title="comenzi" code={`ip neigh\nip -6 neigh`} explain={[
          ['ip neigh', 'tabela de vecini: adresă IP → adresă MAC, cu starea intrării (REACHABLE, STALE …); conține ARP pentru IPv4 și NDP pentru IPv6.'],
          ['-6', 'doar IPv6.'],
        ]} />

        <h4>4. Teste de conectivitate</h4>
        <CodeBlock title="comenzi" code={`ping -c 3 192.0.2.1\nping -6 -c 3 2001:db8:100::1\nping -c 3 127.0.0.1\nping -c 3 ::1`} explain={[
          ['ping', 'trimite pachete ICMP echo și așteaptă răspunsul; arată dacă adresa este accesibilă și cât durează.'],
          ['-c 3', 'count: trimite 3 pachete și se oprește (fără -c, ping rulează până apeși Ctrl+C).'],
          ['-6', 'forțează IPv6 (pe unele sisteme există și ping6; -6 este forma recomandată).'],
          ['127.0.0.1 / ::1', 'loopback: testează doar stiva IP locală, nu rețeaua.'],
        ]} />

        <h4>5. Calculează „de mână” (exerciții)</h4>
        <p>Exemple rezolvate, ca să îți formezi reflexul înainte de a configura:</p>
        <Table head={['Adresă/prefix', 'Rețea', 'Broadcast', 'Primul / ultimul host', 'Gateway valid?']} rows={[
          [<code>192.0.2.10/24</code>, <code>192.0.2.0</code>, <code>192.0.2.255</code>, '192.0.2.1 / 192.0.2.254', <><code>192.0.2.1</code> da; <code>192.0.3.1</code> nu (altă rețea)</>],
          [<code>198.51.100.77/25</code>, <code>198.51.100.0</code>, <code>198.51.100.127</code>, '198.51.100.1 / 198.51.100.126', <><code>198.51.100.1</code> da; <code>198.51.100.129</code> nu (a doua jumătate)</>],
          [<code>203.0.113.130/26</code>, <code>203.0.113.128</code>, <code>203.0.113.191</code>, '203.0.113.129 / 203.0.113.190', <><code>203.0.113.129</code> da</>],
        ]} />
        <p className="small">
          Metoda pentru prefixe care nu sunt la granița unui octet: calculezi „dimensiunea blocului” = 256 − valoarea octetului din mască. La <code>/25</code> masca este <code>255.255.255.128</code>, blocul este 128; adresele merg în blocuri de 128 (0–127, 128–255). La <code>/26</code> (mască …192) blocul este 64 (0–63, 64–127, 128–191, 192–255), deci <code>203.0.113.130</code> cade în blocul <code>128–191</code>.
        </p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ip -br addr" kind="session" label="illustrative" code={`[student@server1 ~]$ ip -br addr
lo               UNKNOWN        127.0.0.1/8 ::1/128
enp1s0           UP             192.0.2.10/24 2001:db8:100::10/64 fe80::5054:ff:fe12:3456/64`} />
        <p className="small">
          <b>lo</b>: interfața loopback; starea <code>UNKNOWN</code> este normală pentru ea. Are <code>127.0.0.1/8</code> și <code>::1/128</code>. <b>enp1s0</b>: interfața fizică (nume predictibil: Ethernet <code>en</code>, magistrala PCI 1, slot 0). Stare <code>UP</code> = activă. Are trei adrese: <code>192.0.2.10/24</code> (IPv4), <code>2001:db8:100::10/64</code> (IPv6 globală, aici statică) și <code>fe80::5054:ff:fe12:3456/64</code> (<b>link-local</b>, generată automat, derivată din MAC; observă <code>ff:fe</code> în mijloc, semn de format EUI-64). Faptul că vezi IPv4 și IPv6 pe aceeași interfață înseamnă că sistemul este <b>dual-stack</b>.
        </p>
        <CodeBlock title="ip addr show enp1s0" kind="session" label="illustrative" code={`[student@server1 ~]$ ip addr show enp1s0
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 192.0.2.10/24 brd 192.0.2.255 scope global noprefixroute enp1s0
       valid_lft forever preferred_lft forever
    inet6 2001:db8:100::10/64 scope global noprefixroute
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe12:3456/64 scope link noprefixroute
       valid_lft forever preferred_lft forever`} />
        <p className="small">
          <b>BROADCAST,MULTICAST,UP,LOWER_UP</b>: interfața e activă (<code>UP</code>) și are legătură fizică (<code>LOWER_UP</code>, de exemplu cablu conectat). <b>mtu 1500</b>: dimensiunea maximă a unui cadru. <b>link/ether</b>: adresa MAC proprie; <b>brd</b>: adresa MAC de broadcast. <b>inet</b>: o adresă IPv4 cu prefix (<code>/24</code>), <b>brd</b> = adresa de broadcast a subrețelei, <b>scope global</b> = rutabilă dincolo de segment. <b>inet6 … scope link</b>: adresa link-local. <b>valid_lft / preferred_lft forever</b>: adresa nu expiră (e statică); la DHCP sau SLAAC apar valori în secunde, care scad: adresa are un „lease” limitat.
        </p>
        <CodeBlock title="ip route get" kind="session" label="illustrative" code={`[student@server1 ~]$ ip route get 192.0.2.50
192.0.2.50 dev enp1s0 src 192.0.2.10 uid 1000
    cache
[student@server1 ~]$ ip route get 198.51.100.7
198.51.100.7 via 192.0.2.1 dev enp1s0 src 192.0.2.10 uid 1000
    cache`} />
        <p className="small">
          Prima destinație este în <code>192.0.2.0/24</code>: livrare <b>directă</b> (fără „via”). A doua nu este în subrețeaua locală: kernelul alege ruta implicită și trimite la <code>via 192.0.2.1</code>, adică la gateway. Textul exact poate diferi între versiuni; ideea de citit este prezența sau absența lui <code>via</code>.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Adresele sunt cele așteptate:</b> <code>ip -br addr</code> arată adresa și prefixul corect pe interfața corectă.</li>
            <li><b>Gateway-ul este în subrețea:</b> <code>ip route</code>: ruta <code>default via …</code> trebuie să aibă un „via” din aceeași rețea cu adresa interfeței.</li>
            <li><b>Conectivitate locală:</b> <code>ping -c 3 &lt;gateway&gt;</code> răspunde.</li>
            <li><b>Conectivitate IPv6:</b> <code>ping -6 -c 3 &lt;adresă-IPv6&gt;</code> separat de IPv4.</li>
            <li><b>Calcul:</b> poți spune, fără unelte, rețeaua, broadcast-ul și intervalul de host-uri pentru un prefix la granița unui octet (/8, /16, /24).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Comenzile <code>ip addr add</code> / <code>ip route add</code> modifică doar starea kernelului: <b>se pierd la reboot</b> sau când NetworkManager reaplică profilul. Configurația durabilă se face prin profilurile NetworkManager (L8.2). Aici nu configurăm nimic; scopul este să înțelegi ce vei configura.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Nu poți face ping la gateway', 'adresa/prefixul greșite; gateway în altă subrețea; cablu/interfață jos', <><code>ip -br addr</code>, <code>ip route</code>, <code>ip link</code></>, 'corectează prefixul sau gateway-ul; activează interfața'],
          ['Merge ping la IP, nu la nume', 'DNS lipsă sau greșit', <code>getent hosts nume</code>, 'vezi L8.3'],
          ['IPv4 merge, IPv6 nu (sau invers)', 'dual-stack: configurație sau rută lipsă pe una dintre familii', <><code>ip -6 route</code>, <code>ping -6</code></>, 'configurează familia lipsă (L8.2)'],
          ['Adresă 169.254.x.y neașteptată', 'DHCP nu a răspuns, metoda link-local', <code>ip -4 addr</code>, 'verifică serverul DHCP sau setează static'],
          ['Serviciul răspunde local, dar nu din rețea', 'ascultă doar pe 127.0.0.1 / ::1', <code>ss -tulpn</code>, 'configurează serviciul să asculte pe adresa externă'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confunzi masca cu prefixul: <code>/24</code> = <code>255.255.255.0</code>, nu 255.255.255.24.</>,
          <>Pui gateway-ul în afara subrețelei adresei (ex. adresă <code>192.0.2.10/24</code> cu gateway <code>192.0.3.1</code>).</>,
          <>Uiți prefixul: scrii <code>192.0.2.10</code> fără <code>/24</code>; fără prefix, unele unelte aleg o mască implicită sau refuză valoarea.</>,
          <>Folosești <code>::</code> de două ori într-o adresă IPv6 (ilegal).</>,
          <>Crezi că IPv6 are broadcast (nu are; folosește multicast).</>,
          <>Crezi că <code>fe80::</code> este adresa „reală” a serverului: este link-local, nerutată; pentru acces din alte rețele ai nevoie de o adresă globală sau ULA.</>,
          <>Tratezi <code>ping</code> ca verdict final: unele rețele blochează ICMP, deci un ping eșuat nu dovedește că serviciul e jos.</>,
          <>Presupui că o adresă setată cu <code>ip addr add</code> persistă: nu persistă.</>,
          <>Uiți că IPv4 și IPv6 se configurează și se verifică separat.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: NAT, EUI-64, privacy extensions și MTU">
        <p>
          <b>NAT (Network Address Translation):</b> un router rescrie adresa sursă privată cu una publică (și ține o tabelă ca să trimită răspunsul înapoi). NAT a prelungit viața IPv4, dar rupe modelul „fiecare host e accesibil direct”. În IPv6 NAT nu mai este necesar (dar firewall-ul rămâne).
        </p>
        <p>
          <b>EUI-64:</b> identificatorul interfeței de 64 de biți se obține din MAC-ul de 48 de biți: se inserează <code>ff:fe</code> la mijloc și se inversează un bit (bitul „universal/local”). Exemplu: MAC <code>52:54:00:12:34:56</code> → cu <code>ff:fe</code> inserat: <code>52:54:00:ff:fe:12:34:56</code> → cu bitul inversat în primul octet (<code>52</code> → <code>50</code>): <code>5054:00ff:fe12:3456</code>, scris prescurtat <code>5054:ff:fe12:3456</code>; adresa link-local devine <code>fe80::5054:ff:fe12:3456</code>. Dezavantaj: MAC-ul devine vizibil în adresă (urmărire). Din acest motiv există <code>stable-privacy</code> (RFC 7217) și adresele temporare (RFC 4941).
        </p>
        <p>
          <b>MTU:</b> dimensiunea maximă a unui pachet pe un link (1500 la Ethernet clasic). IPv6 nu permite fragmentarea de către routere (doar de către sursă), deci „Path MTU Discovery” (ICMPv6 „Packet Too Big”) trebuie să funcționeze — de aceea nu se blochează ICMPv6 complet pe un firewall.
        </p>
        <p>
          <b>Dual-stack și rezoluția numelor:</b> un nume poate avea înregistrări <code>A</code> (IPv4) și <code>AAAA</code> (IPv6); aplicațiile moderne încearcă ambele („happy eyeballs”). Dacă IPv6 este configurat greșit, pot apărea întârzieri înainte de revenirea la IPv4.
        </p>
      </DeepDive>
    </>
  );
}

export const L8_1: TopicModule = {
  id: 'L8.1',
  subtitle: 'IPv4, IPv6, prefix, gateway, MAC, loopback, link-local, SLAAC, dual-stack; ip addr / ip route (lecție de suport)',
  studyTime: '≈90 min studiu + laborator',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când le folosim', code: '5' },
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
  labs: [LAB_L8_1],
  sources: [
    { kind: 'upstream', ref: 'NetworkManager — nm-settings-nmcli (ipv4.method, ipv6.method, addr-gen-mode, ip6-privacy), networkmanager.dev, citit 2026-11-16' },
    { kind: 'rfc', ref: 'RFC 791, 1918, 3927, 4291, 4193, 4862, 4941, 5737, 3849, 7217 — din cunoștințe, URL-uri RFC neredeschise în sesiune' },
    { kind: 'doc', ref: 'RHEL 10 — „Configure network connections and interface types” (docs.redhat.com): necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
