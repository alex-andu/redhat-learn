import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_3 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Linux organizează tot ca fișiere într-un singur arbore de directoare cu rădăcina <code>/</code>. Cu cinci comenzi — <code>mkdir</code>, <code>touch</code>, <code>cp</code>, <code>mv</code>, <code>rm</code> — plus <code>ls</code>, <code>cd</code> și <code>pwd</code>
            pentru orientare, creezi, copiezi, muți, redenumești și ștergi orice. Trei idei contează: diferența dintre <G id="absolute-path">cale absolută</G> și <G id="relative-path">relativă</G>, cum expandează shell-ul <G id="glob">wildcard-urile</G> și faptul că <b>ștergerea din shell nu are coș de gunoi</b>.
          </p>
          <p>Obiectivul oficial: <i>„Create, delete, copy, and move files and directories”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Filosofia Unix: „totul este un fișier”. Documentele, programele, configurările, chiar și dispozitivele (<code>/dev/sda</code>) apar ca intrări în același arbore. Asta înseamnă că aceleași câteva unelte funcționează peste tot.
            Un administrator își petrece mare parte din timp copiind fișiere de configurare, creând directoare, mutând loguri și curățând spațiu.
          </p>
          <Analogy>arborele de directoare este un birou cu dulapuri (directoare) și dosare (fișiere). <code>cd</code> te mută în fața altui dulap; <code>cp</code> face o fotocopie; <code>mv</code> mută dosarul (sau îi schimbă eticheta); <code>rm</code> aruncă dosarul direct la tocător, fără coș.</Analogy>
          <p>
            Calea (<i>path</i>) este adresa unui fișier: <code>/home/student/docs/plan.txt</code>. Nu există litere de unitate ca în Windows: orice disc sau partiție se „montează” într-un director al aceluiași arbore (C5/C6).
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Căi și directorul curent</h4>
          <ul>
            <li><b>Cale absolută</b>: începe cu <code>/</code>; nu depinde de unde ești (<code>/etc/hostname</code>).</li>
            <li><b>Cale relativă</b>: se aplică față de directorul curent (<code>pwd</code>); <code>docs/plan.txt</code> înseamnă <code>$(pwd)/docs/plan.txt</code>.</li>
            <li><code>.</code> = directorul curent; <code>..</code> = părintele; <code>~</code> = directorul home (expandat de shell); <code>cd -</code> = ultimul director vizitat.</li>
          </ul>
          <h4>Ce se întâmplă când copiezi, muți, ștergi</h4>
          <ul>
            <li><b>Fișierele au nume, iar numele sunt intrări în directoare.</b> Datele stau în altă parte (inode); directorul păstrează legătura nume → inode (vezi L1.7 despre link-uri).</li>
            <li><b>mv în același sistem de fișiere</b> modifică doar intrările din directoare: instantaneu, indiferent de mărime. Redenumirea este tot un <code>mv</code>.</li>
            <li><b>mv între sisteme de fișiere diferite</b> (de exemplu din <code>/home</code> pe alt volum) copiază datele și apoi șterge originalul.</li>
            <li><b>cp</b> creează fișiere noi, cu date noi; proprietarul și timpul vor fi ale tale/ale momentului, dacă nu folosești <code>-p</code> sau <code>-a</code>.</li>
            <li><b>rm</b> elimină numele din director; când nu mai există niciun nume, spațiul se eliberează. Nu există „undo” în shell.</li>
          </ul>
          <h4>Wildcards și brace expansion: lucrează shell-ul, nu comanda</h4>
          <p>
            În <code>ls *.txt</code>, shell-ul înlocuiește <code>*.txt</code> cu lista fișierelor care se potrivesc <b>înainte</b> să pornească <code>ls</code>. De aceea <code>rm *</code> șterge tot din directorul curent și de aceea „verifică întâi cu <code>ls</code>” este regula de aur.
          </p>
          <Table head={['Model', 'Se potrivește cu', 'Exemplu']} rows={[
            [<code>*</code>, 'orice șir (și șirul gol); nu include fișierele ascunse', <code>ls *.log</code>],
            [<code>?</code>, 'exact un caracter', <code>ls fisier?.txt</code>],
            [<code>[abc]</code>, 'un caracter din set', <code>ls log[123]</code>],
            [<code>[a-c]</code>, 'un caracter din interval', <code>ls [a-c]*</code>],
            [<code>[!abc]</code>, 'un caracter care NU este în set', <code>ls [!a]*</code>],
            [<code>{'{a,b}'}</code>, 'brace expansion: generează text, nu caută fișiere', <code>{'mkdir {docs,src}'}</code>],
          ]} />
          <p>Dacă nimic nu se potrivește cu un model, bash lasă modelul literal: <code>ls *.xyz</code> poate raporta „cannot access '*.xyz'”.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Permisiuni</b> (L1.8): pentru a crea/șterge un fișier ai nevoie de drept de scriere (<code>w</code>) pe <i>directorul</i> care îl conține, nu neapărat pe fișier.</li>
            <li><b>umask</b> (L10.1): determină permisiunile implicite ale fișierelor și directoarelor create de <code>touch</code> și <code>mkdir</code>.</li>
            <li><b>SELinux</b> (C10): fișierele create primesc un context după locație; <code>cp</code> creează un fișier nou cu contextul directorului destinație, dar <code>mv</code> păstrează contextul vechi. Pe RHEL, aceasta explică multe probleme „fișierul mutat nu mai e accesibil serviciului”.</li>
            <li><b>Link-uri</b> (L1.7): <code>ln</code> creează nume suplimentare sau referințe simbolice.</li>
            <li><b>Arhivare</b> (L1.9): <code>tar</code> pachetează directoare întregi.</li>
            <li><b>Redirecționare</b> (L1.5): <code>&gt;</code> creează sau suprascrie fișiere, ca un <code>touch</code> + scriere.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Înainte de a modifica un fișier de configurare: <code>cp -a /etc/fstab /etc/fstab.bak</code> (salvezi originalul).</li>
            <li>La pregătirea unei structuri de directoare pentru un serviciu sau un punct de montare.</li>
            <li>La reorganizarea și curățarea datelor (logs vechi, arhive).</li>
            <li>La examen: creezi directoare cu proprietari/permisiuni specifice; ordinea corectă este creezi, apoi setezi (L1.8) și verifici.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Exersează-le într-un director de test din home (<code>~/lab13</code>). Output-urile de mai jos sunt <b>Ilustrative</b>.
        </Callout>

        <h4>Orientare: pwd, cd, ls</h4>
        <CodeBlock title="comenzi" code={`pwd\ncd /etc\ncd ..\ncd -\ncd\nls\nls -l\nls -la\nls -lh /var/log\nls -ld /etc\nls -R ~/lab13\nls -lt`} explain={[
          ['pwd', 'directorul curent (cale absolută).'],
          ['cd DIR', 'schimbă directorul. Fără argument: home. `cd ..`: părintele; `cd -`: ultimul director vizitat.'],
          ['ls', 'listează numele din directorul curent (fără cele ascunse).'],
          ['-l', 'format lung: tip și permisiuni, nr. de link-uri, proprietar, grup, dimensiune, timp, nume.'],
          ['-a', 'toate intrările, inclusiv cele ascunse (nume cu punct la început), plus `.` și `..`. `-A` le omite pe acestea două.'],
          ['-h', 'dimensiuni „human-readable” (K, M, G) împreună cu -l.'],
          ['-d', 'arată directorul însuși, nu conținutul: `ls -ld /etc`.'],
          ['-R', 'recursiv: coboară în subdirectoare.'],
          ['-t', 'sortează după timpul modificării (cel mai nou primul); `-r` inversează ordinea.'],
        ]} />

        <h4>Creare: mkdir, touch</h4>
        <CodeBlock title="comenzi" code={`mkdir ~/lab13\nmkdir -p ~/lab13/proiect/docs\nmkdir -pv ~/lab13/{arhiva,tmp}\ntouch ~/lab13/proiect/docs/plan.txt\ntouch ~/lab13/proiect/docs/{a,b,c}.txt\nrmdir ~/lab13/tmp`} explain={[
          ['mkdir DIR', 'creează un director; eroare dacă părintele nu există.'],
          ['-p', '(--parents) creează și părinții lipsă și nu dă eroare dacă directorul există.'],
          ['-v', '(--verbose) spune ce a făcut. -pv combină cele două.'],
          ['{arhiva,tmp}', 'brace expansion: shell-ul generează ~/lab13/arhiva și ~/lab13/tmp.'],
          ['touch FIȘIER', 'creează un fișier gol dacă nu există; dacă există, îi actualizează timpul modificării. `-c` nu creează fișiere noi.'],
          ['rmdir DIR', 'șterge un director DOAR dacă este gol.'],
        ]} />

        <h4>Copiere: cp</h4>
        <CodeBlock title="comenzi" code={`cp plan.txt plan-v1.txt\ncp -v plan.txt ~/lab13/arhiva/\ncp -r proiect proiect-copie\ncp -a proiect backup-proiect\ncp -i plan.txt ~/lab13/arhiva/\ncp -p /etc/hostname .`} explain={[
          ['cp SURSĂ DESTINAȚIE', 'copiază un fișier; dacă destinația este un director, copia intră în el cu același nume.'],
          ['-v', 'verbose.'],
          ['-r / -R', 'recursiv: obligatoriu pentru directoare; fără el, cp refuză („-r not specified; omitting directory”).'],
          ['-a', '(--archive) copie recursivă care păstrează cât mai mult din original (permisiuni, proprietar dacă ai dreptul, timpuri, link-uri simbolice, contexte SELinux dacă sunt disponibile). Alegerea pentru backup-uri.'],
          ['-i', 'întreabă înainte să suprascrie. Implicit, cp suprascrie fără să întrebe.'],
          ['-p', 'păstrează modul, proprietarul și timpurile; mai puțin decât -a.'],
        ]} />
        <p>
          <b>Sensul copierii unui director.</b> Dacă destinația <i>nu există</i>, <code>cp -r proiect copie</code> creează <code>copie</code> ca duplicat al lui <code>proiect</code>. Dacă destinația <i>există deja</i> ca director, rezultatul este <code>copie/proiect</code> (copia intră în ea).
          Aceeași comandă dă rezultate diferite în funcție de ce există deja: verifică cu <code>ls</code> înainte.
        </p>

        <h4>Mutare și redenumire: mv</h4>
        <CodeBlock title="comenzi" code={`mv plan.txt plan-final.txt\nmv plan-final.txt ~/lab13/arhiva/\nmv ~/lab13/proiect-copie ~/lab13/arhiva/\nmv -i a.txt b.txt\nmv -n a.txt b.txt`} explain={[
          ['mv VECHI NOU', 'redenumește dacă NOU nu este un director existent.'],
          ['mv FIȘIER DIR/', 'mută în director, păstrând numele.'],
          ['mv DIR1 DIR2', 'mută directorul fără -r (mv nu are nevoie de el).'],
          ['-i', 'întreabă înainte de suprascriere.'],
          ['-n', '(--no-clobber) nu suprascrie niciodată.'],
        ]} />

        <h4>Ștergere: rm, rmdir</h4>
        <CodeBlock title="comenzi" code={`rm plan-v1.txt\nrm -i *.bak\nrm -v a.txt b.txt\nrm -r ~/lab13/arhiva/proiect-copie\nrm -rf ~/lab13/tmp\nls ~/lab13/*.tmp\nrm ~/lab13/*.tmp`} explain={[
          ['rm FIȘIER', 'șterge definitiv (nu există coș de gunoi).'],
          ['-i', 'cere confirmare pentru fiecare fișier. Pe RHEL, contul root are de obicei alias-uri `rm -i`, `cp -i`, `mv -i`; utilizatorii obișnuiți nu.'],
          ['-r / -R', 'recursiv: șterge directorul și tot conținutul.'],
          ['-f', 'forțează: nu întreabă și ignoră fișierele inexistente. Periculos combinat cu -r.'],
          ['-v', 'arată ce șterge.'],
          ['ls MODEL, apoi rm MODEL', 'obicei bun: afli ce potrivește wildcard-ul înainte să ștergi.'],
        ]} />
        <Callout kind="warn" title="Siguranță la ștergere">
          Un spațiu în plus poate fi dezastruos: <code>rm -rf ~/tmp/old</code> șterge <code>old</code>; <code>rm -rf ~ /tmp/old</code> primește <b>două</b> argumente, printre care <code>~</code> (tot home-ul tău).
          GNU <code>rm</code> refuză implicit <code>rm -r /</code> (<code>--preserve-root</code>), dar nu te protejează de multe alte combinații la fel de grave. Citește linia înainte de Enter.
        </Callout>

        <h4>Aflarea tipului: file</h4>
        <CodeBlock title="comandă" code={`file /etc/hostname /usr/bin/ls ~/lab13`} explain={[['file NUME...', 'recunoaște tipul după conținut, nu după extensie (text ASCII, executabil ELF, directory...).']]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ls -l" kind="session" label="illustrative" code={`[student@server1 lab13]$ ls -l\ntotal 8\ndrwxr-xr-x. 2 student student 4096 Nov 15 10:02 docs\n-rw-r--r--. 1 student student   12 Nov 15 10:05 plan.txt\nlrwxrwxrwx. 1 student student    8 Nov 15 10:07 link -> plan.txt`} />
        <Table head={['Câmp', 'Exemplu', 'Semnificație']} rows={[
          ['Tip', <code>d / - / l</code>, 'primul caracter: d = director, - = fișier obișnuit, l = link simbolic'],
          ['Permisiuni', <code>rwxr-xr-x</code>, 'trei triplete: proprietar, grup, ceilalți (L1.8)'],
          ['Punct final', <code>.</code>, 'indică, pe sisteme cu SELinux, un context de securitate asociat (C10); lipsește pe sisteme fără SELinux'],
          ['Link-uri', <code>2</code>, 'numărul de nume (hard links) ale intrării; pentru un director, include . și ..'],
          ['Proprietar / grup', <code>student student</code>, 'utilizatorul și grupul asociate fișierului'],
          ['Dimensiune', <code>4096 / 12</code>, 'în octeți (cu -h: K, M, G). Pentru un director, dimensiunea structurii lui, nu a conținutului'],
          ['Timp', <code>Nov 15 10:02</code>, 'data modificării (implicit)'],
          ['Nume', <code>link -&gt; plan.txt</code>, 'pentru link simbolic arată și ținta'],
          ['total', <code>total 8</code>, 'suma blocurilor alocate (în unități de 1 KiB, implicit), nu un număr de fișiere'],
        ]} />
        <p className="small">Valorile (utilizator, date, dimensiuni) sunt exemplificative; câmpurile și ordinea lor sunt cele standard ale lui <code>ls -l</code>.</p>

        <CodeBlock title="cp fără și cu -r" kind="session" label="illustrative" code={`[student@server1 lab13]$ cp proiect proiect-copie\ncp: -r not specified; omitting directory 'proiect'\n[student@server1 lab13]$ cp -r proiect proiect-copie\n[student@server1 lab13]$ echo $?\n0`} />
        <p className="small">Fără <code>-r</code>, <code>cp</code> refuză directoarele și iese cu cod non-zero; cu <code>-r</code>, copiază tot arborele.</p>

        <CodeBlock title="rmdir pe un director ne-gol" kind="session" label="illustrative" code={`[student@server1 lab13]$ rmdir proiect\nrmdir: failed to remove 'proiect': Directory not empty`} />
        <p className="small">Nu e un defect: <code>rmdir</code> este făcut să nu șteargă conținut. Pentru directoare cu fișiere folosești <code>rm -r</code>, cu grija descrisă mai sus.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>Creare: <code>ls -ld DIR</code> (există, tip <code>d</code>) și <code>ls -R</code> pentru structură.</li>
            <li>Copiere: compară rezultatul cu <code>ls -l</code>; pentru conținut identic, <code>diff -r sursă copie</code> (nu afișează nimic dacă sunt identice).</li>
            <li>Mutare: sursa nu mai apare (<code>ls sursă</code> dă eroare), destinația apare.</li>
            <li>Ștergere: <code>ls NUME</code> răspunde „No such file or directory”.</li>
            <li>În toate cazurile, <code>echo $?</code> imediat după comandă (0 = succes).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Fișierele și directoarele create sunt scrise pe disc și <b>supraviețuiesc reboot-ului</b>, cu o excepție: directoarele temporare (<code>/tmp</code>, <code>/run</code>) pot fi golite automat de sistem; nu depozita acolo lucruri cerute „persistent”.
            La examen, un director cerut într-o anumită locație (de exemplu <code>/srv/...</code> sau <code>/data</code>) trebuie să existe și după repornire; confirmi cu <code>ls -ld</code> după reboot.
            Atenție la punctele de montare (C5/C6): un director creat <i>în interiorul</i> unui punct de montare nemontat persistent dispare din vedere când se montează altceva peste el.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>No such file or directory</code>, 'cale greșită, părinte lipsă, ești în alt director', <><code>pwd</code>, <code>ls</code> părinte</>, <>corectează calea; <code>mkdir -p</code> pentru părinți</>],
          [<code>Permission denied</code>, 'lipsă de drept de scriere pe director', <code>ls -ld DIR</code>, <>alt director sau permisiuni (L1.8); la nevoie <code>sudo</code></>],
          [<code>cp: -r not specified</code>, 'copiezi un director fără -r', '—', <>adaugă <code>-r</code> (sau <code>-a</code>)</>],
          [<code>Directory not empty</code>, 'rmdir pe director cu conținut', <code>ls -A DIR</code>, <><code>rm -r DIR</code> după ce ai verificat conținutul</>],
          [<code>cannot create directory: File exists</code>, 'numele există deja (fișier sau director)', <code>ls -ld NUME</code>, <>alt nume, sau <code>mkdir -p</code> dacă e director</>],
          ['rezultat neașteptat la cp -r (copie în interiorul copiei)', 'destinația exista deja', <code>ls -l destinație</code>, 'șterge destinația greșită și repetă, sau folosește calea corectă'],
          ['fișierul mutat nu e citit de un serviciu', 'mv păstrează contextul SELinux vechi', <code>ls -Z</code>, 'vezi L10.5 (restorecon)'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Spațiu în plus într-o comandă <code>rm</code>; un wildcard care potrivește mai mult decât crezi. Rulează <code>ls MODEL</code> mai întâi.</>,
          <><code>cp -r a b</code> când <code>b</code> există deja: obții <code>b/a</code>, nu o copie a lui <code>a</code> numită <code>b</code>.</>,
          <>Uitarea lui <code>-a</code>/<code>-p</code> la backup: pierzi proprietarul și timpurile; la configurări (<code>/etc</code>), folosește <code>cp -a</code>.</>,
          <><code>mv</code> peste un fișier existent îl suprascrie fără să întrebe (pe contul tău, fără alias <code>-i</code>).</>,
          <><code>*</code> nu include fișierele ascunse; <code>rm -r dir/*</code> lasă <code>.ascunse</code>.</>,
          <>Creezi un director ca root și uiți să-i setezi proprietarul/permisiunile cerute (L1.8).</>,
          <>Crezi că ai „mutat” un fișier între două discuri instantaneu: copiază și șterge, deci durează și poate eșua la jumătate dacă se umple destinația.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ce este un director, de ce mv e rapid și cum acționează -f">
        <p>
          Un director este, la nivel de sistem de fișiere, un fișier special care conține o listă de perechi (nume, număr de inode). Numele nu fac parte din fișier: sunt etichete în director. De aceea <code>mv</code> într-același sistem de fișiere
          rescrie doar listele directoarelor implicate (apelul de sistem <code>rename</code>), indiferent de dimensiunea datelor; iar două nume diferite pot indica același inode (<i>hard link</i>, L1.7).
        </p>
        <p>
          <b>Dreptul de ștergere.</b> Pentru a șterge sau redenumi un nume, ai nevoie de drept de scriere și execuție pe <i>directorul</i> care îl conține; permisiunile fișierului în sine nu opresc ștergerea (excepție: bitul „sticky” de pe directoare precum <code>/tmp</code>, L1.8).
          <code>rm -f</code> nu ocolește permisiunile; doar suprimă întrebările și erorile pentru fișiere inexistente.
        </p>
        <p>
          <b>Globbing vs. regex.</b> <code>*</code> și <code>?</code> din shell sunt tipare pentru <i>nume de fișiere</i>, expandate de shell. Expresiile regulate (L1.6) sunt un alt limbaj, interpretat de <code>grep</code>, <code>sed</code> etc.; de aceea tiparele pasate acelor comenzi se citează, ca shell-ul să nu le atingă.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_3: TopicModule = {
  id: 'L1.3',
  subtitle: 'ls, cd, mkdir, touch, cp, mv, rm: căi, wildcards și ștergere sigură',
  studyTime: '≈60 min studiu + laborator',
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
  labs: [LAB_L1_3],
  sources: [
    { kind: 'man', ref: 'ls(1), mkdir(1), touch(1), cp(1), mv(1), rm(1), rmdir(1), file(1)' },
    { kind: 'man', ref: 'bash(1): Pathname Expansion, Brace Expansion, Tilde Expansion' },
    { kind: 'doc', ref: 'GNU Coreutils manual (info coreutils): „Basic operations” — de verificat la review' },
    { kind: 'doc', ref: 'Red Hat Enterprise Linux 10 — „Configuring basic system settings” (docs.redhat.com), de verificat la review' },
  ],
};
