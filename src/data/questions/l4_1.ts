import type { Question } from '../../lib/types';

const T = 'L4.1';
const O = ['C4-1'];

export const Q_L4_1: Question[] = [
  {
    id: 'L4.1-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este ordinea corectă a etapelor de boot pe un sistem RHEL?',
    explanation: 'Firmware → bootloader → kernel + initramfs → systemd → target implicit.',
    options: [
      { id: 'a', text: 'Firmware (UEFI/BIOS) → GRUB2 → kernel + initramfs → systemd (PID 1) → target-ul implicit', correct: true, why: 'Fiecare etapă pornește următoarea; systemd este ultimul, cel care aduce serviciile sus.' },
      { id: 'b', text: 'GRUB2 → firmware → systemd → kernel', correct: false, why: 'Firmware-ul rulează primul (el găsește bootloader-ul), iar kernelul pornește systemd, nu invers.' },
      { id: 'c', text: 'Kernel → firmware → GRUB2 → systemd', correct: false, why: 'Kernelul nu poate porni fără bootloader care să îl încarce în memorie.' },
      { id: 'd', text: 'systemd → kernel → GRUB2 → firmware', correct: false, why: 'systemd este PID 1, deci pornit de kernel; nu poate veni primul.' },
    ],
  },
  {
    id: 'L4.1-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Repornește imediat sistemul folosind systemctl.',
    prompt: '[root@server1 ~]#',
    answers: ['systemctl reboot'],
    canonical: 'systemctl reboot',
    explanation: '`systemctl reboot` cere systemd o repornire ordonată: oprește serviciile, demontează sistemele de fișiere, apoi repornește.',
    wrong: [
      { text: 'systemctl restart', why: '`restart` se aplică unei unități (ex. `systemctl restart sshd`), nu sistemului.' },
      { text: 'systemctl poweroff', why: 'Oprește și stinge sistemul; nu îl repornește.' },
      { text: 'systemctl halt', why: 'Oprește sistemul, nu îl repornește.' },
    ],
    hint: 'Acțiunea se numește ca scopul: reboot.',
  },
  {
    id: 'L4.1-003', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Vrei să repornești sistemul peste 10 minute și să anunți utilizatorii conectați. Ce rulezi?',
    explanation: '`shutdown -r +10 "mesaj"`: -r = reboot, +10 = peste 10 minute, restul = mesajul trimis tuturor.',
    options: [
      { id: 'a', text: '`shutdown -r +10 "Reboot pentru actualizare"`', correct: true, why: '-r repornește; +10 programează peste 10 minute; mesajul se afișează utilizatorilor.' },
      { id: 'b', text: '`shutdown -h +10 "Reboot pentru actualizare"`', correct: false, why: '-h oprește sistemul, nu îl repornește, indiferent de textul mesajului.' },
      { id: 'c', text: '`shutdown -r 10 "Reboot pentru actualizare"`', correct: false, why: 'Un număr simplu nu este o oră validă; formele corecte sunt `now`, `+minute` sau `hh:mm`.' },
      { id: 'd', text: '`reboot +10`', correct: false, why: '`reboot` nu are argument de timp; programarea cu întârziere este rolul lui `shutdown`.' },
    ],
  },
  {
    id: 'L4.1-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai programat din greșeală o oprire. Cum o anulezi?',
    explanation: 'Un shutdown programat se anulează cu `shutdown -c` înainte să expire.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# shutdown -P +30\nShutdown scheduled for Mon 2026-11-16 15:30:00 UTC, use \'shutdown -c\' to cancel.' },
    options: [
      { id: 'a', text: '`shutdown -c`', correct: true, why: 'Mesajul chiar spune asta: -c anulează oprirea programată.' },
      { id: 'b', text: '`shutdown -k`', correct: false, why: '`-k` doar trimite avertismentul („de probă”), fără oprire; nu anulează o programare existentă.' },
      { id: 'c', text: '`systemctl reboot`', correct: false, why: 'Ar reporni imediat sistemul, nu ar anula nimic.' },
      { id: 'd', text: 'Nu se poate anula; trebuie așteptat.', correct: false, why: 'Se poate anula oricând până la expirare.' },
    ],
  },
  {
    id: 'L4.1-005', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care comenzi oprește sistemul și, de regulă, îi taie și alimentarea? (alege toate cele corecte)',
    explanation: '`poweroff` și `shutdown -P` (precum și `shutdown now`, fără alte opțiuni, în systemd) opresc și alimentarea; `halt` oprește sistemul fără neapărat să taie alimentarea.',
    options: [
      { id: 'a', text: '`systemctl poweroff`', correct: true, why: 'Acțiunea „poweroff” înseamnă oprire completă.' },
      { id: 'b', text: '`shutdown -P now`', correct: true, why: '`-P` = power off.' },
      { id: 'c', text: '`systemctl reboot`', correct: false, why: 'Repornește, nu oprește.' },
      { id: 'd', text: '`systemctl halt`', correct: false, why: '„Halt” oprește sistemul de operare, dar nu garantează tăierea alimentării.' },
    ],
  },
  {
    id: 'L4.1-006', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează etapele de pornire a sistemului.',
    explanation: 'Fiecare etapă încarcă și pornește următoarea.',
    items: [
      { text: 'Firmware (UEFI/BIOS) testează hardware-ul', why: 'Este prima etapă, înainte de orice software al sistemului de operare.' },
      { text: 'GRUB2 afișează meniul și încarcă kernelul', why: 'Firmware-ul găsește și pornește bootloader-ul.' },
      { text: 'Kernelul și initramfs montează rădăcina', why: 'Kernelul are nevoie de drivere (din initramfs) ca să acceseze discul.' },
      { text: 'systemd (PID 1) pornește unitățile target-ului implicit', why: 'Ultima etapă: servicii, sisteme de fișiere, login.' },
    ],
  },
  {
    id: 'L4.1-007', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce arată această comandă?',
    explanation: '`who -b` afișează momentul ultimei porniri a sistemului.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ who -b\n         system boot  2026-11-16 08:12' },
    options: [
      { id: 'a', text: 'Data și ora ultimei porniri a sistemului.', correct: true, why: '`-b` = boot time; este un mod rapid de a confirma că un reboot a avut loc.' },
      { id: 'b', text: 'Ora la care s-a conectat utilizatorul curent.', correct: false, why: 'Pentru asta ar fi `who` fără opțiuni sau `w`.' },
      { id: 'c', text: 'Data programată pentru următorul reboot.', correct: false, why: '`who -b` nu citește programarea `shutdown`.' },
      { id: 'd', text: 'Versiunea kernelului pornit.', correct: false, why: 'Versiunea se vede cu `uname -r`.' },
    ],
  },
  {
    id: 'L4.1-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Colegul rulează `shutdown -h +3` și a doua zi spune că „nimeni nu s-a mai putut conecta prin SSH în acele 3 minute”. De ce?',
    explanation: 'Când mai sunt cel mult 5 minute până la oprire, `shutdown` creează `/run/nologin`, care blochează conectările noi ale utilizatorilor obișnuiți.',
    snippet: { kind: 'find-error', title: 'comandă', code: '[root@server1 ~]# shutdown -h +3' },
    options: [
      { id: 'a', text: 'Cu mai puțin de 5 minute rămase, `shutdown` creează `/run/nologin` și refuză conectările noi.', correct: true, why: 'Este comportamentul documentat în shutdown(8); dispare la anulare (`shutdown -c`) sau la reboot.' },
      { id: 'b', text: '`-h` oprește imediat serviciul sshd.', correct: false, why: 'sshd continuă să ruleze; conectarea este refuzată de mecanismul nologin.' },
      { id: 'c', text: 'Firewall-ul se activează automat la `shutdown`.', correct: false, why: '`shutdown` nu modifică firewall-ul.' },
      { id: 'd', text: '`+3` înseamnă „doar 3 conexiuni permise”.', correct: false, why: '`+3` este o întârziere în minute.' },
    ],
  },
  {
    id: 'L4.1-009', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește comanda cu efectul ei.',
    explanation: 'Verbul din comandă arată scopul: repornire, oprire, anulare, doar avertizare.',
    leftLabel: 'Comandă', rightLabel: 'Efect',
    pairs: [
      { left: '`systemctl reboot`', right: 'repornește sistemul ordonat', why: 'Oprește serviciile, apoi repornește.' },
      { left: '`systemctl poweroff`', right: 'oprește sistemul și alimentarea', why: 'Echivalent cu `poweroff`.' },
      { left: '`shutdown -c`', right: 'anulează o oprire programată', why: '`c` = cancel.' },
      { left: '`shutdown -k +5`', right: 'trimite doar avertismentul, fără oprire', why: '`-k` = „kidding”: doar mesajul, nimic nu se oprește.' },
    ],
    distractors: [{ text: 'șterge jurnalele sistemului', why: 'Nicio comandă de aici nu atinge jurnalele.' }],
  },
];
