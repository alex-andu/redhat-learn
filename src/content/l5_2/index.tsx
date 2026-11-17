import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L5_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="lvm">LVM</G> este un strat între discuri și sistemele de fișiere. Are trei niveluri: <G id="pv">volume fizice (PV)</G> → <G id="vg">grupuri de volume (VG)</G> → <G id="lv">volume logice (LV)</G>. În această lecție faci primul pas: transformi un disc sau o partiție în PV cu <code>pvcreate</code>, îl inspectezi cu <code>pvs</code> / <code>pvdisplay</code> și îl elimini cu <code>pvremove</code>.
          </p>
          <p>Obiectivul oficial: <i>„Create and remove physical volumes”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Cu partiții obișnuite, mărimea unui sistem de fișiere este legată de mărimea partiției, iar partiția stă pe un singur disc. Dacă <code>/home</code> se umple, nu o poți „lungi” peste alt disc. Dacă ai trei discuri mici, nu poți crea un singur volum mare din ele.
          </p>
          <p>
            LVM rezolvă asta: adună spațiul din mai multe dispozitive într-un bazin comun (VG), din care tai volume logice (LV) de orice dimensiune și le poți mări sau micșora ulterior. Primul pas este să spui LVM-ului „acest dispozitiv îți aparține”: asta înseamnă să creezi un <b>volum fizic</b>.
          </p>
          <Analogy>Gândește-te la rezervoare de apă. Fiecare rezervor (PV) este un butoi fizic. Un VG este un bazin comun în care toate butoaiele sunt conectate. LV-urile sunt robinetele către consumatori, fiecare cu cota lui, pe care o poți mări cât timp mai este apă în bazin.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Ce face <code>pvcreate</code></h4>
          <p>
            Scrie la începutul dispozitivului o <b>etichetă LVM2</b> (în al doilea sector) și o zonă de <b>metadate</b>. Eticheta conține UUID-ul PV-ului; metadatele descriu cum este împărțit spațiul. Restul dispozitivului este disponibil pentru alocare. Fiecare PV primește un UUID propriu, afișat de <code>pvdisplay</code>.
          </p>
          <h4>Extents</h4>
          <p>
            Spațiul unui PV este împărțit în bucăți egale numite <G id="extent">extents fizice (PE)</G>. Dimensiunea lor (implicit 4 MiB) este definită de <b>VG</b>, nu de PV; de aceea un PV neatribuit afișează „PE Size 0”. LV-urile sunt alcătuite din „extents logice” (LE) mapate pe PE.
          </p>
          <h4>Cum ajunge LV-ul în /dev</h4>
          <p>
            Kernelul folosește <G id="device-mapper">device-mapper</G>: pentru fiecare LV creează <code>/dev/mapper/VG-LV</code> (și o legătură <code>/dev/VG/LV</code>). Detalii în L5.4.
          </p>
          <h4>Unde pui PV-ul</h4>
          <Table head={['Variantă', 'Avantaj', 'Dezavantaj']} rows={[
            ['PV pe partiție (vdb1)', 'tabela de partiții semnalează că discul este folosit; alte instrumente nu îl cred „gol”', 'un pas în plus (partiționare)'],
            ['PV pe disc întreg (vdc)', 'simplu, tot spațiul', 'instrumente care citesc doar tabele de partiții pot vedea discul ca gol'],
          ]} />
          <p>La examen se acceptă ambele; dacă enunțul specifică o partiție, folosește-o.</p>
          <h4>Ce se întâmplă cu LVM pe RHEL 10</h4>
          <p>
            LVM2 a introdus un fișier de dispozitive (<code>/etc/lvm/devices/system.devices</code>) care limitează dispozitivele pe care le folosește LVM. Este activ implicit începând cu RHEL 9 (de confirmat pentru RHEL 10). Cu comenzile standard (<code>pvcreate</code>, <code>vgcreate</code>) intrarea se adaugă automat.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Partiții GPT</b> (L5.1): PV-ul se creează pe o partiție sau pe un disc întreg.</li>
            <li><b>VG și LV</b> (L5.3, L5.4): PV-ul nu este util până nu intră într-un VG.</li>
            <li><b>Sisteme de fișiere</b> (C6): pe PV NU se face <code>mkfs</code>; sistemul de fișiere se creează pe LV.</li>
            <li><b>Boot</b>: instalarea implicită RHEL pune / pe un LV într-un VG numit de regulă <code>rhel</code>; PV-ul de pe discul de sistem nu se atinge.</li>
            <li><b>udev</b>: la detectarea PV, udev poate activa automat VG-ul.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Adaugi un disc nou și vrei să extinzi un VG existent (L5.3).</li>
            <li>Construiești un volum mare dintr-o colecție de discuri mici.</li>
            <li>La examen: „creează un volum fizic pe /dev/vdb1” este primul pas al multor task-uri de storage.</li>
            <li>Vrei să scoți un disc din uz: golești PV-ul (<code>pvmove</code>), îl scoți din VG, apoi <code>pvremove</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Creează un PV: <code>pvcreate</code></h4>
        <CodeBlock title="comenzi" code={`sudo pvcreate /dev/vdb1\nsudo pvcreate /dev/vdb1 /dev/vdb2\nsudo pvcreate -v /dev/vdc\nsudo pvcreate -f /dev/vdb1`} explain={[
          ['pvcreate DISPOZITIV…', 'inițializează unul sau mai multe dispozitive ca volume fizice. Fiecare primește un UUID.'],
          ['-v', 'verbose: afișează pașii (utilă pentru a vedea ce se scrie).'],
          ['/dev/vdc', 'poate fi un disc întreg, fără partiții.'],
          ['-f', 'force: ignoră avertismentele și suprascrie; PERICULOS, șterge semnături existente. Nu o folosi fără să verifici cu blkid.'],
          ['-y', 'răspunde „yes” automat la întrebări (de ex. „Wipe it?”).'],
        ]} />

        <h4>2. Listează PV-urile: <code>pvs</code>, <code>pvdisplay</code>, <code>pvscan</code></h4>
        <CodeBlock title="comenzi" code={`sudo pvs\nsudo pvs -o pv_name,vg_name,pv_size,pv_free\nsudo pvdisplay /dev/vdb1\nsudo pvscan\nlsblk -f`} explain={[
          ['pvs', 'sumar tabelar: un rând per PV (PV, VG, Fmt, Attr, PSize, PFree).'],
          ['-o pv_name,vg_name,…', '-o alege coloanele; -o +pv_uuid adaugă una la cele implicite.'],
          ['pvdisplay', 'format lung: PV Name, VG Name, PV Size, PE Size, Total PE, Free PE, Allocated PE, PV UUID.'],
          ['pvscan', 'caută PV-uri pe toate dispozitivele și le listează.'],
          ['lsblk -f', 'un PV apare cu FSTYPE „LVM2_member”.'],
        ]} />

        <h4>3. Șterge un PV: <code>pvremove</code></h4>
        <CodeBlock title="comenzi" code={`sudo pvremove /dev/vdb2\nsudo pvremove -y /dev/vdb2\nsudo vgreduce datavg /dev/vdb2   # dacă PV este în VG\nsudo pvmove /dev/vdb2            # mută datele altundeva`} explain={[
          ['pvremove', 'șterge eticheta LVM; partiția sau discul rămâne, dar nu mai este PV. Refuză dacă PV-ul este într-un VG.'],
          ['vgreduce VG PV', 'scoate un PV gol dintr-un VG (L5.3).'],
          ['pvmove', 'mută extents-urile de pe un PV pe altele din același VG (online); necesar înainte de a scoate un PV plin.'],
        ]} />

        <h4>4. Fișiere implicate</h4>
        <ul>
          <li><code>/etc/lvm/lvm.conf</code>: configurația LVM (filtre, comportament). Nu o modifici la examen decât dacă ți se cere.</li>
          <li><code>/etc/lvm/devices/system.devices</code>: lista dispozitivelor pe care LVM are voie să le folosească (de confirmat prezența pe RHEL 10).</li>
          <li><code>/etc/lvm/backup/</code> și <code>/etc/lvm/archive/</code>: copii ale metadatelor VG.</li>
        </ul>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="pvs" kind="session" label="illustrative" code={`[root@server1 ~]# pvs\n  PV         VG     Fmt  Attr PSize   PFree\n  /dev/vda2  rhel   lvm2 a--  <19.00g     0\n  /dev/vdb1  datavg lvm2 a--  1020.00m 1020.00m\n  /dev/vdb2         lvm2 ---  1.00g    1.00g`} />
        <p className="small">
          <code>PV</code> = dispozitivul. <code>VG</code> = grupul căruia îi aparține (gol = liber). <code>Fmt</code> = formatul metadatelor (<code>lvm2</code>). <code>Attr</code>: <code>a</code> = allocatable (se pot aloca extents), <code>-</code> = nu; a treia poziție <code>-</code>/<code>x</code> indică dacă lipsește. <code>PSize</code> = dimensiunea, <code>PFree</code> = spațiul liber. <code>&lt;</code> înseamnă „puțin mai puțin de”. Valorile sunt exemple.
        </p>
        <CodeBlock title="pvdisplay" kind="session" label="illustrative" code={`[root@server1 ~]# pvdisplay /dev/vdb1\n  --- Physical volume ---\n  PV Name               /dev/vdb1\n  VG Name               datavg\n  PV Size               1.00 GiB / not usable 4.00 MiB\n  Allocatable           yes\n  PE Size               4.00 MiB\n  Total PE              255\n  Free PE               255\n  Allocated PE          0\n  PV UUID               Xk3Lq1-2aBc-DeFg-HiJk-LmNo-PqRs-TuVwXy`} />
        <p className="small">
          <code>not usable 4.00 MiB</code> = zona de metadate/aliniere. <code>PE Size</code> = dimensiunea extentului (stabilită de VG). <code>Total PE</code> = nr. de extents; <code>Free PE</code> = cele neutilizate; <code>Allocated PE</code> = cele folosite de LV-uri. 255 × 4 MiB = 1020 MiB. UUID fictiv.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>pvs</code> listează dispozitivul nou.</li>
            <li><code>lsblk -f</code> arată <code>LVM2_member</code> la FSTYPE.</li>
            <li><code>blkid /dev/vdb1</code> afișează <code>TYPE="LVM2_member"</code>.</li>
            <li>După <code>pvremove</code>: <code>pvs</code> nu mai listează dispozitivul; <code>lsblk -f</code> nu mai arată FSTYPE.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Eticheta LVM este scrisă pe dispozitiv; supraviețuiește reboot-ului. Nu există nimic de adăugat în <code>/etc/fstab</code> la acest nivel (acolo apare doar sistemul de fișiere de pe LV, în L5.5). Confirmare manuală: după reboot, <code>pvs</code> listează aceleași PV-uri.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>WARNING: xfs signature detected … Wipe it?</code>, 'dispozitivul conține deja un sistem de fișiere', <code>blkid /dev/vdb1</code>, <>răspunde <code>y</code> numai dacă nu ai nevoie de date</>],
          [<code>Device … excluded by a filter</code>, 'filtru LVM sau dispozitiv necunoscut', <code>lsblk -f</code>, <>șterge semnătura cu <code>wipefs -a</code> (distruge date)</>],
          [<code>Can't open … exclusively. Mounted filesystem?</code>, 'dispozitivul este montat sau în uz', <code>findmnt</code>, 'demontează'],
          [<code>Physical volume … still in use</code>, 'PV este în VG', <code>pvs</code>, <><code>vgreduce</code>, apoi <code>pvremove</code></>],
          ['PV-ul nou nu apare în pvs', 'kernelul nu a recitit partițiile', <code>pvscan</code>, <><code>partprobe</code>, apoi <code>pvscan</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Faci <code>mkfs</code> pe partiție înainte de <code>pvcreate</code>; PV și sistemul de fișiere se exclud.</>,
          <>Rulezi <code>pvcreate</code> pe discul de sistem (<code>/dev/vda2</code> este deja PV).</>,
          <>Răspunzi <code>y</code> la „Wipe it?” fără să verifici.</>,
          <>Confunzi <code>pvs</code> / <code>vgs</code> / <code>lvs</code>.</>,
          <>Încerci <code>pvremove</code> pe un PV aflat într-un VG.</>,
          <>Crezi că <code>pvremove</code> șterge partiția; șterge doar eticheta LVM.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: metadate LVM, UUID și pvmove">
        <p>
          Metadatele LVM sunt text ASCII, stocat în zona de metadate a fiecărui PV (implicit o copie). Poți vedea copia salvată în <code>/etc/lvm/backup/NUME_VG</code> (un fișier cu structura VG-ului: PV-uri, LV-uri, segmente). <code>vgcfgbackup</code> și <code>vgcfgrestore</code> permit refacerea metadatelor, scenariu de recuperare dincolo de nivelul examenului.
        </p>
        <p>
          <code>pvmove</code> funcționează creând un LV temporar „mirror” între sursă și destinație, apoi comutând maparea; datele rămân disponibile cât timp mutarea are loc. Nu face parte din obiectivul acestei lecții, dar este metoda standard de a elibera un disc.
        </p>
      </DeepDive>
    </>
  );
}

export const L5_2: TopicModule = {
  id: 'L5.2',
  subtitle: 'LVM: PV → VG → LV; pvcreate, pvs, pvdisplay, pvremove',
  studyTime: '≈60 min studiu + laborator',
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
  labs: [LAB_L5_2],
  sources: [
    { kind: 'man', ref: 'lvm(8), pvcreate(8), pvs(8), pvdisplay(8), pvremove(8), pvmove(8), lvmdevices(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Managing LVM physical volumes” (storage-managing_lvm_physical_volumes), docs.redhat.com necitit (HTTP 403 în C2/C4); de confirmat la review' },
  ],
};
