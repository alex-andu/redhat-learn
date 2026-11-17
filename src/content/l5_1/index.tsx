import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L5_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un disc nou este doar o suprafață goală. Înainte să pui date pe el, îl împarți în <G id="partition">partiții</G>, iar „harta” acestor partiții se numește tabelă de partiții. Pe RHEL 10 folosim formatul <G id="gpt">GPT</G>. Vezi discurile cu <code>lsblk</code> și <code>fdisk -l</code>, creezi tabela cu <code>parted /dev/vdb mklabel gpt</code>, adaugi partiții cu <code>parted … mkpart</code> sau <code>fdisk</code> și le ștergi cu <code>parted … rm N</code> sau cu <code>d</code> în <code>fdisk</code>.
          </p>
          <p>Obiectivul oficial: <i>„List, create, and delete partitions on GPT disks”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un disc (hard disk, SSD, disc virtual dintr-o mașină virtuală) este văzut de kernel ca o înșiruire de <b>sectoare</b>, adică blocuri mici de date (de obicei 512 de octeți sau 4096). Kernelul îl expune ca un <G id="block-device">block device</G>, de exemplu <code>/dev/vdb</code>. Poți scrie direct pe el, dar un singur „bloc uriaș” nu este practic: vrei ca o parte din disc să fie pentru <code>/home</code>, alta pentru swap, alta pentru un volum LVM.
          </p>
          <p>
            Soluția este <b>partiționarea</b>: împarți discul în zone cu limite clare. Fiecare partiție devine propriul block device (<code>/dev/vdb1</code>, <code>/dev/vdb2</code>) și poate fi formatată, montată sau dată lui LVM independent de celelalte. Fără partiții ai un singur sistem de fișiere pe tot discul, fără flexibilitate și fără posibilitatea de a separa, de exemplu, datele de sistem.
          </p>
          <Analogy>Discul este un teren gol. Tabela de partiții este planul cadastral: spune unde începe și unde se termină fiecare parcelă. Sistemul de fișiere este construcția de pe parcelă. Fără plan, nimeni nu știe unde se termină o proprietate și unde începe alta.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Numele discurilor</h4>
          <Table head={['Tip disc', 'Nume disc', 'Nume partiție 1']} rows={[
            ['SATA/SCSI/USB', <code>/dev/sda</code>, <code>/dev/sda1</code>],
            ['Disc virtio (VM KVM)', <code>/dev/vda</code>, <code>/dev/vda1</code>],
            ['NVMe', <code>/dev/nvme0n1</code>, <code>/dev/nvme0n1p1</code>],
          ]} />
          <p>Litera de după <code>sd</code>/<code>vd</code> (a, b, c…) arată ordinea în care a fost detectat discul. Ea se poate schimba între reboot-uri; de aceea, în L5.5, montările persistente se fac cu UUID sau label, nu cu nume de dispozitiv.</p>
          <h4>MBR și GPT</h4>
          <Table head={['', <G id="mbr">MBR</G>, <G id="gpt">GPT</G>]} rows={[
            ['Dimensiune maximă disc', '2 TiB', 'practic nelimitată (ZiB)'],
            ['Număr de partiții', '4 primare (sau 3 + 1 extinsă cu logice)', '128 implicit'],
            ['Copie de rezervă a tabelei', 'nu', 'da, la sfârșitul discului'],
            ['Identificare partiție', 'cod de tip pe 1 octet', 'GUID de tip + GUID unic + nume'],
            ['Cerut de EX200', 'nu este menționat', 'da: „GPT disks”'],
          ]} />
          <p>
            GPT este asociat cu UEFI, dar poate fi folosit și pe discuri de date indiferent de firmware. Ce trebuie să reții: pe un disc GPT <b>nu există partiții extinse sau logice</b>; toate sunt la același nivel.
          </p>
          <h4>Ce scrie <code>mklabel gpt</code></h4>
          <p>
            Scrie un „protective MBR” (o zonă care îi spune programelor vechi „discul este ocupat”), antetul GPT la sectorul 1 și tabela de intrări imediat după. O copie identică se scrie la sfârșitul discului. Datele din partiții nu sunt șterse fizic, dar nu mai pot fi găsite, deoarece nu mai există harta lor.
          </p>
          <h4>Aliniere</h4>
          <p>
            Un disc modern citește și scrie în unități de 4 KiB sau mai mari. Dacă o partiție începe „pe la mijlocul” unei unități, fiecare scriere atinge două unități și devine mai lentă. De aceea partițiile încep la 1 MiB (sectorul 2048): este multiplu al oricărei unități uzuale. <code>fdisk</code> o face implicit; în <code>parted</code> folosești <code>1MiB</code> ca început.
          </p>
          <h4>Cum află kernelul de partiții</h4>
          <p>
            La detectarea discului, kernelul citește tabela și creează dispozitivele <code>vdb1</code>, <code>vdb2</code>… <code>udev</code> adaugă legături în <code>/dev/disk/by-uuid</code>, <code>by-label</code> și <code>by-partuuid</code>. Dacă modifici tabela cât timp discul este în uz, kernelul poate refuza re-citirea; <G id="partprobe">partprobe</G> o cere explicit.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>LVM</b> (L5.2–L5.4): o partiție poate deveni volum fizic (<code>pvcreate /dev/vdb1</code>); poți folosi și discul întreg.</li>
            <li><b>Sisteme de fișiere</b> (C6): după partiționare, <code>mkfs.xfs /dev/vdb1</code> creează XFS.</li>
            <li><b>/etc/fstab și UUID</b> (L5.5): partițiile primesc UUID-uri abia după formatare; <code>blkid</code> le arată.</li>
            <li><b>Swap</b> (L5.6): o partiție poate fi formatată cu <code>mkswap</code>.</li>
            <li><b>Boot</b> (L4.1): partițiile <code>/boot</code> și (la UEFI) ESP sunt create la instalare; nu le atingi fără motiv.</li>
            <li><b>Permisiuni</b>: partiționarea cere root (<code>sudo</code>, L1.10).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>La adăugarea unui disc nou pentru date, backup sau un volum LVM.</li>
            <li>La examen: „creează o partiție de 500 MiB pe /dev/vdb” sau „șterge partiția X și recreeaz-o mai mare”.</li>
            <li>Când vrei separare clară între componente (de exemplu o partiție doar pentru swap).</li>
            <li>La recuperare: o partiție ștearsă din greșeală se poate recrea cu aceleași limite exacte (rare cazuri; din acest motiv notezi <code>parted print</code> înainte).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le numai pe un sistem de test, pe un disc GOL. Output-urile sunt <b>Ilustrative</b>; nu au fost rulate pe RHEL 10 la redactare. Comenzile de scriere (<code>mklabel</code>, <code>mkpart</code>, <code>rm</code>) <b>distrug date</b> dacă țintești discul greșit.
        </Callout>

        <h4>1. Vezi ce discuri ai: <code>lsblk</code>, <code>fdisk -l</code>, <code>blkid</code></h4>
        <CodeBlock title="comenzi" code={`lsblk\nlsblk -f\nlsblk -p /dev/vdb\nsudo fdisk -l /dev/vdb\nsudo blkid\ncat /proc/partitions`} explain={[
          ['lsblk', 'list block devices: arbore cu discuri (disk) și partiții (part), dimensiuni, MOUNTPOINTS. Nu necesită root.'],
          ['-f', 'adaugă coloanele FSTYPE (xfs, ext4, swap, LVM2_member), LABEL, UUID și punctul de montare.'],
          ['-p', 'afișează căile complete (/dev/vdb1) în loc de numele scurte.'],
          ['fdisk -l /dev/vdb', '-l = listează tabela de partiții a discului dat; fără disc, listează toate discurile.'],
          ['blkid', 'afișează UUID și tipul de sistem de fișiere pentru fiecare dispozitiv formatat (nu apar discurile neformatate).'],
          ['/proc/partitions', 'lista brută a discurilor și partițiilor cunoscute de kernel, cu dimensiunea în blocuri de 1 KiB.'],
        ]} />

        <h4>2. Creează tabela GPT: <code>parted … mklabel gpt</code></h4>
        <CodeBlock title="comenzi" code={`sudo parted /dev/vdb mklabel gpt\nsudo parted /dev/vdb print`} explain={[
          ['sudo', 'partiționarea cere root.'],
          ['parted /dev/vdb', 'discul (nu partiția!) pe care lucrezi.'],
          ['mklabel gpt', 'scrie o tabelă nouă GPT. Orice tabelă anterioară dispare. Sinonim: mktable.'],
          ['print', 'afișează tabela: model, dimensiune, „Partition Table”, apoi partițiile.'],
        ]} />

        <h4>3. Creează o partiție: <code>parted … mkpart</code></h4>
        <CodeBlock title="comenzi" code={`sudo parted /dev/vdb mkpart data 1MiB 1GiB\nsudo parted /dev/vdb mkpart swap 1GiB 2GiB\nsudo parted /dev/vdb set 1 lvm on\nsudo parted /dev/vdb print`} explain={[
          ['mkpart NUME START SFÂRȘIT', 'creează o partiție. Pe GPT primul argument este NUMELE (etichetă liber aleasă), nu un tip. START și SFÂRȘIT pot fi în MiB, GiB, MB, % din disc etc.'],
          ['1MiB', 'MiB (puteri de 2) ≠ MB (puteri de 10). Începutul la 1MiB asigură alinierea.'],
          ['set 1 lvm on', 'marchează partiția 1 cu flag-ul „lvm” (tipul GUID Linux LVM); util pentru claritate, LVM funcționează și fără el.'],
        ]} />
        <Callout kind="tip" title="Dimensiune, nu sfârșit">
          În <code>parted</code> dai punctul de SFÂRȘIT, nu dimensiunea. Pentru 1 GiB care începe la 1 GiB, sfârșitul este 2 GiB. Pentru a afla „unde mă aflu”, rulează <code>print free</code>: arată și spațiul liber.
        </Callout>

        <h4>4. Creează partiții interactiv: <code>fdisk</code></h4>
        <CodeBlock title="comenzi (în fdisk)" code={`sudo fdisk /dev/vdb\n  p      # print: arată tabela curentă\n  g      # creează o tabelă GPT nouă (în memorie)\n  n      # new: partiție nouă\n  (Enter, Enter)   # număr și primul sector: valorile implicite\n  +1G              # ultimul sector: dimensiune de 1 GiB\n  t      # type: schimbă tipul (opțional)\n  d      # delete: șterge o partiție\n  w      # write: scrie pe disc și iese\n  q      # quit: iese FĂRĂ să scrie`} explain={[
          ['p', 'print — listează tabela curentă; folosește-l des pentru a vedea ce ai făcut.'],
          ['g', 'creează o tabelă GPT nouă. Ceea ce erai înainte pe disc dispare când scrii cu w.'],
          ['n', 'partiție nouă. Întreabă: număr (Enter = următorul liber), primul sector (Enter = primul aliniat), ultimul sector. La ultimul poți scrie +1G sau +500M (relativ la început).'],
          ['d', 'șterge o partiție; întreabă numărul.'],
          ['w', 'scrie tabela și cere kernelului să o recitească.'],
          ['q', 'ieși fără să salvezi: singura „plasă de siguranță” a fdisk.'],
        ]} />

        <h4>5. Fă kernelul să vadă schimbările</h4>
        <CodeBlock title="comenzi" code={`sudo partprobe /dev/vdb\nsudo udevadm settle\nlsblk /dev/vdb`} explain={[
          ['partprobe /dev/vdb', 'cere kernelului să recitească tabela de partiții a discului.'],
          ['udevadm settle', 'așteaptă ca udev să termine crearea fișierelor din /dev/disk/by-*.'],
        ]} />

        <h4>6. Șterge o partiție: <code>parted … rm</code></h4>
        <CodeBlock title="comenzi" code={`sudo parted /dev/vdb print\nsudo parted /dev/vdb rm 2\nsudo parted /dev/vdb print`} explain={[
          ['rm 2', 'șterge partiția cu numărul 2 din tabelă (numărul din coloana „Number”). Datele nu se șterg fizic, dar nu mai sunt accesibile.'],
        ]} />
        <Callout kind="warn" title="Capcane la ștergere">
          Dacă partiția este montată sau folosită de LVM, demontează-o / eliberează-o mai întâi (L5.3, C6). Altfel kernelul nu va recunoaște modificarea până la reboot.
        </Callout>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="lsblk -f" kind="session" label="illustrative" code={`[student@server1 ~]$ lsblk -f\nNAME   FSTYPE FSVER LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINTS\nvda\n├─vda1 xfs          boot  3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b  620M    36% /boot\n└─vda2 xfs          root  9d8c7b6a-5f4e-4d3c-b2a1-0f9e8d7c6b5a   14G    26% /\nvdb\n└─vdb1`} />
        <p className="small"><code>NAME</code> = dispozitiv; <code>FSTYPE</code> = tipul sistemului de fișiere (gol = neformatat); <code>UUID</code> = identificator unic al sistemului de fișiere (apare abia după mkfs); <code>MOUNTPOINTS</code> = unde este montat. Aici <code>vdb1</code> există, dar nu are sistem de fișiere. UUID-urile sunt fictive; coloanele exacte depind de versiunea util-linux.</p>
        <CodeBlock title="fdisk -l" kind="session" label="illustrative" code={`[root@server1 ~]# fdisk -l /dev/vdb\nDisk /dev/vdb: 4 GiB, 4294967296 bytes, 8388608 sectors\nUnits: sectors of 1 * 512 = 512 bytes\nSector size (logical/physical): 512 bytes / 512 bytes\nI/O size (minimum/optimal): 512 bytes / 512 bytes\nDisklabel type: gpt\nDisk identifier: 6E1F7B3C-2A9D-4C11-A4E9-1D2C3B4A5F60\n\nDevice     Start     End Sectors Size Type\n/dev/vdb1   2048 2097151 2095104   1G Linux filesystem`} />
        <p className="small"><code>Disk /dev/vdb: 4 GiB</code> = dimensiunea totală. <code>Disklabel type: gpt</code> = formatul tabelei (la MBR ar fi „dos”). <code>Start</code> = 2048 → aliniere 1 MiB. <code>Type</code> = tipul partiției (GUID-ul tradus). Valorile sunt exemple.</p>
        <CodeBlock title="parted print free" kind="session" label="illustrative" code={`[root@server1 ~]# parted /dev/vdb print free\nNumber  Start   End     Size    File system  Name   Flags\n        17.4kB  1049kB  1031kB  Free Space\n 1      1049kB  1074MB  1073MB               data\n        1074MB  4294MB  3220MB  Free Space`} />
        <p className="small">Liniile „Free Space” arată zonele nealocate; poți vedea unde începe o partiție nouă. Primele 1031 kB sunt rezervate pentru antetul GPT.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>lsblk /dev/vdb</code>: partițiile cerute apar, cu dimensiunile așteptate.</li>
            <li><code>parted /dev/vdb print</code>: „Partition Table: gpt”.</li>
            <li><code>fdisk -l /dev/vdb</code>: „Disklabel type: gpt”.</li>
            <li>Dacă o partiție nouă nu apare: <code>partprobe</code>, apoi <code>lsblk</code> din nou.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Tabela de partiții este scrisă pe disc, deci supraviețuiește reboot-ului fără nicio configurare. Ce <b>nu</b> este persistent: montarea (L5.5), care cere o linie în <code>/etc/fstab</code>. Confirmare manuală: repornești (în mediu de test) și rulezi <code>lsblk</code>; partițiile trebuie să fie acolo.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Partiția nouă nu apare', 'kernelul nu a recitit tabela', <code>lsblk</code>, <><code>partprobe /dev/vdb</code>; dacă tot nu, reboot</>],
          [<code>Warning: ... failed to re-read the partition table</code>, 'o partiție a discului e în uz', <code>findmnt</code>, 'demontează sau repornește'],
          [<code>Error: Can't have overlapping partitions</code>, 'start/sfârșit se suprapun cu alta', <code>parted … print free</code>, 'alege zona liberă'],
          ['Partiție nealiniată', 'început dat de mână', <code>parted … align-check optimal 1</code>, <>recreează cu <code>1MiB</code></>],
          [<code>No such file or directory</code>, 'nume de disc greșit', <code>lsblk</code>, 'folosește numele corect'],
          ['Disc „dos” când voiai GPT', 'tabelă veche MBR', <code>fdisk -l</code>, <><code>mklabel gpt</code> (șterge tot!)</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Țintești discul de sistem (<code>/dev/vda</code>) în loc de discul gol. Verifică cu <code>lsblk</code> ÎNAINTE.</>,
          <>Uiți că <code>parted</code> scrie imediat; <code>fdisk</code> cere <code>w</code>. Dacă ieși din fdisk cu <code>q</code>, nimic nu s-a salvat.</>,
          <>În <code>parted mkpart</code> la GPT, primul argument este numele, nu tipul (<code>primary</code> există doar la MBR).</>,
          <>Dai dimensiunea în loc de poziția de sfârșit la <code>parted</code> (la fdisk, <code>+1G</code> este o dimensiune).</>,
          <>Confunzi MB cu MiB; examenul acceptă de regulă o toleranță, dar la 1MiB începi aliniat.</>,
          <>Uiți <code>partprobe</code> și crezi că partiția nu s-a creat.</>,
          <>Încerci să creezi „partiții extinse” pe GPT; nu există.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: structura GPT, GUID-uri și gdisk">
        <p>
          Sectorul 0 conține un MBR „protectiv” cu o singură partiție de tip 0xEE, care acoperă tot discul, ca instrumentele vechi să nu creadă că discul este gol. Sectorul 1 conține antetul GPT (semnătura „EFI PART”, suma de control, localizarea tabelei și a copiei). Urmează implicit 128 de intrări de câte 128 de octeți. La sfârșitul discului se află antetul și tabela de rezervă; dacă cea principală este coruptă, instrumentele o refac din cea de rezervă.
        </p>
        <p>
          Fiecare partiție are un GUID de tip (de exemplu „Linux filesystem”, „Linux swap”, „Linux LVM”, „EFI System”) și un GUID unic, vizibil în <code>/dev/disk/by-partuuid</code>. <code>gdisk</code> (pachetul <code>gdisk</code>) este un editor dedicat GPT, cu comenzi similare cu <code>fdisk</code> și tipuri precum 8300 (Linux filesystem), 8200 (swap), 8e00 (LVM). Detalii despre disponibilitatea lui pe RHEL 10: de confirmat.
        </p>
      </DeepDive>
    </>
  );
}

export const L5_1: TopicModule = {
  id: 'L5.1',
  subtitle: 'lsblk, fdisk, parted, GPT, partprobe, ștergerea partițiilor',
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
  labs: [LAB_L5_1],
  sources: [
    { kind: 'man', ref: 'lsblk(8), fdisk(8), parted(8), blkid(8), partprobe(8), gdisk(8)' },
    { kind: 'doc', ref: 'RHEL 10 — „Getting started with partitions” (storage-getting_started_with_partitions), docs.redhat.com necitit (HTTP 403 în C2/C4); de confirmat la review' },
  ],
};
