import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'nice-value', abbr: 'nice (NI)', ro: 'valoarea care arată cât de „amabil” e un proces cu ceilalți: nice mare = prioritate mică',
    what: 'Un număr între -20 (prioritate maximă) și 19 (prioritate minimă). Implicit, comenzile pornesc cu 0. Un proces „foarte amabil” (19) cedează CPU celorlalte.',
    how: 'Planificatorul kernelului împarte timpul procesorului între procesele care îl cer, în funcție de nice. Se stabilește la pornire (nice -n) sau ulterior (renice -n -p). Procesul copil moștenește valoarea părintelui.',
    where: 'Rularea de copii de siguranță sau arhivări „în fundal” fără a încetini serverul; micșorarea impactului unui proces consumator.',
    topics: ['L4.5'], aliases: ['nice', 'renice', 'prioritate'],
  },
  {
    id: 'scheduler', abbr: 'planificator (scheduler)', ro: 'partea din kernel care decide ce proces rulează pe CPU și pentru cât timp',
    what: 'Hotărăște la fiecare câteva milisecunde ce proces primește nucleul procesorului. Procesele aflate în așteptare sunt ordonate după politică și prioritate.',
    how: 'Politica obișnuită (SCHED_OTHER) folosește valoarea nice ca pondere. Politicile de timp real (SCHED_FIFO, SCHED_RR) se gestionează cu chrt și nu intră în această lecție.',
    where: 'Reglajul sistemelor aglomerate; profilurile tuned (L4.6) pot influența comportamentul planificatorului.',
    topics: ['L4.5', 'L4.6'], aliases: ['planificare'],
  },
];
