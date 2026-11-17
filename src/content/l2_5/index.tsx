import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L2_5 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            După ce ai un <G id="flatpak-remote">remote</G> (L2.4), cauți cu <code>flatpak search</code>, instalezi cu <code>flatpak install NUME-REMOTE ID-APLICAȚIE</code>, vezi ce ai cu <code>flatpak list</code>, pornești cu <code>flatpak run ID-APLICAȚIE</code> și ștergi cu <code>flatpak uninstall ID-APLICAȚIE</code>.
            Runtime-urile rămase neutilizate se curăță cu <code>flatpak uninstall --unused</code>.
          </p>
          <p>Obiectivul oficial: <i>„Install and remove Flatpak software packages”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            O aplicație Flatpak este identificată printr-un <b>Application ID</b> în format reverse-DNS (de exemplu <code>org.exemplu.Calculator</code>, fictiv). Numele prietenos (Calculator) poate fi ambiguu; ID-ul este unic.
            Când instalezi o aplicație, <code>flatpak</code> instalează și <G id="flatpak-runtime">runtime-ul</G> de care are nevoie, dacă nu există deja.
          </p>
          <p>
            Ca la RPM, există separare între „ce este disponibil” (în remote) și „ce este instalat” (local). Comenzile de căutare și <code>remote-ls</code> se uită în remote; <code>flatpak list</code> arată ce este instalat.
          </p>
          <Analogy>remote-ul este catalogul unui magazin de aplicații, iar <code>flatpak list</code> este lista aplicațiilor de pe telefonul tău. Instalarea unei aplicații aduce și „sculele” ei (runtime-ul); ștergerea aplicației nu șterge automat sculele, pentru că alte aplicații pot avea nevoie de ele — de aceea există o curățare separată.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <ol>
            <li><b>Rezolvare:</b> <code>flatpak install</code> caută ref-ul în remote și calculează runtime-urile necesare.</li>
            <li><b>Confirmare:</b> afișează o listă (aplicație, runtime-uri, mărime) și cere confirmare; <code>-y</code> răspunde „da”.</li>
            <li><b>Descărcare și verificare</b> a conținutului (semnături ale remote-ului).</li>
            <li><b>Instalare</b> în instalarea aleasă: sistem (implicit) sau utilizator (<code>--user</code>).</li>
          </ol>
          <h4>Ștergerea</h4>
          <p>
            <code>flatpak uninstall ID</code> șterge aplicația, dar <b>păstrează datele ei</b> (în directorul home al utilizatorului, de regulă <code>~/.var/app/ID</code>; locație din documentația generală Flatpak, de confirmat). Pentru a le șterge și pe acestea: <code>--delete-data</code>.
            Runtime-urile rămase fără nicio aplicație se elimină cu <code>flatpak uninstall --unused</code>.
          </p>
          <h4>Izolare</h4>
          <p>
            Aplicația rulează într-un sandbox și nu vede tot sistemul. Permisiunile (acces la fișiere, rețea) sunt declarate în metadata aplicației. Pentru obiectivul tău e important că aplicațiile Flatpak se gestionează <i>separat</i> de pachetele RPM: nu apar în <code>rpm -qa</code> și nu sunt actualizate de <code>dnf</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>L2.4:</b> fără remote nu se poate instala nimic.</li>
            <li><b>dnf/rpm</b> (L2.1–L2.3): sisteme paralele; aplicațiile Flatpak se actualizează cu <code>flatpak update</code>, nu cu <code>dnf upgrade</code>.</li>
            <li><b>Permisiuni</b> (L1.8): <code>--system</code> cere privilegii; <code>--user</code> nu.</li>
            <li><b>Stocare</b> (C5/C6): aplicațiile și runtime-urile ocupă spațiu (<code>/var/lib/flatpak</code> sau în home).</li>
            <li><b>Mediu grafic:</b> multe aplicații sunt grafice; fără sesiune grafică, <code>flatpak run</code> nu poate afișa o fereastră (instalarea funcționează totuși).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Ai nevoie de o aplicație disponibilă doar ca Flatpak sau a cărei versiune RPM este veche.</li>
            <li>Un utilizator trebuie să-și instaleze propriile aplicații fără drepturi de administrator (<code>--user</code>).</li>
            <li>Elimini o aplicație și runtime-urile pe care nu le mai folosește nimeni (spațiu).</li>
            <li>La examen: „instalează aplicația X din remote-ul Y”, „elimină aplicația Z”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem, după ce ai configurat un remote (L2.4). Exemplele folosesc remote-ul fictiv <code>exemplu</code> și aplicația fictivă <code>org.exemplu.Calculator</code>; înlocuiește-le cu valori reale din <code>flatpak remote-ls</code>. Output-urile sunt <b>Ilustrative</b>. Nu am rulat comenzile pe RHEL 10.
        </Callout>

        <h4>1. Caută</h4>
        <CodeBlock title="comenzi" code={`flatpak search calculator\nflatpak remote-ls exemplu --app\nflatpak remote-ls exemplu --app | grep -i calc`} explain={[
          ['flatpak search TEXT', 'caută în remote-urile configurate după nume/descriere; afișează și Application ID.'],
          ['remote-ls NUME --app', 'toate aplicațiile unui remote anume.'],
          ['| grep -i calc', 'filtrezi lista (L1.6); -i ignoră majusculele.'],
        ]} />

        <h4>2. Instalează</h4>
        <CodeBlock title="comenzi" code={`sudo flatpak install exemplu org.exemplu.Calculator\nsudo flatpak install -y exemplu org.exemplu.Calculator\nflatpak install --user exemplu org.exemplu.Calculator\nflatpak install --system --noninteractive exemplu org.exemplu.Calculator`} explain={[
          ['flatpak install REMOTE ID', 'REMOTE = numele local din flatpak remotes; ID = Application ID. Poți omite REMOTE: flatpak îl caută sau te întreabă.'],
          ['sudo', 'instalare de sistem (implicită) ca root. Pe unele configurații, instalarea de sistem poate fi permisă și fără sudo prin politici; nu presupune asta.'],
          ['-y', '(--assumeyes) confirmă automat.'],
          ['--user', 'instalare doar pentru contul tău, fără privilegii. Remote-ul trebuie să existe în instalarea de utilizator (L2.4).'],
          ['--system', 'explicit instalarea de sistem (cea implicită).'],
          ['--noninteractive', 'fără prompturi interactive; potrivit pentru scripturi.'],
        ]} />
        <Callout kind="warn" title="Remote-ul trebuie să fie în aceeași instalare">
          Dacă ai adăugat remote-ul cu <code>--user</code>, instalează cu <code>--user</code>. Un <code>sudo flatpak install</code> caută în remote-urile de sistem și nu îl va găsi.
        </Callout>

        <h4>3. Vezi ce este instalat și pornește</h4>
        <CodeBlock title="comenzi" code={`flatpak list\nflatpak list --app\nflatpak list --runtime\nflatpak info org.exemplu.Calculator\nflatpak info --show-origin org.exemplu.Calculator\nflatpak run org.exemplu.Calculator`} explain={[
          ['flatpak list', 'aplicațiile ȘI runtime-urile instalate (din ambele instalări).'],
          ['--app / --runtime', 'doar aplicații, respectiv doar runtime-uri.'],
          ['flatpak info ID', 'detalii despre o aplicație instalată (versiune, ramură, instalare).'],
          ['--show-origin (-o)', 'afișează remote-ul de pe care a fost instalată (opțiune existentă la flatpak info, conform referinței Flatpak).'],
          ['flatpak run ID', 'pornește aplicația; necesită, de regulă, o sesiune grafică.'],
        ]} />

        <h4>4. Actualizează</h4>
        <CodeBlock title="comenzi" code={`flatpak update\nsudo flatpak update -y`} explain={[
          ['flatpak update', 'actualizează aplicațiile și runtime-urile instalate; cere confirmare.'],
          ['-y', 'confirmă automat.'],
        ]} />

        <h4>5. Șterge</h4>
        <CodeBlock title="comenzi" code={`sudo flatpak uninstall org.exemplu.Calculator\nflatpak uninstall --user org.exemplu.Calculator\nsudo flatpak uninstall --unused\nflatpak uninstall --delete-data org.exemplu.Calculator\nflatpak list --app`} explain={[
          ['flatpak uninstall ID', 'șterge aplicația din instalarea indicată (sistem cu sudo, sau --user).'],
          ['--unused', 'șterge runtime-urile/extensiile pe care nu le mai folosește nicio aplicație.'],
          ['--delete-data', 'șterge și datele aplicației de utilizator (setări, cache). Fără ea, datele rămân.'],
          ['flatpak list --app', 'confirmare: aplicația nu mai apare.'],
        ]} />
        <p className="small">Dacă aplicația este instalată în ambele instalări, <code>uninstall</code> poate cere să alegi; folosește <code>--user</code> sau <code>--system</code> ca să fii explicit.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="flatpak install (rezumat)" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo flatpak install exemplu org.exemplu.Calculator\nLooking for matches…\nRequired runtime for org.exemplu.Calculator/x86_64/stable (runtime/org.exemplu.Platform/x86_64/1.0) found in remote exemplu\nDo you want to install it? [Y/n]: y\n\n        ID                         Branch   Op   Remote    Download\n 1. [✓] org.exemplu.Platform       1.0      i    exemplu   120 MB / 120 MB\n 2. [✓] org.exemplu.Calculator     stable   i    exemplu   5 MB / 5 MB\n\nInstallation complete.`} />
        <p className="small">
          Prima parte: <code>flatpak</code> a găsit că aplicația cere un runtime și îl propune. Tabelul: <code>ID</code> = identificator, <code>Branch</code> = ramură/versiune, <code>Op</code> = operația (<code>i</code> = install), <code>Remote</code> = sursa, <code>Download</code> = mărimea. <code>Installation complete.</code> = terminat.
          Textul, ID-urile și mărimile sunt construite pentru explicație; formatul real diferă între versiuni.
        </p>
        <CodeBlock title="flatpak list" kind="session" label="illustrative" code={`[student@server1 ~]$ flatpak list\nName        Application ID            Version  Branch  Installation\nCalculator  org.exemplu.Calculator    1.2      stable  system\nPlatform    org.exemplu.Platform      1.0      1.0     system`} />
        <p className="small">Coloana <code>Installation</code> arată dacă elementul este în instalarea de sistem sau de utilizator. Runtime-ul <code>Platform</code> apare lângă aplicație: a fost adus automat. Cu <code>--app</code> ar rămâne doar prima linie.</p>
        <CodeBlock title="flatpak uninstall --unused" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo flatpak uninstall --unused\n        ID                     Branch   Op\n 1. [-] org.exemplu.Platform 1.0      r\n\nUninstall complete.`} />
        <p className="small"><code>Op = r</code> = remove. După ștergerea aplicației, runtime-ul a rămas fără utilizator și este eliminat acum. Format ilustrativ.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Instalat:</b> <code>flatpak list --app</code> afișează aplicația, în instalarea așteptată.</li>
            <li><b>Sursa:</b> <code>flatpak info --show-origin ID</code> (remote-ul).</li>
            <li><b>Pornește:</b> <code>flatpak run ID</code> (cu sesiune grafică). Fără ea, dovada practică este <code>flatpak list</code> și <code>flatpak info</code>.</li>
            <li><b>Șters:</b> <code>flatpak list --app</code> nu mai conține ID-ul; <code>flatpak info ID</code> raportează că nu este instalat.</li>
            <li><b>Curățenie:</b> <code>flatpak list --runtime</code> după <code>uninstall --unused</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Aplicațiile și runtime-urile instalate persistă după reboot, în instalarea în care au fost puse. Nu sunt necesari pași suplimentari. Dacă sarcina cere ca aplicația să fie disponibilă pentru toți utilizatorii, folosește instalarea de sistem; cea de utilizator rămâne a unui singur cont.
            Confirmare manuală după reboot: <code>flatpak list --app</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<>remote-ul nu este găsit la install</>, 'remote definit în altă instalare (user/system)', <><code>flatpak remotes</code> (cu Options)</>, <>folosește același <code>--user</code>/<code>--system</code> ca la <code>remote-add</code></>],
          ['aplicația nu este găsită', 'ID greșit sau remote fără ea', <><code>flatpak remote-ls NUME --app | grep -i text</code></>, 'folosește Application ID exact'],
          ['cere autentificare/Permission denied', 'instalare de sistem fără privilegii', '—', <>folosește <code>sudo</code> sau <code>--user</code></>],
          [<><code>flatpak run</code> nu afișează nimic</>, 'lipsește sesiunea grafică', <code>echo $DISPLAY</code>, 'rulează într-o sesiune grafică; verifică prin flatpak list'],
          ['spațiul scade după ștergere', 'runtime-uri rămase', <code>flatpak list --runtime</code>, <><code>flatpak uninstall --unused</code></>],
          ['aplicația apare, dar nu o găsești la ștergere', 'instalată în cealaltă instalare', <><code>flatpak list</code> (coloana Installation)</>, <>adaugă <code>--user</code> sau <code>--system</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești numele prietenos în loc de Application ID.</>,
          <>Instalezi cu <code>sudo</code> dintr-un remote definit cu <code>--user</code> (sau invers).</>,
          <>Crezi că <code>dnf remove</code> șterge aplicații Flatpak: sunt sisteme separate.</>,
          <>Uiți <code>uninstall --unused</code> când ți se cere să eliberezi spațiul.</>,
          <>Crezi că <code>uninstall</code> șterge și datele utilizatorului; pentru asta există <code>--delete-data</code>.</>,
          <>Nu verifici cu <code>flatpak list</code> după sarcină.</>,
          <>Confunzi <code>flatpak search</code> (catalog) cu <code>flatpak list</code> (instalat).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ce rămâne după uninstall și de ce runtime-urile se partajează">
        <p>
          Un runtime (de exemplu un set de biblioteci grafice) este mare. Dacă fiecare aplicație și-ar aduce propria copie, spațiul ar crește repede. Flatpak păstrează un singur runtime pe ramură și îl folosesc toate aplicațiile care îl cer. De aceea ștergerea unei aplicații nu șterge runtime-ul: nu știe dacă altă aplicație îl mai folosește imediat; <code>--unused</code> face verificarea.
        </p>
        <p>
          Datele utilizatorului ale unei aplicații sunt păstrate separat de aplicație (pentru ca, la reinstalare, să-ți regăsești setările). Locația uzuală este în <code>~/.var/app/</code>; confirmă pe sistemul tău înainte de a o șterge manual.
        </p>
        <p>
          Actualizările Flatpak sunt independente de cele RPM: o actualizare completă „a sistemului” înseamnă <code>dnf upgrade</code> <i>și</i> <code>flatpak update</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const L2_5: TopicModule = {
  id: 'L2.5',
  subtitle: 'flatpak search/install/list/run/uninstall, runtime-uri, --user vs --system',
  studyTime: '≈55 min studiu + laborator',
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
  labs: [LAB_L2_5],
  sources: [
    { kind: 'man', ref: 'flatpak-install(1), flatpak-uninstall(1), flatpak-list(1), flatpak-run(1), flatpak-update(1), flatpak-search(1), flatpak-info(1)' },
    { kind: 'upstream', ref: 'Flatpak command reference — https://docs.flatpak.org/en/latest/flatpak-command-reference.html (accesat 2026-11-16; citit doar secțiunea flatpak info)' },
    { kind: 'doc', ref: 'RHEL 10 — Install applications by using Flatpak; Search for Flatpak applications (docs.redhat.com) — necitit (HTTP 403); de confirmat la review' },
  ],
};
