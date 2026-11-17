import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'rpm', abbr: 'RPM', full: 'RPM Package Manager', ro: 'format de pachet și baza de date a pachetelor instalate',
    what: 'Un fișier .rpm care conține fișierele unui program și informații despre el (nume, versiune, dependențe, semnătură). RPM este și numele comenzii de nivel jos care lucrează cu astfel de pachete.',
    how: 'Comanda rpm instalează/șterge/interoghează pachete și ține evidența a ce este instalat într-o bază de date locală. Nu rezolvă singură dependențele de pachete; asta face dnf.',
    where: 'rpm -qa, rpm -qi, rpm -ql, rpm -qf, rpm --import; dnf instalează fișiere .rpm din repository-uri.',
    topics: ['L2.1', 'L2.2'],
  },
  {
    id: 'dnf', abbr: 'dnf', full: 'Dandified YUM', ro: 'managerul de pachete al RHEL',
    what: 'Instrumentul pe care îl folosești pentru a căuta, instala, actualiza și șterge pachete, cu rezolvarea automată a dependențelor.',
    how: 'Citește repository-urile din /etc/yum.repos.d/*.repo, descarcă metadata în cache, alege versiunile compatibile și apelează rpm la instalare.',
    where: 'dnf install, dnf remove, dnf upgrade, dnf search, dnf repolist, dnf history.',
    topics: ['L2.1', 'L2.2', 'L2.3'], aliases: ['yum'],
  },
  {
    id: 'repository', abbr: 'repository', ro: 'depozit de pachete cu index',
    what: 'Un loc (URL sau director) cu fișiere .rpm și un director repodata/ care le descrie.',
    how: 'dnf descarcă indexul (repomd.xml) și caută în el pachetele cerute. Fiecare repository are un ID și este definit într-un fișier .repo.',
    where: 'BaseOS și AppStream (Red Hat), repository local dintr-un ISO montat, un server intern.',
    topics: ['L2.1', 'L2.3'], aliases: ['repo'],
  },
  {
    id: 'cdn', abbr: 'CDN', full: 'Content Delivery Network', ro: 'rețeaua de distribuție a conținutului Red Hat',
    what: 'Serverele de pe care sistemele înregistrate descarcă pachetele și actualizările oficiale RHEL.',
    how: 'Accesul se bazează pe înregistrarea sistemului (subscription-manager) și pe certificate; repository-urile apar în /etc/yum.repos.d/redhat.repo.',
    where: 'Instalarea și actualizarea pachetelor pe un sistem RHEL înregistrat (L2.3).',
    topics: ['L2.1', 'L2.3'],
  },
  {
    id: 'gpg-signature', abbr: 'semnătură GPG', ro: 'semnătură digitală a unui pachet',
    what: 'Dovada criptografică că pachetul vine de la editorul cheii și nu a fost modificat.',
    how: 'Cheia publică (gpgkey=) este importată cu rpm --import; la instalare, dnf/rpm verifică semnătura dacă gpgcheck=1.',
    where: 'Linia gpgcheck=1 din .repo; eroarea „GPG check FAILED”.',
    topics: ['L2.1', 'L2.2'],
  },
  {
    id: 'repodata', abbr: 'repodata', ro: 'directorul de metadata al unui repository',
    what: 'Directorul repodata/ cu repomd.xml și listele de pachete, dependențe și fișiere.',
    how: 'Se creează cu createrepo_c; dnf îl descarcă și îl ține în cache sub /var/cache/dnf/.',
    where: 'Repository local propriu; eroarea „Cannot download repomd.xml”.',
    topics: ['L2.1'],
  },
];
