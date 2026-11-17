import type { Question } from '../../lib/types';

const T = 'L2.3';
const O = ['C7-5'];

export const Q_L2_3: Question[] = [
  {
    id: 'L2.3-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este diferența dintre `dnf check-update` și `dnf upgrade`?',
    explanation: '`check-update` doar raportează; `upgrade` aplică actualizările.',
    options: [
      { id: 'a', text: '`check-update` listează actualizările disponibile fără să le instaleze; `upgrade` le instalează.', correct: true, why: 'Una informează, cealaltă modifică sistemul.' },
      { id: 'b', text: '`check-update` instalează doar actualizările de securitate.', correct: false, why: 'Nu instalează nimic.' },
      { id: 'c', text: 'Sunt identice.', correct: false, why: 'Una nu modifică sistemul, cealaltă da.' },
      { id: 'd', text: '`upgrade` funcționează doar pentru kernel.', correct: false, why: 'Actualizează orice pachet instalat pentru care există o versiune nouă.' },
    ],
  },
  {
    id: 'L2.3-002', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'După `dnf check-update`, `echo $?` afișează `100`. Ce înseamnă?',
    explanation: 'Codul 100 este rezervat pentru „există actualizări”; 0 = nu există; 1 = eroare.',
    options: [
      { id: 'a', text: 'Există cel puțin o actualizare disponibilă.', correct: true, why: 'Comportament documentat; util în scripturi.' },
      { id: 'b', text: 'Comanda a eșuat.', correct: false, why: 'Eșecul este indicat prin 1.' },
      { id: 'c', text: 'Nu există nicio actualizare.', correct: false, why: 'Acest caz returnează 0.' },
      { id: 'd', text: 'Au fost actualizate 100 de pachete.', correct: false, why: 'Valoarea nu numără pachete.' },
    ],
  },
  {
    id: 'L2.3-003', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Din ce surse poate instala pachete `dnf`, conform obiectivului? (alege toate cele corecte)',
    explanation: 'Obiectivul menționează CDN-ul Red Hat, un repository remote și sistemul local.',
    options: [
      { id: 'a', text: 'Red Hat Content Delivery Network (sistem înregistrat).', correct: true, why: 'Sursa oficială a pachetelor RHEL.' },
      { id: 'b', text: 'Un repository remote definit printr-un `baseurl` https.', correct: true, why: 'De exemplu un server intern.' },
      { id: 'c', text: 'Un fișier `.rpm` din sistemul local, cu `dnf install ./fișier.rpm`.', correct: true, why: 'Dependențele se aduc din repository-uri.' },
      { id: 'd', text: 'Direct din memoria RAM a altui proces.', correct: false, why: 'Nu este o sursă de pachete.' },
    ],
  },
  {
    id: 'L2.3-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Actualizează DOAR pachetul `openssl`, fără a actualiza restul sistemului.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo dnf upgrade openssl', 'sudo dnf update openssl', 'sudo dnf -y upgrade openssl', 'sudo dnf upgrade -y openssl'],
    canonical: 'sudo dnf upgrade openssl',
    explanation: '`dnf upgrade NUME` actualizează numai pachetul indicat (și dependențele necesare).',
    wrong: [
      { text: 'sudo dnf upgrade', why: 'Fără nume, actualizează TOATE pachetele.' },
      { text: 'sudo dnf check-update openssl', why: 'Doar verifică; nu aplică actualizarea.' },
      { text: 'sudo dnf install openssl', why: 'Pe un pachet deja instalat nu este forma standard pentru actualizare.' },
    ],
    hint: 'Subcomanda este upgrade, urmată de numele pachetului.',
  },
  {
    id: 'L2.3-005', topicId: T, objectives: O, difficulty: 2, type: 'order',
    stem: 'Ordonează pașii pentru o actualizare responsabilă, inclusiv a kernelului.',
    explanation: 'Verifici, aplici, confirmi pachetele, apoi activezi kernelul cu reboot și confirmi.',
    items: [
      { text: '`sudo dnf check-update`', why: 'Vezi ce se poate actualiza, fără modificări.' },
      { text: '`sudo dnf upgrade`', why: 'Aplici, după ce ai citit lista.' },
      { text: '`rpm -q kernel` și `uname -r`', why: 'Compari kernelul instalat cu cel în execuție.' },
      { text: '`sudo reboot`', why: 'Noul kernel este folosit doar după repornire.' },
      { text: '`uname -r`', why: 'Confirmi că rulează kernelul nou.' },
    ],
  },
  {
    id: 'L2.3-006', topicId: T, objectives: O, difficulty: 1, type: 'match',
    stem: 'Potrivește comanda cu scopul.',
    explanation: 'Comenzi pentru surse și actualizări.',
    leftLabel: 'Comandă', rightLabel: 'Scop',
    pairs: [
      { left: '`subscription-manager status`', right: 'arată starea înregistrării', why: 'Accesul la CDN depinde de înregistrare.' },
      { left: '`dnf install ./f.rpm`', right: 'instalare dintr-un fișier local', why: '`./` arată că este un fișier, nu un nume din repository.' },
      { left: '`dnf install --repo=ID X`', right: 'instalare folosind doar un anumit repository', why: '`--repo` dezactivează celelalte pentru comandă.' },
      { left: '`uname -r`', right: 'kernelul care rulează acum', why: 'Poate diferi de ce este instalat.' },
      { left: '`dnf downgrade X`', right: 'revine la o versiune anterioară a pachetului', why: 'Doar dacă versiunea veche este disponibilă într-un repository.' },
    ],
    distractors: [{ text: 'creează un repository local', why: 'Aceasta este `createrepo_c` (L2.1).' }],
  },
  {
    id: 'L2.3-007', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Ai actualizat kernelul acum o oră, dar o aplicație cere „kernelul nou”. Ce explică situația?',
    explanation: 'Kernelul instalat este mai nou decât cel în execuție; este necesar un reboot.',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[student@server1 ~]$ uname -r\n6.12.0-55.el10.x86_64\n[student@server1 ~]$ rpm -q kernel\nkernel-6.12.0-55.el10.x86_64\nkernel-6.12.0-61.el10.x86_64' },
    options: [
      { id: 'a', text: 'Kernelul nou este instalat, dar sistemul încă rulează pe cel vechi; trebuie reboot.', correct: true, why: '`uname -r` arată versiunea în execuție (55), `rpm -q kernel` arată și versiunea 61 instalată.' },
      { id: 'b', text: 'Actualizarea a eșuat, deoarece există două kerneluri.', correct: false, why: 'Mai multe versiuni de kernel instalate sunt normale (`installonly_limit`).' },
      { id: 'c', text: 'Trebuie rulat `dnf clean all`.', correct: false, why: 'Cache-ul nu influențează kernelul în execuție.' },
      { id: 'd', text: 'Trebuie `systemctl restart kernel`.', correct: false, why: 'Kernelul nu este un serviciu; schimbarea cere repornirea sistemului.' },
    ],
  },
  {
    id: 'L2.3-008', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rulezi comanda de mai jos și primești eroarea. Care este remedierea corectă?',
    explanation: 'Un RPM local se indică printr-o cale; fără `./` dnf îl caută ca nume de pachet.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[student@server1 ~]$ ls\nutilitar-1.0-1.noarch.rpm\n[student@server1 ~]$ sudo dnf install utilitar-1.0-1.noarch.rpm\nNo match for argument: utilitar-1.0-1.noarch.rpm' },
    options: [
      { id: 'a', text: '`sudo dnf install ./utilitar-1.0-1.noarch.rpm`', correct: true, why: 'Calea spune că este un fișier local.' },
      { id: 'b', text: '`sudo subscription-manager register`', correct: false, why: 'Înregistrarea nu influențează căutarea unui fișier local.' },
      { id: 'c', text: '`sudo dnf upgrade`', correct: false, why: 'Nu instalează fișierul tău.' },
      { id: 'd', text: '`sudo dnf check-update utilitar`', correct: false, why: 'Nu instalează nimic.' },
    ],
  },
];
