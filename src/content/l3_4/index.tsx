import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L3_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            O <G id="for-loop">buclă for</G> repetă un bloc de comenzi pentru fiecare element dintr-o listă: <code>for x in a b c; do echo "$x"; done</code>. Lista poate fi cuvinte scrise de mână, fișiere (<code>*.txt</code>), un interval (<code>{'{1..5}'}</code>), argumentele scriptului (<code>"$@"</code>) sau rezultatul unei comenzi (<code>$(…)</code>).
            Pentru a citi un fișier rând cu rând folosești <code>while read -r linie; do …; done &lt; fișier</code>.
          </p>
          <p>Obiectivul oficial: <i>„Use Looping constructs (for, etc.) to process file, command line input”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Dacă ai de creat cinci utilizatori sau de redenumit o sută de fișiere, nu scrii comanda de 100 de ori. O bucla o scrie o dată și o aplică fiecărui element. Este diferența dintre „fac ceva” și „fac ceva pentru fiecare”.
          </p>
          <Analogy>Un cartofor la bandă: îi vine un șir de cartofi, iar el îi curăță pe rând cu aceeași mișcare. Lista este banda, corpul buclei este mișcarea, variabila buclei este „cartoful din mână”.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Pașii unei bucle <code>for</code></h4>
          <ol>
            <li>Bash <b>expandează lista</b> înainte de prima iterație (glob, acolade, <code>$( )</code>, variabile) și obține un șir de cuvinte.</li>
            <li>Pentru fiecare cuvânt: îl pune în variabila buclei și rulează corpul (între <code>do</code> și <code>done</code>).</li>
            <li>Când lista se termină, bucla se încheie; scriptul continuă cu linia de după <code>done</code>.</li>
            <li>Dacă lista este goală, corpul nu rulează deloc, iar statusul buclei este 0 (GNU Bash Manual, „Looping Constructs”, citit 2026-11-16).</li>
          </ol>
          <h4>Ce poate conține lista</h4>
          <Table head={['Formă', 'Exemplu', 'Elemente']} rows={[
            ['cuvinte', <code>for u in ana bogdan carmen</code>, 'ana, bogdan, carmen'],
            ['glob (L1.3)', <code>for f in *.txt</code>, 'fișierele .txt din directorul curent'],
            ['interval cu acolade', <code>for i in {'{1..5}'}</code>, '1 2 3 4 5'],
            ['argumentele scriptului', <code>for a in "$@"</code>, 'fiecare argument (L3.2)'],
            ['lipsă „in”', <code>for a; do</code>, 'echivalent cu in "$@"'],
            ['rezultat de comandă', <code>for u in $(cut -d: -f1 lista.txt)</code>, 'cuvintele din output (atenție la spații)'],
          ]} />
          <h4>Alte bucle</h4>
          <ul>
            <li><b>C-style:</b> <code>for ((i=1; i&lt;=5; i++)); do …; done</code>: contor aritmetic.</li>
            <li><b><G id="while-loop">while</G>:</b> repetă cât timp comanda-test are cod 0. Folosită pentru <b>citire de fișier rând cu rând</b>.</li>
            <li><b>until:</b> repetă cât timp comanda-test are cod nenul.</li>
            <li><code>break</code> iese din buclă; <code>continue</code> sare la următoarea iterație.</li>
          </ul>
          <h4>Word splitting: de ce <code>for x in $(cat fișier)</code> este riscant</h4>
          <p>
            Rezultatul unei comenzi neprotejat de ghilimele este despărțit pe <b>spații, tab-uri și newline-uri</b>. Un rând „ana maria” devine două elemente. Pentru fișiere cu rânduri ce pot conține spații, citirea corectă este <code>while IFS= read -r linie</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Globbing</b> (L1.3): <code>*</code>, <code>?</code>, <code>[a-z]</code> în listă; dacă nu există potrivire, tiparul rămâne literal (implicit în bash).</li>
            <li><b>Parametri</b> (L3.2): <code>for a in "$@"</code> prelucrează argumentele.</li>
            <li><b>Condiții</b> (L3.3): <code>if</code> în corpul buclei pentru a filtra elementele.</li>
            <li><b>Redirecționare</b> (L1.5): <code>done &lt; fișier</code> dă bucla un fișier ca intrare; <code>done &gt; rezultat.txt</code> redirecționează toată ieșirea buclei.</li>
            <li><b>Utilizatori și fișiere</b> (C9, L1.8): sarcini tipice: crearea mai multor utilizatori, aplicarea de permisiuni pe mai multe fișiere.</li>
            <li><b>Output de comenzi</b> (L3.5): <code>$( )</code>, <code>cut</code>, <code>awk</code> produc liste.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Aplici aceeași comandă pe mai multe fișiere (redenumire, copiere, <code>chmod</code>).</li>
            <li>Creezi sau ștergi mai multe conturi dintr-o listă.</li>
            <li>Procesezi argumentele date scriptului.</li>
            <li>Citești un fișier de configurare sau o listă linie cu linie.</li>
            <li>La examen: „scriptul afișează numele fiecărui fișier din director”, „adaugă utilizatorii din fișierul X”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem, într-un director de test (de exemplu <code>~/exercitiu</code>). Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Prima buclă, direct în terminal</h4>
        <CodeBlock title="comenzi" code={`for x in unu doi trei; do echo "Element: $x"; done\nfor i in {1..5}; do echo "Numărul $i"; done\nfor i in {10..1..3}; do echo $i; done`} explain={[
          ['for x in unu doi trei', 'x este variabila buclei; unu, doi, trei sunt elementele. Numele variabilei îl alegi tu.'],
          ['; do … ; done', 'do începe corpul, done îl închide. Pe o singură linie, ; separă părțile.'],
          ['"Element: $x"', 'folosești valoarea curentă cu $x; ghilimele duble.'],
          ['{1..5}', 'expansiune cu acolade: bash o înlocuiește cu 1 2 3 4 5 ÎNAINTE de buclă. Fără spații în interior.'],
          ['{10..1..3}', 'interval cu pas: de la 10 la 1, din 3 în 3 (10, 7, 4, 1).'],
        ]} />

        <h4>2. Bucla pe fișiere (glob)</h4>
        <CodeBlock title="pregătire și buclă" code={`mkdir -p ~/exercitiu\ncd ~/exercitiu\ntouch a.txt b.txt "c d.txt" nota.log\nfor f in *.txt; do\n  echo "Fișier: $f"\ndone\nfor f in *.txt; do\n  mv "$f" "$f.bak"\ndone\nls`} explain={[
          ['mkdir -p ~/exercitiu; cd ~/exercitiu', 'director de test; -p nu dă eroare dacă există.'],
          ['touch a.txt b.txt "c d.txt" nota.log', 'creează fișiere goale; „c d.txt” are spațiu în nume, ca să vezi de ce ghilimelele contează.'],
          ['for f in *.txt', 'shell-ul expandează *.txt în lista fișierelor; „c d.txt” rămâne UN element.'],
          ['mv "$f" "$f.bak"', 'redenumește fiecare fișier adăugând .bak. Ghilimelele din jurul lui $f protejează numele cu spațiu. Fără ele, mv ar primi „c” și „d.txt” separat.'],
          ['ls', 'confirmă rezultatul.'],
        ]} />

        <h4>3. Bucla în script, cu argumente</h4>
        <CodeBlock title="afiseaza.sh" code={`#!/bin/bash\nif [ $# -eq 0 ]; then\n  echo "Folosire: $0 FIȘIER..." >&2\n  exit 1\nfi\nfor f in "$@"; do\n  if [ -f "$f" ]; then\n    echo "$f: fișier, $(wc -l < "$f") linii"\n  else\n    echo "$f: nu este fișier obișnuit"\n  fi\ndone`} explain={[
          ['for f in "$@"', 'un element pentru fiecare argument; granițele cuvintelor sunt păstrate.'],
          ['if [ -f "$f" ]', 'filtrare cu if (L3.3) în interiorul buclei.'],
          ['$(wc -l < "$f")', 'numără liniile; $( ) înlocuiește comanda cu rezultatul (L3.5). Cu < fișierul este citit pe stdin, deci wc nu afișează numele.'],
          ['done', 'închide bucla; liniile de după rulează o singură dată.'],
        ]} />

        <h4>4. Crearea mai multor utilizatori (model de examen)</h4>
        <CodeBlock title="utilizatori.sh" code={`#!/bin/bash\nfor u in "$@"; do\n  if id "$u" > /dev/null 2>&1; then\n    echo "$u există deja"\n  else\n    useradd "$u"\n    echo "$u a fost creat"\n  fi\ndone`} explain={[
          ['id "$u" > /dev/null 2>&1', 'id cu cod 0 dacă utilizatorul există. Redirecționările aruncă orice output; contează doar codul.'],
          ['useradd "$u"', 'creează utilizatorul (C9); necesită root: rulează scriptul cu sudo.'],
          ['else', 'ramura „nu există”.'],
        ]} />
        <Callout kind="warn" title="Rulează cu grijă">
          Un script cu <code>useradd</code> modifică sistemul. Rulează-l doar pe un sistem de test și cu nume pe care le poți șterge ulterior (<code>userdel -r nume</code>, C9). Platforma nu îl rulează.
        </Callout>

        <h4>5. Citirea unui fișier rând cu rând: <code>while read</code></h4>
        <CodeBlock title="lista.sh" code={`#!/bin/bash\nfisier="$1"\nnr=0\nwhile IFS= read -r linie; do\n  nr=$((nr + 1))\n  echo "$nr: $linie"\ndone < "$fisier"\necho "Total: $nr linii"`} explain={[
          ['while … do … done < "$fisier"', 'în fiecare iterație read citește o linie din fișier (redirecționat la done). Bucla se termină când read ajunge la sfârșit (cod nenul).'],
          ['IFS=', 'oprește eliminarea spațiilor de la început/sfârșit de linie.'],
          ['read -r linie', '-r = nu interpreta backslash-urile; linia merge în variabila linie.'],
          ['nr=$((nr + 1))', 'aritmetică în bash: $(( )) evaluează expresia numerică.'],
        ]} />
        <p className="small">Dacă folosești <code>cat fisier | while read …</code>, bucla rulează într-un subshell: variabilele modificate înăuntru (<code>nr</code>) nu se văd după <code>done</code>. De aceea se preferă <code>done &lt; fișier</code>.</p>

        <h4>6. C-style, <code>while</code>, <code>break</code>, <code>continue</code></h4>
        <CodeBlock title="alte.sh" code={`#!/bin/bash\nfor ((i=1; i<=5; i++)); do\n  if [ $i -eq 2 ]; then continue; fi\n  if [ $i -eq 5 ]; then break; fi\n  echo "i=$i"\ndone\n\nn=3\nwhile [ $n -gt 0 ]; do\n  echo "n=$n"\n  n=$((n - 1))\ndone`} explain={[
          ['for ((i=1; i<=5; i++))', 'inițializare; condiție; pas. Nu folosi $ în interior pentru variabila i.'],
          ['continue', 'sare peste restul corpului, trece la următoarea iterație (aici sare peste i=2).'],
          ['break', 'iese din buclă (aici la i=5).'],
          ['while [ $n -gt 0 ]', 'cât timp testul are cod 0, repetă. Corpul trebuie să schimbe n, altfel bucla este infinită (Ctrl+C o oprește).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="buclă simplă" kind="session" label="illustrative" code={`[student@server1 ~]$ for x in unu doi trei; do echo "Element: $x"; done\nElement: unu\nElement: doi\nElement: trei\n[student@server1 ~]$ for i in {1..3}; do echo "Numărul $i"; done\nNumărul 1\nNumărul 2\nNumărul 3`} />
        <p className="small">Fiecare element produce o iterație, în ordinea din listă. <code>{'{1..3}'}</code> a fost expandat de bash în <code>1 2 3</code> înainte ca bucla să înceapă.</p>
        <CodeBlock title="redenumire cu spațiu în nume" kind="session" label="illustrative" code={`[student@server1 ~]$ ls\na.txt  b.txt  c d.txt  nota.log\n[student@server1 ~]$ for f in *.txt; do mv "$f" "$f.bak"; done\n[student@server1 ~]$ ls\na.txt.bak  b.txt.bak  c d.txt.bak  nota.log`} />
        <p className="small"><code>nota.log</code> nu se potrivește cu <code>*.txt</code>, deci nu este atins. „c d.txt” a fost redenumit corect datorită ghilimelelor din <code>"$f"</code>.</p>
        <CodeBlock title="lista.sh" kind="session" label="illustrative" code={`[student@server1 ~]$ printf 'ana\\nbogdan\\nana maria\\n' > nume.txt\n[student@server1 ~]$ ./lista.sh nume.txt\n1: ana\n2: bogdan\n3: ana maria\nTotal: 3 linii`} />
        <p className="small">Rândul „ana maria” rămâne întreg (un element), pentru că <code>read -r</code> citește linii, nu cuvinte. Cu <code>for x in $(cat nume.txt)</code> ai fi obținut patru elemente.</p>
        <CodeBlock title="glob fără potrivire" kind="session" label="illustrative" code={`[student@server1 ~]$ for f in *.xyz; do echo "Fișier: $f"; done\nFișier: *.xyz`} />
        <p className="small">Fără fișiere <code>.xyz</code>, bash lasă tiparul literal (comportament implicit): corpul rulează o dată cu valoarea <code>*.xyz</code>. În scripturi verifici cu <code>[ -e "$f" ]</code> înainte de a folosi elementul.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Rulează bucla întâi cu <code>echo</code> în loc de comanda reală (de exemplu <code>echo mv "$f" "$f.bak"</code>) ca să vezi ce ar face.</li>
            <li>Testează cu listă goală, cu un element, cu elemente cu spații.</li>
            <li><code>bash -x script.sh</code> arată fiecare iterație.</li>
            <li><code>bash -n script.sh</code> verifică <code>do</code>/<code>done</code>.</li>
            <li>Verifică efectul final: <code>ls</code>, <code>id utilizator</code>, <code>wc -l</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Scriptul persistă; efectele lui (fișiere redenumite, utilizatori creați) persistă și ele, pentru că sunt modificări pe disc. Variabila buclei și contoarele dispar la sfârșitul scriptului. Confirmare manuală după reboot: <code>ls</code>, <code>id utilizator</code>, <code>getent passwd utilizator</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['fișierele cu spații sunt tratate ca două elemente', 'variabila fără ghilimele sau $(ls) / $(cat)', <code>bash -x script.sh</code>, <>folosește <code>"$f"</code> și glob sau <code>while read</code></>],
          [<code>syntax error near unexpected token 'done'</code>, <>lipsește <code>do</code> sau ; înaintea lui</>, <code>bash -n script.sh</code>, <>scrie <code>for …; do</code></>],
          [<code>syntax error: unexpected end of file</code>, <>lipsește <code>done</code></>, <code>bash -n script.sh</code>, <>închide bucla</>],
          [<>bucla rulează o dată cu valoarea <code>*.txt</code></>, 'nicio potrivire pentru glob', <code>ls *.txt</code>, <>verifică <code>[ -e "$f" ]</code> sau directorul curent</>],
          ['bucla nu se oprește', <>condiția <code>while</code> nu se schimbă</>, 'Ctrl+C; citește corpul', 'modifică variabila din test în corp'],
          ['contorul este 0 după buclă', <>pipe în <code>while</code> (subshell)</>, 'verifică forma cat | while', <>folosește <code>done &lt; fișier</code></>],
          [<><code>{'{1..5}'}</code> afișat literal</>, 'rulat în sh sau cu spații', 'verifică shebang și lipsa spațiilor', <>folosește bash; <code>{'{1..5}'}</code> fără spații</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți <code>do</code> sau <code>done</code>.</>,
          <>Folosești <code>for f in $(ls)</code>: se sparge la spații; folosește glob (<code>*</code>).</>,
          <>Variabila buclei fără ghilimele în comenzi (<code>mv $f …</code>).</>,
          <>Pui spații în <code>{'{1..5}'}</code> sau folosești variabile în acolade (<code>{'{1..$n}'}</code> nu funcționează).</>,
          <>Crezi că <code>*.txt</code> fără potrivire dă listă goală: rămâne literal.</>,
          <>Bucla <code>while</code> fără modificarea condiției: buclă infinită.</>,
          <>Citești fișierul cu <code>cat | while</code> și te miri că variabilele s-au pierdut.</>,
          <>La examen: rulezi scriptul cu comenzi periculoase fără să-l testezi mai întâi cu <code>echo</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: IFS, nullglob, subshell, while cu pipe">
        <p>
          <code>IFS</code> (Internal Field Separator) este variabila care decide pe ce caractere se sparg cuvintele (implicit spațiu, tab, newline). <code>IFS= read -r</code> setează <code>IFS</code> la gol doar pentru acea comandă. Un alt exemplu: <code>IFS=: read -r user x uid rest &lt; linie</code> sparge o linie din <code>/etc/passwd</code> pe <code>:</code>.
        </p>
        <p>
          <code>shopt -s nullglob</code> face ca un glob fără potrivire să dispară din listă (în loc să rămână literal). Este setare bash, nu implicită; pentru examen e suficient să verifici cu <code>[ -e "$f" ]</code>.
        </p>
        <p>
          Într-un pipeline, fiecare componentă poate rula într-un subshell: <code>cmd | while read …</code> are bucla într-un proces copil; modificările variabilelor nu ajung la părinte. Redirecționarea <code>&lt; fișier</code> evită problema. Substituția de proces (<code>&lt; &lt;(cmd)</code>) este o alternativă bash avansată.
        </p>
      </DeepDive>
    </>
  );
}

export const L3_4: TopicModule = {
  id: 'L3.4',
  subtitle: 'for pe liste, glob, acolade și "$@"; while read; break/continue',
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
  labs: [LAB_L3_4],
  sources: [
    { kind: 'upstream', ref: 'GNU Bash Reference Manual — „Looping Constructs” https://www.gnu.org/software/bash/manual/html_node/Looping-Constructs.html (citit 2026-11-16)' },
    { kind: 'man', ref: 'bash(1) — Compound Commands (for, while, until), Brace Expansion, Pathname Expansion; read' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com necitit (HTTP 403 în C2); de confirmat la review' },
  ],
};
