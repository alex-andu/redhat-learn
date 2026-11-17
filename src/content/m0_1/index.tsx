import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_M0_1A, LAB_M0_1B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <b>Linux</b> este, strict vorbind, doar un <G id="linux-kernel">nucleu</G>. Ce instalezi pe un server este o <G id="distribution">distribuție</G>: nucleul, plus programele GNU și alte componente, plus un manager de pachete, plus decizii de configurare. <G id="rhel">Red Hat Enterprise Linux (RHEL)</G> este distribuția comercială a Red Hat, cu ciclu de viață lung, actualizări testate și suport contractual; examenul EX200 (RHCSA) se dă pe <b>RHEL 10</b>.
          </p>
          <p>
            Lecția răspunde la întrebările „fără de care nu poți începe”: ce rulează pe mașina mea, de unde vine RHEL (<G id="fedora">Fedora</G> → <G id="centos-stream">CentOS Stream</G> → RHEL), ce înseamnă versiune majoră și minoră, ce este un <G id="rh-subscription">abonament Red Hat</G> și de ce un sistem trebuie <i>înregistrat</i> ca să primească pachete, ce alternative gratuite există pentru exercițiu și cum îți pregătești un mediu <b>sigur</b> de lucru. Material de suport (neoficial).
          </p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Linux: un nucleu, nu un sistem complet</h4>
          <p>
            În 1991, Linus Torvalds a publicat primul nucleu Linux. Un nucleu gestionează procesorul, memoria, discurile și rețeaua și oferă programelor un set de servicii (apeluri de sistem; vezi M0.5). Dar un nucleu singur nu poate fi folosit: nu are shell, nu are comenzi, nu are cum să instaleze programe. Aceste părți existau deja, în proiectul <b>GNU</b> (început în 1983): <code>bash</code>, <code>ls</code>, <code>cp</code>, <code>grep</code>, compilatorul <code>gcc</code>, biblioteca C. Combinația lor a dat sistemul de operare pe care îl folosim; de aici denumirea „GNU/Linux”. Pe acest sistem se adaugă systemd, NetworkManager, OpenSSH, SELinux, firewalld și multe altele.
          </p>
          <Analogy>nucleul este motorul unei mașini. Un motor singur nu te duce nicăieri: ai nevoie de șasiu, volan, scaune, instrumente. Distribuția este mașina completă, asamblată, testată și vândută cu garanție; iar producătorii diferiți (Red Hat, Debian, Ubuntu, SUSE) fac „mașini” diferite pornind de la același motor.</Analogy>

          <h4>Licență și ecosistem</h4>
          <p>
            Nucleul Linux este <G id="open-source">open source</G> (licență GPLv2): oricine poate citi codul, îl poate modifica și redistribui, cu condițiile licenței. De aceea există sute de distribuții. Firmele pot construi produse pe același cod și pot concura prin calitate, stabilitate și suport, nu prin interzicerea copierii. Red Hat nu „vinde Linux”: vinde acces la binare testate și certificate, la actualizări, la suport, la garanții și la un ciclu de viață previzibil.
          </p>

          <h4>Familii de distribuții</h4>
          <Table head={['Familie', 'Format pachet / manager', 'Exemple']} rows={[
            [<b>Red Hat</b>, <>RPM / DNF</>, 'RHEL, Fedora, CentOS Stream, AlmaLinux, Rocky Linux, Oracle Linux'],
            [<b>Debian</b>, 'DEB / APT', 'Debian, Ubuntu'],
            [<b>SUSE</b>, 'RPM / zypper', 'SUSE Linux Enterprise, openSUSE'],
            [<b>Altele</b>, 'variate', 'Arch Linux, Gentoo, Alpine'],
          ]} />
          <p>La EX200 contează doar familia Red Hat. Comenzile de bază (<code>ls</code>, <code>systemctl</code>) sunt aceleași în aproape toate; diferă managerul de pachete, structura unor configurări și valorile implicite.</p>

          <h4>De unde vine RHEL: Fedora → CentOS Stream → RHEL</h4>
          <Table head={['Proiect', 'Rol', 'Stabilitate']} rows={[
            [<G id="fedora">Fedora</G>, 'proiect comunitar sponsorizat de Red Hat; funcții noi, lansări la ~6 luni', 'mare viteză de schimbare'],
            [<G id="centos-stream">CentOS Stream</G>, 'distribuția aflată imediat „în amonte” de RHEL: codul care va intra în următoarea versiune minoră', 'în continuă actualizare'],
            [<G id="rhel">RHEL</G>, 'produsul comercial testat, certificat, cu suport și actualizări controlate', 'stabilă, pe ani'],
            [<G id="rhel-rebuild">Rocky Linux / AlmaLinux</G>, 'recompilări comunitare, compatibile cu RHEL; fără abonament Red Hat', 'urmăresc RHEL'],
          ]} />
          <p>
            Fluxul este o schemă simplificată; detalii și excepții se găsesc în documentația fiecărui proiect. Important pentru tine: <b>comportamentul RHEL este cel testat la examen</b>. Pentru exerciții pot fi folosite și recompilările compatibile, cu mențiunea că ele nu sunt RHEL și pot avea mici diferențe (numele repository-urilor, înregistrarea, branding).
          </p>

          <h4>Ce înseamnă „enterprise”</h4>
          <ul>
            <li><b>Stabilitate</b>: versiunile pachetelor sunt înghețate în interiorul unei versiuni majore; se aplică doar corecții de securitate și bug-uri (backport), nu salturi de versiune.</li>
            <li><b>Ciclu de viață lung</b>: conform politicii Red Hat, o versiune majoră are 5 ani de Full Support și 5 ani de Maintenance Support (primii 10 ani), plus faza Extended Life (4 ani, conform diagramei politicii). Datele exacte se citesc din pagina „Red Hat Enterprise Linux Life Cycle” (access.redhat.com).</li>
            <li><b>Certificări</b>: hardware și aplicații certificate (baze de date, ERP).</li>
            <li><b>Suport</b>: acces la inginerii Red Hat, pe baza abonamentului.</li>
            <li><b>Securitate</b>: SELinux activ implicit, firewalld, actualizări de securitate publicate prompt, criptografie conform politicilor de sistem.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Versiuni: majoră și minoră</h4>
          <p>
            RHEL 10 este versiunea <G id="major-minor-release">majoră</G>: definește nucleul (seria 6.12 pentru RHEL 10), biblioteca C, versiunile principalelor pachete. În interiorul ei apar versiuni minore (10.0, 10.1, 10.2…), care aduc funcții noi și suport hardware, păstrând compatibilitatea. Un sistem 10.0 actualizat cu <code>dnf update</code> devine ultima minoră disponibilă; trecerea de la 9 la 10 este însă o migrare planificată. Conform politicii Red Hat, anumite versiuni minore (pentru RHEL 10: 10.2, 10.4, 10.6, 10.8, 10.10) au suport extins (ELCP), pentru cei care vor rămâne mai mult timp pe aceeași minoră.
          </p>
          <p>
            Cum afli ce rulezi: <code>/etc/redhat-release</code> (o linie), <code>/etc/os-release</code> (perechi cheie-valoare, citibile de scripturi, vezi <G id="os-release">os-release</G>), <code>uname -r</code> (nucleul), <code>hostnamectl</code> (rezumat). La examen, versiunea majoră este cunoscută (RHEL 10); utilă este însă recunoașterea sistemului atunci când intri pe o mașină necunoscută.
          </p>

          <h4>De unde vine software-ul: repository-uri și abonament</h4>
          <p>
            Pe RHEL, software-ul se instalează cu <G id="dnf">DNF</G> din <G id="repository">repository-uri</G>: servere (sau directoare) care conțin pachete <G id="rpm">RPM</G> și metadate. Repository-urile oficiale Red Hat sunt publicate printr-o rețea de distribuție de conținut (<G id="cdn">CDN</G>) și sunt accesibile doar sistemelor <b>înregistrate</b> cu un abonament. Mecanismul, simplificat:
          </p>
          <ol>
            <li>Ai un cont Red Hat și un abonament (comercial sau de dezvoltator).</li>
            <li>Rulezi <code>subscription-manager register</code> (sau <code>rhc connect</code>). Sistemul își primește o identitate și certificate de acces.</li>
            <li>Sistemul este asociat unui abonament; repository-urile aferente apar în configurația DNF (<code>/etc/yum.repos.d/redhat.repo</code>, generat de <code>subscription-manager</code>).</li>
            <li><code>dnf</code> folosește certificatele pentru a descărca metadate și pachete de la CDN.</li>
            <li>Pachetele sunt semnate cu cheia GPG a Red Hat; DNF verifică semnătura la instalare (<G id="gpg-signature">semnătură GPG</G>).</li>
          </ol>
          <p>
            Repository-urile principale ale unui sistem RHEL sunt <b>BaseOS</b> (pachetele de bază ale sistemului de operare) și <b>AppStream</b> (aplicații, limbaje, module). Numele exacte ale ID-urilor de repository pentru RHEL 10 se verifică cu <code>dnf repolist</code> sau <code>subscription-manager repos --list</code>. Tratamentul detaliat al repository-urilor, inclusiv cele locale (fără abonament), este în capitolul C2 (L2.1, L2.3).
          </p>
          <Callout kind="exam" title="Despre examen">
            Examenul EX200 este <b>practic</b> (performance-based): rezolvi sarcini pe sisteme reale, nu răspunzi la întrebări grilă. Obiectivele oficiale au fost păstrate verbatim în curriculumul acestei platforme (62 de obiective); înregistrarea cu un abonament nu este un obiectiv oficial, dar instalarea de pachete (C2) presupune accesul la repository-uri. Detalii despre durată, scor și reguli de examen nu sunt publicate pe pagina sursă a obiectivelor și nu sunt afirmate aici; consultă pagina oficială Red Hat a examenului.
          </Callout>

          <h4>Ce înseamnă „sistem înregistrat”</h4>
          <Table head={['Stare', 'Efect', 'Cum verifici']} rows={[
            [<b>înregistrat + abonament atașat</b>, 'dnf are acces la repository-urile Red Hat', <><code>sudo subscription-manager status</code> → „Overall Status: Current”</>],
            [<b>înregistrat, fără abonament</b>, 'identitatea există, dar nu și accesul la conținut', <><code>subscription-manager status</code>: „Invalid” sau similar</>],
            [<b>neînregistrat</b>, 'fără acces la repository-urile Red Hat; DNF poate folosi doar repository-uri locale configurate manual', <><code>sudo subscription-manager identity</code>: „This system is not yet registered”</>],
          ]} />
          <p>Mesajele exacte pot varia între versiuni; sunt ilustrate în secțiunea 7 și trebuie confirmate pe un sistem RHEL 10 real.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Pachete și repository-uri</b> (C2): înregistrarea decide ce repository-uri vezi; <code>dnf</code> și <code>rpm</code> instalează și interoghează.</li>
            <li><b>Nucleul</b> (M0.5, C4): versiunea nucleului este legată de versiunea majoră RHEL; actualizările de nucleu cer reboot și apar ca intrări noi în GRUB (C7).</li>
            <li><b>Securitate</b> (C10): RHEL pornește cu SELinux în mod enforcing și cu firewalld activ; la examen aceste configurări implicite trebuie respectate, nu dezactivate.</li>
            <li><b>Rețea</b> (C8): înregistrarea și actualizările cer conectivitate la Red Hat (sau la un spațiu de oglindire/Satellite într-o organizație).</li>
            <li><b>Timp</b> (C7): certificatele de abonament și semnăturile depind de ceas; un ceas greșit poate face înregistrarea să eșueze (chrony, L7.3).</li>
            <li><b>Virtualizare</b>: majoritatea exercițiilor se fac într-o mașină virtuală; instantaneele (snapshot) fac greșelile reversibile.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li><b>Când intri pe o mașină necunoscută</b>: întâi stabilești ce sistem este (<code>cat /etc/os-release</code>), ce nucleu rulează și dacă este înregistrat.</li>
            <li><b>Când un <code>dnf install</code> eșuează</b>: una dintre primele verificări este dacă sistemul este înregistrat sau dacă are repository-uri locale.</li>
            <li><b>Când pregătești un mediu de exercițiu</b>: alegi RHEL cu abonament de dezvoltator sau o recompilare compatibilă, într-o VM cu instantaneu.</li>
            <li><b>Când planifici o actualizare</b>: diferența dintre actualizarea minoră (<code>dnf update</code>) și migrarea majoră.</li>
            <li><b>Când citești documentație</b>: știi că un ghid pentru RHEL 9 se aplică de obicei și la RHEL 10, dar fiecare comandă și valoare implicită trebuie confirmată în documentația versiunii tale.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Doar citire, în afară de înregistrare">
          Toate comenzile de mai jos <b>citesc</b> informații, cu excepția <code>subscription-manager register</code> / <code>unregister</code> și <code>rhc connect</code>, care <b>modifică</b> starea sistemului și a contului tău Red Hat. Le execuți doar pe propriul sistem de test, cu contul tău; platforma nu le rulează și nu cunoaște parolele tale. <b>Nu introduce niciodată parola contului Red Hat în notițe sau în platformă.</b> Output-urile sunt etichetate <b>Ilustrativ</b>.
        </Callout>

        <h4>6.1 Ce sistem este?</h4>
        <CodeBlock title="comenzi" code={`cat /etc/redhat-release\ncat /etc/os-release\nuname -r\nuname -m\nhostnamectl\nrpm -q redhat-release\nsystemd-detect-virt\nnproc\nfree -h`} explain={[
          ['cat /etc/redhat-release', 'o singură linie: numele produsului și versiunea (ex. „Red Hat Enterprise Linux release 10.x”). Specifică familiei Red Hat.'],
          ['cat /etc/os-release', 'fișier standard cu câmpuri precum NAME, ID, VERSION_ID, PRETTY_NAME; potrivit pentru scripturi.'],
          ['uname -r', 'versiunea nucleului în execuție (-r = kernel release).'],
          ['uname -m', 'arhitectura mașinii (-m = machine), de ex. x86_64 sau aarch64.'],
          ['hostnamectl', 'nume, ID mașină, tip de virtualizare, sistem de operare, nucleu, arhitectură.'],
          ['rpm -q redhat-release', 'pachetul care livrează fișierele de identificare a versiunii; confirmă că este RHEL (nu o recompilare cu alt nume de pachet).'],
          ['systemd-detect-virt', 'detectează dacă rulezi într-o mașină virtuală (kvm, vmware, microsoft…) sau pe hardware („none”).'],
          ['nproc', 'numărul de procesoare disponibile.'],
          ['free -h', 'memoria (M0.5).'],
        ]} />
        <p>Variabilele din <code>/etc/os-release</code> pot fi încărcate în shell: <code>source /etc/os-release; echo "$PRETTY_NAME"</code> (<code>source</code> este explicat în M0.3).</p>

        <h4>6.2 Starea abonamentului (doar citire)</h4>
        <CodeBlock title="comenzi" code={`sudo subscription-manager identity\nsudo subscription-manager status\nsudo subscription-manager list --consumed\nsudo subscription-manager repos --list-enabled\ndnf repolist\nls /etc/yum.repos.d/`} explain={[
          ['subscription-manager identity', 'afișează identitatea sistemului (UUID) dacă este înregistrat; altfel spune că nu este înregistrat. Cere root.'],
          ['subscription-manager status', 'starea generală a abonamentului (Overall Status), plus produsele instalate.'],
          ['list --consumed', 'abonamentele atașate sistemului.'],
          ['repos --list-enabled', 'repository-urile activate prin abonament.'],
          ['dnf repolist', 'repository-urile pe care le vede DNF acum; pe un sistem neînregistrat și fără repository-uri locale lista este goală sau conține avertismente.'],
          ['ls /etc/yum.repos.d/', 'fișierele .repo; redhat.repo este generat de subscription-manager.'],
        ]} />

        <h4>6.3 Înregistrarea (modifică starea; doar pe sistemul tău de test)</h4>
        <CodeBlock title="comenzi" code={`sudo subscription-manager register --username UTILIZATOR_RED_HAT\nsudo subscription-manager status\nsudo dnf repolist\n# alternativ:\nsudo rhc connect --username UTILIZATOR_RED_HAT\n# renunțare:\nsudo subscription-manager unregister`} explain={[
          ['register --username …', 'înregistrează sistemul în Red Hat Subscription Management cu contul tău; comanda îți cere parola interactiv (nu o pune niciodată în linia de comandă, unde ar ajunge în istoric). Opțiuni suplimentare (--org, --activationkey) se folosesc în organizații; vezi man subscription-manager.'],
          ['status / dnf repolist', 'confirmă că abonamentul este valid și că repository-urile sunt vizibile.'],
          ['rhc connect', 'comandă alternativă care înregistrează și conectează sistemul la serviciile Red Hat într-un singur pas; verifică opțiunile cu rhc --help pe sistemul tău.'],
          ['unregister', 'scoate sistemul din evidență și eliberează abonamentul (util când ștergi o VM de test).'],
        ]} />
        <Callout kind="warn" title="Atenție">
          Un sistem înregistrat consumă un abonament din contul tău. Dacă ștergi o VM de test, rulează întâi <code>unregister</code>; altfel rămâne înscrisă în cont până o elimini manual din portal. Condițiile programelor gratuite pentru dezvoltatori (număr de sisteme, tip de utilizare) se citesc pe paginile oficiale Red Hat; nu le presupune.
        </Callout>

        <h4>6.4 Actualizări și informații despre versiune</h4>
        <CodeBlock title="comenzi" code={`sudo dnf check-update\ndnf updateinfo summary\nrpm -qa --last | head -5\nrpm -q kernel\nsudo dnf list --installed 'kernel*'`} explain={[
          ['dnf check-update', 'listează pachetele pentru care există versiuni mai noi; cod de ieșire 100 dacă există actualizări, 0 dacă nu (L2.3).'],
          ['dnf updateinfo summary', 'rezumatul avizelor (securitate, bugfix) disponibile; poate cere repository-uri cu metadate de tip updateinfo.'],
          ['rpm -qa --last', 'pachetele instalate cel mai recent.'],
          ['rpm -q kernel', 'versiunile de nucleu instalate (poate fi mai multe; unul este cel în execuție).'],
        ]} />
        <p>Actualizarea efectivă (<code>dnf update</code>) și gestionarea pachetelor sunt în capitolul C2.</p>

        <h4>6.5 Pregătirea unui mediu de exercițiu sigur</h4>
        <Table head={['Variantă', 'Avantaje', 'Atenție']} rows={[
          [<b>RHEL 10 în VM, cu abonament de dezvoltator</b>, 'identică cu examenul; repository-uri oficiale', 'necesită cont Red Hat; verifică condițiile programului; dezînregistrează la ștergere'],
          [<b>Rocky Linux / AlmaLinux 10 în VM</b>, 'fără abonament; comenzi practic identice', 'nu este RHEL; verifică diferențele de nume și configurare'],
          [<b>CentOS Stream 10 în VM</b>, 'în amonte de RHEL; gratuit', 'se schimbă continuu; poate diferi de RHEL la un moment dat'],
          [<b>Pe hardware real, ca sistem principal</b>, '—', 'nu recomandat: laboratoarele modifică discuri, rețea și securitate'],
        ]} />
        <ul>
          <li>Folosește o <G id="virtual-machine">mașină virtuală</G> cu <b>instantaneu</b> (snapshot) înainte de laboratoarele care modifică discuri, rețea, SELinux sau bootloader-ul.</li>
          <li>Asigură-te că ai <b>acces la consolă</b> a VM-ului (nu doar SSH), ca să poți repara o configurare de rețea sau de firewall care te-a blocat.</li>
          <li>Dă VM-ului cel puțin un disc suplimentar gol (pentru C5/C6), 2 vCPU, 2–4 GiB RAM și o rețea cu acces la internet pentru înregistrare și actualizări.</li>
          <li>Platforma RHCSA Learn <b>nu creează și nu gestionează</b> VM-uri și nu se conectează la sistemul tău; tu rulezi comenzile manual.</li>
        </ul>
        <p>Cerințele exacte ale mediilor de virtualizare (VirtualBox, KVM, Hyper-V, VMware) depind de produs și nu fac obiectul acestui curs; urmează documentația produsului ales.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Identificare" kind="session" label="illustrative" code={`[student@server1 ~]$ cat /etc/redhat-release\nRed Hat Enterprise Linux release 10.0 (Coughlan)\n[student@server1 ~]$ cat /etc/os-release\nNAME="Red Hat Enterprise Linux"\nVERSION="10.0 (Coughlan)"\nID="rhel"\nID_LIKE="centos fedora"\nVERSION_ID="10.0"\nPLATFORM_ID="platform:el10"\nPRETTY_NAME="Red Hat Enterprise Linux 10.0 (Coughlan)"\n[student@server1 ~]$ uname -rm\n6.12.0-55.el10.x86_64 x86_64`} />
        <ul>
          <li><code>release 10.0</code>: versiunea majoră (10) și minoră (0). Numele de cod din paranteză este o etichetă a versiunii.</li>
          <li><code>ID="rhel"</code>: identificator pentru scripturi; <code>ID_LIKE</code> arată familia apropiată (valoarea exactă pe RHEL 10 trebuie confirmată). <code>VERSION_ID</code>: versiunea fără text. <code>PLATFORM_ID</code> identifică platforma pachetelor (<code>el10</code>).</li>
          <li><code>6.12.0-55.el10.x86_64</code>: nucleul 6.12, release-ul Red Hat 55, <code>el10</code> = Enterprise Linux 10, arhitectura. Numărul de release se schimbă la fiecare actualizare de nucleu.</li>
          <li>Toate valorile (minor, nume de cod, numărul de release) sunt exemplificative; pe un sistem real citește-le din fișierele respective.</li>
        </ul>

        <CodeBlock title="Sistem neînregistrat" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo subscription-manager identity\nThis system is not yet registered. Try 'subscription-manager register --help' for more information.\n[student@server1 ~]$ sudo subscription-manager status\n+-------------------------------------------+\n   System Status Details\n+-------------------------------------------+\nOverall Status: Not registered\n\nSystem Purpose Status: Not specified\n[student@server1 ~]$ dnf repolist\nThis system has no repositories available through subscriptions.`} />
        <ul>
          <li><b>identity</b> spune clar că sistemul nu este înregistrat.</li>
          <li><b>Overall Status</b>: starea abonamentului; „Not registered” înainte de înregistrare.</li>
          <li><code>dnf repolist</code> pe un sistem RHEL neînregistrat avertizează că nu există repository-uri prin abonament. Mesajele exacte (text, versiune) pot diferi între versiuni.</li>
        </ul>

        <CodeBlock title="Sistem înregistrat" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo subscription-manager status\n+-------------------------------------------+\n   System Status Details\n+-------------------------------------------+\nOverall Status: Current\n[student@server1 ~]$ sudo dnf repolist\nrepo id                          repo name\nrhel-10-for-x86_64-appstream-rpms Red Hat Enterprise Linux 10 for x86_64 - AppStream (RPMs)\nrhel-10-for-x86_64-baseos-rpms    Red Hat Enterprise Linux 10 for x86_64 - BaseOS (RPMs)`} />
        <ul>
          <li><b>Current</b> = abonament valid. În listă apar cele două repository-uri de bază, BaseOS și AppStream; formatul identificatorilor (<code>rhel-10-for-x86_64-…-rpms</code>) este analog cu cel de la RHEL 9 și trebuie confirmat pe RHEL 10.</li>
        </ul>

        <CodeBlock title="Virtualizare" kind="session" label="illustrative" code={`[student@server1 ~]$ systemd-detect-virt\nkvm\n[student@server1 ~]$ hostnamectl\n Static hostname: server1.example.com\n       Icon name: computer-vm\n         Chassis: vm\n Operating System: Red Hat Enterprise Linux 10.0 (Coughlan)\n          Kernel: Linux 6.12.0-55.el10.x86_64\n    Architecture: x86-64\n Hardware Vendor: QEMU\n  Hardware Model: Standard PC (Q35 + ICH9, 2009)\n Virtualization: kvm`} />
        <ul>
          <li><code>kvm</code>: hypervisorul detectat (alte valori: <code>oracle</code> pentru VirtualBox, <code>vmware</code>, <code>microsoft</code> pentru Hyper-V, <code>none</code> pe hardware).</li>
          <li><code>Chassis: vm</code> și <code>Virtualization: kvm</code>: sistemul este o VM. Câmpurile vendor/model depind de hypervisor.</li>
        </ul>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Ce rulează?</b> <code>cat /etc/redhat-release</code> și <code>rpm -q redhat-release</code>.</li>
            <li><b>Este înregistrat?</b> <code>sudo subscription-manager identity</code> și <code>status</code>.</li>
            <li><b>Are acces la pachete?</b> <code>dnf repolist</code> afișează cel puțin BaseOS și AppStream (sau repository-urile tale locale).</li>
            <li><b>Funcționează descărcarea?</b> <code>dnf info bash</code> (citește metadate, nu instalează nimic) sau <code>dnf check-update</code>.</li>
            <li><b>Este VM-ul sigur de folosit?</b> Ai un instantaneu recent, acces la consolă, disc suplimentar gol (<code>lsblk</code>) și conectivitate (<code>ip -br a</code>, <code>ping -c 2 ADRESĂ</code> dacă este permis).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <ul>
            <li>Înregistrarea este <b>persistentă</b>: identitatea sistemului și certificatele sunt stocate pe disc (în directoare de sistem, sub <code>/etc/pki</code> și <code>/var/lib/rhsm</code>) și supraviețuiesc reboot-ului. Nu trebuie reînregistrat.</li>
            <li>Configurația repository-urilor (<code>/etc/yum.repos.d/</code>) este persistentă.</li>
            <li>Dacă restaurezi un <b>instantaneu</b> mai vechi al VM-ului, starea înregistrării revine la cea din acel moment; dacă între timp ai șters sistemul din portal, înregistrarea locală rămâne cu o identitate invalidă. Rezolvare: <code>subscription-manager clean</code> urmat de o nouă înregistrare.</li>
            <li>Confirmare manuală: după reboot, <code>subscription-manager status</code> și <code>dnf repolist</code> dau același rezultat.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<><code>dnf</code>: „This system has no repositories available through subscriptions”</>, 'sistem RHEL neînregistrat', <code>subscription-manager identity</code>, <>înregistrează (<code>register</code>) sau configurează un repository local (L2.1)</>],
          [<>înregistrarea eșuează cu eroare de rețea sau de certificat</>, 'fără acces la internet sau la un proxy; ceas greșit', <><code>ping</code>, <code>date</code>, <code>timedatectl</code></>, 'repară rețeaua (C8) și sincronizează ceasul (L7.3)'],
          [<>„Invalid credentials” / autentificare eșuată</>, 'utilizator sau parolă greșite; contul necesită verificare', 'încearcă autentificarea pe portalul Red Hat', 'corectează datele; resetează parola pe portal'],
          [<>sistemul figurează în cont, dar local pare neînregistrat (după restaurarea unui snapshot)</>, 'discrepanță între identitatea locală și cea din portal', <code>subscription-manager identity</code>, <><code>subscription-manager clean</code>, apoi <code>register</code></>],
          [<>comenzile diferă de ce scrie în materiale RHEL</>, 'folosești o recompilare sau altă versiune', <><code>cat /etc/os-release</code></>, 'verifică versiunea; adaptează sau schimbă mediul'],
          [<>VM-ul nu pornește sau nu ai consolă după o modificare</>, 'configurare de rețea/boot greșită', 'consola hypervisor-ului', 'restaurează instantaneul'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confuzia între <b>Linux</b> (nucleul) și <b>distribuție</b>: „Linux” nu are manager de pachete; RHEL are DNF.</>,
          <>Presupunerea că o recompilare (Rocky, Alma) este identică în orice detaliu cu RHEL; la examen contează comportamentul RHEL.</>,
          <>Uitarea să dezînregistrezi o VM de test înainte să o ștergi.</>,
          <>Introducerea parolei contului Red Hat în linia de comandă (rămâne în istoric) sau în notițe/capturi de ecran.</>,
          <>Testarea laboratoarelor pe un sistem important, fără instantaneu și fără consolă.</>,
          <>Dezactivarea SELinux sau a firewall-ului „ca să meargă”: la examen valorile implicite de securitate trebuie păstrate (C8, C10).</>,
          <>Citirea unei versiuni vechi de documentație (RHEL 7, 8, 9) și aplicarea ei fără verificare pe RHEL 10.</>,
          <>Considerarea înregistrării ca obiectiv de examen: nu este în lista oficială; ce este oficial este instalarea și actualizarea pachetelor (C2).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: de ce versiunile pachetelor „nu se mișcă”, nucleul RHEL și confirmarea versiunilor">
        <p>
          <b>Backporting.</b> În RHEL, versiunea unui pachet (de exemplu <code>openssl 3.x</code>) rămâne aceeași pe durata versiunii majore; corecțiile de securitate sunt <i>portate</i> din versiuni mai noi în versiunea existentă și apar doar ca schimbare a release-ului (<code>-12.el10</code> → <code>-14.el10</code>). De aceea un scaner care vede „versiunea veche” nu înseamnă automat vulnerabilitate: istoricul de corecții se află în <code>rpm -q --changelog PACHET</code>.
        </p>
        <p>
          <b>Nucleul.</b> RHEL 10 livrează un nucleu din seria 6.12 (sursă: rezultate de căutare web din 2026-11-17; de confirmat cu uname -r pe sistemul tău), la care Red Hat adaugă corecții și funcții din versiuni mai noi; numărul din <code>uname -r</code> (ex. <code>6.12.0-55.el10</code>) nu este cel al unui nucleu „upstream” curat. <code>dnf update kernel</code> instalează un nucleu nou <i>alături</i> de cel vechi; poți reveni din GRUB la unul anterior (C7).
        </p>
        <p>
          <b>Modele de livrare.</b> Pe lângă instalarea clasică, Red Hat oferă și variante bazate pe imagini (image mode); acestea nu fac parte din obiectivele EX200 și nu sunt tratate în curs.
        </p>
        <p>
          <b>Confirmarea versiunilor.</b> Toate numerele de versiune din lecție (nucleu, pachete) sunt exemple. Sursa de adevăr este sistemul tău: <code>rpm -q PACHET</code>, <code>cat /etc/os-release</code>, iar pentru valori implicite, documentația RHEL 10 (docs.redhat.com) și <code>man</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const M0_1: TopicModule = {
  id: 'M0.1',
  subtitle: 'Linux vs distribuție, familia Red Hat, Fedora → CentOS Stream → RHEL, versiuni și ciclu de viață, abonamente, repository-uri, mediu de exercițiu sigur',
  studyTime: '≈75 min studiu + 2 laboratoare',
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
  labs: [LAB_M0_1A, LAB_M0_1B],
  sources: [
    { kind: 'doc', ref: 'Red Hat Enterprise Linux Life Cycle — access.redhat.com/support/policy/updates/errata (citit 2026-11-17: 5 ani Full + 5 ani Maintenance + Extended Life 4 ani; ELCP: 10.2, 10.4, 10.6, 10.8, 10.10)' },
    { kind: 'doc', ref: 'RHEL 10.0 — căutare web 2026-11-17: nucleu 6.12, prezentat la Red Hat Summit 2025; paginile docs.redhat.com (release notes, considerations in adopting RHEL 10) au dat HTTP 403, necitite' },
    { kind: 'man', ref: 'os-release(5) — man7.org, citit 2026-11-17' },
    { kind: 'man', ref: 'subscription-manager(8), rhc(8), uname(1), hostnamectl(1), systemd-detect-virt(1), dnf(8), rpm(8)' },
    { kind: 'upstream', ref: 'Red Hat Developer — developers.redhat.com/products/rhel/download (citit 2026-11-17; condițiile exacte ale abonamentului gratuit nu sunt stabilite pe pagina citită)' },
  ],
};
