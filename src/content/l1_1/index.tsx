import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_1 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="shell">Shell-ul</G> este programul cu care vorbești cu Linux prin text. Tastezi o <b>linie de comandă</b> în forma <code>comandă [opțiuni] [argumente]</code>,
            apeși Enter, iar shell-ul o interpretează și rulează programul cerut. Fiecare comandă lasă un <G id="exit-status">cod de ieșire</G> (0 = succes) pe care îl poți citi cu <code>echo $?</code>.
          </p>
          <p>
            Obiectivul oficial acoperit: <i>„Access a shell prompt and issue commands with correct syntax”</i>. La EX200 nu există interfață grafică de ajutor: totul trece prin acest prompt,
            deci sintaxa corectă și citirea atentă a promptului sunt abilități de bază.
          </p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un sistem de operare are un <b>nucleu</b> (kernel) care gestionează procesorul, memoria și dispozitivele. Programele obișnuite nu vorbesc direct cu hardware-ul: cer nucleului servicii.
            Dar cineva trebuie să pornească aceste programe. Acel „cineva” este shell-ul: un program obișnuit (pe RHEL, <G id="bash">bash</G>) a cărui singură treabă este să citească comenzi și să pornească programe.
          </p>
          <Analogy>shell-ul este un ghișeu: tu completezi o cerere scrisă după o formă fixă (comandă + detalii), funcționarul o citește, o trimite la departamentul potrivit (programul) și îți aduce un răspuns plus un „stampil” de reușită sau eșec (exit status).</Analogy>
          <p>
            <b>Ce problemă rezolvă?</b> Interfețele grafice acoperă doar ce au prevăzut autorii lor. Linia de comandă este compozabilă: orice program poate fi pornit cu orice parametri, rezultatul unuia poate alimenta altul (vezi L1.5),
            iar o secvență de comenzi se poate salva într-un script (capitolul C3). Un server RHEL de producție nu are, de regulă, desktop instalat și este administrat de la distanță, prin SSH, exclusiv în shell.
          </p>
          <p>
            <b>Ce s-ar întâmpla fără el?</b> Ar trebui un program grafic pentru fiecare sarcină, nimic nu s-ar putea automatiza, iar administrarea prin conexiuni lente sau fără ecran ar fi practic imposibilă.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <p>Bucla pe care o execută bash pentru fiecare linie introdusă (descriere simplificată, conform manualului bash, secțiunile „SHELL GRAMMAR”, „EXPANSION” și „COMMAND EXECUTION ENVIRONMENT”):</p>
          <ol>
            <li><b>Afișează <G id="prompt">promptul</G></b> și așteaptă o linie. Ce vezi este valoarea variabilei <code>PS1</code>.</li>
            <li><b>Citește linia și o împarte în cuvinte</b> (tokens), după spații, ținând cont de citare (<G id="quoting">quoting</G>). Aici se înlocuiesc și <G id="alias">alias-urile</G>.</li>
            <li><b>Face expandări</b>: <code>$VARIABILĂ</code> devine valoarea ei, <code>*</code> devine lista fișierelor potrivite, <code>~</code> devine directorul home. Comanda primește deja textul expandat, nu <code>*</code>.</li>
            <li><b>Caută comanda</b>, în această ordine: o funcție shell, o comandă internă (<G id="builtin">builtin</G>), apoi un fișier executabil găsit în directoarele din <G id="path-env">PATH</G>. Dacă numele conține <code>/</code>, nu mai caută: folosește calea dată.</li>
            <li><b>Execută.</b> Pentru un program extern, shell-ul creează un proces copil (fork), încarcă programul în el (exec) și așteaptă să se termine. Pentru un builtin rulează în propriul proces.</li>
            <li><b>Salvează <G id="exit-status">exit status</G></b> în <code>$?</code> și revine la pasul 1.</li>
          </ol>
          <p>
            De aceea <code>cd</code> este un builtin: dacă ar fi un program extern, ar schimba directorul curent al procesului copil, care dispare imediat după execuție; shell-ul tău ar rămâne unde era.
          </p>
          <h4>Anatomia unei linii de comandă</h4>
          <CodeBlock title="structura" code={`comandă  [opțiuni]  [argumente]\nls       -l -a      /etc`} />
          <Table head={['Parte', 'Rol', 'Exemplu']} rows={[
            [<b>comandă</b>, 'Primul cuvânt: ce program (sau builtin) se rulează', <code>ls</code>],
            [<b>opțiune</b>, 'Modifică comportamentul; formă scurtă (-l) sau lungă (--all)', <code>-l</code>],
            [<b>argument</b>, 'Pe ce lucrează comanda: fișier, director, text, utilizator', <code>/etc</code>],
          ]} />
          <p>Reguli de sintaxă care contează la examen:</p>
          <ul>
            <li><b>Majusculele contează</b>: <code>LS</code> nu este <code>ls</code>, iar <code>/etc/Passwd</code> nu este <code>/etc/passwd</code>.</li>
            <li><b>Spațiile separă cuvintele</b>: <code>ls -l/etc</code> este un singur cuvânt greșit; <code>ls -l /etc</code> sunt trei.</li>
            <li><b>Opțiuni scurte combinate</b>: <code>ls -la</code> înseamnă <code>ls -l -a</code>. Opțiunile lungi nu se combină: <code>--all --human-readable</code>.</li>
            <li><b>Separatorul <code>--</code></b> încheie opțiunile; util dacă un fișier începe cu <code>-</code> (<code>rm -- -fisier</code>).</li>
            <li><b>Stiluri vechi</b>: <code>tar xvf arhivă.tar</code> și <code>ps aux</code> funcționează fără cratimă, fiindcă respectă convenții istorice. Nu generaliza.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Procese</b> (C4, L4.4): fiecare comandă externă devine un proces cu PID propriu; shell-ul este procesul părinte.</li>
            <li><b>Variabile de mediu</b>: <code>PATH</code>, <code>HOME</code>, <code>PS1</code> sunt moștenite de procesele pornite din shell. Fișierele <code>/etc/profile</code> și <code>~/.bashrc</code> le setează la deschiderea sesiunii.</li>
            <li><b>Redirecționare și pipe</b> (L1.5): shell-ul conectează intrarea și ieșirea comenzilor înainte să le pornească.</li>
            <li><b>Permisiuni și utilizatori</b> (L1.8, L9.x): comanda rulează cu identitatea ta; promptul <code>#</code> înseamnă root, fără restricțiile obișnuite.</li>
            <li><b>Documentație</b> (L1.2): <code>man</code> și <code>--help</code> îți spun sintaxa corectă a oricărei comenzi, ceea ce este singura „căutare pe internet” permisă la examen.</li>
            <li><b>Acces remote</b> (L1.11): o sesiune SSH este tot un shell, pornit pe altă mașină.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>La <b>orice sarcină de administrare</b>: cine ești, pe ce mașină, în ce director (<code>whoami</code>, <code>hostname</code>, <code>pwd</code>) înainte de a modifica ceva.</li>
            <li>Când o comandă <b>nu funcționează</b>: citești mesajul de eroare și exit status-ul înainte să încerci altceva.</li>
            <li>Când trebuie să <b>refolosești</b> o comandă lungă: istoric, Ctrl+R, editare pe linie.</li>
            <li>La examen: nu ai mouse-ul ca plasă de siguranță. Viteza vine din completare cu Tab, istoric și din citirea corectă a promptului.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Cum se citesc blocurile de mai jos">
          Platforma <b>nu rulează</b> nimic. Comenzile sunt explicate ca să le tastezi tu într-un terminal Linux. Output-urile sunt etichetate: aici toate sunt <b>Ilustrativ</b> (exemple construite; valorile pe sistemul tău vor diferi).
        </Callout>

        <h4>Orientare: cine, unde, pe ce mașină</h4>
        <CodeBlock title="comenzi" code={`whoami\nhostname\npwd\ndate\nuname -r`} explain={[
          ['whoami', 'afișează numele utilizatorului efectiv (fără opțiuni sau argumente).'],
          ['hostname', 'afișează numele mașinii. Schimbarea lui se face cu hostnamectl (L8.3), nu cu hostname, dacă vrei să fie persistentă.'],
          ['pwd', 'print working directory: directorul curent, ca cale absolută.'],
          ['date', 'data și ora sistemului, în fusul orar configurat.'],
          ['uname -r', 'uname = informații despre sistem; -r (--kernel-release) afișează versiunea nucleului.'],
        ]} />

        <h4>Ce este o comandă: type, command -v, help</h4>
        <CodeBlock title="comenzi" code={`type cd\ntype ls\ncommand -v ls\nhelp cd`} explain={[
          ['type NUME', 'arată cum interpretează bash numele: alias, builtin, funcție sau fișier (cu calea lui).'],
          ['command -v NUME', 'afișează calea sau definiția lui NUME; cod de ieșire non-zero dacă nu există. Util în scripturi.'],
          ['help cd', 'documentația unui builtin; builtin-urile nu au pagină man proprie (vezi man bash).'],
        ]} />

        <h4>Exit status și lanțuri de comenzi</h4>
        <CodeBlock title="comenzi" code={`ls /etc\necho $?\nls /nu-exista\necho $?\nmkdir test && cd test\nls /nu-exista || echo "a eșuat"\npwd ; whoami`} explain={[
          ['echo $?', '$? este exit status-ul comenzii precedente; echo îl afișează. Se resetează la fiecare comandă, deci îl citești imediat.'],
          ['A && B', 'rulează B doar dacă A a avut exit status 0.'],
          ['A || B', 'rulează B doar dacă A a avut exit status diferit de 0.'],
          ['A ; B', 'rulează B după A, indiferent de rezultat.'],
        ]} />

        <h4>Citare (quoting)</h4>
        <CodeBlock title="comenzi" code={`echo salut     lume\necho "salut     lume"\nNUME=Ana\necho "Salut, $NUME"\necho 'Salut, $NUME'\necho Salut,\\ $NUME\ntouch "fisier cu spatii"`} explain={[
          ['echo salut     lume', 'fără citare, shell-ul împarte în cuvinte și echo primește doi argumente; spațiile multiple dispar.'],
          ['"..." (ghilimele duble)', 'păstrează spațiile ca un singur argument, dar permit expandarea lui $NUME.'],
          ['\'...\' (apostrofuri)', 'totul literal: $NUME rămâne text.'],
          ['\\ (backslash)', 'protejează caracterul următor (aici un spațiu sau un $).'],
          ['NUME=Ana', 'atribuire de variabilă: fără spații în jurul lui =.'],
        ]} />

        <h4>Editare și istoric</h4>
        <Table head={['Acțiune', 'Tastă / comandă']} rows={[
          ['Completare nume (comandă, fișier)', <code>Tab</code>],
          ['Comanda anterioară / următoare', <code>↑ / ↓</code>],
          ['Căutare în istoric', <code>Ctrl+R</code>],
          ['Începutul / sfârșitul liniei', <><code>Ctrl+A</code> / <code>Ctrl+E</code></>],
          ['Șterge până la începutul / sfârșitul liniei', <><code>Ctrl+U</code> / <code>Ctrl+K</code></>],
          ['Șterge cuvântul dinaintea cursorului', <code>Ctrl+W</code>],
          ['Curăță ecranul', <><code>Ctrl+L</code> (sau <code>clear</code>)</>],
          ['Întrerupe comanda curentă', <code>Ctrl+C</code>],
          ['Sfârșit de intrare / ieșire din shell', <><code>Ctrl+D</code> (sau <code>exit</code>)</>],
          ['Repetă ultima comandă / comanda cu numărul n', <><code>!!</code> / <code>!n</code> (vezi <code>history</code>)</>],
        ]} />
        <p>
          Combinația clasică la examen: <code>sudo !!</code> — repetă ultima comandă, cu <code>sudo</code> în față, după un „Permission denied”.
        </p>

        <h4>Fișiere de inițializare relevante</h4>
        <Table head={['Fișier', 'Rol']} rows={[
          [<code>/etc/profile</code>, 'se citește la sesiunile de tip login, pentru toți utilizatorii'],
          [<code>~/.bash_profile</code>, 'doar pentru utilizatorul respectiv, la login'],
          [<code>~/.bashrc</code>, 'la fiecare shell interactiv non-login (terminal deschis în desktop); aici se pun alias-urile personale'],
          [<code>~/.bash_history</code>, 'istoricul, scris la închiderea sesiunii'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Orientare" kind="session" label="illustrative" code={`[student@server1 ~]$ whoami\nstudent\n[student@server1 ~]$ pwd\n/home/student\n[student@server1 ~]$ cd /etc\n[student@server1 etc]$ su -\n...\n[root@server1 ~]#`} />
        <ul>
          <li><code>[student@server1 ~]$</code>: utilizatorul <code>student</code>, pe mașina <code>server1</code>, în directorul <code>~</code> (home-ul lui; după <code>cd /etc</code> apare doar numele ultimului director, <code>etc</code>, fiindcă promptul implicit RHEL folosește <code>\W</code>). Ultimul caracter, <code>$</code>, arată un utilizator obișnuit.</li>
          <li><code>[root@server1 ~]#</code>: același tip de prompt, dar <code>#</code> semnalizează root. Toate comenzile următoare au privilegii complete.</li>
        </ul>

        <CodeBlock title="Ce este o comandă" kind="session" label="illustrative" code={`[student@server1 ~]$ type cd\ncd is a shell builtin\n[student@server1 ~]$ type ls\nls is aliased to \`ls --color=auto'\n[student@server1 ~]$ type -a ls\nls is aliased to \`ls --color=auto'\nls is /usr/bin/ls\n[student@server1 ~]$ type foobar\nbash: type: foobar: not found`} />
        <ul>
          <li><code>cd is a shell builtin</code> — comandă internă; nu există un fișier <code>cd</code> care să fie căutat în PATH.</li>
          <li><code>ls is aliased to …</code> — tastând <code>ls</code> rulezi de fapt <code>ls --color=auto</code>. Aliasul este definit de scripturile de inițializare; poate lipsi pe alt sistem.</li>
          <li><code>type -a</code> (all) arată toate variantele care s-ar potrivi, în ordinea căutării: întâi aliasul, apoi fișierul.</li>
          <li>Ultimul exemplu: numele nu este nici alias, nici builtin, nici fișier în PATH. Calea exactă a fișierului (<code>/usr/bin/ls</code>) poate diferi pe sistemul tău.</li>
        </ul>

        <CodeBlock title="Exit status" kind="session" label="illustrative" code={`[student@server1 ~]$ ls /etc/hostname\n/etc/hostname\n[student@server1 ~]$ echo $?\n0\n[student@server1 ~]$ ls /nu-exista\nls: cannot access '/nu-exista': No such file or directory\n[student@server1 ~]$ echo $?\n2\n[student@server1 ~]$ comandainexistenta\nbash: comandainexistenta: command not found\n[student@server1 ~]$ echo $?\n127`} />
        <ul>
          <li>Prima comandă a reușit: <code>0</code>. Rețineți: <code>echo $?</code> raportează comanda <i>dinainte</i> de <code>echo</code>.</li>
          <li><code>ls</code> pe o cale inexistentă iese cu <code>2</code> (conform paginii man a GNU ls, 2 = „serious trouble”, cum este un argument inaccesibil).</li>
          <li><code>command not found</code> → bash returnează <code>127</code> (convenție documentată în manualul bash). Un fișier găsit dar fără drept de execuție dă <code>126</code>.</li>
        </ul>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <p>Cum confirmi, manual, că ai înțeles și aplicat corect sintaxa:</p>
          <ul>
            <li><code>echo $?</code> imediat după comandă: <code>0</code> înseamnă că a reușit. Dacă comanda nu a afișat nimic, exit status-ul este singurul semnal clar.</li>
            <li><code>type nume</code> răspunde la „ce rulez de fapt?”. Dacă un alias sau o funcție „umbrește” un program, aici se vede.</li>
            <li><code>echo "$VAR"</code> arată valoarea unei variabile după atribuire; <code>alias</code> (fără argumente) listează alias-urile active.</li>
            <li>Înainte de orice modificare: <code>whoami</code>, <code>hostname</code>, <code>pwd</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Ce setezi într-un terminal (variabile, alias-uri, schimbarea directorului) trăiește <b>doar în acea sesiune de shell</b>. După închiderea terminalului sau după un reboot a dispărut.
          </p>
          <ul>
            <li>Alias personal persistent: linia <code>alias ll='ls -l'</code> în <code>~/.bashrc</code>, apoi <code>source ~/.bashrc</code> (sau o sesiune nouă). Verifici cu <code>alias ll</code> într-un terminal nou.</li>
            <li>Variabilă persistentă: <code>export NUME=valoare</code> în <code>~/.bash_profile</code> sau <code>~/.bashrc</code>.</li>
            <li>Setări pentru toți utilizatorii: fișiere în <code>/etc/profile.d/*.sh</code> (necesită root). La examen, cerințele de acest tip spun „persistent” sau „after reboot”.</li>
            <li>Istoricul: se scrie la închiderea normală a sesiunii; un terminal ucis brusc poate pierde comenzile recente.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>command not found</code>, 'greșeală de scriere, majuscule, programul nu e instalat sau nu e în PATH', <><code>type nume</code>, <code>echo $PATH</code></>, 'corectează numele; instalează pachetul (C2); pentru un script local folosește ./script'],
          [<code>No such file or directory</code>, 'cale greșită sau relativă din directorul nepotrivit', <><code>pwd</code>, <code>ls</code> pe directorul părinte</>, 'folosește calea corectă; Tab pentru completare'],
          [<code>Permission denied</code>, 'nu ai dreptul de citire/scriere/execuție', <><code>ls -l fișier</code>, <code>id</code></>, 'schimbă permisiunile (L1.8) sau folosește sudo, dacă sarcina o cere'],
          [<code>invalid option -- 'x'</code>, 'opțiune inexistentă sau scrisă greșit', <><code>comandă --help</code>, <code>man comandă</code></>, 'citește sinopsisul și corectează opțiunea'],
          [<>promptul rămâne blocat pe <code>&gt;</code></>, 'ghilimele sau apostrof nepereche; shell-ul așteaptă continuarea', 'verifică ultima linie tastată', <>apasă <code>Ctrl+C</code> și retastează comanda</>],
          ['o comandă se comportă „ciudat”', 'un alias sau o funcție umbrește comanda reală', <code>type -a comandă</code>, <><code>\comandă</code> (backslash) ignoră aliasul; sau scoate aliasul cu <code>unalias</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Spații în jurul lui <code>=</code> la alias sau variabilă: <code>alias ll = 'ls -l'</code> și <code>NUME = Ana</code> sunt greșite; corect: <code>alias ll='ls -l'</code> și <code>NUME=Ana</code>.</>,
          <>Citirea lui <code>$?</code> după altă comandă: orice comandă, inclusiv un <code>echo</code> intermediar, îi suprascrie valoarea.</>,
          <>Presupunerea că „funcționează în terminalul meu” = persistent. Alias-urile și variabilele tastate dispar la închiderea sesiunii.</>,
          <>Executarea unei comenzi ca root fără să observi <code>#</code> în prompt, sau în directorul greșit; verifică promptul înainte de <code>rm</code> sau altă operație distructivă.</>,
          <>Neglijarea majusculelor în nume de fișiere sau comenzi.</>,
          <>Argumente cu spații fără citare: <code>touch fisier cu spatii</code> creează trei fișiere.</>,
          <>Confuzia între builtin-uri și programe: <code>man cd</code> nu găsește nimic util; folosește <code>help cd</code> sau <code>man bash</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: login shell, shell interactiv și ordinea fișierelor de inițializare">
        <p>
          bash se comportă diferit în funcție de cum a fost pornit. Un <b>login shell</b> (autentificare la consolă, <code>ssh</code>, <code>su -</code>) citește <code>/etc/profile</code> și apoi primul existent dintre
          <code>~/.bash_profile</code>, <code>~/.bash_login</code>, <code>~/.profile</code>. Un shell <b>interactiv non-login</b> (un terminal deschis din desktop sau un <code>bash</code> tastat într-un shell existent)
          citește <code>~/.bashrc</code>. Pe RHEL, <code>~/.bash_profile</code> implicit apelează <code>~/.bashrc</code>, ca să obții același mediu în ambele cazuri.
          Un shell care rulează un script nu citește aceste fișiere decât dacă i se cere explicit (detalii: <code>man bash</code>, secțiunea INVOCATION).
        </p>
        <p>
          <b>Variabilă de shell vs variabilă de mediu.</b> <code>NUME=Ana</code> creează o variabilă vizibilă doar în shell-ul curent; <code>export NUME</code> o face variabilă de mediu, moștenită de procesele copil.
          Test: <code>bash -c 'echo $NUME'</code> afișează o linie goală dacă variabila nu este exportată.
        </p>
        <p>
          <b>Expandarea istoricului</b> (<code>!!</code>, <code>!n</code>) este o funcție a shell-ului interactiv, nu a scripturilor. Dacă nu ești sigur ce va rula <code>!n</code>, folosește <code>history</code> mai întâi sau <code>!n:p</code> (afișează fără să execute).
        </p>
      </DeepDive>
    </>
  );
}

export const L1_1: TopicModule = {
  id: 'L1.1',
  subtitle: 'Shell-ul: prompt, sintaxa comenzilor, exit status, citare, istoric',
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
  labs: [LAB_L1_1],
  sources: [
    { kind: 'man', ref: 'bash(1): SHELL GRAMMAR, EXPANSION, QUOTING, COMMAND EXECUTION, SHELL BUILTIN COMMANDS (type, help, alias), PS1 în PROMPTING' },
    { kind: 'man', ref: 'ls(1): EXIT STATUS' },
    { kind: 'man', ref: 'uname(1), hostname(1), date(1), whoami(1)' },
    { kind: 'doc', ref: 'Red Hat Enterprise Linux 10 — documentația „Configuring basic system settings” (docs.redhat.com), de verificat ca referință la review' },
  ],
};
