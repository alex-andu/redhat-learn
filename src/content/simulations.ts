import type { Simulation } from '../lab/types';

/** Simulări de examen. Scorul automat (întrebări) și autoevaluarea (task-uri practice) se afișează separat (D-010).
 *  Durata este ESTIMATĂ de noi: Red Hat nu publică o durată pe pagina sursă a EX200. */
export const SIMULATIONS: Simulation[] = [
  {
    id: 'sim-c1-pilot',
    title: 'Simulare C1 (pilot): unelte esențiale',
    estimatedMinutes: 100,
    description:
      'Trei task-uri practice independente (shell, fișiere și directoare, redirecționare) pe care le faci pe propriul sistem Linux, plus nouă întrebări cu răspuns în platformă (găsește greșeala, interpretează output-ul, completează comanda). Fără indicii sau soluții până termini. Nu sunt întrebări reale de examen.',
    autoQuestionIds: ['L1.1-007', 'L1.1-008', 'L1.2-006', 'L1.2-007', 'L1.3-007', 'L1.3-008', 'L1.5-004', 'L1.5-007', 'L1.5-009'],
    tasks: [
      { labId: 'lab-l1-1-prima-sesiune' },
      { labId: 'lab-l1-3-structura-proiect' },
      { labId: 'lab-l1-5-redirectionare-pipe' },
    ],
  },
];
