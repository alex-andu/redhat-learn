import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'cron', abbr: 'cron', ro: 'serviciul care rulează periodic comenzi la momente programate',
    what: 'Daemon (crond, din pachetul cronie) care, în fiecare minut, compară ora curentă cu liniile din tabelele cron și pornește comenzile care se potrivesc.',
    how: 'Citește /var/spool/cron/<utilizator>, /etc/crontab și /etc/cron.d/*; rulează comanda cu utilizatorul proprietar, într-un mediu redus, fără terminal. Detectează singur modificările tabelelor (cron(8)).',
    where: 'Copii de siguranță nocturne, curățări, rapoarte; sarcini repetitive în general.',
    topics: ['L7.1'], aliases: ['crond', 'cronie', 'cron job'],
  },
  {
    id: 'crontab', abbr: 'crontab', ro: 'tabela de programări cron a unui utilizator și comanda care o editează',
    what: 'Fișier cu linii „minut oră zi-lună lună zi-săptămână comandă” (și variabile NUME=valoare); comanda crontab îl instalează pentru utilizator.',
    how: 'crontab -e editează, -l listează, -r șterge (fără confirmare; -i cere confirmare), -u utilizator (root). Sintaxa e descrisă în crontab(5).',
    where: 'Tabela personală (crontab -e); tabele de sistem în /etc/crontab și /etc/cron.d, cu un câmp suplimentar de utilizator.',
    topics: ['L7.1'], aliases: ['crontab -e', 'tabelă cron'],
  },
  {
    id: 'cron-expression', abbr: 'expresie cron', ro: 'cele cinci câmpuri de timp dintr-o linie cron',
    what: 'Minut (0–59), oră (0–23), zi din lună (1–31), lună (1–12), zi din săptămână (0–7); fiecare acceptă *, liste (,), intervale (-) și pași (/n).',
    how: 'Dacă zi-lună și zi-săptămână sunt ambele restricționate, job-ul rulează când se potrivește oricare (SAU). Șirurile @daily, @weekly, @reboot etc. înlocuiesc cele cinci câmpuri.',
    where: '30 2 * * * = zilnic la 02:30; */15 8-17 * * mon-fri = din 15 în 15 minute, în orele de lucru.',
    topics: ['L7.1'], aliases: ['câmpurile cron', '@daily', '@reboot'],
  },
  {
    id: 'anacron', abbr: 'anacron', ro: 'planificator care recuperează job-urile ratate pe mașini care nu rulează non-stop',
    what: 'Lucrează cu perioade în zile (nu cu ore exacte) și rulează la pornire ce nu a rulat în perioada cuvenită.',
    how: 'Configurare în /etc/anacrontab: perioadă-zile, întârziere-minute, identificator, comandă (anacrontab(5)). Pe RHEL rulează scripturile din cron.daily/weekly/monthly.',
    where: 'Laptopuri, stații și mașini virtuale care sunt oprite noaptea.',
    topics: ['L7.1'], aliases: ['/etc/anacrontab', 'cron.daily'],
  },
  {
    id: 'at-job', abbr: 'at', ro: 'comanda care programează o execuție UNICĂ la un moment viitor',
    what: 'at citește comenzile de la stdin (sau din -f fișier) și le salvează, cu mediul curent, într-un job executat o singură dată de atd.',
    how: 'Timp: HH:MM, noon, midnight, teatime, now + N minutes/hours/days/weeks, plus date. atq listează, atrm șterge, at -c N afișează, batch rulează la încărcare mică (at(1)).',
    where: 'Mentenanță unică (repornire peste o oră, ștergere programată), memento-uri tehnice.',
    topics: ['L7.1'], aliases: ['atq', 'atrm', 'batch'],
  },
  {
    id: 'atd', abbr: 'atd', ro: 'daemonul care execută job-urile at',
    what: 'Serviciu din pachetul at; ține coada din /var/spool/atd și pornește job-urile la ora lor.',
    how: 'Se pornește cu systemctl enable --now atd. Fără el, job-urile rămân în coadă fără să ruleze.',
    where: 'Obligatoriu pornit pentru at și batch.',
    topics: ['L7.1'], aliases: ['atd.service'],
  },
  {
    id: 'cron-access', abbr: 'cron.allow/deny', ro: 'fișierele care controlează cine poate folosi crontab (analog at.allow/at.deny pentru at)',
    what: 'Dacă /etc/cron.allow există, doar utilizatorii listați pot folosi crontab; altfel contează /etc/cron.deny (cei listați sunt blocați); dacă nu există niciunul, doar root (crontab(1)).',
    how: 'Un nume de utilizator pe linie, fără spații. Restricția privește folosirea comenzii crontab, nu oprește un crontab existent. La at: /etc/at.allow și /etc/at.deny (at.allow(5)).',
    where: 'Servere cu mai mulți utilizatori, unde doar anumite conturi au voie să programeze sarcini.',
    topics: ['L7.1'], aliases: ['cron.allow', 'cron.deny', 'at.allow', 'at.deny'],
  },
];
