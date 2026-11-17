import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L4_10 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Trei unelte transferă fișiere între sisteme, toate peste <G id="ssh">SSH</G> (deci autentificat și criptat): <code>scp</code> pentru o copie rapidă (<code>scp fișier utilizator@gazdă:cale</code>), <G id="sftp-session">sftp</G> pentru o sesiune interactivă (<code>get</code>, <code>put</code>) și <G id="rsync">rsync</G> pentru sincronizare, care trimite doar diferențele. Cu rsync, <G id="trailing-slash">slash-ul final</G> al sursei contează, iar <code>-n</code> simulează înainte să modifici ceva.
          </p>
          <p>Obiectivul oficial: <i>„Securely transfer files between systems”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Administrezi mai multe sisteme și trebuie să muți fișiere între ele: o configurare, o arhivă, rezultatul unui script, o copie de siguranță. Vechiul FTP trimitea totul <i>în clar</i>, inclusiv parolele; oricine asculta rețeaua le putea citi. Soluția modernă este să folosești același canal securizat ca la administrarea de la distanță: SSH (L1.11).
          </p>
          <p>
            De ce trei unelte? Fiecare rezolvă o nevoie: <code>scp</code> este cea mai simplă; <code>sftp</code> îți permite să răsfoiești; <code>rsync</code> este eficient când repeți transferul sau ai directoare mari, pentru că nu retrimite ce există deja.
          </p>
          <Analogy>Trimiți colete. <code>scp</code> este un curier pe care îl chemi pentru un colet (îl iei și îl duci). <code>sftp</code> este un depozit în care intri, te uiți pe rafturi și alegi ce iei sau ce lași. <code>rsync</code> este un contabil de inventar: compară rafturile tale cu ale depozitului și mută doar ce lipsește sau s-a schimbat.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Același canal SSH</h4>
          <p>
            Toate trei deschid o conexiune SSH către <code>sshd</code> pe portul 22/tcp (implicit): autentifică serverul (verifică <code>known_hosts</code>), te autentifică pe tine (parolă sau cheie) și apoi trimit datele prin canalul criptat. De aceea ai nevoie de: serviciul <code>sshd</code> activ pe server (L4.9), firewall care îl permite (C8) și un cont valid. Cheile configurate în L1.11 se aplică identic.
          </p>
          <h4>Cum se scrie o cale remote</h4>
          <Table head={['Formă', 'Înseamnă']} rows={[
            [<code>utilizator@gazdă:/cale/absolută</code>, 'calea absolută de pe server'],
            [<code>utilizator@gazdă:fișier</code>, 'relativ la directorul personal al utilizatorului pe server'],
            [<code>gazdă:</code>, 'directorul personal; utilizatorul implicit este cel local'],
            [<><code>fișier</code> (fără <code>:</code>)</>, 'cale locală: nu se face transfer remote'],
          ]} />
          <h4>scp, sftp, rsync: diferențe</h4>
          <Table head={['', 'scp', 'sftp', 'rsync']} rows={[
            ['mod', 'o comandă', 'sesiune interactivă', 'o comandă'],
            ['transfer', 'tot, de fiecare dată', 'ce ceri (get/put)', 'doar diferențele'],
            ['director', <code>-r</code>, <><code>get -r</code>, <code>put -r</code></>, <code>-a</code>],
            ['port', <code>-P</code>, <code>-P</code>, <code>-e "ssh -p N"</code>],
            ['simulare', 'nu', 'nu', <code>-n</code>],
            ['instalat pe server', 'sshd', 'sshd', 'și rsync'],
          ]} />
          <p>
            Atenție la majuscule: <code>scp</code> și <code>sftp</code> folosesc <code>-P</code> pentru port, <code>ssh</code> folosește <code>-p</code>. La <code>scp</code>, <code>-p</code> înseamnă „păstrează timpii și modurile”.
          </p>
          <h4>Slash-ul final la rsync</h4>
          <Table head={['Comandă', 'Rezultat în /dest']} rows={[
            [<code>rsync -a dir /dest</code>, <><code>/dest/dir/…</code> (directorul în sine)</>],
            [<code>rsync -a dir/ /dest</code>, <><code>/dest/…</code> (conținutul directorului)</>],
          ]} />
          <h4>Ce înseamnă -a</h4>
          <p>
            <code>-a</code> (archive) = <code>-rlptgoD</code>: recursiv, legături simbolice, permisiuni, timpi, grup, proprietar și fișiere speciale. Proprietarul și grupul se pot păstra doar dacă rulezi ca root la destinație; altfel, fișierele aparțin utilizatorului cu care te-ai conectat.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>SSH</b> (L1.11): chei, <code>known_hosts</code>, avertismente de amprentă.</li>
            <li><b>Servicii</b> (L4.9): <code>sshd</code> trebuie să ruleze pe server.</li>
            <li><b>Firewall</b> (C8/C10): portul 22 (serviciul <code>ssh</code>) trebuie permis.</li>
            <li><b>Permisiuni și proprietari</b> (L1.8, L1.10): transferul nu poate scrie în directoare fără drept de scriere.</li>
            <li><b>Arhive</b> (L1.9): adesea transferi un <code>.tar.gz</code> în loc de zeci de fișiere.</li>
            <li><b>Pachete</b> (C2): <code>rsync</code> poate necesita <code>dnf install rsync</code>.</li>
            <li><b>SELinux</b> (C10): fișierele create pot primi etichete diferite de cele din sursă.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>O configurare sau o arhivă trebuie să ajungă pe alt server: <code>scp</code>.</li>
            <li>Nu știi exact numele fișierului sau vrei să explorezi: <code>sftp</code>.</li>
            <li>Copii de siguranță incrementale, directoare mari, transfer întrerupt: <code>rsync</code>.</li>
            <li>La examen: „copy file X to host Y” (<code>scp</code>); „sync directory” (<code>rsync</code>); verifici cu <code>ls</code>/<code>diff</code> la destinație.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem; pentru ușurință, poți folosi <code>localhost</code> ca „server”. Numele de gazdă, utilizatorii și cifrele din exemple sunt ilustrative; output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10.
        </Callout>

        <h4>1. <code>scp</code></h4>
        <CodeBlock title="comenzi" code={`scp raport.txt student@server2:/tmp/\nscp student@server2:/var/tmp/jurnal.log .\nscp -r proiect student@server2:/home/student/\nscp -P 2222 raport.txt student@server2:/tmp/\nscp -p raport.txt server2:\nscp -i ~/.ssh/id_ed25519 raport.txt student@server2:/tmp/\nscp raport.txt student@server2:"/tmp/nume cu spatiu.txt"`} explain={[
          ['scp SURSĂ DESTINAȚIE', 'copiază SURSĂ în DESTINAȚIE; una dintre ele trebuie să fie remote (utilizator@gazdă:cale).'],
          ['student@server2:/tmp/', 'cale remote absolută; `:` desparte gazda de cale.'],
          ['… .', 'punctul = directorul curent (L1.3); descarcă în el.'],
          ['-r', 'recursiv: obligatoriu pentru directoare.'],
          ['-P 2222', 'portul SSH al serverului (P majusculă!).'],
          ['-p', 'păstrează timpii de modificare și permisiunile.'],
          ['-i ~/.ssh/id_ed25519', 'cheia privată de folosit (L1.11).'],
          ['"/tmp/nume cu spatiu.txt"', 'căile cu spații se pun între ghilimele.'],
        ]} />

        <h4>2. <code>sftp</code></h4>
        <CodeBlock title="sesiune sftp" code={`sftp student@server2\nsftp> pwd\nsftp> ls\nsftp> cd /var/tmp\nsftp> lpwd\nsftp> lcd ~/descarcari\nsftp> get jurnal.log\nsftp> get -r director\nsftp> put config.txt\nsftp> put -r director-local\nsftp> mkdir arhiva\nsftp> rm vechi.txt\nsftp> help\nsftp> bye`} explain={[
          ['sftp utilizator@gazdă', 'deschide sesiunea; promptul devine sftp>. Opțiunea -P schimbă portul.'],
          ['pwd / ls / cd', 'comenzi pe partea REMOTE (directorul curent, conținut, navigare).'],
          ['lpwd / lcd', 'aceleași, dar pe partea LOCALĂ (l = local).'],
          ['get fișier', 'descarcă din directorul remote curent în cel local curent; -r pentru directoare.'],
          ['put fișier', 'încarcă din directorul local curent în cel remote curent; -r pentru directoare.'],
          ['mkdir / rm', 'creează / șterge pe partea remote.'],
          ['help', 'lista comenzilor.'],
          ['bye (sau exit)', 'închide sesiunea.'],
        ]} />

        <h4>3. <code>rsync</code></h4>
        <CodeBlock title="comenzi" code={`rsync -av ~/date/ student@server2:/backup/date/\nrsync -avn ~/date/ student@server2:/backup/date/\nrsync -avz ~/date/ student@server2:/backup/date/\nrsync -avP student@server2:/backup/date/ ~/restaurat/\nrsync -av --delete ~/date/ student@server2:/backup/date/\nrsync -av --exclude='*.tmp' ~/date/ student@server2:/backup/date/\nrsync -av -e "ssh -p 2222" ~/date/ student@server2:/backup/date/`} explain={[
          ['rsync OPȚIUNI SURSĂ DESTINAȚIE', 'sincronizează destinația cu sursa; local sau prin SSH.'],
          ['-a', 'mod arhivă: recursiv + păstrează permisiuni, timpi, legături simbolice (proprietar și grup doar ca root).'],
          ['-v', 'verbose: afișează fișierele transferate.'],
          ['-n', '--dry-run: simulează, nu modifică nimic. Folosește-l mai întâi, mai ales cu --delete.'],
          ['-z', 'comprimă datele în timpul transferului (util pe linii lente).'],
          ['-P', 'echivalent cu --partial --progress: păstrează transferurile parțiale (reluabile) și afișează progresul.'],
          ['--delete', 'șterge la destinație fișierele care nu mai există la sursă. Periculos fără -n.'],
          ['--exclude=\'*.tmp\'', 'omite fișierele care se potrivesc; ghilimele simple ca să nu le expandeze shell-ul.'],
          ['-e "ssh -p 2222"', 'specifică comanda de transport (aici, SSH pe alt port).'],
          ['slash final la sursă', 'sursă/ = conținutul; sursă = directorul în sine.'],
        ]} />
        <Callout kind="warn" title="Rsync și --delete">
          Un <code>--delete</code> cu o sursă sau o destinație greșită (slash lipsă, directoare inversate) poate șterge date. Rulează <b>mereu</b> mai întâi cu <code>-n</code>, citește lista, apoi repetă fără <code>-n</code>.
        </Callout>

        <h4>4. Verifică rezultatul</h4>
        <CodeBlock title="comenzi" code={`ls -l /tmp/raport.txt\nsha256sum raport.txt\nssh student@server2 sha256sum /tmp/raport.txt\ndiff -r sursa/ destinatia/\nrsync -avn sursa/ destinatia/`} explain={[
          ['ls -l', 'există fișierul, cu ce dimensiune și proprietar?'],
          ['sha256sum', 'amprenta fișierului; dacă este aceeași pe ambele capete, conținutul este identic.'],
          ['ssh gazdă comandă', 'execută o singură comandă pe server (L1.11).'],
          ['diff -r', 'compară directoare recursiv; fără output = identice.'],
          ['rsync -avn', 'dacă nu mai e nimic de transferat, sunt sincronizate.'],
        ]} />
        <p className="small">Dacă <code>rsync</code> nu este instalat: <code>dnf install rsync</code> (pe ambele sisteme), cu drepturi de root (L2.2).</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="scp" kind="session" label="illustrative" code={`[student@server1 ~]$ scp raport.txt student@server2:/tmp/\nstudent@server2's password:\nraport.txt                          100%   12KB   4.2MB/s   00:00`} />
        <p className="small">După parolă (sau fără, cu cheie), apare o linie pe fișier: <b>nume</b>, <b>procent</b>, <b>dimensiune</b>, <b>viteză</b>, <b>timp</b>. La prima conectare poate apărea întrebarea despre amprenta serverului (L1.11). Valorile sunt exemple.</p>
        <CodeBlock title="sftp" kind="session" label="illustrative" code={`[student@server1 ~]$ sftp student@server2\nstudent@server2's password:\nConnected to server2.\nsftp> cd /var/tmp\nsftp> get jurnal.log\nFetching /var/tmp/jurnal.log to jurnal.log\njurnal.log                          100%   34KB   5.0MB/s   00:00\nsftp> put config.txt\nUploading config.txt to /var/tmp/config.txt\nconfig.txt                          100%  2048    1.9MB/s   00:00\nsftp> bye`} />
        <p className="small"><code>Fetching … to …</code> = descărcare (<code>get</code>); <code>Uploading … to …</code> = încărcare (<code>put</code>). Calea din dreapta la <code>Uploading</code> arată directorul REMOTE unde a ajuns fișierul. Formatul exact poate diferi.</p>
        <CodeBlock title="rsync -av" kind="session" label="illustrative" code={`[student@server1 ~]$ rsync -av ~/date/ student@server2:/backup/date/\nsending incremental file list\n./\nraport.txt\nsub/\nsub/c.txt\n\nsent 1,204 bytes  received 54 bytes  2,516.00 bytes/sec\ntotal size is 12,430  speedup is 9.88`} />
        <p className="small"><code>sending incremental file list</code> = construiește lista de diferențe. Urmează fișierele transferate (<code>./</code> este directorul destinație însuși). <code>sent/received</code> = octeți trimiși/primiți; <code>speedup</code> = raportul dintre dimensiunea totală și octeții efectiv trimiși: cu cât e mai mare, cu atât rsync a economisit mai mult. A doua rulare pe aceleași date ar afișa doar antetul și sumarul.</p>
        <CodeBlock title="rsync -avn --delete (simulare)" kind="session" label="illustrative" code={`[student@server1 ~]$ rsync -avn --delete ~/date/ student@server2:/backup/date/\nsending incremental file list\n*deleting   vechi.log\nnota.txt\n\nsent 120 bytes  received 25 bytes  290.00 bytes/sec\ntotal size is 4,096  speedup is 28.25 (DRY RUN)`} />
        <p className="small"><code>*deleting</code> = ce ar fi șters; <code>(DRY RUN)</code> = nimic nu s-a modificat. Este exact momentul în care îți dai seama dacă sursa sau destinația sunt greșite.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Fișierul există la destinație:</b> <code>ls -l cale</code>, local sau prin <code>ssh gazdă ls -l cale</code>.</li>
            <li><b>Conținut identic:</b> <code>sha256sum</code> pe ambele capete; <code>diff -r</code> între directoare.</li>
            <li><b>rsync complet:</b> <code>rsync -avn</code> nu mai listează nimic.</li>
            <li><b>Proprietar și permisiuni</b> la destinație: <code>ls -l</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierele transferate sunt pe disc și persistă ca orice alt fișier. Comenzile în sine nu lasă configurare. Pentru transferuri repetate fără parolă, folosești chei SSH (L1.11); pentru transferuri automate (programate), ai nevoie de <code>cron</code> sau de un timer systemd (C3 / extern acestui capitol). Confirmare manuală: după reboot, <code>ls -l</code>/<code>sha256sum</code> pe fișierele transferate.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Connection refused</code>, 'sshd oprit sau alt port', <code>systemctl status sshd</code>, <>pornește serviciul (L4.9); <code>-P</code> pentru alt port</>],
          [<code>Connection timed out</code>, 'firewall sau rețea', <code>ping</code>, 'verifică firewall-ul (C8)'],
          [<code>Permission denied</code>, 'parolă/cheie greșită sau drept lipsă la destinație', <><code>ls -ld</code> pe destinație</>, 'alt utilizator sau alt director'],
          [<code>not a regular file</code>, 'director copiat fără -r', 'comanda scrisă', <>adaugă <code>-r</code></>],
          [<code>rsync: command not found</code>, 'rsync lipsește pe server', <code>ssh gazdă which rsync</code>, <><code>dnf install rsync</code></>],
          [<code>REMOTE HOST IDENTIFICATION HAS CHANGED</code>, 'cheia serverului s-a schimbat', 'L1.11', <>verifică, apoi <code>ssh-keygen -R gazdă</code></>],
          ['directoare imbricate neașteptat', 'slash final lipsă la rsync', <code>ls destinație</code>, 'folosește sursă/'],
          ['fișierele șterse neintenționat', '--delete fără simulare', 'restaurează din copie', <>folosește <code>-n</code> întâi</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți <code>-r</code> la <code>scp</code> pentru directoare.</>,
          <>Confunzi <code>-P</code> (scp/sftp) cu <code>-p</code> (ssh; la scp = păstrează atribute).</>,
          <>Uiți <code>:</code> după gazdă: scp creează un fișier local cu un nume ciudat.</>,
          <>Inversezi sursa și destinația.</>,
          <>Slash final prezent/absent la rsync, cu rezultate diferite.</>,
          <>Rulezi <code>rsync --delete</code> fără <code>-n</code> întâi.</>,
          <>Nu poți scrie în directorul destinație (permisiuni, L1.8).</>,
          <>Ceri <code>rsync</code> pe un server fără pachetul <code>rsync</code>.</>,
          <>Crezi că parola din <code>scp</code> apare în clar în rețea: nu, canalul este criptat.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: scp vs SFTP, transferuri ca root, bandwidth și remote-la-remote">
        <p>
          În versiunile recente ale OpenSSH, comanda <code>scp</code> folosește intern protocolul SFTP, nu vechiul protocol RCP; sintaxa pentru utilizator rămâne aceeași. Versiunea OpenSSH din RHEL 10 nu a fost confirmată din documentația Red Hat (necitită, HTTP 403).
        </p>
        <p>
          Pentru a păstra proprietarul fișierelor, rsync trebuie să ruleze ca root la destinație, ceea ce de obicei înseamnă conectare ca root sau <code>--rsync-path="sudo rsync"</code> (cu <code>sudo</code> fără parolă). Pe sisteme ale căror reguli interzic autentificarea root prin SSH, această variantă este preferabilă.
        </p>
        <p>
          <code>scp</code> acceptă și transfer între două gazde remote (<code>scp a:/x b:/y</code>); datele trec uneori prin mașina ta. <code>--bwlimit</code> (rsync) și <code>-l</code> (scp, în Kbit/s) limitează banda.
        </p>
        <p>
          Pentru fișiere cu nume ciudate sau pentru nume cu spații, <code>rsync -s</code>/<code>--protect-args</code> și ghilimelele duble pot fi necesare. Testează mereu cu <code>-n</code> și cu fișiere de probă.
        </p>
      </DeepDive>
    </>
  );
}

export const L4_10: TopicModule = {
  id: 'L4.10',
  subtitle: 'scp, sftp, rsync peste SSH; -r, -P, -a, -n, --delete; slash final',
  studyTime: '≈90 min studiu + laborator',
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
  labs: [LAB_L4_10],
  sources: [
    { kind: 'man', ref: 'scp(1), sftp(1), rsync(1), ssh(1), ssh_config(5), sha256sum(1), diff(1)' },
    { kind: 'doc', ref: 'RHEL 10 — „Secure communication between two systems with OpenSSH”, docs.redhat.com necitit (HTTP 403 în C4); de confirmat la review' },
  ],
};
