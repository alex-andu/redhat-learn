import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_6A, LAB_L10_6B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            SELinux nu etichetează doar fișiere: și <b>porturile de rețea</b> au tipuri (<G id="port-label">port labels</G>). De exemplu, portul TCP <code>80</code> are tipul <code>http_port_t</code>, iar <code>22</code> are <code>ssh_port_t</code>. Un serviciu confinat (<code>httpd_t</code>, <code>sshd_t</code>…) poate asculta <b>doar</b> pe porturile ale căror tipuri îi sunt permise de politică. Dacă muți serviciul pe un port nestandard (de exemplu Apache pe <code>8085</code>) fără a eticheta portul, serviciul <b>nu pornește</b> („Permission denied” la <code>bind</code>), chiar dacă firewall-ul este deschis.
          </p>
          <p>
            Remedierea: <code>semanage port -a -t http_port_t -p tcp 8085</code> (se adaugă portul la un tip existent). Vezi portul cu <code>semanage port -l | grep http</code>; ce ai adăugat tu: <code>semanage port -l -C</code>. Regula este persistentă și are efect imediat.
          </p>
          <p>Obiectivul oficial: <i>„Manage SELinux port labels”</i>. Verificare: <code>semanage port -l</code>, <code>ss -tlnp</code>, <code>systemctl status</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: un serviciu compromis nu trebuie să asculte oriunde</h4>
          <p>
            Un port TCP/UDP este un număr (0–65535) prin care un program primește conexiuni (L8.x). Serviciile standard folosesc porturi cunoscute (<code>80</code> HTTP, <code>443</code> HTTPS, <code>22</code> SSH, <code>25</code> SMTP). Dacă un atacator preia controlul serverului web, un obiectiv frecvent este să deschidă un <b>port neașteptat</b> (o ușă dosnică, un canal de comandă). SELinux împiedică acest lucru: politica spune „<code>httpd_t</code> poate face <code>name_bind</code> (a se atașa) doar la porturi cu tipurile <code>http_port_t</code>, <code>http_cache_port_t</code> etc.” Un port neetichetat corespunzător este interzis, chiar dacă traficul ar fi permis de firewall.
          </p>
          <Analogy>
            Gândește-te la porturi ca la <b>ghișeele</b> unei instituții. Fiecare ghișeu are o plăcuță de tip („Ghișeu publicații”, „Ghișeu înregistrări”), iar politica spune „funcționarul de la publicații poate sta doar la ghișee de tip publicații”. Dacă vrei să-l muți la ghișeul 8085, trebuie să schimbi mai întâi plăcuța acelui ghișeu în „publicații”. Altfel paza îl oprește. Firewall-ul este <i>ușa clădirii</i>; SELinux este <i>paza de la ghișeu</i>: sunt controale diferite.
          </Analogy>
          <Table head={['Strat', 'Întrebare', 'Unealta', 'Lecția']} rows={[
            ['firewall', 'traficul spre portul X este permis să intre?', <code>firewall-cmd</code>, 'L8.4'],
            ['SELinux (port label)', 'procesul are voie să asculte pe portul X?', <code>semanage port</code>, 'această lecție'],
            ['serviciul', 'este configurat să asculte pe portul X?', 'fișierul de configurare (Listen, Port…)', 'lecția serviciului'],
            ['sistem', 'portul este liber (nu îl folosește alt proces)?', <code>ss -tlnp</code>, 'L8.x'],
          ]} />
          <p>
            Pentru ca un serviciu pe port nestandard să fie accesibil din rețea, toate patru straturile trebuie să fie în regulă. De aceea, la examen, o cerință de forma „Apache trebuie să asculte pe portul 8085” conține în realitate patru pași.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Porturile au tipuri, definite în politică</h4>
          <p>
            Politica conține reguli <code>portcon</code>: <code>protocol port(sau interval) → context</code>, de exemplu <code>tcp 80 → http_port_t</code>. Un tip de port poate avea <b>mai multe porturi</b> (<code>http_port_t</code>: 80, 81, 443, 488, 8008, 8009, 8443, 9000; lista exactă diferă între versiuni). Conform <code>semanage-port(8)</code>, <code>semanage port</code> „controlează definițiile port număr → tip de port”.
          </p>
          <h4>2. Ce verifică kernelul</h4>
          <ol>
            <li>Un proces apelează <code>bind()</code> (și <code>listen()</code>) pe un port.</li>
            <li>Kernelul află tipul portului din politică.</li>
            <li>SELinux verifică regula: domeniul procesului are voie să facă <code>name_bind</code> pe acel tip de port (clasa <code>tcp_socket</code> sau <code>udp_socket</code>)?</li>
            <li>Dacă nu, <code>bind</code> eșuează cu <code>Permission denied</code>, iar în <code>audit.log</code> apare un AVC cu <code>{'{ name_bind }'}</code>, <code>tclass=tcp_socket</code> și <code>src=PORT</code>.</li>
          </ol>
          <h4>3. Tipurile frecvente de porturi</h4>
          <Table head={['Tip', 'Porturi (exemple)', 'Servicii care îl pot folosi']} rows={[
            [<code>http_port_t</code>, '80, 443, 8008, 8009, 8443, 9000…', 'httpd, nginx, alte servere web'],
            [<code>ssh_port_t</code>, '22', 'sshd'],
            [<code>smtp_port_t</code>, '25, 465, 587', 'postfix'],
            [<code>dns_port_t</code>, '53', 'named'],
            [<code>mysqld_port_t</code>, '3306', 'mariadb/mysqld'],
            [<code>postgresql_port_t</code>, '5432', 'postgresql'],
            [<code>samba_port_t</code>, '137–139, 445', 'smbd, nmbd'],
            [<code>unreserved_port_t</code>, 'porturi mari nealocate', 'nu sunt permise serviciilor confinate'],
          ]} />
          <p className="small">Lista este orientativă (din practică, necitită în docs.redhat.com); verifică pe sistemul tău cu <code>semanage port -l</code>.</p>
          <h4>4. Adăugare vs modificare</h4>
          <ul>
            <li><b>Port nedefinit în politică</b> (de exemplu 8085): <code>semanage port -a -t http_port_t -p tcp 8085</code> (<code>-a</code> = add).</li>
            <li><b>Port deja definit</b> cu alt tip (de exemplu 9090, aparținând altui tip): <code>-a</code> eșuează cu „already defined”; folosești <code>-m</code> (modify) ca să-i schimbi tipul <i>local</i>: <code>semanage port -m -t http_port_t -p tcp 9090</code>. Atenție: schimbi tipul unui port în folosința altor servicii.</li>
            <li><b>Ștergere:</b> <code>semanage port -d -t http_port_t -p tcp 8085</code> (poți șterge doar regulile locale; cele din politica de bază nu).</li>
            <li><b>Interval:</b> <code>semanage port -a -t http_port_t -p tcp 8080-8090</code> (sintaxă <code>port_range</code> din <code>semanage-port(8)</code>).</li>
          </ul>
          <p>
            Protocolul (<code>-p tcp|udp|dccp|sctp</code>) este obligatoriu: același număr de port poate avea tipuri diferite pentru TCP și UDP.
          </p>
          <h4>5. Persistență</h4>
          <p>
            Spre deosebire de <code>setenforce</code> sau <code>setsebool</code> fără <code>-P</code>, <code>semanage port</code> scrie în <b>politica locală</b>: persistă la reboot și are efect imediat, <b>fără</b> alt pas (nu există echivalentul lui <code>restorecon</code>). Nu are nevoie de reload; dacă serviciul eșuase la pornire, îl repornești.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>firewalld (L8.4):</b> după ce SELinux permite portul, trebuie deschis și în firewall: <code>firewall-cmd --permanent --add-port=8085/tcp</code> + <code>--reload</code>; un serviciu definit (<code>--add-service</code>) acoperă portul lui standard, nu pe cel nestandard.</li>
            <li><b>Rețea (L8.x):</b> <code>ss -tlnp</code> arată ce proces ascultă pe port; un port ocupat dă „Address already in use” (alt mesaj decât „Permission denied”).</li>
            <li><b>systemd (L4.9):</b> <code>systemctl status</code> și <code>journalctl -u SERVICIU</code> arată eșecul de pornire (eroare de <code>bind</code>).</li>
            <li><b>SSH (L1.11, L10.2):</b> schimbarea portului sshd (<code>Port 2222</code> în <code>sshd_config</code>) cere <code>semanage port -a -t ssh_port_t -p tcp 2222</code> (exemplu din pagina man) + firewall.</li>
            <li><b>Contexte de fișiere (L10.4–L10.5):</b> dacă și fișierele sunt noi (directoare web personalizate), ai nevoie și de etichete de fișiere.</li>
            <li><b>Boolean-uri (L10.7):</b> uneori serviciul nu are probleme de <i>bind</i>, ci de <i>conectare</i> la alt port (<code>httpd_can_network_connect</code>), caz diferit.</li>
            <li><b>Diagnostic (L10.8):</b> AVC cu <code>name_bind</code> → port label; AVC cu <code>name_connect</code> → de obicei boolean/port de destinație.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Apache/nginx pe un port alternativ (8080, 8085, 8888).</li>
            <li>sshd pe un port nestandard (2222) ca să reduci zgomotul scanărilor.</li>
            <li>O aplicație web proprie (Node, Python) ce trebuie să asculte pe un port ales, dar rulează într-un domeniu web.</li>
            <li><b>Examen:</b> „configure Apache to listen on port 8082 and make sure SELinux allows it (persistent)”, „configure sshd to listen on port 2222; allow it in SELinux and firewalld”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Exemplele folosesc Apache (<code>httpd</code>) ca serviciu-model. Dacă nu vrei să instalezi pachetul, poți urmări doar comenzile <code>semanage</code>, care nu cer ca serviciul să existe. Rulezi ca root/cu <code>sudo</code>, pe o mașină de test cu SELinux activ. Output-urile sunt <b>Ilustrative</b>; listele de porturi diferă pe RHEL 10.
        </Callout>

        <h4>1. Citește etichetele de porturi</h4>
        <CodeBlock title="comenzi" code={`sudo semanage port -l | head -n 5\nsudo semanage port -l | grep -w http_port_t\nsudo semanage port -l | grep -E '^(ssh_port_t|http_port_t|smtp_port_t)'\nsudo semanage port -l -C\nsudo semanage port -l -n | wc -l`} explain={[
          ['semanage port -l', '-l = listează toate definițiile port → tip: coloane „SELinux Port Type”, „Proto”, „Port Number”.'],
          ['grep -w http_port_t', '-w = cuvânt întreg: evită tipurile precum http_port_t din alte nume (de exemplu pegasus_http_port_t).'],
          ['-C', '-C = doar personalizările locale (ce ai adăugat tu); goală pe un sistem nou.'],
          ['-n', '-n = fără antet: util la numărare sau filtrare.'],
        ]} />

        <h4>2. Aflu dacă un port este deja definit</h4>
        <CodeBlock title="comenzi" code={`sudo semanage port -l | grep -w 8085\nsudo semanage port -l | awk '$3 ~ /(^|, )8085(,|$)/'\nss -tlnp | grep ':8085'\nsudo ausearch -m avc -ts recent | grep name_bind`} explain={[
          ['grep -w 8085', 'caută numărul de port ca cuvânt (în lista de porturi).'],
          ['ss -tlnp', '-t TCP, -l în ascultare, -n numere (nu nume), -p proces: cine ascultă acum.'],
          ['ausearch … | grep name_bind', 'caută refuzări de bind (L10.8).'],
        ]} />

        <h4>3. Adaugă un port la un tip existent</h4>
        <CodeBlock title="comenzi" code={`sudo semanage port -a -t http_port_t -p tcp 8085\nsudo semanage port -l -C\nsudo semanage port -l | grep -w http_port_t\nsudo semanage port -a -t http_port_t -p tcp 8090-8095\nsudo semanage port -l -C`} explain={[
          ['semanage port -a', '-a = add (adaugă).'],
          ['-t http_port_t', '-t = tipul de atribuit portului: tipul pe care îl poate folosi serverul web.'],
          ['-p tcp', '-p = protocol: tcp, udp, dccp sau sctp (obligatoriu).'],
          ['8085', 'portul; un interval se scrie 8090-8095.'],
          ['semanage port -l -C', 'confirmă că regula locală există.'],
        ]} />

        <h4>4. Modifică sau șterge</h4>
        <CodeBlock title="comenzi" code={`sudo semanage port -a -t http_port_t -p tcp 9090\nsudo semanage port -m -t http_port_t -p tcp 9090\nsudo semanage port -d -t http_port_t -p tcp 8085\nsudo semanage port -d -p tcp 8085\nsudo semanage port -D`} explain={[
          ['-a pe un port deja definit', 'dă ValueError „Port tcp/9090 already defined”; se folosește -m.'],
          ['-m', '-m = modify: schimbă tipul unui port deja definit (local).'],
          ['-d', '-d = delete: șterge regula locală. În man page, sintaxa -d cere -p și numărul portului; -t este opțional (de confirmat pe RHEL 10).'],
          ['-D', '-D = deleteall: șterge TOATE personalizările locale ale porturilor.'],
        ]} />

        <h4>5. Flux complet: Apache pe portul 8085</h4>
        <CodeBlock title="comenzi" code={`sudo dnf install -y httpd policycoreutils-python-utils\nsudo grep -n '^Listen' /etc/httpd/conf/httpd.conf\nsudo sed -i 's/^Listen 80$/Listen 8085/' /etc/httpd/conf/httpd.conf\nsudo systemctl restart httpd\nsudo systemctl status httpd --no-pager | head -n 15\nsudo ausearch -m avc -ts recent -i | grep name_bind\nsudo semanage port -a -t http_port_t -p tcp 8085\nsudo systemctl restart httpd\nss -tlnp | grep 8085\nsudo firewall-cmd --permanent --add-port=8085/tcp\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-ports\ncurl -sI http://localhost:8085 | head -n 1`} explain={[
          ['dnf install -y httpd policycoreutils-python-utils', '-y = răspunde „da” automat; httpd = serverul web; pachetul al doilea oferă semanage (dacă lipsește).'],
          ["sed -i 's/^Listen 80$/Listen 8085/'", 'schimbă directiva Listen din 80 în 8085; ^ și $ ancorează linia completă.'],
          ['systemctl restart httpd', 'prima repornire ESUEAZĂ pe SELinux enforcing (portul 8085 nu are tip web).'],
          ['ausearch … | grep name_bind', 'AVC-ul arată name_bind pe portul 8085, scontext=httpd_t, tclass=tcp_socket.'],
          ['semanage port -a -t http_port_t -p tcp 8085', 'repară: portul 8085 primește tipul web.'],
          ['ss -tlnp | grep 8085', 'httpd ascultă acum pe 8085.'],
          ['firewall-cmd --permanent --add-port=8085/tcp', 'deschide portul în firewall, PERMANENT; --reload aplică (L8.4).'],
          ['curl -sI http://localhost:8085', '-s = silențios, -I = doar antetele; prima linie ar trebui să fie HTTP/1.1 200 sau 403 (403 = pagina implicită lipsește; contează că serverul răspunde).'],
        ]} />
        <Callout kind="warn" title="Ordinea și diagnosticul">
          Dacă serviciul nu pornește: <b>citește mai întâi eroarea</b> (<code>systemctl status</code>, <code>journalctl -u httpd</code>) și AVC-ul. „Permission denied” la <code>bind</code> → SELinux; „Address already in use” → port ocupat; fără eroare, dar nu se conectează nimeni din afară → firewall. Nu dezactiva SELinux ca să afli.
        </Callout>

        <h4>6. Exemplul din man page: sshd pe un port nestandard</h4>
        <CodeBlock title="comenzi" code={`sudo semanage port -a -t ssh_port_t -p tcp 2222\nsudo semanage port -l | grep -w ssh_port_t\nsudo grep -n '^#\\?Port' /etc/ssh/sshd_config\nsudo sshd -t && echo ok\nsudo firewall-cmd --permanent --add-port=2222/tcp && sudo firewall-cmd --reload`} explain={[
          ['semanage port -a -t ssh_port_t -p tcp 2222', 'exemplul din semanage-port(8) pentru sshd pe 8991; aici 2222.'],
          ["grep -n '^#\\?Port' …", 'caută directiva Port (comentată sau nu) în sshd_config; schimbarea efectivă (Port 2222) o faci cu un editor, ca root, apoi sshd -t și systemctl reload sshd.'],
        ]} />
        <p className="small">Nu schimba portul sshd pe o mașină la care ai acces doar prin SSH fără o a doua sesiune sau consolă deschisă (L10.2).</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="semanage port -l (extras)" kind="session" label="illustrative" code={`[root@server1 ~]# semanage port -l | grep -E '^(http_port_t|ssh_port_t)'
http_port_t                    tcp      80, 81, 443, 488, 8008, 8009, 8443, 9000
ssh_port_t                     tcp      22`} />
        <p className="small">
          Coloane: <b>SELinux Port Type</b> (tipul), <b>Proto</b> (protocolul), <b>Port Number</b> (lista de porturi sau intervale). Valorile sunt ilustrative: pe RHEL 10 lista poate diferi.
        </p>
        <CodeBlock title="eșec la pornire (eroare de bind)" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl restart httpd
