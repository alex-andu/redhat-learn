import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L6_5 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Când un utilizator primește <code>Permission denied</code>, nu ghici și nu pune <code>chmod 777</code>. Aplică o metodă: <b>(1)</b> cine este utilizatorul și din ce grupuri face parte (<code>id</code>); <b>(2)</b> ce fișier/director este implicat și ce permisiuni are <i>fiecare director din cale</i> (<code>namei -l</code>, <code>ls -ld</code>); <b>(3)</b> care dintre cele trei clase — proprietar, grup, alții — se aplică; <b>(4)</b> repari cu schimbarea minimă (<code>chmod</code>, <code>chown</code>/<code>chgrp</code>, bitul <b>setgid</b> pe directoare); <b>(5)</b> dacă permisiunile par corecte și tot nu merge, verifici montarea (<code>ro</code>, <code>noexec</code>, NFS, VFAT) și SELinux.
          </p>
          <p>Obiectivul oficial: <i>„Diagnose and correct file permission problems”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Linux este un sistem <b>multiutilizator</b>: pe același calculator lucrează simultan utilizatori, servicii și procese cu scopuri diferite. Fără reguli, un utilizator ar putea citi parolele altuia, un serviciu compromis ar putea șterge sistemul, iar o greșeală de tastare ar putea distruge date critice. <G id="permissions">Permisiunile</G> sunt acele reguli: pentru fiecare fișier și director, sistemul păstrează <b>cine este proprietarul</b>, <b>din ce grup face parte</b> și <b>ce poate face fiecare categorie</b> (citire, scriere, execuție). Acest model se numește <G id="dac">DAC</G> (Discretionary Access Control: proprietarul decide).
          </p>
          <p>
            L1.8 a prezentat modelul de bază (<G id="ugo">ugo</G>, <G id="rwx">rwx</G>, <G id="octal-mode">moduri octale</G>, <G id="chmod">chmod</G>, <G id="chown">chown</G>, <G id="umask">umask</G>). Această lecție este <b>despre diagnostic</b>: cum cauți metodic de ce o operație este refuzată și cum o repari fără să deschizi gaura de securitate. Pe examen, enunțurile sunt de tipul „utilizatorul <code>ana</code> nu poate scrie în <code>/srv/proiect</code>; remediază” sau „membrii grupului <code>dev</code> trebuie să poată colabora în <code>/srv/dev</code>”.
          </p>
          <Analogy>
            O clădire cu mai multe uși: o <b>cheie</b> (identitatea ta: UID și grupuri), mai multe <b>uși</b> pe drum (fiecare director din cale) și, la final, un <b>seif</b> (fișierul). Dacă oricare ușă este încuiată pentru tine, nu ajungi la seif, chiar dacă seiful este deschis. Diagnosticul înseamnă să mergi pe drum ușă cu ușă și să vezi unde te oprești.
          </Analogy>
          <h4>Cele patru straturi care pot refuza accesul</h4>
          <Table head={['Strat', 'Cine decide', 'Cum îl verifici', 'Lecție']} rows={[
            ['1. Permisiunile Unix (DAC)', 'proprietar/grup/alții pe fișier ȘI pe directoarele din cale', <><code>id</code>, <code>ls -l</code>, <code>namei -l</code></>, 'L1.8, aici'],
            ['2. Opțiunile de montare', 'sistemul de fișiere (ro, noexec, nosuid, uid=…)', <><code>findmnt -o TARGET,OPTIONS</code></>, 'L6.1'],
            ['3. Serverul NFS (dacă e rețea)', 'root_squash, UID, exporturi ro', <><code>ls -ldn</code>, <code>findmnt</code></>, 'L6.3'],
            ['4. SELinux (MAC)', 'politica de securitate, independent de rwx', <><code>ls -Z</code>, <code>getenforce</code>, <code>ausearch</code></>, 'C10'],
          ]} />
          <p>
            Regula practică: începe cu stratul 1 (cel mai frecvent), apoi coboară. Cele mai multe probleme sunt la stratul 1.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Cum alege kernelul clasa care se aplică</h4>
          <p>
            Când un proces încearcă să deschidă un fișier, kernelul compară <b>identitatea procesului</b> (UID efectiv, GID efectiv și grupurile suplimentare) cu proprietarul și grupul fișierului. Verificarea este <b>în ordine și se oprește la prima potrivire</b>:
          </p>
          <ol>
            <li>Dacă UID-ul procesului este <b>proprietarul</b> fișierului → se aplică <i>doar</i> permisiunile proprietarului (primele trei litere).</li>
            <li>Altfel, dacă oricare dintre grupurile procesului este <b>grupul</b> fișierului → se aplică <i>doar</i> permisiunile grupului (literele 4–6).</li>
            <li>Altfel → se aplică permisiunile <b>altora</b> (literele 7–9).</li>
          </ol>
          <Callout kind="warn" title="Clasele nu se cumulează">
            Dacă ești proprietarul unui fișier cu modul <code>---rwxrwx</code> (000 pentru proprietar, 777 pentru ceilalți), <b>tot nu poți citi fișierul</b>, deși „toți ceilalți pot”: kernelul te-a clasificat ca proprietar și s-a oprit acolo. Este o ciudățenie clasică, util de știut la diagnostic. Excepția: <code>root</code> (UID 0) ocolește verificările DAC; nu și SELinux, montările read-only sau atributele imutabile.
          </Callout>

          <h4>2. Ce înseamnă r, w, x pe un FIȘIER și pe un DIRECTOR</h4>
          <Table head={['Permisiune', 'Pe un fișier', 'Pe un director']} rows={[
            [<code>r</code>, 'citirea conținutului (cat, grep, cp)', 'listarea numelor din director (ls)'],
            [<code>w</code>, 'modificarea conținutului (>>, editor)', 'crearea, ștergerea și redenumirea intrărilor din director — contează pe DIRECTOR, nu pe fișier'],
            [<code>x</code>, 'rularea fișierului ca program/script', 'TRAVERSARE: intrarea în director (cd) și accesul la elementele lui după nume'],
          ]} />
          <p>
            Consecințe esențiale:
          </p>
          <ul>
            <li><b>Ștergerea unui fișier</b> cere <code>w</code> + <code>x</code> pe <b>directorul</b> care îl conține. Permisiunile fișierului nu contează (cu o excepție: <i>sticky bit</i>, mai jos).</li>
            <li><b>Directorul fără <code>x</code></b> te blochează complet: poți vedea numele (dacă ai <code>r</code>), dar nu poți citi, scrie sau ști ceva despre elemente.</li>
            <li><b>Directorul cu <code>x</code> dar fără <code>r</code></b>: nu poți face <code>ls</code>, dar poți accesa un fișier dacă îi cunoști numele.</li>
            <li><b>Calea întreagă contează:</b> pentru <code>/srv/proiect/raport.txt</code> ai nevoie de <code>x</code> pe <code>/</code>, <code>/srv</code> și <code>/srv/proiect</code>, apoi de <code>r</code> pe fișier. Un singur director din cale cu mod prea strict dă <code>Permission denied</code>, deși fișierul însuși este deschis.</li>
          </ul>

          <h4>3. Biți speciali: setuid, setgid, sticky</h4>
          <Table head={['Bit', 'Octal', 'Simbol în ls', 'Efect (chmod(1))']} rows={[
            [<G id="setuid">setuid</G>, '4000', <code>s</code>, 'pe un executabil: procesul rulează cu UID-ul proprietarului fișierului (ex. /usr/bin/passwd)'],
            [<G id="setgid-dir">setgid</G>, '2000', <><code>s</code> (în clasa grup)</>, 'pe un executabil: GID-ul grupului fișierului; pe un DIRECTOR: fișierele noi moștenesc grupul directorului (nu grupul principal al creatorului)'],
            [<G id="sticky-bit">sticky</G>, '1000', <code>t</code>, 'pe un director: nimeni neprivilegiat nu poate șterge/redenumi fișiere ale altuia, doar proprietarul fișierului/directorului (ex. /tmp)'],
          ]} />
          <p>
            <b>Setgid pe director</b> este soluția standard pentru directoarele de colaborare: toate fișierele create acolo ajung în grupul comun al echipei, deci colegii le pot edita (dacă modul permite scrierea pentru grup).
          </p>
          <p className="small">
            Din <code>chmod(1)</code>: <code>chmod</code> păstrează setuid/setgid ale unui director dacă nu le schimbi explicit; pentru a le șterge printr-un mod numeric ai nevoie de o formă ca <code>00755</code>, <code>-6000</code> sau <code>=755</code>.
          </p>

          <h4>4. Umask: de ce fișierele noi au exact permisiunile pe care le au</h4>
          <p>
            La crearea unui fișier, programul cere un mod de bază (666 pentru fișiere, 777 pentru directoare), iar <code>umask</code> <b>șterge</b> biții indicați: <code>umask 022</code> → fișiere 644, directoare 755. Un fișier creat de <code>ana</code> cu <code>umask 022</code> într-un director comun nu este scriibil de grup. Pentru colaborare folosești <code>umask 002</code> (fișiere 664, directoare 775) împreună cu setgid pe director.
          </p>

          <h4>5. Identitatea ta: grupuri și momentul în care se aplică</h4>
          <p>
            Grupurile unui proces se stabilesc <b>la autentificare</b>. Dacă adaugi un utilizator într-un grup nou (<code>usermod -aG dev ana</code>), sesiunile <b>deja deschise</b> ale lui <code>ana</code> nu văd noul grup până nu se reautentifică (sau folosește <code>newgrp dev</code>). Simptomul clasic: „am adăugat-o în grup și tot nu merge”. Diagnostic: <code>id</code> în acea sesiune nu afișează grupul.
          </p>

          <h4>6. Alte motive pentru care accesul eșuează, deși rwx este corect</h4>
          <ul>
            <li><b>Sistem de fișiere montat read-only</b> (<code>ro</code>): scrierea dă <code>Read-only file system</code>, nu <code>Permission denied</code>.</li>
            <li><b><code>noexec</code></b> pe montare: un script cu <code>x</code> nu pornește direct (<code>bash: ./s.sh: Permission denied</code>).</li>
            <li><b>VFAT</b>: permisiunile vin din opțiunile de montare (<code>uid</code>, <code>gid</code>, <code>fmask</code>, <code>dmask</code>); <code>chmod</code>/<code>chown</code> nu au efect (L6.1).</li>
            <li><b>NFS</b>: decide serverul pe baza UID-urilor; <code>root_squash</code> face ca root-ul clientului să fie „nobody” (L6.3).</li>
            <li><b>SELinux</b>: poate refuza chiar dacă rwx este perfect; o eroare în <code>/var/log/audit/audit.log</code> (mesaje AVC) o confirmă (C10).</li>
            <li><b>Atribute de sistem de fișiere</b> (<code>chattr +i</code> imutabil): chiar și root primește <code>Operation not permitted</code> (afișat cu <code>lsattr</code>).</li>
            <li><b>ACL</b> (în afara cursului): un „+” la finalul coloanei de permisiuni din <code>ls -l</code> (<code>-rw-r--r--+</code>) indică ACL-uri suplimentare; menționat doar ca să nu te surprindă.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Utilizatori și grupuri (C9):</b> <code>id</code>, <code>usermod -aG</code>, <code>groupadd</code>; identitatea este baza verificării.</li>
            <li><b>Sisteme de fișiere (L6.1):</b> XFS și ext4 stochează permisiunile; VFAT nu. Rădăcina unui sistem de fișiere nou aparține lui root.</li>
            <li><b>NFS și autofs (L6.3, L6.4):</b> permisiunile se evaluează pe server, după UID/GID; UID-urile trebuie să coincidă.</li>
            <li><b>SELinux (C10):</b> al doilea strat, independent. Când DAC este corect și accesul tot eșuează, <code>ls -Z</code> și <code>ausearch -m avc -ts recent</code> sunt următorii pași; remedierea (<code>restorecon</code>, <code>semanage fcontext</code>) este în C10.</li>
            <li><b>Servicii (L4.9):</b> serviciile rulează ca utilizatori de sistem (ex. <code>apache</code>); un serviciu care „nu poate citi” un fișier este tot o problemă de permisiuni, verificată cu aceeași metodă, folosind utilizatorul serviciului.</li>
            <li><b>sudo (C9):</b> <code>sudo -u utilizator comandă</code> te lasă să testezi accesul <i>ca acel utilizator</i>, o tehnică de diagnostic puternică.</li>
            <li><b>Fișiere text, scripturi (C3):</b> un script fără <code>x</code> nu pornește direct (dar <code>bash script.sh</code> merge dacă ai <code>r</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Un utilizator raportează „Permission denied”: aplici metoda, nu <code>chmod 777</code>.</li>
            <li>Un serviciu nu poate citi/scrie un director de date (ex. un director nou creat de root).</li>
            <li>Un director de proiect trebuie să fie scriibil de o echipă, nu de toată lumea (setgid + grup).</li>
            <li>Un director comun (<code>/srv/depozit</code>) unde fiecare poate crea, dar nu poate șterge fișierele altora (sticky).</li>
            <li>Examen: „fix the permissions so that members of group <code>dev</code> can read and write files in <code>/srv/dev</code>, and new files inherit the group”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test, cu utilizatori de test. Output-urile sunt <b>Ilustrative</b> (nerulate pe RHEL 10). Pentru a crea utilizatori și grupuri vezi C9; aici sunt folosite doar comenzile minime, explicate.
        </Callout>

        <h4>1. Pasul 1 — Cine ești și ce grupuri ai: <code>id</code>, <code>groups</code>, <code>whoami</code></h4>
        <CodeBlock title="comenzi" code={`id\nid ana\ngroups ana\nwhoami\nsudo -u ana id`} explain={[
          ['id', 'afișează UID, GID-ul principal și toate grupurile utilizatorului curent: uid=1001(ana) gid=1001(ana) groups=1001(ana),1005(dev).'],
          ['id ana', 'aceleași informații pentru alt utilizator (se citesc din /etc/passwd și /etc/group; nu reflectă sesiunile deja deschise).'],
          ['groups ana', 'doar lista grupurilor.'],
          ['whoami', 'numele utilizatorului curent.'],
          ['sudo -u ana id', '-u = rulează comanda ca utilizatorul ana; arată grupurile cu care rulează efectiv un proces nou.'],
        ]} />

        <h4>2. Pasul 2 — Ce permisiuni are fișierul și fiecare director din cale: <code>ls -ld</code>, <code>namei -l</code>, <code>stat</code></h4>
        <CodeBlock title="comenzi" code={`ls -l /srv/proiect\nls -ld /srv/proiect\nls -ldn /srv/proiect\nnamei -l /srv/proiect/raport.txt\nstat /srv/proiect/raport.txt\nstat -c '%A %a %U %G %n' /srv/proiect /srv/proiect/raport.txt`} explain={[
          ['ls -l', 'listă lungă: tip și permisiuni (10 caractere), număr de legături, proprietar, grup, dimensiune, dată, nume.'],
          ['ls -ld DIRECTOR', '-d = listează directorul ÎNSUȘI, nu conținutul lui; esențial pentru a vedea permisiunile directorului.'],
          ['ls -ldn', '-n = numeric: UID și GID în loc de nume; arată cazul în care un UID nu corespunde niciunui utilizator local (tipic pe NFS).'],
          ['namei -l CALE', 'descompune calea și afișează, pentru FIECARE componentă, tipul, modul, proprietarul și grupul (-l = -m -o -v, namei(1)); găsește rapid directorul din cale care te blochează.'],
          ['stat', 'informații complete (mod în octal și simbolic, proprietar, timpi, inode).'],
          ['stat -c FORMAT', '-c = format personalizat: %A mod simbolic, %a mod octal, %U proprietar, %G grup, %n nume.'],
        ]} />

        <h4>3. Pasul 3 — Repară: <code>chmod</code></h4>
        <CodeBlock title="comenzi" code={`chmod u+x script.sh\nchmod g+w raport.txt\nchmod o-rwx secret.txt\nchmod 640 raport.txt\nchmod -R g+rwX /srv/proiect\nchmod 755 /srv/proiect\nchmod a+x /srv\nchmod g+s /srv/proiect\nchmod 2775 /srv/proiect\nchmod +t /srv/depozit\nchmod 1777 /srv/depozit`} explain={[
          ['chmod u+x', 'simbolic: u=proprietar, g=grup, o=alții, a=toți; + adaugă, - scoate, = stabilește exact; r, w, x, X, s, t.'],
          ['g+w', 'adaugă scrierea pentru grup, fără a atinge celelalte permisiuni.'],
          ['o-rwx', 'scoate orice permisiune pentru „alții”.'],
          ['640', 'octal: 6 (rw-) proprietar, 4 (r--) grup, 0 (---) alții.'],
          ['-R g+rwX', 'recursiv; X = execuție DOAR pentru directoare (și fișiere deja executabile): practic pentru directoare mari, ca să nu faci toate fișierele executabile (chmod(1)).'],
          ['chmod 755 /srv/proiect', 'directorul devine traversabil și listabil de toți.'],
          ['g+s / 2775', 'setgid pe director: 2 în față = setgid; 775 = rwxrwxr-x; fișierele noi moștenesc grupul directorului.'],
          ['+t / 1777', 'sticky pe director: 1 în față = sticky; 777 = toți pot crea, dar doar proprietarul poate șterge propriile fișiere.'],
        ]} />

        <h4>4. Pasul 3 (variantă) — Repară: <code>chown</code>, <code>chgrp</code></h4>
        <CodeBlock title="comenzi" code={`sudo chown ana /srv/proiect/raport.txt\nsudo chown ana:dev /srv/proiect/raport.txt\nsudo chown :dev /srv/proiect\nsudo chown -R ana:dev /srv/proiect\nsudo chgrp -R dev /srv/proiect\nsudo chown -R --from=root ana /srv/proiect`} explain={[
          ['chown UTILIZATOR FIȘIER', 'schimbă proprietarul; doar root poate (sau cu sudo).'],
          ['ana:dev', 'proprietar:grup într-o singură comandă.'],
          [':dev', 'doar grupul (utilizatorul lipsește înaintea „:”).'],
          ['-R', 'recursiv: toate fișierele și subdirectoarele.'],
          ['chgrp -R dev', 'schimbă doar grupul (proprietarul poate schimba grupul spre unul din care face parte).'],
          ['--from=root', 'schimbă doar dacă proprietarul actual este root (opțiune GNU; util la reparații selective).'],
        ]} />

        <h4>5. Dacă nu era DAC: montare, atribute, SELinux</h4>
        <CodeBlock title="comenzi" code={`findmnt -o TARGET,SOURCE,FSTYPE,OPTIONS /srv\nlsattr -d /srv/proiect/raport.txt\nsudo chattr -i /srv/proiect/raport.txt\nls -Z /srv/proiect\ngetenforce\nsudo ausearch -m avc -ts recent`} explain={[
          ['findmnt -o …', 'opțiunile efective ale montării pentru calea ta (ro, noexec, nosuid, uid=…).'],
          ['lsattr -d', 'afișează atribute de sistem de fișiere; „i” = imutabil (nici root nu poate modifica/șterge).'],
          ['chattr -i', 'scoate atributul imutabil (root).'],
          ['ls -Z', 'afișează contextul SELinux al fiecărui element (user:role:type:level).'],
          ['getenforce', 'Enforcing / Permissive / Disabled.'],
          ['ausearch -m avc -ts recent', 'caută în auditul sistemului refuzuri SELinux (AVC) recente. Remedierea este în C10.'],
        ]} />

        <h4>6. Umask și colaborare</h4>
        <CodeBlock title="comenzi" code={`umask\numask 002\ntouch /srv/proiect/nou.txt\nls -l /srv/proiect/nou.txt\nstat -c '%A %U:%G' /srv/proiect/nou.txt`} explain={[
          ['umask', 'afișează masca curentă (octal; 0022 este uzual pentru utilizatori obișnuiți — valoarea efectivă pe RHEL 10 de confirmat).'],
          ['umask 002', 'setează masca pentru shell-ul curent: fișiere 664, directoare 775.'],
          ['stat -c', 'arată mod, proprietar și grup: confirmi moștenirea grupului prin setgid.'],
        ]} />

        <h4>7. Rețeta completă a colaborării: director de echipă</h4>
        <CodeBlock title="comenzi" code={`sudo groupadd dev\nsudo usermod -aG dev ana\nsudo usermod -aG dev bogdan\nsudo mkdir -p /srv/dev\nsudo chgrp dev /srv/dev\nsudo chmod 2775 /srv/dev\nls -ld /srv/dev`} explain={[
          ['groupadd dev', 'creează grupul dev (C9).'],
          ['usermod -aG dev ana', '-a = append (adaugă fără a scoate din alte grupuri), -G = grupuri suplimentare. FĂRĂ -a, ai înlocui toate grupurile suplimentare.'],
          ['mkdir -p /srv/dev', 'creează directorul.'],
          ['chgrp dev /srv/dev', 'grupul directorului devine dev.'],
          ['chmod 2775 /srv/dev', 'rwxrwsr-x: proprietar și grup pot scrie; setgid face ca fișierele noi să rămână în grupul dev.'],
          ['ls -ld', 'trebuie să vezi drwxrwsr-x și grupul dev.'],
        ]} />
        <p className="small">După <code>usermod -aG</code>, <code>ana</code> trebuie să se reautentifice (sau <code>newgrp dev</code>) ca noul grup să se aplice sesiunii ei.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="id" kind="session" label="illustrative" code={`[ana@server1 ~]$ id\nuid=1001(ana) gid=1001(ana) groups=1001(ana),1005(dev) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023`} />
        <p className="small">
          <code>uid=1001(ana)</code> = identitatea; <code>gid</code> = grupul principal; <code>groups=…</code> = toate grupurile (aici și <code>dev</code>). Ultimul câmp, <code>context</code>, este contextul SELinux al sesiunii (apare când SELinux este activ). Verificarea de acces folosește aceste valori.
        </p>
        <CodeBlock title="namei -l" kind="session" label="illustrative" code={`[ana@server1 ~]$ namei -l /srv/proiect/raport.txt\nf: /srv/proiect/raport.txt\ndrwxr-xr-x root  root  /\ndrwxr-xr-x root  root  srv\ndrwx------ bogdan bogdan proiect\n-rw-r--r-- bogdan bogdan raport.txt`} />
        <p className="small">
          Prima linie (<code>f:</code>) este calea analizată. Apoi, pentru fiecare componentă: modul, proprietarul, grupul și numele. <b>Vinovatul este <code>proiect</code></b>: <code>drwx------</code> lasă accesul doar proprietarului <code>bogdan</code>; pentru <code>ana</code> (clasa „alții”, <code>---</code>) lipsește <code>x</code>, deci nu poate nici măcar intra. Fișierul în sine (644) este deschis, dar nu ajungi la el. Soluția minimă depinde de enunț: <code>chmod g+rx</code> + grup comun, sau <code>o+x</code>.
        </p>
        <CodeBlock title="mesaje tipice" kind="session" label="illustrative" code={`$ cat /srv/proiect/raport.txt\ncat: /srv/proiect/raport.txt: Permission denied\n$ ./script.sh\nbash: ./script.sh: Permission denied\n$ rm /tmp/fisier_altcuiva\nrm: cannot remove '/tmp/fisier_altcuiva': Operation not permitted\n$ chmod 600 /etc/hosts\nchmod: changing permissions of '/etc/hosts': Operation not permitted\n$ touch /mnt/ro/x\ntouch: cannot touch '/mnt/ro/x': Read-only file system`} />
        <p className="small">
          <code>Permission denied</code> = ai fost refuzat de DAC (sau noexec/SELinux). <code>Operation not permitted</code> = operația cere privilegii pe care nu le ai (a schimba modul unui fișier care nu e al tău; a șterge un fișier al altuia într-un director cu sticky bit; atribute imutabile). <code>Read-only file system</code> = problema este montarea, nu permisiunile. Formulările exacte sunt cele ale utilitarelor GNU; pot varia între versiuni.
        </p>
        <CodeBlock title="director cu setgid" kind="session" label="illustrative" code={`[root@server1 ~]# ls -ld /srv/dev\ndrwxrwsr-x. 2 root dev 6 Nov 16 10:00 /srv/dev\n[ana@server1 ~]$ touch /srv/dev/a.txt\n[ana@server1 ~]$ ls -l /srv/dev/a.txt\n-rw-rw-r--. 1 ana dev 0 Nov 16 10:01 /srv/dev/a.txt`} />
        <p className="small">
          <code>drwxrwsr-x</code>: <code>s</code> în locul lui <code>x</code> pentru grup = setgid activ (cu <code>x</code>; cu <code>S</code> majusculă ar fi setgid <i>fără</i> x). Fișierul creat de <code>ana</code> are grupul <code>dev</code>, nu grupul ei principal <code>ana</code>: moștenit de la director. Punctul de după mod indică un context SELinux (nu un ACL). Fișierul are 664 pentru că <code>umask</code> era 002; cu 022 grupul nu ar fi putut scrie.
        </p>
        <CodeBlock title="sticky bit în /tmp" kind="session" label="illustrative" code={`[ana@server1 ~]$ ls -ld /tmp\ndrwxrwxrwt. 12 root root 4096 Nov 16 10:05 /tmp`} />
        <p className="small">
          <code>t</code> în ultima poziție = sticky bit; <code>rwx</code> pentru toți permite oricui să creeze fișiere, dar doar proprietarul fișierului (sau al directorului, sau root) le poate șterge.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Simulezi utilizatorul:</b> <code>sudo -u ana cat /srv/proiect/raport.txt</code> sau <code>su - ana</code> (reautentificat, deci cu grupurile noi).</li>
            <li><b>Calea întreagă:</b> <code>namei -l CALEA</code> nu mai arată nicio componentă fără <code>x</code> pentru clasa ta.</li>
            <li><b>Moștenirea grupului:</b> creezi un fișier de test în director și <code>stat -c '%A %U:%G' fisier</code> arată grupul așteptat.</li>
            <li><b>Principiul minimului:</b> nu ai folosit <code>777</code>; verifici cu <code>find /srv/proiect -perm -o+w</code> că nu a rămas nimic scriibil de „alții” fără motiv.</li>
            <li><b>Persistență:</b> permisiunile sunt scrise în inode și persistă după reboot (vezi mai jos).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <code>chmod</code> și <code>chown</code> modifică <b>inode-ul pe disc</b>: schimbările persistă după reboot. Excepții importante: <b>(1)</b> pe VFAT permisiunile vin din opțiunile de montare, deci persistența cere linia corectă în <code>/etc/fstab</code> (L6.1); <b>(2)</b> pe NFS le gestionează serverul; <b>(3)</b> <code>umask</code> setat într-un terminal se pierde la ieșire: pentru persistență intră în <code>~/.bashrc</code> sau în configurarea sistemului (L1.8); <b>(4)</b> în directoare create temporar (<code>/tmp</code>, <code>/run</code>) regulile sunt recreate de systemd la boot (<code>systemd-tmpfiles</code>), deci modificările manuale pot dispărea; pentru ele se folosește o regulă tmpfiles (în afara cursului).
          </p>
          <p>
            Confirmare manuală după reboot: <code>ls -ld</code> și <code>stat</code> pe directoarele modificate, apoi test cu <code>sudo -u utilizator …</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting (metoda pe scenarii)">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>cat: …: Permission denied</code>, 'lipsește r pe fișier pentru clasa ta, sau x pe un director din cale', <><code>id</code>, <code>namei -l CALE</code></>, <>acordă minim: <code>chmod g+r</code> / <code>chmod o+x DIR</code>, sau grup comun</>],
          [<code>cd: …: Permission denied</code>, 'lipsește x pe director', <code>ls -ld DIR</code>, <><code>chmod g+x</code> / <code>o+x</code> (nu uita directorul părinte)</>],
          [<><code>ls</code> merge, dar <code>cat</code> pe fișier nu</>, 'fișierul fără r (directorul are r+x)', <code>ls -l</code>, <><code>chmod u+r</code> / <code>g+r</code></>],
          [<><code>touch</code>/<code>mkdir</code> refuzat în director</>, 'lipsește w sau x pe DIRECTOR', <code>ls -ld DIR</code>, <>acordă <code>w</code>+<code>x</code> pe director, grup sau proprietar</>],
          [<><code>rm</code>: <code>Operation not permitted</code> în /tmp sau director comun</>, 'sticky bit; fișierul nu e al tău', <code>ls -ld DIR</code>, 'cere proprietarului/root; nu scoate sticky fără motiv'],
          [<code>bash: ./s.sh: Permission denied</code>, 'lipsește x pe script, sau montare noexec', <><code>ls -l</code>, <code>findmnt -o OPTIONS</code></>, <><code>chmod u+x</code> sau <code>bash s.sh</code>; mută pe un sistem fără noexec</>],
          ['Fișiere noi create în grupul greșit', 'directorul nu are setgid', <code>ls -ld DIR</code>, <><code>chmod g+s DIR</code> + <code>chgrp</code></>],
          ['Colegii nu pot edita fișierul meu', 'umask 022 → grupul fără w', <><code>umask</code>, <code>ls -l</code></>, <><code>umask 002</code> + <code>chmod g+w</code></>],
          ['Am adăugat utilizatorul în grup și tot nu merge', 'sesiunea veche nu are noul grup', <><code>id</code> (în sesiunea lui)</>, 'logout/login sau <code>newgrp dev</code>'],
          [<><code>chmod</code>/<code>chown</code>: <code>Operation not permitted</code></>, 'nu ești proprietar / nu ești root; sau VFAT/NFS/imutabil', <><code>ls -l</code>, <code>lsattr</code>, <code>findmnt</code></>, <><code>sudo</code>; pe VFAT remontează cu <code>uid=</code>/<code>fmask=</code>; <code>chattr -i</code></>],
          [<code>Read-only file system</code>, 'montare ro sau sistem remontat ro după erori', <code>findmnt -o OPTIONS</code>, <><code>mount -o remount,rw</code> (după ce rezolvi cauza)</>],
          ['DAC corect, dar tot refuzat (serviciu, director nou în loc nestandard)', 'SELinux', <><code>ls -Z</code>, <code>getenforce</code>, <code>ausearch -m avc -ts recent</code></>, <>context corect (C10: <code>restorecon</code>)</>],
          ['Pe NFS: root primește Permission denied', 'root_squash', <><code>ls -ldn</code>, <code>id</code></>, 'corectează UID/permisiuni pe server (L6.3)'],
        ]} />
        <Callout kind="tip" title="Metoda în 6 pași (de ținut minte)">
          1) <code>id</code> — cine sunt? 2) <code>namei -l CALE</code> — unde mă opresc? 3) clasa (proprietar/grup/alții) — ce permisiuni mi se aplică? 4) schimbare minimă: <code>chmod</code>/<code>chgrp</code>/<code>chown</code>/setgid. 5) retestează <i>ca utilizatorul</i> (<code>sudo -u</code>). 6) dacă tot nu, <code>findmnt</code> și <code>ls -Z</code>.
        </Callout>
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Pui <code>chmod 777</code> „ca să meargă”: rezolvă simptomul, dar deschide totul. Pe examen, soluția trebuie să fie minimă și țintită.</>,
          <>Verifici doar fișierul și uiți directoarele din cale (<code>namei -l</code> le arată pe toate).</>,
          <>Confunzi <code>ls -l director</code> (arată conținutul) cu <code>ls -ld director</code> (arată directorul).</>,
          <>Uiți că ștergerea unui fișier depinde de permisiunile <b>directorului</b>.</>,
          <>Crezi că grupul nou se aplică imediat sesiunii deschise.</>,
          <>Folosești <code>usermod -G</code> fără <code>-a</code> și ștergi alte grupuri suplimentare.</>,
          <>Faci recursiv <code>chmod -R 775</code> și faci toate fișierele executabile; folosește <code>X</code>.</>,
          <>Uiți setgid pe directorul de colaborare și fișierele noi rămân în grupul principal al creatorului.</>,
          <>Încerci <code>chmod</code>/<code>chown</code> pe VFAT sau pe un export NFS cu <code>root_squash</code>.</>,
          <>Dai vina pe permisiuni când problema este SELinux sau o montare <code>ro</code>/<code>noexec</code>.</>,
          <>Testezi ca root: root ocolește DAC, deci „merge” fără să dovedească nimic. Testează ca utilizatorul vizat.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ACL, capabilități, atribute și de ce root nu este „omnipotent”">
        <p>
          <b>ACL (Access Control Lists):</b> permit reguli pe utilizatori/grupuri individuale, dincolo de cele trei clase (<code>setfacl</code>, <code>getfacl</code>). Un „+” după modul din <code>ls -l</code> le semnalează. Sunt în afara cursului (obiectivul EX200 pentru RHEL 10 nu le listează); le menționăm doar ca să recunoști prezența lor.
        </p>
        <p>
          <b>Capabilități Linux:</b> privilegiile lui root sunt împărțite în capabilități (ex. <code>CAP_DAC_OVERRIDE</code> = ocolirea verificărilor DAC). Un proces root dintr-un container poate să nu o aibă, și atunci primește <code>Permission denied</code> chiar ca root.
        </p>
        <p>
          <b>De ce <code>root</code> primește uneori „Permission denied”:</b> (1) SELinux (MAC) se aplică și lui root; (2) montări <code>ro</code>/<code>noexec</code>; (3) atribute imutabile (<code>chattr +i</code>); (4) NFS cu <code>root_squash</code>; (5) execuția cere cel puțin un bit <code>x</code> pe fișier, chiar pentru root. Aceste cazuri te învață că „root = poate orice” este o simplificare.
        </p>
        <p>
          <b>Pe directoare, bitul setuid nu are efect pe Linux</b> (cunoștință generală, neverificată în sursă; el este relevant pe executabile), în timp ce setgid și sticky au efect pe directoare (<code>chmod(1)</code>).
        </p>
        <p>
          <b>Calculul modului octal rapid:</b> r=4, w=2, x=1; se adună pe clasă. <code>rwxr-x---</code> = 750; <code>rw-rw-r--</code> = 664; <code>rwxrwsr-x</code> = 2775 (setgid + 775).
        </p>
        <p>
          <b>Reguli de aur pentru reparații:</b> acordă cel mai mic drept care rezolvă; preferă grupuri în loc de „alții”; nu atinge permisiunile directoarelor de sistem (<code>/etc</code>, <code>/usr</code>) fără motiv; documentează schimbarea.
        </p>
      </DeepDive>
    </>
  );
}

export const L6_5: TopicModule = {
  id: 'L6.5',
  subtitle: 'id, ls -ld, namei -l, stat, chmod, chown/chgrp, setgid pe directoare, umask, diagnostic de montare și SELinux',
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
  labs: [LAB_L6_5],
  sources: [
    { kind: 'man', ref: 'chmod(1), namei(1), mount(8) (opțiuni vfat), exports(5) (root_squash) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'id(1), ls(1), stat(1), chown(1), chgrp(1), umask (bash), usermod(8), groupadd(8), lsattr(1), chattr(1), ausearch(8) — din cunoștințe, nerecitite' },
    { kind: 'doc', ref: 'RHEL 10 — ghiduri pe permisiuni de fișiere / SELinux (secure-getting_started_with_selinux); docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
