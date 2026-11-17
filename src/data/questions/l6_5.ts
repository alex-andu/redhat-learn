import type { Question } from '../../lib/types';

const T = 'L6.5';
const O = ['C6-5'];

export const Q_L6_5: Question[] = [
  {
    id: 'L6.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce comandă arată permisiunile unui DIRECTOR (nu ale conținutului lui)?',
    explanation: '`ls -d` listează directorul însuși.',
    options: [
      { id: 'a', text: '`ls -ld /srv/proiect`', correct: true, why: '-d listează intrarea directorului, -l în format lung.' },
      { id: 'b', text: '`ls -l /srv/proiect`', correct: false, why: 'Arată conținutul directorului, nu directorul însuși.' },
      { id: 'c', text: '`ls -a /srv/proiect`', correct: false, why: '-a arată și fișierele ascunse; nu afișează permisiuni.' },
      { id: 'd', text: '`cd /srv/proiect`', correct: false, why: 'cd schimbă directorul curent; nu afișează permisiuni.' },
    ],
  },
  {
    id: 'L6.5-002', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Utilizatorul `ana` primește `Permission denied` la `cat /srv/proiect/raport.txt`, deși fișierul este `-rw-r--r--`. Ce arată outputul?',
    explanation: 'Accesul cere `x` pe fiecare director din cale; [[namei]] le arată pe toate.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'namei -l', code: '[ana@server1 ~]$ namei -l /srv/proiect/raport.txt\nf: /srv/proiect/raport.txt\ndrwxr-xr-x root   root   /\ndrwxr-xr-x root   root   srv\ndrwx------ bogdan bogdan proiect\n-rw-r--r-- bogdan bogdan raport.txt' },
    options: [
      { id: 'a', text: 'Directorul `proiect` (`drwx------`) nu are `x` pentru „alții”, deci ana nu poate traversa calea.', correct: true, why: 'ana nu este bogdan și, fără grup comun, intră în clasa „alții” (---).' },
      { id: 'b', text: 'Fișierul `raport.txt` nu are permisiunea de citire pentru alții.', correct: false, why: 'Fișierul este rw-r--r--: alții pot citi; blocajul este mai sus în cale.' },
      { id: 'c', text: 'Directorul `/srv` este scriibil doar de root, deci ana nu poate citi.', correct: false, why: 'Pentru citire contează x pe /srv (prezent), nu w.' },
      { id: 'd', text: 'ana trebuie să ruleze `chmod 777 raport.txt`.', correct: false, why: 'Nu ar rezolva (blocajul este directorul) și ar fi o soluție exagerată; ana nici nu este proprietarul.' },
    ],
  },
  {
    id: 'L6.5-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează, pentru fiecare componentă a căii `/srv/proiect/raport.txt`, modul, proprietarul și grupul.',
    prompt: '[ana@server1 ~]$',
    answers: ['namei -l /srv/proiect/raport.txt', 'namei -mo /srv/proiect/raport.txt', 'namei -om /srv/proiect/raport.txt', 'namei -m -o /srv/proiect/raport.txt', 'namei -o -m /srv/proiect/raport.txt'],
    canonical: 'namei -l /srv/proiect/raport.txt',
    explanation: '`namei -l` (= `-m -o -v`) listează modul și proprietarul pentru fiecare componentă a căii.',
    wrong: [
      { text: 'ls -l /srv/proiect/raport.txt', why: 'Arată doar fișierul final, nu directoarele din cale.' },
      { text: 'stat /srv/proiect', why: 'Arată informații despre un singur element, nu despre întreaga cale.' },
      { text: 'namei /srv/proiect/raport.txt', why: 'Fără -l (sau -m/-o) afișează doar tipurile, nu permisiunile și proprietarii.' },
    ],
  },
  {
    id: 'L6.5-004', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Pentru a șterge fișierul `/srv/dev/vechi.txt` într-un director fără sticky bit, ce permisiuni sunt NECESARE?',
    explanation: 'Ștergerea modifică directorul, deci contează permisiunile directorului.',
    options: [
      { id: 'a', text: '`w` pe directorul `/srv/dev`', correct: true, why: 'Ștergerea modifică lista de intrări a directorului.' },
      { id: 'b', text: '`x` pe directorul `/srv/dev`', correct: true, why: 'Fără x nu poți accesa intrările directorului.' },
      { id: 'c', text: '`w` pe fișierul `vechi.txt`', correct: false, why: 'Permisiunile fișierului nu decid ștergerea; contează cele ale directorului (cu excepția sticky bit).' },
      { id: 'd', text: '`r` pe fișier', correct: false, why: 'Citirea conținutului nu este necesară pentru ștergere.' },
    ],
  },
  {
    id: 'L6.5-005', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Fă ca fișierele noi create în `/srv/dev` să primească grupul directorului (activează setgid pe director, fără a atinge alte permisiuni).',
    prompt: '[root@server1 ~]#',
    answers: ['chmod g+s /srv/dev', 'sudo chmod g+s /srv/dev', 'chmod +s /srv/dev'],
    canonical: 'chmod g+s /srv/dev',
    explanation: 'Bitul setgid pe un [[setgid-dir]] face ca elementele noi să moștenească grupul directorului.',
    wrong: [
      { text: 'chmod +t /srv/dev', why: '+t setează sticky bit, nu setgid.' },
      { text: 'chmod u+s /srv/dev', why: 'u+s este setuid; pe un director nu face ce se cere.' },
      { text: 'chgrp +s /srv/dev', why: 'chgrp schimbă grupul; nu setează biți speciali.' },
    ],
  },
  {
    id: 'L6.5-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce reprezintă `drwxrwsr-x` în `ls -ld`?',
    explanation: '`s` în poziția execuției grupului = setgid activ (cu x).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'ls -ld', code: '[root@server1 ~]# ls -ld /srv/dev\ndrwxrwsr-x. 2 root dev 6 Nov 16 10:00 /srv/dev' },
    options: [
      { id: 'a', text: 'Director cu setgid (octal 2775), grupul `dev`; fișierele noi rămân în grupul `dev`.', correct: true, why: 's în clasa grup înseamnă setgid; 775 = rwxrwxr-x; punctul final indică contextul SELinux.' },
      { id: 'b', text: 'Director cu sticky bit.', correct: false, why: 'Sticky apare ca t la finalul modului, nu s la grup.' },
      { id: 'c', text: 'Fișier executabil cu setuid.', correct: false, why: 'Prima literă d înseamnă director; setuid ar fi s în clasa proprietar.' },
      { id: 'd', text: 'Director cu ACL.', correct: false, why: 'ACL-urile se văd printr-un + la final; punctul indică SELinux.' },
    ],
  },
  {
    id: 'L6.5-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Colegul tău a rulat `usermod -aG dev ana` și `ana` zice că tot nu poate scrie în `/srv/dev` (modul 2770, grup `dev`). Ce explicație este cea mai probabilă?',
    explanation: 'Grupurile se stabilesc la autentificare; sesiunile deja deschise nu primesc noul grup.',
    snippet: { kind: 'find-error', title: 'sesiunea lui ana', code: '[ana@server1 ~]$ id\nuid=1001(ana) gid=1001(ana) groups=1001(ana)\n[ana@server1 ~]$ touch /srv/dev/a.txt\ntouch: cannot touch \'/srv/dev/a.txt\': Permission denied' },
    options: [
      { id: 'a', text: 'Sesiunea lui ana nu include încă grupul `dev`; trebuie să se reautentifice (sau `newgrp dev`).', correct: true, why: 'id în acea sesiune nu arată dev; grupurile noi se aplică doar sesiunilor noi.' },
      { id: 'b', text: 'Comanda corectă era `usermod -G dev ana` fără `-a`.', correct: false, why: 'Fără -a ar înlocui grupurile suplimentare; nu rezolvă problema sesiunii.' },
      { id: 'c', text: 'Directorul trebuie să fie 777.', correct: false, why: 'Nu este nevoie: permisiunea de grup este suficientă dacă ana este în dev.' },
      { id: 'd', text: 'Trebuie rulat `chown ana /srv/dev`.', correct: false, why: 'Proprietarul nu este problema; ana lipsește din grupul efectiv al sesiunii.' },
    ],
  },
  {
    id: 'L6.5-008', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Fă directorul `/srv/depozit` comun: toți pot crea fișiere, dar doar proprietarul unui fișier îl poate șterge (mod octal complet).',
    prompt: '[root@server1 ~]#',
    answers: ['chmod 1777 /srv/depozit', 'sudo chmod 1777 /srv/depozit', 'chmod 777 /srv/depozit && chmod +t /srv/depozit', 'chmod a+rwx,+t /srv/depozit'],
    canonical: 'chmod 1777 /srv/depozit',
    explanation: '`1777` = [[sticky-bit]] + rwx pentru toți.',
    wrong: [
      { text: 'chmod 777 /srv/depozit', why: 'Fără sticky bit, oricine poate șterge fișierele altora.' },
      { text: 'chmod 2777 /srv/depozit', why: '2 este setgid, nu sticky; nu împiedică ștergerea fișierelor altora.' },
      { text: 'chmod 4777 /srv/depozit', why: '4 este setuid; nu are efectul cerut pe un director.' },
    ],
  },
  {
    id: 'L6.5-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Un script are `-rw-r--r--` și `./ruleaza.sh` dă `Permission denied`. Care este remedierea minimă, fără a face scriptul scriibil de alții?',
    explanation: 'Fără `x`, scriptul nu poate fi rulat direct.',
    options: [
      { id: 'a', text: '`chmod u+x ruleaza.sh`', correct: true, why: 'Adaugă execuția pentru proprietar, fără a modifica restul permisiunilor.' },
      { id: 'b', text: '`chmod 777 ruleaza.sh`', correct: false, why: 'Funcționează, dar oferă scriere tuturor: soluție exagerată și nesigură.' },
      { id: 'c', text: '`chown root ruleaza.sh`', correct: false, why: 'Schimbă proprietarul; nu adaugă bitul de execuție.' },
      { id: 'd', text: '`chmod -x ruleaza.sh`', correct: false, why: 'Scoate execuția, deci nu o adaugă.' },
    ],
  },
  {
    id: 'L6.5-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii metodei de diagnostic pentru un `Permission denied` raportat de utilizatorul `ana`.',
    explanation: 'De la identitate la cale, apoi reparație minimă și retestare ca utilizator.',
    items: [
      { text: '`id ana` — stabilești cine este și din ce grupuri face parte', why: 'Verificarea de acces folosește această identitate.' },
      { text: '`namei -l CALE` — vezi permisiunile fiecărei componente', why: 'Găsești directorul din cale care blochează.' },
      { text: 'stabilești clasa aplicabilă (proprietar / grup / alții) la componenta problematică', why: 'Se aplică o singură clasă: prima care se potrivește.' },
      { text: 'aplici modificarea minimă (`chmod`, `chgrp`, `chown`, setgid)', why: 'Cel mai mic drept care rezolvă problema.' },
      { text: '`sudo -u ana …` — retestezi ca ana', why: 'Ca root, testul nu dovedește nimic (root ocolește DAC).' },
    ],
  },
  {
    id: 'L6.5-011', topicId: T, objectives: O, difficulty: 3, type: 'multi',
    stem: 'Permisiunile `rwx` sunt corecte, dar accesul este totuși refuzat. Care pot fi cauze?',
    explanation: 'Alte straturi decât DAC pot refuza accesul.',
    options: [
      { id: 'a', text: 'Sistemul de fișiere este montat `ro` sau `noexec`.', correct: true, why: 'ro dă „Read-only file system”; noexec împiedică rularea direct a scripturilor.' },
      { id: 'b', text: 'SELinux refuză accesul (context greșit).', correct: true, why: 'SELinux este un strat separat, independent de rwx.' },
      { id: 'c', text: 'Fișierul are atributul imutabil (`chattr +i`).', correct: true, why: 'Chiar și root primește „Operation not permitted” la modificare.' },
      { id: 'd', text: 'Directorul are exact aceleași permisiuni ca fișierul.', correct: false, why: 'Nu este o cauză de refuz; permisiunile pe fișier și pe director sunt evaluate separat.' },
    ],
  },
  {
    id: 'L6.5-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește simptomul cu cauza cea mai probabilă.',
    explanation: 'Mesajul de eroare indică adesea stratul care refuză.',
    leftLabel: 'Simptom', rightLabel: 'Cauză probabilă',
    pairs: [
      { left: '`Read-only file system`', right: 'sistemul de fișiere este montat `ro`', why: 'Nu este o problemă de rwx; se verifică findmnt.' },
      { left: '`rm: … Operation not permitted` într-un director cu `t`', right: 'sticky bit: fișierul nu este al tău', why: 'Doar proprietarul fișierului/directorului sau root îl poate șterge.' },
      { left: '`cat` refuzat pe un fișier 644 din `/srv/proiect` (`drwx------`)', right: 'lipsește `x` pe un director din cale', why: 'Traversarea cere x pe fiecare director.' },
      { left: 'fișiere noi create în grupul principal, nu în `dev`', right: 'directorul nu are setgid', why: 'chmod g+s DIR le face să moștenească grupul.' },
    ],
    distractors: [{ text: 'fstab conține o linie greșită', why: 'Nu are legătură cu permisiunile unui director deja montat.' }],
  },
];
