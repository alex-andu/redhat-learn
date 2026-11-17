import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L9_3A, LAB_L9_3B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <b>grup</b> este o listă de utilizatori care primesc aceleași drepturi asupra fișierelor și resurselor. Fiecare grup are un nume și un număr (<G id="gid">GID</G>) și este definit în <G id="etc-group"><code>/etc/group</code></G>. Un utilizator are un <G id="primary-group">grup primar</G> și, opțional, mai multe <G id="supplementary-group">grupuri suplimentare</G>. Grupurile se creează cu <code>groupadd</code>, se modifică cu <code>groupmod</code>, se șterg cu <code>groupdel</code>; apartenența se gestionează cu <code>usermod -aG</code> sau <G id="gpasswd"><code>gpasswd</code></G>.
          </p>
          <p>Obiectivul oficial: <i>„Create, delete, and modify local groups and group memberships”</i>. Verificare: <code>id NUME</code>, <code>getent group GRUP</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: drepturi pentru mai mulți oameni, fără a le da fiecăruia separat</h4>
          <p>
            Imaginează-ți o echipă de cinci dezvoltatori care trebuie să scrie în directorul <code>/srv/proiect</code>. Permisiunile unui fișier (L1.8) cunosc trei categorii: proprietarul, <b>un singur grup</b> și „ceilalți”. Fără grupuri, ai putea doar să faci directorul public (periculos) sau să-l dai unui singur utilizator. Cu un grup <code>devs</code> care conține cei cinci, scrii o dată regula „grupul devs poate scrie” și gata; când vine un nou coleg, îl adaugi în grup, fără să atingi permisiunile fișierelor.
          </p>
          <Analogy>
            Grupul este un <b>club</b> cu o listă de membri la ușă. Directorul spune „intră doar clubul <i>devs</i>”. Portarul (kernelul) verifică lista: dacă ești pe ea, intri. Adăugarea unui membru nou este o linie în listă; nu schimbi lacătul (permisiunile).
          </Analogy>

          <h4>Grup primar și grupuri suplimentare</h4>
          <Table head={['', 'Grup primar', 'Grupuri suplimentare']} rows={[
            ['Câți are un utilizator', 'exact unul', 'zero sau mai multe'],
            ['Unde e scris', <>câmpul 4 din <code>/etc/passwd</code> (număr GID)</>, <>câmpul 4 din <code>/etc/group</code> (lista de membri)</>],
            ['Rol principal', 'grupul care primește fișierele NOI create de utilizator', 'drepturi de acces suplimentare (ex. wheel pentru sudo)'],
            ['Setare', <><code>useradd -g</code>, <code>usermod -g</code></>, <><code>useradd -G</code>, <code>usermod -aG</code>, <code>gpasswd -a</code></>],
            ['Apare în câmpul de membri din /etc/group?', 'NU (doar dacă e și suplimentar)', 'DA'],
          ]} />
          <p>
            <b>Capcana clasică:</b> dacă te uiți doar la <code>/etc/group</code>, nu vezi utilizatorii care au grupul respectiv ca <i>primar</i>. Pentru lista completă a grupurilor unui utilizator folosești <code>id NUME</code>.
          </p>

          <h4>Grupuri de sistem și grupuri obișnuite</h4>
          <p>
            Ca la utilizatori, GID-urile sub 1000 (<code>SYS_GID_MIN</code>…<code>SYS_GID_MAX</code>) sunt rezervate grupurilor de sistem; cele ≥1000 (<code>GID_MIN</code>) sunt grupuri obișnuite (<code>groupadd(8)</code>: implicit <code>GID_MIN</code> = 1000, <code>GID_MAX</code> = 60000; <code>-r</code> creează grup de sistem). Un exemplu important: grupul <code>wheel</code> (de obicei GID 10 pe RHEL): ai învățat în L1.10 că membrii lui pot folosi <code>sudo</code>; în L9.4 vedem de ce.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. /etc/group: patru câmpuri</h4>
          <CodeBlock title="/etc/group (o linie)" kind="config" label="illustrative" code={`devs:x:1010:alice,bob`} explain={[
            ['devs', 'câmpul 1 — numele grupului. Reguli (groupadd(8)): litere, cifre, _ și -; nu începe cu -, nu e doar cifre; maxim 32 de caractere.'],
            ['x', 'câmpul 2 — marcaj „parola de grup este în /etc/gshadow”.'],
            ['1010', 'câmpul 3 — GID: numărul grupului.'],
            ['alice,bob', 'câmpul 4 — membrii SUPLIMENTARI, separați prin virgulă, fără spații. Utilizatorii care au grupul ca primar nu sunt neapărat listați aici.'],
          ]} />
          <p>
            <code>/etc/gshadow</code> are formatul <code>nume:parolă:administratori:membri</code> și este citibil doar de root. Parolele de grup sunt o problemă de securitate (<code>gpasswd(1)</code>) și nu le vei folosi.
          </p>

          <h4>2. Cum află kernelul grupurile unui proces</h4>
          <p>
            La autentificare, sistemul citește grupurile utilizatorului (primar + suplimentare) și le atașează <b>procesului</b> shell-ului, ca o listă de numere. Toate procesele copil moștenesc lista. Când accesezi un fișier, kernelul compară GID-urile procesului cu GID-ul fișierului.
          </p>
          <Callout kind="warn" title="Sesiunile deja deschise NU văd grupurile noi">
            Lista de grupuri este fixată <b>la login</b>. Dacă te adaugi într-un grup, shell-ul curent nu se schimbă. Ai trei variante: (1) te deconectezi și te conectezi din nou; (2) <code>newgrp NUME_GRUP</code> deschide un shell nou cu acel grup ca primar (activ); (3) <code>su - utilizator</code> pornește o sesiune nouă. Verifici cu <code>id</code> în sesiunea curentă: dacă lipsește grupul, nu ai primit încă drepturile.
          </Callout>

          <h4>3. Ce face groupadd</h4>
          <ol>
            <li>Verifică numele (cod <code>9</code> dacă există) și, dacă dai <code>-g</code>, GID-ul (cod <code>4</code> dacă e ocupat, fără <code>-o</code>).</li>
            <li>Alege GID: cel mai mic ≥ <code>GID_MIN</code> și mai mare decât al oricărui grup existent (sau din intervalul de sistem cu <code>-r</code>).</li>
            <li>Adaugă o linie în <code>/etc/group</code> și una în <code>/etc/gshadow</code> (cu <code>!</code> în câmpul parolei, adică „fără parolă”).</li>
          </ol>

          <h4>4. Ce face groupmod, ce face groupdel</h4>
          <ul>
            <li><code>groupmod -n NOU VECHI</code> redenumește; GID-ul rămâne, deci fișierele rămân ale aceluiași grup (aceleași numere, alt nume).</li>
            <li><code>groupmod -g NOU_GID GRUP</code> schimbă GID-ul. Utilizatorii cu acel grup primar îl păstrează, dar <b>fișierele cu GID-ul vechi nu se reproprietează</b>: le corectezi manual cu <code>chgrp</code>/<code>find</code> (<code>groupmod(8)</code>).</li>
            <li><code>groupdel GRUP</code> șterge liniile din <code>/etc/group</code> și <code>/etc/gshadow</code>. <b>Nu poți șterge grupul primar al unui utilizator existent</b> (cod 8): întâi muți utilizatorul într-un alt grup primar sau îl ștergi. Fișierele grupului rămân cu GID numeric (orfane).</li>
          </ul>

          <h4>5. -G, -aG și gpasswd: cum modifici apartenența</h4>
          <Table head={['Comandă', 'Ce face', 'Atenție']} rows={[
            [<code>usermod -G g1,g2 user</code>, <b>ÎNLOCUIEȘTE</b>, 'lista suplimentară cu exact g1,g2; orice alt grup suplimentar se pierde'],
            [<code>usermod -aG g1 user</code>, <b>ADAUGĂ</b>, '-a (append) doar cu -G; păstrează grupurile existente'],
            [<code>gpasswd -a user g1</code>, 'adaugă un utilizator într-un grup', 'forma „grup-orientată”; nu atinge celelalte grupuri'],
            [<code>gpasswd -d user g1</code>, 'scoate un utilizator dintr-un grup', 'singura metodă simplă de ștergere a unei apartenențe, pe lângă -G cu lista completă'],
            [<code>gpasswd -M u1,u2 g1</code>, 'setează lista completă de membri a grupului', 'înlocuiește toți membrii'],
            [<code>groupmod -aU u1,u2 g1</code>, 'adaugă membri prin groupmod', 'forma -a -U (de confirmat disponibilitatea pe versiunea ta)'],
          ]} />
          <Callout kind="warn" title="usermod -G fără -a este cea mai frecventă greșeală">
            <code>sudo usermod -G devs alice</code> scoate <code>alice</code> din <code>wheel</code> (și din orice alt grup suplimentar) și o lasă doar în <code>devs</code>. Pentru adăugare scrii <b>întotdeauna</b> <code>usermod -aG</code>.
          </Callout>

          <h4>6. Directoare de colaborare (legătura cu permisiunile)</h4>
          <p>
            Scopul final al grupurilor este accesul la fișiere. Rețeta clasică (L6.5, L1.8): directorul aparține grupului <code>devs</code> (<code>chgrp devs /srv/proiect</code>), are permisiuni <code>2770</code> (<code>rwxrws---</code>): <code>rwx</code> pentru proprietar și grup, nimic pentru ceilalți, iar bitul <b>setgid</b> (<code>g+s</code>) face ca fișierele noi create înăuntru să primească automat grupul directorului, nu grupul primar al creatorului. Așa toți membrii pot edita fișierele celorlalți.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Conturi (L9.1):</b> <code>useradd -g/-G</code> și <code>usermod -g/-G</code> lucrează cu grupuri existente; grupul privat (UPG) se creează automat.</li>
            <li><b>Permisiuni (L1.8, L6.5):</b> <code>chgrp</code>, <code>chmod g+s</code>, ACL-urile (în afara v1) și <code>ls -l</code> folosesc GID-uri.</li>
            <li><b>sudo (L9.4):</b> <code>%wheel</code> și orice alt <code>%grup</code> din sudoers se bazează pe apartenență.</li>
            <li><b>Servicii:</b> multe servicii folosesc grupuri pentru acces la resurse: de exemplu <code>systemd-journal</code> permite citirea jurnalului fără root (L4.7/L4.8; de confirmat pe RHEL 10).</li>
            <li><b>NFS (L6.3):</b> apartenența la grup se transmite prin GID-uri numerice; GID-uri diferite între client și server produc accesuri greșite.</li>
            <li><b>SELinux (C10):</b> controlul DAC (grupuri/permisiuni) este verificat <i>înaintea</i> celui SELinux; un acces permis de grup poate fi totuși refuzat de SELinux.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>O echipă nouă are nevoie de un director comun: creezi grupul, adaugi membrii, setezi directorul.</li>
            <li>Un angajat primește drepturi de administrator: îl adaugi în <code>wheel</code> (<code>usermod -aG wheel NUME</code>).</li>
            <li>Un angajat își schimbă echipa: îl scoți dintr-un grup (<code>gpasswd -d</code>) și îl adaugi în altul.</li>
            <li>Redenumești un departament: <code>groupmod -n</code>.</li>
            <li>Examen: „create group <code>sysadms</code> with GID 30000”, „add <code>alice</code> to <code>sysadms</code> without removing other groups”, „create <code>/srv/proj</code> shared by <code>devs</code>”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu pe o mașină de test, ca <code>student</code> cu <code>sudo</code>. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Grupurile (<code>devs</code>, <code>ops</code>, <code>sysadms</code>) și numerele (GID 30000 etc.) sunt fictive; <code>alice</code> și <code>bob</code> vin din L9.1.
        </Callout>

        <h4>1. Vezi grupurile</h4>
        <CodeBlock title="comenzi" code={`id\nid alice\nid -Gn alice\nid -gn alice\ngroups alice\ngetent group wheel\ngetent group 10\ngrep '^devs:' /etc/group\nsudo grep '^devs:' /etc/gshadow\ngrep -E '^(GID|SYS_GID)_(MIN|MAX)' /etc/login.defs\ngetent group | tail -5`} explain={[
          ['id', 'uid, gid (primar) și groups (toate) ale utilizatorului curent.'],
          ['id -Gn alice', '-G = toate ID-urile de grup; -n = nume în loc de numere.'],
          ['id -gn alice', '-g = doar grupul primar; -n = ca nume.'],
          ['groups alice', 'lista numelor grupurilor (primar + suplimentare).'],
          ['getent group wheel', 'linia grupului, prin NSS (include grupuri din surse externe, ca sssd). Cod 2 = nu există.'],
          ['getent group 10', 'căutare după GID, nu după nume.'],
          ["grep '^devs:' /etc/group", 'citire directă din fișier; atenție, nu arată utilizatorii cu devs ca grup primar.'],
          ['sudo grep … /etc/gshadow', 'doar root poate citi gshadow.'],
          ['getent group | tail -5', 'ultimele 5 grupuri.'],
        ]} />

        <h4>2. Creează un grup</h4>
        <CodeBlock title="comenzi" code={`sudo groupadd devs\nsudo groupadd -g 30000 sysadms\nsudo groupadd -r svcgrp\nsudo groupadd -f devs\nsudo groupadd -U alice,bob ops\ngetent group devs sysadms svcgrp ops`} explain={[
          ['groupadd devs', 'GID automat (primul liber ≥ GID_MIN, mai mare decât al oricărui grup).'],
          ['-g 30000', '--gid: GID-ul cerut. Eroare cod 4 dacă e ocupat; -o permite un GID duplicat (rar necesar).'],
          ['-r', '--system: grup de sistem (GID din intervalul SYS_GID_*).'],
          ['-f', '--force: dacă grupul există deja, iese cu succes (util în scripturi).'],
          ['-U alice,bob', '--users: adaugă lista de utilizatori ca membri la creare (listă cu virgule, fără spații).'],
          ['getent group …', 'mai multe nume odată: afișează câte o linie pentru fiecare.'],
        ]} />

        <h4>3. Adaugă și scoate membri</h4>
        <CodeBlock title="comenzi" code={`sudo usermod -aG devs alice\nsudo usermod -aG devs,ops bob\nid alice\nsudo gpasswd -a alice ops\nsudo gpasswd -d alice ops\nsudo gpasswd -M alice,bob devs\nsudo usermod -g devs alice\nsudo usermod -G wheel,devs alice\nid alice`} explain={[
          ['usermod -aG devs alice', '-a = append, -G = grupuri suplimentare: ADAUGĂ devs la lista existentă a lui alice.'],
          ['-aG devs,ops bob', 'mai multe grupuri odată, separate prin virgulă, fără spații.'],
          ['gpasswd -a alice ops', 'adaugă alice în ops (nu atinge celelalte grupuri).'],
          ['gpasswd -d alice ops', 'scoate alice din ops.'],
          ['gpasswd -M alice,bob devs', '-M = setează LISTA COMPLETĂ de membri a grupului devs (înlocuiește).'],
          ['usermod -g devs alice', '-g (mic) = schimbă grupul PRIMAR.'],
          ['usermod -G wheel,devs alice', '-G fără -a = ÎNLOCUIEȘTE lista suplimentară cu exact acestea: alice își pierde restul.'],
        ]} />
        <Callout kind="tip" title="Sesiunea curentă">
          Dacă te-ai adăugat pe tine într-un grup, <code>id</code> nu îl va arăta în sesiunea curentă. Verifică într-o sesiune nouă: <code>sudo su - student -c id</code> sau <code>ssh localhost id</code>, ori folosește <code>newgrp devs</code>. Pentru <i>alt</i> utilizator, verifici cu <code>id alice</code>, care citește mereu starea curentă din fișiere.
        </Callout>

        <h4>4. Modifică și șterge grupuri</h4>
        <CodeBlock title="comenzi" code={`sudo groupmod -n engineers devs\ngetent group engineers\nsudo groupmod -g 31000 sysadms\nsudo find / -xdev -gid 30000 2>/dev/null | head\nsudo groupdel svcgrp\nsudo groupdel ops\ngetent group svcgrp\necho "exit=$?"\nsudo groupdel alice`} explain={[
          ['groupmod -n engineers devs', '-n = redenumește (NOU apoi VECHI); GID-ul și membrii rămân.'],
          ['groupmod -g 31000 sysadms', '-g = schimbă GID-ul; fișierele cu 30000 NU sunt reproprietate.'],
          ['find / -xdev -gid 30000', 'caută fișierele rămase cu GID-ul vechi (-gid = după GID numeric).'],
          ['groupdel svcgrp', 'șterge grupul.'],
          ['groupdel alice', 'va eșua dacă alice este grupul primar al unui utilizator: cod 8 („cannot remove the primary group of user”).'],
        ]} />

        <h4>5. Director partajat de un grup (legătura cu permisiunile)</h4>
        <CodeBlock title="comenzi" code={`sudo mkdir -p /srv/proiect\nsudo chgrp devs /srv/proiect\nsudo chmod 2770 /srv/proiect\nls -ld /srv/proiect\nsudo -u alice touch /srv/proiect/f1\nls -l /srv/proiect`} explain={[
          ['mkdir -p', 'creează directorul (și părinții, dacă lipsesc).'],
          ['chgrp devs', 'schimbă GRUPUL proprietar al directorului.'],
          ['chmod 2770', 'octal: 2 = setgid, 7 = rwx proprietar, 7 = rwx grup, 0 = nimic pentru ceilalți.'],
          ['ls -ld', 'trebuie să vezi drwxrws---: litera s la grup = setgid.'],
          ['sudo -u alice touch …', 'creează un fișier ca alice: va primi grupul devs (nu grupul primar al lui alice) datorită setgid.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="id înainte și după usermod -aG" kind="session" label="illustrative" code={`[student@server1 ~]$ id alice
uid=2002(alice) gid=2002(alice) groups=2002(alice),10(wheel)
[student@server1 ~]$ sudo usermod -aG devs alice
[student@server1 ~]$ id alice
uid=2002(alice) gid=2002(alice) groups=2002(alice),10(wheel),1010(devs)
[student@server1 ~]$ sudo usermod -G ops alice
[student@server1 ~]$ id alice
uid=2002(alice) gid=2002(alice) groups=2002(alice),1011(ops)`} />
        <p className="small">
          După <code>-aG devs</code>, <code>devs</code> s-a adăugat, iar <code>wheel</code> a rămas. După <code>-G ops</code> (fără <code>-a</code>), lista suplimentară a fost <b>înlocuită</b>: <code>wheel</code> și <code>devs</code> au dispărut. Grupul primar (<code>gid=2002(alice)</code>) nu a fost atins. Numerele sunt ilustrative.
        </p>
        <CodeBlock title="getent group și grupul primar" kind="session" label="illustrative" code={`[student@server1 ~]$ getent group devs
devs:x:1010:bob
[student@server1 ~]$ id -Gn carol
devs
[student@server1 ~]$ getent passwd carol | cut -d: -f4
1010`} />
        <p className="small">
          <code>carol</code> are <code>devs</code> ca grup <b>primar</b> (GID 1010 în câmpul 4 din passwd), deci NU apare în lista de membri din <code>/etc/group</code>, deși <code>id</code> o arată în grup. De aceea nu te baza doar pe <code>grep</code> în <code>/etc/group</code>.
        </p>
        <CodeBlock title="groupdel pe un grup primar" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo groupdel carolgrp
groupdel: cannot remove the primary group of user 'carol'
[student@server1 ~]$ echo $?
8`} />
        <p className="small">
          Codul <code>8</code> din <code>groupdel(8)</code>: grupul este primar al unui utilizator existent. Soluție: <code>sudo usermod -g ALT_GRUP carol</code> sau ștergi utilizatorul, apoi repeți <code>groupdel</code>. Textul exact al mesajului poate diferi.
        </p>
        <CodeBlock title="director setgid" kind="session" label="illustrative" code={`[student@server1 ~]$ ls -ld /srv/proiect
drwxrws---. 2 root devs 6 Nov 17 11:02 /srv/proiect
[student@server1 ~]$ ls -l /srv/proiect
-rw-r--r--. 1 alice devs 0 Nov 17 11:03 f1`} />
        <p className="small">
          <code>rws</code> la grup: <code>r</code> și <code>w</code> plus <code>s</code> (setgid cu execuție). Fișierul nou <code>f1</code> are proprietarul <code>alice</code> și grupul <code>devs</code> (moștenit de la director). Doar membrii lui <code>devs</code> pot intra; ceilalți primesc „Permission denied” (permisiuni <code>---</code>).
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Grupul există:</b> <code>getent group NUME</code> (cod 0); GID-ul cerut în câmpul 3.</li>
            <li><b>Apartenența:</b> <code>id NUME</code> sau <code>id -Gn NUME</code> (include grupul primar). <code>getent group GRUP</code> arată doar membrii suplimentari.</li>
            <li><b>Grupul primar:</b> <code>id -gn NUME</code>.</li>
            <li><b>Ștergere:</b> <code>getent group NUME</code> → fără rezultat, cod 2.</li>
            <li><b>Directorul partajat:</b> <code>ls -ld DIR</code> (litera <code>s</code>), apoi creezi un fișier ca un membru: <code>sudo -u alice touch DIR/t; ls -l DIR/t</code>.</li>
            <li><b>Accesul efectiv:</b> <code>sudo -u alice test -w DIR &amp;&amp; echo scriere-ok</code> sau <code>sudo -u bob ls DIR</code> (pentru un nemembru trebuie să dea „Permission denied”).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Grupurile și apartenența sunt scrise în <code>/etc/group</code> și <code>/etc/gshadow</code>: <b>persistă la reboot</b>. Permisiunile directorului (<code>chgrp</code>, <code>chmod</code>) sunt pe sistemul de fișiere: persistă dacă acesta este montat la boot (L5.5).
          </p>
          <p>
            Ce nu persistă: <code>newgrp</code> (afectează doar shell-ul pornit) și un <code>id</code> „vechi” al unei sesiuni nereînnoite.
          </p>
          <p>Confirmare manuală după <code>sudo reboot</code>: <code>id alice</code>, <code>getent group devs</code>, <code>ls -ld /srv/proiect</code>.</p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<>„Permission denied” deși utilizatorul a fost adăugat în grup</>, 'sesiunea veche nu are grupul nou', <><code>id</code> (în sesiunea utilizatorului)</>, 'deconectare/reconectare, sau newgrp GRUP'],
          [<>Utilizatorul a pierdut grupuri după usermod</>, 'ai folosit -G fără -a', <code>id NUME</code>, <><code>sudo usermod -aG g1,g2 NUME</code> cu grupurile pierdute</>],
          [<>groupadd: group 'X' already exists (cod 9)</>, 'numele e folosit', <code>getent group X</code>, 'alt nume sau -f în scripturi'],
          [<>groupadd: GID 'N' already exists (cod 4)</>, 'GID ocupat', <code>getent group N</code>, 'alt GID (sau -o, dacă vrei cu adevărat duplicat)'],
          [<>groupdel: cannot remove the primary group of user 'U' (cod 8)</>, 'grup primar al unui utilizator', <><code>getent passwd | cut -d: -f1,4</code></>, <>schimbă grupul primar al utilizatorului (<code>usermod -g</code>) sau șterge utilizatorul</>],
          [<>usermod: group 'X' does not exist</>, 'grupul nu a fost creat', <code>getent group X</code>, <><code>sudo groupadd X</code></>],
          [<>Fișierele noi din director au grupul greșit</>, 'lipsește setgid pe director', <code>ls -ld DIR</code>, <><code>sudo chmod g+s DIR</code></>],
          [<>ls arată GID numeric</>, 'grupul a fost șters sau GID schimbat', <><code>find / -xdev -nogroup</code></>, <><code>chgrp</code> cu grupul corect</>],
          [<>Membrii nu pot scrie în director</>, 'lipsește w pentru grup sau grup greșit', <code>ls -ld DIR</code>, <><code>sudo chmod g+rwx DIR</code> și <code>sudo chgrp GRUP DIR</code></>],
          [<>gpasswd: user 'U' does not exist</>, 'utilizator inexistent', <code>getent passwd U</code>, 'creează utilizatorul sau corectează numele'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <><code>usermod -G</code> fără <code>-a</code>: înlocuiește lista de grupuri. Folosește <code>-aG</code>.</>,
          <>Spații în lista de grupuri (<code>-aG devs, ops</code>): trebuie <code>devs,ops</code>.</>,
          <>Confundi <code>-g</code> (primar, mic) cu <code>-G</code> (suplimentare, mare).</>,
          <>Crezi că <code>/etc/group</code> arată toți membrii: grupul primar nu apare acolo; folosește <code>id</code>.</>,
          <>Crezi că apartenența nouă merge imediat în shell-ul deschis: este nevoie de un login nou.</>,
          <>Încerci <code>groupdel</code> pe grupul primar al cuiva: eroare cod 8.</>,
          <>Schimbi GID-ul cu <code>groupmod -g</code> și uiți fișierele cu GID-ul vechi.</>,
          <>Folosești <code>groupadd -g</code> cu un GID din intervalul de sistem fără <code>-r</code> și te miri de conflicte: verifică <code>login.defs</code>.</>,
          <>Dai <code>chmod 770</code> în loc de <code>2770</code> pe directorul de echipă: fără setgid, fișierele noi primesc grupul primar al creatorului.</>,
          <>Folosești <code>gpasswd</code> cu parole de grup: nu e cerut și e o practică slabă.</>,
          <>Pui utilizatorul în <code>wheel</code> ca „grup de echipă”: wheel dă acces sudo (L9.4).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: gshadow, administratori de grup, newgrp, limite și grupuri speciale">
        <p>
          <b>gshadow și administratori:</b> <code>gpasswd -A user grup</code> numește un <i>administrator de grup</i>, care poate adăuga și scoate membri fără a fi root (<code>gpasswd(1)</code>); <code>-M</code> setează membrii. Pe RHEL acest model este rar folosit față de administrarea centralizată.
        </p>
        <p>
          <b>newgrp:</b> pornește un subshell cu un alt grup primar activ (pentru fișierele create în sesiune). Dacă grupul are parolă setată, nemembrii pot intra doar cu parola; <code>gpasswd -r</code> o elimină, <code>gpasswd -R</code> restricționează intrarea la membri (<code>gpasswd(1)</code>). Pagina <code>newgrp(1)</code> nu a fost citită.
        </p>
        <p>
          <b>Limite:</b> kernelul acceptă un număr limitat de grupuri suplimentare per proces (de ordinul sutelor/miilor, dependent de versiune); NFS v3 clasic transmite doar primele 16 (cunoștințe, nesigur; nu face parte din obiectiv).
        </p>
        <p>
          <b>MAX_MEMBERS_PER_GROUP:</b> setare din <code>login.defs</code> care împarte liniile foarte lungi din <code>/etc/group</code> (implicit 0 = fără limită).
        </p>
        <p>
          <b>Grupuri speciale pe RHEL:</b> <code>wheel</code> (sudo), <code>systemd-journal</code> (acces la jurnal), <code>users</code> (nefolosit implicit pentru conturi noi, grupul implicit al lui <code>useradd -D</code> este 100: de confirmat pe RHEL 10). Nu modifica grupurile de sistem fără motiv.
        </p>
        <p>
          <b>groupmod -aU:</b> adaugă membri fără a înlocui lista (<code>groupmod(8)</code>); echivalent cu mai multe <code>gpasswd -a</code>.
        </p>
      </DeepDive>
    </>
  );
}

export const L9_3: TopicModule = {
  id: 'L9.3',
  subtitle: '/etc/group, groupadd, groupmod, groupdel, usermod -aG, gpasswd, id; grup primar vs suplimentar, director setgid',
  studyTime: '≈105 min studiu + laborator',
  sections: [
    { id: 'intro', label: 'Pe scurt', code: '1' },
    { id: 'what', label: 'Ce este și de ce există', code: '2' },
    { id: 'how', label: 'Cum funcționează intern', code: '3' },
    { id: 'interact', label: 'Interacțiuni', code: '4' },
    { id: 'when', label: 'Când o folosim', code: '5' },
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
  labs: [LAB_L9_3A, LAB_L9_3B],
  sources: [
    { kind: 'man', ref: 'groupadd(8), groupmod(8), groupdel(8), gpasswd(1), usermod(8), useradd(8), id(1) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'group(5), gshadow(5), newgrp(1), groups(1), chgrp(1) — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com: HTTP 403 la 2026-11-17, necitită; de confirmat grupurile implicite și GID-ul lui wheel' },
  ],
};
