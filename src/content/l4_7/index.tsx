import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_7 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Sistemul scrie tot ce se întâmplă (porniri, erori, autentificări) în două locuri: <G id="journal">jurnalul systemd</G>, citit cu <G id="journalctl">journalctl</G>, și fișiere text din <code>/var/log/</code> scrise de <G id="rsyslog">rsyslog</G> (<code>messages</code>, <code>secure</code>, <code>cron</code>…). Cauți după serviciu (<code>-u</code>), boot (<code>-b</code>), prioritate (<code>-p</code>) și timp (<code>--since</code>), iar cu <code>-f</code> urmărești live.
          </p>
          <p>Obiectivul oficial: <i>„Locate and interpret system log files and journals”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Când ceva nu merge (un serviciu nu pornește, un utilizator nu se poate conecta), prima întrebare este: <b>ce a spus sistemul?</b> Răspunsul este în jurnale. Fără ele, ai depana pe ghicite.
          </p>
          <p>
            Istoric, serviciile scriau mesaje text prin protocolul <i>syslog</i>, în fișiere din <code>/var/log</code>. systemd a adăugat un jurnal propriu, structurat și indexat (poți filtra rapid după serviciu sau după prioritate). Ambele coexistă: jurnalul primește mesajele, iar rsyslog (dacă este activ) le copiază în fișiere text.
          </p>
          <Analogy>Jurnalul este ca o bază de date a unui hotel: fiecare eveniment are oră, cameră (serviciu) și gravitate; poți întreba „arată-mi doar incidentele grave din camera 12, de ieri”. Fișierele din <code>/var/log</code> sunt registrele de hârtie pe categorii: unul pentru accesul în clădire (<code>secure</code>), unul general (<code>messages</code>).</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <ol>
            <li>Kernelul, serviciile (stdout/stderr) și aplicațiile (prin syslog) trimit mesaje.</li>
            <li><code>systemd-journald</code> le primește, adaugă metadate (PID, UID, unitate, prioritate, ora) și le stochează într-o bază binară.</li>
            <li>Dacă rsyslog rulează, primește o copie și o scrie în fișiere text conform regulilor din <code>/etc/rsyslog.conf</code>.</li>
            <li><code>logrotate</code> rotește periodic fișierele text (le arhivează și le comprimă) ca să nu crească la nesfârșit.</li>
          </ol>
          <h4>Linia unui mesaj</h4>
          <p>
            Formatul tipic: <code>Nov 16 10:12:44 server1 sshd[4021]: Failed password for student …</code>: <b>dată și oră</b> · <b>gazda</b> · <b>proces</b> (eticheta) · <b>[PID]</b> · <b>mesajul</b>.
          </p>
          <h4>Fișiere uzuale din <code>/var/log</code> (dacă rsyslog este activ)</h4>
          <Table head={['Fișier', 'Conține']} rows={[
            [<code>messages</code>, 'mesaje generale ale sistemului'],
            [<code>secure</code>, 'autentificare și autorizare: ssh, sudo, su, login'],
            [<code>cron</code>, 'activitatea cron'],
            [<code>maillog</code>, 'servicii de poștă'],
            [<code>boot.log</code>, 'mesaje de la pornirea serviciilor'],
            [<code>dmesg</code>, 'mesajele kernelului din timpul boot-ului'],
            [<code>audit/audit.log</code>, 'evenimente audit/SELinux (C10)'],
          ]} />
          <h4>Priorități</h4>
          <Table head={['Nr.', 'Nume', 'Semnificație']} rows={[
            ['0', <code>emerg</code>, 'sistem inutilizabil'],
            ['1', <code>alert</code>, 'acțiune imediată'],
            ['2', <code>crit</code>, 'condiție critică'],
            ['3', <code>err</code>, 'eroare'],
            ['4', <code>warning</code>, 'avertisment'],
            ['5', <code>notice</code>, 'normal, dar semnificativ'],
            ['6', <code>info</code>, 'informativ'],
            ['7', <code>debug</code>, 'depanare'],
          ]} />
          <p>Un număr mai mic înseamnă mai grav. <G id="log-priority">-p err</G> include nivelurile 0–3.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd și servicii</b> (L4.9): <code>systemctl status</code> arată ultimele linii din jurnal; <code>journalctl -u</code> pe restul.</li>
            <li><b>Persistența jurnalului</b> (L4.8): fără ea, jurnalul se pierde la reboot.</li>
            <li><b>Boot</b> (L4.1–L4.3): <code>journalctl -b -1</code> citește boot-ul anterior după o problemă.</li>
            <li><b>SSH, sudo, utilizatori</b> (L1.10, L1.11): mesajele de autentificare apar în <code>secure</code>/jurnal.</li>
            <li><b>grep, less, tail</b> (L1.4–L1.6): filtrare și citire a fișierelor text.</li>
            <li><b>SELinux</b> (C10): refuzurile apar în <code>audit.log</code> și în jurnal.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Un serviciu nu pornește: <code>journalctl -u serviciu -b</code>.</li>
            <li>Verifici cine s-a conectat sau a folosit <code>sudo</code>: <code>secure</code> / <code>journalctl -u sshd</code>.</li>
            <li>Investighezi un reboot sau un crash: <code>journalctl -b -1</code>.</li>
            <li>La examen: „find the error that caused service X to fail”; răspunsul este în jurnal.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare. Existența fișierelor din <code>/var/log</code> depinde de rsyslog.
        </Callout>

        <h4>1. Citește jurnalul cu <code>journalctl</code></h4>
        <CodeBlock title="comenzi (ca root sau cu drepturi de citire)" code={`journalctl\njournalctl -n 20\njournalctl -r\njournalctl -b\njournalctl -b -1\njournalctl --list-boots\njournalctl --no-pager | head`} explain={[
          ['journalctl', 'tot jurnalul, cele mai vechi primele, în pager (q = ieșire, / = căutare, Space = pagina următoare).'],
          ['-n 20', 'doar ultimele 20 de intrări.'],
          ['-r', 'reverse: cele mai noi primele.'],
          ['-b', 'doar boot-ul curent.'],
          ['-b -1', 'boot-ul anterior (-2 = cel dinaintea lui). Funcționează doar dacă jurnalul este persistent (L4.8).'],
          ['--list-boots', 'listează boot-urile păstrate, cu index și interval.'],
          ['--no-pager', 'afișează direct în terminal (util cu pipe).'],
        ]} />

        <h4>2. Filtrează</h4>
        <CodeBlock title="comenzi" code={`journalctl -u sshd\njournalctl -u sshd -b\njournalctl -p err\njournalctl -b -p warning\njournalctl --since "2026-11-16 10:00" --until "2026-11-16 10:30"\njournalctl --since "1 hour ago"\njournalctl -k\njournalctl _PID=4021\njournalctl -t sudo`} explain={[
          ['-u sshd', 'unitatea (serviciul) sshd; poți repeta -u pentru mai multe.'],
          ['-p err', 'priorități 0–3 (emerg, alert, crit, err). Poți folosi și numărul: -p 3.'],
          ['--since / --until', 'interval de timp; textul cu spațiu se pune între ghilimele. Acceptă și forme relative: "1 hour ago", "yesterday", "today".'],
          ['-k', 'doar mesajele kernelului (ca dmesg).'],
          ['_PID=4021', 'filtrează după câmp: PID-ul proceselor. Alte câmpuri: _UID=, _COMM=.'],
          ['-t sudo', 'după identificatorul syslog (tag).'],
        ]} />

        <h4>3. Urmărire live și mai multe detalii</h4>
        <CodeBlock title="comenzi" code={`journalctl -f\njournalctl -u sshd -f\njournalctl -xe\njournalctl -u sshd -o verbose -n 1`} explain={[
          ['-f', 'follow: afișează mesajele pe măsură ce apar; Ctrl+C iese.'],
          ['-x', 'adaugă explicații suplimentare pentru unele mesaje.'],
          ['-e', 'sare la sfârșitul jurnalului (cu -x: „jurnalul cu explicații, la final”).'],
          ['-o verbose', 'format cu toate câmpurile structurate (PRIORITY, _PID, _SYSTEMD_UNIT…).'],
        ]} />

        <h4>4. Fișierele text din <code>/var/log</code></h4>
        <CodeBlock title="comenzi" code={`ls -l /var/log\nsudo less /var/log/messages\nsudo tail -n 20 /var/log/secure\nsudo tail -f /var/log/secure\nsudo grep -i "failed" /var/log/secure\nsudo grep sshd /var/log/messages | tail -5\nsystemctl is-active rsyslog`} explain={[
          ['ls -l /var/log', 'ce fișiere există și cât de mari sunt.'],
          ['less FIȘIER', 'citire pe pagini (q = ieșire).'],
          ['tail -n 20', 'ultimele 20 de linii.'],
          ['tail -f', 'urmărește live fișierul.'],
          ['grep -i "failed"', '-i ignoră majusculele; găsește încercări eșuate.'],
          ['sudo', 'fișierele de log sunt de obicei lizibile doar de root.'],
          ['systemctl is-active rsyslog', 'dacă rsyslog rulează, fișierele text se actualizează.'],
        ]} />

        <h4>5. Scrie tu însuți un mesaj: <code>logger</code></h4>
        <CodeBlock title="comenzi" code={`logger "mesaj de test"\nlogger -t exercitiu -p user.err "ceva nu a mers"\njournalctl -t exercitiu -n 1`} explain={[
          ['logger', 'trimite un mesaj în jurnal/syslog; util ca să testezi regulile de logare.'],
          ['-t exercitiu', 'eticheta mesajului.'],
          ['-p user.err', 'facility.prioritate.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="journalctl -u sshd" kind="session" label="illustrative" code={`[root@server1 ~]# journalctl -u sshd -b --no-pager | tail -4\nNov 16 08:12:30 server1 systemd[1]: Starting OpenSSH server daemon...\nNov 16 08:12:30 server1 sshd[812]: Server listening on 0.0.0.0 port 22.\nNov 16 08:12:30 server1 systemd[1]: Started OpenSSH server daemon.\nNov 16 10:12:44 server1 sshd[4021]: Failed password for student from 192.0.2.50 port 51532 ssh2`} />
        <p className="small">Coloane: <b>dată și oră</b> (<code>Nov 16 10:12:44</code>), <b>gazda</b> (<code>server1</code>), <b>procesul și PID-ul</b> (<code>sshd[4021]</code>), <b>mesajul</b>. Primele linii vin de la <code>systemd[1]</code> (PID 1, managerul), ultima de la un proces <code>sshd</code> copil. Adresa 192.0.2.50 este o adresă de documentație.</p>
        <CodeBlock title="--list-boots" kind="session" label="illustrative" code={`[root@server1 ~]# journalctl --list-boots\nIDX BOOT ID                          FIRST ENTRY                 LAST ENTRY\n -1 8f2c…e1a0 Sun 2026-11-15 22:03:11 UTC   Mon 2026-11-16 08:11:58 UTC\n  0 b17d…44c2 Mon 2026-11-16 08:12:10 UTC   Mon 2026-11-16 14:20:03 UTC`} />
        <p className="small"><code>IDX 0</code> = boot-ul curent; <code>-1</code> = cel dinainte. Coloanele <code>FIRST ENTRY</code>/<code>LAST ENTRY</code> arată intervalul. Dacă vezi doar linia <code>0</code>, jurnalul nu este persistent (L4.8). Identificatorii sunt prescurtați și fictivi.</p>
        <CodeBlock title="journalctl -p err" kind="session" label="illustrative" code={`[root@server1 ~]# journalctl -b -p err --no-pager | head -3\nNov 16 08:12:11 server1 kernel: ACPI BIOS Error (bug): Could not resolve symbol [\\_SB.PCI0], AE_NOT_FOUND\nNov 16 08:12:28 server1 systemd[1]: Failed to start Example Failing Service.\nNov 16 09:01:07 server1 myapp[1543]: cannot open configuration file /etc/myapp.conf`} />
        <p className="small">Doar erori. A doua linie arată că systemd nu a putut porni o unitate; a treia arată cauza probabilă (un fișier de configurare lipsă). Textele sunt exemple construite.</p>
        <CodeBlock title="/var/log/secure" kind="session" label="illustrative" code={`[root@server1 ~]# tail -3 /var/log/secure\nNov 16 10:12:44 server1 sshd[4021]: Failed password for student from 192.0.2.50 port 51532 ssh2\nNov 16 10:12:50 server1 sshd[4021]: Accepted password for student from 192.0.2.50 port 51532 ssh2\nNov 16 10:15:02 server1 sudo[4100]: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/usr/bin/systemctl reboot`} />
        <p className="small">Prima: încercare eșuată. A doua: reușită. A treia: <code>sudo</code> a executat comanda <code>systemctl reboot</code> ca <code>root</code>, din directorul indicat. Formatul exact poate diferi.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Mesajul de test: <code>logger -t eticheta "text"</code>, apoi <code>journalctl -t eticheta -n 1</code>.</li>
            <li>Persistență: <code>journalctl --list-boots</code> arată mai mult de un boot după reboot (L4.8).</li>
            <li>rsyslog: <code>systemctl is-active rsyslog</code> și <code>ls -l /var/log</code>.</li>
            <li>Remedierea unei erori: re-rulezi comanda de filtrare; eroarea nu mai apare după momentul remedierii.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierele din <code>/var/log</code> sunt pe disc și persistă (cu rotire). Jurnalul systemd persistă <b>doar</b> dacă este configurat pentru asta (L4.8); implicit, în unele configurații, este ținut în memorie (<code>/run/log/journal</code>) și se pierde la reboot. De aceea <code>journalctl -b -1</code> nu funcționează peste tot. Nu există nimic de configurat în această lecție; confirmarea manuală se face cu <code>journalctl --list-boots</code> după reboot.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['nu vezi toate mesajele sau „No journal files”', 'drepturi insuficiente', <code>id</code>, <>folosește <code>sudo</code> sau adaugă contul în grupul potrivit (<code>systemd-journal</code>)</>],
          [<code>-b -1</code>, 'nu arată nimic', <code>journalctl --list-boots</code>, <>jurnalul nu e persistent: L4.8</>],
          [<code>/var/log/messages</code>, 'lipsește', <code>systemctl status rsyslog</code>, <>folosește <code>journalctl</code>; instalează/pornește rsyslog dacă ai nevoie de fișier</>],
          [<code>Failed to parse timestamp</code>, 'timp fără ghilimele', 'comanda scrisă', <>pune valoarea între ghilimele</>],
          ['prea mult zgomot', 'nivel prea larg', <code>journalctl -p err</code>, 'filtrează după prioritate și unitate'],
          ['fișierele de log au crescut mult', 'rotire neconfigurată sau jurnal fără limită', <code>du -sh /var/log; journalctl --disk-usage</code>, <>vezi <code>logrotate</code>; limitele jurnalului</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Cauți în <code>/var/log</code> ceva ce există doar în jurnal (sau invers).</>,
          <>Uiți ghilimelele la <code>--since</code>/<code>--until</code>.</>,
          <>Confunzi <code>-u</code> (unitate) cu <code>-p</code> (prioritate) sau cu <code>-b</code> (boot).</>,
          <>Citești jurnalul fără drepturi și crezi că „nu este nimic”.</>,
          <>Presupui că <code>-b -1</code> funcționează fără persistență.</>,
          <>Încerci să editezi sau să deschizi cu un editor jurnalul binar.</>,
          <>Ignori ora: un mesaj de dinainte de reparație nu înseamnă că problema persistă.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: logrotate, câmpuri structurate și gruparea după facility">
        <p>
          <code>logrotate</code> rulează periodic și rotește fișierele din <code>/var/log</code> după regulile din <code>/etc/logrotate.conf</code> și <code>/etc/logrotate.d/</code>: după mărime sau vârstă, păstrează N arhive, comprimă. Fișierele rotite apar ca <code>messages-20261115</code>; verifică regulile în <code>man logrotate</code>.
        </p>
        <p>
          Jurnalul este structurat: fiecare intrare are câmpuri (<code>_SYSTEMD_UNIT</code>, <code>_PID</code>, <code>PRIORITY</code>, <code>_HOSTNAME</code>…). <code>journalctl -o json-pretty -n 1</code> le arată pe toate; poți filtra după orice câmp, <code>journalctl _SYSTEMD_UNIT=sshd.service</code>.
        </p>
        <p>
          În syslog, un mesaj are și <i>facility</i> (categoria: <code>auth</code>, <code>cron</code>, <code>kern</code>, <code>user</code>…) și <i>prioritate</i>. Regulile din <code>/etc/rsyslog.conf</code> asociază perechea <code>facility.prioritate</code> cu un fișier (de exemplu <code>authpriv.*  /var/log/secure</code>). Conținutul exact al fișierului implicit pe RHEL 10 nu a fost confirmat (documentația Red Hat necitită, HTTP 403).
        </p>
      </DeepDive>
    </>
  );
}

export const L4_7: TopicModule = {
  id: 'L4.7',
  subtitle: 'journalctl (-b, -u, -p, --since, -f), /var/log (messages, secure), rsyslog, logger',
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
  labs: [LAB_L4_7],
  sources: [
    { kind: 'man', ref: 'journalctl(1), systemd-journald.service(8), rsyslogd(8), rsyslog.conf(5), logger(1), dmesg(1), logrotate(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Troubleshooting problems by using log files”, „The Rsyslog logging service”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
