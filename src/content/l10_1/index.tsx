import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_1A, LAB_L10_1B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Când un program creează un fișier sau un director nou, nu el hotărăște singur cine îl poate citi: sistemul pornește de la un set maxim de drepturi (<code>666</code> pentru fișiere, <code>777</code> pentru directoare) și <b>scoate</b> din el drepturile indicate de <G id="umask"><code>umask</code></G>. Cu <code>umask 022</code> un fișier nou are <code>644</code> (<code>rw-r--r--</code>), iar un director nou <code>755</code> (<code>rwxr-xr-x</code>). Cu <code>umask 077</code> doar proprietarul are acces.
          </p>
          <p>
            Valoarea se vede cu <code>umask</code>, se schimbă pentru sesiunea curentă cu <code>umask 027</code> și se face <b>permanentă</b> scriind-o într-un fișier de inițializare (<code>~/.bashrc</code>, <code>/etc/profile.d/*.sh</code>) sau, pentru toți utilizatorii de pe login, în <G id="login-defs"><code>/etc/login.defs</code></G> (prin <G id="pam-umask">pam_umask</G>). Pentru servicii systemd există <code>UMask=</code> în fișierul unității.
          </p>
          <p>Obiectivul oficial: <i>„Manage default file permissions”</i>. Verificare: <code>umask</code>, <code>umask -S</code>, <code>touch</code> + <code>mkdir</code> + <code>ls -l</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: cine decide drepturile unui fișier nou?</h4>
          <p>
            În L1.8 ai învățat să schimbi drepturile unui fișier <i>existent</i> cu <code>chmod</code>. Dar înainte de orice <code>chmod</code>, fișierul trebuie creat, iar la creare primește niște drepturi inițiale. Dacă ar fi mereu <code>777</code>, oricine ar putea modifica orice fișier nou creat de oricine: un dezastru de securitate. Dacă ar fi mereu <code>600</code>, colaborarea (un site web citit de serverul web, un director comun de echipă) ar fi imposibilă fără <code>chmod</code> manual după fiecare creare. Soluția sistemelor Unix este o <b>mască</b> (<i>mask</i>) configurabilă: <code>umask</code> („user file-creation <b>mask</b>”).
          </p>
          <Analogy>
            Gândește-te la un șablon de decupat: aplici șablonul peste o foaie care are toate drepturile (rwx pentru toți); acolo unde șablonul are „găuri”, <b>drepturile sunt șterse</b>. <code>umask</code> nu <i>dă</i> drepturi, ci le <i>ia</i>: este un filtru de interzis, nu o listă de permis.
          </Analogy>

          <h4>Pasul zero: octal, biți și cele trei clase</h4>
          <p>
            Reamintire (L1.8). Drepturile unui fișier sunt 9 biți, în trei grupuri de câte trei: <b>u</b> (proprietar, <i>user</i>), <b>g</b> (grup), <b>o</b> (ceilalți, <i>others</i>). Fiecare grup are <code>r</code> (citire) = 4, <code>w</code> (scriere) = 2, <code>x</code> (execuție) = 1. Suma dă o cifră octală: <code>rwx</code> = 4+2+1 = 7; <code>r-x</code> = 4+0+1 = 5; <code>r--</code> = 4; <code>---</code> = 0. De aceea <code>644</code> = <code>rw-</code> <code>r--</code> <code>r--</code>.
          </p>
          <Table head={['Cifră', 'Binar (r w x)', 'Simbolic', 'Sens']} rows={[
            ['0', '000', '---', 'nimic'],
            ['1', '001', '--x', 'doar execuție'],
            ['2', '010', '-w-', 'doar scriere'],
            ['3', '011', '-wx', 'scriere + execuție'],
            ['4', '100', 'r--', 'doar citire'],
            ['5', '101', 'r-x', 'citire + execuție'],
            ['6', '110', 'rw-', 'citire + scriere'],
            ['7', '111', 'rwx', 'toate'],
          ]} />

          <h4>De ce 666 pentru fișiere și 777 pentru directoare?</h4>
          <p>
            Programele cer kernelului un fișier nou cu un <i>mod cerut</i>. Majoritatea fișierelor obișnuite (texte, loguri, configurații) nu sunt programe, deci cer <code>0666</code> (<code>rw-rw-rw-</code>, fără <code>x</code>). Directoarele au nevoie de <code>x</code> (ca să poți intra în ele, <i>traversa</i>), deci cer <code>0777</code>. De aceea, indiferent de umask, un fișier creat cu <code>touch</code> sau cu <code>&gt;</code> <b>nu este niciodată executabil</b> la creare: bitul <code>x</code> nu a fost cerut. Pentru a-l face executabil rulezi explicit <code>chmod +x</code>.
          </p>
          <Callout kind="info" title="Sursă și nuanță">
            Pagina POSIX <code>umask(1p)</code> spune doar că masca „este complementul logic al biților dați” și că o mască <code>002</code> șterge bitul de scriere pentru <i>others</i>. Valorile de pornire 666/777 și formula „mod cerut AND NOT mască” sunt din <code>umask(2)</code>/<code>open(2)</code> (practica standard Linux, necitite în această sesiune; de confirmat la review).
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Formula: AND NOT, nu scădere</h4>
          <p>
            Kernelul calculează: <code>mod_final = mod_cerut AND (NOT umask)</code>. Pas cu pas, pentru un fișier nou cu <code>umask 027</code>:
          </p>
          <Table head={['Pas', 'Valoare octală', 'Binar pe clase (u g o)', 'Explicație']} rows={[
            ['mod cerut (fișier)', '666', '110 110 110', 'rw- rw- rw-'],
            ['umask', '027', '000 010 111', 'g: scoate w; o: scoate r, w, x'],
            ['NOT umask', '750', '111 101 000', 'biții care RĂMÂN permiși'],
            ['rezultat (AND)', '640', '110 100 000', 'rw- r-- ---'],
          ]} />
          <p>
            Pentru un <b>director</b> nou, aceeași mască pornește de la <code>777</code>: <code>777 AND 750 = 750</code> (<code>rwxr-x---</code>).
          </p>
          <Callout kind="warn" title="Scăderea aritmetică merge doar în cazuri simple">
            Mulți învață „666 minus umask”. Pentru <code>022</code> și <code>027</code> dă răspunsul corect, dar nu este regula reală. Exemplu: <code>umask 033</code> pe un fișier. Scăderea dă <code>666 − 033 = 633</code>. Calculul corect (AND NOT) dă <code>666 AND 744 = 644</code>, pentru că bitul <code>x</code> (valoarea 1) din <code>3</code> nu avea ce să șteargă (fișierul nu l-a cerut). Folosește mereu AND NOT: pe biți, un bit din mască <i>șterge</i> bitul corespunzător, dacă acesta exista.
          </Callout>

          <h4>2. Tabel de referință: măști frecvente</h4>
          <Table head={['umask', 'Fișier nou', 'Director nou', 'Sens practic']} rows={[
            [<code>022</code>, <code>644 rw-r--r--</code>, <code>755 rwxr-xr-x</code>, 'implicit clasic (root): toți citesc, doar proprietarul scrie'],
            [<code>002</code>, <code>664 rw-rw-r--</code>, <code>775 rwxrwxr-x</code>, 'colaborare în grup: grupul poate scrie (utilizatori obișnuiți cu UPG)'],
            [<code>027</code>, <code>640 rw-r-----</code>, <code>750 rwxr-x---</code>, 'grupul citește, ceilalți nimic'],
            [<code>077</code>, <code>600 rw-------</code>, <code>700 rwx------</code>, 'privat: doar proprietarul'],
            [<code>007</code>, <code>660 rw-rw----</code>, <code>770 rwxrwx---</code>, 'grupul scrie, ceilalți nimic'],
            [<code>000</code>, <code>666 rw-rw-rw-</code>, <code>777 rwxrwxrwx</code>, 'periculos: oricine scrie oriunde'],
          ]} />

          <h4>3. Umask este o proprietate a PROCESULUI</h4>
          <p>
            Masca nu stă într-un fișier de configurare citit la fiecare creare de fișier; este un atribut al <b>procesului</b> (ca directorul curent). Se moștenește: un proces copil (<code>fork</code>) primește masca părintelui. Consecințe:
          </p>
          <ul>
            <li><code>umask 077</code> tastat într-un terminal afectează doar acel shell și comenzile pornite din el, nu alte terminale și nu serviciile.</li>
            <li>Un script bash moștenește masca shell-ului care îl pornește și o poate schimba pentru restul scriptului.</li>
            <li>Un serviciu systemd are masca din unitatea lui (<code>UMask=</code>, implicit <code>0022</code> pentru unitățile de sistem, conform documentației systemd), nu pe cea din <code>~/.bashrc</code>-ul tău.</li>
            <li>Un subshell <code>( umask 077; touch x )</code> nu schimbă masca shell-ului părinte (<code>umask(1p)</code>).</li>
          </ul>

          <h4>4. De unde vine valoarea la login</h4>
          <p>
            Când te autentifici, masca ta de pornire este stabilită în straturi, fiecare putând s-o schimbe pe a celui dinainte:
          </p>
          <ol>
            <li><b>Kernel/init</b>: procesele pornesc cu o mască moștenită de la <code>systemd</code> (<code>0022</code>).</li>
            <li><b>PAM</b>: modulul <G id="pam-umask">pam_umask</G> (dacă este în stiva PAM de login) setează masca. Ordinea surselor, din <code>pam_umask(8)</code>: câmpul GECOS al utilizatorului (<code>umask=</code>), argumentul <code>umask=</code> al modulului, <code>UMASK</code> din <code>/etc/login.defs</code>, <code>UMASK=</code> din <code>/etc/default/login</code>. Opțiunea <code>usergroups</code> copiază biții proprietarului în biții grupului pentru utilizatorii non-root al căror nume este egal cu grupul primar (<code>022</code> devine <code>002</code>).</li>
            <li><b>Shell de login</b>: <code>/etc/profile</code> și fișierele din <code>/etc/profile.d/*.sh</code>, apoi <code>~/.bash_profile</code>.</li>
            <li><b>Shell interactiv</b>: <code>/etc/bashrc</code> și <code>~/.bashrc</code>.</li>
            <li><b>Tu</b>, manual, oricând: <code>umask 077</code>.</li>
          </ol>
          <p>
            <b>Ultimul care setează câștigă</b>, pentru că fiecare apel <code>umask</code> suprascrie precedentul. Pe sistemele RHEL anterioare, <code>/etc/profile</code> și <code>/etc/bashrc</code> conțin o logică de tipul „dacă UID este mai mare de 199 și numele de utilizator este egal cu numele grupului primar, folosește <code>002</code>, altfel <code>022</code>”. Ca urmare, un utilizator obișnuit are de regulă <code>0002</code>, iar root <code>0022</code>. Pe RHEL 10 conținutul exact trebuie confirmat pe sistemul tău (<code>grep -n umask /etc/profile /etc/bashrc</code>).
          </p>
          <Table head={['Loc', 'Cine este afectat', 'Persistă?', 'Când îl folosești']} rows={[
            [<code>umask 027</code>, 'shell-ul curent și copiii lui', 'nu (până la logout)', 'test rapid'],
            [<code>~/.bashrc</code>, 'un singur utilizator, shell-uri bash interactive', 'da', 'preferința unui utilizator'],
            [<code>~/.bash_profile</code>, 'un utilizator, shell-uri de login', 'da', 'la fel, pe login'],
            [<code>/etc/profile.d/NUME.sh</code>, 'toți utilizatorii, shell-uri de login', 'da', 'politică locală pentru toți'],
            [<code>/etc/bashrc</code>, 'toți, shell-uri interactive', 'da', 'modificare globală (se poate suprascrie la actualizări)'],
            [<><code>UMASK</code> în <code>/etc/login.defs</code></>, 'sesiuni de login prin PAM (pam_umask)', 'da', 'valoare implicită pentru conturi, inclusiv home-uri create cu useradd'],
            [<><code>UMask=</code> în unitate systemd</>, 'procesele unui serviciu', 'da', 'un serviciu care scrie fișiere (loguri, uploaduri)'],
          ]} />

          <h4>5. Ce NU face umask</h4>
          <ul>
            <li><b>Nu modifică fișiere existente.</b> Doar creările noi sunt afectate. Pentru cele vechi folosești <code>chmod</code>.</li>
            <li><b>Nu pune bitul <code>x</code> pe fișiere</b> (pornesc de la 666).</li>
            <li><b>Nu atinge bitul <code>setgid</code> al unui director</b> (L1.8): într-un director cu <code>g+s</code>, fișierele noi moștenesc <i>grupul</i> directorului, dar drepturile continuă să respecte umask-ul. Deci pentru un director de echipă ai nevoie de <i>ambele</i>: <code>chmod g+s</code> (grupul corect) și un umask care lasă <code>w</code> pentru grup (<code>002</code>), altfel colegii pot citi, dar nu pot scrie.</li>
            <li><b>Nu înlocuiește ACL-urile</b> (în afara v1), nici contextele SELinux (care nu depind de umask; vezi L10.4).</li>
            <li><b>Nu se aplică la fel peste tot:</b> comenzi precum <code>cp</code> (păstrează modul sursei, dar îl reduce cu umask), <code>install -m MOD</code> și <code>mkdir -m MOD</code> (modul explicit nu este redus de umask pentru <code>mkdir -m</code>; la <code>mkdir -m</code> modul este setat după creare), <code>tar</code> (la extragere ca non-root respectă umask-ul; ca root păstrează modurile din arhivă, cu <code>-p</code>) pot comporta diferit. Regula de bază rămâne valabilă pentru <code>touch</code>, <code>&gt;</code>, <code>mkdir</code> fără <code>-m</code>, editoare.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Permisiuni (L1.8):</b> umask stabilește drepturile <i>de pornire</i>; <code>chmod</code> le modifică ulterior. Bitul special setgid/sticky nu vine din umask.</li>
            <li><b>Conturi (L9.1):</b> <code>useradd -m</code> creează home-ul cu modul din <code>HOME_MODE</code> din <code>/etc/login.defs</code>, iar dacă lipsește, din <code>UMASK</code> (<code>login.defs(5)</code>). De aceea home-urile noi pot fi <code>0700</code> sau <code>0755</code> în funcție de distribuție și configurare (de confirmat pe RHEL 10).</li>
            <li><b>Grupuri (L9.3):</b> grupul privat al utilizatorului (UPG) justifică <code>umask 002</code>: dacă fiecare utilizator are un grup propriu, a lăsa <code>w</code> pentru grup nu expune fișierele nimănui altcuiva.</li>
            <li><b>systemd (L4.9):</b> serviciile au propriul <code>UMask=</code>; un daemon poate crea loguri cu drepturi diferite față de ce vezi în terminal.</li>
            <li><b>SSH (L1.11, L10.2):</b> sesiunile SSH trec prin PAM, deci primesc umask-ul din PAM și din profil; <code>scp</code>/<code>sftp</code> creează fișierele la destinație cu umask-ul sesiunii remote.</li>
            <li><b>SELinux (L10.4):</b> umask decide biții <code>rwx</code> (DAC), contextul SELinux (MAC) decide separat. Un fișier poate avea <code>644</code> și tot să fie refuzat de SELinux.</li>
            <li><b>cron (L7.1) și at:</b> job-urile rulează cu masca definită de daemon (de obicei <code>0022</code>), nu cu cea din <code>~/.bashrc</code> (care nu este citit într-un shell non-interactiv); dacă scriptul tău depinde de ea, setează <code>umask</code> în script.</li>
            <li><b>sudo (L9.4):</b> <code>sudo</code> poate păstra sau schimba umask (opțiunea <code>umask</code> din sudoers; implicit politica folosește masca utilizatorului combinată cu cea setată de <code>sudoers</code>); comportamentul exact nu a fost citit în această lecție.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li><b>Securitate implicită:</b> un utilizator care manevrează date sensibile își pune <code>umask 077</code>, ca fișierele lui să nu poată fi citite de alții.</li>
            <li><b>Colaborare:</b> o echipă care lucrează într-un director comun are nevoie de <code>umask 002</code> + directorul cu <code>setgid</code>.</li>
            <li><b>Servicii:</b> un daemon web care primește uploaduri: <code>UMask=0027</code> în unitate, ca fișierele noi să nu fie citibile de oricine.</li>
            <li><b>Diagnostic:</b> „fișierul creat de scriptul meu nu poate fi citit de aplicația X” este adesea o problemă de umask (script cu <code>077</code>, aplicație sub alt utilizator).</li>
            <li><b>Examen:</b> „configure the system so that files created by user X have permissions 640 by default, persistently”, „set the default umask for all new users to 027” (<code>UMASK</code> din <code>/etc/login.defs</code>, cu limitările discutate), „new directories created by user X should not be accessible by others”.</li>
          </ul>
          <Callout kind="info" title="Cum se citește o cerință de examen">
            Cerința dă de obicei <b>drepturile dorite</b> (de exemplu „fișierele noi să fie 640”), nu masca. Calculezi masca invers: de la 666 la 640 se șterg <code>w</code> pentru grup (2) și <code>rwx</code> pentru others (7) → <code>027</code>. Apoi verifici pe <i>directoare</i> (<code>750</code>): același umask trebuie să dea ambele rezultate corecte.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu pe o mașină de test, ca utilizator obișnuit (nu ca root: root are propriul comportament). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Pașii sunt reversibili: umask-ul din sesiune dispare la logout.
        </Callout>

        <h4>1. Citește masca curentă</h4>
        <CodeBlock title="comenzi" code={`umask\numask -S\nid -un; id -gn\ntype umask\nhelp umask`} explain={[
          ['umask', 'fără argument: afișează masca curentă în octal (de obicei cu patru cifre, ex. 0022; primul 0 este pentru biții speciali).'],
          ['umask -S', '-S = symbolic: afișează drepturile PERMISE (nu cele șterse), de forma u=rwx,g=rx,o=rx. Atenție: este invers față de numărul octal.'],
          ['id -un; id -gn', 'numele tău de utilizator și al grupului primar: dacă sunt identice (UPG), de obicei ai 002.'],
          ['type umask', 'arată că umask este o comandă internă a shell-ului (shell builtin), nu un program separat: de aceea nu are pagină man proprie, ci se citește cu help umask sau man bash.'],
        ]} />

        <h4>2. Arată efectul: creează fișiere și directoare</h4>
        <CodeBlock title="comenzi" code={`cd ~\nmkdir ~/umask-test && cd ~/umask-test\numask\ntouch fisier1\nmkdir dir1\nls -ld fisier1 dir1\numask 077\ntouch fisier2\nmkdir dir2\nls -ld fisier2 dir2\nstat -c '%A %a %n' fisier1 fisier2 dir1 dir2`} explain={[
          ['mkdir ~/umask-test && cd ~/umask-test', 'creează un director de lucru și intră în el; && rulează a doua comandă doar dacă prima a reușit.'],
          ['touch fisier1', 'creează un fișier gol; modul cerut de touch este 666, redus de umask-ul curent.'],
          ['mkdir dir1', 'creează un director; modul cerut este 777, redus de umask.'],
          ['ls -ld fisier1 dir1', '-l = format lung (cu drepturi), -d = pentru directoare afișează directorul însuși, nu conținutul. Citește primele 10 caractere: tip + rwx pentru u, g, o.'],
          ['umask 077', 'schimbă masca doar pentru acest shell: de acum doar proprietarul are drepturi.'],
          ["stat -c '%A %a %n'", '-c = format propriu: %A drepturile în formă simbolică, %a în octal, %n numele. Util pentru a vedea direct 600/700 fără a număra litere.'],
        ]} />

        <h4>3. Setează masca cu notația simbolică</h4>
        <CodeBlock title="comenzi" code={`umask 022\numask u=rwx,g=rx,o=\numask\numask -S\numask g-w\numask`} explain={[
          ['umask u=rwx,g=rx,o=', 'notație simbolică: specifici ce drepturi RĂMÂN permise. Aici: u=rwx, g=rx, o= (nimic) → echivalent cu 027. Foloseste = pentru a seta exact.'],
          ['umask g-w', 'ATENȚIE: în umask, - și + sunt inverse față de chmod. g-w SETEAZĂ în mască bitul w pentru grup (adică îl interzice), conform umask(1p): „- setează biții în mască”, „+ îi șterge”.'],
        ]} />
        <p className="small">
          Pe examen e mai sigur să folosești <b>forma octală</b> (<code>umask 027</code>), pe care o poți verifica ușor cu <code>touch</code>/<code>mkdir</code>. Notația simbolică există, dar semnele inversate produc greșeli.
        </p>

        <h4>4. Subshell și moștenire</h4>
        <CodeBlock title="comenzi" code={`umask 022\n( umask 077; touch in-subshell )\ntouch in-parinte\nls -l in-subshell in-parinte\numask\nbash -c 'umask'`} explain={[
          ['( … )', 'parantezele pornesc un subshell: o copie a shell-ului. umask 077 din interior nu se întoarce în părinte.'],
          ['bash -c \'umask\'', 'pornește un shell copil care moștenește masca părintelui: afișează aceeași valoare (022).'],
        ]} />

        <h4>5. Persistență pentru un utilizator: ~/.bashrc</h4>
        <CodeBlock title="comenzi" code={`grep -n umask ~/.bashrc /etc/bashrc /etc/profile\nprintf '\\n# umask personal\\numask 027\\n' >> ~/.bashrc\ntail -3 ~/.bashrc\nsource ~/.bashrc\numask`} explain={[
          ['grep -n umask …', '-n = numerele liniilor; vezi dacă există deja o setare (și care din fișiere o face).'],
          ["printf '…' >> ~/.bashrc", '>> adaugă la sfârșit (nu suprascrie). \\n = linie nouă. Poți folosi și un editor (vi, nano).'],
          ['source ~/.bashrc', 'citește fișierul în shell-ul curent, fără a te deloga (alias: . ~/.bashrc).'],
        ]} />
        <CodeBlock title="~/.bashrc (fragment)" kind="config" label="illustrative" code={`# umask personal
umask 027`} explain={[
          ['# umask personal', 'comentariu (începe cu #): ignorat de shell.'],
          ['umask 027', 'se execută la fiecare shell interactiv nou: fișierele devin 640, directoarele 750.'],
        ]} />
        <p className="small">
          <code>~/.bashrc</code> este citit de shell-urile interactive non-login; pe RHEL, <code>~/.bash_profile</code> (shell de login) include de obicei <code>~/.bashrc</code>, deci setarea ajunge și la login (verifică cu <code>grep bashrc ~/.bash_profile</code>). Un job din cron nu citește <code>~/.bashrc</code>.
        </p>

        <h4>6. Persistență pentru toți: /etc/profile.d și /etc/login.defs</h4>
        <CodeBlock title="comenzi (ca root/sudo)" code={`sudo grep -n -E '^UMASK|^HOME_MODE|^USERGROUPS_ENAB' /etc/login.defs\nsudo grep -rn pam_umask /etc/pam.d/\nsudo tee /etc/profile.d/umask-local.sh >/dev/null <<'EOF'\n# umask pentru toti utilizatorii de login\numask 027\nEOF\nls -l /etc/profile.d/umask-local.sh\nsudo restorecon -v /etc/profile.d/umask-local.sh`} explain={[
          ['grep -n -E \'^UMASK|…\' /etc/login.defs', '-E = expresii regulate extinse; ^ = început de linie. Vezi UMASK (implicit 022 dacă lipsește, conform login.defs(5)), HOME_MODE (modul home-urilor noi) și USERGROUPS_ENAB (grup privat la useradd).'],
          ['grep -rn pam_umask /etc/pam.d/', '-r recursiv. Arată dacă modulul pam_umask este în stiva PAM (de confirmat pe RHEL 10); doar atunci UMASK din login.defs se aplică sesiunilor de login.'],
          ['tee /etc/profile.d/umask-local.sh <<\'EOF\'', 'tee scrie ca root (redirecționarea > nu ar avea drepturi sub sudo); <<\'EOF\' = here-document: textul până la EOF devine intrarea. >/dev/null ascunde ecoul.'],
          ['restorecon -v', 'pune contextul SELinux corect fișierului nou (vezi L10.5); pentru fișiere create cu tee în /etc de obicei contextul este deja corect.'],
        ]} />
        <Callout kind="warn" title="login.defs nu garantează efectul">
          Pagina <code>login.defs(5)</code> avertizează (secțiunea BUGS) că multe funcții au trecut la PAM. <code>UMASK</code> este citit de <code>pam_umask</code> (dacă este configurat) și de <code>useradd</code> pentru modul home-ului; shell-ul, la rândul lui, poate suprascrie valoarea prin <code>/etc/profile</code>/<code>/etc/bashrc</code>. Pe examen, după orice schimbare globală, <b>testează</b> cu un login real (<code>su - utilizator</code> sau <code>ssh</code>), nu presupune.
        </Callout>

        <h4>7. Servicii systemd: UMask=</h4>
        <CodeBlock title="/etc/systemd/system/exemplu.service.d/umask.conf" kind="config" label="illustrative" code={`[Service]
UMask=0027`} explain={[
          ['[Service]', 'secțiunea unității în care se pune directiva.'],
          ['UMask=0027', 'masca proceselor serviciului (octal, conform umask(2)); implicit 0022 la unitățile de sistem. Se aplică după systemctl daemon-reload și restart.'],
        ]} />
        <CodeBlock title="comenzi" code={`systemctl show -p UMask sshd\nsudo systemctl edit exemplu.service\nsudo systemctl daemon-reload\nsudo systemctl restart exemplu.service`} explain={[
          ['systemctl show -p UMask sshd', '-p = o singură proprietate: afișează UMask-ul unității (de exemplu UMask=0022).'],
          ['systemctl edit', 'creează un fișier drop-in (override.conf) în directorul exemplu.service.d/, fără a modifica unitatea originală (L4.9).'],
        ]} />

        <h4>8. Cum calculezi masca pornind de la rezultatul dorit</h4>
        <Table head={['Vrei fișiere/directoare', 'Șterg din 666 / 777', 'umask']} rows={[
          ['644 / 755', 'g: w (2), o: w (2)', <code>022</code>],
          ['664 / 775', 'o: w (2)', <code>002</code>],
          ['640 / 750', 'g: w (2), o: rwx (7)', <code>027</code>],
          ['600 / 700', 'g: rwx (7), o: rwx (7)', <code>077</code>],
          ['660 / 770', 'o: rwx (7)', <code>007</code>],
          ['444 / 555', 'u, g, o: w (2)', <code>222</code>],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="umask 022 → fișier și director" kind="session" label="illustrative" code={`[student@server1 umask-test]$ umask
0022
[student@server1 umask-test]$ touch fisier1
[student@server1 umask-test]$ mkdir dir1
[student@server1 umask-test]$ ls -ld fisier1 dir1
drwxr-xr-x. 2 student student  6 Nov 17 14:02 dir1
-rw-r--r--. 1 student student  0 Nov 17 14:02 fisier1`} />
        <p className="small">
          <code>0022</code>: primul <code>0</code> = biții speciali (nu contează aici), apoi <code>0</code> pentru u (nu șterge nimic), <code>2</code> pentru g (șterge <code>w</code>), <code>2</code> pentru o (șterge <code>w</code>). Fișierul are <code>-rw-r--r--</code> (644): pornit de la <code>rw-rw-rw-</code> și fără <code>w</code> la g și o; directorul <code>drwxr-xr-x</code> (755). Punctul de după drepturi (<code>.</code>) indică un context SELinux asociat (L10.4). Dimensiunea și data sunt ilustrative.
        </p>
        <CodeBlock title="umask 077" kind="session" label="illustrative" code={`[student@server1 umask-test]$ umask 077
[student@server1 umask-test]$ touch fisier2
[student@server1 umask-test]$ mkdir dir2
[student@server1 umask-test]$ stat -c '%A %a %n' fisier1 fisier2 dir1 dir2
-rw-r--r-- 644 fisier1
-rw------- 600 fisier2
drwxr-xr-x 755 dir1
drwx------ 700 dir2`} />
        <p className="small">
          Fișierele create <i>înainte</i> de schimbarea măștii (<code>fisier1</code>, <code>dir1</code>) nu s-au modificat; doar cele noi sunt private (600/700). Aceasta demonstrează că umask nu afectează fișierele existente.
        </p>
        <CodeBlock title="umask -S vs umask" kind="session" label="illustrative" code={`[student@server1 ~]$ umask
0027
[student@server1 ~]$ umask -S
u=rwx,g=rx,o=`} />
        <p className="small">
          Masca octală <code>027</code> șterge; forma simbolică <code>-S</code> arată ce <b>rămâne permis</b>: u=rwx (nimic șters), g=rx (w șters), o= (nimic permis). Cele două descriu aceeași valoare din perspective opuse; la examen citește cu atenție în ce formă ți se cere.
        </p>
        <CodeBlock title="subshell" kind="session" label="illustrative" code={`[student@server1 ~]$ umask 022
[student@server1 ~]$ ( umask 077; touch in-subshell )
[student@server1 ~]$ touch in-parinte
[student@server1 ~]$ ls -l in-subshell in-parinte
-rw-------. 1 student student 0 Nov 17 14:10 in-subshell
-rw-r--r--. 1 student student 0 Nov 17 14:10 in-parinte
[student@server1 ~]$ umask
0022`} />
        <p className="small">
          Fișierul din subshell este <code>600</code>, cel din părinte <code>644</code>, iar masca părintelui a rămas <code>0022</code>: schimbarea nu a ieșit din paranteze.
        </p>
        <CodeBlock title="systemd" kind="session" label="illustrative" code={`[student@server1 ~]$ systemctl show -p UMask sshd
UMask=0022`} />
        <p className="small">
          Valoarea implicită pentru unitățile de sistem (<code>systemd.exec</code>). Un serviciu poate fi diferit de shell-ul tău.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Masca activă:</b> <code>umask</code> (octal) și <code>umask -S</code> (simbolic).</li>
            <li><b>Efectul real:</b> <code>touch</code> + <code>mkdir</code> într-un director gol, apoi <code>stat -c '%A %a %n'</code>. Rezultatul așteptat trebuie să corespundă tabelului din secțiunea 3.</li>
            <li><b>Persistență pe utilizator:</b> deschide un shell <i>nou</i> (<code>su - utilizator</code> sau un terminal nou) și rulează <code>umask</code>.</li>
            <li><b>Persistență globală:</b> după editarea <code>/etc/profile.d/*.sh</code> sau <code>/etc/login.defs</code>, testează cu un login real al altui utilizator: <code>sudo su - alice -c umask</code>.</li>
            <li><b>Serviciu:</b> <code>systemctl show -p UMask NUME.service</code>, apoi verifică fișierele create de serviciu.</li>
            <li><b>De unde vine valoarea:</b> <code>grep -rn umask /etc/profile /etc/profile.d /etc/bashrc ~/.bashrc ~/.bash_profile</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <code>umask 027</code> tastat într-un terminal <b>nu</b> supraviețuiește logout-ului. Pentru ca valoarea să rămână, trebuie scrisă într-un fișier citit la inițializare:
          </p>
          <Table head={['Obiectiv', 'Unde scrii', 'Când intră în vigoare']} rows={[
            ['un utilizator, orice shell bash', <code>~/.bashrc</code>, 'următorul shell nou (sau source)'],
            ['un utilizator, la login', <code>~/.bash_profile</code>, 'următorul login'],
            ['toți utilizatorii', <code>/etc/profile.d/NUME.sh</code>, 'următorul login'],
            ['valoare implicită PAM/useradd', <><code>UMASK</code> în <code>/etc/login.defs</code></>, 'următorul login / următoarea creare de cont'],
            ['un serviciu systemd', <><code>UMask=</code> în drop-in</>, 'după daemon-reload și restart'],
          ]} />
          <p>
            Confirmare după reboot: autentifică-te și rulează <code>umask</code>; apoi creează un fișier de test. Nu uita că home-urile și fișierele <b>deja create</b> nu se schimbă.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Setat umask 027, dar la următorul login e 022/002', 'valoarea s-a pus doar în sesiune', <><code>grep -rn umask ~/.bashrc /etc/profile.d</code></>, <>scrie în <code>~/.bashrc</code> sau <code>/etc/profile.d/</code></>],
          ['Modificat UMASK în login.defs, fără efect în terminal', 'shell-ul (profile/bashrc) suprascrie sau pam_umask nu e în stivă', <><code>grep -rn pam_umask /etc/pam.d</code>, <code>grep -n umask /etc/profile /etc/bashrc</code></>, <>setează în <code>/etc/profile.d</code> sau în fișierele shell</>],
          ['Fișiere create de un serviciu au drepturi neașteptate', 'umask-ul serviciului (UMask=) diferă de al shell-ului', <code>systemctl show -p UMask SERVICIU</code>, <>setează <code>UMask=</code> în drop-in; <code>daemon-reload</code>; restart</>],
          ['Colegii nu pot scrie în fișierele din directorul comun', 'umask 022 (lipsă w pentru grup) și/sau lipsă setgid', <><code>ls -ld DIR</code>, <code>umask</code></>, <><code>chmod g+s DIR</code> și <code>umask 002</code></>],
          ['Scriptul din cron creează fișiere altfel decât în terminal', 'cron nu citește ~/.bashrc', <>compară <code>umask</code> în terminal vs în script</>, <>pune <code>umask 027</code> în script</>],
          ['Fișier „nu e executabil” deși umask 000', 'fișierele pornesc de la 666 (fără x)', <code>ls -l</code>, <><code>chmod +x</code> explicit</>],
          ['Rezultat 633 în loc de 644 cu umask 033 (calcul „minus”)', 'regula e AND NOT, nu scădere', 'tabelul din secțiunea 3', 'calculează pe biți'],
          ['Directorul nou nu poate fi folosit de grup', 'directoarele pornesc de la 777; umask 027 scoate w pentru grup, nu x', <><code>ls -ld</code></>, <><code>chmod g+w</code> după creare sau umask 007/002</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Crezi că <code>umask 022</code> „dă” drepturile 022. De fapt <b>scoate</b> aceste drepturi din 666/777.</>,
          <>Calculezi cu scădere aritmetică în loc de AND NOT (greșit la măști cu cifre impare, de exemplu <code>033</code>, <code>044</code>).</>,
          <>Uiți că fișierele noi nu au <code>x</code> și te miri că scriptul nu rulează.</>,
          <>Tastezi <code>umask 077</code> și presupui că rămâne după logout sau că afectează și serviciile.</>,
          <>Editezi doar <code>/etc/login.defs</code> și nu testezi cu un login real (shell-ul sau PAM pot ignora valoarea).</>,
          <>Ceri <code>umask 027</code> și verifici doar <i>fișierele</i>; la examen se verifică adesea și directoarele (750).</>,
          <>Confunzi semnele <code>+</code>/<code>-</code> din <code>umask g-w</code> cu cele din <code>chmod</code>: sunt inversate.</>,
          <>Încerci să repari fișiere existente cu <code>umask</code>; ai nevoie de <code>chmod</code>.</>,
          <>Setezi umask ca root și crezi că se aplică tuturor: este per proces/sesiune.</>,
          <>Uiți că un job din <code>cron</code> sau un serviciu nu citește <code>~/.bashrc</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: umask(2), ACL implicite, tar/cp, sudo și diferența dintre fișier și director">
        <p>
          <b>Apelul de sistem:</b> procesul apelează <code>umask(2)</code> (setează masca și întoarce vechea valoare); la <code>open(2)</code>/<code>mkdir(2)</code> kernelul calculează <code>mod &amp; ~umask &amp; 0777</code>. Biții speciali (setuid/setgid/sticky) pot fi dați explicit cu <code>chmod</code>, nu prin umask.
        </p>
        <p>
          <b>ACL implicite:</b> dacă un director are o ACL implicită (<code>setfacl -d</code>), aceasta <i>înlocuiește</i> umask-ul pentru fișierele noi din el. ACL-urile sunt în afara v1 al acestei platforme, dar explică de ce uneori umask-ul „nu se vede”.
        </p>
        <p>
          <b>cp, tar, install:</b> <code>cp</code> fără <code>-p</code> creează destinația cu modul sursei redus de umask; cu <code>cp -p</code> păstrează modul. <code>tar -x</code> ca utilizator obișnuit aplică umask-ul; ca root restaurează modurile din arhivă; <code>-p</code> forțează păstrarea. <code>install -m 640 sursă dest</code> setează modul explicit. Comportamentele fine (detaliile fiecărei comenzi) se citesc în paginile lor man.
        </p>
        <p>
          <b>sudo:</b> <code>sudoers(5)</code> are opțiunea <code>umask</code> (implicit <code>0022</code>) și <code>umask_override</code>; politica poate combina masca utilizatorului cu cea configurată. Ca atare, un fișier creat cu <code>sudo touch</code> poate avea drepturi diferite de unul creat fără sudo. Valoarea implicită pe RHEL 10 nu a fost confirmată.
        </p>
        <p>
          <b>Home-urile:</b> <code>useradd -m</code> folosește <code>HOME_MODE</code> (dacă e setat) sau <code>UMASK</code> pentru modul directorului home. Pe unele sisteme modul implicit al home-urilor este <code>0700</code> (privat), pe altele <code>0755</code>; verifică cu <code>ls -ld /home/NUME</code>.
        </p>
        <p>
          <b>Obiectivul oficial</b> „Manage default file permissions” nu detaliază mecanismul; în practică acoperă <code>umask</code>, calcularea măștii, aplicarea ei persistentă și efectul asupra fișierelor/directoarelor noi. Lecția acoperă și limitele (PAM, systemd, cron) ca să știi ce se întâmplă când valoarea „nu se aplică”.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_1: TopicModule = {
  id: 'L10.1',
  subtitle: 'umask: AND NOT peste 666/777, citire și setare (octal/simbolic), persistență (~/.bashrc, profile.d, login.defs/pam_umask, systemd UMask=)',
  studyTime: '≈90 min studiu + laborator',
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
  labs: [LAB_L10_1A, LAB_L10_1B],
  sources: [
    { kind: 'man', ref: 'umask(1p) (POSIX), login.defs(5), pam_umask(8) — man7.org, citite 2026-11-17' },
    { kind: 'upstream', ref: 'systemd.exec — directiva UMask= (freedesktop.org; primele 100 000 din ~245 000 caractere), citită 2026-11-17' },
    { kind: 'man', ref: 'umask(2), open(2), bash(1), sudoers(5) opțiunea umask, conținutul /etc/profile și /etc/bashrc pe RHEL 10 — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — gestionarea permisiunilor de fișiere (docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
