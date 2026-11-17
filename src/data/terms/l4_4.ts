import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'process', abbr: 'proces', ro: 'un program aflat în execuție',
    what: 'Fiecare comandă pornită devine un proces: are un număr unic (PID), un proprietar, un părinte, memorie și prioritate. Un program pe disc este doar un fișier; procesul este programul „în viață”.',
    how: 'Kernelul creează procesele cu fork și exec; fiecare proces are un părinte (PPID), cu excepția lui systemd (PID 1). Starea lui (R, S, D, T, Z) apare în coloana STAT din ps.',
    where: 'Diagnosticarea unui sistem lent, oprirea unui program blocat.',
    topics: ['L4.4', 'L4.5'], aliases: ['procese', 'PID'],
  },
  {
    id: 'signal', abbr: 'semnal', ro: 'mesaj trimis unui proces',
    what: 'O notificare scurtă trimisă de kernel sau de un utilizator unui proces: „oprește-te” (SIGTERM, 15), „oprește-te acum, fără discuții” (SIGKILL, 9), „reîncarcă configurația” (SIGHUP, 1), „pauză”/„continuă” (SIGSTOP/SIGCONT).',
    how: 'kill trimite un semnal unui PID. Procesul poate intercepta SIGTERM și curăța ce a deschis; SIGKILL și SIGSTOP nu pot fi interceptate, deci kernelul le aplică direct.',
    where: 'kill, pkill, killall, tastele Ctrl+C (SIGINT) și Ctrl+Z din terminal.',
    topics: ['L4.4'], aliases: ['SIGTERM', 'SIGKILL', 'SIGHUP'],
  },
  {
    id: 'zombie-process', abbr: 'zombie (Z)', ro: 'proces terminat al cărui părinte nu i-a citit încă starea',
    what: 'Apare în ps cu STAT=Z (sau <defunct>). Nu consumă CPU și nu are memorie utilă, doar o intrare în tabela de procese.',
    how: 'Dispare când părintele apelează wait sau când părintele se termină (atunci îl preia systemd). kill -9 nu are ce ucide; se acționează asupra părintelui.',
    where: 'Câțiva zombie sunt inofensivi; mulți arată un program părinte defect.',
    topics: ['L4.4'], aliases: ['zombie'],
  },
  {
    id: 'load-average', abbr: 'load average', ro: 'numărul mediu de procese care așteaptă CPU sau I/O',
    what: 'Trei valori (medii pe 1, 5 și 15 minute) afișate de uptime, top și w. Compară-le cu numărul de nuclee CPU: o valoare mult peste numărul de nuclee înseamnă sistem aglomerat.',
    how: 'Kernelul numără procesele în stare R (gata de rulare) și D (așteaptă I/O) și calculează o medie mobilă.',
    where: 'Primul indicator când un server „e lent”; urmat de top și ps pentru a găsi cine consumă.',
    topics: ['L4.4'],
  },
];
