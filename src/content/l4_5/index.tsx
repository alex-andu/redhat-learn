import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_5 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Când mai multe procese cer același procesor, <G id="scheduler">planificatorul</G> kernelului decide cine primește mai mult. Influențezi decizia cu valoarea <G id="nice-value">nice</G>, de la <b>-20</b> (prioritate maximă) la <b>19</b> (minimă), implicit <b>0</b>. Pornești o comandă „amabilă” cu <code>nice -n 10 comandă</code> și schimbi un proces existent cu <code>renice -n 10 -p PID</code>. Un utilizator obișnuit poate doar să crească nice-ul; să îl scadă poate numai root.
          </p>
          <p>Obiectivul oficial: <i>„Adjust process scheduling”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un procesor (un nucleu) poate rula un singur lucru la un moment dat; sistemul le „alternează” atât de repede încât pare că rulează simultan. Dacă un proces cere mult CPU (o arhivare, o compilare, un backup), celelalte (serverul web, baza de date) încetinesc. Uneori vrei ca sarcina grea să se termine, dar <b>fără să deranjeze</b> restul.
          </p>
          <p>
            Nu vrei să o oprești (L4.4) și nici să o amâni; vrei s-o faci „mai puțin importantă”. Exact asta face nice: nu pune o limită de CPU, ci o <b>pondere</b>. Când nimeni altcineva nu cere procesorul, un proces cu nice 19 îl poate folosi la 100%; când apar concurenți, cedează.
          </p>
          <Analogy>Casele de la supermarket: toți clienții au aceeași prioritate (nice 0). Un client „amabil” (nice 19) lasă pe cei din spate să treacă înaintea lui, dar dacă nu e nimeni în spate, plătește fără să aștepte. Un client VIP (nice negativ) este lăsat să treacă primul; cine îl poate declara VIP? Doar directorul magazinului (root).</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Scala nice</h4>
          <Table head={['Nice', 'Prioritate', 'Cine poate seta']} rows={[
            ['-20', 'cea mai mare', 'doar root'],
            ['-1 … -19', 'peste normal', 'doar root'],
            ['0', 'normală (implicit)', '—'],
            ['1 … 19', 'sub normal', 'oricine, pentru procesele proprii (doar în sus)'],
          ]} />
          <p>
            Valoarea se păstrează în procesul însuși. Un proces nou o <b>moștenește</b> de la părinte: dacă lansezi un shell cu nice 10, tot ce pornești din el are 10.
          </p>
          <h4>NI vs PR</h4>
          <p>
            În <code>top</code>, coloana <code>NI</code> este nice-ul tău; <code>PR</code> este prioritatea internă calculată de kernel (pentru procese obișnuite, 20 + NI: nice 0 → PR 20; nice 19 → PR 39; nice -20 → PR 0). În <code>ps</code>, coloana <code>PRI</code> are altă scală; nu compara numerele între cele două programe. Cu <code>NI</code> lucrezi tu.
          </p>
          <h4>De ce doar root scade nice-ul</h4>
          <p>
            Dacă oricine și-ar putea crește prioritatea, toți și-ar pune -20 și ar fi egali din nou, în detrimentul serviciilor. De aceea creșterea priorității (scăderea nice-ului) este privilegiată.
          </p>
          <h4>Politici de planificare</h4>
          <p>
            Procesele obișnuite folosesc politica implicită (SCHED_OTHER), care ține cont de nice. Procesele de timp real (SCHED_FIFO, SCHED_RR) au altă logică și se gestionează cu <code>chrt</code>; sunt în afara obiectivului de examen, dar le recunoști din <code>sched(7)</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Procese și semnale</b> (L4.4): găsești consumatorul cu <code>ps</code>/<code>top</code>, apoi alegi între <code>kill</code> (oprești) și <code>renice</code> (îl faci amabil).</li>
            <li><b>tuned</b> (L4.6): un profil tuned poate regla parametri ai planificatorului; nice rămâne controlul tău per proces.</li>
            <li><b>systemd</b> (L4.9): <code>Nice=</code> într-o unitate de serviciu setează nice-ul la pornire (menționat).</li>
            <li><b>cron</b> (C3): joburile de întreținere se pornesc des cu <code>nice</code>.</li>
            <li><b>Utilizatori și sudo</b> (L1.10): scăderea nice-ului cere root.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Backup, arhivare, compilare, indexare: le pornești cu <code>nice -n 10</code> sau mai mult.</li>
            <li>Un proces deja pornit îți încetinește serverul: <code>renice -n 15 -p PID</code>.</li>
            <li>Un serviciu critic care trebuie favorizat: <code>sudo renice -n -5 -p PID</code>.</li>
            <li>La examen: „start a process with nice value X” sau „change the priority of PID Y”; verifici cu <code>ps -o pid,ni</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Vezi nice-ul</h4>
        <CodeBlock title="comenzi" code={`nice\nps -o pid,ni,pri,cmd -p $$\nps -eo pid,user,ni,%cpu,cmd --sort=-%cpu | head -5\ntop`} explain={[
          ['nice', 'fără argumente, afișează nice-ul shell-ului curent (de obicei 0).'],
          ['ps -o pid,ni,pri,cmd', '-o alege coloanele: PID, NI (nice), PRI (prioritate), comanda.'],
          ['-p $$', '$$ este PID-ul shell-ului curent; arată nice-ul sesiunii tale.'],
          ['--sort=-%cpu', 'ordonare descrescătoare după CPU (L4.4).'],
          ['top', 'în top, coloanele PR și NI; tasta r cere un PID și un nice nou.'],
        ]} />

        <h4>2. Pornește o comandă cu un anumit nice: <code>nice</code></h4>
        <CodeBlock title="comenzi" code={`nice -n 10 tar -czf /tmp/etc.tar.gz /etc\nnice -n 19 ./script-lung.sh &\nsudo nice -n -5 /usr/local/bin/critic\nnice -n 10 bash`} explain={[
          ['nice -n 10 COMANDĂ', '-n = valoarea de ADĂUGAT la nice-ul curent (de obicei 0, deci rezultatul este 10). Valori pozitive: prioritate mai mică.'],
          ['… &', 'în fundal (L4.4).'],
          ['sudo nice -n -5 …', 'valorile negative (prioritate mai mare) cer root; sintaxa este -n urmat de valoarea -5 (minus = valoare negativă).'],
          ['nice -n 10 bash', 'pornește un shell nou cu nice 10; tot ce lansezi din el moștenește 10.'],
        ]} />

        <h4>3. Schimbă nice-ul unui proces existent: <code>renice</code></h4>
        <CodeBlock title="comenzi" code={`renice -n 10 -p 4321\nrenice -n 15 -u student\nsudo renice -n -5 -p 4321\nps -o pid,ni,cmd -p 4321`} explain={[
          ['renice -n 10 -p 4321', '-n = noul nice (ABSOLUT, nu adaos, spre deosebire de nice), -p = PID. Un utilizator obișnuit poate doar crește valoarea, pe procesele proprii.'],
          ['-u student', 'aplică pe toate procesele unui utilizator.'],
          ['sudo renice -n -5 -p 4321', 'scăderea nice-ului (prioritate mai mare) cere root.'],
          ['ps -o pid,ni,cmd -p 4321', 'confirmă noua valoare.'],
        ]} />
        <Callout kind="warn" title="Capcană: nice vs renice">
          <code>nice -n 10</code> <b>adaugă</b> 10 la nice-ul curent al shell-ului și pornește o comandă <i>nouă</i>. <code>renice -n 10</code> <b>setează</b> nice-ul unui proces <i>existent</i> la 10. Pe un shell cu nice 0, rezultatul pare același, dar uneltele sunt diferite.
        </Callout>

        <h4>4. Afinitate CPU: <code>taskset</code> (folosit în laborator)</h4>
        <CodeBlock title="comenzi" code={`taskset -c 0 yes > /dev/null &\ntaskset -cp 5001\nnproc`} explain={[
          ['taskset -c 0 COMANDĂ', 'limitează comanda la nucleul CPU 0; în laborator, face ca două procese să concureze pentru același nucleu.'],
          ['taskset -cp PID', '-p = proces existent, -c = afișează lista de nuclee; arată pe ce nuclee poate rula PID.'],
          ['nproc', 'numărul de nuclee CPU disponibile.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ps cu nice" kind="session" label="illustrative" code={`[student@server1 ~]$ ps -eo pid,user,ni,pri,%cpu,cmd --sort=-%cpu | head -4\n  PID USER      NI PRI %CPU CMD\n 5001 student    0  19 93.4 yes\n 5002 student   15   4  5.1 yes\n  812 root       0  19  0.3 /usr/sbin/NetworkManager --no-daemon`} />
        <p className="small"><code>NI</code> = nice. <code>PRI</code> = prioritatea internă (în <code>ps</code> scala este alta decât <code>PR</code> din <code>top</code>). Procesul 5001 (nice 0) primește ~93% din nucleu, iar 5002 (nice 15) doar ~5% pentru că rulează pe același CPU. Valorile sunt exemple.</p>
        <CodeBlock title="renice" kind="session" label="illustrative" code={`[student@server1 ~]$ renice -n 10 -p 5001\n5001 (process ID) old priority 0, new priority 10\n[student@server1 ~]$ renice -n 0 -p 5001\nrenice: failed to set priority for 5001 (process ID): Permission denied\n[student@server1 ~]$ sudo renice -n 0 -p 5001\n5001 (process ID) old priority 10, new priority 0`} />
        <p className="small">„priority” din mesaj este nice-ul. Prima comandă merge (creștere). A doua eșuează (scădere ca utilizator obișnuit). A treia, cu <code>sudo</code>, reușește. Formularea exactă a mesajelor poate diferi între versiuni.</p>
        <CodeBlock title="top (coloane)" kind="session" label="illustrative" code={`  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 5001 student   20   0    2552    896    784 R  93.0   0.0   1:10.20 yes\n 5002 student   35  15    2552    880    780 R   5.0   0.0   0:04.11 yes`} />
        <p className="small"><code>PR</code> = prioritatea internă (20 pentru nice 0, 35 pentru nice 15 = 20 + NI). <code>NI</code> = nice. <code>S</code> = starea (<code>R</code> = rulează). Cifrele sunt orientative.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>ps -o pid,ni,cmd -p PID</code> arată nice-ul curent.</li>
            <li><code>top</code>: coloana <code>NI</code>, iar împărțirea %CPU între procesele care concurează.</li>
            <li>Dacă un <code>renice</code> eșuează, mesajul spune de ce (<code>Permission denied</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Nice-ul este o proprietate a procesului: dispare când procesul se termină și <b>nu</b> se păstrează la reboot. Dacă un serviciu trebuie să pornească mereu cu un anumit nice, valoarea se pune în unitatea systemd (<code>Nice=</code> în <code>[Service]</code>) sau în comanda din script/cron; aceasta este o configurare persistentă, în afara scopului acestei lecții. Confirmare manuală: după reboot și repornirea serviciului, <code>ps -o ni</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Permission denied</code>, 'scazi nice-ul sau modifici procesul altcuiva', <code>id</code>, <>folosește <code>sudo</code></>],
          ['nice nu pare să facă nimic', 'procesele nu concurează pentru același CPU', <code>nproc</code>, <>testează cu <code>taskset -c 0</code> sau încarcă toate nucleele</>],
          [<code>nice: invalid option</code>, 'ai scris o valoare fără -n sau formă veche', <code>man nice</code>, <>folosește <code>nice -n VALOARE comandă</code></>],
          ['proces nou nu are nice-ul dorit', 'a fost pornit înainte sau fără nice', <code>ps -o ni -p PID</code>, <>folosește <code>renice</code></>],
          ['No such process', 'PID greșit', <code>ps -p PID</code>, 'verifică PID-ul'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Crezi că un nice <b>mai mare</b> înseamnă prioritate mai mare. Este invers.</>,
          <>Folosești <code>nice</code> pentru un proces deja pornit sau <code>renice</code> pentru o comandă nouă.</>,
          <>Uiți <code>-p</code> (și PID-ul) la <code>renice</code>.</>,
          <>Încerci o valoare negativă fără root.</>,
          <>Confunzi <code>-n 10</code> de la <code>nice</code> (adaos) cu <code>-n 10</code> de la <code>renice</code> (valoare absolută).</>,
          <>Așteptări greșite: nice nu limitează procentul de CPU; este o pondere.</>,
          <>Presupui că nice se păstrează după repornirea procesului.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: nice vs. prioritate de timp real, cgroups și limite">
        <p>
          Nice este un instrument simplu, „bun-simț”. Pentru izolare mai fermă, systemd folosește <i>cgroups</i> (<code>CPUWeight=</code>, <code>CPUQuota=</code> în unități), care pot <b>limita</b> efectiv CPU, nu doar ponderea. Aceste mecanisme nu fac parte din obiectivul acestui capitol.
        </p>
        <p>
          Procesele de timp real (<code>chrt -f 50 comandă</code>, SCHED_FIFO) pot lăsa fără CPU procesele obișnuite dacă se blochează într-o buclă; de aceea sunt rezervate lui root și aplicațiilor care le cer explicit. <code>chrt -p PID</code> afișează politica curentă.
        </p>
        <p>
          Utilizatorii obișnuiți pot primi dreptul de a scădea nice-ul prin limita <code>nice</code> din <code>/etc/security/limits.conf</code>; implicit nu au acest drept. Detalii în <code>limits.conf(5)</code>; neverificat în ghidul RHEL 10.
        </p>
      </DeepDive>
    </>
  );
}

export const L4_5: TopicModule = {
  id: 'L4.5',
  subtitle: 'nice, renice, valoarea NI, PR vs NI, taskset pentru demonstrații',
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
  labs: [LAB_L4_5],
  sources: [
    { kind: 'man', ref: 'nice(1), renice(1), ps(1), top(1), sched(7), chrt(1), taskset(1), limits.conf(5)' },
    { kind: 'doc', ref: 'RHEL 10 — „Tuning scheduling policy”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
