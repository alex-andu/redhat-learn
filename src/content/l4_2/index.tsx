import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <G id="systemd-target">target</G> este o „stare” a sistemului: <code>multi-user.target</code> (mod text, rețea, servicii), <code>graphical.target</code> (în plus, interfață grafică), <code>rescue.target</code> și <code>emergency.target</code> (recuperare). Alegi în ce target pornește <b>mereu</b> sistemul cu <code>systemctl set-default</code>, treci acum într-unul cu <code>systemctl isolate</code> și pornești <b>o singură dată</b> într-unul editând linia kernelului în GRUB2 (<code>systemd.unit=…</code>).
          </p>
          <p>Obiective oficiale: <i>„Boot systems into different targets manually”</i> și <i>„Configure systems to boot into a specific target automatically”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un sistem poate fi „pornit” în mai multe grade: doar cu minimul necesar ca să repari ceva, complet dar fără ecran grafic (un server), sau complet cu desktop. Vechiul sistem SysV numea aceste grade <i>runlevel-uri</i> (numere de la 0 la 6). systemd le numește <b>target-uri</b>: nume clare, grupuri de <G id="systemd-unit">unități</G>.
          </p>
          <p>
            Fără această alegere, ai porni mereu aceeași stare. Un server fără monitor nu trebuie să pornească interfața grafică (consumă memorie și suprafață de atac), iar un sistem cu o problemă gravă trebuie să poată porni într-o stare minimă ca să fie reparat.
          </p>
          <Analogy>Un target este ca un „mod” al unei clădiri: <i>mod de urgență</i> (doar lumina de avarie, <code>emergency</code>), <i>mod de întreținere</i> (curent și apă, dar fără clienți, <code>rescue</code>), <i>mod normal</i> (deschis, <code>multi-user</code>) și <i>mod eveniment</i> (în plus, scena luminată, <code>graphical</code>). „Target-ul implicit” este modul în care clădirea se deschide în fiecare dimineață.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Un target grupează unități</h4>
          <p>
            Fișierul <code>/usr/lib/systemd/system/multi-user.target</code> nu pornește nimic prin el însuși; el declară dependențe: „vreau <code>sshd.service</code>, <code>crond.service</code>, <code>NetworkManager.service</code>…”. Când systemd atinge target-ul, a pornit tot ce e legat de el. Serviciile pe care le <code>enable</code>-ezi (L4.9) sunt legate prin <code>WantedBy=multi-user.target</code> (sau graphical).
          </p>
          <h4>Relațiile dintre target-urile principale</h4>
          <ul>
            <li><code>graphical.target</code> „pulls” (include) <code>multi-user.target</code>: graphical = multi-user + login grafic.</li>
            <li><code>rescue.target</code>: sistem de bază, sisteme de fișiere montate, shell de root (parola root cerută).</li>
            <li><code>emergency.target</code>: cel mai minimal; nu pornește alte servicii sau montări; rădăcina poate fi doar pentru citire.</li>
          </ul>
          <h4>Target-ul implicit: o legătură simbolică</h4>
          <p>
            La boot, kernelul cere lui systemd să atingă <code>default.target</code>. Acesta este un alias, o <i>legătură simbolică</i> (L1.7) la <code>/etc/systemd/system/default.target</code>, spre un target real. <G id="default-target">default.target</G> poate fi suprascris la boot cu parametrul kernelului <code>systemd.unit=</code>; dacă nu există deloc, valoarea compilată este <code>graphical.target</code>; dacă pornirea lui eșuează, systemd poate porni <code>rescue.target</code>.
          </p>
          <h4>Echivalența cu runlevel-urile vechi</h4>
          <Table head={['Runlevel', 'Target']} rows={[
            ['0', <code>poweroff.target</code>],
            ['1', <code>rescue.target</code>],
            ['2, 3, 4', <code>multi-user.target</code>],
            ['5', <code>graphical.target</code>],
            ['6', <code>reboot.target</code>],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Boot</b> (L4.1): ultima etapă a boot-ului este atingerea target-ului implicit.</li>
            <li><b>GRUB2 și linia kernelului</b> (L4.3): <code>systemd.unit=…</code> se pune acolo, temporar.</li>
            <li><b>Servicii</b> (L4.9): <code>systemctl enable</code> leagă un serviciu de un target; serviciul pornește când acel target este atins.</li>
            <li><b>Legături simbolice</b> (L1.7): <code>default.target</code> este una.</li>
            <li><b>Root și sudo</b> (L1.10): schimbarea target-ului cere privilegii.</li>
            <li><b>/etc/fstab</b> (C6): o montare greșită poate bloca boot-ul și te poate arunca în emergency; aici repari.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Server nou: îl pui pe <code>multi-user.target</code> ca să nu pornească grafica.</li>
            <li>Stație de lucru: <code>graphical.target</code>.</li>
            <li>Lucrări care se fac mai bine fără utilizatori sau fără anumite servicii: <code>systemctl isolate rescue.target</code> temporar.</li>
            <li>Sistemul nu pornește (fstab greșit, serviciu care blochează): pornești o dată în <code>rescue</code> sau <code>emergency</code> ca să repari.</li>
            <li>La examen: „configurează sistemul să pornească în mod text” (persistent) sau „pornește în rescue”; verifici după reboot.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propria mașină virtuală de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Vezi target-ul implicit și pe cele existente</h4>
        <CodeBlock title="comenzi (ca root)" code={`systemctl get-default\nsystemctl list-units --type=target\nsystemctl list-units --type=target --all\nsystemctl list-unit-files --type=target\nsystemctl list-dependencies graphical.target`} explain={[
          ['get-default', 'afișează numele target-ului în care va porni sistemul.'],
          ['list-units', 'listează unitățile ÎNCĂRCATE, active acum.'],
          ['--type=target', 'filtrează după tipul unității: doar target-uri.'],
          ['--all', 'include și unitățile inactive.'],
          ['list-unit-files', 'listează fișierele de unitate de pe disc și starea lor (enabled/disabled/static), indiferent dacă sunt încărcate.'],
          ['list-dependencies TARGET', 'arată arborele de dependențe: ce pornește, direct sau indirect, acel target.'],
        ]} />

        <h4>2. Schimbă target-ul implicit (persistent)</h4>
        <CodeBlock title="comenzi (ca root)" code={`systemctl set-default multi-user.target\nsystemctl get-default\nls -l /etc/systemd/system/default.target\nsystemctl set-default graphical.target`} explain={[
          ['set-default TARGET', 'face ca default.target să indice spre TARGET. Persistă la reboot; nu schimbă starea curentă.'],
          ['ls -l …/default.target', 'confirmă legătura simbolică și ținta ei.'],
          ['multi-user.target', 'mod text multi-utilizator, cu rețea.'],
          ['graphical.target', 'mod grafic; necesită pachetele de interfață grafică.'],
        ]} />

        <h4>3. Treci acum într-un alt target (temporar)</h4>
        <CodeBlock title="comenzi (ca root)" code={`systemctl isolate multi-user.target\nsystemctl isolate graphical.target\nsystemctl rescue\nsystemctl emergency\nsystemctl default`} explain={[
          ['isolate TARGET', 'pornește TARGET și OPREȘTE tot ce nu îi aparține. Efect imediat, nepermanent: la reboot revine default.target.'],
          ['rescue', 'echivalent cu isolate rescue.target (cere root; te lasă într-un shell de recuperare).'],
          ['emergency', 'echivalent cu isolate emergency.target; cel mai minimal.'],
          ['default', 'trece în target-ul implicit (revii din rescue sau emergency fără reboot).'],
        ]} />
        <Callout kind="warn" title="Atenție la isolate">
          <code>isolate</code> oprește servicii și poate închide sesiunea ta (inclusiv SSH, în rescue sau emergency). Folosește-l de la consola mașinii, nu printr-o conexiune remote de care depinzi.
        </Callout>

        <h4>4. Boot o singură dată într-un target (din GRUB2)</h4>
        <CodeBlock title="în meniul GRUB2 (la consolă)" code={`# 1. La meniu: apasă o tastă (ex. săgeată) ca să oprești numărătoarea\n# 2. Selectează intrarea kernelului și apasă:  e\n# 3. Găsește linia care începe cu "linux" și mergi la capătul ei (End)\n# 4. Adaugă, după un spațiu:\n systemd.unit=rescue.target\n# 5. Pornește cu:  Ctrl+x`} explain={[
          ['e', 'deschide editorul pentru intrarea selectată; modificarea valabilă doar pentru acest boot.'],
          ['linia „linux …”', 'conține kernelul și parametrii lui (root=, ro, rhgb, quiet…). Parametrii noi se adaugă la sfârșit.'],
          ['systemd.unit=rescue.target', 'cere lui systemd să atingă rescue.target în loc de default.target. Alternative: emergency.target, multi-user.target, graphical.target.'],
          ['Ctrl+x', 'pornește sistemul cu modificarea. (Esc anulează editarea.)'],
        ]} />
        <Callout kind="info" title="Din shell-ul de rescue">
          Rescue și emergency cer parola de root. Din emergency, rădăcina poate fi doar pentru citire: <code>mount -o remount,rw /</code> o face scriibilă (dacă e nevoie să repari un fișier).
        </Callout>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="get-default / set-default" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl get-default\ngraphical.target\n[root@server1 ~]# systemctl set-default multi-user.target\nRemoved "/etc/systemd/system/default.target".\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/multi-user.target.\n[root@server1 ~]# systemctl get-default\nmulti-user.target`} />
        <p className="small"><code>set-default</code> șterge legătura veche și creează una nouă; asta și face efectiv comanda. Stare actuală nu se schimbă până la reboot sau <code>isolate</code>. Formularea poate diferi între versiuni.</p>
        <CodeBlock title="list-units --type=target" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl list-units --type=target\nUNIT                   LOAD   ACTIVE SUB    DESCRIPTION\nbasic.target           loaded active active Basic System\nmulti-user.target      loaded active active Multi-User System\nnetwork.target         loaded active active Network\nsysinit.target         loaded active active System Initialization\n...\nLOAD   = Reflects whether the unit definition was properly loaded.\nACTIVE = The high-level unit activation state, i.e. generalization of SUB.\nSUB    = The low-level unit activation state, values depend on unit type.`} />
        <p className="small">Coloane: <code>UNIT</code> = numele; <code>LOAD</code> = definiția a fost încărcată; <code>ACTIVE</code> = starea generală; <code>SUB</code> = starea detaliată; <code>DESCRIPTION</code> = descriere. Lista reală este mai lungă; aici e scurtată.</p>
        <CodeBlock title="list-unit-files --type=target" kind="session" label="illustrative" code={`[root@server1 ~]# systemctl list-unit-files --type=target | head -6\nUNIT FILE                 STATE    PRESET\nbasic.target              static   -\ndefault.target            alias    -\nemergency.target          static   -\ngraphical.target          static   -\nmulti-user.target         static   -`} />
        <p className="small"><code>static</code> = unitate care nu se poate activa direct (e inclusă de altele); <code>alias</code> = nume alternativ pentru altă unitate (aici, <code>default.target</code>). Coloana PRESET poate apărea sau nu.</p>
        <CodeBlock title="default.target" kind="session" label="illustrative" code={`[root@server1 ~]# ls -l /etc/systemd/system/default.target\nlrwxrwxrwx. 1 root root 41 Nov 16 10:02 /etc/systemd/system/default.target -> /usr/lib/systemd/system/multi-user.target`} />
        <p className="small"><code>l</code> la început = legătură simbolică; după <code>-&gt;</code> este ținta. Data și dimensiunea sunt exemple.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Implicit:</b> <code>systemctl get-default</code> și <code>ls -l /etc/systemd/system/default.target</code>.</li>
            <li><b>Starea curentă:</b> <code>systemctl list-units --type=target --state=active</code>; <code>systemctl is-active multi-user.target</code>.</li>
            <li><b>Boot temporar:</b> <code>cat /proc/cmdline</code> arată parametrul adăugat (<code>systemd.unit=…</code>).</li>
            <li><b>Persistență:</b> reboot și <code>get-default</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <Table head={['Acțiune', 'Persistă la reboot?']} rows={[
            [<code>systemctl set-default …</code>, <b>da</b>],
            [<code>systemctl isolate …</code>, 'nu'],
            [<><code>systemctl rescue</code> / <code>emergency</code></>, 'nu'],
            [<><code>systemd.unit=…</code> în GRUB2 (tasta e)</>, 'nu: doar acel boot'],
          ]} />
          <p>Confirmare manuală: repornești și rulezi <code>systemctl get-default</code>; dacă e valoarea dorită, e persistent.</p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['după set-default nu s-a schimbat nimic', <>este normal: afectează doar următorul boot</>, <code>systemctl get-default</code>, <>reboot sau <code>isolate</code></>],
          [<><code>Failed to set default target: Unit … not found</code></>, 'nume greșit (lipsește .target sau e scris greșit)', <code>systemctl list-unit-files --type=target</code>, 'folosește numele exact'],
          ['sistemul pornește mereu în rescue', <>default.target indică spre rescue.target</>, <code>systemctl get-default</code>, <><code>set-default multi-user.target</code></>],
          ['pornește în emergency după adăugarea unei montări', <>intrare greșită în <code>/etc/fstab</code></>, <code>journalctl -xb</code>, <>corectează fstab (C6); <code>mount -a</code> pentru test</>],
          ['parametrul din GRUB2 nu are efect', <>scris greșit (<code>systemd.target=</code>) sau pe altă linie</>, <code>cat /proc/cmdline</code>, <>folosește <code>systemd.unit=</code> pe linia <code>linux</code></>],
          ['sesiunea SSH s-a închis după isolate', 'isolate a oprit sshd (rescue/emergency)', 'consolă', 'lucrează de la consolă pentru isolate'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești <code>isolate</code> în loc de <code>set-default</code> (sau invers) și crezi că ai făcut ce cerea sarcina.</>,
          <>Uiți <code>.target</code> sau scrii greșit numele target-ului.</>,
          <>Scrii <code>systemd.target=</code> în loc de <code>systemd.unit=</code>.</>,
          <>Editezi GRUB2 cu <code>e</code> și crezi că modificarea e permanentă.</>,
          <>Nu repornești ca să confirmi persistența.</>,
          <>Rulezi <code>isolate rescue.target</code> printr-o sesiune SSH și te blochezi.</>,
          <>Încerci rescue fără să știi parola de root.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: unități .wants, alias, inversarea dependențelor și ordonarea">
        <p>
          Dependențele unui target nu stau numai în fișierul lui: <code>systemctl enable</code> creează legături în directoare de tip <code>multi-user.target.wants/</code> (în <code>/etc/systemd/system/</code>), iar systemd le citește la fel ca pe liniile <code>Wants=</code>. De aceea un serviciu activat apare „agățat” de un target.
        </p>
        <p>
          <code>Requires=</code> este o dependență tare (dacă dependența eșuează, și unitatea eșuează), iar <code>Wants=</code> una slabă. <code>After=</code>/<code>Before=</code> stabilesc <i>ordinea</i>, nu dependența: în systemd, „a avea nevoie” și „a porni după” sunt lucruri separate.
        </p>
        <p>
          <code>systemctl list-dependencies --reverse UNIT</code> arată cine depinde de o unitate. Informațiile despre versiunea systemd din RHEL 10 nu au fost confirmate din documentația Red Hat (necitită, HTTP 403).
        </p>
      </DeepDive>
    </>
  );
}

export const L4_2: TopicModule = {
  id: 'L4.2',
  subtitle: 'multi-user, graphical, rescue, emergency; set-default, isolate; systemd.unit= în GRUB2',
  studyTime: '≈70 min studiu + laborator',
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
  labs: [LAB_L4_2],
  sources: [
    { kind: 'man', ref: 'systemctl(1), systemd.target(5), systemd.special(7), kernel-command-line(7), bootup(7), sulogin(8)' },
    { kind: 'upstream', ref: 'freedesktop.org — systemd.special(7) (citit 2026-11-16)' },
    { kind: 'doc', ref: 'RHEL 10 — „Booting into a target system state”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
