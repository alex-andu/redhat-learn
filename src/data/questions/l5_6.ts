import type { Question } from '../../lib/types';

const T = 'L5.6';
const O = ['C5-6'];

export const Q_L5_6: Question[] = [
  {
    id: 'L5.6-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'La ce folosește [[swap]]?',
    explanation: 'Swap extinde memoria RAM cu spațiu pe disc, pentru paginile rar folosite.',
    options: [
      { id: 'a', text: 'Extinde memoria: kernelul mută pe disc paginile rar folosite ca să elibereze RAM.', correct: true, why: 'Așa evită sistemul să rămână fără memorie la vârfuri de consum.' },
      { id: 'b', text: 'Stochează copii de rezervă ale datelor utilizatorilor.', correct: false, why: 'Swap nu este backup și datele din el nu sunt destinate recuperării.' },
      { id: 'c', text: 'Este o partiție obligatorie pentru boot.', correct: false, why: 'Sistemul poate porni fără swap.' },
      { id: 'd', text: 'Este un tip de sistem de fișiere montat pe /swap.', correct: false, why: 'Swap nu se montează; se activează cu swapon.' },
    ],
  },
  {
    id: 'L5.6-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Pregătește `/dev/vdb3` ca spațiu swap.',
    prompt: '[root@server1 ~]#',
    answers: ['mkswap /dev/vdb3', 'sudo mkswap /dev/vdb3'],
    canonical: 'mkswap /dev/vdb3',
    explanation: '`mkswap` scrie semnătura de swap și un UUID; swap-ul se activează apoi cu `swapon`.',
    wrong: [
      { text: 'mkfs.swap /dev/vdb3', why: 'Nu există mkfs.swap; comanda corectă este mkswap.' },
      { text: 'swapon /dev/vdb3', why: 'swapon activează un spațiu deja pregătit; fără mkswap eșuează cu „read swap header failed”.' },
      { text: 'mkfs.xfs /dev/vdb3', why: 'Creează un sistem de fișiere, nu swap.' },
    ],
  },
  {
    id: 'L5.6-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Activează acum swap-ul de pe `/dev/vdb3` (deja pregătit cu mkswap).',
    prompt: '[root@server1 ~]#',
    answers: ['swapon /dev/vdb3', 'sudo swapon /dev/vdb3'],
    canonical: 'swapon /dev/vdb3',
    explanation: '`swapon` activează swap-ul până la reboot; pentru persistență, adaugi linia în fstab.',
    wrong: [
      { text: 'swapoff /dev/vdb3', why: 'swapoff dezactivează swap-ul.' },
      { text: 'mount /dev/vdb3 swap', why: 'Swap nu se montează.' },
      { text: 'mkswap -a', why: '-a nu există la mkswap; activarea tuturor intrărilor fstab este `swapon -a`.' },
    ],
  },
  {
    id: 'L5.6-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată outputul?',
    explanation: 'swapon --show listează fiecare spațiu swap activ, cu tipul, mărimea, folosirea și prioritatea.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'swapon --show', code: '[root@server1 ~]# swapon --show\nNAME       TYPE      SIZE USED PRIO\n/dev/dm-1  partition   2G 120M   -2\n/dev/vdb3  partition   1G   0B   -3' },
    options: [
      { id: 'a', text: 'Două spații swap active (2 GiB și 1 GiB); al doilea este încă nefolosit.', correct: true, why: 'USED 0B arată că niciun pagină nu a fost mutată pe /dev/vdb3.' },
      { id: 'b', text: 'Un singur swap de 3 GiB.', correct: false, why: 'Sunt două intrări distincte.' },
      { id: 'c', text: '/dev/vdb3 este un fișier swap.', correct: false, why: 'TYPE = partition.' },
      { id: 'd', text: 'Swap-ul este dezactivat.', correct: false, why: 'Dacă ar fi dezactivat, nu ar apărea în listă.' },
    ],
  },
  {
    id: 'L5.6-005', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Linia de swap pentru fstab de mai jos are o greșeală. Care?',
    explanation: 'La swap, punctul de montare este `none` și tipul `swap`.',
    snippet: { kind: 'find-error', title: '/etc/fstab', code: 'UUID=9d8c7b6a-5f4e-4d3c-b2a1-0f9e8d7c6b5a  /swap  xfs  defaults  0 0' },
    options: [
      { id: 'a', text: 'Swap are punct de montare `none` și tip `swap`, nu `/swap` și `xfs`.', correct: true, why: 'Câmpul 2 = none, câmpul 3 = swap; swap nu este un sistem de fișiere montat.' },
      { id: 'b', text: 'UUID-ul nu poate fi folosit la swap.', correct: false, why: 'mkswap scrie UUID; poate fi folosit.' },
      { id: 'c', text: 'Lipsesc opțiunile.', correct: false, why: '`defaults` este prezent.' },
      { id: 'd', text: 'Ultimele două câmpuri trebuie să fie 1 1.', correct: false, why: 'Pentru swap rămân 0 0.' },
    ],
  },
  {
    id: 'L5.6-006', topicId: T, objectives: O, difficulty: 3, type: 'cli',
    stem: 'LV-ul `/dev/datavg/data` (XFS, montat) trebuie mărit cu 1 GiB, iar sistemul de fișiere trebuie extins automat, fără demontare. Care este comanda?',
    prompt: '[root@server1 ~]#',
    answers: ['lvextend -L +1G -r /dev/datavg/data', 'lvextend -r -L +1G /dev/datavg/data', 'lvextend --resizefs -L +1G /dev/datavg/data', 'sudo lvextend -L +1G -r /dev/datavg/data'],
    canonical: 'lvextend -L +1G -r /dev/datavg/data',
    explanation: '`+1G` adaugă 1 GiB la dimensiunea curentă; `-r` extinde și sistemul de fișiere.',
    wrong: [
      { text: 'lvextend -L 1G /dev/datavg/data', why: 'Fără +, setează dimensiunea totală la 1 GiB, nu adaugă 1 GiB; și fără -r sistemul de fișiere rămâne mic.' },
      { text: 'lvcreate -L +1G /dev/datavg/data', why: 'lvcreate creează volume noi, nu extinde.' },
      { text: 'vgextend -L +1G datavg', why: 'vgextend adaugă PV-uri la VG; nu extinde LV-uri.' },
    ],
  },
  {
    id: 'L5.6-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care operații sunt non-destructive pentru datele existente?',
    explanation: 'Extinderea și adăugarea în spațiu liber păstrează datele; reformatarea și recrearea le șterg.',
    options: [
      { id: 'a', text: 'Crearea unei partiții noi în spațiu liber al unui disc deja partiționat.', correct: true, why: 'Nu modifică partițiile existente.' },
      { id: 'b', text: '`lvextend -r` pe un LV cu XFS montat.', correct: true, why: 'XFS poate fi mărit online.' },
      { id: 'c', text: 'Adăugarea unui disc nou în VG cu `vgextend`.', correct: true, why: 'Adaugă spațiu fără a atinge LV-urile.' },
      { id: 'd', text: '`parted /dev/vdb mklabel gpt` pe un disc cu date.', correct: false, why: 'Scrie o tabelă nouă și pierzi harta partițiilor existente.' },
    ],
  },
  {
    id: 'L5.6-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu rolul ei.',
    explanation: 'Swap are propriile comenzi: mkswap pregătește, swapon activează, swapoff dezactivează.',
    leftLabel: 'Comandă', rightLabel: 'Rol',
    pairs: [
      { left: '`mkswap`', right: 'scrie semnătura de swap și UUID', why: 'Pasul de pregătire.' },
      { left: '`swapon`', right: 'activează spațiul swap', why: 'Temporar, până la reboot sau swapoff.' },
      { left: '`swapon --show`', right: 'listează swap-urile active', why: 'Cu tip, mărime, folosire, prioritate.' },
      { left: '`free -h`', right: 'arată RAM și swap total/folosit', why: '-h = format uman.' },
    ],
    distractors: [{ text: 'mărește un LV', why: 'lvextend.' }],
  },
  {
    id: 'L5.6-009', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a adăuga persistent un swap de 1 GiB pe o partiție nouă `/dev/vdb3`.',
    explanation: 'Partiția, mkswap, swapon, fstab, verificare.',
    items: [
      { text: '`parted /dev/vdb print free` apoi `mkpart` în spațiul liber', why: 'Folosești spațiu nealocat, fără a atinge partițiile existente.' },
      { text: '`mkswap /dev/vdb3`', why: 'Pregătești swap-ul și obții UUID.' },
      { text: 'adaugi `UUID=… none swap defaults 0 0` în /etc/fstab', why: 'Pentru persistență.' },
      { text: '`swapon -a` și `swapon --show`', why: 'Activezi tot ce e în fstab și confirmi.' },
    ],
  },
];