Job for httpd.service failed because the control process exited with error code.
See "systemctl status httpd.service" and "journalctl -xeu httpd.service" for details.
[root@server1 ~]# journalctl -u httpd -n 3 --no-pager
… httpd[4012]: (13)Permission denied: AH00072: make_sock: could not bind to address [::]:8085
… httpd[4012]: (13)Permission denied: AH00072: make_sock: could not bind to address 0.0.0.0:8085
… httpd[4012]: no listening sockets available, shutting down`} />
        <p className="small">
          <code>(13)Permission denied</code> la <code>bind</code> este semnătura unei refuzări SELinux de port (<code>13</code> = EACCES). Comparație: „(98)Address already in use” înseamnă port ocupat. Mesajele Apache pot varia.
        </p>
        <CodeBlock title="AVC pentru port" kind="session" label="illustrative" code={`[root@server1 ~]# ausearch -m avc -ts recent -i | grep name_bind
type=AVC msg=audit(11/17/2026 18:05:44.120:931) : avc:  denied  { name_bind } for  pid=4012 comm=httpd src=8085 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:unreserved_port_t:s0 tclass=tcp_socket permissive=0`} />
        <p className="small">
          <code>{'{ name_bind }'}</code> = acțiunea de atașare la port; <code>src=8085</code> = portul; <code>scontext</code> = domeniul <code>httpd_t</code>; <code>tcontext</code> = tipul portului acum (<code>unreserved_port_t</code>: neetichetat pentru web); <code>tclass=tcp_socket</code>. Remedierea: dai portului tipul <code>http_port_t</code>.
        </p>
        <CodeBlock title="după semanage port" kind="session" label="illustrative" code={`[root@server1 ~]# semanage port -a -t http_port_t -p tcp 8085
