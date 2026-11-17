import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_7 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un fișier are un <b>nume</b> și o <b>identitate</b> (<G id="inode">inode</G>). Un <G id="hard-link">hard link</G> este încă un nume pentru aceeași identitate; un <G id="soft-link">soft link</G> (symlink) este un fișier mic care conține o <i>cale</i> către altceva.
            Se creează cu <code>ln</code> (hard) și <code>ln -s</code> (soft). Diferența determină ce se întâmplă când muți, ștergi sau editezi fișierul.
          </p>
          <p>Obiectivul oficial: <i>„Create hard and soft links”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Uneori vrei ca același conținut să fie accesibil sub mai multe nume sau din mai multe locuri, fără să-l copiezi (copiile ocupă spațiu și se desincronizează).
            Linkurile rezolvă asta: un nume scurt pentru o cale lungă, o cale stabilă care indică o versiune schimbătoare (de exemplu un link <code>current</code> către <code>versiune-2</code>), sau protecție împotriva ștergerii accidentale a ultimului nume.
          </p>
          <Analogy>un fișier este o carte într-o bibliotecă. Un <b>hard link</b> este un al doilea card în catalog care trimite la aceeași carte: oricare card o găsește, iar cartea dispare doar când ultimul card este scos. Un <b>soft link</b> este un bilet pe care scrie „vezi raftul 3, poziția 5”: dacă mută cartea, biletul rămâne dar nu mai duce nicăieri.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Nume → inode → date</h4>
          <p>
            Un director este o listă de perechi <i>nume → număr de inode</i>. Inode-ul păstrează proprietarul, permisiunile, dimensiunea, timpii, <G id="link-count">contorul de legături</G> și referințe către blocurile de date. Numele nu face parte din inode.
          </p>
          <h4>Hard link</h4>
          <p>
            <code>ln a b</code> adaugă în director o nouă intrare <code>b</code> cu <b>același număr de inode</b> ca <code>a</code> și mărește contorul de legături. Nu există „original”: <code>a</code> și <code>b</code> sunt egale. Orice modificare de conținut, permisiuni sau proprietar se vede prin ambele nume (sunt același obiect).
            <code>rm a</code> scade contorul; datele rămân accesibile prin <code>b</code>. Spațiul se eliberează când contorul ajunge la 0 și niciun proces nu mai are fișierul deschis.
          </p>
          <p>
            Fiindcă o intrare de director conține doar un număr de inode, valabil <i>într-un singur sistem de fișiere</i>, un hard link nu poate trece de la un sistem de fișiere la altul (eroare de tip „Invalid cross-device link”). De regulă nu se permit hard link-uri către directoare (ar putea crea bucle în arbore).
          </p>
          <h4>Soft link</h4>
          <p>
            <code>ln -s ținta nume</code> creează un fișier nou, cu inode propriu, de tip <code>l</code>, al cărui conținut este șirul de caractere <code>ținta</code>. La acces, sistemul citește calea și o urmează. Consecințe:
          </p>
          <ul>
            <li>poate indica un director sau altă partiție/sistem de fișiere;</li>
            <li>dacă ținta dispare, link-ul devine <G id="broken-link">rupt</G>;</li>
            <li>o cale <b>relativă</b> se interpretează față de directorul în care se află <i>link-ul</i>, nu față de directorul curent al celui care îl creează;</li>
            <li>permisiunile afișate (<code>lrwxrwxrwx</code>) nu contează; se aplică cele ale țintei.</li>
          </ul>
          <Table head={['Aspect', 'Hard link', 'Soft link']} rows={[
            ['Ce este', 'alt nume pentru același inode', 'fișier separat cu calea către țintă'],
            ['Inode', 'același cu ținta', 'propriu'],
            ['Același sistem de fișiere', 'obligatoriu', 'nu'],
            ['Către directoare', 'de regulă nu', 'da'],
            ['Dacă ștergi ținta', 'datele rămân (cât există alt nume)', 'link rupt'],
            ['Dacă muți ținta', 'merge în continuare (în același sistem de fișiere)', 'se rupe (cale)'],
            ['În ls -l', 'fișier obișnuit, contor > 1', 'tip l, cu săgeata -> țintă'],
            ['Dimensiune', 'cea a fișierului', 'lungimea căii'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Fișiere și directoare</b> (L1.3): <code>rm</code> pe un symlink șterge link-ul, nu ținta; <code>mv</code> pe țintă rupe symlink-urile cu cale către ea; <code>cp</code> are comportamente diferite pentru symlink-uri (opțiuni <code>-P</code>, <code>-L</code>, <code>-d</code>, <code>-a</code>).</li>
            <li><b>Permisiuni</b> (L1.8): permisiunile aparțin inode-ului: la hard link-uri se văd identic prin toate numele; pentru symlink contează cele ale țintei.</li>
            <li><b>Editoare</b> (L1.4): unele editoare salvează scriind un fișier nou și redenumindu-l peste cel vechi; pot „rupe” relația de hard link (noul fișier are alt inode).</li>
            <li><b>Sisteme de fișiere</b> (C6): limita hard link-urilor este sistemul de fișiere; <code>df -i</code> arată inode-urile disponibile.</li>
            <li><b>Arhivare</b> (L1.9): <code>tar</code> păstrează symlink-urile ca symlink-uri și poate detecta hard link-uri ale aceluiași fișier.</li>
            <li><b>Sistemul</b>: multe căi din <code>/etc</code> și <code>/usr</code> sunt symlink-uri (de exemplu <code>/etc/localtime</code>); <code>readlink -f</code> arată destinația reală.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li><b>Soft link</b>: o cale scurtă către un director adânc; o cale fixă către o versiune care se schimbă; legături peste sisteme de fișiere diferite.</li>
            <li><b>Hard link</b>: același fișier cu două nume în același sistem de fișiere (fără a duplica datele); protecție la ștergere accidentală a unui nume.</li>
            <li>La examen: ți se cere „creează un link simbolic X către Y” sau „un hard link”; trebuie să alegi tipul corect, ordinea argumentelor și să verifici rezultatul.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le într-un director de test (<code>~/lab17</code>). Numerele de inode și timpii din output-uri sunt <b>Ilustrative</b>.
        </Callout>

        <h4>Crearea link-urilor</h4>
        <CodeBlock title="comenzi" code={`mkdir -p ~/lab17 && cd ~/lab17\necho "date importante" > original.txt\nln original.txt hard.txt\nln -s original.txt soft.txt\nln -s /etc/hostname nume-gazda\nmkdir date && ln -s date scurt\nln -sv original.txt alt.txt\nln -sf original.txt soft.txt`} explain={[
          ['ln original.txt hard.txt', 'sintaxa: ln ȚINTĂ NUME_LINK. Fără -s creează un hard link (același inode).'],
          ['ln -s original.txt soft.txt', '-s (--symbolic): creează un symlink; conținutul lui este calea „original.txt”, relativă la directorul link-ului.'],
          ['ln -s /etc/hostname nume-gazda', 'cu o cale absolută: nu depinde de locul în care se află link-ul.'],
          ['ln -s date scurt', 'symlink către un director (hard link către director nu este permis de regulă).'],
          ['-v', '--verbose: afișează ce a creat.'],
          ['-f', '--force: înlocuiește un link existent cu același nume (altfel: „File exists”).'],
        ]} />

        <h4>Inspectare: inode, contor, țintă</h4>
        <CodeBlock title="comenzi" code={`ls -li\nls -l original.txt hard.txt soft.txt\nstat original.txt\nreadlink soft.txt\nreadlink -f soft.txt\nfind . -samefile original.txt\nfind . -xtype l\nls -l /etc/localtime`} explain={[
          ['ls -li', '-i: afișează numărul inode în prima coloană; hard link-urile au același număr.'],
          ['ls -l', 'a doua coloană = contorul de legături; tipul l și săgeata -> arată un symlink.'],
          ['stat', 'afișează inode, Links (contor), permisiuni, timpi; la symlink afișează și ținta.'],
          ['readlink', 'afișează conținutul symlink-ului (calea memorată).'],
          ['readlink -f', 'calea canonică finală, cu toate symlink-urile rezolvate.'],
          ['find . -samefile F', 'găsește toate numele care indică același inode ca F.'],
          ['find . -xtype l', 'găsește symlink-uri rupte (dacă ținta nu mai există).'],
        ]} />

        <h4>Ce se întâmplă la modificare și ștergere</h4>
        <CodeBlock title="comenzi" code={`echo "linie noua" >> hard.txt\ncat original.txt soft.txt\nrm original.txt\ncat hard.txt\ncat soft.txt\nls -l\nfind . -xtype l\nrm soft.txt`} explain={[
          ['>> hard.txt', 'modifică același inode; modificarea se vede prin toate numele.'],
          ['rm original.txt', 'șterge un nume; hard.txt există în continuare cu datele.'],
          ['cat soft.txt', 'eșuează: calea „original.txt” nu mai există (symlink rupt).'],
          ['rm soft.txt', 'șterge link-ul, nu ținta.'],
        ]} />

        <h4>Mutarea unui symlink relativ (capcană)</h4>
        <CodeBlock title="comenzi" code={`mkdir a b\necho x > a/fisier\nln -s fisier a/legatura\ncat a/legatura\nmv a/legatura b/\ncat b/legatura`} explain={[
          ['ln -s fisier a/legatura', 'calea „fisier” este relativă la directorul link-ului (a/).'],
          ['mv a/legatura b/', 'în b/ calea „fisier” caută b/fisier, care nu există: link rupt.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Hard link: același inode, contor 2" kind="session" label="illustrative" code={`[student@server1 lab17]$ ls -li original.txt hard.txt\n 524301 -rw-r--r--. 2 student student 16 Jan  1 10:00 hard.txt\n 524301 -rw-r--r--. 2 student student 16 Jan  1 10:00 original.txt`} />
        <ul>
          <li>Prima coloană (524301) este numărul inode: identic ⇒ același fișier.</li>
          <li>Coloana a treia este contorul de legături: <code>2</code> = două nume. Permisiunile, proprietarul, dimensiunea și data sunt aceleași, pentru că aparțin inode-ului.</li>
        </ul>

        <CodeBlock title="Soft link în ls -l" kind="session" label="illustrative" code={`[student@server1 lab17]$ ls -l soft.txt\nlrwxrwxrwx. 1 student student 12 Jan  1 10:01 soft.txt -> original.txt`} />
        <ul>
          <li><code>l</code> pe prima poziție: tip symlink; <code>rwxrwxrwx</code> nu are efect real.</li>
          <li><code>12</code> este lungimea căii memorate („original.txt” = 12 caractere), nu dimensiunea țintei.</li>
          <li><code>-&gt; original.txt</code> este ținta (calea relativă).</li>
        </ul>

        <CodeBlock title="Symlink rupt" kind="session" label="illustrative" code={`[student@server1 lab17]$ rm original.txt\n[student@server1 lab17]$ cat soft.txt\ncat: soft.txt: No such file or directory\n[student@server1 lab17]$ cat hard.txt\ndate importante`} />
        <p className="small">După ștergerea numelui <code>original.txt</code>, hard link-ul funcționează (datele există), iar symlink-ul eșuează: ținta (calea) nu mai există. Mesajul numește link-ul, nu ținta.</p>

        <CodeBlock title="stat pe un symlink" kind="session" label="illustrative" code={`[student@server1 lab17]$ stat soft.txt\n  File: soft.txt -> original.txt\n  Size: 12   Blocks: 0   IO Block: 4096   symbolic link\nInode: 524305   Links: 1`} />
        <p className="small">Câmpurile afișate (lista este redusă): „symbolic link”, inode propriu, <code>Links: 1</code>. Valorile numerice diferă pe sistemul tău.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Hard link: <code>ls -li</code> arată același inode; contorul (coloana 3 din <code>ls -li</code>) este &gt; 1; <code>find . -samefile</code> listează toate numele.</li>
            <li>Soft link: <code>ls -l</code> arată <code>l</code> și <code>-&gt; țintă</code>; <code>readlink -f nume</code> returnează o cale existentă; <code>cat nume</code> funcționează.</li>
            <li>Link rupt: <code>ls -l</code> îl arată (de obicei în altă culoare), dar <code>cat</code> eșuează; <code>find -xtype l</code> îl listează.</li>
            <li>Confirmă că link-ul indică ce trebuie: compară <code>readlink</code> cu ținta dorită, mai ales la căi relative.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Link-urile (hard și soft) sunt intrări în sistemul de fișiere și persistă după reboot, ca orice fișier. Pentru symlink-uri, persistența unei <i>căi</i> depinde de existența țintei la pornire: dacă ținta este pe un sistem de fișiere montat mai târziu sau doar temporar (de ex. <code>/mnt</code>, <code>/tmp</code>, <code>/run</code>), link-ul poate fi rupt după reboot (montări persistente: C6).
            Confirmare manuală: după repornire, <code>ls -l</code> și <code>readlink -f</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>ln: failed to create hard link … Invalid cross-device link</code>, 'țintă și link pe sisteme de fișiere diferite', <><code>df fișier1 fișier2</code></>, <>folosește <code>ln -s</code></>],
          [<>hard link către director: „not allowed”</>, 'nu se permit hard link-uri către directoare', '—', <>folosește symlink: <code>ln -s</code></>],
          [<code>ln: failed to create … File exists</code>, 'numele link-ului există deja', <code>ls -l nume</code>, <><code>ln -sf</code> (atenție: înlocuiește) sau alt nume</>],
          ['symlink care „nu merge” (No such file or directory)', 'cale relativă greșită față de directorul link-ului, sau țintă ștearsă', <><code>readlink link</code>, <code>ls -l</code> din directorul link-ului</>, <>recreează cu calea corectă sau cu o cale absolută</>],
          ['`ln -s a b` creează link în loc de redenumire', 'ordine inversată: ln ȚINTĂ LINK', <code>ls -l</code>, 'inversează argumentele; șterge link-ul greșit cu rm'],
          ['symlink către director se comportă ciudat la `ln -sf`', 'link existent către director este urmărit', '—', <>folosește <code>-n</code> (<code>ln -sfn</code>) ca să înlocuiești link-ul însuși</>],
          ['modificarea unui fișier nu se vede prin celălalt „hard link”', 'editorul a înlocuit fișierul (inode nou)', <><code>ls -li</code></>, 'recreează hard link-ul; editează „pe loc”'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Ordinea argumentelor: <code>ln -s ȚINTĂ NUME_LINK</code>, nu invers.</>,
          <>Symlink relativ creat dintr-un director și interpretat din altul: calea relativă contează față de locul link-ului.</>,
          <>Crezi că un hard link este „o copie”: nu, este același fișier; modificările se văd prin ambele nume.</>,
          <>Crezi că ștergerea „originalului” șterge datele când mai există un hard link: nu.</>,
          <>Vrei un link către director și folosești hard link: nu merge; ai nevoie de <code>-s</code>.</>,
          <>Hard link între două sisteme de fișiere (de exemplu din <code>/home</code> în <code>/tmp</code>, dacă sunt montări diferite).</>,
          <>Ștergi cu <code>rm -r link/</code> (cu slash final) pe un symlink către director: comportamentul diferă; șterge link-ul fără slash final.</>,
          <>Uiți să verifici cu <code>ls -l</code> / <code>readlink</code> după creare.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ce este, de fapt, „ștergerea” unui fișier">
        <p>
          <code>rm</code> apelează <code>unlink()</code>: elimină o intrare de director și scade contorul de legături al inode-ului. Inode-ul și datele sunt eliberate doar când contorul este 0 <i>și</i> niciun proces nu mai are fișierul deschis.
          De aceea un fișier de log șters de pe disc poate continua să ocupe spațiu cât timp un serviciu îl ține deschis (<code>df</code> arată spațiu ocupat, <code>ls</code> nu mai vede fișierul).
        </p>
        <p>
          Pentru symlink-uri scurte, calea poate fi stocată chiar în inode (fără bloc de date) pe multe sisteme de fișiere; este un detaliu de implementare. Nucleul limitează adâncimea de rezolvare a symlink-urilor în lanț, ca să evite bucle (eroare de tip „Too many levels of symbolic links”).
        </p>
        <p>
          Kernel-ul Linux are și protecții opționale pentru link-uri în directoare world-writable precum <code>/tmp</code> (<code>fs.protected_hardlinks</code>, <code>fs.protected_symlinks</code>); nu sunt necesare obiectivului, iar valorile lor implicite pe RHEL 10 nu au fost verificate aici.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_7: TopicModule = {
  id: 'L1.7',
  subtitle: 'ln, ln -s, inode, contor de legături, link-uri rupte',
  studyTime: '≈45 min studiu + laborator',
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
  labs: [LAB_L1_7],
  sources: [
    { kind: 'man', ref: 'ln(1), readlink(1), stat(1), ls(1), find(1) (-samefile, -xtype)' },
    { kind: 'man', ref: 'inode(7), symlink(7), path_resolution(7)' },
    { kind: 'doc', ref: 'GNU Coreutils manual (info coreutils: ln invocation) — de verificat la review' },
  ],
};
