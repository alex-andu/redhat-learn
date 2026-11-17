import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L2_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Instalezi cu <code>sudo dnf install NUME</code>, ștergi cu <code>sudo dnf remove NUME</code>. Cu <code>dnf search</code>, <code>dnf info</code> și <code>dnf provides</code> găsești pachetul potrivit; cu <code>rpm -q...</code> afli ce este deja instalat și ce fișiere a pus fiecare pachet.
            Un fișier <code>.rpm</code> primit local se instalează tot cu <code>dnf install ./fișier.rpm</code>, ca <code>dnf</code> să rezolve dependențele.
          </p>
          <p>Obiectivul oficial: <i>„Install and remove RPM software packages”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Instalarea unui pachet înseamnă mai mult decât copierea fișierelor: pachetul declară de ce alte pachete are nevoie, poate rula scripturi (de exemplu creează un utilizator de serviciu) și este înregistrat în baza de date RPM,
            ca să știi mai târziu ce fișier aparține cărui pachet și să poți șterge curat. Ștergerea înseamnă eliminarea fișierelor <i>pachetului</i>, dar, de obicei, păstrarea fișierelor de configurare modificate de tine (le redenumește cu <code>.rpmsave</code>).
          </p>
          <p>
            Există două nivele. <code>rpm</code> este unealta de jos: lucrează cu un fișier RPM, dar <b>nu</b> caută și nu aduce dependențe. <G id="dnf">dnf</G> este unealta de sus: caută în repository-uri (L2.1), calculează dependențele, descarcă și apelează apoi <G id="rpm">rpm</G>.
            Pentru instalare și ștergere folosești practic mereu <code>dnf</code>; <code>rpm</code> îl folosești pentru <b>interogări</b>.
          </p>
          <Analogy><code>rpm</code> este mecanicul care montează o piesă pe care i-o dai în mână, dar dacă îi lipsește o altă piesă, doar îți spune că lipsește. <code>dnf</code> este responsabilul de service: citește catalogul, comandă toate piesele necesare, le montează în ordine și ține fișa mașinii.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>O tranzacție dnf</h4>
          <ol>
            <li><b>Rezolvare:</b> din numele cerut, <code>dnf</code> construiește lista completă: pachetul + dependențele lui lipsă. Îți arată lista și mărimea și cere confirmare (<code>Is this ok [y/N]</code>). <code>-y</code> răspunde „da” automat.</li>
            <li><b>Descărcare</b> în cache (<code>/var/cache/dnf/</code>) și <b>verificare</b> semnătură GPG (L2.1).</li>
            <li><b>Tranzacție RPM:</b> fișierele sunt scrise pe disc, scripturile pachetului (<code>%pre</code>, <code>%post</code>) rulează, baza RPM este actualizată.</li>
            <li><b>Istoric:</b> tranzacția primește un număr în <code>dnf history</code>; poți vedea ce a făcut și, în anumite cazuri, o poți anula.</li>
          </ol>
          <h4>Dependențe la ștergere</h4>
          <p>
            <code>dnf remove X</code> șterge și toate pachetele care <b>depind</b> de X. Citește mereu lista: dacă apar pachete critice (de exemplu <code>sudo</code>, <code>kernel</code>, <code>systemd</code>), răspunde <code>N</code>.
            În plus, dacă setarea <code>clean_requirements_on_remove</code> este activă (implicit, conform referinței DNF), sunt șterse și dependențele care au fost aduse doar pentru X și nu mai sunt necesare altcuiva.
            <code>dnf autoremove</code> face doar această curățare a pachetelor-dependență devenite orfane.
          </p>
          <h4>Ce înseamnă „instalat explicit” vs „dependență”</h4>
          <p>
            <code>dnf</code> marchează pachetele cerute de tine ca <i>user installed</i>, iar pe celelalte ca instalate ca dependențe. Marcajul decide ce poate fi curățat de <code>autoremove</code>.
          </p>
          <h4>Fișiere de configurare la ștergere</h4>
          <p>
            Fișierele de configurare marcate în pachet ca <code>%config(noreplace)</code> și modificate de tine nu sunt șterse silențios: la ștergere sau actualizare pot apărea ca <code>fișier.rpmsave</code> sau <code>fișier.rpmnew</code>. Nu presupune că ștergerea unui pachet curăță complet <code>/etc</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Repository-uri</b> (L2.1): fără o sursă activă, <code>dnf install</code> răspunde „No match for argument”.</li>
            <li><b>Servicii</b> (C4): un pachet instalat <i>nu pornește</i> automat serviciul; îl pornești cu <code>systemctl enable --now</code>. Fișierele de unitate vin cu pachetul.</li>
            <li><b>Utilizatori</b> (C9): scripturile unor pachete creează utilizatori/grupuri de sistem.</li>
            <li><b>Securitate</b> (C10): fișierele instalate primesc contexte SELinux din politica sistemului; semnăturile GPG validează originea.</li>
            <li><b>Spațiu pe disc</b> (C5/C6): descărcările și instalarea au nevoie de spațiu în <code>/var</code> și <code>/usr</code>.</li>
            <li><b>Permisiuni</b> (L1.8, L1.10): instalarea cere root (<code>sudo</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Ai nevoie de o unealtă lipsă (<code>tree</code>, <code>vim-enhanced</code>, <code>httpd</code>): cauți, verifici, instalezi.</li>
            <li>Primești o comandă și ai „command not found”: <code>dnf provides */nume</code> îți spune ce pachet o conține.</li>
            <li>Vrei să știi ce pachet deține un fișier de configurare: <code>rpm -qf /etc/fișier</code>.</li>
            <li>Un fișier a fost modificat accidental: <code>rpm -V pachet</code> arată diferențele față de pachet.</li>
            <li>Elimini software pe care nu îl mai folosești (reducerea suprafeței de atac).</li>
            <li>La examen: „instalează pachetele X și Y”, „elimină pachetul Z”, „un fișier RPM e în /root, instalează-l”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b> (nume de pachete, versiuni, mărimi construite pentru explicație). Nu am rulat comenzile pe RHEL 10 în redactare.
        </Callout>

        <h4>1. Caută și inspectează înainte să instalezi</h4>
        <CodeBlock title="comenzi" code={`dnf search tree\ndnf search --all "directory listing"\ndnf info tree\ndnf list available 'tre*'\ndnf provides '*/bin/tree'\ndnf provides /usr/bin/tree`} explain={[
          ['dnf search tree', 'caută „tree” (fără diferență majuscule/minuscule) în numele și rezumatele pachetelor. Mai multe cuvinte = toate trebuie să apară.'],
          ['--all', 'caută și în descrieri și URL-uri; potrivirea devine „oricare”, nu „toate”.'],
          ['dnf info NUME', 'detalii: versiune, mărime, repository, descriere, dacă este instalat sau disponibil.'],
          ["dnf list available 'tre*'", "listează pachetele disponibile al căror nume se potrivește cu tiparul; ghilimele ca shell-ul să nu expandeze *. Variante: --installed, --available."],
          ["dnf provides '*/bin/tree'", 'află ce pachet conține un fișier sau o comandă; */ este un joker pentru director. Util pentru „command not found”.'],
        ]} />

        <h4>2. Instalează</h4>
        <CodeBlock title="comenzi" code={`sudo dnf install tree\nsudo dnf install -y tree nano\nsudo dnf install ./pachet-local-1.0-1.noarch.rpm\nsudo dnf install https://repo.exemplu.local/pachet-1.0-1.noarch.rpm\nsudo dnf group list\nsudo dnf group install "Development Tools"\nsudo dnf reinstall tree`} explain={[
          ['sudo dnf install NUME', 'instalează pachetul și dependențele lipsă; afișează lista și cere confirmare.'],
          ['-y', '(--assumeyes) răspunde automat „yes” la întrebări. La examen economisește timp, dar citește mai întâi lista.'],
          ['tree nano', 'mai multe pachete într-o singură comandă.'],
          ['./pachet.rpm', 'instalează un fișier RPM local. ./ spune că e un fișier din directorul curent, nu un nume de pachet din repository. Dependențele se aduc din repository-urile active.'],
          ['https://…rpm', 'dnf descarcă și instalează un RPM direct din URL.'],
          ['dnf group list / group install', 'grup = set de pachete cu un scop („Development Tools”). Numele grupurilor se văd cu group list; numele cu spații se pun între ghilimele.'],
          ['dnf reinstall', 'reinstalează aceeași versiune (readuce fișierele șterse accidental).'],
        ]} />
        <Callout kind="warn" title="rpm -i vs dnf install">
          <code>rpm -ivh fișier.rpm</code> (i = install, v = verbose, h = hash/progres) funcționează, dar nu aduce dependențe lipsă; dacă lipsesc, instalarea eșuează cu o listă de „Failed dependencies”. Folosește <code>dnf install ./fișier.rpm</code>.
        </Callout>

        <h4>3. Interoghează baza RPM (ce este instalat)</h4>
        <CodeBlock title="comenzi" code={`rpm -q tree\nrpm -qa | grep -i tree\nrpm -qi tree\nrpm -ql tree\nrpm -qc openssh-server\nrpm -qf /usr/bin/tree\nrpm -qpi pachet-local-1.0-1.noarch.rpm\nrpm -qpl pachet-local-1.0-1.noarch.rpm\nrpm -V tree`} explain={[
          ['-q', '(query) întreabă baza de date a pachetelor INSTALATE. Singur: afișează numele complet dacă e instalat, altfel „package tree is not installed”.'],
          ['-qa', '(--all) listează toate pachetele instalate; se combină cu grep (L1.6).'],
          ['-qi', '(--info) detalii: versiune, dată build, mărime, rezumat, licență, vendor.'],
          ['-ql', '(--list) toate fișierele puse de pachet.'],
          ['-qc', '(--configfiles) doar fișierele de configurare ale pachetului.'],
          ['-qf FIȘIER', '(--file) ce pachet deține acel fișier.'],
          ['-qp', '(--package) aplică interogarea unui FIȘIER .rpm, înainte de instalare. -qpi = info, -qpl = lista fișierelor.'],
          ['-V', '(--verify) compară fișierele instalate cu cele din pachet (mărime, permisiuni, sumă de control...). Fără output = totul coincide.'],
        ]} />

        <h4>4. Șterge</h4>
        <CodeBlock title="comenzi" code={`sudo dnf remove tree\nsudo dnf remove -y nano\nsudo dnf autoremove\nrpm -q tree\nsudo dnf history list\nsudo dnf history info 12\nsudo dnf history undo 12`} explain={[
          ['dnf remove', 'șterge pachetul și pachetele care depind de el; afișează lista înainte de confirmare.'],
          ['dnf autoremove', 'șterge dependențele care nu mai sunt necesare nimănui.'],
          ['rpm -q tree', 'confirmă: „package tree is not installed”.'],
          ['dnf history list', 'tranzacțiile din trecut: ID, comandă, dată, acțiuni.'],
          ['history info ID', 'detaliile unei tranzacții (ce pachete au fost afectate).'],
          ['history undo ID', 'încearcă să inverseze acea tranzacție. Poate eșua dacă situația s-a schimbat; nu o folosi ca „plasă de siguranță” generală.'],
        ]} />
        <p className="small">Exemplele cu <code>history info 12</code>/<code>undo 12</code> folosesc un ID construit; ID-ul real îl iei din <code>history list</code>.</p>

        <h4>5. Verifică semnătura unui RPM local</h4>
        <CodeBlock title="comandă" code={`rpm -K pachet-local-1.0-1.noarch.rpm`} explain={[
          ['-K', '(--checksig) verifică semnătura și sumele de control ale fișierului; necesită ca cheia să fie importată (L2.1). Dacă fișierul nu e semnat sau cheia lipsește, rezultatul arată asta, iar dnf poate refuza instalarea.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="dnf install tree (rezumat)" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo dnf install tree\nDependencies resolved.\n=====================================================================\n Package   Architecture   Version          Repository      Size\n=====================================================================\nInstalling:\n tree      x86_64         2.1.0-1.el10     local-appstream  58 k\n\nTransaction Summary\n=====================================================================\nInstall  1 Package\n\nIs this ok [y/N]: y\n...\nComplete!`} />
        <p className="small">
          <code>Dependencies resolved</code>: dnf a calculat ce trebuie instalat. În tabel: <code>Package</code> = nume, <code>Architecture</code> = platformă, <code>Version</code> = versiune-release, <code>Repository</code> = sursa din care vine (de aceea știi dacă din ISO sau CDN), <code>Size</code> = mărimea.
          <code>Installing:</code> = ce ai cerut; o secțiune <code>Installing dependencies:</code> ar lista ce se aduce suplimentar. <code>Is this ok [y/N]</code>: litera mare e răspunsul implicit (N); Enter nu confirmă. <code>Complete!</code> = tranzacție terminată. Numele, versiunile și mărimile sunt exemple.
        </p>
        <CodeBlock title="rpm -q și -qf" kind="session" label="illustrative" code={`[student@server1 ~]$ rpm -q tree\ntree-2.1.0-1.el10.x86_64\n[student@server1 ~]$ rpm -q nano-inexistent\npackage nano-inexistent is not installed\n[student@server1 ~]$ rpm -qf /usr/bin/tree\ntree-2.1.0-1.el10.x86_64`} />
        <p className="small">
          Primul rezultat: nume-versiune-release.arhitectură (L2.1). Al doilea mesaj este răspunsul standard pentru pachet neinstalat. <code>rpm -qf</code> răspunde la „cui aparține fișierul?”: același pachet. Aceasta este baza lecției: <code>rpm -q</code> citește doar baza locală și nu are nevoie de rețea.
        </p>
        <CodeBlock title="rpm -V cu diferențe" kind="session" label="illustrative" code={`[student@server1 ~]$ rpm -V openssh-server\nS.5....T.  c /etc/ssh/sshd_config`} />
        <p className="small">
          Fiecare literă/punct de la început reprezintă o verificare: <code>S</code> = mărime diferită, <code>5</code> = suma de control (MD5/digest) diferită, <code>T</code> = data modificării diferită; un punct înseamnă „la fel”. <code>c</code> marchează un fișier de configurare. Pentru fișiere de configurare modificate intenționat, asta este normal. Lista completă a codurilor: <code>man rpm</code>, secțiunea VERIFY OPTIONS.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Instalat:</b> <code>rpm -q NUME</code> afișează numele complet; <code>dnf list --installed NUME</code> la fel.</li>
            <li><b>Funcționează:</b> <code>which NUME</code> sau <code>NUME --version</code>; <code>rpm -ql NUME | head</code> arată ce a pus.</li>
            <li><b>Șters:</b> <code>rpm -q NUME</code> răspunde „is not installed”; <code>dnf list --installed | grep NUME</code> nu returnează nimic.</li>
            <li><b>Ce s-a întâmplat:</b> <code>sudo dnf history list</code> și <code>history info ID</code>.</li>
            <li><b>Integritate:</b> <code>rpm -V NUME</code>; nicio linie = fișierele coincid cu pachetul.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Pachetele instalate și baza RPM sunt pe disc și persistă după reboot. Nu trebuie să faci nimic suplimentar pentru software. Atenție la două lucruri: (1) un <b>serviciu</b> instalat nu este pornit/activat automat; dacă sarcina cere ca el să ruleze după reboot, trebuie <code>systemctl enable</code> (C4);
            (2) dacă instalarea a depins de un ISO montat temporar, după reboot pachetul rămâne instalat, dar o nouă instalare nu mai găsește sursa (L2.1). Confirmare manuală după reboot: <code>rpm -q NUME</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>No match for argument: X</code>, 'nume greșit sau repository lipsă/dezactivat', <><code>dnf search X</code>; <code>dnf repolist --all</code></>, <>corectează numele sau activează repository-ul (L2.1); <code>dnf provides */X</code></>],
          [<><code>command not found</code> pentru o unealtă</>, 'pachetul nu este instalat', <code>dnf provides '*/bin/X'</code>, <>instalează pachetul indicat</>],
          [<>RPM local: <code>nothing provides …</code> / „Failed dependencies”</>, 'dependențele nu sunt în niciun repository activ', <code>rpm -qpR fișier.rpm</code>, <>activează repository-urile potrivite sau instalează dependențele</>],
          [<>GPG check FAILED / <code>public key not installed</code></>, 'cheia pachetului nu este importată', <code>rpm -K fișier.rpm</code>, <>importă cheia corectă (<code>rpm --import</code>); nu folosi <code>--nogpgcheck</code> din comoditate</>],
          [<>Ștergerea cere eliminarea unor pachete critice</>, 'dependențe inverse (ex. sudo)', 'citește lista dnf', <>răspunde <code>N</code>; folosește o altă abordare</>],
          [<>Fișierul .rpm nu e găsit de dnf</>, <>ai scris numele fără <code>./</code> sau calea greșită</>, <code>ls -l fișier.rpm</code>, <>folosește calea (<code>./</code> sau absolută)</>],
          [<>Eroare de spațiu/lock</>, 'disc plin sau alt proces dnf rulează', <><code>df -h</code>; <code>ps aux | grep dnf</code></>, 'eliberează spațiu / așteaptă procesul'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți <code>sudo</code>: instalarea cere root.</>,
          <>Instalezi un <code>.rpm</code> local cu <code>rpm -i</code> și te blochezi pe dependențe: folosește <code>dnf install ./fișier.rpm</code>.</>,
          <>Scrii numele fișierului RPM fără <code>./</code>: dnf îl caută ca nume de pachet în repository.</>,
          <>Răspunzi <code>y</code> la o ștergere fără să citești lista; un <code>dnf remove</code> poate elimina multe pachete.</>,
          <>Crezi că <code>dnf install httpd</code> pornește serviciul: nu; mai ai de făcut <code>systemctl enable --now</code> (C4).</>,
          <>Folosești <code>--nogpgcheck</code> ca scurtătură: ocolești protecția.</>,
          <>Confunzi <code>rpm -q</code> (instalat, local) cu <code>dnf search/info</code> (din repository).</>,
          <>La examen, uiți să verifici după fiecare sarcină cu <code>rpm -q</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: scripturile pachetelor, %config și ordinea tranzacției">
        <p>
          Un RPM conține, pe lângă fișiere, scripturi ce rulează la momente definite: înainte de instalare (<code>%pre</code>), după (<code>%post</code>), înainte de ștergere (<code>%preun</code>) și după (<code>%postun</code>). Le poți vedea cu <code>rpm -q --scripts NUME</code>.
          Așa un pachet de serviciu își creează utilizatorul sau își reîncarcă configurarea. De aceea instalarea nu este „doar copiere de fișiere”, iar ștergerea poate lăsa urme (utilizatori, date în <code>/var</code>).
        </p>
        <p>
          Fișierele marcate ca <code>%config</code> sunt tratate special: dacă le-ai modificat, o actualizare păstrează versiunea ta și salvează varianta nouă ca <code>.rpmnew</code>, sau o salvează pe a ta ca <code>.rpmsave</code> la ștergere/înlocuire. Comportamentul exact depinde de marcajul din pachet (<code>noreplace</code> sau nu) — verifică în <code>man rpm</code> / documentația RPM.
        </p>
        <p>
          <code>dnf history undo</code> se bazează pe faptul că versiunile exacte ale pachetelor implicate mai sunt disponibile în repository-uri; de aceea poate eșua după ce depozitele s-au schimbat.
        </p>
      </DeepDive>
    </>
  );
}

export const L2_2: TopicModule = {
  id: 'L2.2',
  subtitle: 'dnf install/remove/search/provides, rpm -q, fișiere .rpm locale, istoric de tranzacții',
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
  labs: [LAB_L2_2],
  sources: [
    { kind: 'upstream', ref: 'DNF Command Reference — https://dnf.readthedocs.io/en/latest/command_ref.html (accesat 2026-11-16)' },
    { kind: 'man', ref: 'rpm(8), dnf(8), dnf.conf(5)' },
    { kind: 'doc', ref: 'RHEL 10 — Install RHEL content / Remove unnecessary RHEL content (docs.redhat.com) — necitit (HTTP 403); de confirmat la review' },
  ],
};
