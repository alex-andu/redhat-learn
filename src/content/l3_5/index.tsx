import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L3_5 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="command-substitution">Substituția de comandă</G> <code>$(comandă)</code> înlocuiește expresia cu <b>ce afișează comanda</b> pe <code>stdout</code>: <code>azi=$(date +%F)</code> pune data într-o variabilă. Poți apoi s-o testezi (<code>if</code>), s-o parcurgi (<code>for</code>), s-o filtrezi cu <code>grep</code>, <code>cut</code>, <code>awk</code>, <code>wc</code>, sau s-o citești linie cu linie cu <code>while read</code>.
            Pentru decizii simple nu ai nevoie de output, ci de <b>codul de ieșire</b> (<code>grep -q</code>).
          </p>
          <p>Obiectivul oficial: <i>„Processing output of shell commands within a script”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Scripturile devin utile când folosesc <b>informațiile sistemului</b>: câte fișiere sunt în director, ce utilizatori au shell bash, cât spațiu liber este. Aceste informații vin ca text de la comenzi. Scriptul trebuie să le capteze, să le prelucreze și să decidă ce face în funcție de ele. Fără asta, ar trebui să copiezi manual rezultatele.
          </p>
          <Analogy>Ai un stagiar căruia îi ceri: „du-te la depozit, numără cutiile și spune-mi numărul”. <code>$( )</code> este momentul în care stagiarul se întoarce și <i>pune numărul</i> în locul întrebării. Poți folosi apoi numărul într-o decizie.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Substituția de comandă</h4>
          <ol>
            <li>Bash vede <code>$(…)</code> și rulează comanda dinăuntru într-un proces copil.</li>
            <li>Captează tot ce comanda scrie pe <code>stdout</code> (L1.5); <code>stderr</code> nu este captat și apare pe ecran.</li>
            <li>Elimină <b>newline-urile finale</b> și înlocuiește expresia cu textul rămas.</li>
            <li>Dacă expresia nu este între ghilimele, rezultatul trece prin <b>word splitting</b> (spațiu, tab, newline) și <b>globbing</b>. Între ghilimele, rămâne un singur cuvânt.</li>
          </ol>
          <p>
            Forma veche cu backticks (<code>`comandă`</code>) face același lucru, dar este mai greu de citit și de imbricat. Preferă <code>$( )</code>.
          </p>
          <h4>Trei feluri de a „folosi” o comandă într-un script</h4>
          <Table head={['Vrei…', 'Folosești', 'Exemplu']} rows={[
            ['textul afișat', <code>$( )</code>, <code>n=$(wc -l &lt; fisier)</code>],
            ['doar „a reușit?”', <>codul de ieșire, în <code>if</code></>, <code>if grep -q root /etc/passwd; then …</code>],
            ['fiecare linie', <><code>while read</code> sau <code>for</code></>, <code>while read -r l; do …; done &lt; fisier</code>],
          ]} />
          <h4>Utilitare pentru filtrare (cele din C1)</h4>
          <Table head={['Utilitar', 'Ce face', 'Exemplu']} rows={[
            [<code>grep</code>, 'păstrează liniile care se potrivesc (L1.6)', <code>grep -c bash /etc/shells</code>],
            [<code>cut</code>, 'extrage coloane după un delimitator', <code>cut -d: -f1 /etc/passwd</code>],
            [<code>awk</code>, 'procesează câmpuri; rezolvă filtrare + afișare', <code>awk -F: '{'{print $1}'}' /etc/passwd</code>],
            [<code>wc -l</code>, 'numără liniile', <code>ls | wc -l</code>],
            [<code>sort / uniq -c</code>, 'sortează / numără duplicatele consecutive', <code>sort fisier | uniq -c</code>],
            [<code>head / tail</code>, 'primele / ultimele linii', <code>ls -t | head -3</code>],
            [<code>tr</code>, 'înlocuiește sau șterge caractere', <code>echo ABC | tr A-Z a-z</code>],
            [<code>date, hostname, id, df</code>, 'informații despre sistem', <code>date +%F</code>],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Pipe și redirecționare</b> (L1.5): filtrezi output-ul trecându-l prin utilitare.</li>
            <li><b>grep și regex</b> (L1.6): <code>grep -q</code>, <code>grep -c</code>, <code>grep -v</code> în scripturi.</li>
            <li><b>Condiții</b> (L3.3) și <b>bucle</b> (L3.4): rezultatul comenzilor decide ramuri și iterații.</li>
            <li><b>Parametri</b> (L3.2): poți combina: <code>n=$(wc -l &lt; "$1")</code>.</li>
            <li><b>Fișiere de sistem</b>: <code>/etc/passwd</code> (format cu <code>:</code>, L1.10/C9), <code>/etc/shells</code>.</li>
            <li><b>Cod de ieșire</b> (L3.1): <code>$?</code> după o substituție reflectă comanda din interior.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Numeri fișiere, utilizatori, linii, procese și afișezi un rezumat.</li>
            <li>Construiești nume de fișiere cu data: <code>backup-$(date +%F).tar.gz</code>.</li>
            <li>Verifici dacă un utilizator, un text sau un pachet există și acționezi în consecință.</li>
            <li>Extragi o coloană dintr-un fișier de sistem.</li>
            <li>La examen: „scriptul afișează numărul de utilizatori”, „scriptul salvează lista fișierelor într-un fișier”, „scriptul listează utilizatorii cu shell-ul /bin/bash”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b> (utilizatori, valori de spațiu, date construite). Nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Pune rezultatul într-o variabilă</h4>
        <CodeBlock title="comenzi" code={`azi=$(date +%F)\necho "Data: $azi"\nnr=$(wc -l < /etc/passwd)\necho "Utilizatori în /etc/passwd: $nr"\ngazda=$(hostname)\necho "Gazda: $gazda"\nfisier="backup-$(date +%F).txt"\necho "$fisier"`} explain={[
          ['azi=$(date +%F)', 'rulează date +%F (data în formatul AAAA-LL-ZZ) și pune textul în variabila azi. Fără spații în jurul lui =.'],
          ['wc -l < /etc/passwd', 'numără liniile; cu < fișierul intră pe stdin, deci wc afișează doar numărul (nu și numele fișierului).'],
          ['hostname', 'afișează numele gazdei.'],
          ['"backup-$(date +%F).txt"', 'substituția poate sta în mijlocul unui șir între ghilimele.'],
        ]} />

        <h4>2. Filtrează cu <code>grep</code>, <code>cut</code>, <code>awk</code></h4>
        <CodeBlock title="comenzi" code={`cut -d: -f1 /etc/passwd | head -3\nawk -F: '{print $1, $7}' /etc/passwd | head -3\ngrep -c '/bin/bash$' /etc/passwd\ngrep '/bin/bash$' /etc/passwd | cut -d: -f1\nls /etc | wc -l`} explain={[
          ['cut -d: -f1', '-d: = delimitatorul este “:”; -f1 = primul câmp (numele utilizatorului în /etc/passwd).'],
          ['| head -3', 'doar primele 3 linii (L1.5).'],
          ["awk -F: '{print $1, $7}'", '-F: = separator de câmpuri “:”. Între acolade: acțiunea, aici afișează câmpul 1 și 7 (shell-ul). Ghilimele simple, ca shell-ul să nu atingă $1 și $7 (în awk ele sunt câmpuri, nu argumentele scriptului!).'],
          ["grep -c '/bin/bash$'", '-c = numără liniile potrivite; $ = sfârșit de linie (L1.6): utilizatorii cu shell /bin/bash.'],
          ['ls /etc | wc -l', 'numără intrările din /etc.'],
        ]} />

        <h4>3. Decizii pe baza output-ului sau a codului</h4>
        <CodeBlock title="decizii.sh" code={`#!/bin/bash\nnr=$(ls /etc | wc -l)\nif [ "$nr" -gt 100 ]; then\n  echo "/etc are multe intrări: $nr"\nelse\n  echo "/etc are $nr intrări"\nfi\n\nif grep -q '^root:' /etc/passwd; then\n  echo "Utilizatorul root există"\nfi\n\nif ! id nimeni-nu > /dev/null 2>&1; then\n  echo "Utilizatorul nimeni-nu nu există"\nfi`} explain={[
          ['[ "$nr" -gt 100 ]', 'compară NUMERIC rezultatul captat. Ghilimele în jurul $nr.'],
          ['grep -q', 'nu afișează nimic; întoarce 0 dacă a găsit. Se folosește direct în if (fără [ ]).'],
          ['! id …', '! neagă codul de ieșire: „dacă id eșuează”.'],
          ['> /dev/null 2>&1', 'arunci tot output-ul; ți-ai propus doar codul.'],
        ]} />

        <h4>4. Prelucrează fiecare linie de output</h4>
        <CodeBlock title="utilizatori.sh" code={`#!/bin/bash\ncount=0\nwhile IFS=: read -r user x uid gid desc home shell; do\n  if [ "$shell" = "/bin/bash" ]; then\n    echo "$user (UID $uid) -> $home"\n    count=$((count + 1))\n  fi\ndone < /etc/passwd\necho "Total cu bash: $count"`} explain={[
          ['IFS=: read -r user x uid …', 'IFS=: setează separatorul pe “:” DOAR pentru acest read, care umple șapte variabile, câte una pe câmp din /etc/passwd.'],
          ['x', 'al doilea câmp (istoric parola); nu ne interesează, dar trebuie să existe o variabilă pentru el.'],
          ['"$shell" = "/bin/bash"', 'compară șirul. Variabilele păstrează valoarea câmpului.'],
          ['done < /etc/passwd', 'fișierul intră pe stdin; fără pipe, deci count rămâne vizibil după buclă.'],
          ['count=$((count + 1))', 'aritmetică: incrementează.'],
        ]} />

        <h4>5. Salvează rezultatul și procesează-l</h4>
        <CodeBlock title="raport.sh" code={`#!/bin/bash\nraport="/tmp/raport-$(date +%F).txt"\n{\n  echo "Raport generat: $(date)"\n  echo "Gazda: $(hostname)"\n  echo "Utilizatori: $(wc -l < /etc/passwd)"\n} > "$raport"\ncat "$raport"\ncut -d: -f1 /etc/passwd | sort | head -5 >> "$raport"\nwc -l "$raport"`} explain={[
          ['{ …; } > "$raport"', 'grupează comenzile; toată ieșirea grupului merge într-un fișier (L1.5). > suprascrie, >> adaugă.'],
          ['$(date)', 'data și ora în formatul implicit.'],
          ['cut … | sort | head -5 >> "$raport"', 'lanț: extrage nume, sortează, ia primele 5, adaugă la fișier.'],
          ['wc -l "$raport"', 'afișează numărul de linii și numele fișierului.'],
        ]} />

        <h4>6. Numără și grupează cu <code>sort | uniq -c</code></h4>
        <CodeBlock title="comenzi" code={`cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn`} explain={[
          ['cut -d: -f7', 'extrage shell-ul (câmpul 7).'],
          ['sort', 'uniq numără doar duplicate CONSECUTIVE; de aceea sortezi întâi.'],
          ['uniq -c', 'prefixează fiecare linie unică cu numărul de apariții.'],
          ['sort -rn', '-n = ordine numerică, -r = descrescător: cel mai frecvent primul.'],
        ]} />

        <h4>7. Atenție la word splitting</h4>
        <CodeBlock title="comenzi" code={`fisiere=$(ls ~/exercitiu)\nfor f in $fisiere; do echo "[$f]"; done\nfor f in ~/exercitiu/*; do echo "[$f]"; done`} explain={[
          ['for f in $fisiere', 'FĂRĂ ghilimele: un nume cu spațiu devine două elemente. Evită.'],
          ['for f in ~/exercitiu/*', 'varianta corectă: glob (L3.4), fiecare nume rămâne întreg.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="variabile din comenzi" kind="session" label="illustrative" code={`[student@server1 ~]$ azi=$(date +%F)\n[student@server1 ~]$ echo "Data: $azi"\nData: 2026-11-16\n[student@server1 ~]$ nr=$(wc -l < /etc/passwd)\n[student@server1 ~]$ echo "Utilizatori în /etc/passwd: $nr"\nUtilizatori în /etc/passwd: 42`} />
        <p className="small">Atribuirea nu afișează nimic: rezultatul comenzii este în variabilă și îl vezi doar cu <code>echo</code>. Data și numărul 42 sunt exemple.</p>
        <CodeBlock title="cut, awk, grep -c" kind="session" label="illustrative" code={`[student@server1 ~]$ cut -d: -f1 /etc/passwd | head -3\nroot\nbin\ndaemon\n[student@server1 ~]$ awk -F: '{print $1, $7}' /etc/passwd | head -3\nroot /bin/bash\nbin /sbin/nologin\ndaemon /sbin/nologin\n[student@server1 ~]$ grep -c '/bin/bash$' /etc/passwd\n3`} />
        <p className="small">Fiecare linie din <code>/etc/passwd</code> are șapte câmpuri separate prin <code>:</code>. <code>cut -f1</code> extrage utilizatorul; <code>awk</code> afișează două câmpuri, separate prin spațiu. <code>grep -c</code> afișează doar numărul. Valorile depind de sistem.</p>
        <CodeBlock title="utilizatori.sh" kind="session" label="illustrative" code={`[student@server1 ~]$ ./utilizatori.sh\nroot (UID 0) -> /root\nstudent (UID 1000) -> /home/student\nTotal cu bash: 2`} />
        <p className="small">Bucla a parcurs fiecare linie din <code>/etc/passwd</code>, a păstrat doar cele cu shell <code>/bin/bash</code> și a numărat. Utilizatorii și UID-urile sunt exemple.</p>
        <CodeBlock title="sort | uniq -c" kind="session" label="illustrative" code={`[student@server1 ~]$ cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn\n     38 /sbin/nologin\n      2 /bin/bash\n      1 /sbin/shutdown`} />
        <p className="small">Prima coloană este numărul de apariții, a doua valoarea. Cifrele sunt orientative.</p>
        <CodeBlock title="word splitting" kind="session" label="illustrative" code={`[student@server1 ~]$ fisiere=$(ls ~/exercitiu)\n[student@server1 ~]$ for f in $fisiere; do echo "[$f]"; done\n[a.txt]\n[c]\n[d.txt]\n[nota.log]`} />
        <p className="small">Fișierul „c d.txt” a fost spart în <code>c</code> și <code>d.txt</code>. Varianta corectă folosește glob: <code>for f in ~/exercitiu/*</code>.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Rulează comanda din <code>$( )</code> separat în terminal; vezi exact ce text produce.</li>
            <li><code>echo "[$var]"</code>: parantezele arată spații sau linii goale ascunse.</li>
            <li><code>bash -x script.sh</code>: arată valorile după expansiune (<code>+ nr=42</code>).</li>
            <li>Compară cu o numărătoare independentă (<code>grep -c</code> vs <code>wc -l</code>).</li>
            <li><code>echo $?</code> după <code>grep -q</code> sau <code>id</code>: 0 sau nenul.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Valorile captate trăiesc doar cât rulează scriptul. Dacă ai nevoie de ele după aceea, le scrii într-un fișier (<code>&gt; /tmp/raport.txt</code>, <code>&gt;&gt;</code>). Atenție: <code>/tmp</code> poate fi curățat la reboot sau periodic; pentru date de păstrat folosește alt director. Scriptul persistă pe disc. Confirmare manuală: rulează scriptul după reboot și verifică fișierul de ieșire.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['variabila este goală', 'comanda nu a produs output pe stdout (eroare pe stderr)', <>rulează comanda separat; <code>echo "[$var]"</code></>, <>corectează comanda; vezi stderr</>],
          [<>valoarea conține fișierul în plus (de ex. <code>42 /etc/passwd</code>)</>, <><code>wc -l fisier</code> afișează și numele</>, 'rulează wc separat', <>folosește <code>wc -l &lt; fisier</code></>],
          [<code>integer expression expected</code>, 'variabila conține text/spații, nu număr', <code>echo "[$nr]"</code>, 'curăță valoarea; folosește wc -l < fisier'],
          ['elementele se sparg la spații', 'fără ghilimele, for pe $(…)', <code>bash -x script.sh</code>, <>glob sau <code>while read</code></>],
          [<>awk afișează toată linia / nimic</>, <>ghilimele greșite (<code>$1</code> expandat de shell)</>, 'verifică ghilimelele simple în jurul programului awk', <>pune programul între ghilimele simple</>],
          ['contorul rămâne 0', <>pipe în <code>while</code> (subshell)</>, 'folosește echo în buclă pentru depanare', <>folosește <code>done &lt; fișier</code></>],
          [<>nume cu <code>$(date)</code> conțin spații</>, <><code>date</code> fără format</>, <code>echo "$(date)"</code>, <>folosește <code>date +%F</code> (fără spații)</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Spații în atribuire: <code>nr = $(…)</code>.</>,
          <>Uiți ghilimelele: <code>echo $var</code> pierde spațiile; <code>for x in $(…)</code> se sparge.</>,
          <>Folosești <code>wc -l fisier</code> și ai în variabilă „42 fisier”.</>,
          <>Folosești backticks imbricate (greu de citit); preferă <code>$( )</code>.</>,
          <>Crezi că <code>$( )</code> captează și erorile (stderr): nu.</>,
          <>Uiți <code>sort</code> înaintea lui <code>uniq</code>.</>,
          <>Pui <code>$1</code> în awk fără ghilimele simple: shell-ul îl înlocuiește cu argumentul scriptului.</>,
          <>Folosești <code>grep</code> care afișează liniile, când îți trebuie doar „a reușit?” — folosește <code>grep -q</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: cod de ieșire al substituției, pipefail, subshell și mapfile">
        <p>
          În <code>x=$(comandă)</code>, <code>$?</code> după atribuire este codul comenzii din substituție. În schimb, în <code>echo "Text: $(comandă)"</code>, <code>$?</code> este al lui <code>echo</code>. Dacă ai nevoie de ambele informații, atribuie întâi, apoi testează: <code>x=$(cmd); rc=$?</code>.
        </p>
        <p>
          Codul unui pipeline este, implicit, al <i>ultimei</i> comenzi. <code>set -o pipefail</code> face ca pipeline-ul să eșueze dacă oricare comandă eșuează. Util în scripturi mai lungi; vezi <code>help set</code>.
        </p>
        <p>
          O substituție rulează într-un subshell: modificările de variabile făcute în interior nu ajung la scriptul principal. Pentru a citi linii într-un tablou, bash are <code>mapfile -t linii &lt; fișier</code>; este alternativă avansată la <code>while read</code> și nu este necesară pentru C3.
        </p>
      </DeepDive>
    </>
  );
}

export const L3_5: TopicModule = {
  id: 'L3.5',
  subtitle: '$( ), grep/cut/awk/wc/sort în scripturi, while read, coduri de ieșire',
  studyTime: '≈80 min studiu + laborator',
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
  labs: [LAB_L3_5],
  sources: [
    { kind: 'man', ref: 'bash(1) — Command Substitution, Word Splitting, read; grep(1), cut(1), awk(1), wc(1), sort(1), uniq(1), date(1)' },
    { kind: 'upstream', ref: 'GNU Bash Reference Manual — „Looping Constructs” (citit 2026-11-16); „Command Substitution” necitit (HTTP 429)' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com necitit (HTTP 403 în C2); de confirmat la review' },
  ],
};
