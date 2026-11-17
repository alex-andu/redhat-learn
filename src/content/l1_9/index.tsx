import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_9 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="tar">tar</G> strânge mai multe fișiere și directoare într-o singură <b>arhivă</b>; <G id="gzip">gzip</G> și <G id="bzip2">bzip2</G> <b>comprimă</b> un fișier. Împreună dau <G id="tarball">tarball</G>-uri: <code>.tar.gz</code> (<code>tar -czf</code>) și <code>.tar.bz2</code> (<code>tar -cjf</code>).
            Reții trei moduri la <code>tar</code>: <code>-c</code> creează, <code>-t</code> listează, <code>-x</code> extrage — și că <code>-f</code> este urmat întotdeauna de numele arhivei.
          </p>
          <p>Obiectivul oficial: <i>„Archive, compress, unpack, and uncompress files using tar, gzip, and bzip2”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Copiile de siguranță, transferul unui director, atașarea logurilor la un raport sau mutarea unui proiect între servere cer să tratezi mai multe fișiere ca <i>un singur obiect</i> și, adesea, să-l faci mai mic.
            Filosofia Unix separă cele două sarcini: <code>tar</code> doar <i>împachetează</i> (păstrează căi, permisiuni, proprietari, timpi), iar compresoarele (<code>gzip</code>, <code>bzip2</code>) doar <i>micșorează</i> un singur flux de date. Le combini după nevoie.
          </p>
          <Analogy>faci o mutare: <code>tar</code> pune toate lucrurile într-o cutie mare (arhiva), cu eticheta fiecărui obiect; <code>gzip</code>/<code>bzip2</code> este aspiratorul care scoate aerul din cutie ca să ocupe mai puțin loc. Poți avea cutie fără aspirator (.tar), dar nu poți „aspira” un set de obiecte fără cutie.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Arhivare ≠ compresie</h4>
          <p>
            Un fișier <code>.tar</code> este o succesiune de „intrări”: pentru fiecare fișier, un antet (nume, permisiuni, proprietar, dimensiune, timp) urmat de conținut. Nu este mai mic decât suma fișierelor (poate fi puțin mai mare).
            <G id="compression">Compresia</G> se aplică separat pe întregul flux: <code>tar -czf</code> înseamnă „creează arhiva și treci-o printr-un filtru gzip”. Pentru că un compresor lucrează pe un singur flux, nu poți comprima un director direct cu <code>gzip</code>: <code>gzip director</code> refuză.
          </p>
          <h4>Anatomia comenzii <code>tar</code></h4>
          <Table head={['Parte', 'Opțiuni', 'Rol']} rows={[
            ['Mod (unul singur)', <><code>-c</code> creează · <code>-x</code> extrage · <code>-t</code> listează · <code>-r</code> adaugă · <code>-u</code> actualizează</>, 'ce faci cu arhiva'],
            ['Fișierul arhivă', <><code>-f NUME</code></>, 'obligatoriu aproape mereu; NUME trebuie să urmeze imediat după f'],
            ['Compresie', <><code>-z</code> gzip · <code>-j</code> bzip2 · <code>-a</code> după extensie</>, 'la creare; la extragere, tar GNU recunoaște automat de obicei formatul'],
            ['Altele', <><code>-v</code> verbose · <code>-C DIR</code> · <code>-p</code> · <code>--exclude=TIPAR</code></>, 'detalii și control'],
          ]} />
          <p>
            Opțiunile pot fi scrise grupat și fără cratimă (<code>tar czf arhiva.tar.gz dir</code>) sau cu cratimă (<code>tar -czf …</code>). Regula practică: <b>f ultima în grup</b>, urmată de numele arhivei (<code>-czvf</code> corect, <code>-cfzv</code> greșit: <code>z</code> ar deveni numele arhivei).
          </p>
          <h4>Căi absolute și relative</h4>
          <p>
            Dacă arhivezi <code>/etc/ssh</code>, <code>tar</code> GNU elimină <code>/</code> din față (mesaj <i>„Removing leading `/' from member names”</i>) ca arhiva să nu scrie, la extragere, peste fișiere de sistem. La extragere, căile sunt interpretate relativ la directorul curent sau la <code>-C</code>.
          </p>
          <h4>Permisiuni și proprietari la extragere</h4>
          <p>
            Ca utilizator obișnuit, fișierele extrase îți aparțin și respectă umask-ul (L1.8); ca <code>root</code>, <code>tar</code> restabilește proprietarii din arhivă. <code>-p</code> păstrează permisiunile exact, fără umask.
          </p>
          <h4>gzip și bzip2</h4>
          <Table head={['Aspect', 'gzip', 'bzip2']} rows={[
            ['Extensie', <code>.gz</code>, <code>.bz2</code>],
            ['Comprimă', <code>gzip fișier</code>, <code>bzip2 fișier</code>],
            ['Decomprimă', <><code>gunzip fișier.gz</code> sau <code>gzip -d</code></>, <><code>bunzip2 fișier.bz2</code> sau <code>bzip2 -d</code></>],
            ['Păstrează originalul', <code>-k</code>, <code>-k</code>],
            ['Citește fără a decomprima', <code>zcat</code>, <code>bzcat</code>],
            ['Test integritate', <code>gzip -t</code>, <code>bzip2 -t</code>],
            ['Caracter general', 'mai rapid', 'de obicei mai mic, mai lent'],
            ['În tar', <code>-z</code>, <code>-j</code>],
          ]} />
          <p>
            Implicit, <code>gzip</code> și <code>bzip2</code> <b>înlocuiesc</b> fișierul original cu cel comprimat (și invers la decomprimare); <code>-k</code> (keep) îl păstrează.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Fișiere și directoare</b> (L1.3): <code>tar</code> păstrează structura; extragerea poate suprascrie fișiere existente fără avertisment.</li>
            <li><b>Permisiuni și proprietari</b> (L1.8): metadate stocate în arhivă; efectul diferă între root și utilizator obișnuit.</li>
            <li><b>Link-uri</b> (L1.7): symlink-urile sunt arhivate ca symlink-uri, iar hard link-urile ale aceluiași fișier sunt de obicei stocate o singură dată.</li>
            <li><b>Redirecționare și pipe</b> (L1.5): <code>tar -czf - dir | …</code> trimite arhiva pe stdout; <code>zcat fișier.gz | grep</code> caută fără a decomprima pe disc.</li>
            <li><b>SSH</b> (L1.11): arhivele se transferă cu <code>scp</code>/<code>sftp</code>; arhivarea înainte de transfer reduce numărul de fișiere.</li>
            <li><b>Spațiu pe disc</b> (C5, C6): arhiva plus originalul consumă spațiu; verifică <code>df -h</code> înainte.</li>
            <li><b>SELinux</b> (C10): contextele nu se păstrează implicit în orice arhivă; aspectele de context sunt tratate în capitolul respectiv.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Backup rapid al unui director de configurare înainte de modificare: <code>tar -czf backup-etc.tar.gz /etc/ssh</code>.</li>
            <li>Transfer: o singură arhivă în loc de multe fișiere.</li>
            <li>Economie de spațiu pe loguri vechi: <code>gzip jurnal.log</code>.</li>
            <li>Extragerea unui software livrat ca <code>.tar.gz</code>/<code>.tar.bz2</code>.</li>
            <li>La examen: „creează arhiva X comprimată cu bzip2 din directorul Y” sau „extrage arhiva în directorul Z”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le în <code>~/lab19</code>. Arhivează doar fișiere de test sau directoare pe care ai drept de citire. Dimensiunile din output-uri sunt <b>Ilustrative</b>. Dacă <code>bzip2</code> lipsește, verifică cu <code>command -v bzip2</code>.
        </Callout>

        <h4>Pregătire și creare de arhive</h4>
        <CodeBlock title="comenzi" code={`mkdir -p ~/lab19/proiect/docs && cd ~/lab19\nfor i in 1 2 3; do seq 1 2000 > proiect/docs/f$i.txt; done\ntar -cvf proiect.tar proiect\ntar -czvf proiect.tar.gz proiect\ntar -cjvf proiect.tar.bz2 proiect\ntar -caf proiect2.tar.gz proiect\ntar -czf etc-ssh.tar.gz /etc/ssh 2>/dev/null\nls -lh`} explain={[
          ['-c', '--create: creează o arhivă nouă.'],
          ['-v', '--verbose: afișează fiecare fișier procesat.'],
          ['-f proiect.tar', '--file: numele arhivei; trebuie să urmeze imediat după f.'],
          ['-z', 'filtrează prin gzip (extensie .tar.gz sau .tgz).'],
          ['-j', 'filtrează prin bzip2 (extensie .tar.bz2).'],
          ['-a', '--auto-compress: alege compresia după extensia numelui arhivei.'],
          ['proiect', 'ce se arhivează: directorul și tot conținutul lui (cale relativă).'],
          ['/etc/ssh', 'cale absolută: tar elimină „/” din față și afișează un avertisment pe stderr (aici aruncat cu 2>/dev/null).'],
          ['for … seq', 'doar pregătirea datelor de test: bucla creează 3 fișiere; `seq 1 2000` afișează numerele de la 1 la 2000, redirecționate în fiecare fișier.'],
        ]} />

        <h4>Listare fără extragere</h4>
        <CodeBlock title="comenzi" code={`tar -tf proiect.tar\ntar -tzvf proiect.tar.gz\ntar -tjf proiect.tar.bz2`} explain={[
          ['-t', '--list: afișează conținutul arhivei, fără a extrage nimic.'],
          ['-tzvf', 'listare detaliată (permisiuni, proprietar, dimensiune, dată) a unei arhive gzip.'],
        ]} />

        <h4>Extragere</h4>
        <CodeBlock title="comenzi" code={`mkdir -p extras1 extras2 extras3\ntar -xvf proiect.tar -C extras1\ntar -xzvf proiect.tar.gz -C extras2\ntar -xjvf proiect.tar.bz2 -C extras3\ntar -xzf proiect.tar.gz proiect/docs/f1.txt\ntar -xzf proiect.tar.gz --strip-components=1 -C extras2\ntar -czf p.tar.gz --exclude='*.tmp' proiect`} explain={[
          ['-x', '--extract: extrage din arhivă.'],
          ['-C extras1', '--directory: intră în director înainte de operație; la extragere = destinația (directorul trebuie să existe).'],
          ['-xzf … proiect/docs/f1.txt', 'extrage doar membrul dat (calea exactă din listare).'],
          ['--strip-components=1', 'elimină primul nivel de director din căile extrase.'],
          ['--exclude=\'*.tmp\'', 'omite fișierele al căror nume se potrivește (tiparul se citează).'],
        ]} />

        <h4>gzip și bzip2 pe fișiere</h4>
        <CodeBlock title="comenzi" code={`cp proiect/docs/f1.txt mare.txt\ngzip mare.txt\nls -l mare.txt.gz\ngunzip mare.txt.gz\ngzip -k mare.txt\ngzip -l mare.txt.gz\ngzip -t mare.txt.gz && echo ok\nzcat mare.txt.gz | head -n 3\nbzip2 -k mare.txt\nbzcat mare.txt.bz2 | head -n 3\nbunzip2 -f mare.txt.bz2\nfile mare.txt.gz proiect.tar.gz`} explain={[
          ['gzip mare.txt', 'comprimă și ÎNLOCUIEȘTE fișierul cu mare.txt.gz.'],
          ['gunzip mare.txt.gz', 'decomprimă și înlocuiește arhiva cu fișierul original (echivalent: gzip -d).'],
          ['gzip -k', '--keep: păstrează fișierul original.'],
          ['gzip -l', '--list: dimensiune comprimată, necomprimată și raport.'],
          ['gzip -t', '--test: verifică integritatea fișierului comprimat.'],
          ['zcat / bzcat', 'afișează conținutul decomprimat pe stdout, fără a modifica fișierul.'],
          ['bzip2 -k / bunzip2 -f', '-k păstrează originalul; -f (force) permite suprascrierea unui fișier existent la decomprimare.'],
          ['file', 'arată tipul real al fișierului, indiferent de extensie.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Creare cu -v" kind="session" label="illustrative" code={`[student@server1 lab19]$ tar -czvf proiect.tar.gz proiect\nproiect/\nproiect/docs/\nproiect/docs/f1.txt\nproiect/docs/f2.txt\nproiect/docs/f3.txt`} />
        <ul>
          <li>Fiecare linie este un membru adăugat; căile sunt relative (încep cu <code>proiect/</code>), deci arhiva se extrage întotdeauna în subdirectorul <code>proiect</code> din locul curent.</li>
          <li>Fără <code>-v</code>, comanda nu afișează nimic dacă reușește.</li>
        </ul>

        <CodeBlock title="Cale absolută" kind="session" label="illustrative" code={`[student@server1 ~]$ tar -czf etc-ssh.tar.gz /etc/ssh\ntar: Removing leading \`/' from member names`} />
        <p className="small">Avertisment, nu eroare: tar a eliminat <code>/</code> din căi. Pe sistem pot apărea și alte mesaje dacă nu poți citi unele fișiere.</p>

        <CodeBlock title="tar -tzvf" kind="session" label="illustrative" code={`[student@server1 lab19]$ tar -tzvf proiect.tar.gz\ndrwxr-xr-x student/student 0 2025-01-01 10:00 proiect/\ndrwxr-xr-x student/student 0 2025-01-01 10:00 proiect/docs/\n-rw-r--r-- student/student 8893 2025-01-01 10:00 proiect/docs/f1.txt`} />
        <p className="small">Coloanele: permisiuni, proprietar/grup, dimensiune necomprimată (octeți), data, calea. Valorile diferă pe sistemul tău.</p>

        <CodeBlock title="Dimensiuni" kind="session" label="illustrative" code={`[student@server1 lab19]$ ls -lh proiect.tar proiect.tar.gz proiect.tar.bz2\n-rw-r--r--. 1 student student  30K Jan  1 10:00 proiect.tar\n-rw-r--r--. 1 student student 9.0K Jan  1 10:00 proiect.tar.bz2\n-rw-r--r--. 1 student student 9.5K Jan  1 10:00 proiect.tar.gz`} />
        <p className="small">Valori inventate pentru exemplu: demonstrează doar că arhiva simplă este mai mare decât cele comprimate. Raportul real depinde de date; bzip2 obține de obicei un fișier mai mic decât gzip, dar nu garantat.</p>

        <CodeBlock title="gzip -l și file" kind="session" label="illustrative" code={`[student@server1 lab19]$ gzip -l mare.txt.gz\n         compressed        uncompressed  ratio uncompressed_name\n               3300                8893  63.1% mare.txt\n[student@server1 lab19]$ file proiect.tar.gz\nproiect.tar.gz: gzip compressed data, from Unix, ...`} />
        <p className="small">Cifrele sunt ilustrative. <code>file</code> arată formatul real, util când extensia nu corespunde conținutului.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>După creare: <code>tar -tf arhiva</code> (listează) și <code>ls -lh</code> (există, dimensiune rezonabilă). Confirmă că arhiva conține ce trebuie și căile sunt cele dorite.</li>
            <li>După extragere: <code>ls -R</code> sau <code>find</code> în directorul destinație; compară cu originalul (<code>diff -r dir1 dir2</code> nu afișează nimic dacă sunt identice).</li>
            <li>Integritate: <code>gzip -t</code> / <code>bzip2 -t</code>, sau <code>tar -tzf</code> fără erori.</li>
            <li>Tip real: <code>file arhiva</code> (nu te baza doar pe extensie).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Arhivele și fișierele comprimate sunt fișiere obișnuite pe disc și persistă după reboot. Nu există configurație de sistem implicată. Atenție: dacă ai creat arhiva într-un loc temporar (<code>/tmp</code>), poate fi curățată la reboot sau periodic; păstrează backup-urile în afara lui. Un fișier extras ca utilizator obișnuit nu păstrează proprietarii originali.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>tar: Removing leading `/' from member names</code>, 'ai dat căi absolute', '—', 'este un avertisment normal; la extragere căile sunt relative'],
          [<code>tar: Cowardly refusing to create an empty archive</code>, 'nu ai dat niciun fișier de arhivat', <>verifică comanda</>, <>adaugă calea sursă după numele arhivei</>],
          [<>Arhiva creată are numele <code>z</code> (sau alt nume ciudat)</>, 'ai scris f înaintea altor opțiuni (-cfz arhiva…)', <code>ls</code>, <>pune <code>f</code> ultima: <code>-czf arhiva</code></>],
          [<><code>gzip: stdin: not in gzip format</code> / <code>tar: This does not look like a tar archive</code></>, 'compresie nepotrivită față de fișier', <code>file fișier</code>, <>folosește opțiunea corectă (<code>-z</code>/<code>-j</code>) sau lasă tar să detecteze</>],
          [<code>gzip: fișier already has .gz suffix</code>, 'fișierul este deja comprimat', <code>ls</code>, 'nu-l comprima din nou'],
          [<>Fișierele extrase sunt în alt loc decât te așteptai</>, 'căi relative din arhivă + director curent', <code>tar -tf arhiva</code>, <>folosește <code>-C</code> și, la nevoie, <code>--strip-components</code></>],
          [<code>No space left on device</code>, 'disc plin', <code>df -h</code>, 'eliberează spațiu sau arhivează în alt loc'],
          [<code>Permission denied</code>, 'nu poți citi sursa sau scrie destinația', <code>ls -l</code>, <>folosește <code>sudo</code> unde e potrivit; destinație cu drept de scriere</>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confunzi <code>-c</code> (creare) cu <code>-x</code> (extragere) și suprascrii arhiva: dacă arhiva există, <code>tar -c</code> o înlocuiește.</>,
          <>Uiți <code>-f</code> sau pui o altă opțiune după el: numele arhivei trebuie să urmeze imediat.</>,
          <>Folosești <code>-z</code> pentru <code>.bz2</code> sau <code>-j</code> pentru <code>.gz</code>.</>,
          <>Crezi că <code>tar</code> comprimă singur: fără <code>-z</code>/<code>-j</code> arhiva nu este comprimată.</>,
          <>Uiți că <code>gzip fișier</code> șterge originalul; fără <code>-k</code> nu îl mai ai.</>,
          <>Extragi fără <code>-C</code> în directorul greșit; sau nu verifici întâi cu <code>tar -tf</code>.</>,
          <>Arhivezi cu cale absolută și ți se pare că arhiva e goală: mesajul este doar avertisment.</>,
          <>Dai numele arhivei în loc de nume de director la arhivare (te arhivezi pe tine însuți în buclă).</>,
          <>Cauți o opțiune în alt format (<code>-J</code>/xz) când se cere explicit gzip sau bzip2.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: formatul tar, streaming și xz">
        <p>
          Formatul <code>tar</code> este secvențial: blocuri de 512 octeți, un antet pe membru. Fiindcă nu are index central, <code>tar -tf</code> trebuie să citească toată arhiva pentru a o lista, iar adăugarea (<code>-r</code>) funcționează doar pe arhive necomprimate.
        </p>
        <p>
          Pentru că <code>tar</code> poate scrie pe stdout (<code>-f -</code>), poți construi lanțuri: <code>tar -cf - dir | gzip &gt; dir.tar.gz</code> (echivalent cu <code>-czf</code>) sau copia unui arbore: <code>tar -cf - dir | tar -xf - -C /destinatie</code>.
        </p>
        <p>
          Există și alte compresoare (xz, zstd): <code>tar -J</code> pentru xz. Nu fac parte din textul obiectivului C1-6, dar poți întâlni arhive <code>.tar.xz</code>; <code>tar -xf</code> recunoaște de obicei formatul.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_9: TopicModule = {
  id: 'L1.9',
  subtitle: 'tar (-c/-x/-t, -z/-j, -C, -f), gzip, bzip2',
  studyTime: '≈50 min studiu + laborator',
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
  labs: [LAB_L1_9],
  sources: [
    { kind: 'man', ref: 'tar(1); manualul GNU tar (info tar)' },
    { kind: 'man', ref: 'gzip(1), gunzip(1), zcat(1), bzip2(1), bunzip2(1), bzcat(1)' },
    { kind: 'man', ref: 'file(1), diff(1), seq(1)' },
    { kind: 'doc', ref: 'Documentația RHEL 10 (docs.redhat.com) — de verificat disponibilitatea pachetelor bzip2/xz în instalarea minimală' },
  ],
};
