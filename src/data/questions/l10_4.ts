import type { Question } from '../../lib/types';

const T = 'L10.4';
const O = ['C10-5'];

export const Q_L10_4: Question[] = [
  {
    id: 'L10.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'În contextul `system_u:object_r:httpd_sys_content_t:s0`, care câmp este cel mai important pentru politica targeted?',
    explanation: 'Politica targeted decide după tip (Type Enforcement).',
    options: [
      { id: 'a', text: 'Tipul: `httpd_sys_content_t`.', correct: true, why: 'Regulile politicii referă tipuri și domenii.' },
      { id: 'b', text: 'Utilizatorul: `system_u`.', correct: false, why: 'Este identitatea SELinux; la targeted nu decide accesul.' },
      { id: 'c', text: 'Rolul: `object_r`.', correct: false, why: 'Pentru fișiere este mereu object_r.' },
      { id: 'd', text: 'Nivelul: `s0`.', correct: false, why: 'Este nivelul MLS, de obicei s0 la targeted.' },
    ],
  },
  {
    id: 'L10.4-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează contextul SELinux al fișierului `/etc/hostname`.',
    prompt: '[student@server1 ~]$',
    answers: ['ls -Z /etc/hostname', 'ls -lZ /etc/hostname', 'ls -Zl /etc/hostname', 'stat -c %C /etc/hostname'],
    canonical: 'ls -Z /etc/hostname',
    explanation: '-Z adaugă contextul de securitate în afișarea ls.',
    wrong: [
      { text: 'ls -l /etc/hostname', why: 'Fără -Z nu apare contextul SELinux.' },
      { text: 'getenforce /etc/hostname', why: 'getenforce nu primește fișiere; arată modul SELinux.' },
      { text: 'cat /etc/hostname', why: 'Afișează conținutul fișierului, nu eticheta lui.' },
    ],
  },
  {
    id: 'L10.4-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează contextul (domeniul) proceselor `sshd`, folosind selecția după nume de comandă.',
    prompt: '[student@server1 ~]$',
    answers: ['ps -ZC sshd', 'ps -Z -C sshd', 'ps -C sshd -Z'],
    canonical: 'ps -ZC sshd',
    explanation: '-C selectează după comandă, -Z adaugă contextul.',
    wrong: [
      { text: 'ps -C sshd', why: 'Fără -Z nu afișează contextul.' },
      { text: 'ps -ef | grep sshd', why: 'Arată procesele, dar nu contextul SELinux.' },
      { text: 'ls -Z /usr/sbin/sshd', why: 'Arată eticheta executabilului, nu domeniul procesului.' },
    ],
  },
  {
    id: 'L10.4-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează contextul SELinux al propriei sesiuni (utilizatorul curent).',
    prompt: '[student@server1 ~]$',
    answers: ['id -Z'],
    canonical: 'id -Z',
    explanation: 'id -Z afișează contextul de securitate al procesului curent.',
    wrong: [
      { text: 'id -u', why: 'Afișează UID-ul, nu contextul.' },
      { text: 'whoami -Z', why: 'whoami nu are opțiunea -Z.' },
      { text: 'getenforce', why: 'Afișează modul SELinux, nu contextul tău.' },
    ],
  },
  {
    id: 'L10.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată linia de mai jos despre procesul `bash` al utilizatorului?',
    explanation: 'unconfined_t = neconfinat: SELinux îl restricționează puțin.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ps -Z', code: 'unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023 1844 pts/0 00:00:00 bash' },
    options: [
      { id: 'a', text: 'Rulează în domeniul neconfinat `unconfined_t`: restricții SELinux foarte mici (politica targeted).', correct: true, why: 'Tipul (domeniul) este unconfined_t.' },
      { id: 'b', text: 'Rulează în domeniul serviciului web `httpd_t`.', correct: false, why: 'Domeniul este cel din al treilea câmp: unconfined_t.' },
      { id: 'c', text: 'SELinux este disabled.', correct: false, why: 'Contextul există, deci SELinux este activ.' },
      { id: 'd', text: 'Este un proces de kernel.', correct: false, why: 'Este un shell obișnuit pe un terminal (pts/0).' },
    ],
  },
  {
    id: 'L10.4-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai mutat cu `mv` un fișier din `/home/alice` în `/var/www/html`. Ce tip va avea fișierul?',
    explanation: 'mv în același sistem de fișiere păstrează eticheta sursei.',
    options: [
      { id: 'a', text: 'Cel vechi, `user_home_t` (mv nu schimbă eticheta).', correct: true, why: 'mv doar redenumește; nu creează un fișier nou.' },
      { id: 'b', text: '`httpd_sys_content_t`, moștenit de la director.', correct: false, why: 'Aceasta ar fi valabilă la creare sau la cp, nu la mv.' },
      { id: 'c', text: '`unlabeled_t`.', correct: false, why: 'Eticheta nu se pierde la mv.' },
      { id: 'd', text: 'Nu are etichetă.', correct: false, why: 'Orice fișier pe un sistem cu SELinux are etichetă.' },
    ],
  },
  {
    id: 'L10.4-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre operații dau fișierului nou tipul DIRECTORULUI DESTINAȚIE?',
    explanation: 'Crearea unui fișier nou ia tipul părintelui; cp creează un fișier nou.',
    options: [
      { id: 'a', text: '`touch /var/www/html/a.html`', correct: true, why: 'Fișier nou creat: tipul directorului părinte.' },
      { id: 'b', text: '`cp /home/alice/a.html /var/www/html/`', correct: true, why: 'cp creează un fișier nou în destinație.' },
      { id: 'c', text: '`echo test > /var/www/html/b.html`', correct: true, why: 'Redirecționarea creează fișier nou.' },
      { id: 'd', text: '`mv /home/alice/a.html /var/www/html/`', correct: false, why: 'mv păstrează eticheta sursei.' },
    ],
  },
  {
    id: 'L10.4-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rezultatul `matchpathcon -V` este mai jos. Ce faci?',
    explanation: 'Eticheta de pe disc diferă de cea implicită; o readuci cu restorecon.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'matchpathcon -V', code: '/var/www/html/index.html has context unconfined_u:object_r:user_home_t:s0, should be system_u:object_r:httpd_sys_content_t:s0' },
    options: [
      { id: 'a', text: 'Fișierul are tip greșit pentru locația lui; îl readuci la cel implicit cu `restorecon -v` (L10.5).', correct: true, why: 'restorecon aplică eticheta din politică pentru cale.' },
      { id: 'b', text: 'Dezactivezi SELinux.', correct: false, why: 'Nu este remediul; problema este o etichetă.' },
      { id: 'c', text: 'Schimbi proprietarul cu `chown apache`.', correct: false, why: 'chown schimbă DAC, nu eticheta SELinux.' },
      { id: 'd', text: 'Faci `chmod 777` pe fișier.', correct: false, why: 'Nu modifică eticheta SELinux.' },
    ],
  },
  {
    id: 'L10.4-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'De ce trebuie să folosești `ls -dZ /var/www` (cu `-d`) ca să vezi eticheta directorului?',
    explanation: 'Fără -d, ls arată conținutul directorului, nu directorul însuși.',
    options: [
      { id: 'a', text: 'Fără `-d`, `ls` listează conținutul directorului, nu directorul însuși.', correct: true, why: '-d tratează directorul ca pe un element.' },
      { id: 'b', text: '`-d` înseamnă „debug”.', correct: false, why: 'Nu are acest sens la ls.' },
      { id: 'c', text: '`-d` dezactivează SELinux pentru comandă.', correct: false, why: 'Nu are legătură cu SELinux.' },
      { id: 'd', text: '`-Z` funcționează doar cu `-d`.', correct: false, why: '-Z funcționează și fără -d, dar pentru conținut.' },
    ],
  },
  {
    id: 'L10.4-013', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un coleg vrea eticheta directorului `/var/www` ÎNSUȘI, dar comanda lui afișează etichetele fișierelor din interior. Ce lipsește?',
    explanation: 'Fără -d, ls listează conținutul unui director, nu directorul.',
    snippet: { kind: 'find-error', title: 'comanda colegului', code: '$ ls -Z /var/www\nsystem_u:object_r:httpd_sys_script_exec_t:s0 cgi-bin\nsystem_u:object_r:httpd_sys_content_t:s0 html' },
    options: [
      { id: 'a', text: 'Opțiunea `-d`: `ls -dZ /var/www`.', correct: true, why: '-d afișează directorul ca element, nu conținutul lui.' },
      { id: 'b', text: 'Opțiunea `-R`.', correct: false, why: '-R listează recursiv, deci și mai mult conținut.' },
      { id: 'c', text: 'Comanda trebuie rulată cu `getenforce`.', correct: false, why: 'getenforce afișează modul SELinux.' },
      { id: 'd', text: 'Trebuie `sudo`: altfel eticheta nu se vede.', correct: false, why: 'Eticheta directorului este vizibilă și fără sudo; lipsa -d este problema.' },
    ],
  },
  {
    id: 'L10.4-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii de diagnostic: „httpd nu poate citi `/var/www/html/index.html`, deși drepturile sunt 644”.',
    explanation: 'Compari domeniul procesului cu eticheta fișierului și cu cea implicită.',
    items: [
      { text: '`ls -l` — verifici drepturile clasice (DAC)', why: 'Elimini mai întâi cauza clasică.' },
      { text: '`ps -ZC httpd` — domeniul procesului', why: 'Afli sursa accesului (httpd_t).' },
      { text: '`ls -Z /var/www/html/index.html` — eticheta fișierului', why: 'Afli ținta.' },
      { text: '`matchpathcon /var/www/html/index.html` — eticheta implicită', why: 'O compari cu cea reală.' },
      { text: '`sudo ausearch -m avc -ts recent` — confirmi refuzarea', why: 'AVC-ul arată scontext/tcontext.' },
    ],
  },
  {
    id: 'L10.4-011', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda cu ce afișează despre SELinux.',
    explanation: 'Fiecare comandă citește altă parte a stării.',
    leftLabel: 'Comandă', rightLabel: 'Afișează',
    pairs: [
      { left: '`ls -Z FIȘIER`', right: 'contextul fișierului', why: 'Coloana de context.' },
      { left: '`ps -eZ`', right: 'contextul proceselor', why: 'Coloana LABEL.' },
      { left: '`id -Z`', right: 'contextul sesiunii tale', why: 'Procesul curent.' },
      { left: '`matchpathcon CALE`', right: 'contextul IMPLICIT al căii din politică', why: 'Din regulile file contexts.' },
    ],
    distractors: [{ text: 'modul enforcing/permissive', why: 'Aceasta este treaba lui getenforce/sestatus.' }],
  },
  {
    id: 'L10.4-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce fel de obiect este descris de `tclass=file`, `scontext=…httpd_t…`, `tcontext=…user_home_t…` într-un AVC?',
    explanation: 'Procesul httpd_t încearcă să acceseze un fișier etichetat user_home_t.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'AVC', code: 'avc:  denied  { read } for  comm="httpd" name="index.html" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0' },
    options: [
      { id: 'a', text: 'Apache (`httpd_t`) a fost blocat la citirea unui fișier cu etichetă de home (`user_home_t`).', correct: true, why: 'scontext = procesul, tcontext = ținta, permissive=0 = blocat.' },
      { id: 'b', text: 'Un utilizator a scris în /etc.', correct: false, why: 'Acțiunea este read, iar sursa este httpd_t.' },
      { id: 'c', text: 'Apache a fost permis, doar înregistrat.', correct: false, why: 'permissive=0 înseamnă blocat.' },
      { id: 'd', text: 'Un port nu este etichetat.', correct: false, why: 'tclass=file, nu tcp_socket.' },
    ],
  },
];
