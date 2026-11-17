import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L5_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <G id="lv">volum logic (LV)</G> este „partiția flexibilă” pe care pui sistemul de fișiere. Îl creezi cu <code>lvcreate -n NUME -L DIMENSIUNE VG</code>, îl vezi cu <code>lvs</code> / <code>lvdisplay</code>, apare ca <code>/dev/VG/NUME</code> și îl ștergi cu <code>lvremove</code>. După creare îl formatezi (<code>mkfs</code>) și îl montezi.
          </p>
          <p>Obiectivul oficial: <i>„Create and delete logical volumes”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Volumul logic este ultimul nivel LVM și singurul cu care lucrează restul sistemului: formatezi un LV, îl montezi, scrii în el. Spre deosebire de o partiție, un LV nu are limite fixe pe un singur disc: poate fi alcătuit din extents de pe mai multe PV-uri și poate fi mărit sau micșorat ulterior (L5.6, C6).
          </p>
          <Analogy>VG este un rezervor mare. LV este un butoi pe care îl umpli din rezervor. Îl poți umple cu cât vrei, cât timp mai este apă, iar mai târziu poți cere un butoi mai mare fără să schimbi consumatorul.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>De la lvcreate la /dev</h4>
          <ol>
            <li><code>lvcreate</code> alege extents libere din VG și le scrie în metadate ca „segment” al LV-ului.</li>
            <li>Kernelul, prin <G id="device-mapper">device-mapper</G>, creează un dispozitiv virtual cu o tabelă de mapare (LV-offset → PV + offset).</li>
            <li>udev creează <code>/dev/mapper/VG-LV</code> și legătura <code>/dev/VG/LV</code>; ambele indică <code>/dev/dm-N</code>.</li>
          </ol>
          <h4>-L vs -l</h4>
          <Table head={['Opțiune', 'Primește', 'Exemple']} rows={[
            [<code>-L</code>, 'dimensiune', <><code>-L 500M</code>, <code>-L 2G</code>, <code>-L +1G</code> (la extend)</>],
            [<code>-l</code>, 'extents sau procent', <><code>-l 100</code>, <code>-l 50%VG</code>, <code>-l 100%FREE</code>, <code>-l 25%PVS</code></>],
          ]} />
          <p>Dimensiunile se rotunjesc la un multiplu de extent (4 MiB): <code>-L 510M</code> devine 512 MiB.</p>
          <h4>Tipuri de LV</h4>
          <p>
            Implicit creezi un LV <i>linear</i>: extents consecutive de pe PV-uri. Există și tipuri avansate (striped, raid, thin, cache). Obiectivul de examen cere doar LV-urile obișnuite.
          </p>
          <h4>Cele două nume ale aceluiași dispozitiv</h4>
          <Table head={['Cale', 'Origine']} rows={[
            [<code>/dev/datavg/data</code>, 'legătură creată de udev; ușor de citit'],
            [<code>/dev/mapper/datavg-data</code>, 'numele device-mapper; cratimele din nume se dublează (my-vg → my--vg)'],
          ]} />
          <p>În <code>/etc/fstab</code> se folosesc aceste căi (stabile) sau UUID; <b>nu</b> <code>/dev/dm-N</code>, care se poate schimba.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>VG</b> (L5.3): alocarea se face din VFree.</li>
            <li><b>Sisteme de fișiere</b> (C6): <code>mkfs.xfs /dev/VG/LV</code>.</li>
            <li><b>/etc/fstab</b> (L5.5): montare persistentă cu UUID sau cale.</li>
            <li><b>Swap</b> (L5.6): un LV poate fi swap (<code>mkswap</code>).</li>
            <li><b>Extindere</b> (L5.6): <code>lvextend</code> și <code>lvextend -r</code>.</li>
            <li><b>SELinux</b> (C10): contextele se aplică pe fișierele din sistemul de fișiere, nu pe LV.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Un serviciu are nevoie de un volum dedicat (de exemplu <code>/var/lib/mysql</code>).</li>
            <li>Vrei să poți extinde rapid un volum, fără oprire.</li>
            <li>La examen: „create a logical volume of size X in volume group Y, format it as XFS and mount it persistently”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Creează un LV: <code>lvcreate</code></h4>
        <CodeBlock title="comenzi" code={`sudo lvcreate -n data -L 500M datavg\nsudo lvcreate -n big -l 50%FREE datavg\nsudo lvcreate -n rest -l 100%FREE datavg\nsudo lvcreate -n ex -l 128 datavg`} explain={[
          ['lvcreate', 'creează un volum logic.'],
          ['-n data', '-n (--name) = numele LV-ului.'],
          ['-L 500M', '-L (--size) = dimensiunea (K, M, G, T; implicit MiB).'],
          ['-l 50%FREE', '-l (--extents) = număr de extents SAU procent: %FREE din spațiul liber, %VG din dimensiunea grupului.'],
          ['-l 100%FREE', 'tot spațiul liber rămas.'],
          ['-l 128', '128 de extents (× dimensiunea extentului: 128 × 4 MiB = 512 MiB).'],
          ['datavg', 'grupul de volume; ultimul argument. Poți scrie și datavg/data în alte comenzi.'],
        ]} />

        <h4>2. Vezi LV-urile: <code>lvs</code>, <code>lvdisplay</code>, <code>lsblk</code></h4>
        <CodeBlock title="comenzi" code={`sudo lvs\nsudo lvs datavg\nsudo lvs -o lv_name,vg_name,lv_size,lv_path\nsudo lvdisplay /dev/datavg/data\nlsblk /dev/vdb\nls -l /dev/datavg/ /dev/mapper/`} explain={[
          ['lvs', 'sumar: LV, VG, Attr, LSize și altele; un rând per LV.'],
          ['-o lv_path', 'afișează și calea LV-ului.'],
          ['lvdisplay', 'format lung: LV Path, LV Name, VG Name, LV UUID, LV Status, LV Size, Current LE, Segments.'],
          ['lsblk', 'arată LV-urile sub PV-urile lor, cu TYPE „lvm”.'],
        ]} />

        <h4>3. Fă-l utilizabil: <code>mkfs</code> și <code>mount</code></h4>
        <CodeBlock title="comenzi" code={`sudo mkfs.xfs /dev/datavg/data\nsudo mkdir /mnt/data\nsudo mount /dev/datavg/data /mnt/data\ndf -h /mnt/data`} explain={[
          ['mkfs.xfs', 'creează XFS pe LV (detalii C6). Distruge conținutul anterior.'],
          ['mount', 'montare temporară; pentru persistență vezi L5.5.'],
          ['df -h', 'dimensiunea sistemului de fișiere, în format uman.'],
        ]} />

        <h4>4. Șterge un LV: <code>lvremove</code></h4>
        <CodeBlock title="comenzi" code={`sudo umount /mnt/data\nsudo lvremove datavg/data\nsudo lvremove -y /dev/datavg/data\nsudo lvremove -f datavg`} explain={[
          ['umount', 'obligatoriu înainte; și elimină linia din /etc/fstab dacă există.'],
          ['lvremove VG/LV', 'șterge LV-ul; cere confirmare.'],
          ['-y / -f', '-y = răspunde yes; -f = force, nu mai cere confirmare. -f cu NUME_VG șterge toate LV-urile grupului: periculos.'],
        ]} />
        <Callout kind="warn" title="lvremove este ireversibil">
          Datele din LV dispar. Dacă ai o linie în <code>/etc/fstab</code> pentru volumul șters, sistemul poate intra în modul de urgență la următorul boot. Șterge linia.
        </Callout>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="lvs" kind="session" label="illustrative" code={`[root@server1 ~]# lvs\n  LV   VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  data datavg -wi-ao---- 512.00m\n  root rhel   -wi-ao---- <17.00g\n  swap rhel   -wi-ao----   2.00g`} />
        <p className="small">
          <code>LV</code> = nume; <code>VG</code> = grup; <code>LSize</code> = dimensiune. <code>Attr</code> (10 poziții): prima <code>-</code> = tip obișnuit; <code>w</code> = writable; <code>i</code> = alocare „inherited”; <code>a</code> = activ; <code>o</code> = deschis (montat sau în uz). Coloanele <code>Pool</code>, <code>Origin</code> etc. sunt pentru thin/snapshot și rămân goale la LV-uri simple.
        </p>
        <CodeBlock title="lvdisplay" kind="session" label="illustrative" code={`[root@server1 ~]# lvdisplay /dev/datavg/data\n  --- Logical volume ---\n  LV Path                /dev/datavg/data\n  LV Name                data\n  VG Name                datavg\n  LV UUID                Jk9LmN-0pQr-StUv-WxYz-1234-AbCd-EfGhIj\n  LV Write Access        read/write\n  LV Status              available\n  # open                 1\n  LV Size                512.00 MiB\n  Current LE             128\n  Segments               1\n  Allocation             inherit\n  Block device           253:2`} />
        <p className="small">
          <code>LV Path</code> = calea; <code>LV Status available</code> = activ; <code># open 1</code> = folosit (montat); <code>Current LE 128</code> = 128 extents logice; <code>Block device 253:2</code> = major:minor device-mapper. Valori orientative, UUID fictiv.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>lvs</code>: LV-ul apare cu dimensiunea cerută (rotunjită la extent).</li>
            <li><code>ls -l /dev/VG/LV</code> și <code>/dev/mapper/</code>: dispozitivul există.</li>
            <li><code>lsblk</code>: LV apare sub PV-uri.</li>
            <li>Pentru un volum folosit: <code>df -h</code> / <code>findmnt</code>.</li>
            <li>După <code>lvremove</code>: <code>lvs</code> nu îl mai listează; <code>vgs</code> arată VFree crescut.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Crearea LV-ului este persistentă (metadatele sunt pe disc) și VG-ul este activat automat la boot. Montarea <b>nu</b> este: cere o linie în <code>/etc/fstab</code> (L5.5). Confirmare manuală: după reboot, <code>lvs</code> arată LV-ul; <code>findmnt /mnt/data</code> îl arată montat doar dacă ai fstab.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>insufficient free space</code>, 'cerere > VFree', <code>vgs</code>, <>cere mai puțin sau <code>vgextend</code></>],
          [<code>Volume group "X" not found</code>, 'nume greșit sau VG inactiv', <code>vgs</code>, <>corectează numele; <code>vgchange -ay</code></>],
          [<code>mount: wrong fs type</code>, 'LV neformatat', <code>blkid</code>, <code>mkfs.xfs</code>],
          [<code>contains a filesystem in use</code>, 'LV montat', <code>findmnt</code>, <><code>umount</code>, apoi <code>lvremove</code></>],
          ['Dimensiune alta decât cea cerută', 'rotunjire la extent', <code>lvs</code>, 'normal; folosește multipli de 4 MiB'],
          ['Boot în emergency mode după lvremove', 'linie rămasă în fstab', <code>journalctl -b</code>, 'șterge linia din /etc/fstab'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confunzi <code>-L</code> (dimensiune) cu <code>-l</code> (extents/procent).</>,
          <>Uiți <code>-n</code> și primești un nume generat (<code>lvol0</code>).</>,
          <>Uiți <code>mkfs</code>; <code>mount</code> eșuează.</>,
          <>Ștergi un LV fără <code>umount</code> / fără să cureți fstab.</>,
          <>Scrii <code>lvcreate datavg -n data</code> în ordine greșită: argumentul VG trebuie să fie ultimul (opțiunile pot fi oriunde înaintea lui).</>,
          <>Folosești <code>/dev/dm-N</code> în fstab.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: tabela device-mapper și metadatele unui LV">
        <p>
          Cu <code>dmsetup table</code> vezi tabela de mapare a unui LV: linii de forma <code>0 1048576 linear 252:17 2048</code> (de la sectorul 0, 1048576 sectoare, tip linear, pe dispozitivul 252:17, de la offsetul 2048). Dacă LV-ul se întinde pe două PV-uri, apar două linii.
        </p>
        <p>
          Metadatele LV-ului (nume, UUID, segmente) se găsesc în <code>/etc/lvm/backup/NUME_VG</code>. Un LV șters cu <code>lvremove</code> poate fi uneori recuperat din <code>/etc/lvm/archive</code> cu <code>vgcfgrestore</code>, dar acest scenariu iese din cadrul examenului.
        </p>
      </DeepDive>
    </>
  );
}

export const L5_4: TopicModule = {
  id: 'L5.4',
  subtitle: 'lvcreate (-n, -L, -l), lvs, lvdisplay, lvremove, /dev/VG/LV',
  studyTime: '≈70 min studiu + laborator',
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
  labs: [LAB_L5_4],
  sources: [
    { kind: 'man', ref: 'lvcreate(8), lvs(8), lvdisplay(8), lvremove(8), mkfs.xfs(8), dmsetup(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Creating logical volumes” / „Removing logical volumes” (storage-creating_logical_volumes), docs.redhat.com necitit (HTTP 403 în C2/C4); de confirmat la review' },
  ],
};
