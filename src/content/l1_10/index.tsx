import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_10 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pe un server, în <G id="multi-user-target">multi-user.target</G>, te conectezi la consolă (prompt <code>login:</code>) sau prin rețea și primești un <G id="login-shell">login shell</G>. Apoi poți schimba utilizatorul în sesiune: <G id="su">su</G> / <code>su -</code> (cu parola țintei) sau <G id="sudo">sudo</G> (cu parola ta, dacă ești autorizat, de exemplu în grupul <G id="wheel">wheel</G>).
            Cu <code>whoami</code>, <code>id</code>, <code>who</code> și <code>last</code> vezi cine ești, ce grupuri ai și cine este conectat.
          </p>
          <p>Obiectivul oficial: <i>„Log in and switch users in multi-user targets”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Linux este multi-utilizator: fiecare om și fiecare serviciu rulează sub un cont, cu drepturi limitate (L1.8). Autentificarea dovedește cine ești; schimbarea utilizatorului îți permite să faci o sarcină cu alt cont (de obicei <code>root</code>) fără a te deconecta.
            Principiul este <i>privilegiu minim</i>: lucrezi ca utilizator obișnuit și folosești privilegii ridicate doar pentru comanda care le cere.
          </p>
          <Analogy>un hotel: cheia ta deschide camera ta. <code>su -</code> este ca și cum ai cere cheia altei camere (și ți se cere parola ei). <code>sudo</code> este ca și cum recepția îți deschide o ușă, pentru o singură sarcină, pe baza unei liste de persoane autorizate și cu înregistrare în registru.</Analogy>
          <p>
            <b>Multi-user target.</b> <code>systemd</code> pornește sistemul într-un <i>target</i>. <code>multi-user.target</code> înseamnă sistem complet funcțional, cu rețea și mai mulți utilizatori, fără interfață grafică; <code>graphical.target</code> îl extinde cu mediu grafic. Pe servere, de obicei, lucrezi în modul text. Gestionarea target-urilor se studiază în capitolul 4.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Autentificarea la consolă</h4>
          <p>
            Un program <code>getty</code> (<code>agetty</code>) ascultă pe fiecare consolă virtuală și afișează <code>login:</code>. După ce introduci numele și parola, <code>login</code> verifică prin <b>PAM</b> contul (<code>/etc/passwd</code>, parola hash în <code>/etc/shadow</code>) și pornește shell-ul specificat în ultimul câmp din <code>/etc/passwd</code> (de obicei <code>/bin/bash</code>), ca <b>login shell</b>.
            Pe mașina fizică sau în consola unui VM comuți între console cu <code>Ctrl+Alt+F1</code>…<code>F6</code>. Parola nu se afișează în timp ce o tastezi.
          </p>
          <h4><code>su</code> versus <code>su -</code></h4>
          <Table head={['Comandă', 'Ce primești', 'Parola cerută', 'Mediu']} rows={[
            [<code>su</code>, 'shell root (fără nume = root)', 'a lui root (root însuși nu introduce)', 'mediul tău curent (PATH, directorul curent) rămâne în mare parte'],
            [<code>su -</code>, 'login shell root', 'a lui root', 'mediul lui root, home-ul lui root'],
            [<code>su utilizator</code>, 'shell ca acel utilizator', 'a utilizatorului țintă', 'mediul tău curent'],
            [<code>su - utilizator</code>, 'login shell ca acel utilizator', 'a utilizatorului țintă', 'mediul și home-ul țintei'],
            [<code>su -c 'comandă' utilizator</code>, 'doar o comandă', 'a țintei', 'fără shell interactiv'],
          ]} />
          <p>
            După <code>su</code>, ai un shell <i>nou</i>, imbricat în cel vechi. <code>exit</code> (sau <code>Ctrl+D</code>) îl închide și revii. Diferența dintre <code>su</code> și <code>su -</code> contează pentru <code>PATH</code>: un shell fără <code>-</code> poate să nu găsească comenzi din <code>/sbin</code> sau <code>/usr/sbin</code> când treci la root.
          </p>
          <h4><code>sudo</code></h4>
          <p>
            <code>sudo comandă</code> rulează o comandă cu privilegiile altui utilizator (implicit <code>root</code>). Verifică politica din <code>/etc/sudoers</code> și <code>/etc/sudoers.d/</code>; de obicei cere <b>parola ta</b>, nu a lui root, și o reține câteva minute. Pe RHEL, membrii grupului <code>wheel</code> au acces la <code>sudo</code> în configurația implicită (de confirmat pe RHEL 10).
            <code>sudo -i</code> deschide un login shell root; <code>sudo -u utilizator comandă</code> rulează ca alt utilizator; <code>sudo -l</code> listează ce ți se permite. Fiecare utilizare este consemnată în jurnalul sistemului.
            Configurarea lui <code>sudo</code> (<code>visudo</code>, <code>/etc/sudoers.d</code>) este în C9, nu aici.
          </p>
          <h4>Cine sunt eu?</h4>
          <Table head={['Comandă', 'Răspunde la']} rows={[
            [<code>whoami</code>, 'utilizatorul efectiv (cu care rulezi acum)'],
            [<code>id</code>, 'uid, gid și toate grupurile (id -un: nume; id -Gn: grupuri)'],
            [<code>logname</code>, 'utilizatorul cu care te-ai conectat inițial'],
            [<code>who</code>, 'cine este conectat, pe ce terminal și de când'],
            [<code>w</code>, 'ca who, plus ce rulează fiecare'],
            [<code>last -n 5</code>, 'ultimele 5 conectări (din istoricul de login)'],
            [<code>tty</code>, 'terminalul tău'],
          ]} />
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Permisiuni</b> (L1.8): clasa aplicată (u/g/o) depinde de utilizatorul efectiv; <code>root</code> ocolește multe verificări. După adăugarea într-un grup, trebuie o nouă autentificare ca grupul să apară în <code>id</code>.</li>
            <li><b>SSH</b> (L1.11): conectarea de la distanță produce tot un login shell; <code>who</code> arată sesiuni <code>pts/N</code>.</li>
            <li><b>Redirecționare</b> (L1.5): <code>sudo echo x &gt; /etc/fișier</code> nu funcționează deoarece redirecționarea este făcută de shell-ul tău; folosește <code>tee</code>.</li>
            <li><b>Conturi și grupuri</b> (C9): crearea utilizatorilor, parole, <code>wheel</code>, <code>sudoers</code>.</li>
            <li><b>Target-uri și boot</b> (C4): <code>systemctl get-default</code>, <code>multi-user.target</code> vs <code>graphical.target</code>; recuperarea parolei root este în C4.</li>
            <li><b>Jurnal</b> (C4): <code>sudo</code> și autentificările apar în jurnal (<code>journalctl</code>).</li>
            <li><b>Mediu și shell</b> (L1.1): variabilele <code>PATH</code> și <code>HOME</code> diferă între <code>su</code> și <code>su -</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Rulezi o singură comandă administrativă: <code>sudo systemctl status …</code>.</li>
            <li>Ai nevoie de o sesiune lungă ca root: <code>sudo -i</code> sau <code>su -</code>.</li>
            <li>Testezi accesul altui cont (de exemplu, un utilizator nou poate citi un fișier?): <code>su - utilizator</code> sau <code>sudo -u utilizator</code>.</li>
            <li>Verifici cine mai este conectat înainte de un reboot: <code>who</code>, <code>w</code>.</li>
            <li>La examen: ți se cere de multe ori să lucrezi ca root pentru configurare, apoi să testezi ca utilizator obișnuit; trebuie să știi să treci rapid și să revii (<code>exit</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulează-le pe propriul sistem Linux. Pentru <code>su</code> către alt utilizator ai nevoie de un cont de test și de parola lui; <code>sudo</code> cere să fii autorizat. Nu partaja și nu nota parole în fișiere. Output-urile sunt <b>Ilustrative</b>.
        </Callout>

        <h4>Cine sunt și cine este conectat</h4>
        <CodeBlock title="comenzi" code={`whoami\nid\nid -un\nid -Gn\nlogname\ntty\necho $0\nwho\nw\nlast -n 5\nsystemctl get-default`} explain={[
          ['whoami', 'utilizatorul efectiv.'],
          ['id', 'uid, gid și grupurile (apartenența la grup decide drepturile și, de pildă, accesul la sudo prin wheel).'],
          ['id -un / id -Gn', '-u -n: doar numele utilizatorului; -G -n: numele tuturor grupurilor.'],
          ['logname', 'utilizatorul cu care s-a făcut login-ul inițial (nu se schimbă la su).'],
          ['tty', 'terminalul curent (de ex. /dev/pts/0 sau /dev/tty1).'],
          ['echo $0', 'într-un login shell afișează de obicei -bash.'],
          ['who / w', 'sesiunile active; w adaugă și ce rulează.'],
          ['last -n 5', '-n 5: ultimele cinci intrări din istoricul de conectări (necesită fișierul de istoric al sistemului; poate cere privilegii).'],
          ['systemctl get-default', 'afișează target-ul implicit (de ex. multi-user.target sau graphical.target).'],
        ]} />

        <h4>Schimbarea utilizatorului cu su</h4>
        <CodeBlock title="comenzi" code={`su\nwhoami; pwd\nexit\nsu -\nwhoami; pwd; echo $PATH\nexit\nsu - student2\nid\nexit\nsu -c 'id' student2`} explain={[
          ['su', 'devii root; shell-ul vechi rămâne dedesubt. Directorul curent și mare parte din mediu se păstrează.'],
          ['su -', 'login shell ca root: mediul root, directorul home al lui root, PATH cu directoarele de administrare.'],
          ['su - student2', 'login shell ca student2 (cu parola lui student2, dacă nu ești root).'],
          ['exit', 'închide shell-ul curent și revii la cel anterior.'],
          ['su -c \'id\' student2', '-c: rulează o singură comandă ca student2 și revine; nu pornește shell interactiv.'],
        ]} />

        <h4>Privilegii cu sudo</h4>
        <CodeBlock title="comenzi" code={`sudo -l\nsudo whoami\nsudo -u student2 whoami\nsudo -i\nwhoami; pwd\nexit\nsudo -k`} explain={[
          ['sudo -l', 'listează comenzile pe care ai voie să le rulezi (cere parola ta).'],
          ['sudo whoami', 'rulează whoami ca root; trebuie să afișeze root.'],
          ['sudo -u student2 …', '-u: rulează ca alt utilizator.'],
          ['sudo -i', 'login shell root (parola ta). Revii cu exit.'],
          ['sudo -k', 'uită parola reținută: următorul sudo o va cere din nou.'],
        ]} />

        <h4>Autentificarea la consolă (descriere)</h4>
        <CodeBlock title="de urmărit" kind="session" label="illustrative" code={`server1 login: student\nPassword:\n[student@server1 ~]$`} />
        <p className="small">La consolă introduci numele și parola (care nu se afișează). Dacă greșești, ești readus la <code>login:</code>. Pentru conexiuni remote, vezi L1.11.</p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="whoami, id" kind="session" label="illustrative" code={`[student@server1 ~]$ whoami\nstudent\n[student@server1 ~]$ id\nuid=1000(student) gid=1000(student) groups=1000(student),10(wheel) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023`} />
        <ul>
          <li><code>uid=1000(student)</code>: identificatorul numeric și numele utilizatorului; <code>gid</code>: grupul principal.</li>
          <li><code>groups=…,10(wheel)</code>: apartenența la <code>wheel</code> înseamnă, în configurația implicită RHEL, drept de <code>sudo</code>.</li>
          <li><code>context=…</code>: contextul SELinux al procesului (C10); poate să nu apară pe toate sistemele.</li>
        </ul>

        <CodeBlock title="su vs su -" kind="session" label="illustrative" code={`[student@server1 ~]$ su\nPassword:\n[root@server1 student]# pwd\n/home/student\n[root@server1 student]# exit\n[student@server1 ~]$ su -\nPassword:\n[root@server1 ~]# pwd\n/root\n[root@server1 ~]# exit\nlogout`} />
        <p className="small">Fără <code>-</code>, directorul curent rămâne <code>/home/student</code> (promptul arată numele directorului, nu al lui root). Cu <code>-</code>, ajungi în <code>/root</code>. Promptul <code>#</code> indică root, <code>$</code> utilizator obișnuit.</p>

        <CodeBlock title="who și last" kind="session" label="illustrative" code={`[student@server1 ~]$ who\nstudent  tty1        2025-01-01 09:00\nstudent  pts/0       2025-01-01 09:05 (192.168.122.1)\n[student@server1 ~]$ last -n 2\nstudent  pts/0   192.168.122.1  Wed Jan  1 09:05   still logged in\nstudent  tty1                   Wed Jan  1 09:00   still logged in`} />
        <p className="small"><code>tty1</code> = consolă locală; <code>pts/0</code> = terminal pseudo (de exemplu sesiune SSH), cu adresa sursă în paranteze. Adrese, ore și coloane sunt exemple.</p>

        <CodeBlock title="sudo -l" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo -l\n[sudo] password for student:\nUser student may run the following commands on server1:\n    (ALL) ALL`} />
        <p className="small">Promptul de parolă conține numele <i>tău</i>, nu „root”. <code>(ALL) ALL</code> înseamnă că poți rula orice comandă ca orice utilizator (politica depinde de configurarea sistemului tău).</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>După <code>su</code>/<code>sudo -i</code>: <code>whoami</code> și <code>id</code> arată noul utilizator; promptul se schimbă (<code>#</code> pentru root).</li>
            <li>Diferența <code>su</code> / <code>su -</code>: <code>pwd</code> și <code>echo $PATH</code>.</li>
            <li>Pentru <code>sudo</code>: <code>sudo whoami</code> trebuie să afișeze <code>root</code>; <code>sudo -l</code> arată autorizarea.</li>
            <li>Revenire: după <code>exit</code>, <code>whoami</code> arată iar utilizatorul inițial. Atenție la shell-uri imbricate: <code>echo $SHLVL</code> arată adâncimea.</li>
            <li>Sesiuni: <code>who</code>, <code>w</code>, <code>loginctl list-sessions</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Schimbarea utilizatorului cu <code>su</code>/<code>sudo</code> este temporară: durează cât shell-ul sau comanda. Ce persistă: conturile, grupurile și politica <code>sudo</code> (fișiere în <code>/etc</code>, C9) și target-ul implicit (<code>systemctl set-default</code>, C4). Nu schimba nimic din acestea în acest capitol; aici doar observi și te conectezi.
            Apartenența la un grup nou se vede abia la o nouă autentificare (<code>exit</code> din sesiune și login din nou).
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>su: Authentication failure</code>, 'parolă greșită (a țintei, nu a ta) sau cont blocat', <>verifică ce parolă cere <code>su</code></>, <>folosește parola contului țintă; sau <code>sudo -i</code> dacă ești autorizat</>],
          [<code>student is not in the sudoers file</code>, 'contul nu este autorizat pentru sudo', <><code>id</code> (lipsește wheel?)</>, <>cere unui administrator să te adauge (C9); sau lucrează ca root prin <code>su -</code></>],
          [<><code>command not found</code> după <code>su</code> (ex. <code>useradd</code>)</>, 'mediu fără /sbin în PATH (fără -)', <code>echo $PATH</code>, <>folosește <code>su -</code> sau calea completă</>],
          ['Grupul adăugat nu apare în `id`', 'sesiunea veche', <code>id</code>, 'ieși și autentifică-te din nou'],
          ['Comanda rulează ca utilizatorul greșit', 'ai uitat să ieși din `su` / ai shell-uri imbricate', <code>whoami; echo $SHLVL</code>, <><code>exit</code> până revii la cel dorit</>],
          ['Nu poți comuta la consola virtuală', 'consola/VM nu transmite Ctrl+Alt+Fn', '—', 'folosește meniul consolei VM pentru trimiterea combinației'],
          ['La login, mesaj „Login incorrect”', 'nume/parolă greșite, caps lock, cont inexistent', '—', 'verifică numele exact (se face distincție între litere mari și mici)'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confunzi parola cerută: <code>su</code> cere parola <i>țintei</i>; <code>sudo</code> cere parola <i>ta</i>.</>,
          <>Folosești <code>su</code> în loc de <code>su -</code> și apoi comenzile administrative nu sunt găsite sau lucrezi în directorul greșit.</>,
          <>Rămâi ca root „din comoditate” și rulezi comenzi periculoase; revino cu <code>exit</code> când ai terminat.</>,
          <>Uiți să ieși din shell-ul <code>su</code> și lași comenzile ulterioare să ruleze ca root (verifică promptul <code>#</code>).</>,
          <>Testezi un acces ca root și concluzionezi că funcționează: root ocolește multe verificări; testează cu utilizatorul vizat.</>,
          <>Presupui că <code>sudo echo x &gt; /etc/f</code> funcționează (vezi L1.5).</>,
          <>După adăugarea într-un grup nu te reautentifici și crezi că adăugarea a eșuat.</>,
          <>Scrii parola vizibil (în script sau în istoric): nu pune niciodată parole în comenzi.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ce este un „login” și de unde vine sudo">
        <p>
          O sesiune de login are un <i>identificator de sesiune</i> gestionat de <code>systemd-logind</code> (<code>loginctl list-sessions</code>). <code>su</code> și <code>sudo</code> nu creează o sesiune nouă de login completă în sens grafic; ele schimbă identitatea procesului (uid/gid) după verificări PAM și politici.
        </p>
        <p>
          <code>sudo</code> este un program cu bitul setuid (rulează cu drepturile proprietarului, root) care citește politica din <code>/etc/sudoers</code>. Faptul că se bazează pe <i>parola ta</i> înseamnă că nu trebuie să partajezi parola lui root; politica poate restricționa comenzile permise.
        </p>
        <p>
          Recuperarea accesului când parola root este pierdută (rescue/emergency mode, <code>rd.break</code>) aparține C4 și este în afara acestui capitol.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_10: TopicModule = {
  id: 'L1.10',
  subtitle: 'login la consolă, su / su -, sudo, whoami / id / who',
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
  labs: [LAB_L1_10],
  sources: [
    { kind: 'man', ref: 'su(1), sudo(8), login(1), who(1), w(1), last(1), id(1), whoami(1), logname(1), tty(1), loginctl(1)' },
    { kind: 'man', ref: 'systemd.special(7) (multi-user.target, graphical.target), systemctl(1) get-default, agetty(8), pam(8), passwd(5), shadow(5)' },
    { kind: 'doc', ref: 'Documentația RHEL 10 (docs.redhat.com): „Managing sudo access” — de verificat la review comportamentul implicit al grupului wheel' },
  ],
};
