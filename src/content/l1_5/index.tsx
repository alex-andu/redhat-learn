import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_5 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Fiecare comandă are trei canale standard: <G id="stdin">intrare</G> (0), <G id="stdout">ieșire</G> (1) și <G id="stderr">eroare</G> (2). Implicit sunt legate de terminal.
            Cu <b>redirecționări</b> (<code>&gt;</code>, <code>&gt;&gt;</code>, <code>&lt;</code>, <code>2&gt;</code>, <code>2&gt;&amp;1</code>) le legi de fișiere; cu <b>pipe</b> (<code>|</code>) legi ieșirea unei comenzi de intrarea alteia.
            Din comenzi mici, specializate, construiești rezolvări mari.
          </p>
          <p>Obiectivul oficial: <i>„Use input-output redirection (&gt;, &gt;&gt;, |, 2&gt;, etc.)”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Filosofia Unix: programe mici care fac un singur lucru bine și care pot fi combinate. Pentru ca ele să se combine, trebuie să aibă o „priză” standard: citesc de pe stdin și scriu pe stdout.
            Atunci poți schimba, fără a modifica programele, de unde vin datele (tastatură, fișier, altă comandă) și unde ajung (ecran, fișier, altă comandă).
          </p>
          <Analogy>instalație cu țevi: stdout este țeava de apă curată, stderr este țeava separată pentru apa murdară. Poți direcționa fiecare țeavă într-un recipient (fișier) sau în robinetul următor (pipe). Dacă le unești, apa curată și cea murdară se amestecă.</Analogy>
          <p>
            <b>De ce stderr separat?</b> Dacă salvezi rezultatul unei comenzi într-un fișier, nu vrei ca mesajele de eroare să se amestece cu datele. Iar dacă vrei să vezi erorile pe ecran în timp ce datele merg într-un fișier, un canal separat face asta posibil.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Descriptori de fișier</h4>
          <p>
            Fiecare proces are o tabelă de <G id="file-descriptor">descriptori de fișier</G>. La pornire, 0, 1 și 2 indică terminalul. O redirecționare înseamnă că shell-ul, <b>înainte</b> de a porni comanda, deschide fișierul și îl pune în locul descriptorului respectiv.
            Comanda nu știe că a fost redirecționată: scrie pe „descriptorul 1” ca întotdeauna.
          </p>
          <Table head={['Operator', 'Efect', 'Atenție']} rows={[
            [<code>cmd &gt; f</code>, 'stdout în f; creează f sau îl GOLEȘTE', 'f este trunchiat înainte ca cmd să ruleze'],
            [<code>cmd &gt;&gt; f</code>, 'stdout adăugat la sfârșitul lui f', 'creează f dacă nu există'],
            [<code>cmd &lt; f</code>, 'stdin din f', 'comanda nu primește numele fișierului'],
            [<code>cmd 2&gt; f</code>, 'doar stderr în f', 'stdout rămâne pe terminal'],
            [<code>cmd 2&gt;&gt; f</code>, 'stderr adăugat în f', ''],
            [<code>cmd &gt; f 2&gt;&amp;1</code>, 'stdout în f, apoi stderr acolo unde e stdout (tot f)', 'ordinea contează'],
            [<code>cmd &amp;&gt; f</code>, 'bash: stdout și stderr în f (scurtătură pentru forma de mai sus)', 'specific bash, nu POSIX sh'],
            [<code>cmd &gt; /dev/null</code>, 'aruncă stdout', ''],
            [<code>cmd 2&gt; /dev/null</code>, 'aruncă stderr', 'ascunde erorile, nu le rezolvă'],
            [<code>c1 | c2</code>, 'stdout-ul lui c1 devine stdin-ul lui c2', 'stderr NU trece prin pipe'],
          ]} />
          <h4>Ordinea redirecționărilor contează</h4>
          <p>
            Shell-ul le procesează de la stânga la dreapta. <code>2&gt;&amp;1</code> înseamnă „fă din descriptorul 2 o copie a <i>locului în care indică acum</i> descriptorul 1”.
          </p>
          <ul>
            <li><code>cmd &gt; f 2&gt;&amp;1</code> — întâi 1 → f; apoi 2 copiază 1 (adică f). <b>Ambele în f.</b></li>
            <li><code>cmd 2&gt;&amp;1 &gt; f</code> — întâi 2 copiază 1 (terminalul); apoi 1 → f. <b>Erorile rămân pe terminal.</b></li>
          </ul>
          <h4>Pipe</h4>
          <p>
            <code>c1 | c2</code>: shell-ul creează un canal în memorie, pornește ambele comenzi în același timp și conectează stdout-ul lui c1 la stdin-ul lui c2. Datele curg pe măsură ce se produc; nu se creează fișier intermediar.
            Dacă vrei și stderr în pipe, folosești <code>c1 2&gt;&amp;1 | c2</code> (bash acceptă și <code>c1 |&amp; c2</code>).
            Exit status-ul unui pipeline este, implicit, cel al <b>ultimei</b> comenzi; <code>set -o pipefail</code> îl schimbă, dar este o setare de scripting (C3).
          </p>
          <h4>Truncarea înainte de execuție</h4>
          <p>
            Fiindcă <code>&gt; f</code> golește fișierul înainte de rulare, <code>sort f &gt; f</code> nu sortează „pe loc”: <code>sort</code> citește un fișier deja gol, iar rezultatul este un fișier gol.
            Se folosește un fișier intermediar (<code>sort f &gt; f.nou &amp;&amp; mv f.nou f</code>) sau <code>sort -o f f</code> (opțiunea -o a lui sort scrie corect peste intrare).
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Shell</b> (L1.1): redirecționările și pipe-urile sunt funcții ale shell-ului, nu ale comenzilor. De aceea funcționează la fel cu orice program.</li>
            <li><b>Permisiuni</b> (L1.8): redirecționarea scrie cu drepturile <i>shell-ului tău</i>. <code>sudo echo x &gt; /etc/fișier</code> eșuează: <code>sudo</code> se aplică doar lui <code>echo</code>, iar fișierul este deschis de shell-ul tău obișnuit. Remediere: <code>echo x | sudo tee /etc/fișier</code> (L9.4).</li>
            <li><b>grep</b> (L1.6): filtrul natural dintr-un pipe (<code>... | grep text</code>).</li>
            <li><b>Scripturi</b> (C3): redirecționările controlează unde merg mesajele și erorile unui script; codurile de ieșire ale pipeline-urilor contează în condiții.</li>
            <li><b>Loguri și servicii</b> (C4): <code>journalctl | less</code>, <code>systemctl status ... | head</code>; stderr-ul serviciilor merge în journal.</li>
            <li><b>Dispozitive</b>: <code>/dev/null</code>, <code>/dev/zero</code> sunt fișiere speciale; le folosești ca surse/destinații în redirecționări.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Salvezi un rezultat ca dovadă sau pentru a-l prelucra: <code>comandă &gt; rezultat.txt</code>.</li>
            <li>Adaugi linii la un fișier fără să-l suprascrii: <code>&gt;&gt;</code>.</li>
            <li>Separi datele de erori și le analizezi pe fiecare: <code>&gt; out 2&gt; err</code>.</li>
            <li>Elimini zgomotul (erori așteptate): <code>find / -name x 2&gt;/dev/null</code>.</li>
            <li>Construiești o interogare din piese: <code>cut</code> → <code>sort</code> → <code>uniq</code> → <code>head</code>.</li>
            <li>La examen: scrii rapid un fișier (<code>echo ... &gt;&gt; fișier</code>, <code>cat &gt; fișier &lt;&lt;EOF</code>) și îți capturezi output-ul pentru a-l verifica.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le într-un director de test (<code>~/lab15</code>). Output-urile sunt <b>Ilustrative</b>; ordinea liniilor de pe stdout și stderr într-un terminal nu este garantată.
        </Callout>

        <h4>Redirecționări de bază</h4>
        <CodeBlock title="comenzi" code={`ls /etc/hostname /nu-exista > out.txt 2> err.txt\ncat out.txt\ncat err.txt\necho prima > f.txt\necho a doua >> f.txt\necho a treia > f.txt\ncat f.txt\nwc -l /etc/passwd\nwc -l < /etc/passwd`} explain={[
          ['> out.txt', 'stdout în out.txt (creat sau golit).'],
          ['2> err.txt', 'stderr în err.txt.'],
          ['>> f.txt', 'adaugă la sfârșit.'],
          ['echo a treia > f.txt', 'goleste f.txt și scrie „a treia”: rămâne o singură linie.'],
          ['wc -l', '-l (--lines): numără liniile; cu fișier ca argument afișează și numele; cu `<` primește datele pe stdin și afișează doar numărul.'],
        ]} />

        <h4>Ambele canale</h4>
        <CodeBlock title="comenzi" code={`ls /etc/hostname /nu-exista > all.txt 2>&1\nls /etc/hostname /nu-exista &> all2.txt\nls /etc/hostname /nu-exista 2>&1 > all3.txt\nls /nu-exista 2> /dev/null\nfind /etc -name "*.conf" 2> /dev/null | wc -l`} explain={[
          ['> all.txt 2>&1', 'stdout în fișier, apoi stderr în același loc. Forma portabilă.'],
          ['&> all2.txt', 'scurtătura bash pentru forma de mai sus; `&>>` adaugă.'],
          ['2>&1 > all3.txt', 'ordinea inversă: erorile merg la terminal (unde era stdout), apoi stdout merge în fișier.'],
          ['2> /dev/null', 'aruncă erorile.'],
          ['find /etc -name "*.conf"', 'caută după nume; tiparul se citează ca shell-ul să nu-l expandeze (L1.6 pentru grep/regex).'],
        ]} />

        <h4>Pipe-uri și filtre uzuale</h4>
        <CodeBlock title="comenzi" code={`cut -d: -f1 /etc/passwd | sort | head -n 5\ncut -d: -f7 /etc/passwd | sort | uniq -c\nls -l /etc | wc -l\nls /etc | tail -n 3\ncut -d: -f1 /etc/passwd | sort | tee utilizatori.txt | wc -l\necho "linie noua" | tee -a f.txt`} explain={[
          ['cut -d: -f1', '-d: delimitator „:”; -f1 primul câmp (în /etc/passwd = numele de utilizator).'],
          ['sort', 'sortează liniile; -r invers, -n numeric, -u elimină duplicatele.'],
          ['uniq -c', 'colapsează liniile identice ADIACENTE și le numără (-c); de aceea se pune după sort.'],
          ['head -n 5 / tail -n 3', 'primele 5 / ultimele 3 linii (implicit 10).'],
          ['tee fișier', 'copiază stdin în stdout și în fișier (sau -a pentru adăugare).'],
        ]} />

        <h4>Here document și stdin interactiv</h4>
        <CodeBlock title="comenzi" code={`cat > note.txt <<'EOF'\nPrima linie\nA doua linie cu $HOME literal\nEOF\ncat note.txt\ncat >> note.txt\n# (scrii text, apoi Ctrl+D; linia aceasta nu se tastează)\n: > f.txt`} explain={[
          ['cat > note.txt <<\'EOF\'', 'trimite liniile următoare (până la EOF singur pe linie) la cat, care le scrie în fișier. Apostrofurile din jurul lui EOF opresc expandarea variabilelor.'],
          ['cat >> note.txt', 'fără argumente, cat citește de la tastatură; Ctrl+D (sfârșit de intrare) încheie.'],
          [': > f.txt', ':, comandă care nu face nimic, plus > : golește fișierul f.txt.'],
        ]} />

        <h4>Fișiere protejate: tee cu sudo</h4>
        <CodeBlock title="comenzi" code={`echo "text" | sudo tee /etc/exemplu.conf\necho "alt text" | sudo tee -a /etc/exemplu.conf\nsudo sh -c 'echo "text" > /etc/exemplu.conf'`} explain={[
          ['| sudo tee FIȘIER', 'tee rulează cu privilegii și deschide el fișierul; stdout al lui tee afișează textul pe ecran (adaugă `> /dev/null` dacă nu vrei).'],
          ['tee -a', 'adaugă (append) în loc să suprascrie.'],
          ['sudo sh -c \'...\'', 'rulează un shell cu privilegii, deci redirecționarea din interior are drepturi.'],
        ]} />
        <Callout kind="warn" title="sudo echo ... > fișier nu funcționează">
          În <code>sudo echo x &gt; /etc/exemplu.conf</code>, redirecționarea o face shell-ul tău, ca utilizator obișnuit, <i>înainte</i> de a porni <code>sudo</code>. Rezultatul: „Permission denied”.
        </Callout>

        <h4>noclobber (protecție împotriva suprascrierii)</h4>
        <CodeBlock title="comenzi" code={`set -o noclobber\necho x > f.txt\necho x >| f.txt\nset +o noclobber`} explain={[
          ['set -o noclobber', 'bash refuză să suprascrie un fișier existent cu `>`.'],
          ['>|', 'forțează suprascrierea chiar și cu noclobber activ.'],
          ['set +o noclobber', 'dezactivează protecția (valabilă doar în sesiunea curentă).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="stdout și stderr separate" kind="session" label="illustrative" code={`[student@server1 lab15]$ ls /etc/hostname /nu-exista > out.txt 2> err.txt\n[student@server1 lab15]$ cat out.txt\n/etc/hostname\n[student@server1 lab15]$ cat err.txt\nls: cannot access '/nu-exista': No such file or directory`} />
        <ul>
          <li>Comanda n-a afișat nimic pe ecran: ambele canale au mers în fișiere.</li>
          <li><code>out.txt</code> conține rezultatul reușit; <code>err.txt</code> conține eroarea. Primul argument există, al doilea nu.</li>
        </ul>

        <CodeBlock title="Ordinea contează" kind="session" label="illustrative" code={`[student@server1 lab15]$ ls /etc/hostname /nu-exista > a.txt 2>&1\n[student@server1 lab15]$ cat a.txt\nls: cannot access '/nu-exista': No such file or directory\n/etc/hostname\n[student@server1 lab15]$ ls /etc/hostname /nu-exista 2>&1 > b.txt\nls: cannot access '/nu-exista': No such file or directory\n[student@server1 lab15]$ cat b.txt\n/etc/hostname`} />
        <ul>
          <li>Prima formă: ambele în <code>a.txt</code> (aici eroarea apare prima fiindcă stderr nu e tamponat; ordinea în alte cazuri poate diferi).</li>
          <li>A doua formă: eroarea apare pe terminal, doar stdout a ajuns în <code>b.txt</code>.</li>
        </ul>

        <CodeBlock title="wc cu argument vs cu stdin" kind="session" label="illustrative" code={`[student@server1 ~]$ wc -l /etc/passwd\n45 /etc/passwd\n[student@server1 ~]$ wc -l < /etc/passwd\n45`} />
        <p className="small">Numărul (45) este exemplificativ. Diferența: cu argument, <code>wc</code> își cunoaște fișierul și îi afișează numele; cu <code>&lt;</code>, primește doar un flux de date, fără nume.</p>

        <CodeBlock title="Pipeline" kind="session" label="illustrative" code={`[student@server1 ~]$ cut -d: -f1 /etc/passwd | sort | head -n 3\nadm\nbin\ndaemon`} />
        <p className="small">Cele trei comenzi lucrează în lanț: <code>cut</code> extrage numele de utilizator, <code>sort</code> le ordonează, <code>head</code> le păstrează pe primele trei. Numele afișate depind de utilizatorii existenți pe sistem.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>După o redirecționare, verifică fișierul: <code>cat f</code>, <code>wc -l f</code>, <code>ls -l f</code> (dimensiune zero = gol).</li>
            <li>Dacă ai folosit <code>&gt;</code>, întreabă-te: <i>ce conținea fișierul înainte?</i> A fost suprascris.</li>
            <li>Pentru pipeline: rulează-l pe bucăți, adăugând câte o comandă; vezi la fiecare pas ce iese.</li>
            <li><code>echo $?</code> după un pipeline reflectă ultima comandă (implicit), nu neapărat cea care a eșuat. Verifică și rezultatul.</li>
            <li><code>echo ${'{PIPESTATUS[@]}'}</code> (bash) afișează exit status-ul fiecărei comenzi din ultimul pipeline.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierele create prin redirecționare sunt scrise pe disc și persistă după reboot. Ce <b>nu</b> persistă: opțiunile de shell setate cu <code>set -o noclobber</code> (doar sesiunea curentă; pentru permanență intră în <code>~/.bashrc</code>).
            Atenție la fișierele de configurare scrise prin redirecționare: după modificare, un serviciu poate cere reîncărcare/restart (C4), iar un fișier de sistem editat cu <code>tee</code> poate avea alt proprietar/context decât cel original.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Permission denied</code>, 'destinația cere privilegii; redirecționarea rulează ca tine', <><code>ls -ld</code> pe fișier/director</>, <>folosește <code>| sudo tee</code></>],
          ['fișierul a rămas gol după `sort f > f`', 'f a fost trunchiat înainte de sort', <code>ls -l f</code>, <>restaurează din backup; folosește <code>sort -o f f</code> sau fișier intermediar</>],
          ['erorile apar pe ecran deși ai pus `> f`', 'stderr nu a fost redirecționat', '—', <>adaugă <code>2&gt;&amp;1</code> (după <code>&gt; f</code>) sau <code>&amp;&gt;</code></>],
          ['`cannot overwrite existing file`', 'noclobber este activ', <code>set -o | grep noclobber</code>, <>folosește <code>&gt;|</code> sau <code>set +o noclobber</code></>],
          ['`uniq -c` nu grupează', 'liniile identice nu sunt adiacente', '—', <>pune <code>sort</code> înaintea lui <code>uniq</code></>],
          ['pipeline-ul „reușește” deși o parte a eșuat', 'exit status = ultima comandă', <code>{'echo ${PIPESTATUS[@]}'}</code>, 'verifică fiecare componentă; setarea pipefail (C3)'],
          ['linie goală sau text în plus la sfârșit (here-doc)', 'marcaj EOF cu spații sau fără linie proprie', 'verifică marcajul', 'EOF trebuie singur pe linie, fără spații'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <><code>&gt;</code> în loc de <code>&gt;&gt;</code>: suprascrii un fișier de configurare existent. Dacă scopul este „adaugă”, folosește <code>&gt;&gt;</code>.</>,
          <>Ordinea <code>2&gt;&amp;1 &gt; f</code> în loc de <code>&gt; f 2&gt;&amp;1</code>.</>,
          <><code>sudo echo ... &gt; /etc/...</code>: eșuează; folosește <code>tee</code>.</>,
          <><code>comandă &gt; f</code> unde <code>f</code> este și intrarea comenzii.</>,
          <>Confuzia dintre <code>|</code> (comandă → comandă) și <code>&gt;</code> (comandă → fișier): <code>ls | out.txt</code> încearcă să ruleze o comandă numită <code>out.txt</code>.</>,
          <>Presupunerea că <code>|</code> transportă și erorile.</>,
          <><code>uniq</code> fără <code>sort</code>.</>,
          <>În sarcini de examen: salvezi un rezultat „în fișierul X” și uiți calea completă sau cu ce drepturi se scrie.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: cum implementează shell-ul redirecționările și pipe-urile">
        <p>
          La pornirea unei comenzi externe, shell-ul face <code>fork()</code> (un proces copil), iar în copil, înainte de <code>exec()</code>, aplică redirecționările în ordinea de la stânga la dreapta: deschide fișierele și folosește <code>dup2()</code> pentru a le pune pe descriptorii 0/1/2.
          <code>2&gt;&amp;1</code> înseamnă literal <code>dup2(1, 2)</code>; de aceea ordinea contează: copiază ce indică descriptorul 1 <i>în acel moment</i>.
        </p>
        <p>
          Pentru <code>c1 | c2</code>, shell-ul apelează <code>pipe()</code> (creează două capete: citire și scriere), pornește două procese și conectează capetele la descriptorii 1 (al lui c1) și 0 (al lui c2).
          Canalul are un tampon finit: dacă c2 citește lent, c1 se blochează la scriere (backpressure). Dacă c2 se termină devreme (de exemplu <code>head</code>), c1 primește semnalul <code>SIGPIPE</code> la următoarea scriere și, de obicei, se oprește; de aceea <code>comandă-lungă | head</code> se încheie repede.
        </p>
        <p>
          <b>stdout tamponat.</b> Când stdout nu este un terminal (fișier sau pipe), multe programe scriu în blocuri mari, nu linie cu linie; stderr rămâne, de regulă, netamponat. Din acest motiv, într-un fișier comun, mesajele de eroare pot apărea înaintea datelor produse mai devreme. Este un comportament al programelor, nu o greșeală a redirecționării.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_5: TopicModule = {
  id: 'L1.5',
  subtitle: 'stdin, stdout, stderr: >, >>, <, 2>, 2>&1, | și tee',
  studyTime: '≈60 min studiu + laborator',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când îl folosim', code: '5' },
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
  labs: [LAB_L1_5],
  sources: [
    { kind: 'man', ref: 'bash(1): REDIRECTION (Redirecting Input/Output, Appending, Duplicating File Descriptors, Here Documents), Pipelines, noclobber în SHELL BUILTIN COMMANDS (set)' },
    { kind: 'man', ref: 'tee(1), wc(1), sort(1), uniq(1), head(1), tail(1), cut(1), find(1)' },
    { kind: 'man', ref: 'null(4)' },
    { kind: 'doc', ref: 'GNU Coreutils manual (info coreutils) — de verificat la review' },
  ],
};
