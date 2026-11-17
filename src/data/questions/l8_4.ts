import type { Question } from '../../lib/types';

const T = 'L8.4';
const O = ['C8-4', 'C10-1'];

export const Q_L8_4: Question[] = [
  {
    id: 'L8.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este instrumentul în linie de comandă pentru [[firewalld]]?',
    explanation: '`firewall-cmd` este clientul CLI pentru firewalld.',
    options: [
      { id: 'a', text: '`firewall-cmd`', correct: true, why: 'Gestionează zone, servicii, porturi și reguli ale firewalld.' },
      { id: 'b', text: '`nmcli`', correct: false, why: 'Configurează conexiunile NetworkManager (L8.2).' },
      { id: 'c', text: '`hostnamectl`', correct: false, why: 'Gestionează hostname-ul (L8.3).' },
      { id: 'd', text: '`systemctl`', correct: false, why: 'Gestionează serviciile; poate porni firewalld, dar nu îi configurează regulile.' },
    ],
  },
  {
    id: 'L8.4-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce face `firewall-cmd --add-service=http` (fără alte opțiuni)?',
    explanation: 'Fără `--permanent`, schimbarea afectează doar configurația runtime.',
    options: [
      { id: 'a', text: 'Permite serviciul http imediat, doar în configurația runtime; dispare la reload/reboot.', correct: true, why: 'Documentația firewall-cmd: fără --permanent, doar runtime.' },
      { id: 'b', text: 'Permite http permanent, după reboot.', correct: false, why: 'Pentru persistență este nevoie de --permanent (sau --runtime-to-permanent).' },
      { id: 'c', text: 'Permite http doar după --reload.', correct: false, why: 'Aceasta este caracteristica lui --permanent.' },
      { id: 'd', text: 'Pornește serverul web.', correct: false, why: 'Firewall-ul nu pornește servicii; doar permite traficul.' },
    ],
  },
  {
    id: 'L8.4-003', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează tot ce este configurat în zona implicită (runtime).',
    prompt: '[root@server1 ~]#',
    answers: ['firewall-cmd --list-all', 'sudo firewall-cmd --list-all'],
    canonical: 'firewall-cmd --list-all',
    explanation: '`--list-all` afișează interfețe, surse, servicii, porturi și reguli ale zonei.',
    wrong: [
      { text: 'firewall-cmd --get-services', why: 'Listează serviciile predefinite disponibile, nu ce este activ într-o zonă.' },
      { text: 'firewall-cmd --state', why: 'Arată doar dacă daemonul rulează.' },
      { text: 'firewall-cmd --reload', why: 'Reîncarcă configurația; nu afișează nimic util.' },
    ],
  },
  {
    id: 'L8.4-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cerința: „permite serviciul https, astfel încât să rămână după reboot”. Care secvență este corectă și completă?',
    explanation: '`--permanent` salvează; `--reload` activează acum.',
    options: [
      { id: 'a', text: '`firewall-cmd --permanent --add-service=https` apoi `firewall-cmd --reload`', correct: true, why: 'Salvează regula și o face activă imediat.' },
      { id: 'b', text: '`firewall-cmd --add-service=https`', correct: false, why: 'Doar runtime: dispare după reload/reboot.' },
      { id: 'c', text: '`firewall-cmd --permanent --add-service=https`', correct: false, why: 'Salvează, dar regula nu este activă până la --reload.' },
      { id: 'd', text: '`systemctl enable https`', correct: false, why: 'Nu există o astfel de unitate; firewall-ul nu se configurează cu systemctl.' },
    ],
  },
  {
    id: 'L8.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată cele trei comenzi de mai jos despre `http`?',
    explanation: 'http este doar în runtime: după reload dispare.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'runtime vs permanent', code: '$ firewall-cmd --list-services\ndhcpv6-client http ssh\n$ firewall-cmd --permanent --list-services\ndhcpv6-client ssh' },
    options: [
      { id: 'a', text: 'http a fost adăugat doar în runtime; după --reload sau reboot va dispărea.', correct: true, why: 'Nu apare în configurația permanentă.' },
      { id: 'b', text: 'http este permanent și activ.', correct: false, why: 'Lipsește din lista permanentă.' },
      { id: 'c', text: 'http este permanent, dar inactiv.', correct: false, why: 'Aceasta ar fi invers: permanent fără runtime.' },
      { id: 'd', text: 'firewalld nu rulează.', correct: false, why: 'Comenzile au răspuns normal.' },
    ],
  },
  {
    id: 'L8.4-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care este formatul corect pentru deschiderea portului TCP 8080?',
    explanation: 'Formatul este `PORT[-PORT]/PROTOCOL`.',
    options: [
      { id: 'a', text: '`--add-port=8080/tcp`', correct: true, why: 'Port și protocol separate prin slash.' },
      { id: 'b', text: '`--add-port=8080`', correct: false, why: 'Lipsește protocolul (tcp/udp).' },
      { id: 'c', text: '`--add-port=tcp:8080`', correct: false, why: 'Ordinea este port/protocol, nu protocol:port.' },
      { id: 'd', text: '`--add-service=8080`', correct: false, why: '--add-service primește nume de servicii, nu numere.' },
    ],
  },
  {
    id: 'L8.4-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre acestea fac ca o regulă să fie și imediat activă, și persistentă?',
    explanation: 'Trei metode echivalente: de două ori, permanent+reload, runtime+runtime-to-permanent.',
    options: [
      { id: 'a', text: '`--add-service=http` apoi `--permanent --add-service=http`', correct: true, why: 'Aceeași comandă fără și cu --permanent.' },
      { id: 'b', text: '`--permanent --add-service=http` apoi `--reload`', correct: true, why: 'Salvează, apoi activează configurația salvată.' },
      { id: 'c', text: '`--add-service=http` apoi `--runtime-to-permanent`', correct: true, why: 'Activează acum, apoi salvează runtime-ul peste permanent.' },
      { id: 'd', text: '`--add-service=http --timeout=300`', correct: false, why: 'Regula este temporară (expiră după 300 s) și nu se combină cu --permanent.' },
    ],
  },
  {
    id: 'L8.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai rulat `firewall-cmd --permanent --add-port=8080/tcp` și ai uitat `--reload`. Ce vezi?',
    explanation: 'Regula este salvată, dar runtime-ul nu o conține încă.',
    options: [
      { id: 'a', text: 'Portul apare în `--permanent --list-ports`, dar nu în `--list-ports` (runtime) până la `--reload`.', correct: true, why: 'Permanent nu este efectiv imediat.' },
      { id: 'b', text: 'Portul este deschis imediat.', correct: false, why: 'Doar comenzile fără --permanent au efect imediat.' },
      { id: 'c', text: 'Comanda eșuează.', correct: false, why: 'Comanda este validă; răspunde success.' },
      { id: 'd', text: 'firewalld repornește automat.', correct: false, why: 'Nu repornește; este nevoie de --reload.' },
    ],
  },
  {
    id: 'L8.4-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un coleg a rulat comenzile de mai jos pentru „SSH doar din 192.0.2.0/24”, dar SSH tot merge de oriunde. Care este cea mai probabilă cauză?',
    explanation: 'Serviciul ssh este încă permis în zona implicită (public), accesibilă tuturor.',
    snippet: { kind: 'find-error', title: 'comenzile colegului', code: 'firewall-cmd --permanent --zone=internal --add-source=192.0.2.0/24\nfirewall-cmd --permanent --zone=internal --add-service=ssh\nfirewall-cmd --reload\n# firewall-cmd --list-services  (zona public) ->  dhcpv6-client ssh' },
    options: [
      { id: 'a', text: 'ssh este încă permis în zona public (implicită), deci rămâne deschis pentru toți; trebuie scos de acolo.', correct: true, why: 'Restricția reală cere eliminarea serviciului din zona permisivă (--zone=public --remove-service=ssh), nu doar adăugarea în internal.' },
      { id: 'b', text: 'Sursa nu poate fi legată de zona internal.', correct: false, why: 'Se poate; zona internal acceptă surse.' },
      { id: 'c', text: 'Lipsește --permanent.', correct: false, why: '--permanent este prezent.' },
      { id: 'd', text: 'internal nu permite ssh.', correct: false, why: 'Tocmai a fost adăugat.' },
    ],
  },
  {
    id: 'L8.4-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a publica un serviciu web pe portul 8080/tcp, persistent.',
    explanation: 'Serviciul ascultă, firewall-ul permite, verifici ambele configurații.',
    items: [
      { text: 'confirmi că firewalld rulează: `firewall-cmd --state`', why: 'Fără daemon nu poți modifica regulile.' },
      { text: 'confirmi că serviciul ascultă pe 8080: `ss -tlnp | grep 8080`', why: 'Un port deschis ajută doar dacă ascultă un proces.' },
      { text: '`firewall-cmd --permanent --add-port=8080/tcp`', why: 'Salvezi regula.' },
      { text: '`firewall-cmd --reload`', why: 'O activezi imediat.' },
      { text: 'verifici: `firewall-cmd --list-ports` și `firewall-cmd --permanent --list-ports`, apoi un test din alt sistem', why: 'Confirmi runtime, permanent și accesul real.' },
    ],
  },
  {
    id: 'L8.4-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ce zonă folosești pentru a arunca silențios tot traficul de la o adresă suspectă?',
    explanation: 'Zona drop aruncă pachetele fără răspuns; block le respinge cu mesaj.',
    options: [
      { id: 'a', text: '`drop`, cu `--zone=drop --add-source=ADRESĂ`', correct: true, why: 'Pachetele de la acea sursă sunt aruncate fără niciun răspuns.' },
      { id: 'b', text: '`trusted`', correct: false, why: 'Acceptă toate conexiunile: opusul dorit.' },
      { id: 'c', text: '`home`', correct: false, why: 'Zonă de încredere pentru calculatoare de acasă.' },
      { id: 'd', text: '`dmz`', correct: false, why: 'Pentru servere accesibile public cu acces limitat la rețeaua internă.' },
    ],
  },
  {
    id: 'L8.4-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește comanda cu efectul ei.',
    explanation: 'Fiecare comandă acționează pe o parte diferită a configurației.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`firewall-cmd --reload`', right: 'configurația permanentă devine runtime; modificările runtime nesalvate se pierd', why: 'Păstrează conexiunile active, dar pierde ce nu era salvat.' },
      { left: '`firewall-cmd --runtime-to-permanent`', right: 'salvează configurația runtime curentă peste cea permanentă', why: 'Salvează tot ce este activ acum.' },
      { left: '`firewall-cmd --get-active-zones`', right: 'zonele care au interfețe sau surse legate', why: 'Arată zonele aplicate efectiv traficului.' },
      { left: '`firewall-cmd --check-config`', right: 'validează fișierele de configurare permanente', why: 'Verifică XML-ul și semantica.' },
    ],
    distractors: [{ text: 'schimbă adresa IP a interfeței', why: 'Adresele se gestionează cu nmcli (L8.2).' }],
  },
];
