import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L6_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un volum logic se extinde în <b>două</b> straturi, pentru că există două „lumi” separate: <code>lvextend</code> mărește <i>containerul</i> (LV-ul), iar <code>xfs_growfs</code> (XFS) sau <code>resize2fs</code> (ext4) mărește <i>conținutul</i> (<G id="filesystem">sistemul de fișiere</G>). Opțiunea <code>-r</code> a lui <code>lvextend</code> le face pe amândouă într-o singură comandă, <b>fără demontare</b>: <code>lvextend -L +500M -r /dev/datavg/data</code>. Dacă grupul de volume nu mai are spațiu liber, îl extinzi întâi cu un PV nou (<code>pvcreate</code> + <code>vgextend</code>).
          </p>
          <p>Obiectivul oficial: <i>„Extend existing logical volumes”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un volum se umple. Un server de baze de date primește mai multe date decât s-a estimat, <code>/var/log</code> crește, o aplicație cere mai mult spațiu. Fără LVM, cu partiții clasice, ai două soluții proaste: să cumperi un disc nou și să muți datele (oprire de servicii) sau să repartiționezi (risc de pierdere de date). LVM există tocmai ca să poți spune: „vreau 2 GiB în plus pentru <code>/data</code>”, și să se întâmple <b>în timp ce sistemul rulează</b>.
          </p>
          <Analogy>
            Un LV este o cutie de depozitare, iar sistemul de fișiere este organizarea din interior (rafturile, etichetele). Dacă muți depozitul într-o cutie mai mare (<code>lvextend</code>), rafturile rămân aceleași: trebuie să le <b>reorganizezi</b> ca să folosești noul spațiu (<code>xfs_growfs</code>). Fără al doilea pas, ai cutie mare și rafturi mici: <code>lvs</code> arată o dimensiune, <code>df</code> alta.
          </Analogy>
          <h4>Cele trei straturi pe care le atingi</h4>
          <Table head={['Strat', 'Ce se mărește', 'Comandă', 'Se vede cu']} rows={[
            ['VG (grup)', 'spațiul liber disponibil în grup (VFree)', <><code>pvcreate</code> + <code>vgextend</code> (L5.2, L5.3)</>, <code>vgs</code>],
            ['LV (volum logic)', 'dimensiunea containerului', <code>lvextend</code>, <><code>lvs</code>, <code>lsblk</code></>],
            ['Sistem de fișiere', 'spațiul utilizabil de aplicații', <><code>xfs_growfs</code> / <code>resize2fs</code> (sau <code>lvextend -r</code>)</>, <code>df -h</code>],
          ]} />
          <p>
            Pentru examen, important este să recunoști în ce strat te afli: dacă <code>lvs</code> arată 1 GiB dar <code>df</code> arată tot 500 MiB, pasul lipsă este al treilea.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Ce face <code>lvextend</code></h4>
          <ol>
            <li>Citește metadatele grupului: câte <G id="extent">extents</G> libere sunt (<code>VFree</code>).</li>
            <li>Alege extents libere (implicit pe PV-urile deja folosite de LV, apoi pe altele) și le adaugă LV-ului ca un nou <i>segment</i>. Poți indica PV-ul dorit: <code>lvextend -L +54M vg01/lvol10 /dev/sdk3</code> (exemplu din <code>lvextend(8)</code>).</li>
            <li>Scrie metadatele noi pe PV-uri (în zona de metadate, L5.2).</li>
            <li>Reîncarcă tabela <G id="device-mapper">device-mapper</G> a LV-ului <b>fără să-l oprească</b>: dispozitivul <code>/dev/datavg/data</code> devine mai mare, cât timp este montat și folosit. De aceea extinderea este „online”.</li>
          </ol>
          <p>
            În acest moment, kernelul vede un dispozitiv mai mare, dar sistemul de fișiere de pe el <b>nu știe</b> că are spațiu în plus: superblock-ul lui încă spune „am 512 MiB”.
          </p>

          <h4>2. Ce face <code>xfs_growfs</code></h4>
          <p>
            XFS împarte sistemul de fișiere în <i>allocation groups</i> (AG). <code>xfs_growfs</code> citește dimensiunea noului dispozitiv, <b>adaugă AG-uri noi</b> la sfârșit, actualizează superblock-ul și evidența spațiului liber. Datele existente nu se mută. Cerințe din <code>xfs_growfs(8)</code>: sistemul de fișiere trebuie să fie <b>montat</b>; argumentul este <b>punctul de montare</b> (sau dispozitivul unui XFS montat). Opțiunea <code>-n</code> este „dry run”: arată geometria rezultată fără să mărească nimic.
          </p>

          <h4>3. Ce face <code>resize2fs</code></h4>
          <p>
            ext4 are grupurile lui de blocuri. <code>resize2fs</code> adaugă noi grupuri de blocuri și (dacă există) „blocuri GDT rezervate” îi permit creșterea online. Conform <code>resize2fs(8)</code>: poate <b>extinde un ext3/ext4 montat</b> dacă nucleul și sistemul de fișiere permit; <b>micșorarea cere demontare</b>; argumentul este <b>dispozitivul</b>, nu punctul de montare; fără argumentul de dimensiune folosește tot dispozitivul (deci după <code>lvextend</code> este suficient <code>resize2fs /dev/datavg/data</code>).
          </p>

          <h4>4. Ce face <code>lvextend -r</code></h4>
          <p>
            <code>-r</code> (<code>--resizefs</code>) cheamă <code>fsadm(8)</code> după extinderea LV-ului; <code>fsadm</code> detectează tipul sistemului de fișiere și apelează instrumentul potrivit (<code>xfs_growfs</code> pentru XFS, <code>resize2fs</code> pentru ext4). De aceea <code>-r</code> funcționează pentru ambele tipuri fără să le cunoști în avans și este calea recomandată. Dacă sistemul de fișiere nu este suportat de <code>fsadm</code>, comanda îți spune și rămâi cu pasul manual.
          </p>

          <h4>5. Sintaxa dimensiunii: „până la” versus „cu încă”</h4>
          <Table head={['Formă', 'Înțeles', 'Exemplu → rezultat (LV de 500 MiB)']} rows={[
            [<code>-L +300M</code>, 'adaugă 300 MiB la dimensiunea curentă', 'rezultat: 800 MiB'],
            [<code>-L 800M</code>, 'dimensiunea FINALĂ este 800 MiB', 'rezultat: 800 MiB'],
            [<code>-l +50</code>, 'adaugă 50 de extents (de 4 MiB: 200 MiB)', 'rezultat: 700 MiB'],
            [<code>-l +100%FREE</code>, 'adaugă tot spațiul liber din VG', 'LV-ul ocupă tot ce era liber'],
            [<code>-l 80%VG</code>, 'dimensiunea finală = 80% din dimensiunea VG', 'poate eșua dacă este mai mic decât cel actual'],
          ]} />
          <Callout kind="warn" title="Citește enunțul: „extinde CU 300 MiB” sau „extinde LA 800 MiB”?">
            <code>-L +300M</code> și <code>-L 800M</code> dau același rezultat <i>doar</i> pe un LV de 500 MiB. Pe un LV de 700 MiB, <code>-L +300M</code> dă 1000 MiB, iar <code>-L 800M</code> dă 800 MiB. Pe examen, o confuzie între „cu” și „la” înseamnă un volum cu dimensiunea greșită.
          </Callout>
          <p>
            <b>Rotunjirea la extent:</b> dimensiunea se rotunjește la un multiplu de extent (4 MiB implicit), deci rezultatul poate diferi cu câțiva MiB de cel cerut. Procentele (<code>%FREE</code>, <code>%VG</code>) sunt, conform <code>lvextend(8)</code>, o limită superioară; numărul final de extents se stabilește la finalul comenzii.
          </p>

          <h4>6. Cazul „VG-ul nu mai are loc”</h4>
          <p>
            <code>lvextend</code> nu poate crea spațiu: îl ia din <code>VFree</code>. Dacă acesta este prea mic, apare <code>Insufficient free space</code>. Soluția: aduci un disc/partiție nou(ă): <code>pvcreate /dev/vdc1</code>, <code>vgextend datavg /dev/vdc1</code> (L5.2/L5.3), apoi <code>lvextend</code>. Toți acești pași se fac online.
          </p>

          <h4>7. Ce NU facem aici: micșorarea</h4>
          <p>
            Obiectivul cere <i>extinderea</i>. Micșorarea (<code>lvreduce</code>, <code>lvresize -L</code> la o valoare mai mică) este riscantă: dacă micșorezi LV-ul <i>înainte</i> să micșorezi sistemul de fișiere, tai datele. Pe XFS nu este posibilă cu instrumentele standard; pe ext4 cere demontare și <code>e2fsck</code>/<code>resize2fs</code> în ordinea corectă. Pentru examen: extinzi, nu micșorezi.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>LVM (L5.2–L5.4):</b> extinderea folosește <G id="vg-free">VFree</G> al VG; ținem minte lanțul PV → VG → LV.</li>
            <li><b>Sisteme de fișiere (L6.1):</b> <code>xfs_growfs</code> este din pachetul <code>xfsprogs</code>, <code>resize2fs</code> din <code>e2fsprogs</code>. Un LV formatat VFAT nu se extinde cu aceste unelte.</li>
            <li><b>fstab (L5.5):</b> fstab folosește UUID; extinderea nu schimbă UUID-ul, deci nu trebuie să modifici fstab.</li>
            <li><b>Swap (L5.6):</b> un LV de swap se extinde altfel: <code>swapoff</code>, <code>lvextend</code>, <code>mkswap</code>, <code>swapon</code> (nu <code>-r</code>).</li>
            <li><b>Discuri virtuale mărite (L5.6, Deep dive):</b> dacă mărești un disc în VM, partiția și PV-ul trebuie să crească la rândul lor (<code>pvresize</code>); aici ne rezumăm la spațiul deja din VG.</li>
            <li><b>Permisiuni, ACL, SELinux:</b> nu se schimbă; fișierele rămân neatinse.</li>
            <li><b>Monitorizare:</b> <code>df -h</code> și <code>vgs</code> sunt primele comenzi când o aplicație raportează „No space left on device”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Alerta „<code>/var</code> la 95%”: extinzi online, fără oprirea serviciilor.</li>
            <li>Ai alocat prea puțin la început și enunțul de examen cere „extend the logical volume to X MiB and make sure the file system is resized as well”.</li>
            <li>Ai atașat un disc nou: <code>pvcreate</code> → <code>vgextend</code> → <code>lvextend -r</code>.</li>
            <li>Vrei să folosești tot spațiul liber al grupului pentru un singur volum: <code>lvextend -l +100%FREE -r</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test, cu un LV care conține date de test. Output-urile sunt <b>Ilustrative</b> (nerulate pe RHEL 10); numele, dimensiunile și UUID-urile sunt fictive.
        </Callout>

        <h4>1. Pornești cu o evaluare: ce are VG-ul, ce are LV-ul, ce are sistemul de fișiere</h4>
        <CodeBlock title="comenzi" code={`sudo vgs datavg\nsudo lvs datavg\ndf -hT /data\nsudo lsblk /dev/vdb`} explain={[
          ['vgs datavg', 'sumar al grupului: VSize (total), VFree (liber). VFree este bugetul pentru extindere.'],
          ['lvs datavg', 'volumele logice și dimensiunea lor (LSize).'],
          ['df -hT /data', 'dimensiunea sistemului de fișiere și tipul (xfs/ext4), ca să știi ce instrument folosești.'],
          ['lsblk', 'vezi LV-ul sub PV-uri, cu dimensiunea.'],
        ]} />

        <h4>2. Dacă VG-ul nu are loc: adaugă un PV</h4>
        <CodeBlock title="comenzi" code={`sudo pvcreate /dev/vdc1\nsudo vgextend datavg /dev/vdc1\nsudo vgs datavg`} explain={[
          ['pvcreate /dev/vdc1', 'pregătește partiția ca volum fizic (scrie eticheta și metadatele LVM).'],
          ['vgextend datavg /dev/vdc1', 'adaugă PV-ul în grup; VFree crește cu spațiul lui.'],
          ['vgs', 'confirmă noul VFree.'],
        ]} />

        <h4>3. Metoda recomandată: <code>lvextend -r</code></h4>
        <CodeBlock title="comenzi" code={`sudo lvextend -L +300M -r /dev/datavg/data\nsudo lvextend -L 1G -r /dev/datavg/data\nsudo lvextend -l +100%FREE -r /dev/datavg/data\nsudo lvextend -l +50 -r datavg/data`} explain={[
          ['lvextend', 'extinde un volum logic existent (nu creează unul nou).'],
          ['-L +300M', '--size cu + = adaugă 300 MiB la dimensiunea curentă.'],
          ['-L 1G', 'fără +: dimensiunea FINALĂ este 1 GiB. Eroare dacă este ≤ dimensiunea curentă.'],
          ['-l +100%FREE', '--extents cu procent: adaugă tot spațiul liber din VG (procentul este o limită superioară).'],
          ['-l +50', 'adaugă 50 de extents (50 × 4 MiB = 200 MiB).'],
          ['-r', '--resizefs: după LV, redimensionează sistemul de fișiere (prin fsadm: xfs_growfs sau resize2fs).'],
          ['/dev/datavg/data  sau  datavg/data', 'LV-ul; ambele forme sunt acceptate.'],
        ]} />

        <h4>4. Metoda în doi pași (utilă când nu ai -r sau când vrei să vezi fiecare pas)</h4>
        <CodeBlock title="XFS" code={`sudo lvextend -L +300M /dev/datavg/data\nsudo xfs_growfs -n /data\nsudo xfs_growfs /data\ndf -h /data`} explain={[
          ['lvextend -L +300M', 'mărește doar LV-ul; df arată încă dimensiunea veche.'],
          ['xfs_growfs -n /data', '-n = dry run: afișează geometria nouă, nu modifică nimic. Argumentul este punctul de montare.'],
          ['xfs_growfs /data', 'mărește sistemul de fișiere până la dimensiunea dispozitivului (online, necesită montat).'],
          ['df -h', 'confirmă dimensiunea nouă.'],
        ]} />
        <CodeBlock title="ext4" code={`sudo lvextend -L +300M /dev/datavg/data\nsudo resize2fs /dev/datavg/data\ndf -h /data`} explain={[
          ['resize2fs DISPOZITIV', 'mărește ext4 până la dimensiunea dispozitivului; fără argument de dimensiune umple tot dispozitivul; merge online la ext4 montat.'],
          ['-p', '(opțional) afișează progresul la redimensionarea offline.'],
        ]} />
        <Callout kind="tip" title="Cum alegi între xfs_growfs și resize2fs">
          Tipul îl citești din <code>df -T</code>, <code>lsblk -f</code> sau <code>findmnt</code>. XFS → <code>xfs_growfs PUNCT_DE_MONTARE</code>. ext4 → <code>resize2fs DISPOZITIV</code>. Greșeala frecventă: <code>resize2fs</code> pe un XFS (eroare) sau <code>xfs_growfs /dev/…</code> pe un dispozitiv nemontat.
        </Callout>

        <h4>5. Verifică dimensiunile pe fiecare strat</h4>
        <CodeBlock title="comenzi" code={`sudo lvs -o lv_name,lv_size,vg_name datavg\ndf -h /data\nsudo xfs_info /data\nsudo dumpe2fs -h /dev/datavg/data`} explain={[
          ['lvs -o …', '-o alege coloanele: nume, dimensiune, grup.'],
          ['df -h', 'dimensiunea sistemului de fișiere (ce vede aplicația).'],
          ['xfs_info', 'geometria XFS: blocks=… × bsize = dimensiunea totală.'],
          ['dumpe2fs -h', 'antetul superblock-ului ext4: „Block count” și „Block size”.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="extindere cu -r" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo lvextend -L +300M -r /dev/datavg/data\n  Size of logical volume datavg/data changed from 512.00 MiB (128 extents) to 812.00 MiB (203 extents).\n  Logical volume datavg/data successfully resized.\nmeta-data=/dev/mapper/datavg-data isize=512    agcount=4, agsize=32768 blks\n...\ndata blocks changed from 131072 to 207872`} />
        <p className="small">
          Prima linie: dimensiunea LV-ului și numărul de extents înainte/după (aici +75 de extents; 300 MiB ÷ 4 MiB; rezultatul poate fi rotunjit). A doua: LVM confirmă schimbarea. Liniile următoare vin de la <code>xfs_growfs</code> (apelat de <code>fsadm</code>): vechea geometrie, apoi <code>data blocks changed from … to …</code> (blocuri de 4096 B: 207872 × 4096 ≈ 812 MiB). Formularea exactă variază între versiuni.
        </p>

        <CodeBlock title="lvs și df — înainte și după pasul 2" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo lvextend -L +300M /dev/datavg/data    # fără -r\n  Logical volume datavg/data successfully resized.\n[student@server1 ~]$ sudo lvs datavg\n  LV   VG     Attr       LSize\n  data datavg -wi-ao---- 812.00m\n[student@server1 ~]$ df -h /data\nFilesystem                Size  Used Avail Use% Mounted on\n/dev/mapper/datavg-data   495M   18M  477M   4% /data`} />
        <p className="small">
          <code>lvs</code> arată <b>812 MiB</b>, dar <code>df</code> arată tot <b>≈495 MiB</b>: containerul a crescut, sistemul de fișiere nu. Pasul lipsă este <code>xfs_growfs /data</code> (sau <code>resize2fs</code>). Aceasta este eroarea cea mai frecventă din acest capitol.
        </p>

        <CodeBlock title="xfs_growfs -n (dry run)" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo xfs_growfs -n /data\nmeta-data=/dev/mapper/datavg-data isize=512    agcount=4, agsize=32768 blks\n         =                       sectsz=512   attr=2, projid32bit=1\ndata     =                       bsize=4096   blocks=131072, imaxpct=25\n...\ndata blocks changed from 131072 to 207872`} />
        <p className="small">
          Cu <code>-n</code>, <code>xfs_growfs</code> își verifică argumentele și arată geometria nouă, dar nu modifică nimic. Linia <code>blocks=131072</code> este dimensiunea <i>curentă</i> (≈512 MiB); linia finală spune la ce valoare ar ajunge.
        </p>

        <CodeBlock title="eroare: spațiu insuficient în VG" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo lvextend -L +5G -r /dev/datavg/data\n  Insufficient free space: 1280 extents needed, but only 410 available`} />
        <p className="small">
          Cererea (5 GiB = 1280 extents) depășește <code>VFree</code> (410 extents ≈ 1,6 GiB). Remediere: <code>vgs</code>, apoi <code>vgextend</code> cu un PV nou sau o cerere mai mică. Textul exact diferă între versiuni.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>LV mai mare:</b> <code>sudo lvs datavg</code> arată noul <code>LSize</code>.</li>
            <li><b>Sistem de fișiere mai mare:</b> <code>df -h /data</code> arată noua dimensiune (puțin sub <code>LSize</code>, din cauza structurilor interne).</li>
            <li><b>Rămâne montat și accesibil:</b> <code>findmnt /data</code> și <code>ls /data</code>: fișierele au rămas.</li>
            <li><b>Spațiul s-a scăzut din VG:</b> <code>sudo vgs datavg</code>: <code>VFree</code> a scăzut cu cât ai cerut (rotunjit la extent).</li>
            <li><b>Datele nu au fost atinse:</b> un fișier de test scris înainte este încă citibil (sumă de control: <code>sha256sum</code> înainte și după).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Extinderea este <b>permanentă</b>: metadatele LVM sunt pe PV-uri, iar noua dimensiune a sistemului de fișiere este scrisă în superblock. Nu modifici <code>/etc/fstab</code> (UUID-ul nu s-a schimbat) și nu ai nimic de „salvat”. Confirmare manuală: după <code>sudo reboot</code>, <code>df -h /data</code> arată aceeași dimensiune mărită. Singura excepție: dacă ai extins doar LV-ul și ai uitat sistemul de fișiere, după reboot tot mic rămâne — de aceea faci ambii pași în aceeași sesiune.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Insufficient free space</code>, 'cerere > VFree', <code>vgs</code>, <>cere mai puțin sau <code>pvcreate</code> + <code>vgextend</code></>],
          ['LV mărit, dar df arată dimensiunea veche', 'sistemul de fișiere nu a fost extins', <><code>lvs</code> vs <code>df -h</code></>, <><code>xfs_growfs PUNCT</code> / <code>resize2fs DISPOZITIV</code> sau reia cu <code>-r</code></>],
          [<code>xfs_growfs: /dev/… is not a mounted XFS filesystem</code>, 'ai dat dispozitivul unui XFS nemontat, sau punctul nu e XFS', <code>findmnt</code>, <>montează; dă punctul de montare; verifică tipul cu <code>df -T</code></>],
          [<code>resize2fs: Bad magic number in super-block</code>, 'ai rulat resize2fs pe un sistem care nu este ext2/3/4 (de obicei XFS)', <code>lsblk -f</code>, <><code>xfs_growfs</code> pentru XFS</>],
          [<code>New size given … not larger than existing size</code>, '-L fără + cu valoare ≤ dimensiunea curentă', <code>lvs</code>, <>folosește <code>-L +</code> sau o valoare mai mare</>],
          [<><code>Please run e2fsck -f</code> / „Filesystem is mounted” (la micșorare)</>, 'ai încercat micșorarea unui ext4 montat', <code>findmnt</code>, <>nu face parte din obiectiv; micșorarea cere demontare și <code>e2fsck</code></>],
          [<><code>fsadm</code>: tip neacceptat la <code>-r</code></>, 'tip neacceptat (de exemplu VFAT)', <code>lsblk -f</code>, 'extinde manual sau recreează volumul'],
          ['Dimensiune diferită de cea cerută', 'rotunjire la extent / diferențe MiB–MB', <code>lvs --units m</code>, 'normal; folosește multipli de 4 MiB dacă vrei dimensiuni exacte'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Extinzi LV-ul și uiți sistemul de fișiere: <code>lvs</code> este mare, <code>df</code> mic. Soluția: <code>-r</code> de la început.</>,
          <>Confunzi „cu” și „la”: <code>-L +300M</code> (adaugă) versus <code>-L 800M</code> (dimensiune finală).</>,
          <>Dai <code>xfs_growfs</code> cu dispozitivul unui sistem de fișiere nemontat, sau <code>resize2fs</code> cu punct de montare.</>,
          <>Încerci să micșorezi un XFS (nu se poate) sau micșorezi LV-ul înainte de sistemul de fișiere (pierzi date).</>,
          <>Uiți <code>vgextend</code> când VG-ul este plin: <code>lvextend</code> nu poate crea spațiu.</>,
          <>Folosești <code>lvextend -L +1G</code> cu <code>-l</code> în același timp (opțiuni exclusive).</>,
          <>Demontezi sau repornești în mijlocul extinderii: nu e necesar și crește riscul.</>,
          <>Nu verifici sfârșitul lucrului cu <code>df -h</code> și crezi că a mers pe baza lui <code>lvs</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: de ce poate XFS doar să crească, resize2fs online și ordinea la micșorare">
        <p>
          <b>XFS nu se micșorează:</b> datele și metadatele sunt răspândite în toate allocation groups; să elimini un AG ar însemna să muți tot ce conține. <code>xfs_growfs(8)</code> descrie doar o micșorare limitată (doar ultimul AG, în anumite condiții) pentru <code>-D</code>; pentru utilizatorii obișnuiți, XFS este „numai de mărit”. Dacă ai nevoie de un volum mai mic: creezi unul nou, copiezi cu <code>rsync</code> sau <code>xfsdump</code>/<code>xfsrestore</code>, ștergi vechiul.
        </p>
        <p>
          <b>Micșorarea unui ext4 (informativ):</b> ordinea este inversă extinderii: demontezi, <code>e2fsck -f</code>, <code>resize2fs</code> la noua dimensiune, apoi <code>lvreduce</code> (sau <code>lvresize -r</code> face totul). Dacă inversezi ordinea, LV-ul devine mai mic decât sistemul de fișiere și datele de la sfârșit sunt tăiate. Nu intră în obiectivul de examen.
        </p>
        <p>
          <b>Online resize ext4:</b> la <code>mkfs.ext4</code> se rezervă „blocuri GDT” care permit creșterea ulterioară (în documentația upstream, până la de ordinul a 1024 de ori dimensiunea inițială; cifră necitită în sesiune); <code>resize2fs</code> le folosește pentru extindere online. Dacă rapoartele de dimensiune nu cresc, verifică <code>dumpe2fs -h</code> pentru <code>Reserved GDT blocks</code> (câmp din antet).
        </p>
        <p>
          <b>LV pe mai multe PV-uri:</b> <code>lvextend</code> poate adăuga extents de pe alt PV; LV-ul devine o concatenare de segmente. <code>lvs -o +devices</code> arată de pe ce PV-uri provine. Dacă pierzi un PV, pierzi (parțial) LV-ul: un motiv pentru RAID sau backup, dar în afara acestui curs.
        </p>
        <p>
          <b>lvresize versus lvextend:</b> <code>lvresize</code> poate și extinde, și micșora (<code>lvresize -L +1G -r</code> funcționează). <code>lvextend</code> refuză să micșoreze: este varianta mai sigură pentru examen.
        </p>
      </DeepDive>
    </>
  );
}

export const L6_2: TopicModule = {
  id: 'L6.2',
  subtitle: 'lvextend (-L, -l, -r), xfs_growfs, resize2fs, vgextend, extindere online',
  studyTime: '≈100 min studiu + laborator',
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
  labs: [LAB_L6_2],
  sources: [
    { kind: 'man', ref: 'lvextend(8), xfs_growfs(8), resize2fs(8) — man7.org, citite 2026-11-16' },
    { kind: 'man', ref: 'lvresize(8), fsadm(8), vgextend(8), pvcreate(8), xfs_info(8), dumpe2fs(8) — din cunoștințe, nerecitite' },
    { kind: 'doc', ref: 'RHEL 10 — „Configure and manage logical volumes”: Resizing logical volumes (storage-resizing_logical_volumes) și „Increasing the size of an XFS file system” (storage-increasing_the_size_of_an_xfs_file_system), docs.redhat.com necitit (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
