import type { Question } from '../../lib/types';

const T = 'L10.1';
const O = ['C10-2'];

export const Q_L10_1: Question[] = [
  {
    id: 'L10.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Cu `umask 022`, ce drepturi are un FIȘIER obișnuit nou creat cu `touch`?',
    explanation: 'Fișierele pornesc de la 666; umask 022 șterge w pentru grup și others → 644.',
    options: [
      { id: 'a', text: '`644` (`rw-r--r--`)', correct: true, why: '666 AND NOT 022 = 644: proprietarul citește/scrie, ceilalți doar citesc.' },
      { id: 'b', text: '`755` (`rwxr-xr-x`)', correct: false, why: '755 este valoarea unui DIRECTOR nou cu umask 022; fișierele nu primesc x la creare.' },
      { id: 'c', text: '`022` (`-----w--w-`)', correct: false, why: 'umask nu este modul fișierului, ci masca din care se scot drepturi.' },
      { id: 'd', text: '`666` (`rw-rw-rw-`)', correct: false, why: '666 ar apărea doar cu umask 000.' },
    ],
  },
  {
    id: 'L10.1-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Cu aceeași mască `022`, ce drepturi are un DIRECTOR nou creat cu `mkdir`?',
    explanation: 'Directoarele pornesc de la 777 și au nevoie de x.',
    options: [
      { id: 'a', text: '`755` (`rwxr-xr-x`)', correct: true, why: '777 AND NOT 022 = 755.' },
      { id: 'b', text: '`644` (`rw-r--r--`)', correct: false, why: 'Un director fără x nu poate fi traversat; 644 este valoarea fișierelor.' },
      { id: 'c', text: '`700` (`rwx------`)', correct: false, why: '700 rezultă din umask 077.' },
      { id: 'd', text: '`777` (`rwxrwxrwx`)', correct: false, why: 'Masca 022 scoate w pentru grup și others.' },
    ],
  },
  {
    id: 'L10.1-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei ca fișierele noi să aibă `640` și directoarele noi `750`. Ce mască setezi?',
    explanation: 'Masca = drepturile de șters: de la 666→640 se scot g:w (2) și o:rwx (7).',
    options: [
      { id: 'a', text: '`027`', correct: true, why: '666 AND NOT 027 = 640 și 777 AND NOT 027 = 750.' },
      { id: 'b', text: '`640`', correct: false, why: 'Aceasta ar fi modul dorit, nu masca; umask 640 ar șterge drepturi greșite.' },
      { id: 'c', text: '`750`', correct: false, why: 'Confunzi modul rezultat cu masca; umask 750 ar scoate drepturi proprietarului.' },
      { id: 'd', text: '`037`', correct: false, why: 'Ar șterge și w și x pentru grup: fișiere 640 dar directoare 740 (grupul nu mai poate intra).' },
    ],
  },
  {
    id: 'L10.1-004', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează masca curentă a shell-ului, în formă octală.',
    prompt: '[student@server1 ~]$',
    answers: ['umask'],
    canonical: 'umask',
    explanation: 'Fără argumente, umask afișează masca curentă (octal). umask este o comandă internă a shell-ului.',
    wrong: [
      { text: 'umask -S', why: '-S afișează forma simbolică (drepturile permise), nu cea octală.' },
      { text: 'show umask', why: 'Nu există o astfel de comandă.' },
      { text: 'cat /etc/umask', why: 'Nu există un fișier /etc/umask; masca este o proprietate a procesului.' },
    ],
  },
  {
    id: 'L10.1-005', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Setează, pentru sesiunea curentă, o mască astfel încât fișierele noi să fie private (`600`) și directoarele noi `700`.',
    prompt: '[student@server1 ~]$',
    answers: ['umask 077', 'umask 0077'],
    canonical: 'umask 077',
    explanation: '077 șterge toate drepturile pentru grup și others.',
    wrong: [
      { text: 'umask 600', why: 'Aceasta este valoarea modului dorit, nu masca; ar șterge drepturile proprietarului.' },
      { text: 'umask 022', why: '022 lasă citire pentru grup și others (644/755).' },
      { text: 'chmod 600 *', why: 'chmod modifică fișierele existente; nu setează masca pentru cele noi.' },
    ],
  },
  {
    id: 'L10.1-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmații despre `umask` sunt corecte?',
    explanation: 'Masca este o proprietate a procesului, moștenită de copii; scoate drepturi și afectează doar creările noi.',
    options: [
      { id: 'a', text: 'Se moștenește de procesele copil ale shell-ului în care a fost setată.', correct: true, why: 'Este un atribut al procesului, copiat la fork.' },
      { id: 'b', text: 'Nu modifică drepturile fișierelor deja existente.', correct: true, why: 'Se aplică doar la creare; pentru cele vechi folosești chmod.' },
      { id: 'c', text: 'Un fișier obișnuit nou nu primește bitul x, oricare ar fi masca.', correct: true, why: 'Fișierele pornesc de la 666, fără x.' },
      { id: 'd', text: 'Un `umask 077` tastat într-un terminal se aplică automat tuturor terminalelor deschise.', correct: false, why: 'Afectează doar acel shell și copiii lui.' },
    ],
  },
  {
    id: 'L10.1-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Utilizatorul `alice` vrea `umask 027` la FIECARE shell bash interactiv nou, doar pentru ea. Unde scrii linia?',
    explanation: 'Fișierul personal de inițializare al shell-ului: ~/.bashrc (sau ~/.bash_profile).',
    options: [
      { id: 'a', text: 'În `~/.bashrc` al lui alice.', correct: true, why: 'Este citit la fiecare shell interactiv nou al ei; modificarea nu atinge alți utilizatori.' },
      { id: 'b', text: 'În `/etc/hosts`.', correct: false, why: '/etc/hosts mapează nume la adrese IP; nu are legătură cu umask.' },
      { id: 'c', text: 'În `/etc/fstab`.', correct: false, why: 'fstab descrie montările; nu conține setări de shell.' },
      { id: 'd', text: 'Rulezi doar `umask 027` o dată în terminal.', correct: false, why: 'Valoarea dispare la logout.' },
    ],
  },
  {
    id: 'L10.1-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Un serviciu systemd creează fișiere cu `644`, deși tu ai `umask 027` în `~/.bashrc`. De ce, și cum remediezi?',
    explanation: 'Serviciile au masca lor (UMask=, implicit 0022); ~/.bashrc nu este citit de ele.',
    options: [
      { id: 'a', text: 'Serviciul nu citește ~/.bashrc; adaugi `UMask=0027` în secțiunea `[Service]` (drop-in), apoi `daemon-reload` și restart.', correct: true, why: 'systemd.exec: UMask= setează masca proceselor unității; implicit 0022 pentru unitățile de sistem.' },
      { id: 'b', text: 'Repornești calculatorul și umask-ul se aplică automat serviciilor.', correct: false, why: 'Masca din shell nu se propagă la servicii.' },
      { id: 'c', text: 'Rulezi `chmod 027` pe fișierul unității.', correct: false, why: 'Drepturile fișierului unității nu influențează fișierele create de proces.' },
      { id: 'd', text: 'Dezactivezi SELinux.', correct: false, why: 'SELinux nu stabilește biții rwx impliciți ai fișierelor noi.' },
    ],
  },
  {
    id: 'L10.1-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată `umask -S` dacă masca octală este `027`?',
    explanation: '-S afișează drepturile PERMISE (cele rămase), nu pe cele șterse.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '$ umask\n0027\n$ umask -S\n?' },
    options: [
      { id: 'a', text: '`u=rwx,g=rx,o=`', correct: true, why: 'u: nimic șters; g: w șters, rămâne rx; o: totul șters.' },
      { id: 'b', text: '`u=,g=w,o=rwx`', correct: false, why: 'Aceasta ar fi lista drepturilor șterse; -S o inversează.' },
      { id: 'c', text: '`u=rw,g=r,o=`', correct: false, why: 'Aceasta ar corespunde fișierelor (640), dar umask -S nu ține cont de bitul x pe fișiere.' },
      { id: 'd', text: '`u=rwx,g=rwx,o=rwx`', correct: false, why: 'Aceasta este masca 000.' },
    ],
  },
  {
    id: 'L10.1-010', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Utilizatorul `alice` setează `umask 077` în `/etc/profile.d/umask.sh`-ul lui, dar în `~/.bashrc` aflat mai târziu în lanț pune `umask 022`. Ce valoare are shell-ul ei?',
    explanation: 'Ultimul apel umask câștigă: fiecare suprascrie precedentul.',
    snippet: { kind: 'find-error', title: 'ordinea de citire', code: '/etc/profile.d/umask.sh   -> umask 077\n~/.bashrc                 -> umask 022   (citit mai târziu)' },
    options: [
      { id: 'a', text: '`022` — ultimul apel `umask` din lanț câștigă.', correct: true, why: 'Masca este o valoare a procesului; fiecare linie o înlocuiește.' },
      { id: 'b', text: '`077` — cea globală are prioritate.', correct: false, why: 'Nu există prioritate de „global”; contează ordinea execuției.' },
      { id: 'c', text: '`055` — se combină.', correct: false, why: 'Valorile nu se combină.' },
      { id: 'd', text: 'Shell-ul refuză să pornească.', correct: false, why: 'Două apeluri umask nu intră în conflict.' },
    ],
  },
  {
    id: 'L10.1-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru: „fișierele create de alice să fie 640, persistent, pentru orice shell nou”.',
    explanation: 'Calculezi, setezi persistent, testezi într-un shell nou.',
    items: [
      { text: 'Calculezi masca: 666→640 scoate g:w și o:rwx → `027`', why: 'Masca se deduce din drepturile dorite.' },
      { text: 'Adaugi `umask 027` în `~/.bashrc` al lui alice', why: 'Persistență la nivel de utilizator.' },
      { text: 'Deschizi un shell NOU ca alice (`su - alice`)', why: 'Shell-urile deja deschise nu citesc din nou fișierul.' },
      { text: 'Rulezi `umask`, apoi `touch` și `mkdir`', why: 'Verifici masca și efectul real.' },
      { text: 'Confirmi cu `stat -c "%a %n"`: 640 și 750', why: 'Ai demonstrat și fișierul, și directorul.' },
    ],
  },
  {
    id: 'L10.1-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește masca cu drepturile pe care le primesc fișierele noi (fișier / director).',
    explanation: 'Calculează 666 AND NOT mască, respectiv 777 AND NOT mască.',
    leftLabel: 'umask', rightLabel: 'Fișier / director',
    pairs: [
      { left: '`022`', right: '644 / 755', why: 'Șterge w pentru grup și others.' },
      { left: '`002`', right: '664 / 775', why: 'Șterge doar w pentru others.' },
      { left: '`077`', right: '600 / 700', why: 'Șterge tot pentru grup și others.' },
      { left: '`007`', right: '660 / 770', why: 'Șterge tot pentru others.' },
    ],
    distractors: [{ text: '777 / 777', why: 'Corespunde măștii 000, nu uneia din listă.' }],
  },
  {
    id: 'L10.1-013', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Echipa `devs` lucrează în `/srv/echipa` (grup `devs`, mod `2770`). Fișierele create de alice au `644`, deci bob nu le poate edita. Ce lipsește?',
    explanation: 'Setgid dă grupul corect; pentru ca grupul să poată scrie, masca creatorului trebuie să lase w pentru grup (002).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ls -l', code: 'drwxrws---. 2 root devs 6 Nov 17 15:10 /srv/echipa\n-rw-r--r--. 1 alice devs 0 Nov 17 15:11 /srv/echipa/a.txt' },
    options: [
      { id: 'a', text: 'Un `umask 002` pentru membri (grupul primește w); setgid este deja activ (`s`).', correct: true, why: 'Grupul fișierului este deja devs datorită lui s; lipsește doar w pentru grup.' },
      { id: 'b', text: 'Bitul setgid; directorul nu îl are.', correct: false, why: 'Îl are: litera s în poziția x a grupului.' },
      { id: 'c', text: 'Să dai lui bob parola lui alice.', correct: false, why: 'Partajarea parolelor este o practică greșită și nu rezolvă problema.' },
      { id: 'd', text: 'Să schimbi mereu proprietarul în root.', correct: false, why: 'Nu este nevoie; drepturile grupului sunt suficiente.' },
    ],
  },
];
