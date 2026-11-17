import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L5_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <G id="vg">grup de volume (VG)</G> adună unul sau mai multe <G id="pv">PV-uri</G> într-un singur bazin de spațiu. Îl creezi cu <code>vgcreate NUME_VG PV…</code>, îl mărești cu <code>vgextend</code>, scoți un PV gol cu <code>vgreduce</code>, îl inspectezi cu <code>vgs</code> / <code>vgdisplay</code> și îl ștergi cu <code>vgremove</code>.
          </p>
          <p>Obiectivul oficial: <i>„Assign physical volumes to volume groups”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un PV singur este doar un dispozitiv marcat pentru LVM. Pentru a putea tăia din el volume logice, trebuie să fie „înscris” într-un grup. Grupul este un strat de abstractizare: volumele logice nu mai știu pe ce disc stau, ci doar din ce grup sunt luate. Asta îți dă libertatea de a adăuga discuri noi în grup fără să schimbi nimic din restul sistemului.
          </p>
          <Analogy>VG este o cooperativă: mai mulți fermieri (PV-uri) își pun terenurile la un loc. Cooperativa împarte apoi loturi (LV-uri) clienților, fără ca ei să știe al cui teren se folosește. Poți primi un fermier nou (vgextend) sau poți elibera un teren (vgreduce), cât timp nu este cultivat.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Extents</h4>
          <p>
            La crearea VG se stabilește dimensiunea <G id="extent">extentului</G> (implicit 4 MiB; <code>vgcreate -s 8M</code> o schimbă). Fiecare PV al grupului este împărțit în extents de această mărime. Un LV va ocupa un număr întreg de extents; de aceea dimensiunile se rotunjesc.
          </p>
          <h4>Capacitatea VG</h4>
          <p>
            <code>VSize</code> = suma spațiului utilizabil al PV-urilor (puțin mai puțin decât suma dimensiunilor, din cauza metadatelor). <G id="vg-free">VFree</G> = extents nealocate × dimensiunea extentului. Dacă ai 2 PV-uri de ≈1 GiB și niciun LV, VFree ≈ VSize ≈ 2 GiB.
          </p>
          <h4>Metadatele grupului</h4>
          <p>
            Metadatele (lista PV-urilor, LV-urilor și a extents-urilor alocate) sunt scrise pe fiecare PV al grupului. Dacă un disc se defectează, grupul poate fi citit de pe celelalte, dar LV-urile care foloseau acel disc devin indisponibile (LVM simplu nu face redundanță; vezi Deep dive).
          </p>
          <h4>Activarea</h4>
          <p>
            Un VG trebuie să fie „activ” ca LV-urile din el să fie utilizabile; la boot, LVM activează automat grupurile găsite (<code>vgchange -ay</code>). Atributul <code>Attr</code> din <code>vgs</code> (<code>wz--n-</code>) descrie permisiunile și starea grupului.
          </p>
          <h4>Reguli de nume</h4>
          <p>
            Numele VG poate conține litere, cifre și <code>. _ - +</code>; nu poate începe cu cratimă și nu poate fi <code>.</code> sau <code>..</code>. Numele trebuie să fie unic pe sistem.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>PV</b> (L5.2): vgcreate poate inițializa singur PV-urile, dar este bine să le creezi explicit.</li>
            <li><b>LV</b> (L5.4): VFree decide cât poți aloca.</li>
            <li><b>Sisteme de fișiere</b> (C6): după ce ai mărit un LV, extinzi și sistemul de fișiere.</li>
            <li><b>Hot-plug</b>: discurile noi apar în <code>lsblk</code>; <code>vgextend</code> le folosește imediat, fără oprirea sistemului.</li>
            <li><b>Boot</b>: VG-ul de sistem (<code>rhel</code> sau similar) conține / și swap; nu îl modifici fără motiv.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Ai adăugat un disc și vrei spațiu suplimentar pentru un volum existent: <code>vgextend</code>.</li>
            <li>Creezi un volum nou separat de cele de sistem: VG nou, de exemplu <code>datavg</code>.</li>
            <li>Elimini un disc: golești-l cu <code>pvmove</code>, apoi <code>vgreduce</code>.</li>
            <li>La examen: „create a volume group named X with extent size Y” sau „extend the volume group with the new disk”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Creează un VG: <code>vgcreate</code></h4>
        <CodeBlock title="comenzi" code={`sudo vgcreate datavg /dev/vdb1\nsudo vgcreate datavg /dev/vdb1 /dev/vdb2\nsudo vgcreate -s 8M datavg /dev/vdb1\nsudo vgcreate -v datavg /dev/vdb1`} explain={[
          ['vgcreate NUME_VG PV…', 'creează grupul NUME_VG din unul sau mai multe PV-uri. Numele este PRIMUL argument.'],
          ['datavg', 'numele grupului, ales de tine. Va deveni director /dev/datavg/ când creezi LV-uri.'],
          ['-s 8M', '-s = physicalextentsize: dimensiunea extentului (implicit 4M). Se alege la creare și apoi nu se mai schimbă simplu.'],
          ['-v', 'verbose: arată ce face (inclusiv inițializarea PV-urilor care nu sunt încă PV).'],
        ]} />

        <h4>2. Vezi grupurile: <code>vgs</code>, <code>vgdisplay</code>, <code>vgscan</code></h4>
        <CodeBlock title="comenzi" code={`sudo vgs\nsudo vgs datavg\nsudo vgs -o vg_name,pv_count,lv_count,vg_size,vg_free\nsudo vgdisplay datavg\nsudo vgscan`} explain={[
          ['vgs', 'sumar: un rând per VG; coloane VG, #PV, #LV, #SN (snapshots), Attr, VSize, VFree.'],
          ['vgs datavg', 'doar grupul dat.'],
          ['-o …', 'alege coloanele afișate.'],
          ['vgdisplay', 'format lung: VG Name, Format, VG Size, PE Size, Total PE, Alloc PE, Free PE, VG UUID.'],
          ['vgscan', 'caută grupuri pe dispozitivele sistemului și le listează.'],
        ]} />

        <h4>3. Extinde un VG: <code>vgextend</code></h4>
        <CodeBlock title="comenzi" code={`sudo pvcreate /dev/vdc1\nsudo vgextend datavg /dev/vdc1\nsudo vgs datavg`} explain={[
          ['pvcreate /dev/vdc1', 'inițializează noul dispozitiv ca PV (opțional: vgextend o face dacă dispozitivul este liber).'],
          ['vgextend datavg /dev/vdc1', 'adaugă PV-ul în grupul datavg; VSize și VFree cresc cu dimensiunea lui.'],
        ]} />

        <h4>4. Redu / șterge: <code>vgreduce</code>, <code>vgremove</code></h4>
        <CodeBlock title="comenzi" code={`sudo pvmove /dev/vdc1\nsudo vgreduce datavg /dev/vdc1\nsudo vgreduce --removemissing datavg\nsudo vgremove datavg`} explain={[
          ['pvmove /dev/vdc1', 'mută extents-urile alocate de pe acest PV pe alte PV-uri ale grupului (dacă ai destul spațiu liber).'],
          ['vgreduce datavg /dev/vdc1', 'scoate PV-ul gol din grup.'],
          ['--removemissing', 'elimină din grup PV-urile dispărute (disc defect); folosit la recuperare.'],
          ['vgremove datavg', 'șterge grupul și toate LV-urile lui, cu confirmare pentru fiecare. DISTRUGE DATE.'],
        ]} />

        <h4>5. Activează / redenumește</h4>
        <CodeBlock title="comenzi" code={`sudo vgchange -ay datavg\nsudo vgchange -an datavg\nsudo vgrename datavg backupvg`} explain={[
          ['vgchange -ay', '-a = activate, y = yes: activează toate LV-urile grupului (apar în /dev/mapper).'],
          ['vgchange -an', 'dezactivează (poți demonta și muta discurile).'],
          ['vgrename VECHI NOU', 'schimbă numele grupului; actualizează și /etc/fstab dacă numele apărea acolo.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="vgs" kind="session" label="illustrative" code={`[root@server1 ~]# vgs\n  VG     #PV #LV #SN Attr   VSize   VFree\n  datavg   2   1   0 wz--n- 1.99g   1.49g\n  rhel     1   2   0 wz--n- <19.00g     0`} />
        <p className="small">
          <code>#PV</code> = câte PV-uri; <code>#LV</code> = câte volume logice; <code>#SN</code> = snapshot-uri. <code>Attr</code> <code>wz--n-</code>: <code>w</code> = writable, <code>z</code> = resizable, <code>n</code> = alocare „normal”. <code>VSize</code> = capacitatea; <code>VFree</code> = nealocat. Valori orientative.
        </p>
        <CodeBlock title="vgdisplay" kind="session" label="illustrative" code={`[root@server1 ~]# vgdisplay datavg\n  --- Volume group ---\n  VG Name               datavg\n  Format                lvm2\n  VG Access             read/write\n  VG Status             resizable\n  Cur LV                1\n  Cur PV                2\n  VG Size               1.99 GiB\n  PE Size               4.00 MiB\n  Total PE              510\n  Alloc PE / Size       128 / 512.00 MiB\n  Free  PE / Size       382 / 1.49 GiB\n  VG UUID               aB1cD2-eF3g-H4iJ-k5L6-m7N8-o9P0-qR1sT2`} />
        <p className="small">
          <code>Total PE</code> = 510 extents; <code>Alloc PE</code> = 128 (un LV de 512 MiB) ; <code>Free PE</code> = 382 (≈1.49 GiB). 128 × 4 MiB = 512 MiB. UUID fictiv.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>vgs</code>: grupul apare, cu #PV și VSize așteptate.</li>
            <li><code>pvs</code>: coloana VG a PV-ului arată numele grupului.</li>
            <li>După <code>vgextend</code>: VSize și VFree au crescut.</li>
            <li>După <code>vgreduce</code>: PV-ul are VG gol în <code>pvs</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Apartenența PV-urilor la VG se scrie în metadatele de pe discuri; supraviețuiește reboot-ului. Nu e nevoie de intrări în <code>/etc/fstab</code> pentru VG, ci doar pentru sistemele de fișiere de pe LV-uri (L5.5). Confirmare manuală: după reboot, <code>vgs</code> arată aceleași grupuri.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Volume group "X" already exists</code>, 'nume deja folosit', <code>vgs</code>, <>alt nume sau <code>vgextend</code></>],
          [<code>Physical volume … is still in use</code>, 'PV conține extents alocate', <code>pvs -o +pv_used</code>, <><code>pvmove</code> apoi <code>vgreduce</code></>],
          [<code>Insufficient free space</code>, 'VFree prea mic', <code>vgs</code>, <>adaugă PV cu <code>vgextend</code></>],
          [<code>Cannot use /dev/… device is partitioned</code>, 'ai indicat discul care are partiții', <code>lsblk</code>, 'folosește partiția'],
          [<code>Couldn't find device with uuid …</code>, 'un PV lipsește', <code>pvs</code>, <><code>vgreduce --removemissing</code> după analiză</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Inversezi argumentele: <code>vgcreate /dev/vdb1 datavg</code>.</>,
          <>Folosești <code>vgcreate</code> pe un nume existent în loc de <code>vgextend</code>.</>,
          <>Rulezi <code>vgremove</code> crezând că scoate un PV; șterge tot grupul.</>,
          <>Uiți <code>-s</code> când enunțul cere o dimensiune de extent diferită; nu o poți schimba ușor după creare.</>,
          <>Numești grupul cu un nume deja existent (inclusiv cel din instalare).</>,
          <>Crezi că VSize = suma dimensiunilor PV; este puțin mai mică.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: extent size, limite și redundanță">
        <p>
          Dimensiunea extentului nu limitează spațiul total în LVM2 modern, dar un extent mai mare înseamnă mai puține bucăți de gestionat și granularitate mai mică la dimensiunile LV. Valoarea implicită, 4 MiB, convine aproape oricărui caz. <code>vgchange -s</code> poate schimba extentul unui VG doar în condiții restrictive.
        </p>
        <p>
          LVM oferă și <i>striping</i> (<code>lvcreate -i</code>) și oglindire (<code>--type raid1</code>) în interiorul unui VG; acestea nu fac parte din obiectivul de examen. Pentru redundanță de disc se folosește de obicei RAID hardware sau <code>mdadm</code>, în afara scopului v1.
        </p>
      </DeepDive>
    </>
  );
}

export const L5_3: TopicModule = {
  id: 'L5.3',
  subtitle: 'vgcreate, vgextend, vgreduce, vgremove, vgs, vgdisplay',
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
  labs: [LAB_L5_3],
  sources: [
    { kind: 'man', ref: 'vgcreate(8), vgextend(8), vgreduce(8), vgremove(8), vgs(8), vgdisplay(8), vgchange(8), pvmove(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Managing LVM volume groups” (storage-managing_lvm_volume_groups), docs.redhat.com necitit (HTTP 403 în C2/C4); de confirmat la review' },
  ],
};
