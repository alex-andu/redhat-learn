import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'text-editor', abbr: 'editor de text', ro: 'program pentru crearea și modificarea fișierelor text',
    what: 'Un program care deschide un fișier text, îți arată conținutul și îți permite să-l modifici și să-l salvezi. În terminal se folosesc editoare în mod text: vi/vim și nano.',
    how: 'Încarcă fișierul într-o zonă de memorie (buffer); modificările rămân în buffer până le salvezi explicit pe disc.',
    where: 'Configurări în /etc, scripturi, fișiere de test; programe precum crontab -e sau visudo pornesc editorul tău.',
    topics: ['L1.4'],
  },
  {
    id: 'vim', abbr: 'vi / vim', full: 'Vi IMproved', ro: 'editor de text modal, standard pe sistemele Linux',
    what: 'Editorul de text modal prezent aproape peste tot. Comanda vi pornește, pe RHEL, o variantă vim (vim-minimal); pachetul vim-enhanced adaugă funcții în plus.',
    how: 'Are moduri: Normal (taste = comenzi), Insert (tastele scriu text), Visual (selecție) și Command-line (după :). Esc te readuce în modul Normal.',
    where: 'Editarea configurărilor pe orice server, inclusiv când nu există mediu grafic.',
    topics: ['L1.4'], aliases: ['vi'],
  },
  {
    id: 'vim-modes', abbr: 'moduri vim', ro: 'modurile de lucru ale lui vim',
    what: 'Aceleași taste fac lucruri diferite în funcție de modul în care se află editorul.',
    how: 'Normal: i, a, o intră în Insert; dd șterge o linie; : deschide linia de comandă. Insert: tastele scriu text; Esc revine în Normal.',
    where: 'Cea mai frecventă confuzie a începătorilor: tastezi comenzi în Insert (apar ca text) sau text în Normal (se execută ca comenzi).',
    topics: ['L1.4'],
  },
  {
    id: 'nano', abbr: 'nano', ro: 'editor de text simplu, cu scurtături afișate pe ecran',
    what: 'Editor în terminal fără moduri: tastezi direct text; scurtăturile (Ctrl+O salvează, Ctrl+X iese) sunt afișate jos.',
    how: 'Simbolul ^ din bara de jos înseamnă tasta Ctrl; M- înseamnă Alt.',
    where: 'Alternativă mai ușoară la vim pentru modificări rapide.',
    topics: ['L1.4'],
  },
  {
    id: 'swap-file-vim', abbr: 'fișier swap vim', ro: 'fișier temporar .nume.swp creat de vim',
    what: 'Fișier ascuns pe care vim îl creează lângă fișierul deschis (ex. .config.swp) ca să poată recupera modificările la o închidere neașteptată și să semnaleze că fișierul e deja deschis.',
    how: 'Se șterge automat la ieșirea normală. Dacă vim pornește cu mesajul „Swap file ... already exists!”, fie fișierul e deschis în alt terminal, fie sesiunea anterioară s-a încheiat anormal.',
    where: 'Mesajul apare la deschiderea unui fișier folosit în paralel; înainte de a șterge .swp, verifică dacă nu e în uz.',
    topics: ['L1.4'],
  },
];
