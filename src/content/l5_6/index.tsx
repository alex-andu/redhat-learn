import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L5_6 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Obiectivul: adaugi spațiu sistemului <G id="non-destructive">fără a distruge ce există</G>. Pentru partiții noi folosești spațiul nealocat (<code>parted … print free</code>, <code>mkpart</code>), pentru LV-uri extinzi cu <code>lvextend -L +1G -r</code> (după <code>vgextend</code> dacă VG-ul e plin), iar pentru <G id="swap">swap</G> folosești <code>mkswap</code>, <code>swapon</code> și o linie <code>none swap</code> în <code>/etc/fstab</code>.
          </p>
          <p>Obiectivul oficial: <i>„Add new partitions and logical volumes, and swap to a system non-destructively”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un server de producție nu poate fi oprit și reinstalat de fiecare dată când un volum se umple. Administratorul adaugă un disc, mărește un volum sau un swap, iar serviciile rămân pornite. „Non-destructiv” înseamnă că nu rulezi comenzi care șterg sau recreează (<code>mklabel</code>, <code>mkfs</code> pe un volum existent, <code>pvcreate -f</code>) ci doar comenzi care <i>adaugă</i> sau <i>extind</i>.
          </p>
          <p>
            Despre swap: când procesele cer mai multă memorie decât există RAM, kernelul mută pe disc paginile rar folosite. Fără swap, același vârf de consum duce la „OOM killer”, care oprește procese. Swap nu înlocuiește RAM-ul (discul este mult mai lent), dar este plasa de siguranță.
          </p>
          <Analogy>Un depozit se umple. Nu demolezi depozitul ca să construiești unul mai mare (distructiv): adaugi o hală alăturată (partiție/PV nou) și muți pereții (lvextend). Swap este parcarea temporară de lângă depozit pentru marfa rar folosită.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Cele trei căi de adăugare de spațiu</h4>
          <Table head={['Vrei…', 'Pași', 'Lecție']} rows={[
            ['o partiție nouă', <><code>print free</code> → <code>mkpart</code> în spațiul liber → <code>partprobe</code></>, 'L5.1'],
            ['un LV nou', <><code>vgs</code> (VFree) → <code>lvcreate</code> → <code>mkfs</code> → mount/fstab</>, 'L5.4, L5.5'],
            ['mai mult spațiu pentru un LV', <><code>vgextend</code> (dacă VG plin) → <code>lvextend -r</code></>, 'L5.3, aici'],
            ['swap', <><code>mkswap</code> → <code>swapon</code> → fstab</>, 'aici'],
          ]} />
          <h4>Cum extinzi un LV în siguranță</h4>
          <ol>
            <li>Verifici spațiul liber: <code>vgs</code> (VFree).</li>
            <li>Dacă nu ajunge: pregătești un PV nou și faci <code>vgextend</code>.</li>
            <li><code>lvextend</code> mărește LV-ul (extents noi în metadate).</li>
            <li>Sistemul de fișiere nu știe de mărire; îl extinzi: <code>xfs_growfs MONTARE</code> (XFS) sau <code>resize2fs DISPOZITIV</code> (ext4). Opțiunea <code>-r</code> a lui <code>lvextend</code> face ambii pași.</li>
          </ol>
          <p>
            XFS poate fi <b>mărit</b> cât timp este montat, dar nu poate fi micșorat deloc. ext4 se mărește online și se micșorează doar demontat. Micșorarea nu face parte din acest obiectiv (și este riscantă).
          </p>
          <h4>Cum funcționează swap-ul</h4>
          <ul>
            <li><b>mkswap</b> scrie o semnătură (<code>SWAPSPACE2</code>), dimensiunea și un UUID în primele pagini ale spațiului.</li>
            <li><b>swapon</b> spune kernelului să-l folosească; apare în <code>/proc/swaps</code>.</li>
            <li>Mai multe spații swap au <b>prioritate</b> (<code>pri=</code> în fstab). Cele cu prioritate mare se folosesc primele; la egalitate, alternativ.</li>
            <li>Tipuri: partiție, volum logic sau fișier (<code>dd</code> + <code>chmod 600</code> + <code>mkswap</code>). Fișierul trebuie să aibă permisiuni <code>600</code> și să nu aibă „găuri”.</li>
            <li>În fstab, swap are punct de montare <code>none</code> și tip <code>swap</code>.</li>
          </ul>
          <h4>Cât swap?</h4>
          <p>
            Nu există o regulă unică; examenul cere de obicei o dimensiune dată în enunț. Ghidurile Red Hat recomandă valori în funcție de RAM și de cazul de utilizare (de exemplu hibernare); detaliile pentru RHEL 10 nu au fost citite și rămân de confirmat.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>L5.1–L5.5</b>: toate procedurile de aici folosesc comenzile din lecțiile anterioare.</li>
            <li><b>C6 (sisteme de fișiere)</b>: <code>xfs_growfs</code>, <code>resize2fs</code>.</li>
            <li><b>systemd</b>: fiecare swap din fstab devine o unitate <code>.swap</code> (<code>systemctl status dev-vdb2.swap</code>).</li>
            <li><b>Boot</b>: fstab trebuie să fie corect, altfel emergency mode (L5.5).</li>
            <li><b>tuned</b> (L4.6): profilurile pot regla <code>vm.swappiness</code>; menționat.</li>
            <li><b>Monitorizare</b>: <code>free</code>, <code>top</code> (L4.4), <code>vmstat</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Un volum se umple: <code>df -h</code> arată 100%; extinzi LV-ul.</li>
            <li>Sistemul rămâne fără memorie: adaugi swap.</li>
            <li>Primești un disc nou și îl integrezi (<code>pvcreate</code>, <code>vgextend</code>).</li>
            <li>La examen: „add a 512 MiB swap partition that persists across reboots” sau „extend the logical volume to 800 MiB without losing data”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Adaugă o partiție în spațiu liber</h4>
        <CodeBlock title="comenzi" code={`sudo parted /dev/vdb print free\nsudo parted /dev/vdb mkpart swap1 2147MB 3221MB\nsudo parted /dev/vdb set 2 swap on\nsudo partprobe /dev/vdb\nlsblk /dev/vdb`} explain={[
          ['print free', 'arată și intervalele libere; alegi începutul în spațiul liber.'],
          ['mkpart NUME START SFÂRȘIT', 'creează partiția fără a atinge cele existente.'],
          ['set 2 swap on', 'setează tipul „Linux swap” (opțional).'],
          ['partprobe', 'kernelul recitește tabela.'],
        ]} />
        <Callout kind="warn" title="Nu rula mklabel">
          <code>mklabel gpt</code> pe un disc cu date șterge tabela de partiții. Pentru adăugare folosești doar <code>mkpart</code>.
        </Callout>

        <h4>2. Swap pe partiție: <code>mkswap</code>, <code>swapon</code>, <code>swapoff</code></h4>
        <CodeBlock title="comenzi" code={`sudo mkswap /dev/vdb2\nsudo swapon /dev/vdb2\nswapon --show\nfree -h\ncat /proc/swaps\nsudo swapoff /dev/vdb2`} explain={[
          ['mkswap /dev/vdb2', 'pregătește spațiul; afișează UUID-ul. Distruge conținutul anterior al partiției.'],
          ['swapon /dev/vdb2', 'activează acum.'],
          ['swapon --show', 'listează swap-urile active: NAME, TYPE, SIZE, USED, PRIO.'],
          ['free -h', 'RAM și swap (total, used, free), -h = format uman.'],
          ['/proc/swaps', 'lista brută a kernelului.'],
          ['swapoff', 'dezactivează; paginile din el sunt mutate înapoi în RAM (trebuie să încapă).'],
        ]} />

        <h4>3. Swap pe fișier</h4>
        <CodeBlock title="comenzi" code={`sudo dd if=/dev/zero of=/swapfile bs=1M count=512\nsudo chmod 600 /swapfile\nsudo mkswap /swapfile\nsudo swapon /swapfile`} explain={[
          ['dd if=/dev/zero of=/swapfile bs=1M count=512', 'creează un fișier de 512 × 1 MiB, plin de zerouri (if = input, of = output, bs = block size, count = număr de blocuri).'],
          ['chmod 600', 'doar root îl poate citi/scrie (altfel swapon avertizează de permisiuni nesigure).'],
          ['mkswap /swapfile', 'pregătește fișierul.'],
          ['swapon /swapfile', 'îl activează.'],
        ]} />

        <h4>4. Persistență în /etc/fstab</h4>
        <CodeBlock title="/etc/fstab" kind="config" code={`UUID=5f6e7d8c-9b0a-4c1d-8e2f-3a4b5c6d7e8f  none  swap  defaults  0 0\n/swapfile                                   none  swap  defaults  0 0\n/dev/datavg/swap2                           none  swap  defaults,pri=10  0 0`} explain={[
          ['UUID=… none swap defaults 0 0', 'swap pe partiție, identificat prin UUID (din mkswap/blkid).'],
          ['/swapfile none swap …', 'swap pe fișier: calea fișierului.'],
          ['none', 'swap nu se montează într-un director.'],
          ['swap', 'tipul.'],
          ['pri=10', 'prioritate (cu cât mai mare, cu atât mai devreme se folosește).'],
        ]} />
        <CodeBlock title="comenzi" code={`sudo systemctl daemon-reload\nsudo swapon -a\nswapon --show\nsudo findmnt --verify`} explain={[
          ['swapon -a', 'activează toate swap-urile din fstab (și nu face nimic pentru cele active).'],
          ['findmnt --verify', 'verifică fstab.'],
        ]} />

        <h4>5. Extinde un LV: <code>vgextend</code>, <code>lvextend</code></h4>
        <CodeBlock title="comenzi" code={`sudo vgs datavg\nsudo pvcreate /dev/vdc1\nsudo vgextend datavg /dev/vdc1\nsudo lvextend -L +256M /dev/datavg/data\nsudo lvextend -L +256M -r /dev/datavg/data\nsudo lvextend -l +100%FREE -r /dev/datavg/data\nsudo xfs_growfs /data\nsudo resize2fs /dev/datavg/data`} explain={[
          ['vgs', 'VFree arată cât spațiu mai poți aloca.'],
          ['pvcreate + vgextend', 'adaugă spațiu în VG când VFree nu ajunge.'],
          ['lvextend -L +256M', '+ = adaugă la dimensiunea curentă. Fără + (ex. -L 800M) setezi dimensiunea finală.'],
          ['-r', '--resizefs: după LV, extinde și sistemul de fișiere (XFS: xfs_growfs; ext4: resize2fs).'],
          ['-l +100%FREE', 'adaugă tot spațiul liber al grupului.'],
          ['xfs_growfs /data', 'extinde un XFS MONTAT; argumentul este punctul de montare.'],
          ['resize2fs /dev/…', 'extinde ext2/3/4; argumentul este dispozitivul.'],
        ]} />

        <h4>6. Extinde un swap pe LV</h4>
        <CodeBlock title="comenzi" code={`sudo swapoff /dev/datavg/swap2\nsudo lvextend -L +512M /dev/datavg/swap2\nsudo mkswap /dev/datavg/swap2\nsudo swapon /dev/datavg/swap2`} explain={[
          ['swapoff', 'se dezactivează înainte de modificare.'],
          ['lvextend', 'mărește LV-ul.'],
          ['mkswap', 'rescrie semnătura cu noua dimensiune; UUID-ul se schimbă (actualizează fstab dacă folosești UUID, sau folosește calea LV).'],
          ['swapon', 'îl reactivează.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="free -h" kind="session" label="illustrative" code={`[student@server1 ~]$ free -h\n               total        used        free      shared  buff/cache   available\nMem:           1.8Gi       420Mi       1.1Gi       8.0Mi       310Mi       1.3Gi\nSwap:          3.0Gi          0B       3.0Gi`} />
        <p className="small"><code>total</code> = capacitate; <code>used</code> = folosit; <code>free</code> = neutilizat; <code>buff/cache</code> = memorie folosită ca cache (recuperabilă); <code>available</code> = cât se poate aloca fără swap. Rândul <code>Swap</code> arată suma tuturor spațiilor swap active. Cifrele sunt exemple.</p>
        <CodeBlock title="lsblk (după extindere)" kind="session" label="illustrative" code={`[student@server1 ~]$ lsblk /dev/vdb\nNAME              MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS\nvdb               252:16   0    4G  0 disk\n├─vdb1            252:17   0    2G  0 part\n│ └─datavg-data   253:2    0  768M  0 lvm  /data\n└─vdb2            252:18   0    1G  0 part [SWAP]`} />
        <p className="small"><code>[SWAP]</code> în MOUNTPOINTS = swap activ. <code>TYPE lvm</code> = volum logic. LV-ul <code>datavg-data</code> a crescut la 768M. Valori orientative.</p>
        <CodeBlock title="swapon (eroare)" kind="session" label="illustrative" code={`[root@server1 ~]# swapon /dev/vdb2\nswapon: /dev/vdb2: read swap header failed`} />
        <p className="small">Cauză: lipsește <code>mkswap</code>. Remediere: <code>mkswap /dev/vdb2</code>, apoi <code>swapon</code>. Mesajul exact poate diferi.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Partiție nouă: <code>lsblk</code>, <code>parted … print</code>; cele vechi neschimbate.</li>
            <li>Swap: <code>swapon --show</code> / <code>free -h</code> arată noul spațiu.</li>
            <li>fstab: <code>findmnt --verify</code>, <code>swapon -a</code> fără erori.</li>
            <li>LV extins: <code>lvs</code> (LSize) și <code>df -h</code> (dimensiunea sistemului de fișiere).</li>
            <li>Datele: fișierele existente rămân accesibile.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Partițiile, LV-urile și dimensiunile lor se păstrează pe disc. <b>Swap-ul nu</b>: <code>swapon</code> este temporar; pentru boot ai nevoie de linia <code>none swap</code> în <code>/etc/fstab</code>. Confirmare manuală: după reboot de test, <code>swapon --show</code> listează swap-ul; <code>free -h</code> arată totalul așteptat.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>read swap header failed</code>, 'lipsește mkswap', <code>blkid</code>, <code>mkswap</code>],
          [<code>insecure permissions</code>, 'fișier swap cu permisiuni largi', <code>ls -l /swapfile</code>, <code>chmod 600</code>],
          ['Swap nu revine după reboot', 'lipsește linia fstab', <code>grep swap /etc/fstab</code>, 'adaugă linia'],
          [<code>Insufficient free space</code>, 'VFree prea mic', <code>vgs</code>, <><code>vgextend</code> cu PV nou</>],
          ['df arată dimensiunea veche', 'sistemul de fișiere nu a fost extins', <code>df -h</code>, <><code>xfs_growfs</code> / <code>resize2fs</code></>],
          [<code>swapoff: Cannot allocate memory</code>, 'RAM insuficient pentru paginile din swap', <code>free -h</code>, 'eliberează memorie sau lasă swap-ul activ'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Rulezi <code>mklabel</code> sau <code>mkfs</code> pe date existente în loc să extinzi.</>,
          <>Folosești <code>-L 800M</code> când voiai <code>+800M</code> (sau invers).</>,
          <>Extinzi LV-ul, dar nu și sistemul de fișiere (uiți <code>-r</code> sau <code>xfs_growfs</code>).</>,
          <>Încerci să micșorezi un XFS; nu este posibil.</>,
          <>Pui swap-ul în fstab cu punct de montare diferit de <code>none</code> sau tip diferit de <code>swap</code>.</>,
          <>Uiți <code>mkswap</code> înainte de <code>swapon</code>.</>,
          <>Uiți linia fstab și swap-ul dispare la reboot.</>,
          <>Fișier swap cu permisiuni deschise.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: swappiness, prioritate și extinderea unui VG pe disc nou">
        <p>
          Parametrul kernel <code>vm.swappiness</code> (implicit 60, valoare 0–200 în kernelurile moderne) arată cât de agresiv mută kernelul pagini în swap față de eliminarea cache-ului. Se vede cu <code>sysctl vm.swappiness</code>. Modificarea persistentă, prin <code>/etc/sysctl.d/</code>, este în afara acestui obiectiv.
        </p>
        <p>
          Prioritatea swap-urilor: valori între -1 și 32767; implicit descresc cu fiecare swap adăugat (-2, -3…). Cu <code>pri=</code> egal pe două spații, kernelul alternează între ele (round-robin), ca un striping simplu.
        </p>
        <p>
          Dacă un VG are un singur PV pe un disc virtual care poate fi mărit de hypervisor, <code>pvresize /dev/vdb1</code> face LVM să vadă noua dimensiune a PV-ului; pentru partiții trebuie mai întâi mărită și partiția. Procedura este menționată doar; nu face parte din obiectiv.
        </p>
      </DeepDive>
    </>
  );
}

export const L5_6: TopicModule = {
  id: 'L5.6',
  subtitle: 'swap (mkswap, swapon), partiții noi, lvextend -r, extindere non-destructivă',
  studyTime: '≈80 min studiu + laborator',
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
  labs: [LAB_L5_6],
  sources: [
    { kind: 'man', ref: 'mkswap(8), swapon(8), lvextend(8), xfs_growfs(8), resize2fs(8), free(1), fstab(5), parted(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Getting started with swap” (storage-getting_started_with_swap) și „Resizing logical volumes”, docs.redhat.com necitit (HTTP 403 în C2/C4); de confirmat la review' },
  ],
};
