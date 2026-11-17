import type { Question } from '../../lib/types';

const T = 'L4.6';
const O = ['C4-6'];

export const Q_L4_6: Question[] = [
  {
    id: 'L4.6-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Ce face serviciul [[tuned]]?',
    explanation: 'tuned aplică profiluri de reglaj (kernel, disc, CPU, putere) în funcție de profilul ales.',
    options: [
      { id: 'a', text: 'Aplică un profil de reglaj de sistem (performanță, latență, economie de energie).', correct: true, why: 'Acesta este rolul lui; se controlează cu `tuned-adm`.' },
      { id: 'b', text: 'Sincronizează ora sistemului.', correct: false, why: 'Ora este gestionată de chrony (C7).' },
      { id: 'c', text: 'Gestionează regulile de firewall.', correct: false, why: 'Firewall-ul este firewalld (C8/C10).' },
      { id: 'd', text: 'Face copii de siguranță ale configurațiilor.', correct: false, why: 'tuned nu face backup.' },
    ],
  },
  {
    id: 'L4.6-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Afișează profilul tuned activ.',
    prompt: '[root@server1 ~]#',
    answers: ['tuned-adm active'],
    canonical: 'tuned-adm active',
    explanation: '`tuned-adm active` afișează profilul curent.',
    wrong: [
      { text: 'tuned-adm list', why: '`list` arată toate profilurile disponibile (și marchează activul), nu răspunde direct și scurt.' },
      { text: 'tuned-adm recommend', why: '`recommend` sugerează un profil potrivit mediului; nu îl arată pe cel activ.' },
      { text: 'systemctl status tuned', why: 'Arată starea serviciului, nu profilul activ.' },
    ],
  },
  {
    id: 'L4.6-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Activează profilul `throughput-performance`.',
    prompt: '[root@server1 ~]#',
    answers: ['tuned-adm profile throughput-performance'],
    canonical: 'tuned-adm profile throughput-performance',
    explanation: '`tuned-adm profile NUME` schimbă profilul; alegerea persistă la reboot.',
    wrong: [
      { text: 'tuned-adm set throughput-performance', why: 'Nu există subcomanda `set`; se folosește `profile`.' },
      { text: 'tuned-adm throughput-performance', why: 'Lipsește subcomanda `profile`.' },
      { text: 'tuned-adm recommend', why: '`recommend` doar sugerează un profil, nu îl activează.' },
    ],
  },
  {
    id: 'L4.6-004', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce înseamnă această ieșire?',
    explanation: '`tuned-adm recommend` alege profilul potrivit mediului (aici, o mașină virtuală).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'sesiune', code: '[root@server1 ~]# tuned-adm recommend\nvirtual-guest' },
    options: [
      { id: 'a', text: 'tuned sugerează `virtual-guest`, potrivit pentru o mașină virtuală; profilul NU a fost activat.', correct: true, why: '`recommend` doar sugerează.' },
      { id: 'b', text: 'Profilul `virtual-guest` este acum activ.', correct: false, why: 'Activarea se face cu `tuned-adm profile virtual-guest`.' },
      { id: 'c', text: 'Serviciul tuned este oprit.', correct: false, why: 'Recomandarea nu spune nimic despre starea serviciului.' },
      { id: 'd', text: 'Sistemul este un server fizic.', correct: false, why: '`virtual-guest` este recomandat pentru mașini virtuale.' },
    ],
  },
  {
    id: 'L4.6-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Rulezi `tuned-adm profile powersave` și apare o eroare că nu se poate contacta daemonul. Ce verifici?',
    explanation: '`tuned-adm` comunică cu serviciul; dacă acesta nu rulează, comenzile eșuează.',
    snippet: { kind: 'find-error', title: 'sesiune', code: '[root@server1 ~]# tuned-adm profile powersave\nCannot talk to TuneD daemon via DBus. Is TuneD daemon running?' },
    options: [
      { id: 'a', text: '`systemctl status tuned`, apoi `systemctl enable --now tuned`.', correct: true, why: 'Pornești serviciul și îl activezi la boot; apoi repeți comanda.' },
      { id: 'b', text: '`systemctl isolate rescue.target`', correct: false, why: 'Rescue nu are legătură cu tuned.' },
      { id: 'c', text: '`kill -9 1`', correct: false, why: 'PID 1 este systemd; nu se oprește.' },
      { id: 'd', text: 'Profilul `powersave` nu există și trebuie creat.', correct: false, why: 'Mesajul este despre daemon, nu despre profil.' },
    ],
  },
  {
    id: 'L4.6-006', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care afirmații despre profilurile tuned sunt adevărate? (alege toate cele corecte)',
    explanation: 'Profilurile sunt directoare cu tuned.conf; cel activ este reținut și persistă.',
    options: [
      { id: 'a', text: 'Profilurile furnizate de pachete sunt în `/usr/lib/tuned/`.', correct: true, why: 'Profilurile proprii se pun în `/etc/tuned/`.' },
      { id: 'b', text: 'Profilul activ este reținut în `/etc/tuned/active_profile` și supraviețuiește la reboot.', correct: true, why: 'Serviciul îl citește la pornire.' },
      { id: 'c', text: '`tuned-adm profile A B` poate combina două profiluri.', correct: true, why: 'Setările se îmbină; la conflict, cele din ultimul au prioritate.' },
      { id: 'd', text: 'Schimbarea profilului cere reboot.', correct: false, why: 'Se aplică imediat, fără reboot.' },
    ],
  },
  {
    id: 'L4.6-007', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru a alege și aplica un profil potrivit.',
    explanation: 'Pornești serviciul, vezi ce există, ceri recomandarea, activezi, confirmi.',
    items: [
      { text: '`systemctl enable --now tuned`', why: 'tuned-adm are nevoie de daemon.' },
      { text: '`tuned-adm list`', why: 'Vezi profilurile disponibile.' },
      { text: '`tuned-adm recommend`', why: 'Afli ce profil se potrivește mediului.' },
      { text: '`tuned-adm profile NUME`', why: 'Activezi profilul ales.' },
      { text: '`tuned-adm active`', why: 'Confirmi că este activ.' },
    ],
  },
  {
    id: 'L4.6-008', topicId: T, objectives: O, difficulty: 2, type: 'match',
    stem: 'Potrivește subcomanda `tuned-adm` cu efectul ei.',
    explanation: '`tuned-adm` are subcomenzi pentru listare, activare, recomandare și verificare.',
    leftLabel: 'Subcomandă', rightLabel: 'Efect',
    pairs: [
      { left: '`tuned-adm list`', right: 'listează profilurile disponibile', why: 'Marchează și profilul activ.' },
      { left: '`tuned-adm profile NUME`', right: 'activează profilul', why: 'Persistă la reboot.' },
      { left: '`tuned-adm recommend`', right: 'sugerează profilul potrivit sistemului', why: 'Nu îl activează.' },
      { left: '`tuned-adm off`', right: 'dezactivează reglajul tuned', why: 'Sistemul rămâne cu setările implicite ale kernelului.' },
    ],
    distractors: [{ text: 'instalează kernelul nou', why: 'tuned nu instalează pachete.' }],
  },
];
