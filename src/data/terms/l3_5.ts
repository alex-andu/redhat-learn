import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'command-substitution', abbr: '$( )', ro: 'înlocuirea unei comenzi cu output-ul ei',
    what: 'x=$(comandă) pune în x ce afișează comanda pe stdout, fără newline-urile finale.',
    how: 'Bash rulează comanda într-un proces copil și captează stdout; stderr nu este captat. Fără ghilimele, rezultatul suferă word splitting și globbing. Forma cu backticks este învechită.',
    where: 'Nume de fișiere cu dată ($(date +%F)), numărarea utilizatorilor, comparații cu valori din sistem.',
    topics: ['L3.5'],
  },
];
