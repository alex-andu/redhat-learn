import type { Lab } from '../../lab/types';

export const LAB_L4_6: Lab = {
  id: 'lab-l4-6-tuned',
  lessonId: 'L4.6',
  title: 'Alege, activează și confirmă un profil tuned',
  modes: ['guided', 'independent'],
  objectives: ['C4-6'],
  difficulty: 1,
  estimatedMinutes: 25,
  scenario: [
    'Administrezi un server care trebuie să folosească profilul de reglaj recomandat pentru mediul lui. Asigură-te că serviciul `tuned` rulează și pornește la boot, află profilul recomandat, activează-l, apoi schimbă-l într-unul cu scop diferit (`throughput-performance`) și confirmă că alegerea persistă după reboot.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) pe o mașină de test, acces root/sudo.',
    'Pachetul `tuned` instalat (dacă lipsește: `dnf install tuned`, L2.2). Nu presupune că este activ.',
    'Notează profilul activ la început.',
  ],
  finalState: [
    'Serviciul `tuned` este activ și activat la boot; profilul `throughput-performance` este activ și rămâne activ după reboot.',
  ],
  criteria: [
    { id: 'ac1', text: 'Serviciul tuned este activ și activat la boot.', manualCheck: 'systemctl is-active tuned; systemctl is-enabled tuned' },
    { id: 'ac2', text: 'Ai aflat profilul recomandat și lista profilurilor.', manualCheck: 'tuned-adm recommend; tuned-adm list' },
    { id: 'ac3', text: 'Profilul activ este throughput-performance.', manualCheck: 'tuned-adm active' },
    { id: 'ac4', text: 'Fișierul active_profile conține profilul ales.', manualCheck: 'cat /etc/tuned/active_profile' },
    { id: 'ac5', text: 'După reboot, profilul rămâne activ.', manualCheck: 'tuned-adm active' },
    { id: 'ac6', text: 'Setările profilului sunt aplicate (verificare tuned).', manualCheck: 'tuned-adm verify' },
  ],
  steps: [
    {
      title: 'Pornește și activează serviciul tuned',
      purpose: 'tuned-adm vorbește cu daemonul; trebuie să ruleze, iar pentru persistență trebuie să pornească la boot.',
      hint: '`--now` combină `enable` cu `start`.',
      commands: 'systemctl status tuned\nsystemctl enable --now tuned\nsystemctl is-active tuned\nsystemctl is-enabled tuned',
      explain: [
        ['systemctl status tuned', 'arată starea serviciului (active/inactive/not found).'],
        ['enable --now tuned', 'enable = pornire la boot; --now = pornește imediat.'],
        ['is-active / is-enabled', 'răspuns de un cuvânt: active / enabled.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# systemctl enable --now tuned\n[root@server1 ~]# systemctl is-active tuned\nactive\n[root@server1 ~]# systemctl is-enabled tuned\nenabled', explain: 'Dacă serviciul nu există, instalează pachetul `tuned`. Mesajele la `enable` (crearea legăturii) pot apărea sau nu.' },
    },
    {
      title: 'Vezi profilurile, pe cel activ și recomandarea',
      purpose: 'Alegi informat, nu la întâmplare.',
      hint: 'Notează profilul activ înainte de schimbare.',
      commands: 'tuned-adm list\ntuned-adm active\ntuned-adm recommend',
      explain: [
        ['tuned-adm list', 'profilurile disponibile cu descrieri; marchează activul.'],
        ['tuned-adm active', 'profilul curent.'],
        ['tuned-adm recommend', 'profilul recomandat pentru acest sistem (nu îl activează).'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# tuned-adm active\nCurrent active profile: virtual-guest\n[root@server1 ~]# tuned-adm recommend\nvirtual-guest', explain: 'Pe o VM, valoarea tipică este `virtual-guest`; pe alt sistem poate fi `balanced` sau `throughput-performance`. Textul exact poate diferi.' },
      reflect: 'De ce ar alege tuned profiluri diferite pentru o mașină virtuală și pentru un server fizic?',
    },
    {
      title: 'Activează throughput-performance',
      purpose: 'Schimbi profilul și confirmi.',
      hint: 'Schimbarea se aplică imediat, fără reboot.',
      commands: 'tuned-adm profile throughput-performance\ntuned-adm active\ncat /etc/tuned/active_profile\ntuned-adm verify',
      explain: [
        ['tuned-adm profile throughput-performance', 'activează profilul (reglaje orientate pe debit).'],
        ['cat /etc/tuned/active_profile', 'fișierul în care tuned reține alegerea; asta o face persistentă.'],
        ['tuned-adm verify', 'compară setările profilului cu cele din sistem; raportează dacă s-a potrivit tot.'],
      ],
      output: { label: 'illustrative', code: '[root@server1 ~]# tuned-adm active\nCurrent active profile: throughput-performance\n[root@server1 ~]# cat /etc/tuned/active_profile\nthroughput-performance\n[root@server1 ~]# tuned-adm verify\nVerification succeeded, current system settings match the preset profile.\nSee TuneD log file (\'/var/log/tuned/tuned.log\') for details.', explain: 'Mesajul de la `verify` poate diferi; dacă apare „Verification failed”, un parametru a fost modificat de altceva după aplicare.' },
    },
    {
      title: 'Repornește și confirmă persistența',
      purpose: 'Dovedești că alegerea supraviețuiește.',
      hint: 'După boot, serviciul pornește și citește active_profile.',
      commands: 'systemctl reboot\n# după reconectare:\ntuned-adm active\nsystemctl is-enabled tuned',
      explain: [
        ['systemctl reboot', 'repornește (L4.1).'],
        ['tuned-adm active', 'trebuie să afișeze tot throughput-performance.'],
      ],
    },
    {
      title: 'Revino la profilul inițial (opțional)',
      purpose: 'Lași sistemul cum l-ai găsit.',
      hint: 'Folosește profilul notat la început.',
      commands: 'tuned-adm profile NUME_INIȚIAL\ntuned-adm active',
      explain: [
        ['NUME_INIȚIAL', 'înlocuiește cu profilul notat la început (de ex. virtual-guest).'],
      ],
    },
  ],
  verification: [
    { cmd: 'systemctl is-active tuned; systemctl is-enabled tuned', expected: 'active, apoi enabled' },
    { cmd: 'tuned-adm active', expected: 'Current active profile: throughput-performance' },
    { cmd: 'cat /etc/tuned/active_profile', expected: 'throughput-performance' },
    { cmd: 'tuned-adm verify', expected: 'mesaj de succes la verificare' },
  ],
  persistence: [
    'Profilul activ este reținut în `/etc/tuned/active_profile` și se aplică la fiecare pornire a serviciului.',
    'Serviciul trebuie să fie `enabled`; altfel, după reboot nu mai este aplicat niciun profil.',
    'Confirmare manuală: reboot, apoi `tuned-adm active`.',
  ],
  mistakes: [
    'Uitarea `enable --now` pentru serviciu (profilul nu se aplică după reboot).',
    'Confuzia `recommend` (sugerează) cu `profile` (activează).',
    'Scrierea greșită a numelui profilului.',
    'Presupunerea că un profil „de performanță” este potrivit oriunde (consum mai mare de energie).',
  ],
  troubleshooting: [
    { symptom: '`Cannot talk to TuneD daemon via DBus`', cause: 'serviciul tuned nu rulează', fix: '`systemctl enable --now tuned`.' },
    { symptom: '`Unit tuned.service not found`', cause: 'pachetul nu este instalat', fix: '`dnf install tuned` (L2.2).' },
    { symptom: 'profil necunoscut', cause: 'nume scris greșit', fix: '`tuned-adm list` și copiază numele exact.' },
    { symptom: '`tuned-adm verify` eșuează', cause: 'un parametru a fost schimbat după aplicare', fix: 'reaplică profilul: `tuned-adm profile NUME`; vezi `/var/log/tuned/tuned.log`.' },
  ],
  alternatives: [
    'Poți combina profiluri: `tuned-adm profile virtual-guest throughput-performance` (cel din urmă are prioritate la conflict).',
    'Poți crea un profil propriu în `/etc/tuned/NUME/tuned.conf`, cu `include=` către unul existent.',
    '`tuned-adm off` dezactivează reglajul.',
  ],
};
