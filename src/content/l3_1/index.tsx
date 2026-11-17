import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L3_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <G id="shell-script">script shell</G> este un fișier text cu comenzi, rulate una după alta, exact ca și cum le-ai tasta. Prima linie, <code>#!/bin/bash</code> (<G id="shebang">shebang</G>), spune sistemului cu ce program se interpretează fișierul.
            Îl rulezi cu <code>bash script.sh</code> sau, după <code>chmod +x script.sh</code>, cu <code>./script.sh</code>. Când se termină, scriptul lasă un <G id="exit-status">cod de ieșire</G> (0 = succes), pe care îl citești cu <code>echo $?</code>.
          </p>
          <p>Lecție de suport pentru obiectivele C3-1…C3-4 (nu este obiectiv oficial separat).</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Dacă ai de făcut aceeași sarcină de zece ori (creezi utilizatori, copiezi fișiere, verifici un serviciu), nu o tastezi de zece ori. Scrii comenzile o singură dată într-un fișier și le rulezi cu o singură comandă.
            Un script este deci <b>automatizare</b>: aceleași comenzi pe care le știi deja din C1, puse în ordine, cu ceva logică în plus (condiții, bucle — lecțiile următoare).
          </p>
          <p>
            Fără scripturi, fiecare sarcină repetitivă înseamnă greșeli de tastare și timp pierdut. La examenul practic, un script scurt îți poate economisi timp, dar nu este obligatoriu să-l folosești pentru fiecare sarcină; obiectivele C3 verifică dacă înțelegi structura de bază.
          </p>
          <Analogy>O rețetă de bucătărie: ingredientele și pașii sunt scriși o dată; oricine (sau tu, peste un an) o poate urma identic. Shebang-ul este antetul „această rețetă se gătește pe aragaz, nu la cuptor”: arată ce „aparat” (interpretor) o execută.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Ce se întâmplă când rulezi <code>./script.sh</code></h4>
          <ol>
            <li>Shell-ul tău (L1.1) caută fișierul. Pentru că ai scris <code>./</code>, îl caută în directorul curent, nu în <G id="path-env">PATH</G>.</li>
            <li>Verifică <b>permisiunea de execuție</b> (<code>x</code>, L1.8). Dacă lipsește: <code>Permission denied</code>.</li>
            <li>Cere <i>kernelului</i> să execute fișierul. Kernelul citește primii doi octeți: dacă sunt <code>#!</code>, restul primei linii este calea interpretorului (de exemplu <code>/bin/bash</code>).</li>
            <li>Kernelul pornește <code>/bin/bash ./script.sh</code>: interpretorul primește fișierul ca argument și execută linie cu linie.</li>
            <li>Când bash ajunge la sfârșit (sau la <code>exit</code>), procesul se termină cu un <b>cod de ieșire</b>; shell-ul tău îl păstrează în variabila specială <code>$?</code>.</li>
          </ol>
          <h4>Două moduri de rulare</h4>
          <Table head={['Mod', 'Cere bit x?', 'Cine alege interpretorul', 'Exemplu']} rows={[
            ['direct', 'da', 'shebang-ul din fișier', <code>./script.sh</code>],
            ['prin interpretor', 'nu (doar citire, r)', 'tu, în linia de comandă', <code>bash script.sh</code>],
          ]} />
          <h4>Codul de ieșire</h4>
          <p>
            Orice comandă Linux se termină cu un număr între 0 și 255. <b>0 înseamnă succes</b>; orice altă valoare înseamnă o eroare sau o stare specială. Atenție: în shell logica este „inversată” față de alte limbaje: 0 este „adevărat/reușit”.
            Scriptul tău poate seta codul cu <code>exit N</code>; dacă nu scrii <code>exit</code>, codul este cel al ultimei comenzi rulate.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Permisiuni</b> (L1.8): bitul <code>x</code> decide dacă merge <code>./script.sh</code>; <code>chmod +x</code> îl adaugă.</li>
            <li><b>PATH</b> (L1.1): dacă pui scriptul într-un director din <code>PATH</code> (de exemplu <code>~/bin</code>, dacă e în <code>PATH</code>), îl rulezi fără <code>./</code>.</li>
            <li><b>Redirecționare și pipe</b> (L1.5): scriptul își moștenește <code>stdin/stdout/stderr</code>; poți face <code>./script.sh &gt; rezultat.txt</code>.</li>
            <li><b>Editoare</b> (L1.4): scriptul se scrie cu <code>vim</code> sau <code>nano</code>.</li>
            <li><b>Utilizatori</b> (L1.10): scriptul rulează cu drepturile utilizatorului care îl pornește (sau cu root prin <code>sudo ./script.sh</code>).</li>
            <li><b>Condiții, bucle, parametri</b>: L3.2–L3.5.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Sarcini repetitive: creezi mai mulți utilizatori, aplici aceleași setări pe mai multe fișiere.</li>
            <li>Verificări rapide: „există fișierul? rulează serviciul?” — cu cod de ieșire clar, folosibil de alte scripturi.</li>
            <li>La examen: „creează un script <code>/usr/local/bin/ceva.sh</code> care…”, „scriptul trebuie să fie executabil de toți”.</li>
            <li>Documentare: un script este și o listă exactă a pașilor făcuți.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile de mai jos sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Primul script, pas cu pas</h4>
        <p>Creează fișierul cu un editor (L1.4), de exemplu <code>nano salut.sh</code>, și scrie în el:</p>
        <CodeBlock title="salut.sh" code={`#!/bin/bash\n# Script de test: afișează un mesaj și numele utilizatorului\necho "Salut din script"\nwhoami\nexit 0`} explain={[
          ['#!/bin/bash', 'shebang: obligatoriu pe PRIMA linie, fără spațiu înainte de #. Spune kernelului să ruleze fișierul cu /bin/bash.'],
          ['# Script de test…', 'comentariu: tot ce urmează după # până la capăt de linie este ignorat de interpretor. Folosește comentarii ca să explici „de ce”.'],
          ['echo "Salut din script"', 'afișează textul pe ecran (stdout). Ghilimelele protejează spațiile (L1.1, quoting).'],
          ['whoami', 'afișează numele utilizatorului curent; este o comandă obișnuită, exact ca în terminal.'],
          ['exit 0', 'termină scriptul cu codul 0 (succes). Fără această linie, codul ar fi al lui whoami, tot 0 aici, dar e bine să fii explicit.'],
        ]} />

        <h4>2. Fă-l executabil și rulează-l</h4>
        <CodeBlock title="comenzi" code={`ls -l salut.sh\nbash salut.sh\n./salut.sh\nchmod +x salut.sh\nls -l salut.sh\n./salut.sh\necho $?`} explain={[
          ['ls -l salut.sh', 'arată permisiunile: la început fără x, de exemplu -rw-r--r-- (L1.8).'],
          ['bash salut.sh', 'rulează scriptul prin interpretor; NU cere bit x, doar r. Shebang-ul este tratat ca simplu comentariu.'],
          ['./salut.sh', 'rulare directă. Înainte de chmod +x eșuează cu „Permission denied”. ./ = „în directorul curent” (altfel shell-ul caută doar în PATH).'],
          ['chmod +x salut.sh', 'adaugă permisiunea de execuție (x) pentru toți (u, g, o) conform umask-ului. Alternativă: chmod 755 salut.sh.'],
          ['echo $?', 'afișează codul de ieșire al ULTIMEI comenzi. Aici: 0.'],
        ]} />
        <CodeBlock title="sesiune" kind="session" label="illustrative" code={`[student@server1 ~]$ ./salut.sh\nbash: ./salut.sh: Permission denied\n[student@server1 ~]$ chmod +x salut.sh\n[student@server1 ~]$ ./salut.sh\nSalut din script\nstudent\n[student@server1 ~]$ echo $?\n0`} />

        <h4>3. Coduri de ieșire și <code>$?</code></h4>
        <CodeBlock title="comenzi" code={`ls /etc/hostname\necho $?\nls /nu-exista\necho $?\nnu-exista-comanda\necho $?\ntrue\necho $?\nfalse\necho $?`} explain={[
          ['ls /etc/hostname', 'comandă reușită → cod 0.'],
          ['ls /nu-exista', 'eroare (fișierul lipsește) → cod nenul. La ls (GNU coreutils) este 2 pentru „nu există” în cazul unui singur argument; valoarea exactă depinde de comandă, important e că nu este 0.'],
          ['nu-exista-comanda', 'shell-ul nu găsește comanda → cod 127 („command not found”, convenție bash).'],
          ['true / false', 'comenzi care nu fac nimic, cu cod 0 și, respectiv, 1; utile în teste.'],
          ['echo $?', 'ATENȚIE: $? se schimbă după FIECARE comandă, inclusiv după echo. Citește-l imediat după comanda care te interesează.'],
        ]} />
        <Table head={['Cod', 'Sens uzual']} rows={[
          ['0', 'succes'],
          ['1', 'eroare generală (convenție foarte răspândită)'],
          ['2', 'folosire greșită a comenzii / fișier lipsă, la multe utilitare'],
          ['126', 'comanda există dar nu este executabilă (de ex. fără bit x)'],
          ['127', 'comanda nu a fost găsită'],
          ['128+N', 'proces oprit de semnalul N (de ex. 130 = Ctrl+C, adică semnalul 2)'],
        ]} />

        <h4>4. Un script care folosește codul de ieșire</h4>
        <CodeBlock title="verifica.sh" code={`#!/bin/bash\n# Verifică dacă /etc/hostname există\nls /etc/hostname > /dev/null 2>&1\nif [ $? -eq 0 ]; then\n  echo "Fișierul există"\n  exit 0\nelse\n  echo "Fișierul lipsește"\n  exit 1\nfi`} explain={[
          ['ls /etc/hostname > /dev/null 2>&1', 'rulează ls, dar aruncă stdout și stderr (L1.5), ca să te intereseze doar codul.'],
          ['if [ $? -eq 0 ]; then', 'compară codul cu 0. Sintaxa if și [ ] este explicată în L3.3.'],
          ['exit 0 / exit 1', 'scriptul însuși raportează succes sau eșec; alt script sau tu cu echo $? poți folosi rezultatul.'],
        ]} />

        <h4>5. Rulare dintr-un director din PATH</h4>
        <CodeBlock title="comenzi" code={`echo $PATH\nmkdir -p ~/bin\ncp salut.sh ~/bin/\nsalut.sh\ncommand -v salut.sh\nsudo cp salut.sh /usr/local/bin/`} explain={[
          ['echo $PATH', 'lista directoarelor în care shell-ul caută comenzi (separate prin :). Pe RHEL, ~/.local/bin sau ~/bin pot fi incluse prin profilul implicit; verifică-ți PATH-ul, nu presupune.'],
          ['mkdir -p ~/bin', '-p: creează directorul dacă lipsește, fără eroare dacă există.'],
          ['cp salut.sh ~/bin/', 'copiază scriptul în ~/bin.'],
          ['salut.sh', 'fără ./ merge doar dacă directorul este în PATH și fișierul are bit x.'],
          ['command -v salut.sh', 'afișează calea găsită pentru comandă (sau nimic, cu cod nenul, dacă nu o găsește).'],
          ['sudo cp … /usr/local/bin/', 'locul uzual pentru scripturi proprii, disponibile tuturor utilizatorilor. Rămâne după reboot.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="coduri de ieșire" kind="session" label="illustrative" code={`[student@server1 ~]$ ls /etc/hostname\n/etc/hostname\n[student@server1 ~]$ echo $?\n0\n[student@server1 ~]$ ls /nu-exista\nls: cannot access '/nu-exista': No such file or directory\n[student@server1 ~]$ echo $?\n2\n[student@server1 ~]$ nu-exista-comanda\nbash: nu-exista-comanda: command not found\n[student@server1 ~]$ echo $?\n127`} />
        <p className="small">
          Prima comandă a reușit: afișează numele fișierului, iar <code>$?</code> este 0. A doua a eșuat: mesajul de eroare vine pe <code>stderr</code> (L1.5) și codul este nenul. A treia: shell-ul nu a putut găsi comanda: mesajul <code>command not found</code> și codul 127.
          Textul exact al mesajelor depinde de versiune și de limbă; important e să recunoști cele trei situații.
        </p>
        <CodeBlock title="rulare prin bash vs direct" kind="session" label="illustrative" code={`[student@server1 ~]$ ls -l salut.sh\n-rw-r--r--. 1 student student 112 Nov 16 10:00 salut.sh\n[student@server1 ~]$ ./salut.sh\nbash: ./salut.sh: Permission denied\n[student@server1 ~]$ echo $?\n126`} />
        <p className="small">
          Fișierul are doar <code>rw-r--r--</code>: nu există <code>x</code>. Încercarea directă produce <code>Permission denied</code> și codul 126 (comandă găsită, dar neexecutabilă). <code>bash salut.sh</code> ar fi mers, pentru că bash doar <i>citește</i> fișierul. Punctul de după permisiuni este contextul SELinux (C10); data și dimensiunea sunt exemple.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Shebang corect:</b> <code>head -1 script.sh</code> afișează <code>#!/bin/bash</code> (fără spații sau caractere ascunse înainte de <code>#</code>).</li>
            <li><b>Executabil:</b> <code>ls -l script.sh</code> arată <code>x</code> în permisiuni.</li>
            <li><b>Rulează:</b> <code>./script.sh</code> produce ce te aștepți.</li>
            <li><b>Cod de ieșire:</b> <code>echo $?</code> imediat după rulare: 0 pentru succes.</li>
            <li><b>Sintaxă fără execuție:</b> <code>bash -n script.sh</code> verifică doar sintaxa (nu rulează comenzile).</li>
            <li><b>Urmărire pas cu pas:</b> <code>bash -x script.sh</code> afișează fiecare comandă înainte de a o executa (prefixate cu <code>+</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierul script și permisiunile lui sunt pe disc: supraviețuiesc reboot-ului. Ce <b>nu</b> persistă: variabilele din sesiunea ta și <code>PATH</code> modificat doar în terminal (<code>export PATH=...</code>). Dacă ai nevoie ca un script să fie disponibil permanent, pune-l într-un director deja inclus în <code>PATH</code> pentru toți (de exemplu <code>/usr/local/bin</code>).
            Rularea automată a unui script la un moment dat (cron, systemd timer) ține de C4 și nu face parte din C3.
            Confirmare manuală după reboot: <code>ls -l /usr/local/bin/salut.sh</code> și <code>salut.sh</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Permission denied</code>, 'lipsește bitul x', <code>ls -l script.sh</code>, <><code>chmod +x script.sh</code> sau <code>bash script.sh</code></>],
          [<><code>command not found</code> la <code>script.sh</code></>, 'scriptul nu e în PATH și ai scris fără ./', <code>echo $PATH</code>, <>rulează <code>./script.sh</code> sau mută-l într-un director din PATH</>],
          [<code>bad interpreter: No such file or directory</code>, 'shebang cu cale greșită sau terminatori de linie Windows (CRLF)', <code>head -1 script.sh | cat -A</code>, <>corectează calea; elimină <code>^M</code> de la capătul liniei</>],
          ['comenzile merg în terminal, dar scriptul se comportă ciudat', 'lipsă shebang: se folosește alt interpretor', <code>head -1 script.sh</code>, <>adaugă <code>#!/bin/bash</code> pe prima linie</>],
          [<><code>$?</code> afișează mereu 0</>, 'ai citit $? după alt echo/comandă', 'rulează comanda, apoi imediat echo $?', 'salvează codul într-o variabilă: cod=$?'],
          [<code>syntax error near unexpected token</code>, 'if/fi, ghilimele sau parantezele nu se potrivesc', <code>bash -n script.sh</code>, 'corectează linia indicată (sau cea de dinaintea ei)'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Shebang pe a doua linie sau cu spațiu înainte (<code> #!/bin/bash</code>): nu mai este recunoscut.</>,
          <>Uiți <code>chmod +x</code> și apoi te miri de <code>Permission denied</code>.</>,
          <>Scrii <code>script.sh</code> în loc de <code>./script.sh</code> și primești <code>command not found</code>.</>,
          <>Crezi că 0 înseamnă „fals”: în shell 0 este succes.</>,
          <>Citești <code>$?</code> după o altă comandă și pierzi codul dorit.</>,
          <>Pui spații în jurul <code>=</code> la atribuiri (<code>x = 5</code>): bash încearcă să ruleze o comandă <code>x</code> (L3.2).</>,
          <>Editezi scriptul pe un sistem Windows și îl salvezi cu terminatori CRLF.</>,
          <>La examen, uiți că scriptul trebuie să fie și <b>în locul cerut</b> și <b>executabil</b>; verifică cu <code>ls -l</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: shebang, env, subshell și opțiuni de siguranță">
        <p>
          Kernelul execută fișiere în formate binare (ELF) sau fișiere care încep cu <code>#!</code>. În al doilea caz, pornește interpretorul indicat și îi dă calea scriptului ca argument. De aceea shebang-ul poate indica și <code>#!/usr/bin/python3</code> sau <code>#!/bin/sh</code>: fișierul este interpretat de programul respectiv.
          Forma <code>#!/usr/bin/env bash</code> caută <code>bash</code> în <code>PATH</code>; pe sisteme administrate, <code>#!/bin/bash</code> este cea mai previzibilă.
        </p>
        <p>
          Când rulezi <code>./script.sh</code>, scriptul pornește într-un proces <b>nou</b> (copil): variabilele pe care le setează dispar când se termină și nu afectează shell-ul tău. <code>source script.sh</code> (sau <code>. script.sh</code>) rulează comenzile în shell-ul curent; asta se folosește pentru fișiere de profil, nu pentru scripturi obișnuite.
        </p>
        <p>
          În scripturi mai lungi se folosesc <code>set -e</code> (oprește la prima comandă eșuată), <code>set -u</code> (eroare la variabile nedefinite) și <code>set -o pipefail</code> (un pipe eșuează dacă oricare comandă din el eșuează). Sunt practici bune, dar nu sunt necesare pentru obiectivele C3; vezi <code>help set</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const L3_1: TopicModule = {
  id: 'L3.1',
  subtitle: 'shebang, bit x, bash script.sh vs ./script.sh, $? și exit',
  studyTime: '≈50 min studiu + laborator',
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
  labs: [LAB_L3_1],
  sources: [
    { kind: 'man', ref: 'bash(1) — INVOCATION, EXIT STATUS, SPECIAL PARAMETERS; execve(2) — Interpreter scripts' },
    { kind: 'upstream', ref: 'GNU Bash Reference Manual — https://www.gnu.org/software/bash/manual/ (accesat parțial 2026-11-16)' },
    { kind: 'doc', ref: 'RHEL 10 — documentația docs.redhat.com necitită (HTTP 403 la accesările din C2); de confirmat la review' },
  ],
};
