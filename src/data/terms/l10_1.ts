import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'login-defs', abbr: '/etc/login.defs', ro: 'fișierul cu valorile implicite pentru conturi: UMASK, HOME_MODE, UID-uri, parole',
    what: 'Conține directive precum UMASK (masca de creare a fișierelor; implicit 022 dacă lipsește), HOME_MODE (modul noilor home-uri), USERGROUPS_ENAB (grup privat la useradd), PASS_MAX_DAYS etc.',
    how: 'Citit de useradd, newusers și, pentru UMASK, de modulul PAM pam_umask. Pagina login.defs(5) avertizează că multe funcții au trecut la PAM.',
    where: 'Valori implicite pentru conturi noi; test obligatoriu cu un login real după modificare.',
    std: 'login.defs(5)', topics: ['L10.1', 'L9.1', 'L9.2'], aliases: ['UMASK', 'HOME_MODE', 'USERGROUPS_ENAB'],
  },
  {
    id: 'pam-umask', abbr: 'pam_umask', ro: 'modulul PAM care setează umask-ul sesiunii de login',
    what: 'Setează masca din (în ordine): câmpul GECOS (umask=), argumentul umask= al modulului, UMASK din /etc/login.defs, UMASK= din /etc/default/login. Opțiunea usergroups copiază biții proprietarului în biții grupului pentru utilizatorii cu nume = grup primar (022 devine 002).',
    how: 'Apare ca linie „session optional pam_umask.so” în fișierele din /etc/pam.d (prezența pe RHEL 10 de confirmat). Dacă lipsește, UMASK din login.defs nu se aplică sesiunilor de login prin acest modul.',
    where: 'Explică de ce UMASK din login.defs „nu are efect” sau de ce utilizatorii obișnuiți au 002.',
    std: 'pam_umask(8)', topics: ['L10.1'], aliases: ['usergroups', 'pam_umask.so'],
  },
];
