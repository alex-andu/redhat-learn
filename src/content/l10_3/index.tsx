import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_3A, LAB_L10_3B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="selinux">SELinux</G> (<i>Security-Enhanced Linux</i>) este un strat de securitate <b>suplimentar</b> peste permisiunile obișnuite (<code>rwx</code>): chiar dacă un fișier are <code>777</code>, un proces îl poate accesa doar dacă <b>politica SELinux</b> îi permite. Are trei moduri: <b>enforcing</b> (blochează și înregistrează), <b>permissive</b> (doar înregistrează, nu blochează) și <b>disabled</b> (oprit).
          </p>
          <p>
            Comenzi esențiale: <code>getenforce</code> (modul curent), <code>sestatus</code> (starea completă), <code>setenforce 0|1</code> (schimbă modul <b>temporar</b>, până la reboot) și editarea <code>SELINUX=</code> în <code>/etc/selinux/config</code> (schimbare <b>permanentă</b>, după reboot). Regula de aur: <b>nu dezactiva SELinux ca să „rezolvi” o problemă</b>; folosește permissive doar pentru diagnostic și apoi repară cauza (L10.4–L10.8).
          </p>
          <p>Obiectivul oficial: <i>„Set enforcing and permissive modes for SELinux”</i>. Verificare: <code>getenforce</code>, <code>sestatus</code>, <code>grep ^SELINUX /etc/selinux/config</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Controlul discreționar (DAC): ce știi deja</h4>
          <p>
            Permisiunile clasice (L1.8) se numesc <b><G id="dac">DAC</G></b> (<i>Discretionary Access Control</i>, „control discreționar”): <b>proprietarul</b> unui fișier decide cine îl poate citi, scrie sau executa, iar procesele rulează cu identitatea (UID/GID) utilizatorului care le-a pornit. Slăbiciunea: un proces compromis (de exemplu un server web exploatat) rulează cu drepturile utilizatorului lui (<code>apache</code>) și poate accesa <b>tot</b> ce acel utilizator poate accesa, chiar lucruri care nu au nicio legătură cu un server web (<code>/home</code>, chei SSH, baza de date). Iar <code>root</code> ocolește aproape orice verificare DAC.
          </p>
          <h4>Controlul obligatoriu (MAC): SELinux</h4>
          <p>
            SELinux adaugă un <b><G id="mac">MAC</G></b> (<i>Mandatory Access Control</i>, „control obligatoriu”): o <b>politică centrală</b> (scrisă de distribuție, nu de proprietarul fișierului) spune <i>exact</i> ce are voie să facă fiecare tip de proces cu fiecare tip de resursă. Chiar și <code>root</code> este limitat dacă procesul este confinat. Conform <code>selinux(8)</code>, SELinux este „o arhitectură de control al accesului obligatoriu pentru Linux” și suportă <i>Type Enforcement</i>, <i>Role-Based Access Control</i> și <i>Multi-Level Security</i>.
          </p>
          <Analogy>
            DAC este ca un birou în care fiecare angajat decide cui dă cheia de la sertarul lui. MAC este <b>paza clădirii</b> cu o listă oficială: „un curier poate intra doar la recepție, niciodată în arhivă”, indiferent ce spune angajatul din arhivă și indiferent câte chei are curierul. Dacă un curier este păcălit (exploatat), paza tot îl oprește la recepție.
          </Analogy>
          <h4>Exemplu concret: de ce există SELinux</h4>
          <p>
            Un server web (<code>httpd</code>) are o vulnerabilitate, iar atacatorul poate executa comenzi ca utilizatorul <code>apache</code>. Fără SELinux, el poate încerca să citească orice fișier world-readable (<code>/etc/passwd</code>, loguri, fișiere ale altor aplicații) sau să scrie unde utilizatorul <code>apache</code> are drepturi. Cu SELinux, procesul <code>httpd</code> rulează în domeniul <code>httpd_t</code>, iar politica îi permite să citească doar fișiere etichetate cu tipuri web (<code>httpd_sys_content_t</code> etc.), să asculte doar pe porturi etichetate <code>http_port_t</code> și să facă doar ce permit <i>boolean-urile</i> (L10.7). Restul este blocat și <b>înregistrat</b> în jurnalul de audit.
          </p>
          <Callout kind="info" title="SELinux nu înlocuiește permisiunile; se adaugă lor">
            Un acces reușește doar dacă <b>ambele</b> straturi îl permit: mai întâi DAC (permisiuni clasice), apoi MAC (SELinux). Dacă primești „Permission denied” deși <code>ls -l</code> arată drepturi bune, SELinux este un suspect de bază. Invers, SELinux nu poate <i>acorda</i> un acces pe care DAC îl refuză.
          </Callout>

          <h4>Cele trei moduri</h4>
          <Table head={['Mod', 'Politica este încărcată?', 'Acțiunile refuzate', 'Se înregistrează?', 'Uz']} rows={[
            [<G id="enforcing">enforcing</G>, 'da', 'BLOCATE', 'da (AVC)', 'modul normal de producție; implicit pe RHEL'],
            [<G id="permissive">permissive</G>, 'da', 'permise', 'da (AVC, cu permissive=1)', 'diagnostic temporar: vezi ce ar fi blocat'],
            ['disabled', 'nu', 'nu se verifică nimic', 'nu', 'nerecomandat; fișiere create în acest timp nu primesc etichete'],
          ]} />
          <p>
            Definițiile sunt cele din <code>selinux(8)</code>: <i>disabled</i> = „cea mai mare parte a codului SELinux din kernel și aplicații este oprită”; <i>permissive</i> = „acțiunile refuzate sunt permise, dar înregistrate”; <i>enforcing</i> = „acțiunile refuzate sunt blocate și înregistrate”.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Etichete pe tot: subiecți și obiecte</h4>
          <p>
            SELinux atașează o <b>etichetă (context de securitate)</b> fiecărui <b>proces</b> (<i>subiect</i>) și fiecărui obiect (fișier, director, port de rețea, socket…). Eticheta are forma <code>utilizator:rol:tip:nivel</code>, de exemplu <code>system_u:system_r:httpd_t:s0</code> pentru un proces și <code>system_u:object_r:httpd_sys_content_t:s0</code> pentru un fișier. În politica <i>targeted</i> (cea folosită pe RHEL), partea decisivă este <b>tipul</b> (sufixul <code>_t</code>); detaliile în L10.4.
          </p>
          <h4>2. Politica: reguli „tip sursă poate face X pe tip țintă”</h4>
          <p>
            Politica (încărcată în kernel la boot) este o mulțime de reguli <i>allow</i> de forma: „domeniul <code>httpd_t</code> poate <i>citi</i> fișiere de tip <code>httpd_sys_content_t</code>”. <b>Tot ce nu este permis explicit este interzis.</b> Politicile sunt scrise de distribuție (pachetul <code>selinux-policy-targeted</code>), nu de administrator, iar administratorul le ajustează prin etichete, porturi și <i>boolean-uri</i> (lecțiile următoare).
          </p>
          <h4>3. Decizia, la fiecare acces</h4>
          <ol>
            <li>Procesul cere un acces (de exemplu <code>open()</code> pe un fișier).</li>
            <li>Kernelul verifică întâi <b>DAC</b> (permisiunile clasice). Dacă refuză, se termină aici cu „Permission denied”.</li>
            <li>Dacă DAC permite, kernelul întreabă <b>SELinux</b> (prin <i>Linux Security Modules</i>, LSM): politica permite <i>domeniul sursă</i> să facă acțiunea pe <i>tipul țintă</i>? Răspunsul este păstrat într-un cache (<i>Access Vector Cache</i>, AVC).</li>
            <li>În <b>enforcing</b>: dacă politica refuză, accesul este blocat și se scrie un mesaj <G id="avc">AVC</G> <code>denied</code> în jurnalul de audit. În <b>permissive</b>: se scrie același mesaj, dar accesul continuă.</li>
          </ol>
          <h4>4. Procese confinate și neconfinate</h4>
          <p>
            Politica <G id="targeted">targeted</G> „țintește” (confinează) <b>serviciile de rețea</b> și multe alte demoane (<code>httpd_t</code>, <code>sshd_t</code>, <code>named_t</code>…), dar un utilizator obișnuit autentificat rulează de regulă în domeniul <code>unconfined_t</code>, adică are foarte puține restricții SELinux. Așa se explică de ce, pe un sistem cu SELinux enforcing, majoritatea comenzilor tale nu sunt afectate, iar serviciile sunt. (Politica <i>MLS</i> confinează toate procesele și ține cont de niveluri de securitate; nu este tema obiectivului.)
          </p>
          <h4>5. Unde se stabilește modul și cum se schimbă</h4>
          <Table head={['Mecanism', 'Ce face', 'Persistă la reboot?']} rows={[
            [<><code>setenforce 1</code> / <code>setenforce 0</code></>, 'schimbă modul ACUM (enforcing/permissive), la rulare', 'NU: la boot se citește din /etc/selinux/config'],
            [<><code>SELINUX=enforcing|permissive|disabled</code> în <code>/etc/selinux/config</code></>, 'modul de la următorul boot', 'DA (intră în vigoare după reboot)'],
            [<>parametru kernel <code>enforcing=0</code> / <code>enforcing=1</code></>, 'modul la un anumit boot, editat în GRUB (L4.3, L7.4)', 'doar pentru acel boot'],
            [<>parametru kernel <code>selinux=0</code></>, 'dezactivează SELinux complet; suprascrie fișierul de configurare (selinux(8))', 'doar dacă e în linia de comandă a kernelului (persistent prin grubby)'],
          ]} />
          <p>
            Fișierul <code>/etc/selinux/config</code> conține două directive (<code>selinux_config(5)</code>): <code>SELINUX=</code> (<code>enforcing</code> | <code>permissive</code> | <code>disabled</code>) și <code>SELINUXTYPE=</code> (numele politicii = numele directorului din <code>/etc/selinux/</code>, de exemplu <code>targeted</code>). Dacă fișierul lipsește sau este corupt, nu se încarcă nicio politică (SELinux efectiv dezactivat).
          </p>
          <Callout kind="warn" title="„disabled” este depreciat">
            <code>selinux(8)</code> spune că <code>SELINUX=disabled</code> în <code>/etc/selinux/config</code> este <b>depreciat</b>: în funcție de kernel, cârligele SELinux pot rula în continuare, cu politica doar descărcată. Metoda oficială de dezactivare completă este parametrul de kernel <code>selinux=0</code>. Comportamentul exact pe RHEL 10 trebuie confirmat. Oricum, <b>nu dezactiva SELinux</b> pe examen decât dacă cerința o spune explicit.
          </Callout>
          <h4>6. De la disabled la enforcing: reetichetarea</h4>
          <p>
            Cât timp SELinux este <code>disabled</code>, fișierele create <b>nu primesc etichete</b>. Dacă apoi îl activezi, sistemul trebuie să <b>reeticheteze</b> tot sistemul de fișiere (altfel serviciile pot fi blocate). Procedura clasică: <code>sudo touch /.autorelabel</code>, apoi reboot; la boot, sistemul reeticheteză și șterge fișierul-semnal (același mecanism ca în L4.3). Trecerea între <code>permissive</code> și <code>enforcing</code> NU cere reetichetare, deoarece politica este încărcată în ambele.
          </p>
          <h4>7. Unde se văd refuzările</h4>
          <p>
            Mesajele <b>AVC</b> ajung în <code>/var/log/audit/audit.log</code> (serviciul <G id="auditd">auditd</G>); dacă <code>auditd</code> nu rulează, pot apărea în jurnalul kernelului. Un mesaj conține acțiunea refuzată (<code>{'{ read }'}</code>), procesul (<code>comm</code>), contextul sursă (<code>scontext</code>), contextul țintă (<code>tcontext</code>), clasa (<code>tclass</code>) și câmpul <code>permissive=0|1</code>, care arată dacă accesul a fost într-adevăr blocat. Citirea lor este tema L10.8.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Permisiuni (L1.8, L10.1):</b> DAC primul, SELinux al doilea; <code>chmod 777</code> nu rezolvă o refuzare SELinux.</li>
            <li><b>Boot și GRUB (L4.1, L4.3, L7.4):</b> la resetarea parolei de root cu <code>rd.break</code>, fișierul <code>/etc/shadow</code> editat în initramfs are etichetă greșită → <code>touch /.autorelabel</code>. Parametrii <code>enforcing=0</code> și <code>selinux=0</code> se pot adăuga temporar în linia kernelului.</li>
            <li><b>systemd (L4.9):</b> serviciile pornite de systemd rulează în domeniul lor (<code>httpd_t</code>); <code>systemctl</code> arată eșecul, iar cauza (AVC) este în <code>audit.log</code>.</li>
            <li><b>SSH (L10.2):</b> <code>sshd_t</code> și etichetele din <code>~/.ssh</code>.</li>
            <li><b>firewalld (L8.4):</b> strat separat de rețea; un serviciu poate fi permis de firewall și refuzat de SELinux (și invers).</li>
            <li><b>Stocare (L6.1–L6.4):</b> sisteme de fișiere noi (NFS, XFS montat) pot afecta etichetele; montări cu <code>context=</code>; NFS cere boolean-uri (L10.7).</li>
            <li><b>Jurnal și audit (L4.7):</b> <code>journalctl</code> poate afișa mesajele <code>setroubleshoot</code> dacă pachetul este instalat; AVC-urile brute sunt în <code>audit.log</code>.</li>
            <li><b>Pachete (L2.x):</b> politica (<code>selinux-policy-targeted</code>) și utilitarele (<code>policycoreutils</code>, <code>policycoreutils-python-utils</code>) se instalează cu <code>dnf</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li><b>Zilnic:</b> SELinux rămâne în <i>enforcing</i>; verifici modul după o instalare sau o actualizare.</li>
            <li><b>Diagnostic:</b> un serviciu nu pornește sau nu are acces la un fișier: treci temporar în <i>permissive</i> (<code>setenforce 0</code>) ca să afli dacă SELinux este cauza, apoi te întorci imediat (<code>setenforce 1</code>) și repari cauza.</li>
            <li><b>Instalare nouă:</b> verifici că <code>SELINUX=enforcing</code> în <code>/etc/selinux/config</code>.</li>
            <li><b>Examen:</b> „set SELinux to enforcing mode and make the change persist across reboots”, „set SELinux to permissive mode for the current session only”, „verify the current SELinux mode”.</li>
          </ul>
          <Callout kind="warn" title="Greșeala clasică">
            „Nu merge → dezactivez SELinux” este considerat o practică proastă în producție și un eșec la examen. Dacă un task are nevoie de SELinux enforcing, un sistem lăsat în permissive nu îl îndeplinește, chiar dacă serviciul „merge”.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi pe o mașină de test (VM cu instantaneu). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Toate comenzile de schimbare cer <code>root</code> sau <code>sudo</code>. Schimbările din <code>/etc/selinux/config</code> intră în vigoare la reboot: ai nevoie de acces la consolă dacă ceva nu merge.
        </Callout>

        <h4>1. Citește starea</h4>
        <CodeBlock title="comenzi" code={`getenforce\nsestatus\nsestatus -v\nsestatus -b | head -5\ncat /sys/fs/selinux/enforce; echo\ngrep -v '^#' /etc/selinux/config\nls /etc/selinux/\ncat /proc/cmdline`} explain={[
          ['getenforce', 'afișează modul CURENT: Enforcing, Permissive sau Disabled.'],
          ['sestatus', 'starea completă: status, punct de montare selinuxfs, politica încărcată (targeted), modul curent, modul din fișierul de configurare etc.'],
          ['sestatus -v', '-v = adaugă contextele procesului curent, ale init-ului, ale terminalului și ale fișierelor listate în /etc/sestatus.conf (sestatus(8)).'],
          ['sestatus -b', '-b = starea boolean-urilor (L10.7); aici, primele 5 linii (head -5).'],
          ['cat /sys/fs/selinux/enforce', 'interfața din kernel: 1 = enforcing, 0 = permissive (existența directorului arată că SELinux este activ).'],
          ["grep -v '^#' /etc/selinux/config", '-v = exclude liniile care încep cu #: vezi doar directivele active (SELINUX= și SELINUXTYPE=).'],
          ['ls /etc/selinux/', 'directorul politicii (targeted) și fișierul config.'],
          ['cat /proc/cmdline', 'parametrii kernelului: caută enforcing=0 sau selinux=0, care suprascriu config-ul.'],
        ]} />

        <h4>2. Schimbă modul temporar (până la reboot)</h4>
        <CodeBlock title="comenzi" code={`sudo setenforce 0\ngetenforce\nsudo setenforce 1\ngetenforce\nsudo setenforce Permissive\nsudo setenforce Enforcing\nsudo setenforce 2; echo exit=$?`} explain={[
          ['setenforce 0', '0 = permissive (nu blochează, doar înregistrează). Nu cere reboot și nu modifică niciun fișier.'],
          ['setenforce 1', '1 = enforcing.'],
          ['setenforce Permissive / Enforcing', 'formele cu cuvinte, echivalente (setenforce(8)).'],
          ['setenforce 2', 'valoare invalidă: eroare de utilizare (nu schimbă nimic). Exemplu de ce verifici cu getenforce după fiecare schimbare.'],
        ]} />
        <p className="small">
          Dacă SELinux este <b>Disabled</b>, <code>setenforce</code> eșuează cu o eroare (nu există politică încărcată). Pagina <code>setenforce(8)</code> nu descrie comportamentul în acest caz; trimite la <code>selinux(8)</code>. Trecerea din disabled în enforcing se face prin fișierul de configurare + reboot + relabel.
        </p>

        <h4>3. Schimbă modul permanent: /etc/selinux/config</h4>
        <CodeBlock title="/etc/selinux/config (fragment)" kind="config" label="illustrative" code={`# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=enforcing
# SELINUXTYPE= can take one of these values:
#     targeted - Targeted processes are protected,
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted`} explain={[
          ['SELINUX=enforcing', 'modul la boot: blochează și înregistrează. Valori: enforcing | permissive | disabled (selinux_config(5)).'],
          ['SELINUXTYPE=targeted', 'politica încărcată; numele ei este numele directorului din /etc/selinux/. Nu schimba fără motiv (cere reboot și posibil relabel).'],
        ]} />
        <p className="small">Comentariile din fișier diferă de la o versiune la alta; textul de mai sus este ilustrativ. Important: <b>o singură</b> linie activă <code>SELINUX=</code>.</p>
        <CodeBlock title="comenzi" code={`sudo grep -n '^SELINUX=' /etc/selinux/config\nsudo sed -i 's/^SELINUX=.*/SELINUX=permissive/' /etc/selinux/config\nsudo grep -n '^SELINUX=' /etc/selinux/config\nsudo sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config\nsestatus | grep -i 'mode'\nls -lZ /etc/selinux/config`} explain={[
          ["sed -i 's/^SELINUX=.*/SELINUX=permissive/'", "-i = modifică fișierul pe loc; s/…/…/ = înlocuiește; ^SELINUX= = linia care începe așa (nu și SELINUXTYPE=, care are TYPE după SELINUX); .* = restul liniei. Alternativ editezi cu vi/nano."],
          ['sestatus | grep -i mode', 'afișează „Current mode” (acum) și „Mode from config file” (la boot): cele două pot diferi până la reboot.'],
          ['ls -lZ /etc/selinux/config', 'contextul fișierului (de obicei etc_t sau selinux_config_t; de confirmat); setările tale nu schimbă contextul.'],
        ]} />
        <Callout kind="warn" title="Nu confunda temporar cu permanent">
          <code>setenforce</code> schimbă <b>modul curent</b> și nu atinge <code>/etc/selinux/config</code>. Editarea <code>/etc/selinux/config</code> schimbă modul de <b>la următorul boot</b>, nu pe cel curent. Pentru „imediat și permanent” faci <b>ambele</b>: <code>setenforce 1</code> + <code>SELINUX=enforcing</code>.
        </Callout>

        <h4>4. Pornirea unui boot în permissive sau fără SELinux (diagnostic/recuperare)</h4>
        <CodeBlock title="comenzi" code={`sudo grubby --info=DEFAULT | grep args\nsudo grubby --update-kernel=ALL --args="enforcing=0"\nsudo grubby --update-kernel=ALL --remove-args="enforcing=0"\ncat /proc/cmdline`} explain={[
          ['grubby --info=DEFAULT', 'arată intrarea de boot implicită; linia args conține parametrii kernelului.'],
          ['--update-kernel=ALL --args="enforcing=0"', 'adaugă enforcing=0 la TOATE intrările: următoarele boot-uri pornesc SELinux în permissive. selinux=0 l-ar dezactiva complet.'],
          ['--remove-args="enforcing=0"', 'elimină parametrul (revii la modul din /etc/selinux/config).'],
        ]} />
        <p className="small">
          Alternativ, în meniul GRUB poți apăsa <code>e</code> și adăuga <code>enforcing=0</code> doar pentru acel boot (L4.3). <code>grubby</code> a fost folosit în L7.4. Sintaxa exactă pe RHEL 10 este de confirmat.
        </p>

        <h4>5. De la disabled la enforcing (recuperare)</h4>
        <CodeBlock title="comenzi" code={`sudo sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config\nsudo touch /.autorelabel\nsudo reboot`} explain={[
          ['SELINUX=enforcing', 'modul dorit după boot.'],
          ['touch /.autorelabel', 'fișier-semnal: la boot, tot sistemul de fișiere este reetichetat (poate dura minute) și fișierul este șters.'],
          ['reboot', 'repornește; după boot rulezi getenforce.'],
        ]} />

        <h4>6. Citește o refuzare (pregătire pentru L10.8)</h4>
        <CodeBlock title="comenzi" code={`sudo ausearch -m avc -ts recent\nsudo ausearch -m avc -ts today -i\nsudo tail -n 5 /var/log/audit/audit.log\nsudo systemctl is-active auditd`} explain={[
          ['ausearch -m avc -ts recent', '-m = tipul de mesaj (avc), -ts = „time start” (recent = ultimele 10 minute; ausearch(8) acceptă și today, yesterday, boot).'],
          ['-i', '-i = interpretează valorile numerice în text (UID → nume).'],
          ['tail -n 5 /var/log/audit/audit.log', 'ultimele 5 rânduri brute din jurnalul de audit.'],
          ['systemctl is-active auditd', 'serviciul de audit trebuie să fie activ ca să existe audit.log.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="getenforce" kind="session" label="illustrative" code={`[student@server1 ~]$ getenforce
Enforcing
[student@server1 ~]$ sudo setenforce 0
[student@server1 ~]$ getenforce
Permissive`} />
        <p className="small">
          Trei valori posibile: <code>Enforcing</code>, <code>Permissive</code>, <code>Disabled</code>. <code>setenforce 0</code> nu afișează nimic dacă reușește: confirmi cu <code>getenforce</code>.
        </p>
        <CodeBlock title="sestatus" kind="session" label="illustrative" code={`[student@server1 ~]$ sestatus
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33`} />
        <p className="small">
          <b>SELinux status</b>: activat sau nu. <b>SELinuxfs mount</b>: unde este montat sistemul de fișiere virtual SELinux. <b>SELinux root directory</b>: directorul de configurare. <b>Loaded policy name</b>: politica încărcată (<code>targeted</code>). <b>Current mode</b> vs <b>Mode from config file</b>: modul acum, față de cel din <code>/etc/selinux/config</code>; ele diferă după un <code>setenforce</code> (cele două linii sunt numele câmpurilor din <code>sestatus(8)</code>). Valorile (de exemplu versiunea maximă a politicii) sunt ilustrative.
        </p>
        <CodeBlock title="Current mode ≠ Mode from config file" kind="session" label="illustrative" code={`Current mode:                   permissive
Mode from config file:          enforcing`} />
        <p className="small">
          Aceasta este exact situația după <code>setenforce 0</code>: la reboot sistemul revine la <code>enforcing</code>. Situația inversă (<code>Current mode: enforcing</code>, <code>Mode from config file: permissive</code>) înseamnă că ai editat config-ul, dar nu ai repornit.
        </p>
        <CodeBlock title="mesaj AVC (în audit.log)" kind="session" label="illustrative" code={`type=AVC msg=audit(1731850010.412:812): avc:  denied  { read } for  pid=2210 comm="httpd" name="index.html" dev="vda1" ino=1048611 scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0`} />
        <p className="small">
          <code>denied</code> = refuzat; <code>{'{ read }'}</code> = acțiunea; <code>comm="httpd"</code> = procesul; <code>scontext</code> = contextul procesului (domeniul <code>httpd_t</code>); <code>tcontext</code> = contextul fișierului (tipul <code>user_home_t</code>); <code>tclass=file</code> = clasa obiectului; <code>permissive=0</code> = a fost <b>blocat</b> (în permissive ar fi <code>permissive=1</code>: înregistrat, dar permis). Detaliile sunt ilustrative.
        </p>
        <CodeBlock title="cmdline" kind="session" label="illustrative" code={`[student@server1 ~]$ cat /proc/cmdline
BOOT_IMAGE=(hd0,msdos1)/vmlinuz-6.12.0-xx.el10.x86_64 root=/dev/mapper/rhel-root ro crashkernel=auto rd.lvm.lv=rhel/root rhgb quiet enforcing=0`} />
        <p className="small">
          Parametrul <code>enforcing=0</code> pornește sistemul în permissive, indiferent de <code>/etc/selinux/config</code>. Numele kernelului și restul parametrilor sunt ilustrative.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Modul curent:</b> <code>getenforce</code> sau <code>sestatus | grep 'Current mode'</code>.</li>
            <li><b>Modul permanent:</b> <code>grep ^SELINUX= /etc/selinux/config</code> și <code>sestatus | grep 'Mode from config file'</code>.</li>
            <li><b>Cele două coincid?</b> Dacă nu, reboot-ul va schimba modul.</li>
            <li><b>Suprascrieri la boot:</b> <code>cat /proc/cmdline</code> (<code>enforcing=0</code>, <code>selinux=0</code>).</li>
            <li><b>Politica:</b> <code>sestatus | grep policy</code> → <code>targeted</code>.</li>
            <li><b>Refuzări recente:</b> <code>sudo ausearch -m avc -ts recent</code>.</li>
            <li><b>După reboot:</b> <code>getenforce</code> trebuie să arate modul din config.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <Table head={['Acțiune', 'Efect imediat', 'La reboot']} rows={[
            [<code>setenforce 0</code>, 'permissive', 'revine la valoarea din /etc/selinux/config'],
            [<><code>SELINUX=permissive</code> în config</>, 'niciun efect imediat', 'pornește în permissive'],
            [<><code>setenforce 1</code> + <code>SELINUX=enforcing</code></>, 'enforcing acum', 'enforcing'],
            [<><code>enforcing=0</code> în linia kernelului</>, 'doar la următorul boot', 'permissive cât timp parametrul există'],
            [<><code>SELINUX=disabled</code> + reboot</>, 'oprit (depreciat)', 'oprit; repornirea cere relabel'],
          ]} />
          <p>
            Pentru examen: după ce setezi enforcing sau permissive „permanent”, <b>reboot-ul este testul final</b>; verifică <code>getenforce</code> și <code>sestatus</code> după pornire.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['După reboot, SELinux e din nou permissive', 'ai folosit doar setenforce', <><code>grep ^SELINUX= /etc/selinux/config</code></>, <>editează config → <code>SELINUX=enforcing</code></>],
          ['setenforce: SELinux is disabled', 'politica nu e încărcată', <code>getenforce</code>, <>activează în config, <code>touch /.autorelabel</code>, reboot</>],
          ['Boot foarte lent sau blocat după activare', 'relabel complet în desfășurare', 'mesaje pe consolă „Relabeling”', 'așteaptă; nu opri sistemul'],
          ['Servicii eșuează după trecerea din disabled', 'fișiere fără etichete', <><code>ls -Z</code> arată <code>unlabeled_t</code></>, <><code>touch /.autorelabel</code> + reboot</>],
          ['Config cu valoare greșită (SELINUX=enforce)', 'greșeală de scriere', <code>cat /etc/selinux/config</code>, <>valori valide: <code>enforcing</code>, <code>permissive</code>, <code>disabled</code></>],
          ['getenforce arată Permissive deși config spune enforcing', 'parametru kernel enforcing=0 sau setenforce', <><code>cat /proc/cmdline</code></>, <><code>grubby --remove-args=enforcing=0</code>; <code>setenforce 1</code></>],
          ['Problema dispare în permissive', 'SELinux blochează o acțiune', <><code>ausearch -m avc -ts recent</code></>, 'repară etichetă/port/boolean (L10.4–L10.7); revino în enforcing'],
          ['Nu apar mesaje AVC', 'auditd oprit sau regulă dontaudit', <><code>systemctl status auditd</code></>, 'pornește auditd; caută în jurnal'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești <code>setenforce 1</code> și crezi că este permanent: nu supraviețuiește reboot-ului.</>,
          <>Editezi <code>/etc/selinux/config</code> și crezi că modul s-a schimbat imediat: ai nevoie de reboot (sau de <code>setenforce</code>).</>,
          <>Dezactivezi SELinux (<code>SELINUX=disabled</code>) „ca să mearbă”: mod inacceptabil, depreciat și cere relabel la reactivare.</>,
          <>Lași sistemul în <code>permissive</code> după diagnostic.</>,
          <>Scrii greșit valorile (<code>enforce</code>, <code>Enforcing</code> cu E mare în config): valorile sunt <code>enforcing</code>, <code>permissive</code>, <code>disabled</code> (litere mici; fii precis).</>,
          <>Uiți <code>touch /.autorelabel</code> la reactivarea din disabled.</>,
          <>Uiți că un parametru <code>enforcing=0</code>/<code>selinux=0</code> din GRUB suprascrie fișierul.</>,
          <>Crezi că <code>chmod 777</code> rezolvă „Permission denied” cauzat de SELinux: nu rezolvă și nu se aplică.</>,
          <>Nu verifici cu <code>getenforce</code> și <code>sestatus</code> după schimbare.</>,
          <>Confunzi <i>enforcing/permissive</i> (moduri) cu <i>targeted/mls</i> (tipuri de politică).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: LSM, AVC, MLS/MCS, domenii permissive, selinux=0 și sistemul de fișiere selinuxfs">
        <p>
          <b>LSM:</b> SELinux este implementat ca modul de securitate Linux (<i>Linux Security Module</i>) cu „cârlige” (hooks) în kernel, apelate la operațiuni (deschidere fișier, bind pe port, fork etc.).
        </p>
        <p>
          <b>AVC:</b> <i>Access Vector Cache</i> păstrează deciziile recente ale politicii ca să nu fie recalculate. Mesajul „AVC denied” vine din acest strat.
        </p>
        <p>
          <b>Domenii permissive:</b> poți pune în permissive doar un domeniu (<code>semanage permissive -a httpd_t</code>), lăsând restul sistemului în enforcing; este mai fin decât <code>setenforce 0</code>, dar nu face parte din obiectiv.
        </p>
        <p>
          <b>MLS/MCS:</b> câmpul <code>s0</code> din context este nivelul de sensibilitate; MCS adaugă categorii (<code>c0.c1023</code>) pentru izolarea containerelor/VM-urilor. Pe targeted, de obicei nu le modifici.
        </p>
        <p>
          <b>selinuxfs:</b> sistemul de fișiere virtual montat la <code>/sys/fs/selinux</code> (în trecut <code>/selinux</code>): fișierul <code>enforce</code> expune modul curent. <code>setenforce</code> scrie în el.
        </p>
        <p>
          <b>disabled vs selinux=0:</b> conform <code>selinux(8)</code>, <code>SELINUX=disabled</code> este depreciat, iar <code>selinux=0</code> este metoda de oprire completă; politica nu este încărcată în ambele situații, dar cârligele kernelului pot rămâne în primul caz.
        </p>
        <p>
          <b>De ce rămâne în enforcing la examen:</b> verificările automate de la EX200 presupun că sistemul rămâne în enforcing; schimbarea modului nu aduce puncte și poate pierde puncte la task-uri de SELinux. Fără ponderi oficiale publicate, aceasta este o recomandare de bun-simț, nu o regulă declarată de Red Hat.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_3: TopicModule = {
  id: 'L10.3',
  subtitle: 'DAC vs MAC, politica targeted, enforcing/permissive/disabled, getenforce, setenforce, sestatus, /etc/selinux/config, relabel și AVC',
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
  labs: [LAB_L10_3A, LAB_L10_3B],
  sources: [
    { kind: 'man', ref: 'selinux(8), selinux_config(5), setenforce(8), sestatus(8), ausearch(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'getenforce(8), grubby(8) pe RHEL 10, conținutul /etc/selinux/config implicit, comportamentul SELINUX=disabled pe kernelul RHEL 10 — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Using SELinux” (secure-changing_selinux_states_and_modes, docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
