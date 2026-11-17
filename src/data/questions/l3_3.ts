import type { Question } from '../../lib/types';

const T = 'L3.3';
const O = ['C3-1'];

export const Q_L3_3: Question[] = [
  {
    id: 'L3.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care test este adevărat doar dacă `/etc` există și este director?',
    explanation: '`-d` verifică directoare; `-e` doar existența; `-f` fișiere obișnuite.',
    options: [
      { id: 'a', text: '`[ -d /etc ]`', correct: true, why: '`-d` = director.' },
      { id: 'b', text: '`[ -f /etc ]`', correct: false, why: '`-f` cere un fișier obișnuit.' },
      { id: 'c', text: '`[ -e /etc ]`', correct: false, why: '`-e` este adevărat pentru orice tip, inclusiv fișiere.' },
      { id: 'd', text: '`[ -s /etc ]`', correct: false, why: '`-s` verifică dacă are dimensiune nenulă.' },
    ],
  },
  {
    id: 'L3.3-002', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'În shell, ce cod de ieșire înseamnă „adevărat” pentru `if`?',
    explanation: '`if` rulează o comandă; codul 0 înseamnă succes.',
    options: [
      { id: 'a', text: '`0`', correct: true, why: 'Cod 0 = succes = ramura `then`.' },
      { id: 'b', text: '`1`', correct: false, why: 'Un cod nenul duce la `else`.' },
      { id: 'c', text: 'Orice cod nenul.', correct: false, why: 'Aceasta înseamnă „fals”.' },
      { id: 'd', text: '`-1`', correct: false, why: 'Codurile de ieșire sunt între 0 și 255.' },
    ],
  },
  {
    id: 'L3.3-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Care linie are sintaxa corectă?',
    explanation: '`[` este o comandă: cere spații în jurul ei și `]` ca ultim argument.',
    options: [
      { id: 'a', text: '`if [ -f /etc/passwd ]; then echo da; fi`', correct: true, why: 'Spații, `;` înainte de `then`, `fi` la final.' },
      { id: 'b', text: '`if [-f /etc/passwd]; then echo da; fi`', correct: false, why: 'Fără spații, bash caută o comandă numită `[-f`.' },
      { id: 'c', text: '`if [ -f /etc/passwd ] then echo da; fi`', correct: false, why: 'Lipsește `;` (sau linie nouă) înainte de `then`.' },
      { id: 'd', text: '`if [ -f /etc/passwd ]; then echo da; endif`', correct: false, why: 'Blocul se închide cu `fi`, nu `endif`.' },
    ],
  },
  {
    id: 'L3.3-004', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește operatorul cu ce testează.',
    explanation: 'Operatori de test frecvenți.',
    leftLabel: 'Operator', rightLabel: 'Adevărat dacă…',
    pairs: [
      { left: '`-z "$x"`', right: 'șirul este gol', why: 'z de la zero length.' },
      { left: '`-eq`', right: 'numerele întregi sunt egale', why: 'Pentru text se folosește `=`.' },
      { left: '`-x fișier`', right: 'fișierul este executabil pentru utilizatorul curent', why: 'Reflectă drepturile celui care rulează scriptul.' },
      { left: '`!`', right: 'neagă testul', why: 'De exemplu `[ ! -e fișier ]`.' },
    ],
    distractors: [{ text: 'fișierul este symlink', why: 'Pentru link simbolic există `-L`.' }],
  },
  {
    id: 'L3.3-005', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Scrie testul care este adevărat dacă variabila `nr` este mai mare decât 10 (nu pune `if`).',
    prompt: 'script.sh>',
    answers: ['[ "$nr" -gt 10 ]', '[ $nr -gt 10 ]', 'test "$nr" -gt 10', 'test $nr -gt 10'],
    canonical: '[ "$nr" -gt 10 ]',
    explanation: '`-gt` = greater than, comparație numerică.',
    wrong: [
      { text: '[ "$nr" > 10 ]', why: '`>` este redirecționare: creează un fișier numit `10`.' },
      { text: '[ "$nr" = 10 ]', why: '`=` compară egalitatea de șiruri, nu „mai mare”.' },
      { text: '["$nr" -gt 10]', why: 'Lipsesc spațiile din jurul parantezelor.' },
    ],
    hint: 'Operatorul numeric pentru „greater than”.',
  },
  {
    id: 'L3.3-006', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Scriptul primește un argument cu spațiu (`./s.sh "a b"`). Ce se întâmplă?',
    explanation: 'Fără ghilimele, `$1` se desparte în două cuvinte și testul devine invalid.',
    snippet: { kind: 'find-error', title: 'script și rulare', code: '#!/bin/bash\nif [ $1 = "x" ]; then echo egal; fi\n\n[student@server1 ~]$ ./s.sh "a b"\n./s.sh: line 2: [: too many arguments' },
    options: [
      { id: 'a', text: 'Testul trebuie scris `[ "$1" = "x" ]`, cu ghilimele.', correct: true, why: 'Ghilimelele mențin „a b” ca un singur cuvânt.' },
      { id: 'b', text: 'Trebuie înlocuit `=` cu `-eq`.', correct: false, why: '`-eq` este numeric; nu rezolvă problema spațiului.' },
      { id: 'c', text: 'Trebuie adăugat `sudo`.', correct: false, why: 'Eroarea este de sintaxă, nu de permisiuni.' },
      { id: 'd', text: 'Trebuie schimbat `[` în `{`.', correct: false, why: '`{` este alt construct, nu un test.' },
    ],
  },
  {
    id: 'L3.3-007', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează părțile unui bloc `if`.',
    explanation: 'Structura if/elif/else/fi.',
    items: [
      { text: '`if [ condiție ]; then`', why: 'Începe blocul și testează prima condiție.' },
      { text: '`elif [ altă condiție ]; then`', why: 'A doua condiție, doar dacă prima a eșuat.' },
      { text: '`else`', why: 'Ramura implicită.' },
      { text: '`fi`', why: 'Închide blocul.' },
    ],
  },
  {
    id: 'L3.3-008', topicId: T, objectives: O, difficulty: 3, type: 'multi',
    stem: 'Care afirmații despre `&&` și `||` sunt adevărate? (alege toate cele corecte)',
    explanation: '`&&` rulează a doua comandă doar dacă prima are cod 0; `||` doar dacă are cod nenul.',
    options: [
      { id: 'a', text: '`grep -q root /etc/passwd && echo da` afișează „da” doar dacă grep găsește.', correct: true, why: '`&&` cere succes pentru prima comandă.' },
      { id: 'b', text: '`[ -f x ] || echo lipsește` afișează textul dacă `x` nu e fișier.', correct: true, why: '`||` rulează a doua doar la eșec.' },
      { id: 'c', text: '`A && B || C` este întotdeauna echivalent cu `if A then B else C`.', correct: false, why: 'Dacă A reușește, dar B eșuează, se rulează și C.' },
      { id: 'd', text: '`&&` rulează ambele comenzi în paralel.', correct: false, why: 'Rulează secvențial, condiționat.' },
    ],
  },
  {
    id: 'L3.3-009', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce îți spune această sesiune?',
    explanation: 'Testele nu afișează nimic; rezultatul este codul de ieșire (0 = adevărat, 1 = fals).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ [ -d /etc/passwd ]; echo $?\n1\n[student@server1 ~]$ [ -f /etc/passwd ]; echo $?\n0' },
    options: [
      { id: 'a', text: '`/etc/passwd` este un fișier obișnuit, nu un director.', correct: true, why: '`-d` a dat 1 (fals), `-f` a dat 0 (adevărat).' },
      { id: 'b', text: '`/etc/passwd` este un director.', correct: false, why: '`-d` a întors 1, deci fals.' },
      { id: 'c', text: '`/etc/passwd` nu există.', correct: false, why: '`-f` a întors 0: există și este fișier.' },
      { id: 'd', text: 'Comenzile au eșuat cu eroare de sintaxă.', correct: false, why: 'O eroare de sintaxă ar afișa un mesaj și ar da alt cod.' },
    ],
  },
];
