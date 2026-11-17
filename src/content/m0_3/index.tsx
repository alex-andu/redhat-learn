import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_M0_3A, LAB_M0_3B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pe un server Red Hat nu ai mouse și ferestre. Vorbești cu sistemul scriind <b>comenzi</b> într-un <G id="terminal">terminal</G>, iar un program numit <G id="shell">shell</G> (pe RHEL: <G id="bash">bash</G>) le citește, le „traduce” și pornește programele cerute.
            O comandă are forma <code>comandă [opțiuni] [argumente]</code>; după rulare lasă un <G id="exit-status">cod de ieșire</G> (0 = succes).
          </p>
          <p>
            Lecția este pentru <b>nivelul 0</b>: nu presupune că ai mai văzut un terminal. Parcurgem, în ordine: ce sunt terminalul, shell-ul și promptul; cum citești o linie de comandă; primele comenzi sigure (care doar citesc); cum caută shell-ul comenzile (<G id="path-env">PATH</G>); variabile, expandări, citare și istoric; cum ceri ajutor. Lecția L1.1 (capitolul C1, obiectiv oficial) reia și aprofundează sintaxa; aici construim fundația.
          </p>
          <p><b>Material de suport (neoficial):</b> M0.3 nu corespunde direct unui obiectiv EX200, dar fără el nu poți lucra la niciunul dintre cele 62.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un calculator are două feluri de interfață. Cea <b>grafică</b> (ferestre, icoane, mouse) este ușor de învățat, dar poate face doar ce a prevăzut programatorul ei. Cea <b>text</b> (linia de comandă, CLI = command-line interface) se învață mai greu, dar este exact, repetabilă și se poate automatiza: ce ai scris o dată poate fi salvat într-un fișier și rulat de o mie de ori sau pe o mie de servere.
          </p>
          <p>De aceea administratorii Linux lucrează în text. Pe un server de producție, de regulă, nici nu este instalat un desktop; mașina se administrează de la distanță, prin <G id="ssh">SSH</G>, doar prin shell. Și examenul EX200 este făcut în text.</p>

          <h4>Patru cuvinte care se confundă</h4>
          <Table head={['Termen', 'Ce este', 'Analogie']} rows={[
            [<b>terminal</b>, 'Fereastra (sau consola) prin care tastezi și citești text. Transportă caractere; nu înțelege comenzi.', 'Telefonul: transmite vocea, dar nu înțelege ce spui.'],
            [<b>shell</b>, 'Programul care citește linia, o interpretează și pornește programe. Există mai multe: bash, zsh, sh, fish.', 'Funcționarul de la ghișeu care citește cererea.'],
            [<b>bash</b>, 'Shell-ul implicit pe RHEL (Bourne Again SHell, din proiectul GNU).', 'Funcționarul concret de la ghișeul tău.'],
            [<b>prompt</b>, 'Textul afișat înaintea cursorului: „sunt gata de comandă”. La RHEL: [utilizator@gazdă director]$.', 'Lumina verde de la ghișeu.'],
          ]} />
          <Analogy>ghișeul de la o primărie. Cererea scrisă după o formă fixă este comanda; funcționarul este shell-ul; departamentul care rezolvă cererea este programul (<code>ls</code>, <code>cp</code>…); ștampila „admis/respins” este codul de ieșire. Dacă formularul este completat greșit (o literă în plus, un spațiu lipsă), funcționarul nu ghicește: respinge cererea.</Analogy>

          <h4>Cum s-a ajuns aici</h4>
          <p>
            Primul shell Unix (Thompson, 1971) a fost înlocuit de shell-ul Bourne (<code>sh</code>, 1977). Proiectul GNU a scris o variantă liberă, „Bourne Again SHell”, adică <b>bash</b> (1989), care a adăugat completarea cu Tab, istoric și editare pe linie. Pe RHEL, <code>/bin/sh</code> este o legătură către bash, care se comportă în mod compatibil POSIX când este chemat sub numele <code>sh</code>. Nu trebuie să memorezi istoria; reține doar că „shell” este categoria, iar bash este exemplarul pe care îl vei folosi.
          </p>
          <p><b>Ce s-ar întâmpla fără shell?</b> Ar trebui un program grafic separat pentru fiecare sarcină, nimic nu s-ar putea scrie în script (capitolul C3), iar administrarea prin conexiuni lente ar fi imposibilă.</p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Drumul unui caracter tastat</h4>
          <ol>
            <li>Apeși o tastă. <b>Terminalul</b> (emulatorul grafic, consola sau sesiunea SSH) trimite caracterul către shell printr-un fișier special de terminal (de exemplu <code>/dev/pts/0</code>; comanda <code>tty</code> îl afișează). Biblioteca <i>readline</i> din bash gestionează editarea liniei: săgeți, Backspace, Tab, Ctrl+R.</li>
            <li>La Enter, bash primește <b>linia întreagă</b> și o procesează.</li>
            <li>Rezultatul comenzii (<G id="stdout">ieșirea standard</G>) și erorile (<G id="stderr">eroarea standard</G>) se întorc prin același terminal pe ecran.</li>
          </ol>

          <h4>Ce face bash cu o linie (pe pași)</h4>
          <p>Descriere simplificată, conform manualului bash (secțiunile „SHELL GRAMMAR”, „EXPANSION”, „COMMAND EXECUTION”):</p>
          <ol>
            <li><b>Împarte linia în cuvinte</b> (tokens), după spații, ținând seama de citare (<G id="quoting">quoting</G>) și de operatorii de control (<G id="control-operator">;  &amp;&amp;  ||  |</G>). Primul cuvânt este comanda; restul sunt opțiuni și argumente.</li>
            <li><b>Înlocuiește <G id="alias">alias-urile</G></b> (dacă primul cuvânt este un alias).</li>
            <li><b>Face <G id="shell-expansion">expandările</G></b>: acolade <code>{'{a,b}'}</code>, tilde <code>~</code>, variabile <code>$VAR</code>, substituția de comenzi <code>$(…)</code>, apoi <G id="word-splitting">împărțirea în cuvinte</G> și <G id="glob">globbing</G> (<code>*</code>, <code>?</code>, <code>[ ]</code>). <b>Comanda primește rezultatul gata expandat.</b> Nu ea „înțelege” <code>*</code>: shell-ul a înlocuit deja asteriscul cu lista de fișiere.</li>
            <li><b>Caută comanda</b> în ordinea: alias → cuvânt rezervat (<G id="reserved-word">if, for</G>) → funcție shell → comandă internă (<G id="builtin">builtin</G>) → fișier executabil într-un director din <G id="path-env">PATH</G>. Dacă numele conține <code>/</code>, nu se mai caută: se folosește calea dată.</li>
            <li><b>Execută.</b> Pentru un program extern shell-ul face <code>fork</code> (un proces copil identic), iar copilul face <code>exec</code> (își înlocuiește conținutul cu programul cerut); părintele așteaptă. Un builtin rulează chiar în procesul shell-ului. Detalii despre procese: M0.5 și L4.4.</li>
            <li>La final, shell-ul păstrează <b>exit status-ul</b> în <code>$?</code> și afișează din nou promptul.</li>
          </ol>
          <p>
            Consecință importantă: <code>cd</code> trebuie să fie builtin. Dacă ar fi program extern, ar schimba directorul <i>procesului copil</i>, care se termină imediat; shell-ul tău ar rămâne unde era.
          </p>

          <h4>Anatomia unei comenzi</h4>
          <CodeBlock title="structura" code={`comandă   [opțiuni]   [argumente]\nls        -l -a       /etc\ncp        -v          sursa.txt  destinatie.txt`} />
          <Table head={['Parte', 'Rol', 'Reguli']} rows={[
            [<b>comandă</b>, 'Programul sau builtin-ul.', 'Majusculele contează: LS nu este ls.'],
            [<b>opțiune (flag)</b>, 'Schimbă comportamentul. Forma scurtă: o cratimă și o literă (-l). Forma lungă: două cratime și un cuvânt (--all).', 'Cele scurte se pot lipi: -la = -l -a. Cele lungi nu. Unele opțiuni cer o valoare: -n 5 sau --lines=5.'],
            [<b>argument</b>, 'Pe ce lucrează comanda: fișier, director, utilizator, text.', 'Spațiile separă cuvintele; un nume cu spații se citează.'],
          ]} />
          <p>
            Regula practică: <b>opțiunile modifică „cum”, argumentele spun „pe ce”</b>. Dacă nu ești sigur ce face o opțiune, nu o ghici: <code>man comandă</code> sau <code>comandă --help</code> (vezi mai jos și L1.2).
          </p>

          <h4>Cele cinci feluri de „comenzi”</h4>
          <Table head={['Fel', 'Ce este', 'Exemplu', 'Cum îl recunoști']} rows={[
            [<b>alias</b>, 'Prescurtare definită de utilizator sau de sistem.', <code>ls → ls --color=auto</code>, <><code>type ls</code> → „aliased to”</>],
            [<b>cuvânt rezervat</b>, 'Parte a limbajului shell.', <code>if, for, while</code>, <><code>type if</code> → „shell keyword”</>],
            [<b>funcție</b>, 'Mic program scris în shell, definit în sesiune.', <code>—</code>, <><code>type nume</code> → „is a function”</>],
            [<b>builtin</b>, 'Comandă internă a bash-ului.', <code>cd, echo, type, export</code>, <><code>type cd</code> → „shell builtin”</>],
            [<b>fișier extern</b>, 'Program pe disc, găsit prin PATH.', <code>/usr/bin/ls</code>, <><code>type ls</code>, <code>which ls</code></>],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Procese</b> (M0.5, L4.4): fiecare comandă externă este un proces nou, cu PID propriu; shell-ul este părintele lui.</li>
            <li><b>Variabile de mediu</b>: <code>HOME</code>, <code>PATH</code>, <code>USER</code>, <code>LANG</code> sunt moștenite de procesele pornite din shell. Fișierele de pornire ale shell-ului (<code>/etc/profile</code>, <code>~/.bashrc</code>) le stabilesc.</li>
            <li><b>Sistemul de fișiere</b> (M0.4): fiecare comandă are un <i>director curent</i>; căile relative pornesc de acolo.</li>
            <li><b>Redirecționare și pipe</b> (L1.5): shell-ul conectează intrările și ieșirile comenzilor înainte să le pornească.</li>
            <li><b>Permisiuni și utilizatori</b> (L1.8, C9): comanda rulează cu identitatea ta; ceea ce poți face depinde de ea. <code>#</code> în prompt = root.</li>
            <li><b>Documentație</b> (L1.2): <code>man</code>, <code>--help</code>, <code>info</code>, <code>/usr/share/doc</code>.</li>
            <li><b>Scripturi</b> (C3): un script este o înșiruire de comenzi exact ca cele de azi, salvate într-un fișier.</li>
            <li><b>SSH</b> (L1.11): o sesiune SSH deschide un shell pe altă mașină; tot ce înveți aici se aplică identic.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Înainte de orice modificare: <b>cine ești, pe ce mașină, în ce director</b> (<code>whoami</code>, <code>hostname</code>, <code>pwd</code>). Cele mai grave greșeli (<code>rm</code> în directorul greșit, pe serverul greșit) apar când sari peste acest pas.</li>
            <li>Când o comandă <b>eșuează</b>: citești mesajul și exit status-ul înainte de orice altă încercare.</li>
            <li>Când trebuie să <b>refolosești</b> o comandă lungă: istoric, săgeata sus, Ctrl+R.</li>
            <li>Când nu știi cum se numește o comandă sau o opțiune: <code>man -k cuvânt</code>, <code>--help</code>.</li>
            <li>La examen: nu ai mouse-ul ca plasă de siguranță, iar timpul este limitat. Viteza vine din Tab, istoric și din citirea corectă a promptului.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Cum se citesc blocurile de mai jos">
          Platforma <b>nu rulează</b> nimic. Comenzile sunt explicate ca să le tastezi tu într-un terminal Linux (ideal o VM RHEL 10 sau compatibilă, vezi M0.1). Toate comenzile din această secțiune <b>doar citesc</b> informații sau creează fișiere în directorul tău home; nimic nu modifică sistemul. Output-urile sunt etichetate: aici toate sunt <b>Ilustrativ</b>.
        </Callout>

        <h4>6.1 Cum obții un terminal</h4>
        <ul>
          <li><b>Desktop grafic (GNOME):</b> deschide aplicația „Terminal” (sau Activities → tastezi „terminal”).</li>
          <li><b>Consola text:</b> pe o mașină fizică sau VM, Ctrl+Alt+F2…F6 comută la console text (login: utilizator, apoi parolă; parola nu se afișează deloc). Ctrl+Alt+F1 sau F2 revine la grafic, în funcție de sistem.</li>
          <li><b>De la distanță:</b> <code>ssh utilizator@adresă</code> (L1.11).</li>
          <li><b>Consola VM:</b> dacă lucrezi în VM, fereastra hypervisor-ului este o consolă; de regulă primești direct promptul de login.</li>
        </ul>
        <p>După autentificare vezi un prompt de forma <code>[student@server1 ~]$</code>. Citește-l ca pe o propoziție: „sunt <b>student</b>, pe mașina <b>server1</b>, în directorul <b>~</b> (home-ul meu), și sunt un utilizator obișnuit (<code>$</code>)”. Un <code>#</code> în loc de <code>$</code> înseamnă root: sistemul nu te mai protejează de greșeli.</p>

        <h4>6.2 Primele comenzi: cine, unde, pe ce mașină, ce versiune</h4>
        <CodeBlock title="comenzi" code={`whoami\nid\nhostname\npwd\ndate\nuname -r\ncat /etc/redhat-release\nclear`} explain={[
          ['whoami', 'afișează numele utilizatorului efectiv. Nu are opțiuni sau argumente.'],
          ['id', 'afișează UID-ul (numărul utilizatorului), GID-ul și grupurile; detalii în C9.'],
          ['hostname', 'numele mașinii. Se schimbă persistent cu hostnamectl (L8.3), nu cu hostname.'],
          ['pwd', 'print working directory: directorul curent, ca cale absolută (începe cu /).'],
          ['date', 'data și ora sistemului, în fusul orar configurat.'],
          ['uname -r', 'uname = informații despre sistem; -r (--kernel-release) afișează versiunea nucleului.'],
          ['cat /etc/redhat-release', 'cat = afișează conținutul unui fișier text; /etc/redhat-release conține versiunea RHEL pe o singură linie.'],
          ['clear', 'curăță ecranul (la fel ca Ctrl+L); nu șterge istoricul.'],
        ]} />

        <h4>6.3 Citirea și interpretarea unei comenzi cu opțiuni: ls</h4>
        <p><code>ls</code> (list) afișează conținutul unui director. Este comanda ideală de învățat anatomia, pentru că are multe opțiuni utile și nu modifică nimic.</p>
        <CodeBlock title="comenzi" code={`ls\nls -l\nls -a\nls -la\nls -lh /etc\nls -ld /etc\nls -lt /etc | head\nls --all --human-readable -l\nls -R /etc/ssh`} explain={[
          ['ls', 'fără argumente listează directorul curent; ascunde fișierele al căror nume începe cu punct.'],
          ['-l', 'format lung: tipul și permisiunile, numărul de legături, proprietar, grup, dimensiune, data modificării, nume.'],
          ['-a (--all)', 'include fișierele ascunse (numele încep cu „.”), inclusiv „.” și „..”.'],
          ['-la', 'opțiunile scurte se pot lipi: echivalent cu -l -a.'],
          ['-h (--human-readable)', 'dimensiuni în K, M, G în loc de octeți; are efect doar împreună cu -l (sau -s).'],
          ['-d (--directory)', 'arată directorul însuși, nu conținutul lui; fără -d, ls -l /etc listează tot ce este în /etc.'],
          ['-t', 'sortează după data modificării, cele mai noi întâi. „| head” păstrează primele 10 linii (pipe: L1.5).'],
          ['--all --human-readable', 'formele lungi nu se lipesc; fiecare are cratimă dublă.'],
          ['-R (--recursive)', 'coboară și în subdirectoare.'],
        ]} />

        <h4>6.4 Ce fel de comandă este? type, which, command -v, help</h4>
        <CodeBlock title="comenzi" code={`type cd\ntype ls\ntype -a ls\ntype if\nwhich ls\ncommand -v ls\nhelp cd | head -5`} explain={[
          ['type NUME', 'arată cum interpretează bash numele: alias, cuvânt rezervat, builtin, funcție sau fișier.'],
          ['type -a NUME', '-a (all): toate interpretările, în ordinea căutării.'],
          ['which NUME', 'caută NUME doar în PATH și afișează calea fișierului; nu știe de builtin-uri, alias-uri sau funcții (comportamentul exact diferă între implementări).'],
          ['command -v NUME', 'afișează calea sau definiția lui NUME; cod non-zero dacă nu există; potrivit în scripturi.'],
          ['help cd', 'documentația unui builtin: builtin-urile nu au pagină man proprie. Lista tuturor: help.'],
        ]} />

        <h4>6.5 Ajutor: --help, man, apropos</h4>
        <CodeBlock title="comenzi" code={`ls --help | head -20\nman ls\nman -k "disk usage"\nwhatis ls\ninfo coreutils`} explain={[
          ['comandă --help', 'rezumat scurt al sintaxei și al opțiunilor, afișat direct. Nu toate comenzile îl au; builtin-urile folosesc help.'],
          ['man ls', 'manualul complet, în pager (less). Se navighează cu spațiu (pagină jos), b (pagină sus), /text (caută), n (următoarea potrivire), q (ieșire). Secțiunile: NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES, SEE ALSO.'],
          ['man -k "disk usage"', '-k (aceeași funcție ca apropos): caută cuvinte în titlurile paginilor man; potrivit când nu știi numele comenzii. Necesită ca baza de date mandb să fie construită.'],
          ['whatis ls', 'o linie cu descrierea comenzii.'],
          ['info coreutils', 'documentația GNU în format info, adesea mai bogată decât man pentru utilitarele GNU.'],
        ]} />
        <p>
          Cum citești <b>SYNOPSIS</b>: <code>ls [OPTION]... [FILE]...</code> înseamnă că opțiunile sunt facultative (parantezele pătrate), iar <code>...</code> arată că se pot repeta. Un <code>|</code> înseamnă „sau”. Textul în MAJUSCULE (FILE) este un loc rezervat pe care îl înlocuiești.
        </p>

        <h4>6.6 Variabile și mediu</h4>
        <CodeBlock title="comenzi" code={`echo $HOME\necho $USER\necho $SHELL\nprintenv HOME\nenv | sort | head\nNUME=Ana\necho "Salut, $NUME"\nbash -c 'echo "[$NUME]"'\nexport NUME\nbash -c 'echo "[$NUME]"'\nunset NUME\necho "[$NUME]"`} explain={[
          ['echo $HOME', 'echo afișează argumentele; $HOME este expandat de shell înainte. HOME = directorul tău personal.'],
          ['printenv HOME', 'afișează valoarea unei variabile de MEDIU (nu a uneia simple de shell).'],
          ['env | sort | head', 'env listează tot mediul; sort le ordonează; head păstrează primele 10.'],
          ['NUME=Ana', 'atribuire: FĂRĂ spații în jurul lui =. Variabilă simplă de shell: o vede doar shell-ul curent.'],
          ['bash -c \'echo "[$NUME]"\'', 'pornește un shell copil (-c: rulează textul dat). Apostrofurile împiedică shell-ul tău să expandeze $NUME; îl expandează copilul. Primul apel arată [], fiindcă variabila nu este exportată.'],
          ['export NUME', 'o transformă în variabilă de mediu: copiii ei o moștenesc. Al doilea apel arată [Ana].'],
          ['unset NUME', 'șterge variabila.'],
        ]} />

        <h4>6.7 PATH: cum găsește shell-ul programele</h4>
        <CodeBlock title="comenzi" code={`echo $PATH\necho $PATH | tr ':' '\\n'\ntype ls\n/usr/bin/ls /etc\nPATH=$PATH:/opt/exemplu\necho $PATH`} explain={[
          ['echo $PATH', 'lista de directoare separate prin „:”, parcurse în ordine, până la prima potrivire.'],
          ['tr \':\' \'\\n\'', 'tr înlocuiește caractere: aici fiecare „:” devine linie nouă, ca să citești directoarele pe rând.'],
          ['/usr/bin/ls /etc', 'o comandă cu cale completă ocolește căutarea în PATH.'],
          ['PATH=$PATH:/opt/exemplu', 'adaugă un director la sfârșit, doar pentru sesiunea curentă; redeschizi terminalul și dispare.'],
        ]} />
        <p>
          Directorul curent <b>nu</b> este în PATH, din motive de securitate. De aceea un script din directorul curent se rulează cu <code>./script.sh</code>, nu cu <code>script.sh</code>.
        </p>

        <h4>6.8 Expandări: ce face shell-ul înainte de comandă</h4>
        <CodeBlock title="comenzi" code={`mkdir -p ~/m03 && cd ~/m03\ntouch a1.txt a2.txt b1.log notițe.md\necho *\necho *.txt\necho a?.txt\necho [ab]1.*\necho {rosu,verde,albastru}\necho fisier{1..3}.txt\necho ~\necho "Azi este $(date +%A)"\necho 'Nu expandează: $HOME $(date)'\ntouch "raport lunar.txt"\nls -1`} explain={[
          ['mkdir -p ~/m03 && cd ~/m03', '-p creează directorul (și părinții lipsă) fără eroare dacă există; && rulează cd doar dacă mkdir a reușit.'],
          ['touch a1.txt …', 'creează fișiere goale (sau actualizează ora unui fișier existent).'],
          ['echo *', 'shell-ul înlocuiește * cu toate numele din directorul curent (fără cele ascunse); echo doar le afișează. Dovada că expandarea o face shell-ul, nu comanda.'],
          ['*.txt', '* = orice șir (inclusiv gol).'],
          ['a?.txt', '? = exact un caracter.'],
          ['[ab]1.*', '[…] = un caracter din set; aici a1.txt și b1.log.'],
          ['{rosu,verde,albastru}', 'expandare cu acolade: generează cuvinte, fără să verifice existența fișierelor.'],
          ['{1..3}', 'secvență numerică: fisier1.txt fisier2.txt fisier3.txt.'],
          ['echo ~', '~ devine /home/utilizator.'],
          ['$(date +%A)', 'substituție de comandă: ieșirea comenzii înlocuiește construcția. +%A cere ziua săptămânii.'],
          ['\'…\'', 'în apostrofuri nu se expandează nimic; în ghilimele duble se expandează $VAR și $(...), dar nu * sau ~.'],
          ['touch "raport lunar.txt"', 'ghilimelele păstrează spațiul în nume: un singur fișier.'],
          ['ls -1', '-1 (cifra unu): un nume pe linie.'],
        ]} />

        <h4>6.9 Citare (quoting)</h4>
        <Table head={['Formă', 'Efect', 'Exemplu și rezultat']} rows={[
          [<code>fără citare</code>, 'cuvinte separate la spațiu; * ? $ ~ expandate', <><code>echo a   b</code> → <code>a b</code></>],
          [<code>"…"</code>, 'un singur argument; se expandează $VAR și $(…)', <><code>echo "a   b $USER"</code> → <code>a   b student</code></>],
          [<code>'…'</code>, 'literal, nimic nu se expandează', <><code>echo '$USER'</code> → <code>$USER</code></>],
          [<code>\</code>, 'protejează caracterul următor', <><code>echo \$USER</code> → <code>$USER</code></>],
        ]} />

        <h4>6.10 Operatori de control și exit status</h4>
        <CodeBlock title="comenzi" code={`ls /etc/hostname\necho $?\nls /nu-exista\necho $?\nmkdir -p ~/m03/d1 && echo "creat"\nls /nu-exista || echo "a eșuat"\ndate ; whoami ; pwd\nsleep 30 &\njobs`} explain={[
          ['echo $?', '$? = exit status-ul comenzii precedente; se suprascrie la fiecare comandă, deci îl citești imediat.'],
          ['A && B', 'B rulează doar dacă A a ieșit cu 0.'],
          ['A || B', 'B rulează doar dacă A a ieșit cu valoare diferită de 0.'],
          ['A ; B ; C', 'rulează pe rând, indiferent de rezultate.'],
          ['sleep 30 &', '& trimite comanda în fundal; promptul revine imediat. jobs listează sarcinile din fundal; fg o aduce în prim-plan; Ctrl+C o oprește.'],
        ]} />

        <h4>6.11 Istoric și scurtături de tastatură</h4>
        <Table head={['Acțiune', 'Tastă / comandă']} rows={[
          ['Completare (comandă, cale, opțiune)', <code>Tab</code>],
          ['Variante de completare', <><code>Tab Tab</code></>],
          ['Comanda anterioară / următoare', <code>↑ / ↓</code>],
          ['Căutare în istoric (tastezi o parte din comandă)', <code>Ctrl+R</code>],
          ['Început / sfârșit de linie', <><code>Ctrl+A</code> / <code>Ctrl+E</code></>],
          ['Șterge de la cursor până la început / sfârșit de linie', <><code>Ctrl+U</code> / <code>Ctrl+K</code></>],
          ['Șterge cuvântul din stânga cursorului', <code>Ctrl+W</code>],
          ['Un cuvânt înapoi / înainte', <><code>Alt+B</code> / <code>Alt+F</code></>],
          ['Curăță ecranul', <code>Ctrl+L</code>],
          ['Oprește comanda curentă', <code>Ctrl+C</code>],
          ['Sfârșit de intrare; închide shell-ul pe linie goală', <code>Ctrl+D</code>],
          ['Suspendă comanda curentă (reia cu fg)', <code>Ctrl+Z</code>],
          ['Lista istoricului / repetă ultima comandă', <><code>history</code> / <code>!!</code></>],
          ['Ultima comandă cu sudo în față', <code>sudo !!</code>],
        ]} />

        <h4>6.12 Fișierele de pornire ale shell-ului și alias-urile</h4>
        <CodeBlock title="comenzi" code={`alias\nalias ll='ls -l'\nll /etc | head -3\nunalias ll\nls -a ~ | grep bash\ncat ~/.bashrc\nsource ~/.bashrc`} explain={[
          ['alias', 'fără argumente listează alias-urile active.'],
          ['alias ll=\'ls -l\'', 'definește un alias doar pentru sesiunea curentă; fără spații lângă =.'],
          ['unalias ll', 'șterge aliasul din sesiune.'],
          ['ls -a ~ | grep bash', 'arată fișierele ascunse legate de bash din home: .bashrc, .bash_profile, .bash_logout, .bash_history.'],
          ['source ~/.bashrc', 'rulează fișierul în shell-ul curent: schimbările se aplică imediat. Sinonim: . ~/.bashrc.'],
        ]} />
        <Table head={['Fișier', 'Când se citește', 'Ce pui în el']} rows={[
          [<code>/etc/profile</code>, 'la login (toți utilizatorii)', 'setări globale; adaugi fișiere în /etc/profile.d/*.sh'],
          [<code>~/.bash_profile</code>, 'la login, pentru utilizatorul respectiv', 'variabile; pe RHEL apelează de obicei ~/.bashrc'],
          [<code>~/.bashrc</code>, 'la fiecare shell interactiv non-login (terminal deschis în desktop)', 'alias-uri, funcții, prompt'],
          [<code>~/.bash_logout</code>, 'la ieșire', 'curățenie'],
          [<code>~/.bash_history</code>, 'se scrie la închiderea sesiunii', 'istoricul comenzilor'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Prompt și orientare" kind="session" label="illustrative" code={`[student@server1 ~]$ whoami\nstudent\n[student@server1 ~]$ id\nuid=1000(student) gid=1000(student) groups=1000(student),10(wheel)\n[student@server1 ~]$ pwd\n/home/student\n[student@server1 ~]$ cd /etc\n[student@server1 etc]$ pwd\n/etc`} />
        <ul>
          <li><code>[student@server1 ~]$</code>: utilizatorul <code>student</code>, mașina <code>server1</code>, directorul <code>~</code>. După <code>cd /etc</code> promptul arată doar ultimul nume din cale, <code>etc</code>; calea întreagă o dă <code>pwd</code>.</li>
          <li><code>uid=1000(student)</code>: numărul și numele utilizatorului; <code>groups=…(wheel)</code>: grupurile. A fi în <code>wheel</code> este modul obișnuit prin care primești dreptul de <code>sudo</code> pe RHEL (L9.4). Valorile (1000, grupurile) sunt exemplificative.</li>
        </ul>

        <CodeBlock title="ls -l, câmp cu câmp" kind="session" label="illustrative" code={`[student@server1 ~]$ ls -l /etc/hosts /etc/ssh\n-rw-r--r--. 1 root root  158 Jun  7  2024 /etc/hosts\n\n/etc/ssh:\ntotal 612\n-rw-r--r--. 1 root root 581843 Jan 10 09:12 moduli\n-rw-r--r--. 1 root root   1921 Jan 10 09:12 ssh_config\ndrwxr-xr-x. 2 root root     28 Jan 10 09:12 ssh_config.d\n-rw-------. 1 root root   3667 Jan 10 09:12 sshd_config`} />
        <Table head={['Coloană', 'Exemplu', 'Sens']} rows={[
          ['1 · tip + permisiuni', <code>-rw-r--r--.</code>, 'primul caracter: tipul (- fișier, d director, l legătură); următoarele nouă: rwx pentru proprietar, grup, ceilalți (L1.8). Punctul final: există un context SELinux (C10).'],
          ['2 · legături', <code>1</code>, 'numărul de nume (hard link) ale fișierului (L1.7).'],
          ['3 · proprietar', <code>root</code>, 'utilizatorul care deține fișierul.'],
          ['4 · grup', <code>root</code>, 'grupul care deține fișierul.'],
          ['5 · dimensiune', <code>158</code>, 'octeți (cu -h: K, M, G).'],
          ['6 · data modificării', <code>Jun  7  2024</code>, 'ora sau anul, în funcție de vârsta fișierului.'],
          ['7 · nume', <code>hosts</code>, 'numele fișierului.'],
        ]} />
        <p><code>total 612</code> este suma blocurilor ocupate de fișierele listate (nu un număr de fișiere). Valorile, datele și dimensiunile de mai sus sunt exemplificative; pe sistemul tău vor diferi.</p>

        <CodeBlock title="type și which" kind="session" label="illustrative" code={`[student@server1 ~]$ type cd\ncd is a shell builtin\n[student@server1 ~]$ type ls\nls is aliased to \`ls --color=auto'\n[student@server1 ~]$ type -a ls\nls is aliased to \`ls --color=auto'\nls is /usr/bin/ls\n[student@server1 ~]$ type if\nif is a shell keyword\n[student@server1 ~]$ type foobar\nbash: type: foobar: not found`} />
        <ul>
          <li><code>shell builtin</code>: comandă internă, nu există fișier de căutat în PATH.</li>
          <li><code>aliased to</code>: tastezi <code>ls</code>, dar rulează <code>ls --color=auto</code>. Alias-urile apar pe sistemul tău dacă scripturile de pornire le definesc.</li>
          <li><code>type -a</code> arată toate variantele în ordinea căutării: întâi aliasul, apoi fișierul.</li>
          <li>Ultimul exemplu: numele nu este nici alias, nici builtin, nici fișier în PATH.</li>
        </ul>

        <CodeBlock title="expandări" kind="session" label="illustrative" code={`[student@server1 m03]$ echo *\na1.txt a2.txt b1.log notițe.md\n[student@server1 m03]$ echo *.txt\na1.txt a2.txt\n[student@server1 m03]$ echo {rosu,verde}\nrosu verde\n[student@server1 m03]$ echo "Azi este $(date +%A)"\nAzi este Tuesday\n[student@server1 m03]$ echo '$HOME'\n$HOME`} />
        <ul>
          <li>Ordinea numelor poate diferi (depinde de setările de limbă, <code>LANG</code>).</li>
          <li>Ziua este în engleză dacă <code>LANG</code> este setat pe engleză; schimbarea limbii schimbă și rezultatul <code>date</code>.</li>
          <li>În apostrofuri, <code>$HOME</code> rămâne literal; în ghilimele ar fi devenit <code>/home/student</code>.</li>
        </ul>

        <CodeBlock title="exit status" kind="session" label="illustrative" code={`[student@server1 ~]$ ls /etc/hostname\n/etc/hostname\n[student@server1 ~]$ echo $?\n0\n[student@server1 ~]$ ls /nu-exista\nls: cannot access '/nu-exista': No such file or directory\n[student@server1 ~]$ echo $?\n2\n[student@server1 ~]$ comandainexistenta\nbash: comandainexistenta: command not found\n[student@server1 ~]$ echo $?\n127`} />
        <ul>
          <li><code>0</code> = succes. <code>2</code> = <code>ls</code> a întâmpinat o problemă serioasă (de exemplu argument inaccesibil), conform paginii man a GNU <code>ls</code>.</li>
          <li><code>127</code> = comanda nu a fost găsită (convenție bash). <code>126</code> = fișier găsit, dar fără drept de execuție.</li>
        </ul>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Exit status</b>: <code>echo $?</code> imediat după comandă; <code>0</code> înseamnă succes.</li>
            <li><b>Ce rulez de fapt?</b> <code>type nume</code> (sau <code>type -a nume</code>).</li>
            <li><b>Ce a expandat shell-ul?</b> Înlocuiește comanda cu <code>echo</code>: <code>echo rm *.log</code> arată ce ar primi <code>rm</code>. Este un obicei sănătos înainte de orice ștergere cu wildcard.</li>
            <li><b>Valoarea unei variabile:</b> <code>echo "$NUME"</code> (cu ghilimele, ca să vezi spațiile); <code>printenv NUME</code> (doar dacă este exportată).</li>
            <li><b>Cine sunt, unde sunt:</b> <code>whoami</code>, <code>hostname</code>, <code>pwd</code>.</li>
            <li><b>Alias persistent?</b> Deschide un terminal nou (sau <code>bash -ic 'alias ll'</code>) și verifică.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>Tot ce tastezi la prompt (variabile, alias-uri, <code>cd</code>, modificarea PATH) trăiește <b>doar în acea sesiune de shell</b>. Dispare când închizi terminalul sau la reboot.</p>
          <Table head={['Vrei să persiste…', 'Scrie în…', 'Aplică imediat cu…']} rows={[
            ['alias sau funcție personală', <code>~/.bashrc</code>, <code>source ~/.bashrc</code>],
            ['variabilă / modificare PATH pentru tine', <><code>~/.bash_profile</code> sau <code>~/.bashrc</code></>, 'sesiune nouă sau source'],
            ['setare pentru toți utilizatorii', <code>/etc/profile.d/nume.sh</code>, 'login nou (necesită root)'],
            ['fișiere create', 'pe disc', 'persistă după reboot'],
          ]} />
          <p>Verificare: deschide un terminal nou sau reautentifică-te și rulează <code>alias</code> / <code>echo $VARIABILA</code>. Cerințele de examen care spun „persistent” sau „after reboot” se verifică exact așa (vezi și <code>M0.6</code> când va fi scrisă, și L1.1).</p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>command not found</code>, 'greșeală de scriere, majuscule, program neinstalat sau în afara PATH', <><code>type nume</code>, <code>echo $PATH</code></>, 'corectează numele; folosește Tab; instalează pachetul (C2); pentru un script local, ./script'],
          [<code>No such file or directory</code>, 'cale greșită sau relativă din directorul nepotrivit', <><code>pwd</code>, <code>ls</code> pe părinte</>, 'folosește Tab pe cale; verifică majusculele'],
          [<code>Permission denied</code>, 'nu ai drept de citire/scriere/execuție', <><code>ls -l fișier</code>, <code>id</code></>, 'schimbă permisiunile (L1.8) sau folosește sudo, dacă sarcina o cere'],
          [<code>invalid option -- 'x'</code>, 'opțiune inexistentă sau greșită', <><code>comandă --help</code>, <code>man comandă</code></>, 'citește SYNOPSIS și corectează'],
          [<>prompt blocat pe <code>&gt;</code></>, 'ghilimele sau apostrof nepereche: shell-ul așteaptă continuarea', 'ultima linie tastată', <>Ctrl+C, apoi retastează</>],
          ['terminalul pare „înghețat”', 'ai apăsat Ctrl+S (oprește afișarea) sau o comandă rulează încă', <>încearcă <code>Ctrl+Q</code>; apoi <code>Ctrl+C</code></>, 'Ctrl+Q reia afișarea'],
          [<><code>ls</code> afișează altceva decât te aștepți</>, 'alias sau funcție umbrește comanda', <code>type -a ls</code>, <><code>\ls</code> ignoră aliasul; <code>unalias ls</code></>],
          [<>variabila apare goală într-un script sau într-un shell copil</>, 'variabilă neexportată', <code>printenv NUME</code>, <code>export NUME</code>],
          [<>caracterele tastate nu apar (la parolă)</>, 'normal: parola nu se afișează', '—', 'tastează parola și apasă Enter'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Spații în jurul lui <code>=</code> la variabilă sau alias: <code>NUME = Ana</code> și <code>alias ll = 'ls -l'</code> sunt greșite; corect: <code>NUME=Ana</code>, <code>alias ll='ls -l'</code>.</>,
          <>Citirea lui <code>$?</code> după altă comandă: orice comandă, inclusiv <code>echo</code>, îl suprascrie.</>,
          <>Presupunerea că ce funcționează în terminalul tău este persistent. Alias-urile și variabilele tastate dispar.</>,
          <>Comenzi distructive (<code>rm</code>) fără să observi <code>#</code> în prompt sau directorul curent greșit; la nevoie verifică întâi cu <code>echo</code> și <code>ls</code>.</>,
          <>Nume cu spații fără citare: <code>touch fisier cu spatii</code> creează trei fișiere.</>,
          <>Ignorarea majusculelor: <code>/etc/Passwd</code> nu există; <code>LS</code> nu este <code>ls</code>.</>,
          <>Confuzia între builtin-uri și programe: <code>man cd</code> nu ajută; folosește <code>help cd</code>.</>,
          <>Copierea de pe web a ghilimelelor „curbe” sau a liniuțelor lungi (– în loc de -): shell-ul nu le recunoaște. Tastează sau lipește ca text simplu.</>,
          <>Lipirea unui bloc multi-linie fără să citești: fiecare linie se rulează imediat la Enter. În laborator, rulează comenzile pe rând.</>,
          <>Terminarea unei sesiuni cu Ctrl+D într-un shell în care ai făcut <code>su</code> sau <code>ssh</code>: ieși din shell-ul imbricat, nu din tot; verifică <code>whoami</code> și <code>hostname</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: login shell vs interactiv, shell vs variabilă de mediu, expandarea istoricului">
        <p>
          <b>Login shell</b> (consolă, SSH, <code>su -</code>) citește <code>/etc/profile</code> și apoi primul existent dintre <code>~/.bash_profile</code>, <code>~/.bash_login</code>, <code>~/.profile</code>. Un shell <b>interactiv non-login</b> (terminal din desktop sau <code>bash</code> tastat într-un shell) citește <code>~/.bashrc</code>. Un shell care rulează un script nu citește aceste fișiere decât dacă i se cere explicit. Pe RHEL, <code>~/.bash_profile</code> apelează implicit <code>~/.bashrc</code> (detalii: <code>man bash</code>, secțiunea INVOCATION).
        </p>
        <p>
          <b>Variabilă de shell vs variabilă de mediu.</b> <code>NUME=Ana</code> creează o variabilă locală; <code>export NUME</code> o adaugă în lista de șiruri „NUME=valoare” pe care nucleul o copiază în orice proces nou (<code>environ(7)</code>). Un proces copil primește o <i>copie</i>; ce modifică el nu se întoarce la părinte. De aceea un script care face <code>cd /tmp</code> nu schimbă directorul tău, iar <code>source</code> există tocmai pentru cazurile în care vrei efect în shell-ul curent.
        </p>
        <p>
          <b>Expandarea istoricului</b> (<code>!!</code>, <code>!n</code>, <code>!$</code>) funcționează doar în shell interactiv. Vezi ce ar rula cu <code>!n:p</code> (afișează fără execuție).
        </p>
        <p>
          <b>De ce <code>echo *</code> afișează „*” într-un director gol?</b> Dacă tiparul nu se potrivește cu nimic, bash îl lasă literal (comportament implicit; opțiunea <code>nullglob</code> îl schimbă). Concluzie: nu presupune că <code>*</code> expandează întotdeauna la fișiere reale.
        </p>
        <p>
          <b>Exit status și pipe.</b> Într-un pipe (<code>a | b</code>), <code>$?</code> este statusul ultimei comenzi; <code>set -o pipefail</code> schimbă regula. Vei folosi în scripturi (C3).
        </p>
      </DeepDive>
    </>
  );
}

export const M0_3: TopicModule = {
  id: 'M0.3',
  subtitle: 'Terminal, shell, prompt, anatomia unei comenzi, PATH, variabile, expandări, citare, istoric și ajutor',
  studyTime: '≈90 min studiu + 2 laboratoare',
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
  labs: [LAB_M0_3A, LAB_M0_3B],
  sources: [
    { kind: 'man', ref: 'bash(1): SHELL GRAMMAR, EXPANSION, QUOTING, COMMAND EXECUTION ENVIRONMENT, SHELL BUILTIN COMMANDS, INVOCATION, HISTORY EXPANSION, READLINE' },
    { kind: 'upstream', ref: 'GNU Bash Reference Manual — „Definitions” (gnu.org/software/bash/manual), citit 2026-11-17' },
    { kind: 'man', ref: 'ls(1), uname(1), type/help (bash builtins), environ(7), man(1), apropos(1), tty(1)' },
    { kind: 'doc', ref: 'Red Hat Enterprise Linux 10 — documentația de bază (docs.redhat.com): HTTP 403 la accesare, necitită; de verificat la review' },
  ],
};
