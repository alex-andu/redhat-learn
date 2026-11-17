import type { TopicModule } from '../types';
import { Term as G } from '../../components/Term';
import { Analogy, Callout, DeepDive, Detailed, Sec, Summary, Table, Traps } from '../../components/Lesson';
import { CodeBlock } from '../../components/CodeBlock';
import { LAB_L10_7A, LAB_L10_7B } from './labs';

function Body() {
  return (
    <>
      <Sec id="intro" code="1" title="Pe scurt">
        <Summary>
          <p>
            Un <b><G id="selinux-boolean">boolean SELinux</G></b> este un <b>comutator on/off</b> care activează sau dezactivează o parte opțională din politică, fără să scrii reguli noi. De exemplu <code>httpd_enable_homedirs</code> (off implicit) permite Apache să citească directoarele home ale utilizatorilor; <code>httpd_can_network_connect</code> îi permite să se conecteze la alte servicii din rețea. Politica vine cu sute de astfel de comutatoare, dezactivate sau activate după riscul lor.
          </p>
          <p>
            Comenzi: <code>getsebool -a | grep httpd</code> (citire), <code>setsebool httpd_enable_homedirs on</code> (<b>doar în sesiune</b>, dispare la reboot) și <code>setsebool -P httpd_enable_homedirs on</code> (<b>persistent</b>; <code>-P</code> scrie în politica de pe disc). Alternative: <code>semanage boolean -l</code> (listare cu descrieri) și <code>semanage boolean -m --on NUME</code> (persistent).
          </p>
          <p>Obiectivul oficial: <i>„Use Boolean settings to modify system SELinux settings”</i>. Verificare: <code>getsebool NUME</code>, <code>semanage boolean -l -C</code>.</p>
        </Summary>
      </Sec>

      <Sec id="what" code="2" title="Ce este și de ce există">
        <Detailed>
          <h4>Problema: politica nu poate ghici nevoile tuturor</h4>
          <p>
            Politica SELinux este scrisă o singură dată, pentru toate instalările. Dar nu toți administratorii au aceleași nevoi: unii vor ca Apache să trimită e-mail, alții ca Samba să partajeze home-uri, alții ca NFS să fie exportat în scriere. Dacă politica ar permite toate acestea implicit, ar fi prea permisivă pentru cei care nu le folosesc. Dacă nu le-ar permite deloc, ar obliga administratorii să scrie module de politică proprii (greu). Soluția: <b>boolean-uri</b>, comutatoare pe care administratorul le activează după nevoie.
          </p>
          <Analogy>
            Gândește-te la tabloul electric al unei clădiri: fiecare siguranță (boolean) controlează o zonă („Apache poate trimite mail”, „Samba poate exporta home-uri”). Electricianul care a proiectat clădirea (distribuția) a lăsat unele pornite, altele oprite, din motive de siguranță. Tu, administratorul, poți porni doar siguranța de care ai nevoie, fără să refaci instalația.
          </Analogy>
          <h4>Diferența față de celelalte instrumente SELinux</h4>
          <Table head={['Problemă', 'Instrument', 'Lecția']} rows={[
            ['fișier cu etichetă greșită', <><code>restorecon</code> / <code>semanage fcontext</code></>, 'L10.5'],
            ['port neetichetat', <code>semanage port</code>, 'L10.6'],
            ['comportament opțional al serviciului (home-uri, rețea, mail, NFS…)', <code>setsebool -P</code>, 'această lecție'],
            ['regulă lipsă care nu e acoperită de niciun boolean', 'modul de politică propriu (audit2allow; avansat)', 'în afara obiectivului'],
          ]} />
          <Callout kind="info" title="Prima întrebare la o refuzare">
            Când un serviciu este blocat, ordinea rapidă de verificare este: (1) eticheta fișierului? (2) eticheta portului? (3) există un <b>boolean</b> care permite exact acțiunea? Booleanele sunt a treia verificare și adesea cea mai rapidă soluție, pentru că sunt „răspunsul oficial” al politicii pentru scenariile uzuale.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="how" code="3" title="Cum funcționează intern">
        <Detailed>
          <h4>1. Cum este un boolean în politică</h4>
          <p>
            În politică, regulile condiționale au forma: <code>{'if (httpd_enable_homedirs) { allow httpd_t user_home_t:file read; }'}</code>. Booleanul controlează dacă blocul de reguli este activ. Valoarea poate fi schimbată fără a recompila întreaga politică: kernelul reevaluează regulile condiționale când valoarea se schimbă (<code>/sys/fs/selinux/booleans/</code>).
          </p>
          <h4>2. Două valori: curentă și persistentă</h4>
          <p>
            Fiecare boolean are o valoare <b>curentă</b> (în kernel, acum) și una <b>persistentă</b> (cea la boot). <code>setsebool NUME on</code> schimbă doar valoarea curentă: după reboot, se revine la cea persistentă. <code>setsebool -P</code> schimbă ambele și scrie valoarea în politica de pe disc, deci supraviețuiește reboot-ului (<code>setsebool(8)</code>: „<code>-P</code> scrie valorile în așteptare în politica de pe disc, ca să persiste”). <code>getsebool</code> raportează dacă o valoare este în așteptare (<i>pending</i>), adică diferită de cea curentă.
          </p>
          <Table head={['Comandă', 'Valoare curentă', 'Valoare persistentă', 'După reboot']} rows={[
            [<code>setsebool NUME on</code>, 'on', 'neschimbată', 'revine la valoarea veche'],
            [<code>setsebool -P NUME on</code>, 'on', 'on', 'rămâne on'],
            [<code>setsebool -P NUME off</code>, 'off', 'off', 'rămâne off'],
            [<code>semanage boolean -m --on NUME</code>, 'on', 'on', 'rămâne on (echivalent cu setsebool -P)'],
          ]} />
          <h4>3. Valorile acceptate</h4>
          <p>
            <code>setsebool(8)</code>: activare cu <code>1</code>, <code>true</code> sau <code>on</code>; dezactivare cu <code>0</code>, <code>false</code> sau <code>off</code>. Se pot seta mai multe deodată: <code>setsebool -P httpd_enable_homedirs=on httpd_can_sendmail=on</code> (forma <code>nume=valoare</code>).
          </p>
          <h4>4. Cum găsești boolean-ul potrivit</h4>
          <ul>
            <li><b>După nume:</b> numele încep cu serviciul (<code>httpd_</code>, <code>samba_</code>, <code>nfs_</code>, <code>ftpd_</code>, <code>virt_</code>…): <code>getsebool -a | grep httpd</code>.</li>
            <li><b>După descriere:</b> <code>semanage boolean -l | grep -i NUME</code> (coloana a patra este o descriere în limba engleză) — de exemplu „Allow httpd to read home directories”.</li>
            <li><b>Din diagnostic:</b> <code>sealert</code> (pachetul <code>setroubleshoot</code>) sugerează boolean-ul exact; <code>audit2why</code> poate spune „Missing boolean”. Ambele necitite aici (de confirmat).</li>
            <li><b>Din documentație:</b> pagini <code>man httpd_selinux</code>, <code>man samba_selinux</code> (pachetul <code>selinux-policy-doc</code>; din cunoștințe).</li>
          </ul>
          <h4>5. Boolean-uri uzuale pentru EX200</h4>
          <Table head={['Boolean', 'Ce permite când este on', 'Implicit']} rows={[
            [<code>httpd_enable_homedirs</code>, 'Apache poate citi directoarele home ale utilizatorilor (UserDir)', 'off'],
            [<code>httpd_can_network_connect</code>, 'scripturile/modulele Apache pot iniția conexiuni către rețea', 'off'],
            [<code>httpd_can_network_connect_db</code>, 'Apache se poate conecta la servere de baze de date', 'off'],
            [<code>httpd_can_sendmail</code>, 'Apache poate trimite e-mail', 'off'],
            [<code>httpd_use_nfs</code>, 'Apache poate citi conținut de pe NFS', 'off'],
            [<code>httpd_unified</code>, 'tratează tipurile web ca unul singur', 'implicit variabil'],
            [<code>samba_enable_home_dirs</code>, 'Samba poate exporta home-uri', 'off'],
            [<code>use_nfs_home_dirs</code>, 'home-urile pot fi pe NFS', 'off'],
            [<code>nfs_export_all_rw</code>, 'NFS poate exporta orice în citire-scriere', 'on/off (de confirmat)'],
            [<code>ftpd_anon_write</code>, 'FTP anonim poate scrie', 'off'],
            [<code>ssh_sysadm_login</code>, 'utilizatorul sysadm se poate autentifica prin ssh', 'off'],
          ]} />
          <p className="small">Lista este orientativă (nume din practica SELinux, necitite în documentația RHEL 10). Valorile implicite trebuie verificate cu <code>getsebool</code> pe sistemul tău.</p>
        </Detailed>
      </Sec>

      <Sec id="interact" code="4" title="Cum interacționează cu alte componente Linux">
        <Detailed>
          <ul>
            <li><b>Contexte și porturi (L10.4–L10.6):</b> booleanele completează etichetele; adesea un serviciu are nevoie de etichetă + boolean + port.</li>
            <li><b>Servicii (L4.9):</b> un boolean schimbat la rulare are efect fără repornirea serviciului (politica este reevaluată); un boolean de pornire poate necesita restart (depinde de serviciu).</li>
            <li><b>NFS și Samba (L6.3–L6.4):</b> exportul/montarea de home-uri sau de conținut web pe NFS cere boolean-uri (<code>use_nfs_home_dirs</code>, <code>httpd_use_nfs</code>).</li>
            <li><b>Firewall (L8.4):</b> booleanul nu deschide porturi; doar permite serviciului acțiunea.</li>
            <li><b>Audit (L10.3, L10.8):</b> o refuzare corectată de un boolean dispare din <code>audit.log</code>; pentru acțiuni „dontaudit” nu apare nimic (tipic pentru boolean-uri off).</li>
            <li><b>Utilizatori (C9):</b> <code>UserDir</code> din Apache (<code>public_html</code>) cere <code>httpd_enable_homedirs</code> și drepturi <code>x</code> pe home (L1.8) plus etichetă <code>httpd_user_content_t</code>.</li>
            <li><b>Backup de configurație:</b> <code>semanage boolean -l -C</code> (și <code>semanage export</code>) listează boolean-urile modificate local: util la audit.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="when" code="5" title="Când și de ce o folosim">
        <Detailed>
          <ul>
            <li>Un site Apache cu <code>UserDir</code> (pagini în <code>~/public_html</code>) → <code>httpd_enable_homedirs</code>.</li>
            <li>O aplicație web care apelează un API extern sau o bază de date → <code>httpd_can_network_connect</code>/<code>_db</code>.</li>
            <li>O aplicație PHP care trimite e-mail → <code>httpd_can_sendmail</code>.</li>
            <li>Un share Samba pe home-uri → <code>samba_enable_home_dirs</code>.</li>
            <li><b>Examen:</b> „allow Apache to read user home directories; the change must persist”, „allow httpd scripts to connect to the network”, „enable the boolean that allows … and verify it”.</li>
          </ul>
          <Callout kind="warn" title="Principiul privilegiului minim">
            Un boolean activat lărgește ce poate face un serviciu compromis. Activează <b>doar</b> ce este necesar, nu „toate booleanele cu numele serviciului”. Documentează de ce ai activat fiecare.
          </Callout>
        </Detailed>
      </Sec>

      <Sec id="commands" code="6" title="Comenzi și configurare">
        <Callout kind="info" title="Platforma nu rulează comenzile">
          Rulezi pe o mașină de test cu SELinux activ, ca root/cu <code>sudo</code>. Output-urile sunt <b>Ilustrative</b>; lista și valorile implicite ale boolean-urilor diferă pe RHEL 10. <code>setsebool -P</code> poate dura zeci de secunde (reîncarcă politica).
        </Callout>

        <h4>1. Citește boolean-urile</h4>
        <CodeBlock title="comenzi" code={`getsebool -a | wc -l\ngetsebool -a | grep httpd | head -n 8\ngetsebool httpd_enable_homedirs\ngetsebool httpd_enable_homedirs httpd_can_sendmail\nsestatus -b | grep -E 'httpd_enable_homedirs|httpd_can_sendmail'\nsudo semanage boolean -l | grep -E 'SELinux boolean|httpd_enable_homedirs'\nsudo semanage boolean -l | grep -i 'home dir' | head -n 5\nsudo semanage boolean -l -C`} explain={[
          ['getsebool -a', '-a = toate boolean-urile: format „nume --> on|off”; | wc -l numără liniile.'],
          ['grep httpd', 'filtrează după prefixul serviciului.'],
          ['getsebool NUME…', 'unul sau mai multe boolean-uri; raportează și valorile „pending” (curentă ≠ persistentă; getsebool(8)).'],
          ['sestatus -b', '-b = afișează starea boolean-urilor (sestatus(8)).'],
          ['semanage boolean -l', '-l = listează cu coloane: nume, stare curentă, stare implicită/persistentă și descriere.'],
          ['grep -i \'home dir\'', 'caută după descriere (-i = fără diferență majuscule/minuscule).'],
          ['semanage boolean -l -C', '-C = doar boolean-urile modificate LOCAL (față de implicit).'],
        ]} />

        <h4>2. Schimbă temporar (până la reboot)</h4>
        <CodeBlock title="comenzi" code={`getsebool httpd_enable_homedirs\nsudo setsebool httpd_enable_homedirs on\ngetsebool httpd_enable_homedirs\nsudo setsebool httpd_enable_homedirs 0\ngetsebool httpd_enable_homedirs\nsudo semanage boolean -l -C`} explain={[
          ['setsebool NUME on', 'on = activează (echivalent: 1, true). Valoarea curentă se schimbă IMEDIAT; cea persistentă rămâne.'],
          ['setsebool NUME 0', '0 = dezactivează (echivalent: off, false).'],
          ['semanage boolean -l -C', 'nu arată nimic, pentru că nu ai modificat persistent.'],
        ]} />

        <h4>3. Schimbă persistent</h4>
        <CodeBlock title="comenzi" code={`sudo setsebool -P httpd_enable_homedirs on\ngetsebool httpd_enable_homedirs\nsudo semanage boolean -l -C\nsudo setsebool -P httpd_enable_homedirs=on httpd_can_sendmail=on\nsudo semanage boolean -m --on httpd_can_network_connect\nsudo semanage boolean -m --off httpd_can_sendmail\nsudo semanage boolean -l -C`} explain={[
          ['setsebool -P NUME on', '-P = persistent: scrie în politica de pe disc (poate dura câteva zeci de secunde).'],
          ['setsebool -P a=on b=on', 'forma nume=valoare permite mai multe boolean-uri într-o singură comandă.'],
          ['semanage boolean -m --on NUME', '-m = modify, --on = activează, persistent (exemplu din semanage-boolean(8): httpd_can_sendmail).'],
          ['semanage boolean -m --off NUME', '--off = dezactivează persistent.'],
          ['semanage boolean -l -C', 'listează modificările locale: ce ai schimbat față de implicit.'],
        ]} />

        <h4>4. Revenirea la valoarea implicită</h4>
        <CodeBlock title="comenzi" code={`sudo setsebool -P httpd_enable_homedirs off\nsudo setsebool -P httpd_can_sendmail=off httpd_can_network_connect=off\nsudo semanage boolean -l -C\nsudo semanage boolean -D\nsudo semanage boolean -l -C`} explain={[
          ['setsebool -P … off', 'readuce la off persistent (dacă implicit era off).'],
          ['semanage boolean -D', '-D = deleteall: șterge TOATE personalizările locale ale boolean-urilor (readuce valorile implicite); folosește cu atenție.'],
        ]} />

        <h4>5. Flux practic: Apache și directoarele home (UserDir)</h4>
        <CodeBlock title="comenzi" code={`sudo dnf install -y httpd\nsudo -u alice mkdir -p /home/alice/public_html\necho 'Site alice' | sudo -u alice tee /home/alice/public_html/index.html\nsudo chmod 711 /home/alice\nsudo chmod 755 /home/alice/public_html\nsudo sed -i 's/^\\s*UserDir disabled/    UserDir public_html/' /etc/httpd/conf.d/userdir.conf\nsudo systemctl enable --now httpd\ncurl -sI http://localhost/~alice/ | head -n 1\nsudo ausearch -m avc -ts recent -i | tail -n 2\nsudo setsebool -P httpd_enable_homedirs on\nsudo restorecon -Rv /home/alice/public_html\ncurl -sI http://localhost/~alice/ | head -n 1\ngetsebool httpd_enable_homedirs`} explain={[
          ['mkdir -p … public_html', 'directorul pe care îl servește UserDir (în home).'],
          ['chmod 711 /home/alice', 'x pentru toți: httpd poate TRAVERSA home-ul, dar nu poate lista conținutul (L1.8); public_html: 755.'],
          ['sed … userdir.conf', 'activează UserDir public_html (fișierul și valoarea implicită pot diferi pe RHEL 10; verifică cu cat).'],
          ['curl -sI …/~alice/', 'primul test: 403 Forbidden este tipic când SELinux blochează (verifică AVC-ul).'],
          ['ausearch … | tail', 'AVC: httpd_t blocat să citească un fișier cu tipul de home.'],
          ['setsebool -P httpd_enable_homedirs on', 'permite persistent accesul la home.'],
          ['restorecon -Rv public_html', 'tipul fișierelor trebuie să fie cel web pentru home (httpd_user_content_t, din politică).'],
        ]} />
        <p className="small">
          Scenariul combină DAC (drepturile), tipul fișierului și boolean-ul: un caz tipic de examen. Dacă după toate aceste pași mai primești 403, citește AVC-ul (<code>ausearch -m avc -ts recent</code>) și <code>journalctl -u httpd</code>. Detaliile exacte (<code>userdir.conf</code>, tipul de fișier) pot diferi pe RHEL 10.
        </p>
      </Sec>

      <Sec id="outputs" code="7" title="Output-uri explicate">
        <CodeBlock title="getsebool" kind="session" label="illustrative" code={`[student@server1 ~]$ getsebool httpd_enable_homedirs httpd_can_sendmail
httpd_enable_homedirs --> off
httpd_can_sendmail --> off
[student@server1 ~]$ getsebool -a | grep -c httpd
62`} />
        <p className="small">
          Formatul <code>nume --&gt; stare</code> este cel obișnuit (pagina <code>getsebool(8)</code> nu îl documentează explicit; de confirmat). Dacă există o modificare în așteptare, ieșirea poate arăta ceva de forma <code>(off, on)</code> (curent, în așteptare). Numărul de boolean-uri ale httpd este ilustrativ.
        </p>
        <CodeBlock title="setsebool temporar vs persistent" kind="session" label="illustrative" code={`[root@server1 ~]# setsebool httpd_enable_homedirs on
[root@server1 ~]# getsebool httpd_enable_homedirs
httpd_enable_homedirs --> on
[root@server1 ~]# semanage boolean -l -C
[root@server1 ~]# setsebool -P httpd_enable_homedirs on
[root@server1 ~]# semanage boolean -l -C
SELinux boolean                State  Default Description
httpd_enable_homedirs          (on   ,   on)  Allow httpd to enable homedirs`} />
        <p className="small">
          Fără <code>-P</code>, lista locală (<code>-C</code>) este goală: nu există nicio schimbare persistentă. După <code>-P</code>, apare boolean-ul cu coloanele <b>State</b> (curentă și persistentă între paranteze), <b>Default</b> (implicit în politică) și <b>Description</b>. Formatul este ilustrativ.
        </p>
        <CodeBlock title="semanage boolean -l (extras)" kind="session" label="illustrative" code={`[root@server1 ~]# semanage boolean -l | grep -E 'SELinux boolean|httpd_can_sendmail|httpd_enable_homedirs'
SELinux boolean                State  Default Description
httpd_can_sendmail             (off  ,  off)  Allow httpd to can sendmail
httpd_enable_homedirs          (off  ,  off)  Allow httpd to enable homedirs`} />
        <p className="small">
          Perechea <code>(off , off)</code> înseamnă (valoare curentă, valoare persistentă). O pereche precum <code>(on , off)</code> arată o schimbare temporară: după reboot revine la off.
        </p>
        <CodeBlock title="AVC rezolvat de un boolean" kind="session" label="illustrative" code={`type=AVC … avc:  denied  { read } for  pid=5120 comm=httpd name=index.html scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:httpd_user_content_t:s0 tclass=file permissive=0`} />
        <p className="small">
          Aici eticheta fișierului (<code>httpd_user_content_t</code>) este cea corectă pentru conținut din home, dar <code>httpd_t</code> tot nu are voie să-l citească pentru că booleanul <code>httpd_enable_homedirs</code> este off. Aceasta este semnătura unei probleme de boolean: etichetele par bune, dar accesul este refuzat. Numele tipurilor sunt ilustrative.
        </p>
      </Sec>

      <Sec id="verify" code="8" title="Verificare">
        <Detailed>
          <ul>
            <li><b>Valoarea curentă:</b> <code>getsebool NUME</code>.</li>
            <li><b>Persistent?</b> <code>sudo semanage boolean -l -C</code> (apare cu starea schimbată) sau <code>semanage boolean -l | grep NUME</code> (ambele valori din paranteze identice).</li>
            <li><b>Test funcțional:</b> acțiunea serviciului funcționează (de exemplu <code>curl</code> pe pagina din home).</li>
            <li><b>Fără refuzări noi:</b> <code>sudo ausearch -m avc -ts recent</code> nu mai arată refuzarea.</li>
            <li><b>După reboot:</b> aceleași verificări; <code>getsebool</code> trebuie să dea valoarea dorită.</li>
          </ul>
        </Detailed>
      </Sec>

      <Sec id="persist" code="9" title="Persistență">
        <Detailed>
          <p>
            <b>Fără <code>-P</code>:</b> valoarea se pierde la reboot. <b>Cu <code>-P</code></b> (sau <code>semanage boolean -m</code>): persistă. Confirmare: după reboot, <code>getsebool NUME</code> și <code>semanage boolean -l -C</code>. Cea mai frecventă greșeală la examen este <code>setsebool</code> fără <code>-P</code>: totul „merge” în sesiune, dar verificarea după reboot eșuează.
          </p>
        </Detailed>
      </Sec>

      <Sec id="troubleshoot" code="10" title="Troubleshooting">
        <Table head={['Simptom', 'Cauză probabilă', 'Diagnostic', 'Remediere']} rows={[
          ['Boolean-ul dispare după reboot', 'setsebool fără -P', <code>semanage boolean -l -C</code>, <><code>setsebool -P NUME on</code></>],
          [<>setsebool: Boolean NUME is not defined</>, 'nume greșit', <><code>getsebool -a | grep parte_din_nume</code></>, 'folosește numele exact'],
          ['setsebool -P e foarte lent', 'recompilează/reîncarcă politica', '-', 'așteaptă; nu întrerupe comanda'],
          ['Boolean on, dar serviciul tot refuzat', 'etichetă fișier/port greșit sau alt boolean necesar', <><code>ausearch -m avc -ts recent</code></>, 'repară etichetele (L10.4–L10.6) sau caută alt boolean'],
          ['Nu găsesc boolean-ul potrivit', 'nume neintuitiv', <><code>semanage boolean -l | grep -i cuvânt</code></>, 'caută după descriere; audit2why / sealert pot sugera'],
          ['semanage boolean: command not found', 'pachet lipsă', <code>rpm -q policycoreutils-python-utils</code>, <code>dnf install policycoreutils-python-utils</code>],
          ['403 Forbidden pe pagini din home', 'DAC (x pe home), etichetă sau boolean', <><code>ls -ld /home/alice</code>, <code>ls -Z</code>, <code>getsebool httpd_enable_homedirs</code></>, 'verifică în ordine DAC → etichetă → boolean'],
          ['Am activat prea multe boolean-uri', 'practică proastă', <code>semanage boolean -l -C</code>, <>revino cu <code>setsebool -P … off</code> sau <code>semanage boolean -D</code></>],
        ]} />
      </Sec>

      <Sec id="traps" code="11" title="Greșeli frecvente și capcane de examen">
        <Traps items={[
          <>Uiți <code>-P</code> și pierzi setarea la reboot.</>,
          <>Scrii greșit numele (<code>httpd_enable_homedir</code> în loc de <code>httpd_enable_homedirs</code>).</>,
          <>Activezi boolean-uri la întâmplare până „merge”: privilegiul minim.</>,
          <>Crezi că un boolean înlocuiește eticheta fișierului: sunt independente.</>,
          <>Dezactivezi SELinux în loc să cauți boolean-ul.</>,
          <>Uiți DAC-ul (permisiunile pe home, <code>x</code> pe director) când testezi UserDir.</>,
          <>Folosești <code>setsebool NUME enable</code> (valori valide: on/off/1/0/true/false).</>,
          <>Presupui că <code>getsebool</code> arată starea persistentă: arată cea curentă (cu eventuale „pending”).</>,
          <>Nu verifici după reboot.</>,
          <>Nu testezi funcțional serviciul (doar rulezi <code>setsebool</code>).</>,
        ]} />
      </Sec>

      <DeepDive title="Deep dive: reguli condiționale, /sys/fs/selinux/booleans, setsebool -N, semanage boolean și audit2why">
        <p>
          <b>Reguli condiționale:</b> în limbajul politicii, <code>bool nume false;</code> declară comutatorul și <code>if (nume) {'{ … }'}</code> reguli active doar când este on. Kernelul păstrează valorile în <code>/sys/fs/selinux/booleans/NUME</code> (conțin „curent pending”, de exemplu <code>1 1</code>); <code>setsebool</code> scrie acolo.
        </p>
        <p>
          <b>setsebool -N:</b> nu reîncarcă politica de pe disc în kernel (<code>setsebool(8)</code>); folosit în scripturi, rar. <b>-V:</b> mesaje de eroare detaliate.
        </p>
        <p>
          <b>semanage boolean vs setsebool -P:</b> ambele scriu în același loc (valorile persistente); <code>semanage boolean -m --on NUME</code> este echivalentul lui <code>setsebool -P NUME on</code> (<code>semanage-boolean(8)</code>); <code>-l -C</code> și <code>-D</code> sunt specifice lui semanage.
        </p>
        <p>
          <b>togglesebool:</b> trimitere din <code>selinux(8)</code> la un utilitar vechi care inversează un boolean; nu este recomandat.
        </p>
        <p>
          <b>audit2why / audit2allow:</b> <code>audit2why</code> citește un AVC și spune dacă o regulă lipsește sau dacă un boolean o permite; <code>audit2allow</code> generează un modul de politică propriu (soluție de ultimă instanță; poate lărgi prea mult accesul). Nu fac parte din obiectivul oficial.
        </p>
        <p>
          <b>dontaudit:</b> multe acțiuni respinse nu sunt înregistrate (reguli <code>dontaudit</code>); de aceea „nimic în audit.log” nu înseamnă automat „nu e SELinux”. <code>semodule -DB</code> le arată temporar (avansat).
        </p>
      </DeepDive>
    </>
  );
}

export const L10_7: TopicModule = {
  id: 'L10.7',
  subtitle: 'boolean-uri SELinux: getsebool, setsebool (-P), semanage boolean (-l -m --on --off -C), exemple httpd/samba/nfs, curent vs persistent',
  studyTime: '≈95 min studiu + laborator',
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
  labs: [LAB_L10_7A, LAB_L10_7B],
  sources: [
    { kind: 'man', ref: 'setsebool(8), getsebool(8), semanage-boolean(8), sestatus(8), selinux(8) — man7.org, citite 2026-11-17' },
    { kind: 'man', ref: 'lista boolean-urilor și valorile implicite pe RHEL 10, formatul exact getsebool -a / semanage boolean -l, httpd_selinux(8), audit2why(8) (404), sealert — NECITITE; din cunoștințe, de confirmat la review' },
    { kind: 'doc', ref: 'RHEL 10 — „Using SELinux” (docs.redhat.com): HTTP 403 la 2026-11-17, necitită' },
  ],
};
