import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L7_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="grub2">GRUB 2</G> este bootloader-ul RHEL: programul care pornește înaintea kernelului, îți arată meniul de boot și pasează kernelului <b>linia de comandă</b> (<G id="kernel-cmdline">kernel command line</G>). „Modify the system bootloader” înseamnă, în practică, trei lucruri: să schimbi <b>setările generale</b> (timp de așteptare în meniu, intrarea implicită) în <G id="etc-default-grub"><code>/etc/default/grub</code></G>, să <b>regenerezi</b> <G id="grub-cfg"><code>grub.cfg</code></G> cu <code>grub2-mkconfig</code>, și să modifici <b>argumentele kernelului</b> / kernelul implicit cu <G id="grubby"><code>grubby</code></G>. Rezultatul se confirmă în <code>/proc/cmdline</code> după reboot.
          </p>
          <p>Obiectivul oficial: <i>„Modify the system bootloader”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>De unde începe totul: ce se întâmplă între buton și login</h4>
          <p>
            Ai văzut în L4.1 secvența de boot. O recapitulăm, cu accent pe locul bootloader-ului:
          </p>
          <ol>
            <li><b>Firmware-ul</b> (BIOS sau UEFI) inițializează hardware-ul și caută un program de pornit pe disc.</li>
            <li><b>Bootloader-ul</b> (GRUB 2) este acel program. Rolul lui: să <b>găsească</b> kernelul Linux și <b>initramfs</b>-ul de pe disc, să le încarce în memorie și să-i dea kernelului parametri.</li>
            <li><b>Kernelul</b> pornește, folosește initramfs-ul ca să ajungă la sistemul de fișiere rădăcină, apoi lansează <b>systemd</b> (PID 1).</li>
            <li>systemd ajunge la <b>target</b>-ul implicit (L4.2): multi-user sau graphical.</li>
          </ol>
          <p>
            De ce nu pornește BIOS-ul direct kernelul? Pentru că firmware-ul nu știe să citească sisteme de fișiere moderne (XFS, LVM, criptare), nu poate alege între mai multe kerneluri și nu poate primi parametri. GRUB le știe pe toate: de aceea este încărcat în două etape (un fragment mic, apoi restul din <code>/boot</code>).
          </p>
          <Analogy>
            Bootloader-ul este <b>recepționerul de la hotel</b>: tu (firmware-ul) ajungi la ușă, iar recepționerul (GRUB) îți arată lista camerelor (kernelurile), o alege pe cea implicită dacă nu spui nimic în 5 secunde și îi dă camerei instrucțiunile cu care să fie pregătită (argumentele de kernel).
          </Analogy>

          <h4>De ce modifici bootloader-ul</h4>
          <ul>
            <li>Dai administratorilor mai mult timp să aleagă o intrare din meniu (<code>GRUB_TIMEOUT</code>).</li>
            <li>Alegi ce kernel pornește implicit (după o actualizare, sau când un kernel nou are probleme).</li>
            <li>Adaugi argumente permanente de kernel: consolă serială (<code>console=ttyS0</code>), un mod de debug, dezactivarea unui driver (<code>module_blacklist=…</code>), memorie rezervată.</li>
            <li>Scoți argumentele „frumoase” <code>rhgb quiet</code> ca să vezi mesajele de boot.</li>
            <li>Rezolvi o problemă de boot (L4.3): parametrii temporari din meniu (tasta <code>e</code>) nu persistă; ca să fie permanenți, îi pui cu <code>grubby</code>.</li>
          </ul>
          <Callout kind="warn" title="Greșelile aici pot face sistemul să nu mai pornească">
            Modificările de bootloader sunt exact ce „strică” un boot. Fă lucrurile doar pe o mașină de test, păstrează o copie a fișierelor modificate și știi cum recuperezi din meniul GRUB (editare temporară cu <code>e</code>, <code>rd.break</code> din L4.3) sau din rescue mode.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Fișierele implicate (pe RHEL; de confirmat pe RHEL 10)</h4>
          <Table head={['Fișier / director', 'Rol', 'Se editează?']} rows={[
            [<code>/etc/default/grub</code>, 'setări generale (variabile Shell): timeout, intrare implicită, argumente comune de kernel', 'DA — sursa ta de adevăr pentru setările generale'],
            [<code>/etc/grub.d/*</code>, 'scripturi care generează părțile din grub.cfg (00_header, 10_linux, 40_custom …)', 'rar; 40_custom pentru intrări proprii'],
            [<code>/boot/grub2/grub.cfg</code>, 'configurația GENERATĂ citită de GRUB la boot', 'NU de mână: se regenerează cu grub2-mkconfig'],
            [<code>/boot/loader/entries/*.conf</code>, 'câte o intrare pentru fiecare kernel (format BLS: title, version, linux, initrd, options)', 'prin grubby, nu direct'],
            [<code>/boot/grub2/grubenv</code>, 'mic „bloc de variabile” (ex. saved_entry = intrarea implicită salvată)', 'nu; prin grub2-editenv / grubby'],
          ]} />
          <p className="small">
            Pe sisteme UEFI, fișierele de pornire ale lui GRUB (shim, grubx64.efi) sunt în partiția EFI (<code>/boot/efi/EFI/redhat/</code>); locația exactă a lui <code>grub.cfg</code> pentru UEFI diferă între RHEL 8 și versiunile mai noi și trebuie confirmată pe RHEL 10 (vezi „Nesigurante” din notă). La examen, comanda corectă se vede din <code>ls /boot/grub2/ /boot/efi/EFI/redhat/</code>.
          </p>

          <h4>2. Două „niveluri” de configurare: ce afectează ce</h4>
          <p>
            Aici apare confuzia cea mai frecventă. Pe RHEL (de la 8), intrările pentru kernel sunt stocate în <G id="bls-entry">fișiere BLS</G> (Boot Loader Specification): câte un fișier <code>.conf</code> per kernel instalat. Acestea au propria linie <code>options</code> (argumentele kernelului). Rezultă:
          </p>
          <Table head={['Ce vrei', 'Unde modifici', 'Efect']} rows={[
            ['Timeout meniu, intrarea implicită (GRUB_DEFAULT), terminal', <><code>/etc/default/grub</code> + <code>grub2-mkconfig -o …</code></>, 'afectează grub.cfg (setările meniului)'],
            ['Argumente de kernel pentru kernelurile VIITOARE', <>variabila <code>GRUB_CMDLINE_LINUX</code> din <code>/etc/default/grub</code></>, 'folosită la generarea intrărilor noi; NU rescrie neapărat intrările existente (de confirmat)'],
            ['Argumente de kernel pentru kernelurile EXISTENTE (și acum)', <code>grubby --update-kernel=… --args=…</code>, 'modifică direct intrările BLS; efect la următorul boot'],
            ['Kernelul implicit', <code>grubby --set-default=…</code>, 'schimbă intrarea implicită (salvată în grubenv)'],
          ]} />
          <Callout kind="tip" title="Regula practică pentru examen">
            Pentru „adaugă/scoate un argument de kernel” folosește <code>grubby --update-kernel=ALL --args="…"</code> / <code>--remove-args="…"</code> — acționează imediat asupra tuturor intrărilor, fără regenerarea <code>grub.cfg</code>. Pentru „schimbă timeout-ul” editezi <code>/etc/default/grub</code> și regenerezi cu <code>grub2-mkconfig</code>. Dacă sarcina cere explicit „prin /etc/default/grub”, faci ambele.
          </Callout>

          <h4>3. Variabilele din /etc/default/grub (GNU GRUB manual)</h4>
          <Table head={['Variabilă', 'Sens', 'Implicit (manualul GRUB)']} rows={[
            [<code>GRUB_TIMEOUT</code>, 'secunde de așteptare înainte să pornească intrarea implicită; 0 = imediat; -1 = așteaptă la nesfârșit', '5'],
            [<code>GRUB_DEFAULT</code>, 'intrarea implicită: număr (de la 0), titlu, id sau saved', '0'],
            [<code>GRUB_CMDLINE_LINUX</code>, 'argumente de kernel adăugate TUTUROR intrărilor Linux', 'gol'],
            [<code>GRUB_CMDLINE_LINUX_DEFAULT</code>, 'argumente adăugate doar intrării implicite (nu celor de recuperare)', 'gol'],
            [<code>GRUB_TERMINAL</code>, 'terminalul de intrare/ieșire (console, serial …)', '—'],
            [<code>GRUB_DISABLE_RECOVERY</code>, 'dezactivează intrările de recuperare', '—'],
          ]} />
          <p className="small">
            Valorile implicite din tabel sunt cele din manualul GNU GRUB; fișierul <code>/etc/default/grub</code> livrat de RHEL are valorile lui proprii (de ex. <code>GRUB_TIMEOUT=5</code>, <code>GRUB_DEFAULT=saved</code>, <code>GRUB_CMDLINE_LINUX="… rhgb quiet"</code>; de confirmat pe RHEL 10).
          </p>
          <CodeBlock title="/etc/default/grub (aspect tipic RHEL; Ilustrativ)" kind="config" label="illustrative" code={`GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR="$(sed 's, release .*$,,g' /etc/system-release)"
GRUB_DEFAULT=saved
GRUB_DISABLE_SUBMENU=true
GRUB_TERMINAL_OUTPUT="console"
GRUB_CMDLINE_LINUX="crashkernel=auto resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet"
GRUB_DISABLE_RECOVERY="true"
GRUB_ENABLE_BLSCFG=true`} explain={[
            ['GRUB_TIMEOUT=5', 'meniul așteaptă 5 secunde.'],
            ['GRUB_DEFAULT=saved', 'intrarea implicită este cea salvată în grubenv (schimbată de grubby --set-default).'],
            ['GRUB_DISABLE_SUBMENU=true', 'meniu plat, fără submeniuri.'],
            ['GRUB_CMDLINE_LINUX="…"', 'argumentele comune: ce volum LVM este rădăcina (rd.lvm.lv), swap-ul pentru hibernare (resume), crashkernel, rhgb (grafic) și quiet (puține mesaje).'],
            ['GRUB_ENABLE_BLSCFG=true', 'folosește intrări BLS (din cunoștințe; pe RHEL 10 de confirmat).'],
          ]} />

          <h4>4. Anatomia unei intrări BLS</h4>
          <CodeBlock title="/boot/loader/entries/<machine-id>-6.12.0-xx.x86_64.conf (Ilustrativ)" kind="config" label="illustrative" code={`title Red Hat Enterprise Linux (6.12.0-xx.el10.x86_64) 10.0 (Coughlan)
version 6.12.0-xx.el10.x86_64
linux /vmlinuz-6.12.0-xx.el10.x86_64
initrd /initramfs-6.12.0-xx.el10.x86_64.img
options root=/dev/mapper/rhel-root ro crashkernel=auto rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet
grub_users $grub_users
grub_arg --unrestricted
grub_class rhel`} explain={[
            ['title', 'textul din meniu.'],
            ['version', 'versiunea kernelului (folosită la sortare).'],
            ['linux', 'calea imaginii kernelului în /boot.'],
            ['initrd', 'imaginea initramfs.'],
            ['options', 'linia de comandă a kernelului: ce modifică grubby --args / --remove-args. După boot, apare în /proc/cmdline.'],
            ['grub_users / grub_arg / grub_class', 'metadate GRUB (utilizatori, clasă); nu le editezi.'],
          ]} />
          <p className="small">Versiunea de kernel și numele din exemplu sunt fictive; formatul exact diferă între versiuni.</p>

          <h4>5. grubby: unealta care modifică intrările</h4>
          <Table head={['Comandă', 'Rol (grubby(8))']} rows={[
            [<code>grubby --info=ALL</code>, 'afișează toate intrările (ALL), sau doar pe cea implicită cu --info=DEFAULT'],
            [<code>grubby --default-kernel</code>, 'afișează calea kernelului implicit'],
            [<code>grubby --default-index</code>, 'afișează numărul intrării implicite (din cunoștințe; pagina citită nu o descrie)'],
            [<code>grubby --set-default=/boot/vmlinuz-…</code>, 'face implicită prima intrare care pornește acel kernel'],
            [<code>grubby --update-kernel=ALL --args="a=b c"</code>, 'adaugă argumente (valoarea unui argument existent se înlocuiește) la toate intrările'],
            [<code>grubby --update-kernel=ALL --remove-args="rhgb quiet"</code>, 'scoate argumentele'],
            [<code>--update-kernel=DEFAULT</code>, 'doar intrarea implicită'],
            [<code>--update-kernel=/boot/vmlinuz-…</code>, 'o anumită intrare'],
          ]} />

          <h4>6. Ce este linia de comandă a kernelului (kernel command line)</h4>
          <p>
            O listă de argumente, separate prin spații, citite de kernel (și de initramfs/systemd) la pornire: <code>cheie=valoare</code> sau doar <code>cheie</code>. Exemple utile:
          </p>
          <Table head={['Argument', 'Efect']} rows={[
            [<code>root=/dev/mapper/rhel-root</code>, 'unde este sistemul de fișiere rădăcină'],
            [<code>ro</code>, 'rădăcina se montează inițial read-only (apoi systemd o remontează rw)'],
            [<code>rhgb</code>, 'Red Hat Graphical Boot: ecran grafic de boot'],
            [<code>quiet</code>, 'afișează foarte puține mesaje la boot'],
            [<code>console=ttyS0,115200</code>, 'trimite consola și pe portul serial'],
            [<code>systemd.unit=rescue.target</code>, 'pornește într-un target anume (L4.2)'],
            [<code>rd.break</code>, 'oprește boot-ul în initramfs (L4.3)'],
            [<code>enforcing=0</code>, 'SELinux permissive (doar pentru depanare)'],
          ]} />
          <p>
            Argumentele cu care <b>a pornit sistemul curent</b> se văd în <code>/proc/cmdline</code>. Aceasta este dovada finală: dacă după reboot argumentul tău apare acolo, modificarea a funcționat.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Boot și targets (L4.1–L4.3):</b> L4.3 modifică temporar linia de comandă din meniu (<code>e</code>); aici o modifici permanent.</li>
            <li><b>Kernel și actualizări (C2):</b> <code>dnf update kernel</code> instalează un kernel nou, adaugă o intrare BLS și, de obicei, o face implicită; vechiul kernel rămâne ca rezervă.</li>
            <li><b>LVM și fstab (C5–C6):</b> <code>rd.lvm.lv=…</code> și <code>root=</code> trebuie să rămână corecte după orice schimbare de volume.</li>
            <li><b>SELinux (C10):</b> argumentele <code>selinux=0</code> / <code>enforcing=0</code> modifică modul SELinux la boot; <code>autorelabel</code> (L4.3) apare ca fișier, nu ca argument.</li>
            <li><b>tuned și performanță (L4.6):</b> unele optimizări se fac prin argumente de kernel; aici ele devin permanente.</li>
            <li><b>Securitate:</b> o parolă pe meniul GRUB (<code>grub2-setpassword</code>) împiedică editarea temporară a parametrilor (menționat, nu face parte din obiectiv).</li>
            <li><b>UEFI / Secure Boot:</b> fișierele de pornire din partiția EFI; nu le modifici fără motiv.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Examen (tipic): „change the default boot timeout to 10 seconds”, „set the default kernel to …”, „remove rhgb and quiet from the kernel arguments so you can see boot messages”, „add <code>console=ttyS0</code> permanently”.</li>
            <li>Administrare: argumente cerute de un producător (ex. <code>mem_encrypt=on</code>), depanare (<code>systemd.log_level=debug</code>), mediu cu consolă serială.</li>
            <li>După un kernel nou instabil: pornești vechiul kernel și îl faci implicit cu <code>grubby --set-default</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="warn" title="Doar pe o mașină de test, cu o cale de întoarcere">
          Platforma nu rulează comenzile. Fă laboratorul pe un VM/instalare de test (un instantaneu înainte este ideal). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10; versiunile de kernel și căile exacte diferă. Înainte de orice modificare: <code>sudo cp -a</code> pe fișierele pe care le editezi.
        </Callout>

        <h4>1. Inspectează situația curentă (nu modifică nimic)</h4>
        <CodeBlock title="comenzi" code={`cat /proc/cmdline\nuname -r\nsudo grubby --default-kernel\nsudo grubby --default-index\nsudo grubby --info=DEFAULT\nsudo grubby --info=ALL | head -30\nls /boot/loader/entries/\nls /boot/grub2/ /boot/efi/EFI/redhat/ 2>/dev/null`} explain={[
          ['cat /proc/cmdline', 'argumentele kernelului curent (cel pornit acum).'],
          ['uname -r', 'versiunea kernelului care rulează.'],
          ['grubby --default-kernel', 'calea kernelului implicit (ce va porni la următorul boot dacă nu alegi altceva).'],
          ['grubby --default-index', 'numărul intrării implicite (0 = prima din listă).'],
          ['grubby --info=DEFAULT', 'detaliile intrării implicite: kernel, args, root, initrd, title.'],
          ['grubby --info=ALL | head -30', 'toate intrările; | head -30 limitează la primele 30 de linii.'],
          ['ls /boot/loader/entries/', 'fișierele BLS, câte unul per kernel.'],
          ['ls … 2>/dev/null', 'ascunde eroarea dacă directorul EFI nu există (BIOS).'],
        ]} />

        <h4>2. Adaugă și scoate argumente de kernel, permanent</h4>
        <CodeBlock title="comenzi" code={`sudo grubby --update-kernel=ALL --args="console=ttyS0,115200"\nsudo grubby --info=DEFAULT | grep args\nsudo grubby --update-kernel=ALL --remove-args="rhgb quiet"\nsudo grubby --info=DEFAULT | grep args\nsudo reboot\n# după reboot:\ncat /proc/cmdline`} explain={[
          ['--update-kernel=ALL', 'ALL = toate intrările (DEFAULT = doar cea implicită; sau o cale /boot/vmlinuz-…).'],
          ['--args="console=ttyS0,115200"', 'adaugă argumentul; dacă există deja cu altă valoare, valoarea se înlocuiește.'],
          ['--remove-args="rhgb quiet"', 'scoate ambele argumente; listele se dau între ghilimele, separate prin spațiu.'],
          ['grubby --info=DEFAULT | grep args', 'verifici linia args (argumentele din intrare) fără reboot.'],
          ['reboot', 'modificarea se aplică la următorul boot.'],
          ['cat /proc/cmdline', 'dovada: noile argumente apar acolo (și rhgb/quiet nu mai apar).'],
        ]} />
        <p className="small">
          Un argument scos poate fi pus la loc cu <code>--args="rhgb quiet"</code>. Pentru un argument cu valoare, <code>--remove-args="console"</code> scoate toate aparițiile argumentului „console” (din cunoștințe, de confirmat).
        </p>

        <h4>3. Schimbă kernelul implicit</h4>
        <CodeBlock title="comenzi" code={`sudo grubby --info=ALL | grep -E '^(index|kernel|title)'\nsudo grubby --default-index\nsudo grubby --set-default=/boot/vmlinuz-6.12.0-xx.el10.x86_64\nsudo grubby --default-kernel\nsudo grubby --default-index`} explain={[
          ['grubby --info=ALL | grep -E …', 'listează pentru fiecare intrare indexul, calea kernelului și titlul; grep -E cu | = „sau”.'],
          ['grubby --set-default=cale', 'face implicită prima intrare cu acel kernel. Căile reale le iei din --info=ALL, nu din exemplu.'],
          ['grubby --default-kernel', 'confirmă noul kernel implicit.'],
        ]} />

        <h4>4. Schimbă timeout-ul meniului prin /etc/default/grub</h4>
        <CodeBlock title="comenzi" code={`sudo cp -a /etc/default/grub /etc/default/grub.orig\nsudo sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=10/' /etc/default/grub\ngrep GRUB_TIMEOUT /etc/default/grub\nls -l /boot/grub2/grub.cfg /boot/efi/EFI/redhat/grub.cfg 2>/dev/null\nsudo cp -a /boot/grub2/grub.cfg /boot/grub2/grub.cfg.orig\nsudo grub2-mkconfig -o /boot/grub2/grub.cfg\ngrep -n timeout= /boot/grub2/grub.cfg`} explain={[
          ['cp -a … grub.orig', 'copie de siguranță înainte de modificare.'],
          ["sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=10/'", '-i = modifică fișierul pe loc; înlocuiește linia care începe cu GRUB_TIMEOUT= cu GRUB_TIMEOUT=10.'],
          ['ls -l …grub.cfg', 'verifici ce fișier grub.cfg există pe sistemul tău (BIOS vs UEFI); regenerezi pe cel potrivit.'],
          ['grub2-mkconfig -o /boot/grub2/grub.cfg', 'grub2-mkconfig citește /etc/default/grub și /etc/grub.d/* și scrie rezultatul în fișierul dat cu -o (output). Pe sistemele unde calea grub.cfg diferă (ex. UEFI pe versiuni mai vechi), folosești calea de pe sistemul tău.'],
          ['grep -n timeout= grub.cfg', 'confirmi noua valoare în fișierul generat (linia set timeout=10 sau echivalent).'],
        ]} />
        <Callout kind="info" title="Calea pentru grub.cfg">
          La RHEL 8 pe UEFI, calea documentată era <code>/boot/efi/EFI/redhat/grub.cfg</code>; la RHEL 9+ (din cunoștințe) este <code>/boot/grub2/grub.cfg</code> pentru ambele moduri. Pe RHEL 10 confirmă cu <code>ls</code>. Dacă regenerezi în locul greșit, sistemul nu își schimbă comportamentul și nu primești de obicei eroare.
        </Callout>

        <h4>5. Argumente comune prin GRUB_CMDLINE_LINUX (alternativa)</h4>
        <CodeBlock title="comenzi" code={`sudo vi /etc/default/grub\n# în linia GRUB_CMDLINE_LINUX=\"…\" adaugi/scoți argumente\nsudo grub2-mkconfig -o /boot/grub2/grub.cfg\nsudo grubby --info=ALL | grep args`} explain={[
          ['GRUB_CMDLINE_LINUX="…"', 'argumentele comune; rămâi în interiorul ghilimelelor.'],
          ['grub2-mkconfig', 'regenerează grub.cfg; pe sisteme BLS, intrările deja existente pot să nu fie rescrise (de confirmat).'],
          ['grubby --info=ALL | grep args', 'verifici ce argumente apar efectiv în intrări; dacă nu s-au schimbat, folosește grubby --update-kernel.'],
        ]} />
        <p className="small">
          De aceea, la examen, prefer <code>grubby --update-kernel</code> pentru argumente și <code>grub2-mkconfig</code> pentru setările meniului, și verifică întotdeauna cu <code>grubby --info</code> și, după reboot, cu <code>/proc/cmdline</code>.
        </p>

        <h4>6. Variabile salvate (grubenv)</h4>
        <CodeBlock title="comenzi" code={`sudo grub2-editenv list\nsudo grubby --default-index`} explain={[
          ['grub2-editenv list', 'afișează variabilele din grubenv (de ex. saved_entry = intrarea implicită salvată).'],
          ['grubby --default-index', 'indexul intrării implicite, pentru comparație.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="cat /proc/cmdline" kind="session" label="illustrative" code={`[student@server1 ~]$ cat /proc/cmdline\nBOOT_IMAGE=(hd0,msdos1)/vmlinuz-6.12.0-xx.el10.x86_64 root=/dev/mapper/rhel-root ro crashkernel=auto rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet`} />
        <p className="small">
          O singură linie: <code>BOOT_IMAGE=…</code> (imaginea pornită, adăugată de GRUB) urmată de argumentele din linia <code>options</code> a intrării BLS. Aici: rădăcina este volumul LVM <code>rhel/root</code> montat inițial read-only (<code>ro</code>), activarea volumelor LVM la boot (<code>rd.lvm.lv=</code>), și <code>rhgb quiet</code> (boot grafic, puține mesaje). Valorile și versiunea sunt fictive.
        </p>
        <CodeBlock title="grubby --info=DEFAULT" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo grubby --info=DEFAULT\nindex=0\nkernel="/boot/vmlinuz-6.12.0-xx.el10.x86_64"\nargs="ro crashkernel=auto rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet"\nroot="/dev/mapper/rhel-root"\ninitrd="/boot/initramfs-6.12.0-xx.el10.x86_64.img"\ntitle="Red Hat Enterprise Linux (6.12.0-xx.el10.x86_64) 10.0 (Coughlan)"\nid="…-6.12.0-xx.el10.x86_64"`} />
        <p className="small">
          <b>index</b>: numărul intrării în lista grubby (0 = prima). <b>kernel</b>: calea imaginii. <b>args</b>: argumentele din linia <code>options</code> a intrării (fără <code>root=</code>, afișat separat). <b>root</b>: dispozitivul rădăcină. <b>initrd</b>: imaginea initramfs. <b>title</b>: textul din meniu. <b>id</b>: identificatorul intrării (poate diferi). Câmpurile exacte depind de versiune.
        </p>
        <CodeBlock title="grubby --default-kernel și --default-index" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo grubby --default-kernel\n/boot/vmlinuz-6.12.0-xx.el10.x86_64\n[student@server1 ~]$ sudo grubby --default-index\n0`} />
        <p className="small">Prima comandă arată calea kernelului implicit; a doua, indexul lui în listă. Dacă ai două kerneluri și implicitul este cel mai nou, indexul este de obicei 0.</p>
        <CodeBlock title="grub2-mkconfig" kind="session" label="illustrative" code={`[root@server1 ~]# grub2-mkconfig -o /boot/grub2/grub.cfg\nGenerating grub configuration file ...\nAdding boot menu entry for UEFI Firmware Settings ...\ndone`} />
        <p className="small">
          Mesajele arată etapele generării (scripturile din <code>/etc/grub.d</code>) și se termină cu <code>done</code>. Liniile exacte diferă (pot apărea și intrări pentru alte sisteme de operare sau pentru firmware). Dacă nu vezi <code>done</code> sau apar erori, <b>nu reporni</b> înainte de a le rezolva.
        </p>
        <CodeBlock title="grub2-editenv list" kind="session" label="illustrative" code={`[root@server1 ~]# grub2-editenv list\nsaved_entry=…-6.12.0-xx.el10.x86_64\nboot_success=1\nboot_indeterminate=0`} />
        <p className="small"><code>saved_entry</code> este intrarea implicită salvată (folosită când <code>GRUB_DEFAULT=saved</code>). Alte variabile (<code>boot_success</code>) țin evidența reușitei ultimului boot; ele nu fac parte din obiectiv.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Argumente de kernel (fără reboot):</b> <code>sudo grubby --info=DEFAULT</code> (sau <code>--info=ALL</code>) → linia <code>args</code> conține/nu conține argumentul.</li>
            <li><b>Argumente efective (după reboot):</b> <code>cat /proc/cmdline</code> → este dovada că bootloader-ul le-a pasat kernelului.</li>
            <li><b>Kernelul implicit:</b> <code>sudo grubby --default-kernel</code> / <code>--default-index</code>; după reboot, <code>uname -r</code> arată kernelul pornit.</li>
            <li><b>Timeout:</b> <code>grep GRUB_TIMEOUT /etc/default/grub</code> (setarea) și <code>grep -n timeout= /boot/grub2/grub.cfg</code> (rezultatul generat); în meniul GRUB, numărătoarea inversă durează cât ai setat.</li>
            <li><b>Variabile salvate:</b> <code>sudo grub2-editenv list</code>.</li>
            <li><b>Fișiere BLS:</b> <code>grep options /boot/loader/entries/*.conf</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Toate modificările descrise aici sunt <b>deja persistente</b>: ele se scriu în fișiere din <code>/boot</code> și <code>/etc</code> și se aplică la fiecare boot. Diferența față de editarea din meniu (tasta <code>e</code>, L4.3), care este <b>temporară</b> și dispare la reboot. Atenție: modificarea <code>/etc/default/grub</code> <b>fără</b> <code>grub2-mkconfig</code> nu are efect (nu regenerezi fișierul pe care GRUB îl citește). Confirmare manuală: <code>sudo reboot</code>, apoi <code>cat /proc/cmdline</code> și <code>uname -r</code>.
          </p>
          <p>
            <b>Kernel nou ulterior:</b> argumentele puse cu <code>grubby --update-kernel=ALL</code> se aplică intrărilor existente; pentru kernelurile instalate mai târziu, argumentele provin din configurația implicită a sistemului (<code>GRUB_CMDLINE_LINUX</code> / fișiere de configurare kernel-install; comportament exact pe RHEL 10 de confirmat). De aceea, dacă argumentul trebuie să supraviețuiască actualizărilor de kernel, îl pui și în <code>/etc/default/grub</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Am schimbat /etc/default/grub, dar nimic nu s-a schimbat', 'nu ai rulat grub2-mkconfig (sau l-ai rulat pe un grub.cfg greșit)', <><code>ls -l /boot/grub2/grub.cfg /boot/efi/EFI/redhat/grub.cfg</code>; <code>grep timeout= …</code></>, <>regenerează pe calea corectă: <code>grub2-mkconfig -o …</code></>],
          ['Argumentul nu apare în /proc/cmdline', 'nu ai repornit, sau ai modificat doar /etc/default/grub (intrarea BLS veche nu s-a schimbat)', <><code>grubby --info=ALL</code>, <code>cat /proc/cmdline</code></>, <><code>grubby --update-kernel=ALL --args=…</code>, reboot</>],
          ['Se pornește alt kernel decât cel dorit', 'GRUB_DEFAULT / saved_entry nu indică ce vrei', <><code>grubby --default-kernel</code>, <code>grub2-editenv list</code></>, <><code>grubby --set-default=…</code></>],
          ['Sistemul nu mai pornește după modificare', 'argument greșit (root=, rd.lvm.lv), grub.cfg stricat', 'din meniu: tasta e, corectezi temporar linia linux', 'pornești, apoi corectezi cu grubby / restaurezi copia .orig'],
          ['grub2-mkconfig dă erori', 'sintaxă greșită în /etc/default/grub (ghilimele, spații în jurul =)', 'citește mesajul de eroare', <>variabile fără spații în jurul <code>=</code>, valori între ghilimele</>],
          [<code>grubby: command not found</code>, 'pachet lipsă sau rulezi fără sudo (PATH-ul utilizatorului nu include sbin)', <code>rpm -q grubby</code>, <>rulează cu <code>sudo</code>; instalează cu <code>sudo dnf install grubby</code></>],
          ['Meniul nu apare deloc', 'GRUB_TIMEOUT=0 sau GRUB_TIMEOUT_STYLE=hidden', <code>grep TIMEOUT /etc/default/grub</code>, <>pune o valoare pozitivă; regenerează</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Editezi <code>/boot/grub2/grub.cfg</code> de mână: este fișier generat și se pierde la regenerare.</>,
          <>Modifici <code>/etc/default/grub</code> și uiți <code>grub2-mkconfig -o …</code>.</>,
          <>Rulezi <code>grub2-mkconfig</code> cu calea greșită pentru <code>grub.cfg</code> (BIOS vs UEFI, RHEL 8 vs 9+).</>,
          <>Crezi că editarea cu tasta <code>e</code> din meniu este permanentă.</>,
          <>Ștergi din greșeală argumente necesare (<code>root=</code>, <code>rd.lvm.lv=</code>) când vrei doar să scoți <code>rhgb quiet</code>.</>,
          <>Uiți ghilimelele la <code>--args="a b"</code>: al doilea cuvânt ar fi luat drept alt argument al comenzii.</>,
          <>Verifici cu <code>/proc/cmdline</code> fără să repornești: arată boot-ul curent, nu pe cel viitor; folosește <code>grubby --info</code> înainte de reboot.</>,
          <>Faci <code>--set-default</code> cu o cale inventată; copiază calea din <code>grubby --info=ALL</code>.</>,
          <>Spații în jurul lui <code>=</code> în <code>/etc/default/grub</code> (<code>GRUB_TIMEOUT = 10</code> nu este valid, fiind un fișier shell).</>,
          <>Ștergi kernelul în uz sau intrările BLS de mână.</>,
          <>Nu ai o cale de întoarcere (fără copie, fără instantaneu).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: BLS, grubenv, parole și reinstalare GRUB">
        <p>
          <b>De ce BLS:</b> Boot Loader Specification separă intrările de meniu de <code>grub.cfg</code>: în loc să regenerezi un fișier mare la fiecare kernel nou, <code>kernel-install</code> adaugă un fișier mic în <code>/boot/loader/entries</code>. De aceea <code>grubby</code> poate modifica o intrare fără <code>grub2-mkconfig</code> și de aceea <code>grub.cfg</code> conține un script generic care citește intrările (din cunoștințe).
        </p>
        <p>
          <b>grubenv:</b> un fișier de 1 KiB cu variabile <code>cheie=valoare</code>, scrise de grub2-editenv / grubby (și de GRUB însuși, ex. <code>boot_success</code>). Poate fi citit de GRUB înainte să existe un sistem de fișiere complet, de aceea este un fișier mic, fix.
        </p>
        <p>
          <b>Parolă GRUB:</b> <code>grub2-setpassword</code> cere o parolă pentru editarea intrărilor și accesul la linia de comandă GRUB (nu pentru pornirea normală). Este o măsură de securitate recomandată, dar pe examen poate să nu fie solicitată (menționat; nepreluat din sursă).
        </p>
        <p>
          <b>Reinstalarea GRUB:</b> dacă bootloader-ul este corupt, se reinstalează de pe rescue media cu <code>grub2-install</code> (BIOS) sau reinstalând pachetele <code>grub2-efi-x64 shim-x64</code> și regenerând configurația (UEFI). Este o procedură de recuperare, nu o modificare de rutină; documentația RHEL 10 are un capitol dedicat „Reinstalling GRUB”, pe care nu l-am putut accesa.
        </p>
        <p>
          <b>crashkernel și argumente grele:</b> <code>crashkernel=…</code> rezervă memorie pentru kdump; <code>grubby --args</code> poate schimba rezervarea, dar o valoare greșită poate face sistemul să nu mai aibă memorie suficientă; testează întotdeauna.
        </p>
        <p>
          <b>Linia de comandă GRUB:</b> din meniu, tasta <code>c</code> deschide un prompt GRUB cu comenzi proprii (<code>ls</code>, <code>linux</code>, <code>initrd</code>, <code>boot</code>) — folosit pentru recuperare în cazuri extreme; în afara obiectivului.
        </p>
      </DeepDive>
    </>
  );
}

export const L7_4: TopicModule = {
  id: 'L7.4',
  subtitle: 'GRUB 2: /etc/default/grub, grub2-mkconfig, grubby (--info, --default-kernel, --set-default, --update-kernel --args/--remove-args), /proc/cmdline',
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
  labs: [LAB_L7_4],
  sources: [
    { kind: 'upstream', ref: 'GNU GRUB Manual — „Simple configuration” (gnu.org), citit 2026-11-16' },
    { kind: 'man', ref: 'grubby(8) — linux.die.net (pagină veche), citită 2026-11-16; grub2-mkconfig(8), grub2-editenv(1), kernel-command-line(7) — din cunoștințe' },
    { kind: 'doc', ref: 'RHEL 10 — „Configuring kernel command-line parameters” și „Reinstalling GRUB” (docs.redhat.com): necitite (HTTP 403 la 2026-11-16); de confirmat la review' },
  ],
};
