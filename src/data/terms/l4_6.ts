import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'tuned', abbr: 'tuned', ro: 'serviciul care aplică profiluri de reglaj pentru performanță sau consum',
    what: 'Un daemon care, în funcție de profilul ales, schimbă automat parametri ai kernelului și ai dispozitivelor (planificator, disk, putere CPU, rețea). Se controlează cu tuned-adm.',
    how: 'Citește fișierul tuned.conf al profilului activ (din /usr/lib/tuned sau /etc/tuned) și aplică setările la pornire și la schimbarea profilului. Profilul activ este reținut în /etc/tuned/active_profile.',
    where: 'Servere de baze de date, mașini virtuale, stații cu consum redus de energie.',
    topics: ['L4.6'], aliases: ['tuned-adm', 'TuneD'],
  },
  {
    id: 'tuned-profile', abbr: 'profil tuned', ro: 'un set denumit de reglaje (de ex. throughput-performance, powersave)',
    what: 'Un director cu un fișier tuned.conf care descrie ce reglaje se aplică. Poți alege un profil existent sau crea unul propriu în /etc/tuned/.',
    how: 'tuned-adm profile NUME activează profilul; tuned-adm list le arată pe cele disponibile; tuned-adm recommend sugerează unul potrivit mediului. Profilurile pot moșteni unul de la altul (include=).',
    where: 'Alegerea între performanță maximă, latență mică sau economie de energie fără reglaj manual.',
    topics: ['L4.6'], aliases: ['profil'],
  },
];
