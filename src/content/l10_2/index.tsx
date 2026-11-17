import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_2A, LAB_L10_2B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Autentificarea cu chei înlocuiește parola cu o <b>pereche de chei criptografice</b>: o cheie <b>privată</b> care nu părăsește niciodată calculatorul tău (<code>~/.ssh/id_ed25519</code>) și o cheie <b>publică</b> (<code>id_ed25519.pub</code>) pe care o pui pe server, în <G id="authorized-keys"><code>~/.ssh/authorized_keys</code></G> al contului țintă. Pașii: <code>ssh-keygen -t ed25519</code> → <code>ssh-copy-id utilizator@server</code> → <code>ssh utilizator@server</code> (fără parola contului).
          </p>
          <p>
            Condiția cea mai des ratată: <b>permisiunile</b> (<code>~/.ssh</code> = 700, <code>authorized_keys</code> = 600, home-ul nescriptibil de alții) și <b>contextul SELinux</b> al fișierelor din <code>~/.ssh</code>. Dacă acestea sunt greșite, serverul ignoră cheia în tăcere și îți cere din nou parola.
          </p>
          <p>Obiectivul oficial: <i>„Configure key-based authentication for SSH”</i>. Verificare: <code>ssh -v utilizator@server</code>, <code>ls -ld ~/.ssh</code>, <code>journalctl -u sshd</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema cu parolele</h4>
          <p>
            În L1.11 te-ai conectat cu <code>ssh utilizator@gazdă</code> și parola contului. Parolele au slăbiciuni: pot fi ghicite sau încercate automat (<i>brute force</i>), pot fi refolosite pe alte servicii, se tastează la fiecare conectare (incomod pentru scripturi, <code>scp</code>, <code>rsync</code> sau automatizări) și circulă, deși criptat, până la server, unde sunt comparate cu o valoare stocată. Autentificarea cu chei elimină aceste probleme: <b>secretul nu este trimis niciodată</b>; serverul doar verifică, printr-o probă matematică, că ai cheia privată.
          </p>
          <Analogy>
            Cheia publică este o <b>broască</b> pe care o poți face în mii de exemplare și o montezi pe orice ușă (server) vrei; oricine o poate vedea, nu contează. Cheia privată este <b>singura cheie fizică</b> care o deschide. Cine are broasca nu poate deduce cheia. Serverul îți dă o provocare („semnează acest număr”), tu o semnezi cu cheia privată, iar serverul verifică semnătura cu cheia publică, fără ca cheia privată să fi circulat.
          </Analogy>

          <h4>Termeni de la zero</h4>
          <Table head={['Termen', 'Sens', 'Unde se află']} rows={[
            ['cheie privată', 'secretul; dovedește identitatea ta', <><code>~/.ssh/id_ed25519</code> pe CLIENT, drepturi 600</>],
            ['cheie publică', 'poate fi distribuită liber', <><code>~/.ssh/id_ed25519.pub</code> pe client; copiată pe server</>],
            [<G id="authorized-keys">authorized_keys</G>, 'lista cheilor publice acceptate pentru un cont', <><code>~/.ssh/authorized_keys</code> pe SERVER, în home-ul contului țintă</>],
            [<G id="passphrase">frază-parolă (passphrase)</G>, 'parolă opțională care criptează cheia privată pe disc', 'în fișierul cheii private (criptat)'],
            [<G id="host-key">cheia gazdei</G>, 'identifică SERVERUL față de client (invers!)', <><code>/etc/ssh/ssh_host_*</code> pe server; <code>~/.ssh/known_hosts</code> pe client</>],
            [<G id="ssh-agent">ssh-agent</G>, 'proces care ține cheia privată decriptată în memorie', 'variabila SSH_AUTH_SOCK'],
          ]} />
          <Callout kind="warn" title="Două perechi de chei, două direcții">
            Nu amesteca: <b>cheile gazdei</b> dovedesc serverul clientului (prima conectare: „Are you sure you want to continue connecting?”); <b>cheile utilizatorului</b> dovedesc utilizatorul serverului (această lecție). Sunt independente.
          </Callout>

          <h4>Alegerea algoritmului</h4>
          <p>
            Conform <code>ssh-keygen(1)</code>, tipurile disponibile sunt <code>ed25519</code> (implicit), <code>rsa</code>, <code>ecdsa</code> și variantele <code>-sk</code> (chei legate de un dispozitiv hardware). <b>Ed25519</b> este modern, rapid, are chei scurte (lungime fixă; <code>-b</code> este ignorat). <b>RSA</b>: minim 1024 de biți, implicit 3072; folosește-l când un sistem vechi nu acceptă Ed25519 (și atunci, cel puțin 3072–4096). Politica criptografică a sistemului (<code>update-crypto-policies</code>) poate restricționa algoritmi; pe RHEL 10 verifică politica activă dacă o cheie este respinsă.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Dialogul de autentificare, pas cu pas</h4>
          <ol>
            <li>Clientul se conectează, se negociază criptarea, iar clientul verifică <b>cheia gazdei</b> față de <code>known_hosts</code>.</li>
            <li>Clientul spune: „vreau să mă autentific ca <code>alice</code> și am cheia publică K”. Încearcă pe rând cheile disponibile: cele din <code>ssh-agent</code>, cele indicate cu <code>-i</code>/<code>IdentityFile</code>, apoi fișierele implicite <code>~/.ssh/id_rsa</code>, <code>id_ecdsa</code>, <code>id_ed25519</code> etc. (<code>ssh(1)</code>).</li>
            <li>Serverul (<code>sshd</code>) deschide <b>fișierul <code>authorized_keys</code> al contului alice</b> (<code>AuthorizedKeysFile</code>, implicit <code>.ssh/authorized_keys</code>, în home-ul ei) și caută K. Înainte, verifică <b>permisiunile</b> (vezi mai jos).</li>
            <li>Dacă K este acolo, serverul trimite o <b>provocare</b>; clientul o <b>semnează</b> cu cheia privată (de aceea îți cere, dacă există, fraza-parolă ca să o decripteze local) și trimite semnătura.</li>
            <li>Serverul verifică semnătura cu K. Dacă e validă: autentificat, fără ca parola contului să fi fost folosită.</li>
            <li>Dacă nicio cheie nu merge, <code>sshd</code> trece la următoarea metodă (parola, dacă <code>PasswordAuthentication yes</code>).</li>
          </ol>
          <p>
            Ordinea metodelor din client (<code>ssh(1)</code>): GSSAPI, host-based, <b>public key</b>, keyboard-interactive, parolă. Se poate schimba cu <code>PreferredAuthentications</code>. De aceea, dacă cheia nu este acceptată, ajungi „în tăcere” la cererea parolei: nu primești un mesaj de eroare clar în client.
          </p>

          <h4>2. Regula permisiunilor (StrictModes)</h4>
          <p>
            Dacă <code>~/.ssh/authorized_keys</code>, directorul <code>~/.ssh</code> sau chiar <b>home-ul</b> utilizatorului pot fi <b>scrise de alții</b>, <code>sshd</code> nu folosește fișierul (<code>sshd(8)</code>), exceptând cazul în care <code>StrictModes no</code>. În <code>sshd_config(5)</code>, <G id="strictmodes">StrictModes</G> are valoarea implicită <code>yes</code>. Motiv: dacă altcineva poate adăuga o cheie în <code>authorized_keys</code>, poate intra în contul tău.
          </p>
          <Table head={['Cale', 'Mod recomandat', 'Simbolic', 'Observații']} rows={[
            [<code>~</code>, <><code>755</code> sau mai strict</>, 'rwxr-xr-x', 'nu trebuie să fie scriptibil de grup/others'],
            [<code>~/.ssh</code>, <code>700</code>, 'rwx------', 'doar proprietarul'],
            [<code>~/.ssh/authorized_keys</code>, <code>600</code>, 'rw-------', 'poate fi și 644; ‘not writable by others’ e cerința'],
            [<>cheia privată <code>~/.ssh/id_ed25519</code></>, <code>600</code>, 'rw-------', 'ssh refuză cheia privată prea permisivă'],
            [<code>~/.ssh/id_ed25519.pub</code>, <code>644</code>, 'rw-r--r--', 'publică, poate fi citită de toți'],
            [<code>~/.ssh/known_hosts</code>, <><code>644</code> sau <code>600</code></>, 'rw-r--r--', 'scriptibil doar de proprietar'],
            [<code>~/.ssh/config</code>, <code>600</code>, 'rw-------', 'scriptibil doar de utilizator (ssh(1))'],
          ]} />

          <h4>3. Formatul unei linii din authorized_keys</h4>
          <CodeBlock title="~/.ssh/authorized_keys" kind="config" label="illustrative" code={`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExempluDeCheiePublicaIlustrativa0123456789ab alice@workstation
# o cheie pe linie; liniile goale si cele cu # sunt ignorate
from="192.0.2.0/24",no-port-forwarding ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAltaCheieIlustrativa9876543210abcdef backup@server2`} explain={[
            ['ssh-ed25519', 'tipul cheii (alte valori: ssh-rsa, ecdsa-sha2-nistp256, sk-ssh-ed25519@openssh.com…).'],
            ['AAAAC3Nza…', 'cheia publică propriu-zisă, codificată base64 (valorile din exemplu sunt fictive).'],
            ['alice@workstation', 'comentariu liber: sshd nu îl folosește; ajută să știi a cui este cheia (implicit utilizator@gazdă).'],
            ['from="192.0.2.0/24",no-port-forwarding', 'opțiuni înaintea cheii (opțional): restricții — doar din acea rețea, fără port forwarding. Separate prin virgulă, fără spații (în afară de ghilimele). Lista completă: sshd(8).'],
          ]} />
          <p className="small">
            Fiecare cheie este pe <b>o singură linie</b> (până la 8 KB). Dacă o cheie este împărțită pe două linii prin copiere greșită, nu funcționează. De aceea <code>ssh-copy-id</code> este preferat pentru cheile reale.
          </p>

          <h4>4. De ce contează și SELinux</h4>
          <p>
            <code>sshd</code> rulează într-un domeniu SELinux confinat (<code>sshd_t</code>); fișierele din <code>~/.ssh</code> trebuie să aibă tipul <code>ssh_home_t</code> pentru a fi citite. Dacă creezi fișierul în alt loc și îl <b>muți</b> (<code>mv</code>), el păstrează eticheta veche și poate fi refuzat. Remediu: <code>restorecon -R -v ~/.ssh</code> (L10.5). Tipurile exacte sunt de confirmat pe RHEL 10 cu <code>ls -dZ ~/.ssh</code>.
          </p>

          <h4>5. ssh-agent: de ce nu tastezi fraza-parolă la fiecare conectare</h4>
          <p>
            Dacă cheia privată are o frază-parolă, fișierul este criptat. La fiecare conectare ar trebui s-o tastezi. <code>ssh-agent</code> este un proces care <b>ține cheia decriptată în memorie</b> și semnează provocările în numele clientului. Comunică printr-un socket Unix indicat de <code>SSH_AUTH_SOCK</code>. <code>ssh-add</code> încarcă o cheie în agent (<code>-l</code> listează amprentele, <code>-L</code> cheile publice, <code>-d</code>/<code>-D</code> scot, <code>-t</code> pune o durată de viață; <code>ssh-add(1)</code>). Pentru examen, de obicei se cere „fără frază-parolă”, deci agentul nu e necesar, dar e util în practică.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>SSH de bază (L1.11):</b> conectarea, <code>known_hosts</code>, <code>scp</code>/<code>sftp</code>/<code>rsync</code> (L4.10) folosesc aceleași chei: odată configurate, transferurile nu mai cer parola.</li>
            <li><b>Conturi (L9.1) și parole (L9.2):</b> un cont <b>blocat</b> (<code>passwd -l</code>, <code>!</code> în <code>/etc/shadow</code>) poate refuza și autentificarea cu cheie, în funcție de <code>UsePAM</code> și configurație: parola blocată ≠ cont blocat în toate cazurile (de confirmat pe RHEL 10). Un cont cu <code>nologin</code> ca shell nu primește sesiune.</li>
            <li><b>Permisiuni (L1.8, L10.1):</b> regula 700/600 de mai sus; <code>umask</code> afectează permisiunile fișierelor create în <code>~/.ssh</code> (de aceea <code>ssh-keygen</code> setează explicit modul cheii private la 600).</li>
            <li><b>SELinux (L10.4, L10.5):</b> eticheta <code>ssh_home_t</code> pe <code>~/.ssh</code>; <code>restorecon</code> repară un fișier mutat.</li>
            <li><b>firewalld (L8.4, C10-1):</b> serviciul <code>ssh</code> trebuie permis în zonă; fără el nu ajungi la <code>sshd</code> deloc. SELinux și firewalld sunt straturi separate (un port SSH nestandard cere și <code>semanage port</code>, L10.6).</li>
            <li><b>systemd și jurnal (L4.7, L4.9):</b> serviciul se numește <code>sshd.service</code>; <code>journalctl -u sshd</code> arată motivele refuzului pe server („Authentication refused: bad ownership or modes for directory …”).</li>
            <li><b>sudo (L9.4):</b> configurarea cheilor pentru <i>alt</i> utilizator se face ca root/cu sudo; fișierele trebuie apoi să aparțină acelui utilizator (<code>chown</code>).</li>
            <li><b>PAM:</b> după autentificare cu cheie, stiva PAM <code>account</code>/<code>session</code> se aplică în continuare (expirări, limite, <code>pam_umask</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li><b>Administrare zilnică:</b> te conectezi la zeci de servere fără parole.</li>
            <li><b>Automatizare:</b> scripturi, <code>rsync</code> din cron, instrumente de configurare: nu pot tasta parole.</li>
            <li><b>Întărirea serverului:</b> după ce cheile merg, <code>PasswordAuthentication no</code> elimină atacurile cu parole.</li>
            <li><b>Acces restrâns:</b> o cheie cu <code>command="…"</code> poate rula doar o comandă anume (backup).</li>
            <li><b>Examen:</b> „configure SSH key-based authentication for user <code>student</code> from <code>server1</code> to <code>server2</code>; no passphrase”, „verify that you can log in without a password”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Ai nevoie de <b>două mașini</b> de test (client: <code>server1</code>, țintă: <code>server2</code>) sau de o singură mașină folosită ca ambele (<code>ssh student@localhost</code>). Output-urile sunt <b>Ilustrative</b>. Păstrează mereu o a doua sesiune deschisă când schimbi <code>sshd_config</code>: o greșeală te poate bloca.
        </Callout>

        <h4>1. Generează perechea de chei (pe client)</h4>
        <CodeBlock title="comenzi" code={`ssh-keygen -t ed25519\nssh-keygen -t ed25519 -C "student@server1" -f ~/.ssh/id_lab -N ""\nssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_lab\nls -l ~/.ssh\nssh-keygen -lf ~/.ssh/id_lab.pub\ncat ~/.ssh/id_lab.pub`} explain={[
          ['ssh-keygen -t ed25519', '-t = tipul cheii. Fără -f, pune cheia în ~/.ssh/id_ed25519; întreabă fraza-parolă (Enter = fără). Dacă fișierul există, întreabă dacă îl suprascrie: nu răspunde „y” fără să te gândești, pierzi cheia veche.'],
          ['-C "student@server1"', '-C = comentariu atașat cheii publice (implicit utilizator@gazdă).'],
          ['-f ~/.ssh/id_lab', '-f = fișierul cheii private; cea publică primește sufixul .pub.'],
          ['-N ""', '-N = fraza-parolă dată direct; "" = fără frază (potrivit pentru exerciții și automatizări; pentru chei reale preferă o frază).'],
          ['ssh-keygen -t rsa -b 4096', '-b = numărul de biți (doar pentru RSA/ECDSA; pentru ed25519 este ignorat).'],
          ['ssh-keygen -lf …pub', '-l = afișează amprenta (fingerprint), -f = fișierul de citit.'],
          ['cat …pub', 'cheia publică: o singură linie; asta se copiază pe server.'],
        ]} />

        <h4>2. Instalează cheia publică pe server</h4>
        <CodeBlock title="metoda recomandată" code={`ssh-copy-id -i ~/.ssh/id_lab.pub student@server2\nssh-copy-id -n -i ~/.ssh/id_lab.pub student@server2\nssh-copy-id -p 2222 student@server2`} explain={[
          ['ssh-copy-id -i ~/.ssh/id_lab.pub student@server2', '-i = cheia de instalat (sufixul .pub se adaugă dacă lipsește). Se conectează cu parola contului (o singură dată) și ADAUGĂ (append) cheia în ~/.ssh/authorized_keys de pe server; creează fișierul și directorul dacă lipsesc (ssh-copy-id(1)).'],
          ['-n', 'dry run: arată ce chei ar instala, fără a instala.'],
          ['-p 2222', 'portul sshd al serverului, dacă nu este 22.'],
          ['(fără -i)', 'alege cheile din ssh-agent, altfel fișierul ~/.ssh/id*.pub cel mai recent modificat.'],
        ]} />
        <CodeBlock title="metoda manuală (când ssh-copy-id nu e disponibil)" code={`cat ~/.ssh/id_lab.pub | ssh student@server2 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'\nssh student@server2 'restorecon -R -v ~/.ssh; ls -ld ~/.ssh; ls -l ~/.ssh'`} explain={[
          ['cat …pub | ssh … \'…\'', 'trimite conținutul cheii publice prin pipe către comanda de pe server.'],
          ['mkdir -p ~/.ssh', '-p = fără eroare dacă există; creează directorul.'],
          ['chmod 700 ~/.ssh', 'doar proprietarul: cerința sshd.'],
          ['cat >> ~/.ssh/authorized_keys', '>> ADAUGĂ la sfârșit; cu > ai suprascrie cheile existente.'],
          ['chmod 600 …', 'doar proprietarul scrie/citește.'],
          ['restorecon -R -v ~/.ssh', 'repune contextul SELinux (L10.5).'],
        ]} />

        <h4>3. Conectează-te și verifică</h4>
        <CodeBlock title="comenzi" code={`ssh -i ~/.ssh/id_lab student@server2\nssh -i ~/.ssh/id_lab -o PasswordAuthentication=no student@server2 hostname\nssh -v -i ~/.ssh/id_lab student@server2\nssh -o PreferredAuthentications=publickey -o PubkeyAuthentication=yes student@server2 id`} explain={[
          ['ssh -i FIȘIER', '-i = cheia privată de folosit. Fără -i, ssh încearcă fișierele implicite (id_rsa, id_ecdsa, id_ed25519…).'],
          ['-o PasswordAuthentication=no', '-o = opțiune în format de configurare. Cu parola dezactivată, dacă cheia nu merge, conectarea EȘUEAZĂ în loc să ceară parola: test demn de încredere pentru cheie.'],
          ['ssh … hostname', 'rulează o comandă pe server și se întoarce (nu deschide shell).'],
          ['ssh -v', '-v = verbose; -vv, -vvv mai detaliat. Caută în output „Offering public key”, „Authentication succeeded (publickey)”.'],
        ]} />

        <h4>4. Fraza-parolă și ssh-agent</h4>
        <CodeBlock title="comenzi" code={`ssh-keygen -p -f ~/.ssh/id_lab\neval "$(ssh-agent -s)"\nssh-add ~/.ssh/id_lab\nssh-add -l\nssh student@server2 hostname\nssh-add -d ~/.ssh/id_lab\nssh-agent -k`} explain={[
          ['ssh-keygen -p -f …', '-p = schimbă (sau pune/șterge) fraza-parolă a unei chei existente; cere fraza veche și de două ori pe cea nouă.'],
          ['eval "$(ssh-agent -s)"', 'pornește agentul și exportă SSH_AUTH_SOCK în shell-ul curent (eval execută liniile pe care le tipărește agentul).'],
          ['ssh-add FIȘIER', 'încarcă cheia în agent; cere fraza-parolă o singură dată.'],
          ['ssh-add -l', 'listează amprentele cheilor din agent.'],
          ['ssh-add -d FIȘIER', 'scoate o cheie din agent; -D le scoate pe toate.'],
          ['ssh-agent -k', 'oprește agentul.'],
        ]} />

        <h4>5. Configurația serverului: sshd_config</h4>
        <CodeBlock title="comenzi (pe server, ca root/sudo)" code={`sudo grep -n -E '^(PubkeyAuthentication|PasswordAuthentication|PermitRootLogin|StrictModes|AuthorizedKeysFile|Include)' /etc/ssh/sshd_config\nsudo sshd -T | grep -E 'pubkeyauthentication|passwordauthentication|permitrootlogin|authorizedkeysfile'\nsudo sshd -t && echo sintaxa-ok\nsudo systemctl reload sshd\nsudo systemctl status sshd --no-pager`} explain={[
          ['grep -n -E …', '-n = numere de linie; -E = regex extins. Doar directivele ACTIVE (necomentate) apar.'],
          ['sshd -T', '-T = „extended test mode”: afișează configurația EFECTIVĂ (cu valorile implicite și fișierele incluse), în minuscule. Mai sigur decât să citești fișierul.'],
          ['sshd -t', '-t = test mode: verifică validitatea configurației (cod 0 = ok); rulează-l înainte de reload.'],
          ['systemctl reload sshd', 'reîncarcă configurația fără a întrerupe sesiunile deschise; restart ar putea fi necesar pentru unele schimbări.'],
        ]} />
        <CodeBlock title="/etc/ssh/sshd_config (fragment)" kind="config" label="illustrative" code={`PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
StrictModes yes
PermitRootLogin prohibit-password
PasswordAuthentication yes`} explain={[
          ['PubkeyAuthentication yes', 'permite autentificarea cu chei (implicit yes, conform sshd_config(5)).'],
          ['AuthorizedKeysFile .ssh/authorized_keys', 'unde caută sshd cheile, relativ la home. Implicit sshd_config(5): „.ssh/authorized_keys .ssh/authorized_keys2”.'],
          ['StrictModes yes', 'verifică proprietarul și permisiunile fișierelor utilizatorului înainte de a le accepta (implicit yes).'],
          ['PermitRootLogin prohibit-password', 'root poate intra doar cu cheie, nu cu parolă (implicit conform sshd_config(5)); alte valori: yes, no, forced-commands-only.'],
          ['PasswordAuthentication yes', 'permite parola (implicit yes). Setarea la no se face DOAR după ce ai testat cheia dintr-o a doua sesiune.'],
        ]} />
        <Callout kind="warn" title="Nu te bloca singur">
          Înainte de <code>PasswordAuthentication no</code>: (1) deschide o a doua sesiune SSH deja autentificată, (2) testează cu <code>ssh -o PasswordAuthentication=no</code>, (3) rulează <code>sshd -t</code>, (4) <code>systemctl reload sshd</code>, (5) testează din nou dintr-o sesiune <i>nouă</i>. Pe RHEL se pot găsi directive și în fișiere incluse (<code>Include</code>); prima valoare citită pentru o directivă câștigă, deci <code>sshd -T</code> arată valoarea reală. Obiectivul oficial cere configurarea autentificării cu chei, nu dezactivarea parolei; fă asta doar dacă cerința o spune.
        </Callout>

        <h4>6. Fișier de configurare client: ~/.ssh/config</h4>
        <CodeBlock title="~/.ssh/config" kind="config" label="illustrative" code={`Host server2
    HostName 192.0.2.12
    User student
    IdentityFile ~/.ssh/id_lab
    IdentitiesOnly yes`} explain={[
          ['Host server2', 'alias: ssh server2 folosește blocul de mai jos.'],
          ['HostName 192.0.2.12', 'adresa reală (192.0.2.0/24 este interval de documentație).'],
          ['User student', 'utilizatorul implicit.'],
          ['IdentityFile ~/.ssh/id_lab', 'cheia privată de folosit pentru această gazdă.'],
          ['IdentitiesOnly yes', 'folosește doar cheia indicată, nu încearcă toate cheile din agent (evită blocarea după prea multe încercări).'],
        ]} />
        <p className="small">Fișierul trebuie să fie scriptibil doar de tine (<code>chmod 600 ~/.ssh/config</code>), conform <code>ssh(1)</code>. După aceea: <code>ssh server2</code>.</p>

        <h4>7. Reparare permisiuni și context</h4>
        <CodeBlock title="comenzi (pe server, ca utilizatorul țintă sau root)" code={`ls -ld ~ ~/.ssh ~/.ssh/authorized_keys\nchmod 700 ~/.ssh\nchmod 600 ~/.ssh/authorized_keys\nchown -R student:student ~/.ssh\nls -dZ ~/.ssh ~/.ssh/authorized_keys\nrestorecon -R -v ~/.ssh`} explain={[
          ['ls -ld ~ ~/.ssh ~/.ssh/authorized_keys', '-l format lung, -d directorul însuși, nu conținutul. Verifici proprietarul (student) și modurile.'],
          ['chown -R student:student ~/.ssh', '-R = recursiv; doar proprietarul corect poate fi acceptat (L1.8).'],
          ['ls -dZ', '-Z afișează contextul SELinux; așteptat tipul ssh_home_t (de confirmat pe RHEL 10).'],
          ['restorecon -R -v ~/.ssh', 'readuce contextul implicit; -v arată ce s-a schimbat.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ssh-keygen" kind="session" label="illustrative" code={`[student@server1 ~]$ ssh-keygen -t ed25519 -C "student@server1" -f ~/.ssh/id_lab
Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/student/.ssh/id_lab
Your public key has been saved in /home/student/.ssh/id_lab.pub
The key fingerprint is:
SHA256:AbCdEfGhIjKlMnOpQrStUvWxYz0123456789ExampleXx student@server1`} />
        <p className="small">
          Două fișiere: <code>id_lab</code> (privată, secretă) și <code>id_lab.pub</code> (publică). <b>Amprenta</b> (<code>SHA256:…</code>) este o sumă scurtă a cheii publice, folosită pentru a compara chei fără a citi întregul șir. Valorile sunt fictive.
        </p>
        <CodeBlock title="ssh-copy-id" kind="session" label="illustrative" code={`[student@server1 ~]$ ssh-copy-id -i ~/.ssh/id_lab.pub student@server2
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/student/.ssh/id_lab.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
student@server2's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'student@server2'"
and check to make sure that only the key(s) you wanted were added.`} />
        <p className="small">
          Parola este cerută <b>o singură dată</b>, chiar pentru instalare. Mesajul final îți spune ce să testezi. Formularea exactă variază după versiunea OpenSSH.
        </p>
        <CodeBlock title="ssh -v (cheie acceptată)" kind="session" label="illustrative" code={`debug1: Authentications that can continue: publickey,gssapi-keyex,gssapi-with-mic,password
debug1: Next authentication method: publickey
debug1: Offering public key: /home/student/.ssh/id_lab ED25519 SHA256:AbCd… explicit
debug1: Server accepts key: /home/student/.ssh/id_lab ED25519 SHA256:AbCd… explicit
debug1: Authentication succeeded (publickey).`} />
        <p className="small">
          <b>Authentications that can continue</b>: ce metode oferă serverul. <b>Offering public key</b>: clientul propune cheia; <b>Server accepts key</b>: cheia este în <code>authorized_keys</code> (permisiunile au fost în regulă); <b>Authentication succeeded (publickey)</b>: provocarea a fost semnată corect. Dacă lipsește „Server accepts key”, problema este pe server (cheie neinstalată, permisiuni, SELinux).
        </p>
        <CodeBlock title="ssh -v (cheie respinsă)" kind="session" label="illustrative" code={`debug1: Offering public key: /home/student/.ssh/id_lab ED25519 SHA256:AbCd… explicit
debug1: Authentications that can continue: publickey,gssapi-keyex,gssapi-with-mic,password
debug1: Next authentication method: password
student@server2's password:`} />
        <p className="small">
          Cheia a fost oferită, dar serverul nu a răspuns „accepts key” și clientul a trecut la parolă. Pe server: <code>journalctl -u sshd -n 20</code>.
        </p>
        <CodeBlock title="jurnal sshd: permisiuni greșite" kind="session" label="illustrative" code={`Nov 17 16:02:11 server2 sshd[2301]: Authentication refused: bad ownership or modes for directory /home/student
Nov 17 16:02:11 server2 sshd[2301]: Authentication refused: bad ownership or modes for file /home/student/.ssh/authorized_keys`} />
        <p className="small">
          Mesajele <i>bad ownership or modes</i> arată un <code>StrictModes</code> încălcat: home-ul sau <code>~/.ssh</code> sunt scriptibile de alții sau au proprietar greșit. Textul exact poate diferi pe RHEL 10.
        </p>
        <CodeBlock title="sshd -T (extras)" kind="session" label="illustrative" code={`pubkeyauthentication yes
passwordauthentication yes
permitrootlogin without-password
authorizedkeysfile .ssh/authorized_keys .ssh/authorized_keys2
strictmodes yes`} />
        <p className="small">
          <code>sshd -T</code> scrie numele directivelor cu litere mici. Valoarea <code>without-password</code> este numele vechi al lui <code>prohibit-password</code>; unele versiuni afișează unul sau celălalt. Valorile sunt ilustrative.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Cheie funcțională:</b> <code>ssh -o PasswordAuthentication=no -i CHEIE utilizator@server hostname</code> → numele serverului, fără prompt de parolă.</li>
            <li><b>Dialogul:</b> <code>ssh -v …</code> arată „Server accepts key” și „Authentication succeeded (publickey)”.</li>
            <li><b>Pe server:</b> <code>ls -ld ~ ~/.ssh</code> și <code>ls -l ~/.ssh/authorized_keys</code> (proprietar corect, 700/600), <code>ls -dZ ~/.ssh</code> (tip <code>ssh_home_t</code>).</li>
            <li><b>Cheie publică prezentă:</b> <code>grep -c "$(cat ~/.ssh/id_lab.pub | cut -d' ' -f2)" ~/.ssh/authorized_keys</code> pe server (numărul 1) sau <code>ssh-keygen -lf ~/.ssh/authorized_keys</code> (listează amprentele cheilor din fișier).</li>
            <li><b>Configurația efectivă:</b> <code>sudo sshd -T | grep -E 'pubkey|password|authorizedkeys'</code>.</li>
            <li><b>Jurnal:</b> <code>sudo journalctl -u sshd -n 30 --no-pager</code>.</li>
            <li><b>Test din altă sesiune:</b> după orice modificare a <code>sshd_config</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Cheile și <code>authorized_keys</code> sunt fișiere pe disc: <b>persistă la reboot</b>, cu condiția ca permisiunile și contextul SELinux să rămână corecte. Directivele din <code>sshd_config</code> persistă la fel, dar <b>intră în vigoare doar după</b> <code>systemctl reload sshd</code> (sau restart). <code>sshd</code> trebuie să fie <b>activ la boot</b> (<code>systemctl enable --now sshd</code>, L4.9) și serviciul <code>ssh</code> permis permanent în firewall (<code>firewall-cmd --permanent --add-service=ssh</code>, L8.4).
          </p>
          <p>
            Ce poate dispărea: un <code>ssh-agent</code> nu persistă la reboot (cheile trebuie reîncărcate cu <code>ssh-add</code>); un fișier mutat cu <code>mv</code> poate pierde eticheta SELinux corectă după un relabel dacă nu are regulă (<code>restorecon</code> o recuperează). Confirmare manuală după reboot: <code>ssh -o PasswordAuthentication=no …</code> din client.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Cere parola deși ai copiat cheia', 'permisiuni greșite pe server (home, ~/.ssh, authorized_keys)', <><code>ls -ld ~ ~/.ssh</code>, jurnal sshd „bad ownership or modes”</>, <><code>chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys</code>, home nescriptibil de alții</>],
          ['Cere parola; permisiunile sunt corecte', 'context SELinux greșit (fișier mutat)', <><code>ls -dZ ~/.ssh ~/.ssh/authorized_keys</code>; <code>ausearch -m avc -ts recent</code></>, <><code>restorecon -R -v ~/.ssh</code></>],
          ['„Permission denied (publickey)”', 'serverul acceptă doar chei și a respins-o: cheie neinstalată, utilizator greșit, fișier greșit', <><code>ssh -v</code>; comparare amprentă</>, 'reinstalează cheia pentru UTILIZATORUL corect'],
          ['„WARNING: UNPROTECTED PRIVATE KEY FILE!”', 'cheia privată are mod prea permisiv (644)', <code>ls -l ~/.ssh/id_*</code>, <><code>chmod 600 ~/.ssh/id_lab</code></>],
          ['Cheia nu este încercată', 'fișier cu alt nume decât cele implicite, fără -i/IdentityFile', <><code>ssh -v</code> (arată cheile oferite)</>, <>folosește <code>-i</code> sau <code>IdentityFile</code></>],
          ['Prea multe chei oferite → „Too many authentication failures”', 'agentul oferă toate cheile înainte de cea corectă', <code>ssh-add -l</code>, <><code>IdentitiesOnly yes</code> sau <code>ssh -o IdentitiesOnly=yes -i …</code></>],
          ['Utilizatorul root nu poate intra cu parolă', 'PermitRootLogin prohibit-password (implicit)', <code>sshd -T | grep permitrootlogin</code>, 'folosește cheie sau un cont normal + sudo (preferat)'],
          ['După editarea sshd_config nimic nu s-a schimbat', 'lipsă reload sau valoarea e suprascrisă de un fișier inclus', <><code>sshd -T</code></>, <><code>sshd -t; systemctl reload sshd</code>; verifică <code>Include</code></>],
          ['Conectare imposibilă („Connection refused”/timeout)', 'sshd oprit sau firewall', <><code>systemctl status sshd</code>; <code>firewall-cmd --list-services</code></>, <>pornește serviciul; <code>--add-service=ssh</code> (L8.4)</>],
          ['Cheia are mai multe linii în authorized_keys', 'copiere manuală greșită (rupere de linie)', <code>cat -A ~/.ssh/authorized_keys</code>, 'folosește ssh-copy-id; o cheie = o linie'],
          ['„REMOTE HOST IDENTIFICATION HAS CHANGED”', 'cheia gazdei s-a schimbat', 'L1.11', <><code>ssh-keygen -R server2</code> (dacă schimbarea e legitimă)</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Copiezi cheia <b>privată</b> pe server în loc de cea publică (<code>.pub</code>). Privata nu părăsește niciodată clientul.</>,
          <>Pui cheia publică în <code>authorized_keys</code> al utilizatorului <b>greșit</b> (de exemplu root în loc de <code>student</code>).</>,
          <>Folosești <code>&gt;</code> în loc de <code>&gt;&gt;</code> și ștergi cheile existente.</>,
          <>Uiți <code>chmod 700 ~/.ssh</code> și <code>chmod 600 authorized_keys</code> (sau home-ul scriptibil de grup).</>,
          <>Creezi fișierele ca root în home-ul altui utilizator și uiți <code>chown</code>: sshd refuză proprietarul greșit.</>,
          <>Muți fișierele cu <code>mv</code> și nu repari contextul SELinux (<code>restorecon</code>).</>,
          <>Dezactivezi <code>PasswordAuthentication</code> înainte să testezi cheia; rămâi blocat.</>,
          <>Uiți <code>systemctl reload sshd</code> după schimbarea configurației.</>,
          <>Înlocuiești <code>ssh-copy-id</code> cu <code>scp</code> care suprascrie <code>authorized_keys</code>.</>,
          <>Ceri o frază-parolă la examen când cerința este „fără parolă” (și invers).</>,
          <>Testezi cheia cu <code>ssh</code> simplu: dacă cheia e respinsă ajungi la parola contului și crezi că „merge”. Folosește <code>-o PasswordAuthentication=no</code> sau citește <code>ssh -v</code>.</>,
          <>Confunzi cheile gazdei (<code>known_hosts</code>) cu cheile utilizatorului (<code>authorized_keys</code>).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: certificuri SSH, opțiuni din authorized_keys, chei hardware, politica criptografică">
        <p>
          <b>Opțiuni în authorized_keys:</b> <code>sshd(8)</code> listează <code>command="…"</code> (forțează o singură comandă), <code>from="…"</code> (restricție după gazdă/rețea), <code>restrict</code> (dezactivează toate funcțiile extra), <code>no-pty</code>, <code>no-port-forwarding</code>, <code>expiry-time</code>, <code>permitopen</code> etc. Folosit pentru conturi de backup/automatizare cu drepturi minime.
        </p>
        <p>
          <b>Certificate SSH:</b> o autoritate de certificare (CA) semnează cheile utilizatorilor; serverul are în <code>TrustedUserCAKeys</code> cheia CA și nu mai ține <code>authorized_keys</code> pentru fiecare utilizator. Se adaugă opțiunea <code>cert-authority</code>. Mecanism avansat, în afara obiectivului.
        </p>
        <p>
          <b>Chei hardware (<code>-sk</code>):</b> <code>ed25519-sk</code> și <code>ecdsa-sk</code> leagă cheia de un token FIDO/YubiKey; cheia privată din fișier este doar un „mâner”. În afara obiectivului.
        </p>
        <p>
          <b>Politica criptografică RHEL:</b> comanda <code>update-crypto-policies</code> setează algoritmii acceptați de întregul sistem (inclusiv OpenSSH). Politici mai stricte (FUTURE, FIPS) pot respinge chei RSA scurte sau anumiți algoritmi; <code>update-crypto-policies --show</code> afișează politica activă. Comportamentul pe RHEL 10 trebuie confirmat.
        </p>
        <p>
          <b>authorized_keys2 și AuthorizedKeysFile:</b> implicit <code>sshd</code> caută în două fișiere (<code>authorized_keys</code> și <code>authorized_keys2</code>); <code>AuthorizedKeysFile none</code> dezactivează. Se pot folosi șabloane (<code>%u</code>, <code>%h</code>) pentru a muta cheile într-o locație centralizată, de exemplu <code>/etc/ssh/authorized_keys/%u</code>; atunci permisiunile și contextul SELinux se verifică pe acea cale.
        </p>
        <p>
          <b>De ce ed25519 e preferat:</b> cheie de 256 de biți, semnături scurte, generare rapidă, rezistent la anumite erori de implementare; <code>ssh-keygen(1)</code> îl folosește implicit când nu specifici <code>-t</code>.
        </p>
        <p>
          <b>PermitRootLogin:</b> <code>sshd_config(5)</code> arată implicit <code>prohibit-password</code> (root doar cu cheie). Practică recomandată: <code>PermitRootLogin no</code> și un utilizator obișnuit cu <code>sudo</code> (L9.4). Nu schimba aceste valori la examen decât dacă ți se cere.
        </p>
      </DeepDive>
    </>
  );
}

export const L10_2: TopicModule = {
  id: 'L10.2',
  subtitle: 'ssh-keygen, ssh-copy-id, authorized_keys, permisiuni și SELinux, ssh -i/-v, ssh-agent, sshd_config (PubkeyAuthentication, StrictModes), depanare',
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
  labs: [LAB_L10_2A, LAB_L10_2B],
  sources: [
    { kind: 'man', ref: 'ssh-keygen(1), sshd(8), sshd_config(5), ssh-copy-id(1), ssh-add(1), ssh(1) — man7.org, citite 2026-11-17 (prin extragere)' },
    { kind: 'man', ref: 'ssh-agent(1), ssh_config(5), update-crypto-policies(8), conținutul /etc/ssh/sshd_config pe RHEL 10, permisiunile setate de ssh-copy-id — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Securing network access” / OpenSSH (docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