[root@server1 ~]# semanage port -l -C
SELinux Port Type              Proto    Port Number
http_port_t                    tcp      8085
[root@server1 ~]# systemctl restart httpd && ss -tlnp | grep 8085
LISTEN 0 511 *:8085 *:* users:(("httpd",pid=4150,fd=4))`} />
        <p className="small">
          Regula apare ca personalizare locală; <code>httpd</code> pornește și ascultă pe 8085 (<code>users:((“httpd”…))</code> = procesul). Fără <code>restorecon</code>: porturile nu au nevoie de aplicare separată.
        </p>
        <CodeBlock title="eroare la -a pe port definit" kind="session" label="illustrative" code={`[root@server1 ~]# semanage port -a -t http_port_t -p tcp 9090
ValueError: Port tcp/9090 already defined`} />
        <p className="small">
          9090 aparține deja altui tip în politică (ilustrativ). Folosești <code>-m</code> ca să-i schimbi tipul <i>local</i>, cu grijă: afectezi alt serviciu care îl folosea.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Eticheta portului:</b> <code>sudo semanage port -l | grep -w PORT</code> (tip, protocol).</li>
            <li><b>Regula ta:</b> <code>sudo semanage port -l -C</code>.</li>
            <li><b>Serviciul ascultă:</b> <code>ss -tlnp | grep PORT</code>.</li>
            <li><b>Serviciul rulează:</b> <code>systemctl status SERVICIU</code> și <code>is-enabled</code>.</li>
            <li><b>Fără refuzări noi:</b> <code>sudo ausearch -m avc -ts recent</code> nu mai arată <code>name_bind</code>.</li>
            <li><b>Firewall:</b> <code>sudo firewall-cmd --list-ports</code> și <code>--permanent --list-ports</code>.</li>
            <li><b>Test funcțional:</b> <code>curl -sI http://localhost:PORT</code>, apoi din altă mașină.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Regulile <code>semanage port</code> sunt scrise în politica locală și <b>persistă la reboot</b>, fără alt pas. Dar pentru ca serviciul să funcționeze după reboot, ai nevoie și de: (1) directiva din fișierul de configurare (<code>Listen 8085</code>), (2) serviciul activ la boot (<code>systemctl enable</code>), (3) regula de firewall <b>permanentă</b> (<code>--permanent</code> + <code>--reload</code>). Confirmare manuală: reboot, apoi <code>ss -tlnp</code>, <code>semanage port -l -C</code>, <code>firewall-cmd --list-ports</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Serviciul nu pornește după schimbarea portului, „Permission denied” la bind', 'portul nu are tipul permis', <><code>journalctl -u SERVICIU</code>, <code>ausearch -m avc</code></>, <><code>semanage port -a -t TIP -p tcp PORT</code></>],
          ['„Address already in use”', 'alt proces ascultă pe port', <code>ss -tlnp | grep PORT</code>, 'alege alt port sau oprește procesul'],
          ['ValueError: Port … already defined', 'portul are deja un tip în politică', <code>semanage port -l | grep -w PORT</code>, <>folosește <code>-m</code> (cu atenție) sau alt port</>],
          ['Serviciul rulează local, dar nu se conectează nimeni din rețea', 'firewall', <code>firewall-cmd --list-ports</code>, <>adaugă portul (<code>--permanent</code> + <code>--reload</code>)</>],
          ['semanage: command not found', 'pachet lipsă', <code>rpm -q policycoreutils-python-utils</code>, <code>dnf install policycoreutils-python-utils</code>],
          ['Tipul greșit ales (de exemplu ssh_port_t pentru httpd)', 'httpd nu poate folosi ssh_port_t', <code>ausearch -m avc</code>, <>șterge (<code>-d</code>) și adaugă cu tipul corect</>],
          ['Serviciu funcțional în permissive, nu în enforcing', 'refuzare SELinux', <code>getenforce</code>, 'repară eticheta (nu rămâne în permissive)'],
          ['Portul funcționează UDP dar nu TCP (sau invers)', 'ai ales protocolul greșit', <code>semanage port -l | grep -w PORT</code>, <>adaugă și pentru protocolul lipsă (<code>-p udp</code>)</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Deschizi portul în firewall și crezi că e totul: SELinux îl poate bloca separat.</>,
          <>Etichetezi portul și uiți firewall-ul (sau invers).</>,
          <>Uiți <code>-p tcp</code> sau alegi protocolul greșit (<code>udp</code>).</>,
          <>Uiți <code>--permanent</code> la firewall: portul dispare la reboot.</>,
          <>Alegi tipul greșit (<code>ssh_port_t</code> pentru Apache, <code>http_port_t</code> pentru sshd).</>,
          <>Folosești <code>-a</code> pentru un port deja definit în loc de <code>-m</code> (sau invers).</>,
          <>Dezactivezi SELinux ca să pornească serviciul.</>,
          <>Schimbi portul în configurație, dar uiți să repornești serviciul.</>,
          <>Confunzi eșecul de <code>bind</code> (port) cu eșecul de acces la fișiere (etichetă) — AVC-ul arată <code>tclass=tcp_socket</code> vs <code>file</code>.</>,
          <>Schimbi portul sshd fără a păstra o sesiune de rezervă.</>,
          <>Crezi că regula de port are nevoie de <code>restorecon</code>: nu are.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: portcon, name_bind vs name_connect, tipuri de porturi, interval și semanage export">
        <p>
          <b>portcon:</b> în politică, <code>portcon tcp 80 system_u:object_r:http_port_t:s0</code> declară tipul portului. <code>semanage port</code> adaugă intrări locale peste ele; nu poate șterge cele de bază (<code>-d</code> funcționează doar pe cele locale).
        </p>
        <p>
          <b>name_bind vs name_connect:</b> <code>name_bind</code> = <i>ascultare</i> pe port (server); <code>name_connect</code> = <i>conectare</i> la un port din altă parte (client). Un server web care se conectează la o bază de date externă poate fi blocat de <code>name_connect</code> (cu tipul portului de destinație, de exemplu <code>mysqld_port_t</code>); acolo ajută boolean-urile precum <code>httpd_can_network_connect_db</code> (L10.7), nu <code>semanage port</code>.
        </p>
        <p>
          <b>Porturi efemere:</b> porturile efemere (clienți) au tipul <code>ephemeral_port_t</code>; porturile libere mari sunt <code>unreserved_port_t</code>, care <b>nu</b> este permis serviciilor confinate (de aceea 8085 era refuzat în exemplu).
        </p>
        <p>
          <b>Interval și suprapuneri:</b> poți defini intervale (<code>8090-8095</code>); un port sau interval nou nu poate suprapune parțial unul existent cu alt tip (de confirmat comportamentul exact).
        </p>
        <p>
          <b>semanage export/import:</b> <code>semanage export</code> afișează toate personalizările locale (fcontext, port, boolean…) și <code>semanage import</code> le reaplică: util pentru a replica o configurație pe alt server (pagină necitită).
        </p>
        <p>
          <b>Instrumente de interogare:</b> <code>seinfo --portcon</code> și <code>sesearch</code> (<code>setools-console</code>) arată regulile din politică; <code>sepolicy network -t http_port_t</code> (<code>policycoreutils-devel</code>) listează porturile unui tip; nu sunt necesare pentru obiectiv.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_6: TopicModule = {
  id: 'L10.6',
  subtitle: 'etichete de porturi SELinux: semanage port (-l -a -m -d -C -p -t), http_port_t/ssh_port_t, name_bind, legătura cu firewalld',
  studyTime: '≈90 min studiu + laborator',
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
  labs: [LAB_L10_6A, LAB_L10_6B],
  sources: [
    { kind: 'man', ref: 'semanage-port(8), selinux(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'lista porturilor din http_port_t pe RHEL 10, mesajele exacte Apache, ss(8), semanage-export(8), sepolicy(8) — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Configuring SELinux for applications and services with non-standard configurations” (docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
