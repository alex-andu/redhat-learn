import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L9_1A, LAB_L9_1B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <b>cont de utilizator</b> este identitatea cu care cineva (sau ceva: un serviciu) lucrează pe sistem. Fiecare cont are un nume, un număr (<G id="uid">UID</G>), un <G id="primary-group">grup primar</G>, un director personal (<code>home</code>) și un <G id="login-shell">shell</G> de login. Datele lui stau în fișierele <G id="etc-passwd"><code>/etc/passwd</code></G> și <G id="etc-shadow"><code>/etc/shadow</code></G>. Se creează cu <G id="useradd"><code>useradd</code></G>, se modifică cu <G id="usermod"><code>usermod</code></G> și se șterg cu <G id="userdel"><code>userdel</code></G>.
          </p>
          <p>Obiectivul oficial: <i>„Create, delete, and modify local user accounts”</i>. Verificarea standard după orice schimbare: <code>id NUME</code> și <code>getent passwd NUME</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: un sistem multi-utilizator are nevoie de identități</h4>
          <p>
            Linux a fost proiectat ca sistem <b>multi-utilizator</b>: mai multe persoane și mai multe programe folosesc același calculator în același timp. Fără identități, nu ai putea răspunde la întrebări de bază: <i>cine</i> a șters fișierul? <i>Cui</i> aparține acest document? <i>Cine</i> are voie să oprească serverul web? Răspunsul este mereu același: fiecare acțiune este făcută de un <b>utilizator</b>, iar fiecare fișier și fiecare proces au un proprietar.
          </p>
          <Analogy>
            Gândește-te la o clădire de birouri cu portar. Fiecare angajat primește un <b>ecuson</b> (contul), pe care sunt scrise: numele, un număr de angajat (UID), departamentul (grupul primar) și biroul lui personal (directorul home). Portarul (kernelul) nu se uită la nume, ci <b>doar la număr</b>: ușile se deschid sau nu în funcție de acel număr. Un cont nou = un ecuson nou; ștergerea contului = retragerea ecusonului; dar camera cu hârtii a angajatului (home-ul) rămâne acolo până o golești explicit.
          </Analogy>

          <h4>Cine sunt „utilizatorii”: oameni și servicii</h4>
          <p>
            Nu toate conturile sunt pentru oameni. Când instalezi serverul web, sistemul creează un cont (de exemplu <code>apache</code>) sub care rulează serviciul. Dacă serviciul ar rula ca <code>root</code> și ar fi compromis, atacatorul ar controla tot sistemul; ca utilizator restrâns, el vede doar ce vede acel utilizator. De aceea Linux împarte conturile în trei categorii:
          </p>
          <Table head={['Categorie', 'Interval UID (convenție RHEL)', 'Scop', 'Exemple']} rows={[
            [<G id="root-user">root</G>, <code>0</code>, 'administratorul absolut; kernelul îi permite aproape orice', <code>root</code>],
            [<G id="system-account">Conturi de sistem</G>, 'de la 1 la 999 (pe RHEL 7+; limitele exacte sunt în /etc/login.defs)', 'rulează servicii; de obicei fără parolă și fără login interactiv', <><code>daemon</code>, <code>chrony</code>, <code>sshd</code></>],
            ['Conturi obișnuite', <>de la <code>1000</code> în sus</>, 'oameni care se autentifică și lucrează', <code>student</code>],
          ]} />
          <p className="small">
            Intervalele vin din <code>UID_MIN</code> (implicit 1000 în man page-ul <code>login.defs(5)</code>), <code>SYS_UID_MIN</code> și <code>SYS_UID_MAX</code>. Valorile exacte din fișierul RHEL 10 trebuie confirmate pe sistemul tău: <code>grep -E '^(UID|SYS_UID)_' /etc/login.defs</code>.
          </p>

          <h4>De ce sunt în examen</h4>
          <p>
            Aproape orice scenariu real începe cu un cont: „creează utilizatorul <code>alice</code> cu UID 2001, shell <code>/bin/bash</code>, membru în grupul <code>devs</code>”. Dacă greșești un parametru (UID, shell, grup), restul sarcinii (permisiuni, sudo, SSH, NFS) se strică în lanț. Obiectivul cere să știi trei verbe: <b>create</b>, <b>modify</b>, <b>delete</b>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Un utilizator este o linie într-un fișier text</h4>
          <p>
            Nu există „bază de date de utilizatori” misterioasă. Pe un sistem local, conturile sunt <b>linii în fișiere text</b> din <code>/etc</code>. Comenzile <code>useradd</code>, <code>usermod</code> și <code>userdel</code> doar editează aceste fișiere (cu blocare, ca să nu se strice la scrieri simultane) și creează sau șterg directorul home.
          </p>
          <Table head={['Fișier', 'Ce conține', 'Cine îl poate citi']} rows={[
            [<code>/etc/passwd</code>, 'identitatea contului: nume, UID, GID primar, comentariu, home, shell', 'toți utilizatorii (e public; e nevoie ca să poată traduce UID → nume)'],
            [<code>/etc/shadow</code>, 'parola (ca hash) și datele de expirare (L9.2)', 'doar root (de aceea există separat)'],
            [<code>/etc/group</code>, 'grupurile: nume, GID, membri suplimentari (L9.3)', 'toți'],
            [<code>/etc/gshadow</code>, 'datele secrete ale grupurilor', 'doar root'],
          ]} />
          <p>
            <b>De ce două fișiere (passwd și shadow)?</b> Istoric, hash-ul parolei era chiar în <code>/etc/passwd</code>, care trebuie să fie citibil de toți. Oricine putea copia hash-urile și le putea sparge offline. Soluția: hash-urile s-au mutat în <code>/etc/shadow</code>, lizibil doar de root. În <code>/etc/passwd</code>, în locul parolei a rămas litera <code>x</code>, care înseamnă „parola e în shadow”.
          </p>

          <h4>2. Cele șapte câmpuri din /etc/passwd</h4>
          <CodeBlock title="/etc/passwd (o linie)" kind="config" label="illustrative" code={`alice:x:2001:2001:Alice Popescu:/home/alice:/bin/bash`} explain={[
            ['alice', 'câmpul 1 — numele de login (cel scris la prompt). Reguli: litere mici, cifre, `_`, `-`; nu începe cu cratimă; maxim 32 de caractere.'],
            ['x', 'câmpul 2 — marcaj „parola este în /etc/shadow”. Nu este parola.'],
            ['2001', 'câmpul 3 — UID: numărul utilizatorului. Kernelul folosește numărul, nu numele.'],
            ['2001', 'câmpul 4 — GID-ul grupului primar (numărul grupului din /etc/group).'],
            ['Alice Popescu', 'câmpul 5 — comentariu (GECOS): de obicei numele complet. Se setează cu -c.'],
            ['/home/alice', 'câmpul 6 — directorul home: unde ajunge utilizatorul după login și unde stau fișierele lui.'],
            ['/bin/bash', 'câmpul 7 — shell-ul de login, programul pornit după autentificare.'],
          ]} />
          <Callout kind="info" title="Numărul contează, numele este doar o etichetă">
            Pe disc, fiecare fișier stochează <b>UID-ul</b> proprietarului, nu numele. Comanda <code>ls -l</code> caută UID-ul în <code>/etc/passwd</code> și afișează numele. Dacă ștergi utilizatorul și lași fișierele, <code>ls -l</code> va afișa doar un număr (de exemplu <code>2001</code>): fișierele sunt „orfane”. Dacă mai târziu creezi un utilizator nou cu același UID, el moștenește (accidental) acele fișiere.
          </Callout>

          <h4>3. Ce face useradd, pas cu pas</h4>
          <p>La o comandă simplă, <code>sudo useradd alice</code>, se întâmplă, în ordine (<code>useradd(8)</code>):</p>
          <ol>
            <li>Verifică numele (caractere permise) și dacă există deja (cod de ieșire <code>9</code> dacă da).</li>
            <li>Alege <b>UID-ul</b>: cel mai mic număr mai mare sau egal cu <code>UID_MIN</code> care este și mai mare decât al oricărui utilizator existent (dacă nu dai tu <code>-u</code>).</li>
            <li>Dacă <code>USERGROUPS_ENAB</code> este <code>yes</code>, creează un <b><G id="user-private-group">grup privat</G></b> cu același nume și același număr (dacă e posibil) ca GID.</li>
            <li>Adaugă linii în <code>/etc/passwd</code>, <code>/etc/shadow</code> (cu parola <b>blocată</b>: <code>!</code>), <code>/etc/group</code>, <code>/etc/gshadow</code>.</li>
            <li>Dacă <code>CREATE_HOME</code> este <code>yes</code> (sau ai dat <code>-m</code>): creează directorul home și copiază în el conținutul directorului <G id="skel"><code>/etc/skel</code></G> (fișierele de pornire, precum <code>.bashrc</code>), apoi pune proprietarul și permisiunile (din <code>HOME_MODE</code>, sau din <code>UMASK</code>).</li>
            <li>Resetează intrările din <code>lastlog</code>/<code>faillog</code> (ca un cont nou să nu moștenească istoricul unuia șters).</li>
          </ol>
          <Callout kind="warn" title="Contul nou nu poate face login încă">
            Fără <code>-p</code>, parola contului este blocată (semnul <code>!</code> în <code>/etc/shadow</code>). Utilizatorul nu se poate autentifica cu parolă până când tu rulezi <code>sudo passwd alice</code> (L9.2). Nu folosi <code>useradd -p</code> pentru parole: ia un hash deja calculat și îl face vizibil în lista de procese (<code>useradd(8)</code>).
          </Callout>

          <h4>4. Valorile implicite: de unde vin</h4>
          <Table head={['Sursă', 'Ce stabilește', 'Cum o vezi']} rows={[
            [<code>/etc/login.defs</code>, 'intervale de UID/GID (UID_MIN, UID_MAX, SYS_UID_*), UMASK, HOME_MODE, CREATE_HOME, USERGROUPS_ENAB, valori PASS_* (doar la creare)', <code>grep -v '^#' /etc/login.defs | grep -v '^$'</code>],
            [<code>/etc/default/useradd</code>, 'GROUP, HOME (directorul-părinte), INACTIVE, EXPIRE, SHELL, SKEL, CREATE_MAIL_SPOOL', <code>useradd -D</code>],
            [<code>/etc/skel</code>, 'fișierele copiate în fiecare home nou', <code>ls -la /etc/skel</code>],
          ]} />
          <p>
            Opțiunile din linia de comandă <b>au prioritate</b> față de aceste valori. Pe RHEL, instalarea configurează de obicei <code>CREATE_HOME yes</code> și <code>USERGROUPS_ENAB yes</code>, de aceea <code>useradd nume</code> creează implicit home și grup privat (de confirmat pe RHEL 10). Pe alte sisteme, fără <code>CREATE_HOME</code>, ai nevoie de <code>-m</code>. <b>La examen folosește mereu <code>-m</code> explicit</b> când ți se cere un home: nu strică și nu depinde de configurație.
          </p>

          <h4>5. Ce face usermod și ce NU face</h4>
          <p>
            <code>usermod</code> editează aceleași linii, câmp cu câmp. Subtilitățile care se întreabă:
          </p>
          <ul>
            <li><code>usermod -l nou vechi</code> schimbă <b>numai</b> numele de login. <b>Nu</b> redenumește directorul home, nu redenumește grupul privat și nu redenumește mail spool-ul (<code>usermod(8)</code>). Dacă vrei coerență, le faci tu: <code>-d</code> cu <code>-m</code> pentru home, <code>groupmod -n</code> pentru grup.</li>
            <li><code>usermod -d /nou -m</code> <b>mută</b> conținutul home-ului. <code>-d</code> singur doar schimbă calea scrisă în <code>/etc/passwd</code>, fără să mute fișiere.</li>
            <li><code>usermod -u NOU</code> schimbă UID-ul: se reproprietează automat <b>doar</b> home-ul și mail spool-ul. Fișierele din alte locuri rămân cu UID-ul vechi: le corectezi manual (<code>find / -xdev -uid VECHI -exec chown NOU {'{}'} +</code>).</li>
            <li>Nu schimba numele, UID-ul sau home-ul unui utilizator care are procese în rulare: pe Linux <code>usermod</code> refuză.</li>
            <li><code>usermod -L</code>/<code>-U</code>: blochează/deblochează parola (L9.2); <code>-e</code>/<code>-f</code>: expirarea contului (L9.2). <code>-G</code>/<code>-aG</code>: grupuri (L9.3).</li>
          </ul>

          <h4>6. Ce face userdel</h4>
          <ul>
            <li>Fără opțiuni: șterge liniile din <code>passwd</code>, <code>shadow</code>, <code>group</code>/<code>gshadow</code> (și grupul privat, dacă <code>USERGROUPS_ENAB=yes</code> și nu e grup primar al altcuiva). <b>Directorul home rămâne pe disc.</b></li>
            <li><code>userdel -r</code>: șterge și home-ul și mail spool-ul. Fișierele proprii din alte locuri (de exemplu <code>/srv</code>, <code>/var/tmp</code>, cron jobs) <b>rămân</b>: le cauți cu <code>find / -xdev -nouser</code> sau după UID.</li>
            <li>Refuză dacă utilizatorul este conectat sau are procese (cod de ieșire <code>8</code>). Soluția corectă: închizi procesele (<code>pkill -u NUME</code>), apoi ștergi. <code>-f</code> forțează, dar este periculos (<code>userdel(8)</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Grupuri (L9.3):</b> fiecare utilizator are un grup primar (câmpul 4 din passwd) și opțional grupuri suplimentare (în <code>/etc/group</code>). Folosești <code>-g</code>/<code>-G</code> la creare.</li>
            <li><b>Parole (L9.2):</b> contul nou are parolă blocată; <code>passwd</code> și <code>chage</code> lucrează pe <code>/etc/shadow</code>.</li>
            <li><b>sudo (L9.4):</b> accesul administrativ se acordă prin apartenența la grupul <code>wheel</code> sau prin fișiere în <code>/etc/sudoers.d</code>.</li>
            <li><b>Permisiuni (L1.8, L6.5):</b> proprietarul și grupul fișierelor sunt UID/GID; <code>chown</code> lucrează cu aceste numere. Un utilizator nou cu UID-ul unui utilizator șters moștenește fișierele.</li>
            <li><b>Login și SSH (L1.10, L1.11):</b> după autentificare, sistemul pornește shell-ul din câmpul 7 și intră în home-ul din câmpul 6. Un shell invalid sau <code>nologin</code> blochează login-ul interactiv.</li>
            <li><b>SELinux (C10):</b> un home creat de <code>useradd -m</code> în <code>/home</code> primește contextul corect. Dacă îl creezi în altă parte (<code>-d /srv/alice</code>), contextul poate fi greșit; se corectează cu <code>restorecon</code> (de confirmat comportamentul pe RHEL 10).</li>
            <li><b>Cron, at, systemd (C4, C7):</b> job-urile unui utilizator șters pot rămâne orfane (<code>userdel(8)</code> menționează <code>USERDEL_CMD</code> pentru curățare).</li>
            <li><b>NFS (L6.3):</b> permisiunile pe NFS se bazează pe <b>UID-uri numerice</b>: același nume cu UID-uri diferite pe client și server produce proprietari greșiți.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Primești un angajat nou: <code>useradd</code> cu nume complet, shell și grupuri.</li>
            <li>Serviciu nou care trebuie să ruleze izolat: cont de sistem (<code>-r</code>) fără shell de login.</li>
            <li>Angajatul pleacă: blochezi contul (L9.2), arhivezi home-ul, apoi <code>userdel -r</code>.</li>
            <li>Schimbi shell-ul (de la <code>bash</code> la <code>nologin</code>) pentru un cont de serviciu.</li>
            <li>Muți home-urile pe un volum separat (<code>usermod -d … -m</code>).</li>
            <li>Examen: „create user <code>bob</code> with UID 3000, comment ‘Bob’, shell <code>/bin/bash</code>, primary group <code>devs</code>”; „set the shell of <code>svc</code> to <code>/sbin/nologin</code>”; „delete user <code>old</code> including home”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu pe o mașină de test, ca <code>student</code> cu <code>sudo</code> (L9.4). Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Numele (<code>alice</code>, <code>bob</code>, <code>svc-app</code>) și numerele sunt fictive. Comenzile se rulează cu <code>sudo</code> pentru că modifică fișiere din <code>/etc</code>.
        </Callout>

        <h4>1. Inspectează înainte să creezi</h4>
        <CodeBlock title="comenzi" code={`id\nid student\nid -u\nid -un\ngetent passwd student\ngetent passwd 1000\ngrep -E '^(UID|SYS_UID|GID|SYS_GID)_(MIN|MAX)' /etc/login.defs\ngrep -E '^(CREATE_HOME|USERGROUPS_ENAB|UMASK|HOME_MODE)' /etc/login.defs\nuseradd -D\nls -la /etc/skel\nls /home`} explain={[
          ['id', 'fără argument: utilizatorul curent — uid, gid primar, groups (toate grupurile).'],
          ['id student', 'aceleași informații pentru alt utilizator.'],
          ['id -u / -un', '-u = doar UID-ul efectiv; -n = nume în loc de număr (cu -u, -g sau -G).'],
          ['getent passwd NUME|UID', 'interoghează baza de utilizatori prin NSS (include și conturi din surse externe, ca sssd); returnează linia în format passwd. Cod de ieșire 2 = nu există.'],
          ['grep -E … /etc/login.defs', 'intervalele de UID/GID din configurația sistemului (-E = expresie regulată extinsă, pentru alternarea cu |).'],
          ['grep -E CREATE_HOME…', 'dacă useradd creează implicit home și grup privat.'],
          ['useradd -D', '-D fără alte opțiuni = afișează valorile implicite (GROUP, HOME, INACTIVE, EXPIRE, SHELL, SKEL…).'],
          ['ls -la /etc/skel', 'ce fișiere vor fi copiate în home-ul noului utilizator (-a arată și ascunsele, cu punct).'],
        ]} />

        <h4>2. Creează un cont obișnuit</h4>
        <CodeBlock title="comenzi" code={`sudo useradd alice\nid alice\ngetent passwd alice\nls -ld /home/alice\nsudo passwd -S alice\nsudo grep '^alice:' /etc/shadow`} explain={[
          ['useradd alice', 'forma minimă; folosește valorile implicite (UID automat, grup privat, home din CREATE_HOME, shell implicit).'],
          ['id alice', 'confirmă UID-ul, grupul primar (de obicei același nume) și grupurile.'],
          ['getent passwd alice', 'linia cu cele șapte câmpuri.'],
          ['ls -ld /home/alice', '-l = format lung, -d = afișează directorul însuși, nu conținutul; confirmă proprietarul alice:alice și permisiunile.'],
          ['passwd -S alice', '-S = status: L înseamnă parolă blocată (contul nou, fără parolă).'],
          ['grep ^alice: /etc/shadow', 'dovada: în câmpul 2 apare ! (blocat). Necesită sudo: /etc/shadow e citibil doar de root.'],
        ]} />

        <h4>3. Creează cu toți parametrii (forma de examen)</h4>
        <CodeBlock title="comenzi" code={`sudo groupadd devs\nsudo useradd -m -u 2001 -g devs -G wheel -c "Bob Ionescu" -s /bin/bash bob\nid bob\ngetent passwd bob\nls -la /home/bob`} explain={[
          ['groupadd devs', 'grupul primar trebuie să existe ÎNAINTE de useradd -g (altfel cod 6, „group does not exist”).'],
          ['-m', '--create-home: creează home-ul și copiază /etc/skel în el (explicit, independent de CREATE_HOME).'],
          ['-u 2001', '--uid: UID-ul cerut. Trebuie să fie liber, altfel eroare (cod 4); doar cu -o se acceptă duplicat (nerecomandat).'],
          ['-g devs', '--gid: grupul PRIMAR (nume sau număr). Cu -g, nu se mai creează grup privat.'],
          ['-G wheel', '--groups: grupuri SUPLIMENTARE, separate prin virgulă, FĂRĂ spații (ex. wheel,devs). Aici bob primește drepturi sudo prin wheel (L9.4).'],
          ['-c "Bob Ionescu"', '--comment: câmpul 5 (GECOS). Ghilimele, pentru că are spațiu.'],
          ['-s /bin/bash', '--shell: shell-ul de login (câmpul 7). Trebuie să fie în /etc/shells pentru ca login-ul să funcționeze normal.'],
          ['bob', 'numele de login: ULTIMUL argument. Opțiunile vin înainte.'],
        ]} />
        <p>
          Alte opțiuni utile la creare: <code>-d /srv/bob</code> (home în altă cale; <code>-m</code> îl creează), <code>-k /etc/skel-dev</code> (alt schelet; doar cu <code>-m</code>), <code>-e 2027-12-31</code> (contul expiră la acea dată), <code>-f 30</code> (zile de inactivitate după expirarea parolei), <code>-N</code> (fără grup privat), <code>-U</code> (cu grup privat), <code>-M</code> (fără home), <code>-r</code> (cont de sistem), <code>-o</code> (UID duplicat).
        </p>

        <h4>4. Cont de serviciu (de sistem)</h4>
        <CodeBlock title="comenzi" code={`sudo useradd -r -s /sbin/nologin -c "Aplicatia mea" svc-app\nid svc-app\ngetent passwd svc-app\nls -d /home/svc-app`} explain={[
          ['-r', '--system: UID din intervalul de sistem (sub UID_MIN), fără parolă/aging, fără home implicit.'],
          ['-s /sbin/nologin', 'programul care refuză login-ul interactiv: afișează un mesaj și iese. Calea poate fi /usr/sbin/nologin; verifică cu ls /sbin/nologin /usr/sbin/nologin (de confirmat pe RHEL 10).'],
          ['ls -d /home/svc-app', 'așteptat: „No such file or directory”: contul de sistem nu are home.'],
        ]} />

        <h4>5. Modifică un cont</h4>
        <CodeBlock title="comenzi" code={`sudo usermod -c "Bob I. (dev)" bob\nsudo usermod -s /bin/zsh bob\nsudo usermod -s /bin/bash bob\nsudo usermod -u 2500 bob\nsudo usermod -g devs bob\nsudo usermod -d /srv/bob -m bob\nsudo usermod -l robert bob\nsudo usermod -e 2027-06-30 robert\nid robert\ngetent passwd robert`} explain={[
          ['-c "…"', 'schimbă comentariul (GECOS).'],
          ['-s SHELL', 'schimbă shell-ul. Valoarea trebuie să fie un executabil valid; un șir gol înseamnă „shell implicit”.'],
          ['-u 2500', 'UID nou; home-ul și mail spool-ul sunt reproprietate, restul fișierelor NU: corectezi manual.'],
          ['-g devs', 'grup primar (trebuie să existe). Fișierele din home cu grupul vechi primesc noul grup.'],
          ['-d /srv/bob -m', '-d = noul home; -m = MUTĂ conținutul (doar împreună cu -d).'],
          ['-l robert bob', '-l = login nou, apoi numele vechi (ultimul argument este întotdeauna contul existent). Nu redenumește home-ul sau grupul.'],
          ['-e 2027-06-30', 'data la care contul este dezactivat (YYYY-MM-DD, interpretată în UTC).'],
        ]} />
        <Callout kind="tip" title="Ordinea argumentelor la usermod -l">
          Sintaxa este <code>usermod -l NUME_NOU NUME_VECHI</code>. Dacă le inversezi, comanda eșuează cu „user does not exist” sau, mai rău, redenumești alt cont. Verifică imediat cu <code>id NUME_NOU</code>.
        </Callout>

        <h4>6. Șterge un cont</h4>
        <CodeBlock title="comenzi" code={`sudo userdel svc-app\nsudo userdel -r robert\nid robert\nls -ld /srv/bob\nsudo find / -xdev -nouser 2>/dev/null | head`} explain={[
          ['userdel svc-app', 'șterge contul, păstrează directorul home (dacă există).'],
          ['userdel -r robert', '-r = remove: șterge și home-ul (acolo unde îl indică /etc/passwd) și mail spool-ul.'],
          ['id robert', 'așteptat: „no such user” (cod de ieșire 1).'],
          ['find / -xdev -nouser', 'caută fișiere ai căror UID nu mai există în /etc/passwd (-xdev = nu traversa alte sisteme de fișiere; 2>/dev/null ascunde erorile de permisiuni).'],
        ]} />
        <p>
          Ordinea sigură la plecarea unui angajat: (1) <code>sudo usermod -L -e 1 NUME</code> (blocat imediat, L9.2); (2) închizi procesele (<code>sudo pkill -u NUME</code>); (3) arhivezi <code>/home/NUME</code> dacă e nevoie (<code>tar</code>, L1.9); (4) <code>sudo userdel -r NUME</code>; (5) cauți fișiere rămase cu <code>find</code>.
        </p>

        <h4>7. Verifică direct în fișiere</h4>
        <CodeBlock title="comenzi" code={`grep '^alice:' /etc/passwd\nsudo grep '^alice:' /etc/shadow\ngrep '^alice:' /etc/group\nsudo vipw -s\nsudo lastlog -u alice\nwho\nlast -n 5`} explain={[
          ["grep '^alice:' /etc/passwd", '^ = început de linie; \':\' evită potrivirea cu alice2. Afișează linia contului.'],
          ['sudo grep … /etc/shadow', 'sudo, pentru că shadow este citibil doar de root.'],
          ['vipw / vipw -s', 'editor sigur (cu blocare) pentru passwd; -s pentru shadow. Nu e necesar la examen; arată că fișierele chiar sunt text.'],
          ['lastlog -u alice', 'ultima autentificare (la un cont nou: „Never logged in”).'],
          ['who / last -n 5', 'cine este conectat acum / ultimele 5 autentificări.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="id și getent după useradd -m" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo useradd -m -u 2001 -g devs -G wheel -c "Bob Ionescu" -s /bin/bash bob
[student@server1 ~]$ id bob
uid=2001(bob) gid=1010(devs) groups=1010(devs),10(wheel)
[student@server1 ~]$ getent passwd bob
bob:x:2001:1010:Bob Ionescu:/home/bob:/bin/bash
[student@server1 ~]$ ls -ld /home/bob
drwx------. 2 bob devs 62 Nov 17 10:12 /home/bob`} />
        <p className="small">
          <b>uid=2001(bob)</b>: UID-ul cerut. <b>gid=1010(devs)</b>: grupul primar. <b>groups=…</b>: lista tuturor grupurilor (primar + suplimentare); <code>10(wheel)</code> arată că <code>bob</code> poate folosi sudo. Linia <code>getent</code> are cele 7 câmpuri; observă <code>x</code> în loc de parolă. În <code>ls -ld</code>: <code>drwx------</code> = permisiuni 0700 (doar proprietarul); punctul de la final (<code>.</code>) indică un context SELinux asociat (C10). Valorile numerice, data și dimensiunea sunt ilustrative: HOME_MODE/UMASK din configurația ta pot da <code>0700</code> sau <code>0755</code>.
        </p>

        <CodeBlock title="passwd -S și shadow pentru un cont nou" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo passwd -S alice
alice L 2026-11-17 0 99999 7 -1
[student@server1 ~]$ sudo grep '^alice:' /etc/shadow
alice:!:20409:0:99999:7:::`} />
        <p className="small">
          <code>passwd -S</code> afișează 7 câmpuri (<code>passwd(1)</code>): nume, stare (<b>L</b> = parolă blocată, <b>NP</b> = fără parolă, <b>P</b> = parolă utilizabilă), data ultimei schimbări, minim, maxim, avertizare, inactivitate. În <code>/etc/shadow</code>, <code>!</code> în câmpul 2 = parolă blocată (<code>shadow(5)</code>); <code>20409</code> este data ca număr de zile de la 1970-01-01 (aici ilustrativ). Valorile <code>0 99999 7</code> sunt tipice RHEL (de confirmat pe RHEL 10).
        </p>

        <CodeBlock title="cont de sistem" kind="session" label="illustrative" code={`[student@server1 ~]$ getent passwd svc-app
svc-app:x:988:987:Aplicatia mea:/:/sbin/nologin
[student@server1 ~]$ sudo -u svc-app /bin/bash
This account is currently not available.`} />
        <p className="small">
          UID-ul <code>988</code> este sub 1000 (interval de sistem). Fără <code>-m</code>/<code>-d</code>, home-ul apare ca <code>/</code> (valoare ilustrativă; poate diferi). <code>nologin</code> afișează mesajul și iese: contul poate rula servicii, dar nu poate fi folosit interactiv (mesajul exact depinde de versiune).
        </p>

        <CodeBlock title="fișiere orfane după userdel fără -r" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo userdel bob
[student@server1 ~]$ ls -ld /home/bob
drwx------. 2 2001 1010 62 Nov 17 10:12 /home/bob`} />
        <p className="small">
          Home-ul a rămas, dar proprietarul și grupul apar ca <b>numere</b> (<code>2001</code>, <code>1010</code>), pentru că nu mai există nume pentru ele. Dacă acum creezi un utilizator nou cu <code>-u 2001</code>, el preia automat acest director.
        </p>

        <CodeBlock title="mesaje de eroare frecvente" kind="session" label="illustrative" code={`[student@server1 ~]$ useradd carol
useradd: Permission denied.
useradd: cannot lock /etc/passwd; try again later.
[student@server1 ~]$ sudo useradd bob
useradd: user 'bob' already exists
[student@server1 ~]$ sudo useradd -g inexistent dave
useradd: group 'inexistent' does not exist
[student@server1 ~]$ echo $?
6`} />
        <p className="small">
          Prima: nu ești root (lipsește <code>sudo</code>). A doua: utilizatorul există (cod 9). A treia: grupul din <code>-g</code> nu există (cod 6). Formularea exactă a mesajelor poate diferi pe RHEL 10; <b>codurile de ieșire</b> (<code>echo $?</code>) vin din <code>useradd(8)</code>: 4 = UID folosit, 6 = grup inexistent, 9 = nume folosit, 12 = nu poate crea home.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Existența:</b> <code>getent passwd NUME</code> (cod 0) sau <code>id NUME</code>.</li>
            <li><b>UID/GID/grupuri:</b> <code>id NUME</code> — compară cu cerința; <code>id -Gn NUME</code> = doar numele grupurilor.</li>
            <li><b>Comentariu, home, shell:</b> câmpurile 5–7 din <code>getent passwd NUME</code>.</li>
            <li><b>Home:</b> <code>ls -ld /home/NUME</code> (proprietar corect) și <code>ls -la /home/NUME</code> (fișierele din /etc/skel).</li>
            <li><b>Stare parolă:</b> <code>sudo passwd -S NUME</code>.</li>
            <li><b>Ștergere:</b> <code>id NUME</code> trebuie să dea „no such user”; <code>ls -ld /home/NUME</code> trebuie să dea „No such file” dacă ai folosit <code>-r</code>.</li>
            <li><b>Login real:</b> <code>sudo su - NUME</code> (după ce are parolă) sau <code>sudo -u NUME id</code> (rulează o comandă ca acel utilizator, fără parolă).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Conturile sunt scrise <b>direct pe disc</b> în fișierele din <code>/etc</code>: o modificare făcută cu <code>useradd</code>/<code>usermod</code>/<code>userdel</code> <b>persistă la reboot</b> fără alt pas. Nu există un echivalent „runtime vs permanent” ca la firewall.
          </p>
          <p>
            Ce poate să nu persiste: conținutul lui <code>/etc/skel</code> modificat <i>după</i> crearea contului nu apare retroactiv în home-uri existente; un home creat pe un volum care nu e montat persistent (L5.5) dispare logic după reboot; la o imagine de sistem „reset” conturile revin la starea imaginii.
          </p>
          <p>
            Confirmare manuală după <code>sudo reboot</code>: <code>id NUME</code>, <code>getent passwd NUME</code>, <code>ls -ld HOME</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>useradd: Permission denied</code>, 'rulezi fără privilegii', <code>id</code>, <>folosește <code>sudo useradd …</code></>],
          [<code>user 'X' already exists</code>, 'numele e folosit (cod 9)', <code>getent passwd X</code>, 'alege alt nume sau modifică contul existent cu usermod'],
          [<code>group 'X' does not exist</code>, 'grupul din -g/-G nu a fost creat (cod 6)', <code>getent group X</code>, <><code>sudo groupadd X</code> înainte</>],
          [<code>UID 'N' already exists</code>, 'UID ocupat (cod 4)', <code>getent passwd N</code>, 'alege un UID liber sau, deliberat, -o'],
          ['Home-ul nu există', 'nu ai dat -m și CREATE_HOME nu e activ', <code>ls -ld /home/NUME</code>, <><code>sudo mkhomedir_helper NUME</code> (dacă există) sau <code>mkdir</code> + <code>chown</code> + <code>chmod 700</code> și copiere din /etc/skel (de confirmat unealta pe RHEL 10)</>],
          ['Login imposibil pentru cont nou', 'parola e blocată (!)', <code>sudo passwd -S NUME</code>, <><code>sudo passwd NUME</code> (L9.2)</>],
          [<code>usermod: user X is currently used by process N</code>, 'utilizatorul e conectat / are procese', <code>ps -u X</code>, <>închide procesele (<code>pkill -u X</code>), apoi repetă</>],
          [<code>userdel: user X is currently used by process N</code>, 'idem (cod 8)', <code>ps -u X</code>, 'închide procesele sau blochează contul și șterge mai târziu'],
          ['ls arată numere în loc de nume', 'UID/GID fără intrare (utilizator șters)', <code>find / -xdev -nouser</code>, <>reproprietezi cu <code>chown</code> sau recreezi contul cu același UID</>],
          ['Login „merge”, dar apare „This account is currently not available”', 'shell = nologin', <code>getent passwd NUME</code>, <><code>sudo usermod -s /bin/bash NUME</code></>],
          ['După usermod -l, home-ul are tot numele vechi', '-l nu mută home-ul', <code>getent passwd NOU</code>, <><code>sudo usermod -d /home/NOU -m NOU</code></>],
          ['/etc/passwd blocat', 'altă comandă îl modifică (lock)', <code>ls /etc/passwd.lock</code>, 'așteaptă; dacă e fișier rămas după un crash și nicio comandă nu rulează, ștergerea lui e ultima soluție'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești <code>-g</code> cu un grup care nu există încă: creează grupul înainte.</>,
          <>Pui spații în <code>-G a, b</code>: lista este <code>a,b</code>, fără spații.</>,
          <>Confunzi <code>-g</code> (grup primar) cu <code>-G</code> (grupuri suplimentare).</>,
          <>Uiți <code>-m</code> și crezi că home-ul există; verifică mereu cu <code>ls -ld</code>.</>,
          <>Folosești <code>userdel NUME</code> și crezi că home-ul a dispărut: fără <code>-r</code> rămâne.</>,
          <>Folosești <code>usermod -G wheel NUME</code> și pierzi celelalte grupuri: se adaugă cu <code>-aG</code> (L9.3).</>,
          <>După <code>usermod -l</code> nu verifici home-ul și grupul: rămân cu numele vechi.</>,
          <>Dai parola în clar cu <code>useradd -p parola</code>: <code>-p</code> cere un hash, iar parola ar apărea în procese. Folosește <code>passwd</code> sau <code>chpasswd</code>.</>,
          <>Creezi un cont de serviciu cu shell <code>/bin/bash</code>: pentru conturi de sistem se folosește <code>nologin</code>.</>,
          <>Reutilizezi un UID al unui cont șters: noul utilizator moștenește fișierele celui vechi.</>,
          <>Scrii numele contului înaintea opțiunilor: numele este ultimul argument.</>,
          <>Încerci să modifici un utilizator conectat (UID, nume, home).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: subuid/subgid, SELinux, nologin, UID mapping, lastlog și conturi centralizate">
        <p>
          <b>/etc/subuid și /etc/subgid:</b> intervale de UID/GID „subordonate” rezervate unui utilizator pentru containere rootless și user namespaces. <code>useradd</code> le actualizează dacă fișierele există și contul nu e de sistem (cu <code>-F</code>, și pentru conturi de sistem). Nu fac parte din obiectivul EX200; le vezi doar ca linii suplimentare.
        </p>
        <p>
          <b>SELinux user mapping:</b> opțiunea <code>-Z</code> a lui <code>useradd</code> setează utilizatorul SELinux asociat contului (gestionat de fapt cu <code>semanage login</code>). Este un subiect pentru C10.
        </p>
        <p>
          <b>nologin vs /bin/false:</b> ambele blochează un shell interactiv; <code>nologin</code> afișează un mesaj. Un shell trebuie să fie listat în <code>/etc/shells</code> ca să fie acceptat de unele servicii (de exemplu FTP/SSH în anumite configurații); <code>cat /etc/shells</code> arată lista.
        </p>
        <p>
          <b>Conturi centralizate:</b> în organizații, utilizatorii vin din LDAP/Active Directory prin <code>sssd</code>. <code>getent passwd</code> îi arată; <code>grep /etc/passwd</code> nu. Această lecție acoperă doar conturile <b>locale</b>, adică exact ce cere obiectivul.
        </p>
        <p>
          <b>lastlog și faillog:</b> bazele de date cu ultima autentificare/încercările eșuate, indexate după UID. <code>useradd</code> le resetează pentru UID-ul nou (opțiunea <code>-l</code>/<code>LOG_INIT=no</code> o dezactivează).
        </p>
        <p>
          <b>Hook-uri:</b> scripturi în <code>/etc/shadow-maint/useradd-pre.d</code> și <code>useradd-post.d</code> se rulează la creare (<code>useradd(8)</code>); un cod de ieșire nenul oprește procesarea. Nu se folosesc la examen.
        </p>
        <p>
          <b>Limite de nume:</b> <code>useradd(8)</code>: nume cu caractere restrânse; <code>--badname</code> permite nume ce nu respectă regulile (nerecomandat).
        </p>
      </DeepDive>
    </>
  );
}

export const L9_1: TopicModule = {
  id: 'L9.1',
  subtitle: '/etc/passwd și /etc/shadow, UID/GID, useradd, usermod, userdel, home, shell, /etc/skel',
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
  labs: [LAB_L9_1A, LAB_L9_1B],
  sources: [
    { kind: 'man', ref: 'useradd(8), usermod(8), userdel(8), login.defs(5), shadow(5), id(1) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'passwd(5), /etc/skel, nologin(8), vipw(8), getent(1) — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — documentația docs.redhat.com: HTTP 403 la 2026-11-17, necitită; de confirmat valorile implicite din /etc/login.defs și /etc/default/useradd' },
  ],
};
