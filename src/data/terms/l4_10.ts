import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'rsync', abbr: 'rsync', ro: 'sincronizează fișiere între locații, copiind doar diferențele',
    what: 'rsync -av sursă/ destinație/ copiază ce lipsește sau s-a schimbat și păstrează permisiuni, timpi și legături. Poate lucra local sau peste SSH (utilizator@gazdă:cale).',
    how: 'Compară sursa cu destinația (mărime și timp de modificare, implicit) și trimite doar diferențele; opțiunea -n (dry-run) arată ce s-ar întâmpla fără să facă nimic; --delete șterge la destinație ce lipsește la sursă. Slash-ul final al sursei schimbă rezultatul.',
    where: 'Copii de siguranță incrementale, sincronizarea directoarelor între servere, transferuri mari care pot fi reluate.',
    topics: ['L4.10'],
  },
  {
    id: 'sftp-session', abbr: 'sftp (sesiune interactivă)', ro: 'transfer de fișiere interactiv, peste SSH, cu comenzi get și put',
    what: 'sftp utilizator@gazdă deschide un prompt sftp>; cu get descarci, cu put încarci, cu ls, cd, lcd navighezi (cd = remote, lcd = local), cu bye ieși.',
    how: 'Folosește subsistemul SFTP al lui sshd, deci aceeași autentificare și criptare ca SSH. Nu se confundă cu FTP (neprotejat) sau FTPS.',
    where: 'Când vrei să răsfoiești directoare remote înainte de a alege ce transferi.',
    topics: ['L4.10', 'L1.11'], aliases: ['SFTP'],
  },
  {
    id: 'trailing-slash', abbr: 'slash final (rsync)', ro: 'slash-ul de la sfârșitul sursei schimbă ce se copiază',
    what: 'rsync -a dir /dest copiază directorul dir ÎN /dest (rezultă /dest/dir). rsync -a dir/ /dest copiază CONȚINUTUL lui dir direct în /dest.',
    how: 'Slash-ul final al sursei înseamnă „ce este în interior”; la destinație nu schimbă semnificația. scp nu are această distincție.',
    where: 'Cea mai frecventă greșitură rsync: directoare imbricate neintenționat sau, cu --delete, ștergerea fișierelor greșite.',
    topics: ['L4.10'],
  },
];
