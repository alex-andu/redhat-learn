import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_11 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="ssh">SSH</G> îți dă un shell pe alt sistem, cu traficul criptat: <code>ssh utilizator@gazdă</code>. La prima conectare verifici <G id="host-key">cheia gazdei</G>; te autentifici cu parolă sau, mai comod și mai sigur, cu o <G id="ssh-key">cheie SSH</G> (<code>ssh-keygen</code>, <code>ssh-copy-id</code>).
            Cu <G id="scp">scp/sftp</G> copiezi fișiere. Pe sistemul țintă rulează serviciul <G id="sshd">sshd</G>, iar firewall-ul trebuie să permită portul 22/tcp.
          </p>
          <p>Obiectivul oficial: <i>„Access remote systems using SSH”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Serverele nu au, de obicei, monitor și tastatură lângă tine. Ai nevoie de o cale sigură de a le administra de la distanță. Protocoalele vechi (<code>telnet</code>, <code>rsh</code>) trimiteau totul, inclusiv parolele, necriptat. SSH le-a înlocuit: criptează sesiunea, verifică identitatea serverului și te autentifică.
          </p>
          <Analogy>SSH este un tunel blindat către sala serverelor: la intrare, paznicul verifică mai întâi că tunelul duce la clădirea corectă (cheia gazdei), apoi te legitimezi tu (parola sau cheia ta). Tot ce vorbești în tunel nu poate fi citit de cei de pe drum.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Etapele unei conexiuni</h4>
          <ol>
            <li><b>Conectare TCP</b> la portul 22 (implicit) al serverului.</li>
            <li><b>Negociere</b> a algoritmilor și stabilirea unui canal criptat.</li>
            <li><b>Autentificarea serverului:</b> serverul își prezintă cheia gazdei; clientul o compară cu <code>~/.ssh/known_hosts</code>. La prima conectare ți se afișează amprenta și ești întrebat dacă ai încredere; răspunsul <code>yes</code> o salvează.</li>
            <li><b>Autentificarea ta:</b> cheie publică (dacă ai una potrivită) sau parolă.</li>
            <li><b>Sesiune:</b> shell interactiv sau o singură comandă.</li>
          </ol>
          <h4>Cheia gazdei</h4>
          <p>
            Dacă cheia unui server cunoscut s-a schimbat (reinstalare, alt server cu aceeași adresă), clientul refuză și afișează <i>REMOTE HOST IDENTIFICATION HAS CHANGED</i>. Poate fi legitim sau un atac; confirmă prin alt canal. Dacă este legitim, ștergi intrarea veche cu <code>ssh-keygen -R gazdă</code>.
          </p>
          <h4>Chei SSH</h4>
          <p>
            Perechea are două părți: <b>privată</b> (<code>~/.ssh/id_ed25519</code>, secretă, <code>600</code>) și <b>publică</b> (<code>~/.ssh/id_ed25519.pub</code>, poate fi copiată). Cheia publică se adaugă pe server în <code>~/.ssh/authorized_keys</code>. La conectare, clientul dovedește că deține cheia privată fără a o trimite. Directorul <code>~/.ssh</code> trebuie să aibă permisiuni <code>700</code>, iar <code>authorized_keys</code> <code>600</code>; altfel serverul poate refuza cheia (L1.8).
          </p>
          <Table head={['Comandă', 'Rol', 'Detalii']} rows={[
            [<code>ssh utilizator@gazdă</code>, 'sesiune interactivă', 'implicit portul 22; fără utilizator = numele tău local'],
            [<code>ssh gazdă comandă</code>, 'o singură comandă', 'iese după comandă; ieșirea merge pe stdout-ul tău (L1.5)'],
            [<code>ssh -p PORT …</code>, 'alt port', 'p mic la ssh'],
            [<code>scp -P PORT …</code>, 'alt port la scp', 'P mare la scp'],
            [<code>ssh-keygen -t ed25519</code>, 'creează perechea de chei', 'fișierele merg în ~/.ssh'],
            [<code>ssh-copy-id utilizator@gazdă</code>, 'instalează cheia publică', 'cere o dată parola contului'],
            [<code>scp / sftp</code>, 'transfer de fișiere', 'utilizator@gazdă:cale'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Login și utilizatori</b> (L1.10): SSH produce un login shell; <code>who</code> arată sesiuni <code>pts/N</code>; contul trebuie să existe și să aibă parolă sau cheie.</li>
            <li><b>Permisiuni</b> (L1.8): <code>~/.ssh</code> și cheile trebuie să aibă permisiuni stricte, altfel autentificarea cu cheie eșuează.</li>
            <li><b>Arhivare și transfer</b> (L1.9): arhivezi cu <code>tar</code>, apoi copiezi cu <code>scp</code>; <code>tar -cf - dir | ssh gazdă 'tar -xf - -C /cale'</code> transferă fără fișier intermediar.</li>
            <li><b>Redirecționare și pipe</b> (L1.5): <code>ssh gazdă 'comandă' &gt; local.txt</code> salvează local ieșirea remote.</li>
            <li><b>Rețea și DNS</b> (C8): numele gazdei trebuie rezolvat sau folosești adresa IP; <code>ping</code> și <code>ip a</code> ajută la depanare.</li>
            <li><b>Firewall</b> (C8/C10): serverul trebuie să permită serviciul <code>ssh</code> (22/tcp) în <code>firewalld</code>.</li>
            <li><b>Servicii</b> (C4): <code>sshd</code> trebuie pornit; <code>systemctl status sshd</code>.</li>
            <li><b>SELinux</b> (C10): un port SSH nestandard cere configurare SELinux; aspect tratat în capitolul respectiv.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Administrezi un server fără acces fizic.</li>
            <li>Rulezi rapid o comandă pe un alt sistem: <code>ssh server2 'systemctl status chronyd'</code> (serviciul este tratat în C7).</li>
            <li>Copiezi fișiere între sisteme: <code>scp</code>, <code>sftp</code>.</li>
            <li>Configurezi autentificarea cu chei, ca să nu mai tastezi parola și pentru scripturi.</li>
            <li>La examen: ți se poate cere să lucrezi pe mai multe sisteme; conectarea rapidă prin <code>ssh</code> și transferul unui fișier sunt operații frecvente.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu se conectează la nimic">
          Comenzile se rulează manual, de tine, pe sistemele tale. Poți exersa cu <code>localhost</code> dacă <code>sshd</code> rulează local, sau între două mașini Linux ale tale. Nu folosi sisteme care nu îți aparțin și nu partaja chei private. Output-urile sunt <b>Ilustrative</b>; amprentele din exemple sunt inventate.
        </Callout>

        <h4>Conectare și comenzi remote</h4>
        <CodeBlock title="comenzi" code={`ssh student@server2\nssh server2\nssh -l student server2\nssh -p 2222 student@server2\nssh student@server2 'hostname; uptime'\nssh -v student@server2\nexit`} explain={[
          ['ssh utilizator@gazdă', 'conectare interactivă; gazda poate fi nume DNS sau adresă IP.'],
          ['ssh server2', 'fără utilizator: se folosește numele de utilizator local.'],
          ['-l student', 'alternativă pentru a indica utilizatorul.'],
          ['-p 2222', 'conectare la un alt port decât 22.'],
          ["'hostname; uptime'", 'comenzile din apostrofuri rulează pe sistemul remote; apostrofurile opresc shell-ul local să le interpreteze.'],
          ['-v', '--verbose: afișează pașii negocierii (până la -vvv); util la depanare.'],
          ['exit', 'închide sesiunea SSH și revii la shell-ul local (alternativ Ctrl+D).'],
        ]} />

        <h4>Chei SSH: generare și instalare</h4>
        <CodeBlock title="comenzi" code={`ssh-keygen -t ed25519\nls -l ~/.ssh\nssh-copy-id student@server2\nssh student@server2\nssh -i ~/.ssh/id_ed25519 student@server2\nssh-keygen -lf ~/.ssh/id_ed25519.pub`} explain={[
          ['ssh-keygen -t ed25519', '-t tipul de cheie (ed25519 este modern și scurt); cere locația și o frază-parolă (passphrase) opțională; creează cheia privată și cea publică (.pub).'],
          ['ls -l ~/.ssh', 'verifici fișierele create și permisiunile (privata 600).'],
          ['ssh-copy-id student@server2', 'copiază cheia publică în ~/.ssh/authorized_keys pe server (cere o dată parola contului).'],
          ['-i fișier', '--identity: alege explicit cheia privată folosită.'],
          ['ssh-keygen -lf fișier.pub', '-l afișează amprenta; -f fișierul de citit.'],
        ]} />

        <h4>Cheia gazdei schimbată și known_hosts</h4>
        <CodeBlock title="comenzi" code={`cat ~/.ssh/known_hosts\nssh-keygen -R server2\nssh student@server2`} explain={[
          ['known_hosts', 'lista gazdelor cunoscute și a cheilor lor, în fișierul tău ~/.ssh/known_hosts.'],
          ['ssh-keygen -R server2', '-R: elimină intrările pentru gazda dată (folosește-l doar după ce ai confirmat că schimbarea este legitimă).'],
          ['ssh …', 'la următoarea conectare vei vedea din nou întrebarea despre amprentă.'],
        ]} />

        <h4>Transfer de fișiere</h4>
        <CodeBlock title="comenzi" code={`scp raport.txt student@server2:/tmp/\nscp student@server2:/etc/hostname ./hostname-remote\nscp -r proiect student@server2:/tmp/\nscp -P 2222 raport.txt student@server2:/tmp/\nsftp student@server2\n# în sftp: ls, cd, get fișier, put fișier, exit`} explain={[
          ['scp sursă destinație', 'calea remote are forma utilizator@gazdă:cale; atenție la „:”.'],
          ['-r', 'recursiv, pentru directoare.'],
          ['-P 2222', 'portul la scp se dă cu P MARE (la ssh este p mic).'],
          ['sftp', 'sesiune interactivă: get descarcă, put încarcă, ls/cd navighează.'],
        ]} />

        <h4>Fișier de configurare client (opțional)</h4>
        <CodeBlock title="~/.ssh/config" code={`Host srv2\n    HostName 192.168.122.12\n    User student\n    Port 22\n    IdentityFile ~/.ssh/id_ed25519`} explain={[
          ['Host srv2', 'alias: după aceasta poți scrie doar `ssh srv2`.'],
          ['HostName', 'adresa sau numele real al gazdei.'],
          ['User / Port / IdentityFile', 'utilizatorul, portul și cheia folosite implicit pentru acest alias.'],
        ]} />
        <p className="small">Fișierul <code>~/.ssh/config</code> trebuie să fie scriibil doar de proprietar (<code>600</code>). Adresa din exemplu este inventată.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Prima conectare" kind="session" label="illustrative" code={`[student@server1 ~]$ ssh student@server2\nThe authenticity of host 'server2 (192.168.122.12)' can't be established.\nED25519 key fingerprint is SHA256:abcdEXEMPLUabcdEXEMPLUabcdEXEMPLUabcd.\nThis key is not known by any other names.\nAre you sure you want to continue connecting (yes/no/[fingerprint])? yes\nWarning: Permanently added 'server2' (ED25519) to the list of known hosts.\nstudent@server2's password:\n[student@server2 ~]$`} />
        <ul>
          <li>Prima parte: clientul nu cunoaște cheia gazdei și îți arată amprenta; ideal o compari cu cea furnizată de administratorul serverului.</li>
          <li><code>yes</code> salvează cheia în <code>~/.ssh/known_hosts</code>; la următoarele conectări întrebarea nu mai apare.</li>
          <li>Promptul se schimbă în <code>[student@server2 ~]$</code>: acum lucrezi pe server2. Amprenta și textul exact pot diferi pe versiunea ta.</li>
        </ul>

        <CodeBlock title="Cheia gazdei schimbată" kind="session" label="illustrative" code={`@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\nIT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!\n...\nOffending ED25519 key in /home/student/.ssh/known_hosts:3\nHost key verification failed.`} />
        <p className="small">Clientul refuză să continue. Linia „Offending … known_hosts:3” indică intrarea (linia 3) care nu se mai potrivește. Dacă serverul a fost reinstalat legitim: <code>ssh-keygen -R server2</code>, apoi conectare nouă.</p>

        <CodeBlock title="Comandă remote și scp" kind="session" label="illustrative" code={`[student@server1 ~]$ ssh student@server2 'hostname'\nserver2\n[student@server1 ~]$ scp raport.txt student@server2:/tmp/\nraport.txt                                  100%   42     0.1KB/s   00:00`} />
        <p className="small">Prima comandă a afișat doar numele sistemului remote și s-a încheiat. <code>scp</code> arată numele fișierului, procentul, dimensiunea și durata; valorile diferă.</p>

        <CodeBlock title="Cheie neacceptată din cauza permisiunilor (exemplu de simptom)" kind="session" label="illustrative" code={`[student@server1 ~]$ ssh student@server2\nstudent@server2's password:`} />
        <p className="small">Dacă ai instalat cheia, dar tot ți se cere parola, verifică permisiunile din <code>~/.ssh</code> pe server (700 pentru director, 600 pentru <code>authorized_keys</code>) și proprietarul lor; vezi secțiunea Troubleshooting.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>După conectare: <code>hostname</code> și <code>whoami</code> confirmă sistemul și contul pe care te afli (promptul poate induce în eroare dacă ai alias-uri).</li>
            <li>Cheia funcționează: <code>ssh -o PasswordAuthentication=no utilizator@gazdă</code> reușește fără parolă (dacă eșuează, cheia nu este acceptată).</li>
            <li>Transfer: compară <code>ls -l</code> și, dacă e nevoie, <code>sha256sum</code> pe ambele capete.</li>
            <li>Serviciul remote: <code>systemctl status sshd</code> pe server; din client, <code>ssh -v</code> arată unde se oprește.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Cheile, <code>known_hosts</code> și <code>~/.ssh/config</code> sunt fișiere în home; persistă după reboot. Pe server, <code>authorized_keys</code> persistă la fel. Ce nu persistă: sesiunea SSH în sine (se pierde la întrerupere) și variabilele setate în ea. Pentru ca serviciul <code>sshd</code> și regula de firewall să persiste după reboot, serviciul trebuie să fie <i>enabled</i> și regula adăugată permanent (C4, C8); aici doar le verifici, nu le modifici.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Connection timed out</code>, 'adresă greșită, rețea inaccesibilă sau firewall care blochează', <><code>ping gazdă</code>, <code>ssh -v</code></>, <>verifică IP/nume, rețeaua, firewall-ul serverului (C8)</>],
          [<code>Connection refused</code>, 'sshd nu rulează sau portul este greșit', <><code>systemctl status sshd</code> pe server</>, <>pornește serviciul (C4) sau folosește portul corect cu <code>-p</code></>],
          [<code>Could not resolve hostname</code>, 'nume necunoscut', <><code>getent hosts nume</code></>, 'folosește adresa IP sau corectează DNS (C8)'],
          [<code>Permission denied (publickey,password)</code>, 'utilizator/parolă greșite sau autentificarea refuzată', <code>ssh -v</code>, 'verifică utilizatorul, parola, permisiunile din ~/.ssh'],
          ['Cheia instalată, dar tot cere parola', 'permisiuni greșite pe ~/.ssh sau authorized_keys; cheie greșită', <><code>ls -ld ~/.ssh; ls -l ~/.ssh</code> pe server</>, <><code>chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys</code>; verifică proprietarul</>],
          [<code>REMOTE HOST IDENTIFICATION HAS CHANGED</code>, 'cheia gazdei diferă de cea memorată', 'compară cu administratorul', <><code>ssh-keygen -R gazdă</code> doar după confirmare</>],
          [<code>Host key verification failed</code>, 'clientul a refuzat cheia', '—', 'vezi rândul de mai sus'],
          ['Sesiune blocată', 'rețea întreruptă', '—', <>închide cu secvența <code>~.</code> la început de linie</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confunzi <code>ssh -p</code> (minuscul) cu <code>scp -P</code> (majuscul).</>,
          <>Uiți <code>:</code> după gazdă în <code>scp</code>: <code>scp fisier host</code> copiază local, într-un fișier numit <code>host</code>.</>,
          <>Rulezi comenzi pe sistemul greșit: verifică promptul, <code>hostname</code> și <code>whoami</code>.</>,
          <>Răspunzi automat <code>yes</code> la schimbarea cheii gazdei fără a verifica.</>,
          <>Partajezi sau copiezi cheia <b>privată</b> în loc de cea publică (<code>.pub</code>).</>,
          <>Permisiuni largi pe <code>~/.ssh</code> sau pe cheia privată: cheia este ignorată.</>,
          <>Crezi că <code>exit</code> închide și shell-ul local: după <code>ssh</code>, <code>exit</code> te readuce la cel local; verifică înainte să rulezi comenzi.</>,
          <>Uiți apostrofurile la comenzile remote cu <code>;</code>, <code>|</code> sau <code>&gt;</code>, care sunt altfel interpretate local.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: de ce apostrofurile contează la ssh și ce este un tunel">
        <p>
          La <code>ssh gazdă ls | wc -l</code>, pipe-ul este interpretat local: <code>ls</code> rulează remote, dar <code>wc</code> rulează local pe ieșirea lui. La <code>ssh gazdă 'ls | wc -l'</code>, ambele rulează pe sistemul remote. Aceeași logică se aplică redirecționărilor (L1.5): <code>&gt;</code> în afara apostrofurilor scrie un fișier <i>local</i>.
        </p>
        <p>
          SSH poate transporta și alt trafic (redirecționare de porturi, <code>-L</code>/<code>-R</code>) și poate folosi un agent (<code>ssh-agent</code>, <code>ssh-add</code>) care ține cheia deblocată în memorie; acestea depășesc obiectivul C1-4 și nu sunt acoperite aici.
        </p>
        <p>
          Politicile de criptare ale sistemului (RHEL <i>crypto policies</i>) pot restrânge algoritmii acceptați; la o eroare de negociere, <code>ssh -v</code> arată ce nu s-a potrivit. Detaliile pentru RHEL 10 nu au fost verificate în această lecție.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_11: TopicModule = {
  id: 'L1.11',
  subtitle: 'ssh, chei SSH, ssh-copy-id, known_hosts, scp/sftp',
  studyTime: '≈55 min studiu + laborator',
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
  labs: [LAB_L1_11],
  sources: [
    { kind: 'man', ref: 'ssh(1), ssh_config(5), ssh-keygen(1), ssh-copy-id(1), scp(1), sftp(1), sshd(8) (known_hosts)' },
    { kind: 'doc', ref: 'Documentația RHEL 10: „Secure communication between two systems with OpenSSH” (docs.redhat.com, slug în research/INDEX.md) — de verificat la review' },
    { kind: 'upstream', ref: 'OpenSSH: https://www.openssh.com/manual.html' },
  ],
};
