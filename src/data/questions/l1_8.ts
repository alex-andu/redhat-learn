import type { Question } from '../../lib/types';

const T = 'L1.8';
const O = ['C1-10'];

export const Q_L1_8: Question[] = [
  {
    id: 'L1.8-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce valoare octală are `rwxr-x---`?',
    explanation: 'Se adună pe clase: rwx = 4+2+1 = 7; r-x = 4+0+1 = 5; --- = 0.',
    options: [
      { id: 'a', text: '750', correct: true, why: 'u = 7, g = 5, o = 0.' },
      { id: 'b', text: '755', correct: false, why: 'Ar însemna că și others au r-x.' },
      { id: 'c', text: '570', correct: false, why: 'Ordinea este u, g, o; aici ar fi r-x pentru proprietar.' },
      { id: 'd', text: '740', correct: false, why: 'Grupul ar avea doar r--, nu r-x.' },
    ],
  },
  {
    id: 'L1.8-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce face `chmod u+x script.sh`?',
    explanation: '`u` = proprietarul, `+` adaugă, `x` = execuție.',
    options: [
      { id: 'a', text: 'Adaugă dreptul de execuție pentru proprietar, fără a schimba celelalte drepturi.', correct: true, why: '`+` adaugă, nu înlocuiește.' },
      { id: 'b', text: 'Stabilește exact `x` pentru proprietar și șterge restul.', correct: false, why: 'Aceasta ar fi forma `u=x`.' },
      { id: 'c', text: 'Adaugă execuția pentru toți utilizatorii.', correct: false, why: 'Pentru toți ar fi `a+x`.' },
      { id: 'd', text: 'Schimbă proprietarul în `x`.', correct: false, why: 'Proprietarul se schimbă cu `chown`.' },
    ],
  },
  {
    id: 'L1.8-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Pentru a șterge fișierul `/data/raport.txt` ca utilizator obișnuit, ce drepturi sunt necesare? (alege toate cele corecte)',
    explanation: 'Ștergerea modifică directorul: contează w și x pe director, nu drepturile pe fișier (în absența biților speciali).',
    options: [
      { id: 'a', text: '`w` pe directorul `/data`', correct: true, why: 'Ștergerea elimină o intrare din director.' },
      { id: 'b', text: '`x` pe directorul `/data`', correct: true, why: 'Fără x nu poți accesa intrările după nume; operațiile de scriere pe intrări îl cer.' },
      { id: 'c', text: '`x` pe `/` (traversare până la `/data`)', correct: true, why: 'Fiecare director din cale trebuie să poată fi traversat.' },
      { id: 'd', text: '`w` pe fișierul `raport.txt`', correct: false, why: 'Nu este necesar pentru ștergere; ar conta la modificarea conținutului.' },
    ],
  },
  {
    id: 'L1.8-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Setează `config.ini` astfel încât proprietarul să poată citi și scrie, grupul doar citi, iar ceilalți să nu aibă niciun drept (mod octal).',
    prompt: '[student@server1 ~]$',
    answers: ['chmod 640 config.ini', 'chmod u=rw,g=r,o= config.ini'],
    canonical: 'chmod 640 config.ini',
    explanation: 'rw- = 6, r-- = 4, --- = 0, deci 640.',
    wrong: [
      { text: 'chmod 604 config.ini', why: '604 dă grupului nimic și celorlalți r--: invers față de cerință.' },
      { text: 'chmod 644 config.ini', why: 'Ar permite și celorlalți să citească.' },
      { text: 'chmod 460 config.ini', why: 'Ordinea u, g, o: aici proprietarul ar avea doar r--.' },
    ],
    hint: 'Calculează cifra pentru fiecare clasă: u, g, o.',
  },
  {
    id: 'L1.8-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a depana „Permission denied” la accesarea unui fișier.',
    explanation: 'Ai de verificat cine ești, ce drepturi are fișierul, ce drepturi au directoarele din cale, apoi corectezi minimal.',
    items: [
      { text: '`id`', why: 'Afli utilizatorul și grupurile tale: ce clasă ți se aplică.' },
      { text: '`ls -l fișier`', why: 'Vezi proprietarul, grupul și drepturile fișierului.' },
      { text: '`namei -l cale/completă`', why: 'Verifici dacă lipsește x pe un director din cale.' },
      { text: '`chmod` / `chown` minimal', why: 'Corectezi doar ce este necesar, fără 777.' },
      { text: 'Retestezi accesul', why: 'Confirmi efectul, nu doar eticheta.' },
    ],
  },
  {
    id: 'L1.8-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește valoarea octală cu permisiunile simbolice.',
    explanation: 'Valori frecvente.',
    leftLabel: 'Octal', rightLabel: 'Simbolic',
    pairs: [
      { left: '`644`', right: 'rw-r--r--', why: '6=rw-, 4=r--, 4=r--.' },
      { left: '`755`', right: 'rwxr-xr-x', why: '7=rwx, 5=r-x, 5=r-x.' },
      { left: '`600`', right: 'rw-------', why: 'doar proprietarul citește/scrie.' },
      { left: '`770`', right: 'rwxrwx---', why: 'proprietar și grup complet, ceilalți nimic.' },
      { left: '`400`', right: 'r--------', why: 'doar proprietarul citește.' },
    ],
    distractors: [{ text: 'rwxrwxrwx', why: 'Aceasta este 777, accesibil tuturor.' }],
  },
  {
    id: 'L1.8-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ai rulat comanda de mai jos pentru a face executabile doar directoarele, dar acum toate fișierele din arbore sunt executabile. De ce?',
    explanation: '`chmod -R 755` aplică exact aceeași valoare fișierelor și directoarelor. Pentru a trata diferit directoarele se folosește `X`.',
    snippet: { kind: 'find-error', title: 'comandă tastată', code: 'chmod -R 755 proiect/' },
    options: [
      { id: 'a', text: '`755` conține x pentru toate clasele și se aplică recursiv fișierelor; trebuia `chmod -R u+rwX,go+rX proiect/`.', correct: true, why: '`X` pune x doar pe directoare (și pe fișiere deja executabile).' },
      { id: 'b', text: '`-R` nu este permis cu mod octal.', correct: false, why: '`-R` funcționează și cu octal.' },
      { id: 'c', text: 'Directorul `proiect/` conține fișiere speciale.', correct: false, why: 'Cauza este valoarea 755 aplicată tuturor.' },
      { id: 'd', text: 'umask 022 adaugă x tuturor fișierelor.', correct: false, why: 'umask scade drepturi la creare; nu afectează chmod.' },
    ],
  },
  {
    id: 'L1.8-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți spune această listare despre accesul utilizatorului `student` (care NU face parte din grupul `dev`) la fișier?',
    explanation: 'Se aplică prima clasă care se potrivește: student nu este proprietarul (`ana`) și nu este în grupul `dev`, deci se aplică `others` (`---`).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ls -l', code: '-rwxr-x---. 1 ana dev 120 Jan  1 10:00 script.sh' },
    options: [
      { id: 'a', text: 'Nu poate citi, scrie sau executa fișierul: i se aplică clasa others (`---`).', correct: true, why: 'Nu este nici `ana`, nici membru al grupului `dev`.' },
      { id: 'b', text: 'Poate citi și executa, ca grup.', correct: false, why: 'Drepturile grupului se aplică doar membrilor grupului `dev`.' },
      { id: 'c', text: 'Poate citi, fiindcă r apare în permisiuni.', correct: false, why: 'r apare doar la proprietar și grup, nu la others.' },
      { id: 'd', text: 'Poate executa, fiindcă fișierul este un script.', correct: false, why: 'Execuția depinde de bitul x pentru clasa aplicabilă; others nu îl are.' },
    ],
  },
  {
    id: 'L1.8-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cu `umask 027`, ce permisiuni au un fișier nou creat cu `touch` și un director nou creat cu `mkdir`?',
    explanation: 'Fișierele pornesc de la 666, directoarele de la 777; din ele se scot biții din umask.',
    options: [
      { id: 'a', text: 'Fișier 640, director 750.', correct: true, why: '666 − 027 = 640; 777 − 027 = 750.' },
      { id: 'b', text: 'Fișier 750, director 750.', correct: false, why: 'Fișierele noi nu primesc x implicit (pornesc de la 666).' },
      { id: 'c', text: 'Fișier 027, director 027.', correct: false, why: 'umask nu este permisiunea; este ce se scoate.' },
      { id: 'd', text: 'Fișier 644, director 755.', correct: false, why: 'Aceasta este rezultatul pentru umask 022.' },
    ],
  },
];
