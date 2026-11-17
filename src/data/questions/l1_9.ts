import type { Question } from '../../lib/types';

const T = 'L1.9';
const O = ['C1-6'];

export const Q_L1_9: Question[] = [
  {
    id: 'L1.9-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce comandă creează o arhivă gzip numită `backup.tar.gz` din directorul `date`?',
    explanation: '`-c` creează, `-z` comprimă cu gzip, `-f` este urmat de numele arhivei, apoi sursa.',
    options: [
      { id: 'a', text: '`tar -czf backup.tar.gz date`', correct: true, why: 'Creare + gzip + nume de arhivă + sursă.' },
      { id: 'b', text: '`tar -xzf backup.tar.gz date`', correct: false, why: '`-x` extrage; nu creează.' },
      { id: 'c', text: '`tar -cjf backup.tar.gz date`', correct: false, why: '`-j` este bzip2, nu gzip.' },
      { id: 'd', text: '`gzip date backup.tar.gz`', correct: false, why: '`gzip` nu arhivează directoare și nu primește un nume de arhivă astfel.' },
    ],
  },
  {
    id: 'L1.9-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Cum vezi conținutul `arhiva.tar.bz2` fără a extrage nimic?',
    explanation: '`-t` listează conținutul unei arhive; `-j` indică bzip2.',
    options: [
      { id: 'a', text: '`tar -tjf arhiva.tar.bz2`', correct: true, why: '`-t` listare, `-j` bzip2, `-f` numele arhivei.' },
      { id: 'b', text: '`tar -xjf arhiva.tar.bz2`', correct: false, why: 'Extrage fișierele în directorul curent.' },
      { id: 'c', text: '`bunzip2 arhiva.tar.bz2`', correct: false, why: 'Decomprimă și înlocuiește arhiva cu `arhiva.tar`; nu listează.' },
      { id: 'd', text: '`tar -cjf arhiva.tar.bz2`', correct: false, why: 'Ar încerca să creeze o arhivă (și refuză una goală).' },
    ],
  },
  {
    id: 'L1.9-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre comenzi păstrează fișierul original `jurnal.log` după comprimare? (alege toate cele corecte)',
    explanation: 'Implicit, `gzip` și `bzip2` înlocuiesc originalul. `-k` îl păstrează; o redirecționare cu `-c` scrie pe stdout.',
    options: [
      { id: 'a', text: '`gzip -k jurnal.log`', correct: true, why: '`-k` (keep) păstrează originalul.' },
      { id: 'b', text: '`bzip2 -k jurnal.log`', correct: true, why: 'Același efect pentru bzip2.' },
      { id: 'c', text: '`gzip -c jurnal.log > jurnal.log.gz`', correct: true, why: '`-c` scrie rezultatul pe stdout și lasă originalul neatins; redirecționarea îl salvează.' },
      { id: 'd', text: '`gzip jurnal.log`', correct: false, why: 'Înlocuiește originalul cu `jurnal.log.gz`.' },
    ],
  },
  {
    id: 'L1.9-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Extrage `proiect.tar.gz` în directorul existent `/tmp/dest`.',
    prompt: '[student@server1 ~]$',
    answers: ['tar -xzf proiect.tar.gz -C /tmp/dest', 'tar -xf proiect.tar.gz -C /tmp/dest', 'tar xzf proiect.tar.gz -C /tmp/dest', 'tar -xzvf proiect.tar.gz -C /tmp/dest', 'tar -C /tmp/dest -xzf proiect.tar.gz'],
    canonical: 'tar -xzf proiect.tar.gz -C /tmp/dest',
    explanation: '`-x` extrage, `-z` gzip, `-f` arhiva, `-C` directorul destinație.',
    wrong: [
      { text: 'tar -czf proiect.tar.gz -C /tmp/dest', why: '`-c` creează o arhivă; nu extrage.' },
      { text: 'tar -xjf proiect.tar.gz -C /tmp/dest', why: '`-j` este bzip2; fișierul este gzip.' },
      { text: 'tar -tzf proiect.tar.gz -C /tmp/dest', why: '`-t` doar listează.' },
    ],
    hint: 'Alege modul de extragere și opțiunea pentru directorul destinație.',
  },
  {
    id: 'L1.9-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru a restaura în siguranță un tarball primit de la altcineva.',
    explanation: 'Verifici tipul, vezi conținutul, pregătești destinația, extragi, confirmi.',
    items: [
      { text: '`file arhiva.tar.gz`', why: 'Confirmi formatul real, indiferent de extensie.' },
      { text: '`tar -tzf arhiva.tar.gz`', why: 'Vezi ce conține și ce căi are, fără a extrage.' },
      { text: '`mkdir destinatie`', why: 'Pregătești directorul pentru `-C`.' },
      { text: '`tar -xzf arhiva.tar.gz -C destinatie`', why: 'Extragi în locul controlat, nu în directorul curent.' },
      { text: '`ls -R destinatie`', why: 'Confirmi rezultatul.' },
    ],
  },
  {
    id: 'L1.9-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește opțiunea `tar` cu efectul.',
    explanation: 'Opțiunile de bază ale lui tar.',
    leftLabel: 'Opțiune', rightLabel: 'Efect',
    pairs: [
      { left: '`-c`', right: 'creează o arhivă', why: 'create: creează arhiva.' },
      { left: '`-x`', right: 'extrage din arhivă', why: 'extract: extrage din arhivă.' },
      { left: '`-t`', right: 'listează conținutul', why: 'list: doar listează.' },
      { left: '`-z`', right: 'filtrează prin gzip', why: 'extensie tipică .tar.gz.' },
      { left: '`-j`', right: 'filtrează prin bzip2', why: 'extensie tipică .tar.bz2.' },
      { left: '`-C dir`', right: 'schimbă directorul înainte de operație', why: 'la extragere, destinația.' },
    ],
    distractors: [{ text: 'afișează fiecare fișier procesat', why: 'Aceasta este opțiunea `-v`.' }],
  },
  {
    id: 'L1.9-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'După rularea comenzii, nu există niciun fișier `backup.tar.gz`, iar în director a apărut un fișier numit `z`. Ce s-a întâmplat?',
    explanation: 'Numele arhivei trebuie să urmeze imediat după `f`. Aici, după `f` vine `z`, deci `z` a devenit numele arhivei.',
    snippet: { kind: 'find-error', title: 'comandă tastată', code: 'tar -cfz backup.tar.gz date' },
    options: [
      { id: 'a', text: '`z` a fost interpretat ca numele arhivei (după `-f`); trebuia `-czf backup.tar.gz`.', correct: true, why: 'La opțiunile grupate, `f` trebuie să fie ultima, urmată de numele arhivei.' },
      { id: 'b', text: '`tar` nu acceptă `-z` împreună cu `-c`.', correct: false, why: '`-cz` este o combinație uzuală.' },
      { id: 'c', text: 'Lipsea `-v`.', correct: false, why: '`-v` doar afișează fișierele.' },
      { id: 'd', text: 'Directorul `date` nu există.', correct: false, why: 'Altfel ar fi apărut o eroare despre `date`; problema este ordinea opțiunilor.' },
    ],
  },
  {
    id: 'L1.9-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată acest output și ce trebuie să știi la extragere?',
    explanation: 'Căile din arhivă sunt relative și încep cu `proiect/`; extragerea creează subdirectorul `proiect` în locul curent (sau în `-C`).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'tar -tzf', code: '[student@server1 ~]$ tar -tzf proiect.tar.gz\nproiect/\nproiect/docs/\nproiect/docs/f1.txt' },
    options: [
      { id: 'a', text: 'Extragerea va crea directorul `proiect` în locația curentă (sau în `-C`).', correct: true, why: 'Membrii au prefixul `proiect/`.' },
      { id: 'b', text: 'Fișierele se vor extrage direct în directorul curent, fără subdirector.', correct: false, why: 'Prefixul `proiect/` este păstrat (doar `--strip-components` îl elimină).' },
      { id: 'c', text: 'Arhiva este goală.', correct: false, why: 'Sunt listate un director și un fișier.' },
      { id: 'd', text: 'Arhiva conține căi absolute care vor suprascrie fișiere de sistem.', correct: false, why: 'Căile nu încep cu `/`.' },
    ],
  },
  {
    id: 'L1.9-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei să citești primele linii din `jurnal.log.gz` fără a-l decomprima pe disc. Ce folosești?',
    explanation: '`zcat` (sau `gzip -dc`) scrie conținutul decomprimat pe stdout; fișierul rămâne neschimbat.',
    options: [
      { id: 'a', text: '`zcat jurnal.log.gz | head`', correct: true, why: 'Decomprimă în flux; fișierul .gz rămâne neatins.' },
      { id: 'b', text: '`gunzip jurnal.log.gz | head`', correct: false, why: '`gunzip` înlocuiește fișierul cu `jurnal.log` și nu trimite conținutul în pipe.' },
      { id: 'c', text: '`tar -tzf jurnal.log.gz`', correct: false, why: '`tar -t` listează o arhivă tar; aici este doar un fișier comprimat (nu tar).' },
      { id: 'd', text: '`head jurnal.log.gz`', correct: false, why: 'Ar afișa date binare comprimate, nu text.' },
    ],
  },
];
