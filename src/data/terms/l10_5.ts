import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'restorecon', abbr: 'restorecon', ro: 'comanda care readuce eticheta unui fișier la cea implicită din politică',
    what: 'Aplică contextul implicit (tipul) pe unul sau mai multe fișiere. Opțiuni: -v (afișează), -R (recursiv), -n (simulare), -F (reset complet), -e (exclude).',
    how: 'Citește regulile cale → context din politică (inclusiv cele locale adăugate cu semanage fcontext). Fără -F/-U schimbă doar tipul; lipsa de output la -v înseamnă că nimic nu era de schimbat.',
    where: 'După mv, restore din backup, rsync, director nou cu regulă fcontext; repararea cheilor ~/.ssh.',
    std: 'restorecon(8)', topics: ['L10.5', 'L10.2', 'L10.8'], aliases: ['setfiles', 'relabel'],
  },
  {
    id: 'semanage', abbr: 'semanage', ro: 'utilitarul care administrează politica SELinux locală: fcontext, port, boolean și altele',
    what: 'Subcomenzi folosite în EX200: semanage fcontext (etichete de fișiere), semanage port (etichete de porturi), semanage boolean. Opțiuni comune: -a (add), -m (modify), -d (delete), -l (list), -C (doar local), -D (șterge toate locale).',
    how: 'Scrie în politica locală (persistă la reboot și la relabel). Regulile se aplică pe fișiere cu restorecon; porturile și boolean-urile au efect imediat.',
    where: 'Director personalizat pentru un serviciu; port nestandard; comutatoare ale politicii. Pachet: policycoreutils-python-utils.',
    std: 'semanage(8)', topics: ['L10.5', 'L10.6', 'L10.7'], aliases: ['semanage fcontext', 'semanage port', 'semanage boolean', 'fcontext'],
  },
  {
    id: 'chcon', abbr: 'chcon', ro: 'schimbă direct eticheta unui fișier, fără a modifica politica (nedurabil)',
    what: 'chcon -t TIP FIȘIER (și -R, --reference). Rezultatul dispare la restorecon sau relabel, deoarece politica nu cunoaște modificarea.',
    how: 'Scrie atributul extins security.selinux direct. Util pentru un test rapid; pentru soluții persistente se folosește semanage fcontext + restorecon.',
    where: 'Test temporar; nu este soluția la examen dacă se cere persistență.',
    std: 'chcon(1)', topics: ['L10.5'], aliases: [],
  },
];
