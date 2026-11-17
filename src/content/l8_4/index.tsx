import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L8_4A, LAB_L8_4B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un firewall decide ce trafic de rețea are voie să ajungă la sistemul tău. Pe RHEL, serviciul este <G id="firewalld">firewalld</G>, controlat cu <G id="firewall-cmd"><code>firewall-cmd</code></G>. Conceptele: <b>zone</b> (niveluri de încredere la care legi interfețe sau surse), <b>servicii</b> (nume ca <code>ssh</code>, <code>http</code>) și <b>porturi</b> (<code>8080/tcp</code>). Regula de aur: fără <code>--permanent</code> schimbarea este doar <b>runtime</b> (dispare la reload/reboot); cu <code>--permanent</code> este salvată, dar activă abia după <code>--reload</code>.
          </p>
          <p>Obiective oficiale: <i>„Restrict network access using firewalld and firewall-cmd”</i> (C8-4) și <i>„Configure firewall settings using firewall-cmd/firewalld”</i> (C10-1).</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>De ce un firewall?</h4>
          <p>
            Un server rulează mai multe servicii (SSH, web, baze de date), fiecare ascultând pe un <G id="firewall-port">port</G>. Nu toate trebuie să fie accesibile de oriunde. Un <b>firewall</b> filtrează pachetele care intră (și, la nevoie, ies) după reguli: adresa sursă, portul destinație, protocolul. Principiul sănătos este <b>„permite doar ce este necesar, restul interzis”</b>: chiar dacă pornești din greșeală un serviciu, el nu este expus.
          </p>
          <Analogy>
            Firewall-ul este <b>portarul unui bloc</b>. Blocul are mai multe uși (porturi). Portarul are o listă: „la ușa 22 (ssh) intră oricine din birou”, „la ușa 80 (http) intră oricine”, „la restul nu intră nimeni”. Zonele sunt <b>nivelurile de încredere</b>: portarul se poartă diferit cu cineva care vine din clădirea ta (zona <code>internal</code>) față de un străin de pe stradă (zona <code>public</code>).
          </Analogy>

          <h4>De ce firewalld, nu reguli scrise de mână?</h4>
          <p>
            Kernelul filtrează pachetele cu <G id="nftables">nftables</G>. Regulile nftables brute sunt greu de scris și de menținut. <b>firewalld</b> oferă un nivel abstract: tu spui „serviciul <code>http</code> este permis în zona <code>public</code>”, iar firewalld generează regulile corecte. Este <b>dinamic</b>: poți schimba regulile fără să oprești firewall-ul și fără să întrerupi conexiunile existente. Pachetul se numește <code>firewalld</code>, serviciul <code>firewalld.service</code>, clientul <code>firewall-cmd</code>.
          </p>

          <h4>Cele trei concepte-cheie</h4>
          <Table head={['Concept', 'Ce este', 'Exemple']} rows={[
            [<G id="firewall-zone">Zonă</G>, 'un nivel de încredere, cu propriile reguli, la care sunt legate interfețe sau adrese sursă', <><code>public</code>, <code>internal</code>, <code>trusted</code>, <code>drop</code></>],
            [<G id="firewall-service">Serviciu</G>, 'o definiție predefinită (nume → porturi/protocoale) pe care o activezi într-o zonă', <><code>ssh</code>, <code>http</code>, <code>https</code>, <code>nfs</code></>],
            [<G id="firewall-port">Port</G>, 'număr + protocol, când nu există serviciu predefinit sau folosești alt port', <><code>8080/tcp</code>, <code>5000-5010/udp</code></>],
          ]} />

          <h4>Zonele predefinite</h4>
          <p>De la cea mai restrictivă la cea mai permisivă (documentația firewalld):</p>
          <Table head={['Zonă', 'Comportament']} rows={[
            [<code>drop</code>, 'pachetele primite sunt aruncate fără niciun răspuns; doar conexiunile de ieșire funcționează'],
            [<code>block</code>, 'conexiunile primite sunt respinse cu un mesaj (prohibited); doar cele inițiate local funcționează'],
            [<code>public</code>, 'rețele neîncrezătoare (Internet, rețea publică); „doar conexiunile selectate sunt acceptate”'],
            [<code>external</code>, 'pentru routere/gateway-uri cu mascare (NAT) IPv4; doar conexiunile selectate'],
            [<code>dmz</code>, 'sisteme accesibile public, cu acces limitat la rețeaua internă'],
            [<code>work</code>, 'rețele de lucru; alte calculatoare sunt în mare parte de încredere'],
            [<code>home</code>, 'rețele de acasă; calculatoare în mare parte de încredere'],
            [<code>internal</code>, 'rețele interne; calculatoare în mare parte de încredere'],
            [<code>trusted</code>, 'toate conexiunile sunt acceptate'],
          ]} />
          <p className="small">
            Care servicii sunt permise implicit în fiecare zonă nu este descris în pagina citită; pe RHEL, zona implicită este de obicei <code>public</code>, cu serviciile <code>ssh</code> și <code>dhcpv6-client</code> permise (din cunoștințe; poate include și <code>cockpit</code>; de confirmat pe RHEL 10). Verifică întotdeauna cu <code>firewall-cmd --list-all</code>.
          </p>

          <h4>Cum se alege zona unui pachet</h4>
          <p>
            Un pachet primit este asociat unei zone: (1) dacă adresa sursă este legată de o zonă (<code>--add-source</code>), se folosește acea zonă; (2) altfel, zona interfeței pe care a intrat; (3) altfel, <b>zona implicită</b>. O interfață sau o sursă aparține unei singure zone.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Runtime versus permanent: cea mai importantă idee</h4>
          <p>
            firewalld păstrează <b>două configurații</b>. Aceasta este sursa capcanelor de examen.
          </p>
          <Table head={['', 'Runtime', 'Permanent']} rows={[
            ['Unde', 'în memoria daemonului, aplicat în kernel', <>fișiere pe disc: <code>/etc/firewalld/</code></>],
            ['Efect', 'imediat', <>după <code>--reload</code>, restart firewalld sau reboot</>],
            ['La reboot / reload', 'dispare dacă nu este salvată și permanent', 'persistă'],
            ['Cum o modifici', <><code>firewall-cmd --add-service=http</code></>, <><code>firewall-cmd --permanent --add-service=http</code></>],
          ]} />
          <p>
            Documentația <code>firewall-cmd</code>: fără <code>--permanent</code>, o schimbare afectează doar configurația runtime; cu <code>--permanent</code>, este salvată, dar „nu are efect imediat, doar după restart/reload sau reboot”. Pentru efect <b>imediat și persistent</b> ai trei metode echivalente:
          </p>
          <Table head={['Metoda', 'Pași']} rows={[
            ['A. Comanda de două ori', <><code>firewall-cmd --add-service=http</code> și <code>firewall-cmd --permanent --add-service=http</code></>],
            ['B. Permanent, apoi reload (cea mai folosită)', <><code>firewall-cmd --permanent --add-service=http</code> apoi <code>firewall-cmd --reload</code></>],
            ['C. Runtime, apoi salvare', <><code>firewall-cmd --add-service=http</code> apoi <code>firewall-cmd --runtime-to-permanent</code></>],
          ]} />
          <Callout kind="warn" title="Capcana nr. 1: „merge acum, dispare după reboot”">
            Dacă rulezi doar <code>firewall-cmd --add-service=http</code>, serviciul web devine accesibil acum, dar după <code>--reload</code> sau reboot regula dispare. Invers, dacă rulezi doar <code>--permanent</code> și uiți <code>--reload</code>, regula nu este încă activă și testul tău eșuează. Verifică ambele: <code>firewall-cmd --list-all</code> (runtime) și <code>firewall-cmd --permanent --list-all</code> (permanent).
          </Callout>

          <h4>2. Ce face --reload și ce nu</h4>
          <ul>
            <li><code>--reload</code>: „configurația permanentă curentă devine noua configurație runtime”; conexiunile existente se păstrează (păstrează starea). <b>Modificările runtime nesalvate se pierd.</b></li>
            <li><code>--complete-reload</code>: reîncarcă tot, inclusiv modulele netfilter; „va întrerupe probabil conexiunile active”; doar pentru probleme grave.</li>
            <li><code>--runtime-to-permanent</code>: salvează configurația runtime activă peste cea permanentă.</li>
            <li><code>--check-config</code>: validează fișierele permanente (XML și semantică).</li>
            <li><code>--state</code>: arată dacă firewalld rulează (cod de ieșire 0 dacă da).</li>
          </ul>

          <h4>3. Servicii: nume în loc de numere</h4>
          <p>
            Un <b>serviciu</b> este un fișier XML cu porturi, protocoale și, uneori, module. Definițiile livrate sunt în <code>/usr/lib/firewalld/services/</code> (nu se editează); cele personalizate se pun în <code>/etc/firewalld/services/</code>. <code>--get-services</code> le listează, <code>--info-service=NUME</code> arată porturile. Dacă există un serviciu predefinit (<code>http</code>), îl preferi unui port brut (<code>80/tcp</code>), pentru claritate. Dacă serviciul rulează pe un port neobișnuit, deschizi <b>portul</b>.
          </p>
          <CodeBlock title="/usr/lib/firewalld/services/http.xml (conținut tipic)" kind="config" label="illustrative" code={`<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>WWW (HTTP)</short>
  <description>HTTP is the protocol used to serve Web pages. ...</description>
  <port protocol="tcp" port="80"/>
</service>`} explain={[
            ['<service>', 'definiția unui serviciu.'],
            ['<short> / <description>', 'nume afișat și descriere.'],
            ['<port protocol="tcp" port="80"/>', 'portul și protocolul pe care serviciul le deschide când este activat într-o zonă.'],
          ]} />
          <p className="small">Conținutul este ilustrativ (format cunoscut din practică, nerecitit în sursă în această sesiune).</p>

          <h4>4. Porturi, intervale, protocoale</h4>
          <p>
            Format: <code>PORT[-PORT]/PROTOCOL</code>; protocoale: <code>tcp</code>, <code>udp</code>, <code>sctp</code>, <code>dccp</code>. Exemple: <code>8080/tcp</code>, <code>5000-5010/udp</code>. Un port în firewall nu pornește niciun serviciu: dacă nu există un proces care ascultă pe acel port, conexiunea este refuzată de sistem (nu de firewall). Verifici cu <code>ss -tulpn</code>.
          </p>

          <h4>5. Surse și reguli bogate (restricții fine)</h4>
          <p>
            Obiectivul C8-4 spune „<b>restrict</b> network access”. Restricția se face în mai multe feluri:
          </p>
          <Table head={['Vrei să…', 'Metoda']} rows={[
            ['permiți un serviciu tuturor', <><code>--add-service=NUME</code> în zona potrivită</>],
            ['elimini un serviciu permis', <><code>--remove-service=NUME</code></>],
            ['permiți un serviciu doar de la o rețea', <>legi sursa la o zonă: <code>--zone=internal --add-source=192.0.2.0/24</code> + <code>--zone=internal --add-service=ssh</code>; sau <b>rich rule</b></>],
            ['respingi/arunci traficul de la o sursă', <>legi sursa la zona <code>drop</code> sau <code>block</code>; sau rich rule cu <code>reject</code>/<code>drop</code></>],
            ['limitezi în timp', <><code>--timeout=300</code> (doar runtime; nu se combină cu <code>--permanent</code>)</>],
          ]} />
          <p>
            O <G id="rich-rule">rich rule</G> este o regulă în limbaj extins, de exemplu: <code>rule family="ipv4" source address="192.0.2.0/24" service name="ssh" accept</code> („acceptă ssh doar de la rețeaua 192.0.2.0/24”). Sintaxa de mai sus este din cunoștințe (pagina <code>firewalld.richlanguage(5)</code> nu a putut fi citită); folosește-o cu atenție și verifică cu <code>--list-rich-rules</code>.
          </p>

          <h4>6. Interfețe și zone, în legătură cu NetworkManager</h4>
          <p>
            O interfață este legată de zonă la activarea conexiunii. Mutarea ei: <code>firewall-cmd --zone=internal --change-interface=enp7s0</code> (echivalent cu <code>--remove-interface</code> urmat de <code>--add-interface</code>). Pentru persistență, legarea trebuie făcută cu <code>--permanent</code> și/sau în profilul NetworkManager (<code>nmcli connection modify ID connection.zone internal</code>; din cunoștințe, de confirmat pe RHEL 10).
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd (L4.9):</b> <code>firewalld.service</code> trebuie <code>enabled</code> și <code>active</code>: <code>systemctl enable --now firewalld</code>.</li>
            <li><b>NetworkManager (L8.2):</b> activarea profilului leagă interfața de o zonă; <code>connection.zone</code> poate fixa zona.</li>
            <li><b>Servicii din alte capitole:</b> SSH (L1.11), NFS (L6.3: <code>nfs</code>, <code>mountd</code>, <code>rpc-bind</code> pe server), chrony server (<code>ntp</code>, UDP 123), web (<code>http</code>/<code>https</code>) — fiecare cere o regulă de firewall pe server.</li>
            <li><b>SELinux (C10):</b> straturi independente: un serviciu pe un port neobișnuit cere <b>și</b> context SELinux pentru port, <b>și</b> regulă de firewall.</li>
            <li><b>nftables:</b> backend-ul din kernel; nu editezi regulile direct când folosești firewalld.</li>
            <li><b>Journal (L4.7):</b> <code>journalctl -u firewalld</code> arată erorile de configurare și reîncărcările.</li>
            <li><b>Adrese (L8.1):</b> regulile pe surse folosesc notația CIDR (<code>192.0.2.0/24</code>); IPv4 și IPv6 au reguli de familie diferite (<code>family="ipv4"</code>/<code>"ipv6"</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La instalarea unui serviciu de rețea: deschizi doar ce e necesar (ex. <code>http</code> pentru un server web).</li>
            <li>La depanarea unui serviciu „care nu răspunde din exterior” deși rulează: verifici dacă firewall-ul îl blochează.</li>
            <li>La restricționarea accesului administrativ (SSH doar din rețeaua de management).</li>
            <li>La izolarea rapidă a unei surse suspecte (zona <code>drop</code>).</li>
            <li>Examen: „allow the http service permanently”, „open port 8080/tcp so it persists across reboots”, „configure the firewall so SSH is accepted only from 192.0.2.0/24”, „remove a service from the public zone”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="warn" title="Risc: nu te bloca din SSH">
          Dacă lucrezi prin SSH, <b>nu elimina</b> serviciul <code>ssh</code> și nu muta interfața în zonele <code>drop</code>/<code>block</code> fără acces la consola mașinii. Platforma nu rulează comenzile; output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Adresele și porturile sunt fictive (intervale de documentație).
        </Callout>

        <h4>1. Starea serviciului și a firewall-ului</h4>
        <CodeBlock title="comenzi" code={`rpm -q firewalld || sudo dnf install -y firewalld\nsudo systemctl enable --now firewalld\nsystemctl is-active firewalld\nsystemctl is-enabled firewalld\nsudo firewall-cmd --state\nsudo firewall-cmd --get-default-zone\nsudo firewall-cmd --get-active-zones`} explain={[
          ['rpm -q firewalld || …', 'verifică pachetul; dacă lipsește, îl instalează.'],
          ['systemctl enable --now firewalld', 'activează la boot și pornește acum (obligatoriu pentru ca regulile să existe).'],
          ['is-active / is-enabled', 'active, respectiv enabled.'],
          ['firewall-cmd --state', 'afișează running dacă daemonul rulează; altfel „not running”.'],
          ['--get-default-zone', 'zona folosită pentru interfețele fără zonă explicită.'],
          ['--get-active-zones', 'zonele care au interfețe sau surse legate, cu lista lor.'],
        ]} />

        <h4>2. Vezi ce este permis</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --list-all\nsudo firewall-cmd --zone=public --list-all\nsudo firewall-cmd --list-services\nsudo firewall-cmd --list-ports\nsudo firewall-cmd --get-zones\nsudo firewall-cmd --get-services\nsudo firewall-cmd --info-service=http\nsudo firewall-cmd --permanent --list-all\nsudo firewall-cmd --list-all-zones`} explain={[
          ['--list-all', 'tot ce este activ în zona implicită: interfețe, surse, servicii, porturi, reguli (runtime).'],
          ['--zone=public', 'alegi zona explicit în loc de cea implicită.'],
          ['--list-services / --list-ports', 'doar serviciile, respectiv porturile deschise.'],
          ['--get-zones', 'zonele predefinite disponibile.'],
          ['--get-services', 'toate serviciile predefinite (listă lungă; poți filtra cu | tr " " "\\n" | grep).'],
          ['--info-service=http', 'porturile și protocoalele unui serviciu.'],
          ['--permanent --list-all', 'configurația SALVATĂ (permanentă); o compari cu cea runtime.'],
          ['--list-all-zones', 'toate zonele și conținutul lor.'],
        ]} />

        <h4>3. Deschide un serviciu (varianta recomandată)</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --permanent --add-service=http\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-services\nsudo firewall-cmd --permanent --list-services\nsudo firewall-cmd --query-service=http`} explain={[
          ['--permanent --add-service=http', 'scrie regula în configurația salvată (nu activă încă).'],
          ['--reload', 'configurația permanentă devine runtime: regula este acum activă.'],
          ['--list-services', 'runtime: trebuie să conțină http.'],
          ['--permanent --list-services', 'permanent: trebuie să conțină http.'],
          ['--query-service=http', 'răspunde yes/no (cod de ieșire 0/1): util în scripturi.'],
        ]} />
        <p className="small">
          Alte forme echivalente: (A) <code>--add-service=http</code> urmat de <code>--permanent --add-service=http</code> (aceeași comandă de două ori); (C) <code>--add-service=http</code> și apoi <code>--runtime-to-permanent</code>. Atenție la C: salvează <b>toată</b> configurația runtime (inclusiv orice altă modificare temporară făcută între timp).
        </p>

        <h4>4. Deschide un port</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --permanent --add-port=8080/tcp\nsudo firewall-cmd --permanent --add-port=5000-5010/udp\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-ports\nsudo firewall-cmd --query-port=8080/tcp\nsudo ss -tulpn | grep 8080`} explain={[
          ['--add-port=8080/tcp', 'deschide portul TCP 8080 (format PORT/PROTOCOL).'],
          ['--add-port=5000-5010/udp', 'un interval de porturi UDP (PORT-PORT/PROTOCOL).'],
          ['--reload', 'activează regulile salvate.'],
          ['--list-ports', 'ar trebui să apară 8080/tcp și 5000-5010/udp.'],
          ['--query-port', 'yes/no pentru un port anume.'],
          ['ss -tulpn | grep 8080', 'ss arată socket-urile (-t TCP, -u UDP, -l în ascultare, -p procesul, -n numeric); confirmă că ascultă un proces; altfel portul deschis nu ajută.'],
        ]} />

        <h4>5. Elimină un serviciu sau un port</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --permanent --remove-service=http\nsudo firewall-cmd --permanent --remove-port=8080/tcp\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-all`} explain={[
          ['--remove-service / --remove-port', 'inversul lui add; la fel, cu --permanent + --reload pentru persistență.'],
          ['--reload', 'aplică ștergerea în runtime.'],
        ]} />
        <Callout kind="warn" title="Nu elimina ssh când ești conectat prin SSH">
          Conexiunea existentă poate rămâne (starea este păstrată), dar următoarea conectare va fi refuzată. Dacă ai greșit, repari de la consola mașinii.
        </Callout>

        <h4>6. Zone: schimbă zona implicită și mută o interfață</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --get-default-zone\nsudo firewall-cmd --set-default-zone=internal\nsudo firewall-cmd --get-active-zones\nsudo firewall-cmd --zone=public --change-interface=enp7s0\nsudo firewall-cmd --permanent --zone=public --change-interface=enp7s0\nsudo firewall-cmd --get-active-zones`} explain={[
          ['--set-default-zone=internal', 'schimbă zona implicită; este atât runtime, cât și permanent (documentația firewall-cmd).'],
          ['--get-active-zones', 'arată ce interfețe aparțin fiecărei zone.'],
          ['--zone=public --change-interface=enp7s0', 'mută interfața în zona dată (runtime); echivalent remove + add.'],
          ['--permanent --zone=… --change-interface', 'aceeași mutare, salvată.'],
        ]} />

        <h4>7. Restricționează după sursă</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --permanent --zone=internal --add-source=192.0.2.0/24\nsudo firewall-cmd --permanent --zone=internal --add-service=ssh\nsudo firewall-cmd --reload\nsudo firewall-cmd --zone=internal --list-all\nsudo firewall-cmd --permanent --zone=drop --add-source=203.0.113.50\nsudo firewall-cmd --reload\nsudo firewall-cmd --get-active-zones`} explain={[
          ['--zone=internal --add-source=192.0.2.0/24', 'toate pachetele cu sursa din 192.0.2.0/24 sunt tratate după zona internal.'],
          ['--zone=internal --add-service=ssh', 'în acea zonă ssh este permis.'],
          ['--zone=drop --add-source=203.0.113.50', 'pachetele de la acea adresă sunt aruncate fără răspuns.'],
          ['--reload', 'activează configurația salvată.'],
        ]} />
        <p className="small">
          Pentru ca „ssh doar din 192.0.2.0/24” să fie și o restricție reală, serviciul <code>ssh</code> trebuie scos din zona unde este permis tuturor (de exemplu <code>public</code>); altfel rămâne accesibil de oriunde prin zona implicită. Alternativa: o <b>rich rule</b> (mai jos).
        </p>

        <h4>8. Reguli bogate (rich rules)</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.0.2.0/24" service name="http" accept'\nsudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="203.0.113.50" port port="8080" protocol="tcp" reject'\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-rich-rules\nsudo firewall-cmd --permanent --remove-rich-rule='rule family="ipv4" source address="203.0.113.50" port port="8080" protocol="tcp" reject'`} explain={[
          ['--add-rich-rule=\'…\'', 'adaugă o regulă extinsă; ghilimele simple în jurul întregii reguli, ghilimele duble în interior.'],
          ['rule family="ipv4"', 'regula se aplică doar pe IPv4.'],
          ['source address="192.0.2.0/24"', 'condiția: sursa din acea rețea.'],
          ['service name="http" / port port="8080" protocol="tcp"', 'ținta: un serviciu sau un port.'],
          ['accept / reject', 'acțiunea: acceptă sau respinge (cu mesaj).'],
          ['--list-rich-rules', 'afișează regulile din zona implicită.'],
          ['--remove-rich-rule', 'elimină exact aceeași regulă (textul trebuie identic).'],
        ]} />

        <h4>9. Reguli temporare și salvarea runtime</h4>
        <CodeBlock title="comenzi" code={`sudo firewall-cmd --add-service=http --timeout=300\nsudo firewall-cmd --list-services\nsudo firewall-cmd --add-port=9090/tcp\nsudo firewall-cmd --runtime-to-permanent\nsudo firewall-cmd --check-config`} explain={[
          ['--timeout=300', 'regula este temporară: se șterge după 300 de secunde (sau cu s/m/h). Nu se combină cu --permanent (documentația).'],
          ['--runtime-to-permanent', 'salvează configurația runtime curentă în cea permanentă.'],
          ['--check-config', 'validează fișierele permanente.'],
        ]} />

        <h4>10. Diagnostic</h4>
        <CodeBlock title="comenzi" code={`sudo systemctl status firewalld --no-pager\nsudo journalctl -u firewalld --no-pager | tail -15\nsudo ss -tulpn\nsudo firewall-cmd --permanent --list-all\nsudo firewall-cmd --list-all\nls /etc/firewalld/zones/`} explain={[
          ['systemctl status firewalld', 'este activ? ultimele linii de log.'],
          ['journalctl -u firewalld', 'erori de configurare, reîncărcări.'],
          ['ss -tulpn', 'ce procese ascultă pe ce porturi (cineva trebuie să asculte).'],
          ['--permanent --list-all vs --list-all', 'compari salvat vs activ: diferențele arată ce lipsește (reload) sau ce este temporar.'],
          ['ls /etc/firewalld/zones/', 'fișierele XML ale zonelor modificate permanent (de exemplu public.xml).'],
        ]} />

        <h4>11. Configurația salvată (doar de citit)</h4>
        <CodeBlock title="/etc/firewalld/zones/public.xml" kind="config" label="illustrative" code={`<?xml version="1.0" encoding="utf-8"?>
<zone>
  <short>Public</short>
  <description>For use in public areas. ...</description>
  <service name="ssh"/>
  <service name="dhcpv6-client"/>
  <service name="http"/>
  <port protocol="tcp" port="8080"/>
  <rule family="ipv4">
    <source address="192.0.2.0/24"/>
    <service name="http"/>
    <accept/>
  </rule>
</zone>`} explain={[
          ['<zone>', 'definiția zonei public cu modificările tale permanente.'],
          ['<service name="ssh"/>', 'serviciu permis în zonă (există în configurația implicită uzuală).'],
          ['<service name="http"/>', 'adăugat de tine cu --permanent.'],
          ['<port protocol="tcp" port="8080"/>', 'portul deschis permanent.'],
          ['<rule family="ipv4">…', 'rich rule salvată sub formă XML.'],
        ]} />
        <p className="small">Conținut ilustrativ; fișierul real depinde de ce ai modificat (de confirmat structura exactă pe RHEL 10). Nu îl edita de mână fără motiv; folosește <code>firewall-cmd</code>.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="firewall-cmd --list-all" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo firewall-cmd --list-all
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: enp1s0
  sources:
  services: cockpit dhcpv6-client http ssh
  ports: 8080/tcp
  protocols:
  forward: yes
  masquerade: no
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
	rule family="ipv4" source address="192.0.2.0/24" service name="http" accept`} />
        <p className="small">
          <b>public (active)</b>: numele zonei; „active” = are interfețe sau surse legate. <b>target: default</b>: ce se întâmplă cu traficul care nu se potrivește nicio regulă (default = respins, cu excepția ICMP permis). <b>interfaces</b>: interfețele legate de zonă. <b>sources</b>: adrese sursă legate (gol aici). <b>services</b>: serviciile permise (aici și <code>cockpit</code> — posibil implicit; de confirmat). <b>ports</b>: porturile adăugate manual. <b>rich rules</b>: regulile extinse. Câmpurile exacte variază între versiuni.
        </p>
        <CodeBlock title="--get-active-zones" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo firewall-cmd --get-active-zones
internal
  sources: 192.0.2.0/24
public (default)
  interfaces: enp1s0`} />
        <p className="small">
          Două zone active: <b>internal</b> are legată o sursă (192.0.2.0/24), deci traficul de acolo este tratat după regulile ei; <b>public (default)</b> este zona implicită și are interfața <code>enp1s0</code>. Pachetele din 192.0.2.0/24 urmează zona internal chiar dacă intră pe enp1s0.
        </p>
        <CodeBlock title="runtime vs permanent" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo firewall-cmd --add-service=http
