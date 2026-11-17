import type { Question } from '../../lib/types';

const T = 'L10.7';
const O = ['C10-8'];

export const Q_L10_7: Question[] = [
  {
    id: 'L10.7-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce este un boolean SELinux?',
    explanation: 'Comutator on/off al unei părți opționale din politică.',
    options: [
      { id: 'a', text: 'Un comutator on/off care activează sau dezactivează o parte opțională a politicii, fără reguli noi.', correct: true, why: 'Permite ajustarea comportamentului serviciilor confinate.' },
      { id: 'b', text: 'O etichetă de fișier.', correct: false, why: 'Etichetele fișierelor sunt contexte, nu boolean-uri.' },
      { id: 'c', text: 'Un mod al SELinux (enforcing/permissive).', correct: false, why: 'Modurile se schimbă cu setenforce.' },
      { id: 'd', text: 'Un tip de port.', correct: false, why: 'Aceasta este semanage port.' },
    ],
  },
  {
    id: 'L10.7-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează valoarea boolean-ului `httpd_enable_homedirs`.',
    prompt: '[student@server1 ~]$',
    answers: ['getsebool httpd_enable_homedirs'],
    canonical: 'getsebool httpd_enable_homedirs',
    explanation: 'getsebool NUME afișează starea.',
    wrong: [
      { text: 'setsebool httpd_enable_homedirs', why: 'setsebool cere și valoarea și modifică starea.' },
      { text: 'getenforce httpd_enable_homedirs', why: 'getenforce arată modul SELinux.' },
      { text: 'semanage boolean httpd_enable_homedirs', why: 'Fără -l nu listează; sintaxă incompletă.' },
    ],
  },
  {
    id: 'L10.7-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Activează `httpd_enable_homedirs` PERSISTENT (să supraviețuiască reboot-ului).',
    prompt: '[root@server1 ~]#',
    answers: ['setsebool -P httpd_enable_homedirs on', 'setsebool -P httpd_enable_homedirs 1', 'setsebool -P httpd_enable_homedirs=on', 'setsebool -P httpd_enable_homedirs=1', 'setsebool -P httpd_enable_homedirs true'],
    canonical: 'setsebool -P httpd_enable_homedirs on',
    explanation: '-P scrie valoarea în politica de pe disc.',
    wrong: [
      { text: 'setsebool httpd_enable_homedirs on', why: 'Fără -P schimbarea dispare la reboot.' },
      { text: 'semanage boolean -l httpd_enable_homedirs', why: '-l doar listează boolean-urile; nu modifică nimic.' },
      { text: 'setenforce 1', why: 'Schimbă modul SELinux, nu un boolean.' },
    ],
  },
  {
    id: 'L10.7-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Activează persistent `httpd_can_sendmail` folosind `semanage` (nu setsebool).',
    prompt: '[root@server1 ~]#',
    answers: ['semanage boolean -m --on httpd_can_sendmail', 'semanage boolean --modify --on httpd_can_sendmail', 'semanage boolean -m -1 httpd_can_sendmail'],
    canonical: 'semanage boolean -m --on httpd_can_sendmail',
    explanation: 'semanage boolean -m --on NUME este varianta persistentă (semanage-boolean(8)).',
    wrong: [
      { text: 'semanage boolean -l httpd_can_sendmail', why: '-l listează; nu modifică.' },
      { text: 'semanage boolean -m httpd_can_sendmail', why: 'Lipsește --on sau --off.' },
      { text: 'semanage port -a httpd_can_sendmail', why: 'port gestionează porturi, nu boolean-uri.' },
    ],
  },
  {
    id: 'L10.7-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai rulat `setsebool httpd_can_network_connect on` (fără -P). Ce se întâmplă după reboot?',
    explanation: 'Valoarea curentă se pierde; revine cea persistentă.',
    options: [
      { id: 'a', text: 'Boolean-ul revine la valoarea persistentă (de obicei off).', correct: true, why: 'Fără -P se schimbă doar valoarea curentă.' },
      { id: 'b', text: 'Rămâne on, deoarece kernelul îl salvează.', correct: false, why: 'Nu se salvează decât cu -P.' },
      { id: 'c', text: 'Sistemul nu mai pornește.', correct: false, why: 'Nu există un asemenea efect.' },
      { id: 'd', text: 'Devine on pentru toți utilizatorii și permanent.', correct: false, why: 'Nu persistă.' },
    ],
  },
  {
    id: 'L10.7-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre aceste comenzi arată boolean-uri?',
    explanation: 'getsebool, sestatus -b și semanage boolean -l citesc boolean-urile.',
    options: [
      { id: 'a', text: '`getsebool -a`', correct: true, why: 'Listează toate boolean-urile și valorile lor.' },
      { id: 'b', text: '`sestatus -b`', correct: true, why: '-b afișează starea boolean-urilor.' },
      { id: 'c', text: '`semanage boolean -l`', correct: true, why: 'Listează cu stare, implicit și descriere.' },
      { id: 'd', text: '`semanage port -l`', correct: false, why: 'Listează etichetele de porturi.' },
    ],
  },
  {
    id: 'L10.7-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Fragmentul de mai jos arată o schimbare doar TEMPORARĂ. Cum interpretezi starea?',
    explanation: 'Perechea (curent, persistent) = (on, off): după reboot revine off.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'semanage boolean -l', code: 'SELinux boolean                State  Default Description\nhttpd_enable_homedirs          (on   ,  off)  Allow httpd to enable homedirs' },
    options: [
      { id: 'a', text: 'Valoarea curentă este on, dar cea persistentă este off: după reboot revine la off.', correct: true, why: 'Prima valoare din paranteze este curentă, a doua persistentă (ilustrativ).' },
      { id: 'b', text: 'Boolean-ul este on persistent.', correct: false, why: 'Persistent ar fi (on , on).' },
      { id: 'c', text: 'Boolean-ul nu există.', correct: false, why: 'Este listat.' },
      { id: 'd', text: 'Boolean-ul este off acum.', correct: false, why: 'Prima valoare, cea curentă, este on.' },
    ],
  },
  {
    id: 'L10.7-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pagina din `/home/alice/public_html` nu se încarcă (403). Eticheta fișierului este cea corectă, iar AVC-ul arată `httpd_t` refuzat pe `user_home_dir_t`. Ce rezolvă?',
    explanation: 'Accesul httpd la home este controlat de boolean-ul httpd_enable_homedirs.',
    options: [
      { id: 'a', text: '`setsebool -P httpd_enable_homedirs on`', correct: true, why: 'Permite lui httpd_t accesul la directoarele home.' },
      { id: 'b', text: '`setenforce 0` și lași așa.', correct: false, why: 'Nu persistă și slăbește securitatea.' },
      { id: 'c', text: '`semanage port -a -t http_port_t -p tcp 80`', correct: false, why: 'Este o problemă de acces la fișiere, nu de port.' },
      { id: 'd', text: '`chmod 777 /home/alice`', correct: false, why: 'Nu rezolvă o refuzare SELinux și expune home-ul.' },
    ],
  },
  {
    id: 'L10.7-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii de diagnostic pentru „serviciul web este refuzat; poate fi un boolean”.',
    explanation: 'Excluzi DAC, etichetele, portul; apoi cauți și activezi booleanul.',
    items: [
      { text: '`ls -l` — excluzi DAC', why: 'Permisiunile clasice sunt cauza cea mai simplă.' },
      { text: '`ausearch -m avc -ts recent -i` — citești refuzarea', why: 'Vezi scontext, tcontext, clasa și acțiunea.' },
      { text: '`ls -Z` / `matchpathcon -V` — excluzi eticheta de fișier', why: 'Dacă eticheta e greșită, restorecon.' },
      { text: '`getsebool -a | grep httpd` / `semanage boolean -l | grep -i cuvânt` — cauți boolean-ul', why: 'Numele și descrierea indică acțiunea permisă.' },
      { text: '`setsebool -P NUME on` apoi testezi', why: 'Aplici persistent și verifici funcțional.' },
    ],
  },
  {
    id: 'L10.7-010', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește boolean-ul cu ce permite când este activat.',
    explanation: 'Numele boolean-urilor indică serviciul și acțiunea.',
    leftLabel: 'Boolean', rightLabel: 'Permite',
    pairs: [
      { left: '`httpd_enable_homedirs`', right: 'Apache poate accesa directoarele home ale utilizatorilor', why: 'Folosit cu UserDir.' },
      { left: '`httpd_can_network_connect`', right: 'Apache poate iniția conexiuni de rețea către alte servicii', why: 'API-uri externe etc.' },
      { left: '`httpd_can_sendmail`', right: 'Apache poate trimite e-mail', why: 'Aplicații web cu notificări.' },
      { left: '`samba_enable_home_dirs`', right: 'Samba poate exporta directoarele home', why: 'Share-uri de home.' },
    ],
    distractors: [{ text: 'schimbă modul SELinux în permissive', why: 'Aceasta este setenforce 0.' }],
  },
  {
    id: 'L10.7-011', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este diferența dintre `setsebool -P NUME on` și `semanage boolean -m --on NUME`?',
    explanation: 'Ambele scriu valoarea persistentă; semanage are și -l -C și -D.',
    options: [
      { id: 'a', text: 'Practic niciuna pentru setarea persistentă: ambele scriu valoarea în politică; semanage oferă în plus listarea locală (`-l -C`) și ștergerea (`-D`).', correct: true, why: 'semanage-boolean(8) o descrie ca echivalentul persistent al lui setsebool.' },
      { id: 'b', text: 'Prima este temporară, a doua persistentă.', correct: false, why: '-P face prima persistentă.' },
      { id: 'c', text: 'A doua schimbă modul SELinux.', correct: false, why: 'Nu modifică modul.' },
      { id: 'd', text: 'Prima nu funcționează pe RHEL.', correct: false, why: 'Funcționează.' },
    ],
  },
  {
    id: 'L10.7-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce este greșit în comandă, dacă vrei ca Apache să trimită e-mail persistent?',
    explanation: 'Fără -P, schimbarea este doar temporară.',
    snippet: { kind: 'find-error', title: 'comandă', code: 'setsebool httpd_can_sendmail on' },
    options: [
      { id: 'a', text: 'Lipsește `-P`: fără el valoarea se pierde la reboot.', correct: true, why: 'setsebool(8): -P scrie în politica de pe disc.' },
      { id: 'b', text: 'Valoarea trebuie scrisă `enable`.', correct: false, why: 'Valorile valide sunt on/off/1/0/true/false.' },
      { id: 'c', text: 'Comanda corectă este `setenforce httpd_can_sendmail on`.', correct: false, why: 'setenforce nu primește boolean-uri.' },
      { id: 'd', text: 'Trebuie rulată fără sudo.', correct: false, why: 'Cere drepturi de administrator.' },
    ],
  },
];
