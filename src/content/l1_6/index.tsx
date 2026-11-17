import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_6 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="grep">grep</G> afișează liniile unui text care se potrivesc cu un <b>tipar</b>. Tiparul poate fi un cuvânt simplu sau o <G id="regex">expresie regulată</G> (<code>^</code>, <code>$</code>, <code>.</code>, <code>*</code>, <code>[ ]</code>…).
            Folosit direct pe fișiere sau ca filtru într-un pipe (L1.5), este unealta de bază pentru a găsi o linie într-un fișier de configurare sau într-un log și pentru a număra, exclude sau contextualiza rezultate.
          </p>
          <p>Obiectivul oficial: <i>„Use grep and regular expressions to analyze text”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Fișierele de pe un sistem Linux sunt mari și numeroase (<code>/etc</code>, logurile din <code>/var/log</code>, ieșirea unor comenzi). Să le citești cu ochii este lent și predispus la greșeli.
            <code>grep</code> răspunde la întrebarea „care linii conțin …?”, iar expresiile regulate îți permit să descrii <i>forma</i> textului căutat (de exemplu „o linie care începe cu un utilizator și se termină cu <code>/bin/bash</code>”), nu doar un text exact.
          </p>
          <Analogy>căutarea într-un dosar cu foi: <code>grep cuvânt</code> înseamnă „scoate foile care conțin cuvântul”. O expresie regulată este un „sablon” transparent pe care îl pui peste foaie: se vede doar ce se potrivește cu forma decupată.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Linie cu linie</h4>
          <p>
            <code>grep</code> citește intrarea (fișierele date ca argumente sau <code>stdin</code>) <b>linie cu linie</b>, testează fiecare linie față de tipar și afișează linia întreagă dacă se potrivește. Nu modifică niciodată fișierul.
            Exit status-ul spune ce s-a întâmplat: <b>0</b> = cel puțin o linie găsită, <b>1</b> = nicio linie, <b>2</b> = eroare (de exemplu fișier inexistent). Astfel poți folosi <code>grep</code> în condiții și scripturi (C3), chiar fără să afișezi nimic (<code>-q</code>).
          </p>
          <h4>Citarea tiparului</h4>
          <p>
            Înainte ca <code>grep</code> să pornească, shell-ul procesează linia (L1.1). Caractere ca <code>*</code>, <code>?</code>, <code>$</code>, <code>|</code>, <code>(</code> au sens pentru shell. De aceea tiparul se pune <b>între apostrofuri</b>: <code>grep 'root.*bash' /etc/passwd</code>. Altfel, shell-ul poate expanda tiparul în nume de fișiere sau îl poate rupe în bucăți.
          </p>
          <h4>Metacaractere (BRE implicit)</h4>
          <Table head={['Element', 'Semnificație', 'Exemplu', 'Se potrivește cu']} rows={[
            [<code>.</code>, 'orice caracter (unul)', <code>r..t</code>, 'root, rest, r12t'],
            [<code>*</code>, 'zero sau mai multe repetări ale elementului precedent', <code>ab*c</code>, 'ac, abc, abbbc'],
            [<code>^</code>, 'începutul liniei', <code>^root</code>, 'linii care încep cu root'],
            [<code>$</code>, 'sfârșitul liniei', <code>bash$</code>, 'linii care se termină cu bash'],
            [<code>[abc]</code>, 'un caracter din mulțime', <code>[Rr]oot</code>, 'Root, root'],
            [<code>[^abc]</code>, 'un caracter care NU e în mulțime', <code>[^0-9]</code>, 'orice în afară de cifre'],
            [<code>[a-z]</code>, 'interval', <code>[0-9]</code>, 'o cifră'],
            [<code>[[:digit:]]</code>, 'clasă POSIX (paranteze duble)', <code>[[:upper:]]</code>, 'o literă mare'],
            [<code>\</code>, 'anulează sensul special', <code>10\.0</code>, 'exact „10.0” (punctul literal)'],
            [<><code>\&lt;</code> / <code>\&gt;</code></>, 'început / sfârșit de cuvânt', <code>\&lt;root\&gt;</code>, 'cuvântul root, nu „rootfs”'],
          ]} />
          <h4>BRE versus ERE</h4>
          <p>
            Implicit <code>grep</code> folosește expresii regulate <b>de bază</b> (BRE), în care <code>+</code>, <code>?</code>, <code>|</code>, <code>(</code>, <code>)</code> sunt caractere obișnuite; extensiile GNU le activează cu backslash (<code>\+</code>, <code>\?</code>, <code>\|</code>). Cu <code>grep -E</code> (<G id="bre-ere">ERE</G>) aceleași simboluri sunt speciale direct, ceea ce face expresiile mai lizibile.
          </p>
          <Table head={['Vrei…', 'BRE (implicit)', 'ERE (grep -E)']} rows={[
            ['sau', <code>{'a\\|b'}</code>, <code>a|b</code>],
            ['unul sau mai multe', <code>{'a\\+'}</code>, <code>a+</code>],
            ['opțional', <code>{'a\\?'}</code>, <code>a?</code>],
            ['grup', <code>{'\\(ab\\)'}</code>, <code>(ab)</code>],
            ['interval de repetări', <code>{'a\\{2,3\\}'}</code>, <code>{'a{2,3}'}</code>],
          ]} />
          <p>
            <code>grep -F</code> dezactivează complet interpretarea: tiparul este un șir fix (util când cauți text cu multe puncte sau paranteze). Formele <code>egrep</code> și <code>fgrep</code> sunt învechite; folosește <code>grep -E</code> și <code>grep -F</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Pipe și redirecționare</b> (L1.5): <code>comandă | grep tipar</code> filtrează ieșirea; <code>grep tipar fișier &gt; rezultate.txt</code> salvează rezultatul; erorile (de ex. „Permission denied” la <code>grep -r</code>) sunt pe stderr: <code>2&gt;/dev/null</code>.</li>
            <li><b>Shell</b> (L1.1): citarea tiparelor; expandarea <code>*</code> înaintea lui <code>grep</code> când tiparul nu e citat.</li>
            <li><b>Documentația</b> (L1.2): <code>man grep</code> are secțiunea completă de expresii regulate; <code>man -k</code> și <code>apropos</code> folosesc și ele tipare.</li>
            <li><b>Permisiuni</b> (L1.8): pe fișiere ilizibile <code>grep</code> raportează „Permission denied”; unele loguri se citesc doar cu <code>sudo</code>.</li>
            <li><b>Loguri și servicii</b> (C4): <code>journalctl | grep eroare</code>, <code>grep -i denied /var/log/audit/audit.log</code> (SELinux, C10).</li>
            <li><b>Conturi</b> (C9): <code>grep '^student:' /etc/passwd</code> arată contul fără a-l deschide cu editorul.</li>
            <li><b>Scripturi</b> (C3): exit status-ul lui <code>grep</code> intră în <code>if</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Găsești o setare într-un fișier de configurare mare, fără comentarii: <code>grep -v '^#' fișier | grep -v '^$'</code>.</li>
            <li>Cauți în ce fișier se află o linie: <code>grep -rn 'text' /etc 2&gt;/dev/null</code>.</li>
            <li>Numeri apariții: <code>grep -c</code>; vezi context în loguri: <code>grep -C 2</code>.</li>
            <li>Confirmi rapid o modificare (verificare după editare, L1.4) fără să deschizi editorul.</li>
            <li>La examen: verifici că o linie a ajuns în fișier, afli ce utilizatori au un anumit shell, găsești un parametru într-un fișier lung.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile din lecție sunt <b>Ilustrative</b>; conținutul fișierelor din <code>/etc</code> diferă de la un sistem la altul.
        </Callout>

        <h4>Căutări de bază și opțiuni uzuale</h4>
        <CodeBlock title="comenzi" code={`grep root /etc/passwd\ngrep -i ROOT /etc/passwd\ngrep -v nologin /etc/passwd\ngrep -n bash /etc/passwd\ngrep -c bash /etc/passwd\ngrep -w sys /etc/passwd\ngrep -x 'root' lista.txt\ngrep -o 'bash' /etc/passwd`} explain={[
          ['grep root /etc/passwd', 'afișează liniile care conțin „root” (în orice poziție).'],
          ['-i', '--ignore-case: ignoră diferența dintre litere mari și mici.'],
          ['-v', '--invert-match: afișează liniile care NU se potrivesc.'],
          ['-n', '--line-number: prefixează fiecare linie cu numărul ei.'],
          ['-c', '--count: afișează doar câte linii se potrivesc (nu liniile).'],
          ['-w', '--word-regexp: potrivire doar pe cuvinte întregi (sys, nu „systemd”).'],
          ['-x', '--line-regexp: întreaga linie trebuie să se potrivească cu tiparul.'],
          ['-o', '--only-matching: afișează doar partea care se potrivește, câte una pe linie.'],
        ]} />

        <h4>Context, mai multe fișiere, recursiv</h4>
        <CodeBlock title="comenzi" code={`grep -A 2 'PermitRootLogin' /etc/ssh/sshd_config\ngrep -B 1 -A 1 Error /var/log/messages\ngrep -C 2 sudo /etc/group\ngrep -l root /etc/passwd /etc/group /etc/hosts\ngrep -r 'PermitRootLogin' /etc/ssh 2>/dev/null\ngrep -rn --include='*.conf' 'nameserver' /etc 2>/dev/null\ngrep -rL 'ceva' /etc/ssh 2>/dev/null\ngrep -h root /etc/passwd /etc/group`} explain={[
          ['-A N / -B N / -C N', 'după / înainte / în jurul fiecărei potriviri: afișează N linii de context (After, Before, Context).'],
          ['-l', '--files-with-matches: afișează doar numele fișierelor care conțin o potrivire; -L = cele care NU conțin.'],
          ['-r', '--recursive: caută în toate fișierele din director și subdirectoare; cu -R urmărești și link-urile simbolice.'],
          ['--include=\'*.conf\'', 'limitează căutarea recursivă la fișierele al căror nume se potrivește (citat, ca shell-ul să nu-l expandeze). Opusul: --exclude.'],
          ['-h / -H', 'ascunde / afișează numele fișierului în fața liniilor (implicit apare când sunt mai multe fișiere).'],
          ['2>/dev/null', 'aruncă mesajele de eroare (L1.5), de exemplu „Permission denied”.'],
        ]} />

        <h4>Ancore, clase și repetări</h4>
        <CodeBlock title="comenzi" code={`grep '^root' /etc/passwd\ngrep 'bash$' /etc/passwd\ngrep '^$' fisier.txt\ngrep -v '^#' /etc/ssh/sshd_config\ngrep -v -e '^#' -e '^$' /etc/ssh/sshd_config\ngrep '[[:digit:]]' fisier.txt\ngrep '^[A-Z]' fisier.txt\ngrep 'r..t' /etc/passwd\ngrep 'ab*c' fisier.txt\ngrep '10\\.0\\.0\\.1' fisier.txt`} explain={[
          ['^root', 'linii care încep cu „root”.'],
          ['bash$', 'linii care se termină cu „bash”.'],
          ['^$', 'linii goale (începutul urmat imediat de sfârșit).'],
          ['-v \'^#\'', 'exclude liniile-comentariu (cele care încep cu #).'],
          ['-e tipar', 'permite mai multe tipare într-o singură comandă (o linie se afișează dacă se potrivește cu oricare); necesar și când tiparul începe cu -.'],
          ['[[:digit:]]', 'clasă POSIX: orice cifră (paranteza exterioară este a mulțimii).'],
          ['^[A-Z]', 'linii care încep cu o literă mare (intervalul poate depinde de locale; clasa [[:upper:]] este mai sigură).'],
          ['r..t / ab*c', 'punctul = orice caracter; * se aplică elementului precedent (b).'],
          ['10\\.0\\.0\\.1', 'fiecare punct este scăpat cu \\ ca să fie literal (altfel „.” ar fi orice caracter).'],
        ]} />

        <h4>ERE, șiruri fixe, intrare din pipe</h4>
        <CodeBlock title="comenzi" code={`grep -E 'root|student' /etc/passwd\ngrep -E '^(root|bin):' /etc/passwd\ngrep -E '[0-9]{3,}' fisier.txt\ngrep -F '10.0.0.1' fisier.txt\nps aux | grep sshd\nls /etc | grep -i '^net'\ngrep -q '^student:' /etc/passwd && echo exista\ngrep -f modele.txt /etc/passwd`} explain={[
          ['-E', '--extended-regexp: ERE; | = sau, ( ) = grup, + ? { } active fără backslash.'],
          ['-F', '--fixed-strings: tiparul e un șir literal; punctele nu sunt metacaractere.'],
          ['ps aux | grep sshd', 'filtrezi ieșirea altei comenzi (stdin). Apare adesea și linia procesului grep însuși.'],
          ['-q', '--quiet: nu afișează nimic; contează doar exit status-ul (0 dacă găsește).'],
          ['-f modele.txt', 'citește tiparele din fișier, câte unul pe linie.'],
        ]} />

        <h4>Exit status și analiza rezultatelor</h4>
        <CodeBlock title="comenzi" code={`grep root /etc/passwd; echo $?\ngrep nuexista /etc/passwd; echo $?\ngrep root /fisier-lipsa; echo $?\ncut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn\ngrep -c '' /etc/passwd`} explain={[
          ['echo $?', 'afișează exit status-ul ultimei comenzi: 0 găsit, 1 negăsit, 2 eroare.'],
          ['… | sort | uniq -c | sort -rn', 'numără aparițiile (uniq -c) și le ordonează descrescător (sort -rn: numeric, invers) — „top” de valori.'],
          ['-c \'\'', 'tiparul gol se potrivește cu orice linie; deci -c numără toate liniile.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Linii cu număr" kind="session" label="illustrative" code={`[student@server1 ~]$ grep -n bash /etc/passwd\n1:root:x:0:0:root:/root:/bin/bash\n42:student:x:1000:1000:student:/home/student:/bin/bash`} />
        <ul>
          <li>Fiecare linie începe cu numărul ei din fișier (<code>-n</code>), apoi <code>:</code>.</li>
          <li>Se afișează liniile întregi care conțin „bash” oriunde; numerele și conturile depind de sistem.</li>
        </ul>

        <CodeBlock title="Ancore" kind="session" label="illustrative" code={`[student@server1 ~]$ grep '^root' /etc/passwd\nroot:x:0:0:root:/root:/bin/bash\n[student@server1 ~]$ grep 'nologin$' /etc/passwd | head -n 2\nbin:x:1:1:bin:/bin:/usr/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/usr/sbin/nologin`} />
        <p className="small"><code>^root</code> nu s-a potrivit cu linii în care „root” apare în interior (de exemplu în calea <code>/root</code>); <code>nologin$</code> a ales doar liniile care se termină astfel.</p>

        <CodeBlock title="Context și fișiere multiple" kind="session" label="illustrative" code={`[student@server1 ~]$ grep -A 1 'PermitRootLogin' /etc/ssh/sshd_config\n#PermitRootLogin prohibit-password\n#StrictModes yes\n[student@server1 ~]$ grep -l root /etc/passwd /etc/group /etc/hosts\n/etc/passwd\n/etc/group`} />
        <p className="small">Primul bloc: linia potrivită plus linia următoare (<code>-A 1</code>). Al doilea: doar numele fișierelor care conțin potrivirea (<code>-l</code>). Conținutul fișierelor diferă pe sistemul tău.</p>

        <CodeBlock title="Exit status" kind="session" label="illustrative" code={`[student@server1 ~]$ grep root /etc/passwd > /dev/null; echo $?\n0\n[student@server1 ~]$ grep nuexista /etc/passwd; echo $?\n1\n[student@server1 ~]$ grep root /fisier-lipsa; echo $?\ngrep: /fisier-lipsa: No such file or directory\n2`} />
        <p className="small">0 = găsit, 1 = nicio potrivire (nu este o eroare de execuție), 2 = eroare (fișier inexistent).</p>

        <CodeBlock title="grep în pipe: apare și grep" kind="session" label="illustrative" code={`[student@server1 ~]$ ps aux | grep sshd\nroot         812  0.0  0.1  ...  /usr/sbin/sshd -D\nstudent     4021  0.0  0.0  ...  grep --color=auto sshd`} />
        <p className="small">Ultima linie este procesul <code>grep</code> însuși, a cărui linie de comandă conține „sshd”. Coloanele sunt abreviate aici; valorile diferă.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Verifică tiparul pe un text mic, cunoscut, înainte de a-l aplica pe un fișier mare: <code>echo 'ab abc' | grep -o 'ab*'</code>.</li>
            <li>Folosește <code>-n</code> și <code>-c</code> ca să confirmi câte și unde sunt potrivirile; <code>--color=auto</code> (adesea deja activ prin alias) evidențiază partea potrivită.</li>
            <li>Dacă nu primești nimic, verifică exit status-ul: <code>1</code> = tiparul nu se potrivește; <code>2</code> = problemă cu fișierul sau cu tiparul.</li>
            <li>Dacă rezultatul pare incomplet, schimbă temporar tiparul în ceva mai general (<code>-i</code>, fără ancore) și restrânge treptat.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <code>grep</code> nu modifică nimic și nu are stare: nu există persistență de configurat. Rezultatele salvate cu <code>&gt;</code> rămân în fișiere (L1.5). Opțiunile pe care ți le dorești implicit (de exemplu <code>--color=auto</code>) pot fi puse ca <code>alias</code> în <code>~/.bashrc</code>; un alias făcut doar în terminal dispare la ieșirea din sesiune. Pe sistemele RHEL, un alias de culoare pentru <code>grep</code> poate exista deja, definit prin profilul shell-ului (de confirmat pe RHEL 10).
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Nu afișează nimic', 'tiparul nu se potrivește (litere mari/mici, spații, ancore greșite)', <><code>echo $?</code> (1 = negăsit)</>, <>încearcă <code>-i</code>, elimină ancorele, verifică textul real cu <code>cat -A</code></>],
          [<code>grep: fișier: Permission denied</code>, 'nu ai drept de citire (frecvent la grep -r)', <code>ls -l</code>, <><code>sudo grep …</code> sau <code>2&gt;/dev/null</code> dacă erorile sunt zgomot</>],
          ['Rezultate prea multe sau inclusiv linia procesului grep', 'tipar prea general; grep apare în ps', '—', <>folosește <code>-w</code>, ancore sau tiparul <code>'[s]shd'</code> (nu se potrivește cu propria linie)</>],
          ['`+`, `|`, `?` par să nu funcționeze', 'ești în BRE (implicit)', '—', <>folosește <code>grep -E</code> sau scapă cu <code>\</code></>],
          ['Punctul potrivește prea mult', '„.” este metacaracter', '—', <>scapă-l (<code>\.</code>) sau folosește <code>-F</code></>],
          ['Tiparul e interpretat de shell (apare eroare, sau rezultate ciudate)', 'tipar necitat cu *, $, |, (', <><code>echo</code> tiparul</>, 'pune tiparul între apostrofuri'],
          [<code>Binary file … matches</code>, 'fișierul conține date binare', <code>file fișier</code>, <><code>grep -a</code> sau caută în fișierul text corect</>],
          [<><code>grep -r</code> foarte lent sau în afara scopului</>, 'caută în directoare mari (/ sau /proc)', '—', <>restrânge directorul și folosește <code>--include</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți apostrofurile: <code>grep a.*b fișier</code> lasă shell-ul să expandeze <code>*</code> ca nume de fișiere.</>,
          <>Confunzi tiparul de <b>shell</b> (<code>*.txt</code>, glob) cu cel de <b>regex</b> (<code>.*</code>): în regex, <code>*</code> repetă elementul precedent, nu înseamnă „orice”.</>,
          <>Crezi că <code>grep root</code> cu <code>^</code> sau fără este același lucru: <code>^root</code> doar la început de linie.</>,
          <>Scrii <code>grep -v '^#' fișier</code> și uiți că liniile cu spații înaintea lui <code>#</code> nu sunt excluse.</>,
          <>Folosești <code>+</code>, <code>|</code>, <code>?</code>, <code>{'{ }'}</code> fără <code>-E</code>.</>,
          <>Cauți un punct literal fără să-l scapi (<code>1.2.3</code> se potrivește cu <code>1a2b3</code>).</>,
          <>Interpretezi „nu găsește” ca eroare: exit status 1 înseamnă doar lipsa potrivirilor.</>,
          <>Uiți <code>-r</code> și <code>grep text /director</code> răspunde că este director.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: motoare regex, greedy și backreferences">
        <p>
          Expresiile regulate POSIX folosesc „cea mai lungă potrivire” (<i>greedy</i>): în <code>a.*b</code> aplicat pe <code>a1b2b</code>, partea potrivită este <code>a1b2b</code> (până la ultimul <code>b</code>). Cu <code>-o</code> vezi exact ce parte a fost selectată.
        </p>
        <p>
          GNU grep acceptă și <i>backreferences</i> (<code>{'\\(ab\\)\\1'}</code> în BRE; <code>(ab)\1</code> în ERE) care potrivesc de două ori același text capturat — de exemplu cuvinte repetate. Mai există <code>-P</code> (expresii compatibile Perl), dar disponibilitatea ei depinde de modul în care a fost compilat grep și nu este necesară pentru obiectivul EX200.
        </p>
        <p>
          Sintaxa tiparelor din <code>grep</code> este aceeași (cu mici diferențe) cu cea din <code>sed</code> (<code>s/tipar/înlocuire/</code>) și din <code>vim</code> (<code>:%s/…/…/</code>, L1.4): ce înveți aici se reutilizează.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_6: TopicModule = {
  id: 'L1.6',
  subtitle: 'grep, opțiuni uzuale și expresii regulate (BRE/ERE)',
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
  labs: [LAB_L1_6],
  sources: [
    { kind: 'man', ref: 'grep(1); manualul GNU grep (info grep): Regular Expressions, Exit Status' },
    { kind: 'man', ref: 'regex(7)' },
    { kind: 'man', ref: 'bash(1): Quoting, Pathname Expansion; sort(1), uniq(1), cut(1)' },
    { kind: 'doc', ref: 'Documentația RHEL 10 (docs.redhat.com) — de verificat la review versiunea grep și aliasurile implicite' },
  ],
};
