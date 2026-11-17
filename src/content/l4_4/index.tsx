import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Fiecare program pornit este un <G id="process">proces</G> cu un număr unic (PID). Găsești procesele care consumă CPU sau memorie cu <code>ps</code> (instantaneu) și <code>top</code> (viu), apoi le oprești trimițându-le un <G id="signal">semnal</G> cu <code>kill</code>: <code>kill PID</code> (SIGTERM, oprire ordonată) și, doar dacă nu răspunde, <code>kill -9 PID</code> (SIGKILL, forțat). După nume: <code>pkill</code>, <code>killall</code>.
          </p>
          <p>Obiectivul oficial: <i>„Identify CPU/memory intensive processes and kill processes”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un sistem poate rula sute de procese simultan. Când „serverul e lent”, un proces consumă prea mult CPU sau memorie, sau este blocat. Ca administrator trebuie să <b>găsești</b> vinovatul (nu să ghicești) și să îl <b>oprești</b> cu cea mai mică forță posibilă.
          </p>
          <p>
            Un program este un fișier pe disc; un proces este programul în execuție. Același program (de exemplu <code>sleep</code>) poate fi rulat de zece ori, ca zece procese diferite, cu PID-uri diferite. De aceea instrumentele lucrează cu PID-uri, nu cu nume de fișiere.
          </p>
          <Analogy>Un restaurant: fiecare comandă în lucru este un proces; chelnerul are o notă cu număr (PID). Dacă un bucătar blochează aragazul, mai întâi îi spui politicos să termine (SIGTERM). Dacă nu răspunde, îi scoți oala de pe foc (SIGKILL). Nu începi cu a doua variantă: ar rămâne mizerie după el.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Unde afli informațiile</h4>
          <p>
            Kernelul ține evidența proceselor și o expune în directorul virtual <code>/proc</code>: pentru fiecare PID există <code>/proc/PID/</code>. <code>ps</code> și <code>top</code> citesc de acolo; nu inventează nimic.
          </p>
          <h4>Un proces are</h4>
          <ul>
            <li><b>PID</b> (identificator) și <b>PPID</b> (părintele care l-a creat); primul proces este <code>systemd</code> (PID 1).</li>
            <li><b>proprietar</b> (utilizatorul sub care rulează), <b>stare</b>, memorie, prioritate (L4.5).</li>
          </ul>
          <Table head={['STAT', 'Înseamnă', 'Observație']} rows={[
            [<code>R</code>, 'rulează sau este gata de rulare', 'consumă CPU acum'],
            [<code>S</code>, 'doarme, așteaptă un eveniment', 'cea mai frecventă stare'],
            [<code>D</code>, 'doarme neîntreruptibil (de obicei I/O pe disc)', 'nu poate fi ucis până termină I/O'],
            [<code>T</code>, 'oprit (Ctrl+Z sau SIGSTOP)', 'se reia cu SIGCONT / fg'],
            [<G id="zombie-process">Z</G>, 'zombie: terminat, necitit de părinte', 'nu consumă resurse; se curăță prin părinte'],
          ]} />
          <h4>Semnalele</h4>
          <p>
            <code>kill</code> nu „ucide” direct: <b>trimite un semnal</b>. Procesul decide cum reacționează, cu două excepții: SIGKILL și SIGSTOP sunt aplicate de kernel și nu pot fi ignorate.
          </p>
          <Table head={['Semnal', 'Număr', 'Efect uzual']} rows={[
            [<code>SIGTERM</code>, '15 (implicit)', 'cere oprirea; procesul poate curăța și se poate opri'],
            [<code>SIGKILL</code>, '9', 'oprire imediată, fără curățare; nu poate fi interceptat'],
            [<code>SIGHUP</code>, '1', 'multe daemoane își reîncarcă configurația'],
            [<code>SIGINT</code>, '2', 'ce trimite Ctrl+C'],
            [<><code>SIGSTOP</code> / <code>SIGCONT</code></>, 'depinde de arhitectură', 'pauză / reluare'],
          ]} />
          <p>
            Un utilizator obișnuit poate trimite semnale doar proceselor lui; root, tuturor.
          </p>
          <h4>Load average</h4>
          <p>
            Cele trei cifre din <code>uptime</code> și <code>top</code> sunt <G id="load-average">load average</G> pe 1, 5 și 15 minute. Dacă depășesc numărul de nuclee CPU pe o perioadă lungă, sistemul este aglomerat.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Prioritate</b> (L4.5): după ce găsești un proces consumator, poți să îi reduci prioritatea (<code>renice</code>) în loc să îl oprești.</li>
            <li><b>Servicii systemd</b> (L4.9): un serviciu repornește singur un proces ucis (<code>Restart=</code>); îl oprești cu <code>systemctl stop</code>.</li>
            <li><b>Jurnale</b> (L4.7): un proces oprit de kernel pentru lipsă de memorie (OOM killer) lasă mesaje în jurnal.</li>
            <li><b>Pipe și redirecționare</b> (L1.5): <code>ps … | head</code>, <code>pgrep</code> în <code>$(…)</code>.</li>
            <li><b>Utilizatori</b> (L1.10): <code>sudo</code> pentru procesele altor utilizatori.</li>
            <li><b>Shell</b> (L1.1): <code>&amp;</code>, <code>jobs</code>, <code>fg</code>, <code>Ctrl+Z</code>, <code>kill %1</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Server lent: <code>uptime</code>, apoi <code>top</code> sau <code>ps --sort</code> ca să găsești consumatorul.</li>
            <li>Program blocat care nu răspunde: <code>kill</code>, apoi <code>kill -9</code> la nevoie.</li>
            <li>Reîncărcare de configurație fără oprire: <code>kill -HUP PID</code> (pentru servicii care o suportă; preferat, <code>systemctl reload</code>, L4.9).</li>
            <li>La examen: „identify and kill the process using most CPU/memory”; verifici cu <code>ps</code> că a dispărut.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b> (PID-uri, procente construite); nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Listează procesele cu <code>ps</code></h4>
        <CodeBlock title="comenzi" code={`ps\nps aux\nps -ef\nps -u student\nps -p 1234\nps -ef --forest`} explain={[
          ['ps', 'fără opțiuni: doar procesele din terminalul curent.'],
          ['ps aux', 'a = procesele tuturor utilizatorilor; u = format cu USER, %CPU, %MEM; x = și procesele fără terminal. Stilul BSD, fără liniuță.'],
          ['ps -ef', '-e = toate procesele; -f = format complet (UID, PID, PPID, CMD). Stilul UNIX, cu liniuță.'],
          ['ps -u student', '-u = procesele unui utilizator.'],
          ['ps -p 1234', '-p = doar procesul cu acest PID.'],
          ['--forest', 'desenează arborele părinte-copil în coloana CMD.'],
        ]} />

        <h4>2. Alege coloanele și ordinea: găsește consumatorii</h4>
        <CodeBlock title="comenzi" code={`ps -eo pid,ppid,user,%cpu,%mem,stat,cmd --sort=-%cpu | head -10\nps -eo pid,user,%mem,rss,cmd --sort=-%mem | head -6`} explain={[
          ['-e', 'toate procesele.'],
          ['-o lista', 'alegi tu coloanele: pid, ppid (părinte), user, %cpu, %mem, stat (starea), rss (memoria fizică în KiB), cmd (comanda).'],
          ['--sort=-%cpu', 'ordonare descrescătoare după CPU; minusul inversează (fără el ar fi crescător).'],
          ['--sort=-%mem', 'la fel, după memorie.'],
          ['| head -10', 'antet + primele 9 procese (L1.5).'],
        ]} />

        <h4>3. Monitorizare interactivă cu <code>top</code></h4>
        <CodeBlock title="comenzi și taste" code={`top\n# în top:\n#   P  ordonare după CPU       M  ordonare după memorie\n#   1  arată fiecare nucleu     k  trimite un semnal unui PID\n#   h  ajutor                   q  ieșire\ntop -b -n 1 | head -15\ntop -u student`} explain={[
          ['top', 'tabel actualizat la câteva secunde. Antetul arată load average, procese, CPU, memorie.'],
          ['P / M', 'schimbă coloana după care se ordonează.'],
          ['k', 'cere un PID, apoi un semnal (implicit 15) și îl trimite.'],
          ['-b', 'batch: afișează text simplu, nu interfață interactivă (pentru pipe sau fișiere).'],
          ['-n 1', 'o singură iterație, apoi iese.'],
          ['-u student', 'doar procesele acestui utilizator.'],
        ]} />

        <h4>4. Găsește PID-ul după nume</h4>
        <CodeBlock title="comenzi" code={`pgrep sshd\npgrep -a sshd\npgrep -u student\npidof sshd\npgrep -af "sleep 600"`} explain={[
          ['pgrep nume', 'afișează PID-urile proceselor al căror NUME conține textul.'],
          ['-a', 'afișează și linia de comandă.'],
          ['-u student', 'doar procesele acestui utilizator.'],
          ['-f', 'caută în linia completă de comandă (nu doar în nume).'],
          ['pidof nume', 'PID-urile proceselor cu numele exact.'],
        ]} />

        <h4>5. Oprește procese: <code>kill</code>, <code>pkill</code>, <code>killall</code></h4>
        <CodeBlock title="comenzi" code={`kill -l\nkill 4321\nkill -9 4321\nkill -HUP 4321\nkill -STOP 4321\nkill -CONT 4321\nkillall firefox\npkill -u student sleep\nkill %1`} explain={[
          ['kill -l', 'listează semnalele cu numele și numărul lor.'],
          ['kill 4321', 'trimite SIGTERM (15), cerere de oprire ordonată.'],
          ['kill -9 4321', 'SIGKILL (sau -KILL): oprire forțată; ultima soluție.'],
          ['kill -HUP 4321', 'SIGHUP: multe servicii își reîncarcă configurația.'],
          ['-STOP / -CONT', 'pun procesul în pauză / îl reiau.'],
          ['killall nume', 'trimite SIGTERM tuturor proceselor cu numele exact.'],
          ['pkill -u student sleep', 'pkill potrivește după nume (expresie regulată); -u limitează la un utilizator.'],
          ['kill %1', 'un job din fundal al shell-ului curent, după numărul din jobs.'],
        ]} />
        <Callout kind="warn" title="Înainte de kill">
          Confirmă PID-ul cu <code>ps -p PID -o pid,user,cmd</code>. Încearcă mereu SIGTERM înainte de SIGKILL. Un <code>pkill</code> cu nume general (<code>pkill bash</code>) poate opri sesiunea ta.
        </Callout>

        <h4>6. Memorie, încărcare, joburi</h4>
        <CodeBlock title="comenzi" code={`free -h\nuptime\nsleep 300 &\njobs\nfg %1`} explain={[
          ['free -h', 'memorie totală, folosită, liberă, cache; -h = unități pe înțelesul omului (Mi, Gi).'],
          ['uptime', 'load average pe 1, 5 și 15 minute.'],
          ['… &', 'pornește comanda în fundal.'],
          ['jobs', 'joburile din fundal ale acestui shell.'],
          ['fg %1', 'aduce jobul 1 în prim-plan; Ctrl+C îl oprește.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ps aux" kind="session" label="illustrative" code={`[student@server1 ~]$ ps aux | head -4\nUSER   PID %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND\nroot     1  0.1  0.4 176236 17792 ?     Ss   08:12   0:02 /usr/lib/systemd/systemd rhgb\nroot     2  0.0  0.0      0     0 ?     S    08:12   0:00 [kthreadd]\nstudent 4321 97.8 0.0   2552   896 pts/0 R    10:30   2:11 yes`} />
        <p className="small"><code>USER</code> = proprietar; <code>PID</code>; <code>%CPU</code>, <code>%MEM</code> = procentele de resurse; <code>VSZ</code> = memorie virtuală (KiB); <code>RSS</code> = memorie fizică efectiv folosită (KiB); <code>TTY</code> = terminalul (<code>?</code> = fără); <code>STAT</code> = starea (<code>R</code> rulează, <code>Ss</code> doarme, lider de sesiune); <code>START</code>/<code>TIME</code> = ora de pornire / timpul CPU consumat; <code>COMMAND</code>. Numele între paranteze pătrate sunt fire ale kernelului. Valorile sunt exemple.</p>
        <CodeBlock title="top (antet)" kind="session" label="illustrative" code={`top - 10:33:12 up  2:21,  2 users,  load average: 1.02, 0.60, 0.30\nTasks: 142 total,   2 running, 140 sleeping,   0 stopped,   0 zombie\n%Cpu(s): 26.0 us,  0.5 sy,  0.0 ni, 73.4 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st\nMiB Mem :   3736.0 total,   2412.1 free,    801.4 used,    522.5 buff/cache\nMiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   2692.1 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 4321 student   20   0    2552    896    784 R  98.0   0.0   2:30.11 yes`} />
        <p className="small"><code>load average</code> cu o valoare ~1 pe un sistem cu 4 nuclee este normal. <code>us</code> = CPU pe programe utilizator, <code>sy</code> = kernel, <code>id</code> = liber, <code>wa</code> = așteaptă I/O. <code>avail Mem</code> estimează memoria disponibilă fără swap. <code>PR</code>/<code>NI</code> = prioritate/„nice” (L4.5). <code>S</code> = starea. Cifrele sunt orientative.</p>
        <CodeBlock title="kill și verificare" kind="session" label="illustrative" code={`[student@server1 ~]$ kill 4321\n[student@server1 ~]$ pgrep -a yes\n[1]+  Terminated              yes > /dev/null\n[student@server1 ~]$ bash -c 'trap "" TERM; sleep 600' &\n[1] 4400\n[student@server1 ~]$ kill 4400; ps -p 4400\n  PID TTY          TIME CMD\n 4400 pts/0    00:00:00 bash\n[student@server1 ~]$ kill -9 4400\n[1]+  Killed                  bash -c 'trap "" TERM; sleep 600'`} />
        <p className="small">„Terminated” = SIGTERM a avut efect; „Killed” = SIGKILL. În al doilea caz, procesul a ignorat SIGTERM și a rămas în <code>ps</code> până la <code>kill -9</code>. Mesajele provin din shell și pot diferi ușor.</p>
        <CodeBlock title="kill -l (fragment)" kind="session" label="illustrative" code={`[student@server1 ~]$ kill -l | head -3\n 1) SIGHUP\t 2) SIGINT\t 3) SIGQUIT\t 4) SIGILL\t 5) SIGTRAP\n 6) SIGABRT\t 7) SIGBUS\t 8) SIGFPE\t 9) SIGKILL\t10) SIGUSR1\n11) SIGSEGV\t12) SIGUSR2\t13) SIGPIPE\t14) SIGALRM\t15) SIGTERM`} />
        <p className="small">Lista asociază numărul cu numele. Poți folosi oricare: <code>kill -9</code>, <code>kill -KILL</code>, <code>kill -SIGKILL</code>.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>ps -p PID</code> (sau <code>pgrep -a nume</code>): fără rezultat = procesul nu mai rulează.</li>
            <li>Re-rulează <code>top</code> / <code>ps --sort</code>: consumatorul a dispărut din vârf.</li>
            <li><code>uptime</code>: load average-ul scade în câteva minute.</li>
            <li>Dacă procesul revine, verifică <code>systemctl status</code> (L4.9): îl repornește un serviciu.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Procesele nu au configurare persistentă: dispar la oprirea sistemului, iar cele ucise nu revin, <b>cu excepția</b> celor gestionate de systemd cu <code>Restart=</code>. Pentru a opri definitiv un program care pornește singur la boot, se folosește <code>systemctl disable --now serviciu</code> (L4.9), nu <code>kill</code>. Confirmare manuală: după reboot, <code>pgrep -a nume</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Operation not permitted</code>, 'procesul aparține altui utilizator', <code>ps -o user -p PID</code>, <>folosește <code>sudo kill PID</code></>],
          [<code>No such process</code>, 'PID greșit sau procesul s-a oprit', <code>ps -p PID</code>, 'reia căutarea PID-ului'],
          ['procesul nu se oprește cu kill', 'ignoră SIGTERM sau este în stare D', <code>ps -o stat -p PID</code>, <><code>kill -9</code>; în stare D, rezolvă cauza I/O</>],
          ['procesul reapare după kill', 'repornit de un serviciu systemd', <code>systemctl status</code>, <><code>systemctl stop</code> / <code>disable</code></>],
          ['zombie (Z) rămâne', 'părintele nu l-a curățat', <code>ps -o ppid -p PID</code>, 'oprește sau repară părintele'],
          [<>kill a oprit sesiunea mea</>, <>nume prea general la <code>pkill</code></>, <><code>pgrep -a nume</code> înainte</>, 'folosește -x sau PID-ul exact'],
          ['sistemul e lent dar nimic nu consumă CPU', 'memorie plină / swap / I/O', <><code>free -h</code>, <code>top</code> (wa)</>, 'investighează memoria și discul'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Începi direct cu <code>kill -9</code>.</>,
          <>Ucis PID-ul greșit (pe baza unei liste veche): verifică înainte.</>,
          <>Uiți minusul în <code>--sort=-%cpu</code> și vezi procesele cele mai puțin active.</>,
          <>Confunzi <code>kill</code> (PID) cu <code>killall</code>/<code>pkill</code> (nume).</>,
          <>Amesteci stilurile de opțiuni ale lui <code>ps</code>: <code>ps aux</code> (BSD, fără liniuță) și <code>ps -ef</code> (UNIX, cu liniuță) sunt două familii de opțiuni; folosește forma din lecție și nu le combina într-o singură comandă.</>,
          <>Încerci să ucizi un zombie.</>,
          <>Ucizi un proces gestionat de un serviciu, iar el reapare.</>,
          <>Uiți că un utilizator obișnuit nu poate opri procesele altora.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: /proc, OOM killer, stări D și semnale în scripturi">
        <p>
          <code>cat /proc/4321/status</code> și <code>ls -l /proc/4321/</code> arată informațiile brute folosite de <code>ps</code>: starea, memoria, fișierele deschise (<code>fd/</code>), linia de comandă (<code>cmdline</code>). Procesele sunt directoare pe un sistem de fișiere virtual, fără conținut real pe disc.
        </p>
        <p>
          Când memoria este epuizată, kernelul poate opri singur un proces (OOM killer) ales după un scor. Mesajele apar în jurnal (<code>journalctl -k</code>, L4.7); caută „Out of memory: Killed process”.
        </p>
        <p>
          Procesele în stare <code>D</code> așteaptă I/O și nu reacționează nici la SIGKILL până nu se termină operația; mulți D persistenți indică de obicei o problemă de disc sau de rețea (NFS).
        </p>
        <p>
          În scripturi, <code>trap 'comandă' TERM</code> interceptează un semnal; <code>kill -0 PID</code> nu trimite nimic, ci doar testează dacă PID-ul există și ai drept să îi trimiți semnale.
        </p>
      </DeepDive>
    </>
  );
}

export const L4_4: TopicModule = {
  id: 'L4.4',
  subtitle: 'ps, top, pgrep; semnale; kill, pkill, killall; load average',
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
  labs: [LAB_L4_4],
  sources: [
    { kind: 'man', ref: 'ps(1), top(1), kill(1), pkill(1)/pgrep(1), killall(1), signal(7), proc(5), free(1), uptime(1)' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com necitit (HTTP 403 în C4); ghid dedicat pentru procese negăsit după titlu; surse primare: man pages (din cunoștințe, nerecitite în sesiune)' },
  ],
};
