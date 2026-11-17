import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L3_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <code>if</code> rulează o comandă-condiție și, dacă aceasta se termină cu <G id="exit-status">cod 0</G>, execută blocul <code>then</code>; altfel (opțional) blocul <code>else</code>. Cel mai des condiția este <code>[ ... ]</code> (sinonim cu <code>test</code>), care compară numere, șiruri și verifică fișiere:
            <code>if [ -f /etc/passwd ]; then echo da; fi</code>. Pui mereu spații în jurul parantezelor și ghilimele în jurul variabilelor.
          </p>
          <p>Obiectivul oficial: <i>„Conditionally execute code (use of: if, test, [], etc.)”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Fără decizii, un script este o listă fixă de comenzi. Cu <G id="shell-test">teste</G> poți spune „dacă fișierul există, copiază-l; altfel afișează o eroare”, „dacă ești root, continuă; altfel oprește-te”, „dacă ai primit argument…”. Condițiile fac scriptul sigur (nu suprascrie, nu continuă după o eroare) și util în situații variate.
          </p>
          <Analogy>Un semafor: dacă lumina este verde, treci; altfel aștepți. Testul <code>[ ]</code> este „privitul la semafor”; <code>if</code> este regula „în funcție de ce vezi, fă una sau alta”.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4><code>if</code> rulează o COMANDĂ</h4>
          <p>
            În shell, <code>if</code> nu evaluează „expresii” ca în alte limbaje: <b>rulează o comandă</b> și se uită la codul ei de ieșire (L3.1). Cod 0 → ramura <code>then</code>; cod nenul → <code>elif</code>/<code>else</code>. Poți pune în <code>if</code> orice comandă:
            <code>if grep -q root /etc/passwd; then …</code> (grep întoarce 0 dacă a găsit).
          </p>
          <h4><code>[</code> este o comandă</h4>
          <p>
            <code>[</code> este o comandă internă, sinonimă cu <code>test</code>; argumentul ei final trebuie să fie <code>]</code>. De aceea sunt <b>obligatorii spațiile</b>: <code>[ -f fișier ]</code> înseamnă „comanda <code>[</code> cu argumentele <code>-f</code>, <code>fișier</code>, <code>]</code>”. <code>[-f fișier]</code> ar căuta o comandă numită <code>[-f</code>.
            Comanda întoarce 0 dacă testul este adevărat, 1 dacă este fals.
          </p>
          <h4>Operatorii de test</h4>
          <Table head={['Categorie', 'Operator', 'Adevărat dacă…']} rows={[
            ['fișier', <code>-e F</code>, 'F există (orice tip)'],
            ['fișier', <code>-f F</code>, 'F există și este fișier obișnuit'],
            ['fișier', <code>-d F</code>, 'F există și este director'],
            ['fișier', <code>-r F, -w F, -x F</code>, 'F este citibil / scriibil / executabil (pentru utilizatorul curent)'],
            ['fișier', <code>-s F</code>, 'F există și are dimensiune mai mare ca zero'],
            ['fișier', <code>-L F</code>, 'F este link simbolic (L1.7)'],
            ['șir', <code>-z S / -n S</code>, 'S are lungime zero / nenulă'],
            ['șir', <code>S1 = S2, S1 != S2</code>, 'șirurile sunt egale / diferite'],
            ['număr întreg', <code>A -eq B / -ne</code>, 'egal / diferit'],
            ['număr întreg', <code>A -lt B / -le</code>, 'mai mic / mai mic sau egal'],
            ['număr întreg', <code>A -gt B / -ge</code>, 'mai mare / mai mare sau egal'],
            ['logic', <code>! EXPR</code>, 'negare'],
          ]} />
          <p className="small">Lista corespunde GNU Bash Reference Manual, „Bash Conditional Expressions” (citit 2026-11-16).</p>
          <h4>Număr vs șir</h4>
          <p>
            Pentru numere se folosesc <code>-eq -lt …</code>; <code>=</code> compară <b>text</b>. <code>[ 10 = 10.0 ]</code> este fals (șiruri diferite), iar <code>[ 10 -eq 10 ]</code> adevărat. Cu <code>-eq</code> pe text primești eroarea <code>integer expression expected</code>.
          </p>
          <h4>Alte forme</h4>
          <ul>
            <li><code>[[ ... ]]</code>: variantă bash, mai tolerantă (nu face word splitting pe variabile, acceptă <code>&amp;&amp;</code> și <code>||</code> înăuntru, în dreapta lui <code>==</code> acceptă tipare). Este specifică bash, nu POSIX.</li>
            <li><code>&amp;&amp;</code> și <code>||</code> între comenzi: <code>A &amp;&amp; B</code> rulează B doar dacă A a reușit (0); <code>A || B</code> rulează B doar dacă A a eșuat.</li>
            <li><code>case</code>: alegere între mai multe tipare (vezi mai jos).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Cod de ieșire</b> (L3.1): condiția este un cod de ieșire; poți testa orice comandă.</li>
            <li><b>Parametri</b> (L3.2): <code>[ $# -lt 1 ]</code>, <code>[ -z "$1" ]</code>.</li>
            <li><b>Permisiuni</b> (L1.8): <code>-r -w -x</code> reflectă ce poate face utilizatorul curent.</li>
            <li><b>grep</b> (L1.6): <code>grep -q</code> (quiet) este util în <code>if</code>: nu afișează nimic, doar întoarce 0/1.</li>
            <li><b>Utilizatori</b> (L1.10): <code>id -u</code> întoarce 0 pentru root: <code>[ "$(id -u)" -ne 0 ]</code>.</li>
            <li><b>Bucle</b> (L3.4) și <b>output de comenzi</b> (L3.5): se combină cu condiții.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Verifici existența unui fișier înainte să-l folosești.</li>
            <li>Ceri drepturi de root: „scriptul trebuie rulat cu sudo”.</li>
            <li>Validezi argumentele primite.</li>
            <li>Ai un comportament diferit în funcție de o valoare (<code>case</code>).</li>
            <li>La examen: „scriptul afișează «există» dacă fișierul există și «lipsește» altfel”, „scriptul compară două numere”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Structura de bază</h4>
        <CodeBlock title="sintaxă" code={`if COMANDĂ; then\n  # comenzi dacă COMANDĂ a reușit (cod 0)\nelif ALTĂ_COMANDĂ; then\n  # comenzi dacă prima a eșuat, iar a doua a reușit\nelse\n  # comenzi dacă nici una nu a reușit\nfi`} explain={[
          ['if … then', 'then poate fi pe aceeași linie după ; sau pe linia următoare.'],
          ['elif', '„else if”: o a doua condiție, evaluată doar dacă prima a eșuat. Poți avea mai multe.'],
          ['else', 'ramura implicită; opțională.'],
          ['fi', 'închide blocul (if scris invers). Obligatoriu.'],
        ]} />

        <h4>2. Teste pe fișiere</h4>
        <CodeBlock title="fisier.sh" code={`#!/bin/bash\nf="/etc/hostname"\nif [ -e "$f" ]; then\n  echo "$f există"\nelse\n  echo "$f lipsește"\nfi\n\nif [ -d /tmp ]; then echo "/tmp este director"; fi\nif [ -f /etc/passwd ] && [ -r /etc/passwd ]; then echo "passwd: fișier citibil"; fi\nif [ ! -s /tmp/gol.txt ]; then echo "gol.txt este gol sau nu există"; fi`} explain={[
          ['f="/etc/hostname"', 'variabilă cu calea; fără spații în jurul lui =.'],
          ['[ -e "$f" ]', 'testează existența; "$f" între ghilimele, ca să meargă și cu spații în nume.'],
          ['[ -d /tmp ]; then …; fi', 'forma pe o singură linie: ; separă condiția de then și comanda de fi.'],
          ['[ -f … ] && [ -r … ]', 'două teste legate cu && : ambele trebuie să fie adevărate.'],
          ['[ ! -s FIȘIER ]', '! neagă testul; -s = există și nu e gol. Deci „gol sau inexistent”.'],
        ]} />

        <h4>3. Teste pe șiruri și numere</h4>
        <CodeBlock title="valori.sh" code={`#!/bin/bash\nnume="$1"\nnr="$2"\n\nif [ -z "$nume" ]; then\n  echo "Lipsește numele"\n  exit 1\nfi\n\nif [ "$nume" = "root" ]; then\n  echo "Este root"\nelif [ "$nume" != "student" ]; then\n  echo "Nume necunoscut: $nume"\nelse\n  echo "Salut, student"\nfi\n\nif [ "$nr" -gt 10 ]; then\n  echo "$nr este mai mare ca 10"\nelif [ "$nr" -eq 10 ]; then\n  echo "$nr este egal cu 10"\nelse\n  echo "$nr este mai mic ca 10"\nfi`} explain={[
          ['[ -z "$nume" ]', '-z: șirul este gol. Ghilimelele sunt esențiale: fără ele, un $nume gol ar face testul invalid.'],
          ['[ "$nume" = "root" ]', 'egalitate de ȘIRURI: un singur = , cu spații în jur.'],
          ['!=', 'șirurile sunt diferite.'],
          ['-gt, -eq', 'comparații de NUMERE întregi. Dacă "$nr" nu e număr, apare eroarea „integer expression expected”.'],
        ]} />

        <h4>4. Testul rulat direct în terminal: <code>test</code>, <code>[</code> și <code>$?</code></h4>
        <CodeBlock title="comenzi" code={`test -f /etc/passwd; echo $?\n[ -f /etc/passwd ]; echo $?\n[ -d /etc/passwd ]; echo $?\n[ 5 -gt 3 ]; echo $?\n[ "abc" = "abd" ]; echo $?\n[ -z "" ]; echo $?`} explain={[
          ['test -f /etc/passwd', 'identic cu [ -f /etc/passwd ]. Nu afișează nimic; rezultatul este doar codul de ieșire.'],
          ['; echo $?', 'afișează codul: 0 = adevărat, 1 = fals.'],
          ['[ -d /etc/passwd ]', '/etc/passwd este fișier, nu director → fals (1).'],
          ['[ 5 -gt 3 ]', '5 este mai mare ca 3 → adevărat (0).'],
        ]} />

        <h4>5. Operatori logici</h4>
        <CodeBlock title="logice.sh" code={`#!/bin/bash\nif [ "$(id -u)" -ne 0 ]; then\n  echo "Rulează ca root (sudo)." >&2\n  exit 1\nfi\n\nif [ -d /etc ] && [ -r /etc/passwd ]; then echo "ambele adevărate"; fi\nif [ "$1" = "a" ] || [ "$1" = "b" ]; then echo "a sau b"; fi\n\ngrep -q '^student:' /etc/passwd && echo "utilizatorul există"\ngrep -q '^nimeni-nu:' /etc/passwd || echo "utilizatorul nu există"`} explain={[
          ['"$(id -u)"', 'id -u afișează UID-ul numeric; $( ) înlocuiește comanda cu rezultatul (L3.5). Root are UID 0.'],
          ['-ne 0', 'diferit de 0 → nu ești root.'],
          ['&&', 'și: a doua comandă rulează doar dacă prima a avut cod 0.'],
          ['||', 'sau: a doua rulează doar dacă prima a avut cod nenul.'],
          ['grep -q', 'quiet: nu afișează nimic, doar întoarce 0 (găsit) sau 1 (negăsit). Perfect pentru if.'],
        ]} />

        <h4>6. <code>[[ ]]</code> și <code>case</code></h4>
        <CodeBlock title="avansat.sh" code={`#!/bin/bash\nfisier="$1"\nif [[ $fisier == *.txt ]]; then\n  echo "fișier text"\nfi\n\ncase "$1" in\n  start)        echo "pornesc" ;;\n  stop|halt)    echo "opresc" ;;\n  *)            echo "Folosire: $0 start|stop" >&2; exit 1 ;;\nesac`} explain={[
          ['[[ $fisier == *.txt ]]', 'în [[ ]], dreapta lui == este un TIPAR (glob): potrivește orice nume terminat în .txt. Variabila nu mai trebuie pusă între ghilimele pentru a evita word splitting, dar este bine să te obișnuiești cu ele.'],
          ['case "$1" in', 'compară valoarea cu tipare, de sus în jos.'],
          ['start)', 'tiparul; ) îl încheie.'],
          ['stop|halt)', '| = „sau” între tipare.'],
          ['*)', 'tiparul care potrivește orice: ramura implicită.'],
          [';;', 'încheie ramura; fără el, bash dă eroare de sintaxă.'],
          ['esac', 'închide case (case scris invers).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="teste în terminal" kind="session" label="illustrative" code={`[student@server1 ~]$ [ -f /etc/passwd ]; echo $?\n0\n[student@server1 ~]$ [ -d /etc/passwd ]; echo $?\n1\n[student@server1 ~]$ [ 5 -gt 3 ]; echo $?\n0\n[student@server1 ~]$ [ "abc" = "abd" ]; echo $?\n1`} />
        <p className="small">
          Testele nu scriu nimic pe ecran: răspunsul este codul de ieșire. <code>0</code> = adevărat, <code>1</code> = fals. <code>/etc/passwd</code> este fișier (deci <code>-f</code> da, <code>-d</code> nu).
        </p>
        <CodeBlock title="valori.sh" kind="session" label="illustrative" code={`[student@server1 ~]$ ./valori.sh student 10\nSalut, student\n10 este egal cu 10\n[student@server1 ~]$ ./valori.sh\nLipsește numele\n[student@server1 ~]$ ./valori.sh ana abc\nNume necunoscut: ana\n./valori.sh: line 19: [: abc: integer expression expected\n./valori.sh: line 21: [: abc: integer expression expected\nabc este mai mic ca 10`} />
        <p className="small">
          Primul apel traversează ramurile corespunzătoare. Al doilea nu are argument: <code>-z</code> prinde situația și scriptul iese. Al treilea arată o eroare tipică: <code>abc</code> nu este număr, iar <code>-gt</code>/<code>-eq</code> cer numere întregi. Cele două teste eșuate sunt tratate ca „false”, deci scriptul ajunge la <code>else</code> și afirmă greșit că <code>abc</code> este „mai mic ca 10”. Numerele de linie și formularea exactă a mesajului sunt orientative (depind de versiunea bash). Ideea: <b>text în loc de număr</b> produce <code>integer expression expected</code>, iar scriptul continuă cu un rezultat înșelător dacă nu validezi.
        </p>
        <CodeBlock title="[ fără spații" kind="session" label="illustrative" code={`[student@server1 ~]$ [-f /etc/passwd]\nbash: [-f: command not found\n[student@server1 ~]$ [ -f /etc/passwd ]\n[student@server1 ~]$ echo $?\n0`} />
        <p className="small">Fără spațiu după <code>[</code>, bash caută o comandă numită <code>[-f</code>. Cu spații, testul funcționează (și, fiind tăcut, nu afișează nimic).</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Rulează scriptul pe <b>fiecare ramură</b>: un caz adevărat, unul fals, unul cu argument lipsă.</li>
            <li>Testează condiția izolat în terminal: <code>[ -f fișier ]; echo $?</code>.</li>
            <li><code>bash -x script.sh</code> arată ce expandează testul (<code>+ '[' -f /etc/passwd ']'</code>).</li>
            <li><code>bash -n script.sh</code>: verifică dacă fiecare <code>if</code> are <code>fi</code>, fiecare <code>case</code> are <code>esac</code>.</li>
            <li>Verifică <code>echo $?</code> după script: codurile alese de tine în ramuri.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Scriptul și permisiunile persistă după reboot. Condițiile se evaluează la fiecare rulare, pe starea de atunci a sistemului (un fișier care există azi poate lipsi mâine); asta este tocmai scopul. Confirmare manuală după reboot: rulează scriptul și verifică ramura așteptată.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>[-f: command not found</code>, 'lipsesc spațiile în jurul parantezelor', 'recitește linia', <>scrie <code>[ -f fișier ]</code></>],
          [<code>[: missing `]'</code>, 'lipsește ] sau spațiul dinaintea lui', <code>bash -n script.sh</code>, 'adaugă spațiu și ]'],
          [<code>[: =: unary operator expected</code>, 'variabilă goală, fără ghilimele', <code>bash -x script.sh</code>, <>pune <code>"$var"</code></>],
          [<code>[: too many arguments</code>, 'variabilă cu spații, fără ghilimele', <code>bash -x script.sh</code>, <>pune <code>"$var"</code></>],
          [<code>integer expression expected</code>, 'ai folosit -eq/-gt pe text', 'verifică valoarea variabilei', <>validează sau folosește <code>=</code> pentru text</>],
          [<code>syntax error near unexpected token 'fi'</code>, <>lipsește <code>then</code> sau ; înainte de then</>, <code>bash -n script.sh</code>, <>completează <code>; then</code></>],
          [<code>syntax error: unexpected end of file</code>, <>lipsește <code>fi</code>/<code>esac</code>/<code>done</code></>, <code>bash -n script.sh</code>, 'închide blocul'],
          ['ramura „else” rulează mereu', <>compari numere cu <code>=</code> sau ai greșit operatorul</>, 'testează expresia cu echo $?', 'folosește operatorul potrivit'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Spații lipsă: <code>[$x -eq 1]</code>. Testul are nevoie de spațiu după <code>[</code> și înainte de <code>]</code>.</>,
          <>Variabile fără ghilimele în teste: <code>[ $x = a ]</code> cu <code>x</code> gol → eroare.</>,
          <>Compari numere cu <code>=</code> sau text cu <code>-eq</code>.</>,
          <>Uiți <code>then</code>, <code>fi</code>, <code>;;</code> sau <code>esac</code>.</>,
          <>Crezi că 0 este „fals”: în <code>if</code>, codul 0 înseamnă adevărat.</>,
          <>Scrii <code>if [ $x == 5 ]</code> pe <code>sh</code> (POSIX): <code>=</code> este portabil; <code>==</code> merge în bash.</>,
          <>Confunzi <code>-e</code> (există) cu <code>-f</code> (fișier obișnuit) sau <code>-d</code> (director).</>,
          <>Uiți că testele <code>-r -w -x</code> reflectă utilizatorul care rulează scriptul; root poate trece teste care ar eșua pentru altcineva.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: test vs [ vs [[, parantezele (( )) și evaluare scurtă">
        <p>
          <code>test</code> și <code>[</code> există ca builtin-uri bash, dar și ca programe separate (<code>/usr/bin/test</code>, <code>/usr/bin/[</code>), conform specificației POSIX. Pe sisteme cu <code>sh</code> minimal, doar ele sunt garantate. <code>[[ ]]</code> este o <i>construcție de limbaj</i> (cuvânt rezervat), nu o comandă; de aceea analizează expresia înainte de expansiuni și poate evita word splitting.
        </p>
        <p>
          Pentru aritmetică, bash oferă <code>(( a &gt; 3 ))</code>: întoarce 0 dacă expresia este nenulă. Este mai lizibil pentru numere decât <code>-gt</code>, dar este specific bash.
        </p>
        <p>
          <code>A &amp;&amp; B || C</code> nu este un „if-then-else” perfect: dacă A reușește, dar B eșuează, se rulează și C. Pentru decizii cu efecte, preferă <code>if … else</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const L3_3: TopicModule = {
  id: 'L3.3',
  subtitle: 'if/elif/else, test și [ ], teste pe fișiere/șiruri/numere, &&, ||, case',
  studyTime: '≈75 min studiu + laborator',
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
  labs: [LAB_L3_3],
  sources: [
    { kind: 'upstream', ref: 'GNU Bash Reference Manual — „Bash Conditional Expressions” https://www.gnu.org/software/bash/manual/html_node/Bash-Conditional-Expressions.html (citit 2026-11-16)' },
    { kind: 'man', ref: 'bash(1) — SHELL GRAMMAR, CONDITIONAL EXPRESSIONS; test(1)' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com necitit (HTTP 403 în C2); de confirmat la review' },
  ],
};
