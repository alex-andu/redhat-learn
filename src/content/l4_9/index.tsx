import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_9 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Programele care rulează în fundal (SSH, sincronizarea timpului, firewall-ul) sunt <G id="systemd-service">servicii</G> gestionate de <G id="systemd">systemd</G> prin <G id="systemctl">systemctl</G>. Trebuie să știi două lucruri independente: <b>rulează acum?</b> (<code>start</code>, <code>stop</code>, <code>restart</code>, <code>status</code>) și <b>pornește la boot?</b> (<code>enable</code>, <code>disable</code>). Cerința tipică: <code>systemctl enable --now serviciu</code>, apoi verifici cu <code>is-active</code> și <code>is-enabled</code> și, la final, cu un reboot.
          </p>
          <p>Obiectivele oficiale: <i>„Start, stop, and check the status of network services”</i>, <i>„Start and stop services and configure services to start automatically at boot”</i>, <i>„Configure network services to start automatically at boot”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un server nu face nimic util dacă nu rulează servicii: <code>sshd</code> ca să te poți conecta, <code>chronyd</code> ca să aibă ora corectă, <code>firewalld</code> ca să filtreze traficul. Aceste programe trebuie pornite la boot, supravegheate (să fie repornite dacă se prăbușesc) și oprite ordonat.
          </p>
          <p>
            systemd face asta printr-un format unic de „descriere”, fișierul de unitate. Înainte, fiecare serviciu avea propriul script de pornire și fiecare administrator avea propriile obiceiuri. Acum ai o singură comandă (<code>systemctl</code>) pentru toate.
          </p>
          <Analogy>Un serviciu este ca un angajat al clădirii: portarul, paznicul, electricianul. „Active” înseamnă că este la serviciu <i>acum</i>. „Enabled” înseamnă că este trecut în program și va veni <i>automat</i> mâine dimineață. Poți chema un angajat doar azi (<code>start</code>), îl poți trece în program fără să vină acum (<code>enable</code>), sau ambele (<code>enable --now</code>).</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Fișierul de unitate</h4>
          <p>
            Fiecare serviciu are un fișier <code>nume.service</code> în <code>/usr/lib/systemd/system/</code> (instalat de pachet) sau în <code>/etc/systemd/system/</code> (al administratorului, cu prioritate). Are trei secțiuni principale:
          </p>
          <Table head={['Secțiune', 'Conține', 'Exemple de linii']} rows={[
            [<code>[Unit]</code>, 'descriere și dependențe/ordine', <><code>Description=</code>, <code>After=network.target</code></>],
            [<code>[Service]</code>, 'cum se pornește procesul', <><code>ExecStart=</code>, <code>Restart=</code>, <code>User=</code></>],
            [<code>[Install]</code>, 'ce se întâmplă la „enable”', <code>WantedBy=multi-user.target</code>],
          ]} />
          <h4>Ce înseamnă „enable”</h4>
          <p>
            <code>systemctl enable x</code> citește linia <code>WantedBy=multi-user.target</code> din <code>[Install]</code> și creează o legătură simbolică <code>/etc/systemd/system/multi-user.target.wants/x.service</code> către fișierul de unitate. La boot, când systemd atinge <code>multi-user.target</code> (L4.2), pornește tot ce este în acel director <code>.wants</code>. <code>disable</code> șterge legătura. Nu este nicio „bază de date”: este doar o legătură pe disc.
          </p>
          <h4>Cele două axe</h4>
          <Table head={['', 'enabled', 'disabled']} rows={[
            [<b>active</b>, 'rulează și va porni la boot', 'rulează acum, dar nu și după reboot'],
            [<b>inactive</b>, 'nu rulează acum, dar va porni la boot', 'oprit și nu pornește la boot'],
          ]} />
          <p><G id="unit-active-enabled">Active și enabled</G> sunt independente; cerințele de examen le cer, de regulă, pe ambele.</p>
          <h4>Stările din <code>status</code></h4>
          <Table head={['Active:', 'Înseamnă']} rows={[
            [<code>active (running)</code>, 'procesul rulează'],
            [<code>active (exited)</code>, 'a rulat o comandă de unică folosință, cu succes'],
            [<code>inactive (dead)</code>, 'nu rulează'],
            [<code>failed</code>, 'a pornit și a eșuat (cod de eroare, semnal, depășire de timp)'],
            [<code>activating</code>, 'în curs de pornire'],
          ]} />
          <h4>Alte stări de boot</h4>
          <ul>
            <li><code>static</code>: unitatea nu are secțiune <code>[Install]</code>; nu poate fi activată direct, pornește doar ca dependență a altei unități.</li>
            <li><code>masked</code>: blocată (<G id="masked-unit">mask</G>): legată de <code>/dev/null</code>; nu poate fi pornită nici manual.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Target-uri</b> (L4.2): <code>enable</code> leagă serviciul de un target; target-ul implicit determină ce pornește la boot.</li>
            <li><b>Jurnale</b> (L4.7, L4.8): <code>status</code> arată ultimele linii; <code>journalctl -u</code> pe toate.</li>
            <li><b>Procese și semnale</b> (L4.4): <code>stop</code> trimite SIGTERM; un serviciu repornit de <code>Restart=</code> nu se oprește cu <code>kill</code>.</li>
            <li><b>Firewall și rețea</b> (C8): un serviciu de rețea trebuie să ruleze <i>și</i> să fie permis de firewall.</li>
            <li><b>Pachete</b> (C2): serviciul există doar dacă pachetul e instalat; unele pachete nu activează serviciul automat.</li>
            <li><b>SELinux</b> (C10): un serviciu poate eșua la pornire din cauza unei politici SELinux.</li>
            <li><b>Boot</b> (L4.1): serviciile <code>enabled</code> pornesc singure; la oprire sunt oprite în ordine inversă.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>După instalarea unui pachet de server (<code>dnf install</code>): îl pornești și îl activezi.</li>
            <li>După schimbarea unei configurații: <code>reload</code> sau <code>restart</code>.</li>
            <li>La depanare: <code>status</code>, <code>journalctl -u</code>, <code>systemctl --failed</code>.</li>
            <li>La examen: aproape fiecare sarcină cu un serviciu cere <code>enable --now</code> și verificare după reboot (C7-2, C8-3).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem de test, ca root sau cu <code>sudo</code>. Numele de servicii din exemple (<code>sshd</code>, <code>chronyd</code>, <code>firewalld</code>) sunt ilustrative: unele pot lipsi dacă pachetul nu este instalat. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10.
        </Callout>

        <h4>1. Vezi starea</h4>
        <CodeBlock title="comenzi" code={`systemctl status sshd\nsystemctl is-active sshd\nsystemctl is-enabled sshd\nsystemctl is-failed sshd\nsystemctl list-units --type=service\nsystemctl list-units --type=service --state=failed\nsystemctl --failed\nsystemctl list-unit-files --type=service`} explain={[
          ['status', 'starea completă a unității (Loaded, Active, PID, memorie, ultimele linii de jurnal). q iese din pager.'],
          ['is-active', 'un cuvânt: active, inactive, failed… Cod de ieșire 0 dacă este activ (util în scripturi).'],
          ['is-enabled', 'un cuvânt: enabled, disabled, static, masked.'],
          ['is-failed', 'răspunde „failed” dacă unitatea a eșuat.'],
          ['list-units --type=service', 'serviciile ÎNCĂRCATE acum (implicit doar cele active).'],
          ['--state=failed', 'filtrează după starea: failed, active, inactive.'],
          ['--failed', 'scurtătură pentru toate unitățile eșuate.'],
          ['list-unit-files', 'toate fișierele de unitate de pe disc cu starea de boot (enabled/disabled/static/masked), chiar dacă nu sunt încărcate.'],
        ]} />

        <h4>2. Pornește, oprește, repornește</h4>
        <CodeBlock title="comenzi (ca root)" code={`systemctl start chronyd\nsystemctl stop chronyd\nsystemctl restart chronyd\nsystemctl reload sshd\nsystemctl try-restart chronyd\nsystemctl reload-or-restart sshd`} explain={[
          ['start', 'pornește acum; nu schimbă comportamentul la boot.'],
          ['stop', 'oprește acum (trimite SIGTERM, apoi SIGKILL dacă nu se oprește la timp).'],
          ['restart', 'stop apoi start; procesul primește un PID nou; conexiunile active se întrerup.'],
          ['reload', 'cere serviciului să își recitească configurația fără oprire (dacă o suportă); PID-ul rămâne.'],
          ['try-restart', 'repornește doar dacă rulează.'],
          ['reload-or-restart', 'reload dacă serviciul suportă, altfel restart.'],
        ]} />

        <h4>3. Activează sau dezactivează la boot</h4>
        <CodeBlock title="comenzi (ca root)" code={`systemctl enable chronyd\nsystemctl enable --now chronyd\nsystemctl disable chronyd\nsystemctl disable --now chronyd\nsystemctl mask cups\nsystemctl unmask cups`} explain={[
          ['enable', 'creează legătura simbolică pentru boot; nu pornește serviciul acum.'],
          ['enable --now', 'enable + start într-un singur pas (forma uzuală la examen).'],
          ['disable', 'șterge legătura; serviciul rămâne în starea curentă.'],
          ['disable --now', 'disable + stop.'],
          ['mask / unmask', 'blochează / deblochează complet unitatea (legătură către /dev/null).'],
        ]} />

        <h4>4. Citește unitatea și actualizările</h4>
        <CodeBlock title="comenzi" code={`systemctl cat sshd\nsystemctl show sshd -p ActiveState -p UnitFileState\nsystemctl daemon-reload\nsystemctl reset-failed\nsystemctl list-dependencies sshd`} explain={[
          ['systemctl cat sshd', 'afișează fișierul de unitate (și drop-in-urile), ca să vezi ExecStart=, Restart=, WantedBy=.'],
          ['systemctl show … -p …', 'afișează proprietăți specifice, util în scripturi.'],
          ['daemon-reload', 'recitește fișierele de unitate; obligatoriu după ce editezi sau creezi o unitate.'],
          ['reset-failed', 'șterge starea „failed” după ce ai reparat cauza.'],
          ['list-dependencies', 'arată ce ar trebui să ruleze înainte/împreună cu unitatea.'],
        ]} />

        <h4>5. Fluxul complet pentru un serviciu nou</h4>
        <CodeBlock title="comenzi (ca root)" code={`dnf install chrony\nsystemctl enable --now chronyd\nsystemctl status chronyd\nsystemctl is-enabled chronyd\nsystemctl is-active chronyd\njournalctl -u chronyd -b --no-pager | tail -5\nsystemctl reboot`} explain={[
          ['dnf install chrony', 'instalează pachetul care aduce serviciul (L2.2). Numele pachetului poate diferi de numele unității.'],
          ['enable --now', 'activează și pornește.'],
          ['status, is-enabled, is-active', 'confirmă cele trei lucruri: rulează, la boot, fără erori.'],
          ['journalctl -u chronyd', 'mesajele serviciului (L4.7).'],
          ['reboot', 'testul de persistență.'],
        ]} />

        <h4>6. Un exemplu de unitate (doar recunoaștere)</h4>
        <CodeBlock title="/etc/systemd/system/exemplu.service" code={`[Unit]\nDescription=Exemplu de serviciu\nAfter=network.target\n\n[Service]\nExecStart=/usr/local/bin/exemplu.sh\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target`} explain={[
          ['Description=', 'text afișat în status.'],
          ['After=network.target', 'pornește după ce rețeaua de bază este gata (ordine, nu dependență).'],
          ['ExecStart=', 'comanda care pornește procesul (cale absolută).'],
          ['Restart=on-failure', 'repornește automat dacă se termină cu eroare.'],
          ['WantedBy=multi-user.target', 'la enable, serviciul este legat de acest target.'],
        ]} />
        <p className="small">Crearea de unități proprii nu este necesară pentru obiectivele oficiale ale capitolului; exemplul arată doar cum sunt alcătuite. După creare: <code>systemctl daemon-reload</code>, apoi <code>enable --now exemplu</code>.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="systemctl status" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl status sshd\n● sshd.service - OpenSSH server daemon\n     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled; preset: enabled)\n     Active: active (running) since Mon 2026-11-16 08:12:30 UTC; 6h ago\n       Docs: man:sshd(8)\n             man:sshd_config(5)\n   Main PID: 812 (sshd)\n      Tasks: 1 (limit: 22952)\n     Memory: 4.2M\n        CPU: 187ms\n     CGroup: /system.slice/sshd.service\n             └─812 "sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups"\n\nNov 16 08:12:30 server1 systemd[1]: Started OpenSSH server daemon.\nNov 16 08:12:30 server1 sshd[812]: Server listening on 0.0.0.0 port 22.`} />
        <p className="small"><b>●</b> verde = activ. <code>Loaded</code>: fișierul de unitate, <code>enabled</code> (la boot) și <code>preset</code> (recomandarea implicită a distribuției). <code>Active</code>: starea curentă și de când. <code>Main PID</code>: procesul principal. <code>Tasks</code>, <code>Memory</code>, <code>CPU</code>: consum. <code>CGroup</code>: grupul de procese ținut de systemd. La final, ultimele linii de jurnal. Formatul și valorile depind de versiune.</p>
        <CodeBlock title="serviciu eșuat" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl status exemplu\n× exemplu.service - Exemplu de serviciu\n     Loaded: loaded (/etc/systemd/system/exemplu.service; enabled; preset: disabled)\n     Active: failed (Result: exit-code) since Mon 2026-11-16 14:30:02 UTC; 5s ago\n    Process: 5102 ExecStart=/usr/local/bin/exemplu.sh (code=exited, status=203/EXEC)\n   Main PID: 5102 (code=exited, status=203/EXEC)\nNov 16 14:30:02 server1 systemd[1]: exemplu.service: Main process exited, code=exited, status=203/EXEC\nNov 16 14:30:02 server1 systemd[1]: exemplu.service: Failed with result 'exit-code'.`} />
        <p className="small"><code>×</code> roșu = eșuat. <code>status=203/EXEC</code> indică, de regulă, că systemd nu a putut executa comanda din <code>ExecStart=</code> (cale greșită sau fișier neexecutabil). Detaliile sunt în jurnal; codurile exacte se verifică în <code>systemd.exec(5)</code>.</p>
        <CodeBlock title="is-active / is-enabled / list-unit-files" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl is-active chronyd; systemctl is-enabled chronyd\nactive\nenabled\n[root@server1 ~]# systemctl list-unit-files --type=service | head -5\nUNIT FILE                         STATE    PRESET\nauditd.service                    enabled  enabled\nchronyd.service                   enabled  enabled\ncups.service                      disabled disabled\ndbus-broker.service               enabled  enabled`} />
        <p className="small"><code>STATE</code> = starea de boot (<code>enabled</code>, <code>disabled</code>, <code>static</code>, <code>masked</code>); <code>PRESET</code> = recomandarea distribuției. Serviciile din listă sunt exemple și pot lipsi sau diferi.</p>
        <CodeBlock title="enable --now" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl enable --now chronyd\nCreated symlink /etc/systemd/system/multi-user.target.wants/chronyd.service → /usr/lib/systemd/system/chronyd.service.\n[root@server1 ~]# ls -l /etc/systemd/system/multi-user.target.wants/ | grep chronyd\nlrwxrwxrwx. 1 root root 42 Nov 16 14:35 chronyd.service -> /usr/lib/systemd/system/chronyd.service`} />
        <p className="small">Mesajul <code>Created symlink</code> arată exact mecanismul <code>enable</code>: o legătură simbolică în directorul <code>.wants</code> al target-ului.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Rulează:</b> <code>systemctl is-active NUME</code> → <code>active</code>.</li>
            <li><b>La boot:</b> <code>systemctl is-enabled NUME</code> → <code>enabled</code>.</li>
            <li><b>Fără erori:</b> <code>systemctl status NUME</code> (fără <code>failed</code>), <code>systemctl --failed</code> fără intrări relevante.</li>
            <li><b>Mesaje:</b> <code>journalctl -u NUME -b</code>.</li>
            <li><b>Accesibil din rețea</b> (opțional, C8): <code>ss -tlnp</code> arată portul în ascultare; firewall-ul îl permite.</li>
            <li><b>Persistență:</b> reboot, apoi aceleași comenzi.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <b>Persistent:</b> <code>enable</code>/<code>disable</code>/<code>mask</code> (legături pe disc), fișierele din <code>/etc/systemd/system/</code>. <b>Temporar:</b> <code>start</code>/<code>stop</code>/<code>restart</code>/<code>isolate</code>. Cerința „serviciul trebuie să ruleze după reboot” înseamnă obligatoriu <code>enable</code>. Confirmare manuală: <code>systemctl reboot</code>, apoi <code>is-active</code> și <code>is-enabled</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Unit … could not be found</code>, 'pachet lipsă sau nume greșit', <code>systemctl list-unit-files | grep NUME</code>, <><code>dnf install</code> (L2.2)</>],
          [<code>Job for X failed</code>, 'configurare greșită sau dependență', <><code>systemctl status X</code>; <code>journalctl -xeu X</code></>, 'corectează cauza, apoi start'],
          ['status 203/EXEC', 'ExecStart= greșit (cale, permisiuni)', <code>systemctl cat X</code>, <>corectează calea, <code>chmod +x</code>, <code>daemon-reload</code></>],
          ['serviciul nu pornește la boot', 'nu este enabled', <code>systemctl is-enabled X</code>, <><code>systemctl enable X</code></>],
          ['modificarea unității nu are efect', 'lipsește daemon-reload', <><code>systemctl status X</code> (avertisment)</>,<><code>systemctl daemon-reload</code>, apoi restart</>],
          ['serviciul rulează dar nu e accesibil', 'firewall sau port', <code>ss -tlnp</code>, 'vezi C8 (firewalld)'],
          ['unitate blocată', 'este masked', <code>systemctl is-enabled X</code>, <><code>systemctl unmask X</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Rulezi doar <code>start</code> și uiți <code>enable</code> (sau invers). Folosește <code>enable --now</code>.</>,
          <>Nu verifici după reboot.</>,
          <>Editezi o unitate și uiți <code>daemon-reload</code>.</>,
          <>Confunzi <code>restart</code> (întrerupe conexiunile) cu <code>reload</code> (nu).</>,
          <>Crezi că <code>disable</code> oprește serviciul: nu, doar elimină pornirea la boot.</>,
          <>Oprești <code>sshd</code> în timp ce ești conectat prin SSH.</>,
          <>Presupui că un serviciu de rețea „care rulează” este și accesibil: firewall-ul poate bloca.</>,
          <>Scrii greșit numele (<code>sshd</code> vs <code>ssh</code>; <code>chronyd</code> vs <code>chrony</code>).</>,
          <>Ignori eroarea din <code>status</code> / <code>journalctl</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: socket activation, drop-in-uri, sandboxing și timere">
        <p>
          Unele servicii nu rulează permanent: <i>socket activation</i> (unități <code>.socket</code>) lasă systemd să asculte pe port și să pornească serviciul abia la prima conexiune. Verifică cu <code>systemctl list-sockets</code>.
        </p>
        <p>
          <code>systemctl edit NUME</code> creează un drop-in <code>/etc/systemd/system/NUME.service.d/override.conf</code> în care suprascrii doar liniile necesare, fără să modifici fișierul pachetului. <code>systemctl edit --full</code> copiază întreaga unitate. După editare, systemd face singur <code>daemon-reload</code>.
        </p>
        <p>
          systemd poate izola serviciile (<code>ProtectSystem=</code>, <code>PrivateTmp=</code>, limite de memorie și CPU prin cgroups). <code>systemd-analyze security NUME</code> evaluează expunerea unui serviciu. Aceste subiecte sunt în afara obiectivelor C4/C7/C8 și sunt menționate doar pentru orientare.
        </p>
        <p>
          Alternativa la <code>cron</code> (C3, obiective separate) sunt <i>timerele</i> systemd (<code>.timer</code>). Versiunea exactă de systemd din RHEL 10 și valorile implicite de <code>preset</code> nu au fost confirmate din documentația Red Hat (necitită, HTTP 403).
        </p>
      </DeepDive>
    </>
  );
}

export const L4_9: TopicModule = {
  id: 'L4.9',
  subtitle: 'systemctl start/stop/status/enable/disable/mask; active vs enabled; daemon-reload',
  studyTime: '≈90 min studiu + laborator',
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
  labs: [LAB_L4_9],
  sources: [
    { kind: 'man', ref: 'systemctl(1), systemd.service(5), systemd.unit(5), systemd.preset(5), systemd.exec(5)' },
    { kind: 'upstream', ref: 'freedesktop.org — systemd.special(7) (citit 2026-11-16)' },
    { kind: 'doc', ref: 'RHEL 10 — „Managing system services with systemctl”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
