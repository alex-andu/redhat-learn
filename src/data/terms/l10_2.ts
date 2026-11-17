import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'authorized-keys', abbr: 'authorized_keys', ro: 'fișierul de pe server cu cheile publice acceptate pentru un cont',
    what: 'Fiecare linie conține (opțional) opțiuni, tipul cheii, cheia base64 și un comentariu. sshd caută aici cheia oferită de client.',
    how: 'Implicit ~/.ssh/authorized_keys (și authorized_keys2), conform AuthorizedKeysFile din sshd_config(5). sshd îl ignoră dacă el, ~/.ssh sau home-ul sunt scriptibile de alții (StrictModes).',
    where: 'Autentificare cu chei; ssh-copy-id îl completează; permisiuni 600/700 și context ssh_home_t.',
    std: 'sshd(8)', topics: ['L10.2', 'L1.11'], aliases: ['authorized_keys2', 'AuthorizedKeysFile'],
  },
  {
    id: 'passphrase', abbr: 'frază-parolă', ro: 'parola opțională care criptează cheia privată pe disc',
    what: 'Dacă cineva îți fură fișierul cheii private, fără frază-parolă nu o poate folosi. Pierdută, nu se poate recupera: generezi o cheie nouă și redistribui cea publică.',
    how: 'Se pune la ssh-keygen (-N sau prompt) și se schimbă cu ssh-keygen -p. ssh o cere la folosirea cheii; ssh-agent o ține decriptată în memorie.',
    where: 'Chei personale reale; la automatizări (cron) se folosesc chei fără frază cu drepturi restrânse.',
    std: 'ssh-keygen(1)', topics: ['L10.2'], aliases: ['passphrase'],
  },
  {
    id: 'ssh-agent', abbr: 'ssh-agent', ro: 'procesul care ține cheile private decriptate în memorie',
    what: 'Semnează provocările SSH în numele tău, ca să nu tastezi fraza-parolă la fiecare conectare. ssh-add încarcă/listează/scoate cheile.',
    how: 'Comunică prin socketul Unix din SSH_AUTH_SOCK. Pornire în shell: eval "$(ssh-agent -s)". ssh-add -l listează, -d/-D scot, -t pune durată.',
    where: 'Conectări repetate cu chei protejate; nu persistă la reboot.',
    std: 'ssh-add(1)', topics: ['L10.2'], aliases: ['ssh-add', 'SSH_AUTH_SOCK'],
  },
  {
    id: 'strictmodes', abbr: 'StrictModes', ro: 'directiva sshd care respinge fișiere cu proprietar sau drepturi nesigure',
    what: 'Implicit yes: sshd verifică proprietarul și permisiunile home-ului, ale ~/.ssh și ale authorized_keys și le ignoră dacă pot fi scrise de alții.',
    how: 'Mesaj în jurnal: „Authentication refused: bad ownership or modes for directory …”. Remedierea corectă este repararea permisiunilor, nu StrictModes no.',
    where: 'Prima cauză a cheilor „care nu merg”.',
    std: 'sshd_config(5)', topics: ['L10.2'], aliases: ['bad ownership or modes'],
  },
];
