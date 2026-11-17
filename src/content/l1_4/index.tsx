import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_4 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Pe un server Linux aproape totul este configurat prin <b>fișiere text</b>. Le poți crea din shell (<code>touch</code>, <code>echo</code>, <code>cat &gt; fișier</code>, here-document) și le poți edita cu un <G id="text-editor">editor de text</G> în terminal:
            <G id="vim">vi/vim</G> (modal, prezent peste tot) sau <G id="nano">nano</G> (simplu, cu scurtăturile afișate). La examen nu ai mouse și nu ai mediu grafic garantat: trebuie să deschizi, modifici, salvezi și închizi un fișier fără ezitare.
          </p>
          <p>Obiectivul oficial: <i>„Create and edit text files”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un fișier text conține caractere citibile, nu formate binare. Configurările din <code>/etc</code>, scripturile, listele de utilizatori sau regulile de firewall sunt fișiere text, deci le poți citi, compara, copia și corecta cu aceleași unelte.
            Fără un editor în terminal, ai fi blocat atunci când serverul nu are interfață grafică (cazul normal pe servere) sau când ești conectat prin SSH (L1.11).
          </p>
          <p>
            <b>De ce are vim moduri?</b> Editoarele vechi nu aveau mouse; pentru a evita combinațiile cu Ctrl, <code>vi</code> a împărțit tastatura în două roluri: într-un mod tastele sunt <i>comenzi</i> (șterge linia, caută, lipește), în altul sunt <i>text</i>. Odată învățat, ești foarte rapid, fără să iei mâinile de pe tastele de bază.
          </p>
          <Analogy>o telecomandă cu două moduri: în „modul televizor” butoanele schimbă canalele (comenzi), în „modul tastatură” aceleași butoane scriu litere (text). Dacă nu știi în ce mod ești, rezultatele par haotice. În vim, mereu poți apăsa <code>Esc</code> ca să te întorci în „modul comenzilor”.</Analogy>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>Buffer, nu fișier</h4>
          <p>
            Când deschizi un fișier, editorul îl citește într-un <b>buffer</b> din memorie. Ce tastezi modifică bufferul; fișierul de pe disc se schimbă doar la <i>salvare</i> (<code>:w</code> în vim, <code>Ctrl+O</code> în nano).
            Dacă ieși fără să salvezi (<code>:q!</code>), modificările se pierd. Vim creează în plus un <G id="swap-file-vim">fișier swap</G> (<code>.nume.swp</code>) cu care poate recupera lucrul la o cădere de sesiune.
          </p>
          <h4>Modurile <G id="vim-modes">vim</G></h4>
          <Table head={['Mod', 'Cum intri', 'Ce fac tastele', 'Cum ieși']} rows={[
            ['Normal', 'la pornire; Esc din orice alt mod', 'sunt comenzi (dd, yy, p, u, x, /…)', '—'],
            ['Insert', 'i, a, o, I, A, O (din Normal)', 'scriu text', 'Esc'],
            ['Visual', 'v (caractere), V (linii), Ctrl+v (bloc)', 'selectezi text; apoi d, y, > etc.', 'Esc'],
            ['Command-line', ': (comenzi), / sau ? (căutare)', 'tastezi o comandă, apoi Enter', 'Enter sau Esc'],
          ]} />
          <h4>Cum se leagă editorul de alte programe</h4>
          <p>
            Programe care îți cer să editezi un fișier (<code>crontab -e</code>, <code>visudo</code>, <code>systemctl edit</code>, <code>vigr</code>) pornesc editorul indicat de variabilele <code>VISUAL</code> / <code>EDITOR</code>; dacă nu sunt setate, de regulă pornește <code>vi</code>.
            Ele nu editează direct fișierul „real”, ci o copie temporară pe care o validează la salvare (de aceea <code>visudo</code> te avertizează când sintaxa e greșită, C9).
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Shell și redirecționare</b> (L1.1, L1.5): <code>echo</code>, <code>cat &gt;</code> și here-document creează fișiere fără editor; <code>&gt;</code> suprascrie, <code>&gt;&gt;</code> adaugă.</li>
            <li><b>Fișiere și directoare</b> (L1.3): <code>touch</code> creează fișierul gol; <code>cp</code> înainte de editare este o plasă de siguranță.</li>
            <li><b>Permisiuni</b> (L1.8): ca să salvezi un fișier trebuie să ai drept de scriere (sau să deschizi editorul cu <code>sudo</code>). Pe un fișier doar-citire vim avertizează „readonly”.</li>
            <li><b>grep</b> (L1.6): verifici rapid ce ai scris, fără a deschide editorul.</li>
            <li><b>Fișiere de configurare ale serviciilor</b> (C4, C6, C8…): după modificare trebuie adesea reîncărcat/repornit serviciul; editarea nu are efect asupra serviciului în execuție.</li>
            <li><b>SELinux</b> (C10): un fișier nou creat poate primi un alt context decât cel original; detalii în capitolul respectiv.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li>Modifici un fișier de configurare existent (de ex. un fișier din <code>/etc</code>): deschizi cu editor, schimbi o linie, salvezi.</li>
            <li>Adaugi o singură linie rapid, fără editor: <code>echo "linie" &gt;&gt; fișier</code>.</li>
            <li>Creezi un fișier mic cu mai multe linii: here-document.</li>
            <li>La examen: scrii un script scurt, un fișier de configurare, sau completezi un fișier cu un text cerut; timpul contează, deci editorul trebuie să-ți fie familiar.</li>
            <li>Ai nevoie de <code>vi</code> când lucrezi prin SSH, în modul rescue (C4) sau când nu există alt editor.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Exersează într-un director de test (<code>~/lab14</code>). Pe un sistem minimal, <code>vi</code> poate fi singurul editor disponibil; <code>vim</code> complet și <code>nano</code> pot lipsi. Nu presupune că sunt instalate: verifică cu <code>command -v nano vim</code>.
        </Callout>

        <h4>Crearea fișierelor din shell</h4>
        <CodeBlock title="comenzi" code={`mkdir -p ~/lab14 && cd ~/lab14\ntouch gol.txt\necho "prima linie" > nota.txt\necho "a doua linie" >> nota.txt\nprintf 'a\\nb\\nc\\n' > litere.txt\ncat > mesaj.txt <<'EOF'\nSalut\nAcesta este un fisier de test\nEOF\ncat nota.txt mesaj.txt`} explain={[
          ['touch gol.txt', 'creează un fișier gol; dacă există deja, doar îi actualizează timpii (opțiuni: -a doar accesul, -m doar modificarea, -d „dată” pentru o dată anume).'],
          ['echo "…" > nota.txt', '> creează/golește fișierul și scrie textul.'],
          ['>>', 'adaugă la sfârșit, fără să șteargă ce exista.'],
          ['printf \'a\\nb\\nc\\n\'', 'scrie exact textul dat; \\n este linie nouă (printf este mai previzibil decât echo când ai nevoie de secvențe speciale).'],
          ['cat > mesaj.txt <<\'EOF\'', 'here-document (L1.5): liniile până la EOF devin conținutul fișierului.'],
          ['cat nota.txt mesaj.txt', 'afișează cele două fișiere unul după altul.'],
        ]} />

        <h4>vim: ciclul minim de lucru</h4>
        <CodeBlock title="comenzi" code={`vi nota.txt\n# în vim:  i  → scrii text → Esc → :wq  → Enter\nvi +3 nota.txt\nvi -R nota.txt\nvimtutor`} explain={[
          ['vi fișier', 'deschide (sau creează, la salvare) fișierul. Pornește în modul Normal.'],
          ['i … Esc :wq', 'i intră în Insert; Esc revine în Normal; :wq salvează (write) și iese (quit).'],
          ['vi +3 fișier', '+N deschide fișierul cu cursorul pe linia N.'],
          ['vi -R fișier', '-R deschide doar-citire (readonly); util pentru a citi fără risc de modificare.'],
          ['vimtutor', 'tutorial interactiv; face parte din vim-enhanced și poate lipsi.'],
        ]} />

        <h4>vim: taste utile în modul Normal</h4>
        <Table head={['Acțiune', 'Taste (Normal)', 'Note']} rows={[
          ['Intră în Insert', <><code>i</code> înainte de cursor · <code>a</code> după cursor · <code>o</code> linie nouă dedesubt · <code>O</code> deasupra · <code>I</code> la începutul liniei · <code>A</code> la sfârșitul liniei</>, 'Esc te scoate din Insert'],
          ['Deplasare', <><code>h j k l</code> sau săgeți · <code>0</code> / <code>$</code> început/sfârșit de linie · <code>gg</code> / <code>G</code> început/sfârșit de fișier · <code>:N</code> linia N</>, 'Săgețile funcționează de obicei și în Insert'],
          ['Șterge', <><code>x</code> caracter · <code>dd</code> linie · <code>dw</code> cuvânt · <code>D</code> până la sfârșitul liniei · <code>3dd</code> trei linii</>, 'Ce ștergi poate fi lipit cu p'],
          ['Copiază / lipește', <><code>yy</code> copiază linia · <code>p</code> lipește după · <code>P</code> înainte</>, 'y = yank'],
          ['Anulează', <><code>u</code> undo · <code>Ctrl+r</code> redo</>, ''],
          ['Caută', <><code>/text</code> + Enter · <code>n</code> următorul · <code>N</code> precedentul</>, 'Căutare în fișier'],
          ['Înlocuiește', <><code>:%s/vechi/nou/g</code> în tot fișierul · <code>:s/vechi/nou/</code> pe linia curentă</>, 'g = toate aparițiile de pe linie'],
          ['Numerotare', <><code>:set number</code> / <code>:set nonumber</code></>, 'doar sesiunea curentă'],
        ]} />

        <h4>vim: salvare și ieșire (linia de comandă)</h4>
        <Table head={['Comandă', 'Efect']} rows={[
          [<code>:w</code>, 'salvează și rămâi în editor'],
          [<code>:q</code>, 'iese; refuză dacă există modificări nesalvate'],
          [<><code>:wq</code> sau <code>:x</code> sau <code>ZZ</code></>, 'salvează și iese'],
          [<code>:q!</code>, 'iese fără salvare, aruncând modificările'],
          [<code>:w alt.txt</code>, 'salvează o copie sub alt nume'],
          [<code>:w !sudo tee %</code>, 'salvează un fișier deschis fără drept de scriere, folosind sudo (tee din L1.5; % = numele fișierului curent)'],
        ]} />

        <h4>nano</h4>
        <CodeBlock title="comenzi" code={`nano nota.txt\n# Ctrl+O  → Enter    salvează\n# Ctrl+X             iese (întreabă dacă există modificări nesalvate)\n# Ctrl+W             caută\n# Ctrl+K / Ctrl+U    taie linia / lipește\nnano -l nota.txt`} explain={[
          ['nano fișier', 'deschide direct în modul de scriere; nu are moduri.'],
          ['Ctrl+O', '„Write Out”: salvează (confirmă numele cu Enter).'],
          ['Ctrl+X', 'iese; dacă ai modificări, întreabă dacă le salvezi (Y/N).'],
          ['-l', 'afișează numerele de linie (vezi nano(1) pentru opțiunile exacte ale versiunii instalate).'],
        ]} />

        <h4>Editorul implicit pentru alte programe</h4>
        <CodeBlock title="comenzi" code={`echo $EDITOR\nexport EDITOR=nano\nEDITOR=vim crontab -e`} explain={[
          ['echo $EDITOR', 'afișează editorul setat (poate fi gol).'],
          ['export EDITOR=nano', 'valabil doar în sesiunea curentă și în programele pornite din ea; ca să persiste ar trebui pus în ~/.bashrc.'],
          ['EDITOR=vim crontab -e', 'variabila se aplică numai acestei comenzi.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Fișier creat din shell" kind="session" label="illustrative" code={`[student@server1 lab14]$ echo "prima linie" > nota.txt\n[student@server1 lab14]$ echo "a doua linie" >> nota.txt\n[student@server1 lab14]$ cat nota.txt\nprima linie\na doua linie`} />
        <p className="small">Comenzile <code>echo</code> nu afișează nimic (rezultatul merge în fișier); <code>cat</code> arată conținutul.</p>

        <CodeBlock title="Mesajul vim după :wq" kind="session" label="illustrative" code={`"nota.txt" 2L, 26B written`} />
        <p className="small">Mesajul din partea de jos a ecranului vim după salvare: numele fișierului, numărul de linii (<code>L</code>) și de octeți (<code>B</code>). Valorile depind de conținut.</p>

        <CodeBlock title="Fișier swap găsit la deschidere" kind="session" label="illustrative" code={`E325: ATTENTION\nFound a swap file by the name ".nota.txt.swp"\n          owned by: student   dated: ...\n(1) Another program may be editing the same file.\n(2) An edit session for this file crashed.`} />
        <ul>
          <li>Înseamnă că există un <code>.nota.txt.swp</code>: fie fișierul este deschis în alt terminal, fie o sesiune anterioară s-a încheiat anormal.</li>
          <li>Dacă nu mai e deschis nicăieri, poți alege recuperarea (<code>R</code>) sau ieșirea și ștergerea swap-ului (după ce ai confirmat că nu e în uz). Formularea exactă a mesajului poate diferi între versiuni.</li>
        </ul>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li>După salvare, citește fișierul cu <code>cat</code>, <code>less</code> sau <code>head</code> și confirmă conținutul.</li>
            <li><code>ls -l fișier</code>: dimensiunea și ora modificării s-au schimbat? (zero octeți = fișier gol).</li>
            <li>Pentru caractere ascunse (spații, tab, sfârșit de linie lipsă): <code>cat -A fișier</code> arată <code>$</code> la sfârșit de linie și <code>^I</code> pentru tab.</li>
            <li>Pentru fișiere de configurare: după editare, verifică sintaxa dacă serviciul oferă o comandă pentru asta (în capitolele respective) și abia apoi reîncarcă serviciul.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Un fișier salvat rămâne pe disc și supraviețuiește reboot-ului. Ce <b>nu</b> persistă: ce ai modificat în buffer fără să salvezi, <code>:set number</code> și alte setări de sesiune din vim, <code>export EDITOR=…</code> făcut doar în terminal.
            Pentru setări permanente de vim se folosește <code>~/.vimrc</code> (fișier al utilizatorului); pentru <code>EDITOR</code>, un rând în <code>~/.bashrc</code>. Confirmare manuală: deschide un terminal nou și verifică <code>echo $EDITOR</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Tastezi text și se întâmplă lucruri ciudate (linii șterse, cursor care sare)', 'ești în modul Normal, nu în Insert', 'în vim, bara de jos arată „-- INSERT --” doar în Insert', <>apasă <code>i</code>, apoi scrie; <code>u</code> anulează stricăciunile</>],
          ['Comenzile (de ex. :wq) apar ca text în fișier', 'ești în Insert', 'bara de jos arată „-- INSERT --”', <>apasă <code>Esc</code>, șterge textul nedorit, apoi repetă comanda</>],
          [<code>E37: No write since last change</code>, 'ai dat :q cu modificări nesalvate', '—', <><code>:wq</code> pentru a salva sau <code>:q!</code> pentru a renunța</>],
          [<>„readonly” / <code>:w</code> eșuează cu o eroare de permisiuni</>, 'fișierul nu are drept de scriere pentru tine', <code>ls -l fișier</code>, <>deschide cu <code>sudo vi</code> sau folosește <code>:w !sudo tee %</code></>],
          ['Mesaj despre fișier swap', 'fișier deja deschis sau sesiune întreruptă', <><code>ls -a</code> și verifică alte terminale</>, <>închide celălalt editor sau recuperează cu <code>R</code>; apoi șterge <code>.swp</code></>],
          ['Fișierul rămâne neschimbat după editare', 'ai ieșit cu :q! sau ai răspuns „N” în nano', <code>cat fișier</code>, 'reia editarea și salvează'],
          ['Terminalul pare blocat', 'control de flux (Ctrl+S) activ în terminal', 'nu răspunde la taste', <>apasă <code>Ctrl+Q</code></>],
          ['Textul lipit se indentează în cascadă', 'auto-indentare în vim la lipire din terminal', '—', <>în vim: <code>:set paste</code> înainte de lipire; apoi <code>:set nopaste</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți să salvezi: ieși cu <code>:q!</code> sau închizi terminalul. Verifică mereu cu <code>cat</code> după.</>,
          <>Scrii în modul Normal (<code>dd</code>, <code>x</code> șterg ce nu voiai) și nu știi cum să revii: <code>u</code> (undo) este prietenul tău.</>,
          <>Folosești <code>&gt;</code> în loc de <code>&gt;&gt;</code> și golești un fișier de configurare existent.</>,
          <>Editezi fișierul greșit (o copie din home în loc de cel din <code>/etc</code>) sau nu ai drepturi și pierzi modificările.</>,
          <>Presupui că <code>nano</code> sau <code>vim</code> sunt instalate: bazează-te pe <code>vi</code>.</>,
          <>Pui spații în loc de tab (sau invers) în fișiere unde forma contează.</>,
          <>Lași spații la sfârșitul unei valori de configurare sau uiți linia nouă finală.</>,
          <>Faci modificarea, dar nu reîncarci/repornești serviciul (capitolele ulterioare).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: de la ex la vi și vim">
        <p>
          <code>vi</code> („visual”) este modul de ecran complet al editorului de linii <code>ex</code>; de aceea comenzile după <code>:</code> (<code>:w</code>, <code>:q</code>, <code>:%s/…/…/</code>) sunt, de fapt, comenzi <code>ex</code>.
          Sintaxa <code>s/vechi/nou/g</code> o regăsești și în <code>sed</code> și în expresiile regulate (L1.6). Vim („Vi IMproved”) este varianta modernă, compatibilă; pe RHEL, <code>vi</code> este de obicei furnizat de pachetul <code>vim-minimal</code> (de confirmat pe RHEL 10).
        </p>
        <p>
          Unele editoare salvează scriind într-un fișier temporar pe care îl redenumesc peste original; consecința este un fișier cu alt inode, deci un <i>hard link</i> (L1.7) sau metadatele pot fi afectate. Aici contează doar să știi că „fișier modificat” nu garantează întotdeauna „același obiect pe disc”.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_4: TopicModule = {
  id: 'L1.4',
  subtitle: 'touch, echo, here-document; vi/vim (moduri, salvare) și nano',
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
  labs: [LAB_L1_4],
  sources: [
    { kind: 'man', ref: 'vim(1), vimtutor(1); :help în Vim (usr_02, usr_04)' },
    { kind: 'man', ref: 'nano(1); manualul GNU nano (info nano)' },
    { kind: 'man', ref: 'bash(1): REDIRECTION, Here Documents; touch(1), cat(1), printf(1), echo(1), tee(1)' },
    { kind: 'doc', ref: 'Documentația RHEL 10 (docs.redhat.com) — de verificat la review ce editoare sunt instalate implicit' },
  ],
};
