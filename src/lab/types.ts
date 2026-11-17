// Modelul de conținut al laboratoarelor (LAB_SPEC). Laboratoarele sunt CONȚINUT EDUCAȚIONAL:
// platforma nu execută comenzi, nu se conectează la niciun sistem și nu verifică nicio stare reală (D-007).
import type { OutputLabel } from '../lib/types';

export type Criterion = {
  id: string;
  /** ce trebuie să fie adevărat la final (formulat ca stare observabilă) */
  text: string;
  /** comanda pe care o rulează MANUAL cel care învață, pe propriul sistem Linux */
  manualCheck: string;
};

export type LabStepData = {
  title: string;
  /** de ce facem acest pas */
  purpose: string;
  /** comenzile complete (blocul de cod) */
  commands: string;
  /** explicația comenzilor și a fiecărei opțiuni folosite: [fragment, explicație] */
  explain: [string, string][];
  /** indiciu afișat doar în modul Guided, înainte de pas */
  hint?: string;
  /** întrebare de reflecție, doar în modul Guided */
  reflect?: string;
  /** output reprezentativ, cu etichetă obligatorie */
  output?: { code: string; label: OutputLabel; explain: string };
};

export type Lab = {
  id: string;                       // ex. "lab-l1-1-prima-sesiune"
  lessonId: string;                 // ex. "L1.1"
  title: string;
  modes: ('guided' | 'independent')[];
  objectives: string[];             // ID-uri interne, ex. "C1-1"
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  /** scenariul, în stil de administrare/examen */
  scenario: string[];
  initialConditions: string[];      // descrise, nu create de platformă
  finalState: string[];
  criteria: Criterion[];
  steps: LabStepData[];
  verification: { cmd: string; expected: string }[];
  persistence: string[];
  mistakes: string[];
  troubleshooting: { symptom: string; cause: string; fix: string }[];
  alternatives: string[];
};

/** Un task dintr-o simulare: practic (autoevaluat) — scenariu + criterii + soluție, ca într-un laborator. */
export type SimulationTask = { labId: string };

export type Simulation = {
  id: string;
  title: string;
  /** durata e ESTIMATĂ de noi; Red Hat nu publică durata oficială pe pagina sursă */
  estimatedMinutes: number;
  description: string;
  /** întrebări cu răspuns în platformă → scor AUTOMAT (ID-uri din banca de întrebări) */
  autoQuestionIds: string[];
  /** task-uri practice → AUTOEVALUARE declarată */
  tasks: SimulationTask[];
};
