import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L6_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un disc, o partiție sau un volum logic gol este doar o înșiruire de octeți. Ca să poți salva fișiere pe el, trebuie să scrii pe el un <G id="filesystem">sistem de fișiere</G> (<code>mkfs</code>), apoi să-l <b>atașezi</b> la arborele de directoare (<code>mount</code>) și, când ai terminat, să-l detașezi (<code>umount</code>). Pe examen lucrezi cu trei tipuri: <G id="xfs">XFS</G> (implicit pe RHEL), <G id="ext4">ext4</G> (clasicul Linux) și <G id="vfat">VFAT</G> (compatibil cu Windows, USB, partiția EFI).
          </p>
          <p>Obiectivul oficial: <i>„Create, mount, unmount, and use VFAT, ext4, and XFS file systems”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un disc vede doar <b>blocuri numerotate</b>: „citește blocul 5 000 000”, „scrie blocul 12”. Tu însă lucrezi cu <b>nume</b> (<code>/etc/passwd</code>), <b>directoare</b>, <b>permisiuni</b> și <b>date de modificare</b>. Cineva trebuie să traducă între cele două lumi: să țină o evidență a fișierelor, să știe care blocuri aparțin cărui fișier, care blocuri sunt libere și unde stă fiecare director. Acest „cineva” este <b>sistemul de fișiere</b>: un set de structuri de date scrise pe dispozitiv, plus codul din kernel care le înțelege.
          </p>
          <Analogy>
            Discul este un depozit uriaș cu rafturi numerotate. Sistemul de fișiere este <b>catalogul bibliotecii</b>: fișa fiecărei cărți (nume, autor, raftul unde se află). Fără catalog, cărțile sunt tot acolo, dar nu le mai poți găsi după titlu. Iar <code>mkfs</code> este momentul în care construiești un catalog <i>gol</i>, nou, pentru un depozit — de aceea șterge tot ce era înainte.
          </Analogy>
          <h4>De ce trei sisteme de fișiere diferite?</h4>
          <p>
            Pentru că nu există unul care să fie cel mai bun la toate. Fiecare a fost creat pentru alte nevoi, iar pe un sistem real le întâlnești pe toate trei:
          </p>
          <Table head={['', 'XFS', 'ext4', 'VFAT (FAT32)']} rows={[
            ['Rolul', 'sistemul de fișiere implicit în RHEL; creat pentru fișiere și volume mari', 'sistemul „clasic” Linux; folosit pe scară largă, foarte stabil', 'compatibilitate: stick-uri USB, carduri, partiția EFI'],
            ['Permisiuni Unix (rwx, proprietar, grup)', 'da', 'da', <b>nu</b>],
            ['Jurnal (journaling)', 'da (jurnal pe metadate)', 'da', 'nu'],
            ['Se poate mări cât timp e montat', 'da (xfs_growfs)', 'da (resize2fs)', 'nu cu instrumentele din acest curs'],
            ['Se poate micșora', <b>nu</b>, 'da, doar demontat (resize2fs)', 'nu'],
            ['Dimensiune maximă a unui fișier', 'foarte mare (ordinul exabyților)', 'foarte mare (ordinul terabyților)', 'sub 4 GiB'],
            ['Instrument de creare', <code>mkfs.xfs</code>, <code>mkfs.ext4</code>, <code>mkfs.vfat</code>],
            ['Eticheta (maximum)', '12 caractere', '16 octeți', '11 caractere'],
          ]} />
          <p className="small">Limitele de etichetă sunt din <code>mkfs.xfs(8)</code>, <code>mke2fs(8)</code> și <code>mkfs.fat(8)</code>. Limita de 4 GiB pe fișier la FAT32 este cunoștință generală, neverificată în sursă la redactare.</p>
          <h4>Ce s-ar întâmpla fără el?</h4>
          <p>
            Fără un sistem de fișiere, discul nu poate fi montat: <code>mount</code> răspunde <code>wrong fs type, bad option, bad superblock</code>. Aplicațiile ar trebui să scrie direct blocuri, ca o bază de date care își gestionează singură spațiul (există și asta, dar rar). Pentru un administrator, regula este simplă: <b>dispozitiv nou = mkfs + mount</b>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Ce scrie <code>mkfs</code> pe dispozitiv</h4>
          <p>
            <code>mkfs</code> nu „formatează” în sensul de a șterge tot octet cu octet (de obicei nici nu atinge cea mai mare parte din dispozitiv). El scrie doar <b>structurile de bază</b> ale sistemului de fișiere:
          </p>
          <ul>
            <li>un <b>superblock</b> — „cartea de identitate” a sistemului de fișiere: tip, dimensiune, dimensiunea blocului, <G id="uuid">UUID</G>, eticheta;</li>
            <li>o zonă de <b>inode-uri</b> (<G id="inode">inode</G>) — câte o „fișă” per fișier/director (proprietar, permisiuni, date, adresa blocurilor); numele fișierelor stau în directoare, nu în inode;</li>
            <li>o evidență a <b>blocurilor libere/ocupate</b> (bitmap sau arbori);</li>
            <li>un <G id="journaling">jurnal</G>, o zonă mică unde se notează modificările înainte de a fi aplicate;</li>
            <li>directorul rădăcină al noului sistem de fișiere.</li>
          </ul>
          <p>
            Fiecare tip își organizează aceste structuri diferit: <b>ext4</b> împarte discul în <i>block groups</i> (fiecare cu propriile inode-uri și bitmap-uri); <b>XFS</b> îl împarte în <i>allocation groups</i> (AG), pe care le poate gestiona <i>în paralel</i> — de aceea scalează bine pe discuri mari și cu mulți utilizatori; <b>FAT</b> folosește un tabel simplu (File Allocation Table) care leagă blocurile fiecărui fișier „în lanț”, fără inode-uri, fără permisiuni, fără jurnal.
          </p>

          <h4>2. Jurnalul (journaling) — de ce nu se strică datele la un curent întrerupt</h4>
          <p>
            Crearea unui fișier modifică mai multe locuri: inode-ul, directorul, evidența blocurilor. Dacă sistemul se oprește brusc între aceste scrieri, structurile rămân inconsistente. Soluția: se scrie <b>mai întâi în jurnal</b> „am de gând să fac X”; abia apoi se aplică X. La repornire, kernelul <b>reia</b> din jurnal ce a rămas neterminat, în câteva secunde, fără să scaneze tot discul. XFS și ext4 jurnalizează în principal <i>metadatele</i> (structura), nu conținutul fișierelor, ca să rămână rapide. FAT nu are jurnal: după o oprire bruscă poate cere o verificare (<code>fsck.fat</code>).
          </p>

          <h4>3. Ce face <code>mount</code>: arborele unic</h4>
          <p>
            Linux nu are litere de unitate (<code>C:</code>, <code>D:</code>). Există <b>un singur arbore de directoare</b>, care pornește din <code>/</code>. Un sistem de fișiere nou nu apare „singur”: îl <b>atașezi</b> la un director existent, numit <G id="mount-point">punct de montare</G>. De la acel moment, calea <code>/mnt/data</code> nu mai duce la directorul gol de pe sistemul rădăcină, ci la <b>rădăcina noului sistem de fișiere</b>.
          </p>
          <ol>
            <li>Comanda <code>mount</code> cere kernelului: „atașează sistemul de fișiere de pe <code>/dev/vdb1</code>, tip <code>xfs</code>, la <code>/mnt/data</code>”.</li>
            <li>Kernelul citește superblock-ul, verifică tipul și (la XFS/ext4) <b>reia jurnalul</b> dacă e nevoie.</li>
            <li>Straturile de sub kernel — VFS (Virtual File System) — leagă intrarea de director <code>/mnt/data</code> de noul sistem de fișiere. Orice program care citește <code>/mnt/data/fisier</code> trece acum prin driverul XFS/ext4/vfat, fără să știe diferența.</li>
            <li>Mount-ul este înregistrat în <code>/proc/self/mountinfo</code> (de acolo citesc <code>findmnt</code>, <code>df</code> și <code>mount</code> fără argumente).</li>
          </ol>
          <Callout kind="warn" title="Directorul de montare trebuie să existe și, de obicei, să fie gol">
            <code>mount</code> nu creează directorul. Dacă punctul de montare conține fișiere, acestea <b>nu sunt șterse</b>, ci doar <b>acoperite</b> cât timp sistemul de fișiere este montat; reapar după <code>umount</code>. Este o sursă clasică de „unde mi-au dispărut fișierele?”.
          </Callout>

          <h4>4. Ce face <code>umount</code> și de ce poate fi „busy”</h4>
          <p>
            <code>umount</code> scrie pe disc tot ce mai era în memorie (cache), apoi detașează sistemul de fișiere. Nu poate face asta cât timp <b>cineva îl folosește</b>: un fișier deschis, un proces al cărui director curent este în el, sau un fișier swap. Atunci primești <code>target is busy</code> — vezi secțiunea de troubleshooting.
          </p>

          <h4>5. Cum află <code>mount</code> tipul sistemului de fișiere</h4>
          <p>
            Fără <code>-t</code>, <code>mount</code> citește <b>semnătura</b> din superblock (aceeași informație pe care o afișează <code>blkid</code>) și alege driverul potrivit. Cu <code>-t xfs</code> îl obligi să încerce XFS: dacă dispozitivul nu e XFS, primești <code>wrong fs type</code>.
          </p>

          <h4>6. Permisiunile pe FAT: de ce nu merge <code>chmod</code></h4>
          <p>
            FAT nu are câmpuri pentru proprietar, grup sau <code>rwx</code>. Pentru ca Linux să poată totuși aplica regulile sale, driverul <code>vfat</code> <b>inventează</b> aceste valori <i>la montare</i>, din opțiuni: <code>uid=</code>, <code>gid=</code> și <code>umask=</code> (sau <code>fmask=</code>/<code>dmask=</code>). După montare, toate fișierele par să aibă același proprietar și aceleași permisiuni. <code>chmod</code> și <code>chown</code> nu au efect (eroare <code>Operation not permitted</code>); ca să schimbi permisiunile, remontezi cu alte opțiuni.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Partiții și LVM (C5, L5.1–L5.4):</b> <code>mkfs</code> se aplică pe un <G id="block-device">block device</G>: <code>/dev/vdb1</code> (partiție) sau <code>/dev/datavg/data</code> (volum logic). Ordinea completă este: disc → partiție → (PV → VG → LV) → <b>mkfs</b> → <b>mount</b>.</li>
            <li><b>/etc/fstab (L5.5):</b> <code>mount</code> manual dispare la reboot. Montarea persistentă este o linie în <G id="fstab">/etc/fstab</G>, de obicei cu <code>UUID=</code>, pe care o produce <code>mkfs</code> (afișat de <code>blkid</code>).</li>
            <li><b>Extinderea (L6.2):</b> <code>xfs_growfs</code> și <code>resize2fs</code> operează pe sistemul de fișiere creat aici.</li>
            <li><b>Permisiuni (L1.8, L6.5):</b> permisiunile sunt stocate de XFS/ext4 în inode; la VFAT sunt simulate din opțiunile de montare.</li>
            <li><b>SELinux (C10):</b> contextul SELinux este un atribut extins stocat pe disc de XFS/ext4. VFAT nu suportă atribute extinse, deci contextul se dă la montare (opțiunea <code>context=</code>) — doar menționat aici.</li>
            <li><b>Boot (C4, C7):</b> partiția EFI (<code>/boot/efi</code>) este <b>VFAT</b>, deoarece firmware-ul UEFI știe să citească doar FAT. Aceasta este explicația pentru care întâlnești VFAT chiar și pe un server care nu are nimic de-a face cu Windows.</li>
            <li><b>Rețea (L6.3):</b> NFS este tot un „sistem de fișiere”, dar atașat prin rețea, nu de pe un dispozitiv local; se montează cu aceeași comandă <code>mount</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li><b>XFS</b> — alegerea implicită pe RHEL: baze de date, directoare de aplicații, volume mari. Dacă enunțul de examen nu cere un tip anume, XFS este tipul „sigur”.</li>
            <li><b>ext4</b> — când enunțul îl cere explicit, când ai nevoie să <i>micșorezi</i> volumul mai târziu, sau pe sisteme vechi/aplicații care îl cer.</li>
            <li><b>VFAT</b> — schimb de fișiere cu Windows/macOS (stick USB), carduri de memorie, partiția EFI. Nu pentru date care au nevoie de permisiuni Unix.</li>
            <li><b>Scenariu de examen:</b> „creează o partiție/un LV de 400 MiB, formatează-l ext4, cu eticheta <code>backup</code>, montează-l persistent pe <code>/backup</code>”. Acest curs combină <code>mkfs.ext4 -L backup</code> + <code>mkdir</code> + linia din fstab (L5.5) + <code>mount -a</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le doar pe o mașină de test, pe un dispozitiv <b>gol</b> pe care îl poți pierde. Output-urile de mai jos sunt <b>Ilustrative</b> (valori fictive, nerulate pe RHEL 10). <code>mkfs</code> distruge fără avertisment ce era pe dispozitiv: confirmă numele cu <code>lsblk</code> înainte.
        </Callout>

        <h4>1. Identifică dispozitivul: <code>lsblk -f</code>, <code>blkid</code></h4>
        <CodeBlock title="comenzi" code={`lsblk -f\nlsblk -f /dev/vdb\nsudo blkid\nsudo blkid /dev/vdb1`} explain={[
          ['lsblk', 'listează dispozitivele de tip bloc sub formă de arbore (disc → partiții → LV-uri).'],
          ['-f', '--fs: adaugă coloanele FSTYPE (tipul sistemului de fișiere), LABEL, UUID, FSAVAIL, FSUSE% și MOUNTPOINTS. Coloana FSTYPE goală = dispozitivul nu are sistem de fișiere.'],
          ['/dev/vdb', 'limitează afișarea la un singur disc și descendenții lui.'],
          ['blkid', 'citește superblock-ul fiecărui dispozitiv și afișează UUID, LABEL și TYPE. Necesită root pentru rezultate complete.'],
        ]} />

        <h4>2. Creează sistemul de fișiere: <code>mkfs.xfs</code>, <code>mkfs.ext4</code>, <code>mkfs.vfat</code></h4>
        <CodeBlock title="comenzi" code={`sudo mkfs.xfs /dev/vdb1\nsudo mkfs.xfs -L datexfs /dev/vdb1\nsudo mkfs.xfs -f -L datexfs /dev/vdb1\n\nsudo mkfs.ext4 /dev/vdb2\nsudo mkfs.ext4 -L datae4 /dev/vdb2\nsudo mkfs -t ext4 -L datae4 /dev/vdb2\n\nsudo mkfs.vfat /dev/vdb3\nsudo mkfs.vfat -F 32 -n USBDATE /dev/vdb3`} explain={[
          ['mkfs.xfs DISPOZITIV', 'creează un sistem de fișiere XFS. Dacă pe dispozitiv a fost detectat deja un sistem de fișiere sau o tabelă de partiții, mkfs.xfs refuză și cere -f.'],
          ['-L datexfs', '--label: eticheta sistemului de fișiere. La XFS, maximum 12 caractere; una mai lungă oprește comanda. Eticheta se poate folosi în fstab (LABEL=datexfs).'],
          ['-f', 'force: suprascrie un sistem de fișiere existent. Foarte periculos; folosește-l numai când ești sigur de dispozitiv.'],
          ['mkfs.ext4', 'creează un sistem de fișiere ext4 (echivalent cu mke2fs -t ext4). Valorile implicite (jurnal, dimensiunea blocului, funcționalități) vin din /etc/mke2fs.conf.'],
          ['-L datae4', 'eticheta ext4; maximum 16 octeți.'],
          ['mkfs -t ext4', 'forma generală: mkfs apelează mkfs.TIP. Rezultat identic cu mkfs.ext4.'],
          ['mkfs.vfat', 'creează FAT (nume alternativ pentru mkfs.fat; pachetul dosfstools). Fără opțiuni alege singur FAT12/16/32 după dimensiune.'],
          ['-F 32', 'forțează FAT pe 32 de biți (valorile permise: 12, 16, 32).'],
          ['-n USBDATE', 'eticheta (volume name) FAT; maximum 11 caractere.'],
        ]} />
        <Callout kind="tip" title="De ce nu pune mkfs.xfs întrebări?">
          Spre deosebire de unele unelte, <code>mkfs.xfs</code> nu cere confirmare: dacă dispozitivul pare liber, creează imediat sistemul de fișiere; dacă pare folosit, refuză și îți cere <code>-f</code>. Refuzul este protecția ta: citește mesajul înainte să adaugi <code>-f</code>.
        </Callout>

        <h4>3. Montează: <code>mkdir</code>, <code>mount</code></h4>
        <CodeBlock title="comenzi" code={`sudo mkdir -p /mnt/date\nsudo mount /dev/vdb1 /mnt/date\nsudo mount -t xfs /dev/vdb1 /mnt/date\nsudo mount -t ext4 -o ro /dev/vdb2 /mnt/date\nsudo mount -L datexfs /mnt/date\nsudo mount -U 3f5b8c1e-0d2a-4b7e-9a31-6c2e4f8d1a90 /mnt/date\nsudo mount -t vfat -o uid=1000,gid=1000,fmask=133,dmask=022 /dev/vdb3 /mnt/usb`} explain={[
          ['mkdir -p /mnt/date', 'creează punctul de montare (-p: creează și părinții, fără eroare dacă există).'],
          ['mount DISPOZITIV DIRECTOR', 'forma de bază: atașează dispozitivul la director; tipul este detectat automat.'],
          ['-t xfs', '--types: specifică tipul. Util când detectarea eșuează sau vrei să te asiguri că e tipul așteptat.'],
          ['-o ro', '--options: listă de opțiuni separate prin virgulă. ro = read-only (rw = citire-scriere, implicit). Opțiunile ulterioare le înlocuiesc pe cele conflictuale.'],
          ['-L datexfs', 'selectează dispozitivul după etichetă, nu după nume (numele /dev/vdb1 se poate schimba între reboot-uri).'],
          ['-U UUID', 'selectează după UUID: cel mai stabil mod de a-l identifica.'],
          ['uid=1000,gid=1000,fmask=133,dmask=022', 'opțiuni VFAT: proprietarul și grupul aparente ale tuturor fișierelor, plus două măști (biții pe care îi ȘTERGI din 777, ca la umask — L1.8). fmask=133 se aplică fișierelor (777 → 644), dmask=022 directoarelor (777 → 755). Un umask= unic ar da fișierelor modul 755, adică „executabile”, fiindcă FAT nu distinge fișierele de programe.'],
        ]} />

        <h4>4. Verifică și folosește: <code>df</code>, <code>findmnt</code>, <code>mount</code></h4>
        <CodeBlock title="comenzi" code={`df -hT /mnt/date\nfindmnt /mnt/date\nfindmnt -t xfs,ext4,vfat\nmount | grep /mnt/date\nlsblk -f /dev/vdb\n\necho "salut" | sudo tee /mnt/date/test.txt\nls -l /mnt/date`} explain={[
          ['df -hT', 'df raportează spațiul; -h = human readable (KiB/MiB/GiB), -T = afișează tipul sistemului de fișiere.'],
          ['findmnt PUNCT', 'afișează sursa, tipul și opțiunile efective ale unei montări; fără argument afișează tot arborele de montări.'],
          ['findmnt -t xfs,ext4,vfat', 'filtrează după tipul sistemului de fișiere (-t = --types).'],
          ['mount | grep …', 'fără argumente, mount listează toate montările; grep le filtrează.'],
          ['tee', 'scrie atât pe ecran, cât și în fișier; sudo tee este varianta clasică pentru a scrie într-un loc protejat (redirecționarea > se face de shell-ul tău, nu de sudo).'],
        ]} />

        <h4>5. Demontează: <code>umount</code></h4>
        <CodeBlock title="comenzi" code={`sudo umount /mnt/date\nsudo umount /dev/vdb1\ncd / && sudo umount /mnt/date\nsudo umount -l /mnt/date`} explain={[
          ['umount DIRECTOR', 'detașează sistemul de fișiere montat la acel director. Se poate da și dispozitivul.'],
          ['cd /', 'dacă shell-ul tău are directorul curent în sistemul de fișiere, umount spune „target is busy”; mută-te în afară.'],
          ['-l', '--lazy: detașează acum, iar curățenia se face când nu mai e folosit. Soluție de ultimă instanță; rămân procese care încă folosesc fișierele. Pe sisteme de fișiere de rețea poate cere reboot curând (umount(8)).'],
        ]} />
        <p className="small">Numele comenzii este <code>umount</code> (fără „n”): o greșeală de scriere clasică este <code>unmount</code>.</p>

        <h4>6. Inspectează sau modifică proprietățile unui sistem de fișiere</h4>
        <CodeBlock title="comenzi" code={`sudo xfs_info /mnt/date\nsudo xfs_admin -L nouxfs /dev/vdb1\nsudo tune2fs -l /dev/vdb2\nsudo e2label /dev/vdb2 nou_e4\nsudo fatlabel /dev/vdb3 NOUFAT\nsudo wipefs -a /dev/vdb1`} explain={[
          ['xfs_info', 'afișează geometria unui XFS montat (blocuri, allocation groups, jurnal). Argumentul este punctul de montare.'],
          ['xfs_admin -L eticheta', 'schimbă eticheta unui XFS DEMONTAT (cere dispozitivul).'],
          ['tune2fs -l', 'afișează superblock-ul ext2/3/4: UUID, etichetă, număr de inode-uri, funcționalități.'],
          ['e2label dispozitiv [eticheta]', 'afișează sau schimbă eticheta ext4.'],
          ['fatlabel dispozitiv [eticheta]', 'afișează sau schimbă eticheta FAT (pachetul dosfstools).'],
          ['wipefs -a', 'șterge semnăturile de sistem de fișiere de pe dispozitiv (-a = all). Distructiv; folosit ca să „uiți” un sistem de fișiere vechi înainte de mkfs.'],
        ]} />
        <p className="small">Aceste utilitare (<code>xfs_admin</code>, <code>e2label</code>, <code>fatlabel</code>, <code>wipefs</code>) sunt prezentate din documentația upstream/cunoștințe generale; opțiunile lor nu au fost recitite în sesiunea de cercetare.</p>

        <h4>7. Verifică și repară (doar când ai o problemă)</h4>
        <CodeBlock title="comenzi" code={`sudo umount /mnt/date\nsudo xfs_repair /dev/vdb1\nsudo fsck.ext4 -f /dev/vdb2\nsudo fsck.fat -a /dev/vdb3`} explain={[
          ['xfs_repair', 'repară un XFS DEMONTAT. Nu folosi fsck pe XFS: la pornire, pentru XFS, fsck nu face nimic (jurnalul este reluat la mount).'],
          ['fsck.ext4 -f', 'verifică un ext4 demontat; -f forțează verificarea chiar dacă sistemul pare curat.'],
          ['fsck.fat -a', 'repară automat inconsecvențele FAT.'],
        ]} />

        <h4>Fișierul care face montarea persistentă: <code>/etc/fstab</code></h4>
        <CodeBlock title="/etc/fstab (extras, Ilustrativ)" kind="config" code={`UUID=3f5b8c1e-0d2a-4b7e-9a31-6c2e4f8d1a90  /mnt/date  xfs   defaults            0 0\nUUID=8a1c9e7d-55b2-4e90-8d3f-0b7a3c6e2f14  /backup    ext4  defaults            0 0\nUUID=4B2D-91AE                             /mnt/usb   vfat  uid=1000,fmask=133,dmask=022  0 0`} explain={[
          ['UUID=…', 'dispozitivul identificat prin UUID (valoarea din blkid). La VFAT, UUID-ul are format scurt (ex. 4B2D-91AE).'],
          ['/mnt/date', 'punctul de montare (directorul trebuie să existe).'],
          ['xfs / ext4 / vfat', 'tipul sistemului de fișiere.'],
          ['defaults', 'rw, suid, dev, exec, auto, nouser, async (mount(8)).'],
          ['uid=1000,fmask=133,dmask=022', 'opțiuni specifice VFAT pentru proprietar și permisiunile aparente (fișiere 644, directoare 755).'],
          ['0 0', 'câmpurile dump și fsck pass; la sistemele de fișiere moderne, 0 0 este uzual (vezi L5.5).'],
        ]} />
        <p className="small">După editarea fstab, testează fără reboot: <code>sudo mount -a</code> (montează tot ce e în fstab și nu e deja montat) și <code>findmnt --verify</code>. Detalii în L5.5.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="lsblk -f" kind="session" label="illustrative" code={`[student@server1 ~]$ lsblk -f /dev/vdb\nNAME   FSTYPE FSVER LABEL    UUID                                 FSAVAIL FSUSE% MOUNTPOINTS\nvdb\n├─vdb1 xfs          datexfs  3f5b8c1e-0d2a-4b7e-9a31-6c2e4f8d1a90  917.2M     4% /mnt/date\n├─vdb2 ext4   1.0   datae4   8a1c9e7d-55b2-4e90-8d3f-0b7a3c6e2f14\n└─vdb3 vfat   FAT32 USBDATE  4B2D-91AE`} />
        <p className="small">
          <code>NAME</code> = discul și partițiile lui. <code>FSTYPE</code> = tipul sistemului de fișiere (<b>gol</b> = nu există). <code>LABEL</code>/<code>UUID</code> = identificatorii de folosit în fstab. <code>FSAVAIL</code>/<code>FSUSE%</code>/<code>MOUNTPOINTS</code> apar numai pentru ce este montat: <code>vdb1</code> este montat pe <code>/mnt/date</code>, celelalte două nu. Coloana exactă de versiune (<code>FSVER</code>) depinde de versiunea util-linux; la XFS poate fi goală.
        </p>

        <CodeBlock title="mkfs.xfs" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo mkfs.xfs -L datexfs /dev/vdb1\nmeta-data=/dev/vdb1       isize=512    agcount=4, agsize=65536 blks\n         =                sectsz=512   attr=2, projid32bit=1\n         =                crc=1        finobt=1, sparse=1, rmapbt=0\n         =                reflink=1    bigtime=1 inobtcount=1\ndata     =                bsize=4096   blocks=262144, imaxpct=25\n         =                sunit=0      swidth=0 blks\nnaming   =version 2       bsize=4096   ascii-ci=0, ftype=1\nlog      =internal log    bsize=4096   blocks=16384, version=2\n         =                sectsz=512   sunit=0 blks, lazy-count=1\nrealtime =none            extsz=4096   blocks=0, rtextents=0`} />
        <p className="small">
          Rezumatul geometriei create (câmpuri așa cum le explică <code>mkfs.xfs(8)</code>): <code>isize</code> = dimensiunea inode-ului; <code>agcount</code> = numărul de allocation groups, scalat automat după dimensiunea dispozitivului, iar <code>agsize</code> = dimensiunea fiecăruia în blocuri; <code>crc=1</code> = sumele de control pe metadate (activate implicit; formatul V4 fără CRC este deprecat); <code>finobt</code>, <code>reflink</code> = funcționalități active implicit odată cu CRC-urile; <code>bsize=4096</code> = blocul de 4 KiB (implicit); <code>blocks=262144</code> × 4096 = 1 GiB; <code>log … internal</code> = jurnalul este în interiorul sistemului de fișiere; <code>lazy-count=1</code> = contoare „leneșe”. Valorile concrete diferă în funcție de dimensiune și de versiunea <code>xfsprogs</code>.
        </p>

        <CodeBlock title="df -hT" kind="session" label="illustrative" code={`[student@server1 ~]$ df -hT /mnt/date /mnt/usb\nFilesystem     Type  Size  Used Avail Use% Mounted on\n/dev/vdb1      xfs   960M   43M  917M   5% /mnt/date\n/dev/vdb3      vfat  200M  4.0K  200M   1% /mnt/usb`} />
        <p className="small">
          <code>Size</code> este mai mică decât dispozitivul (aici 1 GiB): o parte din spațiu este ocupată de structurile sistemului de fișiere (jurnal, metadate). <code>Use%</code> și <code>Avail</code> se referă la datele din sistemul de fișiere, nu la discul întreg.
        </p>

        <CodeBlock title="findmnt" kind="session" label="illustrative" code={`[student@server1 ~]$ findmnt /mnt/date\nTARGET    SOURCE     FSTYPE OPTIONS\n/mnt/date /dev/vdb1  xfs    rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota`} />
        <p className="small">
          <code>TARGET</code> = punctul de montare; <code>SOURCE</code> = dispozitivul; <code>FSTYPE</code> = tipul; <code>OPTIONS</code> = opțiunile <b>efective</b>, nu doar cele cerute de tine: <code>rw</code> = citire-scriere; <code>relatime</code> = timpul de acces se actualizează doar când este mai vechi decât cel de modificare (mount(8)); <code>seclabel</code> = sistemul de fișiere suportă etichete SELinux; restul sunt valorile implicite ale driverului XFS (liste exacte variază pe versiuni).
        </p>

        <CodeBlock title="umount — target is busy" kind="session" label="illustrative" code={`[student@server1 mnt/date]$ sudo umount /mnt/date\numount: /mnt/date: target is busy.`} />
        <p className="small">
          Mesajul spune că ceva folosește sistemul de fișiere. În acest exemplu, shell-ul are directorul curent în <code>/mnt/date</code>. Ieși din director (<code>cd</code>) și încearcă din nou.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>S-a creat sistemul de fișiere:</b> <code>lsblk -f</code> arată tipul în <code>FSTYPE</code>; <code>sudo blkid /dev/vdb1</code> afișează <code>TYPE="xfs"</code> și eventual <code>LABEL</code>.</li>
            <li><b>Este montat:</b> <code>findmnt /mnt/date</code> afișează o linie; <code>df -hT /mnt/date</code> arată tipul și dimensiunea corectă (nu pe cea a sistemului rădăcină!). Dacă <code>df /mnt/date</code> arată <code>/dev/mapper/rhel-root</code>, nu ai montat nimic acolo.</li>
            <li><b>Se poate scrie:</b> <code>touch /mnt/date/test</code> (pe un XFS/ext4 nou, directorul rădăcină aparține lui <code>root</code>: folosește <code>sudo</code> sau schimbă proprietarul cu <code>chown</code>).</li>
            <li><b>Opțiunile sunt cele cerute:</b> <code>findmnt -o TARGET,FSTYPE,OPTIONS /mnt/usb</code> pentru <code>ro</code>, <code>uid=…</code>, <code>umask=…</code>.</li>
            <li><b>După umount:</b> <code>findmnt /mnt/date</code> nu afișează nimic; <code>ls /mnt/date</code> arată directorul gol original.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <b>mkfs persistă</b> (structurile sunt scrise pe disc). <b>mount nu persistă</b>: este o stare a kernelului, ștearsă la reboot. Pentru ca montarea să reapară singură, adaugi o linie în <code>/etc/fstab</code> (L5.5), de preferat cu <code>UUID=</code> sau <code>LABEL=</code>, apoi o testezi fără reboot:
          </p>
          <CodeBlock title="test fstab" kind="session" code={`sudo umount /mnt/date\nsudo mount -a\nfindmnt /mnt/date`} explain={[
            ['umount /mnt/date', 'demontează ca să poți simula „la pornire”.'],
            ['mount -a', 'montează toate liniile din fstab care nu sunt deja montate și nu au noauto. O eroare de sintaxă apare acum, nu la reboot.'],
            ['findmnt /mnt/date', 'confirmă că linia ta a funcționat.'],
          ]} />
          <p>
            Confirmare finală, manuală: <code>sudo reboot</code>, apoi <code>findmnt /mnt/date</code>. Dacă nu o poți face pe examen, <code>mount -a</code> fără erori este testul acceptat. <b>O linie greșită în fstab poate duce sistemul în emergency mode la boot</b>: testează întotdeauna cu <code>mount -a</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>wrong fs type, bad option, bad superblock</code>, 'dispozitivul nu are sistem de fișiere sau tipul din -t nu coincide', <><code>lsblk -f</code>, <code>blkid</code></>, <>formatează (<code>mkfs.…</code>) sau folosește tipul corect</>],
          [<code>mount point does not exist</code>, 'directorul de montare lipsește', <code>ls -ld /mnt/date</code>, <code>mkdir -p /mnt/date</code>],
          [<code>special device … does not exist</code>, 'nume de dispozitiv greșit (sau disc absent)', <code>lsblk</code>, 'corectează calea; verifică pe lsblk'],
          [<code>mkfs.xfs: … appears to contain an existing filesystem</code>, 'dispozitivul are deja un sistem de fișiere/partiții', <><code>blkid</code>, <code>lsblk -f</code></>, <>dacă ești sigur că poți pierde datele: <code>-f</code> (XFS), <code>-F</code> (ext4) sau <code>wipefs -a</code></>],
          [<code>umount: target is busy</code>, 'fișier deschis, shell în director sau serviciu', <><code>cd /</code>, <code>sudo lsof +D /mnt/date</code>, <code>sudo fuser -vm /mnt/date</code></>, 'închide procesele sau ieși din director; -l doar în ultimă instanță'],
          [<code>can't find in /etc/fstab</code>, 'umount/mount după punct, dar linia lipsește', <code>cat /etc/fstab</code>, 'dă dispozitivul explicit sau adaugă linia'],
          [<><code>Permission denied</code> la scriere pe XFS/ext4 nou</>, 'rădăcina noului sistem de fișiere aparține lui root', <code>ls -ld /mnt/date</code>, <><code>chown</code>/<code>chmod</code> pe punctul de montare (după mount!)</>],
          [<><code>Operation not permitted</code> la chmod/chown pe VFAT</>, 'FAT nu are permisiuni Unix', <code>findmnt -o OPTIONS</code>, <>remontează cu <code>-o uid=,gid=,fmask=,dmask=</code></>],
          [<code>Read-only file system</code>, 'montat cu ro, sau remontat ro după erori', <code>findmnt -o OPTIONS</code>, <><code>mount -o remount,rw /mnt/date</code> sau repară sistemul de fișiere</>],
          [<><code>No space left on device</code> deși <code>df</code> arată loc</>, 'inode-uri epuizate (ext4)', <code>df -i</code>, 'șterge fișiere mici sau recreează cu mai multe inode-uri (-N/-i)'],
          ['Fișierele au „dispărut” după mount', 'punctul de montare conținea fișiere (acoperite)', <><code>umount</code>, <code>ls</code></>, 'normal; folosește un punct de montare gol'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Formatezi dispozitivul greșit (<code>/dev/vda</code> în loc de <code>/dev/vdb1</code>) și distrugi sistemul. Verifică întotdeauna cu <code>lsblk</code> și cu dimensiunea dispozitivului.</>,
          <>Uiți <code>mkfs</code> și apoi te miri de <code>wrong fs type</code>.</>,
          <>Uiți <code>mkdir</code> pentru punctul de montare.</>,
          <>Scrii <code>unmount</code> în loc de <code>umount</code>.</>,
          <>Montezi doar cu <code>mount</code> și crezi că „e gata”: la reboot dispare. Enunțul spune „persistent”? Atunci fstab + <code>mount -a</code>.</>,
          <>Etichete prea lungi: peste 12 caractere la XFS, 16 la ext4, 11 la FAT.</>,
          <>Încerci <code>chmod</code>/<code>chown</code> pe VFAT: permisiunile se dau la montare (<code>uid</code>, <code>gid</code>, <code>fmask</code>/<code>dmask</code>/<code>umask</code>).</>,
          <>Folosești <code>fsck</code> pe un XFS (se folosește <code>xfs_repair</code>) sau rulezi <code>xfs_repair</code> pe un sistem montat.</>,
          <>Crezi că un XFS se poate micșora: nu se poate (L6.2).</>,
          <>Pui în fstab <code>/dev/vdb1</code> în loc de UUID; numele de dispozitiv se poate schimba.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: tipuri de dispozitive, jurnal, blocuri și inode-uri">
        <p>
          <b>Blocul</b> este unitatea de alocare a sistemului de fișiere (implicit 4096 B la XFS; ext4 alege de obicei tot 4 KiB). Un fișier de 1 B ocupă un bloc întreg, deci multe fișiere foarte mici consumă mult mai mult decât suma octeților lor. <b>Inode-ul</b> este fișa fișierului; ext4 își stabilește numărul de inode-uri <i>la creare</i> (<code>-N</code>, <code>-i</code> din mke2fs; nu se mai schimbă), așa că se poate epuiza (<code>df -i</code>) chiar dacă mai e loc pe disc. XFS alocă inode-uri dinamic, în limita <code>imaxpct</code> (procent maxim din sistemul de fișiere pentru inode-uri; implicit 25% sub 1 TB).
        </p>
        <p>
          <b>Blocuri rezervate la ext4:</b> implicit 5% din spațiu este rezervat superutilizatorului (<code>-m</code> din mke2fs): un utilizator obișnuit poate primi „No space left” când <code>df</code> mai arată câteva procente libere. Se poate reduce cu <code>tune2fs -m 1</code>.
        </p>
        <p>
          <b>De ce ext4 poate fi micșorat, dar XFS nu:</b> micșorarea cere mutarea datelor din blocurile care dispar și rescrierea evidențelor. ext4 are această logică în <code>resize2fs</code> (doar demontat); XFS ar trebui să mute chiar și metadatele din allocation groups, iar <code>xfs_growfs(8)</code> descrie doar o micșorare limitată, a ultimului AG, în condiții particulare. În practică, un XFS se mărește, nu se micșorează: dacă ai nevoie de unul mai mic, creezi altul, copiezi datele și ștergi vechiul.
        </p>
        <p>
          <b>XFS V4 vs V5:</b> <code>mkfs.xfs</code> creează implicit formatul V5 (<code>crc=1</code>); V4 (<code>crc=0</code>) este deprecat. V5 adaugă sume de control pe metadate (detecția corupției) și funcționalități ca <code>reflink</code> și <code>finobt</code>.
        </p>
        <p>
          <b>Montare după nume de dispozitiv, etichetă sau UUID:</b> numele <code>/dev/vdb</code>/<code>/dev/sdb</code> sunt date de kernel în ordinea detectării și se pot schimba când adaugi un disc. Eticheta o alegi tu (dar poate fi duplicată, iar la XFS se schimbă cu <code>xfs_admin</code> doar demontat). UUID-ul este generat la <code>mkfs</code> și este practic unic. De aceea fstab folosește UUID.
        </p>
      </DeepDive>
    </>
  );
}

export const L6_1: TopicModule = {
  id: 'L6.1',
  subtitle: 'mkfs.xfs / mkfs.ext4 / mkfs.vfat, mount, umount, findmnt, df -hT, blkid, opțiuni VFAT',
  studyTime: '≈110 min studiu + laborator',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când o folosim', code: '5' },
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
  labs: [LAB_L6_1],
  sources: [
    { kind: 'man', ref: 'mkfs.xfs(8), mkfs.fat(8), mke2fs(8), mount(8), umount(8), resize2fs(8) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'lsblk(8), blkid(8), findmnt(8), df(1), xfs_info(8), xfs_admin(8), tune2fs(8), fsck(8) — din cunoștințe, nerecitite' },
    { kind: 'doc', ref: 'RHEL 10 — „Managing file systems”: Get started with XFS / ext4, Mounting file systems (storage-getting_started_with_xfs, storage-creating_an_xfs_file_system, storage-getting_started_with_an_ext4_file_system, storage-mounting_file_systems), docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
