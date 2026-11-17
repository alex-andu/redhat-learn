import type { Question } from '../../lib/types';

const T = 'L6.4';
const O = ['C6-3'];

export const Q_L6_4: Question[] = [
  {
    id: 'L6.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este avantajul principal al [[autofs]] față de o linie în `/etc/fstab` pentru un export NFS?',
    explanation: 'autofs montează doar la acces și demontează după inactivitate.',
    options: [
      { id: 'a', text: 'Montează la cerere și demontează automat după inactivitate.', correct: true, why: 'Reduce resursele folosite și evită blocarea boot-ului când serverul lipsește.' },
      { id: 'b', text: 'Este mai rapid decât NFS obișnuit.', correct: false, why: 'Montarea efectivă este tot NFS; viteza transferului nu se schimbă.' },
      { id: 'c', text: 'Nu necesită server NFS.', correct: false, why: 'autofs doar montează; serverul tot este necesar.' },
      { id: 'd', text: 'Permite scrierea chiar și pe exporturi read-only.', correct: false, why: 'Permisiunile și opțiunile serverului se aplică la fel.' },
    ],
  },
  {
    id: 'L6.4-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Pornește serviciul `autofs` imediat și configurează-l să pornească la fiecare boot, cu o singură comandă.',
    prompt: '[root@client1 ~]#',
    answers: ['systemctl enable --now autofs', 'systemctl enable autofs --now', 'sudo systemctl enable --now autofs', 'systemctl --now enable autofs'],
    canonical: 'systemctl enable --now autofs',
    explanation: '`enable` îl activează la boot, iar `--now` îl pornește și acum.',
    wrong: [
      { text: 'systemctl start autofs', why: 'start pornește acum, dar nu îl activează la boot.' },
      { text: 'systemctl enable autofs', why: 'enable îl activează la boot, dar nu îl pornește acum.' },
      { text: 'systemctl restart autofs', why: 'restart repornește, fără a-l activa la boot.' },
    ],
  },
  {
    id: 'L6.4-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai creat `/etc/auto.master.d/shares.conf` cu linia `/shares /etc/auto.shares`, ai repornit autofs, dar `ls /shares/data` dă „No such file or directory”. Care este cauza cea mai probabilă?',
    explanation: 'Fișierele din auto.master.d trebuie să aibă sufixul `.autofs` (auto.master(5)).',
    snippet: { kind: 'find-error', title: 'configurare', code: '/etc/auto.master.d/shares.conf:\n/shares  /etc/auto.shares\n\n/etc/auto.shares:\ndata  -rw,sync  server1.example.com:/exports/data' },
    options: [
      { id: 'a', text: 'Fișierul nu se termină în `.autofs`, deci este ignorat.', correct: true, why: 'auto.master(5): fișierele din auto.master.d fără sufixul .autofs sunt ignorate.' },
      { id: 'b', text: 'Harta indirectă trebuie să înceapă cu `/` în fiecare cheie.', correct: false, why: 'Cheile indirecte sunt nume simple; căile absolute sunt pentru hărți directe.' },
      { id: 'c', text: 'Opțiunile trebuie scrise fără `-`.', correct: false, why: 'Opțiunile se scriu cu „-” în față (-rw,sync).' },
      { id: 'd', text: 'Trebuie creat manual directorul `/shares/data`.', correct: false, why: 'autofs creează directoarele; crearea manuală îl încurcă.' },
    ],
  },
  {
    id: 'L6.4-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce reprezintă linia `/-  /etc/auto.direct` într-un fișier master map?',
    explanation: '`/-` este punctul special al hărților directe (auto.master(5)).',
    options: [
      { id: 'a', text: 'O hartă directă: cheile din `/etc/auto.direct` sunt căi absolute complete.', correct: true, why: 'Hărțile directe sunt asociate cu punctul /- în master map.' },
      { id: 'b', text: 'O hartă indirectă pentru directorul rădăcină.', correct: false, why: 'Indirecte au un director real ca punct de montare, nu „/-”.' },
      { id: 'c', text: 'O comandă de ștergere a hărții.', correct: false, why: 'Nu este comandă; este o intrare în master map.' },
      { id: 'd', text: 'O linie de comentariu.', correct: false, why: 'Comentariile încep cu #.' },
    ],
  },
  {
    id: 'L6.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce montează autofs când accesezi `/remote/ana`, având în hartă linia de mai jos?',
    explanation: 'Wildcard-ul `*` primește orice cheie, iar `&` se înlocuiește cu cheia cerută.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/etc/auto.home (master: /remote /etc/auto.home)', code: '*  -rw,sync  server1.example.com:/exports/home/&' },
    options: [
      { id: 'a', text: '`server1.example.com:/exports/home/ana` la `/remote/ana`.', correct: true, why: '& devine „ana”, cheia cerută.' },
      { id: 'b', text: '`server1.example.com:/exports/home/&` la `/remote/ana`.', correct: false, why: '& nu rămâne literal; este înlocuit cu cheia.' },
      { id: 'c', text: 'Toate directoarele din `/exports/home` la `/remote`.', correct: false, why: 'Se montează doar cheia accesată, nu tot exportul.' },
      { id: 'd', text: 'Nimic: wildcard-ul nu este permis în hărți indirecte.', correct: false, why: 'Wildcard-ul este tocmai un mecanism al hărților indirecte (autofs(5)).' },
    ],
  },
  {
    id: 'L6.4-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'După ce ai creat un fișier nou în `/etc/auto.master.d/`, care sunt pașii/condițiile corecte?',
    explanation: 'Sufixul, reîncărcarea și serviciul activ contează.',
    options: [
      { id: 'a', text: 'Numele fișierului se termină în `.autofs`.', correct: true, why: 'Altfel este ignorat.' },
      { id: 'b', text: 'Reîncarci/repornești serviciul (`systemctl restart autofs`).', correct: true, why: 'Master map-ul nou nu este citit fără reîncărcare.' },
      { id: 'c', text: 'Serviciul `autofs` este pornit (și activat la boot).', correct: true, why: 'Fără daemon nu există capcane autofs.' },
      { id: 'd', text: 'Creezi manual subdirectoarele cheilor sub punctul de montare.', correct: false, why: 'autofs le creează și le șterge; crearea manuală este o greșeală.' },
    ],
  },
  {
    id: 'L6.4-007', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează hărțile și intrările pe care le-a citit daemonul autofs.',
    prompt: '[root@client1 ~]#',
    answers: ['automount -m', 'sudo automount -m', 'automount --dumpmaps'],
    canonical: 'automount -m',
    explanation: '`automount -m` (`--dumpmaps`) listează hărțile configurate.',
    wrong: [
      { text: 'autofs -m', why: 'Nu există o comandă autofs; daemonul este automount.' },
      { text: 'systemctl dump autofs', why: 'systemctl nu are subcomanda dump pentru această informație; automount -m listează hărțile.' },
      { text: 'mount -m autofs', why: '-m la mount nu listează hărți autofs.' },
    ],
  },
  {
    id: 'L6.4-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'După configurarea corectă a unei hărți indirecte sub `/shares`, `ls /shares` nu afișează nimic. Ce înseamnă?',
    explanation: 'Fără browse, cheile apar doar după ce sunt accesate (auto.master(5)).',
    options: [
      { id: 'a', text: 'Este normal: cheile nu sunt create până la accesarea lor; `ls /shares/data` va declanșa montarea.', correct: true, why: 'BROWSE_MODE este „no” în instalarea implicită; autofs creează cheia la cerere.' },
      { id: 'b', text: 'autofs nu a pornit.', correct: false, why: 'Dacă nu ar fi pornit, /shares ar fi un director obișnuit; verifică cu systemctl.' },
      { id: 'c', text: 'Harta este greșită și trebuie ștearsă.', correct: false, why: 'Nu există nicio dovadă de eroare în acest output.' },
      { id: 'd', text: 'Trebuie `mkdir /shares/data`.', correct: false, why: 'Crearea manuală încurcă autofs.' },
    ],
  },
  {
    id: 'L6.4-009', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a monta automat `server1:/exports/data` la `/shares/data`.',
    explanation: 'Pachete și serviciu, apoi master map, hartă, reîncărcare și test.',
    items: [
      { text: '`dnf install autofs nfs-utils`', why: 'Ai nevoie de daemon și de clientul NFS.' },
      { text: 'creezi `/etc/auto.master.d/shares.autofs` cu `/shares /etc/auto.shares`', why: 'Master map: ce director și ce hartă.' },
      { text: 'creezi `/etc/auto.shares` cu `data -rw,sync server1:/exports/data`', why: 'Harta indirectă: cheie → sursă.' },
      { text: '`systemctl enable --now autofs` (sau `restart` dacă rulează deja)', why: 'Pornește/reîncarcă și activează la boot.' },
      { text: '`ls /shares/data`, apoi `findmnt /shares/data`', why: 'Accesarea declanșează montarea; findmnt o arată.' },
    ],
  },
  {
    id: 'L6.4-010', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește elementele de configurare cu rolul lor.',
    explanation: 'Master map, hărți și daemon colaborează.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`/etc/auto.master.d/x.autofs`', right: 'master map: leagă un director de o hartă', why: 'Sufixul .autofs este obligatoriu.' },
      { left: '`/etc/auto.shares`', right: 'harta: perechi cheie → sursă de montare', why: 'Conține linii cheie [-opțiuni] locație.' },
      { left: '`*  -rw  server:/home/&`', right: 'wildcard: orice cheie se montează de la server:/home/<cheie>', why: '& este înlocuit cu cheia cerută.' },
      { left: '`--timeout=60`', right: 'demontează după 60 s de inactivitate', why: '0 dezactivează demontarea.' },
    ],
    distractors: [{ text: 'creează sistemul de fișiere pe server', why: 'autofs nu creează sisteme de fișiere; montează cele existente.' }],
  },
  {
    id: 'L6.4-011', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ai modificat o hartă DIRECTĂ (`/etc/auto.direct`), dar noile intrări nu apar. Ce faci?',
    explanation: 'Hărțile directe și master map-ul cer reîncărcarea daemonului (autofs(5)); restart este varianta sigură.',
    options: [
      { id: 'a', text: '`systemctl restart autofs`', correct: true, why: 'Daemonul recitește master map-ul și hărțile directe.' },
      { id: 'b', text: 'Aștepți, hărțile directe se actualizează singure la fiecare accesare.', correct: false, why: 'Doar hărțile indirecte se recitesc la accesare; cele directe cer reîncărcare.' },
      { id: 'c', text: '`mount -a`', correct: false, why: 'mount -a montează intrări din fstab; nu reîncarcă autofs.' },
      { id: 'd', text: '`umount /mnt/backup`', correct: false, why: 'Demontarea nu reîncarcă configurația.' },
    ],
  },
];
