import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'password-hash', abbr: 'hash de parolă', full: 'password hash', ro: 'rezultatul unei funcții într-un singur sens, calculat din parolă și o sare',
    what: 'Sistemul stochează hash-ul, nu parola. La login, calculează hash-ul parolei introduse și îl compară cu cel din /etc/shadow.',
    how: 'Format $id$sare$hash; id-ul indică algoritmul (ex. $6$ = SHA-512). Sarea aleatoare face ca două parole identice să dea hash-uri diferite.',
    where: '/etc/shadow, câmpul 2.',
    topics: ['L9.2'], aliases: ['hash', 'salt', 'sare', 'crypt'],
  },
  {
    id: 'password-aging', abbr: 'password aging', ro: 'regulile de timp ale unei parole și ale unui cont (minim, maxim, avertizare, inactivitate, expirare)',
    what: 'Obligă schimbarea periodică a parolei și dezactivarea conturilor abandonate sau temporare.',
    how: 'Datele stau în câmpurile 3–8 din /etc/shadow, în zile de la 1970-01-01. Valorile implicite pentru conturi noi: PASS_* din /etc/login.defs (doar la creare).',
    where: 'chage -l, passwd -S; cerințe de politică de securitate.',
    topics: ['L9.2'], aliases: ['aging', 'expirare parolă', 'password expiry'],
  },
  {
    id: 'chage', abbr: 'chage', full: 'change age', ro: 'comanda care afișează și modifică datele de aging ale unui cont',
    what: 'Opțiuni: -l (listare), -d (ultima schimbare; 0 = forțează schimbarea), -m/-M (minim/maxim), -W (avertizare), -I (inactivitate), -E (expirarea contului).',
    how: 'Scrie în câmpurile corespunzătoare din /etc/shadow. Fără opțiuni, intră în mod interactiv. Valoarea -1 elimină limita.',
    where: 'Examen: „force password change”, „set maximum password age”, „account expires on …”.',
    std: 'chage(1)', topics: ['L9.2'], aliases: ['chage -l'],
  },
  {
    id: 'passwd-cmd', abbr: 'passwd', ro: 'comanda care schimbă parola și gestionează blocarea și regulile ei',
    what: 'Fără argument schimbă parola ta; ca root, a oricui. Opțiuni: -l/-u (lock/unlock), -e (expiră), -S (status), -n/-x/-w/-i (aging), --stdin (parola din stdin pe RHEL).',
    how: 'Verifică parola veche (pentru utilizatori obișnuiți) și calitatea noii parole prin PAM, apoi scrie hash-ul în /etc/shadow.',
    where: 'După useradd, pentru a activa contul; resetarea parolelor uitate.',
    std: 'passwd(1)', topics: ['L9.2'], aliases: ['chpasswd', 'passwd -S'],
  },
  {
    id: 'account-lock', abbr: 'blocarea parolei', full: 'password lock', ro: 'prefixarea hash-ului cu ! astfel încât parola să nu mai poată fi potrivită',
    what: 'Oprește autentificarea cu parolă, dar NU dezactivează contul: cheile SSH și alte metode pot funcționa. Pentru dezactivare completă se adaugă expirarea contului.',
    how: 'passwd -l / usermod -L adaugă !; passwd -u / usermod -U îl elimină. Dezactivare totală: usermod -L -e 1.',
    where: 'Suspendarea temporară a unui utilizator; pregătirea pentru ștergere.',
    topics: ['L9.2'], aliases: ['lock', 'locked account', 'cont blocat'],
  },
  {
    id: 'account-expiry', abbr: 'expirarea contului', full: 'account expiration', ro: 'data după care contul nu mai este valid, independent de parolă',
    what: 'Se setează cu chage -E sau usermod -e (YYYY-MM-DD); -1 elimină expirarea. Diferă de expirarea parolei (-M).',
    how: 'Câmpul 8 din /etc/shadow, în zile de la 1970-01-01. PAM refuză autentificarea după această dată.',
    where: 'Conturi temporare (contractori); dezactivarea imediată cu data 1.',
    topics: ['L9.2'], aliases: ['account expires', 'expire date'],
  },
];
