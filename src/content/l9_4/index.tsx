import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L9_4A, LAB_L9_4B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            <G id="sudo"><code>sudo</code></G> lasă un utilizator obișnuit să ruleze comenzi cu privilegiile altuia (de obicei <G id="root-user">root</G>), după regulile din <G id="sudoers"><code>/etc/sudoers</code></G> și din fișierele din <G id="sudoers-d"><code>/etc/sudoers.d/</code></G>. Pe RHEL, cea mai simplă cale este apartenența la grupul <G id="wheel"><code>wheel</code></G>. Fișierele de politică se editează <b>doar</b> cu <G id="visudo"><code>visudo</code></G>, care verifică sintaxa înainte de salvare. Poți permite și doar anumite comenzi, cu sau fără parolă (<G id="nopasswd"><code>NOPASSWD</code></G>).
          </p>
          <p>Obiectivul oficial: <i>„Configure privileged access”</i>. Verificare: <code>sudo -l -U NUME</code>, <code>sudo visudo -c</code>, <code>id NUME</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: root face tot, dar nu poți da parola root tuturor</h4>
          <p>
            Contul <code>root</code> (UID 0) ocolește aproape orice verificare de permisiuni. Dacă toți administratorii ar folosi aceeași parolă de root: nu ai ști cine a făcut o schimbare; la plecarea unui administrator ar trebui schimbată parola pentru toți; iar o greșeală la tastatură ca root (de exemplu <code>rm -rf /</code>) nu are nicio plasă de siguranță. <code>sudo</code> rezolvă acestea:
          </p>
          <ul>
            <li><b>Fiecare își folosește propria parolă</b>: <code>sudo</code> cere parola utilizatorului care îl rulează (comportament implicit; <code>sudo(8)</code> spune că politica decide, iar flagurile <code>rootpw</code>/<code>targetpw</code> îl pot schimba).</li>
            <li><b>Se păstrează un jurnal</b>: fiecare comandă rulată cu <code>sudo</code> este înregistrată (utilizator, comandă, moment), deci știi cine a făcut ce (<code>journalctl</code>, L4.7).</li>
            <li><b>Privilegiul este granular</b>: poți permite doar <code>systemctl restart httpd</code>, nu tot sistemul.</li>
            <li><b>Principiul privilegiului minim</b>: lucrezi ca utilizator obișnuit și te ridici doar pentru comanda care o cere.</li>
          </ul>
          <Analogy>
            <code>su</code> este ca a primi <b>cheia generală</b> a clădirii (parola root): odată ce o ai, poți deschide orice și nu se știe cine a intrat. <code>sudo</code> este ca <b>un ecuson cu drepturi limitate</b>: portarul (sudo) te verifică, deschide doar ușa permisă și notează în registru că ai intrat tu.
          </Analogy>

          <h4>sudo, su și login ca root: comparație</h4>
          <Table head={['', 'su -', 'sudo COMANDĂ', 'sudo -i']} rows={[
            ['Parola cerută', 'a contului țintă (root)', 'a ta (după politică)', 'a ta'],
            ['Ce primești', 'shell de login ca root', 'o singură comandă ca root', 'shell de login ca root'],
            ['Jurnalizare', 'doar autentificarea', 'fiecare comandă', 'sesiunea, nu fiecare comandă din shell'],
            ['Control granular', 'nu', 'da (sudoers)', 'da (sudoers)'],
            ['Necesită parola root', 'da', 'nu', 'nu'],
          ]} />
          <p>
            Despre <code>su</code>, <code>sudo -i</code> și <code>sudo -s</code> ai citit și în L1.10; aici construim <b>politica</b> care decide cine are voie.
          </p>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Ce se întâmplă când rulezi sudo</h4>
          <ol>
            <li>Binarul <code>sudo</code> este instalat <b>setuid root</b>: rulează cu privilegii de root chiar dacă îl pornește un utilizator obișnuit (L1.8, bitul setuid).</li>
            <li>Citește politica din <code>/etc/sudoers</code> (și din fișierele incluse din <code>/etc/sudoers.d/</code>).</li>
            <li>Verifică dacă <b>utilizatorul</b> (sau unul din <b>grupurile</b> lui) are o regulă care se potrivește cu <b>gazda</b>, cu <b>utilizatorul țintă</b> (runas) și cu <b>comanda</b>. <b>Ultima regulă care se potrivește câștigă</b> (<code>sudoers(5)</code>).</li>
            <li>Dacă regula cere parola (implicit da), o cere pe a ta, prin PAM. După succes, reține autentificarea pentru un timp (implicit 5 minute, <code>timestamp_timeout</code>, per terminal).</li>
            <li>Construiește un mediu curat (<code>env_reset</code>, implicit activ: păstrează doar câteva variabile, iar <code>PATH</code> poate fi înlocuit cu <code>secure_path</code>) și rulează comanda ca utilizatorul țintă.</li>
            <li>Scrie un rând de jurnal despre încercare.</li>
          </ol>

          <h4>2. Unde se află politica</h4>
          <Table head={['Cale', 'Rol']} rows={[
            [<code>/etc/sudoers</code>, 'fișierul principal; editat cu visudo; pe RHEL conține regula pentru grupul wheel și include directorul sudoers.d (conținut exact de confirmat pe RHEL 10)'],
            [<code>/etc/sudoers.d/</code>, 'un fișier per regulă/echipă; citite în ordine lexicală; fișierele cu punct în nume sau terminate în ~ sunt IGNORATE (sudoers(5))'],
            [<><code>/var/log/secure</code> și jurnalul systemd</>, 'unde apar înregistrările sudo (depinde de rsyslog și de jurnal; de confirmat pe RHEL 10)'],
          ]} />
          <p>
            Recomandare: nu edita <code>/etc/sudoers</code> pentru regulile tale; pune <b>un fișier nou</b> în <code>/etc/sudoers.d/</code> (de exemplu <code>/etc/sudoers.d/devs</code>). Se păstrează separat de fișierul distribuției și se șterge ușor.
          </p>

          <h4>3. Gramatica unei reguli</h4>
          <CodeBlock title="forma generală" kind="config" label="illustrative" code={`UTILIZATOR  GAZDĂ = (RUNAS)  [TAG:]  COMENZI`} explain={[
            ['UTILIZATOR', 'cine primește privilegiul: un nume (alice), un grup cu prefix % (%wheel, %devs), un alias sau ALL.'],
            ['GAZDĂ', 'pe ce mașini se aplică regula (ALL sau un nume); într-un fișier local, de obicei ALL.'],
            ['(RUNAS)', 'ca ce utilizator (și opțional ce grup) poate rula comanda: (ALL) = oricine; (root) = doar root; (ALL : ALL) = orice utilizator și grup. Fără paranteze: implicit root.'],
            ['TAG:', 'opțional: NOPASSWD: (nu cere parola), PASSWD: (cere), NOEXEC: etc.'],
            ['COMENZI', 'ALL sau o listă de căi COMPLETE de comenzi, separate prin virgulă (/usr/bin/systemctl restart httpd).'],
          ]} />
          <Table head={['Regulă', 'Sens']} rows={[
            [<code>alice ALL=(ALL) ALL</code>, 'alice poate rula orice comandă, ca orice utilizator, cu parola ei'],
            [<code>%wheel ALL=(ALL) ALL</code>, 'orice membru al grupului wheel are drepturile de mai sus (regula distribuției)'],
            [<code>%wheel ALL=(ALL) NOPASSWD: ALL</code>, 'la fel, dar FĂRĂ parolă'],
            [<code>bob ALL=(root) /usr/bin/systemctl restart httpd</code>, 'bob poate doar să repornească httpd, ca root'],
            [<code>%devs ALL=(root) /usr/bin/systemctl status *, /usr/bin/journalctl</code>, 'grupul devs: doar două comenzi (cu wildcard la argumente)'],
            [<code>carol ALL=(ALL) ALL, !/usr/bin/passwd root</code>, 'toate comenzile, cu excepția schimbării parolei root (negație cu !)'],
          ]} />
          <Callout kind="info" title="Ordinea contează: ultima potrivire câștigă">
            Dacă două linii se potrivesc cu aceeași comandă, se aplică <b>ultima</b> citită (<code>sudoers(5)</code>), nu cea mai specifică. Din acest motiv, o regulă <code>NOPASSWD</code> adăugată într-un fișier din <code>sudoers.d</code> poate fi anulată de o linie ulterioară (alfabetic) din alt fișier. Dacă un utilizator are o regulă nepotrivită, verifică cu <code>sudo -l -U NUME</code> ce se aplică de fapt.
          </Callout>

          <h4>4. Alias-uri și Defaults</h4>
          <p>
            Pentru liste repetitive, <code>sudoers</code> are alias-uri: <code>User_Alias</code>, <code>Host_Alias</code>, <code>Runas_Alias</code>, <code>Cmnd_Alias</code> (nume cu MAJUSCULE, cifre și <code>_</code>; încep cu literă mare). Exemplu: <code>Cmnd_Alias WEB = /usr/bin/systemctl restart httpd, /usr/bin/systemctl reload httpd</code>, apoi <code>%web ALL=(root) WEB</code>. <code>ALL</code> este rezervat. Liniile <code>Defaults</code> schimbă comportamentul: <code>Defaults timestamp_timeout=10</code>, <code>Defaults:alice !authenticate</code> (pentru un utilizator), <code>Defaults!/usr/bin/vim noexec</code> (pentru o comandă). Pe RHEL, fișierul principal are deja <code>Defaults</code>-uri (<code>env_reset</code>, <code>secure_path</code> etc.; conținutul exact e de confirmat pe RHEL 10).
          </p>

          <h4>5. visudo: de ce nu editezi cu vi direct</h4>
          <p>
            O greșeală de sintaxă în <code>/etc/sudoers</code> poate face <b>sudo să refuze toate comenzile</b> (nu mai poți deveni root). <code>visudo</code> te protejează:
          </p>
          <ul>
            <li><b>Blochează</b> fișierul (alt <code>visudo</code> simultan primește „busy”).</li>
            <li>Deschide un <b>editor</b> (variabilele <code>SUDO_EDITOR</code>, <code>VISUAL</code>, <code>EDITOR</code>, implicit <code>vi</code>).</li>
            <li>La ieșire <b>verifică sintaxa</b>; dacă este greșită, nu salvează și întreabă „What now?”: <code>e</code> = editezi din nou; <code>x</code> = ieși fără a salva; <code>Q</code> = salvezi oricum (periculos).</li>
            <li><code>visudo -c</code>: doar verifică sintaxa (cod 0 = ok, 1 = eroare); <code>visudo -f /etc/sudoers.d/NUME</code> editează un fișier din <code>sudoers.d</code> cu aceeași protecție; <code>-s</code> = strict (alias-uri nedefinite = eroare).</li>
          </ul>
          <Callout kind="warn" title="Nu scrie direct în /etc/sudoers.d cu echo sau tee">
            Un fișier cu eroare de sintaxă din <code>sudoers.d</code> poate strica sudo la fel de rău. Pe un sistem de test, dacă o faci, ai nevoie de o altă cale spre root (<code>su -</code> dacă știi parola root, consola, modul rescue — L4.3). La examen: folosește <code>visudo -f</code> și apoi <code>visudo -c</code>.
          </Callout>
          <p className="small">
            Permisiuni: fișierele de politică sunt, prin convenție, <code>root:root</code>, mod <code>0440</code> (pagina <code>visudo(8)</code> citită nu enumeră valoarea; practică RHEL, de confirmat). <code>visudo</code> creează fișierele cu permisiuni corecte; dacă îl creezi altfel, verifică cu <code>ls -l</code>.
          </p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Grupuri (L9.3):</b> <code>%wheel</code> și <code>%devs</code> se bazează pe apartenența la grup; după <code>usermod -aG wheel</code> utilizatorul are nevoie de un login nou.</li>
            <li><b>Conturi și parole (L9.1, L9.2):</b> sudo cere parola utilizatorului; un cont fără parolă (blocată) nu se poate autentifica pentru sudo decât cu <code>NOPASSWD</code>.</li>
            <li><b>PAM:</b> autentificarea sudo trece prin PAM (aging, expirare, blocări).</li>
            <li><b>Permisiuni (L1.8):</b> sudo este setuid root; un binar scris de utilizator într-o comandă permisă este un risc (de aceea căile complete și directoare nescriptibile).</li>
            <li><b>systemd și jurnal (L4.7, L4.9):</b> apar înregistrări de tipul „sudo: alice : TTY=pts/0 ; PWD=/home/alice ; USER=root ; COMMAND=…”; <code>journalctl _COMM=sudo</code> le filtrează (de confirmat).</li>
            <li><b>SSH (L1.11):</b> login direct ca root prin SSH este o problemă separată (configurația sshd); sudo permite administrarea fără a expune root.</li>
            <li><b>SELinux (C10):</b> fișierele din <code>/etc/sudoers.d</code> au context propriu; un fișier copiat dintr-un loc nepotrivit poate avea context greșit (<code>restorecon -v</code>).</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Un administrator nou: îl adaugi în <code>wheel</code>.</li>
            <li>O echipă care repornește un serviciu: o regulă cu <code>Cmnd_Alias</code>, fără acces complet.</li>
            <li>Automatizări: un cont de serviciu cu <code>NOPASSWD</code> pentru un set restrâns de comenzi.</li>
            <li>Audit: afli cine a rulat o comandă la o anumită oră.</li>
            <li>Examen: „allow <code>alice</code> to run all commands as root”, „allow members of <code>devs</code> to run <code>/usr/bin/systemctl</code> without password”, „configure sudo so that <code>bob</code> may run only <code>useradd</code>”.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi tu pe o mașină de test. Output-urile sunt <b>Ilustrative</b>, nerulate pe RHEL 10. Ai nevoie de o cale sigură spre root înainte să experimentezi cu sudoers (sesiune root deschisă pe consolă, <code>su -</code>, sau un instantaneu al VM-ului): o greșeală te poate bloca. Conturile <code>alice</code>, <code>bob</code> și grupurile <code>devs</code> vin din L9.1–L9.3.
        </Callout>

        <h4>1. Folosește sudo și vezi ce ai voie</h4>
        <CodeBlock title="comenzi" code={`sudo whoami\nsudo -l\nsudo -ll\nsudo -l -U alice\nsudo -u bob id\nsudo -g devs id\nsudo -i\nsudo -s\nsudo -k\nsudo -v\nsudo -K\nsudo -n true && echo fara-parola`} explain={[
          ['sudo whoami', 'rulează whoami ca root: răspunsul „root” arată că sudo funcționează.'],
          ['sudo -l', '-l = list: regulile care se aplică ȚIE pe această gazdă.'],
          ['sudo -ll', 'forma lungă, detaliată (cu fiecare regulă pe rând).'],
          ['sudo -l -U alice', 'ca root: listează privilegiile lui alice (-U = utilizator).'],
          ['sudo -u bob id', '-u = rulează ca bob (nu ca root): arată ce vede bob.'],
          ['sudo -g devs id', '-g = rulează cu grupul primar devs.'],
          ['sudo -i', '-i = shell de LOGIN ca root (mediu complet de login, cd în home-ul root).'],
          ['sudo -s', '-s = shell ca root, cu $SHELL; mediul tău rămâne mai mult neschimbat.'],
          ['sudo -k', '-k = uită autentificarea reținută pentru sesiunea curentă: următorul sudo cere iar parola.'],
          ['sudo -v', '-v = reînnoiește autentificarea, fără a rula o comandă.'],
          ['sudo -K', '-K = șterge toate autentificările reținute.'],
          ['sudo -n true', '-n = non-interactiv: dacă ar cere parola, dă eroare în loc să întrebe (utilă pentru a testa NOPASSWD).'],
        ]} />

        <h4>2. Acordă acces complet: grupul wheel</h4>
        <CodeBlock title="comenzi" code={`sudo grep -E '^%wheel|^#.*%wheel' /etc/sudoers\ngetent group wheel\nsudo usermod -aG wheel alice\nid alice\nsudo -l -U alice\nsudo gpasswd -d alice wheel`} explain={[
          ["grep -E '^%wheel|^#.*%wheel'", 'caută regula wheel în sudoers (activă sau comentată); ^ = început de linie, | = „sau”.'],
          ['usermod -aG wheel alice', 'adaugă pe alice în wheel (cu -a, ca să nu piardă alte grupuri).'],
          ['sudo -l -U alice', 'confirmă că alice primește (ALL) ALL prin %wheel.'],
          ['gpasswd -d alice wheel', 'retrage accesul (alice ieșită din wheel).'],
        ]} />
        <p>
          Pe RHEL, regula <code>%wheel ALL=(ALL) ALL</code> este activă în <code>/etc/sudoers</code> (de confirmat pe RHEL 10). Dacă pe sistemul tău este comentată (<code>#</code>), o activezi cu <code>sudo visudo</code> eliminând <code>#</code>, sau adaugi regula într-un fișier din <code>sudoers.d</code>.
        </p>

        <h4>3. Acordă acces unui utilizator sau grup, într-un fișier separat</h4>
        <CodeBlock title="comenzi" code={`sudo visudo -f /etc/sudoers.d/alice\nsudo cat /etc/sudoers.d/alice\nls -l /etc/sudoers.d/\nsudo visudo -c\nsudo -l -U alice`} explain={[
          ['visudo -f /etc/sudoers.d/alice', '-f = fișier alternativ: deschizi (sau creezi) fișierul cu verificare de sintaxă. Editorul este vi: i = inserare, Esc, :wq = salvare.'],
          ['cat /etc/sudoers.d/alice', 'conținut așteptat: alice ALL=(ALL) ALL (vezi mai jos).'],
          ['ls -l /etc/sudoers.d/', 'proprietar root, mod 0440 (confirmă).'],
          ['visudo -c', '-c = check: verifică /etc/sudoers și fișierele incluse; „parsed OK” înseamnă sintaxă validă.'],
        ]} />
        <CodeBlock title="/etc/sudoers.d/alice" kind="config" label="illustrative" code={`alice ALL=(ALL) ALL`} explain={[
          ['alice', 'utilizatorul.'],
          ['ALL=', 'pe orice gazdă (ALL) ... semnul = separă gazda de restul.'],
          ['(ALL)', 'poate rula ca orice utilizator.'],
          ['ALL', 'orice comandă.'],
        ]} />

        <h4>4. Fără parolă (NOPASSWD)</h4>
        <CodeBlock title="/etc/sudoers.d/ops-nopasswd" kind="config" label="illustrative" code={`%ops ALL=(ALL) NOPASSWD: ALL`} explain={[
          ['%ops', 'grupul ops (prefix %).'],
          ['NOPASSWD:', 'eticheta (tag): comenzile de după nu cer parola.'],
          ['ALL', 'toate comenzile.'],
        ]} />
        <p className="small">
          Tag-ul se aplică comenzilor care îl urmează pe aceeași linie. Securitate: un cont cu <code>NOPASSWD: ALL</code> este practic root la cine îi fură sesiunea. Folosește-l pe comenzi restrânse.
        </p>

        <h4>5. Permite doar anumite comenzi</h4>
        <CodeBlock title="/etc/sudoers.d/web" kind="config" label="illustrative" code={`Cmnd_Alias WEBCTL = /usr/bin/systemctl restart httpd, /usr/bin/systemctl reload httpd, /usr/bin/systemctl status httpd
bob ALL=(root) WEBCTL
%devs ALL=(root) NOPASSWD: /usr/bin/journalctl`} explain={[
          ['Cmnd_Alias WEBCTL = …', 'definește un nume (cu majuscule) pentru o listă de comenzi complete, separate prin virgulă.'],
          ['bob ALL=(root) WEBCTL', 'bob poate rula doar comenzile din WEBCTL, ca root, cu parola lui.'],
          ['%devs ALL=(root) NOPASSWD: /usr/bin/journalctl', 'membrii devs pot citi jurnalul ca root, fără parolă.'],
        ]} />
        <CodeBlock title="comenzi" code={`which systemctl journalctl useradd\nsudo visudo -f /etc/sudoers.d/web\nsudo visudo -c\nsudo -l -U bob\nsudo -u bob sudo -n systemctl status httpd\nsudo -u bob sudo -n useradd test1`} explain={[
          ['which …', 'află calea COMPLETĂ a comenzii (sudoers cere căi absolute; /usr/bin/… vs /bin/… pot diferi pe sistemul tău).'],
          ['sudo -u bob sudo -n systemctl …', 'testezi ca bob, fără a-i ști parola: sudo-ul interior rulează ca bob; -n eșuează curat dacă ar cere parola.'],
          ['… useradd test1', 'comanda nepermisă: trebuie să fie refuzată.'],
        ]} />

        <h4>6. Excepții și restricții</h4>
        <CodeBlock title="/etc/sudoers.d/carol" kind="config" label="illustrative" code={`carol ALL=(ALL) ALL, !/usr/bin/passwd root, !/usr/sbin/visudo`} explain={[
          ['ALL, !…', 'toate comenzile EXCEPTÂND cele după !. Atenție: este o protecție slabă (utilizatorul poate copia binare sau lansa un shell); sudoers(5) avertizează că negația nu este o securitate completă.'],
        ]} />

        <h4>7. Verifică jurnalul</h4>
        <CodeBlock title="comenzi" code={`sudo journalctl _COMM=sudo -n 5 --no-pager\nsudo grep 'sudo:' /var/log/secure | tail -5\nsudo -l -U nonexistent`} explain={[
          ['journalctl _COMM=sudo', 'intrările jurnalului generate de procesul sudo; -n 5 = ultimele 5; --no-pager = afișare directă.'],
          ['grep sudo: /var/log/secure', 'dacă rsyslog este activ; fișierul poate lipsi pe RHEL 10 (de confirmat; L4.7).'],
        ]} />
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="sudo -l" kind="session" label="illustrative" code={`[alice@server1 ~]$ sudo -l
[sudo] password for alice:
Matching Defaults entries for alice on server1:
    !visiblepw, always_set_home, match_group_by_gid, always_query_group_plugin,
    env_reset, env_keep="COLORS DISPLAY HOSTNAME ...", secure_path=/sbin\\:/bin\\:/usr/sbin\\:/usr/bin

User alice may run the following commands on server1:
    (ALL) ALL`} />
        <p className="small">
          <b>Matching Defaults</b>: opțiunile <code>Defaults</code> aplicate (lista exactă depinde de sistem; ilustrativă). <b>(ALL) ALL</b>: poate rula orice comandă ca orice utilizator. Dacă regula a venit dintr-un grup, rândul poate fi precedat de o mențiune de tip <code>(ALL) ALL</code> de la wheel; nu apare numele regulii.
        </p>
        <CodeBlock title="utilizator fără drepturi" kind="session" label="illustrative" code={`[dave@server1 ~]$ sudo ls /root
[sudo] password for dave:
dave is not in the sudoers file.
[dave@server1 ~]$ echo $?
1`} />
        <p className="small">
          Mesajul „<code>dave is not in the sudoers file</code>” (în variante, urmat de „This incident will be reported”) arată că nicio regulă nu se potrivește. Codul de ieșire <code>1</code> vine din <code>sudo(8)</code> (probleme de autentificare/politică). Încercarea este înregistrată în jurnal.
        </p>
        <CodeBlock title="comandă nepermisă" kind="session" label="illustrative" code={`[bob@server1 ~]$ sudo systemctl restart httpd
[sudo] password for bob:
[bob@server1 ~]$ sudo useradd x
Sorry, user bob is not allowed to execute '/usr/sbin/useradd x' as root on server1.`} />
        <p className="small">
          Prima comandă a fost permisă (este în <code>WEBCTL</code>); a doua nu. Observă calea completă din mesaj: sudo compară exact calea. Mesajele exacte pot diferi pe RHEL 10.
        </p>
        <CodeBlock title="visudo detectează o eroare" kind="session" label="illustrative" code={`[student@server1 ~]$ sudo visudo -f /etc/sudoers.d/alice
>>> /etc/sudoers.d/alice: syntax error near line 1 <<<
What now? e
[student@server1 ~]$ sudo visudo -c
/etc/sudoers: parsed OK
/etc/sudoers.d/alice: parsed OK`} />
        <p className="small">
          La eroare, <code>visudo</code> oferă <b>e</b> (editare din nou), <b>x</b> (ieșire fără salvare), <b>Q</b> (salvare cu eroare, periculos). După corectare, <code>visudo -c</code> raportează „parsed OK” pentru fiecare fișier. Formularea exactă variază între versiuni.
        </p>
        <CodeBlock title="intrare de jurnal sudo" kind="session" label="illustrative" code={`Nov 17 11:40:12 server1 sudo[4321]: alice : TTY=pts/0 ; PWD=/home/alice ; USER=root ; COMMAND=/usr/bin/systemctl restart httpd`} />
        <p className="small">
          Un rând de jurnal conține: cine (<code>alice</code>), de unde (<code>TTY</code>), directorul curent (<code>PWD</code>), ca cine (<code>USER=root</code>) și <b>comanda exactă</b>. Datele și numerele sunt ilustrative.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Ce are voie:</b> <code>sudo -l -U NUME</code> (ca root) — regulile efective.</li>
            <li><b>Sintaxa:</b> <code>sudo visudo -c</code> — „parsed OK” pentru fiecare fișier.</li>
            <li><b>Membru wheel:</b> <code>id NUME</code> arată <code>wheel</code>.</li>
            <li><b>Fișierul:</b> <code>ls -l /etc/sudoers.d/NUME</code> (root:root, 0440) și <code>sudo cat</code> pentru conținut.</li>
            <li><b>Test real:</b> <code>sudo -u NUME sudo -n whoami</code> (pentru NOPASSWD: răspunde „root”; pentru reguli cu parolă dă o eroare, ceea ce e corect) sau, mai bine, <code>sudo su - NUME</code>, apoi <code>sudo whoami</code> cu parola contului.</li>
            <li><b>Refuz:</b> o comandă nepermisă trebuie să dea „not allowed to execute”.</li>
            <li><b>Jurnal:</b> <code>sudo journalctl _COMM=sudo -n 5</code>.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            Regulile sunt fișiere pe disc (<code>/etc/sudoers</code>, <code>/etc/sudoers.d/*</code>) și apartenența la grup este în <code>/etc/group</code>: <b>persistă la reboot</b>. Nu există „runtime” vs „permanent”.
          </p>
          <p>
            Ce poate fi ratat: o regulă într-un fișier cu punct în nume (de exemplu <code>/etc/sudoers.d/alice.conf</code> sau <code>alice.bak</code>) este <b>ignorată</b>; permisiuni sau proprietar greșite pot face sudo să respingă fișierul; contextul SELinux greșit al fișierului nou (rar) poate bloca citirea.
          </p>
          <p>Confirmare manuală după <code>sudo reboot</code>: <code>sudo -l -U NUME</code> și <code>sudo visudo -c</code>.</p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          [<>„X is not in the sudoers file”</>, 'utilizatorul nu e în wheel și nicio regulă nu se potrivește', <><code>id X</code>, <code>sudo -l -U X</code></>, <><code>usermod -aG wheel X</code> sau regulă în sudoers.d</>],
          [<>Adăugat în wheel, dar sudo tot refuză</>, 'sesiune veche fără grupul nou', <><code>id</code> (în sesiunea lui)</>, 'logout/login'],
          [<>Regula din sudoers.d nu are efect</>, 'nume de fișier cu punct sau ~', <code>ls -l /etc/sudoers.d</code>, 'redenumește fără punct (alice, nu alice.conf)'],
          [<>sudo: parse error in /etc/sudoers.d/X near line N</>, 'sintaxă greșită', <><code>sudo visudo -c</code> (dacă mai merge sudo)</>, <>repară cu <code>visudo -f</code>; dacă sudo e blocat: root prin consolă / <code>su -</code> / rescue (L4.3)</>],
          [<>Not allowed to execute '…' as root</>, 'calea comenzii diferă sau comanda nu e în listă', <><code>which COMANDA</code>, <code>sudo -l -U X</code></>, 'folosește calea completă din regulă; adaugă comanda'],
          [<>Cere parola deși ai pus NOPASSWD</>, 'o regulă ulterioară (ultima câștigă) o anulează sau tag-ul e pe altă comandă', <code>sudo -l -U X</code>, 'mută regula la sfârșit (fișier cu nume alfabetic mai târziu, de exemplu zz-…)'],
          [<>sudoers file busy</>, 'alt visudo deschis', <code>ps aux | grep visudo</code>, 'așteaptă sau închide-l'],
          [<>Permisiuni nesigure ale fișierului sudoers</>, 'fișier writable de alții sau proprietar greșit', <code>ls -l /etc/sudoers.d/</code>, <><code>sudo chown root:root</code> și <code>sudo chmod 0440</code></>],
          [<>Comanda din sudo nu găsește un program</>, 'PATH redus (secure_path)', <><code>sudo env | grep PATH</code></>, 'folosește calea completă'],
          [<>sudo cere parola prea des</>, 'cache de 5 minute, per terminal', <code>sudo -v</code>, <>poți seta <code>Defaults timestamp_timeout=N</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Editezi <code>/etc/sudoers</code> cu <code>vi</code> direct: folosește <code>visudo</code>.</>,
          <>Creezi un fișier în <code>sudoers.d</code> cu <code>echo</code>/<code>tee</code>, fără verificare: o greșeală blochează sudo. Folosește <code>visudo -f</code> și <code>visudo -c</code>.</>,
          <>Numești fișierul din <code>sudoers.d</code> cu punct (<code>alice.conf</code>) sau cu <code>~</code>: este ignorat.</>,
          <>Uiți <code>%</code> în fața grupului: <code>wheel ALL=…</code> înseamnă utilizatorul „wheel”, nu grupul.</>,
          <>Scrii comanda fără cale completă (<code>systemctl</code> în loc de <code>/usr/bin/systemctl</code>): regula nu se potrivește.</>,
          <>Folosești un wildcard prea larg (<code>/usr/bin/systemctl *</code>): permite și <code>systemctl poweroff</code> sau alte acțiuni neintenționate. Listează argumentele exacte.</>,
          <>Crezi că <code>sudo -i</code> și <code>sudo su -</code> sunt diferite pentru politică: ambele cer drepturi pentru shell/su.</>,
          <>Adaugi utilizatorul în <code>wheel</code> și testezi în aceeași sesiune.</>,
          <>Dai <code>NOPASSWD: ALL</code> pe un sistem real „ca să fie comod”.</>,
          <>Presupui că regula cea mai specifică câștigă: <b>câștigă ultima</b>.</>,
          <>Încerci să restricționezi cu <code>!comandă</code> și crezi că ești în siguranță: negația se ocolește ușor (copiere de binar, shell escape).</>,
          <>Testezi sudoers cu root (<code>sudo -l</code> ca root arată tot): testează ca utilizatorul țintă sau cu <code>-U</code>.</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: ordinea regulilor, env_reset, sudoedit, I/O logging și alternative">
        <p>
          <b>Ordinea:</b> regulile sunt evaluate secvențial; ultima potrivire decide (nu cea mai specifică). Fișierele din <code>@includedir</code> se citesc în ordine lexicală, deci un prefix numeric (<code>10-</code>, <code>90-</code>) controlează precedența; o regulă generală <code>%wheel ALL=(ALL) ALL</code> poate fi anulată de una mai târzie.
        </p>
        <p>
          <b>env_reset și secure_path:</b> <code>env_reset</code> (implicit activ) curăță mediul: rămân TERM, PATH, HOME, MAIL, SHELL, LOGNAME, USER, SUDO_* plus variabilele permise de <code>env_keep</code>; dacă <code>secure_path</code> este setat, valoarea lui devine PATH (<code>sudoers(5)</code>). De aceea un script poate merge ca utilizator și să nu găsească un program sub sudo.
        </p>
        <p>
          <b>sudoedit / sudo -e:</b> editează un fișier prin copii temporare, copiate înapoi doar dacă s-au schimbat; editorul rulează cu privilegiile TALE, nu ale lui root (<code>sudo(8)</code>). E mai sigur decât <code>sudo vim FIȘIER</code>, în care editorul poate lansa un shell root.
        </p>
        <p>
          <b>NOEXEC și shell escape:</b> multe programe (editoare, pager-e) pot lansa un shell; dacă permiți <code>vim</code> ca root, de fapt dai root complet. Tag-ul <code>NOEXEC</code> încearcă să prevină acest lucru, dar nu este garanție totală.
        </p>
        <p>
          <b>I/O logging:</b> tag-urile <code>LOG_INPUT</code>/<code>LOG_OUTPUT</code> pot înregistra intrarea și ieșirea unei sesiuni (audit avansat); nu face parte din obiectiv.
        </p>
        <p>
          <b>Timestamp:</b> implicit 5 minute, per terminal (<code>timestamp_type</code>). <code>sudo -k</code> invalidează sesiunea curentă; <code>sudo -K</code> șterge toate.
        </p>
        <p>
          <b>Alte metode de acces privilegiat:</b> <code>su -</code> cu parola root; login direct ca root la consolă; pe sisteme moderne, <code>polkit</code> pentru acțiuni de desktop/servicii (nu face parte din examen). Obiectivul EX200 „Configure privileged access” se referă în practică la sudo și apartenența la <code>wheel</code>; formularea oficială nu detaliază mai mult, deci lecția acoperă ce este necesar și util.
        </p>
      </DeepDive>
    </>
  );
}

export const L9_4: TopicModule = {
  id: 'L9.4',
  subtitle: 'sudo, grupul wheel, /etc/sudoers și /etc/sudoers.d, visudo, NOPASSWD, restricții pe comenzi, sudo -l, jurnal',
  studyTime: '≈115 min studiu + laborator',
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
  labs: [LAB_L9_4A, LAB_L9_4B],
  sources: [
    { kind: 'man', ref: 'sudo(8), sudoers(5) (primele ~100 000 din ~235 700 caractere), visudo(8), gpasswd(1), usermod(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'conținutul /etc/sudoers din RHEL, permisiunile 0440, sudo.conf(5), polkit — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Managing sudo access” (docs.redhat.com, secure-managing_sudo_access): HTTP 403 la 2026-11-17, necitită; de confirmat regula implicită wheel și sintaxa include' },
  ],
};