success
[student@server1 ~]$ sudo firewall-cmd --list-services
dhcpv6-client http ssh
[student@server1 ~]$ sudo firewall-cmd --permanent --list-services
dhcpv6-client ssh
[student@server1 ~]$ sudo firewall-cmd --reload
success
[student@server1 ~]$ sudo firewall-cmd --list-services
dhcpv6-client ssh`} />
        <p className="small">
          Aici se vede capcana: <code>http</code> a fost adăugat doar în runtime. <code>--permanent --list-services</code> nu îl conține. După <code>--reload</code>, runtime-ul este rescris din permanent și <code>http</code> <b>dispare</b>. (Răspunsul <code>success</code> și lista serviciilor sunt ilustrative.)
        </p>
        <CodeBlock title="mesaje uzuale" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo firewall-cmd --permanent --add-service=htpp
Error: INVALID_SERVICE: htpp
[student@server1 ~]$ sudo firewall-cmd --permanent --add-service=http
Warning: ALREADY_ENABLED: http
success
[student@server1 ~]$ firewall-cmd --state
not running`} />
        <p className="small">
          <b>INVALID_SERVICE</b>: numele serviciului nu există (greșeală de scriere; verifică cu <code>--get-services</code>). <b>ALREADY_ENABLED</b>: serviciul era deja adăugat; nu este o eroare gravă. <b>not running</b>: daemonul nu rulează (<code>systemctl start firewalld</code>); fără el, <code>firewall-cmd</code> nu poate modifica nimic. Textele exacte sunt din practică, nu din pagina citită (de confirmat pe RHEL 10).
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Daemon:</b> <code>firewall-cmd --state</code> → <code>running</code>; <code>systemctl is-enabled firewalld</code> → <code>enabled</code>.</li>
            <li><b>Runtime:</b> <code>firewall-cmd --list-all</code> (sau <code>--list-services</code>, <code>--list-ports</code>) conține regula.</li>
            <li><b>Permanent:</b> <code>firewall-cmd --permanent --list-all</code> conține aceeași regulă. Dacă diferă, ai uitat <code>--permanent</code> sau <code>--reload</code>.</li>
            <li><b>Zona corectă:</b> <code>--get-active-zones</code> și <code>--get-default-zone</code>; regula trebuie să fie în zona în care se află interfața/sursa.</li>
            <li><b>Funcțional (din alt sistem):</b> <code>curl http://server1</code>, <code>nc -zv server1 8080</code> sau <code>ssh server1</code> reușesc doar dacă și serviciul ascultă (<code>ss -tulpn</code>).</li>
            <li><b>Persistență:</b> după <code>--reload</code> regula rămâne; ideal, după reboot.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Persistă doar ce este în configurația <b>permanentă</b> (<code>/etc/firewalld/</code>), plus faptul că serviciul <code>firewalld</code> este <code>enabled</code>. Regulile adăugate fără <code>--permanent</code> sau cu <code>--timeout</code> se pierd la <code>--reload</code>/reboot. <code>--set-default-zone</code> este persistentă (documentația).
          </p>
          <p>
            Confirmare manuală: <code>sudo reboot</code>; apoi <code>systemctl is-enabled firewalld</code>, <code>firewall-cmd --list-all</code> și testul funcțional din alt sistem. Dacă nu poți reporni, <code>firewall-cmd --reload</code> simulează efectul: tot ce dispare nu era permanent.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Serviciul nu răspunde din exterior, dar rulează local', 'firewall-ul nu permite portul/serviciul în zona activă', <><code>firewall-cmd --list-all</code>, <code>ss -tulpn</code></>, <>adaugă serviciul/portul în zona corectă, <code>--permanent</code> + <code>--reload</code></>],
          ['Regula dispare după reboot/reload', 'ai uitat --permanent', <><code>firewall-cmd --permanent --list-all</code></>, <>adaugă cu <code>--permanent</code> sau <code>--runtime-to-permanent</code></>],
          ['Regula permanentă nu are efect', 'ai uitat --reload', <><code>--list-all</code> vs <code>--permanent --list-all</code></>, <code>firewall-cmd --reload</code>],
          ['Regula e într-o zonă, dar interfața e în alta', 'zonă greșită', <><code>--get-active-zones</code></>, <>folosește <code>--zone=ZONA_CORECTĂ</code> sau mută interfața</>],
          [<><code>INVALID_SERVICE</code> / <code>INVALID_PORT</code></>, 'nume sau format greșit', <><code>--get-services</code>; formatul PORT/PROTOCOL</>, 'corectează numele (ex. 8080/tcp)'],
          [<><code>FirewallD is not running</code></>, 'daemonul nu rulează', <code>systemctl status firewalld</code>, <code>systemctl enable --now firewalld</code>],
          ['Port deschis, dar conexiunea este refuzată', 'niciun proces nu ascultă; sau SELinux blochează portul', <><code>ss -tulpn</code>, <code>journalctl</code></>, 'pornește serviciul; configurează contextul de port SELinux (C10)'],
          ['Ai pierdut accesul SSH', 'ai scos ssh sau ai mutat interfața în drop/block', 'consola mașinii', <>repornește accesul: <code>firewall-cmd --add-service=ssh</code> (+ permanent)</>],
          ['Rich rule respinsă', 'sintaxă greșită (ghilimele, ordinea cuvintelor)', <><code>firewall-cmd --permanent --add-rich-rule=…</code> (mesaj de eroare)</>, 'corectează sintaxa; ghilimele simple în exterior, duble în interior'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Rulezi doar <code>--add-service</code> (fără <code>--permanent</code>): merge acum, dispare după reload/reboot.</>,
          <>Rulezi doar <code>--permanent --add-service</code> (fără <code>--reload</code>): regula nu este încă activă.</>,
          <>Combini <code>--timeout</code> cu <code>--permanent</code>: nu este permis.</>,
          <>Deschizi portul în zona greșită (nu în cea a interfeței).</>,
          <>Deschizi un port, dar nu pornești serviciul sau nu verifici că ascultă (<code>ss -tulpn</code>).</>,
          <>Scrii porturi fără protocol (<code>8080</code> în loc de <code>8080/tcp</code>).</>,
          <>Dezactivezi firewalld „ca să meargă” în loc să deschizi ce trebuie: la examen e penalizat și nesigur.</>,
          <>Uiți <code>systemctl enable firewalld</code> când se cere ca firewall-ul să pornească la boot.</>,
          <>Elimini <code>ssh</code> sau muți interfața în <code>drop</code> când ești conectat prin SSH.</>,
          <>Folosești <code>--complete-reload</code> acolo unde <code>--reload</code> ajunge (poate întrerupe conexiuni active).</>,
          <>Crezi că <code>--reload</code> păstrează modificările runtime nesalvate: le pierde.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: target, ICMP, masquerade, port forwarding, policies și backend">
        <p>
          <b>target:</b> comportamentul zonei pentru traficul care nu se potrivește niciunei reguli: <code>default</code> (respinge cu mesaj, dar permite anumite ICMP), <code>ACCEPT</code>, <code>REJECT</code>, <code>DROP</code>. Se schimbă cu <code>--permanent --zone=ZONA --set-target=…</code> (din cunoștințe).
        </p>
        <p>
          <b>ICMP:</b> <code>ping</code> folosește ICMP; zonele pot bloca tipuri ICMP (<code>--add-icmp-block=echo-request</code>). Pentru IPv6, ICMPv6 este esențial (descoperirea vecinilor, Path MTU); nu se blochează în bloc.
        </p>
        <p>
          <b>Masquerade și port forwarding:</b> <code>--add-masquerade</code> face NAT pentru ieșire (zona <code>external</code> o are); <code>--add-forward-port=port=80:proto=tcp:toport=8080</code> redirecționează porturi. Nu fac parte din obiectivul de bază.
        </p>
        <p>
          <b>Policies:</b> în versiunile recente, firewalld folosește „policies” pentru traficul între zone (forward/masquerade); zonele rămân baza pentru traficul către host (din cunoștințe, de confirmat).
        </p>
        <p>
          <b>Backend:</b> firewalld generează reguli nftables; <code>nft list ruleset</code> le arată. Nu amesteca editarea directă cu firewalld, care le va rescrie la următoarea reîncărcare.
        </p>
        <p>
          <b>Panic mode:</b> <code>firewall-cmd --panic-on</code> blochează tot traficul (inclusiv SSH); <code>--panic-off</code> îl reia. Util doar în incidente, cu acces la consolă.
        </p>
      </DeepDive>
    </>
  );
}

export const L8_4: TopicModule = {
  id: 'L8.4',
  subtitle: 'firewalld: zone, servicii, porturi, runtime vs permanent, --reload, surse, rich rules; firewall-cmd',
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
  labs: [LAB_L8_4A, LAB_L8_4B],
  sources: [
    { kind: 'upstream', ref: 'firewall-cmd(1) — documentația firewalld (firewalld.org), citită 2026-11-16; „Predefined zones” — firewalld.org, citită 2026-11-16' },
    { kind: 'man', ref: 'ss(8), nft(8) — din cunoștințe, necitite; firewalld.richlanguage(5) — pagina man7 → 404, necitită' },
    { kind: 'doc', ref: 'RHEL 10 — „Using and configuring firewalld” (docs.redhat.com): necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
