import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L7_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un calculator își ține ceasul cu un oscilator ieftin, care <b>se dezacordează</b> cu secunde pe zi. Protocolul <G id="ntp">NTP</G> îl corectează față de servere de timp. Pe RHEL clientul NTP este <G id="chrony">chrony</G>: daemonul <code>chronyd</code> (serviciul <code>chronyd</code>), configurat în <code>/etc/chrony.conf</code> cu linii <code>server</code> / <code>pool</code>, controlat cu <code>chronyc</code> (<code>chronyc sources</code>, <code>chronyc tracking</code>). Starea generală a timpului și fusul orar se văd cu <G id="timedatectl"><code>timedatectl</code></G>.
          </p>
          <p>Obiectivul oficial: <i>„Configure time service clients”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>De ce contează ora exactă</h4>
          <p>
            Ora pare un detaliu minor, dar o mulțime de mecanisme se bazează pe ea:
          </p>
          <ul>
            <li><b>Loguri:</b> când investighezi un incident pe mai multe servere, ordonezi evenimentele după oră. Ceasuri dezacordate cu minute fac corelarea imposibilă.</li>
            <li><b>Certificate TLS/HTTPS:</b> au o dată de început și una de expirare; la un ceas greșit, conexiunile sunt respinse („certificate not yet valid” / „expired”).</li>
            <li><b>Autentificare (Kerberos, tokeni):</b> toleranța este de ordinul minutelor.</li>
            <li><b>Planificare (L7.1–L7.2):</b> cron și timerele rulează după ceasul sistemului.</li>
            <li><b>Sisteme distribuite, baze de date, copii de siguranță, fișiere pe NFS:</b> timestamp-urile fișierelor trebuie să fie comparabile.</li>
          </ul>

          <h4>Două ceasuri într-un calculator</h4>
          <Table head={['Ceas', 'Unde trăiește', 'Rol']} rows={[
            [<G id="rtc">RTC</G>, 'hardware (cip cu baterie pe placa de bază), numit și „ceasul hardware”', 'ține ora când calculatorul este oprit'],
            ['ceasul sistemului', 'kernelul Linux, numit și „ceasul de sistem” sau „system clock”', 'ora folosită de tot sistemul cât rulează'],
          ]} />
          <p>
            La boot, kernelul citește RTC-ul pentru a porni ceasul sistemului; apoi chrony îl corectează, iar, cu <code>rtcsync</code>, kernelul rescrie periodic RTC-ul din ceasul sistemului. Recomandare standard: RTC-ul ține ora în <G id="utc">UTC</G>, iar fusul orar se aplică doar la afișare (<code>timedatectl(1)</code>: „local RTC will create various problems”).
          </p>

          <h4>Ce face NTP</h4>
          <p>
            <b>NTP</b> (Network Time Protocol) este protocolul prin care un client întreabă un server „cât e ceasul?” și, din timpul dus-întors al mesajului, estimează <b>decalajul</b> (offset) față de el. Serverele sunt organizate pe niveluri numite <G id="stratum">stratum</G>:
          </p>
          <Table head={['Stratum', 'Ce este']} rows={[
            ['0', 'sursa fizică de timp (ceas atomic, receptor GPS) — nu este un server de rețea'],
            ['1', 'server conectat direct la o sursă stratum 0'],
            ['2', 'server care se sincronizează cu unul de stratum 1'],
            ['3…15', 'fiecare nivel se sincronizează cu cel de deasupra'],
          ]} />
          <p>
            Clientul tău, sincronizat cu un server de stratum 2, devine el însuși stratum 3. Cu cât numărul este mai mare, cu atât sursa este „mai departe” de ceasul de referință.
          </p>
          <Analogy>
            Ceasul de la gara centrală (stratum 1) este reglat după semnalul orar național (stratum 0). Ceasul din cartier (stratum 2) se potrivește după cel din gară. Tu nu mergi la semnalul național: te uiți la ceasul din cartier — dar te uiți la <b>mai multe</b> ceasuri și le compari, ca să nu fii păcălit de unul stricat.
          </Analogy>

          <h4>De ce chrony, nu ntpd</h4>
          <p>
            RHEL (din versiunea 8) folosește <b>chrony</b> ca implementare implicită; <code>ntpd</code> nu mai este oferit (din cunoștințe, de confirmat pe RHEL 10). chrony este conceput pentru sisteme care nu sunt conectate non-stop, pornesc des (VM-uri) și au ceasuri instabile: se sincronizează rapid după pornire. Pachetul cuprinde <b><code>chronyd</code></b> (daemonul) și <b><code>chronyc</code></b> (clientul de control).
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Offset, delay, jitter și mai multe surse</h4>
          <p>
            chronyd trimite periodic cereri către sursele configurate. Pentru fiecare sursă calculează <b>decalajul</b> (cât diferă ceasul tău de al ei) și <b>întârzierea</b> rețelei. Apoi compară mai multe surse: dacă una spune ceva diferit de majoritate, o declară <b>„falseticker”</b> și o ignoră. Din surse bune alege una „cea mai bună” și combină informațiile celorlalte. De aceea se recomandă <b>cel puțin 3–4 surse</b> (de aceea directiva <code>pool</code> aduce mai multe).
          </p>

          <h4>2. Slew vs step: cum își corectează ceasul</h4>
          <p>
            Dacă ceasul e în urmă cu 0,3 secunde, ar fi periculos să sari brusc înainte: programele care măsoară durate ar vedea o discontinuitate. chrony preferă să <G id="clock-slew-step"><b>slew</b></G> (accelerează sau încetinește ușor ceasul până recuperează decalajul, fără salturi). Când decalajul este mare, <b>step</b> (salt direct) este singura opțiune rezonabilă. Directiva <code>makestep</code> spune când este permis saltul.
          </p>
          <Table head={['', 'slew', 'step']} rows={[
            ['Ce face', 'modifică viteza ceasului', 'setează direct ora nouă'],
            ['Avantaj', 'timp continuu, fără salturi', 'corectează imediat decalaje mari'],
            ['Dezavantaj', 'lent (poate dura minute/ore pentru decalaje mari)', 'poate deranja programe sensibile la timp (chronyc(1): „stepping can disrupt software”)'],
            ['Cine decide', 'comportament implicit', <><code>makestep</code> în config, sau <code>chronyc makestep</code> manual</>],
          ]} />
          <p className="small">
            <code>makestep 1.0 3</code> (din configurația implicită uzuală; de confirmat pe RHEL 10) înseamnă: dacă decalajul depășește 1,0 secunde, <b>în primele 3 actualizări</b> după pornire fă step; după aceea, doar slew. Sensul este din documentația chrony: <code>makestep threshold limit</code>, unde un <code>limit</code> negativ înseamnă „oricând”.
          </p>

          <h4>3. Fișierul /etc/chrony.conf: directivele pe care trebuie să le știi</h4>
          <Table head={['Directivă', 'Sens (din documentația chrony)']} rows={[
            [<code>server nume [opțiuni]</code>, 'o sursă NTP anume; clientul se sincronizează cu ea, serverul nu este influențat'],
            [<code>pool nume [opțiuni]</code>, 'un nume DNS care se rezolvă în mai multe adrese schimbătoare; acceptă opțiunile lui server + maxsources (implicit 4, max 16)'],
            [<><code>iburst</code> (opțiune)</>, 'trimite o rafală de 4–8 cereri la început: prima sincronizare durează secunde, nu minute'],
            [<><code>minpoll / maxpoll</code> (opțiuni)</>, 'intervalul minim/maxim de interogare ca putere a lui 2 (implicit 6 = 64 s și 10 = 1024 s)'],
            [<code>makestep prag limită</code>, 'permite step dacă decalajul depășește pragul (secunde), doar în primele „limită” actualizări'],
            [<code>driftfile fișier</code>, 'unde se păstrează rata de dezacordare a ceasului, ca să fie compensată de la pornire'],
            [<code>rtcsync</code>, 'kernelul copiază periodic ora în RTC (din cunoștințe; necitit în sursă)'],
            [<code>allow subrețea</code>, 'permite și altor clienți să te folosească drept server; implicit nu permite pe nimeni, deci chronyd este doar client'],
            [<code>local stratum N</code>, 'răspunde ca server chiar fără sursă upstream (rețele izolate)'],
          ]} />
          <Callout kind="info" title="Client versus server">
            Obiectivul tău este <b>clientul</b>: <code>server</code> / <code>pool</code>. Fără directiva <code>allow</code>, chronyd <b>nu servește timp</b> altor mașini (documentația chrony: „implicit nu este permis niciun client”). Pentru acces la server ai nevoie de <code>allow</code> și de regula de firewall pentru UDP 123 (C8/C10); aici nu configurăm server.
          </Callout>

          <h4>4. Configurația implicită uzuală pe RHEL (Ilustrativ, de confirmat pe RHEL 10)</h4>
          <CodeBlock title="/etc/chrony.conf (aspect tipic RHEL 8/9)" kind="config" label="illustrative" code={`# Use public servers from the pool.ntp.org project.
pool 2.rhel.pool.ntp.org iburst

# Record the rate at which the system clock gains/losses time.
driftfile /var/lib/chrony/drift

# Allow the system clock to be stepped in the first three updates
# if its offset is larger than 1 second.
makestep 1.0 3

# Enable kernel synchronization of the real-time clock (RTC).
rtcsync

# Specify file containing keys for NTP authentication.
keyfile /etc/chrony.keys

# Save NTS keys and cookies.
ntsdumpdir /var/lib/chrony

# Specify directory for log files.
logdir /var/log/chrony`} explain={[
            ['pool 2.rhel.pool.ntp.org iburst', 'sursa implicită: mai multe servere dintr-un pool; iburst accelerează prima sincronizare.'],
            ['driftfile', 'fișierul în care chrony păstrează rata de dezacordare a ceasului.'],
            ['makestep 1.0 3', 'step permis dacă decalajul depășește 1 s, doar în primele 3 actualizări.'],
            ['rtcsync', 'ține RTC-ul sincronizat (din cunoștințe).'],
            ['keyfile / ntsdumpdir / logdir', 'autentificare cu chei, cookie-uri NTS, fișiere de log; nu intră în obiectiv.'],
          ]} />
          <p className="small">
            Versiunile pot adăuga linii (de exemplu <code>sourcedir</code> sau <code>confdir</code> pentru fișiere suplimentare). Pe RHEL 10 conținutul exact trebuie confirmat; <b>lecția nu garantează că fișierul tău arată așa</b>.
          </p>

          <h4>5. Modificarea configurației</h4>
          <p>
            Tipic la examen: „configure your system as an NTP client using the server <code>ntp.example.com</code>”. Pașii:
          </p>
          <ol>
            <li>Editezi <code>/etc/chrony.conf</code>: pui <code>server ntp.example.com iburst</code> și (de obicei) scoți/comentezi linia <code>pool</code>, ca să nu te sincronizezi și cu alte surse.</li>
            <li><code>systemctl restart chronyd</code> (chronyd citește configurația la pornire).</li>
            <li>Verifici cu <code>chronyc sources -v</code> că sursa ta apare și devine selectată.</li>
            <li>Te asiguri că <code>chronyd</code> este <b>activat la boot</b>: <code>systemctl enable --now chronyd</code>.</li>
          </ol>

          <h4>6. Cum citești chronyc sources</h4>
          <p>
            Coloana <b>MS</b> are două caractere. Primul = <b>mod</b>: <code>^</code> server, <code>=</code> peer, <code>#</code> ceas local de referință. Al doilea = <b>stare</b>:
          </p>
          <Table head={['Simbol', 'Înțeles (chronyc(1))']} rows={[
            [<code>*</code>, 'sursa curent selectată pentru sincronizare (cea mai bună)'],
            [<code>+</code>, 'sursă acceptabilă, combinată cu cea mai bună'],
            [<code>-</code>, 'acceptabilă, dar neselectată/combinată'],
            [<code>x</code>, 'falseticker: nu e de acord cu majoritatea'],
            [<code>~</code>, 'variabilitate prea mare'],
            [<code>?</code>, 'nu poate fi selectată: inaccesibilă, nesincronizată sau prea puține măsurători'],
          ]} />
          <p>
            Coloana <b>Reach</b> este un registru octal al ultimelor 8 interogări: <code>377</code> = toate cele 8 au primit răspuns; <code>0</code> = niciun răspuns. Imediat după pornire valoarea crește treptat (1, 3, 7, 17, 37, 77, 177, 377), fiindcă registrul se umple de la dreapta.
          </p>

          <h4>7. Cum citești chronyc tracking</h4>
          <Table head={['Câmp', 'Sens']} rows={[
            ['Reference ID', 'serverul cu care ești sincronizat (cod hex + nume); 7F7F0101 fără nume = mod local, nesincronizat extern'],
            ['Stratum', 'nivelul tău (stratum-ul serverului + 1)'],
            ['System time', 'cât diferă ceasul sistemului de ceasul NTP, chiar acum (cu precizarea „fast/slow of NTP time”)'],
            ['Last offset', 'decalajul măsurat la ultima actualizare; pozitiv = ceasul tău era înainte'],
            ['RMS offset', 'media pe termen lung a decalajelor (cu cât mai mic, cu atât mai bine)'],
            ['Leap status', 'Normal / Insert second / Delete second / Not synchronised'],
          ]} />

          <h4>8. timedatectl: starea generală a timpului</h4>
          <p>
            <code>timedatectl</code> (<code>timedatectl(1)</code>) este interfața systemd pentru ceas, fus orar și activarea sincronizării. <code>timedatectl status</code> (implicit) afișează <b>Local time</b>, <b>Universal time</b>, <b>RTC time</b>, <b>Time zone</b>, <b>System clock synchronized</b>, <b>NTP service</b> și <b>RTC in local TZ</b>. Pe RHEL, <code>timedatectl set-ntp true</code> activează și pornește serviciul NTP (chronyd); <code>set-ntp false</code> îl oprește și dezactivează (<code>timedatectl(1)</code>). Pagina nu definește exact „System clock synchronized” și „NTP service”: interpretarea din lecție („sincronizat” / „serviciul rulează”) este deducția naturală, de confirmat pe sistemul tău. <code>timedatectl set-time</code> este de obicei <b>refuzat cât timp sincronizarea NTP este activă</b> (din cunoștințe, de confirmat pe RHEL 10): oprești mai întâi sincronizarea.
          </p>
          <Table head={['Comandă', 'Rol']} rows={[
            [<code>timedatectl</code>, 'starea generală'],
            [<code>timedatectl list-timezones</code>, 'toate fusurile orare (un nume pe linie)'],
            [<code>timedatectl set-timezone Europe/Bucharest</code>, 'schimbă fusul orar (actualizează legătura /etc/localtime)'],
            [<code>timedatectl set-ntp true|false</code>, 'pornește/oprește serviciul NTP'],
            [<code>timedatectl set-time "2026-11-16 14:30:00"</code>, 'setează manual ora (și RTC-ul); refuzat dacă NTP este activ'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd (L4.9):</b> <code>chronyd.service</code> se gestionează cu <code>systemctl enable --now</code>, <code>restart</code>, <code>status</code>; log-urile în <code>journalctl -u chronyd</code>.</li>
            <li><b>Pachete (C2):</b> <code>dnf install chrony</code> dacă lipsește.</li>
            <li><b>Rețea și DNS (C8):</b> numele serverului trebuie rezolvat; fără rețea sau DNS, sursa apare cu <code>?</code>.</li>
            <li><b>Firewall (C8/C10):</b> clientul inițiază conexiuni de ieșire pe UDP 123; la server trebuie deschis portul (din cunoștințe, necitit în sursă).</li>
            <li><b>Cron și timere (L7.1–L7.2):</b> job-urile depind de ceasul corect.</li>
            <li><b>Loguri (L4.7):</b> timestamp-urile din jurnal vin din ceasul sistemului.</li>
            <li><b>Fusuri orare:</b> <code>timedatectl set-timezone</code>; ceasul rămâne UTC în interior.</li>
            <li><b>Boot (L4.1):</b> la boot, kernelul pornește ceasul din RTC; chronyd îl corectează apoi.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La orice server nou: confirmi că sincronizarea de timp funcționează.</li>
            <li>Când rețeaua companiei are propriul server NTP: înlocuiești <code>pool</code> cu <code>server ntp.firma.ro iburst</code>.</li>
            <li>Când timpul unui sistem este greșit sau logurile nu se potrivesc: <code>chronyc tracking</code>, <code>chronyc sources</code>.</li>
            <li>Examen: „configure chrony to use <code>classroom.example.com</code> as its only time source and make sure the service starts at boot”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile și nu oferă un server NTP">
          Ai nevoie de acces la un server NTP (public sau al tău). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Numele <code>ntp.example.com</code> și valorile numerice sunt fictive. Dacă nu ai acces la internet, folosește un server NTP din rețeaua ta de test.
        </Callout>

        <h4>1. Instalare, pornire, stare</h4>
        <CodeBlock title="comenzi" code={`rpm -q chrony || sudo dnf install -y chrony\nsudo systemctl enable --now chronyd\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd\nsystemctl status chronyd --no-pager`} explain={[
          ['rpm -q chrony || …', 'dacă pachetul lipsește (rpm -q eșuează), îl instalează.'],
          ['enable --now chronyd', 'activează la boot și pornește acum.'],
          ['is-active / is-enabled', 'active, respectiv enabled.'],
          ['status --no-pager', 'starea detaliată (PID, ultimele linii de log), fără paginare.'],
        ]} />

        <h4>2. Starea timpului</h4>
        <CodeBlock title="comenzi" code={`timedatectl\ntimedatectl status\ndate\ndate -u\nchronyc tracking\nchronyc sources\nchronyc sources -v\nchronyc sourcestats`} explain={[
          ['timedatectl', 'identic cu timedatectl status: ora locală/UTC, fus orar, sincronizare, serviciul NTP.'],
          ['date', 'ora curentă în fusul orar local.'],
          ['date -u', '-u = UTC (universal); compară cu ora locală pentru a deduce fusul orar.'],
          ['chronyc tracking', 'starea sincronizării: server, stratum, decalaj, status.'],
          ['chronyc sources', 'sursele folosite, cu starea lor (*, +, ?, x).'],
          ['chronyc sources -v', '-v = verbose: adaugă legenda coloanelor (foarte util pentru început).'],
          ['chronyc sourcestats', 'statistici per sursă: NP, NR, Span, Frequency, Offset, Std Dev.'],
        ]} />

        <h4>3. Configurarea unui server NTP anume (exemplul principal)</h4>
        <CodeBlock title="comenzi" code={`sudo cp -a /etc/chrony.conf /etc/chrony.conf.orig\nsudo vi /etc/chrony.conf\ngrep -Ev '^\\s*(#|$)' /etc/chrony.conf\nsudo systemctl restart chronyd\nchronyc sources -v`} explain={[
          ['cp -a /etc/chrony.conf /etc/chrony.conf.orig', '-a = copie care păstrează permisiunile; salvezi o copie de siguranță înainte de editare.'],
          ['vi /etc/chrony.conf', 'editezi fișierul (modificările în blocul de mai jos).'],
          ['grep -Ev \'^\\s*(#|$)\'', 'afișează fișierul fără comentarii și linii goale: -E = regex extins, -v = inversează potrivirea (exclude liniile care încep cu # sau sunt goale).'],
          ['systemctl restart chronyd', 'repornește daemonul ca să citească fișierul.'],
          ['chronyc sources -v', 'confirmi că sursa ta apare.'],
        ]} />
        <CodeBlock title="modificarea din /etc/chrony.conf" kind="config" code={`# pool 2.rhel.pool.ntp.org iburst\nserver ntp.example.com iburst`} explain={[
          ['# pool …', 'linia veche este comentată (diez în față), ca să nu mai fie folosită.'],
          ['server ntp.example.com iburst', 'sursa ta: un server anume; iburst = prima sincronizare rapidă.'],
        ]} />

        <h4>4. Mai multe surse, opțiuni</h4>
        <CodeBlock title="exemple de linii de sursă" kind="config" code={`server ntp1.example.com iburst\nserver ntp2.example.com iburst\npool pool.ntp.org iburst maxsources 3\nserver 192.0.2.10 iburst prefer`} explain={[
          ['server …1, …2', 'două servere independente (cel puțin 3–4 surse sunt recomandate; chrony poate detecta falseticker-ii).'],
          ['pool … maxsources 3', 'din pool folosește cel mult 3 surse (implicit 4).'],
          ['server 192.0.2.10 … prefer', 'adresă IP directă (nu depinde de DNS); prefer = preferă această sursă când e disponibilă.'],
        ]} />

        <h4>5. Forțează o corectare imediată</h4>
        <CodeBlock title="comenzi" code={`chronyc tracking\nsudo chronyc makestep\nchronyc tracking\ntimedatectl`} explain={[
          ['chronyc makestep', 'fără argumente: anulează slew-ul rămas și sare imediat la ora corectă. Folosește-l doar când decalajul este mare și nu poți aștepta.'],
          ['chronyc tracking (înainte/după)', 'compari „System time”: după makestep ar trebui să fie aproape de 0.'],
        ]} />

        <h4>6. Fus orar și activarea sincronizării</h4>
        <CodeBlock title="comenzi" code={`timedatectl list-timezones | grep Bucharest\nsudo timedatectl set-timezone Europe/Bucharest\ntimedatectl\nsudo timedatectl set-ntp true\nsudo timedatectl set-ntp false\nsudo timedatectl set-ntp true`} explain={[
          ['list-timezones | grep …', 'caută numele exact al fusului orar (format Regiune/Oraș).'],
          ['set-timezone Europe/Bucharest', 'schimbă fusul; ceasul intern rămâne UTC, se schimbă doar afișarea.'],
          ['set-ntp true', 'pornește și activează serviciul NTP (chronyd pe RHEL).'],
          ['set-ntp false', 'oprește și dezactivează sincronizarea; apoi o repornești cu true. În test, nu uita să o lași la true.'],
        ]} />
        <Callout kind="warn" title="Nu seta ora manual când chronyd funcționează">
          Un <code>date -s</code> sau <code>timedatectl set-time</code> pe un sistem cu NTP activ este fie refuzat, fie imediat corectat de chrony înapoi. Dacă ai nevoie temporar de o oră setată manual (test), oprești mai întâi sincronizarea (<code>timedatectl set-ntp false</code>) și o repornești la final. Pe sisteme de producție nu se face.
        </Callout>

        <h4>7. Diagnostic</h4>
        <CodeBlock title="comenzi" code={`journalctl -u chronyd --no-pager | tail -15\nchronyc activity\nchronyc sources -a\nss -ulpn | grep chronyd\ngetent hosts ntp.example.com\nping -c 2 ntp.example.com`} explain={[
          ['journalctl -u chronyd', 'jurnalul daemonului: „Selected source …”, „System clock wrong by … seconds”, erori de rezolvare.'],
          ['chronyc activity', 'câte surse sunt online/offline/neresolvate.'],
          ['chronyc sources -a', '-a = include și sursele fără adresă cunoscută (nerezolvate).'],
          ['ss -ulpn | grep chronyd', 'ss afișează socket-uri; -u UDP, -l în ascultare, -p procesul, -n numeric; arată porturile deschise de chronyd.'],
          ['getent hosts …', 'testează rezolvarea numelui exact ca aplicațiile (nsswitch, DNS).'],
          ['ping -c 2', 'testează conectivitatea (-c 2 = două pachete).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="chronyc sources -v" kind="session" label="illustrative" code={`[student@server1 ~]$ chronyc sources -v\n\n  .-- Source mode  '^' = server, '=' = peer, '#' = local clock.\n / .- Source state '*' = current best, '+' = combined, '-' = not combined,\n| /             'x' = may be in error, '~' = too variable, '?' = unusable.\n||                                                 .- xxxx [ yyyy ] +/- zzzz\n||      Reachability register (octal) -.           |  xxxx = adjusted offset,\n||      Log2(Polling interval) --.      |          |  yyyy = measured offset,\n||                                \\     |          |  zzzz = estimated error.\n||                                 |    |           \\\nMS Name/IP address         Stratum Poll Reach LastRx Last sample\n===============================================================================\n^* ntp.example.com               2   6   377    21   +128us[ +151us] +/-   18ms\n^+ ntp2.example.com              2   6   377    22    -87us[ -64us] +/-   25ms\n^? ntp3.example.com              0   6     0     -     +0ns[   +0ns] +/-    0ns`} />
        <p className="small">
          <b>Legenda</b> (liniile de sus) apare doar cu <code>-v</code>. <b>Prima sursă</b>, <code>^*</code>: <code>^</code> = server, <code>*</code> = <b>sursa selectată</b> pentru sincronizare; Stratum 2; Poll 6 (2⁶ = 64 s); Reach 377 (ultimele 8 răspunsuri valide); LastRx 21 = ultimul răspuns acum 21 s; <code>+128us</code> = offset de aproximativ 128 microsecunde, cu eroare estimată ±18 ms. <b>A doua</b>, <code>^+</code>: acceptabilă și combinată cu prima. <b>A treia</b>, <code>^?</code>: Reach 0 și Stratum 0 = nu răspunde (nerezolvată, inaccesibilă sau nepornită). Valorile sunt fictive.
        </p>
        <CodeBlock title="chronyc tracking" kind="session" label="illustrative" code={`[student@server1 ~]$ chronyc tracking\nReference ID    : C0000201 (ntp.example.com)\nStratum         : 3\nRef time (UTC)  : Mon Nov 16 12:35:42 2026\nSystem time     : 0.000012345 seconds fast of NTP time\nLast offset     : +0.000128034 seconds\nRMS offset      : 0.000210450 seconds\nFrequency       : 12.345 ppm slow\nResidual freq   : +0.001 ppm\nSkew            : 0.052 ppm\nRoot delay      : 0.031850000 seconds\nRoot dispersion : 0.000820000 seconds\nUpdate interval : 64.3 seconds\nLeap status     : Normal`} />
        <p className="small">
          <b>Reference ID</b>: sursa ta curentă. <b>Stratum 3</b>: serverul are stratum 2, deci tu ești 3. <b>System time</b>: ceasul tău este înainte cu ~12 microsecunde față de ceasul NTP — practic perfect. <b>Last offset</b>: decalajul la ultima actualizare. <b>Frequency</b>: cât de repede „se dezacordează” ceasul tău în mod natural (ppm = părți pe milion; „slow” = merge încet) — chrony compensează asta. <b>Leap status Normal</b>: sincronizat și fără secundă intercalară programată. Dacă ai vedea <code>Leap status : Not synchronised</code> și Reference ID <code>00000000 ()</code>, încă nu ai o sursă selectată.
        </p>
        <CodeBlock title="timedatectl" kind="session" label="illustrative" code={`[student@server1 ~]$ timedatectl\n               Local time: Mon 2026-11-16 14:35:50 EET\n           Universal time: Mon 2026-11-16 12:35:50 UTC\n                 RTC time: Mon 2026-11-16 12:35:50\n                Time zone: Europe/Bucharest (EET, +0200)\nSystem clock synchronized: yes\n              NTP service: active\n          RTC in local TZ: no`} />
        <p className="small">
          <b>Local time</b> și <b>Universal time</b>: aceeași oră în două reprezentări (aici diferă cu 2 ore: fusul <code>EET</code>, +0200). <b>RTC time</b> = ceasul hardware, ținut în UTC. <b>System clock synchronized: yes</b>: ceasul este sincronizat (interpretare din lecție; pagina man nu o definește). <b>NTP service: active</b>: serviciul de sincronizare rulează. <b>RTC in local TZ: no</b>: RTC-ul este în UTC (recomandat).
        </p>
        <CodeBlock title="surse problematice" kind="session" label="illustrative" code={`[student@server1 ~]$ chronyc sources\nMS Name/IP address         Stratum Poll Reach LastRx Last sample\n===============================================================================\n^? ntp.example.com               0   6     0     -     +0ns[   +0ns] +/-    0ns`} />
        <p className="small">
          Reach 0, Stratum 0, <code>?</code>: nicio măsurătoare valabilă. Cauze posibile: numele nu se rezolvă, firewall-ul blochează UDP 123 spre server, serverul nu este accesibil, sau <code>chronyd</code> abia a pornit (așteaptă ~1 minut, mai ales fără <code>iburst</code>). Diagnostic: <code>getent hosts</code>, <code>ping</code>, <code>journalctl -u chronyd</code>.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Serviciul:</b> <code>systemctl is-active chronyd</code> → <code>active</code>; <code>systemctl is-enabled chronyd</code> → <code>enabled</code>.</li>
            <li><b>Configurația citită:</b> <code>grep -Ev '^\s*(#|$)' /etc/chrony.conf</code> arată linia ta <code>server</code>.</li>
            <li><b>Sursa folosită:</b> <code>chronyc sources</code> arată serverul tău cu <code>^*</code> (selectat) sau cel puțin <code>^+</code>; Reach crește spre 377.</li>
            <li><b>Sincronizarea:</b> <code>chronyc tracking</code>: <code>Reference ID</code> corespunde serverului, <code>Leap status: Normal</code>, <code>System time</code> mic.</li>
            <li><b>Ora:</b> <code>timedatectl</code> arată <code>System clock synchronized: yes</code> și <code>NTP service: active</code>.</li>
            <li><b>Așteptare:</b> după restart, prima selecție poate dura de la câteva secunde (cu <code>iburst</code>) la câteva minute.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Configurația din <code>/etc/chrony.conf</code> persistă pe disc. Serviciul trebuie să fie <b>activat la boot</b> (<code>systemctl enable chronyd</code>); fără acest pas, după reboot ceasul nu mai este corectat. Fusul orar setat cu <code>timedatectl set-timezone</code> persistă (legătura <code>/etc/localtime</code>). <code>chronyc makestep</code> este o acțiune <b>punctuală</b>, nu o configurație.
          </p>
          <p>
            Confirmare manuală: <code>sudo reboot</code>; apoi <code>systemctl is-enabled chronyd</code>, <code>chronyc sources</code> (poate dura un minut), <code>timedatectl</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Sursa apare cu ^? și Reach 0', 'nume nerezolvat, firewall, server inaccesibil, abia pornit', <><code>getent hosts nume</code>, <code>ping</code>, <code>journalctl -u chronyd</code></>, 'corectează DNS/firewall/numele; așteaptă 1–2 minute'],
          ['Modificarea din chrony.conf nu are efect', 'chronyd nu a fost repornit', <><code>systemctl status chronyd</code>; timpul „Active since”</>, <code>systemctl restart chronyd</code>],
          [<><code>chronyc</code>: „506 Cannot talk to daemon”</>, 'chronyd oprit', <code>systemctl status chronyd</code>, <code>systemctl enable --now chronyd</code>],
          ['Ceasul rămâne greșit după restart', 'decalaj mare și step nepermis (makestep expirat)', <><code>chronyc tracking</code>, <code>journalctl -u chronyd</code></>, <><code>sudo chronyc makestep</code> sau verifică <code>makestep</code> din config</>],
          [<><code>timedatectl set-time</code> refuzat</>, 'NTP activ', <code>timedatectl</code>, <>oprește temporar <code>set-ntp false</code> (doar în test)</>],
          ['Ora corectă, dar fusul greșit', 'fus orar nesetat', <code>timedatectl</code>, <code>timedatectl set-timezone Regiune/Oraș</code>],
          ['Nu mai pornește după reboot', 'nu a fost activat', <code>systemctl is-enabled chronyd</code>, <code>systemctl enable --now chronyd</code>],
          ['Surse multiple, una cu x', 'falseticker', <code>chronyc sources</code>, 'scoate sursa dacă e a ta; folosește un server de încredere'],
          [<><code>Failed to parse</code> sau directivă ignorată în jurnal</>, 'greșeală de sintaxă în conf', <code>journalctl -u chronyd</code>, 'corectează linia; restart'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Editezi <code>/etc/chrony.conf</code> și uiți <code>systemctl restart chronyd</code>.</>,
          <>Uiți <code>enable</code>: merge acum, dar nu persistă după reboot.</>,
          <>Lași linia <code>pool</code> veche în loc să o comentezi când cerința este „doar serverul X”.</>,
          <>Confunzi <code>chronyd</code> (daemon) cu <code>chronyc</code> (client de control) sau pachetul <code>chrony</code> cu serviciul <code>chronyd</code>.</>,
          <>Încerci <code>date -s</code> / <code>timedatectl set-time</code> cu NTP activ.</>,
          <>Crezi că <code>*</code> din <code>chronyc sources</code> este o eroare: este sursa selectată (cea bună).</>,
          <>Crezi că Reach 0 imediat după start este permanent: crește treptat.</>,
          <>Uiți ghilimelele/spațiile la <code>timedatectl set-time "AAAA-LL-ZZ HH:MM:SS"</code>.</>,
          <>Scrii greșit numele fusului orar (<code>Europe/Bucharest</code>, nu „Romania” sau „Bucharest”); verifică cu <code>list-timezones</code>.</>,
          <>Uiți că obiectivul este <b>client</b>: nu adaugi <code>allow</code> fără motiv.</>,
          <>Nu salvezi o copie a fișierului înainte de editare.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: NTS, leap seconds, ppm și modul local">
        <p>
          <b>ppm și drift:</b> „parts per million”. Un ceas care merge cu 12 ppm prea încet pierde ~1 secundă la ~23 de ore (12 microsecunde pe secundă). chrony măsoară rata (drift) și o scrie în <code>driftfile</code>, ca să compenseze din primul moment după restart.
        </p>
        <p>
          <b>NTS (Network Time Security):</b> opțiunea <code>nts</code> la <code>server</code> autentifică serverul criptografic, în locul unor chei partajate (<code>key</code>); <code>ntsdumpdir</code> salvează cookie-urile ca să nu repete negocierea la fiecare restart (documentația chrony). Nu face parte din obiectiv.
        </p>
        <p>
          <b>Secunde intercalare (leap seconds):</b> uneori se adaugă o secundă în UTC; <code>Leap status</code> din <code>tracking</code> anunță „Insert second” / „Delete second”. chrony poate preciza fusul <code>right/UTC</code> cu <code>leapsectz</code>.
        </p>
        <p>
          <b>Modul local:</b> <code>local stratum 10</code> face ca un server să răspundă clienților chiar fără sursă upstream (rețele izolate); <code>Reference ID 7F7F0101</code> fără nume în <code>tracking</code> semnalează acest mod (<code>chronyc(1)</code>).
        </p>
        <p>
          <b>chronyd -q / -Q:</b> <code>chronyd -q</code> setează ceasul o dată și iese; <code>-Q</code> doar afișează decalajul, fără corectare (<code>chronyd(8)</code>). Utile în scripturi sau în teste, nu în serviciul normal.
        </p>
        <p>
          <b>Comparație cu systemd-timesyncd:</b> systemd are un client SNTP minimal; <code>timedatectl timesync-status</code> raportează starea lui (<code>timedatectl(1)</code>). Pe RHEL se folosește chrony; lecția nu necesită timesyncd.
        </p>
      </DeepDive>
    </>
  );
}

export const L7_3: TopicModule = {
  id: 'L7.3',
  subtitle: 'chrony: chronyd, /etc/chrony.conf (server, pool, iburst, makestep), chronyc sources/tracking, timedatectl',
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
  labs: [LAB_L7_3],
  sources: [
    { kind: 'upstream', ref: 'chrony.conf și chronyc — documentația chrony 4.6.1 (chrony-project.org), citite 2026-11-16 (chrony.conf: parțial, primele ~100 000 caractere)' },
    { kind: 'man', ref: 'chronyd(8), timedatectl(1) — man.archlinux.org / man7.org, citite 2026-11-16' },
    { kind: 'doc', ref: 'RHEL 10 — „Configuring time synchronization” / „Using chrony” (administer-using_chrony): docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
