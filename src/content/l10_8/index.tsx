import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_8A, LAB_L10_8B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <Callout kind="info" title="Lecție de suport / neoficială">
            Nu corespunde unui obiectiv separat din lista EX200: <b>integrează</b> C10-4…C10-8 într-o metodă de diagnostic. Este marcată „suport”.
          </Callout>
          <p>
            Când un serviciu „nu merge” pe un sistem cu SELinux, nu ghici și nu dezactiva SELinux. Urmează o metodă: (1) <b>confirmă</b> că SELinux este cauza (<code>setenforce 0</code> temporar: dacă problema dispare, este SELinux; revino imediat în enforcing); (2) <b>citește refuzarea</b> (<code>ausearch -m avc -ts recent -i</code>); (3) <b>identifică tipul de problemă</b> după clasă și acțiune: fișier (<code>tclass=file</code>) → etichetă (L10.5); port (<code>name_bind</code>, <code>tcp_socket</code>) → port label (L10.6); acțiune opțională (rețea, home, mail) → boolean (L10.7); (4) <b>repară persistent</b>; (5) <b>reia testul</b> cu SELinux în enforcing.
          </p>
          <p>Verificare: <code>getenforce</code>, <code>ausearch -m avc -ts recent</code> fără refuzări noi, serviciul funcționează în enforcing.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>De ce o metodă și nu „încearcă și vezi”</h4>
          <p>
            SELinux refuză în tăcere, pe deasupra permisiunilor: serviciul dă „Permission denied” sau „403”, <code>ls -l</code> arată drepturi corecte, iar mesajul util este într-un fișier pe care începătorii nu-l caută (<code>/var/log/audit/audit.log</code>). Reacțiile greșite frecvente sunt: <code>chmod 777</code> (nu ajută), <code>setenforce 0</code> lăsat definitiv (slăbește sistemul, pică la examen) sau reinstalarea serviciului. O metodă îți economisește timp, mai ales sub presiunea examenului, unde fiecare task este independent.
          </p>
          <Analogy>
            Un medic nu prescrie antibiotice la întâmplare: întâi <b>confirmă</b> că problema este infecția (analize), apoi <b>identifică</b> cauza exactă și abia apoi <b>tratează specific</b>. <code>setenforce 0</code> este „analiza” (vezi dacă SELinux e vinovat), <code>ausearch</code> este „raportul de laborator”, iar eticheta, portul și boolean-ul sunt cele trei „tratamente” specifice. Să dezactivezi SELinux este ca și cum ai amputa pentru o zgârietură.
          </Analogy>
          <h4>Cele trei remedii din obiectiv</h4>
          <Table head={['Semnul în AVC', 'Cauză', 'Remediu', 'Lecția']} rows={[
            [<><code>tclass=file</code>/<code>dir</code>, <code>tcontext</code> nepotrivit (de exemplu <code>user_home_t</code>)</>, 'fișier/director cu etichetă greșită', <><code>restorecon</code> sau <code>semanage fcontext</code> + <code>restorecon</code></>, 'L10.5'],
            [<><code>{'{ name_bind }'}</code>, <code>tclass=tcp_socket</code>, <code>src=PORT</code></>, 'port fără tip permis', <><code>semanage port -a -t TIP -p tcp PORT</code></>, 'L10.6'],
            [<>acțiune (<code>name_connect</code>, <code>read</code> pe home, <code>sendmail</code>…) cu etichete corecte</>, 'comportament opțional dezactivat', <><code>setsebool -P NUME on</code></>, 'L10.7'],
            ['nimic din cele de mai sus (rar)', 'regulă lipsă în politică', 'modul propriu cu audit2allow (avansat; nu face parte din obiectiv)', '—'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Unde ajunge informația</h4>
          <p>
            La fiecare refuzare, kernelul trimite un mesaj de audit; <G id="auditd">auditd</G> îl scrie în <code>/var/log/audit/audit.log</code>. Dacă <code>auditd</code> nu rulează, mesajele pot apărea în jurnalul kernelului (<code>journalctl -k</code>). Unele refuzări sunt ascunse intenționat (reguli <i>dontaudit</i>): lipsa unui AVC nu dovedește absența SELinux din ecuație.
          </p>
          <h4>2. Citirea unui AVC, câmp cu câmp</h4>
          <CodeBlock title="un mesaj AVC" kind="session" label="illustrative" code={`type=AVC msg=audit(1731850010.412:812): avc:  denied  { read } for  pid=2210 comm="httpd" name="index.html" dev="vda1" ino=1048611 scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0`} explain={[
            ['type=AVC', 'tipul mesajului de audit (AVC = refuzare de acces SELinux).'],
            ['msg=audit(1731850010.412:812)', 'momentul (epoch UNIX cu zecimale) și numărul de secvență. ausearch -i îl traduce în dată citibilă.'],
            ['denied { read }', 'acțiunea refuzată: read, write, open, getattr, name_bind, name_connect…'],
            ['pid / comm="httpd"', 'procesul care a încercat accesul.'],
            ['name / path / ino / dev', 'obiectul vizat (nume de fișier, inode, dispozitiv) sau, la porturi, src=PORT.'],
            ['scontext=…httpd_t…', 'contextul SURSEI (procesul): domeniul httpd_t.'],
            ['tcontext=…user_home_t…', 'contextul ȚINTEI (obiectul): tipul user_home_t.'],
            ['tclass=file', 'clasa obiectului: file, dir, tcp_socket, udp_socket, process…'],
            ['permissive=0', '0 = a fost BLOCAT; 1 = doar înregistrat (modul permissive sau domeniu permissive).'],
          ]} />
          <p>
            Lectura rapidă: „<b>domeniul</b> <code>httpd_t</code> n-a avut voie să <b>citească</b> un <b>fișier</b> de tip <code>user_home_t</code>” → tip de fișier greșit pentru un fișier web → <code>restorecon</code>/<code>semanage fcontext</code>.
          </p>
          <h4>3. Instrumente de citire</h4>
          <Table head={['Instrument', 'Ce face', 'Sursa']} rows={[
            [<code>ausearch -m avc -ts recent</code>, 'caută AVC-uri din ultimele 10 minute; -ts today/yesterday/boot/DATĂ ORĂ; -i interpretează', 'ausearch(8), citit'],
            [<code>ausearch -m avc,user_avc,selinux_err,user_selinux_err -i -ts recent</code>, 'combină mai multe tipuri de mesaje SELinux (exemplu din pagină)', 'ausearch(8), citit'],
            [<><code>ausearch -c httpd</code> / <code>-x /usr/sbin/httpd</code></>, 'filtrează după numele comenzii sau al executabilului', 'ausearch(8), citit'],
            [<code>aureport -a</code>, 'raport de AVC-uri (sumar)', 'din cunoștințe, necitit'],
            [<code>sealert -a /var/log/audit/audit.log</code>, 'explicații în limbaj natural și sugestii de comenzi (pachetul setroubleshoot-server)', 'din cunoștințe, necitit'],
            [<code>audit2why</code>, 'spune dacă refuzarea se rezolvă cu un boolean sau cu o regulă lipsă', 'din cunoștințe; man7 → 404'],
            [<code>journalctl -t setroubleshoot</code>, 'mesajele setroubleshoot din jurnal (dacă este instalat)', 'din cunoștințe, necitit'],
          ]} />
          <h4>4. Permissive: cum și de ce</h4>
          <p>
            În <code>permissive</code> toate refuzările sunt <b>doar înregistrate</b> (<code>permissive=1</code>), iar serviciul continuă. Avantaj: într-o singură rulare vezi <i>toate</i> refuzările pe care le-ar produce scenariul (nu doar prima, cum se întâmplă în enforcing, unde procesul se oprește la prima eroare). Dezavantaj: sistemul nu este protejat cât timp este permissive. Regula: <b>schimbi doar pentru diagnostic, restabilești imediat</b> (<code>setenforce 1</code>), apoi repari.
          </p>
          <h4>5. Arborele de decizie</h4>
          <ol>
            <li>Serviciul nu pornește? → <code>systemctl status</code> + <code>journalctl -u</code>: „Permission denied” la <b>bind</b> → port; la <b>open</b> pe un fișier → etichetă/DAC.</li>
            <li>Pornește, dar nu servește? → <code>ls -l</code> (DAC) → <code>ls -Z</code> și <code>matchpathcon -V</code> (etichetă) → <code>getsebool -a | grep serviciu</code> (boolean).</li>
            <li>Funcționează în permissive? → este SELinux; citește AVC-urile.</li>
            <li>Nu apare niciun AVC? → DAC sau firewall; verifică <code>firewall-cmd --list-all</code> și permisiunile; <code>dontaudit</code> este rar.</li>
          </ol>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>DAC (L1.8):</b> mereu primul de verificat; <code>ls -l</code>, <code>namei -l CALE</code> (L6.5) arată fiecare componentă a căii.</li>
            <li><b>Firewall (L8.4):</b> un serviciu corect pentru SELinux dar neaccesibil din rețea este problemă de firewall (nu apare AVC).</li>
            <li><b>systemd și jurnal (L4.7, L4.9):</b> <code>systemctl status</code>, <code>journalctl -xeu serviciu</code>.</li>
            <li><b>Pachete (L2.x):</b> <code>dnf install setroubleshoot-server</code> (dacă este în repository) adaugă <code>sealert</code> și mesaje explicative; <code>audit</code> oferă <code>ausearch</code>.</li>
            <li><b>Stocare (C5–C6):</b> volume noi, NFS, directoare personalizate: etichete (L10.5).</li>
            <li><b>Boot (L4.3):</b> după resetarea parolei root, <code>/.autorelabel</code>.</li>
            <li><b>SSH (L10.2):</b> chei mutate cu <code>mv</code>: <code>restorecon -R ~/.ssh</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La orice serviciu nou cu configurație nestandard (director, port, funcție).</li>
            <li>După restaurări, migrări, copieri între servere.</li>
            <li>Ca ultim pas de depanare la examen: „everything is configured but the service does not work” → verifici SELinux înainte de a-ți pierde timpul altundeva.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi pe o mașină de test. Output-urile sunt <b>Ilustrative</b>. Comenzile care schimbă starea sunt marcate. <code>ausearch</code> cere <code>root</code>/<code>sudo</code> pentru a citi <code>audit.log</code>.
        </Callout>

        <h4>1. Confirmă că SELinux este cauza (apoi revino imediat)</h4>
        <CodeBlock title="comenzi" code={`getenforce\nsudo setenforce 0\ngetenforce\n# retestezi serviciul (curl, systemctl restart ...)\nsudo setenforce 1\ngetenforce`} explain={[
          ['getenforce', 'notezi starea inițială (Enforcing).'],
          ['setenforce 0', 'permissive temporar: SELinux înregistrează, dar nu blochează.'],
          ['(retestezi)', 'dacă serviciul acum funcționează → cauza este SELinux (nu DAC, nu firewall).'],
          ['setenforce 1', 'revii în enforcing IMEDIAT; nu continua testele în permissive.'],
        ]} />

        <h4>2. Citește refuzările</h4>
        <CodeBlock title="comenzi" code={`sudo ausearch -m avc -ts recent\nsudo ausearch -m avc -ts recent -i\nsudo ausearch -m avc -ts today -i -c httpd\nsudo ausearch -m avc -ts boot -i | tail -n 5\nsudo ausearch -m avc,user_avc,selinux_err,user_selinux_err -i -ts recent\nsudo tail -n 20 /var/log/audit/audit.log | grep AVC\nsudo journalctl -k -g avc --no-pager | tail -n 3`} explain={[
          ['-m avc', '-m = tipul mesajului: avc = refuzări SELinux (lista cu virgulă, fără spații, ausearch(8)).'],
          ['-ts recent', '-ts = „start time”: recent (ultimele 10 minute), today, yesterday, boot sau DATĂ ORĂ.'],
          ['-i', '-i = interpretează (UID → nume, timp lizibil).'],
          ['-c httpd', '-c = după numele comenzii (comm) din task; -x = după executabil.'],
          ['grep AVC audit.log', 'citire directă din fișier (aceleași date, nefiltrate).'],
          ['journalctl -k -g avc', '-k = doar mesaje de kernel; -g = filtru regex (disponibil în systemd recent; de confirmat).'],
        ]} />

        <h4>3. Instrumente suplimentare (dacă pachetele sunt instalate)</h4>
        <CodeBlock title="comenzi" code={`sudo dnf install -y setroubleshoot-server\nsudo sealert -a /var/log/audit/audit.log | head -n 30\nsudo ausearch -m avc -ts recent | audit2why\nsudo aureport -a | tail -n 5\nsudo journalctl -t setroubleshoot --no-pager | tail -n 3`} explain={[
          ['dnf install setroubleshoot-server', 'adaugă sealert și serviciul care explică refuzările (disponibilitate pe RHEL 10 de confirmat).'],
          ['sealert -a FIȘIER', '-a = analizează tot jurnalul și afișează explicații + sugestii (inclusiv comenzi semanage/setsebool).'],
          ['… | audit2why', 'citește AVC-uri de la intrarea standard și explică: „Missing type enforcement rule” sau „boolean … would allow”.'],
          ['aureport -a', 'raport rezumat al AVC-urilor.'],
        ]} />
        <Callout kind="warn" title="audit2allow: nu primul remediu">
          <code>audit2allow -M modul</code> generează un modul de politică care <b>permite exact ce a fost refuzat</b>. Poate lărgi prea mult accesul și ascunde cauza reală (etichetă/port/boolean). Folosește-l doar când nicio soluție din obiectiv nu se aplică. Nu face parte din EX200.
        </Callout>

        <h4>4. Remedieri (recapitulare cu comenzile exacte)</h4>
        <CodeBlock title="comenzi" code={`# fișier cu etichetă greșită\nls -Z /srv/web/index.html; matchpathcon -V /srv/web/index.html\nsudo restorecon -Rv /srv/web\n# director nestandard\nsudo semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"\nsudo restorecon -Rv /srv/web\n# port nestandard\nsudo semanage port -a -t http_port_t -p tcp 8085\n# comportament opțional\ngetsebool -a | grep httpd | head -n 5\nsudo setsebool -P httpd_can_network_connect on`} explain={[
          ['restorecon -Rv', 'readuce etichetele implicite (L10.5).'],
          ['semanage fcontext + restorecon', 'regulă durabilă pentru directoare personalizate (L10.5).'],
          ['semanage port -a', 'port label (L10.6).'],
          ['setsebool -P', 'boolean persistent (L10.7).'],
        ]} />

        <h4>5. Retestează în enforcing</h4>
        <CodeBlock title="comenzi" code={`getenforce\nsudo ausearch -m avc -ts recent -i | tail -n 3\nsudo systemctl restart httpd\nsudo systemctl is-active httpd\ncurl -sI http://localhost:8085 | head -n 1`} explain={[
          ['getenforce', 'trebuie să fie Enforcing înainte de test final.'],
          ['ausearch … | tail', 'nu trebuie să apară refuzări noi după remediere.'],
          ['systemctl restart / is-active', 'repornești serviciul și verifici starea.'],
          ['curl -sI', 'test funcțional.'],
        ]} />

        <h4>6. Opțional: auditd și configurarea jurnalului</h4>
        <CodeBlock title="comenzi" code={`systemctl is-active auditd\nsudo ls -l /var/log/audit/\nsudo auditctl -s | head -n 3\nsudo ausearch -m avc -ts recent --raw | head -n 2`} explain={[
          ['systemctl is-active auditd', 'serviciul trebuie să fie activ pentru audit.log.'],
          ['auditctl -s', 'starea subsistemului de audit din kernel (pagină necitită; de confirmat).'],
          ['--raw', 'afișează mesajele așa cum sunt în fișier, fără formatare (ausearch(8)).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ausearch -i (interpretat)" kind="session" label="illustrative" code={`[root@server1 ~]# ausearch -m avc -ts recent -i
----
type=PROCTITLE msg=audit(11/17/2026 19:02:41.412:812) : proctitle=/usr/sbin/httpd -DFOREGROUND
type=SYSCALL msg=audit(11/17/2026 19:02:41.412:812) : arch=x86_64 syscall=openat success=no exit=EACCES(Permission denied) a0=AT_FDCWD a1=0x7f2c1c0 a2=O_RDONLY|O_CLOEXEC items=0 ppid=2200 pid=2210 auid=unset uid=apache gid=apache comm=httpd exe=/usr/sbin/httpd subj=system_u:system_r:httpd_t:s0 key=(null)
type=AVC msg=audit(11/17/2026 19:02:41.412:812) : avc:  denied  { read } for  pid=2210 comm=httpd name=index.html dev="vda1" ino=1048611 scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0`} />
        <p className="small">
          Același eveniment (<code>audit(…812)</code>) are mai multe înregistrări: <b>PROCTITLE</b> (linia de comandă a procesului), <b>SYSCALL</b> (apelul de sistem: <code>openat</code> a eșuat cu <code>EACCES</code>) și <b>AVC</b> (motivul SELinux). Concluzie: <code>httpd_t</code> n-a putut citi <code>index.html</code> etichetat <code>user_home_t</code> → remediul este eticheta (L10.5). Valorile sunt ilustrative; ordinea înregistrărilor și formatul de dată depind de versiune.
        </p>
        <CodeBlock title="audit2why" kind="session" label="illustrative" code={`[root@server1 ~]# ausearch -m avc -ts recent | audit2why
type=AVC msg=audit(…): avc:  denied  { name_connect } for  pid=3011 comm="httpd" dest=3306 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:mysqld_port_t:s0 tclass=tcp_socket permissive=0

	Was caused by:
	The boolean httpd_can_network_connect_db was set incorrectly.
	Description:
	Allow HTTPD scripts and modules to connect to databases over the network.

	Allow access by executing:
	# setsebool -P httpd_can_network_connect_db 1`} />
        <p className="small">
          Aici <code>name_connect</code> pe un port de baze de date (<code>mysqld_port_t</code>) cu etichete corecte → remediul este un <b>boolean</b>, exact cel indicat. Textul exact al <code>audit2why</code> poate diferi; ieșirea este ilustrativă.
        </p>
        <CodeBlock title="sealert (extras)" kind="session" label="illustrative" code={`SELinux is preventing /usr/sbin/httpd from read access on the file index.html.

*****  Plugin restorecon (99.5 confidence) suggests   ************************

If you want to fix the label.
/home/alice/public_html/index.html default label should be httpd_user_content_t.
Then you can run restorecon.
Do
# /sbin/restorecon -v /home/alice/public_html/index.html`} />
        <p className="small">
          <code>sealert</code> propune remediul exact (etichetă). Nu toate sistemele au pachetul; la examen de obicei nu poți conta pe el, deci trebuie să știi să citești AVC-ul manual. Formularea este ilustrativă.
        </p>
        <CodeBlock title="permissive=1 (înregistrat, nu blocat)" kind="session" label="illustrative" code={`type=AVC msg=audit(…): avc:  denied  { read } for  pid=2210 comm="httpd" name="index.html" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=1`} />
        <p className="small">
          <code>permissive=1</code> înseamnă că în acel moment SELinux era în permissive: refuzarea a fost <b>doar înregistrată</b>. Serviciul a funcționat, dar dacă treci în enforcing, aceeași acțiune va fi blocată.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Mod:</b> <code>getenforce</code> = Enforcing (după diagnostic).</li>
            <li><b>Refuzări:</b> <code>sudo ausearch -m avc -ts recent -i</code> nu arată înregistrări noi după remediere.</li>
            <li><b>Etichete:</b> <code>matchpathcon -V</code> „verified”; <code>restorecon -nRv</code> fără „Would relabel”.</li>
            <li><b>Porturi:</b> <code>semanage port -l -C</code> și <code>ss -tlnp</code>.</li>
            <li><b>Boolean-uri:</b> <code>getsebool NUME</code> și <code>semanage boolean -l -C</code>.</li>
            <li><b>Serviciu:</b> <code>systemctl is-active</code>, <code>curl</code>/<code>ssh</code> etc.</li>
            <li><b>Persistență:</b> reboot și repetarea verificărilor.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <Table head={['Remediu', 'Persistă la reboot?']} rows={[
            [<><code>restorecon</code> (cale standard)</>, 'da'],
            [<><code>semanage fcontext -a</code> + <code>restorecon</code></>, 'da'],
            [<code>chcon</code>, 'etichetă pe disc, dar se pierde la restorecon/relabel'],
            [<code>semanage port -a</code>, 'da'],
            [<><code>setsebool -P</code> / <code>semanage boolean -m</code></>, 'da'],
            [<><code>setsebool</code> fără -P</>, 'NU'],
            [<code>setenforce 0</code>, 'NU (dar nu este remediu)'],
          ]} />
          <p>
            Test final: reboot, apoi <code>getenforce</code> (Enforcing), serviciul funcționează și <code>ausearch -m avc -ts boot</code> nu arată refuzări noi.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Serviciul eșuează, nu găsesc AVC', 'auditd oprit, dontaudit sau problemă DAC/firewall', <><code>systemctl status auditd</code>; <code>ls -l</code>; <code>firewall-cmd --list-all</code></>, 'pornește auditd; verifică DAC și firewall; compară cu permissive'],
          ['Problema dispare în permissive', 'SELinux o provoacă', <code>ausearch -m avc -ts recent -i</code>, 'repară (etichetă/port/boolean), revino în enforcing'],
          ['Tot apar AVC după restorecon', 'regula de fcontext lipsește sau alt boolean', <code>matchpathcon -V</code>, <><code>semanage fcontext -a</code> + <code>restorecon</code>; sau boolean</>],
          ['AVC pe tcp_socket cu name_bind', 'port neetichetat', <><code>semanage port -l | grep -w PORT</code></>, <><code>semanage port -a -t TIP -p tcp PORT</code></>],
          ['AVC pe tcp_socket cu name_connect', 'conectare spre alt port/serviciu', <><code>audit2why</code></>, <>boolean (<code>httpd_can_network_connect*</code>) sau eticheta portului de destinație</>],
          ['sealert/audit2why: command not found', 'pachete lipsă', <code>rpm -q setroubleshoot-server policycoreutils-python-utils</code>, 'instalează sau citește AVC manual'],
          ['După reboot, problema revine', 'remediu temporar (chcon, setsebool fără -P, setenforce 0)', <code>semanage boolean -l -C</code>, 'refă remediul persistent'],
          ['Prea multe AVC-uri după activarea din disabled', 'sistemul nu a fost reetichetat', <><code>ls -Z</code> arată unlabeled_t</>, <><code>touch /.autorelabel</code> + reboot</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Lași <code>setenforce 0</code> sau <code>SELINUX=permissive</code> ca „soluție”.</>,
          <>Dezactivezi SELinux (<code>SELINUX=disabled</code>).</>,
          <>Dai <code>chmod 777</code> pentru o problemă de etichetă.</>,
          <>Citești doar primul AVC în enforcing: serviciul se oprește la prima eroare și poate urma alta; în permissive vezi toate.</>,
          <>Uiți firewall-ul sau DAC și cauți doar în SELinux (și invers).</>,
          <>Folosești <code>chcon</code> ca remediu final.</>,
          <>Uiți <code>-P</code> la <code>setsebool</code>.</>,
          <>Uiți <code>restorecon</code> după <code>semanage fcontext</code>.</>,
          <>Folosești <code>audit2allow</code> primul, fără a căuta etichetă/port/boolean.</>,
          <>Nu testezi din nou în enforcing și după reboot.</>,
          <>Activezi boolean-uri la întâmplare: privilegiul minim.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: dontaudit, modul de politică propriu, domenii permissive, relabel și limitele diagnosticului">
        <p>
          <b>dontaudit:</b> politica conține reguli care <i>refuză fără a înregistra</i> anumite acțiuni zgomotoase. Dacă bănuiești că o refuzare nu apare în log, <code>semodule -DB</code> dezactivează temporar aceste reguli (și <code>semodule -B</code> le reface). Este o tehnică avansată, în afara obiectivului.
        </p>
        <p>
          <b>Modul de politică propriu:</b> <code>audit2allow -a -M mymodule</code> compilează un modul din refuzările din log; se încarcă cu <code>semodule -i mymodule.pp</code>. Se folosește la aplicații proprii, nu la configurări standard. La EX200 nu este necesar.
        </p>
        <p>
          <b>Domenii permissive:</b> <code>semanage permissive -a httpd_t</code> pune doar un domeniu în permissive, lăsând restul sistemului în enforcing (avantaj față de <code>setenforce 0</code>); <code>semanage permissive -d httpd_t</code> îl scoate. Nu este în obiectiv.
        </p>
        <p>
          <b>Relabel și fixfiles:</b> după restaurări în masă, <code>fixfiles -F relabel</code> sau <code>touch /.autorelabel</code> reetichetează tot. Durata crește cu dimensiunea sistemului de fișiere.
        </p>
        <p>
          <b>Strategia de examen:</b> la un task de serviciu cu SELinux, urmează ordinea: DAC → etichetă (<code>ls -Z</code>, <code>matchpathcon -V</code>) → port (<code>semanage port -l</code>) → boolean (<code>getsebool</code>) → AVC. Fără ponderi oficiale publicate, aceasta este o recomandare de metodă, nu o regulă Red Hat.
        </p>
        <p>
          <b>Limite:</b> unele probleme nu sunt SELinux, nici firewall, nici DAC (configurație greșită, serviciu oprit, DNS). Metoda te ajută să elimini rapid SELinux din ecuație.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_8: TopicModule = {
  id: 'L10.8',
  subtitle: 'diagnosticul SELinux: setenforce 0 ca test, ausearch -m avc, câmpurile AVC, sealert/audit2why, alegerea remediului (etichetă, port, boolean), retest în enforcing (lecție de suport)',
  studyTime: '≈80 min studiu + laborator',
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
  labs: [LAB_L10_8A, LAB_L10_8B],
  sources: [
    { kind: 'man', ref: 'ausearch(8), setenforce(8), selinux(8), restorecon(8), semanage-port(8), setsebool(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'audit2why(8) (404), audit2allow(1), sealert(8), aureport(8), auditctl(8), journalctl -g — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Troubleshooting problems related to SELinux” (secure-troubleshooting_problems_related_to_selinux, docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
