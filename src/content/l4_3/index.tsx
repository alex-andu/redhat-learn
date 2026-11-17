import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Dacă ai pierdut parola de root a <b>propriului</b> sistem și ai acces la consola lui, poți întrerupe boot-ul din meniul GRUB2: apeși <code>e</code>, adaugi <G id="rd-break">rd.break</G> la linia kernelului și pornești cu <code>Ctrl+x</code>. Ajungi în initramfs, într-un shell de root fără parolă, unde remontezi <code>/sysroot</code> scriibil, intri cu <code>chroot</code>, rulezi <code>passwd root</code> și ceri reetichetarea SELinux cu <code>touch /.autorelabel</code>.
          </p>
          <p>Obiectivul oficial: <i>„Interrupt the boot process in order to gain access to a system”</i>.</p>
        </Summary>
      </Sec>

      <Callout kind="warn" title="Doar pe sisteme ale tale">
        Procedura funcționează pentru că ai acces <i>fizic sau la consolă</i> la mașină. Nu o folosi pe sisteme care nu îți aparțin sau fără autorizare. Pe servere reale, accesul la consolă și la GRUB2 se protejează (parolă GRUB, criptarea discului) tocmai pentru că procedura e atât de directă.
      </Callout>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Parola de root deschide totul. Dacă o pierzi și nu mai ai un alt cont administrativ (<code>sudo</code>, L1.10), nu poți repara sistemul. Linux are însă o regulă simplă: <b>cine controlează consola mașinii controlează mașina</b>. Bootloader-ul îți permite să schimbi parametrii kernelului, deci și să spui boot-ului „oprește-te înainte să ceri parola”.
          </p>
          <p>
            Același mecanism ajută și la alte situații: un fișier de configurare stricat care împiedică boot-ul, un serviciu care blochează pornirea. Întreruperea boot-ului îți dă un punct de intrare de unde poți repara.
          </p>
          <Analogy>Uși de serviciu: în fața clădirii stă paznicul care cere legitimația (parola root). Dacă ai cheia de la <i>subsol</i> (accesul la consolă), poți intra prin spate, înainte ca paznicul să își înceapă tura. De aceea clădirile serioase încuie și subsolul.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Unde te „infiltrezi”: initramfs</h4>
          <p>
            Pe parcursul boot-ului (L4.1), kernelul pornește cu un sistem temporar în RAM, <G id="initramfs">initramfs</G>. Acolo este pregătită rădăcina reală: kernelul o montează la <G id="sysroot">/sysroot</G>, apoi un pas final (<code>switch_root</code>) o face „/” și predă controlul lui <code>systemd</code>. Parametrul <G id="rd-break">rd.break</G> spune lui dracut (programul din initramfs): <i>oprește-te chiar înainte de switch_root</i>. Primești un shell de root, fără parolă, pentru că nu s-a pornit nicio autentificare.
          </p>
          <h4>De ce sunt necesari pașii</h4>
          <ol>
            <li><b>Editezi linia kernelului.</b> Meniul GRUB2 permite, cu <code>e</code>, editarea temporară a <G id="kernel-cmdline">liniei de comandă</G>. Nu se scrie nimic pe disc.</li>
            <li><b><code>mount -o remount,rw /sysroot</code>.</b> Rădăcina este montată doar pentru citire în această etapă; fără drept de scriere, <code>passwd</code> nu poate modifica <code>/etc/shadow</code>.</li>
            <li><b><code>chroot /sysroot</code>.</b> Shell-ul curent vede rădăcina initramfs. <G id="chroot">chroot</G> o înlocuiește cu sistemul tău: <code>/etc/shadow</code> devine fișierul real.</li>
            <li><b><code>passwd root</code>.</b> Setezi parola nouă.</li>
            <li><b><code>touch /.autorelabel</code>.</b> Fișierul modificat din initramfs are o etichetă SELinux greșită; <G id="autorelabel">/.autorelabel</G> cere reetichetare la boot, ca SELinux (Enforcing) să nu blocheze autentificarea. Vezi C10.</li>
            <li><b>Două <code>exit</code>.</b> Primul părăsește chroot, al doilea continuă boot-ul normal.</li>
          </ol>
          <h4>Alternative și limite</h4>
          <Table head={['Metodă', 'Cere parola root?', 'Observație']} rows={[
            [<code>systemd.unit=rescue.target</code>, 'da', 'bun când parola e cunoscută'],
            [<code>systemd.unit=emergency.target</code>, 'da', 'cel mai minimal; rădăcina poate fi doar-citire'],
            [<code>rd.break</code>, 'nu', 'oprire în initramfs; folosit pentru parola pierdută'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Boot</b> (L4.1) și <b>target-uri</b> (L4.2): rd.break intervine <i>înainte</i> de systemd; <code>systemd.unit=</code> intervine <i>în</i> systemd.</li>
            <li><b>Parole și conturi</b> (L1.10, C9): <code>passwd</code>, <code>/etc/shadow</code>.</li>
            <li><b>SELinux</b> (C10): contexte, reetichetare.</li>
            <li><b>Sisteme de fișiere</b> (C5/C6): montare <code>ro</code>/<code>rw</code>, <code>remount</code>.</li>
            <li><b>Securitate fizică</b>: parolă GRUB, criptarea discului, accesul la consola hypervisor-ului.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Parola de root pierdută pe o VM sau un server propriu.</li>
            <li>Sistem care nu mai pornește corect și vrei un shell înainte de pornirea serviciilor.</li>
            <li>La examen: <i>„Reset the root password”</i> este un scenariu clasic; verifici după reboot cu <code>su -</code> sau login ca root.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Procedura se face la consola unei mașini virtuale proprii. Output-urile sunt <b>Ilustrative</b>; textul exact din initramfs depinde de versiune și nu a fost rulat pe RHEL 10 la redactare.
        </Callout>

        <h4>1. Întrerupe boot-ul din GRUB2</h4>
        <CodeBlock title="în meniul GRUB2 (consolă)" code={`# 1. Repornește mașina și, la meniu, apasă o tastă ca să oprești numărătoarea.\n# 2. Selectează intrarea kernelului și apasă:  e\n# 3. Coboară cu săgețile la linia care începe cu "linux"; apasă End.\n# 4. Adaugă la sfârșit, după un spațiu:\n rd.break\n# 5. Pornește cu:  Ctrl+x`} explain={[
          ['e', 'editează temporar intrarea de boot.'],
          ['linia „linux …”', 'linia care conține kernelul și parametrii lui (root=, ro, rhgb, quiet).'],
          ['rd.break', 'oprește boot-ul în initramfs, înainte de switch_root.'],
          ['Ctrl+x', 'pornește cu modificarea. Esc = anulează.'],
        ]} />

        <h4>2. În shell-ul initramfs: remontează și intră în sistem</h4>
        <CodeBlock title="comenzi (în initramfs)" code={`mount | grep sysroot\nmount -o remount,rw /sysroot\nchroot /sysroot`} explain={[
          ['mount | grep sysroot', 'afișează cum este montat /sysroot; în opțiuni vei vedea ro.'],
          ['mount', 'fără argumente, listează toate montările (L1.5 pentru pipe, L1.6 pentru grep).'],
          ['-o remount,rw', 'opțiuni: remount = reîmprospătează o montare existentă; rw = citire și scriere.'],
          ['chroot /sysroot', 'schimbă rădăcina shell-ului; de acum „/” este sistemul tău real.'],
        ]} />

        <h4>3. Schimbă parola și cere reetichetarea</h4>
        <CodeBlock title="comenzi (în chroot)" code={`passwd root\ntouch /.autorelabel\nexit\nexit`} explain={[
          ['passwd root', 'setează parola utilizatorului root; o ceri de două ori; textul nu apare pe ecran.'],
          ['touch /.autorelabel', 'creează un fișier gol; existența lui declanșează reetichetarea SELinux la boot.'],
          ['exit', 'prima dată: părăsește chroot; a doua oară: continuă boot-ul.'],
        ]} />

        <h4>4. După boot: confirmă</h4>
        <CodeBlock title="comenzi" code={`su -\nid\nls -a / | grep autorelabel\ncat /proc/cmdline\ngetenforce`} explain={[
          ['su -', 'devine root cu mediul de login; cere parola nouă.'],
          ['id', 'uid=0(root) confirmă că ești root.'],
          ['ls -a / | grep autorelabel', '-a include fișierele ascunse (cele care încep cu punct); nu trebuie să mai găsești fișierul.'],
          ['cat /proc/cmdline', 'arată parametrii cu care a pornit kernelul; nu trebuie să mai conțină rd.break.'],
          ['getenforce', 'arată modul SELinux (Enforcing/Permissive/Disabled); tratat în C10.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="în initramfs" kind="session" label="illustrative" code={`switch_root:/# mount | grep sysroot\n/dev/mapper/rhel-root on /sysroot type xfs (ro,relatime,seclabel,attr2,inode64,noquota)\nswitch_root:/# mount -o remount,rw /sysroot\nswitch_root:/# mount | grep sysroot\n/dev/mapper/rhel-root on /sysroot type xfs (rw,relatime,seclabel,attr2,inode64,noquota)`} />
        <p className="small">Linia are forma <code>dispozitiv on punct_de_montare type sistem_fișiere (opțiuni)</code>. Prima oară opțiunea este <code>ro</code>; după <code>remount,rw</code> devine <code>rw</code>. Numele dispozitivului și opțiunile sunt exemple.</p>
        <CodeBlock title="passwd" kind="session" label="illustrative" code={`sh-5.2# passwd root\nChanging password for user root.\nNew password:\nRetype new password:\npasswd: all authentication tokens updated successfully.`} />
        <p className="small">Parola nu este afișată în timp ce o scrii. „all authentication tokens updated successfully” înseamnă că <code>passwd</code> a scris. Dacă vezi <code>Authentication token manipulation error</code>, rădăcina este încă read-only sau nu ești în chroot.</p>
        <CodeBlock title="după boot" kind="session" label="illustrative" code={`[student@server1 ~]$ cat /proc/cmdline\nBOOT_IMAGE=(hd0,msdos1)/vmlinuz-5.14.0 root=/dev/mapper/rhel-root ro rhgb quiet\n[student@server1 ~]$ su -\nPassword:\n[root@server1 ~]# id\nuid=0(root) gid=0(root) groups=0(root)`} />
        <p className="small"><code>/proc/cmdline</code> nu mai conține <code>rd.break</code>: editarea a fost temporară. <code>id</code> confirmă contul root. Versiunea kernelului și dispozitivul sunt exemple.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Autentificarea ca root cu parola nouă (<code>su -</code> sau login la consolă).</li>
            <li><code>ls -a / | grep autorelabel</code>: fără rezultat, deci reetichetarea s-a terminat.</li>
            <li><code>cat /proc/cmdline</code>: fără parametri temporari.</li>
            <li><code>systemctl is-system-running</code>: <code>running</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Parola nouă este scrisă pe disc, în <code>/etc/shadow</code>, deci persistă. Parametrul <code>rd.break</code> este temporar: nu a fost salvat nicăieri. Nu rămâne nimic de curățat în afară de <code>/.autorelabel</code>, pe care sistemul îl șterge singur după reetichetare. Confirmare manuală: încă un reboot și autentificare cu parola nouă.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Authentication token manipulation error</code>, '/sysroot read-only sau fără chroot', <code>mount | grep sysroot</code>, <><code>mount -o remount,rw /sysroot</code>, apoi <code>chroot /sysroot</code></>],
          ['parola nouă este respinsă după boot', <>lipsă <code>/.autorelabel</code></>, 'reface procedura', <>adaugă <code>touch /.autorelabel</code></>],
          ['sistemul pare blocat după exit', 'reetichetare în curs', 'așteaptă', 'poate dura minute; repornește singur'],
          ['GRUB2 cere utilizator și parolă la e', 'meniul este protejat', '—', 'folosește parola GRUB; altfel nu poți edita'],
          ['tasta e nu face nimic', 'meniul nu s-a oprit sau selecția greșită', 'repornește, apasă tasta mai repede', 'oprește numărătoarea, selectează intrarea, apasă e'],
          ['rămâi în shell-ul initramfs', 'un singur exit', 'prompt switch_root:/#', 'mai dă un exit'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți <code>chroot /sysroot</code>: schimbi parola initramfs-ului, care se pierde.</>,
          <>Uiți <code>touch /.autorelabel</code>: parola pare să nu funcționeze.</>,
          <>Scrii numele fișierului greșit (fără punctul de la început: <code>autorelabel</code>) sau îl creezi în alt director decât rădăcina.</>,
          <>Un singur <code>exit</code>.</>,
          <>Crezi că modificarea din GRUB2 e permanentă.</>,
          <>Adaugi <code>rd.break</code> pe altă linie decât cea a kernelului.</>,
          <>Încerci procedura pe sisteme care nu sunt ale tale.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: de ce funcționează, protecții și alte puncte de oprire">
        <p>
          Procedura funcționează pentru că nu forțează nimic: folosește mecanismul normal al bootloader-ului. De aceea protecția reală este <i>fizică</i> sau criptografică: parolă pe GRUB2, parolă de firmware (UEFI), criptarea discului cu LUKS (prompt de parolă înainte de montare). Cu disc criptat, <code>rd.break</code> ajunge în initramfs, dar <code>/sysroot</code> nu poate fi montat fără parola de decriptare.
        </p>
        <p>
          dracut (sistemul din initramfs) recunoaște mai multe puncte de oprire, de exemplu <code>rd.break=pre-mount</code> sau <code>rd.break=pre-pivot</code>; fără valoare, <code>rd.break</code> oprește la ultimul punct, înainte de switch_root. Detaliile se găsesc în <code>dracut.cmdline(7)</code>; nu sunt necesare aici.
        </p>
        <p>
          O variantă veche este <code>init=/bin/bash</code> în linia kernelului; pe sistemele moderne cu systemd, <code>rd.break</code> este metoda recomandată în documentația Red Hat pentru RHEL 8 și 9. Confirmarea formulării din ghidul RHEL 10 rămâne de făcut (documentația Red Hat necitită, HTTP 403).
        </p>
      </DeepDive>
    </>
  );
}

export const L4_3: TopicModule = {
  id: 'L4.3',
  subtitle: 'GRUB2 e, rd.break, /sysroot, chroot, passwd, /.autorelabel',
  studyTime: '≈70 min studiu + laborator',
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
  labs: [LAB_L4_3],
  sources: [
    { kind: 'man', ref: 'dracut.cmdline(7), chroot(1), passwd(1), mount(8), kernel-command-line(7)' },
    { kind: 'upstream', ref: 'freedesktop.org — systemd.special(7) (citit 2026-11-16)' },
    { kind: 'doc', ref: 'RHEL 10 — procedura de resetare a parolei root, docs.redhat.com necitit (HTTP 403 în C4); pașii provin din practica documentată pentru RHEL 8/9, de confirmat' },
  ],
};
