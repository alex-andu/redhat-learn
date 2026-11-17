import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_8 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Fiecare fișier și director are un proprietar, un grup și trei seturi de <G id="permissions">permisiuni</G> pentru <G id="ugo">user, group, others</G>, fiecare cu <G id="rwx">read, write, execute</G>.
            <code>ls -l</code> le afișează; <G id="chmod">chmod</G> le schimbă (simbolic sau <G id="octal-mode">octal</G>); <G id="chown">chown</G>/<code>chgrp</code> schimbă proprietarul și grupul; <G id="umask">umask</G> hotărăște permisiunile fișierelor noi.
          </p>
          <p>Obiectivul oficial: <i>„List, set, and change standard ugo/rwx permissions”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Linux este un sistem multi-utilizator: pe aceeași mașină lucrează mai mulți utilizatori și servicii. Permisiunile hotărăsc cine poate citi o parolă, cine poate modifica o configurare, cine poate rula un program.
            Fără ele, orice utilizator ar putea șterge sau citi fișierele altuia, iar un serviciu compromis ar putea modifica tot sistemul.
          </p>
          <Analogy>un birou cu dulapuri: fiecare dulap are un <b>proprietar</b> și este asociat unui <b>departament</b> (grupul). Eticheta de pe dulap spune ce poate face proprietarul, ce poate face departamentul și ce pot face ceilalți: să se uite înăuntru (r), să schimbe ce e înăuntru (w) sau, la un birou-sală, să treacă prin ea (x).</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Cum citești <code>ls -l</code></h4>
          <p>Exemplu de linie: <code>-rwxr-x---. 1 ana dev 120 Jan 1 10:00 script.sh</code></p>
          <Table head={['Câmp', 'Valoare', 'Semnificație']} rows={[
            ['Tip', <code>-</code>, <>fișier obișnuit (<code>d</code> director, <code>l</code> symlink)</>],
            ['Permisiuni u', <code>rwx</code>, 'proprietarul poate citi, scrie, executa'],
            ['Permisiuni g', <code>r-x</code>, 'grupul poate citi și executa'],
            ['Permisiuni o', <code>---</code>, 'ceilalți nu au acces'],
            ['Punct final', <code>.</code>, 'există un context SELinux (C10); nu este un drept'],
            ['Contor', <code>1</code>, 'contorul de legături (L1.7)'],
            ['Proprietar / grup', <code>ana dev</code>, 'utilizatorul și grupul fișierului'],
          ]} />
          <h4>Ce înseamnă r, w, x</h4>
          <Table head={['Drept', 'Pe fișier', 'Pe director']} rows={[
            [<code>r</code>, 'citești conținutul', 'listezi numele din director (ls)'],
            [<code>w</code>, 'modifici conținutul', 'creezi, ștergi, redenumești intrări (necesită și x)'],
            [<code>x</code>, 'execuți fișierul ca program', 'traversezi: cd în el și accesezi fișiere după nume'],
          ]} />
          <p>
            <b>Regula care surprinde:</b> pentru a <i>șterge</i> un fișier contează dreptul <code>w</code> pe <b>directorul</b> care îl conține, nu pe fișier. Pentru a ajunge la un fișier trebuie să ai <code>x</code> pe <i>fiecare</i> director din cale.
          </p>
          <h4>Cine primește ce</h4>
          <p>
            Nucleul verifică, în ordine: ești proprietarul? ⇒ se aplică doar drepturile <b>u</b>. Altfel, faci parte din grupul fișierului? ⇒ se aplică <b>g</b>. Altfel ⇒ <b>o</b>. Nu se „adună” clasele: dacă ești proprietar și <code>u</code> nu are <code>w</code>, nu poți scrie, chiar dacă <code>o</code> are <code>w</code>. Utilizatorul <code>root</code> ocolește verificările de citire/scriere.
          </p>
          <h4>Mod octal</h4>
          <Table head={['Simbolic', 'Octal (per clasă)', 'Exemple']} rows={[
            ['r = 4, w = 2, x = 1', 'se adună', <><code>rwx</code>=7, <code>rw-</code>=6, <code>r-x</code>=5, <code>r--</code>=4, <code>---</code>=0</>],
            [<code>rwxr-xr-x</code>, <code>755</code>, 'directoare și programe'],
            [<code>rw-r--r--</code>, <code>644</code>, 'fișiere obișnuite'],
            [<code>rw-------</code>, <code>600</code>, 'fișiere private (ex. chei)'],
            [<code>rwxrwx---</code>, <code>770</code>, 'director partajat cu grupul'],
          ]} />
          <h4>umask</h4>
          <p>
            Fișierele noi pornesc de la <code>666</code> (fără x) și directoarele de la <code>777</code>; din ele se <b>scot</b> biții din umask. Cu <code>umask 022</code>: fișiere <code>644</code>, directoare <code>755</code>. Cu <code>umask 077</code>: fișiere <code>600</code>, directoare <code>700</code>.
            Pe RHEL, valoarea implicită depinde de configurarea shell-ului și de contul utilizatorului (de regulă <code>0022</code> sau <code>0002</code>); de confirmat pe RHEL 10 cu comanda <code>umask</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Utilizatori și grupuri</b> (C9, L1.10): proprietarul și grupul sunt conturi din <code>/etc/passwd</code> și <code>/etc/group</code>; apartenența la grup decide ce clasă ți se aplică; schimbarea apartenenței cere o nouă autentificare/sesiune.</li>
            <li><b>Link-uri</b> (L1.7): permisiunile sunt ale inode-ului; un symlink nu are drepturi proprii relevante.</li>
            <li><b>Redirecționare</b> (L1.5): scrierea cu <code>&gt;</code> se face cu drepturile shell-ului tău; <code>sudo echo … &gt; fișier</code> eșuează.</li>
            <li><b>Arhivare</b> (L1.9): <code>tar</code> păstrează permisiunile; la extragere ca root se pot păstra și proprietarii.</li>
            <li><b>SELinux</b> (C10): este un strat suplimentar, independent de rwx; un acces poate fi refuzat chiar dacă permisiunile permit (<code>.</code> / <code>+</code> după permisiuni indică context/ACL).</li>
            <li><b>Servicii</b> (C4): fișierele de configurare/log trebuie să fie lizibile de contul serviciului.</li>
            <li><b>Sisteme de fișiere partajate</b> (C6): directoare de grup cu permisiuni potrivite.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Faci un script executabil: <code>chmod u+x script.sh</code>.</li>
            <li>Protejezi un fișier cu date sensibile: <code>chmod 600</code>.</li>
            <li>Creezi un director partajat pentru un grup: <code>chown :dev dir; chmod 770 dir</code>.</li>
            <li>Repari „Permission denied”: citești <code>ls -l</code> / <code>ls -ld</code>, apoi corectezi proprietarul, grupul sau drepturile.</li>
            <li>La examen: ți se dau cerințe de tipul „doar proprietarul poate scrie, grupul poate citi, ceilalți nimic” sau „toate fișierele noi ale lui X să fie private”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Exersează în <code>~/lab18</code>. Schimbarea proprietarului cere <code>sudo</code> și un utilizator/grup existent; folosește doar conturi de test sau pe cele existente în sistemul tău. Output-urile sunt <b>Ilustrative</b>.
        </Callout>

        <h4>Afișarea permisiunilor</h4>
        <CodeBlock title="comenzi" code={`ls -l\nls -ld ~/lab18\nls -l /etc/passwd /etc/shadow\nstat -c '%a %A %U:%G %n' /etc/passwd\nid\ngroups\nnamei -l /etc/passwd`} explain={[
          ['ls -l', 'format lung: tip+permisiuni, contor, proprietar, grup, dimensiune, dată, nume.'],
          ['ls -ld director', '-d: afișează directorul în sine, nu conținutul lui (necesar ca să vezi permisiunile directorului).'],
          ['stat -c FORMAT', '-c: format propriu; %a = mod octal, %A = mod simbolic, %U/%G = proprietar/grup, %n = nume.'],
          ['id / groups', 'utilizatorul curent și grupurile din care face parte (decide clasa aplicată).'],
          ['namei -l cale', 'listează permisiunile fiecărei componente din cale (util la Permission denied).'],
        ]} />

        <h4>chmod: mod simbolic</h4>
        <CodeBlock title="comenzi" code={`mkdir -p ~/lab18 && cd ~/lab18\ntouch fisier.txt script.sh\nchmod u+x script.sh\nchmod g+w,o-r fisier.txt\nchmod a+r fisier.txt\nchmod u=rwx,g=rx,o= script.sh\nchmod go-rwx fisier.txt\nchmod -R g+rX .`} explain={[
          ['u+x', '[ugoa] = cui; + adaugă; x = dreptul. Adaugă execuția pentru proprietar.'],
          ['g+w,o-r', 'mai multe modificări separate prin virgulă (fără spații): grupul primește w, ceilalți pierd r.'],
          ['a+r', 'a = all (u, g și o).'],
          ['u=rwx,g=rx,o=', '= stabilește exact; o= golește drepturile lui others.'],
          ['go-rwx', 'scoate toate drepturile pentru group și others.'],
          ['-R g+rX', '-R: recursiv; X: execuție doar pe directoare (și pe fișierele deja executabile), util ca să nu faci executabile fișierele obișnuite.'],
        ]} />

        <h4>chmod: mod octal</h4>
        <CodeBlock title="comenzi" code={`chmod 644 fisier.txt\nchmod 755 script.sh\nchmod 600 fisier.txt\nchmod 750 .\nchmod -v 640 fisier.txt\nchmod -R 750 ~/lab18/proiect`} explain={[
          ['chmod 644', 'u=rw-, g=r--, o=r--.'],
          ['chmod 755', 'u=rwx, g=r-x, o=r-x.'],
          ['chmod 600', 'doar proprietarul citește/scrie.'],
          ['-v', '--verbose: afișează schimbarea făcută pentru fiecare fișier.'],
          ['-R', 'recursiv: atenție, aplică aceeași valoare și fișierelor, și directoarelor (755 face fișierele executabile).'],
        ]} />

        <h4>Proprietar și grup</h4>
        <CodeBlock title="comenzi" code={`sudo chown root fisier.txt\nsudo chown student:wheel fisier.txt\nsudo chown :wheel fisier.txt\nchgrp wheel fisier.txt\nsudo chown -R student: proiect/\nls -l fisier.txt`} explain={[
          ['chown utilizator fișier', 'schimbă proprietarul; necesită privilegii.'],
          ['chown utilizator:grup', 'schimbă proprietarul și grupul deodată.'],
          ['chown :grup', 'schimbă doar grupul (echivalent cu chgrp grup).'],
          ['chgrp grup fișier', 'schimbă grupul; un utilizator obișnuit poate face asta doar către un grup din care face parte, pe fișierele lui.'],
          ['-R', 'recursiv, pe tot arborele.'],
          ['chown student: proiect/', '„student:” = proprietar student și grupul principal al lui student.'],
        ]} />

        <h4>umask</h4>
        <CodeBlock title="comenzi" code={`umask\numask -S\numask 027\ntouch nou.txt && mkdir nou-dir\nls -ld nou.txt nou-dir\numask 022`} explain={[
          ['umask', 'afișează masca curentă, în octal.'],
          ['umask -S', 'afișează masca în formă simbolică (permisiunile permise).'],
          ['umask 027', 'setează masca pentru sesiunea curentă: fișiere 640, directoare 750.'],
          ['umask 022', 'revine la o valoare obișnuită; valabilă doar în sesiune.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="ls -l" kind="session" label="illustrative" code={`[student@server1 lab18]$ ls -l\n-rw-r--r--. 1 student student    0 Jan  1 10:00 fisier.txt\n-rwxr-x---. 1 student student    0 Jan  1 10:00 script.sh\ndrwxr-xr-x. 2 student student 4096 Jan  1 10:00 proiect`} />
        <ul>
          <li><code>fisier.txt</code>: <code>rw-</code> pentru proprietar, <code>r--</code> pentru grup, <code>r--</code> pentru ceilalți = <code>644</code>.</li>
          <li><code>script.sh</code>: <code>rwx</code> / <code>r-x</code> / <code>---</code> = <code>750</code>; ceilalți nu pot accesa.</li>
          <li><code>proiect</code>: <code>d</code> = director; <code>rwxr-xr-x</code> = <code>755</code>; <code>4096</code> este dimensiunea intrării de director (nu conținutul).</li>
        </ul>

        <CodeBlock title="stat -c" kind="session" label="illustrative" code={`[student@server1 ~]$ stat -c '%a %A %U:%G %n' /etc/passwd\n644 -rw-r--r-- root:root /etc/passwd`} />
        <p className="small">Aceleași informații în patru forme: octal, simbolic, proprietar:grup, nume.</p>

        <CodeBlock title="umask 027" kind="session" label="illustrative" code={`[student@server1 lab18]$ umask 027\n[student@server1 lab18]$ touch nou.txt && mkdir nou-dir\n[student@server1 lab18]$ ls -ld nou.txt nou-dir\n-rw-r-----. 1 student student 0 Jan  1 10:05 nou.txt\ndrwxr-x---. 2 student student 6 Jan  1 10:05 nou-dir`} />
        <p className="small">666 − 027 = 640 (fișier), 777 − 027 = 750 (director). Dimensiunea afișată a directorului nu este relevantă.</p>

        <CodeBlock title="Permission denied pe director" kind="session" label="illustrative" code={`[student@server1 ~]$ ls -ld /root\ndr-xr-x---. 14 root root 4096 Jan  1 09:00 /root\n[student@server1 ~]$ ls /root\nls: cannot open directory '/root': Permission denied`} />
        <p className="small">Ca <code>student</code> se aplică clasa <b>o</b> (<code>---</code>): nici <code>r</code>, nici <code>x</code> ⇒ acces refuzat. Proprietarul și grupul directorului sunt <code>root</code>.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>După <code>chmod</code>/<code>chown</code>: <code>ls -l</code> (sau <code>ls -ld</code> pentru directoare) și <code>stat -c '%a %U:%G'</code> pentru formă octală.</li>
            <li>Testează efectul, nu doar eticheta: încearcă să citești/scrii/execuți ca utilizatorul vizat (<code>sudo -u utilizator cat fișier</code> sau <code>su</code>, L1.10).</li>
            <li>Pentru căi: <code>namei -l /cale/completă</code> arată dacă lipsește <code>x</code> pe un director intermediar.</li>
            <li>Verifică <code>id</code>: dacă tocmai ai fost adăugat într-un grup, sesiunea veche nu îl vede încă.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Permisiunile, proprietarul și grupul sunt stocate în inode: persistă după reboot. Ce <b>nu</b> persistă: <code>umask</code> setat în terminal (doar sesiunea curentă; pentru permanență intră într-un fișier de inițializare precum <code>~/.bashrc</code>) și, în cazul directoarelor din <code>/tmp</code> sau <code>/run</code>, fișierele care sunt recreate la pornire.
            Atenție: un fișier înlocuit (copiat, restaurat din arhivă, creat de un serviciu) își poate pierde permisiunile. Confirmare manuală după reboot: <code>ls -l</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>Permission denied</code>, 'lipsește r/w/x pe fișier sau x pe un director din cale', <><code>ls -l</code>, <code>namei -l cale</code>, <code>id</code></>, <><code>chmod</code>/<code>chown</code> adecvat (fără a da <code>777</code>)</>],
          [<>Permission denied la <code>./script.sh</code></>, 'lipsește x', <code>ls -l script.sh</code>, <><code>chmod u+x script.sh</code></>],
          ['Nu poți șterge un fișier „al tău”', 'lipsește w pe directorul părinte', <code>ls -ld .</code>, 'corectează drepturile directorului'],
          [<code>chown: changing ownership … Operation not permitted</code>, 'ai nevoie de privilegii', '—', <>folosește <code>sudo</code></>],
          ['Tocmai ai primit un grup, dar tot nu poți accesa', 'sesiunea veche nu vede grupul nou', <code>id</code>, 'autentifică-te din nou (L1.10)'],
          ['Fișierele recursiv au devenit executabile', '`chmod -R 755` pe fișiere', 'ls -l', <>folosește <code>X</code> (<code>chmod -R u+rwX</code>) sau separă fișiere/directoare cu <code>find</code></>],
          ['Fișiere noi cu drepturi neașteptate', 'umask diferit', <code>umask</code>, 'setează umask-ul dorit'],
          ['Permisiunile par corecte, dar accesul eșuează', 'blocaj SELinux (C10)', 'vezi capitolul SELinux', 'corectează contextul, nu permisiunile'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Folosești <code>chmod 777</code> „ca să meargă”: funcționează, dar nu răspunde cerinței și deschide accesul.</>,
          <>Uiți <code>x</code> pe directoare: <code>chmod 644 dir</code> face directorul inaccesibil.</>,
          <>Crezi că <code>w</code> pe fișier îți permite să-l ștergi: contează <code>w</code> pe director.</>,
          <>Confunzi octalul: <code>640</code> este <code>rw-r-----</code>, nu <code>rwxr-----</code>.</>,
          <>Pui spații în lista simbolică: <code>chmod u+x, g+w</code> eșuează; scrie <code>u+x,g+w</code>.</>,
          <>Ordinea <code>chown utilizator:grup</code> și lipsa recursivității când se cere pentru tot directorul (<code>-R</code>).</>,
          <>Setezi <code>umask</code> în terminal și crezi că persistă.</>,
          <>Ceri o verificare de utilizator, dar testezi ca <code>root</code>, care ocolește multe verificări.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: biți speciali și ACL (doar pentru recunoaștere)">
        <p>
          Dincolo de <code>rwx</code> există trei biți speciali: <b>setuid</b> (<code>s</code> în locul lui <code>x</code> la proprietar; programul rulează cu drepturile proprietarului), <b>setgid</b> (<code>s</code> la grup; pe directoare, fișierele noi moștenesc grupul directorului) și <b>sticky</b> (<code>t</code> la others; în directoare ca <code>/tmp</code>, doar proprietarul unui fișier îl poate șterge).
          Apar ca o a patra cifră octală (<code>2770</code>, <code>1777</code>, <code>4755</code>). Nu fac parte din textul obiectivului C1-10; îi recunoști în <code>ls -l</code>, dar nu îi configurezi aici.
        </p>
        <p>
          ACL-urile (<code>getfacl</code>/<code>setfacl</code>) sunt în afara acestui curriculum; semnul <code>+</code> după permisiuni în <code>ls -l</code> indică prezența lor.
        </p>
        <p>
          Matematica umask: biții din umask sunt <i>eliminați</i>; de aceea <code>umask 022</code> nu „adaugă” 022. Fișierele noi pornesc de la 666 deoarece programele nu cer implicit x. <code>chmod</code> nu este afectat de umask.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_8: TopicModule = {
  id: 'L1.8',
  subtitle: 'ls -l, chmod (simbolic și octal), chown/chgrp, umask',
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
  labs: [LAB_L1_8],
  sources: [
    { kind: 'man', ref: 'chmod(1), chown(1), chgrp(1), ls(1), stat(1), namei(1), id(1)' },
    { kind: 'man', ref: 'bash(1): umask (SHELL BUILTIN COMMANDS); umask(2); inode(7); path_resolution(7)' },
    { kind: 'doc', ref: 'GNU Coreutils manual (File permissions, Mode Structure) — de verificat la review' },
    { kind: 'doc', ref: 'Documentația RHEL 10 (docs.redhat.com) — de verificat valorile implicite de umask' },
  ],
};
