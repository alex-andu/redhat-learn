import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L2_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pe RHEL, software-ul se instalează din <b>pachete</b> <G id="rpm">RPM</G>, iar pachetele stau în <b>repository-uri</b> (depozite). Managerul de pachete <G id="dnf">dnf</G> citește lista de repository-uri
            din fișiere <code>.repo</code> din <code>/etc/yum.repos.d/</code>, descarcă din ele o listă de pachete disponibile (metadata) și instalează ce ceri, împreună cu dependențele.
            Dacă un repository nu este configurat (sau este dezactivat), <code>dnf</code> nu „vede” pachetele lui.
          </p>
          <p>Obiectivul oficial: <i>„Configure access to RPM repositories”</i>. Ți se poate cere, de exemplu, să faci vizibile pachetele dintr-un URL sau dintr-un ISO montat.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un program are nevoie de fișiere (executabile, biblioteci, configurări) puse în locurile potrivite, de alte programe de care depinde (<b>dependențe</b>) și de o evidență care să spună ulterior „ce a instalat ce”.
            Fără un manager de pachete ar trebui să descarci arhive, să cauți manual bibliotecile lipsă, să compilezi și să ții minte ce fișiere ai pus unde — iar ștergerea sau actualizarea ar fi riscante.
          </p>
          <p>
            Un <b>pachet RPM</b> este un fișier <code>.rpm</code>: conține fișierele programului plus informații despre el (nume, versiune, dependențe, semnătură). Un <b>repository</b> este un loc (un URL <code>https://</code>, un director local, un ISO montat)
            care conține multe fișiere <code>.rpm</code> și un index al lor. <code>dnf</code> folosește indexul ca să găsească pachetul cerut și toate dependențele lui, fără să te întrebe de fiecare dată de unde să le ia.
          </p>
          <Analogy>un repository este un magazin cu raft și catalog. Pachetele sunt produsele, catalogul (metadata) spune ce există și ce are nevoie de ce. <code>dnf</code> este vânzătorul care citește catalogul și îți aduce tot ce trebuie. Fișierul <code>.repo</code> este adresa magazinului: fără adresă, vânzătorul nu știe că magazinul există.</Analogy>
          <p>
            Pe un sistem RHEL înregistrat, Red Hat oferă repository-urile oficiale (<b>BaseOS</b> și <b>AppStream</b>) prin rețeaua lor de distribuție (<G id="cdn">CDN</G>), accesibilă pe baza unui abonament. În laborator sau la examen, repository-urile pot fi altele:
            un server intern, un ISO montat sau un director local. Obiectivul C2-1 este exact asta: să știi să configurezi accesul la ele.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Numele unui pachet</h4>
          <p>
            Un fișier RPM se numește după tiparul <code>nume-versiune-release.arhitectură.rpm</code>, de exemplu <code>tree-2.1.0-1.el10.x86_64.rpm</code> (valorile sunt un exemplu construit). <code>nume</code> = ce este;
            <code>versiune</code> = versiunea programului de la autor; <code>release</code> = numărul de reconstruire făcut de distribuție (aici apare și <code>el10</code> = Enterprise Linux 10); <code>arhitectura</code> = pentru ce procesor
            (<code>x86_64</code>, <code>aarch64</code>) sau <code>noarch</code> dacă nu depinde de procesor.
          </p>
          <h4>Anatomia unui repository</h4>
          <p>
            Într-un repository, lângă fișierele <code>.rpm</code> există un director <code>repodata/</code> care conține fișierul <code>repomd.xml</code> (indexul indexurilor) și liste comprimate cu pachetele, dependențele și lista de fișiere.
            Acest director este creat cu o unealtă numită <code>createrepo_c</code>. Fără <code>repodata/</code>, un director cu fișiere <code>.rpm</code> <b>nu este</b> un repository pentru <code>dnf</code>.
          </p>
          <h4>Ce face dnf la fiecare rulare</h4>
          <ol>
            <li>Citește <code>/etc/dnf/dnf.conf</code> (setări globale) și toate fișierele <code>/etc/yum.repos.d/*.repo</code>.</li>
            <li>Pentru fiecare repository cu <code>enabled=1</code>, descarcă (sau reutilizează din cache, dacă nu a expirat) <code>repodata/repomd.xml</code> și listele de pachete. Cache-ul este în <code>/var/cache/dnf/</code>.</li>
            <li>Construiește lista pachetelor disponibile și rezolvă dependențele (un „solver” care alege versiunile compatibile).</li>
            <li>Descarcă pachetele, verifică <b>semnătura GPG</b> dacă <code>gpgcheck=1</code> și abia apoi instalează (L2.2).</li>
          </ol>
          <h4>Semnătura GPG: de ce contează</h4>
          <p>
            Fiecare pachet poate fi semnat digital de cel care îl publică. Cheia publică a acestuia (<code>gpgkey=</code>) este importată în baza de date RPM; la instalare, <code>dnf</code> verifică semnătura.
            Dacă pachetul a fost modificat pe drum sau vine de la altcineva, verificarea eșuează. De aceea, în configurare reală, lași <code>gpgcheck=1</code>.
          </p>
          <h4>Repository-urile Red Hat</h4>
          <p>
            Pe un sistem înregistrat, <code>subscription-manager</code> generează fișierul <code>/etc/yum.repos.d/redhat.repo</code> cu repository-urile la care ai drept. Nu îl editezi de mână: este regenerat de unealta de înregistrare.
            Repository-urile tale proprii le pui în fișiere separate (de exemplu <code>/etc/yum.repos.d/local.repo</code>).
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Înregistrare și abonament</b> (C7, <i>L2.3</i>): accesul la CDN-ul Red Hat cere un sistem înregistrat; fără el, repository-urile oficiale nu sunt disponibile.</li>
            <li><b>Rețea</b> (C8): un repository <code>https://</code> cere DNS, rutare și, uneori, proxy funcțional. Dacă rețeaua nu merge, <code>dnf</code> eșuează la descărcarea metadata.</li>
            <li><b>Stocare</b> (C5/C6): un repository local dintr-un ISO cere <code>mount</code>. Montarea nu persistă după reboot fără o linie în <code>/etc/fstab</code>, deci și accesul la repository dispare.</li>
            <li><b>Permisiuni</b> (L1.8): fișierele <code>.repo</code> aparțin lui <code>root</code>; le editezi cu <code>sudo</code>. Fișierul scris cu <code>sudo echo ... &gt; fișier</code> eșuează (vezi L1.5); folosește un editor sub <code>sudo</code> sau <code>tee</code>.</li>
            <li><b>Securitate</b> (C9/C10): verificarea semnăturilor GPG apără împotriva pachetelor modificate.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Sistem nou fără acces la CDN: configurezi un repository intern sau ISO-ul de instalare ca sursă de pachete.</li>
            <li>Ai nevoie de un pachet care nu e în repository-urile standard: adaugi repository-ul furnizorului (și cheia lui GPG).</li>
            <li>Vrei să oprești temporar o sursă (de exemplu, un repository lent sau defect) fără să o ștergi: o dezactivezi.</li>
            <li>Depanezi „No match for argument” sau „nu găsesc pachetul”: verifici ce repository-uri sunt active.</li>
            <li>La examen: se cere adesea „configurează repository-urile BaseOS și AppStream de la adresa X”; apoi alte sarcini (instalări) depind de asta.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem RHEL 10 sau compatibil (de exemplu o mașină virtuală proprie). Output-urile din această lecție sunt <b>Ilustrative</b>: numele repository-urilor, numerele și mesajele exacte diferă de la un sistem la altul.
          Nu am rulat aceste comenzi pe RHEL 10 în redactarea lecției.
        </Callout>

        <h4>1. Vezi ce repository-uri știe dnf</h4>
        <CodeBlock title="comenzi" code={`sudo dnf repolist\nsudo dnf repolist --all\nsudo dnf repolist -v`} explain={[
          ['sudo', 'rulează comanda cu drepturi de administrator (L1.10). Pentru a citi/actualiza metadata, dnf are nevoie, de regulă, de root.'],
          ['dnf repolist', 'afișează doar repository-urile ACTIVE (implicit echivalent cu --enabled).'],
          ['--all', 'afișează activele și cele dezactivate, cu starea fiecăruia.'],
          ['-v', '(verbose) afișează detalii: ID, nume, URL de bază, dimensiune, număr de pachete.'],
        ]} />

        <h4>2. Fișierul .repo — structura</h4>
        <p>Fiecare repository este o secțiune între paranteze drepte. Exemplu pentru un repository local, creat de tine, într-un fișier <code>/etc/yum.repos.d/local.repo</code>:</p>
        <CodeBlock title="/etc/yum.repos.d/local.repo" kind="config" code={`[local-baseos]\nname=Local BaseOS (ISO montat)\nbaseurl=file:///mnt/BaseOS\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\n\n[local-appstream]\nname=Local AppStream (ISO montat)\nbaseurl=file:///mnt/AppStream\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release`} explain={[
          ['[local-baseos]', 'ID-ul repository-ului: nume scurt, fără spații, unic. Îl folosești la --enablerepo/--disablerepo.'],
          ['name=', 'nume descriptiv, afișat de dnf repolist.'],
          ['baseurl=', 'adresa repository-ului (directorul care conține repodata/). Scheme acceptate: https://, http://, ftp://, file:///. La file:/// sunt TREI slash-uri: două ale schemei și unul al căii absolute.'],
          ['enabled=1', '1 = activ, 0 = ignorat de dnf. Dacă lipsește, valoarea implicită este activ.'],
          ['gpgcheck=1', 'cere verificarea semnăturii GPG a fiecărui pachet descărcat. 0 = nu verifică (nerecomandat).'],
          ['gpgkey=', 'unde se află cheia publică folosită la verificare. Poate fi URL sau file:///. Calea din exemplu este una uzuală pentru cheile distribuției, dar verific-o pe sistemul tău cu ls /etc/pki/rpm-gpg/.'],
        ]} />
        <p className="small">Alte chei întâlnite: <code>metalink=</code> / <code>mirrorlist=</code> (în loc de <code>baseurl</code>: adresa unei liste de oglinzi), <code>repo_gpgcheck=1</code> (verifică și semnătura metadata), <code>priority=</code> (prioritate între repository-uri), <code>sslverify=</code>. Lista completă: <code>man dnf.conf</code>, secțiunea „repo options”.</p>

        <h4>3. Activare, dezactivare, folosire temporară</h4>
        <CodeBlock title="comenzi" code={`sudo dnf config-manager --set-enabled local-baseos\nsudo dnf config-manager --set-disabled local-baseos\nsudo dnf install --enablerepo=local-appstream tree\nsudo dnf install --disablerepo='*' --enablerepo=local-baseos tree\nsudo dnf --repo=local-baseos list available`} explain={[
          ['config-manager', 'subcomandă furnizată de pachetul dnf-plugins-core (poate fi nevoie să-l instalezi). Modifică fișierul .repo (persistent).'],
          ['--set-enabled ID', 'pune enabled=1 pentru repository-ul cu acel ID. --set-disabled pune enabled=0.'],
          ['--enablerepo=ID', 'activează repository-ul DOAR pentru comanda curentă; fișierul nu se modifică.'],
          ["--disablerepo='*'", "dezactivează temporar toate repository-urile (asteriscul este în ghilimele ca shell-ul să nu-l expandeze). Combinat cu --enablerepo, lasă doar unul."],
          ['--repo=ID', 'scurtătură pentru „dezactivează toate, activează doar ID”.'],
        ]} />
        <Callout kind="warn" title="Verifică-ți versiunea de dnf">
          Sintaxa <code>dnf config-manager</code> depinde de versiunea de dnf (Fedora, cu DNF5, folosește alte subcomenzi). Dacă o comandă nu e recunoscută, rulează <code>dnf config-manager --help</code>. Varianta sigură pe orice versiune: <b>editezi direct fișierul <code>.repo</code></b> cu un editor (L1.4) și schimbi <code>enabled=</code>.
        </Callout>

        <h4>4. Adaugă un repository dintr-un URL (fără să scrii fișierul)</h4>
        <CodeBlock title="comandă" code={`sudo dnf config-manager --add-repo https://repo.exemplu.local/rhel10/exemplu.repo`} explain={[
          ['--add-repo URL', 'descarcă fișierul .repo de la URL și îl pune în /etc/yum.repos.d/. URL-ul trebuie să indice un fișier .repo, NU directorul repository-ului. Exemplul este fictiv.'],
        ]} />
        <p className="small">Dacă ai doar adresa directorului cu pachete, creezi tu fișierul <code>.repo</code> (secțiunea 2).</p>

        <h4>5. Importă cheia GPG</h4>
        <CodeBlock title="comenzi" code={`sudo rpm --import https://repo.exemplu.local/RPM-GPG-KEY-exemplu\nsudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\nrpm -q gpg-pubkey`} explain={[
          ['rpm --import', 'adaugă o cheie publică în baza de date RPM, ca să poată fi verificate pachetele semnate cu ea.'],
          ['rpm -q gpg-pubkey', '(-q = query) listează cheile importate; fiecare apare ca un „pachet” gpg-pubkey.'],
        ]} />
        <p className="small">Notă: dacă <code>gpgkey=</code> indică o cheie, <code>dnf</code> poate cere să o importe la prima instalare și îți afișează amprenta ca s-o confirmi. Nu răspunde „y” orbește pentru o cheie în care nu ai încredere.</p>

        <h4>6. Un repository local dintr-un ISO montat</h4>
        <CodeBlock title="comenzi" code={`sudo mount -o loop /root/rhel-10-x86_64-dvd.iso /mnt\nls /mnt\nls /mnt/BaseOS /mnt/AppStream | head\nsudo vi /etc/yum.repos.d/local.repo\nsudo dnf clean all\nsudo dnf repolist`} explain={[
          ['mount -o loop FIȘIER DIR', 'montează un fișier ISO ca și cum ar fi un disc; -o loop îl tratează ca dispozitiv bloc. Numele ISO-ului este un exemplu. Pentru un disc/DVD real: mount /dev/sr0 /mnt.'],
          ['ls /mnt', 'verifici că vezi directoarele BaseOS și AppStream (structura mediului de instalare RHEL).'],
          ['vi ...local.repo', 'creezi fișierul din secțiunea 2, cu baseurl=file:///mnt/BaseOS și file:///mnt/AppStream.'],
          ['dnf clean all', 'șterge cache-ul de metadata, ca dnf să citească proaspăt noile surse.'],
          ['dnf repolist', 'confirmă că repository-urile noi apar în listă.'],
        ]} />
        <p className="small">Pentru directoare proprii cu fișiere <code>.rpm</code>: <code>sudo dnf install createrepo_c</code>, apoi <code>createrepo_c /srv/repo</code> creează <code>/srv/repo/repodata/</code>; <code>baseurl=file:///srv/repo</code>.</p>

        <h4>7. Subscription Manager (doar noțiuni)</h4>
        <CodeBlock title="comenzi" code={`sudo subscription-manager status\nsudo subscription-manager repos --list\nsudo subscription-manager repos --enable=ID-REPO`} explain={[
          ['subscription-manager status', 'arată dacă sistemul este înregistrat și are abonament valid.'],
          ['repos --list', 'listează repository-urile Red Hat disponibile contractului tău și starea lor.'],
          ['repos --enable=ID', 'activează un repository Red Hat (scrie în redhat.repo). ID-urile exacte se iau din --list; nu le memora.'],
        ]} />
        <p className="small">Înregistrarea propriu-zisă și accesul la CDN sunt tratate în lecția L2.3.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="dnf repolist" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo dnf repolist\nrepo id           repo name\nlocal-appstream   Local AppStream (ISO montat)\nlocal-baseos      Local BaseOS (ISO montat)`} />
        <p className="small">
          Prima linie este antetul: <code>repo id</code> (ID-ul din <code>[ ]</code>) și <code>repo name</code> (din <code>name=</code>). Fiecare linie următoare este un repository <b>activ</b>. Dacă ai scris corect <code>.repo</code> dar nu vezi repository-ul aici,
          verifică <code>enabled=</code> și că secțiunea are formatul corect. Antetul și coloanele pot diferi ușor după versiune.
        </p>
        <CodeBlock title="dnf repolist --all" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo dnf repolist --all\nrepo id           repo name                       status\nlocal-appstream   Local AppStream (ISO montat)    enabled\nlocal-baseos      Local BaseOS (ISO montat)       disabled`} />
        <p className="small">Coloana <code>status</code> apare cu <code>--all</code>: <code>enabled</code> = va fi folosit, <code>disabled</code> = ignorat, deși fișierul îl definește.</p>
        <CodeBlock title="dnf cu repository inaccesibil" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo dnf install tree\nError: Failed to download metadata for repo 'local-baseos': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried`} />
        <p className="small">
          Mesajul spune: pentru repository-ul cu ID-ul <code>local-baseos</code>, <code>dnf</code> nu a putut descărca <code>repodata/repomd.xml</code>. Cauze tipice: ISO nemontat (nu există <code>/mnt/BaseOS</code>), URL greșit, lipsa <code>repodata/</code>, rețea picată.
          Textul exact al mesajului diferă între versiuni; important este numele repository-ului și <code>repomd.xml</code>.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>sudo dnf repolist</code> (sau <code>--all</code>): repository-ul tău apare cu starea așteptată.</li>
            <li><code>sudo dnf clean all &amp;&amp; sudo dnf makecache</code>: forțează reîncărcarea metadata; dacă nu apar erori, repository-ul este accesibil.</li>
            <li><code>sudo dnf --repo=ID list available | head</code>: arată pachete din repository-ul respectiv (dacă lista nu e goală, indexul este citit).</li>
            <li><code>sudo dnf install --assumeyes tree</code> (sau alt pachet mic): instalarea reușită este testul practic final.</li>
            <li><code>ls /etc/yum.repos.d/</code> și <code>cat /etc/yum.repos.d/local.repo</code>: reciți fișierul; o greșeală de scriere (de exemplu <code>baseur1</code>) este ușor de ratat.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierul <code>.repo</code> din <code>/etc/yum.repos.d/</code> și valoarea <code>enabled=</code> persistă după reboot. <code>--enablerepo</code>/<code>--disablerepo</code> NU persistă: valabile doar pentru o comandă.
            Cheia GPG importată cu <code>rpm --import</code> rămâne în baza RPM.
          </p>
          <p>
            Ce poate dispărea: un <b>ISO montat cu <code>mount</code></b> nu rămâne montat după reboot. Repository-ul <code>file:///mnt/...</code> devine inaccesibil până remontezi. Pentru persistență, ai nevoie de o linie în <code>/etc/fstab</code> (C6),
            de exemplu <code>/root/rhel.iso /mnt iso9660 loop,ro 0 0</code> (exemplu ilustrativ; verifică-l pe sistemul tău). După reboot confirmi manual cu <code>findmnt /mnt</code> și <code>sudo dnf repolist</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['repository-ul nu apare în repolist', <><code>enabled=0</code>, secțiune greșită sau fișier fără extensia <code>.repo</code></>, <><code>cat /etc/yum.repos.d/f.repo</code>; <code>dnf repolist --all</code></>, <>corectează fișierul; numele trebuie să se termine în <code>.repo</code></>],
          [<code>Cannot download repomd.xml</code>, 'baseurl greșit, ISO nemontat, repodata lipsă, rețea', <><code>ls /mnt/BaseOS/repodata</code>; <code>curl -I URL</code></>, <>montează ISO-ul / corectează URL-ul / rulează <code>createrepo_c</code></>],
          [<><code>file://</code> nu merge deși calea e bună</>, 'doar două slash-uri sau cale relativă', <code>grep baseurl /etc/yum.repos.d/*.repo</code>, <>folosește <code>file:///cale/absolută</code></>],
          ['GPG check FAILED / cheie lipsă', <><code>gpgkey=</code> greșit sau cheia neimportată</>, <><code>rpm -q gpg-pubkey</code></>, <>corectează <code>gpgkey=</code> sau <code>rpm --import</code> (nu dezactiva <code>gpgcheck</code> ca scurtătură)</>],
          ['modificările la .repo nu se văd', 'cache vechi', '—', <><code>sudo dnf clean all</code></>],
          [<><code>config-manager</code> nu este recunoscut</>, 'pachet lipsă sau altă versiune dnf', <code>dnf config-manager --help</code>, <>instalează <code>dnf-plugins-core</code> sau editează fișierul direct</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Un director cu fișiere <code>.rpm</code> fără <code>repodata/</code> nu este repository: rulează <code>createrepo_c</code>.</>,
          <><code>baseurl=file://mnt/BaseOS</code> (două slash-uri) în loc de <code>file:///mnt/BaseOS</code>.</>,
          <>Pui <code>baseurl</code> la rădăcina ISO-ului, nu la <code>/mnt/BaseOS</code> și <code>/mnt/AppStream</code>: două repository-uri separate.</>,
          <>Uiți <code>enabled=1</code> sau scrii <code>enable=1</code> (cheie inexistentă).</>,
          <>Dezactivezi <code>gpgcheck</code> doar ca să „meargă”. Dacă examenul oferă o cheie, folosește-o.</>,
          <>Montezi ISO-ul, dar nu îl faci persistent: după reboot, sarcina „repository configurat” nu mai este adevărată.</>,
          <>Editezi <code>redhat.repo</code> manual: este regenerat de <code>subscription-manager</code>; folosește un fișier propriu.</>,
          <>Folosești <code>sudo echo ... &gt; /etc/yum.repos.d/f.repo</code> (eșuează, L1.5).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: metadata, cache și de ce clean all rezolvă „ciudățenii”">
        <p>
          <code>dnf</code> nu descarcă metadata la fiecare comandă: o păstrează în <code>/var/cache/dnf/</code> și o consideră valabilă un timp (setarea <code>metadata_expire</code>, implicit de ordinul orelor — verifică <code>man dnf.conf</code>).
          Dacă schimbi conținutul unui repository local (adaugi un RPM și rulezi din nou <code>createrepo_c</code>) sau ISO-ul este înlocuit, cache-ul vechi poate indica pachete care nu mai există. <code>dnf clean all</code> sau <code>dnf makecache</code> rezolvă.
        </p>
        <p>
          <code>repomd.xml</code> conține sume de control ale celorlalte fișiere de metadata. Așa știe <code>dnf</code> dacă metadata s-a schimbat fără să o descarce integral. Cu <code>repo_gpgcheck=1</code>, și acest fișier este verificat prin semnătură detașată (<code>repomd.xml.asc</code>), nu doar pachetele.
        </p>
        <p>
          Rețeaua de distribuție a Red Hat folosește certificate client (nu parole) pentru autentificare: <code>subscription-manager</code> primește certificate de entitlement și le referă în <code>redhat.repo</code> prin <code>sslclientcert=</code>/<code>sslclientkey=</code>. Detalii de confirmat în documentația RHEL 10.
        </p>
      </DeepDive>
    </>
  );
}

export const L2_1: TopicModule = {
  id: 'L2.1',
  subtitle: 'Pachete RPM, repository-uri, fișiere .repo, chei GPG, ISO montat ca sursă',
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
  labs: [LAB_L2_1],
  sources: [
    { kind: 'upstream', ref: 'DNF Command Reference — https://dnf.readthedocs.io/en/latest/command_ref.html (accesat 2026-11-16)' },
    { kind: 'man', ref: 'dnf.conf(5) (repository options), rpm(8), createrepo_c(8), subscription-manager(8), mount(8)' },
    { kind: 'doc', ref: 'RHEL 10 — Install, upgrade, and remove packages…: Add and configure custom software repositories (https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10) — pagina nu a putut fi citită (HTTP 403); de confirmat la review' },
  ],
};
