import type { Question } from '../../lib/types';

const T = 'L10.8';
const O: string[] = []; // lecție de suport: fără obiectiv oficial propriu

export const Q_L10_8: Question[] = [
  {
    id: 'L10.8-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Un serviciu nu funcționează și suspectezi SELinux. Care este cel mai rapid test de confirmare?',
    explanation: 'Treci temporar în permissive; dacă problema dispare, cauza este SELinux; revino imediat în enforcing.',
    options: [
      { id: 'a', text: '`setenforce 0`, retestezi, apoi imediat `setenforce 1`.', correct: true, why: 'În permissive nu se blochează nimic: dacă merge, SELinux era cauza.' },
      { id: 'b', text: '`SELINUX=disabled` și reboot.', correct: false, why: 'Mult prea invaziv, depreciat și cere relabel la reactivare.' },
      { id: 'c', text: '`chmod 777` pe tot.', correct: false, why: 'Nu testează SELinux și slăbește DAC.' },
      { id: 'd', text: 'Reinstalezi serviciul.', correct: false, why: 'Nu are legătură cu cauza.' },
    ],
  },
  {
    id: 'L10.8-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează refuzările SELinux (AVC) din ultimele minute, cu valorile interpretate.',
    prompt: '[root@server1 ~]#',
    answers: ['ausearch -m avc -ts recent -i', 'ausearch -m avc -i -ts recent', 'ausearch -ts recent -m avc -i', 'ausearch -i -m avc -ts recent'],
    canonical: 'ausearch -m avc -ts recent -i',
    explanation: '-m avc = tipul mesajului, -ts recent = ultimele minute, -i = interpretează.',
    wrong: [
      { text: 'ausearch -m avc -ts recent', why: 'Funcționează, dar fără -i valorile rămân numerice (cerința cere interpretare).' },
      { text: 'grep denied /etc/passwd', why: 'Nu caută în jurnalul de audit.' },
      { text: 'getenforce', why: 'Arată modul, nu refuzările.' },
    ],
  },
  {
    id: 'L10.8-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce categorie de problemă indică acest AVC și ce remediu se aplică?',
    explanation: 'name_bind pe tcp_socket → port label (semanage port).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'AVC', code: 'avc:  denied  { name_bind } for  comm=httpd src=8085 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:unreserved_port_t:s0 tclass=tcp_socket permissive=0' },
    options: [
      { id: 'a', text: 'Port neetichetat: `semanage port -a -t http_port_t -p tcp 8085`.', correct: true, why: 'name_bind + tcp_socket + src=PORT este semnătura unui port label lipsă.' },
      { id: 'b', text: 'Fișier cu etichetă greșită: `restorecon`.', correct: false, why: 'tclass este tcp_socket, nu file.' },
      { id: 'c', text: 'Boolean lipsă: `setsebool -P`.', correct: false, why: 'Aici nu este o acțiune opțională, ci un port neetichetat.' },
      { id: 'd', text: 'Firewall: `firewall-cmd --add-port`.', correct: false, why: 'AVC este mesaj SELinux; firewall-ul este alt strat.' },
    ],
  },
  {
    id: 'L10.8-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce categorie de problemă indică acest AVC și ce remediu se aplică?',
    explanation: 'Fișier cu tip nepotrivit → restorecon/semanage fcontext.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'AVC', code: 'avc:  denied  { read } for  comm="httpd" name="index.html" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0' },
    options: [
      { id: 'a', text: 'Etichetă de fișier greșită: `restorecon -v` (sau `semanage fcontext` + `restorecon` pentru o cale nestandard).', correct: true, why: 'httpd_t citește un fișier cu tipul user_home_t.' },
      { id: 'b', text: 'Port neetichetat.', correct: false, why: 'Nu există name_bind sau tcp_socket.' },
      { id: 'c', text: 'SELinux trebuie dezactivat.', correct: false, why: 'Nu este remediu.' },
      { id: 'd', text: 'Utilizatorul nu are parolă.', correct: false, why: 'Nu are legătură.' },
    ],
  },
  {
    id: 'L10.8-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce este util `setenforce 0` pentru diagnostic, în plus față de test?',
    explanation: 'În permissive vezi toate refuzările într-o singură rulare, nu doar prima.',
    options: [
      { id: 'a', text: 'În permissive procesul nu se oprește la prima refuzare, deci toate refuzările apar în log odată.', correct: true, why: 'În enforcing serviciul eșuează la prima eroare și poate urma alta.' },
      { id: 'b', text: 'Remediază definitiv problema.', correct: false, why: 'Nu repară nimic, doar permite.' },
      { id: 'c', text: 'Este persistent și protejează sistemul.', correct: false, why: 'Nu este persistent și slăbește protecția.' },
      { id: 'd', text: 'Șterge jurnalul de audit.', correct: false, why: 'Nu are acest efect.' },
    ],
  },
  {
    id: 'L10.8-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care sunt remedii corecte, persistente, pentru cauze SELinux obișnuite?',
    explanation: 'Etichetă, port, boolean — toate scrise în politică.',
    options: [
      { id: 'a', text: '`semanage fcontext -a …` urmat de `restorecon -R`.', correct: true, why: 'Regulă + aplicare pentru etichete de fișiere.' },
      { id: 'b', text: '`semanage port -a -t TIP -p tcp PORT`.', correct: true, why: 'Eticheta portului, persistentă și imediată.' },
      { id: 'c', text: '`setsebool -P NUME on`.', correct: true, why: 'Boolean persistent.' },
      { id: 'd', text: '`setenforce 0` lăsat definitiv.', correct: false, why: 'Nu persistă și este considerat greșeală.' },
    ],
  },
  {
    id: 'L10.8-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pagina dă 403, `getenforce` este Enforcing, iar `ausearch -m avc -ts recent` nu returnează nimic. Ce faci?',
    explanation: 'Fără AVC, cauza este probabil DAC, configurația serviciului sau firewall; verifici și posibile dontaudit.',
    options: [
      { id: 'a', text: 'Verifici DAC (`ls -l`, `namei -l`), configurația serviciului și jurnalul acestuia; confirmi cu permissive dacă problema dispare.', correct: true, why: 'Nu orice 403 este SELinux; permissive încă te ajută să decizi.' },
      { id: 'b', text: 'Dezactivezi SELinux.', correct: false, why: 'Fără dovezi, nu rezolvă nimic și slăbește sistemul.' },
      { id: 'c', text: 'Reinstalezi auditd.', correct: false, why: 'Nu este indicat fără o dovadă.' },
      { id: 'd', text: 'Rulezi `restorecon -R /`.', correct: false, why: 'Lent și fără ținta problemei.' },
    ],
  },
  {
    id: 'L10.8-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'În AVC-ul de mai jos, ce înseamnă `permissive=1`?',
    explanation: 'Refuzarea a fost doar înregistrată, nu blocată.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'AVC', code: 'avc:  denied  { read } for  comm="httpd" name="index.html" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=1' },
    options: [
      { id: 'a', text: 'SELinux era în permissive: accesul a fost permis și doar înregistrat; în enforcing ar fi fost blocat.', correct: true, why: 'permissive=1 → înregistrat, nu blocat.' },
      { id: 'b', text: 'Accesul a fost blocat.', correct: false, why: 'Blocarea apare cu permissive=0.' },
      { id: 'c', text: 'Politica a fost dezactivată.', correct: false, why: 'Politica este încărcată în permissive.' },
      { id: 'd', text: 'Fișierul nu există.', correct: false, why: 'Mesajul nu spune așa ceva.' },
    ],
  },
  {
    id: 'L10.8-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii metodei de diagnostic SELinux.',
    explanation: 'Confirmi, citești, clasifici, repari persistent, retestezi.',
    items: [
      { text: '`setenforce 0`, retestezi serviciul, apoi `setenforce 1`', why: 'Confirmi (sau excluzi) SELinux ca și cauză.' },
      { text: '`ausearch -m avc -ts recent -i` — citești refuzările', why: 'Obții scontext, tcontext, tclass, acțiune.' },
      { text: 'Clasifici: fișier (restorecon/fcontext), port (semanage port) sau boolean (setsebool -P)', why: 'Tipul de refuzare indică remediul.' },
      { text: 'Aplici remediul PERSISTENT', why: 'Altfel problema revine la reboot sau relabel.' },
      { text: 'Retestezi în enforcing și verifici lipsa AVC noi', why: 'Doar așa dovedești că ai rezolvat.' },
    ],
  },
  {
    id: 'L10.8-010', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește fragmentul din AVC cu ce îți spune.',
    explanation: 'Fiecare câmp are un rol în diagnostic.',
    leftLabel: 'Câmp', rightLabel: 'Ce arată',
    pairs: [
      { left: '`scontext`', right: 'contextul procesului (sursa), de exemplu domeniul httpd_t', why: 'Cine a cerut accesul.' },
      { left: '`tcontext`', right: 'contextul obiectului vizat (ținta), de exemplu tipul fișierului', why: 'Ce s-a încercat să se acceseze.' },
      { left: '`tclass`', right: 'clasa obiectului: file, dir, tcp_socket…', why: 'Indică natura problemei.' },
      { left: '`permissive`', right: '0 = blocat, 1 = doar înregistrat', why: 'Arată dacă accesul a fost efectiv refuzat.' },
    ],
    distractors: [{ text: 'numele utilizatorului Linux care a pornit serviciul', why: 'Nu este un câmp AVC; apare ca uid în înregistrarea SYSCALL.' }],
  },
  {
    id: 'L10.8-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un coleg a rezolvat o problemă cu `chcon -t httpd_sys_content_t /srv/web/index.html`. După o săptămână, problema revine. De ce?',
    explanation: 'chcon nu scrie nicio regulă; restorecon sau relabel readuc eticheta implicită.',
    options: [
      { id: 'a', text: 'chcon nu este înscris în politică; un restorecon/relabel a readus eticheta implicită a căii. Soluția durabilă este semanage fcontext + restorecon.', correct: true, why: 'Politica nu cunoaște modificarea făcută cu chcon.' },
      { id: 'b', text: 'SELinux se dezactivează singur după 7 zile.', correct: false, why: 'Nu există asemenea comportament.' },
      { id: 'c', text: 'Fișierul a fost șters.', correct: false, why: 'Nu este cauza descrisă.' },
      { id: 'd', text: 'Boolean-urile se resetează săptămânal.', correct: false, why: 'Nu se resetează.' },
    ],
  },
  {
    id: 'L10.8-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce este greșit în abordarea de mai jos?',
    explanation: 'Dezactivarea SELinux nu este remediu și pică task-uri care cer enforcing.',
    snippet: { kind: 'find-error', title: 'pași „de rezolvat” un 403', code: '1) sudo setenforce 0\n2) merge → lăsăm așa\n3) sed -i s/enforcing/disabled/ /etc/selinux/config' },
    options: [
      { id: 'a', text: 'Dezactivează protecția în loc să repare cauza; sistemul trebuie lăsat în enforcing, cu etichetă/port/boolean corectate persistent.', correct: true, why: 'setenforce 0 este doar test; disabled este depreciat și cere relabel.' },
      { id: 'b', text: 'Pasul 1 este greșit: trebuie setenforce 2.', correct: false, why: 'Valoarea 2 nu există.' },
      { id: 'c', text: 'Lipsește un reboot.', correct: false, why: 'Un reboot nu rezolvă problema de principiu.' },
      { id: 'd', text: 'Nimic: abordarea este recomandată.', correct: false, why: 'Contrazice practica și obiectivele oficiale.' },
    ],
  },
];
