import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L7_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <G id="systemd-timer">timer systemd</G> este o unitate cu extensia <code>.timer</code> care <b>pornește la momente programate o altă unitate</b> (de obicei un <code>.service</code> cu același nume). Lucrezi cu <b>perechi de fișiere</b>: <code>nume.service</code> (ce se execută) și <code>nume.timer</code> (când). Moment calendaristic: <G id="on-calendar"><code>OnCalendar=</code></G>; „la X după boot / după ultima rulare”: timere <G id="monotonic-timer">monotone</G>. Se activează <b>timer-ul</b> (<code>systemctl enable --now nume.timer</code>), se urmăresc cu <code>systemctl list-timers</code>, iar expresiile se testează cu <code>systemd-analyze calendar</code>.
          </p>
          <p>Obiectivul oficial: <i>„Schedule tasks using at, cron and systemd timer units”</i> (aici: <code>timer units</code>).</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Recapitulare: unități systemd</h4>
          <p>
            În L4.9 ai lucrat cu <b>servicii</b> (<code>.service</code>): „un program pe care systemd îl pornește și îl supraveghează”. systemd gestionează mai multe feluri de <b>unități</b> (<code>unit</code>), fiecare cu extensia ei: <code>.service</code> (programe), <code>.target</code> (grupuri/stări, L4.2), <code>.mount</code> (montări), <code>.socket</code> și <b><code>.timer</code></b> (declanșatoare de timp). O unitate este descrisă de un fișier text în format „INI” cu secțiuni între paranteze drepte (<code>[Unit]</code>, <code>[Service]</code>, <code>[Timer]</code>, <code>[Install]</code>) și linii <code>Cheie=valoare</code>.
          </p>
          <h4>Ce aduce un timer față de cron</h4>
          <p>
            Cron (L7.1) știe un singur lucru: „la ora X rulează comanda Y”. Un timer systemd face aceeași treabă, dar <b>moștenește tot ce știe systemd</b>:
          </p>
          <Table head={['Aspect', 'cron', 'systemd timer']} rows={[
            ['Jurnal / log', 'mail sau redirecționare manuală', <>automat în jurnal: <code>journalctl -u nume.service</code></>],
            ['Mediu', 'redus, fără configurare', 'definit în unitate (User=, Environment=, WorkingDirectory=, limite de resurse)'],
            ['Dependențe', 'nu există', 'Requires=, After=… față de alte unități'],
            ['Rulări ratate (mașină oprită)', 'sărite (anacron e separat)', <><code>Persistent=true</code> recuperează o rulare ratată</>],
            ['Împrăștierea încărcării', 'RANDOM_DELAY (specific cronie)', <code>RandomizedDelaySec=</code>],
            ['Rulare manuală pentru test', 'rulezi manual comanda', <><code>systemctl start nume.service</code> exact ca la timer</>],
            ['Validarea expresiei', 'nu există', <code>systemd-analyze calendar</code>],
            ['Simplitate', '1 linie', '2 fișiere + enable'],
          ]} />
          <Analogy>
            cron este un <b>bilet de hârtie lipit pe frigider</b> („marți la 18:00: scoate gunoiul”). Un timer systemd este un <b>reminder dintr-un calendar digital integrat cu agenda echipei</b>: același moment, dar cu istoric, dependențe și reluare dacă ai fost plecat.
          </Analogy>
          <p>
            Multe componente ale sistemului folosesc deja timere: curățarea fișierelor temporare, rotirea logurilor, <code>fstrim</code>, reîmprospătarea cache-ului dnf. Le vezi cu <code>systemctl list-timers</code>. Exemplele concrete diferă între versiuni (de confirmat pe RHEL 10).
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Perechea timer + service</h4>
          <p>
            Timer-ul în sine <b>nu execută nicio comandă</b>. Singura lui treabă este să ștampileze timpul și, la momentul potrivit, să <b>activeze (pornească) o altă unitate</b>. În mod normal această unitate este serviciul cu <b>același nume</b>: <code>backup.timer</code> activează <code>backup.service</code> (<code>systemd.timer(5)</code>: dacă <code>Unit=</code> lipsește, se folosește serviciul cu același nume; <code>Unit=</code> nu poate indica un nume ce se termină în <code>.timer</code>).
          </p>
          <ol>
            <li>Scrii <code>/etc/systemd/system/backup.service</code> (ce să ruleze, de obicei <code>Type=oneshot</code>: un program care rulează o dată și se termină).</li>
            <li>Scrii <code>/etc/systemd/system/backup.timer</code> (când).</li>
            <li><code>systemctl daemon-reload</code>: systemd recitește fișierele.</li>
            <li><code>systemctl enable --now backup.timer</code>: timer-ul este armat <b>și</b> va fi armat la fiecare boot.</li>
            <li>La momentul potrivit, systemd pornește <code>backup.service</code>; după ce acesta termină, revine în starea „inactive (dead)” și așteaptă următorul declanșator.</li>
          </ol>
          <Callout kind="warn" title="Se activează TIMER-ul, nu serviciul">
            Serviciul programat de obicei <b>nu are secțiune <code>[Install]</code></b> și nu se activează la boot. Dacă faci <code>enable backup.service</code> nu programezi nimic; <code>enable --now backup.timer</code> da. Faptul că <code>backup.service</code> arată „inactive (dead)” între rulări este <b>normal</b>.
          </Callout>

          <h4>2. Fișierul .service pentru un job „o dată pe rulare”</h4>
          <CodeBlock title="/etc/systemd/system/backup.service" kind="config" code={`[Unit]
Description=Copie de siguranta pentru /etc

[Service]
Type=oneshot
ExecStart=/usr/bin/tar -czf /var/backups/etc-backup.tar.gz /etc`} explain={[
            ['[Unit]', 'secțiunea cu informații generale despre unitate.'],
            ['Description=', 'textul afișat de systemctl status și în jurnal.'],
            ['[Service]', 'secțiunea specifică serviciilor.'],
            ['Type=oneshot', 'procesul rulează o dată și se termină; systemd consideră unitatea „terminată” după ce ExecStart se încheie.'],
            ['ExecStart=', 'comanda cu CALE ABSOLUTĂ (systemd nu caută în PATH); nu este interpretată de un shell: redirecționările (>, |) nu funcționează direct.'],
          ]} />

          <h4>3. Fișierul .timer</h4>
          <CodeBlock title="/etc/systemd/system/backup.timer" kind="config" code={`[Unit]
Description=Pornește backup.service in fiecare noapte

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true
RandomizedDelaySec=10min

[Install]
WantedBy=timers.target`} explain={[
            ['[Timer]', 'secțiunea cu directivele de timp.'],
            ['OnCalendar=*-*-* 02:30:00', 'în fiecare zi (an-lună-zi = *-*-*) la 02:30:00.'],
            ['Persistent=true', 'dacă mașina era oprită la 02:30, rularea ratată este recuperată o dată la pornire (systemd.timer(5)).'],
            ['RandomizedDelaySec=10min', 'adaugă o întârziere aleatoare 0–10 minute, ca mai multe mașini să nu lovească simultan același server.'],
            ['[Install]', 'ce se întâmplă la enable.'],
            ['WantedBy=timers.target', 'enable leagă timer-ul de timers.target, care este pornit la boot (convenție standard).'],
          ]} />
          <p className="small">
            Notă: <code>systemd.timer(5)</code> specifică implicit <code>Before=timers.target</code> pentru timere; linia <code>WantedBy=timers.target</code> este convenția folosită în practică pentru <code>enable</code> (din cunoștințe; de confirmat în documentația RHEL 10).
          </p>

          <h4>4. Cele două familii de timere</h4>
          <Table head={['Familie', 'Directivă', 'Se măsoară de la', 'Exemplu']} rows={[
            ['Calendar (ceas de perete)', <code>OnCalendar=</code>, 'data și ora reală', <code>OnCalendar=Mon..Fri 08:00</code>],
            ['Monoton', <code>OnBootSec=</code>, 'boot-ul sistemului', <code>OnBootSec=15min</code>],
            ['Monoton', <code>OnStartupSec=</code>, 'pornirea service manager-ului', <code>OnStartupSec=5min</code>],
            ['Monoton', <code>OnActiveSec=</code>, 'activarea timer-ului însuși', <code>OnActiveSec=30s</code>],
            ['Monoton', <code>OnUnitActiveSec=</code>, 'ultima ACTIVARE a serviciului', <code>OnUnitActiveSec=1h</code>],
            ['Monoton', <code>OnUnitInactiveSec=</code>, 'ultima DEZACTIVARE a serviciului', <code>OnUnitInactiveSec=10min</code>],
          ]} />
          <p>
            Valorile monotone sunt în secunde dacă nu pui unitate; sunt permise sufixe (<code>5h 30min</code>). Pot fi <b>combinate</b>: <code>OnBootSec=10min</code> + <code>OnUnitActiveSec=1h</code> = „la 10 minute după boot, apoi la fiecare oră de la ultima rulare” — un tipar clasic de „periodic după boot”. O valoare <code>OnBootSec</code>/<code>OnStartupSec</code> deja trecută la activarea timer-ului face ca job-ul să ruleze imediat (<code>systemd.timer(5)</code>).
          </p>

          <h4>5. Sintaxa calendaristică (systemd.time(7))</h4>
          <p>
            O expresie are până la trei părți opționale: <code>[zi-săptămână] [dată] [oră]</code>, de exemplu <code>Mon..Fri *-*-* 08:30:00</code>. Părțile omise iau valori implicite: oră omisă → <code>00:00:00</code>, dată omisă → <code>*-*-*</code>, secunde omise → <code>:00</code>.
          </p>
          <Table head={['Element', 'Sintaxă', 'Exemplu', 'Înțeles']} rows={[
            ['dată', <code>an-lună-zi</code>, <code>2026-12-24</code>, '24 decembrie 2026'],
            ['oră', <code>oră:minut:secundă</code>, <code>14:30:00</code>, '14:30'],
            ['orice valoare', <code>*</code>, <code>*-*-01</code>, 'prima zi a oricărei luni'],
            ['listă', <code>,</code>, <code>*-*-* 08,12,18:00:00</code>, 'la 08:00, 12:00, 18:00'],
            ['interval', <code>..</code>, <code>Mon..Fri</code>, 'luni până vineri'],
            ['pas', <code>/N</code>, <code>*:0/15</code>, 'la minutele 0, 15, 30, 45 din fiecare oră'],
            ['zi din săptămână', 'nume englezești (Mon, Tue, Wed …)', <code>Sat,Sun 10:00</code>, 'sâmbătă și duminică la 10:00'],
            ['ultima zi a lunii', <code>~</code>, <code>*-*~01</code>, 'ultima zi a fiecărei luni (~N = a N-a zi de la sfârșit; ~01 = ultima)'],
          ]} />
          <p>Prescurtări cu sens fix (<code>systemd.time(7)</code>):</p>
          <Table head={['Prescurtare', 'Normalizat', 'Înțeles']} rows={[
            [<code>minutely</code>, <code>*-*-* *:*:00</code>, 'în fiecare minut'],
            [<code>hourly</code>, <code>*-*-* *:00:00</code>, 'la fiecare oră fixă'],
            [<code>daily</code>, <code>*-*-* 00:00:00</code>, 'zilnic la miezul nopții'],
            [<code>weekly</code>, <code>Mon *-*-* 00:00:00</code>, 'luni la miezul nopții'],
            [<code>monthly</code>, <code>*-*-01 00:00:00</code>, 'prima zi a lunii'],
            [<><code>yearly</code> / <code>annually</code></>, <code>*-01-01 00:00:00</code>, '1 ianuarie'],
            [<code>quarterly</code>, <code>*-01,04,07,10-01 00:00:00</code>, 'la început de trimestru'],
            [<code>semiannually</code>, <code>*-01,07-01 00:00:00</code>, 'la 1 ianuarie și 1 iulie'],
          ]} />
          <Callout kind="tip" title="Nu ghici expresia: testeaz-o">
            <code>systemd-analyze calendar "Mon..Fri 08:30"</code> afișează forma normalizată și <b>următoarele momente de rulare</b>. Dacă diferența față de ce vrei apare aici, o corectezi înainte să creezi fișierele. Dacă comanda spune „Failed to parse calendar specification”, expresia este invalidă.
          </Callout>

          <h4>6. Comparație cron → OnCalendar</h4>
          <Table head={['Cerință', 'cron', 'OnCalendar']} rows={[
            ['zilnic 02:30', <code>30 2 * * *</code>, <code>*-*-* 02:30:00</code>],
            ['la 15 minute', <code>*/15 * * * *</code>, <code>*:0/15</code>],
            ['luni–vineri 07:30', <code>30 7 * * 1-5</code>, <code>Mon..Fri 07:30</code>],
            ['prima zi a lunii, miezul nopții', <code>0 0 1 * *</code>, <code>monthly</code>],
            ['la boot', <code>@reboot</code>, <><code>OnBootSec=1min</code> (monoton)</>],
          ]} />

          <h4>7. Două câmpuri care influențează precizia</h4>
          <ul>
            <li><b><code>AccuracySec=</code></b> (implicit <b>1 minut</b>): fereastra în care systemd poate întârzia pornirea pentru a „grupa” trezirile (economie de energie). Un timer „la 02:30:00” poate porni oriunde în 02:30:00–02:30:59. Pentru precizie maximă: <code>AccuracySec=1us</code> (<code>systemd.timer(5)</code>).</li>
            <li><b><code>RandomizedDelaySec=</code></b> (implicit 0): întârziere aleatoare adăugată peste. Cele două setări lucrează în sensuri opuse.</li>
          </ul>

          <h4>8. Persistent=true: cum funcționează</h4>
          <p>
            systemd salvează pe disc <b>momentul ultimei declanșări</b> a timer-ului (sub <code>/var/lib/systemd/timers/</code>, din cunoștințe). La următoarea activare (de exemplu la boot), dacă a ratat un moment programat în timp ce mașina era oprită, <b>rulează o dată</b> imediat (<code>systemd.timer(5)</code>). Se aplică doar timerelor cu <code>OnCalendar=</code>. Pentru a șterge marcajul salvat: <code>systemctl clean --what=state nume.timer</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd (L4.9):</b> aceleași comenzi <code>systemctl</code>, același jurnal. Timer-ul este o unitate: <code>enable</code>, <code>disable</code>, <code>start</code>, <code>stop</code>, <code>status</code> se aplică la fel.</li>
            <li><b>Boot și targets (L4.1–L4.2):</b> <code>timers.target</code> adună timerele de pornit la boot.</li>
            <li><b>Jurnal (L4.7–L4.8):</b> output-ul serviciului (stdout/stderr) ajunge automat în jurnal: <code>journalctl -u backup.service</code>. Nu ai nevoie de mail sau redirecționări.</li>
            <li><b>cron (L7.1):</b> alternative pentru aceeași nevoie; poți avea ambele. La examen e posibil să ți se ceară explicit una dintre ele.</li>
            <li><b>Permisiuni și utilizatori (C9):</b> serviciul rulează implicit ca root; <code>User=</code> în <code>[Service]</code> schimbă utilizatorul.</li>
            <li><b>Timp (L7.3):</b> OnCalendar folosește ceasul sistemului și fusul orar; un ceas greșit declanșează la ore greșite.</li>
            <li><b>SELinux (C10):</b> un script într-o locație cu context greșit poate fi refuzat la execuție din systemd (vezi troubleshooting).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Sarcini care trebuie să lase <b>istoric în jurnal</b> fără efort.</li>
            <li>Sarcini care trebuie să <b>recupereze</b> o rulare ratată (<code>Persistent=true</code>).</li>
            <li>Sarcini care depind de alte servicii (<code>After=network-online.target</code> etc.) sau cu limite de resurse.</li>
            <li>„La 10 minute după boot, apoi o dată pe oră”: tipar nativ cu timere monotone, greu de exprimat curat în cron.</li>
            <li>Examen (tipic): „create a systemd timer that runs <code>backup.service</code> every day at 03:00 and enable it so it starts at boot”. Verificarea tipică: <code>systemctl list-timers</code> arată timer-ul cu <code>NEXT</code> corect, iar <code>systemctl is-enabled backup.timer</code> = <code>enabled</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu, pe o mașină de test. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Unitățile proprii se pun în <code>/etc/systemd/system/</code> (cele ale pachetelor sunt în <code>/usr/lib/systemd/system/</code>; nu le edita).
        </Callout>

        <h4>1. Testează expresia înainte de a o folosi</h4>
        <CodeBlock title="comenzi" code={`systemd-analyze calendar "*-*-* 02:30:00"\nsystemd-analyze calendar "Mon..Fri 08:00"\nsystemd-analyze calendar --iterations=3 "*:0/15"\nsystemd-analyze calendar daily`} explain={[
          ['systemd-analyze calendar "…"', 'analizează o expresie calendaristică și arată forma normalizată și următoarea rulare.'],
          ['--iterations=3', 'afișează următoarele 3 momente (nu doar unul).'],
          ['daily', 'o prescurtare: se normalizează la *-*-* 00:00:00.'],
        ]} />

        <h4>2. Creează serviciul și timer-ul</h4>
        <CodeBlock title="comenzi" code={`sudo mkdir -p /var/backups\nsudo vi /etc/systemd/system/backup.service\nsudo vi /etc/systemd/system/backup.timer\nsudo systemctl daemon-reload\nsudo systemctl enable --now backup.timer\nsystemctl status backup.timer\nsystemctl list-timers backup.timer`} explain={[
          ['vi … backup.service / backup.timer', 'creezi cele două fișiere (conținutul în secțiunea 3). Numele trebuie să coincidă (în afara extensiei).'],
          ['daemon-reload', 'systemd recitește fișierele de unitate; fără el nu vede unitățile noi sau modificate.'],
          ['enable --now backup.timer', 'enable = armează la boot (leagă de timers.target); --now = armează acum. Creează un link simbolic (L1.7) în /etc/systemd/system/timers.target.wants/.'],
          ['status backup.timer', 'starea timer-ului: active (waiting) și când este următorul declanșator.'],
          ['list-timers backup.timer', 'afișează NEXT, LEFT, LAST, PASSED, UNIT, ACTIVATES.'],
        ]} />

        <h4>3. Testează serviciul imediat, fără să aștepți ora</h4>
        <CodeBlock title="comenzi" code={`sudo systemctl start backup.service\nsystemctl status backup.service --no-pager\nls -l /var/backups/\njournalctl -u backup.service --no-pager | tail`} explain={[
          ['systemctl start backup.service', 'pornește manual serviciul — exact ce face timer-ul la ora programată. Așa testezi comanda fără să aștepți.'],
          ['status … --no-pager', 'după Type=oneshot, starea arată „inactive (dead)” cu „status=0/SUCCESS” dacă a reușit.'],
          ['journalctl -u backup.service', 'jurnalul serviciului: ora pornirii, ce a scris comanda, codul de ieșire.'],
        ]} />

        <h4>4. Timer monoton: „după boot, apoi periodic”</h4>
        <CodeBlock title="/etc/systemd/system/verifica.timer" kind="config" code={`[Unit]
Description=Verificare periodica

[Timer]
OnBootSec=10min
OnUnitActiveSec=1h

[Install]
WantedBy=timers.target`} explain={[
          ['OnBootSec=10min', 'prima rulare la 10 minute după boot.'],
          ['OnUnitActiveSec=1h', 'apoi la 1 oră după ultima ACTIVARE a lui verifica.service (nu după ultima terminare).'],
        ]} />

        <h4>5. Modificarea unui timer și gestionarea lui</h4>
        <CodeBlock title="comenzi" code={`sudo vi /etc/systemd/system/backup.timer\nsudo systemctl daemon-reload\nsudo systemctl restart backup.timer\nsystemctl list-timers --all --no-pager\nsudo systemctl disable --now backup.timer\nsudo systemctl clean --what=state backup.timer`} explain={[
          ['daemon-reload + restart backup.timer', 'după editarea fișierului: recitești, apoi repornești timer-ul ca să ia noua expresie.'],
          ['list-timers --all', '--all = include și timerele inactive.'],
          ['disable --now', 'dezarmează acum și scoate din boot.'],
          ['clean --what=state', 'șterge marcajul Persistent salvat (de ex. înainte de dezinstalare).'],
        ]} />

        <h4>6. Timer tranzitoriu cu systemd-run (opțional)</h4>
        <CodeBlock title="comenzi" code={`sudo systemd-run --on-active=2min --unit=test-once /usr/bin/logger -t sdrun "salut"\nsystemctl list-timers --no-pager | grep test-once\njournalctl -t sdrun --since "5 minutes ago"`} explain={[
          ['systemd-run', 'creează o unitate temporară (nu un fișier pe disc) și o pornește.'],
          ['--on-active=2min', 'creează un timer tranzitoriu care pornește comanda la 2 minute după acum (sintaxă din cunoștințe, de confirmat în systemd-run(1) pe RHEL 10).'],
          ['--unit=test-once', 'numele unității.'],
        ]} />
        <p className="small">Aceasta este varianta „at” a systemd: execuție unică, fără fișiere. Dispare la reboot.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="systemd-analyze calendar" kind="session" label="illustrative" code={`[student@server1 ~]$ systemd-analyze calendar "Mon..Fri 08:30"\n  Original form: Mon..Fri 08:30\nNormalized form: Mon..Fri *-*-* 08:30:00\n    Next elapse: Tue 2026-11-17 08:30:00 EET\n       (in UTC): Tue 2026-11-17 06:30:00 UTC\n       From now: 17h left`} />
        <p className="small">
          <b>Original form</b>: ce ai scris. <b>Normalized form</b>: forma completă (zi-săptămână, dată, oră cu secunde): observă cum <code>*-*-*</code> și <code>:00</code> au fost completate. <b>Next elapse</b>: următorul moment, în fusul tău, apoi în UTC și cât a mai rămas. Valorile din exemplu sunt fictive; formatul exact poate diferi între versiuni.
        </p>
        <CodeBlock title="systemctl list-timers" kind="session" label="illustrative" code={`[student@server1 ~]$ systemctl list-timers backup.timer\nNEXT                        LEFT     LAST PASSED UNIT         ACTIVATES\nTue 2026-11-17 02:34:12 EET 9h left  -    -      backup.timer backup.service\n\n1 timers listed.`} />
        <p className="small">
          <b>NEXT</b>: următoarea declanșare (aici 02:34:12 = 02:30 + întârziere aleatoare). <b>LEFT</b>: timp rămas. <b>LAST</b> și <b>PASSED</b>: ultima declanșare (<code>-</code> = încă niciuna). <b>UNIT</b>: timer-ul. <b>ACTIVATES</b>: unitatea pornită. O coloană NEXT goală sau „n/a” indică un timer fără declanșator viitor.
        </p>
        <CodeBlock title="systemctl status backup.timer" kind="session" label="illustrative" code={`[student@server1 ~]$ systemctl status backup.timer --no-pager\n● backup.timer - Pornește backup.service in fiecare noapte\n     Loaded: loaded (/etc/systemd/system/backup.timer; enabled; preset: disabled)\n     Active: active (waiting) since Mon 2026-11-16 14:20:01 EET; 2min ago\n    Trigger: Tue 2026-11-17 02:34:12 EET; 12h left\n   Triggers: ● backup.service`} />
        <p className="small">
          <code>Loaded … enabled</code>: fișierul a fost găsit și timer-ul este activat la boot. <code>Active: active (waiting)</code>: armat, așteaptă declanșatorul — starea normală. <code>Trigger</code>: următoarea rulare. <code>Triggers</code>: serviciul pornit. Textul „preset” poate lipsi sau diferi.
        </p>
        <CodeBlock title="status backup.service după o rulare" kind="session" label="illustrative" code={`[student@server1 ~]$ systemctl status backup.service --no-pager\n○ backup.service - Copie de siguranta pentru /etc\n     Loaded: loaded (/etc/systemd/system/backup.service; static)\n     Active: inactive (dead) since Mon 2026-11-16 14:25:10 EET; 8s ago\n    Process: 4107 ExecStart=/usr/bin/tar -czf /var/backups/etc-backup.tar.gz /etc (code=exited, status=0/SUCCESS)\n   Main PID: 4107 (code=exited, status=0/SUCCESS)`} />
        <p className="small">
          <code>static</code>: unitatea nu are <code>[Install]</code> (nu se activează direct, o pornește timer-ul). <code>inactive (dead)</code> după rulare este <b>normal</b> la <code>Type=oneshot</code>. <code>status=0/SUCCESS</code> = comanda s-a terminat cu codul 0 (succes). Un cod diferit de 0 indică o eroare: citește jurnalul.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Expresia:</b> <code>systemd-analyze calendar "…"</code> → <i>Next elapse</i> corect.</li>
            <li><b>Fișierele:</b> <code>systemctl cat backup.timer backup.service</code> afișează ce a citit systemd; <code>systemd-analyze verify /etc/systemd/system/backup.service</code> verifică sintaxa unității (din cunoștințe).</li>
            <li><b>Armat:</b> <code>systemctl is-active backup.timer</code> → <code>active</code>; <code>systemctl is-enabled backup.timer</code> → <code>enabled</code>.</li>
            <li><b>Programat:</b> <code>systemctl list-timers</code> arată timer-ul, cu <code>NEXT</code> dorit.</li>
            <li><b>Efectul:</b> <code>sudo systemctl start backup.service</code> apoi <code>ls -l /var/backups</code>; <code>journalctl -u backup.service</code> arată execuțiile.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierele din <code>/etc/systemd/system/</code> persistă pe disc. Ca timer-ul să fie armat după reboot trebuie <b>activat</b> (<code>enable</code>), care creează legătura din <code>timers.target.wants</code>. Fără <code>enable</code>, doar <code>start</code>, timer-ul funcționează până la următorul reboot. Pentru rularea ratată în perioada cât mașina a fost oprită: <code>Persistent=true</code> (doar pentru <code>OnCalendar</code>). Confirmare manuală: <code>sudo reboot</code>, apoi <code>systemctl is-enabled backup.timer</code>, <code>systemctl list-timers backup.timer</code>.
          </p>
          <p>
            <b>Atenție:</b> o unitate temporară creată cu <code>systemd-run</code> nu supraviețuiește reboot-ului.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<>Timer-ul nu apare în <code>list-timers</code></>, 'nu s-a făcut daemon-reload sau timer-ul nu este pornit', <><code>systemctl status backup.timer</code>, <code>systemctl cat backup.timer</code></>, <><code>daemon-reload</code>; <code>enable --now backup.timer</code></>],
          [<><code>enable</code>: „The unit files have no installation config”</>, <>lipsește <code>[Install]</code> din <code>.timer</code> (sau ai dat enable serviciului)</>, <code>systemctl cat backup.timer</code>, <>adaugă <code>[Install] WantedBy=timers.target</code>; activează timer-ul</>],
          ['Timer-ul rulează, dar serviciul eșuează', 'comandă fără cale absolută, permisiuni, SELinux', <><code>journalctl -u backup.service</code></>, 'cale absolută; permisiuni; context SELinux (C10)'],
          ['Expresie invalidă', 'zi-săptămână în română, format greșit', <code>systemd-analyze calendar "…"</code>, 'zile englezești (Mon..Fri); corectează'],
          ['Rulează cu o întârziere de până la un minut', <><code>AccuracySec=</code> implicit 1 min; <code>RandomizedDelaySec</code></>, <code>list-timers</code>, <><code>AccuracySec=1us</code> dacă trebuie precizie</>],
          ['Nu recuperează rularea ratată', <><code>Persistent=false</code> (implicit) sau timer monoton</>, <code>systemctl cat backup.timer</code>, <><code>Persistent=true</code> cu <code>OnCalendar</code></>],
          ['Modificarea fișierului nu are efect', 'nu ai făcut daemon-reload / restart al timer-ului', <code>systemctl status backup.timer</code>, <><code>daemon-reload</code> + <code>restart backup.timer</code></>],
          [<>Redirecționarea (<code>&gt;</code>, <code>|</code>) din <code>ExecStart=</code> nu merge</>, 'ExecStart nu este interpretat de shell', <code>journalctl -u backup.service</code>, <><code>ExecStart=/bin/sh -c '… &gt; fișier'</code> sau un script</>],
          ['„Failed to start … Unit not found”', 'nume diferite între timer și serviciu', <code>ls /etc/systemd/system | grep backup</code>, <>același nume (backup.timer ↔ backup.service) sau <code>Unit=</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Faci <code>enable</code> pe <b>serviciu</b> în loc de <b>timer</b>.</>,
          <>Uiți <code>systemctl daemon-reload</code> după ce creezi sau modifici fișierele.</>,
          <>Nume diferite pentru <code>.timer</code> și <code>.service</code> fără <code>Unit=</code>.</>,
          <>Uiți secțiunea <code>[Install]</code> cu <code>WantedBy=timers.target</code> în timer.</>,
          <>Pui o comandă fără cale absolută în <code>ExecStart=</code>.</>,
          <>Folosești redirecționări sau pipe-uri direct în <code>ExecStart=</code>.</>,
          <>Scrii zilele în română sau altă ordine a datei (an-lună-zi, nu zi-lună-an).</>,
          <>Crezi că un timer cu <code>Persistent=true</code> recuperează la nesfârșit rulările ratate: se recuperează <b>o singură dată</b>.</>,
          <>Pui <code>Persistent=true</code> la un timer monoton: nu are efect (doar OnCalendar).</>,
          <>Nu testezi cu <code>systemd-analyze calendar</code> și <code>systemctl start nume.service</code>.</>,
          <>Crezi că „inactive (dead)” al serviciului înseamnă că ceva e stricat.</>,
          <>Editezi fișierele din <code>/usr/lib/systemd/system/</code> în loc să creezi în <code>/etc/systemd/system/</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: AccuracySec, Persistent, user timers, unități generate de pachete">
        <p>
          <b>Cum alege systemd momentul exact:</b> calculează momentul programat, adaugă <code>RandomizedDelaySec</code> și apoi alege, în fereastra <code>AccuracySec</code>, un moment la care și alte timere pot fi „grupate” (<code>systemd.timer(5)</code>: setările lucrează în sensuri opuse). De aceea ora din <code>NEXT</code> poate avea secunde neașteptate.
        </p>
        <p>
          <b>Timere de utilizator:</b> fiecare utilizator poate avea timere proprii în <code>~/.config/systemd/user/</code>, gestionate cu <code>systemctl --user …</code>. Ele rulează cât timp există o sesiune a utilizatorului, dacă nu activezi „lingering” (<code>loginctl enable-linger</code>); doar menționat, nu face parte din obiectiv.
        </p>
        <p>
          <b>Drop-in-uri:</b> pentru a modifica un timer livrat de un pachet fără a-l edita: <code>systemctl edit nume.timer</code> creează un fișier în <code>/etc/systemd/system/nume.timer.d/override.conf</code>. Pentru a <i>înlocui</i> o listă (de exemplu OnCalendar) se pune întâi <code>OnCalendar=</code> gol, apoi valoarea nouă (<code>systemd.timer(5)</code>: șirul gol resetează lista).
        </p>
        <p>
          <b>Temp files:</b> <code>systemd-tmpfiles-clean.timer</code> este un exemplu de timer livrat de sistem pentru curățarea fișierelor temporare; observă-l cu <code>systemctl cat systemd-tmpfiles-clean.timer</code> (existența lui pe RHEL 10 de confirmat).
        </p>
        <p>
          <b>Ceas de perete vs monoton:</b> un timer calendaristic (<code>OnCalendar</code>) urmărește data și ora reale, deci este afectat de corectarea ceasului (L7.3) sau de trecerea la ora de vară/iarnă; un timer monoton se măsoară față de un reper (boot, ultima activare) și nu depinde de data calendaristică.
        </p>
      </DeepDive>
    </>
  );
}

export const L7_2: TopicModule = {
  id: 'L7.2',
  subtitle: 'systemd timers: .timer + .service, OnCalendar, OnBootSec, Persistent, list-timers, systemd-analyze calendar',
  studyTime: '≈100 min studiu + laborator',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când o folosim', code: '5' },
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
  labs: [LAB_L7_2],
  sources: [
    { kind: 'man', ref: 'systemd.timer(5), systemd.time(7) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'systemctl(1), systemd.service(5), systemd-analyze(1), systemd-run(1) — din cunoștințe/necitite' },
    { kind: 'doc', ref: 'RHEL 10 — documentația systemd: docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
