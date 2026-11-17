import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L2_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="flatpak">Flatpak</G> este un alt mod de a distribui aplicații, separat de RPM. Aplicațiile Flatpak vin dintr-un <b>remote</b> (depozit Flatpak). Înainte să instalezi ceva, trebuie să adaugi remote-ul:
            <code>flatpak remote-add --if-not-exists NUME URL</code>. Verifici cu <code>flatpak remotes</code>. Alegi dacă remote-ul este pentru tot sistemul (<code>--system</code>, implicit) sau doar pentru utilizatorul tău (<code>--user</code>).
          </p>
          <p>Obiectivul oficial: <i>„Configure access to Flatpak repositories”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Pachetele RPM sunt legate de versiunea distribuției: o aplicație RPM folosește bibliotecile sistemului. O aplicație desktop modernă poate avea nevoie de biblioteci mai noi sau diferite. <G id="flatpak">Flatpak</G> rezolvă asta: aplicația vine cu (sau cere separat) propriile biblioteci, într-un pachet independent de distribuție,
            și rulează într-un mediu izolat (<i>sandbox</i>), cu acces limitat la restul sistemului.
          </p>
          <p>
            Ca la RPM, aplicațiile stau în depozite. Un depozit Flatpak se numește <b>remote</b>. Un remote are un nume local, ales de tine (de exemplu <code>rhel</code> sau <code>flathub</code>), și o adresă. Fără un remote configurat, <code>flatpak</code> nu are de unde căuta sau instala.
          </p>
          <Analogy>RPM este ca mobila cumpărată de la magazinul casei tale, croită să se potrivească cu apartamentul. Flatpak este ca un container sigilat cu tot ce are nevoie înăuntru: îl muți oriunde, funcționează la fel, dar este separat de restul casei. Remote-ul este depozitul de unde îți vin containerele.</Analogy>
          <p className="small">Pe RHEL, Flatpak este destinat în principal aplicațiilor desktop. Platforma noastră tratează doar ce cere obiectivul: configurarea accesului la remote-uri.</p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Remote, ref, runtime</h4>
          <ul>
            <li><b>Remote:</b> depozitul, cu nume local și URL.</li>
            <li><b>Ref:</b> identificatorul unei aplicații într-un remote, în format reverse-DNS (de exemplu <code>org.exemplu.Calculator</code> — fictiv), plus arhitectură și ramură.</li>
            <li><b>Runtime:</b> setul de biblioteci pe care îl cer aplicațiile; se instalează separat și poate fi folosit în comun de mai multe aplicații.</li>
          </ul>
          <h4>Sistem sau utilizator</h4>
          <p>
            Flatpak are două „instalări”: <b>system</b> (implicit; pentru toți utilizatorii, cere privilegii; datele sunt în <code>/var/lib/flatpak</code>) și <b>user</b> (doar pentru tine, fără privilegii; datele sunt în <code>~/.local/share/flatpak</code>).
            Remote-urile sunt asociate unei instalări: un remote adăugat cu <code>--user</code> nu este vizibil în instalarea de sistem și invers. Locațiile sunt din documentația generală Flatpak; confirmă-le pe sistemul tău.
          </p>
          <h4>Fișierul .flatpakrepo</h4>
          <p>
            Cel mai comod mod de a adăuga un remote este un URL către un fișier <code>.flatpakrepo</code>: un fișier text mic (format INI) care conține adresa depozitului, titlul și, de regulă, cheia de verificare. <code>flatpak remote-add</code> îl descarcă și configurează totul.
            Un remote poate fi adăugat și din adresa directă a depozitului, dar atunci verificarea cheilor trebuie tratată separat (nu folosi <code>--no-gpg-verify</code> din comoditate).
          </p>
          <h4>Remote-ul Red Hat</h4>
          <p>
            Red Hat oferă un remote Flatpak propriu pentru RHEL; ghidul RHEL 10 are pagini dedicate („Set up Flatpak”, „Enable the Red Hat Flatpak remote on an unsubscribed system”). Numele, URL-ul și pașii de autentificare ai acestui remote
            <b> nu au fost verificați în această lecție</b> (documentația nu a putut fi citită); citește pagina oficială a versiunii tale înainte să te bazezi pe un URL.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>RPM/dnf</b> (L2.1–L2.3): pachetul <code>flatpak</code> în sine se instalează cu <code>dnf</code>; aplicațiile Flatpak nu apar în <code>rpm -qa</code>.</li>
            <li><b>Rețea</b> (C8): remote-urile sunt de obicei accesate prin HTTPS.</li>
            <li><b>Permisiuni</b> (L1.8, L1.10): instalarea de sistem cere privilegii; cea de utilizator nu.</li>
            <li><b>Securitate</b>: aplicațiile sunt izolate; remote-urile verifică semnături ale depozitului.</li>
            <li><b>Stocare</b> (C5/C6): <code>/var/lib/flatpak</code> poate crește; un volum separat pentru <code>/var</code> contează.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Ai nevoie de o aplicație distribuită doar ca Flatpak.</li>
            <li>Vrei ca un utilizator să-și instaleze aplicații fără privilegii (<code>--user</code>).</li>
            <li>La examen: „configurează accesul la repository-ul Flatpak de la adresa X” ca pas preliminar pentru instalare (L2.5).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. URL-urile și numele din exemple sunt <b>fictive</b> (<code>repo.exemplu.local</code>), ca să nu presupun un remote real. Output-urile sunt <b>Ilustrative</b>. Nu am rulat comenzile pe RHEL 10.
        </Callout>

        <h4>1. Instalează Flatpak</h4>
        <CodeBlock title="comenzi" code={`rpm -q flatpak\nsudo dnf install flatpak\nflatpak --version`} explain={[
          ['rpm -q flatpak', 'verifici dacă pachetul este deja instalat.'],
          ['dnf install flatpak', 'instalează unealta (L2.2).'],
          ['flatpak --version', 'afișează versiunea; confirmă că unealta funcționează.'],
        ]} />

        <h4>2. Adaugă un remote</h4>
        <CodeBlock title="comenzi" code={`sudo flatpak remote-add --if-not-exists exemplu https://repo.exemplu.local/exemplu.flatpakrepo\nflatpak remote-add --user --if-not-exists exemplu-user https://repo.exemplu.local/exemplu.flatpakrepo`} explain={[
          ['flatpak remote-add', 'adaugă un remote.'],
          ['--if-not-exists', 'nu dă eroare dacă numele există deja; comanda poate fi repetată sigur.'],
          ['exemplu', 'NUMELE local ales de tine (fără spații). Îl vei folosi la install și la remote-ls.'],
          ['https://…/exemplu.flatpakrepo', 'LOCAȚIA: URL către un fișier .flatpakrepo (fictiv aici).'],
          ['sudo ... (fără --user)', 'instalare de SISTEM (implicit --system); modifică configurarea pentru toți utilizatorii și cere privilegii.'],
          ['--user', 'instalare de UTILIZATOR: remote-ul este valabil doar pentru contul tău, fără sudo.'],
        ]} />
        <Callout kind="warn" title="Cele două instalări sunt separate">
          Un remote adăugat cu <code>--user</code> nu apare în <code>flatpak remotes</code> la nivel de sistem și invers. Dacă „nu găsești remote-ul”, verifică dacă l-ai adăugat în instalarea în care îl cauți (<code>flatpak remotes --user</code> / <code>--system</code>).
        </Callout>

        <h4>3. Vezi și inspectează remote-urile</h4>
        <CodeBlock title="comenzi" code={`flatpak remotes\nflatpak remotes -d\nflatpak remotes --user\nflatpak remote-ls exemplu\nflatpak remote-ls exemplu --app`} explain={[
          ['flatpak remotes', 'listează remote-urile configurate (sistem și utilizator) cu opțiunile lor.'],
          ['-d', '(--show-details) adaugă titlul și URL-ul fiecărui remote.'],
          ['--user / --system', 'restrânge afișarea la o instalare.'],
          ['remote-ls NUME', 'listează aplicațiile și runtime-urile din remote.'],
          ['--app', 'doar aplicațiile (fără runtime-uri).'],
        ]} />

        <h4>4. Dezactivează, activează, șterge</h4>
        <CodeBlock title="comenzi" code={`sudo flatpak remote-modify --disable exemplu\nsudo flatpak remote-modify --enable exemplu\nsudo flatpak remote-delete exemplu`} explain={[
          ['remote-modify --disable NUME', 'remote-ul rămâne definit, dar nu mai este folosit.'],
          ['--enable', 'îl reactivează.'],
          ['remote-delete NUME', 'șterge definiția remote-ului. Dacă ai aplicații instalate din el, flatpak cere confirmare/oprește operația; citește mesajul.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="flatpak remotes" kind="session" label="illustrative" code={`[student@server1 ~]$ flatpak remotes\nName     Options\nexemplu  system`} />
        <p className="small">Coloana <code>Name</code> este numele local; <code>Options</code> arată instalarea în care este definit (aici <code>system</code>; pentru <code>--user</code> ar apărea <code>user</code>) și, dacă e cazul, <code>disabled</code>. Formatul exact poate varia după versiunea Flatpak.</p>
        <CodeBlock title="flatpak remotes -d" kind="session" label="illustrative" code={`[student@server1 ~]$ flatpak remotes -d\nName     Title            URL                           Options\nexemplu  Depozit exemplu  https://repo.exemplu.local    system`} />
        <p className="small">Cu <code>-d</code> apar titlul și URL-ul. Dacă URL-ul nu este cel așteptat, remote-ul a fost definit greșit și trebuie șters și adăugat din nou.</p>
        <CodeBlock title="remote-ls" kind="session" label="illustrative" code={`[student@server1 ~]$ flatpak remote-ls exemplu --app\nName          Application ID           Version  Branch\nCalculator    org.exemplu.Calculator   1.2      stable`} />
        <p className="small">Fiecare linie: nume prietenos, <b>Application ID</b> (identificatorul pe care îl folosești la instalare, L2.5), versiune și ramură. Datele sunt un exemplu construit.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>flatpak remotes -d</code>: remote-ul apare, cu URL-ul corect și în instalarea așteptată (system/user).</li>
            <li><code>flatpak remote-ls NUME --app | head</code>: lista nu este goală și nu dă erori (accesibilitate).</li>
            <li>Dacă remote-ul apare cu <code>disabled</code>, <code>sudo flatpak remote-modify --enable NUME</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Remote-urile sunt păstrate pe disc (în configurarea instalării de sistem sau de utilizator) și persistă după reboot. Nu e nevoie de pași suplimentari. Confirmare manuală după reboot: <code>flatpak remotes -d</code>.
            Un remote de <code>--user</code> aparține unui singur cont: dacă sarcina cere ca „toți utilizatorii” să-l vadă, folosește instalarea de sistem.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>flatpak: command not found</code>, 'pachetul nu este instalat', <code>rpm -q flatpak</code>, <><code>sudo dnf install flatpak</code></>],
          ['remote-ul nu apare în listă', 'adăugat în altă instalare (user vs system)', <><code>flatpak remotes --user</code> / <code>--system</code></>, 'adaugă-l în instalarea corectă'],
          ['eroare la remote-add: nume existent', 'există deja un remote cu acel nume', <code>flatpak remotes</code>, <>folosește <code>--if-not-exists</code> sau alt nume</>],
          ['eroare de rețea/TLS', 'URL greșit, DNS sau ceas greșit', <><code>curl -I URL</code>; <code>date</code></>, 'repară rețeaua (C8) / corectează URL-ul'],
          ['remote-ul este „disabled”', 'a fost dezactivat', <code>flatpak remotes -d</code>, <><code>remote-modify --enable</code></>],
          ['Permission denied / cere autentificare', 'operație de sistem fără privilegii', '—', <>folosește <code>sudo</code> sau <code>--user</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Adaugi remote-ul cu <code>--user</code>, dar sarcina cere acces pentru tot sistemul (sau invers).</>,
          <>Ai pus URL-ul directorului în loc de URL-ul fișierului <code>.flatpakrepo</code> (sau invers, în funcție de ce ți se oferă).</>,
          <>Folosești <code>--no-gpg-verify</code> ca să „treacă” o eroare de verificare: ocolești protecția.</>,
          <>Confunzi remote-urile Flatpak cu fișierele <code>.repo</code> din <code>/etc/yum.repos.d</code>: sunt două sisteme diferite.</>,
          <>Uiți <code>--if-not-exists</code> și primești o eroare la rularea repetată.</>,
          <>Nu verifici după: <code>flatpak remotes -d</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: OSTree, sandbox și de ce remote-ul are chei">
        <p>
          În spatele Flatpak stă OSTree, un sistem de stocare cu adresare după conținut (similar unui „git” pentru fișiere binare): aplicațiile și runtime-urile sunt păstrate ca obiecte care se pot partaja între versiuni, ceea ce economisește spațiu și face actualizările mici.
          De aceea în <code>/var/lib/flatpak</code> găsești un depozit local (<code>repo/</code>), nu simple directoare de aplicații. Detaliul este din documentația generală Flatpak/OSTree; nu face parte din ce se cere la examen.
        </p>
        <p>
          Un remote conține adesea o cheie GPG. Flatpak verifică semnătura metadata și a conținutului la descărcare. Fișierul <code>.flatpakrepo</code> include cheia, motiv pentru care e mai sigur decât adăugarea manuală a unui URL de depozit fără cheie.
        </p>
      </DeepDive>
    </>
  );
}

export const L2_4: TopicModule = {
  id: 'L2.4',
  subtitle: 'Remote-uri Flatpak: remote-add, remotes, remote-ls, --user vs --system',
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
  labs: [LAB_L2_4],
  sources: [
    { kind: 'man', ref: 'flatpak(1), flatpak-remote-add(1), flatpak-remotes(1), flatpak-remote-modify(1), flatpak-remote-delete(1), flatpak-remote-ls(1)' },
    { kind: 'upstream', ref: 'Flatpak command reference — https://docs.flatpak.org/en/latest/flatpak-command-reference.html (accesat 2026-11-16; citit doar parțial)' },
    { kind: 'doc', ref: 'RHEL 10 — Install applications by using Flatpak / Set up Flatpak / Enable the Red Hat Flatpak remote on an unsubscribed system (docs.redhat.com) — necitit (HTTP 403); de confirmat la review' },
  ],
};
