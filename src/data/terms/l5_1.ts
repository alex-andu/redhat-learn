import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'block-device', abbr: 'block device', ro: 'dispozitiv de stocare accesat în blocuri: disc, partiție, volum logic',
    what: 'Un fișier special din /dev (de exemplu /dev/vdb sau /dev/sda) prin care kernelul oferă acces la un disc sau la o parte din el. Scrii în el „blocuri” de date, nu caractere una câte una.',
    how: 'Kernelul creează automat câte un fișier pentru fiecare disc și fiecare partiție detectată. Numele depinde de tipul controlerului: sdX (SCSI/SATA/USB), vdX (disc virtio în VM), nvmeXnY (NVMe).',
    where: 'Comenzi precum lsblk, fdisk, parted, mkfs și mount primesc ca argument un block device. Alegerea greșită a dispozitivului șterge date.',
    topics: ['L5.1'], aliases: ['disc', '/dev/sda', '/dev/vda', 'lsblk'],
  },
  {
    id: 'partition', abbr: 'partiție', ro: 'o felie dintr-un disc, cu început și sfârșit definite într-o tabelă de partiții',
    what: 'Împarte un disc fizic în zone separate. Fiecare partiție apare ca propriul block device (vdb1, vdb2…) și poate primi un sistem de fișiere, swap sau poate deveni volum fizic LVM.',
    how: 'Începutul, sfârșitul și tipul fiecărei partiții sunt scrise în tabela de partiții de la începutul discului. Kernelul citește tabela și creează dispozitivele corespunzătoare.',
    where: 'Pregătirea unui disc nou înainte de mkfs, mkswap sau pvcreate.',
    topics: ['L5.1'], aliases: ['partitie', 'partitioning'],
  },
  {
    id: 'gpt', abbr: 'GPT', full: 'GUID Partition Table', ro: 'formatul modern de tabelă de partiții',
    what: 'Tabelă de partiții care suportă discuri foarte mari (peste 2 TiB) și până la 128 de partiții implicit, fără trucul cu partiții „extinse” din MBR.',
    how: 'Păstrează o copie a tabelei la începutul și alta la sfârșitul discului (protecție la corupere); fiecare partiție are un GUID unic și un tip identificat tot printr-un GUID.',
    where: 'Examenul EX200 cere explicit lucrul cu discuri GPT: listare, creare și ștergere de partiții.',
    std: 'UEFI', topics: ['L5.1'], aliases: ['GUID Partition Table'],
  },
  {
    id: 'mbr', abbr: 'MBR', full: 'Master Boot Record', ro: 'formatul vechi de tabelă de partiții (DOS)',
    what: 'Tabelă de partiții moștenită, limitată la 4 partiții primare și discuri de maximum 2 TiB. Apare în output ca „Disklabel type: dos”.',
    how: 'Tabela ocupă 64 de octeți în primul sector al discului; pentru mai mult de 4 partiții se folosea o partiție extinsă cu partiții logice.',
    where: 'Întâlnit pe sisteme vechi. Nu face parte din obiectivul oficial (acesta vorbește doar de GPT).',
    topics: ['L5.1'], aliases: ['dos', 'msdos'],
  },
  {
    id: 'parted', abbr: 'parted', ro: 'utilitar de partiționare care aplică modificările imediat',
    what: 'Creează, listează și șterge partiții pe discuri GPT sau MBR. Poate funcționa interactiv sau cu comenzi date direct în linia de comandă.',
    how: 'Spre deosebire de fdisk, nu are pas final „write”: fiecare comandă (mklabel, mkpart, rm) scrie imediat pe disc.',
    where: 'Scripturi și sarcini rapide de examen: parted /dev/vdb mklabel gpt, apoi mkpart.',
    topics: ['L5.1'], aliases: ['parted(8)'],
  },
  {
    id: 'fdisk', abbr: 'fdisk', ro: 'utilitar interactiv de partiționare, cu scriere la final (w)',
    what: 'Listează partiții (fdisk -l) și le editează interactiv. Suportă și GPT în versiunile moderne.',
    how: 'Modificările se păstrează în memorie până la comanda w (write). Dacă ieși cu q, nimic nu a fost scris pe disc.',
    where: 'Alternativa preferată de mulți administratori pentru că poți renunța înainte de scriere.',
    topics: ['L5.1'], aliases: ['fdisk -l'],
  },
  {
    id: 'sector-alignment', abbr: 'alinierea partițiilor', ro: 'începutul partiției la un multiplu al unității fizice a discului',
    what: 'O partiție aliniată începe la un sector multiplu (de obicei 1 MiB = sectorul 2048), ceea ce evită scrieri suplimentare pe discuri moderne.',
    how: 'fdisk și parted moderne aliniază automat la 1 MiB când accepți valorile implicite pentru început.',
    where: 'Dacă dai pozițiile de mână, riști partiții nealiniate și performanță scăzută; pentru examen acceptă valorile implicite.',
    topics: ['L5.1'], aliases: ['alignment'],
  },
  {
    id: 'partprobe', abbr: 'partprobe', ro: 'cere kernelului să recitească tabela de partiții',
    what: 'După modificarea unui disc, kernelul poate să nu vadă imediat noile partiții. partprobe îl obligă să recitească tabela.',
    how: 'Apelează ioctl-ul de re-citire a tabelei de partiții pentru discul indicat (sau pentru toate).',
    where: 'Imediat după fdisk/parted, dacă lsblk nu arată noua partiție. Nu funcționează dacă o partiție a discului este montată sau folosită.',
    topics: ['L5.1'], aliases: ['udevadm settle'],
  },
];
