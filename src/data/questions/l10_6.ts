import type { Question } from '../../lib/types';

const T = 'L10.6';
const O = ['C10-7'];

export const Q_L10_6: Question[] = [
  {
    id: 'L10.6-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Apache a fost configurat cu `Listen 8085` și nu mai pornește („Permission denied” la bind). Firewall-ul este deschis. Care este cauza cea mai probabilă?',
    explanation: 'Un serviciu confinat poate asculta doar pe porturi cu tipuri permise de politică.',
    options: [
      { id: 'a', text: 'Portul 8085 nu are un tip de port permis lui `httpd_t` (SELinux).', correct: true, why: 'name_bind pe unreserved_port_t este refuzat serviciilor web.' },
      { id: 'b', text: 'Firewall-ul blochează portul.', correct: false, why: 'Firewall-ul ar bloca conexiunile, nu bind-ul local.' },
      { id: 'c', text: 'Apache nu poate folosi porturi peste 1024.', correct: false, why: 'Poate; problema este eticheta SELinux.' },
      { id: 'd', text: 'Lipsește `restorecon`.', correct: false, why: 'restorecon se aplică fișierelor, nu porturilor.' },
    ],
  },
  {
    id: 'L10.6-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Listează toate definițiile de porturi SELinux.',
    prompt: '[root@server1 ~]#',
    answers: ['semanage port -l', 'semanage port --list'],
    canonical: 'semanage port -l',
    explanation: '-l listează definițiile port → tip.',
    wrong: [
      { text: 'semanage port -a', why: '-a adaugă și cere argumente (tip, protocol, port).' },
      { text: 'semanage fcontext -l', why: 'Listează regulile de fișiere, nu cele de porturi.' },
      { text: 'ss -tlnp', why: 'Arată procesele care ascultă, nu etichetele SELinux.' },
    ],
  },
  {
    id: 'L10.6-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Permite serviciilor web (tipul `http_port_t`) să asculte pe portul TCP 8085.',
    prompt: '[root@server1 ~]#',
    answers: ['semanage port -a -t http_port_t -p tcp 8085', 'semanage port -a -p tcp -t http_port_t 8085'],
    canonical: 'semanage port -a -t http_port_t -p tcp 8085',
    explanation: '-a add, -t tip, -p protocol, apoi portul.',
    wrong: [
      { text: 'semanage port -a -t http_port_t 8085', why: 'Lipsește protocolul (-p tcp), obligatoriu.' },
      { text: 'semanage port -m -t http_port_t -p tcp 8085', why: '-m modifică o regulă existentă; pentru un port nou se folosește -a.' },
      { text: 'firewall-cmd --add-port=8085/tcp', why: 'Deschide firewall-ul, dar nu schimbă eticheta SELinux.' },
    ],
  },
  {
    id: 'L10.6-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează doar personalizările locale ale etichetelor de porturi.',
    prompt: '[root@server1 ~]#',
    answers: ['semanage port -l -C', 'semanage port -lC', 'semanage port -C -l', 'semanage port --list --locallist'],
    canonical: 'semanage port -l -C',
    explanation: '-C = locallist: doar ce a adăugat administratorul.',
    wrong: [
      { text: 'semanage port -l', why: 'Listează toate definițiile, nu doar cele locale.' },
      { text: 'semanage port -D', why: '-D șterge toate personalizările locale; nu le listează.' },
      { text: 'semanage port -C', why: 'Fără -l nu listează nimic.' },
    ],
  },
  {
    id: 'L10.6-005', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Ce ai nevoie, în plus față de eticheta de port, ca Apache pe 8085 să fie accesibil din rețea și după reboot?',
    explanation: 'Patru straturi: configurația serviciului, SELinux, firewall, serviciul activ la boot.',
    options: [
      { id: 'a', text: '`Listen 8085` în configurația Apache.', correct: true, why: 'Serviciul trebuie să fie configurat pe port.' },
      { id: 'b', text: '`firewall-cmd --permanent --add-port=8085/tcp` și `--reload`.', correct: true, why: 'Altfel conexiunile din rețea sunt blocate sau regula dispare la reboot.' },
      { id: 'c', text: '`systemctl enable httpd`.', correct: true, why: 'Pentru pornire la boot.' },
      { id: 'd', text: '`setenforce 0`.', correct: false, why: 'Dezactivează protecția; nu este necesar și nu persistă.' },
    ],
  },
  {
    id: 'L10.6-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce arată acest AVC?',
    explanation: 'httpd_t este blocat la a se atașa pe portul 8085, etichetat unreserved_port_t.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ausearch -m avc', code: 'avc:  denied  { name_bind } for  pid=4012 comm=httpd src=8085 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:unreserved_port_t:s0 tclass=tcp_socket permissive=0' },
    options: [
      { id: 'a', text: 'Apache a fost blocat să asculte pe portul 8085, care are tipul `unreserved_port_t`; trebuie etichetat `http_port_t`.', correct: true, why: 'name_bind + tclass=tcp_socket + src=8085 indică o problemă de port label.' },
      { id: 'b', text: 'Apache nu poate citi un fișier.', correct: false, why: 'tclass este tcp_socket, nu file.' },
      { id: 'c', text: 'SELinux a permis accesul doar în permissive.', correct: false, why: 'permissive=0 înseamnă blocat.' },
      { id: 'd', text: 'Firewall-ul a respins pachetul.', correct: false, why: 'AVC este mesaj SELinux, nu firewalld.' },
    ],
  },
  {
    id: 'L10.6-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Rulezi `semanage port -a -t http_port_t -p tcp 9090` și primești `ValueError: Port tcp/9090 already defined`. Ce faci?',
    explanation: '-a nu suprascrie; pentru un port deja definit se folosește -m (cu atenție la ce serviciu îl folosea).',
    options: [
      { id: 'a', text: 'Folosești `-m` pentru a modifica tipul, sau alegi alt port, după ce verifici cu `semanage port -l | grep -w 9090`.', correct: true, why: '-m modifică; verifici înainte cine folosește portul.' },
      { id: 'b', text: 'Rulezi aceeași comandă cu `sudo` din nou.', correct: false, why: 'Eroarea nu este de drepturi.' },
      { id: 'c', text: 'Dezactivezi SELinux.', correct: false, why: 'Nu rezolvă cauza.' },
      { id: 'd', text: 'Repornești calculatorul.', correct: false, why: 'Politica nu se schimbă la reboot.' },
    ],
  },
  {
    id: 'L10.6-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Care combinație pentru sshd pe portul 2222 este corectă și completă (SELinux + firewall, persistentă)?',
    explanation: 'sshd_config, port label ssh_port_t, firewall permanent și reload sshd.',
    options: [
      { id: 'a', text: '`Port 2222` în sshd_config, `semanage port -a -t ssh_port_t -p tcp 2222`, `firewall-cmd --permanent --add-port=2222/tcp`, `--reload`, `systemctl reload sshd`.', correct: true, why: 'Acoperă configurația, SELinux, firewall și aplicarea.' },
      { id: 'b', text: 'Doar `Port 2222` și `systemctl restart sshd`.', correct: false, why: 'SELinux blochează bind-ul și firewall-ul nu e deschis.' },
      { id: 'c', text: '`semanage port -a -t http_port_t -p tcp 2222`.', correct: false, why: 'Tipul trebuie să fie permis domeniului sshd_t: ssh_port_t.' },
      { id: 'd', text: '`setenforce 0` și gata.', correct: false, why: 'Nu persistă și nu rezolvă firewall-ul.' },
    ],
  },
  {
    id: 'L10.6-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru „Apache pe portul 8085, SELinux enforcing, persistent”.',
    explanation: 'Configurezi, observi eșecul, etichetezi portul, firewall, activezi, testezi.',
    items: [
      { text: 'Pui `Listen 8085` în `/etc/httpd/conf/httpd.conf`', why: 'Serviciul trebuie să asculte pe port.' },
      { text: '`semanage port -a -t http_port_t -p tcp 8085`', why: 'Permiți lui httpd_t să se atașeze pe port.' },
      { text: '`systemctl enable --now httpd` (sau `restart`)', why: 'Pornești serviciul și îl activezi la boot.' },
      { text: '`firewall-cmd --permanent --add-port=8085/tcp` + `--reload`', why: 'Accesibil din rețea și după reboot.' },
      { text: '`ss -tlnp | grep 8085` și `curl -sI http://localhost:8085`', why: 'Verificarea funcțională.' },
    ],
  },
  {
    id: 'L10.6-010', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește simptomul cu stratul vinovat.',
    explanation: 'Fiecare strat dă un simptom diferit.',
    leftLabel: 'Simptom', rightLabel: 'Strat',
    pairs: [
      { left: '„(13)Permission denied … could not bind”', right: 'SELinux: port neetichetat', why: 'EACCES la bind.' },
      { left: '„(98)Address already in use”', right: 'alt proces folosește portul', why: 'ss -tlnp arată cine.' },
      { left: 'serverul ascultă, dar nu răspunde din rețea', right: 'firewall', why: 'Portul nu este deschis în zonă.' },
      { left: 'Syntax error în httpd.conf', right: 'configurația serviciului', why: 'httpd -t o arată.' },
    ],
    distractors: [{ text: 'eticheta de fișier greșită', why: 'Aceasta ar apărea ca AVC cu tclass=file, nu ca eroare de bind.' }],
  },
  {
    id: 'L10.6-011', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'După `semanage port -a …`, trebuie să rulezi `restorecon` ca să se aplice regula?',
    explanation: 'Regulile de port au efect imediat și persistă; restorecon este pentru fișiere.',
    options: [
      { id: 'a', text: 'Nu: regula de port are efect imediat și este persistentă; poate fi nevoie doar de repornirea serviciului.', correct: true, why: 'restorecon aplică etichete de fișiere, nu de porturi.' },
      { id: 'b', text: 'Da, `restorecon -R /` obligatoriu.', correct: false, why: 'Nu are legătură cu porturile.' },
      { id: 'c', text: 'Da, plus reboot.', correct: false, why: 'Nu este necesar reboot.' },
      { id: 'd', text: 'Nu, dar regula dispare la reboot.', correct: false, why: 'Regula persistă.' },
    ],
  },
  {
    id: 'L10.6-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce este greșit în comanda de mai jos, dacă scopul este ca serverul web să asculte pe UDP 8085?',
    explanation: 'Protocolul trebuie să fie udp pentru UDP.',
    snippet: { kind: 'find-error', title: 'comandă', code: 'semanage port -a -t http_port_t -p tcp 8085' },
    options: [
      { id: 'a', text: 'Protocolul este `tcp`; pentru UDP trebuie `-p udp` (fiecare protocol are regula lui).', correct: true, why: 'Același număr de port poate avea tipuri diferite pentru TCP și UDP.' },
      { id: 'b', text: 'Lipsește `restorecon`.', correct: false, why: 'Nu se aplică porturilor.' },
      { id: 'c', text: 'Tipul trebuie să fie `udp_port_t`.', correct: false, why: 'Nu există un asemenea tip general; se folosește tipul serviciului.' },
      { id: 'd', text: 'Portul trebuie scris cu zero în față.', correct: false, why: 'Numerele de port nu se scriu cu zero în față.' },
    ],
  },
];
