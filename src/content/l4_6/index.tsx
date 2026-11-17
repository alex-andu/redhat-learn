import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_6 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="tuned">tuned</G> este un serviciu care aplică un <G id="tuned-profile">profil</G> de reglaj sistemului: debit maxim, latență mică, economie de energie sau potrivire la o mașină virtuală. Îl pornești cu <code>systemctl enable --now tuned</code> și îl controlezi cu <code>tuned-adm</code>: <code>list</code>, <code>active</code>, <code>recommend</code>, <code>profile NUME</code>, <code>verify</code>, <code>off</code>. Profilul activ persistă la reboot.
          </p>
          <p>Obiectivul oficial: <i>„Manage tuning profiles”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Kernelul Linux are sute de parametri reglabili: cum se planifică procesele, cât din memorie se folosește ca cache, cum se scriu datele pe disc, cât de agresiv se oprește CPU-ul ca să economisească energie. Valorile implicite sunt un compromis. Un server de baze de date, o mașină virtuală și un laptop au nevoi diferite.
          </p>
          <p>
            Fără tuned, ar trebui să modifici manual zeci de setări (cu <code>sysctl</code>, fișiere din <code>/sys</code>) și să le reaplici la fiecare boot. tuned le grupează în <b>profiluri</b> cu nume și le aplică singur.
          </p>
          <Analogy>Profilurile tuned sunt ca modurile unei mașini: „Eco”, „Normal”, „Sport”. Nu reglezi separat motorul, cutia și suspensia; alegi un mod, iar mașina își schimbă mai multe setări deodată.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <ol>
            <li>Serviciul <code>tuned</code> pornește (systemd, L4.9) și citește profilul activ din <code>/etc/tuned/active_profile</code>.</li>
            <li>Citește <code>tuned.conf</code> al profilului: un fișier cu secțiuni (<code>[cpu]</code>, <code>[disk]</code>, <code>[sysctl]</code>, <code>[vm]</code> …) care descriu setările.</li>
            <li>Aplică setările (parametri kernel, guvernatorul CPU, planificator de disc etc.).</li>
            <li>Când schimbi profilul cu <code>tuned-adm profile</code>, tuned dezface setările vechi și le aplică pe cele noi, fără reboot.</li>
          </ol>
          <h4>Unde sunt fișierele</h4>
          <Table head={['Cale', 'Rol']} rows={[
            [<code>/usr/lib/tuned/NUME/tuned.conf</code>, 'profiluri furnizate de pachete (nu le edita)'],
            [<code>/etc/tuned/NUME/tuned.conf</code>, 'profiluri proprii; au prioritate'],
            [<code>/etc/tuned/active_profile</code>, 'numele profilului activ (persistență)'],
            [<code>/etc/tuned/profile_mode</code>, <><code>auto</code> (recomandat) sau <code>manual</code> (ales de tine)</>],
            [<code>/var/log/tuned/tuned.log</code>, 'jurnalul serviciului'],
          ]} />
          <h4>Profiluri frecvente</h4>
          <Table head={['Profil', 'Scop']} rows={[
            [<code>balanced</code>, 'compromis între performanță și consum'],
            [<code>throughput-performance</code>, 'debit maxim (servere, baze de date)'],
            [<code>latency-performance</code>, 'latență mică, consum mai mare'],
            [<code>network-latency</code>, <>derivat din latency-performance, cu reglaje de rețea</>],
            [<code>network-throughput</code>, 'debit de rețea maxim'],
            [<code>powersave</code>, 'economie de energie'],
            [<code>virtual-guest</code>, 'optimizat pentru o mașină virtuală (oaspete)'],
            [<code>virtual-host</code>, 'optimizat pentru gazda de virtualizare'],
          ]} />
          <p>Lista exactă depinde de pachetele instalate; vezi <code>tuned-adm list</code>.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>systemd și servicii</b> (L4.9): tuned este un serviciu; trebuie <code>enabled</code> pentru persistență.</li>
            <li><b>Planificator și nice</b> (L4.5): un profil poate regla planificatorul; nice rămâne controlul per proces.</li>
            <li><b>Pachete</b> (C2): <code>dnf install tuned</code>; unele profiluri vin în pachete separate (<code>tuned-profiles-*</code>).</li>
            <li><b>Jurnale</b> (L4.7): <code>journalctl -u tuned</code> și <code>/var/log/tuned/tuned.log</code>.</li>
            <li><b>Virtualizare</b>: <code>virtual-guest</code> / <code>virtual-host</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Servere de baze de date sau de calcul: <code>throughput-performance</code>.</li>
            <li>Aplicații sensibile la latență (tranzacții, trading): <code>latency-performance</code> / <code>network-latency</code>.</li>
            <li>Mașini virtuale: <code>virtual-guest</code>.</li>
            <li>Laptopuri și stații cu baterie: <code>powersave</code> sau <code>balanced</code>.</li>
            <li>La examen: „set the tuned profile to X” sau „use the recommended profile”; verifici cu <code>tuned-adm active</code> după reboot.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare, iar lista de profiluri depinde de pachete.
        </Callout>

        <h4>1. Serviciul tuned</h4>
        <CodeBlock title="comenzi (ca root)" code={`dnf install tuned\nsystemctl status tuned\nsystemctl enable --now tuned\nsystemctl is-enabled tuned`} explain={[
          ['dnf install tuned', 'instalează pachetul, dacă lipsește (L2.2).'],
          ['systemctl status tuned', 'arată dacă serviciul rulează.'],
          ['enable --now', 'enable = pornește la boot; --now = pornește și acum.'],
          ['is-enabled', 'răspunde enabled sau disabled.'],
        ]} />

        <h4>2. Vezi profilurile și starea</h4>
        <CodeBlock title="comenzi" code={`tuned-adm list\ntuned-adm active\ntuned-adm recommend\ntuned-adm verify`} explain={[
          ['tuned-adm list', 'profilurile disponibile cu o descriere scurtă; la final arată profilul activ.'],
          ['tuned-adm active', 'doar profilul activ (și modul).'],
          ['tuned-adm recommend', 'profilul pe care tuned îl consideră potrivit pentru acest sistem; NU îl activează.'],
          ['tuned-adm verify', 'compară setările profilului cu cele aplicate efectiv; raportează succes sau eșec.'],
        ]} />

        <h4>3. Schimbă profilul</h4>
        <CodeBlock title="comenzi (ca root)" code={`tuned-adm profile throughput-performance\ntuned-adm profile virtual-guest throughput-performance\ntuned-adm profile balanced\ntuned-adm off\ncat /etc/tuned/active_profile`} explain={[
          ['tuned-adm profile NUME', 'activează profilul; se aplică imediat și se reține pentru boot.'],
          ['profile A B', 'combină două profiluri; la conflict, cel din urmă are prioritate.'],
          ['tuned-adm off', 'dezactivează reglajul tuned (sistemul rămâne cu valorile curente/implicite ale kernelului).'],
          ['cat /etc/tuned/active_profile', 'confirmă ce va fi aplicat la următorul boot.'],
        ]} />

        <h4>4. Profil propriu (doar recunoaștere)</h4>
        <CodeBlock title="/etc/tuned/mixt/tuned.conf (exemplu)" code={`[main]\nsummary=Profil propriu bazat pe throughput-performance\ninclude=throughput-performance\n\n[sysctl]\nvm.swappiness=10`} explain={[
          ['[main]', 'secțiunea cu metadatele profilului.'],
          ['include=throughput-performance', 'moștenește toate setările acelui profil.'],
          ['[sysctl]', 'secțiune cu parametri kernel; aici suprascrii un parametru (vm.swappiness controlează cât de ușor se folosește swap-ul).'],
        ]} />
        <p className="small">Activare: <code>tuned-adm profile mixt</code> (numele directorului). Crearea de profiluri proprii nu este necesară pentru obiectivul oficial; exemplul arată doar cum sunt alcătuite.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="tuned-adm list" kind="session" label="illustrative" code={`[root@server1 ~]# tuned-adm list\nAvailable profiles:\n- accelerator-performance     - Throughput performance based tuning with disabled higher latency STOP states\n- balanced                    - General non-specialized TuneD profile\n- latency-performance         - Optimize for deterministic performance at the cost of increased power consumption\n- powersave                   - Optimize for low power consumption\n- throughput-performance      - Broadly applicable tuning that provides excellent performance across a variety of common server workloads\n- virtual-guest               - Optimize for running inside a virtual guest\n- virtual-host                - Optimize for running KVM guests\nCurrent active profile: virtual-guest`} />
        <p className="small">Fiecare linie are formatul <code>- nume - descriere</code>; ultima linie arată profilul activ. Lista și descrierile reale depind de pachetele instalate și de versiune; aici sunt un exemplu.</p>
        <CodeBlock title="active, recommend, verify" kind="session" label="illustrative" code={`[root@server1 ~]# tuned-adm active\nCurrent active profile: virtual-guest\n[root@server1 ~]# tuned-adm recommend\nvirtual-guest\n[root@server1 ~]# tuned-adm verify\nVerification succeeded, current system settings match the preset profile.\nSee TuneD log file ('/var/log/tuned/tuned.log') for details.`} />
        <p className="small"><code>active</code> arată profilul curent; <code>recommend</code> doar sugerează; <code>verify</code> compară profilul cu starea reală și trimite spre jurnal pentru detalii. Formularea poate diferi.</p>
        <CodeBlock title="active_profile" kind="session" label="illustrative" code={`[root@server1 ~]# cat /etc/tuned/active_profile\nvirtual-guest\n[root@server1 ~]# cat /etc/tuned/profile_mode\nauto`} />
        <p className="small"><code>active_profile</code> conține numele profilului (asta persistă la reboot). <code>profile_mode</code> este <code>auto</code> dacă profilul a fost ales prin recomandare și <code>manual</code> dacă l-ai ales tu cu <code>tuned-adm profile</code>.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>systemctl is-active tuned</code> și <code>is-enabled tuned</code> → <code>active</code> / <code>enabled</code>.</li>
            <li><code>tuned-adm active</code>: profilul dorit.</li>
            <li><code>cat /etc/tuned/active_profile</code>: același nume.</li>
            <li><code>tuned-adm verify</code>: succes.</li>
            <li>După reboot: aceleași rezultate.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Persistența are două părți: (1) alegerea profilului, reținută în <code>/etc/tuned/active_profile</code>; (2) serviciul <code>tuned</code>, care trebuie să fie <code>enabled</code> ca să citească fișierul la boot. Fără a doua, profilul nu se mai aplică după reboot. Confirmare manuală: <code>reboot</code>, apoi <code>tuned-adm active</code> și <code>systemctl is-enabled tuned</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Cannot talk to TuneD daemon</code>, 'serviciul nu rulează', <code>systemctl status tuned</code>, <><code>systemctl enable --now tuned</code></>],
          [<code>Unit tuned.service not found</code>, 'pachet neinstalat', <code>rpm -q tuned</code>, <><code>dnf install tuned</code></>],
          ['profilul nu mai este activ după reboot', 'serviciul nu este enabled', <code>systemctl is-enabled tuned</code>, <><code>systemctl enable tuned</code></>],
          [<><code>tuned-adm verify</code> eșuează</>, 'altceva a modificat un parametru după aplicare', <code>/var/log/tuned/tuned.log</code>, <>reaplică: <code>tuned-adm profile NUME</code></>],
          ['profil necunoscut', 'nume greșit sau pachet lipsă', <code>tuned-adm list</code>, 'copiază numele exact; instalează tuned-profiles-*'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți să activezi serviciul la boot: profilul „dispare” după reboot.</>,
          <>Confunzi <code>recommend</code> (doar sugerează) cu <code>profile</code> (aplică).</>,
          <>Scrii <code>tuned-adm set</code> sau <code>tuned-adm status</code>: nu sunt subcomenzile potrivite din lecție.</>,
          <>Editezi fișiere din <code>/usr/lib/tuned</code> în loc de <code>/etc/tuned</code>.</>,
          <>Nu verifici după reboot.</>,
          <>Crezi că tuned înlocuiește <code>nice</code>: lucrează la nivel de sistem, nu per proces.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: dynamic tuning, moșteniri și roluri sistem">
        <p>
          tuned poate avea și „dynamic tuning” (ajustări automate în funcție de încărcare), controlat prin <code>/etc/tuned/tuned-main.conf</code> (<code>dynamic_tuning</code>). Detaliile se găsesc în <code>tuned-main.conf(5)</code>; pe RHEL 10 valoarea implicită nu a fost confirmată din documentația Red Hat (necitită, HTTP 403).
        </p>
        <p>
          Profilurile se pot suprapune: <code>tuned-adm profile A B</code> aplică ambele în ordine, iar setările din B le suprascriu pe cele din A. Alternativ, un profil propriu poate moșteni cu <code>include=</code>.
        </p>
        <p>
          Dacă tuned este activ, setările lui pot suprascrie un reglaj <code>sysctl</code> făcut manual; de aceea reglajele permanente dorite se pun într-un profil propriu, nu separat.
        </p>
      </DeepDive>
    </>
  );
}

export const L4_6: TopicModule = {
  id: 'L4.6',
  subtitle: 'tuned, tuned-adm list/active/recommend/profile/verify/off; /etc/tuned/active_profile',
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
  labs: [LAB_L4_6],
  sources: [
    { kind: 'man', ref: 'tuned(8), tuned-adm(8), tuned-profiles(7), tuned.conf(5), tuned-main.conf(5)' },
    { kind: 'doc', ref: 'RHEL 10 — „Optimizing system performance with TuneD”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
