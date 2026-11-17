import type { Question } from '../../lib/types';

const T = 'L5.5';
const O = ['C5-5'];

export const Q_L5_5: Question[] = [
  {
    id: 'L5.5-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'De ce se preferă [[uuid]] sau label în /etc/fstab în locul lui `/dev/vdb1`?',
    explanation: 'Numele de dispozitiv (vdb1, sdb1) poate să se schimbe între reboot-uri.',
    options: [
      { id: 'a', text: 'Numele dispozitivului se poate schimba (ordinea de detectare); UUID/label rămân legate de sistemul de fișiere.', correct: true, why: 'UUID-ul este scris în sistemul de fișiere, deci rămâne același oricum ar fi numit discul.' },
      { id: 'b', text: 'UUID-ul face montarea mai rapidă.', correct: false, why: 'Nu are legătură cu viteza.' },
      { id: 'c', text: 'Nu se poate folosi /dev/vdb1 în fstab.', correct: false, why: 'Se poate, dar este fragil.' },
      { id: 'd', text: 'UUID criptează sistemul de fișiere.', correct: false, why: 'UUID este doar un identificator.' },
    ],
  },
  {
    id: 'L5.5-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează UUID-ul și tipul sistemului de fișiere pentru `/dev/vdb1`.',
    prompt: '[root@server1 ~]#',
    answers: ['blkid /dev/vdb1', 'sudo blkid /dev/vdb1'],
    canonical: 'blkid /dev/vdb1',
    explanation: '`blkid DISPOZITIV` afișează UUID, TYPE și LABEL (dacă există).',
    wrong: [
      { text: 'lsblk /dev/vdb1', why: 'Fără -f, lsblk nu afișează UUID.' },
      { text: 'df /dev/vdb1', why: 'df arată spațiul unui sistem de fișiere montat; nu afișează UUID.' },
      { text: 'uuid /dev/vdb1', why: 'Nu există o comandă `uuid` standard pentru acest scop.' },
    ],
  },
  {
    id: 'L5.5-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce reprezintă fiecare câmp al liniei din /etc/fstab de mai jos?',
    explanation: 'Câmpuri: sursă, punct de montare, tip, opțiuni, dump, fsck.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: '/etc/fstab', code: 'UUID=3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b  /data  xfs  defaults  0 0' },
    options: [
      { id: 'a', text: 'Sursa = UUID; se montează pe /data; tip xfs; opțiuni implicite; fără dump (0) și fără fsck (0).', correct: true, why: 'Aceasta este structura standard a celor 6 câmpuri.' },
      { id: 'b', text: 'Se montează /data pe UUID.', correct: false, why: 'Direcția este inversă: UUID este sursa, /data destinația.' },
      { id: 'c', text: 'xfs este numele volumului.', correct: false, why: 'Al treilea câmp este tipul sistemului de fișiere.' },
      { id: 'd', text: 'Cele două 0 sunt permisiuni.', correct: false, why: 'Sunt dump și ordinea fsck.' },
    ],
  },
  {
    id: 'L5.5-004', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'După editarea /etc/fstab, ce comandă testează fără reboot dacă liniile sunt valide?',
    explanation: '`mount -a` montează tot ce e în fstab și nu este montat; erorile apar imediat.',
    options: [
      { id: 'a', text: '`mount -a` (și `findmnt --verify`)', correct: true, why: 'mount -a încearcă toate intrările; findmnt --verify verifică sintaxa.' },
      { id: 'b', text: '`systemctl restart fstab`', correct: false, why: 'Nu există o unitate fstab.' },
      { id: 'c', text: '`reboot`, ca singura metodă', correct: false, why: 'Reboot-ul cu o linie greșită poate bloca sistemul; mount -a evită riscul.' },
      { id: 'd', text: '`cat /etc/fstab`', correct: false, why: 'Doar afișează fișierul; nu îl validează.' },
    ],
  },
  {
    id: 'L5.5-005', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Linia de mai jos este în fstab, dar sistemul nu montează volumul. Care este eroarea?',
    explanation: 'Un UUID inventat sau scris greșit nu corespunde niciunui sistem de fișiere.',
    snippet: { kind: 'find-error', title: '/etc/fstab', code: 'UUID=/dev/vdb1  /data  xfs  defaults  0 0' },
    options: [
      { id: 'a', text: 'După UUID= trebuie valoarea UUID (din blkid), nu calea dispozitivului.', correct: true, why: 'Fie UUID=<valoare>, fie direct /dev/vdb1, dar nu amestecate.' },
      { id: 'b', text: 'xfs trebuie scris cu majuscule.', correct: false, why: 'Tipurile se scriu cu litere mici.' },
      { id: 'c', text: 'Lipsește un câmp opțional.', correct: false, why: 'Toate cele 6 câmpuri sunt prezente.' },
      { id: 'd', text: '/data nu poate fi punct de montare.', correct: false, why: 'Orice director existent poate fi punct de montare.' },
    ],
  },
  {
    id: 'L5.5-006', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Montează toate sistemele de fișiere din /etc/fstab care nu sunt încă montate.',
    prompt: '[root@server1 ~]#',
    answers: ['mount -a', 'sudo mount -a'],
    canonical: 'mount -a',
    explanation: '`mount -a` citește fstab și montează intrările lipsă.',
    wrong: [
      { text: 'mount /etc/fstab', why: 'fstab este un fișier de configurare, nu un dispozitiv.' },
      { text: 'umount -a', why: 'umount -a demontează, nu montează.' },
      { text: 'systemctl mount', why: 'Nu există o astfel de subcomandă.' },
    ],
  },
  {
    id: 'L5.5-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care sunt formele valide pentru câmpul „sursă” din fstab?',
    explanation: 'UUID, LABEL, PARTUUID, cale /dev/…',
    options: [
      { id: 'a', text: '`UUID=3b1e9f0a-…`', correct: true, why: 'Forma recomandată pentru stabilitate.' },
      { id: 'b', text: '`LABEL=data`', correct: true, why: 'Eticheta trebuie să fie unică.' },
      { id: 'c', text: '`/dev/datavg/data`', correct: true, why: 'Calea unui LV este stabilă (numele nu depinde de ordinea de detectare).' },
      { id: 'd', text: '`NAME=data`', correct: false, why: 'NAME= nu este un prefix valid în fstab.' },
    ],
  },
  {
    id: 'L5.5-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește unealta cu rolul ei.',
    explanation: 'Unele comenzi citesc informații, altele le modifică.',
    leftLabel: 'Comandă', rightLabel: 'Rol',
    pairs: [
      { left: '`blkid`', right: 'afișează UUID, LABEL și tip', why: 'Citește superblock-ul.' },
      { left: '`lsblk -f`', right: 'arată arborele cu FSTYPE, LABEL, UUID, MOUNTPOINTS', why: '-f = filesystems.' },
      { left: '`findmnt`', right: 'arată ce este montat și unde', why: 'Citește tabela de montări.' },
      { left: '`xfs_admin -L data /dev/vdb1`', right: 'setează eticheta unui XFS demontat', why: 'Sistemul de fișiere trebuie demontat.' },
    ],
    distractors: [{ text: 'creează un LV', why: 'lvcreate, L5.4.' }],
  },
  {
    id: 'L5.5-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru o montare persistentă pe /data după UUID.',
    explanation: 'Afli UUID, creezi punctul de montare, adaugi linia, testezi.',
    items: [
      { text: '`blkid /dev/vdb1` — copiezi UUID-ul', why: 'Ai nevoie de valoarea exactă.' },
      { text: '`mkdir /data`', why: 'Punctul de montare trebuie să existe.' },
      { text: 'adaugi `UUID=… /data xfs defaults 0 0` în /etc/fstab', why: 'Linia face montarea persistentă.' },
      { text: '`systemctl daemon-reload && mount -a`', why: 'Reîncarci unitățile generate din fstab și montezi.' },
    ],
  },
];
