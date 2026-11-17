import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L7_1_CRON, LAB_L7_1_AT } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Două mecanisme clasice rulează comenzi <b>fără ca tu să fii de față</b>: <G id="cron">cron</G> pentru sarcini <b>repetitive</b> („în fiecare noapte la 02:30”) și <G id="at-job">at</G> pentru sarcini <b>o singură dată</b> („mâine la 16:00”). Cron citește tabele numite <G id="crontab">crontab</G>, cu linii de forma <code>minut oră zi-lună lună zi-săptămână comandă</code>; se editează cu <code>crontab -e</code>. <code>at</code> primește comanda pe stdin și o rulează o dată; se gestionează cu <code>atq</code> și <code>atrm</code>.
          </p>
          <p>Obiectivul oficial: <i>„Schedule tasks using at, cron and systemd timer units”</i> (aici: <code>at</code> și <code>cron</code>; <code>timer units</code> în L7.2).</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: administratorul nu poate sta toată ziua la tastatură</h4>
          <p>
            Un sistem Linux are zeci de sarcini periodice: rotirea fișierelor de log, copii de siguranță, curățarea directoarelor temporare, verificarea spațiului liber, trimiterea unui raport. Dacă ar trebui să le pornești tu manual, ar fi uitate. Soluția: un <b>program care ține evidența timpului</b> și pornește la momentul potrivit comenzile pe care i le-ai încredințat. Un asemenea program care rulează permanent în fundal, fără terminal, se numește <b>daemon</b> (serviciu). Aici avem doi:
          </p>
          <ul>
            <li><b><code>crond</code></b> (pachetul <code>cronie</code>): se trezește în fiecare minut, citește tabelele cron și pornește comenzile al căror moment s-a potrivit.</li>
            <li><b><code>atd</code></b> (pachetul <code>at</code>): ține o coadă de „job-uri unice” și le pornește la ora cerută; după rulare, job-ul dispare.</li>
          </ul>
          <Analogy>
            <b>cron</b> este <b>alarma recurentă</b> de pe telefon („în fiecare zi lucrătoare la 07:00”). <b>at</b> este un <b>memento unic</b> („azi la 16:00: sună-l pe client”) care, după ce a sunat, dispare.
          </Analogy>

          <h4>Concepte pe care le presupunem de la zero</h4>
          <ul>
            <li><b>Job</b> = o comandă (sau un script) programată pentru a rula automat.</li>
            <li><b>Mediu non-interactiv:</b> când tu deschizi un terminal, shell-ul citește fișierele de profil și îți pregătește variabile (<code>PATH</code> etc.). Un job lansat de cron nu are terminal, nu citește profilul tău și are un mediu <b>foarte redus</b>. Consecința cea mai frecventă: ceea ce merge „la mână” nu merge din cron, dacă folosești nume de comenzi fără cale completă sau variabile pe care nu le-ai definit în job.</li>
            <li><b>Script</b> = un fișier text cu comenzi (L3.1). Pentru sarcini lungi, scrii un script, îl faci executabil și programezi <b>scriptul</b>, nu zece comenzi înlănțuite.</li>
            <li><b>Calea absolută</b> (L1.3) = calea completă de la <code>/</code>: <code>/usr/bin/date</code>, nu <code>date</code>. În cron folosește <b>întotdeauna</b> căi absolute.</li>
          </ul>

          <h4>Când alegi at, când cron (și când alte soluții)</h4>
          <Table head={['Cerință', 'Instrument', 'De ce']} rows={[
            ['„În fiecare noapte la 02:30”', <code>cron</code>, 'sarcină repetitivă cu moment fix'],
            ['„Doar mâine la 16:00, o dată”', <code>at</code>, 'sarcină unică; dispare după rulare'],
            ['„Când sistemul nu e foarte încărcat”', <code>batch</code>, 'o variantă a lui at (vezi mai jos)'],
            ['Laptop/mașină oprită noaptea; rulează „când pornește”', <><code>anacron</code> / timer cu <code>Persistent=true</code></>, 'cron pur sare rularea dacă mașina era oprită'],
            ['Dependențe între servicii, jurnal centralizat, limite de resurse', 'systemd timer (L7.2)', 'integrare cu systemd'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Cron: tabele, nu comenzi</h4>
          <p>
            Cron nu are o „comandă care programează”. Are <b>tabele</b> (fișiere). Daemonul <code>crond</code> citește la pornire toate tabelele și, <b>în fiecare minut</b>, compară ora curentă cu fiecare linie (<code>cron(8)</code>). La potrivire, pornește comanda într-un proces nou, cu utilizatorul proprietar al tabelei. Surse de tabele (<code>crontab(5)</code>, <code>cron(8)</code>):
          </p>
          <Table head={['Locație', 'Format', 'Cine o editează', 'Rol']} rows={[
            [<code>/var/spool/cron/&lt;utilizator&gt;</code>, '5 câmpuri de timp + comandă', <>fiecare utilizator, cu <code>crontab -e</code></>, 'tabela personală (nu se editează direct cu un editor)'],
            [<code>/etc/crontab</code>, '5 câmpuri + UTILIZATOR + comandă', 'root', 'tabela sistemului (pe RHEL e practic goală)'],
            [<code>/etc/cron.d/*</code>, '5 câmpuri + UTILIZATOR + comandă', 'root / pachete', 'fișiere separate, câte unul per aplicație'],
            [<><code>/etc/cron.hourly/</code> etc.</>, 'scripturi executabile', 'root / pachete', <>rulate periodic de sistem (prin <code>run-parts</code>; vezi mai jos)</>],
          ]} />
          <p className="small">
            Detaliu util: <code>cron(8)</code> spune că demonul detectează singur modificările tabelelor („nu e nevoie să repornești Cron”), așa că după <code>crontab -e</code> <b>nu</b> repornești serviciul.
          </p>

          <h4>2. Cele cinci câmpuri de timp</h4>
          <p>O linie cron începe cu cinci câmpuri, apoi comanda. Citește-le de la stânga la dreapta, de la „cel mai mic” la „cel mai mare” (<code>crontab(5)</code>):</p>
          <CodeBlock title="anatomia unei linii cron" kind="config" code={`# ┌───────────── minut (0-59)
# │ ┌─────────── oră (0-23)
# │ │ ┌───────── zi din lună (1-31)
# │ │ │ ┌─────── lună (1-12 sau jan..dec)
# │ │ │ │ ┌───── zi din săptămână (0-7; 0 și 7 = duminică; sau sun..sat)
# │ │ │ │ │
# * * * * *  comanda de rulat
30 2 * * *  /usr/local/bin/backup.sh`} explain={[
            ['30 2 * * *', 'minutul 30, ora 2, orice zi din lună, orice lună, orice zi din săptămână = în fiecare zi la 02:30.'],
            ['/usr/local/bin/backup.sh', 'comanda, cu cale absolută; rulează cu utilizatorul proprietar al tabelei.'],
          ]} />
          <Table head={['Câmp', 'Valori', 'Observații']} rows={[
            ['minut', '0–59', ''],
            ['oră', '0–23', 'format 24 h; nu există AM/PM'],
            ['zi din lună', '1–31', ''],
            ['lună', '1–12 sau nume (jan, feb …)', 'primele 3 litere, insensibil la majuscule'],
            ['zi din săptămână', '0–7 sau nume (sun, mon …)', '0 și 7 înseamnă amândouă duminică'],
          ]} />

          <h4>3. Operatorii: *, virgulă, cratimă, slash</h4>
          <Table head={['Operator', 'Înțeles', 'Exemplu', 'Rezultat']} rows={[
            [<code>*</code>, 'toate valorile din câmp', <code>* * * * *</code>, 'în fiecare minut'],
            [<code>,</code>, 'listă de valori', <code>0 8,12,18 * * *</code>, 'la 08:00, 12:00 și 18:00'],
            [<code>-</code>, 'interval inclusiv', <code>0 9-17 * * *</code>, 'la fiecare oră fixă între 09:00 și 17:00 (inclusiv)'],
            [<code>/n</code>, 'pas', <code>*/15 * * * *</code>, 'la minutele 0, 15, 30, 45 din fiecare oră'],
            ['combinat', 'interval + pas', <code>0 0-23/2 * * *</code>, 'din două în două ore, la fix (00, 02, 04 …)'],
            ['nume', 'luni/zile pe nume', <code>0 7 * * mon-fri</code>, '07:00 de luni până vineri'],
          ]} />
          <Callout kind="warn" title="Pasul se aplică în interiorul câmpului, nu „la fiecare N unități reale”">
            Conform <code>crontab(5)</code>, <code>*/35</code> în câmpul minut înseamnă minutele <b>0 și 35</b> din fiecare oră, nu „la fiecare 35 de minute” (după minutul 35 urmează minutul 0 al orei următoare, după doar 25 de minute). Pasul funcționează „curat” doar când N împarte exact intervalul (de exemplu 5, 10, 15, 20, 30 pentru minute).
          </Callout>

          <h4>4. Capcana zi-din-lună / zi-din-săptămână</h4>
          <p>
            Ai două câmpuri care vorbesc despre „zi”. Regula (<code>crontab(5)</code>): dacă <b>ambele</b> sunt restricționate (niciunul nu este <code>*</code>), job-ul rulează când se potrivește <b>oricare</b> dintre ele (SAU, nu ȘI). Exemplul oficial: <code>30 4 1,15 * 5</code> rulează la 04:30 pe 1 și 15 ale lunii <b>și</b> în fiecare vineri. Dacă vrei „numai vinerile care cad pe 13”, cron nu poate exprima asta direct: se pune <code>* * 13 * *</code> și se testează ziua din script (<code>[ "$(date +\%u)" = 5 ] &amp;&amp; …</code>, atenție la <code>%</code>, vezi mai jos).
          </p>

          <h4>5. Șiruri speciale (@)</h4>
          <Table head={['Șir', 'Echivalent', 'Înțeles']} rows={[
            [<code>@reboot</code>, '—', 'o dată, după boot (când pornește crond)'],
            [<code>@hourly</code>, <code>0 * * * *</code>, 'la începutul fiecărei ore'],
            [<code>@daily</code>, <code>0 0 * * *</code>, 'în fiecare zi la miezul nopții'],
            [<code>@weekly</code>, <code>0 0 * * 0</code>, 'duminică la miezul nopții'],
            [<code>@monthly</code>, <code>0 0 1 * *</code>, 'în prima zi a lunii, la miezul nopții'],
            [<><code>@yearly</code> / <code>@annually</code></>, <code>0 0 1 1 *</code>, '1 ianuarie, la miezul nopții'],
          ]} />
          <p className="small">Aceste șiruri înlocuiesc cele cinci câmpuri: <code>@daily /usr/local/bin/curata.sh</code>.</p>

          <h4>6. Mediul job-ului și variabilele din crontab</h4>
          <p>
            Un crontab poate conține linii de forma <code>NUME=valoare</code> înainte de linii de job (<code>crontab(5)</code>). Cele importante:
          </p>
          <ul>
            <li><code>SHELL</code>: implicit <code>/bin/sh</code>; comanda este interpretată de acest shell.</li>
            <li><code>PATH</code>: nu este cel din sesiunea ta, ci o valoare redusă (de obicei <code>/usr/bin:/bin</code>; din cunoștințe, de confirmat pe RHEL 10). Fie pui căi absolute, fie îl definești în crontab.</li>
            <li><code>MAILTO</code>: cui se trimite output-ul comenzii. Dacă este un șir gol (<code>MAILTO=""</code>), nu se trimite mail; dacă nu este setat, mail către proprietar.</li>
            <li><code>HOME</code>, <code>LOGNAME</code>: din <code>/etc/passwd</code>.</li>
            <li><code>CRON_TZ</code>: fusul orar al tabelei.</li>
          </ul>
          <Callout kind="info" title="Ce se întâmplă cu output-ul comenzii">
            Tot ce scrie job-ul pe stdout/stderr este (dacă există un sistem de mail local) <b>trimis prin mail</b> proprietarului. Pe un sistem fără mail configurat, output-ul se pierde „în tăcere”. Regula practică: <b>redirecționează tu</b> output-ul (L1.5): <code>comanda &gt;&gt; /var/log/job.log 2&gt;&amp;1</code> (adaugă la fișier, stderr în același loc) sau <code>&gt; /dev/null 2&gt;&amp;1</code> (îl aruncă).
          </Callout>
          <Callout kind="warn" title="Caracterul % este special în crontab">
            În linia de comandă, fiecare <code>%</code> neescapat este interpretat ca <b>newline</b>, iar ce urmează după primul <code>%</code> este trimis comenzii ca stdin (<code>crontab(5)</code>). Deci <code>date +%F</code> în crontab se strică: scrie <code>date +\%F</code>. Aceasta este una dintre cele mai frecvente erori la scrierea job-urilor cu <code>date</code>. Un job care „merge în terminal, dar nu în cron” are adesea acest motiv sau lipsa căii absolute.
          </Callout>
          <p className="small">Fără comentarii la capătul liniei: <code>crontab(5)</code> spune că liniile de variabile și de comandă nu pot avea comentarii la sfârșit; comentariul stă pe o linie proprie, începută cu <code>#</code>. Fiecare linie trebuie să se încheie cu newline (ultima linie fără newline face tabela „stricată”).</p>

          <h4>7. cron.hourly/daily/weekly/monthly și anacron</h4>
          <p>
            Pe lângă tabele, sistemul rulează periodic <b>toate scripturile executabile</b> din <code>/etc/cron.hourly</code>, <code>/etc/cron.daily</code>, <code>/etc/cron.weekly</code> și <code>/etc/cron.monthly</code>. Cel mai simplu mod de a programa un script „zilnic, fără să-ți pese de oră” este să-l copiezi (executabil) în <code>/etc/cron.daily</code>. Cele orare sunt pornite de cron prin <code>/etc/cron.d/0hourly</code> (din cunoștințe), cele zilnice/săptămânale/lunare de <b>anacron</b> (<code>cron(8)</code>: „job-urile zilnice, săptămânale și lunare … rulează acum prin anacron”).
          </p>
          <p>
            <b>Anacron</b> rezolvă problema mașinilor care nu sunt pornite non-stop: lucrează cu <b>perioade în zile</b>, nu cu ore exacte, și recuperează rularea ratată. Linia din <code>/etc/anacrontab</code> are forma <code>perioadă-zile  întârziere-minute  identificator  comandă</code> (<code>anacrontab(5)</code>); <code>@daily</code> = 1, <code>@weekly</code> = 7, <code>@monthly</code> = o dată pe lună. Pentru examen e suficient să știi <i>de ce există</i> și că <code>/etc/cron.daily</code> este varianta comodă.
          </p>

          <h4>8. Cine are voie să folosească crontab: cron.allow și cron.deny</h4>
          <p>
            Regulile din <code>crontab(1)</code>: (1) dacă <code>/etc/cron.allow</code> există, <b>doar</b> utilizatorii listați pot folosi <code>crontab</code>; (2) dacă nu există, dar există <code>/etc/cron.deny</code>, pot folosi toți cei <b>nelistați</b> în el; (3) dacă nu există niciunul, <b>doar root</b>. Aceste fișiere restricționează doar <i>folosirea comenzii crontab</i>; un crontab deja existent al unui utilizator rămas pe lista neagră continuă să ruleze. Formatul: un nume de utilizator pe linie.
          </p>

          <h4>9. at: coadă de job-uri unice</h4>
          <p>
            <code>at</code> funcționează diferit: nu are tabele. Tu îi dai o <b>oră</b> și o <b>comandă</b> (de la tastatură sau dintr-un fișier). <code>at</code> salvează job-ul în <code>/var/spool/atd</code> împreună cu <b>mediul tău de acum</b> (directorul curent, variabilele, <code>umask</code>), iar daemonul <code>atd</code> îl execută la ora cerută cu <code>/bin/sh</code> (<code>at(1)</code>). Spre deosebire de cron, mediul este deci <b>cel al sesiunii care a creat job-ul</b>, nu unul redus. Comenzile asociate:
          </p>
          <Table head={['Comandă', 'Echivalent', 'Rol']} rows={[
            [<code>at TIMP</code>, '—', 'creează job-ul (citește comenzile de la tastatură, se încheie cu Ctrl+D)'],
            [<code>atq</code>, <code>at -l</code>, 'listează job-urile în așteptare (ale tale; root le vede pe toate)'],
            [<code>atrm N</code>, <><code>at -r N</code>, <code>at -d N</code></>, 'șterge job-ul cu numărul N'],
            [<code>at -c N</code>, '—', 'afișează conținutul job-ului N (scriptul complet, cu mediul salvat)'],
            [<code>batch</code>, <code>at -b</code>, 'rulează job-ul când încărcarea sistemului permite (load average < 0.8, sau pragul daemonului)'],
          ]} />
          <h4>Cum se scrie timpul pentru at (at(1))</h4>
          <Table head={['Formă', 'Exemplu', 'Înțeles']} rows={[
            ['oră:minut', <code>at 16:30</code>, 'astăzi la 16:30; dacă a trecut deja, mâine'],
            ['cuvinte', <><code>at noon</code>, <code>at midnight</code>, <code>at teatime</code></>, '12:00, 00:00, 16:00'],
            ['AM/PM', <code>at 4pm</code>, '16:00'],
            ['oră + zi', <><code>at 10am tomorrow</code>, <code>at 1am today</code></>, 'mâine la 10:00'],
            ['oră + dată', <><code>at 10am Jul 31</code>, <code>at 09:00 2026-12-24</code></>, 'datele vin DUPĂ oră (formate: month day, MM/DD/YY, DD.MM.YY, YYYY-MM-DD)'],
            ['relativ', <><code>at now + 5 minutes</code>, <code>at 4pm + 3 days</code></>, 'unități: minutes, hours, days, weeks'],
            ['moment trecut', <code>at 08:00 2020-01-01</code>, 'o dată absolută din trecut rulează cât mai curând'],
          ]} />
          <p>
            Controlul accesului este analog cu cron, dar cu <code>/etc/at.allow</code> și <code>/etc/at.deny</code> (<code>at.allow(5)</code>): dacă <code>at.allow</code> există, doar cei listați; altfel toți cei nelistați în <code>at.deny</code> (un <code>at.deny</code> gol = toți au voie); dacă nu există niciunul, doar root. Fără spații în fișiere.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd (L4.9):</b> <code>crond</code> și <code>atd</code> sunt servicii: <code>systemctl enable --now crond</code>, <code>systemctl status atd</code>. Timer-ele systemd (L7.2) sunt alternativa modernă.</li>
            <li><b>Pachete (C2):</b> <code>cronie</code> (cron) și <code>at</code>; <code>dnf install at</code> dacă lipsește.</li>
            <li><b>Redirecționare și script-uri (L1.5, C3):</b> output-ul și erorile unui job se redirecționează; scripturile trebuie să fie executabile (<code>chmod +x</code>, L1.8) și să aibă shebang.</li>
            <li><b>Utilizatori și permisiuni (C9, L1.8):</b> job-ul rulează cu drepturile proprietarului tabelei; <code>crontab -u ana -e</code> (doar root) editează tabela altui utilizator.</li>
            <li><b>Jurnal (L4.7):</b> executările cron și at apar în jurnal (<code>journalctl -u crond</code>, <code>journalctl -u atd</code>); un job de test care apelează <code>logger</code> lasă o urmă ușor de găsit.</li>
            <li><b>Procese (L4.4) și nice (L4.5):</b> un job este un proces ca oricare altul; poți lansa job-uri cu <code>nice</code> în comandă.</li>
            <li><b>SELinux (C10):</b> scripturile executate de cron rulează într-un context propriu (<code>crond_t</code>); nu detaliem în această lecție, dar o politică stricată poate bloca un job.</li>
            <li><b>Timp (L7.3):</b> cron lucrează cu ceasul sistemului: un ceas dezacordat face job-urile să ruleze la oră greșită.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Copii de siguranță nocturne (<code>30 2 * * *</code>), curățare periodică (<code>@daily</code>), rapoarte săptămânale (<code>0 8 * * mon</code>).</li>
            <li>Verificări frecvente de stare (<code>*/5 * * * *</code>) cu scriere într-un fișier de log.</li>
            <li><code>at</code>: repornirea unui serviciu în fereastra de mentenanță de la 03:00; ștergerea unui fișier temporar peste o oră; un memento unic.</li>
            <li>Examen (tipic): „create a cron job for user <code>student</code> that runs <code>/usr/local/bin/x.sh</code> every day at 23:45” sau „schedule <code>…</code> to run at 10:00 tomorrow using at”. Tu trebuie să știi să scrii linia corect, să o salvezi pentru utilizatorul cerut și să arăți că job-ul este în coadă/tabelă.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu comenzile, pe propria mașină de test. Exemplele folosesc utilizatorul <code>student</code> și host-ul <code>server1</code> (fictive). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10; mesajele exacte pot diferi.
        </Callout>

        <h4>1. Verifică și pornește serviciile</h4>
        <CodeBlock title="comenzi" code={`systemctl status crond\nsudo systemctl enable --now crond\nsudo dnf install -y at\nsudo systemctl enable --now atd\nsystemctl is-active crond atd\nsystemctl is-enabled crond atd`} explain={[
          ['systemctl status crond', 'arată dacă serviciul cron rulează (active (running)).'],
          ['systemctl enable --now crond', 'enable = pornește la fiecare boot; --now = pornește și acum.'],
          ['dnf install -y at', 'instalează pachetul at (-y = răspunde „da” automat), dacă lipsește.'],
          ['systemctl enable --now atd', 'același lucru pentru daemonul at.'],
          ['is-active / is-enabled', 'răspund active / enabled; pot primi mai multe unități.'],
        ]} />

        <h4>2. Prima ta tabelă cron, pas cu pas</h4>
        <p>
          Vrem un job de test cu efect <b>observabil</b>: scrie în jurnal un mesaj în fiecare minut. Comanda <code>logger</code> trimite un mesaj în jurnal; <code>-t cronlab</code> pune eticheta (tag) <code>cronlab</code>, ca să-l găsim ușor.
        </p>
        <CodeBlock title="comenzi" code={`crontab -e\n# în editor (vi) adaugă linia de mai jos, apoi salvează și ieși (Esc, :wq)\ncrontab -l\njournalctl -t cronlab --since "10 minutes ago"`} explain={[
          ['crontab -e', '-e = editează tabela ta personală, în editorul din variabila VISUAL sau EDITOR (implicit vi). La ieșire, crontab verifică sintaxa și instalează tabela automat.'],
          ['crontab -l', '-l = listează tabela curentă pe ecran: așa confirmi că a fost salvată.'],
          ['journalctl -t cronlab', '-t = filtrează după etichetă (SYSLOG_IDENTIFIER); --since limitează în timp.'],
        ]} />
        <CodeBlock title="linia adăugată în crontab" kind="config" code={`# test: scrie un mesaj în jurnal în fiecare minut\n* * * * * /usr/bin/logger -t cronlab "salut din cron"`} explain={[
          ['# test: …', 'linie de comentariu (pe linie proprie).'],
          ['* * * * *', 'cele cinci câmpuri: toate valorile → în fiecare minut.'],
          ['/usr/bin/logger', 'comanda, cu cale absolută (verifică locul cu: command -v logger).'],
          ['-t cronlab', 'eticheta mesajului în jurnal.'],
          ['"salut din cron"', 'textul mesajului.'],
        ]} />
        <p className="small">
          După un minut, <code>journalctl -t cronlab</code> arată mesajul. Când ai terminat testul, scoate linia: <code>crontab -e</code> și șterge-o. <b>Atenție:</b> <code>crontab -r</code> șterge <b>întreaga</b> tabelă, <b>fără confirmare</b>; cu <code>-i</code> (<code>crontab -ri</code>) cere confirmare.
        </p>

        <h4>3. Exemple de linii, explicate</h4>
        <CodeBlock title="exemple de crontab" kind="config" code={`MAILTO=""
PATH=/usr/local/bin:/usr/bin:/bin

# în fiecare zi la 02:30
30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# din 15 în 15 minute, în timpul zilei de lucru
*/15 8-17 * * mon-fri /usr/local/bin/verifica.sh

# luni la 07:00 și vineri la 16:00 (două ore diferite → două linii)
0 7 * * mon /usr/local/bin/raport.sh
0 16 * * fri /usr/local/bin/raport.sh

# la fiecare pornire a sistemului
@reboot /usr/local/bin/init-app.sh

# data în numele fișierului: % trebuie escapat
0 1 * * * /usr/bin/cp /etc/hosts /tmp/hosts-$(/usr/bin/date +\\%F)`} explain={[
          ['MAILTO=""', 'nu trimite mail cu output-ul comenzilor din acest crontab.'],
          ['PATH=…', 'definește PATH-ul pentru toate job-urile din tabelă.'],
          ['>> /var/log/backup.log 2>&1', '>> adaugă la fișier; 2>&1 trimite stderr în același loc ca stdout (L1.5).'],
          ['*/15 8-17 * * mon-fri', 'minutele 0, 15, 30, 45; orele 8…17; luni–vineri.'],
          ['@reboot', 'o dată la pornirea daemonului cron (la boot).'],
          ['\\%F', 'în fișier se scrie \\%F; fără backslash, % ar fi luat drept newline.'],
        ]} />

        <h4>4. Tabele de sistem: /etc/cron.d și utilizatorul din linie</h4>
        <CodeBlock title="/etc/cron.d/curatenie" kind="config" code={`# fișier de sistem: are și câmpul UTILIZATOR\n15 3 * * * root /usr/local/bin/curata-tmp.sh`} explain={[
          ['15 3 * * *', 'zilnic la 03:15.'],
          ['root', 'utilizatorul cu care rulează comanda (câmp existent DOAR în /etc/crontab și /etc/cron.d/*).'],
          ['/usr/local/bin/curata-tmp.sh', 'comanda.'],
        ]} />
        <CodeBlock title="comenzi" code={`sudo vi /etc/cron.d/curatenie\nls -l /etc/cron.d\nsudo crontab -u student -l\nsudo crontab -u student -e\nls /etc/cron.daily /etc/cron.hourly`} explain={[
          ['sudo vi /etc/cron.d/curatenie', 'creezi fișierul; permisiunile: proprietar root, nu editabil de alții.'],
          ['crontab -u student -l', '-u = lucrezi pe tabela altui utilizator (doar root); -l = listare.'],
          ['ls /etc/cron.daily', 'scripturile executabile de aici rulează zilnic (prin anacron).'],
        ]} />

        <h4>5. Restricționarea accesului</h4>
        <CodeBlock title="comenzi" code={`echo student | sudo tee -a /etc/cron.deny\nsudo cat /etc/cron.deny\nsudo -u student crontab -l\nsudo sed -i '/^student$/d' /etc/cron.deny`} explain={[
          ['tee -a', '-a = adaugă la sfârșit (nu suprascrie); folosit ca să scrii într-un fișier protejat prin sudo.'],
          ['sudo -u student crontab -l', 'rulează crontab ca student; cu deny activ primești o eroare de tip „not allowed to use this program”.'],
          ['sed -i \'/^student$/d\'', 'șterge linia „student” din fișier (curățenie după test).'],
        ]} />

        <h4>6. at: job unic, pas cu pas</h4>
        <CodeBlock title="comenzi" code={`at now + 2 minutes\n# promptul devine at> ; scrie comanda, apoi Enter, apoi Ctrl+D\n#   at> /usr/bin/logger -t atlab "salut din at"\n#   at> <EOT>\natq\nat -c 1 | tail -5\nsleep 130\njournalctl -t atlab --since "5 minutes ago"`} explain={[
          ['at now + 2 minutes', 'programează un job peste 2 minute; at citește comenzile de la tastatură.'],
          ['at>', 'promptul at; fiecare linie este o comandă; Ctrl+D (pe linie goală) încheie introducerea.'],
          ['atq', 'listează coada: număr job, dată, coadă (a), utilizator.'],
          ['at -c 1', 'afișează scriptul job-ului 1 (la sfârșit se vede comanda ta, înaintea ei variabilele salvate).'],
          ['journalctl -t atlab', 'caută mesajul lăsat de job.'],
        ]} />
        <CodeBlock title="forme scurte" code={`echo '/usr/bin/logger -t atlab "dintr-un pipe"' | at 16:30\nat -f /usr/local/bin/script.sh 10am tomorrow\nat now + 1 hour <<< 'touch /tmp/fisier-at'\natq\natrm 2\nbatch <<< 'sleep 5; touch /tmp/batch-ok'`} explain={[
          ['echo … | at 16:30', 'comanda vine prin pipe (L1.5), nu de la tastatură.'],
          ['at -f fișier timp', '-f = citește job-ul dintr-un fișier.'],
          ['<<< \'…\'', 'here-string Bash: textul devine stdin; alternativă la echo | at.'],
          ['atrm 2', 'șterge job-ul numărul 2 (numărul îl vezi cu atq).'],
          ['batch', 'rulează când load average e sub prag; nu are nevoie de oră.'],
        ]} />
        <p className="small">
          Un job <code>at</code> rulează cu <code>/bin/sh</code> și cu mediul tău de la momentul creării; output-ul (stdout/stderr) se trimite prin mail dacă există sendmail (<code>at(1)</code>); <code>-m</code> trimite mail chiar fără output, <code>-M</code> niciodată. Pentru siguranță redirecționează explicit output-ul în fișier.
        </p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="crontab -l" kind="session" label="illustrative" code={`[student@server1 ~]$ crontab -l\n# test: scrie un mesaj în jurnal în fiecare minut\n* * * * * /usr/bin/logger -t cronlab "salut din cron"`} />
        <p className="small">Afișează exact conținutul tabelei tale. Dacă primești „no crontab for student”, tabela nu există încă (nu e o eroare gravă).</p>
        <CodeBlock title="journalctl -t cronlab" kind="session" label="illustrative" code={`[student@server1 ~]$ journalctl -t cronlab --since "10 minutes ago"\nNov 16 14:01:01 server1 cronlab[2411]: salut din cron\nNov 16 14:02:01 server1 cronlab[2420]: salut din cron\nNov 16 14:03:01 server1 cronlab[2433]: salut din cron`} />
        <p className="small">
          Fiecare linie: data și ora (la secunda <code>01</code>: cron pornește comenzile la începutul minutului), numele mașinii, <code>cronlab[PID]</code> = eticheta ta + numărul procesului (diferit la fiecare rulare), apoi mesajul. Trei linii la 1 minut distanță dovedesc că job-ul rulează periodic.
        </p>
        <CodeBlock title="at, atq, atrm" kind="session" label="illustrative" code={`[student@server1 ~]$ at now + 2 minutes\nat> /usr/bin/logger -t atlab "salut din at"\nat> <EOT>\njob 1 at Mon Nov 16 14:05:00 2026\n[student@server1 ~]$ atq\n1\tMon Nov 16 14:05:00 2026 a student\n[student@server1 ~]$ atrm 1\n[student@server1 ~]$ atq\n[student@server1 ~]$`} />
        <p className="small">
          <code>&lt;EOT&gt;</code> apare după Ctrl+D (end of transmission). <code>job 1 at …</code> confirmă numărul și momentul. Linia din <code>atq</code>: <b>număr</b>, <b>data și ora</b>, <b>coada</b> (<code>a</code> = implicită la <code>at</code>), <b>utilizatorul</b>. După <code>atrm 1</code> coada este goală: <code>atq</code> nu afișează nimic.
        </p>
        <CodeBlock title="eroare de acces" kind="session" label="illustrative" code={`[student@server1 ~]$ crontab -e\nYou (student) are not allowed to use this program (crontab)\nSee crontab(1) for more information`} />
        <p className="small">
          Apare când utilizatorul este în <code>/etc/cron.deny</code> sau nu este în <code>/etc/cron.allow</code> (dacă acesta există). Formularea exactă poate diferi între versiuni. La <code>at</code>, mesajul este analog: „You do not have permission to use at.”.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Serviciile:</b> <code>systemctl is-active crond atd</code> → <code>active</code> pentru fiecare; <code>systemctl is-enabled crond atd</code> → <code>enabled</code>.</li>
            <li><b>Tabela:</b> <code>crontab -l</code> arată linia ta, cu cele 5 câmpuri corecte; <code>sudo crontab -u student -l</code> pentru altă persoană.</li>
            <li><b>Efectul:</b> după momentul programat, un mesaj în jurnal (<code>journalctl -t eticheta</code>), un fișier creat (<code>ls -l /tmp/…</code>), o linie în fișierul de log.</li>
            <li><b>Execuția cron în jurnal:</b> <code>journalctl -u crond --since "15 min ago"</code> arată liniile „(student) CMD (…)”.</li>
            <li><b>at:</b> <code>atq</code> arată job-ul înainte de rulare și îl face să dispară după; <code>at -c N</code> arată comanda.</li>
            <li><b>Verificarea sintaxei unei expresii:</b> la cron nu există un „test de sintaxă” separat; <code>crontab -e</code> refuză salvarea unei linii invalide. Pentru expresii complicate, verifică-ți gândirea cu un exemplu (care sunt primele trei momente?), sau folosește varianta timer (L7.2), unde <code>systemd-analyze calendar</code> face asta.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Tabelele cron stau pe disc (<code>/var/spool/cron/</code>, <code>/etc/cron.d/</code>) și <b>supraviețuiesc reboot-ului</b> pe loc. Cerințele sunt: serviciul <code>crond</code> să fie <b>activat</b> la boot (<code>systemctl enable crond</code>) și linia să fie corectă. Job-urile <code>at</code> aflate în coadă se păstrează în <code>/var/spool/atd</code> și rulează după reboot dacă <code>atd</code> pornește (un job a cărui oră a trecut cât sistemul era oprit rulează, în general, la pornirea daemonului; comportament exact de confirmat). Confirmare manuală: <code>sudo reboot</code>, apoi <code>systemctl is-active crond atd</code>, <code>crontab -l</code> și <code>atq</code>.
          </p>
          <p>
            O capcană de persistență: ce <b>nu</b> trebuie să crezi că persistă: variabilele tale de shell (de ex. <code>export X=1</code> în terminal) nu există în job-urile cron; trebuie scrise în crontab sau în script. În schimb, pentru <code>at</code> variabilele din sesiune <i>sunt</i> salvate în job.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Job-ul nu rulează deloc', <>serviciul <code>crond</code> oprit, sau linie invalidă</>, <><code>systemctl status crond</code>, <code>journalctl -u crond</code></>, <><code>systemctl enable --now crond</code>; corectează linia</>],
          ['Merge în terminal, nu din cron', <>comandă fără cale absolută / <code>PATH</code> redus; variabile lipsă</>, <><code>command -v comanda</code>; adaugă <code>&gt;&gt; log 2&gt;&amp;1</code> și citește log-ul</>, 'cale absolută sau PATH în crontab'],
          [<>Comanda cu <code>date +%F</code> eșuează</>, <><code>%</code> neescapat</>, 'citește jurnalul / log-ul', <>scrie <code>\%</code></>],
          ['Rulează prea des / prea rar', 'confuzie în câmpuri sau la regula zi-lună/zi-săptămână (SAU)', 'rescrie expresia pe hârtie, listează primele 3 momente', 'corectează câmpurile'],
          ['Nu primești output', 'nu există mail local sau MAILTO gol', <><code>echo $MAILTO</code> în crontab; log propriu</>, 'redirecționează în fișier'],
          [<><code>not allowed to use this program</code></>, <><code>cron.allow</code>/<code>cron.deny</code></>, <><code>cat /etc/cron.allow /etc/cron.deny</code></>, 'corectează fișierele (root)'],
          [<><code>at</code>: <code>command not found</code></>, 'pachetul at lipsește', <code>rpm -q at</code>, <><code>dnf install at</code>; <code>systemctl enable --now atd</code></>],
          ['Job at în coadă, dar nu rulează', <><code>atd</code> oprit</>, <><code>systemctl status atd</code>, <code>atq</code></>, <><code>systemctl enable --now atd</code></>],
          ['Linie corectă, dar nimic după editare în fișierul /var/spool/cron direct', 'editare de mână în loc de crontab -e', <code>crontab -l</code>, <>folosește <code>crontab -e</code></>],
          ['Tabela dispare', <><code>crontab -r</code> executat (fără confirmare)</>, <code>crontab -l</code>, <>refă din copie; folosește <code>crontab -ri</code> și păstrează copii</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți calea absolută a comenzii/scriptului; în cron <code>PATH</code> este redus.</>,
          <>Uiți <code>chmod +x</code> pe script (L1.8) sau shebang-ul (<code>#!/bin/bash</code>, L3.1).</>,
          <>Pui <code>%</code> neescapat în comandă (<code>date +%F</code>).</>,
          <>Scrii un câmp de utilizator într-un crontab personal (<code>30 2 * * * root comanda</code> în <code>crontab -e</code>): <code>root</code> ar fi luat drept prima parte a comenzii. Invers, uiți utilizatorul într-un fișier din <code>/etc/cron.d</code>.</>,
          <>Câmpurile în ordinea greșită (oră înaintea minutului): <code>2 30 * * *</code> înseamnă „minutul 2, ora 30”, iar ora 30 nu există, deci linia este respinsă; pentru 02:30 scrie <code>30 2 * * *</code>. Ține minte „minut, oră, zi, lună, ziua săptămânii”.</>,
          <>Crezi că <code>*/35</code> înseamnă „la 35 de minute”.</>,
          <>Crezi că zi-lună și zi-săptămână se combină cu ȘI: se combină cu SAU când ambele sunt restricționate.</>,
          <>Execuți <code>crontab -r</code> în loc de <code>crontab -e</code> (tastele sunt vecine): tabela dispare fără întrebare.</>,
          <>Editezi direct <code>/var/spool/cron/…</code> în loc de <code>crontab -e</code>.</>,
          <>La <code>at</code>: uiți Ctrl+D la sfârșit (job-ul nu se creează), sau uiți să pornești <code>atd</code>.</>,
          <>Pui data înaintea orei la <code>at</code> (<code>at 2026-12-24 09:00</code> nu e forma documentată; corect: <code>at 09:00 2026-12-24</code>).</>,
          <>Uiți <code>enable</code>: job-urile nu rulează după reboot dacă <code>crond</code> nu e activat.</>,
          <>Crezi că <code>at.deny</code> se verifică și când <code>at.allow</code> există: nu, dacă <code>at.allow</code> există, doar el contează.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: anacron, mail, UTC/DST, securitate">
        <p>
          <b>De ce 02:30 poate fi o oră proastă:</b> la trecerea la ora de vară/iarnă (DST), conform <code>crontab(5)</code>, job-urile din orele „sărite” nu rulează, iar cele din orele repetate rulează de două ori. De aceea administratorii evită intervalul 02:00–03:00 în zone cu DST, sau rulează serverele în UTC.
        </p>
        <p>
          <b>Anacron vs cron:</b> cron este „exact și nemilos”: dacă mașina e oprită la ora job-ului, rularea se pierde. Anacron ține minte <i>când a rulat ultima dată fiecare job</i> (în fișiere de marcaj) și, la pornire, rulează ce a fost ratat (după <code>delay</code> minute). Este instrumentul laptopurilor și stațiilor. Pentru cazul echivalent cu timere: <code>Persistent=true</code> (L7.2).
        </p>
        <p>
          <b>Mail:</b> output-ul job-urilor este trimis prin <code>sendmail</code> local. Cron are opțiuni (<code>-s</code>: ieșirea în syslog; <code>-m off</code>: fără mail) — <code>cron(8)</code>. În mediile moderne se redirecționează output-ul în fișiere sau în jurnal (<code>| logger -t …</code>).
        </p>
        <p>
          <b>Injecție de linii:</b> fiindcă cron execută comenzi ca utilizatorul proprietar, un fișier în <code>/etc/cron.d</code> modificabil de alții (permisiuni greșite) este o breșă gravă: cron ignoră tabelele cu permisiuni nepotrivite (nu trebuie să fie executabile și nici scriibile de alții; <code>crontab(5)</code>).
        </p>
        <p>
          <b>at și mediul salvat:</b> <code>at -c N</code> arată că scriptul salvat începe cu o mulțime de linii <code>export …</code> (mediul tău) și <code>cd</code> în directorul curent, apoi comanda ta. Variabile ca <code>LD_PRELOAD</code> nu se păstrează din motive de securitate (<code>at(1)</code>, binarul este setuid).
        </p>
        <p>
          <b>Cozi at:</b> opțiunea <code>-q</code> alege coada (a–z); cozile cu litere mai mari rulează cu prioritate (nice) mai mică; o literă mare = tratată ca <code>batch</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const L7_1: TopicModule = {
  id: 'L7.1',
  subtitle: 'cron și at: crontab -e/-l/-r, 5 câmpuri, /etc/cron.d, cron.allow/deny; at, atq, atrm, batch',
  studyTime: '≈110 min studiu + laboratoare',
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
  labs: [LAB_L7_1_CRON, LAB_L7_1_AT],
  sources: [
    { kind: 'man', ref: 'crontab(5), crontab(1) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'at(1), at.allow(5), cron(8), anacrontab(5) — man.archlinux.org, citite 2026-11-16 (variante upstream; pe RHEL 10 pot diferi)' },
    { kind: 'doc', ref: 'RHEL 10 — documentația despre automatizarea task-urilor: docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
