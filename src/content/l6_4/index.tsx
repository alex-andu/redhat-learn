import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L6_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="autofs">autofs</G> montează un sistem de fișiere <b>doar când cineva îl accesează</b> și îl demontează singur după o perioadă de inactivitate. Configurarea are trei piese: <b>harta principală</b> (<G id="auto-master">master map</G>) <code>/etc/auto.master</code> (sau un fișier <code>.autofs</code> în <code>/etc/auto.master.d/</code>) care spune „sub directorul X folosește harta Y”; <b>harta propriu-zisă</b> (<code>/etc/auto.&lt;nume&gt;</code>) cu perechile cheie → sursă; și serviciul <code>autofs</code> (<code>systemctl enable --now autofs</code>).
          </p>
          <p>Obiectivul oficial: <i>„Configure autofs”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            În L6.3 ai montat NFS cu <code>mount</code> și <code>/etc/fstab</code>. Această metodă are două probleme când ai multe montări de rețea:
          </p>
          <ul>
            <li><b>Resurse și fragilitate:</b> toate exporturile sunt montate tot timpul, chiar dacă nu le folosește nimeni. Dacă un server NFS este oprit la boot, sistemul poate încetini sau să intre în emergency mode.</li>
            <li><b>Scalare:</b> la 500 de utilizatori, ai 500 de linii în fstab pentru directoarele home, de ținut la zi pe fiecare client.</li>
          </ul>
          <p>
            autofs rezolvă ambele: montează <b>la cerere</b> și demontează <b>automat</b>. Într-o hartă poți descrie sute de montări sau chiar un singur tipar („oricare ar fi numele utilizatorului, montează <code>server:/home/NUME</code>”).
          </p>
          <Analogy>
            fstab este un <b>telefon mereu conectat</b> la un număr: linia e ocupată tot timpul, chiar și când nu vorbești. autofs este o <b>agendă cu apelare la cerere</b>: sună numărul când ai ceva de spus și închide singur după ce taci o vreme.
          </Analogy>
          <h4>Montare cu fstab versus autofs</h4>
          <Table head={['', '/etc/fstab', 'autofs']} rows={[
            ['Când se montează', 'la boot (sau mount -a)', 'la primul acces la director'],
            ['Când se demontează', 'la oprire sau manual', 'automat, după timeout de inactivitate'],
            ['Dacă serverul e oprit', 'poate întârzia boot-ul', 'doar accesul la acel director eșuează/așteaptă'],
            ['Multe montări similare', 'câte o linie fiecare', 'o regulă wildcard pentru toate'],
            ['Configurare', 'o linie pe montare', 'master map + hărți + serviciu'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Directorul „păzit” și declanșarea montării</h4>
          <p>
            Când pornește serviciul <code>autofs</code> (daemonul <code>automount</code>), pentru fiecare intrare din master map el montează la punctul respectiv un „sistem de fișiere de tip autofs” — o <i>capcană</i> în kernel. Directorul pare gol sau conține doar numele cunoscute, dar nu are conținut real. Când un proces încearcă să intre (<code>ls /shares/data</code>, <code>cd /shares/data</code>), kernelul <b>suspendă</b> accesul și cere daemonului: „montează aici <code>data</code>”. Daemonul caută cheia <code>data</code> în hartă, execută montarea (de exemplu NFS), apoi accesul continuă transparent. Procesul nu observă decât o mică întârziere.
          </p>
          <ol>
            <li>Master map-ul spune: sub <code>/shares</code>, harta este <code>/etc/auto.shares</code>.</li>
            <li>Accesezi <code>/shares/data</code> → kernelul întreabă daemonul.</li>
            <li>Daemonul găsește în <code>auto.shares</code> linia <code>data  -rw,sync  server1.example.com:/exports/data</code>.</li>
            <li>Montează <code>server1.example.com:/exports/data</code> la <code>/shares/data</code> (creează el directorul).</li>
            <li>La inactivitate (<i>timeout</i>), îl demontează și șterge directorul.</li>
          </ol>

          <h4>2. Master map: unde și cum</h4>
          <p>
            Formatul unei linii (din <code>auto.master(5)</code>): <code>mount-point [map-type[,format]:]map [options]</code>. Câmpurile sunt separate prin spații sau tab-uri; liniile care încep cu <code>#</code> sunt comentarii. Exemple:
          </p>
          <Table head={['Linie în master map', 'Înțeles']} rows={[
            [<code>/shares  /etc/auto.shares</code>, 'sub /shares, harta indirectă din fișierul /etc/auto.shares'],
            [<code>/shares  /etc/auto.shares  --timeout=60</code>, 'la fel, cu demontare după 60 s de inactivitate (opțiunea --timeout/-t din automount(8); sintaxa în master map din cunoștințe, necitită)'],
            [<code>/-  /etc/auto.direct</code>, '/- = hartă DIRECTĂ: cheile din fișier sunt căi absolute complete'],
            [<code>+dir:/etc/auto.master.d</code>, 'include fișierele din director; trebuie să se termine în .autofs (auto.master(5))'],
          ]} />
          <Callout kind="info" title="Fișiere separate: /etc/auto.master.d/*.autofs">
            În loc să edităm <code>/etc/auto.master</code>, creăm un fișier propriu, de exemplu <code>/etc/auto.master.d/shares.autofs</code>, care conține <b>doar linia ta</b>. Conform <code>auto.master(5)</code>, fișierele din acel director <b>trebuie să se termine în <code>.autofs</code></b>; cele fără acest sufix, sau care încep cu punct, sunt <b>ignorate</b>. Aceasta este o capcană clasică: ai creat <code>shares.conf</code> și nu se întâmplă nimic.
          </Callout>

          <h4>3. Hartă indirectă: cheia este un subdirector</h4>
          <p>
            La o hartă <b>indirectă</b>, directorul din master map (<code>/shares</code>) este „părintele”, iar fiecare cheie din hartă este un <b>subdirector</b> al lui. Formatul liniei (autofs(5)): <code>cheie [-opțiuni] locație</code>.
          </p>
          <CodeBlock title="/etc/auto.shares (hartă indirectă, Ilustrativ)" kind="config" code={`# cheie   -opțiuni       locație\ndata      -rw,sync       server1.example.com:/exports/data\nreadme    -ro            server1.example.com:/exports/ro`} explain={[
            ['data / readme', 'cheile: subdirectoarele care vor exista sub /shares (/shares/data, /shares/readme).'],
            ['-rw,sync / -ro', 'opțiuni de montare, precedate de „-”, separate prin virgulă ca la mount(8).'],
            ['server1.example.com:/exports/data', 'locația: server:cale-exportată (ca la mount -t nfs).'],
          ]} />

          <h4>4. Hartă directă: cheia este calea completă</h4>
          <p>
            La o hartă <b>directă</b>, master map-ul folosește punctul special <code>/-</code>, iar cheile din hartă sunt <b>căi absolute</b> (autofs(5)). Folosești hărți directe când vrei montări în locuri „oficiale” (<code>/mnt/backup</code>, <code>/opt/app</code>) și nu într-un director dedicat.
          </p>
          <CodeBlock title="/etc/auto.direct (Ilustrativ)" kind="config" code={`/mnt/backup  -rw,sync  server1.example.com:/exports/backup`} />
          <Table head={['', 'Indirectă', 'Directă']} rows={[
            ['Master map', <code>/shares /etc/auto.shares</code>, <code>/- /etc/auto.direct</code>],
            ['Cheia din hartă', 'nume simplu (data)', 'cale absolută (/mnt/backup)'],
            ['Rezultat', '/shares/data', '/mnt/backup'],
            ['Modificări de hartă', 'preluate la accesul următor', 'cer reload al daemonului (autofs(5): HUP)'],
          ]} />

          <h4>5. Wildcard: o singură linie pentru multe montări</h4>
          <p>
            Cheia <code>*</code> este un <b>wildcard</b>, iar <code>&amp;</code> se înlocuiește cu cheia cerută (autofs(5)). Aceasta este soluția pentru directoarele home pe NFS:
          </p>
          <CodeBlock title="/etc/auto.home (Ilustrativ)" kind="config" code={`*  -rw,sync  server1.example.com:/exports/home/&`} explain={[
            ['*', 'orice nume cerut (de exemplu ana).'],
            ['&', 'se înlocuiește cu numele cerut: pentru „ana” rezultă server1.example.com:/exports/home/ana. Exemplu din autofs(5): „* server:/export/home/&”.'],
          ]} />
          <p>
            Cu master map-ul <code>/home/remote  /etc/auto.home</code>, accesarea lui <code>/home/remote/ana</code> montează automat directorul <code>ana</code> de pe server, iar <code>/home/remote/bogdan</code> pe cel al lui Bogdan, fără ca vreun nume să fie scris în hartă.
          </p>

          <h4>6. Timeout, browse și montări locale</h4>
          <ul>
            <li><b>Timeout:</b> timpul de inactivitate după care se demontează. Valoarea internă implicită este de 10 minute, iar configurația instalată implicit o schimbă la 5 minute (<code>automount(8)</code>). <code>--timeout 0</code> dezactivează demontarea. Se poate seta global (<code>/etc/autofs.conf</code>) sau per intrare master.</li>
            <li><b>Browse:</b> implicit, subdirectoarele care <i>nu</i> sunt montate încă nu apar în <code>ls</code> (<code>ls /shares</code> poate fi gol), pentru că autofs nu le creează până la accesare. Opțiunea <code>browse</code> (înlocuiește vechiul <code>--ghost</code>) le face vizibile; instalarea implicită setează <code>BROWSE_MODE="no"</code> (<code>auto.master(5)</code>).</li>
            <li><b>Montări locale:</b> autofs nu este doar pentru NFS: <code>cd -fstype=iso9660,ro :/dev/hdc</code> (exemplu din autofs(5)) montează un CD la cerere. Sursa locală începe cu „:” (fără server).</li>
          </ul>

          <h4>7. Reîncărcarea configurației</h4>
          <p>
            Daemonul citește master map-ul la pornire. Un master map modificat sau o hartă directă modificată cer ca daemonul să primească <b>semnalul HUP</b> (<code>automount(8)</code>, <code>autofs(5)</code>); în practică, <code>systemctl reload autofs</code> sau <code>systemctl restart autofs</code>. Conținutul unei hărți <i>indirecte</i> poate fi modificat din mers: autofs îl recitește la următoarea operație (autofs(5)). Pentru siguranță, la examen: după orice modificare, <code>systemctl restart autofs</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>NFS (L6.3):</b> cel mai frecvent „client” al autofs; montarea efectivă este tot un <code>mount -t nfs</code>, doar că o face daemonul. Aceleași opțiuni (<code>rw</code>, <code>ro</code>, <code>hard</code>, <code>sec=</code>).</li>
            <li><b>systemd (L4.9):</b> autofs este un serviciu: <code>autofs.service</code>, activat cu <code>systemctl enable --now autofs</code>, urmărit cu <code>systemctl status autofs</code> și <code>journalctl -u autofs</code>.</li>
            <li><b>Pachete (C2):</b> <code>dnf install autofs</code> (plus <code>nfs-utils</code> pentru NFS).</li>
            <li><b>Rețea și firewall (C8, C10):</b> aceleași cerințe ca la NFS: rezolvare de nume, acces la server.</li>
            <li><b>SELinux (C10):</b> pentru home directories pe NFS este nevoie de booleanul <code>use_nfs_home_dirs</code> (menționat; detalii în C10); pentru autofs în sine, politica implicită îl permite.</li>
            <li><b>Directoare home și utilizatori (C9):</b> pentru home pe NFS contează ca UID/GID să coincidă între client și server (L6.3, L6.5).</li>
            <li><b>fstab:</b> nu se amestecă: nu monta același director și din fstab, și cu autofs.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Directoare home centralizate pe NFS (wildcard).</li>
            <li>Multe exporturi rar folosite (arhive, pachete de documentație).</li>
            <li>Servere NFS care pot fi indisponibile fără să afecteze boot-ul clienților.</li>
            <li>Examen: „configure autofs to mount <code>server1:/exports/data</code> on <code>/shares/data</code> on demand”, sau „each user’s home directory <code>/remote/&lt;user&gt;</code> should be mounted automatically”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile și nu oferă un server NFS">
          Ca la L6.3, ai nevoie de propriul server NFS (două sisteme sau <code>localhost</code>). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10; <code>server1.example.com</code> este fictiv. Numele implicite ale fișierelor de configurare (<code>/etc/autofs.conf</code> etc.) și nuanțele de reload sunt de confirmat pe RHEL 10.
        </Callout>

        <h4>1. Instalare și pornire</h4>
        <CodeBlock title="comenzi" code={`sudo dnf install -y autofs nfs-utils\nsudo systemctl enable --now autofs\nsystemctl status autofs\nsystemctl is-enabled autofs`} explain={[
          ['dnf install -y autofs nfs-utils', 'instalează daemonul autofs și clientul NFS.'],
          ['systemctl enable --now autofs', 'enable = pornește la boot; --now = pornește și acum.'],
          ['systemctl status autofs', 'starea serviciului: active (running).'],
          ['is-enabled', 'afișează enabled dacă va porni la boot.'],
        ]} />

        <h4>2. Configurare indirectă (exemplul principal)</h4>
        <CodeBlock title="/etc/auto.master.d/shares.autofs" kind="config" code={`/shares  /etc/auto.shares  --timeout=60`} explain={[
          ['/shares', 'punctul de montare al hărții; autofs creează/gestionează directorul (nu trebuie să conțină nimic).'],
          ['/etc/auto.shares', 'fișierul hartă (poate fi orice nume).'],
          ['--timeout=60', 'demontează după 60 s de inactivitate (opțional; implicit 5–10 min).'],
        ]} />
        <CodeBlock title="/etc/auto.shares" kind="config" code={`data  -rw,sync  server1.example.com:/exports/data\nro    -ro       server1.example.com:/exports/ro`} explain={[
          ['data', 'cheia: devine /shares/data.'],
          ['-rw,sync', 'opțiuni mount (separate prin virgulă, precedate de -).'],
          ['server1.example.com:/exports/data', 'sursa NFS.'],
        ]} />
        <CodeBlock title="comenzi" code={`sudo vi /etc/auto.master.d/shares.autofs\nsudo vi /etc/auto.shares\nsudo systemctl restart autofs\nls /shares\nls /shares/data\nfindmnt -t autofs,nfs4`} explain={[
          ['vi …', 'creezi cele două fișiere (numele fișierului din auto.master.d TREBUIE să se termine în .autofs).'],
          ['systemctl restart autofs', 'reîncarcă master map-ul; fără asta noile intrări nu sunt văzute.'],
          ['ls /shares', 'fără browse, rezultatul poate fi gol: cheile nu apar până nu sunt accesate.'],
          ['ls /shares/data', 'accesul declanșează montarea; conținutul serverului apare.'],
          ['findmnt -t autofs,nfs4', 'arată capcana autofs la /shares și montarea NFS efectivă la /shares/data.'],
        ]} />

        <h4>3. Wildcard pentru directoare home</h4>
        <CodeBlock title="/etc/auto.master.d/home.autofs" kind="config" code={`/remote  /etc/auto.home`} />
        <CodeBlock title="/etc/auto.home" kind="config" code={`*  -rw,sync  server1.example.com:/exports/home/&`} explain={[
          ['/remote', 'directorul sub care vor apărea /remote/ana, /remote/bogdan …'],
          ['*  …/&', 'orice cheie cerută se montează de la server1:/exports/home/<cheie>.'],
        ]} />

        <h4>4. Hartă directă</h4>
        <CodeBlock title="/etc/auto.master.d/direct.autofs" kind="config" code={`/-  /etc/auto.direct`} />
        <CodeBlock title="/etc/auto.direct" kind="config" code={`/mnt/backup  -rw,sync  server1.example.com:/exports/backup`} explain={[
          ['/-', 'marchează o hartă directă.'],
          ['/mnt/backup', 'calea absolută unde se montează la cerere.'],
        ]} />
        <p className="small">După modificarea unei hărți directe sau a master map-ului: <code>sudo systemctl restart autofs</code> (autofs(5): hărțile directe și master map-ul cer reîncărcare).</p>

        <h4>5. Diagnostic și depanare</h4>
        <CodeBlock title="comenzi" code={`sudo automount -m\nmount | grep autofs\nfindmnt -t autofs\njournalctl -u autofs -n 30\nsudo systemctl stop autofs\nsudo automount -f -v`} explain={[
          ['automount -m', '-m (--dumpmaps) listează hărțile configurate și intrările lor, ca să vezi ce a citit daemonul.'],
          ['mount | grep autofs', 'capcanele autofs apar ca montări de tip autofs.'],
          ['journalctl -u autofs -n 30', 'ultimele 30 de linii din jurnalul serviciului (-u = unitate, -n = număr).'],
          ['automount -f -v', '-f = rulează în prim-plan (log pe stderr), -v = verbose; oprește mai întâi serviciul systemd; Ctrl+C la final.'],
        ]} />

        <h4>6. Testează demontarea automată</h4>
        <CodeBlock title="comenzi" code={`ls /shares/data\nfindmnt /shares/data\nsleep 90\nfindmnt /shares/data\nls /shares/data\nfindmnt /shares/data`} explain={[
          ['ls /shares/data', 'montează.'],
          ['findmnt /shares/data', 'arată montarea NFS.'],
          ['sleep 90', 'așteaptă mai mult decât timeout-ul (60 s în exemplu).'],
          ['findmnt (a doua)', 'nu mai arată nimic: demontat automat.'],
          ['ls /shares/data (iar)', 'o nouă accesare montează din nou.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="findmnt înainte și după accesare" kind="session" label="illustrative" code={`[student@client1 ~]$ findmnt -t autofs,nfs4\nTARGET  SOURCE   FSTYPE OPTIONS\n/shares /etc/auto.shares autofs rw,relatime,fd=7,pgrp=1234,timeout=60,minproto=5,maxproto=5,indirect\n[student@client1 ~]$ ls /shares/data\nreport.txt  notes.md\n[student@client1 ~]$ findmnt -t autofs,nfs4\nTARGET        SOURCE                            FSTYPE OPTIONS\n/shares       /etc/auto.shares                  autofs rw,relatime,fd=7,pgrp=1234,timeout=60,minproto=5,maxproto=5,indirect\n└─/shares/data server1.example.com:/exports/data nfs4   rw,relatime,vers=4.2,...`} />
        <p className="small">
          Înainte de accesare există <b>doar</b> capcana autofs la <code>/shares</code> (<code>FSTYPE autofs</code>; <code>indirect</code> = hartă indirectă; <code>timeout=60</code> = demontare după 60 s). După <code>ls /shares/data</code> apare o <b>a doua</b> montare, NFS, imbricată sub prima. Opțiunile din <code>OPTIONS</code> (<code>fd</code>, <code>pgrp</code>, <code>minproto</code> …) sunt interne și diferă între versiuni.
        </p>
        <CodeBlock title="automount -m" kind="session" label="illustrative" code={`[root@client1 ~]# automount -m\n\nautofs dump map information\n===========================\n\nGlobal options: none configured\n\nMount point: /shares\n\nsource(s):\n\n  type: file\n  map: /etc/auto.shares\n\n  data | -rw,sync server1.example.com:/exports/data\n  ro   | -ro server1.example.com:/exports/ro`} />
        <p className="small">
          Arată fiecare punct de montare cunoscut de daemon, tipul hărții (<code>file</code>) și intrările citite. Dacă punctul tău nu apare aici, fișierul <code>.autofs</code> nu a fost citit (nume greșit sau serviciu nereîncărcat). Formatul exact diferă între versiuni.
        </p>
        <CodeBlock title="ls pe un director autofs fără browse" kind="session" label="illustrative" code={`[student@client1 ~]$ ls /shares\n[student@client1 ~]$ ls /shares/data\nreport.txt  notes.md`} />
        <p className="small">
          Primul <code>ls</code> nu afișează nimic: <code>data</code> nu există până la prima accesare. Aceasta <b>nu</b> este o eroare: nu înseamnă că autofs nu funcționează. Al doilea <code>ls</code> declanșează montarea.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Serviciul rulează și este activat:</b> <code>systemctl is-active autofs</code> → <code>active</code>; <code>systemctl is-enabled autofs</code> → <code>enabled</code>.</li>
            <li><b>Daemonul a citit configurația:</b> <code>sudo automount -m</code> listează punctul tău de montare.</li>
            <li><b>Montare la cerere:</b> <code>ls /shares/data</code> arată conținutul; <code>findmnt /shares/data</code> arată <code>nfs4</code> cu sursa serverului.</li>
            <li><b>Demontare automată:</b> după timeout, <code>findmnt /shares/data</code> nu mai afișează nimic.</li>
            <li><b>Wildcard:</b> <code>ls /remote/ana</code> montează <code>server1:/exports/home/ana</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Persistența are două părți: fișierele de configurare (<code>/etc/auto.master.d/*.autofs</code>, hărțile) persistă pe disc, iar serviciul trebuie activat la boot cu <code>systemctl enable autofs</code> (fără <code>--now</code> nu pornește acum; fără <code>enable</code> nu pornește la boot). Montările în sine nu persistă, prin concepție: se fac la cerere. Confirmare manuală: <code>sudo reboot</code>, apoi <code>systemctl is-active autofs</code> și <code>ls /shares/data</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<><code>ls /shares/data</code>: <code>No such file or directory</code></>, 'master map nereîncărcat sau fișier fără sufix .autofs', <><code>automount -m</code>, <code>ls /etc/auto.master.d</code></>, <>redenumește în <code>.autofs</code>; <code>systemctl restart autofs</code></>],
          [<><code>ls /shares</code> gol</>, 'comportament normal (fără browse); cheile apar la accesare', <code>ls /shares/data</code>, 'accesează cheia direct'],
          ['Montarea nu se face, fără eroare vizibilă', 'cheie greșită în hartă, hartă lipsă sau eroare de sintaxă', <code>journalctl -u autofs</code>, 'corectează harta; restart'],
          [<><code>mount.nfs: access denied</code> în jurnal</>, 'exportul nu permite clientul sau calea nu e exportată', <><code>showmount -e</code>, <code>exportfs -v</code> (server)</>, 'corectează exports (L6.3)'],
          ['Directorul /shares conține fișiere vechi', 'ai creat manual conținut sub punctul autofs', <code>umount /shares</code>, 'golește directorul înainte; autofs trebuie să îl controleze'],
          ['Modificarea hărții directe nu are efect', 'daemonul nu a fost reîncărcat', <code>systemctl status autofs</code>, <code>systemctl restart autofs</code>],
          ['Nu pornește după reboot', 'serviciul nu a fost activat', <code>systemctl is-enabled autofs</code>, <code>systemctl enable --now autofs</code>],
          [<><code>Permission denied</code> în director montat</>, 'UID/root_squash/permisiuni pe server', <><code>ls -ldn</code>, <code>id</code></>, 'vezi L6.3 și L6.5'],
          ['Montarea persistă „la nesfârșit”', 'timeout 0 sau montarea e folosită', <><code>findmnt</code>, <code>lsof +D</code></>, 'setează timeout; ieși din director'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Numești fișierul din <code>auto.master.d</code> altfel decât <code>*.autofs</code>: este ignorat (<code>auto.master(5)</code>).</>,
          <>Creezi manual directorul <code>/shares/data</code> sau pui fișiere în <code>/shares</code>: autofs gestionează aceste directoare.</>,
          <>Uiți <code>systemctl enable --now autofs</code> (nu pornește sau nu persistă la reboot).</>,
          <>Nu reîncarci serviciul după modificarea master map-ului sau a hărții directe.</>,
          <>Crezi că autofs nu merge fiindcă <code>ls /shares</code> e gol.</>,
          <>Pui <code>-</code> lipsă înaintea opțiunilor din hartă (<code>rw,sync</code> în loc de <code>-rw,sync</code>): opțiunile ar fi luate drept locație.</>,
          <>Confunzi harta directă (<code>/-</code>, chei = căi) cu cea indirectă (chei = nume).</>,
          <>Montezi același director și din fstab, și cu autofs.</>,
          <>Uiți <code>nfs-utils</code> / <code>autofs</code> (pachete).</>,
          <>Uiți că UID-urile trebuie să coincidă pentru home directories pe NFS.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: configurare globală, variabile și multi-mount">
        <p>
          <b>Configurare globală:</b> parametri ca <code>timeout</code>, <code>browse_mode</code> și <code>master_map_name</code> se află în <code>/etc/autofs.conf</code> (pe versiunile mai vechi și în <code>/etc/sysconfig/autofs</code>; de confirmat pe RHEL 10). <code>auto.master(5)</code> notează că instalarea implicită setează <code>BROWSE_MODE="no"</code> și că <code>--ghost</code> este deprecat în favoarea <code>browse</code>.
        </p>
        <p>
          <b>Opțiuni cumulative:</b> opțiunile din master map se adună cu cele din hartă (autofs(5)). De exemplu, <code>--timeout</code> în master și <code>-rw,sync</code> în hartă se aplică amândouă.
        </p>
        <p>
          <b>Variabile în hărți:</b> hărțile pot folosi substituții (utilizator, host etc.), ca <code>${'{'}USER{'}'}</code>; sunt menționate pentru completitudine și nu fac parte din obiectiv.
        </p>
        <p>
          <b>Un director, mai multe montări (multi-mount):</b> o cheie poate monta mai multe surse dintr-o singură intrare (format cu mai multe locații, <code>autofs(5)</code>); folosit rar.
        </p>
        <p>
          <b>Hărți din alte surse:</b> hărțile pot veni din LDAP, NIS sau executabile (<code>map-type:map</code> în master). La RHCSA lucrezi cu fișiere.
        </p>
        <p>
          <b>De ce directoarele dispar:</b> la demontare, autofs șterge directorul-cheie (<code>/shares/data</code>). Dacă o aplicație își păstrează directorul curent acolo, montarea nu expiră (busy).
        </p>
      </DeepDive>
    </>
  );
}

export const L6_4: TopicModule = {
  id: 'L6.4',
  subtitle: 'autofs: auto.master, /etc/auto.master.d/*.autofs, hărți indirecte/directe/wildcard, systemctl enable --now autofs',
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
  labs: [LAB_L6_4],
  sources: [
    { kind: 'man', ref: 'autofs(5), auto.master(5), automount(8) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'systemctl(1), journalctl(1), findmnt(8), nfs(5) — din cunoștințe/parțial citite' },
    { kind: 'doc', ref: 'RHEL 10 — „Mounting file systems on demand” (storage-mounting_file_systems_on_demand), docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
