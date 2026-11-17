import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L3_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Când rulezi <code>./script.sh unu doi</code>, cuvintele <code>unu</code> și <code>doi</code> ajung în script ca <G id="positional-parameter">parametri poziționali</G>: <code>$1</code>, <code>$2</code>… <code>$0</code> este numele scriptului, <code>$#</code> numărul de argumente, <code>"$@"</code> toate argumentele.
            Valorile le folosești ca pe orice variabilă: <code>echo "Salut, $1"</code>. Verifici întotdeauna dacă ele au fost date (<code>$#</code>) și pui <code>"$1"</code> între ghilimele.
          </p>
          <p>Obiectivul oficial: <i>„Process script inputs ($1, $2, etc.)”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un script scris „bătut în cuie” (cu un nume de utilizator sau un fișier fixat în el) servește un singur caz. Dacă numele vine de la cel care îl rulează, același script servește orice caz:
            <code>./creeaza.sh ana</code>, <code>./creeaza.sh bogdan</code>. Așa lucrează și comenzile standard: <code>ls /etc</code> primește <code>/etc</code> ca argument (L1.1). Un script se comportă ca o comandă proprie, cu propriile argumente.
          </p>
          <Analogy>O funcție dintr-un aparat de bucătărie: butonul „Start” nu știe ce vei găti; îi dai ingredientele (argumentele), iar el le prelucrează. Fără parametri, ai un aparat care face un singur fel de mâncare.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Cum ajung argumentele în script</h4>
          <ol>
            <li>Shell-ul tău citește linia <code>./script.sh unu "doi trei" patru</code> și o împarte în <b>cuvinte</b> (L1.1). Ghilimelele fac ca <code>"doi trei"</code> să rămână un singur cuvânt.</li>
            <li>Primul cuvânt este comanda (<code>./script.sh</code>); restul sunt argumentele.</li>
            <li>Procesul bash care rulează scriptul primește lista: <code>$0</code> = <code>./script.sh</code>, <code>$1</code> = <code>unu</code>, <code>$2</code> = <code>doi trei</code>, <code>$3</code> = <code>patru</code>.</li>
            <li>Un argument lipsă este un <b>șir vid</b>: <code>$4</code> există, dar nu are conținut.</li>
          </ol>
          <h4>Parametrii speciali</h4>
          <Table head={['Parametru', 'Ce conține', 'Exemplu (rulat cu: ./s.sh a "b c" d)']} rows={[
            [<code>$0</code>, 'numele/calea cu care a fost pornit scriptul', <code>./s.sh</code>],
            [<code>$1, $2, …</code>, 'argumentul 1, 2…', <><code>a</code>, <code>b c</code></>],
            [<code>{'${10}'}</code>, 'de la al 10-lea argument sunt obligatorii acoladele; $10 înseamnă „$1 urmat de 0”', 'valoarea argumentului 10'],
            [<code>$#</code>, 'numărul de argumente (fără $0)', <code>3</code>],
            [<code>"$@"</code>, 'toate argumentele, fiecare ca cuvânt separat', <>trei cuvinte: <code>a</code>, <code>b c</code>, <code>d</code></>],
            [<code>"$*"</code>, 'toate argumentele lipite într-un singur cuvânt', <code>a b c d</code>],
            [<code>$?</code>, 'codul de ieșire al ultimei comenzi (L3.1)', <code>0</code>],
          ]} />
          <h4>Variabile obișnuite</h4>
          <p>
            Pe lângă parametrii poziționali, ai <G id="shell-variable">variabile</G> proprii: <code>nume=ana</code> (fără spații în jurul <code>=</code>!) și le citești cu <code>$nume</code>. Ghilimelele duble expandează variabilele (<code>"Salut $nume"</code>), cele simple nu (<code>'Salut $nume'</code> rămâne literal).
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Quoting</b> (L1.1): ghilimelele din linia de comandă decid ce este „un argument”; ghilimelele din script decid dacă o valoare este separată în cuvinte.</li>
            <li><b>Condiții</b> (L3.3): verifici dacă ai primit argumentele (<code>[ $# -lt 1 ]</code>) și ce valoare au.</li>
            <li><b>Bucle</b> (L3.4): <code>for x in "$@"</code> prelucrează fiecare argument.</li>
            <li><b>Cod de ieșire</b> (L3.1): un script cu argumente greșite trebuie să iasă cu cod nenul.</li>
            <li><b>Globbing</b> (L1.3): <code>./script.sh *.txt</code> — shell-ul expandează <code>*.txt</code> înainte să pornească scriptul; scriptul primește lista de fișiere.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Un script care creează un utilizator al cărui nume îl dai la rulare.</li>
            <li>Un script care arhivează un director primit ca argument.</li>
            <li>Sarcini de examen de tipul: „scriptul primește un nume de fișier ca prim argument și afișează…”.</li>
            <li>Valori implicite: dacă nu e dat argumentul, scriptul folosește o valoare standard.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Afișează parametrii</h4>
        <CodeBlock title="params.sh" code={`#!/bin/bash\necho "Script:           $0"\necho "Primul argument:  $1"\necho "Al doilea:        $2"\necho "Număr argumente: $#"\necho "Toate:           $@"`} explain={[
          ['$0', 'numele cu care a fost pornit scriptul (exact cum l-ai scris în linia de comandă).'],
          ['$1, $2', 'primele două argumente. Dacă lipsesc, sunt șiruri vide (nu eroare).'],
          ['$#', 'numărul argumentelor primite.'],
          ['$@', 'toate argumentele; în ghilimele duble pastrează granițele cuvintelor (vezi mai jos).'],
        ]} />
        <CodeBlock title="rulare" code={`chmod +x params.sh\n./params.sh ana bogdan\n./params.sh "ana maria" bogdan\n./params.sh`} explain={[
          ['./params.sh ana bogdan', '$1=ana, $2=bogdan, $#=2.'],
          ['./params.sh "ana maria" bogdan', 'ghilimelele în linia de comandă fac din „ana maria” UN argument: $1="ana maria", $#=2.'],
          ['./params.sh', 'fără argumente: $1 și $2 sunt vide, $#=0.'],
        ]} />

        <h4>2. Verifică numărul de argumente</h4>
        <CodeBlock title="salut.sh" code={`#!/bin/bash\nif [ $# -lt 1 ]; then\n  echo "Folosire: $0 NUME" >&2\n  exit 1\nfi\necho "Salut, $1!"`} explain={[
          ['[ $# -lt 1 ]', 'test: „numărul de argumente este mai mic decât 1”. -lt = less than (L3.3).'],
          ['echo "Folosire: $0 NUME" >&2', 'mesajul de utilizare merge pe stderr (>&2, L1.5), ca să nu se amestece cu rezultatul normal.'],
          ['exit 1', 'ieșire cu cod nenul: argumentele lipsesc, deci scriptul a eșuat.'],
          ['echo "Salut, $1!"', 'folosește primul argument; "$1" între ghilimele.'],
        ]} />

        <h4>3. Valori implicite și argumente obligatorii</h4>
        <CodeBlock title="implicit.sh" code={`#!/bin/bash\nnume="\${1:-student}"\necho "Salut, $nume"\ncale="\${2:?lipsește calea}"\necho "Calea este $cale"`} explain={[
          ['${1:-student}', 'dacă $1 este vid sau nedefinit, rezultatul este „student”; altfel valoarea lui $1. Scrisă în ghilimele ca să rămână un singur cuvânt.'],
          ['nume="…"', 'atribuire: fără spații în jurul lui =.'],
          ['${2:?lipsește calea}', 'dacă $2 lipsește, shell-ul afișează mesajul și scriptul se oprește cu eroare (un script ne-interactiv iese).'],
        ]} />

        <h4>4. Parcurge toate argumentele: <code>"$@"</code> vs <code>$*</code></h4>
        <CodeBlock title="toate.sh" code={`#!/bin/bash\necho "Cu \\"$@\\":"\nfor a in "$@"; do\n  echo "  [$a]"\ndone\necho "Cu \\"$*\\":"\nfor a in "$*"; do\n  echo "  [$a]"\ndone`} explain={[
          ['for a in "$@"; do … done', 'bucla (L3.4) rulează o dată pentru FIECARE argument, păstrând spațiile din interiorul unui argument.'],
          ['"$*"', 'un singur cuvânt cu toate argumentele lipite (cu spațiu între ele): bucla rulează o singură dată.'],
          ['\\"', 'în interiorul ghilimelelor duble, \\" este ghilimea literală.'],
        ]} />

        <h4>5. <code>shift</code>: consumă argumentele unul câte unul</h4>
        <CodeBlock title="shift.sh" code={`#!/bin/bash\ncomanda="$1"\nshift\necho "Comanda: $comanda"\necho "Restul ($#): $@"`} explain={[
          ['shift', 'elimină $1 și mută restul la stânga: vechiul $2 devine $1, $# scade cu 1. shift 2 mută cu două poziții.'],
        ]} />

        <h4>6. Citire de la tastatură (suport)</h4>
        <CodeBlock title="intreaba.sh" code={`#!/bin/bash\nread -r -p "Cum te cheamă? " nume\necho "Salut, $nume"`} explain={[
          ['read', 'comandă internă a shell-ului: citește o linie de la tastatură în variabila dată.'],
          ['-r', 'raw: nu interpretează backslash-urile; folosește-l aproape mereu.'],
          ['-p "text"', 'afișează un prompt înainte de citire.'],
        ]} />
        <p className="small">Obiectivul oficial vorbește despre <code>$1, $2</code>; <code>read</code> este material de suport (intrare interactivă, nu argument).</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="params.sh" kind="session" label="illustrative" code={`[student@server1 ~]$ ./params.sh ana "bogdan ionescu"\nScript:           ./params.sh\nPrimul argument:  ana\nAl doilea:        bogdan ionescu\nNumăr argumente: 2\nToate:           ana bogdan ionescu\n[student@server1 ~]$ ./params.sh\nScript:           ./params.sh\nPrimul argument:  \nAl doilea:        \nNumăr argumente: 0\nToate:           `} />
        <p className="small">
          În primul apel, ghilimelele din linia de comandă fac din <code>bogdan ionescu</code> un singur argument, deci <code>$#</code> este 2, nu 3. Ultima linie arată „toate” fără ghilimele interioare, de aceea nu vezi granițele între argumente. În al doilea apel, argumentele lipsă sunt șiruri vide: liniile apar, dar goale, iar <code>$#</code> este 0. Scriptul nu a dat nicio eroare: lipsa unui argument nu e o greșeală pentru bash.
        </p>
        <CodeBlock title="toate.sh" kind="session" label="illustrative" code={`[student@server1 ~]$ ./toate.sh "ana maria" bogdan\nCu "$@":\n  [ana maria]\n  [bogdan]\nCu "$*":\n  [ana maria bogdan]`} />
        <p className="small">
          <code>"$@"</code> păstrează două argumente (cu spațiul din „ana maria” intact); <code>"$*"</code> le topește într-un șir unic. Aproape întotdeauna vrei <code>"$@"</code>.
        </p>
        <CodeBlock title="salut.sh fără argument" kind="session" label="illustrative" code={`[student@server1 ~]$ ./salut.sh\nFolosire: ./salut.sh NUME\n[student@server1 ~]$ echo $?\n1`} />
        <p className="small">Mesajul de utilizare și codul 1: scriptul refuză argumentele lipsă, așa cum ar face o comandă standard.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Rulează scriptul cu argumente variate: două normale, unul cu spațiu între ghilimele, zero argumente. Fiecare caz trebuie să se comporte previzibil.</li>
            <li><code>echo $?</code> după rularea fără argumente (dacă scriptul le cere): cod nenul.</li>
            <li><code>bash -x script.sh a b</code> arată valorile expandate (<code>+ echo 'Salut, a!'</code>), deci vezi ce a primit scriptul.</li>
            <li><code>bash -n script.sh</code> verifică sintaxa.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Argumentele există doar pe durata rulării: nu se salvează nicăieri. Scriptul (fișierul) și permisiunile persistă. Dacă ai nevoie de valori permanente, ele ar fi într-un fișier de configurare citit de script, nu în parametri. Confirmare manuală după reboot: <code>ls -l script.sh</code> și o rulare de test.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['scriptul tratează „ana maria” ca două argumente', 'lipsesc ghilimele în linia de comandă', <code>./script.sh ana maria; echo $#</code>, <>pune argumentul între ghilimele: <code>"ana maria"</code></>],
          [<code>[: too many arguments</code>, <><code>$1</code> conține spații și nu e între ghilimele în test</>, <code>bash -x script.sh "a b"</code>, <>scrie <code>[ "$1" = "x" ]</code></>],
          [<code>[: =: unary operator expected</code>, <><code>$1</code> este vid și lipsesc ghilimelele</>, <code>bash -x script.sh</code>, <>folosește <code>"$1"</code></>],
          [<><code>$10</code> afișează primul argument urmat de 0</>, 'fără acolade', 'recitește sintaxa', <>scrie <code>{'${10}'}</code></>],
          ['variabila nu se afișează, apare $nume literal', 'ghilimele simple', 'verifică tipul ghilimelelor', 'folosește ghilimele duble'],
          [<><code>nume: command not found</code> la <code>nume = ana</code></>, 'spații în jurul lui =', 'citește linia de atribuire', <>scrie <code>nume=ana</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți ghilimelele: <code>$1</code> în loc de <code>"$1"</code>. Un argument cu spații sau gol strică testul.</>,
          <>Atribuire cu spații: <code>x = 5</code> nu atribuie nimic.</>,
          <>Confunzi <code>$#</code> (număr) cu <code>$@</code> (listă).</>,
          <>Folosești <code>$*</code> unde ai nevoie de <code>"$@"</code>.</>,
          <>Uiți că <code>$0</code> este scriptul, nu primul argument.</>,
          <>Presupui că lipsa unui argument produce eroare: bash dă șir vid; trebuie să verifici tu.</>,
          <>Folosești ghilimele simple și crezi că variabila se expandează.</>,
          <>Scrii <code>$10</code> în loc de <code>{'${10}'}</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: expansiuni de parametri, set și getopts">
        <p>
          Forma <code>{'${1:-valoare}'}</code> aparține familiei de <i>expansiuni de parametri</i>: <code>{'${v:-x}'}</code> (implicit), <code>{'${v:=x}'}</code> (implicit și atribuie), <code>{'${v:?msg}'}</code> (eroare), <code>{'${#v}'}</code> (lungimea șirului), <code>{'${v%.txt}'}</code> (taie sufixul). Lista completă: <code>man bash</code>, secțiunea „Parameter Expansion”.
        </p>
        <p>
          <code>set -- a b c</code> înlocuiește parametrii poziționali ai scriptului cu valorile date. Pentru opțiuni de tipul <code>-f fișier</code> există builtin-ul <code>getopts</code>; nu este necesar pentru obiectivele C3.
        </p>
        <p>
          Cu <code>set -u</code> bash tratează variabilele nedefinite (inclusiv argumentele lipsă) ca eroare, ceea ce transformă lipsa unui argument într-o oprire explicită.
        </p>
      </DeepDive>
    </>
  );
}

export const L3_2: TopicModule = {
  id: 'L3.2',
  subtitle: '$0, $1, $2, $#, "$@", shift, valori implicite',
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
  labs: [LAB_L3_2],
  sources: [
    { kind: 'man', ref: 'bash(1) — SPECIAL PARAMETERS, Parameter Expansion, read, shift' },
    { kind: 'upstream', ref: 'GNU Bash Reference Manual — https://www.gnu.org/software/bash/manual/ ; „Looping Constructs” citit 2026-11-16, „Positional Parameters” necitit (HTTP 429)' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com necitit (HTTP 403 în C2); de confirmat la review' },
  ],
};
