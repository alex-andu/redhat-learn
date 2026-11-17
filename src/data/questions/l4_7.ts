import type { Question } from '../../lib/types';

const T = 'L4.7';
const O = ['C4-7'];

export const Q_L4_7: Question[] = [
  {
    id: 'L4.7-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce comandă afișează mesajele din [[journal]] doar pentru boot-ul curent?',
    explanation: '`journalctl -b` limitează la boot-ul curent.',
    options: [
      { id: 'a', text: '`journalctl -b`', correct: true, why: '`-b` (boot) filtrează la pornirea curentă.' },
      { id: 'b', text: '`journalctl -f`', correct: false, why: '`-f` urmărește mesajele noi în timp real (follow).' },
      { id: 'c', text: '`journalctl -k`', correct: false, why: '`-k` arată doar mesajele kernelului.' },
      { id: 'd', text: '`journalctl --disk-usage`', correct: false, why: 'Arată spațiul ocupat de jurnal, nu mesajele.' },
    ],
  },
  {
    id: 'L4.7-002', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează mesajele serviciului `sshd` din jurnal.',
    prompt: '[root@server1 ~]#',
    answers: ['journalctl -u sshd', 'journalctl -u sshd.service', 'journalctl --unit sshd', 'journalctl --unit=sshd'],
    canonical: 'journalctl -u sshd',
    explanation: '`-u` (unit) filtrează după unitate systemd.',
    wrong: [
      { text: 'journalctl sshd', why: 'Fără `-u`, `sshd` nu este interpretat ca unitate; journalctl l-ar trata ca potrivire de câmp și ar eșua sau ar da rezultate nepotrivite.' },
      { text: 'journalctl -p sshd', why: '`-p` filtrează după prioritate, nu după serviciu.' },
      { text: 'cat /var/log/sshd', why: 'Nu există un asemenea fișier; mesajele sshd sunt în jurnal și, dacă rsyslog este activ, în `/var/log/secure`.' },
    ],
  },
  {
    id: 'L4.7-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Afișează doar mesajele de nivel `err` sau mai grave, din boot-ul curent.',
    prompt: '[root@server1 ~]#',
    answers: ['journalctl -b -p err', 'journalctl -p err -b', 'journalctl -p err --boot', 'journalctl -b -p 3', 'journalctl -p 3 -b'],
    canonical: 'journalctl -b -p err',
    explanation: '`-p err` include err, crit, alert și emerg; `-b` limitează la boot-ul curent.',
    wrong: [
      { text: 'journalctl -b', why: 'Fără `-p`, arată toate nivelurile, inclusiv info și debug.' },
      { text: 'journalctl -p', why: '`-p` cere o valoare (nume sau număr).' },
      { text: 'journalctl -b -p debug', why: 'Nivelul debug (7) include practic TOT; nu filtrează la erori.' },
    ],
  },
  {
    id: 'L4.7-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'În ce fișier din `/var/log` cauți (dacă rsyslog este activ) încercările de autentificare SSH și folosirea `sudo`?',
    explanation: '`/var/log/secure` conține mesajele de autentificare și autorizare.',
    options: [
      { id: 'a', text: '`/var/log/secure`', correct: true, why: 'Pe RHEL aici sunt mesajele de securitate: ssh, sudo, su.' },
      { id: 'b', text: '`/var/log/cron`', correct: false, why: 'Conține mesajele serviciului cron.' },
      { id: 'c', text: '`/var/log/boot.log`', correct: false, why: 'Conține mesajele de la pornire.' },
      { id: 'd', text: '`/var/log/maillog`', correct: false, why: 'Conține mesajele serviciilor de poștă.' },
    ],
  },
  {
    id: 'L4.7-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Cum interpretezi această linie de jurnal?',
    explanation: 'Linia are formatul: oră, gazdă, proces[PID]: mesaj.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'journalctl', code: 'Nov 16 10:12:44 server1 sshd[4021]: Failed password for student from 192.0.2.50 port 51532 ssh2' },
    options: [
      { id: 'a', text: 'Serviciul sshd (PID 4021) de pe server1 a respins o parolă greșită a utilizatorului student, de la 192.0.2.50.', correct: true, why: 'Câmpurile sunt: data și ora, gazda, procesul cu PID, mesajul.' },
      { id: 'b', text: 'Utilizatorul student s-a autentificat cu succes.', correct: false, why: '„Failed password” înseamnă eșec.' },
      { id: 'c', text: 'Kernelul a oprit procesul 4021.', correct: false, why: 'Mesajul provine de la sshd, nu de la kernel.' },
      { id: 'd', text: 'Serverul server1 a ajuns la 192.0.2.50.', correct: false, why: '192.0.2.50 este adresa clientului care s-a conectat.' },
    ],
  },
  {
    id: 'L4.7-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei să urmărești în timp real mesajele noi ale serviciului `sshd`. Ce comandă folosești?',
    explanation: '`-f` (follow) afișează mesajele pe măsură ce apar; combinat cu `-u`, doar pentru acea unitate.',
    options: [
      { id: 'a', text: '`journalctl -u sshd -f`', correct: true, why: '`-f` urmărește, `-u` filtrează unitatea.' },
      { id: 'b', text: '`journalctl -u sshd -n`', correct: false, why: '`-n` afișează ultimele N linii și iese, fără urmărire.' },
      { id: 'c', text: '`journalctl -u sshd -r`', correct: false, why: '`-r` inversează ordinea (cele mai noi primele), fără urmărire.' },
      { id: 'd', text: '`journalctl -u sshd --since today`', correct: false, why: 'Limitează după timp, nu urmărește.' },
    ],
  },
  {
    id: 'L4.7-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Colegul vrea mesajele dintre 10:00 și 10:30 de azi, dar comanda nu merge. Ce nu este corect?',
    explanation: '`--since` și `--until` primesc date cu spații între ghilimele, de ex. `"2026-11-16 10:00"`.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[root@server1 ~]# journalctl --since 2026-11-16 10:00 --until 2026-11-16 10:30\nFailed to parse timestamp: 10:00' },
    options: [
      { id: 'a', text: 'Timpul conține spațiu și trebuie pus între ghilimele: `--since "2026-11-16 10:00"`.', correct: true, why: 'Fără ghilimele, `10:00` devine un argument separat.' },
      { id: 'b', text: 'Opțiunea corectă este `--from`.', correct: false, why: 'Nu există `--from`; sunt `--since` și `--until`.' },
      { id: 'c', text: 'Intervalele nu se pot folosi împreună.', correct: false, why: 'Se pot combina.' },
      { id: 'd', text: 'Trebuie `-b` în plus.', correct: false, why: '`-b` nu este obligatoriu pentru intervale de timp.' },
    ],
  },
  {
    id: 'L4.7-008', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre jurnal și fișierele din `/var/log` sunt adevărate? (alege toate cele corecte)',
    explanation: 'Jurnalul este binar (journalctl); fișierele text sunt scrise de rsyslog.',
    options: [
      { id: 'a', text: 'Jurnalul systemd este binar și se citește cu `journalctl`.', correct: true, why: 'Nu se deschide cu `less` direct.' },
      { id: 'b', text: 'Fișierele text din `/var/log` (messages, secure) sunt de regulă scrise de rsyslog.', correct: true, why: 'Se pot citi cu `less`, `grep`, `tail`.' },
      { id: 'c', text: '`tail -f /var/log/secure` urmărește live fișierul.', correct: true, why: '`-f` = follow.' },
      { id: 'd', text: 'Dacă jurnalul nu este persistent, `journalctl --list-boots` arată toate boot-urile din ultimul an.', correct: false, why: 'Fără persistență, sunt vizibile doar mesajele de la boot-ul curent.' },
    ],
  },
  {
    id: 'L4.7-009', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește opțiunea `journalctl` cu efectul ei.',
    explanation: 'Fiecare opțiune filtrează sau modifică afișarea jurnalului.',
    leftLabel: 'Opțiune', rightLabel: 'Efect',
    pairs: [
      { left: '`-b -1`', right: 'boot-ul anterior', why: 'Util după un crash sau reboot.' },
      { left: '`-u UNITATE`', right: 'doar mesajele unei unități', why: 'Ex. `-u sshd`.' },
      { left: '`-p warning`', right: 'doar warning și mai grave', why: 'Filtrare după prioritate.' },
      { left: '`-k`', right: 'doar mesajele kernelului', why: 'Echivalent cu dmesg, dar din jurnal.' },
    ],
    distractors: [{ text: 'șterge jurnalul', why: 'Ștergerea nu se face cu aceste opțiuni.' }],
  },
  {
    id: 'L4.7-010', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru depanarea unui serviciu care nu pornește.',
    explanation: 'Stare, jurnalul serviciului, erori, context, remediere și confirmare.',
    items: [
      { text: '`systemctl status SERVICIU`', why: 'Vezi starea și ultimele linii de jurnal.' },
      { text: '`journalctl -u SERVICIU -b`', why: 'Citești mesajele serviciului din boot-ul curent.' },
      { text: '`journalctl -u SERVICIU -p err`', why: 'Restrângi la erori.' },
      { text: 'Corectezi configurarea', why: 'Cauza apare de obicei în mesajele de eroare.' },
      { text: '`systemctl restart SERVICIU`', why: 'Repornești și confirmi că problema a dispărut.' },
    ],
  },
];
