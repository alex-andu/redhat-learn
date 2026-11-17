import type { Question } from '../../lib/types';

const T = 'L10.5';
const O = ['C10-6'];

export const Q_L10_5: Question[] = [
  {
    id: 'L10.5-001', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Readu fișierul `/var/www/html/index.html` la contextul SELinux implicit, afișând schimbarea.',
    prompt: '[root@server1 ~]#',
    answers: ['restorecon -v /var/www/html/index.html'],
    canonical: 'restorecon -v /var/www/html/index.html',
    explanation: 'restorecon aplică eticheta implicită din politică; -v arată ce se schimbă.',
    wrong: [
      { text: 'chcon -v /var/www/html/index.html', why: 'chcon cere un context explicit și nu folosește politica.' },
      { text: 'setenforce 1', why: 'Schimbă modul, nu etichetele.' },
      { text: 'restorecon /var/www/html', why: 'Fără -R nu repară conținutul directorului și fără -v nu afișează schimbările.' },
    ],
  },
  {
    id: 'L10.5-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Reetichetează recursiv `/srv/web` și afișează ce se schimbă.',
    prompt: '[root@server1 ~]#',
    answers: ['restorecon -Rv /srv/web', 'restorecon -vR /srv/web', 'restorecon -R -v /srv/web', 'restorecon -rv /srv/web'],
    canonical: 'restorecon -Rv /srv/web',
    explanation: '-R recursiv, -v verbose.',
    wrong: [
      { text: 'restorecon -v /srv/web', why: 'Fără -R reetichetează doar directorul, nu conținutul.' },
      { text: 'restorecon -nv /srv/web', why: '-n înseamnă simulare: nu schimbă nimic.' },
      { text: 'chcon -R /srv/web', why: 'chcon fără tip nu este valid și oricum nu este durabil.' },
    ],
  },
  {
    id: 'L10.5-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Fără a modifica nimic, arată ce ar reeticheta `restorecon` în `/var/www/html` (recursiv).',
    prompt: '[root@server1 ~]#',
    answers: ['restorecon -nRv /var/www/html', 'restorecon -Rnv /var/www/html', 'restorecon -n -R -v /var/www/html', 'restorecon -nvR /var/www/html', 'restorecon -Rvn /var/www/html'],
    canonical: 'restorecon -nRv /var/www/html',
    explanation: '-n = verificare pasivă; cu -v listează ce ar schimba.',
    wrong: [
      { text: 'restorecon -Rv /var/www/html', why: 'Aplică schimbările, nu doar le simulează.' },
      { text: 'matchpathcon /var/www/html', why: 'Afișează eticheta implicită a unei căi, nu simulează restorecon pe tot subarborele.' },
      { text: 'restorecon -F /var/www/html', why: '-F forțează resetarea completă; nu este simulare.' },
    ],
  },
  {
    id: 'L10.5-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai creat `/srv/web` pentru conținut Apache și vrei ca eticheta `httpd_sys_content_t` să fie PERSISTENTĂ. Care este secvența corectă?',
    explanation: 'Adaugi regula în politică, apoi o aplici pe fișiere.',
    options: [
      { id: 'a', text: '`semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"` urmat de `restorecon -Rv /srv/web`.', correct: true, why: 'Regula e salvată în politică; restorecon o aplică pe fișierele existente.' },
      { id: 'b', text: '`chcon -R -t httpd_sys_content_t /srv/web`.', correct: false, why: 'Nu scrie nicio regulă: restorecon/relabel o anulează.' },
      { id: 'c', text: '`semanage fcontext -a -t httpd_sys_content_t /srv/web` și atât.', correct: false, why: 'Fără (/.*)? nu acoperă fișierele, iar fără restorecon nu se aplică.' },
      { id: 'd', text: '`setenforce 0`.', correct: false, why: 'Dezactivează protecția, nu pune etichete.' },
    ],
  },
  {
    id: 'L10.5-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai rulat doar `semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"`. `ls -Z /srv/web/index.html` arată tot `var_t`. De ce?',
    explanation: 'semanage modifică politica, nu fișierele; trebuie restorecon.',
    options: [
      { id: 'a', text: 'Regula a fost adăugată în politică, dar nu aplicată pe fișiere; lipsește `restorecon -Rv /srv/web`.', correct: true, why: 'Fișierele existente își schimbă eticheta doar la restorecon.' },
      { id: 'b', text: 'Comanda a eșuat în tăcere.', correct: false, why: 'Regula apare în `semanage fcontext -l -C`.' },
      { id: 'c', text: 'Trebuie reboot.', correct: false, why: 'Nu este nevoie de reboot.' },
      { id: 'd', text: 'Tipul `httpd_sys_content_t` nu există.', correct: false, why: 'Există; fără el semanage ar fi dat eroare.' },
    ],
  },
  {
    id: 'L10.5-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmațiile despre `chcon` și `semanage fcontext` sunt corecte?',
    explanation: 'chcon = schimbare directă, nedurabilă; semanage fcontext = regulă în politică.',
    options: [
      { id: 'a', text: '`chcon` schimbă eticheta direct, fără a modifica politica.', correct: true, why: 'Nu scrie nicio regulă.' },
      { id: 'b', text: 'O etichetă pusă doar cu `chcon` se pierde la `restorecon` sau la un relabel.', correct: true, why: 'Politica nu o cunoaște, deci revine la valoarea implicită.' },
      { id: 'c', text: '`semanage fcontext -a` salvează regula, dar fișierele se schimbă la `restorecon`.', correct: true, why: 'Doi pași: regulă + aplicare.' },
      { id: 'd', text: '`semanage fcontext -a` reetichetează imediat toate fișierele.', correct: false, why: 'Nu atinge fișierele existente.' },
    ],
  },
  {
    id: 'L10.5-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce este greșit în regula de mai jos, dacă vrei ca TOT conținutul din `/srv/web` să primească tipul web?',
    explanation: 'Fără (/.*)? regula se potrivește doar cu directorul, nu cu fișierele.',
    snippet: { kind: 'find-error', title: 'comandă', code: 'semanage fcontext -a -t httpd_sys_content_t "/srv/web"' },
    options: [
      { id: 'a', text: 'Lipsește `(/.*)?`: regula se potrivește doar cu directorul `/srv/web`, nu cu ce e sub el.', correct: true, why: 'Expresia regulată trebuie să includă subarborele.' },
      { id: 'b', text: 'Lipsește `sudo`.', correct: false, why: 'Aceasta nu este problema regulii.' },
      { id: 'c', text: 'Tipul trebuie scris cu majuscule.', correct: false, why: 'Tipurile sunt litere mici.' },
      { id: 'd', text: 'Opțiunea corectă este `-d`.', correct: false, why: '-d șterge o regulă; pentru adăugare este -a.' },
    ],
  },
  {
    id: 'L10.5-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rezultatul este mai jos. Ce a făcut `restorecon`?',
    explanation: 'A schimbat tipul din user_home_t în httpd_sys_content_t; utilizatorul a rămas neschimbat.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'restorecon -Rv', code: 'Relabeled /var/www/html/page.html from unconfined_u:object_r:user_home_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0' },
    options: [
      { id: 'a', text: 'A schimbat TIPUL fișierului la cel implicit al căii; utilizatorul `unconfined_u` a rămas neschimbat.', correct: true, why: 'restorecon(8): doar tipul se schimbă, fără -F/-U.' },
      { id: 'b', text: 'A schimbat proprietarul fișierului.', correct: false, why: 'Proprietarul Linux nu este afectat de restorecon.' },
      { id: 'c', text: 'A schimbat drepturile în 644.', correct: false, why: 'restorecon nu modifică permisiunile.' },
      { id: 'd', text: 'A dezactivat SELinux pentru fișier.', correct: false, why: 'Nu există așa ceva.' },
    ],
  },
  {
    id: 'L10.5-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce verifică `matchpathcon -V /srv/web/index.html`?',
    explanation: 'Compară eticheta de pe disc cu cea implicită din politică.',
    options: [
      { id: 'a', text: 'Dacă eticheta de pe disc coincide cu cea implicită din politică („verified” sau diferența).', correct: true, why: 'matchpathcon(8): -V verifică contextul de pe disc.' },
      { id: 'b', text: 'Dacă serviciul httpd rulează.', correct: false, why: 'Nu verifică servicii.' },
      { id: 'c', text: 'Dacă SELinux este enforcing.', correct: false, why: 'Aceasta este treaba lui getenforce.' },
      { id: 'd', text: 'Permisiunile rwx.', correct: false, why: 'Aceasta este ls -l.' },
    ],
  },
  {
    id: 'L10.5-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru: „un director nou `/data/site` trebuie să poată fi servit de Apache, persistent”.',
    explanation: 'Regulă, aplicare, verificare.',
    items: [
      { text: '`ls -dZ /data/site` — notezi eticheta de pornire', why: 'Știi ce trebuie schimbat.' },
      { text: '`semanage fcontext -a -t httpd_sys_content_t "/data/site(/.*)?"`', why: 'Adaugi regula în politică.' },
      { text: '`restorecon -Rv /data/site`', why: 'Aplici regula pe fișierele existente.' },
      { text: '`matchpathcon -V /data/site /data/site/*`', why: 'Verifici că etichetele sunt cele implicite.' },
      { text: '`semanage fcontext -l -C` — confirmi că regula e salvată', why: 'Dovada persistenței regulii.' },
    ],
  },
  {
    id: 'L10.5-011', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda cu efectul ei.',
    explanation: 'Fiecare comandă lucrează pe alt nivel (politică sau fișiere).',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`semanage fcontext -a …`', right: 'adaugă o regulă cale → tip în politică (nu atinge fișierele)', why: 'Regula e salvată local.' },
      { left: '`restorecon -Rv DIR`', right: 'aplică etichetele implicite pe fișiere, recursiv', why: 'Citește politica și schimbă fișierele.' },
      { left: '`chcon -t TIP FIȘIER`', right: 'schimbă direct eticheta, fără regulă (nedurabil)', why: 'Se pierde la restorecon/relabel.' },
      { left: '`touch /.autorelabel`', right: 'programează reetichetarea întregului sistem la boot', why: 'Folosit după disabled sau stricăciuni mari.' },
    ],
    distractors: [{ text: 'schimbă modul SELinux în permissive', why: 'Aceasta este setenforce 0.' }],
  },
  {
    id: 'L10.5-012', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: '`restorecon -Rv /var/www/html` rulat a doua oară nu afișează nimic. Ce înseamnă?',
    explanation: '-v raportează doar schimbările; lipsa lor înseamnă că totul era deja corect.',
    options: [
      { id: 'a', text: 'Etichetele erau deja cele implicite: nu a fost nimic de schimbat.', correct: true, why: 'Lipsa de output nu este eroare.' },
      { id: 'b', text: 'Comanda a eșuat.', correct: false, why: 'La eșec apar mesaje de eroare.' },
      { id: 'c', text: 'SELinux este disabled.', correct: false, why: 'Atunci restorecon ar semnala o problemă.' },
      { id: 'd', text: 'Directorul este gol.', correct: false, why: 'Nu este motivul: nu are legătură cu conținutul.' },
    ],
  },
];
