import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L5_5 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un sistem de fișiere montat cu <code>mount</code> dispare la reboot. Pentru montări permanente scrii o linie în <G id="fstab">/etc/fstab</G>. Sursa liniei ar trebui să fie un <G id="uuid">UUID</G> sau un <G id="fs-label">label</G>, nu un nume de disc precum <code>/dev/vdb1</code>, care se poate schimba. Afli UUID-ul cu <code>blkid</code> sau <code>lsblk -f</code>, apoi testezi cu <code>mount -a</code>.
          </p>
          <p>Obiectivul oficial: <i>„Configure systems to mount file systems at boot by universally unique ID (UUID) or label”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Când pornește, Linux are nevoie să știe ce să monteze și unde. Fișierul <code>/etc/fstab</code> (<i>file systems table</i>) este lista acestor montări. Fără o intrare aici, un disc adăugat de tine arată bine până la primul reboot, apoi directorul rămâne gol: datele „au dispărut”, de fapt sistemul de fișiere nu mai este montat.
          </p>
          <p>
            Problema numelor: <code>/dev/vdb</code> înseamnă „al doilea disc detectat de kernel”. Dacă adaugi un disc, schimbi controlerul sau ordinea de inițializare se modifică, același disc poate deveni <code>/dev/vdc</code>, iar linia din fstab montează altceva sau nimic. UUID-ul și label-ul sunt scrise <i>în interiorul</i> sistemului de fișiere, deci îl urmăresc oriunde ar apărea.
          </p>
          <Analogy>Numele dispozitivului este numărul locului din sală („locul 12”): se schimbă dacă lumea se așază altfel. UUID-ul este numărul de pe buletin: te identifică oriunde te-ai așeza. Label-ul este numele tău mic: ușor de ținut minte, dar două persoane pot avea același nume.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Cele șase câmpuri din fstab</h4>
          <Table head={['#', 'Câmp', 'Exemplu', 'Rol']} rows={[
            ['1', 'sursă', <code>UUID=3b1e…</code>, 'ce se montează: UUID=, LABEL=, PARTUUID=, sau o cale (/dev/datavg/data)'],
            ['2', 'punct de montare', <code>/data</code>, 'directorul (existent) pe care apare conținutul; pentru swap: none'],
            ['3', 'tip', <code>xfs</code>, 'tipul sistemului de fișiere (xfs, ext4, swap, nfs…)'],
            ['4', 'opțiuni', <code>defaults</code>, 'opțiuni de montare separate prin virgulă (defaults, noatime, nofail, ro…)'],
            ['5', 'dump', <code>0</code>, 'folosit de utilitarul dump; practic mereu 0'],
            ['6', 'fsck', <code>0</code>, 'ordinea verificării la boot: 1 pentru /, 2 pentru altele, 0 = nu (XFS: 0)'],
          ]} />
          <h4>Ce se întâmplă la boot</h4>
          <p>
            <code>systemd-fstab-generator</code> citește <code>/etc/fstab</code> și creează unități <code>.mount</code> (de exemplu <code>data.mount</code>). systemd le montează în paralel și în ordinea dependențelor. De aceea, după ce editezi fstab, rulezi <code>systemctl daemon-reload</code>: regenerează unitățile (<code>mount -a</code> funcționează și fără, dar mesajul „unit is out of date” te poate avertiza).
          </p>
          <h4>De unde vin UUID și label</h4>
          <p>
            La <code>mkfs.xfs</code> / <code>mkfs.ext4</code> se generează un UUID aleator, scris în superblock. Label-ul este opțional (<code>-L</code>). <code>udev</code> citește superblock-ul la detectarea dispozitivului și creează legături în <code>/dev/disk/by-uuid/</code> și <code>/dev/disk/by-label/</code>. Când mount primește <code>UUID=…</code>, caută legătura în <code>by-uuid</code>.
          </p>
          <h4>UUID vs PARTUUID</h4>
          <p>
            <b>UUID</b> aparține sistemului de fișiere; se schimbă dacă reformatezi. <b>PARTUUID</b> aparține partiției (tabela GPT); rămâne la reformatare. Obiectivul spune UUID sau label, deci folosești cele două.
          </p>
          <h4>Opțiuni utile</h4>
          <Table head={['Opțiune', 'Efect']} rows={[
            [<code>defaults</code>, 'rw, suid, dev, exec, auto, nouser, async'],
            [<code>noatime</code>, 'nu actualizează timpul ultimului acces; scrieri mai puține'],
            [<code>nofail</code>, 'dacă dispozitivul lipsește, boot-ul continuă (esențial pentru discuri non-critice)'],
            [<code>ro</code>, 'montare doar pentru citire'],
            [<code>x-systemd.device-timeout=…</code>, 'cât așteaptă systemd dispozitivul (menționat)'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Partiții și LV-uri</b> (L5.1, L5.4): sursa poate fi o partiție, un LV sau un disc întreg.</li>
            <li><b>Sisteme de fișiere</b> (C6): mkfs scrie UUID-ul; xfs_admin / tune2fs schimbă label-ul.</li>
            <li><b>systemd</b> (L4.9): fiecare linie devine o unitate <code>.mount</code>; <code>systemctl status data.mount</code>.</li>
            <li><b>Boot</b> (L4.1, L4.3): o linie greșită fără <code>nofail</code> poate duce în emergency mode.</li>
            <li><b>SELinux</b> (C10): sistemele de fișiere noi primesc contextul implicit; uneori trebuie <code>restorecon</code>.</li>
            <li><b>NFS</b> (C6): aceeași tabelă, cu tip <code>nfs</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La fiecare disc, partiție sau LV adăugat care trebuie să fie disponibil după reboot.</li>
            <li>La examen: „mount /dev/… on /data persistently using the UUID” sau „by label”.</li>
            <li>Când un sistem nu mai pornește după editarea fstab: recuperare din emergency shell.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe un sistem de test. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare. Un fstab greșit poate bloca boot-ul; fă o copie de rezervă înainte.
        </Callout>

        <h4>1. Află UUID și label: <code>blkid</code>, <code>lsblk -f</code></h4>
        <CodeBlock title="comenzi" code={`sudo blkid\nsudo blkid /dev/vdb1\nlsblk -f\nlsblk -o NAME,FSTYPE,LABEL,UUID,MOUNTPOINTS\nls -l /dev/disk/by-uuid/ /dev/disk/by-label/`} explain={[
          ['blkid', 'listează toate dispozitivele cu sistem de fișiere: UUID, TYPE, LABEL, PARTUUID.'],
          ['blkid /dev/vdb1', 'doar dispozitivul dat.'],
          ['lsblk -f', 'arbore cu FSTYPE, LABEL, UUID, spațiu și punct de montare.'],
          ['-o NAME,FSTYPE,…', 'alegi coloanele afișate.'],
          ['/dev/disk/by-uuid/', 'legături create de udev: numele este UUID, ținta este dispozitivul.'],
        ]} />

        <h4>2. Setează un label</h4>
        <CodeBlock title="comenzi" code={`sudo mkfs.xfs -L data /dev/vdb1\nsudo umount /dev/vdb1\nsudo xfs_admin -L data /dev/vdb1\nsudo e2label /dev/vdb2 backup\nsudo tune2fs -L backup /dev/vdb2`} explain={[
          ['mkfs.xfs -L data', 'creează XFS cu label „data” (max. 12 caractere la XFS).'],
          ['xfs_admin -L data', 'schimbă label-ul unui XFS existent, DEMONTAT.'],
          ['e2label / tune2fs -L', 'echivalentele pentru ext2/3/4.'],
        ]} />

        <h4>3. Creează punctul de montare și testează montarea manuală</h4>
        <CodeBlock title="comenzi" code={`sudo mkdir /data\nsudo mount UUID=3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b /data\nsudo mount LABEL=data /data\nfindmnt /data\nsudo umount /data`} explain={[
          ['mkdir /data', 'directorul trebuie să existe.'],
          ['mount UUID=… /data', 'montează după UUID; arată că identificatorul funcționează.'],
          ['mount LABEL=data /data', 'echivalent, după label.'],
          ['findmnt /data', 'arată sursa, tipul și opțiunile montării.'],
          ['umount /data', 'demontează (după punct sau după dispozitiv).'],
        ]} />

        <h4>4. Editează /etc/fstab</h4>
        <CodeBlock title="/etc/fstab" kind="config" code={`# <sursă>                                   <punct>  <tip>  <opțiuni>        <dump> <fsck>\nUUID=3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b  /data    xfs    defaults         0      0\nLABEL=archive                               /archive xfs    defaults,nofail  0      0\n/dev/datavg/data                            /srv/db  xfs    defaults         0      0`} explain={[
          ['UUID=… /data xfs defaults 0 0', 'montează după UUID; opțiuni implicite; fără dump/fsck.'],
          ['LABEL=archive … defaults,nofail', 'după label; nofail = nu bloca boot-ul dacă lipsește.'],
          ['/dev/datavg/data', 'un LV poate fi dat prin cale; este stabilă.'],
          ['# …', 'linie de comentariu.'],
        ]} />
        <Callout kind="tip" title="Copiază UUID-ul fără greșeli">
          Evită scrierea de mână: <code>blkid -s UUID -o value /dev/vdb1</code> afișează doar valoarea. Poți adăuga linia direct: <code>echo "UUID=$(blkid -s UUID -o value /dev/vdb1) /data xfs defaults 0 0" | sudo tee -a /etc/fstab</code> (<code>-a</code> = append; fără el fișierul ar fi suprascris).
        </Callout>

        <h4>5. Testează și reîncarcă</h4>
        <CodeBlock title="comenzi" code={`sudo systemctl daemon-reload\nsudo findmnt --verify\nsudo mount -a\nfindmnt --fstab /data\nsystemctl status data.mount`} explain={[
          ['systemctl daemon-reload', 'regenerează unitățile .mount după editarea fstab.'],
          ['findmnt --verify', 'verifică fstab: sintaxă, existența surselor și a punctelor de montare.'],
          ['mount -a', 'montează tot ce e în fstab și încă nemontat; arată imediat erorile.'],
          ['findmnt --fstab /data', 'arată intrarea din fstab pentru /data.'],
          ['systemctl status data.mount', 'starea unității generate (numele provine din calea /data).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="blkid" kind="session" label="illustrative" code={`[root@server1 ~]# blkid /dev/vdb1 /dev/vdb2\n/dev/vdb1: UUID="3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b" TYPE="xfs" PARTLABEL="data" PARTUUID="a1b2c3d4-0001"\n/dev/vdb2: LABEL="archive" UUID="9d8c7b6a-5f4e-4d3c-b2a1-0f9e8d7c6b5a" TYPE="xfs" PARTUUID="a1b2c3d4-0002"`} />
        <p className="small"><code>UUID</code> și <code>LABEL</code> aparțin sistemului de fișiere; <code>PARTUUID</code> și <code>PARTLABEL</code> aparțin partiției. <code>TYPE</code> = tipul sistemului de fișiere. Pentru fstab folosești <code>UUID</code> sau <code>LABEL</code>. Valorile sunt fictive.</p>
        <CodeBlock title="findmnt --verify" kind="session" label="illustrative" code={`[root@server1 ~]# findmnt --verify\n/data\n   [E] unreachable on boot required source: UUID=3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a29\n0 parse errors, 1 error, 0 warnings`} />
        <p className="small"><code>[E]</code> = eroare, <code>[W]</code> = avertisment. Aici UUID-ul din fstab are un caracter diferit (…29 în loc de …2b): nu corespunde niciunui dispozitiv. Formularea exactă a mesajului poate diferi între versiuni util-linux.</p>
        <CodeBlock title="lsblk -f" kind="session" label="illustrative" code={`[root@server1 ~]# lsblk -f /dev/vdb\nNAME   FSTYPE FSVER LABEL   UUID                                 FSAVAIL FSUSE% MOUNTPOINTS\nvdb\n├─vdb1 xfs    1             3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b  900M     6% /data\n└─vdb2 xfs    1     archive 9d8c7b6a-5f4e-4d3c-b2a1-0f9e8d7c6b5a  900M     6% /archive`} />
        <p className="small">Coloana <code>MOUNTPOINTS</code> goală înseamnă „nemontat”. Dacă la reboot dispare, ai uitat linia din fstab.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>findmnt --verify</code> nu raportează erori.</li>
            <li><code>mount -a</code> nu produce erori.</li>
            <li><code>findmnt /data</code> și <code>df -h /data</code>: montat, tipul corect.</li>
            <li>La final, un reboot de test (în mediu de laborator): volumul rămâne montat.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Persistența este chiar obiectivul: linia din <code>/etc/fstab</code> face montarea să se refacă la fiecare boot. <code>mount</code> singur nu persistă. Confirmare manuală: <code>findmnt --verify</code> + <code>mount -a</code> fără erori, apoi (în test) reboot și <code>findmnt /data</code>. Dacă schimbi UUID-ul (reformatare) sau label-ul, actualizezi și linia.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Emergency mode la boot', 'linie greșită în fstab, fără nofail', <code>journalctl -xb</code>, <>root → editează fstab, comentează linia, <code>reboot</code></>],
          [<code>can't find UUID=…</code>, 'UUID greșit', <code>blkid</code>, 'corectează valoarea'],
          [<code>mount point does not exist</code>, 'directorul lipsește', <code>ls -ld /data</code>, <code>mkdir</code>],
          [<code>wrong fs type</code>, 'tip greșit în câmpul 3', <code>blkid</code>, 'folosește tipul din TYPE='],
          ['Directorul e gol după reboot', 'lipsește linia din fstab', <code>findmnt /data</code>, 'adaugă linia'],
          ['Label duplicat', 'două sisteme au același label', <code>blkid</code>, 'redenumește un label'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești <code>/dev/vdb1</code> în loc de UUID/label când enunțul o cere.</>,
          <>Copiezi un UUID greșit sau amesteci <code>UUID</code> cu <code>PARTUUID</code>.</>,
          <>Ștergi din greșeală liniile sistemului din fstab.</>,
          <>Uiți <code>mkdir</code> pentru punctul de montare.</>,
          <>Faci reboot fără <code>mount -a</code> / <code>findmnt --verify</code>.</>,
          <>Folosești <code>&gt;</code> în loc de <code>&gt;&gt;</code> (<code>tee -a</code>) și suprascrii tot fstab.</>,
          <>Pui <code>fsck 1</code> pe un sistem de fișiere XFS (nu este folosit).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: unități .mount, x-systemd și ordinea la boot">
        <p>
          Fiecare linie fstab devine o unitate generată în <code>/run/systemd/generator/</code>, cu numele derivat din calea de montare (<code>/srv/db</code> → <code>srv-db.mount</code>). Poți folosi opțiuni <code>x-systemd.*</code> (de exemplu <code>x-systemd.automount</code>, <code>x-systemd.device-timeout=</code>) pentru comportamente avansate, dincolo de examen.
        </p>
        <p>
          Dacă o montare marcată cu <code>nofail</code> eșuează, boot-ul continuă și se loghează eroarea în journal (<code>journalctl -b -u srv-db.mount</code>). Fără <code>nofail</code>, <code>local-fs.target</code> nu este atins și sistemul coboară în emergency target (L4.2).
        </p>
      </DeepDive>
    </>
  );
}

export const L5_5: TopicModule = {
  id: 'L5.5',
  subtitle: 'blkid, UUID, label, /etc/fstab, mount -a, findmnt --verify',
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
  labs: [LAB_L5_5],
  sources: [
    { kind: 'man', ref: 'fstab(5), blkid(8), findmnt(8), mount(8), xfs_admin(8), tune2fs(8), systemd-fstab-generator(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Persistently mounting file systems” (storage-persistently_mounting_file_systems) și „Overview of persistent naming attributes”, docs.redhat.com necitit (HTTP 403 în C2/C4); de confirmat la review' },
  ],
};
