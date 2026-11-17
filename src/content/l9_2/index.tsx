import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L9_2A, LAB_L9_2B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Parola unui cont nu este stocată: sistemul păstrează doar un <G id="password-hash">hash</G> în <G id="etc-shadow"><code>/etc/shadow</code></G>. O schimbi cu <G id="passwd-cmd"><code>passwd</code></G>. <G id="password-aging">Password aging</G> înseamnă reguli de timp pentru parolă (minim, maxim, avertizare, inactivitate) și pentru cont (expirare); le vezi și le schimbi cu <G id="chage"><code>chage</code></G>. Blocarea parolei (<G id="account-lock">lock</G>) și expirarea contului sunt lucruri diferite.
          </p>
          <p>Obiectivul oficial: <i>„Change passwords and adjust password aging for local user accounts”</i>. Verificare: <code>sudo chage -l NUME</code> și <code>sudo passwd -S NUME</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: cum dovedești cine ești, fără ca sistemul să știe parola ta</h4>
          <p>
            Dacă sistemul ar păstra parolele în clar, oricine ar citi fișierul (un administrator curios, un atacator, o copie de rezervă furată) ar vedea toate parolele. De aceea sistemul stochează un <b>hash</b>: rezultatul unei funcții matematice într-un singur sens. La login, calculează hash-ul parolei introduse și îl compară cu cel stocat. Dacă sunt egale, ești tu; parola în clar nu este niciodată păstrată.
          </p>
          <Analogy>
            Este ca amprenta digitală: poți compara o amprentă cu una arhivată, dar din amprentă nu poți reconstrui degetul. Mai mult, sistemul adaugă o <b>sare</b> (salt, un șir aleator diferit pentru fiecare cont) înainte de calcul: doi utilizatori cu aceeași parolă au hash-uri diferite.
          </Analogy>

          <h4>Problema a doua: parolele „îmbătrânesc”</h4>
          <p>
            O parolă folosită ani de zile are mai multe șanse să fi fost văzută, ghicită sau scursă. Politicile de securitate cer schimbarea periodică, avertizare înainte de expirare și dezactivarea conturilor abandonate. Toate aceste reguli se numesc <b>password aging</b> și sunt stocate în aceeași linie din <code>/etc/shadow</code>.
          </p>

          <h4>Patru lucruri diferite, des confundate</h4>
          <Table head={['Concept', 'Ce înseamnă', 'Cum îl schimbi', 'Efect']} rows={[
            ['Parola blocată (lock)', 'hash-ul primește un prefix ! și nu mai poate fi potrivit', <><code>passwd -l</code>, <code>usermod -L</code></>, 'login cu PAROLĂ imposibil; alte metode (cheie SSH) pot merge'],
            ['Parola expirată', 'a trecut data maximă de valabilitate', <><code>chage -M</code>, <code>passwd -x</code>, <code>chage -d 0</code></>, 'la următorul login utilizatorul este obligat să o schimbe'],
            ['Inactivitate', 'zile după expirarea parolei în care mai poate intra să o schimbe', <><code>chage -I</code>, <code>passwd -i</code></>, 'după această perioadă contul este blocat'],
            ['Contul expirat', 'data după care contul nu mai e valid, indiferent de parolă', <><code>chage -E</code>, <code>usermod -e</code></>, 'contul este dezactivat complet'],
          ]} />
          <p>
            Reține: <b>blocarea parolei NU dezactivează contul</b> (<code>passwd(1)</code>). Pentru dezactivare completă, se setează și data expirării la o dată trecută: <code>usermod -e 1</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Cele nouă câmpuri din /etc/shadow</h4>
          <CodeBlock title="/etc/shadow (o linie)" kind="config" label="illustrative" code={`alice:$6$Zx9...salt...$q4...hash...:20409:7:90:14:30:20800:`} explain={[
            ['alice', 'câmpul 1 — numele contului (același ca în /etc/passwd).'],
            ['$6$salt$hash', 'câmpul 2 — parola criptată. Formatul $id$salt$hash: id-ul arată algoritmul (de exemplu $6$ = SHA-512). Dacă începe cu ! sau este ! / *, nu se poate face login cu parolă.'],
            ['20409', 'câmpul 3 — data ultimei schimbări, în zile de la 1970-01-01. 0 = schimbare obligatorie la următorul login; gol = aging dezactivat.'],
            ['7', 'câmpul 4 — vârsta minimă (zile): cât trebuie să aștepte până poate schimba din nou parola. 0 sau gol = oricând.'],
            ['90', 'câmpul 5 — vârsta maximă (zile): după acest interval parola trebuie schimbată. Gol = fără maxim.'],
            ['14', 'câmpul 6 — perioada de avertizare (zile înainte de expirare).'],
            ['30', 'câmpul 7 — perioada de inactivitate (zile după expirare în care parola mai este acceptată pentru schimbare; apoi contul se blochează).'],
            ['20800', 'câmpul 8 — data expirării CONTULUI (zile de la 1970-01-01). Gol = nu expiră.'],
            ['(gol)', 'câmpul 9 — rezervat.'],
          ]} />
          <p className="small">
            Sursa: <code>shadow(5)</code>. Dacă vârsta maximă este mai mică decât cea minimă, utilizatorul nu își poate schimba parola. Exemplul de mai sus este ilustrativ; hash-ul este prescurtat, iar numerele sunt inventate.
          </p>

          <h4>2. Linia de timp a unei parole cu aging</h4>
          <p>
            Dacă <code>ultima schimbare = Z</code>, <code>maxim = 90</code>, <code>avertizare = 14</code>, <code>inactivitate = 30</code>, atunci:
          </p>
          <Table head={['Moment', 'Zile față de Z', 'Ce se întâmplă']} rows={[
            ['Schimbare', 'Z', 'parola este nouă; nu o poți schimba iar înainte de Z + minim (dacă minimul > 0)'],
            ['Începe avertizarea', 'Z + 76 (90 − 14)', 'la login apare un avertisment: parola expiră în N zile'],
            ['Expiră parola', 'Z + 90', 'la login ești obligat să schimbi parola (încă poți intra pentru asta)'],
            ['Se blochează contul', 'Z + 120 (90 + 30)', 'după perioada de inactivitate nu mai poți intra; trebuie intervenția unui administrator'],
          ]} />
          <p>
            Independent de toate acestea, data din câmpul 8 (<b>expirarea contului</b>) oprește contul la acea dată, chiar dacă parola este încă validă.
          </p>

          <h4>3. Cine decide valorile implicite</h4>
          <p>
            Valorile implicite pentru conturile noi vin din <code>/etc/login.defs</code>: <code>PASS_MAX_DAYS</code>, <code>PASS_MIN_DAYS</code>, <code>PASS_WARN_AGE</code>. Man page-ul <code>login.defs(5)</code> precizează că ele se aplică <b>doar la crearea conturilor</b>: o modificare ulterioară a fișierului <b>nu</b> schimbă conturile existente. Pentru conturile existente folosești <code>chage</code> sau <code>passwd -x/-n/-w/-i</code>. Pe RHEL, valorile tipice sunt <code>99999</code> (practic fără expirare), <code>0</code> și <code>7</code> (de confirmat pe RHEL 10).
          </p>

          <h4>4. Cine verifică „calitatea” unei parole</h4>
          <p>
            Regulile de complexitate (lungime minimă, caractere, cuvinte de dicționar) nu sunt în <code>passwd</code>, ci în <b>PAM</b>, modulul <code>pam_pwquality</code>, configurat în <code>/etc/security/pwquality.conf</code> (de confirmat pe RHEL 10). Un utilizator obișnuit este refuzat dacă parola e prea slabă; <b>root</b> primește un avertisment, dar poate seta oricum parola altui utilizator (<code>passwd(1)</code>: rootul poate schimba orice parolă fără parola veche). La examen, parolele din cerințe sunt simple; nu depinde de pwquality.
          </p>

          <h4>5. Cum se schimbă o parolă, intern</h4>
          <ol>
            <li><code>passwd</code> (ca utilizator obișnuit) cere parola curentă (verificată prin PAM), apoi noua parolă de două ori.</li>
            <li>Parola nouă trece prin verificările de calitate (pwquality).</li>
            <li>Se calculează hash-ul cu o sare nouă și algoritmul stabilit de PAM/configurația sistemului.</li>
            <li>Se scrie în câmpul 2 din <code>/etc/shadow</code> și se actualizează câmpul 3 la data de azi.</li>
          </ol>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Conturi (L9.1):</b> un cont nou are parola blocată; <code>passwd</code> este primul pas după <code>useradd</code>. <code>useradd -e/-f</code> și <code>usermod -e/-f/-L/-U</code> ating aceleași câmpuri.</li>
            <li><b>PAM:</b> autentificarea (inclusiv <code>sudo</code>, <code>su</code>, <code>login</code>, <code>sshd</code>) trece prin PAM, care citește <code>/etc/shadow</code> și respectă aging-ul și expirarea contului.</li>
            <li><b>SSH (L1.11):</b> cu autentificare prin cheie, o parolă blocată nu te oprește (<code>passwd -l</code> nu dezactivează contul); un cont <b>expirat</b> (<code>chage -E</code>) este însă refuzat și de SSH (comportament PAM; de confirmat pe RHEL 10).</li>
            <li><b>sudo (L9.4):</b> sudo cere parola <b>utilizatorului</b> care îl invocă; o parolă expirată sau blocată afectează și sudo.</li>
            <li><b>Timp (L7.3):</b> aging-ul depinde de data sistemului: o dată greșită schimbă momentele de expirare. De aceea <code>chrony</code> contează.</li>
            <li><b>Securitate (C10):</b> fișierul <code>/etc/shadow</code> are un context SELinux dedicat și permisiuni stricte (aproape fără acces, mod 0000 pe RHEL; de confirmat).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Cont nou: setezi parola inițială și o forțezi să fie schimbată la primul login (<code>chage -d 0</code>).</li>
            <li>Utilizator care și-a uitat parola: root setează una nouă (<code>sudo passwd NUME</code>) fără să o cunoască pe cea veche.</li>
            <li>Politică de companie: parolele expiră la 90 de zile, avertizare cu 14 zile înainte.</li>
            <li>Contractor temporar: contul expiră la o dată fixă (<code>chage -E</code>).</li>
            <li>Suspendare temporară: <code>passwd -l</code> sau <code>usermod -L</code>; pentru încetarea accesului total: și <code>usermod -e 1</code>.</li>
            <li>Script de provizionare: <code>echo 'user:parola' | sudo chpasswd</code>.</li>
            <li>Examen: „set the password of <code>alice</code> to …”, „force <code>bob</code> to change password at next login”, „set maximum password age to 60 days for <code>carol</code>”, „make <code>dave</code>'s account expire on 2027-01-01”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu pe o mașină de test, ca <code>student</code> cu <code>sudo</code>. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Parolele din exemple (<code>Parola123</code>) sunt doar pentru laborator: nu folosi niciodată parole reale în exerciții. Conturile <code>alice</code>, <code>bob</code> vin din L9.1.
        </Callout>

        <h4>1. Schimbă parola</h4>
        <CodeBlock title="comenzi" code={`passwd\nsudo passwd alice\necho 'alice:Parola123' | sudo chpasswd\necho 'Parola123' | sudo passwd --stdin alice\nsudo passwd -S alice`} explain={[
          ['passwd', 'fără argument: schimbi parola TA; cere parola curentă, apoi cea nouă de două ori.'],
          ['sudo passwd alice', 'ca root setezi parola altui utilizator: nu cere parola veche. Parola nu apare pe ecran când o scrii.'],
          ["echo 'alice:Parola123' | sudo chpasswd", 'varianta non-interactivă: citește linii utilizator:parolă de la stdin. Utilă în scripturi. Atenție: parola ar rămâne în istoricul shell-ului; nu o folosi pe un sistem real.'],
          ['passwd --stdin alice', 'citește parola din stdin (opțiune a pachetului passwd de pe RHEL; de confirmat pe RHEL 10; man7 documentează -s/--stdin).'],
          ['passwd -S alice', '-S = status: 7 câmpuri; prima literă după nume: L (blocată), NP (fără parolă), P (parolă utilizabilă).'],
        ]} />

        <h4>2. Blochează / deblochează parola</h4>
        <CodeBlock title="comenzi" code={`sudo passwd -l alice\nsudo passwd -S alice\nsudo grep '^alice:' /etc/shadow | cut -c1-30\nsudo passwd -u alice\nsudo usermod -L alice\nsudo usermod -U alice\nsudo usermod -L -e 1 alice\nsudo usermod -U -e -1 alice`} explain={[
          ['passwd -l', '-l = lock: pune ! în fața hash-ului. Utilizatorul nu mai poate face login cu parolă și nu își poate schimba parola.'],
          ['passwd -u', '-u = unlock: elimină ! și restaurează parola de dinainte.'],
          ['usermod -L / -U', 'același efect, făcut cu usermod (-L lock, -U unlock). Nu se combină -L cu -U sau cu -p.'],
          ['usermod -L -e 1', 'blochează parola ȘI setează expirarea contului la ziua 1 (1970-01-02): cont dezactivat complet (cheile SSH nu mai funcționează).'],
          ['usermod -U -e -1', 'deblochează și elimină data de expirare (-1 = fără expirare).'],
          ['cut -c1-30', 'afișează doar primele 30 de caractere: nu e nevoie să vezi tot hash-ul.'],
        ]} />

        <h4>3. Forțează schimbarea la următorul login</h4>
        <CodeBlock title="comenzi" code={`sudo passwd -e alice\nsudo chage -d 0 alice\nsudo chage -l alice`} explain={[
          ['passwd -e', '-e = expire: expiră parola imediat; la următorul login utilizatorul trebuie să o schimbe.'],
          ['chage -d 0', '-d = lastday: setează „ultima schimbare” la 0, ceea ce, conform shadow(5), obligă schimbarea la următorul login. Efect echivalent cu passwd -e.'],
          ['chage -l alice', 'afișează situația: apare „password must be changed” la „Last password change”.'],
        ]} />

        <h4>4. Vezi regulile de aging</h4>
        <CodeBlock title="comenzi" code={`sudo chage -l alice\nchage -l $(whoami)\nsudo passwd -S alice\nsudo passwd -S -a | head -5\ngrep -E '^PASS_(MAX|MIN|WARN)' /etc/login.defs`} explain={[
          ['chage -l alice', '-l = list: afișează toate datele de aging în format lizibil (necesită root pentru alți utilizatori).'],
          ['chage -l $(whoami)', 'un utilizator obișnuit poate rula -l doar pentru el însuși.'],
          ['passwd -S -a', '-a (cu -S) = toți utilizatorii, câte o linie.'],
          ['grep PASS_ /etc/login.defs', 'valorile implicite pentru conturile care se vor crea de acum încolo.'],
        ]} />

        <h4>5. Schimbă regulile de aging cu chage</h4>
        <CodeBlock title="comenzi" code={`sudo chage -M 90 alice\nsudo chage -m 7 alice\nsudo chage -W 14 alice\nsudo chage -I 30 alice\nsudo chage -E 2027-12-31 alice\nsudo chage -E $(date -d '+180 days' +%F) alice\nsudo chage -d $(date +%F) alice\nsudo chage -m 7 -M 90 -W 14 -I 30 alice\nsudo chage -l alice`} explain={[
          ['-M 90', '--maxdays: parola este valabilă 90 de zile. -M -1 dezactivează verificarea (fără expirare).'],
          ['-m 7', '--mindays: minim 7 zile între două schimbări. 0 = oricând.'],
          ['-W 14', '--warndays: avertizare cu 14 zile înainte de expirare.'],
          ['-I 30', '--inactive: 30 de zile după expirarea parolei, apoi contul se blochează. -I -1 elimină.'],
          ['-E 2027-12-31', '--expiredate: data la care CONTUL expiră (YYYY-MM-DD sau zile de la 1970). -E -1 elimină expirarea.'],
          ["$(date -d '+180 days' +%F)", 'substituție de comandă: data de peste 180 de zile în format YYYY-MM-DD (exemplu din chage(1)).'],
          ['-d $(date +%F)', '--lastday: setează „ultima schimbare” la azi (repornește ceasul parolei).'],
          ['… -m 7 -M 90 -W 14 -I 30', 'mai multe opțiuni într-o singură comandă.'],
        ]} />
        <p>
          Dacă rulezi <code>sudo chage alice</code> (fără opțiuni), <code>chage</code> intră în modul <b>interactiv</b> și te întreabă valorile una câte una. La examen folosești opțiunile directe. Același lucru se poate face cu <code>passwd</code>: <code>-n</code> (minim), <code>-x</code> (maxim), <code>-w</code> (avertizare), <code>-i</code> (inactivitate): de exemplu <code>sudo passwd -x 90 -w 14 alice</code>.
        </p>

        <h4>6. Valori implicite pentru conturile noi</h4>
        <CodeBlock title="comenzi" code={`grep -E '^PASS_(MAX_DAYS|MIN_DAYS|WARN_AGE)' /etc/login.defs\nsudo cp -a /etc/login.defs /etc/login.defs.orig\nsudo sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs\nsudo useradd -m carol\nsudo chage -l carol\nsudo useradd -K PASS_MAX_DAYS=-1 -m dave`} explain={[
          ['cp -a …', 'copie de siguranță cu permisiunile păstrate.'],
          ["sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/'", '-i = editează fișierul pe loc; înlocuiește linia care începe cu PASS_MAX_DAYS.'],
          ['useradd -m carol', 'carol primește valorile din login.defs (90). Conturile EXISTENTE nu se schimbă.'],
          ['useradd -K PASS_MAX_DAYS=-1', '-K = suprascrie o valoare din login.defs doar pentru acest cont (fără expirare).'],
        ]} />
        <Callout kind="warn" title="Editarea lui /etc/login.defs nu afectează conturile existente">
          <code>login.defs(5)</code>: valorile <code>PASS_*</code> se folosesc doar la creare. Dacă cerința este „toți utilizatorii existenți”, ai nevoie de <code>chage</code> pentru fiecare (de exemplu într-o buclă <code>for u in alice bob; do sudo chage -M 90 $u; done</code>, L3.4).
        </Callout>

        <h4>7. Verifică logarea și expirarea</h4>
        <CodeBlock title="comenzi" code={`sudo su - alice\nsudo -u alice id\ndate\ndate -d '+90 days' +%F\nsudo lastlog -u alice`} explain={[
          ['sudo su - alice', 'deschide o sesiune de login ca alice (ca root, nu cere parola). Utilă pentru a vedea ce se întâmplă la login.'],
          ['sudo -u alice id', 'rulează o comandă ca alice, fără parolă.'],
          ["date -d '+90 days' +%F", 'calculează o dată viitoare, util pentru a verifica ce ți-a calculat chage.'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="chage -l" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo chage -l alice
Last password change                                    : Nov 17, 2026
Password expires                                        : Feb 15, 2027
Password inactive                                       : Mar 17, 2027
Account expires                                         : Dec 31, 2027
Minimum number of days between password change          : 7
Maximum number of days between password change          : 90
Number of days of warning before password expires       : 14`} />
        <p className="small">
          Fiecare linie corespunde unui câmp din shadow: <b>Last password change</b> = câmp 3; <b>Password expires</b> = ultima schimbare + maxim (90 de zile); <b>Password inactive</b> = expirare + 30 (aici perioada de inactivitate); <b>Account expires</b> = câmp 8; <b>Minimum / Maximum / warning</b> = câmpurile 4, 5, 6. Etichetele exacte pot diferi ușor pe RHEL 10; pagina <code>chage(1)</code> nu descrie formatul, deci aceasta este o reconstrucție ilustrativă. Valoarea <b>never</b> apare când un câmp nu este setat.
        </p>
        <CodeBlock title="parolă forțată să fie schimbată" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo chage -d 0 alice
[student@server1 ~]$ sudo chage -l alice | head -2
Last password change                                    : password must be changed
Password expires                                        : password must be changed
[student@server1 ~]$ ssh alice@localhost
alice@localhost's password:
You are required to change your password immediately (administrator enforced).
Changing password for alice.
Current password:`} />
        <p className="small">
          <code>chage -d 0</code> pune „ultima schimbare” la 0, iar <code>chage -l</code> afișează „password must be changed”. La următorul login, utilizatorul este obligat să introducă parola curentă și una nouă. Mesajele exacte (de login) depind de versiune; ilustrativ.
        </p>
        <CodeBlock title="passwd -S" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo passwd -S alice
alice PS 2026-11-17 7 90 14 30 (Password set, SHA512 crypt.)
[student@server1 ~]$ sudo passwd -l alice
Locking password for user alice.
passwd: Success
[student@server1 ~]$ sudo passwd -S alice
alice LK 2026-11-17 7 90 14 30 (Password locked.)`} />
        <p className="small">
          Pe RHEL, <code>passwd -S</code> afișează starea ca <b>PS</b> (parolă setată), <b>LK</b> (blocată) sau <b>NP</b> (fără parolă), plus un comentariu între paranteze (aici, ilustrativ; man page-ul upstream <code>passwd(1)</code> folosește L/NP/P: formatul pe RHEL 10 trebuie confirmat). Cele cinci numere: ultima schimbare, minim, maxim, avertizare, inactivitate.
        </p>
        <CodeBlock title="/etc/shadow înainte și după lock" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo grep '^alice:' /etc/shadow | cut -d: -f1,2 | cut -c1-24
alice:$6$Zx9abc...
[student@server1 ~]$ sudo passwd -l alice >/dev/null
[student@server1 ~]$ sudo grep '^alice:' /etc/shadow | cut -d: -f1,2 | cut -c1-24
alice:!$6$Zx9abc...`} />
        <p className="small">
          Blocarea adaugă <code>!</code> în fața hash-ului (<code>shadow(5)</code>: „rest of the string is the password before it was locked”); deblocarea îl scoate, deci parola veche revine. <code>cut -d: -f1,2</code> = câmpurile 1 și 2 despărțite prin două puncte; <code>cut -c1-24</code> = primele 24 de caractere (hash-ul este tăiat intenționat).
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Parola există și e utilizabilă:</b> <code>sudo passwd -S NUME</code> (stare P/PS); parola blocată = L/LK; fără parolă = NP.</li>
            <li><b>Regulile de aging:</b> <code>sudo chage -l NUME</code> — compari fiecare linie cu cerința.</li>
            <li><b>În fișier:</b> <code>sudo grep '^NUME:' /etc/shadow</code> — câmpurile 4–8.</li>
            <li><b>Forțarea schimbării:</b> <code>chage -l</code> arată „password must be changed”.</li>
            <li><b>Contul expirat:</b> „Account expires” are data cerută; testul practic: <code>sudo su - NUME</code> în loc de ssh (root nu e oprit de expirare prin <code>su</code>; verifică cu <code>chage -l</code>).</li>
            <li><b>Valori pentru conturi noi:</b> <code>grep ^PASS_ /etc/login.defs</code> și <code>sudo useradd -m test; sudo chage -l test</code>.</li>
            <li><b>Timp:</b> <code>date</code> arată data pe care se bazează toate calculele.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Toate modificările (<code>passwd</code>, <code>chage</code>, <code>usermod -L/-e</code>) sunt scrise în <code>/etc/shadow</code>: <b>persistă la reboot</b>. Nu există un mod „temporar”.
          </p>
          <p>
            Ce poate surprinde: (1) modificarea lui <code>/etc/login.defs</code> afectează doar conturile create după aceea; (2) o parolă setată cu <code>chpasswd</code> sau <code>passwd --stdin</code> rămâne în istoricul shell-ului dacă ai tastat-o în clar (<code>history</code>, L1.1); (3) o dată de sistem greșită (<code>date</code>) mută expirările.
          </p>
          <p>Confirmare manuală după <code>sudo reboot</code>: <code>sudo chage -l NUME</code> și <code>sudo passwd -S NUME</code>.</p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<>Utilizatorul nu poate face login cu parola corectă</>, 'parola blocată (!) sau contul expirat', <><code>sudo passwd -S NUME</code>, <code>sudo chage -l NUME</code></>, <><code>passwd -u</code> / <code>usermod -U</code>; corectează „Account expires”</>],
          [<>„You are required to change your password immediately”</>, 'chage -d 0 / passwd -e / parolă expirată', <code>sudo chage -l NUME</code>, 'comportament normal: utilizatorul alege o parolă nouă'],
          [<>„Authentication token manipulation error” / „Password change rejected”</>, 'parola nu respectă politica sau minimul de zile nu a trecut', <><code>chage -l</code> (minim), politica pwquality</>, 'folosește o parolă mai puternică sau așteaptă; root poate seta oricum cu passwd'],
          [<>„You must wait longer to change your password”</>, 'vârsta minimă nu a trecut', <code>sudo chage -l NUME</code>, <><code>sudo chage -m 0 NUME</code> sau așteaptă</>],
          [<>Parola nu poate fi schimbată (min &gt; max)</>, 'minim mai mare decât maxim', <code>sudo chage -l NUME</code>, <>repară valorile: <code>chage -m 0 -M 90</code></>],
          ['Login cu cheie SSH merge deși parola e blocată', 'blocarea parolei nu dezactivează contul', <code>sudo chage -l NUME</code>, <><code>sudo usermod -e 1 NUME</code> pentru dezactivare totală</>],
          ['Contul tocmai creat expiră imediat', 'dată de expirare în trecut sau de sistem greșită', <><code>date</code>, <code>chage -l</code></>, <>corectează <code>chage -E</code>; verifică chrony (L7.3)</>],
          [<>Modificarea login.defs nu are efect</>, 'valorile se aplică doar conturilor noi', <code>sudo chage -l NUME</code>, <>aplică <code>chage</code> pe conturile existente</>],
          [<>passwd: „Only root can specify a user name”</>, 'utilizator obișnuit a cerut parola altuia', <code>id</code>, <>folosește <code>sudo passwd NUME</code></>],
          [<>chpasswd: „line 1: missing new password”</>, 'format greșit al intrării', <>verifică <code>utilizator:parolă</code></>, 'folosește exact formatul NUME:PAROLA, fără spații'],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Confunzi „parola expiră” (<code>-M</code>, <code>-d 0</code>) cu „contul expiră” (<code>-E</code>): sunt câmpuri diferite.</>,
          <>Crezi că <code>passwd -l</code> dezactivează contul: oprește parola, nu cheile SSH. Pentru dezactivare: <code>usermod -e 1</code>.</>,
          <>Editezi <code>/etc/login.defs</code> și crezi că utilizatorii existenți au primit regulile: nu.</>,
          <>Uiți formatul datei: <code>YYYY-MM-DD</code>, nu <code>DD-MM-YYYY</code>.</>,
          <>Confunzi <code>-I</code> (inactivitate) cu <code>-i</code> (format de dată la <code>chage -l</code> pe unele variante) sau cu <code>passwd -i</code>; la <code>chage</code> opțiunea este <b>-I</b> (majuscul).</>,
          <>Confunzi <code>-m</code> (minim) cu <code>-M</code> (maxim) la <code>chage</code>: litera mică este minimul.</>,
          <>Forțezi schimbarea cu <code>chage -d 1</code> în loc de <code>-d 0</code>: doar <b>0</b> forțează.</>,
          <>Setezi <code>-E 0</code>: shadow(5) nu recomandă valoarea 0; folosește o dată reală sau -1.</>,
          <>Dai parola direct în comandă pe un sistem real: apare în istoric și în procese.</>,
          <>Uiți <code>sudo</code> la <code>chage -l alice</code>: doar propriul cont poate fi listat fără privilegii.</>,
          <>Crezi că root este obligat de aging: root poate seta orice, dar și contul root are linie în shadow cu aceleași câmpuri.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: algoritmi de hash, sare, pwquality, PAM și conturi fără parolă">
        <p>
          <b>Format $id$salt$hash:</b> prefixul indică algoritmul (<code>$1$</code> MD5, <code>$5$</code> SHA-256, <code>$6$</code> SHA-512; <code>$y$</code> yescrypt pe sisteme noi). Man page-ul <code>passwd(1)</code> avertizează că DES-ul vechi este slab. Ce algoritm folosește RHEL 10 implicit nu a fost confirmat în această sesiune: <code>ENCRYPT_METHOD</code> din <code>login.defs(5)</code> are implicit „DES” doar în documentația upstream, iar distribuțiile îl suprascriu; <code>authselect</code>/PAM pot decide pentru parolele utilizatorilor. Vezi <code>grep -r 'sha512\|yescrypt' /etc/pam.d/</code> pe sistemul tău.
        </p>
        <p>
          <b>De ce două parole identice dau hash-uri diferite:</b> sarea (salt) este aleatoare pe cont; astfel un atac cu tabele precalculate nu merge.
        </p>
        <p>
          <b>Câmp parolă gol / ! / *:</b> <code>shadow(5)</code>: gol = login fără parolă (periculos); începe cu <code>!</code> = blocat; <code>!</code> sau <code>*</code> singure = parolă UNIX imposibilă (folosit pentru conturi de serviciu; cheile SSH pot funcționa). Valoarea <code>!!</code> o vezi des pe conturile fără parolă setată; pagina nu o descrie (din cunoștințe).
        </p>
        <p>
          <b>pam_pwquality:</b> setările tipice (<code>minlen</code>, <code>minclass</code>, <code>dcredit</code>…) stau în <code>/etc/security/pwquality.conf</code>. Nu fac parte din obiectivul „change passwords and adjust password aging”, dar explică de ce o parolă simplă poate fi refuzată pentru utilizatori obișnuiți și acceptată (cu avertisment) pentru root.
        </p>
        <p>
          <b>Ziua 0 și fusul orar:</b> datele din shadow sunt numere de zile de la 1970-01-01 UTC; <code>chage</code> interpretează datele în UTC (<code>chage(1)</code>), deci la granița zilelor pot apărea diferențe de o zi față de ora locală.
        </p>
        <p>
          <b>passwd -d:</b> șterge parola (cont fără parolă); nu e recomandat și nu e necesar la examen.
        </p>
      </DeepDive>
    </>
  );
}

export const L9_2: TopicModule = {
  id: 'L9.2',
  subtitle: 'passwd, chpasswd, chage, usermod -L/-e, /etc/shadow, /etc/login.defs; blocare vs expirare',
  studyTime: '≈110 min studiu + laborator',
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
  labs: [LAB_L9_2A, LAB_L9_2B],
  sources: [
    { kind: 'man', ref: 'passwd(1), chage(1), shadow(5), login.defs(5), usermod(8), useradd(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'chpasswd(8), pwquality.conf(5), pam_pwquality(8), formatul ieșirii chage -l / passwd -S pe RHEL — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — docs.redhat.com: HTTP 403 la 2026-11-17, necitită; de confirmat valorile implicite PASS_* și algoritmul de hash' },
  ],
};
