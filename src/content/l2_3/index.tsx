import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L2_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pachetele pot veni din trei locuri: <b>CDN-ul Red Hat</b> (cere un sistem <i>înregistrat</i>), un <b>repository remote</b> (un URL) sau <b>sistemul local</b> (un fișier <code>.rpm</code> sau un ISO montat).
            Instalezi cu <code>dnf install</code>; actualizezi cu <code>dnf check-update</code> (doar vezi) și <code>dnf upgrade</code> (aplici). Actualizarea kernelului cere reboot.
          </p>
          <p>Obiectivul oficial: <i>„Install and update software packages from Red Hat Content Delivery Network, a remote repository, or from the local file system”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un sistem nu rămâne identic în timp: se descoperă erori și vulnerabilități, iar furnizorul publică versiuni noi ale pachetelor. Actualizarea păstrează sistemul sigur și stabil. Pe RHEL, Red Hat publică aceste actualizări pe <G id="cdn">CDN</G>;
            ca să le primești, sistemul trebuie să dovedească, prin <b>înregistrare</b>, că are drept de acces (un abonament).
          </p>
          <p>
            Nu toate sistemele au acces la internet. De aceea există cele trei surse: CDN (cel mai comun), un repository remote (de exemplu un server intern care oglindește conținutul) și sistemul local (un RPM descărcat de altundeva, sau mediul de instalare).
            Obiectivul tău este să știi să aduci software și actualizări din oricare dintre ele.
          </p>
          <Analogy>înregistrarea este ca un card de membru al unei biblioteci. Fără card, cataloagele publice sunt vizibile, dar nu poți împrumuta nimic din fondul ei oficial. Un repository intern este biblioteca firmei, iar un RPM local este o carte primită direct pe care o pui singur pe raft.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Înregistrarea și CDN-ul</h4>
          <p>
            <code>subscription-manager register</code> trimite identitatea sistemului către Red Hat și primește un <b>certificat de identitate</b> și certificate de <b>entitlement</b> (drept de acces). <code>/etc/yum.repos.d/redhat.repo</code> este generat cu repository-urile la care ai drept; <code>dnf</code> le accesează folosind certificatele, nu o parolă.
            Detaliile exacte pentru RHEL 10 (inclusiv noile modalități de conectare, ca <code>rhc</code>) sunt de confirmat în documentația oficială.
          </p>
          <h4>Instalare vs actualizare</h4>
          <ul>
            <li><b>install:</b> aduce un pachet nou (sau îl actualizează dacă este deja instalat și există o versiune mai nouă, cu cerința explicită a numelui).</li>
            <li><b>upgrade:</b> aduce versiuni mai noi pentru pachetele deja instalate: toate (<code>dnf upgrade</code>) sau doar unele (<code>dnf upgrade NUME</code>). <code>update</code> este un alias învechit al lui <code>upgrade</code>.</li>
            <li><b>check-update:</b> calculează ce s-ar actualiza, fără modificări. Codul de ieșire este 100 dacă există actualizări, 0 dacă nu, 1 la eroare — util în scripturi (C3).</li>
          </ul>
          <h4>Kernelul: de ce rămâne cel vechi până la reboot</h4>
          <p>
            Pachetele „installonly” (kernelul fiind cel principal) nu sunt înlocuite, ci instalate <i>lângă</i> versiunea veche. Kernelul în execuție este în memorie și nu se schimbă; la următorul boot, încărcătorul de boot (GRUB) alege în mod implicit pe cel mai nou.
            Dacă noul kernel are probleme, poți alege versiunea veche la boot (C4). Numărul de versiuni păstrate este controlat de <code>installonly_limit</code> din <code>/etc/dnf/dnf.conf</code>.
          </p>
          <h4>Instalare locală și remote</h4>
          <p>
            <code>dnf install ./fișier.rpm</code> și <code>dnf install https://…/fișier.rpm</code> instalează un fișier concret; dependențele sunt aduse din repository-urile active. Un repository remote configurat în <code>.repo</code> (L2.1) oferă acces la toate pachetele lui, nu doar la unul.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>L2.1 / L2.2:</b> repository-uri și operațiile de instalare/ștergere.</li>
            <li><b>Rețea și DNS</b> (C8): CDN-ul și repository-urile remote cer rețea funcțională; proxy-ul se poate seta în <code>/etc/dnf/dnf.conf</code> (<code>proxy=</code>).</li>
            <li><b>Timp</b> (C7, chrony): certificatele sunt valide într-un interval; un ceas greșit face ca accesul la CDN să eșueze.</li>
            <li><b>Boot</b> (C4): kernelul nou intră în vigoare la reboot; <code>uname -r</code> arată kernelul în execuție.</li>
            <li><b>Servicii</b> (C4): după actualizarea unui pachet de serviciu, serviciul rulează încă vechiul cod până la restart.</li>
            <li><b>Stocare</b> (C5/C6): un ISO montat servește ca sursă locală.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Sistem nou: îl înregistrezi, ca să primești pachete oficiale.</li>
            <li>Mentenanță periodică: <code>check-update</code>, apoi <code>upgrade</code> în fereastră de mentenanță.</li>
            <li>Server izolat: un server intern sau ISO-ul servește pachetele.</li>
            <li>Un pachet doar ca fișier (primit de la un furnizor): instalare locală.</li>
            <li>La examen: „instalează pachetul X din repository-ul Y”, „actualizează doar pachetul Z”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem. Output-urile sunt <b>Ilustrative</b>. Nu introduce niciodată credențiale reale în exemple copiate din lecții; valorile de mai jos sunt fictive. Nu am rulat comenzile pe RHEL 10.
        </Callout>

        <h4>1. Înregistrare și stare</h4>
        <CodeBlock title="comenzi" code={`sudo subscription-manager register --username UTILIZATOR\nsudo subscription-manager register --org ORG --activationkey CHEIE\nsudo subscription-manager status\nsudo subscription-manager repos --list\nsudo subscription-manager unregister`} explain={[
          ['register --username', 'înregistrează sistemul cu contul Red Hat; parola este cerută interactiv (nu o scrie în comandă, ca să nu rămână în istoric).'],
          ['--org ... --activationkey ...', 'variantă fără parolă personală: o cheie de activare emisă de organizație. UTILIZATOR, ORG și CHEIE sunt valori de înlocuit.'],
          ['status', 'arată dacă sistemul este înregistrat și dacă are abonament valid.'],
          ['repos --list', 'repository-urile disponibile și starea lor.'],
          ['unregister', 'scoate sistemul din evidența Red Hat (pierde accesul la CDN).'],
        ]} />
        <p className="small">Pe RHEL 10 pot exista și alte moduri de conectare (<code>rhc connect</code>); verifică documentația oficială a versiunii tale. La examen, accesul la pachete este de regulă pregătit prin repository-uri puse la dispoziție; înregistrarea cu un cont personal nu este un pas pe care îl poți presupune.</p>

        <h4>2. Verifică și aplică actualizări</h4>
        <CodeBlock title="comenzi" code={`sudo dnf check-update\necho $?\nsudo dnf upgrade --assumeno\nsudo dnf upgrade\nsudo dnf upgrade tree\nsudo dnf makecache`} explain={[
          ['dnf check-update', 'listează pachetele pentru care există versiuni mai noi; nu modifică nimic.'],
          ['echo $?', 'codul de ieșire al comenzii anterioare: 100 = există actualizări, 0 = nu există, 1 = eroare.'],
          ['--assumeno', 'răspunde automat „no” la confirmare: vezi ce s-ar întâmpla fără să aplici.'],
          ['dnf upgrade', 'actualizează toate pachetele; afișează lista, cere confirmare.'],
          ['dnf upgrade tree', 'actualizează doar pachetul indicat (și dependențele necesare).'],
          ['dnf makecache', 'reîmprospătează metadata din repository-uri.'],
        ]} />
        <Callout kind="warn" title="update vs upgrade">
          În DNF modern, <code>update</code> este alias pentru <code>upgrade</code> (conform referinței DNF). Ambele funcționează, dar în text oficial vei vedea <code>upgrade</code>.
        </Callout>

        <h4>3. Instalare din repository remote și din sistem local</h4>
        <CodeBlock title="comenzi" code={`sudo dnf install --repo=repo-intern tree\nsudo dnf install https://repo.exemplu.local/pachete/utilitar-1.0-1.noarch.rpm\nsudo dnf install ./utilitar-1.0-1.noarch.rpm\nsudo dnf install --enablerepo=local-appstream tree`} explain={[
          ['--repo=ID', 'folosește doar repository-ul cu acest ID pentru comanda curentă.'],
          ['dnf install URL', 'dnf descarcă RPM-ul de la URL, îl verifică (dacă e semnat și cheia e importată) și îl instalează. URL-ul din exemplu este fictiv.'],
          ['./fișier.rpm', 'instalare dintr-un fișier local; calea (./ sau absolută) este obligatorie.'],
          ['--enablerepo=ID', 'activează temporar un repository dezactivat în fișier.'],
        ]} />

        <h4>4. Kernel și reboot</h4>
        <CodeBlock title="comenzi" code={`uname -r\nrpm -q kernel\nsudo dnf upgrade kernel\nsudo reboot\nuname -r`} explain={[
          ['uname -r', 'versiunea kernelului ÎN EXECUȚIE.'],
          ['rpm -q kernel', 'toate versiunile de kernel INSTALATE (pot fi mai multe).'],
          ['dnf upgrade kernel', 'instalează un kernel nou lângă cel vechi.'],
          ['reboot', 'repornește; la boot se încarcă, implicit, cel mai nou.'],
        ]} />

        <h4>5. Revenire la o versiune anterioară</h4>
        <CodeBlock title="comenzi" code={`sudo dnf downgrade tree\nsudo dnf history list | head\nsudo dnf history undo last`} explain={[
          ['dnf downgrade', 'instalează versiunea anterioară a unui pachet, dacă mai este disponibilă într-un repository.'],
          ['history undo last', 'încearcă să inverseze ultima tranzacție.'],
        ]} />

        <h4>6. Fișierul /etc/dnf/dnf.conf</h4>
        <CodeBlock title="/etc/dnf/dnf.conf" kind="config" code={`[main]\ngpgcheck=1\ninstallonly_limit=3\nclean_requirements_on_remove=True\nbest=True\nskip_if_unavailable=False`} explain={[
          ['[main]', 'secțiunea cu setările globale ale dnf.'],
          ['gpgcheck=1', 'implicit verifică semnăturile pachetelor.'],
          ['installonly_limit=3', 'câte versiuni de kernel (și alte pachete installonly) se păstrează.'],
          ['clean_requirements_on_remove=True', 'ștergerea unui pachet scoate și dependențele devenite inutile.'],
          ['best=True', 'cere cele mai noi versiuni; eșuează dacă nu pot fi instalate, în loc să aleagă silențios altele.'],
          ['skip_if_unavailable=False', 'dacă un repository este inaccesibil, comanda eșuează (nu îl ignoră).'],
        ]} />
        <p className="small">Valorile din exemplu sunt ilustrative; fișierul real de pe sistemul tău poate conține alte valori. Citește-l cu <code>cat /etc/dnf/dnf.conf</code> și compară cu <code>man dnf.conf</code>.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="subscription-manager status" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo subscription-manager status\n+-------------------------------------------+\n   System Status Details\n+-------------------------------------------+\nOverall Status: Current`} />
        <p className="small"><code>Overall Status: Current</code> înseamnă, de regulă, sistem înregistrat cu abonament valid. Alte stări (de exemplu „Not registered” sau „Invalid”) indică lipsa accesului la CDN. Formatul exact poate diferi de la o versiune la alta.</p>
        <CodeBlock title="dnf check-update" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo dnf check-update\nkernel.x86_64          6.12.0-55.el10        baseos\nopenssl.x86_64         3.2.2-1.el10          baseos\n[student@server1 ~]$ echo $?\n100`} />
        <p className="small">Fiecare linie: pachet.arhitectură, versiunea nouă disponibilă, repository. Codul <code>100</code> confirmă că există actualizări. Pachetele și versiunile sunt exemple construite.</p>
        <CodeBlock title="kernel instalat vs în execuție" kind="session" label="illustrative" code={`[student@server1 ~]$ uname -r\n6.12.0-55.el10.x86_64\n[student@server1 ~]$ rpm -q kernel\nkernel-6.12.0-55.el10.x86_64\nkernel-6.12.0-61.el10.x86_64`} />
        <p className="small"><code>uname -r</code> = kernelul care rulează acum; <code>rpm -q kernel</code> = toate instalate. Dacă cel mai nou instalat (aici ...61) diferă de cel în execuție (...55), actualizarea intră în vigoare abia după reboot. Numerele de versiune sunt exemple.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Înregistrare:</b> <code>sudo subscription-manager status</code>; <code>sudo dnf repolist</code> arată repository-urile Red Hat.</li>
            <li><b>Instalare:</b> <code>rpm -q NUME</code>; <code>dnf info NUME</code> arată din ce repository a venit (<code>From repo</code> pentru pachete instalate; de confirmat câmpul pe versiunea ta).</li>
            <li><b>Actualizare:</b> <code>dnf check-update</code> returnează 0 după ce ai actualizat tot; <code>rpm -q pachet</code> arată versiunea nouă.</li>
            <li><b>Kernel:</b> <code>uname -r</code> după reboot.</li>
            <li><b>Istoric:</b> <code>sudo dnf history list | head</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Pachetele instalate/actualizate persistă. Înregistrarea persistă (certificatele sunt pe disc). Un ISO montat manual sau o setare <code>--enablerepo</code> NU persistă (L2.1). Kernelul nou intră în vigoare doar după reboot; serviciile actualizate se repornesc cu <code>systemctl restart</code> (C4).
            Confirmare manuală după reboot: <code>uname -r</code>, <code>sudo subscription-manager status</code>, <code>sudo dnf repolist</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['repository-urile Red Hat lipsesc', 'sistem neînregistrat', <code>sudo subscription-manager status</code>, 'înregistrează sistemul sau folosește surse locale/remote'],
          ['eroare SSL/certificat la CDN', 'ceas greșit sau certificat expirat', <><code>date</code>; <code>timedatectl</code></>, 'corectează ora (C7) / reînregistrează'],
          [<code>Could not resolve host</code>, 'DNS/rețea', <code>ping -c 2 numele-gazdei</code>, 'repară rețeaua (C8)'],
          ['actualizarea nu pare să facă nimic', 'kernelul nou necesită reboot sau nu sunt actualizări', <><code>dnf check-update; uname -r</code></>, 'rebootează dacă a fost kernel'],
          [<>GPG check FAILED la un RPM remote</>, 'cheie lipsă', <code>rpm -K fișier.rpm</code>, <>importă cheia corectă; nu folosi <code>--nogpgcheck</code> din comoditate</>],
          [<>un repository blochează toată comanda</>, <>repository inaccesibil (<code>skip_if_unavailable=False</code>)</>, <code>dnf repolist -v</code>, <>repară/dezactivează acel repository; <code>--disablerepo=ID</code> pentru o rulare</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Aplici <code>dnf upgrade</code> pe un server de producție fără să citești lista și fără reboot planificat.</>,
          <>Presupui că <code>dnf upgrade</code> a activat noul kernel: verifică <code>uname -r</code>.</>,
          <>Folosești <code>dnf install fișier.rpm</code> fără <code>./</code>.</>,
          <>Scrii parola de abonament direct în comandă, unde rămâne în istoric.</>,
          <>Dezactivezi <code>gpgcheck</code> ca să treacă un RPM semnat de altcineva.</>,
          <>Uiți că <code>--enablerepo</code> este temporar.</>,
          <>Confunzi <code>check-update</code> (nu aplică) cu <code>upgrade</code> (aplică).</>,
          <>La examen: actualizezi tot când ți se cere un singur pachet.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: de ce certificate și nu parole, și cum afli de unde vine un pachet">
        <p>
          Autentificarea la CDN cu certificate evită trimiterea repetată a parolei și permite Red Hat să limiteze accesul pe baza abonamentului (cine are drept la ce repository). Certificatele au o perioadă de valabilitate, motiv pentru care ceasul sistemului contează. Mecanismul exact și locațiile fișierelor pe RHEL 10 sunt de confirmat în documentația oficială.
        </p>
        <p>
          Pentru a afla din ce repository a fost instalat un pachet, <code>dnf info NUME</code> afișează, pentru pachetele instalate, o linie <code>From repo</code> (de verificat pe versiunea ta). Este util pentru a distinge un pachet Red Hat de unul adus dintr-o sursă terță.
        </p>
        <p>
          <code>dnf upgrade</code> respectă și constrângeri precum <code>exclude=</code> din <code>dnf.conf</code> sau din <code>.repo</code>, care pot ascunde pachete de actualizare. Dacă un pachet „nu se actualizează”, verifică și aceste setări.
        </p>
      </DeepDive>
    </>
  );
}

export const L2_3: TopicModule = {
  id: 'L2.3',
  subtitle: 'Înregistrare, CDN, repository remote, RPM local; check-update, upgrade, kernel și reboot',
  studyTime: '≈75 min studiu + laborator',
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
  labs: [LAB_L2_3],
  sources: [
    { kind: 'upstream', ref: 'DNF Command Reference — https://dnf.readthedocs.io/en/latest/command_ref.html (accesat 2026-11-16)' },
    { kind: 'man', ref: 'subscription-manager(8), dnf.conf(5), dnf(8), uname(1)' },
    { kind: 'doc', ref: 'RHEL 10 — Register your RHEL system; Update RHEL content (docs.redhat.com) — necitit (HTTP 403); de confirmat la review' },
  ],
};
