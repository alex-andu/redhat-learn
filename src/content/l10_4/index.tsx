import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_4A, LAB_L10_4B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Fiecare fișier, director și proces de pe un sistem cu SELinux are o <b><G id="selinux-context">etichetă (context de securitate)</G></b> de forma <code>utilizator:rol:tip:nivel</code>, de exemplu <code>system_u:object_r:httpd_sys_content_t:s0</code>. Pe RHEL (politica <i>targeted</i>) partea care decide aproape tot este <b>tipul</b> (<G id="se-type">type</G>, sufixul <code>_t</code>). Politica spune ce tip de proces poate face ce pe ce tip de fișier.
          </p>
          <p>
            Contextele se <b>citesc</b> cu opțiunea <code>-Z</code>: <code>ls -Z</code> (fișiere), <code>ps -eZ</code> (procese), <code>id -Z</code> (propriul context), <code>stat -c %C</code>. Regula de moștenire: un fișier <b>nou</b> primește tipul directorului părinte; <code>cp</code> creează un fișier nou (ia contextul destinației), dar <code>mv</code> <b>păstrează</b> contextul vechi. De aici vin multe erori „Permission denied” cu drepturile <code>rwx</code> corecte.
          </p>
          <p>Obiectivul oficial: <i>„List and identify SELinux file and process context”</i>. Verificare: <code>ls -Z</code>, <code>ps -eZ | grep httpd</code>, <code>matchpathcon</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Etichetele sunt „vocabularul” politicii</h4>
          <p>
            În lecția anterioară ai văzut că politica SELinux conține reguli de tipul „procesul X poate face Y pe obiectul Z”. Pentru ca regulile să funcționeze, kernelul trebuie să știe <i>ce este</i> X și <i>ce este</i> Z. Răspunsul este eticheta: o „carte de identitate” scurtă, atașată fiecărui proces și fiecărui obiect. Fără etichete, politica nu ar avea la ce să se refere.
          </p>
          <Analogy>
            Într-un spital, fiecare persoană poartă un ecuson de culoare (medic, vizitator, curățenie), iar fiecare ușă are o culoare. Regula spune „ecusonul verde deschide doar uși verzi”. Nu contează cine ești <i>personal</i>; contează <b>ecusonul</b> (eticheta procesului) și <b>culoarea ușii</b> (eticheta fișierului). Dacă muți un dulap în camera greșită, dar el păstrează culoarea veche, un medic nu mai poate intra la el, deși toți au „drepturi”.
          </Analogy>

          <h4>Anatomia unui context: patru câmpuri</h4>
          <CodeBlock title="un context de fișier" kind="config" label="illustrative" code={`system_u:object_r:httpd_sys_content_t:s0
   |         |            |            |
 user       role         type        level`} explain={[
            ['utilizator (user) – system_u', 'identitate SELinux (NU același lucru cu utilizatorul Linux). Exemple: system_u (sistem), unconfined_u (utilizator logat neconfinat), user_u. La targeted nu îl modifici.'],
            ['rol (role) – object_r', 'pentru fișiere este de obicei object_r; pentru procese: system_r (servicii), unconfined_r. Face parte din RBAC; la targeted rareori contează.'],
            ['tip (type) – httpd_sys_content_t', 'CÂMPUL IMPORTANT. Pentru fișiere se numește tip; pentru procese, domeniu (httpd_t). Politica referă tipuri și domenii. Se termină în _t.'],
            ['nivel (level) – s0', 'sensibilitate MLS/MCS (s0, uneori s0-s0:c0.c1023). La targeted este în principal s0; apare la izolarea containerelor/VM-urilor.'],
          ]} />
          <Callout kind="info" title="Ce trebuie să reții pentru examen">
            În 95% din cazuri lucrezi cu <b>tipul</b>. Dacă un serviciu nu poate citi un fișier, compară <b>domeniul procesului</b> (<code>ps -eZ</code>) cu <b>tipul fișierului</b> (<code>ls -Z</code>) și cu ce este de așteptat pentru acel serviciu (<code>matchpathcon</code>, <code>semanage fcontext -l</code>).
          </Callout>

          <h4>Tipuri întâlnite des</h4>
          <Table head={['Tip', 'Unde apare', 'Cine îl poate citi/scrie']} rows={[
            [<code>httpd_sys_content_t</code>, <><code>/var/www/html</code> (conținut web)</>, 'httpd (citire)'],
            [<code>httpd_sys_rw_content_t</code>, 'conținut web scriptibil de server', 'httpd (citire + scriere)'],
            [<code>user_home_t</code>, <>fișiere în <code>/home/utilizator</code></>, 'utilizatorul; httpd NU'],
            [<code>ssh_home_t</code>, <><code>~/.ssh</code></>, 'sshd (citire chei)'],
            [<code>etc_t</code>, <>majoritatea fișierelor din <code>/etc</code></>, 'citibil de multe domenii'],
            [<><code>passwd_file_t</code> / <code>shadow_t</code></>, <><code>/etc/passwd</code> / <code>/etc/shadow</code></>, 'doar domenii autorizate'],
            [<code>var_log_t</code>, <><code>/var/log</code></>, 'servicii de log; citibil de root'],
            [<><code>tmp_t</code> / <code>user_tmp_t</code></>, <><code>/tmp</code></>, 'cele mai multe domenii pot scrie'],
            [<code>httpd_t</code>, 'procesul Apache (domeniu)', '—'],
            [<code>sshd_t</code>, 'procesul sshd (domeniu)', '—'],
            [<code>unconfined_t</code>, 'procesele utilizatorilor logați (targeted)', 'restricții foarte mici'],
            [<><code>init_t</code> / <code>initrc_t</code></>, 'systemd și scripturile lui', '—'],
          ]} />
          <p className="small">Lista este orientativă, din practica SELinux; numele exacte și implicit diferă între versiuni de politică și trebuie confirmate pe RHEL 10 cu <code>semanage fcontext -l</code> și <code>ls -Z</code>.</p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Unde se stochează eticheta</h4>
          <p>
            Pentru fișiere, eticheta este un <b>atribut extins</b> (<i>extended attribute</i>) numit <code>security.selinux</code>, ținut în sistemul de fișiere (XFS, ext4 suportă xattr), alături de drepturile clasice. Pentru procese, eticheta este atribut al procesului în kernel, vizibil în <code>/proc/PID/attr/current</code>. Ea se poate vedea și direct: <code>getfattr -n security.selinux FIȘIER</code> (din cunoștințe).
          </p>
          <h4>2. Cum primește un fișier nou eticheta</h4>
          <ul>
            <li><b>Creare</b> (<code>touch</code>, <code>&gt;</code>, <code>mkdir</code>, editor): eticheta implicită este <b>tipul directorului părinte</b> (regula de tranziție implicită). Un fișier creat în <code>/var/www/html</code> primește <code>httpd_sys_content_t</code>; același fișier creat în <code>/home/alice</code> primește <code>user_home_t</code>.</li>
            <li><b>Copiere</b> (<code>cp</code>): creează un fișier <i>nou</i>, deci primește contextul directorului de destinație (nu pe cel al sursei), în afară de <code>cp --preserve=context</code> / <code>cp -a</code>, care îl păstrează pe cel de sursă.</li>
            <li><b>Mutare</b> (<code>mv</code>) în același sistem de fișiere: nu creează fișier nou, doar schimbă numele/locația; eticheta veche <b>rămâne</b>. Aceasta este cauza clasică: ai mutat un fișier din <code>/home</code> în <code>/var/www/html</code> și <code>httpd</code> nu îl poate citi (are încă <code>user_home_t</code>). Remedierea (L10.5): <code>restorecon</code>.</li>
            <li><b>Arhivare/restaurare</b> (<code>tar</code>, <code>rsync</code>): contextele se păstrează doar cu opțiuni dedicate (<code>--selinux</code> la tar, <code>-X</code> și <code>--xattrs</code>); fără ele, fișierele restaurate iau etichetele locației.</li>
          </ul>
          <Table head={['Operație', 'Eticheta rezultată', 'Observație']} rows={[
            [<code>touch /var/www/html/a</code>, <code>httpd_sys_content_t</code>, 'moștenit de la director'],
            [<code>cp ~/a /var/www/html/</code>, <code>httpd_sys_content_t</code>, 'fișier nou: contextul destinației'],
            [<code>mv ~/a /var/www/html/</code>, <code>user_home_t</code>, 'păstrează eticheta sursei: PROBLEMĂ'],
            [<code>cp -a ~/a /var/www/html/</code>, <code>user_home_t</code>, '-a păstrează contextul sursei'],
            [<code>cp --preserve=context</code>, 'a sursei', 'explicit'],
            [<code>cp -Z</code>, 'valoarea implicită pentru cale', 'forțează contextul implicit la copiere'],
          ]} />
          <h4>3. Cum se stabilesc etichetele „implicite” ale unei căi</h4>
          <p>
            Politica include o listă de reguli <b>cale → context</b> (expresii regulate), numită <i>file contexts</i>, de exemplu: <code>/var/www(/.*)?</code> → <code>httpd_sys_content_t</code>. Ele sunt folosite la instalarea pachetelor (rpm etichetează), de <code>restorecon</code> (care readuce o cale la etichetă implicită) și de <code>matchpathcon</code> (care o afișează). Regulile locale adăugate de administrator (<code>semanage fcontext</code>) se păstrează separat. Detalii în L10.5.
          </p>
          <h4>4. Etichetele proceselor</h4>
          <p>
            Un proces primește domeniul de la <b>tranziția de domeniu</b>: când <code>systemd</code> (<code>init_t</code>) pornește fișierul executabil <code>/usr/sbin/httpd</code> (etichetat <code>httpd_exec_t</code>), politica spune „un proces <code>init_t</code> care execută <code>httpd_exec_t</code> trece în domeniul <code>httpd_t</code>”. Așa ajunge Apache să ruleze <code>httpd_t</code>, nu <code>unconfined_t</code>. Concluzie: eticheta executabilului determină domeniul procesului; de aceea fișierele binare din alte locuri (de exemplu un <code>httpd</code> copiat în <code>/tmp</code>) pot rula neconfinat sau eșua.
          </p>
          <h4>5. Cum citește un administrator o refuzare</h4>
          <p>
            Dintr-un AVC (L10.3) ai <code>scontext</code> (domeniul procesului) și <code>tcontext</code> (tipul obiectului). Dacă <code>scontext=…httpd_t…</code> și <code>tcontext=…user_home_t…</code>, înțelegi imediat: Apache încearcă să citească un fișier cu etichetă de home. Remediul (etichetă) este în L10.5.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Permisiuni (L1.8, L10.1):</b> <code>ls -l</code> arată DAC; <code>ls -Z</code> arată MAC. În <code>ls -l</code> un <code>.</code> după drepturi indică un context SELinux asociat (un <code>+</code> indică ACL).</li>
            <li><b>Procese (L4.4):</b> <code>ps</code> are opțiuni SELinux (<code>-Z</code>, <code>-eZ</code>, <code>-ZC nume</code>, <code>auxZ</code>).</li>
            <li><b>Utilizatori (L9.x):</b> <code>id -Z</code> arată contextul sesiunii; utilizatorii Linux sunt mapați la utilizatori SELinux (<code>semanage login -l</code>; nu face parte din obiectiv).</li>
            <li><b>Sisteme de fișiere (L6.1, L6.3):</b> NFS/FAT nu au xattr SELinux; la montare, <code>-o context=system_u:object_r:httpd_sys_content_t:s0</code> etichetează întregul sistem de fișiere; boolean-uri precum <code>httpd_use_nfs</code> (L10.7).</li>
            <li><b>Rețea (L10.6):</b> porturile au și ele tipuri; <code>ss -Z</code> poate arăta contextul proceselor care ascultă (din cunoștințe).</li>
            <li><b>Pachete (L2.x):</b> la instalare, <code>rpm</code> setează etichetele conform politicii; fișierele create ulterior de tine sunt responsabilitatea ta.</li>
            <li><b>Backup/arhivare (L1.9):</b> <code>tar</code> fără suport de contexte pierde etichetele; după restaurare folosești <code>restorecon -R</code>.</li>
            <li><b>systemd (L4.9):</b> unitățile au și ele context (<code>systemd_unit_file_t</code>); o unitate copiată necorespunzător poate fi respinsă.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li><b>Un serviciu nu poate citi/scrie un fișier</b> deși <code>ls -l</code> arată drepturi corecte: compari <code>ps -eZ</code> cu <code>ls -Z</code>.</li>
            <li><b>După mutarea fișierelor</b> între directoare: verifici că tipul se potrivește locației.</li>
            <li><b>După restaurarea dintr-un backup</b> sau montarea unui disc nou.</li>
            <li><b>Înainte de a configura un serviciu</b> cu un director personalizat (<code>/srv/web</code>): știi ce tip trebuie să aibă (L10.5).</li>
            <li><b>Examen:</b> „identify the SELinux context of <code>/var/www/html/index.html</code>”, „display the SELinux context of the <code>sshd</code> process”, „list the SELinux context of files in <code>/srv/web</code>”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Ca să vezi rezultatele, ai nevoie de o mașină RHEL cu SELinux activ (<code>getenforce</code> ≠ Disabled). Toate comenzile din această lecție sunt de <b>citire</b> (fără modificări), în afara celor marcate. Output-urile sunt <b>Ilustrative</b>; tipurile exacte pot diferi pe RHEL 10.
        </Callout>

        <h4>1. Contextul fișierelor și directoarelor: ls -Z</h4>
        <CodeBlock title="comenzi" code={`ls -Z /etc/hostname\nls -lZ /etc/hostname /etc/passwd /etc/shadow\nls -dZ /var/www /var/log /tmp /home /root\nls -lZ ~\nls -ldZ ~/.ssh\nls -lZ /usr/sbin/sshd`} explain={[
          ['ls -Z', '-Z = afișează contextul de securitate al fiecărui element, înaintea numelui.'],
          ['ls -lZ', '-l = format lung (drepturi, proprietar, dimensiune, dată) combinat cu -Z: coloana de context apare după grup.'],
          ['ls -dZ', '-d = pentru directoare arată directorul însuși, nu conținutul: asta vrei când verifici eticheta unui director (/var/www).'],
          ['/usr/sbin/sshd', 'executabilul: tipul lui (sshd_exec_t) determină domeniul procesului sshd.'],
        ]} />

        <h4>2. Contextul proceselor: ps -Z</h4>
        <CodeBlock title="comenzi" code={`ps -eZ | head -5\nps -eZ | grep -E 'sshd|chronyd|systemd'\nps -ZC sshd\nps auxZ | grep httpd\nps -Z\nid -Z\ncat /proc/self/attr/current; echo\nps -o pid,label,comm -C sshd`} explain={[
          ['ps -eZ', '-e = toate procesele, -Z = coloana LABEL (contextul de securitate).'],
          ['ps -ZC sshd', '-C = selectează după numele comenzii; -Z adaugă contextul: arată domeniul lui sshd.'],
          ['ps auxZ', 'formatul BSD (aux) cu contextul: pentru toate procesele, cu utilizator și memorie.'],
          ['ps -Z', 'doar procesele din terminalul curent (de obicei bash și ps), cu context: tu rulezi în unconfined_t.'],
          ['id -Z', 'contextul propriului shell/sesiuni.'],
          ['cat /proc/self/attr/current', 'contextul procesului curent, direct din kernel (cat însuși).'],
          ['ps -o pid,label,comm -C sshd', '-o = coloane la alegere: pid, label (context), comm (nume comandă).'],
        ]} />

        <h4>3. Alte moduri de a citi o etichetă</h4>
        <CodeBlock title="comenzi" code={`stat -c '%C %n' /etc/hostname /var/log\nstat -c '%C' ~/.ssh\nsudo getfattr -n security.selinux /etc/hostname\nsudo sestatus -v`} explain={[
          ["stat -c '%C %n'", '-c = format propriu; %C = contextul SELinux, %n = numele (stat din coreutils).'],
          ['getfattr -n security.selinux', 'citește atributul extins din care vine eticheta (pachetul attr; din cunoștințe).'],
          ['sestatus -v', 'afișează contextul procesului curent, al init-ului și al terminalului (sestatus(8)).'],
        ]} />

        <h4>4. Cum ar trebui să fie eticheta: matchpathcon și semanage fcontext -l</h4>
        <CodeBlock title="comenzi" code={`matchpathcon /var/www/html/index.html\nmatchpathcon -V /var/www/html/index.html\nmatchpathcon -n /etc/shadow\nsudo semanage fcontext -l | head -5\nsudo semanage fcontext -l | grep -E '^/var/www'\nsudo semanage fcontext -l -C`} explain={[
          ['matchpathcon CALE', 'afișează contextul IMPLICIT (din politică) pentru acea cale, chiar dacă fișierul nu există; „identice căi pot avea contexte diferite după tipul fișierului” (matchpathcon(8)).'],
          ['matchpathcon -V', '-V = verifică dacă eticheta de pe disc corespunde celei implicite și raportează „verified” sau diferența.'],
          ['-n', '-n = nu afișează calea (doar contextul).'],
          ['semanage fcontext -l', '-l = listează regulile cale → context din politică (mii de linii: filtrează cu grep). Necesită pachetul policycoreutils-python-utils.'],
          ['semanage fcontext -l -C', '-C = doar personalizările LOCALE adăugate de administrator (de obicei goală pe un sistem nou).'],
        ]} />

        <h4>5. Observă regula de moștenire și mv vs cp (inofensiv, în directoare de test)</h4>
        <CodeBlock title="comenzi" code={`mkdir ~/ctx-test && cd ~/ctx-test\ntouch a.txt\nls -Z a.txt\nsudo mkdir -p /srv/web\nsudo ls -dZ /srv/web\nsudo cp a.txt /srv/web/cp.txt\nsudo mv a.txt /srv/web/mv.txt\nsudo ls -lZ /srv/web\ncp -a /etc/hostname ~/ctx-test/ && ls -Z ~/ctx-test/hostname\nrm -r ~/ctx-test; sudo rm -r /srv/web`} explain={[
          ['touch a.txt; ls -Z a.txt', 'în home: tip user_home_t (moștenit).'],
          ['sudo mkdir -p /srv/web', 'director de test în /srv (tip implicit, de exemplu var_t/srv_t; de confirmat).'],
          ['sudo cp a.txt /srv/web/cp.txt', 'copierea creează fișier nou: ia contextul destinației.'],
          ['sudo mv a.txt /srv/web/mv.txt', 'mutarea păstrează contextul sursei (user_home_t): diferența față de cp.'],
          ['cp -a …', '-a = arhivare: păstrează, printre altele, contextul (--preserve=all include context).'],
          ['rm -r …', 'curăță directoarele de test.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ls -lZ" kind="session" label="illustrative" code={`[student@server1 ~]$ ls -lZ /etc/hostname /etc/shadow /usr/sbin/sshd
-rw-r--r--. 1 root root system_u:object_r:hostname_etc_t:s0 10 Nov 10 09:12 /etc/hostname
----------. 1 root root system_u:object_r:shadow_t:s0      1043 Nov 12 11:30 /etc/shadow
-rwxr-xr-x. 1 root root system_u:object_r:sshd_exec_t:s0   903560 Oct 20 08:00 /usr/sbin/sshd`} />
        <p className="small">
          Coloanele: drepturi, număr de legături, proprietar, grup, <b>context</b>, dimensiune, dată, nume. <code>/etc/shadow</code> are drepturi <code>---------- </code> (0000) și tipul <code>shadow_t</code>: doar procese autorizate (<code>passwd</code>, <code>login</code>) pot citi, root o ocolește prin capabilități, nu prin DAC. <code>sshd_exec_t</code> este tipul executabilului, cel care face ca procesul să intre în domeniul <code>sshd_t</code>. Tipurile din exemplu sunt ilustrative.
        </p>
        <CodeBlock title="ps -eZ (extras)" kind="session" label="illustrative" code={`[student@server1 ~]$ ps -eZ | grep -E 'systemd|sshd|chronyd|bash'
system_u:system_r:init_t:s0              1 ?        00:00:03 systemd
system_u:system_r:sshd_t:s0-s0:c0.c1023  912 ?       00:00:00 sshd
system_u:system_r:chronyd_t:s0           701 ?       00:00:00 chronyd
unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023 1844 pts/0 00:00:00 bash`} />
        <p className="small">
          Prima coloană este contextul procesului: <code>init_t</code> (systemd), <code>sshd_t</code> și <code>chronyd_t</code> (servicii confinate), iar <code>bash</code>-ul tău rulează în <code>unconfined_t</code> (neconfinat, în politica targeted). Câmpul <code>s0-s0:c0.c1023</code> este nivelul MLS/MCS (interval). <code>system_r</code> este rolul serviciilor, <code>unconfined_r</code> al utilizatorului.
        </p>
        <CodeBlock title="mv vs cp" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo ls -lZ /srv/web
-rw-r--r--. 1 root    root    unconfined_u:object_r:var_t:s0       0 Nov 17 17:20 cp.txt
-rw-rw-r--. 1 student student unconfined_u:object_r:user_home_t:s0 0 Nov 17 17:19 mv.txt`} />
        <p className="small">
          <code>cp.txt</code> (copiat) a luat tipul directorului de destinație (aici <code>var_t</code>); <code>mv.txt</code> (mutat) a păstrat <code>user_home_t</code>. Doar a doua variantă este suspectă dacă un serviciu are nevoie de acel fișier. Tipul exact al <code>/srv/web</code> și alte detalii sunt ilustrative.
        </p>
        <CodeBlock title="matchpathcon" kind="session" label="illustrative" code={`[student@server1 ~]$ matchpathcon /var/www/html/index.html
/var/www/html/index.html	system_u:object_r:httpd_sys_content_t:s0
[student@server1 ~]$ matchpathcon -V /var/www/html/index.html
/var/www/html/index.html has context unconfined_u:object_r:user_home_t:s0, should be system_u:object_r:httpd_sys_content_t:s0`} />
        <p className="small">
          Prima comandă spune ce <i>ar trebui</i> să fie; a doua compară cu ce este. Mesajul „has context … should be …” (formularea exactă variază) este semnul că fișierul are o etichetă greșită; remedierea este <code>restorecon</code> (L10.5).
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Eticheta unui fișier:</b> <code>ls -Z FIȘIER</code> (director: <code>ls -dZ</code>).</li>
            <li><b>Eticheta unui proces:</b> <code>ps -eZ | grep NUME</code> sau <code>ps -ZC NUME</code>.</li>
            <li><b>Eticheta ta:</b> <code>id -Z</code>.</li>
            <li><b>Ce ar trebui să fie:</b> <code>matchpathcon CALE</code>; compară cu <code>ls -Z</code>; <code>matchpathcon -V</code> face comparația.</li>
            <li><b>Regulile locale:</b> <code>sudo semanage fcontext -l -C</code>.</li>
            <li><b>Dacă un serviciu e blocat:</b> <code>sudo ausearch -m avc -ts recent -i</code> arată <code>scontext</code>/<code>tcontext</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Etichetele fișierelor sunt atribute extinse stocate în sistemul de fișiere: <b>persistă la reboot</b>. Dar modificarea unei etichete cu <code>chcon</code> este fragilă: se pierde la <code>restorecon</code> sau la un relabel, pentru că politica nu o cunoaște. O etichetă <i>durabilă</i> se obține adăugând o regulă (<code>semanage fcontext</code>) și apoi aplicând-o (<code>restorecon</code>): vezi L10.5. În această lecție doar <b>citești</b> etichete, deci nu ai nimic de persistat.
          </p>
          <p>
            Etichetele proceselor nu persistă (se calculează la fiecare pornire a procesului, după eticheta executabilului și politica activă).
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['ls -Z afișează ? sau lipsă de context', 'SELinux disabled sau sistem de fișiere fără suport', <><code>getenforce</code>, <code>mount | grep NUME</code></>, 'activează SELinux; pe NFS/FAT folosește context= la montare'],
          [<>Fișier cu tip <code>unlabeled_t</code></>, 'creat cât SELinux era disabled sau cu o politică diferită', <code>ls -Z</code>, <><code>restorecon -R -v CALE</code> sau <code>touch /.autorelabel</code></>],
          ['Serviciul nu poate citi fișierul mutat din /home', 'mv a păstrat user_home_t', <><code>ls -Z</code>, <code>matchpathcon CALE</code></>, <><code>restorecon -v FIȘIER</code> (L10.5)</>],
          [<>Procesul rulează în <code>unconfined_t</code> în loc de domeniul serviciului</>, 'executabilul are tip greșit sau serviciul e pornit manual', <code>ls -Z BINAR</code>, 'pornește prin systemd; repară eticheta binarului'],
          ['Nu apar tipurile așteptate la un director nou în /srv', 'ia tipul părintelui, nu pe cel dorit', <><code>ls -dZ /srv/DIR</code></>, <>adaugă regulă <code>semanage fcontext</code> + <code>restorecon</code></>],
          ['semanage: command not found', 'pachet lipsă', <code>rpm -q policycoreutils-python-utils</code>, <code>sudo dnf install policycoreutils-python-utils</code>],
          ['Contextul se pierde la restaurarea din arhivă', 'tar/rsync fără suport de xattr', 'compară cu matchpathcon', <><code>restorecon -R</code> după restaurare</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Verifici doar <code>ls -l</code> și te oprești: drepturile pot fi corecte și eticheta greșită.</>,
          <>Uiți <code>-d</code> la <code>ls -Z</code> pe un director și vezi conținutul, nu eticheta directorului.</>,
          <>Crezi că <code>mv</code> schimbă eticheta în funcție de destinație: <b>nu</b>, o păstrează; <code>cp</code> o ia de la destinație.</>,
          <>Confunzi <b>domeniul</b> procesului (<code>httpd_t</code>) cu <b>tipul</b> fișierului (<code>httpd_sys_content_t</code>).</>,
          <>Citești utilizatorul SELinux (<code>system_u</code>) ca fiind utilizatorul Linux.</>,
          <>Presupui că rolul și nivelul sunt cele care contează la targeted: contează <b>tipul</b>.</>,
          <>Folosești <code>ps -e</code> în loc de <code>ps -eZ</code> când trebuie să identifici contextul procesului.</>,
          <>Încerci <code>ls -Z</code> pe un sistem cu SELinux disabled și trag concluzii greșite.</>,
          <>Crezi că un fișier cu <code>.</code> după drepturi (<code>-rw-r--r--.</code>) înseamnă ceva rău: arată doar prezența unui context.</>,
          <>Schimbi eticheta cu <code>chcon</code> și crezi că este durabilă.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: tranziții de domeniu, xattr, MLS/MCS, utilizatori SELinux și cum caută rpm etichetele">
        <p>
          <b>Tranziții:</b> politica conține reguli <code>type_transition</code> care spun ce domeniu primește un proces nou când un domeniu sursă execută un executabil cu un anumit tip (<code>init_t</code> + <code>httpd_exec_t</code> → <code>httpd_t</code>). Pentru fișiere noi, o regulă similară alege tipul în funcție de tipul directorului.
        </p>
        <p>
          <b>xattr:</b> eticheta este în atributul <code>security.selinux</code>. Sistemele de fișiere fără xattr (FAT, unele montări NFS) folosesc contexte dată la montare. <code>mount -o context=…</code> aplică un singur context întregului sistem de fișiere; <code>fscontext=</code>, <code>defcontext=</code>, <code>rootcontext=</code> sunt variante (din cunoștințe, nu în obiectiv).
        </p>
        <p>
          <b>MLS/MCS:</b> <code>s0-s0:c0.c1023</code> înseamnă „nivel s0 până la s0, cu categorii c0 până la c1023”. Pe sisteme MCS, categoriile separă containerele (fiecare cu perechi unice c#,c#). Nu le modifici pentru EX200.
        </p>
        <p>
          <b>Utilizatori SELinux:</b> <code>semanage login -l</code> mapează utilizatorii Linux la utilizatori SELinux (<code>__default__ → unconfined_u</code>, <code>root → unconfined_u</code>). Utilizatorii confinați (<code>user_u</code>, <code>staff_u</code>) limitează ce pot face utilizatorii; nu este în obiectiv.
        </p>
        <p>
          <b>rpm:</b> la instalare, <code>rpm</code> setează etichetele pe baza politicii (plugin SELinux). Un pachet instalat <i>înainte</i> să fie încărcată politica poate avea etichete nepotrivite; remediul este <code>restorecon -R</code> sau relabel.
        </p>
        <p>
          <b>Alte tool-uri:</b> <code>seinfo</code> și <code>sesearch</code> (pachetul <code>setools-console</code>) interoghează politica (de exemplu cine poate scrie în <code>httpd_sys_content_t</code>); <code>sepolicy</code> generează documentație; ele nu sunt necesare pentru obiectiv și nu au fost verificate aici.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_4: TopicModule = {
  id: 'L10.4',
  subtitle: 'contextul SELinux (utilizator:rol:tip:nivel), ls -Z, ps -eZ, id -Z, stat %C, moștenirea etichetelor (touch/cp/mv), matchpathcon, semanage fcontext -l',
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
  labs: [LAB_L10_4A, LAB_L10_4B],
  sources: [
    { kind: 'man', ref: 'selinux(8), semanage-fcontext(8), restorecon(8), matchpathcon(8), sestatus(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'ls(1) și ps(1) opțiunea -Z, id(1) -Z, stat(1) %C, chcon(1), getfattr(1), tabelul de tipuri uzuale — NECITITE în această sesiune; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Using SELinux” (docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
