import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un calculator pornește printr-un lanț de programe: <G id="boot-process">firmware → GRUB2 → kernel → systemd</G>. Îl oprești sau îl repornești <b>ordonat</b> cu <code>systemctl reboot</code>, <code>systemctl poweroff</code> sau cu <code>shutdown</code> (care poate programa momentul și anunța utilizatorii).
            Nu întrerupi curentul și nu apeși butonul: sistemul trebuie să închidă serviciile și să scrie datele pe disc.
          </p>
          <p>Obiectivul oficial: <i>„Boot, reboot, and shut down a system normally”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Când pornești calculatorul, nimic nu „știe” încă să ruleze Linux. Hardware-ul are doar un mic program în firmware, iar Linux stă pe disc. Cineva trebuie să facă legătura, pas cu pas: să găsească discul, să încarce kernelul, să pornească serviciile. Acest lanț se numește <b>procesul de boot</b>. Înțelegerea lui contează pentru că, dacă sistemul nu pornește, trebuie să știi <i>la ce etapă</i> s-a oprit și ce să repari.
          </p>
          <p>
            Oprirea are propria problemă: un server are zeci de procese care scriu pe disc (baze de date, jurnale). Dacă tai curentul, datele aflate încă în memorie se pierd și sistemul de fișiere poate rămâne inconsistent. De aceea există comenzi care spun lui <G id="systemd">systemd</G>: „oprește totul în ordine, apoi oprește mașina”.
          </p>
          <Analogy>Boot-ul este ca o ștafetă: fiecare alergător duce ștafeta mai departe (firmware → bootloader → kernel → systemd). Oprirea ordonată este ca închiderea unui magazin: trimiți clienții acasă, golești casa, stingi luminile și abia apoi încui; nu stingi tabloul electric în mijlocul programului.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Cele cinci etape ale pornirii</h4>
          <ol>
            <li><b>Firmware (UEFI sau BIOS).</b> Rulează la pornire, verifică hardware-ul (POST), alege dispozitivul de pe care se pornește și transferă controlul <G id="bootloader">bootloader-ului</G>.</li>
            <li><b>Bootloader (GRUB2).</b> Afișează meniul de boot (poți alege altă versiune de kernel), apoi încarcă în memorie kernelul și <G id="initramfs">initramfs</G>, împreună cu <i>linia de comandă a kernelului</i> (parametri precum <code>root=…</code>, <code>rhgb quiet</code>).</li>
            <li><b>Kernel + initramfs.</b> Kernelul inițializează hardware-ul și memoria. Din initramfs (un mic sistem de fișiere în RAM) obține driverele necesare ca să găsească discul și să monteze rădăcina reală.</li>
            <li><b>systemd (PID 1).</b> Kernelul pornește primul proces, <code>/usr/lib/systemd/systemd</code>, care primește PID 1. El citește unitățile și pornește, în paralel și după dependențe, tot ce cere <b>target-ul implicit</b> (L4.2).</li>
            <li><b>Sistem utilizabil.</b> Apar ecranul de login sau serviciul <code>sshd</code>; <code>systemctl is-system-running</code> raportează <code>running</code>.</li>
          </ol>
          <h4>Cum funcționează oprirea</h4>
          <p>
            <code>systemctl reboot</code> și <code>poweroff</code> nu opresc direct mașina. Ele pornesc în systemd o „tranzacție” specială (<code>reboot.target</code> sau <code>poweroff.target</code>), care oprește serviciile în ordinea inversă a pornirii, demontează sistemele de fișiere și abia la urmă cere kernelului repornirea sau oprirea.
            Comenzile <code>reboot</code>, <code>poweroff</code> și <code>halt</code> sunt, pe sistemele systemd, scurtături către <code>systemctl</code>.
          </p>
          <p>
            <G id="shutdown-cmd">shutdown</G> adaugă <b>programarea</b>: o oră (<code>now</code>, <code>+minute</code>, <code>hh:mm</code>) și un mesaj trimis utilizatorilor conectați. Programarea este ținută de systemd în memorie; nu supraviețuiește unui reboot.
          </p>
          <Table head={['Vrei…', 'Comandă', 'Efect']} rows={[
            ['repornire imediată', <code>systemctl reboot</code>, 'oprire ordonată + repornire'],
            ['oprire completă', <code>systemctl poweroff</code>, 'oprire ordonată + alimentarea tăiată'],
            ['oprirea sistemului de operare', <code>systemctl halt</code>, 'oprește sistemul; alimentarea nu e garantat tăiată'],
            ['reboot peste 10 minute, cu mesaj', <code>shutdown -r +10 "mesaj"</code>, 'programează și anunță utilizatorii'],
            ['anulezi programarea', <code>shutdown -c</code>, 'șterge programarea'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Targets systemd</b> (L4.2): ultima etapă a boot-ului pornește <i>target-ul implicit</i>; poți porni și într-un target diferit.</li>
            <li><b>GRUB2 și parametrii kernelului</b> (L4.3): meniul de boot permite modificarea temporară a liniei de comandă, pentru recuperare.</li>
            <li><b>Servicii</b> (L4.9): serviciile <i>enabled</i> pornesc singure la boot; la oprire, systemd le oprește în ordine inversă.</li>
            <li><b>Jurnale</b> (L4.7, L4.8): fiecare boot are propriile intrări; <code>journalctl -b</code> arată boot-ul curent, <code>journalctl --list-boots</code> pe cele păstrate.</li>
            <li><b>Utilizatori și sudo</b> (L1.10): doar root (sau sudo) poate reporni sistemul; un utilizator obișnuit primește un mesaj de autentificare.</li>
            <li><b>SSH</b> (L1.11): un reboot închide sesiunea SSH; reconectarea reușește abia după ce <code>sshd</code> pornește din nou.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>După actualizarea kernelului sau a unor biblioteci de bază, ca să rulezi codul nou.</li>
            <li>După schimbări de configurare care se aplică doar la boot (parametri de kernel, SELinux de la „disabled”, fstab greșit pe care vrei să-l testezi).</li>
            <li>Mentenanță programată: anunți utilizatorii cu <code>shutdown +15 "…"</code>, nu îi arunci brusc din sesiune.</li>
            <li>La examen: după ce ai configurat ceva persistent (montări, servicii, firewall, parametri de rețea), un reboot este testul care arată dacă a fost <i>cu adevărat</i> persistent.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem de test (de preferat o mașină virtuală proprie). Output-urile sunt <b>Ilustrative</b> și nu au fost rulate pe RHEL 10 la redactare. Atenție: unele comenzi de mai jos opresc sistemul.
        </Callout>

        <h4>1. Repornire și oprire imediate cu <code>systemctl</code></h4>
        <CodeBlock title="comenzi (ca root)" code={`systemctl reboot\nsystemctl poweroff\nsystemctl halt\nsudo systemctl reboot`} explain={[
          ['systemctl', 'comanda care vorbește cu systemd (PID 1).'],
          ['reboot', 'ACȚIUNE: oprește totul ordonat și repornește. Sesiunea ta (și SSH) se întrerupe.'],
          ['poweroff', 'ACȚIUNE: oprește totul ordonat și taie alimentarea. Pe o VM, mașina devine „oprită”; trebuie pornită din hypervisor.'],
          ['halt', 'ACȚIUNE: oprește sistemul de operare, dar nu garantează tăierea alimentării.'],
          ['sudo …', 'ca utilizator obișnuit cu drept sudo (L1.10), prefixezi comanda; ca root, nu e nevoie.'],
        ]} />

        <h4>2. Scurtăturile <code>reboot</code>, <code>poweroff</code>, <code>halt</code></h4>
        <CodeBlock title="comenzi" code={`reboot\npoweroff\nhalt`} explain={[
          ['reboot / poweroff / halt', 'pe sisteme systemd sunt legături către systemctl și fac același lucru ca systemctl reboot / poweroff / halt.'],
        ]} />

        <h4>3. Programarea cu <code>shutdown</code></h4>
        <CodeBlock title="comenzi" code={`shutdown -r now\nshutdown -h +15 "Mentenanță: oprire în 15 minute"\nshutdown -r 23:30\nshutdown -P +5 "Se oprește sistemul"\nshutdown -k +5 "Doar test de avertizare"\nshutdown -c`} explain={[
          ['shutdown', 'programează oprirea sau repornirea; sintaxa: shutdown [OPȚIUNI] [ORA] [MESAJ].'],
          ['-r', 'reboot: repornește după oprire.'],
          ['-h', 'halt/poweroff: oprește sistemul (în systemd, ca opțiune de „oprire” în general).'],
          ['-P', 'poweroff: oprește și taie alimentarea (explicit).'],
          ['-k', 'kidding: trimite doar mesajul de avertizare, nu oprește nimic.'],
          ['-c', 'cancel: anulează o programare existentă.'],
          ['now', 'imediat.'],
          ['+15', 'peste 15 minute; formă relativă (plus înseamnă „de acum”).'],
          ['23:30', 'la ora 23:30 (formă hh:mm, ora locală a sistemului); dacă ora a trecut, înseamnă ziua următoare.'],
          ['"mesaj"', 'text trimis (wall) tuturor utilizatorilor conectați. Între ghilimele, ca să fie un singur argument.'],
        ]} />
        <Callout kind="warn" title="Capcană: conectări blocate">
          Când mai sunt <b>cel mult 5 minute</b> până la oprire, <code>shutdown</code> creează <code>/run/nologin</code> și utilizatorii obișnuiți nu se mai pot conecta (<code>shutdown -c</code> îl elimină).
        </Callout>

        <h4>4. Suspendare și hibernare (doar recunoaștere)</h4>
        <CodeBlock title="comenzi" code={`systemctl suspend\nsystemctl hibernate`} explain={[
          ['suspend', 'pune sistemul în repaus, cu starea în RAM (consum minim). Nu e frecvent pe servere.'],
          ['hibernate', 'salvează starea pe disc (în swap) și oprește mașina. Necesită configurare; rar folosit pe servere.'],
        ]} />

        <h4>5. Confirmarea timpului de pornire și a stării</h4>
        <CodeBlock title="comenzi" code={`who -b\nuptime\nuptime -p\nuptime -s\nlast -x reboot shutdown\njournalctl --list-boots\nsystemctl is-system-running`} explain={[
          ['who -b', 'data și ora ultimei porniri.'],
          ['uptime', 'ora curentă, durata de funcționare, numărul de utilizatori și încărcarea medie.'],
          ['uptime -p', '-p (pretty): durata în cuvinte.'],
          ['uptime -s', '-s (since): momentul pornirii, format AAAA-LL-ZZ HH:MM:SS.'],
          ['last -x reboot shutdown', 'istoricul evenimentelor de sistem (-x include reboot/shutdown); cuvintele de la final filtrează pe tipul evenimentului.'],
          ['journalctl --list-boots', 'listează boot-urile păstrate în jurnal (unul singur dacă jurnalul nu e persistent, L4.8).'],
          ['systemctl is-system-running', 'un singur cuvânt: running, degraded, starting, stopping, maintenance.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="shutdown programat" kind="session" label="illustrative" code={`[root@server1 ~]# shutdown -r +10 "Reboot pentru actualizare"\nShutdown scheduled for Mon 2026-11-16 15:40:00 UTC, use 'shutdown -c' to cancel.`} />
        <p className="small">systemd confirmă programarea, arată ora exactă (momentul de acum + 10 minute) și amintește cum se anulează. Utilizatorii conectați văd mesajul tău. Data este un exemplu.</p>
        <CodeBlock title="uptime" kind="session" label="illustrative" code={`[student@server1 ~]$ uptime\n 15:31:07 up  3:41,  2 users,  load average: 0.08, 0.03, 0.01\n[student@server1 ~]$ uptime -p\nup 3 hours, 41 minutes\n[student@server1 ~]$ uptime -s\n2026-11-16 11:50:03`} />
        <p className="small"><code>15:31:07</code> = ora curentă; <code>up 3:41</code> = rulează de 3 ore și 41 de minute; <code>2 users</code> = sesiuni deschise; <code>load average</code> = încărcarea medie pe 1, 5 și 15 minute. <code>-p</code> și <code>-s</code> prezintă aceeași informație în alt format. Valorile sunt exemple.</p>
        <CodeBlock title="last -x" kind="session" label="illustrative" code={`[student@server1 ~]$ last -x reboot shutdown | head -4\nshutdown system down  5.14.0-xyz.el10 Mon Nov 16 11:49 - 11:50  (00:00)\nreboot   system boot  5.14.0-xyz.el10 Mon Nov 16 11:50   still running\nshutdown system down  5.14.0-xyz.el10 Sun Nov 15 22:01 - 11:49  (13:48)`} />
        <p className="small">Fiecare oprire (<code>shutdown</code>) este urmată de o pornire (<code>reboot</code>); ultima coloană arată cât a durat starea. Versiunea kernelului este un exemplu construit.</p>
        <CodeBlock title="is-system-running" kind="session" label="illustrative" code={`[student@server1 ~]$ systemctl is-system-running\nrunning\n[student@server1 ~]$ systemctl is-system-running\ndegraded`} />
        <p className="small"><code>running</code> = toate unitățile au pornit fără erori. <code>degraded</code> = sistemul funcționează, dar cel puțin o unitate a eșuat; o găsești cu <code>systemctl --failed</code> (L4.9).</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Reboot confirmat: <code>who -b</code> arată o oră mai recentă decât înainte; <code>uptime -p</code> arată un timp scurt; <code>last -x reboot</code> are o linie nouă.</li>
            <li>Programare activă sau nu: ai primit mesajul „Shutdown scheduled…”; după <code>shutdown -c</code> nu mai există și <code>/run/nologin</code> lipsește.</li>
            <li>Sistem sănătos după boot: <code>systemctl is-system-running</code> → <code>running</code>.</li>
            <li>Oprirea nu se poate „verifica” din interior: dispare sesiunea; o confirmi din consola hypervisor-ului sau a mașinii.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Comenzile de aici nu schimbă configurarea; ele <b>folosesc</b> persistența. Rolul reboot-ului este să dovedească că ce ai configurat anterior (servicii <code>enable</code>, montări în <code>/etc/fstab</code>, reguli firewall <code>--permanent</code>, nume de gazdă) supraviețuiește. Pe examen, o configurare care funcționează doar până la reboot nu este considerată corectă.
          </p>
          <p>
            O programare <code>shutdown</code> <b>nu</b> supraviețuiește unui reboot: ține de systemd-logind, în memorie. Confirmare manuală: programezi, repornești altfel (<code>systemctl reboot</code>), iar după boot <code>shutdown -c</code> nu are ce anula.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Interactive authentication required</code>, 'rulezi ca utilizator fără drepturi', <><code>id</code>, <code>sudo -l</code></>, <>folosește <code>sudo</code> sau root</>],
          ['sesiunea SSH „îngheață” după reboot', 'conexiunea a fost tăiată, nu e o eroare', 'așteaptă pornirea și reconectează-te', <>reconectează-te; <code>ssh</code> reia o conexiune nouă</>],
          ['nu te poți conecta cu un utilizator obișnuit înainte de oprire', <><code>/run/nologin</code> existent (≤5 min)</>, <code>ls /run/nologin</code>, <><code>shutdown -c</code> sau conectare ca root</>],
          [<><code>is-system-running</code> = <code>degraded</code></>, 'o unitate a eșuat la boot', <code>systemctl --failed</code>, <>repară unitatea (L4.9), apoi <code>systemctl reset-failed</code></>],
          ['sistemul nu pornește deloc după reboot', 'eroare în GRUB, kernel, fstab sau serviciu critic', 'consola VM; mesajele de boot', <>vezi L4.2 (rescue/emergency) și L4.3</>],
          ['„halt” nu a oprit alimentarea', <>așa se comportă <code>halt</code></>, '—', <>folosește <code>poweroff</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confuzia <code>systemctl restart</code> (repornești un serviciu) cu <code>systemctl reboot</code> (repornești sistemul).</>,
          <>Folosești <code>-h</code> când voiai <code>-r</code>: sistemul se oprește și nu mai are cine să îl pornească (pe o VM, o pornești din hypervisor).</>,
          <>Uiți ghilimelele la mesajul din <code>shutdown</code>.</>,
          <>Crezi că <code>halt</code> și <code>poweroff</code> sunt identice.</>,
          <>Rulezi un reboot pe o gazdă greșită, în altă sesiune SSH: verifică <code>hostname</code> înainte.</>,
          <>Presupui că ai configurat persistent fără să repornești și să testezi.</>,
          <>Închizi forțat o VM în timpul scrierii pe disc: poate corupe sistemul de fișiere.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: SysV vs systemd, runlevel-uri, reboot forțat și orele locale">
        <p>
          Înainte de systemd, sistemele foloseau SysV init cu <i>runlevel-uri</i> (0 = oprire, 6 = reboot). Comenzile vechi <code>init 0</code>, <code>init 6</code>, <code>telinit</code> încă funcționează ca scurtături către systemd, dar la examen folosești <code>systemctl</code>/<code>shutdown</code>. Echivalențele (runlevel → target) sunt în L4.2.
        </p>
        <p>
          <code>systemctl reboot --force</code> sare peste oprirea ordonată a serviciilor (dar demontează totuși sistemele de fișiere); <code>--force --force</code> repornește imediat, fără nicio oprire. Sunt ultime resurse pentru sisteme blocate; pot pierde date.
        </p>
        <p>
          <code>shutdown</code> la o oră <code>hh:mm</code> folosește ora locală a sistemului (fusul orar al mașinii, nu al tău). Ora se verifică cu <code>date</code> sau <code>timedatectl</code> (C7).
        </p>
        <p>
          <code>systemctl is-system-running</code> poate raporta și <code>starting</code> (boot în curs), <code>stopping</code> (oprire) sau <code>maintenance</code> (rescue/emergency).
        </p>
      </DeepDive>
    </>
  );
}

export const L4_1: TopicModule = {
  id: 'L4.1',
  subtitle: 'Etapele boot-ului, systemctl reboot/poweroff, shutdown programat, verificarea reboot-ului',
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
  labs: [LAB_L4_1],
  sources: [
    { kind: 'man', ref: 'systemctl(1), shutdown(8), reboot(8), systemd(1), bootup(7), who(1), uptime(1), last(1), journalctl(1)' },
    { kind: 'upstream', ref: 'freedesktop.org — systemd.special(7) (citit 2026-11-16)' },
    { kind: 'doc', ref: 'RHEL 10 — „Manage system services and boot behavior”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
