import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L1_2 } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            La examenul practic nu ai internet, dar ai documentația instalată pe sistem: <G id="man-page">paginile man</G>, paginile <G id="info-pages">info</G>, opțiunea <code>--help</code> și fișierele din <G id="usr-share-doc">/usr/share/doc</G>.
            Abilitatea de bază este să găsești rapid <b>pagina potrivită</b> (<code>man -k</code>), în <b>secțiunea potrivită</b> (<code>man 5 fstab</code>), și să citești <b>SYNOPSIS</b> și <b>EXAMPLES</b>.
          </p>
          <p>Obiectivul oficial acoperit: <i>„Locate, read, and use system documentation including man, info, and files in /usr/share/doc”</i>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <p>
            Un sistem Linux are mii de comenzi, fișiere de configurare și concepte. Nimeni nu le ține minte pe toate, nici administratorii cu experiență. Soluția veche, dar încă excelentă: fiecare program își livrează propria documentație,
            în același pachet, ca să fie întotdeauna <b>în versiunea exactă instalată</b> și disponibilă <b>offline</b>.
          </p>
          <Analogy>paginile man sunt ca pliantele din cutia unui aparat: scurte, exacte, specifice modelului tău. Info este manualul complet de utilizare. <code>/usr/share/doc</code> este sertarul cu exemple și note suplimentare.</Analogy>
          <p><b>Ce problemă rezolvă?</b> Ți-e greu să-ți aduci aminte o opțiune? O cauți. Nu știi cum se numește comanda? O cauți după funcție. Nu știi ce format are un fișier de configurare? Îi citești pagina din secțiunea 5.
            Fără aceste surse locale, un examen practic fără internet ar fi o probă de memorie, nu de administrare.</p>
          <Callout kind="exam" title="Ce spune pagina oficială EX200">
            Pagina Red Hat precizează că examenul se susține fără acces la internet, că nu poți folosi documentație personală și că documentația de produs este disponibilă pentru majoritatea examenelor (vezi <code>research/objectives/ex200-verification.md</code>).
            Nu te baza pe acest ultim punct: paginile man de pe sistem sunt sursa pe care o poți exersa în orice mediu.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>man</h4>
          <p>
            Pachetele RPM instalează paginile de manual (de obicei comprimate) în <code>/usr/share/man/man1</code>, <code>man5</code>, <code>man8</code> etc. Comanda <code>man NUME</code>:
            (1) găsește fișierul în directoarele indicate de configurația man-db; (2) îl formatează (macro-urile roff devin text); (3) îl trimite către un <G id="pager">pager</G>, de obicei <code>less</code>.
          </p>
          <h4>Secțiunile</h4>
          <Table head={['Secțiune', 'Conține', 'Exemplu']} rows={[
            ['1', 'comenzi și programe pentru utilizatori', <code>ls(1)</code>],
            ['2', 'apeluri de sistem (programare)', <code>open(2)</code>],
            ['3', 'funcții de bibliotecă (programare)', <code>printf(3)</code>],
            ['4', 'fișiere speciale / dispozitive', <code>null(4)</code>],
            ['5', 'formate de fișiere și fișiere de configurare', <code>fstab(5)</code>, ],
            ['6', 'jocuri', 'rar folosit'],
            ['7', 'concepte, convenții, diverse', <code>man(7)</code>],
            ['8', 'comenzi de administrare (de obicei root)', <code>mount(8)</code>],
          ]} />
          <p>
            Aceeași denumire poate exista în mai multe secțiuni, de exemplu <code>passwd(1)</code> (comanda) și <code>passwd(5)</code> (formatul fișierului <code>/etc/passwd</code>). <code>man passwd</code> alege prima secțiune găsită; <code>man 5 passwd</code> cere explicit secțiunea 5.
          </p>
          <h4>Structura unei pagini</h4>
          <Table head={['Secțiune', 'Ce găsești']} rows={[
            [<code>NAME</code>, 'numele și o descriere de o linie (de aici se alimentează man -k)'],
            [<code>SYNOPSIS</code>, 'sintaxa: ce e opțional, ce se poate repeta'],
            [<code>DESCRIPTION</code>, 'explicația detaliată'],
            [<code>OPTIONS</code>, 'fiecare opțiune, cu efectul ei (uneori incluse în DESCRIPTION)'],
            [<code>EXAMPLES</code>, 'exemple (nu toate paginile au)'],
            [<code>FILES</code>, 'fișiere de configurare/date implicate'],
            [<code>SEE ALSO</code>, 'pagini înrudite: bun punct de plecare pentru a continua căutarea'],
          ]} />
          <h4>Cum se citește SYNOPSIS</h4>
          <ul>
            <li><code>[ ]</code> — element opțional.</li>
            <li><code>...</code> — elementul precedent se poate repeta.</li>
            <li><code>a | b</code> — alternative; alegi una.</li>
            <li>Textul îngroșat se tastează literal; textul subliniat/italic este un înlocuitor (de exemplu <i>FILE</i> se înlocuiește cu un nume real).</li>
          </ul>
          <h4>Indexul pentru căutare</h4>
          <p>
            <code>man -k</code> (identic cu <code>apropos</code>) caută în descrierile din linia NAME, folosind o bază de date construită de <G id="mandb">mandb</G>. <code>man -f</code> (identic cu <code>whatis</code>) caută numai nume exacte de pagini. Dacă baza nu există încă,
            <code>man -k</code> poate răspunde „nothing appropriate”; un <code>mandb</code> rulat ca root o construiește.
          </p>
          <h4>info și /usr/share/doc</h4>
          <p>
            <code>info</code> afișează documentație structurată în noduri (capitole) legate între ele; pentru uneltele GNU (de exemplu <code>info coreutils</code>) este mai detaliată decât man. <code>/usr/share/doc</code> conține fișierele pe care pachetele le marchează ca documentație:
            README, exemple de configurare, licențe. Pentru un pachet instalat, <code>rpm -qd PACHET</code> arată exact care sunt.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Pachete RPM</b> (C2): documentația vine în pachetul programului. Dacă lipsește o pagină man, pachetul poate fi instalat fără documentație (de exemplu în imagini minimale) sau pachetul de manuale nu este instalat. Verifică cu <code>rpm -q man-db</code> și <code>rpm -qd PACHET</code>.</li>
            <li><b>Pager</b>: man folosește <code>less</code>; scurtăturile învățate aici merg și în <code>systemctl</code>, <code>journalctl</code> și <code>git</code>.</li>
            <li><b>Shell</b> (L1.1): <code>help NUME</code> documentează builtin-urile (<code>cd</code>, <code>type</code>…); <code>man bash</code> le acoperă și el. <code>NUME --help</code> afișează un rezumat direct în terminal.</li>
            <li><b>Toate celelalte lecții</b>: orice obiectiv EX200 (SELinux, LVM, firewalld, systemd) are pagini man pentru comenzi (secțiunea 8 sau 1) și pentru fișiere de configurare (secțiunea 5). Încă de acum, obișnuiește-te să-ți răspunzi singur.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce îl folosim">
        <Detailed>
          <ul>
            <li><b>Știi comanda, dar ai uitat opțiunea:</b> <code>man comandă</code>, apoi <code>/opțiune</code> sau <code>/text</code> pentru căutare.</li>
            <li><b>Nu știi comanda:</b> <code>man -k cuvânt</code>, apoi alegi după descriere.</li>
            <li><b>Nu știi formatul unui fișier de configurare:</b> <code>man 5 NUME</code>.</li>
            <li><b>Ai nevoie de un exemplu complet:</b> secțiunea EXAMPLES, <code>info</code> sau <code>/usr/share/doc</code>.</li>
            <li><b>Un builtin:</b> <code>help NUME</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Exersează-le pe un sistem Linux al tău. Blocurile de output sunt etichetate: <b>Reconstituit din documentație</b> (derivat din pagina de manual) sau <b>Ilustrativ</b> (exemplu construit).
        </Callout>

        <h4>man: deschidere și navigare</h4>
        <CodeBlock title="comenzi" code={`man ls\nman 5 fstab\nman -k "disk usage"\nman -f passwd\nman -w ls`} explain={[
          ['man ls', 'deschide pagina `ls` din prima secțiune găsită (aici, 1).'],
          ['man 5 fstab', 'cere explicit secțiunea 5 (formatul fișierului /etc/fstab).'],
          ['man -k "disk usage"', '-k (--apropos): caută cuvinte-cheie în NAME/descrieri; echivalent cu apropos. Frazele cu spațiu se citează.'],
          ['man -f passwd', '-f (--whatis): descrierea scurtă a paginilor numite exact passwd, din toate secțiunile; echivalent cu whatis passwd.'],
          ['man -w ls', '-w (--where): afișează calea fișierului paginii, fără să-l deschidă.'],
        ]} />
        <Table head={['Tastă în pager (less)', 'Efect']} rows={[
          [<><code>Space</code> / <code>b</code></>, 'pagina următoare / precedentă'],
          [<><code>g</code> / <code>G</code></>, 'început / sfârșit'],
          [<code>/text</code>, 'caută înainte; Enter; apoi n (următorul) și N (precedentul)'],
          [<code>?text</code>, 'caută înapoi'],
          [<code>h</code>, 'ajutor pentru less'],
          [<code>q</code>, 'ieșire'],
        ]} />

        <h4>Ajutor rapid fără man</h4>
        <CodeBlock title="comenzi" code={`ls --help\nhelp cd\nwhatis ls\napropos -s 5 fstab`} explain={[
          ['comandă --help', 'rezumat al sintaxei și opțiunilor, direct în terminal (nu toate comenzile îl au; pe unele, e un mesaj de eroare).'],
          ['help cd', 'documentația unui builtin bash.'],
          ['whatis ls', 'echivalent cu man -f ls.'],
          ['apropos -s 5 fstab', '-s (--sections): limitează căutarea la secțiunea indicată.'],
        ]} />

        <h4>info</h4>
        <CodeBlock title="comenzi" code={`info coreutils\ninfo ls\ninfo --help`} explain={[
          ['info coreutils', 'deschide documentația pachetului coreutils (ls, cp, mv, sort…), cu meniu de noduri.'],
          ['info ls', 'nodul pentru ls, dacă există; altfel info afișează pagina man.'],
          ['n / p / u', 'nodul următor / precedent / nivelul superior.'],
          ['Enter pe o linie „* nume::”', 'intră în nodul indicat de meniu.'],
          ['s sau /', 'caută text; q iese.'],
        ]} />

        <h4>/usr/share/doc și pachete</h4>
        <CodeBlock title="comenzi" code={`ls /usr/share/doc | head\nrpm -q man-db\nrpm -qd bash\nless /usr/share/doc/NUME-PACHET/README`} explain={[
          ['ls /usr/share/doc | head', '| trimite lista către head, care afișează primele 10 linii (pipe: L1.5).'],
          ['rpm -q PACHET', 'verifică dacă pachetul e instalat și arată versiunea.'],
          ['rpm -qd PACHET', '-q (query) cu -d (--docfiles): listează fișierele de documentație ale pachetului.'],
          ['less FIȘIER', 'citește un fișier text pe pagini (aceleași taste ca în man).'],
        ]} />

        <h4>mandb (root)</h4>
        <CodeBlock title="comenzi" code={`sudo mandb`} explain={[['sudo mandb', 'reconstruiește indexul folosit de man -k; necesită privilegii root. Poate dura câteva secunde.']]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="Începutul paginii man ls" kind="session" label="reconstructed" code={`LS(1)                   User Commands                   LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List  information  about  the FILEs (the current directory by default).`} />
        <ul>
          <li><code>LS(1)</code> în antet = comanda <code>ls</code>, secțiunea 1.</li>
          <li><code>NAME</code>: <code>ls - list directory contents</code>; această linie este ce vede <code>man -k</code>.</li>
          <li><code>SYNOPSIS</code>: <code>ls [OPTION]... [FILE]...</code> înseamnă că opțiunile sunt opționale și repetabile, iar fișierele/directoarele sunt opționale și repetabile; fără argumente, listează directorul curent (de aceea apare „the current directory by default”).</li>
          <li>Textul exact diferă puțin între versiuni; structura este cea standard.</li>
        </ul>
        <CodeBlock title="man -f / whatis" kind="session" label="illustrative" code={`[student@server1 ~]$ man -f passwd\npasswd (1)           - update user's authentication tokens\npasswd (5)           - password file`} />
        <ul>
          <li>Numele este același, dar există două pagini: <b>(1)</b> descrie comanda <code>passwd</code>; <b>(5)</b> descrie formatul fișierului <code>/etc/passwd</code>.</li>
          <li>Descrierile și lista exactă depind de pachetele instalate pe sistemul tău.</li>
        </ul>
        <CodeBlock title="man -k" kind="session" label="illustrative" code={`[student@server1 ~]$ man -k "disk usage"\ndf (1)              - report file system disk space usage\ndu (1)              - estimate file space usage`} />
        <ul>
          <li>Formatul: <code>nume (secțiune) - descriere</code>. Din listă alegi pagina, apoi o deschizi cu <code>man 1 du</code> sau <code>man du</code>.</li>
          <li>Rezultatele reale pot include mai multe pagini; exemplul este ilustrativ.</li>
        </ul>
        <CodeBlock title="Fără index" kind="session" label="illustrative" code={`[student@server1 ~]$ man -k nfs\nnfs: nothing appropriate.`} />
        <p className="small">Dacă primești „nothing appropriate” pentru un termen sigur existent, indexul poate lipsi sau fi vechi: <code>sudo mandb</code> și încearcă din nou.</p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><code>man -w NUME</code> arată fișierul paginii și confirmă că pagina există.</li>
            <li>Pentru a ști că ai pagina corectă, verifică antetul: <code>NUME(secțiune)</code>.</li>
            <li><code>rpm -q man-db</code> și <code>rpm -qd PACHET</code> confirmă că documentația este instalată.</li>
            <li>Test practic: găsește singur, fără internet, opțiunea de sortare după timp a lui <code>ls</code> (răspuns în laborator).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Documentația nu se „configurează”; ce poți schimba este <b>accesul la ea</b>. Instalarea pachetelor de documentație și reconstruirea indexului (<code>mandb</code>) modifică fișiere pe disc și supraviețuiesc reboot-ului.
            Variabila <code>MANPAGER</code>/<code>PAGER</code> exportată într-un terminal dispare cu sesiunea; pentru permanență intră în <code>~/.bashrc</code> (L1.1).
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<code>No manual entry for X</code>, 'pagina nu există sau e în altă secțiune', <><code>man -k X</code>, <code>whatis X</code></>, <>încearcă <code>man 5 X</code> / <code>man 8 X</code>; verifică pachetul cu <code>rpm -qd</code></>],
          [<code>nothing appropriate</code>, 'indexul man nu e construit', <code>ls /var/cache/man</code>, <><code>sudo mandb</code></>],
          ['pagina din secțiunea greșită (de exemplu comanda în loc de fișier)', 'man alege prima secțiune', 'antetul paginii: NUME(1) vs NUME(5)', <>cere secțiunea: <code>man 5 NUME</code></>],
          ['nu poți ieși din pager', 'nu știi tasta', '—', <>apasă <code>q</code></>],
          [<><code>--help</code> afișează o eroare, nu un ajutor</>, 'comanda nu are --help (stil mai vechi)', <code>man comandă</code>, 'folosește man sau info'],
          ['lipsesc complet paginile man', 'sistem minimal sau pachet fără documentație', <><code>rpm -q man-db man-pages</code></>, 'instalează pachetele de documentație (C2); la examen, folosește ce există'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Citești <code>man passwd</code> când ai nevoie de formatul fișierului: pagina corectă este <code>man 5 passwd</code>.</>,
          <>Căutarea prea îngustă cu <code>man -k</code>: folosește un cuvânt generic (<code>selinux</code>, <code>firewall</code>) și parcurge descrierile.</>,
          <>Citirea doar a primului paragraf al paginii: opțiunile și exemplele sunt mai jos; folosește <code>/</code> pentru a sări la ele.</>,
          <>Încercarea de a căuta documentația unui builtin cu <code>man cd</code> (folosește <code>help cd</code> sau <code>man bash</code>).</>,
          <>Pierderea timpului la examen: exersează să găsești informația în sub un minut; <code>SEE ALSO</code> te duce la paginile înrudite.</>,
          <>Presupunerea că internetul sau notițele sunt permise: sursa oficială precizează că nu există acces la internet și nici documentație personală.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ordinea căutării, MANPATH și paginile de configurare SELinux">
        <p>
          <code>man</code> caută în directoarele din <code>MANPATH</code> (sau cele implicite din configurația man-db) și, pentru un nume fără secțiune, parcurge secțiunile într-o ordine implicită, unde 1 vine înaintea lui 5.
          Cu <code>man -a NUME</code> se afișează, pe rând, toate paginile cu acel nume. Opțiunea <code>-w</code> arată unde se află fișierul și este o metodă bună să afli ce pagină ai deschis.
        </p>
        <p>
          Pe sistemele cu SELinux, paginile de manual pentru politici (de exemplu pentru servicii) pot fi generate sau instalate separat de pachetele de politică; dacă la un capitol viitor nu găsești o pagină așteptată,
          verifică pachetele de documentație și rulează <code>mandb</code> (vezi C10). Aceasta este o observație practică de verificat în laborator, nu o garanție valabilă pe orice instalare.
        </p>
        <p>
          <b>info vs man.</b> man este organizat ca referință: o singură pagină, scurtă, scrisă pentru consultare. info este organizat ca un manual: capitole, indexuri, exemple extinse. Multe unelte GNU păstrează documentația completă doar în info; paginile lor man sunt rezumate.
        </p>
      </DeepDive>
    </>
  );
}

export const L1_2: TopicModule = {
  id: 'L1.2',
  subtitle: 'man, info, --help și /usr/share/doc: cum găsești răspunsul fără internet',
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
  labs: [LAB_L1_2],
  sources: [
    { kind: 'man', ref: 'man(1): opțiunile -k, -f, -w, -a; secțiunile paginilor (man(7) / intro)' },
    { kind: 'man', ref: 'apropos(1), whatis(1), mandb(8), less(1), info(1), rpm(8) (opțiunile -q, -d)' },
    { kind: 'man', ref: 'bash(1): comanda internă help' },
    { kind: 'doc', ref: 'Red Hat Enterprise Linux 10 — secțiunea de documentație despre linia de comandă / „Configuring basic system settings” (docs.redhat.com), de verificat la review' },
  ],
};
