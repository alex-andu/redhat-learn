import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_8 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Dacă <G id="journal">jurnalul systemd</G> este ținut doar în memorie (<code>/run/log/journal</code>), se pierde la fiecare reboot, exact când ai nevoie de el pentru a afla de ce a repornit sistemul. Îl faci persistent creând <code>/var/log/journal</code> (cu <code>Storage=auto</code>) sau setând <G id="journal-storage">Storage=persistent</G> în <code>/etc/systemd/journald.conf</code>, apoi <code>systemctl restart systemd-journald</code>. Verifici cu <code>journalctl --list-boots</code> după un reboot.
          </p>
          <p>Obiectivul oficial: <i>„Preserve system journals”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un jurnal util trebuie să supraviețuiască momentelor când ceva merge prost: un crash, un kernel panic, o repornire neașteptată. Dacă jurnalul stă în RAM, toate indiciile dispar odată cu repornirea; când te uiți la problemă, nu mai ai nimic de citit.
          </p>
          <p>
            De aceea administratorii configurează stocarea <b>persistentă</b>: jurnalul se scrie pe disc, în <code>/var/log/journal</code>, și poate fi citit și pentru boot-urile anterioare (<code>journalctl -b -1</code>). Prețul este spațiu pe disc, de aceea se pun limite.
          </p>
          <Analogy>Un avion are două tipuri de înregistrări: ce vede pilotul pe ecran acum (volatil) și „cutia neagră” (persistentă), care rămâne după incident. Jurnalul persistent este cutia neagră a serverului.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <p>
            <code>systemd-journald</code> decide locația după parametrul <code>Storage=</code>:
          </p>
          <Table head={['Storage=', 'Comportament', 'Unde']} rows={[
            [<code>volatile</code>, 'doar în memorie; se pierde la reboot', <code>/run/log/journal</code>],
            [<code>persistent</code>, 'pe disc; creează directorul dacă lipsește', <code>/var/log/journal</code>],
            [<><code>auto</code> (implicit)</>, 'pe disc doar dacă directorul există; altfel volatil', <>ambele</>],
            [<code>none</code>, 'nu păstrează nimic', '—'],
          ]} />
          <p>
            Ordinea citirii configurației: <code>/etc/systemd/journald.conf</code>, apoi fișierele <code>*.conf</code> din <code>/etc/systemd/journald.conf.d/</code> (drop-in-uri), care îl completează. Rămâne valabil ce nu este suprascris.
          </p>
          <h4>Limitarea spațiului</h4>
          <Table head={['Parametru', 'Efect']} rows={[
            [<code>SystemMaxUse=</code>, 'spațiul maxim ocupat de jurnal pe disc (ex. 200M)'],
            [<code>SystemKeepFree=</code>, 'spațiul minim liber care trebuie lăsat pe sistemul de fișiere'],
            [<code>SystemMaxFileSize=</code>, 'dimensiunea maximă a unui fișier de jurnal'],
            [<code>MaxRetentionSec=</code>, 'vechimea maximă a intrărilor (ex. 1month)'],
          ]} />
          <p>
            Pentru jurnalul volatil, parametrii corespunzători încep cu <code>Runtime</code> (<code>RuntimeMaxUse=</code>).
          </p>
          <h4>Directorul persistent</h4>
          <p>
            În <code>/var/log/journal/</code> există un subdirector cu numele <i>machine-id</i> al sistemului (<code>cat /etc/machine-id</code>), care conține fișierele de jurnal. Directorul aparține, în mod normal, lui root și grupului <code>systemd-journal</code>; <code>systemd-tmpfiles</code> poate aplica proprietarul și permisiunile corecte.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>journalctl</b> (L4.7): <code>-b -1</code>, <code>--list-boots</code> funcționează pe jurnalul persistent.</li>
            <li><b>systemd și servicii</b> (L4.9): <code>systemctl restart systemd-journald</code>.</li>
            <li><b>Boot</b> (L4.1): fiecare boot este o „bucată” separată în jurnal.</li>
            <li><b>Sistem de fișiere și spațiu</b> (C5/C6): <code>/var</code> poate fi o partiție separată; limitele sunt importante.</li>
            <li><b>Permisiuni și grupuri</b> (L1.8, C9): grupul <code>systemd-journal</code> deține fișierele.</li>
            <li><b>rsyslog</b> (L4.7): fișierele text din <code>/var/log</code> sunt independente de jurnalul binar.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Pe orice server unde investighezi incidente după reboot sau crash.</li>
            <li>Când cerințele de audit cer păstrarea mesajelor o perioadă.</li>
            <li>La examen: „make the system journal persistent”; verifici cu un reboot.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem de test, ca root. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare. Nu presupune starea implicită a jurnalului: verific-o.
        </Callout>

        <h4>1. Verifică starea curentă</h4>
        <CodeBlock title="comenzi" code={`ls -ld /var/log/journal\nls -ld /run/log/journal\ngrep -iE "^#?Storage" /etc/systemd/journald.conf\njournalctl --list-boots\njournalctl --disk-usage\ncat /etc/machine-id`} explain={[
          ['ls -ld /var/log/journal', 'dacă lipsește („No such file”), jurnalul este volatil când Storage=auto.'],
          ['grep -iE "^#?Storage"', 'linia Storage (adesea comentată cu # în fișierul implicit; -i ignoră majusculele).'],
          ['--list-boots', 'dacă vezi un singur boot după mai multe reboot-uri, jurnalul este volatil.'],
          ['--disk-usage', 'spațiul ocupat acum.'],
          ['cat /etc/machine-id', 'identificatorul sistemului; numele subdirectorului din /var/log/journal.'],
        ]} />

        <h4>2. Metoda simplă: directorul (cu <code>Storage=auto</code>)</h4>
        <CodeBlock title="comenzi (ca root)" code={`mkdir -p /var/log/journal\nsystemd-tmpfiles --create --prefix /var/log/journal\nsystemctl restart systemd-journald\njournalctl --flush`} explain={[
          ['mkdir -p', 'creează directorul; -p nu dă eroare dacă există și creează părinții.'],
          ['systemd-tmpfiles --create --prefix /var/log/journal', 'aplică regulile systemd pentru proprietar și permisiuni doar căii date.'],
          ['systemctl restart systemd-journald', 'journald trece pe disc.'],
          ['journalctl --flush', 'mută mesajele deja existente din /run în /var/log/journal.'],
        ]} />

        <h4>3. Metoda explicită: <code>Storage=persistent</code></h4>
        <CodeBlock title="/etc/systemd/journald.conf.d/persistent.conf" code={`[Journal]\nStorage=persistent\nSystemMaxUse=200M\nSystemKeepFree=500M\nMaxRetentionSec=1month`} explain={[
          ['[Journal]', 'secțiunea obligatorie pentru parametrii journald.'],
          ['Storage=persistent', 'scrie pe disc, în /var/log/journal.'],
          ['SystemMaxUse=200M', 'limita de spațiu a jurnalului.'],
          ['SystemKeepFree=500M', 'cât spațiu liber păstrează pe sistemul de fișiere.'],
          ['MaxRetentionSec=1month', 'intrările mai vechi de o lună pot fi șterse.'],
        ]} />
        <CodeBlock title="comenzi (ca root)" code={`mkdir -p /etc/systemd/journald.conf.d\ncat > /etc/systemd/journald.conf.d/persistent.conf <<'EOF'\n[Journal]\nStorage=persistent\nSystemMaxUse=200M\nEOF\nsystemctl restart systemd-journald`} explain={[
          ['cat > fișier <<\'EOF\' … EOF', 'here-document (L1.5): scrie textul dintre marcaje în fișier; ghilimelele din jurul lui EOF opresc expansiunea.'],
          ['systemctl restart systemd-journald', 'aplică configurația.'],
        ]} />
        <p className="small">Alternativ, editezi direct <code>/etc/systemd/journald.conf</code> (liniile sunt comentate implicit; scoți <code>#</code> și setezi valoarea). Ambele metode se aplică după repornirea serviciului.</p>

        <h4>4. Verificare, dimensiune și curățare</h4>
        <CodeBlock title="comenzi" code={`journalctl --list-boots\njournalctl -b -1 -n 10 --no-pager\njournalctl --disk-usage\njournalctl --vacuum-size=100M\njournalctl --vacuum-time=2weeks\njournalctl --verify`} explain={[
          ['--list-boots', 'după reboot, vezi boot-ul anterior (-1).'],
          ['-b -1 -n 10', 'ultimele 10 mesaje din boot-ul anterior.'],
          ['--vacuum-size=100M', 'șterge jurnalele arhivate până sub 100 MB.'],
          ['--vacuum-time=2weeks', 'șterge jurnalele mai vechi de două săptămâni.'],
          ['--verify', 'verifică integritatea fișierelor de jurnal.'],
        ]} />
        <Callout kind="tip" title="Rolul de sistem (menționat)">
          Ghidul RHEL menționează și configurarea persistenței prin rolul de sistem <code>journald</code> (<code>rhel-system-roles</code>), util la administrarea mai multor servere. Nu este necesar pentru obiectivul acestui capitol.
        </Callout>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="stare volatilă vs persistentă" kind="session" label="illustrative" code={`[root@server1 ~]# ls -ld /var/log/journal\nls: cannot access '/var/log/journal': No such file or directory\n[root@server1 ~]# ls -ld /run/log/journal\ndrwxr-sr-x+ 3 root systemd-journal 60 Nov 16 08:12 /run/log/journal`} />
        <p className="small">Lipsa lui <code>/var/log/journal</code> și prezența lui <code>/run/log/journal</code> arată un jurnal volatil. În permisiuni, <code>s</code> din grup (<code>r-s</code>) este bitul setgid: fișierele noi moștenesc grupul <code>systemd-journal</code> (L1.8). Datele sunt exemple.</p>
        <CodeBlock title="după activare" kind="session" label="illustrative" code={`[root@server1 ~]# mkdir -p /var/log/journal\n[root@server1 ~]# systemctl restart systemd-journald\n[root@server1 ~]# ls -ld /var/log/journal\ndrwxr-sr-x+ 3 root systemd-journal 46 Nov 16 14:40 /var/log/journal\n[root@server1 ~]# ls /var/log/journal\n3f1c2a8e9d7b4c0aa1b2c3d4e5f60718`} />
        <p className="small">După repornirea serviciului apare subdirectorul cu numele machine-id-ului. De acum mesajele se scriu aici și vor exista după reboot. Numele și permisiunile exacte pot diferi.</p>
        <CodeBlock title="--list-boots și --disk-usage" kind="session" label="illustrative" code={`[root@server1 ~]# journalctl --list-boots\nIDX BOOT ID                          FIRST ENTRY                 LAST ENTRY\n -1 b17d…44c2 Mon 2026-11-16 08:12:10 UTC   Mon 2026-11-16 14:45:22 UTC\n  0 9a0e…77f1 Mon 2026-11-16 14:46:01 UTC   Mon 2026-11-16 14:52:40 UTC\n[root@server1 ~]# journalctl --disk-usage\nArchived and active journals take up 32.0M in the file system.`} />
        <p className="small">Boot-ul <code>-1</code> este păstrat: dovada persistenței. <code>--disk-usage</code> arată spațiul ocupat, de comparat cu <code>SystemMaxUse=</code>. Valorile sunt exemple.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>ls -ld /var/log/journal</code>: există, grup <code>systemd-journal</code>.</li>
            <li><code>grep -rE "^(Storage|SystemMaxUse)" /etc/systemd/journald.conf /etc/systemd/journald.conf.d/</code>: valorile dorite.</li>
            <li>După reboot, <code>journalctl --list-boots</code> arată mai multe boot-uri; <code>journalctl -b -1</code> afișează mesajele.</li>
            <li><code>journalctl --disk-usage</code> rămâne sub limită.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Aceasta este lecția despre persistență: configurarea (în <code>/etc</code>) și datele (în <code>/var/log/journal</code>) sunt pe disc. Singura confirmare reală este un reboot și citirea boot-ului anterior. Atenție la <code>/var</code> pe o partiție mică: setează limite și monitorizează cu <code>--disk-usage</code>. Jurnalul de dinainte de activare nu poate fi recuperat dacă era volatil și sistemul a repornit.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['un singur boot în --list-boots după reboot', 'jurnal volatil', <code>ls -ld /var/log/journal</code>, <>creează directorul sau <code>Storage=persistent</code>; repornește journald</>],
          ['configurarea nu are efect', 'serviciul nu a fost repornit sau secțiunea [Journal] lipsește', <code>systemctl status systemd-journald</code>, <>corectează fișierul; <code>systemctl restart systemd-journald</code></>],
          ['Permission denied la citire', 'cont fără acces', <code>id</code>, <><code>sudo</code> sau grup <code>systemd-journal</code></>],
          ['/var plin', 'fără limite', <code>du -sh /var/log/journal</code>, <><code>SystemMaxUse=</code>; <code>journalctl --vacuum-size=</code></>],
          ['valoare Storage necunoscută', 'scris greșit', <code>journalctl -u systemd-journald</code>, <>folosește exact <code>persistent</code></>],
          ['directorul există, dar mesajele nu apar pe disc', 'journald nu a fost repornit', <code>journalctl --flush</code>, <>repornește serviciul, apoi flush</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Creezi directorul, dar uiți <code>systemctl restart systemd-journald</code>.</>,
          <>Scrii <code>persist</code> sau <code>disk</code> în loc de <code>persistent</code>.</>,
          <>Pui parametrii în afara secțiunii <code>[Journal]</code>.</>,
          <>Nu verifici după reboot.</>,
          <>Uiți limitele, iar jurnalul ocupă tot <code>/var</code>.</>,
          <>Încerci să citești jurnalul cu <code>cat</code>/<code>less</code>: este binar, folosește <code>journalctl</code>.</>,
          <>Crezi că rsyslog (fișiere text) și jurnalul se configurează la fel.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: drop-in-uri, systemctl edit și sigilarea">
        <p>
          Mecanismul drop-in (<code>*.conf.d/</code>) este general în systemd: poți completa configurația fără să editezi fișierul principal, ceea ce face actualizările de pachet mai sigure. Pentru unități (L4.9) există <code>systemctl edit unitate</code>, care creează un drop-in <code>override.conf</code>.
        </p>
        <p>
          <code>Seal=</code> și <code>--verify</code> permit sigilarea și verificarea integrității jurnalului (Forward Secure Sealing), util când vrei să demonstrezi că jurnalul nu a fost modificat. Nu face parte din obiectivul oficial.
        </p>
        <p>
          Starea implicită a stocării pe RHEL 10 nu a fost confirmată din documentația Red Hat (necitită, HTTP 403): de aceea lecția cere întâi verificarea, nu presupune nimic. Pentru RHEL 8/9 se descrie de obicei un jurnal volatil cu <code>Storage=auto</code> și fără directorul <code>/var/log/journal</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const L4_8: TopicModule = {
  id: 'L4.8',
  subtitle: 'Storage=persistent / auto, /var/log/journal, journald.conf, --list-boots, vacuum',
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
  labs: [LAB_L4_8],
  sources: [
    { kind: 'man', ref: 'journald.conf(5), systemd-journald.service(8), journalctl(1), systemd-tmpfiles(8), tmpfiles.d(5)' },
    { kind: 'doc', ref: 'RHEL 10 — „Configuring persistent logging by using the journald RHEL system role”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
