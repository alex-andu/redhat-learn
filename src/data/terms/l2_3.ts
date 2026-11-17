import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'subscription-manager', abbr: 'subscription-manager', ro: 'unealta de înregistrare și abonamente Red Hat',
    what: 'Înregistrează sistemul la Red Hat și gestionează abonamentele și repository-urile oficiale.',
    how: 'Primește certificate de identitate și de acces și generează /etc/yum.repos.d/redhat.repo; dnf le folosește pentru a accesa CDN-ul.',
    where: 'subscription-manager register / status / repos --list / unregister.',
    topics: ['L2.1', 'L2.3'],
  },
  {
    id: 'installonly', abbr: 'installonly', ro: 'pachet care se instalează lângă versiunea veche, nu o înlocuiește',
    what: 'Pachete precum kernelul au mai multe versiuni instalate simultan.',
    how: 'Numărul de versiuni păstrate este dat de installonly_limit din /etc/dnf/dnf.conf; cea mai nouă pornește implicit la boot.',
    where: 'rpm -q kernel arată mai multe versiuni; uname -r arată pe cea în execuție.',
    topics: ['L2.3'],
  },
  {
    id: 'check-update', abbr: 'check-update', ro: 'verificarea actualizărilor fără aplicare',
    what: 'dnf check-update listează pachetele cu versiuni mai noi și nu modifică sistemul.',
    how: 'Codul de ieșire: 100 = există actualizări, 0 = nu există, 1 = eroare.',
    where: 'Planificarea mentenanței, scripturi.',
    topics: ['L2.3'],
  },
];
