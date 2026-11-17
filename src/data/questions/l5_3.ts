import type { Question } from '../../lib/types';

const T = 'L5.3';
const O = ['C5-3'];

export const Q_L5_3: Question[] = [
  {
    id: 'L5.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce este un [[vg]]?',
    explanation: 'Un VG este bazinul comun de spațiu format din unul sau mai multe PV-uri.',
    options: [
      { id: 'a', text: 'Un rezervor de spațiu format din unul sau mai multe volume fizice, din care se taie volume logice.', correct: true, why: 'Exact: VG agregă PV-urile și oferă extents pentru LV-uri.' },
      { id: 'b', text: 'Un sistem de fișiere montat în /mnt.', correct: false, why: 'Sistemul de fișiere se creează pe un LV, nu este VG.' },
      { id: 'c', text: 'O partiție GPT specială.', correct: false, why: 'O partiție poate fi PV; VG este un concept LVM, nu o partiție.' },
      { id: 'd', text: 'O copie de rezervă a metadatelor LVM.', correct: false, why: 'Copiile sunt în /etc/lvm/backup; VG este altceva.' },
    ],
  },
  {
    id: 'L5.3-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează un grup de volume numit `datavg` din PV-ul `/dev/vdb1`.',
    prompt: '[root@server1 ~]#',
    answers: ['vgcreate datavg /dev/vdb1', 'sudo vgcreate datavg /dev/vdb1'],
    canonical: 'vgcreate datavg /dev/vdb1',
    explanation: 'Sintaxa: `vgcreate NUME_VG PV [PV…]`. Numele VG vine primul.',
    wrong: [
      { text: 'vgcreate /dev/vdb1 datavg', why: 'Ordinea este inversată: numele grupului trebuie să fie primul argument.' },
      { text: 'vgextend datavg /dev/vdb1', why: 'vgextend adaugă la un VG DEJA existent; nu îl creează.' },
      { text: 'pvcreate datavg /dev/vdb1', why: 'pvcreate inițializează PV-uri; nu creează grupuri.' },
    ],
  },
  {
    id: 'L5.3-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Adaugă PV-ul `/dev/vdc1` (deja creat cu pvcreate) în grupul existent `datavg`.',
    prompt: '[root@server1 ~]#',
    answers: ['vgextend datavg /dev/vdc1', 'sudo vgextend datavg /dev/vdc1'],
    canonical: 'vgextend datavg /dev/vdc1',
    explanation: '[[vgextend]] mărește un VG cu un PV nou, fără a atinge LV-urile.',
    wrong: [
      { text: 'vgcreate datavg /dev/vdc1', why: 'Ar încerca să creeze un VG cu același nume; eșuează, deoarece există deja.' },
      { text: 'lvextend datavg /dev/vdc1', why: 'lvextend extinde un volum logic, nu un VG.' },
      { text: 'vgreduce datavg /dev/vdc1', why: 'vgreduce scoate un PV; face invers.' },
    ],
  },
  {
    id: 'L5.3-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Câtă spațiu liber poate fi alocat în VG după interpretarea outputului?',
    explanation: 'Coloana VFree arată spațiul nealocat.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'vgs', code: '[root@server1 ~]# vgs\n  VG     #PV #LV #SN Attr   VSize VFree\n  datavg   2   1   0 wz--n- 2.99g <1.00g\n  rhel     1   2   0 wz--n- <19.00g    0' },
    options: [
      { id: 'a', text: 'datavg: aproape 1 GiB liber; rhel: nimic liber.', correct: true, why: 'VFree arată spațiul care nu este alocat niciunui LV; 0 înseamnă VG plin.' },
      { id: 'b', text: 'datavg: 2.99 GiB liber.', correct: false, why: '2.99g este VSize (totalul), nu spațiul liber.' },
      { id: 'c', text: 'Ambele VG-uri au 2 LV-uri.', correct: false, why: 'Coloana #LV arată 1 pentru datavg și 2 pentru rhel.' },
      { id: 'd', text: 'datavg are 3 PV-uri.', correct: false, why: '#PV este 2.' },
    ],
  },
  {
    id: 'L5.3-005', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Pentru a scoate `/dev/vdc1` din `datavg` și a elibera discul, care este ordinea corectă?',
    explanation: 'Mai întâi muți datele, apoi scoți PV-ul din VG, apoi șterge eticheta.',
    options: [
      { id: 'a', text: 'pvmove /dev/vdc1 → vgreduce datavg /dev/vdc1 → pvremove /dev/vdc1', correct: true, why: 'pvmove eliberează extents; vgreduce scoate PV-ul din grup; pvremove șterge eticheta.' },
      { id: 'b', text: 'pvremove /dev/vdc1 → vgreduce → pvmove', correct: false, why: 'pvremove refuză un PV aflat într-un VG.' },
      { id: 'c', text: 'vgremove datavg → vgreduce', correct: false, why: 'vgremove șterge tot grupul, inclusiv LV-urile.' },
      { id: 'd', text: 'Doar `umount /dev/vdc1`.', correct: false, why: 'Demontarea nu are legătură cu apartenența la un VG.' },
    ],
  },
  {
    id: 'L5.3-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Colegul a rulat comanda de mai jos și a primit o eroare. Ce a greșit?',
    explanation: 'vgcreate cere ca fiecare PV să existe sau să poată fi inițializat; aici dispozitivul este greșit.',
    snippet: { kind: 'find-error', title: 'comandă', code: 'vgcreate datavg /dev/vdb\n# partiția a fost creată ca /dev/vdb1 și marcată lvm' },
    options: [
      { id: 'a', text: 'A indicat discul /dev/vdb în loc de partiția /dev/vdb1 pe care a pregătit-o.', correct: true, why: 'Discul are tabelă de partiții; PV-ul trebuie creat pe partiția pregătită (vdb1), iar LVM refuză de regulă un disc întreg care conține deja partiții.' },
      { id: 'b', text: 'Numele datavg este prea lung.', correct: false, why: 'Numele VG poate fi lung (până la 127 de caractere).' },
      { id: 'c', text: 'vgcreate nu primește dispozitive.', correct: false, why: 'Primește unul sau mai multe PV-uri.' },
      { id: 'd', text: 'Trebuia să adauge -s.', correct: false, why: '-s alege dimensiunea extentului, nu este obligatoriu.' },
    ],
  },
  {
    id: 'L5.3-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi afișează informații despre grupuri de volume?',
    explanation: 'vgs este sumarul, vgdisplay detaliile, vgscan caută VG-uri pe discuri.',
    options: [
      { id: 'a', text: '`vgs`', correct: true, why: 'Tabel compact: nume, #PV, #LV, VSize, VFree.' },
      { id: 'b', text: '`vgdisplay`', correct: true, why: 'Format lung, cu PE Size, Total PE, Alloc PE, Free PE.' },
      { id: 'c', text: '`vgscan`', correct: true, why: 'Caută VG-uri pe dispozitive și le listează.' },
      { id: 'd', text: '`lvs`', correct: false, why: 'lvs listează volume logice, nu grupuri.' },
    ],
  },
  {
    id: 'L5.3-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu efectul.',
    explanation: 'Comenzile vg* administrează grupurile.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`vgcreate`', right: 'creează un grup din unul sau mai multe PV-uri', why: 'Primește numele grupului, apoi PV-urile.' },
      { left: '`vgextend`', right: 'adaugă PV-uri într-un grup existent', why: 'Crește VFree.' },
      { left: '`vgreduce`', right: 'scoate un PV gol dintr-un grup', why: 'PV-ul nu trebuie să mai fie folosit de niciun LV.' },
      { left: '`vgremove`', right: 'șterge grupul de volume', why: 'Șterge și LV-urile din el, cu confirmare.' },
    ],
    distractors: [{ text: 'redimensionează sistemul de fișiere', why: 'Aceasta este xfs_growfs / resize2fs (C6) sau lvextend -r.' }],
  },
  {
    id: 'L5.3-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a extinde `datavg` cu discul nou `/dev/vdc`.',
    explanation: 'Pregătești dispozitivul, îl faci PV, îl adaugi la VG, verifici.',
    items: [
      { text: '`lsblk` — identifici discul nou', why: 'Alegi discul corect.' },
      { text: '`pvcreate /dev/vdc`', why: 'Îl faci PV.' },
      { text: '`vgextend datavg /dev/vdc`', why: 'Îl adaugi grupului.' },
      { text: '`vgs datavg`', why: 'Confirmi că VSize și VFree au crescut.' },
    ],
  },
];
