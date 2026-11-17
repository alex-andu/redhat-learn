import type { Question } from '../../lib/types';

const T = 'L6.3';
const O = ['C6-2'];

export const Q_L6_3: Question[] = [
  {
    id: 'L6.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce reprezintă `server1.example.com:/exports/data` într-o comandă `mount`?',
    explanation: 'Sursa unui montaj [[nfs]] se scrie `server:/cale-exportată`, fără spații.',
    options: [
      { id: 'a', text: 'Numele serverului, urmat de două puncte și de calea exportată de acesta.', correct: true, why: 'Este formatul sursei NFS; calea trebuie să fie exact cea exportată.' },
      { id: 'b', text: 'Un director local numit `server1.example.com:`.', correct: false, why: 'Două puncte separă numele serverului de cale; nu fac parte dintr-un nume de director local.' },
      { id: 'c', text: 'Punctul de montare local.', correct: false, why: 'Punctul de montare este al doilea argument (ex. /mnt/nfs).' },
      { id: 'd', text: 'O adresă URL de tip https.', correct: false, why: 'NFS nu folosește URL-uri HTTP; sursa este server:cale.' },
    ],
  },
  {
    id: 'L6.3-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Montează exportul `/exports/data` de pe `server1.example.com` pe directorul existent `/mnt/nfs`.',
    prompt: '[root@client1 ~]#',
    answers: ['mount -t nfs server1.example.com:/exports/data /mnt/nfs', 'mount server1.example.com:/exports/data /mnt/nfs', 'sudo mount -t nfs server1.example.com:/exports/data /mnt/nfs', 'mount -t nfs4 server1.example.com:/exports/data /mnt/nfs'],
    canonical: 'mount -t nfs server1.example.com:/exports/data /mnt/nfs',
    explanation: 'Sintaxa este `mount -t nfs SERVER:/EXPORT PUNCT_DE_MONTARE`.',
    wrong: [
      { text: 'mount -t nfs server1.example.com /exports/data /mnt/nfs', why: 'Fără două puncte, „server1.example.com” și „/exports/data” sunt tratate ca argumente separate.' },
      { text: 'mount -t nfs /mnt/nfs server1.example.com:/exports/data', why: 'Ordinea este inversată: sursa vine înaintea punctului de montare.' },
      { text: 'mount -t xfs server1.example.com:/exports/data /mnt/nfs', why: 'Tipul trebuie să fie nfs (sau omis); xfs este un sistem de fișiere local.' },
    ],
  },
  {
    id: 'L6.3-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Montează în mod read-only exportul `server1.example.com:/exports/ro` pe `/mnt/ro`, cu opțiunile `noexec` și `nosuid`.',
    prompt: '[root@client1 ~]#',
    answers: ['mount -t nfs -o ro,noexec,nosuid server1.example.com:/exports/ro /mnt/ro', 'mount -t nfs -o noexec,nosuid,ro server1.example.com:/exports/ro /mnt/ro', 'mount -o ro,noexec,nosuid server1.example.com:/exports/ro /mnt/ro', 'sudo mount -t nfs -o ro,noexec,nosuid server1.example.com:/exports/ro /mnt/ro'],
    canonical: 'mount -t nfs -o ro,noexec,nosuid server1.example.com:/exports/ro /mnt/ro',
    explanation: 'Opțiunile se dau cu `-o`, separate prin virgulă, fără spații.',
    wrong: [
      { text: 'mount -t nfs -o ro noexec nosuid server1.example.com:/exports/ro /mnt/ro', why: 'Opțiunile se separă prin virgulă, nu prin spații; spațiile fac din ele argumente separate.' },
      { text: 'mount -t nfs -r server1.example.com:/exports/ro /mnt/ro', why: '-r doar setează ro; lipsesc noexec și nosuid.' },
      { text: 'mount -t nfs -o rw,noexec,nosuid server1.example.com:/exports/ro /mnt/ro', why: 'rw cere citire-scriere, nu read-only.' },
    ],
  },
  {
    id: 'L6.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care linie din `/etc/fstab` montează persistent un export NFS, așteptând rețeaua?',
    explanation: 'Pentru NFS: sursă `server:/export`, tip `nfs`, opțiunea `_netdev` și `0 0`.',
    options: [
      { id: 'a', text: '`server1.example.com:/exports/data  /mnt/nfs  nfs  defaults,_netdev  0 0`', correct: true, why: 'Are toate cele șase câmpuri, tipul nfs și _netdev (așteaptă rețeaua).' },
      { id: 'b', text: '`server1.example.com /exports/data  /mnt/nfs  nfs  defaults  0 0`', correct: false, why: 'Lipsește „:” între server și cale; fstab ar vedea un câmp în plus.' },
      { id: 'c', text: '`UUID=3f5b8c1e-0d2a  /mnt/nfs  nfs  defaults,_netdev  0 0`', correct: false, why: 'Un export NFS nu are UUID; sursa este server:/export.' },
      { id: 'd', text: '`/mnt/nfs  server1.example.com:/exports/data  nfs  defaults  0 0`', correct: false, why: 'Sursa și punctul de montare sunt inversate.' },
    ],
  },
  {
    id: 'L6.3-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce poți concluziona despre montarea de mai jos?',
    explanation: 'Câmpurile din OPTIONS sunt cele efective, inclusiv cele implicite.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'findmnt', code: '[student@client1 ~]$ findmnt /mnt/ro\nTARGET  SOURCE                            FSTYPE OPTIONS\n/mnt/ro server1.example.com:/exports/ro   nfs4   ro,nosuid,noexec,relatime,vers=4.2,hard,proto=tcp,sec=sys' },
    options: [
      { id: 'a', text: 'Este montat read-only, prin NFSv4.2 pe TCP, cu comportament hard și fără execuție de programe.', correct: true, why: 'ro, vers=4.2, proto=tcp, hard, noexec și nosuid apar în opțiuni.' },
      { id: 'b', text: 'Este montat citire-scriere prin NFSv3.', correct: false, why: 'Opțiunea este ro, iar vers=4.2 arată NFSv4.2.' },
      { id: 'c', text: 'Este un sistem local XFS.', correct: false, why: 'FSTYPE este nfs4 și SOURCE este server:/export.' },
      { id: 'd', text: 'Cererile eșuează după câteva reîncercări (soft).', correct: false, why: 'Opțiunea este hard: reîncearcă la nesfârșit.' },
    ],
  },
  {
    id: 'L6.3-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Încerci să montezi și primești eroarea de mai jos. Care este cauza cea mai probabilă?',
    explanation: 'Mesajul vine de la server: adresa clientului nu are acces la acea cale.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[root@client1 ~]# mount -t nfs server1.example.com:/exports/data /mnt/nfs\nmount.nfs: access denied by server while mounting server1.example.com:/exports/data' },
    options: [
      { id: 'a', text: 'Clientul nu este autorizat în `/etc/exports` pe server sau calea nu este exportată; verifică cu `showmount -e` și `exportfs -v` (pe server).', correct: true, why: '„access denied by server” înseamnă că serverul a evaluat cererea și a respins-o pe baza exports.' },
      { id: 'b', text: 'Lipsește pachetul `nfs-utils` pe client.', correct: false, why: 'Fără nfs-utils, mesajul ar vorbi despre lipsa helper-ului mount.<tip>, nu despre refuzul serverului.' },
      { id: 'c', text: 'Directorul `/mnt/nfs` nu există.', correct: false, why: 'Un punct de montare lipsă dă „mount point does not exist”.' },
      { id: 'd', text: 'Trebuie rulat `mkfs.nfs` pe client.', correct: false, why: 'NFS nu se formatează; sistemul de fișiere este al serverului.' },
    ],
  },
  {
    id: 'L6.3-007', topicId: T, objectives: O, difficulty: 3, type: 'multi',
    stem: 'Rulezi `sudo touch /mnt/nfs/f` pe client și primești `Permission denied`, deși ești root. Care sunt cauze posibile?',
    explanation: 'Pe NFS, accesul se decide pe server, pe baza UID/GID și a opțiunilor de export.',
    options: [
      { id: 'a', text: 'Serverul folosește [[root-squash]] (implicit): root-ul clientului este mapat la utilizatorul anonim.', correct: true, why: 'exports(5): root_squash este implicit.' },
      { id: 'b', text: 'Directorul exportat nu permite scrierea „altora” pe server.', correct: true, why: 'Utilizatorul anonim intră în clasa „others”.' },
      { id: 'c', text: 'Exportul este ro în /etc/exports (ar da mai degrabă „Read-only file system”).', correct: false, why: 'Un export ro dă „Read-only file system”, nu „Permission denied”; deci nu aceasta este explicația pentru acest mesaj.' },
      { id: 'd', text: 'Trebuie rulat `chmod` ca root pe client; schimbă permisiunile de pe server.', correct: false, why: 'Cu root_squash, root-ul clientului nu are drept de chmod pe fișierele serverului.' },
    ],
  },
  {
    id: 'L6.3-008', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Demontează sistemul NFS montat pe `/mnt/nfs`.',
    prompt: '[root@client1 ~]#',
    answers: ['umount /mnt/nfs', 'sudo umount /mnt/nfs', 'umount server1.example.com:/exports/data'],
    canonical: 'umount /mnt/nfs',
    explanation: 'Comanda este `umount` (fără „n”) și primește punctul de montare sau sursa.',
    wrong: [
      { text: 'unmount /mnt/nfs', why: 'Numele comenzii este umount, nu unmount.' },
      { text: 'umount -a /mnt/nfs', why: '-a demontează toate sistemele de fișiere, nu doar pe acesta (cu argument suplimentar este incoerent).' },
      { text: 'mount -u /mnt/nfs', why: '-u nu demontează în mount Linux; demontarea se face cu umount.' },
    ],
  },
  {
    id: 'L6.3-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Serverul NFS s-a oprit și un proces se blochează pe `/mnt/nfs`. Care opțiune a produs comportamentul „reîncearcă la nesfârșit”?',
    explanation: 'Implicit, clientul NFS folosește [[hard-mount]].',
    options: [
      { id: 'a', text: '`hard` (implicit)', correct: true, why: 'Cu hard, cererile se reîncearcă până revine serverul (nfs(5)).' },
      { id: 'b', text: '`soft`', correct: false, why: 'Cu soft, cererea eșuează după retrans retransmisii cu eroare de I/O.' },
      { id: 'c', text: '`ro`', correct: false, why: 'ro interzice scrierea; nu controlează reîncercările.' },
      { id: 'd', text: '`noexec`', correct: false, why: 'noexec interzice execuția de programe; nu are legătură cu reîncercările.' },
    ],
  },
  {
    id: 'L6.3-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a monta persistent, pe un client, exportul `server1:/exports/data` pe `/mnt/data`, cu verificare fără reboot.',
    explanation: 'Verifici exportul, pregătești clientul, scrii în fstab și testezi cu mount -a.',
    items: [
      { text: '`dnf install nfs-utils` (dacă lipsește)', why: 'Clientul are nevoie de mount.nfs și de uneltele NFS.' },
      { text: '`showmount -e server1`', why: 'Vezi calea exactă exportată și clienții permiși.' },
      { text: '`mkdir -p /mnt/data`', why: 'Punctul de montare trebuie să existe.' },
      { text: 'adaugi `server1:/exports/data /mnt/data nfs defaults,_netdev 0 0` în `/etc/fstab`', why: 'Face montarea persistentă; _netdev așteaptă rețeaua.' },
      { text: '`mount -a`, apoi `findmnt /mnt/data`', why: 'Testezi fstab fără reboot; o eroare apare acum.' },
    ],
  },
  {
    id: 'L6.3-011', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește opțiunea cu efectul ei la montarea NFS.',
    explanation: 'Opțiunile sunt cele din nfs(5) și mount(8).',
    leftLabel: 'Opțiune', rightLabel: 'Efect',
    pairs: [
      { left: '`ro`', right: 'montare doar pentru citire', why: 'Scrierea este refuzată cu „Read-only file system”.' },
      { left: '`vers=4.2`', right: 'forțează versiunea de protocol; montarea eșuează dacă serverul nu o suportă', why: 'Fără vers=, clientul încearcă 4.2 și negociază în jos.' },
      { left: '`_netdev`', right: 'așteaptă rețeaua înainte de montare', why: 'Sistemul de fișiere depinde de rețea.' },
      { left: '`noexec`', right: 'interzice execuția de programe de pe acest sistem de fișiere', why: 'Opțiune generică de securitate din mount(8).' },
    ],
    distractors: [{ text: 'creează sistemul de fișiere pe server', why: 'NFS nu are mkfs la client; exportul este un director deja existent pe server.' }],
  },
  {
    id: 'L6.3-012', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pe un client, `showmount -e server1` nu returnează nimic, dar montarea directă cu `mount -t nfs server1:/exports/data /mnt/nfs` funcționează. Ce explicație este plauzibilă?',
    explanation: 'showmount interoghează serviciul MNT al serverului; un server doar NFSv4 poate să nu-l ofere (showmount(8)).',
    options: [
      { id: 'a', text: 'Serverul oferă doar NFSv4 și nu expune serviciul MNT interogat de showmount.', correct: true, why: 'Pagina showmount(8) spune că pe servere doar NFSv4 poate să nu funcționeze.' },
      { id: 'b', text: 'Exportul nu există, deci montarea nu ar fi putut reuși.', correct: false, why: 'Montarea a reușit; exportul există.' },
      { id: 'c', text: 'Clientul nu are nfs-utils.', correct: false, why: 'Fără nfs-utils nici mount -t nfs nu ar fi funcționat, iar showmount nu ar exista.' },
      { id: 'd', text: 'Firewall-ul clientului blochează showmount.', correct: false, why: 'Firewall-ul clientului nu blochează conexiunile inițiate de el; nu explică montarea reușită vs showmount.' },
    ],
  },
];
