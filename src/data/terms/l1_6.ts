import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'grep', abbr: 'grep', full: 'global regular expression print', ro: 'comanda care afișează liniile ce se potrivesc cu un tipar',
    what: 'Citește text (fișiere sau stdin) și afișează liniile care conțin un tipar. Cu opțiuni, poate număra, inversa selecția, căuta recursiv sau afișa doar partea potrivită.',
    how: 'Parcurge intrarea linie cu linie și testează fiecare linie față de expresia regulată. Exit status: 0 = a găsit ceva, 1 = nu a găsit, 2 = eroare.',
    where: 'Filtrarea logurilor și a fișierelor de configurare, ca filtru într-un pipe: ... | grep tipar.',
    topics: ['L1.6'],
  },
  {
    id: 'regex', abbr: 'regex', full: 'regular expression', ro: 'expresie regulată: limbaj pentru descrierea unui tipar de text',
    what: 'Un șir cu caractere obișnuite și caractere speciale (., *, ^, $, [ ]) care descrie ce text vrei să găsești, nu doar un text exact.',
    how: 'Fiecare caracter special are un rol: . = orice caracter, * = zero sau mai multe repetări ale elementului precedent, ^ și $ = început/sfârșit de linie, [ ] = o mulțime de caractere.',
    where: 'grep, sed, awk, vim (/ și :s), find -regex.',
    topics: ['L1.6'], aliases: ['expresie regulată', 'regexp'],
  },
  {
    id: 'bre-ere', abbr: 'BRE / ERE', full: 'basic / extended regular expressions', ro: 'cele două dialecte POSIX de expresii regulate',
    what: 'În BRE (implicit în grep) caracterele ? + | ( ) { } sunt literale; ca să fie speciale se prefixează cu \\ (extensii GNU). În ERE (grep -E) sunt speciale direct.',
    how: 'grep -E activează ERE. grep -F dezactivează interpretarea: tiparul este un șir fix.',
    where: 'grep -E "ssh|http" este mai ușor de citit decât grep "ssh\\|http".',
    topics: ['L1.6'], aliases: ['ERE', 'BRE'],
  },
  {
    id: 'anchor', abbr: 'ancoră', ro: 'metacaracter care fixează poziția în linie (^, $)',
    what: '^ potrivește începutul liniei, $ sfârșitul. Nu consumă caractere; doar impun poziția.',
    how: 'grep "^root" = liniile care ÎNCEP cu root; grep "bash$" = liniile care se TERMINĂ cu bash; grep "^$" = liniile goale.',
    where: 'Filtrarea câmpurilor la început de linie în /etc/passwd, ignorarea comentariilor (grep -v "^#").',
    topics: ['L1.6'],
  },
  {
    id: 'char-class', abbr: 'clasă de caractere', ro: 'mulțime de caractere între [ ]',
    what: '[abc] = unul dintre a, b, c; [^abc] = oricare în afară de ele; [0-9] = interval; [[:digit:]] = clasă POSIX (cifre).',
    how: 'Clasele POSIX ([:alpha:], [:digit:], [:space:], [:upper:], [:lower:], [:alnum:], [:punct:]) se scriu în interiorul parantezelor drepte, deci cu paranteze duble: [[:digit:]].',
    where: 'Potrivirea unui număr, a unei litere mari, a spațiilor, independent de locale.',
    topics: ['L1.6'],
  },
  {
    id: 'metacharacter', abbr: 'metacaracter', ro: 'caracter cu sens special într-o expresie regulată',
    what: 'Caractere precum . * ^ $ [ ] \\ nu se potrivesc cu ele însele, ci au un rol (orice caracter, repetare, ancoră etc.). Pentru a le căuta literal se „scapă” cu \\ (de exemplu \\.).',
    how: 'Shell-ul are propriile caractere speciale (*, ?, $, |). De aceea tiparul grep se pune între apostrofuri: grep \'a.*b\' fișier.',
    where: 'Căutarea unui punct literal într-un nume: grep "10\\.0\\.0\\.1".',
    topics: ['L1.6'],
  },
];
