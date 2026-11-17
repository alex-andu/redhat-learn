import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_5A, LAB_L10_5B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Când eticheta unui fișier nu corespunde cu cea pe care ar trebui s-o aibă (de obicei după un <code>mv</code>, o restaurare din backup sau un director nou), o readuci la valoarea implicită cu <G id="restorecon"><code>restorecon</code></G>: <code>restorecon -v FIȘIER</code> sau <code>restorecon -Rv DIRECTOR</code> (<code>-R</code> recursiv, <code>-v</code> arată ce se schimbă). El citește regulile din politică (cale → context) și aplică tipul corect.
          </p>
          <p>
            Dacă folosești un director <b>neobișnuit</b> (de exemplu <code>/srv/web</code> pentru Apache), politica nu știe ce tip trebuie să aibă. Atunci adaugi o regulă cu <G id="semanage"><code>semanage fcontext</code></G> <code>-a -t TIP "/cale(/.*)?"</code> și o aplici cu <code>restorecon -R</code>. Regula persistă (se păstrează și la un relabel), spre deosebire de <G id="chcon"><code>chcon</code></G>, care schimbă eticheta doar „pe moment” și se pierde.
          </p>
          <p>Obiectivul oficial: <i>„Restore default file contexts”</i>. Verificare: <code>ls -Z</code>, <code>matchpathcon -V</code>, <code>restorecon -nv</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: etichetele se strică și trebuie reparate</h4>
          <p>
            În L10.4 ai văzut că un fișier mutat din <code>/home</code> în <code>/var/www/html</code> păstrează <code>user_home_t</code> și <code>httpd</code> nu îl poate citi. Mai sunt și alte cauze: restaurarea unui backup fără contexte, copierea cu <code>cp -a</code>, crearea unui director în afara locațiilor standard, montarea unui disc nou, instalarea manuală a unei aplicații (în <code>/opt</code>), ori un sistem care a fost cândva <code>disabled</code>. Soluția nu este să schimbi drepturile sau să dezactivezi SELinux, ci să <b>repari eticheta</b>.
          </p>
          <Analogy>
            Politica este un <b>registru oficial</b>: „orice fișier din <code>/var/www</code> are eticheta web”. <code>restorecon</code> este <b>funcționarul</b> care se plimbă printre fișiere, verifică registrul și <i>lipește eticheta corectă</i> pe fiecare. <code>semanage fcontext</code> este <b>modificarea registrului</b>: adaugi o linie nouă („orice din <code>/srv/web</code> este tot web”). <code>chcon</code> este un <b>abțibild lipit de mână</b> peste fișier: arată bine, dar la primul control al funcționarului dispare.
          </Analogy>

          <h4>Două tipuri de reparații</h4>
          <Table head={['Situație', 'Soluție', 'Durabil?']} rows={[
            ['Calea este una standard (/var/www/html, /home, /etc/…) și doar fișierul are eticheta greșită', <><code>restorecon -v FIȘIER</code></>, 'da: politica știe eticheta corectă'],
            ['Calea este nestandard (/srv/web, /data/site, /opt/app/…) și vrei o etichetă anume', <><code>semanage fcontext -a -t TIP "REGEX"</code> + <code>restorecon -R</code></>, 'da: regula e salvată în politică'],
            ['Test rapid, fără a modifica politica', <><code>chcon -t TIP FIȘIER</code></>, 'NU: restorecon/relabel o anulează'],
            ['Tot sistemul de fișiere e dezordonat (după disabled)', <><code>touch /.autorelabel</code> + reboot</>, 'da: relabel complet'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. De unde știe restorecon eticheta „corectă”</h4>
          <p>
            Politica activă conține fișiere <i>file contexts</i> care mapează <b>expresii regulate de cale</b> la contexte. Din cunoștințe (de confirmat pe RHEL 10), ele se află în <code>/etc/selinux/targeted/contexts/files/</code>: <code>file_contexts</code> (regulile distribuției), <code>file_contexts.homedirs</code> (pentru home-uri) și <code>file_contexts.local</code> (regulile TALE, adăugate cu <code>semanage fcontext</code>). Exemplu de regulă: <code>/var/www(/.*)?</code> → <code>system_u:object_r:httpd_sys_content_t:s0</code>. Când rulezi <code>restorecon</code> pe o cale, el caută cea mai specifică regulă care se potrivește și aplică contextul.
          </p>
          <p>
            Conform <code>restorecon(8)</code>: <i>„setează contextul de securitate (atribute extinse) pe unul sau mai multe fișiere; dacă fișierul are deja un context, doar <b>tipul</b> se schimbă, în afara cazului în care folosești <code>-F</code> sau <code>-U</code>”</i>. Contextul implicit vine din politica activă.
          </p>
          <h4>2. Expresia regulată din semanage fcontext</h4>
          <p>
            <code>FILE_SPEC</code> este o <b>expresie regulată</b> (L1.6), nu o cale simplă. Cea mai folosită formă: <code>"/srv/web(/.*)?"</code>:
          </p>
          <Table head={['Fragment', 'Sens']} rows={[
            [<code>/srv/web</code>, 'directorul însuși'],
            [<code>(/.*)?</code>, 'opțional ( ? ): „/” urmat de orice (.*): tot ce e sub director, la orice adâncime'],
            [<code>"…"</code>, 'ghilimele: shell-ul nu trebuie să interpreteze caracterele speciale (( ) * ?)'],
          ]} />
          <p>
            Fără <code>(/.*)?</code> regula se aplică doar directorului, nu și fișierelor din el. Aceasta este una dintre cele mai frecvente greșeli.
          </p>
          <h4>3. Tipul de fișier (-f)</h4>
          <p>
            Fără <code>-f</code>, regula se aplică tuturor tipurilor de obiecte. Cu <code>-f</code> o restrângi (<code>semanage-fcontext(8)</code>): <code>f</code> fișier obișnuit, <code>d</code> director, <code>l</code> legătură simbolică, <code>s</code> socket, <code>p</code> pipe, <code>b</code>/<code>c</code> dispozitive. Exemplu: <code>-f f</code> pentru fișiere obișnuite. La examen, de regulă nu ai nevoie de <code>-f</code>.
          </p>
          <h4>4. Echivalența (-e)</h4>
          <p>
            <code>semanage fcontext -a -e /var/www /srv/web</code> spune „<code>/srv/web</code> se etichetează ca <code>/var/www</code>”, fără a specifica tipul explicit: toate regulile pentru <code>/var/www</code> (inclusiv subdirectoare, <code>httpd_sys_rw_content_t</code> etc.) se aplică și aici. E comod pentru a replica o structură. Limite din pagină: ambele argumente sunt prefixe de cale (fără regex) și nu se înlănțuie.
          </p>
          <h4>5. Fluxul complet pentru un director nou</h4>
          <ol>
            <li><b>Creezi</b> directorul (<code>mkdir -p /srv/web</code>): primește tipul părintelui (nepotrivit pentru web).</li>
            <li><b>Adaugi regula</b>: <code>semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"</code>. Doar regula e înscrisă în <code>file_contexts.local</code>; <i>fișierele existente nu se schimbă încă</i>.</li>
            <li><b>Aplici</b>: <code>restorecon -Rv /srv/web</code>: acum etichetele de pe disc se schimbă.</li>
            <li><b>Verifici</b>: <code>ls -dZ /srv/web</code>, <code>ls -Z /srv/web</code>, <code>matchpathcon -V</code>.</li>
            <li>Fișierele create <b>ulterior</b> în <code>/srv/web</code> moștenesc automat tipul (regula de creare) iar un relabel/restorecon îl va menține.</li>
          </ol>
          <Callout kind="warn" title="Doi pași, nu unul">
            <code>semanage fcontext</code> modifică <b>politica</b> (regula), nu fișierele; <code>restorecon</code> modifică <b>fișierele</b> pe baza politicii. Dacă faci doar primul pas, <code>ls -Z</code> nu se schimbă; dacă faci doar al doilea, nu are ce să aplice. La examen se pică des tocmai pentru că se uită <code>restorecon</code>.
          </Callout>
          <h4>6. chcon: de ce nu este soluția</h4>
          <p>
            <code>chcon -t httpd_sys_content_t /srv/web/index.html</code> schimbă direct eticheta, dar nu scrie nicio regulă. Dacă mai târziu cineva rulează <code>restorecon -R /srv/web</code> sau se face un relabel, politica nu cunoaște <code>/srv/web</code> și eticheta revine la valoarea implicită a părintelui. Poți folosi <code>chcon</code> pentru un test rapid (<code>-R</code> recursiv, <code>-t</code> tip, <code>--reference=ALT</code> copiază eticheta unui alt fișier), dar pentru rezultat <b>persistent</b> alegi <code>semanage fcontext</code> + <code>restorecon</code>. (Pagina <code>chcon(1)</code> nu a putut fi citită; comportamentul descris este cunoștință standard SELinux, de confirmat.)
          </p>
          <h4>7. Opțiuni importante la restorecon</h4>
          <Table head={['Opțiune', 'Efect (restorecon(8))']} rows={[
            [<code>-v</code>, 'afișează schimbările de etichetă (relabel from … to …); poate fi repetat'],
            [<><code>-R</code> sau <code>-r</code></>, 'recursiv, pe tot subarborele'],
            [<code>-n</code>, 'verificare pasivă: nu schimbă nimic; cu -v arată ce ar schimba'],
            [<code>-F</code>, 'forțează resetarea completă a contextului (utilizator, rol, interval) și a tipurilor „customizabile”'],
            [<code>-e DIR</code>, 'exclude un director (cale completă)'],
            [<code>-x</code>, 'nu traversează alte sisteme de fișiere'],
            [<code>-i</code>, 'ignoră fișierele inexistente'],
            [<code>-f FIȘIER</code>, 'citește lista de căi dintr-un fișier sau stdin'],
            [<code>-p</code>, 'afișează progresul (nu poate fi combinat cu -v)'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Contexte (L10.4):</b> înainte să repari, <code>ls -Z</code> și <code>matchpathcon -V</code> arată problema.</li>
            <li><b>Boot și relabel (L4.3, L10.3):</b> <code>touch /.autorelabel</code> declanșează <code>restorecon</code>/<code>fixfiles</code> pe întregul sistem la următorul boot.</li>
            <li><b>Servicii (L4.9, L10.6, L10.7):</b> un serviciu nou cu director personalizat (web, FTP, NFS exportat) cere de obicei: etichetă corectă (această lecție) + eventual port (L10.6) + boolean (L10.7) + firewall (L8.4).</li>
            <li><b>Stocare (L5.5, L6.x):</b> un disc nou montat în <code>/data</code> are eticheta implicită a căii; fișierele din el necesită reguli dacă un serviciu le folosește.</li>
            <li><b>Arhive (L1.9):</b> după <code>tar -x</code> sau <code>rsync</code> fără suport de contexte, rulezi <code>restorecon -R</code> pe destinație.</li>
            <li><b>SSH (L10.2):</b> <code>restorecon -R -v ~/.ssh</code> repară cheile mutate.</li>
            <li><b>Pachete (L2.x):</b> <code>rpm -V</code> poate raporta diferențe de context (litera <code>Z</code>? de confirmat); reinstalarea unui pachet redă etichetele fișierelor lui.</li>
            <li><b>Utilizatori/sudo (C9):</b> <code>restorecon</code> cere drepturi de scriere pe fișiere (de obicei root).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li><b>După mv, restore, rsync:</b> restorecon pe destinație.</li>
            <li><b>Director personalizat pentru un serviciu:</b> semanage fcontext + restorecon, ca fișierele noi și relabel-ul să rămână corecte.</li>
            <li><b>Sistem care a fost disabled:</b> relabel complet.</li>
            <li><b>Audit:</b> <code>restorecon -nRv /</code> (cu răbdare) arată ce nu corespunde.</li>
            <li><b>Examen:</b> „the web server must serve content from <code>/srv/web</code>”, „restore the default SELinux context of <code>/var/www/html</code>”, „make a custom directory accessible to <code>httpd</code> and make the change persistent”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi pe o mașină de test cu SELinux activ, ca <code>root</code> sau cu <code>sudo</code>. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Pachetul <code>policycoreutils-python-utils</code> oferă <code>semanage</code>; dacă lipsește: <code>sudo dnf install policycoreutils-python-utils</code> (de confirmat pe RHEL 10).
        </Callout>

        <h4>1. Verifică ce nu se potrivește (fără a schimba nimic)</h4>
        <CodeBlock title="comenzi" code={`ls -Z /var/www/html\nmatchpathcon -V /var/www/html/*\nsudo restorecon -nRv /var/www/html\nsudo restorecon -nv /home/student/*`} explain={[
          ['matchpathcon -V CALE…', '-V = verifică eticheta de pe disc față de cea implicită; spune „verified” sau „has context … should be …”.'],
          ['restorecon -nRv DIR', '-n = pasiv (nu schimbă); -R = recursiv; -v = afișează ce AR schimba (Would relabel …).'],
        ]} />

        <h4>2. Repară un fișier sau un director</h4>
        <CodeBlock title="comenzi" code={`sudo restorecon -v /var/www/html/index.html\nsudo restorecon -Rv /var/www/html\nsudo restorecon -Rv /home/student\nsudo restorecon -v /etc/hostname /etc/passwd\nsudo restorecon -RFv /var/www/html\nls -Z /var/www/html`} explain={[
          ['restorecon -v FIȘIER', 'repară un singur fișier; -v afișează „Relabeled … from X to Y” numai pentru ce s-a schimbat (dacă tot e corect, nu afișează nimic).'],
          ['restorecon -Rv DIR', 'recursiv pe subarbore.'],
          ['restorecon -RFv DIR', '-F = resetează COMPLET contextul (utilizator, rol, nivel) și tipurile customizabile; folosit rar, când restorecon simplu nu schimbă nimic.'],
        ]} />

        <h4>3. Director personalizat pentru un serviciu web: regulă + aplicare</h4>
        <CodeBlock title="comenzi" code={`sudo mkdir -p /srv/web\nsudo sh -c 'echo "Hello" > /srv/web/index.html'\nls -dZ /srv/web; ls -Z /srv/web/index.html\nmatchpathcon /srv/web /srv/web/index.html\nsudo semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"\nsudo semanage fcontext -l -C\nls -dZ /srv/web; ls -Z /srv/web/index.html\nsudo restorecon -Rv /srv/web\nls -dZ /srv/web; ls -Z /srv/web/index.html\nmatchpathcon -V /srv/web/index.html`} explain={[
          ['mkdir -p /srv/web', '-p = creează și părinții lipsă, fără eroare dacă există.'],
          ["sh -c 'echo … > …'", 'sudo nu se aplică redirecționării >, deci rulezi redirecționarea într-un shell lansat cu sudo.'],
          ['semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"', '-a = add (adaugă regula); -t = tipul care va fi aplicat; expresia regulată: /srv/web și tot ce e sub el. Se scrie în politică (file_contexts.local), nu atinge fișierele.'],
          ['semanage fcontext -l -C', '-l = listează, -C = doar regulile locale: trebuie să apară regula nouă.'],
          ['restorecon -Rv /srv/web', 'aplică regula pe fișierele existente: acum ls -Z arată httpd_sys_content_t.'],
        ]} />

        <h4>4. Modifică sau șterge o regulă locală</h4>
        <CodeBlock title="comenzi" code={`sudo semanage fcontext -m -t httpd_sys_rw_content_t "/srv/web/upload(/.*)?"\nsudo semanage fcontext -a -t httpd_sys_rw_content_t "/srv/web/upload(/.*)?"\nsudo semanage fcontext -d "/srv/web/upload(/.*)?"\nsudo semanage fcontext -D\nsudo restorecon -Rv /srv/web`} explain={[
          ['-m', '-m = modify: modifică o regulă care EXISTĂ deja (dacă nu există, eroare).'],
          ['-a', '-a = add: adaugă; dacă regula există deja pentru același FILE_SPEC, dă eroare (folosește -m).'],
          ['-d FILE_SPEC', '-d = delete: șterge regula locală (nu poate șterge regulile din politica de bază).'],
          ['-D', '-D = deleteall: șterge TOATE personalizările locale (atenție).'],
          ['restorecon -Rv', 'după orice schimbare de regulă, reaplici: ștergerea regulii NU revine singură la etichetele vechi decât prin restorecon.'],
        ]} />

        <h4>5. Echivalență cu un director existent</h4>
        <CodeBlock title="comenzi" code={`sudo semanage fcontext -a -e /var/www /srv/web\nsudo semanage fcontext -l -C\nsudo restorecon -Rv /srv/web`} explain={[
          ['-e /var/www /srv/web', '-e = equal: „/srv/web se etichetează ca /var/www”; /var/www este sursa, /srv/web destinația. Fără regex.'],
        ]} />

        <h4>6. chcon (doar test) și relabel complet</h4>
        <CodeBlock title="comenzi" code={`sudo chcon -t httpd_sys_content_t /srv/web/index.html\nsudo chcon -R -t httpd_sys_content_t /srv/web\nsudo chcon --reference=/var/www/html/index.html /srv/web/index.html\nls -Z /srv/web/index.html\nsudo touch /.autorelabel\nsudo fixfiles -F onboot`} explain={[
          ['chcon -t TIP FIȘIER', '-t = schimbă tipul; modificarea NU e înscrisă în politică (dispare la restorecon/relabel).'],
          ['chcon -R', '-R = recursiv.'],
          ['chcon --reference=ALT FIȘIER', 'copiază contextul unui alt fișier.'],
          ['touch /.autorelabel', 'la următorul boot reeticheteză tot sistemul, apoi șterge fișierul; poate dura minute.'],
          ['fixfiles -F onboot', 'variantă care programează relabel la boot cu resetare completă (pagină necitită; de confirmat).'],
        ]} />
        <Callout kind="warn" title="Pe examen: semanage + restorecon, nu chcon">
          Dacă un task spune „persistent” sau „survive a relabel”, soluția cu <code>chcon</code> nu este suficientă. Verificatorul poate rula <code>restorecon -R</code> și <code>matchpathcon</code>: o etichetă pusă doar cu <code>chcon</code> ar fi anulată.
        </Callout>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="restorecon -nRv (simulare)" kind="session" label="illustrative" code={`[root@server1 ~]# restorecon -nRv /var/www/html
Would relabel /var/www/html/page.html from unconfined_u:object_r:user_home_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0`} />
        <p className="small">
          Cu <code>-n</code> nu se schimbă nimic; sistemul spune ce ar face. În exemplu, <code>user_home_t</code> → <code>httpd_sys_content_t</code>: schimbarea afectează <b>tipul</b>; utilizatorul (<code>unconfined_u</code>) rămâne (nu s-a folosit <code>-F</code>). Mesajele exacte („Would relabel” vs „Relabeled”) depind de versiune.
        </p>
        <CodeBlock title="restorecon -Rv (aplicare)" kind="session" label="illustrative" code={`[root@server1 ~]# restorecon -Rv /var/www/html
Relabeled /var/www/html/page.html from unconfined_u:object_r:user_home_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
[root@server1 ~]# restorecon -Rv /var/www/html
[root@server1 ~]#`} />
        <p className="small">
          Prima rulare schimbă; a doua nu mai afișează nimic, pentru că totul era deja corect (<code>-v</code> raportează doar schimbările). Lipsa de output NU înseamnă eroare.
        </p>
        <CodeBlock title="semanage fcontext + restorecon pe /srv/web" kind="session" label="illustrative" code={`[root@server1 ~]# ls -dZ /srv/web ; ls -Z /srv/web/index.html
unconfined_u:object_r:var_t:s0 /srv/web
unconfined_u:object_r:var_t:s0 /srv/web/index.html
[root@server1 ~]# semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"
[root@server1 ~]# semanage fcontext -l -C
SELinux fcontext                       type               Context
/srv/web(/.*)?                         all files          system_u:object_r:httpd_sys_content_t:s0
[root@server1 ~]# ls -Z /srv/web/index.html
unconfined_u:object_r:var_t:s0 /srv/web/index.html
[root@server1 ~]# restorecon -Rv /srv/web
Relabeled /srv/web from unconfined_u:object_r:var_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
Relabeled /srv/web/index.html from unconfined_u:object_r:var_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0`} />
        <p className="small">
          <b>Pas 1:</b> tipul de pornire (<code>var_t</code>, moștenit). <b>Pas 2:</b> regula apare în lista locală (<code>-l -C</code>): coloanele sunt expresia, tipul de obiect (<code>all files</code>) și contextul. <b>Pas 3:</b> <code>ls -Z</code> <i>încă</i> arată <code>var_t</code>: regula nu a atins fișierele. <b>Pas 4:</b> <code>restorecon</code> schimbă directorul și fișierul. Valorile (<code>var_t</code>, formatul exact al coloanelor) sunt ilustrative.
        </p>
        <CodeBlock title="matchpathcon -V" kind="session" label="illustrative" code={`[root@server1 ~]# matchpathcon -V /srv/web/index.html
/srv/web/index.html verified.`} />
        <p className="small">„verified” = eticheta de pe disc coincide cu cea implicită (inclusiv regulile locale). Este confirmarea finală.</p>
        <CodeBlock title="chcon pierdut la restorecon" kind="session" label="illustrative" code={`[root@server1 ~]# chcon -t httpd_sys_content_t /srv/web2/index.html
[root@server1 ~]# ls -Z /srv/web2/index.html
unconfined_u:object_r:httpd_sys_content_t:s0 /srv/web2/index.html
[root@server1 ~]# restorecon -v /srv/web2/index.html
Relabeled /srv/web2/index.html from unconfined_u:object_r:httpd_sys_content_t:s0 to unconfined_u:object_r:var_t:s0`} />
        <p className="small">
          <code>chcon</code> a funcționat imediat, dar <code>restorecon</code> a adus eticheta înapoi la valoarea implicită a căii (<code>var_t</code>), pentru că nu exista nicio regulă pentru <code>/srv/web2</code>. Exact capcana pe care o evită <code>semanage fcontext</code>.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Eticheta reală:</b> <code>ls -Z</code> / <code>ls -dZ</code>.</li>
            <li><b>Față de cea implicită:</b> <code>matchpathcon -V CALE</code> → „verified”.</li>
            <li><b>Nimic de reparat:</b> <code>restorecon -nRv DIR</code> nu afișează „Would relabel”.</li>
            <li><b>Regula e salvată:</b> <code>sudo semanage fcontext -l -C</code> conține expresia ta.</li>
            <li><b>Test funcțional:</b> serviciul accesează fișierul (<code>curl http://localhost/…</code> pentru web) și <code>ausearch -m avc -ts recent</code> nu arată refuzări noi.</li>
            <li><b>Durabilitate:</b> după <code>sudo restorecon -Rv DIR</code>, <code>ls -Z</code> arată tot eticheta dorită.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <Table head={['Metodă', 'Persistă la reboot?', 'Supraviețuiește restorecon/relabel?']} rows={[
            [<><code>semanage fcontext -a …</code> + <code>restorecon</code></>, 'da', 'da (regula e în politică)'],
            [<code>chcon -t …</code>, 'da (eticheta e pe disc)', 'NU: restorecon sau relabel o anulează'],
            [<><code>restorecon</code> pe cale standard</>, 'da', 'da (se aplică politica)'],
            [<code>touch /.autorelabel</code>, 'la reboot reetichetează tot', 'da, după politică'],
          ]} />
          <p>
            Confirmare manuală: reboot, apoi <code>ls -Z</code> și <code>matchpathcon -V</code>; ca test de durabilitate, <code>restorecon -Rv</code> nu trebuie să schimbe nimic.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Am adăugat regula, dar ls -Z nu s-a schimbat', 'lipsește restorecon', <><code>semanage fcontext -l -C</code> arată regula</>, <><code>restorecon -Rv DIR</code></>],
          ['restorecon nu schimbă nimic', 'regula nu se potrivește sau eticheta e deja corectă', <><code>matchpathcon CALE</code></>, <>verifică regex-ul (<code>(/.*)?</code>); folosește <code>-F</code> dacă tipul e „customizabil”</>],
          ['Doar directorul s-a schimbat, nu fișierele din el', 'regex fără (/.*)?', <><code>semanage fcontext -l -C</code></>, <>șterge (<code>-d</code>) și readaugă cu <code>"/dir(/.*)?"</code></>],
          [<>semanage: ValueError: File context for … already defined</>, 'regula există deja', <code>semanage fcontext -l -C</code>, <>folosește <code>-m</code> în loc de <code>-a</code></>],
          ['Eticheta s-a pierdut după un relabel', 'ai folosit chcon', 'regula lipsește din lista locală', <><code>semanage fcontext -a …</code> + <code>restorecon</code></>],
          ['semanage: command not found', 'lipsește pachetul', <code>rpm -q policycoreutils-python-utils</code>, <code>sudo dnf install policycoreutils-python-utils</code>],
          ['Serviciul tot nu citește fișierul', 'alt strat: boolean, port, drepturi DAC, firewall', <><code>ausearch -m avc -ts recent</code>, <code>ls -l</code></>, 'L10.6–L10.8, L1.8'],
          ['restorecon e lent pe /', 'recursiv pe tot sistemul', '-', <>folosește <code>-e</code> pentru excluderi sau <code>-x</code>; rulează pe subarbori</>],
          ['Utilizatorul din context rămâne neschimbat (unconfined_u)', 'restorecon schimbă doar tipul', '-', 'normal; nu cere -F decât dacă ai un motiv'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești <code>chcon</code> și crezi că e persistent.</>,
          <>Rulezi <code>semanage fcontext -a</code> și uiți <code>restorecon -R</code>.</>,
          <>Uiți <code>(/.*)?</code> în expresia regulată și etichetezi doar directorul.</>,
          <>Uiți ghilimelele în jurul expresiei (shell-ul interpretează parantezele).</>,
          <>Folosești <code>-a</code> pe o regulă existentă (eroare): folosește <code>-m</code>.</>,
          <>Rulezi <code>restorecon</code> pe fișierul greșit (de exemplu fără <code>-R</code> pe un director).</>,
          <>Dezactivezi SELinux în loc să repari eticheta.</>,
          <>Dai <code>chmod 777</code> când problema este eticheta.</>,
          <>Crezi că <code>restorecon -v</code> fără output înseamnă eroare: înseamnă că totul este deja corect.</>,
          <>Nu verifici cu <code>ls -Z</code>/<code>matchpathcon -V</code> după reparație.</>,
          <>Ceri <code>restorecon</code> pe <code>/</code> fără motiv: este lent și poate afecta alte setări.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: file_contexts, precedența regulilor, customizable_types, fixfiles/setfiles, relabel la boot">
        <p>
          <b>Fișierele de reguli:</b> <code>file_contexts</code> (politica), <code>file_contexts.local</code> (regulile tale), <code>file_contexts.homedirs</code> (home-uri). Ele sunt compilate pentru viteză (<code>*.bin</code>). <code>semanage fcontext -a</code> scrie în partea locală; la ștergere, regulile din politică rămân.
        </p>
        <p>
          <b>Precedența:</b> când mai multe reguli se potrivesc, cea cu <i>cea mai lungă parte literală</i> (mai specifică) câștigă, iar regulile locale au prioritate peste cele ale distribuției la specificitate egală (din cunoștințe, de confirmat). De aceea poți face o excepție mai fină: <code>"/srv/web/upload(/.*)?"</code> → <code>httpd_sys_rw_content_t</code> în interiorul unei reguli mai largi.
        </p>
        <p>
          <b>Tipuri customizabile:</b> unele tipuri (de exemplu <code>httpd_sys_rw_content_t</code>, enumerate în <code>/etc/selinux/{'{TYPE}'}/contexts/customizable_types</code>) sunt considerate „alese de administrator” și <code>restorecon</code> <b>nu le suprascrie</b> decât cu <code>-F</code> (<code>restorecon(8)</code>). Ca urmare, un <code>chcon</code> la un tip customizabil poate „supraviețui” unui <code>restorecon</code> simplu, dar tot nu e durabil la relabel complet.
        </p>
        <p>
          <b>setfiles / fixfiles / restorecon:</b> <code>setfiles</code> este programul de bază care aplică un fișier de reguli; <code>restorecon</code> este un setfiles preconfigurat pentru politica activă; <code>fixfiles</code> este un script-ul de nivel înalt (<code>fixfiles relabel</code>, <code>fixfiles -F onboot</code>). Pe examen, <code>restorecon</code> este suficient.
        </p>
        <p>
          <b>Relabel la boot:</b> existența <code>/.autorelabel</code> face ca scriptul de inițializare să ruleze un relabel complet, apoi să șteargă fișierul și să repornească. Nu întrerupe procesul.
        </p>
        <p>
          <b>Alternativa mount context:</b> pe sisteme de fișiere fără xattr (de exemplu NFS) sau pentru un volum întreg: <code>mount -o context="system_u:object_r:httpd_sys_content_t:s0" …</code> (în L6.3 și <code>fstab</code>): eticheta este aplicată la nivel de montare, iar <code>restorecon</code> nu o poate schimba.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_5: TopicModule = {
  id: 'L10.5',
  subtitle: 'restorecon (-v -R -n -F), semanage fcontext (-a -m -d -l -C, expresii regulate, -e), chcon (temporar), matchpathcon -V, /.autorelabel',
  studyTime: '≈105 min studiu + laborator',
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
  labs: [LAB_L10_5A, LAB_L10_5B],
  sources: [
    { kind: 'man', ref: 'restorecon(8), semanage-fcontext(8), matchpathcon(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'chcon(1) (404/429), fixfiles(8), setfiles(8), locația exactă a fișierelor file_contexts pe RHEL 10, precedența regulilor — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Using SELinux” (docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
