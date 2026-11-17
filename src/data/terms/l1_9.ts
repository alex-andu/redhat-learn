import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'tar', abbr: 'tar', full: 'tape archive', ro: 'unealta care strânge mai multe fișiere într-o singură arhivă',
    what: 'Împachetează fișiere și directoare într-un singur fișier (.tar), păstrând structura, permisiunile și timpii. Prin el însuși nu micșorează nimic.',
    how: 'Un mod principal (-c creează, -x extrage, -t listează) plus -f NUME pentru fișierul arhivă; -z/-j adaugă compresie gzip/bzip2.',
    where: 'Copii de siguranță, transferul unor directoare, arhivarea logurilor.',
    topics: ['L1.9'], aliases: ['arhivă'],
  },
  {
    id: 'compression', abbr: 'compresie', ro: 'micșorarea dimensiunii datelor, fără pierdere de informație',
    what: 'Algoritmi (gzip, bzip2) care reprezintă aceleași date pe mai puțini octeți; decompresia le readuce identice.',
    how: 'Fiecare comprimă un singur flux/fișier; de aceea mai multe fișiere se arhivează mai întâi cu tar și apoi se comprimă (.tar.gz, .tar.bz2).',
    where: 'Economie de spațiu și de bandă; fișiere .gz/.bz2/.tar.gz.',
    topics: ['L1.9'], aliases: ['decompresie'],
  },
  {
    id: 'gzip', abbr: 'gzip', full: 'GNU zip', ro: 'compresor rapid, produce fișiere .gz',
    what: 'Comprimă un fișier și îl înlocuiește cu fișier.gz (cu -k păstrezi originalul). gunzip sau gzip -d decomprimă.',
    how: 'Nivel 1 (rapid) – 9 (mai mic, mai lent), implicit 6. Nu arhivează directoare: se folosește împreună cu tar.',
    where: 'tar -czf arhiva.tar.gz, loguri rotite (.gz), zcat pentru a citi fără a decomprima.',
    topics: ['L1.9'], aliases: ['gunzip'],
  },
  {
    id: 'bzip2', abbr: 'bzip2', ro: 'compresor care, de regulă, comprimă mai bine dar mai lent decât gzip; fișiere .bz2',
    what: 'Comprimă un fișier în fișier.bz2; bunzip2 sau bzip2 -d decomprimă.',
    how: 'Opțiuni similare cu gzip: -k păstrează originalul, -d decomprimă, -t testează.',
    where: 'tar -cjf arhiva.tar.bz2; bzcat pentru citire directă.',
    topics: ['L1.9'], aliases: ['bunzip2'],
  },
  {
    id: 'tarball', abbr: 'tarball', ro: 'arhivă tar (eventual comprimată): .tar, .tar.gz, .tgz, .tar.bz2',
    what: 'Denumirea uzuală a unui fișier creat cu tar. Extensia indică compresia, dar sistemul nu o impune: comanda trebuie să se potrivească cu conținutul.',
    how: 'file arhiva.tar.gz arată tipul real; tar -tf listează conținutul fără a extrage.',
    where: 'Distribuirea codului sursă, backup-uri, transferuri.',
    topics: ['L1.9'],
  },
];
